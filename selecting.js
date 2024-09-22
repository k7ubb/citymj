const selectingItem = {};
let selectedCities;
let restrictRule;

const selectingStart = (tiles, onSelectingEnd, config) => {
	restrictRule = config.restrictRule;
	$.addItem(new Dialog({
		rect: [20, 20, 1560, 860],
		modal: true,
		onClose: () => {
			onSelectingEnd();
			for (let key of Object.keys(selectingItem)) {
				$.deleteItem(selectingItem[key]);
			}
		}
	}));
	selectedCities = [];
	selectingItem.dragArea = $.addItem({
		path: { rect: [0, 0, 1600, 900] },
		onMousePress: function() {
			if (($.mouseX - $.startX) ** 2 + ($.mouseY - $.startY) ** 2 < 1000) { return; }
			const handPosition = calcHandPosition(tiles.hand, tiles.kans);
			const handDragPosition = calcHandPosition(tiles.hand, tiles.kans, true);
			for (let i = 0; i < handPosition.length; i++) {
				if ($.isPointInPath({rect: [handPosition[i], 130, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
					drawTile([$.mouseX - 50, $.mouseY - 67, 100], tiles.hand[i]);
					for (let j = 0; j < handDragPosition.length; j++) {
						if (i === j || i + 1 === j) { continue; }
						if ($.isPointInPath({rect: [handDragPosition[j], 130, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
							const x = handDragPosition[j] + 50;
							const y = 70;
							$.ctx.bbFill({points:[ [x, y + 24], [x - 20, y], [x + 20, y]]}, "#cc0");
							return;
						}
					}
				}
			}
		},
		onMouseUp: function() {
			const handPosition = calcHandPosition(tiles.hand, tiles.kans);
			const handDragPosition = calcHandPosition(tiles.hand, tiles.kans, true);
			for (let i = 0; i < handPosition.length; i++) {
				if ($.isPointInPath({rect: [handPosition[i], 130, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
					for (let j = 0; j < handDragPosition.length; j++) {
						if ($.isPointInPath({rect: [handDragPosition[j], 130, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
							tiles.replaceHand(i, j);
							$.update();
							return;
						}
					}
				}
			}
		}
	});
	selectingItem.drawArea = $.addItem({
		zIndex: 101,
		draw: () => {
			for (let i = 0; i < tiles.kans.length; i++) {
				const x = 1600 - 41 - 324 * (i + 1) - 8 * i;
				for (let j = 0; j < 4; j++) {
					drawTile([x + 81 * j, 157, 81], tiles.kans[i][j]); 
				}
			}
		}
	});
	selectingItem.winButton = $.addItem(new Button({
		zIndex: 101,
		disabled: () => selectedCities.reduce((a, b) => a + b.length, 0) !== tiles.hand.length,
		rect: [1250, 780, 300, 80],
		value: "面子を確定",
		onClick: function() {
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
			scoreScene(tiles, cities, config);
		}
	}));
	selectingOnUpdateGroup(tiles);
};

const selectingOnUpdateGroup = (tiles) => {
	selectedCities = [];
	const handPosition = calcHandPosition(tiles.hand, tiles.kans);
	const latestTsumoPosition = tiles.hand.indexOf(tiles.latestTsumo);
	$.deleteItem(selectingItem.handButtons);
	selectingItem.handButtons = $.addItem(tiles.hand.map((tile, i) => ({
		zIndex: 101, // dialogより上
		path: { rect: [handPosition[i], 130, 99, 100 * 4 / 3] },
		draw: function() {
			drawTile(this.path.rect, tile, {perspective: "up"});
			if (i === latestTsumoPosition) {
				$.ctx.bbFill({
					rect: [handPosition[i] + 10, 105, 80, 20],
					radius: 10
				}, "#fcc")
				$.ctx.bbText("ツモ", handPosition[i] + 50, 105, {size: 20, align: "center", style: "bold", color: "#f00"});
			}
		},
		onHover: function() {
			if (!$.isMousePress) {
				$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
			}
		}
	})));
	$.deleteItem(selectingItem.cityButtons);
	const count = Array(handPosition.length).fill().map(() => []);
	selectingItem.cityButtons = $.addItem(tiles.group.filter(city => city.length !== 4).map(city => {
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
		return createSelectingHandButton(city, [
			handPosition[city.position] + 2.5,
			270 + line * 105,
			100 * city.length - 5,
			100
		], latestTsumoPosition);
	}));
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

const isCityButtonDisabled = (city, latestTsumoPosition) => {
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

const createSelectingHandButton = (city, rect, latestTsumoPosition) => ({
	zIndex: 102,
	path: { rect, radius: 20 },
	city,
	draw: function() {
		const isDisabled = this.disabled || isCityButtonDisabled(city, latestTsumoPosition);
		$.ctx.bbFill(this.path, isDisabled? "#ccc" : selectingHandButtonFillColor(city.category));
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
		$.ctx.bbText(description, x + 10, y + h / 2, {size: 30, color: isDisabled? "#999" : selectingHandButtonTextColor(city.category), style: "bold"});
		if (isCityButtonDisabled(city, latestTsumoPosition)) {
			$.ctx.bbText("⚠️", x + 10, y + 10, {size: 30, color: "#f00"});
		}
	},
	onClick: function() {
		if (isCityButtonDisabled(city, latestTsumoPosition)) { return; }
		if (selectedCities.includes(city)) {
			selectedCities = selectedCities.filter(_ => _ !== city);
		}
		else {
			selectedCities.push(city);
		}
		updateSelectedCitiesStatus();
		$.update();
	}
});

const updateSelectedCitiesStatus = () => {
	for (const button of selectingItem.cityButtons) {
		button.disabled = false;
		if (selectedCities.includes(button.city)) { continue; }
		for (const city of selectedCities) {
			if (button.city.position + button.city.length - 1 >= city.position && city.position + city.length - 1 >= button.city.position) {
				button.disabled = true;
				break;
			}
		}
	}
};
