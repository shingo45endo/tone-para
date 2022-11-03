import {splitArrayByN, isValidRange, verifyData} from './bin2json_common.js';

export const [binToJsonForSC8820, binToJsonForSCD70] = [
	makeProgDrumTableForSC8820,
	makeProgDrumTableForSCD70,
].map((makeProgDrumTable) => {
	return (allBytes, memMap) => {
		console.assert(allBytes?.length && memMap);

		const json = {
			samples: null,
			waves: null,
			tones: null,
			tones4: null,
			combis: null,
			programs: null,
			drumSets: null,
			progDrums: null,
		};

		const tablePrograms = makeProgTable(allBytes, memMap);
		const tableProgDrums = makeProgDrumTable(allBytes, memMap);

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
		json.combis = makeCombis(allBytes.slice(...memMap.combis), tablePrograms);

		// Drum Sets
		console.assert(isValidRange(memMap.drumSets));
		json.drumSets = makeDrumSets(allBytes, memMap, tableProgDrums, json);

		// Tone Map
		json.programs = makePrograms(tablePrograms, json);

		// Drum Map
		json.progDrums = makeProgDrums(tableProgDrums, json);

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
//			bank:  sampleBytes[10],
//			begin: sampleBytes.slice( 7, 10).reduce((p, c) => (p << 8) | c, 0),
//			end:   sampleBytes.slice(11, 14).reduce((p, c) => (p << 8) | c, 0),
//			loop:  sampleBytes.slice(16, 18).reduce((p, c) => (p << 8) | c, 0),
//			rate:  sampleBytes.slice( 4,  6).reduce((p, c) => (p << 8) | c, 0),
//			rate2: sampleBytes.slice(14, 16).reduce((p, c) => (p << 8) | c, 0),
		};
//		verifyData(sample.end >= sample.begin);
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

		const multiSamples = [];
		for (let i = 0; i < 32; i++) {
			const sampleNo = sampleNos[i];
			const sample = {
				sampleNo: ((sampleNo & 0x8000) === 0) ? sampleNo : sampleNo - 0x10000,
				low: (i > 0) ? notes[i - 1] + 1 : 0,
				high: notes[i],
				level: levels[i],
			};
			if (sample.sampleNo >= 0) {
				Object.assign(sample, {sample: {$ref: `#/samples/${sampleNo}`}});
			}
			console.assert(sample.low <= sample.high);
			multiSamples.push(sample);

			if (sample.high === 0x7f) {
				break;
			}
		}

		const wave = {
			waveNo,
			name: String.fromCharCode(...waveBytes.slice(0, 12)),
			multiSamples,
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
		const voicePackets = [toneBytes.slice(36, 146), toneBytes.slice(146, 256)];
		const bits = commonBytes[22];
		verifyData(bits === 0b01 || bits === 0b11);

		const voices = [];
		voicePackets.forEach((voiceBytes, i) => {
			const waveNo = (voiceBytes[2] << 8) | voiceBytes[3];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
			};
			verifyData(voice.bytes[4] === 64);
			verifyData([5, 7, 20, 37, 38, 39, 40].every((e) => voice.bytes[e] === 0));
			if ((bits & (1 << i)) !== 0) {
				voice.wave = {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
				};
				voices.push(voice);
			}
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
				waveNo,
				bytes: [...voiceBytes],
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

function makeCombis(bytes, tablePrograms) {
	console.assert(bytes?.length && tablePrograms);

	const combis = [];
	const combiPackets = splitArrayByN(bytes, 24);
	combiPackets.forEach((combiBytes, combiNo) => {
		verifyData(combiBytes[12] === 0x01 && combiBytes[13] === 0x00 && combiBytes[14] === 0x03 && combiBytes[15] === 0x00 && combiBytes[19] === 0x00 && combiBytes[23] === 0x00);
		const combi = {
			combiNo,
			name: String.fromCharCode(...combiBytes.slice(0, 12)),
			bytes: [...combiBytes],
			tones: [
				{bankL: combiBytes[16], bankM: combiBytes[17], prog: combiBytes[18]},
				{bankL: combiBytes[20], bankM: combiBytes[21], prog: combiBytes[22]},
			],
		};
		verifyData(/^[\x20-\x7f]*$/u.test(combi.name));
		for (const tone of combi.tones) {
			const toneNo = tablePrograms(tone.prog, tone.bankM, tone.bankL) & 0x1fff;
			tone.toneNo = toneNo;
			tone.tone = {
				$ref: `#/tones/${toneNo}`,
			};
		}
		combis.push(combi);
	});

	return combis;
}

function makeDrumSets(allBytes, memMap, tableProgDrums, json) {
	console.assert(allBytes?.length && memMap && tableProgDrums && Array.isArray(json?.tones));

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
				toneNo,
				tone: {
					name: json.tones[toneNo].name,
					$ref: `#/tones/${toneNo}`,
				},
				bytes: [levels[noteNo], pitches[noteNo], groups[noteNo], panpots[noteNo], reverbs[noteNo], choruses[noteNo], delays[noteNo], rxBits[noteNo]],
				level:  levels[noteNo],
				pitch:  pitches[noteNo],
				group:  groups[noteNo],
				panpot: panpots[noteNo],
				reverb: reverbs[noteNo],
				chorus: choruses[noteNo],
				delay:  delays[noteNo],
				isRxNoteOn:  ((rxBits[noteNo] & 0x10) !== 0),
				isRxNoteOff: ((rxBits[noteNo] & 0x01) !== 0),
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

		const drumSetNo = tableProgDrums(prog1 - 1, 0, bankL);
		const drumSet = drumSets[drumSetNo];
		if (drumSet.notes[noteNo]) {
			drumSet.notes[noteNo].name = name;
		} else {
			verifyData(name === '--------  ');
		}
	});

	return drumSets;
}

const seqBankL = [
	...[...new Array(5)].map((_, i) => i).reverse(),	// 4, 3, 2, 1, 0
	...[...new Array(128)].map((_, i) => i).slice(5),	// 5, 6, ..., 127
];

function makePrograms(tablePrograms, json) {
	console.assert(tablePrograms && Array.isArray(json?.tones) && Array.isArray(json?.tones4) && Array.isArray(json?.combis));

	const programs = [];
	for (const bankL of seqBankL) {
		for (let prog = 0; prog < 128; prog++) {
			for (let bankM = 0; bankM < 125; bankM++) {
				const program = makeProgram(prog, bankM, bankL);
				if (program) {
					programs.push(program);
				}
			}
		}
	}
	for (const bankL of seqBankL) {
		for (let bankM = 125; bankM < 128; bankM++) {
			for (let prog = 0; prog < 128; prog++) {
				const program = makeProgram(prog, bankM, bankL);
				if (program) {
					programs.push(program);
				}
			}
		}
	}

	return programs;

	function makeProgram(prog, bankM, bankL) {
		const tmp16 = tablePrograms(prog, bankM, bankL);
		if (tmp16 === 0xffff) {
			return null;
		}
		const no = tmp16 & 0x1fff;
		const isLegato = ((tmp16 & 0x2000) !== 0);
		const is4Voice = ((tmp16 & 0x4000) !== 0);

		if (isLegato) {
			return {
				name: json.combis[no].name,
				bankL, prog, bankM,
				isLegato,
				combiNo: no,
				combi: {
					$ref: `#/combis/${no}`,
				},
			};
		} else if (is4Voice) {
			return {
				name: json.tones4[no].name,
				bankL, prog, bankM,
				is4Voice,
				tone4No: no,
				tone4: {
					$ref: `#/tones4/${no}`,
				},
			};
		} else {
			return {
				name: json.tones[no].name,
				bankL, prog, bankM,
				toneNo: no,
				tone: {
					$ref: `#/tones/${no}`,
				},
			};
		}
	}
}

function makeProgDrums(tableProgDrums, json) {
	console.assert(tableProgDrums && Array.isArray(json?.drumSets));

	const progDrums = [];
	for (const bankL of seqBankL) {
		for (let prog = 0; prog < 128; prog++) {
			const drumNo = tableProgDrums(prog, 0, bankL);
			if (drumNo === 0xffff) {
				continue;
			}

			const progDrum = {
				bankL, prog,
				drumNo,
				drumSet: {
					name: json.drumSets[drumNo].name,
					$ref: `#/drumSets/${drumNo}`,
				},
			};
			progDrums.push(progDrum);
		}
	}

	return progDrums;
}

function makeProgTable(allBytes, memMap) {
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

function makeProgDrumTableForSC8820(allBytes, memMap) {
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

function makeProgDrumTableForSCD70(allBytes, memMap) {
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
