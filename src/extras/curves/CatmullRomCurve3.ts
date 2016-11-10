import { Vector3 } from "../../math/Vector3";
import { Curve } from "../core/Curve";
/**
 * @author zz85 https://github.com/zz85
 *
 * Centripetal CatmullRom Curve - which is useful for avoiding
 * cusps and self-intersections in non-uniform catmull rom curves.
 * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
 *
 * curve.type accepts centripetal(default), chordal and catmullrom
 * curve.tension is used for catmullrom which defaults to 0.5
 */
export class CatmullRomCurve3 extends Curve<Vector3> {
  type: string;
  points: Vector3[];
  closed: boolean = false;
  tension: number = 0.5;
  constructor(p: Vector3[] = []) {
    super();
    this.points = p;
    this.closed = false;
  }
  getPoint(t: number): Vector3 {
    const tmp: Vector3 = new Vector3();
    const px: CubicPoly = new CubicPoly();
    const py: CubicPoly = new CubicPoly();
    const pz: CubicPoly = new CubicPoly();
    const points: Vector3[] = this.points;
    const l: number = points.length;
    if (l < 2) console.log('duh, you need at least 2 points');
    const point: number = (l - (this.closed ? 0 : 1)) * t;
    let intPoint: number = Math.floor(point);
    let weight: number = point - intPoint;
    if (this.closed) {
      intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / points.length) + 1) * points.length;
    } else if (weight === 0 && intPoint === l - 1) {
      intPoint = l - 2;
      weight = 1;
    }
    let p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3; // 4 points
    if (this.closed || intPoint > 0) {
      p0 = points[(intPoint - 1) % l];
    } else {
      // extrapolate first point
      tmp.subVectors(points[0], points[1]).add(points[0]);
      p0 = tmp;
    }
    p1 = points[intPoint % l];
    p2 = points[(intPoint + 1) % l];
    if (this.closed || intPoint + 2 < l) {
      p3 = points[(intPoint + 2) % l];
    } else {
      // extrapolate last point
      tmp.subVectors(points[l - 1], points[l - 2]).add(points[l - 1]);
      p3 = tmp;
    }
    if (this.type === undefined || this.type === 'centripetal' || this.type === 'chordal') {
      // init Centripetal / Chordal Catmull-Rom
      const pow: number = this.type === 'chordal' ? 0.5 : 0.25;
      let dt0: number = Math.pow(p0.distanceToSquared(p1), pow);
      let dt1: number = Math.pow(p1.distanceToSquared(p2), pow);
      let dt2: number = Math.pow(p2.distanceToSquared(p3), pow);
      // safety check for repeated points
      if (dt1 < 1e-4) dt1 = 1.0;
      if (dt0 < 1e-4) dt0 = dt1;
      if (dt2 < 1e-4) dt2 = dt1;
      px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
      py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
      pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);
    } else if (this.type === 'catmullrom') {
      const tension: number = this.tension;
      px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, tension);
      py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, tension);
      pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, tension);
    }
    const v: Vector3 = new Vector3(
      px.calc(weight),
      py.calc(weight),
      pz.calc(weight)
    );
    return v;
  }
}
/*
Based on an optimized c++ solution in
 - http://stackoverflow.com/questions/9489736/catmull-rom-curve-with-no-cusps-and-no-self-intersections/
 - http://ideone.com/NoEbVM
This CubicPoly class could be used for reusing some variables and calculations,
but for three.js curve use, it could be possible inlined and flatten into a single function call
which can be placed in CurveUtils.
*/
class CubicPoly {
  c0: number;
  c1: number;
  c2: number;
  c3: number;
  /*
   * Compute coefficients for a cubic polynomial
   *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
   * such that
   *   p(0) = x0, p(1) = x1
   *  and
   *   p'(0) = t0, p'(1) = t1.
   */
  init(x0: number, x1: number, t0: number, t1: number): void {
    this.c0 = x0;
    this.c1 = t0;
    this.c2 = - 3 * x0 + 3 * x1 - 2 * t0 - t1;
    this.c3 = 2 * x0 - 2 * x1 + t0 + t1;
  }
  initNonuniformCatmullRom(x0: number, x1: number, x2: number, x3: number, dt0: number, dt1: number, dt2: number): void {
    // compute tangents when parameterized in [t1,t2]
    let t1: number = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
    let t2: number = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;
    // rescale tangents for parametrization in [0,1]
    t1 *= dt1;
    t2 *= dt1;
    // initCubicPoly
    this.init(x1, x2, t1, t2);
  }
  // standard Catmull-Rom spline: interpolate between x1 and x2 with previous/following points x1/x4
  initCatmullRom(x0: number, x1: number, x2: number, x3: number, tension: number): void {
    this.init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
  }
  calc(t: number): number {
    const t2: number = t * t;
    const t3: number = t2 * t;
    return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;
  }
}
