"use strict";

const gameScene = (config = {
	handLength: 14,
	showHandGuide: true,
	showCityTable: true,
	restrictRule: false,
}, isFirstPlay, debugMauntain) => {
	$.reset();
	const tiles = new GameTiles(config.handLength, debugMauntain);
	let isReachChecked = false;
	let isSelecting = false;
	let isFinished = false;

	const cutHand = async (i) => {
		try {
			tiles.cutHand(i, isReachChecked);
			$.disabled = true;
			if (isReachChecked) {
				$.deleteItem(reachButton);
				isReachChecked = false;
			}
			$.update();
			await sleep(300);
			tiles.tsumo();
		} catch(e) {
			if (e.message === "リーチ後の手出し") {
				alert("リーチ後はツモ切りしかできません");
			}
			if (e.message === "ツモる牌がもうありません (終局)") {
				isFinished = true;
				$.deleteItem(kanButtons);
				$.deleteItem(selectButton);
				$.deleteItem(reachButton);
				$.deleteItem(tileDragArea);
				$.addItem(new Button({
					rect: [300, 580, 400, 80],
					value: "もう一度遊ぶ",
					onClick: () => gameScene(config)
				}));
				$.addItem(new Button({
					rect: [900, 580, 400, 80],
					value: "メニューに戻る",
					onClick: () => menuScene()
				}));
			}
		} finally {
			$.disabled = false;
			$.update();
		}
	};
	
	const execKan = async (i) => {
		tiles.kan(i);
		$.disabled = true;
		$.update();
		await sleep(300);
		tiles.tsumo({isRinshan: true});
		$.disabled = false;
		$.update();
	};
	
	const	selectButton = $.addItem(
		new Button({
			rect: [1250, 420, 250, 80],
			value: "点数計算",
			onClick: function() {
				isSelecting = true;
				selectingStart(tiles, () => isSelecting = false, config);
				$.update();
			}
		})
	);
	
	const reachButton = $.addItem(
		new Button({
			rect: [1250, 520, 250, 80],
			value: "　リーチ",
			draw: function([x, y, w, h]) {
				drawCheckbox(x + 50, y + 24, isReachChecked);
				if (isReachChecked) {
					$.ctx.bbText("テンパイしていなくてもリーチ宣言可能です。待ちを確認してリーチしてください。", x + w - 250, y, {size: 30, color: "#f00", align: "right"});
				}
			},
			onClick: function() {
				isReachChecked = !isReachChecked;
				$.update();
			},
		})
	);

	let handButtons = [];
	let kanButtons = [];

	tiles.onUpdateGroup = () => {
		const handPosition = calcHandPosition(tiles.hand, tiles.kans);

		$.deleteItem(handButtons);
		handButtons = $.addItem(tiles.hand.map((tile, i) => ({
			...(isSelecting
				? {_disabled: () => isFinished, disabled: true}
				: {disabled: () => isFinished}
			),
			path: { rect: [handPosition[i], 700, 99, 100 * 4 / 3] },
			draw: function() {
				if (tile) { drawTile(this.path.rect, tile, {perspective: "up"}); }
			},
			onHover: function() {
				if (!$.isMousePress) {
					$.ctx.bbFill(this.path, "rgba(0 0 0 / .1)");
				}
				if (config.showCityTable && !isSelecting && !(!IS_SMARTPHONE && $.isMousePress)) {
					drawCityTable(tiles.hand, tile.character);
				}
			},
			onClick: function() {
				if (!IS_SMARTPHONE) { cutHand(i); }
			}
		})));
		
		$.deleteItem(kanButtons);
		kanButtons = $.addItem(tiles.group.filter(city => city.length === 4).map((city, i) => new Button({
			...(isSelecting && {_disabled: () => isFinished, disabled: true}),
			rect: [handPosition[city.position] + 10, 620, 380, 40],
			draw: function([x, y, w, h]) { $.ctx.bbText("カン", x + w / 2, y + h / 2, {size: 30, align: "center", baseline: "middle"}); },
			onClick: function() { execKan(i); }
		})));

		if (isSelecting) { selectingOnUpdateGroup(tiles); }
	};
	tiles.onUpdateGroup();

	if (isFirstPlay) {
		const messages = !IS_SMARTPHONE
			? ["ドラッグで理牌", "クリックで打牌"]
			: ["ドラッグで理牌", "河にドラッグで打牌"];		
		if (config.showCityTable) {
			messages.push((!IS_SMARTPHONE? "長押し" : "マウスオーバー") + "で市町村一覧");
		}
		$.addItem(new Dialog({
			rect: [500, 400, 600, 25 + 60 * messages.length],
			modal: true,
			draw: function() {
				for (let i in messages) {
					$.ctx.bbText(messages[i], 300, 20 + 60 * i, {size: 40, align: "center"});
				}
			}
		}));
	}

	const tileDragArea = $.addItem({
		path: { rect: [0, 0, 1600, 900] },
		onMousePress: function() {
			if (($.mouseX - $.startX) ** 2 + ($.mouseY - $.startY) ** 2 < 1000) { return; }
			const handPosition = calcHandPosition(tiles.hand, tiles.kans);
			const handDragPosition = calcHandPosition(tiles.hand, tiles.kans, true);
			for (let i = 0; i < handPosition.length; i++) {
				if ($.isPointInPath({rect: [handPosition[i], 700, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
					drawTile([$.mouseX - 50, $.mouseY - 67, 100], tiles.hand[i]);
					if ($.isPointInPath({rect: [400, 40, 800, 460]}, $.mouseX, $.mouseY)) {
						$.ctx.bbFill({rect: [400, 40, 800, 460]}, "rgb(0 0 0 / .1)");
						$.ctx.setLineDash([15, 5]);
						$.ctx.bbStroke({rect: [400, 40, 800, 460]}, {color: "#000", width: 4});
						$.ctx.setLineDash([]);
						return; 
					}
					for (let j = 0; j < handDragPosition.length; j++) {
						if (i === j || i + 1 === j) { continue; }
						if ($.isPointInPath({rect: [handDragPosition[j], 700, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
							const x = handDragPosition[j] + 50;
							const y = 640;
							$.ctx.bbFill({points:[ [x, y + 24], [x - 20, y], [x + 20, y]]}, "#cc0");
							return;
						}
					}
				}
			}
		},
		onMouseUp: function() {
			const handPosition = calcHandPosition(tiles.hand, tiles.kans);
			const handDragPosition = calcHandPosition(tiles.hand, tiles.kans, true);
			for (let i = 0; i < handPosition.length; i++) {
				if ($.isPointInPath({rect: [handPosition[i], 700, 99, 100 * 4 / 3] }, $.startX, $.startY)) {
					if ($.isPointInPath({rect: [400, 40, 800, 460]}, $.mouseX, $.mouseY)) {
						cutHand(i);
						return;
					}
					for (let j = 0; j < handDragPosition.length; j++) {
						if ($.isPointInPath({rect: [handDragPosition[j], 700, 99, 100 * 4 / 3]}, $.mouseX, $.mouseY)) {
							tiles.replaceHand(i, j);
							$.update();
							return;
						}
					}
				}
			}
		}
	});

	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		drawDora(tiles.dora, tiles.uradora, tiles.kans.length + 1);
		drawTrash(tiles.trash, tiles.reachCount);
		drawKan(tiles.kans);
		if (config.restrictRule) {
			$.ctx.bbText("⚠️くっつき待ち制限: ON", 1556, 20, {size: 30, align: "right"});
		}
		if (config.showHandGuide) {
			const handPosition = calcHandPosition(tiles.hand, tiles.kans);
			drawHandGuide(tiles.group, handPosition);
		}
	};

	$.update();
};
