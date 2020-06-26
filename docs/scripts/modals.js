"use strict";
const modeScene = {
	ui: document.getElementById("mode-ui"),
	deleteBtn: document.getElementById("delete-btn"),
	level: null,
	start(level) {
		if(!level){
			throw "Unable to start without level";
		}
		this.ui.style.display = "block";
		this.level = level;
		if(user && user.uid == level.authorId){
			this.deleteBtn.style.display = "block";
		} else {
			this.deleteBtn.style.display = "none";
		}
	},
	suspend() {
		this.ui.style.display = "none";
	},
	init() {
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		document.getElementById("play-btn").addEventListener("click", () => {
			sceneManager.push("/play/" + this.level.path);
		});
		document.getElementById("edit-btn").addEventListener("click", () => {
			sceneManager.push("/sandbox/" + this.level.path);
		});
		this.deleteBtn.addEventListener("pointerdown", async () => {
			sceneManager.popModal();
			loadingScreen.style.display = "flex";
			const batch = db.batch();
			batch.delete(db.doc(this.level.path));
			if(!this.level.solution){
				const solutionPath = this.level.path + "/solutions";
				const solutions = (await db.collection(solutionPath).get()).docs;
				const len = solutions.length;
				if(len > 498) {
					sceneManager.pushModal(messageScene, "Error", "Unable to delete. Contact developer by leaving feedback for more information.");
					throw "Too many solutions for batched write";
				}
				for(let i = 0; i != len; ++i){
					batch.delete(db.doc(solutionPath + "/" + solutions[i].id));
				}
			}
			try {
				await batch.commit()
			} catch(e) {
				sceneManager.pushModal(messageScene, "Error", "Unable to delete. Contact developer by leaving feedback for more information.");
				throw e;
			}
			console.log("delete successful");
			if(sceneManager.current != routes["/listing"]) {
				console.error("Incorrect context for deleting level");
			} else {
				routes["/listing"].forceRefreshFlag = true;
				sceneManager.push(location.pathname + location.search);
				/*
				const index = routes["/listing"].items.indexOf(this.level);
				if(index != -1){
					routes["/listing"].items.splice(index, 1);
					routes["/listing"].browserContent.innerHTML = "";
					routes["/listing"].populate(routes["/listing"].items);
				} else {
					console.error( "Level not in listing");
				}
				*/
			}
			loadingScreen.style.display = "none";
		});
	}
}
modeScene.init();

const saveScene = {
	ui: document.getElementById("save-ui"),
	saveInfoP: document.getElementById("save-info-p"),
	nameInput: document.getElementById('name-input'),
	tagInput: document.getElementById("tag-input"),
	header: document.getElementById("save-header"),
	level: null,
	// need level or just check if sandbox? solution if not sandbox mode
	start(level){
		if(!user){
			sceneManager.popModal();
			sceneManager.pushModal(loginScene);
			return;
		}
		if(!isPlayable()){
			sceneManager.popModal();
			sceneManager.pushModal(messageScene, "Error", 
				`Unable to save level because it is not playable, to be playable the level must have one assesmbly 
				area (blue box), one goal area (orange box) and one or more targets (orange objects, usually circle).`
			);
			return;
		}
		if(level){
			this.header.textContent = "Save Solution";
		} else {
			this.header.textContent = "Save Level";
		}
		this.level = level;
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	getJson(){
		let json = '[{"JSON_LevelFile":true}';
		for(const o of gameObjects){
			json += "," + o.toJson();
		}
		for(const j of joints){
			json += "," + j.toJson();
		}
		json += "]";
		return json;
	},
	init(){
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		document.getElementById("save-form").addEventListener("submit", async (e) => {
			e.preventDefault();
			loadingScreen.style.display = "flex";
			let nameIn = this.nameInput.value.trim();
			const pre = /^og /;
			let docPath = null;
			if(this.level) {
				docPath = this.level.path + "/solutions/" + this.level.id + stringToBase64(` sa="${user.displayName}",sn="${nameIn}"`);
			} else {
				if(user && user.displayName === "halait" && pre.test(nameIn)){
					docPath = "original/";
					nameIn = nameIn.replace(pre, "");
				} else {
					docPath = "community/"
				}
				docPath += stringToBase64(`la="${user.displayName}",ln="${nameIn}"`);
			}
			try {
				if((await db.doc(docPath).get()).exists){
					this.saveInfoP.textContent = "You already used this name, choose a different name";
					return;
				}
				let tagStr = user.displayName;
				tagStr += " " + nameIn;
				tagStr += " " + this.tagInput.value;
				tagStr = tagStr.trim();
				tagStr = tagStr.toLowerCase();
				tagStr = tokenize(tagStr);
				await db.doc(docPath).set({
					name: nameIn,
					author: user.displayName,
					authorId: user.uid,
					dateCreated: new Date(),
					rating: 0,
					plays: 0,
					tags: tagStr,
					solution: !sandboxMode,
					json: this.getJson()
				});
				sceneManager.popModal();
			} catch(e) {
				console.error(e);
				sceneManager.pushModal(messageScene, "Error", e.message);
			}
			this.saveInfoP.textContent = "";
			this.nameInput.value = "";
			routes["/listing"].forceRefreshFlag = true;
			loadingScreen.style.display = "none";
		});
	}
}
saveScene.init();
/*
const loadLevelScene = {
	messageP: document.getElementById("loadMessageP"),
	fileInput: document.getElementById("level-input"),
	activeBtn: false,
	activeBtnElement: false,
	ui: document.getElementById("loadLevelUI"),
	isModal: true,
	backScene: false,
	reader: new FileReader(),

	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	load(defs){
		for(let i = 1, len = defs.length; i < len; ++i){
			if(create(defs[i]) === null) {
				sceneManager.pushModal(messageScene, "Error", 
					`This level file is corrupted and cannot be loaded. Try another level file or please 
					consider sending feedback to have the issue solved, it will be apreciated.`
				);
				throw "Invalid object definition"
			}
		}
		canvas.style.cursor = "crosshair";
		pw.render();
	},

	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		this.fileInput.addEventListener('change', function(){
			if(loadLevelScene.fileInput.files[0].type != "application/json"){
				loadLevelScene.messageP.textContent = "";
				loadLevelScene.fileInput.value = "";
				sceneManager.pushModal(messageScene, "Error", "Cannot load this file type, level file must be of type JSON.");
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
				sceneManager.pushModal(messageScene, "Error", 
					"This level file is corrupted and cannot be loaded. Try another level file or please consider sending feedback to have the issue solved, it will be apreciated."
				);
				console.error(err);
				return false;
			}
			if(!defs[0].JSON_LevelFile){
				sceneManager.pushModal(messageScene, "Error", "Cannot load this level because it's missing the required level file signature, probably because it's not a level file.");
				return false;
			}
			loadLevelScene.load(defs);
		}
	}
}
loadLevelScene.init();
*/

const messageScene = {
	ui: document.getElementById("message-div"),
	header: document.getElementById("message-header"),
	message: document.getElementById("message"),
	btn: document.getElementById("message-btn"),
	start(header, message, btn = "Okay"){
		this.header.textContent = header;
		this.message.textContent = message;
		this.btn.textContent = btn;
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	init(){
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		this.btn.addEventListener("click", () => {sceneManager.popModal();});
	}
}
messageScene.init();

const loginScene = {
  ui: document.getElementById("loginUi"),
  start(){
    this.ui.style.display ="block";
  },
  suspend(){
    this.ui.style.display = "none";
  },
	init(){
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		const passwordInput = document.getElementById("loginPassword");
		const emailInput = document.getElementById("loginEmail");
		const message = document.getElementById("loginMessage");
		passwordInput.addEventListener("input", () => {
			passwordInput.type = "password";
			message.textContent = "";
		});
		emailInput.addEventListener("input", () => {message.textContent = "";});
		document.getElementById("showPasswordBtn").addEventListener("pointerdown", () => {passwordInput.type = "text";});
		document.getElementById("registerBtn").addEventListener("pointerdown", () => {sceneManager.pushModal(registerScene);});
		document.getElementById("loginForm").addEventListener("submit", (e) => {
			e.preventDefault();
			auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
				.then(() => {
					sceneManager.popModal();
				})
				.catch((err) =>{
					console.error(err);
					const code = err.code;
					if(code == "auth/user-not-found" || code == "auth/wrong-password"){
						message.textContent = "Incorrect email or password";
					} else {
						sceneManager.pushModal(messageScene, "Error", err.message);
					}
				});
		});
	}
}
loginScene.init();

const registerScene = {
  ui: document.getElementById("registerUi"),
  start(){
    this.ui.style.display ="block";
  },
  suspend(){
    this.ui.style.display = "none";
	},
	passwordMessage: document.getElementById("registerPasswordMessage"),
	password0: document.getElementById("registerPassword0"),
	password1: document.getElementById("registerPassword1"),
	hidePasswords(){
		registerScene.password0.type = "password";
		registerScene.password1.type = "password";
		registerScene.passwordMessage.textContent = "";
	},
	init(){
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		let form = document.getElementById("registerForm");
		this.password0.addEventListener("input", this.hidePasswords);
		this.password1.addEventListener("input", this.hidePasswords);
		document.getElementById("showPasswordsBtn").addEventListener("pointerdown", () => {
			this.password0.type = "text";
			this.password1.type = "text";
		});
		const usernameInput = document.getElementById("registerName");
		const usernameMessage = document.getElementById("registerNameMessage");
		const emailInput = document.getElementById("registerEmail");
		const emailMessage = document.getElementById("registerEmailMessage");
		emailInput.addEventListener("input", () => {emailMessage.textContent = "";});
		usernameInput.addEventListener("input", () => {usernameMessage.textContent = "";});

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			loadingScreen.style.display = "flex";
			const password = this.password0.value;
			if(password != this.password1.value){
				this.passwordMessage.textContent = "Both passwords must match, try agian";
				loadingScreen.style.display = "none";
				return;
			}
			const desiredUsername = usernameInput.value.trim();
			console.log(desiredUsername);
			const exists = await (await fetch("https://us-central1-js-physics-game.cloudfunctions.net/userExists?username=" + desiredUsername)).text();
			console.log(exists);
			if(exists){
				usernameMessage.textContent = "Username taken, choose a different username";
				loadingScreen.style.display = "none";
				return;
			}
			try {
				await auth.createUserWithEmailAndPassword(emailInput.value, password);
				await auth.currentUser.updateProfile({displayName: desiredUsername});
				await db.collection("users").doc(user.uid).set({username: user.displayName});
				sceneManager.unfloat();
			} catch(err) {
				console.error(err);
				const code = err.code;
				if(code == "auth/email-already-in-use"){
					emailMessage.textContent = "Email address taken, choose a different address";
				} else if(code == "auth/invalid-email"){
					emailMessage.textContent = "Email address incorrectly formatted";
				} else {
					sceneManager.pushModal(messageScene, "Error", err.message);
				}
				if(user){
					db.collection("users").doc(user.uid).delete().catch();
					user.delete().catch();
				}
			}
			loadingScreen.style.display = "none";
		});
	}
}
registerScene.init();

const profileScene = {
	start(){
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	ui: document.getElementById("profileUi"),
	init(){
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		document.getElementById("logoutBtn").addEventListener("click", () => {
			firebase.auth().signOut();
			sceneManager.popModal();
		});
	}
}
profileScene.init();

const successScene = {
	ui: document.getElementById("successSceneDiv"),
	incrementBtn: document.getElementById("increment-btn"),
	decrementBtn: document.getElementById("decrement-btn"),
	ratingDiv: document.getElementById("rating"),
	// only used once?
	saveSolutionBtn: document.getElementById("save-solution-btn"),
	browseSolutionBtn: document.getElementById("browse-solutions-btn"),
	solutionBtns: document.getElementById("solution-btns"),
	level: null,
	start(level){
		if(!level) throw "Forgetaboutit";
		this.level = level;
		this.ratingDiv.textContent = level.rating;
		if(user){
			this.selectBtn(level.review.rating);
		}
		if(this.level.solution){
			this.solutionBtns.style.display = "none";
		} else {
			this.solutionBtns.style.display = "inline";
		} 
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	selectBtn(rating){
		if(rating){
			if(rating > 0) {
				this.incrementBtn.classList.add("activeBtn");
				this.decrementBtn.classList.remove("activeBtn");
			} else {
				this.incrementBtn.classList.remove("activeBtn");
				this.decrementBtn.classList.add("activeBtn");
			}
		} else {
			this.incrementBtn.classList.remove("activeBtn");
			this.decrementBtn.classList.remove("activeBtn");
		}
	},
	ratingHandler(e){
		if(!user){
			sceneManager.pushModal(loginScene);
			return;
		}
		let newRating = 0;
		if(e.currentTarget == successScene.incrementBtn){
			newRating = 1;
		} else if(e.currentTarget == successScene.decrementBtn) {
			newRating = -1;
		}
		if(successScene.level.review && successScene.level.review.rating == newRating){
			newRating = 0;
		}
		let ratingDelta = newRating - successScene.level.review.rating;
		if(ratingDelta > 2 || ratingDelta < -2) throw "ratingDelta > 2 || ratingDelta < -2";
		successScene.level.rating += ratingDelta;
		successScene.level.review.rating = newRating;
		successScene.ratingDiv.textContent = successScene.level.rating;
		successScene.selectBtn(newRating);
		const batch = db.batch();
		batch.set(db.collection("users").doc(user.uid).collection("reviews").doc(successScene.level.id), {
			rating: newRating
		}, {merge: true});
		batch.update(db.doc(successScene.level.path), {
			rating: firebase.firestore.FieldValue.increment(ratingDelta)
		});
		batch.commit().catch((err) => {sceneManager.pushModal(messageScene, "Error", err.message);});
	},
	init(){
		this.ui.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
		document.getElementById("main-menu-btn").addEventListener("click", () => {sceneManager.push("/");});
		this.incrementBtn.addEventListener("click", this.ratingHandler);
		this.decrementBtn.addEventListener("click", this.ratingHandler);
		document.getElementById("go-back-btn").addEventListener("click", () => {history.go(-1)});
		this.browseSolutionBtn.addEventListener("click", () => {
			sceneManager.push("/listing/" + this.level.path + "/solutions");
		});
		this.saveSolutionBtn.addEventListener("click", () => {
			if(!user){
				sceneManager.pushModal(loginScene);
				return;
			}
			sceneManager.pushModal(saveScene, this.level);
		});
	}
}
successScene.init();

const tutorialScene = {
	ui: document.getElementById("tutorialUi"),
	img: document.getElementById("tutorialImg"),
	loadingMsg: document.getElementById("tutImgLoadingMsg"),
	eventIndex: -1,
	start(){
		this.img.style.display = "none";
		this.loadingMsg.style.display = "block";
		this.removeCurrentEventListener();
		++this.eventIndex;
		this.events[this.eventIndex].target.addEventListener(this.events[this.eventIndex].type, this.events[this.eventIndex].callback);
		this.img.src = "/images/" + this.eventIndex + "tut.png";
		this.ui.style.display = "block";
	},
	suspend(){
		tutorialScene.removeCurrentEventListener();
		this.eventIndex = -1;
		this.ui.style.display = "none";
	},
	removeCurrentEventListener(){
		if(this.eventIndex != -1) {
			this.events[this.eventIndex].target.removeEventListener(this.events[this.eventIndex].type, this.events[this.eventIndex].callback);
			console.log("current evtlist remooved");
		}
	},
	events: [
		{
			target: routes["/play"].toolbar.querySelector(".startSimulationBtn"),
			type: "mousedown",
			callback() {
				tutorialScene.start();
			}
		},
		{
			target: simulationManager.toolbar.querySelector(".stopSimulationBtn"),
			type: "mousedown",
			callback() {
				tutorialScene.start();
			}
		},
		


		{
			target: routes["/play"].toolbar.querySelector(".removeBtn"),
			type: "mousedown",
			callback() {
				tutorialScene.start();
			}
		},

		{
			target: canvas,
			type: "mouseup",
			callback() {
				if(gameObjects.length == 7){
					tutorialScene.start();
				}
			}
		},
		{
			target: routes["/play"].toolbar.querySelector(".moveBtn"),
			type: "mousedown",
			callback() {
				tutorialScene.start();
			}
		},
		{
			target: canvas,
			type: "mouseup",
			callback() {
				if(pw.getPosition(targets[0].ref)[1] < -0.229612818){
					tutorialScene.start();
				}
			}
		},
		{
			target: routes["/play"].toolbar.querySelector(".cwWheelCreatorBtn"),
			type: "mousedown",
			callback() {
				tutorialScene.start();
			}
		},
		{
			target: canvas,
			type: "mouseup",
			callback() {
				let last = gameObjects.length - 1;
				if(gameObjects[last].def.form == pw.CIRCLE_FORM && gameObjects[last].def.motorVelocity < 0){
					tutorialScene.start();
				}
			}
		},
		{
			target: routes["/play"].toolbar.querySelector(".nRodCreatorBtn"),
			type: "mousedown",
			callback() {
				tutorialScene.start();
			}
		},
		{
			target: canvas,
			type: "mouseup",
			callback() {
				let last = gameObjects[gameObjects.length - 1];
				if(last.def.form == pw.PLANE_FORM && last.joints.length == 2){
					let j0 = last.joints[0];
					let j1 = last.joints[1];
					if(j0.gameObjectA != j1.gameObjectA && (j0.gameObjectA.def.target || j1.gameObjectA.def.target) && j0.def.va == 0 && j1.def.va == 0){
						tutorialScene.start();
					}
				}
			}
		},
		{
			target: routes["/play"].toolbar.querySelector(".startSimulationBtn"),
			type: "mousedown",
			callback() {
				sceneManager.popModal();
			}
		},
	],
	shrinkBtn: document.getElementById("tutorialShrinkBtn"),
	showBtn: document.getElementById("tutorialShowBtn"),
	hideImg(){
		this.img.style.display = "none";
		this.shrinkBtn.style.display = "none";
		this.showBtn.style.display = "inline-block";
	},
	showImg(){
		this.img.style.display = "block";
		this.shrinkBtn.style.display = "inline-block";
		this.showBtn.style.display = "none";
	},
	init(){
		this.shrinkBtn.addEventListener("click", () => {this.hideImg();});
		this.showBtn.addEventListener("click", () => {this.showImg();});
		this.img.onload = () => {
			this.showImg();
			this.loadingMsg.style.display = "none";
		};
	}
};
tutorialScene.init();

const createCustomScene = {
	planeUi: document.getElementById("setCustomObroundPopup"),
	circleUi: document.getElementById("setCustomCirclePopup"),
	ui: null,
	start(form){
		if(form === pw.CIRCLE_FORM) this.ui = this.circleUi;
		else this.ui = this.planeUi;
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},
	
	setCustomProperties(form){
		let def = {
			type: pw.FIXED_TYPE,
			group: FIXED_GROUP,
			userFloats: [NON_JOINABLE],
		};
		if(form.movableType.checked) {
			def.type = pw.MOVABLE_TYPE;
			def.density = 30.0;
			if(form.coplanarGroup.checked) {
				def.group = COPLANAR_GROUP;
				if(form.target.checked) def.target = 1;
			}
			else def.group = NON_COPLANAR_GROUP;
		}
		if(form.density.value) def.density = parseFloat(form.density.value);
		if(form.staticFriction.value) def.staticFriction = parseFloat(form.staticFriction.value);
		if(form.kineticFriction.value) def.kineticFriction = parseFloat(form.kineticFriction.value);
		if(form.linearVelocityResistance.value) def.linearVelocityResistance = parseFloat(form.linearVelocityResistance.value);
		if(form.rotationalVelocityResistance.value) def.rotationalVelocityResistance = parseFloat(form.rotationalVelocityResistance.value);
		if(form.joinable.checked) def.userFloats[0] = JOINABLE;
		return def;
	},

	createForm(formElement){
		return {
			movableType: formElement.querySelector(".movableType"),
			coplanarGroup: formElement.querySelector(".coplanarGroup"),
			target: formElement.querySelector(".target"),
			density: formElement.querySelector(".density"),
			staticFriction: formElement.querySelector(".staticFriction"),
			kineticFriction: formElement.querySelector(".kineticFriction"),
			linearVelocityResistance: formElement.querySelector(".linearResistance"),
			rotationalVelocityResistance: formElement.querySelector(".rotationalResistance"),
			joinable: formElement.querySelector(".joinable")
		}
	},

	addFormEvents(formElement){
		let customGroup = formElement.querySelector(".customGroup");
		let customTarget = formElement.querySelector(".customTarget");
		let coplanarGroup = formElement.querySelector(".coplanarGroup");
		formElement.querySelector(".movableType").oninput = () => {
			customGroup.style.display = "block";
			if(coplanarGroup.checked) customTarget.style.display = "block";
		}
		formElement.querySelector(".fixedType").oninput = () => {
			customGroup.style.display = "none";
			customTarget.style.display = "none";
		}
		coplanarGroup.oninput = () => {customTarget.style.display = "block";}
		formElement.querySelector(".nonCoplanarGroup").oninput = () => {customTarget.style.display = "none";}
	},

	planeForm: null,
	circleForm: null,

	getObroundDef(){
		let def = this.setCustomProperties(this.planeForm);
		def.form = pw.PLANE_FORM;
		if(this.planeForm.width.value) def.width = parseFloat(this.planeForm.width.value);
		else def.width = 0.05;
		if(def.group == FIXED_GROUP){
			def.userFloats.push(...texs.green);
		} else if(def.group == COPLANAR_GROUP) {
			if(def.target){
				def.userFloats.push(...texs.darkOrange);
			} else {
				def.userFloats.push(...texs.gray);
			}
		} else if(def.group == NON_COPLANAR_GROUP) {
			def.userFloats.push(...texs.aqua);
		} else {
			console.error("Unhandled texture");
		}
		return def;
	},

	getCircleDef(){
		let def = this.setCustomProperties(this.circleForm);
		def.form = pw.CIRCLE_FORM;
		if(this.circleForm.radius.value) def.radius = parseFloat(this.circleForm.radius.value);
		else def.radius = 0.1;
		if(!def.target && this.circleForm.motorSpeed.value && this.circleForm.maxMotorTorque.value){
			def.motorVelocity = -this.circleForm.motorSpeed.value;
			def.maxMotorTorque = this.circleForm.maxMotorTorque.value;
			def.motorJoinable = true;
		}
		if(def.motorVelocity < 0){
			def.userFloats.push(...texs.cwWheel);
		} else if(def.motorVelocity > 0) {
			def.userFloats.push(...texs.ccwWheel);
		} else if(def.target){
			def.userFloats.push(...texs.tWheel);
		} else {
			def.userFloats.push(...texs.nWheel);
		}
		if(def.group == FIXED_GROUP){
			def.userFloats[1] = 0.5;
			def.userFloats[3] = 0.75;
			if(!def.motorVelocity){
				def.userFloats[3] = 1.0;
				def.userFloats[4] = 1.0;
			}
		} else if(def.group == NON_COPLANAR_GROUP) {
			def.userFloats[1] = 0.25;
			def.userFloats[3] = 0.5;
		} else if(def.group != COPLANAR_GROUP){
			console.error("assigning texture coordinates failed");
		}
		return def;
	},

	init() {
		let formElement = this.planeUi.querySelector(".customProperties");
		this.planeForm = this.createForm(formElement);
		this.planeForm.width = formElement.querySelector("#width");
		this.addFormEvents(formElement);
		formElement.onsubmit = (e) => {
			e.preventDefault();
			sceneManager.popModal();
		};
		this.planeUi.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});


		formElement = this.circleUi.querySelector(".customProperties");
		this.circleForm = this.createForm(formElement);
		this.circleForm.radius = formElement.querySelector("#radius");
		this.circleForm.motorSpeed = formElement.querySelector("#motorSpeed");
		this.circleForm.maxMotorTorque = formElement.querySelector("#maxMotorTorque");
		this.addFormEvents(formElement);
		formElement.onsubmit = (e) => {
			e.preventDefault();
			sceneManager.popModal();
		};
		this.circleUi.querySelector(".closeBtn").addEventListener("pointerdown", function(){sceneManager.popModal();});
	}
}
createCustomScene.init();
/*
const createPolygonScene = {
	vertices: null,
	eventHandler: {
		cv: 0,
		handleActivePress(){
			let len = tempPolygon.length;
			for(let v = 0, len = tempPolygon.length; v < len; ++v){
				if(Math.abs(tempPolygon[v][0] - canvasEventManager.mx) < MAX_SNAP_DIST && Math.abs(tempPolygon[v][1] - canvasEventManager.my) < MAX_SNAP_DIST){
					this.cv = v;
					return;
				}			
			}
			tempPolygon.push([canvasEventManager.mx, canvasEventManager.my]);
			this.cv = len;
			pw.render();
		},
		handleActiveDrag(){
			tempPolygon[this.cv][0] = canvasEventManager.mx;
			tempPolygon[this.cv][1] = canvasEventManager.my;
			pw.render();
		},
		handleActiveMouseup(){
			
		},
	},
	activeBtn: false,
	toolbar: document.getElementById("createPolygonToolbar"),
	ui: document.getElementById("createPolygonPopup"),

	start(){
		this.toolbar.style.display = "flex";
		this.ui.style.display = "block";
		//pw.render();
	},
	suspend(){
		this.toolbar.style.display = "none";
		this.ui.style.display = "none";
		tempPolygon.splice();
	},

	init(){
		let formElement = createCustomScene.customPropertiesForm.cloneNode(true);
		let polygonForm = createCustomScene.createForm(formElement);
		let polygonDef = null;
		createCustomScene.addFormEvents(formElement);
		formElement.onsubmit = (e) => {
			e.preventDefault();
			polygonDef = createCustomScene.setCustomProperties(polygonForm);
			polygonDef.form = pw.POLYGON_FORM;
			polygonDef.vertices = tempPolygon;
			if(polygonDef.group == FIXED_GROUP){
				polygonDef.userFloats = polygonDef.userFloats.concat(GREEN_TC);
			} else if(polygonDef.group == COPLANAR_GROUP) {
				if(polygonDef.target){
					polygonDef.userFloats = polygonDef.userFloats.concat(DARK_ORANGE_TC);
				} else {
					polygonDef.userFloats = polygonDef.userFloats.concat(GRAY_TC);
				}
			} else if(polygonDef.group == NON_COPLANAR_GROUP) {
				polygonDef.userFloats = polygonDef.userFloats.concat(AQUA_TC);
			} else {
				console.error("Unhandled texture");
			}
			this.ui.style.display = "none";
			return false;
		};
		this.ui.appendChild(formElement);

		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);

		document.getElementById("polygonDoneBtn").addEventListener("mousedown", () => {
			new Polygon(polygonDef);
			sceneManager.pop();

		/*
			new Polygon({
				form: pw.POLYGON_FORM,
				type: pw.MOVABLE_TYPE,
				vertices: tempPolygon,
				group: COPLANAR_GROUP,
				density: DEFAULT_WHEEL_DENSITY,
				userFloats: [NON_JOINABLE, ...GREEN_TC],
			});
			sceneManager.pop();
			*//*
		});
		addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
		/*
		this.ui.querySelector("#customPolygonForm").onsubmit = (e) => {
			e.preventDefault();
		};
		*//*
	}
}
createPolygonScene.init();
*/