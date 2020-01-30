"use strict";
/* TODO
	- implement block solver for multiple contacts
	- consolidate physics object PLANE_FORM into POLYGON_FORM for simplification purposes
*/
// PRE-ALPHA
/* GLOSSARY
	- physics object: actual objects that are simulated by the physics engine. For now this is circles, planes and convex polygons.
*/




/*
	This physics engine is made specifically for use in the browser and thus written in JS (perhaps ported to WASM in the future).
	Due to most JS engines being slow accessing variables inside objects relative to native running code I am experimenting
	using a large typedArray (Float64Array) to store data rather than objects to improve performance. There is ~20% speed boost in
	V8 so I am sticking with it for now. I emulated C/C++ style of manual memory management with typedArray serving as memory. For
	each physics object and constraint created elements (floats) are allocated in a contiguous block in the typedArray and assigned
	a pointer which is simply the index of the first element of the allocated elements that can be used to hold arbitrary floats.
	The pointer plus an offset is used to access elements.
*/
// physics object offsets
// temp
const O_NUM_FLOATS = -1;
const O_FORM = 0;
const O_TYPE = 1;
const O_P = 2;
const O_M = 3;
const O_M_INV = 4;
const O_I = 5;
const O_I_INV = 6;
const O_GROUP = 7;
const O_US = 8;
const O_UK = 9;
const O_VM = 10;
const O_WM = 11;
const O_VX = 12;
const O_VY = 13;
const O_W = 14;
const O_TX = 15;
const O_TY = 16;
const O_COS = 17;
const O_SIN = 18;
const O_O = 19;
const O_USERFLOATS_PTR = 20;

// CIRCLE_FORM only offsets
const O_RADIUS = 21;

// AABB_FORM only offsets
const O_MIN_X = 21;
const O_MIN_Y = 22;
const O_MAX_X = 23;
const O_MAX_Y = 24;

// PLANE_FORM only offsets
const O_L = 21;
const O_L_INV = 22;
const O_L0X = 23;
const O_L0Y = 24;
const O_L1X = 25;
const O_L1Y = 26;
const O_W0X = 27;
const O_W0Y = 28;
const O_W1X = 29;
const O_W1Y = 30;
const O_UX = 31;
const O_UY = 32;
const O_HALF_WIDTH = 33;


// POLYGON_FORM only offsets
const O_NUM_VERTICES = 21;

// vertex offsets
const V_LX = 0;
const V_LY = 1;
const V_WX = 2;
const V_WY = 3;
const V_UX = 4;
const V_UY = 5;
const V_L = 6;
const V_L_INV = 7;




// constraint offsets
const C_FORM = 0;
const C_TYPE = 1;
const C_PO_PTR_A = 2;
const C_PO_PTR_B = 3;
const C_US = 4;
const C_UK = 5;


const C_ACTIVE = 6;
const C_RAX = 7;
const C_RAY = 8;
const C_RBX = 9;
const C_RBY = 10;

const C_JN = 11;
const C_JT = 12;

// COLLISION_FORM only
const C_NX = 13;
const C_NY = 14;
const C_DIST = 15;
const C_RNA = 16;
const C_RNB = 17;
const C_M = 18;
const C_RTA = 19;
const C_RTB = 20;
const C_MT = 21;

/*
const C_ACTIVE = 22;
const C_NX = 23;
const C_NY = 24;
const C_DIST = 25;
const C_RAX = 26;
const C_RAY = 27;
const C_RBX = 28;
const C_RBY = 29;
const C_JN = 30;
const C_JT = 31;
const C_RNA = 32;
const C_RNB = 33;
const C_M = 34;
const C_RTA = 35;
const C_RTB = 36;
const C_MT = 37;
*/

// JOINT_FORM only
const C_LAX = 13;
const C_LAY = 14;
const C_LBX = 15;
const C_LBY = 16;
const C_IS_MOTOR = 17;
const C_MW = 18;
const C_M_MAX_T = 19;
const C_SUM_T = 20;
const C_M_I = 21;
const C_JX = 22;
const C_JY = 23;


//const C_RMB = 19;
//const C_RMA_INV = 20;
//const C_RMA = 20;
//const C_RMB_INV = 21;


/*
const C_FORM = 0;
const C_TYPE = 1;
const C_PO_PTR_A = 2;
const C_PO_PTR_B = 3;
const C_US = 4;
const C_UK = 5;
const C_NUM_





const C_ACTIVE = 6;
const C_RAX = 7;
const C_RAY = 8;
const C_RBX = 9;
const C_RBY = 10;

const C_JN = 11;
const C_JT = 12;

// this.COLLISION_FORM only
const C_NX = 13;
const C_NY = 14;
const C_DIST = 15;
const C_RNA = 16;
const C_RNB = 17;
const C_M = 18;
const C_RTA = 19;
const C_RTB = 20;
const C_MT = 21;

/*
const C_ACTIVE = 22;
const C_NX = 23;
const C_NY = 24;
const C_DIST = 25;
const C_RAX = 26;
const C_RAY = 27;
const C_RBX = 28;
const C_RBY = 29;
const C_JN = 30;
const C_JT = 31;
const C_RNA = 32;
const C_RNB = 33;
const C_M = 34;
const C_RTA = 35;
const C_RTB = 36;
const C_MT = 37;
*/
/*
// revolute only
const C_LAX = 13;
const C_LAY = 14;
const C_LBX = 15;
const C_LBY = 16;
const C_IS_MOTOR = 17;
const C_MW = 18;
const C_M_MAX_T = 19;
const C_SUM_T = 20;
const C_M_I = 21;
//const C_RMB = 19;
//const C_RMA_INV = 20;
//const C_RMA = 20;
//const C_RMB_INV = 21;
*/


class MemoryManager {
	constructor(memory){
		let len = memory.length;
		if(len > 65535) console.warn("Are you sure?");
		this.memory = memory;
		this.memory[0] = -len;
		this.memory[this.memory.length - 1] = len;
	}

	alloc(size){
		if(size < 1) throw "Size must be atleast 1";
		if(!Number.isInteger(size)) throw "Size must be representable as integer. Size passed: " + size;
		size += 2;
		for(let ptr = 0, len = this.memory.length; ptr < len; ptr += Math.abs(this.memory[ptr])){
			if(!Number.isInteger(this.memory[ptr])) throw "this.memory[ptr] = " + this.memory[ptr] + " not representable as integer.";
			if(-this.memory[ptr] >= size) {
				if(-this.memory[ptr] > size){
					this.memory[ptr + size] = this.memory[ptr] + size;
					this.memory[ptr - this.memory[ptr] - 1] = -this.memory[ptr + size];
				}
				this.memory[ptr] = size;
				this.memory[ptr + size - 1] = -size;
				console.log(size + " floats allocated at adress: " + ptr);
				return ++ptr;
			}
		}
		throw "Memory failure";
	}

	free(ptr){
		if(!Number.isInteger(ptr)) throw "Ptr must be representable as integer, ptr = " + ptr;
		if(ptr < 0) throw "Unable to free ptr less than 0, ptr = " + ptr;
		--ptr;
		console.log("freeing ptr: " + ptr);
		if(this.memory[ptr] < 20) console.warn("freeing ptr with size: " + this.memory[ptr]);
		let start = ptr;
		let end = this.memory[ptr] + ptr;
		if(this.memory[end] < 0) end -= this.memory[end];
		if(start > 0 && this.memory[start - 1] > 0) start -= this.memory[start - 1];
		let size = end - start;
		if(!Number.isInteger(size)) throw "Size must be representable as integer: " + size;
		this.memory[start] = -size;
		this.memory[end - 1] = size;
		// temp
		this.memory.fill(0, start + 1, end - 1);
	}

	freeAll(){
		let len = this.memory.length;
		this.memory[0] = -len;
		this.memory[this.memory.length - 1] = len;
		// temp
		//this.memory.fill(0);
	}
	/*
	set(pointer, offset, value){
		this.data[pointer + offset] = value;
	}

	get(pointer, offset){
		return this.data[pointer + offset];
	}
	*/
}

const pw = {
	G: -0.004,
	//MIN_AA: 0.0,
	VELOCITY_ITERATIONS: 64,



	//temp
	POSITION_ITERATIONS: 0,



	POLYGON_SKIN: 0.005,
	TOTAL_ITER: this.VELOCITY_ITERATIONS + this.POSITION_ITERATIONS,
	//isVelocityIter = true,
	unsolved: true,
	warmStarting: true,

	update(){
		// scope M to function for faster access
		let M = this.M;

		// integrate external forces (gravity and physics object resistance)
		for(let i = 0, len = this.poTotal; i < len; ++i){
			let ptr = this.PO_PTRS[i];
			if(M[O_TYPE + ptr] == this.FIXED_TYPE) continue;
			M[O_VY + ptr] += this.G;
			M[O_VX + ptr] *= M[O_VM + ptr];
			M[O_VY + ptr] *= M[O_VM + ptr];
			M[O_W + ptr] *= M[O_WM + ptr];
		}


		// initialize constraints
		for(let ptr = 0, len = this.cTotal; ptr < len; ++ptr){
			let si = this.C_PTRS[ptr];
			let asi = M[C_PO_PTR_A + si];
			let bsi = M[C_PO_PTR_B + si];

			if(M[C_TYPE + si] === this.COLLISION_TYPE){
				let collisionData = this.getCollisionData(si, asi, bsi);
				// temp
				let cdLen = 7;
				if(collisionData.length == 14) cdLen = 14;
				// never updated to accomadate C_JT
				for(let i = si, c = 0; c < cdLen; i += 16, c += 7){
																																// tune
					if(!collisionData || collisionData[0 + c] === null || collisionData[6 + c] > 1.0){
						M[C_ACTIVE + i] = 0;
						M[C_JN + i] = 0.0;
						M[C_JT + i] = 0.0;
						continue;
					}
					// normal vector
					M[C_NX + i] = collisionData[0 + c];
					M[C_NY + i] = collisionData[1 + c];
					// distance between collision vertices
					M[C_DIST + i] = collisionData[6 + c];
					// vectors from center of masses to collision vertex (radius vectors)
					M[C_RAX + i] = collisionData[2 + c] - M[O_TX + asi];
					M[C_RAY + i] = collisionData[3 + c] - M[O_TY + asi];
					M[C_RBX + i] = collisionData[4 + c] - M[O_TX + bsi];
					M[C_RBY + i] = collisionData[5 + c] - M[O_TY + bsi];

					M[C_ACTIVE + i] = 1;

					/*
					if(debugPoints.length < 60){
						debugPoints.push([[collisionData[2 + c], collisionData[3 + c]], white]);
						debugPoints.push([[collisionData[4 + c], collisionData[5 + c]], white]);
					}
					*/
					// cross product of radius vector and normal vector
					M[C_RNA + i] = M[C_RAX + i] * collisionData[1 + c] - M[C_RAY + i] * collisionData[0 + c];
					M[C_RNB + i] = M[C_RBX + i] * collisionData[1 + c] - M[C_RBY + i] * collisionData[0 + c];
					// total inverse "mass" in normal reference
					M[C_M + i] = 1.0 / (M[O_M_INV + asi] + M[O_M_INV + bsi] + M[C_RNA + i] * M[C_RNA + i] * M[O_I_INV + asi] + M[C_RNB + i] * M[C_RNB + i] * M[O_I_INV + bsi]);
					// dot product of radius vector and tangential vector
					M[C_RTA + i] = M[C_RAX + i] * collisionData[0 + c] + M[C_RAY + i] * collisionData[1 + c];
					M[C_RTB + i] = M[C_RBX + i] * collisionData[0 + c] + M[C_RBY + i] * collisionData[1 + c];
					// total inverse "mass" in tangential reference
					M[C_MT + i] = 1.0 / (M[O_M_INV + asi] + M[O_M_INV + bsi] + M[C_RTA + i] * M[C_RTA + i] * M[O_I_INV + asi] + M[C_RTB + i] * M[C_RTB + i] * M[O_I_INV + bsi]);

					if(this.warmStarting){
						let jx = M[C_JN + i] * M[C_NX + i] - M[C_JT + i] * M[C_NY + i];
						let jy = M[C_JN + i] * M[C_NY + i] + M[C_JT + i] * M[C_NX + i];
						if(M[O_TYPE + asi] == this.MOVABLE_TYPE){
							M[O_VX + asi] -= jx * M[O_M_INV + asi];
							M[O_VY + asi] -= jy * M[O_M_INV + asi];
							M[O_W + asi] -= (M[C_JN + i] * M[C_RNA + i] + M[C_JT + i] * M[C_RTA + i]) * M[O_I_INV + asi];
						}
						if(M[O_TYPE + bsi] == this.MOVABLE_TYPE){
							M[O_VX + bsi] += jx * M[O_M_INV + bsi];
							M[O_VY + bsi] += jy * M[O_M_INV + bsi];
							M[O_W + bsi] += (M[C_JN + i] * M[C_RNB + i] + M[C_JT + i] * M[C_RTB + i]) * M[O_I_INV + bsi];
						}
					} else {
						M[C_JN + i] = 0.0;
						M[C_JT + i] = 0.0;
					}

				}
			} else if(M[C_TYPE + si] === this.JOINT_TYPE){
				// vectors from center of masses to joint vertices (radius vectors)
				M[C_RAX + si] = M[C_LAX + si] * M[O_COS + asi] - M[C_LAY + si] * M[O_SIN + asi];
				M[C_RAY + si] = M[C_LAY + si] * M[O_COS + asi] + M[C_LAX + si] * M[O_SIN + asi];
				M[C_RBX + si] = M[C_LBX + si] * M[O_COS + bsi] - M[C_LBY + si] * M[O_SIN + bsi];
				M[C_RBY + si] = M[C_LBY + si] * M[O_COS + bsi] + M[C_LBX + si] * M[O_SIN + bsi];

				if(this.warmStarting){
					if(M[O_TYPE + asi] == this.MOVABLE_TYPE){
						M[O_VX + asi] -= M[C_JX + si] * M[O_M_INV + asi];
						M[O_VY + asi] -= M[C_JY + si] * M[O_M_INV + asi];
						M[O_W + asi] -= ((M[C_RAX + si] * M[C_JY + si] - M[C_RAY + si] * M[C_JX + si]) + M[C_SUM_T + si]) * M[O_I_INV + asi];
					}
					if(M[O_TYPE + bsi] == this.MOVABLE_TYPE){
						M[O_VX + bsi] += M[C_JX + si] * M[O_M_INV + bsi];
						M[O_VY + bsi] += M[C_JY + si] * M[O_M_INV + bsi];
						M[O_W + bsi] += ((M[C_RBX + si] * M[C_JY + si] - M[C_RBY + si] * M[C_JX + si]) + M[C_SUM_T + si]) * M[O_I_INV + bsi];
					}
				} else {
					M[C_SUM_T + si] = 0.0;
					M[C_JX + si] = 0.0;
					M[C_JY + si] = 0.0;
				}

			}
		}
		//temp
		//console.log("cons = " + cons);
		// solve velocity constraints
		let iter = 0
		for(this.unsolved = true; this.unsolved && iter < this.VELOCITY_ITERATIONS; ++iter){





			// IMPORTANT EXPERIMENTAL
			this.unsolved = false;






			for(let ptr = 0, len = this.cTotal; ptr < len; ++ptr){
				let si = this.C_PTRS[ptr];


				let asi = M[C_PO_PTR_A + si];
				let bsi = M[C_PO_PTR_B + si];
				if(M[C_TYPE + si] === this.COLLISION_TYPE){
					// TODO implement block solver from GDC Erin Catto video
					let len = 1;
					if(M[C_FORM + si] == this.SURFACES_FORM || M[C_FORM + si] == this.SURFACE_POLYGON_FORM || M[C_FORM + si] == this.POLYGONS_FORM) len = 2;
					// TODO update i increment?
					for(let i = si, c = 0; c < len; i += 16, c += 1){
						if(M[C_ACTIVE + i] == 0) continue;
						// relative velocity at collsion vertices
						let vxRel = M[O_VX + asi] + M[O_W + asi] * -M[C_RAY + i] - M[O_VX + bsi] - M[O_W + bsi] * -M[C_RBY + i];
						let vyRel = M[O_VY + asi] + M[O_W + asi] * M[C_RAX + i] - M[O_VY + bsi] - M[O_W + bsi] * M[C_RBX + i];
						// tangential impulse (friction)
						let jt = (M[C_NX + i] * vyRel - M[C_NY + i] * vxRel) * M[C_MT + i];
						let oldJt = M[C_JT + i];
						M[C_JT + i] += jt;
						// clamp to max friction calculated by constraint coefficient of friction (only static for now) times accumulated normal impulse
						let maxJt = -M[C_JN + i] * M[C_US + si];
						if(Math.abs(M[C_JT + i]) > maxJt){
							if(jt > 0) M[C_JT + i] = maxJt;
							else M[C_JT + i] = -maxJt;
							jt = M[C_JT + i] - oldJt;
						}
						// integrate tangential impusle
						let jx = jt * -M[C_NY + i];
						let jy = jt * M[C_NX + i];
						if(M[O_TYPE + asi] == this.MOVABLE_TYPE){
							M[O_VX + asi] -= jx * M[O_M_INV + asi];
							M[O_VY + asi] -= jy * M[O_M_INV + asi];
							M[O_W + asi] -= jt * M[C_RTA + i] * M[O_I_INV + asi];
						}
						if(M[O_TYPE + bsi] == this.MOVABLE_TYPE){
							M[O_VX + bsi] += jx * M[O_M_INV + bsi];
							M[O_VY + bsi] += jy * M[O_M_INV + bsi];
							M[O_W + bsi] += jt * M[C_RTB + i] * M[O_I_INV + bsi];
						}
						// update relative velocity
						vxRel = M[O_VX + asi] + M[O_W + asi] * -M[C_RAY + i] - M[O_VX + bsi] - M[O_W + bsi] * -M[C_RBY + i];
						vyRel = M[O_VY + asi] + M[O_W + asi] * M[C_RAX + i] - M[O_VY + bsi] - M[O_W + bsi] * M[C_RBX + i];
						// normal impulse
						let jn = ((M[C_NX + i] * vxRel + M[C_NY + i] * vyRel) + M[C_DIST + i]) * M[C_M + i];
						let oldJn = M[C_JN + i];
						M[C_JN + i] += jn;
						// clamp to insure accumulated normal impulse (M[C_JN + i]) stays negative (push only)
						if(M[C_JN + i] > 0) M[C_JN + i] = 0;
						jn = M[C_JN + i] - oldJn;
						/* It's somewhat likely oldJn was already 0 because there was never a negative impulse
							(due to using speculative contacts), thus check jn to save unnecessary work. */
						if(jn) {
							this.unsolved = true;
							// integrate impusle
							let jx = jn * M[C_NX + i];
							let jy = jn * M[C_NY + i];
							if(M[O_TYPE + asi] == this.MOVABLE_TYPE){
								M[O_VX + asi] -= jx * M[O_M_INV + asi];
								M[O_VY + asi] -= jy * M[O_M_INV + asi];
								M[O_W + asi] -= jn * M[C_RNA + i] * M[O_I_INV + asi];
							}
							if(M[O_TYPE + bsi] == this.MOVABLE_TYPE){
								M[O_VX + bsi] += jx * M[O_M_INV + bsi];
								M[O_VY + bsi] += jy * M[O_M_INV + bsi];
								M[O_W + bsi] += jn * M[C_RNB + i] * M[O_I_INV + bsi];
							}
						}
					}

					// revolute joint solver
				} else if(M[C_TYPE + si] == this.JOINT_TYPE){
					if(M[C_IS_MOTOR + si]){
						// solve motor sub-constraint
						// relative angular velocity minus desired velocity
						let aa = M[O_W + asi] - M[O_W + bsi] - M[C_MW + si];
						// compute motor impulse
						let jm = aa * M[C_M_I + si];
						// clamp impulse to max torque
						let oldJm = M[C_SUM_T + si];
						M[C_SUM_T + si] += jm;
						if(Math.abs(M[C_SUM_T + si]) > M[C_M_MAX_T + si]) {
							M[C_SUM_T + si] = M[C_M_MAX_T + si] * Math.sign(jm);
							jm = M[C_SUM_T + si] - oldJm;
						}
						// integrate impusle
						M[O_W + asi] -= jm * M[O_I_INV + asi];
						M[O_W + bsi] += jm * M[O_I_INV + bsi];
					}
					// relative velocity at joint vertices
					let vxRel = M[O_VX + asi] + M[O_W + asi] * -M[C_RAY + si] - M[O_VX + bsi] - M[O_W + bsi] * -M[C_RBY + si];
					let vyRel = M[O_VY + asi] + M[O_W + asi] * M[C_RAX + si] - M[O_VY + bsi] - M[O_W + bsi] * M[C_RBX + si];
					// if no relative velocity then done
					if(!vxRel && !vyRel) continue;
					this.unsolved = true;
					// length of relative velocity vector
					let vn = Math.sqrt(vxRel * vxRel + vyRel * vyRel);
					// normalize vectors
					vxRel /= vn;
					vyRel /= vn;
					// the cross product of radius vector and relative velocity vector
					let rna = M[C_RAX + si] * vyRel - M[C_RAY + si] * vxRel;
					let rnb = M[C_RBX + si] * vyRel - M[C_RBY + si] * vxRel;
					// total "mass" in constraint reference
					let mInv = M[O_M_INV + asi] + M[O_M_INV + bsi] + rna * rna * M[O_I_INV + asi] + rnb * rnb * M[O_I_INV + bsi];
					let j = vn / mInv;
					// TODO implement revolute friction?
					// integrate impulse
					let jx = j * vxRel;
					let jy = j * vyRel;
					// accumulate impulse
					/* Unlike the collision constraint save impulses as vector (for warm-starting) rather than
						scalar because the direction of the vector changes throughout the step. */
					M[C_JX + si] += jx;
					M[C_JY + si] += jy;
					if(M[O_TYPE + asi] == this.MOVABLE_TYPE){
						M[O_VX + asi] -= jx * M[O_M_INV + asi];
						M[O_VY + asi] -= jy * M[O_M_INV + asi];
						M[O_W + asi] -= j * rna * M[O_I_INV + asi];
					}
					if(M[O_TYPE + bsi] == this.MOVABLE_TYPE){
						M[O_VX + bsi] += jx * M[O_M_INV + bsi];
						M[O_VY + bsi] += jy * M[O_M_INV + bsi];
						M[O_W + bsi] += j * rnb * M[O_I_INV + bsi];
					}
				}
			}
		}
		//console.log("vi = " + iter);

		// integrate velocities
		for(let i = 0, ptr = this.PO_PTRS[i], len = this.poTotal; i < len; ++i, ptr = this.PO_PTRS[i]){
			//let ptr = this.PO_PTRS[i];
			if(M[O_TYPE + ptr] == this.FIXED_TYPE) continue;
			M[O_TX + ptr] += M[O_VX + ptr];
			M[O_TY + ptr] += M[O_VY + ptr];
			M[O_O + ptr] += M[O_W + ptr];
			M[O_COS + ptr] = Math.cos(M[O_O + ptr]);
			M[O_SIN + ptr] = Math.sin(M[O_O + ptr]);
			this.updateWorldPositions(ptr);
		}

		// solve position constraints
		iter = 0
		for(this.unsolved = true; this.unsolved && iter < this.POSITION_ITERATIONS; ++iter){


			//temp EXPERIEMENTAL
			this.unsolved = false;



			for(let ptr = 0, len = this.cTotal; ptr < len; ++ptr){
				let si = this.C_PTRS[ptr];
				if(!M[C_ACTIVE + si]) continue;
				let asi = M[C_PO_PTR_A + si];
				let bsi = M[C_PO_PTR_B + si];
				if(M[C_TYPE + si] == this.COLLISION_TYPE){
					let len = 7;
					let collisionData = this.getCollisionData(si, asi, bsi);
					if(!collisionData) continue;
					for(let i = si, c = 0; c < len; i += 16, c += 7){
						if(collisionData[6 + c] > 0.0) continue;
						this.unsolved = true;
						// keep no rotation?
						//let rna = (M[O_TY + asi] - collisionData[3 + c]) * collisionData[0 + c] + (collisionData[2 + c] - M[O_TX + asi]) * collisionData[1 + c];
						//let rnb = (M[O_TY + bsi] - collisionData[5 + c]) * collisionData[0 + c] + (collisionData[4 + c] - M[O_TX + bsi]) * collisionData[1 + c];
						//let mInv = M[O_M_INV + asi] + M[O_M_INV + bsi] + rna * rna * M[O_I_INV + asi] + rnb * rnb * M[O_I_INV + bsi];
						let mInv = M[O_M_INV + asi] + M[O_M_INV + bsi];
						// tune?
						//let j = (collisionData[6 + c] * 0.5) / mInv;
						let j = (collisionData[6 + c]) / mInv;
						let jx = j * collisionData[0 + c];
						let jy = j * collisionData[1 + c];
						if(M[O_TYPE + asi] == this.MOVABLE_TYPE) {
							let aax = jx * M[O_M_INV + asi];
							let aay = jy * M[O_M_INV + asi];
							M[O_VX + asi] -= aax;
							M[O_VY + asi] -= aay;
							M[O_TX + asi] -= aax;
							M[O_TY + asi] -= aay;
							// forgot to update angular velocity?
							//M[O_O + asi] -= j * rna * M[O_I_INV + asi];
							//M[O_COS + asi] = Math.cos(M[O_O + asi]);
							//M[O_SIN + asi] = Math.sin(M[O_O + asi]);
							this.updateWorldPositions(asi);
						}
						if(M[O_TYPE + bsi] == this.MOVABLE_TYPE) {
							let abx = jx * M[O_M_INV + bsi];
							let aby = jy * M[O_M_INV + bsi];
							M[O_VX + bsi] += abx;
							M[O_VY + bsi] += aby;
							M[O_TX + bsi] += abx;
							M[O_TY + bsi] += aby;
							// forgot to update angular velocity?
							//M[O_O + bsi] += j * rnb * M[O_I_INV + bsi];
							//M[O_COS + bsi] = Math.cos(M[O_O + bsi]);
							//M[O_SIN + bsi] = Math.sin(M[O_O + bsi]);
							this.updateWorldPositions(bsi);
						}
					}

				} else if(M[C_TYPE + si] == this.JOINT_TYPE){
					M[C_RAX + si] = M[C_LAX + si] * M[O_COS + asi] - M[C_LAY + si] * M[O_SIN + asi];
					M[C_RAY + si] = M[C_LAY + si] * M[O_COS + asi] + M[C_LAX + si] * M[O_SIN + asi];
					M[C_RBX + si] = M[C_LBX + si] * M[O_COS + bsi] - M[C_LBY + si] * M[O_SIN + bsi];
					M[C_RBY + si] = M[C_LBY + si] * M[O_COS + bsi] + M[C_LBX + si] * M[O_SIN + bsi];
					let wax = M[C_RAX + si] + M[O_TX + asi];
					let way = M[C_RAY + si] + M[O_TY + asi];
					let wbx = M[C_RBX + si] + M[O_TX + bsi];
					let wby = M[C_RBY + si] + M[O_TY + bsi];
					if(wax == wbx && way == wby) continue;
					this.unsolved = true;

					let nx = wax - wbx;
					let ny = way - wby;
					let dist = Math.sqrt(nx * nx + ny * ny);
					nx /= dist;
					ny /= dist;
					let rna = M[C_RAX + si] * ny - M[C_RAY + si] * nx;
					let rnb = M[C_RBX + si] * ny - M[C_RBY + si] * nx;
					// total "mass" in the constraint reference
					let mInv = M[O_M_INV + asi] + M[O_M_INV + bsi] + rna * rna * M[O_I_INV + asi] + rnb * rnb * M[O_I_INV + bsi];
					//let mInv = M[O_M_INV + asi] + M[O_M_INV + bsi];
					// tune?
					//let j = (dist * 0.5) / mInv;
					let j = dist / mInv;
					let jx = j * nx;
					let jy = j * ny;

					if(M[O_TYPE + asi] == this.MOVABLE_TYPE) {
						let aax = jx * M[O_M_INV + asi];
						let aay = jy * M[O_M_INV + asi];
						let aaa = j * rna * M[O_I_INV + asi];
						M[O_VX + asi] -= aax;
						M[O_VY + asi] -= aay;
						M[O_W + asi] -= aaa;
						M[O_TX + asi] -= aax;
						M[O_TY + asi] -= aay;
						M[O_O + asi] -= aaa;
						M[O_COS + asi] = Math.cos(M[O_O + asi]);
						M[O_SIN + asi] = Math.sin(M[O_O + asi]);
						this.updateWorldPositions(asi);
					}
					if(M[O_TYPE + bsi] == this.MOVABLE_TYPE) {
						let abx = jx * M[O_M_INV + bsi];
						let aby = jy * M[O_M_INV + bsi];
						let aba = j * rnb * M[O_I_INV + bsi]
						M[O_VX + bsi] += abx;
						M[O_VY + bsi] += aby;
						M[O_W + bsi] += aba;
						M[O_TX + bsi] += abx;
						M[O_TY + bsi] += aby;
						M[O_O + bsi] += aba;
						M[O_COS + bsi] = Math.cos(M[O_O + bsi]);
						M[O_SIN + bsi] = Math.sin(M[O_O + bsi]);
						this.updateWorldPositions(bsi);
					}
				}
			}
		}
		//console.log("pi = " + iter);
	},

	updateWorldPositions(ptr){
		if(this.M[O_TYPE + ptr] == this.FIXED_TYPE) return;
		if(this.M[O_FORM + ptr] == this.PLANE_FORM) {
			this.M[O_W0X + ptr] = (this.M[O_L0X + ptr] * this.M[O_COS + ptr] - this.M[O_L0Y + ptr] * this.M[O_SIN + ptr]) + this.M[O_TX + ptr];
			this.M[O_W0Y + ptr] = (this.M[O_L0Y + ptr] * this.M[O_COS + ptr] + this.M[O_L0X + ptr] * this.M[O_SIN + ptr]) + this.M[O_TY + ptr];
			this.M[O_W1X + ptr] = (this.M[O_L1X + ptr] * this.M[O_COS + ptr] - this.M[O_L1Y + ptr] * this.M[O_SIN + ptr]) + this.M[O_TX + ptr];
			this.M[O_W1Y + ptr] = (this.M[O_L1Y + ptr] * this.M[O_COS + ptr] + this.M[O_L1X + ptr] * this.M[O_SIN + ptr]) + this.M[O_TY + ptr];
			let dx = this.M[O_W1X + ptr] - this.M[O_W0X + ptr];
			let dy = this.M[O_W1Y + ptr] - this.M[O_W0Y + ptr];
			this.M[O_UX + ptr] = dx * this.M[O_L_INV + ptr];
			this.M[O_UY + ptr] = dy * this.M[O_L_INV + ptr];


		} else if(this.M[O_FORM + ptr] == this.POLYGON_FORM){
			let start = O_NUM_VERTICES + ptr;
			let pPtr = start + 1;
			this.M[V_WX + pPtr] = (this.M[V_LX + pPtr] * this.M[O_COS + ptr] - this.M[V_LY + pPtr] * this.M[O_SIN + ptr]) + this.M[O_TX + ptr];
			this.M[V_WY + pPtr] = (this.M[V_LY + pPtr] * this.M[O_COS + ptr] + this.M[V_LX + pPtr] * this.M[O_SIN + ptr]) + this.M[O_TY + ptr];
			
			for(let vPtr = start + 1 + (this.M[O_NUM_VERTICES + ptr] - 1) * this.V_SIZE; vPtr > start; pPtr = vPtr, vPtr -= this.V_SIZE){
				this.M[V_WX + vPtr] = (this.M[V_LX + vPtr] * this.M[O_COS + ptr] - this.M[V_LY + vPtr] * this.M[O_SIN + ptr]) + this.M[O_TX + ptr];
				this.M[V_WY + vPtr] = (this.M[V_LY + vPtr] * this.M[O_COS + ptr] + this.M[V_LX + vPtr] * this.M[O_SIN + ptr]) + this.M[O_TY + ptr];
				this.M[V_UX + vPtr] = (this.M[V_WX + pPtr] - this.M[V_WX + vPtr]) * this.M[V_L_INV + vPtr];
				this.M[V_UY + vPtr] = (this.M[V_WY + pPtr] - this.M[V_WY + vPtr]) * this.M[V_L_INV + vPtr];
			}
		}
			/*
			let nPtr = O_NUM_VERTICES + ptr + 1;
			this.M[V_WX + nPtr] = (this.M[V_LX + nPtr] * this.M[O_COS + ptr] - this.M[V_LY + nPtr] * this.M[O_SIN + ptr]) + this.M[O_TX + ptr];
			this.M[V_WY + nPtr] = (this.M[V_LY + nPtr] * this.M[O_COS + ptr] + this.M[V_LX + nPtr] * this.M[O_SIN + ptr]) + this.M[O_TY + ptr];
			let vPtr = (this.M[O_NUM_VERTICES + ptr] - 1) * this.V_SIZE + nPtr;
			for(let f = O_NUM_VERTICES + ptr + this.V_SIZE; vPtr > f; vPtr -= this.V_SIZE){
				this.M[V_WX + vPtr] = (this.M[V_LX + vPtr] * this.M[O_COS + ptr] - this.M[V_LY + vPtr] * this.M[O_SIN + ptr]) + this.M[O_TX + ptr];
				this.M[V_WY + vPtr] = (this.M[V_LY + vPtr] * this.M[O_COS + ptr] + this.M[V_LX + vPtr] * this.M[O_SIN + ptr]) + this.M[O_TY + ptr];
				this.M[V_UX + vPtr] = (this.M[V_WX + nPtr] - this.M[V_WX + vPtr]) * this.M[V_L_INV + vPtr];
				this.M[V_UY + vPtr] = (this.M[V_WY + nPtr] - this.M[V_WY + vPtr]) * this.M[V_L_INV + vPtr];
				nPtr = vPtr;
			}
			this.M[V_UX + vPtr] = (this.M[V_WX + nPtr] - this.M[V_WX + vPtr]) * this.M[V_L_INV + vPtr];
			this.M[V_UY + vPtr] = (this.M[V_WY + nPtr] - this.M[V_WY + vPtr]) * this.M[V_L_INV + vPtr];
		}
		*/

	},


	getPlanesCollisionData(asi, bsi){
		let dotB = (this.M[O_W0X + asi] - this.M[O_W0X + bsi]) * this.M[O_UX + bsi] + (this.M[O_W0Y + asi] - this.M[O_W0Y + bsi]) * this.M[O_UY + bsi];
		let dotTemp = dotB;
		if(dotB < 0.0) dotB = 0.0;
		else if(dotB > this.M[O_L + bsi]) dotB = this.M[O_L + bsi];
		let bx = this.M[O_W0X + bsi] + dotB * this.M[O_UX + bsi];
		let by = this.M[O_W0Y + bsi] + dotB * this.M[O_UY + bsi];
		let dotR = 0.0;
		if(dotTemp < 0.0 || dotTemp > this.M[O_L + bsi]){
			dotR = (bx - this.M[O_W0X + asi]) * this.M[O_UX + asi] + (by - this.M[O_W0Y + asi]) * this.M[O_UY + asi];
			//if(dotR < 0.0 || dotR > this.M[O_L + asi]) return false;
			if(dotR < 0.0) dotR = 0.0;
			else if(dotR > this.M[O_L + asi]) dotR = this.M[O_L + asi];
		}
		let ax = this.M[O_W0X + asi] + dotR * this.M[O_UX + asi];
		let ay = this.M[O_W0Y + asi] + dotR * this.M[O_UY + asi];
		let xd = ax - bx;
		let yd = ay - by;
		let dist = Math.sqrt(xd * xd + yd * yd);
		let nx = xd / dist;
		let ny = yd / dist;
		dist -= this.M[O_HALF_WIDTH + asi] + this.M[O_HALF_WIDTH + bsi];
		//let results = [[xd / dist, yd / dist, ax, ay, bx, by, dist - this.M[O_HALF_WIDTH + asi] - this.M[O_HALF_WIDTH + bsi]], null];
		let results = [nx, ny, ax, ay, bx, by, dist];
		dotB = (this.M[O_W1X + asi] - this.M[O_W0X + bsi]) * this.M[O_UX + bsi] + (this.M[O_W1Y + asi] - this.M[O_W0Y + bsi]) * this.M[O_UY + bsi];
		dotTemp = dotB;
		if(dotB < 0.0) dotB = 0.0;
		else if(dotB > this.M[O_L + bsi]) dotB = this.M[O_L + bsi];
		bx = this.M[O_W0X + bsi] + dotB * this.M[O_UX + bsi];
		by = this.M[O_W0Y + bsi] + dotB * this.M[O_UY + bsi];
		dotR = this.M[O_L + asi];
		if(dotTemp < 0.0 || dotTemp > this.M[O_L + bsi]){
			dotR = (bx - this.M[O_W0X + asi]) * this.M[O_UX + asi] + (by - this.M[O_W0Y + asi]) * this.M[O_UY + asi];
			//if(dotR < 0.0 || dotR > this.M[O_L + asi]) return false;
			if(dotR < 0.0) dotR = 0.0;
			else if(dotR > this.M[O_L + asi]) dotR = this.M[O_L + asi];
		}
		ax = this.M[O_W0X + asi] + dotR * this.M[O_UX + asi];
		ay = this.M[O_W0Y + asi] + dotR * this.M[O_UY + asi];
		xd = ax - bx;
		yd = ay - by;
		let dist1 = Math.sqrt(xd * xd + yd * yd);
		nx = xd / dist1;
		ny = yd / dist1;
		dist1 -= this.M[O_HALF_WIDTH + asi] + this.M[O_HALF_WIDTH + bsi];
		//results[1] = [xd / dist1, yd / dist1, ax, ay, bx, by, dist1 - this.M[O_HALF_WIDTH + asi] - this.M[O_HALF_WIDTH + bsi]];
		results.push(nx, ny, ax, ay, bx, by, dist1);
		/*
		if(Math.abs(dist - dist1) < 0.001){
			dotTemp = (this.M[O_TX + asi] - this.M[O_W0X + bsi]) * this.M[O_UX + bsi] + (this.M[O_TY + asi] - this.M[O_W0Y + bsi]) * this.M[O_UY + bsi];
			if(dotTemp > 0 && dotTemp < this.M[O_L + bsi]){
				bx = this.M[O_W0X + bsi] + dotTemp * this.M[O_UX + bsi];
				by = this.M[O_W0Y + bsi] + dotTemp * this.M[O_UY + bsi];
				xd = this.M[O_TX + asi] - bx;
				yd = this.M[O_TY + asi] - by;
				dist = Math.sqrt(xd * xd + yd * yd);
				this.M[O_W + asi] *= 0.25;
				return [xd / dist, yd / dist, this.M[O_TX + asi], this.M[O_TY + asi], bx, by, dist - this.M[O_HALF_WIDTH + asi] - this.M[O_HALF_WIDTH + bsi], null];
			}
		}
		*/
		return results;
	},

	getCirclePlaneCollisionData(cSi, pSi){
		let dot = (this.M[O_TX + cSi] - this.M[O_W0X + pSi]) * this.M[O_UX + pSi] + (this.M[O_TY + cSi] - this.M[O_W0Y + pSi]) * this.M[O_UY + pSi];
		dot = Math.max(0.0, Math.min(dot, this.M[O_L + pSi]));
		let lx = this.M[O_UX + pSi] * dot + this.M[O_W0X + pSi];
		let ly = this.M[O_UY + pSi] * dot + this.M[O_W0Y + pSi];
		let nx = this.M[O_TX + cSi] - lx;
		let ny = this.M[O_TY + cSi] - ly;
		let dist = Math.sqrt(nx * nx + ny * ny);
		nx /= dist;
		ny /= dist;
		let cx = this.M[O_TX + cSi] + nx * -this.M[O_RADIUS + cSi];
		let cy = this.M[O_TY + cSi] + ny * -this.M[O_RADIUS + cSi];
		/*
		if(debugPoints.length < 60){
			debugPoints.push([[cx, cy], red]);
			debugPoints.push([[lx, ly], red]);
		}
		*/
		return [nx, ny, cx, cy, lx, ly, dist - this.M[O_RADIUS + cSi] - this.M[O_HALF_WIDTH + pSi]];
	},

	getCirclesCollisionData(asi, bsi){
		let nx = this.M[O_TX + asi] - this.M[O_TX + bsi];
		let ny = this.M[O_TY + asi] - this.M[O_TY + bsi];
		let dist = Math.sqrt(nx * nx + ny * ny);
		nx /= dist;
		ny /= dist;
		let ax = this.M[O_TX + asi] - nx * this.M[O_RADIUS + asi];
		let ay = this.M[O_TY + asi] - ny * this.M[O_RADIUS + asi];
		let bx = this.M[O_TX + bsi] + nx * this.M[O_RADIUS + bsi];
		let by = this.M[O_TY + bsi] + ny * this.M[O_RADIUS + bsi];
		return [nx, ny, ax, ay, bx, by, dist - this.M[O_RADIUS + asi] - this.M[O_RADIUS + bsi]];
	},

	getCirclePolygonCollisionData(cPtr, pPtr){
		let M = this.M;
		let nx = M[O_TX + cPtr] - M[O_TX + pPtr];
		let ny = M[O_TY + cPtr] - M[O_TY + pPtr];
		//let dist = Math.sqrt(nx * nx + ny * ny);
		//nx /= dist;
		//ny /= dist;
		for(let vPtr = O_NUM_VERTICES + 1 + pPtr, len = vPtr + M[O_NUM_VERTICES + pPtr] * this.V_SIZE; vPtr < len; vPtr += this.V_SIZE){
			let px = M[V_WX + vPtr] - M[O_TX + pPtr];
			let py = M[V_WY + vPtr] - M[O_TY + pPtr];
			let inv = 1.0 / (nx * M[V_UY + vPtr] - ny * M[V_UX + vPtr]);
			let dot = inv * ny * px - inv * nx * py;
			if(dot > 0.0 && dot < M[V_L + vPtr]) {
				if(inv * M[V_UY + vPtr] * px - inv * M[V_UX + vPtr] * py > 0.0){
					dot = (M[O_TX + cPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_TY + cPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
					if(dot < 0) {
						if(vPtr == O_NUM_VERTICES + 1 + pPtr) vPtr = len - this.V_SIZE;
						else vPtr -= this.V_SIZE;
						dot = (M[O_TX + cPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_TY + cPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
					} else if(dot > M[V_L + vPtr]){
						if(vPtr == len - this.V_SIZE) vPtr = O_NUM_VERTICES + 1 + pPtr;
						else vPtr += this.V_SIZE;
						dot = (M[O_TX + cPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_TY + cPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
					}
					if(dot < 0) dot = 0;
					else if(dot > M[V_L + vPtr]) dot = M[V_L + vPtr];
					px = M[V_UX + vPtr] * dot + M[V_WX + vPtr];
					py = M[V_UY + vPtr] * dot + M[V_WY + vPtr];
					nx = M[O_TX + cPtr] - px;
					ny = M[O_TY + cPtr] - py;
					let dist = Math.sqrt(nx * nx + ny * ny);
					nx /= dist;
					ny /= dist;
					let cx = M[O_TX + cPtr] - nx * M[O_RADIUS + cPtr];
					let cy = M[O_TY + cPtr] - ny * M[O_RADIUS + cPtr];
					debugPoints.push([px, py]);
					debugPoints.push([cx, cy]);
					return [nx, ny, cx, cy, px, py, dist - M[O_RADIUS + cPtr] - this.POLYGON_SKIN];
				}
			}
		}
		return false;
		/*
		let M = this.M;
		let nPtr = 0;
		let dist = 99;
		let nx = 0;
		let ny = 0;
		let fPtr = O_NUM_VERTICES + 1 + pPtr;
		let len = M[O_NUM_VERTICES + pPtr] * this.V_SIZE + fPtr;
		for(let vPtr = fPtr; vPtr < len; vPtr += this.V_SIZE){
			let dx = M[O_TX + cPtr] - M[V_WX + vPtr];
			let dy = M[O_TY + cPtr] - M[V_WY + vPtr];
			if(M[V_UX + vPtr] * dy - M[V_UY + vPtr] * dx > 0.0) continue;
			let d = dx * dx + dy * dy;
			if(d < dist){
				nPtr = vPtr;
				dist = d;
				nx = dx;
				ny = dy;
			}
		}
		if(nPtr){
			let dot = nx * M[V_UX + nPtr] + ny * M[V_UY + nPtr];
			if(dot < 0) {
				nPtr -= this.V_SIZE;
				if(nPtr < fPtr) nPtr = fPtr;
				dot = (M[O_TX + cPtr] - M[V_WX + nPtr]) * M[V_UX + nPtr] + (M[O_TY + cPtr] - M[V_WY + nPtr]) * M[V_UY + nPtr];
			}
			if(dot < 0) dot = 0;
			else if(dot > M[V_L + nPtr]) dot = M[V_L + nPtr];
			let px = dot * M[V_UX + nPtr] + M[V_WX + nPtr];
			let py = dot * M[V_UY + nPtr] + M[V_WY + nPtr];
			nx = M[O_TX + cPtr] - px;
			ny = M[O_TY + cPtr] - py;
			dist = Math.sqrt(nx * nx + ny * ny);
			nx /= dist;
			ny /= dist;
			let cx = M[O_TX + cPtr] - nx * M[O_RADIUS + cPtr];
			let cy = M[O_TY + cPtr] - ny * M[O_RADIUS + cPtr];
			return [nx, ny, cx, cy, px, py, dist - M[O_RADIUS + cPtr] - this.POLYGON_SKIN];
		}
		return false;
		*/
	},

	getCollisionData(ptr, aPtr, bPtr){
		let M = this.M;
		let form = M[C_FORM + ptr];
		if(form == this.POINT_SURFACE_FORM) return this.getCirclePlaneCollisionData(aPtr, bPtr);
		else if(form == this.POINTS_FORM) return this.getCirclesCollisionData(aPtr, bPtr);
		else if(form == this.SURFACES_FORM) return this.getPlanesCollisionData(aPtr, bPtr);
		else if(form == this.POINT_POLYGON_FORM) return this.getCirclePolygonCollisionData(aPtr, bPtr);

		else if(form == this.SURFACE_POLYGON_FORM){


			

			/*

			let nx0 = M[O_W0X + aPtr] - M[O_TX + bPtr];
			let ny0 = M[O_W0Y + aPtr] - M[O_TY + bPtr];
			let nx1 = M[O_W1X + aPtr] - M[O_TX + bPtr];
			let ny1 = M[O_W1Y + aPtr] - M[O_TY + bPtr];
			let vp0 = 0;
			let vp1 = 0;
		
			for(let vPtr = O_NUM_VERTICES + 1 + bPtr, len = M[O_NUM_VERTICES + bPtr] * this.V_SIZE + vPtr; vPtr < len; vPtr += this.V_SIZE) {
				
				let px = M[V_WX + vPtr] - M[O_TX + bPtr];
				let py = M[V_WY + vPtr] - M[O_TY + bPtr];
				let inv = 1.0 / (nx0 * M[V_UY + vPtr] - ny0 * M[V_UX + vPtr]);
				let dot = inv * ny0 * px - inv * nx0 * py;
				if(dot > 0.0 && dot < M[V_L + vPtr] && inv * M[V_UY + vPtr] * px - inv * M[V_UX + vPtr] * py > 0.0) {
					vp0 = vPtr;
					if(vp1) break;
				}

				inv = 1.0 / (nx1 * M[V_UY + vPtr] - ny1 * M[V_UX + vPtr]);
				dot = inv * ny1 * px - inv * nx1 * py;
				if(dot > 0.0 && dot < M[V_L + vPtr] && inv * M[V_UY + vPtr] * px - inv * M[V_UX + vPtr] * py > 0.0) {
					vp1 = vPtr;
					if(vp0) break;
				}
			}

			if(!vp0 || !vp1) throw "Assumption failed";
			let vPtr = 0;
			if(vp0 == vp1) {
				vPtr = vp0;
			} else if(vp0 - vp1 ==  this.V_SIZE){
				if(Math.abs(M[O_UX + aPtr] * M[V_UX + vp0] + M[O_UY + aPtr] * M[V_UY + vp0]) > 
					Math.abs(M[O_UX + aPtr] * M[V_UX + vp1] + M[O_UY + aPtr] * M[V_UY + vp1])
				){
					vPtr = vp0;
				} else {
					vPtr = vp1;
				}
			} else if(vp0 - vp1 ==  this.V_SIZE * 2){
				
			}



					let sx = M[O_W0X + aPtr];
					let sy = M[O_W0Y + aPtr];
					dot = (sx - M[V_WX + vPtr]) * M[V_UX + vPtr] + (sy - M[V_WY + vPtr]) * M[V_UY + vPtr];
					if(dot < 0) dot = 0;
					else if(dot > M[V_L + vPtr]) dot = M[V_L + vPtr];
					px = M[V_UX + vPtr] * dot + M[V_WX + vPtr];
					py = M[V_UY + vPtr] * dot + M[V_WY + vPtr];
					if(dot == 0 || dot == M[V_L + vPtr]) {
						dot = (px - sx) * M[O_UX + aPtr] + (py - sy) * M[O_UY + aPtr];
						if(dot < 0.0) dot = 0.0;
						else if(dot > M[O_L + aPtr]) dot = M[O_L + aPtr];
						sx += dot * M[O_UX + aPtr];
						sy += dot * M[O_UY + aPtr];
					}
					let nx = sx - px;
					let ny = sy - py;
					let dist = Math.sqrt(nx * nx + ny * ny);
					nx /= dist;
					ny /= dist;
					if(nx * (sx - M[O_TX + bPtr]) + ny * (sy - M[O_TY + bPtr]) < 0.0) {
						nx = -nx;
						ny = -ny;
						dist = -dist;
					}
					debugPoints.push([px, py]);
					debugPoints.push([sx, sy]);
					let result = [nx, ny, sx, sy, px, py, dist - M[O_HALF_WIDTH + aPtr] - this.POLYGON_SKIN];


					sx = M[O_W1X + aPtr];
					sy = M[O_W1Y + aPtr];
					dot = (sx - M[V_WX + vPtr]) * M[V_UX + vPtr] + (sy - M[V_WY + vPtr]) * M[V_UY + vPtr];
					if(dot < 0) dot = 0;
					else if(dot > M[V_L + vPtr]) dot = M[V_L + vPtr];
					px = M[V_UX + vPtr] * dot + M[V_WX + vPtr];
					py = M[V_UY + vPtr] * dot + M[V_WY + vPtr];
					if(dot == 0 || dot == M[V_L + vPtr]) {
						dot = (px - M[O_W0X + aPtr]) * M[O_UX + aPtr] + (py - M[O_W0Y + aPtr]) * M[O_UY + aPtr];
						if(dot < 0.0) dot = 0.0;
						else if(dot > M[O_L + aPtr]) dot = M[O_L + aPtr];
						sx = dot * M[O_UX + aPtr] + M[O_W0X + aPtr];
						sy = dot * M[O_UY + aPtr] + M[O_W0Y + aPtr]
					}
					nx = sx - px;
					ny = sy - py;
					dist = Math.sqrt(nx * nx + ny * ny);
					nx /= dist;
					ny /= dist;
					if(nx * (sx - M[O_TX + bPtr]) + ny * (sy - M[O_TY + bPtr]) < 0.0) {
						nx = -nx;
						ny = -ny;
						dist = -dist;
					}
					debugPoints.push([px, py]);
					debugPoints.push([sx, sy]);
					result.push(nx, ny, sx, sy, px, py, dist - M[O_HALF_WIDTH + aPtr] - this.POLYGON_SKIN);
					return result;
				}
			}
			*/


			let nx = M[O_TX + aPtr] - M[O_TX + bPtr];
			let ny = M[O_TY + aPtr] - M[O_TY + bPtr];
		
			for(let vPtr = O_NUM_VERTICES + 1 + bPtr, len = M[O_NUM_VERTICES + bPtr] * this.V_SIZE + vPtr; vPtr < len; vPtr += this.V_SIZE) {
				
				let px = M[V_WX + vPtr] - M[O_TX + bPtr];
				let py = M[V_WY + vPtr] - M[O_TY + bPtr];
				let inv = 1.0 / (nx * M[V_UY + vPtr] - ny * M[V_UX + vPtr]);
				let dot = inv * ny * px - inv * nx * py;
				if(dot > 0.0 && dot < M[V_L + vPtr] && inv * M[V_UY + vPtr] * px - inv * M[V_UX + vPtr] * py > 0.0) {
					let sx = M[O_W0X + aPtr];
					let sy = M[O_W0Y + aPtr];
					dot = (sx - M[V_WX + vPtr]) * M[V_UX + vPtr] + (sy - M[V_WY + vPtr]) * M[V_UY + vPtr];
					if(dot < 0) dot = 0;
					else if(dot > M[V_L + vPtr]) dot = M[V_L + vPtr];
					px = M[V_UX + vPtr] * dot + M[V_WX + vPtr];
					py = M[V_UY + vPtr] * dot + M[V_WY + vPtr];
					if(dot == 0 || dot == M[V_L + vPtr]) {
						dot = (px - sx) * M[O_UX + aPtr] + (py - sy) * M[O_UY + aPtr];
						if(dot < 0.0) dot = 0.0;
						else if(dot > M[O_L + aPtr]) dot = M[O_L + aPtr];
						sx += dot * M[O_UX + aPtr];
						sy += dot * M[O_UY + aPtr];
					}
					let nx = sx - px;
					let ny = sy - py;
					let dist = Math.sqrt(nx * nx + ny * ny);
					nx /= dist;
					ny /= dist;
					if(nx * (sx - M[O_TX + bPtr]) + ny * (sy - M[O_TY + bPtr]) < 0.0) {
						nx = -nx;
						ny = -ny;
						dist = -dist;
					}
					debugPoints.push([px, py]);
					debugPoints.push([sx, sy]);
					let result = [nx, ny, sx, sy, px, py, dist - M[O_HALF_WIDTH + aPtr] - this.POLYGON_SKIN];


					sx = M[O_W1X + aPtr];
					sy = M[O_W1Y + aPtr];
					dot = (sx - M[V_WX + vPtr]) * M[V_UX + vPtr] + (sy - M[V_WY + vPtr]) * M[V_UY + vPtr];
					if(dot < 0) dot = 0;
					else if(dot > M[V_L + vPtr]) dot = M[V_L + vPtr];
					px = M[V_UX + vPtr] * dot + M[V_WX + vPtr];
					py = M[V_UY + vPtr] * dot + M[V_WY + vPtr];
					if(dot == 0 || dot == M[V_L + vPtr]) {
						dot = (px - M[O_W0X + aPtr]) * M[O_UX + aPtr] + (py - M[O_W0Y + aPtr]) * M[O_UY + aPtr];
						if(dot < 0.0) dot = 0.0;
						else if(dot > M[O_L + aPtr]) dot = M[O_L + aPtr];
						sx = dot * M[O_UX + aPtr] + M[O_W0X + aPtr];
						sy = dot * M[O_UY + aPtr] + M[O_W0Y + aPtr]
					}
					nx = sx - px;
					ny = sy - py;
					dist = Math.sqrt(nx * nx + ny * ny);
					nx /= dist;
					ny /= dist;
					if(nx * (sx - M[O_TX + bPtr]) + ny * (sy - M[O_TY + bPtr]) < 0.0) {
						nx = -nx;
						ny = -ny;
						dist = -dist;
					}
					debugPoints.push([px, py]);
					debugPoints.push([sx, sy]);
					result.push(nx, ny, sx, sy, px, py, dist - M[O_HALF_WIDTH + aPtr] - this.POLYGON_SKIN);
					return result;
				}
			}


						/*

						let nx = sx - px;
						let ny = sy - py;
						let d = nx * nx + ny * ny;
						if(dot == 0 || dot == M[O_L + aPtr]) {
							let tv = v;
							if(M[V_UX + v] * ny - M[V_UY + v] * nx > 0) tv = pv;
							dot = (sx - M[V_WX + tv]) * M[V_UX + tv] + (sy - M[V_WY + tv]) * M[V_UY + tv];
							//if(dot < 0 || dot > M[V_L + tv]) continue;
							if(dot < 0.0) continue;
							else if(dot > M[V_L + tv]) dot = M[V_L + tv];
							px = dot * M[V_UX + tv] + M[V_WX + tv];
							py = dot * M[V_UY + tv] + M[V_WY + tv];
							nx = sx - px;
							ny = sy - py;
							d = nx * nx + ny * ny;
						}




						dot = (M[O_W0X + aPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_W0Y + aPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
						if(dot )








						dot = (M[O_TX + aPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_TY + aPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
						if(dot < 0) {
							if(vPtr == O_NUM_VERTICES + 1 + bPtr) vPtr = len - this.V_SIZE;
							else vPtr -= this.V_SIZE;
							dot = (M[O_TX + aPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_TY + aPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
						} else if(dot > M[V_L + vPtr]){
							if(vPtr == len - this.V_SIZE) vPtr = O_NUM_VERTICES + 1 + bPtr;
							else vPtr += this.V_SIZE;
							dot = (M[O_TX + aPtr] - M[V_WX + vPtr]) * M[V_UX + vPtr] + (M[O_TY + aPtr] - M[V_WY + vPtr]) * M[V_UY + vPtr];
						}
						if(dot < 0) dot = 0;
						else if(dot > M[V_L + vPtr]) dot = M[V_L + vPtr];
						px = M[V_UX + vPtr] * dot + M[V_WX + vPtr];
						py = M[V_UY + vPtr] * dot + M[V_WY + vPtr];
						nx = M[O_TX + aPtr] - px;
						ny = M[O_TY + aPtr] - py;
						let dist = Math.sqrt(nx * nx + ny * ny);
						nx /= dist;
						ny /= dist;
						let cx = M[O_TX + aPtr] - nx * M[O_RADIUS + aPtr];
						let cy = M[O_TY + aPtr] - ny * M[O_RADIUS + aPtr];
						debugPoints.push([px, py]);
						debugPoints.push([cx, cy]);
						return [nx, ny, cx, cy, px, py, dist - M[O_RADIUS + aPtr] - this.POLYGON_SKIN];
					}
				}






			}
		

		
		
		
		/*
			let sx0 = 0;
			let sy0 = 0;
			let px0 = 0;
			let py0 = 0;
			let nx0 = 0;
			let ny0 = 0;
			let dist0 = 99;

			let sx1 = 0;
			let sy1 = 0;
			let px1 = 0;
			let py1 = 0;
			let nx1 = 0;
			let ny1 = 0;
			let dist1 = 99;
			for(let v = O_NUM_VERTICES + 1 + bPtr, len = M[O_NUM_VERTICES + bPtr] * this.V_SIZE + v, pv = len - this.V_SIZE;
				v < len;
				pv = v, v += this.V_SIZE)
			{
				let px = M[V_WX + v];
				let py = M[V_WY + v];
				let dot = (px - M[O_W0X + aPtr]) * M[O_UX + aPtr] + (py - M[O_W0Y + aPtr]) * M[O_UY + aPtr];
				if(dot < 0) dot = 0;
				else if(dot > M[O_L + aPtr]) dot = M[O_L + aPtr];
				let sx = dot * M[O_UX + aPtr] + M[O_W0X + aPtr];
				let sy = dot * M[O_UY + aPtr] + M[O_W0Y + aPtr];
				let nx = sx - px;
				let ny = sy - py;
				let d = nx * nx + ny * ny;
				if(dot == 0 || dot == M[O_L + aPtr]) {
					let tv = v;
					if(M[V_UX + v] * ny - M[V_UY + v] * nx > 0) tv = pv;
					dot = (sx - M[V_WX + tv]) * M[V_UX + tv] + (sy - M[V_WY + tv]) * M[V_UY + tv];
					//if(dot < 0 || dot > M[V_L + tv]) continue;
					if(dot < 0.0) continue;
					else if(dot > M[V_L + tv]) dot = M[V_L + tv];
					px = dot * M[V_UX + tv] + M[V_WX + tv];
					py = dot * M[V_UY + tv] + M[V_WY + tv];
					nx = sx - px;
					ny = sy - py;
					d = nx * nx + ny * ny;
				}
				if(d < dist1){
					if(d < dist0){
						dist1 = dist0;
						nx1 = nx0;
						ny1 = ny0;
						sx1 = sx0;
						sy1 = sy0;
						px1 = px0;
						py1 = py0;
						dist0 = d;
						nx0 = nx;
						ny0 = ny;
						sx0 = sx;
						sy0 = sy;
						px0 = px;
						py0 = py;
					} else {
						dist1 = d;
						nx1 = nx;
						ny1 = ny;
						sx1 = sx;
						sy1 = sy;
						px1 = px;
						py1 = py;
					}
				}
			}
			debugPoints.push([px0, py0]);
			debugPoints.push([sx0, sy0]);
			debugPoints.push([px1, py1]);
			debugPoints.push([sx1, sy1]);
			dist0 = Math.sqrt(dist0);
			nx0 /= dist0;
			ny0 /= dist0;
			dist1 = Math.sqrt(dist1);
			nx1 /= dist1;
			ny1 /= dist1;
			return [
				nx0, ny0, sx0, sy0, px0, py0, dist0 - M[O_HALF_WIDTH + aPtr] - this.POLYGON_SKIN,
				nx1, ny1, sx1, sy1, px1, py1, dist1 - M[O_HALF_WIDTH + aPtr] - this.POLYGON_SKIN
			];
			*/
		
		} else if(form == this.POLYGONS_FORM){
			let ax0 = 0;
			let ay0 = 0;
			let bx0 = 0;
			let by0 = 0;
			let nx0 = 0;
			let ny0 = 0;
			let dist0 = 99;

			let ax1 = 0;
			let ay1 = 0;
			let bx1 = 0;
			let by1 = 0;
			let nx1 = 0;
			let ny1 = 0;
			let dist1 = 99;

			for(let av = O_NUM_VERTICES + 1 + aPtr, aLen = M[O_NUM_VERTICES + aPtr] * this.V_SIZE + av, apv = aLen - this.V_SIZE;
				av < aLen;
				apv = av, av += this.V_SIZE)
			{
				for(let bv = O_NUM_VERTICES + 1 + bPtr, bLen = M[O_NUM_VERTICES + bPtr] * this.V_SIZE + bv, bpv = bLen - this.V_SIZE;
					bv < bLen;
					bpv = bv, bv += this.V_SIZE)
				{
					if(true || M[V_UX + av] * (M[V_WY + bv] - M[V_WY + av]) - M[V_UY + av] * (M[V_WX + bv] - M[V_WX + av]) < 0) {
						let dot = (M[V_WX + bv] - M[V_WX + av]) * M[V_UX + av] + (M[V_WY + bv] - M[V_WY + av]) * M[V_UY + av];
						if(dot < M[V_L + av] && dot > 0) {
							//if(dot < 0) dot = 0;
							//else if(dot > M[V_L + av]) continue;
							let ax = dot * M[V_UX + av] + M[V_WX + av];
							let ay = dot * M[V_UY + av] + M[V_WY + av];
							let nx = ax - M[V_WX + bv];
							let ny = ay - M[V_WY + bv];
							let d = nx * nx + ny * ny;
							if(d < dist1){
								if(d < dist0){
									dist1 = dist0;
									nx1 = nx0;
									ny1 = ny0;
									ax1 = ax0;
									ay1 = ay0;
									bx1 = bx0;
									by1 = by0;
									dist0 = d;
									nx0 = nx;
									ny0 = ny;
									ax0 = ax;
									ay0 = ay;
									bx0 = M[V_WX + bv];
									by0 = M[V_WY + bv];
								} else {
									dist1 = d;
									nx1 = nx;
									ny1 = ny;
									ax1 = ax;
									ay1 = ay;
									bx1 = M[V_WX + bv];
									by1 = M[V_WY + bv];
								}
							}
						}
					}
					if(true || M[V_UX + bv] * (M[V_WY + av] - M[V_WY + bv]) - M[V_UY + bv] * (M[V_WX + av] - M[V_WX + bv]) < 0) {
						let dot = (M[V_WX + av] - M[V_WX + bv]) * M[V_UX + bv] + (M[V_WY + av] - M[V_WY + bv]) * M[V_UY + bv];
						if(dot < M[V_L + bv] && dot > 0) {
							//if(dot < 0) dot = 0;
							//else if(dot > M[V_L + bv]) continue;
							let bx = dot * M[V_UX + bv] + M[V_WX + bv];
							let by = dot * M[V_UY + bv] + M[V_WY + bv];
							let nx = M[V_WX + av] - bx;
							let ny = M[V_WY + av] - by;
							let d = nx * nx + ny * ny;
							if(d < dist1){
								if(d < dist0){
									dist1 = dist0;
									nx1 = nx0;
									ny1 = ny0;
									ax1 = ax0;
									ay1 = ay0;
									bx1 = bx0;
									by1 = by0;
									dist0 = d;
									nx0 = nx;
									ny0 = ny;
									ax0 = M[V_WX + av];
									ay0 = M[V_WY + av];
									bx0 = bx;
									by0 = by;
								} else {
									dist1 = d;
									nx1 = nx;
									ny1 = ny;
									ax1 = M[V_WX + av];
									ay1 = M[V_WY + av];
									bx1 = bx;
									by1 = by;
								}
							}
						}
					}
				}
			}

			debugPoints.push([bx0, by0]);
			debugPoints.push([ax0, ay0]);
			debugPoints.push([bx1, by1]);
			debugPoints.push([ax1, ay1]);

			dist0 = Math.sqrt(dist0);
			nx0 /= dist0;
			ny0 /= dist0;
			dist1 = Math.sqrt(dist1);
			nx1 /= dist1;
			ny1 /= dist1;
			/*
			let adx = ax0 - M[O_TX + aPtr];
			let ady = ay0 - M[O_TY + aPtr];
			let dd = adx * adx + ady * ady;
			let abx = bx0 - M[O_TX + aPtr];
			let aby = by0 - M[O_TY + aPtr];
			let db = abx * abx + aby * aby;
			if(dd > db) {
				dist0 = -dist0;
				nx0 = -nx0;
				ny0 = -ny0;
			}
			adx = ax1 - M[O_TX + aPtr];
			ady = ay1 - M[O_TY + aPtr];
			dd = adx * adx + ady * ady;
			abx = bx1 - M[O_TX + aPtr];
			aby = by1 - M[O_TY + aPtr];
			db = abx * abx + aby * aby;
			if(dd > db) {
				dist1 = -dist1;
				nx1 = -nx1;
				ny1 = -ny1;
			}
			*/
			return [
				nx0, ny0, ax0, ay0, bx0, by0, dist0 - this.POLYGON_SKIN * 2.0,
				nx1, ny1, ax1, ay1, bx1, by1, dist1 - this.POLYGON_SKIN * 2.0
			];

		} else {
			throw "Unhandled collision constraint form: = " + form;
		}
	},















	destroyAll(){
		this.cTotal = 0;
		this.poTotal = 0;
		this.POMM.freeAll();
	},
	// Forms for quick evaluation of object type
	// Plane form is not just a plane its just the best word I could find
	// Plane form can be imagined as a tic tac with arbitrary length and width, its described with two vertices 
	// that are connected by mass with specified width, at the vertices themselves there exists two circular 
	// masses that have a diameter equal to the specified width

	PLANE_FORM: 0,
	CIRCLE_FORM: 1,
	AABB_FORM: 2,

	POLYGON_FORM: 10,



	POINTS_FORM: 3,
	POINT_SURFACE_FORM: 4,
	SURFACES_FORM: 5,
	REVOLUTE_FORM: 6,

	POINT_POLYGON_FORM: 7,
	SURFACE_POLYGON_FORM: 8,
	POLYGONS_FORM: 9,

	//PO_SIZES: new Uint8Array([34, 22, 25, 22, 22, 38, 22,   22, 38, 38, 22]),
	PO_SIZES: new Uint8Array([34, 22, 25, 22, 22, 38, 24,   22, 38, 38, 22]),


	// For now two types of physics objects, maybe more in the future.
	// Fixed objects simulate extremely massive objects, these do not move, perfect for ground platforms.
	FIXED_TYPE: 0,
	// Movable objects simulate regular objects, these are affected by forces, density is required in the definition of these objects
	MOVABLE_TYPE: 1,
	
	// change to contiguos
	COLLISION_TYPE: 4,
	JOINT_TYPE: 5,

	C_PTRS: new Uint16Array(2000),
	cTotal: 0,

	createConstraint(def){
		if(this.cTotal > 1998) throw "Unable to create constraint, maximum number of constraints reached. Max is " + 2000;
		console.log("Creating constraint");
		if(def.poPtrA === undefined || def.poPtrB === undefined) console.error("Missing poPtrA and/or poPtrB.");
		if(def.type === undefined) console.error("Missing constraint type.");
		if(def.poPtrA === def.poPtrB) console.error("Cannot create constraint with one object, def.poPtrA === def.poPtrB.");
		if(def.type == this.COLLISION_TYPE){
			
			if(this.M[O_TYPE + def.poPtrA] == this.FIXED_TYPE && this.M[O_TYPE + def.poPtrB] == this.FIXED_TYPE) return;


			let aForm = this.M[O_FORM + def.poPtrA];
			let bForm = this.M[O_FORM + def.poPtrB];
			//console.log("aForm = " + aForm + "  this.CIRCLE_FORM = " + this.CIRCLE_FORM);
			if(aForm == this.CIRCLE_FORM){
				if(bForm == this.PLANE_FORM) def.form = this.POINT_SURFACE_FORM;
				else if(bForm == this.CIRCLE_FORM) def.form = this.POINTS_FORM;


				else if(bForm == this.POLYGON_FORM) def.form = this.POINT_POLYGON_FORM;


				else console.error("Unhandled form: " + bForm);
			} else if(aForm == this.PLANE_FORM){
				if(bForm == this.CIRCLE_FORM){
					let temp = def.poPtrA;
					def.poPtrA = def.poPtrB;
					def.poPtrB = temp;
					def.form = this.POINT_SURFACE_FORM;
				} else if(bForm == this.PLANE_FORM) {
					def.form = this.SURFACES_FORM;

				} else if(bForm == this.POLYGON_FORM) {
					def.form = this.SURFACE_POLYGON_FORM;

				} else {
					throw "Unhandled form: " + bForm;
				}

			} else if(aForm == this.POLYGON_FORM){
				if(bForm == this.CIRCLE_FORM){
					let temp = def.poPtrA;
					def.poPtrA = def.poPtrB;
					def.poPtrB = temp;
					def.form = this.POINT_POLYGON_FORM;

				} else if(bForm == this.PLANE_FORM){
					let temp = def.poPtrA;
					def.poPtrA = def.poPtrB;
					def.poPtrB = temp;
					def.form = this.SURFACE_POLYGON_FORM;

				} else if(bForm == this.POLYGON_FORM){
					def.form = this.POLYGONS_FORM;

				} else {
					console.error("unhandled form: " + bForm);
				}
			
			} else {
				console.error("Unhandled form: " + aForm);
				return;
			}
		}
		let ptr = this.POMM.alloc(this.PO_SIZES[def.form]);


		// temp
		if(def.form == this.POLYGONS_FORM || def.form == this.SURFACE_POLYGON_FORM || def.form == this.SURFACES_FORM){
			console.log("resseting 2nd impulses");
			this.M[C_JN + ptr + 16] = 0.0;
			this.M[C_JT + ptr + 16] = 0.0;
		}



		this.M[C_JN + ptr] = 0.0;
		this.M[C_JT + ptr] = 0.0;

		this.M[C_FORM + ptr] = def.form;
		this.M[C_TYPE + ptr] = def.type;
		this.M[C_PO_PTR_A + ptr] = def.poPtrA;
		this.M[C_PO_PTR_B + ptr] = def.poPtrB;
		this.M[C_US + ptr] = (this.M[O_US + def.poPtrA] + this.M[O_US + def.poPtrB]) * 0.5;
		this.M[C_UK + ptr] = (this.M[O_UK + def.poPtrA] + this.M[O_UK + def.poPtrB]) * 0.5;

		if(def.type == this.JOINT_TYPE){
			if(def.x === undefined || def.y === undefined) throw "Missing x and/or y (position).";
			this.M[C_ACTIVE + ptr] = 1;
			this.setJointPosition(ptr, def.x, def.y);


			console.log("this.M[C_JX + ptr] = " + this.M[C_JX + ptr] + " this.M[C_JY + ptr] = " + this.M[C_JY + ptr] + " M[C_SUM_T + ptr] = " + this.M[C_SUM_T + ptr] + " C_JX + ptr = " + (C_JX + ptr));
			console.log("resseting joint impulses");
			this.M[C_JX + ptr] = 0.0;
			this.M[C_JY + ptr] = 0.0;
			this.M[C_SUM_T + ptr] = 0.0;



			if(def.motorVelocity === undefined){
				this.M[C_IS_MOTOR + ptr] = 0;
			} else if(def.maxMotorTorque !== undefined){
				this.M[C_IS_MOTOR + ptr] = 1;
				this.M[C_MW + ptr] = def.motorVelocity;
				this.M[C_M_MAX_T + ptr] = def.maxMotorTorque;
				let motorInertia = this.M[O_I_INV + def.poPtrA] + this.M[O_I_INV + def.poPtrB];
				if(motorInertia){
					motorInertia = 1.0 / motorInertia;
				}
				this.M[C_M_I + ptr] = motorInertia;
			} else {
				console.warn("Missing maxMotorTorque required to create motor joint.");
			}
			for(let i = this.cTotal - 1; i > -1; --i){
				let cPtr = this.C_PTRS[i];
				if(this.M[C_TYPE + cPtr] == this.COLLISION_TYPE){
					if((this.M[C_PO_PTR_A + cPtr] === def.poPtrA && this.M[C_PO_PTR_B + cPtr] === def.poPtrB) ||
						(this.M[C_PO_PTR_B + cPtr] === def.poPtrA && this.M[C_PO_PTR_A + cPtr] === def.poPtrB)){
						this.destroyConstraint(cPtr);
					}
				}
			}
		}
		this.C_PTRS[this.cTotal++] = ptr;
		return ptr;
	},

	getJointAnchorPositionA(jPtr){
		let asi = this.M[C_PO_PTR_A + jPtr];
		return [
			(this.M[C_LAX + jPtr] * this.M[O_COS + asi] - this.M[C_LAY + jPtr] * this.M[O_SIN + asi]) + this.M[O_TX + asi],
			(this.M[C_LAY + jPtr] * this.M[O_COS + asi] + this.M[C_LAX + jPtr] * this.M[O_SIN + asi]) + this.M[O_TY + asi]
		]
	},

	destroyConstraint(cPtr){
		this.POMM.free(cPtr);
		let i = this.C_PTRS.indexOf(cPtr);
		console.log("this.C_PTRS.indexOf(cPtr) = " + i)
		if(i > -1) this.C_PTRS.copyWithin(i, i + 1, this.cTotal);
		else console.error("Cannot destroy constraint with pointer at index: " + i);
		--this.cTotal;
		// unnecessary
		this.C_PTRS[this.cTotal] = 0;
	},

	setJointPosition(jPtr, x, y){
		if(!this.M[C_TYPE + jPtr] == this.JOINT_TYPE){
			console.error("Cannot set joint position of non-JOINT_TYPE constraint.");
			return;
		}
		let asi = this.M[C_PO_PTR_A + jPtr];
		let bsi = this.M[C_PO_PTR_B + jPtr];
		let dax = x - this.M[O_TX + asi];
		let day = y - this.M[O_TY + asi];
		let dbx = x - this.M[O_TX + bsi];
		let dby = y - this.M[O_TY + bsi];
		this.M[C_LAX + jPtr] = dax * this.M[O_COS + asi] + day * this.M[O_SIN + asi];
		this.M[C_LAY + jPtr] = day * this.M[O_COS + asi] - dax * this.M[O_SIN + asi];
		this.M[C_LBX + jPtr] = dbx * this.M[O_COS + bsi] + dby * this.M[O_SIN + bsi];
		this.M[C_LBY + jPtr] = dby * this.M[O_COS + bsi] - dbx * this.M[O_SIN + bsi];
		let motorInertia = this.M[O_I_INV + asi] + this.M[O_I_INV + bsi];
		if(motorInertia){
			motorInertia = 1.0 / motorInertia;
		}
		this.M[C_M_I + jPtr] = motorInertia;
	},

	resetAllImpulses(){
		let M = this.M;
		for(let i = 0, len = this.cTotal; i < len; ++i){
			let ptr = this.C_PTRS[i];
			if(M[C_TYPE + ptr] === this.COLLISION_TYPE){
				let cLen = 1;
				if(M[C_FORM + ptr] == this.SURFACES_FORM || M[C_FORM + ptr] == this.SURFACE_POLYGON_FORM || M[C_FORM + ptr] == this.POLYGONS_FORM) cLen = 2;
				for(let cPtr = ptr, c = 0; c < cLen; cPtr += 16, c += 1){
					M[C_JN + cPtr] = 0.0;
					M[C_JT + cPtr] = 0.0;
				}
			} else if(M[C_TYPE + ptr] === this.JOINT_TYPE){
				M[C_JX + ptr] = 0.0;
				M[C_JY + ptr] = 0.0;
				M[C_SUM_T + ptr] = 0.0;
			} else {
				throw "Unimplemented form";
			}
		}
		console.log("all impulses reset");
	},
	
	
	MIN_PLANE_LEN: 0.05,
	MIN_AABB_LEN: 0.05,

	M: new Float64Array(65000),

	PO_PTRS: new Uint16Array(200),
	poTotal: 0,

	POMM: null,

	V_SIZE: 8,


	create(def) {
		if(this.poTotal > 198) throw "Unable to create physics object, maximum number of physics objects reached. Max is " + 200;
		if(def.form === undefined || def.type === undefined) {
			console.error("Missing form and/or type in PhysicsObject definition");
		}
		if(def.type == this.MOVABLE_TYPE && (def.density === undefined)) {
			console.error("Missing density in PhysicsObject definition of this.MOVABLE_TYPE");
		}
		let size = this.PO_SIZES[def.form] + def.userFloats.length;

		if(def.form === this.POLYGON_FORM){
			if(def.vertices === undefined || def.vertices.length < 3){
				console.error("Missing vertices or vertices length less than 3");
			}
			size += def.vertices.length * this.V_SIZE;
		}

		let ptr = this.POMM.alloc(size);


		this.M[O_USERFLOATS_PTR + ptr] = ptr + this.PO_SIZES[def.form];



		this.M[O_FORM + ptr] = def.form;
		this.M[O_TYPE + ptr] = def.type;
		this.M[O_GROUP + ptr] = def.group;
		if(def.staticFriction === undefined) this.M[O_US + ptr] = 0.9;
		else this.M[O_US + ptr] = def.staticFriction;
		if(def.kineticFriction === undefined) this.M[O_UK + ptr] = 0.7;
		else this.M[O_UK + ptr] = def.kineticFriction;
		if(def.linearVelocityResistance === undefined) this.M[O_VM + ptr] = 0.99;
		else this.M[O_VM + ptr] = 1.0 - def.linearVelocityResistance;
		if(def.rotationalVelocityResistance === undefined) this.M[O_WM + ptr] = 0.99;
		else this.M[O_WM + ptr] = 1.0 - def.rotationalVelocityResistance;
		this.M[O_VX + ptr] = 0.0;
		this.M[O_VY + ptr] = 0.0;
		this.M[O_W + ptr] = 0.0;
		this.M[O_COS + ptr] = 1.0;
		this.M[O_SIN + ptr] = 0.0;
		this.M[O_O + ptr] = 0.0;
		this.M[O_P + ptr] = def.density;
		if(def.type == this.FIXED_TYPE){
			this.M[O_P + ptr] = 0.0;
			this.M[O_M + ptr] = 0.0;
			this.M[O_M_INV + ptr] = 0.0;
			this.M[O_I + ptr] = 0.0;
			this.M[O_I_INV + ptr] = 0.0;
		}
		if(def.form == this.CIRCLE_FORM) {
			if(def.radius === undefined || def.x === undefined|| def.y === undefined) {
				console.error("Missing radius and/or position (x and y) in PhysicsObject definition of this.CIRCLE_FORM");
			}
			this.M[O_TX + ptr] = def.x;
			this.M[O_TY + ptr] = def.y;
			this.M[O_RADIUS + ptr] = def.radius;
			if(def.type == this.MOVABLE_TYPE) {
				let mass = def.density * Math.PI * def.radius * def.radius;
				// is mass needed or only m_inv?
				this.M[O_M + ptr] = mass;
				this.M[O_M_INV + ptr] = 1.0 / mass;
				// tune?
				this.M[O_I + ptr] = 0.75 * mass * def.radius * def.radius;
				this.M[O_I_INV + ptr] = 1.0 / this.M[O_I + ptr];
			}
		} else if(def.form == this.PLANE_FORM) {
			if(def.vertices === undefined || def.vertices.length != 2){
				console.error("Missing vertices or vertices not of length 2 in PhysicsObject def of this.PLANE_FORM");
			}
			if(def.width === undefined){
				console.error("Missing width in PhysicsObject definition of this.PLANE_FORM");
			}
			if(def.vertices[0][0] == def.vertices[1][0] && def.vertices[0][1] == def.vertices[1][1]) def.vertices[1][0] += this.MIN_PLANE_LEN;
			this.M[O_HALF_WIDTH + ptr] = def.width * 0.5;
			this.setVertex(ptr, 0, def.vertices[0][0], def.vertices[0][1]);
			this.setVertex(ptr, 1, def.vertices[1][0], def.vertices[1][1]);

		} else if(def.form == this.AABB_FORM){
			if(def.vertices === undefined || def.vertices.length != 2){
				console.error("Missing vertices or vertices not of length 2 in PhysicsObject definition of this.AABB_FORM");
			}
			this.M[O_MIN_X + ptr] = def.vertices[0][0];
			this.M[O_MIN_Y + ptr] = def.vertices[0][1];
			this.M[O_MAX_X + ptr] = def.vertices[1][0];
			this.M[O_MAX_Y + ptr] = def.vertices[1][1];
			





		} else if(def.form == this.POLYGON_FORM) {
			console.log(def.vertices);
			let numVertices = def.vertices.length;


			this.M[O_USERFLOATS_PTR + ptr] += def.vertices.length * this.V_SIZE;
			console.log("this.M[O_USERFLOATS_PTR + ptr] = " + this.M[O_USERFLOATS_PTR + ptr]);

			if(numVertices < 3) throw "Unable to create polygon with less than 3 vertices";
			this.M[O_NUM_VERTICES + ptr] = numVertices;
			//let vPtr = O_NUM_VERTICES + ptr + 1 + (numVertices - 1) * this.V_SIZE;
			for(let v = numVertices - 1, last = 0, vPtr = O_NUM_VERTICES + ptr + 1 + (numVertices - 1) * this.V_SIZE;
				v > -1;
				last = v, --v, vPtr -= this.V_SIZE)
			{
				this.M[V_WX + vPtr] = def.vertices[v][0];
				this.M[V_WY + vPtr] = def.vertices[v][1];
				let dx = def.vertices[last][0] - def.vertices[v][0];
				let dy = def.vertices[last][1] - def.vertices[v][1];
				this.M[V_L + vPtr] = Math.sqrt(dx * dx + dy * dy);
				this.M[V_L_INV + vPtr] = 1.0 / this.M[V_L + vPtr];
				this.M[V_UX + vPtr] = dx / this.M[V_L + vPtr];
				this.M[V_UY + vPtr] = dy / this.M[V_L + vPtr];
			}

			this.M[O_TX + ptr] = 0.0;
			this.M[O_TY + ptr] = 0.0;

			this.M[O_I + ptr] = 0.0;

			let area = 0.0;
			let triangleDimensions = [];
			let v = O_NUM_VERTICES + ptr + 1;
			let ox = this.M[V_WX + v];
			let oy = this.M[V_WY + v];
			v += this.V_SIZE;

			for(let len = (numVertices - 2) * this.V_SIZE + v; v < len; v += this.V_SIZE){
				let dot = (ox - this.M[V_WX + v]) * this.M[V_UX + v] + (oy - this.M[V_WY + v]) * this.M[V_UY + v];
				let px = this.M[V_UX + v] * dot + this.M[V_WX + v];
				let py = this.M[V_UY + v] * dot + this.M[V_WY + v];
				let dx = px - ox;
				let dy = py - oy;
				let h = Math.sqrt(dx * dx + dy * dy);
				let a = h * this.M[V_L + v] * 0.5;
				area += a;
				let nx = this.M[V_WX + v + this.V_SIZE];
				let ny = this.M[V_WY + v + this.V_SIZE];
				let cx = (ox + this.M[V_WX + v] + nx) / 3;
				let cy = (oy + this.M[V_WY + v] + ny) / 3;

				debugPoints.push([cx, cy]);

				this.M[O_TX + ptr] += cx * a;
				this.M[O_TY + ptr] += cy * a;

				if(def.type == this.MOVABLE_TYPE){
					// moment of area of triangle with axis parralel to base passing though origin point
					let i = 0.5 * a * h * h;
					console.log("i = " + i);
					let ht = Math.sqrt((px - this.M[V_WX + v]) * (px - this.M[V_WX + v]) + (py - this.M[V_WY + v]) * (py - this.M[V_WY + v]));
					let hn = Math.sqrt((px - nx) * (px - nx) + (py - ny) * (py - ny));
					// moment of area of sub-triangles divided by projecting origin on base with axis perpendicular to base passing through origin point
					ht = (h * ht * ht * ht) / 12;
					hn = (h * hn * hn * hn) / 12;
					// subtract respective sub-triangle if origin projection outside of base
					if(dot < 0) i += hn - ht;
					else if(dot > this.M[V_L + v]) i += ht - hn;
					else i += ht + hn;

					this.M[O_I + ptr] += i;
					/*
					console.log("dot = " + dot);
					console.log("ht = " + ht);
					console.log("hn = " + hn);
					console.log("b = " + this.M[V_L + v]);
					console.log("h = " + h);
					console.log("i = " + i);
					console.log("a = " + a);
					console.log("this.M[O_I + ptr] = " + this.M[O_I + ptr]);
					*/
				}

			}
			this.M[O_TX + ptr] /= area;
			this.M[O_TY + ptr] /= area;
			debugPoints.push([this.M[O_TX + ptr], this.M[O_TY + ptr]]);

			if(def.type == this.MOVABLE_TYPE) {
				let m = def.density * area;
				// is mass needed or only m_inv?
				this.M[O_M + ptr] = m;
				this.M[O_M_INV + ptr] = 1.0 / m;
				let dSqd = (this.M[O_TX + ptr] - ox) * (this.M[O_TX + ptr] - ox) + (this.M[O_TY + ptr] - oy) * (this.M[O_TY + ptr] - oy);
				// shift moment of area from origin to center of mass
				this.M[O_I + ptr] -= area * dSqd;
				console.log("this.M[O_I + ptr] = " + this.M[O_I + ptr]);
				// change to mass moment of inertia and scale up
				this.M[O_I + ptr] *= def.density * 1.5;
				console.log("this.M[O_I + ptr] = " + this.M[O_I + ptr]);
				
				this.M[O_I_INV + ptr] = 1.0 / this.M[O_I + ptr];
			}

			for(let vPtr = O_NUM_VERTICES + ptr + 1, len = numVertices * this.V_SIZE + vPtr; vPtr < len; vPtr += this.V_SIZE){
				this.M[V_LX + vPtr] = this.M[V_WX + vPtr] - this.M[O_TX + ptr];
				this.M[V_LY + vPtr] = this.M[V_WY + vPtr] - this.M[O_TY + ptr];
			}


		} else {
			console.error("Unhandled form: " + def.form);
		}

		this.setUserFloats(ptr, def.userFloats, 0);
		// use Float32Array.prototype.set() instead
		//if(def.userFloats !== undefined){
			//for(let i = 0, ufi = this.PO_SIZES[def.form] + ptr, len = def.userFloats.length; i < len; ++i, ++ufi){
				//this.M[ufi] = def.userFloats[i];
			//}
		//}
		this.PO_PTRS[this.poTotal++] = ptr;
		return ptr;
	},

	/*
	pwGet(poId){
		const SI = this.getStartingIndex(poId);
		const PO = {

			startingIndex: SI,
			numFloats: this.M[O_NUM_FLOATS + SI],
			form: this.M[O_FORM + SI],
			type: this.M[O_TYPE + SI],
			density: this.M[O_P + SI],
			mass: this.M[O_M + SI],
			massInverse: this.M[O_M_INV + SI],
			rotationalMass: this.M[O_I + SI],
			rotationalMassInverse: this.M[O_I_INV + SI],
			group: this.M[O_GROUP + SI],
			staticFriction: this.M[O_US + SI],
			kineticFriction: this.M[O_UK + SI],
			velocityResistance: 1.0 - this.M[O_VM + SI],
			rotationalVelocityResistance: 1.0 - this.M[O_WM + SI],
			velocityX: this.M[O_VX + SI],
			velocityY: this.M[O_VY + SI],
			rotationalVelocity: this.M[O_W + SI],
			positionX: this.M[O_TX + SI],
			positionY: this.M[O_TY + SI],
			cosine: this.M[O_COS + SI],
			sine: this.M[O_SIN + SI],
			orientation: this.M[O_O + SI]
		};
		PO.userFloats = pwGetUserFloats(poId);
		// this.CIRCLE_FORM CUSTOM PROPERTIES
		PO.radius = this.M[O_RADIUS + SI];
		// this.PLANE_FORM CUSTOM PROPERTIES
		PO.length = this.M[O_L + SI];
		PO.lengthInverse = this.M[O_L_INV + SI];
		PO.local0X = this.M[O_L0X + SI];
		PO.local0Y = this.M[O_L0Y + SI];
		PO.local1X = this.M[O_L1X + SI];
		PO.local1Y = this.M[O_L1Y + SI];
		PO.world0X = this.M[O_W0X + SI];
		PO.world0Y = this.M[O_W0Y + SI];
		PO.world1X = this.M[O_W1X + SI];
		PO.world1Y = this.M[O_W1Y + SI];
		PO.unitVectorX = this.M[O_UX + SI];
		PO.unitVectorY = this.M[O_UY + SI];
		PO.halfWidth = this.M[O_HALF_WIDTH + SI];
		return PO;
	}
	*/

	destroy(poPtr){
		this.POMM.free(poPtr);
		let i = this.PO_PTRS.indexOf(poPtr);
		if(i > -1) this.PO_PTRS.copyWithin(i, i + 1, this.poTotal);
		else console.error("Cannot destroy physics object with pointer at index: " + i);
		--this.poTotal;
		// unnecessary
		this.PO_PTRS[this.poTotal] = 0;
		for(i = this.cTotal - 1; i > -1; --i){
			let cPtr = this.C_PTRS[i];
			if(this.M[C_PO_PTR_A + cPtr] === poPtr || this.M[C_PO_PTR_B + cPtr] === poPtr) this.destroyConstraint(cPtr);
		}
	},

	isPointInside(poPtr, x, y, radius){
		if(arguments.length == 3) radius = 0.0;
		let maxDist = 0.0;
		let px = 0.0;
		let py = 0.0;

		if(this.M[O_FORM + poPtr] == this.CIRCLE_FORM){
			px = this.M[O_TX + poPtr];
			py = this.M[O_TY + poPtr];
			maxDist = this.M[O_RADIUS + poPtr];

		} else if(this.M[O_FORM + poPtr] == this.PLANE_FORM){
			let dot = (x - this.M[O_W0X + poPtr]) * this.M[O_UX + poPtr] + (y - this.M[O_W0Y + poPtr]) * this.M[O_UY + poPtr];
			dot = Math.max(0.0, Math.min(this.M[O_L + poPtr], dot));
			px = this.M[O_UX + poPtr] * dot + this.M[O_W0X + poPtr];
			py = this.M[O_UY + poPtr] * dot + this.M[O_W0Y + poPtr];
			maxDist = this.M[O_HALF_WIDTH + poPtr];

		} else if(this.M[O_FORM + poPtr] == this.AABB_FORM){
			if(x + radius < this.M[O_MIN_X + poPtr] || y + radius < this.M[O_MIN_Y + poPtr]) return false;
			if(x - radius > this.M[O_MAX_X + poPtr] || y - radius > this.M[O_MAX_Y + poPtr]) return false;
			return true;



		} else if(this.M[O_FORM + poPtr] == this.POLYGON_FORM){

			for(let vPtr = O_NUM_VERTICES + poPtr + 1, len = this.M[O_NUM_VERTICES + poPtr] * this.V_SIZE + vPtr; vPtr < len; vPtr += this.V_SIZE){
				let dx = x - this.M[V_WX + vPtr];
				let dy = y - this.M[V_WY + vPtr];
				console.log("vPtr = " + vPtr + "  len = " + len);
				if(this.M[V_UX + vPtr] * dy - this.M[V_UY + vPtr] * dx < 0.0) return false;
			}
			return true;

		} else {
			console.error("Unhandled form: " + this.M[O_FORM + poPtr] + ".");
		}
		x -= px;
		y -= py;
		if(Math.sqrt(x * x + y * y) - radius < maxDist){
			return true;
		}
		return false;
	},

	isPenetrating(ptrA, ptrB){
		if(ptrA == ptrB) throw "Comparing physics object with self";

		if(this.M[O_FORM + ptrA] == this.CIRCLE_FORM){
			if(pw.isPointInside(ptrB, this.M[O_TX + ptrA], this.M[O_TY + ptrA], this.M[O_RADIUS + ptrA])){
				return true;
			}
			return false;

		} else if(this.M[O_FORM + ptrA] == this.PLANE_FORM){
			let collisionData = false;
			if(this.M[O_FORM + ptrB] == this.CIRCLE_FORM){
				if(pw.isPointInside(ptrA, this.M[O_TX + ptrB], this.M[O_TY + ptrB], this.M[O_RADIUS + ptrB])) return true;
				return false;
			} else if(this.M[O_FORM + ptrB] == this.PLANE_FORM){
				let xr = this.M[O_W1X + ptrA] - this.M[O_W0X + ptrA];
				let yr = this.M[O_W1Y + ptrA] - this.M[O_W0Y + ptrA];
				let xs = this.M[O_W1X + ptrB] - this.M[O_W0X + ptrB];
				let ys = this.M[O_W1Y + ptrB] - this.M[O_W0Y + ptrB];
				let rxs = xr * ys - yr * xs;
				let xq_p = (this.M[O_W0X + ptrB] - this.M[O_W0X + ptrA]);
				let yq_p = (this.M[O_W0Y + ptrB] - this.M[O_W0Y + ptrA]);
				let t = (xq_p * ys - yq_p * xs) / rxs;
				let u = (xq_p * yr - yq_p * xr) / rxs;
				if(t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0) return true;
				t = Math.max(0.0, Math.min(t, 1.0));
				if(this.isPointInside(ptrB, this.M[O_W0X + ptrA] + xr * t, this.M[O_W0Y + ptrA] + yr * t, this.M[O_HALF_WIDTH + ptrA])) {
					return true;
				}
				return false;

			} else if(this.M[O_FORM + ptrB] == this.POLYGON_FORM){
			

				// temp
				return false;


			} else {
				console.error("Unhandled form: " + this.M[O_FORM + ptrB]);
			}
		} else {
			console.error("Unhandled form: " + this.M[O_FORM + ptrA]);
		}
		return false;
	},

	isWithinAABB(AABB_Ptr, poPtr){
		if(!this.M[O_FORM + AABB_Ptr] == this.AABB_FORM) consle.error("First argument is not reference to AABB_FORM");
		let bForm = this.M[O_FORM + poPtr];

		if(bForm == this.CIRCLE_FORM){
			if(this.M[O_TX + poPtr] + this.M[O_RADIUS + poPtr] > this.M[O_MAX_X + AABB_Ptr]) return false;
			if(this.M[O_TY + poPtr] + this.M[O_RADIUS + poPtr] > this.M[O_MAX_Y + AABB_Ptr]) return false;
			if(this.M[O_TX + poPtr] - this.M[O_RADIUS + poPtr] < this.M[O_MIN_X + AABB_Ptr]) return false;
			if(this.M[O_TY + poPtr] - this.M[O_RADIUS + poPtr] < this.M[O_MIN_Y + AABB_Ptr]) return false;
			return true;

		} else if(bForm == this.PLANE_FORM){
			if(this.M[O_W0X + poPtr] < this.M[O_MIN_X + AABB_Ptr] || this.M[O_W0X + poPtr] > this.M[O_MAX_X + AABB_Ptr]) return false;
			if(this.M[O_W0Y + poPtr] < this.M[O_MIN_Y + AABB_Ptr] || this.M[O_W0Y + poPtr] > this.M[O_MAX_Y + AABB_Ptr]) return false;
			if(this.M[O_W1X + poPtr] < this.M[O_MIN_X + AABB_Ptr] || this.M[O_W1X + poPtr] > this.M[O_MAX_X + AABB_Ptr]) return false;
			if(this.M[O_W1Y + poPtr] < this.M[O_MIN_Y + AABB_Ptr] || this.M[O_W1Y + poPtr] > this.M[O_MAX_Y + AABB_Ptr]) return false;
			return true;

		} else {
			console.error("Unhandled form: " + this.M[O_FORM + poPtr] + ".");
		}
	},

	createContacts(poPtr, groups){
		for(let i = 0, len = this.poTotal; i < len; ++i){
			let bPtr = this.PO_PTRS[i];
			if(bPtr != poPtr && groups.includes(this.M[O_GROUP + bPtr])) {
				this.createConstraint({type: this.COLLISION_TYPE, poPtrA: poPtr, poPtrB: bPtr});
			}
		}
	},

	getForm(poPtr){
		return this.M[O_FORM + poPtr];
	},

	getType(poPtr){
		return this.M[O_TYPE + poPtr];
	},

	getGroup(poPtr){
		return this.M[O_GROUP + poPtr];
	},

	setPosition(poPtr, x, y){
		this.M[O_TX + poPtr] = x;
		this.M[O_TY + poPtr] = y;
		this.updateWorldPositions(poPtr);
	},

	getPosition(poPtr){
		return [this.M[O_TX + poPtr], this.M[O_TY + poPtr]];
	},

	getLocalPosition(poPtr, wx, wy){
		let x = wx - this.M[O_TX + poPtr];
		let y = wy - this.M[O_TY + poPtr];
		return [
			x * this.M[O_COS + poPtr] + y * this.M[O_SIN + poPtr],
			y * this.M[O_COS + poPtr] - x * this.M[O_SIN + poPtr]
		];
	},

	setOrientation(poPtr, o){
		this.M[O_O + poPtr] = o;
		this.M[O_COS + poPtr] = Math.cos(o);
		this.M[O_SIN + poPtr] = Math.sin(o);
		this.updateWorldPositions(poPtr);
	},

	setVertex(poPtr, vertexIndex, x, y){
		if(this.M[O_FORM + poPtr] == this.PLANE_FORM){
			if(vertexIndex == 0){
				this.M[O_W0X + poPtr] = x;
				this.M[O_W0Y + poPtr] = y;
			} else if(vertexIndex == 1) {
				this.M[O_W1X + poPtr] = x;
				this.M[O_W1Y + poPtr] = y;
			} else {
				console.error("Cannot set vertex: " + vertexIndex + " of this.PLANE_FORM.");
			}
			this.M[O_TX + poPtr] = (this.M[O_W0X + poPtr] + this.M[O_W1X + poPtr]) * 0.5;
			this.M[O_TY + poPtr] = (this.M[O_W0Y + poPtr] + this.M[O_W1Y + poPtr]) * 0.5;
			let dx = this.M[O_W1X + poPtr] - this.M[O_W0X + poPtr];
			let dy = this.M[O_W1Y + poPtr] - this.M[O_W0Y + poPtr];
			this.M[O_L + poPtr] =  Math.sqrt(dx * dx + dy * dy);
			this.M[O_L_INV + poPtr] =  1.0 / this.M[O_L + poPtr];
			this.M[O_UX + poPtr] = dx * this.M[O_L_INV + poPtr];
			this.M[O_UY + poPtr] = dy * this.M[O_L_INV + poPtr];
			


			if(this.M[O_L + poPtr] < this.MIN_PLANE_LEN){
				console.log("rod too small");
				let x = 0.0;
				let y = 0.0;
				let mx = this.M[O_UX + poPtr] * this.MIN_PLANE_LEN * 1.01;
				let my = this.M[O_UY + poPtr] * this.MIN_PLANE_LEN * 1.01;
				if(vertexIndex == 0){
					if(this.M[O_L + poPtr] < 0.0001){
						x = this.M[O_W1X + poPtr] - this.MIN_PLANE_LEN * 1.01;
						y = this.M[O_W1Y + poPtr];
					} else {
						x = this.M[O_W1X + poPtr] - mx;
						y = this.M[O_W1Y + poPtr] - my;
					}
				} else {
					if(this.M[O_L + poPtr] < 0.0001){
						x = this.M[O_W0X + poPtr] + this.MIN_PLANE_LEN * 1.01;
						y = this.M[O_W0Y + poPtr];
					} else {
						x = this.M[O_W0X + poPtr] + mx;
						y = this.M[O_W0Y + poPtr] + my;
					}
				}
				this.setVertex(poPtr, vertexIndex, x, y);
				return;
			}




			this.M[O_L0X + poPtr] = this.M[O_W0X + poPtr] - this.M[O_TX + poPtr];
			this.M[O_L0Y + poPtr] = this.M[O_W0Y + poPtr] - this.M[O_TY + poPtr];
			this.M[O_L1X + poPtr] = this.M[O_W1X + poPtr] - this.M[O_TX + poPtr];
			this.M[O_L1Y + poPtr] = this.M[O_W1Y + poPtr] - this.M[O_TY + poPtr];
			if(this.M[O_TYPE + poPtr] == this.MOVABLE_TYPE) {
				this.M[O_M + poPtr] = this.M[O_P + poPtr] * this.M[O_HALF_WIDTH + poPtr] * 2.0 * this.M[O_L + poPtr];
				this.M[O_M_INV + poPtr] = 1.0 / this.M[O_M + poPtr];
				// tune?
				this.M[O_I + poPtr] = 0.2 * this.M[O_M + poPtr] * this.M[O_L + poPtr] * this.M[O_L + poPtr];
				this.M[O_I_INV + poPtr] = 1.0 / this.M[O_I + poPtr];
			} else {
				this.M[O_M + poPtr] = 0.0;
				this.M[O_M_INV + poPtr] = 0.0;
				this.M[O_I + poPtr] = 0.0;
				this.M[O_I_INV + poPtr] = 0.0;
			}
			



		} else if(this.AABB_FORM){
			if(vertexIndex == 0){
				this.M[O_MIN_X + poPtr] = x;
				this.M[O_MIN_Y + poPtr] = y;
			} else if(vertexIndex == 1) {
				this.M[O_MAX_X + poPtr] = x;
				this.M[O_MAX_Y + poPtr] = y;
			}
			if(this.M[O_MIN_X + poPtr] > this.M[O_MAX_X + poPtr] - this.MIN_AABB_LEN){
				this.M[O_MAX_X + poPtr] = this.M[O_MIN_X + poPtr] + this.MIN_AABB_LEN;
			}
			if(this.M[O_MIN_Y + poPtr] > this.M[O_MAX_Y + poPtr]  - this.MIN_AABB_LEN){
				this.M[O_MAX_Y + poPtr] = this.M[O_MIN_Y + poPtr]  + this.MIN_AABB_LEN;
			}
		} else {
			console.error("unhandled form: " + this.M[O_FORM + poPtr]);
		}
	},

	setLinearVelocity(poPtr, vx, vy){
		if(this.M[O_TYPE + poPtr] == this.FIXED_TYPE) {
			console.warn("Cannot set linear velocity of PhysicsObject of type this.FIXED_TYPE");
			return;
		}
		this.M[O_VX + poPtr] = vx;
		this.M[O_VY + poPtr] = vy;
	},

	setRotationalVelocity(poPtr, w){
		if(this.M[O_TYPE + poPtr] == this.FIXED_TYPE) {
			console.warn("Cannot set rotational velocity of PhysicsObject of type this.FIXED_TYPE");
			return;
		}
		this.M[O_W + poPtr] = w;
	},

	getUserFloats(poPtr){
		let begin = this.PO_SIZES[this.M[O_FORM + poPtr]] + poPtr;
		let end = this.M[O_NUM_FLOATS + poPtr] + poPtr;
		return this.M.slice(begin, end);
	},

	setUserFloats(poPtr, source, start){
		//if(arguments.length == 2) startingIndex = 0;
		//let ufStart = this.PO_SIZES[this.M[O_FORM + poPtr]] + poPtr + start;
		let ufStart = this.M[O_USERFLOATS_PTR + poPtr] + start;
		//let ufLen = this.M[O_NUM_FLOATS + poPtr] + poPtr - 1 - ufStart;
		//if(ufLen < 0) throw "Source array larger than target userFloats size";
		//this.M.set(source.slice(0, ufLen), ufStart);
		this.M.set(source, ufStart);
	},

	getWorldVertices(poPtr){
		if(this.M[O_FORM + poPtr] == this.PLANE_FORM) return [[this.M[O_W0X + poPtr], this.M[O_W0Y + poPtr]], [this.M[O_W1X + poPtr], this.M[O_W1Y + poPtr]]];
		if(this.M[O_FORM + poPtr] == this.AABB_FORM) return [[this.M[O_MIN_X + poPtr], this.M[O_MIN_Y + poPtr]], [this.M[O_MAX_X + poPtr], this.M[O_MAX_Y + poPtr]]];
		if(this.M[O_FORM + poPtr] == this.POLYGON_FORM){
			let result = [];
			for(let v = O_NUM_VERTICES + 1 + poPtr, len = this.M[O_NUM_VERTICES + poPtr] * this.V_SIZE + v; v < len; v += this.V_SIZE){
				result.push([this.M[V_WX + v], this.M[V_WY + v]]);
			}
			return result;
		}
		console.error("Unhandled form: " + this.M[O_FORM + poPtr] + ".");
	},

	getLength(poPtr){
		if(this.M[O_FORM + poPtr] != this.PLANE_FORM) {
			console.error("Cannot get length of form: " + this.M[O_FORM + poPtr] + ".");
			return;
		}
		return this.M[O_L + poPtr];
	},

	getRadius(poPtr){
		if(this.M[O_FORM + poPtr] != this.CIRCLE_FORM) {
			console.error("Cannot get radius of non-CIRCLE_FORM physics object.");
			return;
		}
		return this.M[O_RADIUS + poPtr];
	},
}

pw.POMM = new MemoryManager(pw.M);