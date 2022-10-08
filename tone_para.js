import fs from 'fs';
import path from 'path';
import util from 'util';
import assert from 'assert';

import yargs from 'yargs';

import {midToBinForSC} from './mid2bin_sc.js';
import {midToBinForMU} from './mid2bin_mu.js';
import {binToJsonForSC8820, binToJsonForSCD70} from './bin2json_sc.js';
import {binToJsonForMU} from './bin2json_mu.js';
import {binToJsonForMU100, binToJsonForMU90, binToJsonForMU80, binToJsonForMU50} from './bin2json_mu_old.js';
import {binToJsonForTG300} from './bin2json_tg300.js';
import {binToJsonForNS5R} from './bin2json_ns5r.js';
import {midToJsonForAG10} from './mid2json_ag10.js';
import {binToJsonForGZ70SP} from './bin2json_gz70sp.js';

console.assert = assert;

const argv = yargs.
	strict().
	help().
	option('mode', {
		choices: ['sc-8850', 'sc-8820', 'sc-d70', 'sk-500', 'jv-1010', 'mu2000', 'mu1000', 'mu128', 'mu100', 'mu90', 'mu80', 'mu50', 'tg300', 'ns5r', 'ag-10', 'gz-70sp'],
	}).
	option('bin', {
		type: 'boolean',
	}).
	demandOption('mode').
	argv;

const filePath = path.isAbsolute(argv._[0]) ? argv._[0] : path.resolve('.', argv._[0]);

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

		case 'mu2000':
			{
				const json = binToJsonForMU(bytes, {
					tones:               [0x200ee0, 0x23cece],
					tableToneAddr:       [0x267f50, 0x283950],
					tableToneMsb:        [0x283950, 0x2839d0],
					tableToneXGBasic:    [0x2839d0, 0x283a50],
					tableToneXGNative:   [0x283a50, 0x283ad0],
					tableToneModelExcl:  [0x283ad0, 0x283b50],
					tableToneGS:         [0x283d50, 0x283dd0],
					drumParams:          [0x283dd0, 0x28e64e],
					tableDrumNotes:      [0x28e64e, 0x29224e],
					tableDrumParamAddr:  [0x292250, 0x292340],
					tableDrumParamXG:    [0x292340, 0x292440],
					tableDrumParamSFX:   [0x292440, 0x2924c0],
					tableDrumParamGS:    [0x2924c0, 0x292540],
					tableDrumParamGM2:   [0x292540, 0x292640],
					tableToneGM2Basic:   [0x292640, 0x2926c0],
					tableToneGM2Native:  [0x2926c0, 0x292740],
					drumNoteNamesXG:     [0x292740, 0x299dc0],
					drumKitNamesXG:      [0x299dc0, 0x299f4c],
					tableDrumKitNameXG:  [0x299f4c, 0x29a04c],
					drumNoteNamesSFX:    [0x29a04c, 0x29bdec],
					drumKitNamesSFX:     [0x29bdec, 0x29be58],
					tableDrumKitNameSFX: [0x29be58, 0x29bed8],
					drumNoteNamesGS:     [0x29bed8, 0x29ddc8],
					drumKitNamesGS:      [0x29ddc8, 0x29de4c],
					tableDrumKitNameGS:  [0x29de4c, 0x29decc],
					drumNoteNamesGM2:    [0x29decc, 0x29fccc],
					drumKitNamesGM2:     [0x29fccc, 0x29fd50],
					tableDrumKitNameGM2: [0x29fd50, 0x29fe50],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'mu1000':
			{
				const json = binToJsonForMU(bytes, {
					tones:               [0x16fed8, 0x1abec6],
					tableToneAddr:       [0x1abec8, 0x1c78c8],
					tableToneMsb:        [0x1c78c8, 0x1c7948],
					tableToneXGBasic:    [0x1c7948, 0x1c79c8],
					tableToneXGNative:   [0x1c79c8, 0x1c7a48],
					tableToneModelExcl:  [0x1c7a48, 0x1c7ac8],
					tableToneGS:         [0x1c7cc8, 0x1c7d48],
					drumParams:          [0x1c7d48, 0x1d25c6],
					tableDrumNotes:      [0x1d25c6, 0x1d61c6],
					tableDrumParamAddr:  [0x1d61c8, 0x1d62b8],
					tableDrumParamXG:    [0x1d62b8, 0x1d63b8],
					tableDrumParamSFX:   [0x1d63b8, 0x1d6438],
					tableDrumParamGS:    [0x1d6438, 0x1d64b8],
					tableDrumParamGM2:   [0x1d64b8, 0x1d65b8],
					tableToneGM2Basic:   [0x1d65b8, 0x1d6638],
					tableToneGM2Native:  [0x1d6638, 0x1d66b8],
					drumNoteNamesXG:     [0x1d66b8, 0x1ddd38],
					drumKitNamesXG:      [0x1ddd38, 0x1ddec4],
					tableDrumKitNameXG:  [0x1ddec4, 0x1ddfc4],
					drumNoteNamesSFX:    [0x1ddfc4, 0x1dfd64],
					drumKitNamesSFX:     [0x1dfd64, 0x1dfdd0],
					tableDrumKitNameSFX: [0x1dfdd0, 0x1dfe50],
					drumNoteNamesGS:     [0x1dfe50, 0x1e1d40],
					drumKitNamesGS:      [0x1e1d40, 0x1e1dc4],
					tableDrumKitNameGS:  [0x1e1dc4, 0x1e1e44],
					drumNoteNamesGM2:    [0x1e1e44, 0x1e3c44],
					drumKitNamesGM2:     [0x1e3c44, 0x1e3cc8],
					tableDrumKitNameGM2: [0x1e3cc8, 0x1e3dc8],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;
		case 'mu128':
			{
				const json = binToJsonForMU(bytes, {
					tones:                  [0x108858, 0x1418b2],
					tableToneAddr:          [0x1418b4, 0x15c6b4],
					tableToneMsb:           [0x15c6b4, 0x15c734],
					tableToneXGBasic:       [0x15c734, 0x15c7b4],
					tableToneXGNative:      [0x15c7b4, 0x15c834],
					tableToneModelExcl:     [0x15c834, 0x15c8b4],
					tableToneTG300B:        [0x15cab4, 0x15cb34],
					drumParams:             [0x15cb34, 0x166836],
					tableDrumNotes:         [0x166836, 0x16a236],
					tableDrumParamAddr:     [0x16a238, 0x16a320],
					tableDrumParamXG:       [0x16a320, 0x16a420],
					tableDrumParamSFX:      [0x16a420, 0x16a4a0],
					tableDrumParamTG300B:   [0x16a4a0, 0x16a520],
					tableDrumParamGM2:      [0x16a520, 0x16a620],
					tableToneGM2Basic:      [0x16a620, 0x16a6a0],
					tableToneGM2Native:     [0x16a6a0, 0x16a720],
					drumNoteNamesXG:        [0x16a720, 0x171638],
					drumKitNamesXG:         [0x171638, 0x1717ac],
					tableDrumKitNameXG:     [0x1717ac, 0x1718ac],
					drumNoteNamesSFX:       [0x1718ac, 0x17364c],
					drumKitNamesSFX:        [0x17364c, 0x1736b8],
					tableDrumKitNameSFX:    [0x1736b8, 0x173738],
					drumNoteNamesTG300B:    [0x173738, 0x175628],
					drumKitNamesTG300B:     [0x175628, 0x1756ac],
					tableDrumKitNameTG300B: [0x1756ac, 0x17572c],
					drumNoteNamesGM2:       [0x17572c, 0x17752c],
					drumKitNamesGM2:        [0x17752c, 0x1775b0],
					tableDrumKitNameGM2:    [0x1775b0, 0x1776b0],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu100':
			{
				const json = binToJsonForMU100(bytes, {
					tableToneAddr:       [0x0b4898, 0x0cb098],
					tableToneMsb:        [0x0cb098, 0x0cb118],
					tableToneXGBasic:    [0x0cb118, 0x0cb198],
					tableToneModelExcl:  [0x0cb198, 0x0cb218],
					tableToneXGNative:   [0x0cb218, 0x0cb298],
					tableToneXGBasic2:   [0x0cb298, 0x0cb318],	// Unknown table
					tableToneModelExcl2: [0x0cb318, 0x0cb398],	// Unknown table
					tableToneXGBasic3:   [0x0cb498, 0x0cb518],	// Unknown table
					tableToneTG300B:     [0x0cb518, 0x0cb598],
					tones:               [0x0cb710, 0x0f692e],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu90':
			{
				const json = binToJsonForMU90(bytes, {
					tableToneAddr:    [0x09725e, 0x09ba5e],
					tableToneXGBasic: [0x09ba5e, 0x09bade],
					tableToneMsb:     [0x09bade, 0x09bb5e],
					tableToneTG300B:  [0x09bb5e, 0x09bbde],
					tones:            [0x09bc8e, 0x0b36cc],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu80':
			{
				const json = binToJsonForMU80(bytes, {
					tableToneAddr:    [0x0085b2, 0x00ccb2],
					tableToneTG300B:  [0x00ccb2, 0x00cd32],
					tableToneXGBasic: [0x00cd32, 0x00cdb2],
					tableToneMsb:     [0x00cdb2, 0x00ce32],
					tones:            [0x00e3ac, 0x02402a],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'mu50':
			{
				const json = binToJsonForMU50(bytes, {
					tones:            [0x04f000, 0x067f06],
					tableToneAddr:    [0x067f06, 0x06c606],
					tableToneTG300B:  [0x06c606, 0x06c686],
					tableToneXGBasic: [0x06c686, 0x06c706],
					tableToneMsb:     [0x06c706, 0x06c786],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
			break;

		case 'tg300':
			{
				const json = binToJsonForTG300(bytes, {
					waveNames:     [0x0028d0, 0x002ef0],
					tableToneAddr: [0x006e2a, 0x00842a],
					tableToneGM_B: [0x00842a, 0x0084aa],
					tableToneGM_A: [0x0084aa, 0x00852a],
//					tableTone???:  [0x00852a, 0x0085aa],
					tones:         [0x010000, 0x01f0c0],
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
//					others:   [0x000174, 0x000276],
					drums:    [0x002e3c, 0x0038a6],
					tones:    [0x0038a6, 0x02b40e],
					combis:   [0x02b40e, 0x036b36],

					// PCM
					multiSamples:   [0x0106a6, 0x011b46],
					drumSamples:    [0x011b46, 0x0133da],
					drumKitNames:   [0x013852, 0x0139d8],
					tableDrumKits:  [0x0139da, 0x013a8a],
					drumNoteParams: [0x013a8a, 0x01fede],
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));

				Object.entries({
					'2000_Fever.mid': [0x000008, 0x011350],
					'MissionMan.mid': [0x011350, 0x01ddec],
				}).forEach((e) => {
					const [name, regions] = e;
					fs.writeFileSync(name, files.DEMO.slice(...regions));
				});
			}
			break;

		case 'gz-70sp':
			{
				const json = binToJsonForGZ70SP(bytes, {
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
				const {root, dir, name, ext} = path.parse(filePath);
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

		case 'ns5r':
			console.warn('Not implemented yet.');
			break;

		case 'ag-10':
			{
				const {root, dir, name, ext} = path.parse(filePath);
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

		case 'tg300':
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
	return JSON.stringify(json, replacer, 2).replace(/(Bytes": )"(.*?)"/uig, '$1[$2]') + '\n';

	function replacer(key, value) {
		if (/.*Bytes$/ui.test(key)) {
			return value.join(', ');
		} else {
			return value;
		}
	}
}
