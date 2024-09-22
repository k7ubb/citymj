const MAX_COUNT = 36;

class Game {
	mountain;
	dora;
	uradora;
	count = 0;
	hand;
	trash = [];
	kans = [];
	cities;
	latestTsumo;
	isRinshan;
	reachCount = -1;

	constructor(handLength, debugMauntain) {
		this.mountain = debugMauntain ?? shuffle(structuredClone(TILES));
		this.hand = new Array(handLength).fill().map(() => this.mountain.shift());

    const createDora = () => {
      const tile = this.mountain.shift();
      return {tile, char: DORA[tile.character]};
    };
		this.dora = new Array(5).fill().map(() => createDora());
		this.uradora = new Array(5).fill().map(() => createDora());
		this.updateCities();
	}

	cutHand(i, isReach) {
		if (this.reachCount !== -1 && this.latestTsumo !== this.hand[i]) { throw new Error("リーチ後の手出し"); }
		if (isReach) { this.reachCount = this.count; }
		this.trash[this.count++] = this.hand[i];
		this.hand.splice(i, 1);
		this.hand.push(null);
		this.updateCities();
	}

	tsumo({isRinshan = false} = {}) {
		if (this.count === MAX_COUNT) { throw new Error("ツモる牌がもうありません (終局)"); }
		this.isRinshan = isRinshan;
		this.hand[this.hand.length - 1] = this.latestTsumo = this.mountain.shift();
		this.updateCities();
	}

	kan(position) {
		this.kans.push(this.hand.splice(position, 4));
		this.hand.push(null);
		this.updateCities();
	}

	// x番目の牌を, y番目の隙間に
	replaceHand(x, y) {
		this.hand.splice(x < y? y - 1 : y, 0, this.hand.splice(x, 1)[0]);
		this.updateCities();
	}

  onUpdateHand = () => {}

	updateCities = () => {
		this.cities = getCitiesInHand(this.hand);
    this.onUpdateHand();
	};

}
