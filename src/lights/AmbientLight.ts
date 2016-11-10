import { Light } from "./Light";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class AmbientLight extends Light {
  readonly isAmbientLight: boolean = true;
  constructor(color: number, intensity?: number) {
    super(color, intensity);
    this.type = 'AmbientLight';
    this.castShadow = undefined;
  }
}
