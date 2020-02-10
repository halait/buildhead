"use strict";
const loginScene = {
  ui: document.getElementById("loginUi"),
  start(){
    this.ui.style.display ="block";
  },
  suspend(){
    this.ui.style.display = "none";
  },
	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("register").addEventListener("pointerdown", () => {sceneManager.float(registerScene);});
		document.getElementById("loginForm").onsubmit = () => {
			// call cloud function for key
			
		};

	}
}
loginScene.init();