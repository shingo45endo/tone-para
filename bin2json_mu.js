import {splitArrayByN} from './bin2json_common.js';

export function binToJsonForMU(bytes, regions) {
	const json = {};

	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones));
	}
	if (regions.drumParams && regions.tableDrumParamAddr) {
		json.drumSets = makeDrumSets(bytes, regions);
	}

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
	const drumParamPackets = splitArrayByN(bytes.slice(...regions.drumParams), 42);
	const drumSetsAddrs = splitArrayByN(bytes.slice(...regions.tableDrumParamAddr), 4);

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumSetsAddrs.length; drumSetNo++) {
		const addr = drumSetsAddrs[drumSetNo].reduce((p, c, i) => p | (c << ((3 - i) * 8)), 0);
		const offsets = splitArrayByN(bytes.slice(addr, addr + 2 * 128), 2);

		const drumSet = {
			drumSetNo,
			notes: {},
		};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			const offset = (offsets[noteNo][0] << 8) | offsets[noteNo][1];
			if (offset === 0xffff) {
				continue;
			}

			const index = offset / 42;
			console.assert(Number.isInteger(index));
			const note = {
				bytes: [...drumParamPackets[index]],
			};
			drumSet.notes[noteNo] = note;
		}

		drumSets.push(drumSet);
	}

	let drumKitNameAddrs = [];
	for (const kind of ['XG', 'SFX', 'GS', 'GM2']) {
		const regionsTableDrumParam   = regions[`tableDrumParam${kind}`];
		const regionsDrumKitNames     = regions[`drumKitNames${kind}`];
		const regionsDrumNoteNames    = regions[`drumNoteNames${kind}`];
		const regionsTableDrumKitName = regions[`tableDrumKitName${kind}`];
		if (!regionsTableDrumParam || !regionsDrumKitNames || !regionsDrumNoteNames || !regionsTableDrumKitName) {
			continue;
		}

		const drumKitNamePackets = splitArrayByN(bytes.slice(...regionsDrumKitNames), 12);
		drumKitNameAddrs.push(...drumKitNamePackets.map((e) => e.slice(8).reduce((p, c, i) => p | (c << ((3 - i) * 8)), 0)), regionsDrumKitNames[1]);
		drumKitNameAddrs = [...new Set(drumKitNameAddrs)].sort((a, b) => a - b);

		const tableDrumParam   = bytes.slice(...regionsTableDrumParam);
		const tableDrumKitName = bytes.slice(...regionsTableDrumKitName);
		console.assert(tableDrumParam.length === tableDrumKitName.length);
		for (let i = 0; i < tableDrumKitName.length; i++) {
			const indexName  = tableDrumKitName[i];
			const indexParam = tableDrumParam[i];
			const drumSet = drumSets[indexParam];
			if (drumSet.name) {
				continue;
			}

			const drumSetNamePacket = drumKitNamePackets[indexName];
			const name = String.fromCharCode(...drumSetNamePacket.slice(0, 8));
			const addr = drumSetNamePacket.slice(8).reduce((p, c, i) => p | (c << ((3 - i) * 8)), 0);
			const index = drumKitNameAddrs.indexOf(addr);
			console.assert(index >= 0 && index < drumKitNameAddrs.length - 1);

			const drumNoteNames = splitArrayByN(bytes.slice(drumKitNameAddrs[index], drumKitNameAddrs[index + 1]), 12).map((e) => String.fromCharCode(...e));
			for (const key of Object.keys(drumSet.notes)) {
				if (!drumSet.notes[key].name) {
					const offset = {XG: 13, SFX: 13, GS: 25, GM2: 25}[kind];
					drumSet.notes[key].name = drumNoteNames[Number(key) - offset];
				}
			}

			drumSet.name = name;
		}
	}

	return drumSets;
}
