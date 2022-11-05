import {splitArrayByN, isValidRange, verifyData} from './bin2json_common.js';

export function binToJsonForSC55(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		samples: null,
		waves: null,
		tones: null,
		drumSets: null,
		toneMaps: null,
		drumMaps: null,
	};

	// Samples
	console.assert(Array.isArray(memMap.samplesRanges));
	json.samples = makeSamples(allBytes, memMap.samplesRanges);

	// Waves
	console.assert(Array.isArray(memMap.wavesRanges));
	json.waves = makeWaves(allBytes, memMap.wavesRanges);

	// Tones
	console.assert(Array.isArray(memMap.tonesRanges));
	json.tones = makeTones(allBytes, memMap.tonesRanges, json);

	// Drum Sets
	console.assert(isValidRange(memMap.drumSets));
	json.drumSets = makeDrumSets(allBytes.slice(...memMap.drumSets), json);

	// Tone Map
	console.assert(isValidRange(memMap.tableTones));
	json.toneMaps = makeToneMaps(allBytes.slice(...memMap.tableTones), json);

	// Drum Map
	console.assert(isValidRange(memMap.tableDrums));
	json.drumMaps = makeDrumMaps(allBytes.slice(...memMap.tableDrums), json);

	return json;
}

function makeSamples(allBytes, samplesRanges) {
	console.assert(allBytes?.length && samplesRanges?.every((e) => isValidRange(e)));

	const regionBytes = [].concat(...samplesRanges.map((range) => [...allBytes.slice(...range)]));

	const samples = [];
	const samplePackets = splitArrayByN(regionBytes, 16);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const sample = {
			sampleNo,
			bytes: [...sampleBytes],
			key:   sampleBytes[11],
			bank:  sampleBytes[10],
		};
		samples.push(sample);
	});

	return samples;
}

function makeWaves(allBytes, wavesRanges) {
	console.assert(allBytes?.length && wavesRanges?.every((e) => isValidRange(e)));

	const regionBytes = [].concat(...wavesRanges.map((range) => [...allBytes.slice(...range)]));

	const waves = [];
	const wavePackets = splitArrayByN(regionBytes, 60);
	wavePackets.forEach((waveBytes, waveNo) => {
		const notes = waveBytes.slice(12, 28);
		const sampleNos = splitArrayByN(waveBytes.slice(28, 60), 2).map((e) => (e[0] << 8) | e[1]);
		console.assert(notes.length === 16 && sampleNos.length === 16);

		const sampleSlots = [];
		for (let i = 0; i < 16; i++) {
			const sampleNo = sampleNos[i];
			const sample = {
				low: (i > 0) ? notes[i - 1] + 1 : 0,
				high: notes[i],
				sampleNo,
			};
			if (sample.sampleNo >= 0) {
				Object.assign(sample, {
					sampleRef: {
						$ref: `#/samples/${sampleNo}`,
					},
				});
			}
			console.assert(sample.low <= sample.high);
			sampleSlots.push(sample);

			if (sample.high === 0x7f) {
				break;
			}
		}

		const wave = {
			waveNo,
			name: String.fromCharCode(...waveBytes.slice(0, 12)),
			sampleSlots,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(wave.name));
		waves.push(wave);
	});

	return waves;
}

function makeTones(allBytes, tonesRanges, json) {
	console.assert(allBytes?.length && tonesRanges?.every((e) => isValidRange(e)) && Array.isArray(json?.waves));

	const regionBytes = [].concat(...tonesRanges.map((range) => [...allBytes.slice(...range)]));

	const tones = [];
	const tonePackets = splitArrayByN(regionBytes, 216);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 32);
		const numVoices = {0b01: 1, 0b11: 2}[commonBytes[18]];
		verifyData(numVoices === 1 || numVoices === 2);
		const voicePackets = splitArrayByN(toneBytes.slice(32, 32 + 92 * numVoices), 92);

		const voices = voicePackets.map((voiceBytes) => {
			const waveNo = (voiceBytes[2] << 8) | voiceBytes[3];
			const voice = {
				bytes: [...voiceBytes],
				waveNo,
				waveRef: {
					$ref: `#/waves/${waveNo}`,
					name: json.waves[waveNo].name,
				},
			};
			return voice;
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 12)),
			commonBytes: [...commonBytes],
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);
	});

	return tones;
}

function makeDrumSets(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.tones));

	const drumSets = [];
	const drumSetPackets = splitArrayByN(bytes, 1164);
	drumSetPackets.forEach((drumSetBytes, drumSetNo) => {
		const tones = splitArrayByN(drumSetBytes.slice(0, 256), 2).map((e) => (e[0] << 8) | e[1]);
		const [levels, pitches, groups, panpots, reverbs, choruses, rxBits] = splitArrayByN(drumSetBytes.slice(256, 1152), 128);

		const notes = {};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			const toneNo = tones[noteNo];
			if (toneNo === 0xffff) {
				continue;
			}
			const note = {
				level:  levels[noteNo],
				pitch:  pitches[noteNo],
				group:  groups[noteNo],
				panpot: panpots[noteNo],
				reverb: reverbs[noteNo],
				chorus: choruses[noteNo],
				isRxNoteOn:  ((rxBits[noteNo] & 0x10) !== 0),
				isRxNoteOff: ((rxBits[noteNo] & 0x01) !== 0),
				toneNo,
				toneRef: {
					$ref: `#/tones/${toneNo}`,
					name: json.tones[toneNo].name,
				},
			};
			notes[noteNo] = note;
		}

		const drumSet = {
			drumSetNo,
			name: String.fromCharCode(...drumSetBytes.slice(1152)),
			notes,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(drumSet.name));
		drumSets.push(drumSet);
	});

	return drumSets;
}

function makeToneMaps(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.tones));

	const tableTones = splitArrayByN(bytes, 256).map((packet) => splitArrayByN(packet, 2).map((e) => (e[0] << 8) | e[1]));

	const toneMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		for (let bankM = 0; bankM < 126; bankM++) {
			const toneNo = tableTones[bankM][prog];
			if (toneNo === 0xffff) {
				continue;
			}
			const toneProg = {
				prog, bankM,
				toneNo,
				toneRef: {
					$ref: `#/tones/${toneNo}`,
					name: json.tones[toneNo].name,
				},
			};
			toneMaps.push(toneProg);
		}
	}
	for (const bankM of [126, 127]) {
		for (let prog = 0; prog < 128; prog++) {
			const toneNo = tableTones[bankM][prog];
			if (toneNo === 0xffff) {
				continue;
			}
			const toneProg = {
				bankM, prog,
				toneNo,
				toneRef: {
					$ref: `#/tones/${toneNo}`,
					name: json.tones[toneNo].name,
				},
			};
			toneMaps.push(toneProg);
		}
	}

	return toneMaps;
}

function makeDrumMaps(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.drumSets));

	const tableDrums = bytes;

	const drumMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		const drumSetNo = tableDrums[prog];
		if (drumSetNo === 0xff) {
			continue;
		}
		const drumProg = {
			prog,
			drumSetNo,
			drumSetRef: {
				$ref: `#/drumSets/${drumSetNo}`,
				name: json.drumSets[drumSetNo].name,
			},
		};
		drumMaps.push(drumProg);
	}

	return drumMaps;
}
