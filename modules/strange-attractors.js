import * as THREE from "three";
import { Hitbox } from "../utils";

class StrangeAttractor {
  constructor(control) {
    this.settings = {
      dt: 0.01,
      positions: [],
      colors: [],
    };

    this.control = control;

    this.x = 0.1;
    this.y = 0;
    this.z = 0;

    this.lineGeometry = new THREE.BufferGeometry();
    this.anchor = new THREE.Object3D();

    this.lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);
  }

  /**
   * Function to draw the specified attractor with a given number of loops
   * @param {string} name can be lorenz, rossler, aizawa, arneodo, sprottB, sprottLinzF or halvorsen
   * @param {number} times number of loop to generate the attractor
   */
  instantDraw(name, times) {
    for (let i = 0; i < times; i++) {
      const { dx, dy, dz } = this.calculateAttractor(name);
      this.x += dx;
      this.y += dy;
      this.z += dz;
      this.settings.positions.push(this.x, this.y, this.z);
      this.settings.colors.push(
        this.x / 30 + 0.5,
        this.y / 30 + 0.5,
        this.z / 30 + 0.5
      );
    }

    // Update the line geometry
    this.lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.settings.positions, 3)
    );
    this.lineGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.settings.colors, 3)
    );

    const lineMesh = new THREE.Line(this.lineGeometry, this.lineMaterial);
    this.anchor.add(lineMesh);

    const shape = new THREE.Shape();
    const points = this.lineGeometry.attributes.position.array;
    for (let i = 0; i < points.length; i += 3) {
      shape.lineTo(points[i], points[i + 1]);
    }

    // Extrude the line geometry to create a mesh
    const extrudeSettings = {
      depth: 20, // Set the depth of the extrusion
      bevelEnabled: false,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Create a mesh material
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });

    // Create a mesh
    const mesh = new THREE.Mesh(geometry, material);

    this.anchor.add(mesh);

    // Create hitbox & link to mesh
    this.hitbox = new Hitbox();
    this.hitbox.handler(this.control, this.hitbox.mesh, this.anchor);
    this.anchor.add(this.hitbox.mesh);
  }

  /**
   * Function to calculate attractor values
   * @param {string} name can be lorenz, rossler, aizawa, arneodo, sprottB, sprottLinzF or halvorsen
   * @returns an object composed of three numbers as {dx, dy, dz}
   */
  calculateAttractor(name) {
    let dx, dy, dz;

    if (name == "lorenz") {
      const a = 10,
        b = 28,
        c = 8 / 3;
      dx = a * (this.y - this.x) * this.settings.dt;
      dy = (this.x * (b - this.z) - this.y) * this.settings.dt;
      dz = (this.x * this.y - c * this.z) * this.settings.dt;
    } else if (name == "rossler") {
      const a = 0.2,
        b = 0.2,
        c = 5.7;
      dx = (-this.y - this.z) * 0.015;
      dy = (this.x + a * this.y) * 0.015;
      dz = (b + this.z * (this.x - c)) * 0.015;
    } else if (name == "aizawa") {
      const a = 0.95,
        b = 0.7,
        c = 0.6,
        d = 3.5,
        e = 0.25,
        f = 0.1;
      dx = ((this.z - b) * this.x - d * this.y) * this.settings.dt;
      dy = (d * this.x + (this.z - b) * this.y) * this.settings.dt;
      dz =
        (c +
          a * this.z -
          Math.pow(this.z, 3) / 3 -
          (Math.pow(this.x, 2) + Math.pow(this.y, 2)) * (1 + e * this.z) +
          f * this.z * Math.pow(this.x, 3)) *
        this.settings.dt;
    } else if (name == "arneodo") {
      const a = -5.5,
        b = 3.5,
        c = -1;

      dx = this.y * this.settings.dt;
      dy = this.z * this.settings.dt;
      dz =
        (-a * this.x - b * this.y - this.z + c * Math.pow(this.x, 3)) *
        this.settings.dt;
    } else if (name == "sprottB") {
      const a = 0.4,
        b = 1.2,
        c = 1;

      const dt = 0.015;
      dx = a * this.y * this.z * dt;
      dy = (this.x - b * this.y) * dt;
      dz = (c - this.x * this.y) * dt;
    } else if (name == "sprottLinzF") {
      const a = 0.5;
      const dt = 0.015;
      dx = (this.y + this.z) * dt;
      dy = (-this.x + a * this.y) * dt;
      dz = (Math.pow(this.x, 2) - this.z) * dt;
    } else if (name == "halvorsen") {
      const a = 1.4;
      const dt = 0.005;
      dx = (-a * this.x - 4 * this.y - 4 * this.z - this.y * this.y) * dt;
      dy = (-a * this.y - 4 * this.z - 4 * this.x - this.z * this.z) * dt;
      dz = (-a * this.z - 4 * this.x - 4 * this.y - this.x * this.x) * dt;
    }

    return { dx, dy, dz };
  }
}

export default StrangeAttractor;
