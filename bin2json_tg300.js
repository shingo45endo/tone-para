import {splitArrayByN, removePrivateProp, verifyData, isValidRange} from './bin2json_common.js';

export function binToJsonForTG300(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {};

	// Waves
	console.assert(isValidRange(memMap.waveNames));
	json.waves = makeWaves(allBytes.slice(...memMap.waveNames));

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(allBytes.slice(...memMap.tones), json);

	// Tone Map
	const tablePrograms = makeProgTable(allBytes, memMap, json);
	for (const kind of ['GM_A', 'GM_B']) {
		if (memMap[`tableTones${kind}`]) {
			json[`programs${kind}`] = makePrograms(tablePrograms, json, kind);
		}
	}

	removePrivateProp(json);

	return json;
}

function makeWaves(bytes) {
	console.assert(bytes?.length);

	const waves = [];
	const wavePackets = splitArrayByN(bytes, 8);
	wavePackets.forEach((waveBytes, waveNo) => {
		const wave = {
			waveNo,
			name: String.fromCharCode(...waveBytes),
		};
		verifyData(/^[\x20-\x7f]*$/u.test(wave.name));
		waves.push(wave);
	});

	return waves;
}

function makeTones(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.waves));

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const numVoices = bytes[index + 0x05] + 1;
		verifyData(numVoices === 1 || numVoices === 2);
		const size = 16 + 80 * numVoices;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 16);
		verifyData(commonBytes[15] === 0x00);

		const voices = [];
		const voicePackets = splitArrayByN(toneBytes.slice(16), 80);
		voicePackets.forEach((voiceBytes) => {
			const waveNo = (voiceBytes[0] << 7) | voiceBytes[1];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
				wave: {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(7, 15)),
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

function makePrograms(tablePrograms, json, kind) {
	console.assert(tablePrograms && Array.isArray(json?.tones));

	const programs = [];
	if (kind === 'GM_A') {
		for (let prog = 0; prog < 128; prog++) {
			for (let bankL = 0; bankL < 128; bankL++) {
				const toneNo = tablePrograms(kind, prog, 0, bankL);
				if ((bankL > 0 && toneNo === tablePrograms(kind, prog, 0, 0))) {
					continue;
				}
				programs.push(makeProgram(kind, prog, 0, bankL));
			}
		}

	} else {
		for (let prog = 0; prog < 128; prog++) {
			for (let bankM = 0; bankM < 64; bankM++) {
				const toneNo = tablePrograms(kind, prog, bankM, 0);
				if ((bankM > 0 && toneNo === tablePrograms(kind, prog, 0, 0))) {
					continue;
				}
				programs.push(makeProgram(kind, prog, bankM, 0));
			}
		}
		for (const bankM of [80, 126, 127]) {
			for (let prog = 0; prog < 128; prog++) {
				programs.push(makeProgram(kind, prog, bankM, 0));
			}
		}
	}

	return programs;

	function makeProgram(kind, prog, bankM, bankL) {
		const toneNo = tablePrograms(kind, prog, bankM, bankL);
		return {
			name: json.tones[toneNo].name,
			bankM, bankL, prog,
			toneNo,
			tone: {
				$ref: `#/tones/${toneNo}`,
			},
		};
	}
}

function makeProgTable(allBytes, memMap, json) {
	console.assert(allBytes?.length && memMap && Array.isArray(json?.tones));

	const toneTables = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), 256).map((packet, i) => splitArrayByN(packet, 2).map((e) => {
		if (i === 0x10) {
			return 0;
		}
		const offset = (e[0] << 8) | e[1];
		const tone = json.tones.filter((tone) => offset === tone._offset);
		verifyData(tone.length === 1);
		return tone[0].toneNo;
	}));

	const tables = Object.entries(memMap).filter(([key, _]) => key.startsWith('tableTones')).reduce((p, [key, value]) => {
		p[key] = allBytes.slice(...value);
		return p;
	}, {});

	return (kind, prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const tableBanks = tables[`tableTones${kind}`];
		console.assert(tableBanks);
		const index = (kind === 'GM_A') ? bankL : bankM;
		return toneTables[tableBanks[index]][prog];
	};
}
