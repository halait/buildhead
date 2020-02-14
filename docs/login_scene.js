"use strict";
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
		sceneCloseBtn.addEventListener("mousedown", e => {sceneManager.unfloat();});
		this.ui.prepend(sceneCloseBtn);
		const form = document.getElementById("loginForm");
		const passwordInput = document.getElementById("loginPassword");
		const emailInput = document.getElementById("loginEmail");
		const message = document.getElementById("loginMessage");
		passwordInput.addEventListener("input", () => {
			passwordInput.type = "password";
			message.textContent = "";
		});
		emailInput.addEventListener("input", () => {message.textContent = "";});
		document.getElementById("showPasswordBtn").addEventListener("pointerdown", () => {passwordInput.type = "text";});
		document.getElementById("register").addEventListener("pointerdown", () => {sceneManager.float(registerScene);});
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
			.then(() => {
				sceneManager.unfloat();
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