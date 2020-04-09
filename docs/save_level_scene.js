"use strict";
var saveLevelScene = {
	//activeBtn: false,
	//activeBtnElement: false,
	ui: document.getElementById("saveLevelUI"),
	//backScene: false,
	saveMessageP: document.getElementById("saveMessageP"),
	downloadLink: document.getElementById('downloadlink'),
	saveText: document.getElementById('saveText'),
	getJson(){
		let json = '[{"JSON_LevelFile":true}';
		for(const o of gameObjects){
			if(sandboxMode || !o.levelObject) json += "," + o.toJson();
		}
		for(const j of joints){
			if(sandboxMode || !j.levelObject) json += "," + j.toJson();
		}
		json += "]";
		/*
		let blob = new Blob([json], {type : 'application/json'});
		this.downloadLink.download = saveText.value;
		this.downloadLink.href = URL.createObjectURL(blob);
		this.downloadLink.click();
		this.saveMessageP.textContent = "Download has started";
		*/
		return json;
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
		this.saveMessageP.textContent = "";
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
		document.getElementById("saveForm").addEventListener("submit", async (e) => {
			e.preventDefault();
			//let dbPath = "solutions";
			//if(sandboxMode) dbPath = "levels";
			let levelName = this.saveText.value;
			let collection = "userLevels";
			const pre = /^og/;
			if(user && user.displayName === "halait" && pre.test(levelName)){
				collection = "originalLevels";
				levelName = levelName.replace(pre, "");
			}
			const name = user.displayName + " - " + levelName;
			try {
				if((await db.collection(collection).doc(name).get()).exists){
					this.saveMessageP.textContent = "You already created a level with this name, choose a different name";
					return;
				}
				await db.collection(collection).doc(name).set({
					name: levelName,
					author: user.displayName,
					authorId: user.uid,
					dateCreated: new Date(),
					likes: 0,
					difficulty: 0,
					plays: 0,
					json: this.getJson(),
					level: sandboxMode
				})

				this.saveMessageP.textContent = "";
				sceneManager.unfloat();
			} catch(e) {
				console.error(e);
				exceptionScene.throw(e.message);
			}
		});
	}
}
saveLevelScene.init();