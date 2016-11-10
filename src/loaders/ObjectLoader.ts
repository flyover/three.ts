import { TextureMapping, TextureWrapping, TextureFilter } from "../constants";
import { Color } from "../math/Color";
import { Matrix4 } from "../math/Matrix4";
import { Object3D } from "../core/Object3D";
import { Group } from "../objects/Group";
import { Sprite } from "../objects/Sprite";
import { Points } from "../objects/Points";
import { Line } from "../objects/Line";
import { LineSegments } from "../objects/LineSegments";
import { LOD } from "../objects/LOD";
import { Mesh } from "../objects/Mesh";
import { SkinnedMesh } from "../objects/SkinnedMesh";
import { Fog } from "../scenes/Fog";
import { FogExp2 } from "../scenes/FogExp2";
import { HemisphereLight } from "../lights/HemisphereLight";
import { SpotLight } from "../lights/SpotLight";
import { PointLight } from "../lights/PointLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { AmbientLight } from "../lights/AmbientLight";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
import { Scene } from "../scenes/Scene";
import { Texture } from "../textures/Texture";
import { ImageLoader } from "./ImageLoader";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
import { AnimationClip } from "../animation/AnimationClip";
import { MaterialLoader } from "./MaterialLoader";
import { BufferGeometryLoader } from "./BufferGeometryLoader";
import { JSONLoader } from "./JSONLoader";
import { XHRLoader } from "./XHRLoader";
import { Geometry } from "../core/Geometry";
import { BufferGeometry } from "../core/BufferGeometry";
import * as Geometries from "../geometries/Geometries";
import { Material } from "../materials/Material";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class ObjectLoader {
  manager: LoadingManager;
  texturePath: string = '';
  crossOrigin: string;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad: (object: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void {
    if (this.texturePath === '') {
      this.texturePath = url.substring(0, url.lastIndexOf('/') + 1);
    }
    const scope: ObjectLoader = this;
    const loader: XHRLoader = new XHRLoader(scope.manager);
    loader.load(url, function(text: string): void {
      scope.parse(JSON.parse(text), onLoad);
    }, onProgress, onError);
  }
  setTexturePath(value: string): void {
    this.texturePath = value;
  }
  setCrossOrigin(value: string): void {
    this.crossOrigin = value;
  }
  parse(json: any, onLoad: (object: Object3D) => void): Object3D {
    const geometries = this.parseGeometries(json.geometries);
    const images = this.parseImages(json.images, function(): void {
      if (onLoad !== undefined) onLoad(object);
    });
    const textures  = this.parseTextures(json.textures, images);
    const materials = this.parseMaterials(json.materials, textures);
    const object = this.parseObject(json.object, geometries, materials);
    if (json.animations) {
      object.animations = this.parseAnimations(json.animations);
    }
    if (json.images === undefined || json.images.length === 0) {
      if (onLoad !== undefined) onLoad(object);
    }
    return object;
  }
  parseGeometries(json: any[]): Map<string, Geometry | BufferGeometry> {
    const geometries = new Map<string, Geometry | BufferGeometry>();
    if (json !== undefined) {
      const geometryLoader = new JSONLoader();
      const bufferGeometryLoader = new BufferGeometryLoader();
      for (let i = 0, l = json.length; i < l; i ++) {
        let geometry: Geometry | BufferGeometry;
        const data: any = json[i];
        switch (data.type) {
          case 'PlaneGeometry':
          case 'PlaneBufferGeometry':
            geometry = new Geometries[data.type](
              data.width,
              data.height,
              data.widthSegments,
              data.heightSegments
            );
            break;
          case 'BoxGeometry':
          case 'BoxBufferGeometry':
          case 'CubeGeometry': // backwards compatible
            geometry = new Geometries[data.type](
              data.width,
              data.height,
              data.depth,
              data.widthSegments,
              data.heightSegments,
              data.depthSegments
            );
            break;
          case 'CircleGeometry':
          case 'CircleBufferGeometry':
            geometry = new Geometries[data.type](
              data.radius,
              data.segments,
              data.thetaStart,
              data.thetaLength
            );
            break;
          case 'CylinderGeometry':
          case 'CylinderBufferGeometry':
            geometry = new Geometries[data.type](
              data.radiusTop,
              data.radiusBottom,
              data.height,
              data.radialSegments,
              data.heightSegments,
              data.openEnded,
              data.thetaStart,
              data.thetaLength
            );
            break;
          case 'ConeGeometry':
          case 'ConeBufferGeometry':
            geometry = new Geometries[data.type](
              data.radius,
              data.height,
              data.radialSegments,
              data.heightSegments,
              data.openEnded,
              data.thetaStart,
              data.thetaLength
            );
            break;
          case 'SphereGeometry':
          case 'SphereBufferGeometry':
            geometry = new Geometries[data.type](
              data.radius,
              data.widthSegments,
              data.heightSegments,
              data.phiStart,
              data.phiLength,
              data.thetaStart,
              data.thetaLength
            );
            break;
          case 'DodecahedronGeometry':
          case 'IcosahedronGeometry':
          case 'OctahedronGeometry':
          case 'TetrahedronGeometry':
            geometry = new Geometries[data.type](
              data.radius,
              data.detail
            );
            break;
          case 'RingGeometry':
          case 'RingBufferGeometry':
            geometry = new Geometries[data.type](
              data.innerRadius,
              data.outerRadius,
              data.thetaSegments,
              data.phiSegments,
              data.thetaStart,
              data.thetaLength
            );
            break;
          case 'TorusGeometry':
          case 'TorusBufferGeometry':
            geometry = new Geometries[data.type](
              data.radius,
              data.tube,
              data.radialSegments,
              data.tubularSegments,
              data.arc
            );
            break;
          case 'TorusKnotGeometry':
          case 'TorusKnotBufferGeometry':
            geometry = new Geometries[data.type](
              data.radius,
              data.tube,
              data.tubularSegments,
              data.radialSegments,
              data.p,
              data.q
            );
            break;
          case 'LatheGeometry':
          case 'LatheBufferGeometry':
            geometry = new Geometries[data.type](
              data.points,
              data.segments,
              data.phiStart,
              data.phiLength
            );
            break;
          case 'BufferGeometry':
            geometry = bufferGeometryLoader.parse(data);
            break;
          case 'Geometry':
            geometry = geometryLoader.parse(data.data, this.texturePath).geometry;
            break;
          default:
            console.warn('THREE.ObjectLoader: Unsupported geometry type "' + data.type + '"');
            continue;
        }
        geometry.uuid = data.uuid;
        if (data.name !== undefined) geometry.name = data.name;
        geometries[data.uuid] = geometry;
      }
    }
    return geometries;
  }
  parseMaterials(json: any[], textures: Map<string, Texture>): Map<string, Material> {
    const materials = new Map<string, Material>();
    if (json !== undefined) {
      const loader = new MaterialLoader();
      loader.setTextures(textures);
      for (let i = 0, l = json.length; i < l; i ++) {
        const material = loader.parse(json[i]);
        materials[material.uuid] = material;
      }
    }
    return materials;
  }
  parseAnimations(json: any[]): any[] {
    const animations = [];
    for (let i = 0; i < json.length; i ++) {
      const clip = AnimationClip.parse(json[i]);
      animations.push(clip);
    }
    return animations;
  }
  parseImages(json: any[], onLoad: any): Map<string, HTMLImageElement> {
    const scope: ObjectLoader = this;
    const images = new Map<string, HTMLImageElement>();
    let loader: ImageLoader;
    function loadImage(url: string): HTMLImageElement {
      scope.manager.itemStart(url);
      return loader.load(url, function(): void {
        scope.manager.itemEnd(url);
      }, undefined, function(): void {
        scope.manager.itemError(url);
      });
    }
    if (json !== undefined && json.length > 0) {
      const manager = new LoadingManager(onLoad);
      loader = new ImageLoader(manager);
      loader.setCrossOrigin(this.crossOrigin);
      for (let i = 0, l = json.length; i < l; i ++) {
        const image = json[i];
        const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(image.url) ? image.url : scope.texturePath + image.url;
        images[image.uuid] = loadImage(path);
      }
    }
    return images;
  }
  parseTextures(json: any[], images: any): Map<string, Texture> {
    function parseConstant(value: any, type: any) {
      if (typeof(value) === 'number') return value;
      console.warn('THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value);
      return type[value];
    }
    const textures = new Map<string, Texture>();
    if (json !== undefined) {
      for (let i = 0, l = json.length; i < l; i ++) {
        const data = json[i];
        if (data.image === undefined) {
          console.warn('THREE.ObjectLoader: No "image" specified for', data.uuid);
        }
        if (images[data.image] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined image', data.image);
        }
        const texture = new Texture(images[data.image]);
        texture.needsUpdate = true;
        texture.uuid = data.uuid;
        if (data.name !== undefined) texture.name = data.name;
        if (data.mapping !== undefined) texture.mapping = parseConstant(data.mapping, TextureMapping);
        if (data.offset !== undefined) texture.offset.fromArray(data.offset);
        if (data.repeat !== undefined) texture.repeat.fromArray(data.repeat);
        if (data.wrap !== undefined) {
          texture.wrapS = parseConstant(data.wrap[0], TextureWrapping);
          texture.wrapT = parseConstant(data.wrap[1], TextureWrapping);
        }
        if (data.minFilter !== undefined) texture.minFilter = parseConstant(data.minFilter, TextureFilter);
        if (data.magFilter !== undefined) texture.magFilter = parseConstant(data.magFilter, TextureFilter);
        if (data.anisotropy !== undefined) texture.anisotropy = data.anisotropy;
        if (data.flipY !== undefined) texture.flipY = data.flipY;
        textures[data.uuid] = texture;
      }
    }
    return textures;
  }
  parseObject(data: any, geometries?: Map<string, Geometry | BufferGeometry>, materials?: Map<string, Material>): Object3D {
    const matrix = new Matrix4();
    //return function parseObject(data, geometries, materials) {
      let object: Object3D;
      function getGeometry(name: string): Geometry | BufferGeometry {
        if (geometries[name] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined geometry', name);
        }
        return geometries[name];
      }
      function getMaterial(name: string): Material {
        if (name === undefined) return undefined;
        if (materials[name] === undefined) {
          console.warn('THREE.ObjectLoader: Undefined material', name);
        }
        return materials[name];
      }
      switch (data.type) {
        case 'Scene':
          object = new Scene();
          if (data.background !== undefined) {
            if (Number.isInteger(data.background)) {
              (object as Scene).background = new Color(data.background);
            }
          }
          if (data.fog !== undefined) {
            if (data.fog.type === 'Fog') {
              (object as Scene).fog = new Fog(data.fog.color, data.fog.near, data.fog.far);
            } else if (data.fog.type === 'FogExp2') {
              (object as Scene).fog = new FogExp2(data.fog.color, data.fog.density);
            }
          }
          break;
        case 'PerspectiveCamera':
          object = new PerspectiveCamera(data.fov, data.aspect, data.near, data.far);
          if (data.focus !== undefined) (object as PerspectiveCamera).focus = data.focus;
          if (data.zoom !== undefined) (object as PerspectiveCamera).zoom = data.zoom;
          if (data.filmGauge !== undefined) (object as PerspectiveCamera).filmGauge = data.filmGauge;
          if (data.filmOffset !== undefined) (object as PerspectiveCamera).filmOffset = data.filmOffset;
          if (data.view !== undefined) (object as PerspectiveCamera).view = Object.assign({}, data.view);
          break;
        case 'OrthographicCamera':
          object = new OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far);
          break;
        case 'AmbientLight':
          object = new AmbientLight(data.color, data.intensity);
          break;
        case 'DirectionalLight':
          object = new DirectionalLight(data.color, data.intensity);
          break;
        case 'PointLight':
          object = new PointLight(data.color, data.intensity, data.distance, data.decay);
          break;
        case 'SpotLight':
          object = new SpotLight(data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay);
          break;
        case 'HemisphereLight':
          object = new HemisphereLight(data.color, data.groundColor, data.intensity);
          break;
        case 'Mesh':
          const geometry = getGeometry(data.geometry);
          const material = getMaterial(data.material);
          if (geometry.bones && geometry.bones.length > 0) {
            object = new SkinnedMesh(geometry, material);
          } else {
            object = new Mesh(geometry, material);
          }
          break;
        case 'LOD':
          object = new LOD();
          break;
        case 'Line':
          object = new Line(getGeometry(data.geometry), getMaterial(data.material), data.mode);
          break;
        case 'LineSegments':
          object = new LineSegments(getGeometry(data.geometry), getMaterial(data.material));
          break;
        case 'PointCloud':
        case 'Points':
          object = new Points(getGeometry(data.geometry), getMaterial(data.material));
          break;
        case 'Sprite':
          object = new Sprite(getMaterial(data.material));
          break;
        case 'Group':
          object = new Group();
          break;
        default:
          object = new Object3D();
      }
      object.uuid = data.uuid;
      if (data.name !== undefined) object.name = data.name;
      if (data.matrix !== undefined) {
        matrix.fromArray(data.matrix);
        matrix.decompose(object.position, object.quaternion, object.scale);
      } else {
        if (data.position !== undefined) object.position.fromArray(data.position);
        if (data.rotation !== undefined) object.rotation.fromArray(data.rotation);
        if (data.quaternion !== undefined) object.quaternion.fromArray(data.quaternion);
        if (data.scale !== undefined) object.scale.fromArray(data.scale);
      }
      if (data.castShadow !== undefined) object.castShadow = data.castShadow;
      if (data.receiveShadow !== undefined) object.receiveShadow = data.receiveShadow;
      if (data.shadow) {
        if (data.shadow.bias !== undefined) object.shadow.bias = data.shadow.bias;
        if (data.shadow.radius !== undefined) object.shadow.radius = data.shadow.radius;
        if (data.shadow.mapSize !== undefined) object.shadow.mapSize.fromArray(data.shadow.mapSize);
        if (data.shadow.camera !== undefined) object.shadow.camera = this.parseObject(data.shadow.camera);
      }
      if (data.visible !== undefined) object.visible = data.visible;
      if (data.userData !== undefined) object.userData = data.userData;
      if (data.children !== undefined) {
        for (const child in data.children) {
          object.add(this.parseObject(data.children[child], geometries, materials));
        }
      }
      if (data.type === 'LOD') {
        const levels = data.levels;
        for (let l = 0; l < levels.length; l ++) {
          const level = levels[l];
          const child = object.getObjectByProperty('uuid', level.object);
          if (child !== undefined) {
            (object as LOD).addLevel(child, level.distance);
          }
        }
      }
      return object;
    //};
  }
}
