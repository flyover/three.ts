import { Vector3 } from "./Vector3";
import { Matrix4 } from "./Matrix4";
import { Sphere } from "./Sphere";
import { Plane } from "./Plane";
import { Object3D } from "../core/Object3D";
import { Geometry } from "../core/Geometry";
import { BufferGeometry } from "../core/BufferGeometry";
import { InterleavedBufferAttribute } from "../core/InterleavedBufferAttribute";
/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 */
export class Box3 {
  min: Vector3;
  max: Vector3;
  readonly isBox3: boolean = true;
  constructor(min = new Vector3(+ Infinity, + Infinity, + Infinity), max = new Vector3(- Infinity, - Infinity, - Infinity)) {
    this.min = min;
    this.max = max;
  }
  set(min: Vector3, max: Vector3): Box3 {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }
  setFromArray(array: number[]): void {
    let minX = + Infinity;
    let minY = + Infinity;
    let minZ = + Infinity;
    let maxX = - Infinity;
    let maxY = - Infinity;
    let maxZ = - Infinity;
    for (let i = 0, l = array.length; i < l; i += 3) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    this.min.set(minX, minY, minZ);
    this.max.set(maxX, maxY, maxZ);
  }
  setFromPoints(points: Vector3[]): Box3 {
    this.makeEmpty();
    for (let i = 0, il = points.length; i < il; i ++) {
      this.expandByPoint(points[i]);
    }
    return this;
  }
  private static _setFromCenterAndSize_v1 = new Vector3();
  setFromCenterAndSize(center: Vector3, size: Vector3): Box3 {
    const v1 = Box3._setFromCenterAndSize_v1;
    const halfSize = v1.copy(size).multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).add(halfSize);
    return this;
  }
  private static _setFromObject_v1 = new Vector3();
  setFromObject(object: Object3D): Box3 {
    // Computes the world-axis-aligned bounding box of an object (including its children),
    // accounting for both the object's, and children's, world transforms
    const v1 = Box3._setFromObject_v1;
    const scope = this;
    object.updateMatrixWorld(true);
    this.makeEmpty();
    object.traverse(function(node: Object3D): void {
      const geometry = node.geometry;
      if (geometry !== undefined) {
        if ((geometry && geometry instanceof Geometry)) {
          const vertices = geometry.vertices;
          for (let i = 0, il = vertices.length; i < il; i ++) {
            v1.copy(vertices[i]);
            v1.applyMatrix4(node.matrixWorld);
            scope.expandByPoint(v1);
          }
        } else if ((geometry && geometry instanceof BufferGeometry)) {
          const attribute = geometry.attributes.position;
          if (attribute !== undefined) {
            let array, offset: number, stride;
            if ((attribute && attribute instanceof InterleavedBufferAttribute)) {
              array = attribute.data.array;
              offset = attribute.offset;
              stride = attribute.data.stride;
            } else {
              array = attribute.array;
              offset = 0;
              stride = 3;
            }
            for (let i = offset, il = array.length; i < il; i += stride) {
              v1.fromArray(array, i);
              v1.applyMatrix4(node.matrixWorld);
              scope.expandByPoint(v1);
            }
          }
        }
      }
    });
    return this;
  }
  clone(): Box3 {
    return new (this.constructor as any)().copy(this);
  }
  copy(box: Box3): Box3 {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }
  makeEmpty(): Box3 {
    this.min.x = this.min.y = this.min.z = + Infinity;
    this.max.x = this.max.y = this.max.z = - Infinity;
    return this;
  }
  isEmpty(): boolean {
    // this is a more robust check for empty than (volume <= 0) because volume can get positive with two negative axes
    return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
  }
  getCenter(result: Vector3 = new Vector3()): Vector3 {
    return this.isEmpty() ? result.set(0, 0, 0) : result.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(result: Vector3 = new Vector3()): Vector3 {
    return this.isEmpty() ? result.set(0, 0, 0) : result.subVectors(this.max, this.min);
  }
  expandByPoint(point: Vector3): Box3 {
    this.min.min(point);
    this.max.max(point);
    return this;
  }
  expandByVector(vector: Vector3): Box3 {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  }
  expandByScalar(scalar: number): Box3 {
    this.min.addScalar(- scalar);
    this.max.addScalar(scalar);
    return this;
  }
  containsPoint(point: Vector3): boolean {
    if (point.x < this.min.x || point.x > this.max.x ||
         point.y < this.min.y || point.y > this.max.y ||
         point.z < this.min.z || point.z > this.max.z) {
      return false;
    }
    return true;
  }
  containsBox(box: Box3): boolean {
    if ((this.min.x <= box.min.x) && (box.max.x <= this.max.x) &&
       (this.min.y <= box.min.y) && (box.max.y <= this.max.y) &&
       (this.min.z <= box.min.z) && (box.max.z <= this.max.z)) {
      return true;
    }
    return false;
  }
  getParameter(point: Vector3, result: Vector3 = new Vector3()): Vector3 {
    // This can potentially have a divide by zero if the box
    // has a size dimension of 0.
    return result.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y),
      (point.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  intersectsBox(box: Box3): boolean {
    // using 6 splitting planes to rule out intersections.
    if (box.max.x < this.min.x || box.min.x > this.max.x ||
         box.max.y < this.min.y || box.min.y > this.max.y ||
         box.max.z < this.min.z || box.min.z > this.max.z) {
      return false;
    }
    return true;
  }
  private static _intersectsSphere_closestPoint = new Vector3();
  intersectsSphere(sphere: Sphere): boolean {
    const closestPoint = Box3._intersectsSphere_closestPoint;
    // Find the point on the AABB closest to the sphere center.
    this.clampPoint(sphere.center, closestPoint);
    // If that point is inside the sphere, the AABB and sphere intersect.
    return closestPoint.distanceToSquared(sphere.center) <= (sphere.radius * sphere.radius);
  }
  intersectsPlane(plane: Plane): boolean {
    // We compute the minimum and maximum dot product values. If those values
    // are on the same side (back or front) of the plane, then there is no intersection.
    let min, max;
    if (plane.normal.x > 0) {
      min = plane.normal.x * this.min.x;
      max = plane.normal.x * this.max.x;
    } else {
      min = plane.normal.x * this.max.x;
      max = plane.normal.x * this.min.x;
    }
    if (plane.normal.y > 0) {
      min += plane.normal.y * this.min.y;
      max += plane.normal.y * this.max.y;
    } else {
      min += plane.normal.y * this.max.y;
      max += plane.normal.y * this.min.y;
    }
    if (plane.normal.z > 0) {
      min += plane.normal.z * this.min.z;
      max += plane.normal.z * this.max.z;
    } else {
      min += plane.normal.z * this.max.z;
      max += plane.normal.z * this.min.z;
    }
    return (min <= plane.constant && max >= plane.constant);
  }
  clampPoint(point: Vector3, result: Vector3 = new Vector3()): Vector3 {
    return result.copy(point).clamp(this.min, this.max);
  }
  private static _distanceToPoint_v1 = new Vector3();
  distanceToPoint(point: Vector3): number {
    const v1 = Box3._distanceToPoint_v1;
    const clampedPoint = v1.copy(point).clamp(this.min, this.max);
    return clampedPoint.sub(point).length();
  }
  private static _getBoundingSphere_v1 = new Vector3();
  getBoundingSphere(result: Sphere = new Sphere()) {
    const v1 = Box3._getBoundingSphere_v1;
    this.getCenter(result.center);
    result.radius = this.getSize(v1).length() * 0.5;
    return result;
  }
  intersect(box: Box3): Box3 {
    this.min.max(box.min);
    this.max.min(box.max);
    // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
    if (this.isEmpty()) this.makeEmpty();
    return this;
  }
  union(box: Box3): Box3 {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  }
  private static _applyMatrix4_points = [
    new Vector3(), new Vector3(), new Vector3(), new Vector3(),
    new Vector3(), new Vector3(), new Vector3(), new Vector3()
  ];
  applyMatrix4(matrix: Matrix4): Box3 {
    // transform of empty box is an empty box.
    if (this.isEmpty()) return this;
    const points = Box3._applyMatrix4_points;
    // NOTE: I am using a binary pattern to specify all 2^3 combinations below
    points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
    points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
    points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
    points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
    points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
    points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
    points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
    points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);  // 111
    this.setFromPoints(points);
    return this;
  }
  translate(offset: Vector3): Box3 {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  }
  equals(box: Box3) {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
  center(optionalTarget: Vector3 = new Vector3()): Vector3 {
    console.warn("THREE.Box3: .center() has been renamed to .getCenter().");
    return this.getCenter(optionalTarget);
  }
  empty(): boolean {
    console.warn("THREE.Box3: .empty() has been renamed to .isEmpty().");
    return this.isEmpty();
  }
  isIntersectionBox(box: Box3): boolean {
    console.warn("THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().");
    return this.intersectsBox(box);
  }
  isIntersectionSphere(sphere: Sphere): boolean {
    console.warn("THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().");
    return this.intersectsSphere(sphere);
  }
  size(optionalTarget: Vector3 = new Vector3()): Vector3 {
    console.warn("THREE.Box3: .size() has been renamed to .getSize().");
    return this.getSize(optionalTarget);
  }
}
