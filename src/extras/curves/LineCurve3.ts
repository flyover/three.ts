import { Vector3 } from "../../math/Vector3";
import { Curve } from "../core/Curve";
/**************************************************************
 *  Line3D
 **************************************************************/
export class LineCurve3 extends Curve<Vector3> {
  v1: Vector3;
  v2: Vector3;
  constructor(v1: Vector3, v2: Vector3) {
    super();
    this.v1 = v1;
    this.v2 = v2;
  }
  getPoint(t: number): Vector3 {
    if (t === 1) {
      return this.v2.clone();
    }
    let vector = new Vector3();
    vector.subVectors(this.v2, this.v1); // diff
    vector.multiplyScalar(t);
    vector.add(this.v1);
    return vector;
  }
}
