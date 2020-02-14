"use strict";
const profileScene = {
	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	ui: document.getElementById("profileUi"),
	init(){
		document.getElementById("logoutBtn").addEventListener("pointerdown", () => {
			firebase.auth().signOut();
			sceneManager.unfloat();
		});
	}
}
profileScene.init();