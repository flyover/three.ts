import { Light } from "./Light";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
import { LightShadow } from "./LightShadow";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class PointLight extends Light {
  readonly isPointLight: boolean = true;
  constructor(color: number, intensity?: number, distance: number = 0, decay: number = 1) {
    super(color, intensity);
    this.type = 'PointLight';
    this.distance = distance;
    this.decay = decay;  // for physically correct lights, should be 2.
    this.shadow = new LightShadow(new PerspectiveCamera(90, 1, 0.5, 500));
  }
  get power(): number {
    // intensity = power per solid angle.
    // ref: equation (15) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
    return this.intensity * 4 * Math.PI;
  }
  set power(value: number) {
    // intensity = power per solid angle.
    // ref: equation (15) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
    this.intensity = value / (4 * Math.PI);
  }
  copy(source: this): this {
    super.copy(source);
    this.distance = source.distance;
    this.decay = source.decay;
    this.shadow = source.shadow.clone();
    return this;
  }
}
