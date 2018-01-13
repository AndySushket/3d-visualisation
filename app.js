/**
 * Created by Ellyson on 10/1/2017.
 */
class Visualisation {

	constructor() {
		this.audio = new Audio();
		this.audio.src = "music4.mp3";

		this.renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.sortObjects = false
		this.renderer.shadowMap.enabled = true;
		this.renderer.setClearColor(0xcbc3b8);
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
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
		let texture = new THREE.TextureLoader().load("intothree.png");
		this.scene.background = texture;

		this.initControls();
		// this.initGround();
		this.initAudioObject();
		this.audio.play();
		this.initCubes();
		this.animate();
	}
	initGround(){

		let geometry = new THREE.PlaneGeometry(1000, 1000, 32 );
		let material = new THREE.MeshBasicMaterial( {color: 0xcbc3b8, side: THREE.DoubleSide} );
		let plane = new THREE.Mesh( geometry, material );
		plane.rotation.x = Math.PI/2;
		plane.position.set(70, 0, 70);
		this.scene.add( plane );
	}
	initControls(){
		// this.controls = new THREE.OrbitControls( this.camera );
		this.camera.position.set(156.26, 61.33, 148.04);
		this.camera.rotation.set(-0.48, 0.701, 0.324);
		// this.controls.update();

	}

	initAudioObject(){

		let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		let audioSrc = audioCtx.createMediaElementSource(this.audio);
		this.analyser = audioCtx.createAnalyser();
		let bufferLength = this.analyser.frequencyBinCount;
		this.analyser.fftSize = this.analyser.frequencyBinCount;
		this.analyser.smoothingTimeConstant = 0.90;
		audioSrc.connect(this.analyser);

		this.dataArray = new Uint8Array(bufferLength);
		this.timeByteData = new Uint8Array(bufferLength);
		this.analyser.connect(audioCtx.destination);

	}
	initCubes(){
		let color = new THREE.Color();
		let x = 0, z = 0;
		let deg = Math.PI/this.analyser.frequencyBinCount;
		for(let i = 0;i < this.analyser.frequencyBinCount-2; i++){

			let geometry = new THREE.CubeGeometry(2,2,2);
			let material = new THREE.MeshLambertMaterial({
				color: color
			});
			let mesh = new THREE.Mesh(geometry, material);
			mesh.scale.y = .5;

			mesh.material.color.g *= .5 ;
			mesh.material.color.b = 1 ;
			mesh.material.color.r = 0;

			mesh.userData = color;

			// mesh.position.set(100*Math.sin(2*deg*i), 0, 100*Math.cos(2*deg*i));
			// mesh.rotation.y = 2*deg*i;
			// mesh.rotation.z = Math.PI/2;

			mesh.position.set(x,.5,z);
			this.scene.add(mesh);

			x += 3;

			if(x >= 90){
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
					e.scale.y = zscale/2 ;
					e.position.y = zscale/2;
					e.material.color.g = e.userData.r * e.scale.y*.13 +0.4	;
					// e.material.color.b = 1-e.userData.b * e.scale.y / 30;
				}

				// new TWEEN.Tween(e.scale)
				// 	.to({}, 100)
				// 	.onUpdate(function() {
				// 		e.material.color.r = e.userData.r * e.scale.y / 20;
				// 	}).start();
				// e.scale.set(1,(this.dataArray[e.id - 1] * 1.5 - 250 > 0.1) ? this.dataArray[e.id - 1] * 1.5 - 250 : 0.1,  1);
			}
		});

		// this.light.position.y = this.dataArray[50];
		// TWEEN.update();
		// this.analyser.getByteTimeDomainData(this.dataArray);
		// console.log(this.camera);

		this.renderer.render(this.scene,this.camera);
		requestAnimationFrame(this.animate.bind(this));
	}
}
let visualisation = new Visualisation();