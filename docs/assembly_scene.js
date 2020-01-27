"use strict";
var assemblyScene = {
	start(){
		this.toolbar.style.display = "flex";
	},
	suspend(){
		this.toolbar.style.display = "none";
	},

	eventHandler: false,
	activeBtn: false,
	toolbar: document.getElementById("assemblySceneBtnsDiv"),
	currentLevel: 0,

	handleWheel(e) {
		e.preventDefault();
		scaleCanvas(e.deltaY * 0.001);
	},
	
	async startLevel(level){
		if(path) level = path + level;
		this.currentLevel = level;
		console.log("starting level " + level);
		loadingScreen.style.display = "block";
		let response = await fetch(level);
		loadLevelScene.loadLevel(response.json());
		sceneManager.push(this);
		loadingScreen.style.display = "none";
		/*
		try {
		} catch {
			loadLevelScene.loadLevel(levelJsons[level[7]]);
			sceneManager.push(this);
			loadingScreen.style.display = "none";
		}
		/*
			.then(json => {console.log(json);})
		.catch(() => {console.log("heyy");});
		if(loadLevelScene.loadLevel(levelJsons[level])) {
			sceneManager.push(this);
			pw.render();
		}
		*/
	},

	init(){
		addBtn(startSimulationBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(simulationScene);});
		addBtn(ccwWheelCreatorBtn.cloneNode(true), this.toolbar, ccwWheelCreatorEventHandler);
		addBtn(nWheelCreatorBtn.cloneNode(true), this.toolbar, nWheelCreatorEventHandler);
		addBtn(cwWheelCreatorBtn.cloneNode(true), this.toolbar, cwWheelCreatorEventHandler);
		addBtn(nRodCreatorBtn.cloneNode(true), this.toolbar, nRodCreatorEventHandler);
		addBtn(cRodCreatorBtn.cloneNode(true), this.toolbar, cRodCreatorEventHandler);
		addBtn(moveBtn.cloneNode(true), this.toolbar, moveEventHandler);
		addBtn(removeBtn.cloneNode(true), this.toolbar, removeEventHandler);
		addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
	}
}
assemblyScene.init();