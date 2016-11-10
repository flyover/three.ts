import { Material, MaterialParameters } from "./Material";
import { Color } from "../math/Color";
import { Texture } from "../textures/Texture";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture(<Image>),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>
 * }
 */
export interface PointsMaterialParameters extends MaterialParameters {
  color?: number;
  opacity?: number;
  map?: Texture;

  size?: any;
  sizeAttenuation?: boolean;
}
export class PointsMaterial extends Material {
  readonly isPointsMaterial: boolean = true;
  constructor(parameters?: PointsMaterialParameters) {
    super();
    this.type = 'PointsMaterial';
    this.color = new Color(0xffffff);
    this.map = null;
    this.size = 1;
    this.sizeAttenuation = true;
    this.lights = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.color.copy(source.color);
    this.map = source.map;
    this.size = source.size;
    this.sizeAttenuation = source.sizeAttenuation;
    return this;
  }
}
