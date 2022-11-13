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
		voicePacketSize: 70,
		addrSize: 4,
		additionalMaps: ['SFX'],
	},
	// MU90
	{
		convertCommonBytes: convertCommonBytesForMU80OrLater,
		convertVoicePacket: convertVoicePacketForMU90AndMU100,
		voicePacketSize: 70,
		addrSize: 2,
		additionalMaps: ['SFX'],
	},
	// MU80
	{
		convertCommonBytes: convertCommonBytesForMU80OrLater,
		convertVoicePacket: convertVoicePacketForMU80,
		voicePacketSize: 68,
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
		voicePacketSize: 80,
		addrSize: 2,
		additionalMaps: ['SFX', 'DOC'],
	},
].map((props) => {
	return (allBytes, memMap) => {
		console.assert(allBytes?.length && memMap);

		const json = {
			waves: waveNamesMU.map((name, waveNo) => ({waveNo, name})),
			tones: null,
		};

		// Tones
		console.assert(isValidRange(memMap.tones));
		json.tones = makeTones(allBytes.slice(...memMap.tones), props, json);

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
