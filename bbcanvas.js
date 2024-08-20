"use strict";

class BBCanvas {
	#div;
	#canvas_b;
	#canvas_f;
		
	#width;
	#height;
	
	#logicalWidth;
	#logicalHeight;
	
	get width() { return this.#width; }
	get height() { return this.#height; }

	#x(x) { return x * (!this.#isRotated? this.#width : this.#height) / this.#logicalWidth; }
	#y(y) { return y * (!this.#isRotated? this.#height : this.#width) / this.#logicalHeight; }

	#invXY(x, y) {
		return !this.#isRotated
		? [x * this.#logicalWidth / this.#width, y * this.#logicalHeight / this.#height]
		: [this.#logicalWidth * y / this.#height, this.#logicalHeight * (1 - x / this.#width)];
	}
		
	get pixel() { return Math.min(...this.#invXY(1, 1)) * devicePixelRatio; }

	#rotate(bool) {
		if (bool) {
			this.#isRotated = true;
			this.#canvas_f.getContext("2d").rotate(Math.PI / 2);
			this.#canvas_b.getContext("2d").rotate(Math.PI / 2);
			this.#canvas_f.getContext("2d").translate(0, -this.#width);
			this.#canvas_b.getContext("2d").translate(0, -this.#width);
			this.#execOnupdate();
		}
		else {
			this.#isRotated = false;
			this.#canvas_f.getContext("2d").translate(0, this.#width);
			this.#canvas_b.getContext("2d").translate(0, this.#width);
			this.#canvas_f.getContext("2d").rotate(-Math.PI / 2);
			this.#canvas_b.getContext("2d").rotate(-Math.PI / 2);
			this.#execOnupdate();
		}
	};

	#isRotated = false;

	set isRotated(bool) {
		if (bool !== this.#isRotated) {
			this.#rotate(bool);
			this.#isRotated = bool;
		}
	};

	get isRotated() {
		return this.#isRotated;
	};

	constructor(div, logicalWidth, logicalHeight) {
		this.#div = div;
		this.#logicalWidth  = logicalWidth;
		this.#logicalHeight = logicalHeight;
		this.#canvas_b = document.createElement("canvas");
		this.#canvas_f = document.createElement("canvas");
		this.#canvas_b.style.cssText = this.#canvas_f.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
		`;
		this.#div.appendChild(this.#canvas_b);
		this.#div.appendChild(this.#canvas_f);
				
		const resizeObserver = new ResizeObserver(() => {
			this.#resize();
			if (this.#isRotated) { this.#rotate(true); }
			this.#execOnupdate();
		});
		resizeObserver.observe(this.#div);

		this.#initEvent();
	};
	

	#resize() {
		this.#width  = this.#div.clientWidth  * devicePixelRatio;
		this.#height = this.#div.clientHeight * devicePixelRatio;
		this.#canvas_b.width  = this.#canvas_f.width  = this.#width;
		this.#canvas_b.height = this.#canvas_f.height = this.#height;
		this.#canvas_b.style.width  = this.#canvas_f.style.width  = this.#div.clientWidth  + "px";
		this.#canvas_b.style.height = this.#canvas_f.style.height = this.#div.clientHeight + "px";
	};
	
	#onupdate = () => {};
	#onupdateFinally = () => {};
	#onevent = () => {};
	
	set onupdate(f) {
		this.#onupdate = f;
	};

	set onupdateFinally(f) {
		this.#onupdateFinally = f;
	};
	
	set onevent(f) {
		this.#onevent = f;
	};

	update = () => this.#execOnupdate();

	objects = [];

	#eval (arg) {
		if (typeof arg === "function") {
			return arg();
		}
		else {
			return arg;
		}
	};
	
	#execOnupdate() {
		const ctx = this.#ctx(this.#canvas_b.getContext("2d"));
		ctx.clear();
		this.#onupdate(ctx);
		for (let o of this.objects) {
			if (!this.#eval(o.disabled) && o.draw) {
				o.draw(ctx);
			}
		}
		this.#onupdateFinally(ctx);
	};

	#execOnevent (x, y, startx, starty) {
		if (this.eventDisabled) { return; }
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"));
		ctx.clear();
		this.#onevent(ctx, x, y, startx, starty);
		for (let o of this.objects) {
			if (o.path && ctx.isPointInPath(o.path, x, y)) {
				if (!this.#eval(o.disabled) && !this.#eval(o.eventDisabled) && this.isClick && o.drawonclicking) { o.drawonclicking(ctx); }
				if (!this.#eval(o.disabled) && !this.#eval(o.eventDisabled) && o.drawonhover) { o.drawonhover(ctx);} 
			}
		}
	};

	#onclick = () => {};
	#onmouseup = () => {};

	set onclick(f) {
		this.#onclick = f;
	}

	set onmouseup(f) {
		this.#onmouseup = f;
	}

	#execOnclick (x, y, startx, starty) {
		if (this.eventDisabled) { return; }
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"));
		ctx.clear();
		this.#onclick(ctx, x, y, startx, starty);
		for (let o of this.objects) {
			if (!this.#eval(o.disabled) && !this.#eval(o.eventDisabled) && o.onclick && o.path && ctx.isPointInPath(o.path, x, y)) {
				o.onclick(ctx, x, y, startx, starty);
			}
		}
	}

	#execOnmouseup (x, y, startx, starty) {
		if (this.eventDisabled) { return; }
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"));
		ctx.clear();
		this.#onmouseup(ctx, x, y, startx, starty);
		for (let o of this.objects) {
			if (!this.#eval(o.disabled) && !this.#eval(o.eventDisabled) && o.onmouseup && ctx.isPointInPath(o, x, y)) {
				o.onmouseup(ctx, x, y, startx, starty);
			}
		}
	}

	makePath (arg) {
		const points = arg.points || [
			[arg.rect[0], arg.rect[1]],															// x, y
			[arg.rect[0], arg.rect[1] + arg.rect[3]],								// x, y + h
			[arg.rect[0] + arg.rect[2], arg.rect[1] + arg.rect[3]],	// x + w, y + h
			[arg.rect[0] + arg.rect[2], arg.rect[1]]								// x + w, y
		];
		if (arg.radius) {
			return (ctx) => {
				ctx.beginPath();
				ctx.moveTo(this.#x(points[0][0] + arg.radius), this.#y(points[0][1]));
				ctx.ellipse(this.#x(points[0][0] + arg.radius), this.#y(points[0][1] + arg.radius), this.#x(arg.radius), this.#y(arg.radius), 0, Math.PI * 1.5, Math.PI, true);
				ctx.lineTo(this.#x(points[1][0]), this.#y(points[1][1] - arg.radius));
				ctx.ellipse(this.#x(points[1][0] + arg.radius), this.#y(points[1][1] - arg.radius), this.#x(arg.radius), this.#y(arg.radius), 0, Math.PI, Math.PI * .5, true);
				ctx.lineTo(this.#x(points[2][0] - arg.radius), this.#y(points[2][1]));
				ctx.ellipse(this.#x(points[2][0] - arg.radius), this.#y(points[2][1] - arg.radius), this.#x(arg.radius), this.#y(arg.radius), 0, Math.PI * .5, 0, true);
				ctx.lineTo(this.#x(points[3][0]), this.#y(points[3][1] + arg.radius));
				ctx.ellipse(this.#x(points[3][0] - arg.radius), this.#y(points[3][1] + arg.radius), this.#x(arg.radius), this.#y(arg.radius), 0, 0, Math.PI * 1.5, true);
				ctx.closePath();
			};
		}
		else {
			return (ctx) => {
				ctx.beginPath();
				ctx.moveTo(this.#x(points[0][0]), this.#y(points[0][1]));
				for (let i = 1; i < points.length; i++) {
					ctx.lineTo(this.#x(points[i][0]), this.#y(points[i][1]));
				}
				ctx.closePath();
			};
		}
	}

	#ctx(ctx) {
		const draw = this;
		return {
			context: ctx,
			pixel: this.pixel,
			clear: () => {
				ctx.clearRect(this.#x(0), this.#y(0), this.#x(this.#logicalWidth), this.#y(this.#logicalHeight));
			},
			fill: function(path, color) {
				path(ctx);
				ctx.fillStyle = color;
				ctx.fill();
			},
			stroke: function(path, color, {width=this.pixel} = {}) {
				path(ctx);
				ctx.lineWidth = draw.#x(width);
				ctx.strokeStyle = color;
				ctx.stroke();
			},
			isPointInPath: (path, x, y) => {
				const coef = (this.#width * this.#logicalWidth) / (this.#height * this.#logicalHeight);
				const [x_, y_] = !this.#isRotated? [x, y] : [(this.#logicalHeight - y) * coef, x / coef];
				path(ctx);
				return ctx.isPointInPath(draw.#x(x_), draw.#y(y_));
			},
			drawText: function(text, x, y, {color="#000", size=1, font="sans-serif", style="", align="left", valign="top", rotate} = {}) {
				ctx.font = `${style} ${draw.#x(size)}px ${font}`;
				ctx.fillStyle = color;
				ctx.textAlign = align;
				ctx.textBaseline = valign;
				if (rotate) {
					ctx.rotate(rotate);
					ctx.fillText(
						text,
						Math.cos(rotate) * draw.#x(x) + Math.sin(rotate) * draw.#y(y),
						-Math.sin(rotate) * draw.#x(x) + Math.cos(rotate) * draw.#y(y),
					);
					ctx.rotate(-rotate);
				}
				else {
					ctx.fillText(text, draw.#x(x), draw.#y(y));
				}
			}
		};
	}

	// イベント処理
	eventDisabled = false;

	#mouse_x_ = -1;
	#mouse_y_ = -1;
	#mouse_start_x_ = -1;
	#mouse_start_y_ = -1;
	#mouse_click = false;

	get isClick() { return this.#mouse_click; }
	
	#dragStart(clientX_, clientY_, offset) {
		this.#mouse_start_x_ = this.#mouse_x_ = (this.#mouse_x_ = clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_start_y_ = this.#mouse_y_ = (this.#mouse_y_ = clientY_ - offset.top) * devicePixelRatio;
		this.#mouse_click = true;
		this.#execOnevent(...this.#invXY(this.#mouse_x_, this.#mouse_y_), ...this.#invXY(this.#mouse_start_x_, this.#mouse_start_y_));
	};

	#dragContinue(clientX_, clientY_, offset) {
		this.#mouse_x_ = (clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_y_ = (clientY_ - offset.top) * devicePixelRatio;
		this.#execOnevent(...this.#invXY(this.#mouse_x_, this.#mouse_y_), ...this.#invXY(this.#mouse_start_x_, this.#mouse_start_y_));
	};

	#dragEnd(clientX_, clientY_, offset) {
		this.#mouse_x_ = (clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_y_ = (clientY_ - offset.top) * devicePixelRatio;
		this.#execOnevent(...this.#invXY(this.#mouse_x_, this.#mouse_y_), ...this.#invXY(this.#mouse_start_x_, this.#mouse_start_y_));
		const diff = (this.#mouse_x_ - this.#mouse_start_x_)**2 + (this.#mouse_y_ - this.#mouse_start_y_)**2;
		if (this.#mouse_click) {
			this.#mouse_click = false;
			if (diff < 16) {
				this.#execOnclick(...this.#invXY(this.#mouse_x_, this.#mouse_y_), ...this.#invXY(this.#mouse_start_x_, this.#mouse_start_y_));
			}
			else {
				this.#execOnmouseup(...this.#invXY(this.#mouse_x_, this.#mouse_y_), ...this.#invXY(this.#mouse_start_x_, this.#mouse_start_y_));
			}
		}
		this.#mouse_start_x_ = this.#mouse_x_ = -1;
		this.#mouse_start_y_ = this.#mouse_y_ = -1;
	};

	#initEvent() {
		if (IS_SMARTPHONE) {
			this.#div.addEventListener("touchstart", function(event) {
				this.#dragStart(event.touches[0].clientX, event.touches[0].clientY, event.target.getBoundingClientRect())
			}.bind(this));

			this.#div.addEventListener("touchmove", function(event) {
				this.#dragContinue(event.touches[0].clientX, event.touches[0].clientY, event.target.getBoundingClientRect())
			}.bind(this));
			
			this.#div.addEventListener("touchend", function(event) {
				this.#dragEnd(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event.target.getBoundingClientRect());
			}.bind(this));
		}
		else {
			this.#div.addEventListener("mousedown", function(event) {
				this.#dragStart(event.clientX, event.clientY, event.target.getBoundingClientRect());
			}.bind(this));
	
			this.#div.addEventListener("mousemove", function(event) {
				this.#dragContinue(event.clientX, event.clientY, event.target.getBoundingClientRect())
			}.bind(this));
			
			this.#div.addEventListener("mouseup", function(event) {
				this.#dragEnd(event.clientX, event.clientY, event.target.getBoundingClientRect());
			}.bind(this));
			
			this.#div.addEventListener("mouseleave", function(event) {
				this.#dragEnd(event.clientX, event.clientY, event.target.getBoundingClientRect());
			}.bind(this));
		}
	};
}
