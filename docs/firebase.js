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
let user = null;
firebase.auth().onAuthStateChanged(changeUser);

function changeUser(currentUser) {
	console.log(currentUser);
	if(currentUser) {
		user = currentUser;
		menuScene.accountBtn.textContent = user.displayName;
		menuScene.accountBtn.onclick = () => {sceneManager.float(profileScene)};
	} else {
		user = null;
		menuScene.accountBtn.textContent = "Login";
		menuScene.accountBtn.onclick = () => {sceneManager.float(loginScene)};
	}
}

const db = firebase.firestore();
/*
db.collection("levels").add({
    author: "P H",
    name: "proto",
    like: 0,
		dislike: 0,
		date: new Date(),
		level: `[{"JSON_LevelFile":true},{"form":2,"type":0,"vertices":[[-1.6608811748998664,-0.8104138851802403],[-0.6408544726301735,-0.05206942590120156]],"userFloats":[0,0.875,0.232,0.875,0.232],"id":7},{"form":2,"type":0,"vertices":[[0.718291054739653,0.044058744993324406],[1.5700934579439254,0.7222963951935915]],"userFloats":[0,0.875,0.161,0.875,0.161],"id":8},{"type":0,"group":0,"userFloats":[0,0.625,0.767,0.625,0.767],"form":0,"width":0.5,"vertices":[[-2.2253480831584964,-1.055931718481785],[-0.6265496852946781,-1.0564085447263016]]},{"type":0,"group":0,"userFloats":[0,0.625,0.767,0.625,0.767],"form":0,"width":0.5,"vertices":[[-0.5569330535952697,-1.0471104329582286],[0.6484836925424379,-0.18882319282853235]]},{"type":0,"group":0,"userFloats":[0,0.625,0.767,0.625,0.767],"form":0,"width":0.5,"vertices":[[0.6484836925424379,-0.18882319282853235],[2.063703986267404,-0.18882319282853235]]},{"type":1,"group":1,"userFloats":[1,0,0.75,0.25,1],"density":30,"target":1,"form":1,"radius":0.2,"x":-1.1443829868395952,"y":-0.4152202937249653}]`
})
.then((ref) => {
    console.log("Written id: " + ref.id)
})
.catch((err) => {
    console.error("Error writing document: ", err);
});
*/
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