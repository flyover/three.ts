import { Matrix3 } from "./Matrix3";
import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";
import { Line3 } from "./Line3";
import { Box3 } from "./Box3";
import { Sphere } from "./Sphere";
/**
 * @author bhouston / http://clara.io
 */
export class Plane {
  normal: Vector3;
  constant: number;
  constructor(normal: Vector3 = new Vector3(1, 0, 0), constant: number = 0) {
    this.normal = normal;
    this.constant = constant;
  }
  set(normal: Vector3, constant: number): Plane {
    this.normal.copy(normal);
    this.constant = constant;
    return this;
  }
  setComponents(x: number, y: number, z: number, w: number): Plane {
    this.normal.set(x, y, z);
    this.constant = w;
    return this;
  }
  setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): Plane {
    this.normal.copy(normal);
    this.constant = - point.dot(this.normal);  // must be this.normal, not normal, as this.normal is normalized
    return this;
  }
  private static setFromCoplanarPoints_v1 = new Vector3();
  private static setFromCoplanarPoints_v2 = new Vector3();
  setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): Plane {
    const v1 = Plane.setFromCoplanarPoints_v1;
    const v2 = Plane.setFromCoplanarPoints_v2;
    const normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).normalize();
    // Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
    this.setFromNormalAndCoplanarPoint(normal, a);
    return this;
  }
  clone(): Plane {
    return new (this.constructor as any)().copy(this);
  }
  copy(plane: Plane): Plane {
    this.normal.copy(plane.normal);
    this.constant = plane.constant;
    return this;
  }
  normalize(): Plane {
    // Note: will lead to a divide by zero if the plane is invalid.
    const inverseNormalLength = 1.0 / this.normal.length();
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;
    return this;
  }
  negate(): Plane {
    this.constant *= - 1;
    this.normal.negate();
    return this;
  }
  distanceToPoint(point: Vector3): number {
    return this.normal.dot(point) + this.constant;
  }
  distanceToSphere(sphere: Sphere): number {
    return this.distanceToPoint(sphere.center) - sphere.radius;
  }
  projectPoint(point: Vector3, result: Vector3 = new Vector3()): Vector3 {
    return this.orthoPoint(point, result).sub(point).negate();
  }
  orthoPoint(point: Vector3, result: Vector3 = new Vector3()): Vector3 {
    const perpendicularMagnitude = this.distanceToPoint(point);
    return result.copy(this.normal).multiplyScalar(perpendicularMagnitude);
  }
  private static intersectLine_v1 = new Vector3();
  intersectLine(line: Line3, result: Vector3 = new Vector3()) {
    const v1 = Plane.intersectLine_v1;
    const direction = line.delta(v1);
    const denominator = this.normal.dot(direction);
    if (denominator === 0) {
      // line is coplanar, return origin
      if (this.distanceToPoint(line.start) === 0) {
        return result.copy(line.start);
      }
      // Unsure if this is the correct method to handle this case.
      return undefined;
    }
    const t = - (line.start.dot(this.normal) + this.constant) / denominator;
    if (t < 0 || t > 1) {
      return undefined;
    }
    return result.copy(direction).multiplyScalar(t).add(line.start);
  }
  intersectsLine(line: Line3): boolean {
    // Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
    const startSign = this.distanceToPoint(line.start);
    const endSign = this.distanceToPoint(line.end);
    return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
  }
  intersectsBox(box: Box3): boolean {
    return box.intersectsPlane(this);
  }
  intersectsSphere(sphere: Sphere): boolean {
    return sphere.intersectsPlane(this);
  }
  coplanarPoint(result: Vector3 = new Vector3()): Vector3 {
    return result.copy(this.normal).multiplyScalar(- this.constant);
  }
  private static applyMatrix4_v1 = new Vector3();
  private static applyMatrix4_m1 = new Matrix3();
  applyMatrix4(matrix: Matrix4, optionalNormalMatrix?: Matrix3): Plane {
    const v1 = Plane.applyMatrix4_v1;
    const m1 = Plane.applyMatrix4_m1;
    const referencePoint = this.coplanarPoint(v1).applyMatrix4(matrix);
    // transform normal based on theory here:
    // http://www.songho.ca/opengl/gl_normaltransform.html
    const normalMatrix = optionalNormalMatrix || m1.getNormalMatrix(matrix);
    const normal = this.normal.applyMatrix3(normalMatrix).normalize();
    // recalculate constant (like in setFromNormalAndCoplanarPoint)
    this.constant = - referencePoint.dot(normal);
    return this;
  }
  translate(offset: Vector3): Plane {
    this.constant = this.constant - offset.dot(this.normal);
    return this;
  }
  equals(plane: Plane): boolean {
    return plane.normal.equals(this.normal) && (plane.constant === this.constant);
  }
  isIntersectionLine(line: Line3): boolean {
    console.warn("THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine().");
    return this.intersectsLine(line);
  }
}
