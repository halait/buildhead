"use strict";
const tutorialScene = {
	ui: document.getElementById("tutorialUi"),
	img: document.getElementById("tutorialImg"),
	loadingMsg: document.getElementById("tutImgLoadingMsg"),
	start(){
		this.img.style.display = "none";
		this.loadingMsg.style.display = "block";
		this.removeCurrentEventListener();
		++tutorialStep;
		this.events[tutorialStep].target.addEventListener(this.events[tutorialStep].type, this.events[tutorialStep].callback);
		this.img.src = "tutorials/" + tutorialStep + "tut.png";
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	removeCurrentEventListener(){
		if(tutorialStep != -1) {
			this.events[tutorialStep].target.removeEventListener(this.events[tutorialStep].type, this.events[tutorialStep].callback);
			console.log("current evtlist remooved");
		}
	},
	events: [
		{target: assemblyScene.toolbar.querySelector(".startSimulationBtn"), type: "mousedown", callback: () => {sceneManager.float(tutorialScene);}},
		{target: simulationScene.toolbar.querySelector(".stopSimulationBtn"), type: "mousedown", callback: () => {sceneManager.float(tutorialScene);}},
		{target: assemblyScene.toolbar.querySelector(".cwWheelCreatorBtn"), type: "mousedown", callback: () => {sceneManager.float(tutorialScene);}},
		{
			target: canvas,
			type: "mouseup",
			callback: () => {
				let last = gameObjects.length - 1;
				if(gameObjects[last].def.form == pw.CIRCLE_FORM && gameObjects[last].def.motorVelocity < 0){
					sceneManager.float(tutorialScene);
				}
			}
		},
		{target: assemblyScene.toolbar.querySelector(".nRodCreatorBtn"), type: "mousedown", callback: () => {sceneManager.float(tutorialScene);}},
		{
			target: canvas,
			type: "mouseup",
			callback: () => {
				let last = gameObjects[gameObjects.length - 1];
				if(last.def.form == pw.PLANE_FORM && last.joints.length == 2){
					let j0 = last.joints[0];
					let j1 = last.joints[1];
					if(j0.gameObjectA != j1.gameObjectA && (j0.gameObjectA.def.target || j1.gameObjectA.def.target) && j0.def.va == 0 && j1.def.va == 0){
						sceneManager.float(tutorialScene);
					}
				}
			}
		},
		{
			target: assemblyScene.toolbar.querySelector(".startSimulationBtn"),
			type: "mousedown",
			callback: () => {
				tutorialScene.removeCurrentEventListener();
				sceneManager.unfloat();
			}
		},

	],
	shrinkBtn: document.getElementById("tutorialShrinkBtn"),
	showBtn: document.getElementById("tutorialShowBtn"),
	hideImg(){
		this.img.style.display = "none";
		this.shrinkBtn.style.display = "none";
		this.showBtn.style.display = "inline-block";
	},
	showImg(){
		this.img.style.display = "block";
		this.shrinkBtn.style.display = "inline-block";
		this.showBtn.style.display = "none";
	},
	init(){
		this.shrinkBtn.addEventListener("click", () => {this.hideImg();});
		this.showBtn.addEventListener("click", () => {this.showImg();});
		this.img.onload = () => {
			this.showImg();
			this.loadingMsg.style.display = "none";
		};
	}
};
tutorialScene.init();