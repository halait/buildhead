"use strict";


/*
class RevoluteJoint extends Constraint {
	
	solveVelocity(){
		if(this.data.isMotor){
			let aa = this.data.vA[2] - this.data.vB[2] - this.data.motorW;
			let t = aa * this.data.motorInertiaB;
			if(this.data.appliedT + Math.abs(t) > this.data.maxMotorT) {
				if(this.data.appliedT < this.data.maxMotorT){
					if(t < 0) t = this.data.appliedT - this.data.maxMotorT;
					else t = this.data.maxMotorT - this.data.appliedT;
				} else {
					t = 0.0;
				}
			}
			if(this.data.typeA == MOVABLE) this.data.vA[2] -= t / this.data.motorInertiaA;
			if(this.data.typeB == MOVABLE) this.data.vB[2] += t / this.data.motorInertiaB;
			this.data.appliedT += Math.abs(t);
		}
		if(this.data.dist < 0.0000000001) return;
		let vx = this.data.vA[0] + this.data.vA[2] * this.data.rxAP -
			this.data.vB[0] - this.data.vB[2] * this.data.rxBP;
		let vy = this.data.vA[1] + this.data.vA[2] * this.data.ryAP - this.data.vB[1] -
			this.data.vB[2] * this.data.ryBP;
		let vn = vx * this.data.nx + vy * this.data.ny;
		let j = vn / this.data.massEff;
		if(this.data.typeA == MOVABLE){
			this.data.vA[0] -= j * this.data.nx * this.data.mInvA;
			this.data.vA[1] -= j * this.data.ny * this.data.mInvA;
			this.data.vA[2] -= j * this.data.dotperpA * this.data.iInvA;
		}
		if(this.data.typeB == MOVABLE){
			this.data.vB[0] += j * this.data.nx * this.data.mInvB;
			this.data.vB[1] += j * this.data.ny * this.data.mInvB;
			this.data.vB[2] += j * this.data.dotperpB * this.data.iInvB;
		}
	}
}
*/

function pwDestroyAll(){
	cdIndicesEnd = 0;
	podIndicesEnd = 0;
	cd_endIndex = 1;
	endIndex = 1;
}

const COLLISION_FORM = 4;
const JOINT_FORM = 5;

const POINTS_TYPE = 1;
const POINT_SURFACE_TYPE = 2;
const SURFACES_TYPE = 3;
const REVOLUTE_TYPE = 4;

const C_NUM_PROPERTIES = new Uint8Array([0, 20, 20, 34, 20]);


const C_TYPE = 0;
const C_FORM = 1;
const C_OBJA_SI = 2;
const C_OBJB_SI = 3;
const C_US = 4;
const C_UK = 5;

const C_ACTIVE = 6;
const C_RAX = 7;
const C_RAY = 8;
const C_RBX = 9;
const C_RBY = 10;

// COLLISION_FORM only
const C_NX = 11;
const C_NY = 12;
const C_DIST = 13;
const C_RNA = 14;
const C_RNB = 15;
const C_M = 16;
const C_RTA = 17;
const C_RTB = 18;
const C_MT = 19;

/*
const C_ACTIVE = 20;
const C_NX = 21;
const C_NY = 22;
const C_DIST = 23;
const C_RAX = 24;
const C_RAY = 25;
const C_RBX = 26;
const C_RBY = 27;
const C_RNA = 28;
const C_RNB = 29;
const C_M = 30;
const C_RTA = 31;
const C_RTB = 32;
const C_MT = 33;
*/

// revolute only
const C_LAX = 11;
const C_LAY = 12;
const C_LBX = 13;
const C_LBY = 14;
const C_IS_MOTOR = 15;
const C_MW = 16;
const C_M_MAX_T = 17;
const C_SUM_T = 18;
const C_M_I = 19;
//const C_RMB = 19;
//const C_RMA_INV = 20;
//const C_RMA = 20;
//const C_RMB_INV = 21;


const CD_INDICES_LEN = 1800;
const CD_INDICES = new Uint16Array(CD_INDICES_LEN);
let cdIndicesEnd = 0;

let cd_endIndex = 1;
const MAX_CONSTRAINT_DATA = 65000;
const CD = new Float32Array(MAX_CONSTRAINT_DATA);

function pwCreateConstraint(def){
	if(cd_endIndex + C_NUM_PROPERTIES[def.type] > MAX_CONSTRAINT_DATA) console.error("MAX_CONSTRAINT_DATA reached");
	if(def.objA_Si === undefined || def.objB_Si === undefined) console.error("Missing objA_Si and/or objB_Si.");
	if(def.type === undefined || def.form === undefined) console.error("Missing constraint form and/or type.");
	if(def.objA_Si === def.objB_Si) console.error("def.objA_Si === def.objB_Si");

	let si = cd_endIndex;
	cd_endIndex += C_NUM_PROPERTIES[def.type];
	CD[C_TYPE + si] = def.type;
	CD[C_FORM + si] = def.form;
	CD[C_OBJA_SI + si] = def.objA_Si;
	CD[C_OBJB_SI + si] = def.objB_Si;
	CD[C_US + si] = (POD[O_US + def.objA_Si] + POD[O_US + def.objB_Si]) * 0.5;
	CD[C_UK + si] = (POD[O_UK + def.objA_Si] + POD[O_UK + def.objB_Si]) * 0.5;

	if(def.form == JOINT_FORM){
		CD[C_ACTIVE + si] = 1;
		let dax = def.x - POD[O_TX + def.objA_Si];
		let day = def.y - POD[O_TY + def.objA_Si];
		let dbx = def.x - POD[O_TX + def.objB_Si];
		let dby = def.y - POD[O_TY + def.objB_Si];
		/*
		CD[C_LAX + si] = dax * POD[O_COS + def.objA_Si] + day * POD[O_SIN + def.objA_Si];
		CD[C_LAY + si] = day * POD[O_COS + def.objA_Si] - dax * POD[O_SIN + def.objA_Si];
		CD[C_LBX + si] = dbx * POD[O_COS + def.objB_Si] + dby * POD[O_SIN + def.objB_Si];
		CD[C_LBY + si] = dby * POD[O_COS + def.objB_Si] - dbx * POD[O_SIN + def.objB_Si];
		*/

		CD[C_LAX + si] = dax;
		CD[C_LAY + si] = day;
		CD[C_LBX + si] = dbx;
		CD[C_LBY + si] = dby;

		if(def.motorVelocity === undefined){
			CD[C_IS_MOTOR + si] = 0;
		} else if(def.maxMotorTorque !== undefined){
			CD[C_IS_MOTOR + si] = 1;
			CD[C_MW + si] = def.motorVelocity;
			CD[C_M_MAX_T + si] = def.maxMotorTorque;
			//CD[C_RMA_INV + si] = 1.0 / POD[O_I + def.objA_Si] + POD[O_M + def.objA_Si] * (dax * dax + day * day);
			//CD[C_RMA + si] = POD[O_I + def.objA_Si] + POD[O_M + def.objA_Si] * (dax * dax + day * day);
			//CD[C_RMB + si] = POD[O_I + def.objB_Si] + POD[O_M + def.objB_Si] * (dbx * dbx + dby * dby);
			//CD[C_RMB_INV + si] = 1.0 / CD[C_RMB + si];
			let motorInertia = POD[O_I_INV + def.objA_Si] + POD[O_I_INV + def.objB_Si];
			if(motorInertia){
				motorInertia = 1.0 / motorInertia;
			}
			CD[C_M_I + si] = motorInertia;
		} else {
			console.warn("Missing maxMotorTorque required to create motor joint.");
		}
	}
	for(let i = 0, len = cdIndicesEnd; i < len; ++i){
		if(CD_INDICES[i] == 0) {
			CD_INDICES[i] = si;
			return i;
		}
	}
	CD_INDICES[cdIndicesEnd] = si;
	return cdIndicesEnd++;
}

function pwCreateJoint(def){
	if(def.poA_Id === undefined || def.poB_Id === undefined) console.error("Missing poA_Id and/or poB_Id.");
	if(def.type === undefined) console.error("Missing joint type.");
	if(def.x === undefined || def.y === undefined) console.error("Missing x and/or y (position).");

	let constraintDefinition = {
		form: JOINT_FORM,
		type: def.type,
		objA_Si: pwGetStartingIndex(def.poA_Id),
		objB_Si: pwGetStartingIndex(def.poB_Id),
		x: def.x, 
		y: def.y,
		motorVelocity: def.motorVelocity,
		maxMotorTorque: def.maxMotorTorque
	};

	for(let id = 0, len = cdIndicesEnd; id < len; ++id){
		let si = CD_INDICES[id];
		if(CD[C_FORM + si] == COLLISION_FORM){
			if((CD[C_OBJA_SI + si] === constraintDefinition.objA_Si && CD[C_OBJB_SI + si] === constraintDefinition.objB_Si) ||
				(CD[C_OBJB_SI + si] === constraintDefinition.objA_Si && CD[C_OBJA_SI + si] === constraintDefinition.objB_Si)){
				pwDestroyConstraint(id);
			}
		}
	}
	return pwCreateConstraint(constraintDefinition);
}

function pwGetJointAnchorPositionA(cId){
	let si = pwGetConstraintStartingIndex(cId);
	let asi = CD[C_OBJA_SI + si];
	return [
		(CD[C_LAX + si] * POD[O_COS + asi] - CD[C_LAY + si] * POD[O_SIN + asi]) + POD[O_TX + asi],
		(CD[C_LAY + si] * POD[O_COS + asi] + CD[C_LAX + si] * POD[O_SIN + asi]) + POD[O_TY + asi]
	]
}
/*
function pwDestroyJoint(cId){
	pwDestroyConstraint(cId);
}
*/
function pwDestroyConstraint(cId){
	console.log("destroying constraint: " + cId);
	let si = pwGetConstraintStartingIndex(cId);
	let shift = C_NUM_PROPERTIES[CD[C_TYPE + si]];
	let start = shift + si;
	CD.copyWithin(si, start, cd_endIndex);
	cd_endIndex -= shift;
	CD_INDICES[cId] = 0;
	for(let i = 0, len = cdIndicesEnd; i < len; ++i){
		if(CD_INDICES[i] > si) CD_INDICES[i] -= shift;
	}
}

function pwSetJointPosition(cId, x, y){
	let si = pwGetConstraintStartingIndex(cId);
	if(!CD[C_FORM + si] == JOINT_FORM){
		console.error("Cannot set joint position of non-JOINT_FORM constraint.");
		return;
	}
	let asi = CD[C_OBJA_SI + si];
	let bsi = CD[C_OBJB_SI + si];
	let dax = x - POD[O_TX + asi];
	let day = y - POD[O_TY + asi];
	let dbx = x - POD[O_TX + bsi];
	let dby = y - POD[O_TY + bsi];
	CD[C_LAX + si] = dax * POD[O_COS + asi] + day * POD[O_SIN + asi];
	CD[C_LAY + si] = day * POD[O_COS + asi] - dax * POD[O_SIN + asi];
	CD[C_LBX + si] = dbx * POD[O_COS + bsi] + dby * POD[O_SIN + bsi];
	CD[C_LBY + si] = dby * POD[O_COS + bsi] - dbx * POD[O_SIN + bsi];
	//CD[C_RMA_INV + si] = 1.0 / (POD[O_I + asi] + POD[O_M + asi] * (dax * dax + day * day));
	//CD[C_RMB + si] = POD[O_I + bsi] + POD[O_M + bsi] * (dbx * dbx + dby * dby);
	//CD[C_RMB_INV + si] = 1.0 / CD[C_RMB + si];
	let motorInertia = POD[O_I_INV + asi] + POD[O_I_INV + bsi];
	if(motorInertia){
		motorInertia = 1.0 / motorInertia;
	}
	CD[C_M_I + si] = motorInertia;
}

function pwGetConstraintStartingIndex(cId){
	if(cId < 0) console.error("Constraint id cannot be negative.");
	let si = CD_INDICES[cId];
	if(si == 0) console.error("Constraint with id: " + cId + " does not exist.");
	return si;
}




// For now two types of physics objects, maybe more in the future.
// Fixed objects simulate massive objects that are not effected by forces perfect for ground platforms.
const FIXED_TYPE = 0;
// Movable objects simulate regular objects must set mass after instantiating new objects of this type.
const MOVABLE_TYPE = 1;
// Forms for quick evaluation of object type only two GameObject for now, polygon form coming in the future?
// Plane form is not just a plane its just the best word I could find to describe if you have a more descriptive let me know.
// Plane form can be imagined as tic tac with arbitrary length and width, its described with two vertices 
// that are connected by mass with specified width, at the vertices themselves there exists two circular 
// masses that have a diameter equal to the specified width
const PLANE_FORM = 1;
const CIRCLE_FORM = 2;
const AABB_FORM = 3;

//const COLLIDABLE_FORM = 3;
//const REVOLUTE_FORM = 4;

const AREA_FORM = 10;

const MIN_PLANE_LEN = 0.01;
const MIN_AABB_LEN = 0.05;

const NUM_PROPERTIES = new Uint8Array([0, 34, 22, 25]);

//finalize??

const O_NUM_FLOATS = 0;
const O_FORM = 1;
const O_TYPE = 2;
const O_P = 3;
const O_M = 4;
const O_M_INV = 5;
const O_I = 6;
const O_I_INV = 7;
const O_GROUP = 8;
const O_US = 9;
const O_UK = 10;
const O_VM = 11;
const O_WM = 12;
const O_VX = 13;
const O_VY = 14;
const O_W = 15;
const O_TX = 16;
const O_TY = 17;
const O_COS = 18;
const O_SIN = 19;
const O_O = 20;

// CIRCLE_FORM CUSTOM PROPERTIES
const O_RADIUS = 21;

// AABB_FORM only
const O_MIN_X = 21;
const O_MIN_Y = 22;
const O_MAX_X = 23;
const O_MAX_Y = 24;

// PLANE_FORM CUSTOM PROPERTIES
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


const POD_INDICES_LEN = 50;
const POD_INDICES = new Uint16Array(POD_INDICES_LEN);
let podIndicesEnd = 0;
const POD_LEN = 1650;
const POD = new Float32Array(POD_LEN);
var endIndex = 1;

function pwCreate(def) {
	if(def.form === undefined || def.type === undefined) {
		console.error("Missing form and/or type in PhysicsObject definition");
	}
	if(def.type == MOVABLE_TYPE && (def.density === undefined)) {
		console.error("Missing density in PhysicsObject definition of MOVABLE_TYPE");
	}

	POD[O_FORM + endIndex] = def.form;
	POD[O_TYPE + endIndex] = def.type;
	POD[O_GROUP + endIndex] = def.group;
	if(def.staticFriction === undefined) POD[O_US + endIndex] = 0.8;
	else POD[O_US + endIndex] = def.staticFriction;
	if(def.kineticFriction === undefined) POD[O_UK + endIndex] = 0.5;
	else POD[O_UK + endIndex] = def.kineticFriction;
	if(def.linearVelocityResistance === undefined) POD[O_VM + endIndex] = 0.99;
	else POD[O_VM + endIndex] = 1.0 - def.linearVelocityResistance;
	if(def.rotationalVelocityResistance === undefined) POD[O_WM + endIndex] = 0.99;
	else POD[O_WM + endIndex] = 1.0 - def.rotationalVelocityResistance;
	POD[O_VX + endIndex] = 0.0;
	POD[O_VY + endIndex] = 0.0;
	POD[O_W + endIndex] = 0.0;
	POD[O_COS + endIndex] = 1.0;
	POD[O_SIN + endIndex] = 0.0;
	POD[O_O + endIndex] = 0.0;
	POD[O_P + endIndex] = def.density;
	if(def.type == FIXED_TYPE){
		POD[O_P + endIndex] = 0.0;
		POD[O_M + endIndex] = 0.0;
		POD[O_M_INV + endIndex] = 0.0;
		POD[O_I + endIndex] = 0.0;
		POD[O_I_INV + endIndex] = 0.0;
	}
	if(def.form == CIRCLE_FORM) {
		if(def.radius === undefined || def.x === undefined|| def.y === undefined) {
			console.error("Missing radius and/or position (x and y) in PhysicsObject definition of CIRCLE_FORM");
		}
		POD[O_TX + endIndex] = def.x;
		POD[O_TY + endIndex] = def.y;
		POD[O_RADIUS + endIndex] = def.radius;
		if(def.type == MOVABLE_TYPE) {
			let mass = def.density * Math.PI * def.radius * def.radius;
			// is mass needed or only m_inv?
			POD[O_M + endIndex] = mass;
			POD[O_M_INV + endIndex] = 1.0 / mass;
			// tune?
			POD[O_I + endIndex] = 0.75 * mass * def.radius * def.radius;
			POD[O_I_INV + endIndex] = 1.0 / POD[O_I + endIndex];
		}
	} else if(def.form == PLANE_FORM) {
		if(def.vertices === undefined || def.vertices.length != 2){
			console.error("Missing vertices or vertices not of length 2 in PhysicsObject def of PLANE_FORM");
		}
		if(def.width === undefined){
			console.error("Missing width in PhysicsObject definition of PLANE_FORM");
		}
		if(def.vertices[0][0] == def.vertices[1][0] && def.vertices[0][1] == def.vertices[1][1]){
			def.vertices[1][0] = def.vertices[0][0] + MIN_PLANE_LEN;
		}
		POD[O_TX + endIndex] = (def.vertices[0][0] + def.vertices[1][0]) * 0.5;
		POD[O_TY + endIndex] = (def.vertices[0][1] + def.vertices[1][1]) * 0.5;
		let dx = def.vertices[1][0] - def.vertices[0][0];
		let dy = def.vertices[1][1] - def.vertices[0][1];
		POD[O_L + endIndex] =  Math.sqrt(dx * dx + dy * dy);
		POD[O_L_INV + endIndex] =  1.0 / POD[O_L + endIndex];
		POD[O_L0X + endIndex] = def.vertices[0][0] - POD[O_TX + endIndex];
		POD[O_L0Y + endIndex] = def.vertices[0][1] - POD[O_TY + endIndex];
		POD[O_L1X + endIndex] = def.vertices[1][0] - POD[O_TX + endIndex];
		POD[O_L1Y + endIndex] = def.vertices[1][1] - POD[O_TY + endIndex];
		POD[O_W0X + endIndex] = def.vertices[0][0];
		POD[O_W0Y + endIndex] = def.vertices[0][1];
		POD[O_W1X + endIndex] = def.vertices[1][0];
		POD[O_W1Y + endIndex] = def.vertices[1][1];
		POD[O_UX + endIndex] = dx * POD[O_L_INV + endIndex];
		POD[O_UY + endIndex] = dy * POD[O_L_INV + endIndex];
		POD[O_HALF_WIDTH + endIndex] = def.width * 0.5;
		if(def.type == MOVABLE_TYPE) {
			let mass = def.density * def.width * POD[O_L + endIndex];
			POD[O_M + endIndex] = mass;
			POD[O_M_INV + endIndex] = 1.0 / mass;
			// tune?
			POD[O_I + endIndex] = 0.2 * mass * POD[O_L + endIndex] * POD[O_L + endIndex];
			POD[O_I_INV + endIndex] = 1.0 / POD[O_I + endIndex];
		}
	} else if(def.form == AABB_FORM){
		if(def.vertices === undefined || def.vertices.length != 2){
			console.error("Missing vertices or vertices not of length 2 in PhysicsObject definition of AABB_FORM");
		}
		POD[O_MIN_X + endIndex] = def.vertices[0][0];
		POD[O_MIN_Y + endIndex] = def.vertices[0][1];
		POD[O_MAX_X + endIndex] = def.vertices[1][0];
		POD[O_MAX_Y + endIndex] = def.vertices[1][1];

	} else {
		console.error("Unhandled form: " + def.form + ".");
	}

	let ufi = NUM_PROPERTIES[def.form] + endIndex;
	if(def.userFloats !== undefined){
		for(let i  = 0, len = def.userFloats.length; i < len; ++i, ++ufi){
			//console.log("setting i = " + i);
			POD[ufi] = def.userFloats[i];
		}
	}
	POD[O_NUM_FLOATS + endIndex] = ufi - endIndex;
	let index = endIndex;
	endIndex = ufi;
	// return id
	for(let i = 0, s = podIndicesEnd; i < s; ++i){
		if(POD_INDICES[i] == 0) {
			POD_INDICES[i] = index;
			return i;
		}
	}
	POD_INDICES[podIndicesEnd] = index;
	return podIndicesEnd++;
}

/*
function pwGet(poId){
	const SI = pwGetStartingIndex(poId);
	const PO = {

		startingIndex: SI,
		numFloats: POD[O_NUM_FLOATS + SI],
		form: POD[O_FORM + SI],
		type: POD[O_TYPE + SI],
		density: POD[O_P + SI],
		mass: POD[O_M + SI],
		massInverse: POD[O_M_INV + SI],
		rotationalMass: POD[O_I + SI],
		rotationalMassInverse: POD[O_I_INV + SI],
		group: POD[O_GROUP + SI],
		staticFriction: POD[O_US + SI],
		kineticFriction: POD[O_UK + SI],
		velocityResistance: 1.0 - POD[O_VM + SI],
		rotationalVelocityResistance: 1.0 - POD[O_WM + SI],
		velocityX: POD[O_VX + SI],
		velocityY: POD[O_VY + SI],
		rotationalVelocity: POD[O_W + SI],
		positionX: POD[O_TX + SI],
		positionY: POD[O_TY + SI],
		cosine: POD[O_COS + SI],
		sine: POD[O_SIN + SI],
		orientation: POD[O_O + SI]
	};
	PO.userFloats = pwGetUserFloats(poId);
	// CIRCLE_FORM CUSTOM PROPERTIES
	PO.radius = POD[O_RADIUS + SI];
	// PLANE_FORM CUSTOM PROPERTIES
	PO.length = POD[O_L + SI];
	PO.lengthInverse = POD[O_L_INV + SI];
	PO.local0X = POD[O_L0X + SI];
	PO.local0Y = POD[O_L0Y + SI];
	PO.local1X = POD[O_L1X + SI];
	PO.local1Y = POD[O_L1Y + SI];
	PO.world0X = POD[O_W0X + SI];
	PO.world0Y = POD[O_W0Y + SI];
	PO.world1X = POD[O_W1X + SI];
	PO.world1Y = POD[O_W1Y + SI];
	PO.unitVectorX = POD[O_UX + SI];
	PO.unitVectorY = POD[O_UY + SI];
	PO.halfWidth = POD[O_HALF_WIDTH + SI];
	return PO;
}
*/

function pwDestroy(poId){
	const SI = pwGetStartingIndex(poId);
	const SHIFT = POD[O_NUM_FLOATS + SI];
	let start = SHIFT + SI;
	POD.copyWithin(SI, start, endIndex);
	endIndex -= SHIFT;
	POD_INDICES[poId] = 0;
	for(let i = 0, len = podIndicesEnd; i < len; ++i){
		if(POD_INDICES[i] > SI){
			POD_INDICES[i] -= SHIFT;
		}
	}

	for(let cId = 0, len = cdIndicesEnd; cId < len; ++cId){
		let csi = CD_INDICES[cId];
		if(csi == 0) continue;
		if(CD[C_OBJA_SI + csi] === SI || CD[C_OBJB_SI + csi] === SI){
			pwDestroyConstraint(cId);
			continue;
		}
		if(CD[C_OBJA_SI + csi] > SI) CD[C_OBJA_SI + csi] -= SHIFT;
		if(CD[C_OBJB_SI + csi] > SI) CD[C_OBJB_SI + csi] -= SHIFT;
	}
}

function pwIsPointInside(poId, x, y, radius){
	if(arguments.length == 3) radius = 0.0;
	let si = pwGetStartingIndex(poId);
	let maxDist = 0.0;
	let px = 0.0;
	let py = 0.0;
	if(POD[O_FORM + si] == CIRCLE_FORM){
		px = POD[O_TX + si];
		py = POD[O_TY + si];
		maxDist = POD[O_RADIUS + si];

	} else if(POD[O_FORM + si] == PLANE_FORM){
		let dot = (x - POD[O_W0X + si]) * POD[O_UX + si] + (y - POD[O_W0Y + si]) * POD[O_UY + si];
		dot = Math.max(0.0, Math.min(POD[O_L + si], dot));
		px = POD[O_UX + si] * dot + POD[O_W0X + si];
		py = POD[O_UY + si] * dot + POD[O_W0Y + si];
		maxDist = POD[O_HALF_WIDTH + si];

	} else if(POD[O_FORM + si] == AABB_FORM){
		if(x + radius < POD[O_MIN_X + si] || y + radius < POD[O_MIN_Y + si]) return false;
		if(x - radius > POD[O_MAX_X + si] || y - radius > POD[O_MAX_Y + si]) return false;
	/*
		if(x + radius < POD[O_MIN_X + si]) return false;
		if(y + radius < POD[O_MIN_Y + si]) return false;
		if(x - radius > POD[O_MAX_X + si]) return false;
		if(y - radius > POD[O_MAX_Y + si]) return false;
		*/
		return true;

	} else {
		console.error("Unhandled form: " + POD[O_FORM + si] + ".");
	}
	x -= px;
	y -= py;
	if(Math.sqrt(x * x + y * y) - radius < maxDist){
		return true;
	}
	return false;
}

function pwIsPenetrating(poId, targetId){
	if(poId == targetId) return false;
	let si = pwGetStartingIndex(poId);
	if(POD[O_FORM + si] == CIRCLE_FORM){
		if(pwIsPointInside(targetId, POD[O_TX + si], POD[O_TY + si], POD[O_RADIUS + si])){
			return true;
		}

	} else if(POD[O_FORM + si] == PLANE_FORM){
		let tsi = pwGetStartingIndex(targetId);
		let collisionData = false;
		if(POD[O_FORM + tsi] == CIRCLE_FORM){
			if(pwIsPointInside(poId, POD[O_TX + tsi], POD[O_TY + tsi], POD[O_RADIUS + tsi])) return true;

		} else if(POD[O_FORM + tsi] == PLANE_FORM){
			let xr = POD[O_W1X + si] - POD[O_W0X + si];
			let yr = POD[O_W1Y + si] - POD[O_W0Y + si];
			let xs = POD[O_W1X + tsi] - POD[O_W0X + tsi];
			let ys = POD[O_W1Y + tsi] - POD[O_W0Y + tsi];
			let rxs = xr * ys - yr * xs;
			let xq_p = (POD[O_W0X + tsi] - POD[O_W0X + si]);
			let yq_p = (POD[O_W0Y + tsi] - POD[O_W0Y + si]);
			let t = (xq_p * ys - yq_p * xs) / rxs;
			let u = (xq_p * yr - yq_p * xr) / rxs;
			if(t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0) return true;
			t = Math.max(0.0, Math.min(t, 1.0));
			if(pwIsPointInside(targetId, POD[O_W0X + si] + xr * t, POD[O_W0Y + si] + yr * t, POD[O_HALF_WIDTH + si])) {
				return true;
			}
		} else {
			console.error("Unhandled form: " + POD[O_FORM + tsi]);
		}
	} else {
		console.error("Unhandled form: " + POD[O_FORM + si]);
	}
	return false;
}

function pwIsWithinAABB(AABB_Ref, poRef){
	let si = pwGetStartingIndex(AABB_Ref);
	if(!POD[O_FORM + si] == AABB_FORM) consle.error("First argument is not reference to AABB_FORM");
	let tsi = pwGetStartingIndex(poRef);
	let bForm = POD[O_FORM + tsi];
	if(bForm == CIRCLE_FORM){
		if(POD[O_TX + tsi] + POD[O_RADIUS + tsi] > POD[O_MAX_X + si]) return false;
		if(POD[O_TY + tsi] + POD[O_RADIUS + tsi] > POD[O_MAX_Y + si]) return false;
		if(POD[O_TX + tsi] - POD[O_RADIUS + tsi] < POD[O_MIN_X + si]) return false;
		if(POD[O_TY + tsi] - POD[O_RADIUS + tsi] < POD[O_MIN_Y + si]) return false;
		return true;
	} else if(bForm == PLANE_FORM){
		if(POD[O_W0X + tsi] < POD[O_MIN_X + si] || POD[O_W0X + tsi] > POD[O_MAX_X + si]) return false;
		if(POD[O_W0Y + tsi] < POD[O_MIN_Y + si] || POD[O_W0Y + tsi] > POD[O_MAX_Y + si]) return false;
		if(POD[O_W1X + tsi] < POD[O_MIN_X + si] || POD[O_W1X + tsi] > POD[O_MAX_X + si]) return false;
		if(POD[O_W1Y + tsi] < POD[O_MIN_Y + si] || POD[O_W1Y + tsi] > POD[O_MAX_Y + si]) return false;
		return true;
	} else {
		console.error("Unhandled form: " + POD[O_FORM + tsi] + ".");
	}
	
}

function pwGetStartingIndex(objId){
	let si = POD_INDICES[objId];
	if(si == 0) console.error("PhysicsObject with ID: " + objId + " does not exist.");
	return si;
}

function pwCreateContacts(objId, groups){
	let asi = pwGetStartingIndex(objId);
	for(let bsi = 1, len = endIndex; bsi < len; bsi += POD[O_NUM_FLOATS + bsi]){
		if(bsi == asi || !groups.includes(POD[O_GROUP + bsi])) continue;
		let aForm = POD[O_FORM + asi];
		let bForm = POD[O_FORM + bsi];
		if(aForm == CIRCLE_FORM){
			if(bForm == PLANE_FORM){
				pwCreateConstraint({type: POINT_SURFACE_TYPE, form: COLLISION_FORM, objA_Si: asi, objB_Si: bsi});
			} else if(bForm == CIRCLE_FORM) {
				pwCreateConstraint({type: POINTS_TYPE, form: COLLISION_FORM, objA_Si: asi, objB_Si: bsi});
			} else {
				console.error("Unhandled form: " + bForm + ".");
			}
		} else if(aForm == PLANE_FORM){
			if(bForm == CIRCLE_FORM){
				pwCreateConstraint({type: POINT_SURFACE_TYPE, form: COLLISION_FORM, objA_Si: bsi, objB_Si: asi});
			} else if(bForm == PLANE_FORM) {
				pwCreateConstraint({type: SURFACES_TYPE, form: COLLISION_FORM, objA_Si: asi, objB_Si: bsi});
			} else {
				console.error("Unhandled form: " + bForm + ".");
			}
		} else {
			console.error("unhandled collision form, POD[O_FORM + asi] = " + POD[O_FORM + asi]);
		}
	}
}

function pwGetForm(poId){
	return POD[O_FORM + pwGetStartingIndex(poId)];
}

function pwGetType(poId){
	return POD[O_TYPE + pwGetStartingIndex(poId)];
}

function pwSetPosition(poId, x, y){
	let si = POD_INDICES[poId];
	POD[O_TX + si] = x;
	POD[O_TY + si] = y;
	pwUpdateWorldPositions(si);
}

function pwGetPosition(poId){
	let si = pwGetStartingIndex(poId);
	return [POD[O_TX + si], POD[O_TY + si]];
}

function pwGetLocalPosition(poId, wx, wy){
	let si = pwGetStartingIndex(poId);
	let x = wx - POD[O_TX + si];
	let y = wy - POD[O_TY + si];
	return [
		x * POD[O_COS + si] + y * POD[O_SIN + si],
		y * POD[O_COS + si] - x * POD[O_SIN + si]
	];
}

function pwSetOrientation(poId, o){
	let si = POD_INDICES[poId];
	POD[O_O + si] = o;
	POD[O_COS + si] = Math.cos(o);
	POD[O_SIN + si] = Math.sin(o);
	pwUpdateWorldPositions(si);
}

function pwSetVertex(PoId, vertexIndex, x, y){
	let si = pwGetStartingIndex(PoId);
	if(POD[O_FORM + si] == PLANE_FORM){
		if(vertexIndex == 0){
			POD[O_W0X + si] = x;
			POD[O_W0Y + si] = y;
		} else if(vertexIndex == 1) {
			POD[O_W1X + si] = x;
			POD[O_W1Y + si] = y;
		} else {
			console.error("Cannot set vertex: " + vertexIndex + " of PLANE_FORM.");
		}
		POD[O_TX + si] = (POD[O_W0X + si] + POD[O_W1X + si]) * 0.5;
		POD[O_TY + si] = (POD[O_W0Y + si] + POD[O_W1Y + si]) * 0.5;
		let dx = POD[O_W1X + si] - POD[O_W0X + si];
		let dy = POD[O_W1Y + si] - POD[O_W0Y + si];
		POD[O_L + si] =  Math.sqrt(dx * dx + dy * dy);
		POD[O_L_INV + si] =  1.0 / POD[O_L + si];
		POD[O_L0X + si] = POD[O_W0X + si] - POD[O_TX + si];
		POD[O_L0Y + si] = POD[O_W0Y + si] - POD[O_TY + si];
		POD[O_L1X + si] = POD[O_W1X + si] - POD[O_TX + si];
		POD[O_L1Y + si] = POD[O_W1Y + si] - POD[O_TY + si];
		POD[O_UX + si] = dx * POD[O_L_INV + si];
		POD[O_UY + si] = dy * POD[O_L_INV + si];
		if(POD[O_TYPE + si] == MOVABLE_TYPE) {
			POD[O_M + si] = POD[O_P + si] * POD[O_HALF_WIDTH + si] * 2.0 * POD[O_L + si];
			POD[O_M_INV + si] = 1.0 / POD[O_M + si];
			// tune?
			POD[O_I + si] = 0.2 * POD[O_M + si] * POD[O_L + si] * POD[O_L + si];
			POD[O_I_INV + si] = 1.0 / POD[O_I + si];
		}
		if(POD[O_L + si] < MIN_PLANE_LEN * 0.99){
			if(vertexIndex == 0){
				x = POD[O_W1X + si] - POD[O_UX + si] * MIN_PLANE_LEN;
				y = POD[O_W1Y + si] - POD[O_UY + si] * MIN_PLANE_LEN;
			} else {
				x = POD[O_W0X + si] + POD[O_UX + si] * MIN_PLANE_LEN;
				y = POD[O_W0Y + si] + POD[O_UY + si] * MIN_PLANE_LEN;
			}
			pwSetVertex(PoId, vertexIndex, x, y);
		}
	} else if(AABB_FORM){
		if(vertexIndex == 0){
			POD[O_MIN_X + si] = x;
			POD[O_MIN_Y + si] = y;
		} else if(vertexIndex == 1) {
			POD[O_MAX_X + si] = x;
			POD[O_MAX_Y + si] = y;
		}
		if(POD[O_MIN_X + si] > POD[O_MAX_X + si] - MIN_AABB_LEN){
			POD[O_MAX_X + si] = POD[O_MIN_X + si] + MIN_AABB_LEN;
		}
		if(POD[O_MIN_Y + si] > POD[O_MAX_Y + si]  - MIN_AABB_LEN){
			POD[O_MAX_Y + si] = POD[O_MIN_Y + si]  + MIN_AABB_LEN;
		}
	} else {
		console.error("unhandled form: " + POD[O_FORM + si]);
	}
}

function pwSetLinearVelocity(PoId, vx, vy){
	let sI = pwGetStartingIndex(PoId);
	if(POD[O_TYPE + sI] == FIXED_TYPE) {
		console.warn("Cannot set linear velocity of PhysicsObject of type FIXED_TYPE");
		return;
	}
	POD[O_VX + sI] = vx;
	POD[O_VY + sI] = vy;
}

function pwSetRotationalVelocity(PoId, w){
	let sI = pwGetStartingIndex(PoId);
	if(POD[O_TYPE + sI] == FIXED_TYPE) {
		console.warn("Cannot set rotational velocity of PhysicsObject of type FIXED_TYPE");
		return;
	}
	POD[O_W + sI] = w;
}

function pwGetUserFloats(poId){
	let sI = pwGetStartingIndex(poId);
	let begin = NUM_PROPERTIES[POD[O_FORM + sI]] + sI;
	let end = POD[O_NUM_FLOATS + sI] + sI;
	return POD.slice(begin, end);
}

function pwSetUserFloats(poId, source, startingIndex){
	let si = pwGetStartingIndex(poId);
	if(arguments.length == 2) startingIndex = 0;
	let userFloatsStart = NUM_PROPERTIES[POD[O_FORM + si]] + si + startingIndex;
	let userFloatsLen = POD[O_NUM_FLOATS + si] - NUM_PROPERTIES[POD[O_FORM + si]];
	let sourceLen = source.length;
	if(userFloatsLen < sourceLen) {
		console.error("Source array larger than target userFloats size");
		return;
	}
	for(let si = userFloatsStart, i = 0, len = sourceLen; i < len; ++si, ++i){
		POD[si] = source[i];
	}
}

function pwGetWorldVertices(poId){
	let si = pwGetStartingIndex(poId);
	if(POD[O_FORM + si] == PLANE_FORM) return [[POD[O_W0X + si], POD[O_W0Y + si]], [POD[O_W1X + si], POD[O_W1Y + si]]];
	if(POD[O_FORM + si] == AABB_FORM) return [[POD[O_MIN_X + si], POD[O_MIN_Y + si]], [POD[O_MAX_X + si], POD[O_MAX_Y + si]]];
	console.error("Unhandled form: " + POD[O_FORM + si] + ".");
}

function pwGetLength(poId){
	let si = pwGetStartingIndex(poId);
	if(POD[O_FORM + si] != PLANE_FORM) {
		console.error("Cannot get length of form: " + POD[O_FORM + si] + ".");
		return;
	}
	return POD[O_L + si];
}

function pwGetRadius(poId){
	let si = pwGetStartingIndex(poId);
	if(POD[O_FORM + si] =! CIRCLE_FORM) {
		console.error("Cannot get radius of non-CIRCLE_FORM.");
		return;
	}
	return POD[O_RADIUS + si];
}

function pwGetGroup(poId){
	return POD[O_GROUP + pwGetStartingIndex(poId)];
}