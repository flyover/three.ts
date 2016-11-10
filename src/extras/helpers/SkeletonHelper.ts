import { LineSegments } from "../../objects/LineSegments";
import { Matrix4 } from "../../math/Matrix4";
import { ColorsMode } from "../../constants";
import { LineBasicMaterial } from "../../materials/LineBasicMaterial";
import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
import { Geometry } from "../../core/Geometry";
import { BufferGeometry } from "../../core/BufferGeometry";
import { Object3D } from "../../core/Object3D";
import { Bone } from "../../objects/Bone";
/**
 * @author Sean Griffin / http://twitter.com/sgrif
 * @author Michael Guerrero / http://realitymeltdown.com
 * @author mrdoob / http://mrdoob.com/
 * @author ikerr / http://verold.com
 */
export class SkeletonHelper extends LineSegments {
  bones: Bone[];
  root: Object3D;
  constructor(object: Object3D) {
    const bones: Bone[] = SkeletonHelper.getBoneList(object);
    const geometry: Geometry = new Geometry();
    for (let i = 0; i < bones.length; i ++) {
      const bone: Bone = bones[i];
      if ((bone.parent && bone.parent instanceof Bone)) {
        geometry.vertices.push(new Vector3());
        geometry.vertices.push(new Vector3());
        geometry.colors.push(new Color(0, 0, 1));
        geometry.colors.push(new Color(0, 1, 0));
      }
    }
    geometry.dynamic = true;
    const material = new LineBasicMaterial({ vertexColors: ColorsMode.Vertex, depthTest: false, depthWrite: false, transparent: true });
    super(geometry, material);
    this.bones = bones;
    this.root = object;
    this.matrix = object.matrixWorld;
    this.matrixAutoUpdate = false;
    this.update();
  }
  static getBoneList(object: Object3D): Bone[] {
    const boneList: Bone[] = [];
    if ((object && object instanceof Bone)) {
      boneList.push(object);
    }
    for (let i = 0; i < object.children.length; i ++) {
      boneList.push.apply(boneList, SkeletonHelper.getBoneList(object.children[i]));
    }
    return boneList;
  }
  getBonesList(object: Object3D): Bone[] {
    return SkeletonHelper.getBoneList(object);
  }
  update(): void {
    const geometry: Geometry | BufferGeometry = this.geometry;
    if (geometry instanceof Geometry) {
      const matrixWorldInv = new Matrix4().getInverse(this.root.matrixWorld);
      const boneMatrix = new Matrix4();
      let j = 0;
      for (let i = 0; i < this.bones.length; i ++) {
        const bone: Bone = this.bones[i];
        if ((bone.parent && bone.parent instanceof Bone)) {
          boneMatrix.multiplyMatrices(matrixWorldInv, bone.matrixWorld);
          geometry.vertices[j].setFromMatrixPosition(boneMatrix);
          boneMatrix.multiplyMatrices(matrixWorldInv, bone.parent.matrixWorld);
          geometry.vertices[j + 1].setFromMatrixPosition(boneMatrix);
          j += 2;
        }
      }
      geometry.verticesNeedUpdate = true;
      geometry.computeBoundingSphere();
    }
  }
}
