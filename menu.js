const menuScene = (canvas) => {
	canvas.objects = [14, 11, 8].map((handLength, i) => ({
		path: canvas.makePath({rect: [4, 4.5 + 1.2 * i, 8, 1], radius: .5}),
		draw: function(ctx) {
			ctx.fill(this.path, "#eee");
			ctx.drawText(`手牌${handLength}枚で遊ぶ`, 8, 5 + 1.2 * i, {size: .5, align: "center", valign: "middle"});
		},
		drawonhover: function(ctx) { drawonhover(ctx, this.path); },
		onclick: function() { gameScene(canvas, {initialHandLength: handLength}); }
	}));

	canvas.onupdate = (ctx) => {
		ctx.fill(canvas.makePath({rect: [0, 0, 16, 9]}), COLOR_BACKGROUND);
		ctx.drawText("市町村麻雀", 8, 1.5, {size:2, align: "center", style: "bold", color: COLOR_STRONG});
	};

	canvas.onupdateFinally = (ctx) => {};

	//canvas.onclick = (ctx, x, y) => { alert(x + ":" + y)};
	canvas.onmouseup = () => {};
	
	canvas.update();
};
