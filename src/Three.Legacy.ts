/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Face3 } from "./core/Face3";
import { BoxGeometry } from "./geometries/BoxGeometry";
import { EdgesGeometry } from "./geometries/EdgesGeometry";
import { WireframeGeometry } from "./geometries/WireframeGeometry";
import { CubeTextureLoader } from "./loaders/CubeTextureLoader";
import { TextureLoader } from "./loaders/TextureLoader";
import { LineBasicMaterial } from "./materials/LineBasicMaterial";
import { MultiMaterial } from "./materials/MultiMaterial";
import { PointsMaterial } from "./materials/PointsMaterial";
import { Vector3 } from "./math/Vector3";
import { LineSegments } from "./objects/LineSegments";
import { Points } from "./objects/Points";
import { Sprite } from "./objects/Sprite";
import { Color } from "./math/Color";
import { Texture } from "./textures/Texture";
import { CubeTexture } from "./textures/CubeTexture";
import { Camera } from "./cameras/Camera";
import { Mesh } from "./objects/Mesh";
export { BoxGeometry as CubeGeometry };
export class Face4 extends Face3 {
  constructor(a: number, b: number, c: number, d: number, normal: Vector3, color: Color, materialIndex: number) {
    console.warn("THREE.Face4 has been removed. A THREE.Face3 will be created instead.");
    super(a, b, c, normal, color, materialIndex);
  }
}
export const LineStrip = 0;
export const LinePieces = 1;
export { MultiMaterial as MeshFaceMaterial };
export class PointCloud extends Points {
  constructor(geometry: any, material: any) {
    console.warn("THREE.PointCloud has been renamed to THREE.Points.");
    super(geometry, material);
  }
}
export { Sprite as Particle };
export class ParticleSystem extends Points {
  constructor(geometry: any, material: any) {
    console.warn("THREE.ParticleSystem has been renamed to THREE.Points.");
    super(geometry, material);
  }
}
export class PointCloudMaterial extends PointsMaterial {
  constructor(parameters: any) {
    console.warn("THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial.");
    super(parameters);
  }
}
export class ParticleBasicMaterial extends PointsMaterial {
  constructor(parameters: any) {
    console.warn("THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial.");
    super(parameters);
  }
}
export class ParticleSystemMaterial extends PointsMaterial {
  constructor(parameters: any) {
    console.warn("THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial.");
    super(parameters);
  }
}
export class Vertex extends Vector3 {
  constructor(x: number, y: number, z: number) {
    console.warn("THREE.Vertex has been removed. Use THREE.Vector3 instead.");
    super(x, y, z);
  }
}
//
export class EdgesHelper extends LineSegments {
  constructor(object: any, hex: number = 0xffffff) {
    console.warn("THREE.EdgesHelper has been removed. Use THREE.EdgesGeometry instead.");
    super(new EdgesGeometry(object.geometry), new LineBasicMaterial({ color: hex }));
  }
}
export class WireframeHelper extends LineSegments {
  constructor(object: any, hex: number = 0xffffff) {
    console.warn("THREE.WireframeHelper has been removed. Use THREE.WireframeGeometry instead.");
    super(new WireframeGeometry(object.geometry), new LineBasicMaterial({ color: hex }));
  }
}
//
export class GeometryUtils {
  static merge(geometry1: any, geometry2: any, materialIndexOffset: number) {
    console.warn("THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge(geometry2, matrix, materialIndexOffset) instead.");
    let matrix;
    if (geometry2 instanceof Mesh) {
      geometry2.matrixAutoUpdate && geometry2.updateMatrix();
      matrix = geometry2.matrix;
      geometry2 = geometry2.geometry;
    }
    geometry1.merge(geometry2, matrix, materialIndexOffset);
  }
  static center(geometry: any): Vector3 {
    console.warn("THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead.");
    return geometry.center();
  }
}
export class ImageUtils {
  static crossOrigin: string;
  static loadTexture(url: string, mapping: number, onLoad: any, onError: any): Texture {
    console.warn("THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.");
    const loader = new TextureLoader();
    loader.setCrossOrigin(this.crossOrigin);
    const texture = loader.load(url, onLoad, undefined, onError);
    if (mapping) texture.mapping = mapping;
    return texture;
  }
  loadTextureCube(urls: string[], mapping: number, onLoad: any, onError: any): CubeTexture {
    console.warn("THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.");
    const loader = new CubeTextureLoader();
    loader.setCrossOrigin(ImageUtils.crossOrigin);
    const texture = loader.load(urls, onLoad, undefined, onError);
    if (mapping) texture.mapping = mapping;
    return texture;
  }
  loadCompressedTexture () {
    console.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.");
  }
  loadCompressedTextureCube() {
    console.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.");
  }
}
//
export class Projector {
  constructor() {
    console.error("THREE.Projector has been moved to /examples/js/renderers/Projector.ts.");
  }
  projectVector(vector: Vector3, camera: Camera) {
    console.warn("THREE.Projector: .projectVector() is now vector.project().");
    vector.project(camera);
  }
  unprojectVector(vector: Vector3, camera: Camera) {
    console.warn("THREE.Projector: .unprojectVector() is now vector.unproject().");
    vector.unproject(camera);
  }
  pickingRay(vector: Vector3, camera: Camera) {
    console.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().");
  };
}
//
export class CanvasRenderer {
  domElement: HTMLCanvasElement;
  constructor() {
    console.error("THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.ts");
    this.domElement = <HTMLCanvasElement> document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
  }
  clear() {}
  render() {}
  setClearColor() {}
  setSize() {}
}
