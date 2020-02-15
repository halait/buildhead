"use strict";
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
		this.password0.type = "password";
		this.password1.type = "password";
		this.passwordMessage.textContent = "";
	},
	init(){
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("pointerdown", () => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		let form = document.getElementById("registerForm");
		this.password0.addEventListener("input", () => {this.hidePasswords();});
		this.password1.addEventListener("input", () => {this.hidePasswords();});
		document.getElementById("showPasswordsBtn").addEventListener("pointerdown", () => {
			this.password0.type = "text";
			this.password1.type = "text";
		});
		const usernameInput = document.getElementById("registerName");
		const usernameMessage = document.getElementById("registerNameMessage");
		const emailInput = document.getElementById("registerEmail");
		const emailMessage = document.getElementById("registerEmailMessage");
		emailInput.addEventListener("pointerdown", () => {emailMessage.textContent = ""});
		usernameInput.addEventListener("input", () => {usernameMessage.textContent = "";});
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const password = this.password0.value;
			if(password != this.password1.value){
				this.passwordMessage.textContent = "Both passwords must match, try agian";
				return;
			}
			const username = usernameInput.value.trim();
			console.log(username);
			const ref = db.collection("users").doc(username);
			const snap = await ref.get();
			if(snap && snap.exists){
				usernameMessage.textContent = "Username taken, choose a different username";
				return;
			}
			firebase.auth().createUserWithEmailAndPassword(emailInput.value, password)
				.then(() => {
					firebase.auth().currentUser.updateProfile({displayName: username}).then(() => {
						menuScene.profileBtn.textContent = username;
					});
					db.collection("users").doc(users.uid).set({
						displayName: username,
						emailAdress: emailInput.value,
						dateRegistered: new Date(),
						id: usernameMessage.uid,
					});
					sceneManager.unfloat();
				})
				.catch((err) => {
					console.error(err);
					const code = err.code;
					if(code == "auth/email-already-in-use"){
						emailMessage.textContent = "Email address taken, choose a different address";
					} else if(code == "auth/invalid-email"){
						emailMessage.textContent = "Email address incorrectly formatted";
					} else {
						exceptionScene.throw(err.message);
					}
				});
			/*
			fetch("https://us-central1-js-physics-game.cloudfunctions.net/handleNewUser", {
				method: "POST",
				body: `{"username":${username},"password":${password}}`
			});
			*/
		});
		

	}
}
registerScene.init();