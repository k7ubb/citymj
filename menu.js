"use strict";

const menuScene = () => {
	$.reset();
	
	$.addItem([14, 11, 8].map((handLength, i) => $.item({
		rect: [400, 450 + 120 * i, 800, 100],
		radius: 50,
		draw: function() {
			$.ctx.bbFill(this.path, "#eee");
			$.ctx.bbText(`手牌${handLength}枚で遊ぶ`, 800, 500 + 120 * i, {size: 50, align: "center", baseline: "middle"});
		},
		onHover: function() {
			$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
		},
		onClick: function() {
			gameScene({handLength, isHandGuideEnabled: false, isCityTableEnabled: false});
		}
	})));
	
	$.draw = () => {
		$.ctx.bbFill($.path({rect: [0, 0, 1600, 900]}), COLOR_BACKGROUND);
		$.ctx.bbText("市町村麻雀", 800, 150, {size:200, align: "center", baseline: "top", style: "bold", color: COLOR_STRONG});
	};
	
	$.update();
};
