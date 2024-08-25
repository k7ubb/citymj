const SELECT_CLOSE_BUTTON_RECT = [.5, 7.8, 2, .8];
const SELECT_WIN_BUTTON_RECT = [12.5, 7.8, 3, .8];

let selectedCities = [];

const selectngInit = () => {
	selectedCities = [];
};

const selecting = (canvas, tiles, checkIsSelecting, unSelect, configToHandOver) => ({
	dialog: {
		disabled: checkIsSelecting,
		draw: function(ctx) {
			ctx.fill(canvas.makePath({rect: [.2, .2, 15.6, 8.6]}), COLOR_STRONG);
			ctx.fill(canvas.makePath({rect: [.3, .3, 15.4, 8.4]}), "#fff");
		}
	},
	closeButton: {
		disabled: checkIsSelecting,
		path: canvas.makePath({rect: SELECT_CLOSE_BUTTON_RECT, radius: .4}),
		draw: function(ctx) {
			const [x, y, w, h] = SELECT_CLOSE_BUTTON_RECT;
			ctx.fill(this.path, "#ccc")
			ctx.drawText("閉じる", x + .25, y + .4, {size: .5, valign: "middle"});
		},
		onclick: function() {
			unSelect()
			canvas.update();
		},
		drawonhover: function(ctx) { drawonhover(ctx, this.path); }
	},
	selectingHand: calcHandRect(canvas, tiles, 0).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	}).map((rect, i) => ({
		disabled: checkIsSelecting,
		path: canvas.makePath({ rect, radius: rect[2] * .05 }),
		draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.hand[i], "up"); },
		drawonhover: function(ctx) { drawonhover(ctx, this.path); },
	})),
	selectingKans: calcKansRect(canvas).map(rects => rects.map(rect => {
		const [x, y, w, h] = rect;
		return [x - .4, 1.267, w, h];
	})).map((rects, i) => ({
		disabled: checkIsSelecting,
		draw: function(ctx) {
			if (tiles.kans[i]) {
				for (let j = 0; j < 4; j++) {
					drawTile(canvas, ctx, rects[j], tiles.kans[i][j]); 
				}
			}
		}
	})),
	selectingGroup: new Array(20).fill().map((_, i) => ({
		disabled: checkIsSelecting,
		draw: function(ctx) { if (this.path) drawSelectingHandGuide(canvas, ctx, this) },
		drawonhover: function(ctx) { if (this.path) drawonhover(ctx, this.path); },
		onclick: async function() {
			const citiesLessFourLength = tiles.group.filter(city => city.length !== 4);
			if (selectedCities.includes(citiesLessFourLength[i]) ){
				selectedCities = selectedCities.filter(x => x !== citiesLessFourLength[i]);
			}
			else {
				selectedCities.push(citiesLessFourLength[i]);
			}
			canvas.update();
		}
	})),
	winButton: {
		disabled: () => checkIsSelecting() || selectedCities.reduce((a, b) => a + b.length, 0) !== tiles.hand.length,
		path: canvas.makePath({rect: SELECT_WIN_BUTTON_RECT, radius: .4}),
		draw: function(ctx) {
			const [x, y, w, h] = SELECT_WIN_BUTTON_RECT;
			ctx.fill(this.path, COLOR_BACKGROUND)
			ctx.drawText("面子を確定", x + .25, y + .4, {size: .5, valign: "middle"});
		},
		drawonhover: function(ctx) { drawonhover(ctx, this.path); },
		onclick: function(){
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
			scoreScene(canvas, tiles, cities, configToHandOver);
		}
	}
});

const selectingOnEvent = (canvas, tiles, ctx, x, y, startx, starty) => {
	const handRect = calcHandRect(canvas, tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	const dragRect = calcHandRect(canvas, tiles, true).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	for (let i = 0; i < handRect.length; i++) {
		if (ctx.isPointInPath(canvas.makePath({rect: handRect[i]}), startx, starty)) {
			drawDraggingTile(canvas, ctx, handRect[i], tiles.hand[i], x);
			for (let j = 0; j < dragRect.length; j++) {
				if (i !== j && i + 1 !== j && ctx.isPointInPath(canvas.makePath({rect: dragRect[j]}), x, y)) {
					drawDraggingArrow(canvas, ctx, dragRect[j]);
					return;
				}
			}
		}
	}
};

const selectingOnMouseup = (canvas, tiles, ctx, x, y, startx, starty) => {
	const handRect = calcHandRect(canvas, tiles).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	const dragRect = calcHandRect(canvas, tiles, true).map(rect => {
		const [x, y, w, h] = rect;
		return [x, 1, w, h];
	});
	for (let i = 0; i < handRect.length; i++) {
		if (ctx.isPointInPath(canvas.makePath({rect: handRect[i]}), startx, starty)) {
			for (let j = 0; j < dragRect.length; j++) {
				if (ctx.isPointInPath(canvas.makePath({rect: dragRect[j]}), x, y)) {
					tiles.replaceHand(i, j);
					selectngInit();
					canvas.update();
					return;
				};
			}
		}
	}
};

const updateSelectingHandGuide = (canvas, tiles, objects) => {
	const GUIDE_H = 1;
	const handRect = calcHandRect(canvas, tiles).map(rect => {
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
		objects.selectingGroup[nth].path = canvas.makePath({rect: objects.selectingGroup[nth].rect, radius: .2});
		objects.selectingGroup[nth].city = city;
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
	}
};

const drawSelectingHandGuide = (canvas, ctx, object) => {
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
	if (selectedCities.includes(object.city)) {
		ctx.stroke(object.path, COLOR_STRONG, {width: canvas.pixel * 3});
	}
	ctx.fill(object.path, fillColor(object.city.category));
	ctx.drawText(object.city.pref, x_, y_ - TEXT_SIZE, {size: TEXT_SIZE, align: "center", valign: "middle"});
	let nth_mark = 0;
	for (let content of contents) {
		if (content.display(object.city)) {
			const x__ = x + .3 + nth_mark * .35;
			const y__ = y_ + TEXT_SIZE / 2;
			ctx.drawText(content.getChar(object.city), x__, y__, {size: TEXT_SIZE, align: "center", valign: "middle", color: textColor(object.city.category), style: "bold"});
			nth_mark++;
		}
	}
};

