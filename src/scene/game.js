"use strict";

const gameScene = (config = {
	handLength: 14,
	showHandGuide: true,
	showCityTable: true,
	restrictRule: false,
}, isFirstPlay, debugMauntain) => {
	$.reset();

	const game = new Game(config.handLength, debugMauntain);
	let isReachChecked = false;
	let isSelecting = false;
	let selectedCities = [];
	let selectingItem = {};
	let isFinished = false;

	const cutHand = async (i) => {
		try {
			game.cutHand(i, isReachChecked);
			$.disabled = true;
			if (isReachChecked) {
				$.deleteItem(reachButton);
				isReachChecked = false;
			}
			$.update();
			await sleep(300);
			game.tsumo();
		} catch(e) {
			if (e.message === "リーチ後の手出し") {
				alert("リーチ後はツモ切りしかできません");
			}
			if (e.message === "ツモる牌がもうありません (終局)") {
				isFinished = true;
				$.deleteItem(kanButtons);
				$.deleteItem(selectButton);
				$.deleteItem(reachButton);
				$.deleteItem(tileDragArea);
				$.addItem(new Button({
					rect: [300, 580, 400, 80],
					value: "もう一度遊ぶ",
					onClick: () => gameScene(config)
				}));
				$.addItem(new Button({
					rect: [900, 580, 400, 80],
					value: "メニューに戻る",
					onClick: () => menuScene()
				}));
			}
		} finally {
			$.disabled = false;
			$.update();
		}
	};
	
	const	selectButton = $.addItem(
		new Button({
			rect: [1250, 420, 250, 80],
			value: "点数計算",
			onClick: function() {
				selectingStart();
			}
		})
	);
	
	const reachButton = $.addItem(
		new Button({
			rect: [1250, 520, 250, 80],
			value: "　リーチ",
			draw: function([x, y, w, h]) {
				drawCheckbox(x + 50, y + 24, isReachChecked);
				if (isReachChecked) {
					$.ctx.bbText("テンパイしていなくてもリーチ宣言可能です。待ちを確認してリーチしてください。", x + w - 250, y, {size: 30, color: "#f00", align: "right"});
				}
			},
			onClick: function() {
				isReachChecked = !isReachChecked;
				$.update();
			},
		})
	);

	let handButtons = [];
	let kanButtons = [];

	game.onUpdateHand = () => {
		const handPosition = calcHandPosition(game.hand, game.kans);
		
		$.deleteItem(handButtons);
		handButtons = $.addItem(game.hand.filter(x => x).map((tile, i) => ({
			...(isSelecting
				? {_disabled: () => isFinished, disabled: true}
				: {disabled: () => isFinished}
			),
			path: { rect: [handPosition[i], 700, 99, 100 * 4 / 3] },
			draw: function() {
				drawTile(this.path.rect, tile, {perspective: "up"});
			},
			onHover: function() {
				if (!$.isMousePress) {
					$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
				}
				if (config.showCityTable && !isSelecting && !(!IS_SMARTPHONE && $.isMousePress)) {
					drawCityTable(game.hand, tile.character);
				}
			},
			onClick: function() {
				if (!IS_SMARTPHONE) { cutHand(i); }
			}
		})));
		
		$.deleteItem(kanButtons);
		kanButtons = $.addItem(game.cities.filter(city => city.length === 4).map(city => new Button({
			...(isSelecting && {_disabled: () => isFinished, disabled: true}),
			rect: [handPosition[city.position] + 10, 620, 380, 40],
			draw: function([x, y, w, h]) { $.ctx.bbText("カン", x + w / 2, y + h / 2, {size: 30, align: "center", baseline: "middle"}); },
			onClick: async () => {
				game.kan(city.position);
				$.disabled = true;
				$.update();
				await sleep(300);
				game.tsumo({isRinshan: true});
				$.disabled = false;
				$.update();
			}
		})));
		
		if (isSelecting) {
			selectedCities = [];
			const handPosition = calcHandPosition(game.hand, game.kans);
			const latestTsumoPosition = game.hand.indexOf(game.latestTsumo);
			$.deleteItem(selectingItem.handButtons);
			selectingItem.handButtons = $.addItem(game.hand.map((tile, i) => ({
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
			selectingItem.cityButtons = $.addItem(game.cities.filter(city => city.length !== 4).map(city => {
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
				], latestTsumoPosition, selectingItem, selectedCities, config.restrictRule);
			}));
		}
	};
	game.onUpdateHand();


	const selectingStart = () => {
		isSelecting = true;
		selectingItem = {};
		$.addItem(new Dialog({
			rect: [20, 20, 1560, 860],
			modal: true,
			onClose: () => {
				isSelecting = false;
				for (let key of Object.keys(selectingItem)) {
					$.deleteItem(selectingItem[key]);
				}
			}
		}));
		selectingItem.dragArea = $.addItem({
			path: { rect: [0, 0, 1600, 900] },
			onMousePress: function() {
				if (($.mouseX - $.startX) ** 2 + ($.mouseY - $.startY) ** 2 < 1000) { return; }
				const handPosition = calcHandPosition(game.hand, game.kans);
				const handDragPosition = calcHandPosition(game.hand, game.kans, true);
				for (let i = 0; i < handPosition.length; i++) {
					if ($.isPointInPath({rect: [handPosition[i], 130, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
						drawTile([$.mouseX - 50, $.mouseY - 67, 100], game.hand[i]);
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
				const handPosition = calcHandPosition(game.hand, game.kans);
				const handDragPosition = calcHandPosition(game.hand, game.kans, true);
				for (let i = 0; i < handPosition.length; i++) {
					if ($.isPointInPath({rect: [handPosition[i], 130, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
						for (let j = 0; j < handDragPosition.length; j++) {
							if (i === j || i + 1 === j) { continue; }
							if ($.isPointInPath({rect: [handDragPosition[j], 130, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
								game.replaceHand(i, j);
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
				for (let i = 0; i < game.kans.length; i++) {
					const x = 1600 - 41 - 324 * (i + 1) - 8 * i;
					for (let j = 0; j < 4; j++) {
						drawTile([x + 81 * j, 157, 81], game.kans[i][j]); 
					}
				}
			}
		});
		selectingItem.winButton = $.addItem(new Button({
			zIndex: 101,
			disabled: () => selectedCities.reduce((a, b) => a + b.length, 0) !== game.hand.length,
			rect: [1250, 780, 300, 80],
			value: "面子を確定",
			onClick: function() {
				const cities = selectedCities.map(city_ => {
					const { position, length, ...city } = city_;
					const cityTiles = [];
					for (let i = city_.position; i < city_.position + city_.length; i++) {
						cityTiles.push(game.hand[i]);
					}
					return {...city, tiles: cityTiles};
				});
				for (let kan of game.kans) {
					const cityname = kan.reduce((a, b) => a + b.character, "");
					cities.push({
						...CITIES.filter(city => city.name === cityname)[0],
						tiles: kan
					});
				}
				scoreScene(game, cities, config);
			}
		}));
		game.onUpdateHand();
		$.update();
	};

	if (isFirstPlay) {
		const messages = !IS_SMARTPHONE
			? ["ドラッグで理牌", "クリックで打牌"]
			: ["ドラッグで理牌", "河にドラッグで打牌"];		
		if (config.showCityTable) {
			messages.push((!IS_SMARTPHONE? "長押し" : "マウスオーバー") + "で市町村一覧");
		}
		$.addItem(new Dialog({
			rect: [500, 400, 600, 25 + 60 * messages.length],
			modal: true,
			draw: function() {
				for (let i in messages) {
					$.ctx.bbText(messages[i], 300, 20 + 60 * i, {size: 40, align: "center"});
				}
			}
		}));
	}

	const tileDragArea = $.addItem({
		path: { rect: [0, 0, 1600, 900] },
		onMousePress: function() {
			if (($.mouseX - $.startX) ** 2 + ($.mouseY - $.startY) ** 2 < 1000) { return; }
			const handPosition = calcHandPosition(game.hand, game.kans);
			const handDragPosition = calcHandPosition(game.hand, game.kans, true);
			for (let i = 0; i < handPosition.length; i++) {
				if ($.isPointInPath({rect: [handPosition[i], 700, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
					drawTile([$.mouseX - 50, $.mouseY - 67, 100], game.hand[i]);
					if ($.isPointInPath({rect: [400, 40, 800, 460]}, $.mouseX, $.mouseY)) {
						$.ctx.bbFill({rect: [400, 40, 800, 460]}, "rgb(0 0 0 / .1)");
						$.ctx.setLineDash([15, 5]);
						$.ctx.bbStroke({rect: [400, 40, 800, 460]}, {color: "#000", width: 4});
						$.ctx.setLineDash([]);
						return; 
					}
					for (let j = 0; j < handDragPosition.length; j++) {
						if (i === j || i + 1 === j) { continue; }
						if ($.isPointInPath({rect: [handDragPosition[j], 700, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
							const x = handDragPosition[j] + 50;
							const y = 640;
							$.ctx.bbFill({points:[ [x, y + 24], [x - 20, y], [x + 20, y]]}, "#cc0");
							return;
						}
					}
				}
			}
		},
		onMouseUp: function() {
			const handPosition = calcHandPosition(game.hand, game.kans);
			const handDragPosition = calcHandPosition(game.hand, game.kans, true);
			for (let i = 0; i < handPosition.length; i++) {
				if ($.isPointInPath({rect: [handPosition[i], 700, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
					if ($.isPointInPath({rect: [400, 40, 800, 460]}, $.mouseX, $.mouseY)) {
						cutHand(i);
						return;
					}
					for (let j = 0; j < handDragPosition.length; j++) {
						if (i === j || i + 1 === j) { continue; }
						if ($.isPointInPath({rect: [handDragPosition[j], 700, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
							game.replaceHand(i, j);
							$.update();
							return;
						}
					}
				}
			}
		}
	});

	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		drawDora(game.dora, game.uradora, game.kans.length + 1);
		drawTrash(game.trash, game.reachCount);
		drawKan(game.kans);
		if (config.restrictRule) {
			$.ctx.bbText("⚠️くっつき待ち制限: ON", 1556, 20, {size: 30, align: "right"});
		}
		if (config.showHandGuide) {
			const handPosition = calcHandPosition(game.hand, game.kans);
			drawHandGuide(game.cities, handPosition);
		}
	};

	$.update();
};
