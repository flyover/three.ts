import { Material, MaterialParameters } from "./Material";
import { Color } from "../math/Color";
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  linewidth: <float>,
 *
 *  scale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>
 * }
 */
export interface LineDashedMaterialParameters extends MaterialParameters {
}
export class LineDashedMaterial extends Material {
  linewidth: number;
  scale: number;
  dashSize: number;
  gapSize: number;
  readonly isLineDashedMaterial: boolean = true;
  constructor(parameters?: LineDashedMaterialParameters) {
    super();
    this.type = 'LineDashedMaterial';
    this.color = new Color(0xffffff);
    this.linewidth = 1;
    this.scale = 1;
    this.dashSize = 3;
    this.gapSize = 1;
    this.lights = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.color.copy(source.color);
    this.linewidth = source.linewidth;
    this.scale = source.scale;
    this.dashSize = source.dashSize;
    this.gapSize = source.gapSize;
    return this;
  };
}
