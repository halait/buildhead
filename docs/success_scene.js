"use strict";
var successScene = {
	activeBtn: false,
	activeBtnElement: false,
	btnsDiv: document.getElementById("successSceneCloseBtn"),
	ui: document.getElementById("successSceneDiv"),
	nextLevelBtn: document.getElementById("nextLevelBtn"),
	incrementBtn: document.getElementById("increment-btn"),
	decrementBtn: document.getElementById("decrement-btn"),
	ratingDiv: document.getElementById("rating"),
	start(){
		this.ui.style.display = "block";
		this.ratingDiv.textContent = levelBrowserScene.currentLevel.rating;
		if(levelBrowserScene.currentLevel.review){
			this.selectBtn(levelBrowserScene.currentLevel.review.rating);
		}
	},
	suspend(){
		this.ui.style.display = "none";
	},
	selectBtn(rating){
		if(rating){
			if(rating > 0) {
				this.incrementBtn.classList.add("activeBtn");
				this.decrementBtn.classList.remove("activeBtn");
			} else {
				this.incrementBtn.classList.remove("activeBtn");
				this.decrementBtn.classList.add("activeBtn");
			}
		} else {
			this.incrementBtn.classList.remove("activeBtn");
			this.decrementBtn.classList.remove("activeBtn");
		}
	},
	ratingHandler(e){
		let newRating = 0;
		if(e.currentTarget == successScene.incrementBtn){
			newRating = 1;
		} else if(e.currentTarget == successScene.decrementBtn) {
			newRating = -1;
		}
		if(levelBrowserScene.currentLevel.review && levelBrowserScene.currentLevel.review.rating == newRating){
			newRating = 0;
		}
		let ratingDelta = newRating;
		if(levelBrowserScene.currentLevel.review){
			ratingDelta -= levelBrowserScene.currentLevel.review.rating;
		}
		console.log(ratingDelta);
		levelBrowserScene.currentLevel.rating += ratingDelta;
		if(!levelBrowserScene.currentLevel.review){
			levelBrowserScene.currentLevel.review = {rating: 0};
		}
		levelBrowserScene.currentLevel.review.rating = newRating;
		successScene.ratingDiv.textContent = levelBrowserScene.currentLevel.rating;
		if(ratingDelta > 2 || ratingDelta < -2) throw "ratingDelta > 2 || ratingDelta < -2";
		const levelId = levelBrowserScene.currentLevel.id;
		const batch = db.batch();
		batch.set(db.collection("users").doc(user.uid).collection("reviews").doc(levelId), {
			rating: newRating
		}, {merge: true});
		batch.update(db.collection(levelBrowserScene.refDef.collection).doc(levelId), {
			rating: firebase.firestore.FieldValue.increment(ratingDelta)
		});
		batch.commit().catch((err) => {exceptionScene.throw(err.message)});
		successScene.selectBtn(newRating);
	},
	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.unfloat();});
		successScene.ui.prepend(sceneCloseBtn);
		document.getElementById("exit-btn").addEventListener("pointerdown", () => {
			sceneManager.pop();
			sceneManager.pop();
		});
		this.incrementBtn.addEventListener("pointerdown", this.ratingHandler);
		this.decrementBtn.addEventListener("pointerdown", this.ratingHandler);
		document.getElementById("next-level-btn").addEventListener("click", () => {
			sceneManager.pop();
			sceneManager.pop();
			const nextIndex = levelBrowserScene.currentLevelIndex + 1;
			if(levelBrowserScene.levels[nextIndex]){
				levelBrowserScene.loadLevel(nextIndex);
				sceneManager.push(assemblyScene);
			} else {
				levelBrowserScene.refDef.getNextBatch = true;
				levelBrowserScene.populate(levelBrowserScene.refDef);
				if(levelBrowserScene.levels.length){
					levelBrowserScene.loadLevel(0);
					sceneManager.push(assemblyScene);
				} else {
					exceptionScene.throw("No more levels you win");
				}
			}
		});
	}
}
successScene.init();