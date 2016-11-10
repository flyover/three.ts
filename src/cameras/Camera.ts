import { Matrix4 } from "../math/Matrix4";
import { Quaternion } from "../math/Quaternion";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
*/
export class Camera extends Object3D {
  matrixWorldInverse: Matrix4 = new Matrix4();
  projectionMatrix: Matrix4 = new Matrix4();
  // {
  far: number;
  // }
  readonly isCamera: boolean = true;
  constructor() {
    super();
    this.type = 'Camera';
  }
  updateProjectionMatrix(): void {}
  getWorldDirection(result: Vector3 = new Vector3()): Vector3 {
    const quaternion = new Quaternion();
    //return function getWorldDirection(result) {
      this.getWorldQuaternion(quaternion);
      return result.set(0, 0, - 1).applyQuaternion(quaternion);
    //};
  }
  lookAt(vector: Vector3): void {
    // This routine does not support cameras with rotated and/or translated parent(s)
    const m1 = new Matrix4();
    //return function lookAt(vector) {
      m1.lookAt(this.position, vector, this.up);
      this.quaternion.setFromRotationMatrix(m1);
    //};
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  copy(source: this): this {
    super.copy(source);
    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);
    return this;
  }
}
