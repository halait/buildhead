"use strict";
const routes = {
	"/": {
		start(){
			this.ui.style.display = "block";
			/*
			if(tutorialStep != -1){
				tutorialScene.removeCurrentEventListener();
				tutorialStep = -1;
			}
			*/
		},
		suspend(){
			this.ui.style.display = "none";
		},
		onUserChanged(){
			console.log(user);
			if(user) {
				this.accountBtn.textContent = user.displayName;
				this.accountBtn.onclick = () => {sceneManager.push(profileScene)};
			} else {
				this.accountBtn.textContent = "Login";
				this.accountBtn.onclick = () => {sceneManager.push(loginScene)};
			}
		},

		//levelBtns: document.getElementsByClassName("levelBtn"),
		ui: document.getElementById("menuUI"),
		accountBtn: document.getElementById("accountBtn"),
		listingOriginalRoute: `/listing/${stringToBase64("original")}`,
		listingCommunityRoute: `/listing/${stringToBase64("community")}`,

		init(){
			document.getElementById("originalLevelsBtn").addEventListener("pointerdown", () => {
				sceneManager.push(this.listingOriginalRoute);
			});
			document.getElementById("userLevelsBtn").addEventListener("pointerdown", () => {
				sceneManager.push(this.listingCommunityRoute);
			});
			document.getElementById("sandboxBtn").addEventListener("pointerdown", () => {
				canvasEventManager.reset();
				sceneManager.push("/sandbox");
			});
		}
	},
	"/listing": {
		ui: document.getElementById("levelBrowserUi"),
		async start(collectionPathBase64){
			this.ui.style.display = "block";
			loadingScreen.style.display = "flex";
			const collectionPath = base64ToString(collectionPathBase64);
			if(collectionPath != this.collectionPath) {
				this.collectionPath = collectionPath;
				await this.normalizeLevels((await db.collection(collectionPath).limit(this.maxLevels).get()).docs);
			}
			this.populate();
			loadingScreen.style.display ="none";
		},
		suspend(){
			this.ui.style.display = "none";
		},
		rows: [],
		cells: [],
		maxLevels: 10,
		levels: [],
		lastDoc: null,
		collectionPath: null,
		async populate(){
			const len = this.levels.length;
			for(let i = 0; i != len; ++i){
				this.rows[i].style.display = "table-row";
				this.rows[i].onpointerdown = () => {
					this.startLevel(i);
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

			for(let i = len; i != this.maxLevels; ++i){
				this.rows[i].style.display = "none";
			}
		},

		async normalizeLevels(docs){
			console.log("normalizing levels");
			const len = docs.length;
			if(!len){
				return;
			}
			this.lastDoc = docs[len - 1];
			const ids = [];
			for(let i = 0; i != len; ++i){
				const level = docs[i].data();
				const id = docs[i].id;
				ids[i] = id;
				level.id = id;
				level.path = docs[i].ref.path;
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
			}
		},

		indexOf(levelPath){
			for(let i = 0, len = this.levels.length; i != len; ++i){
				if(this.levels[i].path == levelPath){
					return i;
				}
			}
			return -1;
		},

		// maybe loadNextLevel
		getNextLevel(level){
			const i = this.indexOf(level.path);
			if(i != -1 && i != this.levels.length){
				return this.levels[i + 1];
			}
			await this.getNextChunk();
			if(this.levels.length){
				return this.levels[0];
			}
			return null;
		},

		async getNextChunk(){
			if(!this.collectionPath || !this.lastDoc) throw "Never";
			await this.normalizeLevels((db.collection(this.collectionPath).startAfter(this.lastDoc).limit(this.maxLevels).get()).docs);
		}

		startLevel(index){
			sceneManager.pushModal(modeScene, this.levels[index]);
		},

		getCollectionPath(levelPath){
			return levelPath.split("/").slice(0, -1).join("/");
		},

		async loadLevel(levelPath){
			let i = this.indexOf(levelPath);
			if(i == -1) {
				this.collectionPath = this.getCollectionPath(levelPath);
				await this.normalizeLevels((await db.collection(this.collectionPath).startAt(await db.doc(levelPath).get()).limit(this.maxLevels).get()).docs);
				i = 0;
			}
			const level = this.levels[i];
			let levelData = null;
			try {
				levelData = JSON.parse(level.json);
			} catch(e) {
				exceptionScene.throw("Level corrupted, could not deserialize");
				throw e;
			}
			canvasEventManager.reset();
			sandboxMode = true;
			loadLevelScene.load(levelData);
			sandboxMode = false;
			const batch = db.batch();
			batch.update(db.doc(level.path), {plays: firebase.firestore.FieldValue.increment(1)});
			if(!level.review){
				level.review = {rating: 0};
				batch.set(db.doc("users/" + user.uid + "/reviews/" + level.id), level.review);
			}
			batch.commit()
				.catch((err) => {
					exceptionScene.throw(err);
					throw err;
				});
			return level;
		},

		init(){
			//const sceneCloseBtn = closeBtn.cloneNode(true);
			//sceneCloseBtn.addEventListener("pointerdown", () => {sceneManager.pop();});
			//this.ui.prepend(sceneCloseBtn);
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
	},
	"/sandbox": {
		toolbar: document.getElementById("sandboxToolbar"),

		async start(docPath){
			this.toolbar.style.display = "flex";
			let level = history.state;
			if(!level && docPath) {
				await routes["/listing"].normalizeLevels([await db.doc(base64ToString(docPath)).get()]);
				level = routes["/listing"].levels[0];
			}
			if(level){
				await routes["/listing"].loadLevel(level);
			}
			sandboxMode = true;
		},
		suspend(){
			this.toolbar.style.display = "none";
		},

		init() {
			addBtn(startSimulationBtn.cloneNode(true), this.toolbar, () => {simulationManager.begin(this);});
			addBtn(ccwWheelCreatorBtn.cloneNode(true), this.toolbar, ccwWheelCreatorEventHandler);
			addBtn(nWheelCreatorBtn.cloneNode(true), this.toolbar, nWheelCreatorEventHandler);
			addBtn(cwWheelCreatorBtn.cloneNode(true), this.toolbar, cwWheelCreatorEventHandler);
			addBtn(tWheelCreatorBtn.cloneNode(true), this.toolbar, tWheelCreatorEventHandler);
			addBtn(nRodCreatorBtn.cloneNode(true), this.toolbar, nRodCreatorEventHandler);
			addBtn(cRodCreatorBtn.cloneNode(true), this.toolbar, cRodCreatorEventHandler);
			addBtn(gRodCreatorBtn.cloneNode(true), this.toolbar, gRodCreatorEventHandler);
			addBtn(polygonBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(createPolygonScene);});
			addBtn(moveBtn.cloneNode(true), this.toolbar, moveEventHandler);
			addBtn(removeBtn.cloneNode(true), this.toolbar, removeEventHandler);
			addBtn(assemblyFieldCreatorBtn.cloneNode(true), this.toolbar, assemblyFieldCreatorEventHandler);
			addBtn(goalFieldCreatorBtn.cloneNode(true), this.toolbar, goalFieldCreatorEventHandler);
			addBtn(saveLevelBtn.cloneNode(true), this.toolbar, () => {sceneManager.pushModal(saveScene);});
			addBtn(loadLevelBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(loadLevelScene);});
			//addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
		}
	},
	"/play": {
		async start(docPath){
			this.toolbar.style.display = "flex";
			if(history.state){
				docPath = history.state.path;
			} else if(docPath){
				docPath = base64ToString(docPath);
			} else {
				exceptionScene.throw("This url is incorrectly formatted");
				return;
			}
			this.currentLevel = await routes["/listing"].loadLevel(docPath);
			sandboxMode = false;
		},
		suspend(){
			if(simulationManager.isSimulating){
				simulationManager.end();
			}
			this.toolbar.style.display = "none";
		},
		toolbar: document.getElementById("assemblySceneBtnsDiv"),
		currentLevel: null,
	
		init(){
			addBtn(startSimulationBtn.cloneNode(true), this.toolbar, () => {simulationManager.begin(this);});
			addBtn(ccwWheelCreatorBtn.cloneNode(true), this.toolbar, ccwWheelCreatorEventHandler);
			addBtn(nWheelCreatorBtn.cloneNode(true), this.toolbar, nWheelCreatorEventHandler);
			addBtn(cwWheelCreatorBtn.cloneNode(true), this.toolbar, cwWheelCreatorEventHandler);
			addBtn(nRodCreatorBtn.cloneNode(true), this.toolbar, nRodCreatorEventHandler);
			addBtn(cRodCreatorBtn.cloneNode(true), this.toolbar, cRodCreatorEventHandler);
			addBtn(moveBtn.cloneNode(true), this.toolbar, moveEventHandler);
			addBtn(removeBtn.cloneNode(true), this.toolbar, removeEventHandler);
			//addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
		}
	}
}
for(const route in routes){
	routes[route].init();
}