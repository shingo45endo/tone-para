import fs from 'fs';
import path from 'path';
import util from 'util';
import assert from 'assert';

import yargs from 'yargs';

import {midToBinForSC} from './mid2bin_sc.js';
import {midToBinForMU} from './mid2bin_mu.js';
import {binToJsonForSC8820, binToJsonForSCD70} from './bin2json_sc8820.js';
import {binToJsonForSC88Pro, binToJsonForSC88} from './bin2json_sc88pro.js';
import {binToJsonForSC55} from './bin2json_sc55.js';
import {binToJsonForCM32L} from './bin2json_cm32l.js';
import {binToJsonForMU} from './bin2json_mu.js';
import {binToJsonForMU100, binToJsonForMU90, binToJsonForMU80, binToJsonForMU50} from './bin2json_mu_old.js';
import {binToJsonForTG300} from './bin2json_tg300.js';
import {binToJsonForTG100} from './bin2json_tg100.js';
import {binToJsonForQY2x} from './bin2json_qy2x.js';
import {binToJsonForNS5R} from './bin2json_ns5r.js';
import {midToJsonForAG10} from './mid2json_ag10.js';
import {binToJsonForGMega} from './bin2json_gmega.js';
import {binToJsonForGMegaLx} from './bin2json_gmegalx.js';
import {binToJsonForGZ70SP} from './bin2json_gz70sp.js';

console.assert = assert;

const argv = yargs.
	strict().
	help().
	option('mode', {
		choices: [
			'sc-8850', 'sc-8820', 'sc-d70', 'sk-500', 'jv-1010',
			'sc-88pro', 'sc-88vl', 'sc-88',
			'xp-10', 'sc-55mk2', 'sc-33', 'sc-55_v20', 'sc-55_v12', 'sc-55_v10',
			'cm-32l',
			'mu2000', 'mu1000', 'mu128',
			'mu100', 'mu90', 'mu80', 'mu50',
			'tg300',
			'tg100',
			'mu5', 'qy22', 'qy20',
			'ns5r',
			'ag-10',
			'gmega',
			'gmega-lx',
			'gz-70sp',
		],
	}).
	option('bin', {
		type: 'boolean',
	}).
	demandOption('mode').
	argv;

const filePaths = argv._.map((filePath) => path.isAbsolute(filePath) ? filePath : path.resolve('.', filePath));
const filePath = filePaths[0];

try {
	if (argv.bin) {
		let buf;
		try {
			buf = fs.readFileSync(filePath);
		} catch (e) {
			buf = fs.readFileSync(`${argv.mode}.bin`);
		}
		console.assert(buf);
		const bytes = new Uint8Array(buf);

		switch (argv.mode) {
		case 'sc-8820':
			{
				const json = binToJsonForSC8820(bytes, {
					tones:         [0x003d00, 0x097800],
					tones4:        [0x097800, 0x097bd0],
					waves:         [0x097bd0, 0x0bfe64],
					samples:       [0x0bfe64, 0x0d6c66],
					tableTones:    [0x0d6c66, 0x0e4566],
					tableMaps:     [0x0e4566, 0x0e45e6],
					tableBanks:    [0x0e45e6, 0x0e4b66],
					tableDrums2:   [0x0e4b66, 0x0e4c66],
					tableDrumMaps: [0x0e4c66, 0x0e4ce6],
					tableDrums:    [0x0e4ce6, 0x0e4fe6],
					drumSets:      [0x0e4fe6, 0x100c06],
					combis:        [0x100c06, 0x1010b6],
					drumNoteNames: [0x105d30, 0x13b930],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-d70':
		case 'sk-500':
			{
				const json = binToJsonForSCD70(bytes, {
					tones:         [0x001078, 0x094b78],
					tones4:        [0x094b78, 0x094f48],
					waves:         [0x094f48, 0x0bd1dc],
					samples:       [0x0bd1dc, 0x0d3fde],
					tableTones:    [0x0d3fde, 0x0e18de],
					tableMaps:     [0x0e18de, 0x0e195e],
					tableBanks:    [0x0e195e, 0x0e245e],
					tableDrumMaps: [0x0e245e, 0x0e24de],
					tableDrums:    [0x0e24de, 0x0e2ade],
					drumSets:      [0x0e2ade, 0x0fe6fe],
					combis:        [0x1012fe, 0x1017ae],
					drumNoteNames: [0x106428, 0x13c028],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'sc-88pro':
			{
				const json = binToJsonForSC88Pro(bytes, {
					tableToneAddrs:    [0x020000, 0x02e280],
					tableDrumSetAddrs: [0x02f000, 0x02f0ba],
					tableMaps:         [0x02f780, 0x02f800],
					tableBanks:        [0x02f980, 0x02fc80],
					tableDrumMaps:     [0x02f800, 0x02f880],
					tableDrums:        [0x02fd00, 0x02ff00],
					samplesRanges: [
						[0x030000, 0x03fff0],
						[0x02e3e0, 0x02effc],
					],
					waves: [0x040000, 0x04a8dc],
					drumSetsRanges: [
						[0x01f5e8, 0x020000],	// "STANDARD 1" - "STANDARD 2"
						[0x04d500, 0x04fd60],	// "STANDARD 3" - "TR-808"
						[0x050000, 0x05f240],	// "DANCE" - "SFX 2 kit"
					],
					tonesRanges: [
						[0x05f300, 0x05ff50],	// "Piano 1" - "EG+Rhodes 2"
						[0x060000, 0x06ffa8],	// "Piano 3w" - "Sync Bass"
						[0x070000, 0x07fff6],	// "MG 5th Bass" - "Syn.Calliope"
						[0x080000, 0x08fff8],	// "Vent Synth" - "Gt.FretNoise"
						[0x090000, 0x09ffc2],	// "Gt.Cut Noise" - "DazedGuitar"
						[0x0a0000, 0x0affba],	// "FeedbackGt." - "Real Tom 4"
						[0x0b0000, 0x0bffa6],	// "Open HiHat2" - "rev.jgl_bd2"
						[0x0c0000, 0x0c2dae],	// "rev.tech_bd2" - "XG Scratch2"
					],
					combis: [0x0c2dc0, 0x0c3018],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-88vl':
			{
				const json = binToJsonForSC88(bytes, {
					tableToneAddrs:    [0x020000, 0x023900],
					tableDrumSetAddrs: [0x02b550, 0x02b598],
					tableBanks:        [0x02fc00, 0x02fd00],
					tableDrums:        [0x02fd00, 0x02fe00],
					drumSetsRanges: [
						[0x023c30, 0x02b550],
					],
					waves: [0x030000, 0x03606c],
					samplesRanges: [
						[0x036100, 0x03f714],
					],
					tonesRanges: [
						[0x040000, 0x04ff78],	// "Piano 1" - "5th Saw Wave"
						[0x050000, 0x05fee2],	// "Big Fives" - "Brass 2"
						[0x060000, 0x06ffa8],	// "Syn.Brass 1" - "Lite Tom 4"
						[0x070000, 0x074e36],	// "Brs Chh" - "FlyingMonstr"
					],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-88':
			{
				const json = binToJsonForSC88(bytes, {
					tableToneAddrs:    [0x020000, 0x023900],
					tableDrumSetAddrs: [0x02b550, 0x02b598],
					tableBanks:        [0x02fc00, 0x02fd00],
					tableDrums:        [0x02fd00, 0x02fe00],
					drumSetsRanges: [
						[0x023c30, 0x02b550],
					],
					waves: [0x030000, 0x03606c],
					samplesRanges: [
						[0x036100, 0x03f714],
					],
					tonesRanges: [
						[0x040000, 0x04ff78],	// "Piano 1" - "5th Saw Wave"
						[0x050000, 0x05a728],	// "Big Fives" - "Explosion"
						[0x05a9bc, 0x05fec0],	// "Piano 1" - "Brass 1"
						[0x060000, 0x06ffa8],	// "Brass 2" - "Brush Swirl"
						[0x070000, 0x074f80],	// "Lite Tom 4" - "FlyingMonstr"
					],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'xp-10':
			{
				const json = binToJsonForSC55(bytes, {
					tonesRanges: [
						[0x010000, 0x01bd00],	// "Piano 1" - "RAVE Vox"
						[0x020000, 0x02bd00],	// "5th Saw Wave" - "Gt.FretNoise"
					],
					wavesRanges: [
						[0x01bd00, 0x01dec0],	// "PIANO1" - "SITAR"
						[0x02bd00, 0x02db3c],	// "SynVox2" - "CR78 HiHat"
					],
					samplesRanges: [
						[0x01dec0, 0x020000],
						[0x02dec0, 0x030000],
					],
					tableTones: [0x030000, 0x038000],
					tableDrums: [0x038000, 0x038080],
					drumSets:   [0x038080, 0x03c940],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-55mk2':
			{
				const json = binToJsonForSC55(bytes, {
					tonesRanges: [
						[0x010000, 0x01bd00],	// "Piano 1" - "Machine Gun"
						[0x020000, 0x02ab48],	// "Lasergun" - "Fl.Key Click"
					],
					wavesRanges: [
						[0x01bd00, 0x01dec0],	// "PIANO1" - "STSHP"
						[0x02bd00, 0x02d560],	// "JETPL" - "Con_sym"
					],
					samplesRanges: [
						[0x01dec0, 0x020000],
						[0x02dec0, 0x02fa00],
					],
					tableTones: [0x030000, 0x038000],
					tableDrums: [0x038000, 0x038080],
					drumSets:   [0x038080, 0x03adf8],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-33':
			{
				const json = binToJsonForSC55(bytes, {
					tonesRanges: [
						[0x010000, 0x01bd00],	// "Piano 1" - "Machine Gun"
						[0x020000, 0x023be8],	// "Lasergun" - "Gt.FretNoise"
					],
					wavesRanges: [
						[0x01bd00, 0x01dec0],	// "PIANO1" - "JET PLANE"
						[0x02bd00, 0x02cad4],	// "TRIZ" - "Concert Cym"
					],
					samplesRanges: [
						[0x01dec0, 0x020000],
						[0x02dec0, 0x02e750],
					],
					tableTones: [0x030000, 0x038000],
					tableDrums: [0x038000, 0x038080],
					drumSets:   [0x038080, 0x03bb9c],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-55_v20':
			{
				const json = binToJsonForSC55(bytes, {
					tonesRanges: [
						[0x010000, 0x01bd00],	// "Piano 1" - "Chorale"
						[0x020000, 0x0288b0],	// "Glasses" - "Open Hi Hat2"
					],
					wavesRanges: [
						[0x01bd00, 0x01dec0],	// "PIANO1" - "SQR20"
						[0x02bd00, 0x02d470],	// "ELP2" - "Con_sym"
					],
					samplesRanges: [
						[0x01dec0, 0x020000],
						[0x02dec0, 0x02fba0],
					],
					tableTones: [0x030000, 0x038000],
					tableDrums: [0x038000, 0x038080],
					drumSets:   [0x038080, 0x03c028],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-55_v12':
			{
				const json = binToJsonForSC55(bytes, {
					tonesRanges: [
						[0x010000, 0x01bd00],	// "Piano 1" - "Chorale"
						[0x020000, 0x0288b0],	// "Glasses" - "Open Hi Hat2"
					],
					wavesRanges: [
						[0x01bd00, 0x01dec0],	// "PIANO1" - "SQR20"
						[0x02bd00, 0x02d470],	// "ELP2" - "Con_sym"
					],
					samplesRanges: [
						[0x01dec0, 0x020000],
						[0x02dec0, 0x02fb90],
					],
					tableTones: [0x030000, 0x038000],
					tableDrums: [0x038000, 0x038080],
					drumSets:   [0x038080, 0x03c028],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'sc-55_v10':
			{
				const json = binToJsonForSC55(bytes, {
					tonesRanges: [
						[0x010000, 0x01a200],	// "Piano 1" - "Elec Piano 2"
						[0x020000, 0x02a200],	// "Elec Piano 3" - "Open Hi Hat2"
					],
					wavesRanges: [
						[0x01a200, 0x01cf00],	// "PIANO1" - "HI_Q"
						[0x02a200, 0x02adf4],	// "SLAP" - "Con_sym"
					],
					samplesRanges: [
						[0x01cf00, 0x01ff00],
						[0x02cf00, 0x02dcf0],
					],
					tableTones: [0x030000, 0x038000],
					tableDrums: [0x038000, 0x038080],
					drumSets:   [0x038080, 0x03c028],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'cm-32l':
			{
				const json = binToJsonForCM32L(bytes, {
					tonesRanges: [
						[0x00b000, 0x00bffa],
						[0x00c000, 0x00fe2a],
						[0x008a00, 0x00a876],
					],
					drumSet: [0x008580, 0x0086d4],
					samples: [0x008100, 0x008500],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu2000':
			{
				const json = binToJsonForMU(bytes, {
					waves:                      [0x1f55a0, 0x200af0],
					tableWaveAddrs:             [0x200af0, 0x200ede],
					tones:                      [0x200ee0, 0x23cece],
					tableToneAddrs:             [0x267f50, 0x283950],
					tableTonesMsb:              [0x283950, 0x2839d0],
					tableTonesXGBasic:          [0x2839d0, 0x283a50],
					tableTonesXGNative:         [0x283a50, 0x283ad0],
					tableTonesModelExcl:        [0x283ad0, 0x283b50],
					tableTonesGS:               [0x283d50, 0x283dd0],
					drumParams:                 [0x283dd0, 0x28e64e],
					tableDrumNotes:             [0x28e64e, 0x29224e],
					tableDrumParamAddrs:        [0x292250, 0x292340],
					tableDrumsXGBasic:          [0x292340, 0x2923c0],
					tableDrumsXGNative:         [0x2923c0, 0x292440],
					tableDrumsSFX:              [0x292440, 0x2924c0],
					tableDrumsGS:               [0x2924c0, 0x292540],
					tableDrumsGM2Basic:         [0x292540, 0x2925c0],
					tableDrumsGM2Native:        [0x2925c0, 0x292640],
					tableTonesGM2Basic:         [0x292640, 0x2926c0],
					tableTonesGM2Native:        [0x2926c0, 0x292740],
					drumNoteNamesXG:            [0x292740, 0x299dc0],
					drumSetNamesXG:             [0x299dc0, 0x299f4c],
					tableDrumSetNamesXGBasic:   [0x299f4c, 0x299fcc],
					tableDrumSetNamesXGNative:  [0x299fcc, 0x29a04c],
					drumNoteNamesSFX:           [0x29a04c, 0x29bdec],
					drumSetNamesSFX:            [0x29bdec, 0x29be58],
					tableDrumSetNamesSFX:       [0x29be58, 0x29bed8],
					drumNoteNamesGS:            [0x29bed8, 0x29ddc8],
					drumSetNamesGS:             [0x29ddc8, 0x29de4c],
					tableDrumSetNamesGS:        [0x29de4c, 0x29decc],
					drumNoteNamesGM2:           [0x29decc, 0x29fccc],
					drumSetNamesGM2:            [0x29fccc, 0x29fd50],
					tableDrumSetNamesGM2Basic:  [0x29fd50, 0x29fdd0],
					tableDrumSetNamesGM2Native: [0x29fdd0, 0x29fe50],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'mu1000':
			{
				const json = binToJsonForMU(bytes, {
					waves:                      [0x164598, 0x16fae8],
					tableWaveAddrs:             [0x16fae8, 0x16fed6],
					tones:                      [0x16fed8, 0x1abec6],
					tableToneAddrs:             [0x1abec8, 0x1c78c8],
					tableTonesMsb:              [0x1c78c8, 0x1c7948],
					tableTonesXGBasic:          [0x1c7948, 0x1c79c8],
					tableTonesXGNative:         [0x1c79c8, 0x1c7a48],
					tableTonesModelExcl:        [0x1c7a48, 0x1c7ac8],
					tableTonesGS:               [0x1c7cc8, 0x1c7d48],
					drumParams:                 [0x1c7d48, 0x1d25c6],
					tableDrumNotes:             [0x1d25c6, 0x1d61c6],
					tableDrumParamAddrs:        [0x1d61c8, 0x1d62b8],
					tableDrumsXGBasic:          [0x1d62b8, 0x1d6338],
					tableDrumsXGNative:         [0x1d6338, 0x1d63b8],
					tableDrumsSFX:              [0x1d63b8, 0x1d6438],
					tableDrumsGS:               [0x1d6438, 0x1d64b8],
					tableDrumsGM2Basic:         [0x1d64b8, 0x1d6538],
					tableDrumsGM2Native:        [0x1d6538, 0x1d65b8],
					tableTonesGM2Basic:         [0x1d65b8, 0x1d6638],
					tableTonesGM2Native:        [0x1d6638, 0x1d66b8],
					drumNoteNamesXG:            [0x1d66b8, 0x1ddd38],
					drumSetNamesXG:             [0x1ddd38, 0x1ddec4],
					tableDrumSetNamesXGBasic:   [0x1ddec4, 0x1ddf44],
					tableDrumSetNamesXGNative:  [0x1ddf44, 0x1ddfc4],
					drumNoteNamesSFX:           [0x1ddfc4, 0x1dfd64],
					drumSetNamesSFX:            [0x1dfd64, 0x1dfdd0],
					tableDrumSetNamesSFX:       [0x1dfdd0, 0x1dfe50],
					drumNoteNamesGS:            [0x1dfe50, 0x1e1d40],
					drumSetNamesGS:             [0x1e1d40, 0x1e1dc4],
					tableDrumSetNamesGS:        [0x1e1dc4, 0x1e1e44],
					drumNoteNamesGM2:           [0x1e1e44, 0x1e3c44],
					drumSetNamesGM2:            [0x1e3c44, 0x1e3cc8],
					tableDrumSetNamesGM2Basic:  [0x1e3cc8, 0x1e3d48],
					tableDrumSetNamesGM2Native: [0x1e3d48, 0x1e3dc8],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'mu128':
			{
				const json = binToJsonForMU(bytes, {
					waves:                      [0x0fdb0c, 0x1084bc],
					tableWaveAddrs:             [0x1084bc, 0x108856],
					tones:                      [0x108858, 0x1418b2],
					tableToneAddrs:             [0x1418b4, 0x15c6b4],
					tableTonesMsb:              [0x15c6b4, 0x15c734],
					tableTonesXGBasic:          [0x15c734, 0x15c7b4],
					tableTonesXGNative:         [0x15c7b4, 0x15c834],
					tableTonesModelExcl:        [0x15c834, 0x15c8b4],
					tableTonesTG300B:           [0x15cab4, 0x15cb34],
					drumParams:                 [0x15cb34, 0x166836],
					tableDrumNotes:             [0x166836, 0x16a236],
					tableDrumParamAddrs:        [0x16a238, 0x16a320],
					tableDrumsXGBasic:          [0x16a320, 0x16a3a0],
					tableDrumsXGNative:         [0x16a3a0, 0x16a420],
					tableDrumsSFX:              [0x16a420, 0x16a4a0],
					tableDrumsTG300B:           [0x16a4a0, 0x16a520],
					tableDrumsGM2Basic:         [0x16a520, 0x16a5a0],
					tableDrumsGM2Native:        [0x16a5a0, 0x16a620],
					tableTonesGM2Basic:         [0x16a620, 0x16a6a0],
					tableTonesGM2Native:        [0x16a6a0, 0x16a720],
					drumNoteNamesXG:            [0x16a720, 0x171638],
					drumSetNamesXG:             [0x171638, 0x1717ac],
					tableDrumSetNamesXGBasic:   [0x1717ac, 0x17182c],
					tableDrumSetNamesXGNative:  [0x17182c, 0x1718ac],
					drumNoteNamesSFX:           [0x1718ac, 0x17364c],
					drumSetNamesSFX:            [0x17364c, 0x1736b8],
					tableDrumSetNamesSFX:       [0x1736b8, 0x173738],
					drumNoteNamesTG300B:        [0x173738, 0x175628],
					drumSetNamesTG300B:         [0x175628, 0x1756ac],
					tableDrumSetNamesTG300B:    [0x1756ac, 0x17572c],
					drumNoteNamesGM2:           [0x17572c, 0x17752c],
					drumSetNamesGM2:            [0x17752c, 0x1775b0],
					tableDrumSetNamesGM2Basic:  [0x1775b0, 0x177630],
					tableDrumSetNamesGM2Native: [0x177630, 0x1776b0],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu100':
			{
				const json = binToJsonForMU100(bytes, {
					tableDrumSetNamesXG:     [0x0283fe, 0x02847e],
					tableDrumSetNamesSFX:    [0x02847e, 0x0284fe],
					tableDrumSetNamesTG300B: [0x0284fe, 0x02857e],
					drumSetNamesXGBasic:     [0x02857e, 0x0286b6],
					drumSetNamesXGNative:    [0x0286b6, 0x0287ee],
					drumSetNamesTG300B:      [0x0287ee, 0x028846],
					drumNoteNamesXG:         [0x02899e, 0x0312a2],
					drumNoteNamesTG300B:     [0x0312a2, 0x033192],
					drumParams:              [0x0a8000, 0x0b1798],
					tableDrumNotes:          [0x0b1798, 0x0b4698],
					tableDrumsTG300B:        [0x0b4698, 0x0b4718],
					tableDrumsXGBasic:       [0x0b4718, 0x0b4798],
					tableDrumsXGNative:      [0x0b4798, 0x0b4818],
					tableDrumsSFX:           [0x0b4818, 0x0b4898],
					tableToneAddrs:          [0x0b4898, 0x0cb098],
					tableTonesMsb:           [0x0cb098, 0x0cb118],
					tableTonesXGBasic:       [0x0cb118, 0x0cb198],
					tableTonesModelExcl:     [0x0cb198, 0x0cb218],
					tableTonesXGNative:      [0x0cb218, 0x0cb298],
					tableTonesXGBasic2:      [0x0cb298, 0x0cb318],	// Unknown table
					tableTonesModelExcl2:    [0x0cb318, 0x0cb398],	// Unknown table
					tableTonesXGBasic3:      [0x0cb498, 0x0cb518],	// Unknown table
					tableTonesTG300B:        [0x0cb518, 0x0cb598],
					tones:                   [0x0cb710, 0x0f692e],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu90':
			{
				const json = binToJsonForMU90(bytes, {
					drumSetNamesXG:          [0x027048, 0x0270f8],
					drumSetNamesTG300B:      [0x0270f8, 0x027150],
					drumNoteNamesXG:         [0x0303fe, 0x0351c2],
					drumNoteNamesTG300B:     [0x0351c2, 0x0370b2],
					tableDrumSetNamesXG:     [0x037d8a, 0x037e0a],
					tableDrumSetNamesTG300B: [0x037e0a, 0x037e8a],
					drumParams:              [0x090000, 0x0951de],
					tableDrumNotes:          [0x0951de, 0x0970de],
					tableDrumsTG300B:        [0x0970de, 0x09715e],
					tableDrumsXG:            [0x09715e, 0x0971de],
					tableDrumsSFX:           [0x0971de, 0x09725e],
					tableToneAddrs:          [0x09725e, 0x09ba5e],
					tableTonesXG:            [0x09ba5e, 0x09bade],
					tableTonesMsb:           [0x09bade, 0x09bb5e],
					tableTonesTG300B:        [0x09bb5e, 0x09bbde],
					tones:                   [0x09bc8e, 0x0b36cc],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu80':
			{
				const json = binToJsonForMU80(bytes, {
					drumParams:              [0x0049de, 0x006e32],
					tableDrumNotes:          [0x006e32, 0x008432],
					tableDrumsTG300B:        [0x008432, 0x0084b2],
					tableDrumsXG:            [0x0084b2, 0x008532],
					tableDrumsSFX:           [0x008532, 0x0085b2],
					tableToneAddrs:          [0x0085b2, 0x00ccb2],
					tableTonesTG300B:        [0x00ccb2, 0x00cd32],
					tableTonesXG:            [0x00cd32, 0x00cdb2],
					tableTonesMsb:           [0x00cdb2, 0x00ce32],
					tones:                   [0x00e3ac, 0x02402a],
					drumSetNamesXG:          [0x05fcde, 0x05fd46],
					drumSetNamesTG300B:      [0x05fd46, 0x05fd9e],
					drumNoteNameAddrsXG:     [0x060644, 0x060670],
					drumNoteNameAddrsTG300B: [0x060674, 0x060698],
					drumNoteNamesXG:         [0x0665e2, 0x066996],	// Only StandKit
					drumNoteNamesTG300B:     [0x066996, 0x066c96],	// Only StandKit
					drumNoteNamesOthers:     [0x067213, 0x067bdf],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu50':
			{
				const json = binToJsonForMU50(bytes, {
					tableDrumsTG300B:        [0x0229da, 0x022a5a],
					tableDrumsXG:            [0x022a5a, 0x022ada],
					tableDrumsSFX:           [0x022ada, 0x022b5a],
					drumSetNamesXG:          [0x0296fa, 0x029762],
					drumSetNamesTG300B:      [0x029762, 0x0297ba],
					drumSetNamesDOC:         [0x0297ba, 0x0297c2],
					drumNoteNameAddrsXG:     [0x02a0d6, 0x02a102],
					drumNoteNameAddrsTG300B: [0x02a106, 0x02a12a],
					drumNoteNamesXG:         [0x02f8b8, 0x02fc6c],	// Only StandKit
					drumNoteNamesTG300B:     [0x02fc6c, 0x02ff6c],	// Only StandKit
					drumNoteNameIndicesDOC:  [0x0304ab, 0x0304e9],
					drumNoteNamesOthers:     [0x030542, 0x031106],
					tones:                   [0x04f000, 0x067f06],
					tableToneAddrs:          [0x067f06, 0x06c606],
					tableTonesTG300B:        [0x06c606, 0x06c686],
					tableTonesXG:            [0x06c686, 0x06c706],
					tableTonesMsb:           [0x06c706, 0x06c786],
					drumParams:              [0x06c788, 0x06f0e6],
					tableDrumNotes:          [0x06f0e6, 0x0707e6],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'tg300':
			{
				const json = binToJsonForTG300(bytes, {
					waves:              [0x000200, 0x0028d0],
					waveNames:          [0x0028d0, 0x002ef0],
					tableWaveAddrs:     [0x002ef0, 0x003078],
					drumParams:         [0x003078, 0x004888],
					drumSetNames:       [0x004888, 0x004900],
					tableDrumNoteAddrs: [0x004900, 0x005800],
					tableDrumsGM_B:     [0x005800, 0x005880],
					tableDrumsGM_A:     [0x005880, 0x005900],
					tableToneAddrs:     [0x006e2a, 0x00842a],
					tableTonesGM_B:     [0x00842a, 0x0084aa],
					tableTonesGM_A:     [0x0084aa, 0x00852a],
					tones:              [0x010000, 0x01f0c0],
					drumNoteNames:      [0x055147, 0x0574e7],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'tg100':
			{
				const buf2 = fs.readFileSync(filePaths[1]);
				const files = {
					PROG: (buf.length < buf2.length) ? buf : buf2,
					PCM:  (buf.length < buf2.length) ? buf2 : buf,
				};
				const json = binToJsonForTG100(files, {
					// PROG
					tableTonesGM:       [0x010000, 0x010100],
					tableTonesDOC:      [0x010100, 0x010200],
					tableTonesCMType1:  [0x010200, 0x010300],
					tableTonesCMType2:  [0x010300, 0x010400],
					tones:              [0x010410, 0x014c10],
					tableDrums:         [0x014c10, 0x014c90],
					tableBanks:         [0x014c90, 0x014d10],
//					tableTonesInternal: [0x014d10, 0x014e10],	// Not used
					tableDrumSetNames:  [0x0164e8, 0x016578],
					drumSetNames:       [0x016a80, 0x016ae0],
					waves:              [0x0176a2, 0x018419],
					tableWaves:         [0x01841a, 0x018532],
					tableDrumWaves:     [0x018532, 0x018b9e],
					tableDrumNotes:     [0x018b9e, 0x01959e],

					// PCM
					samples: [0x000000, 0x001800],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu5':
			{
				const json = binToJsonForQY2x(bytes, {
					tableDrums:     [0x00f42a, 0x00f4aa],
					drumSetNames:   [0x010597, 0x0105e8],
					waves:          [0x0181ae, 0x019b7c],
					tableWaves:     [0x019b7c, 0x019c94],
					tableDrumWaves: [0x019c94, 0x01a864],
					tableDrumNotes: [0x01a864, 0x01b164],
					tones:          [0x01b164, 0x01d164],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'qy22':
			{
				const json = binToJsonForQY2x(bytes, {
					waves:          [0x000100, 0x001ace],
					tableWaves:     [0x001ace, 0x001be6],
					tableDrumWaves: [0x001be6, 0x0027b6],
					tableDrumNotes: [0x0027b6, 0x0030b6],
					tones:          [0x003100, 0x005100],
					drumSetNames:   [0x02748a, 0x0274da],
					tableDrums:     [0x0274f5, 0x027575],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'qy20':
			{
				const json = binToJsonForQY2x(bytes, {
					tableTonesNormal: [0x00022e, 0x0002ae],
					tableDrums:       [0x0002ae, 0x00032e],
					tableTonesGM:     [0x00032e, 0x0003ae],
					tableWaves:       [0x001600, 0x001700],
					tableDrumWaves:   [0x001700, 0x002120],
					tableDrumNotes:   [0x002120, 0x002a20],
					waves:            [0x002a20, 0x00358d],
					tones:            [0x003600, 0x005600],
					drumSetNames:     [0x0274a6, 0x0274ee],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'ns5r':
			{
				const {root, dir, name, ext} = path.parse(filePath);
				const m = name.match(/^(X572)(.*)/ui);
				if (!m) {
					throw new Error(`Invalid file: ${filePath}`);
				}
				const files = ['PROG', 'PCM', 'DEMO'].reduce((p, c) => {
					if (c === m[2]) {
						p[c] = bytes;
					} else {
						const buf = fs.readFileSync(path.format({root, dir, name: `${m[1]}${c}`, ext}));
						p[c] = new Uint8Array(buf);
					}
					return p;
				}, {});

				const json = binToJsonForNS5R(files, {
					// PROG
//					others:    [0x000174, 0x000276],
					drumTones: [0x002e3c, 0x0038a6],
					tones:     [0x0038a6, 0x02b40e],
					combis:    [0x02b40e, 0x036b36],

					// PCM
					waveNames:      [0x0106a6, 0x011b46],
					drumSamples:    [0x011b46, 0x0133da],
					drumSetNames:   [0x013852, 0x0139d8],
					tableDrumSets:  [0x0139da, 0x013a8a],
					drumNoteParams: [0x013a8a, 0x01fede],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));

				Object.entries({
					'2000_Fever.mid': [0x000008, 0x011350],
					'MissionMan.mid': [0x011350, 0x01ddec],
				}).forEach((e) => {
					const [name, ranges] = e;
					fs.writeFileSync(name, files.DEMO.slice(...ranges));
				});
			}
			break;

		case 'gmega':
			{
				const buf2 = fs.readFileSync(filePaths[1]);
				const files = {
					PROG: (buf.length < buf2.length) ? buf : buf2,
					PCM:  (buf.length < buf2.length) ? buf2 : buf,
				};
				const json = binToJsonForGMega(files, {
					// PROG
					toneNamesGM:       [0x008000, 0x008438],
					toneNamesSP:       [0x008438, 0x008870],
					drumToneNames:     [0x008870, 0x008c70],
					tableToneParamsGM: [0x009ce8, 0x009d68],
					tableToneParamsSP: [0x009d68, 0x009de8],
					tableDrumNotes:    [0x009de8, 0x00a168],

					// PCM
					toneParamsGM:     [0x03c000, 0x03d800],
					drumToneParamsGM: [0x03d800, 0x03e800],
					toneParamsSP:     [0x040000, 0x041800],
					drumToneParamsSP: [0x041800, 0x042800],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'gmega-lx':	// TODO: WIP
			{
				const json = binToJsonForGMegaLx(bytes, {
					toneNames:       [0x008653, 0x008b8b],
					tableDrumNotes:  [0x009bab, 0x009f2b],
					tableToneAddrs:  [0x018000, 0x018140],
					drumToneParams:  [0x01e46a, 0x01efea],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'gz-70sp':
			{
				const json = binToJsonForGZ70SP(bytes, {
					tableDrums:         [0x0047b8, 0x0047c8],
					tones:              [0x0122aa, 0x013692],
					samples:            [0x01388e, 0x015f2e],
					tableSampleOffsets: [0x016092, 0x01f092],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'ag-10':
			console.warn('Not supported.');
			break;

		default:
			console.assert(false);
			break;
		}

	} else {
		switch (argv.mode) {
		case 'sc-8850':
		case 'sc-8820':
		case 'sc-d70':
		case 'sk-500':
		case 'jv-1010':
			{
				const {dir, name} = path.parse(filePath);
				const m = name.match(/^([^\d]*)(\d+)$/u);
				if (!m) {
					throw new Error(`Invalid file name: ${name}`);
				}
				const pattern = new RegExp(String.raw`^[^\d]{${m[1].length}}\d{${m[2].length}}$`, 'u');
				const fileNames = fs.readdirSync(dir).filter((e) => pattern.test(path.parse(e).name));

				(async () => {
					const files = await Promise.all(fileNames.map(async (fileName) => await util.promisify(fs.readFile)(path.join(dir, fileName))));
					const bin = midToBinForSC(files);
					fs.writeFileSync(`${argv.mode}.bin`, bin);
				})();
			}
			break;

		case 'mu2000':
		case 'mu1000':
		case 'mu128':
			{
				const bytes = new Uint8Array(fs.readFileSync(filePath));
				const view = new DataView(bytes.buffer);
				if (view.getUint32(0) !== 0x4e5a656d) {
					throw new Error(`Invalid file: ${filePath}`);
				}

				view.setUint32(0, 0x4d546864);
				const bin = midToBinForMU(bytes);
				fs.writeFileSync(`${argv.mode}.bin`, bin);
			}
			break;

		case 'ag-10':
			{
				const {dir} = path.parse(filePath);
				const fileNames = fs.readdirSync(dir).filter((e) => /^\d{3}.*?\.AG/ui.test(path.basename(e)));

				(async () => {
					const fileObjs = await Promise.all(fileNames.map(async (fileName) => ({
						name: fileName,
						content: await util.promisify(fs.readFile)(path.join(dir, fileName)),
					})));
					const files = fileObjs.reduce((p, c) => {
						p[c.name] = c.content;
						return p;
					}, {});
					const json = midToJsonForAG10(files);
					fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
				})();
			}
			break;

		case 'sc-88pro':
		case 'xp-10':
		case 'sc-55mk2':
		case 'sc-33':
		case 'sc-55_v20':
		case 'sc-55_v12':
		case 'sc-55_v10':
		case 'cm-32l':
		case 'tg300':
		case 'ns5r':
		case 'gmega':
		case 'gmega-lx':
		case 'gz-70sp':
			console.warn('Not supported.');
			break;

		default:
			console.assert(false);
			break;
		}
	}

} catch (e) {
	console.error(e);
}

function myStringify(json) {
	return JSON.stringify(json, replacer, '\t').replace(/(Bytes": )"(.*?)"/uig, '$1[$2]') + '\n';

	function replacer(key, value) {
		if (/.*Bytes$/ui.test(key)) {
			return value.join(', ');
		} else {
			return value;
		}
	}
}
