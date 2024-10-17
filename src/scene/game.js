"use strict";

const gameScene = (config = {
	handLength: 14,
	showHandGuide: true,
	showCityTable: true,
	restrictRule: false,
}, debugMauntain) => {
	$.reset();

	const game = new Game(config.handLength, debugMauntain);
	let isReachChecked = false;
	let isSelecting = false;
	let selectedCities = [];
	let handItem = {};
	let selectingHandItem = {};
	let selectingWinButton;
	let selectingCityButtons = [];

	const cutHand = async (i) => {
		try {
			game.cutHand(i, isReachChecked);
			$.disabled = true;
			if (isReachChecked) {
				$.deleteItem(reachButton);
				isReachChecked = false;
			}
			await sleep(300);
			game.tsumo();
		} catch(e) {
			if (e.message === "リーチ後の手出し") {
				alert("リーチ後はツモ切りしかできません");
			}
			if (e.message === "ツモる牌がもうありません (終局)") {
				isFinished = true;
				$.deleteItem(selectButton);
				$.deleteItem(reachButton);
				$.deleteItem(handTrashArea);
				handItem.disable();
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
	
	const [selectButton] = $.addItem(new Button({
		rect: [1250, 420, 250, 80],
		value: "点数計算",
		onClick: function() {
			selectingStart();
		}
	}));

	const [reachButton] = $.addItem(new Button({
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
	}));

	const handTrashArea = $.addItem({
		zIndex: 1,
		path: { rect: [400, 40, 800, 460] },
		draw: function({drop}) {
			if (drop && handItem.hand.includes(drop.from)) {
				$.ctx.bbFill(this.path, "rgb(0 0 0 / .1)");
				$.ctx.setLineDash([15, 5]);
				$.ctx.bbStroke(this.path, {color: "#000", width: 4});
				$.ctx.setLineDash([]);
			}
		},
		onDrop: (from) => {
			const handIndex = handItem.hand.indexOf(from);
			if (handIndex !== -1) { cutHand(handIndex); }
		}
	});

	game.onUpdateHand = () => {
		if (handItem.destructor) { handItem.destructor(); }
		handItem = new HandItem(game, {
			showTable: config.showCityTable,
			kanEnabled: true,
			onClick: (i) => {
				if (!IS_SMARTPHONE) { cutHand(i); }
			},
			kanButtonOnClick: async (position) => {
				game.kan(position);
				$.disabled = true;
				await sleep(300);
				game.tsumo({isRinshan: true});
				$.disabled = false;
				$.update();
			}
		});
		
		if (isSelecting) {
			selectedCities = [];
			const handPosition = calcHandPosition(game.hand, game.kans);
			const latestTsumoPosition = game.hand.indexOf(game.latestTsumo);

			if (selectingHandItem.destructor) { selectingHandItem.destructor(); }
			selectingHandItem = new HandItem(game, {
				zIndex: 101, // dialogより上
				y: 130,
			});
			/*
				if (i === latestTsumoPosition) {
					$.ctx.bbFill({
						rect: [handPosition[i] + 10, 105, 80, 20],
						radius: 10
					}, "#fcc")
					$.ctx.bbText("ツモ", handPosition[i] + 50, 105, {size: 20, align: "center", style: "bold", color: "#f00"});
				}
			*/

			$.deleteItem(...selectingCityButtons);
			const count = Array(handPosition.length).fill().map(() => []);
			selectingCityButtons = $.addItem(...game.cities.filter(city => city.length !== 4).map(city => {
				const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
				let line = 0; while(set.includes(line)) { line++; }
				for (let i = 0; i < city.length; i++) {
					count[city.position + i].push(line);
				}
				return createSelectingHandButton(city, [
					handPosition[city.position] + 2.5,
					270 + line * 105,
					100 * city.length - 5,
					100
				], latestTsumoPosition, selectingCityButtons, selectedCities, config.restrictRule);
			}));
		}
	};
	game.onUpdateHand();
	
	const selectingStart = () => {
		isSelecting = true;
		$.addItem(new Dialog({
			rect: [20, 20, 1560, 860],
			draw: () => {
				for (let i = 0; i < game.kans.length; i++) {
					const x = 1560 - 21 - 324 * (i + 1) - 8 * i;
					for (let j = 0; j < 4; j++) {
						drawTile([x + 81 * j, 137, 81], game.kans[i][j]); 
					}
				}
			},
			onClose: () => {
				isSelecting = false;
				$.deleteItem(selectingWinButton);
				$.deleteItem(...selectingCityButtons);
				selectingHandItem.destructor();
			}
		}));
		[selectingWinButton] = $.addItem(new Button({
			zIndex: 101,
			disabled: () => selectedCities.reduce((a, b) => a + b.length, 0) !== game.hand.length,
			rect: [1250, 780, 300, 80],
			value: "面子を確定",
			onClick: function() {
				const cities = selectedCities.map(city_ => {
					const { position, length, ...city } = city_;
					const cityTiles = [];
					for (let i = city_.position; i < city_.position + city_.length; i++) {
						cityTiles.push(game.hand[i]);
					}
					return {...city, tiles: cityTiles};
				});
				for (let kan of game.kans) {
					const cityname = kan.reduce((a, b) => a + b.character, "");
					cities.push({
						...CITIES.filter(city => city.name === cityname)[0],
						tiles: kan
					});
				}
				scoreScene(game, cities, config);
			}
		}));
		game.onUpdateHand();
		$.update();
	};
	
	$.addItem(new InfoButton({
		center: {x: 1310, y: 370},
		radius: 20,
		dialogRect: [550, 300, 500, 300],
		label: "操作方法",
		dialogDraw: () => {
			$.ctx.bbText("操作方法", 250, 20, {size: 40, align: "center"});
			const messages = !IS_SMARTPHONE
				? ["ドラッグで理牌", "クリックで打牌"]
				: ["ドラッグで理牌", "河にドラッグで打牌"];		
			if (config.showCityTable && IS_SMARTPHONE) {
				messages.push("長押しで市町村一覧");
			}
			messages.map((message, i) => {
				$.ctx.bbText(message, 250, 100 + 60 * i, {size: 40, align: "center"});
			});
		}
	}));
	
	$.draw = () => {
		$.ctx.bbFill({rect: [0, 0, 1600, 900]}, COLOR_BACKGROUND);
		drawDora(game.dora, game.uradora, game.kans.length + 1);
		drawTrash(game.trash, game.reachCount);
		drawKan(game.kans);
		if (config.restrictRule) {
			$.ctx.bbText("⚠️くっつき待ち制限: ON", 1556, 20, {size: 30, align: "right"});
		}
		if (config.showHandGuide) {
			const handPosition = calcHandPosition(game.hand, game.kans);
			drawHandGuide(game.cities, handPosition);
		}
	};

	$.update();
};
