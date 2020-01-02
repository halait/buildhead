"use strict";

//var maxScale = 0.0;
var aspectRatio = 0.0;

var xSub = 0.0;
var widthMultiplier = 0.0;
var heightMultiplier = 0.0;

var scale = 0.0;
var xTranslate = 0.0;
var yTranslate = 0.0;

let toolbars = document.getElementsByClassName("toolbar");
window.onresize = () => {
	let w = window.innerWidth * window.devicePixelRatio;
	let h = window.innerHeight * window.devicePixelRatio - 40;
	if(w < 640) w = 640;
	for(const t of toolbars){
		t.style.width = w + "px";
	}
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	canvas.width = w;
	canvas.height = h;
	pw.gl.viewport(0, 0, w, h);
	//maxScale = 256 / (h * 0.1);
	aspectRatio = h / w;
	xSub = 1.0 / aspectRatio;
	widthMultiplier = 1.0 / (canvas.clientWidth * 0.5 * aspectRatio);
	heightMultiplier = 1.0 / (canvas.clientHeight * 0.5);
	scaleCanvas(0.0);
	dragCanvas(0.0, 0.0);
	//pw.gl.uniform1f(pw.U_CANVAS_HEIGHT_LOCATION, canvas.height);
};
window.onresize();

var isMousedown = false;
canvas.addEventListener('mousedown', (e) => {
	if(sceneManager.currentFloat) {
		sceneManager.pop();
		return;
	}
	if(isMousedown || !sceneManager.current.eventHandler) {
		console.log("eventHandler == false");
		return;
	}
	isMousedown = true;
	mx = (e.offsetX * widthMultiplier - xSub) / scale - xTranslate;
	my = -(e.offsetY * heightMultiplier - 1.0) / scale - yTranslate;
	sceneManager.current.eventHandler.handleActivePress();
});
canvas.addEventListener('mousemove', (e) => {
	if(!isMousedown || !sceneManager.current.eventHandler) return;
	mx = (e.offsetX * widthMultiplier - xSub) / scale - xTranslate;
	my = -(e.offsetY * heightMultiplier - 1.0) / scale - yTranslate;
	sceneManager.current.eventHandler.handleActiveDrag();
});
canvas.addEventListener('mouseup', () => {
	canvas.style.cursor = "crosshair";
	if(!isMousedown || !sceneManager.current.eventHandler) return;
	isMousedown = false;
	sceneManager.current.eventHandler.handleActiveMouseup();
});
canvas.addEventListener('wheel', (e) => {
	if(sceneManager.current.handleWheel(e)) sceneManager.current.handleWheel(e);
});


const sceneManager = {
	history: [menuScene],
	current: menuScene,
	currentFloat: false,

	push(scene){
		if(this.currentFloat) this.pop();
		this.current.suspend();
		this.history.push(scene);
		this.current = scene;
		this.current.start();
	},

	pop(){
		if(this.currentFloat){
			this.currentFloat.suspend();
			this.currentFloat = false;
			return;
		}
		this.current.suspend();
		this.history.pop();
		this.current = this.history[this.history.length - 1];
		this.current.start();
	},

	float(scene, arg){
		if(this.currentFloat){
			this.pop();
		}
		scene.start(arg);
		this.currentFloat = scene;
	}
};

var sandboxMode = false;
menuScene.start();

