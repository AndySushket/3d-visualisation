/**
 * Created by Ellyson on 10/1/2017.
 */
class Water {

	constructor() {
		this.audio = new Audio();
		this.audio.src = "music4.mp3";

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.shadowMap.enabled = true;
		this.renderer.setClearColor(0xcbc3b8);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.getElementById("webgl-container").appendChild(this.renderer.domElement);

		window.addEventListener("resize", this.resize.bind(this));

		this.initScene();

	}
	resize(){
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	initScene(){
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 1, 100000);
		this.scene.add(this.camera);
		this.light = new THREE.DirectionalLight(new THREE.Color("#0xffffff"));
		this.light.position.set(170, 150, 100);
		this.scene.add(this.light);

		this.initControls();
		this.initGround();
		this.initAudioObject();
		this.audio.play();
		this.initCubes();
		this.animate();
	}
	initGround(){

		var geometry = new THREE.PlaneGeometry(320, 320, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xcbc3b8, side: THREE.DoubleSide} );
		var plane = new THREE.Mesh( geometry, material );
		plane.rotation.x = Math.PI/2;
		plane.position.set(70, 0, 70);
		this.scene.add( plane );
	}
	initControls(){
		// this.controls = new THREE.OrbitControls( this.camera );
		this.camera.position.set(171.6, 68.7, 177.1);
		this.camera.rotation.set(-0.473, 0.625, 0.291);
		// this.controls.update();

	}

	initAudioObject(){

		let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		let audioSrc = audioCtx.createMediaElementSource(this.audio);
		this.analyser = audioCtx.createAnalyser();
		let bufferLength = this.analyser.frequencyBinCount;
		this.analyser.fftSize = 1024;
		this.analyser.smoothingTimeConstant = 0.90;
		audioSrc.connect(this.analyser);

		this.dataArray = new Uint8Array(bufferLength);
		this.timeByteData = new Uint8Array(bufferLength)
		this.analyser.connect(audioCtx.destination);

	}
	initCubes(){
		let color = new THREE.Color();
		var x = 0, z = 0;
		for(let i = 0;i < this.analyser.frequencyBinCount; i++){

			let geometry = new THREE.CubeGeometry(2,2,2);
			let material = new THREE.MeshLambertMaterial({
				color: color
			});
			let mesh = new THREE.Mesh(geometry, material);
			mesh.material.color.r *= 0.1;
			mesh.material.color.b = 1 - 1 / 50;
			mesh.material.color.r *= mesh.scale.y;
			mesh.userData = color;
			mesh.position.set(x, 0, z);
			this.scene.add(mesh);
			x += 5;
			if(x >= 130){
				z += 5;
				x = 0
			}

		}

	}

	animate(){
		this.scene.traverse((e) => {
			let data = this.dataArray;
			this.analyser.getByteFrequencyData(this.dataArray);
			this.analyser.getByteTimeDomainData(this.timeByteData);
			if(e instanceof THREE.Mesh && e.geometry.type !== "PlaneGeometry"){

				if (data[e.id-1] !== 0) {
					let zscale = 1 + data[e.id-1] * 0.1;
					e.scale.y = zscale ;
					e.material.color.r = e.userData.r * e.scale.y / 15;
					e.material.color.b = 1-e.userData.r * e.scale.y / 50;
				}
				// new TWEEN.Tween(e.scale)
				// 	.to({}, 100)
				// 	.onUpdate(function() {
				// 		e.material.color.r = e.userData.r * e.scale.y / 20;
				// 	}).start();
				// e.scale.set(1,(this.dataArray[e.id - 1] * 1.5 - 250 > 0.1) ? this.dataArray[e.id - 1] * 1.5 - 250 : 0.1,  1);
			}
		});
		// TWEEN.update();
		// this.analyser.getByteTimeDomainData(this.dataArray);
		// console.log(this.camera);

		this.renderer.render(this.scene,this.camera);
		requestAnimationFrame(this.animate.bind(this));
	}
}
let visualisation = new Water();