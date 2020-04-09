"use strict";
const levelBrowserScene = {
	ui: document.getElementById("levelBrowserUi"),
	async start(query){
		loadingScreen.style.display = "flex";
		await this.populate(query);
		this.ui.style.display = "block";
		loadingScreen.style.display ="none";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	rows: [],
	cells: [],
	maxLevels: 10,
	levels: [],
	currentLevel: null,
	currentLevelCollection: "",
	async populate(refDef){
		this.currentLevelCollection = refDef.collection;
		const ref = db.collection(refDef.collection);
		const levelSnap = (await ref.limit(this.maxLevels).get()).docs;
		const len = levelSnap.length;
		const ids = [];
		for(let i = 0; i != len; ++i){
			const level = levelSnap[i].data();
			level.id = levelSnap[i].id;
			ids[i] = level.id;
			this.levels[i] = level;
		}
		if(user){
			const reviewSnap = (await db.collection("users").doc(user.uid).collection("reviews").where(firebase.firestore.FieldPath.documentId(), "in", ids).get()).docs;
			const snapLen = reviewSnap.length;
			for(let i = 0; i != len; ++i){
				const id = this.levels[i].id;
				for(let j = 0; j != snapLen; ++j){
					if(id == reviewSnap[j].id){
						this.levels[i].review = reviewSnap[j].data();
						break;
					}
				}
			}
		} else {
			this.reviews.length = 0;
		}

		for(let i = 0; i != len; ++i){
			this.rows[i].onpointerdown = () => {this.loadLevel(i);};
			this.cells[i][0].textContent = this.levels[i].name;
			this.cells[i][1].textContent = this.levels[i].author;
			this.cells[i][2].textContent = this.levels[i].dateCreated.toDate().toDateString();
			this.cells[i][3].textContent = this.levels[i].likes;
			this.cells[i][4].textContent = this.levels[i].plays;
			if(this.levels[i].review){
				this.rows[i].classList.add("completed-level");
			} else {
				this.rows[i].classList.remove("completed-level");
			}
		}

		for(let i = len; i != this.maxLevels; ++i){
			if(!this.rows[i].onpointerdown) {
				break;
			}
			this.rows[i].onpointerdown = null;
			this.cells[i][0].textContent = null;
			this.cells[i][1].textContent = null;
			this.cells[i][2].textContent = null;
			this.cells[i][3].textContent = null;
			this.cells[i][4].textContent = null;
		}
	},

	loadLevel(index){
		this.currentLevel = this.levels[index];
		let levelData = null;
		try {
			levelData = JSON.parse(this.currentLevel.json);
		} catch(e) {
			exceptionScene.throw("Level corrupted, could not deserialize");
			throw e;
		}

		if(!this.currentLevel.review){
			const batch = db.batch();
			batch.set(db.collection("users").doc(user.uid).collection("reviews").doc(this.currentLevel.id), {rating: 0});
			batch.update(db.collection(levelBrowserScene.currentLevelCollection).doc(this.currentLevel.id), {plays: firebase.firestore.FieldValue.increment(1)});
			batch.commit().catch((err) => {
				exceptionScene.throw(err.message);
				throw err;
			});
		}

		loadLevelScene.load(levelData);
		sceneManager.push(assemblyScene);
	},

	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("pointerdown", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		const rowsLive = document.getElementById("levelBrowser").tBodies[0].rows;
		const rowLen = rowsLive[0].cells.length;
		for(let i = 0; i != this.maxLevels; ++i){
			this.rows[i] = rowsLive[i];
			this.cells[i] = [];
			for(let j = 0; j < rowLen; ++j){
				this.cells[i][j] = rowsLive[i].cells[j];
			}
		}
	}
};
levelBrowserScene.init();