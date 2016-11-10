import { Curve } from "../core/Curve";
import { Vector2 } from "../../math/Vector2";
/**************************************************************
 *  Ellipse curve
 **************************************************************/
export class EllipseCurve extends Curve<Vector2> {
  aX: number;
  aY: number;
  xRadius: number;
  yRadius: number;
  aStartAngle: number;
  aEndAngle: number;
  aClockwise: boolean;
  aRotation: number;
  readonly isEllipseCurve: boolean = true;
  constructor(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation: number = 0) {
    super();
    this.aX = aX;
    this.aY = aY;
    this.xRadius = xRadius;
    this.yRadius = yRadius;
    this.aStartAngle = aStartAngle;
    this.aEndAngle = aEndAngle;
    this.aClockwise = aClockwise;
    this.aRotation = aRotation;
  }
  getPoint(t: number): Vector2 {
    let twoPi = Math.PI * 2;
    let deltaAngle = this.aEndAngle - this.aStartAngle;
    let samePoints = Math.abs(deltaAngle) < Number.EPSILON;
    // ensures that deltaAngle is 0 .. 2 PI
    while (deltaAngle < 0) deltaAngle += twoPi;
    while (deltaAngle > twoPi) deltaAngle -= twoPi;
    if (deltaAngle < Number.EPSILON) {
      if (samePoints) {
        deltaAngle = 0;
      } else {
        deltaAngle = twoPi;
      }
    }
    if (this.aClockwise === true && ! samePoints) {
      if (deltaAngle === twoPi) {
        deltaAngle = - twoPi;
      } else {
        deltaAngle = deltaAngle - twoPi;
      }
    }
    let angle = this.aStartAngle + t * deltaAngle;
    let x = this.aX + this.xRadius * Math.cos(angle);
    let y = this.aY + this.yRadius * Math.sin(angle);
    if (this.aRotation !== 0) {
      let cos = Math.cos(this.aRotation);
      let sin = Math.sin(this.aRotation);
      let tx = x - this.aX;
      let ty = y - this.aY;
      // Rotate the point about the center of the ellipse.
      x = tx * cos - ty * sin + this.aX;
      y = tx * sin + ty * cos + this.aY;
    }
    return new Vector2(x, y);
  };
}
