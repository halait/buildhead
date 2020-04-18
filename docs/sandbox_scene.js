"use strict";
var sandboxScene = {
	eventHandler: false,
	activeBtn: false,
	toolbar: document.getElementById("sandboxToolbar"),

	start(){
		sandboxMode = true;
		this.toolbar.style.display = "flex";
	},
	suspend(){
		this.toolbar.style.display = "none";
	},

	init() {
		addBtn(startSimulationBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(simulationScene)});
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
		addBtn(saveLevelBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(saveScene);});
		addBtn(loadLevelBtn.cloneNode(true), this.toolbar, () => {sceneManager.push(loadLevelScene);});
		addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
	}
}
sandboxScene.init();