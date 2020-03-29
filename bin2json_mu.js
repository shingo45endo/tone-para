import {splitArrayByN, makeAddress4byteBE} from './bin2json_common.js';

const extraJson = {
	waves: [
		{waveNo: 0, name: '(Empty)'},
		{waveNo: 1, name: 'Dr_Stndrd Kit'},
		{waveNo: 2, name: '(DrumAdds)'},
		{waveNo: 3, name: '(Percussi)'},
		{waveNo: 4, name: 'Pc_SideStick'},
		{waveNo: 5, name: 'Pc_Snare 1'},
		{waveNo: 6, name: 'Pc_Snare 2'},
		{waveNo: 7, name: 'Pc_Snare 3'},
		{waveNo: 8, name: 'Pc_Snare 4'},
		{waveNo: 9, name: 'Pc_Snare 5'},
		{waveNo: 10, name: 'Pc_Snare 6'},
		{waveNo: 11, name: 'Pc_SnareBrush'},
		{waveNo: 12, name: 'Pc_Tom 1'},
		{waveNo: 13, name: 'Pc_Tom 2'},
		{waveNo: 14, name: 'Pc_Tom 3'},
		{waveNo: 15, name: 'Pc_Tom 4'},
		{waveNo: 16, name: 'Pc_Tom 5'},
		{waveNo: 17, name: 'Pc_Tom 6'},
		{waveNo: 18, name: 'Pc_Kick 1'},
		{waveNo: 19, name: 'Pc_Kick 2'},
		{waveNo: 20, name: 'Pc_Kick 3'},
		{waveNo: 21, name: 'Pc_Kick 4'},
		{waveNo: 22, name: 'Pc_GranCassa'},
		{waveNo: 23, name: 'Pc_Stick'},
		{waveNo: 24, name: 'Pc_Cymbal 1'},
		{waveNo: 25, name: 'Pc_Cymbal 2'},
		{waveNo: 26, name: 'Pc_Cymbal 3'},
		{waveNo: 27, name: 'Pc_Cymbal 4'},
		{waveNo: 28, name: '(Dr_RCym1)'},
		{waveNo: 29, name: 'Pc_LoopCymbal'},
		{waveNo: 30, name: '(Dr_RCym3)'},
		{waveNo: 31, name: '(Dr_RCym4)'},
		{waveNo: 32, name: 'Pc_Agogo'},
		{waveNo: 33, name: 'Pc_Castanet'},
		{waveNo: 34, name: 'Pc_WoodBlock'},
		{waveNo: 35, name: 'Pc_Taiko'},
		{waveNo: 36, name: 'Pc_Triangle'},
		{waveNo: 37, name: 'Ap_Grand'},
		{waveNo: 38, name: 'Ap_Brite'},
		{waveNo: 39, name: 'Ap_Honky'},
		{waveNo: 40, name: 'Eb_Finger'},
		{waveNo: 41, name: 'Eb_Fretless'},
		{waveNo: 42, name: 'Eb_Picked'},
		{waveNo: 43, name: 'Eb_Slap 1'},
		{waveNo: 44, name: 'Eb_Slap 2'},
		{waveNo: 45, name: 'Eb_Thump'},
		{waveNo: 46, name: 'Ab_Upright'},
		{waveNo: 47, name: 'Ar_Trumpet'},
		{waveNo: 48, name: 'Ar_MutedTrp'},
		{waveNo: 49, name: 'Ar_Trombone'},
		{waveNo: 50, name: 'Ar_Tuba'},
		{waveNo: 51, name: 'Ar_FrenchHorn'},
		{waveNo: 52, name: 'Ar_TrumpetEns'},
		{waveNo: 53, name: 'Ch_Aah'},
		{waveNo: 54, name: 'Ch_Ooh'},
		{waveNo: 55, name: 'Ep_DX7'},
		{waveNo: 56, name: 'Ep_Roads'},
		{waveNo: 57, name: 'Et_Banjo'},
		{waveNo: 58, name: 'Et_BagPipe'},
		{waveNo: 59, name: 'Et_Dulcimer'},
		{waveNo: 60, name: 'Et_Harmonica'},
		{waveNo: 61, name: 'Et_Harp'},
		{waveNo: 62, name: 'Et_Kalimba'},
		{waveNo: 63, name: 'Et_Koto'},
		{waveNo: 64, name: 'Et_Ocarina'},
		{waveNo: 65, name: '(FI_PanFl)'},
		{waveNo: 66, name: 'Et_Shakuhachi'},
		{waveNo: 67, name: 'Et_Shamisen'},
		{waveNo: 68, name: '(FI_Shana)'},
		{waveNo: 69, name: 'Et_Sho'},
		{waveNo: 70, name: 'Et_Sitar'},
		{waveNo: 71, name: 'Ag_Nylon'},
		{waveNo: 72, name: 'Ag_Steel'},
		{waveNo: 73, name: 'Eg_Jazz Gtr'},
		{waveNo: 74, name: 'Eg_Clean'},
		{waveNo: 75, name: 'Eg_Muted'},
		{waveNo: 76, name: 'Eg_Overdrive'},
		{waveNo: 77, name: 'Eg_Distortion'},
		{waveNo: 78, name: 'Eg_Harmonics1'},
		{waveNo: 79, name: 'Mk_Accordion'},
		{waveNo: 80, name: 'Mk_Celesta'},
		{waveNo: 81, name: 'Mk_Clavi.'},
		{waveNo: 82, name: 'Mk_Harpsichrd'},
		{waveNo: 83, name: 'Eo_Drawbar 1'},
		{waveNo: 84, name: 'Eo_Percussive'},
		{waveNo: 85, name: 'Eo_Rock 1'},
		{waveNo: 86, name: 'Ao_Pipe'},
		{waveNo: 87, name: 'Ao_Reed'},
		{waveNo: 88, name: 'Bw_Violin'},
		{waveNo: 89, name: 'Bw_Viola'},
		{waveNo: 90, name: 'Bw_Cello'},
		{waveNo: 91, name: 'Bw_ContraBass'},
		{waveNo: 92, name: 'Oe_SectionEns'},
		{waveNo: 93, name: 'Oe_Pizzicato'},
		{waveNo: 94, name: 'Ow_Square'},
		{waveNo: 95, name: 'Ow_Saw'},
		{waveNo: 96, name: '(SY_Trian)'},
		{waveNo: 97, name: 'Mb_Bass 1'},
		{waveNo: 98, name: 'Mb_Bass 2'},
		{waveNo: 99, name: 'Sr_Brass'},
		{waveNo: 100, name: '(SY_Choir)'},
		{waveNo: 101, name: '(SY_Strng)'},
		{waveNo: 102, name: 'Lw_Pad 1'},
		{waveNo: 103, name: '(SY_Pad2)'},
		{waveNo: 104, name: 'Mw_Mallet'},
		{waveNo: 105, name: 'Cp_Glocken'},
		{waveNo: 106, name: 'Cp_Marimba'},
		{waveNo: 107, name: 'Cp_SteelDrum'},
		{waveNo: 108, name: 'Cp_Timpani'},
		{waveNo: 109, name: 'Cp_TinkleBell'},
		{waveNo: 110, name: 'Cp_TublarBell'},
		{waveNo: 111, name: 'Cp_Vibes'},
		{waveNo: 112, name: 'Cp_Xylophone'},
		{waveNo: 113, name: 'Rd_Bassoon'},
		{waveNo: 114, name: 'Rd_Clarinet'},
		{waveNo: 115, name: 'Rd_EnglshHorn'},
		{waveNo: 116, name: 'Rd_Flute'},
		{waveNo: 117, name: 'Rd_Oboe'},
		{waveNo: 118, name: 'Pi_Piccolo'},
		{waveNo: 119, name: 'Pi_SprRecordr'},
		{waveNo: 120, name: 'Rd_SopranoSax'},
		{waveNo: 121, name: 'Rd_AltoSax'},
		{waveNo: 122, name: '(WW_SxTen)'},
		{waveNo: 123, name: 'Rd_BaritonSax'},
		{waveNo: 124, name: 'Ne_Applause'},
		{waveNo: 125, name: 'Ne_Bird 1'},
		{waveNo: 126, name: 'Ne_Bird 2'},
		{waveNo: 127, name: 'Ne_Breath'},
		{waveNo: 128, name: 'Me_BassSlap'},
		{waveNo: 129, name: 'Ne_Bubble'},
		{waveNo: 130, name: 'Ne_CarPass'},
		{waveNo: 131, name: 'Ne_CarCrash'},
		{waveNo: 132, name: 'Ne_CarStart'},
		{waveNo: 133, name: 'Ne_Dog'},
		{waveNo: 134, name: 'Ne_DoorSlam'},
		{waveNo: 135, name: 'Ne_DoorSqueak'},
		{waveNo: 136, name: 'Ne_FootStep'},
		{waveNo: 137, name: 'Ne_Gallop'},
		{waveNo: 138, name: 'Me_GtrStroke'},
		{waveNo: 139, name: 'Me_GtrFretNz'},
		{waveNo: 140, name: 'Ne_Gun'},
		{waveNo: 141, name: 'Ne_Helicopter'},
		{waveNo: 142, name: 'Ne_HeartBeat'},
		{waveNo: 143, name: 'Me_KeyPad'},
		{waveNo: 144, name: 'Ne_Laughing'},
		{waveNo: 145, name: 'Ne_MachineGun'},
		{waveNo: 146, name: 'Me_Metronome'},
		{waveNo: 147, name: 'Mw_Noise'},
		{waveNo: 148, name: 'Me_OrchHit'},
		{waveNo: 149, name: 'Ne_Punch'},
		{waveNo: 150, name: 'Ne_Rain'},
		{waveNo: 151, name: 'Ne_Scream'},
		{waveNo: 152, name: 'Ne_Stream'},
		{waveNo: 153, name: 'Ne_Surf'},
		{waveNo: 154, name: 'Ne_TelDial'},
		{waveNo: 155, name: 'Ne_TelRing 1'},
		{waveNo: 156, name: 'Ne_Thunder'},
		{waveNo: 157, name: 'Ne_TireSkid'},
		{waveNo: 158, name: 'Ne_Train'},
		{waveNo: 159, name: 'Ne_Wind'},
		{waveNo: 160, name: '(Empty)'},
		{waveNo: 161, name: '(Empty)'},
		{waveNo: 162, name: 'Ne_TelRing 2'},
		{waveNo: 163, name: 'Me_WindChime'},
		{waveNo: 164, name: '(Empty)'},
		{waveNo: 165, name: '(Empty)'},
		{waveNo: 166, name: '(Empty)'},
		{waveNo: 167, name: '(Empty)'},
		{waveNo: 168, name: '(Empty)'},
		{waveNo: 169, name: '(Empty)'},
		{waveNo: 170, name: '(Empty)'},
		{waveNo: 171, name: '(Empty)'},
		{waveNo: 172, name: 'Ep_CP80'},
		{waveNo: 173, name: '(Empty)'},
		{waveNo: 174, name: '(Empty)'},
		{waveNo: 175, name: '(Empty)'},
		{waveNo: 176, name: 'Rd_SprSaxAtk'},
		{waveNo: 177, name: 'Rd_AltoSaxAtk'},
		{waveNo: 178, name: '(Empty)'},
		{waveNo: 179, name: 'Rd_BariSaxAtk'},
		{waveNo: 180, name: 'Oe_StrngEnsLp'},
		{waveNo: 181, name: '(Empty)'},
		{waveNo: 182, name: 'Rd_BariSaxLp'},
		{waveNo: 183, name: 'Eg_OvrdriveLp'},
		{waveNo: 184, name: 'Rd_TenorSax'},
		{waveNo: 185, name: '(Empty)'},
		{waveNo: 186, name: '(Empty)'},
		{waveNo: 187, name: '(Empty)'},
		{waveNo: 188, name: 'Et_Shanai'},
		{waveNo: 189, name: 'Me_TublrBelLp'},
		{waveNo: 190, name: 'Ag_12GtrUpper'},
		{waveNo: 191, name: 'Me_XylophonLp'},
		{waveNo: 192, name: '(Empty)'},
		{waveNo: 193, name: '(Empty)'},
		{waveNo: 194, name: '(Empty)'},
		{waveNo: 195, name: 'Ow_Sine'},
		{waveNo: 196, name: 'Ow_Digi 1'},
		{waveNo: 197, name: 'Ow_Digi 2'},
		{waveNo: 198, name: 'Ow_Digi 3'},
		{waveNo: 199, name: 'Ow_Digi 4'},
		{waveNo: 200, name: 'Ow_Digi 5'},
		{waveNo: 201, name: 'Ow_Digi 6'},
		{waveNo: 202, name: 'Ow_Digi 7'},
		{waveNo: 203, name: 'Ow_Digi 8'},
		{waveNo: 204, name: 'Ow_Digi 9'},
		{waveNo: 205, name: 'Ow_Digi 10'},
		{waveNo: 206, name: 'Ow_Digi 11'},
		{waveNo: 207, name: 'Ow_Digi 12'},
		{waveNo: 208, name: 'Ow_Digi 13'},
		{waveNo: 209, name: 'Ow_Digi 14'},
		{waveNo: 210, name: 'Ow_Digi 15'},
		{waveNo: 211, name: 'Ow_Digi 16'},
		{waveNo: 212, name: 'Ow_Digi 17'},
		{waveNo: 213, name: 'Ow_Digi 19'},
		{waveNo: 214, name: 'Ow_Digi 20'},
		{waveNo: 215, name: 'Ow_Digi 21'},
		{waveNo: 216, name: 'Ow_Digi 22'},
		{waveNo: 217, name: 'Ow_Digi 23'},
		{waveNo: 218, name: 'Ow_Digi 24'},
		{waveNo: 219, name: 'Ow_Digi 25'},
		{waveNo: 220, name: 'Ow_Digi 26'},
		{waveNo: 221, name: 'Ow_Digi 27'},
		{waveNo: 222, name: 'Ow_Digi 28'},
		{waveNo: 223, name: 'Ow_Digi 29'},
		{waveNo: 224, name: 'Ow_Digi 30'},
		{waveNo: 225, name: 'Ow_Digi 31'},
		{waveNo: 226, name: 'Ow_Digi 32'},
		{waveNo: 227, name: 'Lw_Pad 2'},
		{waveNo: 228, name: 'Ow_Pulse 10'},
		{waveNo: 229, name: 'Ow_Pulse 25'},
		{waveNo: 230, name: 'Lw_Pad 3'},
		{waveNo: 231, name: 'Oe_Ensemble'},
		{waveNo: 232, name: '(Empty)'},
		{waveNo: 233, name: '(Empty)'},
		{waveNo: 234, name: '(Empty)'},
		{waveNo: 235, name: '(Empty)'},
		{waveNo: 236, name: 'Lw_Itopia'},
		{waveNo: 237, name: 'Eo_Rock 2'},
		{waveNo: 238, name: '(Empty)'},
		{waveNo: 239, name: '(Empty)'},
		{waveNo: 240, name: 'Eo_Drawbar 2'},
		{waveNo: 241, name: 'Mk_Bandoneon'},
		{waveNo: 242, name: 'Eg_Harmonics2'},
		{waveNo: 243, name: 'Et_PanFlute'},
		{waveNo: 244, name: '(Empty)'},
		{waveNo: 245, name: 'Me_Scratch'},
	],
};

export function binToJsonForMU(bytes, regions) {
	const json = {};

	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones));
	}
	if (regions.drumParams && regions.tableDrumParamAddr) {
		json.drumSets = makeDrumSets(bytes, regions);
	}

	Object.assign(json, extraJson);

	return json;
}

function makeTones(bytes) {
	const tones = [];
	let index = 0;
	let toneNo = 0;
	while (index < bytes.length) {
		const bits = bytes[index];
		console.assert(bits === 0b0001 || bits === 0b0011 || bits === 0b0111 || bits === 0b1111);
		const numElems = {0b0001: 1, 0b0011: 2, 0b0111: 3, 0b1111: 4}[bits];
		const size = 14 + 84 * numElems;
		const toneBytes = bytes.slice(index, index + size);
		const commonBytes = toneBytes.slice(0, 14);
		const voicePackets = splitArrayByN(toneBytes.slice(14), 84);

		const name = String.fromCharCode(...commonBytes.slice(2, 12));

		const tone = {
			toneNo, name,
			commonBytes: [...commonBytes],
			voices: [],
		};

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = (voiceBytes[0] << 7) | voiceBytes[1];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
			};
			tone.voices.push(voice);
		}

		tones.push(tone);

		index += size;
		toneNo++;
	}

	return tones;
}

function makeDrumSets(bytes, regions) {
	const drumParamPackets = splitArrayByN(bytes.slice(...regions.drumParams), 42);
	const drumSetsAddrs = splitArrayByN(bytes.slice(...regions.tableDrumParamAddr), 4);

	const drumSets = [];
	for (let drumSetNo = 0; drumSetNo < drumSetsAddrs.length; drumSetNo++) {
		const addr = makeAddress4byteBE(drumSetsAddrs[drumSetNo]);
		const offsets = splitArrayByN(bytes.slice(addr, addr + 2 * 128), 2);

		const drumSet = {
			drumSetNo,
			notes: {},
		};
		for (let noteNo = 0; noteNo < 128; noteNo++) {
			const offset = (offsets[noteNo][0] << 8) | offsets[noteNo][1];
			if (offset === 0xffff) {
				continue;
			}

			const index = offset / 42;
			console.assert(Number.isInteger(index));
			const note = {
				bytes: [...drumParamPackets[index]],
			};
			console.assert(note.bytes[8] === 0 && note.bytes[16] === 64 && note.bytes[17] === 64 && note.bytes[18] === 12 && note.bytes[19] === 54);
			drumSet.notes[noteNo] = note;
		}

		drumSets.push(drumSet);
	}

	let drumKitNameAddrs = [];
	for (const kind of ['XG', 'SFX', 'GS', 'GM2']) {
		const regionsTableDrumParam   = regions[`tableDrumParam${kind}`];
		const regionsDrumKitNames     = regions[`drumKitNames${kind}`];
		const regionsDrumNoteNames    = regions[`drumNoteNames${kind}`];
		const regionsTableDrumKitName = regions[`tableDrumKitName${kind}`];
		if (!regionsTableDrumParam || !regionsDrumKitNames || !regionsDrumNoteNames || !regionsTableDrumKitName) {
			continue;
		}

		const drumKitNamePackets = splitArrayByN(bytes.slice(...regionsDrumKitNames), 12);
		drumKitNameAddrs.push(...drumKitNamePackets.map((e) => makeAddress4byteBE(e.slice(8))), regionsDrumKitNames[1]);
		drumKitNameAddrs = [...new Set(drumKitNameAddrs)].sort((a, b) => a - b);

		const tableDrumParam   = bytes.slice(...regionsTableDrumParam);
		const tableDrumKitName = bytes.slice(...regionsTableDrumKitName);
		console.assert(tableDrumParam.length === tableDrumKitName.length);
		for (let i = 0; i < tableDrumKitName.length; i++) {
			const indexName  = tableDrumKitName[i];
			const indexParam = tableDrumParam[i];
			const drumSet = drumSets[indexParam];
			if (drumSet.name) {
				continue;
			}

			const drumSetNamePacket = drumKitNamePackets[indexName];
			const name = String.fromCharCode(...drumSetNamePacket.slice(0, 8));
			const addr = makeAddress4byteBE(drumSetNamePacket.slice(8));
			const index = drumKitNameAddrs.indexOf(addr);
			console.assert(index >= 0 && index < drumKitNameAddrs.length - 1);

			const drumNoteNames = splitArrayByN(bytes.slice(drumKitNameAddrs[index], drumKitNameAddrs[index + 1]), 12).map((e) => String.fromCharCode(...e));
			for (const key of Object.keys(drumSet.notes)) {
				if (!drumSet.notes[key].name) {
					const offset = {XG: 13, SFX: 13, GS: 25, GM2: 25}[kind];
					drumSet.notes[key].name = drumNoteNames[Number(key) - offset];
				}
			}

			drumSet.name = name;
		}
	}

	return drumSets;
}
