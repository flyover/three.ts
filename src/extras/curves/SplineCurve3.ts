import { Vector3 } from "../../math/Vector3";
import { CurveUtils } from "../CurveUtils";
import { Curve } from "../core/Curve";
/**************************************************************
 *  Spline 3D curve
 **************************************************************/
export class SplineCurve3 extends Curve<Vector3> {
  points: Vector3[];
  constructor(points: Vector3[] = [] /* array of Vector3 */) {
    super();
    console.warn('THREE.SplineCurve3 will be deprecated. Please use THREE.CatmullRomCurve3');
    this.points = points;
  }
  getPoint(t: number): Vector3 {
    let points = this.points;
    let point = (points.length - 1) * t;
    let intPoint = Math.floor(point);
    let weight = point - intPoint;
    let point0 = points[intPoint === 0 ? intPoint : intPoint - 1];
    let point1 = points[intPoint];
    let point2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
    let point3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];
    let interpolate = CurveUtils.interpolate;
    return new Vector3(
      interpolate(point0.x, point1.x, point2.x, point3.x, weight),
      interpolate(point0.y, point1.y, point2.y, point3.y, weight),
      interpolate(point0.z, point1.z, point2.z, point3.z, weight)
    );
  }
}
