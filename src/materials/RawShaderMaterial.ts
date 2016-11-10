import { ShaderMaterial, ShaderMaterialParameters } from "./ShaderMaterial";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export interface RawShaderMaterialParameters extends ShaderMaterialParameters {
}
export class RawShaderMaterial extends ShaderMaterial {
  readonly isRawShaderMaterial: boolean = true;
  constructor(parameters?: RawShaderMaterialParameters) {
    super(parameters);
    this.type = 'RawShaderMaterial';
  }
}
