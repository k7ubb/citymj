"use strict";

const menuScene = () => {
	$.reset();

	$.addItem([14, 11, 8].map((handLength, i) => $.item({
		rect: [4, 4.5 + 1.2 * i, 8, 1],
		radius: .5,
		draw: function() {
			$.ctx.bbFill(this.path, "#eee");
			$.ctx.bbText(`手牌${handLength}枚で遊ぶ`, 8, 5 + 1.2 * i, {size: .5, align: "center", valign: "middle"});
		},
		onHover: function() {
			$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
		},
		onClick: function() {
			gameScene({initialHandLength: handLength});
		}
	})));

	$.draw = () => {
		$.ctx.bbFill($.makePath({rect: [0, 0, 16, 9]}), COLOR_BACKGROUND);
		$.ctx.bbText("市町村麻雀", 8, 1.5, {size:2, align: "center", style: "bold", color: COLOR_STRONG});
	};

	$.update();
};
