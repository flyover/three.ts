import { Light } from "./Light";
import { SpotLightShadow } from "./SpotLightShadow";
import { Object3D } from "../core/Object3D";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class SpotLight extends Light {
  target: Object3D = new Object3D();
  readonly isSpotLight: boolean = true;
  constructor(color: number, intensity?: number, distance: number = 0, angle: number = Math.PI / 3, penumbra: number = 0, decay: number = 1) {
    super(color, intensity);
    this.type = 'SpotLight';
    this.position.copy(Object3D.DefaultUp);
    this.updateMatrix();
    this.distance = distance;
    this.angle = angle;
    this.penumbra = penumbra;
    this.decay = decay;  // for physically correct lights, should be 2.
    this.shadow = new SpotLightShadow();
  }
  get power (): number {
    // intensity = power per solid angle.
    // ref: equation (17) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
    return this.intensity * Math.PI;
  }
  set power (value: number) {
    // intensity = power per solid angle.
    // ref: equation (17) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
    this.intensity = value / Math.PI;
  }
  copy(source: this): this {
    super.copy(source);
    this.distance = source.distance;
    this.angle = source.angle;
    this.penumbra = source.penumbra;
    this.decay = source.decay;
    this.target = source.target.clone();
    this.shadow = source.shadow.clone();
    return this;
  }
}
