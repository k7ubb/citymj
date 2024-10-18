'use strict';

class ItemsCanvas {
	#eval(arg) {
		return typeof arg === 'function' ? arg() : arg;
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
				radius = Math.min(Math.min(rect[2], rect[3]) / 2, radius);
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
	
	#items = [];
	draw = () => {};
	
	reset() {
		this.#items = [];
		this.draw = () => {};
	}
	
	addItem(...arg) {
		for (const item of arg) { this.#items.push(item); }
		return arg;
	}
	
	deleteItem(...arg) {
		for (const item of arg) { this.#items = this.#items.filter(_ => _ !== item); }
	}
	
	update() {
		this.ctx.save();
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.fillStyle = '#ffc';
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.restore();
		this.draw();
		const tasks = this.#items.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).map(item => ({
			item,
			status: { hover: false, press: false, drag: false, drop: null }
		}));
		let from = null;
		for (let i = 0; i < tasks.length; i++) {
			if (this.#eval(this.disabled)) { continue; }
			if (i >= tasks.findIndex(task => task.item.final) && !this.#eval(tasks[i].item.disabled) && tasks[i].item.path) {
				const startInPoint = this.isPointInPath(tasks[i].item.path, this.startX, this.startY);
				const mouseInPoint = this.isPointInPath(tasks[i].item.path, this.mouseX, this.mouseY);
				if (mouseInPoint) { tasks[i].status.hover = true; }
				if (this.isMousePress) {
					if (mouseInPoint) { tasks[i].status.press = true; }
					if (tasks[i].item.draggable && startInPoint && !mouseInPoint) { tasks[i].status.drag = true; from = tasks[i].item; }
					if (!startInPoint && mouseInPoint) { tasks[i].status.drop = {from}; }
				}
			}
		}
		for (let i = 0; i < tasks.length; i++) { if (tasks[i].item.draw) { tasks[i].item.draw(tasks[i].status); } }
		for (let i = 0; i < tasks.length; i++) { if (tasks[i].item.drawSecond) { tasks[i].item.drawSecond(tasks[i].status); } }
	}
	
	disabled = false;
	isMousePress = false;
	isDragged = false;
	
	mouseX = -1;
	mouseY = -1;
	startX = -1;
	startY = -1;
	
	constructor(ctx, getMouseCoordinates, isPointInPath) {
		this.ctx = ctx;
		this.isPointInPath = isPointInPath
			? (path, x, y) => isPointInPath(new this.#Path(path), x, y)
			: (path, x, y) => this.ctx.isPointInPath(new this.#Path(path), x, y);
		
		if (getMouseCoordinates) {
			const isSmartphone = 'ontouchstart' in window;
			
			this.ctx.canvas.addEventListener(isSmartphone ? 'touchstart' : 'mousedown', (event) => {
				[this.mouseX, this.mouseY] = [this.startX, this.startY] = getMouseCoordinates(event);
				this.isMousePress = true;
				this.isDragged = false;
				this.update();
			});
			
			this.ctx.canvas.addEventListener(isSmartphone ? 'touchmove' : 'mousemove', (event) =>{
				[this.mouseX, this.mouseY] = getMouseCoordinates(event);
				this.isDragged = true;
				this.update();
			});
			
			this.ctx.canvas.addEventListener(isSmartphone ? 'touchend' : 'mouseup', () => {
				if (!this.#eval(this.disabled)) {
					const tasks = this.#items.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)).map(item => ({
						item,
						status: { hover: false, press: false, drag: false, drop: null }
					}));
					const finalIndex = tasks.findIndex(task => task.item.final);
					const startIndex = finalIndex === -1 ? 0 : finalIndex;
					let from = null;
					for (let i = startIndex; i < tasks.length; i++) {
						if (this.#eval(tasks[i].item.disabled) || !tasks[i].item.path) { continue; }
						const startInPoint = this.isPointInPath(tasks[i].item.path, this.startX, this.startY);
						const mouseInPoint = this.isPointInPath(tasks[i].item.path, this.mouseX, this.mouseY);
						if (startInPoint && mouseInPoint) { tasks[i].status.click = true; }
						if (tasks[i].item.draggable && startInPoint && !mouseInPoint) { from = tasks[i].item; }
						if (!startInPoint && mouseInPoint) { tasks[i].status.drop = {from}; }
					}
					for (let i = startIndex; i < tasks.length; i++) {
						if (tasks[i].status.click && tasks[i].item.onClick) { tasks[i].item.onClick(); }
						if (tasks[i].status.drop && tasks[i].item.onDrop) { tasks[i].item.onDrop(tasks[i].status.drop?.from); }
					}
				}
				this.isMousePress = false;
				this.isDragged = false;
				[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
				this.update();
			});
			
			if (!isSmartphone) {
				this.ctx.canvas.addEventListener('mouseleave', () => {
					this.isMousePress = false;
					this.isDragged = false;
					[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
				});
			}
		}
	}
}
