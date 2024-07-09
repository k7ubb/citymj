const gameScene = (draw) => {
	const tiles = shuffle(structuredClone(TILES));
	const hands = [];
	const trashes = [];
	const dora = tiles.pop();

	draw.objects = [];
	for (let i=0; i<14; i++) {
		hands.push(tiles.pop());
		draw.objects.push({
			path: RECT_HAND[i],
			draw: function(ctx) { drawTile(ctx, this.path, hands[i]); },
			drawonhover: function(ctx) {
				ctx.fill(this.path, "rgba(255, 255, 255, .5)");
			},
			onclick: async function() {
				draw.eventDisabled = true;
				trashes.push({ ...hands[i], disabled: undefined });
				for (let j=i; j<13; j++) {
					hands[j] = hands[j + 1];
				}
				hands[13] = null;
				draw.update();
				await sleep(300);
				hands[13] = tiles.pop();
				for (let j=i; j<14; j++) {
					hands[j] = { ...hands[j], disabled: undefined };
				}
				draw.update();
				draw.eventDisabled = false;
			}
		});
	}
	for (let i=0; i<18; i++) {
		trashes.push(tiles.pop());
		draw.objects.push({
			path: RECT_TRASH[i],
			draw: function(ctx) { drawTile(ctx, this.path, trashes[i]); },
		});
	}
	draw.objects.push({
		path: draw.rect(0.5, 1, 0.8, 1.2),
		draw: function(ctx) { drawTile(ctx, this.path, dora)}	
	})
	draw.update();

	draw.onupdate = (ctx) => {
		drawGrid(ctx);
	};

	draw.onevent = (ctx, x, y, startx, starty) => {
		for (let j=0; j<RECT_SORT.length; j++) {
			const _x = (RECT_SORT[j][0][0] + RECT_SORT[j][2][0]) / 2;
			const _y = RECT_HAND[0][0][1];
			ctx.fill(RECT_SORT[j], "#f00");
			ctx.fill([ [_x, _y-.2], [_x-.2, _y-.48], [_x+.2, _y-.48]], "#cc0");
		}
		
		if (!draw.isClick) { return; }
		for (let i=0; i<RECT_HAND.length; i++) {
			if (ctx.isPointInPath(RECT_HAND[i], startx, starty)) {
				hands[i].disabled = true;
				draw.update();
				drawTile(ctx, draw.rect(x - 0.4, 6.5, 0.8, 1.2), {...hands[i], disabled: undefined});
				for (let j=0; j<RECT_SORT.length; j++) {
					if (i !== j && i + 1 !== j && ctx.isPointInPath(RECT_SORT[j], x, y)) {
						const _x = (RECT_SORT[j][0][0] + RECT_SORT[j][2][0]) / 2;
						const _y = RECT_HAND[0][0][1];
						ctx.fill([ [_x, _y-.2], [_x-.2, _y-.48], [_x+.2, _y-.48]], "#cc0");
						return;
					}
				}
			}
		}
	};

	draw.onmouseup = (ctx, x, y, startx, starty) => {
		for (let i=0; i<RECT_HAND.length; i++) {
			if (ctx.isPointInPath(RECT_HAND[i], startx, starty)) {
				delete hands[i].disabled;
				for (let j=0; j<RECT_SORT.length; j++) {
					if (ctx.isPointInPath(RECT_SORT[j], x, y)) {
						sort(hands, i, j);
						draw.update();
						return;
					};
				}
			}
		}
	};
};

const drawTile = (ctx, path, tile) => {
	if (!tile || tile.disabled) { return; }
	ctx.fill(path, "#fff");
	ctx.stroke(path, "#000", {width: ctx.pixel});
	const { pos, size } = pathToXY(path);
	ctx.drawText(tile.count, pos[0], pos[1] - size * .4, {size: size * .3, color: "#88f", font: "serif", align: "center", valign: "middle"});
	ctx.drawText(tile.character, pos[0], pos[1] + size * .2, {size: size * .8, font: "serif", align: "center", valign: "middle"});
};

const pathToXY = (path) => {
	const [x, y] = [ (path[0][0] + path[2][0]) / 2, (path[0][1] + path[2][1]) / 2 ];
	const size = Math.min(path[2][0] - path[0][0], path[2][1] - path[0][1]);
	return { pos: [x, y], size };
};

const sort = (hands, x, y) => {
	if (x + 1 < y) {
		const _ = hands[x];
		for (let i = x; i < y - 1; i++) {
			hands[i] = hands[i+1];
		}
		hands[y-1] = _;
	}
	else if (x > y) {
		const _ = hands[x];
		for (let i = x; i > y; i--) {
			hands[i] = hands[i-1];
		}
		hands[y] = _;
	}
};
