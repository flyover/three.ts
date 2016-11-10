import { Material, MaterialParameters } from "./Material";
import { BlendingOperation } from "../constants";
import { Vector2 } from "../math/Vector2";
import { Color } from "../math/Color";
import { Texture } from "../textures/Texture";
import { CubeTexture } from "../textures/CubeTexture";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture(<Image>),
 *
 *  lightMap: new THREE.Texture(<Image>),
 *  lightMapIntensity: <float>
 *
 *  aoMap: new THREE.Texture(<Image>),
 *  aoMapIntensity: <float>
 *
 *  emissive: <hex>,
 *  emissiveIntensity: <float>
 *  emissiveMap: new THREE.Texture(<Image>),
 *
 *  bumpMap: new THREE.Texture(<Image>),
 *  bumpScale: <float>,
 *
 *  normalMap: new THREE.Texture(<Image>),
 *  normalScale: <Vector2>,
 *
 *  displacementMap: new THREE.Texture(<Image>),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  specularMap: new THREE.Texture(<Image>),
 *
 *  alphaMap: new THREE.Texture(<Image>),
 *
 *  envMap: new THREE.TextureCube([posx, negx, posy, negy, posz, negz]),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */
export interface MeshPhongMaterialParameters extends MaterialParameters {
  color?: number;
  specular?: number;
  shininess?: number;
  opacity?: number;

  map?: Texture;

  lightMap?: Texture;
  lightMapIntensity?: number;

  aoMap?: Texture;
  aoMapIntensity?: number;

  emissive?: number;
  emissiveIntensity?: number;
  emissiveMap?: Texture;

  bumpMap?: Texture;
  bumpScale?: number;

  normalMap?: Texture;
  normalScale?: Vector2;

  displacementMap?: Texture;
  displacementScale?: number;
  displacementBias?: number;

  specularMap?: Texture;

  alphaMap?: Texture;

  envMap?: CubeTexture;
  combine?: BlendingOperation; // THREE.Multiply,
  reflectivity?: number;
  refractionRatio?: number;

  wireframe?: boolean;
  wireframeLinewidth?: number;

  skinning?: boolean;
  morphTargets?: boolean;
  morphNormals?: boolean;
}
export class MeshPhongMaterial extends Material {
  lightMapIntensity: any;
  aoMap: any;
  aoMapIntensity: any;
  emissiveIntensity: any;
  combine: BlendingOperation;
  refractionRatio: any;
  morphNormals: any;
  readonly isMeshPhongMaterial: boolean = true;
  constructor(parameters?: MeshPhongMaterialParameters) {
    super();
    this.type = 'MeshPhongMaterial';
    this.color = new Color(0xffffff); // diffuse
    this.specular = new Color(0x111111);
    this.shininess = 30;
    this.map = null;
    this.lightMap = null;
    this.lightMapIntensity = 1.0;
    this.aoMap = null;
    this.aoMapIntensity = 1.0;
    this.emissive = new Color(0x000000);
    this.emissiveIntensity = 1.0;
    this.emissiveMap = null;
    this.bumpMap = null;
    this.bumpScale = 1;
    this.normalMap = null;
    this.normalScale = new Vector2(1, 1);
    this.displacementMap = null;
    this.displacementScale = 1;
    this.displacementBias = 0;
    this.specularMap = null;
    this.alphaMap = null;
    this.envMap = null;
    this.combine = BlendingOperation.Multiply;
    this.reflectivity = 1;
    this.refractionRatio = 0.98;
    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.wireframeLinecap = 'round';
    this.wireframeLinejoin = 'round';
    this.skinning = false;
    this.morphTargets = false;
    this.morphNormals = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.color.copy(source.color);
    this.specular.copy(source.specular);
    this.shininess = source.shininess;
    this.map = source.map;
    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;
    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;
    this.emissive.copy(source.emissive);
    this.emissiveMap = source.emissiveMap;
    this.emissiveIntensity = source.emissiveIntensity;
    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;
    this.normalMap = source.normalMap;
    this.normalScale.copy(source.normalScale);
    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;
    this.specularMap = source.specularMap;
    this.alphaMap = source.alphaMap;
    this.envMap = source.envMap;
    this.combine = source.combine;
    this.reflectivity = source.reflectivity;
    this.refractionRatio = source.refractionRatio;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.wireframeLinecap = source.wireframeLinecap;
    this.wireframeLinejoin = source.wireframeLinejoin;
    this.skinning = source.skinning;
    this.morphTargets = source.morphTargets;
    this.morphNormals = source.morphNormals;
    return this;
  }
  get metal() {
    console.warn("THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead.");
    return false;
  }
  set metal(value) {
    console.warn("THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead");
  }
}
