'use strict';

const ResponsiveCanvas = (wrap, w, h, canRotate) => {
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
	
	ctx.convert = (x, y) => !isRotated
		? [x * w / div.offsetWidth, y * h / div.offsetHeight]
		: [y * w / div.offsetHeight, h - x * h / div.offsetWidth];
	
	ctx.convertBack = (x, y) => !isRotated
		? [x * div.offsetWidth * devicePixelRatio / w, y * div.offsetHeight * devicePixelRatio / h]
		: [x * div.offsetWidth * devicePixelRatio / h, y * div.offsetHeight * devicePixelRatio / w];
	
	new ResizeObserver(() => {
		isRotated = canRotate && w > h !== wrap.clientWidth > wrap.clientHeight;
		const [w_, h_] = !isRotated? [w, h] : [h, w];
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
		canvas.style.cssText = !isRotated? '' : `
			transform-origin: left bottom;
			transform: rotate(90deg) translate(-${div.offsetWidth}px);
		`;
		const [width, height] = !isRotated? [div.clientWidth, div.clientHeight] : [div.clientHeight, div.clientWidth];
		canvas.width  = width  * devicePixelRatio;
		canvas.height = height * devicePixelRatio;
		canvas.style.width  = width  + 'px';
		canvas.style.height = height + 'px';
		ctx.scale(width * devicePixelRatio / w, height * devicePixelRatio / h);
		ctx.onResize();
	}).observe(wrap);
	
	return ctx;
};
