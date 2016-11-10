import { Geometry } from "./Geometry";
import { EventDispatcher } from "./EventDispatcher";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Color } from "../math/Color";
import { Sphere } from "../math/Sphere";
import { Box3 } from "../math/Box3";
import { _Math } from "../math/Math";
import { GeometryIdCount } from "./Geometry";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class DirectGeometry extends EventDispatcher {
  id: number = GeometryIdCount();
  uuid: string = _Math.generateUUID();
  name: string = '';
  type: string = 'DirectGeometry';
  indices: number[] = [];
  vertices: Vector3[] = [];
  normals: Vector3[] = [];
  colors: Color[] = [];
  uvs: Vector2[] = [];
  uvs2: Vector2[] = [];
  groups: any[] = [];
  morphTargets: any = { position: undefined, normal: undefined };
  skinWeights: Vector4[] = [];
  skinIndices: Vector4[] = [];
  // lineDistances: number[] = [];
  boundingBox: Box3 = null;
  boundingSphere: Sphere = null;
  // update flags
  verticesNeedUpdate: boolean = false;
  normalsNeedUpdate: boolean = false;
  colorsNeedUpdate: boolean = false;
  uvsNeedUpdate: boolean = false;
  groupsNeedUpdate: boolean = false;
  constructor() {
    super();
  }
  computeBoundingBox(): void {
    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }
    this.boundingBox.setFromPoints(this.vertices);
  }
  computeBoundingSphere(): void {
    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere();
    }
    this.boundingSphere.setFromPoints(this.vertices);
  }
  computeFaceNormals(): void {
    console.warn('THREE.DirectGeometry: computeFaceNormals() is not a method of this type of geometry.');
  }
  computeVertexNormals(): void {
    console.warn('THREE.DirectGeometry: computeVertexNormals() is not a method of this type of geometry.');
  }
  computeGroups(geometry: Geometry): void {
    let group: any;
    const groups = [];
    let materialIndex;
    const faces = geometry.faces;
    let i;
    for (i = 0; i < faces.length; i ++) {
      const face = faces[i];
      // materials
      if (face.materialIndex !== materialIndex) {
        materialIndex = face.materialIndex;
        if (group !== undefined) {
          group.count = (i * 3) - group.start;
          groups.push(group);
        }
        group = {
          start: i * 3,
          materialIndex: materialIndex
        };
      }
    }
    if (group !== undefined) {
      group.count = (i * 3) - group.start;
      groups.push(group);
    }
    this.groups = groups;
  }
  fromGeometry(geometry: Geometry) {
    const faces = geometry.faces;
    const vertices = geometry.vertices;
    const faceVertexUvs = geometry.faceVertexUvs;
    const hasFaceVertexUv = faceVertexUvs[0] && faceVertexUvs[0].length > 0;
    const hasFaceVertexUv2 = faceVertexUvs[1] && faceVertexUvs[1].length > 0;
    // morphs
    const morphTargets = geometry.morphTargets;
    const morphTargetsLength = morphTargets.length;
    let morphTargetsPosition;
    if (morphTargetsLength > 0) {
      morphTargetsPosition = [];
      for (let i = 0; i < morphTargetsLength; i ++) {
        morphTargetsPosition[i] = [];
      }
      this.morphTargets.position = morphTargetsPosition;
    }
    const morphNormals = geometry.morphNormals;
    const morphNormalsLength = morphNormals.length;
    let morphTargetsNormal;
    if (morphNormalsLength > 0) {
      morphTargetsNormal = [];
      for (let i = 0; i < morphNormalsLength; i ++) {
        morphTargetsNormal[i] = [];
      }
      this.morphTargets.normal = morphTargetsNormal;
    }
    // skins
    const skinIndices = geometry.skinIndices;
    const skinWeights = geometry.skinWeights;
    const hasSkinIndices = skinIndices.length === vertices.length;
    const hasSkinWeights = skinWeights.length === vertices.length;
    //
    for (let i = 0; i < faces.length; i ++) {
      const face = faces[i];
      this.vertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
      const vertexNormals = face.vertexNormals;
      if (vertexNormals.length === 3) {
        this.normals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
      } else {
        const normal = face.normal;
        this.normals.push(normal, normal, normal);
      }
      const vertexColors = face.vertexColors;
      if (vertexColors.length === 3) {
        this.colors.push(vertexColors[0], vertexColors[1], vertexColors[2]);
      } else {
        const color = face.color;
        this.colors.push(color, color, color);
      }
      if (hasFaceVertexUv === true) {
        const vertexUvs = faceVertexUvs[0][i];
        if (vertexUvs !== undefined) {
          this.uvs.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
        } else {
          console.warn('THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ', i);
          this.uvs.push(new Vector2(), new Vector2(), new Vector2());
        }
      }
      if (hasFaceVertexUv2 === true) {
        const vertexUvs = faceVertexUvs[1][i];
        if (vertexUvs !== undefined) {
          this.uvs2.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
        } else {
          console.warn('THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ', i);
          this.uvs2.push(new Vector2(), new Vector2(), new Vector2());
        }
      }
      // morphs
      for (let j = 0; j < morphTargetsLength; j ++) {
        const morphTarget = morphTargets[j].vertices;
        morphTargetsPosition[j].push(morphTarget[face.a], morphTarget[face.b], morphTarget[face.c]);
      }
      for (let j = 0; j < morphNormalsLength; j ++) {
        const morphNormal = morphNormals[j].vertexNormals[i];
        morphTargetsNormal[j].push(morphNormal.a, morphNormal.b, morphNormal.c);
      }
      // skins
      if (hasSkinIndices) {
        this.skinIndices.push(skinIndices[face.a], skinIndices[face.b], skinIndices[face.c]);
      }
      if (hasSkinWeights) {
        this.skinWeights.push(skinWeights[face.a], skinWeights[face.b], skinWeights[face.c]);
      }
    }
    this.computeGroups(geometry);
    this.verticesNeedUpdate = geometry.verticesNeedUpdate;
    this.normalsNeedUpdate = geometry.normalsNeedUpdate;
    this.colorsNeedUpdate = geometry.colorsNeedUpdate;
    this.uvsNeedUpdate = geometry.uvsNeedUpdate;
    this.groupsNeedUpdate = geometry.groupsNeedUpdate;
    return this;
  }
  dispose(): void {
    this.dispatchEvent({ type: 'dispose' });
  }
}
