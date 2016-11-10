import { Sphere } from "../math/Sphere";
import { Ray } from "../math/Ray";
import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../core/Object3D";
import { Vector3 } from "../math/Vector3";
import { Material } from "../materials/Material";
import { PointsMaterial } from "../materials/PointsMaterial";
import { Geometry } from "../core/Geometry";
import { BufferGeometry } from "../core/BufferGeometry";
import { Raycaster, Intersect } from "../core/Raycaster";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class Points extends Object3D {
  readonly isPoints: boolean = true;
  constructor(geometry: Geometry | BufferGeometry = new BufferGeometry(), material: Material = new PointsMaterial({ color: Math.random() * 0xffffff })) {
    super();
    this.type = 'Points';
    this.geometry = geometry;
    this.material = material;
  }
  raycast(raycaster: Raycaster, intersects: Intersect[]): Intersect[] {
    const inverseMatrix = new Matrix4();
    const ray = new Ray();
    const sphere = new Sphere();
    //return function raycast(raycaster, intersects) {
      const object = this;
      const geometry = this.geometry;
      const matrixWorld = this.matrixWorld;
      const threshold = raycaster.params.Points.threshold;
      // Checking boundingSphere distance to ray
      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
      sphere.copy(geometry.boundingSphere);
      sphere.applyMatrix4(matrixWorld);
      if (raycaster.ray.intersectsSphere(sphere) === false) return intersects;
      //
      inverseMatrix.getInverse(matrixWorld);
      ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
      const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
      const localThresholdSq = localThreshold * localThreshold;
      const position = new Vector3();
      function testPoint(point: Vector3, index: number): void {
        const rayPointDistanceSq = ray.distanceSqToPoint(point);
        if (rayPointDistanceSq < localThresholdSq) {
          const intersectPoint = ray.closestPointToPoint(point);
          intersectPoint.applyMatrix4(matrixWorld);
          const distance = raycaster.ray.origin.distanceTo(intersectPoint);
          if (distance < raycaster.near || distance > raycaster.far) return;
          intersects.push({
            distance: distance,
            distanceToRay: Math.sqrt(rayPointDistanceSq),
            point: intersectPoint.clone(),
            index: index,
            face: null,
            object: object
          });
        }
      }
      if ((geometry && geometry instanceof BufferGeometry)) {
        const index = geometry.index;
        const attributes = geometry.attributes;
        const positions = attributes.position.array;
        if (index !== null) {
          const indices = index.array;
          for (let i = 0, il = indices.length; i < il; i ++) {
            const a = indices[i];
            position.fromArray(positions, a * 3);
            testPoint(position, a);
          }
        } else {
          for (let i = 0, l = positions.length / 3; i < l; i ++) {
            position.fromArray(positions, i * 3);
            testPoint(position, i);
          }
        }
      } else if (geometry && geometry instanceof Geometry) {
        const vertices = geometry.vertices;
        for (let i = 0, l = vertices.length; i < l; i ++) {
          testPoint(vertices[i], i);
        }
      }
      return intersects;
    //};
  }
  clone(): this {
    return new (this.constructor as any)(this.geometry, this.material).copy(this);
  }
}
