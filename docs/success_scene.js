"use strict";
var successScene = {
	activeBtn: false,
	activeBtnElement: false,
	btnsDiv: document.getElementById("successSceneCloseBtn"),
	ui: document.getElementById("successSceneDiv"),
	nextLevelBtn: document.getElementById("nextLevelBtn"),
	handleWheel(e) {
	},
	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.pop();});
		successScene.ui.prepend(sceneCloseBtn);
	}
}
successScene.init();