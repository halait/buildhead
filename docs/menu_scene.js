"use strict";
var menuScene = {
	start(){
		sandboxMode = false;
		resetCanvas();
		this.ui.style.display = "block";

		if(tutorialScene.step != -1){
			tutorialScene.removeCurrentEventListener();
			tutorialScene.step = -1;
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

	levelBtns: document.getElementsByClassName("levelBtn"),
	ui: document.getElementById("menuUI"),

	init(){
		this.ui.onkeydown = (e) => {if(e.key == "s") sceneManager.push(sandboxScene);};
		this.levelBtns[0].onclick = async function() {
			await assemblyScene.startLevel("levels/" + 0 + ".json");
			sceneManager.float(tutorialScene);
		};
		for(let i = 1, len = menuScene.levelBtns.length; i < len; ++i){
			if(localStorage.getItem(i + "isPlayable")) menuScene.unlockLevel(i);
		}
	}
}
menuScene.init();