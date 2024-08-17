// https://camp.trainocate.co.jp/magazine/howto-javascript-sleep/
const sleep = t => new Promise( resolve => setTimeout(resolve, t) );

const MAX_COUNT = 36;

class GameTiles {
  mountain;
  dora;
  uradora;
  count = 0;
  doraCount = 1;
  hand;
  trash;
  kans = [];
  group;
  latestTsumo;
  reached = false;
  reachCount;
  finished = false;

  cutHand(i, isReach) {
    if (this.reached && this.latestTsumo !== this.hand[i]) {
      return;
    }
    if (isReach) {
      this.reached = true;
      this.reachCount = this.trash.length;
    }
    this.trash[this.count++] = this.hand[i];
    this.hand.splice(i, 1);
    this.hand.push(null);
    this.updateGroup();
  };

  tsumo() {
    if (this.count === MAX_COUNT) {
      this.finished = true;
      console.log(this.mountain.length)
      return;
    }
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
    this.doraCount++;
    this.updateGroup();
  };

  // x番目の牌を, y番目の隙間に
  replaceHand(x, y) {
    if (x === y) { return; }
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
    this.mountain = this.devCreateMountain();//shuffle(structuredClone(TILES));
    this.hand = new Array(initialHandLength).fill().map(() => this.mountain.shift());
    this.dora = new Array(5).fill().map(() => this.newDora());
    this.uradora = new Array(5).fill().map(() => this.newDora());
    this.trash = new Array(MAX_COUNT).fill();
    this.updateGroup();
  };

  devCreateMountain = () => {
    return [
      { character: "上", count: 25 },
      { character: "新", count: 11 },
      { character: "十", count: 4 },
      { character: "津", count: 29 },
      { character: "川", count: 61 },
      { character: "東", count: 27 },
      { character: "中", count: 18 },
      { character: "富", count: 22 },
      { character: "良", count: 7 },
      { character: "野", count: 38 },
      { character: "崎", count: 16 },
      { character: "島", count: 39 },
      { character: "大", count: 41 },
      { character: "河", count: 10 },
      { character: "木", count: 12 },// dora start
      { character: "和", count: 12 },
      { character: "白", count: 11 },
      { character: "見", count: 11 },
      { character: "郷", count: 11 },
      { character: "江", count: 11 },
      { character: "宮", count: 11 },
      { character: "賀", count: 11 },
      { character: "泉", count: 10 },
      { character: "士", count: 10 },// dora end
      { character: "内", count: 12 },
      { character: "長", count: 15 },
      { character: "野", count: 38 },
      { character: "大", count: 41 },
      { character: "大", count: 41 },
      { character: "島", count: 39 },
      { character: "島", count: 39 },
      { character: "野", count: 38 },
      { character: "山", count: 38 },
      { character: "山", count: 38 },
      { character: "山", count: 38 },
      { character: "東", count: 27 },
      { character: "川", count: 61 },
      { character: "川", count: 61 },
      { character: "川", count: 61 },
      { character: "松", count: 23 },
      { character: "田", count: 37 },
      { character: "田", count: 37 },
      { character: "田", count: 37 },
      { character: "南", count: 30 },
      { character: "南", count: 30 },
      { character: "津", count: 29 },
      { character: "上", count: 25 },
      { character: "松", count: 23 },
      { character: "小", count: 23 },
      { character: "小", count: 23 },
      { character: "富", count: 22, red: true },
      { character: "原", count: 21 },
      { character: "原", count: 21 },
      { character: "高", count: 20 },
      { character: "高", count: 20 },
      { character: "北", count: 19 },
      { character: "美", count: 17 },
      { character: "三", count: 17 },
      { character: "城", count: 16 },
      { character: "西", count: 16 },
      { character: "豊", count: 14, red: true },
      { character: "佐", count: 14 },
      { character: "戸", count: 14 },
      { character: "平", count: 14 },
      { character: "日", count: 13 },
      { character: "井", count: 13 },
      { character: "浜", count: 13 },
      { character: "岡", count: 13 },
      { character: "本", count: 12 },
      { character: "吉", count: 12 },
      { character: "古", count: 10 },
      { character: "越", count: 9 },
      { character: "国", count: 9 },
      { character: "坂", count: 9 },
      { character: "下", count: 9 },
      { character: "海", count: 9 },
      { character: "里", count: 9 },
      { character: "久", count: 9 },
      { character: "浦", count: 9 },
      { character: "福", count: 9, red: true },
      { character: "石", count: 8 },
      { character: "宇", count: 8 },
      { character: "知", count: 8 },
      { character: "玉", count: 8 },
      { character: "多", count: 8 },
      { character: "加", count: 8 },
      { character: "神", count: 8 },
      { character: "広", count: 8 },
      { character: "村", count: 8 },
      { character: "岩", count: 8 },
      { character: "清", count: 8 },
      { character: "伊", count: 8 },
      { character: "庄", count: 8 },
      { character: "谷", count: 7 },
      { character: "鹿", count: 7 },
      { character: "水", count: 7 },
      { character: "幌", count: 7 },
      { character: "土", count: 7 },
      { character: "阿", count: 7 },
      { character: "根", count: 7 },
      { character: "前", count: 6 },
      { character: "部", count: 6 },
      { character: "生", count: 6 },
      { character: "波", count: 6 },
      { character: "府", count: 6 },
      { character: "沢", count: 6 },
      { character: "須", count: 6 },
      { character: "安", count: 6 },
      { character: "市", count: 6 },
      { character: "沼", count: 6 },
      { character: "米", count: 6 },
      { character: "別", count: 5 },
      { character: "瀬", count: 5 },
      { character: "飯", count: 5 },
      { character: "金", count: 5 },
      { character: "熊", count: 5 },
      { character: "横", count: 5 },
      { character: "立", count: 5 },
      { character: "都", count: 5 },
      { character: "屋", count: 5 },
      { character: "手", count: 5 },
      { character: "関", count: 5 },
      { character: "取", count: 5 },
      { character: "丹", count: 5 },
      { character: "五", count: 5 },
      { character: "名", count: 5 },
      { character: "羽", count: 5 },
      { character: "子", count: 5 },
      { character: "会", count: 4 },
      { character: "阪", count: 4 },
      { character: "京", count: 4 },
      { character: "尾", count: 4 },
      { character: "奈", count: 4 },
      { character: "八", count: 3 },
      { character: "倉", count: 3 },
      { character: "口", count: 3 }
    ];
  };
}

