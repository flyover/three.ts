import { _Math } from "./Math";
import { Vector2 } from "./Vector2";
import { Matrix3 } from "./Matrix3";
import { Matrix4 } from "./Matrix4";
import { Quaternion } from "./Quaternion";
import { Euler } from "./Euler";
import { Spherical } from "./Spherical";
import { Camera } from "../cameras/Camera";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */
export class Vector3 {
  x: number;
  y: number;
  z: number;
  index: number; // PolyhedronGeometry
  uv: Vector2;
  readonly isVector3: boolean = true;
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  setScalar(scalar: number): Vector3 {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;
    return this;
  }
  setX(x: number): Vector3 {
    this.x = x;
    return this;
  }
  setY(y: number): Vector3 {
    this.y = y;
    return this;
  }
  setZ(z: number): Vector3 {
    this.z = z;
    return this;
  }
  setComponent(index: number, value: number): Vector3 {
    switch (index) {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      case 2: this.z = value; break;
      default: throw new Error('index is out of range: ' + index);
    }
    return this;
  }
  getComponent(index: number): number {
    switch (index) {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: throw new Error('index is out of range: ' + index);
    }
  }
  clone(): Vector3 {
    return new (this.constructor as any)(this.x, this.y, this.z);
  }
  copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  add(v: Vector3, w?: Vector3) {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .add() now only accepts one argument. Use .addVectors(a, b) instead.');
      return this.addVectors(v, w);
    }
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  addScalar(s: number): Vector3 {
    this.x += s;
    this.y += s;
    this.z += s;
    return this;
  }
  addVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  }
  addScaledVector(v: Vector3, s: number): Vector3 {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;
    return this;
  }
  sub(v: Vector3, w?: Vector3): Vector3 {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors(a, b) instead.');
      return this.subVectors(v, w);
    }
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }
  subScalar(s: number): Vector3 {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    return this;
  }
  subVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }
  multiply(v: Vector3, w?: Vector3): Vector3 {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors(a, b) instead.');
      return this.multiplyVectors(v, w);
    }
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }
  multiplyScalar(scalar: number): Vector3 {
    if (isFinite(scalar)) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  }
  multiplyVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;
    return this;
  }
  private static _applyEuler_quaternion = new Quaternion();
  applyEuler(euler: Euler): Vector3 {
    const quaternion = Vector3._applyEuler_quaternion;
    return this.applyQuaternion(quaternion.setFromEuler(euler));
  }
  private static _applyAxisAngle_quaternion = new Quaternion();
  applyAxisAngle(axis: Vector3, angle: number): Vector3 {
    const quaternion = Vector3._applyAxisAngle_quaternion;
    return this.applyQuaternion(quaternion.setFromAxisAngle(axis, angle));
  }
  applyMatrix3(m: Matrix3): Vector3 {
    const x = this.x, y = this.y, z = this.z;
    const e: Float32Array = m.elements;
    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;
    return this;
  }
  applyMatrix4(m: Matrix4): Vector3 {
    // input: THREE.Matrix4 affine matrix
    const x = this.x, y = this.y, z = this.z;
    const e: Float32Array = m.elements;
    this.x = e[0] * x + e[4] * y + e[8]  * z + e[12];
    this.y = e[1] * x + e[5] * y + e[9]  * z + e[13];
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
    return this;
  }
  applyProjection(m: Matrix4): Vector3 {
    // input: THREE.Matrix4 projection matrix
    const x = this.x, y = this.y, z = this.z;
    const e: Float32Array = m.elements;
    const d = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]); // perspective divide
    this.x = (e[0] * x + e[4] * y + e[8]  * z + e[12]) * d;
    this.y = (e[1] * x + e[5] * y + e[9]  * z + e[13]) * d;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * d;
    return this;
  }
  applyQuaternion(q: Quaternion): Vector3 {
    const x = this.x, y = this.y, z = this.z;
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    // calculate quat * vector
    const ix =  qw * x + qy * z - qz * y;
    const iy =  qw * y + qz * x - qx * z;
    const iz =  qw * z + qx * y - qy * x;
    const iw = - qx * x - qy * y - qz * z;
    // calculate result * inverse quat
    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
    return this;
  }
  private static _project_matrix: Matrix4;
  project(camera: Camera): Vector3 {
    const matrix = Vector3._project_matrix = (Vector3._project_matrix || new Matrix4());
    matrix.multiplyMatrices(camera.projectionMatrix, matrix.getInverse(camera.matrixWorld));
    return this.applyProjection(matrix);
  }
  private static _unproject_matrix: Matrix4;
  unproject(camera: Camera): Vector3 {
    const matrix = Vector3._unproject_matrix = (Vector3._unproject_matrix || new Matrix4());
    matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
    return this.applyProjection(matrix);
  }
  transformDirection(m: Matrix4): Vector3 {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction
    const x = this.x, y = this.y, z = this.z;
    const e: Float32Array = m.elements;
    this.x = e[0] * x + e[4] * y + e[8]  * z;
    this.y = e[1] * x + e[5] * y + e[9]  * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  }
  divide(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;
    return this;
  }
  divideScalar(scalar: number): Vector3 {
    return this.multiplyScalar(1 / scalar);
  }
  min(v: Vector3): Vector3 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }
  max(v: Vector3): Vector3 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }
  clamp(min: Vector3, max: Vector3): Vector3 {
    // This function assumes min < max, if this assumption isn't true it will not operate correctly
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  }
  private static _clampScalar_min = new Vector3();
  private static _clampScalar_max = new Vector3();
  clampScalar(minVal: number, maxVal: number): Vector3 {
    const min = Vector3._clampScalar_min, max = Vector3._clampScalar_max;
    min.set(minVal, minVal, minVal);
    max.set(maxVal, maxVal, maxVal);
    return this.clamp(min, max);
  }
  clampLength(min: number, max: number): Vector3 {
    const length = this.length();
    return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
  }
  floor(): Vector3 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }
  ceil(): Vector3 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }
  round(): Vector3 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }
  roundToZero(): Vector3 {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
    return this;
  }
  negate(): Vector3 {
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
    return this;
  }
  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  lengthManhattan(): number {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize(): Vector3 {
    return this.divideScalar(this.length());
  }
  setLength(length: number): Vector3 {
    return this.multiplyScalar(length / this.length());
  }
  lerp(v: Vector3, alpha: number): Vector3 {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }
  lerpVectors(v1: Vector3, v2: Vector3, alpha: number): Vector3 {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }
  cross(v: Vector3, w?: Vector3): Vector3 {
    if (w !== undefined) {
      console.warn('THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors(a, b) instead.');
      return this.crossVectors(v, w);
    }
    const x = this.x, y = this.y, z = this.z;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }
  crossVectors(a: Vector3, b: Vector3): Vector3 {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }
  projectOnVector(vector: Vector3): Vector3 {
    const scalar = vector.dot(this) / vector.lengthSq();
    return this.copy(vector).multiplyScalar(scalar);
  }
  private static _projectOnPlane_v1 = new Vector3();
  projectOnPlane(planeNormal: Vector3): Vector3 {
    const v1 = Vector3._projectOnPlane_v1;
    v1.copy(this).projectOnVector(planeNormal);
    return this.sub(v1);
  }
  private static _reflect_v1 = new Vector3();
  reflect(normal: Vector3): Vector3 {
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length
    const v1 = Vector3._reflect_v1;
    return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }
  angleTo(v: Vector3): number {
    const theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));
    // clamp, to handle numerical problems
    return Math.acos(_Math.clamp(theta, - 1, 1));
  }
  distanceTo(v: Vector3): number {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v: Vector3): number {
    const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }
  distanceToManhattan(v: Vector3): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }
  setFromSpherical(s: Spherical): Vector3 {
    const sinPhiRadius = Math.sin(s.phi) * s.radius;
    this.x = sinPhiRadius * Math.sin(s.theta);
    this.y = Math.cos(s.phi) * s.radius;
    this.z = sinPhiRadius * Math.cos(s.theta);
    return this;
  }
  setFromMatrixPosition(m: Matrix4): Vector3 {
    return this.setFromMatrixColumn(m, 3);
  }
  setFromMatrixScale(m: Matrix4): Vector3 {
    const sx = this.setFromMatrixColumn(m, 0).length();
    const sy = this.setFromMatrixColumn(m, 1).length();
    const sz = this.setFromMatrixColumn(m, 2).length();
    this.x = sx;
    this.y = sy;
    this.z = sz;
    return this;
  }
  setFromMatrixColumn(m: Matrix4, index: number): Vector3 {
    //if (typeof m === 'number') {
    //  console.warn('THREE.Vector3: setFromMatrixColumn now expects (matrix, index).');
    //  const temp = m;
    //  m = index;
    //  index = temp;
    //}
    return this.fromArray(m.elements, index * 4);
  }
  equals(v: Vector3): boolean {
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
  }
  fromArray(array: Float32Array | number[], offset: number = 0): Vector3 {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }
  toArray(array: Float32Array | number[] = [], offset: number = 0): Float32Array | number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }
  fromAttribute(attribute: any, index: number, offset: number = 0): Vector3 {
    index = index * attribute.itemSize + offset;
    this.x = attribute.array[index];
    this.y = attribute.array[index + 1];
    this.z = attribute.array[index + 2];
    return this;
  }
  setEulerFromRotationMatrix(): void {
    console.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.");
  }
  setEulerFromQuaternion(): void {
    console.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.");
  }
  getPositionFromMatrix(m: Matrix4): Vector3 {
    console.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().");
    return this.setFromMatrixPosition(m);
  }
  getScaleFromMatrix(m: Matrix4): Vector3 {
    console.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().");
    return this.setFromMatrixScale(m);
  }
  getColumnFromMatrix(index: number, matrix: Matrix4): Vector3 {
    console.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().");
    return this.setFromMatrixColumn(matrix, index);
  }
}
