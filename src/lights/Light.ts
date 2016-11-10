import { Object3D } from "../core/Object3D";
import { Color } from "../math/Color";
import { LightShadow } from "./LightShadow";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
export class Light extends Object3D {
  color: any;
  intensity: any;
  groundColor: any;
  distance: any;
  angle: any;
  decay: any;
  penumbra: any;
  shadow: LightShadow;
  target: any;
  readonly isLight: boolean = true;
  constructor(color: number, intensity: number = 1) {
    super();
    this.type = 'Light';
    this.color = new Color(color);
    this.intensity = intensity !== undefined ? intensity : 1;
    this.receiveShadow = undefined;
  }
  copy(source: this): this {
    super.copy(source);
    this.color.copy(source.color);
    this.intensity = source.intensity;
    return this;
  }
  toJSON(meta: any): any {
    let data = super.toJSON(meta);
    data.object.color = this.color.getHex();
    data.object.intensity = this.intensity;
    if (this.groundColor !== undefined) data.object.groundColor = this.groundColor.getHex();
    if (this.distance !== undefined) data.object.distance = this.distance;
    if (this.angle !== undefined) data.object.angle = this.angle;
    if (this.decay !== undefined) data.object.decay = this.decay;
    if (this.penumbra !== undefined) data.object.penumbra = this.penumbra;
    if (this.shadow !== undefined) data.object.shadow = this.shadow.toJSON();
    return data;
  }
  set onlyShadow(value: boolean) {
    console.warn("THREE.Light: .onlyShadow has been removed.");
  }
  set shadowCameraFov(value: number) {
    console.warn("THREE.Light: .shadowCameraFov is now .shadow.camera.fov.");
    if (this.shadow.camera instanceof PerspectiveCamera) {
      this.shadow.camera.fov = value;
    }
  }
  set shadowCameraLeft(value: number) {
    console.warn("THREE.Light: .shadowCameraLeft is now .shadow.camera.left.");
    if (this.shadow.camera instanceof OrthographicCamera) {
      this.shadow.camera.left = value;
    }
  }
  set shadowCameraRight(value: number) {
    console.warn("THREE.Light: .shadowCameraRight is now .shadow.camera.right.");
    if (this.shadow.camera instanceof OrthographicCamera) {
      this.shadow.camera.right = value;
    }
  }
  set shadowCameraTop(value: number) {
    console.warn("THREE.Light: .shadowCameraTop is now .shadow.camera.top.");
    if (this.shadow.camera instanceof OrthographicCamera) {
      this.shadow.camera.top = value;
    }
  }
  set shadowCameraBottom(value: number) {
    console.warn("THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom.");
    if (this.shadow.camera instanceof OrthographicCamera) {
      this.shadow.camera.bottom = value;
    }
  }
  set shadowCameraNear(value: number) {
    console.warn("THREE.Light: .shadowCameraNear is now .shadow.camera.near.");
    if (this.shadow.camera instanceof OrthographicCamera) {
      this.shadow.camera.near = value;
    }
  }
  set shadowCameraFar(value: number) {
    console.warn("THREE.Light: .shadowCameraFar is now .shadow.camera.far.");
    if (this.shadow.camera instanceof OrthographicCamera) {
      this.shadow.camera.far = value;
    }
  }
  set shadowCameraVisible(value: boolean) {
    console.warn("THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper(light.shadow.camera) instead.");
  }
  set shadowBias(value: number) {
    console.warn("THREE.Light: .shadowBias is now .shadow.bias.");
    this.shadow.bias = value;
  }
  set shadowDarkness(value: number) {
    console.warn("THREE.Light: .shadowDarkness has been removed.");
  }
  set shadowMapWidth(value: number) {
    console.warn("THREE.Light: .shadowMapWidth is now .shadow.mapSize.width.");
    this.shadow.mapSize.width = value;
  }
  set shadowMapHeight(value: number) {
    console.warn("THREE.Light: .shadowMapHeight is now .shadow.mapSize.height.");
    this.shadow.mapSize.height = value;
  }
}
