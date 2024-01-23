import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { saveScreenshot, Hitbox } from "/utils";

// MODULES
import {
  Sponge,
  FitnessLandscape,
  StrangeAttractor,
  TSP,
  Sakura,
  Ground,
} from "/modules";
import { getAttractorParams } from "./utils/attractors";

let camera, scene, renderer;
let plane, planeHitboxMesh;
let pointer,
  raycaster = false;

let rollOverMesh, rollOverMaterial;

let eventCounts = 0;

const objects = {
  anchors: [],
  hitbox: [],

  push(o) {
    this.anchors.push(o.anchor);

    if (o.hitbox) {
      this.hitbox.push(o.hitbox.mesh);
    }
  },

  remove(mesh, scene) {
    let i = this.hitbox.findIndex(m => m === mesh);

    if (i !== -1) {
      let removed = this.anchors.splice(i, 1);
      this.hitbox.splice(i, 1);
      Hitbox.removeInstance(mesh);
      scene.remove(removed[0]);
    }
  }
};

/* ADDED PARAMS*/

let mode = "edit";
let debugMode = true;

let selectedObject = "attractor";
let selectedAttractor = "lorenz";

let control;

/* END ADDED PARAMS*/

init();
render();

function toggleMode() {
  mode = mode === "edit" ? "view" : "edit";
  mode == "edit" ? scene.add(rollOverMesh) : scene.remove(rollOverMesh);
}

function toggleDebugMode() {
  debugMode = !debugMode;
  Hitbox.toggleDebug();
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

  // roll-over helpers

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xcf89f2,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // ground

  const ground = new Ground();
  ground.buildGround();
  scene.add(ground.anchor);

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

  let planeHitbox = new Hitbox(geometry);
  planeHitboxMesh = planeHitbox.mesh;
  objects.push({anchor: plane, hitbox: planeHitbox});

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060, 3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  document.addEventListener("keyup", onDocumentKeyUp);

  // Moving camera

  let orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.1;
  orbit.rotateSpeed = 0.5;
  orbit.addEventListener('change', () => {
    eventCounts++;
  });

  // TransformControls

  control = new TransformControls(camera, renderer.domElement);
  scene.add(control);

  // UI listeners

  document.querySelectorAll(".selectObject").forEach((item) => {
    item.addEventListener("click", function () {
      selectedObject = item.value;
    });
  });

  document
    .querySelector(".selectAttractor")
    .addEventListener("change", function (e) {
      selectedAttractor = e.target.value;
    });

  document.querySelector(".selectMode").addEventListener("click", function (e) {
    toggleMode();
    if (mode == "view") e.target.innerHTML = "View mode";
    else if (mode == "edit") e.target.innerHTML = "Edit mode";
  });
  document.querySelector(".debugMode").addEventListener("click", function (e) {
    toggleDebugMode();
    if (debugMode) e.target.innerHTML = "Enabled debug mode";
    else e.target.innerHTML = "Disabled debug mode";
    eventCounts++;
  });

  document.querySelector(".screenshot").addEventListener("click", function () {
    saveScreenshot(renderer);
  });

  //

  window.addEventListener("resize", onWindowResize);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  eventCounts++;
}

function onPointerMove(event) {
  if (mode == "edit") {
    pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects((selectedObject === 'sponge') ? objects.hitbox : [planeHitboxMesh], false);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      rollOverMesh.position
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25);
    }

    eventCounts++;
  }
}

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  if (mode === "edit") {
    const intersects = raycaster.intersectObjects((selectedObject === 'sponge') ? objects.hitbox : [planeHitboxMesh], false);

    // Left click to add
    if (intersects.length > 0) {
      const intersect = intersects[0];

      if (event.button === 0) {
        addObject(intersect);
      } else if (event.button === 2) {
        removeObject(intersect);
      }
    }

    eventCounts++;
  }
}

function removeObject(objectToRemove) {
  // const objectToRemove = interactableObjects.pop(); // take last added object
  console.log(objectToRemove.object);

  if (objectToRemove.object && objectToRemove.object !== planeHitboxMesh) {
    objects.remove(objectToRemove.object, scene);
  }

  eventCounts++;
}

function addObject(intersect) {
  let object;
  let scaleFactor = 50;

  switch (selectedObject) {
    case "sponge":
      object = new Sponge(control);
      object.create(2);
      object.anchor.scale.set(scaleFactor, scaleFactor, scaleFactor);
      object = placeObject(object, intersect, true);
      break;

    case "attractor":
      object = new StrangeAttractor(control);
      const { loopNb, scale } = getAttractorParams(selectedAttractor);
      object.instantDraw(selectedAttractor, loopNb);
      object.anchor.scale.set(scale, scale, scale);
      object = placeObject(object, intersect, true);
      object.anchor.position.y = Math.random() * (500 - 200) + 200;
      object.anchor.rotation.x = Math.random() * Math.PI * 2;
      object.anchor.rotation.y = Math.random() * Math.PI * 2;

      break;

    case "tree":
      object = Sakura(4, control);
      scene.add(object.group);
      scaleFactor = scaleFactor / 2;
      object.anchor.scale.set(scaleFactor, scaleFactor, scaleFactor);
      object = placeObject(object, intersect, false);
      object.anchor.rotation.y = Math.random() * Math.PI * 2;

      break;

    case "fitness-landscape":
      object = new FitnessLandscape(control);
      object.geneticAlgorithmWithAdaptiveLandscape(400, 200, 0.1);
      scaleFactor /= 8.5;
      object.anchor.scale.set(scaleFactor, scaleFactor, scaleFactor);
      object = placeObject(object, intersect, true);
      object.anchor.position.y = 0;
      break;

    case "tsp":
      object = new TSP();
      object.generate();
      object.anchor.position.y = Math.random() * 400 + 500;
      scaleFactor = scaleFactor / 3;
      object.anchor.scale.set(scaleFactor, scaleFactor, scaleFactor);
      break;
  }

  scene.add(object.anchor);
  objects.push(object);

  eventCounts++;
}

function placeObject(object, intersect, isCentered) {
  // If operations are inverted, object can be placed anywhere, not only 1 per square

  object.anchor.position.copy(intersect.point).add(intersect.face.normal);

  if (isCentered) {
    object.anchor.position
      .divideScalar(50)
      .floor()
      .multiplyScalar(50)
      .addScalar(25);
  }

  return object;
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
  if (eventCounts > 0) {
    render();
    eventCounts = 0;
  }
}
