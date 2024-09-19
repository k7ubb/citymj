const scoreScene = (tiles, cities, configToHandOver) => {
	$.reset();
	const yaku = findYaku(tiles, cities);
	let showCount = 1;

	$.addItem([
		new Item({
			disabled: () => $.eventDisabled,
			rect: [1100, 460, 400, 80],
			radius: 40,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#000"),
				$.ctx.bbText("Twitter (現𝕏)", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle", color: "#ccc"});
			},
			onClick: () => {
				const handStr = cities.flatMap(city => city.tiles).map(tile => tile.character).join("");
				open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(handStr)}%20%23%E5%B8%82%E7%94%BA%E6%9D%91%E9%BA%BB%E9%9B%80&url=https%3A%2F%2Fbb.xrea.jp%2Fcitymj%2F`);
			},
			onHover: function() { $.ctx.bbFill(this.path, "rgba(255 255 255 / .3)"); }
		}),
		new Item({
			disabled: () => $.eventDisabled,
			rect: [1100, 560, 400, 80],
			radius: 40,
			draw: function() {
				const [x, y, w, h] = this.rect;
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
		}),
		new Item({
			disabled: () => $.eventDisabled,
			rect: [1100, 660, 400, 80],
			radius: 40,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc"),
				$.ctx.bbText("もう一度遊ぶ", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
			},
			onClick: () => gameScene(configToHandOver),
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		}),
		new Item({
			disabled: () => $.eventDisabled,
			rect: [1100, 760, 400, 80],
			radius: 40,
			draw: function() {
				const [x, y, w, h] = this.rect;
				$.ctx.bbFill(this.path, "#ccc"),
				$.ctx.bbText("メニューに戻る", x + w / 2, y + 40, {size: 50, align: "center", baseline: "middle"});
			},
			onClick: () => menuScene(),
			onHover: function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); }
		})
	]);
	$.eventDisabled = true;

	$.draw = () => {
		$.ctx.bbFill($.path({rect: [0, 0, 1600, 900]}), COLOR_BACKGROUND);
		drawCityHands(cities);
		drawCityNames(cities);
		drawYaku(yaku, showCount, () => { showCount++; });
		drawScore( yaku, showCount);
		$.ctx.bbFill($.path({rect: [450, 180, lineWidth * 2, 680]}), COLOR_STRONG)
	};

	$.update();
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
				HAND_W * 4 / 3
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

const drawYaku = ({isYakuman, yaku}, count, increment) => {
	const YAKU_X = 500;
	const YAKU_Y = 200;
	const YAKU_SIZE = 40;
	if (isYakuman) {
		for (let i = 0; i < count; i++) {
			$.ctx.bbText(yaku[i].point === 1? "役満" : "W役満", YAKU_X, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
			$.ctx.bbText(`${yaku[i].name}`, YAKU_X + 150, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
		}
	}
	else {
		for (let i = 0; i < count; i++) {
			$.ctx.bbText(`${yaku[i].point}翻`, YAKU_X, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
			$.ctx.bbText(`${yaku[i].name}`, YAKU_X + 100, YAKU_Y + i * (YAKU_SIZE * 1.5), {size: YAKU_SIZE});
		}
	}
	if (count < yaku.length) {
		setTimeout(() => {
			increment();
			$.update();
		}, 1000);
	}
	else {
		setTimeout(() => {
			$.eventDisabled = false;
			$.update();
		}, 1000)
	}
};

const drawScore = ({isYakuman, yaku}) => {
	if ($.eventDisabled) { return; }
	let scoreCount = yaku.reduce((a, b) => a + b.point, 0);
	if (scoreCount >= 13) {
		scoreCount = 1;
		isYakuman = true;
	}
	const score = isYakuman
		? 32000 * scoreCount
		:	[1000, 2000, 4000, 8000, 8000, 12000, 12000, 16000, 16000, 16000, 24000, 24000][scoreCount - 1];
	const SCORE_X = 500;
	const SCORE_Y = 760;
	const SCORE_SIZE = 80;
	$.ctx.bbText(isYakuman? "役満" : `${scoreCount}翻`, SCORE_X, SCORE_Y + 40, {size: SCORE_SIZE / 2});
	$.ctx.bbText(`${score}点`, SCORE_X + 200, SCORE_Y, {size: SCORE_SIZE, color: isYakuman? "#f00" : COLOR_STRONG});
};

const findYaku = (tiles, cities) => {
	const prefCounts = {};
	const prefs = cities.map(city => city.pref);
	const prefsInHonshu = ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県']
	for (let pref of prefs) {
    if (!(pref in prefCounts)) { prefCounts[pref] = 1; }
    else { prefCounts[pref]++; }
	}
	const maxRenpaku = Math.max(...Object.values(prefCounts));
	const maxRenpakuPref = Object.keys(prefCounts).filter(pref => prefCounts[pref] === maxRenpaku).join(",");

	const doraChar = [];
	for (let i = 0; i < tiles.kans.length + 1; i++) {
		doraChar.push(...( tiles.dora[i].char || []) );
		if (tiles.reached) { doraChar.push(...(tiles.uradora[i].char || [])); } 
	}
	const allTiles = [...tiles.hand, ...tiles.kans.flat()];
	const doraCount = allTiles.filter(tile => doraChar.includes(tile.character)).length + allTiles.filter(tile => tile.red).length;

	const yakuman = [];
	if (cities.filter(city => city.seirei).length >= 5) {
		if (cities.filter(city => !city.seirei).length === 0) {
			yakuman.push({name: "清政令", point: 2});
		}
		else {
			yakuman.push({name: "五政令", point: 1});
		}
	}
	if (cities.filter(city => !city.kento).length === 0) {
		yakuman.push({name: "清県都", point: 1});
	}
	if (cities.filter(city => city.ritou).length >= 5) {
		if (cities.filter(city => !city.ritou).length === 0) {
			yakuman.push({name: "清離島", point: 2});
		}
		else {
			yakuman.push({name: "五離島", point: 1});
		}
	}
	if (cities.filter(city => city.name.length === 4).length === 3) {
		yakuman.push({name: "三槓子", point: 1});
	}
	if (cities.filter(city => city.name.length === 3).length === 4) {
		yakuman.push({name: "四面子", point: 1});
	}
	if (cities.filter(city => city.name.length === 4).length === 4) {
		yakuman.push({name: "四槓子", point: 2});
	}
	if (Object.keys(prefCounts).length === 1) {
		yakuman.push({name: "清連泊", point: 1});
	}

	const yaku = [];
	if (tiles.count === 0 && !tiles.isRinshan) {
		yaku.push({name: "天和", point: 4});
	}
	if (tiles.reached) {
		if (tiles.reactCount === 0) {
			yaku.push({name: "二立直", point: 2});
		}
		else {
			yaku.push({name: "立直", point: 1});
		}
	}
	if (tiles.isRinshan) {
		yaku.push({name: "嶺上", point: 1});
	}
	else {
		if (tiles.count === tiles.reachCount + 1) {
			yaku.push({name: "一発", point: 1});
		}
		if (tiles.count === MAX_COUNT - 1) {
			yaku.push({name: "海底", point: 1});
		}
	}
	yaku.push({name: "自摸", point: 1});
	if (cities.filter(city => city.seirei).length === 2) {
		yaku.push({name: "二政令", point: 1});
	}
	if (maxRenpaku === 2) {
		yaku.push({name: `連泊 (${maxRenpakuPref})`, point: 1});
	}
	if (cities.filter(city => city.category !== "市").length === 0) {
		yaku.push({name: "全市", point: 1});
	}

	if (cities.filter(city => city.kento).length === 3) {
		yaku.push({name: "三県都", point: 2});
	}
	if (cities.filter(city => city.name.length === 3).length === 2) {
		yaku.push({name: "二面子", point: 2});
	}
	if (maxRenpaku === 3) {
		yaku.push({name: `三連泊 (${maxRenpakuPref})`, point: 2});
	}
	if (cities.filter(city => city.category !== "町").length === 0) {
		yaku.push({name: "全町", point: 2});
	}

	if (cities.filter(city => city.seirei).length === 3) {
		yaku.push({name: "三政令", point: 3});
	}
	if (cities.filter(city => city.ritou).length === 3) {
		yaku.push({name: "三離島", point: 3});
	}
	if (cities.filter(city => city.name.length === 4).length === 1) {
		yaku.push({name: "一槓子", point: 3});
	}

	if (cities.filter(city => city.kento).length === 4) {
		yaku.push({name: "四県都", point: 4});
	}
	if (cities.filter(city => city.name.length === 3).length === 3) {
		yaku.push({name: "三面子", point: 4});
	}
	if (maxRenpaku === 4) {
		yaku.push({name: `四連泊 (${maxRenpakuPref})`, point: 4});
	}
	if (cities.filter(city => prefsInHonshu.includes(city.pref)).length === 0) {
		yaku.push({name: "断本州", point: 4});
	}
	if (cities.filter(city => city.category !== "村").length === 0) {
		yaku.push({name: "全村", point: 4});
	}

	if (cities.filter(city => city.seirei).length >= 4) {
		yaku.push({name: "四政令", point: 6});
	}
	if (cities.filter(city => city.kento).length >= 5) {
		yaku.push({name: "五県都", point: 6});
	}
	if (cities.filter(city => city.ritou).length >= 4) {
		yaku.push({name: "四離島", point: 3});
	}
	if (cities.filter(city => city.name.length === 4).length === 2) {
		yaku.push({name: "二槓子", point: 3});
	}
	if (maxRenpaku >= 5) {
		yaku.push({name: `五連泊 (${maxRenpakuPref})`, point: 6});
	}
	if (doraCount) {
		yaku.push({name: `ドラ ${doraCount}`, point: doraCount});
	}

	// 地一色: 未実装
	if (yakuman.length) { return { isYakuman: true, yaku: yakuman }; }
	else { return { isYakuman: false, yaku }; }
};
