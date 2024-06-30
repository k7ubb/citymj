class drawClass {
	#div;
	#canvas;
	#context;
	
	#animeCanvas;
	#animeContext;
	
	#width;
	#height;
	
	constructor(div) {
		this.#div = div;
		
		this.#canvas = document.createElement("canvas");
		this.#context = this.#canvas.getContext("2d");
		this.#div.appendChild(this.#canvas);
		this.#animeCanvas = document.createElement("canvas");
		this.#animeContext = this.#animeCanvas.getContext("2d");
		this.#div.appendChild(this.#animeCanvas);
		
		this.#canvas.style.cssText = this.#animeCanvas.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
		`;
		
		this.#resize();
		
		addEventListener("resize", function() {
			this.#resize();
			this.#draw();
		}.bind(this));
		
		addEventListener("mousemove", function(event) {
			const offset = event.target.getBoundingClientRect();
			this.#anime(
				this.#animeContext,
				this.#width,
				this.#height,
				event.clientX - offset.left,
				event.clientY - offset.top
			);
		}.bind(this));
	};
	
	#resize() {
		this.#width  = this.#div.clientWidth  * devicePixelRatio;
		this.#height = this.#div.clientHeight * devicePixelRatio;
		this.#canvas.width  = this.#animeCanvas.width  = this.#width;
		this.#canvas.height = this.#animeCanvas.height = this.#height;
		this.#canvas.style.width  = this.#animeCanvas.style.width  = this.#div.clientWidth  + "px";
		this.#canvas.style.height = this.#animeCanvas.style.height = this.#div.clientHeight + "px";
	};
	
	#update = () => {};
	#anime = () => {};
	
	set update(f) {
		this.#update = f;
		this.#draw();
	};
	
	set anime(f) {
		this.#anime = f;
	};
	
	#draw() {
		this.#update(this.#context, this.#width, this.#height);
	};
}