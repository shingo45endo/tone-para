import {splitArrayByN, removePrivateProp, verifyData, isValidRange, makeValue2ByteLE, makeValue3ByteLE} from './bin2json_common.js';

const toneNames = [
	'PIANO 1',
	'PIANO 2',
	'STUDIO PIANO',
	'HONKY-TONK',
	'ELEC PIANO 1',
	'ELEC PIANO 2',
	'HARPSICHORD',
	'CLAVI',
	'CELESTA',
	'GLOCKENSPIEL',
	'MUSIC BOX',
	'VIBRAPHONE',
	'MARIMBA',
	'XYLOPHONE',
	'TUBULAR BELLS',
	'DULCIMER',
	'DRAWBAR ORGAN',
	'PERC ORGAN',
	'ROCK ORGAN',
	'CHURCH ORGAN',
	'REED ORGAN',
	'ACCORDION',
	'HARMONICA',
	'BANDNEON',
	'NYLON GUITAR',
	'STEEL GUITAR',
	'JAZZ GUITAR',
	'CLEAN GUITAR',
	'MUTED GUITAR',
	'OVERDRIVEN GT',
	'DISTORTION GT',
	'GT HARMONICS',
	'ACOUSTIC BASS',
	'FINGERED BASS',
	'PICKED BASS',
	'FRETLESS BASS',
	'SLAP BASS 1',
	'SLAP BASS 2',
	'SYNTH-BASS 1',
	'SYNTH-BASS 2',
	'VIOLIN',
	'VIOLA',
	'CELLO',
	'CONTRABASS',
	'TREMOLO STR',
	'PIZZICATO STR',
	'HARP',
	'TIMPANI',
	'STRINGS 1',
	'STRINGS 2',
	'SYNTH-STR 1',
	'SYNTH-STR 2',
	'CHOIR AAHS',
	'VOICE OOHS',
	'SYNTH-VOICE',
	'ORCHESTRA HIT',
	'TRUMPET',
	'TROMBONE',
	'TUBA',
	'MUTED TRUMPET',
	'FRENCH HORN',
	'BRASS',
	'SYNTH-BRASS 1',
	'SYNTH-BRASS 2',
	'SOPRANO SAX',
	'ALTO SAX',
	'TENOR SAX',
	'BARITONE SAX',
	'OBOE',
	'ENGLISH HORN',
	'BASSOON',
	'CLARINET',
	'PICCOLO',
	'FLUTE',
	'RECORDER',
	'PAN FLUTE',
	'BOTTLE BLOW',
	'SHAKUHACHI',
	'WHISTLE',
	'OCARINA',
	'SQUARE WAVE',
	'SAWTOOTH',
	'SYNTH-CALLIOPE',
	'CHIFF LEAD',
	'CHARANG',
	'VOICE LEAD',
	'FIFTH LEAD',
	'BASS+LEAD',
	'FANTASY',
	'WARM PAD',
	'POLYSYNTH',
	'SPACE CHOIR',
	'BOWED GLASS',
	'METALLIC PAD',
	'HALO PAD',
	'SWEEP PAD',
	'RAIN DROP',
	'SOUNDTRACK',
	'CRYSTAL',
	'ATMOSPHERE',
	'BRIGHTNESS',
	'GOBLINS',
	'ECHOES',
	'SCI-FI',
	'SITAR',
	'BANJO',
	'SHAMISEN',
	'KOTO',
	'KALIMBA',
	'BAG PIPE',
	'FIDDLE',
	'SHANAI',
	'TINKLE BELL',
	'AGOGO',
	'STEEL DRUMS',
	'WOOD BLOCK',
	'TAIKO',
	'MELODIC TOM',
	'SYNTH DRUM',
	'REVERSE CYMBAL',
	'GT FRET NOISE',
	'BREATH NOISE',
	'SEASHORE',
	'BIRD',
	'TELEPHONE',
	'HELICOPTER',
	'APPLAUSE',
	'GUNSHOT',

	'STANDARD SET',
	'ROOM SET',
	'POWER SET',
	'ELECTRONIC SET',
	'TR-808 SET',
	'JAZZ SET',
	'BRUSH SET',
	'ORCHESTRA SET',
];
console.assert(toneNames.length === 128 + 8);

const drumNames = [
	// STANDARD SET
	{
		27: 'HIGH Q',
		28: 'SLAP',
		29: 'SCRATCH PUSH',
		30: 'SCRATCH PULL',
		31: 'STICKS',
		32: 'SQUARE CLICK',
		33: 'METRONOME CLICK',
		34: 'METRONOME BELL',
		35: 'STANDARD KICK 2',
		36: 'STANDARD KICK 1',
		37: 'SIDE STICK',
		38: 'STANDARD SNARE 1',
		39: 'HAND CLAP',
		40: 'STANDARD SNARE 2',
		41: 'LOW TOM 2',
		42: 'CLOSED HI-HAT',
		43: 'LOW TOM 1',
		44: 'PEDAL HI-HAT',
		45: 'MID TOM 2',
		46: 'OPEN HI-HAT',
		47: 'MID TOM 1',
		48: 'HIGH TOM 2',
		49: 'CRASH CYMBAL 1',
		50: 'HIGH TOM 1',
		51: 'RIDE CYMBAL 1',
		52: 'CHINESE CYMBAL',
		53: 'RIDE BELL',
		54: 'TAMBOURINE',
		55: 'SPLASH CYMBAL',
		56: 'COWBELL',
		57: 'CRASH CYMBAL 2',
		58: 'VIBRA-SLAP',
		59: 'RIDE CYMBAL 2',
		60: 'HIGH BONGO',
		61: 'LOW BONGO',
		62: 'MUTE HIGH CONGA',
		63: 'OPEN HIGH CONGA',
		64: 'LOW CONGA',
		65: 'HIGH TIMBALE',
		66: 'LOW TIMBALE',
		67: 'HIGH AGOGO',
		68: 'LOW AGOGO',
		69: 'CABASA',
		70: 'MARACAS',
		71: 'SHORT HI WHISTLE',
		72: 'LONG LOW WHISTLE',
		73: 'SHORT GUIRO',
		74: 'LONG GUIRO',
		75: 'CLAVES',
		76: 'HIGH WOOD BLOCK',
		77: 'LOW WOOD BLOCK',
		78: 'MUTE CUICA',
		79: 'OPEN CUICA',
		80: 'MUTE TRIANGLE',
		81: 'OPEN TRIANGLE',
		82: 'SHAKER',
		83: 'JINGLE BELL',
		84: 'BELL TREE',
		85: 'CASTANETS',
		86: 'MUTE SURDO',
		87: 'OPEN SURDO',
	},
	// ROOM SET
	{
		38: 'ROOM SNARE 1',
		40: 'ROOM SNARE 2',
		41: 'ROOM LOW TOM 2',
		43: 'ROOM LOW TOM 1',
		45: 'ROOM MID TOM 2',
		47: 'ROOM MID TOM 1',
		48: 'ROOM HI TOM 2',
		50: 'ROOM HI TOM 1',
	},
	// POWER SET
	{
		35: 'POWER KICK 2',
		36: 'POWER KICK 1',
		38: 'POWER SNARE 1',
		40: 'POWER SNARE 2',
	},
	// ELECTRONIC SET
	{
		36: 'ELEC KICK',
		38: 'ELEC SNARE',
		40: 'DANCE SNARE',
		41: 'ELEC LOW TOM 2',
		43: 'ELEC LOW TOM 1',
		45: 'ELEC MID TOM 2',
		47: 'ELEC MID TOM 1',
		48: 'ELEC HI TOM 2',
		50: 'ELEC HI TOM 1',
		52: 'REVERSE CYMBAL',
	},
	// TR-808 SET
	{
		35: '909 KICK',
		36: '808 KICK',
		37: '808 RIM SHOT',
		38: '808 SNARE',
		40: '909 SNARE',
		41: '808 LOW TOM 2',
		42: '808 CHH 1',
		43: '808 LOW TOM 1',
		44: '808 CHH 2',
		45: '808 MID TOM 2',
		46: '808 OHH',
		47: '808 MID TOM 1',
		48: '808 HIGH TOM 2',
		49: '808 CYMBAL',
		50: '808 HIGH TOM 1',
		56: '808 COWBELL',
		62: '808 HIGH CONGA',
		63: '808 MID CONGA',
		64: '808 LOW CONGA',
		70: '808 MARACAS',
		75: '808 CLAVES',
	},
	// JAZZ SET
	{
		35: 'JAZZ KICK 2',
		36: 'JAZZ KICK 1',
		38: 'JAZZ SNARE 1',
		40: 'JAZZ SNARE 2',
	},
	// BRUSH SET
	{
		38: 'BRUSH TAP',
		39: 'BRUSH SLAP',
		40: 'BRUSH SWIRL',
	},
	// ORCHESTRA SET
	{
		27: 'CLOSED HI-HAT',
		28: 'PEDAL HI-HAT',
		29: 'OPEN HI-HAT',
		30: 'RIDE CYMBAL 1',
		35: 'JAZZ KICK 1',	// The samples for "JAZZ KICK 1" exist in duplicate.
		36: 'CONCERT BASS DRUM',
		38: 'CONCERT SNARE',
		39: 'CASTANETS',
		40: 'CONCERT SNARE',
		41: 'TIMPANI F',
		42: 'TIMPANI F#',
		43: 'TIMPANI G',
		44: 'TIMPANI G#',
		45: 'TIMPANI A',
		46: 'TIMPANI A#',
		47: 'TIMPANI B',
		48: 'TIMPANI c',
		49: 'TIMPANI c#',
		50: 'TIMPANI d',
		51: 'TIMPANI d#',
		52: 'TIMPANI e',
		53: 'TIMPANI f',
		57: 'CONCERT CYMBAL 2',
		59: 'CONCERT CYMBAL 1',
		88: 'APPLAUSE',
	},
];
console.assert(drumNames.length === 8);

export function binToJsonForGZ70SP(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		samples: null,
		tones: null,
		drumMaps: null,
	};

	// Samples
	console.assert(isValidRange(memMap.samples));
	json.samples = makeSamples(allBytes.slice(...memMap.samples));

	// Tones
	json.tones = makeTones(allBytes, memMap);

	// Adds sample names.
	addSampleNames(json);

	// Drum Map
	console.assert(isValidRange(memMap.tableDrums));
	json.drumMaps = makeDrumMaps(allBytes.slice(...memMap.tableDrums), json);

	removePrivateProp(json);

	return json;
}

function makeSamples(bytes) {
	console.assert(bytes?.length);

	const samples = [];
	const samplePackets = splitArrayByN(bytes, 16);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const view = new DataView(sampleBytes.buffer);
		verifyData(sampleBytes[6] === 0x00 && sampleBytes[7] === 0x00);

		const sample = {
			sampleNo,
			level:     sampleBytes[14],
			exponent:  sampleBytes[15],
			pitch:     view.getInt16(12, true),
			addrBegin: makeValue3ByteLE(sampleBytes.slice(0, 3))  & 0x3fffff,
			addrLoop:  makeValue3ByteLE(sampleBytes.slice(8, 11)) & 0x3fffff,
			addrEnd:   makeValue3ByteLE(sampleBytes.slice(3, 6))  & 0x3fffff,
			name:      null,
		};
		verifyData(sample.addrBegin <  sample.addrEnd  || sample.sampleNo === 125);	// Sample #125 is empty data.
		verifyData(sample.addrBegin <= sample.addrLoop || sample.sampleNo === 612);	// Sample #612 (for "BIRD") seems have wrong loop address. (probably a bug)
		verifyData(sample.addrLoop  <= sample.addrEnd);
		samples.push(sample);
	});

	return samples;
}

function makeTones(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	console.assert(isValidRange(memMap.tones));
	const tonePackets = splitArrayByN(allBytes.slice(...memMap.tones), 28);

	console.assert(isValidRange(memMap.tableSampleOffsets));
	const tableSampleOffsets = splitArrayByN(allBytes.slice(...memMap.tableSampleOffsets), 256).map((tableBytes) => splitArrayByN(tableBytes, 2).map((e) => makeValue2ByteLE(e)));

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < tonePackets.length) {
		const numVoices = ((tonePackets[index][3] & 0x80) === 0) ? 1 : 2;

		const voices = [];
		for (let i = 0; i < numVoices; i++) {
			const voiceBytes = tonePackets[index];
			const view = new DataView(voiceBytes.buffer);
			verifyData(voiceBytes[0] === 0x00 && voiceBytes[6] === 0x00 && voiceBytes[8] === 0x00 && voiceBytes[10] === 0x00 && voiceBytes[12] === 0x00 && view.getUint16(14, true) === 0x0000 && view.getUint16(16, true) === 0x7000 && voiceBytes[24] === 0x00 && voiceBytes[26] === 0x00);

			const sampleTableNo = voiceBytes[1];
			const sampleBase = view.getUint16(2, true) & 0x0fff;
			const sampleNos = tableSampleOffsets[sampleTableNo].map((e) => sampleBase + e);
			const voice = {
				pitchKeyFollow: (voiceBytes[3] & 0x70) >> 4,
				pitchTune:      view.getInt16(4, true),
				panpot:         view.getInt8(11),
				velSensDepth:   view.getUint8(25),
				velSensOffset:  view.getUint8(27),
				sampleSlots:    sampleNos.map((sampleNo) => ({
					sampleNo,
					sampleRef: {
						$ref: `#/samples/${sampleNo}`,
						name: null,
					},
				})),
				_sampleNos:     sampleNos,
			};
			voices.push(voice);
			index++;
		}

		const tone = {
			toneNo,
			name: toneNames[toneNo],
			voices,
		};
		tones.push(tone);
		toneNo++;
	}

	return tones;
}

function makeDrumMaps(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.tones));

	const drumMaps = [];
	const tableDrums = splitArrayByN(bytes, 2);
	tableDrums.forEach(([prog, toneNo]) => {
		const drumProg = {
			prog, toneNo,
			toneRef: {
				$ref: `#/tones/${toneNo}`,
				name: json.tones[toneNo].name,
			},
		};
		drumMaps.push(drumProg);
	});

	return drumMaps;
}

function addSampleNames(json) {
	console.assert(Array.isArray(json?.tones) && Array.isArray(json?.samples));

	// Makes sample names from tone names.
	const sampleNames = [...new Array(json.samples.length)].fill(null);
	json.tones.forEach((tone, toneNo) => {
		let loopNum = tone.voices.length;
		if (loopNum > 1) {
			const samples0 = new Set(tone.voices[0]._sampleNos);
			const samples1 = new Set(tone.voices[1]._sampleNos);
			if (samples0.size === samples1.size && [...samples0].every((e) => samples1.has(e))) {
				loopNum = 1;
			}
		}

		if (toneNo < 128) {	// normal tone
			for (let i = 0; i < loopNum; i++) {
				const samples = [...new Set(tone.voices[i]._sampleNos)];
				for (let j = 0; j < samples.length; j++) {
					const sampleNo = samples[j];
					const suffix = (samples.length > 1 || loopNum > 1) ? ` #${j + 1}${(loopNum > 1) ? 'ab'[i] : ''}` : '';
					if (!sampleNames[sampleNo]) {
						sampleNames[sampleNo] = `${toneNames[toneNo].toLowerCase()}${suffix}`;
					}
				}
			}
		} else {	// drum set
			const drumSet = (toneNo - 128) & 0x07;
			verifyData(tone.voices.length === 1);
			const sampleNos = tone.voices[0]._sampleNos;
			for (let noteNo = 0; noteNo < sampleNos.length; noteNo++) {
				const sampleNo = sampleNos[noteNo];
				if (drumNames[drumSet][noteNo] && !sampleNames[sampleNo]) {
					sampleNames[sampleNo] = drumNames[drumSet][noteNo].toLowerCase();
				}
			}
		}
	});
	for (let i = 0; i < sampleNames.length; i++) {
		if (!sampleNames[i]) {
			sampleNames[i] = `(Sample #${i})`;
		}
	}

	// Adds sample names to samples.
	json.samples.forEach((sample, i) => {
		sample.name = sampleNames[i];
	});

	// Adds sample names to tones.
	json.tones.forEach((tone) => tone.voices.forEach((voice) => voice.sampleSlots.forEach((sampleSlot) => {
		sampleSlot.sampleRef.name = sampleNames[sampleSlot.sampleNo];
	})));
}
