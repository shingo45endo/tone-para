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

export function decodePcmForUPcm(sample, pcmRomReader, sampleRate = 32000.0, loopSec = 1.0) {
	const bankBase = sample.addrBegin & ~0x3ffff;
	const addrBegin = sample.addrBegin & 0x3ffff;
	const endWord = (addrBegin + sample.sampleLen) >> 2;
	const addrEnd = (endWord << 2) & 0x3ffff;
	const addrLoop = ((endWord - (sample.loopLen >> 2)) << 2) & 0x3ffff;

	const addrRepeat = (addrLoop === addrEnd) ? addrLoop : (addrLoop + 1) & 0x3ffff;
	const needSampleNum = (sample.loopLen > 0) ? Math.trunc(sampleRate * loopSec) : 0;

	const pcms = [];
	let predictor = 0;

	// First pass, from the start to the end
	pushSamples(addrBegin, addrEnd, 1);

	// Loop
	let loopSampleNum = 0;
	while (loopSampleNum < needSampleNum) {
		switch (sample.loopMode) {
		case 0:	// normal loop
			loopSampleNum += pushSamples(addrRepeat, addrEnd, 1);
			break;
		case 1: // no loop
		case 3: // no loop
			loopSampleNum = needSampleNum;
			break;
		case 2:	// ping-pong loop
			loopSampleNum += pushSamples(addrEnd, addrRepeat, -1);
			loopSampleNum += pushSamples(addrRepeat, addrEnd, 1);
			break;
		default:
			console.assert(false);
			break;
		}
	}

	const wave = new Uint16Array(pcms);
	return [makeRiffWaveHeader(wave.byteLength, sampleRate, 16), wave];

	// Decodes the bytes from addrFrom to addrTo (both inclusive) and returns the number of samples.
	function pushSamples(addrFrom, addrTo, step) {
		let sampleNum = 0;
		for (let addr = addrFrom; ; addr = (addr + step) & 0x3ffff) {
			pcms.push(makeSample(addr));
			sampleNum++;
			if (addr === addrTo) {
				return sampleNum;
			}
		}
	}

	// Each byte is a delta in sign-magnitude with a 3-bit exponent and a 4-bit mantissa.
	function getDelta(addr) {
		let dataByte = pcmRomReader(addr);
		if (dataByte >= 0x80) {
			dataByte -= 0x100;
		}
		const sign = Math.sign(dataByte);
		const value = Math.abs(dataByte) & 0x0f;
		const shift = Math.abs(dataByte) >> 4;
		const result = (shift === 0) ? value : (0x10 + value) << (shift - 1);
		return sign * result;
	}

	// The deltas are added up in a 12-bit accumulator, which wraps around.
	function makeSample(addr) {
		predictor = ((predictor + getDelta((sample.bank << 20) | bankBase | addr) + 0x800) & 0xfff) - 0x800;
		const value = predictor * 16;
		console.assert(-32768 <= value && value <= 32767);
		return value;
	}
}

function makeRiffWaveHeader(dataSize, samplesPerSec, bitsPerSample) {
	const header = new ArrayBuffer(44);
	const view = new DataView(header);

	view.setUint32(0, 0x52494646);	// "RIFF"
	view.setUint32(4, 36 + dataSize, true);
	view.setUint32(8, 0x57415645);	// "WAVE"
	view.setUint32(12, 0x666D7420);	// "fmt "
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);	// wFormatTag
	view.setUint16(22, 1, true);	// wChannels
	view.setUint32(24, samplesPerSec, true);	// dwSamplesPerSec
	view.setUint32(28, samplesPerSec * bitsPerSample / 8, true);	// dwAvgBytesPerSec
	view.setUint16(32, bitsPerSample / 8, true);	// wBlockAlign
	view.setUint16(34, bitsPerSample, true);	// wBitsPerSample
	view.setUint32(36, 0x64617461); // "data"
	view.setUint32(40, dataSize, true);

	return header;
}
