const changeCanvasSize = () => {
	const width  = innerWidth;
	const height = innerHeight;
	if (width >= height) {
		canvas.isRotated = false;
		if (width / height > 16 / 9) {
			document.getElementById("game").style.width = height * 16 / 9 + "px";
			document.getElementById("game").style.height = height + "px";
			document.getElementById("game").style.top = 0;
			document.getElementById("game").style.left = (width - height * 16 / 9) / 2 + "px";
		}
		else {
			document.getElementById("game").style.width = width + "px";
			document.getElementById("game").style.height = width * 9 / 16 + "px";
			document.getElementById("game").style.top = (height - width * 9 / 16) / 2 + "px";
			document.getElementById("game").style.left = 0;
		}
	}
	else {
		canvas.isRotated = true;
		if (width / height > 9 / 16) {
			document.getElementById("game").style.width = height * 9 / 16 + "px";
			document.getElementById("game").style.height = height + "px";
			document.getElementById("game").style.top = 0;
			document.getElementById("game").style.left = (width - height * 9 / 16) / 2 + "px";
		}
		else {
			document.getElementById("game").style.width = width + "px";
			document.getElementById("game").style.height = width * 16 / 9 + "px";
			document.getElementById("game").style.top = (height - width * 16 / 9) / 2 + "px";
			document.getElementById("game").style.left = 0;
		}
	}
};

const resizeObserver = new ResizeObserver(changeCanvasSize);
const canvas = new BBCanvas(document.getElementById("game"), 16, 9);
menuScene(canvas);
