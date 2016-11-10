import { Material, MaterialParameters } from "./Material";
import { DepthPacking } from "../constants";
import { Texture } from "../textures/Texture";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / https://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *
 *  opacity: <float>,
 *
 *  map: new THREE.Texture(<Image>),
 *
 *  alphaMap: new THREE.Texture(<Image>),
 *
 *  displacementMap: new THREE.Texture(<Image>),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */
export interface MeshDepthMaterialParameters extends MaterialParameters {
  opacity?: number;

  map?: Texture;

  alphaMap?: Texture;

  displacementMap?: Texture;
  displacementScale?: number;
  displacementBias?: number;

  wireframe?: boolean;
  wireframeLinewidth?: number;
}
export class MeshDepthMaterial extends Material {
  depthPacking: DepthPacking;
  clipping: boolean;
  readonly isMeshDepthMaterial: boolean = true;
  constructor(parameters?: MeshDepthMaterialParameters) {
    super();
    this.type = 'MeshDepthMaterial';
    this.depthPacking = DepthPacking.Basic;
    this.skinning = false;
    this.morphTargets = false;
    this.map = null;
    this.alphaMap = null;
    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;
    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.fog = false;
    this.lights = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.depthPacking = source.depthPacking;
    this.skinning = source.skinning;
    this.morphTargets = source.morphTargets;
    this.map = source.map;
    this.alphaMap = source.alphaMap;
    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    return this;
  };
}
