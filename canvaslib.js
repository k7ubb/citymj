class Canvas {
	#div;
	#canvas_b;
	#canvas_f;
		
	#width;
	#height;
	
	constructor(div) {
		this.#div = div;
		
		this.#canvas_b = document.createElement("canvas");
		this.#canvas_f = document.createElement("canvas");
		this.#canvas_b.style.cssText = this.#canvas_f.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
		`;
		this.#div.appendChild(this.#canvas_b);
		this.#div.appendChild(this.#canvas_f);
		
		this.#resize();
		
		addEventListener("resize", function() {
			this.#resize();
			this.#draw();
		}.bind(this));
		
		this.#div.addEventListener("mousemove", function(event) {
			const offset = event.target.getBoundingClientRect();
			this.#drawonevent(
				this.#canvas_f.getContext("2d"),
				this.#width,
				this.#height,
				(event.clientX - offset.left) * devicePixelRatio,
				(event.clientY - offset.top) * devicePixelRatio
			);
		}.bind(this));
	};
	
	#resize() {
		this.#width  = this.#div.clientWidth  * devicePixelRatio;
		this.#height = this.#div.clientHeight * devicePixelRatio;
		this.#canvas_b.width  = this.#canvas_f.width  = this.#width;
		this.#canvas_b.height = this.#canvas_f.height = this.#height;
		this.#canvas_b.style.width  = this.#canvas_f.style.width  = this.#div.clientWidth  + "px";
		this.#canvas_b.style.height = this.#canvas_f.style.height = this.#div.clientHeight + "px";
	};
	
	#update = () => {};
	#onevent = () => {};
	
	set update(f) {
		this.#update = f;
		this.#draw();
	};
	
	set onevent(f) {
		this.#onevent = f;
	}
	
	objects = [];
	
	#draw() {
		const ctx = this.#canvas_b.getContext("2d");
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, this.#width, this.#height);
		this.#update(ctx, this.#width, this.#height);
		for (let o of this.objects) {
			if (o.draw) o.draw(ctx);
		}
	};

	#drawonevent () {
		const ctx = this.#canvas_b.getContext("2d");
		ctx.clearRect(0, 0, this.#width, this.#height);
		this.#update(ctx, this.#width, this.#height);
		for (let o of this.objects) {
			if (o.drawonevent) o.drawonevent(ctx);
		}

	}
}