import { Matrix4 } from "../math/Matrix4";
import { Mesh } from "../objects/Mesh";
import { Group } from "../objects/Group";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class SceneUtils {
  static createMultiMaterialObject(geometry: any, materials: any): any {
    let group = new Group();
    for (let i = 0, l = materials.length; i < l; i ++) {
      group.add(new Mesh(geometry, materials[i]));
    }
    return group;
  }
  static detach(child: any, parent: any, scene: any): void {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
  }
  static attach(child: any, scene: any, parent: any): void {
    let matrixWorldInverse = new Matrix4();
    matrixWorldInverse.getInverse(parent.matrixWorld);
    child.applyMatrix(matrixWorldInverse);
    scene.remove(child);
    parent.add(child);
  }
}
