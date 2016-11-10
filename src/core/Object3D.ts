import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Matrix4 } from "../math/Matrix4";
import { EventDispatcher } from "./EventDispatcher";
import { Euler } from "../math/Euler";
import { Layers } from "./Layers";
import { Matrix3 } from "../math/Matrix3";
import { _Math } from "../math/Math";
import { Geometry } from "./Geometry";
import { BufferGeometry } from "./BufferGeometry";
import { Material } from "../materials/Material";
import { MultiMaterial } from "../materials/MultiMaterial";
import { Raycaster, Intersect } from "./Raycaster";
import { AnimationClip } from "../animation/AnimationClip";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author elephantatwork / www.elephantatwork.ch
 */
export class Object3D extends EventDispatcher {
  id: number = Object3DIdCount();
  uuid: string = _Math.generateUUID();
  name: string = '';
  type: string = 'Object3D';
  parent: Object3D = null;
  children: Object3D[] = [];
  up: Vector3 = Object3D.DefaultUp.clone();
  position: Vector3 = new Vector3();
  rotation: Euler = new Euler();
  quaternion: Quaternion = new Quaternion();
  scale: Vector3 = new Vector3(1, 1, 1);
  modelViewMatrix: Matrix4 = new Matrix4();
  normalMatrix: Matrix3 = new Matrix3();
  matrix: Matrix4 = new Matrix4();
  matrixWorld: Matrix4 = new Matrix4();
  matrixAutoUpdate: boolean = Object3D.DefaultMatrixAutoUpdate;
  matrixWorldNeedsUpdate: boolean = false;
  layers: Layers = new Layers();
  visible: boolean = true;
  castShadow: boolean = false;
  receiveShadow: boolean = false;
  frustumCulled: boolean = true;
  renderOrder: number = 0;
  userData: any = {};
  onBeforeRender: (renderer, scene, camera, geometry, material, group) => void = function() {};
  onAfterRender: (renderer, scene, camera, geometry, material, group) => void = function() {};
  geometry: Geometry | BufferGeometry = undefined;
  material: Material | MultiMaterial = undefined;
  animations: AnimationClip[];
  // {
  count: any;
  hasPositions: any; positionArray: any;
  hasNormals: any; normalArray: any;
  hasUvs: any; uvArray: any;
  hasColors: any; colorArray: any;
  morphTargetInfluences: any;
  skeleton: any; // WebGLPrograms
  shadow: any;
  // }
  readonly isObject3D: boolean = true;
  static readonly DefaultUp: Vector3 = new Vector3(0, 1, 0);
  static readonly DefaultMatrixAutoUpdate: boolean = true;
  constructor() {
    super();
    const rotation = this.rotation;
    const quaternion = this.quaternion;
    function onRotationChange() {
      quaternion.setFromEuler(rotation, false);
    }
    function onQuaternionChange() {
      rotation.setFromQuaternion(quaternion, undefined, false);
    }
    rotation.onChange(onRotationChange);
    quaternion.onChange(onQuaternionChange);
  }
  applyMatrix(matrix: Matrix4): void {
    this.matrix.multiplyMatrices(matrix, this.matrix);
    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  setRotationFromAxisAngle(axis: Vector3, angle: number): void {
    // assumes axis is normalized
    this.quaternion.setFromAxisAngle(axis, angle);
  }
  setRotationFromEuler(euler: Euler): void {
    this.quaternion.setFromEuler(euler, true);
  }
  setRotationFromMatrix(m: Matrix4): void {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    this.quaternion.setFromRotationMatrix(m);
  }
  setRotationFromQuaternion(q: Quaternion): void {
    // assumes q is normalized
    this.quaternion.copy(q);
  }
  private static _rotateOnAxis_q1 = new Quaternion();
  rotateOnAxis(axis: Vector3, angle: number): Object3D {
    // rotate object on axis in object space
    // axis is assumed to be normalized
    const q1 = Object3D._rotateOnAxis_q1;
    q1.setFromAxisAngle(axis, angle);
    this.quaternion.multiply(q1);
    return this;
  }
  private static _rotateX_v1 = new Vector3(1, 0, 0);
  rotateX(angle: number): Object3D {
    const v1 = Object3D._rotateX_v1;
    return this.rotateOnAxis(v1, angle);
  }
  private static _rotateY_v1 = new Vector3(0, 1, 0);
  rotateY(angle: number): Object3D {
    const v1 = Object3D._rotateY_v1;
    return this.rotateOnAxis(v1, angle);
  }
  private static _rotateZ_v1 = new Vector3(0, 0, 1);
  rotateZ(angle: number): Object3D {
    const v1 = Object3D._rotateZ_v1;
    return this.rotateOnAxis(v1, angle);
  }
  private static _translateOnAxis_v1 = new Vector3();
  translateOnAxis(axis: Vector3, distance: number): Object3D {
    // translate object by distance along axis in object space
    // axis is assumed to be normalized
    const v1 = Object3D._translateOnAxis_v1;
    v1.copy(axis).applyQuaternion(this.quaternion);
    this.position.add(v1.multiplyScalar(distance));
    return this;
  }
  private static _translateX_v1 = new Vector3(1, 0, 0);
  translateX(distance: number): Object3D {
    const v1 = Object3D._translateX_v1;
    return this.translateOnAxis(v1, distance);
  }
  private static _translateY_v1 = new Vector3(0, 1, 0);
  translateY(distance: number): Object3D {
    const v1 = Object3D._translateY_v1;
    return this.translateOnAxis(v1, distance);
  }
  private static _translateZ_v1 = new Vector3(0, 0, 1);
  translateZ(distance: number): Object3D {
    const v1 = Object3D._translateZ_v1;
    return this.translateOnAxis(v1, distance);
  }
  localToWorld(vector: Vector3): Vector3 {
    return vector.applyMatrix4(this.matrixWorld);
  }
  private static _worldToLocal_m1 = new Matrix4();
  worldToLocal(vector: Vector3): Vector3 {
    const m1 = Object3D._worldToLocal_m1;
    return vector.applyMatrix4(m1.getInverse(this.matrixWorld));
  }
  private static _lookAt_m1 = new Matrix4();
  lookAt(vector: Vector3): void {
    // This routine does not support objects with rotated and/or translated parent(s)
    const m1 = Object3D._lookAt_m1;
    m1.lookAt(vector, this.position, this.up);
    this.quaternion.setFromRotationMatrix(m1);
  }
  add(object: Object3D): Object3D {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i ++) {
        this.add(arguments[i]);
      }
      return this;
    }
    if (object === this) {
      console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
      return this;
    }
    if ((object && object instanceof Object3D)) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      object.parent = this;
      object.dispatchEvent({ type: 'added' });
      this.children.push(object);
    } else {
      console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);
    }
    return this;
  }
  remove(object: Object3D): void {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i ++) {
        this.remove(arguments[i]);
      }
    }
    const index = this.children.indexOf(object);
    if (index !== - 1) {
      object.parent = null;
      object.dispatchEvent({ type: 'removed' });
      this.children.splice(index, 1);
    }
  }
  getObjectById(id: number): Object3D {
    return this.getObjectByProperty('id', id);
  }
  getObjectByName(name: string): Object3D {
    return this.getObjectByProperty('name', name);
  }
  getObjectByProperty(name: string, value: number | string): Object3D {
    if (this[name] === value) return this;
    for (let i = 0, l = this.children.length; i < l; i ++) {
      const child = this.children[i];
      const object = child.getObjectByProperty(name, value);
      if (object !== undefined) {
        return object;
      }
    }
    return undefined;
  }
  getWorldPosition(result: Vector3 = new Vector3()): Vector3 {
    this.updateMatrixWorld(true);
    return result.setFromMatrixPosition(this.matrixWorld);
  }
  private static _getWorldQuaternion_position = new Vector3();
  private static _getWorldQuaternion_scale = new Vector3();
  getWorldQuaternion(result: Quaternion = new Quaternion()): Quaternion {
    const position = Object3D._getWorldQuaternion_position;
    const scale = Object3D._getWorldQuaternion_scale;
    this.updateMatrixWorld(true);
    this.matrixWorld.decompose(position, result, scale);
    return result;
  }
  private static _getWorldRotation_quaternion = new Quaternion();
  getWorldRotation(result: Euler = new Euler()): Euler {
    const quaternion = Object3D._getWorldRotation_quaternion;
    this.getWorldQuaternion(quaternion);
    return result.setFromQuaternion(quaternion, this.rotation.order, false);
  }
  private static _getWorldScale_position = new Vector3();
  private static _getWorldScale_quaternion = new Quaternion();
  getWorldScale(result: Vector3 = new Vector3()): Vector3 {
    const position = Object3D._getWorldScale_position;
    const quaternion = Object3D._getWorldScale_quaternion;
    this.updateMatrixWorld(true);
    this.matrixWorld.decompose(position, quaternion, result);
    return result;
  }
  private static _getWorldDirection_quaternion = new Quaternion();
  getWorldDirection(result: Vector3 = new Vector3()): Vector3 {
    const quaternion = Object3D._getWorldDirection_quaternion;
    this.getWorldQuaternion(quaternion);
    return result.set(0, 0, 1).applyQuaternion(quaternion);
  }
  raycast(raycaster: Raycaster, intersects: Intersect[]): Intersect[] {
    return intersects;
  }
  traverse(callback: (object: Object3D) => void): void {
    callback(this);
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i ++) {
      children[i].traverse(callback);
    }
  }
  traverseVisible(callback: (object: Object3D) => void): void {
    if (this.visible === false) return;
    callback(this);
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i ++) {
      children[i].traverseVisible(callback);
    }
  }
  traverseAncestors(callback: (object: Object3D) => void): void {
    const parent = this.parent;
    if (parent !== null) {
      callback(parent);
      parent.traverseAncestors(callback);
    }
  }
  updateMatrix(): void {
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.matrixWorldNeedsUpdate = true;
  }
  updateMatrixWorld(force: boolean = false): void {
    if (this.matrixAutoUpdate === true) this.updateMatrix();
    if (this.matrixWorldNeedsUpdate === true || force === true) {
      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }
      this.matrixWorldNeedsUpdate = false;
      force = true;
    }
    // update children
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i ++) {
      children[i].updateMatrixWorld(force);
    }
  }
  toJSON(meta?: any): any {
    // meta is '' when called from JSON.stringify
    const isRootObject = (meta === undefined || meta === '');
    const output: any = {};
    // meta is a hash used to collect geometries, materials.
    // not providing it implies that this is the root object
    // being serialized.
    if (isRootObject) {
      // initialize meta obj
      meta = {
        geometries: {},
        materials: {},
        textures: {},
        images: {}
      };
      output.metadata = {
        version: 4.4,
        type: 'Object',
        generator: 'Object3D.toJSON'
      };
    }
    // standard Object3D serialization
    const object: any = {};
    object.uuid = this.uuid;
    object.type = this.type;
    if (this.name !== '') object.name = this.name;
    if (JSON.stringify(this.userData) !== '{}') object.userData = this.userData;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;
    object.matrix = this.matrix.toArray();
    //
    if (this.geometry !== undefined) {
      if (meta.geometries[this.geometry.uuid] === undefined) {
        meta.geometries[this.geometry.uuid] = this.geometry.toJSON(meta);
      }
      object.geometry = this.geometry.uuid;
    }
    if (this.material !== undefined) {
      if (meta.materials[this.material.uuid] === undefined) {
        meta.materials[this.material.uuid] = this.material.toJSON(meta);
      }
      object.material = this.material.uuid;
    }
    //
    if (this.children.length > 0) {
      object.children = [];
      for (let i = 0; i < this.children.length; i ++) {
        object.children.push(this.children[i].toJSON(meta).object);
      }
    }
    if (isRootObject) {
      const geometries = extractFromCache(meta.geometries);
      const materials = extractFromCache(meta.materials);
      const textures = extractFromCache(meta.textures);
      const images = extractFromCache(meta.images);
      if (geometries.length > 0) output.geometries = geometries;
      if (materials.length > 0) output.materials = materials;
      if (textures.length > 0) output.textures = textures;
      if (images.length > 0) output.images = images;
    }
    output.object = object;
    return output;
    // extract data from the cache hash
    // remove metadata on each item
    // and return as array
    function extractFromCache(cache: any) {
      const values = [];
      for (let key in cache) {
        const data = cache[key];
        delete data.metadata;
        values.push(data);
      }
      return values;
    }
  }
  clone(recursive: boolean = true): this {
    return new (this.constructor as any)().copy(this, recursive);
  }
  copy(source: this, recursive: boolean = true): this {
    this.name = source.name;
    this.up.copy(source.up);
    this.position.copy(source.position);
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);
    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);
    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
    this.visible = source.visible;
    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;
    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;
    this.userData = JSON.parse(JSON.stringify(source.userData));
    if (recursive === true) {
      for (let i = 0; i < source.children.length; i ++) {
        const child = source.children[i];
        this.add(child.clone());
      }
    }
    return this;
  }
  getChildByName(name: string): Object3D {
    console.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName().");
    return this.getObjectByName(name);
  }
  renderDepth(value: number): void {
    console.warn("THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.");
  }
  translate(distance: number, axis: Vector3): Object3D {
    console.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis(axis, distance) instead.");
    return this.translateOnAxis(axis, distance);
  }
  get eulerOrder(): string {
    console.warn("THREE.Object3D: .eulerOrder is now .rotation.order.");
    return this.rotation.order;
  }
  set eulerOrder(value: string) {
    console.warn("THREE.Object3D: .eulerOrder is now .rotation.order.");
    this.rotation.order = value;
  }
  get useQuaternion(): boolean {
    console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.");
    return true;
  }
  set useQuaternion(value: boolean) {
    console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.");
  }
}
let count = 0;
export function Object3DIdCount() { return count++; };
