"use strict";

let selectedCities = [];

const selectngInit = () => {
	selectedCities = [];
};

const createSelectingItems = (tiles, checkIsSelecting, unSelect, configToHandOver) => ({
	dialog: new Item({
		disabled: checkIsSelecting,
		draw: function() {
			$.ctx.bbFill($.path({rect: [20, 20, 1560, 860]}), COLOR_STRONG);
			$.ctx.bbFill($.path({rect: [30, 30, 1540, 840]}), "#fff");
		}
	}),
	closeButton: new Item({
		disabled: checkIsSelecting,
		rect: [50, 780, 200, 80],
		radius: 40,
		draw: function() {
			const [x, y, w, h] = this.rect;
			$.ctx.bbFill(this.path, "#ccc")
			$.ctx.bbText("閉じる", x + 25, y + 40, {size: 50, baseline: "middle"});
		},
		onClick: function() {
			unSelect();
			$.update();
		},
		onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
	}),
	hand: calcSelectingHandRect(tiles).map((rect, i) => new Item({
		disabled: checkIsSelecting,
		rect,
		draw: function() { drawTile(this.rect, tiles.hand[i], "up"); },
		onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
	})),
	kan: calcSelectingKansRect().map((rects, i) => new Item({
		disabled: checkIsSelecting,
		draw: function(ctx) {
			if (tiles.kans[i]) {
				for (let j = 0; j < 4; j++) {
					drawTile(rects[j], tiles.kans[i][j]); 
				}
			}
		}
	})),
	selectingGroup: new Array(20).fill().map((_, i) => new Item({
		disabled: checkIsSelecting,
		draw: function() { if (this.path) drawSelectingHandGuide(this) },
		onHover: function() { if (this.path) $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
		onClick: function() {
			const citiesLessFourLength = tiles.group.filter(city => city.length !== 4);
			if (selectedCities.includes(citiesLessFourLength[i]) ){
				selectedCities = selectedCities.filter(x => x !== citiesLessFourLength[i]);
			}
			else {
				selectedCities.push(citiesLessFourLength[i]);
			}
			$.update();
		}
	})),
	winButton: new Item({
		disabled: () => checkIsSelecting() || selectedCities.reduce((a, b) => a + b.length, 0) !== tiles.hand.length,
		rect: [1250, 780, 300, 80],
		radius: 40,
		draw: function() {
			const [x, y, w, h] = this.rect;
			$.ctx.bbFill(this.path, COLOR_BACKGROUND)
			$.ctx.bbText("面子を確定", x + 25, y + 40, {size: 50, baseline: "middle"});
		},
		onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
		onClick: function(){
			const cities = selectedCities.map(city_ => {
				const { position, length, ...city } = city_;
				const cityTiles = [];
				for (let i = city_.position; i < city_.position + city_.length; i++) {
					cityTiles.push(tiles.hand[i]);
				}
				return {...city, tiles: cityTiles};
			});
			for (let kan of tiles.kans) {
				const cityname = kan.reduce((a, b) => a + b.character, "");
				cities.push({
					...CITIES.filter(city => city.name === cityname)[0],
					tiles: kan
				});
			}
			scoreScene(tiles, cities, configToHandOver);
		}
	})
});

const selectingOnEvent = (tiles) => {
	const handRect = calcSelectingHandRect(tiles);
	const dragRect = calcSelectingHandRect(tiles, true);
	for (let i = 0; i < handRect.length; i++) {
		if ($.isPointInPath($.path({rect: handRect[i]}), $.startX, $.startY)) {
			drawDraggingTile(handRect[i], tiles.hand[i], $.mouseX);
			for (let j = 0; j < dragRect.length; j++) {
				if (i !== j && i + 1 !== j && $.isPointInPath($.path({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
					drawDraggingArrow(dragRect[j]);
					return;
				}
			}
		}
	}
};

const selectingOnMouseup = (tiles) => {
	const handRect = calcSelectingHandRect(tiles);
	const dragRect = calcSelectingHandRect(tiles, true);
	for (let i = 0; i < handRect.length; i++) {
		if ($.isPointInPath($.path({rect: handRect[i]}), $.startX, $.startY)) {
			for (let j = 0; j < dragRect.length; j++) {
				if ($.isPointInPath($.path({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
					tiles.replaceHand(i, j);
					selectngInit();
					$.update();
					return;
				}
			}
		}
	}
};

const updateSelectingHandGuide = (tiles, selectingItems) => {
	const GUIDE_H = 100;
	const handRect = calcSelectingHandRect(tiles);
	const count = Array(tiles.hand.length).fill().map(() => []);
	let objectCount = 0;
	for (let obj of selectingItems.selectingGroup) {
		delete obj.path;
		delete obj.eventDisabled;
		delete obj.city;
	}
	const citiesLessFourLength = tiles.group.filter(city => city.length !== 4);
	for (let city of citiesLessFourLength) {
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		const nth = objectCount++;
		selectingItems.selectingGroup[nth].rect = [
			handRect[city.position][0] + 2.5,
			handRect[city.position][1] + handRect[city.position][3] + 10 + line * (GUIDE_H + 7),
			handRect[city.position][2] * city.length - 5,
			GUIDE_H
		];
		if (!selectedCities.includes(city)) {
			loop: for (let checkCity of selectedCities) {
				for (let i = checkCity.position; i < checkCity.position + checkCity.length; i++) {
					if (city.position <= i && i < city.position + city.length) {
						selectingItems.selectingGroup[nth].eventDisabled = true;
						break loop;
					}
				}
			}
		}
		selectingItems.selectingGroup[nth].path = $.path({rect: selectingItems.selectingGroup[nth].rect, radius: 20});
		selectingItems.selectingGroup[nth].city = city;
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
	}
};

const drawSelectingHandGuide = (item) => {
	const TEXT_SIZE = 30;
	const contents = [
		{
			display: () => true,
			getChar: (city) => city.category,
		},
		{
			display: (city) => city.kento,
			getChar: () => "都",
		},
		{
			display: (city) => city.seirei,
			getChar: () => "令",
		},
		{
			display: (city) => city.ritou,
			getChar: () => "島",
		},
	];
	const [x, y, w, h] = item.rect;
	const x_ = x + w / 2;
	const y_ = y + h / 2;
	const fillColor = (category) => {
		if (item.eventDisabled) { return "#ccc"; }
		switch (category) {
			case "市":
				return "#9DCCDF";
			case "町":
				return "#CC9DDF";
			case "村":
				return "#CCDF9D";
		}
	};
	const textColor = (category) => {
		if (item.eventDisabled) { return "#999"; }
		switch (category) {
			case "市":
				return "#000080";
			case "町":
				return "#800000";
			case "村":
				return "#008000";
		}
	};
	$.ctx.bbFill(item.path, fillColor(item.city.category));
	if (selectedCities.includes(item.city)) {
		$.ctx.bbStroke(item.path, COLOR_STRONG, lineWidth * 2);
	}
	$.ctx.bbText(item.city.pref, x_, y_ - TEXT_SIZE, {size: TEXT_SIZE, align: "center", baseline: "middle"});
	let nth_mark = 0;
	for (let content of contents) {
		if (content.display(item.city)) {
			const x__ = x + 30 + nth_mark * 35;
			const y__ = y_ + TEXT_SIZE / 2;
			$.ctx.bbText(content.getChar(item.city), x__, y__, {size: TEXT_SIZE, align: "center", baseline: "middle", color: textColor(item.city.category), style: "bold"});
			nth_mark++;
		}
	}
};

const updateSelectingHandRect = (selectingItems, tiles) => {
	const handRect = calcSelectingHandRect(tiles);
	selectingItems.hand.map((hand, i) => {
		if (handRect[i]) { hand.rect = handRect[i]; }
		else { hand.disabled = true; }
	});
};