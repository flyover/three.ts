import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { Sphere } from "../math/Sphere";
import { Ray } from "../math/Ray";
import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../core/Object3D";
import { Triangle } from "../math/Triangle";
import { Face3 } from "../core/Face3";
import { SideMode, DrawMode } from "../constants";
import { Geometry } from "../core/Geometry";
import { Material } from "../materials/Material";
import { MultiMaterial } from "../materials/MultiMaterial";
import { MeshBasicMaterial } from "../materials/MeshBasicMaterial";
import { BufferGeometry } from "../core/BufferGeometry";
import { Raycaster, Intersect } from "../core/Raycaster";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 */
export class Mesh extends Object3D {
  drawMode: DrawMode = DrawMode.Triangles;
  morphTargetInfluences: number[];
  morphTargetDictionary: any;
  readonly isMesh: boolean = true;
  constructor(geometry: Geometry | BufferGeometry = new BufferGeometry(), material: Material | MultiMaterial = new MeshBasicMaterial({ color: Math.random() * 0xffffff })) {
    super();
    this.type = 'Mesh';
    this.geometry = geometry;
    this.material = material;
    this.updateMorphTargets();
  }
  setDrawMode(value: DrawMode): void {
    this.drawMode = value;
  }
  copy(source: this): this {
    super.copy(source);
    this.drawMode = source.drawMode;
    return this;
  }
  updateMorphTargets(): void {
    let morphTargets = this.geometry.morphTargets;
    if (morphTargets !== undefined && morphTargets.length > 0) {
      this.morphTargetInfluences = [];
      this.morphTargetDictionary = {};
      for (let m = 0, ml = morphTargets.length; m < ml; m ++) {
        this.morphTargetInfluences.push(0);
        this.morphTargetDictionary[morphTargets[m].name] = m;
      }
    }
  }
  raycast(raycaster: Raycaster, intersects: Intersect[]): Intersect[] {
    let inverseMatrix = new Matrix4();
    let ray = new Ray();
    let sphere = new Sphere();
    let vA = new Vector3();
    let vB = new Vector3();
    let vC = new Vector3();
    let tempA = new Vector3();
    let tempB = new Vector3();
    let tempC = new Vector3();
    let uvA = new Vector2();
    let uvB = new Vector2();
    let uvC = new Vector2();
    let barycoord = new Vector3();
    let intersectionPoint = new Vector3();
    let intersectionPointWorld = new Vector3();
    function uvIntersection(point: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, uv1: Vector2, uv2: Vector2, uv3: Vector2): Vector2 {
      Triangle.barycoordFromPoint(point, p1, p2, p3, barycoord);
      uv1.multiplyScalar(barycoord.x);
      uv2.multiplyScalar(barycoord.y);
      uv3.multiplyScalar(barycoord.z);
      uv1.add(uv2).add(uv3);
      return uv1.clone();
    }
    function checkIntersection(object: Object3D, raycaster: Raycaster, ray: Ray, pA: Vector3, pB: Vector3, pC: Vector3, point: Vector3): Intersect {
      let intersect;
      let material = object.material;
      if (material.side === SideMode.Back) {
        intersect = ray.intersectTriangle(pC, pB, pA, true, point);
      } else {
        intersect = ray.intersectTriangle(pA, pB, pC, material.side !== SideMode.Double, point);
      }
      if (intersect === null) return null;
      intersectionPointWorld.copy(point);
      intersectionPointWorld.applyMatrix4(object.matrixWorld);
      let distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);
      if (distance < raycaster.near || distance > raycaster.far) return null;
      return {
        distance: distance,
        point: intersectionPointWorld.clone(),
        index: 0,
        face: null,
        faceIndex: 0,
        uv: null,
        object: object
      };
    }
    function checkBufferGeometryIntersection(object: Object3D, raycaster: Raycaster, ray: Ray, positions: number[], uvs: number[], a: number, b: number, c: number): Intersect {
      vA.fromArray(positions, a * 3);
      vB.fromArray(positions, b * 3);
      vC.fromArray(positions, c * 3);
      let intersection = checkIntersection(object, raycaster, ray, vA, vB, vC, intersectionPoint);
      if (intersection) {
        if (uvs) {
          uvA.fromArray(uvs, a * 2);
          uvB.fromArray(uvs, b * 2);
          uvC.fromArray(uvs, c * 2);
          intersection.uv = uvIntersection(intersectionPoint,  vA, vB, vC,  uvA, uvB, uvC);
        }
        intersection.face = new Face3(a, b, c, Triangle.normal(vA, vB, vC));
        intersection.faceIndex = a;
      }
      return intersection;
    }
    //return function raycast(raycaster, intersects) {
      let geometry = this.geometry;
      let material = this.material;
      let matrixWorld = this.matrixWorld;
      if (material === undefined) return intersects;
      // Checking boundingSphere distance to ray
      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
      sphere.copy(geometry.boundingSphere);
      sphere.applyMatrix4(matrixWorld);
      if (raycaster.ray.intersectsSphere(sphere) === false) return intersects;
      //
      inverseMatrix.getInverse(matrixWorld);
      ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
      // Check boundingBox before continuing
      if (geometry.boundingBox !== null) {
        if (ray.intersectsBox(geometry.boundingBox) === false) return intersects;
      }
      let uvs, intersection;
      if ((geometry && geometry instanceof BufferGeometry)) {
        let a, b, c;
        let index = geometry.index;
        let attributes = geometry.attributes;
        let positions = attributes.position.array;
        if (attributes.uv !== undefined) {
          uvs = attributes.uv.array;
        }
        if (index !== null) {
          let indices = index.array;
          for (let i = 0, l = indices.length; i < l; i += 3) {
            a = indices[i];
            b = indices[i + 1];
            c = indices[i + 2];
            intersection = checkBufferGeometryIntersection(this, raycaster, ray, positions, uvs, a, b, c);
            if (intersection) {
              intersection.faceIndex = Math.floor(i / 3); // triangle number in indices buffer semantics
              intersects.push(intersection);
            }
          }
        } else {
          for (let i = 0, l = positions.length; i < l; i += 9) {
            a = i / 3;
            b = a + 1;
            c = a + 2;
            intersection = checkBufferGeometryIntersection(this, raycaster, ray, positions, uvs, a, b, c);
            if (intersection) {
              intersection.index = a; // triangle number in positions buffer semantics
              intersects.push(intersection);
            }
          }
        }
      } else if ((geometry && geometry instanceof Geometry)) {
        let fvA, fvB, fvC;
        let isFaceMaterial = (material && material instanceof MultiMaterial);
        let materials = isFaceMaterial === true ? material.materials : null;
        let vertices = geometry.vertices;
        let faces = geometry.faces;
        let faceVertexUvs = geometry.faceVertexUvs[0];
        if (faceVertexUvs.length > 0) uvs = faceVertexUvs;
        for (let f = 0, fl = faces.length; f < fl; f ++) {
          let face = faces[f];
          let faceMaterial = isFaceMaterial === true ? materials[face.materialIndex] : material;
          if (faceMaterial === undefined) continue;
          fvA = vertices[face.a];
          fvB = vertices[face.b];
          fvC = vertices[face.c];
          if (faceMaterial.morphTargets === true) {
            let morphTargets = geometry.morphTargets;
            let morphInfluences = this.morphTargetInfluences;
            vA.set(0, 0, 0);
            vB.set(0, 0, 0);
            vC.set(0, 0, 0);
            for (let t = 0, tl = morphTargets.length; t < tl; t ++) {
              let influence = morphInfluences[t];
              if (influence === 0) continue;
              let targets = morphTargets[t].vertices;
              vA.addScaledVector(tempA.subVectors(targets[face.a], fvA), influence);
              vB.addScaledVector(tempB.subVectors(targets[face.b], fvB), influence);
              vC.addScaledVector(tempC.subVectors(targets[face.c], fvC), influence);
            }
            vA.add(fvA);
            vB.add(fvB);
            vC.add(fvC);
            fvA = vA;
            fvB = vB;
            fvC = vC;
          }
          intersection = checkIntersection(this, raycaster, ray, fvA, fvB, fvC, intersectionPoint);
          if (intersection) {
            if (uvs) {
              let uvs_f = uvs[f];
              uvA.copy(uvs_f[0]);
              uvB.copy(uvs_f[1]);
              uvC.copy(uvs_f[2]);
              intersection.uv = uvIntersection(intersectionPoint, fvA, fvB, fvC, uvA, uvB, uvC);
            }
            intersection.face = face;
            intersection.faceIndex = f;
            intersects.push(intersection);
          }
        }
      }
      return intersects;
    //};
  }
  clone(): this {
    return new (this.constructor as any)(this.geometry, this.material).copy(this);
  }
}
