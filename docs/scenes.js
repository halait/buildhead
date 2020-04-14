"use strict";

const modeScene = {
	ui: document.getElementById("mode-ui"),
	currentIndex: 0,
	start(index) {
		this.ui.style.display = "block";
		this.currentIndex = index;
	},
	suspend() {
		this.ui.style.display = "none";
	},
	init() {
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("click", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("play-btn").addEventListener("click", () => {
			sceneManager.push(assemblyScene);
			levelBrowserScene.loadLevel(this.currentIndex);
			if(levelBrowserScene.currentLevel.id == "halait - 0 Tutorial"){
				sceneManager.float(tutorialScene);
			}
		});
		document.getElementById("edit-btn").addEventListener("click", () => {
			sceneManager.push(sandboxScene);
			levelBrowserScene.loadLevel(this.currentIndex);
		});
	}
}
modeScene.init();

const saveScene = {
	ui: document.getElementById("save-ui"),
	saveInfoP: document.getElementById("save-info-p"),
	saveText: document.getElementById('save-text'),
	header: document.getElementById("save-header"),
	start(){
		if(!user){
			sceneManager.float(loginScene);
			return;
		}
		if(sandboxMode){
			this.header.textContent = "Save Level";
		} else {
			this.header.textContent = "Save Solution";
		}
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	getJson(){
		let json = '[{"JSON_LevelFile":true}';
		for(const o of gameObjects){
			if(sandboxMode || !o.levelObject) json += "," + o.toJson();
		}
		for(const j of joints){
			if(sandboxMode || !j.levelObject) json += "," + j.toJson();
		}
		json += "]";
		return json;
	},
	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("click", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("save-form").addEventListener("submit", async (e) => {
			e.preventDefault();
			let docName = this.saveText.value;
			const pre = /^og /;
			let docPath = "userLevels";
			if(user && user.displayName === "halait" && pre.test(docName)){
				docPath = "originalLevels";
				docName = docName.replace(pre, "");
			}
			if(sandboxMode) {
				docPath += "/la=" + user.displayName + "+ln=" + docName; 
			} else {
				docPath = levelBrowserScene.currentLevel.path + "/solutions/" + levelBrowserScene.currentLevel.id + "+sa=" + user.displayName + "+sn=" + docName; 
			}
			try {
				if((await db.doc(docPath).get()).exists){
					this.saveInfoP.textContent = "You already used this name, choose a different name";
					return;
				}
				await db.doc(docPath).set({
					name: docName,
					author: user.displayName,
					authorId: user.uid,
					dateCreated: new Date(),
					rating: 0,
					plays: 0,
					json: this.getJson()
				});
				this.saveInfoP.textContent = "";
				sceneManager.unfloat();
			} catch(e) {
				console.error(e);
				exceptionScene.throw(e.message);
			}
		});
	}
}
saveScene.init();