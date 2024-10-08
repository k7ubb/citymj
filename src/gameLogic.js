const getCitiesInHand = (hand) => {
	const cities = [];
	for (let i = 0; i < hand.length; i++) {
		for (const city of CITIES) {
			for (let k = 0; k < city.name.length; k++) {
				if (hand[i + k]?.character !== city.name[k]) { break; }
				if (k === city.name.length - 1) {
					cities.push({
						...city,
						position: i,
						length: city.name.length
					});
				}
			}
		}
	}
	return cities;
};

const findYaku = ({
	count,	// あがった順目 (天和: 0)
	dora,
	uradora,
	isRinshan,
	kans,
	reachCount,	// リーチした順目 (リーチなし: -1, ダブリー: 0)
}, cities) => {
	const prefCounts = {};
	const chihouCounts = {};
	const prefs = cities.map(city => city.pref);
	const prefsInHonshu = ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県']
	const chihous = {
		"東北地方": ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
		"関東地方": ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
		"中部地方": ["山梨県", "長野県", "新潟県", "富山県", "石川県", "福井県", "岐阜県", "静岡県", "愛知県"],
		"近畿地方": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
		"中国地方": ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
		"四国地方": ["徳島県", "香川県", "愛媛県", "高知県"],
		"九州地方": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]
	};
	for (const pref of prefs) {
    if (!(pref in prefCounts)) { prefCounts[pref] = 1; }
    else { prefCounts[pref]++; }

		for (const chihou in chihous) {
			if (chihous[chihou].includes(pref)) {
				if (!(chihou in chihouCounts)) { chihouCounts[chihou] = 1; }
				else { chihouCounts[chihou]++; }
			}
		}
	}
	const maxRenpaku = Math.max(...Object.values(prefCounts));
	const maxRenpakuPref = Object.keys(prefCounts).filter(pref => prefCounts[pref] === maxRenpaku).join(", ");

	const doraChar = [];
	for (let i = 0; i < kans.length + 1; i++) {
		doraChar.push(...( dora[i].char || []) );
		if (reachCount !== -1) { doraChar.push(...(uradora[i].char || [])); } 
	}
	const allTiles = cities.flatMap(city => city.tiles);
	const doraCount = allTiles.filter(tile => doraChar.includes(tile.character)).length + allTiles.filter(tile => tile.red).length;

	const yakuman = [];
	if (cities.filter(city => city.seirei).length >= 5) {
		if (cities.filter(city => !city.seirei).length === 0) {
			yakuman.push({name: "清政令", point: 2});
		}
		else {
			yakuman.push({name: "五政令", point: 1});
		}
	}
	if (cities.filter(city => !city.kento).length === 0) {
		yakuman.push({name: "清県都", point: 1});
	}
	if (cities.filter(city => city.ritou).length >= 5) {
		if (cities.filter(city => !city.ritou).length === 0) {
			yakuman.push({name: "清離島", point: 2});
		}
		else {
			yakuman.push({name: "五離島", point: 1});
		}
	}
	if (cities.filter(city => city.name.length === 4).length === 3) {
		yakuman.push({name: "三槓子", point: 1});
	}
	if (cities.filter(city => city.name.length === 3).length === 4) {
		yakuman.push({name: "四面子", point: 1});
	}
	if (cities.filter(city => city.name.length === 4).length === 4) {
		yakuman.push({name: "四槓子", point: 2});
	}
	if (Object.keys(prefCounts).length === 1) {
		yakuman.push({name: "清連泊", point: 1});
	}

	const yaku = [];
	if (count === 0 && !isRinshan) {
		yaku.push({name: "天和", point: 4});
	}
	if (reachCount !== -1) {
		if (reachCount === 0) {
			yaku.push({name: "二立直", point: 2});
		}
		else {
			yaku.push({name: "立直", point: 1});
		}
	}
	if (isRinshan) {
		yaku.push({name: "嶺上", point: 1});
	}
	else {
		if (reachCount !== -1 && count === reachCount + 1) {
			yaku.push({name: "一発", point: 1});
		}
		if (count === MAX_COUNT - 1) {
			yaku.push({name: "海底", point: 1});
		}
	}
	yaku.push({name: "自摸", point: 1});
	if (cities.filter(city => city.seirei).length === 2) {
		yaku.push({name: "二政令", point: 1});
	}
	if (maxRenpaku === 2) {
		yaku.push({name: `連泊 (${maxRenpakuPref})`, point: 1});
	}
	if (cities.filter(city => city.category !== "市").length === 0) {
		yaku.push({name: "全市", point: 1});
	}

	if (cities.filter(city => city.kento).length === 3) {
		yaku.push({name: "三県都", point: 2});
	}
	if (cities.filter(city => city.name.length === 3).length === 2) {
		yaku.push({name: "二面子", point: 2});
	}
	if (maxRenpaku === 3) {
		yaku.push({name: `三連泊 (${maxRenpakuPref})`, point: 2});
	}
	if (cities.filter(city => city.category !== "町").length === 0) {
		yaku.push({name: "全町", point: 2});
	}

	if (cities.filter(city => city.seirei).length === 3) {
		yaku.push({name: "三政令", point: 3});
	}
	if (cities.filter(city => city.ritou).length === 3) {
		yaku.push({name: "三離島", point: 3});
	}
	if (cities.filter(city => city.name.length === 4).length === 1) {
		yaku.push({name: "一槓子", point: 3});
	}

	if (cities.filter(city => city.kento).length === 4) {
		yaku.push({name: "四県都", point: 4});
	}
	if (cities.filter(city => city.name.length === 3).length === 3) {
		yaku.push({name: "三面子", point: 4});
	}
	if (maxRenpaku === 4) {
		yaku.push({name: `四連泊 (${maxRenpakuPref})`, point: 4});
	}
	if (cities.filter(city => prefsInHonshu.includes(city.pref)).length === 0 && Object.keys(chihouCounts).length !== 1) {
		yaku.push({name: "断本州", point: 4});
	}
	if (cities.filter(city => city.category !== "村").length === 0) {
		yaku.push({name: "全村", point: 4});
	}

	if (cities.filter(city => city.seirei).length >= 4) {
		yaku.push({name: "四政令", point: 6});
	}
	if (cities.filter(city => city.kento).length >= 5) {
		yaku.push({name: "五県都", point: 6});
	}
	if (cities.filter(city => city.ritou).length >= 4) {
		yaku.push({name: "四離島", point: 6});
	}
	if (cities.filter(city => city.name.length === 4).length === 2) {
		yaku.push({name: "二槓子", point: 6});
	}
	if (maxRenpaku >= 5) {
		yaku.push({name: `五連泊 (${maxRenpakuPref})`, point: 6});
	}
	if (Object.keys(chihouCounts).length === 1) {
		yaku.push({name: `地一色 (${Object.keys(chihouCounts)[0]})`, point: 6});
	}
	if (doraCount) {
		yaku.push({name: `ドラ ${doraCount}`, point: doraCount});
	}
	
	const yakuCount = (yakuman.length? yakuman : yaku).reduce((a, b) => a + b.point, 0);

	return yakuman.length? {
			score: {
				isYakuman: true,
				point: 32000 * yakuCount,
				text: "役満"
			},
			yaku: yakuman.map(yaku => ({
				name: yaku.name,
				point: yaku.point === 1? "役満" : "W役満"
			}))
		} : {
			score: {
				isYakuman: false,
				point: [1000, 2000, 4000, 8000, 8000, 12000, 12000, 16000, 16000, 16000, 24000, 24000, 32000][Math.min(yakuCount, 13) - 1],
				text: yakuCount + "翻"
			},
			yaku: yaku.map(yaku => ({
				name: yaku.name,
				point: yaku.point + "翻"
			}))
		};
};
