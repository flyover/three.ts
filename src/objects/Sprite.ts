import { Vector3 } from "../math/Vector3";
import { Object3D } from "../core/Object3D";
import { Material } from "../materials/Material";
import { SpriteMaterial } from "../materials/SpriteMaterial";
import { Raycaster, Intersect } from "../core/Raycaster";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */
export class Sprite extends Object3D {
  readonly isSprite: boolean = true;
  constructor(material: Material = new SpriteMaterial()) {
    super();
    this.type = 'Sprite';
    this.material = material;
  }
  private static raycast_matrixPosition = new Vector3();
  raycast(raycaster: Raycaster, intersects: Intersect[]): Intersect[] {
    let matrixPosition = Sprite.raycast_matrixPosition;
    //return function raycast(raycaster, intersects) {
      matrixPosition.setFromMatrixPosition(this.matrixWorld);
      let distanceSq = raycaster.ray.distanceSqToPoint(matrixPosition);
      let guessSizeSq = this.scale.x * this.scale.y / 4;
      if (distanceSq > guessSizeSq) {
        return intersects;
      }
      intersects.push({
        distance: Math.sqrt(distanceSq),
        point: this.position,
        index: 0,
        face: null,
        faceIndex: 0,
        uv: null,
        object: this
      });
      return intersects;
    //};
  }
  clone(): this {
    return new (this.constructor as any)(this.material).copy(this);
  }
}
