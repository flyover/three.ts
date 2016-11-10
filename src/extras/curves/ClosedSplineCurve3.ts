import { CatmullRomCurve3 } from "./CatmullRomCurve3";
import { Vector3 } from "../../math/Vector3";
/**************************************************************
 *  Closed Spline 3D curve
 **************************************************************/
export class ClosedSplineCurve3 extends CatmullRomCurve3 {
  constructor(points: Vector3[]) {
    console.warn('THREE.ClosedSplineCurve3 has been deprecated. Please use THREE.CatmullRomCurve3.');
    super(points);
    this.type = 'catmullrom';
    this.closed = true;
  }
}
