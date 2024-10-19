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

	onUpdateHand = () => {};

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

	updateCities = () => {
		this.cities = [];
		for (let i = 0; i <this.hand.length; i++) {
			for (const city of CITIES) {
				for (let k = 0; k < city.name.length; k++) {
					if (this.hand[i + k]?.character !== city.name[k]) { break; }
					if (k === city.name.length - 1) {
						this.cities.push({
							...city,
							position: i,
							length: city.name.length
						});
					}
				}
			}
		}
		this.onUpdateHand();
	};	
}

const calcCityOverlap = (cities, skipSameNameCity = false) => {
	const maxTile = Math.max(0, ...cities.map(city => city.position + city.length));
	console.log(maxTile)
	const count = Array(maxTile).fill().map(() => []);
	const result = [];
	let lastPos;
	let lastCities;
	for (let city of cities) {
		if (lastPos !== city.position) {
			lastPos = city.position;
			lastCities = [];
		}
		if (lastCities.includes(city.name)) {
			if (skipSameNameCity) { continue; }
		}	else {
			lastCities.push(city.name);
		}
		const set = count.slice(city.position, city.position + city.length).reduce((a, b) =>[...a, ...b], []);
		let line = 0; while(set.includes(line)) { line++; }
		for (let i = 0; i < city.length; i++) {
			count[city.position + i].push(line);
		}
		result.push({
			city,
			overlap: line
		});
	}
	return result;
};

const isCityDisabledByStrictRule = (city, latestTsumoPosition) => {
	if (city.length === 2
		&& city.position <= latestTsumoPosition
		&& latestTsumoPosition <= city.position + city.length - 1
	) {
		const waitingChar = city.name[1 - (latestTsumoPosition - city.position)];
		const waitingTile = TILES.filter(tile => tile.character === waitingChar)[0];
		if (waitingTile.count >= 10) {
			return true;
		}
	}
	return false;
};

const isCityDisabledByOverlap = (city, selectedCities) => {
	for (const city_ of selectedCities) {
		// 選択済みの市町村と共通の牌を使っていないか
		if (city.position + city.length - 1 >= city_.position && city_.position + city_.length - 1 >= city.position) {
			return true;
		}
		// 同一の市町村がすでに存在しないか
		if (city.name === city_.name && city.category === city_.category && city.pref === city_.pref) {
			return true;
		}
	}
	return false;
};

const selectingCityDescription = (city) => {
	return [
		city.category,
		...(city.kento? ["都"] : []),
		...(city.seirei? ["令"] : []),
		...(city.ritou? ["島"] : [])
	].join(" ");
};

const selectingButtonFillColor = (category) => {
	switch (category) {
		case "市":
			return "#9DCCDF";
		case "町":
			return "#CC9DDF";
		case "村":
			return "#CCDF9D";
	}
};

const selectingButtonTextColor = (category) => {
	switch (category) {
		case "市":
			return "#000080";
		case "町":
			return "#800000";
		case "村":
			return "#008000";
	}
};
