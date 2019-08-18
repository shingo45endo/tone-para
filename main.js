import fs from 'fs';
import path from 'path';
import util from 'util';
import assert from 'assert';

import yargs from 'yargs';

import {midToBinForSC} from './mid2bin_sc.js';
import {midToBinForMU} from './mid2bin_mu.js';
import {binToJsonForSC8820, binToJsonForSCD70} from './bin2json_sc.js';

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
		case 'mu1000':
		case 'mu128':
			console.warn('Not implemented yet.');
			break;

		case 'ns5r':
			console.warn('Not implemented yet.');
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
