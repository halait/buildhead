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
				this.accountBtn.onclick = () => {sceneManager.pushModal(profileScene)};
			} else {
				this.accountBtn.textContent = "Login";
				this.accountBtn.onclick = () => {sceneManager.pushModal(loginScene)};
			}
		},

		//levelBtns: document.getElementsByClassName("levelBtn"),
		ui: document.getElementById("menuUI"),
		accountBtn: document.getElementById("accountBtn"),
		listingOriginalRoute: "/listing/original",
		listingCommunityRoute: "/listing/community",

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
		async start(){
			loadingScreen.style.display = "flex";
			this.ui.style.display = "block";
			const params = location.pathname + location.search;
			if(params != this.params){
				this.params = params;
				let ref = db.collection(parsePathname(location.pathname).subpath).orderBy("dateCreated").limit(this.maxLevels);
				let searchParams = new URLSearchParams(location.search);
				const start = searchParams.get("start");
				if(start){
					this.prevPageBtn.style.display = "block";
					ref = ref.startAt(levelManager.getLevel(start));
				} else {
					this.prevPageBtn.style.display = "none";
				}
				await levelManager.get(ref);
				if(levelManager.levelCache.length != this.maxLevels){
					this.nextPageBtn.style.display = "none";
				} else {
					this.nextPageBtn.style.display = "block";
				}
			}
			this.populate();
			loadingScreen.style.display ="none";
		},
		suspend(){
			this.ui.style.display = "none";
		},
		async refresh(){
			
		},

		createRef(){
			return db.collection(parsePathname(location.pathname).subpath).orderBy("dateCreated").limit(this.maxLevels);
			//let searchParams = new URLSearchParams()
		},
		
		rows: [],
		cells: [],
		maxLevels: 10,
		params: "",
		nextPageBtn: document.getElementById("next-page-btn"),
		prevPageBtn: document.getElementById("prev-page-btn"),

		populate(){
			const len = levelManager.levelCache.length;
			history.replaceState
			for(let i = 0; i != len; ++i){
				this.rows[i].style.display = "table-row";
				/*
				this.rows[i].onpointerdown = () => {
					sceneManager.pushModal(modeScene, levelManager.levelCache[i].ref.path);
				};
				this.cells[i][0].textContent = levelManager.levelCache[i].get("name");
				this.cells[i][1].textContent = levelManager.levelCache[i].get("author");
				this.cells[i][2].textContent = levelManager.levelCache[i].get("dateCreated").toDate().toDateString();
				this.cells[i][3].textContent = levelManager.levelCache[i].get("rating");
				this.cells[i][4].textContent = levelManager.levelCache[i].get("plays");
				if(levelManager.levelCache[i].review){
					this.rows[i].classList.add("completed-level");
				} else {
					this.rows[i].classList.remove("completed-level");
				}
				*/
				this.rows[i].onpointerdown = () => {
					sceneManager.pushModal(modeScene, levelManager.levelCache[i].ref.path);
				};
				this.cells[i][0].textContent = levelManager.levelCache[i].data.name;
				this.cells[i][1].textContent = levelManager.levelCache[i].data.author;
				this.cells[i][2].textContent = levelManager.levelCache[i].data.dateCreated.toDate().toDateString();
				this.cells[i][3].textContent = levelManager.levelCache[i].data.rating;
				this.cells[i][4].textContent = levelManager.levelCache[i].data.plays;
				if(levelManager.levelCache[i].review){
					this.rows[i].classList.add("completed-level");
				} else {
					this.rows[i].classList.remove("completed-level");
				}
			}
			for(let i = len; i != this.maxLevels; ++i){
				this.rows[i].style.display = "none";
			}
		},
		getCollectionPath(levelPath){
			return levelPath.split("/").slice(0, -1).join("/");
		},
		init(){
			//const sceneCloseBtn = closeBtn.cloneNode(true);
			//sceneCloseBtn.addEventListener("pointerdown", () => {sceneManager.pop();});
			//this.ui.prepend(sceneCloseBtn);
			this.prevPageBtn.addEventListener("click", async () => {
				await levelManager.get(this.createRef().endBefore(levelManager.levelCache[0]));
				this.populate();
				const searchParams = new URLSearchParams(location.search);
				searchParams.set("start", levelManager.levelCache[0].ref.path);
				history.replaceState(null, "", location.pathname + "?" + searchParams.toString());
				this.nextPageBtn.style.display = "block";
			});
			this.nextPageBtn.addEventListener("click", async () => {
				await levelManager.get(this.createRef().startAfter(levelManager.levelCache[levelManager.levelCache.length - 1]));
				this.populate();
				const searchParams = new URLSearchParams(location.search);
				searchParams.set("start", levelManager.levelCache[0].ref.path);
				history.replaceState(null, "", location.pathname + "?" + searchParams.toString());
				this.prevPageBtn.style.display = "block";
				if(levelManager.levelCache.length != this.maxLevels){
					this.nextPageBtn.style.display = "none";
				}
			});

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
			if(docPath) {
				await levelManager.loadLevel(docPath);
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
			if(!docPath){
				sceneManager.pushModal(messageScene, "Error", "This url is incorrectly formatted");
				return;
			}
			this.currentLevel = await levelManager.loadLevel(docPath);
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