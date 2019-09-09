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
