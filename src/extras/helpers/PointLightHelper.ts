import { Mesh } from "../../objects/Mesh";
import { MeshBasicMaterial } from "../../materials/MeshBasicMaterial";
import { SphereBufferGeometry } from "../../geometries/SphereBufferGeometry";
import { PointLight } from "../../lights/PointLight";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
export class PointLightHelper extends Mesh {
  light: PointLight;
  constructor(light: PointLight, sphereSize: number) {
    light.updateMatrixWorld();
    let geometry = new SphereBufferGeometry(sphereSize, 4, 2);
    let material = new MeshBasicMaterial({ wireframe: true, fog: false });
    material.color.copy(light.color).multiplyScalar(light.intensity);
    super(geometry, material);
    this.light = light;
    this.matrix = this.light.matrixWorld;
    this.matrixAutoUpdate = false;
    /*
    let distanceGeometry = new THREE.IcosahedronGeometry(1, 2);
    let distanceMaterial = new THREE.MeshBasicMaterial({ color: hexColor, fog: false, wireframe: true, opacity: 0.1, transparent: true });
    this.lightSphere = new THREE.Mesh(bulbGeometry, bulbMaterial);
    this.lightDistance = new THREE.Mesh(distanceGeometry, distanceMaterial);
    let d = light.distance;
    if (d === 0.0) {
      this.lightDistance.visible = false;
    } else {
      this.lightDistance.scale.set(d, d, d);
    }
    this.add(this.lightDistance);
    */
  }
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
  update(): void {
    this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
    /*
    let d = this.light.distance;
    if (d === 0.0) {
      this.lightDistance.visible = false;
    } else {
      this.lightDistance.visible = true;
      this.lightDistance.scale.set(d, d, d);
    }
    */
  }
}
