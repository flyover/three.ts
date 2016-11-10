import { Light } from "./Light";
import { LightShadow } from "./LightShadow";
import { _Math } from "../math/Math";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class SpotLightShadow extends LightShadow {
  readonly isSpotLightShadow: boolean = true;
  constructor() {
    super(new PerspectiveCamera(50, 1, 0.5, 500));
  }
  update(light: Light): void {
    let fov = _Math.RAD2DEG * 2 * light.angle;
    let aspect = this.mapSize.width / this.mapSize.height;
    let far = light.distance || 500;
    let camera = <PerspectiveCamera> this.camera;
    if (fov !== camera.fov || aspect !== camera.aspect || far !== camera.far) {
      camera.fov = fov;
      camera.aspect = aspect;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }
}
