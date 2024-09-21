"use strict";

const gameScene = (config = {
	handLength: 14,
	showHandGuide: true,
	showCityTable: true,
	restrictRule: false,
}, isFirstPlay) => {
	$.reset();
	const tiles = new GameTiles(config.handLength);

	let isToReach = false;
	let isSelecting = false;

	const cutHand = async (i) => {
		if (!tiles.cutHand(i, isToReach)) { return; } // リーチ後の手出し
		$.disabled = true;
		if (isToReach) {
			updateTrashRect(gameItems, tiles);
			isToReach = false;
		}
		$.update();
		await sleep(300);
		tiles.tsumo(false);
		$.disabled = false;
		$.update();
	};
	
	const execKan = async (i) => {
		tiles.kan(i);
		$.disabled = true;
		updateSelectingHandRect(selectingItems, tiles);
		updateHandRect(gameItems, tiles);
		$.update();
		await sleep(300);
		tiles.tsumo(true);
		$.disabled = false;
		$.update();
	};

	const updateTrashRect = (gameItems, tiles) => {
		calcTrashRect(tiles).map((rect, i) => gameItems.trash[i].path.rect = rect);
	};

	const updateHandRect = (gameItems, tiles) => {
		const handRect = calcHandRect(tiles);
		gameItems.hand.map((hand, i) => {
			if (handRect[i]) { hand.path.rect = handRect[i]; }
			else { hand.hidden = true; }
		});
		handRect.map((rect, i) => gameItems.hand[i].path.rect = rect);
	};
	
	const gameItems = {
		hand: calcHandRect(tiles).map((rect, i) => ({
			disabled: () => tiles.finished || isSelecting,
			path: {rect},
			draw: function() { drawTile(this.path.rect, tiles.hand[i], "up"); },
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
			onClick: function() {
				if (IS_SMARTPHONE && config.showCityTable) { return; }
				cutHand(i);
			}
		})),
		uradora: calcDoraRect(true).map((rect, i) => ({
			path: {rect},
			draw: function() { drawTile(this.path.rect, tiles.uradora[i].tile, "ura"); },
		})),
		dora: calcDoraRect().map((rect, i) => ({
			path: {rect},
			draw: function() { drawTile(this.path.rect, tiles.dora[i].tile, i < tiles.kans.length + 1? "down" : "ura"); },
		})),
		trash: calcTrashRect(tiles).map((rect, i) => ({
			path: {rect},
			draw: function() { drawTile(this.path.rect, tiles.trash[i], "down"); },
		})),
		kan: calcKansRect().map((rects, i) => ({
			draw: function() {
				if (tiles.kans[i]) {
					for (let j = 0; j < 4; j++) {
						drawTile(rects[j], tiles.kans[i][j]); 
					}
				}
			}
		})),
		kanButton: new Array(3).fill().map((_, i) => ({
			hidden: () => tiles.finished || isSelecting,
			draw: function() { if (this.path) drawKanButton(this); },
			onHover: function() { if (this.path) drawKanButton(this, true); },
			onClick: function() { execKan(i); }
		})),
		selectButton: {
			hidden: () => $.disabled || tiles.finished || isSelecting,
			path: {
				rect: [1250, 420, 250, 80],
				radius: 40
			},
			draw: function() {
				const [x, y, w, h] = this.path.rect;
				$.ctx.bbFill(this.path, "#ccc")
				$.ctx.bbText("点数計算", x + 25, y + 40, {size: 50, baseline: "middle"});
			},
			onClick: function() {
				selectngInit();
				isSelecting = true;
				$.update();
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		},
		reachButton: {
			hidden: () => tiles.reached || $.disabled || tiles.finished || isSelecting,
			path: {
				rect: [1250, 520, 250, 80],
				radius: 40
			},
			draw: function() {
				const [x, y, w, h] = this.path.rect;
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
		},
		finishedButtons: [
			{
				hidden: () => !tiles.finished,
				path: {
					rect: [300, 580, 400, 80],
					radius: 40
				},
				draw: function() {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("もう一度遊ぶ", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => gameScene(config),
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			},
			{
				hidden: () => !tiles.finished,
				path: {
					rect: [900, 580, 400, 80],
					radius: 40
				},
				draw: function() {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("メニューに戻る", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => menuScene(),
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			}
		]
	};

	for (let i in gameItems) {
		$.addItem(gameItems[i]);
	}

	const selectingItems = createSelectingItems(tiles, () => !isSelecting , () => isSelecting = false, config);
	for (let i in selectingItems) {
		$.addItem(selectingItems[i]);
	}

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

	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		drawDora(tiles);
		if (config.showHandGuide) { drawHandGuide(tiles); }
		if (isSelecting) { updateSelectingHandGuide(tiles, selectingItems); }
		updateKanDialogRect(tiles, gameItems.kanButton);
	};

	const trashArea = {rect: [400, 40, 800, 460]};

	$.onEvent = () => {
		if (config.showCityTable && !tiles.finished && !isSelecting) {
			drawCityTableIfNeed(tiles);
		}
		if (Math.abs($.mouseX - $.startX) > 1) {
			const handRect = calcHandRect(tiles);
			const dragRect = calcHandRect(tiles, true);
			for (let i = 0; i < handRect.length; i++) {
				if ($.isPointInPath({rect: handRect[i]}, $.startX, $.startY)) {
					drawDraggingTile(handRect[i], tiles.hand[i], $.mouseX, $.mouseY);
					for (let j = 0; j < dragRect.length; j++) {
						if (i !== j && i + 1 !== j && $.isPointInPath({rect: dragRect[j]}, $.mouseX, $.mouseY)) {
							drawDraggingArrow(dragRect[j]);
							return;
						}
					}
					if ($.isPointInPath(trashArea, $.mouseX, $.mouseY)) {
						$.ctx.bbFill(trashArea, "rgb(0 0 0 / .1)");
						$.ctx.setLineDash([15, 5]);
						$.ctx.bbStroke(trashArea, {color: "#000", width: 4});
						$.ctx.setLineDash([]);
						return; 
					}
				}
			}
			$.drawFinally = () => {};
			if (isSelecting) { selectingOnEvent(tiles); }
		}
	};

	$.onMouseUp = () => {
		const handRect = calcHandRect(tiles);
		const dragRect = calcHandRect(tiles, true);
		for (let i = 0; i < handRect.length; i++) {
			if ($.isPointInPath({rect: handRect[i]}, $.startX, $.startY)) {
				for (let j = 0; j < dragRect.length; j++) {
					if ($.isPointInPath({rect: dragRect[j]}, $.mouseX, $.mouseY)) {
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
