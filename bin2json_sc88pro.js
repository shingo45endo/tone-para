import {splitArrayByN, removePrivateProp, isValidRegion, verifyData} from './bin2json_common.js';

export function binToJsonForSC88Pro(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = makeBasicJson(allBytes, memMap);

	// Legato
	json.combis = makeCombis(allBytes, memMap.combis);

	// Tone Map
	const tablePrograms = makeProgTableForSC88Pro(allBytes, memMap);
	json.programs = makePrograms(tablePrograms, json);

	// Drum Map
	const tableProgDrums = makeProgDrumTableForSC88Pro(allBytes, memMap);
	json.progDrums = makeProgDrums(tableProgDrums, json);

	// Adds references of tones to Legato tones.
	json.combis.forEach((combi) => combi.tones.forEach((tone) => {
		const {prog, bankM, bankL} = tone;
		const toneAddr = tablePrograms(prog, bankM, bankL);
		const toneNo = json.tones.find((tone) => tone._addr === (toneAddr & 0x0fffff)).toneNo;
		Object.assign(tone, {
			toneNo,
			tone: {
				name: json.tones[toneNo].name,
				$ref: `#/tones/${toneNo}`,
			},
		});
	}));

	removePrivateProp(json);

	return json;
}

export function binToJsonForSC88(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = makeBasicJson(allBytes, memMap);

	// Tone Map
	const tablePrograms = makeProgTableForSC88(allBytes, memMap);
	json.programs = makePrograms(tablePrograms, json);

	// Drum Map
	const tableProgDrums = makeProgDrumTableForSC88(allBytes, memMap);
	json.progDrums = makeProgDrums(tableProgDrums, json);

	removePrivateProp(json);

	return json;
}

function makeBasicJson(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {};

	// Samples
	console.assert(Array.isArray(memMap.samplesRanges));
	json.samples = makeSamples(allBytes, memMap.samplesRanges);

	// Waves
	console.assert(isValidRegion(memMap.waves));
	json.waves = makeWaves(allBytes.slice(...memMap.waves), json);

	// Tones
	console.assert(Array.isArray(memMap.tonesRanges));
	json.tones = makeTones(allBytes, memMap.tonesRanges, json);

	// Drum Sets
	json.drumSets = makeDrumSets(allBytes, memMap, json);

	return json;
}

function makeSamples(allBytes, sampleRanges) {
	console.assert(allBytes?.length && sampleRanges?.every((e) => isValidRegion(e)));

	const samples = [];
	let sampleNo = 0;
	sampleRanges.forEach(([rangeBegin, rangeEnd]) => {
		const samplePackets = splitArrayByN(allBytes.slice(rangeBegin, rangeEnd), 20);
		samplePackets.forEach((sampleBytes, i) => {
			const sample = {
				sampleNo,
				bytes: [...sampleBytes],
				key:   sampleBytes[6],
//				bank:  sampleBytes[10],
//				begin: sampleBytes.slice( 7, 10).reduce((p, c) => (p << 8) | c, 0),
//				end:   sampleBytes.slice(11, 14).reduce((p, c) => (p << 8) | c, 0),
//				loop:  sampleBytes.slice(16, 18).reduce((p, c) => (p << 8) | c, 0),
//				rate:  sampleBytes.slice( 4,  6).reduce((p, c) => (p << 8) | c, 0),
//				rate2: sampleBytes.slice(14, 16).reduce((p, c) => (p << 8) | c, 0),
				_addr: rangeBegin + 20 * i,
			};
//			verifyData(sample.end >= sample.begin);
			samples.push(sample);
			sampleNo++;
		});
	});

	return samples;
}

function makeWaves(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.samples));

	const waves = [];
	let index = 0;
	let waveNo = 0;
	while (index < bytes.length) {
		const offset = index;
		verifyData(((bytes[index] << 8) | bytes[index + 1]) === waveNo);
		index += 2;
		const name = String.fromCharCode(...bytes.slice(index, index + 12));
		verifyData(/^[\x20-\x7f]*$/u.test(name));
		index += 12;
		verifyData(((bytes[index] << 8) | bytes[index + 1]) === 0x03ff);
		index += 2;

		const multiSamples = [];
		for (;;) {
			const sampleBytes = bytes.slice(index, index + 6);
			index += 6;

			const sampleAddr = (sampleBytes[4] << 8) | sampleBytes[5];
			let sampleNo;
			if (sampleAddr !== 0xffff) {
				if (sampleBytes[1] !== 0xff) {	// SC-88Pro
					sampleNo = json.samples.find((sample) => sample._addr === ((sampleBytes[1] << 16) | sampleAddr)).sampleNo;
				} else {	// SC-88, SC-88VL
					sampleNo = json.samples.find((sample) => (sample._addr & 0xffff) === sampleAddr).sampleNo;
				}
			} else {
				sampleNo = -1;
			}

			const sample = {
				sampleNo,
				low: (multiSamples.length > 0) ? multiSamples[multiSamples.length - 1].high + 1 : 0,
				high: sampleBytes[0],
				b01: sampleBytes[1],
				b02: sampleBytes[2],
				b03: sampleBytes[3],
			};
			console.assert(sample.low <= sample.high);
			multiSamples.push(sample);

			if (sample.high === 0x7f) {
				break;
			}
		}

		const wave = {
			waveNo, name, multiSamples,
			_offset: offset,
		};
		waves.push(wave);

		waveNo++;
	}

	return waves;
}

function makeTones(allBytes, tonesRanges, json) {
	console.assert(allBytes?.length && tonesRanges?.every((e) => isValidRegion(e)) && Array.isArray(json?.waves));

	const tones = [];
	let toneNo = 0;
	tonesRanges.forEach(([rangeBegin, rangeEnd]) => {
		const regionBytes = allBytes.slice(rangeBegin, rangeEnd);

		let index = 0;
		while (index < regionBytes.length) {
			const numVoices = {0x01: 1, 0x03: 2}[regionBytes[index + 31] & 0x7f];
			verifyData(numVoices === 1 || numVoices === 2);
			const size = 34 + 148 * numVoices;
			const toneBytes = regionBytes.slice(index, index + size);
			const commonBytes = toneBytes.slice(0, 34);
			verifyData(commonBytes[18] === 0xff && commonBytes[25] === 0x00);
			const voicePackets = splitArrayByN(toneBytes.slice(34), 148);

			const voices =  voicePackets.map((voiceBytes) => {
				verifyData([9, 28, 38, 39].every((index) => voiceBytes[index] === 0x00));
				verifyData([6, 47, 57, 63, 89, 147].every((index) => voiceBytes[index] === 0xff));
				const waveOffset = (voiceBytes[0] << 8) | voiceBytes[1];
				const waveNo = json.waves.find((wave) => wave._offset === waveOffset).waveNo;
				const voice = {
					waveNo,
					bytes: [...voiceBytes],
					wave: {
						name: json.waves[waveNo].name,
						$ref: `#/waves/${waveNo}`,
					},
				};
				return voice;
			});

			const tone = {
				toneNo,
				name: String.fromCharCode(...commonBytes.slice(0, 12)),
				commonBytes: [...commonBytes],
				voices,
				_addr: rangeBegin + index,
			};
			verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
			tones.push(tone);

			index += size;
			toneNo++;
		}
	});

	return tones;
}

function makeDrumSets(allBytes, memMap, json) {
	console.assert(allBytes?.length && memMap && json?.tones);

	console.assert(Array.isArray(memMap.drumSetsRanges) && memMap.drumSetsRanges.every((e) => isValidRegion(e)));
	const drumSetInstances = [];
	memMap.drumSetsRanges.forEach(([rangeBegin, rangeEnd]) => {
		const drumSetPackets = splitArrayByN(allBytes.slice(rangeBegin, rangeEnd), 1292);
		drumSetPackets.forEach((drumSetBytes, i) => {
			const toneAddrs = splitArrayByN(drumSetBytes.slice(0, 384), 3).map((e) => (e[0] << 16) | (e[1] << 8) | e[2]);
			const [pitches, levels, groups, panpots, reverbs, choruses, rxBits] = splitArrayByN(drumSetBytes.slice(384, 1280), 128);

			const notes = {};
			for (let noteNo = 0; noteNo < 128; noteNo++) {
				const toneAddr = toneAddrs[noteNo];
				if (toneAddr === 0xffffff) {
					continue;
				}

				const toneNo = json.tones.find((tone) => tone._addr === (toneAddr & 0x0fffff))?.toneNo;
				verifyData(Number.isInteger(toneNo));
				const note = {
					toneNo,
					tone: {
						name: json.tones[toneNo].name,
						$ref: `#/tones/${toneNo}`,
					},
					level:  levels[noteNo],
					pitch:  pitches[noteNo],
					group:  groups[noteNo],
					panpot: panpots[noteNo],
					reverb: reverbs[noteNo],
					chorus: choruses[noteNo],
					isRxNoteOn:  ((rxBits[noteNo] & 0x10) !== 0),
					isRxNoteOff: ((rxBits[noteNo] & 0x01) !== 0),
				};
				notes[noteNo] = note;
			}

			const drumSet = {
				drumSetNo: -1,	// dummy
				name: String.fromCharCode(...drumSetBytes.slice(1280)),
				notes,
				_addr: rangeBegin + 1292 * i,
			};
			verifyData(/^[\x20-\x7f]*$/u.test(drumSet.name));
			drumSetInstances.push(drumSet);
		});
	});

	// Adds proper Drum Set No. from addresses of each Drum Sets.
	console.assert(isValidRegion(memMap.tableDrumSetAddrs));
	const tableDrumSetAddrs = splitArrayByN(allBytes.slice(...memMap.tableDrumSetAddrs), 3).map((e) => ((e[0] & 0x0f) << 16) | (e[1] << 8) | e[2]);
	const drumSets = tableDrumSetAddrs.map((drumSetAddr, drumSetNo) => {
		const drumSet = drumSetInstances.find((drumSet) => drumSetAddr === drumSet._addr);
		verifyData(drumSet);
		return {...drumSet, drumSetNo};
	});
	verifyData(drumSets.every((drumSet) => drumSet.drumSetNo >= 0));

	return drumSets;
}

function makeCombis(allBytes, combisRange) {
	console.assert(allBytes?.length && isValidRegion(combisRange));

	const addrBase = combisRange[0];
	const combiPackets = splitArrayByN(allBytes.slice(...combisRange), 24);

	const combis = [];
	combiPackets.forEach((combiBytes, combiNo) => {
		verifyData(combiBytes[12] === 0x01 && combiBytes[13] === 0x00 && combiBytes[14] === 0x08 && combiBytes[15] === 0x03 && combiBytes[16] === 0x00 && combiBytes[23] === 0xff);
		const combi = {
			combiNo,
			name: String.fromCharCode(...combiBytes.slice(0, 12)),
			bytes: [...combiBytes],
			tones: [
				{bankL: combiBytes[17], bankM: combiBytes[18], prog: combiBytes[19]},
				{bankL: combiBytes[20], bankM: combiBytes[21], prog: combiBytes[22]},
			],
			_addr: addrBase + 24 * combiNo,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(combi.name));
		combis.push(combi);
	});

	return combis;
}

function makeProgTableForSC88Pro(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableMaps[bankL] => mapNo
	console.assert(isValidRegion(memMap.tableMaps));
	const tableMaps = allBytes.slice(...memMap.tableMaps);

	// tableBanks[mapNo][bankM] => bankNo
	console.assert(isValidRegion(memMap.tableBanks));
	const tableBanks = splitArrayByN(allBytes.slice(...memMap.tableBanks), 128);

	// tableToneAddrs[bankNo][prog] => toneAddr
	console.assert(isValidRegion(memMap.tableToneAddrs));
	const tableToneAddrs = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), 3 * 128).map((e) => splitArrayByN(e, 3).map(([b0, b1, b2]) => (b0 << 16) | (b1 << 8) | b2));

	return ((tableMaps, tableBanks, tableToneAddrs) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = tableMaps[bankL];
		if (mapNo === 0xff) {
			return 0xffffff;
		}
		const bankNo = tableBanks[mapNo][bankM];
		if (bankNo === 0xff) {
			return 0xffffff;
		}
		const toneAddr = tableToneAddrs[bankNo][prog];
		if (bankNo >= 0x80 && toneAddr === tableToneAddrs[0][0]) {
			return 0xffffff;
		}
		return toneAddr;
	})(tableMaps, tableBanks, tableToneAddrs);
}

function makeProgTableForSC88(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableBanks[mapNo][bankM] => bankNo
	console.assert(isValidRegion(memMap.tableBanks));
	const tableBanks = splitArrayByN(allBytes.slice(...memMap.tableBanks), 128);

	// tableToneAddrs[bankNo][prog] => toneAddr
	console.assert(isValidRegion(memMap.tableToneAddrs));
	const tableToneAddrs = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), 3 * 128).map((e) => splitArrayByN(e, 3).map(([b0, b1, b2]) => (b0 << 16) | (b1 << 8) | b2));

	return ((tableBanks, tableToneAddrs) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = {0x01: 0, 0x02: 1}[bankL] ?? 0xff;
		if (mapNo === 0xff) {
			return 0xffffff;
		}
		const bankNo = tableBanks[mapNo][bankM];
		if (bankNo === 0xff) {
			return 0xffffff;
		}
		return tableToneAddrs[bankNo][prog];
	})(tableBanks, tableToneAddrs);
}

function makeProgDrumTableForSC88Pro(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableDrumMaps[bankL] => mapNo
	console.assert(isValidRegion(memMap.tableDrumMaps));
	const tableDrumMaps = allBytes.slice(...memMap.tableDrumMaps);

	// tableDrums[mapNo][prog] => drumSetNo
	console.assert(isValidRegion(memMap.tableDrums));
	const tableDrums = splitArrayByN(allBytes.slice(...memMap.tableDrums), 128);

	return ((tableDrumMaps, tableDrums) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = tableDrumMaps[bankL];
		if (mapNo === 0xff) {
			return -1;
		}
		const drumSetNo = tableDrums[mapNo][prog];
		if (drumSetNo === 0xff) {
			return -1;
		}
		return drumSetNo;
	})(tableDrumMaps, tableDrums);
}

function makeProgDrumTableForSC88(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// tableDrums[mapNo][prog] => drumSetNo
	console.assert(isValidRegion(memMap.tableDrums));
	const tableDrums = splitArrayByN(allBytes.slice(...memMap.tableDrums), 128);

	return ((tableDrums) => (prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const mapNo = {0x01: 0, 0x02: 1}[bankL] ?? 0xff;
		if (mapNo === 0xff) {
			return -1;
		}
		const drumSetNo = tableDrums[mapNo][prog];
		if (drumSetNo === 0xff) {
			return -1;
		}
		return drumSetNo;
	})(tableDrums);
}

const seqBankL = [
	...[...new Array(5)].map((_, i) => i).reverse(),	// 4, 3, 2, 1, 0
	...[...new Array(128)].map((_, i) => i).slice(5),	// 5, 6, ..., 127
];

function makePrograms(tablePrograms, json) {
	console.assert(tablePrograms && json);

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
		const addr = tablePrograms(prog, bankM, bankL);
		if (addr === 0xffffff) {
			return null;
		}

		const tone = json.tones.find((tone) => tone._addr === (addr & 0x0fffff));
		let combi;
		if (!tone) {
			combi = json.combis.find((combi) => combi._addr === (addr & 0x0fffff));
		}

		if (tone) {
			const toneNo = tone.toneNo;
			return {
				bankL, prog, bankM,
				toneNo,
				tone: {
					name: tone.name,
					$ref: `#/tones/${toneNo}`,
				},
			};
		} else if (combi) {
			const combiNo = combi.combiNo;
			return {
				bankL, prog, bankM,
				combiNo,
				combi: {
					name: combi.name,
					$ref: `#/combis/${combiNo}`,
				},
			};
		} else {
			verifyData(false);
			return null;
		}
	}
}

function makeProgDrums(tableProgDrums, json) {
	console.assert(tableProgDrums && json);

	const progDrums = [];
	for (const bankL of seqBankL) {
		for (let prog = 0; prog < 128; prog++) {
			const drumNo = tableProgDrums(prog, 0, bankL);
			if (drumNo < 0) {
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
