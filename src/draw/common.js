class Dialog {
  constructor({
    rect,
    draw = () => {},
    modal = false,
    onClose = () => {}
  } = {}) {
    this.zIndex = 100;
    this.path = {
      rect: [rect[0] + 5, rect[1] + 5, 70, 70],
    };
    if (modal) {
      for (let item of $.items) {
        item.disabled_ = item.disabled;
        item.disabled = true;
      }
    }
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
      onClose();
      $.deleteItem(this);
      for (let item of $.items) {
        item.disabled = item.disabled_;
      }
      $.update();
    };
  }
}

class Button {
  constructor({
    rect,
    value,
    draw,
    onClick,
    ...args
  } = {}) {
    this.path = {
      rect,
      radius: rect[3] / 2
    };
    this.draw = function() {
      const isDisabled = typeof this.disabled === 'function'? this.disabled() : this.disabled;
			$.ctx.bbFill(this.path, "#eee");
			if (value) {
        $.ctx.bbText(value, rect[0] + rect[2] / 2, rect[1] + rect[3] / 2, {size: rect[3] / 2, align: "center", baseline: "middle", color: isDisabled? "#999" : "#000"});
        if (isDisabled) {
          $.ctx.bbStroke({points: [[rect[0] + 20, rect[1] + rect[3] / 2], [rect[0] + rect[2] - 40, rect[1] + rect[3] / 2]]}, {width: 2, color: "#999"});
        }
      }
      if (draw) { draw(rect); }
		};
		this.onHover = function() { $.ctx.bbFill(this.path, "rgba(0 0 0 / .1)"); };
		this.onClick = onClick;
    for (let key of Object.keys(args)) {
      this[key] = args[key];
    }
  }
}

const drawTile = ([x, y, size], tile, {perspective, rotate} = {}) => {
  const [w, h] = rotate? [size * 4 / 3, size] : [size, size * 4 / 3];
  const rect = [x, y, w, h];
  const radius = size * .05;
	if (perspective === "up") {
		$.ctx.bbFill({rect: [x, y - size * .3, w, h], radius}, COLOR_MAIN);
		$.ctx.bbFill({rect: [x, y - size * .2, w, h]}, "#fff");
		$.ctx.bbStroke({rect: [x, y - size * .3, w, h], radius}, {width: 2});
	}
	if (perspective === "down") {
		$.ctx.bbFill({rect: [x, y + size * .3, w, h], radius}, COLOR_MAIN);
		$.ctx.bbFill({rect: [x, y + size * .2, w, h]}, "#fff");
		$.ctx.bbStroke({rect: [x, y + size * .3, w, h], radius}, {width: 2});
	}
	if (perspective === "ura") {
		$.ctx.bbFill({rect: [x, y + size * .3, w, h], radius}, "#fff");
		$.ctx.bbFill({rect: [x, y + size * .1, w, h]}, COLOR_MAIN);
		$.ctx.bbStroke({rect: [x, y + size * .3, w, h], radius}, {width: 2});
	};
	$.ctx.bbFill({rect, radius}, perspective === "ura" ? COLOR_MAIN : "#fff");
	$.ctx.bbStroke({rect, radius}, {width: 2});
	if (perspective !== "ura") {
		if (rotate) {
			$.ctx.bbText(tile.count, x + + size * .2, y + size / 2, {size: size * .3, color: "#88f", font: "serif", align: "center", baseline: "middle", rotate: -Math.PI / 2});
			$.ctx.bbText(tile.character, x + size * .8, y + size / 2, {size: size * .8, font: "serif", align: "center", baseline: "middle", rotate: -Math.PI / 2, ...(tile.red && { color: "#f00"})})
		}
		else {
			$.ctx.bbText(tile.count, x + size / 2, y + size * .2, {size: size * .3, color: "#88f", font: "serif", align: "center", baseline: "middle"});
			$.ctx.bbText(tile.character, x + size / 2, y + size * .8, {size: size * .8, font: "serif", align: "center", baseline: "middle", ...(tile.red && { color: "#f00"})})
		}
	}
};

const drawCheckbox = (x, y, isChecked) => {
	$.ctx.bbStroke({rect: [x, y, 32, 32]}, {width: 2});
	if (isChecked) {
		$.ctx.bbStroke({points: [
			[x + 2, y + 10],
			[x + 16, y + 35],
			[x + 36, y],
			[x + 16, y + 35],
			[x + 2, y + 10],
		]}, {color: "#f00", width: 4});
	}
};
