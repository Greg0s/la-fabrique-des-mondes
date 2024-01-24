import * as THREE from "three";
// MODULES
import { SierpinskiTriangle, Wolfram } from "/modules";
// CONST
const soilColor = 0x5112b8; // dark purple
const gridColor = 0xffffff; // white
const grassColor1 = 0x660fe3; // lighter purple
const grassColor2 = 0x6e34ea; // even lighter purple

class Ground {
  constructor() {
    this.anchor = new THREE.Object3D();
  }

  buildGround() {
    this.addGrid();
    this.addSoil();
    this.addWolframGrass();
    this.addSierpinskiGrass();
  }

  addSoil() {
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: soilColor,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const soil = new THREE.Mesh(planeGeometry, planeMaterial);
    soil.rotation.x = -Math.PI / 2; // align
    soil.position.y = -0.5; // just under the ground
    this.anchor.add(soil);
  }

  addGrid() {
    this.gridHelper = new THREE.GridHelper(1000, 20);

    const gridMaterial = new THREE.LineBasicMaterial({
      color: gridColor,
      opacity: 0.25,
      transparent: true,
    });

    this.gridHelper.material = gridMaterial;

    this.gridHelper.position.y = 2;
  }

  addSierpinskiGrass() {
    const sierpinski = new SierpinskiTriangle(grassColor1);
    sierpinski.generate2dSierpinski();
    sierpinski.anchor.position.y = 1;
    this.anchor.add(sierpinski.anchor);
  }

  addWolframGrass() {
    const wolfram = new Wolfram();
    wolfram.generate(grassColor1);
    this.anchor.add(wolfram.anchor);
    wolfram.anchor.position.x = -475;
    wolfram.anchor.position.z = 475;
    wolfram.anchor.position.y = 0;

    wolfram.anchor.rotation.x = Math.PI / 2;
  }
}

export default Ground;
