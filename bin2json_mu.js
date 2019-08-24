import {splitArrayByN} from './bin2json_common.js';

export function binToJsonForMU(bytes, regions) {
	const json = {};

	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones));
	}
//	json.drumSets = makeDrumSets(bytes, regions);

	return json;
}

function makeTones(bytes) {
	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const bits = bytes[index];
		console.assert(bits === 0b0001 || bits === 0b0011 || bits === 0b0111 || bits === 0b1111);
		const numElems = {0b0001: 1, 0b0011: 2, 0b0111: 3, 0b1111: 4}[bits];
		const size = 14 + 84 * numElems;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);
		const voicePackets = splitArrayByN(toneBytes.slice(14), 84);

		const name = String.fromCharCode(...commonBytes.slice(2, 12));

		const tone = {
			toneNo, name,
			commonBytes: [...commonBytes],
			voices: [],
		};

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = (voiceBytes[0] << 8) | voiceBytes[1];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
			};
			tone.voices.push(voice);
		}

		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeDrumSets(bytes, regions) {
	const json = {};

	const drumParamPackets = splitArrayByN(bytes.slice(...regions.drumParams), 42);
	for (let drumParamNo = 0; drumParamNo < drumParamPackets.length; drumParamNo++) {
		const drumParamBytes = drumParamPackets[drumParamNo];
//		const drum
	}

	return json;
}
