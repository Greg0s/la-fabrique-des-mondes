import * as THREE from "three";
import { faces } from "./sierpinski-triangles-faces.js";

class SierpinskiTriangle {
  constructor() {
    // Constructor for the SierpinskiTriangle class.
    // Initializes settings and anchor for rendering.

    this.settings = {
      depth: 3,
    };

    this.anchor = new THREE.Object3D();
  }

  /**
   * Generate a 3D Sierpinski Triangle using recursion.
   */
  generate3dSierpinski() {
    // Draw all faces of the 3D triangle
    for (let i = 0; i < 6; i++) {
      this.generateSierpinski(faces[i], this.settings.depth);
    }
  }

  /**
   * Recursively generate a Sierpinski Triangle.
   *
   * @param {Float32Array} vertices - The vertices of the triangle.
   * @param {number} depth - The current depth of recursion.
   */
  generateSierpinski(vertices, depth) {
    if (depth === 0) {
      // We arrived at the defined depth, we can draw the triangles
      this.drawVertices(vertices, getRandomColor());
    } else {
      const v0 = [vertices[0], vertices[1], vertices[2]];
      const v1 = [vertices[3], vertices[4], vertices[5]];
      const v2 = [vertices[6], vertices[7], vertices[8]];

      // Calculating child triangles
      const mid1 = midCoord(v0, v1);
      const mid2 = midCoord(v1, v2);
      const mid3 = midCoord(v0, v2);

      const vertice1 = new Float32Array([
        v0[0],
        v0[1],
        v0[2],
        mid1[0],
        mid1[1],
        mid1[2],
        mid3[0],
        mid3[1],
        mid3[2],
      ]);
      const vertice2 = new Float32Array([
        mid1[0],
        mid1[1],
        mid1[2],
        v1[0],
        v1[1],
        v1[2],
        mid2[0],
        mid2[1],
        mid2[2],
      ]);
      const vertice3 = new Float32Array([
        mid3[0],
        mid3[1],
        mid3[2],
        mid2[0],
        mid2[1],
        mid2[2],
        v2[0],
        v2[1],
        v2[2],
      ]);

      // Recursive call
      this.generateSierpinski(vertice1, depth - 1);
      this.generateSierpinski(vertice2, depth - 1);
      this.generateSierpinski(vertice3, depth - 1);
    }
  }

  /**
   * Draw vertices with the specified color.
   *
   * @param {Float32Array} vertices - The vertices to draw.
   * @param {THREE.Color} color - The color to apply to the vertices.
   */
  drawVertices(vertices, color) {
    const geometry = new THREE.BufferGeometry();
    const itemSize = 3; // as a vertex has 3 values
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, itemSize)
    );
    // Calculate normals for the geometry
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({ color: color });
    material.side = THREE.DoubleSide; // to see the mesh from both ways
    const mesh = new THREE.Mesh(geometry, material);

    this.anchor.add(mesh);
  }
}

/**
 * Calculate the mid coordinate between two vertices.
 *
 * @param {Array} v0 - The first vertex.
 * @param {Array} v1 - The second vertex.
 * @returns {Array} - The mid coordinates as [x, y, z].
 */
function midCoord(v0, v1) {
  const midx = v0[0] + 0.5 * (v1[0] - v0[0]);
  const midy = v0[1] + 0.5 * (v1[1] - v0[1]);
  const midz = v0[2] + 0.5 * (v1[2] - v0[2]);

  return [midx, midy, midz];
}

/**
 * Generate a random color.
 *
 * @returns {THREE.Color} - A random color.
 */
function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

export default SierpinskiTriangle;
