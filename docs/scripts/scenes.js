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
		listingOriginalRoute: "/listing?collection=original",
		listingCommunityRoute: "/listing?collection=community",

		init(){
			document.getElementById("originalLevelsBtn").addEventListener("pointerdown", () => {
				sceneManager.push(this.listingOriginalRoute);
			});
			document.getElementById("userLevelsBtn").addEventListener("pointerdown", () => {
				sceneManager.push(this.listingCommunityRoute);
			});
			document.getElementById("sandboxBtn").addEventListener("pointerdown", () => {
				//canvasEventManager.reset();
				sceneManager.push("/sandbox");
			});
		}
	},
	"/listing": {
		ui: document.getElementById("levelBrowserUi"),
		async start(){
			loadingScreen.style.display = "flex";
			this.ui.style.display = "block";
			if(location.search != this.search){
				this.search = location.search;
				levelManager.clearCache();
				this.items = await levelManager.getLevels(this.createParams());
			}
			this.browserContent.innerHTML = "";
			this.populate(this.items);
			loadingScreen.style.display ="none";
		},
		suspend(){
			this.ui.style.display = "none";
		},
		createParams(startAfterPath){
			const searchParams = new URLSearchParams(location.search);
			const collection = searchParams.get("collection");
			if(!collection) {
				sceneManager.pushModal("Error", "URL malformed");
				throw "Collection path undefined";
			}
			let orderBy = searchParams.get("sort_by");
			if(!orderBy){
				orderBy = "dateCreated";
			}
			let result = {collection, orderBy};
			let endAtPath = searchParams.get("end_at");
			if(startAfterPath) {
				result.startAfterPath = startAfterPath;
			} else if(endAtPath){
				result.endAtPath = endAtPath;
			}
			return result;
		},
		
		maxLevels: 10,
		search: "",
		items: [],
		loadMoreBtn: document.getElementById("load-more-btn"),
		browserContent: document.getElementById("browser-content"),
		sortBySelect: document.getElementById("sort-by-select"),
		template: `<tr class="{{c}}" data-path="{{p}}"><td>{{n}}</td><td>{{a}}</td><td>{{d}}</td><td>{{r}}</td><td>{{pl}}</td></tr>`,

		populate(items){
			const len = items.length;
			let html = "";
			for(let i = 0; i != len; ++i){
				let className = items[i].review ? "completed-level" : "";
				html += this.template
					.replace("{{c}}", className)
					.replace("{{p}}", items[i].path)
					.replace("{{n}}", items[i].name)
					.replace("{{a}}", items[i].author)
					.replace("{{d}}", items[i].dateCreated.toDate().toDateString().slice(4))
					.replace("{{r}}", items[i].rating)
					.replace("{{pl}}", items[i].plays);
			}
			this.browserContent.innerHTML += html;
		},
		init(){
			this.browserContent.addEventListener("click", (e) => {
				const node = e.target.parentNode;
				if(node.tagName == "TR") {
					sceneManager.pushModal(modeScene, node.dataset.path);
				}
			});
			this.sortBySelect.addEventListener("change", () => {
				const searchParams = new URLSearchParams(location.search);
				searchParams.set("sort_by", this.sortBySelect.value);
				searchParams.delete("end_at");
				history.replaceState(null, "", "/listing?" + searchParams.toString());
				this.start();
			});
			this.loadMoreBtn.addEventListener("click", async () => {
				const levels = await levelManager.getLevels(this.createParams(this.items[this.items.length - 1].path));
				const len = levels.length;
				if(len < this.maxLevels){
					this.loadMoreBtn.style.display = "none";
					if(!len){
						return;
					}
				}
				this.populate(levels);
				this.items.push(...levels);
				const searchParams = new URLSearchParams(location.search);
				searchParams.set("end_at", levels[levels.length - 1].path);
				history.replaceState(null, "", "/listing?" + searchParams.toString());
			});
		}
	},
	"/sandbox": {
		toolbar: document.getElementById("sandboxToolbar"),

		async start(docPath){
			this.toolbar.style.display = "flex";
			if(docPath) {
				loadingScreen.style.display = "flex";
				try {
					const level = await levelManager.getLevel(docPath);
					levelManager.loadLevel(level);
				} catch(e) {
					sceneManager.pushModal(messageScene, "Error", "Level could not be loaded. Try a different level also please consider sending feedback.");
					console.error(e);
				}
				loadingScreen.style.display = "none";
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
			loadingScreen.style.display = "flex";
			this.toolbar.style.display = "flex";
			if(!docPath){
				sceneManager.pushModal(messageScene, "Error", "Url is incorrectly formatted");
				return;
			}
			try {
				this.currentLevel = await levelManager.getLevel(docPath);
				levelManager.loadLevel(this.currentLevel);
			} catch(e) {
				sceneManager.pushModal(messageScene, "Error", "Level could not be loaded. Try a different level also please consider sending feedback.");
				throw e;
			}
			pw.render();
			sandboxMode = false;
			loadingScreen.style.display = "none";
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