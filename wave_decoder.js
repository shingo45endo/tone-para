import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import process from 'node:process';
import assert from 'node:assert';

import {decodePcmForSc, descrambleRomForScPcm} from './pcmdec_sc.js';
import {decodePcmForUPcm} from './pcmdec_upcm.js';
import {descrambleRomForUPcm} from './bin2json_upcm.js';

console.assert = assert;

const {values: options, positionals} = util.parseArgs({
	args: process?.args ?? globalThis.Deno?.args,
	allowPositionals: true,
	options: {
		mode: {type: 'string'},
		instname: {type: 'boolean'},
		loopsec: {type: 'string'},
		samplerate: {type: 'string'},
	},
});

const filePaths = positionals.map((filePath) => path.isAbsolute(filePath) ? filePath : path.resolve('.', filePath));
const [jsonFilePath, ...pcmFilePath] = filePaths;

let loopSec = (options.loopsec) ? parseFloat(options.loopsec) : 0.0;
if (loopSec <= 0.0 || 60.0 < loopSec) {
	loopSec = 1.0;
}

const json = JSON.parse(fs.readFileSync(jsonFilePath));
const pcmRoms = pcmFilePath.map((filePath) => {
	const buf = fs.readFileSync(filePath);
	return new Uint8Array(buf);
});

const pcmFileSizes = {
	'pma-5':     [2097152],
	'xp-10':     [4194304],	// Not confirmed
	'sc-55mk2':  [2097152, 1048576],
	'sd-35':     [1048576],	// Not confirmed
	'sc-33':     [2097152],	// Not confirmed
	'sc-55_v20': [1048576, 1048576, 1048576],
	'sc-55_v12': [1048576, 1048576, 1048576],
	'sc-55_v10': [1048576, 1048576, 1048576],
	'ra-90':     [1048576, 1048576, 1048576],

	'cm-32p':    [524288, 524288, 524288],
	'u-110':     [524288, 524288, 524288, 524288],	// Not confirmed
	'u-220':     [524288, 524288, 524288, 524288, 524288, 524288],	// Not confirmed
	'sn-u110':   [524288],	// Not confirmed
};

try {
	switch (options.mode) {
	case 'pma-5':
	case 'xp-10':
	case 'sc-55mk2':
	case 'sd-35':
	case 'sc-33':
	case 'sc-55_v20':
	case 'sc-55_v12':
	case 'sc-55_v10':
	case 'ra-90':
		{
			const descrambledRoms = pcmRoms.map((buf) => descrambleRomForScPcm(buf));
			const pcmRomReader = (addr) => descrambledRoms[addr >> 21][addr & (pcmFileSizes[options.mode][0] - 1)];

			for (const sample of json.samples) {
				// Chooses a wave which contains the sample.
				const waves = json.waves.filter((wave) => wave.sampleSlots.find(({sampleNo}) => (sampleNo === sample.sampleNo))) ?? [];
				const tones = json.tones.filter((tone) => {
					for (const voice of tone.voices) {
						if (waves.some((wave) => (wave.waveNo === voice.waveNo))) {
							return true;
						}
					}
					return false;
				});

				// Determines sampling rate based on wave information.
				let sampleRate = (options.samplerate) ? parseInt(options.samplerate, 10) : 0;
				if (!options.samplerate && waves.length > 0) {
					const {low, high} = waves[0].sampleSlots.find((sampleSlot) => (sampleSlot.sampleNo === sample.sampleNo));

					let baseKey;
					if (low === 0 && high === 0x7f) {
						baseKey = 60;
					} else {
						if (low <= sample.key && sample.key <= high) {
							baseKey = sample.key;
						} else {
							baseKey = (Math.abs(low - sample.key) < Math.abs(high - sample.key)) ? low : high;
						}
					}
					sampleRate = Math.round(32000 / 2 ** ((sample.key - baseKey) / 12));
				}
				if (sampleRate <= 0) {
					sampleRate = 32000;
				}

				const sampleNoStr = (sample.sampleNo).toString().padStart(4, '0');
				const waveFileName = (options.instname) ? 
					`${options.mode}_sample_${sampleNoStr}-${toFileNameChar(tones?.[0]?.name ?? 'NOINST')}-${toFileNameChar(waves?.[0]?.name ?? 'NOWAVE')}.wav` :
					`${options.mode}_sample_${sampleNoStr}.wav`;

				const blob = new Blob(decodePcmForSc(sample, pcmRomReader, sampleRate, loopSec), {type: 'audio/wav'});
				blob.arrayBuffer().then((arrayBuffer) => {
					fs.writeFileSync(path.join('samples', waveFileName), new Uint8Array(arrayBuffer));
				});
			}
		}
		break;

	case 'cm-32p':
	case 'u-110':
	case 'u-220':
	case 'sn-u110':
		{
			const descrambledRoms = pcmRoms.map((buf) => descrambleRomForUPcm(buf));
			const pcmRomReader = (addr) => descrambledRoms[addr >> 20][addr & (pcmFileSizes[options.mode][0] - 1)];

			for (const sample of json.samples) {
				// Chooses a tone which contains the sample.
				const tones = json.tones.filter((tone) => {
					for (const voice of tone.voices) {
						if (voice.sampleSlots.some((sampleSlot) => (sampleSlot.sampleNo === sample.sampleNo))) {
							return true;
						}
					}
					return false;
				});

				// Determines sampling rate based on tone information.
				let sampleRate = (options.samplerate) ? parseInt(options.samplerate, 10) : 0;
				if (!options.samplerate && tones.length > 0) {
					const {low, high} = tones[0].voices.map((voice) => voice.sampleSlots).flat().find((sampleSlot) => (sampleSlot.sampleNo === sample.sampleNo));

					let baseKey;
					if (low === 0 && high === 0x7f) {
						baseKey = sample.key;
					} else {
						if (low <= sample.key && sample.key <= high) {
							baseKey = sample.key;
						} else {
							baseKey = (Math.abs(low - sample.key) < Math.abs(high - sample.key)) ? low : high;
						}
					}
					sampleRate = Math.round(32000 / 2 ** ((sample.key - baseKey) / 12));
				}
				if (sampleRate <= 0) {
					sampleRate = 32000;
				}

				const sampleNoStr = (sample.sampleNo).toString().padStart(4, '0');
				const waveFileName = (options.instname) ? 
					`${options.mode}_sample_${sampleNoStr}-${toFileNameChar(tones?.[0]?.name ?? 'NOTONE')}.wav` :
					`${options.mode}_sample_${sampleNoStr}.wav`;

				const blob = new Blob(decodePcmForUPcm(sample, pcmRomReader, sampleRate, loopSec), {type: 'audio/wav'});
				blob.arrayBuffer().then((arrayBuffer) => {
					fs.writeFileSync(path.join('samples', waveFileName), new Uint8Array(arrayBuffer));
				});
			}
		}
		break;

	default:
		console.error(`Invalid mode: ${options.mode}`);
		break;
	}

} catch (e) {
	console.error(e);
}

function toFileNameChar(toneWaveName) {
	return toneWaveName.trim().replace(/[\\/:*?"<>|\s]/ug, '_');
}
