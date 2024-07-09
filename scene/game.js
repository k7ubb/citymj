const gameScene = (draw, handLength = 14) => {
	// 山牌
	const mountain = shuffle(structuredClone(TILES));

	// 手牌, 捨牌 { tile, draw, (最後尾のみ) moved }
	const hands = [];
	const trashes = [];
	
	// ドラ表示牌, ドラ牌
	const dora = [ createDora(draw, mountain) ];

	let junme = 0;

	const config = {
		showCitiesGuide: true,
		hogehoge: true
	};

	for (let i = 0; i < handLength; i++) {
		hands[i] = {
			tile: mountain.pop(),
			draw: {
				draw: function(ctx) { drawTile(ctx, this.path, hands[i].tile); },
				drawonhover: function(ctx) {
					ctx.fill(this.path, "rgba(255, 255, 255, .5)");
				},
				onclick: async function() {
					trashes[junme++].tile = hands[i].tile;
					hands[i].tile = {};
					if (junme == 18) {
						for (let o of draw.objects) {
							delete o.onclick;
						}
						draw.update();
					}
					else {
						draw.eventDisabled = true;
						for (let j = i; j < hands.length - 1; j++) {
							hands[j].tile = hands[j + 1].tile;
						}
						hands[hands.length - 1].tile = null;
						draw.update();
						await sleep(300);
						hands[hands.length - 1].tile = mountain.pop();
						delete hands[hands.length - 1].moved;
						updateHandsRect(hands);
						draw.update();
						draw.eventDisabled = false;
					}
				}
			}
		};
		draw.objects.push(hands[i].draw);
	}
	updateHandsRect(hands);

	for (let i = 0; i < 18; i++) {
		trashes[i] = {
			tile: {},
			draw: {
				path: RECT_TRASH[i],
				draw: function(ctx) { drawTile(ctx, this.path, trashes[i].tile); },
			}
		}
		draw.objects.push(trashes[i].draw);
	}

	Object.keys(config).forEach((key, index) => {
		draw.objects.push({
			path: xy2rect(13, 1 + index * .4, 2.5, .4),
			square: xy2rect(13.1, 1.1 + index * .4, .2, .2),
			draw: function(ctx) {
				ctx.fill(this.square, config[key]? "#88f" : "#fff");
				ctx.stroke(this.square, "#000");
				ctx.drawText(({
					showCitiesGuide: "完成した市町村を表示",
				}[key]), 13.4, 1.2 + index * .4, {valign: "middle", size: .2});
				if (config[key]) {
					ctx.drawText("✔︎", 13.11, 1.19 + index * .4, {valign: "middle", size: .2});
				}
			},
			drawonhover: function(ctx) {
				ctx.fill(this.path, "rgba(0, 0, 0, .1");
			},
			onclick: function() {
				config[key] = !config[key];
				draw.update();
			}
		});
	});

	draw.onupdate = (ctx) => {
		drawGrid(ctx);
		
		if (config.showCitiesGuide) {
			const cities = getCitiesInHand(hands);
			drawCitiesGuide(ctx, hands, cities);
		}
	};

	draw.onevent = (ctx, x, y, startx, starty) => {
		if (!draw.isClick || Math.abs(x - startx) < 1) { return; }
		const rect = getReplaceTileRect(hands);
		for (let i = 0; i < hands.length; i++) {
			if (ctx.isPointInPath(hands[i].draw.path, startx, starty)) {
				drawTile(ctx, xy2rect(x - 0.4, 6.5, 0.8, 1.2), hands[i].tile);
				for (let j = 0; j < rect.length; j++) {
					if (i !== j && i + 1 !== j && ctx.isPointInPath(rect[j], x, y)) {
						const _x = (rect[j][0][0] + rect[j][2][0]) / 2;
						const _y = hands[i].draw.path[0][1];
						ctx.fill([ [_x, _y-.2], [_x-.2, _y-.48], [_x+.2, _y-.48]], "#cc0");
						return;
					}
				}
			}
		}
	};

	draw.onmouseup = (ctx, x, y, startx, starty) => {
		const rect = getReplaceTileRect(hands);
		for (let i = 0; i < hands.length; i++) {
			if (ctx.isPointInPath(hands[i].draw.path, startx, starty)) {
				for (let j = 0; j < rect.length; j++) {
					if (ctx.isPointInPath(rect[j], x, y)) {
						replaceTile(hands, i, j, handLength);
						updateHandsRect(hands);
						draw.update();
						return;
					};
				}
			}
		}
	};
};



/* ------------------------ */

const createDora = (draw, mountain) => {
	const dora = [{
		tile: mountain.pop(),
		draw: {
			path: xy2rect(.5, 1, .6, .6 * 4/3),
			draw: function(ctx) { 
				ctx.drawText("ドラ表示", .8, 0.8, {size: .15, style: "bold", align: "center"});
				ctx.drawText("ドラ", 1.51, 0.8, {size: .15, style: "bold", align: "center"});
				drawTile(ctx, this.path, dora[0].tile);
			}	
		}
	}];
	draw.objects.push(dora[0].draw);
	const doras = DORA[dora[0].tile.character];
	if (dora) {
		for (let i = 0; i < doras?.length; i++) {
			dora[i + 1] = {
				tile: { ...TILES.filter(x => x.character === doras[i])[0], red: false },
				draw: {
					path: xy2rect(1.2 + i * .62, 1, .6, .6 * 4/3),
					draw: function(ctx) { 
						drawTile(ctx, this.path, dora[i + 1].tile);
					}	
				}
			};
			draw.objects.push(dora[i + 1].draw);
		}
	}
	else{
		draw.objects.push({
			draw: function(ctx) {
				ctx.drawText("なし", 1.5, 1.4, {size: .15, align: "center", valign: "middle"})
			}
		});
	}
	return dora;
};

const drawTile = (ctx, path, tile) => {
	if (!tile?.character) { return; }
	const { pos, size } = pathToXY(path);
	ctx.fill(path, "#fff");
	ctx.stroke(path, "#000", {width: ctx.pixel, radius: size * .03});
	ctx.drawText(tile.count, pos[0], pos[1] - size * .4, {size: size * .3, color: "#88f", font: "serif", align: "center", valign: "middle"});
	ctx.drawText(tile.character, pos[0], pos[1] + size * .2, {size: size * .8, font: "serif", align: "center", valign: "middle", ...(tile.red && { color: "#f00"})});
};

const getCitiesInHand = (hands) => {
	const cities = [];
	for (let i = 0; i < hands.length; i++) {
		for (let city of CITIES) {
			for (let k = 0; k < city.name.length; k++) {
				if (hands[i + k]?.tile?.character !== city.name[k]) { break; }
				if (k === city.name.length - 1) {
					cities.push({
						city,
						position: i,
						length: city.name.length
					});
				}
			}
		}
	}
	return cities;
};

const drawCitiesGuide = (ctx, hands, cities) => {
	const count = Array(hands.length).fill(0);
	const already = [];
	for (let city of cities) {
		if (already.includes(city.city.name)) { continue; }
		already.push(city.city.name);
		const pos = Math.max(...count.slice(city.position, city.position + city.length));
		ctx.fill([
			[hands[city.position].draw.path[1][0] + .1, hands[city.position].draw.path[1][1] + .15 * pos + .1],
			[hands[city.position].draw.path[1][0] + .1, hands[city.position].draw.path[1][1] + .15 * pos + .15],
			[hands[city.position + city.length - 1].draw.path[2][0] - .1, hands[city.position + city.length - 1].draw.path[2][1] + .15 * pos + .15],
			[hands[city.position + city.length - 1].draw.path[2][0] - .1, hands[city.position + city.length - 1].draw.path[2][1] + .15 * pos + .1],
		], "#f00", .025);
		for (let i = 0; i < city.length; i++) {
			count[city.position + i]++;
		}
	}
};

const updateHandsRect = (hands) => {
	for (let i = 0; i < hands.length; i++) {
		hands[i].draw.path = xy2rect((16 - hands.length) / 2 - 0.1 + i, 7, .99, 1 * 4/3);
	}
	if (!hands[hands.length - 1].moved) {
		hands[hands.length - 1].draw.path = hands[hands.length - 1].draw.path.map(x => [x[0] + 0.2, x[1]]);
	}
};

const getReplaceTileRect = (hands) => {
	const rect = [];
	const moved = hands[hands.length - 1].moved;
	let r;
	for (let i = 0; i < hands.length - 1; i++) {
		r = hands[i].draw.path;
		rect.push(xy2rect(r[0][0] - .5, r[0][1] - .5, 1, 1 * 4/3 + 1));
	}
	r = hands[hands.length - 1].draw.path;
	rect.push(xy2rect(r[0][0] - (moved? .5 : .6), r[0][1] - .5, 1, 1 * 4/3 + 1));
	rect.push(xy2rect(r[3][0] - 0.5, r[3][1] - .5, 1, 1 * 4/3 + 1));
	return rect;
};

const pathToXY = (path) => {
	const [x, y] = [ (path[0][0] + path[2][0]) / 2, (path[0][1] + path[2][1]) / 2 ];
	const size = Math.min(path[2][0] - path[0][0], path[2][1] - path[0][1]);
	return { pos: [x, y], size };
};

const replaceTile = (hands, x, y) => {
	if (x + 1 < y) {
		const _ = hands[x].tile;
		for (let i = x; i < y - 1; i++) {
			hands[i].tile = hands[i+1].tile;
		}
		hands[y-1].tile = _;
	}
	else if (x > y) {
		const _ = hands[x].tile;
		for (let i = x; i > y; i--) {
			hands[i].tile = hands[i-1].tile;
		}
		hands[y].tile = _;
	}
	if (x === hands.length - 1 || y === hands.length) {
		hands[hands.length - 1].moved = true;
	}
};

