'use strict';

const AutoresizeCanvas = (wrap, w, h, canRotate) => {
	const canvas = document.createElement('canvas');
	const div = document.createElement('div');
	div.style.position = 'absolute';
	div.append(canvas);
	if (getComputedStyle(wrap).getPropertyValue('position') === 'static') {
		wrap.style.position = 'relative';
	}
	wrap.append(div);
	
	let isRotated = false;
	
	const ctx = canvas.getContext('2d');
	ctx.onResize = () => {};
	
	ctx.getMouseCoordinates = (event) => {
		const [clientX, clientY] = event.type.includes('mouse')
			? [event.clientX, event.clientY]
			: [event.touches[0].clientX, event.touches[0].clientY];
		const rect = event.target.getBoundingClientRect();
		const [offsetX, offsetY] = [clientX - rect.left, clientY - rect.top];
		return !isRotated
			? [offsetX * w / div.offsetWidth, offsetY * h / div.offsetHeight]
			: [offsetY * w / div.offsetHeight, h - offsetX * h / div.offsetWidth];
	};

	const convertBack = (x, y) => !isRotated
		? [x * div.offsetWidth * devicePixelRatio / w, y * div.offsetHeight * devicePixelRatio / h]
		: [x * div.offsetWidth * devicePixelRatio / h, y * div.offsetHeight * devicePixelRatio / w];

	ctx.isScaledPointInPath = (path, x, y) => {
		return ctx.isPointInPath(path, ...convertBack(x, y));
	};
	
	new ResizeObserver(() => {
		isRotated = canRotate && w > h !== wrap.clientWidth > wrap.clientHeight;
		const [w_, h_] = isRotated ? [h, w] : [w, h];
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
		canvas.style.transform = isRotated? `rotate(90deg) translate(-${div.offsetWidth}px)` : '';
		canvas.style.transformOrigin = isRotated? 'left bottom' : '';
		const [width, height] = isRotated? [div.clientHeight, div.clientWidth] : [div.clientWidth, div.clientHeight];
		canvas.width  = width  * devicePixelRatio;
		canvas.height = height * devicePixelRatio;
		canvas.style.width  = width  + 'px';
		canvas.style.height = height + 'px';
		ctx.scale(width * devicePixelRatio / w, height * devicePixelRatio / h);
		ctx.onResize();
	}).observe(wrap);
	
	return ctx;
};
