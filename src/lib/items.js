'use strict';

/*
	TODO:
	- onClick処理時、mouseXYとstartXYの両方を見るようにしたい
	- 不要なItemは削除するようにして、hiddenを廃止したい
*/

class ItemsCanvas {
	#eval(arg) {
		return typeof arg === 'function'? arg() : arg;
	}
	
	#Path = class extends Path2D {
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
	}

	items = [];
	
	draw = () => {};
	onEvent = () => {};
	onClick = () => {};
	onMouseUp = () => {};
	
	reset() {
		this.items = [];
		this.draw = () => {};
		this.onEvent = () => {};
		this.onClick = () => {};
		this.onMouseUp = () => {};
	}
		
	addItem(arg) {
		if (Array.isArray(arg)) {
			for (const item of arg) { this.items.push(item); }
		}
		else {
			this.items.push(arg);
		}
		return arg;
	}
	
	deleteItem(arg) {
		if (Array.isArray(arg)) {
			for (const item of arg) { this.items = this.items.filter(_ => _ !== item); }
		}
		else {
			this.items = this.items.filter(_ => _ !== arg);
		}
	}
	
	#execOnUpdate() {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.fillStyle = "#ffc";
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.restore();
		this.draw();
		for (const item of this.items.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))) {
			if (!this.#eval(item.hidden) && item.draw) {
				item.draw();
			}
		}
	}
	
	update() {
		this.#execOnUpdate();
	}
	
	disabled = false;
	isMousePress = false;
	
	mouseX = -1;
	mouseY = -1;
	startX = -1;
	startY = -1;
	
	#execOnEvent() {
		if (this.disabled) { return; }
		this.#execOnUpdate();
		for (const item of this.items.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))) {
			if (this.#eval(item.hidden) || this.#eval(item.disabled)) { continue; }
			if (item.path && this.isPointInPath(item.path, this.mouseX, this.mouseY)) {
				if (item.onHover) { item.onHover(); } 
				if (this.isMousePress && item.onMousePress) { item.onMousePress(); }
			}
		}
		if (!this.disabled) { this.onEvent(); }
	}
	
	#execOnMouseUp(isClick) {
		if (this.disabled) { return; }
		this.#execOnUpdate();
		for (const item of this.items.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))) {
			if (this.#eval(item.hidden) || this.#eval(item.disabled)) { continue; }
			if (item.path && this.isPointInPath(item.path, this.mouseX, this.mouseY)) {
				if (isClick && item.onClick) { item.onClick(); }
				if (!isClick && item.onMouseUp) { item.onMouseUp(); }
			}
		}
		if (!this.disabled) { isClick? this.onClick() : this.onMouseUp(); }
	}

	clickLimit = 16;
	
	constructor(ctx, getMouseCoordinates, isPointInPath) {
		this.ctx = ctx;
		this.isPointInPath = isPointInPath
			? (path, x, y) => isPointInPath(new this.#Path(path), x, y)
			: (path, x, y) => this.ctx.isPointInPath(new this.#Path(path), x, y);

		if (getMouseCoordinates) {
			const isSmartphone = 'ontouchstart' in window;
			
			this.ctx.canvas.addEventListener(isSmartphone? 'touchstart' : 'mousedown', (event) => {
				[this.mouseX, this.mouseY] = [this.startX, this.startY] = getMouseCoordinates(event);
				this.isMousePress = true;
				this.#execOnEvent();
			});
			
			this.ctx.canvas.addEventListener(isSmartphone? 'touchmove' : 'mousemove', (event) =>{
				[this.mouseX, this.mouseY] = getMouseCoordinates(event);
				this.#execOnEvent();
			});
			
			this.ctx.canvas.addEventListener(isSmartphone? 'touchend' : 'mouseup', (event) => {
				this.isMousePress = false;
				const diff = (this.mouseX - this.startX) ** 2 + (this.mouseY - this.startY) ** 2;
				this.#execOnMouseUp(diff < this.clickLimit);
				[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
			});
			
			if (!isSmartphone) {
				this.ctx.canvas.addEventListener('mouseleave', (event) => {
					this.isMousePress = false;
				[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
				});
			}
		}
	}
}
