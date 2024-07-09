"use strict";

class Canvas {
	#div;
	#canvas_b;
	#canvas_f;
		
	#width;
	#height;
	
	get width() { return this.#width; }
	get height() { return this.#height; }

	constructor(div) {
		this.#div = div;		
		this.#canvas_b = document.createElement("canvas");
		this.#canvas_f = document.createElement("canvas");
		this.#canvas_b.style.cssText = this.#canvas_f.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
		`;
		this.#div.appendChild(this.#canvas_b);
		this.#div.appendChild(this.#canvas_f);
		
		this.#resize();
		
		addEventListener("resize", function() {
			this.#resize();
			this.#execOnupdate();
		}.bind(this));
		
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
	#onevent = () => {};
	
	set onupdate(f) {
		this.#onupdate = f;
		this.#execOnupdate();
	};
	
	set onevent(f) {
		this.#onevent = f;
	}

	update = () => this.#execOnupdate();

	objects = [];
	
	#execOnupdate() {
		const ctx = this.#ctx(this.#canvas_b.getContext("2d"), this);
		ctx.clear();
		this.#onupdate(ctx);
		for (let o of this.objects) {
			if (o.draw) {
				o.draw(ctx);
			}
		}
	};

	#execOnevent (x, y, startx, starty) {
		if (this.eventDisabled) { return; }
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"), this);
		ctx.clear();
		this.#onevent(ctx, x, y, startx, starty);
		for (let o of this.objects) {
			if (o.path && (o.drawonclicking || o.drawonhover) && ctx.isPointInPath(o.path, x, y)) {
				if (this.isClick && o.drawonclicking) { o.drawonclicking(ctx); }
				if (o.drawonhover) { o.drawonhover(ctx);} 
			}
		}
	}

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
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"), this);
		ctx.clear();
		this.#onclick(ctx, x, y, startx, starty);
		for (let o of this.objects) {
			if (o.path && o.onclick && ctx.isPointInPath(o.path, x, y)) {
				o.onclick();
			}
		}
	}

	#execOnmouseup (x, y, startx, starty) {
		if (this.eventDisabled) { return; }
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"), this);
		ctx.clear();
		this.#onmouseup(ctx, x, y, startx, starty);
		for (let o of this.objects) {
			if (o.path && o.onmouseup && ctx.isPointInPath(o.path, x, y)) {
				o.onmouseup();
			}
		}
	}


	// 座標変換: ユーザ側で定義
	x(x) { return x; }
	y(y) { return y; }
	invX(x) { return x; }
	invY(y) { return y; }

	get pixel() { return this.invX(1); }

	#ctx(ctx, draw) {
		return {
			context: ctx,
			pixel: draw.pixel,
			rect: draw.rect,
			clear: function() {
				ctx.clearRect(0, 0, draw.width, draw.height);
			},
			// r: pathが長方形で, 左上 左下 右下 右上 の順になっていることが前提
			path: (path, r) => {
				ctx.beginPath();
				if (r) {
					ctx.moveTo(draw.x(path[0][0] + r), draw.y(path[0][1]));
					ctx.arc(draw.x(path[0][0] + r), draw.y(path[0][1] + r), draw.x(r), Math.PI * 1.5, Math.PI, true);
					ctx.lineTo(draw.x(path[1][0]), draw.y(path[1][1] - r));
					ctx.arc(draw.x(path[1][0] + r), draw.y(path[1][1] - r), draw.x(r), Math.PI, Math.PI * .5, true);
					ctx.lineTo(draw.x(path[2][0] - r), draw.y(path[2][1]));
					ctx.arc(draw.x(path[2][0] - r), draw.y(path[2][1] - r), draw.x(r), Math.PI * .5, 0, true);
					ctx.lineTo(draw.x(path[3][0]), draw.y(path[3][1] + r));
					ctx.arc(draw.x(path[3][0] - r), draw.y(path[3][1] + r), draw.x(r), 0, Math.PI * 1.5, true);
				}
				else {
					ctx.moveTo(draw.x(path[0][0]), draw.y(path[0][1]));
					for (let i=1; i<path.length; i++) {
						ctx.lineTo(draw.x(path[i][0]), draw.y(path[i][1]));
					}
				}
				ctx.closePath();
			},
			fill: function(path, color, radius) {
				this.path(path, radius);
				ctx.fillStyle = color;
				ctx.fill();
			},
			stroke: function(path, color, {width=this.pixel, radius=0} = {}) {
				this.path(path, radius);
				ctx.lineWidth = draw.x(width);
				ctx.strokeStyle = color;
				ctx.stroke();
			},
			isPointInPath: function (path, x, y){
				this.path(path);
				return ctx.isPointInPath(draw.x(x), draw.y(y));
			},
			drawText: function(text, x, y, {color="#000", size=1, font="sans-serif", style="", align="left", valign="top"} = {}) {
				ctx.font = `${style} ${draw.x(size)}px ${font}`;
				ctx.fillStyle = color;
				ctx.textAlign = align;
				ctx.textBaseline = valign;
				ctx.fillText(text, draw.x(x), draw.y(y));
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
		this.#execOnevent(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_), this.invX(this.#mouse_start_x_), this.invY(this.#mouse_start_y_));
	};

	#dragContinue(clientX_, clientY_, offset) {
		this.#mouse_x_ = (clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_y_ = (clientY_ - offset.top) * devicePixelRatio;
		this.#execOnevent(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_), this.invX(this.#mouse_start_x_), this.invY(this.#mouse_start_y_));
	};

	#dragEnd(clientX_, clientY_, offset) {
		this.#mouse_x_ = (clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_y_ = (clientY_ - offset.top) * devicePixelRatio;
		this.#execOnevent(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_), this.invX(this.#mouse_start_x_), this.invY(this.#mouse_start_y_));
		const diff = (this.#mouse_x_ - this.#mouse_start_x_)**2 + (this.#mouse_y_ - this.#mouse_start_y_)**2
		if (this.#mouse_click) {
			this.#mouse_click = false;
			if (diff < 16) {
				this.#execOnclick(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_), this.invX(this.#mouse_start_x_), this.invY(this.#mouse_start_y_));
			}
			else {
				this.#execOnmouseup(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_), this.invX(this.#mouse_start_x_), this.invY(this.#mouse_start_y_));
			}
		}
		this.#mouse_start_x_ = this.#mouse_x_ = -1;
		this.#mouse_start_y_ = this.#mouse_y_ = -1;
	};

	#initEvent() {
		this.#div.addEventListener("mousedown", function(event) {
			this.#dragStart(event.clientX, event.clientY, event.target.getBoundingClientRect());
		}.bind(this));

		this.#div.addEventListener("touchstart", function(event) {
			this.#dragStart(event.touches[0].clientX, event.touches[0].clientY, event.target.getBoundingClientRect())
		}.bind(this));
		
		this.#div.addEventListener("mousemove", function(event) {
			this.#dragContinue(event.clientX, event.clientY, event.target.getBoundingClientRect())
		}.bind(this));
		
		this.#div.addEventListener("touchmove", function(event) {
			this.#dragContinue(event.touches[0].clientX, event.touches[0].clientY, event.target.getBoundingClientRect())
		}.bind(this));
		
		this.#div.addEventListener("mouseup", function(event) {
			this.#dragEnd(event.clientX, event.clientY, event.target.getBoundingClientRect());
		}.bind(this));
		
		this.#div.addEventListener("mouseleave", function(event) {
			this.#dragEnd(event.clientX, event.clientY, event.target.getBoundingClientRect());
		}.bind(this));
		
		this.#div.addEventListener("touchend", function(event) {
			this.#dragEnd(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event.target.getBoundingClientRect());
		}.bind(this));
	}
}
