import * as THREE from "three";
let mode = "random"; // toggle mode not implemented
const size = 50; // cell size
const rowLength = 20; // nb of cell per line
const maxGen = rowLength; // nb of lines

class Wolfram {
  constructor() {
    this.settings = {};

    this.generations = [];
    this.currentGen = 0;
    this.ruleNb = 0;
    this.ruleset = [];

    this.anchor = new THREE.Object3D();
    this.planes = [];
  }

  generate(loopNb) {
    this.update();
    this.draw(loopNb);
  }

  update() {
    this.randomRuleset();
    this.updateState();
  }

  updateState() {
    // fill 1st gen
    let generation = this.setInitialState(mode);
    this.generations.push(generation);
  }

  draw(loopNb = maxGen) {
    for (let i = 0; i < loopNb; i++) {
      this.drawAllGen();
      this.calculateNextGen();
    }
  }

  drawAllGen() {
    for (let i = 0; i <= this.currentGen; i++) {
      for (let j = 0; j < rowLength; j++) {
        if (this.generations[i][j] === 1) {
          // draw cell
          let planeGeometry = new THREE.PlaneGeometry(size, size);
          let planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xfae,
            side: THREE.DoubleSide,
          });
          let plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.position.set(j * size, -i * size, 0);
          this.anchor.add(plane);
          this.planes.push(plane);
        }
      }
    }
  }

  calculateNextGen() {
    let nextGeneration = [];
    let generation = this.generations[this.currentGen];

    for (let i = 0; i < generation.length; i++) {
      let left, current, right;

      // Edges handler
      if (i === 0) {
        left = generation[generation.length - 1];
        right = generation[i + 1];
      } else if (i === generation.length - 1) {
        left = generation[i - 1];
        right = generation[0];
      } else {
        left = generation[i - 1];
        right = generation[i + 1];
      }

      current = generation[i];

      nextGeneration[i] = this.applyRule(left, current, right);
    }
    if (this.currentGen < maxGen) this.currentGen++;

    // update current gen
    this.generations[this.currentGen] = nextGeneration;
  }

  setInitialState(mode) {
    let generation = [];
    generation = Array(Math.floor(window.innerWidth / size)).fill(0);

    // set cell center
    if (mode == "centered") {
      generation[Math.floor(generation.length / 2)] = 1;
    } else if (mode == "random") {
      // random line
      for (let i = 0; i < generation.length; i++) {
        if (Math.random() < 0.5) {
          generation[i] = 0;
        } else {
          generation[i] = 1;
        }
      }
    }
    return generation;
  }

  randomRuleset() {
    // generate 8 random bits
    for (let i = 0; i < 8; i++) {
      if (Math.random() < 0.5) {
        this.ruleset[i] = 0;
      } else {
        this.ruleset[i] = 1;
      }
      this.ruleNb += this.ruleset[i] * Math.pow(2, i);
    }
  }

  applyRule(left, current, right) {
    let index = left * 4 + current * 2 + right * 1;
    return this.ruleset[index];
  }
}

export default Wolfram;
