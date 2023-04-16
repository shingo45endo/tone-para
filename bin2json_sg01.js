import {makeValue2ByteLE, removePrivateProp, addNamesFromRefs, splitArrayByN, isValidRange, verifyData} from './bin2json_common.js';

export function binToJsonForSG01(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// Tones, Waves, and Samples
	const json = makeAll(allBytes, memMap);

	// Tone Map
	console.assert(isValidRange(memMap.tableToneAddrs));
	json.toneMaps = makeToneMaps(allBytes.slice(...memMap.tableToneAddrs), json);

	// Drum Map
	console.assert(isValidRange(memMap.tableDrumAddrs));
	json.drumMaps = makeDrumMaps(allBytes.slice(...memMap.tableDrumAddrs), json);

	removePrivateProp(json);
	addNamesFromRefs(json);

	return json;
}

function makeAll(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const baseAddr = memMap.entries[0];

	const entries = {};
	let sampleNo = 0;
	const packets = splitArrayByN(allBytes.slice(...memMap.entries), 192);
	packets.forEach((bytes, i) => {
		const addr = (baseAddr - 0x040000 + 192 * i) / 16;
		console.assert(Number.isInteger(addr));

		const kind = bytes[0];
		verifyData(kind === 1 || kind === 2 || kind === 3);
		switch (kind) {
		case 1:	// Program
			entries[addr] = {
				bytes, kind, addr,
				keyGroupAddr: makeValue2ByteLE(bytes.slice(1, 3)),
				name: decodeAkaiStr(bytes.slice(3, 15)),
				numKeyGroups: bytes[42],
			};
			break;

		case 2:	// Key Group
			{
				const zonePackets = splitArrayByN(bytes.slice(34, 130), 24);
				entries[addr] = {
					bytes, kind, addr,
					nextAddr: makeValue2ByteLE(bytes.slice(1, 3)),
					zones: (new Array(4)).fill().map((_, i) => ({
						bytes: zonePackets[i],
						name: decodeAkaiStr(zonePackets[i].slice(0, 12)),
						addr: makeValue2ByteLE(zonePackets[i].slice(22, 24)),
					})),
				};
			}
			break;

		case 3:	// Sample
			entries[addr] = {
				bytes, kind, addr,
				sampleNo,
				name: decodeAkaiStr(bytes.slice(3, 15)),
				partnerAddr: makeValue2ByteLE(bytes.slice(136, 138)),
			};
			sampleNo++;
			break;

		default:
			console.assert(false);
			break;
		}
	});

	const tones = [];
	const waves = [];
	Object.values(entries).filter((entry) => entry.kind === 1).forEach((programEntry, no) => {
		const tone = {
			toneNo: no,
			name: programEntry.name,
			bytes: programEntry.bytes,
			waveRef: {
				$ref: `#/waves/${no}`,
			},
			_addr: programEntry.addr,
		};
		tones.push(tone);

		const sampleSlots = [];
		let addr = programEntry.keyGroupAddr;
		for (let i = 0; i < programEntry.numKeyGroups; i++) {
			const keyGroupEntry = entries[addr];
			verifyData(keyGroupEntry);

			const numSamples = keyGroupEntry.zones.filter((zone) => zone.addr !== 0xffff).length;
			verifyData(numSamples === 4 || keyGroupEntry.zones[numSamples].addr === 0xffff);

			const sampleSlot = {
				bytes: keyGroupEntry.bytes,
				low:  keyGroupEntry.bytes[3],
				high: keyGroupEntry.bytes[4],
				sampleSlots: (new Array(numSamples)).fill().map((_, i) => {
					const zone = keyGroupEntry.zones[i];
					const sample = entries[zone.addr];
					verifyData(sample);
					return {
						bytes: zone.bytes,
						sampleRef: {
							$ref: `#/samples/${sample.sampleNo}`,
							name: sample.name,
						},
					};
				}),
			};
			sampleSlots.push(sampleSlot);

			addr = keyGroupEntry.nextAddr;
		}

		const wave = {
			waveNo: no,
			name: `(${programEntry.name.trim()})`,
			sampleSlots,
		};
		waves.push(wave);
	});

	const samples = [];
	Object.values(entries).filter((entry) => entry.kind === 3).forEach((sampleEntry) => {
		const sample = {
			sampleNo: sampleEntry.sampleNo,
			name: sampleEntry.name,
			bytes: sampleEntry.bytes,
		};
		samples.push(sample);
	});

	return {samples, waves, tones};
}

function makeToneMaps(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.tones));

	const tableToneAddrs = splitArrayByN(bytes, 256).map((packet) => splitArrayByN(packet, 2).map(makeValue2ByteLE));

	const toneMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		for (let bankM = 0; bankM < tableToneAddrs.length; bankM++) {
			const addr = tableToneAddrs[bankM][prog];
			if (addr === 0xffff) {
				continue;
			}
			const toneRef = json.tones.find((tone) => tone._addr === addr);
			verifyData(toneRef);
			const toneProg = {
				prog, bankM,
				toneNo: toneRef.toneNo,
				toneRef: {
					$ref: `#/tones/${toneRef.toneNo}`,
				},
			};
			toneMaps.push(toneProg);
		}
	}

	return toneMaps;
}

function makeDrumMaps(bytes, json) {
	console.assert(bytes?.length && Array.isArray(json?.tones));

	const tableDrumAddrs = splitArrayByN(bytes, 2).map(makeValue2ByteLE);

	const drumMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		const addr = tableDrumAddrs[prog];
		if (addr === 0xffff) {
			continue;
		}
		const toneRef = json.tones.find((tone) => tone._addr === addr);
		verifyData(toneRef);
		const drumProg = {
			prog,
			toneNo: toneRef.toneNo,
			toneRef: {
				$ref: `#/tones/${toneRef.toneNo}`,
			},
		};
		drumMaps.push(drumProg);
	}

	return drumMaps;
}

function decodeAkaiStr(bytes) {
	verifyData(bytes.every((e) => (0x00 <= e && e <= 0x28)));
	return [...bytes].map((e) => '0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ#+-.'[e]).join('');
}
