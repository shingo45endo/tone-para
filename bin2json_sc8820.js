import {splitArrayByN, isValidRange, verifyData} from './bin2json_common.js';

export const [binToJsonForSC8820, binToJsonForSCD70] = [
	makeTableOfDrumMapForSC8820,
	makeTableOfDrumMapForSCD70,
].map((makeTableOfDrumMap) => {
	return (allBytes, memMap) => {
		console.assert(allBytes?.length && memMap);

		const json = {
			samples: null,
			waves: null,
			tones: null,
			tones4: null,
			combis: null,
			drumSets: null,
			toneMaps: null,
			drumMaps: null,
		};

		const tableToneMap = makeTableOfToneMap(allBytes, memMap);
		const tableDrumMap = makeTableOfDrumMap(allBytes, memMap);

		// Samples
		console.assert(isValidRange(memMap.samples));
		json.samples = makeSamples(allBytes.slice(...memMap.samples));

		// Waves
		console.assert(isValidRange(memMap.waves));
		json.waves = makeWaves(allBytes.slice(...memMap.waves));

		// Tones
		console.assert(isValidRange(memMap.tones));
		json.tones = makeTones(allBytes.slice(...memMap.tones), json);

		// Tones (4-voice)
		console.assert(isValidRange(memMap.tones4));
		json.tones4 = makeTones4(allBytes.slice(...memMap.tones4), json);

		// Legato
		console.assert(isValidRange(memMap.combis));
		json.combis = makeCombis(allBytes.slice(...memMap.combis), tableToneMap, json);

		// Drum Sets
		console.assert(isValidRange(memMap.drumSets));
		json.drumSets = makeDrumSets(allBytes, memMap, tableDrumMap, json);

		// Tone Map
		json.toneMaps = makeToneMaps(tableToneMap, json);

		// Drum Map
		json.drumMaps = makeDrumMaps(tableDrumMap, json);

		return json;
	};
});

function makeSamples(bytes) {
	console.assert(bytes?.length);

	const samples = [];
	const samplePackets = splitArrayByN(bytes, 22);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const sample = {
			sampleNo,
			bytes: [...sampleBytes],
			key:   sampleBytes[6],
			bank:  sampleBytes[0],
			addrBegin: sampleBytes.slice(1, 4).reduce((p, c) => (p << 8) | c, 0),
			addrLoop:  sampleBytes.slice(7, 10).reduce((p, c) => (p << 8) | c, 0),
			addrEnd:   sampleBytes.slice(11, 14).reduce((p, c) => (p << 8) | c, 0),
		};
		verifyData(sample.addrBegin <  sample.addrEnd);
		verifyData(sample.addrBegin <= sample.addrLoop || sampleNo === 3575 || sampleNo === 3576);
		verifyData(sample.addrLoop  <= sample.addrEnd);
		samples.push(sample);
	});

	return samples;
}

function makeWaves(bytes) {
	console.assert(bytes?.length);

	const waves = [];
	const wavePackets = splitArrayByN(bytes, 140);
	wavePackets.forEach((waveBytes, waveNo) => {
		const notes = waveBytes.slice(12, 44);
		const sampleNos = splitArrayByN(waveBytes.slice(44, 108), 2).map((e) => (e[0] << 8) | e[1]);
		const levels = waveBytes.slice(108, 140);
		console.assert(notes.length === 32 && sampleNos.length === 32 && levels.length === 32);

		const sampleSlots = [];
		for (let i = 0; i < 32; i++) {
			const sampleNo = sampleNos[i];
			const sample = {
				low: (i > 0) ? notes[i - 1] + 1 : 0,
				high: notes[i],
				level: levels[i],
				sampleNo: ((sampleNo & 0x8000) === 0) ? sampleNo : sampleNo - 0x10000,
			};
			if (sample.sampleNo >= 0) {
				Object.assign(sample, {sample: {$ref: `#/samples/${sampleNo}`}});
			}
			console.assert(sample.low <= sample.high);
			sampleSlots.push(sample);

			if (sample.high === 0x7f) {
				break;
			}
		}

		const wave = {
			waveNo,
			name: String.fromCharCode(...waveBytes.slice(0, 12)),
			sampleSlots,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(wave.name));
		waves.push(wave);
	});

	return waves;
}

function makeTones(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.waves));

	const tones = [];
	const tonePackets = splitArrayByN(bytes, 256);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 36);
		const numVoices = {0b01: 1, 0b11: 2}[commonBytes[22]];
		verifyData(numVoices === 1 || numVoices === 2);
		const voicePackets = splitArrayByN(toneBytes.slice(36, 36 + 110 * numVoices), 110);

		const voices = [];
		voicePackets.forEach((voiceBytes) => {
			verifyData(voiceBytes[4] === 0x40);
			verifyData([5, 7, 20, 37, 38, 39, 40].every((e) => voiceBytes[e] === 0x00));
			const waveNo = (voiceBytes[2] << 8) | voiceBytes[3];
			const voice = {
				bytes: [...voiceBytes],
				waveNo,
				wave: {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 12)),
			commonBytes: [...commonBytes],
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);
	});

	return tones;
}

function makeTones4(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.waves));

	const tones4 = [];
	const tonePackets = splitArrayByN(bytes, 488);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 48);
		const voicePackets = splitArrayByN(toneBytes.slice(48), 110);

		const voices = [];
		voicePackets.forEach((voiceBytes) => {
			const waveNo = (voiceBytes[2] << 8) | voiceBytes[3];
			const voice = {
				bytes: [...voiceBytes],
				waveNo,
				wave: {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 12)),
			commonBytes: [...commonBytes],
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones4.push(tone);
	});

	return tones4;
}

function makeCombis(bytes, tableToneMap, json) {
	console.assert(bytes?.length && tableToneMap && Array.isArray(json?.tones));

	const combis = [];
	const combiPackets = splitArrayByN(bytes, 24);
	combiPackets.forEach((combiBytes, combiNo) => {
		verifyData(combiBytes[12] === 0x01 && combiBytes[13] === 0x00 && combiBytes[14] === 0x03 && combiBytes[15] === 0x00 && combiBytes[19] === 0x00 && combiBytes[23] === 0x00);
		const toneSlots = [
			{bankL: combiBytes[16], bankM: combiBytes[17], prog: combiBytes[18]},
			{bankL: combiBytes[20], bankM: combiBytes[21], prog: combiBytes[22]},
		];
		toneSlots.forEach((toneSlot) => {
			const {prog, bankM, bankL} = toneSlot;
			const toneNo = tableToneMap(prog, bankM, bankL) & 0x1fff;
			Object.assign(toneSlot, {
				toneNo,
				tone: {
					name: json.tones[toneNo].name,
					$ref: `#/tones/${toneNo}`,
				},
			});
		});

		const combi = {
			combiNo,
			name: String.fromCharCode(...combiBytes.slice(0, 12)),
			toneSlots,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(combi.name));
		combis.push(combi);
	});

	return combis;
}

function makeDrumSets(allBytes, memMap, tableDrumMap, json) {
	console.assert(allBytes?.length && memMap && tableDrumMap && Array.isArray(json?.tones));

	const drumSets = [];
	console.assert(isValidRange(memMap.drumSets));
	const drumSetPackets = splitArrayByN(allBytes.slice(...memMap.drumSets), 1292);
	drumSetPackets.forEach((drumSetBytes, drumSetNo) => {
		const tones = splitArrayByN(drumSetBytes.slice(0, 256), 2).map((e) => (e[0] << 8) | e[1]);
		const [levels, pitches, groups, panpots, reverbs, choruses, delays, rxBits] = splitArrayByN(drumSetBytes.slice(256, 1280), 128);

		const notes = {};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			const toneNo = tones[noteNo];
			if (toneNo === 0xffff) {
				continue;
			}
			const note = {
				level:  levels[noteNo],
				pitch:  pitches[noteNo],
				group:  groups[noteNo],
				panpot: panpots[noteNo],
				reverb: reverbs[noteNo],
				chorus: choruses[noteNo],
				delay:  delays[noteNo],
				isRxNoteOn:  ((rxBits[noteNo] & 0x10) !== 0),
				isRxNoteOff: ((rxBits[noteNo] & 0x01) !== 0),
				name: null,
				toneNo,
				tone: {
					name: json.tones[toneNo].name,
					$ref: `#/tones/${toneNo}`,
				},
			};
			notes[noteNo] = note;
		}

		const drumSet = {
			drumSetNo,
			name: String.fromCharCode(...drumSetBytes.slice(1280)),
			notes,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(drumSet.name));
		drumSets.push(drumSet);
	});

	// Adds drum note names.
	console.assert(isValidRange(memMap.drumNoteNames));
	const drumNoteNamePackets = splitArrayByN(allBytes.slice(...memMap.drumNoteNames), 20);
	drumNoteNamePackets.forEach((drumNoteNameBytes) => {
		verifyData(drumNoteNameBytes[0] === 0x00);
		const [bankL, prog1, noteNo] = drumNoteNameBytes.slice(1, 4);
		const name = String.fromCharCode(...drumNoteNameBytes.slice(4, 14 /* 16 */));	// Note: Some drum names have unnecessary NUL terminator at the end of string.

		const drumSetNo = tableDrumMap(prog1 - 1, 0, bankL);
		const drumSet = drumSets[drumSetNo];
		if (drumSet.notes[noteNo]) {
			drumSet.notes[noteNo].name = name;
		} else {
			verifyData(name === '--------  ');
		}
	});

	// Removes empty drum note names.
	drumSets.forEach((drumSet) => {
		Object.values(drumSet.notes).forEach((note) => {
			if (!note.name) {
				delete note.name;
			}
		});
	});

	return drumSets;
}

const seqBankL = [
	...[...new Array(5)].map((_, i) => i).reverse(),	// 4, 3, 2, 1, 0
	...[...new Array(128)].map((_, i) => i).slice(5),	// 5, 6, ..., 127
];

function makeToneMaps(tableToneMap, json) {
	console.assert(tableToneMap && Array.isArray(json?.tones) && Array.isArray(json?.tones4) && Array.isArray(json?.combis));

	const toneMaps = [];
	for (const bankL of seqBankL) {
		for (let prog = 0; prog < 128; prog++) {
			for (let bankM = 0; bankM < 125; bankM++) {
				const toneProg = makeToneProg(prog, bankM, bankL);
				if (toneProg) {
					toneMaps.push(toneProg);
				}
			}
		}
	}
	for (const bankL of seqBankL) {
		for (let bankM = 125; bankM < 128; bankM++) {
			for (let prog = 0; prog < 128; prog++) {
				const toneProg = makeToneProg(prog, bankM, bankL);
				if (toneProg) {
					toneMaps.push(toneProg);
				}
			}
		}
	}

	return toneMaps;

	function makeToneProg(prog, bankM, bankL) {
		const tmp16 = tableToneMap(prog, bankM, bankL);
		if (tmp16 === 0xffff) {
			return null;
		}
		const no = tmp16 & 0x1fff;
		const isLegato = ((tmp16 & 0x2000) !== 0);
		const is4Voice = ((tmp16 & 0x4000) !== 0);

		if (isLegato) {
			return {
				bankL, prog, bankM,
				isLegato,
				combiNo: no,
				combi: {
					name: json.combis[no].name,
					$ref: `#/combis/${no}`,
				},
			};
		} else if (is4Voice) {
			return {
				bankL, prog, bankM,
				is4Voice,
				toneNo: no,
				tone4: {
					name: json.tones4[no].name,
					$ref: `#/tones4/${no}`,
				},
			};
		} else {
			return {
				bankL, prog, bankM,
				toneNo: no,
				tone: {
					name: json.tones[no].name,
					$ref: `#/tones/${no}`,
				},
			};
		}
	}
}

function makeDrumMaps(tableDrumMap, json) {
	console.assert(tableDrumMap && Array.isArray(json?.drumSets));

	const drumMaps = [];
	for (const bankL of seqBankL) {
		for (let prog = 0; prog < 128; prog++) {
			const drumSetNo = tableDrumMap(prog, 0, bankL);
			if (drumSetNo === 0xffff) {
				continue;
			}

			const drumProg = {
				bankL, prog,
				drumSetNo,
				drumSet: {
					name: json.drumSets[drumSetNo].name,
					$ref: `#/drumSets/${drumSetNo}`,
				},
			};
			drumMaps.push(drumProg);
		}
	}

	return drumMaps;
}

function makeTableOfToneMap(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableMaps[bankL] => mapNo
	console.assert(isValidRange(memMap.tableMaps));
	const tableMaps = allBytes.slice(...memMap.tableMaps);

	// tableBanks[mapNo][bankM] => bankNo
	const bankBytes = allBytes.slice(...memMap.tableBanks);
	const packetSize = bankBytes.length / 11;
	const elemSize = packetSize / 128;	// SC-8820: 1, SC-D70/SK-500: 2
	console.assert(Number.isInteger(packetSize) && Number.isInteger(elemSize));
	const tableBanks = splitArrayByN(bankBytes, packetSize).map((e) => e.reduce((p, _, i, a) => {
		if (i % elemSize === 0) {
			p.push(a[i + elemSize - 1]);
		}
		return p;
	}, []));

	// tableTones[bankNo][prog] => toneNo
	console.assert(isValidRange(memMap.tableTones));
	const tableTones = splitArrayByN(allBytes.slice(...memMap.tableTones), 256).map((e) => splitArrayByN(e, 2).map((e) => (e[0] << 8) | e[1]));

	return ((tableMaps, tableBanks, tableTones) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = tableMaps[bankL];
		if (mapNo === 0xff) {
			return 0xffff;
		}
		const bankNo = tableBanks[mapNo][bankM];
		if (bankNo === 0xff) {
			return 0xffff;
		}
		return tableTones[bankNo][prog];
	})(tableMaps, tableBanks, tableTones);
}

function makeTableOfDrumMapForSC8820(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableDrumMaps[bankL] => mapNo
	console.assert(isValidRange(memMap.tableDrumMaps));
	const tableDrumMaps = allBytes.slice(...memMap.tableDrumMaps);

	// tableDrums[mapNo][prog] => drumIndex
	console.assert(isValidRange(memMap.tableDrums));
	const tableDrums = splitArrayByN(allBytes.slice(...memMap.tableDrums), 128);

	// tableDrums2[drumIndex] => drumNo
	console.assert(isValidRange(memMap.tableDrums2));
	const tableDrums2 = splitArrayByN(allBytes.slice(...memMap.tableDrums2), 2).map((e) => (e[0] << 8) | e[1]);

	return ((tableDrumMaps, tableDrums, tableDrums2) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = tableDrumMaps[bankL];
		if (mapNo === 0xff) {
			return 0xffff;
		}
		const drumIndex = tableDrums[mapNo][prog];
		if (drumIndex === 0xff) {
			return 0xffff;
		}
		return tableDrums2[drumIndex];
	})(tableDrumMaps, tableDrums, tableDrums2);
}

function makeTableOfDrumMapForSCD70(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableDrumMaps[bankL] => mapNo
	console.assert(isValidRange(memMap.tableDrumMaps));
	const tableDrumMaps = allBytes.slice(...memMap.tableDrumMaps);

	// tableDrums[mapNo][prog] => drumNo
	console.assert(isValidRange(memMap.tableDrums));
	const tableDrums = splitArrayByN(allBytes.slice(...memMap.tableDrums), 256).map((e) => splitArrayByN(e, 2).map((e) => (e[0] << 8) | e[1]));

	return ((tableDrumMaps, tableDrums) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = tableDrumMaps[bankL];
		if (mapNo === 0xff) {
			return 0xffff;
		}
		return tableDrums[mapNo][prog];
	})(tableDrumMaps, tableDrums);
}
