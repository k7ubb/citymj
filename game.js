onload = function() {
	const draw = new Canvas(document.getElementById("game"));
	draw.x = (x) => x * draw.width / 16;
	draw.y = (y) => y * draw.height / 9;

	draw.invX = (x) => x * 16 / draw.width;
	draw.invY = (y) => y * 9 / draw.height;

	let count = 0;
	draw.objects.push({
		path: [ [1,1], [1,3], [3,3], [3,1] ],
		draw: function(ctx) {
			ctx.fill(this.path, "#ff0");
		},
		drawonhover: function(ctx) {
			ctx.fill(this.path, "rgba(255, 255, 255, .5)");
		},
		drawonclicking: function(ctx) {
			ctx.fill(this.path, "rgba(255, 255, 255)");
		},
		onclick: function() {
			console.log(1);
		}
	});

	draw.update();

	const rect = [ [5,5], [5,8], [8,8], [6,5] ];

	draw.onupdate = (ctx) => {
		ctx.fill(rect, "#eee");
	};
	
	draw.onevent = (ctx, x, y) => {
		if (draw.isClick) {
			ctx.fill([ [x-.5, y-.5], [x-.5, y+.5], [x+.5, y+.5], [x+.5, y-.5] ], "#f0c");
			ctx.drawText(count, x-.5, y-.5, "#000", 1);
		}
	};

	draw.onclick = (x, y) => {
		count++;
	};
};
