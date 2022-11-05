import {makeValue2ByteLE, splitArrayByN, isValidRange, verifyData} from './bin2json_common.js';

const drumToneNames = [
	'BOB BD',
	'BOB Rim',
	'BOB SD',
	'BOB Low Tom 2',
	'BOB Close HH',
	'BOB Low Tom 1',
	'BOB Mid Tom 2',
	'BOB Open HH',
	'BOB Mid Tom 1',
	'BOB Hi Tom 2',
	'BOB Cym',
	'BOB Hi Tom 1',
	'BOB Cowbell',
	'BOB Hi Conga',
	'BOB Mid Conga',
	'BOB Low Conga',
	'BOB Maracas',
	'BOB Claves',
	'MONDO BD',
	'Gated SD',
	'Power Low Tom 2',
	'Power Low Tom 1',
	'Power Mid Tom 2',
	'Power Mid Tom 1',
	'Power Hi Tom 2',
	'Power Hi Tom 1',
	'**MUTE**',
	'High Q',
	'Slap',
	'Scratch Push',
	'Scratch Pull',
	'Sticks',
	'Square Click',
	'Metronome Click',
	'Metronome Bell',
	'Acoustic BD 2',
	'Acoustic BD 1',
	'Side Stick',
	'Acoustic SD 1',
	'Hand Clap',
	'Acoustic SD 2',
	'Low Floor Tom',
	'Closed HH',
	'Hi Floor Tom',
	'Pedal HH',
	'Low Tom',
	'Open HH',
	'Low Mid Tom',
	'Hi Mid Tom',
	'Top Cym 1',
	'High Tom',
	'Side Cym 1',
	'China Cym',
	'Ride Bell',
	'Tambourine',
	'Splash Cym',
	'Cowbell',
	'Top Cym 2',
	'Vibraslap',
	'Side Cym 2',
	'Hi Bongo',
	'Low Bongo',
	'Mute Hi Conga',
	'Open Hi Conga',
	'Low Conga',
	'Hi Timbale',
	'Low Timbale',
	'Hi Agogo',
	'Low Agogo',
	'Cabasa',
	'Maracas',
	'Short Whistle',
	'Long Whistle',
	'Short Guiro',
	'Long Guiro',
	'Claves',
	'Hi Wood Block',
	'Loe Wood Block',
	'Mute Cuica',
	'Open Cuica',
	'Mute Triangle',
	'Open Triangle',
	'Shaker',
	'Jingle Bel',
	'Belltree',
	'Castanet',
	'Mute Surdo',
	'Open Surdo',
	'Elec BD',
	'Elec SD',
	'Elec Low Tom 2',
	'Elec Low Tom 1',
	'Elec Mid Tom 2',
	'Elec Mid Tom 1',
	'Elec Hi Tom 2',
	'Elec Hi Tom 1',
	'Reverse Cym',
	'Brush Tap',
	'Brush Slap',
	'Brush Swirl',
	'Jazz BD',
	'Orch BD 2',
	'Orch BD 1',
	'Orch SD',
	'Timpani F',
	'Timpani F#',
	'Timpani G',
	'Timpani G#',
	'Timpani A',
	'Timpani A#',
	'Timpani B',
	'Timpani c',
	'Timpani c#',
	'Timpani d',
	'Timpani d#',
	'Timpani e',
	'Timpani f',
	'Orch Cym 2',
	'Orch Cym 1',
	'Applause',
	'Room Low Tom 2',
	'Room Low Tom 1',
	'Room Mid Tom 2',
	'Room Mid Tom 1',
	'Room Hi Tom 2',
	'Room Hi Tom 1',
	'Effect Clap',
	'Echo Grass',
];
console.assert(drumToneNames.length === 128);

export function binToJsonForGMegaLx(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		tones: null,
		drumTones: null,
		drumSets: null,
	};

	// Tones
	json.tones = makeTones(allBytes, memMap);

	// Drum Tones
	console.assert(isValidRange(memMap.drumToneParams));
	json.drumTones = makeDrumTones(allBytes.slice(...memMap.drumToneParams));

	// Drum Sets
	console.assert(isValidRange(memMap.tableDrumNotes));
	json.drumSets = makeDrumSets(allBytes.slice(...memMap.tableDrumNotes), json);

	return json;
}

function makeTones(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	console.assert(isValidRange(memMap.toneNames));
	const toneNames = splitArrayByN(allBytes.slice(...memMap.toneNames), 8).map((bytes) => String.fromCharCode(...bytes));
	console.assert(toneNames.length === 167);
	verifyData(toneNames.every((e) => /^[\x20-\x7f]*$/u.test(e)));

	console.assert(isValidRange(memMap.tableToneAddrs));
	const tableToneAddrs = splitArrayByN(allBytes.slice(...memMap.tableToneAddrs), 2).map((e) => makeValue2ByteLE(e));
	console.assert(tableToneAddrs.length === 160);

	const tones = [];
	for (let toneNo = 0; toneNo < tableToneAddrs.length; toneNo++) {
		const addr = 0x10000 + tableToneAddrs[toneNo];
		const tone = {
			toneNo,
			name: toneNames[toneNo],
			bytes: [...allBytes.slice(addr, addr + 12)],	// TODO: Confirm.
		};
		tones.push(tone);
	}
	for (let toneNo = tableToneAddrs.length; toneNo < toneNames.length; toneNo++) {
		const tone = {
			toneNo,
			name: toneNames[toneNo],
			voices: [],
		};
		tones.push(tone);
	}

	return tones;
}

function makeDrumTones(bytes) {
	console.assert(bytes?.length);

	const drumTones = [];
	const drumToneParamsPackets = splitArrayByN(bytes, 23);
	console.assert(drumToneParamsPackets.length === 128);
	drumToneParamsPackets.forEach((drumToneParamsBytes, drumToneNo) => {
//		const drumWaveNo = drumToneParamsBytes[22];
		const voice = {
			bytes: [...drumToneParamsBytes],
//			drumWaveNo,
//			drumWaveRef: {
//				$ref: `#/drumWaves/${drumWaveNo}`,
//				name: drumToneWaveNames[drumWaveNo],
//			},
		};
		const drumTone = {
			drumToneNo,
			name: drumToneNames[drumToneNo],
			voices: [voice],
		};
		drumTones.push(drumTone);
	});

	return drumTones;
}

function makeDrumSets(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.tones) && Array.isArray(json?.drumTones));

	const drumSets = [];
	const drumSetPackets = splitArrayByN(bytes, 128);
	drumSetPackets.forEach((drumSetBytes, drumSetNo) => {
		const notes = {};
		drumSetBytes.forEach((drumToneNo, noteNo) => {
			const note = {
				drumToneNo,
				drumToneRef: {
					$ref: `#/drumTones/${drumToneNo}`,
					name: json.drumTones[drumToneNo].name,
				},
			};
			notes[noteNo] = note;
		});

		const drumSet = {
			drumSetNo,
			name: json.tones[160 + drumSetNo].name,
			notes,
		};
		drumSets.push(drumSet);
	});

	return drumSets;
}
