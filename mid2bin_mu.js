export function midToBinForMU(bytes) {
	const memMap = new Map();

	// Extracts SysExs from the SMF.
	const str = [...bytes].map((e) => String.fromCharCode(e)).join('');
	const sysExs = str.match(/\xf0[\x80-\xff]*[\x00-\x7f]+\xf7/ug).map((s) => [...s].map((ch) => ch.charCodeAt(0))).map((bytes) => {
		const index = bytes.slice(1, 5).findIndex((e) => (e & 0x80) === 0);
		bytes.splice(1, index + 1);
		console.assert(bytes.slice(1, -1).every((e) => (e & 0x80) === 0));
		return bytes;
	});

	// Decodes binary data.
	let baseIndex = -1;
	for (const bytes of sysExs) {
		if (bytes[0] !== 0xf0 || bytes[1] !== 0x43 || bytes[3] !== 0x59 || bytes[bytes.length - 1] !== 0xf7) {
			console.warn(`Unexpected SysEx: ${bytes}`);
			continue;
		}

		const commandId = bytes[2];
		if (commandId === 0x00) {	// Bulk Dump
			const address = bytes.slice(6, 9);
			const payload = bytes.slice(9, -2);
			if (baseIndex < 0) {
				console.log(`Ignored: ${bytes}`);
				continue;
			}
			const addr = address.reduce((p, c) => (p << 7) | (c & 0x7f), 0);
			memMap.set(baseIndex + addr, convert7to8bitsMU(payload));

		} else if (commandId === 0x10) {	// Parameter Change
			const address = bytes.slice(4, 7);
			switch (address[0]) {
			case 0x01:
				baseIndex = ((address[1] & 0x7f) << 21) | ((address[2] & 0x7f) << 14);
				break;
			case 0x03:
				baseIndex = -1;
				break;
			default:
				console.warn(`Unexpected SysEx: ${bytes}`);
				break;
			}
		}
	}

	// Merges all the decoded data into a binary file.
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
