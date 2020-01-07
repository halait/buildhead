"use strict";

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