import { Material, MaterialParameters } from "./Material";
/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */
export interface MeshNormalMaterialParameters extends MaterialParameters {
}
export class MeshNormalMaterial extends Material {
  readonly isMeshNormalMaterial: boolean = true;
  constructor(parameters?: MeshNormalMaterialParameters) {
    super();
    this.type = 'MeshNormalMaterial';
    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.fog = false;
    this.lights = false;
    this.morphTargets = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    return this;
  };
}
