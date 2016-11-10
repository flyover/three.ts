import { _Math } from "./Math";
import { Vector3 } from "./Vector3";
import { Vector4 } from "./Vector4";
import { Euler } from "./Euler";
import { Quaternion } from "./Quaternion";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 */
export class Matrix4 {
  elements: Float32Array;
  readonly isMatrix4: boolean = true;
  constructor() {
    this.elements = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
    if (arguments.length > 0) {
      console.error('THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.');
    }
  }
  set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): Matrix4 {
    const te: Float32Array = this.elements;
    te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
    te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
    te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
    te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
    return this;
  }
  identity(): Matrix4 {
    this.set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    return this;
  }
  clone(): Matrix4 {
    return new (this.constructor as any)().fromArray(this.elements);
  }
  copy(m: Matrix4): Matrix4 {
    this.elements.set(m.elements);
    return this;
  }
  copyPosition(m: Matrix4): Matrix4 {
    const te: Float32Array = this.elements;
    const me: Float32Array = m.elements;
    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];
    return this;
  }
  extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): Matrix4 {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);
    return this;
  }
  makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): Matrix4 {
    this.set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      0,       0,       0,       1
    );
    return this;
  }
  private static _extractRotation_v1 = new Vector3();
  extractRotation(m: Matrix4): Matrix4 {
    const v1 = Matrix4._extractRotation_v1;
    const te: Float32Array = this.elements;
    const me: Float32Array = m.elements;
    const scaleX = 1 / v1.setFromMatrixColumn(m, 0).length();
    const scaleY = 1 / v1.setFromMatrixColumn(m, 1).length();
    const scaleZ = 1 / v1.setFromMatrixColumn(m, 2).length();
    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    return this;
  }
  makeRotationFromEuler(euler: Euler): Matrix4 {
    if ((euler && euler instanceof Euler) === false) {
      console.error('THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.');
    }
    const te: Float32Array = this.elements;
    const x = euler.x, y = euler.y, z = euler.z;
    const a = Math.cos(x), b = Math.sin(x);
    const c = Math.cos(y), d = Math.sin(y);
    const e = Math.cos(z), f = Math.sin(z);
    if (euler.order === 'XYZ') {
      const ae = a * e, af = a * f, be = b * e, bf = b * f;
      te[0] = c * e;
      te[4] = - c * f;
      te[8] = d;
      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = - b * c;
      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a * c;
    } else if (euler.order === 'YXZ') {
      const ce = c * e, cf = c * f, de = d * e, df = d * f;
      te[0] = ce + df * b;
      te[4] = de * b - cf;
      te[8] = a * d;
      te[1] = a * f;
      te[5] = a * e;
      te[9] = - b;
      te[2] = cf * b - de;
      te[6] = df + ce * b;
      te[10] = a * c;
    } else if (euler.order === 'ZXY') {
      const ce = c * e, cf = c * f, de = d * e, df = d * f;
      te[0] = ce - df * b;
      te[4] = - a * f;
      te[8] = de + cf * b;
      te[1] = cf + de * b;
      te[5] = a * e;
      te[9] = df - ce * b;
      te[2] = - a * d;
      te[6] = b;
      te[10] = a * c;
    } else if (euler.order === 'ZYX') {
      const ae = a * e, af = a * f, be = b * e, bf = b * f;
      te[0] = c * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;
      te[1] = c * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;
      te[2] = - d;
      te[6] = b * c;
      te[10] = a * c;
    } else if (euler.order === 'YZX') {
      const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
      te[0] = c * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;
      te[1] = f;
      te[5] = a * e;
      te[9] = - b * e;
      te[2] = - d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;
    } else if (euler.order === 'XZY') {
      const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
      te[0] = c * e;
      te[4] = - f;
      te[8] = d * e;
      te[1] = ac * f + bd;
      te[5] = a * e;
      te[9] = ad * f - bc;
      te[2] = bc * f - ad;
      te[6] = b * e;
      te[10] = bd * f + ac;
    }
    // last column
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    // bottom row
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }
  makeRotationFromQuaternion(q: Quaternion): Matrix4 {
    const te: Float32Array = this.elements;
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    te[0] = 1 - (yy + zz);
    te[4] = xy - wz;
    te[8] = xz + wy;
    te[1] = xy + wz;
    te[5] = 1 - (xx + zz);
    te[9] = yz - wx;
    te[2] = xz - wy;
    te[6] = yz + wx;
    te[10] = 1 - (xx + yy);
    // last column
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;
    // bottom row
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }
  private static _lookAt_x = new Vector3();
  private static _lookAt_y = new Vector3();
  private static _lookAt_z = new Vector3();
  lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
    const x = Matrix4._lookAt_x;
    const y = Matrix4._lookAt_y;
    const z = Matrix4._lookAt_z;
    const te: Float32Array = this.elements;
    z.subVectors(eye, target).normalize();
    if (z.lengthSq() === 0) {
      z.z = 1;
    }
    x.crossVectors(up, z).normalize();
    if (x.lengthSq() === 0) {
      z.z += 0.0001;
      x.crossVectors(up, z).normalize();
    }
    y.crossVectors(z, x);
    te[0] = x.x; te[4] = y.x; te[8] = z.x;
    te[1] = x.y; te[5] = y.y; te[9] = z.y;
    te[2] = x.z; te[6] = y.z; te[10] = z.z;
    return this;
  }
  multiply(m: Matrix4, n?: Matrix4): Matrix4 {
    if (n !== undefined) {
      console.warn('THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices(a, b) instead.');
      return this.multiplyMatrices(m, n);
    }
    return this.multiplyMatrices(this, m);
  }
  premultiply(m: Matrix4): Matrix4 {
    return this.multiplyMatrices(m, this);
  }
  multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4 {
    const ae: Float32Array = a.elements;
    const be: Float32Array = b.elements;
    const te: Float32Array = this.elements;
    const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
    const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  }
  multiplyToArray(a: Matrix4, b: Matrix4, r: Float32Array | number[]): Matrix4 {
    const te: Float32Array = this.elements;
    this.multiplyMatrices(a, b);
    r[0] = te[0]; r[1] = te[1]; r[2] = te[2]; r[3] = te[3];
    r[4] = te[4]; r[5] = te[5]; r[6] = te[6]; r[7] = te[7];
    r[8]  = te[8]; r[9]  = te[9]; r[10] = te[10]; r[11] = te[11];
    r[12] = te[12]; r[13] = te[13]; r[14] = te[14]; r[15] = te[15];
    return this;
  }
  multiplyScalar(s: number): Matrix4 {
    const te: Float32Array = this.elements;
    te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
    te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
    te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
    te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;
    return this;
  }
  private static _applyToVector3Array_v1 = new Vector3();
  applyToVector3Array(array: Float32Array | number[], offset: number = 0, length: number = array.length): Float32Array | number[] {
    const v1 = Matrix4._applyToVector3Array_v1;
    for (let i = 0, j = offset; i < length; i += 3, j += 3) {
      v1.fromArray(array, j);
      v1.applyMatrix4(this);
      v1.toArray(array, j);
    }
    return array;
  }
  private static _applyToBuffer_v1 = new Vector3();
  applyToBuffer(buffer: any, offset: number = 0, length: number = buffer.length / buffer.itemSize): any {
    const v1 = Matrix4._applyToBuffer_v1;
    for (let i = 0, j = offset; i < length; i ++, j ++) {
      v1.x = buffer.getX(j);
      v1.y = buffer.getY(j);
      v1.z = buffer.getZ(j);
      v1.applyMatrix4(this);
      buffer.setXYZ(j, v1.x, v1.y, v1.z);
    }
    return buffer;
  }
  determinant(): number {
    const te: Float32Array = this.elements;
    const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
    const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
    const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
    const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
    //TODO: make this more efficient
    //(based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm)
    return (
      n41 * (
        + n14 * n23 * n32
         - n13 * n24 * n32
         - n14 * n22 * n33
         + n12 * n24 * n33
         + n13 * n22 * n34
         - n12 * n23 * n34
      ) +
      n42 * (
        + n11 * n23 * n34
         - n11 * n24 * n33
         + n14 * n21 * n33
         - n13 * n21 * n34
         + n13 * n24 * n31
         - n14 * n23 * n31
      ) +
      n43 * (
        + n11 * n24 * n32
         - n11 * n22 * n34
         - n14 * n21 * n32
         + n12 * n21 * n34
         + n14 * n22 * n31
         - n12 * n24 * n31
      ) +
      n44 * (
        - n13 * n22 * n31
         - n11 * n23 * n32
         + n11 * n22 * n33
         + n13 * n21 * n32
         - n12 * n21 * n33
         + n12 * n23 * n31
      )
    );
  }
  transpose(): Matrix4 {
    const te: Float32Array = this.elements;
    let tmp;
    tmp = te[1]; te[1] = te[4]; te[4] = tmp;
    tmp = te[2]; te[2] = te[8]; te[8] = tmp;
    tmp = te[6]; te[6] = te[9]; te[9] = tmp;
    tmp = te[3]; te[3] = te[12]; te[12] = tmp;
    tmp = te[7]; te[7] = te[13]; te[13] = tmp;
    tmp = te[11]; te[11] = te[14]; te[14] = tmp;
    return this;
  }
  flattenToArrayOffset(array: Float32Array | number[] = [], offset: number = 0): Float32Array | number[] {
    console.warn("THREE.Matrix3: .flattenToArrayOffset is deprecated " +
        "- just use .toArray instead.");
    return this.toArray(array, offset);
  }
  private static _getPosition_v1 = new Vector3();
  getPosition(): Vector3 {
    const v1 = Matrix4._getPosition_v1;
    console.warn('THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition(matrix) instead.');
    return v1.setFromMatrixColumn(this, 3);
  }
  setPosition(v: Vector3): Matrix4 {
    const te: Float32Array = this.elements;
    te[12] = v.x;
    te[13] = v.y;
    te[14] = v.z;
    return this;
  }
  getInverse(m: Matrix4, throwOnDegenerate: boolean = false): Matrix4 {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    const te: Float32Array = this.elements,
      me: Float32Array = m.elements,
      n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
      n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
      n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
      n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
      t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
      t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
      t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
      t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
    if (det === 0) {
      const msg = "THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0";
      if (throwOnDegenerate === true) {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }
      return this.identity();
    }
    const detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
    return this;
  }
  scale(v: Vector3): Matrix4 {
    const te: Float32Array = this.elements;
    const x = v.x, y = v.y, z = v.z;
    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;
    return this;
  }
  getMaxScaleOnAxis(): number {
    const te: Float32Array = this.elements;
    const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }
  makeTranslation(x: number, y: number, z: number): Matrix4 {
    this.set(
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    );
    return this;
  }
  makeRotationX(theta: number): Matrix4 {
    const c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      1, 0,  0, 0,
      0, c, - s, 0,
      0, s,  c, 0,
      0, 0,  0, 1
    );
    return this;
  }
  makeRotationY(theta: number): Matrix4 {
    const c = Math.cos(theta), s = Math.sin(theta);
    this.set(
       c, 0, s, 0,
       0, 1, 0, 0,
      - s, 0, c, 0,
       0, 0, 0, 1
    );
    return this;
  }
  makeRotationZ(theta: number): Matrix4 {
    const c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      c, - s, 0, 0,
      s,  c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1
    );
    return this;
  }
  makeRotationAxis(axis: Vector3, angle: number): Matrix4 {
    // Based on http://www.gamedev.net/reference/articles/article1199.asp
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const x = axis.x, y = axis.y, z = axis.z;
    const tx = t * x, ty = t * y;
    this.set(
      tx * x + c, tx * y - s * z, tx * z + s * y, 0,
      tx * y + s * z, ty * y + c, ty * z - s * x, 0,
      tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
      0, 0, 0, 1
    );
     return this;
  }
  makeScale(x: number, y: number, z: number): Matrix4 {
    this.set(
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    );
    return this;
  }
  compose(position: Vector3, quaternion: Quaternion, scale: Vector3): Matrix4 {
    this.makeRotationFromQuaternion(quaternion);
    this.scale(scale);
    this.setPosition(position);
    return this;
  }
  private static _decompose_vector = new Vector3();
  private static _decompose_matrix = new Matrix4();
  decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): Matrix4 {
    const vector = Matrix4._decompose_vector, matrix = Matrix4._decompose_matrix;
    const te: Float32Array = this.elements;
    let sx = vector.set(te[0], te[1], te[2]).length();
    const sy = vector.set(te[4], te[5], te[6]).length();
    const sz = vector.set(te[8], te[9], te[10]).length();
    // if determine is negative, we need to invert one scale
    const det = this.determinant();
    if (det < 0) {
      sx = - sx;
    }
    position.x = te[12];
    position.y = te[13];
    position.z = te[14];
    // scale the rotation part
    matrix.elements.set(this.elements); // at this point matrix is incomplete so we can't use .copy()
    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;
    matrix.elements[0] *= invSX;
    matrix.elements[1] *= invSX;
    matrix.elements[2] *= invSX;
    matrix.elements[4] *= invSY;
    matrix.elements[5] *= invSY;
    matrix.elements[6] *= invSY;
    matrix.elements[8] *= invSZ;
    matrix.elements[9] *= invSZ;
    matrix.elements[10] *= invSZ;
    quaternion.setFromRotationMatrix(matrix);
    scale.x = sx;
    scale.y = sy;
    scale.z = sz;
    return this;
  }
  makeFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4 {
    const te: Float32Array = this.elements;
    const x = 2 * near / (right - left);
    const y = 2 * near / (top - bottom);
    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = - (far + near) / (far - near);
    const d = - 2 * far * near / (far - near);
    te[0] = x;  te[4] = 0;  te[8] = a;  te[12] = 0;
    te[1] = 0;  te[5] = y;  te[9] = b;  te[13] = 0;
    te[2] = 0;  te[6] = 0;  te[10] = c;  te[14] = d;
    te[3] = 0;  te[7] = 0;  te[11] = - 1;  te[15] = 0;
    return this;
  }
  makePerspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
    const ymax = near * Math.tan(_Math.DEG2RAD * fov * 0.5);
    const ymin = - ymax;
    const xmin = ymin * aspect;
    const xmax = ymax * aspect;
    return this.makeFrustum(xmin, xmax, ymin, ymax, near, far);
  }
  makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number): Matrix4 {
    const te: Float32Array = this.elements;
    const w = 1.0 / (right - left);
    const h = 1.0 / (top - bottom);
    const p = 1.0 / (far - near);
    const x = (right + left) * w;
    const y = (top + bottom) * h;
    const z = (far + near) * p;
    te[0] = 2 * w;  te[4] = 0;  te[8] = 0;  te[12] = - x;
    te[1] = 0;  te[5] = 2 * h;  te[9] = 0;  te[13] = - y;
    te[2] = 0;  te[6] = 0;  te[10] = - 2 * p;  te[14] = - z;
    te[3] = 0;  te[7] = 0;  te[11] = 0;  te[15] = 1;
    return this;
  }
  equals(matrix: Matrix4): boolean {
    const te: Float32Array = this.elements;
    const me: Float32Array = matrix.elements;
    for (let i = 0; i < 16; i ++) {
      if (te[i] !== me[i]) return false;
    }
    return true;
  }
  fromArray(array: Float32Array | number[], offset: number = 0): Matrix4 {
    for (let i = 0; i < 16; i ++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  }
  toArray(array: Float32Array | number[] = [], offset: number = 0): Float32Array | number[] {
    const te: Float32Array = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8]  = te[8];
    array[offset + 9]  = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];
    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];
    return array;
  }
  extractPosition(m: Matrix4): Matrix4 {
    console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition().");
    return this.copyPosition(m);
  }
  setRotationFromQuaternion(q: Quaternion): Matrix4 {
    console.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion().");
    return this.makeRotationFromQuaternion(q);
  }
  multiplyVector3(vector: Vector3): Vector3 {
    console.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4(matrix) or vector.applyProjection(matrix) instead.");
    return vector.applyProjection(this);
  }
  multiplyVector4(vector: Vector4): Vector4 {
    console.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4(matrix) instead.");
    return vector.applyMatrix4(this);
  }
  multiplyVector3Array(a: Float32Array | number[]): Float32Array | number[] {
    console.warn("THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array(array) instead.");
    return this.applyToVector3Array(a);
  }
  rotateAxis(v: Vector3): void {
    console.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection(matrix) instead.");
    v.transformDirection(this);
  }
  crossVector(vector: Vector3): Vector3 {
    console.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4(matrix) instead.");
    return vector.applyMatrix4(this);
  }
  translate(v: Vector3): void {
    console.error("THREE.Matrix4: .translate() has been removed.");
  }
  rotateX(angle: number): void {
    console.error("THREE.Matrix4: .rotateX() has been removed.");
  }
  rotateY(angle: number): void {
    console.error("THREE.Matrix4: .rotateY() has been removed.");
  }
  rotateZ(angle: number): void {
    console.error("THREE.Matrix4: .rotateZ() has been removed.");
  }
  rotateByAxis(axis: Vector3, angle: number): void {
    console.error("THREE.Matrix4: .rotateByAxis() has been removed.");
  }
}
