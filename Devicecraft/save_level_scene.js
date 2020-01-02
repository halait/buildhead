"use strict";
var saveLevelScene = {
	//activeBtn: false,
	//activeBtnElement: false,
	ui: document.getElementById("saveLevelUI"),
	//backScene: false,
	saveMessageP: document.getElementById("saveMessageP"),
	downloadLink: document.getElementById('downloadlink'),
	saveText: document.getElementById('saveText'),
	save(){
		this.saveMessageP.textContent = "Creating file...";
		if(saveText.value == ""){
			exceptionScene.throw("Missing level filename.");
			this.saveMessageP.textContent = "";
			return;
		} else {
			let json = '[{"JSON_LevelFile":true}';
			for(const o of gameObjects){
				json += "," + o.toJson();
			}
			for(const j of joints){
				json += "," + j.toJson();
			}
			json += "]"
			let blob = new Blob([json], {type : 'application/json'});
			this.downloadLink.download = saveText.value;
			this.downloadLink.href = URL.createObjectURL(blob);
			this.downloadLink.click();
			this.saveMessageP.textContent = "Download has started";

			// revoke url after download using revokeObjectURl()


			return;
		}
	},
	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.pop();});
		this.ui.prepend(sceneCloseBtn);
		let saveBtn = document.getElementById("saveBtn");
		saveBtn.onclick = () => {saveLevelScene.save()};
		saveLevelScene.saveText.addEventListener('keydown', (e) => {
			if(e.keyCode == 13) saveLevelScene.save();
		});
	}
}
saveLevelScene.init();