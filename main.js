CanvasRenderingContext2D.prototype.bbFill = function(path, color) {
	const fillStyle_ = this.fillStyle;
	this.fillStyle = color;
	this.fill(path);
	this.fillStyle = fillStyle_;
};

CanvasRenderingContext2D.prototype.bbStroke = function(path, color, width = 1) {
	const lineWidth_ = this.lineWidth;
	const strokeStyle_ = this.strokeStyle;
	this.lineWidth = width;
	this.strokeStyle = color;
	this.stroke(path);
	this.lineWidth = lineWidth_;
	this.strokeStyle = strokeStyle_;
};

CanvasRenderingContext2D.prototype.bbText = function(text, x, y, {color = '#000000', size = 14, font = 'sans-serif', style = '', align = 'left', baseline = 'top', rotate} = {}) {
	const font_ = this.font;
	const fillStyle_ = this.fillStyle;
	const textAlign_ = this.textAlign;
	const textBaseline_ = this.textBaseline;
	this.font = `${style} ${size}px ${font}`;
	this.fillStyle = color;
	this.textAlign = align;
	this.textBaseline = "alphabetic";
	const diff = - size * .1 + (baseline === "middle" && size / 2) + (baseline === "top" && size);
	if (rotate) {
		this.rotate(rotate);
		this.fillText(
			text,
			Math.cos(rotate) * x + Math.sin(rotate) * y,
			-Math.sin(rotate) * x + Math.cos(rotate) * y + diff
		);
		this.rotate(-rotate);
	}
	else {
		this.fillText(text, x, y + diff);
	}
	this.font = font_;
	this.fillStyle = fillStyle_;
	this.textAlign = textAlign_;
	this.textBaseline = textBaseline_;
};

const ctx = ResponsiveCanvas(document.getElementById("game"), 16, 9, true);
const $ = new ItemsCanvas(ctx, ctx.convert, ctx.convertBack);
$.screenRect = [0, 0, 16, 9];
const lineWidth = 0.01;
ctx.onResize = () => $.update();
menuScene();
