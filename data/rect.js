const rect = (x, y, w, h=w) => [ [x, y], [x, y+h], [x+w, y+h], [x+w, y] ];

const RECT_HAND = [
	...[...Array(14).keys()].map(x => rect(x + 0.7, 7.6, 1, 1.4)),
];

const RECT_TRASH = [
	...[...Array(6).keys()].map(x => rect(x * 0.8 + 5.6, 1, 0.8, 1.2)),
	...[...Array(6).keys()].map(x => rect(x * 0.8 + 5.6, 2.2, 0.8, 1.2)),
	...[...Array(6).keys()].map(x => rect(x * 0.8 + 5.6, 3.4, 0.8, 1.2))
];

const RECT_SORT = [
	rect(0, 5.5, 1.2, 3.2),
	...[...Array(13).keys()].map(x => rect(x + 1.2, 5.5, 1, 3.2)),
	rect(14.8, 5.5, 1.2, 3.2)
];
