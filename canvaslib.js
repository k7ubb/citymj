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

	#execOnevent (x, y) {
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"), this);
		ctx.clear();
		this.#onevent(ctx, x, y);
		for (let o of this.objects) {
			if (ctx.isPointInPath(o.path, x, y)) {
				if (this.isClick && o.drawonclicking) { o.drawonclicking(ctx); }
				if (o.drawonhover) { o.drawonhover(ctx);} 
			}
		}
	}

	#onclick = () => {};

	set onclick(f) {
		this.#onclick = f;
	}

	#execOnclick (x, y) {
		const ctx = this.#ctx(this.#canvas_f.getContext("2d"), this);
		this.#onclick(x, y);
		for (let o of this.objects) {
			if (ctx.isPointInPath(o.path, x, y) && this.onclick) {
				o.onclick();
			}
		}
	}


	// 座標変換: ユーザ側で定義
	x(x) { return x; }
	y(y) { return y; }
	invX(x) { return x; }
	invY(y) { return y; }

	#ctx(ctx, draw) {
		return {
			context: ctx,
			clear: function() {
				ctx.clearRect(0, 0, draw.width, draw.height);
			},
			path: (path) => {
				ctx.beginPath();
				ctx.moveTo(draw.x(path[0][0]), draw.y(path[0][1]));
				for (let i=1; i<path.length; i++) {
					ctx.lineTo(draw.x(path[i][0]), draw.y(path[i][1]));
				}
			},
			fill: function(path, color) {
				this.path(path);
				ctx.fillStyle = color;
				ctx.fill();
			},
			stroke: function(path, color) {
				this.path(path);
				ctx.strokeStyle = color;
				ctx.stroke();
			},
			isPointInPath: function (path, x, y){
				this.path(path);
				return ctx.isPointInPath(draw.x(x), draw.y(y));
			},
			drawText: function(text, x, y, color="#000", size=1, font="sans-serif", align="left", valign="top") {
				ctx.font = `${draw.x(size)}px ${font}`;
				ctx.fillStyle = color;
				ctx.textAlign = align;
				ctx.textBaseline = valign;
				ctx.fillText(text, draw.x(x), draw.y(y));
			}
		};
	}

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
		this.#execOnevent(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_));
	};

	#dragContinue(clientX_, clientY_, offset) {
		this.#mouse_x_ = (clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_y_ = (clientY_ - offset.top) * devicePixelRatio;
		this.#execOnevent(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_));
	};

	#dragEnd(clientX_, clientY_, offset) {
		this.#mouse_x_ = (clientX_ - offset.left) * devicePixelRatio;
		this.#mouse_y_ = (clientY_ - offset.top) * devicePixelRatio;
		this.#execOnevent(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_));
		if (this.#mouse_click) {
			this.#execOnclick(this.invX(this.#mouse_x_), this.invY(this.#mouse_y_));
			this.#mouse_click = false;
		}
		this.#mouse_start_x_ = this.#mouse_x_ = -1;
		this.#mouse_start_y_ = this.#mouse_y_ = -1;
	};

	// イベント処理
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
