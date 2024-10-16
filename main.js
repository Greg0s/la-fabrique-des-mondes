import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { saveScreenshot, Hitbox } from "/utils";
import { createAllPreviews } from "/utils/preview";

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
import BoidEnvironment from "./modules/boids";
import { TSPRandomXZ, TSPRandomY } from "./utils/tools";
import { firstPopUp } from "./utils";

let camera, mainScene, renderer;
let currentPreviewScene;
let canvas = document.getElementById("c");
let plane, planeHitbox;
let pointer,
  raycaster = false;
let startTime = Date.now();
let directionalLight;
let lastSetLightIntensityTime = 0;

// Preview
let previewScenes, allPreviewScenes, previewRenderer, previewBoids;

let rollOverMesh, rollOverMaterial;
let updatable = [];
let ground;

let eventCounts = 0;

let buttons, card, prev;

const objects = {
  anchors: [],
  hitbox: [],
  spongehitbox: [],

  push(o, isSponge = false) {
    this.anchors.push(o.anchor);

    if (o.hitbox) {
      this.hitbox.push(o.hitbox.mesh);
    }

    if (isSponge) {
      this.spongehitbox.push(o.hitbox.mesh);
    }
  },

  remove(mesh, scene) {
    let i = this.hitbox.findIndex((m) => m === mesh);

    if (i !== -1) {
      let removed = this.anchors.splice(i, 1);
      this.hitbox.splice(i, 1);
      Hitbox.removeInstance(mesh);
      updatable = updatable.filter((a) => a.anchor !== removed[0]);
      scene.remove(removed[0]);
    }

    // For sponge hitbox
    let j = this.spongehitbox.findIndex((m) => m === mesh);

    if (j !== -1) {
      this.spongehitbox.splice(i, 1);
    }
  },

  clearWorld(scene) {
    this.anchors.forEach((a) => scene.remove(a));
    this.hitbox = [];
    Hitbox.instances = [];
    this.push({ anchor: plane, hitbox: planeHitbox });
  },
};

/* ADDED PARAMS*/

let mode = "view";
let debugMode = true;

let selectedObject = "attractor";
let selectedAttractor = "lorenz";

let control;

let continuousFlag = false;
let continuousFrames = 0;

/* CONST */
const boidMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1, 8, 8),
  new THREE.MeshPhongMaterial({
    color: 0xebc373,
    transparent: true,
    opacity: 0.2,
  })
);
boidMesh.add(
  new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 5, 5),
    new THREE.MeshPhongMaterial({
      color: 0x660fe3,
      transparent: true,
      opacity: 0.3,
    })
  )
);
boidMesh.add(new THREE.PointLight(0xebc373, 100, 3));

/* END ADDED PARAMS*/

init();
render();

function toggleMode() {
  mode = mode === "edit" ? "view" : "edit";
  mode == "edit" ? editMode() : viewMode();
}

function editMode() {
  mainScene.add(rollOverMesh);
  mainScene.add(ground.gridHelper);
}

function viewMode() {
  mainScene.remove(rollOverMesh);
  mainScene.remove(ground.gridHelper);
  eventCounts++;
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

  mainScene = new THREE.Scene();
  // scene.background = new THREE.Color(0xf0f0f0);

  //Fond image

  const loader = new THREE.TextureLoader();
  const texture = loader.load("./assets/fond.png", () => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    mainScene.background = texture;
    eventCounts++;
  });

  // roll-over helpers

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xcf89f2,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  mainScene.add(rollOverMesh);

  // ground

  const buildGround = async () => {
    ground = new Ground();
    ground.buildGround();
    mainScene.add(ground.anchor);
    mainScene.add(ground.gridHelper);
    console.log("Ground successfully built.");
  };

  buildGround();

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(1000, 1000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  mainScene.add(plane);

  planeHitbox = new Hitbox(geometry);
  objects.push({ anchor: plane, hitbox: planeHitbox }, true);

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060, 3);
  mainScene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  mainScene.add(directionalLight);

  setLightIntensity();

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
  orbit.addEventListener("change", () => {
    eventCounts++;
  });

  // TransformControls

  control = new TransformControls(camera, renderer.domElement);
  mainScene.add(control);

  // UI listeners

  toggleDebugMode();
  firstPopUp();
  let lastModal = false;
  document
    .querySelector(".popup-content button")
    .addEventListener("click", function () {
      if (lastModal) mode = "edit";
      lastModal = true;
    });

  const setListeners = async () => {
    console.log("Building UI Listeners...");
    const getButtons = async () => {
      buttons = document.querySelectorAll(".selectObject");
      buttons.forEach((item) => {
        item.addEventListener("click", function () {
          selectedObject = item.value;
        });
        console.log(item);
      });
    };
    getButtons().then("Buttons built");

    document
      .querySelector(".selectAttractor")
      .addEventListener("change", function (e) {
        selectedAttractor = e.target.value;
      });

    const setMenuButtons = async () => {
      document.querySelectorAll(".menuButton").forEach((b) => {
        switch (b.classList[0]) {
          case "selectMode":
            b.addEventListener("click", function (e) {
              toggleMode();
              if (mode == "view") {
                e.target.innerHTML = "View mode";
                e.target.style.backgroundColor = "#ebc373";
              } else if (mode == "edit") {
                e.target.innerHTML = "Edit mode";
                e.target.style.backgroundColor = "#cf89f2";
              }
            });
            break;
          case "debugMode":
            b.addEventListener("click", function (e) {
              toggleDebugMode();
              if (debugMode) {
                e.target.innerHTML = "Enabled debug mode";
                e.target.style.backgroundColor = "#cf89f2";
              } else {
                e.target.innerHTML = "Disabled debug mode";
                e.target.style.backgroundColor = "#ebc373";
              }
              eventCounts++;
            });
            break;
          case "clear":
            b.addEventListener("click", function (e) {
              clearWorld();
              continuousFlag = false;
              eventCounts++;
            });
            break;
          case "screenshot":
            b.addEventListener("click", function () {
              saveScreenshot(renderer);
            });
            break;
        }
      });
    };
    setMenuButtons().then(() => console.log("Set menu buttons."));

    window.addEventListener("resize", onWindowResize);

    const setPreview = async () => {
      card = document.querySelector(".card");
      prev = document.querySelector(".prev");
    };
    setPreview().then(() => console.log("Built preview"));
  };
  setListeners().then(() => console.log("Built UI Listeners."));

  setTimeout(async () => {
    let result = await createAllPreviews(canvas, boidMesh);
    previewScenes = result.previewScenes;
    allPreviewScenes = result.allPreviewScenes;
    previewRenderer = result.previewRenderer;
    previewBoids = result.previewBoids;
    console.log("Preview scenes loaded.");
  }, 2000);

  requestAnimationFrame(animate);

  console.log("Ready!");
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

    const intersects = raycaster.intersectObjects(
      selectedObject === "sponge" ? objects.spongehitbox : [planeHitbox.mesh],
      false
    );

    if (intersects.length > 0) {
      const intersect = intersects[0];

      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
      rollOverMesh.position
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25);
      eventCounts++;
    }
  }
}

function clearWorld() {
  objects.clearWorld(mainScene);
}

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  if (mode === "edit") {
    if (event.button === 0) {
      const intersects = raycaster.intersectObjects(
        selectedObject === "sponge" ? objects.spongehitbox : [planeHitbox.mesh],
        false
      );

      // Left click to add
      if (intersects.length > 0) {
        const intersect = intersects[0];

        addObject(intersect);
      }
    } else if (event.button === 2) {
      const intersects = raycaster.intersectObjects(objects.hitbox, false);

      // Left click to add
      if (intersects.length > 0) {
        const intersect = intersects[0];
        removeObject(intersect);
      }
    }
    eventCounts++;
  }
}

function removeObject(objectToRemove) {
  // const objectToRemove = interactableObjects.pop(); // take last added object
  console.log(objectToRemove.object);

  if (objectToRemove.object && objectToRemove.object !== planeHitbox.mesh) {
    objects.remove(objectToRemove.object, mainScene);
  }

  eventCounts++;
}

const sakuraColors = [0xffffff, 0xff6fff, 0xff6fff, 0xf6c94f];

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
      const randomColor =
        sakuraColors[Math.floor(Math.random() * sakuraColors.length)];
      object = Sakura(4, control, randomColor, 0x1b1002);
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
      object.anchor.position.x = TSPRandomXZ(intersect.point.x);
      object.anchor.position.z = TSPRandomXZ(intersect.point.z);
      object.anchor.position.y = TSPRandomY(
        intersect.point.x,
        intersect.point.z
      );
      scaleFactor = scaleFactor / 3;
      object.anchor.scale.set(scaleFactor, scaleFactor, scaleFactor);
      break;

    case "boids":
      object = new BoidEnvironment(boidMesh, control);
      object.create();
      object.anchor.position.y = Math.random() * 400 + 500;
      scaleFactor /= 3;
      object.anchor.scale.set(scaleFactor, scaleFactor, scaleFactor);
      continuousFlag = true;
      updatable.push(object);
      break;
  }

  mainScene.add(object.anchor);
  objects.push(object, selectedObject === "sponge" ? true : false);

  eventCounts++;
}

function placeObject(object, intersect, isCentered) {
  // If operations are inverted, object can be placed anywhere, not only 1 per square

  let finalPosition = intersect.point.add(intersect.face.normal);
  if (isCentered) {
    finalPosition.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
  }
  object.anchor.position.add(finalPosition);

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
  renderer.render(mainScene, camera);
  if (debugMode) console.log(renderer.info.render);
}

function updateSize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    previewRenderer.setSize(width, height, false);
  }
}

function previewRender() {
  if (currentPreviewScene.name === "Boids") {
    previewBoids.update();
    previewBoids.render();
  }
  // Hide other divs
  allPreviewScenes
    .filter((s) => s !== currentPreviewScene)
    .forEach((s) => {
      s.userData.root.style.display = "none";
    });
  currentPreviewScene.userData.root.style.display = "inline";

  updateSize();
  canvas.style.transform = `translateY(${window.scrollY}px)`;

  console.log(`Animating ${currentPreviewScene.name}`);
  animatePV(currentPreviewScene);
}

function setLightIntensity() {
  if (directionalLight) {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000; // convert to seconds

    // Duration of a day in s
    const dayDuration = 60 * 5;
    // Calculate the intensity based on a sinusoidal function
    const intensity = 2 + 1.5 * Math.sin((elapsedTime / dayDuration) * Math.PI);

    // Update the directional light intensity
    directionalLight.intensity = intensity;
    directionalLight.updateMatrixWorld(); // Ajoutez cette ligne
    eventCounts++; // Update the view

    const timeSinceLastExecution = currentTime - lastSetLightIntensityTime;
    if (timeSinceLastExecution >= 2000) {
      lastSetLightIntensityTime = currentTime;
      setTimeout(setLightIntensity, 2000); // Planifie l'exécution après 2 secondes
    }
  }
}

function animate() {
  if (eventCounts > 0 || (continuousFlag && continuousFrames >= 0)) {
    updatable.forEach((u) => {
      for (let i = 0; i <= continuousFrames; i++) {
        u.update();
      }
      u.render();
    });
    render();
    eventCounts = 0;
    continuousFrames = 0;
  } else if (continuousFlag) {
    continuousFrames++;
  }

  if (
    currentPreviewScene &&
    currentPreviewScene.userData.element.display !== "none"
  ) {
    // console.log(currentPreviewScene);
    previewRender();
  }

  requestAnimationFrame(animate);
}

//Changer couleur quand bouton actif
buttons.forEach((button) => {
  button.addEventListener("click", function () {
    selectedObject = this.value;

    // Retirer la classe "active" de tous les boutons
    buttons.forEach((btn) => {
      btn.classList.remove("active");
      // btn.style.backgroundColor = "darkblue";
    });

    // Ajouter la classe "active" au bouton sélectionné
    this.classList.add("active");
  });
});

//Card dynamique pour la légende

const dynamicContentDiv = document.querySelector(".dynamic-content", "prev");
buttons.forEach((button) => {
  button.addEventListener("mouseover", function () {
    const buttonValue = this.value;

    console.log(`Hovering ${buttonValue}`);
    // Mettre à jour le contenu en fonction de la valeur du bouton
    switch (buttonValue) {
      case "sponge":
        dynamicContentDiv.innerHTML =
          "<span class='aspect'>🧽 L'architecte s'est laissé guider par la fascinante géométrie de la Menger Sponge pour concevoir ces magnifiques immeubles, transformant ainsi une source d'inspiration infinie en une réalité architecturale extraordinaire.</span>";
        break;
      case "attractor":
        dynamicContentDiv.innerHTML =
          "<span class='aspect'>🌌 Les attracteurs étranges ont donné naissance à de magnifiques galaxies dans nos ciels étoilés, où les lois de la physique se mêlent à l'art pour créer des constellations mystérieuses et captivantes !</span>";
        break;
      case "fitness-landscape":
        dynamicContentDiv.innerHTML =
          "<span class='aspect'>🏔️ Nos ingénieurs paysagistes ont conçu une 'Fitness Map' innovante qui a transformé nos paysages en de superbes reliefs, créant ainsi des sommets majestueux pour les amateurs d'aventure.</span>";
        break;
      case "tree":
        dynamicContentDiv.innerHTML =
          "<span class='aspect'>🌳🌸 Nos jardiniers ont conçu des L-Systems pour transformer vos écrans en jardins numériques où les pixels fleurissent en branches et fleurs de cerisier japonais.</span>";
        break;
      case "tsp":
        dynamicContentDiv.innerHTML =
          "<span class='aspect'>✨ Les TSP se transforment en constellations ! Transformez vos problèmes de voyageurs de commerce en étoiles scintillantes et illuminez le ciel de votre monde.</span>";
        break;
      case "boids":
        dynamicContentDiv.innerHTML =
          "<span class='aspect'>🚀 Les Boids font les stars ! En les introduisant dans ton monde, tu donnes vie à un univers astral incroyable ! Imaginez vous dans Star Wars, mais avec des boids qui planent plutôt que des vaisseaux intergalactiques…</span>";
        break;
      default:
        dynamicContentDiv.innerHTML = ""; // Effacer le contenu par défaut si aucun bouton n'est survolé
    }

    currentPreviewScene =
      buttonValue === "attractor"
        ? previewScenes[buttonValue][selectedAttractor]
        : previewScenes[buttonValue];

    // Afficher la div si elle est cachée
    card.style.display = "inline-block";
    prev.style.display = "inline-block";
  });
  // Sortie du survol des boutons selectObject
  button.addEventListener("mouseout", function () {
    // Cacher la div lorsque rien n'est survolé
    currentPreviewScene = undefined;
    card.style.display = "none";
    prev.style.display = "none";
  });
});

function animatePV(scene) {
  // so something moves
  scene.children[0].rotation.y = Date.now() * 0.001;

  // get the element that is a place holder for where we want to
  // draw the scene
  const element = scene.userData.element;

  // get its position relative to the page's viewport
  const rect = element.getBoundingClientRect();

  // check if it's offscreen. If so skip it
  if (
    rect.bottom < 0 ||
    rect.top > previewRenderer.domElement.clientHeight ||
    rect.right < 0 ||
    rect.left > previewRenderer.domElement.clientWidth
  ) {
    return; // it's off screen
  }

  // set the viewport
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const left = rect.left;
  const bottom = previewRenderer.domElement.clientHeight - rect.bottom;

  previewRenderer.setViewport(left, bottom, width, height);
  previewRenderer.setScissor(left, bottom, width, height);

  const previewCamera = scene.userData.camera;

  previewRenderer.render(scene, previewCamera);
}
