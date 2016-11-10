import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Ray } from "../math/Ray";
import { Face3 } from "./Face3";
import { Object3D } from "./Object3D";
import { Camera } from "../cameras/Camera";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://clara.io/
 * @author stephomi / http://stephaneginier.com/
 */
export class Intersect {
  distance?: number;
  distanceToRay?: number;
  point?: Vector3;
  index?: number;
  face?: Face3;
  faceIndex?: number;
  uv?: Vector2;
  object?: Object3D;
}
export class Raycaster {
  ray: Ray;
  near: number;
  far: number;
  params: any;
  linePrecision: number = 1;
  constructor(origin?: Vector3, direction?: Vector3, near?: number, far?: number) {
    this.ray = new Ray(origin, direction);
    // direction is assumed to be normalized (for accurate distance calculations)
    this.near = near || 0;
    this.far = far || Infinity;
    this.params = {
      Mesh: {},
      Line: {},
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
    //Object.defineProperties(this.params, {
    //  PointCloud: {
    //    get: function () {
    //      console.warn('THREE.Raycaster: params.PointCloud has been renamed to params.Points.');
    //      return this.Points;
    //    }
    //  }
    //});
  }
  set(origin: Vector3, direction: Vector3): void {
    // direction is assumed to be normalized (for accurate distance calculations)
    this.ray.set(origin, direction);
  }
  setFromCamera(coords: Vector2, camera: Camera): void {
    if ((camera && camera instanceof PerspectiveCamera)) {
      this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
      this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
    } else if ((camera && camera instanceof OrthographicCamera)) {
      this.ray.origin.set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera); // set origin in plane of camera
      this.ray.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
    } else {
      console.error('THREE.Raycaster: Unsupported camera type.');
    }
  }
  intersectObject(object: Object3D, recursive: boolean): Intersect[] {
    const intersects: Intersect[] = [];
    intersectObject(object, this, intersects, recursive);
    intersects.sort(ascSort);
    return intersects;
  }
  intersectObjects(objects: Object3D[], recursive?: boolean): any[] {
    const intersects: Intersect[] = [];
    if (Array.isArray(objects) === false) {
      console.warn('THREE.Raycaster.intersectObjects: objects is not an Array.');
      return intersects;
    }
    for (let i = 0, l = objects.length; i < l; i ++) {
      intersectObject(objects[i], this, intersects, recursive);
    }
    intersects.sort(ascSort);
    return intersects;
  }
}
function ascSort(a: Intersect, b: Intersect): number {
  return a.distance - b.distance;
}
function intersectObject(object: Object3D, raycaster: Raycaster, intersects: Intersect[], recursive: boolean): void {
  if (object.visible === false) return;
  object.raycast(raycaster, intersects);
  if (recursive === true) {
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i ++) {
      intersectObject(children[i], raycaster, intersects, true);
    }
  }
}
