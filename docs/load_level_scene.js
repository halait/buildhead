"use strict";
var loadLevelScene = {
	messageP: document.getElementById("loadMessageP"),
	fileInput: document.getElementById("input"),
	activeBtn: false,
	activeBtnElement: false,
	ui: document.getElementById("loadLevelUI"),
	backScene: false,
	reader: new FileReader(),

	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	load(defs){
		resetCanvas();
		for(let i = 1, len = defs.length; i < len; ++i){
			if(create(defs[i]) === null) {
				exceptionScene.throw(
					"This level file is corrupted and cannot be loaded. Try another level file or please consider sending feedback to have the issue solved, it will be apreciated."
				);
				return false;
			}
		}
		pw.render();
		return true;
	},

	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		this.fileInput.addEventListener('change', function(){
			if(loadLevelScene.fileInput.files[0].type != "application/json"){
				loadLevelScene.messageP.textContent = "";
				loadLevelScene.fileInput.value = "";
				exceptionScene.throw("Cannot load this file type, level file must be of type JSON.");
				return;
			}
			loadLevelScene.messageP.textContent = "Loading...";
			loadLevelScene.reader.readAsText(loadLevelScene.fileInput.files[0]);
		});

		this.reader.onload = function(){
			sceneManager.unfloat();
			loadLevelScene.messageP.textContent = "";
			loadLevelScene.fileInput.value = "";
			let json = loadLevelScene.reader.result;
			let defs = null;
			try {
				defs = JSON.parse(json);
			} catch(err){
				exceptionScene.throw(
					"This level file is corrupted and cannot be loaded. Try another level file or please consider sending feedback to have the issue solved, it will be apreciated."
				);
				console.error(err);
				return false;
			}
			if(!defs[0].JSON_LevelFile){
				exceptionScene.throw("Cannot load this level because it's missing the required level file signature, probably because it's not a level file.");
				return false;
			}
			loadLevelScene.load(defs);
		}
	}
}
loadLevelScene.init();

