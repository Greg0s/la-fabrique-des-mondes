import * as THREE from "three";

const hitboxGeometry = new THREE.BoxGeometry(1, 1, 1);
const defaultMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
});
const debugMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.4,
  color: 0x00FF00
});

class Hitbox {
  constructor() {
    this.debugState = true;
    this.mesh = new THREE.Mesh(hitboxGeometry, (this.debugState) ? debugMaterial : defaultMaterial);
  }

  toggleDebug() {
    this.debugState = !this.debugState;
    this.mesh.material = (this.debugState) ? debugMaterial : defaultMaterial;
  }

  handler(control, hitbox, mesh) {
    control.addEventListener("dragging-changed", (event) => {
      if (event.value) {
        control.addEventListener("objectChange", () => {
          mesh.position.copy(hitbox.position);
        });
      }
    });
  }
}

// const hitboxHandler = (control, hitbox, mesh) => {
//   control.addEventListener("dragging-changed", (event) => {
//     if (event.value) {
//       control.addEventListener("objectChange", () => {
//         mesh.position.copy(hitbox.position);
//       });
//     }
//   });
// };

export default Hitbox;
