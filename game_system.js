const MAX_COUNT = 3;

class GameTiles {
	mountain;
	dora;
	uradora;
	count = 0;
	hand;
	trash = [];
	kans = [];
	group;
	latestTsumo;
	isRinshan;
	reached = false;
	reachCount = -1;

	cutHand(i, isReach) {
		if (this.reachCount !== -1 && this.latestTsumo !== this.hand[i]) { throw new Error("リーチ後の手出し"); }
		if (isReach) { this.reachCount = this.count; }
		this.trash[this.count++] = this.hand[i];
		this.hand.splice(i, 1);
		this.hand.push(null);
		this.updateGroup();
	}

	tsumo({isRinshan = false} = {}) {
		if (this.count === MAX_COUNT) { throw new Error("ツモる牌がもうありません (終局)"); }
		this.isRinshan = isRinshan;
		this.hand[this.hand.length - 1] = this.latestTsumo = this.mountain.shift();
		this.updateGroup();
	}

	kan(i) {
		const city = this.group.filter(city => city.length === 4)[i];
		this.kans.push(this.hand.splice(city.position, 4));
		this.hand.push(null);
		this.updateGroup();
	}

	// x番目の牌を, y番目の隙間に
	replaceHand(x, y) {
		if (x === y || x === y - 1) { return; }
		this.hand.splice(x < y? y - 1 : y, 0, this.hand.splice(x, 1)[0]);
		this.updateGroup();
	}

  onUpdateGroup = () => {}

	updateGroup = () => {
		this.group = [];
		for (let i = 0; i < this.hand.length; i++) {
			for (let city of CITIES) {
				for (let k = 0; k < city.name.length; k++) {
					if (this.hand[i + k]?.character !== city.name[k]) { break; }
					if (k === city.name.length - 1) {
						this.group.push({
							...city,
							position: i,
							length: city.name.length
						});
					}
				}
			}
		}
    this.onUpdateGroup();
	};

	constructor(handLength, debugMauntain) {
		this.mountain = debugMauntain ?? shuffle(structuredClone(TILES));
		this.hand = new Array(handLength).fill().map(() => this.mountain.shift());

    const createDora = () => {
      const tile = this.mountain.shift();
      return {tile, char: DORA[tile.character]};
    };
		this.dora = new Array(5).fill().map(() => createDora());
		this.uradora = new Array(5).fill().map(() => createDora());
		this.updateGroup();
	};
}
