import {splitArrayByN, isValidRegion} from './bin2json_common.js';

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

export function binToJsonForGMegaLx(bytes, regions) {
	console.assert(bytes && regions && Object.values(regions).every((e) => isValidRegion(e)));

	const json = {};

	// Tones
	json.tones = makeTones(bytes, regions);
	console.assert(regions.drumToneParams);
	json.drumTones = makeDrumTones(bytes.slice(...regions.drumToneParams), json);

	// Drum Sets
	console.assert(regions.tableDrumNotes);
	json.drumSets = makeDrumSets(bytes.slice(...regions.tableDrumNotes), json);

	return json;
}

function makeTones(bytes, regions) {
	console.assert(regions.toneNames && regions.tableToneAddr);

	const toneNames = splitArrayByN(bytes.slice(...regions.toneNames), 8).map((bytes) => String.fromCharCode(...bytes));
	console.assert(toneNames.length === 167);
	const tableToneAddrs = splitArrayByN(bytes.slice(...regions.tableToneAddr), 2).map((e) => (e[1] << 8) | e[0]);
	console.assert(tableToneAddrs.length === 160);

	const tones = [];
	for (let toneNo = 0; toneNo < tableToneAddrs.length; toneNo++) {
		const addr = 0x10000 + tableToneAddrs[toneNo];
		tones.push({
			toneNo,
			name: toneNames[toneNo],
			bytes: [...bytes.slice(addr, addr + 12)],	// TODO: Confirm.
		});
	}
	for (let toneNo = tableToneAddrs.length; toneNo < toneNames.length; toneNo++) {
		tones.push({
			toneNo,
			name: toneNames[toneNo],
			voices: [],
		});
	}

	return tones;
}

function makeDrumTones(bytes, json) {
	const drumToneParamsPackets = splitArrayByN(bytes, 23);
	console.assert(drumToneParamsPackets.length === 128);

	const drumTones = [];
	drumToneParamsPackets.forEach((drumToneParamsBytes, drumToneNo) => {
//		const drumWaveNo = drumToneParamsBytes[22];
		const voices = [{
//			drumWaveNo,
			bytes: [...drumToneParamsBytes],
//			drumWave: {
//				name: drumToneWaveNames[drumWaveNo],
//				$ref: `#/drumWaves/${drumWaveNo}`,
//			},
		}];

		drumTones.push({
			drumToneNo,
			name: drumToneNames[drumToneNo],
			voices,
		});
	});

	return drumTones;
}

function makeDrumSets(bytes, json) {
	const drumSetPackets = splitArrayByN(bytes, 128);

	console.assert(Array.isArray(json?.tones) && Array.isArray(json?.drumTones));
	const drumSets = [];
	drumSetPackets.forEach((drumSetBytes, drumSetNo) => {
		const notes = drumSetBytes.reduce((results, drumToneNo, noteNo) => {
			results[noteNo] = {
				drumToneNo,
				drumTone: {
					name: json.drumTones[drumToneNo].name,
					$ref: `#/drumTones/${drumToneNo}`,
				},
			};
			return results;
		}, {});

		drumSets.push({
			drumSetNo,
			name: json.tones[160 + drumSetNo].name,
			notes,
		});
	});

	return drumSets;
}
