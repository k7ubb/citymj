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

const calcCityOverlap = (cities, skipSameNameCity = false) => {
	const maxTile = Math.max(...cities.map(city => city.position + city.length));
	const count = Array(maxTile).fill().map(() => []);
	const result = [];
	let lastPos;
	let lastCities;
	for (let city of cities) {
		if (lastPos !== city.position) {
			lastPos = city.position;
			lastCities = [];
		}
		if (lastCities.includes(city.name)) {
			if (skipSameNameCity) { continue; }
		}	else {
			lastCities.push(city.name);
		}
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
		result.push({
			city,
			overlap: line
		});
	}
	return result;
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

const selectingHandButtonFillColor = (category) => {
	switch (category) {
		case "市":
			return "#9DCCDF";
		case "町":
			return "#CC9DDF";
		case "村":
			return "#CCDF9D";
	}
};

const selectingHandButtonTextColor = (category) => {
	switch (category) {
		case "市":
			return "#000080";
		case "町":
			return "#800000";
		case "村":
			return "#008000";
	}
};

const isCityButtonDisabled = (city, latestTsumoPosition, restrictRule) => {
	if (!restrictRule) { return false; }
	if (city.position > latestTsumoPosition || latestTsumoPosition > city.position + city.length - 1) {
		return false;
	}
	if (city.length !== 2) {
		return false;
	}
	const tileInHandChar = city.name.replace(city.name[latestTsumoPosition - city.position], "");
	const tileInHand = TILES.filter(tile => tile.character === tileInHandChar)[0];
	if (tileInHand.count >= 10) { return true; }
};

const createSelectingHandButton = (city, rect, latestTsumoPosition, selectingCityButtons, selectedCities, restrictRule) => ({
	zIndex: 102,
	path: { rect, radius: 20 },
	city,
	disabled: isCityButtonDisabled(city, latestTsumoPosition, restrictRule),
	draw: function() {
		$.ctx.bbFill(this.path, this.disabled? "#ccc" : selectingHandButtonFillColor(city.category, restrictRule));
		if (selectedCities.includes(city)) {
			$.ctx.bbStroke(this.path, {color: COLOR_STRONG, width: 2});
		}
		const [x, y, w, h] = rect;
		$.ctx.bbText(city.pref, x + w / 2, y + 10, {size: 30, align: "center"});
		const description = [
			city.category,
			...(city.kento? ["都"] : []),
			...(city.seirei? ["令"] : []),
			...(city.ritou? ["島"] : [])
		].join(" ");
		$.ctx.bbText(description, x + 10, y + h / 2, {size: 30, color: this.disabled? "#999" : selectingHandButtonTextColor(city.category), style: "bold"});
		if (isCityButtonDisabled(city, latestTsumoPosition, restrictRule)) {
			$.ctx.bbText("⚠️", x + 10, y + 10, {size: 30, color: "#f00"});
		}
	},
	onClick: function() {
		if (isCityButtonDisabled(city, latestTsumoPosition)) { return; }
		if (selectedCities.includes(city)) {
			selectedCities.splice(selectedCities.indexOf(city), 1);
		}
		else {
			selectedCities.push(city);
		}
		updateSelectedCitiesStatus(selectingCityButtons, selectedCities, latestTsumoPosition, restrictRule);
		$.update();
	}
});

const updateSelectedCitiesStatus = (selectingCityButtons, selectedCities, latestTsumoPosition, restrictRule) => {
	for (const button of selectingCityButtons) {
		if (isCityButtonDisabled(button.city, latestTsumoPosition, restrictRule)) {
			button.disabled = true;
			continue;
		};
		if (selectedCities.includes(button.city)) { continue; }
		button.disabled = false;
		for (const city of selectedCities) {
			if (button.city.position + button.city.length - 1 >= city.position && city.position + city.length - 1 >= button.city.position) {
				button.disabled = true;
				break;
			}
			if (button.city.name === city.name && button.city.category === city.category && button.city.pref === city.pref) {
				button.disabled = true;
				break;
			}
		}
	}
};
