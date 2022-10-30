import {splitArrayByN, verifyData} from './bin2json_common.js';

const sampleNames = [
	'Acoustic Bass Drum',
	'Acoustic Snare Drum',
	'Electric Snare Drum',
	'Acoustic Tom Tom',
	'Closed Hi-Hat Attack',
	'Open Hi-Hat (Loop)',
	'Crash Cymbal Attack',
	'Crash Cymbal (Loop)',
	'Ride Cymbal',
	'Rim Shot',
	'Hand Clap',
	'Mute Conga',
	'High (Low) Conga',
	'Bongo',
	'Cowbell',
	'Tambourine',
	'Agogo Bell',
	'Claves',
	'Timbale',
	'Cabasa',
	'Acoustic Piano Thump',
	'Hammond Organ',
	'Trombone',
	'Trumpet',
	'Breath Noise (Loop)',
	'Clarinet',
	'Flute',
	'Steamer',
	'Shakuhachi',
	'Alto Sax',
	'Baritone Sax',
	'Marimba',
	'Vibraphone',
	'Xylophone',
	'Wind Bell',
	'Fretless Bass',
	'Slap Bass Attack',
	'Slap Bass (Loop)',
	'Acoustic Bass',
	'Gut Guitar',
	'Steel Guitar',
	'Pizzicato Strings',
	'Harp',
	'Harpsichord (Loop)',
	'Contrabass',
	'Violin',
	'Timpani',
	'Orchestra Hit',
	'Indian Flute',
	'Hammond Organ (Loop)',
	'Bell (Loop)',
	'Telephone Bell (Loop)',
	'Ethnic (Loop)',
	'Stainless Steel (Loop)',
	'Acoustic Bass Drum *',
	'Acoustic Snare Drum *',
	'Electric Snare Drum *',
	'Acoustic Tom Tom *',
	'Closed Hi-Hat Attack *',
	'Open Hi-Hat (Loop) *',
	'Crash Cymbal Attack *',
	'Crash Cymbal (Loop) *',
	'Ride Cymbal *',
	'Rim Shot *',
	'Hand Clap *',
	'Mute Conga *',
	'High (Low) Conga *',
	'Bongo *',
	'Cowbell *',
	'Tambourine *',
	'Agogo Bell *',
	'Claves *',
	'Timbale *',
	'Cabasa *',
	'Loop-1',
	'Loop-2',
	'Loop-3',
	'Loop-4',
	'Loop-5',
	'Loop-6',
	'Loop-7',
	'Loop-8',
	'Loop-9',
	'Loop-10',
	'Loop-11',
	'Loop-12',
	'Loop-13',
	'Loop-14',
	'Loop-15',
	'Loop-16',
	'Loop-17',
	'Loop-18',
	'Loop-19',
	'Loop-20',
	'Loop-21',
	'Loop-22',
	'Loop-23',
	'Loop-24',
	'Loop-25',
	'Loop-26',
	'Loop-27',
	'Loop-28',
	'Loop-29',
	'Loop-30',
	'Loop-31',
	'Loop-32',
	'Loop-33',
	'Loop-34',
	'Loop-35',
	'Loop-36',
	'Loop-37',
	'Loop-38',
	'Loop-39',
	'Loop-40',
	'Loop-41',
	'Loop-42',
	'Loop-43',
	'Loop-44',
	'Loop-45',
	'Jam-1 (Loop)',
	'Jam-2 (Loop)',
	'Jam-3 (Loop)',
	'Jam-4 (Loop)',
	'Jam-5 (Loop)',
	'Jam-6 (Loop)',
	'Jam-7 (Loop)',
	'Jam-8 (Loop)',
	'Jam-9 (Loop)',
	'Laugh *',
	'Applause * ',
	'Windchime *',
	'Crash *',
	'Train *',
	'Windy *',
	'Bird *',
	'Stream *',
	'Creak *',
	'Scream *',
	'Punch *',
	'Steps *',
	'Door Slam *',
	'Car Start *',
	'Jetplane *',
	'Gun Shot *',
	'Horse *',
	'Thunder *',
	'Bubble *',
	'Heart *',
	'Engine *',
	'Car Stop *',
	'Siren *',
	'Helicopter *',
	'Dog Bark *',
	'Car Pass *',
	'Male Voice *',
	'Machine Gun *',
	'Starship *',
	'Laugh (Loop) *',
	'Applause (Loop) * ',
	'Windchime (Loop) *',
	'Crash (Loop) *',
	'Train (Loop) *',
	'Windy (Loop) *',
	'Bird (Loop) *',
	'Stream (Loop) *',
	'Creak (Loop) *',
	'Scream (Loop) *',
	'Punch (Loop) *',
	'Steps (Loop) *',
	'Door Slam (Loop) *',
	'Car Start (Loop) *',
	'Jetplane (Loop) *',
	'Gun Shot (Loop) *',
	'Horse (Loop) *',
	'Thunder (Loop) *',
	'Bubble (Loop) *',
	'Heart (Loop) *',
	'Engine (Loop) *',
	'Car Stop (Loop) *',
	'Siren (Loop) *',
	'Helicopter (Loop) *',
	'Dog Bark (Loop) *',
	'Car Pass (Loop) *',
	'Male Voice (Loop) *',
	'Machine Gun (Loop) *',
	'Starship (Loop) *',
	'Jam-10 (Loop)',
	'Jam-11 (Loop)',
	'Jam-12 (Loop)',
	'Jam-13 (Loop)',
	'Jam-14 (Loop)',
	'Jam-15 (Loop)',
	'Jam-16 (Loop)',
	'Jam-17 (Loop)',
	'Jam-18 (Loop)',
	'Jam-19 (Loop)',
	'Jam-20 (Loop)',
	'Jam-21 (Loop)',
	'Jam-22 (Loop)',
	'Jam-23 (Loop)',
	'Jam-24 (Loop)',
	'Jam-25 (Loop)',
	'Jam-26 (Loop)',
	'Jam-27 (Loop)',
	'Jam-28 (Loop)',
	'Jam-29 (Loop)',
	'Jam-30 (Loop)',
	'Jam-31 (Loop)',
	'Jam-32 (Loop)',
	'Jam-33 (Loop)',
	'Jam-34 (Loop)',
	'Jam-35 (Loop)',
	'Jam-36 (Loop)',
	'Jam-37 (Loop)',
	'Jam-38 (Loop)',
	'Jam-39 (Loop)',
	'Jam-40 (Loop)',
	'Jam-41 (Loop)',
	'Jam-42 (Loop)',
	'Jam-43 (Loop)',
	'Jam-44 (Loop)',
	'Jam-45 (Loop)',
	'Jam-46 (Loop)',
	'Jam-47 (Loop)',
	'Jam-48 (Loop)',
	'Jam-49 (Loop)',
	'Shot-1',
	'Shot-2',
	'Shot-3',
	'Shot-4',
	'Shot-5',
	'Shot-6',
	'Shot-7',
	'Shot-8',
	'Shot-9',
	'Shot-10',
	'Shot-11',
	'Shot-12',
	'Shot-13',
	'Shot-14',
	'Shot-15',
	'Shot-16',
	'Shot-17',
	'Shot-18',
	'Shot-19',
	'Shot-20',
	'Shot-21',
	'Shot-22',
	'Shot-23',
	'Shot-24',
	'Shot-25',
	'Shot-26',
	'Shot-27',
	'Shot-28',
	'Shot-29',
	'Shot-30',
];
console.assert(sampleNames.length === 256);

export function binToJsonForCM32L(allBytes, memMap) {
	const json = {
		tones: null,
		drumSet: null,
		samples: null,
	};

	if (memMap.samples) {
		json.samples = makeSamples(allBytes.slice(...memMap.samples));
	}
	if (memMap.tonesRanges) {
		const tonesBytes = memMap.tonesRanges.map((range) => [...allBytes.slice(...range)]);
		tonesBytes.splice(2, 0, (new Array(14 * 64)).fill(0));	// For User Timbres
		json.tones = makeTones([].concat(...tonesBytes), json);
	}
	if (memMap.drumSet) {
		json.drumSet = makeDrumSet(allBytes.slice(...memMap.drumSet), json);
	}

	return json;
}

function makeTones(bytes, json) {
	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const numVoices = [0, 1,  , 2,  ,  ,  , 3,  ,  ,  ,  ,  ,  ,  , 4][bytes[index + 0x0c]];
//		const numVoices = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4][bytes[index + 0x0c]];
		verifyData(0 <= numVoices && numVoices <= 4);
		const size = 14 + 58 * numVoices;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);
		const voicePackets = splitArrayByN(toneBytes.slice(14), 58);

		const name = String.fromCharCode(...commonBytes.slice(0, 10));
		const isPcm = [...commonBytes.slice(10, 12)].map((e) => [
			[false, false],	// Structure 1
			[false, false],	// Structure 2
			[true,  false],	// Structure 3
			[true,  false],	// Structure 4
			[false, true],	// Structure 5
			[true,  true],	// Structure 6
			[true,  true],	// Structure 7
			[false, false],	// Structure 8
			[true,  true],	// Structure 9
			[false, false],	// Structure 10
			[true,  false],	// Structure 11
			[false, true],	// Structure 12
			[true,  true],	// Structure 13
		][e]).flat();
		console.assert(isPcm.length === 4);

		const tone = {
			toneNo, name,
			commonBytes: [...commonBytes],
			voices: [],
		};

		voicePackets.forEach((voiceBytes, i) => {
			const voice = {bytes: [...voiceBytes]};
			if (isPcm[i]) {
				const sampleNo = (voiceBytes[4] >> 1) * 128 + voiceBytes[5];
				voice.sampleNo = sampleNo;
				voice.sample = {
					name: json.samples[sampleNo].name,
					$ref: `#/samples/${sampleNo}`,
				};
			}
			tone.voices.push(voice);
		});

		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeDrumSet(bytes, json) {
	console.assert(json && json.tones);
	const drumSet = {
		notes: {},
	};

	const packets = splitArrayByN(bytes, 4);
	for (let i = 0; i < packets.length; i++) {
		const packet = packets[i];
		const noteNo = 24 + i;
		const toneNo = 128 + packet[0];
		const note = {
			toneNo,
			tone: {
				name: json.tones[toneNo].name,
				$ref: `#/tones/${toneNo}`,
			},
			bytes: packet,
			level: packet[1],
			panpot: packet[2],
			isReverbOn: (packet[3] !== 0x00),
		};
		drumSet.notes[noteNo] = note;
	}

	return drumSet;
}

function makeSamples(bytes) {
	return splitArrayByN(bytes, 4).map((packet, sampleNo) => ({
		sampleNo,
		name:      sampleNames[sampleNo],
		address:   packet[0] * 0x0800,
		length:    0x800 << ((packet[1] & 0x70) >> 4),
		pitch:     (packet[3] << 8) | packet[2],
		isLooped:  (packet[1] & 0x80) !== 0,
		isTunable: (packet[1] & 0x01) === 0,
	}));
}
