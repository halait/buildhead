"use strict";
// get rid of this
const canvas = document.getElementById("canvas");
var sandboxMode = false;
let tutorialStep = -1;

//var isMousedown = false;
var xSub = 0.0;
var widthMultiplier = 0.0;
var heightMultiplier = 0.0;

let path = false;
if(window.location.protocol == "file:") path = "https://halait.github.io/js-physics-game/";

const canvasEventManager = {
	activePointers: [],
	centerX: 0,
	centerY: 0,
	width: 0,
	height: 0,
	heightM: 0,
	widthM: 0,
	xTranslate: 0,
	yTranslate: 0,
	aspectRatio: 0,
	zoom: 1,
	mx: 0,
	my: 0,
	game: document.getElementById("game"),
	now: 0,
	before: 0,
	drag(x, y){
		this.xTranslate += x;
		this.yTranslate += y;
		pw.gl.uniform2f(pw.U_TRANSLATE_LOCATION, this.xTranslate, this.yTranslate);
		if(!simulationManager.isSimulating) pw.render();
	},
	scale(d){
		this.zoom = Math.min(Math.max(this.zoom + d, 0.2), 8.0);
		pw.gl.uniform2f(pw.U_SCALE_LOCATION, this.aspectRatio * this.zoom, this.zoom);
		this.widthM = 1 / (canvas.clientWidth * 0.5 * this.aspectRatio * this.zoom);
		this.heightM = 1 / (canvas.clientHeight * 0.5 * this.zoom);
		if(!simulationManager.isSimulating) pw.render();
	},
	reset(){
		pw.destroyAll();
		gameObjects.splice(0);
		joints.splice(0);
		targets.splice(0);
		goalField = false;
		assemblyField = false;
		debugPoints.splice(0);
		this.zoom = 1.0;
		this.scale(0.0);
		this.xTranslate = 0.0;
		this.yTranslate = 0.0;
		this.drag(0.0, 0.0);
		this.setHandler(null, null);
		console.log("canvas cleared");
	},

	currentHandler: null,
	currentBtn: null,

	setHandler(handler, btn){
		if(this.currentBtn) {
			this.currentBtn.classList.remove("activeBtn");
		}
		if(btn){
			this.currentBtn = btn;
			btn.classList.add("activeBtn");
		} else {
			this.currentBtn = null;
		}
		this.currentHandler = handler;
	},

	handlePointerEnd(e){
		if(canvasEventManager.activePointers.length){
			canvasEventManager.activePointers.splice(0);
			canvas.style.cursor = "crosshair";
			if(canvasEventManager.currentHandler) {
				canvasEventManager.currentHandler.handleActiveMouseup();
			}
		}
	},

	init(){
		window.onresize = () => {
			const r = window.devicePixelRatio;
			const rect = canvas.getBoundingClientRect();
			let w = rect.width;
			let h = rect.height;
			//canvas.width = w * r;
			//canvas.height = h * r;
			canvas.width = w;
			canvas.height = h;
			this.centerX = w * 0.5 + rect.left;
			this.centerY = h * 0.5 + rect.top;
			pw.gl.viewport(0, 0, w, h);
			this.aspectRatio = h / w;
			this.widthM = 1 / (w * 0.5 * this.aspectRatio * this.zoom);
			this.heightM = 1 / (h * 0.5 * this.zoom);
			this.scale(0);
		};
		canvas.addEventListener('pointerdown', (e) => {
			this.mx = (e.clientX - this.centerX) * this.widthM - this.xTranslate;
			this.my = (this.centerY - e.clientY) * this.heightM - this.yTranslate;
			const len = this.activePointers.length;
			if(len > 1) {
				this.activePointers.splice(0);
				return;
			} else {
				this.activePointers.push({pointerId: e.pointerId, x: this.mx, y: this.my});
				if(len == 1) return;
			}
			if(this.currentHandler) {
				this.currentHandler.handleActivePress();
			}
		});
		canvas.addEventListener('pointermove', (e) => {
			const len = this.activePointers.length;
			if(!len) return;
			this.now = e.timeStamp;
			if(this.now - this.before <  16) return;
			this.before = this.now;
			this.mx = (e.clientX - this.centerX) * this.widthM - this.xTranslate;
			this.my = (this.centerY - e.clientY) * this.heightM - this.yTranslate;
			if(len == 2 && (e.pointerType == "touch" || e.pointerType == "pen")){
				let dx  = this.activePointers[0].x - this.activePointers[1].x;
				let dy  = this.activePointers[0].y - this.activePointers[1].y;
				const od = Math.sqrt(dx * dx + dy * dy);
				if(e.pointerId == this.activePointers[0].pointerId){
					this.activePointers[0].x = this.mx;
					this.activePointers[0].y = this.my;
				} else if(e.pointerId == this.activePointers[1].pointerId){
					this.activePointers[1].x = this.mx;
					this.activePointers[1].y = this.my;
				} else {
					return;
				}
				dx  = this.activePointers[0].x - this.activePointers[1].x;
				dy  = this.activePointers[0].y - this.activePointers[1].y;
				this.scale(Math.sqrt(dx * dx + dy * dy) / od * this.zoom - this.zoom);
				return;
			}
			if(this.currentHandler) {
				this.currentHandler.handleActiveDrag();
			}
		});
		canvas.addEventListener('pointerup', this.handlePointerEnd);
		canvas.addEventListener('pointerout', this.handlePointerEnd);
		canvas.addEventListener('pointercancel', this.handlePointerEnd);
		canvas.addEventListener('pointerleave', this.handlePointerEnd);

		canvas.addEventListener('wheel', (e) => {
			e.preventDefault();
			this.scale(-e.deltaY * 0.001);
		});
	}
};
canvasEventManager.init();
var tempWheel = null;
var tempRod = null;

const startSimulationBtn = document.querySelector(".startSimulationBtn");
const stopSimulationBtn = document.querySelector(".stopSimulationBtn");
const ccwWheelCreatorBtn = document.querySelector(".ccwWheelCreatorBtn");
const nWheelCreatorBtn = document.querySelector(".nWheelCreatorBtn");
const cwWheelCreatorBtn = document.querySelector(".cwWheelCreatorBtn");
const tWheelCreatorBtn = document.querySelector(".tWheelCreatorBtn");
const nRodCreatorBtn = document.querySelector(".nRodCreatorBtn");
const cRodCreatorBtn = document.querySelector(".cRodCreatorBtn");
const gRodCreatorBtn = document.querySelector(".gRodCreatorBtn");
const moveBtn = document.querySelector(".moveBtn");
const removeBtn = document.querySelector(".removeBtn");
const assemblyFieldCreatorBtn = document.querySelector(".assemblyFieldCreatorBtn");
const goalFieldCreatorBtn = document.querySelector(".goalFieldCreatorBtn");
const saveLevelBtn = document.querySelector(".saveLevelBtn");
const loadLevelBtn = document.querySelector(".loadLevelBtn");
const backBtn = document.querySelector(".backBtn");
const closeBtn = document.querySelector(".closeBtn");

const polygonBtn = document.querySelector(".polygonBtn");


function addBtn(node, parentNode, eventHandler){
	if(typeof eventHandler === "object" && eventHandler.handleEvent === undefined){
		let handler = eventHandler;
		eventHandler = () => {canvasEventManager.setHandler(handler, node);};
	}
	node.addEventListener("mousedown", eventHandler);
	parentNode.appendChild(node);
}


const ccwWheelCreatorEventHandler = {
	handleActivePress(){
		tempWheel = create({
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			x: canvasEventManager.mx,
			y: canvasEventManager.my,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, ...texs.ccwWheel],
			motorVelocity: DEFAULT_MOTOR_VELOCITY,
			maxMotorTorque: DEFAULT_MAX_MOTOR_TORQUE,
			motorJoinable: true
		});
		pw.render();
	},
	handleActiveDrag(){
		tempWheel.setPosition(canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempWheel.setFinalProperties(true)){
			pw.render();
		}
		tempWheel = null;
	}
};

const nWheelCreatorEventHandler = {
	handleActivePress(){
		tempWheel = create({
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			x: canvasEventManager.mx,
			y: canvasEventManager.my,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, ...texs.nWheel],
		});
		pw.render();
	},
	handleActiveDrag(){
		tempWheel.setPosition(canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempWheel.setFinalProperties(true)){
			pw.render();
		}
		tempWheel = null;
	}
};

const cwWheelCreatorEventHandler = {
	handleActivePress(){
		tempWheel = create({
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			x: canvasEventManager.mx,
			y: canvasEventManager.my,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, ...texs.cwWheel],
			hasMotor: true,
			motorVelocity: -DEFAULT_MOTOR_VELOCITY,
			maxMotorTorque: DEFAULT_MAX_MOTOR_TORQUE,
			motorJoinable: true
		});
		pw.render();
	},
	handleActiveDrag(){
		tempWheel.setPosition(canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempWheel.setFinalProperties(true)){
			pw.render();
		}
		tempWheel = null;
	}
};

const tWheelCreatorEventHandler = {
	handleEvent(e) {
		canvasEventManager.setHandler(this, e.currentTarget);
		sceneManager.pushModal(createCustomScene, pw.CIRCLE_FORM);
	},

	handleActivePress(){
		let def = createCustomScene.getCircleDef();
		def.x = canvasEventManager.mx,
		def.y = canvasEventManager.my,
		tempWheel = create(def);
		pw.render();
	},
	handleActiveDrag(){
		tempWheel.setPosition(canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempWheel.setFinalProperties(true)){
			pw.render();
		}
		tempWheel = null;
	}
};

const nRodCreatorEventHandler = {
	handleActivePress(){
		tempRod = create({
			form: pw.PLANE_FORM,
			type: pw.MOVABLE_TYPE,
			vertices: [[canvasEventManager.mx, canvasEventManager.my], [canvasEventManager.mx, canvasEventManager.my]],
			width: DEFAULT_ROD_WIDTH,
			density: DEFAULT_ROD_DENSITY,
			group: NON_COPLANAR_GROUP,
			userFloats: [JOINABLE, ...texs.aqua],
		});
		pw.render();
	},
	handleActiveDrag(){
		tempRod.setVertex(1, canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempRod.setFinalProperties(true)){
			pw.render();
		}
		tempRod = null;
	},
};

const cRodCreatorEventHandler = {
	handleActivePress(){
		tempRod = new Obround({
			form: pw.PLANE_FORM,
			type: pw.MOVABLE_TYPE,
			vertices: [[canvasEventManager.mx, canvasEventManager.my], [canvasEventManager.mx, canvasEventManager.my]],
			width: DEFAULT_ROD_WIDTH,
			density: DEFAULT_ROD_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, ...texs.gray],
		});
		pw.render();
	},
	handleActiveDrag(){
		tempRod.setVertex(1, canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempRod.setFinalProperties(true)){
			pw.render();
		}
		tempRod = null;
	},
};

const gRodCreatorEventHandler = {
	handleEvent(e){
		canvasEventManager.setHandler(this, e.currentTarget);
		sceneManager.pushModal(createCustomScene);
	},

	handleActivePress(){
		if(tempRod){
			console.error("Temp rod already initialized");
		}
		let def = createCustomScene.getObroundDef();
		/*
		if(def === null || createCustomScene.circleMode){
			def = {
				form: pw.PLANE_FORM,
				type: pw.MOVABLE_TYPE,
				width: 0.1,
				density: DEFAULT_ROD_DENSITY,
				group: COPLANAR_GROUP,
				userFloats: [JOINABLE, ...GRAY_TC],
			};
		}*/
		def.vertices = [[canvasEventManager.mx, canvasEventManager.my], [canvasEventManager.mx, canvasEventManager.my]];
		tempRod = create(def);
		pw.render();
	},
	handleActiveDrag(){
		tempRod.setVertex(1, canvasEventManager.mx, canvasEventManager.my, true);
		pw.render();
	},
	handleActiveMouseup(){
		if(!tempRod.setFinalProperties(true)){
			pw.render();
		}
		tempRod = null;
	},
};

const moveEventHandler = {
	gameObjectsMoving: [],
	objsOriginX: false,
	objsOriginY: false,
	xDragStart: false,
	yDragStart: false,
	isLegalMove: true,

	gameObjectIsExcluded(gameObject){
		for(const o of this.gameObjectsMoving){
			if(o.gameObject == gameObject) return false;
		}
		return true;
	},

	handleActivePress(){
		if(sandboxMode || pw.isPointInside(assemblyField.ref, canvasEventManager.mx, canvasEventManager.my)){
			this.gameObjectsMoving = getHandlesNear(canvasEventManager.mx, canvasEventManager.my);
			if(this.gameObjectsMoving.length > 0){
				this.objsOriginX = this.gameObjectsMoving[0].x;
				this.objsOriginY = this.gameObjectsMoving[0].y;
				for(const j of this.gameObjectsMoving){
					let form = pw.getForm(j.gameObject.ref);
					if(form == pw.CIRCLE_FORM){
						let offset = pw.getLocalPosition(j.gameObject.ref, canvasEventManager.mx, canvasEventManager.my);
						j.x = offset[0];
						j.y = offset[1];

					} else if(form == pw.PLANE_FORM){
						let wv = pw.getWorldVertices(j.gameObject.ref)[j.vertex];
						j.x = canvasEventManager.mx - wv[0];
						j.y = canvasEventManager.my - wv[1];

					} else if(form == pw.AABB_FORM) {
						this.gameObjectsMoving = [j];
						return;
					} else if(form == pw.POLYGON_FORM){
						let offset = pw.getLocalPosition(j.gameObject.ref, canvasEventManager.mx, canvasEventManager.my);
						j.x = offset[0];
						j.y = offset[1];
					}
				}
				for(const j of this.gameObjectsMoving){
					if(pw.getForm(j.gameObject.ref) == pw.CIRCLE_FORM){
						let rad = pw.getRadius(j.gameObject.ref) - pw.JOINABLE_RADIUS;
						for(const r of j.gameObject.joints){
							let gO = r.gameObjectA;
							let v = r.def.va;
							if(r.gameObjectA === j.gameObject){
								gO = r.gameObjectB;
								v = r.def.vb;
							}
							let form = pw.getForm(gO.ref);
							let offset = null;
							if(form == pw.PLANE_FORM) {
								let wv = pw.getWorldVertices(gO.ref)[v];
								offset = [canvasEventManager.mx - wv[0], canvasEventManager.my - wv[1]];
							} else if(form == pw.CIRCLE_FORM) {
								offset = pw.getLocalPosition(gO.ref, canvasEventManager.mx, canvasEventManager.my);
							} else {
								console.error("unhandled form: " + form);
							}
							if(this.gameObjectIsExcluded(gO)){
								this.gameObjectsMoving.push({
									gameObject: gO,
									x: offset[0],
									y: offset[1],
									vertex: v
								});
							}
						}
					}
				}
				console.log("this.gameObjectsMoving.length = " + this.gameObjectsMoving.length);
				return;
			}
		}
		this.xDragStart = canvasEventManager.mx;
		this.yDragStart = canvasEventManager.my;
	},

	handleActiveDrag(){
		if(this.gameObjectsMoving.length > 0){
			this.isLegalMove = true;
			for(const o of this.gameObjectsMoving){
				let form = pw.getForm(o.gameObject.ref);
				if(form == pw.CIRCLE_FORM || form == pw.POLYGON_FORM) {
					if(!o.gameObject.setPosition(canvasEventManager.mx - o.x, canvasEventManager.my - o.y)) this.isLegalMove = false;
				} else if(form == pw.PLANE_FORM) {
					if(!o.gameObject.setVertex(o.vertex, canvasEventManager.mx - o.x, canvasEventManager.my - o.y)) this.isLegalMove = false;
				} else if(form == pw.AABB_FORM){
					o.gameObject.setVertex(o.vertex, canvasEventManager.mx, canvasEventManager.my);
				} else {
					console.error("Unhandles form: " + form);
				}
			}
			pw.render();
			if(this.isLegalMove) canvas.style.cursor = "crosshair";
			else canvas.style.cursor = "no-drop";
		} else if(this.xDragStart){
			canvasEventManager.drag(canvasEventManager.mx - this.xDragStart, canvasEventManager.my - this.yDragStart);
		}
	},

	handleActiveMouseup(){
		if(this.gameObjectsMoving.length > 0){
			if(!this.isLegalMove){
				for(const o of this.gameObjectsMoving){
					const form = pw.getForm(o.gameObject.ref);
					if(form == pw.CIRCLE_FORM) {
						o.gameObject.setPosition(this.objsOriginX - o.x, this.objsOriginY - o.y);
					} else if(form == pw.PLANE_FORM) {
						o.gameObject.setVertex(o.vertex, this.objsOriginX - o.x, this.objsOriginY - o.y);
					}
				}
			} else {
				for(const o of this.gameObjectsMoving){
					if(pw.getForm(o.gameObject.ref) == pw.PLANE_FORM) {
						for(const j of o.gameObject.joints){
							let vertex = j.def.vb;
							if(j.gameObjectA == o.gameObject) vertex = j.def.va;
							let wv = pw.getWorldVertices(o.gameObject.ref)[vertex];
							pw.setJointPosition(j.ref, wv[0], wv[1]);
						}
					}
					o.gameObject.setFinalProperties(false);
				}
			}
			this.gameObjectsMoving.splice(0);
			pw.render();
		}
		this.xDragStart = false;
	},
};

const removeEventHandler = {
	handleActivePress(){},
	handleActiveDrag(){},
	handleActiveMouseup(){
		if(sandboxMode || pw.isPointInside(assemblyField.ref, canvasEventManager.mx, canvasEventManager.my)){
			for(let i = gameObjects.length - 1; i > -1; --i){
				if(sandboxMode || (pw.getType(gameObjects[i].ref) !== pw.FIXED_TYPE && !gameObjects[i].def.target)){
					if(pw.isPointInside(gameObjects[i].ref, canvasEventManager.mx, canvasEventManager.my)){
						gameObjects[i].destroy();
						pw.render();
						return;
					}
				}
			}
		}
	},
};

const assemblyFieldCreatorEventHandler = {
	handleActivePress(){
		create({
			form: pw.AABB_FORM,
			type: pw.FIXED_TYPE,
			vertices: [[canvasEventManager.mx, canvasEventManager.my], [canvasEventManager.mx + 0.05, canvasEventManager.my + 0.05]],
			userFloats: [NON_JOINABLE, ...texs.blue],
			id: ASSEMBLY_FIELD_ID
		});
		pw.render();
	},
	handleActiveDrag(){
		if(assemblyField) {
			assemblyField.setVertex(1, canvasEventManager.mx, canvasEventManager.my);
			pw.render();
		}
	},
	handleActiveMouseup(){
	},
};

const goalFieldCreatorEventHandler = {
	handleActivePress(){
		create({
			form: pw.AABB_FORM,
			type: pw.FIXED_TYPE,
			vertices: [[canvasEventManager.mx, canvasEventManager.my], [canvasEventManager.mx + 0.05, canvasEventManager.my + 0.05]],
			userFloats: [NON_JOINABLE, ...texs.orange],
			id: GOAL_FIELD_ID
		});
		pw.render();
	},
	handleActiveDrag(){
		if(goalField) {
			goalField.setVertex(1, canvasEventManager.mx, canvasEventManager.my);
			pw.render();
		}
	},
	handleActiveMouseup(){
	},
};



const polygonBtnEventHandler = {
	handleEvent(e){
		setActiveBtn(e.currentTarget, this);
		sceneManager.float(createCustomScene, pw.POLYGON_FORM);
	},
	handleActivePress(){
		create({
			form: pw.POLYGON_FORM,
			type: pw.MOVABLE_TYPE,
			vertices: [[canvasEventManager.mx, canvasEventManager.my], [canvasEventManager.mx + 0.05, canvasEventManager.my + 0.05]],
			userFloats: [NON_JOINABLE, ...ORANGE_TC],
			id: GOAL_FIELD_ID
		});
		pw.render();
	},
	handleActiveDrag(){
		if(goalField) {
			pw.setVertex(goalField.ref, 1, canvasEventManager.mx, canvasEventManager.my);
			pw.render();
		}
	},
	handleActiveMouseup(){
	},
};


// scene management
const sceneManager = {
	modalEntries: [],
	current: null,
	modalEntry: null,
	push(url, state){
		history.pushState(state, "", url);
		this.popAllModal();
		if(this.current){
			this.current.suspend();
		}
		this.current = routes[getRoute()];
		this.current.start();
	},
	pushModal(modal, ...state){
		if(this.modalEntry){
			this.modalEntry.modal.suspend();
		}
		const entry = {modal, state}
		this.modalEntry = entry;
		this.modalEntries.push(entry);
		modal.start(...state);
	},
	popModal(){
		const deleteLater = this.modalEntries.pop();
		if(this.modalEntry != deleteLater) throw "Baaad";
		this.modalEntry.modal.suspend();
		const i = this.modalEntries.length - 1;
		if(i != -1) {
			this.modalEntry = this.modalEntries[i];
			this.modalEntry.modal.start(...this.modalEntry.state);
		} else {
			this.modalEntry = null;
		}
	},
	popAllModal(){
		for(let i = this.modalEntries.length - 1; i > -1; --i){
			const entry = this.modalEntries.pop();
			entry.modal.suspend();
		}
		this.currentModal = null;
	}
};

window.addEventListener("popstate", (e) => {
	sceneManager.popAllModal();
	if(sceneManager.current){
		sceneManager.current.suspend();
	}
	sceneManager.current = routes[getRoute()];
	sceneManager.current.start();	
});

function getRoute(){
	return /\/[^\/]*/.exec(location.pathname)[0];
}