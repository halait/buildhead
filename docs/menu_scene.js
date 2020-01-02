"use strict";
var menuScene = {
	start(){
		sandboxMode = false;
		resetCanvas();
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	unlockLevel(levelNum){
		localStorage.setItem(levelNum + "isPlayable", true);
		this.levelBtns[levelNum].onclick = function() {
			assemblyScene.startLevel(levelNum);
		}
		this.levelBtns[levelNum].classList.add("unlockedLevelBtn");
	},

	levelBtns: document.getElementsByClassName("levelBtn"),
	ui: document.getElementById("menuUI"),

	init(){
		this.ui.onkeydown = (e) => {if(e.key == "s") sceneManager.push(sandboxScene);};
		this.levelBtns[0].onclick = () => {assemblyScene.startLevel(0);};
		for(let i = 1, len = menuScene.levelBtns.length; i < len; ++i){
			if(localStorage.getItem(i + "isPlayable")) menuScene.unlockLevel(i);
		}
	}
}
menuScene.init();