"use strict";

const gameScene = (config = {
	handLength: 14,
	showHandGuide: true,
	showCityTable: true,
	strictRule: false,
}, debugMauntain) => {
	$.reset();

	const game = new Game(config.handLength, debugMauntain);
	let isReachChecked = false;
	let handItem;
	let selectingHandItem;
	let kanButtons = [];
	let isSelecting = false;
	let selectingClass;
	let selectingWinButton;

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
				$.deleteItem(selectButton);
				$.deleteItem(reachButton);
				$.deleteItem(handTrashArea);
				$.deleteItem(...kanButtons);
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
		zIndex: 0,
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
			if (handItem.hand.includes(from)) {
				cutHand(handItem.hand.indexOf(from));
			}
		}
	});

	game.onUpdateHand = () => {
		handItem?.removeItems?.();
		handItem = new HandItem(game, {
			drawSecond: ({hover, press}, tile) => {
				if (config.showCityTable && hover && !(press && !IS_SMARTPHONE)) {
					drawCityTable(game.hand, tile.character);
				}
			},
			onClick: (i) => {
				if (!IS_SMARTPHONE) { cutHand(i); }
			},
		});
		$.deleteItem(...kanButtons);
		kanButtons = $.addItem(...game.cities.filter(city => city.length === 4).map(city => new Button({
			rect: [handItem.hand[city.position].path.rect[0] + 10, 620, 380, 40],
			draw: function([x, y, w, h]) { $.ctx.bbText("カン", x + w / 2, y + h / 2, {size: 30, align: "center", baseline: "middle"}); },
			onClick: async () => {
				game.kan(city.position);
				$.disabled = true;
				await sleep(300);
				game.tsumo({isRinshan: true});
				$.disabled = false;
				$.update();
			}
		})));
		
		if (isSelecting) {
			const latestTsumoPosition = game.hand.indexOf(game.latestTsumo);
			selectingHandItem?.removeItems?.();
			selectingHandItem = new HandItem(game, {
				zIndex: 101, // dialogより上
				y: 130,
				draw: ({}, tile, i) => {
					if (i === latestTsumoPosition) {
						$.ctx.bbFill({
							rect: [selectingHandItem.hand[i].path.rect[0] + 10, 105, 80, 20],
							radius: 10
						}, "#fcc")
						$.ctx.bbText("ツモ", selectingHandItem.hand[i].path.rect[0] + 50, 105, {size: 20, align: "center", style: "bold", color: "#f00"});
					}
				}
			});
			
			selectingClass?.removeItems?.();
			selectingClass = new SelectingCityClass(
				game.cities,
				selectingHandItem.hand.map(item => item.path.rect[0]),
				latestTsumoPosition,
				config.strictRule
			);
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
				$.deleteItem(selectingWinButton);
				selectingHandItem.removeItems();
				selectingClass.removeItems();
				isSelecting = false;
			}
		}));
		[selectingWinButton] = $.addItem(new Button({
			zIndex: 101,
			disabled: () => {
				const selectedCities = selectingClass.buttons.filter(button => button.selected).map(button => button.city.name);
				return selectedCities.reduce((a, b) => a + b.length, 0) !== game.hand.length;
			},
			rect: [1250, 780, 300, 80],
			value: "面子を確定",
			onClick: function() {
				const cities = selectingClass.buttons.filter(button => button.selected).map(button => button.city).map(city => {
					const cityTiles = [];
					for (let i = city.position; i < city.position + city.length; i++) {
						cityTiles.push(game.hand[i]);
					}
					return {...city, tiles: cityTiles};
				})
				for (const kan of game.kans) {
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
		if (config.strictRule) {
			$.ctx.bbText("⚠️くっつき待ち制限: ON", 1556, 20, {size: 30, align: "right"});
		}
		if (config.showHandGuide) {
			calcCityOverlap(game.cities).map(({city, overlap}) => {
				$.ctx.bbFill({
					rect: [
						handItem.hand[city.position].path.rect[0] + 10,
						840 + overlap * 10,
						100 * city.length - 20,
						5
					],
					radius: 2.5
				}, "#f00");
			});
		}
	};
	
	$.update();
};
