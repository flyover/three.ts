import { Mesh } from "./Mesh";
import { Vector4 } from "../math/Vector4";
import { Skeleton } from "./Skeleton";
import { Bone } from "./Bone";
import { Matrix4 } from "../math/Matrix4";
import { Geometry } from "../core/Geometry";
import { BufferGeometry } from "../core/BufferGeometry";
import { Material } from "../materials/Material";
import { MultiMaterial } from "../materials/MultiMaterial";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */
export class SkinnedMesh extends Mesh {
  bindMode: string = "attached";
  bindMatrix: Matrix4 = new Matrix4();
  bindMatrixInverse: Matrix4 = new Matrix4();
  skeleton: Skeleton;
  mixer;
  ikSolver;
  grantSolver;
  physics;
  readonly isSkinnedMesh: boolean = true;
  constructor(geometry: Geometry | BufferGeometry, material: Material | MultiMaterial, useVertexTexture: boolean = true) {
    super(geometry, material);
    this.type = 'SkinnedMesh';
    // init bones
    // TODO: remove bone creation as there is no reason (other than
    // convenience) for THREE.SkinnedMesh to do this.
    let bones = [];
    if (this.geometry && this.geometry.bones !== undefined) {
      let bone, gbone;
      for (let b = 0, bl = this.geometry.bones.length; b < bl; ++ b) {
        gbone = this.geometry.bones[ b ];
        bone = new Bone(this);
        bones.push(bone);
        bone.name = gbone.name;
        bone.position.fromArray(gbone.pos);
        bone.quaternion.fromArray(gbone.rotq);
        if (gbone.scl !== undefined) bone.scale.fromArray(gbone.scl);
      }
      for (let b = 0, bl = this.geometry.bones.length; b < bl; ++ b) {
        gbone = this.geometry.bones[ b ];
        if (gbone.parent !== - 1 && gbone.parent !== null &&
            bones[ gbone.parent ] !== undefined) {
          bones[ gbone.parent ].add(bones[ b ]);
        } else {
          this.add(bones[ b ]);
        }
      }
    }
    this.normalizeSkinWeights();
    this.updateMatrixWorld(true);
    this.bind(new Skeleton(bones, undefined, useVertexTexture), this.matrixWorld);
  }
  bind(skeleton: Skeleton, bindMatrix: Matrix4): void {
    this.skeleton = skeleton;
    if (bindMatrix === undefined) {
      this.updateMatrixWorld(true);
      this.skeleton.calculateInverses();
      bindMatrix = this.matrixWorld;
    }
    this.bindMatrix.copy(bindMatrix);
    this.bindMatrixInverse.getInverse(bindMatrix);
  }
  pose(): void {
    this.skeleton.pose();
  }
  normalizeSkinWeights(): void {
    if ((this.geometry && this.geometry instanceof Geometry)) {
      for (let i = 0; i < this.geometry.skinWeights.length; i ++) {
        let sw = this.geometry.skinWeights[ i ];
        let scale = 1.0 / sw.lengthManhattan();
        if (scale !== Infinity) {
          sw.multiplyScalar(scale);
        } else {
          sw.set(1, 0, 0, 0); // do something reasonable
        }
      }
    } else if ((this.geometry && this.geometry instanceof BufferGeometry)) {
      let vec = new Vector4();
      let skinWeight = this.geometry.attributes.skinWeight;
      for (let i = 0; i < skinWeight.count; i ++) {
        vec.x = skinWeight.getX(i);
        vec.y = skinWeight.getY(i);
        vec.z = skinWeight.getZ(i);
        vec.w = skinWeight.getW(i);
        let scale = 1.0 / vec.lengthManhattan();
        if (scale !== Infinity) {
          vec.multiplyScalar(scale);
        } else {
          vec.set(1, 0, 0, 0); // do something reasonable
        }
        skinWeight.setXYZW(i, vec.x, vec.y, vec.z, vec.w);
      }
    }
  }
  updateMatrixWorld(force: boolean): void {
    super.updateMatrixWorld(true);
    if (this.bindMode === "attached") {
      this.bindMatrixInverse.getInverse(this.matrixWorld);
    } else if (this.bindMode === "detached") {
      this.bindMatrixInverse.getInverse(this.bindMatrix);
    } else {
      console.warn('THREE.SkinnedMesh unrecognized bindMode: ' + this.bindMode);
    }
  }
  clone(): this {
    return new (this.constructor as any)(this.geometry, this.material, this.skeleton.useVertexTexture).copy(this);
  }
}
