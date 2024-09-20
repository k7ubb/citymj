const IS_SMARTPHONE = "ontouchstart" in window;
const VERSION = "ver 1.0.0 / 20240920";
const COLOR_BACKGROUND = "#9DCCDF";
const COLOR_MAIN = "#6C90C1";
const COLOR_STRONG = "#000080";

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

class Dialog extends Item {
  constructor({
    rect,
    draw = () => {},
    modal = false,
    onClose = () => {}
  } = {}) {
    $.eventDisabled = true;
    super({
      zIndex: 65535,
      rect: [rect[0] + 5, rect[1] + 5, 70, 70],
      eventDisabledExclude: true,
      draw: function() {
        if (modal) {
          $.ctx.save();
          $.ctx.setTransform(1, 0, 0, 1, 0, 0);
          $.ctx.fillStyle = "rgba(0 0 0 / .3)";
          $.ctx.fillRect(0, 0, $.ctx.canvas.width, $.ctx.canvas.height);
          $.ctx.restore();
        }
        $.ctx.save();
        $.ctx.translate(rect[0], rect[1]);
				$.ctx.bbFill(new Path({rect: [0, 0, rect[2], rect[3]]}), COLOR_STRONG);
				$.ctx.bbFill(new Path({rect: [5, 5, rect[2] - 10, rect[3] - 10]}), "#fff");
        draw();
        $.ctx.restore();
        $.ctx.bbFill(this.path, "#eee");
				$.ctx.bbStroke(new Path({
					points: [
						[rect[0] + 20, rect[1] + 20],
						[rect[0] + 60, rect[1] + 60],
						[rect[0] + 40, rect[1] + 40],
						[rect[0] + 20, rect[1] + 60],
						[rect[0] + 60, rect[1] + 20],
						[rect[0] + 40, rect[1] + 40]
					]
				}), {width: 4});
      },
			onHover: function() {	$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); },
      onClick: function() {
        $.eventDisabled = false;
				$.deleteItem(this);
				$.update();
      }
    });
  }
}

const ctx = AutoresizeCanvas(document.getElementById("game"), 1600, 900, true);
const $ = new ItemsCanvas(ctx, ctx.getMouseCoordinates, ctx.isScaledPointInPath);
ctx.onResize = () => $.update();
menuScene();
//gameScene();