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
