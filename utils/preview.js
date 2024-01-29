import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
	Sponge,
	FitnessLandscape,
	StrangeAttractor,
	TSP,
	Sakura
} from '../modules';
import { getAttractorParams } from './attractors';
import BoidEnvironment from '../modules/boids';
import tools from './tools';

const content = document.getElementById('content');

/**
 * Creates a \<div\> tag containing a title and an object rotating inside.
 * 
 * @param {string} name : The title
 * @param {THREE.Object3D} object3D : The object showcased
 * @return {THREE.Scene} A scene where 
 */
export function createPreview(name, object3D) {
	const scene = new THREE.Scene();
	scene.name = name;

	// make a list item
	const element = document.createElement('div');
	element.className = 'list-item';

	const sceneElement = document.createElement('div');
	element.appendChild(sceneElement);

	// the element that represents the area we want to render the scene
	scene.userData.element = sceneElement;
	scene.userData.root = element;
	content.appendChild(element);

	const camera = new THREE.PerspectiveCamera(50, 1, 1, 10);
	camera.position.z = 2;
	scene.userData.camera = camera;

	const controls = new OrbitControls(scene.userData.camera, scene.userData.element);
	controls.minDistance = 2;
	controls.maxDistance = 5;
	controls.enablePan = false;
	controls.enableZoom = false;
	scene.userData.controls = controls;

	scene.add(object3D);

	scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444, 3));

	const light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(1, 1, 1);
	scene.add(light);

	return scene;
}

export async function createAllPreviews(canvas, boidMesh) {
	let allPreviewScenes = [];
	let previewScenes = {};
	let previewRenderer;

	const selectableAttractors = [
		'lorenz',
		'rossler',
		'aizawa',
		'arneodo',
		'sprottB',
		'sprottLinzF',
		'halvorsen',
	];

	let scene;
	// Sponge
	let object = new Sponge();
	object.create(2);
	object.anchor.remove(object.hitbox.mesh);
	object.centerPointLight.intensity = 1;
	scene = createPreview('Sponge', object.anchor);
	previewScenes['sponge'] = scene;
	allPreviewScenes.push(scene);

	// Attractors
	previewScenes['attractor'] = {};

	selectableAttractors.forEach((a) => {
		object = new StrangeAttractor();
		const { loopNb, scale } = getAttractorParams(a);
		object.instantDraw(a, loopNb);
		const fixScale = 0.009 * scale;
		object.anchor.scale.set(fixScale, fixScale, fixScale);
		scene = createPreview(`${tools.capitalize(a)} Attractor`, object.anchor);
		previewScenes['attractor'][a] = scene;
		console.log(`Pushed ${scene.name} in attractor ${a}`);
		allPreviewScenes.push(scene);
	});

	// Fitness Landscape
	object = new FitnessLandscape();
	object.geneticAlgorithmWithAdaptiveLandscape(400, 200, 0.1);
	object.anchor.scale.set(1 / 8.5, 1 / 8.5, 1 / 8.5);
	object.anchor.position.set(0, -0.5, 0);
	scene = createPreview('Fitness Landscape', object.anchor);
	previewScenes['fitness-landscape'] = scene;
	allPreviewScenes.push(scene);

	// Trees
	object = Sakura(4);
	object.anchor.scale.set(1 / 5.5, 1 / 5.5, 1 / 5.5);
	object.anchor.position.set(0, -0.7, 0);
	object.light.intensity = 1;
	scene = createPreview('Tree', object.anchor);
	previewScenes['tree'] = scene;
	allPreviewScenes.push(scene);

	// TSP
	object = new TSP();
	object.generate();
	object.anchor.scale.set(1 / 50, 1 / 50, 1 / 50);
	scene = createPreview('TSP', object.anchor);
	previewScenes['tsp'] = scene;
	allPreviewScenes.push(scene);

	// Boids
	object = new BoidEnvironment(boidMesh);
	object.create();
	object.anchor.scale.set(1 / 20, 1 / 20, 1 / 20);
	object.anchor.remove(object.hitbox.mesh);
	let previewBoids = object;
	scene = createPreview('Boids', object.anchor);
	previewScenes['boids'] = scene;
	allPreviewScenes.push(scene);

	previewRenderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true,
	});
	previewRenderer.setPixelRatio(window.devicePixelRatio);
	previewRenderer.setClearColor(0x6041d3, 0);
	previewRenderer.setScissorTest(true);

	return {previewScenes, allPreviewScenes, previewRenderer, previewBoids};
}