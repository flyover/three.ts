import { Sphere } from "../math/Sphere";
import { Vector3 } from "../math/Vector3";
import { BufferAttribute, TypedArray, TypedArrayConstructor } from "../core/BufferAttribute";
import { BufferGeometry } from "../core/BufferGeometry";
import { XHRLoader } from "./XHRLoader";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class BufferGeometryLoader {
  manager: LoadingManager;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void {
    const scope: BufferGeometryLoader = this;
    const loader: XHRLoader = new XHRLoader(scope.manager);
    loader.load(url, function(text: string): void {
      onLoad(scope.parse(JSON.parse(text)));
    }, onProgress, onError);
  }
  parse(json: any): BufferGeometry {
    const geometry: BufferGeometry = new BufferGeometry();
    const index: any = json.data.index;
    const TYPED_ARRAYS: { [key: string]: TypedArrayConstructor } = {
      'Int8Array': Int8Array,
      'Uint8Array': Uint8Array,
      'Uint8ClampedArray': Uint8ClampedArray,
      'Int16Array': Int16Array,
      'Uint16Array': Uint16Array,
      'Int32Array': Int32Array,
      'Uint32Array': Uint32Array,
      'Float32Array': Float32Array,
      'Float64Array': Float64Array
    };
    if (index !== undefined) {
      const typedArray: TypedArray = new TYPED_ARRAYS[index.type](index.array);
      geometry.setIndex(new BufferAttribute(typedArray, 1));
    }
    const attributes = json.data.attributes;
    for (let key in attributes) {
      const attribute = attributes[key];
      const typedArray: TypedArray = new TYPED_ARRAYS[attribute.type](attribute.array);
      geometry.addAttribute(key, new BufferAttribute(typedArray, attribute.itemSize, attribute.normalized));
    }
    const groups = json.data.groups || json.data.drawcalls || json.data.offsets;
    if (groups !== undefined) {
      for (let i = 0, n = groups.length; i !== n; ++ i) {
        const group = groups[i];
        geometry.addGroup(group.start, group.count, group.materialIndex);
      }
    }
    const boundingSphere = json.data.boundingSphere;
    if (boundingSphere !== undefined) {
      const center = new Vector3();
      if (boundingSphere.center !== undefined) {
        center.fromArray(boundingSphere.center);
      }
      geometry.boundingSphere = new Sphere(center, boundingSphere.radius);
    }
    return geometry;
  }
}
