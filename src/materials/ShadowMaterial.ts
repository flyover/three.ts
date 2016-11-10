import { ShaderMaterial, ShaderMaterialParameters } from "./ShaderMaterial";
import { ShaderChunk } from "../renderers/shaders/ShaderChunk";
import { UniformsLib } from "../renderers/shaders/UniformsLib";
import { UniformsUtils } from "../renderers/shaders/UniformsUtils";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export interface ShadowMaterialParameters extends ShaderMaterialParameters {
}
export class ShadowMaterial extends ShaderMaterial {
  readonly isShadowMaterial: boolean = true;
  constructor() {
    super({
      uniforms: UniformsUtils.merge([
        UniformsLib["lights"],
        {
          opacity: { value: 1.0 }
        }
      ]),
      vertexShader: ShaderChunk['shadow_vert'],
      fragmentShader: ShaderChunk['shadow_frag']
    });
    this.lights = true;
    this.transparent = true;
  }
  get opacity(): number { return this.uniforms.opacity.value; }
  set opacity(value: number) { this.uniforms.opacity.value = value; }
}
