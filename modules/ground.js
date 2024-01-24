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
    this.addSoils();
    this.addWolframGrass();
    this.addSierpinskiGrass();
  }

  addSoils() {
    const soilThickness = 40;

    this.addSoil(soilThickness, soilColor, -0.5 - soilThickness / 2);
    // sub soil
    this.addSoil(soilThickness * 2.5, grassColor2, -0.5 - soilThickness * 2.25);
    // subsub soil
    this.addSoil(soilThickness * 3.5, grassColor1, -0.5 - soilThickness * 5.25);
  }

  addSoil(thickness, color, posY) {
    const soilWidth = 1000;
    const soilHeight = 1000;

    const soilGeometry = new THREE.BoxGeometry(
      soilWidth,
      thickness,
      soilHeight
    );
    const soilMaterial = new THREE.MeshPhongMaterial({
      color: color,
      opacity: 1,
      side: THREE.DoubleSide,
    });

    const soil = new THREE.Mesh(soilGeometry, soilMaterial);
    soil.position.y = posY;
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
