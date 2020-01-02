"use strict";
var canvas = document.getElementById("game");

pw.gl = canvas.getContext("webgl");
if(!pw.gl) console.log("aint no webgl on this b");
else console.log("webgl be workin dawg");

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
	precision lowp float;
	uniform sampler2D u_sampler;
	varying vec2 v_tex_coords;
	void main() {
		gl_FragColor = texture2D(u_sampler, v_tex_coords);
		if(gl_FragColor.a == 0.0) discard;
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

let inputTexture = document.getElementById("inputTexture");
inputTexture.style.display = "none";

inputTexture.onchange = () => {
	inputTexture.style.display = "none";
	let img = document.createElement("img");
	img.onload = () => {createTexture(img)};
	let rd = new FileReader();
	rd.onload = (e) => {img.src = e.target.result;};
	rd.readAsDataURL(inputTexture.files[0]);
}

(function(){
	let img = document.createElement("img");
	img.onload = () => {
		try {
			createTexture(img);
		} catch {
			inputTexture.style.display = "block";
		}
	};
	img.src = "newestTex.png";
})();

function createTexture(pixels){
	const texture = pw.gl.createTexture();
	pw.gl.bindTexture(pw.gl.TEXTURE_2D, texture);
	
	pw.gl.texImage2D(pw.gl.TEXTURE_2D, 0, pw.gl.RGBA, pw.gl.RGBA, pw.gl.UNSIGNED_BYTE, pixels);
	//pw.gl.generateMipmap(pw.gl.TEXTURE_2D);
	pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_MIN_FILTER, pw.gl.NEAREST);
	pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_MAG_FILTER, pw.gl.NEAREST);
	pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_WRAP_S, pw.gl.CLAMP_TO_EDGE);
	pw.gl.texParameteri(pw.gl.TEXTURE_2D, pw.gl.TEXTURE_WRAP_T, pw.gl.CLAMP_TO_EDGE);
	pw.gl.activeTexture(pw.gl.TEXTURE0);
	pw.gl.uniform1i(pw.U_SAMPLER, 0);

	//new
	//pw.gl.disable(pw.gl.DEPTH_TEST);
	//pw.gl.enable(pw.gl.BLEND);
	//pw.gl.blendFunc(pw.gl.SRC_ALPHA, pw.gl.ONE);
	return texture;
}


pw.positions = new Float32Array(6000);
pw.texCoords = new Float32Array(6000);
/*
pw.aabbPositions = new Float32Array(24);
pw.aabbColors = new Float32Array(36);
*/

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
let debugPoints = [];

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

const GREEN_TC  = [0.625, 0.767, 0.625, 0.767];
const GRAY_TC  = [0.625, 0.803, 0.625, 0.803];
const AQUA_TC  = [0.625, 0.839, 0.625, 0.839];
const WHITE_TC  = [0.625, 0.875, 0.625, 0.875];
const ORANGE_TC  = [0.625, 0.911, 0.625, 0.911];
const DARK_ORANGE_TC  = [0.625, 0.946, 0.625, 0.946];
const BLUE_TC = [0.625, 0.982, 0.625, 0.982];
//const DR_TC  = [];

pw.render = function() {
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
		if(this.M[O_FORM + si] == this.CIRCLE_FORM){
			let rc = this.M[O_RADIUS + si] * this.M[O_COS + si];
			let rs = this.M[O_RADIUS + si] * this.M[O_SIN + si];
			let x0 = rs - rc + this.M[O_TX + si];
			let y0 = -rc - rs + this.M[O_TY + si];
			let x2 = rc - rs + this.M[O_TX + si];
			let y2 = rc + rs + this.M[O_TY + si];
			this.positions[p++] = x0;
			this.positions[p++] = y0;
			this.positions[p++] = rc + rs + this.M[O_TX + si];
			this.positions[p++] = rs - rc + this.M[O_TY + si];
			this.positions[p++] = x2;
			this.positions[p++] = y2;
			this.positions[p++] = x2;
			this.positions[p++] = y2;
			this.positions[p++] = -rc - rs + this.M[O_TX + si];
			this.positions[p++] = rc - rs + this.M[O_TY + si];
			this.positions[p++] = x0;
			this.positions[p++] = y0;

			let ti = this.PO_SIZES[this.M[O_FORM + si]] + si + H_R;
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 1];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 1];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 1];

			if(this.M[this.PO_SIZES[this.M[O_FORM + si]] + si + H_IS_JOINABLE]){
				for(let i = 0; i < 4; ++i){
					//let x = WHEEL_JOINABLES[i][0] * this.M[O_COS + si] - WHEEL_JOINABLES[i][1] * this.M[O_SIN + si] + this.M[O_TX + si];
					//let y = WHEEL_JOINABLES[i][1] * this.M[O_COS + si] + WHEEL_JOINABLES[i][0] * this.M[O_SIN + si] + this.M[O_TY + si];
					let r = pw.JOINABLE_RADIUS;
					rc = (this.M[O_RADIUS + si] - r) * this.M[O_COS + si];
					rs = (this.M[O_RADIUS + si] - r) * this.M[O_SIN + si];
					let x = this.WHEEL_J[i][0] * rc - this.WHEEL_J[i][1] * rs + this.M[O_TX + si];
					let y = this.WHEEL_J[i][1] * rc + this.WHEEL_J[i][0] * rs + this.M[O_TY + si];
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
			
		} else if(this.M[O_FORM + si] == this.PLANE_FORM){
			let xe = -this.M[O_UY + si] * this.M[O_HALF_WIDTH + si];
			let ye = this.M[O_UX + si] * this.M[O_HALF_WIDTH + si];
			let x0 = this.M[O_W0X + si];
			let y0 = this.M[O_W0Y + si];
			let x1 = this.M[O_W1X + si];
			let y1 = this.M[O_W1Y + si];
			
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

			let ti = this.PO_SIZES[this.M[O_FORM + si]] + si + H_R;
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 1];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 1];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 1];

			if(this.M[O_TYPE + si] == pw.FIXED_TYPE){
				let r = this.M[O_HALF_WIDTH + si];
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
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.75;
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
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.75;
				this.texCoords[c++] = 0.5;
				this.texCoords[c++] = 0.5;
			}

			if(this.M[this.PO_SIZES[this.M[O_FORM + si]] + si + H_IS_JOINABLE]) {
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
		} else if(this.M[O_FORM + si] == this.AABB_FORM){
			this.positions[p++] = this.M[O_MIN_X + si];
			this.positions[p++] = this.M[O_MIN_Y + si];
			this.positions[p++] = this.M[O_MAX_X + si];
			this.positions[p++] = this.M[O_MIN_Y + si];
			this.positions[p++] = this.M[O_MAX_X + si];
			this.positions[p++] = this.M[O_MAX_Y + si];
			this.positions[p++] = this.M[O_MAX_X + si];
			this.positions[p++] = this.M[O_MAX_Y + si];
			this.positions[p++] = this.M[O_MIN_X + si];
			this.positions[p++] = this.M[O_MAX_Y + si];
			this.positions[p++] = this.M[O_MIN_X + si];
			this.positions[p++] = this.M[O_MIN_Y + si];

			let ti = this.PO_SIZES[this.M[O_FORM + si]] + si + H_R;
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 1];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 1];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti + 2];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 3];
			this.texCoords[c++] = this.M[ti];
			this.texCoords[c++] = this.M[ti + 1];


		} else if(this.M[O_FORM + si] == this.POLYGON_FORM){
			let vPtr = O_NUM_VERTICES + si + 1;
			let v0x = this.M[V_WX + vPtr];
			let v0y = this.M[V_WY + vPtr];
			vPtr += this.V_SIZE;
			let ti = this.M[O_USERFLOATS_PTR + si] + H_R;
			for(let len = vPtr + (this.M[O_NUM_VERTICES + si] - 2) * this.V_SIZE; vPtr < len; vPtr += this.V_SIZE){
				this.positions[p++] = v0x;
				this.positions[p++] = v0y;
				this.positions[p++] = this.M[V_WX + vPtr];
				this.positions[p++] = this.M[V_WY + vPtr];
				this.positions[p++] = this.M[V_WX + vPtr + this.V_SIZE];
				this.positions[p++] = this.M[V_WY + vPtr + this.V_SIZE];

				this.texCoords[c++] = this.M[ti];
				this.texCoords[c++] = this.M[ti + 1];
				this.texCoords[c++] = this.M[ti];
				this.texCoords[c++] = this.M[ti + 1];
				this.texCoords[c++] = this.M[ti];
				this.texCoords[c++] = this.M[ti + 1];
			}
			//debugPoints.push([this.M[O_TX + si], this.M[O_TY + si]]);
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

			/*
			
		} else if(this.M[O_FORM + si] == this.AABB_FORM){
			if(sandboxMode){
				this.pointPositions[pp++] = this.M[O_MIN_X + si];
				this.pointPositions[pp++] = this.M[O_MIN_Y + si];
				this.pointColors.set(this.JOINABLE_COLOR, pc += 3);
				this.pointSizes[ps++] = JOINABLE_RADIUS;
				this.pointPositions[pp++] = this.M[O_MAX_X + si];
				this.pointPositions[pp++] = this.M[O_MAX_Y + si];
				this.pointColors.set(this.JOINABLE_COLOR, pc += 3);
				this.pointSizes[ps++] = JOINABLE_RADIUS;
			}
			this.aabbPositions[ap++] = this.M[O_MIN_X + si];
			this.aabbPositions[ap++] = this.M[O_MIN_Y + si];
			this.aabbPositions[ap++] = this.M[O_MIN_X + si];
			this.aabbPositions[ap++] = this.M[O_MAX_Y + si];
			this.aabbPositions[ap++] = this.M[O_MAX_X + si];
			this.aabbPositions[ap++] = this.M[O_MAX_Y + si];
			this.aabbPositions[ap++] = this.M[O_MAX_X + si];
			this.aabbPositions[ap++] = this.M[O_MAX_Y + si];
			this.aabbPositions[ap++] = this.M[O_MAX_X + si];
			this.aabbPositions[ap++] = this.M[O_MIN_Y + si];
			this.aabbPositions[ap++] = this.M[O_MIN_X + si];
			this.aabbPositions[ap++] = this.M[O_MIN_Y + si];

			for(let ind = 0, ci = this.PO_SIZES[this.M[O_FORM + si]] + si + H_R; ind < 6; ++ind){
				this.aabbColors[ac++] = this.M[ci];
				this.aabbColors[ac++] = this.M[ci + 1];
				this.aabbColors[ac++] = this.M[ci + 2];
			}

			let color = this.PO_COLORS[this.M[this.PO_SIZES[this.M[O_FORM + si]] + si]];
			this.aabbColors.set(color, ac += 3);
			this.aabbColors.set(color, ac += 3);
			this.aabbColors.set(color, ac += 3);
			this.aabbColors.set(color, ac += 3);
			this.aabbColors.set(color, ac += 3);
			this.aabbColors.set(color, ac += 3);
		} else{
			console.error("ohh boy");
		}
	}*/