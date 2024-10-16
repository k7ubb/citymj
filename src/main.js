const IS_SMARTPHONE = "ontouchstart" in window;
const VERSION = "ver 2.0.3 / 20241008";
const COLOR_BACKGROUND = "#9DCCDF";
const COLOR_MAIN = "#6C90C1";
const COLOR_STRONG = "#000080";

const sleep = t => new Promise(resolve => setTimeout(resolve, t));
const shuffle = arr => arr.sort(() => Math.random() - 0.5);

const exact = new ExactCanvas(document.getElementById("game"), 1600, 900, {rotate: true});
const $ = new ItemsCanvas(
	exact.canvas.getContext("2d"),
	(event) => {
		const [clientX, clientY] = event.type.includes('mouse')
			? [event.clientX, event.clientY]
			: [event.touches[0].clientX, event.touches[0].clientY];
		const rect = event.target.getBoundingClientRect();
		return exact.toLogicalPoint(clientX - rect.left, clientY - rect.top)
	},
	(path, x, y) => exact.canvas.getContext("2d").isPointInPath(path, ...exact.toPhysicalPoint(x, y))
);
exact.onResize = () => $.update();

menuScene();
/*
scoreScene(
	{"mountain":[{"character":"川","count":61},{"character":"島","count":39},{"character":"野","count":38},{"character":"山","count":38},{"character":"南","count":30},{"character":"津","count":31},{"character":"東","count":27},{"character":"上","count":25},{"character":"上","count":25},{"character":"松","count":23},{"character":"松","count":23},{"character":"小","count":23},{"character":"富","count":22},{"character":"原","count":21},{"character":"原","count":21},{"character":"高","count":22},{"character":"高","count":22},{"character":"北","count":19},{"character":"中","count":18},{"character":"美","count":17},{"character":"三","count":17},{"character":"西","count":16},{"character":"崎","count":16},{"character":"長","count":15},{"character":"豊","count":14,"red":true},{"character":"佐","count":14},{"character":"戸","count":14},{"character":"平","count":14},{"character":"日","count":13},{"character":"井","count":13},{"character":"浜","count":13},{"character":"岡","count":13},{"character":"本","count":12},{"character":"木","count":12},{"character":"内","count":12},{"character":"和","count":13},{"character":"見","count":11},{"character":"江","count":11},{"character":"宮","count":11},{"character":"賀","count":12},{"character":"河","count":10},{"character":"泉","count":10},{"character":"古","count":10},{"character":"越","count":9},{"character":"国","count":9},{"character":"下","count":9},{"character":"海","count":9},{"character":"里","count":9},{"character":"久","count":9},{"character":"浦","count":9},{"character":"福","count":9,"red":true},{"character":"石","count":8},{"character":"宇","count":8},{"character":"知","count":8},{"character":"玉","count":8},{"character":"多","count":8},{"character":"加","count":8},{"character":"神","count":8},{"character":"広","count":8},{"character":"村","count":8},{"character":"岩","count":8},{"character":"伊","count":8},{"character":"庄","count":8},{"character":"良","count":7},{"character":"谷","count":7},{"character":"鹿","count":7},{"character":"水","count":7},{"character":"幌","count":7},{"character":"土","count":7},{"character":"阿","count":7},{"character":"根","count":7},{"character":"前","count":6},{"character":"部","count":6},{"character":"生","count":6},{"character":"波","count":6},{"character":"府","count":6},{"character":"沢","count":6},{"character":"須","count":6},{"character":"安","count":6},{"character":"市","count":6},{"character":"沼","count":6},{"character":"米","count":6},{"character":"別","count":6},{"character":"瀬","count":5},{"character":"飯","count":5},{"character":"金","count":5},{"character":"熊","count":6},{"character":"横","count":5},{"character":"立","count":5},{"character":"都","count":5},{"character":"屋","count":5},{"character":"手","count":5},{"character":"関","count":5},{"character":"取","count":5},{"character":"丹","count":5},{"character":"五","count":5},{"character":"名","count":5},{"character":"羽","count":5},{"character":"子","count":5},{"character":"会","count":4},{"character":"阪","count":4},{"character":"京","count":4},{"character":"尾","count":4},{"character":"奈","count":4},{"character":"八","count":3},{"character":"倉","count":3},{"character":"口","count":3}],"dora":[{"tile":{"character":"郷","count":11}},{"tile":{"character":"島","count":39},"char":["島","田"]},{"tile":{"character":"田","count":37},"char":["田","原"]},{"tile":{"character":"小","count":23},"char":["小","田","原"]},{"tile":{"character":"山","count":38},"char":["山","口"]}],"uradora":[{"tile":{"character":"山","count":38},"char":["山","口"]},{"tile":{"character":"田","count":37},"char":["田","原"]},{"tile":{"character":"南","count":30},"char":["南","国"]},{"tile":{"character":"野","count":38},"char":["野","田"]},{"tile":{"character":"野","count":38},"char":["野","田"]}],"count":0,"hand":[{"character":"十","count":4},{"character":"津","count":31},{"character":"川","count":61},{"character":"清","count":8},{"character":"川","count":61},{"character":"大","count":41},{"character":"川","count":61},{"character":"新","count":11},{"character":"城","count":16},{"character":"坂","count":9},{"character":"東","count":27}],"trash":[],"kans":[[{"character":"富","count":22,"red":true},{"character":"士","count":10},{"character":"吉","count":12},{"character":"田","count":37}]],"cities":[{"name":"十津川","category":"村","pref":"奈良県","position":0,"length":3},{"name":"津","category":"市","pref":"三重県","kento":true,"position":1,"length":1},{"name":"清川","category":"村","pref":"神奈川県","position":3,"length":2},{"name":"大川","category":"村","pref":"高知県","position":5,"length":2},{"name":"大川","category":"市","pref":"福岡県","position":5,"length":2},{"name":"新城","category":"市","pref":"愛知県","position":7,"length":2},{"name":"坂東","category":"市","pref":"茨城県","position":9,"length":2},{"name":"坂","category":"町","pref":"広島県","position":9,"length":1},{"name":"東","category":"村","pref":"沖縄県","position":10,"length":1}],"latestTsumo":{"character":"東","count":27},"isRinshan":true,"reachCount":-1},
// 地一色デバッグ
//	[{"name":"坂東","category":"市","pref":"茨城県","tiles":[{"character":"坂","count":9},{"character":"東","count":27}]},{"name":"新城","category":"市","pref":"神奈川県","tiles":[{"character":"新","count":11},{"character":"城","count":16}]},{"name":"大川","category":"村","pref":"千葉県","tiles":[{"character":"大","count":41},{"character":"川","count":61}]},{"name":"清川","category":"村","pref":"神奈川県","tiles":[{"character":"清","count":8},{"character":"川","count":61}]},{"name":"十津川","category":"村","pref":"群馬県","tiles":[{"character":"十","count":4},{"character":"津","count":31},{"character":"川","count":61}]},{"name":"富士吉田","category":"市","pref":"栃木県","tiles":[{"character":"富","count":22,"red":true},{"character":"士","count":10},{"character":"吉","count":12},{"character":"田","count":37}]}],
	[{"name":"坂東","category":"市","pref":"茨城県","tiles":[{"character":"坂","count":9},{"character":"東","count":27}]},{"name":"新城","category":"市","pref":"愛知県","tiles":[{"character":"新","count":11},{"character":"城","count":16}]},{"name":"大川","category":"村","pref":"高知県","tiles":[{"character":"大","count":41},{"character":"川","count":61}]},{"name":"清川","category":"村","pref":"神奈川県","tiles":[{"character":"清","count":8},{"character":"川","count":61}]},{"name":"十津川","category":"村","pref":"奈良県","tiles":[{"character":"十","count":4},{"character":"津","count":31},{"character":"川","count":61}]},{"name":"富士吉田","category":"市","pref":"山梨県","tiles":[{"character":"富","count":22,"red":true},{"character":"士","count":10},{"character":"吉","count":12},{"character":"田","count":37}]}],
	{
		handLength: 14,
		showHandGuide: true,
		showCityTable: true,
		restrictRule: true,
	}
);
gameScene(
	{
		handLength: 14,
		showHandGuide: true,
		showCityTable: true,
		restrictRule: true,
	},
	[
		{ character: "十", count: 4 },
		{ character: "津", count: 31 },
		{ character: "川", count: 61 },
		{ character: "富", count: 22, red: true },
		{ character: "士", count: 10 },
		{ character: "吉", count: 12 },
		{ character: "田", count: 37 },
		{ character: "清", count: 8 },
		{ character: "川", count: 61 },
		{ character: "大", count: 41 },
		{ character: "川", count: 61 },
		{ character: "新", count: 11 },
		{ character: "城", count: 16 },
		{ character: "坂", count: 9 },
		{ character: "郷", count: 11 },
		{ character: "島", count: 39 },
		{ character: "田", count: 37 },
		{ character: "小", count: 23 },
		{ character: "山", count: 38 },
		{ character: "山", count: 38 },
		{ character: "田", count: 37 },
		{ character: "南", count: 30 },
		{ character: "野", count: 38 },
		{ character: "野", count: 38 },
		{ character: "東", count: 27 },
		{ character: "川", count: 61 },
		{ character: "島", count: 39 },
		{ character: "野", count: 38 },
		{ character: "山", count: 38 },
		{ character: "南", count: 30 },
		{ character: "津", count: 31 },
		{ character: "東", count: 27 },
		{ character: "上", count: 25 },
		{ character: "上", count: 25 },
		{ character: "松", count: 23 },
		{ character: "松", count: 23 },
		{ character: "小", count: 23 },
		{ character: "富", count: 22 },
		{ character: "原", count: 21 },
		{ character: "原", count: 21 },
		{ character: "高", count: 22 },
		{ character: "高", count: 22 },
		{ character: "北", count: 19 },
		{ character: "中", count: 18 },
		{ character: "美", count: 17 },
		{ character: "三", count: 17 },
		{ character: "西", count: 16 },
		{ character: "崎", count: 16 },
		{ character: "長", count: 15 },
		{ character: "豊", count: 14, red: true },
		{ character: "佐", count: 14 },
		{ character: "戸", count: 14 },
		{ character: "平", count: 14 },
		{ character: "日", count: 13 },
		{ character: "井", count: 13 },
		{ character: "浜", count: 13 },
		{ character: "岡", count: 13 },
		{ character: "本", count: 12 },
		{ character: "木", count: 12 },
		{ character: "内", count: 12 },
		{ character: "和", count: 13 },
		{ character: "見", count: 11 },
		{ character: "江", count: 11 },
		{ character: "宮", count: 11 },
		{ character: "賀", count: 12 },
		{ character: "河", count: 10 },
		{ character: "泉", count: 10 },
		{ character: "古", count: 10 },
		{ character: "越", count: 9 },
		{ character: "国", count: 9 },
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
		{ character: "伊", count: 8 },
		{ character: "庄", count: 8 },
		{ character: "良", count: 7 },
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
		{ character: "別", count: 6 },
		{ character: "瀬", count: 5 },
		{ character: "飯", count: 5 },
		{ character: "金", count: 5 },
		{ character: "熊", count: 6 },
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
	]
);
//*/
