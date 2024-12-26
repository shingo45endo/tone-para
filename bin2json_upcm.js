import {splitArrayByN, isValidRange, makeValue2ByteLE, makeValue3ByteLE} from './bin2json_common.js';

export function descrambleRomForUPcm(bytes) {
	console.assert(bytes?.length && bytes.length % 0x80000 === 0);

	const newBytes = new Array(bytes.length);

	for (let addr = 0x00000; addr < bytes.length; addr++) {
		const baseAddr = addr & ~0x7ffff;
		const newAddr = baseAddr | descrambleAddress(addr & 0x7ffff);
		newBytes[newAddr] = descrambleData(bytes[addr]);
	}
	console.assert(newBytes.every((e) => (e !== undefined)));

	return new Uint8Array(newBytes);

	function descrambleAddress(addr) {
		const swapBits = [0, 4, 5, 6, 2, 1, 3, 11, 7, 10, 8, 12, 13, 9, 15, 16, 14, 17, 18];
		let newAddr = 0x00000;
		for (let i = 0; i < swapBits.length; i++) {
			const bit = Number((addr & (1 << i)) !== 0);
			newAddr |= bit << swapBits[i];
		}
		return newAddr;
	}

	function descrambleData(data) {
		return  (Number((data & (1 << 6)) !== 0) << 0) |
				(Number((data & (1 << 4)) !== 0) << 1) |
				(Number((data & (1 << 0)) !== 0) << 2) |
				(Number((data & (1 << 5)) !== 0) << 3) |
				(Number((data & (1 << 3)) !== 0) << 4) |
				(Number((data & (1 << 7)) !== 0) << 5) |
				(Number((data & (1 << 2)) !== 0) << 6) |
				(Number((data & (1 << 1)) !== 0) << 7);
	}
}

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
		const addrBegin = addr & 0x3ffff;
		const sample = {
			sampleNo,
			bytes: [...sampleBytes],
			key:   sampleBytes[8],
			addrBegin,
			sampleLen: makeValue2ByteLE(sampleBytes.slice(3, 5)),
			loopLen:   makeValue2ByteLE(sampleBytes.slice(5, 7)),
			loopMode:  (addr & 0xc0000) >> 22,
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
