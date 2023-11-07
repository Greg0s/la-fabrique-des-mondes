import * as THREE from "three";

class Hitbox {
  constructor() {
    const hitboxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const hitboxMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });
    this.mesh = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
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
