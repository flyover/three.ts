import { Curve } from "./Curve";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Geometry } from "../../core/Geometry";
import { LineCurve } from "../curves/LineCurve";
import { SplineCurve } from "../curves/SplineCurve";
import { EllipseCurve } from "../curves/EllipseCurve";
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 **/
/**************************************************************
 *  Curved Path - a curve path is simply a array of connected
 *  curves, but retains the api of a curve
 **************************************************************/
export class CurvePath {
  curves: Curve<Vector2>[];
  autoClose: boolean;
  needsUpdate: boolean;
  cacheLengths: number[];
  constructor() {
    this.curves = [];
    this.autoClose = false; // Automatically closes the path
  }
  add(curve: Curve<Vector2>): void {
    this.curves.push(curve);
  }
  closePath(): void {
    // Add a line curve if start and end of lines are not connected
    let startPoint = this.curves[0].getPoint(0);
    let endPoint = this.curves[this.curves.length - 1].getPoint(1);
    if (! startPoint.equals(endPoint)) {
      this.curves.push(new LineCurve(endPoint, startPoint));
    }
  }
  // To get accurate point with reference to
  // entire path distance at time t,
  // following has to be done:
  // 1. Length of each sub path have to be known
  // 2. Locate and identify type of curve
  // 3. Get t for the curve
  // 4. Return curve.getPointAt(t')
  getPoint(t: number): Vector2 {
    let d = t * this.getLength();
    let curveLengths = this.getCurveLengths();
    let i = 0;
    // To think about boundaries points.
    while (i < curveLengths.length) {
      if (curveLengths[i] >= d) {
        let diff = curveLengths[i] - d;
        let curve = this.curves[i];
        let segmentLength = curve.getLength();
        let u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;
        return curve.getPointAt(u);
      }
      i ++;
    }
    return null;
    // loop where sum != 0, sum > d , sum+1 <d
  }
  // We cannot use the default THREE.Curve getPoint() with getLength() because in
  // THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
  // getPoint() depends on getLength
  getLength() {
    let lens = this.getCurveLengths();
    return lens[lens.length - 1];
  }
  // cacheLengths must be recalculated.
  updateArcLengths() {
    this.needsUpdate = true;
    this.cacheLengths = null;
    this.getCurveLengths(); // !!!TODO: this.getLengths();
  }
  // Compute lengths and cache them
  // We cannot overwrite getLengths() because UtoT mapping uses it.
  getCurveLengths() {
    // We use cache values if curves and cache array are same length
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length) {
      return this.cacheLengths;
    }
    // Get length of sub-curve
    // Push sums into cached array
    let lengths = [], sums = 0;
    for (let i = 0, l = this.curves.length; i < l; i ++) {
      sums += this.curves[i].getLength();
      lengths.push(sums);
    }
    this.cacheLengths = lengths;
    return lengths;
  }
  getSpacedPoints(divisions: number = 40): Vector2[] {
    let points = [];
    for (let i = 0; i <= divisions; i ++) {
      points.push(this.getPoint(i / divisions));
    }
    if (this.autoClose) {
      points.push(points[0]);
    }
    return points;
  }
  getPoints(divisions: number = 12): Vector2[] {
    let points = [], last;
    for (let i = 0, curves = this.curves; i < curves.length; i ++) {
      let curve = curves[i];
      let resolution = (curve && curve instanceof EllipseCurve) ? divisions * 2
        : (curve && curve instanceof LineCurve) ? 1
        : (curve && curve instanceof SplineCurve) ? divisions * curve.points.length
        : divisions;
      let pts = curve.getPoints(resolution);
      for (let j = 0; j < pts.length; j++) {
        let point = pts[j];
        if (last && last.equals(point)) continue; // ensures no consecutive points are duplicates
        points.push(point);
        last = point;
      }
    }
    if (this.autoClose && points.length > 1 && !points[points.length - 1].equals(points[0])) {
      points.push(points[0]);
    }
    return points;
  }
  /**************************************************************
   *  Create Geometries Helpers
   **************************************************************/
  /// Generate geometry from path points (for Line or Points objects)
  createPointsGeometry(divisions?: number): Geometry {
    let pts = this.getPoints(divisions);
    return this.createGeometry(pts);
  }
  // Generate geometry from equidistant sampling along the path
  createSpacedPointsGeometry(divisions?: number): Geometry {
    let pts = this.getSpacedPoints(divisions);
    return this.createGeometry(pts);
  }
  createGeometry(points: (Vector2 | Vector3)[]): Geometry {
    let geometry = new Geometry();
    for (let i = 0, l = points.length; i < l; i ++) {
      let point = points[i];
      geometry.vertices.push(new Vector3(point.x, point.y, (point as Vector3).z || 0));
    }
    return geometry;
  }
}
