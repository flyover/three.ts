import { Curve } from "../core/Curve";
import { Vector2 } from "../../math/Vector2";
import { CurveUtils } from "../CurveUtils";
/**************************************************************
 *  Spline curve
 **************************************************************/
export class SplineCurve extends Curve<Vector2> {
  points: Vector2[];
  readonly isSplineCurve: boolean = true;
  constructor(points: Vector2[] = [] /* array of Vector2 */) {
    super();
    this.points = points;
  }
  getPoint(t: number): Vector2 {
    let points = this.points;
    let point = (points.length - 1) * t;
    let intPoint = Math.floor(point);
    let weight = point - intPoint;
    let point0 = points[intPoint === 0 ? intPoint : intPoint - 1];
    let point1 = points[intPoint];
    let point2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
    let point3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];
    let interpolate = CurveUtils.interpolate;
    return new Vector2(
      interpolate(point0.x, point1.x, point2.x, point3.x, weight),
      interpolate(point0.y, point1.y, point2.y, point3.y, weight)
    );
  };
}
