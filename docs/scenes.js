"use strict";
const modeScene = {
	ui: document.getElementById("mode-ui"),
	isModal: true,
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
		sceneCloseBtn.addEventListener("click", e => {sceneManager.pop();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("play-btn").addEventListener("click", () => {
			sceneManager.push(assemblyScene);
			//levelBrowserScene.loadLevel(this.currentIndex);
		});
		document.getElementById("edit-btn").addEventListener("click", () => {
			sceneManager.push(sandboxScene);
			//levelBrowserScene.loadLevel(this.currentIndex);
		});
	}
}
modeScene.init();

const saveScene = {
	ui: document.getElementById("save-ui"),
	isModal: true,
	saveInfoP: document.getElementById("save-info-p"),
	nameInput: document.getElementById('name-input'),
	tagInput: document.getElementById("tag-input"),
	header: document.getElementById("save-header"),
	start(){
		if(!user){
			sceneManager.pushModal(loginScene);
			return;
		}
		if(!isPlayable()){
			sceneManager.popModal();
			exceptionScene.throw(
				`Unable to save level because it is not playable, to be playable the level must have one assesmbly 
				area (blue box), one goal area (orange box) and one or more targets (orange objects, usually circle).`
			);
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
			let nameIn = this.nameInput.value.trim();
			const pre = /^og /;
			let docPath = "community/";
			if(!sandboxMode) {
				console.log(levelBrowserScene.currentLevel.path);
				docPath = levelBrowserScene.currentLevel.path + "/solutions/"; 
			} else if(user && user.displayName === "halait" && pre.test(nameIn)){
				docPath = "original/";
				nameIn = nameIn.replace(pre, "");
			}
			docPath += `{"author:"${user.displayName}","name":"${nameIn}"}`;
			try {
				if((await db.doc(docPath).get()).exists){
					this.saveInfoP.textContent = "You already used this name, choose a different name";
					return;
				}
				let docTags = null;
				if(this.tagInput.value){
					docTags = this.tagInput.value.split(" ");
				} else {
					docTags = [];
				}
				docTags.push(nameIn);
				docTags.push(user.displayName);
				for(let i = 0; i != 20; ++i){
					await db.doc(docPath).set({
						name: nameIn,
						author: user.displayName,
						authorId: user.uid,
						dateCreated: new Date(),
						rating: 0,
						plays: 0,
						tags: docTags,
						json: this.getJson()
					});
					sceneManager.popModal();
				}
			} catch(e) {
				console.error(e);
				exceptionScene.throw(e.message);
			}
			this.saveInfoP.textContent = "";
			this.nameInput.value = "";
		});
	}
}
saveScene.init();
