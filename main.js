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
	this.textBaseline = baseline;
	const diff = 0;
	if (rotate) {
		this.rotate(rotate);
		this.fillText(
			text,
			Math.cos(rotate) * x + Math.sin(rotate) * y,
			-Math.sin(rotate) * x + Math.cos(rotate) * y
		);
		this.rotate(-rotate);
	}
	else {
		this.fillText(text, x, y);
	}
	this.font = font_;
	this.fillStyle = fillStyle_;
	this.textAlign = textAlign_;
	this.textBaseline = textBaseline_;
};

const ctx = ResponsiveCanvas(document.getElementById("game"), 1600, 900, true);
const $ = new ItemsCanvas(ctx, ctx.convert, ctx.convertBack);
$.screenRect = [0, 0, 1600, 900];
const lineWidth = 1;
ctx.onResize = () => $.update();
///menuScene();
gameScene();
