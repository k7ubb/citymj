const IS_SMARTPHONE = "ontouchstart" in window;
const VERSION = "ver 1.0.0 / 20240920";
const COLOR_BACKGROUND = "#9DCCDF";
const COLOR_MAIN = "#6C90C1";
const COLOR_STRONG = "#000080";

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

class Dialog {
  constructor({
    rect,
    draw = () => {},
    modal = false,
    onClose = () => {}
  } = {}) {
    $.disabled = true;
    this.zIndex = 100;
    this.path = {
      rect: [rect[0] + 5, rect[1] + 5, 70, 70],
    };
    this.disabledExclude = true;
    this.draw = function() {
      if (modal) {
        $.ctx.save();
        $.ctx.setTransform(1, 0, 0, 1, 0, 0);
        $.ctx.fillStyle = "rgba(0 0 0 / .3)";
        $.ctx.fillRect(0, 0, $.ctx.canvas.width, $.ctx.canvas.height);
        $.ctx.restore();
      }
      $.ctx.save();
      $.ctx.translate(rect[0], rect[1]);
      $.ctx.bbFill({rect: [0, 0, rect[2], rect[3]]}, COLOR_STRONG);
      $.ctx.bbFill({rect: [5, 5, rect[2] - 10, rect[3] - 10]}, "#fff");
      draw();
      $.ctx.restore();
      $.ctx.bbFill(this.path, "#eee");
      $.ctx.bbStroke({
        points: [
          [rect[0] + 20, rect[1] + 20],
          [rect[0] + 60, rect[1] + 60],
          [rect[0] + 40, rect[1] + 40],
          [rect[0] + 20, rect[1] + 60],
          [rect[0] + 60, rect[1] + 20],
          [rect[0] + 40, rect[1] + 40]
        ]
      }, {width: 4});
    };
    this.onHover = function() {	$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); };
    this.onClick = function() {
      $.disabled = false;
      $.deleteItem(this);
      $.update();
    };
  }
}

const ctx = AutoresizeCanvas(document.getElementById("game"), 1600, 900, true);
const $ = new ItemsCanvas(ctx, ctx.getMouseCoordinates, ctx.isScaledPointInPath);
ctx.onResize = () => $.update();
menuScene();
//gameScene();