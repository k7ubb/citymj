"use strict";

const HAND_W = 1;
const HAND_Y = 7;

const DORA_W = .6;
const DORA_X = .8;
const DORA_Y = .5;

const SELECT_BUTTON_RECT = [12.5, 4.2, 2.5, .8];
const REACH_BUTTON_RECT = [12.5, 5.2, 2.5, .8];

// isDrag: true -> 理牌判定用の領域を計算
const calcHandRect = (tiles, isDrag) => {
	const start_x = (16 - HAND_W * tiles.hand.length - .8 * tiles.kans.length * 4) / 2;
	const rect = [];
	if (isDrag) {
		for (let i = 0; i < tiles.hand.length + 1; i++) {
			rect.push([start_x + HAND_W * (i - .5), HAND_Y, HAND_W - lineWidth, HAND_W * 4 / 3]);
		}
	}
	else {
		for (let i = 0; i < tiles.hand.length; i++) {
			rect.push([start_x + HAND_W * i, HAND_Y, HAND_W - lineWidth, HAND_W * 4 / 3]);
		}
	}
	return rect;
};

const calcDoraRect = (isUradora) => {
	const rect = [];
	for (let i = 0; i < 5; i++) {
		rect.push([DORA_X + DORA_W * i, DORA_Y + (isUradora? DORA_W * .3 : 0), DORA_W - lineWidth, DORA_W * 4 / 3]);
	}
	return rect;
};

const calcTrashRect = (tiles) => {
	const TRASH_LEN = 9;
	const TRASH_W = .8;
	const TRASH_Y = .5;
	const start_x = (16 - TRASH_LEN * TRASH_W) / 2;
	const rect = [];
	let isReached;
	for (let i = 0; i < tiles.trash.length; i++) {
		if (i % TRASH_LEN === 0) {
			isReached = false;
		}
		if (tiles.reached && i === tiles.reachCount) {
			isReached = true;
			rect.push([start_x + TRASH_W * (i % TRASH_LEN), TRASH_Y + (TRASH_W * 4 / 3 + lineWidth) * Math.floor(i / TRASH_LEN) + TRASH_W / 6, TRASH_W * 4 / 3 - lineWidth, TRASH_W]);
		}
		else {
			rect.push([start_x + TRASH_W * (i % TRASH_LEN) + (isReached? TRASH_W / 3 : 0), TRASH_Y + (TRASH_W * 4 / 3 + lineWidth)* Math.floor(i / TRASH_LEN), TRASH_W - lineWidth, TRASH_W * 4 / 3]);
		}
	}
	return rect;
};

const calcKansRect = () => {
	const KAN_W = .8;
	const rects = [];
	for (let i = 0; i < 4; i++) {
		rects[i] = [];
		const start_x = 16 - KAN_W * 4 * (i + 1) - KAN_W / 10 * i;
		for (let j = 0; j < 4; j++) {
			rects[i].push([start_x + KAN_W * j, 9 - KAN_W * 4 / 3, KAN_W - lineWidth, KAN_W * 4 / 3]);
		}
	}
	return rects;
};

const drawDora = (tiles) => {
	const doras = [];
	for (let i = 0; i < tiles.kans.length + 1; i++) {
		if (tiles.dora[i].char) { doras.push(tiles.dora[i].char); }
	}
	const max_width = doras.reduce((a, b) => Math.max(a, b.length), 0);
	if (doras.length) {
		$.ctx.bbStroke($.makePath({rect: [DORA_X, DORA_Y + DORA_W * 2.2, DORA_W * (max_width + .4), DORA_W * (4 / 3 * doras.length + 1)]}), COLOR_STRONG, lineWidth * 2);
		$.ctx.bbText("ドラ", DORA_X + DORA_W / 6, DORA_Y + DORA_W * (2.2 + 1/6), {size: DORA_W / 2, color: COLOR_STRONG, style: "bold"})
		for (let i = 0; i < doras.length; i++) {
			for (let j = 0; j < doras[i].length; j++) {
				const tile = { ...TILES.filter(x => x.character === doras[i][j])[0], red: false };
				const rect = [DORA_X + DORA_W / 6 + DORA_W * j, DORA_Y + DORA_W * (2.2 + 5/6) + DORA_W * 4 / 3 * i, DORA_W, DORA_W * 4 / 3];
				drawTile(rect, tile);
			}
		}
	}
	else {
		$.ctx.bbStroke($.makePath({rect: [DORA_X, DORA_Y + DORA_W * 2.2, DORA_W * 2.4, DORA_W * 2]}), COLOR_STRONG, lineWidth * 2);
		$.ctx.bbText("ドラ", DORA_X + DORA_W / 6, DORA_Y + DORA_W * (2.2 + 1/6), {size: DORA_W / 2, color: COLOR_STRONG, style: "bold"})
		$.ctx.bbText("なし", DORA_X + DORA_W / 6, DORA_Y + DORA_W * (2.2 + 5/6), {size: DORA_W, color: COLOR_STRONG});
	}
};

const updateKanDialogRect = (tiles, dialogs) => {
	for (let dialog of dialogs) {
		delete dialog.path;
	}
	const handRect = calcHandRect(tiles);
	let count = 0;
	for (let city of tiles.group) {
		if (city.length === 4) {
			const rect = [handRect[city.position][0], HAND_Y - .8, HAND_W * 4, .5];
			dialogs[count].rect = rect;
			dialogs[count].path = $.makePath({rect});
			count++;
		}
	}
};

const drawTile = (rect, tile, perspective) => {
	if (!tile) { return; }
	const [x, y, w, h] = rect;
	const size = Math.min(w, h);
	if (perspective === "up") {
		$.ctx.bbFill($.makePath({rect: [x, y - size * .3, w, h], radius: w * .05}), COLOR_MAIN);
		$.ctx.bbFill($.makePath({rect: [x, y - size * .2, w, h]}), "#fff");
		$.ctx.bbStroke($.makePath({rect: [x, y - size * .3, w, h], radius: w * .05}), "#000", lineWidth * 2);
	}
	if (perspective === "down") {
		$.ctx.bbFill($.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), COLOR_MAIN);
		$.ctx.bbFill($.makePath({rect: [x, y + size * .2, w, h]}), "#fff");
		$.ctx.bbStroke($.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), "#000", lineWidth * 2);
	}
	if (perspective === "ura") {
		$.ctx.bbFill($.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), "#fff");
		$.ctx.bbFill($.makePath({rect: [x, y + size * .1, w, h]}), COLOR_MAIN);
		$.ctx.bbStroke($.makePath({rect: [x, y + size * .3, w, h], radius: w * .05}), "#000", lineWidth * 2);
	};
	$.ctx.bbFill($.makePath({ rect, radius: rect[2] * .05 }), perspective === "ura" ? COLOR_MAIN : "#fff");
	$.ctx.bbStroke($.makePath({ rect, radius: rect[2] * .05 }), "#000", lineWidth * 2);
	if (perspective !== "ura") {
		if (w < h) {
			$.ctx.bbText(tile.count, x + size / 2, y + size * .2, {size: size * .3, color: "#88f", font: "serif", align: "center", valign: "middle"});
			$.ctx.bbText(tile.character, x + size / 2, y + size * .8, {size: size * .8, font: "serif", align: "center", valign: "middle", ...(tile.red && { color: "#f00"})})
		}
		else {
			$.ctx.bbText(tile.count, x + + size * .2, y + size / 2, {size: size * .3, color: "#88f", font: "serif", align: "center", valign: "middle", rotate: -Math.PI / 2});
			$.ctx.bbText(tile.character, x + size * .8, y + size / 2, {size: size * .8, font: "serif", align: "center", valign: "middle", rotate: -Math.PI / 2, ...(tile.red && { color: "#f00"})})
		}
	}
};

const drawDraggingTile = (rect, tile, mousex) => {
	const [, y, w, h] = rect;
	drawTile([mousex - w / 2, y - h, w, h], tile);
};

const drawDraggingArrow = (rect) => {
	const x = rect[0] + rect[2] / 2;
	const y = rect[1];
	$.ctx.bbFill(
		$.makePath({points:[ [x, y - .3], [x - .2, y - .6], [x + .2, y - .6]]}),
		"#cc0"
	);
};

const drawCheckbox = (x, y, isChecked) => {
	$.ctx.bbStroke($.makePath({rect: [x, y, .4, .4]}), "#000", lineWidth * 2);
	if (isChecked) {
		$.ctx.bbStroke($.makePath({points: [
			[x + .1, y + .1],
			[x + .2, y + .35],
			[x + .4, y],
			[x + .2, y + .35],
			[x + .1, y + .1],
		]}), "#f00", lineWidth * 4);
	}
};

const drawKanButton = (drawObject, isHover) => {
	const [x, y, w, h] = drawObject.rect;
	$.ctx.bbFill($.makePath({ rect: [x, y + .15, w, h - .3], radius: .1}), isHover? "#999" : "#ccc");
	$.ctx.bbText("カン", x + w / 2, y + .05, {size: .4, align: "center"});
};

const drawHandGuide = (tiles) => {
	const handRect = calcHandRect(tiles);
	const count = Array(tiles.hand.length).fill().map(() => []);
	let lastPos;
	let lastCities;
	for (let city of tiles.group) {
		if (lastPos !== city.position) {
			lastPos = city.position;
			lastCities = [];
		}
		if (lastCities.includes(city.name)) { continue; }
		else { lastCities.push(city.name); }
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		$.ctx.bbFill($.makePath({rect: [
			handRect[city.position][0] + .1,
			handRect[city.position][1] + handRect[city.position][3] + .1 + line * .1,
			handRect[city.position][2] * city.length - .2,
			.05
		], radius: .025}), "#f00");
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
	}
};

const drawCityTable = (hand, character) => {
	const RECT_Y = .25;
	const TEXT_SIZE = .39;
	const TEXT_LINES = 11;
	const ROW_WIDTH = 5.5;	// 一列が何文字分か: 市町村名を含む
	const start_x = (16 - TEXT_SIZE * ROW_WIDTH * Math.ceil(61 / TEXT_LINES)) / 2;
  const cities = CITIES.filter(city => city.name.includes(character));
	$.ctx.bbFill($.makePath({rect: [start_x - .15, RECT_Y - .15, 16 - start_x * 2 + .3, TEXT_SIZE * 1.5 * TEXT_LINES + .1]}), COLOR_STRONG);
	$.ctx.bbFill($.makePath({rect: [start_x - .1, RECT_Y - .1, 16 - start_x * 2 + .2, TEXT_SIZE * 1.5 * TEXT_LINES]}), "#fff");
	for (let i = 0; i < cities.length; i++) {
		const isInHand = cities[i].name.split("").map(char => hand.map(tile => tile.character).includes(char)).reduce((a, b) => a && b, true);
		$.ctx.bbText(cities[i].name + cities[i].category, start_x + Math.floor(i / TEXT_LINES) * TEXT_SIZE * ROW_WIDTH, RECT_Y + TEXT_SIZE * 1.5 * (i % TEXT_LINES), {size: TEXT_SIZE, style: isInHand? "bold" : ""});
	}
};

const drawCityTableIfNeed = (tiles) => {
	const handRect = calcHandRect(tiles);
	if (!IS_SMARTPHONE && $.isMousePress) { return; }
	for (let i = 0; i < handRect.length; i++) {
		if ($.isPointInPath($.makePath({rect: handRect[i]}), $.mouseX, $.mouseY)){
			if ($.isMousePress && !$.isPointInPath($.makePath({rect: handRect[i]}), $.startX, $.startY)){ return; }
			drawCityTable(tiles.hand, tiles.hand[i].character);
		}
	}
};
