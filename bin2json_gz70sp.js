import {splitArrayByN, removePrivateProp} from './bin2json_common.js';

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

export function binToJsonForGZ70SP(bytes, regions) {
	const json = {};

	if (regions.tableSampleOffsets) {
		json._tableSampleOffsets = splitArrayByN(bytes.slice(...regions.tableSampleOffsets), 256).map((tableBytes) => splitArrayByN(tableBytes, 2).map((e) => (new DataView(e.buffer)).getUint16(0, true)));
	}
	if (regions.tones && regions.tableSampleOffsets) {
		json.tones = makeTones(bytes.slice(...regions.tones), json);
	}
	if (regions.samples && regions.tones && regions.tableSampleOffsets) {
		json.samples = makeSamples(bytes.slice(...regions.samples), json);

		// Sets sample names.
		json.tones.forEach((tone) => tone.voices.forEach((voice) => voice.samples.forEach((sample) => {
			sample.name = json.samples[sample.sampleNo].name;
		})));
	}
	if (regions.tableDrums) {
		json.progDrums = makeProgDrums(bytes.slice(...regions.tableDrums), json);
	}

	removePrivateProp(json);

	return json;
}

function makeTones(bytes, json) {
	const voicePackets = splitArrayByN(bytes, 28);

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < voicePackets.length) {
		const numVoices = ((voicePackets[index][3] & 0x80) === 0) ? 1 : 2;

		const tone = {
			toneNo,
			name: toneNames[toneNo],
			voices: [],
		};

		for (let i = 0; i < numVoices; i++) {
			const voiceBytes = voicePackets[index];
			const view = new DataView(voiceBytes.buffer);
			console.assert(voiceBytes[0] === 0x00 && voiceBytes[6] === 0x00 && voiceBytes[8] === 0x00 && voiceBytes[10] === 0x00 && voiceBytes[12] === 0x00 && view.getUint16(14, true) === 0x0000 && view.getUint16(16, true) === 0x7000 && voiceBytes[24] === 0x00 && voiceBytes[26] === 0x00);

			const sampleTableNo = voiceBytes[1];
			const sampleBase = view.getUint16(2, true) & 0x0fff;
			const sampleNos = json._tableSampleOffsets[sampleTableNo].map((e) => sampleBase + e);
			const voice = {
				pitchKeyFollow: (voiceBytes[3] & 0x70) >> 4,
				pitchTune:      view.getInt16(4, true),
				panpot:         view.getInt8(11),
				velSensDepth:   view.getUint8(25),
				velSensOffset:  view.getUint8(27),
				samples:        sampleNos.map((sampleNo) => ({sampleNo, name: null, $ref: `#/samples/${sampleNo}`})),
				_sampleNos:     sampleNos,
			};
			tone.voices.push(voice);
			index++;
		}

		tones.push(tone);
		toneNo++;
	}

	return tones;
}

function makeSamples(bytes, json) {
	const samplePackets = splitArrayByN(bytes, 16);

	// Makes sample names from tone names.
	const sampleNames = [...new Array(samplePackets.length)].fill(null);
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
			console.assert(tone.voices.length === 1);
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

	const samples = [];
	for (let sampleNo = 0; sampleNo < samplePackets.length; sampleNo++) {
		const sampleBytes = samplePackets[sampleNo];
		const view = new DataView(sampleBytes.buffer);
		console.assert(sampleBytes[6] === 0x00 && sampleBytes[7] === 0x00);

		const sample = {
			sampleNo,
			name:      sampleNames[sampleNo],
			level:     sampleBytes[14],
			pitch:     view.getInt16(12, true),
			exponent:  sampleBytes[15],
			startAddr: ((sampleBytes[2] << 16) | (sampleBytes[1] << 8) | sampleBytes[0]) & 0x3fffff,
			endAddr:   ((sampleBytes[5] << 16) | (sampleBytes[4] << 8) | sampleBytes[3]) & 0x3fffff,
			loopAddr:  ((sampleBytes[10] << 16) | (sampleBytes[9] << 8) | sampleBytes[8]) & 0x3fffff,
		};
		samples.push(sample);
	}

	return samples;
}

function makeProgDrums(bytes, json) {
	const tableDrums = splitArrayByN(bytes, 2);
	return tableDrums.map(([prog, toneNo]) => ({
		prog, toneNo,
		tone: {
			name: json.tones[toneNo].name,
			$ref: `#/tones/${toneNo}`,
		},
	}));
}