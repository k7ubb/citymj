"use strict";

const menuScene = () => {
	$.reset();
	
	let config = {
		handLength: 14,
		showHandGuide: true,
		showCityTable: true,
		restrictRule: false,
	};
	
	$.addItem([14, 11, 8].map((value, i) => new RadioButton({
		center: {x: 570 + 260 * i, y: 400},
		value,
		get: () => config.handLength,
		set: (value) => config.handLength = value,
		label: `${value}枚`
	})));

	$.addItem([true, false].map((value, i) => new RadioButton({
		center: {x: 570 + 260 * i, y: 500},
		value,
		get: () => config.showHandGuide,
		set: (value) => config.showHandGuide = value,
		label: ["ON", "OFF"][i]
	})));
	
	$.addItem([true, false].map((value, i) => new RadioButton({
		center: {x: 570 + 260 * i, y: 600},
		value,
		get: () => config.showCityTable,
		set: (value) => config.showCityTable = value,
		label: ["ON", "OFF"][i]
	})));

	$.addItem([true, false].map((value, i) => new RadioButton({
		center: {x: 700 + 260 * i, y: 700},
		value,
		get: () => config.restrictRule,
		set: (value) => config.restrictRule = value,
		label: ["ON", "OFF"][i]
	})));

	$.addItem(new Button({
		rect: [400, 770, 800, 100],
		value: "START",
		onClick: () => gameScene(config, true)
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
