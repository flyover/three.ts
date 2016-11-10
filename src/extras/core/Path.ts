//import { Shape } from "./Shape";
//import { ShapeUtils } from "../ShapeUtils";
import { Vector2 } from "../../math/Vector2";
import { CurvePath } from "./CurvePath";
import { EllipseCurve } from "../curves/EllipseCurve";
import { SplineCurve } from "../curves/SplineCurve";
import { CubicBezierCurve } from "../curves/CubicBezierCurve";
import { QuadraticBezierCurve } from "../curves/QuadraticBezierCurve";
import { LineCurve } from "../curves/LineCurve";
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 *
 **/
export class Path extends CurvePath {
  currentPoint: Vector2;
  constructor(points?: Vector2[]) {
    super();
    this.currentPoint = new Vector2();
    if (points) {
      this.fromPoints(points);
    }
  }
  fromPoints(vectors: Vector2[]): void {
    this.moveTo(vectors[0].x, vectors[0].y);
    for (let i = 1, l = vectors.length; i < l; i ++) {
      this.lineTo(vectors[i].x, vectors[i].y);
    }
  }
  moveTo(x: number, y: number): void {
    this.currentPoint.set(x, y); // TODO consider referencing vectors instead of copying?
  }
  lineTo(x: number, y: number): void {
    let curve = new LineCurve(this.currentPoint.clone(), new Vector2(x, y));
    this.curves.push(curve);
    this.currentPoint.set(x, y);
  }
  quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): void {
    let curve = new QuadraticBezierCurve(
      this.currentPoint.clone(),
      new Vector2(aCPx, aCPy),
      new Vector2(aX, aY)
    );
    this.curves.push(curve);
    this.currentPoint.set(aX, aY);
  }
  bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number): void {
    let curve = new CubicBezierCurve(
      this.currentPoint.clone(),
      new Vector2(aCP1x, aCP1y),
      new Vector2(aCP2x, aCP2y),
      new Vector2(aX, aY)
    );
    this.curves.push(curve);
    this.currentPoint.set(aX, aY);
  }
  splineThru(pts: Vector2[] /*Array of Vector*/) {
    let npts = [this.currentPoint.clone()].concat(pts);
    let curve = new SplineCurve(npts);
    this.curves.push(curve);
    this.currentPoint.copy(pts[pts.length - 1]);
  }
  arc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void {
    let x0 = this.currentPoint.x;
    let y0 = this.currentPoint.y;
    this.absarc(aX + x0, aY + y0, aRadius,
      aStartAngle, aEndAngle, aClockwise);
  }
  absarc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void {
    this.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);
  }
  ellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation?: number): void {
    let x0 = this.currentPoint.x;
    let y0 = this.currentPoint.y;
    this.absellipse(aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
  }
  absellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation?: number): void {
    let curve = new EllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
    if (this.curves.length > 0) {
      // if a previous curve is present, attempt to join
      let firstPoint = curve.getPoint(0);
      if (! firstPoint.equals(this.currentPoint)) {
        this.lineTo(firstPoint.x, firstPoint.y);
      }
    }
    this.curves.push(curve);
    let lastPoint = curve.getPoint(1);
    this.currentPoint.copy(lastPoint);
  }
}
