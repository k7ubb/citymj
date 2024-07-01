onload = function() {
	const draw = new Canvas(document.getElementById("game"));
	
	draw.objects.push({
		x: 100,
		y: 100,
		width: 200,
		height: 200,
		draw: function(ctx) {
			ctx.fillStyle = "#f00";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		},
		drawonevent: function(ctx) {
			ctx.strokeStyle = "#ff0";
			ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);

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
