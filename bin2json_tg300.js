import {splitArrayByN, removePrivateProp, addNamesFromRefs, verifyData, isValidRange, makeValue2ByteBE} from './bin2json_common.js';

export function binToJsonForTG300(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		waves: null,
		tones: null,
	};

	// Waves
	json.waves = makeWaves(allBytes, memMap);

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(allBytes.slice(...memMap.tones));

	// Drum Sets
	json.drumSets = makeDrumSets(allBytes, memMap);

	// Tone Map
	const tableToneMap = makeTableOfToneMap(allBytes, memMap, json);
	for (const kind of ['GM_A', 'GM_B']) {
		if (memMap[`tableTones${kind}`]) {
			json[`toneMaps${kind}`] = makeToneMaps(tableToneMap, kind);
		}
	}

	// Drum Map
	for (const kind of ['GM_A', 'GM_B']) {
		const key = `tableDrums${kind}`;
		if (memMap[key]) {
			console.assert(isValidRange(memMap[key]));
			json[`drumMaps${kind}`] = makeDrumMaps(allBytes.slice(...memMap[key]), json, kind);
		}
	}

	removePrivateProp(json);
	addNamesFromRefs(json);

	return json;
}

function makeWaves(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	console.assert(isValidRange(memMap.waves));
	const wavesPackets = splitArrayByN(allBytes.slice(...memMap.waves), 12);

	console.assert(isValidRange(memMap.tableWaveAddrs));
	const tableWaveAddrs = splitArrayByN(allBytes.slice(...memMap.tableWaveAddrs), 2).map((e) => makeValue2ByteBE(e));
	const tableWaves = tableWaveAddrs.map((addr) => (addr - tableWaveAddrs[0]) / 12);
	console.assert(tableWaves.every((e) => Number.isInteger(e)));

	console.assert(isValidRange(memMap.waveNames));
	const waveNames = splitArrayByN(allBytes.slice(...memMap.waveNames), 8).map((e) => String.fromCharCode(...e));
	verifyData(waveNames.every((e) => /^[\x20-\x7f]*$/u.test(e)));

	const waves = [];
	tableWaves.forEach((indexBegin, waveNo) => {
		verifyData(indexBegin < wavesPackets.length);
		const indexEnd = tableWaves[waveNo + 1] ?? wavesPackets.length;

		const sampleSlots = wavesPackets.slice(indexBegin, indexEnd).map((waveBytes) => {
			const sampleSlot = {
				bytes: [...waveBytes],
				low:  waveBytes[10],
				high: (waveBytes[11] < 128) ? waveBytes[11] : 127,
			};
			verifyData(0 <= sampleSlot.low  && sampleSlot.low  < 128);
			verifyData(0 <= sampleSlot.high && sampleSlot.high < 128);
			verifyData(sampleSlot.low <= sampleSlot.high);
			return sampleSlot;
		});

		const wave = {
			waveNo,
			name: waveNames[waveNo],
			sampleSlots,
		};
		waves.push(wave);
	});

	return waves;
}

function makeTones(bytes) {
	console.assert(bytes?.length);

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const numVoices = bytes[index + 0x05] + 1;
		verifyData(numVoices === 1 || numVoices === 2);
		const size = 16 + 80 * numVoices;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 16);
		verifyData(commonBytes[15] === 0x00);

		const voices = [];
		const voicePackets = splitArrayByN(toneBytes.slice(16), 80);
		voicePackets.forEach((voiceBytes) => {
			const waveNo = (voiceBytes[0] << 7) | voiceBytes[1];
			const voice = {
				bytes: [...voiceBytes],
				waveNo,
				waveRef: {
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(7, 15)),
			commonBytes: [...commonBytes],
			voices,
			_offset: index,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeDrumSets(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	console.assert(isValidRange(memMap.drumParams));
	const drumParamPackets = splitArrayByN(allBytes.slice(...memMap.drumParams), 28);

	console.assert(isValidRange(memMap.tableDrumNoteAddrs));
	const tableDrumNoteAddrs = splitArrayByN(allBytes.slice(...memMap.tableDrumNoteAddrs), 256).map((bytes) => splitArrayByN(bytes, 2).map((e) => makeValue2ByteBE(e)));
	const drumParamIndices = tableDrumNoteAddrs.map((addrs) => addrs.map((addr) => (addr !== 0x0000) ? (addr - 0x3078) / 28 : -1));

	console.assert(isValidRange(memMap.drumSetNames));
	const drumSetNames = splitArrayByN(allBytes.slice(...memMap.drumSetNames), 8).map((e) => String.fromCharCode(...e));
	console.assert(drumSetNames.length === drumParamIndices.length);

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumSetNames.length; drumSetNo++) {
		const drumNoteParams = drumParamIndices[drumSetNo].map((index) => (index >= 0) ? drumParamPackets[index] : null);

		const notes = {};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			if (!drumNoteParams[noteNo]) {
				continue;
			}
			const note = {
				bytes: [...drumNoteParams[noteNo]],
				_index: drumParamIndices[drumSetNo][noteNo],
			};
			verifyData(note.bytes[7] === 0x00 && note.bytes[15] === 0x00);
			notes[noteNo] = note;
		}

		const drumSet = {
			drumSetNo,
			name: drumSetNames[drumSetNo],
			notes,
		};
		drumSets.push(drumSet);
	}

	// Add note names.
	console.assert(isValidRange(memMap.drumNoteNames));
	const drumNoteNamesPerDrumSet = splitArrayByN(allBytes.slice(...memMap.drumNoteNames), 16).map((e) => {
		const m = String.fromCharCode(...e).match(/([A-G])(#?)(-?\d+)\s*:(.*)/u);
		console.assert(m);
		return {
			noteNo:   24 + {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]] + ((m[2] === '#') ? 1 : 0) + 12 * Number(m[3]),
			noteName: m[4],
		};
	}).reduce((p, _, i, a) => {
		if (i % 62 === 0) {
			p.push(a.slice(i, i + 62));
		}
		return p;
	}, []);
	const drumNoteNamesPerParam = new Array(drumParamPackets.length).fill();
	drumSets.forEach((drumSet, drumSetNo) => {
		const drumNoteNames = drumNoteNamesPerDrumSet[drumSetNo];
		if (!drumNoteNames) {
			return;
		}
		Object.entries(drumSet.notes).forEach(([noteNoStr, note]) => {
			const noteNo = Number(noteNoStr);
			const noteName = drumNoteNames.find((e) => e.noteNo === noteNo)?.noteName;
			if (note._index >= 0 && noteName && !drumNoteNamesPerParam[note._index]) {
				drumNoteNamesPerParam[note._index] = noteName;
			}
		});
	});

	drumSets.forEach((drumSet) => {
		Object.values(drumSet.notes).forEach((note) => {
			const noteName = drumNoteNamesPerParam[note._index];
			if (noteName) {
				note.name = noteName;
			}
		});
	});

	return drumSets;
}

function makeToneMaps(tableToneMap, kind) {
	console.assert(tableToneMap);

	const toneMaps = [];
	if (kind === 'GM_A') {
		for (let prog = 0; prog < 128; prog++) {
			for (let bankL = 0; bankL < 128; bankL++) {
				const toneNo = tableToneMap(kind, prog, 0, bankL);
				if ((bankL > 0 && toneNo === tableToneMap(kind, prog, 0, 0))) {
					continue;
				}
				toneMaps.push(makeToneProg(kind, prog, 0, bankL));
			}
		}

	} else {
		for (let prog = 0; prog < 128; prog++) {
			for (let bankM = 0; bankM < 64; bankM++) {
				const toneNo = tableToneMap(kind, prog, bankM, 0);
				if ((bankM > 0 && toneNo === tableToneMap(kind, prog, 0, 0))) {
					continue;
				}
				toneMaps.push(makeToneProg(kind, prog, bankM, 0));
			}
		}
		for (const bankM of [80, 126, 127]) {
			for (let prog = 0; prog < 128; prog++) {
				toneMaps.push(makeToneProg(kind, prog, bankM, 0));
			}
		}
	}

	return toneMaps;

	function makeToneProg(kind, prog, bankM, bankL) {
		const toneNo = tableToneMap(kind, prog, bankM, bankL);
		return {
			bankM, bankL, prog,
			toneNo,
			toneRef: {
				$ref: `#/tones/${toneNo}`,
			},
		};
	}
}

function makeDrumMaps(tableDrums, json) {
	console.assert(tableDrums?.length && Array.isArray(json?.drumSets));

	const drumSetProgs = json.drumSets.map((drumSet) => tableDrums.indexOf(drumSet.drumSetNo));

	const drumMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		if (!drumSetProgs.includes(prog)) {
			continue;
		}
		const drumSetNo = tableDrums[prog];
		verifyData(0 <= drumSetNo && drumSetNo < json.drumSets.length);
		const drumProg = {
			prog,
			drumSetNo,
			drumSetRef: {
				$ref: `#/drumSets/${drumSetNo}`,
			},
		};
		drumMaps.push(drumProg);
	}

	return drumMaps;
}

function makeTableOfToneMap(allBytes, memMap, json) {
	console.assert(allBytes?.length && memMap && Array.isArray(json?.tones));

	const toneTables = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), 256).map((packet, i) => splitArrayByN(packet, 2).map((e) => {
		if (i === 0x10) {
			return 0;
		}
		const offset = makeValue2ByteBE(e);
		const tone = json.tones.filter((tone) => offset === tone._offset);
		verifyData(tone.length === 1);
		return tone[0].toneNo;
	}));

	const tables = Object.entries(memMap).filter(([key, _]) => key.startsWith('tableTones')).reduce((p, [key, value]) => {
		p[key] = allBytes.slice(...value);
		return p;
	}, {});

	return (kind, prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const tableBanks = tables[`tableTones${kind}`];
		console.assert(tableBanks);
		const index = (kind === 'GM_A') ? bankL : bankM;
		return toneTables[tableBanks[index]][prog];
	};
}
