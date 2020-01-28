"use strict";
//var isRenderFrame = false;
var successPending = true;
//var dt = 0.0;
//var before = 0.0;
//var acc = 0.0;
//ar counter = 0;
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
	},
	before: 0,
	simulate(now) {
		if(isSimulating) {
			requestAnimationFrame(simulationScene.simulate);
			if(now - simulationScene.before < 32) return;
			simulationScene.before = now;
			//if(isRenderFrame) {
				//pw.render();
			//} else {
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
						localStorage.setItem(nextLevel + "isPlayable", true);
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
				pw.update();
				pw.render();
			//}
			//isRenderFrame = !isRenderFrame;
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
		e.preventDefault();
		scaleCanvas((e.deltaY * 0.001));
	},

	init(){
		addBtn(stopSimulationBtn, this.toolbar, () => {sceneManager.pop()});
	}
}
simulationScene.init();
