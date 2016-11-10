import { Sphere } from "../math/Sphere";
import { Ray } from "../math/Ray";
import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
import { Material } from "../materials/Material";
import { LineBasicMaterial } from "../materials/LineBasicMaterial";
import { Geometry } from "../core/Geometry";
import { BufferGeometry } from "../core/BufferGeometry";
import { Raycaster, Intersect } from "../core/Raycaster";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class Line extends Object3D {
  protected _step: number = 1;
  readonly isLine: boolean = true;
  readonly isLineSegments: boolean = false;
  constructor(geometry: Geometry | BufferGeometry = new BufferGeometry(), material: Material = new LineBasicMaterial({ color: Math.random() * 0xffffff }), mode?: number) {
    super();
    if (mode === 1) {
      console.warn('THREE.Line: parameter THREE.LinePieces no longer supported. Created THREE.LineSegments instead.');
      //return new LineSegments(geometry, material);
    }
    this.type = 'Line';
    this.geometry = geometry;
    this.material = material;
  }
  raycast(raycaster: Raycaster, intersects: Intersect[]): Intersect[] {
    let inverseMatrix = new Matrix4();
    let ray = new Ray();
    let sphere = new Sphere();
    //return function raycast(raycaster, intersects) {
      let precision = raycaster.linePrecision;
      let precisionSq = precision * precision;
      let geometry = this.geometry;
      let matrixWorld = this.matrixWorld;
      // Checking boundingSphere distance to ray
      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
      sphere.copy(geometry.boundingSphere);
      sphere.applyMatrix4(matrixWorld);
      if (raycaster.ray.intersectsSphere(sphere) === false) return intersects;
      //
      inverseMatrix.getInverse(matrixWorld);
      ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
      let vStart = new Vector3();
      let vEnd = new Vector3();
      let interSegment = new Vector3();
      let interRay = new Vector3();
      let step = this._step; //(this && this instanceof LineSegments) ? 2 : 1;
      if ((geometry && geometry instanceof BufferGeometry)) {
        let index = geometry.index;
        let attributes = geometry.attributes;
        let positions = attributes.position.array;
        if (index !== null) {
          let indices = index.array;
          for (let i = 0, l = indices.length - 1; i < l; i += step) {
            let a = indices[i];
            let b = indices[i + 1];
            vStart.fromArray(positions, a * 3);
            vEnd.fromArray(positions, b * 3);
            let distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
            if (distSq > precisionSq) continue;
            interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation
            let distance = raycaster.ray.origin.distanceTo(interRay);
            if (distance < raycaster.near || distance > raycaster.far) continue;
            intersects.push({
              distance: distance,
              // What do we want? intersection point on the ray or on the segment??
              // point: raycaster.ray.at(distance),
              point: interSegment.clone().applyMatrix4(this.matrixWorld),
              index: i,
              face: null,
              faceIndex: null,
              object: this
            });
          }
        } else {
          for (let i = 0, l = positions.length / 3 - 1; i < l; i += step) {
            vStart.fromArray(positions, 3 * i);
            vEnd.fromArray(positions, 3 * i + 3);
            let distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
            if (distSq > precisionSq) continue;
            interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation
            let distance = raycaster.ray.origin.distanceTo(interRay);
            if (distance < raycaster.near || distance > raycaster.far) continue;
            intersects.push({
              distance: distance,
              // What do we want? intersection point on the ray or on the segment??
              // point: raycaster.ray.at(distance),
              point: interSegment.clone().applyMatrix4(this.matrixWorld),
              index: i,
              face: null,
              faceIndex: null,
              object: this
            });
          }
        }
      } else if ((geometry && geometry instanceof Geometry)) {
        let vertices = geometry.vertices;
        let nbVertices = vertices.length;
        for (let i = 0; i < nbVertices - 1; i += step) {
          let distSq = ray.distanceSqToSegment(vertices[i], vertices[i + 1], interRay, interSegment);
          if (distSq > precisionSq) continue;
          interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation
          let distance = raycaster.ray.origin.distanceTo(interRay);
          if (distance < raycaster.near || distance > raycaster.far) continue;
          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at(distance),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this
          });
        }
      }
      return intersects;
    //};
  }
  clone(): this {
    return new (this.constructor as any)(this.geometry, this.material).copy(this);
  }
}
