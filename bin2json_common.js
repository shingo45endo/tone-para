export function splitArrayByN(bytes, n) {
	return bytes.reduce((p, _, i, a) => {
		if (i % n === 0) {
			p.push(a.slice(i, i + n));
			console.assert(p[p.length - 1].length === n);
		}
		return p;
	}, []);
}

export function makeAddress4byteBE(bytes) {
	console.assert(bytes && bytes.length === 4);
	return bytes.reduce((p, c, i) => p | (c << ((3 - i) * 8)), 0);
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

export function isValidRegion(regions) {
	if (!Array.isArray(regions) || regions.length !== 2 || !regions.every((e) => Number.isInteger(e))) {
		return false;
	}
	const [begin, end] = regions;
	if (begin > end) {
		return false;
	}

	return true;
}

export function verifyData(condition) {
	console.assert(condition);
}
