addEventListener("load", () => {
	const canvas = new BBCanvas(document.getElementById("game"));
	canvas.x = (x) => x * canvas.width / 16;
	canvas.y = (y) => y * canvas.height / 9;
	canvas.invX = (x) => x * 16 / canvas.width;
	canvas.invY = (y) => y * 9 / canvas.height;

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
