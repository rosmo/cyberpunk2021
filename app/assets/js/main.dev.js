import * as THREE from '../../three.js/build/three.module.js';

import { Sky } from '../../three.js/scene/jsm/objects/Sky.js';
import { VignetteShader } from '../../three.js/scene/jsm/shaders/VignetteShader.js';
import { ShaderPass } from '../../three.js/scene/jsm/postprocessing/ShaderPass.js';
import { EffectComposer } from '../../three.js/scene/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../three.js/scene/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '../../three.js/scene/jsm/postprocessing/GlitchPass.js';

let camera, scene, renderer, mixer, clock;
let composerScene, composer;

let sky, sun;
let glitchPass;
let x = 0, s = 0.4965;

const delta = 0.01;

init();
render();
animate();


var nav = document.getElementById('nav');
var navlinks = nav.getElementsByTagName('a');

function toggleNav() {
  nav.classList.contains('active') ? nav.classList.remove('active') : nav.classList.add('active');
}

document.getElementById('nav-icon').addEventListener('click', function (e) {
	e.preventDefault();
	toggleNav();
  });
  

for (var i = 0; i < navlinks.length; i++) {
  navlinks[i].addEventListener('click', function () {
    toggleNav();
  });
}

function initSky() {

	// Add Sky
	sky = new Sky();
	sky.scale.setScalar( 450000 );
	scene.add( sky );

	sun = new THREE.Vector3();

	/// GUI

	const effectController = {
		turbidity: 10,
		rayleigh: 3,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.7,
		inclination: 0.4965, // elevation / inclination
		azimuth: 0.25, // Facing front,
		exposure: renderer.toneMappingExposure
	};

	function guiUpdate() {

		const uniforms = sky.material.uniforms;
		uniforms[ "turbidity" ].value = effectController.turbidity;
		uniforms[ "rayleigh" ].value = effectController.rayleigh;
		uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
		uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;

		const theta = Math.PI * ( effectController.inclination - 0.5 );
		const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

		sun.x = Math.cos( phi );
		sun.y = Math.sin( phi ) * Math.sin( theta );
		sun.z = Math.sin( phi ) * Math.cos( theta );

		uniforms[ "sunPosition" ].value.copy( sun );

		renderer.toneMappingExposure = effectController.exposure;
		renderer.render( scene, camera );

	}

	/*const gui = new GUI();

	gui.add( effectController, "turbidity", 0.0, 20.0, 0.1 ).onChange( guiUpdate );
	gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiUpdate );
	gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiUpdate );
	gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiUpdate );
	gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiUpdate );
	gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiUpdate );
	gui.add( effectController, "exposure", 0, 1, 0.0001 ).onChange( guiUpdate );*/

	guiUpdate();

}

function moveSun(inclination, azimuth) {
	const uniforms = sky.material.uniforms;

	const theta = Math.PI * ( inclination - 0.5 );
	const phi = 2 * Math.PI * ( azimuth - 0.5 );

	sun.x = Math.cos( phi );
	sun.y = Math.sin( phi ) * Math.sin( theta );
	sun.z = Math.sin( phi ) * Math.cos( theta );
	uniforms[ "sunPosition" ].value.copy( sun );

}

function init() {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.set( 0, 0, 0 );
	camera.rotation.x = 0;
	camera.rotation.y = -0.5;
	camera.rotation.z = 0;

	clock = new THREE.Clock();
	scene = new THREE.Scene();

	/*const helper = new THREE.GridHelper( 10000, 2, 0xffffff, 0xffffff );
	scene.add( helper );*/

	const shaderVignette = VignetteShader;
	const effectVignette = new ShaderPass( shaderVignette );

	effectVignette.uniforms[ "offset" ].value = 0.95;
	effectVignette.uniforms[ "darkness" ].value = 1.6;			
	
	const rtParameters = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: true
	};

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.39;
	document.body.appendChild( renderer.domElement );

	composer = new EffectComposer( renderer, new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, rtParameters ) );
	composer.addPass( new RenderPass( scene, camera ) );
	composer.addPass( effectVignette );

	glitchPass = new GlitchPass();
	composer.addPass( glitchPass );


	scene.add( new THREE.HemisphereLight( 0xffffff, 0x000000, 0.8 ) );
	const dirLight = new THREE.DirectionalLight( 0xffffff, 2 );
	dirLight.position.set( 0, 0, 8 );
	scene.add( dirLight );

	initSky();

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );

	render();
}

function render() {

	//renderer.render( scene, camera );
	//renderer.setViewport( 0, 0, width, height );
	composer.render( delta );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

window.addEventListener("scroll", event => {
	camera.rotation.z = 0;
	camera.rotation.x = (((window.pageYOffset*0.1)/14) * Math.PI / 180);
	camera.rotation.y = (((window.pageYOffset-400)/14) * Math.PI / 180);

	//glitchPass.curF++;
	moveSun(0.4965-(window.pageYOffset/102400), 0.25);
	highlight();
});

function highlight(){
	var scroll = $(window).scrollTop();
	var height = $(window).height();
	
	$("#content ul, #content p").each(function(){
		var pos = $(this).offset().top;
		if (scroll+height >= pos+(window.innerHeight/3)) {
		$(this).addClass("text-active");
		} else {
		$(this).removeClass("text-active");
		} 
	});
	}  