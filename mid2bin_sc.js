import {convert7to8bits} from './bin2json_common.js';

export function midToBinForSC(files) {
	const memMap = new Map();
	for (const file of files) {
		// Extracts SysExs from the SMF.
		const str = [...file].map((e) => String.fromCharCode(e)).join('');
		const sysExs = str.match(/\xf0[\x80-\xff]*[\x00-\x7f]+\xf7/ug).map((s) => [...s].map((ch) => ch.charCodeAt(0))).map((bytes) => {
			const index = bytes.slice(1, 5).findIndex((e) => (e & 0x80) === 0);
			bytes.splice(1, index + 1);
			console.assert(bytes.slice(1, -1).every((e) => (e & 0x80) === 0));
			return bytes;
		});

		// Decodes binary data.
		for (const bytes of sysExs) {
			if (bytes[0] !== 0xf0 || bytes[1] !== 0x41 || bytes[bytes.length - 1] !== 0xf7) {
				console.warn(`Unexpected SysEx: ${bytes}`);
				continue;
			}

			let index = 3;
			while (bytes[index] === 0x00) {
				index++;
			}
			index++;
			while (bytes[index] === 0x00) {
				index++;
			}
			index++;

			const address = bytes.slice(index, index + 4);
			const payload = bytes.slice(index + 4, -2);

			const addr = address.reduce((p, c) => (p << 7) | (c & 0x7f), 0);
			memMap.set(addr, convert7to8bits(payload));
		}
	}

	// Merges all the decoded data into a binary file.
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
