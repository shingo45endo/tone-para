export function descrambleRomForScPcm(bytes) {
	console.assert(bytes?.length && bytes.length % 0x100000 === 0);

	const newBytes = new Array(bytes.length);

	for (let addr = 0x000000; addr < bytes.length; addr++) {
		const newAddr = descrambleAddress(addr);
		newBytes[newAddr] = descrambleData(bytes[addr]);
	}
	console.assert(newBytes.every((e) => (e !== undefined)));

	return new Uint8Array(newBytes);

	function descrambleAddress(addr) {
		if (addr < 0x000020) {
			return addr;
		}

		const swapBits = [2, 0, 3, 4, 1, 9, 13, 10, 18, 17, 6, 15, 11, 16, 8, 5, 12, 7, 14, 19, 20];
		let newAddr = 0x000000;
		for (let bit = 0; bit < swapBits.length; bit++) {
			newAddr |= ((addr >> swapBits[bit]) & 1) << bit;
		}
		return newAddr;
	}

	function descrambleData(data) {
		return  (Number((data & (1 << 2)) !== 0) << 0) |
				(Number((data & (1 << 0)) !== 0) << 1) |
				(Number((data & (1 << 4)) !== 0) << 2) |
				(Number((data & (1 << 5)) !== 0) << 3) |
				(Number((data & (1 << 7)) !== 0) << 4) |
				(Number((data & (1 << 6)) !== 0) << 5) |
				(Number((data & (1 << 3)) !== 0) << 6) |
				(Number((data & (1 << 1)) !== 0) << 7);
	}
}

export function decodePcmForSc(sample, pcmRomReader, sampleRate = 32000.0, loopSec = 1.0) {
	const addrBegin = sample.addrBegin;
	const loopBegin = sample.addrBegin + (sample.sampleLen - sample.loopLen);
	const addrEnd = addrBegin + sample.sampleLen;
	console.assert(addrEnd === loopBegin + sample.loopLen);
	const needSampleNum = (sample.loopLen > 0) ? Math.trunc(sampleRate * loopSec) : 0;

	const pcms = [];

	// Attack
	for (let addr = addrBegin; addr < loopBegin; addr++) {
		pcms.push(makeSample(addr));
	}

	// Loop
	let loopSampleNum = 0;
	while (loopSampleNum < needSampleNum) {
		switch (sample.loopMode) {
		case 0:	// normal loop
			for (let addr = loopBegin; addr <= addrEnd; addr++) {
				pcms.push(makeSample(addr));
				loopSampleNum++;
			}
			break;
		case 1:	// ping-pong loop
			for (let addr = loopBegin; addr < addrEnd; addr++) {
				pcms.push(makeSample(addr));
				loopSampleNum++;
			}
			for (let addr = addrEnd; addr > loopBegin; addr--) {
				pcms.push(makeSample(addr));
				loopSampleNum++;
			}
			break;
		case 2:	// no loop
			break;
		default:
			console.assert(false);
		}
	}

	const wave = new Uint32Array(pcms);
	return [makeRiffWaveHeader(wave.byteLength, sampleRate, 32), wave];

	function getSample(addr) {
		let dataByte = pcmRomReader(addr);
		if (dataByte >= 0x80) {
			dataByte -= 0x100;
		}
		console.assert(-128 <= dataByte && dataByte <= 127);
		const shiftByte = pcmRomReader(((addr & 0x0fffff) >> 5) | (addr & 0xf00000));
		const shiftNibble = ((addr & 0x000010) !== 0) ? (shiftByte >> 4) : (shiftByte & 0x0f);
		console.assert(shiftNibble <= 10);
		return dataByte << shiftNibble;
	}

	function makeSample(addr) {
		const value = getSample(addr) << 14;
		console.assert(-2147483648 <= value && value <= 2147483647);
		return value;
	}
}

function makeRiffWaveHeader(dataSize, samplesPerSec, bitsPerSample) {
	const header = new ArrayBuffer(44);
	const view = new DataView(header);

	view.setUint32(0, 0x52494646);	// "RIFF"
	view.setUint32(4, 32 + dataSize, true);
	view.setUint32(8, 0x57415645);	// "WAVE"
	view.setUint32(12, 0x666D7420);	// "fmt "
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);	// wFormatTag
	view.setUint16(22, 1, true);	// wChannels
	view.setUint32(24, samplesPerSec, true);	// dwSamplesPerSec
	view.setUint32(28, dataSize * samplesPerSec / 8, true);	// dwAvgBytesPerSec
	view.setUint16(32, samplesPerSec / 8, true);	// wBlockAlign
	view.setUint16(34, bitsPerSample, true);	// wBitsPerSample
	view.setUint32(36, 0x64617461); // "data"
	view.setUint32(40, dataSize, true);

	return header;
}
