import { Box3 } from "./Box3";
import { Vector3 } from "./Vector3";
import { Matrix4 } from "./Matrix4";
import { Plane } from "./Plane";
/**
 * @author bhouston / http://clara.io
 * @author mrdoob / http://mrdoob.com/
 */
export class Sphere {
  center: Vector3;
  radius: number;
  constructor(center: Vector3 = new Vector3(), radius: number = 0) {
    this.center = center;
    this.radius = radius;
  }
  set(center: Vector3, radius: number): Sphere {
    this.center.copy(center);
    this.radius = radius;
    return this;
  }
  private static setFromPoints_box = new Box3();
  setFromPoints(points: Vector3[], optionalCenter?: Vector3): Sphere {
    const box = Sphere.setFromPoints_box;
    const center = this.center;
    if (optionalCenter !== undefined) {
      center.copy(optionalCenter);
    } else {
      box.setFromPoints(points).getCenter(center);
    }
    let maxRadiusSq = 0;
    for (let i = 0, il = points.length; i < il; i ++) {
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
    }
    this.radius = Math.sqrt(maxRadiusSq);
    return this;
  }
  clone(): Sphere {
    return new (this.constructor as any)().copy(this);
  }
  copy(sphere: Sphere): Sphere {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;
    return this;
  }
  empty(): boolean {
    return (this.radius <= 0);
  }
  containsPoint(point: Vector3): boolean {
    return (point.distanceToSquared(this.center) <= (this.radius * this.radius));
  }
  distanceToPoint(point: Vector3): number {
    return (point.distanceTo(this.center) - this.radius);
  }
  intersectsSphere(sphere: Sphere): boolean {
    const radiusSum = this.radius + sphere.radius;
    return sphere.center.distanceToSquared(this.center) <= (radiusSum * radiusSum);
  }
  intersectsBox(box: Box3): boolean {
    return box.intersectsSphere(this);
  }
  intersectsPlane(plane: Plane): boolean {
    // We use the following equation to compute the signed distance from
    // the center of the sphere to the plane.
    //
    // distance = q * n - d
    //
    // If this distance is greater than the radius of the sphere,
    // then there is no intersection.
    return Math.abs(this.center.dot(plane.normal) - plane.constant) <= this.radius;
  }
  clampPoint(point: Vector3, result: Vector3 = new Vector3()): Vector3 {
    const deltaLengthSq = this.center.distanceToSquared(point);
    result.copy(point);
    if (deltaLengthSq > (this.radius * this.radius)) {
      result.sub(this.center).normalize();
      result.multiplyScalar(this.radius).add(this.center);
    }
    return result;
  }
  getBoundingBox(box: Box3 = new Box3()): Box3 {
    box.set(this.center, this.center);
    box.expandByScalar(this.radius);
    return box;
  }
  applyMatrix4(matrix: Matrix4): Sphere {
    this.center.applyMatrix4(matrix);
    this.radius = this.radius * matrix.getMaxScaleOnAxis();
    return this;
  }
  translate(offset: Vector3): Sphere {
    this.center.add(offset);
    return this;
  }
  equals(sphere: Sphere): boolean {
    return sphere.center.equals(this.center) && (sphere.radius === this.radius);
  }
}
