const IS_SMARTPHONE = "ontouchstart" in window;
const VERSION = "ver 2.0.4 / 20241021";
const COLOR_BACKGROUND = "#9DCCDF";
const COLOR_MAIN = "#6C90C1";
const COLOR_STRONG = "#000080";

const sleep = t => new Promise(resolve => setTimeout(resolve, t));
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

const exact = new ExactCanvas(document.getElementById("game"), 1600, 900, {rotate: true});
const $ = new ItemsCanvas(
	exact.canvas.getContext("2d"),
	(event) => {
		const [clientX, clientY] = event.type.includes('mouse')
			? [event.clientX, event.clientY]
			: [event.touches[0].clientX, event.touches[0].clientY];
		const rect = event.target.getBoundingClientRect();
		return exact.toLogicalPoint(clientX - rect.left, clientY - rect.top)
	},
	(path, x, y) => exact.canvas.getContext("2d").isPointInPath(path, ...exact.toPhysicalPoint(x, y))
);
exact.onResize = () => $.update();

menuScene();
