import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import process from 'node:process';
import assert from 'node:assert';

import {splitArrayByN} from './bin2json_common.js';

console.assert = assert;

const {values: options, positionals} = util.parseArgs({
	args: process?.argv.slice(2) ?? globalThis.Deno?.args,
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
		'MoonlightPicnic.mid.bin': [0x040000, 0x045fd9],
		'LowFlying.mid.bin':       [0x045fda, 0x049fd8],
		'SuplexHold.mid.bin':      [0x050000, 0x058755],
		'Monopoly.mid.bin':        [0x058756, 0x05f446],
	},

	'sd-35': {
		'Leya\'sSong.mid.bin': [0x00cebc, 0x00ea6e],
	},

	'sc-33': {
		'WORMHole.mid.bin': [0x009c8c, 0x00f67d],
	},

	'sc-155': {
		'wIzArD.mid.bin': [0x00a79a, 0x00fb55],
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

	'bh-1000': {
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

const muLcdBitmapRanges = {
	'mu2000': {
		'icon0.bmp':   [0x1bbbd0, 0x1bf670],
		'icon1.bmp':   [0x1bf6f8, 0x1ccad8],
		'icon2.bmp':   [0x1cd0c4, 0x1cd664],
		'icon3.bmp':   [0x1cd676, 0x1cfd36],
		'icon4.bmp':   [0x1d1024, 0x1d1d24],
		'icon5.bmp':   [0x1d1dac, 0x1d224c],
		'icon6.bmp':   [0x1d3b78, 0x1d3c18],
		'icon7.bmp':   [0x1d3c5a, 0x1d3c7a],
		'icon8.bmp':   [0x1d3eb8, 0x1d3ed8],
		'icon9.bmp':   [0x1d3efa, 0x1d3f1a],
		'icon10.bmp':  [0x1d3f3c, 0x1d3f5c],
		'icon11.bmp':  [0x1d3f5c, 0x1d40fc],
		'icon12.bmp':  [0x1d4fcc, 0x1d4fec],
		'icon13.bmp':  [0x1d5244, 0x1d5264],
		'icon14.bmp':  [0x1d52ca, 0x1d56ca],
		'icon15.bmp':  [0x1d58d4, 0x1d6254],
		'icon16.bmp':  [0x1d6298, 0x1d7098],
		'icon17.bmp':  [0x1d70ba, 0x1d70da],
		'icon18.bmp':  [0x1d7140, 0x1d7160],
		'icon19.bmp':  [0x1d7260, 0x1d72a0],
		'icon20.bmp':  [0x1d72e4, 0x1d75c4],
		'icon21.bmp':  [0x1d765a, 0x1d7c5a],
		'icon22.bmp':  [0x1d7cc0, 0x1d7ce0],
		'icon23.bmp':  [0x1d7cf2, 0x1d7d12],
		'icon24.bmp':  [0x1d7d36, 0x1d7f36],
		'icon25.bmp':  [0x1d7f72, 0x1d7fb2],
		'icon26.bmp':  [0x1d7fd4, 0x1d8094],
		'icon27.bmp':  [0x1d860c, 0x1d8a0c],
		'icon28.bmp':  [0x1d8b8c, 0x1d8d8c],
		'icon29.bmp':  [0x1d8b8c, 0x1d8d8c],
		'icon30.bmp':  [0x1d9044, 0x1d9244],
		'icon31.bmp':  [0x1d9044, 0x1d9244],
		'icon32.bmp':  [0x1d9376, 0x1d9576],
		'icon33.bmp':  [0x1d9376, 0x1d9576],
		'icon34.bmp':  [0x1d95e4, 0x1d9dc4],
		'icon35.bmp':  [0x1d9e64, 0x1d9f44],
		'icon36.bmp':  [0x1d9e64, 0x1d9f44],
		'icon37.bmp':  [0x1d9fa8, 0x1da1a8],
		'icon38.bmp':  [0x1da1ca, 0x1da3aa],
		'icon39.bmp':  [0x1da3de, 0x1da53e],
		'icon40.bmp':  [0x1da59c, 0x1da5dc],
		'icon41.bmp':  [0x1da5fc, 0x1da8bc],
		'icon42.bmp':  [0x1da8de, 0x1dacde],
		'icon43.bmp':  [0x1dad48, 0x1db248],
		'icon44.bmp':  [0x1db24e, 0x1db8ce],
	},
	'mu1000': {
		'icon0.bmp':  [0x1416fc, 0x1453dc],
		'icon1.bmp':  [0x145638, 0x145b18],
		'icon2.bmp':  [0x145b2a, 0x145d2a],
		'icon3.bmp':  [0x146b54, 0x147814],
		'icon4.bmp':  [0x14789c, 0x1479bc],
		'icon5.bmp':  [0x14907c, 0x14911c],
		'icon6.bmp':  [0x14912e, 0x14914e],
		'icon7.bmp':  [0x14938c, 0x1493ac],
		'icon8.bmp':  [0x1493ce, 0x1493ee],
		'icon9.bmp':  [0x1493f0, 0x1493ee],
		'icon10.bmp': [0x149410, 0x149430],
		'icon11.bmp': [0x149430, 0x1495d0],
		'icon12.bmp': [0x149bc8, 0x149be8],
		'icon13.bmp': [0x14a4a0, 0x14a4c0],
		'icon14.bmp': [0x14a718, 0x14a738],
		'icon15.bmp': [0x14a79e, 0x14ab9e],
		'icon16.bmp': [0x14ad54, 0x14b1f4],
	},
	'mu128': {
		'icon.bmp': [0x0dd454, 0x0e1c74],
	},
	'mu100': {
		'icon.bmp': [0x04f134, 0x054a54],
	},
	'mu90': {
		'icon.bmp': [0x0420fa, 0x04797a],
	},
	'mu80': {
		'icon0.bmp': [0x05ede4, 0x05f0c4],
		'icon1.bmp': [0x067de0, 0x069700],
	},
	'mu50': {
		'icon0.bmp': [0x0268de, 0x028bbe],
		'icon1.bmp': [0x031306, 0x032486],
	},
};

try {
	const buf = fs.readFileSync(filePaths[0]);
	const bytes = new Uint8Array(buf);

	const demoSongs = demoSongRanges[options.mode];
	const lcdBitmaps = lcdBitmapRanges[options.mode];
	const muLcdBitmaps = muLcdBitmapRanges[options.mode];

	if (!demoSongs && !lcdBitmaps && !muLcdBitmaps) {
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

	if (muLcdBitmaps) {
		Object.entries(muLcdBitmaps).forEach(([fileName, range]) => {
			splitArrayByN(bytes.slice(...range), 32).forEach((imageBytes, i, a) => {
				const bitmaps = [];
				for (let y = 0; y < 16; y++) {
					for (let x = 0; x < 16; x++) {
						bitmaps.push(...((imageBytes[Math.trunc(x / 8) + y * 2] & (1 << (7 - (x % 8)))) === 0) ? [0, 195, 146, 0] : [0, 51, 38, 0]);
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
