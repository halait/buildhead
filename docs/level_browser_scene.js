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
	maxLevels: 0,
	currentLevels: [],
	async populate(refDef){
		const ref = db.collection(refDef.collection);
		this.currentLevels = (await ref.limit(this.maxLevels).get()).docs;
		for(let i = 0, len = this.currentLevels.length; i != len; ++i){
			this.rows[i].onpointerdown = () => {this.loadLevel(i);};
			const level = this.currentLevels[i].data();
			this.cells[i][0].textContent = level.name;
			this.cells[i][1].textContent = level.author;
			this.cells[i][2].textContent = level.dateCreated.toDate().toDateString();
			this.cells[i][3].textContent = level.likes;
			this.cells[i][4].textContent = level.plays;
		}
		for(let i = this.currentLevels.length, len = this.maxLevels; i != len; ++i){
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

	async loadLevel(index){
		try {
			loadLevelScene.load(JSON.parse(this.currentLevels[index].data().json));
			sceneManager.push(assemblyScene);
		} catch(e) {
			console.error(e);
		}
	},

	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("pointerdown", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		const rowsLive = document.getElementById("levelBrowser").tBodies[0].rows;
		const rowLen = rowsLive[0].cells.length;
		this.maxLevels = rowsLive.length;
		for(let i = 0; i < this.maxLevels; ++i){
			this.rows[i] = rowsLive[i];
			this.cells[i] = [];
			for(let j = 0; j < rowLen; ++j){
				this.cells[i][j] = rowsLive[i].cells[j];
			}
		}
	}
};
levelBrowserScene.init();