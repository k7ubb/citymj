const scoreScene = (game, cities, config) => {
	$.reset();
	const {yaku, score} = findYaku(game, cities);
	let showCount = 0;
	
	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		drawScoreHands(cities);
		drawScoreCityNames(cities);
		drawScoreYaku(yaku, showCount);
		drawScoreDora(game.dora, game.uradora, game.kans.length + 1, game.reachCount !== -1);
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
				draw: function({hover}) {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#000"),
					$.ctx.bbText("Twitter (現𝕏)", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle", color: "#ccc"});
					if (hover) {
						$.ctx.bbFill(this.path, "rgba(255 255 255 / .3)");
					}
				},
				onClick: () => {
					const handStr = cities.flatMap(city => city.tiles).map(tile => tile.character).join("");
					open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(handStr)}%20%23%E5%B8%82%E7%94%BA%E6%9D%91%E9%BA%BB%E9%9B%80&url=https%3A%2F%2Fbb.xrea.jp%2Fcitymj%2F`);
				}
			});
			$.addItem({
				path: {
					rect: [1100, 560, 400, 80],
					radius: 40
				},
				draw: function({hover}) {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("画像を保存", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
					if (hover) {
						$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
					}
				},
				onClick: () => {
					const a = document.createElement("a");
					a.href =  $.ctx.canvas.toDataURL("png");
					a.download = "image.png";
					a.click();
				}
			});
			$.addItem({
				path: {
					rect: [1100, 660, 400, 80],
					radius: 40
				},
				draw: function({hover}) {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("もう一度遊ぶ", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
					if (hover) {
						$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
					}
				},
				onClick: () => gameScene(config)
			});
			$.addItem({
				path: { 
					rect: [1100, 760, 400, 80],
					radius: 40
				},
				draw: function({hover}) {
					const [x, y, w, h] = this.path.rect;
					$.ctx.bbFill(this.path, "#ccc"),
					$.ctx.bbText("メニューに戻る", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
					if (hover) {
						$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
					}
				},
				onClick: () => menuScene()
			});
		}
		$.update();
	};
	increment();
};
