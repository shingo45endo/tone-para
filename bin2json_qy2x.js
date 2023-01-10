import {splitArrayByN, addNamesFromRefs, isValidRange, verifyData, makeValue2ByteBE} from './bin2json_common.js';

export function binToJsonForQY2x(allBytes, memMap) {
	console.assert(allBytes.length && memMap);

	const json = {
		waves: null,
		drumWaves: null,
		tones: null,
		drumSets: null,
	};

	// Waves
	json.waves = makeWaves(allBytes, memMap);

	// Drum Waves
	console.assert(isValidRange(memMap.tableDrumWaves));
	json.drumWaves = makeDrumWaves(allBytes.slice(...memMap.tableDrumWaves));

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(allBytes.slice(...memMap.tones), json);

	// Drum Sets
	json.drumSets = makeDrumSets(allBytes, memMap, json);

	// Tone Map
	for (const kind of ['Normal', 'GM']) {
		if (memMap[`tableTones${kind}`]) {
			json[`toneMaps${kind}`] = makeToneMaps(allBytes, memMap, kind);
		}
	}

	// Drum Map
	json.drumMaps = makeDrumMaps(allBytes, memMap, json);

	// Adds names.
	addWaveNames(json);
	addDrumWaveNames(json);

	addNamesFromRefs(json);

	return json;
}

function makeWaves(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	console.assert(isValidRange(memMap.waves));
	const wavesPackets = splitArrayByN(allBytes.slice(...memMap.waves), 9);

	console.assert(isValidRange(memMap.tableWaves));
	const tableWaves = splitArrayByN(allBytes.slice(...memMap.tableWaves), 2).map((e) => makeValue2ByteBE(e));

	const waves = [];
	tableWaves.forEach((indexBegin, waveNo) => {
		verifyData(indexBegin < wavesPackets.length);
		const indexEnd = tableWaves[waveNo + 1] ?? wavesPackets.length;

		const sampleSlots = wavesPackets.slice(indexBegin, indexEnd).map((waveBytes) => {
			const sampleNo = makeValue2ByteBE(waveBytes.slice(0, 2));
			const sampleSlot = {
				bytes: [...waveBytes],
				low:  waveBytes[2],
				high: waveBytes[3],
				sampleNo,
//				sampleRef: {
//					$ref: `#/samples/${sampleNo}`,
//				},
			};
			return sampleSlot;
		});

		const wave = {
			waveNo,
			sampleSlots,
		};
		waves.push(wave);
	});

	return waves;
}

function makeDrumWaves(bytes) {
	console.assert(bytes?.length);

	const drumWaves = [];
	const drumWavePackets = splitArrayByN(bytes, 6);
	drumWavePackets.forEach((drumWaveBytes, drumWaveNo) => {
		const sampleNo = makeValue2ByteBE(drumWaveBytes.slice(0, 2));
		const drumWave = {
			drumWaveNo,
			bytes: [...drumWaveBytes],
			sampleNo,
//			sampleRef: {
//				$ref: `#/samples/${sampleNo}`,
//			},
		};
		drumWaves.push(drumWave);
	});

	return drumWaves;
}

function makeTones(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.waves));

	const tones = [];
	const tonePackets = splitArrayByN(bytes, 64);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 20);
		const numVoices = {0x00: 1, 0x01: 2}[commonBytes[0]];
		verifyData(numVoices === 1 || numVoices === 2);
		const voicePackets = splitArrayByN(toneBytes.slice(20, 64), 22);

		const voices = [];
		for (let i = 0; i < numVoices; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = ((voiceBytes[0] & 0x0f) << 4) | (voiceBytes[1] & 0x0f);
			const voice = {
				bytes: [...voiceBytes],
				level:  commonBytes[1 + i],
				pitch:  commonBytes[8 + i],
				detune: commonBytes[3 + i],
				pitchRateScaling:     commonBytes[6 + 4 * i],
				pitchRateScalingNote: commonBytes[7 + 4 * i],
				waveNo,
				waveRef: {
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		}

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(12, 20)).replace(/\t/ug, ' '),	// Some drum kit names of QY20 contain tabs.
			commonBytes: [...commonBytes],
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);
	});

	return tones;
}

function makeDrumSets(allBytes, memMap, json) {
	console.assert(allBytes?.length && memMap && Array.isArray(json?.drumWaves));

	console.assert(isValidRange(memMap.drumSetNames));
	const drumSetNameRegion = allBytes.slice(...memMap.drumSetNames).reduce((p, c) => {
		if (c !== 0x00) {
			p.push(c);
		}
		return p;
	}, []);
	const drumSetNames = splitArrayByN(drumSetNameRegion, 8).map((bytes) => String.fromCharCode(...bytes));
	verifyData(drumSetNames.every((e) => /^[\x20-\x7f]*$/u.test(e)));

	const drumSets = [];
	console.assert(isValidRange(memMap.tableDrumNotes));
	const drumSetNotes = splitArrayByN(allBytes.slice(...memMap.tableDrumNotes), 256).map((packet) => splitArrayByN(packet, 2).map((e) => makeValue2ByteBE(e)));
	drumSetNotes.forEach((drumWaveNos, drumSetNo) => {
		const notes = {};
		drumWaveNos.forEach((drumWaveNo, noteNo) => {
			if (drumWaveNo >= json.drumWaves.length) {
				return;
			}
			const note = {
//				name: drumNotes[prog][noteNo],	// TODO: Add drum note tables for each module and use them.
				name: `(${drumSetNames[drumSetNo]} #${noteNo})`,
				drumWaveNo,
				drumWaveRef: {
					$ref: `#/drumWaves/${drumWaveNo}`,
				},
			};
			notes[noteNo] = note;
		});

		const drumSet = {
			drumSetNo,
			name: drumSetNames[drumSetNo],
			notes,
		};
		drumSets.push(drumSet);
	});

	return drumSets;
}

function makeToneMaps(allBytes, memMap, kind) {
	console.assert(allBytes?.length && memMap);

	const tableTones = allBytes.slice(...memMap[`tableTones${kind}`]);

	const toneMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		const toneNo = tableTones[prog];
		if (toneNo >= 128) {
			continue;
		}
		const toneProg = {
			prog,
			toneNo,
			toneRef: {
				$ref: `#/tones/${toneNo}`,
			},
		};
		toneMaps.push(toneProg);
	}

	return toneMaps;
}

function makeDrumMaps(allBytes, memMap, json) {
	console.assert(allBytes?.length && memMap && Array.isArray(json?.drumSets));

	console.assert(isValidRange(memMap.tableDrums));
	const tableDrums = allBytes.slice(...memMap.tableDrums);

	const drumSetProgs = json.drumSets.reduce((ret, drumSet) => {
		let prog = tableDrums.indexOf(drumSet.drumSetNo);
		if (prog === -1) {
			prog = tableDrums.findIndex((toneNo) => drumSet.name === json.tones[toneNo]?.name);
		}
		if (prog >= 0) {
			ret[prog] = drumSet.drumSetNo;
		}
		return ret;
	}, {});

	const drumMaps = [];
	for (const [prog, drumSetNo] of Object.entries(drumSetProgs)) {
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

function addWaveNames(json) {
	console.assert(Array.isArray(json?.tones) && Array.isArray(json?.waves));

	json.tones.forEach((tone) => {
		tone.voices.forEach((voice) => {
			const wave = json.waves[voice.waveNo];
			if (!wave.name) {
				wave.name = tone.name.toLowerCase();
			}
		});
	});
}

function addDrumWaveNames(json) {
	console.assert(Array.isArray(json?.drumSets) && Array.isArray(json?.drumWaves));

	json.drumSets.forEach((drumSet) => {
		Object.values(drumSet.notes).forEach((note) => {
			const drumWave = json.drumWaves[note.drumWaveNo];
			if (!drumWave.name && note.name) {
				drumWave.name = `${note.name.toLowerCase()}`;
			}
		});
	});
}
