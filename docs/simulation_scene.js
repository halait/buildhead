"use strict";
var isRenderFrame = false;
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
		this.toolbar .style.display = "none";
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

	simulate() {
		if(isSimulating) {
			if(isRenderFrame) {
				pw.render();
			} else {
				if(successPending){
					let success = true;
					for(const t of targets){
						if(!pw.isWithinAABB(goalField.ref, t.ref)) {
							success = false;
							break;
						}
					}
					if(success) {
						successPending = false;
						let nextLevel = assemblyScene.currentLevel + 1;
						successScene.nextLevelBtn.onclick = function() {
							sceneManager.push(menuScene);
							assemblyScene.startLevel(nextLevel);
						};
						menuScene.unlockLevel(nextLevel);
						sceneManager.float(successScene);
					}
				}
				pw.update();
			}
			isRenderFrame = !isRenderFrame;
			requestAnimationFrame(simulationScene.simulate);
		} else {
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
