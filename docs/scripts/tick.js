"use strict";

const simulationManager = {
	begin(caller){
		this.caller = caller;
		caller.toolbar.style.display = "none";
		this.toolbar.style.display = "block";
		this.oldBtn = canvasEventManager.currentBtn;
		this.oldHandler = canvasEventManager.currentHandler;
		canvasEventManager.setHandler(this.eventHandler);
		this.isSimulating = true;
		this.successPending = !sandboxMode;
		requestAnimationFrame(this.simulate);
	},
	end(){
		this.isSimulating = false;
		this.toolbar.style.display = "none";
		this.caller.toolbar.style.display = "flex";
		canvasEventManager.setHandler(this.oldHandler, this.oldBtn);
		sceneManager.popAllModal();
	},
	
	caller: null,
	oldBtn: null,
	oldHandler: null,
	toolbar: document.getElementById("simulationSceneBtnsDiv"),
	isSimulating: false,


	eventHandler: {
		xDragStart: false,
		yDragStart: false,
		handleActivePress(){
			this.xDragStart = canvasEventManager.mx;
			this.yDragStart = canvasEventManager.my;
		},
		handleActiveDrag(){
			if(this.xDragStart){
				canvasEventManager.drag(canvasEventManager.mx - this.xDragStart, canvasEventManager.my - this.yDragStart);
			}
		},
		handleActiveMouseup(){
			this.xDragStart = false;
		},
	},
	successPending: false,
	before: 0,
	simulate(now) {
		if(simulationManager.isSimulating) {
			requestAnimationFrame(simulationManager.simulate);
			pw.update();
			const dt = now - simulationManager.before;
			if(dt < 25) return;
			//if(dt > 34) console.log("frame drop");
			simulationManager.before = now;
			//pw.update();
			pw.render();
			if(simulationManager.successPending){
				let success = true;
				for(let i = 0, len = targets.length; i != len; ++i){
					if(!pw.isWithinAABB(goalField.ref, targets[i].ref)) {
						success = false;
						break;
					}
				}
				if(success) {
					simulationManager.successPending = false;
					sceneManager.pushModal(successScene, simulationManager.caller.currentLevel);
				}
			}
		} else {
			pw.resetAllImpulses();
			for(const o of gameObjects){
				if(pw.getType(o.ref) == pw.FIXED_TYPE) continue;
				pw.setPosition(o.ref, o.originX, o.originY);
				pw.setOrientation(o.ref, 0.0);
				pw.setLinearVelocity(o.ref, 0.0, 0.0);
				pw.setRotationalVelocity(o.ref, 0.0);
			}
			pw.render();
		}
	},
	init(){
		addBtn(stopSimulationBtn, this.toolbar, () => {this.end()});
	}
}
simulationManager.init();


pw.gl = canvas.getContext("webgl");
if(!pw.gl) {
	let noWebGlErr = "Sorry, this game cannot be played here because WebGl is not supported.";
	sceneManager.pushModal(messageScene, "Error", noWebGlErr);
	throw noWebGlErr;
}

let vertexShaderSource = `
	attribute vec2 a_position;
	attribute vec2 a_tex_coords;
	varying vec2 v_tex_coords;
	uniform vec2 u_translate;
	uniform vec2 u_scale;

	void main() {
		gl_Position = vec4((a_position + u_translate) * u_scale, 0, 1);
		v_tex_coords = a_tex_coords;
	}
`;

let fragmentShaderSource = `
	precision highp float;
	uniform sampler2D u_sampler;
	varying vec2 v_tex_coords;
	void main() {
		gl_FragColor = texture2D(u_sampler, v_tex_coords);
		if(gl_FragColor.a < 0.85) discard;
	}
`;

function createShader(type, source) {
  let shader = pw.gl.createShader(type);
  pw.gl.shaderSource(shader, source);
  pw.gl.compileShader(shader);
  let success = pw.gl.getShaderParameter(shader, pw.gl.COMPILE_STATUS);
  if(success) {
    return shader;
  }
  console.log(pw.gl.getShaderInfoLog(shader));
  pw.gl.deleteShader(shader);
}

function createProgram(vertexShaderSource, fragmentShaderSource) {
	vertexShaderSource = createShader(pw.gl.VERTEX_SHADER, vertexShaderSource);
	fragmentShaderSource = createShader(pw.gl.FRAGMENT_SHADER, fragmentShaderSource);
  let program = pw.gl.createProgram();
  pw.gl.attachShader(program, vertexShaderSource);
  pw.gl.attachShader(program, fragmentShaderSource);
  pw.gl.linkProgram(program);
  let success = pw.gl.getProgramParameter(program, pw.gl.LINK_STATUS);
  if(success) {
    return program;
  }
  console.log(pw.gl.getProgramInfoLog(program));
  pw.gl.deleteProgram(program);
}

var program = createProgram(vertexShaderSource, fragmentShaderSource);

pw.A_POSITION_LOCATION = pw.gl.getAttribLocation(program, "a_position");
pw.A_TEX_COORDS_LOCATION = pw.gl.getAttribLocation(program, "a_tex_coords");
pw.U_SCALE_LOCATION = pw.gl.getUniformLocation(program, "u_scale");
pw.U_TRANSLATE_LOCATION = pw.gl.getUniformLocation(program, "u_translate");
pw.U_SAMPLER = pw.gl.getUniformLocation(program, "u_sampler");

const loadingScreen = document.getElementById("loadingDiv");

function createTexture(imgPath){
	let img = document.createElement("img");
	if(path) {
		img.crossOrigin = "";
		imgPath = path + imgPath;
	}
	img.onerror = () => {
		loadingScreen.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
		loadingScreen.style.display = "none";
		sceneManager.pushModal(messageScene, "Error", "Unable to play game because texture could not be loaded.");
		window.onresize();
		throw "Unable to load texture";
	}
	img.onload = () => {
		loadingScreen.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
		loadingScreen.style.display = "none";
		window.onresize();
		sceneManager.push(location.href);

		let texture = pw.gl.createTexture();
		pw.gl.bindTexture(pw.gl.TEXTURE_2D, texture);
		pw.gl.texImage2D(pw.gl.TEXTURE_2D, 0, pw.gl.RGBA, pw.gl.RGBA, pw.gl.UNSIGNED_BYTE, img);
		pw.gl.generateMipmap(pw.gl.TEXTURE_2D);
		pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_MIN_FILTER, pw.gl.LINEAR_MIPMAP_NEAREST);
		pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_MAG_FILTER, pw.gl.LINEAR);
		pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_WRAP_S, pw.gl.CLAMP_TO_EDGE);
		pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_WRAP_T, pw.gl.CLAMP_TO_EDGE);
		pw.gl.activeTexture(pw.gl.TEXTURE0);
		pw.gl.uniform1i(pw.U_SAMPLER, 0);
		if(pw.gl.getError()) {
			console.error(pw.gl.getError());
		}
		//new
		//pw.gl.disable(pw.gl.DEPTH_TEST);
		//pw.gl.enable(pw.gl.BLEND);
		//pw.gl.blendFunc(pw.gl.SRC_ALPHA, pw.gl.ONE_MINUS_SRC_ALPHA);
	}
	img.src = imgPath;
}
createTexture("/images/newestTex.png");

pw.positions = new Float32Array(6000);
pw.texCoords = new Float32Array(6000);

pw.positionsBuffer = pw.gl.createBuffer();
pw.texCoordsBuffer = pw.gl.createBuffer();

pw.gl.bindBuffer(pw.gl.ARRAY_BUFFER, pw.positionsBuffer);
pw.gl.vertexAttribPointer(pw.A_POSITION_LOCATION, 2, pw.gl.FLOAT, false, 0, 0);

pw.gl.bindBuffer(pw.gl.ARRAY_BUFFER, pw.texCoordsBuffer);
pw.gl.vertexAttribPointer(pw.A_TEX_COORDS_LOCATION, 2, pw.gl.FLOAT, false, 0, 0);

pw.gl.enableVertexAttribArray(pw.A_POSITION_LOCATION);
pw.gl.enableVertexAttribArray(pw.A_TEX_COORDS_LOCATION);

pw.gl.clearColor(0, 0, 0, 0);
pw.gl.useProgram(program);
pw.gl.clear(pw.gl.COLOR_BUFFER_BIT);


let white = new Float32Array([1.0, 1.0, 1.0]);
let red = new Float32Array([1.0, 0.1, 0.1]);

pw.PO_COLORS = [
	[1.0, 0.0, 0.0], [0.0, 0.6, 0.0], [0.0, 0.0, 1.0], [0.85, 0.35, 0.0],
	[0.0, 0.4, 0.0], [0.5, 0.5, 0.5], [0.0, 1.0, 1.0],
	[0.0, 0.5, 1.0], [1.0, 0.5, 0.0]
	
];

pw.WHEEL_J = [
	[0.0, 0.0],
	[1.0, 0.0],
	[Math.cos(Math.PI * 2.0 / 3), Math.sin(Math.PI * 2.0 / 3)],
	[Math.cos(Math.PI * 2.0 / 1.5), Math.sin(Math.PI * 2.0 / 1.5)]
];

const GREEN_TC  = [0.875, 0.018, 0.875, 0.018];
const GRAY_TC  = [0.875, 0.054, 0.875, 0.054];
const AQUA_TC  = [0.875, 0.089, 0.875, 0.089];
const WHITE_TC  = [0.875, 0.125, 0.875, 0.125];
const ORANGE_TC  = [0.875, 0.161, 0.875, 0.161];
const DARK_ORANGE_TC  = [0.875, 0.196, 0.875, 0.196];
const BLUE_TC = [0.875, 0.232, 0.875, 0.232];
//const DR_TC  = [];

const tempPolygon = [];
const debugPoints = [];

pw.render = function() {
	const M = this.M;
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	let p = 0;
	let c = 0;
	/*
	let ap = 0;
	let ac = 0;

	let pp = 0;
	let pc = -3;
	let ps = 0;

	let cp = 0;
	let cc = 0;
	let cs = 0;
	*/


	for(let i = 0, len = this.poTotal; i < len; ++i){
		let si = this.PO_PTRS[i];
		if(M[O_FORM + si] == this.CIRCLE_FORM){
			let rc = M[O_RADIUS + si] * M[O_COS + si];
			let rs = M[O_RADIUS + si] * M[O_SIN + si];
			let x0 = rs - rc + M[O_TX + si];
			let y0 = -rc - rs + M[O_TY + si];
			let x2 = rc - rs + M[O_TX + si];
			let y2 = rc + rs + M[O_TY + si];
			this.positions[p++] = x0;
			this.positions[p++] = y0;
			this.positions[p++] = rc + rs + M[O_TX + si];
			this.positions[p++] = rs - rc + M[O_TY + si];
			this.positions[p++] = x2;
			this.positions[p++] = y2;
			this.positions[p++] = x2;
			this.positions[p++] = y2;
			this.positions[p++] = -rc - rs + M[O_TX + si];
			this.positions[p++] = rc - rs + M[O_TY + si];
			this.positions[p++] = x0;
			this.positions[p++] = y0;

			let ti = this.PO_SIZES[M[O_FORM + si]] + si + H_R;
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 1];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 1];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 1];

			if(M[this.PO_SIZES[M[O_FORM + si]] + si + H_IS_JOINABLE]){
				for(let i = 0; i < 4; ++i){
					//let x = WHEEL_JOINABLES[i][0] * M[O_COS + si] - WHEEL_JOINABLES[i][1] * M[O_SIN + si] + M[O_TX + si];
					//let y = WHEEL_JOINABLES[i][1] * M[O_COS + si] + WHEEL_JOINABLES[i][0] * M[O_SIN + si] + M[O_TY + si];
					let r = pw.JOINABLE_RADIUS;
					rc = (M[O_RADIUS + si] - r) * M[O_COS + si];
					rs = (M[O_RADIUS + si] - r) * M[O_SIN + si];
					let x = this.WHEEL_J[i][0] * rc - this.WHEEL_J[i][1] * rs + M[O_TX + si];
					let y = this.WHEEL_J[i][1] * rc + this.WHEEL_J[i][0] * rs + M[O_TY + si];
					this.positions[p++] = x - r;
					this.positions[p++] = y - r;
					this.positions[p++] = x + r;
					this.positions[p++] = y - r;
					this.positions[p++] = x + r;
					this.positions[p++] = y + r;
					this.positions[p++] = x + r;
					this.positions[p++] = y + r;
					this.positions[p++] = x - r;
					this.positions[p++] = y + r;
					this.positions[p++] = x - r;
					this.positions[p++] = y - r;
					this.texCoords[c++] = 0.25;
					this.texCoords[c++] = 0.75;
					this.texCoords[c++] = 0.5;
					this.texCoords[c++] = 0.75;
					this.texCoords[c++] = 0.5;
					this.texCoords[c++] = 1.0;
					this.texCoords[c++] = 0.5;
					this.texCoords[c++] = 1.0;
					this.texCoords[c++] = 0.25;
					this.texCoords[c++] = 1.0;
					this.texCoords[c++] = 0.25;
					this.texCoords[c++] = 0.75;
				}
			}
			
		} else if(M[O_FORM + si] == this.PLANE_FORM){
			let xe = -M[O_UY + si] * M[O_HALF_WIDTH + si];
			let ye = M[O_UX + si] * M[O_HALF_WIDTH + si];
			let x0 = M[O_W0X + si];
			let y0 = M[O_W0Y + si];
			let x1 = M[O_W1X + si];
			let y1 = M[O_W1Y + si];
			
			this.positions[p++] = x0 + xe;
			this.positions[p++] = y0 + ye;
			this.positions[p++] = x0 - xe;
			this.positions[p++] = y0 - ye;
			this.positions[p++] = x1 + xe;
			this.positions[p++] = y1 + ye;
			this.positions[p++] = x1 + xe;
			this.positions[p++] = y1 + ye;
			this.positions[p++] = x1 - xe;
			this.positions[p++] = y1 - ye;
			this.positions[p++] = x0 - xe;
			this.positions[p++] = y0 - ye;

			let ti = this.PO_SIZES[M[O_FORM + si]] + si + H_R;
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 1];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 1];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 1];

			if(M[O_TYPE + si] == pw.FIXED_TYPE){
				let r = M[O_HALF_WIDTH + si];
				this.positions[p++] = x0 - r;
				this.positions[p++] = y0 - r;
				this.positions[p++] = x0 + r;
				this.positions[p++] = y0 - r;
				this.positions[p++] = x0 + r;
				this.positions[p++] = y0 + r;
				this.positions[p++] = x0 + r;
				this.positions[p++] = y0 + r;
				this.positions[p++] = x0 - r;
				this.positions[p++] = y0 + r;
				this.positions[p++] = x0 - r;
				this.positions[p++] = y0 - r;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.5;

				this.positions[p++] = x1 - r;
				this.positions[p++] = y1 - r;
				this.positions[p++] = x1 + r;
				this.positions[p++] = y1 - r;
				this.positions[p++] = x1 + r;
				this.positions[p++] = y1 + r;
				this.positions[p++] = x1 + r;
				this.positions[p++] = y1 + r;
				this.positions[p++] = x1 - r;
				this.positions[p++] = y1 + r;
				this.positions[p++] = x1 - r;
				this.positions[p++] = y1 - r;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.5;
			}

			if(M[this.PO_SIZES[M[O_FORM + si]] + si + H_IS_JOINABLE]) {
				let r = 0.01;
				this.positions[p++] = x0 - r;
				this.positions[p++] = y0 - r;
				this.positions[p++] = x0 + r;
				this.positions[p++] = y0 - r;
				this.positions[p++] = x0 + r;
				this.positions[p++] = y0 + r;
				this.positions[p++] = x0 + r;
				this.positions[p++] = y0 + r;
				this.positions[p++] = x0 - r;
				this.positions[p++] = y0 + r;
				this.positions[p++] = x0 - r;
				this.positions[p++] = y0 - r;
				this.texCoords[c++] = 0.25;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.25;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.25;
				this.texCoords[c++] = 0.75;

				this.positions[p++] = x1 - r;
				this.positions[p++] = y1 - r;
				this.positions[p++] = x1 + r;
				this.positions[p++] = y1 - r;
				this.positions[p++] = x1 + r;
				this.positions[p++] = y1 + r;
				this.positions[p++] = x1 + r;
				this.positions[p++] = y1 + r;
				this.positions[p++] = x1 - r;
				this.positions[p++] = y1 + r;
				this.positions[p++] = x1 - r;
				this.positions[p++] = y1 - r;
				this.texCoords[c++] = 0.25;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.25;
				this.texCoords[c++] = 1.0;
				this.texCoords[c++] = 0.25;
				this.texCoords[c++] = 0.75;
			}
		} else if(M[O_FORM + si] == this.AABB_FORM){
			this.positions[p++] = M[O_MIN_X + si];
			this.positions[p++] = M[O_MIN_Y + si];
			this.positions[p++] = M[O_MAX_X + si];
			this.positions[p++] = M[O_MIN_Y + si];
			this.positions[p++] = M[O_MAX_X + si];
			this.positions[p++] = M[O_MAX_Y + si];
			this.positions[p++] = M[O_MAX_X + si];
			this.positions[p++] = M[O_MAX_Y + si];
			this.positions[p++] = M[O_MIN_X + si];
			this.positions[p++] = M[O_MAX_Y + si];
			this.positions[p++] = M[O_MIN_X + si];
			this.positions[p++] = M[O_MIN_Y + si];

			let ti = this.PO_SIZES[M[O_FORM + si]] + si + H_R;
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 1];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 1];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti + 2];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 3];
			this.texCoords[c++] = M[ti];
			this.texCoords[c++] = M[ti + 1];


		} else if(M[O_FORM + si] == this.POLYGON_FORM){
			let vPtr = O_NUM_VERTICES + si + 1;
			let v0x = M[V_WX + vPtr];
			let v0y = M[V_WY + vPtr];
			vPtr += this.V_SIZE;
			let ti = M[O_USERFLOATS_PTR + si] + H_R;
			for(let len = vPtr + (M[O_NUM_VERTICES + si] - 2) * this.V_SIZE; vPtr < len; vPtr += this.V_SIZE){
				this.positions[p++] = v0x;
				this.positions[p++] = v0y;
				this.positions[p++] = M[V_WX + vPtr];
				this.positions[p++] = M[V_WY + vPtr];
				this.positions[p++] = M[V_WX + vPtr + this.V_SIZE];
				this.positions[p++] = M[V_WY + vPtr + this.V_SIZE];

				this.texCoords[c++] = M[ti];
				this.texCoords[c++] = M[ti + 1];
				this.texCoords[c++] = M[ti];
				this.texCoords[c++] = M[ti + 1];
				this.texCoords[c++] = M[ti];
				this.texCoords[c++] = M[ti + 1];
			}
			//debugPoints.push([M[O_TX + si], M[O_TY + si]]);
		}
	}

	let len = tempPolygon.length - 1;
	if(len > -1){
		let tex = null;
		debugPoints.push([tempPolygon[0][0], tempPolygon[0][1]]);
		debugPoints.push([tempPolygon[len][0], tempPolygon[len][1]]);
		for(let v = 1; v < len; ++v){
			debugPoints.push([tempPolygon[v][0], tempPolygon[v][1]]);
			this.positions[p++] = tempPolygon[0][0];
			this.positions[p++] = tempPolygon[0][1];
			this.positions[p++] = tempPolygon[v][0];
			this.positions[p++] = tempPolygon[v][1];
			this.positions[p++] = tempPolygon[v + 1][0];
			this.positions[p++] = tempPolygon[v + 1][1];

			this.texCoords[c++] = WHITE_TC[0];
			this.texCoords[c++] = WHITE_TC[1];
			this.texCoords[c++] = WHITE_TC[0];
			this.texCoords[c++] = WHITE_TC[1];
			this.texCoords[c++] = WHITE_TC[0];
			this.texCoords[c++] = WHITE_TC[1];
		}
	}

	if(debugPoints.length){
		for(const d of debugPoints){
			this.positions[p++] = d[0];
			this.positions[p++] = d[1];
			this.positions[p++] = d[0] + 0.02;
			this.positions[p++] = d[1];
			this.positions[p++] = d[0];
			this.positions[p++] = d[1]+ 0.02;

			this.texCoords[c++] = ORANGE_TC[0];
			this.texCoords[c++] = ORANGE_TC[1];
			this.texCoords[c++] = ORANGE_TC[0];
			this.texCoords[c++] = ORANGE_TC[1];
			this.texCoords[c++] = ORANGE_TC[0];
			this.texCoords[c++] = ORANGE_TC[1];
		}
		debugPoints.splice(0);
	}


	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions.subarray(0, p), this.gl.STREAM_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordsBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, this.texCoords.subarray(0, c), this.gl.STREAM_DRAW);
	this.gl.drawArrays(this.gl.TRIANGLES, 0, p * 0.5);
};