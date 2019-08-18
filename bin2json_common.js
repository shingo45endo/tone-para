export function splitArrayByN(bytes, n) {
	return bytes.reduce((p, _, i, a) => {
		if (i % n === 0) {
			p.push(a.slice(i, i + n));
			console.assert(p[p.length - 1].length === n);
		}
		return p;
	}, []);
}
