const intersectionHandler = (scene, control, raycaster) => {
  let INTERSECTED;
  const intersects = raycaster.intersectObjects(scene.children, false);
  // console.log("tableau", scene.children);

  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {
      intersects.forEach((intersect) => {
        const intTemp = intersect.object;
        control.attach(intTemp);
      });
      // if (INTERSECTED)
      // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      // console.log(INTERSECTED);
      INTERSECTED = intersects[0].object;
      // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      // INTERSECTED.material.emissive.setHex(0xff0000);

      // control.attach(INTERSECTED);
    }
  } else {
    // if (INTERSECTED)
    //   INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
    control.detach();
    INTERSECTED = null;
  }

  return INTERSECTED;
};

export default intersectionHandler;
