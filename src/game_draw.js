const HAND_TILE_W = 1;

const calcHandRect = (canvas, tiles, isDrag) => {
	const start_x = (16 - HAND_TILE_W * tiles.hand.length - .8 * tiles.kans.length * 4) / 2;
	const rect = [];
	if (isDrag) {
		for (let i = 0; i < tiles.hand.length + 1; i++) {
			rect.push([start_x + HAND_TILE_W * (i - .5), 7, HAND_TILE_W - canvas.pixel, HAND_TILE_W * 4 / 3]);
		}
	}
	else {
		for (let i = 0; i < tiles.hand.length; i++) {
			rect.push([start_x + HAND_TILE_W * i, 7, HAND_TILE_W - canvas.pixel, HAND_TILE_W * 4 / 3]);
		}
	}
	return rect;
};

const calcDoraRect = (canvas, isUradora) => {
	const TILE_W = .6;
	const rect = [];
	for (let i = 0; i < 5; i++) {
		rect.push([1 + TILE_W * i, 1 + (isUradora? TILE_W * .3 : 0), TILE_W - canvas.pixel, TILE_W * 4 / 3]);
	}
	return rect;
};

const calcTrashRect = (canvas, tiles) => {
	const TILE_W = .8;
	const start_x = (16 - TILE_W * 6) / 2;
	const rect = [];
	let isReached;
	for (let i = 0; i < 18; i++) {
		if (i % 6 === 0) {
			isReached = false;
		}
		if (tiles.reached && i === tiles.reachCount) {
			isReached = true;
			rect.push([start_x + TILE_W * (i % 6), 1 + (TILE_W * 4 / 3 + canvas.pixel) * Math.floor(i / 6) + TILE_W / 6, TILE_W * 4 / 3 - canvas.pixel, TILE_W]);
		}
		else {
			rect.push([start_x + TILE_W * (i % 6) + (isReached? TILE_W / 3 : 0), 1 + (TILE_W * 4 / 3 + canvas.pixel)* Math.floor(i / 6), TILE_W - canvas.pixel, TILE_W * 4 / 3]);
		}
	}
	return rect;
};

const calcKansRect = (canvas) => {
	const TILE_W = .8;
	const rects = [];
	for (let i = 0; i < 4; i++) {
		rects[i] = [];
		const start_x = 16 - TILE_W * 4 * (i + 1) - .1 * i;
		for (let j = 0; j < 4; j++) {
			rects[i].push([start_x + TILE_W * j, 9 - TILE_W * 4 / 3, TILE_W - canvas.pixel, TILE_W * 4 / 3]);
		}
	}
	return rects;
};

const updateKanDialogRect = (canvas, tiles, dialogs) => {
	for (let dialog of dialogs) {
		delete dialog.path;
	}
	const handRect = calcHandRect(canvas, tiles);
	let count = 0;
	for (let city of tiles.group) {
		if (city.length === 4) {
			const rect = [handRect[city.position][0], 6.2, HAND_TILE_W * 4, .5];
			dialogs[count].rect = rect;
			dialogs[count].path = canvas.makePath({rect});
			count++;
		}
	}
};

const drawTile = (canvas, ctx, rect, tile, perspective) => {
	if (!tile) { return; }
	const TILE_BACK = "#00f";
	const [x, y, w, h] = rect;
	const size = Math.min(w, h);
	if (perspective === "up") {
		ctx.fill(canvas.makePath({rect: [x, y - size * .3, w, h], radius: w * .05}), TILE_BACK);
		ctx.fill(canvas.makePath({rect: [x, y - size * .2, w, h]}), "#fff");
		ctx.stroke(canvas.makePath({rect: [x, y - size * .3, w, h], radius: w * .05}), "#000");
	}
	if (perspective === "down") {
		ctx.fill(canvas.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), TILE_BACK);
		ctx.fill(canvas.makePath({rect: [x, y + size * .2, w, h]}), "#eee");
		ctx.stroke(canvas.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), "#000");
	}
	if (perspective === "ura") {
		ctx.fill(canvas.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), "#eee");
		ctx.fill(canvas.makePath({rect: [x, y + size * .1, w, h]}), "#00f");
		ctx.stroke(canvas.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), "#000");
	}
	ctx.fill(canvas.makePath({ rect, radius: rect[2] * .05 }), 
		perspective === "up" ? "#eee" :
		perspective === "ura" ? TILE_BACK : 
		"#fff"
	);
	ctx.stroke(canvas.makePath({ rect, radius: rect[2] * .05 }), "#000");
	if (perspective !== "ura") {
		if (w < h) {
			ctx.drawText(tile.count, x + size / 2, y + size * .2, {size: size * .3, color: "#88f", font: "serif", align: "center", valign: "middle"});
			ctx.drawText(tile.character, x + size / 2, y + size * .8, {size: size * .8, font: "serif", align: "center", valign: "middle", ...(tile.red && { color: "#f00"})})
		}
		else {
			ctx.drawText(tile.count, x + + size * .2, y + size / 2, {size: size * .3, color: "#88f", font: "serif", align: "center", valign: "middle", rotate: -Math.PI / 2});
			ctx.drawText(tile.character, x + size * .8, y + size / 2, {size: size * .8, font: "serif", align: "center", valign: "middle", rotate: -Math.PI / 2, ...(tile.red && { color: "#f00"})})
		}
	}
};

const drawDora = (canvas, ctx, char) => {
	const DORA_X = 1.1;
	const DORA_Y = 2.4;
	const DORA_TILE_W = .4;
	if (char) {
		ctx.fill(canvas.makePath({rect: [DORA_X - .1, DORA_Y - .1, DORA_TILE_W * char.length + .2, DORA_TILE_W * 4 / 3 + .45]}), "#33f");
		ctx.drawText("ドラ", DORA_X, DORA_Y, {size: .2})
		for (let i = 0; i < char.length; i++) {
			const tile = { ...TILES.filter(x => x.character === char[i])[0], red: false };
			const rect = [DORA_X + DORA_TILE_W * i, DORA_Y + .25, DORA_TILE_W, DORA_TILE_W * 4 / 3];
			drawTile(canvas, ctx, rect, tile);
		}
	}
	else {
		ctx.fill(canvas.makePath({rect: [DORA_X - .1, DORA_Y - .1, 1, .85]}), "#33f");
		ctx.drawText("ドラ", DORA_X, DORA_Y, {size: .2})
		ctx.drawText("なし", DORA_X, DORA_Y + .25, {size: .4});
	}
};

const drawDraggingTile = (canvas, ctx, rect, tile, mousex) => {
	const [, y, w, h] = rect;
	drawTile(canvas, ctx, [mousex - w / 2, y - h, w, h], tile);

};

const drawDraggingArrow = (canvas, ctx, rect) => {
	const x = rect[0] + rect[2] / 2;
	const y = rect[1];
	ctx.fill(
		canvas.makePath({points:[ [x, y - .3], [x - .2, y - .6], [x + .2, y - .6]]}),
		"#cc0"
	);
};

const drawCityGroup = (canvas, ctx, tiles) => {
	const handRect = calcHandRect(canvas, tiles);
	const count = Array(tiles.hand.length).fill(0);
	let lastPos;
	let lastCities;
	for (let city of tiles.group) {
		if (lastPos !== city.position) {
			lastPos = city.position;
			lastCities = [];
		}
		if (lastCities.includes(city.name)) { continue; }
		else { lastCities.push(city.name); }
		const pos = Math.max(...count.slice(city.position, city.position + city.length));
		ctx.fill(canvas.makePath({rect: [
			handRect[city.position][0] + .1,
			handRect[city.position][1] + handRect[city.position][3] + .1 + pos * .1,
			handRect[city.position][2] * city.length - .2,
			.05
		], radius: .025}), "#f00");
		for (let i = 0; i < city.length; i++) {
			count[city.position + i]++;
		}
	}
};

const drawKanButton = (canvas, ctx, drawObject, isHover) => {
	const [x, y, w, h] = drawObject.rect;
	ctx.fill(canvas.makePath({ rect: [x, y + .15, w, h - .3], radius: .1}), isHover? "#999" : "#ccc");
	ctx.drawText("カン", x + w / 2, y + .05, {size: .4, align: "center"});
};

const drawReachButton = (canvas, ctx, isToReach) => {
	const [x, y, w, h] = [12.5, 5.2, 2.5, .8];
	ctx.fill(canvas.makePath({rect: [x, y, w, h], radius: .4}), "#ccc")
	ctx.drawText("リーチ", 14, 5.6, {size: .5, align: "center", valign: "middle"});
	ctx.stroke(canvas.makePath({rect: [x + .3, y + .2, h - .4, h - .4]}), "#000", {width: canvas.pixel * 2});
	if (isToReach()) {
		ctx.stroke(canvas.makePath({points: [
			[x + .4, y + .3],
			[x + .5, y + .55],
			[x + .7, y + .2],
			[x + .5, y + .55],
			[x + .4, y + .3],
		]}), "#f00", {width: canvas.pixel * 4});
	}
};
