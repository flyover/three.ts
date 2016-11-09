/**
 * @author takahirox / http://github.com/takahirox/
 *
 * Reference: https://en.wikipedia.org/wiki/Cel_shading
 *
 * // How to set default outline parameters
 * new THREE.OutlineEffect(renderer, {
 *   defaultThickNess: 0.01,
 *   defaultColor: new THREE.Color(0x888888),
 *   defaultAlpha: 0.8
 * });
 *
 * // How to set outline parameters for each material
 * material.outlineParameters = {
 *   thickNess: 0.01,
 *   color: new THREE.Color(0x888888),
 *   alpha: 0.8,
 *   visible: true
 * };
 *
 * TODO
 *  - shared material
 *  - support shader material without objectNormal in its vertexShader
 */
import * as THREE from '../../../src/Three';
export class OutlineEffect {
  renderer;
  shaderIDs;
  uniformsChunk;
  vertexShaderChunk;
  vertexShaderChunk2;
  fragmentShader;
  invisibleMaterial;
  autoClear: boolean;
  constructor(renderer, parameters?) {
    //const _this = this;
    this.renderer = renderer;
    parameters = parameters || {};
    this.autoClear = parameters.autoClear !== undefined ? parameters.autoClear : true;
    const defaultThickness = parameters.defaultThickness !== undefined ? parameters.defaultThickness : 0.003;
    const defaultColor = parameters.defaultColor !== undefined ? parameters.defaultColor : new THREE.Color(0x000000);
    const defaultAlpha = parameters.defaultAlpha !== undefined ? parameters.defaultAlpha : 1.0;
    this.invisibleMaterial = new THREE.ShaderMaterial({ visible: false });
    // copied from WebGLPrograms and removed some materials
    this.shaderIDs = {
      MeshBasicMaterial: 'basic',
      MeshLambertMaterial: 'lambert',
      MeshPhongMaterial: 'phong',
      MeshStandardMaterial: 'physical',
      MeshPhysicalMaterial: 'physical'
    };
    this.uniformsChunk = {
      outlineThickness: { type: "f", value: defaultThickness },
      outlineColor: { type: "c", value: defaultColor },
      outlineAlpha: { type: "f", value: defaultAlpha }
    };
    this.vertexShaderChunk = [
      "uniform float outlineThickness;",
      "vec4 calculateOutline(vec4 pos, vec3 objectNormal, vec4 skinned) {",
      "  float thickness = outlineThickness;",
      "  float ratio = 1.0;", // TODO: support outline thickness ratio for each vertex
      "  vec4 pos2 = projectionMatrix * modelViewMatrix * vec4(skinned.xyz + objectNormal, 1.0);",
      // NOTE: subtract pos2 from pos because BackSide objectNormal is negative
      "  vec4 norm = normalize(pos - pos2);",
      "  return pos + norm * thickness * pos.w * ratio;",
      "}",
    ].join("\n");
    this.vertexShaderChunk2 = [
      "#if ! defined(LAMBERT) && ! defined(PHONG) && ! defined(PHYSICAL)",
      "  #ifndef USE_ENVMAP",
      "    vec3 objectNormal = normalize(normal);",
      "    #ifdef FLIP_SIDED",
      "      objectNormal = -objectNormal;",
      "    #endif",
      "  #endif",
      "#endif",
      "#ifdef USE_SKINNING",
      "  gl_Position = calculateOutline(gl_Position, objectNormal, skinned);",
      "#else",
      "  gl_Position = calculateOutline(gl_Position, objectNormal, vec4(transformed, 1.0));",
      "#endif",
    ].join("\n");
    this.fragmentShader = [
      "#include <common>",
      "#include <fog_pars_fragment>",
      "uniform vec3 outlineColor;",
      "uniform float outlineAlpha;",
      "void main() {",
      "  gl_FragColor = vec4(outlineColor, outlineAlpha);",
      "  #include <fog_fragment>",
      "}",
    ].join("\n");
  }
  private createMaterial(originalMaterial) {
    const shaderID = this.shaderIDs[ originalMaterial.type ];
    let originalUniforms, originalVertexShader;
    const outlineParameters = originalMaterial.outlineParameters;
    if (shaderID !== undefined) {
      const shader = THREE.ShaderLib[ shaderID ];
      originalUniforms = shader.uniforms;
      originalVertexShader = shader.vertexShader;
    } else if (originalMaterial.isShaderMaterial === true) {
      originalUniforms = originalMaterial.uniforms;
      originalVertexShader = originalMaterial.vertexShader;
    } else {
      return this.invisibleMaterial;
    }
    const uniforms = THREE.UniformsUtils.merge([
      originalUniforms,
      this.uniformsChunk
    ]);
    const vertexShader = originalVertexShader
          // put vertexShaderChunk right before "void main() {...}"
          .replace(/void\s+main\s*\(\s*\)/, this.vertexShaderChunk + '\nvoid main()')
          // put vertexShaderChunk2 the end of "void main() {...}"
          // Note: here assums originalVertexShader ends with "}" of "void main() {...}"
          .replace(/\}\s*$/, this.vertexShaderChunk2 + '\n}')
          // remove any light related lines
          // Note: here is very sensitive to originalVertexShader
          // TODO: consider safer way
          .replace(/#include\s+<[\w_]*light[\w_]*>/g, '');
    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(uniforms),
      vertexShader: vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE.BackSide,
      //wireframe: true,
      skinning: false,
      morphTargets: false,
      morphNormals: false,
      fog: false
    });
    return material;
  }
  private createMultiMaterial(originalMaterial) {
    const materials = [];
    for (let i = 0, il = originalMaterial.materials.length; i < il; i ++) {
      materials.push(this.createMaterial(originalMaterial.materials[ i ]));
    }
    return new THREE.MultiMaterial(materials);
  }
  private setOutlineMaterial(object) {
    if (object.material === undefined) return;
    object.userData.originalMaterial = object.material;
    if (object.userData.outlineMaterial === undefined) {
      object.userData.outlineMaterial = object.material.type === 'MultiMaterial' ? this.createMultiMaterial(object.material) : this.createMaterial(object.material);
    }
    if (object.userData.outlineMaterial.type === 'MultiMaterial') {
      this.updateOutlineMultiMaterial(object.userData.outlineMaterial, object.userData.originalMaterial);
    } else {
      this.updateOutlineMaterial(object.userData.outlineMaterial, object.userData.originalMaterial);
    }
    object.material = object.userData.outlineMaterial;
  }
  private updateOutlineMaterial(material, originalMaterial) {
    if (material === this.invisibleMaterial) return;
    const outlineParameters = originalMaterial.outlineParameters;
    material.skinning = originalMaterial.skinning;
    material.morphTargets = originalMaterial.morphTargets;
    material.morphNormals = originalMaterial.morphNormals;
    material.fog = originalMaterial.fog;
    material.visible = originalMaterial.visible;
    material.uniforms.outlineAlpha.value = originalMaterial.opacity;
    if (outlineParameters !== undefined) {
      if (outlineParameters.thickness !== undefined) material.uniforms.outlineThickness.value = outlineParameters.thickness;
      if (outlineParameters.color !== undefined) material.uniforms.outlineColor.value.copy(outlineParameters.color);
      if (outlineParameters.alpha !== undefined) material.uniforms.outlineAlpha.value = outlineParameters.alpha;
      if (outlineParameters.visible !== undefined) material.visible = outlineParameters.visible;
    }
    if (material.uniforms.outlineAlpha.value < 1.0) material.transparent = true;
  }
  private updateOutlineMultiMaterial(material, originalMaterial) {
    const outlineParameters = originalMaterial.outlineParameters;
    material.visible = originalMaterial.visible;
    if (outlineParameters !== undefined) {
      if (outlineParameters.visible !== undefined) material.visible = outlineParameters.visible;
    }
    for (let i = 0, il = material.materials.length; i < il; i ++) {
      this.updateOutlineMaterial(material.materials[ i ], originalMaterial.materials[ i ]);
    }
  }
  private restoreOriginalMaterial(object) {
    if (object.userData.originalMaterial !== undefined) object.material = object.userData.originalMaterial;
  }
  setSize(width, height) {
    this.renderer.setSize(width, height);
  }
  render(scene, camera, renderTarget, forceClear) {
    const currentAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = this.autoClear;
    // 1. render normally
    this.renderer.render(scene, camera, renderTarget, forceClear);
    // 2. render outline
    const currentSceneAutoUpdate = scene.autoUpdate;
    const currentShadowMapEnabled = this.renderer.shadowMap.enabled;
    scene.autoUpdate = false;
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = false;
    scene.traverse(this.setOutlineMaterial.bind(this));
    this.renderer.render(scene, camera, renderTarget);
    scene.traverse(this.restoreOriginalMaterial.bind(this));
    scene.autoUpdate = currentSceneAutoUpdate;
    this.renderer.autoClear = currentAutoClear;
    this.renderer.shadowMap.enabled = currentShadowMapEnabled;
  }
}
