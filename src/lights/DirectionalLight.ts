import { Light } from "./Light";
import { DirectionalLightShadow } from "./DirectionalLightShadow";
import { Object3D } from "../core/Object3D";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
export class DirectionalLight extends Light {
  target: Object3D = new Object3D();
  readonly isDirectionalLight: boolean = true;
  constructor(color: number, intensity?: number) {
    super(color, intensity);
    this.type = 'DirectionalLight';
    this.position.copy(Object3D.DefaultUp);
    this.updateMatrix();
    this.shadow = new DirectionalLightShadow();
  }
  copy(source: this): this {
    super.copy(source);
    this.target = source.target.clone();
    this.shadow = source.shadow.clone();
    return this;
  }
}
