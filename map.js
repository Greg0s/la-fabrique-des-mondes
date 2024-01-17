import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let camera, scene, renderer;
let plane;
let pointer,
  raycaster,
  isShiftDown = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;

const objects = [];

/* ADDED PARAMS*/

const params = {
  toggleMode: toggleMode,
};

let mode = "addBlock";

/* END ADDED PARAMS*/

init();
render();

function toggleMode() {
  mode = mode === "addBlock" ? "moveCamera" : "addBlock";
  mode == "addBlock" ? scene.add(rollOverMesh) : scene.remove(rollOverMesh);
  console.log("Mode actuel :", mode);
}

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 800, 1300);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Contrôles dat.GUI
  const gui = new GUI();

  gui.add(params, "toggleMode").name("Toggle Mode");

  // roll-over helpers

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // cubes

  const map = new THREE.TextureLoader().load(
    "textures/square-outline-textured.png"
  );
  map.colorSpace = THREE.SRGBColorSpace;
  cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
  });

  // grid

  const gridHelper = new THREE.GridHelper(1000, 20);
  scene.add(gridHelper);

  //

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(1000, 1000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);

  objects.push(plane);

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060, 3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  document.addEventListener("keyup", onDocumentKeyUp);

  //

  let orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.1;
  orbit.rotateSpeed = 0.5;

  //

  window.addEventListener("resize", onWindowResize);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function onPointerMove(event) {
  if (mode == "addBlock") {
    pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      rollOverMesh.position
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25);

      render();
    }
  }
}

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  if (mode === "addBlock") {
    // Logique d'ajout de blocs
    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      if (isShiftDown) {
        if (intersect.object !== plane) {
          scene.remove(intersect.object);
          objects.splice(objects.indexOf(intersect.object), 1);
        }
      } else {
        const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position
          .divideScalar(50)
          .floor()
          .multiplyScalar(50)
          .addScalar(25);
        scene.add(voxel);
        objects.push(voxel);
      }

      render();
    }
  } else if (mode === "moveCamera") {
    // Logique de déplacement de la caméra
    const deltaX = event.movementX || event.mozMovementX || 0;
    const deltaY = event.movementY || event.mozMovementY || 0;

    console.log("mode mouse");

    // Ajustez les valeurs selon votre besoin
    params.rotationAngle += deltaX * 0.005;

    // updateCamera();
  }
}

function onDocumentKeyDown(event) {
  switch (event.keyCode) {
    case 16:
      isShiftDown = true;
      break;
  }
}

function onDocumentKeyUp(event) {
  switch (event.keyCode) {
    case 16:
      isShiftDown = false;
      break;
  }
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
