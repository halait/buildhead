"use strict";
var createCustomScene = {
	activeBtn: false,
	planeUi: document.getElementById("setCustomObroundPopup"),
	circleUi: document.getElementById("setCustomCirclePopup"),
	ui: null,
	closeBtn: closeBtn.cloneNode(true),
	backScene: false,
	start(form){
		if(form === pw.CIRCLE_FORM) this.ui = this.circleUi;
		else this.ui = this.planeUi;
		this.ui.style.display = "block";
	},
	suspend(form){
		this.ui.style.display = "none";
	},

	obroundDef: null,
	circleDef: null,

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

	customPropertiesForm: document.getElementById("customProperties"),

	init() {
		let formElement = this.customPropertiesForm.cloneNode(true);
		formElement.insertBefore(document.getElementById("rodProperties"), formElement.querySelector("#submitBtn"));
		this.planeForm = this.createForm(formElement);
		this.planeForm.width = formElement.querySelector("#width");
		this.addFormEvents(formElement);
		formElement.onsubmit = (e) => {
			e.preventDefault();
			this.obroundDef = this.setCustomProperties(this.planeForm);
			this.obroundDef.form = pw.PLANE_FORM;
			if(this.planeForm.width.value) this.obroundDef.width = parseFloat(this.planeForm.width.value);
			else this.obroundDef.width = 0.05;
			if(this.obroundDef.group == FIXED_GROUP){
				this.obroundDef.userFloats = this.obroundDef.userFloats.concat(GREEN_TC);
			} else if(this.obroundDef.group == COPLANAR_GROUP) {
				if(this.obroundDef.target){
					this.obroundDef.userFloats = this.obroundDef.userFloats.concat(DARK_ORANGE_TC);
				} else {
					this.obroundDef.userFloats = this.obroundDef.userFloats.concat(GRAY_TC);
				}
			} else if(this.obroundDef.group == NON_COPLANAR_GROUP) {
				this.obroundDef.userFloats = this.obroundDef.userFloats.concat(AQUA_TC);
			} else {
				console.error("Unhandled texture");
			}
			sceneManager.pop();
			return false;
		};
		this.planeUi.appendChild(formElement);
		let sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.pop();});
		this.planeUi.prepend(sceneCloseBtn);

		formElement = this.customPropertiesForm.cloneNode(true);
		formElement.insertBefore(document.getElementById("circleProperties"), formElement.querySelector("#submitBtn"));
		this.circleForm = this.createForm(formElement);
		this.circleForm.radius = formElement.querySelector("#radius");
		this.circleForm.motorSpeed = formElement.querySelector("#motorSpeed");
		this.circleForm.maxMotorTorque = formElement.querySelector("#maxMotorTorque");
		this.addFormEvents(formElement);
		formElement.onsubmit = (e) => {
			e.preventDefault();
			this.circleDef = this.setCustomProperties(this.circleForm);
			this.circleDef.form = pw.CIRCLE_FORM;
			if(this.circleForm.radius.value) this.circleDef.radius = parseFloat(this.circleForm.radius.value);
			else this.circleDef.radius = 0.1;
			if(!this.circleDef.target && this.circleForm.motorSpeed.value && this.circleForm.maxMotorTorque.value){
				this.circleDef.motorVelocity = -this.circleForm.motorSpeed.value;
				this.circleDef.maxMotorTorque = this.circleForm.maxMotorTorque.value;
				this.circleDef.motorJoinable = true;
			}
			if(this.circleDef.motorVelocity < 0){
				this.circleDef.userFloats[1] = 0.0;
				this.circleDef.userFloats[2] = 0.25;
				this.circleDef.userFloats[3] = 0.25;
				this.circleDef.userFloats[4] = 0.5;
			} else if(this.circleDef.motorVelocity > 0) {
				this.circleDef.userFloats[1] = 0.0;
				this.circleDef.userFloats[2] = 0.0;
				this.circleDef.userFloats[3] = 0.25;
				this.circleDef.userFloats[4] = 0.25;
			} else if(this.circleDef.target){
				this.circleDef.userFloats[1] = 0.0;
				this.circleDef.userFloats[2] = 0.75;
				this.circleDef.userFloats[3] = 0.25;
				this.circleDef.userFloats[4] = 1.0;
			} else {
				this.circleDef.userFloats[1] = 0.0;
				this.circleDef.userFloats[2] = 0.5;
				this.circleDef.userFloats[3] = 0.25;
				this.circleDef.userFloats[4] = 0.75;
			}
			if(this.circleDef.group == FIXED_GROUP){
				this.circleDef.userFloats[1] = 0.5;
				this.circleDef.userFloats[3] = 0.75;
			} else if(this.circleDef.group == NON_COPLANAR_GROUP) {
				this.circleDef.userFloats[1] = 0.25;
				this.circleDef.userFloats[3] = 0.5;
			} else if(this.circleDef.group != COPLANAR_GROUP){
				console.error("assigning texture coordinates failed");
			}
			sceneManager.pop();
			return false;
		};
		this.circleUi.appendChild(formElement);
		sceneCloseBtn = closeBtn.cloneNode(true);
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.pop();});
		this.circleUi.prepend(sceneCloseBtn);
	}
}
createCustomScene.init();