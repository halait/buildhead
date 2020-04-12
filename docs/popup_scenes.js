"use strict";
const modeScene = {
	ui: document.getElementById("mode-ui"),
	start() {
		this.ui.style.display = "block";
	},
	suspend() {
		this.ui.style.display = "none";
	},
	init() {
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("click", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("play-btn").addEventListener("click", () => {
			sceneManager.push(assemblyScene);
			if(levelBrowserScene.currentLevel.id == "halait - 0 Tutorial"){
				sceneManager.float(tutorialScene);
			}
		});
		document.getElementById("edit-btn").addEventListener("click", () => {
			sceneManager.push(sandboxScene);
		});
	}
}
modeScene.init();