"use strict";
const menuScene = {
	start(){
		//canvasEventManager.reset();
		this.ui.style.display = "block";
		if(tutorialStep != -1){
			tutorialScene.removeCurrentEventListener();
			tutorialStep = -1;
		}
	},
	suspend(){
		this.ui.style.display = "none";
	},

	unlockLevel(levelNum){
		this.levelBtns[levelNum].onclick = () => {
			assemblyScene.startLevel("levels/" + levelNum + ".json");
		};
		this.levelBtns[levelNum].classList.add("unlockedLevelBtn");
	},

	//levelBtns: document.getElementsByClassName("levelBtn"),
	ui: document.getElementById("menuUI"),
	accountBtn: document.getElementById("accountBtn"),

	init(){
		document.getElementById("originalLevelsBtn").addEventListener("pointerdown", () => {
			sceneManager.float(levelBrowserScene, {collectionPath: "originalLevels"});
		});
		document.getElementById("userLevelsBtn").addEventListener("pointerdown", () => {
			sceneManager.float(levelBrowserScene, {collectionPath: "userLevels"});
		});
		document.getElementById("sandboxBtn").addEventListener("pointerdown", () => {
			canvasEventManager.reset();
			sceneManager.push(sandboxScene);
		});
	}
}
menuScene.init();