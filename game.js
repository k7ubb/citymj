"use strict";

const gameScene = (config = {initialHandLength: 14, isHandGuideEnabled: true, isCityTableEnabled: true}) => {
	$.reset();
	const tiles = new GameTiles(config.initialHandLength);

	let isToReach = false;
	let isSelecting = false;

	const checkIsPaused = () => tiles.finished || isSelecting;

	const objects = {
		hand: calcHandRect(tiles).map((rect, i) => $.item({
			eventDisabled: checkIsPaused,
			rect,
			radius: rect[2] * .05,
			draw: function() { drawTile(this.rect, tiles.hand[i], "up"); },
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
			onClick: async function() {
				if (IS_SMARTPHONE && config.isCityTableEnabled) { return; }
				if (!tiles.cutHand(i, isToReach)) { return; } // リーチ後の手出し
				$.eventDisabled = true;
				if (isToReach) {
					calcTrashRect(tiles).map((rect, i) => objects.trash[i].updateRect(rect));
					$.update();
					isToReach = false;
				}
				$.update();
				await sleep(300);
				tiles.tsumo(false);
				$.eventDisabled = false;
				$.update();
			}
		})),
		uradora: calcDoraRect(true).map((rect, i) => $.item({
			rect,
			radius: rect[2] * .05,
			draw: function() { drawTile(this.rect, tiles.uradora[i].tile, "ura"); },
		})),
		dora: calcDoraRect().map((rect, i) => $.item({
			rect,
			radius: rect[2] * .05,
			draw: function() { drawTile(this.rect, tiles.dora[i].tile, i < tiles.kans.length + 1? "down" : "ura"); },
		})),
		trash: calcTrashRect(tiles).map((rect, i) => $.item({
			rect,
			radius: rect[2] * .05,
			draw: function() { drawTile(this.rect, tiles.trash[i], "down"); },
		})),
		kans: calcKansRect().map((rects, i) => $.item({
			draw: function() {
				if (tiles.kans[i]) {
					for (let j = 0; j < 4; j++) {
						drawTile(rects[j], tiles.kans[i][j]); 
					}
				}
			}
		})),
		kanButton: new Array(3).fill().map((_, i) => $.item({
			disabled: checkIsPaused,
			draw: function() { if (this.path) drawKanButton(this); },
			onHover: function() { if (this.path) drawKanButton(this, true); },
			onClick: async function() {
				tiles.kan(i);
				const handRect = calcHandRect(tiles);
				objects.hand.map((hand, i) => {
					if (handRect[i]) { hand.updateRect(handRect[i]); }
					else { hand.disabled = true; }
				});
				updateSelectingHandRect(tiles, objects.selectingHand);
				handRect.map((rect, i) => objects.hand[i].updateRect(rect));
				$.eventDisabled = true;
				$.update();
				await sleep(300);
				tiles.tsumo(true);
				$.eventDisabled = false;
				$.update();
			}
		})),
		selectButton: $.item({
			disabled: () => $.eventDisabled || checkIsPaused(),
			rect: SELECT_BUTTON_RECT,
			radius: .4,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc")
				$.ctx.bbText("点数計算", x + .25, y + .4, {size: .5, baseline: "middle"});
			},
			onClick: function() {
				selectngInit();
				isSelecting = !isSelecting;
				$.update();
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		}),
		reachButton: $.item({
			disabled: () => tiles.reached || $.eventDisabled || checkIsPaused(),
			rect: REACH_BUTTON_RECT,
			radius: .4,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc")
				$.ctx.bbText("リーチ", x + .8, y + .4, {size: .5, baseline: "middle"});
				drawCheckbox(x + .3, y + .2, isToReach);
				if (isToReach) {
					$.ctx.bbText("テンパイしていなくてもリーチ宣言可能です。待ちを確認してリーチしてください。", x + w - 2.5, y, {size: .3, color: "#f00", align: "right"});
				}
			},
			onClick: function() {
				isToReach = !isToReach;
				$.update();
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		}),
		configButtons: [
			{
				rect: [12, 0, 4, .8],
				text: "手牌の市町村を表示",
				key: "isHandGuideEnabled"
			},
			{
				rect: [12, .8, 4, .8],
				text: "市町村一覧を表示",
				key: "isCityTableEnabled"
			}
		].map(data => $.item({
			disabled: checkIsPaused,
			rect: data.rect,
			draw: function() {
				const [x, y, w, h] = this.rect;
				drawCheckbox(x + .3, y + .2, config[data.key]);
				$.ctx.bbText(data.text, x + .8, y + .4, {size: .3, baseline: "middle"});
			},
			onClick: function() {
				config[data.key] = !config[data.key];
				$.update();
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		})),
		finishedButtons: [
			{
				rect: [3, 5.8, 4, .8],
				text: "もう一度遊ぶ",
				onClick: () => gameScene(config)
			},
			{
				rect: [9, 5.8, 4, .8],
				text: "メニューに戻る",
				onClick: () => menuScene()
			}
		].map(data => $.item({
			disabled: () => !tiles.finished,
			rect: data.rect,
			radius: .4,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc"),
				$.ctx.bbText(data.text, x + w / 2, y + .4, {size: .5, align: "center", baseline: "middle"});
			},
			onClick: data.onClick,
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		})),
		...selecting(tiles, () => !isSelecting , () => isSelecting = false, config)
	};
	for (let i in objects) {
		$.addItem(objects[i]);
	}

	$.draw = () => {
		$.ctx.bbFill($.path({rect: [0, 0, 16, 9]}), COLOR_BACKGROUND);
		drawDora(tiles)
		if (config.isHandGuideEnabled) { drawHandGuide(tiles); }
		if (isSelecting) { updateSelectingHandGuide(tiles, objects); }
		updateKanDialogRect(tiles, objects.kanButton);
	};

	$.onEvent = () => {
		if (config.isCityTableEnabled && !checkIsPaused()) {
			drawCityTableIfNeed(tiles);
		}
		if (Math.abs($.mouseX - $.startX) > 1) {
			const handRect = calcHandRect(tiles);
			const dragRect = calcHandRect(tiles, true);
			for (let i = 0; i < handRect.length; i++) {
				if (
					$.isPointInPath($.path({rect: handRect[i]}), $.startX, $.startY) &&
					$.isPointInPath($.path({rect: [0, handRect[0][1], 16, handRect[0][3]]}), $.mouseX, $.mouseY)
				) {
					drawDraggingTile(handRect[i], tiles.hand[i], $.mouseX);
					for (let j = 0; j < dragRect.length; j++) {
						if (i !== j && i + 1 !== j && $.isPointInPath($.path({rect: dragRect[j]}), $.mouseX, $.mouseY)) {
							drawDraggingArrow(dragRect[j]);
							return;
						}
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
					};
				}
			}
		}
		if (isSelecting) { selectingOnMouseup(tiles); }
	};
	
	$.update();
};
