import { Light } from "./Light";
import { Color } from "../math/Color";
import { Object3D } from "../core/Object3D";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class HemisphereLight extends Light {
  readonly isHemisphereLight: boolean = true;
  constructor(skyColor: number, groundColor: number, intensity?: number) {
    super(skyColor, intensity);
    this.type = 'HemisphereLight';
    this.castShadow = undefined;
    this.position.copy(Object3D.DefaultUp);
    this.updateMatrix();
    this.groundColor = new Color(groundColor);
  }
  copy(source: this): this {
    super.copy(source);
    this.groundColor.copy(source.groundColor);
    return this;
  }
}
