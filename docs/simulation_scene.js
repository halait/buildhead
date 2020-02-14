"use strict";
var successPending = true;
var simulationScene = {
	start(){
		this.toolbar.style.display = "block";
		isSimulating = true;
		if(sandboxMode) successPending = false;
		else successPending = true;
		requestAnimationFrame(simulationScene.simulate);
	},
	suspend(){
		isSimulating = false;
		this.toolbar.style.display = "none";
	},

	toolbar: document.getElementById("simulationSceneBtnsDiv"),

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
	before: 0,
	simulate(now) {
		if(isSimulating) {
			requestAnimationFrame(simulationScene.simulate);
			let dt = now - simulationScene.before;
			if(dt < 25) return;
			//if(dt > 34) console.log("frame drop"); 
			simulationScene.before = now;
			pw.update();
			pw.render();
				if(successPending){
					let success = true;
					for(let i = 0, len = targets.length; i != len; ++i){
						if(!pw.isWithinAABB(goalField.ref, targets[i].ref)) {
							success = false;
							break;
						}
					}
					if(success) {
						successPending = false;
						let nextLevel = assemblyScene.levelNum + 1;


						// remove
						if(!path) localStorage.setItem(nextLevel + "isPlayable", true);
						menuScene.unlockLevel(nextLevel, true);
						successScene.nextLevelBtn.onclick = () => {
							sceneManager.unfloat();
							sceneManager.pop();
							sceneManager.pop();
							menuScene.levelBtns[nextLevel].onclick();
						}
						sceneManager.float(successScene);
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
	
	handleWheel(e) {
		//e.preventDefault();
		//scaleCanvas((e.deltaY * 0.001));
	},

	init(){
		addBtn(stopSimulationBtn, this.toolbar, () => {sceneManager.pop()});
	}
}
simulationScene.init();
