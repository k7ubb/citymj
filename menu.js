"use strict";

const menuScene = () => {
	$.reset();
	
	let config = {
		handLength: 14,
		showHandGuide: true,
		showCityTable: true,
		restrictRule: false,
	};
	
	class RadioButton extends Item {
		constructor({center, value, get, set, label} = {}) {
			const width = $.ctx.bbMeasureText(label, {size: 50});
			super({
				rect: [center.x - 30, center.y - 30, 80 + width, 60],
				radius: 30,
				draw: function() {
					$.ctx.bbText(label, center.x + 40, center.y, {size: 50, baseline: "middle"});
					$.ctx.bbFill(new Path({center, radius: 30}), "#eee");
					if (get() === value) {
						$.ctx.bbFill(new Path({center, radius: 26}), "#fcc");
						$.ctx.bbStroke(new Path({
							points: [
								[center.x + 40, center.y + 30],
								[center.x + 40 + width, center.y + 30]
							]
						}), {width: 2})
					}
				},
				onHover: function() { $.ctx.bbFill(new Path({center, radius: 26}), "rgba(0 0 0 / .3)"); },
				onClick: () => { 
					set(value);
					$.update();
				}
			});
		}
	}

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

	$.addItem([false].map((value, i) => new RadioButton({
		center: {x: 700 + 260 * i, y: 700},
		value,
		get: () => config.restrictRule,
		set: (value) => config.restrictRule = value,
		label: "OFF"
	})));

	$.addItem(new Item({
		rect: [400, 770, 800, 100],
		radius: 50,
		draw: function() {
			$.ctx.bbFill(this.path, "#eee");
			$.ctx.bbText("START", 800, 820, {size: 50, align: "center", baseline: "middle"});
		},
		onHover: function() {
			$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
		},
		onClick: function() {
			gameScene(config, true);
		}
	}));

	$.draw = () => {
		$.ctx.bbFill(new Path({rect: [0, 0, 1600, 900]}), COLOR_BACKGROUND);
		$.ctx.bbText("市町村麻雀", 800, 80, {size: 200, align: "center", baseline: "top", style: "bold", color: COLOR_STRONG});
		$.ctx.bbText(VERSION, 1000, 280, {size: 30, baseline: "top", style: "bold", color: COLOR_STRONG});

		$.ctx.bbText("牌の枚数:", 300, 400, {color: "#000", size: 40, baseline: "middle"});
		$.ctx.bbText("手牌ガイド:", 300, 500, {color: "#000", size: 40, baseline: "middle"});
		$.ctx.bbText("市町村一覧:", 300, 600, {color: "#000", size: 40, baseline: "middle"});
		$.ctx.bbText("くっつき待ち制限:", 300, 700, {color: "#000", size: 40, baseline: "middle"});
	};
	
	$.update();
};
