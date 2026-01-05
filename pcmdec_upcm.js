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
	// TODO: Fix noise when applying loop.
	let loopSampleNum = 0;
	while (loopSampleNum < needSampleNum) {
		switch (sample.loopMode) {
		case 0:	// normal loop
			for (let addr = loopBegin; addr <= addrEnd; addr++) {
				pcms.push(makeSample(addr));
				loopSampleNum++;
			}
			break;
		case 1: // no loop
			break;
		case 2:	// ping-pong loop
			for (let addr = loopBegin; addr < addrEnd; addr++) {
				pcms.push(makeSample(addr));
				loopSampleNum++;
			}
			for (let addr = addrEnd; addr > loopBegin; addr--) {
				pcms.push(makeSample(addr));
				loopSampleNum++;
			}
			break;
		default:
			console.assert(false);
		}
	}

	const wave = new Uint16Array(pcms);
	return [makeRiffWaveHeader(wave.byteLength, sampleRate, 16), wave];

	function getSample(addr) {
		let dataByte = pcmRomReader(addr);
		if (dataByte >= 0x80) {
			dataByte -= 0x100;
		}
		const sign = Math.sign(dataByte);
		const value = Math.abs(dataByte) & 0x0f;
		const shift = Math.abs(dataByte) >> 4;
		const result = (shift === 0) ? value : (0x10 + value) << (shift + 1);
		return sign * result;
	}

	function makeSample(addr) {
		const value =  getSample((sample.bank << 20) | addr);
		console.assert(-32768 <= value && value <= 32767);
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
