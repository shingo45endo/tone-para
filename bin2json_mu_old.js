import {splitArrayByN, removePrivateProp, addNamesFromRefs, verifyData, isValidRange, makeValue2ByteBE, makeValue4ByteBE} from './bin2json_common.js';
import {waveNamesMU} from './mu_waves.js';

function convertVoicePacketForMU90AndMU100(bytes) {
	return [
		bytes[0],
		bytes[0 + 1] & 0b01111111,
		bytes[1 + 1],
		bytes[2 + 1],
		bytes[3 + 1],
		bytes[4 + 1],
		bytes[6 + 1] >> 7,
		bytes[5 + 1] >> 6,
		bytes[7 + 1] >> 7,
		bytes[5 + 1] & 0b00111111,
		bytes[6 + 1] & 0b01111111,
		bytes[7 + 1] & 0b01111111,
		bytes[8 + 1] & 0b00111111,
		bytes[9 + 1] & 0b00001111,
		bytes[10 + 1] & 0b00011111,
		bytes[11 + 1],
		bytes[12 + 1],
		bytes[10 + 1] >> 5,
		bytes[13 + 1],
		bytes[8 + 1] >> 6,
		(bytes[9 + 1] >> 4) + 57,
		(bytes[14 + 1] >> 4) + 57,
		(bytes[14 + 1] & 0b00001111) + 57,
		bytes[15 + 1],
		bytes[16 + 1],
		bytes[17 + 1],
		bytes[18 + 1],
		bytes[19 + 1],
		bytes[20 + 1],
		bytes[21 + 1],
		bytes[22 + 1],
		bytes[23 + 1],
		bytes[24 + 1],
		bytes[25 + 1],
		bytes[26 + 1],
		bytes[27 + 1],
		bytes[28 + 1],
		bytes[29 + 1],
		bytes[30 + 1],
		bytes[31 + 1],
		bytes[32 + 1],
		bytes[33 + 1],
		bytes[34 + 1],
		bytes[35 + 1],
		(bytes[36 + 1] >> 4) + 57,
		(bytes[36 + 1] & 0b00001111) + 57,
		(bytes[37 + 1] & 0b00001111) + 57,
		bytes[38 + 1],
		bytes[39 + 1],
		bytes[40 + 1],
		bytes[41 + 1],
		bytes[42 + 1],
		bytes[43 + 1],
		bytes[44 + 1],
		bytes[45 + 1],
		bytes[46 + 1],
		bytes[47 + 1],
		bytes[48 + 1],
		bytes[49 + 1],
		bytes[50 + 1],
		bytes[51 + 1],
		bytes[52 + 1],
		bytes[53 + 1],
		bytes[54 + 1],
		bytes[55 + 1],
		bytes[56 + 1],
		bytes[37 + 1] >> 4,
		bytes[57 + 1] & 0b00001111,
		(bytes[57 + 1] >> 4) + 57,
		bytes[58 + 1],
		bytes[59 + 1] & 0x0f,
		bytes[60 + 1],
		bytes[61 + 1],
		bytes[62 + 1],
		bytes[63 + 1],
		bytes[64 + 1],
		bytes[65 + 1],
		bytes[66 + 1],
		bytes[67 + 1],
		(bytes[59 + 1] >> 4) + 57,
		bytes[69],
	];
}

function convertVoicePacketForMU80(bytes) {
	return [
		bytes[0] >> 7,
		bytes[0] & 0b01111111,
		bytes[1],
		bytes[2],
		bytes[3],
		bytes[4],
		bytes[6] >> 7,
		bytes[5] >> 6,
		bytes[7] >> 7,
		bytes[5] & 0b00111111,
		bytes[6] & 0b01111111,
		bytes[7] & 0b01111111,
		bytes[8] & 0b00111111,
		bytes[9] & 0b00001111,
		bytes[10] & 0b00011111,
		bytes[11],
		bytes[12],
		bytes[10] >> 5,
		bytes[13],
		bytes[8] >> 6,
		(bytes[9] >> 4) + 57,
		(bytes[14] >> 4) + 57,
		(bytes[14] & 0b00001111) + 57,
		bytes[15],
		bytes[16],
		bytes[17],
		bytes[18],
		bytes[19],
		bytes[20],
		bytes[21],
		bytes[22],
		bytes[23],
		bytes[24],
		bytes[25],
		bytes[26],
		bytes[27],
		bytes[28],
		bytes[29],
		bytes[30],
		bytes[31],
		bytes[32],
		bytes[33],
		bytes[34],
		bytes[35],
		(bytes[36] >> 4) + 57,
		(bytes[36] & 0b00001111) + 57,
		(bytes[37] & 0b00001111) + 57,
		bytes[38],
		bytes[39],
		bytes[40],
		bytes[41],
		bytes[42],
		bytes[43],
		bytes[44],
		bytes[45],
		bytes[46],
		bytes[47],
		bytes[48],
		bytes[49],
		bytes[50],
		bytes[51],
		bytes[52],
		bytes[53],
		bytes[54],
		bytes[55],
		bytes[56],
		bytes[37] >> 4,
		bytes[57] & 0b00001111,
		(bytes[57] >> 4) + 57,
		bytes[58],
		bytes[59] & 0x0f,
		bytes[60],
		bytes[61],
		bytes[62],
		bytes[63],
		bytes[64],
		bytes[65],
		bytes[66],
		bytes[67],
		(bytes[59] >> 4) + 57,
	];
}

function convertCommonBytesForMU80OrLater(bytes) {
	const commonBytes = [...bytes];
	commonBytes[0] = {0: 0b01, 1: 0b11}[bytes[0]];
	return commonBytes;
}

export const [binToJsonForMU100, binToJsonForMU90, binToJsonForMU80, binToJsonForMU50] = [
	// MU100
	{
		convertCommonBytes: convertCommonBytesForMU80OrLater,
		convertVoicePacket: convertVoicePacketForMU90AndMU100,
		addDrumSetNames: addDrumSetNamesForMU90AndMU100,
		addDrumNoteNames: addDrumNoteNamesForMU90AndMU100,
		voicePacketSize: 70,
		drumParamPacketSize: 42,
		addrSize: 4,
		additionalMaps: ['SFX'],
		additionalTables: {
			tableDrumNoteNamesXG: [
				31,	// Skim Kit
				32,	// Slim Kit
				36,	// RogueKit
				37,	// Hob Kit
				38,	// ApogeeKt
				39,	// PergeeKt
				40,	// BrshKit2
				33,	// TrampKit
				34,	// AmberKit
				35,	// CoffinKt
				 8,	// SFXKit 1
				 9,	// SFXKit 2
				41,	// TknoKtKS
				42,	// TknoKtHi
				43,	// TknoKtLo
				44,	// SakuraKt
				45,	// SlatinKt
				46,	// StndKit#
				 0,	// StandKit
				11,	// StndKit2
				12,	// Dry Kit
				17,	// BriteKit
				 1,	// Room Kit
				18,	// DarKRKit
				 2,	// Rock Kit
				19,	// RockKit2
				 3,	// ElctrKit
				 4,	// AnalgKit
				14,	// AnlgKit2
				16,	// DanceKit
				15,	// HipHpKit
				13,	// JunglKit
				 5,	// Jazz Kit
				20,	// JazzKit2
				 6,	// BrushKit
				 7,	// SymphKit
			],
			tableDrumNoteNamesTG300B: [
				21,	// StandKit
				22,	// Room Kit
				23,	// PowerKit
				24,	// ElctrKit
				25,	// AnalgKit
				26,	// Jazz Kit
				27,	// BrushKit
				28,	// OrcheKit
				30,	// SFX Set
				29,	// C/M Kit
			],
		},
	},
	// MU90
	{
		convertCommonBytes: convertCommonBytesForMU80OrLater,
		convertVoicePacket: convertVoicePacketForMU90AndMU100,
		addDrumSetNames: addDrumSetNamesForMU90AndMU100,
		addDrumNoteNames: addDrumNoteNamesForMU90AndMU100,
		voicePacketSize: 70,
		drumParamPacketSize: 42,
		addrSize: 2,
		additionalMaps: ['SFX'],
		additionalTables: {
			tableDrumSetNamesSFX: [
				0x12, 0x13, ...(new Array(126)).fill(0x00),
			],
			tableDrumNoteNamesXG: [
				0,	// StandKit
				11,	// StndKit2
				12,	// Dry Kit
				17,	// BriteKit
				 1,	// Room Kit
				18,	// DarKRKit
				 2,	// Rock Kit
				19,	// RockKit2
				 3,	// ElctrKit
				 4,	// AnalgKit
				14,	// AnlgKit2
				16,	// DanceKit
				15,	// HipHpKit
				13,	// JunglKit
				 5,	// Jazz Kit
				20,	// JazzKit2
				 6,	// BrushKit
				 7,	// SymphKit
				 8,	// SFXKit 1
				 9,	// SFXKit 2
				10,	// (StandKit)
			],
			tableDrumNoteNamesTG300B: [
				21,	// StandKit
				22,	// Room Kit
				23,	// PowerKit
				24,	// ElctrKit
				25,	// AnalgKit
				26,	// Jazz Kit
				27,	// BrushKit
				28,	// OrcheKit
				30,	// SFX Set
				29,	// C/M Kit
			],
		},
	},
	// MU80
	{
		convertCommonBytes: convertCommonBytesForMU80OrLater,
		convertVoicePacket: convertVoicePacketForMU80,
		addDrumSetNames: addDrumSetNamesForMU80OrLater,
		addDrumNoteNames: addDrumNoteNamesForMU80OrLater,
		voicePacketSize: 68,
		drumParamPacketSize: 30,
		addrSize: 2,
		additionalMaps: ['SFX'],
	},
	// MU50
	{
		convertCommonBytes: (bytes) => {
			const commonBytes = [...bytes];
			commonBytes[0] = bytes[1];
			commonBytes[1] = bytes[0];
			return commonBytes;
		},
		addDrumSetNames: addDrumSetNamesForMU80OrLater,
		addDrumNoteNames: addDrumNoteNamesForMU80OrLater,
		voicePacketSize: 80,
		drumParamPacketSize: 30,
		addrSize: 2,
		additionalMaps: ['SFX', 'DOC'],
	},
].map((props) => {
	return (allBytes, memMap) => {
		console.assert(allBytes?.length && memMap);

		const json = {
			waves: waveNamesMU.map((name, waveNo) => ({waveNo, name})),
			tones: null,
			drumSets: null,
		};

		// Tones
		console.assert(isValidRange(memMap.tones));
		json.tones = makeTones(allBytes.slice(...memMap.tones), props, json);

		// Drum Sets
		json.drumSets = makeDrumSets(allBytes, memMap, props);

		// Tone Map
		const tableToneMap = makeTableOfToneMap(allBytes, memMap, json, props.addrSize);
		for (const kind of ['XGBasic', 'XGNative', 'ModelExcl', 'TG300B']) {
			if (memMap[`tableTones${kind}`]) {
				json[`toneMaps${kind}`] = makeToneMaps(tableToneMap, json, kind);
			}
		}
		for (const kind of props.additionalMaps) {
			json[`toneMaps${kind}`] = makeToneMaps(tableToneMap, json, kind);
		}

		// Drum Map
		for (const kind of ['XG', 'XGBasic', 'XGNative', 'SFX', 'TG300B']) {
			const key = `tableDrums${kind}`;
			if (memMap[key]) {
				console.assert(isValidRange(memMap[key]));
				json[`drumMaps${kind}`] = makeDrumMaps(allBytes.slice(...memMap[key]), json, kind);
			}
		}

		removePrivateProp(json);
		addNamesFromRefs(json);

		return json;
	};
});

function makeTones(bytes, props, json) {
	console.assert(bytes?.length && props && Array.isArray(json?.waves));

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const commonBytes = convertCommonBytes(bytes.slice(index, index + 10));
		const bits = commonBytes[0x00];
		verifyData(bits === 0b01 || bits === 0b11);
		const numVoices = {0b01: 1, 0b11: 2}[bits];

		const voices = [];
		const voicePackets = splitArrayByN(bytes.slice(index + 10, index + 10 + props.voicePacketSize * numVoices), props.voicePacketSize).map((voicePacket) => convertVoicePacket(voicePacket));
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
			name: String.fromCharCode(...commonBytes.slice(2, 10)),
			commonBytes: [...commonBytes],
			voices,
			_offset: index,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);

		index += 10 + props.voicePacketSize * numVoices;
		toneNo++;
	}

	return tones;

	function convertCommonBytes(bytes) {
		return (props.convertCommonBytes) ? props.convertCommonBytes(bytes) : bytes;
	}
	function convertVoicePacket(bytes) {
		return (props.convertVoicePacket) ? props.convertVoicePacket(bytes) : bytes;
	}
}

function makeDrumSets(allBytes, memMap, props) {
	console.assert(allBytes?.length && memMap && props);

	console.assert(isValidRange(memMap.drumParams));
	const drumParamPackets = splitArrayByN(allBytes.slice(...memMap.drumParams), props.drumParamPacketSize);

	console.assert(isValidRange(memMap.tableDrumNotes));
	const tableDrumNoteAddrs = splitArrayByN(allBytes.slice(...memMap.tableDrumNotes), 256).map((bytes) => splitArrayByN(bytes, 2).map((e) => makeValue2ByteBE(e)));
	const drumParamIndices = tableDrumNoteAddrs.map((addrs) => addrs.map((addr) => (addr !== 0xffff) ? addr / props.drumParamPacketSize : -1));

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < tableDrumNoteAddrs.length; drumSetNo++) {
		const drumNoteParams = drumParamIndices[drumSetNo].map((index) => (index >= 0) ? drumParamPackets[index] : null);

		const notes = {};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			if (!drumNoteParams[noteNo]) {
				continue;
			}
			const note = {
				bytes: [...drumNoteParams[noteNo]],
				_index: drumParamIndices[drumSetNo][noteNo],
			};
			notes[noteNo] = note;
		}

		const drumSet = {
			drumSetNo,
			name: `(Drum Set #${drumSetNo})`,
			notes,
		};
		drumSets.push(drumSet);
	}

	// Adds names.
	props.addDrumSetNames(allBytes, memMap, props, drumSets);
	props.addDrumNoteNames(allBytes, memMap, props, drumSets);

	return drumSets;
}

function addDrumSetNamesForMU90AndMU100(allBytes, memMap, props, drumSets) {
	console.assert(allBytes?.length && memMap && props && Array.isArray(drumSets));

	for (const kind of ['XG', 'XGBasic', 'XGNative', 'SFX', 'TG300B']) {
		const drumSetNamesRange = memMap[`drumSetNames${kind}`] ?? memMap[`drumSetNames${kind.replace(/(Basic|Native)$/u, '')}`] ?? memMap[`drumSetNames${kind.replace(/SFX$/u, 'XGBasic')}`] ?? memMap[`drumSetNames${kind.replace(/SFX$/u, 'XG')}`];
		if (!drumSetNamesRange) {
			continue;
		}
		const drumSetNames = splitArrayByN(allBytes.slice(...drumSetNamesRange), 8).map((e) => String.fromCharCode(...e));

		const tableDrumsRange = memMap[`tableDrums${kind}`] ?? memMap[`tableDrums${kind.replace(/(Basic|Native)$/u, '')}`];
		const tableDrums = allBytes.slice(...tableDrumsRange);

		const key = `tableDrumSetNames${kind.replace(/(Basic|Native)$/u, '')}`;
		const tableDrumSetNames = (memMap[key]) ? allBytes.slice(...memMap[key]) : props.additionalTables?.[key];
		if (!tableDrumSetNames) {
			continue;
		}

		drumSets.forEach((drumSet, drumSetNo) => {
			const prog = tableDrums.indexOf(drumSetNo);
			const nameIndex = tableDrumSetNames[prog];
			const name = drumSetNames[nameIndex];
			verifyData(/^[\x20-\x7f]*$/u.test(name));
			if (name) {
				drumSet.name = name;
			}
		});
	}
}

function addDrumSetNamesForMU80OrLater(allBytes, memMap, _, drumSets) {
	console.assert(allBytes?.length && memMap && Array.isArray(drumSets));

	const tableDrumSetNames = [
		13,	// No.00: StandKit
		14,	// No.01: Room Kit
		15,	// No.02: PowerKit
		16,	// No.03: ElectKit
		17,	// No.04: AnalgKit
		18,	// No.05: Jazz Kit
		19,	// No.06: BrushKit
		20,	// No.07: OrcheKit
		22,	// No.08: C/M Kit
		21,	// No.09: SFX Set
		 0,	// No.10: StandKit
		 2,	// No.11: Room Kit
		 3,	// No.12: Rock Kit
		 4,	// No.13: ElectKit
		 5,	// No.14: AnalgKit
		 6,	// No.15: Jazz Kit
		 7,	// No.16: BrushKit
		 8,	// No.17: ClascKit
		 9,	// No.18: SFX Kit1
		10,	// No.19: SFX Kit2
		11,	// No.20: SilenKit
		 1,	// No.21: Stnd2Kit
		24,	// No.22: DOC Kit
	];

	const drumSetNamesRanges = Object.keys(memMap).filter((key) => key.startsWith('drumSetNames')).map((key) => memMap[key]);
	const drumSetNamesRange = [Math.min(...drumSetNamesRanges.map(([begin, _]) => begin)), Math.max(...drumSetNamesRanges.map(([_, end]) => end))];
	console.assert(isValidRange(drumSetNamesRange));
	const drumSetNames = splitArrayByN(allBytes.slice(...drumSetNamesRange), 8).map((e) => String.fromCharCode(...e));

	drumSets.forEach((drumSet, drumSetNo) => {
		const name = drumSetNames[tableDrumSetNames[drumSetNo]];
		verifyData(/^[\x20-\x7f]*$/u.test(name));
		if (name) {
			drumSet.name = name;
		}
	});
}

function addDrumNoteNamesForMU90AndMU100(allBytes, memMap, props, drumSets) {
	console.assert(allBytes?.length && memMap && props && Array.isArray(drumSets));

	for (const kind of ['XG', 'TG300B']) {
		const drumNoteNamesRange = memMap[`drumNoteNames${kind}`];
		console.assert(isValidRange(drumNoteNamesRange));

		const drumNotesNum = (kind !== 'TG300B') ? 79 : 64;
		const drumNoteNameLists = splitArrayByN(allBytes.slice(...drumNoteNamesRange), 12).map((e) => String.fromCharCode(...e)).reduce((p, _, i, a) => {
			const rest = a.length - i;
			if (i % drumNotesNum === 0 && rest >= drumNotesNum) {
				p.push(a.slice(i, i + ((rest >= drumNotesNum * 2) ? drumNotesNum : rest)));
			}
			return p;
		}, []);

		const tableDrumNoteNames = props.additionalTables[`tableDrumNoteNames${kind}`];
		console.assert(Array.isArray(tableDrumNoteNames));

		drumSets.forEach((drumSet, drumSetNo) => {
			const index = tableDrumNoteNames.indexOf(drumSetNo);
			if (index === -1) {
				return;
			}

			const drumNoteNames = drumNoteNameLists[index];
			for (const key of Object.keys(drumSet.notes)) {
				if (!drumSet.notes[key].name) {
					const offset = {XG: 13, TG300B: 25}[kind];
					const name = drumNoteNames[Number(key) - offset];
					verifyData(/^[\x20-\x7f]*$/u.test(name));
					drumSet.notes[key].name = name;
				}
			}
		});
	}
}

function addDrumNoteNamesForMU80OrLater(allBytes, memMap, props, drumSets) {
	console.assert(allBytes?.length && memMap && props && Array.isArray(drumSets));

	const drumNoteNamesOthers = splitArrayByN(allBytes.slice(...memMap.drumNoteNamesOthers), 12).map((e) => String.fromCharCode(...e));

	for (const kind of ['XG', 'TG300B']) {
		const tableIndexToDrumSetNos = {
			XG: [
				10,	// StandKit
				21,	// StndKit2
				11,	// Room Kit
				12,	// Rock Kit
				13,	// ElectKit
				14,	// AnalgKit
				15,	// Jazz Kit
				16,	// BrushKit
				17,	// ClascKit
				18,	// SFX Kit1
				19,	// SFX Kit2
				20,	// SilenKit
			],
			TG300B: [
				0,	// StandKit
				1,	// Room Kit
				2,	// PowerKit
				3,	// ElectKit
				4,	// AnalgKit
				5,	// Jazz Kit
				6,	// BrushKit
				7,	// OrcheKit
				9,	// SFX Set
				8,	// C/M Kit
			],
		}[kind];

		const drumNoteNamesRange = memMap[`drumNoteNames${kind}`];
		console.assert(isValidRange(drumNoteNamesRange));
		const drumNoteNames = splitArrayByN(allBytes.slice(...drumNoteNamesRange), 12).map((e) => String.fromCharCode(...e));

		const drumNoteNameAddrsRange = memMap[`drumNoteNameAddrs${kind}`];
		const drumNoteNameAddrs = splitArrayByN(allBytes.slice(...drumNoteNameAddrsRange), 4).map((e) => makeValue4ByteBE(e));
		console.assert(drumNoteNameAddrs.length === tableIndexToDrumSetNos.length - 1);

		// For StandKit
		const drumSetStand = drumSets[tableIndexToDrumSetNos[0]];
		for (const key of Object.keys(drumSetStand.notes)) {
			if (!drumSetStand.notes[key].name) {
				const offset = {XG: 13, TG300B: 25}[kind];
				drumSetStand.notes[key].name = drumNoteNames[Number(key) - offset];
			}
		}

		// For the other drum sets
		drumNoteNameAddrs.forEach((addr, i) => {
			const drumSet = drumSets[tableIndexToDrumSetNos[i + 1]];
			const tableNoteNameIndices = allBytes.slice(addr, addr + 100);
			for (const key of Object.keys(drumSet.notes)) {
				if (!drumSet.notes[key].name) {
					const offset = {XG: 13, TG300B: 25}[kind];
					const index = Number(key) - offset;
					let name = drumNoteNamesOthers[tableNoteNameIndices[index]];
					if (name === '\x18'.repeat(12)) {
						name = '-'.repeat(12);
					}
					verifyData(/^[\x20-\x7f]*$/u.test(name));
					drumSet.notes[key].name = name ?? drumNoteNames[index];
				}
			}
		});
	}

	// For DOC kit
	if (props.additionalMaps.includes('DOC')) {
		console.assert(isValidRange(memMap.drumNoteNameIndicesDOC));
		const tableNoteNameIndices = allBytes.slice(...memMap.drumNoteNameIndicesDOC);

		const drumSetDoc = drumSets[drumSets.length - 1];
		for (const key of Object.keys(drumSetDoc.notes)) {
			if (!drumSetDoc.notes[key].name) {
				let name = drumNoteNamesOthers[tableNoteNameIndices[Number(key) - 21]];
				if (name === '\x18'.repeat(12)) {
					name = '-'.repeat(12);
				}
				drumSetDoc.notes[key].name = name;
			}
		}
	}
}

function makeToneMaps(tableToneMap, json, kind) {
	console.assert(tableToneMap && Array.isArray(json?.tones));

	const silenceToneNos = json.tones.filter((tone) => tone.name === 'Silence ').map((tone) => tone.toneNo);

	const toneMaps = [];
	if (kind !== 'TG300B') {
		const bankM = {
			XGBasic:    0,
			XGNative:   0,
			ModelExcl: 48,
			SFX:       64,
		}[kind] ?? 0;

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
			},
		};
	}
}

function makeDrumMaps(tableDrums, json, kind) {
	console.assert(tableDrums?.length && Array.isArray(json?.drumSets));

	const drumSetProgs = json.drumSets.map((drumSet) => tableDrums.indexOf(drumSet.drumSetNo));

	const bankM = {
		XG:       127,
		XGBasic:  127,
		XGNative: 127,
		SFX:      126,
		TG300B:     0,
	}[kind];

	const drumMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		if (!drumSetProgs.includes(prog)) {
			continue;
		}
		const drumSetNo = tableDrums[prog];
		verifyData(0 <= drumSetNo && drumSetNo < json.drumSets.length);
		const drumProg = {
			bankM, prog,
			drumSetNo,
			drumSetRef: {
				$ref: `#/drumSets/${drumSetNo}`,
			},
		};
		drumMaps.push(drumProg);
	}

	return drumMaps;
}

function makeTableOfToneMap(allBytes, memMap, json, addrSize) {
	console.assert(allBytes?.length && memMap && Array.isArray(json?.tones) && Number.isInteger(addrSize));

	console.assert(isValidRange(memMap.tableToneAddrs));
	const toneTables = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), addrSize * 128).map((packet) => splitArrayByN(packet, addrSize).map((e) => {
		const offset = (addrSize === 2) ? makeValue2ByteBE(e) * 2 : makeValue4ByteBE(e);
		const tone = json.tones.filter((tone) => offset === tone._offset);
		verifyData(tone.length === 1);
		return tone[0].toneNo;
	}));

	console.assert(isValidRange(memMap.tableTonesMsb));
	const tableBanksMsb = allBytes.slice(...memMap.tableTonesMsb);
	const tables = Object.entries(memMap).filter(([key, _]) => key.startsWith('tableTones')).reduce((p, [key, value]) => {
		p[key] = allBytes.slice(...value);
		return p;
	}, {});

	return (kind, prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const tableBanks = tables[`tableTones${kind}`];
		switch (kind) {
		case 'TG300B':
			console.assert(tableBanks);
			return toneTables[(tableBanks[bankM] !== 0xff) ? tableBanks[bankM] : tableBanks[0]][prog];	// Ignores MSB

		case 'DOC':
			return toneTables[toneTables.length - 1][prog];

		default:
			if (bankM === 0 || bankM === 48 || bankM === 121) {
				console.assert(tableBanks);
				return toneTables[tableBanks[bankL]][prog];
			} else {
				return toneTables[tableBanksMsb[bankM]][prog];	// Ignores LSB
			}
		}
	};
}
