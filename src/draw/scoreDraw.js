const drawScoreHands = (cities) => {
	const HAND_W = 80;
	const GAP = 10;
	const tile_length = cities.reduce((a, b) => a + b.tiles.length, 0);
	const start_x = (1600 - HAND_W * tile_length - GAP * (cities.length - 1)) / 2;
	
	let nth_tile = 0;
	for (let i = 0; i < cities.length; i++) {
		for (let j = 0; j < cities[i].tiles.length; j++) {
			drawTile([
				start_x + HAND_W * nth_tile + GAP * i,
				50,
				HAND_W,
			], cities[i].tiles[j]);
			nth_tile++;
		}
	}
};

const drawScoreCityNames = (cities) => {
	const NAME_X = 100;
	const NAME_Y = 200;
	const NAME_SIZE = 40;
	for (let i = 0; i < cities.length; i++) {
		$.ctx.bbText(`${cities[i].pref}${cities[i].name}${cities[i].category}`, NAME_X, NAME_Y + i * (NAME_SIZE * 1.5), {size: NAME_SIZE});
	}
};

const drawScoreYaku = (yaku, count) => {
	const YAKU_X = 500;
	const YAKU_Y = 200;
	const YAKU_SIZE = 40;
	for (let i = 0; i < count; i++) {
		$.ctx.bbText(yaku[i].point, YAKU_X, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
		$.ctx.bbText(`${yaku[i].name}`, YAKU_X + 150, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
	}
};

const drawScoreDora = (dora, uradora, doraCount, isReached) => {
	for (let i = 0; i < 5; i++) {
		if (!isReached) {
			drawTile([1200 + 60 * i, 220, 59], uradora[i].tile, {perspective: "ura"});
		} else {
			drawTile([1200 + 60 * i, 300, 59], uradora[i].tile, {perspective: i < doraCount? "down" : "ura"});
		}
		drawTile([1200 + 60 * i, 200, 59], dora[i].tile, {perspective: i < doraCount? "down" : "ura"});
	}
};

