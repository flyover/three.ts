import { Vector3 } from "../../math/Vector3";
import { ShapeUtils } from "../ShapeUtils";
import { Curve } from "../core/Curve";
/**************************************************************
 *  Cubic Bezier 3D curve
 **************************************************************/
export class CubicBezierCurve3 extends Curve<Vector3> {
  v0: Vector3;
  v1: Vector3;
  v2: Vector3;
  v3: Vector3;
  constructor(v0: Vector3, v1: Vector3, v2: Vector3, v3: Vector3) {
    super();
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
  }
  getPoint(t: number): Vector3 {
    let b3 = ShapeUtils.b3;
    return new Vector3(
      b3(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x),
      b3(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y),
      b3(t, this.v0.z, this.v1.z, this.v2.z, this.v3.z)
    );
  }
}
