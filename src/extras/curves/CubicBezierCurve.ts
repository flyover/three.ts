import { Curve } from "../core/Curve";
import { Vector2 } from "../../math/Vector2";
import { CurveUtils } from "../CurveUtils";
import { ShapeUtils } from "../ShapeUtils";
/**************************************************************
 *  Cubic Bezier curve
 **************************************************************/
export class CubicBezierCurve extends Curve<Vector2> {
  v0: Vector2;
  v1: Vector2;
  v2: Vector2;
  v3: Vector2;
  constructor(v0: Vector2, v1: Vector2, v2: Vector2, v3: Vector2) {
    super();
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
  }
  getPoint(t: number): Vector2 {
    let b3 = ShapeUtils.b3;
    return new Vector2(
      b3(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x),
      b3(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y)
    );
  }
  getTangent(t: number): Vector2 {
    let tangentCubicBezier = CurveUtils.tangentCubicBezier;
    return new Vector2(
      tangentCubicBezier(t, this.v0.x, this.v1.x, this.v2.x, this.v3.x),
      tangentCubicBezier(t, this.v0.y, this.v1.y, this.v2.y, this.v3.y)
    ).normalize();
  }
}
