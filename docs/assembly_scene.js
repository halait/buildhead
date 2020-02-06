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
	levelNum: 0,

	handleWheel(e) {
		e.preventDefault();
		scaleCanvas(e.deltaY * 0.001);
	},
	
	async startLevel(levelPath){
		this.levelNum = parseInt(levelPath[7]);
		if(path) levelPath = path + levelPath;
		loadingScreen.style.display = "flex";
		let response = null;
		try {
			response = await fetch(levelPath);
		} catch(e) {
			exceptionScene.throw("Unable to load level, check your internet connection.");
			return;
		}
		if(!response.ok){
			exceptionScene.throw("Level file could not be found.");
			return;
		}
		try {
			loadLevelScene.load(await response.json());
		} catch(e) {
			exceptionScene.throw("Unable to parse level file.");
			return;
		}
		sceneManager.push(this);
		loadingScreen.style.display = "none";
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