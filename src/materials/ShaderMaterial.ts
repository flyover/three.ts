import { Material, MaterialParameters } from "./Material";
import { UniformsUtils } from "../renderers/shaders/UniformsUtils";
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  defines: { "label" : "value" },
 *  uniforms: { "parameter1": { value: 1.0 }, "parameter2": { value2: 2 } },
 *
 *  fragmentShader: <string>,
 *  vertexShader: <string>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  lights: <bool>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */
export interface ShaderMaterialParameters extends MaterialParameters {
  defines?: any;
  uniforms?: any;

  fragmentShader?: string;
  vertexShader?: string;

  wireframe?: boolean;
  wireframeLinewidth?: number;

  lights?: boolean;

  skinning?: boolean;
  morphTargets?: boolean;
  morphNormals?: boolean;
}
export class ShaderMaterial extends Material {
  defines: any;
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
  linewidth: number;
  extensions: any;
  defaultAttributeValues: any;
  index0AttributeName: string;
  // {
  numSupportedMorphTargets: number;
  numSupportedMorphNormals: number;
  __webglShader: any;
  faceOffset: number;
  faceNum: number;
  combine: number;
  outlineParameters: any;
  // }
  readonly isShaderMaterial: boolean = true;
  constructor(parameters?: ShaderMaterialParameters) {
    super();
    this.type = 'ShaderMaterial';
    this.defines = {};
    this.uniforms = {};
    this.vertexShader = 'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}';
    this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}';
    this.linewidth = 1;
    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.fog = false; // set to use scene fog
    this.lights = false; // set to use scene lights
    this.clipping = false; // set to use user-defined clipping planes
    this.skinning = false; // set to use skinning attribute streams
    this.morphTargets = false; // set to use morph targets
    this.morphNormals = false; // set to use morph normals
    this.extensions = {
      derivatives: false, // set to use derivatives
      fragDepth: false, // set to use fragment depth values
      drawBuffers: false, // set to use draw buffers
      shaderTextureLOD: false // set to use shader texture LOD
    };
    // When rendered geometry doesn't include these attributes but the material does,
    // use these default values in WebGL. This avoids errors when buffer data is missing.
    this.defaultAttributeValues = {
      'color': [1, 1, 1],
      'uv': [0, 0],
      'uv2': [0, 0]
    };
    this.index0AttributeName = undefined;
    if (parameters !== undefined) {
      this.setValues(parameters);
    }
  }
  copy(source: this): this {
    super.copy(source);
    this.fragmentShader = source.fragmentShader;
    this.vertexShader = source.vertexShader;
    this.uniforms = UniformsUtils.clone(source.uniforms);
    this.defines = source.defines;
    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.lights = source.lights;
    this.clipping = source.clipping;
    this.skinning = source.skinning;
    this.morphTargets = source.morphTargets;
    this.morphNormals = source.morphNormals;
    this.extensions = source.extensions;
    return this;
  }
  toJSON(meta: any): any {
    let data = super.toJSON(meta);
    data.uniforms = this.uniforms;
    data.vertexShader = this.vertexShader;
    data.fragmentShader = this.fragmentShader;
    return data;
  }
  get derivatives(): boolean {
    console.warn("THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives.");
    return this.extensions.derivatives;
  }
  set derivatives(value: boolean) {
    console.warn("THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives.");
    this.extensions.derivatives = value;
  }
}
