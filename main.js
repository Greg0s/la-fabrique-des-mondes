import * as THREE from "three";
// Three modules import
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/addons/controls/TransformControls.js";
// External dependencies
import { GUI } from "dat.gui";
// Internal dependencies
import {
  Sponge,
  FitnessLandscape,
  StrangeAttractor,
  SierpinskiTriangle,
} from "/modules";
import { UI, intersectionHandler } from "/utils";

// UI creation
const body = document.querySelector("body");
const ui = new UI();
// TODO: complete UI
const items = [
  {
    name: "Strange Attractor",
    function: createAttractor,
  },
  {
    name: "Menger Sponge",
    function: createMengerSponge,
  },
];

ui.createHeader(body);
ui.createBar(items, body);

// Scene creation
var scene = new THREE.Scene();
// scene.background = new THREE.Color(0xE6E6FA);
// scene.background = new THREE.Color(0xFF69B4); // Couleur rose



var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.z = 3;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.append(renderer.domElement);

// OrbitControls initialization
let orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.1;
orbit.rotateSpeed = 0.5;

// TransformControls
let control = new TransformControls(camera, renderer.domElement);
scene.add(control);

let raycaster;
let INTERSECTED;

control.addEventListener("dragging-changed", function (event) {
  orbit.enabled = !event.value;
});

// Hover handler
const pointer = new THREE.Vector2();

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Scene functions
function init() {
  window.addEventListener("resize", onResize, false);
  renderer.setSize(window.innerWidth, window.innerHeight);

  raycaster = new THREE.Raycaster();
  document.addEventListener("mousemove", onPointerMove);
}

function onResize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Lights
let ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

let pointLight = new THREE.PointLight(0xffff00, 50);
scene.add(pointLight);

// Scene
// Tree
let tree = new THREE.Object3D();

// GUI
const gui = new GUI();

// Add a folder: it is a dropdown button
const cameraPositionFolder = gui.addFolder("Camera");

cameraPositionFolder.add(camera.position, "z", 0, 20);
const treeFolder = gui.addFolder("Tree");

// You can also add folders inside a folder.
const treeRotationFolder = treeFolder.addFolder("Rotation");
treeRotationFolder.add(tree.rotation, "x", 0, Math.PI * 2);
treeRotationFolder.add(tree.rotation, "y", 0, Math.PI * 2);
treeRotationFolder.add(tree.rotation, "z", 0, Math.PI * 2);

// Create an animation loop
const animate = () => {
  // renderer.render(scene, camera);
  requestAnimationFrame(animate);
  render();
};

function render() {
  // add controls to intersected objects
  raycaster.setFromCamera(pointer, camera);
  INTERSECTED = intersectionHandler(scene, control, raycaster);

  // render
  renderer.render(scene, camera);
}

// Add cube for testing
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

function createAttractor() {
  const lorenz = new StrangeAttractor();
  lorenz.instantDraw("lorenz", 10000);
  lorenz.anchor.scale.set(0.05, 0.05, 0.05);
  scene.add(lorenz.anchor);
}

function createMengerSponge() {
  // Add Menger Sponge
  const sponge = new Sponge(control);
  sponge.create(2);
  scene.add(sponge.anchor);
  scene.add(sponge.hitbox.mesh);
}

// Add attractor
let aizawa = new StrangeAttractor();
aizawa.instantDraw("aizawa", 10000);
// scene.add(aizawa.anchor);

// Add fitness landscape
let mountains = new FitnessLandscape();
mountains.geneticAlgorithmWithAdaptiveLandscape(400, 200, 0.1);
mountains.anchor.scale.set(0.1, 0.1, 0.1);
// scene.add(mountains.anchor);

// Add Sierpinski triangle
const triangle = new SierpinskiTriangle();
triangle.generate3dSierpinski();
triangle.anchor.scale.set(0.1, 0.1, 0.1);
triangle.anchor.castShadow = true; // For objects that cast shadows
triangle.anchor.receiveShadow = true; // For objects that receive shadows
triangle.anchor.translateX(-1);
triangle.anchor.translateZ(-1);
triangle.anchor.translateY(-0.5);
// scene.add(triangle.anchor);

init();
animate();
