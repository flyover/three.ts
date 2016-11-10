import { Curve } from "../core/Curve";
import { Vector2 } from "../../math/Vector2";
import { CurveUtils } from "../CurveUtils";
import { ShapeUtils } from "../ShapeUtils";
/**************************************************************
 *  Quadratic Bezier curve
 **************************************************************/
export class QuadraticBezierCurve extends Curve<Vector2> {
  v0: Vector2;
  v1: Vector2;
  v2: Vector2;
  constructor(v0: Vector2, v1: Vector2, v2: Vector2) {
    super();
    this.v0 = v0;
    this.v1 = v1;
    this.v2 = v2;
  }
  getPoint(t: number): Vector2 {
    let b2 = ShapeUtils.b2;
    return new Vector2(
      b2(t, this.v0.x, this.v1.x, this.v2.x),
      b2(t, this.v0.y, this.v1.y, this.v2.y)
    );
  }
  getTangent(t: number): Vector2 {
    let tangentQuadraticBezier = CurveUtils.tangentQuadraticBezier;
    return new Vector2(
      tangentQuadraticBezier(t, this.v0.x, this.v1.x, this.v2.x),
      tangentQuadraticBezier(t, this.v0.y, this.v1.y, this.v2.y)
    ).normalize();
  };
}
