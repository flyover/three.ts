import { EventDispatcher } from "./EventDispatcher";
import { Face3 } from "./Face3";
import { Matrix3 } from "../math/Matrix3";
import { Sphere } from "../math/Sphere";
import { Box3 } from "../math/Box3";
import { Vector3 } from "../math/Vector3";
import { Matrix4 } from "../math/Matrix4";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { Color } from "../math/Color";
import { Object3D } from "./Object3D";
import { _Math } from "../math/Math";
import { Mesh } from "../objects/Mesh";
import { BufferGeometry } from "./BufferGeometry";
import { Bone } from "../objects/Bone";
import { AnimationClip } from "../animation/AnimationClip";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author kile / http://kile.stravaganza.org/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author bhouston / http://clara.io
 */
export class Geometry extends EventDispatcher {
  id: number = GeometryIdCount();
  uuid: string = _Math.generateUUID();
  name: string = '';
  type: string = 'Geometry';
  vertices: Vector3[] = [];
  colors: Color[] = [];
  faces: Face3[] = [];
  faceVertexUvs: Vector2[][][] = [[]];
  morphTargets: any[] = [];
  morphNormals: any[] = [];
  skinWeights: Vector4[] = [];
  skinIndices: Vector4[] = [];
  lineDistances: number[] = [];
  boundingBox: Box3 = null;
  boundingSphere: Sphere = null;
  // update flags
  elementsNeedUpdate: boolean = false;
  verticesNeedUpdate: boolean = false;
  uvsNeedUpdate: boolean = false;
  normalsNeedUpdate: boolean = false;
  colorsNeedUpdate: boolean = false;
  lineDistancesNeedUpdate: boolean = false;
  groupsNeedUpdate: boolean = false;
  parameters: any = undefined;
  // {
  bones: Bone[]; // JSONLoader, ObjectLoader, SkinnedMesh
  animations: AnimationClip[]; // JSONLoader
  dynamic: boolean; // SkeletonHelper
  _bufferGeometry: BufferGeometry; // WebGLGeometries
  // }
  readonly isGeometry: boolean = true;
  readonly isBufferGeometry: boolean = false;
  constructor() {
    super();
  }
  applyMatrix(matrix: Matrix4): Geometry {
    const normalMatrix = new Matrix3().getNormalMatrix(matrix);
    for (let i = 0, il = this.vertices.length; i < il; i ++) {
      const vertex = this.vertices[i];
      vertex.applyMatrix4(matrix);
    }
    for (let i = 0, il = this.faces.length; i < il; i ++) {
      const face = this.faces[i];
      face.normal.applyMatrix3(normalMatrix).normalize();
      for (let j = 0, jl = face.vertexNormals.length; j < jl; j ++) {
        face.vertexNormals[j].applyMatrix3(normalMatrix).normalize();
      }
    }
    if (this.boundingBox !== null) {
      this.computeBoundingBox();
    }
    if (this.boundingSphere !== null) {
      this.computeBoundingSphere();
    }
    this.verticesNeedUpdate = true;
    this.normalsNeedUpdate = true;
    return this;
  }
  rotateX(angle: number): Geometry {
    // rotate geometry around world x-axis
    const m1 = new Matrix4();
    //return function rotateX(angle) {
      m1.makeRotationX(angle);
      this.applyMatrix(m1);
      return this;
    //};
  }
  rotateY(angle: number): Geometry {
    // rotate geometry around world y-axis
    const m1 = new Matrix4();
    //return function rotateY(angle) {
      m1.makeRotationY(angle);
      this.applyMatrix(m1);
      return this;
    //};
  }
  rotateZ(angle: number): Geometry {
    // rotate geometry around world z-axis
    const m1 = new Matrix4();
    //return function rotateZ(angle) {
      m1.makeRotationZ(angle);
      this.applyMatrix(m1);
      return this;
    //};
  }
  translate(x: number, y: number, z: number): Geometry {
    // translate geometry
    const m1 = new Matrix4();
    //return function translate(x, y, z) {
      m1.makeTranslation(x, y, z);
      this.applyMatrix(m1);
      return this;
    //};
  }
  scale(x: number, y: number, z: number): Geometry {
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
  fromBufferGeometry(geometry: BufferGeometry): Geometry {
    const scope = this;
    const indices = geometry.index !== null ? geometry.index.array : undefined;
    const attributes = geometry.attributes;
    const positions = attributes.position.array;
    const normals = attributes.normal !== undefined ? attributes.normal.array : undefined;
    const colors = attributes.color !== undefined ? attributes.color.array : undefined;
    const uvs = attributes.uv !== undefined ? attributes.uv.array : undefined;
    const uvs2 = attributes.uv2 !== undefined ? attributes.uv2.array : undefined;
    if (uvs2 !== undefined) this.faceVertexUvs[1] = [];
    const tempNormals: any[] = [];
    const tempUVs: any[] = [];
    const tempUVs2: any[] = [];
    for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
      scope.vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]));
      if (normals !== undefined) {
        tempNormals.push(new Vector3(normals[i], normals[i + 1], normals[i + 2]));
      }
      if (colors !== undefined) {
        scope.colors.push(new Color(colors[i], colors[i + 1], colors[i + 2]));
      }
      if (uvs !== undefined) {
        tempUVs.push(new Vector2(uvs[j], uvs[j + 1]));
      }
      if (uvs2 !== undefined) {
        tempUVs2.push(new Vector2(uvs2[j], uvs2[j + 1]));
      }
    }
    function addFace(a: number, b: number, c: number, materialIndex?: number): void {
      const vertexNormals: Vector3[] = normals !== undefined ? [ tempNormals[a].clone(), tempNormals[b].clone(), tempNormals[c].clone() ] : [];
      const vertexColors: Color[] = colors !== undefined ? [ scope.colors[a].clone(), scope.colors[b].clone(), scope.colors[c].clone() ] : [];
      const face = new Face3(a, b, c, vertexNormals, vertexColors, materialIndex);
      scope.faces.push(face);
      if (uvs !== undefined) {
        scope.faceVertexUvs[0].push([tempUVs[a].clone(), tempUVs[b].clone(), tempUVs[c].clone()]);
      }
      if (uvs2 !== undefined) {
        scope.faceVertexUvs[1].push([tempUVs2[a].clone(), tempUVs2[b].clone(), tempUVs2[c].clone()]);
      }
    }
    if (indices !== undefined) {
      const groups = geometry.groups;
      if (groups.length > 0) {
        for (let i = 0; i < groups.length; i ++) {
          const group = groups[i];
          const start = group.start;
          const count = group.count;
          for (let j = start, jl = start + count; j < jl; j += 3) {
            addFace(indices[j], indices[j + 1], indices[j + 2], group.materialIndex);
          }
        }
      } else {
        for (let i = 0; i < indices.length; i += 3) {
          addFace(indices[i], indices[i + 1], indices[i + 2]);
        }
      }
    } else {
      for (let i = 0; i < positions.length / 3; i += 3) {
        addFace(i, i + 1, i + 2);
      }
    }
    this.computeFaceNormals();
    if (geometry.boundingBox !== null) {
      this.boundingBox = geometry.boundingBox.clone();
    }
    if (geometry.boundingSphere !== null) {
      this.boundingSphere = geometry.boundingSphere.clone();
    }
    return this;
  }
  center(): Vector3 {
    this.computeBoundingBox();
    const offset = this.boundingBox.getCenter().negate();
    this.translate(offset.x, offset.y, offset.z);
    return offset;
  }
  normalize(): Geometry {
    this.computeBoundingSphere();
    const center = this.boundingSphere.center;
    const radius = this.boundingSphere.radius;
    const s = radius === 0 ? 1 : 1.0 / radius;
    const matrix = new Matrix4();
    matrix.set(
      s, 0, 0, - s * center.x,
      0, s, 0, - s * center.y,
      0, 0, s, - s * center.z,
      0, 0, 0, 1
    );
    this.applyMatrix(matrix);
    return this;
  }
  computeFaceNormals(): void {
    const cb = new Vector3(), ab = new Vector3();
    for (let f = 0, fl = this.faces.length; f < fl; f ++) {
      const face = this.faces[f];
      const vA = this.vertices[face.a];
      const vB = this.vertices[face.b];
      const vC = this.vertices[face.c];
      cb.subVectors(vC, vB);
      ab.subVectors(vA, vB);
      cb.cross(ab);
      cb.normalize();
      face.normal.copy(cb);
    }
  }
  computeVertexNormals(areaWeighted: boolean = true): void {
    let v, vl, f, fl, face, vertices;
    vertices = new Array(this.vertices.length);
    for (v = 0, vl = this.vertices.length; v < vl; v ++) {
      vertices[v] = new Vector3();
    }
    if (areaWeighted) {
      // vertex normals weighted by triangle areas
      // http://www.iquilezles.org/www/articles/normals/normals.htm
      let vA, vB, vC;
      const cb = new Vector3(), ab = new Vector3();
      for (f = 0, fl = this.faces.length; f < fl; f ++) {
        face = this.faces[f];
        vA = this.vertices[face.a];
        vB = this.vertices[face.b];
        vC = this.vertices[face.c];
        cb.subVectors(vC, vB);
        ab.subVectors(vA, vB);
        cb.cross(ab);
        vertices[face.a].add(cb);
        vertices[face.b].add(cb);
        vertices[face.c].add(cb);
      }
    } else {
      this.computeFaceNormals();
      for (f = 0, fl = this.faces.length; f < fl; f ++) {
        face = this.faces[f];
        vertices[face.a].add(face.normal);
        vertices[face.b].add(face.normal);
        vertices[face.c].add(face.normal);
      }
    }
    for (v = 0, vl = this.vertices.length; v < vl; v ++) {
      vertices[v].normalize();
    }
    for (f = 0, fl = this.faces.length; f < fl; f ++) {
      face = this.faces[f];
      const vertexNormals = face.vertexNormals;
      if (vertexNormals.length === 3) {
        vertexNormals[0].copy(vertices[face.a]);
        vertexNormals[1].copy(vertices[face.b]);
        vertexNormals[2].copy(vertices[face.c]);
      } else {
        vertexNormals[0] = vertices[face.a].clone();
        vertexNormals[1] = vertices[face.b].clone();
        vertexNormals[2] = vertices[face.c].clone();
      }
    }
    if (this.faces.length > 0) {
      this.normalsNeedUpdate = true;
    }
  }
  computeFlatVertexNormals() {
    this.computeFaceNormals();
    for (let f = 0, fl = this.faces.length; f < fl; f ++) {
      const face = this.faces[ f ];
      const vertexNormals = face.vertexNormals;
      if (vertexNormals.length === 3) {
        vertexNormals[ 0 ].copy(face.normal);
        vertexNormals[ 1 ].copy(face.normal);
        vertexNormals[ 2 ].copy(face.normal);
      } else {
        vertexNormals[ 0 ] = face.normal.clone();
        vertexNormals[ 1 ] = face.normal.clone();
        vertexNormals[ 2 ] = face.normal.clone();
      }
    }
    if (this.faces.length > 0) {
      this.normalsNeedUpdate = true;
    }
  }
  computeMorphNormals(): void {
    let i, il, f, fl, face;
    // save original normals
    // - create temp variables on first access
    //   otherwise just copy (for faster repeated calls)
    for (f = 0, fl = this.faces.length; f < fl; f ++) {
      face = this.faces[f];
      if (! face.__originalFaceNormal) {
        face.__originalFaceNormal = face.normal.clone();
      } else {
        face.__originalFaceNormal.copy(face.normal);
      }
      if (! face.__originalVertexNormals) face.__originalVertexNormals = [];
      for (i = 0, il = face.vertexNormals.length; i < il; i ++) {
        if (! face.__originalVertexNormals[i]) {
          face.__originalVertexNormals[i] = face.vertexNormals[i].clone();
        } else {
          face.__originalVertexNormals[i].copy(face.vertexNormals[i]);
        }
      }
    }
    // use temp geometry to compute face and vertex normals for each morph
    const tmpGeo = new Geometry();
    tmpGeo.faces = this.faces;
    for (i = 0, il = this.morphTargets.length; i < il; i ++) {
      // create on first access
      if (! this.morphNormals[i]) {
        this.morphNormals[i] = {};
        this.morphNormals[i].faceNormals = [];
        this.morphNormals[i].vertexNormals = [];
        const dstNormalsFace = this.morphNormals[i].faceNormals;
        const dstNormalsVertex = this.morphNormals[i].vertexNormals;
        let faceNormal, vertexNormals;
        for (f = 0, fl = this.faces.length; f < fl; f ++) {
          faceNormal = new Vector3();
          vertexNormals = { a: new Vector3(), b: new Vector3(), c: new Vector3() };
          dstNormalsFace.push(faceNormal);
          dstNormalsVertex.push(vertexNormals);
        }
      }
      const morphNormals = this.morphNormals[i];
      // set vertices to morph target
      tmpGeo.vertices = this.morphTargets[i].vertices;
      // compute morph normals
      tmpGeo.computeFaceNormals();
      tmpGeo.computeVertexNormals();
      // store morph normals
      let faceNormal, vertexNormals;
      for (f = 0, fl = this.faces.length; f < fl; f ++) {
        face = this.faces[f];
        faceNormal = morphNormals.faceNormals[f];
        vertexNormals = morphNormals.vertexNormals[f];
        faceNormal.copy(face.normal);
        vertexNormals.a.copy(face.vertexNormals[0]);
        vertexNormals.b.copy(face.vertexNormals[1]);
        vertexNormals.c.copy(face.vertexNormals[2]);
      }
    }
    // restore original normals
    for (f = 0, fl = this.faces.length; f < fl; f ++) {
      face = this.faces[f];
      face.normal = face.__originalFaceNormal;
      face.vertexNormals = face.__originalVertexNormals;
    }
  }
  computeTangents(): void {
    console.warn('THREE.Geometry: .computeTangents() has been removed.');
  }
  computeLineDistances(): void {
    let d = 0;
    const vertices = this.vertices;
    for (let i = 0, il = vertices.length; i < il; i ++) {
      if (i > 0) {
        d += vertices[i].distanceTo(vertices[i - 1]);
      }
      this.lineDistances[i] = d;
    }
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
  merge(geometry: Geometry, matrix: any, materialIndexOffset: number = 0): void {
    let normalMatrix,
    vertexOffset = this.vertices.length,
    vertices1 = this.vertices,
    vertices2 = geometry.vertices,
    faces1 = this.faces,
    faces2 = geometry.faces,
    uvs1 = this.faceVertexUvs[0],
    uvs2 = geometry.faceVertexUvs[0],
    colors1 = this.colors,
    colors2 = geometry.colors;
    if (matrix !== undefined) {
      normalMatrix = new Matrix3().getNormalMatrix(matrix);
    }
    // vertices
    for (let i = 0, il = vertices2.length; i < il; i ++) {
      const vertex = vertices2[i];
      const vertexCopy = vertex.clone();
      if (matrix !== undefined) vertexCopy.applyMatrix4(matrix);
      vertices1.push(vertexCopy);
    }
    // colors
    for (let i = 0, il = colors2.length; i < il; i ++) {
      colors1.push(colors2[i].clone());
    }
    // faces
    for (let i = 0, il = faces2.length; i < il; i ++) {
      let face = faces2[i], faceCopy, normal, color,
      faceVertexNormals = face.vertexNormals,
      faceVertexColors = face.vertexColors;
      faceCopy = new Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
      faceCopy.normal.copy(face.normal);
      if (normalMatrix !== undefined) {
        faceCopy.normal.applyMatrix3(normalMatrix).normalize();
      }
      for (let j = 0, jl = faceVertexNormals.length; j < jl; j ++) {
        normal = faceVertexNormals[j].clone();
        if (normalMatrix !== undefined) {
          normal.applyMatrix3(normalMatrix).normalize();
        }
        faceCopy.vertexNormals.push(normal);
      }
      faceCopy.color.copy(face.color);
      for (let j = 0, jl = faceVertexColors.length; j < jl; j ++) {
        color = faceVertexColors[j];
        faceCopy.vertexColors.push(color.clone());
      }
      faceCopy.materialIndex = face.materialIndex + materialIndexOffset;
      faces1.push(faceCopy);
    }
    // uvs
    for (let i = 0, il = uvs2.length; i < il; i ++) {
      const uv = uvs2[i], uvCopy = [];
      if (uv === undefined) {
        continue;
      }
      for (let j = 0, jl = uv.length; j < jl; j ++) {
        uvCopy.push(uv[j].clone());
      }
      uvs1.push(uvCopy);
    }
  }
  mergeMesh(mesh: Mesh): void {
    if ((mesh && mesh instanceof Mesh) === false) {
      console.error('THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.', mesh);
      return;
    }
    mesh.matrixAutoUpdate && mesh.updateMatrix();
    if (mesh.geometry instanceof Geometry) {
      this.merge(mesh.geometry, mesh.matrix);
    }
  }
  /*
   * Checks for duplicate vertices with hashmap.
   * Duplicated vertices are removed
   * and faces' vertices are updated.
   */
  mergeVertices(): number {
    const verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
    const unique: any[] = [], changes: any[] = [];
    let v, key;
    const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
    const precision = Math.pow(10, precisionPoints);
    let i, il, face;
    let indices, j, jl;
    for (i = 0, il = this.vertices.length; i < il; i ++) {
      v = this.vertices[i];
      key = Math.round(v.x * precision) + '_' + Math.round(v.y * precision) + '_' + Math.round(v.z * precision);
      if (verticesMap[key] === undefined) {
        verticesMap[key] = i;
        unique.push(this.vertices[i]);
        changes[i] = unique.length - 1;
      } else {
        //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
        changes[i] = changes[verticesMap[key]];
      }
    }
    // if faces are completely degenerate after merging vertices, we
    // have to remove them from the geometry.
    const faceIndicesToRemove = [];
    for (i = 0, il = this.faces.length; i < il; i ++) {
      face = this.faces[i];
      face.a = changes[face.a];
      face.b = changes[face.b];
      face.c = changes[face.c];
      indices = [face.a, face.b, face.c];
      let dupIndex = - 1;
      // if any duplicate vertices are found in a Face3
      // we have to remove the face as nothing can be saved
      for (let n = 0; n < 3; n ++) {
        if (indices[n] === indices[(n + 1) % 3]) {
          dupIndex = n;
          faceIndicesToRemove.push(i);
          break;
        }
      }
    }
    for (i = faceIndicesToRemove.length - 1; i >= 0; i --) {
      const idx = faceIndicesToRemove[i];
      this.faces.splice(idx, 1);
      for (j = 0, jl = this.faceVertexUvs.length; j < jl; j ++) {
        this.faceVertexUvs[j].splice(idx, 1);
      }
    }
    // Use unique set of vertices
    const diff = this.vertices.length - unique.length;
    this.vertices = unique;
    return diff;
  }
  sortFacesByMaterialIndex(): void {
    const faces = this.faces;
    const length = faces.length;
    // tag faces
    for (let i = 0; i < length; i ++) {
      faces[i]._id = i;
    }
    // sort faces
    function materialIndexSort(a: any, b: any): number {
      return a.materialIndex - b.materialIndex;
    }
    faces.sort(materialIndexSort);
    // sort uvs
    const uvs1 = this.faceVertexUvs[0];
    const uvs2 = this.faceVertexUvs[1];
    let newUvs1: any[], newUvs2: any[];
    if (uvs1 && uvs1.length === length) newUvs1 = [];
    if (uvs2 && uvs2.length === length) newUvs2 = [];
    for (let i = 0; i < length; i ++) {
      const id = faces[i]._id;
      if (newUvs1) newUvs1.push(uvs1[id]);
      if (newUvs2) newUvs2.push(uvs2[id]);
    }
    if (newUvs1) this.faceVertexUvs[0] = newUvs1;
    if (newUvs2) this.faceVertexUvs[1] = newUvs2;
  }
  toJSON(meta: any): any {
    const data: any = {
      metadata: {
        version: 4.4,
        type: 'Geometry',
        generator: 'Geometry.toJSON'
      }
    };
    // standard Geometry serialization
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
    const vertices = [];
    for (let i = 0; i < this.vertices.length; i ++) {
      const vertex = this.vertices[i];
      vertices.push(vertex.x, vertex.y, vertex.z);
    }
    const faces: any[] = [];
    const normals: any[] = [];
    const normalsHash: any = {};
    const colors: any[] = [];
    const colorsHash = {};
    const uvs: any[] = [];
    const uvsHash = {};
    for (let i = 0; i < this.faces.length; i ++) {
      const face = this.faces[i];
      const hasMaterial = true;
      const hasFaceUv = false; // deprecated
      const hasFaceVertexUv = this.faceVertexUvs[0][i] !== undefined;
      const hasFaceNormal = face.normal.length() > 0;
      const hasFaceVertexNormal = face.vertexNormals.length > 0;
      const hasFaceColor = face.color.r !== 1 || face.color.g !== 1 || face.color.b !== 1;
      const hasFaceVertexColor = face.vertexColors.length > 0;
      let faceType = 0;
      faceType = setBit(faceType, 0, false); // isQuad
      faceType = setBit(faceType, 1, hasMaterial);
      faceType = setBit(faceType, 2, hasFaceUv);
      faceType = setBit(faceType, 3, hasFaceVertexUv);
      faceType = setBit(faceType, 4, hasFaceNormal);
      faceType = setBit(faceType, 5, hasFaceVertexNormal);
      faceType = setBit(faceType, 6, hasFaceColor);
      faceType = setBit(faceType, 7, hasFaceVertexColor);
      faces.push(faceType);
      faces.push(face.a, face.b, face.c);
      faces.push(face.materialIndex);
      if (hasFaceVertexUv) {
        const faceVertexUvs = this.faceVertexUvs[0][i];
        faces.push(
          getUvIndex(faceVertexUvs[0]),
          getUvIndex(faceVertexUvs[1]),
          getUvIndex(faceVertexUvs[2])
        );
      }
      if (hasFaceNormal) {
        faces.push(getNormalIndex(face.normal));
      }
      if (hasFaceVertexNormal) {
        const vertexNormals = face.vertexNormals;
        faces.push(
          getNormalIndex(vertexNormals[0]),
          getNormalIndex(vertexNormals[1]),
          getNormalIndex(vertexNormals[2])
        );
      }
      if (hasFaceColor) {
        faces.push(getColorIndex(face.color));
      }
      if (hasFaceVertexColor) {
        const vertexColors = face.vertexColors;
        faces.push(
          getColorIndex(vertexColors[0]),
          getColorIndex(vertexColors[1]),
          getColorIndex(vertexColors[2])
        );
      }
    }
    function setBit(value: number, position: number, enabled: boolean): number {
      return enabled ? value | (1 << position) : value & (~ (1 << position));
    }
    function getNormalIndex(normal: Vector3): any {
      const hash = normal.x.toString() + normal.y.toString() + normal.z.toString();
      if (normalsHash[hash] !== undefined) {
        return normalsHash[hash];
      }
      normalsHash[hash] = normals.length / 3;
      normals.push(normal.x, normal.y, normal.z);
      return normalsHash[hash];
    }
    function getColorIndex(color: Color): any {
      const hash = color.r.toString() + color.g.toString() + color.b.toString();
      if (colorsHash[hash] !== undefined) {
        return colorsHash[hash];
      }
      colorsHash[hash] = colors.length;
      colors.push(color.getHex());
      return colorsHash[hash];
    }
    function getUvIndex(uv: Vector2): any {
      const hash = uv.x.toString() + uv.y.toString();
      if (uvsHash[hash] !== undefined) {
        return uvsHash[hash];
      }
      uvsHash[hash] = uvs.length / 2;
      uvs.push(uv.x, uv.y);
      return uvsHash[hash];
    }
    data.data = {};
    data.data.vertices = vertices;
    data.data.normals = normals;
    if (colors.length > 0) data.data.colors = colors;
    if (uvs.length > 0) data.data.uvs = [uvs]; // temporal backward compatibility
    data.data.faces = faces;
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
    this.vertices = [];
    this.faces = [];
    this.faceVertexUvs = [[]];
    this.colors = [];
    const vertices = source.vertices;
    for (let i = 0, il = vertices.length; i < il; i ++) {
      this.vertices.push(vertices[i].clone());
    }
    const colors = source.colors;
    for (let i = 0, il = colors.length; i < il; i ++) {
      this.colors.push(colors[i].clone());
    }
    const faces = source.faces;
    for (let i = 0, il = faces.length; i < il; i ++) {
      this.faces.push(faces[i].clone());
    }
    for (let i = 0, il = source.faceVertexUvs.length; i < il; i ++) {
      const faceVertexUvs = source.faceVertexUvs[i];
      if (this.faceVertexUvs[i] === undefined) {
        this.faceVertexUvs[i] = [];
      }
      for (let j = 0, jl = faceVertexUvs.length; j < jl; j ++) {
        const uvs = faceVertexUvs[j], uvsCopy = [];
        for (let k = 0, kl = uvs.length; k < kl; k ++) {
          const uv = uvs[k];
          uvsCopy.push(uv.clone());
        }
        this.faceVertexUvs[i].push(uvsCopy);
      }
    }
    return this;
  }
  dispose(): void {
    this.dispatchEvent({ type: 'dispose' });
  }
}
let count: number = 0;
export function GeometryIdCount(): number { return count++; };
