"use strict";

class ItemsCanvas {
	#eval (arg) {
		return typeof arg === "function"? arg() : arg;
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
	
	makePath (arg) {
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

	item(arg) {
		const makePath = this.makePath;
		return {
			path: arg.path ?? (arg.rect && makePath({rect: arg.rect, radius: arg.radius})),
			updateRect: function (rect) {
				this.rect = rect;
				this.path = makePath({rect: this.rect, radius: this.radius})
			},
			...arg
		};
	}

	// イベント処理
	addItem(arg) {
		if (Array.isArray(arg)) {
			arg.forEach(item => this.#items.push(item));
		}
		else {
			this.#items.push(arg);
		}
		this.#execOnUpdate();
	}
	
	deleteItem(arg) {
		if (Array.isArray(arg)) {
			arg.forEach(item => this.#items = this.#items.filter(_ => _ !== item));
		}
		else {
			this.#items = this.#items.filter(_ => _ !== arg);
		}
		this.#execOnUpdate();
	}
	
	#image = new Image();

	#execOnUpdate(ctx) {
		this.ctx.clearRect(0, 0, 16, 9);
		this.draw();
		for (let item of this.#items) {
			if (!this.#eval(item.disabled) && item.draw) {
				item.draw();
			}
		}
		this.drawFinally();
		this.#image.src = this.ctx.canvas.toDataURL("png");
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
		this.ctx.clearRect(0, 0, 16, 9)
		this.ctx.drawImage(this.#image, 0, 0, 16, 9);
		this.onEvent();
		for (let item of this.#items) {
			if (!this.#eval(item.disabled) && !this.#eval(item.eventDisabled) && this.isPointInPath(item.path, this.mouseX, this.mouseY)) {
				if (item.onHover) { item.onHover();} 
				if (this.isMousePress && item.onMousePress) { item.onMousePress(); }
			}
		}
	}
	
	#execOnMouseUp(isClick) {
		if (this.eventDisabled) { return; }
		this.ctx.clearRect(0, 0, 16, 9)
		this.ctx.drawImage(this.#image, 0, 0, 16, 9);
		isClick? this.onClick() : this.onMouseUp();
		for (let item of this.#items) {
			if (!this.#eval(item.disabled) && !this.#eval(item.eventDisabled) && this.isPointInPath(item.path, this.mouseX, this.mouseY)) {
				if (isClick && item.onClick) { item.onClick(); }
				if (!isClick && item.onMouseUp) { item.onMouseUp(); }
			}
		}
	}

	constructor(ctx, convert, convertBack) {
		this.ctx = ctx;
		this.convertBack = convertBack;
		const isSmartphone = "ontouchstart" in window;
		
		const getOffset = (event) => {
			const [clientX, clientY] = event.type.includes("mouse")
				? [event.clientX, event.clientY]
				: [event.touches[0].clientX, event.touches[0].clientY];
			const rect = event.target.getBoundingClientRect();
			return [clientX - pageXOffset - rect.left, clientY - pageYOffset - rect.top];
		};
		
		const onMouseup = () => {
			this.#execOnEvent();
			const diff = (this.mouseX - this.startX) ** 2 + (this.mouseY - this.startY) ** 2;
			this.isMousePress = false;
			this.#execOnMouseUp(diff < 16);
			[this.mouseX, this.mouseY] = [this.startX, this.startY] = [-1, -1];
		};
		
		this.ctx.canvas.addEventListener(isSmartphone? "touchstart" : "mousedown", function(event) {
			[this.mouseX, this.mouseY] = [this.startX, this.startY] = convert(...getOffset(event));
			this.isMousePress = true;
			this.#execOnEvent();
		}.bind(this));

		this.ctx.canvas.addEventListener(isSmartphone? "touchmove" : "mousemove", function(event) {
			[this.mouseX, this.mouseY] = convert(...getOffset(event));
			this.#execOnEvent();
		}.bind(this));
		
		this.ctx.canvas.addEventListener(isSmartphone? "touchend" : "mouseup", function(event) {
			[this.mouseX, this.mouseY] = convert(...getOffset(event));
			onMouseup();
		}.bind(this));
		
		if (!isSmartphone) {
			this.ctx.canvas.addEventListener("mouseleave", function(event) {
				[this.mouseX, this.mouseY] = [-1, -1];
				onMouseup();
			}.bind(this));
		}
	};
};
