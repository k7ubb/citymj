const gameScene = (canvas, config = {initialHandLength: 14, isHandGuideEnabled: false, isCityTableEnabled: false}) => {
	const tiles = new GameTiles(config.initialHandLength);
	const objects = {};

	let isToReach = false;
	let isSelecting = false;

	const checkIsPaused = () => tiles.finished || isSelecting;

	const updateObjects = () => {
		objects.hand = calcHandRect(canvas, tiles, 0).map((rect, i) => ({
			eventDisabled: checkIsPaused,
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.hand[i], "up"); },
			drawonhover: function(ctx) { drawonhover(ctx, this.path); },
			onclick: async function() {
				if (IS_SMARTPHONE && config.isCityTableEnabled) { return; }
				// リーチ後の手出しはreturn false -> 中断
				if (!tiles.cutHand(i, isToReach)) { return; }
				canvas.eventDisabled = true;
				if (isToReach) {
					updateObjects();
					canvas.update();
					isToReach = false;
				}
				canvas.update();
				await sleep(300);
				tiles.tsumo();
				canvas.eventDisabled = false;
				canvas.update();
			}
		}));
		objects.uradora = calcDoraRect(canvas, true).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.uradora[i].tile, "ura"); },
		}));
		objects.dora = calcDoraRect(canvas).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.dora[i].tile, i < tiles.kans.length + 1? "down" : "ura"); },
		}));
		objects.trash = calcTrashRect(canvas, tiles).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.trash[i], "down"); },
		}));
		objects.kans = calcKansRect(canvas).map((rects, i) => ({
			draw: function(ctx) {
				if (tiles.kans[i]) {
					for (let j = 0; j < 4; j++) {
						drawTile(canvas, ctx, rects[j], tiles.kans[i][j]); 
					}
				}
			}
		}));
		objects.kanButton = new Array(3).fill().map((_, i) => ({
			disabled: checkIsPaused,
			draw: function(ctx) { if (this.path) drawKanButton(canvas, ctx, this); },
			drawonhover: function(ctx) { if (this.path) drawKanButton(canvas, ctx, this, true); },
			onclick: async function() {
				tiles.kan(i);
				updateObjects();
				canvas.eventDisabled = true;
				canvas.update();
				await sleep(300);
				tiles.tsumo();
				canvas.eventDisabled = false;
				canvas.update();
			}
		}));
		objects.selectButton = {
			disabled: () => canvas.eventDisabled || checkIsPaused(),
			path: canvas.makePath({rect: SELECT_BUTTON_RECT, radius: .4}),
			draw: function(ctx) {
				const [x, y, w, h] = SELECT_BUTTON_RECT;
				ctx.fill(canvas.makePath({rect: [x, y, w, h], radius: .4}), "#ccc")
				ctx.drawText("面子選択", x + .25, y + .4, {size: .5, valign: "middle"});
			},
			onclick: function() {
				selectngInit(tiles);
				isSelecting = !isSelecting;
				canvas.update();
			},
			drawonhover: function(ctx) { drawonhover(ctx, this.path); }
		};
		objects.reachButton = {
			disabled: () => tiles.reached || canvas.eventDisabled || checkIsPaused(),
			path: canvas.makePath({rect: REACH_BUTTON_RECT, radius: .4}),
			draw: function(ctx) {
				const [x, y, w, h] = REACH_BUTTON_RECT;
				ctx.fill(canvas.makePath({rect: [x, y, w, h], radius: .4}), "#ccc")
				ctx.drawText("リーチ", x + .8, y + .4, {size: .5, valign: "middle"});
				drawCheckbox(canvas, ctx, x + .3, y + .2, isToReach);
				if (isToReach) {
					ctx.drawText("テンパイしていなくてもリーチ宣言可能です。待ちを確認してリーチしてください。", x + w - 2.5, y, {size: .3, color: "#f00", align: "right"});
				}
			},
			onclick: function() {
				isToReach = !isToReach;
				canvas.update();
			},
			drawonhover: function(ctx) { drawonhover(ctx, this.path); }
		};
		objects.configButtons = [
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
		].map(data => ({
			disabled: checkIsPaused,
			path: canvas.makePath({rect: data.rect}),
			draw: function(ctx) {
				const [x, y, w, h] = data.rect;
				drawCheckbox(canvas, ctx, x + .3, y + .2, config[data.key]);
				ctx.drawText(data.text, x + .8, y + .4, {size: .3, valign: "middle"});
			},
			onclick: function() {
				config[data.key] = !config[data.key];
				canvas.update();
			},
			drawonhover: function(ctx) { drawonhover(ctx, this.path); }
		}));
		objects.finishedButtons = [
			{
				rect: [3, 5.8, 4, .8],
				text: "もう一度",
				onclick: () => gameScene(canvas, config)
			},
			{
				rect: [9, 5.8, 4, .8],
				text: "メニューに戻る",
				onclick: () => menuScene(canvas)
			}
		].map(data => ({
			disabled: () => !tiles.finished,
			path: canvas.makePath({rect: data.rect, radius: .4}),
			draw: function(ctx) {
				const [x, y, w, h] = data.rect;
				ctx.fill(this.path, "#ccc"),
				ctx.drawText(data.text, x + w / 2, y + .4, {size: .5, align: "center", valign: "middle"});
			},
			onclick: data.onclick,
			drawonhover: function(ctx) { drawonhover(ctx, this.path); }
		}));
		Object.assign(objects, selecting(canvas, tiles, () => !isSelecting , () => isSelecting = false));
		canvas.objects = [];
		for (let obj in objects) {
			if (Array.isArray(objects[obj])) {
				canvas.objects.push(...objects[obj]);
			}
			else {
				canvas.objects.push(objects[obj]);
			}
		}
	};
	updateObjects();

	canvas.onupdate = (ctx) => {
		ctx.fill(canvas.makePath({rect: [0, 0, 16, 9]}), COLOR_BACKGROUND);
		drawDora(canvas, ctx, tiles)
		if (config.isHandGuideEnabled) { drawHandGuide(canvas, ctx, tiles); }
		if (isSelecting) { updateSelectingHandGuide(canvas, tiles, objects); }
		updateKanDialogRect(canvas, tiles, objects.kanButton);
	};

	canvas.onevent = (ctx, x, y, startx, starty) => {
		if (config.isCityTableEnabled) {
			drawCityTableIfNeed(canvas, ctx, tiles, x, y, startx, starty);
		}
		if (Math.abs(x - startx) > 1) {
			const handRect = calcHandRect(canvas, tiles);
			const dragRect = calcHandRect(canvas, tiles, true);
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
			if (isSelecting) { selectingOnEvent(canvas, tiles, ctx, x, y, startx, starty); }
		}
	};

	canvas.onmouseup = (ctx, x, y, startx, starty) => {
		const handRect = calcHandRect(canvas, tiles);
		const dragRect = calcHandRect(canvas, tiles, true);
		for (let i = 0; i < handRect.length; i++) {
			if (ctx.isPointInPath(canvas.makePath({rect: handRect[i]}), startx, starty)) {
				for (let j = 0; j < dragRect.length; j++) {
					if (ctx.isPointInPath(canvas.makePath({rect: dragRect[j]}), x, y)) {
						tiles.replaceHand(i, j);
						canvas.update();
						return;
					};
				}
			}
		}
		if (isSelecting) { selectingOnMouseup(canvas, tiles, ctx, x, y, startx, starty); }
	};
	
	canvas.update();
};
