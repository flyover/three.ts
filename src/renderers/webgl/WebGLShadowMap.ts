/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
import { SideMode, TextureFormat, TextureFilter, ShadowMap, DepthPacking } from "../../constants";
import { CullFace } from "../../constants";
import { WebGLRenderTarget } from "../WebGLRenderTarget";
import { ShaderMaterial } from "../../materials/ShaderMaterial";
import { UniformsUtils } from "../shaders/UniformsUtils";
import { ShaderLib } from "../shaders/ShaderLib";
import { MeshDepthMaterial } from "../../materials/MeshDepthMaterial";
import { Vector4 } from "../../math/Vector4";
import { Vector3 } from "../../math/Vector3";
import { Vector2 } from "../../math/Vector2";
import { Matrix4 } from "../../math/Matrix4";
import { Frustum } from "../../math/Frustum";
import { PointLight } from "../../lights/PointLight";
import { SpotLightShadow } from "../../lights/SpotLightShadow";
import { MultiMaterial } from "../../materials/MultiMaterial";
import { BufferGeometry } from "../../core/BufferGeometry";
import { Geometry } from "../../core/Geometry";
import { SkinnedMesh } from "../../objects/SkinnedMesh";
import { Mesh } from "../../objects/Mesh";
import { Line } from "../../objects/Line";
import { Points } from "../../objects/Points";
export class WebGLShadowMap {
  _renderer: any;
  _lights: any;
  _objects: any;
  capabilities: any;
  _gl: any;
  _state: any;
  _frustum: any;
  _projScreenMatrix: any;
  _lightShadows: any;
  _shadowMapSize: any;
  _maxShadowMapSize: any;
  _lookTarget: any;
  _lightPositionWorld: any;
  _renderList: any;
  _MorphingFlag: any;
  _SkinningFlag: any;
  _NumberOfMaterialVariants: any;
  _depthMaterials: any;
  _distanceMaterials: any;
  _materialCache: any;
  cubeDirections: any;
  cubeUps: any;
  cube2DViewPorts: any;
  enabled: any;
  autoUpdate: any;
  needsUpdate: any;
  type: ShadowMap;
  renderReverseSided: any;
  renderSingleSided: any;
  constructor(_renderer: any, _lights: any, _objects: any, capabilities: any) {
    this._renderer = _renderer;
    this._lights = _lights;
    this._objects = _objects;
    this.capabilities = capabilities;
    this._gl = _renderer.context;
    this._state = _renderer.state;
    this._frustum = new Frustum();
    this._projScreenMatrix = new Matrix4();
    this._lightShadows = _lights.shadows;
    this._shadowMapSize = new Vector2();
    this._maxShadowMapSize = new Vector2(capabilities.maxTextureSize, capabilities.maxTextureSize);
    this._lookTarget = new Vector3();
    this._lightPositionWorld = new Vector3();
    this._renderList = [];
    this._MorphingFlag = 1;
    this._SkinningFlag = 2;
    this._NumberOfMaterialVariants = (this._MorphingFlag | this._SkinningFlag) + 1;
    this._depthMaterials = new Array(this._NumberOfMaterialVariants);
    this._distanceMaterials = new Array(this._NumberOfMaterialVariants);
    this._materialCache = {};
    this.cubeDirections = [
      new Vector3(1, 0, 0), new Vector3(- 1, 0, 0), new Vector3(0, 0, 1),
      new Vector3(0, 0, - 1), new Vector3(0, 1, 0), new Vector3(0, - 1, 0)
    ];
    this.cubeUps = [
      new Vector3(0, 1, 0), new Vector3(0, 1, 0), new Vector3(0, 1, 0),
      new Vector3(0, 1, 0), new Vector3(0, 0, 1),  new Vector3(0, 0, - 1)
    ];
    this.cube2DViewPorts = [
      new Vector4(), new Vector4(), new Vector4(),
      new Vector4(), new Vector4(), new Vector4()
    ];
    // init
    const depthMaterialTemplate = new MeshDepthMaterial();
    depthMaterialTemplate.depthPacking = DepthPacking.RGBA;
    depthMaterialTemplate.clipping = true;
    const distanceShader = ShaderLib["distanceRGBA"];
    const distanceUniforms = UniformsUtils.clone(distanceShader.uniforms);
    for (let i = 0; i !== this._NumberOfMaterialVariants; ++ i) {
      const useMorphing = (i & this._MorphingFlag) !== 0;
      const useSkinning = (i & this._SkinningFlag) !== 0;
      const depthMaterial = depthMaterialTemplate.clone();
      depthMaterial.morphTargets = useMorphing;
      depthMaterial.skinning = useSkinning;
      this._depthMaterials[i] = depthMaterial;
      const distanceMaterial = new ShaderMaterial({
        defines: {
          'USE_SHADOWMAP': ''
        },
        uniforms: distanceUniforms,
        vertexShader: distanceShader.vertexShader,
        fragmentShader: distanceShader.fragmentShader,
        morphTargets: useMorphing,
        skinning: useSkinning,
        clipping: true
      });
      this._distanceMaterials[i] = distanceMaterial;
    }
    //
    this.enabled = false;
    this.autoUpdate = true;
    this.needsUpdate = false;
    this.type = ShadowMap.PCF;
    this.renderReverseSided = true;
    this.renderSingleSided = true;
  }
  render(scene: any, camera: any) {
    if (this.enabled === false) return;
    if (this.autoUpdate === false && this.needsUpdate === false) return;
    if (this._lightShadows.length === 0) return;
    // Set GL state for depth map.
    this._state.clearColor(1, 1, 1, 1);
    this._state.disable(this._gl.BLEND);
    this._state.setDepthTest(true);
    this._state.setScissorTest(false);
    // render depth map
    let faceCount, isPointLight;
    for (let i = 0, il = this._lightShadows.length; i < il; i ++) {
      const light = this._lightShadows[i];
      const shadow = light.shadow;
      if (shadow === undefined) {
        console.warn('THREE.WebGLShadowMap:', light, 'has no shadow.');
        continue;
      }
      const shadowCamera = shadow.camera;
      this._shadowMapSize.copy(shadow.mapSize);
      this._shadowMapSize.min(this._maxShadowMapSize);
      if ((light && light instanceof PointLight)) {
        faceCount = 6;
        isPointLight = true;
        const vpWidth = this._shadowMapSize.x;
        const vpHeight = this._shadowMapSize.y;
        // These viewports map a cube-map onto a 2D texture with the
        // following orientation:
        //
        //  xzXZ
        //   y Y
        //
        // X - Positive x direction
        // x - Negative x direction
        // Y - Positive y direction
        // y - Negative y direction
        // Z - Positive z direction
        // z - Negative z direction
        // positive X
        this.cube2DViewPorts[0].set(vpWidth * 2, vpHeight, vpWidth, vpHeight);
        // negative X
        this.cube2DViewPorts[1].set(0, vpHeight, vpWidth, vpHeight);
        // positive Z
        this.cube2DViewPorts[2].set(vpWidth * 3, vpHeight, vpWidth, vpHeight);
        // negative Z
        this.cube2DViewPorts[3].set(vpWidth, vpHeight, vpWidth, vpHeight);
        // positive Y
        this.cube2DViewPorts[4].set(vpWidth * 3, 0, vpWidth, vpHeight);
        // negative Y
        this.cube2DViewPorts[5].set(vpWidth, 0, vpWidth, vpHeight);
        this._shadowMapSize.x *= 4.0;
        this._shadowMapSize.y *= 2.0;
      } else {
        faceCount = 1;
        isPointLight = false;
      }
      if (shadow.map === null) {
        const pars = { minFilter: TextureFilter.Nearest, magFilter: TextureFilter.Nearest, format: TextureFormat.RGBA };
        shadow.map = new WebGLRenderTarget(this._shadowMapSize.x, this._shadowMapSize.y, pars);
        shadowCamera.updateProjectionMatrix();
      }
      if ((shadow && shadow instanceof SpotLightShadow)) {
        shadow.update(light);
      }
      const shadowMap = shadow.map;
      const shadowMatrix = shadow.matrix;
      this._lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
      shadowCamera.position.copy(this._lightPositionWorld);
      this._renderer.setRenderTarget(shadowMap);
      this._renderer.clear();
      // render shadow map for each cube face (if omni-directional) or
      // run a single pass if not
      for (let face = 0; face < faceCount; face ++) {
        if (isPointLight) {
          this._lookTarget.copy(shadowCamera.position);
          this._lookTarget.add(this.cubeDirections[face]);
          shadowCamera.up.copy(this.cubeUps[face]);
          shadowCamera.lookAt(this._lookTarget);
          const vpDimensions = this.cube2DViewPorts[face];
          this._state.viewport(vpDimensions);
        } else {
          this._lookTarget.setFromMatrixPosition(light.target.matrixWorld);
          shadowCamera.lookAt(this._lookTarget);
        }
        shadowCamera.updateMatrixWorld();
        shadowCamera.matrixWorldInverse.getInverse(shadowCamera.matrixWorld);
        // compute shadow matrix
        shadowMatrix.set(
          0.5, 0.0, 0.0, 0.5,
          0.0, 0.5, 0.0, 0.5,
          0.0, 0.0, 0.5, 0.5,
          0.0, 0.0, 0.0, 1.0
        );
        shadowMatrix.multiply(shadowCamera.projectionMatrix);
        shadowMatrix.multiply(shadowCamera.matrixWorldInverse);
        // update camera matrices and frustum
        this._projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
        this._frustum.setFromMatrix(this._projScreenMatrix);
        // set object matrices & frustum culling
        this._renderList.length = 0;
        this.projectObject(scene, camera, shadowCamera);
        // render shadow map
        // render regular objects
        for (let j = 0, jl = this._renderList.length; j < jl; j ++) {
          const object = this._renderList[j];
          const geometry = this._objects.update(object);
          const material = object.material;
          if ((material && material instanceof MultiMaterial)) {
            const groups = geometry.groups;
            const materials = material.materials;
            for (let k = 0, kl = groups.length; k < kl; k ++) {
              const group = groups[k];
              const groupMaterial = materials[group.materialIndex];
              if (groupMaterial.visible === true) {
                const depthMaterial = this.getDepthMaterial(object, groupMaterial, isPointLight, this._lightPositionWorld);
                this._renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, group);
              }
            }
          } else {
            const depthMaterial = this.getDepthMaterial(object, material, isPointLight, this._lightPositionWorld);
            this._renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, null);
          }
        }
      }
    }
    // Restore GL state.
    const clearColor = this._renderer.getClearColor(),
    clearAlpha = this._renderer.getClearAlpha();
    this._renderer.setClearColor(clearColor, clearAlpha);
    this.needsUpdate = false;
  }
  private getDepthMaterial(object: any, material: any, isPointLight: any, lightPositionWorld: any) {
    const geometry = object.geometry;
    let result = null;
    let materialVariants = this._depthMaterials;
    let customMaterial = object.customDepthMaterial;
    if (isPointLight) {
      materialVariants = this._distanceMaterials;
      customMaterial = object.customDistanceMaterial;
    }
    if (! customMaterial) {
      let useMorphing = false;
      if (material.morphTargets) {
        if ((geometry && geometry instanceof BufferGeometry)) {
          useMorphing = geometry.morphAttributes && geometry.morphAttributes.position && geometry.morphAttributes.position.length > 0;
        } else if ((geometry && geometry instanceof Geometry)) {
          useMorphing = geometry.morphTargets && geometry.morphTargets.length > 0;
        }
      }
      const useSkinning = object instanceof SkinnedMesh && material.skinning;
      let variantIndex = 0;
      if (useMorphing) variantIndex |= this._MorphingFlag;
      if (useSkinning) variantIndex |= this._SkinningFlag;
      result = materialVariants[variantIndex];
    } else {
      result = customMaterial;
    }
    if (this._renderer.localClippingEnabled &&
       material.clipShadows === true &&
        material.clippingPlanes.length !== 0) {
      // in this case we need a unique material instance reflecting the
      // appropriate state
      const keyA = result.uuid, keyB = material.uuid;
      let materialsForVariant = this._materialCache[keyA];
      if (materialsForVariant === undefined) {
        materialsForVariant = {};
        this._materialCache[keyA] = materialsForVariant;
      }
      let cachedMaterial = materialsForVariant[keyB];
      if (cachedMaterial === undefined) {
        cachedMaterial = result.clone();
        materialsForVariant[keyB] = cachedMaterial;
      }
      result = cachedMaterial;
    }
    result.visible = material.visible;
    result.wireframe = material.wireframe;
    let side = material.side;
    if (this.renderSingleSided && side === SideMode.Double) {
      side = SideMode.Front;
    }
    if (this.renderReverseSided) {
      if (side === SideMode.Front) side = SideMode.Back;
      else if (side === SideMode.Back) side = SideMode.Front;
    }
    result.side = side;
    result.clipShadows = material.clipShadows;
    result.clippingPlanes = material.clippingPlanes;
    result.wireframeLinewidth = material.wireframeLinewidth;
    result.linewidth = material.linewidth;
    if (isPointLight && result.uniforms.lightPos !== undefined) {
      result.uniforms.lightPos.value.copy(lightPositionWorld);
    }
    return result;
  }
  private projectObject(object: any, camera: any, shadowCamera: any) {
    if (object.visible === false) return;
    const visible = (object.layers.mask & camera.layers.mask) !== 0;
    if (visible && (object instanceof Mesh || object instanceof Line || object instanceof Points)) {
      if (object.castShadow && (object.frustumCulled === false || this._frustum.intersectsObject(object) === true)) {
        const material = object.material;
        if (material.visible === true) {
          object.modelViewMatrix.multiplyMatrices(shadowCamera.matrixWorldInverse, object.matrixWorld);
          this._renderList.push(object);
        }
      }
    }
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i ++) {
      this.projectObject(children[i], camera, shadowCamera);
    }
  }
  get cullFace(): CullFace {
    return this.renderReverseSided ? CullFace.Front : CullFace.Back;
  }
  set cullFace(cullFace: CullFace) {
    const value = (cullFace !== CullFace.Back);
    console.warn("WebGLRenderer: .shadowMap.cullFace is deprecated. Set .shadowMap.renderReverseSided to " + value + ".");
    this.renderReverseSided = value;
  }
}
