const xy2rect = (x, y, w, h=w) => [ [x, y], [x, y+h], [x+w, y+h], [x+w, y] ];


const RECT_TRASH = [
	...[...Array(6).keys()].map(x => xy2rect(x * 0.8 + 5.6, 1, 0.8, 1.2)),
	...[...Array(6).keys()].map(x => xy2rect(x * 0.8 + 5.6, 2.2, 0.8, 1.2)),
	...[...Array(6).keys()].map(x => xy2rect(x * 0.8 + 5.6, 3.4, 0.8, 1.2))
];
