import { Mesh } from "../../objects/Mesh";
import { MeshBasicMaterial } from "../../materials/MeshBasicMaterial";
import { BoxGeometry } from "../../geometries/BoxGeometry";
import { Box3 } from "../../math/Box3";
import { Object3D } from "../../core/Object3D";
/**
 * @author WestLangley / http://github.com/WestLangley
 */
// a helper to show the world-axis-aligned bounding box for an object
export class BoundingBoxHelper extends Mesh {
  object: Object3D;
  box: Box3;
  constructor(object: Object3D, color: number = 0x888888) {
    super(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: color, wireframe: true }));
    this.object = object;
    this.box = new Box3();
  }
  update(): void {
    this.box.setFromObject(this.object);
    this.box.getSize(this.scale);
    this.box.getCenter(this.position);
  }
}
