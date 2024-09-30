"use strict";

const menuScene = () => {
	$.reset();
	
	let config = {
		handLength: 14,
		showHandGuide: true,
		showCityTable: true,
		restrictRule: false,
	};
	
	$.addItem(...[14, 11, 8].map((value, i) => new RadioButton({
		center: {x: 570 + 260 * i, y: 400},
		value,
		get: () => config.handLength,
		set: (value) => config.handLength = value,
		label: `${value}枚`
	})));

	$.addItem(...[true, false].map((value, i) => new RadioButton({
		center: {x: 570 + 260 * i, y: 500},
		value,
		get: () => config.showHandGuide,
		set: (value) => config.showHandGuide = value,
		label: ["ON", "OFF"][i]
	})));
	
	$.addItem(...[true, false].map((value, i) => new RadioButton({
		center: {x: 570 + 260 * i, y: 600},
		value,
		get: () => config.showCityTable,
		set: (value) => config.showCityTable = value,
		label: ["ON", "OFF"][i]
	})));

	$.addItem(...[true, false].map((value, i) => new RadioButton({
		center: {x: 700 + 260 * i, y: 700},
		value,
		get: () => config.restrictRule,
		set: (value) => config.restrictRule = value,
		label: ["ON", "OFF"][i]
	})));

	$.addItem(new Button({
		rect: [400, 770, 800, 100],
		value: "START",
		onClick: () => gameScene(config)
	}));

	$.addItem(new InfoButton({
		center: {x: 250, y: 500},
		radius: 20,
		dialogRect: [450, 250, 700, 400],
		dialogDraw: () => {
			$.ctx.bbText("手牌中の市町村を表示します", 350, 80, {size: 40, align: "center"});
			[
				{ character: "山", count: 38 },
				{ character: "十", count: 4 },
				{ character: "津", count: 31 },
				{ character: "川", count: 61 },
				{ character: "上", count: 25 }
			].map((tile, i) => {
				drawTile([150 + 82 * i, 190, 81], tile, {perspective: "up"});
			});
			[
				{line: 0, position: 1, length: 3},
				{line: 1, position: 2, length: 1},
				{line: 1, position: 3, length: 2}
			].map((data) => {
				$.ctx.bbFill({
					rect: [
						150 + 82 * data.position + 8.2,
						303 + data.line * 8.2,
						82 * data.length - 16.4,
						4.1,
					],
					radius: 2
				}, "#f00");
			});
		}
	}));

	$.addItem(new InfoButton({
		center: {x: 250, y: 600},
		radius: 20,
		dialogRect: [450, 200, 700, 500],
		dialogDraw: () => {
			$.ctx.bbText("牌を含む市町村の一覧を表示します", 350, 80, {size: 40, align: "center"});
			const start_x = 260;
			const start_y = 150;
			const TEXT_SIZE = 26;
			$.ctx.bbFill({rect: [start_x - 13, start_y - 13, 180 + 26, TEXT_SIZE * 1.5 * 4 + 12]}, COLOR_STRONG);
			$.ctx.bbFill({rect: [start_x - 10, start_y - 10, 180 + 20, TEXT_SIZE * 1.5 * 4 + 6]}, "#fff");
			["新十津川町", "十和田市", "十津川村", "十島村"].map((city, i) => {
				$.ctx.bbText(city, start_x, start_y + i * TEXT_SIZE * 1.5, {size: TEXT_SIZE});
			});
			[
				{ character: "山", count: 38 },
				{ character: "十", count: 4 },
				{ character: "津", count: 31 },
				{ character: "川", count: 61 },
				{ character: "上", count: 25 }
			].map((tile, i) => {
				drawTile([150 + 82 * i, 350, 81], tile, {perspective: "up"});
			});
			$.ctx.bbFill({rect: [232, 350, 81, 108]}, "rgba(0 0 0 / .1)");
			drawCursor(280, 430, 2);
		}
	}));
	
	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		$.ctx.bbText("市町村麻雀", 800, 80, {size: 200, align: "center", baseline: "top", style: "bold", color: COLOR_STRONG});
		$.ctx.bbText(VERSION, 1000, 280, {size: 30, baseline: "top", style: "bold", color: COLOR_STRONG});
		
		$.ctx.bbText("牌の枚数:", 300, 400, {color: "#000", size: 40, baseline: "middle"});
		$.ctx.bbText("手牌ガイド:", 300, 500, {color: "#000", size: 40, baseline: "middle"});
		$.ctx.bbText("市町村一覧:", 300, 600, {color: "#000", size: 40, baseline: "middle"});
		$.ctx.bbText("くっつき待ち制限:", 300, 700, {color: "#000", size: 40, baseline: "middle"});
	};
	
	$.update();
};
