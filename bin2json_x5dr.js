import {splitArrayByN, addNamesFromRefs, isValidRange, verifyData, makeValue2ByteLE, makeValue3ByteLE} from './bin2json_common.js';

export function binToJsonForX5DR(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		samples: null,
		drumSamples: null,
		waves: null,
	};

	// Samples
	console.assert(isValidRange(memMap.samples));
	json.samples = makeSamples(allBytes.slice(...memMap.samples));

	// Drum Samples
	console.assert(isValidRange(memMap.drumSamples));
	json.drumSamples = makeDrumSamples(allBytes.slice(...memMap.drumSamples));

	// Waves
	console.assert(isValidRange(memMap.waves));
	json.waves = makeWaves(allBytes.slice(...memMap.waves), json);

	// Tones
	for (const kind of ['A', 'B', 'GM']) {
		const tonesRegion = memMap[`tones${kind}`];
		if (tonesRegion) {
			json[`tones${kind}`] = makeTones(allBytes.slice(...tonesRegion));
		}
	}

	// Combinations
	for (const kind of ['A', 'B']) {
		const combisRegion = memMap[`combis${kind}`];
		if (combisRegion) {
			json[`combis${kind}`] = makeCombis(allBytes.slice(...combisRegion), kind);
		}
	}

	addNamesFromRefs(json);

	return json;
}

function makeSamples(bytes) {
	console.assert(bytes?.length);

	const samples = [];
	const samplePackets = splitArrayByN(bytes, 22);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const sample = {
			sampleNo,
			addrBegin: makeValue3ByteLE(sampleBytes.slice(13, 16)),
			addrLoop:  makeValue3ByteLE(sampleBytes.slice(16, 19)),
			addrEnd:   makeValue3ByteLE(sampleBytes.slice(19, 22)),
		};
		verifyData(sample.addrBegin < sample.addrEnd);
		verifyData(sample.addrBegin < sample.addrLoop);
		verifyData(sample.addrLoop <= sample.addrEnd);
		samples.push(sample);
	});

	return samples;
}

function makeDrumSamples(bytes) {
	console.assert(bytes?.length);

	const drumSamples = [];
	const drumSamplePackets = splitArrayByN(bytes, 22);
	drumSamplePackets.forEach((drumSampleBytes, drumSampleNo) => {
		const drumSample = {
			drumSampleNo,
			name: String.fromCharCode(...drumSampleBytes.slice(0, 10)),
			addrBegin: makeValue3ByteLE(drumSampleBytes.slice(13, 16)),
			addrLoop:  makeValue3ByteLE(drumSampleBytes.slice(16, 19)),
			addrEnd:   makeValue3ByteLE(drumSampleBytes.slice(19, 22)),
		};
		verifyData(/^[\x20-\x7f]*$/u.test(drumSample.name));
		verifyData(drumSample.addrBegin < drumSample.addrEnd);
		verifyData(drumSample.addrBegin < drumSample.addrLoop);
		verifyData(drumSample.addrLoop <= drumSample.addrEnd);
		drumSamples.push(drumSample);
	});

	return drumSamples;
}

function makeWaves(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.samples));

	const waves = [];
	let sampleIndex = 0;
	const wavePackets = splitArrayByN(bytes, 16);
	wavePackets.forEach((waveBytes, waveNo) => {
		const sampleNum = (sampleIndex < json.samples.length) ? waveBytes[5] : 0;
		const sampleSlots = json.samples.slice(sampleIndex, sampleIndex + sampleNum).map((sample) => ({
			sampleNo: sample.sampleNo,
			sampleRef: {
				$ref: `#/samples/${sample.sampleNo}`,
			},
		}));
		sampleIndex += sampleNum;
		verifyData(sampleIndex <= json.samples.length);

		const wave = {
			waveNo,
			name: String.fromCharCode(...waveBytes.slice(6, 16)),
			sampleSlots,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(wave.name));
		waves.push(wave);
	});

	return waves;
}

function makeTones(bytes) {
	console.assert(bytes?.length);

	const tones = [];
	const tonePackets = splitArrayByN(bytes, 164);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 40);
		const kind = commonBytes[10];
		const voiceNum = (kind === 0x01) ? 2 : 1;
		const voices = [];
		for (let i = 0; i < voiceNum; i++) {
			const voice = {
				octave: commonBytes[14 + i * 3],
				bytes: [...toneBytes.slice(40 + i * 47, 87 + i * 47)],
			};

			const no = makeValue2ByteLE(commonBytes.slice(12 + i * 3, 12 + i * 3 + 2));
			switch (kind) {
			case 0:	// Single Prog
			case 1:	// Double Prog
				Object.assign(voice, {
					waveNo: no,
					waveRef: {
						$ref: `#/waves/${no}`,
					},
				});
				break;

			case 2:	// Drum
				Object.assign(voice, {
					drumSetNo: no,
//					drumSetRef: {
//						$ref: `#/drumSets/${no}`,
//					},
				});
				break;

			default:
				console.assert(false);
				break;
			}

			voices.push(voice);
		}

		const tone = {
			toneNo,
			name: String.fromCharCode(...toneBytes.slice(0, 10)),
			commonBytes,
			effectBytes: toneBytes.slice(135, 164),
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);
	});

	return tones;
}

function makeCombis(bytes, kind) {
	console.assert(bytes?.length);

	const combis = [];
	const combiPackets = splitArrayByN(bytes, 136);
	combiPackets.forEach((combiBytes, combiNo) => {
		const toneSlots = [];
		const toneSlotPackets = splitArrayByN(combiBytes.slice(40), 12);
		toneSlotPackets.forEach((toneSlotBytes) => {
			if ((toneSlotBytes[11] & 0x10) !== 0) {
				return;
			}

			const toneNo = toneSlotBytes[0];
			const toneKind = (((toneSlotBytes[10] & 0xc0) >> 6) === 0) ? kind : 'GM';
			const tone = {
				bytes: [...toneSlotBytes],
				toneNo,
				toneRef: {
					$ref: `#/tones${toneKind}/${toneNo}`,
				},
			};
			toneSlots.push(tone);
		});

		const combi = {
			combiNo,
			name: String.fromCharCode(...combiBytes.slice(0, 10)),
			effectBytes: combiBytes.slice(11, 40),
			toneSlots,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(combi.name));
		combis.push(combi);
	});

	return combis;
}
