"use strict";
const firebaseConfig = {
    apiKey: "AIzaSyDTOD6_luKLjRL6Fmf_Sp-ggBiA8TxfE1k",
    //authDomain: "js-physics-game.firebaseapp.com",
    //databaseURL: "https://js-physics-game.firebaseio.com",
    projectId: "js-physics-game",
    //storageBucket: "js-physics-game.appspot.com",
    //messagingSenderId: "476223998363",
    //appId: "1:476223998363:web:e61359887368da727cf93e",
    //measurementId: "G-64ED76LGVT"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
let user = null;
firebase.auth().onAuthStateChanged(changeUser);
function changeUser(currentUser) {
	user = currentUser;
	if(user) {
		menuScene.accountBtn.textContent = user.displayName;
		menuScene.accountBtn.onclick = () => {sceneManager.push(profileScene)};
	} else {
		menuScene.accountBtn.textContent = "Login";
		menuScene.accountBtn.onclick = () => {sceneManager.push(loginScene)};
	}
}

function computeAverage(arr){
	let sum = 0;
	const len = arr.length
	for(let i = 0, len = arr.length; i != len; ++i){
		sum += arr[i];
	}
	return sum / len;
}

function computeHash(str, salt){
	const max = 256;
	const len = str.length;
	const hash = new Uint8Array(max);
	let ai = 0;
	for(let i = 0; i != len; ++i, ai = i){
		if(ai == max) ai = 0;
		hash[ai] ^= salt[ai] ^ ((str.charCodeAt(i) << 1) | (str.charCodeAt(i) & 1));
	}
	for(; ai != max; ++ai){
		hash[ai] ^= salt[ai];
	}
	for(let r = 0, rounds = 20; r != rounds; ++r){
		for(let i = 0; i != max; ++i){
			hash[i] ^= hash[hash[i]] * hash[hash[i]];
		}
	}
	return hash;
}