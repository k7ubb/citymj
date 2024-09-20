const MAX_COUNT = 3;

class GameTiles {
  mountain;
  dora;
  uradora;
  count = 0;
  hand;
  trash;
  kans = [];
  group;
  latestTsumo;
  isRinshan;
  reached = false;
  reachCount;
  finished = false;

  cutHand(i, isReach) {
    if (this.reached && this.latestTsumo !== this.hand[i]) {
      return false;
    }
    if (isReach) {
      this.reached = true;
      this.reachCount = this.count;
    }
    this.trash[this.count++] = this.hand[i];
    this.hand.splice(i, 1);
    this.hand.push(null);
    this.updateGroup();
    return true;
  };

  tsumo(isRinshan) {
    if (this.count === MAX_COUNT) {
      this.finished = true;
      return;
    }
    this.isRinshan = isRinshan;
    this.hand[this.hand.length - 1] = this.latestTsumo = this.mountain.shift();
    this.updateGroup();
  };

  newDora() {
    const tile = this.mountain.shift();
    return {tile, char: DORA[tile.character]};
  };

  kan(i) {
    const city = this.group.filter(city => city.length === 4)[i];
    this.kans.push(this.hand.splice(city.position, 4));
    this.hand.push(null);
    this.updateGroup();
  };

  // x番目の牌を, y番目の隙間に
  replaceHand(x, y) {
    if (x === y || x === y - 1) { return; }
    this.hand.splice(x < y? y - 1 : y, 0, this.hand.splice(x, 1)[0]);
    this.updateGroup();
  };

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
  };

  constructor(initialHandLength) {
    // https://qiita.com/noenture/items/b99f459613346e214f10
    const shuffle = arr => arr.sort(() => Math.random() - Math.random());
    this.mountain = shuffle(structuredClone(TILES));
    this.hand = new Array(initialHandLength).fill().map(() => this.mountain.shift());
    this.dora = new Array(5).fill().map(() => this.newDora());
    this.uradora = new Array(5).fill().map(() => this.newDora());
    this.trash = new Array(MAX_COUNT).fill();
    this.updateGroup();
  };
}
