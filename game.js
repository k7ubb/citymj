onload = function() {
	const draw = new Canvas(document.getElementById("game"));
	draw.x = (x) => { return x * draw.width / 16 };
	draw.y = (y) => { return y * draw.height / 9 };

	draw.objects.push({
		x: 1,
		y: 1,
		width: 2,
		height: 2,
		draw: function(ctx) {
			ctx.fillStyle = "#f00";
			draw.ctx_b.fillRect(this.x, this.y, this.width, this.height);
		},
		drawonevent: function(ctx, width, height, x, y) {
			if (this.x <= x && x <= this.x + this.width && this.y <= y && y < this.y + this.height) {
				ctx.strokeStyle = "#0f0";
				ctx.strokeRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
			}
		}
	});

	draw.update = (ctx, width, height) => {		
		ctx.fillStyle = "#eee";
		ctx.beginPath();
		ctx.arc(width/2, height/2, Math.min(width/2, height/2) - 10, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();
		
	};
	
	draw.anime = (ctx, width, height, x, y) => {
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = "#0f0";
		ctx.fillRect(x - 20, y - 20, 40, 40);
	};
};
