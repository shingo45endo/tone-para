import {parseSmfToSeq} from './smf-parser/smf_parser.js';
import {analyzeMidiMessage} from './smf-parser/midi_event.js';
import {makeValueFrom7bits, convert7to8bits} from './smf-parser/sysex_instance.js';

export function midToBinForSC(files) {
	const memMap = new Map();
	for (const file of files) {
		const seq = parseSmfToSeq(file);
		console.assert(seq.tracks.length === 1);
		for (const events of seq.tracks[0].values()) {
			for (const bytes of events) {
				if (bytes[0] !== 0xf0) {
					continue;
				}

				const mes = analyzeMidiMessage(bytes);
				if (!mes || !mes.payload || !mes.payload.length || !mes.address || mes.address.length !== 4) {
					console.warn(`Unexpected SysEx: ${mes.hexStr}`);
					continue;
				}

				const index = makeValueFrom7bits(mes.address[3], mes.address[2], mes.address[1], mes.address[0]);
				memMap.set(index, convert7to8bits(mes.payload));
			}
		}
	}

	const min = Math.min(...memMap.keys());
	const max = Math.max(...memMap.keys());
	const len = max + memMap.get(max).length - min;
	const bin = new Uint8Array(len).fill(0xdb);
	for (const [index, bytes] of memMap.entries()) {
		for (let i = 0; i < bytes.length; i++) {
			bin[index + i - min] = bytes[i];
		}
	}

	return bin;
}
