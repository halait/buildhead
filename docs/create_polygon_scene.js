"use strict";
var createPolygonScene = {
	vertices: null,
	eventHandler: {
		cv: 0,
		handleActivePress(){
			let len = tempPolygon.length;
			for(let v = 0, len = tempPolygon.length; v < len; ++v){
				if(Math.abs(tempPolygon[v][0] - mx) < MAX_SNAP_DIST && Math.abs(tempPolygon[v][1] - my) < MAX_SNAP_DIST){
					this.cv = v;
					return;
				}			
			}
			tempPolygon.push([mx, my]);
			this.cv = len;
			pw.render();
		},
		handleActiveDrag(){
			tempPolygon[this.cv][0] = mx;
			tempPolygon[this.cv][1] = my;
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
		tempPolygon = [];
	},

	handleWheel(e) {
		e.preventDefault();
		scaleCanvas(e.deltaY * 0.001);
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
		sceneCloseBtn.addEventListener("mousedown", () => {sceneManager.pop();});
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
			*/
		});
		addBtn(backBtn.cloneNode(true), this.toolbar, () => {sceneManager.pop();});
		/*
		this.ui.querySelector("#customPolygonForm").onsubmit = (e) => {
			e.preventDefault();
		};
		*/
	}
}
createPolygonScene.init();