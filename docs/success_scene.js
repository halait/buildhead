"use strict";
var successScene = {
	activeBtn: false,
	activeBtnElement: false,
	btnsDiv: document.getElementById("successSceneCloseBtn"),
	ui: document.getElementById("successSceneDiv"),
	nextLevelBtn: document.getElementById("nextLevelBtn"),
	incrementBtn: document.getElementById("increment-btn"),
	decrementBtn: document.getElementById("decrement-btn"),
	selectedBtn: null,
	ratingDiv: document.getElementById("rating"),
	start(){
		this.ui.style.display = "block";
		console.log("levelBrowserScene.currentLevel.rating = " + levelBrowserScene.currentLevel.rating);
		this.ratingDiv.textContent = levelBrowserScene.currentLevel.rating;
	},
	suspend(){
		this.ui.style.display = "none";
	},
	selectBtn(btn){
		if(this.selectedBtn) this.selectedBtn.classList.remove("activeBtn");
		this.selectedBtn = btn;
		btn.classList.add("activeBtn");
	},
	ratingHandler(btn, newRating){
		if(this.selectedBtn) {
			if(this.selectedBtn == btn){
				
			}
		}
		const levelId = levelBrowserScene.currentLevels[levelBrowserScene.currentLevelIndex].id;
		console.log(levelId);
		const batch = db.batch();
		batch.set(db.collection("users").doc(user.uid).collection("reviews").doc(levelId), {rating: newRating}, {merge: true});
		batch.update(db.collection(levelBrowserScene.currentLevelCollection).doc(levelId), {rating: firebase.firestore.FieldValue.increment(newRating)});
		batch.commit().catch((err) => {exceptionScene.throw(err.message)});
		this.selectBtn(btn);
	},
	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.unfloat();});
		successScene.ui.prepend(sceneCloseBtn);
		document.getElementById("exit-btn").addEventListener("pointerdown", () => {
			sceneManager.pop();
			sceneManager.pop();
		});
		this.incrementBtn.addEventListener("pointerdown", (e) => {
			this.ratingHandler(this.incrementBtn, 1);
		});
		this.decrementBtn.addEventListener("pointerdown", (e) => {
			this.ratingHandler(this.decrementBtn, -1);
		});
	}
}
successScene.init();