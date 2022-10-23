import {splitArrayByN} from './bin2json_common.js';

export function binToJsonForSC8820(bytes, regions) {
	const json = {};

	if (regions.samples) {
		json.samples = makeSamples(bytes.slice(...regions.samples));
	}
	if (regions.waves) {
		json.waves = makeWaves(bytes.slice(...regions.waves));
	}
	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones), json);
	}
	if (regions.tones4) {
		json.tones4 = makeTones4(bytes.slice(...regions.tones4), json);
	}
	if (regions.tableMaps && regions.tableBanks && regions.tableTones) {
		const tablePrograms = makeProgTable(bytes.slice(...regions.tableMaps), bytes.slice(...regions.tableBanks), bytes.slice(...regions.tableTones));
		if (regions.combis) {
			json.combis = makeCombis(bytes.slice(...regions.combis), tablePrograms);
		}
		json.programs = makePrograms(tablePrograms, json);
	}
	if (regions.drumSets && regions.tableDrumMaps && regions.tableDrums && regions.tableDrums2 && regions.drumNoteNames) {
		json.drumSets = makeDrumSets(bytes.slice(...regions.drumSets), json);

		const tableProgDrums = makeProgDrumTableForSC8820(bytes.slice(...regions.tableDrumMaps), bytes.slice(...regions.tableDrums), bytes.slice(...regions.tableDrums2));
		json.progDrums = makeProgDrums(tableProgDrums, json);

		addDrumNoteNames(bytes.slice(...regions.drumNoteNames), tableProgDrums, json);
	}

	return json;
}

export function binToJsonForSCD70(bytes, regions) {
	const json = {};

	if (regions.samples) {
		json.samples = makeSamples(bytes.slice(...regions.samples));
	}
	if (regions.waves) {
		json.waves = makeWaves(bytes.slice(...regions.waves));
	}
	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones), json);
	}
	if (regions.tones4) {
		json.tones4 = makeTones4(bytes.slice(...regions.tones4), json);
	}
	if (regions.tableMaps && regions.tableBanks && regions.tableTones) {
		const tablePrograms = makeProgTable(bytes.slice(...regions.tableMaps), bytes.slice(...regions.tableBanks), bytes.slice(...regions.tableTones));
		if (regions.combis) {
			json.combis = makeCombis(bytes.slice(...regions.combis), tablePrograms);
		}
		json.programs = makePrograms(tablePrograms, json);
	}
	if (regions.drumSets && regions.tableDrumMaps && regions.tableDrums && regions.drumNoteNames) {
		json.drumSets = makeDrumSets(bytes.slice(...regions.drumSets), json);

		const tableProgDrums = makeProgDrumTableForSCD70(bytes.slice(...regions.tableDrumMaps), bytes.slice(...regions.tableDrums));
		json.progDrums = makeProgDrums(tableProgDrums, json);

		addDrumNoteNames(bytes.slice(...regions.drumNoteNames), tableProgDrums, json);
	}

	return json;
}

function makeSamples(bytes) {
	const samplePackets = splitArrayByN(bytes, 22);

	const samples = [];
	for (let sampleNo = 0; sampleNo < samplePackets.length; sampleNo++) {
		const sampleBytes = samplePackets[sampleNo];

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
//		console.assert(sample.end >= sample.begin);

		samples.push(sample);
	}

	return samples;
}

function makeWaves(bytes) {
	const wavePackets = splitArrayByN(bytes, 140);

	const waves = [];
	for (let waveNo = 0; waveNo < wavePackets.length; waveNo++) {
		const waveBytes = wavePackets[waveNo];

		const name = String.fromCharCode(...waveBytes.slice(0, 12));
		const notes = waveBytes.slice(12, 44);
		const sampleNos = splitArrayByN(waveBytes.slice(44, 108), 2).map((e) => (e[0] << 8) | e[1]);
		const levels = waveBytes.slice(108, 140);

		const wave = {
			waveNo, name,
			multiSamples: [],
		};
		console.assert(notes.length === 32 && sampleNos.length === 32 && levels.length === 32);
		for (let i = 0; i < 32; i++) {
			const sampleNo = sampleNos[i];
			const multiSample = {
				sampleNo: ((sampleNo & 0x8000) === 0) ? sampleNo : sampleNo - 0x10000,
				low: (i > 0) ? notes[i - 1] + 1 : 0,
				high: notes[i],
				level: levels[i],
			};
			if (multiSample.sampleNo >= 0) {
				Object.assign(multiSample, {sample: {$ref: `#/samples/${sampleNo}`}});
			}

			wave.multiSamples.push(multiSample);

			if (multiSample.high >= 0x7f) {
				break;
			}
		}

		waves.push(wave);
	}

	return waves;
}

function makeTones(bytes, json) {
	console.assert(json && json.waves);
	const tonePackets = splitArrayByN(bytes, 256);

	const tones = [];
	for (let toneNo = 0; toneNo < tonePackets.length; toneNo++) {
		const toneBytes = tonePackets[toneNo];

		const commonBytes = toneBytes.slice(0, 36);
		const voicePackets = [toneBytes.slice(36, 146), toneBytes.slice(146, 256)];

		const name = String.fromCharCode(...commonBytes.slice(0, 12));
		const bits = commonBytes[22];
		console.assert(bits === 0b01 || bits === 0b11);

		const tone = {
			toneNo, name,
			commonBytes: [...commonBytes],
			voices: [],
		};

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = (voiceBytes[2] << 8) | voiceBytes[3];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
			};
			console.assert(voice.bytes[4] === 64);
			console.assert([5, 7, 20, 37, 38, 39, 40].every((e) => voice.bytes[e] === 0));
			if ((bits & (1 << i)) !== 0) {
				voice.wave = {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
				};
				tone.voices.push(voice);
			}
		}

		tones.push(tone);
	}

	return tones;
}

function makeTones4(bytes, json) {
	console.assert(json && json.waves);
	const tone4Packets = splitArrayByN(bytes, 488);

	const tones4 = [];
	for (let tone4No = 0; tone4No < tone4Packets.length; tone4No++) {
		const toneBytes = tone4Packets[tone4No];

		const commonBytes = toneBytes.slice(0, 48);
		const voicePackets = splitArrayByN(toneBytes.slice(48), 110);

		const name = String.fromCharCode(...commonBytes.slice(0, 12));

		const tone4 = {
			toneNo: tone4No, name,
			commonBytes: [...commonBytes],
			voices: [],
		};

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = (voiceBytes[2] << 8) | voiceBytes[3];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
				wave: {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
				},
			};
			tone4.voices.push(voice);
		}

		tones4.push(tone4);
	}

	return tones4;
}

function makeCombis(bytes, tablePrograms) {
	const combiPackets = splitArrayByN(bytes, 24);

	const combis = [];
	for (let combiNo = 0; combiNo < combiPackets.length; combiNo++) {
		const combiBytes = combiPackets[combiNo];

		const name = String.fromCharCode(...combiBytes.slice(0, 12));

		const combi = {
			combiNo, name,
			bytes: [...combiBytes],
			tones: [
				{bankL: combiBytes[16], bankM: combiBytes[17], prog: combiBytes[18]},
				{bankL: combiBytes[20], bankM: combiBytes[21], prog: combiBytes[22]},
			],
		};
		for (const tone of combi.tones) {
			const toneNo = tablePrograms(tone.prog, tone.bankM, tone.bankL) & 0x1fff;
			tone.toneNo = toneNo;
			tone.tone = {
				$ref: `#/tones/${toneNo}`,
			};
		}

		combis.push(combi);
	}

	return combis;
}

function makeDrumSets(bytes, json) {
	console.assert(json && json.tones);
	const drumSetPackets = splitArrayByN(bytes, 1292);

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumSetPackets.length; drumSetNo++) {
		const drumSetBytes = drumSetPackets[drumSetNo];

		const tones = splitArrayByN(drumSetBytes.slice(0, 256), 2).map((e) => (e[0] << 8) | e[1]);
		const [levels, pitches, groups, panpots, reverbs, choruses, delays, rxBits] = splitArrayByN(drumSetBytes.slice(256, 1280), 128);
		const name = String.fromCharCode(...drumSetBytes.slice(1280));

		const drumSet = {
			drumSetNo, name,
			notes: {},
		};
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
			drumSet.notes[noteNo] = note;
		}

		drumSets.push(drumSet);
	}

	return drumSets;
}

const seqBankL = [
	...[...new Array(5)].map((_, i) => i).reverse(),	// 4, 3, 2, 1, 0
	...[...new Array(128)].map((_, i) => i).slice(5),	// 5, 6, ..., 127
];

function makePrograms(tablePrograms, json) {
	console.assert(json && json.tones && json.tones4 && json.combis);

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
	console.assert(json && json.drumSets);

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

function makeProgTable(mapBytes, bankBytes, toneBytes) {
	// tableTones[bankNo][prog] => toneNo
	const tonePackets = splitArrayByN(toneBytes, 256);
	const tableTones = tonePackets.map((e) => splitArrayByN(e, 2).map((e) => (e[0] << 8) | e[1]));

	// tableMaps[bankL] => mapNo
	const tableMaps = mapBytes;

	// tableBanks[mapNo][bankM] => bankNo
	const packetSize = bankBytes.length / 11;
	const elemSize = packetSize / 128;
	console.assert(Number.isInteger(packetSize) && Number.isInteger(elemSize));
	const tableBanks = splitArrayByN(bankBytes, packetSize).map((e) => e.reduce((p, _, i, a) => {
		if (i % elemSize === 0) {
			p.push(a[i + elemSize - 1]);
		}
		return p;
	}, []));

	return ((tableTones, tableMaps, tableBanks) => (prog, bankM, bankL) => {
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
	})(tableTones, tableMaps, tableBanks);
}

function makeProgDrumTableForSC8820(mapBytes, drumBytes, drumBytes2) {
	// tableDrumMaps[bankL] => mapNo
	const tableDrumMaps = mapBytes;

	// tableDrums[mapNo][prog] => drumIndex
	const tableDrums = splitArrayByN(drumBytes, 128);

	// tableDrums2[drumIndex] => drumNo
	const tableDrums2 = drumBytes2.reduce((p, _, i, a) => {
		if (i % 2 === 0) {
			p.push((a[i] << 8) | a[i + 1]);
		}
		return p;
	}, []);

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

function makeProgDrumTableForSCD70(mapBytes, drumBytes) {
	// tableDrumMaps[bankL] => mapNo
	const tableDrumMaps = mapBytes;

	// tableDrums[mapNo][prog] => drumNo
	const tableDrums = splitArrayByN(drumBytes.reduce((p, _, i, a) => {
		if (i % 2 === 0) {
			p.push((a[i] << 8) | a[i + 1]);
		}
		return p;
	}, []), 128);

	return ((tableDrumMaps, tableDrums) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = tableDrumMaps[bankL];
		if (mapNo === 0xff) {
			return 0xffff;
		}
		return tableDrums[mapNo][prog];
	})(tableDrumMaps, tableDrums);
}

function addDrumNoteNames(bytes, tableProgDrums, json) {
	const tableDrumNoteNames = splitArrayByN(bytes, 20);
	for (const tableDrumNoteName of tableDrumNoteNames) {
		const [_, bankL, prog1, noteNo] = tableDrumNoteName.slice(0, 4);
		const name = String.fromCharCode(...tableDrumNoteName.slice(4, 14 /* 16 */));	// Note: Some drum names have unnecessary NUL terminator at the end of string.

		const drumSetNo = tableProgDrums(prog1 - 1, 0, bankL);
		const drumSet = json.drumSets[drumSetNo];

		if (drumSet.notes[noteNo]) {
			drumSet.notes[noteNo].name = name;
		}
	}
}
