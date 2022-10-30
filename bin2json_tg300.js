import {splitArrayByN, removePrivateProp} from './bin2json_common.js';

export function binToJsonForTG300(allBytes, memMap) {
	const json = {};

	if (memMap.waveNames) {
		json.waves = makeWaves(allBytes.slice(...memMap.waveNames));
	}
	if (memMap.tones) {
		json.tones = makeTones(allBytes.slice(...memMap.tones), json);
	}
	if (memMap.tableToneAddrs) {
		const tablePrograms = makeProgTable(allBytes, memMap, json);
		for (const kind of ['GM_A', 'GM_B']) {
			if (memMap[`tableTones${kind}`]) {
				json[`programs${kind}`] = makePrograms(tablePrograms, json, kind);
			}
		}
	}

	removePrivateProp(json);

	return json;
}

function makeWaves(bytes) {
	const wavePackets = splitArrayByN(bytes, 8);

	const waves = [];
	for (let waveNo = 0; waveNo < wavePackets.length; waveNo++) {
		const waveBytes = wavePackets[waveNo];

		const name = String.fromCharCode(...waveBytes);
		const wave = {
			waveNo, name,
		};

		waves.push(wave);
	}

	return waves;
}

function makeTones(bytes, json) {
	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const numVoices = bytes[index + 0x05] + 1;
		console.assert(numVoices === 1 || numVoices === 2);
		const size = 16 + 80 * numVoices;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 16);
		console.assert(commonBytes[15] === 0x00);
		const voicePackets = splitArrayByN(toneBytes.slice(16), 80);

		const name = String.fromCharCode(...commonBytes.slice(7, 15));

		const tone = {
			toneNo, name,
			commonBytes: [...commonBytes],
			voices: [],
			_offset: index,
		};

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = (voiceBytes[0] << 7) | voiceBytes[1];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
				wave: {
					name: json.waves[waveNo].name,
					$ref: `#/waves/${waveNo}`,
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

function makePrograms(tablePrograms, json, kind) {
	console.assert(json && json.tones);

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
	console.assert(json && json.tones);

	const toneTables = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), 256).map((packet, i) => splitArrayByN(packet, 2).map((e) => {
		if (i === 0x10) {
			return 0;
		}
		const offset = (e[0] << 8) | e[1];
		const tone = json.tones.filter((tone) => offset === tone._offset);
		console.assert(tone.length === 1);
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
