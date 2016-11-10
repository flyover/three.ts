import { Curve } from "../core/Curve";
import { Vector2 } from "../../math/Vector2";
/**************************************************************
 *  Line
 **************************************************************/
export class LineCurve extends Curve<Vector2> {
  v1: Vector2;
  v2: Vector2;
  readonly isLineCurve: boolean = true;
  constructor(v1: Vector2, v2: Vector2) {
    super();
    this.v1 = v1;
    this.v2 = v2;
  }
  getPoint(t: number): Vector2 {
    if (t === 1) {
      return this.v2.clone();
    }
    let point = this.v2.clone().sub(this.v1);
    point.multiplyScalar(t).add(this.v1);
    return point;
  };
  // Line curve is linear, so we can overwrite default getPointAt
  getPointAt(u: number): Vector2 {
    return this.getPoint(u);
  }
  getTangent(t: number): Vector2 {
    let tangent = this.v2.clone().sub(this.v1);
    return tangent.normalize();
  }
}
