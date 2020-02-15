"use strict";
var saveLevelScene = {
	//activeBtn: false,
	//activeBtnElement: false,
	ui: document.getElementById("saveLevelUI"),
	//backScene: false,
	saveMessageP: document.getElementById("saveMessageP"),
	downloadLink: document.getElementById('downloadlink'),
	saveText: document.getElementById('saveText'),
	save(level = false){
		this.saveMessageP.textContent = "Creating file...";
		if(saveText.value == ""){
			exceptionScene.throw("Missing level filename.");
			this.saveMessageP.textContent = "";
			return;
		} else {
			let json = '[{"JSON_LevelFile":true}';
			for(const o of gameObjects){
				if(level == o.levelObject) json += "," + o.toJson();
			}
			for(const j of joints){
				if(level == o.levelObject) json += "," + j.toJson();
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
		if(!user){
			sceneManager.float(loginScene);
			return;
		}
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		/*
		const saveBtn = document.getElementById("saveBtn");
		saveBtn.onclick = () => {saveLevelScene.save()};
		saveLevelScene.saveText.addEventListener('keydown', (e) => {
			if(e.keyCode == 13) saveLevelScene.save(true);
		});
		*/
		document.getElementById("loginForm").addEventListener("submit", () => {
			this.saveMessageP = "Saving...";
			let dbPath = "solutions";
			if(sandboxMode) dbPath = "levels";
			db.collection(dbPath).add({
				name: this.saveText.value,
				author: user.displayName,
				authorId: user.uid,
				dateCreated: new Date(),
				likes: 0,
				dislikes: 0,
				json: getJson()
			})
			.then(() => {
				this.saveMessageP = "";
				sceneManager.unfloat();
			})
			.catch((err) => {
				console.error(err);
				exceptionScene.throw(err.message);
			});
		});
	}
}
saveLevelScene.init();