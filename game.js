onload = function() {
	const draw = new drawClass(document.getElementById("game"));
	
	draw.update = (ctx, width, height) => {
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, width, height);
		
		ctx.fillStyle = "#f00";
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
