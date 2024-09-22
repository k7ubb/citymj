const calcHandPosition = (hand, kans, isDrag) => {
	const x = (1600 - 100 * hand.length - 80 * kans.length * 4) / 2;
	return isDrag
		?	[...hand, null].map((_, i) => x - 50 + 100 * i)
		: hand.map((_, i) => x + 100 * i);
};

const drawDora = (dora, uradora, doraCount) => {
	for (let i = 0; i < 5; i++) {
		drawTile([80 + 60 * i, 70, 59], uradora[i].tile, {perspective: "ura"});
		drawTile([80 + 60 * i, 50, 59], dora[i].tile, {perspective: i < doraCount? "down" : "ura"});
	}
	
	dora = dora.filter((d, i) => i < doraCount && d.char);
	if (dora.length) {
		const maxWidth = dora.reduce((a, b) => Math.max(a, b.char.length), 0);
		$.ctx.bbStroke({rect: [80, 182, 24 + 60 * maxWidth, 60 + 84 * dora.length]}, {color: COLOR_STRONG, width: 2});
		$.ctx.bbText("ドラ", 90, 192, {size: 30, color: COLOR_STRONG, style: "bold"})
		for (let i = 0; i < dora.length; i++) {
			for (let j = 0; j < dora[i].char.length; j++) {
				const tile = { ...TILES.filter(tile => tile.character === dora[i].char[j])[0], red: false };
				drawTile([60 * j + 90, 84 * i + 232, 59], tile);
			}
		}
	} else {
		$.ctx.bbStroke({rect: [80, 182, 144, 120]}, {color: COLOR_STRONG, width: 2});
		$.ctx.bbText("ドラ", 90, 192, {size: 30, color: COLOR_STRONG, style: "bold"})
		$.ctx.bbText("なし", 90, 232, {size: 60, color: COLOR_STRONG});
	}
};

const drawTrash = (trash, reachCount) => {
	const TRASH_LEN = 9;
	let isReachedLine = false;
	
	for (let i = 0; i < trash.length; i++) {
		if (i % TRASH_LEN === 0) { isReachedLine = false; }
		const x = (1600 - TRASH_LEN * 80) / 2 + 80 * (i % TRASH_LEN) + (isReachedLine? 80 / 3 : 0);
		const y = 50 + 110 * Math.floor(i / TRASH_LEN);
		if (i === reachCount) {
			drawTile([x, y + 15, 79.25], trash[i], {perspective: "down", rotate: true});
			isReachedLine = true;
		}
		else {
			drawTile([x, y, 79], trash[i], {perspective: "down"});
		}
	}
};

const drawKan = (kans) => {
	for (let i = 0; i < kans.length; i++) {
		const x = 1600 - 324 * (i + 1) - 8 * i;
		for (let j = 0; j < 4; j++) {
			drawTile([x + 81 * j, 792, 81], kans[i][j]); 
		}
	}
};

const drawHandGuide = (group, handPosition) => {
	const count = Array(handPosition.length).fill().map(() => []);
	let lastPos;
	let lastCities;
	for (let city of group) {
		if (lastPos !== city.position) {
			lastPos = city.position;
			lastCities = [];
		}
		if (lastCities.includes(city.name)) { continue; }
		else { lastCities.push(city.name); }
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
		$.ctx.bbFill({
			rect: [
				handPosition[city.position] + 10,
				840 + line * 10,
				100 * city.length - 20,
				5
			],
			radius: 2.5
		}, "#f00");
	}
};

const drawCityTable = (hand, character) => {
	const RECT_Y = 25;
	const TEXT_SIZE = 39;
	const TEXT_LINES = 11;
	const ROW_WIDTH = 5.5;
	const start_x = (1600 - TEXT_SIZE * ROW_WIDTH * Math.ceil(61 / TEXT_LINES)) / 2;
  const cities = CITIES.filter(city => city.name.includes(character));
	$.ctx.bbFill({rect: [start_x - 15, RECT_Y - 15, 1600 - start_x * 2 + 30, TEXT_SIZE * 1.5 * TEXT_LINES + 10]}, COLOR_STRONG);
	$.ctx.bbFill({rect: [start_x - 10, RECT_Y - 10, 1600 - start_x * 2 + 20, TEXT_SIZE * 1.5 * TEXT_LINES]}, "#fff");
	for (let i = 0; i < cities.length; i++) {
		const isInHand = cities[i].name.split("").map(char => hand.map(tile => tile.character).includes(char)).reduce((a, b) => a && b, true);
		$.ctx.bbText(cities[i].name + cities[i].category, start_x + Math.floor(i / TEXT_LINES) * TEXT_SIZE * ROW_WIDTH, RECT_Y + TEXT_SIZE * 1.5 * (i % TEXT_LINES), {size: TEXT_SIZE, style: isInHand? "bold" : ""});
	}
};
