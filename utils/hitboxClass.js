import * as THREE from "three";

const hitboxGeometry = new THREE.BoxGeometry(1, 1, 1);
const defaultMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
});
const debugMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.2,
  color: 0x00FF00
});

class Hitbox {
  static debugState = true;
  static instances = [];

  constructor(geometry = undefined) {
    this.mesh = new THREE.Mesh((geometry) ? geometry : hitboxGeometry, (Hitbox.debugState) ? debugMaterial : defaultMaterial);
    Hitbox.instances.push(this);
  }

  static toggleDebug() {
    Hitbox.debugState = !Hitbox.debugState;
    Hitbox.instances.forEach(i => i.mesh.material = (Hitbox.debugState) ? debugMaterial : defaultMaterial);
  }

  static removeInstance(mesh) {
    Hitbox.instances = Hitbox.instances.filter(i => i.mesh !== mesh);
  }

  handler(control, hitbox, mesh) {
    if (control === undefined) {
      return;
    }

    control.addEventListener("dragging-changed", (event) => {
      if (event.value) {
        control.addEventListener("objectChange", () => {
          mesh.position.copy(hitbox.position);
        });
      }
    });
  }
};

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
