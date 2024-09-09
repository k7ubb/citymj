"use strict";

const SELECT_CLOSE_BUTTON_RECT = [.5, 7.8, 2, .8];
const SELECT_WIN_BUTTON_RECT = [12.5, 7.8, 3, .8];

let selectedCities = [];

const selectngInit = () => {
	selectedCities = [];
};

const selecting = (tiles, checkIsSelecting, unSelect, configToHandOver) => ({
	dialog: $.item({
		disabled: checkIsSelecting,
		draw: function() {
			$.ctx.bbFill($.makePath({rect: [.2, .2, 15.6, 8.6]}), COLOR_STRONG);
			$.ctx.bbFill($.makePath({rect: [.3, .3, 15.4, 8.4]}), "#fff");
		}
	}),
	closeButton: $.item({
		disabled: checkIsSelecting,
		rect: SELECT_CLOSE_BUTTON_RECT,
		radius: .4,
		draw: function(ctx) {
			const [x, y, w, h] = this.rect
			$.ctx.bbFill(this.path, "#ccc")
			$.ctx.bbText("閉じる", x + .25, y + .4, {size: .5, valign: "middle"});
		},
		onClick: function() {
			unSelect()
			$.update();
		},
		onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
	}),
	selectingHand: calcHandRect(tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	}).map((rect, i) => $.item({
		disabled: checkIsSelecting,
		rect,
		radius: rect[2] * .05,
		draw: function() { drawTile(this.rect, tiles.hand[i], "up"); },
		onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
	})),
	selectingKans: calcKansRect().map(rects => rects.map(rect => {
		const [x, y, w, h] = rect;
		return [x - .4, 1.267, w, h];
	})).map((rects, i) => $.item({
		disabled: checkIsSelecting,
		draw: function(ctx) {
			if (tiles.kans[i]) {
				for (let j = 0; j < 4; j++) {
					drawTile(rects[j], tiles.kans[i][j]); 
				}
			}
		}
	})),
	selectingGroup: new Array(20).fill().map((_, i) => $.item({
		disabled: checkIsSelecting,
		draw: function() { if (this.path) drawSelectingHandGuide(this) },
		onHover: function() { if (this.path) $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
		onClick: async function() {
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
	winButton: $.item({
		disabled: () => checkIsSelecting() || selectedCities.reduce((a, b) => a + b.length, 0) !== tiles.hand.length,
		rect: SELECT_WIN_BUTTON_RECT,
		radius: .4,
		draw: function() {
			const [x, y, w, h] = this.rect;
			$.ctx.bbFill(this.path, COLOR_BACKGROUND)
			$.ctx.bbText("面子を確定", x + .25, y + .4, {size: .5, valign: "middle"});
		},
		onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
		onClick: function(){
			const cities = selectedCities.map(city_ => {
				const {
					position,
					length,
					...city
				} = city_;
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
	const handRect = calcHandRect(tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	const dragRect = calcHandRect(tiles, true).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	for (let i = 0; i < handRect.length; i++) {
		if ($.isPointInPath($.makePath({rect: handRect[i]}), $.startX, $.startY)) {
			drawDraggingTile(handRect[i], tiles.hand[i], $.mouseX);
			for (let j = 0; j < dragRect.length; j++) {
				if (i !== j && i + 1 !== j && $.isPointInPath($.makePath({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
					drawDraggingArrow(dragRect[j]);
					return;
				}
			}
		}
	}
};

const selectingOnMouseup = (tiles) => {
	const handRect = calcHandRect(tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	const dragRect = calcHandRect(tiles, true).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	for (let i = 0; i < handRect.length; i++) {
		if ($.isPointInPath($.makePath({rect: handRect[i]}), $.startX, $.startY)) {
			for (let j = 0; j < dragRect.length; j++) {
				if ($.isPointInPath($.makePath({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
					tiles.replaceHand(i, j);
					selectngInit();
					$.update();
					return;
				};
			}
		}
	}
};

const updateSelectingHandGuide = (tiles, objects) => {
	const GUIDE_H = 1;
	const handRect = calcHandRect(tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	const count = Array(tiles.hand.length).fill().map(() => []);
	let objectCount = 0;
	for (let obj of objects.selectingGroup) {
		delete obj.path;
		delete obj.eventDisabled;
		delete obj.city;
	}
	const citiesLessFourLength = tiles.group.filter(city => city.length !== 4);
	for (let city of citiesLessFourLength) {
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		const nth = objectCount++;
		objects.selectingGroup[nth].rect = [
			handRect[city.position][0] + .025,
			handRect[city.position][1] + handRect[city.position][3] + .1 + line * (GUIDE_H + .07),
			handRect[city.position][2] * city.length - .05,
			GUIDE_H
		];
		if (!selectedCities.includes(city)) {
			parent: for (let checkCity of selectedCities) {
				for (let i = checkCity.position; i < checkCity.position + checkCity.length; i++) {
					if (city.position <= i && i < city.position + city.length) {
						objects.selectingGroup[nth].eventDisabled = true;
						break parent;
					}
				}
			}
		}
		objects.selectingGroup[nth].path = $.makePath({rect: objects.selectingGroup[nth].rect, radius: .2});
		objects.selectingGroup[nth].city = city;
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
	}
};

const drawSelectingHandGuide = (object) => {
	const TEXT_SIZE = .3;
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
	const [x, y, w, h] = object.rect;
	const x_ = x + w / 2;
	const y_ = y + h / 2;
	const fillColor = (category) => {
		if (object.eventDisabled) { return "#ccc"; }
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
		if (object.eventDisabled) { return "#999"; }
		switch (category) {
			case "市":
				return "#000080";
			case "町":
				return "#800000";
			case "村":
				return "#008000";
		}
	};
	$.ctx.bbFill(object.path, fillColor(object.city.category));
	if (selectedCities.includes(object.city)) {
		$.ctx.bbStroke(object.path, COLOR_STRONG, lineWidth * 2);
	}
	$.ctx.bbText(object.city.pref, x_, y_ - TEXT_SIZE, {size: TEXT_SIZE, align: "center", valign: "middle"});
	let nth_mark = 0;
	for (let content of contents) {
		if (content.display(object.city)) {
			const x__ = x + .3 + nth_mark * .35;
			const y__ = y_ + TEXT_SIZE / 2;
			$.ctx.bbText(content.getChar(object.city), x__, y__, {size: TEXT_SIZE, align: "center", valign: "middle", color: textColor(object.city.category), style: "bold"});
			nth_mark++;
		}
	}
};

const updateSelectingHandRect = (tiles, selectingHand) => {
	const handRect = calcHandRect(tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	selectingHand.map((hand, i) => {
		if (handRect[i]) { hand.updateRect(handRect[i]); }
		else { hand.disabled = true; }
	});
};