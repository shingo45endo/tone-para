import {parseSmfToSeq} from './smf-parser/smf_parser.js';
import {analyzeMidiMessage} from './smf-parser/midi_event.js';
import {makeValueFrom7bits} from './smf-parser/sysex_instance.js';

export function midToBinForMU(bytes) {
	const memMap = new Map();
	const seq = parseSmfToSeq(bytes);
	let baseIndex = -1;
	console.assert(seq.tracks.length === 1);
	for (const events of seq.tracks[0].values()) {
		for (const bytes of events) {
			if (bytes[0] !== 0xf0) {
				continue;
			}

			const mes = analyzeMidiMessage(bytes);
			if (!mes || !/^f0 43 .0 59/u.test(mes.hexStr) || !mes.address || mes.address.length !== 3) {
				console.warn(`Unexpected SysEx: ${mes.hexStr}`);
				continue;
			}

			if (bytes[2] === 0x00) {
				if (baseIndex < 0) {
					console.log(`Ignored: ${mes.hexStr}`);
					continue;
				}
				const addr = makeValueFrom7bits(mes.address[2], mes.address[1], mes.address[0]);
				memMap.set(baseIndex + addr, convert7to8bitsMU(mes.payload));

			} else if (bytes[2] === 0x10) {
				switch (bytes[4]) {
				case 0x01:
					baseIndex = makeValueFrom7bits(mes.address[2], mes.address[1]) << 14;
					break;
				case 0x03:
					baseIndex = -1;
					break;
				default:
					console.warn(`Unexpected SysEx: ${mes.hexStr}`);
					break;
				}
			}
		}
	}

//	const min = Math.min(...memMap.keys());
	const min = 0;
	const max = Math.max(...memMap.keys());
	const len = max + memMap.get(max).length - min;
	const bin = new Uint8Array(len).fill(0xdb);
	for (const [index, bytes] of memMap.entries()) {
		for (let i = 0; i < bytes.length; i++) {
			const dst = index + i - min;
			console.assert(bin[dst] === 0xdb || bin[dst] === bytes[i]/* || (bin[dst] & 0x7f) === (bytes[i] & 0x7f)*/, `${dst.toString(16).padStart(6, '0')}: d: ${bin[dst]}, s: ${bytes[i]}`);
			bin[dst] = bytes[i];
		}
	}

	return bin;
}

function convert7to8bitsMU(bytes) {
	console.assert(bytes && bytes.length > 0, 'Invalid argument', {bytes});

	const packets = [...bytes].reduce((p, _, i, a) => {
		if (i % 8 === 0) {
			p.push(a.slice(i, i + 8));
		}
		return p;
	}, []);
	const data = packets.reduce((p, c) => {
		const msbs = c.pop();
		const bytes = c.map((e, i) => e | (((msbs & (1 << (6 - i))) !== 0) ? 0x80 : 0x00));
		p.push(...bytes);
		return p;
	}, []);

	return data;
}
