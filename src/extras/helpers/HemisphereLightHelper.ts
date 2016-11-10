import { Vector3 } from "../../math/Vector3";
import { Object3D } from "../../core/Object3D";
import { Mesh } from "../../objects/Mesh";
import { ColorsMode } from "../../constants";
import { MeshBasicMaterial } from "../../materials/MeshBasicMaterial";
import { SphereGeometry } from "../../geometries/SphereGeometry";
import { Color } from "../../math/Color";
import { HemisphereLight } from "../../lights/HemisphereLight";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
export class HemisphereLightHelper extends Object3D {
  light: HemisphereLight;
  colors: Color[];
  lightSphere: Mesh;
  constructor(light: any, sphereSize: number) {
    super();
    this.light = light;
    this.light.updateMatrixWorld();
    this.matrix = light.matrixWorld;
    this.matrixAutoUpdate = false;
    this.colors = [ new Color(), new Color() ];
    let geometry = new SphereGeometry(sphereSize, 4, 2);
    geometry.rotateX(- Math.PI / 2);
    for (let i = 0, il = 8; i < il; i ++) {
      geometry.faces[i].color = this.colors[i < 4 ? 0 : 1];
    }
    let material = new MeshBasicMaterial({ vertexColors: ColorsMode.Face, wireframe: true });
    this.lightSphere = new Mesh(geometry, material);
    this.add(this.lightSphere);
    this.update();
  }
  dispose() {
    this.lightSphere.geometry.dispose();
    this.lightSphere.material.dispose();
  }
  update() {
    let vector = new Vector3();
    //return function update() {
      this.colors[0].copy(this.light.color).multiplyScalar(this.light.intensity);
      this.colors[1].copy(this.light.groundColor).multiplyScalar(this.light.intensity);
      this.lightSphere.lookAt(vector.setFromMatrixPosition(this.light.matrixWorld).negate());
      (this.lightSphere.geometry as SphereGeometry).colorsNeedUpdate = true;
    //};
  }
}
