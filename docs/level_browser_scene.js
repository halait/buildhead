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
	currentLevelIndex: 0,
	refDef: null,
	lastDoc: null,
	async populate(refDef){
		this.levels.length = 0;
		this.refDef = refDef;
		let ref = db.collection(refDef.collectionPath);
		if(refDef.getNextBatch) {
			if(!lastDoc){
				throw "!lastDoc";
			}
			ref = ref.startAfter(this.lastDoc);
		}
		const levelsSnap = (await ref.limit(this.maxLevels).get()).docs;
		const len = levelsSnap.length;
		if(len){
			this.lastDoc = levelsSnap[len - 1];
			const ids = [];
			for(let i = 0; i != len; ++i){
				const level = levelsSnap[i].data();
				const id = levelsSnap[i].id;
				ids[i] = id;
				level.id = id;
				level.path = levelsSnap[i].ref.path;
				this.levels[i] = level;
			}
			if(len && user){
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
			}

			for(let i = 0; i != len; ++i){
				this.rows[i].style.display = "table-row";
				this.rows[i].onpointerdown = () => {
					sceneManager.float(modeScene, i);
				};
				this.cells[i][0].textContent = this.levels[i].name;
				this.cells[i][1].textContent = this.levels[i].author;
				this.cells[i][2].textContent = this.levels[i].dateCreated.toDate().toDateString();
				this.cells[i][3].textContent = this.levels[i].rating;
				this.cells[i][4].textContent = this.levels[i].plays;
				if(this.levels[i].review){
					this.rows[i].classList.add("completed-level");
				} else {
					this.rows[i].classList.remove("completed-level");
				}
			}
		}

		for(let i = len; i != this.maxLevels; ++i){
			this.rows[i].style.display = "none";
		}
	},

	loadLevel(index){
		this.currentLevel = this.levels[index];
		this.currentLevelIndex = index;
		let levelData = null;
		try {
			levelData = JSON.parse(this.currentLevel.json);
		} catch(e) {
			exceptionScene.throw("Level corrupted, could not deserialize");
			throw e;
		}
		loadLevelScene.load(levelData);
		db.doc(this.currentLevel.path).update({plays: firebase.firestore.FieldValue.increment(1)}).catch((err) => {
				exceptionScene.throw(err);
				throw err;
			}
		);
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