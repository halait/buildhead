"use strict";

var isMousedown = false;
var xSub = 0.0;
var widthMultiplier = 0.0;
var heightMultiplier = 0.0;
canvas.addEventListener('mousedown', (e) => {
	if(sceneManager.currentFloat && sceneManager.currentFloat != tutorialScene) {
		sceneManager.pop();
		return;
	}
	if(isMousedown || !sceneManager.current.eventHandler) {
		console.log("eventHandler == false");
		return;
	}
	isMousedown = true;
	mx = (e.offsetX * widthMultiplier - xSub) / scale - xTranslate;
	my = -(e.offsetY * heightMultiplier - 1.0) / scale - yTranslate;
	sceneManager.current.eventHandler.handleActivePress();
});
canvas.addEventListener('mousemove', (e) => {
	if(!isMousedown || !sceneManager.current.eventHandler) return;
	mx = (e.offsetX * widthMultiplier - xSub) / scale - xTranslate;
	my = -(e.offsetY * heightMultiplier - 1.0) / scale - yTranslate;
	sceneManager.current.eventHandler.handleActiveDrag();
});
canvas.addEventListener('mouseup', () => {
	canvas.style.cursor = "crosshair";
	if(!isMousedown || !sceneManager.current.eventHandler) return;
	isMousedown = false;
	sceneManager.current.eventHandler.handleActiveMouseup();
});
canvas.addEventListener('wheel', (e) => {
	if(sceneManager.current.handleWheel(e)) sceneManager.current.handleWheel(e);
});

let toolbars = document.getElementsByClassName("toolbar");
var aspectRatio = 0.0;
window.onresize = () => {
	let w = window.innerWidth * window.devicePixelRatio;
	let h = window.innerHeight * window.devicePixelRatio - 40;
	if(w < 640) w = 640;
	for(const t of toolbars){
		t.style.width = w + "px";
	}
	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	canvas.width = w;
	canvas.height = h;
	pw.gl.viewport(0, 0, w, h);
	//maxScale = 256 / (h * 0.1);
	aspectRatio = h / w;
	xSub = 1.0 / aspectRatio;
	widthMultiplier = 1.0 / (canvas.clientWidth * 0.5 * aspectRatio);
	heightMultiplier = 1.0 / (canvas.clientHeight * 0.5);
	scaleCanvas(0.0);
	dragCanvas(0.0, 0.0);
	//pw.gl.uniform1f(pw.U_CANVAS_HEIGHT_LOCATION, canvas.height);
};

var xTranslate = 0.0;
var yTranslate = 0.0;
function dragCanvas(x, y){
	xTranslate += x;
	yTranslate += y;
	pw.gl.uniform2f(pw.U_TRANSLATE_LOCATION, xTranslate, yTranslate);
	if(!isSimulating) pw.render();
}

var scale = 0.0;
function scaleCanvas(d){
	scale = Math.min(Math.max(scale - d, 0.2), 8.0);
	pw.gl.uniform2f(pw.U_SCALE_LOCATION, aspectRatio * scale, scale);
	if(!isSimulating) pw.render();
}

function resetCanvas(){
	pw.destroyAll();
	gameObjects.splice(0);
	joints.splice(0);
	targets.splice(0);
	goalField = false;
	assemblyField = false;

	debugPoints.splice(0);

	scale = 1.0;
	scaleCanvas(0.0);
	xTranslate = 0.0;
	yTranslate = 0.0;
	dragCanvas(0.0, 0.0);
	pw.render();
	console.warn("canvas cleared");
}

var mx;
var my;
var tempWheel = null;
var tempRod = null;

function setActiveBtn(btn, eventHandler){
	if(sceneManager.current.activeBtn) sceneManager.current.activeBtn.classList.remove("activeBtn");
	sceneManager.current.activeBtn = btn;
	btn.classList.add("activeBtn");
	sceneManager.current.eventHandler = eventHandler;
}

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
		eventHandler = () => {setActiveBtn(node, handler);};
	}
	node.addEventListener("mousedown", eventHandler);
	parentNode.appendChild(node);
}


var ccwWheelCreatorEventHandler = {
	handleActivePress(){
		tempWheel = create({
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			x: mx,
			y: my,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, 0.0, 0.25, 0.25, 0.5],
			motorVelocity: DEFAULT_MOTOR_VELOCITY,
			maxMotorTorque: DEFAULT_MAX_MOTOR_TORQUE,
			motorJoinable: true
		});
	},
	handleActiveDrag(){
		tempWheel.setPosition(mx, my, true);
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties(true);
		tempWheel = null;
	}
};

var nWheelCreatorEventHandler = {
	handleActivePress(){
		tempWheel = create({
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			x: mx,
			y: my,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, 0.0, 0.50, 0.25, 0.75],
		});
	},
	handleActiveDrag(){
		tempWheel.setPosition(mx, my, true);
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties(true);
		tempWheel = null;
	}
};

var cwWheelCreatorEventHandler = {
	handleActivePress(){
		tempWheel = create({
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			x: mx,
			y: my,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, 0.0, 0.0, 0.25, 0.25],
			hasMotor: true,
			motorVelocity: -DEFAULT_MOTOR_VELOCITY,
			maxMotorTorque: DEFAULT_MAX_MOTOR_TORQUE,
			motorJoinable: true
		});
	},
	handleActiveDrag(){
		tempWheel.setPosition(mx, my, true);
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties(true);
		tempWheel = null;
	}
};

var tWheelCreatorEventHandler = {
	handleEvent(e) {
		setActiveBtn(e.currentTarget, this);
		sceneManager.float(createCustomScene, pw.CIRCLE_FORM);
	},

	handleActivePress(){
		let def = createCustomScene.circleDef;
		if(def === null){
			console.log("default circle");
			def = {
			form: pw.CIRCLE_FORM,
			type: pw.MOVABLE_TYPE,
			radius: DEFAULT_WHEEL_RADIUS,
			density: DEFAULT_WHEEL_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, 0.0, 0.5, 0.25, 0.75],
			};
		}
		def.x = mx,
		def.y = my,
		tempWheel = create(def);
	},
	handleActiveDrag(){
		tempWheel.setPosition(mx, my, true);
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties(true);
		tempWheel = null;
	}
};

var nRodCreatorEventHandler = {
	handleActivePress(){
		tempRod = create({
			form: pw.PLANE_FORM,
			type: pw.MOVABLE_TYPE,
			vertices: [[mx, my], [mx, my]],
			width: DEFAULT_ROD_WIDTH,
			density: DEFAULT_ROD_DENSITY,
			group: NON_COPLANAR_GROUP,
			userFloats: [JOINABLE, ...AQUA_TC],
		});
	},
	handleActiveDrag(){
		tempRod.setVertex(1, mx, my, true);
	},
	handleActiveMouseup(){
		tempRod.setFinalProperties(true);
		tempRod = null;
	},
};

var cRodCreatorEventHandler = {
	handleActivePress(){
		tempRod = new Obround({
			form: pw.PLANE_FORM,
			type: pw.MOVABLE_TYPE,
			vertices: [[mx, my], [mx, my]],
			width: DEFAULT_ROD_WIDTH,
			density: DEFAULT_ROD_DENSITY,
			group: COPLANAR_GROUP,
			userFloats: [JOINABLE, ...GRAY_TC],
		});
	},
	handleActiveDrag(){
		tempRod.setVertex(1, mx, my, true);
	},
	handleActiveMouseup(){
		tempRod.setFinalProperties(true);
		tempRod = null;
	},
};

var gRodCreatorEventHandler = {
	handleEvent(e){
		setActiveBtn(e.currentTarget, this);
		sceneManager.float(createCustomScene);
	},

	handleActivePress(){
		let def = createCustomScene.obroundDef;
		if(def === null || createCustomScene.circleMode){
			def = {
				form: pw.PLANE_FORM,
				type: pw.MOVABLE_TYPE,
				width: 0.1,
				density: DEFAULT_ROD_DENSITY,
				group: COPLANAR_GROUP,
				userFloats: [JOINABLE, ...GRAY_TC],
			};
		}
		def.vertices = [[mx, my], [mx, my]];
		tempRod = create(def);
	},
	handleActiveDrag(){
		tempRod.setVertex(1, mx, my, false);
		pw.render();
	},
	handleActiveMouseup(){
		tempRod.setFinalProperties(true);
		tempRod = null;
	},
};

var moveEventHandler = {
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
		if(sandboxMode || pw.isPointInside(assemblyField.ref, mx, my)){
			this.gameObjectsMoving = getHandlesNear(mx, my);
			if(this.gameObjectsMoving.length > 0){
				this.objsOriginX = this.gameObjectsMoving[0].x;
				this.objsOriginY = this.gameObjectsMoving[0].y;
				for(const j of this.gameObjectsMoving){
					let form = pw.getForm(j.gameObject.ref);
					if(form == pw.CIRCLE_FORM){
						let offset = pw.getLocalPosition(j.gameObject.ref, mx, my);
						j.x = offset[0];
						j.y = offset[1];

					} else if(form == pw.PLANE_FORM){
						let wv = pw.getWorldVertices(j.gameObject.ref)[j.vertex];
						j.x = mx - wv[0];
						j.y = my - wv[1];

					} else if(form == pw.AABB_FORM) {
						this.gameObjectsMoving = [j];
						return;
					} else if(form == pw.POLYGON_FORM){
						let offset = pw.getLocalPosition(j.gameObject.ref, mx, my);
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
								offset = [mx - wv[0], my - wv[1]];
							} else if(form == pw.CIRCLE_FORM) {
								offset = pw.getLocalPosition(gO.ref, mx, my);
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
		this.xDragStart = mx;
		this.yDragStart = my;
	},

	handleActiveDrag(){
		if(this.gameObjectsMoving.length > 0){
			this.isLegalMove = true;
			for(const o of this.gameObjectsMoving){
				let form = pw.getForm(o.gameObject.ref);
				if(form == pw.CIRCLE_FORM || form == pw.POLYGON_FORM) {
					if(!o.gameObject.setPosition(mx - o.x, my - o.y, false)) this.isLegalMove = false;
				} else if(form == pw.PLANE_FORM) {
					if(!o.gameObject.setVertex(o.vertex, mx - o.x, my - o.y, false)) this.isLegalMove = false;
				} else if(form == pw.AABB_FORM){
					pw.setVertex(o.gameObject.ref, o.vertex, mx, my);
				} else {
					console.error("Unhandles form: " + form);
				}
				pw.render();
			}
			if(this.isLegalMove) canvas.style.cursor = "crosshair";
			else canvas.style.cursor = "no-drop";
		} else if(this.xDragStart){
			dragCanvas(mx - this.xDragStart, my - this.yDragStart);
		}
	},

	handleActiveMouseup(){
		if(this.gameObjectsMoving.length > 0){
			if(!this.isLegalMove){
				for(const o of this.gameObjectsMoving){
					let form = pw.getForm(o.gameObject.ref);
					if(form == pw.CIRCLE_FORM) {
						o.gameObject.setPosition(this.objsOriginX - o.x, this.objsOriginY - o.y, false);
					} else if(form == pw.PLANE_FORM) {
						o.gameObject.setVertex(o.vertex, this.objsOriginX - o.x, this.objsOriginY - o.y, false);
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
					let p = pw.getPosition(o.gameObject.ref);
					o.gameObject.originX = p[0];
					o.gameObject.originY = p[1];
				}
			}
			this.gameObjectsMoving.splice(0);
			pw.render();
		}
		this.xDragStart = false;
	},
};

var removeEventHandler = {
	handleActivePress(){},
	handleActiveDrag(){},
	handleActiveMouseup(){
		for(let i = gameObjects.length - 1; i > -1; --i){
			if(sandboxMode || (pw.getType(gameObjects[i].ref) !== pw.FIXED_TYPE && !gameObjects[i].def.target)){
				if(pw.isPointInside(gameObjects[i].ref, mx, my)){
					gameObjects[i].destroy();
					pw.render();
					return;
				}
			}
		}
	},
};

var assemblyFieldCreatorEventHandler = {
	handleActivePress(){
		create({
			form: pw.AABB_FORM,
			type: pw.FIXED_TYPE,
			vertices: [[mx, my], [mx + 0.05, my + 0.05]],
			userFloats: [NON_JOINABLE, ...BLUE_TC],
			id: ASSEMBLY_FIELD_ID
		});
	},
	handleActiveDrag(){
		if(assemblyField) {
			pw.setVertex(assemblyField.ref, 1, mx, my);
			pw.render();
		}
	},
	handleActiveMouseup(){
	},
};

var goalFieldCreatorEventHandler = {
	handleActivePress(){
		create({
			form: pw.AABB_FORM,
			type: pw.FIXED_TYPE,
			vertices: [[mx, my], [mx + 0.05, my + 0.05]],
			userFloats: [NON_JOINABLE, ...ORANGE_TC],
			id: GOAL_FIELD_ID
		});
	},
	handleActiveDrag(){
		if(goalField) {
			pw.setVertex(goalField.ref, 1, mx, my);
			pw.render();
		}
	},
	handleActiveMouseup(){
	},
};



var polygonBtnEventHandler = {
	handleEvent(e){
		setActiveBtn(e.currentTarget, this);
		sceneManager.float(createCustomScene, pw.POLYGON_FORM);
	},
	handleActivePress(){
		create({
			form: pw.POLYGON_FORM,
			type: pw.MOVABLE_TYPE,
			vertices: [[mx, my], [mx + 0.05, my + 0.05]],
			userFloats: [NON_JOINABLE, ...ORANGE_TC],
			id: GOAL_FIELD_ID
		});
	},
	handleActiveDrag(){
		if(goalField) {
			pw.setVertex(goalField.ref, 1, mx, my);
			pw.render();
		}
	},
	handleActiveMouseup(){
	},
};
