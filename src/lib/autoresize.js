'use strict';

class AutoresizeCanvas {
	constructor (wrap, w, h, canRotate) {
		this.canvas = document.createElement('canvas');
		const div = document.createElement('div');
		div.style.position = 'absolute';
		div.append(this.canvas);
		if (getComputedStyle(wrap).getPropertyValue('position') === 'static') {
			wrap.style.position = 'relative';
		}
		wrap.append(div);
		
		this.context = this.canvas.getContext('2d');
		this.isRotated = false;
		this.onResize = () => {};
		
		this.getMouseCoordinates = (event) => {
			const [clientX, clientY] = event.type.includes('mouse')
				? [event.clientX, event.clientY]
				: [event.touches[0].clientX, event.touches[0].clientY];
			const rect = event.target.getBoundingClientRect();
			const [offsetX, offsetY] = [clientX - rect.left, clientY - rect.top];
			return !this.isRotated
				? [offsetX * w / div.offsetWidth, offsetY * h / div.offsetHeight]
				: [offsetY * w / div.offsetHeight, h - offsetX * h / div.offsetWidth];
		};

		const convertBack = (x, y) => !this.isRotated
			? [x * div.offsetWidth * devicePixelRatio / w, y * div.offsetHeight * devicePixelRatio / h]
			: [x * div.offsetWidth * devicePixelRatio / h, y * div.offsetHeight * devicePixelRatio / w];

		this.isScaledPointInPath = (path, x, y) => {
			return this.context.isPointInPath(path, ...convertBack(x, y));
		};
		
		new ResizeObserver(() => {
			this.isRotated = canRotate && w > h !== wrap.clientWidth > wrap.clientHeight;
			const [w_, h_] = this.isRotated ? [h, w] : [w, h];
			if (wrap.clientWidth / wrap.clientHeight > w_ / h_) {
				div.style.width = wrap.clientHeight * w_ / h_ + 'px';
				div.style.height = wrap.clientHeight + 'px';
				div.style.top = 0;
				div.style.left = (wrap.clientWidth - wrap.clientHeight * w_ / h_) / 2 + 'px';
			}
			else {
				div.style.width = wrap.clientWidth + 'px';
				div.style.height = wrap.clientWidth * h_ / w_ + 'px';
				div.style.top = (wrap.clientHeight - wrap.clientWidth * h_ / w_) / 2 + 'px';
				div.style.left = 0;
			}
			this.canvas.style.transform = this.isRotated? `rotate(90deg) translate(-${div.offsetWidth}px)` : '';
			this.canvas.style.transformOrigin = this.isRotated? 'left bottom' : '';
			const [width, height] = this.isRotated? [div.clientHeight, div.clientWidth] : [div.clientWidth, div.clientHeight];
			this.canvas.width  = width  * devicePixelRatio;
			this.canvas.height = height * devicePixelRatio;
			this.canvas.style.width  = width  + 'px';
			this.canvas.style.height = height + 'px';
			this.context.scale(width * devicePixelRatio / w, height * devicePixelRatio / h);
			this.onResize();
		}).observe(wrap);
	}
}
