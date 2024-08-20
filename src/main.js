addEventListener("load", () => {
	window.canvas = new BBCanvas(document.getElementById("game"), 16, 9);
	if (!location.pathname.includes("smp") || 1) canvas.isRotated = true;
	menuScene(canvas);
});

const drawGrid = (canvas, ctx) => {
	for (let i = 1; i < 16; i++) {
		ctx.fill(canvas.makePath({rect: [i, 0, ctx.pixel, 9]}), "#ccc");
	}
	for (let i = 1; i < 9; i++) {
		ctx.fill(canvas.makePath({rect: [0, i, 16, ctx.pixel]}), "#ccc");
	}
};
