import * as THREE from "three";

/**
 * @returns {THREE.Vector3} a point with x, y, z between -0.5 and 5
 */
function randomPoint() {
  return new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  );
}

/**
 * @returns A copy of the string with the first letter capitalized.
 */
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const api = {
  randomPoint,
  capitalize
};

export default api;
