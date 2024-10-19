const drawCursor = (x, y, size) => {
	const points = [
		[0, 0],
		[0, 15],
		[4, 11],
		[7, 17],
		[8, 16],
		[5, 10],
		[10, 10]
	].map(([x_, y_]) => [x + x_ * size, y + y_ * size]);
	$.ctx.bbStroke({points}, {color: "#fff", width: 4});
	$.ctx.bbFill({points}, "#000");
};

const menuShowCityGuideInfoDraw = () => {
	$.ctx.bbText("手牌中の市町村を表示します", 350, 80, {size: 40, align: "center"});
	[
		{ character: "山", count: 38 },
		{ character: "十", count: 4 },
		{ character: "津", count: 31 },
		{ character: "川", count: 61 },
		{ character: "上", count: 25 }
	].map((tile, i) => {
		drawTile([150 + 82 * i, 190, 81], tile, {perspective: "up"});
	});
	[
		{line: 0, position: 1, length: 3},
		{line: 1, position: 2, length: 1},
		{line: 1, position: 3, length: 2}
	].map((data) => {
		$.ctx.bbFill({
			rect: [
				150 + 82 * data.position + 8.2,
				303 + data.line * 8.2,
				82 * data.length - 16.4,
				4.1,
			],
			radius: 2
		}, "#f00");
	});
};

const menuShowCityTableInfoDraw = () => {
	$.ctx.bbText("牌を含む市町村の一覧を表示します", 350, 80, {size: 40, align: "center"});
	const start_x = 260;
	const start_y = 150;
	const TEXT_SIZE = 26;
	$.ctx.bbFill({rect: [start_x - 13, start_y - 13, 180 + 26, TEXT_SIZE * 1.5 * 4 + 12]}, COLOR_STRONG);
	$.ctx.bbFill({rect: [start_x - 10, start_y - 10, 180 + 20, TEXT_SIZE * 1.5 * 4 + 6]}, "#fff");
	["新十津川町", "十和田市", "十津川村", "十島村"].map((city, i) => {
		$.ctx.bbText(city, start_x, start_y + i * TEXT_SIZE * 1.5, {size: TEXT_SIZE});
	});
	[
		{ character: "山", count: 38 },
		{ character: "十", count: 4 },
		{ character: "津", count: 31 },
		{ character: "川", count: 61 },
		{ character: "上", count: 25 }
	].map((tile, i) => {
		drawTile([150 + 82 * i, 350, 81], tile, {perspective: "up"});
	});
	$.ctx.bbFill({rect: [232, 350, 81, 108]}, "rgba(0 0 0 / .1)");
	drawCursor(280, 430, 2);
};
