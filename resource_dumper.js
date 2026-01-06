import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import process from 'node:process';
import assert from 'node:assert';

import {splitArrayByN} from './bin2json_common.js';

console.assert = assert;

const {values: options, positionals} = util.parseArgs({
	args: process?.args ?? globalThis.Deno?.args,
	allowPositionals: true,
	options: {
		mode: {type: 'string'},
	},
});

const filePaths = positionals.map((filePath) => path.isAbsolute(filePath) ? filePath : path.resolve('.', filePath));

const demoSongRanges = {
	'xp-10': {
		'Power.mid':             [0x008000, 0x00fc87],
		'KaiStrutsHisStuff.mid': [0x06b400, 0x06fc56],
		'Mangolay.mid':          [0x070000, 0x0774b6],
		'Kaleidoscope.mid':      [0x0774b6, 0x07e02a],
	},

	'sc-55mk2': {
		'MoonlightPicnic.mid.bin': [0x040000, 0x045fda],
		'LowFlying.mid.bin':       [0x045fda, 0x049fd8],
		'SuplexHold.mid.bin':      [0x050000, 0x058756],
		'Monopoly.mid.bin':        [0x058756, 0x05f446],
	},

	'sd-35': {
		'Leya\'sSong.mid.bin': [0x00cebc, 0x00ea6e],
	},

	'sc-33': {
		'WORMHole.mid.bin': [0x009c8c, 0x00f67d],
	},

	'sc-155': {
		'wIzArD.mid.bin': [0x00a79a, 0x00fb52],
	},

	'sc-55_v200': {
		'JazzLagoon.mid.bin':  [0x009ad8, 0x00d70b],
		'Leya\'sSong.mid.bin': [0x00d70b, 0x00f2bd],
	},
	'sc-55_v121': {
		'JazzLagoon.mid':  [0x0088ac, 0x00d174],
		'Leya\'sSong.mid': [0x00d174, 0x00f37f],
	},
	'sc-55_v120': {
		'JazzLagoon.mid':  [0x008894, 0x00d15c],
		'Leya\'sSong.mid': [0x00d15c, 0x00f367],
	},
	'sc-55_v110': {
		'JazzLagoon.mid':  [0x0087b4, 0x00d07c],
		'Leya\'sSong.mid': [0x00d07c, 0x00f287],
	},
	'sc-55_v100': {
		'JazzLagoon.mid':  [0x0084d8, 0x00cda0],
		'Leya\'sSong.mid': [0x00cda0, 0x00efab],
	},

	'ns5r': {
		'2000Fever.mid':  [0x000008, 0x011350],
		'MissionMan.mid': [0x011350, 0x01ddec],
	},

	'x5dr': {
		'We\'veGotDreams.mid': [0x000000, 0x00becd],
		'AroundTheWorld.mid':  [0x00bf00, 0x01fec6],
	},

	'05rw': {
		'MadRobot.mid': [0x000400, 0x008a6e],
	},

	'sg01k': {
		'Mirage.mid':    [0x010016, 0x01b1f8],
		'Journey.mid':   [0x01b1f8, 0x026f43],
		'EbbTide.mid':   [0x026f43, 0x02f0f9],
		'Emergency.mid': [0x02f0f9, 0x03a0bc],
		'LeSoleil.mid':  [0x03a0bc, 0x03c77c],
	},

	'gm-1000': {
		'NileStone.mid': [0x020000, 0x029170],
	},
};

const lcdBitmapRanges = {
	'sc-88pro': {
		'midi-a-b.bmp':     [0x0cdba8, 0x0cdde8],
		'testmode.bmp':     [0x0cf0a8, 0x0cf168],
		'bulkdump.bmp':     [0x0cf168, 0x0cf3e8],
		'booting-up.bmp':   [0x0fb5d6, 0x0fc356],
		'sound-canvas.bmp': [0x0fc356, 0x0fd496],
	},
	'sc-88vl': {
		'midi-a-b.bmp':   [0x07bd92, 0x07bfd2],
		'booting-up.bmp': [0x07c0d0, 0x07c150],
		'testmode.bmp':   [0x07de3c, 0x07defc],
		'bulkdump.bmp':   [0x07defc, 0x07e13c],
	},
	'sc-88': {
		'midi-a-b.bmp':   [0x07a12a, 0x07a36a],
		'booting-up.bmp': [0x07a406, 0x07a446],
		'testmode.bmp':   [0x07bdb8, 0x07be78],
		'bulkdump.bmp':   [0x07be78, 0x07c0b8],
	},
	'sc-55mk2': {
		'booting-up-55.bmp':  [0x070000, 0x0712c0],
		'booting-up-155.bmp': [0x0712c0, 0x072580],
	},
};

try {
	const buf = fs.readFileSync(filePaths[0]);
	const bytes = new Uint8Array(buf);

	const demoSongs = demoSongRanges[options.mode];
	const lcdBitmaps = lcdBitmapRanges[options.mode];

	if (!demoSongs && !lcdBitmaps) {
		console.error(`Invalid mode: ${options.mode}`);
	}

	if (demoSongs) {
		Object.entries(demoSongs).forEach(([fileName, range]) => {
			fs.writeFileSync(path.join('resources', `${options.mode}_${fileName}`), bytes.slice(...range));
		});
	}

	if (lcdBitmaps) {
		Object.entries(lcdBitmaps).forEach(([fileName, range]) => {
			splitArrayByN(bytes.slice(...range), 64).forEach((imageBytes, i, a) => {
				const bitmaps = [];
				for (let y = 0; y < 16; y++) {
					for (let x = 0; x < 16; x++) {
						bitmaps.push(...((imageBytes[Math.trunc(x / 5) * 16 + y] & (1 << (4 - (x % 5)))) === 0) ? [0, 125, 249, 0] : [0, 28, 55, 0]);
					}
				}

				const bmp = new Uint8Array(14 + 40 + bitmaps.length);
				bmp.set(bitmaps, 14 + 40);

				const view = new DataView(bmp.buffer);
				view.setUint16(0, 0x424d);	// "BM"
				view.setUint32(2, bmp.byteLength, true);	// bfSize
				view.setUint32(10, 14 + 40, true);	// bfOffBits
				view.setUint32(14, 40, true);	// biSize
				view.setInt32(18, 16, true);	// biWidth
				view.setInt32(22, -16, true);	// biHeight
				view.setUint16(26, 1, true);	// biPlanes
				view.setUint16(28, 32, true);	// biBitCount

				const {name, ext} = path.parse(fileName);
				const indexSuffix = `_${(i).toString().padStart(4, '0')}`;
				fs.writeFileSync(path.join('resources', `${options.mode}_${name}${(a.length > 1) ? indexSuffix : ''}${ext}`), bmp);
			});
		});
	}

} catch (e) {
	console.error(e);
}
