import fs from 'fs';
import path from 'path';
import util from 'util';
import assert from 'assert';

import yargs from 'yargs';

import {midToBinForSC} from './mid2bin_sc.js';
import {midToBinForMU} from './mid2bin_mu.js';
import {binToJsonForSC8820, binToJsonForSCD70} from './bin2json_sc.js';
import {binToJsonForMU} from './bin2json_mu.js';
import {binToJsonForNS5R} from './bin2json_ns5r.js';

console.assert = assert;

const argv = yargs.
	strict().
	help().
	option('mode', {
		choices: ['sc-8850', 'sc-8820', 'sc-d70', 'sk-500', 'jv-1010', 'mu2000', 'mu1000', 'mu128', 'ns5r'],
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
//					tableAddr:           [0x267f50, 0x283950],
					drumParams:          [0x283dd0, 0x28e64e],
					tableDrumNotes:      [0x28e64e, 0x29224e],
					tableDrumParamAddr:  [0x292250, 0x292340],
					tableDrumParamXG:    [0x292340, 0x292440],
					tableDrumParamSFX:   [0x292440, 0x2924c0],
					tableDrumParamGS:    [0x2924c0, 0x292540],
					tableDrumParamGM2:   [0x292540, 0x292640],
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
//					tableAddr:           [0x1abec8, 0x1c78c8],
					drumParams:          [0x1c7d48, 0x1d25c6],
					tableDrumNotes:      [0x1d25c6, 0x1d61c6],
					tableDrumParamAddr:  [0x1d61c8, 0x1d62b8],
					tableDrumParamXG:    [0x1d62b8, 0x1d63b8],
					tableDrumParamSFX:   [0x1d63b8, 0x1d6438],
					tableDrumParamGS:    [0x1d6438, 0x1d64b8],
					tableDrumParamGM2:   [0x1d64b8, 0x1d65b8],
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
					tones:               [0x108858, 0x1418b2],
//					tableAddr:           [0x1418b4, 0x15c6b4],
					drumParams:          [0x15cb34, 0x166836],
					tableDrumNotes:      [0x166836, 0x16a236],
					tableDrumParamAddr:  [0x16a238, 0x16a320],
					tableDrumParamXG:    [0x16a320, 0x16a420],
					tableDrumParamSFX:   [0x16a420, 0x16a4a0],
					tableDrumParamGS:    [0x16a4a0, 0x16a520],
					tableDrumParamGM2:   [0x16a520, 0x16a620],
					drumNoteNamesXG:     [0x16a720, 0x171638],
					drumKitNamesXG:      [0x171638, 0x1717ac],
					tableDrumKitNameXG:  [0x1717ac, 0x1718ac],
					drumNoteNamesSFX:    [0x1718ac, 0x17364c],
					drumKitNamesSFX:     [0x17364c, 0x1736b8],
					tableDrumKitNameSFX: [0x1736b8, 0x173738],
					drumNoteNamesGS:     [0x173738, 0x175628],
					drumKitNamesGS:      [0x175628, 0x1756ac],
					tableDrumKitNameGS:  [0x1756ac, 0x17572c],
					drumNoteNamesGM2:    [0x17572c, 0x17752c],
					drumKitNamesGM2:     [0x17752c, 0x1775b0],
					tableDrumKitNameGM2: [0x1775b0, 0x1776b0],
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
				const files = ['PROG', 'PCM'].reduce((p, c) => {
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
				});
				fs.writeFileSync(`${argv.mode}.json`, myStringify(json));
			}
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
