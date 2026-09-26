import {splitArrayByN, isValidRange, makeValue2ByteLE, makeValue3ByteLE} from './bin2json_common.js';

export function binToJsonForUPcm(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		samples: null,
		tones: null,
	};

	// Samples
	console.assert(isValidRange(memMap.samples));
	json.samples = makeSamples(allBytes.slice(...memMap.samples));

	// Tones
	console.assert(Array.isArray(memMap.tones));
	json.tones = makeTones(allBytes.slice(...memMap.tones));

	return json;
}

function makeSamples(bytes) {
	console.assert(bytes?.length);

	const samples = [];
	const samplePackets = splitArrayByN(bytes, 10);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const addr = makeValue3ByteLE(sampleBytes.slice(0, 3));
		const addrBegin = addr & 0x7ffff;
		const sample = {
			sampleNo,
			bytes: [...sampleBytes],
			key:   sampleBytes[8],
			isCard: (sampleBytes[2] & 0x08) !== 0,
			bank:   (sampleBytes[2] & 0x30) >> 4,
			addrBegin,
			sampleLen: makeValue2ByteLE(sampleBytes.slice(3, 5)),
			loopLen:   makeValue2ByteLE(sampleBytes.slice(5, 7)),
			loopMode:  (addr & 0xc00000) >> 22,
		};
		samples.push(sample);
	});

	return samples;
}

function makeTones(bytes) {
	console.assert(bytes?.length);

	const tones = [];
	const tonePackets = splitArrayByN(bytes, 80);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 16);
		const toneType = commonBytes[10];

		const voices = [];
		const voicePackets = splitArrayByN(toneBytes.slice(16), 32);
		voicePackets.forEach((voiceBytes, i) => {
			if (i > 0 && [1, 3, 4].every((e) => (toneType !== e))) {
				return;
			}

			const sampleSlots = [];
			for (let i = 0; i < 12; i++) {
				const sampleNo = voiceBytes[i + 11];
				if (sampleNo === 0xff) {
					break;
				}

				const sample = {
					low: (i > 0) ? voiceBytes[i - 1] + 1 : 0,
					high: (voiceBytes[i] !== 0xff) ? voiceBytes[i] : 127,
					sampleNo,
				};
				if (sample.sampleNo >= 0) {
					Object.assign(sample, {
						sampleRef: {
							$ref: `#/samples/${sampleNo}`,
						},
					});
				}
//				console.assert(sample.low <= sample.high);
				sampleSlots.push(sample);
			}

			const voice = {
				bytes: [...voiceBytes],
				sampleSlots,
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 10)),
			commonBytes: [...commonBytes],
			voices,
		};
		tones.push(tone);
	});

	return tones;
}
