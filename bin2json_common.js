export function splitArrayByN(bytes, n) {
	return bytes.reduce((p, _, i, a) => {
		if (i % n === 0) {
			p.push(a.slice(i, i + n));
			console.assert(p[p.length - 1].length === n);
		}
		return p;
	}, []);
}

export function convert7to8bits(bytes) {
	console.assert(bytes && bytes.length > 0, 'Invalid argument', {bytes});

	const packets = [...bytes].reduce((p, _, i, a) => {
		if (i % 8 === 0) {
			p.push(a.slice(i, i + 8));
		}
		return p;
	}, []);
	const data = packets.reduce((p, c) => {
		const msbs = c.shift();
		const bytes = c.map((e, i) => e | (((msbs & (1 << i)) !== 0) ? 0x80 : 0x00));
		p.push(...bytes);
		return p;
	}, []);

	return data;
}

export function removePrivateProp(json) {
	console.assert(Array.isArray(json) || typeof json === 'object');
	if (Array.isArray(json)) {
		for (const elem of json) {
			if (Array.isArray(elem) || typeof elem === 'object') {
				removePrivateProp(elem);
			}
		}
	} else {
		for (const [key, value] of Object.entries(json)) {
			if (key.startsWith('_')) {
				delete json[key];
			} else {
				if (Array.isArray(value) || typeof value === 'object') {
					removePrivateProp(value);
				}
			}
		}
	}
}

export function isValidRange(ranges) {
	if (!Array.isArray(ranges) || ranges.length !== 2 || !ranges.every((e) => Number.isInteger(e))) {
		return false;
	}
	const [begin, end] = ranges;
	if (begin > end) {
		return false;
	}

	return true;
}

export function verifyData(condition) {
	console.assert(condition);
}

export const [
	makeValue2ByteLE,
	makeValue3ByteLE,
	makeValue4ByteLE,
	makeValue2ByteBE,
	makeValue3ByteBE,
	makeValue4ByteBE,
] = [
	{len: 2, func: makeValueFromArrayLE},
	{len: 3, func: makeValueFromArrayLE},
	{len: 4, func: makeValueFromArrayLE},
	{len: 2, func: makeValueFromArrayBE},
	{len: 3, func: makeValueFromArrayBE},
	{len: 4, func: makeValueFromArrayBE},
].map(({len, func}) => {
	return (bytes) => {
		console.assert(bytes?.length === len);
		return func(bytes);
	};
});

function makeValueFromArrayLE(bytes) {
	console.assert(bytes?.length);
	return bytes.reduce((p, c, i) => p | (c << (i * 8)), 0);
}
function makeValueFromArrayBE(bytes) {
	console.assert(bytes?.length);
	return bytes.reduce((p, c, i) => p | (c << ((bytes.length - i - 1) * 8)), 0);
}
