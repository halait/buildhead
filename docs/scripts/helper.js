"use strict";
/* TODO
	- implement joints for polygon
	- perhaps encapsulate all game logic
*/
var assemblyField = false;
var goalField = false;
// constants
const MAX_SNAP_DIST = 0.025;

const DEFAULT_ROD_WIDTH = 0.02;
const DEFAULT_ROD_DENSITY = 20.0;
const MIN_ROD_LENGTH = 0.1;

const DEFAULT_WHEEL_RADIUS = 0.1;
const DEFAULT_WHEEL_DENSITY = 1.0 / (Math.PI * DEFAULT_WHEEL_RADIUS * DEFAULT_WHEEL_RADIUS);

pw.JOINABLE_RADIUS = DEFAULT_ROD_WIDTH * 0.5;

// identifiers/color-indices to be stored in userFloats
const CCW_WHEEL_ID = 0;
const N_WHEEL_ID = 1;
const CW_WHEEL_ID = 2;

const TARGET_ID = 3;

const G_ROD_ID = 4;
const C_ROD_ID = 5;
const N_ROD_ID = 6;

/*
// distance from center of wheel to outer joinables
const WHEEL_OUTER_JOINABLES_DIST = DEFAULT_WHEEL_RADIUS - JOINABLE_RADIUS;
// local position of wheel joinables
const WHEEL_JOINABLES = [
	[0.0, 0.0],
	[WHEEL_OUTER_JOINABLES_DIST, 0.0],
	[WHEEL_OUTER_JOINABLES_DIST * Math.cos(Math.PI * 2.0 / 3.0), WHEEL_OUTER_JOINABLES_DIST * Math.sin(Math.PI * 2.0 / 3.0)],
	[WHEEL_OUTER_JOINABLES_DIST * Math.cos(Math.PI * 4.0 / 3.0), WHEEL_OUTER_JOINABLES_DIST * Math.sin(Math.PI * 4.0 / 3.0)]
];
const WHEEL_JOINABLES_LENGTH = WHEEL_JOINABLES.length;
*/

// fields (areas in physics library) identifiers/color-indices
//const ASSEMBLY_FIELD_ID = 0;
const ASSEMBLY_FIELD_ID = 7;
const GOAL_FIELD_ID = 8;
const FIELD_COLORS = [[0.0, 0.5, 1.0, 1.0], [1.0, 0.5, 0.0, 1.0]];

const DEFAULT_MOTOR_VELOCITY = 0.08;
//const DEFAULT_MAX_MOTOR_TORQUE = 0.0016;
const DEFAULT_MAX_MOTOR_TORQUE = 0.001;

// group definitions to set up collision constraints
const FIXED_GROUP = 0;
const COPLANAR_GROUP = 1;
const NON_COPLANAR_GROUP = 2;

const GROUP_CONTACTS = [[COPLANAR_GROUP, NON_COPLANAR_GROUP], [FIXED_GROUP, COPLANAR_GROUP], [FIXED_GROUP]];

const H_IS_JOINABLE = 0;
const H_R = 1;
const H_G = 2;
const H_B = 3;


const NON_JOINABLE = 0;
const JOINABLE = 1;
//const MAX_JOINS = 15;

const gameObjects = [];
const targets = [];
class GameObject {
	constructor(def){
		let len = def.userFloats.length;
		if(len !== 5) console.error("len: " + len);
		this.ref = pw.create(def);
		this.def = def;
		if(def.group !== undefined) pw.createContacts(this.ref, GROUP_CONTACTS[def.group]);
		this.joints = [];
		this.connectedObjects = [];
		//this.originX = 0.0;
		//this.originY = 0.0;
		this.levelObject = sandboxMode;
		gameObjects.push(this);
		if(def.target) targets.push(this);
		//pw.render();
	}

	destroy(){
		pw.destroy(this.ref);
		let i = gameObjects.indexOf(this);
		if(i > -1) gameObjects.splice(i, 1);
		else console.error("Cannot splice gameObject from gameObjects array at index: " + i);
		for(let i = this.joints.length - 1; i > -1; --i){
			this.joints[i].destroy();
		}
		console.log("gameObjects.length: " + gameObjects.length);
	}

	isLegalPosition(){
		if(sandboxMode) return true;
		if(!pw.isWithinAABB(assemblyField.ref, this.ref)) return false;
		let group = pw.getGroup(this.ref);
		for(const o of gameObjects){
			if(o != this && !this.connectedObjects.includes(o) && GROUP_CONTACTS[group].includes(pw.getGroup(o.ref)) && pw.isPenetrating(this.ref, o.ref)){
				return false;
			}
		}
		return true;
	}

	setFinalProperties(){

	}
}

class Circle extends GameObject{
	constructor(def){
		super(def);
		this.originX = def.x;
		this.originY = def.y;
		//if(!this.isLegalPosition()) canvas.style.cursor = "no-drop";
	}

	setPosition(x, y, join){
		if(this.def.userFloats[H_IS_JOINABLE] && join){
			this.connectedObjects.splice(0);
			let joinables = getHandlesNear(x, y, this);
			if(joinables.length){
				x = joinables[0].x;
				y = joinables[0].y;
				for(const j of joinables){
					this.connectedObjects.push(j.gameObject);
				}
			}
		}
		pw.setPosition(this.ref, x, y);
		if(!this.isLegalPosition()) {
			canvas.style.cursor = "no-drop";
			return false;
		}
		canvas.style.cursor = "crosshair";
		return true;
	}

	setFinalProperties(join){
		if(!sandboxMode && !this.isLegalPosition()) {
			this.destroy();
			return false;
		}
		let p = pw.getPosition(this.ref);
		this.def.x = p[0];
		this.def.y = p[1];
		this.originX = p[0];
		this.originY = p[1];
		if(join && this.def.userFloats[H_IS_JOINABLE]){
			this.connectedObjects.splice(0);
			for(const j of getHandlesNear(p[0], p[1], this)){
				let jointDef = {
					form: pw.REVOLUTE_FORM,
					type: pw.JOINT_TYPE,
					gameObjectA: this,
					gameObjectB: j.gameObject,
					va: 0,
					vb: j.vertex,
					x: j.x,
					y: j.y
				}
				if(this.def.motorJoinable){
					this.def.motorJoinable = false;
					jointDef.motorVelocity = this.def.motorVelocity;
					jointDef.maxMotorTorque = this.def.maxMotorTorque;
				}
				create(jointDef);
			}
		}
		return true;
	}

	toJson(){
		//let p = pw.getPosition(this.ref);
		//this.def.x = p[0];
		//this.def.y = p[1];
		return JSON.stringify(this.def);
	}
}

class Obround extends GameObject {
	constructor(def){
		let dx = def.vertices[0][0] - def.vertices[1][0];
		let dy = def.vertices[0][1] - def.vertices[1][1];
		if(Math.sqrt(dx * dx + dy * dy) < pw.MIN_PLANE_LEN){
			def.vertices[1][0] = def.vertices[0][0] + pw.MIN_PLANE_LEN * 1.01;
		}
		super(def);
		this.vertex0ConnectedObjectsEnd = 0;
		if(def.userFloats[H_IS_JOINABLE]){
			let joinables = getHandlesNear(def.vertices[0][0], def.vertices[0][1], this);
			let len = joinables.length
			this.vertex0ConnectedObjectsEnd = len;
			if(len){
				dx = joinables[0].x - def.vertices[1][0];
				dy = joinables[0].y - def.vertices[1][1];
				if(Math.sqrt(dx * dx + dy * dy) < pw.MIN_PLANE_LEN) {
					this.setVertex(1, joinables[0].x + pw.MIN_PLANE_LEN * 1.01, joinables[0].y);
				}
				this.setVertex(0, joinables[0].x, joinables[0].y);
				for(const j of joinables){
					this.connectedObjects.push(j.gameObject);
				}
			}
		}
		let p = pw.getPosition(this.ref);
		this.originX = p[0];
		this.originY = p[1];
	}

	setVertex(vertex, x, y, join){
		if(this.def.userFloats[H_IS_JOINABLE] && join){
			this.connectedObjects.splice(this.vertex0ConnectedObjectsEnd);
			let joinables = getHandlesNear(x, y, this);
			if(joinables.length){
				x = joinables[0].x;
				y = joinables[0].y;
				for(const j of joinables){
					this.connectedObjects.push(j.gameObject);
				}
			}
		}
		pw.setVertex(this.ref, vertex, x, y);
		if(!this.isLegalPosition()) {
			canvas.style.cursor = "no-drop";
			return false;
		}
		canvas.style.cursor = "crosshair";
		return true;
	}

	setFinalProperties(join){
		if(!sandboxMode && !this.isLegalPosition()) {
			this.destroy();
			return false;
		}
		let p = pw.getPosition(this.ref);
		this.originX = p[0];
		this.originY = p[1];

		this.def.vertices = pw.getWorldVertices(this.ref);

		if(join && this.def.userFloats[H_IS_JOINABLE]){
			this.connectedObjects.splice(0);
			let wvs = pw.getWorldVertices(this.ref);
			for(const j of getHandlesNear(wvs[0][0], wvs[0][1], this)){
				let jointDef = {
					form: pw.REVOLUTE_FORM,
					type: pw.JOINT_TYPE,
					gameObjectA: j.gameObject,
					gameObjectB: this,
					va: j.vertex,
					vb: 0,
					x: j.x,
					y: j.y
				};
				if(j.gameObject.def.motorJoinable && j.vertex == 0){
					j.gameObject.def.motorJoinable = false;
					jointDef.motorVelocity = j.gameObject.def.motorVelocity;
					jointDef.maxMotorTorque = j.gameObject.def.maxMotorTorque;
				}
				create(jointDef);
			}
			for(const j of getHandlesNear(wvs[1][0], wvs[1][1], this)){
				let jointDef = {
					form: pw.REVOLUTE_FORM,
					type: pw.JOINT_TYPE,
					gameObjectA: j.gameObject,
					gameObjectB: this,
					va: j.vertex,
					vb: 1,
					x: j.x,
					y: j.y
				};
				if(j.gameObject.def.motorJoinable && j.vertex == 0){
					j.gameObject.def.motorJoinable = false;
					jointDef.motorVelocity = j.gameObject.def.motorVelocity;
					jointDef.maxMotorTorque = j.gameObject.def.maxMotorTorque;
				}
				create(jointDef);
			}
		}
		return true;
	}

	toJson(){
		//this.def.vertices = pw.getWorldVertices(this.ref);
		return JSON.stringify(this.def);
	}
}

class Polygon extends GameObject {
	constructor(def){
		super(def);
		/*
		this.vertex0ConnectedObjectsEnd = 0;
		if(def.userFloats[H_IS_JOINABLE]){
			let joinables = getHandlesNear(def.vertices[0][0], def.vertices[0][1], this);
			let len = joinables.length
			this.vertex0ConnectedObjectsEnd = len;
			if(len){
				this.setVertex(0, joinables[0].x, joinables[0].y);
				for(const j of joinables){
					this.connectedObjects.push(j.gameObject);
				}
			}
		}
		*/
		let p = pw.getPosition(this.ref);
		this.originX = p[0];
		this.originY = p[1];
		//if(!this.isLegalPosition()) canvas.style.cursor = "no-drop";
	}

	setPosition(x, y, join){
	/*
		if(this.def.userFloats[H_IS_JOINABLE] && join){
			this.connectedObjects.splice(0);
			let joinables = getHandlesNear(x, y, this);
			if(joinables.length){
				x = joinables[0].x;
				y = joinables[0].y;
				for(const j of joinables){
					this.connectedObjects.push(j.gameObject);
				}
			}
		}
		*/
		pw.setPosition(this.ref, x, y);
		return true;
		/*
		pw.render();
		if(!this.isLegalPosition()) {
			canvas.style.cursor = "no-drop";
			return false;
		}
		canvas.style.cursor = "crosshair";
		return true;
		*/
	}

	toJson(){
		this.def.vertices = pw.getWorldVertices(this.ref);
		return JSON.stringify(this.def);
	}
}

class AABB extends GameObject {
	constructor(def){
		super(def);
		if(def.id == ASSEMBLY_FIELD_ID){
			if(assemblyField) assemblyField.destroy();
			assemblyField = this;
		} else if (def.id == GOAL_FIELD_ID){
			if(goalField) goalField.destroy();
			goalField = this;
		}
	}

	setVertex(vertex, x, y){
		pw.setVertex(this.ref, vertex, x, y);
		this.def.vertices = pw.getWorldVertices(this.ref);
		return true;
	}

	destroy(){
		if(this == assemblyField){
			assemblyField = null;
		} else if(this == goalField){
			goalField = null;
		}
		super.destroy();
	}

	toJson(){
		return JSON.stringify(this.def);
	}
}



var joints = [];
class Joint {
	constructor(def){
		if(def.gai !== undefined){
			def.gameObjectA = gameObjects[def.gai];
			def.gameObjectB = gameObjects[def.gbi];
		}
		this.gameObjectA = def.gameObjectA;
		this.gameObjectB = def.gameObjectB;
		if(!this.gameObjectA.def.userFloats[H_IS_JOINABLE] || !this.gameObjectB.def.userFloats[H_IS_JOINABLE]) {
			console.error("joining with non-joinable");
		}
		def.poPtrA = def.gameObjectA.ref;
		def.poPtrB = def.gameObjectB.ref;
		this.ref = pw.createConstraint(def);

		delete def.poPtrA;
		delete def.poPtrB;
		delete def.gameObjectA;
		delete def.gameObjectB;

		this.def = def;
		this.gameObjectA.joints.push(this);
		this.gameObjectB.joints.push(this);
		this.gameObjectA.connectedObjects.push(this.gameObjectB);
		this.gameObjectB.connectedObjects.push(this.gameObjectA);
		this.levelObject = sandboxMode;
		joints.push(this);
	}

	destroy(){
		console.log("destroying joint");
		let i = this.gameObjectA.joints.indexOf(this);
		if(i > -1) this.gameObjectA.joints.splice(i, 1);
		else console.error("Cannot remove from joint from gameObjectA.joints at index: " + i + ".");
		i = this.gameObjectB.joints.indexOf(this);
		if(i > -1) this.gameObjectB.joints.splice(i, 1);
		else console.error("Cannot remove from joint from gameObjectB.joints at index: " + i + ".");

		i = this.gameObjectA.connectedObjects.indexOf(this.gameObjectB);
		if(i > -1) this.gameObjectA.connectedObjects.splice(i, 1);
		else console.error("Cannot remove from gameObjectB from gameObjectA.connectedObjects at index: " + i + ".");
		i = this.gameObjectB.connectedObjects.indexOf(this.gameObjectA);
		if(i > -1) this.gameObjectB.connectedObjects.splice(i, 1);
		else console.error("Cannot remove from gameObjectA from gameObjectB.connectedObjects at index: " + i + ".");
		
		i = joints.indexOf(this);
		if(i > -1) joints.splice(i, 1);
		else console.error("Cannot remove from joint from joints at index: " + i + ".");

		if(this.def.motorVelocity !== undefined && gameObjects.includes(this.gameObjectA)) {
			this.gameObjectA.def.motorJoinable = true;
			console.log(this.gameObjectA);
			for(const j of this.gameObjectA.joints){
				if(j.def.va === this.def.va){

					console.log(j.gameObjectA == this.gameObjectA);

					this.gameObjectA.def.motorJoinable = false;
					let p = pw.getJointAnchorPositionA(j.ref);
					create({
						form: j.def.form,
						type: j.def.type,
						gameObjectA: this.gameObjectA,
						gameObjectB: j.gameObjectB,
						va: this.def.va,
						vb: j.def.vb,
						x: p[0],
						y: p[1],
						motorVelocity: this.def.motorVelocity,
						maxMotorTorque: this.def.maxMotorTorque
					});
					if(j.def.motorVelocity !== undefined) console.error("Should not be motor already, problems destroying.");
					pw.destroyConstraint(j.ref);
					j.destroy();
					break;
				}
			}
		}
	}

	toJson(){
		this.def.gai = gameObjects.indexOf(this.gameObjectA);
		this.def.gbi = gameObjects.indexOf(this.gameObjectB);
		let p = pw.getJointAnchorPositionA(this.ref);
		this.def.x = p[0];
		this.def.y = p[1];
		return JSON.stringify(this.def);
	}
}

function getHandlesNear(x, y, objToIgnore){
	if(arguments.length == 2) objToIgnore = null;
	let joinables = [];
	for(const o of gameObjects){
		if(o == objToIgnore || (objToIgnore && !o.def.userFloats[H_IS_JOINABLE])) continue;
		let form = pw.getForm(o.ref);
		if((form == pw.PLANE_FORM || form == pw.AABB_FORM) && (sandboxMode || pw.getType(o.ref) != pw.FIXED_TYPE)){
			let wvs = pw.getWorldVertices(o.ref);
			if(Math.abs(wvs[0][0] - x) < MAX_SNAP_DIST && Math.abs(wvs[0][1] - y) < MAX_SNAP_DIST){
				joinables.push({gameObject: o, x: wvs[0][0], y: wvs[0][1], vertex: 0});
			} else if(Math.abs(wvs[1][0] - x) < MAX_SNAP_DIST && Math.abs(wvs[1][1] - y) < MAX_SNAP_DIST){
				joinables.push({gameObject: o, x: wvs[1][0], y: wvs[1][1], vertex: 1});
			}
		} else if(form == pw.CIRCLE_FORM){
			let p = pw.getPosition(o.ref);
			let r = pw.getRadius(o.ref) - pw.JOINABLE_RADIUS;
			for(let i = 0; i < 4; ++i){
				let wx = pw.WHEEL_J[i][0] * r + p[0];
				let wy = pw.WHEEL_J[i][1] * r + p[1];
				if(Math.abs(wx - x) < MAX_SNAP_DIST && Math.abs(wy - y) < MAX_SNAP_DIST){
					joinables.push({gameObject: o, x: wx, y: wy, vertex: i});
				}
			}
		} else if(form == pw.POLYGON_FORM) {
			let wv = pw.getPosition(o.ref);
			if(Math.abs(wv[0] - x) < MAX_SNAP_DIST && Math.abs(wv[1] - y) < MAX_SNAP_DIST){
				joinables.push({gameObject: o, x: wv[0], y: wv[1], vertex: 0});
			}
		}
	}
	return joinables;
}

function create(def){
	if(def.form == pw.CIRCLE_FORM) {
		return new Circle(def);
	} else if(def.form == pw.PLANE_FORM) {
		return new Obround(def);
	} else if(def.form == pw.POLYGON_FORM){
		return new Polygon(def);
	} else if(def.form == pw.AABB_FORM){
		return new AABB(def);
	} else if(def.form == pw.REVOLUTE_FORM) {
		return new Joint(def);
	} else {
		console.error(def);
		return null;
	}
}

function isPlayable(){
	if(targets.length && goalField && assemblyField){
		return true;
	}
	return false;
}

function getJson(){
	let json = '[{"JSON_LevelFile":true}';
	for(const o of gameObjects){
		json += "," + o.toJson();
	}
	for(const j of joints){
		json += "," + j.toJson();
	}
	json += "]"
	return json;
}

function stringToBase64(str){
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "~");
}
/*
function base64ToString(base64){
	return atob(base64.replace(/-/g, "+").replace(/_/g, "/").replace(/~/g, "="));
}
*/

const levelManager = {
	levelCache: [],
	//currentRef: null,
	//lastDoc: null,
	setRef(ref){
		this.levelCache.length = 0;
		this.currentRef = ref;
	},
	async getNextChunk(){
		let ref = this.currentRef;
		if(!ref) {
			throw "Naa"
		}
		//if(this.lastDoc){
			//ref = ref.startAfter(this.lastDoc);
		//}
		//this.levelCache.push(...await this.normalizeLevels((await ref.get()).docs));
		this.levelCache = await this.normalizeLevels((await ref.get()).docs);
	},
	async get(ref){
		await this.normalizeLevels((await ref.get()).docs);
	},
	async normalizeLevels(docs){
		const len = docs.length;
		if(!len){
			return [];
		}
		this.lastDoc = docs[len - 1];
		const ids = [];
		//const levels = [];
		for(let i = 0; i != len; ++i){
			//const id = docs[i].id;

			this.levelCache[i] = docs[i];
			const data = docs[i].data();
			data.id = docs[i].id;
			ids[i] = data.id;
			this.levelCache[i].data = data;
			//const level = docs[i].data();
			//level.id = id;
			//level.path = docs[i].ref.path;
			//levels[i] = level;
		}
		if(user){
			const reviewSnap = (await db.collection("users").doc(user.uid).collection("reviews").where(firebase.firestore.FieldPath.documentId(), "in", ids).get()).docs;
			const snapLen = reviewSnap.length;
			for(let i = 0; i != len; ++i){
				const id = this.levelCache[i].data.id;
				for(let j = 0; j != snapLen; ++j){
					if(id == reviewSnap[j].id){
						this.levelCache[i].review = reviewSnap[j].data();
						break;
					}
				}
			}
		}
		//return levels;
	},
	async loadLevel(levelPath){
		let level = null;
		const i = this.indexOf(levelPath);
		if(i != -1){
			level = this.levelCache[i];
			console.log("loading level from cache");
		} else {
			const doc = await db.doc(levelPath).get();
			console.log(doc.exists)
			if(!doc.exists){
				throw "Level not found"
			}
			await this.normalizeLevels([doc]);
			level = this.levelCache[0];
			console.log("loading level from server and caching");
		} 
		let levelData = null;
		try {
			levelData = JSON.parse(level.data.json);
		} catch(e) {
			sceneManager.pushModal(messageScene, "Error", "Level corrupted, could not deserialize");
			throw e;
		}
		canvasEventManager.reset();
		sandboxMode = true;
		loadLevelScene.load(levelData);
		sandboxMode = false;
		const batch = db.batch();
		batch.update(db.doc(level.ref.path), {plays: firebase.firestore.FieldValue.increment(1)});
		if(!level.review){
			level.review = {rating: 0};
			batch.set(db.doc("users/" + user.uid + "/reviews/" + level.data.id), level.review);
		}
		batch.commit()
			.then(() => {
				++level.data.plays;
			})
			.catch((err) => {
				sceneManager.pushModal(messageScene, "Error", err);
				throw err;
			});
		return level;
	},
	async getNextLevelPath(levelPath){
		const i = this.indexOf(levelPath) + 1;
		const len = this.levelCache.length;
		if(!i){
			throw "Impossible";
		}
		//if(i == len && this.currentRef && this.lastDoc){
			//await this.getNextChunk();
		//}
		if(i != len || this.levelCache.length > len){
			return this.levelCache[i].ref.path;
		}
		return null;
	},
	indexOf(levelPath){
		for(let i = 0, len = this.levelCache.length; i != len; ++i){
			if(levelPath == this.levelCache[i].ref.path){
				return i;
			}
		}
		return -1;
	},
	getLevel(levelPath){
		for(let i = 0, len = this.levelCache.length; i != len; ++i){
			if(levelPath === this.levelCache[i].ref.path){
				return this.levelCache[i];
			}
		}
		return null;
	}
}