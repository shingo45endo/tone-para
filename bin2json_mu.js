import {splitArrayByN, makeAddress4byteBE} from './bin2json_common.js';

const extraJson = {
	waves: [
		{waveNo: 0, name: '(Empty)'},
		{waveNo: 1, name: 'KT_Standar'},
		{waveNo: 2, name: 'DR_JamLoop'},
		{waveNo: 3, name: 'KT_Standar'},
		{waveNo: 4, name: 'DR_SideStk'},
		{waveNo: 5, name: 'DR_Snare1'},
		{waveNo: 6, name: 'DR_Snare2'},
		{waveNo: 7, name: 'DR_Snare3'},
		{waveNo: 8, name: 'DR_Snare4'},
		{waveNo: 9, name: 'DR_Snare5'},
		{waveNo: 10, name: 'DR_Snare6'},
		{waveNo: 11, name: 'DR_Brush'},
		{waveNo: 12, name: 'DR_Tom1'},
		{waveNo: 13, name: 'DR_Tom2'},
		{waveNo: 14, name: 'DR_Tom3'},
		{waveNo: 15, name: 'DR_Tom4'},
		{waveNo: 16, name: 'DR_Tom5'},
		{waveNo: 17, name: 'DR_Tom6'},
		{waveNo: 18, name: 'DR_Kick1'},
		{waveNo: 19, name: 'DR_Kick2'},
		{waveNo: 20, name: 'DR_Kick3'},
		{waveNo: 21, name: 'DR_Kick4'},
		{waveNo: 22, name: 'DR_GrnCass'},
		{waveNo: 23, name: 'DR_Stick'},
		{waveNo: 24, name: 'DR_Cymbal1'},
		{waveNo: 25, name: 'DR_Cymbal2'},
		{waveNo: 26, name: 'DR_Cymbal3'},
		{waveNo: 27, name: 'DR_Cymbal4'},
		{waveNo: 28, name: 'DR_RvsCymb'},
		{waveNo: 29, name: 'DR_RpCymba'},
		{waveNo: 30, name: 'DR_RvsBD'},
		{waveNo: 31, name: 'DR_RvsGrnC'},
		{waveNo: 32, name: 'PC_Agogo'},
		{waveNo: 33, name: 'PC_Castane'},
		{waveNo: 34, name: 'PC_WoodBlc'},
		{waveNo: 35, name: 'PC_Taiko'},
		{waveNo: 36, name: 'PC_Triangl'},
		{waveNo: 37, name: 'AP_Grand'},
		{waveNo: 38, name: 'AP_Brite'},
		{waveNo: 39, name: 'AP_Honky'},
		{waveNo: 40, name: 'BA_Finger'},
		{waveNo: 41, name: 'BA_Fretles'},
		{waveNo: 42, name: 'BA_Picked'},
		{waveNo: 43, name: 'BA_Slap1'},
		{waveNo: 44, name: 'BA_Slap2'},
		{waveNo: 45, name: 'BA_Thump'},
		{waveNo: 46, name: 'BA_Upright'},
		{waveNo: 47, name: 'BR_Trumpet'},
		{waveNo: 48, name: 'BR_MutedTr'},
		{waveNo: 49, name: 'BR_Trombne'},
		{waveNo: 50, name: 'BR_Tuba'},
		{waveNo: 51, name: 'BR_FrncHor'},
		{waveNo: 52, name: 'BR_TPEns'},
		{waveNo: 53, name: 'CH_Aah'},
		{waveNo: 54, name: 'CH_Ooh'},
		{waveNo: 55, name: 'EP_DX7'},
		{waveNo: 56, name: 'EP_Rhodes'},
		{waveNo: 57, name: 'FI_Banjo'},
		{waveNo: 58, name: 'FI_BagPipe'},
		{waveNo: 59, name: 'FI_Dulcime'},
		{waveNo: 60, name: 'FI_Hrmonic'},
		{waveNo: 61, name: 'FI_Harp'},
		{waveNo: 62, name: 'FI_Kalimba'},
		{waveNo: 63, name: 'FI_Koto'},
		{waveNo: 64, name: 'FI_Ocarina'},
		{waveNo: 65, name: 'FI_PanFlut'},
		{waveNo: 66, name: 'FI_Shaku'},
		{waveNo: 67, name: 'FI_Shamise'},
		{waveNo: 68, name: 'FI_Tsugaru'},
		{waveNo: 69, name: 'FI_Sho'},
		{waveNo: 70, name: 'FI_Sitar'},
		{waveNo: 71, name: 'GT_Nylon'},
		{waveNo: 72, name: 'GT_Steel'},
		{waveNo: 73, name: 'GT_JazzGtr'},
		{waveNo: 74, name: 'GT_Clean'},
		{waveNo: 75, name: 'GT_Muted'},
		{waveNo: 76, name: 'GT_Ovrdriv'},
		{waveNo: 77, name: 'GT_Dist1'},
		{waveNo: 78, name: 'GT_Hrmnics'},
		{waveNo: 79, name: 'KY_Accrdio'},
		{waveNo: 80, name: 'KY_Celesta'},
		{waveNo: 81, name: 'KY_Clavine'},
		{waveNo: 82, name: 'KY_Hrpschr'},
		{waveNo: 83, name: 'OR_DrawBar'},
		{waveNo: 84, name: 'OR_Prcssve'},
		{waveNo: 85, name: 'OR_Rock1'},
		{waveNo: 86, name: 'OR_Pipe'},
		{waveNo: 87, name: 'OR_Reed'},
		{waveNo: 88, name: 'ST_Violin'},
		{waveNo: 89, name: 'ST_Viola'},
		{waveNo: 90, name: 'ST_Cello'},
		{waveNo: 91, name: 'ST_ContraB'},
		{waveNo: 92, name: 'ST_Ensem1'},
		{waveNo: 93, name: 'ST_Pizz'},
		{waveNo: 94, name: 'SY_Square'},
		{waveNo: 95, name: 'SY_Saw'},
		{waveNo: 96, name: 'SY_Triangl'},
		{waveNo: 97, name: 'SY_Bass1'},
		{waveNo: 98, name: 'SY_Bass2'},
		{waveNo: 99, name: 'SY_Brass'},
		{waveNo: 100, name: 'SY_Choir'},
		{waveNo: 101, name: 'SY_Strings'},
		{waveNo: 102, name: 'SY_Pad1'},
		{waveNo: 103, name: 'SY_Pad2'},
		{waveNo: 104, name: 'SY_Mallet'},
		{waveNo: 105, name: 'TP_Glocken'},
		{waveNo: 106, name: 'TP_Marimba'},
		{waveNo: 107, name: 'TP_SteelDr'},
		{waveNo: 108, name: 'TP_Timpani'},
		{waveNo: 109, name: 'TP_TnklBel'},
		{waveNo: 110, name: 'TP_TblrBel'},
		{waveNo: 111, name: 'TP_Vibs'},
		{waveNo: 112, name: 'TP_Xylophn'},
		{waveNo: 113, name: 'WW_Bassoon'},
		{waveNo: 114, name: 'WW_Clarine'},
		{waveNo: 115, name: 'WW_EngHorn'},
		{waveNo: 116, name: 'WW_Flute'},
		{waveNo: 117, name: 'WW_Oboe'},
		{waveNo: 118, name: 'WW_Piccolo'},
		{waveNo: 119, name: 'WW_SpRcrdr'},
		{waveNo: 120, name: 'WW_SpSax'},
		{waveNo: 121, name: 'WW_AltoSax'},
		{waveNo: 122, name: 'WW_TnrSax1'},
		{waveNo: 123, name: 'WW_BariSax'},
		{waveNo: 124, name: 'SE_Applaus'},
		{waveNo: 125, name: 'SE_Bird1'},
		{waveNo: 126, name: 'SE_Bird2'},
		{waveNo: 127, name: 'SE_Breath'},
		{waveNo: 128, name: 'SE_BsSlap'},
		{waveNo: 129, name: 'SE_Bubble'},
		{waveNo: 130, name: 'SE_CarPass'},
		{waveNo: 131, name: 'SE_CarCras'},
		{waveNo: 132, name: 'SE_CarStar'},
		{waveNo: 133, name: 'SE_Dog'},
		{waveNo: 134, name: 'SE_DoorSla'},
		{waveNo: 135, name: 'SE_DoorSqk'},
		{waveNo: 136, name: 'SE_FootSte'},
		{waveNo: 137, name: 'SE_Gallop'},
		{waveNo: 138, name: 'SE_GtrCttn'},
		{waveNo: 139, name: 'SE_GtrFrtN'},
		{waveNo: 140, name: 'SE_Gun'},
		{waveNo: 141, name: 'SE_Helicpt'},
		{waveNo: 142, name: 'SE_HeartBt'},
		{waveNo: 143, name: 'SE_KeyPad'},
		{waveNo: 144, name: 'SE_Laughin'},
		{waveNo: 145, name: 'SE_MachGun'},
		{waveNo: 146, name: 'SE_Metro'},
		{waveNo: 147, name: 'SE_Noise'},
		{waveNo: 148, name: 'SE_OrchHit'},
		{waveNo: 149, name: 'SE_Punch'},
		{waveNo: 150, name: 'SE_Rain'},
		{waveNo: 151, name: 'SE_Scream'},
		{waveNo: 152, name: 'SE_Stream'},
		{waveNo: 153, name: 'SE_Surf'},
		{waveNo: 154, name: 'SE_TelDial'},
		{waveNo: 155, name: 'SE_TelRing'},
		{waveNo: 156, name: 'SE_Thunder'},
		{waveNo: 157, name: 'SE_TireSki'},
		{waveNo: 158, name: 'SE_Train'},
		{waveNo: 159, name: 'SE_Wind'},
		{waveNo: 160, name: 'SE_Applaus'},
		{waveNo: 161, name: 'SE_Cat'},
		{waveNo: 162, name: 'SE_TelRing'},
		{waveNo: 163, name: 'SE_WindChi'},
		{waveNo: 164, name: 'SE_BsSlide'},
		{waveNo: 165, name: 'SE_GtrPcSc'},
		{waveNo: 166, name: 'SE_BrsHit'},
		{waveNo: 167, name: 'SE_Growl'},
		{waveNo: 168, name: 'GT_Clean'},
		{waveNo: 169, name: 'BA_FndrJaz'},
		{waveNo: 170, name: 'BR_FlglHor'},
		{waveNo: 171, name: 'BR_BrsFall'},
		{waveNo: 172, name: 'EP_CP80'},
		{waveNo: 173, name: 'GT_Dist2'},
		{waveNo: 174, name: 'GT_StlHrm'},
		{waveNo: 175, name: 'KY_OrgFlut'},
		{waveNo: 176, name: 'SA_SpSax'},
		{waveNo: 177, name: 'SA_AltoSax'},
		{waveNo: 178, name: 'SA_TenorSa'},
		{waveNo: 179, name: 'SA_BariSax'},
		{waveNo: 180, name: 'LO_StrEns'},
		{waveNo: 181, name: 'LO_TenorSa'},
		{waveNo: 182, name: 'LO_BariSax'},
		{waveNo: 183, name: 'LO_Ovrdriv'},
		{waveNo: 184, name: 'WW_TnrSax2'},
		{waveNo: 185, name: 'WW_BsClari'},
		{waveNo: 186, name: 'PC_Atariga'},
		{waveNo: 187, name: 'TP_LogDrum'},
		{waveNo: 188, name: 'FI_Shanai'},
		{waveNo: 189, name: 'FL_TblrBel'},
		{waveNo: 190, name: 'GT_12StrUP'},
		{waveNo: 191, name: 'FL_Xylophn'},
		{waveNo: 192, name: 'RV_RvsSD1'},
		{waveNo: 193, name: 'RV_RvsSD2'},
		{waveNo: 194, name: 'GT_Dist3'},
		{waveNo: 195, name: 'FL_Sine'},
		{waveNo: 196, name: 'SY_Digi01'},
		{waveNo: 197, name: 'SY_Digi02'},
		{waveNo: 198, name: 'SY_Digi03'},
		{waveNo: 199, name: 'SY_Digi04'},
		{waveNo: 200, name: 'SY_Digi05'},
		{waveNo: 201, name: 'SY_Digi06'},
		{waveNo: 202, name: 'SY_Digi07'},
		{waveNo: 203, name: 'SY_Digi08'},
		{waveNo: 204, name: 'SY_Digi09'},
		{waveNo: 205, name: 'SY_Digi10'},
		{waveNo: 206, name: 'SY_Digi11'},
		{waveNo: 207, name: 'SY_Digi12'},
		{waveNo: 208, name: 'SY_Digi13'},
		{waveNo: 209, name: 'SY_Digi14'},
		{waveNo: 210, name: 'SY_Digi15'},
		{waveNo: 211, name: 'SY_Digi16'},
		{waveNo: 212, name: 'SY_Digi17'},
		{waveNo: 213, name: 'SY_Digi18'},
		{waveNo: 214, name: 'SY_Digi19'},
		{waveNo: 215, name: 'SY_Digi20'},
		{waveNo: 216, name: 'SY_Digi21'},
		{waveNo: 217, name: 'SY_Digi22'},
		{waveNo: 218, name: 'SY_Digi23'},
		{waveNo: 219, name: 'SY_Digi24'},
		{waveNo: 220, name: 'SY_Digi25'},
		{waveNo: 221, name: 'SY_Digi26'},
		{waveNo: 222, name: 'SY_Digi27'},
		{waveNo: 223, name: 'SY_Digi28'},
		{waveNo: 224, name: 'SY_Digi29'},
		{waveNo: 225, name: 'SY_Digi30'},
		{waveNo: 226, name: 'SY_Digi31'},
		{waveNo: 227, name: 'SY_OBE'},
		{waveNo: 228, name: 'SY_Pulse10'},
		{waveNo: 229, name: 'SY_Pulse25'},
		{waveNo: 230, name: 'SY_StrJP'},
		{waveNo: 231, name: 'ST_Ensem2'},
		{waveNo: 232, name: 'CH_StrngAa'},
		{waveNo: 233, name: 'CH_VoiceDo'},
		{waveNo: 234, name: 'CH_Hmn'},
		{waveNo: 235, name: 'CH_MaleAah'},
		{waveNo: 236, name: 'CH_Itopia'},
		{waveNo: 237, name: 'OR_Rock2'},
		{waveNo: 238, name: 'RV_RvsTom1'},
		{waveNo: 239, name: 'RV_RvsTom2'},
		{waveNo: 240, name: 'OR_Drawbar'},
		{waveNo: 241, name: 'KY_Bandneo'},
		{waveNo: 242, name: 'GT_Hrmnics'},
		{waveNo: 243, name: 'WW_PanFlut'},
		{waveNo: 244, name: 'BR_MuteTr'},
		{waveNo: 245, name: 'SE_Scratch'},
		{waveNo: 246, name: 'SE_Hit1'},
		{waveNo: 247, name: 'SE_Hit2'},
		{waveNo: 248, name: 'SE_BrsHitS'},
		{waveNo: 249, name: 'DR_JnglBD1'},
		{waveNo: 250, name: 'DR_JnglBD2'},
		{waveNo: 251, name: 'DR_JnglBD3'},
		{waveNo: 252, name: 'DR_JnglSD1'},
		{waveNo: 253, name: 'DR_JnglSD2'},
		{waveNo: 254, name: 'DR_JnglSD3'},
		{waveNo: 255, name: 'DR_AnalogB'},
		{waveNo: 256, name: 'SY_MiniMoo'},
		{waveNo: 257, name: 'SY_TB303Sa'},
		{waveNo: 258, name: 'SY_CS01'},
		{waveNo: 259, name: 'SY_Jupiter'},
		{waveNo: 260, name: 'SY_FatSaw'},
		{waveNo: 261, name: 'SY_ArpSync'},
		{waveNo: 262, name: 'OR_Jazz'},
		{waveNo: 263, name: 'OR_Click'},
		{waveNo: 264, name: 'OR_Farfiss'},
		{waveNo: 265, name: 'OR_Gospel'},
		{waveNo: 266, name: 'BA_SlapBas'},
		{waveNo: 267, name: 'GT_StratMi'},
		{waveNo: 268, name: 'GT_Telecas'},
		{waveNo: 269, name: 'DR_AnBDTec'},
		{waveNo: 270, name: 'DR_AnBDTec'},
		{waveNo: 271, name: 'DR_AnBDTec'},
		{waveNo: 272, name: 'DR_808SD'},
		{waveNo: 273, name: 'DR_AnalogS'},
		{waveNo: 274, name: 'DR_DryBD1'},
		{waveNo: 275, name: 'DR_DryBD2'},
		{waveNo: 276, name: 'DR_DryBD3'},
		{waveNo: 277, name: 'DR_BD1'},
		{waveNo: 278, name: 'DR_SD1_RI'},
		{waveNo: 279, name: 'DR_78SD'},
		{waveNo: 280, name: 'DR_HHClose'},
		{waveNo: 281, name: 'DR_HHOpen'},
		{waveNo: 282, name: 'DR_HHPedal'},
		{waveNo: 283, name: 'DR_AmbSD'},
		{waveNo: 284, name: 'DR_DrySD1'},
		{waveNo: 285, name: 'DR_DrySD2'},
		{waveNo: 286, name: 'DR_SftDryS'},
		{waveNo: 287, name: 'DR_SDf'},
		{waveNo: 288, name: 'DR_OpenRim'},
		{waveNo: 289, name: 'DR_SideStk'},
		{waveNo: 290, name: 'BR_Trumpet'},
		{waveNo: 291, name: 'BR_Trombne'},
		{waveNo: 292, name: 'PC_Handcla'},
	],
};

export function binToJsonForMU(bytes, regions) {
	const json = {...extraJson};

	if (regions.tones) {
		json.tones = makeTones(bytes.slice(...regions.tones), json);
	}
	if (regions.drumParams && regions.tableDrumParamAddr) {
		json.drumSets = makeDrumSets(bytes, regions);
	}
	if (regions.tableToneAddr && regions.tableToneMsb) {
		const tablePrograms = makeProgTable(bytes, regions, json);
		for (const kind of ['XGBasic', 'XGNative', 'ModelExcl', 'GS', 'TG300B', 'GM2Basic', 'GM2Native']) {
			if (regions[`tableTone${kind}`]) {
				json[`programs${kind}`] = makePrograms(tablePrograms, json, kind);
			}
		}
	}

	removePrivateProp(json);

	return json;
}

function makeTones(bytes, json) {
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
			_offset: index,
		};

		for (let i = 0; i < voicePackets.length; i++) {
			const voiceBytes = voicePackets[i];
			const waveNo = (voiceBytes[0] << 7) | voiceBytes[1];
			const voice = {
				waveNo,
				bytes: [...voiceBytes],
				wave: {
					name: (json.waves[waveNo]) ? json.waves[waveNo].name : `(Wave #${waveNo})`,
					$ref: `#/waves/${waveNo}`,
				},
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
	for (const kind of ['XG', 'SFX', 'GS', 'TG300B', 'GM2']) {
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

function makePrograms(tablePrograms, json, kind) {
	console.assert(json && json.tones);

	const silenceToneNos = json.tones.filter((tone) => tone.name === 'Silence   ').map((tone) => tone.toneNo);

	const programs = [];
	if (kind !== 'GS' && kind !== 'TG300B') {
		const bankM = {
			XGBasic:     0,
			XGNative:    0,
			ModelExcl:  48,
			GM2Basic:  121,
			GM2Native: 121,
		}[kind];

		for (let prog = 0; prog < 128; prog++) {
			for (let bankL = 0; bankL < 128; bankL++) {
				const toneNo = tablePrograms(kind, prog, bankM, bankL);
				if ((bankL > 0 && toneNo === tablePrograms(kind, prog, bankM, 0)) || silenceToneNos.includes(toneNo)) {
					continue;
				}
				programs.push(makeProgram(kind, prog, bankM, bankL));
			}
		}

	} else {
		const bankL = 0;
		for (let prog = 0; prog < 128; prog++) {
			for (let bankM = 0; bankM < 126; bankM++) {
				const toneNo = tablePrograms(kind, prog, bankM, bankL);
				if ((bankM > 0 && toneNo === tablePrograms(kind, prog, 0, bankL)) || silenceToneNos.includes(toneNo)) {
					continue;
				}
				programs.push(makeProgram(kind, prog, bankM, bankL));
			}
		}
		for (const bankM of [126, 127]) {
			for (let prog = 0; prog < 128; prog++) {
				const toneNo = tablePrograms(kind, prog, bankM, bankL);
				if (silenceToneNos.includes(toneNo)) {
					continue;
				}
				programs.push(makeProgram(kind, prog, bankM, bankL));
			}
		}
	}

	return programs;

	function makeProgram(kind, prog, bankM, bankL) {
		const toneNo = tablePrograms(kind, prog, bankM, bankL);
		return {
			name: json.tones[toneNo].name,
			bankM, bankL, prog,
			toneNo,
			tone: {
				$ref: `#/tones/${toneNo}`,
			},
		};
	}
}

function makeProgTable(bytes, regions, json) {
	console.assert(json && json.tones);
	console.assert(regions && regions.tableToneAddr && regions.tableToneMsb);

	const toneTables = splitArrayByN(bytes.slice(...regions.tableToneAddr), 512).map((packet) => splitArrayByN(packet, 4).map((e) => {
		const offset = ((e[0] << 24) | (e[1] << 16) | (e[2] << 8) | e[3]) * 2;
		const tone = json.tones.filter((tone) => offset === tone._offset);
		console.assert(tone.length === 1);
		return tone[0].toneNo;
	}));

	const tableBanksMsb = bytes.slice(...regions.tableToneMsb);
	const tables = Object.entries(regions).filter(([key, _]) => key.startsWith('tableTone')).reduce((p, [key, value]) => {
		p[key] = bytes.slice(...value);
		return p;
	}, {});

	return (kind, prog, bankM, bankL) => {
		console.assert([prog, bankM, bankL].every((e) => (0 <= e && e < 128)));
		const tableBanks = tables[`tableTone${kind}`];
		console.assert(tableBanks);
		if (kind !== 'GS' && kind !== 'TG300B') {
			if (bankM === 0 || bankM === 48 || bankM === 121) {
				return toneTables[tableBanks[bankL]][prog];
			} else {
				return toneTables[tableBanksMsb[bankM]][prog];	// Ignores LSB
			}
		} else {
			return toneTables[tableBanks[bankM]][prog];	// Ignores MSB
		}
	};
}

function removePrivateProp(json) {
	console.assert(Array.isArray(json) || typeof json === 'object');
	if (Array.isArray(json)) {
		for (const elem of json) {
			if (Array.isArray(elem) || typeof elem === 'object') {
				removePrivateProp(elem);
			}
		}
	} else {
		for (const [key, value] of Object.entries(json)) {
			if (key.startsWith('_')) {
				delete json[key];
			} else {
				if (Array.isArray(value) || typeof value === 'object') {
					removePrivateProp(value);
				}
			}
		}
	}
}
