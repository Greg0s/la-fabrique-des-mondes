import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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