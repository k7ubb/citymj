const menuScene = (canvas) => {
	canvas.objects = [
		{
			path: canvas.makePath({rect: [4, 5, 8, 2]}),
			draw: function(ctx) {
				ctx.fill(this.path, "#eee");
				ctx.drawText("START", 8, 6, {size: 1.5, align: "center", valign: "middle"});
			},
			drawonhover: function(ctx) {
				ctx.fill(this.path, "rgba(255, 255, 255, .5)");
			},
			onclick: function() {
				gameScene(canvas);
			}
		}
	];

	canvas.onupdate = (ctx) => {
		drawGrid(canvas, ctx);
		ctx.drawText("市町村麻雀", 8, 1, {size:2, align: "center"});
	};

	canvas.update();

};
