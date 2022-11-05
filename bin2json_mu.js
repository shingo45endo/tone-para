import fs from 'fs';

import {splitArrayByN, removePrivateProp, verifyData, isValidRange, makeValue2ByteBE, makeValue4ByteBE} from './bin2json_common.js';

const extraJson = JSON.parse(fs.readFileSync('./mu_waves.json'));

export function binToJsonForMU(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		waves: null,
		tones: null,
		drumSets: null,
		...extraJson,
	};

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(allBytes.slice(...memMap.tones), json);

	// Drum Sets
	json.drumSets = makeDrumSets(allBytes, memMap);

	// Tone Map
	const tableToneMap = makeTableOfToneMap(allBytes, memMap, json);
	for (const kind of ['XGBasic', 'XGNative', 'ModelExcl', 'GS', 'TG300B', 'GM2Basic', 'GM2Native']) {
		if (memMap[`tableTones${kind}`]) {
			json[`toneMaps${kind}`] = makeToneMaps(tableToneMap, json, kind);
		}
	}
	for (const kind of ['SFX']) {
		json[`toneMaps${kind}`] = makeToneMaps(tableToneMap, json, kind);
	}

	removePrivateProp(json);

	return json;
}

function makeTones(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.waves));

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const bits = bytes[index];
		verifyData(bits === 0b0001 || bits === 0b0011 || bits === 0b0111 || bits === 0b1111);
		const numVoices = {0b0001: 1, 0b0011: 2, 0b0111: 3, 0b1111: 4}[bits];
		const size = 14 + 84 * numVoices;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);
		verifyData(commonBytes[12] === 0 && commonBytes[13] === 127);

		const voices = [];
		const voicePackets = splitArrayByN(toneBytes.slice(14), 84);
		voicePackets.forEach((voiceBytes) => {
			const waveNo = (voiceBytes[0] << 7) | voiceBytes[1];
			const voice = {
				bytes: [...voiceBytes],
				waveNo,
				waveRef: {
					$ref: `#/waves/${waveNo}`,
					name: json.waves[waveNo]?.name ?? `(Wave #${waveNo})`,
				},
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(2, 12)),
			commonBytes: [...commonBytes],
			voices,
			_offset: index,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeDrumSets(bytes, memMap) {
	console.assert(bytes?.length && memMap);

	const drumParamPackets = splitArrayByN(bytes.slice(...memMap.drumParams), 42);
	const drumSetsAddrs = splitArrayByN(bytes.slice(...memMap.tableDrumParamAddrs), 4);

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumSetsAddrs.length; drumSetNo++) {
		const addr = makeValue4ByteBE(drumSetsAddrs[drumSetNo]);
		const offsets = splitArrayByN(bytes.slice(addr, addr + 2 * 128), 2);

		const notes = {};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			const offset = makeValue2ByteBE(offsets[noteNo]);
			if (offset === 0xffff) {
				continue;
			}

			const index = offset / 42;
			verifyData(Number.isInteger(index));
			const note = {
				bytes: [...drumParamPackets[index]],
			};
			verifyData(note.bytes[8] === 0 && note.bytes[16] === 64 && note.bytes[17] === 64 && note.bytes[18] === 12 && note.bytes[19] === 54);
			notes[noteNo] = note;
		}

		const drumSet = {
			drumSetNo,
			notes,
		};
		drumSets.push(drumSet);
	}

	// Adds names.
	let drumSetNameAddrs = [];
	for (const kind of ['XG', 'SFX', 'GS', 'TG300B', 'GM2']) {
		const tableDrumParamsRange   = memMap[`tableDrumParams${kind}`];
		const drumSetNamesRange      = memMap[`drumSetNames${kind}`];
		const drumNoteNamesRange     = memMap[`drumNoteNames${kind}`];
		const tableDrumSetNamesRange = memMap[`tableDrumSetNames${kind}`];
		if (!tableDrumParamsRange || !drumSetNamesRange || !drumNoteNamesRange || !tableDrumSetNamesRange) {
			continue;
		}
		console.assert(isValidRange(tableDrumParamsRange) && isValidRange(drumSetNamesRange) && isValidRange(drumNoteNamesRange) && isValidRange(tableDrumSetNamesRange));

		const drumSetNamePackets = splitArrayByN(bytes.slice(...drumSetNamesRange), 12);
		drumSetNameAddrs.push(...drumSetNamePackets.map((e) => makeValue4ByteBE(e.slice(8))), drumSetNamesRange[1]);
		drumSetNameAddrs = [...new Set(drumSetNameAddrs)].sort((a, b) => a - b);

		const tableDrumParams   = bytes.slice(...tableDrumParamsRange);
		const tableDrumSetNames = bytes.slice(...tableDrumSetNamesRange);
		console.assert(tableDrumParams.length === tableDrumSetNames.length);
		for (let i = 0; i < tableDrumSetNames.length; i++) {
			const indexName  = tableDrumSetNames[i];
			const indexParam = tableDrumParams[i];
			const drumSet = drumSets[indexParam];
			if (drumSet.name) {
				continue;
			}

			const drumSetNamePacket = drumSetNamePackets[indexName];
			const name = String.fromCharCode(...drumSetNamePacket.slice(0, 8));
			const addr = makeValue4ByteBE(drumSetNamePacket.slice(8));
			const index = drumSetNameAddrs.indexOf(addr);
			console.assert(index >= 0 && index < drumSetNameAddrs.length - 1);

			const drumNoteNames = splitArrayByN(bytes.slice(drumSetNameAddrs[index], drumSetNameAddrs[index + 1]), 12).map((e) => String.fromCharCode(...e));
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

function makeToneMaps(tableToneMap, json, kind) {
	console.assert(tableToneMap && Array.isArray(json?.tones));

	const silenceToneNos = json.tones.filter((tone) => tone.name === 'Silence   ').map((tone) => tone.toneNo);

	const toneMaps = [];
	if (kind !== 'GS' && kind !== 'TG300B') {
		const bankM = {
			XGBasic:     0,
			XGNative:    0,
			ModelExcl:  48,
			SFX:        64,
			GM2Basic:  121,
			GM2Native: 121,
		}[kind];

		for (let prog = 0; prog < 128; prog++) {
			for (let bankL = 0; bankL < 128; bankL++) {
				const toneNo = tableToneMap(kind, prog, bankM, bankL);
				if ((bankL > 0 && toneNo === tableToneMap(kind, prog, bankM, 0)) || silenceToneNos.includes(toneNo)) {
					continue;
				}
				toneMaps.push(makeToneProg(kind, prog, bankM, bankL));
			}
		}

	} else {
		const bankL = 0;
		for (let prog = 0; prog < 128; prog++) {
			for (let bankM = 0; bankM < 126; bankM++) {
				const toneNo = tableToneMap(kind, prog, bankM, bankL);
				if ((bankM > 0 && toneNo === tableToneMap(kind, prog, 0, bankL)) || silenceToneNos.includes(toneNo)) {
					continue;
				}
				toneMaps.push(makeToneProg(kind, prog, bankM, bankL));
			}
		}
		for (const bankM of [126, 127]) {
			for (let prog = 0; prog < 128; prog++) {
				const toneNo = tableToneMap(kind, prog, bankM, bankL);
				if (silenceToneNos.includes(toneNo)) {
					continue;
				}
				toneMaps.push(makeToneProg(kind, prog, bankM, bankL));
			}
		}
	}

	return toneMaps;

	function makeToneProg(kind, prog, bankM, bankL) {
		const toneNo = tableToneMap(kind, prog, bankM, bankL);
		return {
			bankM, bankL, prog,
			toneNo,
			toneRef: {
				$ref: `#/tones/${toneNo}`,
				name: json.tones[toneNo].name,
			},
		};
	}
}

function makeTableOfToneMap(bytes, memMap, json) {
	console.assert(bytes?.length && memMap && Array.isArray(json?.tones));

	console.assert(isValidRange(memMap.tableToneAddrs));
	const toneTables = splitArrayByN(bytes.slice(...memMap.tableToneAddrs), 512).map((packet) => splitArrayByN(packet, 4).map((e) => {
		const offset = makeValue4ByteBE(e) * 2;
		const tone = json.tones.filter((tone) => offset === tone._offset);
		verifyData(tone.length === 1);
		return tone[0].toneNo;
	}));

	console.assert(isValidRange(memMap.tableTonesMsb));
	const tableBanksMsb = bytes.slice(...memMap.tableTonesMsb);
	const tables = Object.entries(memMap).filter(([key, _]) => key.startsWith('tableTones')).reduce((p, [key, value]) => {
		p[key] = bytes.slice(...value);
		return p;
	}, {});

	return (kind, prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const tableBanks = tables[`tableTones${kind}`];
		if (kind !== 'GS' && kind !== 'TG300B') {
			if (bankM === 0 || bankM === 48 || bankM === 121) {
				console.assert(tableBanks);
				return toneTables[tableBanks[bankL]][prog];
			} else {
				return toneTables[tableBanksMsb[bankM]][prog];	// Ignores LSB
			}
		} else {
			console.assert(tableBanks);
			return toneTables[tableBanks[bankM]][prog];	// Ignores MSB
		}
	};
}
