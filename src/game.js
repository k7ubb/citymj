const gameScene = (canvas, initialHandLength = 14, showHandGuide = true) => {
	const tiles = new GameTiles(initialHandLength);
	let drawObjects;

	let config = {
		initialHandLength,
		showHandGuide
	}
	let flags = {
		reach: false,
	};

	const updatedrawObjects = () => {
		drawObjects = {};
		drawObjects.hand = calcHandRect(canvas, tiles, 0).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.hand[i], "up"); },
			drawonhover: function(ctx) { ctx.fill(this.path, "rgba(0 0 0 / .1)"); },
			onclick: async function(ctx, x, y, startx, starty, time) {
				if (time > 1000) { return; }
				try {
					if (flags.reach) {
						tiles.cutHand(i, true);
						updatedrawObjects();
						canvas.update();
						flags.reach = false;
					}
					else {
						tiles.cutHand(i);
					};
					canvas.update();
					canvas.eventDisabled = true;
					await sleep(300);
					try {
						tiles.tsumo();
						canvas.update();
						canvas.eventDisabled = false;
					} catch(e) {
						alert("終局");
					}
				} catch(e) {

				}
			}
		}));
		drawObjects.uradora = calcDoraRect(canvas, true).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.uradora[i].tile, "ura"); },
		}));
		drawObjects.dora = calcDoraRect(canvas).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.dora[i].tile, i < tiles.doraCount? "down" : "ura"); },
			drawonhover: function(ctx) { if (i < tiles.doraCount) drawDora(canvas, ctx, tiles.dora[i].char); },
		}));
		drawObjects.trash = calcTrashRect(canvas, tiles).map((rect, i) => ({
			path: canvas.makePath({ rect, radius: rect[2] * .05 }),
			draw: function(ctx) { drawTile(canvas, ctx, rect, tiles.trash[i], "down"); },
		}));
		drawObjects.kans = calcKansRect(canvas).map((rects, i) => ({
			draw: function(ctx) {
				if (tiles.kans[i]) {
					for (let j = 0; j < 4; j++) {
						drawTile(canvas, ctx, rects[j], tiles.kans[i][j]); 
					}
				}
			}
		}));
		drawObjects.kanButton = new Array(3).fill().map((_, i) => ({
			draw: function(ctx) { if (this.path) drawKanButton(canvas, ctx, this); },
			drawonhover: function(ctx) { if (this.path) drawKanButton(canvas, ctx, this, true); },
			onclick: async function() {
				tiles.kan(i);
				updatedrawObjects();
				canvas.update();
				canvas.eventDisabled = true;
				await sleep(300);
				try {
					tiles.tsumo();
					canvas.update();
					canvas.eventDisabled = false;
				} catch(e) {
					alert("終局");
				}
			}
		}));
		if (!tiles.reached) {
			drawObjects.reachButton = {
				title: "reachbutton",
				path: canvas.makePath({rect: [12.5, 5.2, 2.5, .8], radius: .4}),
				draw: function(ctx) { drawReachButton(canvas, ctx, flags); },
				onclick: function() {
					flags.reach = !flags.reach;
					canvas.update();
				},
				drawonhover: function(ctx) { ctx.fill(this.path, "rgba(0 0 0 / .1)"); },
			};
		}
		canvas.objects = [];
		for (let obj in drawObjects) {
			if (Array.isArray(drawObjects[obj])) {
				canvas.objects.push(...drawObjects[obj]);
			}
			else {
				canvas.objects.push(drawObjects[obj]);
			}
		}
	};
	updatedrawObjects();

	canvas.onupdate = (ctx) => {
		ctx.fill(canvas.makePath({rect: [0, 0, 16, 9]}), "#88f");
		drawGrid(canvas, ctx);
		drawCityGroup(canvas, ctx, tiles);
		updateKanDialogRect(canvas, tiles, drawObjects.kanButton);
	};

	canvas.onupdateFinally = (ctx) => {
		if (flags.reach) {
			ctx.fill(canvas.makePath({rect: [3.1, 3, 9.8, 2]}), "#f00");
			ctx.fill(canvas.makePath({rect: [3.2, 3.1, 9.6, 1.8]}), "#fff");
			ctx.drawText("テンパイしてなくてもリーチできますが、", 3.4, 3.3, {size: .5})
			ctx.drawText("リーチ後はツモ切りしかできません。", 3.4, 4, {size: .5})
		}
	}

	canvas.onevent = (ctx, x, y, startx, starty) => {
		if (!canvas.isClick || Math.abs(x - startx) < 1) { return; }
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
	};
	
	canvas.update();
};
