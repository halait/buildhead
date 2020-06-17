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
				//canvasEventManager.reset();
				sceneManager.push("/sandbox");
			});
			/*
			document.getElementById("your-levels-btn").addEventListener("pointerdown", () => {
				if(!user){
					sceneManager.pushModal(loginScene);
					return;
				}
				sceneManager.push("/listing/community?author=" + user.displayName);
			});
			*/
		}
	},

	"/listing": {
		ui: document.getElementById("levelBrowserUi"),
		async start(){
			loadingScreen.style.display = "flex";
			this.ui.style.display = "block";
			const collection = location.pathname.replace(this.route, "");
			if(collection == "/original"){
				this.orderOption.style.display = "block";
				this.searchContainer.style.display = "none";
				this.defaultOrderBy = "index";
			} else {
				this.orderOption.style.display = "none";
				this.searchContainer.style.display = "block";
				this.defaultOrderBy = "dateCreated";
			}
			let search = location.search;
			if(this.forceRefreshFlag || collection != this.collection || search != this.search){
				console.log("refreshing");
				this.forceRefreshFlag = false;
				this.collection = collection;
				this.search = search;
				levelManager.clearCache();
				try {
					this.items = await levelManager.getLevels(this.createParams());
				} catch(e){
					sceneManager.pushModal(messageScene, "Error", "Something went wrong. Try a different location, also please consider sending feedback");
					throw e;
				}
			}
			if(this.items.length < this.maxLevels){
				this.loadMoreBtn.style.display = "none";
				this.moreLoadable = false;
			} else {
				this.loadMoreBtn.style.display = "block";
				this.moreLoadable = true;
			}
			this.browserContent.innerHTML = "";
			this.populate(this.items);
			loadingScreen.style.display ="none";
		},
		suspend(){
			this.ui.style.display = "none";
		},
		createParams(startAfterPath){
			const collection = this.collection;
			if(!collection) {
				throw "Collection path undefined";
			}
			const searchParams = new URLSearchParams(this.search);
			const orderBy = [searchParams.get("sort_by") || this.defaultOrderBy];
			this.sortBySelect.value = orderBy[0];
			if(!this.descSortOptions.includes(orderBy[0])) {
				orderBy[1] = "desc";
			}
			let result = {collection, orderBy};
			let search = searchParams.get("q");
			if(search){
				result.where = search ? ["tags", "array-contains-any", tokenize(search)] : null;
			}
			let endAtPath = searchParams.get("end_at");
			if(startAfterPath) {
				result.startAfterPath = startAfterPath;
			} else if(endAtPath){
				result.endAtPath = endAtPath;
			}
			return result;
		},

		maxLevels: 10,
		collection: "",
		search: "",
		route: "/listing",
		defaultOrderBy: null,
		items: [],
		forceRefreshFlag: false,
		orderOption: document.getElementById("order-option"),
		descSortOptions : ["index"],
		loadMoreBtn: document.getElementById("load-more-btn"),
		browserContent: document.getElementById("browser-content"),
		sortBySelect: document.getElementById("sort-by-select"),
		searchInput: document.getElementById("search-input"),
		searchContainer: document.getElementById("search-container"),
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
		createQueryString(searchParams){
			searchParams = searchParams.toString();
			if(searchParams){
				searchParams = "?" + searchParams;
			}
			return searchParams;
		},
		searchHandler(){
			const string = routes["/listing"].searchInput.value.toLowerCase().trim();
			let searchParams = new URLSearchParams(location.search);
			if(!string){
				searchParams.delete("q");
			} else {
				searchParams.set("q", string);
			}
			sceneManager.push(location.pathname + routes["/listing"].createQueryString(searchParams));
		},
		async loadMoreHandler(){
			const levels = await levelManager.getLevels(routes["/listing"].createParams(routes["/listing"].items[routes["/listing"].items.length - 1].path));
			const len = levels.length;
			if(len < routes["/listing"].maxLevels){
				routes["/listing"].loadMoreBtn.style.display = "none";
				//routes["/listing"].moreLoadable = false;
				if(!len){
					return;
				}
			}
			routes["/listing"].populate(levels);
			routes["/listing"].items.push(...levels);
			let searchParams = new URLSearchParams(location.search);
			searchParams.set("end_at", levels[levels.length - 1].path);
			history.replaceState(null, "", location.pathname + routes["/listing"].createQueryString(searchParams));
		},
		init(){
			this.browserContent.addEventListener("click", async (e) => {
				const node = e.target.parentNode;
				if(node.tagName == "TR") {
					sceneManager.pushModal(modeScene, await levelManager.getLevel(node.dataset.path));
				}
			});
			this.sortBySelect.addEventListener("change", () => {
				let searchParams = new URLSearchParams(location.search);
				const value = this.sortBySelect.value;
				if(value){
					searchParams.set("sort_by", this.sortBySelect.value);
				} else {
					searchParams.delete("sort_by");
				}
				searchParams.delete("end_at");
				sceneManager.push(location.pathname + this.createQueryString(searchParams));
			});
			this.searchInput.addEventListener("change", this.searchHandler);
			this.loadMoreBtn.addEventListener("click", this.loadMoreHandler);
		}
	},

	"/sandbox": {
		toolbar: document.getElementById("sandboxToolbar"),

		async start(){
			let docPath = location.pathname;
			this.toolbar.style.display = "flex";
			if(docPath != "/sandbox") {
				docPath = docPath.replace("/sandbox", "");
				loadingScreen.style.display = "flex";
				try {
					const level = await levelManager.getLevel(docPath);
					levelManager.loadLevel(level);
				} catch(e) {
					sceneManager.pushModal(messageScene, "Error", "Level could not be loaded. Try a different level also please consider sending feedback.");
					console.error(e);
				}
				loadingScreen.style.display = "none";
			} else {
				canvasEventManager.reset();
			}
			sandboxMode = true;
		},
		suspend(){
			if(simulationManager.isSimulating){
				simulationManager.end();
			}
			this.toolbar.style.display = "none";
		},

		init() {
			this.toolbar.querySelector(".startSimulationBtn").addEventListener("pointerdown", function() {
				simulationManager.begin(routes["/sandbox"]);
			});
			this.toolbar.querySelector(".ccwWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(ccwWheelCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".nWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(nWheelCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".cwWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(cwWheelCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".tWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(tWheelCreatorEventHandler, this);
				sceneManager.pushModal(createCustomScene, pw.CIRCLE_FORM);
			});
			this.toolbar.querySelector(".nRodCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(nRodCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".cRodCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(cRodCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".gRodCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(gRodCreatorEventHandler, this);
				sceneManager.pushModal(createCustomScene);
			});
			/*this.toolbar.querySelector(".polygonBtn").addEventListener("pointerdown", function(){
				sceneManager.pushModal(createPolygonScene);
			});*/
			this.toolbar.querySelector(".moveBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(moveEventHandler, this);
			});
			this.toolbar.querySelector(".removeBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(removeEventHandler, this);
			});
			this.toolbar.querySelector(".assemblyFieldCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(assemblyFieldCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".goalFieldCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(goalFieldCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".saveLevelBtn").addEventListener("pointerdown", function(){
				sceneManager.pushModal(saveScene);
			});
			//addBtn(loadLevelBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(loadLevelScene);});
			//addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
		}
	},

	"/play": {
		async start(){
			loadingScreen.style.display = "flex";
			this.toolbar.style.display = "flex";
			let docPath = location.pathname.replace("/play/", "");
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
			sandboxMode = false;
			this.levelInfo.style.display = "block";
			this.levelInfo.textContent = this.currentLevel.author + " - " + this.currentLevel.name;
			loadingScreen.style.display = "none";
			if(this.currentLevel.name == "Tutorial" && this.currentLevel.author == "halait"){
				sceneManager.pushModal(tutorialScene);
			}
		},
		suspend(){
			if(simulationManager.isSimulating){
				simulationManager.end();
			}
			this.toolbar.style.display = "none";
			this.levelInfo.style.display = "none";
		},
		toolbar: document.getElementById("assemblySceneBtnsDiv"),
		levelInfo: document.getElementById("level-info"),
		currentLevel: null,
	
		init(){
			this.toolbar.querySelector(".startSimulationBtn").addEventListener("pointerdown", function() {
				simulationManager.begin(routes["/play"]);
			});
			this.toolbar.querySelector(".ccwWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(ccwWheelCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".nWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(nWheelCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".cwWheelCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(cwWheelCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".nRodCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(nRodCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".cRodCreatorBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(cRodCreatorEventHandler, this);
			});
			this.toolbar.querySelector(".moveBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(moveEventHandler, this);
			});
			this.toolbar.querySelector(".removeBtn").addEventListener("pointerdown", function(){
				canvasEventManager.setHandler(removeEventHandler, this);
			});
			//addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
		}
	}
}
for(const route in routes){
	routes[route].init();
}