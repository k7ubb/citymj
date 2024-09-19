'use strict';

class Item {
  #rect;
  #radius;
  set rect (r) {
    this.#rect = r;
    this.path = ItemsCanvas.prototype.path({
      rect: this.#rect,
      radius: this.#radius
    });
  }
  get rect() { return this.#rect; }
  set radius (r) {
    this.path = ItemsCanvas.prototype.path({
      rect: this.#rect,
      radius: this.#radius
    });
  }
  get radius() { return this.#radius; }
  constructor({zIndex = 0, ...args} = {}) {
    this.zIndex = zIndex
    for (const key of Object.keys(args)) {
      this[key] = args[key];
    }
  }
}

class ItemsCanvas {
	#eval (arg) {
		return typeof arg === 'function'? arg() : arg;
	}
	
	#items = [];
	
	draw = () => {};
	drawFinally = () => {};
	onEvent = () => {};
	onClick = () => {};
	onMouseUp = () => {};
	
	reset() {
		this.#items = [];
		this.draw = () => {};
		this.drawFinally = () => {};
		this.onEvent = () => {};
		this.onClick = () => {};
		this.onMouseUp = () => {};
	}
	
	path (arg) {
		const points = arg.points || [
			[arg.rect[0], arg.rect[1]],
			[arg.rect[0], arg.rect[1] + arg.rect[3]],
			[arg.rect[0] + arg.rect[2], arg.rect[1] + arg.rect[3]],
			[arg.rect[0] + arg.rect[2], arg.rect[1]]
		];
		const path = new Path2D();
		if (arg.radius) {
			path.moveTo(points[0][0] + arg.radius, points[0][1]);
			path.arc(points[0][0] + arg.radius, points[0][1] + arg.radius, arg.radius, Math.PI * 1.5, Math.PI, true);
			path.lineTo(points[1][0], points[1][1] - arg.radius);
			path.arc(points[1][0] + arg.radius, points[1][1] - arg.radius, arg.radius, Math.PI, Math.PI * .5, true);
			path.lineTo(points[2][0] - arg.radius, points[2][1]);
			path.arc(points[2][0] - arg.radius, points[2][1] - arg.radius, arg.radius, Math.PI * .5, 0, true);
			path.lineTo(points[3][0], points[3][1] + arg.radius);
			path.arc(points[3][0] - arg.radius, points[3][1] + arg.radius, arg.radius, 0, Math.PI * 1.5, true);
			path.closePath();
		}
		else {
			path.moveTo(points[0][0], points[0][1]);
			for (let i = 1; i < points.length; i++) {
				path.lineTo(points[i][0], points[i][1]);
			}
			path.closePath();
		}
		return path;
	}
		
	addItem(arg) {
		if (Array.isArray(arg)) {
			for (const item of arg) { this.#items.push(item); }
		}
		else {
			this.#items.push(arg);
		}
	}
	
	deleteItem(arg) {
		if (Array.isArray(arg)) {
			for (const item of arg) { this.#items = this.#items.filter(_ => _ !== item); }
		}
		else {
			this.#items = this.#items.filter(_ => _ !== arg);
		}
	}
	
	#execOnUpdate() {
		this.ctx.clearRect(...($.screenRect ?? [0, 0, this.ctx.canvas.width, this.ctx.canvas.height]));
		this.draw();
		for (const item of this.#items.sort((a, b) => a.zIndex - b.zIndex)) {
			if (!this.#eval(item.disabled) && item.draw) {
				item.draw();
			}
		}
		this.drawFinally();
	}
	
	update() {
		this.#execOnUpdate();
	}
	
	eventDisabled = false;
	isMousePress = false;
	
	mouseX = -1;
	mouseY = -1;
	startX = -1;
	startY = -1;
	
	isPointInPath(path, x, y) {
		return path && this.ctx.isPointInPath(path, ...this.convertBack(x, y));
	}
	
	#execOnEvent() {
		if (this.eventDisabled) { return; }
		this.ctx.clearRect(...($.screenRect ?? [0, 0, this.ctx.canvas.width, this.ctx.canvas.height]));
		this.#execOnUpdate();
		this.onEvent();
		for (const item of this.#items.sort((a, b) => a.zIndex - b.zIndex)) {
			if (!this.#eval(item.disabled) && !this.#eval(item.eventDisabled) && this.isPointInPath(item.path, this.mouseX, this.mouseY)) {
				if (item.onHover) { item.onHover(); } 
				if (this.isMousePress && item.onMousePress) { item.onMousePress(); }
			}
		}
	}
	
	#execOnMouseUp(isClick) {
		if (this.eventDisabled) { return; }
		this.ctx.clearRect(...($.screenRect ?? [0, 0, this.ctx.canvas.width, this.ctx.canvas.height]));
		this.#execOnUpdate();
		isClick? this.onClick() : this.onMouseUp();
		for (const item of this.#items.sort((a, b) => a.zIndex - b.zIndex)) {
			if (!this.#eval(item.disabled) && !this.#eval(item.eventDisabled) && this.isPointInPath(item.path, this.mouseX, this.mouseY)) {
				if (isClick && item.onClick) { item.onClick(); }
				if (!isClick && item.onMouseUp) { item.onMouseUp(); }
			}
		}
	}
	
	constructor(ctx, convert, convertBack) {
		this.ctx = ctx;
		this.convert = convert ?? ((x, y) => [x, y]);
		this.convertBack = convertBack ?? ((x, y) => [x, y]);
		const isSmartphone = 'ontouchstart' in window;
		
		const getOffset = (event) => {
			const [clientX, clientY] = event.type.includes('mouse')
				? [event.clientX, event.clientY]
				: [event.touches[0].clientX, event.touches[0].clientY];
			const rect = event.target.getBoundingClientRect();
			return [clientX - rect.left, clientY - rect.top];
		};
		
		this.ctx.canvas.addEventListener(isSmartphone? 'touchstart' : 'mousedown', function(event) {
			[this.mouseX, this.mouseY] = [this.startX, this.startY] = this.convert(...getOffset(event));
			this.isMousePress = true;
			this.#execOnEvent();
		}.bind(this));
		
		this.ctx.canvas.addEventListener(isSmartphone? 'touchmove' : 'mousemove', function(event) {
			[this.mouseX, this.mouseY] = this.convert(...getOffset(event));
			this.#execOnEvent();
		}.bind(this));
		
		this.ctx.canvas.addEventListener(isSmartphone? 'touchend' : 'mouseup', function(event) {
			this.isMousePress = false;
			const [mouseX, mouseY] = this.convertBack(this.mouseX, this.mouseY);
			const [startX, startY] = this.convertBack(this.startX, this.startY);
			const diff = (mouseX - startX) ** 2 + (mouseY - startY) ** 2;
			this.#execOnMouseUp(diff < 16);
			[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
		}.bind(this));
		
		if (!isSmartphone) {
			this.ctx.canvas.addEventListener('mouseleave', function(event) {
				this.isMousePress = false;
			[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
			}.bind(this));
		}
	}
}
