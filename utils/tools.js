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
  capitalize,
};

export default api;

export function TSPRandomY(pointerX, pointerZ) {
  console.log(pointerX, pointerZ);
  let minY = -500;
  let maxY = 900;

  if (pointerX < 200 && pointerX > -200 && pointerZ < 200 && pointerZ > -200) {
    console.log("center");
    minY = 700;
  }

  return Math.random() * (maxY - minY) + minY;
}

export function TSPRandomXZ(pointer) {
  let min, max;

  if (pointer >= 200) {
    min = 1500;
    max = 3000;
  } else if (pointer <= -200) {
    min = -1500;
    max = -3000;
  } else {
    return 0;
  }

  return Math.random() * (max - min) + min;
}
