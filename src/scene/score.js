const scoreScene = (game, cities, config) => {
	$.reset();
	const {yaku, score} = findYaku(game, cities);
	let showCount = 0;
	
	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		drawCityHands(cities);
		drawCityNames(cities);
		drawYaku(yaku, showCount);
		drawDora2(game.dora, game.uradora, game.kans.length + 1, game.reachCount !== -1);
		if (showCount === yaku.length) {
			$.ctx.bbText(`${score.text}`, 500, 800, {size: 40});
			$.ctx.bbText(`${score.point}点`, 700, 760, {size: 80, color: score.isYakuman? "#f00" : COLOR_STRONG});
		}
		$.ctx.bbFill({rect: [450, 180, 2, 680]}, COLOR_STRONG);
	};

	const increment = () => {
		showCount++;
		if (showCount < yaku.length) {
			setTimeout(increment, 1000);
		}
		else {
			$.addItem({
				path: {
					rect: [1100, 460, 400, 80],
					radius: 40
				},
				draw: function() {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#000"),
					$.ctx.bbText("Twitter (現𝕏)", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle", color: "#ccc"});
				},
				onClick: () => {
					const handStr = cities.flatMap(city => city.tiles).map(tile => tile.character).join("");
					open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(handStr)}%20%23%E5%B8%82%E7%94%BA%E6%9D%91%E9%BA%BB%E9%9B%80&url=https%3A%2F%2Fbb.xrea.jp%2Fcitymj%2F`);
				},
				onHover: function() { $.ctx.bbFill(this.path, "rgba(255 255 255 / .3)"); }
			});
			$.addItem({
				path: {
					rect: [1100, 560, 400, 80],
					radius: 40
				},
				draw: function() {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("画像を保存", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => {
					const a = document.createElement("a");
					a.href =  $.ctx.canvas.toDataURL("png");
					a.download = "image.png";
					a.click();
				},
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			});
			$.addItem({
				path: {
					rect: [1100, 660, 400, 80],
					radius: 40
				},
				draw: function() {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("もう一度遊ぶ", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => gameScene(config),
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			});
			$.addItem({
				path: { 
					rect: [1100, 760, 400, 80],
					radius: 40
				},
				draw: function() {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("メニューに戻る", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
				},
				onClick: () => menuScene(),
				onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
			});
		}
		$.update();
	};
	increment();
};

const drawCityHands = (cities) => {
	const HAND_W = 80;
	const GAP = 10;
	const tile_length = cities.reduce((a, b) => a + b.tiles.length, 0);
	const start_x = (1600 - HAND_W * tile_length - GAP * (cities.length - 1)) / 2;
	
	let nth_tile = 0;
	for (let i = 0; i < cities.length; i++) {
		for (let j = 0; j < cities[i].tiles.length; j++) {
			drawTile([
				start_x + HAND_W * nth_tile + GAP * i,
				50,
				HAND_W,
			], cities[i].tiles[j]);
			nth_tile++;
		}
	}
};

const drawCityNames = (cities) => {
	const NAME_X = 100;
	const NAME_Y = 200;
	const NAME_SIZE = 40;
	for (let i = 0; i < cities.length; i++) {
		$.ctx.bbText(`${cities[i].pref}${cities[i].name}${cities[i].category}`, NAME_X, NAME_Y + i * (NAME_SIZE * 1.5), {size: NAME_SIZE});
	}
};

const drawYaku = (yaku, count) => {
	const YAKU_X = 500;
	const YAKU_Y = 200;
	const YAKU_SIZE = 40;
	for (let i = 0; i < count; i++) {
		$.ctx.bbText(yaku[i].point, YAKU_X, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
		$.ctx.bbText(`${yaku[i].name}`, YAKU_X + 150, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
	}
};

const drawDora2 = (dora, uradora, doraCount, isReached) => {
	for (let i = 0; i < 5; i++) {
		if (!isReached && 0) {
			drawTile([1200 + 60 * i, 220, 59], uradora[i].tile, {perspective: "ura"});
		} else {
			drawTile([1200 + 60 * i, 300, 59], uradora[i].tile, {perspective: i < doraCount? "down" : "ura"});
		}
		drawTile([1200 + 60 * i, 200, 59], dora[i].tile, {perspective: i < doraCount? "down" : "ura"});
	}
	
/*
	dora = dora.filter((d, i) => i < doraCount && d.char);
	if (dora.length) {
		const maxWidth = dora.reduce((a, b) => Math.max(a, b.char.length), 0);
		$.ctx.bbStroke({rect: [80, 182, 24 + 60 * maxWidth, 60 + 84 * dora.length]}, {color: COLOR_STRONG, width: 2});
		$.ctx.bbText("ドラ", 90, 192, {size: 30, color: COLOR_STRONG, style: "bold"})
		for (let i = 0; i < dora.length; i++) {
			for (let j = 0; j < dora[i].char.length; j++) {
				const tile = { ...TILES.filter(tile => tile.character === dora[i].char[j])[0], red: false };
				drawTile([60 * j + 90, 84 * i + 232, 59], tile);
			}
		}
	} else {
		$.ctx.bbStroke({rect: [80, 182, 144, 120]}, {color: COLOR_STRONG, width: 2});
		$.ctx.bbText("ドラ", 90, 192, {size: 30, color: COLOR_STRONG, style: "bold"})
		$.ctx.bbText("なし", 90, 232, {size: 60, color: COLOR_STRONG});
	}
*/
};

