import {splitArrayByN, isValidRange} from './bin2json_common.js';

const toneWaveNames = [
	'SIN',
	'TRIANGLE',
	'PULSE',
	'RANDOM',
	'SAWTOOTH 1',
	'SAWTOOTH 2',
	'SAWTOOTH 3',
	'SQUARE 1',
	'SQUARE 2',
	'SQUARE 3',
	'RECTNGLR 1',
	'RECTNGLR 2',
	'RECTNGLR 3',
	'ROADS EP 2',
	'DELUXE EP 1',
	'DELUXE EP 2',
	'HRPSIC 1',
	'HRPSIC 2',
	'DRAW ORG 1',
	'DRAW ORG 2',
	'PERC ORG 1',
	'EL ORG 21',
	'EL ORG 22',
	'EL ORG 4',
	'CHRC ORG 1',
	'CHRC ORG 2',
	'PIP ORG 21',
	'PIP ORG 22',
	'PIP ORG 31',
	'PIP ORG 32',
	'REED ORG 1',
	'REED ORG 2',
	'ACORDION 1',
	'ACORDION 2',
	'HARMONICA',
	'TNG ACRD 1',
	'TNG ACRD 2',
	'JAZZ GT 1',
	'JAZZ GT 2',
	'OVDR GT',
	'SYN BRAS 3',
	'ENG HORN',
	'BASSOON',
	'RECORDER 1',
	'RECORDER 2',
	'WHISTLE 1',
	'WHISTLE 2',
	'OCARINA 1',
	'OCARINA 2',
	'CELESTA 2',
	'CELESTA 3',
	'GLOCKEN 1',
	'GLOCKEN 2',
	'MUSC BOX 2',
	'SQUARE 5',
	'SQUARE 6',
	'SAWTOOTH 5',
	'SAWTOOTH 6',
	'SAWTOOTH 7',
	'SAWTOOTH 8',
	'NEW AGE',
	'WARM 1',
	'WARM 2',
	'BOWED 1',
	'BOWED 2',
	'CRYSTAL 1',
	'CRYSTAL 2',
	'GOBLINS',
	'KALIMBA',
	'BAG PIPE',
	'SHANAI',
	'TNKLBELL 1',
	'TNKLBELL 2',
	'TNKLBELL 3',
	'TNKLBELL 4',
	'WINDBELL 1',
	'WINDBELL 2',
	'PIANO',
	'PIANO H 11',
	'PIANO H 12',
	'PIANO H 21',
	'PIANO H 22',
	'PIANO L',
	'PIANO SOFT',
	'ROADS 1',
	'ROADS 2',
	'CLAVI 1',
	'CLAVI 2',
	'CLAVI 3',
	'NYLN GT 1',
	'NYLN GT 2',
	'NYLN GT 3',
	'NYLN GT 4',
	'STEL GT 1',
	'STEL GT 2',
	'STEL GT 3',
	'CLEN GT 1',
	'CLEN GT 2',
	'CLEN GT 3',
	'DIST GT 1',
	'DIST GT 2',
	'DIST GT 3',
	'DIST GT 4',
	'DIST GT 5',
	'DIST GT 6',
	'GT HRMNICS',
	'A BAS 1',
	'A BAS 2',
	'A BAS 3',
	'FNGR BAS',
	'PICK BAS 1',
	'PICK BAS 2',
	'SLP BAS 11',
	'SLP BAS 12',
	'SLP BAS 21',
	'SLP BAS 22',
	'SLP BAS 23',
	'FRETLESS 1',
	'FRETLESS 2',
	'MUG SYN 1',
	'MUG SYN 2',
	'MUG SYN 3',
	'MUG SYN 4',
	'MUG SYN 5',
	'MUG SYN 6',
	'PRO SYN',
	'DELUXE BAS',
	'VIOLIN 1',
	'VIOLIN 2',
	'VIOLIN 3',
	'VIOLIN 4',
	'VIOLA',
	'CELLO 1',
	'CELLO 2',
	'CONTRA BAS',
	'PIZZ STR 1',
	'PIZZ STR 2',
	'ORC HARP 1',
	'ORC HARP 2',
	'STR ENS 1',
	'STR ENS 2',
	'STR ENS 3',
	'STR ENS 4',
	'STR ENS 5',
	'STR ENS 6',
	'STR ENS 7',
	'ORCHST HIT',
	'CHOIR AH 1',
	'CHOIR AH 2',
	'CHOIR AH 3',
	'CHOIR AH 4',
	'CHOIR AH 5',
	'VOICE OH 1',
	'VOICE OH 2',
	'VOICE OH 3',
	'VOICE OH 4',
	'VOICE OH 5',
	'VOICE OH 6',
	'VOICE OH 7',
	'TRUMPET 1',
	'TRUMPET 2',
	'MUTE TRUMP',
	'TROMBONE 1',
	'TROMBONE 2',
	'FRNCH HORN',
	'BRAS SEC 1',
	'BRAS SEC 2',
	'SYN BRS 1',
	'SYN BRS 2',
	'SYN BRS 3',
	'SYN BRS 4',
	'SYN BRS 5',
	'SYN BRS 6',
	'SYN BRS 7',
	'SYN BRS 8',
	'SYN BRS 9',
	'SYN BRS 10',
	'SYN BRS 11',
	'SYN BRS 12',
	'SYN BRS 13',
	'SYN BRS 14',
	'S SAX 1',
	'S SAX 2',
	'S SAX 3',
	'A SAX 1',
	'A SAX 2',
	'T SAX',
	'B SAX 1',
	'B SAX 2',
	'SAX SAMBO',
	'CLARINET',
	'OBOE 1',
	'OBOE 2',
	'OBOE 3',
	'FLUTE 1',
	'FLUTE 2',
	'FLUTE 3',
	'FLUTE 4',
	'PAN FLUTE',
	'SHAKUHAC 1',
	'SHAKUHAC 2',
	'BLW BOTL 1',
	'BLW BOTL 2',
	'BLW BOTL 3',
	'BLW BOTL 4',
	'BLW BOTL 5',
	'VIBRAPHN 1',
	'VIBRAPHN 2',
	'VIBRAPHN 3',
	'VIBRAPHN 4',
	'MARIMBA 1',
	'MARIMBA 2',
	'MARIMBA 3',
	'MARIMBA 4',
	'XYLOPHONE',
	'TUBULR BEL',
	'SITAR',
	'BANJO 1',
	'BANJO 2',
	'SHAMISEN',
	'KOTO',
	'TIMPANI',
	'NORM SD',
	'NORM TOM 1',
	'NORM TOM 2',
	'POWR TOM',
	'TOMS',
	'TOP CYM',
	'SIDE CYM',
	'REVERS CYM',
	'COWBELL',
	'AGOGO',
	'WOODBLOCK',
	'TRIANGLE',
	'JINGLE BEL',
	'WIND BEL',
	'CASTANETTS',
	'METRONOME',
	'STEEL DRUM',
	'TAIKO DRUM',
	'GT FRET',
	'BREATH 1',
	'BREATH 2',
	'WHIT NIS 1',
	'WHIT NIS 2',
	'WHIT NIS 3',
	'WHIT NIS 4',
	'BIRD 1',
	'BIRD 2',
	'BIRD 3',
	'TELEPHONE',
	'HELICOPTER',
	'APPLAUSE 1',
	'APPLAUSE 2',
	'METAL ECHO',
	'GUNSHOT',
];
console.assert(toneWaveNames.length === 256);

const drumToneWaveNames = [
	'BASIC 1',
	'BASIC 2',
	'BASIC 3',
	'BASIC 4',
	'BASIC 5',
	'NORM BD',
	'NORM BD',
	'GB2 BD',
	'MONDO KICK',
	'ELE BD',
	'BOB BD',
	'CONCERT BD',
	'NORM SD',
	'OLD SD',
	'POWER SD',
	'ELE SD',
	'BOB SD',
	'CONCERT SD',
	'RIM',
	'BOB RIM',
	'XSTICK',
	'BRUSH TAP',
	'BRUSH SLAP',
	'BRUSH SWIR',
	'NORM TOM',
	'TOM F',
	'POWER TOM',
	'HH CLOSE',
	'HH OPEN',
	'BOB OH',
	'TOP CYM',
	'SIDE CYM',
	'CHINA CYM',
	'SIDE BELL',
	'BOB CYM',
	'ORCH CYM',
	'CLAP',
	'METORONORM',
	'TAMBOURINE',
	'COWBELL',
	'VIBRASLAP',
	'BONGO',
	'CONGA MUTE',
	'CONGA',
	'TIMBALE',
	'AGOGO',
	'CABASA',
	'MARACAS',
	'WHISTLE 1',
	'WHISTLE 2',
	'GUIRO SHIRT',
	'GUIRO LONG',
	'CLAVES',
	'WOOD BLOCK',
	'CUICA',
	'TRIANGLE',
	'JINGLEBELL',
	'BELLTREE',
	'CASTANETS',
	'SURDO MUTE',
	'SURDO OPEN',
	'BOB COWBEL',
	'BOB CONGA',
	'BOB CLAVE',
	'TIMPANI',
	'WHIT NOISE',
	'SCRACH 1',
	'SCRACH 2',
	'APPLAUSE',
	'FRET NOISE',
	'NORM BD (Head Cut)',
	'GB2 BD (Head Cut)',
	'MONDO KICK (Head Cut)',
	'CONCERT BD (Head Cut)',
	'OLD SD (Head Cut)',
	'POWER SD (Head Cut)',
	'BOB SD (Head Cut)',
	'BRUSH SLAP (Head Cut)',
	'BRUSH SWIR (Head Cut)',
	'POWER TOM (Head Cut)',
	'HH CLOSE (Head Cut)',
	'CONGA (Head Cut)',
	'CABASA (Head Cut)',
	'SCRACH 1 (Head Cut)',
	'SCRACH 2 (Head Cut)',
	'FRET NOISE (Head Cut)',
	'GB2 BD (Loop)',
	'ELE BD 1 (Loop)',
	'ELE BD 2 (Loop)',
	'CONCERT BD (Loop)',
	'NORM SD 1 (Loop)',
	'NORM SD 2 (Loop)',
	'OLD SD (Loop)',
	'BOB SD (Loop)',
	'CONCRT SD 1 (Loop)',
	'CONCRT SD 2 (Loop)',
	'RIM 1 (Loop)',
	'RIM 2 (Loop)',
	'BOB RIM (Loop)',
	'XSTICKS (Loop)',
	'BRUSH SLP 1 (Loop)',
	'BRUSH SLP 2 (Loop)',
	'BRUSH SWIR (Loop)',
	'NORM TOM (Loop)',
	'TOM F 1 (Loop)',
	'TOM F2 (Loop)',
	'TOM F3 (Loop)',
	'POWER TOM (Loop)',
	'HH OPEN (Loop)',
	'BOB OHH 1 (Loop)',
	'BOB OHH 2 (Loop)',
	'TOP CYM 1 (Loop)',
	'TOP CYM 2 (Loop)',
	'SIDE CYM (Loop)',
	'CLAP (Loop)',
	'TAMBURIN 1 (Loop)',
	'TAMBURIN 2 (Loop)',
	'COWBELL (Loop)',
	'VIBRASLAP (Loop)',
	'BONGO (Loop)',
	'CONGA (Loop)',
	'AGOGO (Loop)',
	'WHISTLE 1 (Loop)',
	'WHISTLE 2 (Loop)',
	'GUIRO SHRT (Loop)',
	'CLAVES (Loop)',
	'WOOD BLOCK (Loop)',
	'CUICA (Loop)',
	'TRIANGLE (Loop)',
	'JINGLEBEL 1 (Loop)',
	'JINGLEBEL 2 (Loop)',
	'BELLTREE (Loop)',
	'CASTANETS (Loop)',
	'BOB COW (Loop)',
	'BOB CONGA (Loop)',
	'BOB CLAVE (Loop)',
	'TIMPANI 1 (Loop)',
	'TIMPANI 2 (Loop)',
	'SCRACH 2 (Loop)',
	'BREATH 1 (Loop)',
	'BREATH 2 (Loop)',
	'BREATH 3 (Loop)',
	'BIRD 1 (Loop)',
	'BIRD 2 (Loop)',
	'BIRD 3 (Loop)',
	'BIRD 4 (Loop)',
	'BIRD 5 (Loop)',
	'TELEPHONE 1 (Loop)',
	'TELEPHONE 2 (Loop)',
	'HELICOPTR 1 (Loop)',
	'HELICOPTR 2 (Loop)',
	'APPLAUSE 1 (Loop)',
	'APPLAUSE 2 (Loop)',
	'GB2APLUS 1 (Loop)',
	'GB2APLUS 2 (Loop)',
	'GB2APLUS 3 (Loop)',
	'GUNSHOT 1 (Loop)',
	'GUNSHOT 2 (Loop)',
	'GUNSHOT 3 (Loop)',
	'GUNSHOT 4 (Loop)',
	'GR PIANO (Loop)',
	'MARIMBA 1 (Loop)',
	'MARIMBA 2 (Loop)',
	'MARIMBA 3 (Loop)',
	'MARIMBA 4 (Loop)',
	'MARIMBA 5 (Loop)',
	'MARIMBA 6 (Loop)',
	'XYLOPHON 1 (Loop)',
	'XYLOPHON 2 (Loop)',
	'XYLOPHON 3 (Loop)',
	'TUBULA BL 1 (Loop)',
	'TUBULA BL 2 (Loop)',
	'TUBULA BL 3 (Loop)',
	'TUBULA BL 4 (Loop)',
	'SLAP BAS 11 (Loop)',
	'SLAP BAS 12 (Loop)',
	'SLAP BAS 21 (Loop)',
	'SLAP BAS 22 (Loop)',
	'SLAP BAS 31 (Loop)',
	'PIZZ 1 (Loop)',
	'PIZZ 2 (Loop)',
	'VOICE OH 1 (Loop)',
	'VOICE OH 2 (Loop)',
	'VOICE OH 3 (Loop)',
	'ORCH HIT 1 (Loop)',
	'ORCH HIT 2 (Loop)',
	'PAN FLUTE 1 (Loop)',
	'PAN FLUTE 2 (Loop)',
	'PAN FLUTE 3 (Loop)',
	'PAN PLUTE 4 (Loop)',
	'BLOW BOTL 1 (Loop)',
	'BLOW BOTL 2 (Loop)',
	'SITAR 1 (Loop)',
	'SITAR 2 (Loop)',
	'SITAR 3 (Loop)',
	'STEEL DRUM (Loop)',
	'FRET NOIS 1 (Loop)',
	'FRET NOIS 2 (Loop)',
	'ELE BD (Reverse)',
	'CONCERT BD (Reverse)',
	'ELE SD (Reverse)',
	'RIM (Reverse)',
	'XSTICKS (Reverse)',
	'BRUSH TAP (Reverse)',
	'BRUSH SLAP (Reverse)',
	'BRUSH SWIR (Reverse)',
	'NORM TOM (Reverse)',
	'TOM F (Reverse)',
	'POWER TOM (Reverse)',
	'HH OPEN (Reverse)',
	'TOP CYM (Reverse)',
	'CHINA 1 (Reverse)',
	'CHINA 2 (Reverse)',
	'SIDE BEL 1 (Reverse)',
	'BOB CYM (Reverse)',
	'CLAP (Reverse)',
	'TAMBOURINE (Reverse)',
	'COWBELL (Reverse)',
	'CONGA (Reverse)',
	'TIMBALE 1 (Reverse)',
	'TIMBALE 2 (Reverse)',
	'AGOGO 1 (Reverse)',
	'AGOGO 2 (Reverse)',
	'CABASA (Reverse)',
	'MARACAS (Reverse)',
	'GUIRO LNG 1 (Reverse)',
	'GUIRO LNG 2 (Reverse)',
	'WOOD BLOCK (Reverse)',
	'CUICA (Reverse)',
	'TRIANGLE (Reverse)',
	'SURDO MUTE (Reverse)',
	'SURDO OPEN (Reverse)',
	'TIMPANI (Reverse)',
	'WHIT NOISE (Reverse)',
	'SCRACH 1 (Reverse)',
	'SCRACH 21 (Reverse)',
	'SCRACH 22 (Reverse)',
	'BIRD TWEET (Reverse)',
	'HELICOPTR 1 (Reverse)',
	'HELICOPTR 2 (Reverse)',
	'GB2APLAUS 1 (Reverse)',
	'GB2APLAUS 2 (Reverse)',
	'GUNSHOT (Reverse)',
	'GR PIANO 1 (Reverse)',
	'GR PIANO 2 (Reverse)',
	'VIBRAPHONE (Reverse)',
	'TUBULERBEL (Reverse)',
	'ORCH HIT (Reverse)',
	'FRET NOISE (Reverse)',
	'OMNIBUS 1 (Reverse)',
	'OMNIBUS 2 (Reverse)',
	'OMNIBUS 3 (Reverse)',
	'OMNIBUS 4 (Reverse)',
	'OMNIBUS 5 (Reverse)',
	'OMNIBUS 6 (Reverse)',
	'OMNIBUS 7 (Reverse)',
];
console.assert(drumToneWaveNames.length === 256);

export function binToJsonForGMega(files, memMap) {
	console.assert(files?.PROG && files?.PCM);
	console.assert(memMap && Object.values(memMap).every((range) => isValidRange(range)));

	const json = {};

	// Waves
	json.waves = toneWaveNames.map((name, waveNo) => ({waveNo, name}));
	json.drumWaves = drumToneWaveNames.map((name, drumWaveNo) => ({drumWaveNo, name}));

	// Tones
	json.tonesGM = makeTones(files, memMap, 'GM');
	json.tonesSP = makeTones(files, memMap, 'SP');
	json.drumTonesGM = makeDrumTones(files, memMap, 'GM');
	json.drumTonesSP = makeDrumTones(files, memMap, 'SP');

	// Drum Sets
	console.assert(memMap.tableDrumNotes);
	json.drumSets = makeDrumSets(files.PROG.slice(...memMap.tableDrumNotes), json);

	return json;
}

function makeTones(files, memMap, kind) {
	const toneNamesRange       = memMap[`toneNames${kind}`];
	const tableToneParamsRange = memMap[`tableToneParams${kind}`];
	const toneParamsRange      = memMap[`toneParams${kind}`];
	console.assert(toneNamesRange && tableToneParamsRange && toneParamsRange);

	const toneNames = splitArrayByN(files.PROG.slice(...toneNamesRange), 8).map((bytes) => String.fromCharCode(...bytes));
	console.assert(toneNames.length === 135);
	const tableToneParams = files.PROG.slice(...tableToneParamsRange);
	console.assert(tableToneParams.length === 128);
	const toneParamsPackets = splitArrayByN(files.PCM.slice(...toneParamsRange), 32);
	console.assert(toneParamsPackets.length === 192);

	const tones = [];
	for (let toneNo = 0; toneNo < tableToneParams.length; toneNo++) {
		const toneIndex = tableToneParams[toneNo];
		const voiceNum   = (toneIndex < 0x40) ? 2 : 1;
		const paramIndex = (toneIndex < 0x40) ? toneIndex * 2 : 128 + (toneIndex - 0x40);
		console.assert(0 <= paramIndex && paramIndex < 192);

		const voices = (new Array(voiceNum)).fill().map((_, j) => {
			const toneParamsBytes = toneParamsPackets[paramIndex + j];
			const waveNo = toneParamsBytes[0];
			return {
				waveNo,
				bytes: [...toneParamsBytes],
				wave: {
					name: toneWaveNames[waveNo],
					$ref: `#/waves/${waveNo}`,
				},
			};
		});

		tones.push({
			toneNo,
			name: toneNames[toneNo],
			voices,
		});
	}
	for (let toneNo = tableToneParams.length; toneNo < toneNames.length; toneNo++) {
		tones.push({
			toneNo,
			name: toneNames[toneNo],
			voices: [],
		});
	}

	return tones;
}

function makeDrumTones(files, memMap, kind) {
	const drumToneParamsRange = memMap[`drumToneParams${kind}`];
	console.assert(drumToneParamsRange);

	const drumToneNames = splitArrayByN(files.PROG.slice(...memMap.drumToneNames), 8).map((bytes) => String.fromCharCode(...bytes));
	console.assert(drumToneNames.length === 128);
	const drumToneParamsPackets = splitArrayByN(files.PCM.slice(...drumToneParamsRange), 32);
	console.assert(drumToneParamsPackets.length === 128);

	const drumTones = [];
	for (let drumToneNo = 0; drumToneNo < 128; drumToneNo++) {
		const drumToneParamsBytes = drumToneParamsPackets[drumToneNo];
		const drumWaveNo = drumToneParamsBytes[0];
		const voices = [{
			drumWaveNo,
			bytes: [...drumToneParamsBytes],
			drumWave: {
				name: drumToneWaveNames[drumWaveNo],
				$ref: `#/drumWaves/${drumWaveNo}`,
			},
		}];

		drumTones.push({
			drumToneNo,
			name: drumToneNames[drumToneNo],
			voices,
		});
	}

	return drumTones;
}

function makeDrumSets(bytes, json) {
	const drumSetPackets = splitArrayByN(bytes, 128);

	console.assert(Array.isArray(json.tonesGM) && Array.isArray(json.drumTonesGM));
	const drumSets = [];
	drumSetPackets.forEach((drumSetBytes, drumSetNo) => {
		const notes = drumSetBytes.reduce((results, drumToneNo, noteNo) => {
			results[noteNo] = {
				drumToneNo,
				drumTone: {
					name: json.drumTonesGM[drumToneNo].name,
					$ref: `#/drumTonesGM/${drumToneNo}`,
				},
			};
			return results;
		}, {});

		drumSets.push({
			drumSetNo,
			name: json.tonesGM[128 + drumSetNo].name,
			notes,
		});
	});

	return drumSets;
}
