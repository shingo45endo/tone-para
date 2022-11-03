import {splitArrayByN, makeAddress4byteBE, removePrivateProp, isValidRange, verifyData} from './bin2json_common.js';

export function binToJsonForNS5R(files, memMap) {
	console.assert(files?.PROG?.length && files?.PCM.length && memMap);

	const json = {};

	// Waves
	console.assert(isValidRange(memMap.waveNames));
	json.waves = makeWaves(files.PCM.slice(...memMap.waveNames));

	// Drum Samples
	console.assert(isValidRange(memMap.drumSamples));
	json.drumSamples = makeDrumSamples(files.PCM.slice(...memMap.drumSamples));

	// Drum Sets
	json.drumSets = makeDrumSets(files.PCM, memMap, json);

	// Drum Tones
	console.assert(isValidRange(memMap.drumTones));
	json.drumTones = makeDrumTones(files.PROG.slice(...memMap.drumTones));

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(files.PROG.slice(...memMap.tones), json);

	// Combinations
	console.assert(isValidRange(memMap.combis));
	json.combis = makeCombis(files.PROG.slice(...memMap.combis), json);

	removePrivateProp(json);

	return json;
}

function makeWaves(bytes) {
	console.assert(bytes?.length);

	const waves = [];
	const waveNamePackets = splitArrayByN(bytes, 10);
	waveNamePackets.forEach((waveNameBytes, waveNo) => {
		const wave = {
			waveNo,
			name: String.fromCharCode(...waveNameBytes),
		};
		verifyData(/^[\x20-\x7f]*$/u.test(wave.name));
		waves.push(wave);
	});

	return waves;
}

function makeDrumSamples(bytes) {
	console.assert(bytes?.length);

	const drumSamples = [];
	const drumSamplePackets = splitArrayByN(bytes, 22);
	drumSamplePackets.forEach((drumSampleBytes, drumSampleNo) => {
		const drumSample = {
			drumSampleNo,
			name: String.fromCharCode(...drumSampleBytes.slice(0, 10)),
//			begin: drumSampleBytes.slice(13, 16).reduce((p, c) => (p << 8) | c, 0),
//			loop:  drumSampleBytes.slice(16, 19).reduce((p, c) => (p << 8) | c, 0),
//			end:   drumSampleBytes.slice(19, 22).reduce((p, c) => (p << 8) | c, 0),
		};
		verifyData(/^[\x20-\x7f]*$/u.test(drumSample.name));
//		verifyData(drumSample.begin < drumSample.end);
//		verifyData(drumSample.begin < drumSample.loop);
//		verifyData(drumSample.loop  <= drumSample.end);
		drumSamples.push(drumSample);
	});

	return drumSamples;
}

function makeDrumSets(pcmBytes, memMap, json) {
	console.assert(pcmBytes?.length && memMap && Array.isArray(json?.drumSamples));

	console.assert(isValidRange(memMap.drumSetNames));
	const drumNames = splitArrayByN(pcmBytes.slice(...memMap.drumSetNames), 10).map((e) => String.fromCharCode(...e));

	console.assert(isValidRange(memMap.tableDrumSets));
	const drumSetsAddrs = splitArrayByN(pcmBytes.slice(...memMap.tableDrumSets), 4).map((e) => makeAddress4byteBE(e) - 0x60000);

	console.assert(isValidRange(memMap.drumNoteParams));
	const [rangeDrumNoteParamsBegin, rangeDrumNoteParamsEnd] = memMap.drumNoteParams;

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumNames.length; drumSetNo++) {
		const drumSet = {
			drumSetNo,
			name: drumNames[drumSetNo],
			notes: {},
		};

		const rangeBegin = drumSetsAddrs[drumSetNo];
		let rangeEnd = drumSetsAddrs[drumSetNo + 1];
		if (rangeEnd < rangeBegin) {
			rangeEnd = rangeDrumNoteParamsEnd;
		}
		if (rangeDrumNoteParamsBegin <= rangeBegin && rangeBegin <= rangeDrumNoteParamsEnd && rangeDrumNoteParamsBegin <= rangeEnd && rangeEnd <= rangeDrumNoteParamsEnd) {
			const notes = {};
			const drumParamPackets = splitArrayByN(pcmBytes.slice(rangeBegin, rangeEnd), 14);
			drumParamPackets.forEach((drumParamBytes, i) => {
				if (/^0,0,0,0,\d+,0,4,0,0,0,0,64,0,0$/u.test(drumParamBytes.map((e) => String(e)).join(','))) {
					return;
				}

				const drumSampleNo = (drumParamBytes[0] << 8) | drumParamBytes[1];
				const note = {
					drumSampleNo,
					bytes: [...drumParamPackets[i]],
					drumSample: {
						name: json.drumSamples[drumSampleNo].name,
						$ref: `#/drumSamples/${drumSampleNo}`,
					},
				};
				const noteNo = 12 + i;
				notes[noteNo] = note;
			});
			drumSet.notes = notes;
		}

		drumSets.push(drumSet);
	}

	return drumSets;
}

function makeDrumTones(bytes) {
	console.assert(bytes?.length);

	const drumTones = [];
	const drumTonePackets = splitArrayByN(bytes, 86);
	drumTonePackets.forEach((drumToneBytes, drumToneNo) => {
		verifyData(drumToneBytes[10] === 2);
		const commonBytes = drumToneBytes.slice(0, 14);
		const voiceBytes = drumToneBytes.slice(14);
		const voice = {
//			waveNo: (voiceBytes[0] << 8) | voiceBytes[1],
			bytes: [...voiceBytes],
		};
		const drumTone = {
			drumToneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 10)),
			commonBytes: [...commonBytes],
			voices: [voice],
			_addr: 0x022e3c + drumToneBytes.length * drumToneNo,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(drumTone.name));
		drumTones.push(drumTone);
	});

	return drumTones;
}

function makeTones(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json.waves) && Array.isArray(json.drumSets));

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const kind = bytes[index + 10];
		verifyData(0 <= kind && kind <= 2);
		const numVoices = (kind === 1) ? 2 : 1;
		const size = 14 + 72 * numVoices;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);

		const voices = [];
		const voicePackets = splitArrayByN(toneBytes.slice(14), 72);
		voicePackets.forEach((voiceBytes) => {
			const no = (voiceBytes[0] << 8) | voiceBytes[1];
			switch (kind) {
			case 0:	// Single Prog
			case 1:	// Double Prog
				{
					const voice = {
						bytes: [...voiceBytes],
						waveNo: no,
						wave: {
							name: json.waves[no].name,
							$ref: `#/waves/${no}`,
						},
					};
					voices.push(voice);
				}
				break;

			case 2:	// Drum
				{
					const voice = {
						bytes: [...voiceBytes],
						drumSetNo: no,
						drumSet: {
							name: json.drumSets[no].name,
							$ref: `#/drumSets/${no}`,
						},
					};
					voices.push(voice);
				}
				break;

			default:
				console.assert(false);
				break;
			}
		});
		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 10)),
			commonBytes: [...commonBytes],
			voices,
			_addr: 0x0238a6 + index,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeCombis(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json.tones) && Array.isArray(json.drumTones));

	const combis = [];
	let index = 0;
	let combiNo = 0;
	while (index < bytes.length) {
		const commonBytes = bytes.slice(index, index + 14);
		index += 14;

		const tones = [];
		for (let i = 0; i < 8; i++) {
			const toneBytes = bytes.slice(index, index + 22);
			const addr = makeAddress4byteBE(toneBytes.slice(14, 18));

			const toneRef = json.tones.find((tone) => tone._addr === addr);
			const drumToneRef = json.drumTones.find((drumTone) => drumTone._addr === addr);

			if (toneRef) {
				const tone = {
					toneNo: toneRef.toneNo,
					tone: {
						name: toneRef.name,
						$ref: `#/tones/${toneRef.toneNo}`,
					},
					bytes: [...toneBytes],
				};
				tones.push(tone);
			} else if (drumToneRef) {
				const drumTone = {
					drumToneNo: drumToneRef.drumToneNo,
					drumTone: {
						name: drumToneRef.name,
						$ref: `#/drumTones/${drumToneRef.drumToneNo}`,
					},
					bytes: [...toneBytes],
				};
				tones.push(drumTone);
			} else {
				verifyData(false);
			}

			index += 22;

			if (makeAddress4byteBE(toneBytes.slice(18)) === 0) {
				break;
			}
		}

		const combi = {
			combiNo,
			name: String.fromCharCode(...commonBytes.slice(0, 10)),
			commonBytes: [...commonBytes],
			progs: tones,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(combi.name));
		combis.push(combi);

		combiNo++;
	}

	return combis;
}
