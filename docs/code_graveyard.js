all code goes to heaven?

// line-line collision detector and solver before it was killed
/*
				if(b != r && RevoluteJoint.isDisJoined(r, b)) {
					if((r.type == 'g' && b.type != 'g') || (r.type == 'w' && b.type == 'g') || (r.type == 'c' && b.type != 'w')) {
						let px = NaN;
						let py = NaN;
						let xAP_BP = NaN;
						let yAP_BP = NaN;
						let p0Colliding = false;
						let p1Colliding = false;
					
						let dot = (b.p0[0] - r.p0[0]) * r.xuv + (b.p0[1] - r.p0[1]) * r.yuv;				
						if(dot >= 0 && dot <= r.l) {
							let tpx = dot * r.xuv + r.p0[0];
							let tpy = dot * r.yuv + r.p0[1];
							let txP_BP = b.p0[0] - tpx;
							let tyP_BP = b.p0[1] - tpy;
							if(txP_BP * (b.xp0 - (dot * r.xpuv + r.xp0)) + tyP_BP * (b.yp0 - (dot * r.ypuv + r.yp0)) <= 0) {
								p0Colliding = true;
								xAP_BP = -txP_BP;
								yAP_BP = -tyP_BP;
								px = b.p0[0];
								py = b.p0[1];
							} else if(txP_BP * txP_BP + tyP_BP * tyP_BP < GAP_SQD) {
								p0Colliding = true;
								xAP_BP = txP_BP;
								yAP_BP = tyP_BP;
								px = b.p0[0];
								py = b.p0[1];
							}
						}
					
						dot = (b.p1[0] - r.p0[0]) * r.xuv + (b.p1[1] - r.p0[1]) * r.yuv;
						if(dot >= 0 && dot <= r.l) {
							let tpx = dot * r.xuv + r.p0[0];
							let tpy = dot * r.yuv + r.p0[1];
							let txP_BP = b.p1[0] - tpx;
							let tyP_BP = b.p1[1] - tpy;
							if(txP_BP * (b.xp1 - (dot * r.xpuv + r.xp0)) + tyP_BP * (b.yp1 - (dot * r.ypuv + r.yp0)) <= 0) {
								p1Colliding = true;
								xAP_BP = -txP_BP;
								yAP_BP = -tyP_BP;
								px = b.p1[0];
								py = b.p1[1];
							} else if(txP_BP * txP_BP + tyP_BP * tyP_BP < GAP_SQD) {
								p1Colliding = true;
								xAP_BP = txP_BP;
								yAP_BP = tyP_BP;
								px = b.p1[0];
								py = b.p1[1];
							}
						}
					
						if(p0Colliding || p1Colliding) {
							if(p0Colliding && p1Colliding) {
								px = b.com[0];
								py = b.com[1];
								b.w = 0.0;
							}
							if(xAP_BP * -r.yuv + yAP_BP * r.xuv > 0) {
								xAP_BP = -r.yuv;
								yAP_BP = r.xuv;
							} else {
								xAP_BP = r.yuv;
								yAP_BP = -r.xuv;
							}
							unsolved = true;
							dot = (px - r.p0[0]) * r.xuv + (py - r.p0[1]) * r.yuv;
							let xPerpAP = -((dot * r.yuv + r.p0[1]) - r.com[1]);
							let yPerpAP = (dot * r.xuv + r.p0[0]) - r.com[0];
							let xPerpBP = -(py - b.com[1]);
							let yPerpBP =  px - b.com[0];
							let vxAP_BP = (b.xv + b.w * xPerpBP) - (r.xv + r.w * xPerpAP);
							let vyAP_BP = (b.yv + b.w * yPerpBP) - (r.yv + r.w * yPerpAP);
							let dotperpA = xPerpAP * xAP_BP + yPerpAP * yAP_BP;
							let dotperpB = xPerpBP * xAP_BP + yPerpBP * yAP_BP;
							let nvAP = xAP_BP * vxAP_BP + yAP_BP * vyAP_BP;
							let mtInv = r.mInv + b.mInv;
							let den = mtInv + ((dotperpA * dotperpA * r.iInv) + (dotperpB * dotperpB * b.iInv));
							let j = Math.abs((E * nvAP) / den);
							//solve friction
							let fDotAP = xPerpAP * yAP_BP + yPerpAP * -xAP_BP;
							let fDotBP = xPerpBP * yAP_BP + yPerpBP * -xAP_BP
							let jf = (-yAP_BP * vxAP_BP + xAP_BP * vyAP_BP) / (mtInv + (fDotAP * fDotAP * r.iInv) + (fDotBP * fDotBP * b.iInv));
							if(Math.abs(jf) > j * 0.8) {
								if(jf > 0) jf = j * 0.6;
								else jf = j * -0.6;
							}
							if(r.type != 'g') {
								r.integrateImpulse((-j * xAP_BP + -jf * yAP_BP)  * r.mInv, (-j * yAP_BP + -jf * -xAP_BP) * r.mInv, (dotperpA * -j + fDotAP * -jf) * r.iInv);
							}
							if(b.type != 'g') {
								b.integrateImpulse((j * xAP_BP + jf * yAP_BP) * b.mInv, (j * yAP_BP + jf * -xAP_BP) * b.mInv, (dotperpB * j + fDotBP * jf) * b.iInv);
							}
						}
					}
				}
				*/
//	Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.




let xr = r.p1[0] - r.p0[0];
						let yr = r.p1[1] - r.p0[1];
						let xb = b.p1[0] - b.p0[0];
						let yb = b.p1[1] - b.p0[1];
						let rxb = xr * yb - yr * xb;
						let xq_p = b.p0[0] - r.p0[0];
						let yq_p = b.p0[1] - r.p0[1];
						let t = (xq_p * yb - yq_p * xb) / rxb;
						if(t < 0) t = 0;
						if(t > 1) t = 1;
						let xrc = r.p0[0] + t * xr;
						let yrc = r.p0[1] + t * yr;

						let dota = (xrc - b.p0[0]) * b.xuv + (yrc - b.p0[1]) * b.yuv;
						let dotb = dota;
						if(dota < 0.0) dota = 0.0;
						else if(dota > b.l) dota = b.l;
						let xbc = b.p0[0] + dota * b.xuv;
						let ybc = b.p0[1] + dota * b.yuv;

						integrateVelocity(r);
						if(dotb < 0.0 || dotb > b.l){
							let dotr = (xbc - r.p0[0]) * r.xuv + (ybc - r.p0[1]) * r.yuv;
							if(dotr < 0.0 || dotr > r.l) continue;
							xrc = r.p0[0] + dotr * r.xuv;
							yrc = r.p0[1] + dotr * r.yuv;
							t = dotr;
							xr = r.xpuv;
							yr = r.ypuv;
						} else {
							xr = r.xp1 - r.xp0;
							yr = r.yp1 - r.yp0;
						}
						let xnrc = r.xp0 + t * xr;
						let ynrc = r.yp0 + t * yr;

						integrateVelocity(b);
						let xnbc = b.xp0 + dota * b.xpuv;
						let ynbc = b.yp0 + dota * b.ypuv;
						let xd = xrc - xbc;
						let yd = yrc - ybc;
						let xn = xnrc - xnbc;
						let yn = ynrc - ynbc;
						/*
						if(pass == 1){
							markers.push({p: new Float32Array([xnrc, ynrc]), c: red});
							markers.push({p: new Float32Array([xnbc, ynbc]), c: red});
						}
						*/
						if(xd * xn + yd * yn < 0.0 || Math.abs(xd * xn + yd * yn) < 0.001){
							let xAP_BP = 0.0;
							let yAP_BP = 0.0;
							if(Math.abs(b.xuv * xd + b.yuv * yd) < Math.abs(r.xuv * xd + r.yuv * yd)){
								xAP_BP = -b.yuv;
								yAP_BP = b.xuv;
							} else {
								xAP_BP = -r.yuv;
								yAP_BP = r.xuv;
							}
							if(xAP_BP * xd + yAP_BP * yd > 0.0){
								xAP_BP = -xAP_BP;
								yAP_BP = -yAP_BP;
							}

							if(Math.abs(yr / xr - yb / xb) < 0.001){
								xrc = r.com[0];
								yrc = r.com[1];
								// caution adding angular accelaration without integrating
								r.w = 0.0;
							}


							function detectCollision(r, b){
	let xr = r.p1[0] - r.p0[0];
	let yr = r.p1[1] - r.p0[1];
	let xb = b.p1[0] - b.p0[0];
	let yb = b.p1[1] - b.p0[1];
	let xq_p = b.p0[0] - r.p0[0];
	let yq_p = b.p0[1] - r.p0[1];
	let q_pxs = xq_p * yb - yq_p * xb;
	let q_pxr = xq_p * yr - yq_p * xr;
	let rxb = xr * yb - yr * xb;
	let t = q_pxs / rxb;
	//let u = q_pxr / rxb;
	//closest points to intersection
	if(t < 0.0) t = 0.0;
	if(t > 1.0) t = 1.0;
	//if(u < 0.0) u = 0.0;
	//if(u > 1.0) u = 1.0;
	let xrc = r.p0[0] + t * xr;
	let yrc = r.p0[1] + t * yr;
	let xbc = 0.0;
	let ybc = 0.0;
	let dot = (xrc - b.p0[0]) * b.xuv + (yrc - b.p0[1]) * b.yuv;
	if(dot >= 0.0 && dot <= b.l){
		xbc = b.p0[0] + dot * b.xuv;
		ybc = b.p0[1] + dot * b.yuv;
	} else {
		if(dot < 0.0) dot = 0.0;
		else if(dot > b.l) dot = b.l;
		xbc = b.p0[0] + dot * b.xuv;
		ybc = b.p0[1] + dot * b.yuv;
		dot = (xbc - r.p0[0]) * r.xuv + (ybc - r.p0[1]) * r.yuv;
		if(dot >= 0.0 && dot <= r.l){
			xrc = r.p0[0] + dot * r.xuv;
			yrc = r.p0[1] + dot * r.yuv;
		}
	}
	if(markers.length < 10){
		markers.push({p: new Float32Array([xrc, yrc]), c: red});
		markers.push({p: new Float32Array([xbc, ybc]), c: red});
	}
	let xd = xrc - xbc;
	let yd = yrc - ybc;
	/*
	if(xd * xd + yd * yd < 0.001){
		let nx = -b.yuv;
		let ny = b.xuv;
		if(b.xuv > 0.0){
			nx = b.yuv;
			ny = -b.xuv;
		}
		if(markers.length < 20){
			markers.push({p: new Float32Array([xrc, yrc]), c: white});
			//markers.push({p: new Float32Array([-nx, -ny]), c: white});
		}
		return [nx, ny, xrc, yrc, xbc, ybc];
	}
	*/
	// move to future
	integrateVelocity(r);
	integrateVelocity(b);
	let xfr = r.xp1 - r.xp0;
	let yfr = r.yp1 - r.yp0;
	let xfb = b.xp1 - b.xp0;
	let yfb = b.yp1 - b.yp0;
	xq_p = b.xp0 - r.xp0;
	yq_p = b.yp0 - r.yp0;
	q_pxs = xq_p * yfb - yq_p * xfb;
	q_pxr = xq_p * yfr - yq_p * xfr;
	rxb = xfr * yfb - yfr * xfb;
	let tf = q_pxs / rxb;
	let uf = q_pxr / rxb;
	if(tf >= 0.0 && tf <= 1.0 && uf >= 0.0 && uf <= 1.0){
		console.log("future intersection detected");
		let nx = -b.yuv;
		let ny = b.xuv;
		if(b.xuv > 0.0){
			nx = b.yuv;
			ny = -b.xuv;
		}
		xrc = r.p0[0] + tf * xr;
		yrc = r.p0[1] + tf * yr;
		if(markers.length < 20){
			markers.push({p: new Float32Array([xrc, yrc]), c: white});
			markers.push({p: new Float32Array([-nx, -ny]), c: red});
		}
		return [nx, ny, xrc, yrc, xbc, ybc];
	}
	// future closest points to intersection
	if(tf < 0.0) tf = 0.0;
	if(tf > 1.0) tf = 1.0;
	if(uf < 0.0) uf = 0.0;
	if(uf > 1.0) uf = 1.0;
	let xfrc = r.xp0 + tf * xfr;
	let yfrc = r.yp0 + tf * yfr;
	let xfbc = b.xp0 + uf * xfb;
	let yfbc = b.yp0 + uf * yfb;
	/*
	if(markers.length < 20){
		markers.push({p: new Float32Array([xfrc, yfrc]), c: red});
		markers.push({p: new Float32Array([xfbc, yfbc]), c: red});
	}
	*/
	let xfd = xfrc - xfbc;
	let yfd = yfrc - yfbc;
	/*
	if(t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0){
		let nx = -b.yuv;
		let ny = b.xuv;
		if(b.xuv > 0.0){
			nx = b.yuv;
			ny = -b.xuv;
		}
		if(t < 0.5) t = 0.0;
		else t = 1.0;
		let xrc = r.p0[0] + t * xr;
		let yrc = r.p0[1] + t * yr;
		if(markers.length < 20){
			markers.push({p: new Float32Array([xrc, yrc]), c: white});
			markers.push({p: new Float32Array([-nx, -ny]), c: red});
		}
		console.log("lines currently intersecting");
		console.log("");
		console.log("");
		console.log("");
		console.log("");
		console.log("");
		console.log("");
		console.log("");
		return [nx, ny, xrc, yrc, xrc, yrc];
	}
	*/
	/*
	if(xd * xd + yd * yd < 0.5){
		//console.log("xd * xd + yd * yd < 0.01");
		let nx = -b.yuv;
		let ny = b.xuv;
		if(b.xuv > 0.0){
			nx = b.yuv;
			ny = -b.xuv;
		}
		if(markers.length < 20){
			markers.push({p: new Float32Array([xrc, yrc]), c: white});
			markers.push({p: new Float32Array([-nx, -ny]), c: red});
		}
		return [nx, ny, xrc, yrc, xbc, ybc];
	}
	*/
	if(xd * xfd + yd * yfd < 0.0){
		console.log("current closest point and future closest point in different directions");
		let nx = -b.yuv;
		let ny = b.xuv;
		if(b.xuv > 0.0){
			nx = b.yuv;
			ny = -b.xuv;
		}
		xrc = r.p0[0] + tf * xr;
		yrc = r.p0[1] + tf * yr;
		if(markers.length < 20){
			markers.push({p: new Float32Array([xrc, yrc]), c: white});
			markers.push({p: new Float32Array([-nx, -ny]), c: red});
		}
		return [nx, ny, xrc, yrc, xbc, ybc];
	}

}



function detectCollision(r, b){
	let dot = (r.p0[0] - b.p0[0]) * b.xuv + (r.p0[0] - b.p0[1]) * b.yuv;
	let dotTemp = dot;
	if(dot < 0.0) dot = 0.0;
	else if(dot > b.l) dot = b.l;
	let xb = b.p0[0] + dot * b.xuv;
	let yb = b.p0[1] + dot * b.yuv;
	let xr = r.p0[0];
	let yr = r.p0[1];
	if(dotTemp < 0.0 || dotTemp > b.l){
		dot = (xb - r.p0[0]) * r.xuv + (yb - r.p0[1]) * r.yuv;
		if(dot >= 0.0 && dot <= r.l){
			xr = r.p0[0] + dot * r.xuv;
			yr = r.p0[1] + dot * r.yuv;
		}
	}
	let xd = xr - xb;
	let yd = yr - yb;
	dot = (r.p1[0] - b.p0[0]) * b.xuv + (r.p1[0] - b.p0[1]) * b.yuv;
	dotTemp = dot;
	let xbt = b.p0[0] + dot * b.xuv;
	let ybt = b.p0[1] + dot * b.yuv;
	let xrt = r.p1[0];
	let yrt = r.p1[1];
	if(dotTemp < 0.0 || dotTemp > b.l){
		dot = (xbt - r.p0[0]) * r.xuv + (ybt - r.p0[1]) * r.yuv;
		if(dot >= 0.0 && dot <= r.l){
			xrt = r.p0[0] + dot * r.xuv;
			yrt = r.p0[1] + dot * r.yuv;
		}
	}
	let xdt = xrt - xbt;
	let ydt = yrt - ybt;
	if(xd * xd + yd * yd > xdt * xdt + ydt * ydt){
		xd = xdt;
		yd = ydt;
		xr = xrt;
		yr = yrt;
		xb = xbt;
		yb = ybt;
	}
	if(markers.length < 10){
		markers.push({p: new Float32Array([xr, yr]), c: red});
		markers.push({p: new Float32Array([xb, yb]), c: red});
	}
	if(xd * xd + yd * yd < 0.00012){
		let nx = -b.yuv;
		let ny = b.xuv;
		if(b.xuv > 0.0){
			nx = b.yuv;
			ny = -b.xuv;
		}
		return [nx, ny, xr, yr, xb, yb];
	}
	integrateVelocity(r);
	integrateVelocity(b);
	return false;
}



function integrateVelocity(r){
	if(r.type != "g"){
		let yv = r.yv + G;
		let xcom = r.xv + r.com[0];
		let ycom = yv + r.com[1];
		if(Math.abs(r.w) > MIN_AA) {
			let o = r.o + r.w;
			let cosTheta = Math.cos(o);
			let sinTheta = Math.sin(o);
			r.xp0 = r.xo0 * cosTheta - r.yo0 * sinTheta;
			r.yp0 = r.yo0 * cosTheta + r.xo0 * sinTheta;
			r.xp1 = r.xo1 * cosTheta - r.yo1 * sinTheta;
			r.yp1 = r.yo1 * cosTheta + r.xo1 * sinTheta;
			r.xp0 += xcom;
			r.yp0 += ycom;
			r.xp1 += xcom;
			r.yp1 += ycom;
		} else {
			r.xp0 = r.xv + r.p0[0];
			r.yp0 = yv + r.p0[1];
			r.xp1 = r.xv + r.p1[0];
			r.yp1 = yv + r.p1[1];
		}
		r.xpuv = (r.xp1 - r.xp0) / r.l;
		r.ypuv = (r.yp1 - r.yp0) / r.l;
	}
}



//experimental warm start implementation
	if(warmStarting){
		for(let i = 0, s = wheels.length; i < s; ++i){
			//temp
			markers.push({p: new Float32Array([0.0, 0.0]), c: white});
			for(const m of wheels[i].oldImpulses){
				if(m.activate){
					m.activate = false;
					//m.dx *= 0.95;
					//m.dy *= 0.95;
					wheels[i].integrateImpulse(m.dx, m.dy, 0.0);
					m.obj.integrateImpulse(-m.dx, -m.dy, 0.0);
					if(i == 0){
						markers.push({p: new Float32Array([m.dx * 20, m.dy * 20]), c: red});
					}
				} else {
					m.dx = 0.0;
					m.dy = 0.0;
				}
			}
		}
	}

	if(warmStarting){
							let n = true;
							for(const i of c.oldImpulses){
								if(i.obj == b){
									n = false;
									i.dx += -j * nxab;
									i.dy += -j * nyab;
									if(pass == maxPass) i.activate = true;
								}
							}
							if(n){
								c.oldImpulses.push({obj: b, dx: -j * nxab, dy: -j * nyab, activate: false});
							}
						}

						if(warmStarting){
							let n = true;
							for(const i of c.oldImpulses){
								if(i.obj == r){
									n = false;
									i.dx += -j * xRC * c.mInv;
									i.dy += -j * yRC * c.mInv;
									if(pass == maxPass) i.activate = true;
								}
							}
							if(n){
								c.oldImpulses.push({obj: r, dx: -j * xRC * c.mInv, dy: -j * yRC * c.mInv, activate: false});
							}
						}


						length = rods.length;
	if(length > 0) {
		let k = 0;
		let i = 0;
		gl.uniform1i(U_IS_POINT_LOCATION, 0);
		for(const r of rods) {
			let xe = -r.yuv * 0.1;
			let ye = r.xuv * 0.1;
			positions.set(r.p0, k);
			k += 2;
			positions[k++] = r.p0[0] + xe;
			positions[k++] = r.p0[1] + ye;
			positions.set(r.p1, k);
			k += 2;
			colours.set(r.colour, i);
			i += 4;
			colours.set(r.colour, i);
			i += 4;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions.subarray(0, k), gl.STREAM_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colours.subarray(0, i), gl.STREAM_DRAW);
		
		gl.drawArrays(gl.LINES, 0, length * 6);
	}



	/*
	static alignJoinedObjects(maxPass) {
		let disjoined = true;
		let pass = 0;
		do {
			pass++;
			disjoined = false;
			for(const k of revoluteJoints) {
				for(let i = 1, s = k.objects.length; i < s; ++i) {
					let nx = k.positions[i][0] - k.positions[0][0];
					let ny = k.positions[i][1] - k.positions[0][1];
					let distSQD = nx * nx + ny * ny;
					if(distSQD > 0.000000001){
					//if(distSQD > 0.0){
						disjoined = true;
						let rxAP = -(k.positions[0][1] - k.objects[0].com[1]);
						let ryAP = k.positions[0][0] - k.objects[0].com[0];
						let rxBP = -(k.positions[i][1] - k.objects[i].com[1]);
						let ryBP = k.positions[i][0] - k.objects[i].com[0];
						let dotperpA = rxAP * nx + ryAP * ny;
						let dotperpB = rxBP * nx + ryBP * ny;
						let den = distSQD * (k.objects[0].mInv + k.objects[i].mInv) + (dotperpA * dotperpA * k.objects[0].iInv) + (dotperpB * dotperpB * k.objects[i].iInv);
						let j = Math.abs((distSQD * 0.75) / den);
						k.objects[0].integrateImpulse(j * k.objects[0].mInv * nx, j * k.objects[0].mInv * ny, dotperpA * j * k.objects[0].iInv);
						k.objects[i].integrateImpulse(-j * k.objects[i].mInv * nx, -j * k.objects[i].mInv * ny, dotperpB * -j * k.objects[i].iInv);
					}
				}
			}
		} while(pass < maxPass && disjoined);
	}
	*/

	/*
	let length = areas.length;
	if(length > 2) {
		console.log("more than 2 rects");
		return;
	}
	if(length > 0){
		gl.uniform1i(U_IS_POINT_LOCATION, 0);
		let k = 0;
		let i = 0;
		for(const a of areas) {
			positions.set(a.p0, k);
			k += 2;
			positions.set(a.p1, k);
			k += 2;
			positions.set(a.p2, k);
			k += 2;
			positions.set(a.p2, k);
			k += 2;
			positions.set(a.p3, k);
			k += 2;
			positions.set(a.p0, k);
			k += 2;
			colours.set(a.color, i);
			i += 4;
			colours.set(a.color, i);
			i += 4;
			colours.set(a.color, i);
			i += 4;
			colours.set(a.color, i);
			i += 4;
			colours.set(a.color, i);
			i += 4;
			colours.set(a.color, i);
			i += 4;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions.subarray(0, k), gl.STREAM_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colours.subarray(0, i), gl.STREAM_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, length * 6);
	}

	length = wheels.length;
	if(length > 0){
		gl.uniform1f(U_POINT_SIZE_LOCATION, heightPixels * 0.1);
		gl.uniform1i(U_IS_POINT_LOCATION, 1);
		let k = 0;
		let i = 0;
		for(const w of wheels) {
			positions.set(w.com, k);
			colours.set(w.colour, i);
			i += 4;
			k += 2;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions.subarray(0, k), gl.STREAM_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colours.subarray(0, i), gl.STREAM_DRAW);
		
		gl.drawArrays(gl.POINTS, 0, length);
	}

	length = rods.length;
	if(length > 0) {
		let k = 0;
		let i = 0;
		gl.uniform1i(U_IS_POINT_LOCATION, 0);
		for(const r of rods) {
			let xe = -r.yuv * 0.0125;
			let ye = r.xuv * 0.0125;
			positions[k++] = r.p0[0] + xe;
			positions[k++] = r.p0[1] + ye;
			positions[k++] = r.p0[0] - xe;
			positions[k++] = r.p0[1] - ye;
			positions[k++] = r.p1[0] + xe;
			positions[k++] = r.p1[1] + ye;
			positions[k++] = r.p1[0] + xe;
			positions[k++] = r.p1[1] + ye;
			positions[k++] = r.p1[0] - xe;
			positions[k++] = r.p1[1] - ye;
			positions[k++] = r.p0[0] - xe;
			positions[k++] = r.p0[1] - ye;
			colours.set(r.colour, i);
			i += 4;
			colours.set(r.colour, i);
			i += 4;
			colours.set(r.colour, i);
			i += 4;
			colours.set(r.colour, i);
			i += 4;
			colours.set(r.colour, i);
			i += 4;
			colours.set(r.colour, i);
			i += 4;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions.subarray(0, k), gl.STREAM_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, colours.subarray(0, i), gl.STREAM_DRAW);
		
		gl.drawArrays(gl.TRIANGLES, 0, length * 6);
	}
	*/






	/*
						let xAP_BP = ci[0];
						let yAP_BP = ci[1];
						let xrc = ci[2];
						let yrc = ci[3];
						unsolved = true;
						let xPerpAP = -(yrc - this.com[1]);
						let yPerpAP = xrc - this.com[0];
						let xPerpBP = -(yrc - b.com[1]);
						let yPerpBP =  xrc - b.com[0];
						let vxAP_BP = (b.xv + b.w * xPerpBP) - (this.xv + this.w * xPerpAP);
						let vyAP_BP = (b.yv + b.w * yPerpBP) - (this.yv + this.w * yPerpAP);
						let dotperpA = xPerpAP * xAP_BP + yPerpAP * yAP_BP;
						let dotperpB = xPerpBP * xAP_BP + yPerpBP * yAP_BP;
						let nvAP = xAP_BP * vxAP_BP + yAP_BP * vyAP_BP;
						/*
						if(nvAP > 0.0){
							nvAP = 0.0;
							if(!velocitySteering) continue;
						}
						*/
						/*
						let vs = 0.0;
						if(velocitySteering) vs = ci[4] * 0.001;
						let j = (Math.abs(nvAP) + vs) / ((this.mInv + b.mInv) + dotperpA * dotperpA * this.iInv + dotperpB * dotperpB * b.iInv);
						//solve friction
						let fDotAP = xPerpAP * yAP_BP + yPerpAP * -xAP_BP;
						let fDotBP = xPerpBP * yAP_BP + yPerpBP * -xAP_BP;
						let jf = (-yAP_BP * vxAP_BP + xAP_BP * vyAP_BP) / ((this.mInv + b.mInv) + fDotAP * fDotAP * this.iInv + fDotBP * fDotBP * b.iInv);
						if(Math.abs(jf) > j * 0.95) {
							if(jf > 0) jf = j * 0.85;
							else jf = j * -0.85;
						}
						this.integrateImpulse((-j * xAP_BP + -jf * yAP_BP)  * this.mInv, (-j * yAP_BP + -jf * -xAP_BP) * this.mInv, (dotperpA * -j + fDotAP * -jf) * this.iInv);
						b.integrateImpulse((j * xAP_BP + jf * yAP_BP) * b.mInv, (j * yAP_BP + jf * -xAP_BP) * b.mInv, (dotperpB * j + fDotBP * jf) * b.iInv);
						
					}
				*/





				unsolved = true;
					let xPerpRP = -(py - o.com[1]);
					let yPerpRP =  px - o.com[0];
					let xPerpCP = -(py - this.com[1]);
					let yPerpCP =  px - this.com[0];
					let vxRC = (this.xv + this.w * xPerpCP) - (o.xv + o.w * xPerpRP);
					let vyRC = (this.yv + this.w * yPerpCP) - (o.yv + o.w * yPerpRP);
					let nvRC = xRC * vxRC + yRC * vyRC;
					if(nvRC < 0.0) {
						nvRC *= -0.25;
					}
						//if(!velocitySteering) continue;
					//}
					let perpDotR = xPerpRP * xRC + yPerpRP * yRC;
					let mtInv = (o.mInv + this.mInv) * distSQD;
					let vs = 0.0;
					if(velocitySteering) vs = (0.012 - distSQD) * velocitySteering;
					let j = (nvRC + vs) / (mtInv + perpDotR * perpDotR * o.iInv);
					// solve friction
					let perpDotC = xPerpCP * yRC + yPerpCP * -xRC;
					let fDotR = xPerpRP * yRC + yPerpRP * -xRC;
					let jf = (-yRC * vxRC + xRC * vyRC) / (mtInv + (perpDotC * perpDotC * this.iInv) + (fDotR * fDotR * o.iInv));
					if(Math.abs(jf) > j * 0.8) {
						if(jf > 0.0) jf = j * 0.6;
						else jf = j * -0.6;
					}
					o.integrateImpulse((j * xRC + -jf * yRC) * o.mInv, (j * yRC + -jf * -xRC) * o.mInv, (perpDotR * j + fDotR * -jf) * o.iInv);
					this.integrateImpulse((-j * xRC + jf * yRC) * this.mInv, (-j * yRC + jf * -xRC) * this.mInv, perpDotC  * jf * this.iInv);
				}





				var rWheelBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/rWheelBtn.svg" id="rWheelBtn" onmousedown="changeActiveBtn(this, rWheelBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	tempWheel: false,
	handleActivePress(){
		this.tempWheel = Wheel.createViaMouse("r");
	},
	handleActiveDrag(){
		if(this.tempWheel){
			this.tempWheel.dragViaMouse();
		}
	},
	handleActiveMouseup(){
		if(this.tempWheel) {
			this.tempWheel.finalizeViaMouse();
			this.tempWheel = false;
		}
	}
}
btns.push(rWheelBtn);




class Circle extends gameObject {
	constructor(x, y, color, r) {
		super(x, y, color);
		this.r = r;
		this.rSqd = this.r * this.r;
		++Circle.count;
		/*
		this.points = [];
		this.p0 = new Float32Array(2);
		this.p1 = new Float32Array(2);
		this.p2 = new Float32Array(2);
		new RevoluteJoint(this, this.p0);
		new RevoluteJoint(this, this.p1);
		new RevoluteJoint(this, this.p2);
		*/
		// needed?
		//this.moving = false;
		//this.tempJoint = false;

		//experimental
		//this.overlap = false;
		
		//this.set();

		//wheels.push(this);
		
	}








	
	/*
	solveCollisions(){
		for(const o of physicsObjects){
			if(o.form == "w" && o != this){
				let nx = o.com[0] - this.com[0];
				let ny = o.com[1] - this.com[1];
				let distSqd = nxab * nxab + nyab * nyab;
				if(distSqd < 0.04){
					unsolved = true;
					let px = (this.com[0] + o.com[0]) * 0.5;
					let py = (this.com[1] + o.com[1]) * 0.5;
					solveCollisionVelocity(this, o, (this.com[0] + o.com[0]) * 0.5, (this.com[1] + o.com[1]) * 0.5, nx, ny, distSQD);
					continue;
					let xPerpBP = -(py - o.com[1]);
					let yPerpBP =  px - o.com[0];
					let xPerpCP = -(py - this.com[1]);
					let yPerpCP =  px - this.com[0];
					let mtInv = (o.mInv + this.mInv) * distSqd;
					let vxCB = (this.xv + this.w * xPerpCP) - (o.xv + o.w * xPerpBP);
					let vyCB = (this.yv + this.w * yPerpCP) - (o.yv + o.w * yPerpBP);
					let nv = nxab * vxCB + nyab * vyCB;
					if(nv < 0.0) {
						nv = 0.0;
						if(!velocitySteering) continue;
					}
					let vs = 0.0;
					if(velocitySteering) vs = (0.04 - distSqd) * velocitySteering;
					let j = (nv + vs) / mtInv;
					// solve friction
					let perpDotB = xPerpBP * nyab + yPerpBP * -nxab;
					let perpDotC = xPerpCP * nyab + yPerpCP * -nxab;
					let jf = (nyab * vxCB + -nxab * vyCB) / (mtInv + (perpDotC * perpDotC * this.iInv) + (perpDotB * perpDotB * o.iInv));
					if(Math.abs(jf) > j * 0.95) {
						if(jf > 0.0) jf = j * 0.8;
						else jf = j * -0.8;
					}
					this.integrateImpulse(-j * nxab + -jf * nyab, -j * nyab + -jf * -nxab, perpDotC * -jf * this.iInv);
					o.integrateImpulse(j * nxab + jf * nyab, j * nyab + jf * -nxab, perpDotB * jf * o.iInv);
				}
			} else if(o.form == "r" && o.type != "w" && RevoluteJoint.isDisJoined(this, o)){
				let dot = (this.com[0] - o.p0[0]) * o.xuv + (this.com[1] - o.p0[1]) * o.yuv;
				let px = 0.0;
				let py = 0.0;
				if(dot <= 0.0) {
					px = o.p0[0];
					py = o.p0[1];
				} else if(dot >= o.l) {
					px = o.p1[0];
					py = o.p1[1];
				} else {
					px = o.xuv * dot + o.p0[0];
					py = o.yuv * dot + o.p0[1];
				}
				let nx = px - this.com[0];
				let ny = py - this.com[1];
				let distSQD = xRC * xRC + yRC * yRC;
				if(distSQD < 0.012) {
					solveCollisionVelocity(this, o, px, py, nx, ny, distSQD);
					continue;
				}
			}
		}
	}
	*/
	static count = 0;
	static iP = 0;
	static iC = 0;
	static drawPositions = new Float32Array(150);
	static drawColors = new Float32Array(600);
	setDrawArrays(){
		Wheel.drawPositions.set(this.com, Wheel.iP);
		Wheel.drawColors.set(this.color, Wheel.iC);
		Wheel.iP += 2;
		Wheel.iC += 4;
	}

	static postDrawArrays(){
		gl.uniform1f(U_POINT_SIZE_LOCATION, heightPixels * 0.1);
		gl.uniform1i(U_IS_POINT_LOCATION, 1);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.drawPositions.subarray(0, this.iP), gl.STREAM_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.drawColors.subarray(0, this.iC), gl.STREAM_DRAW);
		gl.drawArrays(gl.POINTS, 0, this.count);
		this.iP = 0;
		this.iC = 0;
	}

	integrateVelocity(){
		// integrate acceleration due to gravity
		this.yv += G;
		// integrate velocity
		this.com[0] += this.xv;
		this.com[1] += this.yv;
		// integrate angular velocity
		this.o = (this.w * RAD_TO_SPOKE_MULTIPLIER + this.o) % NUM_WHEEL_POINTS;
		if(this.o < 0.0) this.o += NUM_WHEEL_POINTS;
		// displace pins according to angular displacement
		this.setPins();
		// gross simplified approximation of angular decelaration due to drag further reducing linear velocity caused by rolling
		this.w *= 0.99;
	}

	integrateImpulse(dx, dy, a) {
		this.vx += dx;
		this.vy += dy;
		this.p[0] += dx;
		this.p[1] += dy;
		this.w += a;
		//this.o = (a * RAD_TO_SPOKE_MULTIPLIER + this.o) % NUM_WHEEL_POINTS;
		//if(this.o < 0) this.o += NUM_WHEEL_POINTS;
		//this.setPins(this);
	}

	setPoint(position, newPosition){
		if(!this.moving){
			let xOffset = newPosition[0] - position[0];
			let yOffset = newPosition[1] - position[1];
			this.com[0] += xOffset;
			this.com[1] += yOffset;
			this.set(this);
			this.moving = true;
			let inducedOverlap = false;
			for(let i = 0; i < 4; ++i){
				if(i == 0){
					newPosition = this.p0;
				} else if(i == 1){
					newPosition = this.p1;
				} else if(i == 2){
					newPosition = this.p2;
				} else if(i == 3){
					newPosition = this.com;
				}
				if(!this.points[i].set(newPosition)) inducedOverlap = true;
			}
			this.moving = false;
			if(this.detectOverlap() || inducedOverlap) return false;
			return true;
		}
		return true;
	}

	set() {
		this.xrcom = this.com[0];
		this.yrcom = this.com[1];
		this.setPins(this);
	}

	reset(){
		this.com[0] = this.xrcom;
		this.com[1] = this.yrcom;
		this.xv = 0.0;
		this.yv = 0.0;
		this.w = 0.0;
		this.o = 0.0;
		this.setPins();
	}

	setPins() {
		let o = ~~this.o;
		this.p0[0] = wheelPoints[o] + this.com[0];
		this.p0[1] = wheelPoints[o + NUM_WHEEL_POINTS] + this.com[1];
		let p1o = (o + THIRD) % NUM_WHEEL_POINTS;
		this.p1[0] = wheelPoints[p1o] + this.com[0];
		this.p1[1] = wheelPoints[p1o + NUM_WHEEL_POINTS] + this.com[1];
		let p2o = (o + TWO_THIRD) % NUM_WHEEL_POINTS;
		this.p2[0] = wheelPoints[p2o] + this.com[0];
		this.p2[1] = wheelPoints[p2o + NUM_WHEEL_POINTS] + this.com[1];
	}

	detectOverlap() {
		for(const o of physicsObjects){
			if(o.form == "r" && o.type != "w" && RevoluteJoint.isDisJoined(this, o)){
				let dot = (this.com[0] - o.p0[0]) * o.xuv + (this.com[1] - o.p0[1]) * o.yuv;
				let px = 0.0;
				let py = 0.0;
				if(dot < 0.0){
					px = o.p0[0];
					py = o.p0[1];
				} else if(dot > o.l){
					px = o.p1[0];
					py = o.p1[1];
				} else {
					px = o.xuv * dot + o.p0[0];
					py = o.yuv * dot + o.p0[1];
				}
				px -= this.com[0];
				py -= this.com[1];
				if(px * px + py * py < this.rSqd + GAP_SQD) return true;
			} else if(o.form == "w" && o != this){
				let nx = o.com[0] - this.com[0];
				let ny = o.com[1] - this.com[1];
				if(nx * nx + ny * ny < (this.r + o.r) * (this.r + o.r)) return true;
			}
		}
		if(!sandboxMode && !assemblyRect.isPointInside(this.com, this.r)) return true;
		return false;
	}

	toJSON() {
		return JSON.stringify({x: this.com[0], y: this.com[1], type: this.type, form: this.form});
	}

	static fromJson(json) {
		let wheel = new Wheel(json.x, json.y, json.type);
		let wM = false;
		if(wheel.type == "f") wM = motorSpeed;
		else if(wheel.type == "r") wM = -motorSpeed;
		new RevoluteJoint(wheel, wheel.com, {w: wM});
		wheel.set();
	}

	static createViaMouse(type){
		let w = new Wheel(mx, my, type);
		if(w.detectOverlap()) canvas.style.cursor = "no-drop";
		return w;
	}

	dragViaMouse(){
		this.com[0] = mx;
		this.com[1] = my;
		RevoluteJoint.snapToNearbyJoint(this, this.com);
		this.setPins();
		if(this.detectOverlap()) canvas.style.cursor = "no-drop";
		else canvas.style.cursor = "crosshair";
	}

	finalizeViaMouse(){
		this.com[0] = mx;
		this.com[1] = my;
		let wM = false;
		if(this.type == "f") wM = motorSpeed;
		else if(this.type == "r") wM = -motorSpeed;
		if(!RevoluteJoint.attachToNearbyJoint(this, this.com, {w: wM})){
			new RevoluteJoint(this, this.com, {w: wM});
		}
		if(this.detectOverlap()){
			this.remove();
			return false;
		}
		this.set();
		return true;
	}

	remove(){
		if(!sandboxMode && this.type == "t") return false;
		for(const j of this.points){
			j.removeObject(this);
		}
		let i = physicsObjects.indexOf(this);
		if(i > -1){
			physicsObjects.splice(i, 1);
			--Wheel.quantity;
			return true;
		}
		return false;
	}









	
	/*
	solveCollisionVelocity(){
		if(this.type == "g") return;
		for(const b of physicsObjects) {
			if(b.form == "r" && b != this && RevoluteJoint.isDisJoined(this, b)) {
				if((this.type == 'w' && b.type == 'g') || (this.type == 'c' && b.type != 'w')){
					let ci = this.getLinesCollisionInfo(b);
					if(ci){
						solveCollisionVelocity(this, b, ci[2], ci[3], ci[0], ci[1], 1.0);
					}
				}
			}
		}
	}

	solveCollisionPosition(){
	
	}
	getLinesCollisionInfo(b){
}




	static quantity = 0;
	static iP = 0;
	static iC = 0;
	static drawPositions = new Float32Array(500);
	static drawColors = new Float32Array(1000);
	setDrawArrays(){
		let xe = -this.yuv * 0.0125;
		let ye = this.xuv * 0.0125;
		Rod.drawPositions[Rod.iP++] = this.p0[0] + xe;
		Rod.drawPositions[Rod.iP++] = this.p0[1] + ye;
		Rod.drawPositions[Rod.iP++] = this.p0[0] - xe;
		Rod.drawPositions[Rod.iP++] = this.p0[1] - ye;
		Rod.drawPositions[Rod.iP++] = this.p1[0] + xe;
		Rod.drawPositions[Rod.iP++] = this.p1[1] + ye;
		Rod.drawPositions[Rod.iP++] = this.p1[0] + xe;
		Rod.drawPositions[Rod.iP++] = this.p1[1] + ye;
		Rod.drawPositions[Rod.iP++] = this.p1[0] - xe;
		Rod.drawPositions[Rod.iP++] = this.p1[1] - ye;
		Rod.drawPositions[Rod.iP++] = this.p0[0] - xe;
		Rod.drawPositions[Rod.iP++] = this.p0[1] - ye;
		Rod.drawColors.set(this.color, Rod.iC);
		Rod.iC += 4;
		Rod.drawColors.set(this.color, Rod.iC);
		Rod.iC += 4;
		Rod.drawColors.set(this.color, Rod.iC);
		Rod.iC += 4;
		Rod.drawColors.set(this.color, Rod.iC);
		Rod.iC += 4;
		Rod.drawColors.set(this.color, Rod.iC);
		Rod.iC += 4;
		Rod.drawColors.set(this.color, Rod.iC);
		Rod.iC += 4;
	}

	static postDrawArrays(){
		gl.uniform1i(U_IS_POINT_LOCATION, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.drawPositions.subarray(0, this.iP), gl.STREAM_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.drawColors.subarray(0, this.iC), gl.STREAM_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, this.quantity * 6);
		this.iP = 0;
		this.iC = 0;
	}

	integrateVelocity(){
		if(this.type == "g") return;
		// set previous vertices to current vertices before applying velocities
		// Purpose: enable continuous collision detection
		this.xp0 = this.p0[0];
		this.yp0 = this.p0[1];
		this.xp1 = this.p1[0];
		this.yp1 = this.p1[1];
		this.xpuv = this.xuv;
		this.ypuv = this.yuv;
		// integrate acceleration due to gravity
		this.yv += G;
		// integrate angular velocity and linear velocity
		this.com[0] += this.xv;
		this.com[1] += this.yv;
		if(Math.abs(this.w) > MIN_AA) {
			this.o += this.w;
			let cosTheta = Math.cos(this.o);
			let sinTheta = Math.sin(this.o);
			this.p0[0] = this.xo0 * cosTheta - this.yo0 * sinTheta;
			this.p0[1] = this.yo0 * cosTheta + this.xo0 * sinTheta;
			this.p1[0] = this.xo1 * cosTheta - this.yo1 * sinTheta;
			this.p1[1] = this.yo1 * cosTheta + this.xo1 * sinTheta;
			this.p0[0] += this.com[0];
			this.p0[1] += this.com[1];
			this.p1[0] += this.com[0];
			this.p1[1] += this.com[1];
		} else {
			this.p0[0] += this.xv;
			this.p0[1] += this.yv;
			this.p1[0] += this.xv;
			this.p1[1] += this.yv;
		}
		// set unit vectors for current position
		// Purpose: eliminating the need to use sin and cos in computations involving rod
		this.xuv = (this.p1[0] - this.p0[0]) / this.l;
		this.yuv = (this.p1[1] - this.p0[1]) / this.l;
		// gross simplified approximation of angular decelaration due to drag
		this.w *= 0.92;
	}
	set(){
		let mx = this.p1[0] - this.p0[0];
		let my = this.p1[1] - this.p0[1];
		this.l = Math.sqrt((mx * mx) + (my * my));
		this.xuv = mx / this.l;
		this.yuv = my / this.l;
		this.xpuv = this.xuv;
		this.ypuv = this.yuv;
		this.xp0 = this.p0[0];
		this.yp0 = this.p0[1];
		this.xp1 = this.p1[0];
		this.yp1 = this.p1[1];
		
		this.com[0] = (this.p1[0] + this.p0[0]) * 0.5;
		this.com[1] = (this.p1[1] + this.p0[1]) * 0.5;
		this.xo0 = this.p0[0] - this.com[0];
		this.yo0 = this.p0[1] - this.com[1];
		this.xo1 = this.p1[0] - this.com[0];
		this.yo1 = this.p1[1] - this.com[1];
		
		if(this.type != 'g') {
			this.m = this.l * 0.75;
			this.mInv = 1.0 / this.m;
			//this.i = 0.08333333333 * this.m * this.l * this.l;
			this.i = 0.2 * this.m * this.l * this.l;
			this.iInv = 1.0 / this.i;
		}
		
		this.xrcom = this.com[0];
		this.yrcom = this.com[1];
		this.xr0 = this.p0[0];
		this.yr0 = this.p0[1];
		this.xr1 = this.p1[0];
		this.yr1 = this.p1[1];
		this.xruv = this.xuv;
		this.yruv = this.yuv;
		if(this.l < 0.05){
			return false;
		}
		return true;
	}

	integrateImpulse(dx, dy, a) {
		if(this.type == "g") return;
		this.xv += dx;
		this.yv += dy;
		this.com[0] += dx;
		this.com[1] += dy;
		if(Math.abs(a) > MIN_AA) {
			this.w += a;
			this.o += a;
			let cosTheta = Math.cos(this.o);
			let sinTheta = Math.sin(this.o);
			this.p0[0] = (this.xo0 * cosTheta - this.yo0 * sinTheta) + this.com[0];
			this.p0[1] = (this.yo0 * cosTheta + this.xo0 * sinTheta) + this.com[1];
			this.p1[0] = (this.xo1 * cosTheta - this.yo1 * sinTheta) + this.com[0];
			this.p1[1] = (this.yo1 * cosTheta + this.xo1 * sinTheta) + this.com[1];
		} else {
			this.p0[0] += dx;
			this.p0[1] += dy;
			this.p1[0] += dx;
			this.p1[1] += dy;
		}
		this.xuv = (this.p1[0] - this.p0[0]) / this.l;
		this.yuv = (this.p1[1] - this.p0[1]) / this.l;
	}

	toJSON(){
		return JSON.stringify({x0: this.p0[0], y0: this.p0[1], x1: this.p1[0], y1: this.p1[1], type: this.type, form: this.form});
	}

	static fromJson(json){
		let rod = new Rod(json.x0, json.y0, json.type);
		rod.p1[0] = json.x1;
		rod.p1[1] = json.y1;
		rod.set();
	}

	setPoint(position, newPosition){
		position[0] = newPosition[0];
		position[1] = newPosition[1];
		this.set(this);
		if(this.detectOverlap()) return false;
		return true;
	}

	static createViaMouse(type){
		let r = new Rod(mx, my, type);
		if(type != "g" && !RevoluteJoint.attachToNearbyJoint(r, r.p0)) new RevoluteJoint(r, r.p0);
		return r;
	}

	dragViaMouse(){
		this.p1[0] = mx;
		this.p1[1] = my;
		RevoluteJoint.snapToNearbyJoint(this, this.p1);
		this.setDimensions();
		if(this.detectOverlap()) canvas.style.cursor = "no-drop";
		else canvas.style.cursor = "crosshair";
	}

	finalizeViaMouse(){
		this.p1[0] = mx;
		this.p1[1] = my;
		if(this.type != "g"){
			if(RevoluteJoint.attachToNearbyJoint(this, this.p1)){
				for(const o of this.points[1].objects){
					for(const b of this.points[0].objects){
						if(o != this && o == b){
							this.remove();
							return false;
						}
					}
				}
			} else {
				new RevoluteJoint(this, this.p1);
			}
		}
		this.setDimensions();
		if(this.detectOverlap() || !this.set()){
			this.remove();
			return false;
		}
		return true;
	}

	remove(){
		if(this.type == "g" && !sandboxMode) return false;
		if(this.points != null){
			for(const j of this.points){
				j.removeObject(this);
			}
			let i = physicsObjects.indexOf(this);
			if(i > -1){
				physicsObjects.splice(i, 1);
				--Rod.quantity;
				return true;
			}
		}
		return false;
	}

	reset(){
		this.com[0] = this.xrcom;
		this.com[1] = this.yrcom;
		this.p0[0] = this.xr0;
		this.p0[1] = this.yr0;
		this.p1[0] = this.xr1;
		this.p1[1] = this.yr1;
		this.xuv = this.xruv;
		this.yuv = this.yruv;
		this.xpuv = this.xuv;
		this.ypuv = this.yuv;
		this.xp0 = this.p0[0];
		this.yp0 = this.p0[1];
		this.xp1 = this.p1[0];
		this.yp1 = this.p1[1];
		this.xv = 0.0;
		this.yv = 0.0;
		this.w = 0.0;
		this.o = 0.0;
	}

	detectOverlap(){
		for(const o of physicsObjects){
			if(o.form == "r" && o != this && RevoluteJoint.isDisJoined(this, o)) {
				if((this.type == 'g' && o.type != 'g') || (this.type == 'w' && o.type == 'g') || (this.type == 'c' && o.type != 'w')) {
					let xr = this.p1[0] - this.p0[0];
					let yr = this.p1[1] - this.p0[1];
					let xs = o.p1[0] - o.p0[0];
					let ys = o.p1[1] - o.p0[1];
					let rxs = xr * ys - yr * xs;
					let xq_p = (o.p0[0] - this.p0[0]);
					let yq_p = (o.p0[1] - this.p0[1]);
					let t = (xq_p * ys - yq_p * xs) / rxs;
					let u = (xq_p * yr - yq_p * xr) / rxs;
					if(t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0) return true;
					t = Math.max(0.0, Math.min(t, 1.0));
					u = Math.max(0.0, Math.min(u, 1.0));
					xr = this.p0[0] + xr * t;
					yr = this.p0[1] + yr * t;
					xs = o.p0[0] + xs * u;
					ys = o.p0[1] + ys * u;
					xq_p = xr - xs;
					yq_p = yr - ys;
					if(xq_p * xq_p + yq_p * yq_p < GAP_SQD) return true;
				}
			} else if(o.form == "w" && this.type != "w" && RevoluteJoint.isDisJoined(o, this)) {
				let dot = (o.com[0] - this.p0[0]) * this.xuv + (o.com[1] - this.p0[1]) * this.yuv;
				let px = 0.0;
				let py = 0.0;
				if(dot <= 0.0) {
					px = this.p0[0];
					py = this.p0[1];
				} else if(dot >= this.l) {
					px = this.p1[0];
					py = this.p1[1];
				} else {
					px = this.xuv * dot + this.p0[0];
					py = this.yuv * dot + this.p0[1];
				}
				px -= o.com[0];
				py -= o.com[1];
				if(px * px + py * py < o.rSqd + GAP_SQD) {
					return true;
				}
			}
		}
		if(!sandboxMode){
			if(!assemblyRect.isPointInside(this.p0) || !assemblyRect.isPointInside(this.p1)) return true;
		}
		return false;
	}
	*/



	/*
		this.xr0 = 0.0;
		this.yr0 = 0.0;
		this.xr1 = 0.0;
		this.yr1 = 0.0;
		this.xrcom = 0.0;
		this.yrcom = 0.0;
		this.xruv = 0.0;
		this.yruv = 0.0;
		
		this.xo0 = 0.0;
		this.yo0 = 0.0;
		this.xo1 = 0.0;
		this.yo1 = 0.0;
		this.points = [];
		
		if(type == "g") {
			if(sandboxMode){
				new Point(this, this.p0, "x");
				new Point(this, this.p1, "x");
			}
			this.color = new Float32Array([0.05, 0.4, 0.05, 1.0]);
		} else if(type == "w") {
			this.color = new Float32Array([0.0, 0.75, 0.75, 1.0]);
		} else if(type == "c") {
			this.color = new Float32Array([0.5, 0.5, 0.5, 1.0]);
		}
		
		//experimental
		this.moving = false;
		this.tempJoint = false;
		
		//rods.push(this);
		physicsObjects.push(this);
		++Rod.quantity;
		
		*/



		function solveLinesCollision(a, b){
	let dotB = (a.wvs[0][0] - b.wvs[0][0]) * b.uv[0] + (a.wvs[0][1] - b.wvs[0][1]) * b.uv[1];
	let dotTemp = dotB;
	if(dotB < 0.0) dotB = 0.0;
	else if(dotB > b.l) dotB = b.l;
	let bx = b.wvs[0][0] + dotB * b.uv[0];
	let by = b.wvs[0][1] + dotB * b.uv[1];
	let dotR = 0.0;
	if(dotTemp < 0.0 || dotTemp > b.l){
		dotR = (bx - a.wvs[0][0]) * a.uv[0] + (by - a.wvs[0][1]) * a.uv[1];
		if(dotR < 0.0 || dotR > a.l) return;
	}
	let ax = a.wvs[0][0] + dotR * a.uv[0];
	let ay = a.wvs[0][1] + dotR * a.uv[1];
	let xd = ax - bx;
	let yd = ay - by;
	//let d = xd * xd + yd * yd;

	let xrpa = a.p[1] - ay;
	let yrpa = ax - a.p[0];
	let xrpb = b.p[1] - by;
	let yrpb = bx - b.p[0];
	let vxRel = a.v[0] + a.w * xrpa - b.v[0] - b.w * xrpb;
	let vyRel = a.v[1] + a.w * yrpa - b.v[1] - b.w * yrpb;
	let d = Math.sqrt(xd * xd + yd * yd);
	xd /= d;
	yd /= d;
	let nv = vxRel * xd + vyRel * yd;
	d += nv;
	//if(debugPoints.length < 20) debugPoints.push([new Float32Array([xd + bx, yd + by]), white]);
	
	//let dist = Math.sqrt(d) - a.width;
	//let nx = xd / dist;
	//let ny = yd / dist;
	//let nv = xd * vxRel + yd * vyRel;
	//dist += nv;
	/*
	let dist = Math.sqrt(d) - a.width;
	let nx = -b.uv[1];
	let ny = b.uv[0];
	if(dotR == 0 || Math.abs(dotR - a.l) < 0.0001){
		if(xd * nx + yd * ny < 0.0){
			nx = b.uv[1];
			ny = -b.uv[0];
		}
	} else {
		nx = -a.uv[1];
		ny = a.uv[0];
		if(xd * nx + yd * ny < 0.0){
			nx = a.uv[1];
			ny = -a.uv[0];
		}
	}
	collide(a, b, ax, ay, bx, by, nx, ny, dist);
	*/
	
	dotB = (a.wvs[1][0] - b.wvs[0][0]) * b.uv[0] + (a.wvs[1][1] - b.wvs[0][1]) * b.uv[1];
	dotTemp = dotB;
	if(dotB < 0.0) dotB = 0.0;
	else if(dotB > b.l) dotB = b.l;
	let btx = b.wvs[0][0] + dotB * b.uv[0];
	let bty = b.wvs[0][1] + dotB * b.uv[1];
	dotR = a.l;
	if(dotTemp < 0.0 || dotTemp > b.l){
		dotR = (btx - a.wvs[0][0]) * a.uv[0] + (bty - a.wvs[0][1]) * a.uv[1];
		if(dotR < 0.0 || dotR > a.l) return;
	}
	let atx = a.wvs[0][0] + dotR * a.uv[0];
	let aty = a.wvs[0][1] + dotR * a.uv[1];
	let xtd = atx - btx;
	let ytd = aty - bty;

	xrpa = a.p[1] - aty;
	yrpa = atx - a.p[0];
	xrpb = b.p[1] - bty;
	yrpb = btx - b.p[0];
	vxRel = a.v[0] + a.w * xrpa - b.v[0] - b.w * xrpb;
	vyRel = a.v[1] + a.w * yrpa - b.v[1] - b.w * yrpb;
	let dt = Math.sqrt(xtd * xtd + ytd * ytd);
	xtd /= dt;
	ytd /= dt;
	nv = vxRel * xtd + vyRel * ytd;
	dt += nv;

	if(debugPoints.length < 20) debugPoints.push([new Float32Array([xtd + btx, ytd + bty]), white]);

	let v0C = false;
	let v1C = false;
	if(d < a.width * a.width){
		v0C = true;
	}
	if(dt < a.width * a.width){
		v1C = true;
	}
	if(v0C && v1C){
		ax = a.p[0];
		ay = a.p[1];
		dotB = (ax - b.wvs[0][0]) * b.uv[0] + (ay - b.wvs[0][1]) * b.uv[1];
		bx = b.wvs[0][0] + dotB * b.uv[0];
		by = b.wvs[0][1] + dotB * b.uv[1];
		a.w = 0.0;
		b.w = 0.0;
	} else if(dt < d){
		ax = atx;
		ay = aty;
		bx = btx;
		by = bty;
		//xd = xtd;
		//yd = ytd;
		//d = dt;
	}
	/*
	if(dt - a.width * a.width < d){
		ax = atx;
		ay = aty;
		bx = btx;
		by = bty;
		xd = xtd;
		yd = ytd;
		d = dt;
	}
	*/
	if(debugPoints.length < 20){
		debugPoints.push([new Float32Array([ax, ay]), red]);
		debugPoints.push([new Float32Array([bx, by]), red]);
	}
	xd = ax - bx;
	yd = ay - by;
	d = xd * xd + yd * yd;
	let dist = Math.sqrt(d);
	let nx = xd / dist;
	let ny = yd / dist;
	dist -= a.width;
	/*
	let nx = -b.uv[1];
	let ny = b.uv[0];
	if(dotR == 0 || Math.abs(dotR == a.l) < 0.0001){
		if(xd * nx + yd * ny < 0.0){
			nx = b.uv[1];
			ny = -b.uv[0];
		}
	} else {
		nx = -a.uv[1];
		ny = a.uv[0];
		if(xd * nx + yd * ny < 0.0){
			nx = a.uv[1];
			ny = -a.uv[0];
		}
	}
	*/
	collide(a, b, ax, ay, bx, by, nx, ny, dist);
}



var moveBtn = { 
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/moveBtn.png" id="moveBtn" onmousedown="changeActiveBtn(this, moveBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	nearbyJoint: false,
	xJointOrigin: false,
	yJointOrigin: false,
	xDragStart: false,
	yDragStart: false,
	handleActivePress(){
		this.nearbyJoint = getJoinables(mx, my);
		if(this.nearbyJoint) {
			this.xJointOrigin = mx;
			this.yJointOrigin = my;
			return;
		} else {
			this.xDragStart = mx;
			this.yDragStart = my;
		}
	},
	handleActiveDrag(){
		if(this.nearbyJoint){
			if(this.nearbyJoint.set([mx, my])) canvas.style.cursor = "crosshair";
			else canvas.style.cursor = "no-drop";
		} else if(this.xDragStart){
			dragCanvas(mx - this.xDragStart, my - this.yDragStart);
		}
	},
	handleActiveMouseup(){
		if(this.nearbyJoint){
			if(!this.nearbyJoint.set([mx, my])) this.nearbyJoint.set([this.xJointOrigin, this.yJointOrigin]);
			this.nearbyJoint = false;
		}
		this.xDragStart = false;
	},
}
btns.push(moveBtn);




// turn all game objects from joint at mouse position to dummys
		let joinables = getJoinables(mx, my);
		if(joinables.length > 0){
			for(const j of joinables){
				if(j.obj.form == CIRCLE_FORM){
					let offset = j.obj.getLocalPosition(j.position[0], j.position[1]);
					this.gameObjectsToMove.push(j.obj);
					j.obj.userData.offset = offset;
					for(const r of j.obj.joints){
						if(r.objA.form == LINE_FORM){
							this.gameObjectsToMove.push(r.objA);
							r.objA.userData.offset = [r.data.localB[0] - offset[0], r.data.localB[1] - offset[1]];
						} else if(r.objB.form == LINE_FORM){
							this.gameObjectsToMove.push(r.objB);
							r.objB.userData.offset = [r.data.localA[0] - offset[0], r.data.localA[1] - offset[1]];
						}
					}
				} else if(j.obj.form == LINE_FORM){
					this.gameObjectsToMove.push(j.obj);
					j.obj.userData.offset = [0.0, 0.0];
				}
			}
			for(let i = this.gameObjectsToMove.length - 1; i > -1; --i){
				let o = this.gameObjectsToMove[i];
				if(o.form == LINE_FORM){
					let dummyRod = getDummyRod(o.wvs[0][0], o.wvs[0][1], o.wvs[1][0], o.wvs[1][1], o.color, o.width, o.type, o.group);
					if(Math.abs(o.wvs[0][0] - mx) < 0.05 && Math.abs(o.wvs[0][1] - my) < 0.05) dummyRod.vertexIndex = 0;
					else dummyRod.vertexIndex = 1;
					dummyRod.offset = o.userData.offset;
					if(removeRod(o)) this.gameObjectsToMove[i] = dummyRod;
					else this.gameObjectsToMove.splice(i, 1);
				} else if(o.form == CIRCLE_FORM){
					let dummyWheel = getDummyWheel(o.p[0], o.p[1], o.userData.id);
					dummyWheel.offset = o.userData.offset;
					removeWheel(o);
					this.gameObjectsToMove[i] = dummyWheel;
				}
			}
		} else {
			this.xDragStart = mx;
			this.yDragStart = my;
		}
	},
	handleActiveDrag(){
		if(this.gameObjectsToMove.length > 0){
			for(const o of this.gameObjectsToMove){
				if(o.form == CIRCLE_FORM) dragDummyWheel(o, mx - o.offset[0], my - o.offset[1], false);
				else if(o.form == LINE_FORM) dragDummyRodVertex(o, mx - o.offset[0], my - o.offset[1], o.vertexIndex, false);
			}
			//if(this.nearbyJoint.set([mx, my])) canvas.style.cursor = "crosshair";
			//else canvas.style.cursor = "no-drop";
		} else if(this.xDragStart){
			dragCanvas(mx - this.xDragStart, my - this.yDragStart);
		}
	},
	handleActiveMouseup(){
		if(this.gameObjectsToMove.length > 0){
			for(let o of this.gameObjectsToMove){
				if(o.form == LINE_FORM) o = replaceDummyRod(o, false);
				else if(o.form == CIRCLE_FORM) o = replaceDummyWheel(o, false);
			}
			for(let i = this.gameObjectsToMove.length - 1; i > -1; --i){
				let o = this.gameObjectsToMove[i];
				let joinables = [];
				if(o.form == LINE_FORM){
					joinables = joinables.concat(getJoinables(o.wvs[0][0], o.wvs[0][1], o));
					joinables = joinables.concat(getJoinables(o.wvs[1][0], o.wvs[1][1], o));
				} else if(o.form == CIRCLE_FORM){
					for(let i = 0, s = WHEEL_PINS.length; i < s; ++i){
						joinables = joinables.concat(getJoinables(o.p[0] + WHEEL_PINS[i][0], o.p[1] + WHEEL_PINS[i][1], o));
					}
				}
				console.log("joinables = " + joinables);
				for(const j of joinables){
					if(this.gameObjectsToMove.indexOf(j.obj) > -1) new RevoluteJoint(o, j.obj, j.position[0], j.position[1]);
				}
				this.gameObjectsToMove.splice(i, 1);
			}
		}
		this.xDragStart = false;





		function getDummyRod(x0, y0, x1, y1, c, w, t, g){
	let joinables = getJoinables(x0, y0);
	if(joinables.length > 0) {
		x0 = joinables[0].position[0];
		y0 = joinables[0].position[1];
	}
	let dummy = {
		dummy: true,
		p: new Float32Array([(x0 + x1) * 0.5, (y0 + y1) * 0.5]),
		r: new Float32Array([1.0, 0.0]),
		wvs: [new Float32Array([x0, y0]), new Float32Array([x1, y1])],
		// temp transparent
		color: new Float32Array([c[0], c[1], c[2], 0.5]),
		type: t,
		width: w,
		halfWidth: w * 0.5,
		group: g,
		form: LINE_FORM
	};
	dummy.lvs = [new Float32Array([x0 - dummy.p[0], y0 - dummy.p[1]]), new Float32Array([x1 - dummy.p[0], y1 - dummy.p[1]])];
	dummy.d = new Float32Array([dummy.lvs[1][0] - dummy.lvs[0][0], dummy.lvs[1][1] - dummy.lvs[0][1]]);
	dummy.l = Math.sqrt(dummy.d[0] * dummy.d[0] + dummy.d[1] * dummy.d[1]);
	dummy.lInv = 1.0 / dummy.l;
	dummy.uv = new Float32Array([dummy.d[0] * dummy.lInv, dummy.d[1] * dummy.lInv]);
	rods.push(dummy);
	console.log("rods.length = " + rods.length);
	return dummy;
}

function dragDummyRodVertex(dummy, x, y, vertexIndex, attachToJoinable){
	if(!dummy) return false;
	if(arguments.length == 5 && attachToJoinable){
		let joinables = getJoinables(x, y, dummy);
		if(joinables.length > 0) {
			x = joinables[0].position[0];
			y = joinables[0].position[1];
		}
	}
	dummy.wvs[vertexIndex][0] = x
	dummy.wvs[vertexIndex][1] = y;
	dummy.p[0] = (dummy.wvs[0][0] + dummy.wvs[1][0]) * 0.5;
	dummy.p[1] = (dummy.wvs[0][1] + dummy.wvs[1][1]) * 0.5;
	dummy.lvs[0][0] = dummy.wvs[0][0] - dummy.p[0];
	dummy.lvs[0][1] = dummy.wvs[0][1] - dummy.p[1];
	dummy.lvs[1][0] = dummy.wvs[1][0] - dummy.p[0];
	dummy.lvs[1][1] = dummy.wvs[1][1] - dummy.p[1];
	dummy.d[0] = dummy.lvs[1][0] - dummy.lvs[0][0];
	dummy.d[1] = dummy.lvs[1][1] - dummy.lvs[0][1];
	dummy.l = Math.sqrt(dummy.d[0] * dummy.d[0] + dummy.d[1] * dummy.d[1]);
	dummy.lInv = 1.0 / dummy.l;
	dummy.uv[0] = dummy.d[0] * dummy.lInv;
	dummy.uv[1] = dummy.d[1] * dummy.lInv;
}

function replaceDummyRod(dummy, attachToJoinable){
	if(!dummy) {
		console.warn("dummy rod does not exist");
		return false;
	}
	let i = rods.indexOf(dummy);
	if(i > -1) rods.splice(i, 1);
	else console.warn("Cannot splice dummy rod from rods");
	//temp color
	let color = new Float32Array([dummy.color[0], dummy.color[1], dummy.color[2], 1.0]);
	let rod = createRod(dummy.wvs[0][0], dummy.wvs[0][1], dummy.wvs[1][0], dummy.wvs[1][1], color, dummy.width, dummy.type, dummy.group);
	if(arguments.length == 2 && attachToJoinable){
		let joinables = getJoinables(rod.wvs[0][0], rod.wvs[0][1], rod);
		for(const j of joinables){
			new RevoluteJoint(rod, j.obj, j.position[0], j.position[1]);
		}
		joinables = getJoinables(rod.wvs[1][0], rod.wvs[1][1], rod);
		for(const j of joinables){
			new RevoluteJoint(rod, j.obj, j.position[0], j.position[1]);
		}
	}
	return rod;
}





function getDummyWheel(x, y, i){
	let dummy = {
		dummy: true,
		p: new Float32Array([x, y]),
		r: new Float32Array([1.0, 0.0]),
		color: dummyWheelColors[i],
		type: MOVABLE,
		radius: 0.1,
		mass: 1.0,
		group: 1,
		form: CIRCLE_FORM,
		userData: {id: i, xRP: x, yRP: y},
		joints: [],
	};
	wheels.push(dummy);
	return dummy;
}

function dragDummyWheel(dummy, x, y, attachToJoinable){
	if(!dummy) return false;
	if(arguments.length == 4 && attachToJoinable){
		let joinables = getJoinables(x, y, dummyWheel);
		if(joinables.length > 0){
			x = joinables[0].position[0];
			y = joinables[0].position[1];
		}
	}
	dummy.p[0] = x;
	dummy.p[1] = y;
}

function replaceDummyWheel(dummy, attachToJoinable){
	if(!dummy) return false;
	let i = wheels.indexOf(dummy);
	if(i > -1) wheels.splice(i, 1);
	else console.warn("Cannot splice dummy wheel from wheels array");
	let wheel = createWheel(dummy.p[0], dummy.p[1], dummy.radius, dummy.group, dummy.mass, dummy.userData.id);
	if(arguments.length == 2 && attachToJoinable){
		let joinables = getJoinables(wheel.p[0], wheel.p[1], wheel);
		for(const j of joinables){
			new RevoluteJoint(wheel, j.obj, j.position[0], j.position[1]);
		}
	}
	return wheel;
}




	/*
	solveCollisions(){
		for(const o of gameObjects){
			if(o.form == LINE_FORM && o != this){
				let dotB = (this.wvs[0][0] - o.wvs[0][0]) * o.uv[0] + (this.wvs[0][1] - o.wvs[0][1]) * o.uv[1];
				let dotTemp = dotB;
				if(dotB < 0.0) dotB = 0.0;
				else if(dotB > o.l) dotB = o.l;
				let xbc = o.wvs[0][0] + dotB * o.uv[0];
				let ybc = o.wvs[0][1] + dotB * o.uv[1];
				let dotR = 0.0;
				if(dotTemp < 0.0 || dotTemp > o.l){
					dotR = (xbc - this.wvs[0][0]) * this.uv[0] + (ybc - this.wvs[0][1]) * this.uv[1];
					if(dotR < 0.0 || dotR > this.l) continue;
				}
				let xrc = this.wvs[0][0] + dotR * this.uv[0];
				let yrc = this.wvs[0][1] + dotR * this.uv[1];
				let xd = xrc - xbc;
				let yd = yrc - ybc;
				let xp = (this.pvs[0][0] + dotR * this.puv[0]) - (o.pvs[0][0] + dotB * o.puv[0]);
				let yp = (this.pvs[0][1] + dotR * this.puv[1]) - (o.pvs[0][1] + dotB * o.puv[1]);
				let p0c = false;
				let d = xd * xd + yd * yd;
				let isP0Penetrating = false;
				if(xd * xp + yd * yp < 0.0) isP0Penetrating = true;
				let pc = 0.0;
				let minDistSqd = (this.halfWidth + o.halfWidth) * (this.halfWidth + o.halfWidth);
				if(isP0Penetrating || d < minDistSqd) {
					if(isP0Penetrating) pc = d + minDistSqd;
					else pc = minDistSqd - d;
					p0c = true;
				}

				dotB = (this.wvs[1][0] - o.wvs[0][0]) * o.uv[0] + (this.wvs[1][1] - o.wvs[0][1]) * o.uv[1];
				dotTemp = dotB;
				if(dotB < 0.0) dotB = 0.0;
				else if(dotB > o.l) dotB = o.l;
				xbc = o.wvs[0][0] + dotB * o.uv[0];
				ybc = o.wvs[0][1] + dotB * o.uv[1];
				dotR = this.l;
				if(dotTemp < 0.0 || dotTemp > o.l){
					dotR = (xbc - this.wvs[0][0]) * this.uv[0] + (ybc - this.wvs[0][1]) * this.uv[1];
					if(dotR < 0.0 || dotR > this.l) continue;
				}
				let xtrc = this.wvs[0][0] + dotR * this.uv[0];
				let ytrc = this.wvs[0][1] + dotR * this.uv[1];
				xd = xtrc - xbc;
				yd = ytrc - ybc;
				xp = (this.pvs[0][0] + dotR * this.puv[0]) - (o.pvs[0][0] + dotB * o.puv[0]);
				yp = (this.pvs[0][1] + dotR * this.puv[1]) - (o.pvs[0][1] + dotB * o.puv[1]);
				let dt = xd * xd + yd * yd;
				let p1c = false;
				let isP1Penetrating = false;
				if(xd * xp + yd * yp < 0.0) isP1Penetrating = true;
				if(isP1Penetrating || dt  < minDistSqd) {
					if(isP1Penetrating) {
						if((isP0Penetrating && dt > d) || !isP0Penetrating) {
							pc = dt + minDistSqd;
							xrc = xtrc;
							yrc = ytrc;
						}
					} else if(!isP0Penetrating && dt < d){
						pc = minDistSqd - dt;
						xrc = xtrc;
						yrc = ytrc;
					}
					p1c = true;
				}
				if(p0c || p1c){
					if(p0c && p1c){

						// anti-patter
						this.w *= 0.8;

						xrc = this.p[0];
						yrc = this.p[1];
					}
					let nx = -o.uv[1];
					let ny = o.uv[0];
					if(dotR == 0 || Math.abs(dotR - this.l) < 0.0001){
						if(xp * nx + yp * ny < 0.0){
							nx = o.uv[1];
							ny = -o.uv[0];
						}
					} else {
						nx = -this.uv[1];
						ny = this.uv[0];
						if(xp * nx + yp * ny < 0.0){
							nx = this.uv[1];
							ny = -this.uv[0];
						}
					}
					solveCollision(this, o, xrc, yrc, nx, ny, 1.0, pc);
				}
			}
		}
	}
	*/





	
	solveCollisions(){
		for(const o of gameObjects){
			if(o.form == LINE_FORM && o != this){
				let dotB = (this.wvs[0][0] - o.wvs[0][0]) * o.uv[0] + (this.wvs[0][1] - o.wvs[0][1]) * o.uv[1];
				let dotTemp = dotB;
				if(dotB < 0.0) dotB = 0.0;
				else if(dotB > o.l) dotB = o.l;
				let xbc = o.wvs[0][0] + dotB * o.uv[0];
				let ybc = o.wvs[0][1] + dotB * o.uv[1];
				let dotR = 0.0;
				if(dotTemp < 0.0 || dotTemp > o.l){
					dotR = (xbc - this.wvs[0][0]) * this.uv[0] + (ybc - this.wvs[0][1]) * this.uv[1];
					if(dotR < 0.0 || dotR > this.l) continue;
				}
				let xrc = this.wvs[0][0] + dotR * this.uv[0];
				let yrc = this.wvs[0][1] + dotR * this.uv[1];
				let xd = xrc - xbc;
				let yd = yrc - ybc;
				//let xp = (this.pvs[0][0] + dotR * this.puv[0]) - (o.pvs[0][0] + dotB * o.puv[0]);
				//let yp = (this.pvs[0][1] + dotR * this.puv[1]) - (o.pvs[0][1] + dotB * o.puv[1]);
				


				/*
				if(xd * xp + yd * yp < 0.0) isP0Penetrating = true;
				let pc = 0.0;
				let minDistSqd = (this.halfWidth + o.halfWidth) * (this.halfWidth + o.halfWidth);
				if(isP0Penetrating || d < minDistSqd) {
					if(isP0Penetrating) pc = d + minDistSqd;
					else pc = minDistSqd - d;
					p0c = true;
				}
				*/

				//let p0c = false;
				let d = xd * xd + yd * yd;
				let dist = Math.sqrt(d) - this.width;
				//let isP0Penetrating = false;
				let nx = -o.uv[1];
				let ny = o.uv[0];
				if(dotR == 0 || Math.abs(dotR - this.l) < 0.0001){
					if(xd * nx + yd * ny < 0.0){
						nx = o.uv[1];
						ny = -o.uv[0];
					}
				} else {
					nx = -this.uv[1];
					ny = this.uv[0];
					if(xd * nx + yd * ny < 0.0){
						nx = this.uv[1];
						ny = -this.uv[0];
					}
				}
				solveCollision(this, o, xrc, yrc, nx, ny, 1.0, dist, xbc, ybc);



				dotB = (this.wvs[1][0] - o.wvs[0][0]) * o.uv[0] + (this.wvs[1][1] - o.wvs[0][1]) * o.uv[1];
				dotTemp = dotB;
				if(dotB < 0.0) dotB = 0.0;
				else if(dotB > o.l) dotB = o.l;
				xbc = o.wvs[0][0] + dotB * o.uv[0];
				ybc = o.wvs[0][1] + dotB * o.uv[1];
				dotR = this.l;
				if(dotTemp < 0.0 || dotTemp > o.l){
					dotR = (xbc - this.wvs[0][0]) * this.uv[0] + (ybc - this.wvs[0][1]) * this.uv[1];
					if(dotR < 0.0 || dotR > this.l) continue;
				}
				let xtrc = this.wvs[0][0] + dotR * this.uv[0];
				let ytrc = this.wvs[0][1] + dotR * this.uv[1];
				xd = xtrc - xbc;
				yd = ytrc - ybc;
				let dt = xd * xd + yd * yd;
				dist = Math.sqrt(dt) - this.width;
				nx = -o.uv[1];
				ny = o.uv[0];
				if(dotR == 0 || Math.abs(dotR - this.l) < 0.0001){
					if(xd * nx + yd * ny < 0.0){
						nx = o.uv[1];
						ny = -o.uv[0];
					}
				} else {
					nx = -this.uv[1];
					ny = this.uv[0];
					if(xd * nx + yd * ny < 0.0){
						nx = this.uv[1];
						ny = -this.uv[0];
					}
				}
				solveCollision(this, o, xtrc, ytrc, nx, ny, 1.0, dist, xbc, ybc);


				/*
				xp = (this.pvs[0][0] + dotR * this.puv[0]) - (o.pvs[0][0] + dotB * o.puv[0]);
				yp = (this.pvs[0][1] + dotR * this.puv[1]) - (o.pvs[0][1] + dotB * o.puv[1]);
				
				let p1c = false;
				let isP1Penetrating = false;
				if(xd * xp + yd * yp < 0.0) isP1Penetrating = true;
				if(isP1Penetrating || dt  < minDistSqd) {
					if(isP1Penetrating) {
						if((isP0Penetrating && dt > d) || !isP0Penetrating) {
							pc = dt + minDistSqd;
							xrc = xtrc;
							yrc = ytrc;
						}
					} else if(!isP0Penetrating && dt < d){
						pc = minDistSqd - dt;
						xrc = xtrc;
						yrc = ytrc;
					}
					p1c = true;
				}
				if(p0c || p1c){
					if(p0c && p1c){

						// anti-patter
						this.w *= 0.8;

						xrc = this.p[0];
						yrc = this.p[1];
					}
					let nx = -o.uv[1];
					let ny = o.uv[0];
					if(dotR == 0 || Math.abs(dotR - this.l) < 0.0001){
						if(xp * nx + yp * ny < 0.0){
							nx = o.uv[1];
							ny = -o.uv[0];
						}
					} else {
						nx = -this.uv[1];
						ny = this.uv[0];
						if(xp * nx + yp * ny < 0.0){
							nx = this.uv[1];
							ny = -this.uv[0];
						}
					}
					solveCollision(this, o, xrc, yrc, nx, ny, 1.0, pc);
				}
				*/
			}
		}
	}






	
		/*
		for(let i = wheels.length; i > -1; --i){
			if(w.isPointTouching(mx, my)) {
				removeWheel(w);
				return;
			}
		}
		for(const r of rods){
			if(r.isPointTouching(mx, my)) {
				removeRod(r);
				return;
			}
		}
		*/





		/*
function solveCollisions() {
	//temp
	//markers.push({p: new Float32Array([0.0, 0.0]), c: orange});
	pass = 0;
	do {
		++pass;
		unsolved = false;		

		for(const k of revoluteJoints) {
			let r = false;
			let w = false;
			for(let i = 0, s = k.objects.length; i < s; ++i) {
				if(k.w){
					if(k.objects[i].form == "r"){
						r = k.objects[i];
					} else if(k.objects[i].form == "w") {
						w = k.objects[i];
					}
				}
				for(let a = 0; a < s; ++a) {
					if(i == a) continue;
					let nx = k.positions[i][0] - k.positions[a][0];
					let ny = k.positions[i][1] - k.positions[a][1];
					let distSQD = nx * nx + ny * ny;
					if(distSQD > 0.000005){
						unsolved = true;
						let rxAP = -(k.positions[a][1] - k.objects[a].com[1]);
						let ryAP = k.positions[a][0] - k.objects[a].com[0];
						let rxBP = -(k.positions[i][1] - k.objects[i].com[1]);
						let ryBP = k.positions[i][0] - k.objects[i].com[0];
						let dotperpA = rxAP * nx + ryAP * ny;
						let dotperpB = rxBP * nx + ryBP * ny;
						let den = distSQD * (k.objects[a].mInv + k.objects[i].mInv) + dotperpA * dotperpA * k.objects[a].iInv + dotperpB * dotperpB * k.objects[i].iInv;
						let pc = distSQD * (1.0 / ((k.objects[a].mInv + k.objects[i].mInv) + dotperpA * dotperpA * k.objects[a].iInv + dotperpB * dotperpB * k.objects[i].iInv));
						let xv = (k.objects[i].xv + k.objects[i].w * rxBP) - (k.objects[a].xv + k.objects[a].w * rxAP);
						let yv = (k.objects[i].yv + k.objects[i].w * ryBP) - (k.objects[a].yv + k.objects[a].w * ryAP);
						let vn = 1.25 * (xv * nx + yv * ny);
						if(vn < 0.0) vn *= 0.25;
						let j = (vn + distSQD * 0.1) / den;
						k.objects[a].integrateImpulse(j * k.objects[a].mInv * nx, j * k.objects[a].mInv * ny, dotperpA * j * k.objects[a].iInv);
						k.objects[i].integrateImpulse(-j * k.objects[i].mInv * nx, -j * k.objects[i].mInv * ny, dotperpB * -j * k.objects[i].iInv);
					}
				}
			}
			if(r && w && k.w && !velocitySteering){
				if(pass == 1) k.ww = k.w;
				let xAP_BP = -r.yuv;
				let yAP_BP = r.xuv;
				let xPerpBP = -r.yuv;
				let yPerpBP = r.xuv;
				let xPerpRP = (w.com[1] - r.com[1]);
				let yPerpRP = -(w.com[0] - r.com[0]);
				let vxAP_BP = (w.xv + ((k.ww + w.w) * xPerpBP)) - (r.xv + xPerpRP * r.w);
				let vyAP_BP = (w.yv + ((k.ww + w.w) * yPerpBP)) - (r.yv + yPerpRP * r.w);
				let nvAP = xAP_BP * vxAP_BP + yAP_BP * vyAP_BP;
				let dotperpB = xPerpBP * xAP_BP + yPerpBP * yAP_BP;
				let dotperpR = xPerpRP * xAP_BP + yPerpRP * yAP_BP;
				let den = (w.mInv + r.mInv) + (dotperpB * dotperpB * w.iInv) + (dotperpR * dotperpR * r.iInv);
				let j = nvAP / den;
				r.integrateImpulse(0.0, 0.0, dotperpR * j * r.iInv);
				w.integrateImpulse(0.0, 0.0, dotperpB * -j * w.iInv);
				k.ww += (dotperpB * -j * w.iInv);
			}
		}

		for(const o of physicsObjects){
			o.solveCollisions();
		}
	} while(unsolved && pass < currentMaxPass);
	console.log("collision passes = " + pass);
}
*/













function solveJoint(objA, objB, data){
	if(data.isMotor){
		let dA = objA.i + objA.m * (data.localA[0] * data.localA[0] + data.localA[1] * data.localA[1]);
		let dB = objB.i + objB.m * (data.localB[0] * data.localB[0] + data.localB[1] * data.localB[1]);
		//let aa = objA.pw - objB.pw - data.motorW * dt;
		let aa = objA.w - objB.w - data.motorW;
		let t = aa * dB;
		/*
		if(data.appliedT + Math.abs(t) > data.maxMotorT * dt) {
			if(data.appliedT < data.maxMotorT * dt){
				if(t < 0) t = data.appliedT - data.maxMotorT * dt;
				else t = data.maxMotorT * dt - data.appliedT;
			} else {
				t = 0.0;
			}
		}
		*/
		if(data.appliedT + Math.abs(t) > data.maxMotorT) {
			if(data.appliedT < data.maxMotorT){
				if(t < 0) t = data.appliedT - data.maxMotorT;
				else t = data.maxMotorT - data.appliedT;
			} else {
				t = 0.0;
			}
		}
		/*
		if(objA.type == MOVABLE) {
			objA.pw -= t / dA;
		}
		if(objB.type == MOVABLE) {
			objB.pw += t / dB;
		}
		*/
		if(objA.type == MOVABLE) {
			objA.w -= t / dA;
		}
		if(objB.type == MOVABLE) {
			objB.w += t / dB;
		}
		//data.appliedT += Math.abs(t);
	}
	let worldAx = (data.localA[0] * objA.r[0] - data.localA[1] * objA.r[1]) + objA.p[0];
	let worldAy = (data.localA[1] * objA.r[0] + data.localA[0] * objA.r[1]) + objA.p[1];
	let worldBx = (data.localB[0] * objB.r[0] - data.localB[1] * objB.r[1]) + objB.p[0];
	let worldBy = (data.localB[1] * objB.r[0] + data.localB[0] * objB.r[1]) + objB.p[1];
	let nx = worldAx - worldBx;
	let ny = worldAy - worldBy;
	let distSqd = nx * nx + ny * ny;
	if(distSqd == 0.0) return;

	if(debugPoints.length < 20) {
		debugPoints.push([[worldAx, worldAy], white]);
		debugPoints.push([[worldBx, worldBy], red]);
	}

	unsolved= true;
	let dist = Math.sqrt(distSqd);
	nx /= dist;
	ny /= dist;
	let rxAP = objA.p[1] - worldAy;
	let ryAP = worldAx - objA.p[0];
	let rxBP = objB.p[1] - worldBy;
	let ryBP = worldBx - objB.p[0];
	let dotperpA = rxAP * nx + ryAP * ny;
	let dotperpB = rxBP * nx + ryBP * ny;
	let massEff = objA.mInv + objB.mInv + dotperpA * dotperpA * objA.iInv + dotperpB * dotperpB * objB.iInv;
	if(isVelocityIter){
		//let vx = objA.pv[0] + objA.pw * rxAP - objB.pv[0] - objB.pw * rxBP;
		//let vy = objA.pv[1] + objA.pw * ryAP - objB.pv[1] - objB.pw * ryBP;
		let vx = objA.v[0] + objA.w * rxAP - objB.v[0] - objB.w * rxBP;
		let vy = objA.v[1] + objA.w * ryAP - objB.v[1] - objB.w * ryBP;
		let vn = vx * nx + vy * ny;
		// skip division?
		//if(vn > 0.0) vn *= 1.25;
		let j = vn / massEff;
		//let j = (vn / massEff) * dt;
		/*
		if(objA.type == MOVABLE){
			objA.pv[0] -= j * nx * objA.mInv;
			objA.pv[1] -= j * ny * objA.mInv;
			objA.pw -= j * dotperpA * objA.iInv;
		}
		if(objB.type == MOVABLE){
			objB.pv[0] += j * nx * objB.mInv;
			objB.pv[1] += j * ny * objB.mInv;
			objB.pw += j * dotperpB * objB.iInv;
		}
		*/
		if(objA.type == MOVABLE){
			objA.v[0] -= j * nx * objA.mInv;
			objA.v[1] -= j * ny * objA.mInv;
			objA.w -= j * dotperpA * objA.iInv;
		}
		if(objB.type == MOVABLE){
			objB.v[0] += j * nx * objB.mInv;
			objB.v[1] += j * ny * objB.mInv;
			objB.w += j * dotperpB * objB.iInv;
		}
	} else {
		// too much??
		let j = (dist * 0.25) / massEff;
		objA.applyAcceleration(-j * objA.mInv * nx, -j * objA.mInv * ny, dotperpA * -j * objA.iInv);
		objB.applyAcceleration(j * objB.mInv * nx, j * objB.mInv * ny, dotperpB * j * objB.iInv);
	}
}

function collide(objA, objB, ax, ay, bx, by, nx, ny, dist){
	let xrpa = objA.p[1] - ay;
	let yrpa = ax - objA.p[0];
	let xrpb = objB.p[1] - by;
	let yrpb = bx - objB.p[0];	
	//let vxRel = objA.pv[0] + objA.pw * xrpa - objB.pv[0] - objB.pw * xrpb;
	//let vyRel = objA.pv[1] + objA.pw * yrpa - objB.pv[1] - objB.pw * yrpb;
	let vxRel = objA.v[0] + objA.w * xrpa - objB.v[0] - objB.w * xrpb;
	let vyRel = objA.v[1] + objA.w * yrpa - objB.v[1] - objB.w * yrpb;
	let nv = nx * vxRel + ny * vyRel;
	if(nv > -dist) return;
	unsolved = true;
	let drpa = xrpa * nx + yrpa * ny;
	let drpb = xrpb * nx + yrpb * ny;
	let mEff = objA.mInv + objB.mInv + drpa * drpa * objA.iInv + drpb * drpb * objB.iInv;
	if(isVelocityIter){
		let j = (nv + dist) * 1.05 / mEff;
		// solve friction
		let da = xrpa * ny - yrpa * nx;
		let db = xrpb * ny - yrpb * nx;
		mEff = objA.mInv + objB.mInv + da * da * objA.iInv + db * db * objB.iInv;
		let jf = (ny * vxRel - nx * vyRel) / mEff;
		if(Math.abs(jf) > -j * (objA.us + objB.us) * 0.5) {
			if(jf > 0) jf = -j * (objA.uk + objB.uk) * 0.5;
			else jf = j * (objA.uk + objB.uk) * 0.5;
		}
		let jx = j * nx + jf * ny;
		let jy = j * ny - jf * nx;
		if(objA.type == MOVABLE){
			objA.v[0] -= jx * objA.mInv;
			objA.v[1] -= jy * objA.mInv;
			objA.w -= (j * drpa + jf * da) * objA.iInv;
		}
		if(objB.type == MOVABLE){
			objB.v[0] += jx * objB.mInv;
			objB.v[1] += jy * objB.mInv;
			objB.w += (j * drpb + jf * db) * objB.iInv;
		}
		/*
		if(objA.type == MOVABLE){
			objA.pv[0] -= jx * objA.mInv;
			objA.pv[1] -= jy * objA.mInv;
			objA.pw -= (j * drpa + jf * da) * objA.iInv;
		}
		if(objB.type == MOVABLE){
			objB.pv[0] += jx * objB.mInv;
			objB.pv[1] += jy * objB.mInv;
			objB.pw += (j * drpb + jf * db) * objB.iInv;
		}
		*/
		/*
	} else if(dist < 0.0) {
		let j = dist / mEff;
		objA.applyAcceleration(-j * nx * objA.mInv, -j * ny * objA.mInv, -j * drpa * objA.iInv);
		objB.applyAcceleration(j * nx * objB.mInv, j * ny * objB.mInv, j * drpb * objB.iInv);
		*/
	}
}

/*
function collide(objA, objB, ax, ay, bx, by, nx, ny, dist){
	let xrpa = objA.p[1] - ay;
	let yrpa = ax - objA.p[0];
	let xrpb = objB.p[1] - by;
	let yrpb = bx - objB.p[0];	
	//let vxRel = objA.pv[0] + objA.pw * xrpa - objB.pv[0] - objB.pw * xrpb;
	//let vyRel = objA.pv[1] + objA.pw * yrpa - objB.pv[1] - objB.pw * yrpb;
	let vxRel = objA.v[0] + objA.v[2] * xrpa - objB.v[0] - objB.v[2] * xrpb;
	let vyRel = objA.v[1] + objA.v[2] * yrpa - objB.v[1] - objB.v[2] * yrpb;
	let nv = nx * vxRel + ny * vyRel;
	if(nv > -dist) return;
	unsolved = true;
	let drpa = xrpa * nx + yrpa * ny;
	let drpb = xrpb * nx + yrpb * ny;
	let mEff = objA.mInv + objB.mInv + drpa * drpa * objA.iInv + drpb * drpb * objB.iInv;
	if(isVelocityIter){
		let j = (nv + dist) * 1.05 / mEff;
		// solve friction
		let da = xrpa * ny - yrpa * nx;
		let db = xrpb * ny - yrpb * nx;
		mEff = objA.mInv + objB.mInv + da * da * objA.iInv + db * db * objB.iInv;
		let jf = (ny * vxRel - nx * vyRel) / mEff;
		if(Math.abs(jf) > -j * (objA.us + objB.us) * 0.5) {
			if(jf > 0) jf = -j * (objA.uk + objB.uk) * 0.5;
			else jf = j * (objA.uk + objB.uk) * 0.5;
		}
		let jx = j * nx + jf * ny;
		let jy = j * ny - jf * nx;
		if(objA.type == MOVABLE){
			objA.v[0] -= jx * objA.mInv;
			objA.v[1] -= jy * objA.mInv;
			objA.v[2] -= (j * drpa + jf * da) * objA.iInv;
		}
		if(objB.type == MOVABLE){
			objB.v[0] += jx * objB.mInv;
			objB.v[1] += jy * objB.mInv;
			objB.v[2] += (j * drpb + jf * db) * objB.iInv;
		}
		/*
		if(objA.type == MOVABLE){
			objA.pv[0] -= jx * objA.mInv;
			objA.pv[1] -= jy * objA.mInv;
			objA.pw -= (j * drpa + jf * da) * objA.iInv;
		}
		if(objB.type == MOVABLE){
			objB.pv[0] += jx * objB.mInv;
			objB.pv[1] += jy * objB.mInv;
			objB.pw += (j * drpb + jf * db) * objB.iInv;
		}
		*/
		/*
	} else if(dist < 0.0) {
		let j = dist / mEff;
		objA.applyAcceleration(-j * nx * objA.mInv, -j * ny * objA.mInv, -j * drpa * objA.iInv);
		objB.applyAcceleration(j * nx * objB.mInv, j * ny * objB.mInv, j * drpb * objB.iInv);
	}
}
*/




function solveCirclesCollision(circleA, circleB){
	let nx = circleA.p[0] - circleB.p[0];
	let ny = circleA.p[1] - circleB.p[1];
	let dist = Math.sqrt(nx * nx + ny * ny);
	let uvnx = nx / dist;
	let uvny = ny / dist;
	let ax = circleA.p[0] + uvnx * -circleA.radius;
	let ay = circleA.p[1] + uvny * -circleA.radius;
	let bx = circleB.p[0] + uvnx * circleB.radius;
	let by = circleB.p[1] + uvny * circleB.radius;
	collide(circleA, circleB, ax, ay, bx, by, uvnx, uvny, dist - circleA.radius - circleB.radius);
}

function solveCircleLineCollision(circle, line){
	let dot = (circle.p[0] - line.wvs[0][0]) * line.uv[0] + (circle.p[1] - line.wvs[0][1]) * line.uv[1];
	let lx = 0.0;
	let ly = 0.0;
	if(dot <= 0.0) {
		lx = line.wvs[0][0];
		ly = line.wvs[0][1];
	} else if(dot >= line.l) {
		lx = line.wvs[1][0];
		ly = line.wvs[1][1];
	} else {
		lx = line.uv[0] * dot + line.wvs[0][0];
		ly = line.uv[1] * dot + line.wvs[0][1];
	}
	let nx = circle.p[0] - lx;
	let ny = circle.p[1] - ly;
	let dist = Math.sqrt(nx * nx + ny * ny);
	let uvnx = nx / dist;
	let uvny = ny / dist;
	let cx = circle.p[0] + uvnx * -0.1;
	let cy = circle.p[1] + uvny * -0.1;
	collide(circle, line, cx, cy, lx, ly, uvnx, uvny, dist - circle.radius - line.halfWidth);
}

function solveLinesCollision(a, b){
	let dotB = (a.wvs[0][0] - b.wvs[0][0]) * b.uv[0] + (a.wvs[0][1] - b.wvs[0][1]) * b.uv[1];
	let dotTemp = dotB;
	if(dotB < 0.0) dotB = 0.0;
	else if(dotB > b.l) dotB = b.l;
	let bx = b.wvs[0][0] + dotB * b.uv[0];
	let by = b.wvs[0][1] + dotB * b.uv[1];
	let dotR = 0.0;
	if(dotTemp < 0.0 || dotTemp > b.l){
		dotR = (bx - a.wvs[0][0]) * a.uv[0] + (by - a.wvs[0][1]) * a.uv[1];
		if(dotR < 0.0 || dotR > a.l) return;
	}
	let ax = a.wvs[0][0] + dotR * a.uv[0];
	let ay = a.wvs[0][1] + dotR * a.uv[1];
	let xd = ax - bx;
	let yd = ay - by;
	let dist = Math.sqrt(xd * xd + yd * yd);
	collide(a, b, ax, ay, bx, by, xd / dist, yd / dist, dist - a.halfWidth - b.halfWidth);
	
	dotB = (a.wvs[1][0] - b.wvs[0][0]) * b.uv[0] + (a.wvs[1][1] - b.wvs[0][1]) * b.uv[1];
	dotTemp = dotB;
	if(dotB < 0.0) dotB = 0.0;
	else if(dotB > b.l) dotB = b.l;
	bx = b.wvs[0][0] + dotB * b.uv[0];
	by = b.wvs[0][1] + dotB * b.uv[1];
	dotR = a.l;
	if(dotTemp < 0.0 || dotTemp > b.l){
		dotR = (bx - a.wvs[0][0]) * a.uv[0] + (by - a.wvs[0][1]) * a.uv[1];
		if(dotR < 0.0 || dotR > a.l) return;
	}
	ax = a.wvs[0][0] + dotR * a.uv[0];
	ay = a.wvs[0][1] + dotR * a.uv[1];
	xd = ax - bx;
	yd = ay - by;
	dist = Math.sqrt(xd * xd + yd * yd);
	collide(a, b, ax, ay, bx, by, xd / dist, yd / dist, dist - a.halfWidth - b.halfWidth);
}



// integrate velocities
	for(const o of gameObjects){
		if(o.type == MOVABLE){
			o.v[1] += G;
			o.v[0] *= o.vM;
			o.v[1] *= o.vM;
			o.v[2] *= o.wM;
		/*
			o.pv[0] = o.v[0] * dt;
			o.pv[1] = o.v[1] * dt + G * dt;
			o.pw = o.w * dt;
			o.pv[0] *= o.vM;
			o.pv[1] *= o.vM;
			o.pw *= o.wM;
			*/
		}
	}




	/*
			this.data.params[i].xrpa = this.data.pA[1] - params[i][3];
			this.data.params[i].yrpa = params[i][2] - this.data.pA[0];
			this.data.params[i].xrpb = this.data.pB[1] - params[i][5];
			this.data.params[i].yrpb = params[i][4] - this.data.pB[0];
			this.data.params[i].drpa = this.data.params[i].xrpa * params[i][0] + this.data.params[i].yrpa * params[i][1];
			this.data.params[i].drpb = this.data.params[i].xrpb * params[i][0] + this.data.params[i].yrpb * params[i][1];
			this.data.params[i].mEff = this.data.mInvA + this.data.mInvB + this.data.params[i].drpa * this.data.params[i].drpa * this.data.iInvA + this.data.params[i].drpb * this.data.params[i].drpb * this.data.iInvB;
			this.data.params[i].da = this.data.params[i].xrpa * params[i][1] - this.data.params[i].yrpa * params[i][0];
			this.data.params[i].db = this.data.params[i].xrpb * params[i][1] - this.data.params[i].yrpb * params[i][0];
			this.data.params[i].mEffTan = this.data.mInvA + this.data.mInvB + this.data.params[i].da * this.data.params[i].da * this.data.iInvA + this.data.params[i].db * this.data.params[i].db * this.data.iInvB;
			*/







			"use strict";
let saveMessageP = document.getElementById("saveMessageP");
let downloadLink = document.getElementById('downloadlink');
let saveText = document.getElementById('saveText');
var saveLevelScene = {
	activeBtn: false,
	activeBtnElement: false,
	btnsDiv: document.getElementById("saveCloseBtnDiv"),
	overlayUI_Div: document.getElementById("saveLevelUI"),
	backScene: false,

	save(){
		saveMessageP.textContent = "Creating file...";
		if(saveText.value == ""){
			exceptionScene.throw(exceptions.saveFileNameMissing);
			saveMessageP.textContent = "";
			return;
		} else {
			let data = '[{"JSON_LevelFile":true}';
			/*
			if(assemblyRect){
				data += "," + assemblyRect.toJSON();
			}
			if(goalRect){
				data += "," + goalRect.toJSON();
			}
			if(target){
				data += "," + target.toJSON();
			}
			*/
			for(const r of rods) {
				if(r.type == "g") {
					data += "," + r.toJSON();
				}
			}
			for(const w of wheels) {
				if(w.type != "t") data += "," + w.toJSON();
			}
			data += "]"
			console.log("data = " + data);
			let blob = new Blob([data], {type : 'application/json'});
			downloadLink.download = saveText.value;
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.click();
			saveMessageP.textContent = "Download has started";
			return;
		}
	},

	handleWheel(e) {
	},

	start(){
		this.overlayUI_Div.style.display = "block";
	},
	suspend(){
		this.overlayUI_Div.style.display = "none";
	},
}



/*
function solveCollisionVelocity(data, params){
	// default to data for collision params
	if(arguments.length == 1) params = data;
	// compute relative velocity
	let vxRel = data.vA[0] + data.vA[2] * -params.ryA - data.vB[0] - data.vB[2] * -params.ryB;
	let vyRel = data.vA[1] + data.vA[2] * params.rxA - data.vB[1] - data.vB[2] * params.rxB;
	let nv = params.nx * vxRel + params.ny * vyRel;
	// only continue if relative normal velocity is less than distance between game objects
	if(nv > -params.dist) return;
	unsolved = true;
	// compute normal impulse
	let j = (nv + params.dist) * 1.02 / params.mInv;
	// compute friction
	let jf = (params.nx * vyRel - params.ny * vxRel) / params.mTanInv;
	if(Math.abs(jf) > -j * data.us) {
		if(jf > 0) jf = -j * data.uk;
		else jf = j * data.uk;
	}
	// integrate impulse into velocity
	let jx = j * params.nx - jf * params.ny;
	let jy = j * params.ny + jf * params.nx;
	if(data.typeA == MOVABLE){
		data.vA[0] -= jx * data.mInvA;
		data.vA[1] -= jy * data.mInvA;
		data.vA[2] -= (j * params.rnA + jf * params.rtA) * data.iInvA;
	}
	if(data.typeB == MOVABLE){
		data.vB[0] += jx * data.mInvB;
		data.vB[1] += jy * data.mInvB;
		data.vB[2] += (j * params.rnB + jf * params.rtB) * data.iInvB;
	}
}
*/





/*
var gameObjects = [];
class GameObject {
	constructor(tx, ty, color, form, type){
		this.form = form;
		this.type = type;

		this.p = [tx, ty, 1.0, 0.0];
		this.o = 0.0;
		this.v = [0.0, 0.0, 0.0];
		//new
		//this.pv = new Float32Array([0.0, 0.0]);
		//this.w = 0.0;
		//new
		//this.pw = 0.0;

		this.color = color;

		this.vM = 0.99;
		this.wM = 0.99;

		this.us = 0.8;
		this.uk = 0.6;

		this.m = 0.0;
		this.mInv = 0.0;
		this.i = 0.0;
		this.iInv = 0.0;

		this.group = 0;
		this.collidableGroups = null;

		this.userData = null;


		//new
		//this.index = gameObjects.length;



		gameObjects.push(this);
		console.log("gameObjects.length = " + gameObjects.length);
	}

	getLocalPosition(wx, wy){
		let x = wx - this.p[0];
		let y = wy - this.p[1];
		return [x * this.p[2] + y * this.p[3], y * this.p[2] - x * this.p[3]];
	}

	setAngularVelocity(w){
		if(this.type == FIXED) return;
		this.v[2] = w;
	}

	setLinearVelocity(vx, vy){
		if(this.type == FIXED) return;
		this.v[0] = vx;
		this.v[1] = vy;
	}

	static removeAll(){
		gameObjects.splice(0, gameObjects.length);
		constraints.splice(0, constraints.length);
	}

	remove(index){
		let i = 0;
		if(arguments.length > 0) i = index;
		else i = gameObjects.indexOf(this);
		if(i > -1){
			this.removeAllConstraints();
			gameObjects.splice(i, 1);
			console.log("gameObjects.length = " + gameObjects.length);
			return true;
		}
		console.warn("Cannot remove game object, does not exist in gameObjects array");
		return false;
	}

	removeAllConstraints(){
		for(let n = constraints.length - 1; n > -1; --n){
			if(this == constraints[n].objA || this == constraints[n].objB) constraints.splice(n, 1);
		}
		console.log("constraints.length = " + constraints.length);
	}
}
*/



/*
class Circle extends GameObject {
	constructor(x, y, color, radius, type) {
		super(x, y, color, CIRCLE_FORM, type);
		this.radius = radius;
		this.radiusSqd = this.radius * this.radius;
	}

	setMass(mass){
		if(this.type == FIXED) return;
		this.m = mass;
		this.mInv = 1.0 / this.m;
		// increase to maybe improve perf?
		this.i = 0.75 * this.m * this.radius * this.radius;
		this.iInv = 1.0 / this.i;
	}

	setPosition(x, y){
		this.p[0] = x;
		this.p[1] = y;
	}

	setRotation(o){
		this.o = o;
		this.p[2] = Math.cos(o);
		this.p[3] = Math.sin(o);
	}

	isPenetrating(obj){
		if(obj.form == CIRCLE_FORM) {
			if(getCirclesCollisionParams(this, obj)[6] < 0.0) return true;
		} else if(obj.form == PLANE_FORM) {
			if(getCirclePlaneCollisionParams(this, obj)[6] < 0.0) return true;
		}
		return false;
	}
	
	integrateVelocities(){
		if(this.type == FIXED) return;
		this.p[0] += this.v[0];
		this.p[1] += this.v[1];
		this.o += this.v[2];
		this.p[2] = Math.cos(this.o);
		this.p[3] = Math.sin(this.o);
		/*
		this.p[0] += this.pv[0];
		this.p[1] += this.pv[1];
		this.o += this.pw;
		this.r[0] = Math.cos(this.o);
		this.r[1] = Math.sin(this.o);
		*/
	//}
	/*
	applyAcceleration(ax, ay, t){
		if(this.type == FIXED) return;
		this.p[0] += ax;
		this.p[1] += ay;
		this.o += t;
		this.p[2] = Math.cos(this.o);
		this.p[3] = Math.sin(this.o);
	}

	isPointTouching(x, y){
		let nx = this.p[0] - x;
		let ny = this.p[1] - y;
		if(nx * nx + ny * ny < this.radiusSqd) return true;
		return false;
	}
}
*/


//class Plane extends GameObject {
class Plane {
	constructor(x0, y0, x1, y1, color, width, type) {
		//super((x0 + x1) * 0.5, (y0 + y1) * 0.5, color, PLANE_FORM, type);
		this.wvs = [new Float32Array([x0, y0]), new Float32Array([x1, y1])];
		this.lvs = [new Float32Array([x0 - this.p[0], y0 - this.p[1]]), new Float32Array([x1 - this.p[0], y1 - this.p[1]])];
		// d needed?
		this.d = new Float32Array([this.lvs[1][0] - this.lvs[0][0], this.lvs[1][1] - this.lvs[0][1]]);
		this.l = Math.sqrt(this.d[0] * this.d[0] + this.d[1] * this.d[1]);
		this.lInv = 1.0 / this.l;
		this.uv = new Float32Array([this.d[0] * this.lInv, this.d[1] * this.lInv]);
		this.width = width;
		this.halfWidth = width * 0.5;
		//this.pvs = [new Float32Array([x0, y0]), new Float32Array([x1, y1])];
		//this.puv = new Float32Array([this.xuv,  this.yuv]);
	}

	setPosition(x, y){
		this.p[0] = x;
		this.p[1] = y;
		this.updateDimensions();
		/*
		this.pvs[0][0] = this.wvs[0][0];
		this.pvs[0][1] = this.wvs[0][1];
		this.pvs[1][0] = this.wvs[1][0];
		this.pvs[1][1] = this.wvs[1][1];
		this.puv[0] = this.uv[0];
		this.puv[1] = this.uv[1];
		*/
	}

	setRotation(o){
		this.o = o;
		this.p[2] = Math.cos(o);
		this.p[3] = Math.sin(o);
		this.updateDimensions();
		/*
		this.pvs[0][0] = this.wvs[0][0];
		this.pvs[0][1] = this.wvs[0][1];
		this.pvs[1][0] = this.wvs[1][0];
		this.pvs[1][1] = this.wvs[1][1];
		this.puv[0] = this.uv[0];
		this.puv[1] = this.uv[1];
		*/
	}

	setMass(mass){
		if(this.type == FIXED) return;
		this.m = mass;
		this.mInv = 1.0 / this.m;
		// increase to improve perf?
		this.i = 0.2 * this.m * this.l * this.l;
		this.iInv = 1.0 / this.i;
		for(const c of constraints){
			if(c.objA == this){
				c.data.mInvA = this.mInv;
				c.data.iInvA = this.iInv;
				c.data.mA = this.m;
				c.data.iA = this.i;
			} else if(c.objB == this){
				c.data.mInvB = this.mInv;
				c.data.iInvB = this.iInv;
				c.data.mB = this.m;
				c.data.iB = this.i;
			}
		}
	}

	integrateVelocities(){
		if(this.type == FIXED) return;
		
		this.p[0] += this.v[0];
		this.p[1] += this.v[1];
		this.o += this.v[2];
		this.p[2] = Math.cos(this.o);
		this.p[3] = Math.sin(this.o);
		this.updateDimensions();
		/*
		this.p[0] += this.pv[0];
		this.p[1] += this.pv[1];
		this.o += this.pw;
		this.r[0] = Math.cos(this.o);
		this.r[1] = Math.sin(this.o);
		this.updateDimensions();
		*/
	}

	applyAcceleration(ax, ay, t){
		if(this.type == FIXED) return;
		this.p[0] += ax;
		this.p[1] += ay;
		this.o += t;
		this.p[2] = Math.cos(this.o);
		this.p[3] = Math.sin(this.o);
		this.updateDimensions();
	}

	updateDimensions(){
		this.wvs[0][0] = this.lvs[0][0] * this.p[2] - this.lvs[0][1] * this.p[3] + this.p[0];
		this.wvs[0][1] = this.lvs[0][1] * this.p[2] + this.lvs[0][0] * this.p[3] + this.p[1];
		this.wvs[1][0] = this.lvs[1][0] * this.p[2] - this.lvs[1][1] * this.p[3] + this.p[0];
		this.wvs[1][1] = this.lvs[1][1] * this.p[2] + this.lvs[1][0] * this.p[3] + this.p[1];
		this.d[0] = this.wvs[1][0] - this.wvs[0][0];
		this.d[1] = this.wvs[1][1] - this.wvs[0][1];
		this.uv[0] = this.d[0] * this.lInv;
		this.uv[1] = this.d[1] * this.lInv;
	}

	isPenetrating(obj){
		if(obj.form == CIRCLE_FORM) {
			if(getCirclePlaneCollisionParams(obj, this)[6] < 0.0) return true;
		} else if(obj.form == PLANE_FORM) {
			if(isPlanesPenetrating(this, obj)) return true;
		}
		return false;
	}

	setCollidableGroups(groups){
		for(const o of gameObjects){
			if(this.type == FIXED && o.type == FIXED) continue;
			if(o != this && groups.includes(o.group)){
				if(o.form == CIRCLE_FORM) new Collidable(o, this, getCirclePlaneCollisionParams);
				else if(o.form == PLANE_FORM) new PolygonCollidable(this, o, getPlanesCollisionParams);
				else throw new Error("Unhandled form for collision with plane");
			}
		}
		this.collidableGroups = groups;
	}

	isPointTouching(x, y){
		let dot = (x - this.wvs[0][0]) * this.uv[0] + (y - this.wvs[0][1]) * this.uv[1];
		if(dot >= 0.0 && dot <= this.l){
			let nx = x - (this.wvs[0][0] + this.uv[0] * dot);
			let ny = y - (this.wvs[0][1] + this.uv[1] * dot);
			if(nx * nx + ny * ny < this.halfWidth * this.halfWidth) return true;
		}
		return false;
	}
}






var constraints = [];
class Constraint {
	constructor(form, objA, objB) {
		this.form = form;
		this.objA = objA;
		this.objB = objB;
		this.userData = null;
		constraints.push(this);
		console.log("constraints.length = " + constraints.length);
	}

	remove(){
		let i = constraints.indexOf(this);
		if(i > -1){



			//new 
			let len = constraints.length;
			let newConstraints = new Array(len);
			for(let i = 0; i < len; ++i){
				if(!constraints[i]) break;
				if(constraints[i] != this){
					newConstraints[i] = constraints[i];
				}
			}



			//constraints.splice(i, 1);
			//console.log("constraints.length = " + constraints.length);

			return true;
		}
		console.warn("Cannot remove constraint, does not exist in constraints array");
		return false;
	}
}

class Collidable extends Constraint {
	constructor(objA, objB, getCollisionParams){
		super(COLLIDABLE_FORM, objA, objB);
		this.getCollisionParams = getCollisionParams;

		// new
		this.params0 = new Float32Array(21);
		this.params0[0] = objA.type;
		this.params0[1] = objB.type;
		this.params0[2] = objA.mInv;
		this.params0[3] = objB.mInv;
		this.params0[4] = objA.iInv;
		this.params0[5] = objB.iInv;
		this.params0[6] = (objA.us + objB.us) * 0.5;
		this.params0[7] = (objA.uk + objB.uk) * 0.5;
	}

	init(){
		let collisionData = this.getCollisionParams(this.objA, this.objB);
		// normals
		this.params0[8] = collisionData[0];
		this.params0[9] = collisionData[1];
		// distance between collision points
		this.params0[10] = collisionData[6];
		// objA vector from center of mass to collision vertex (radius vector)
		this.params0[11] = collisionData[2] - this.objA.p[0];
		this.params0[12] = collisionData[3] - this.objA.p[1];
		// objB vector from center of mass to collision vertex (radius vector)
		this.params0[13] = collisionData[4] - this.objB.p[0];
		this.params0[14] = collisionData[5] - this.objB.p[1];
		// objA projection of radius vector on normal vector
		this.params0[15] = this.params0[11] * collisionData[1] - this.params0[12] * collisionData[0];
		// objB projection of radius vector on normal vector
		this.params0[16] = this.params0[13] * collisionData[1] - this.params0[14] * collisionData[0];
		// total mass in the collision normal reference
		this.params0[17] = 1.0 / 
			(this.params0[2] + this.params0[3] + this.params0[15] * this.params0[15] * this.params0[4] + 
			this.params0[16] * this.params0[16] * this.params0[5]);
		// objA projection of radius vector on tangential vector
		this.params0[18] = this.params0[11] * collisionData[0] + this.params0[12] * collisionData[1];
		// objB projection of radius vector on tangential vector
		this.params0[19] = this.params0[13] * collisionData[0] + this.params0[14] * collisionData[1];
		// total mass in the collision tangential reference
		this.params0[20] = 1.0 / 
			(this.params0[2] + this.params0[3] + this.params0[18] * this.params0[18] * this.params0[4] +
			this.params0[19] * this.params0[19] * this.params0[5]);
	}

	solveVelocity(){
		solveCollisionVelocity(this.params0, this.objA.v, this.objB.v);
	}

	solvePosition(){
		solveCollisionPosition(this);
	}
}


class PolygonCollidable extends Constraint {
	constructor(objA, objB, getCollisionParams){
		super(COLLIDABLE_FORM, objA, objB);
		this.getCollisionParams = getCollisionParams;
		//this.data.params = [{}, {}];
		//this.data.us = (objA.us + objB.us) * 0.5;
		//this.data.uk = (objA.uk + objB.uk) * 0.5;


		// new
		this.params0 = new Float32Array(21);
		this.params0[0] = objA.type;
		this.params0[1] = objB.type;
		this.params0[2] = objA.mInv;
		this.params0[3] = objB.mInv;
		this.params0[4] = objA.iInv;
		this.params0[5] = objB.iInv;
		this.params0[6] = (objA.us + objB.us) * 0.5;
		this.params0[7] = (objA.uk + objB.uk) * 0.5;

		// new
		this.params1 = new Float32Array(21);
		this.params1[0] = objA.type;
		this.params1[1] = objB.type;
		this.params1[2] = objA.mInv;
		this.params1[3] = objB.mInv;
		this.params1[4] = objA.iInv;
		this.params1[5] = objB.iInv;
		this.params1[6] = (objA.us + objB.us) * 0.5;
		this.params1[7] = (objA.uk + objB.uk) * 0.5;
	}
	
	init(){
		let collisionData = this.getCollisionParams(this.objA, this.objB);
		if(!params) {
			this.data.active = false;
			return;
		}
		if(params.length == 1){
			this.data.params[1].violated = false;
		} else {
			this.data.params[0].violated = true;
			this.data.params[1].violated = true;
		}
		this.data.active = true;
		for(let i = 0, s = collisionData.length; i < s; ++i){
			this.data.params[i].nx = collisionData[i][0];
			this.data.params[i].ny = collisionData[i][1];
			this.data.params[i].dist = collisionData[i][6];
			this.data.params[i].rxA = collisionData[i][2] - this.data.pA[0];
			this.data.params[i].ryA = collisionData[i][3] - this.data.pA[1];
			this.data.params[i].rxB = collisionData[i][4] - this.data.pB[0];
			this.data.params[i].ryB = collisionData[i][5] - this.data.pB[1];
			this.data.params[i].rnA = 
				this.data.params[i].rxA * collisionData[i][1] - this.data.params[i].ryA * collisionData[i][0];
			this.data.params[i].rnB = 
				this.data.params[i].rxB * collisionData[i][1] - this.data.params[i].ryB * collisionData[i][0];
			this.data.params[i].mInv = 
				this.data.mInvA + this.data.mInvB + this.data.params[i].rnA * this.data.params[i].rnA * this.data.iInvA +
				this.data.params[i].rnB * this.data.params[i].rnB * this.data.iInvB;
			this.data.params[i].rtA =
				this.data.params[i].rxA * collisionData[i][0] + this.data.params[i].ryA * collisionData[i][1];
			this.data.params[i].rtB = 
				this.data.params[i].rxB * collisionData[i][0] + this.data.params[i].ryB * collisionData[i][1];
			this.data.params[i].mTanInv = 
				this.data.mInvA + this.data.mInvB + this.data.params[i].rtA * this.data.params[i].rtA * this.data.iInvA +
				this.data.params[i].rtB * this.data.params[i].rtB * this.data.iInvB;
		}
	}

	solveVelocity(){
		if(this.data.active){
			for(const p of this.data.params){
				if(p.violated) solveCollisionVelocity(this.data, p);
			}
		}
	}

	solvePosition(){
		let params = this.getCollisionParams(this.objA, this.objB);
		if(params){
			for(const p of params){
				solveCollisionPosition(this, p);
			}
		}
	}
}






/*
var btns = [];
var closeBtn = {
	HTML: '<div align="right" style="float: top;"><input style="width: 40px; height: 40px;" draggable="false" type="image" src="assets/images/closeBtn.png" onclick="popScene()"/></div>',
	parentDivs: [saveLevelScene.btnsDiv, loadLevelScene.btnsDiv, exceptionScene.btnsDiv, sandboxSettingsScene.btnsDiv],
}
btns.push(closeBtn);

var startSimulationBtnnn = {
	HTML: '<input class="btn topBtn" draggable="false" type="image" src="assets/images/startSimulationBtn.svg" id="startSimulationBtn" onmousedown="pushScene(simulationScene)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
}
btns.push(startSimulationBtnnn);

var stopSimulationBtn = {
	HTML: '<input class="btn topBtn" draggable="false" type="image" src="assets/images/stopSimulationBtn.svg" id="stopSimulationBtn" onmousedown="popScene()"/>',
	parentDivs: [simulationScene.btnsDiv],
}
btns.push(stopSimulationBtn);

var settingsBtn = {
	HTML: '<input class="btn topBtn" draggable="false" type="image" src="assets/images/settingsBtn.svg" id="settingsBtn" onmousedown="floatScene(sandboxSettingsScene)"/>',
	parentDivs: [sandboxScene.btnsDiv],
}
btns.push(settingsBtn);

var rWheelBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/rWheelBtn.svg" id="rWheelBtn" onmousedown="changeActiveBtn(this, rWheelBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	handleActivePress(){
		tempWheel = createWheel(mx, my, DEFAULT_WHEEL_RADIUS, CCW_WHEEL_ID);
		if(tempWheel.isPositionLegal()) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveDrag(){
		if(tempWheel.moveTo(mx, my, 0, true)) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties();
	}
}
btns.push(rWheelBtn);

var nWheelBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/nWheelBtn.svg" id="nWheelBtn" onmousedown="changeActiveBtn(this, nWheelBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	handleActivePress(){
		tempWheel = createWheel(mx, my, DEFAULT_WHEEL_RADIUS, N_WHEEL_ID);
		if(tempWheel.isPositionLegal()) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveDrag(){
		if(tempWheel.moveTo(mx, my, 0, true)) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties();
	}
}
btns.push(nWheelBtn);

var fWheelBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/fWheelBtn.svg" id="fWheelBtn" onmousedown="changeActiveBtn(this, fWheelBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	handleActivePress(){
		tempWheel = createWheel(mx, my, DEFAULT_WHEEL_RADIUS, CW_WHEEL_ID);
		if(tempWheel.isPositionLegal()) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveDrag(){
		if(tempWheel.moveTo(mx, my, 0, true)) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties();
	}
}
btns.push(fWheelBtn);

var wRodBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/wRodBtn.svg" id="wRodBtn" onmousedown="changeActiveBtn(this, wRodBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	handleActivePress(){
		tempRod = createRod(mx, my, mx, my, DEFAULT_ROD_WIDTH, N_ROD_ID, true);
	},
	handleActiveDrag(){
		if(tempRod.setVertex(mx, my, 1, true)) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveMouseup(){
		tempRod.setFinalProperties();
		tempRod = false;
	},
}
btns.push(wRodBtn);

var cRodBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/cRodBtn.svg" id="cRodBtn" onmousedown="changeActiveBtn(this, cRodBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	handleActivePress(){
		tempRod = createRod(mx, my, mx, my, DEFAULT_ROD_WIDTH, C_ROD_ID, true);
	},
	handleActiveDrag(){
		if(tempRod.setVertex(mx, my, 1, true)) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveMouseup(){
		tempRod.setFinalProperties();
		tempRod = false;
	},
}
btns.push(cRodBtn);

var moveBtn = { 
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/moveBtn.png" id="moveBtn" onmousedown="changeActiveBtn(this, moveBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	gameObjectsToMove: [],
	objsOriginX: false,
	objsOriginY: false,
	xDragStart: false,
	yDragStart: false,
	isLegalMove: true,
	handleActivePress(){
		if(sandboxMode || assemblyField.isPointInside(mx, my)){
			let joinables = getJoinables(mx, my);
			if(joinables.length > 0){
				this.objsOriginX = joinables[0].x;
				this.objsOriginY = joinables[0].y;
				for(const j of joinables){
					if(j.obj.form == CIRCLE_FORM){
						let offset = j.obj.getLocalPosition(j.x, j.y);
						this.gameObjectsToMove.push(j.obj);
						j.obj.userData.offsetX = offset[0];
						j.obj.userData.offsetY = offset[1];
						for(const r of j.obj.userData.joints){
							if(r.objA.form == PLANE_FORM && !this.gameObjectsToMove.includes(r.objA)){
								this.gameObjectsToMove.push(r.objA);
								r.objA.userData.offsetX = offset[0] - r.data.localB[0];
								r.objA.userData.offsetY = offset[1] - r.data.localB[1];
								r.objA.userData.vertexIndex = r.userData.objAVertexIndex;
							} else if(r.objB.form == PLANE_FORM && !this.gameObjectsToMove.includes(r.objB)){
								this.gameObjectsToMove.push(r.objB);
								r.objB.userData.offsetX = offset[0] - r.data.localA[0];
								r.objB.userData.offsetY = offset[1] - r.data.localA[1];
								r.objB.userData.vertexIndex = r.userData.objBVertexIndex;
							}
						}
					} else if(!this.gameObjectsToMove.includes(j.obj)){
						this.gameObjectsToMove.push(j.obj);
						j.obj.userData.offsetX = 0.0;
						j.obj.userData.offsetY = 0.0;
						j.obj.userData.vertexIndex = j.vertexIndex;
					}
				}
				console.log("this.gameObjectsToMove.length = " + this.gameObjectsToMove.length);
				return;
			}
		}
		if(sandboxMode){
			for(const a of fields){
				if(Math.abs(mx - a.wvs[0][0]) < MAX_SNAP_DIST && Math.abs(my - a.wvs[0][1]) < MAX_SNAP_DIST){
					selectedFieldVertex = a.wvs[0];
					selectedField = a;
					return;
				} else if(Math.abs(mx - a.wvs[2][0]) < MAX_SNAP_DIST && Math.abs(my - a.wvs[2][1]) < MAX_SNAP_DIST) {
					selectedFieldVertex = a.wvs[2];
					selectedField = a;
					return;
				}
			}
		}
		console.log("start drag");
		this.xDragStart = mx;
		this.yDragStart = my;
	},
	handleActiveDrag(){
		if(this.gameObjectsToMove.length > 0){
			this.isLegalMove = true;
			for(const o of this.gameObjectsToMove){
				if(o.form == CIRCLE_FORM) {
					if(!o.moveTo(mx - o.userData.offsetX, my - o.userData.offsetY, false)) this.isLegalMove = false;
				} else if(o.form == PLANE_FORM) {
					if(!o.setVertex(mx - o.userData.offsetX, my - o.userData.offsetY, o.userData.vertexIndex, false)) this.isLegalMove = false;
				}
			}
			if(this.isLegalMove) canvas.style.cursor = "crosshair";
			else canvas.style.cursor = "no-drop";
		} else if(sandboxMode && selectedField){
			selectedField.setVertex(selectedFieldVertex, mx, my);
		} else if(this.xDragStart){
			dragCanvas(mx - this.xDragStart, my - this.yDragStart);
		}
	},
	handleActiveMouseup(){
		if(this.gameObjectsToMove.length > 0){
			if(!this.isLegalMove){
				for(const o of this.gameObjectsToMove){
					if(o.form == CIRCLE_FORM) o.moveTo(this.objsOriginX - o.userData.offsetX, this.objsOriginY - o.userData.offsetY, false);
					else if(o.form == PLANE_FORM) o.setVertex(this.objsOriginX - o.userData.offsetX, this.objsOriginY - o.userData.offsetY, o.userData.vertexIndex, false);
				}
			} else {
				for(const o of this.gameObjectsToMove){
					if(o.form == PLANE_FORM) {
						for(let i = 0, s = o.userData.joints.length; i < s; ++i){
							let vertexIndex = 0;
							if(o.userData.joints[i].objA == o) vertexIndex = o.userData.joints[i].userData.objAVertexIndex;
							else vertexIndex = o.userData.joints[i].userData.objBVertexIndex;
							let wx = o.wvs[vertexIndex][0];
							let wy = o.wvs[vertexIndex][1];
							debugPoints.push([[wx, wy], blue]);
							let lA = o.userData.joints[i].objA.getLocalPosition(wx, wy);
							let lB = o.userData.joints[i].objB.getLocalPosition(wx, wy);
							o.userData.joints[i].data.localA[0] = lA[0];
							o.userData.joints[i].data.localA[1] = lA[1];
							o.userData.joints[i].data.localB[0] = lB[0];
							o.userData.joints[i].data.localB[1] = lB[1];
						}
						o.setMass(o.l);
					}
					o.userData.xRP = o.p[0];
					o.userData.yRP = o.p[1];
				}
			}
			this.gameObjectsToMove.splice(0, this.gameObjectsToMove.length);
		}
		this.selectedHandle = false;
		this.selectedField = false;
		this.xDragStart = false;
	},
}
btns.push(moveBtn);

var removeObjectBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/removeBtn.png" id="removeBtn" onmousedown="changeActiveBtn(this, removeObjectBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
	handleActivePress(){},
	handleActiveDrag(){},
	handleActiveMouseup(){
		for(let i = gameObjects.length - 1; i > -1; --i){
			if((sandboxMode || (gameObjects[i].group != FIXED_GROUP && gameObjects[i].userData.id != TARGET_WHEEL_ID)) && gameObjects[i].isPointTouching(mx, my) ){
				gameObjects[i].destroy(i);
				return;
			}
		}
	},
}
btns.push(removeObjectBtn);

var gRodBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/gRodBtn.svg" id="gRodBtn" onmousedown="changeActiveBtn(this, gRodBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv],
	handleActivePress(){
		//tempRod = createRod(mx, my, mx, my, DEFAULT_ROD_WIDTH, G_ROD_ID);
		tempRod = createRod(mx, my, mx, my, 0.2, G_ROD_ID);
	},
	handleActiveDrag(){
		tempRod.setVertex(mx, my, 1, false);
	},
	handleActiveMouseup(){
		tempRod = false;
	},
}
btns.push(gRodBtn);

var assemblyFieldBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/assemblyFieldBtn.svg" id="assemblyFieldBtn" onmousedown="changeActiveBtn(this, assemblyFieldBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv],
	handleActivePress(){
		assemblyField = createField(mx - 0.1, my - 0.1, mx + 0.1, my + 0.1, ASSEMBLY_FIELD_ID);
		tempField = assemblyField;
	},
	handleActiveDrag(){
		if(tempField) tempField.setVertex(tempField.wvs[2], mx, my);
		console.log("tempField = " + tempField);
	},
	handleActiveMouseup(){
		tempField = false;
	},
}
btns.push(assemblyFieldBtn);

var goalFieldBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/goalFieldBtn.svg" id="goalFieldBtn" onmousedown="changeActiveBtn(this, goalFieldBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv],
	handleActivePress(){
		goalField = createField(mx - 0.1, my - 0.1, mx + 0.1, my + 0.1, GOAL_FIELD_ID);
		tempField = goalField;
	},
	handleActiveDrag(){
		if(tempField) tempField.setVertex(tempField.wvs[2], mx, my);
	},
	handleActiveMouseup(){
		tempField = false;
	},
}
btns.push(goalFieldBtn);

var targetBtn = {
	HTML: '<input class="btn topBtn togglable" draggable="false" type="image" src="assets/images/targetBtn.svg" id="targetBtn" onmousedown="changeActiveBtn(this, targetBtn)"/>',
	parentDivs: [sandboxScene.btnsDiv],
	handleActivePress(){
		tempWheel = createWheel(mx, my, DEFAULT_WHEEL_RADIUS, TARGET_WHEEL_ID);
		if(tempWheel.isPositionLegal()) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveDrag(){
		if(tempWheel.moveTo(mx, my, 0, true)) canvas.style.cursor = "crosshair";
		else canvas.style.cursor = "no-drop";
	},
	handleActiveMouseup(){
		tempWheel.setFinalProperties();
	}
}
btns.push(targetBtn);

var saveLevelBtn = {
	HTML: '<input class="btn topBtn" draggable="false" type="image" src="assets/images/saveLevelBtn.svg" id="saveLevelBtn" onmousedown="floatScene(saveLevelScene)"/>',
	parentDivs: [sandboxScene.btnsDiv],
}
btns.push(saveLevelBtn);

var loadLevelBtn = {
	HTML: '<input class="btn topBtn" draggable="false" type="image" src="assets/images/loadLevelBtn.svg" id="loadLevelBtn" onmousedown="floatScene(loadLevelScene)"/>',
	parentDivs: [sandboxScene.btnsDiv],
}
btns.push(loadLevelBtn);

var backBtn = {
	HTML: '<input class="btn topBtn" draggable="false" type="image" src="assets/images/backBtn.svg" id="backBtn" onmousedown="popScene()"/>',
	parentDivs: [sandboxScene.btnsDiv, assemblyScene.btnsDiv],
}
btns.push(backBtn);

var hiddenDragBtn = {
	HTML: false,
	xDragStart: false,
	yDragStart: false,
	handleActivePress(){
		this.xDragStart = mx;
		this.yDragStart = my;
	},
	handleActiveDrag(){
		if(this.xDragStart){
			dragCanvas(mx - this.xDragStart, my - this.yDragStart);
		}
	},
	handleActiveMouseup(){
		this.xDragStart = false;
	},
}
simulationScene.activeBtn = hiddenDragBtn;


/*
for(const btn of btns){
	if(btn.HTML){
		for(const div of btn.parentDivs){
			div.innerHTML += btn.HTML;
		}
	}
}
*/






this.POMM.set(ptr, O_FORM, def.form);
		this.POMM.set(ptr, O_TYPE, def.type);
		this.POMM.set(ptr, O_GROUP, def.group);
		if(def.staticFriction === undefined) this.POMM.set(ptr, O_US, 0.8);
		else this.POMM.set(ptr, O_US, def.staticFriction);
		if(def.kineticFriction === undefined) this.POMM.set(ptr, O_UK, 0.5);
		else this.POMM.set(ptr, O_UK, def.kineticFriction);
		if(def.linearVelocityResistance === undefined) this.POMM.set(ptr, O_VM, 0.99);
		else this.POMM.set(ptr, O_VM, def.linearVelocityResistance);
		if(def.rotationalVelocityResistance === undefined) this.POMM.set(ptr, O_WM, 0.99);
		else this.POMM.set(ptr, O_WM, def.rotationalVelocityResistance);

		this.POMM.set(ptr, O_VX, 0.0);
		this.POMM.set(ptr, O_VY, 0.0);

		this.POMM.set(ptr, O_W, 0.0);
		this.POMM.set(ptr, O_COS, 0.0);
		this.POMM.set(ptr, O_SIN, 0.0);
		this.POMM.set(ptr, O_O, 0.0);

		if(def.type == this.FIXED_TYPE){
			this.POMM.set(ptr, O_P, 0.0);
			this.POMM.set(ptr, O_M, 0.0);
			this.POMM.set(ptr, O_M_INV, 0.0);
			this.POMM.set(ptr, O_I, 0.0);
			this.POMM.set(ptr, O_I_INV, 0.0);
		}

		if(def.form == this.CIRCLE_FORM) {
			if(def.radius === undefined || def.x === undefined|| def.y === undefined) {
				console.error("Missing radius and/or position (x and y) in PhysicsObject definition of this.CIRCLE_FORM");
			}

			this.POMM.set(ptr, O_TX, def.x);
			this.POMM.set(ptr, O_TY, def.y);
			this.POMM.set(ptr, O_RADIUS, def.radius);
			if(def.type == this.MOVABLE_TYPE) {
				let mass = def.density * Math.PI * def.radius * def.radius;
				// is mass needed or only m_inv?
				this.POMM.set(ptr, O_M, mass);
				this.POMM.set(ptr, O_M_INV, 1.0 / mass);
				// tune?
				this.POMM.set(ptr, O_I, 0.75 * mass * def.radius * def.radius);
				this.POMM.set(ptr, O_I_INV, 1.0 / this.POMM.set(ptr, O_I + si]);
			}
		}
		/*
		 else if(def.form == this.PLANE_FORM) {
			if(def.vertices === undefined || def.vertices.length != 2){
				console.error("Missing vertices or vertices not of length 2 in PhysicsObject def of this.PLANE_FORM");
			}
			if(def.width === undefined){
				console.error("Missing width in PhysicsObject definition of this.PLANE_FORM");
			}
			if(def.vertices[0][0] == def.vertices[1][0] && def.vertices[0][1] == def.vertices[1][1]){
				def.vertices[1][0] = def.vertices[0][0] + this.MIN_PLANE_LEN;
			}
			this.POMM.set(ptr, O_TX, (def.vertices[0][0] + def.vertices[1][0]) * 0.5);
			this.POMM.set(ptr, O_TY, (def.vertices[0][1] + def.vertices[1][1]) * 0.5);
			let dx = def.vertices[1][0] - def.vertices[0][0];
			let dy = def.vertices[1][1] - def.vertices[0][1];
			this.POMM.set(ptr, O_L,  Math.sqrt(dx * dx + dy * dy));
			this.POMM.set(ptr, O_L_INV,  1.0 / this.M[O_L + si]);
			this.POMM.set(ptr, O_L0X, def.vertices[0][0] - this.M[O_TX + si]);
			this.POMM.set(ptr, O_L0Y, def.vertices[0][1] - this.M[O_TY + si]);
			this.POMM.set(ptr, O_L1X, def.vertices[1][0] - this.M[O_TX + si]);
			this.POMM.set(ptr, O_L1Y, def.vertices[1][1] - this.M[O_TY + si]);
			this.POMM.set(ptr, O_W0X, def.vertices[0][0]);
			this.POMM.set(ptr, O_W0Y, def.vertices[0][1]);
			this.POMM.set(ptr, O_W1X, def.vertices[1][0]);
			this.POMM.set(ptr, O_W1Y, def.vertices[1][1]);
			this.POMM.set(ptr, O_UX, dx * this.M[O_L_INV + si]);
			this.POMM.set(ptr, O_UY, dy * this.M[O_L_INV + si]);
			this.POMM.set(ptr, O_HALF_WIDTH, def.width * 0.5);
			if(def.type == this.MOVABLE_TYPE) {
				let mass = def.density * def.width * this.M[O_L + si];
				this.POMM.set(ptr, O_M, mass);
				this.POMM.set(ptr, O_M_INV, 1.0 / mass);
				// tune?
				this.POMM.set(ptr, O_I, 0.2 * mass * this.M[O_L + si] * this.M[O_L + si]);
				this.POMM.set(ptr, O_I_INV, 1.0 / this.M[O_I + si]);
			}
		} else if(def.form == this.AABB_FORM){
			if(def.vertices === undefined || def.vertices.length != 2){
				console.error("Missing vertices or vertices not of length 2 in PhysicsObject definition of this.AABB_FORM");
			}
			this.POMM.set(ptr, O_MIN_X, def.vertices[0][0]);
			this.POMM.set(ptr, O_MIN_Y, def.vertices[0][1]);
			this.POMM.set(ptr, O_MAX_X, def.vertices[1][0]);
			this.POMM.set(ptr, O_MAX_Y, def.vertices[1][1]);
		} else {
			console.error("Unhandled form: " + def.form + ".");
		}
		let ufi = this.NUM_PROPERTIES[def.form] + si;
		if(def.userFloats !== undefined){
			for(let i  = 0, len = def.userFloats.length; i < len; ++i, ++ufi){
				//console.log("setting i = " + i);
				this.POMM.set(ptr, ufi] = def.userFloats[i];
			}
		}
		this.M[O_NUM_FLOATS + si] = ufi - si;
		this.podEndIndex = ufi;
		// return id
		for(let i = 0, s = this.podIndicesEnd; i < s; ++i){
			if(this.POD_INDICES[i] == 0) {
				this.POD_INDICES[i] = si;
				return i;
			}
		}
		this.POD_INDICES[this.podIndicesEnd] = si;
		return this.podIndicesEnd++;
		*/













		 /*else if(false && this.M[O_FORM + si] == this.PLANE_FORM){
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

			this.colors[c++] = 0.0;
			this.colors[c++] = 0.75;
			this.colors[c++] = 1.0;
			this.colors[c++] = 0.75;
			this.colors[c++] = 1.0;
			this.colors[c++] = 0.75;

			this.colors[c++] = 1.0;
			this.colors[c++] = 0.75;
			this.colors[c++] = 0.0;
			this.colors[c++] = 0.75;
			this.colors[c++] = 0.0;
			this.colors[c++] = 0.75;
		}
		*/











		this.circlePositions[cp++] = x;
			this.circlePositions[cp++] = y;
			let r = this.PO_SIZES[this.M[O_FORM + si]] + si + H_R;
			this.circleColors[cc++] = this.M[r];
			this.circleColors[cc++] = this.M[r + 1];
			this.circleColors[cc++] = this.M[r + 2];
			this.circleSizes[cs++] = this.M[O_RADIUS + si];
			if(this.M[this.PO_SIZES[this.M[O_FORM + si]] + si + H_IS_JOINABLE]){
				for(let i = 0; i < WHEEL_JOINABLES_LENGTH; ++i){
					this.pointPositions[pp++] = WHEEL_JOINABLES[i][0] * this.M[O_COS + si] - WHEEL_JOINABLES[i][1] * this.M[O_SIN + si] + x;
					this.pointPositions[pp++] = WHEEL_JOINABLES[i][1] * this.M[O_COS + si] + WHEEL_JOINABLES[i][0] * this.M[O_SIN + si] + y;
					this.pointColors.set(this.JOINABLE_COLOR, pc += 3);
					this.pointSizes[ps++] = JOINABLE_RADIUS;
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
			for(let ind = 0, ci = this.PO_SIZES[this.M[O_FORM + si]] + si + H_R; ind < 6; ++ind){
				this.colors[c++] = this.M[ci];
				this.colors[c++] = this.M[ci + 1];
				this.colors[c++] = this.M[ci + 2];
			}
			if(this.M[O_GROUP + si] == FIXED_GROUP){
				this.pointPositions[pp++] = x0;
				this.pointPositions[pp++] = y0;
				this.pointColors.set(color, pc += 3);
				this.pointSizes[ps++] = this.M[O_HALF_WIDTH + si];
				this.pointPositions[pp++] = x1;
				this.pointPositions[pp++] = y1;
				this.pointColors.set(color, pc += 3);
				this.pointSizes[ps++] = this.M[O_HALF_WIDTH + si];
			}
			if(this.M[this.PO_SIZES[this.M[O_FORM + si]] + si + H_IS_JOINABLE]) {
				this.pointPositions[pp++] = x0;
				this.pointPositions[pp++] = y0;
				this.pointColors.set(this.JOINABLE_COLOR, pc += 3);
				this.pointSizes[ps++] = JOINABLE_RADIUS;
				this.pointPositions[pp++] = x1;
				this.pointPositions[pp++] = y1;
				this.pointColors.set(this.JOINABLE_COLOR, pc += 3);
				this.pointSizes[ps++] = JOINABLE_RADIUS;
			}










			/*
			let M = this.M;
			let sx0 = 0;
			let sy0 = 0;
			let px0 = 0;
			let py0 = 0;
			let nx0 = 0;
			let ny0 = 0;
			let dist0 = 10;

			let sx1 = 0;
			let sy1 = 0;
			let px1 = 0;
			let py1 = 0;
			let nx1 = 0;
			let ny1 = 0;
			let dist1 = 10;
			for(let v = O_NUM_VERTICES + 1 + bPtr, len = M[O_NUM_VERTICES + bPtr] * this.V_SIZE + v; v < len; v += this.V_SIZE){
				let dot = (M[V_WX + v] - M[O_W0X + aPtr]) * M[O_UX + aPtr] + (M[V_WY + v] - M[O_W0Y + aPtr]) * M[O_UY + aPtr];
				if(dot < 0) dot = 0;
				else if (dot > M[O_L + aPtr]) dot = M[O_L + aPtr];
				let sx = dot * M[O_UX + aPtr] + M[O_W0X + aPtr];
				let sy = dot * M[O_UY + aPtr] + M[O_W0Y + aPtr];
				let nx = sx - M[V_WX + v];
				let ny = sy - M[V_WY + v];
				let d = nx * nx + ny * ny;
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
						px0 = M[V_WX + v];
						py0 = M[V_WY + v];
					} else {
						dist1 = d;
						nx1 = nx;
						ny1 = ny;
						sx1 = sx;
						sy1 = sy;
						px1 = M[V_WX + v];
						py1 = M[V_WY + v];
					}
				}

				sx = M[O_W0X + aPtr];
				sy = M[O_W0Y + aPtr];
				for(let j = 0; j < 2; ++j, sx = M[O_W1X + aPtr], sy = M[O_W1Y + aPtr]){
					nx = sx - M[V_WX + v];
					ny = sy - M[V_WY + v];
					if(M[V_UX + v] * ny - M[V_UY + v] * nx > 0) continue;
					dot = nx * M[V_UX + v] + ny * M[V_UY + v];
					if(dot < 0 || dot > M[V_L + v]) continue;
					let px = dot * M[V_UX + v] + M[V_WX + v];
					let py = dot * M[V_UY + v] + M[V_WY + v];
					nx = sx - px;
					ny = sy - py;
					d = nx * nx + ny * ny;
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
				nx0, ny0, sx0, sy0, px0, py0, dist0 - M[O_HALF_WIDTH + aPtr],
				nx1, ny1, sx1, sy1, px1, py1, dist1 - M[O_HALF_WIDTH + aPtr]
			];
		
		*/



		
				/*
				let dx = def.vertices[v][0] - def.vertices[0][0];
				let dy = def.vertices[v][1] - def.vertices[0][1];
				let b = Math.sqrt(dx * dx + dy * dy);
				dx /= b;
				dy /= b;
				let dot = (def.vertices[v + 1][0] - def.vertices[0][0]) * dx + (def.vertices[v + 1][1] - def.vertices[0][1]) * dy;
				dx = dx * dot + def.vertices[0][0] - def.vertices[v + 1][0];
				dy = dy * dot + def.vertices[0][1] - def.vertices[v + 1][1];
				let h = Math.sqrt(dx * dx + dy * dy);
				let a = h * b * 0.5;
				area += a;
				let cx = (def.vertices[0][0] + def.vertices[v][0] + def.vertices[v + 1][0]) / 3;
				let cy = (def.vertices[0][1] + def.vertices[v][1] + def.vertices[v + 1][1]) / 3;
				this.M[O_TX + ptr] += cx * a;
				this.M[O_TY + ptr] += cy * a;
				triangleDimensions.push([a, b, h, cx, cy]);
				*/
					/*
				this.M[O_I + ptr] = 0.0;
				for(let i = 0, len = triangleDimensions.length; i < len; ++i){
					let a = triangleDimensions[i][0];
					let b = triangleDimensions[i][1];
					let h = triangleDimensions[i][2];
					let iz = (b*b*b*h - b*b*h*a + b*h*a*a + b*h*h*h) / 36;
					//let i = 0.5 * a * h * h;

					let dx = this.M[O_TX + ptr] - triangleDimensions[i][3];
					let dy = this.M[O_TY + ptr] - triangleDimensions[i][4];
					debugPoints.push([triangleDimensions[i][3], triangleDimensions[i][4]]);
					let d = Math.sqrt(dx * dx + dy * dy);
					this.M[O_I + ptr] += iz + area * d * d;
				}
				this.M[O_I + ptr] *= def.density * 1.5;
				*/