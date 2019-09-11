import {splitArrayByN, makeAddress4byteBE} from './bin2json_common.js';

export function binToJsonForNS5R(files, regions) {
	const json = {};

	if (files.PCM && regions.multiSamples) {
		json.toneWaves = makeMultiSamples(files.PCM.slice(...regions.multiSamples), json);
	}
	if (files.PCM && regions.drumSamples) {
		json.drumWaves = makeDrumSamples(files.PCM.slice(...regions.drumSamples), json);
	}
	if (files.PCM && regions.drumNoteParams) {
		json.drumSets = makeDrumSets(files.PCM, regions, json);
	}
	if (files.PROG && regions.drums) {
		json.drums = makeDrums(files.PROG.slice(...regions.drums), json);
	}
	if (files.PROG && regions.tones) {
		json.tones = makeTones(files.PROG.slice(...regions.tones), json);
	}
	if (files.PROG && regions.combis) {
		json.combis = makeCombis(files.PROG.slice(...regions.combis), json);
	}

	return json;
}

function makeMultiSamples(bytes) {
	const samplePackets = splitArrayByN(bytes, 10);
	return samplePackets.map((e, i) => ({toneWaveNo: i, name: String.fromCharCode(...e)}));
}

function makeDrumSamples(bytes) {
	const samplePackets = splitArrayByN(bytes, 22);
	return samplePackets.map((e, i) => ({drumWaveNo: i, name: String.fromCharCode(...e.slice(0, 10))}));
}

function makeDrumSets(bytes, regions, json) {
	const drumNames = splitArrayByN(bytes.slice(...regions.drumKitNames), 10).map((e) => String.fromCharCode(...e));
	const drumSetsAddrs = splitArrayByN(bytes.slice(...regions.tableDrumKits), 4).map((e) => makeAddress4byteBE(e) - 0x60000);

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumNames.length; drumSetNo++) {
		const drumSet = {
			drumSetNo,
			name: drumNames[drumSetNo],
			notes: {},
		};

		const addrBegin = drumSetsAddrs[drumSetNo];
		const addrEnd   = drumSetsAddrs[drumSetNo + 1];
		if (regions.drumNoteParams[0] <= addrBegin && addrBegin < regions.drumNoteParams[1] && regions.drumNoteParams[0] <= addrEnd && addrEnd < regions.drumNoteParams[1]) {
			const drumParamPackets = splitArrayByN(bytes.slice(addrBegin, addrEnd), 14);
			for (let i = 0; i < drumParamPackets.length; i++) {
				const drumParamPacket = drumParamPackets[i];
				if (/^0,0,0,0,\d+,0,4,0,0,0,0,64,0,0$/u.test(drumParamPacket.map((e) => String(e)).join(','))) {
					continue;
				}
				const noteNo = 12 + i;
				const drumWaveNo = (drumParamPacket[0] << 8) | drumParamPacket[1];
				const note = {
					drumWaveNo,
					bytes: [...drumParamPackets[i]],
					drumWave: {
						name: json.drumWaves[drumWaveNo].name,
						$ref: `#/drumWaves/${drumWaveNo}`,
					},
				};
				drumSet.notes[noteNo] = note;
			}
		}

		drumSets.push(drumSet);
	}

	return drumSets;
}

const addrMap = new Map();

function makeDrums(bytes) {
	const drumPackets = splitArrayByN(bytes, 86);
	const drums = [];
	for (let drumNo = 0; drumNo < drumPackets.length; drumNo++) {
		const drumBytes = drumPackets[drumNo];
		console.assert(drumBytes[10] === 2);

		const commonBytes = drumBytes.slice(0, 14);
		const voiceBytes = drumBytes.slice(14);
		const name = String.fromCharCode(...commonBytes.slice(0, 10));

		const drum = {
			drumNo, name,
			commonBytes: [...commonBytes],
			voices: [
				{
//					waveNo: (voiceBytes[0] << 8) | voiceBytes[1],
					bytes: [...voiceBytes],
				},
			],
		};
		addrMap.set(0x022e3c + drumNo * drumBytes.length, {drumNo, drum: {name, $ref: `#/drums/${drumNo}`}});

		drums.push(drum);
	}

	return drums;
}

function makeTones(bytes, json) {
	console.assert(json && json.toneWaves);
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
		addrMap.set(0x0238a6 + index, {toneNo, tone: {name, $ref: `#/tones/${toneNo}`}});

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const toneWaveNo = (voiceBytes[0] << 8) | voiceBytes[1];
			const voice = {
				toneWaveNo,
				bytes: [...voiceBytes],
				toneWave: {
					name: json.toneWaves[toneWaveNo].name,
					$ref: `#/toneWaves/${toneWaveNo}`,
				},
			};
			tone.voices.push(voice);
		}

		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeCombis(bytes, json) {
	console.assert(json && json.tones);
	const combis = [];
	let index = 0;
	let combiNo = 0;
	while (index < bytes.length) {
		const commonBytes = bytes.slice(index, index + 14);
		const name = String.fromCharCode(...commonBytes.slice(0, 10));

		const combi = {
			combiNo, name,
			commonBytes: [...commonBytes],
			progs: [],
		};

		index += 14;

		for (let i = 0; i < 8; i++) {
			const programBytes = bytes.slice(index, index + 22);
			const progAddr = makeAddress4byteBE(programBytes.slice(14, 18));
			const toneOrDrum = addrMap.get(progAddr);

			const prog = {
				...toneOrDrum,
				bytes: [...programBytes],
			};
			combi.progs.push(prog);

			index += 22;

			if (makeAddress4byteBE(programBytes.slice(18)) === 0) {
				break;
			}
		}

		combis.push(combi);

		combiNo++;
	}

	return combis;
}
