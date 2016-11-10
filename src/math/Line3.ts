import { Vector3 } from "./Vector3";
import { Matrix4 } from "./Matrix4";
import { _Math } from "./Math";
/**
 * @author bhouston / http://clara.io
 */
export class Line3 {
  start: Vector3;
  end: Vector3;
  constructor(start = new Vector3(), end = new Vector3()) {
    this.start = start;
    this.end = end;
  }
  set(start: Vector3, end: Vector3): Line3 {
    this.start.copy(start);
    this.end.copy(end);
    return this;
  }
  clone(): Line3 {
    return new (this.constructor as any)().copy(this);
  }
  copy(line: Line3): Line3 {
    this.start.copy(line.start);
    this.end.copy(line.end);
    return this;
  }
  getCenter(result: Vector3 = new Vector3()): Vector3 {
    return result.addVectors(this.start, this.end).multiplyScalar(0.5);
  }
  delta(result: Vector3 = new Vector3()): Vector3 {
    return result.subVectors(this.end, this.start);
  }
  distanceSq(): number {
    return this.start.distanceToSquared(this.end);
  }
  distance(): number {
    return this.start.distanceTo(this.end);
  }
  at(t: number, result: Vector3 = new Vector3()): Vector3 {
    return this.delta(result).multiplyScalar(t).add(this.start);
  }
  private static closestPointToPointParameter_startP = new Vector3();
  private static closestPointToPointParameter_startEnd = new Vector3();
  closestPointToPointParameter(point: Vector3, clampToLine: boolean): number {
    const startP = Line3.closestPointToPointParameter_startP;
    const startEnd = Line3.closestPointToPointParameter_startEnd;
    startP.subVectors(point, this.start);
    startEnd.subVectors(this.end, this.start);
    const startEnd2 = startEnd.dot(startEnd);
    const startEnd_startP = startEnd.dot(startP);
    let t = startEnd_startP / startEnd2;
    if (clampToLine) {
      t = _Math.clamp(t, 0, 1);
    }
    return t;
  }
  closestPointToPoint(point: Vector3, clampToLine: boolean, result: Vector3 = new Vector3()): Vector3 {
    const t = this.closestPointToPointParameter(point, clampToLine);
    return this.delta(result).multiplyScalar(t).add(this.start);
  }
  applyMatrix4(matrix: Matrix4): Line3 {
    this.start.applyMatrix4(matrix);
    this.end.applyMatrix4(matrix);
    return this;
  }
  equals(line: Line3): boolean {
    return line.start.equals(this.start) && line.end.equals(this.end);
  }
  center(result: Vector3): Vector3 {
    console.warn("THREE.Line3: .center() has been renamed to .getCenter().");
    return this.getCenter(result);
  }
}
