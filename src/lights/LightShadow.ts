import { Matrix4 } from "../math/Matrix4";
import { Vector2 } from "../math/Vector2";
import { Camera } from "../cameras/Camera";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class LightShadow {
  camera: Camera;
  bias: number = 0;
  radius: number = 1;
  mapSize: Vector2 = new Vector2(512, 512);
  map: any = null;
  matrix: Matrix4 = new Matrix4();
  constructor(camera?: Camera) {
    this.camera = camera;
  }
  copy(source: this): this {
    this.camera = source.camera.clone();
    this.bias = source.bias;
    this.radius = source.radius;
    this.mapSize.copy(source.mapSize);
    return this;
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  toJSON(): any {
    let object: any = {};
    if (this.bias !== 0) object.bias = this.bias;
    if (this.radius !== 1) object.radius = this.radius;
    if (this.mapSize.x !== 512 || this.mapSize.y !== 512) object.mapSize = this.mapSize.toArray();
    object.camera = this.camera.toJSON(false).object;
    delete object.camera.matrix;
    return object;
  }
}
