/**
 * @author mrdoob / http://mrdoob.com/
 */
import { WebGLRenderer } from "../WebGLRenderer";
import { WebGLProgram } from "./WebGLProgram";
import { WebGLRenderTarget } from "../WebGLRenderTarget";
import { WebGLCapabilities } from "./WebGLCapabilities";
import { SideMode, ShadingMode, TextureMapping, TextureEncoding } from "../../constants";
import { Object3D } from "../../core/Object3D";
import { SkinnedMesh } from "../../objects/SkinnedMesh";
import { Fog } from "../../scenes/Fog";
import { FogExp2 } from "../../scenes/FogExp2";
import { Texture } from "../../textures/Texture";
export class WebGLPrograms {
  renderer: WebGLRenderer;
  capabilities: WebGLCapabilities;
  programs: WebGLProgram[];
  constructor(renderer: WebGLRenderer, capabilities: WebGLCapabilities) {
    this.renderer = renderer;
    this.capabilities = capabilities;
    const programs: any = [];
    // Exposed for resource monitoring & error feedback via renderer.info:
    this.programs = programs;
  }
  getParameters(material: any, lights: any, fog: Fog | FogExp2, nClipPlanes: number, nClipIntersection: number, object: Object3D): any {
    const capabilities = this.capabilities;
    function allocateBones(object: Object3D): number {
      if (capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture) {
        return 1024;
      } else {
        // default for when object is not specified
        // (for example when prebuilding shader to be used with multiple objects)
        //
        //  - leave some extra space for other uniforms
        //  - limit here is ANGLE's 254 max uniform vectors
        //    (up to 54 should be safe)
        const nVertexUniforms = capabilities.maxVertexUniforms;
        const nVertexMatrices = Math.floor((nVertexUniforms - 20) / 4);
        let maxBones = nVertexMatrices;
        if (object !== undefined && (object && object instanceof SkinnedMesh)) {
          maxBones = Math.min(object.skeleton.bones.length, maxBones);
          if (maxBones < object.skeleton.bones.length) {
            console.warn('WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)');
          }
        }
        return maxBones;
      }
    }
    function getTextureEncodingFromMap(map: any, gammaOverrideLinear: boolean): number {
      let encoding;
      if (! map) {
        encoding = TextureEncoding.Linear;
      } else if ((map && map instanceof Texture)) {
        encoding = map.encoding;
      } else if ((map && map instanceof WebGLRenderTarget)) {
        console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead.");
        encoding = map.texture.encoding;
      }
      // add backwards compatibility for WebGLRenderer.gammaInput/gammaOutput parameter, should probably be removed at some point.
      if (encoding === TextureEncoding.Linear && gammaOverrideLinear) {
        encoding = TextureEncoding.Gamma;
      }
      return encoding;
    }
    const shaderIDs = {
      MeshDepthMaterial: 'depth',
      MeshNormalMaterial: 'normal',
      MeshBasicMaterial: 'basic',
      MeshLambertMaterial: 'lambert',
      MeshPhongMaterial: 'phong',
      MeshStandardMaterial: 'physical',
      MeshPhysicalMaterial: 'physical',
      LineBasicMaterial: 'basic',
      LineDashedMaterial: 'dashed',
      PointsMaterial: 'points'
    };
    const shaderID = shaderIDs[material.type];
    // heuristics to create shader parameters according to lights in the scene
    // (not to blow over maxLights budget)
    const maxBones: number = allocateBones(object);
    let precision: string = this.renderer.getPrecision();
    if (material.precision !== null) {
      precision = capabilities.getMaxPrecision(material.precision);
      if (precision !== material.precision) {
        console.warn('THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.');
      }
    }
    const currentRenderTarget = this.renderer.getCurrentRenderTarget();
    const parameters = {
      shaderID: shaderID,
      precision: precision,
      supportsVertexTextures: capabilities.vertexTextures,
      outputEncoding: getTextureEncodingFromMap((! currentRenderTarget) ? null : currentRenderTarget.texture, this.renderer.gammaOutput),
      map: !! material.map,
      mapEncoding: getTextureEncodingFromMap(material.map, this.renderer.gammaInput),
      envMap: !! material.envMap,
      envMapMode: material.envMap && material.envMap.mapping,
      envMapEncoding: getTextureEncodingFromMap(material.envMap, this.renderer.gammaInput),
      envMapCubeUV: (!! material.envMap) && ((material.envMap.mapping === TextureMapping.CubeUVReflection) || (material.envMap.mapping === TextureMapping.CubeUVRefraction)),
      lightMap: !! material.lightMap,
      aoMap: !! material.aoMap,
      emissiveMap: !! material.emissiveMap,
      emissiveMapEncoding: getTextureEncodingFromMap(material.emissiveMap, this.renderer.gammaInput),
      bumpMap: !! material.bumpMap,
      normalMap: !! material.normalMap,
      displacementMap: !! material.displacementMap,
      roughnessMap: !! material.roughnessMap,
      metalnessMap: !! material.metalnessMap,
      specularMap: !! material.specularMap,
      alphaMap: !! material.alphaMap,
      combine: material.combine,
      vertexColors: material.vertexColors,
      fog: !! fog,
      useFog: material.fog,
      fogExp: (fog && fog instanceof FogExp2),
      flatShading: material.shading === ShadingMode.Flat,
      sizeAttenuation: material.sizeAttenuation,
      logarithmicDepthBuffer: capabilities.logarithmicDepthBuffer,
      skinning: material.skinning,
      maxBones: maxBones,
      useVertexTexture: capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,
      morphTargets: material.morphTargets,
      morphNormals: material.morphNormals,
      maxMorphTargets: this.renderer.maxMorphTargets,
      maxMorphNormals: this.renderer.maxMorphNormals,
      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numHemiLights: lights.hemi.length,
      numClippingPlanes: nClipPlanes,
      numClipIntersection: nClipIntersection,
      shadowMapEnabled: this.renderer.shadowMap.enabled && object.receiveShadow && lights.shadows.length > 0,
      shadowMapType: this.renderer.shadowMap.type,
      toneMapping: this.renderer.toneMapping,
      physicallyCorrectLights: this.renderer.physicallyCorrectLights,
      premultipliedAlpha: material.premultipliedAlpha,
      alphaTest: material.alphaTest,
      doubleSided: material.side === SideMode.Double,
      flipSided: material.side === SideMode.Back,
      depthPacking: (material.depthPacking !== undefined) ? material.depthPacking : false
    };
    return parameters;
  }
  getProgramCode(material: any /*Material*/, parameters: any): string {
    const parameterNames = [
      "precision", "supportsVertexTextures", "map", "mapEncoding", "envMap", "envMapMode", "envMapEncoding",
      "lightMap", "aoMap", "emissiveMap", "emissiveMapEncoding", "bumpMap", "normalMap", "displacementMap", "specularMap",
      "roughnessMap", "metalnessMap",
      "alphaMap", "combine", "vertexColors", "fog", "useFog", "fogExp",
      "flatShading", "sizeAttenuation", "logarithmicDepthBuffer", "skinning",
      "maxBones", "useVertexTexture", "morphTargets", "morphNormals",
      "maxMorphTargets", "maxMorphNormals", "premultipliedAlpha",
      "numDirLights", "numPointLights", "numSpotLights", "numHemiLights",
      "shadowMapEnabled", "shadowMapType", "toneMapping", 'physicallyCorrectLights',
      "alphaTest", "doubleSided", "flipSided", "numClippingPlanes", "numClipIntersection", "depthPacking"
    ];
    const array = [];
    if (parameters.shaderID) {
      array.push(parameters.shaderID);
    } else {
      array.push(material.fragmentShader);
      array.push(material.vertexShader);
    }
    if (material.defines !== undefined) {
      for (let name in material.defines) {
        array.push(name);
        array.push(material.defines[name]);
      }
    }
    for (let i = 0; i < parameterNames.length; i ++) {
      array.push(parameters[parameterNames[i]]);
    }
    return array.join();
  }
  acquireProgram(material: any /*Material*/, parameters: any, code: string): WebGLProgram {
    let program;
    // Check if code has been already compiled
    for (let p = 0, pl = this.programs.length; p < pl; p ++) {
      const programInfo = this.programs[p];
      if (programInfo.code === code) {
        program = programInfo;
        ++ program.usedTimes;
        break;
      }
    }
    if (program === undefined) {
      program = new WebGLProgram(this.renderer, code, material, parameters);
      this.programs.push(program);
    }
    return program;
  }
  releaseProgram(program: WebGLProgram): void {
    if (-- program.usedTimes === 0) {
      // Remove from unordered set
      const i = this.programs.indexOf(program);
      this.programs[i] = this.programs[this.programs.length - 1];
      this.programs.pop();
      // Free WebGL resources
      program.destroy();
    }
  }
}
