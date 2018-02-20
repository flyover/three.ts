import { Vector4 } from "../math/Vector4";
import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { Color } from "../math/Color";
import { _Math } from "../math/Math";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export class BufferAttribute {
  uuid: string = _Math.generateUUID();
  array: TypedArray;
  itemSize: number;
  count: number;
  normalized: boolean;
  dynamic: boolean = false;
  updateRange: any = { offset: 0, count: - 1 };
  version: number = 0;
  readonly isBufferAttribute: boolean = true;
  readonly isInterleavedBufferAttribute: boolean = false;
  constructor(array?: TypedArray, itemSize?: number, normalized: boolean = false) {
    if (Array.isArray(array)) {
      throw new TypeError('THREE.BufferAttribute: array should be a Typed Array.');
    }
    this.array = array;
    this.itemSize = itemSize;
    this.count = array !== undefined ? array.length / itemSize : 0;
    this.normalized = normalized === true;
  }
  set needsUpdate(value: boolean) {
    if (value === true) this.version ++;
  }
  setArray(array: TypedArray): void {
    if (Array.isArray(array)) {
      throw new TypeError('THREE.BufferAttribute: array should be a Typed Array.');
    }
    this.count = array !== undefined ? array.length / this.itemSize : 0;
    this.array = array;
  }
  setDynamic(value: boolean): BufferAttribute {
    this.dynamic = value;
    return this;
  }
  copy(source: this): this {
    this.array = new (source.array.constructor as any)(source.array);
    this.itemSize = source.itemSize;
    this.count = source.count;
    this.normalized = source.normalized;
    this.dynamic = source.dynamic;
    return this;
  }
  copyAt(index1: number, attribute: BufferAttribute, index2: number): BufferAttribute {
    index1 *= this.itemSize;
    index2 *= attribute.itemSize;
    for (let i = 0, l = this.itemSize; i < l; i ++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }
    return this;
  }
  copyArray(array: number[] | TypedArray): BufferAttribute {
    this.array.set(array as any, 0);
    return this;
  }
  copyColorsArray(colors: Color[]): BufferAttribute {
    const array = this.array;
    let offset = 0;
    for (let i = 0, l = colors.length; i < l; i ++) {
      let color = colors[i];
      if (color === undefined) {
        console.warn('THREE.BufferAttribute.copyColorsArray(): color is undefined', i);
        color = new Color();
      }
      array[offset ++] = color.r;
      array[offset ++] = color.g;
      array[offset ++] = color.b;
    }
    return this;
  }
  copyIndicesArray(indices: any[]): BufferAttribute {
    const array = this.array;
    let offset = 0;
    for (let i = 0, l = indices.length; i < l; i ++) {
      const index = indices[i];
      array[offset ++] = index.a;
      array[offset ++] = index.b;
      array[offset ++] = index.c;
    }
    return this;
  }
  copyVector2sArray(vectors: Vector2[]): BufferAttribute {
    const array = this.array;
    let offset = 0;
    for (let i = 0, l = vectors.length; i < l; i ++) {
      let vector = vectors[i];
      if (vector === undefined) {
        console.warn('THREE.BufferAttribute.copyVector2sArray(): vector is undefined', i);
        vector = new Vector2();
      }
      array[offset ++] = vector.x;
      array[offset ++] = vector.y;
    }
    return this;
  }
  copyVector3sArray(vectors: Vector3[]): BufferAttribute {
    const array = this.array;
    let offset = 0;
    for (let i = 0, l = vectors.length; i < l; i ++) {
      let vector = vectors[i];
      if (vector === undefined) {
        console.warn('THREE.BufferAttribute.copyVector3sArray(): vector is undefined', i);
        vector = new Vector3();
      }
      array[offset ++] = vector.x;
      array[offset ++] = vector.y;
      array[offset ++] = vector.z;
    }
    return this;
  }
  copyVector4sArray(vectors: Vector4[]): BufferAttribute {
    const array = this.array;
    let offset = 0;
    for (let i = 0, l = vectors.length; i < l; i ++) {
      let vector = vectors[i];
      if (vector === undefined) {
        console.warn('THREE.BufferAttribute.copyVector4sArray(): vector is undefined', i);
        vector = new Vector4();
      }
      array[offset ++] = vector.x;
      array[offset ++] = vector.y;
      array[offset ++] = vector.z;
      array[offset ++] = vector.w;
    }
    return this;
  }
  set(value: ArrayLike<number>, offset: number = 0): BufferAttribute {
    this.array.set(value, offset);
    return this;
  }
  getX(index: number): number {
    return this.array[index * this.itemSize];
  }
  setX(index: number, x: number): BufferAttribute {
    this.array[index * this.itemSize] = x;
    return this;
  }
  getY(index: number): number {
    return this.array[index * this.itemSize + 1];
  }
  setY(index: number, y: number): BufferAttribute {
    this.array[index * this.itemSize + 1] = y;
    return this;
  }
  getZ(index: number): number {
    return this.array[index * this.itemSize + 2];
  }
  setZ(index: number, z: number): BufferAttribute {
    this.array[index * this.itemSize + 2] = z;
    return this;
  }
  getW(index: number): number {
    return this.array[index * this.itemSize + 3];
  }
  setW(index: number, w: number): BufferAttribute {
    this.array[index * this.itemSize + 3] = w;
    return this;
  }
  setXY(index: number, x: number, y: number): BufferAttribute {
    index *= this.itemSize;
    this.array[index + 0] = x;
    this.array[index + 1] = y;
    return this;
  }
  setXYZ(index: number, x: number, y: number, z: number): BufferAttribute {
    index *= this.itemSize;
    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    return this;
  }
  setXYZW(index: number, x: number, y: number, z: number, w: number): BufferAttribute {
    index *= this.itemSize;
    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    this.array[index + 3] = w;
    return this;
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  get length(): number {
    console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count.");
    return this.array.length;
  }
}
//
export function Int8Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Int8Array(array as any), itemSize);
}
export function Uint8Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Uint8Array(array as any), itemSize);
}
export function Uint8ClampedAttribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Uint8ClampedArray(array as any), itemSize);
}
export function Int16Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Int16Array(array as any), itemSize);
}
export function Uint16Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Uint16Array(array as any), itemSize);
}
export function Int32Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Int32Array(array as any), itemSize);
}
export function Uint32Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Uint32Array(array as any), itemSize);
}
export function Float32Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Float32Array(array as any), itemSize);
}
export function Float64Attribute(array: ArrayLike<number> | number, itemSize: number): BufferAttribute {
  return new BufferAttribute(new Float64Array(array as any), itemSize);
}
// Deprecated
export function DynamicBufferAttribute(array: TypedArray, itemSize: number): BufferAttribute {
  console.warn('THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic(true) instead.');
  return new BufferAttribute(array, itemSize).setDynamic(true);
}
