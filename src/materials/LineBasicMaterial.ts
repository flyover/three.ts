import { Material, MaterialParameters } from "./Material";
import { Color } from "../math/Color";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *  linecap: "round",
 *  linejoin: "round"
 * }
 */
export interface LineBasicMaterialParameters extends MaterialParameters {
  fog?: any;
  color?: any;
  opacity?: any;
  linewidth?: any;
  depthTest?: any;
  depthWrite?: any;
  transparent?: any;
  vertexColors?: any;
}
export class LineBasicMaterial extends Material {
  linewidth: number;
  linecap: string;
  linejoin: string;
  readonly isLineBasicMaterial: boolean = true;
  constructor(parameters?: LineBasicMaterialParameters) {
    super();
    this.type = 'LineBasicMaterial';
    this.color = new Color(0xffffff);
    this.linewidth = 1;
    this.linecap = 'round';
    this.linejoin = 'round';
    this.lights = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.color.copy(source.color);
    this.linewidth = source.linewidth;
    this.linecap = source.linecap;
    this.linejoin = source.linejoin;
    return this;
  }
}
