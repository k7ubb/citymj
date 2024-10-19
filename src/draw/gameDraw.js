class HandItem {
	hand = [];
	sortAreas = [];

	removeItems() {
		$.deleteItem(...this.hand);
		$.deleteItem(...this.sortAreas);
	}

	// 手牌をドラッグ不可にする (表示のみ残す)
	disable() {
		for (const hand of this.hand) { hand.disabled = true; }
		$.deleteItem(...this.sortAreas);
	}

	constructor(game, {
		zIndex = 0,
		y = 700,
		onClick = () => {},
		draw = () => {},
		drawSecond = () => {}
	} = {}) {
		const START_X = (1600 - 100 * game.hand.length - 80 * game.kans.length * 4) / 2;
		const handPosition = game.hand.map((_, i) => START_X + 100 * i);
		const handSortPosition = [...game.hand, null].map((_, i) => START_X - 50 + 100 * i)
		
		this.hand = $.addItem(...game.hand.filter(_ => _).map((tile, i) => ({
			zIndex,
			draggable: true,
			path: { rect: [handPosition[i], y, 99, 100 * 4 / 3] },
			draw: function({hover}) {
				drawTile(this.path.rect, tile, {perspective: "up"});
				if (hover) { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
				draw({hover}, tile, i);
			},
			drawSecond: function({hover, press, drag}) {
				if (drag) { drawTile([$.mouseX - 50, $.mouseY - 67, 100], tile); }
				drawSecond({hover, press, drag}, tile, i);
			},
			onClick: () => onClick(i)
		})));
		
		this.sortAreas = $.addItem(...handSortPosition.map((x, i) => ({
			zIndex,
			path: { rect: [x, y, 90, 100 * 4 / 3] },
			drawSecond: ({drop}) => {
				const handIndex = this.hand.indexOf(drop?.from);
				if (handIndex !== -1 && handIndex !== i - 1 && handIndex !== i) {
					const x_ = x + 50;
					const y_ = y - 60;
					$.ctx.bbFill({points:[ [x_, y_ + 24], [x_ - 20, y_], [x_ + 20, y_]]}, "#cc0");
				}
			},
			onDrop: (from) => {
				const handIndex = this.hand.indexOf(from);
				if (handIndex !== -1 && handIndex !== i - 1 && handIndex !== i) {
					game.replaceHand(handIndex, i);
				}
			}
		})));
	}
}

class SelectingCityClass {
	buttons = [];

	removeItems() {
		$.deleteItem(...this.buttons);
	}
	
	updateSelectedStatus() {
		for (const button of this.buttons) {
			button.disabled = false;
			if (button.selected) { continue; }
			if (this.strictRule && isCityDisabledByStrictRule(button.city, this.latestTsumoPosition)) {
				button.disabled = true;
			}
			if (isCityDisabledByOverlap(button.city, this.buttons.filter(button => button.selected).map(button => button.city))) {
				button.disabled = true;
			}
		}
	}

	constructor(cities, handPosition, latestTsumoPosition, strictRule) {
		this.latestTsumoPosition = latestTsumoPosition;
		this.strictRule = strictRule;
		// 異なるthisを参照するため: 暫定
		const thisClass = this;
		this.buttons = $.addItem(...calcCityOverlap(cities.filter(city => city.length !== 4)).map(({city, overlap}) => ({
			// 本当は, selectedとcityはitem内に持たせたくない…
			selected: false,
			city,
			zIndex: 102,
			path: {
				rect: [
					handPosition[city.position] + 2.5,
					270 + overlap * 105,
					100 * city.length - 5,
					100
				],
				radius: 20
			},
			draw: function() {
				$.ctx.bbFill(this.path, this.disabled? "#ccc" : selectingButtonFillColor(city.category, strictRule));
				if (this.selected) {
					$.ctx.bbStroke(this.path, {color: COLOR_STRONG, width: 2});
				}
				const [x, y, w, h] = this.path.rect;
				$.ctx.bbText(city.pref, x + w / 2, y + 10, {size: 30, align: "center"});
				$.ctx.bbText(selectingCityDescription(city), x + 10, y + h / 2, {size: 30, color: this.disabled? "#999" : selectingButtonTextColor(city.category), style: "bold"});
			},
			onClick: function() {
				this.selected = !this.selected;
				thisClass.updateSelectedStatus.bind(thisClass)();
				$.update();
			}
		})));
		this.updateSelectedStatus.bind(this)();
	}
}

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
