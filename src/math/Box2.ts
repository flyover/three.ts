import { Vector2 } from "./Vector2";
/**
 * @author bhouston / http://clara.io
 */
export class Box2 {
  min: Vector2;
  max: Vector2;
  constructor(min = new Vector2(+ Infinity, + Infinity), max = new Vector2(- Infinity, - Infinity)) {
    this.min = min;
    this.max = max;
  }
  set(min: Vector2, max: Vector2): Box2 {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }
  setFromPoints(points: Vector2[]): Box2 {
    this.makeEmpty();
    for (let i = 0, il = points.length; i < il; i ++) {
      this.expandByPoint(points[i]);
    }
    return this;
  }
  private static _setFromCenterAndSize_v1 = new Vector2();
  setFromCenterAndSize(center: Vector2, size: Vector2): Box2 {
    const v1 = Box2._setFromCenterAndSize_v1;
    const halfSize = v1.copy(size).multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).add(halfSize);
    return this;
  }
  clone(): Box2 {
    return new (this.constructor as any)().copy(this);
  }
  copy(box: Box2): Box2 {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }
  makeEmpty(): Box2 {
    this.min.x = this.min.y = + Infinity;
    this.max.x = this.max.y = - Infinity;
    return this;
  }
  isEmpty(): boolean {
    // this is a more robust check for empty than (volume <= 0) because volume can get positive with two negative axes
    return (this.max.x < this.min.x) || (this.max.y < this.min.y);
  }
  getCenter(result: Vector2 = new Vector2()): Vector2 {
    return this.isEmpty() ? result.set(0, 0) : result.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(result: Vector2 = new Vector2()): Vector2 {
    return this.isEmpty() ? result.set(0, 0) : result.subVectors(this.max, this.min);
  }
  expandByPoint(point: Vector2): Box2 {
    this.min.min(point);
    this.max.max(point);
    return this;
  }
  expandByVector(vector: Vector2): Box2 {
    this.min.sub(vector);
    this.max.add(vector);
    return this;
  }
  expandByScalar(scalar: number): Box2 {
    this.min.addScalar(- scalar);
    this.max.addScalar(scalar);
    return this;
  }
  containsPoint(point: Vector2): boolean {
    if (point.x < this.min.x || point.x > this.max.x ||
         point.y < this.min.y || point.y > this.max.y) {
      return false;
    }
    return true;
  }
  containsBox(box: Box2): boolean {
    if ((this.min.x <= box.min.x) && (box.max.x <= this.max.x) &&
      (this.min.y <= box.min.y) && (box.max.y <= this.max.y)) {
      return true;
    }
    return false;
  }
  getParameter(point: Vector2, result: Vector2 = new Vector2()): Vector2 {
    // This can potentially have a divide by zero if the box
    // has a size dimension of 0.
    return result.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y)
    );
  }
  intersectsBox(box: Box2): boolean {
    // using 6 splitting planes to rule out intersections.
    if (box.max.x < this.min.x || box.min.x > this.max.x ||
      box.max.y < this.min.y || box.min.y > this.max.y) {
      return false;
    }
    return true;
  }
  clampPoint(point: Vector2, result: Vector2 = new Vector2()): Vector2 {
    return result.copy(point).clamp(this.min, this.max);
  }
  private static _distanceToPoint_v1 = new Vector2();
  distanceToPoint(point: Vector2): number {
    const v1 = Box2._distanceToPoint_v1;
    const clampedPoint = v1.copy(point).clamp(this.min, this.max);
    return clampedPoint.sub(point).length();
  }
  intersect(box: Box2): Box2 {
    this.min.max(box.min);
    this.max.min(box.max);
    return this;
  }
  union(box: Box2): Box2 {
    this.min.min(box.min);
    this.max.max(box.max);
    return this;
  }
  translate(offset: Vector2): Box2 {
    this.min.add(offset);
    this.max.add(offset);
    return this;
  }
  equals(box: Box2): boolean {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }
  empty(): boolean {
    console.warn("THREE.Box2: .empty() has been renamed to .isEmpty().");
    return this.isEmpty();
  }
  center(optionalTarget: Vector2 = new Vector2()): Vector2 {
    console.warn("THREE.Box2: .center() has been renamed to .getCenter().");
    return this.getCenter(optionalTarget);
  }
  size(optionalTarget: Vector2 = new Vector2()): Vector2 {
    console.warn("THREE.Box2: .size() has been renamed to .getSize().");
    return this.getSize(optionalTarget);
  }
  isIntersectionBox(box: Box2): boolean {
    console.warn("THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox().");
    return this.intersectsBox(box);
  }
};
