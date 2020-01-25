"use strict";
const tutorialScene = {
	step: -1,
	ui: document.getElementById("tutorialUi"),
	img: document.getElementById("tutorialImg"),
	start(){
		this.removeCurrentEventListener();
		++this.step;
		this.events[this.step].target.addEventListener(this.events[this.step].type, this.events[this.step].callback);
		this.img.src = this.step + "tut.png";
		this.ui.style.display = "block";
		console.log("start");
	},
	suspend(){
		this.ui.style.display = "none";
	},
	removeCurrentEventListener(){
		if(this.step > -1) {
			this.events[this.step].target.removeEventListener(this.events[this.step].type, this.events[this.step].callback);
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
				console.log("heyy");
				let last = gameObjects[gameObjects.length - 1];
				if(last.def.form == pw.PLANE_FORM && last.joints.length == 2){
				console.log("heyy again");
					let j0 = last.joints[0];
					let j1 = last.joints[1];
					if(
						j0.gameObjectA != j1.gameObjectA &&
						(j0.gameObjectA.def.target || j1.gameObjectA.def.target) &&
						j0.def.va == 0 && j1.def.va == 0 &&
						(j0.def.motorVelocity || j1.def.motorVelocity)
					){
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
	init(){
	/*
		let nextBtn = document.getElementById("tutorialNextBtn");
		nextBtn.addEventListener("click", () => {
			this.img.src = this.step++ + "tut.png";
		});
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.pop();});
		this.ui.prepend(sceneCloseBtn);
		*/
		let shrinkBtn = document.getElementById("tutorialShrinkBtn");
		let showBtn = document.getElementById("tutorialShowBtn");
		shrinkBtn.addEventListener(
			"click",
			() => {
				this.img.style.display = "none";
				shrinkBtn.style.display = "none";
				showBtn.style.display = "block";
			}
		);
		showBtn.addEventListener(
			"click",
			() => {
				this.img.style.display = "block";
				shrinkBtn.style.display = "block";
				showBtn.style.display = "none";
			}
		);
	}
};
tutorialScene.init();