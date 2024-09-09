const ctx = ResponsiveCanvas(document.getElementById("game"), 16, 9, true);
const $ = new ItemsCanvas(ctx, ctx.convert, ctx.convertBack);
$.screenRect = [0, 0, 16, 9];
const lineWidth = 0.01;
ctx.onResize = () => $.update();

menuScene();
