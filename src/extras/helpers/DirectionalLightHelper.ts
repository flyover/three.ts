import { Vector3 } from "../../math/Vector3";
import { Object3D } from "../../core/Object3D";
import { Line } from "../../objects/Line";
import { Float32Attribute } from "../../core/BufferAttribute";
import { BufferGeometry } from "../../core/BufferGeometry";
import { LineBasicMaterial } from "../../materials/LineBasicMaterial";
import { Light } from "../../lights/Light";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */
export class DirectionalLightHelper extends Object3D {
  light: Light;
  constructor(light: Light, size: number = 1) {
    super();
    this.light = light;
    this.light.updateMatrixWorld();
    this.matrix = light.matrixWorld;
    this.matrixAutoUpdate = false;
    let geometry = new BufferGeometry();
    geometry.addAttribute('position', Float32Attribute([
      - size,   size, 0,
        size,   size, 0,
        size, - size, 0,
      - size, - size, 0,
      - size,   size, 0
    ], 3));
    let material = new LineBasicMaterial({ fog: false });
    this.add(new Line(geometry, material));
    geometry = new BufferGeometry();
    geometry.addAttribute('position', Float32Attribute([0, 0, 0, 0, 0, 1], 3));
    this.add(new Line(geometry, material));
    this.update();
  }
  dispose(): void {
    let lightPlane = this.children[0];
    let targetLine = this.children[1];
    lightPlane.geometry.dispose();
    lightPlane.material.dispose();
    targetLine.geometry.dispose();
    targetLine.material.dispose();
  }
  update(): void {
    let v1 = new Vector3();
    let v2 = new Vector3();
    let v3 = new Vector3();
    //return function update() {
      v1.setFromMatrixPosition(this.light.matrixWorld);
      v2.setFromMatrixPosition(this.light.target.matrixWorld);
      v3.subVectors(v2, v1);
      let lightPlane = this.children[0];
      let targetLine = this.children[1];
      lightPlane.lookAt(v3);
      lightPlane.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
      targetLine.lookAt(v3);
      targetLine.scale.z = v3.length();
    //};
  };
}
