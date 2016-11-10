import { Vector3 } from "../math/Vector3";
import { Box3 } from "../math/Box3";
import { EventDispatcher } from "./EventDispatcher";
import { BufferAttribute, Float32Attribute } from "./BufferAttribute";
import { InterleavedBufferAttribute } from "./InterleavedBufferAttribute";
import { Sphere } from "../math/Sphere";
import { DirectGeometry } from "./DirectGeometry";
import { Object3D } from "./Object3D";
import { Matrix4 } from "../math/Matrix4";
import { Matrix3 } from "../math/Matrix3";
import { _Math } from "../math/Math";
import { Geometry, GeometryIdCount } from "./Geometry";
import { Points } from "../objects/Points";
import { Line } from "../objects/Line";
import { Mesh } from "../objects/Mesh";
import { Bone } from "../objects/Bone";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
export interface BufferGeometryRange {
  start: number;
  count: number;
}
export interface BufferGeometryGroup {
  start: number;
  count: number;
  materialIndex: number;
}
export class BufferGeometry extends EventDispatcher {
  id: number = GeometryIdCount();
  uuid: string = _Math.generateUUID();
  name: string = '';
  type: string = 'BufferGeometry';
  index: BufferAttribute = null;
  attributes: any = {
    //position: undefined,
    //normal: undefined,
    //color: undefined,
    //uv: undefined,
    //lineDistance: undefined,
    //skinWeight: undefined
  };
  parameters: any = undefined;
  morphTargets: any; // Mesh.ts
  bones: Bone[];
  morphAttributes: any = {};
  groups: BufferGeometryGroup[] = [];
  boundingBox: Box3 = null;
  boundingSphere: Sphere = null;
  drawRange: BufferGeometryRange = { start: 0, count: Infinity };
  maxInstancedCount: number;
  // {
  iks;
  grants;
  rigidBodies;
  constraints;
  mmdFormat;
  // }
  readonly isGeometry: boolean = false;
  readonly isBufferGeometry: boolean = true;
  static MaxIndex: number = 65535;
  constructor() {
    super();
  }
  getIndex(): BufferAttribute {
    return this.index;
  }
  setIndex(index: BufferAttribute): void {
    this.index = index;
  }
  addAttribute(name: string, attribute: BufferAttribute): BufferGeometry {
    if ((attribute && attribute instanceof BufferAttribute) === false && (attribute && attribute instanceof InterleavedBufferAttribute) === false) {
      console.warn('THREE.BufferGeometry: .addAttribute() now expects (name, attribute).');
      this.addAttribute(name, new BufferAttribute(arguments[1], arguments[2]));
      return this;
    }
    if (name === 'index') {
      console.warn('THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute.');
      this.setIndex(attribute);
      return this;
    }
    this.attributes[name] = attribute;
    return this;
  }
  getAttribute(name: string): BufferAttribute {
    return this.attributes[name];
  }
  removeAttribute(name: string): BufferGeometry {
    delete this.attributes[name];
    return this;
  }
  addGroup(start: number, count: number, materialIndex: number = 0): void {
    this.groups.push({
      start: start,
      count: count,
      materialIndex: materialIndex
    });
  }
  clearGroups(): void {
    this.groups = [];
  }
  setDrawRange(start: number, count: number): void {
    this.drawRange.start = start;
    this.drawRange.count = count;
  }
  applyMatrix(matrix: Matrix4): BufferGeometry {
    const position = this.attributes.position;
    if (position !== undefined) {
      matrix.applyToVector3Array(position.array);
      position.needsUpdate = true;
    }
    const normal = this.attributes.normal;
    if (normal !== undefined) {
      const normalMatrix = new Matrix3().getNormalMatrix(matrix);
      normalMatrix.applyToVector3Array(normal.array);
      normal.needsUpdate = true;
    }
    if (this.boundingBox !== null) {
      this.computeBoundingBox();
    }
    if (this.boundingSphere !== null) {
      this.computeBoundingSphere();
    }
    return this;
  }
  rotateX(angle: number): BufferGeometry {
    // rotate geometry around world x-axis
    const m1 = new Matrix4();
    //return function rotateX(angle) {
      m1.makeRotationX(angle);
      this.applyMatrix(m1);
      return this;
    //};
  }
  rotateY(angle: number): BufferGeometry {
    // rotate geometry around world y-axis
    const m1 = new Matrix4();
    //return function rotateY(angle) {
      m1.makeRotationY(angle);
      this.applyMatrix(m1);
      return this;
    //};
  }
  rotateZ(angle: number): BufferGeometry {
    // rotate geometry around world z-axis
    const m1 = new Matrix4();
    //return function rotateZ(angle) {
      m1.makeRotationZ(angle);
      this.applyMatrix(m1);
      return this;
    //};
  }
  translate(x: number, y: number, z: number): BufferGeometry {
    // translate geometry
    const m1 = new Matrix4();
    //return function translate(x, y, z) {
      m1.makeTranslation(x, y, z);
      this.applyMatrix(m1);
      return this;
    //};
  }
  scale(x: number, y: number, z: number): BufferGeometry {
    // scale geometry
    const m1 = new Matrix4();
    //return function scale(x, y, z) {
      m1.makeScale(x, y, z);
      this.applyMatrix(m1);
      return this;
    //};
  }
  lookAt(vector: Vector3): void {
    const obj = new Object3D();
    //return function lookAt(vector) {
      obj.lookAt(vector);
      obj.updateMatrix();
      this.applyMatrix(obj.matrix);
    //};
  }
  center(): Vector3 {
    this.computeBoundingBox();
    const offset = this.boundingBox.getCenter().negate();
    this.translate(offset.x, offset.y, offset.z);
    return offset;
  }
  setFromObject(object: any): BufferGeometry {
    // console.log('THREE.BufferGeometry.setFromObject(). Converting', object, this);
    const geometry = object.geometry;
    if ((object && object instanceof Points) || (object && object instanceof Line)) {
      const positions = Float32Attribute(geometry.vertices.length * 3, 3);
      const colors = Float32Attribute(geometry.colors.length * 3, 3);
      this.addAttribute('position', positions.copyVector3sArray(geometry.vertices));
      this.addAttribute('color', colors.copyColorsArray(geometry.colors));
      if (geometry.lineDistances && geometry.lineDistances.length === geometry.vertices.length) {
        const lineDistances = Float32Attribute(geometry.lineDistances.length, 1);
        this.addAttribute('lineDistance', lineDistances.copyArray(geometry.lineDistances));
      }
      if (geometry.boundingSphere !== null) {
        this.boundingSphere = geometry.boundingSphere.clone();
      }
      if (geometry.boundingBox !== null) {
        this.boundingBox = geometry.boundingBox.clone();
      }
    } else if ((object && object instanceof Mesh)) {
      if ((geometry && geometry instanceof Geometry)) {
        this.fromGeometry(geometry);
      }
    }
    return this;
  }
  updateFromObject(object: any): BufferGeometry {
    let geometry = object.geometry;
    if ((object && object instanceof Mesh)) {
      let direct = geometry.__directGeometry;
      if (geometry.elementsNeedUpdate === true) {
        direct = undefined;
        geometry.elementsNeedUpdate = false;
      }
      if (direct === undefined) {
        return this.fromGeometry(geometry);
      }
      direct.verticesNeedUpdate = geometry.verticesNeedUpdate;
      direct.normalsNeedUpdate = geometry.normalsNeedUpdate;
      direct.colorsNeedUpdate = geometry.colorsNeedUpdate;
      direct.uvsNeedUpdate = geometry.uvsNeedUpdate;
      direct.groupsNeedUpdate = geometry.groupsNeedUpdate;
      geometry.verticesNeedUpdate = false;
      geometry.normalsNeedUpdate = false;
      geometry.colorsNeedUpdate = false;
      geometry.uvsNeedUpdate = false;
      geometry.groupsNeedUpdate = false;
      geometry = direct;
    }
    let attribute;
    if (geometry.verticesNeedUpdate === true) {
      attribute = this.attributes.position;
      if (attribute !== undefined) {
        attribute.copyVector3sArray(geometry.vertices);
        attribute.needsUpdate = true;
      }
      geometry.verticesNeedUpdate = false;
    }
    if (geometry.normalsNeedUpdate === true) {
      attribute = this.attributes.normal;
      if (attribute !== undefined) {
        attribute.copyVector3sArray(geometry.normals);
        attribute.needsUpdate = true;
      }
      geometry.normalsNeedUpdate = false;
    }
    if (geometry.colorsNeedUpdate === true) {
      attribute = this.attributes.color;
      if (attribute !== undefined) {
        attribute.copyColorsArray(geometry.colors);
        attribute.needsUpdate = true;
      }
      geometry.colorsNeedUpdate = false;
    }
    if (geometry.uvsNeedUpdate) {
      attribute = this.attributes.uv;
      if (attribute !== undefined) {
        attribute.copyVector2sArray(geometry.uvs);
        attribute.needsUpdate = true;
      }
      geometry.uvsNeedUpdate = false;
    }
    if (geometry.lineDistancesNeedUpdate) {
      attribute = this.attributes.lineDistance;
      if (attribute !== undefined) {
        attribute.copyArray(geometry.lineDistances);
        attribute.needsUpdate = true;
      }
      geometry.lineDistancesNeedUpdate = false;
    }
    if (geometry.groupsNeedUpdate) {
      geometry.computeGroups(object.geometry);
      this.groups = geometry.groups;
      geometry.groupsNeedUpdate = false;
    }
    return this;
  }
  fromGeometry(geometry: any): BufferGeometry {
    geometry.__directGeometry = new DirectGeometry().fromGeometry(geometry);
    return this.fromDirectGeometry(geometry.__directGeometry);
  }
  fromDirectGeometry(geometry: any): BufferGeometry {
    const positions = new Float32Array(geometry.vertices.length * 3);
    this.addAttribute('position', new BufferAttribute(positions, 3).copyVector3sArray(geometry.vertices));
    if (geometry.normals.length > 0) {
      const normals = new Float32Array(geometry.normals.length * 3);
      this.addAttribute('normal', new BufferAttribute(normals, 3).copyVector3sArray(geometry.normals));
    }
    if (geometry.colors.length > 0) {
      const colors = new Float32Array(geometry.colors.length * 3);
      this.addAttribute('color', new BufferAttribute(colors, 3).copyColorsArray(geometry.colors));
    }
    if (geometry.uvs.length > 0) {
      const uvs = new Float32Array(geometry.uvs.length * 2);
      this.addAttribute('uv', new BufferAttribute(uvs, 2).copyVector2sArray(geometry.uvs));
    }
    if (geometry.uvs2.length > 0) {
      const uvs2 = new Float32Array(geometry.uvs2.length * 2);
      this.addAttribute('uv2', new BufferAttribute(uvs2, 2).copyVector2sArray(geometry.uvs2));
    }
    if (geometry.indices.length > 0) {
      const TypeArray = geometry.vertices.length > 65535 ? Uint32Array : Uint16Array;
      const indices = new TypeArray(geometry.indices.length * 3);
      this.setIndex(new BufferAttribute(indices, 1).copyIndicesArray(geometry.indices));
    }
    // groups
    this.groups = geometry.groups;
    // morphs
    for (let name in geometry.morphTargets) {
      if (!geometry.morphTargets[name]) continue;
      const array = [];
      const morphTargets = geometry.morphTargets[name];
      for (let i = 0, l = morphTargets.length; i < l; i ++) {
        const morphTarget = morphTargets[i];
        const attribute = Float32Attribute(morphTarget.length * 3, 3);
        array.push(attribute.copyVector3sArray(morphTarget));
      }
      this.morphAttributes[name] = array;
    }
    // skinning
    if (geometry.skinIndices.length > 0) {
      const skinIndices = Float32Attribute(geometry.skinIndices.length * 4, 4);
      this.addAttribute('skinIndex', skinIndices.copyVector4sArray(geometry.skinIndices));
    }
    if (geometry.skinWeights.length > 0) {
      const skinWeights = Float32Attribute(geometry.skinWeights.length * 4, 4);
      this.addAttribute('skinWeight', skinWeights.copyVector4sArray(geometry.skinWeights));
    }
    //
    if (geometry.boundingSphere !== null) {
      this.boundingSphere = geometry.boundingSphere.clone();
    }
    if (geometry.boundingBox !== null) {
      this.boundingBox = geometry.boundingBox.clone();
    }
    return this;
  }
  computeBoundingBox(): void {
    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }
    const positions = this.attributes.position.array;
    if (positions !== undefined) {
      this.boundingBox.setFromArray(positions);
    } else {
      this.boundingBox.makeEmpty();
    }
    if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
      console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeBoundingSphere(): void {
    const box = new Box3();
    const vector = new Vector3();
    //return function computeBoundingSphere() {
      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }
      const positions = this.attributes.position;
      if (positions) {
        const array = positions.array;
        const center = this.boundingSphere.center;
        box.setFromArray(array);
        box.getCenter(center);
        // hoping to find a boundingSphere with a radius smaller than the
        // boundingSphere of the boundingBox: sqrt(3) smaller in the best case
        let maxRadiusSq = 0;
        for (let i = 0, il = array.length; i < il; i += 3) {
          vector.fromArray(array, i);
          maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
        }
        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
        if (isNaN(this.boundingSphere.radius)) {
          console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
        }
      }
    //};
  }
  computeFaceNormals(): void {
    // backwards compatibility
  }
  computeVertexNormals(): void {
    const index = this.index;
    const attributes = this.attributes;
    const groups = this.groups;
    if (attributes.position) {
      const positions = attributes.position.array;
      if (attributes.normal === undefined) {
        this.addAttribute('normal', new BufferAttribute(new Float32Array(positions.length), 3));
      } else {
        // reset existing normals to zero
        const array = attributes.normal.array;
        for (let i = 0, il = array.length; i < il; i ++) {
          array[i] = 0;
        }
      }
      const normals = attributes.normal.array;
      let vA, vB, vC,
      pA = new Vector3(),
      pB = new Vector3(),
      pC = new Vector3(),
      cb = new Vector3(),
      ab = new Vector3();
      // indexed elements
      if (index) {
        const indices = index.array;
        if (groups.length === 0) {
          this.addGroup(0, indices.length);
        }
        for (let j = 0, jl = groups.length; j < jl; ++ j) {
          const group = groups[j];
          const start = group.start;
          const count = group.count;
          for (let i = start, il = start + count; i < il; i += 3) {
            vA = indices[i + 0] * 3;
            vB = indices[i + 1] * 3;
            vC = indices[i + 2] * 3;
            pA.fromArray(positions, vA);
            pB.fromArray(positions, vB);
            pC.fromArray(positions, vC);
            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);
            normals[vA] += cb.x;
            normals[vA + 1] += cb.y;
            normals[vA + 2] += cb.z;
            normals[vB] += cb.x;
            normals[vB + 1] += cb.y;
            normals[vB + 2] += cb.z;
            normals[vC] += cb.x;
            normals[vC + 1] += cb.y;
            normals[vC + 2] += cb.z;
          }
        }
      } else {
        // non-indexed elements (unconnected triangle soup)
        for (let i = 0, il = positions.length; i < il; i += 9) {
          pA.fromArray(positions, i);
          pB.fromArray(positions, i + 3);
          pC.fromArray(positions, i + 6);
          cb.subVectors(pC, pB);
          ab.subVectors(pA, pB);
          cb.cross(ab);
          normals[i] = cb.x;
          normals[i + 1] = cb.y;
          normals[i + 2] = cb.z;
          normals[i + 3] = cb.x;
          normals[i + 4] = cb.y;
          normals[i + 5] = cb.z;
          normals[i + 6] = cb.x;
          normals[i + 7] = cb.y;
          normals[i + 8] = cb.z;
        }
      }
      this.normalizeNormals();
      attributes.normal.needsUpdate = true;
    }
  }
  merge(geometry: BufferGeometry, offset: number = 0): BufferGeometry {
    if ((geometry && geometry instanceof BufferGeometry) === false) {
      console.error('THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.', geometry);
      return this;
    }
    const attributes = this.attributes;
    for (let key in attributes) {
      const attribute1 = attributes[key];
      if (attribute1 === undefined) continue;
      const attributeArray1 = attribute1.array;
      const attribute2 = geometry.attributes[key];
      if (attribute2 === undefined) continue;
      const attributeArray2 = attribute2.array;
      const attributeSize = attribute2.itemSize;
      for (let i = 0, j = attributeSize * offset; i < attributeArray2.length; i ++, j ++) {
        attributeArray1[j] = attributeArray2[i];
      }
    }
    return this;
  }
  normalizeNormals(): void {
    const normals = this.attributes.normal.array;
    for (let i = 0, il = normals.length; i < il; i += 3) {
      const x = normals[i];
      const y = normals[i + 1];
      const z = normals[i + 2];
      const n = 1.0 / Math.sqrt(x * x + y * y + z * z);
      normals[i] *= n;
      normals[i + 1] *= n;
      normals[i + 2] *= n;
    }
  }
  toNonIndexed(): BufferGeometry {
    if (this.index === null) {
      console.warn('THREE.BufferGeometry.toNonIndexed(): Geometry is already non-indexed.');
      return this;
    }
    const geometry2 = new BufferGeometry();
    const indices = this.index.array;
    const attributes = this.attributes;
    for (let name in attributes) {
      const attribute = attributes[name];
      if (attribute === undefined) continue;
      const array = attribute.array;
      const itemSize = attribute.itemSize;
      const array2 = new array.constructor(indices.length * itemSize);
      let index = 0, index2 = 0;
      for (let i = 0, l = indices.length; i < l; i ++) {
        index = indices[i] * itemSize;
        for (let j = 0; j < itemSize; j ++) {
          array2[index2 ++] = array[index ++];
        }
      }
      geometry2.addAttribute(name, new BufferAttribute(array2, itemSize));
    }
    return geometry2;
  }
  toJSON(meta?: any): any {
    const data: any = {
      metadata: {
        version: 4.4,
        type: 'BufferGeometry',
        generator: 'BufferGeometry.toJSON'
      }
    };
    // standard BufferGeometry serialization
    data.uuid = this.uuid;
    data.type = this.type;
    if (this.name !== '') data.name = this.name;
    if (this.parameters !== undefined) {
      const parameters = this.parameters;
      for (let key in parameters) {
        if (parameters[key] !== undefined) data[key] = parameters[key];
      }
      return data;
    }
    data.data = { attributes: {} };
    const index = this.index;
    if (index !== null) {
      const array = Array.prototype.slice.call(index.array);
      data.data.index = {
        type: index.array.constructor.name,
        array: array
      };
    }
    const attributes = this.attributes;
    for (let key in attributes) {
      const attribute = attributes[key];
      if (attribute === undefined) continue;
      const array = Array.prototype.slice.call(attribute.array);
      data.data.attributes[key] = {
        itemSize: attribute.itemSize,
        type: attribute.array.constructor.name,
        array: array,
        normalized: attribute.normalized
      };
    }
    const groups = this.groups;
    if (groups.length > 0) {
      data.data.groups = JSON.parse(JSON.stringify(groups));
    }
    const boundingSphere = this.boundingSphere;
    if (boundingSphere !== null) {
      data.data.boundingSphere = {
        center: boundingSphere.center.toArray(),
        radius: boundingSphere.radius
      };
    }
    return data;
  }
  clone(): this {
    /*
    // Handle primitives
    const parameters = this.parameters;
    if (parameters !== undefined) {
      const values = [];
      for (let key in parameters) {
        values.push(parameters[key]);
      }
      const geometry = Object.create(this.constructor.prototype);
      this.constructor.apply(geometry, values);
      return geometry;
    }
    return new this.constructor().copy(this);
    */
    return new (this.constructor as any)().copy(this);
  }
  copy(source: this): this {
    const index = source.index;
    if (index !== null) {
      this.setIndex(index.clone());
    }
    const attributes = source.attributes;
    for (let name in attributes) {
      const attribute = attributes[name];
      if (attribute === undefined) continue;
      this.addAttribute(name, attribute.clone());
    }
    const groups = source.groups;
    for (let i = 0, l = groups.length; i < l; i ++) {
      const group = groups[i];
      this.addGroup(group.start, group.count, group.materialIndex);
    }
    return this;
  }
  dispose(): void {
    this.dispatchEvent({ type: 'dispose' });
  }
  addIndex(index: BufferAttribute): void {
    console.warn("THREE.BufferGeometry: .addIndex() has been renamed to .setIndex().");
    this.setIndex(index);
  }
  addDrawCall(start: number, count: number, indexOffset?: number): void {
    if (indexOffset !== undefined) {
      console.warn("THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset.");
    }
    console.warn("THREE.BufferGeometry: .addDrawCall() is now .addGroup().");
    this.addGroup(start, count);
  }
  clearDrawCalls(): void {
    console.warn("THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups().");
    this.clearGroups();
  }
  computeTangents(): void {
    console.warn("THREE.BufferGeometry: .computeTangents() has been removed.");
  }
  computeOffsets(): void {
    console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.");
  }
  get drawcalls(): any[] {
    console.error("THREE.BufferGeometry: .drawcalls has been renamed to .groups.");
    return this.groups;
  }
  get offsets(): any[] {
    console.warn("THREE.BufferGeometry: .offsets has been renamed to .groups.");
    return this.groups;
  }
}
