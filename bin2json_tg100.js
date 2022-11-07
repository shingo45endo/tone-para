import {splitArrayByN, addNamesFromRefs, isValidRange, verifyData, makeValue2ByteBE, makeValue3ByteBE} from './bin2json_common.js';

const drumNotes = {
	0: {
		29: 'Scratch Push',
		30: 'Scratch Pull',
		31: 'Stick',
		32: 'Click Noise',
		33: 'Metronome Click',
		34: 'Metronome Bell',
		35: 'Acoustic Bass Drum',
		36: 'Bass Drum 1',
		37: 'Side Stick',
		38: 'Acoustic Snare',
		39: 'Hand Clap',
		40: 'Electric Snare',
		41: 'Low Floor Tom',
		42: 'Closed Hi-Hat',
		43: 'High Floor Tom',
		44: 'Pedal Hi-Hat',
		45: 'Low Tom',
		46: 'Open Hi-Hat',
		47: 'Low-Mid Tom',
		48: 'Hi-Mid Tom',
		49: 'Crash Cymbal 1',
		50: 'High Tom',
		51: 'Ride Cymbal 1',
		52: 'Chinese Cymbal',
		53: 'Ride Bell',
		54: 'Tambourine',
		55: 'Splash Cymbal',
		56: 'Cowbell',
		57: 'Crash Cymbal 2',
		58: 'Vibraslap',
		59: 'Ride Cymbal 2',
		60: 'Hi Bongo',
		61: 'Low Bongo',
		62: 'Mute Hi Conga',
		63: 'Open Hi Conga',
		64: 'Low Conga',
		65: 'High Timbale',
		66: 'Low Timbale',
		67: 'High Agogo',
		68: 'Low Agogo',
		69: 'Cabasa',
		70: 'Maracas',
		71: 'Short Whistle',
		72: 'Long Whistle',
		73: 'Short Guiro',
		74: 'Long Guiro',
		75: 'Claves',
		76: 'Hi Wood Block',
		77: 'Low Wood Block',
		78: 'Mute Cuica',
		79: 'Open Cuica',
		80: 'Mute Triangle',
		81: 'Open Triangle',
		82: 'Shaker',
		85: 'Castanets',
		86: 'Taiko-Drum High',
		87: 'Taiko-Drum Low',
	},
	8: {
		41: 'Room Low Tom 2',
		43: 'Room Low Tom1',
		45: 'Room Mid Tom 2',
		47: 'Room Mid Tom 1',
		48: 'Room Hi Tom 2',
		50: 'Room Hi Tom 1',
	},
	16: {
		36: 'MONDO kick',
		38: 'Gated SD',
		41: 'Room Low Tom 2',
		43: 'Room Low Tom1',
		45: 'Room Mid Tom 2',
		47: 'Room Mid Tom 1',
		48: 'Room Hi Tom 2',
		50: 'Room Hi Tom 1',
	},
	24: {
		36: 'Elec BD',
		38: 'Elec SD',
		40: 'Gated SD',
		41: 'Elec Low Tom 2',
		43: 'Elec Low Tom 1',
		45: 'Elec Mid Tom 2',
		47: 'Elec Mid Tom 1',
		48: 'Elec Hi Tom 2',
		50: 'Elec Hi Tom 1',
		52: 'Reverse Cymbal',
	},
	25: {
		36: 'Analog Bass Drum',
		38: 'Analog Snare Drum',
		41: 'Analog Low Tom 2',
		42: 'Analog CHH',
		43: 'Analog Low Tom 1',
		44: 'Analog CHH',
		45: 'Analog Mid Tom 2',
		46: 'Analog OHH',
		47: 'Analog Mid Tom 1',
		48: 'Analog Hi Tom 1',
		62: 'Analog Hi Conga',
		63: 'Analog Mid Conga',
		64: 'Analog Low Conga',
		75: 'Analog Claves',
	},
	40: {
		38: 'Brush Swish',
		39: 'Brush Slap',
		40: 'Brush Roll',
	},
	48: {
		27: 'Closed Hi-Hat',
		28: 'Pedal Hi-Hat',
		29: 'Open Hi-Hat',
		30: 'Ride Cymbal',
		36: 'Concert BD',
		38: 'Concert SD',
		39: 'Castanets',
		40: 'Concert SD',
		41: 'Timpani F',
		42: 'Timpani F#',
		43: 'Timpani G',
		44: 'Timpani G#',
		45: 'Timpani A',
		46: 'Timpani A#',
		47: 'Timpani B',
		48: 'Timpani c',
		49: 'Timpani c#',
		50: 'Timpani d',
		51: 'Timpani d#',
		52: 'Timpani e',
		53: 'Timpani f',
		57: 'Crash Cymbal',
		59: 'Concert Cymbal',
	},
	125: {
		30: 'BRUSH ROLL',
		32: 'HH closed-heavy',
		34: 'Crash CYM-light',
		35: 'BD light',
		36: 'SD+RIM-heavy',
		37: 'RIDE CYM-cup',
		38: 'SD+RIM-light',
		39: 'BRUSH CYMBAL',
		40: 'SD echo 2',
		41: 'BD-normal',
		42: 'RIM SHOT',
		43: 'SD-heavy',
		44: 'BRUSH SHOT',
		45: 'SD-light',
		46: 'HH-pedal',
		47: 'SD-echo',
		48: 'TOM-4',
		49: 'HH-closed-normal',
		50: 'TOM-3',
		51: 'HH-open',
		52: 'TOM-2',
		53: 'TOM-1',
		54: 'RIDE CYM-normal',
		55: 'E.TOM #',
		56: 'Crash CYM-normal',
		57: 'E.TOM 2',
		58: 'Crash CYM-normal',
		59: 'E.TOM 1',
		60: 'CONGA-low',
		61: 'CABASA',
		62: 'CONGA-high',
		63: 'METRONOME',
		64: 'BONGO-high',
		65: 'TIMBALE-low',
		66: 'CLAVES',
		67: 'TIMBALE-high',
		68: 'CASTANETS',
		69: 'CUICA-low',
		70: 'COWBELL',
		71: 'CUICA-high',
		72: 'HANDCLAPS',
		73: 'AGOGO-low',
		75: 'AGOGO-high',
		76: 'BONGO-low',
		77: 'CUICA_low',
		78: 'TAMBOURINE',
		79: 'Crash CYM-normal',
		80: 'TRIANGLE-closed',
		81: 'NOISE',
		82: 'TRIANGLE-open',
	},
	126: {
		27: 'Bass Drum 1',
		28: 'Bass Drum 1',
		29: 'Bass Drum 1',
		30: 'Bass Drum 1',
		31: 'Bass Drum 1',
		32: 'Bass Drum 1',
		33: 'Bass Drum 1',
		34: 'Bass Drum 1',
		35: 'Acoustic Bass Drum',
		36: 'Bass Drum 1',
		37: 'Bass Drum 1',
		38: 'Acoustic Bass Drum',
		39: 'Bass Drum 1',
		40: 'Low Floor Tom',
		41: 'High Floor Tom',
		42: 'Low Tom',
		43: 'Hi Mid Tom',
		44: 'Acoustic Bass Drum',
		45: 'Bass Drum 1',
		46: 'Side Stick',
		47: 'Low Floor Tom',
		48: 'High Floor Tom',
		49: 'Acoustic Snare',
		50: 'Low Tom',
		51: 'Side Stick',
		52: 'Acoustic Snare',
		53: 'Hi Mid Tom',
		54: 'Hand Clap',
		55: 'Cowbell',
		57: 'Closed Hi Hat',
		58: 'Tambourine',
		59: 'Open Hi Hat',
		60: 'Crash Cymbal 1',
		61: 'Chinese Cymbal',
		62: 'Ride Bell',
		63: 'Ride Cymbal 1',
		64: 'Low Conga',
		65: 'Open Hi Conga',
		66: 'Mute Hi Conga',
		67: 'Low Bongo',
		68: 'Hi Bongo',
		69: 'Low Timbale',
		70: 'High Timbale',
		73: 'Claves',
		74: 'Low Agogo',
		75: 'High Agogo',
		78: 'Short Whistle',
		84: 'Electric Snare',
		85: 'Electric Snare',
		86: 'Electric Snare',
		87: 'Acoustic Snare',
		88: 'Acoustic Snare',
		89: 'Acoustic Snare',
		90: 'Acoustic Snare',
		91: 'Acoustic Snare',
		92: 'Acoustic Snare',
		93: 'Acoustic Snare',
		94: 'Acoustic Snare',
		95: 'Electric Snare',
		96: 'Acoustic Snare',
		97: 'Electric Snare',
		98: 'Electric Snare',
	},
	127: {
		35: 'Acoustic B Drum',
		36: 'Acoustic B Drum',
		37: 'Rim Shot',
		38: 'Acoustic S Drum',
		39: 'Hand Clap',
		40: 'Electric S Drum',
		41: 'Acoustic L Tom',
		42: 'Closed High Hat',
		43: 'Acoustic L Tom',
		44: 'Open Hi-Hat 2',
		45: 'Acoustic N Tom',
		46: 'Open Hi-Hat 1',
		47: 'Acoustic M Tom',
		48: 'Acoustic H Tom',
		49: 'Crash Cymbal',
		50: 'Acoustic H Tom',
		51: 'Ride Cymbal',
		54: 'Tambourine',
		56: 'Cowbell',
		60: 'High Bongo',
		61: 'Low Bongo',
		62: 'Mute Hi Conga',
		63: 'Open Hi Conga',
		64: 'Low Conga',
		65: 'High Timbale',
		66: 'Low Timbale',
		67: 'High Agogo',
		68: 'Low Agogo',
		69: 'Cabasa',
		70: 'Maracas',
		71: 'Short Whistle',
		72: 'Long Whistle',
		73: 'Quijada',
		75: 'Claves',
	},
};

export function binToJsonForTG100(files, memMap) {
	console.assert(files?.PROG?.length && files?.PCM.length && memMap);

	const json = {
		samples: null,
		waves: null,
		drumWaves: null,
		tones: null,
		drumSets: null,
	};

	// Samples
	console.assert(isValidRange(memMap.samples));
	json.samples = makeSamples(files.PCM.slice(...memMap.samples));

	// Waves
	json.waves = makeWaves(files.PROG, memMap);

	// Drum Waves
	console.assert(isValidRange(memMap.tableDrumWaves));
	json.drumWaves = makeDrumWaves(files.PROG.slice(...memMap.tableDrumWaves));

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(files.PROG.slice(...memMap.tones), json);

	// Drum Sets
	json.drumSets = makeDrumSets(files.PROG, memMap);

	// Tone Map
	for (const kind of ['GM', 'DOC', 'CMType1', 'CMType2']) {
		json[`toneMaps${kind}`] = makeToneMaps(files.PROG, memMap, json, kind);
	}

	// Drum Map
	console.assert(isValidRange(memMap.tableDrums));
	json.drumMaps = makeDrumMaps(files.PROG.slice(...memMap.tableDrums), json);

	// Adds names.
	addWaveNames(json);
	addDrumWaveNames(json);
	addSampleNames(json);

	addNamesFromRefs(json);

	return json;
}

function makeSamples(bytes) {
	console.assert(bytes?.length);

	const samples = [];
	const samplePackets = splitArrayByN(bytes, 12);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const addrAndFormat = makeValue3ByteBE(sampleBytes.slice(0, 3));
		const addrBegin = addrAndFormat & 0x0fffff;
		const addrEnd   = addrBegin + (0xffff - makeValue2ByteBE(sampleBytes.slice(5, 7)));
		const addrLoop  = addrEnd - makeValue2ByteBE(sampleBytes.slice(3, 5));
		const sample = {
			sampleNo,
			addrBegin, addrLoop, addrEnd,
			format: addrAndFormat >> 20,
			bytes: [...sampleBytes],
		};
		samples.push(sample);
	});

	return samples;
}

function makeWaves(progBytes, memMap) {
	console.assert(progBytes?.length && memMap);

	console.assert(isValidRange(memMap.waves));
	const wavesPackets = splitArrayByN(progBytes.slice(...memMap.waves), 9);

	console.assert(isValidRange(memMap.tableWaves));
	const tableWaves = splitArrayByN(progBytes.slice(...memMap.tableWaves), 2).map((e) => makeValue2ByteBE(e));

	const waves = [];
	tableWaves.forEach((indexBegin, waveNo) => {
		verifyData(indexBegin < wavesPackets.length);
		const indexEnd = tableWaves[waveNo + 1] ?? wavesPackets.length;

		const sampleSlots = wavesPackets.slice(indexBegin, indexEnd).map((waveBytes) => {
			const sampleNo = makeValue2ByteBE(waveBytes.slice(0, 2));
			const sampleSlot = {
				low:  waveBytes[2],
				high: waveBytes[3],
				bytes: [...waveBytes],
				sampleNo,
				sampleRef: {
					$ref: `#/samples/${sampleNo}`,
				},
			};
			return sampleSlot;
		});

		const wave = {
			waveNo,
			sampleSlots,
		};
		waves.push(wave);
	});

	return waves;
}

function makeDrumWaves(bytes) {
	console.assert(bytes?.length);

	const drumWaves = [];
	const drumWavePackets = splitArrayByN(bytes, 6);
	drumWavePackets.forEach((drumWaveBytes, drumWaveNo) => {
		const sampleNo = makeValue2ByteBE(drumWaveBytes.slice(0, 2));
		const drumWave = {
			drumWaveNo,
			bytes: [...drumWaveBytes],
			sampleNo,
			sampleRef: {
				$ref: `#/samples/${sampleNo}`,
			},
		};
		drumWaves.push(drumWave);
	});

	return drumWaves;
}

function makeTones(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.waves));

	const tones = [];
	const tonePackets = splitArrayByN(bytes, 96);
	tonePackets.forEach((toneBytes, toneNo) => {
		const commonBytes = toneBytes.slice(0, 24);
		const numVoices = {0x00: 1, 0x01: 2}[commonBytes[0]];
		verifyData(numVoices === 1 || numVoices === 2);
		const voicePackets = splitArrayByN(toneBytes.slice(24, 96), 36);

		const voices = [];
		for (let i = 0; i < numVoices; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = ((voiceBytes[0] & 0x0f) << 4) | (voiceBytes[1] & 0x0f);
			const voice = {
				level:  commonBytes[1 + i],
				pitch:  commonBytes[12 + i],
				detune: commonBytes[3 + i],
				pitchRateScaling:     commonBytes[10 + 4 * i],
				pitchRateScalingNote: commonBytes[11 + 4 * i],
				bytes: [...voiceBytes],
				waveNo,
				waveRef: {
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		}

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(16, 24)),
			commonBytes: [...commonBytes],
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);
	});

	return tones;
}

function makeDrumSets(progBytes, memMap) {
	console.assert(progBytes?.length && memMap);

	console.assert(isValidRange(memMap.tableDrums));
	const tableDrums = progBytes.slice(...memMap.tableDrums);

	console.assert(isValidRange(memMap.tableDrumSetNames));
	const tableDrumSetNames = progBytes.slice(...memMap.tableDrumSetNames);

	console.assert(isValidRange(memMap.drumSetNames));
	const drumSetNames = splitArrayByN(progBytes.slice(...memMap.drumSetNames), 8).map((bytes) => String.fromCharCode(...bytes));
	verifyData(drumSetNames.every((e) => /^[\x20-\x7f]*$/u.test(e)));

	const drumSets = [];
	console.assert(isValidRange(memMap.tableDrumNotes));
	const drumSetNotes = splitArrayByN(progBytes.slice(...memMap.tableDrumNotes), 256).map((packet) => splitArrayByN(packet, 2).map((e) => makeValue2ByteBE(e)));
	drumSetNotes.forEach((drumWaveNos, drumSetNo) => {
		const prog = tableDrums.indexOf(drumSetNo);
		verifyData(prog !== -1);

		const notes = {};
		drumWaveNos.forEach((drumWaveNo, noteNo) => {
			if (drumWaveNo === 0x1ff) {
				return;
			}
			const note = {
				name: drumNotes[prog][noteNo],
				drumWaveNo,
				drumWaveRef: {
					$ref: `#/drumWaves/${drumWaveNo}`,
				},
			};
			notes[noteNo] = note;
		});

		const drumSet = {
			drumSetNo,
			name: drumSetNames[tableDrumSetNames[prog]],
			notes,
		};
		drumSets.push(drumSet);
	});

	return drumSets;
}

function makeToneMaps(progBytes, memMap, json, kind) {
	console.assert(progBytes?.length && memMap && Array.isArray(json?.tones));

	console.assert(isValidRange(memMap.tableBanks));
	const tableBanks = progBytes.slice(...memMap.tableBanks);
	const bankM = tableBanks.indexOf({GM: 0x00, DOC: 0x01, CMType1: 0x02, CMType2: 0x02}[kind]);
	verifyData(bankM !== -1);

	const tableTonesRange = memMap[`tableTones${kind}`];
	console.assert(isValidRange(tableTonesRange));
	const tableTones = splitArrayByN(progBytes.slice(...tableTonesRange), 2).map((e) => ((e[0] & 0x0f) << 4) | (e[1] & 0x0f));
	console.assert(tableTones.length === 128);

	const toneMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		const toneNo = tableTones[prog];
		if (toneNo === 0xff) {
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

	return toneMaps;
}

function makeDrumMaps(tableDrums, json) {
	console.assert(tableDrums?.length && Array.isArray(json?.drumSets));

	const drumSetProgs = json.drumSets.map((drumSet) => tableDrums.indexOf(drumSet.drumSetNo));

	const drumMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		if (!drumSetProgs.includes(prog)) {
			continue;
		}
		const drumSetNo = tableDrums[prog];
		verifyData(0 <= drumSetNo && drumSetNo < json.drumSets.length);
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

function addWaveNames(json) {
	console.assert(Array.isArray(json?.tones) && Array.isArray(json?.waves));

	json.tones.forEach((tone) => {
		tone.voices.forEach((voice) => {
			const wave = json.waves[voice.waveNo];
			if (!wave.name) {
				wave.name = tone.name.toLowerCase();
			}
		});
	});
}

function addDrumWaveNames(json) {
	console.assert(Array.isArray(json?.drumSets) && Array.isArray(json?.drumWaves));

	json.drumSets.forEach((drumSet) => {
		Object.values(drumSet.notes).forEach((note) => {
			const drumWave = json.drumWaves[note.drumWaveNo];
			if (!drumWave.name && note.name) {
				drumWave.name = `${note.name.toLowerCase()}`;
			}
		});
	});
}

function addSampleNames(json) {
	console.assert(Array.isArray(json?.waves) && Array.isArray(json?.drumWaves));

	json.waves.forEach((wave) => {
		wave.sampleSlots.forEach((sampleSlot, i) => {
			const sample = json.samples[sampleSlot.sampleNo];
			if (!sample.name && wave.name) {
				const suffix = (wave.sampleSlots.length > 1) ? ` #${i + 1}` : '';
				sample.name = `${wave.name.toLowerCase()}${suffix}`;
			}
		});
	});

	json.drumWaves.forEach((drumWave) => {
		const sample = json.samples[drumWave.sampleNo];
		if (!sample.name && drumWave.name) {
			sample.name = `${drumWave.name.toLowerCase()}`;
		}
	});
}
