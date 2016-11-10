import { Vector3 } from "../math/Vector3";
import { Object3D } from "../core/Object3D";
import { Raycaster, Intersect } from "../core/Raycaster";
import { Camera } from "../cameras/Camera";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
export class LOD extends Object3D {
  levels: any[];
  constructor() {
    super();
    this.type = 'LOD';
    this.levels = [];
    //Object.defineProperties(this, {
    //  levels: {
    //    enumerable: true,
    //    value: []
    //  }
    //});
  }
  copy(source: this): this {
    super.copy(source, false);
    let levels = source.levels;
    for (let i = 0, l = levels.length; i < l; i ++) {
      let level = levels[i];
      this.addLevel(level.object.clone(), level.distance);
    }
    return this;
  }
  addLevel(object: Object3D, distance: number): void {
    if (distance === undefined) distance = 0;
    distance = Math.abs(distance);
    let levels = this.levels;
    let l;
    for (l = 0; l < levels.length; l ++) {
      if (distance < levels[l].distance) {
        break;
      }
    }
    levels.splice(l, 0, { distance: distance, object: object });
    this.add(object);
  }
  getObjectForDistance(distance: number): Object3D {
    let levels = this.levels;
    let i, l;
    for (i = 1, l = levels.length; i < l; i ++) {
      if (distance < levels[i].distance) {
        break;
      }
    }
    return levels[i - 1].object;
  }
  raycast(raycaster: Raycaster, intersects: Intersect[]): Intersect[] {
    let matrixPosition = new Vector3();
    //return function raycast(raycaster, intersects) {
      matrixPosition.setFromMatrixPosition(this.matrixWorld);
      let distance = raycaster.ray.origin.distanceTo(matrixPosition);
      this.getObjectForDistance(distance).raycast(raycaster, intersects);
      return intersects;
    //};
  }
  update(camera: Camera): void {
    let v1 = new Vector3();
    let v2 = new Vector3();
    //return function update(camera) {
      let levels = this.levels;
      if (levels.length > 1) {
        v1.setFromMatrixPosition(camera.matrixWorld);
        v2.setFromMatrixPosition(this.matrixWorld);
        let distance = v1.distanceTo(v2);
        levels[0].object.visible = true;
        let i, l;
        for (i = 1, l = levels.length; i < l; i ++) {
          if (distance >= levels[i].distance) {
            levels[i - 1].object.visible = false;
            levels[i].object.visible = true;
          } else {
            break;
          }
        }
        for (; i < l; i ++) {
          levels[i].object.visible = false;
        }
      }
    //};
  }
  toJSON(meta: any): any {
    let data = super.toJSON(meta);
    data.object.levels = [];
    let levels = this.levels;
    for (let i = 0, l = levels.length; i < l; i ++) {
      let level = levels[i];
      data.object.levels.push({
        object: level.object.uuid,
        distance: level.distance
      });
    }
    return data;
  }
  get objects(): any[] {
    console.warn("THREE.LOD: .objects has been renamed to .levels.");
    return this.levels;
  }
}
