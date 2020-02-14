"use strict";
const menuScene = {
	start(){
		sandboxMode = false;
		canvasEventManager.reset();
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

	levelBtns: document.getElementsByClassName("levelBtn"),
	ui: document.getElementById("menuUI"),
	loginBtn: document.getElementById("loginBtn"),
	profileBtn: document.getElementById("profileBtn"),

	init(){
		this.ui.onkeydown = (e) => {if(e.key == "s") sceneManager.push(sandboxScene);};
		this.levelBtns[0].onclick = async function() {
			await assemblyScene.startLevel("levels/" + 0 + ".json");
			sceneManager.float(tutorialScene);
		};
		for(let i = 1, len = menuScene.levelBtns.length; i < len; ++i){



			// remove path
			if(!path && localStorage.getItem(i + "isPlayable")) menuScene.unlockLevel(i);
			else menuScene.unlockLevel(i);
		}
		this.loginBtn.addEventListener("pointerdown", () => {sceneManager.float(loginScene);});
		this.profileBtn.addEventListener("pointerdown", () => {sceneManager.float(profileScene);});
		document.getElementById("levelBrowserBtn").addEventListener("pointerdown", () => {sceneManager.float(levelBrowserScene);});
	}
}
menuScene.init();