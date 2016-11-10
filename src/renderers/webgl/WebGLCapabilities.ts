/**
 * @author mrdoob / http://mrdoob.com/
 */
import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLRendererParameters } from "../WebGLRenderer";
export class WebGLCapabilities {
  gl: WebGLRenderingContext;
  extensions: WebGLExtensions;
  parameters: WebGLRendererParameters;
  maxAnisotropy: number;
  precision: string;
  maxPrecision: string;
  logarithmicDepthBuffer: boolean;
  maxTextures: number;
  maxVertexTextures: number;
  maxTextureSize: number;
  maxCubemapSize: number;
  maxAttributes: number;
  maxVertexUniforms: number;
  maxVaryings: number;
  maxFragmentUniforms: number;
  vertexTextures: boolean;
  floatFragmentTextures: boolean;
  floatVertexTextures: boolean;
  constructor(gl: WebGLRenderingContext, extensions: WebGLExtensions, parameters: WebGLRendererParameters) {
    this.gl = gl;
    this.extensions = extensions;
    this.parameters = parameters;
    this.precision = parameters.precision !== undefined ? parameters.precision : 'highp';
    this.maxPrecision = this.getMaxPrecision(this.precision);
    if (this.maxPrecision !== this.precision) {
      console.warn('THREE.WebGLRenderer:', this.precision, 'not supported, using', this.maxPrecision, 'instead.');
      this.precision = this.maxPrecision;
    }
    this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true && !! extensions.get('EXT_frag_depth');
    this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    this.vertexTextures = this.maxVertexTextures > 0;
    this.floatFragmentTextures = !! extensions.get('OES_texture_float');
    this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;
  }
  getMaxAnisotropy(): number {
    const gl: WebGLRenderingContext = this.gl;
    if (this.maxAnisotropy !== undefined) return this.maxAnisotropy;
    const extension = this.extensions.get('EXT_texture_filter_anisotropic');
    if (extension !== null) {
      this.maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else {
      this.maxAnisotropy = 0;
    }
    return this.maxAnisotropy;
  }
  getMaxPrecision(precision: string): string {
    const gl: WebGLRenderingContext = this.gl;
    if (precision === 'highp') {
      if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
           gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
        return 'highp';
      }
      precision = 'mediump';
    }
    if (precision === 'mediump') {
      if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
           gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
        return 'mediump';
      }
    }
    return 'lowp';
  }
}
