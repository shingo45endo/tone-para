import {splitArrayByN, isValidRange, verifyData} from './bin2json_common.js';

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
	console.assert(allBytes?.length && memMap);

	const json = {
		samples: null,
		tones: null,
		drumSet: null,
	};

	// Samples
	console.assert(isValidRange(memMap.samples));
	json.samples = makeSamples(allBytes.slice(...memMap.samples));

	// Tones
	console.assert(Array.isArray(memMap.tonesRanges));
	json.tones = makeTones(allBytes, memMap.tonesRanges, json);

	// Drum Set
	console.assert(isValidRange(memMap.drumSet));
	json.drumSet = makeDrumSet(allBytes.slice(...memMap.drumSet), json);

	return json;
}

function makeSamples(bytes) {
	console.assert(bytes?.length);

	const samples = [];
	const samplePackets = splitArrayByN(bytes, 4);
	samplePackets.forEach((sampleBytes, sampleNo) => {
		const sample = {
			sampleNo,
			name:      sampleNames[sampleNo],
			pitch:     (sampleBytes[3] << 8) | sampleBytes[2],
			length:    0x800 << ((sampleBytes[1] & 0x70) >> 4),
			addrBegin: sampleBytes[0] * 0x0800,
			isLooped:  (sampleBytes[1] & 0x80) !== 0,
			isTunable: (sampleBytes[1] & 0x01) === 0,
		};
		samples.push(sample);
	});

	return samples;
}

function makeTones(allBytes, tonesRanges, json) {
	console.assert(allBytes?.length && Array.isArray(tonesRanges) && tonesRanges.every((range) => isValidRange(range)) && Array.isArray(json?.samples));

	const regions = tonesRanges.map((range) => [...allBytes.slice(...range)]);
	regions.splice(2, 0, (new Array(14 * 64)).fill(0));	// For User Timbres
	const regionBytes = [].concat(...regions);

	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < regionBytes.length) {
		const numVoices = [0, 1,  , 2,  ,  ,  , 3,  ,  ,  ,  ,  ,  ,  , 4][regionBytes[index + 0x0c]];
//		const numVoices = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4][regionBytes[index + 0x0c]];
		verifyData(0 <= numVoices && numVoices <= 4);
		const size = 14 + 58 * numVoices;
		const toneBytes = regionBytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);
		const voicePackets = splitArrayByN(toneBytes.slice(14), 58);

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

		const voices = voicePackets.map((voiceBytes, i) => {
			const voice = {
				bytes: [...voiceBytes],
			};
			if (isPcm[i]) {
				const sampleNo = (voiceBytes[4] >> 1) * 128 + voiceBytes[5];
				Object.assign(voice, {
					sampleNo,
					sampleRef: {
						$ref: `#/samples/${sampleNo}`,
						name: json.samples[sampleNo].name,
					},
				});
			}
			return voice;
		});

		const tone = {
			toneNo,
			name: String.fromCharCode(...commonBytes.slice(0, 10)).replace(/\x00/ug, ' '),
			commonBytes: [...commonBytes],
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeDrumSet(bytes, json) {
	console.assert(bytes?.length && json?.tones);

	const notes = {};
	const drumNotePackets = splitArrayByN(bytes, 4);
	drumNotePackets.forEach((drumNoteBytes, i) => {
		const noteNo = 24 + i;
		const toneNo = 128 + drumNoteBytes[0];
		const note = {
			bytes: [...drumNoteBytes],
			level: drumNoteBytes[1],
			panpot: drumNoteBytes[2],
			isReverbOn: (drumNoteBytes[3] !== 0x00),
			toneNo,
			toneRef: {
				$ref: `#/tones/${toneNo}`,
				name: json.tones[toneNo].name,
			},
		};
		notes[noteNo] = note;
	});

	const drumSet = {
		notes,
	};

	return drumSet;
}
