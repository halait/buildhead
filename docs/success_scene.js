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
	saveSolutionBtn: document.getElementById("save-solution-btn"),
	start(){
		this.ui.style.display = "block";
		this.ratingDiv.textContent = levelBrowserScene.currentLevel.rating;
		let rating = 0;
		if(levelBrowserScene.currentLevel.review){
			rating = levelBrowserScene.currentLevel.review.rating;
		}
		this.selectBtn(rating);
		if(/solutions$/.test(levelBrowserScene.refDef.collectionPath)){
			this.saveSolutionBtn.style.display = "none";
		} else {
			this.saveSolutionBtn.style.display = "block";
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
		} else {
			levelBrowserScene.currentLevel.review = {
				rating: 0,
				subjectPath: levelBrowserScene.currentLevel.path
			};
		}
		if(ratingDelta > 2 || ratingDelta < -2) throw "ratingDelta > 2 || ratingDelta < -2";
		levelBrowserScene.currentLevel.rating += ratingDelta;
		levelBrowserScene.currentLevel.review.rating = newRating;
		successScene.ratingDiv.textContent = levelBrowserScene.currentLevel.rating;
		const levelId = levelBrowserScene.currentLevel.id;
		const batch = db.batch();
		batch.set(db.collection("users").doc(user.uid).collection("reviews").doc(levelId), {
			rating: newRating
		}, {merge: true});
		batch.update(db.doc(levelBrowserScene.currentLevel.path), {
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
		document.getElementById("browse-solutions-btn").addEventListener("click", () => {
			sceneManager.pop();
			sceneManager.pop();
			sceneManager.push(levelBrowserScene, {collectionPath: levelBrowserScene.currentLevel.path + "/solutions"});
		});
		this.saveSolutionBtn.addEventListener("click", () => {
			sceneManager.push(saveScene);
		});
	}
}
successScene.init();