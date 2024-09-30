class RadioButton {
	constructor({center, value, get, set, label} = {}) {
		const width = $.ctx.bbMeasureText(label, {size: 50});
		this.path = {
			rect: [center.x - 30, center.y - 30, 80 + width, 60],
			radius: 30
		};
		this.draw = function() {
			$.ctx.bbText(label, center.x + 40, center.y, {size: 50, baseline: "middle"});
			$.ctx.bbFill({center, radius: 30}, "#eee");
			if (get() === value) {
				$.ctx.bbFill({center, radius: 26}, "#fcc");
				$.ctx.bbStroke({
					points: [
						[center.x + 40, center.y + 30],
						[center.x + 40 + width, center.y + 30]
					]
				}, {width: 2})
			}
		};
		this.onHover = function() { $.ctx.bbFill({center, radius: 26}, "rgba(0 0 0 / .3)"); };
		this.onClick = () => { 
			set(value);
			$.update();
		};
	}
}
