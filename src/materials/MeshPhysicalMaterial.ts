import { MeshStandardMaterial, MeshStandardMaterialParameters } from "./MeshStandardMaterial";
/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  reflectivity: <float>
 * }
 */
export interface MeshPhysicalMaterialParameters extends MeshStandardMaterialParameters {
}
export class MeshPhysicalMaterial extends MeshStandardMaterial {
  clearCoat: any;
  clearCoatRoughness: any;
  readonly isMeshPhysicalMaterial: boolean = true;
  constructor(parameters?: MeshPhysicalMaterialParameters) {
    super(parameters);
    this.defines = { 'PHYSICAL': '' };
    this.type = 'MeshPhysicalMaterial';
    this.reflectivity = 0.5; // maps to F0 = 0.04
    this.clearCoat = 0.0;
    this.clearCoatRoughness = 0.0;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.defines = { 'PHYSICAL': '' };
    this.reflectivity = source.reflectivity;
    this.clearCoat = source.clearCoat;
    this.clearCoatRoughness = source.clearCoatRoughness;
    return this;
  };
}
