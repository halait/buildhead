"use strict";
const levelBrowserScene = {
	ui: document.getElementById("levelBrowserUi"),
	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	rows: [],
	cells: [],
	maxLevels: 0,
	populateLevelBrowser(levels){
		if(levels.length > this.maxLevels) throw("Too much");
		for(let i = 0; i != this.maxLevels; ++i){
			// use metadata to set eventlistener
			//this.rows[i].onpointerdown; 
			this.cells[i][0] = levels[i].name;
			this.cells[i][1] = levels[i].author;
			this.cells[i][2] = levels[i].dataCreated;
			this.cells[i][3] = levels[i].likes;
			this.cells[i][4] = levels[i].dislikes;
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