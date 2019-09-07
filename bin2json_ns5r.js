import {splitArrayByN} from './bin2json_common.js';

export function binToJsonForNS5R(bytes, regions) {
	const json = {};

	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones), json);
	}
	if (regions.combis) {
		json.combis = makeCombis(bytes.slice(...regions.combis), json);
	}

	return json;
}

function makeTones(bytes) {
	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const numOscs = (bytes[index + 10] === 1) ? 2 : 1;
		const size = 14 + 72 * numOscs;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);
		const voicePackets = splitArrayByN(toneBytes.slice(14), 72);

		const name = String.fromCharCode(...commonBytes.slice(0, 10));

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

function makeCombis(bytes) {
	const combis = [];
	let index = 0;
	let combiNo = 0;
	while (index < bytes.length) {
		const commonBytes = bytes.slice(index, index + 14);
		const name = String.fromCharCode(...commonBytes.slice(0, 10));

		const combi = {
			combiNo, name,
			commonBytes: [...commonBytes],
			tones: [],
		};

		index += 14;

		for (let i = 0; i < 8; i++) {
			const programBytes = bytes.slice(index, index + 22);
//			const toneAddr = programBytes.slice(14, 18).reduce((p, c, i) => p | (c << ((3 - i) * 8)), 0);
			const tone = {
				bytes: [...programBytes],
			};
			combi.tones.push(tone);

			index += 22;

			if (programBytes.slice(18).reduce((p, c, i) => p | (c << ((3 - i) * 8)), 0) === 0) {
				break;
			}
		}

		combis.push(combi);

		combiNo++;
	}

	return combis;
}
