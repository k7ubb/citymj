addEventListener("load", () => {
	const draw = new Canvas(document.getElementById("game"));
	draw.x = (x) => x * draw.width / 16;
	draw.y = (y) => y * draw.height / 9;
	draw.invX = (x) => x * 16 / draw.width;
	draw.invY = (y) => y * 9 / draw.height;

	//startScene(draw);
	gameScene(draw);
});

const drawGrid = (ctx) => {
	for (let i = 1; i < 16; i++) {
		ctx.fill(xy2rect(i, 0, ctx.pixel, 9), "#ccc");
	}
	for (let i = 1; i < 9; i++) {
		ctx.fill(xy2rect(0, i, 16, ctx.pixel), "#ccc");
	}
};

// https://qiita.com/noenture/items/b99f459613346e214f10
const shuffle = arr => arr.sort(() => Math.random() - Math.random());

// https://camp.trainocate.co.jp/magazine/howto-javascript-sleep/
const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );
