import {splitArrayByN, addNamesFromRefs, isValidRange, verifyData, makeValue2ByteLE} from './bin2json_common.js';

export function binToJsonForBH1000(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const json = {
		waves: null,
		tones: null,
		drumSets: null,
		toneMaps: null,
		drumMaps: null,
	};

	// Waves
	json.waves = makeWaves(allBytes, memMap);

	// Tones
	console.assert(isValidRange(memMap.tones));
	json.tones = makeTones(allBytes.slice(...memMap.tones));

	// Drum Sets
	json.drumSets = makeDrumSets(allBytes, memMap);

	// Tone Map
	json.toneMaps = makeToneMaps(allBytes, memMap);

	// Drum Map
	json.drumMaps = makeDrumMaps(allBytes, memMap);

	addNamesFromRefs(json);

	return json;
}

function makeWaves(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// Each entry is an offset from the beginning of the table.
	console.assert(isValidRange(memMap.tableWaves));
	const [base] = memMap.tableWaves;
	const waveOffsets = splitArrayByN(allBytes.slice(...memMap.tableWaves), 2).map(makeValue2ByteLE);

	return waveOffsets.map((offset, waveNo) => {
		if (offset === 0xffff) {
			return {waveNo, sampleSlots: []};
		}

		// The 256 KB version has some headers beyond the end of the ROM. They wrap around to the beginning.
		const sliceWrapped = (begin, end) => [...Array(end - begin).keys()].map((i) => allBytes[(begin + i) % allBytes.length]);

		const addr = base + offset;
		const headerBytes = sliceWrapped(addr, addr + 16);
		const numSlots = headerBytes[10];
		verifyData(1 <= numSlots && numSlots <= 32);

		const sampleSlots = splitArrayByN(sliceWrapped(addr + 16, addr + 16 * (numSlots + 1)), 16).map((slotBytes) => {
			// The upper key in ROM is exclusive.
			const slot = {
				low:  slotBytes[0],
				high: slotBytes[1] - 1,
				bytes: [...slotBytes],
				bank: slotBytes[14] >> 6,
				addrBegin: makeValue2ByteLE(slotBytes.slice(6, 8)) * 64,
				addrEnd: ((slotBytes[10] & 0x3f) << 16) | makeValue2ByteLE(slotBytes.slice(8, 10)),
				loopLen: makeValue2ByteLE(slotBytes.slice(12, 14)),
			};
			verifyData(slot.low <= slot.high);
			verifyData(slot.addrBegin <= slot.addrEnd);
			return slot;
		});

		const wave = {
			waveNo,
			name: String.fromCharCode(...headerBytes.slice(2, 10)),
			bytes: [...headerBytes],
			sampleSlots,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(wave.name));
		return wave;
	});
}

function makeTones(bytes) {
	console.assert(bytes?.length);

	const tones = [];
	const tonePackets = splitArrayByN(bytes, 72);
	tonePackets.forEach((toneBytes, toneNo) => {
		const name = String.fromCharCode(...toneBytes.slice(0, 8));
		const voicePackets = splitArrayByN(toneBytes.slice(8, 72), 32);

		const voices = [];
		voicePackets.forEach((voiceBytes) => {
			if ((voiceBytes[1] & 0x80) === 0) {
				return;
			}
			const waveNo = makeValue2ByteLE(voiceBytes.slice(0, 2)) & 0x7fff;

			const voice = {
				bytes: [...voiceBytes],
				waveNo,
				waveRef: {
					$ref: `#/waves/${waveNo}`,
				},
			};
			voices.push(voice);
		});

		const tone = {
			toneNo,
			name,
			voices,
		};
		verifyData(/^[\x20-\x7f]*$/u.test(tone.name));
		tones.push(tone);
	});

	return tones;
}

function makeDrumSets(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	const drumSetNames = [];
	for (const drumProg of makeDrumProgs(allBytes, memMap)) {
		if (!drumSetNames[drumProg.drumSetNo]) {
			drumSetNames[drumProg.drumSetNo] = drumProg.name;
		}
	}

	const drumSets = [];
	console.assert(isValidRange(memMap.drumSets));
	const drumSetPackets = splitArrayByN(allBytes.slice(...memMap.drumSets), 164);
	drumSetPackets.forEach((drumSetBytes, drumSetNo) => {
		const notes = {};
		splitArrayByN(drumSetBytes, 2).map(makeValue2ByteLE).forEach((e, i) => {
			const noteNo = 27 + i;
			const toneNo = e & 0x0fff;
			const note = {
				group: (e >> 12) & 0x07,
				is: (e & 0x8000) !== 0,
				toneNo,
				toneRef: {
					$ref: `#/tones/${toneNo}`,
				},
			};
			notes[noteNo] = note;
		});

		const drumSet = {
			drumSetNo,
			name: drumSetNames[drumSetNo],
			notes,
		};
		drumSets.push(drumSet);
	});

	return drumSets;
}

function makeToneMaps(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	console.assert(isValidRange(memMap.tableBankAddrs));
	const offset = memMap.tableBankAddrs[0];
	const tableBankAddrs = splitArrayByN(allBytes.slice(...memMap.tableBankAddrs), 2).map((e) => offset + makeValue2ByteLE(e));

	const toneMaps = [];
	for (let prog = 0; prog < 128; prog++) {
		const addr = tableBankAddrs[prog];
		const numTones = makeValue2ByteLE(allBytes.slice(addr, addr + 2));
		verifyData(1 <= numTones && numTones <= 128);

		const packetBytes = allBytes.slice(addr + 2, addr + 2 + 4 * numTones);
		const table = Object.fromEntries(splitArrayByN(packetBytes, 4).map((bytes) => [makeValue2ByteLE(bytes.slice(0, 2)), makeValue2ByteLE(bytes.slice(2, 4))]));

		for (let bankM = 0; bankM < 128; bankM++) {
			const toneNo = table[bankM] ?? -1;
			if (toneNo < 0) {
				continue;
			}

			const toneProg = {
				prog, bankM,
				toneNo,
				toneRef: {
					$ref: `#/tones/${toneNo}`,
				},
			};
			toneMaps.push(toneProg);
		}
	}

	return toneMaps;
}

function makeDrumMaps(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	return makeDrumProgs(allBytes, memMap).map(({prog, drumSetNo, name}) => ({
		prog,
		drumSetNo,
		drumSetRef: {
			$ref: `#/drumSets/${drumSetNo}`,
		},
		name,
	}));
}

function makeDrumProgs(allBytes, memMap) {
	console.assert(allBytes?.length && memMap);

	// The kit list and the kit names are in the same order.
	console.assert(isValidRange(memMap.tableDrumProgs) && isValidRange(memMap.drumSetNames));
	const drumProgs = [...allBytes.slice(...memMap.tableDrumProgs)];
	const drumSetNames = splitArrayByN(allBytes.slice(...memMap.drumSetNames), 8).map((bytes) => String.fromCharCode(...bytes));
	verifyData(drumProgs.length === drumSetNames.length);
	verifyData(drumSetNames.every((e) => /^[\x20-\x7f]*$/u.test(e)));

	console.assert(isValidRange(memMap.tableDrums) && isValidRange(memMap.drumSets));
	const tableDrums = allBytes.slice(...memMap.tableDrums);
	const numDrumSets = (memMap.drumSets[1] - memMap.drumSets[0]) / 164;
	const unusedDrumSetNos = [...Array(numDrumSets).keys()].filter((drumSetNo) => !tableDrums.includes(drumSetNo));
	verifyData(unusedDrumSetNos.length === 1);

	return drumProgs.map((prog, index) => ({
		prog,
		// The firmware handles program 127 (CM set) separately. It uses the only set that the table does not refer to.
		drumSetNo: (prog === 127) ? unusedDrumSetNos[0] : tableDrums[prog],
		name: drumSetNames[index],
	}));
}
