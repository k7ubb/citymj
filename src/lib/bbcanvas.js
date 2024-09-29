'use strict';

(() => {
	const Path = class extends Path2D {
		constructor({points, rect, center, radius} = {}) {
			super();
			if (center) {
				this.arc(center.x, center.y, radius, 0, Math.PI * 2);
				this.closePath();
				return;
			}
			points = points ?? [
				[rect[0], rect[1]],
				[rect[0], rect[1] + rect[3]],
				[rect[0] + rect[2], rect[1] + rect[3]],
				[rect[0] + rect[2], rect[1]]
			];
			if (rect && radius) {
				this.moveTo(points[0][0] + radius, points[0][1]);
				this.arc(points[0][0] + radius, points[0][1] + radius, radius, Math.PI * 1.5, Math.PI, true);
				this.lineTo(points[1][0], points[1][1] - radius);
				this.arc(points[1][0] + radius, points[1][1] - radius, radius, Math.PI, Math.PI * .5, true);
				this.lineTo(points[2][0] - radius, points[2][1]);
				this.arc(points[2][0] - radius, points[2][1] - radius, radius, Math.PI * .5, 0, true);
				this.lineTo(points[3][0], points[3][1] + radius);
				this.arc(points[3][0] - radius, points[3][1] + radius, radius, 0, Math.PI * 1.5, true);
			} else {
				this.moveTo(points[0][0], points[0][1]);
				for (let i = 1; i < points.length; i++) {
					this.lineTo(points[i][0], points[i][1]);
				}
			}
			this.closePath();
		}
	};
	
	CanvasRenderingContext2D.prototype.bbFill = function(path, color) {
		this.save();
		this.fillStyle = color;
		this.fill(new Path(path));
		this.restore();
	};

	CanvasRenderingContext2D.prototype.bbStroke = function(path, {color = "#000", width = 1} = {}) {
		this.save();
		this.lineWidth = width;
		this.strokeStyle = color;
		this.stroke(new Path(path));
		this.restore();
	};

	CanvasRenderingContext2D.prototype.bbText = function(text, x, y, {color = '#000000', size = 14, font = 'sans-serif', style = '', align = 'left', baseline = 'top', rotate} = {}) {
		this.save();
		this.font = `${style} ${size}px ${font}`;
		this.fillStyle = color;
		this.textAlign = align;
		this.textBaseline = baseline;
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
		this.restore();
	};
	
	CanvasRenderingContext2D.prototype.bbMeasureText = function(text, {size = 14, font = 'sans-serif', style = '', rotate} = {}) {
		this.save();
		this.font = `${style} ${size}px ${font}`;
		const width = this.measureText(text).width;
		this.restore();
		return width;
	};
	
})();
