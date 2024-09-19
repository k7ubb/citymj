"use strict";

const gameScene = (config = {handLength: 14, isHandGuideEnabled: false, isCityTableEnabled: false}) => {
	$.reset();
	const tiles = new GameTiles(config.handLength);

	let isToReach = false;
	let isSelecting = false;

	const cutHand = async (i) => {
		if (!tiles.cutHand(i, isToReach)) { return; } // リーチ後の手出し
		$.eventDisabled = true;
		if (isToReach) {
			updateTrashRect(gameItems, tiles);
			isToReach = false;
		}
		$.update();
		await sleep(300);
		tiles.tsumo(false);
		$.eventDisabled = false;
		$.update();
	};
	
	const execKan = async (i) => {
		tiles.kan(i);
		$.eventDisabled = true;
		updateSelectingHandRect(selectingItems, tiles);
		updateHandRect(gameItems, tiles);
		$.update();
		await sleep(300);
		tiles.tsumo(true);
		$.eventDisabled = false;
		$.update();
	};

	const updateTrashRect = (gameItems, tiles) => {
		calcTrashRect(tiles).map((rect, i) => gameItems.trash[i].rect = rect);
	};

	const updateHandRect = (gameItems, tiles) => {
		const handRect = calcHandRect(tiles);
		gameItems.hand.map((hand, i) => {
			if (handRect[i]) { hand.rect = handRect[i]; }
			else { hand.disabled = true; }
		});
		handRect.map((rect, i) => gameItems.hand[i].rect = rect);
	};
	
	const gameItems = {
		hand: calcHandRect(tiles).map((rect, i) => new Item({
			eventDisabled: () => tiles.finished || isSelecting,
			rect,
			draw: function() { drawTile(this.rect, tiles.hand[i], "up"); },
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
			onClick: function() {
				if (IS_SMARTPHONE && config.isCityTableEnabled) { return; }
				cutHand(i);
			}
		})),
		uradora: calcDoraRect(true).map((rect, i) => new Item({
			rect,
			draw: function() { drawTile(this.rect, tiles.uradora[i].tile, "ura"); },
		})),
		dora: calcDoraRect().map((rect, i) => new Item({
			rect,
			draw: function() { drawTile(this.rect, tiles.dora[i].tile, i < tiles.kans.length + 1? "down" : "ura"); },
		})),
		trash: calcTrashRect(tiles).map((rect, i) => new Item({
			rect,
			draw: function() { drawTile(this.rect, tiles.trash[i], "down"); },
		})),
		kan: calcKansRect().map((rects, i) => new Item({
			draw: function() {
				if (tiles.kans[i]) {
					for (let j = 0; j < 4; j++) {
						drawTile(rects[j], tiles.kans[i][j]); 
					}
				}
			}
		})),
		kanButton: new Array(3).fill().map((_, i) => new Item({
			disabled: () => tiles.finished || isSelecting,
			draw: function() { if (this.path) drawKanButton(this); },
			onHover: function() { if (this.path) drawKanButton(this, true); },
			onClick: function() { execKan(i); }
		})),
		selectButton: new Item({
			disabled: () => $.eventDisabled || tiles.finished || isSelecting,
			rect: [1250, 420, 250, 80],
			radius: 40,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc")
				$.ctx.bbText("点数計算", x + 25, y + 40, {size: 50, baseline: "middle"});
			},
			onClick: function() {
				selectngInit();
				isSelecting = true;
				$.update();
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		}),
		reachButton: new Item({
			disabled: () => tiles.reached || $.eventDisabled || tiles.finished || isSelecting,
			rect: [1250, 520, 250, 80],
			radius: 40,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc")
				$.ctx.bbText("リーチ", x + 80, y + 40, {size: 50, baseline: "middle"});
				drawCheckbox(x + 30, y + 20, isToReach);
				if (isToReach) {
					$.ctx.bbText("テンパイしていなくてもリーチ宣言可能です。待ちを確認してリーチしてください。", x + w - 250, y, {size: 30, color: "#f00", align: "right"});
				}
			},
			onClick: function() {
				isToReach = !isToReach;
				$.update();
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		}),
		configButtons: [
			new Item({
				disabled: () => tiles.finished || isSelecting,
				rect: [1200, 0, 400, 80],
				draw: function() {
					const [x, y, w, h] = this.rect;
					drawCheckbox(x + 30, y + 20, config.isHandGuideEnabled);
					$.ctx.bbText("手牌の市町村を表示", x + 80, y + 40, {size: 30, baseline: "middle"});
				},
				onClick: function() {
					config.isHandGuideEnabled = !config.isHandGuideEnabled;
					$.update();
				},
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			}),
			new Item({
				disabled: () => tiles.finished || isSelecting,
				rect: [1200, 80, 400, 80],
				draw: function() {
					const [x, y, w, h] = this.rect;
					drawCheckbox(x + 30, y + 20, config.isCityTableEnabled);
					$.ctx.bbText("市町村一覧を表示", x + 80, y + 40, {size: 30, baseline: "middle"});
				},
				onClick: function() {
					config.isCityTableEnabled = !config.isCityTableEnabled;
					$.update();
				},
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			})
		],
		finishedButtons: [
			new Item({
				disabled: () => !tiles.finished,
				rect: [300, 580, 400, 80],
				radius: 40,
				draw: function() {
					const [x, y, w, h] = this.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("もう一度遊ぶ", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => gameScene(config),
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			}),
			new Item({
				disabled: () => !tiles.finished,
				rect: [900, 580, 400, 80],
				radius: 40,
				draw: function() {
					const [x, y, w, h] = this.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("メニューに戻る", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => menuScene(),
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			})
		]
	};
	for (let i in gameItems) {
		$.addItem(gameItems[i]);
	}

	const selectingItems = createSelectingItems(tiles, () => !isSelecting , () => isSelecting = false, config);
	for (let i in selectingItems) {
		$.addItem(selectingItems[i]);
	}

	$.draw = () => {
		$.ctx.bbFill($.path({rect: [0, 0, 1600, 900]}), COLOR_BACKGROUND);
		drawDora(tiles);
		if (config.isHandGuideEnabled) { drawHandGuide(tiles); }
		if (isSelecting) { updateSelectingHandGuide(tiles, selectingItems); }
		updateKanDialogRect(tiles, gameItems.kanButton);
	};

	const trashArea = $.path({rect: [400, 40, 800, 460]});

	$.onEvent = () => {
		if (config.isCityTableEnabled && !tiles.finished && !isSelecting) {
			drawCityTableIfNeed(tiles);
		}
		if (Math.abs($.mouseX - $.startX) > 1) {
			const handRect = calcHandRect(tiles);
			const dragRect = calcHandRect(tiles, true);
			for (let i = 0; i < handRect.length; i++) {
				if ($.isPointInPath($.path({rect: handRect[i]}), $.startX, $.startY)) {
					drawDraggingTile(handRect[i], tiles.hand[i], $.mouseX, $.mouseY);
					for (let j = 0; j < dragRect.length; j++) {
						if (i !== j && i + 1 !== j && $.isPointInPath($.path({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
							drawDraggingArrow(dragRect[j]);
							return;
						}
					}
					if ($.isPointInPath(trashArea, $.mouseX, $.mouseY)) {
						$.ctx.bbFill(trashArea, "rgb(0 0 0 / .1)");
						$.ctx.setLineDash([15, 5]);
						$.ctx.bbStroke(trashArea, "#000", 4);
						$.ctx.setLineDash([]);
						$.ctx.bbText("ドラッグで打牌", 800, 80, {size: 80, align: "center", baseline: "top"});
						return; 
					}
				}
			}
			if (isSelecting) { selectingOnEvent(tiles); }
		}
	};

	$.onMouseUp = () => {
		const handRect = calcHandRect(tiles);
		const dragRect = calcHandRect(tiles, true);
		for (let i = 0; i < handRect.length; i++) {
			if ($.isPointInPath($.path({rect: handRect[i]}), $.startX, $.startY)) {
				for (let j = 0; j < dragRect.length; j++) {
					if ($.isPointInPath($.path({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
						tiles.replaceHand(i, j);
						$.update();
						return;
					}
				}
				if ($.isPointInPath(trashArea, $.mouseX, $.mouseY)) {
					cutHand(i);
					return;
				}
			}
		}
		if (isSelecting) { selectingOnMouseup(tiles); }
	};
	
	$.update();
};
