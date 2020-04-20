"use strict";
const modeScene = {
	ui: document.getElementById("mode-ui"),
	level: 0,
	start(level) {
		this.ui.style.display = "block";
		this.level = level;
	},
	suspend() {
		this.ui.style.display = "none";
	},
	init() {
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("click", e => {sceneManager.popModal();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("play-btn").addEventListener("click", () => {
			sceneManager.push(`/play/${stringToBase64(this.level.path)}`, this.level);
		});
		document.getElementById("edit-btn").addEventListener("click", () => {
			sceneManager.push(`/sandbox/${stringToBase64(this.level.path)}`, this.level);
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
	level: null,
	// do we really need level or just check if sandbox, solution if not sandbox mode
	start(level){
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
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("click", () => {sceneManager.popModal();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("save-form").addEventListener("submit", async (e) => {
			e.preventDefault();
			let nameIn = this.nameInput.value.trim();
			const pre = /^og /;
			let docPath = "community/";
			if(this.level) {
				console.log(this.level);
				docPath = this.level.path + "/solutions/";
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
				docTags.push(...nameIn.split(" "));
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
						solution: !sandboxMode,
						json: this.getJson()
					});
				}
				sceneManager.popModal();
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

const exceptionScene = {
	activeBtn: false,
	activeBtnElement: false,
	ui: document.getElementById("exceptionDiv"),
	messageP: document.getElementById("exceptionMessageP"),
	throw(message){
		this.messageP.textContent = message;
		sceneManager.pushModal(this);
	},
	start(){
		loadingScreen.style.display = "none";
		this.ui.style.display = "block";
	},
	suspend(){
		this.ui.style.display = "none";
	},

	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.popModal();});
		exceptionScene.ui.prepend(sceneCloseBtn);
	}
}
exceptionScene.init();

const loginScene = {
  ui: document.getElementById("loginUi"),
  start(){
    this.ui.style.display ="block";
  },
  suspend(){
    this.ui.style.display = "none";
  },
	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", (e) => {sceneManager.popModal();});
		this.ui.prepend(sceneCloseBtn);
		const passwordInput = document.getElementById("loginPassword");
		const emailInput = document.getElementById("loginEmail");
		const message = document.getElementById("loginMessage");
		passwordInput.addEventListener("input", () => {
			passwordInput.type = "password";
			message.textContent = "";
		});
		emailInput.addEventListener("input", () => {message.textContent = "";});
		document.getElementById("showPasswordBtn").addEventListener("pointerdown", () => {passwordInput.type = "text";});
		document.getElementById("register").addEventListener("pointerdown", () => {sceneManager.push(registerScene);});
		document.getElementById("loginForm").addEventListener("submit", (e) => {
			e.preventDefault();
			auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
				.then(() => {
					sceneManager.pop();
				})
				.catch((err) =>{
					console.error(err);
					const code = err.code;
					if(code == "auth/user-not-found" || code == "auth/wrong-password"){
						message.textContent = "Incorrect email or password";
					} else {
						exceptionScene.throw(err.message);
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
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("pointerdown", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
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
					exceptionScene.throw(err.message);
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
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		document.getElementById("logoutBtn").addEventListener("pointerdown", () => {
			firebase.auth().signOut();
			sceneManager.unfloat();
		});
	}
}
profileScene.init();

var successScene = {
	ui: document.getElementById("successSceneDiv"),
	nextLevelBtn: document.getElementById("next-level-btn"),
	incrementBtn: document.getElementById("increment-btn"),
	decrementBtn: document.getElementById("decrement-btn"),
	ratingDiv: document.getElementById("rating"),
	// only used once?
	saveSolutionBtn: document.getElementById("save-solution-btn"),
	level: null,
	nextLevel: null,
	start(level){
		if(!level) throw "Forgetaboutit";
		this.level = level;
		this.ratingDiv.textContent = level.rating;
		this.selectBtn(level.review.rating);
		this.nextLevel = routes["/listing"].getNextLevel(level);
		if(this.nextLevel){
			this.nextLevelBtn.style.display = "block";
		} else {
			this.nextLevelBtn.style.display = "none";
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
		batch.commit().catch((err) => {exceptionScene.throw(err.message);});
	},
	init(){
		const sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("click", () => {sceneManager.popModal();});
		successScene.ui.prepend(sceneCloseBtn);
		document.getElementById("exit-btn").addEventListener("pointerdown", () => {sceneManager.push("/");});
		this.incrementBtn.addEventListener("pointerdown", this.ratingHandler);
		this.decrementBtn.addEventListener("pointerdown", this.ratingHandler);
		this.nextLevelBtn.addEventListener("click", () => {sceneManager.push(`/play/${this.nextLevel.path}`, this.nextLevel);});	
		document.getElementById("browse-solutions-btn").addEventListener("click", () => {
			sceneManager.push(`/listing/${stringToBase64(this.level.path + "/solutions")}`);
		});
		this.saveSolutionBtn.addEventListener("click", () => {sceneManager.pushModal(saveScene, this.level);});
	}
}
successScene.init();