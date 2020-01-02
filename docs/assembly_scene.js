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

	startLevel(level){
		this.currentLevel = level;
		for(const def of levelJsons[level]){
			create(def);
		}
		sceneManager.push(this);
		pw.render();
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