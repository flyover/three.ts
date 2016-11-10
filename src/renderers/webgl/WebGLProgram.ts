/**
 * @author mrdoob / http://mrdoob.com/
 */
import { WebGLRenderer } from "../WebGLRenderer";
import { WebGLUniforms } from "./WebGLUniforms";
import { WebGLShader } from "./WebGLShader";
import { WebGLExtensions } from "./WebGLExtensions";
import { ShaderChunk } from "../shaders/ShaderChunk";
import { BlendingOperation, TextureMapping, ShadowMap, ToneMapping, TextureEncoding } from "../../constants";
import { ShaderMaterial } from "../../materials/ShaderMaterial";
import { RawShaderMaterial } from "../../materials/RawShaderMaterial";
let programIdCount: number = 0;
function getEncodingComponents(encoding: number): string[] {
  switch (encoding) {
    case TextureEncoding.Linear:
      return [ 'Linear', '(value)' ];
    case TextureEncoding.sRGB:
      return [ 'sRGB', '(value)' ];
    case TextureEncoding.RGBE:
      return [ 'RGBE', '(value)' ];
    case TextureEncoding.RGBM7:
      return [ 'RGBM', '(value, 7.0)' ];
    case TextureEncoding.RGBM16:
      return [ 'RGBM', '(value, 16.0)' ];
    case TextureEncoding.RGBD:
      return [ 'RGBD', '(value, 256.0)' ];
    case TextureEncoding.Gamma:
      return [ 'Gamma', '(value, float(GAMMA_FACTOR))' ];
    default:
      throw new Error('unsupported encoding: ' + encoding);
  }
}
function getTexelDecodingFunction(functionName: string, encoding: TextureEncoding): string {
  const components = getEncodingComponents(encoding);
  return "vec4 " + functionName + "(vec4 value) { return " + components[0] + "ToLinear" + components[1] + "; }";
}
function getTexelEncodingFunction(functionName: string, encoding: TextureEncoding): string {
  const components = getEncodingComponents(encoding);
  return "vec4 " + functionName + "(vec4 value) { return LinearTo" + components[0] + components[1] + "; }";
}
function getToneMappingFunction(functionName: string, toneMapping: ToneMapping): string {
  let toneMappingName: string;
  switch (toneMapping) {
    case ToneMapping.Linear:
      toneMappingName = "Linear";
      break;
    case ToneMapping.Reinhard:
      toneMappingName = "Reinhard";
      break;
    case ToneMapping.Uncharted2:
      toneMappingName = "Uncharted2";
      break;
    case ToneMapping.Cineon:
      toneMappingName = "OptimizedCineon";
      break;
    default:
      throw new Error('unsupported toneMapping: ' + toneMapping);
  }
  return "vec3 " + functionName + "(vec3 color) { return " + toneMappingName + "ToneMapping(color); }";
}
function generateExtensions(extensions: any, parameters: any, rendererExtensions: WebGLExtensions): string {
  extensions = extensions || {};
  const chunks: string[] = [
    (extensions.derivatives || parameters.envMapCubeUV || parameters.bumpMap || parameters.normalMap || parameters.flatShading) ? '#extension GL_OES_standard_derivatives : enable' : '',
    (extensions.fragDepth || parameters.logarithmicDepthBuffer) && rendererExtensions.get('EXT_frag_depth') ? '#extension GL_EXT_frag_depth : enable' : '',
    (extensions.drawBuffers) && rendererExtensions.get('WEBGL_draw_buffers') ? '#extension GL_EXT_draw_buffers : require' : '',
    (extensions.shaderTextureLOD || parameters.envMap) && rendererExtensions.get('EXT_shader_texture_lod') ? '#extension GL_EXT_shader_texture_lod : enable' : '',
  ];
  return chunks.filter(filterEmptyLine).join('\n');
}
function generateDefines(defines: any[]): string {
  const chunks: string[] = [];
  for (let name in defines) {
    const value = defines[name];
    if (value === false) continue;
    chunks.push('#define ' + name + ' ' + value);
  }
  return chunks.join('\n');
}
function fetchAttributeLocations(gl: WebGLRenderingContext, program: WebGLProgram, identifiers?: any): {[key: string]: number} {
  const attributes = {};
  const n: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i ++) {
    const info: any = gl.getActiveAttrib(program, i);
    const name: string = info.name;
    // console.log("THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:", name, i);
    attributes[name] = gl.getAttribLocation(program, name);
  }
  return attributes;
}
function filterEmptyLine(code: string): boolean {
  return code !== '';
}
function replaceLightNums(code: string, parameters: any): string {
  return code
    .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
    .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights);
}
function parseIncludes(code: string): string {
  const pattern = /#include +<([\w\d.]+)>/g;
  function replace(match: any, include: string): string {
    const replace: string = ShaderChunk[include];
    if (replace === undefined) {
      throw new Error('Can not resolve #include <' + include + '>');
    }
    return parseIncludes(replace);
  }
  return code.replace(pattern, replace);
}
function unrollLoops(code: string): string {
  const pattern = /for \(int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;
  function replace(match: any, start: string, end: string, snippet: string): string {
    let unroll = '';
    for (let i = parseInt(start); i < parseInt(end); i ++) {
      unroll += snippet.replace(/\[i \]/g, '[' + i + ']');
    }
    return unroll;
  }
  return code.replace(pattern, replace);
}
export class WebGLProgram {
  gl: WebGLRenderingContext;
  renderer: WebGLRenderer;
  id: number;
  code: string;
  vertexShader: any; // WebGLShader
  fragmentShader: any; // WebGLShader
  program: any; // WebGLProgram
  cachedUniforms: WebGLUniforms;
  cachedAttributes: {[key: string]: number};
  usedTimes: number;
  diagnostics: any;
  constructor(renderer: WebGLRenderer, code: string, material: any, parameters: any) {
    this.renderer = renderer;
    const gl: WebGLRenderingContext = this.gl = renderer.context;
    const extensions: any = material.extensions;
    const defines: any = material.defines;
    let vertexShader = material.__webglShader.vertexShader;
    let fragmentShader = material.__webglShader.fragmentShader;
    let shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';
    if (parameters.shadowMapType === ShadowMap.PCF) {
      shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';
    } else if (parameters.shadowMapType === ShadowMap.PCFSoft) {
      shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';
    }
    let envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
    let envMapModeDefine = 'ENVMAP_MODE_REFLECTION';
    let envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
    if (parameters.envMap) {
      switch (material.envMap.mapping) {
        case TextureMapping.CubeReflection:
        case TextureMapping.CubeRefraction:
          envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
          break;
        case TextureMapping.CubeUVReflection:
        case TextureMapping.CubeUVRefraction:
          envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
          break;
        case TextureMapping.EquirectangularReflection:
        case TextureMapping.EquirectangularRefraction:
          envMapTypeDefine = 'ENVMAP_TYPE_EQUIREC';
          break;
        case TextureMapping.SphericalReflection:
          envMapTypeDefine = 'ENVMAP_TYPE_SPHERE';
          break;
      }
      switch (material.envMap.mapping) {
        case TextureMapping.CubeRefraction:
        case TextureMapping.EquirectangularRefraction:
          envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
          break;
      }
      switch (material.combine) {
        case BlendingOperation.Multiply:
          envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
          break;
        case BlendingOperation.Mix:
          envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
          break;
        case BlendingOperation.Add:
          envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
          break;
      }
    }
    const gammaFactorDefine: number = (renderer.gammaFactor > 0) ? renderer.gammaFactor : 1.0;
    // console.log('building new program ');
    //
    const customExtensions: string = generateExtensions(extensions, parameters, renderer.extensions);
    const customDefines: string = generateDefines(defines);
    //
    const program: any /*WebGLProgram*/ = gl.createProgram();
    let prefixVertex: string, prefixFragment: string;
    if (material instanceof RawShaderMaterial) {
      prefixVertex = [
        customDefines,
        '\n'
      ].filter(filterEmptyLine).join('\n');
      prefixFragment = [
        customExtensions,
        customDefines,
        '\n'
      ].filter(filterEmptyLine).join('\n');
    } else {
      prefixVertex = [
        'precision ' + parameters.precision + ' float;',
        'precision ' + parameters.precision + ' int;',
        '#define SHADER_NAME ' + material.__webglShader.name,
        customDefines,
        parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',
        '#define GAMMA_FACTOR ' + gammaFactorDefine,
        '#define MAX_BONES ' + parameters.maxBones,
        parameters.map ? '#define USE_MAP' : '',
        parameters.envMap ? '#define USE_ENVMAP' : '',
        parameters.envMap ? '#define ' + envMapModeDefine : '',
        parameters.lightMap ? '#define USE_LIGHTMAP' : '',
        parameters.aoMap ? '#define USE_AOMAP' : '',
        parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
        parameters.bumpMap ? '#define USE_BUMPMAP' : '',
        parameters.normalMap ? '#define USE_NORMALMAP' : '',
        parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
        parameters.specularMap ? '#define USE_SPECULARMAP' : '',
        parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
        parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
        parameters.vertexColors ? '#define USE_COLOR' : '',
        parameters.flatShading ? '#define FLAT_SHADED' : '',
        parameters.skinning ? '#define USE_SKINNING' : '',
        parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',
        parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
        parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
        parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
        parameters.flipSided ? '#define FLIP_SIDED' : '',
        '#define NUM_CLIPPING_PLANES ' + parameters.numClippingPlanes,
        parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
        parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',
        parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
        parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',
        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat3 normalMatrix;',
        'uniform vec3 cameraPosition;',
        'attribute vec3 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',
        '#ifdef USE_COLOR',
        '  attribute vec3 color;',
        '#endif',
        '#ifdef USE_MORPHTARGETS',
        '  attribute vec3 morphTarget0;',
        '  attribute vec3 morphTarget1;',
        '  attribute vec3 morphTarget2;',
        '  attribute vec3 morphTarget3;',
        '  #ifdef USE_MORPHNORMALS',
        '    attribute vec3 morphNormal0;',
        '    attribute vec3 morphNormal1;',
        '    attribute vec3 morphNormal2;',
        '    attribute vec3 morphNormal3;',
        '  #else',
        '    attribute vec3 morphTarget4;',
        '    attribute vec3 morphTarget5;',
        '    attribute vec3 morphTarget6;',
        '    attribute vec3 morphTarget7;',
        '  #endif',
        '#endif',
        '#ifdef USE_SKINNING',
        '  attribute vec4 skinIndex;',
        '  attribute vec4 skinWeight;',
        '#endif',
        '\n'
      ].filter(filterEmptyLine).join('\n');
      prefixFragment = [
        customExtensions,
        'precision ' + parameters.precision + ' float;',
        'precision ' + parameters.precision + ' int;',
        '#define SHADER_NAME ' + material.__webglShader.name,
        customDefines,
        parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest : '',
        '#define GAMMA_FACTOR ' + gammaFactorDefine,
        (parameters.useFog && parameters.fog) ? '#define USE_FOG' : '',
        (parameters.useFog && parameters.fogExp) ? '#define FOG_EXP2' : '',
        parameters.map ? '#define USE_MAP' : '',
        parameters.envMap ? '#define USE_ENVMAP' : '',
        parameters.envMap ? '#define ' + envMapTypeDefine : '',
        parameters.envMap ? '#define ' + envMapModeDefine : '',
        parameters.envMap ? '#define ' + envMapBlendingDefine : '',
        parameters.lightMap ? '#define USE_LIGHTMAP' : '',
        parameters.aoMap ? '#define USE_AOMAP' : '',
        parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',
        parameters.bumpMap ? '#define USE_BUMPMAP' : '',
        parameters.normalMap ? '#define USE_NORMALMAP' : '',
        parameters.specularMap ? '#define USE_SPECULARMAP' : '',
        parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
        parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
        parameters.vertexColors ? '#define USE_COLOR' : '',
        parameters.flatShading ? '#define FLAT_SHADED' : '',
        parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
        parameters.flipSided ? '#define FLIP_SIDED' : '',
        '#define NUM_CLIPPING_PLANES ' + parameters.numClippingPlanes,
        '#define UNION_CLIPPING_PLANES ' + (parameters.numClippingPlanes - parameters.numClipIntersection),
        parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',
        parameters.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : '',
        parameters.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : '',
        parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
        parameters.logarithmicDepthBuffer && renderer.extensions.get('EXT_frag_depth') ? '#define USE_LOGDEPTHBUF_EXT' : '',
        parameters.envMap && renderer.extensions.get('EXT_shader_texture_lod') ? '#define TEXTURE_LOD_EXT' : '',
        'uniform mat4 viewMatrix;',
        'uniform vec3 cameraPosition;',
        (parameters.toneMapping !== ToneMapping.None) ? "#define TONE_MAPPING" : '',
        (parameters.toneMapping !== ToneMapping.None) ? ShaderChunk['tonemapping_pars_fragment'] : '',  // this code is required here because it is used by the toneMapping() function defined below
        (parameters.toneMapping !== ToneMapping.None) ? getToneMappingFunction("toneMapping", parameters.toneMapping) : '',
        (parameters.outputEncoding || parameters.mapEncoding || parameters.envMapEncoding || parameters.emissiveMapEncoding) ? ShaderChunk['encodings_pars_fragment'] : '', // this code is required here because it is used by the various encoding/decoding function defined below
        parameters.mapEncoding ? getTexelDecodingFunction('mapTexelToLinear', parameters.mapEncoding) : '',
        parameters.envMapEncoding ? getTexelDecodingFunction('envMapTexelToLinear', parameters.envMapEncoding) : '',
        parameters.emissiveMapEncoding ? getTexelDecodingFunction('emissiveMapTexelToLinear', parameters.emissiveMapEncoding) : '',
        parameters.outputEncoding ? getTexelEncodingFunction("linearToOutputTexel", parameters.outputEncoding) : '',
        parameters.depthPacking ? "#define DEPTH_PACKING " + material.depthPacking : '',
        '\n'
      ].filter(filterEmptyLine).join('\n');
    }
    vertexShader = parseIncludes(vertexShader/*, parameters*/);
    vertexShader = replaceLightNums(vertexShader, parameters);
    fragmentShader = parseIncludes(fragmentShader/*, parameters*/);
    fragmentShader = replaceLightNums(fragmentShader, parameters);
    if (! (material instanceof ShaderMaterial)) {
      vertexShader = unrollLoops(vertexShader);
      fragmentShader = unrollLoops(fragmentShader);
    }
    const vertexGlsl: string = prefixVertex + vertexShader;
    const fragmentGlsl: string = prefixFragment + fragmentShader;
    // console.log('*VERTEX*', vertexGlsl);
    // console.log('*FRAGMENT*', fragmentGlsl);
    const glVertexShader: WebGLShader = WebGLShader(gl, gl.VERTEX_SHADER, vertexGlsl);
    const glFragmentShader: WebGLShader = WebGLShader(gl, gl.FRAGMENT_SHADER, fragmentGlsl);
    gl.attachShader(program, glVertexShader);
    gl.attachShader(program, glFragmentShader);
    // Force a particular attribute to index 0.
    if (material.index0AttributeName !== undefined) {
      gl.bindAttribLocation(program, 0, material.index0AttributeName);
    } else if (parameters.morphTargets === true) {
      // programs with morphTargets displace position out of attribute 0
      gl.bindAttribLocation(program, 0, 'position');
    }
    gl.linkProgram(program);
    const programLog: string = gl.getProgramInfoLog(program);
    const vertexLog: string = gl.getShaderInfoLog(glVertexShader);
    const fragmentLog: string = gl.getShaderInfoLog(glFragmentShader);
    let runnable: boolean = true;
    let haveDiagnostics: boolean = true;
    // console.log('**VERTEX**', gl.getExtension('WEBGL_debug_shaders').getTranslatedShaderSource(glVertexShader));
    // console.log('**FRAGMENT**', gl.getExtension('WEBGL_debug_shaders').getTranslatedShaderSource(glFragmentShader));
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
      runnable = false;
      console.error('THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.VALIDATE_STATUS', gl.getProgramParameter(program, gl.VALIDATE_STATUS), 'gl.getProgramInfoLog', programLog, vertexLog, fragmentLog);
    } else if (programLog !== '') {
      console.warn('THREE.WebGLProgram: gl.getProgramInfoLog()', programLog);
    } else if (vertexLog === '' || fragmentLog === '') {
      haveDiagnostics = false;
    }
    if (haveDiagnostics) {
      this.diagnostics = {
        runnable: runnable,
        material: material,
        programLog: programLog,
        vertexShader: {
          log: vertexLog,
          prefix: prefixVertex
        },
        fragmentShader: {
          log: fragmentLog,
          prefix: prefixFragment
        }
      };
    }
    // clean up
    gl.deleteShader(glVertexShader);
    gl.deleteShader(glFragmentShader);
    //
    this.id = programIdCount ++;
    this.code = code;
    this.usedTimes = 1;
    this.program = program;
    this.vertexShader = glVertexShader;
    this.fragmentShader = glFragmentShader;
  }
  // set up caching for uniform locations
  getUniforms(): WebGLUniforms {
    const gl: WebGLRenderingContext = this.gl;
    if (this.cachedUniforms === undefined) {
      this.cachedUniforms = new WebGLUniforms(gl, this.program, this.renderer);
    }
    return this.cachedUniforms;
  }
  // set up caching for attribute locations
  getAttributes(): any /*{[key: string]: number}*/ {
    const gl: WebGLRenderingContext = this.gl;
    if (this.cachedAttributes === undefined) {
      this.cachedAttributes = fetchAttributeLocations(gl, this.program);
    }
    return this.cachedAttributes;
  }
  // free resource
  destroy(): void {
    const gl: WebGLRenderingContext = this.gl;
    gl.deleteProgram(this.program);
    this.program = undefined;
  }
  // DEPRECATED
  get uniforms(): WebGLUniforms {
    console.warn('THREE.WebGLProgram: .uniforms is now .getUniforms().');
    return this.getUniforms();
  }
  get attributes(): {[key: string]: number} {
    console.warn('THREE.WebGLProgram: .attributes is now .getAttributes().');
    return this.getAttributes();
  }
}
