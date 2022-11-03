import {convert7to8bits} from './bin2json_common.js';

const toneNames = [
	'Piano',
	'BritePiano',
	'HammerPno',
	'HonkeyTonk',
	'New Tines',
	'Digi Piano',
	'Harpsicord',
	'Clav',
	'Celesta',
	'Glocken',
	'Music Box',
	'Vibes',
	'Marimba',
	'Xylophon',
	'Tubular',
	'Santur',
	'Full Organ',
	'Perc Organ',
	'BX-3 Organ',
	'ChurchPipe',
	'Positive',
	'Musette',
	'Harmonica',
	'Tango',
	'ClassicGtr',
	'A.Guitar',
	'JazzGuitar',
	'Clean Gtr',
	'MuteGuitar',
	'Over Drive',
	'DistGuitar',
	'RockMonics',
	'Jazz Bass',
	'Deep Bass',
	'Pick Bass',
	'Fretless',
	'SlapBass 1',
	'SlapBass 2',
	'SynthBass1',
	'SynthBass2',
	'Violin',
	'Viola',
	'Cello',
	'ContraBass',
	'TremoloStr',
	'Pizzicato',
	'Harp',
	'Timpani',
	'Marcato',
	'SlowString',
	'Analog Pad',
	'String Pad',
	'Choir',
	'Doo Voice',
	'Voices',
	'Orch Hit',
	'Trumpet',
	'Trombone',
	'Tuba',
	'Muted Trpt',
	'FrenchHorn',
	'Brass',
	'SynBrass 1',
	'SynBrass 2',
	'SopranoSax',
	'Alto Sax',
	'Tenor Sax',
	'Bari Sax',
	'Sweet Oboe',
	'EnglishHrn',
	'BasoonOboe',
	'Clarinet',
	'Piccolo',
	'Flute',
	'Recorder',
	'Pan Flute',
	'Bottle',
	'Shakuhachi',
	'Whistle',
	'Ocarina',
	'SquareWave',
	'Saw Wave',
	'SynCaliope',
	'Syn Chiff',
	'Charang',
	'AirChorus',
	'Rezzo4ths',
	'Bass&Lead',
	'Fantasia',
	'Warm Pad',
	'Poly Pad',
	'Ghost Pad',
	'BowedGlass',
	'Metal Pad',
	'Halo Pad',
	'Sweep',
	'Ice Rain',
	'SoundTrack',
	'Crystal',
	'Atmosphere',
	'Brightness',
	'Goblin',
	'Echo Drop',
	'Star Theme',
	'Sitar',
	'Banjo',
	'Shamisen',
	'Koto',
	'Kalimba',
	'Scotland',
	'Fiddle',
	'Shanai',
	'Metal Bell',
	'Agogo',
	'SteelDrums',
	'Woodblock',
	'Taiko',
	'Tom',
	'Synth Tom',
	'Rev Cymbal',
	'Fret Noise',
	'NoiseChiff',
	'Seashore',
	'Birds',
	'Telephone',
	'Helicopter',
	'Stadium!!',
	'GunShot',
];

const toneWaveNames = [
	'A.Piano 1',
	'A.Piano 2',
	'E.Piano 1',
	'Soft EP',
	'E.Piano 1',
	'Harpsicord',
	'Clav',
	'Clav LP',
	'Celesta',
	'Glocken',
	'Music Box',
	'Vibe',
	'Marimba',
	'Xylophone',
	'Tubular',
	'Santur',
	'Organ 3',
	'PercOrgan2',
	'RotaryOrg1',
	'PipeOrgan3',
	'PipeOrgan1',
	'Musette',
	'Harmonica',
	'Accordion',
	'G.Guitar',
	'F.Guitar',
	'E.Guitar 3',
	'E.Guitar 1',
	'MuteGuitar',
	'Over Drive',
	'DistGuitar',
	'Dist GtrLP',
	'Syn Sine',
	'A.Bass 1',
	'E.Bass 1',
	'Pick Bass1',
	'Fretless',
	'Slap Bass1',
	'Slap Bass2',
	'Saw',
	'SynthBass1',
	'Violin',
	'Cello',
	'StringEns.',
	'StrEns.V1',
	'StrEns.V2',
	'StrEns.V3',
	'Pizzicato',
	'Harp',
	'Timpani',
	'AnaStrings',
	'Choir',
	'Voice',
	'Orch Hit',
	'Trumpet',
	'Trombone 2',
	'Tuba',
	'Mute TP',
	'Horn',
	'Trombone 1',
	'Brass 2',
	'PWM',
	'SopranoSax',
	'Alto Sax',
	'Tenor Sax',
	'Bari Sax',
	'Oboe',
	'EnglishHrn',
	'BasoonOboe',
	'Clarinet',
	'Flute',
	'Recorder',
	'Pan Flute',
	'Bottle',
	'Shakuhachi',
	'Sine',
	'Ocarina',
	'Square',
	'Air Vox',
	'Koto',
	'Mega Pad',
	'VS 58',
	'White Pad',
	'Clicker',
	'Syn Vox',
	'Syn Vox LP',
	'BrightBell',
	'B.Bell LP',
	'Ether Bell',
	'Belltree',
	'BelltreeNT',
	'Sitar 1',
	'Banjo',
	'Shamisen',
	'Kalimba',
	'Metal Bell',
	'M.Bell LP',
	'Agogo',
	'Steel Drum',
	'WoodBlock1',
	'Taiko',
	'Melo Tom',
	'Syn Tom 1',
	'Stadium',
	'Stadium NT',
	'CrashLP NT',
	'Gt Scratch',
	'Tap5',
	'Crickets 1',
	'Crickts1NT',
	'Tri Roll',
	'TriRoll NT',
	'Gun Shot',
	'Sitar 1',
	'Sitar 1',
	'SynBass 3',
	'Doo Voice',
	'BrushNoise',
];

export function midToJsonForAG10(files) {
	// Tones
	const tones = new Array(toneNames.length).fill();
	for (const [fileName, bytes] of Object.entries(files)) {
		const toneNo = Number(fileName.slice(0, 3)) - 1;
		if (!(0 <= toneNo && toneNo < 128)) {
			console.warn(`Unexpected file name: ${fileName}`);
			continue;
		}

		// Extracts SysExs from the SMF.
		const str = [...bytes].map((e) => String.fromCharCode(e)).join('');
		const sysExs = str.match(/\xf0[\x80-\xff]*[\x00-\x7f]+\xf7/ug).map((s) => [...s].map((ch) => ch.charCodeAt(0))).map((bytes) => {
			const index = bytes.slice(1, 5).findIndex((e) => (e & 0x80) === 0);
			bytes.splice(1, index + 1);
			console.assert(bytes.slice(1, -1).every((e) => (e & 0x80) === 0));
			return bytes;
		});

		// Decodes binary data.
		for (const bytes of sysExs) {
			if (bytes[0] !== 0xf0 || bytes[1] !== 0x42 || bytes[2] !== 0x30 || bytes[3] !== 0x34 || bytes[4] !== 0x40 || bytes[bytes.length - 1] !== 0xf7) {
				console.warn(`Unexpected SysEx: ${bytes}`);
				continue;
			}

			const payload = bytes.slice(5, -2);
			const toneBytes = convert7to8bits(payload);
			if (payload.length !== 132 || toneBytes.length !== 115) {
				console.warn(`Unexpected SysEx: ${bytes}`);
				continue;
			}

			// Makes a tone data.
			const commonBytes = toneBytes.slice(0, 26);
			const voiceNum = (commonBytes[0] === 0x01) ? 2 : 1;
			const voices = [];
			for (let i = 0; i < voiceNum; i++) {
				const toneWaveNo = commonBytes[1 + i * 2];
				const voice = {
					toneWaveNo,
					toneWave: {
						name: toneWaveNames[toneWaveNo],
						$ref: `#/toneWaves/${toneWaveNo}`,
					},
					octave: commonBytes[2 + i * 2],
					bytes: [...toneBytes.slice(26 + i * 44, 70 + i * 44)],
				};
				voices.push(voice);
			}

			const tone = {
				toneNo,
				name: toneNames[toneNo],
				commonBytes,
				voices,
			};
			tones[toneNo] = tone;
		}
	}

	if (tones.some((e) => !e)) {
		console.warn('Missing files');
	}

	return {
		toneWaves: toneWaveNames.map((name, toneWaveNo) => ({toneWaveNo, name})),
		tones,
	};
}
