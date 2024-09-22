const IS_SMARTPHONE = "ontouchstart" in window;
const VERSION = "ver 1.0.0 / 20240920";
const COLOR_BACKGROUND = "#9DCCDF";
const COLOR_MAIN = "#6C90C1";
const COLOR_STRONG = "#000080";

const sleep = t => new Promise(resolve => setTimeout(resolve, t));
const shuffle = arr => arr.sort(() => Math.random() - Math.random());

const ctx = AutoresizeCanvas(document.getElementById("game"), 1600, 900, true);
const $ = new ItemsCanvas(ctx, ctx.getMouseCoordinates, ctx.isScaledPointInPath);
ctx.onResize = () => $.update();
//menuScene();
gameScene({
  handLength: 14,
  showHandGuide: true,
  showCityTable: true,
  restrictRule: true,
});
