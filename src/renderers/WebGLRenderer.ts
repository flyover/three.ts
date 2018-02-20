/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author tschw
 */
import { REVISION, BlendingFactor, BlendingEquation, TextureFormat, TextureType, TextureFilter, TextureWrapping, FrontFaceDirection, SideMode, DrawMode, ColorsMode, ShadingMode, ToneMapping } from "../constants";
import { BlendingMode, CullFace } from "../constants";
import { Matrix4 } from "../math/Matrix4";
import { Plane } from "../math/Plane";
import { WebGLUniforms } from "./webgl/WebGLUniforms";
import { UniformsUtils } from "./shaders/UniformsUtils";
import { ShaderLib } from "./shaders/ShaderLib";
import { LensFlarePlugin } from "./webgl/plugins/LensFlarePlugin";
import { SpritePlugin } from "./webgl/plugins/SpritePlugin";
import { WebGLShadowMap } from "./webgl/WebGLShadowMap";
import { ShaderMaterial } from "../materials/ShaderMaterial";
import { Mesh } from "../objects/Mesh";
import { BoxBufferGeometry } from "../geometries/BoxBufferGeometry";
import { PlaneBufferGeometry } from "../geometries/PlaneBufferGeometry";
import { MeshBasicMaterial } from "../materials/MeshBasicMaterial";
import { MeshPhongMaterial } from "../materials/MeshPhongMaterial";
import { MeshStandardMaterial } from "../materials/MeshStandardMaterial";
import { MeshDepthMaterial } from "../materials/MeshDepthMaterial";
import { MeshLambertMaterial } from "../materials/MeshLambertMaterial";
import { MeshPhysicalMaterial } from "../materials/MeshPhysicalMaterial";
import { MeshNormalMaterial } from "../materials/MeshNormalMaterial";
import { RawShaderMaterial } from "../materials/RawShaderMaterial";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera";
import { LineBasicMaterial } from "../materials/LineBasicMaterial";
import { LineDashedMaterial } from "../materials/LineDashedMaterial";
import { PointsMaterial } from "../materials/PointsMaterial";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
import { WebGLIndexedBufferRenderer } from "./webgl/WebGLIndexedBufferRenderer";
import { WebGLBufferRenderer } from "./webgl/WebGLBufferRenderer";
import { WebGLLights } from "./webgl/WebGLLights";
import { WebGLProgram } from "./webgl/WebGLProgram";
import { WebGLPrograms } from "./webgl/WebGLPrograms";
import { WebGLObjects } from "./webgl/WebGLObjects";
import { WebGLTextures } from "./webgl/WebGLTextures";
import { WebGLProperties } from "./webgl/WebGLProperties";
import { WebGLState } from "./webgl/WebGLState";
import { WebGLCapabilities } from "./webgl/WebGLCapabilities";
import { BufferGeometry, BufferGeometryGroup } from "../core/BufferGeometry";
import { WebGLExtensions } from "./webgl/WebGLExtensions";
import { Vector3 } from "../math/Vector3";
import { Sphere } from "../math/Sphere";
import { WebGLClipping } from "./webgl/WebGLClipping";
import { Frustum } from "../math/Frustum";
import { Vector4 } from "../math/Vector4";
import { Color } from "../math/Color";
import { Object3D } from "../core/Object3D";
import { Camera } from "../cameras/Camera";
import { Light } from "../lights/Light";
import { AmbientLight } from "../lights/AmbientLight";
import { DirectionalLight } from "../lights/DirectionalLight";
import { HemisphereLight } from "../lights/HemisphereLight";
import { PointLight } from "../lights/PointLight";
import { SpotLight } from "../lights/SpotLight";
import { Sprite } from "../objects/Sprite";
import { LensFlare } from "../objects/LensFlare";
import { ImmediateRenderObject } from "../extras/objects/ImmediateRenderObject";
import { SkinnedMesh } from "../objects/SkinnedMesh";
import { Line } from "../objects/Line";
import { LineSegments } from "../objects/LineSegments";
import { Points } from "../objects/Points";
import { Material } from "../materials/Material";
import { MultiMaterial } from "../materials/MultiMaterial";
import { WebGLRenderTarget } from "./WebGLRenderTarget";
import { WebGLRenderTargetCube } from "./WebGLRenderTargetCube";
import { Scene } from "../scenes/Scene";
import { Fog } from "../scenes/Fog";
import { FogExp2 } from "../scenes/FogExp2";
import { Texture } from "../textures/Texture";
import { CubeTexture } from "../textures/CubeTexture";
import { InstancedBufferGeometry } from "../core/InstancedBufferGeometry";
import { InstancedBufferAttribute } from "../core/InstancedBufferAttribute";
import { InterleavedBufferAttribute } from "../core/InterleavedBufferAttribute";
import { InstancedInterleavedBuffer } from "../core/InstancedInterleavedBuffer";
interface RenderItem {
  id: number;
  object: Object3D;
  geometry: BufferGeometry;
  material: Material;
  z: number;
  group: BufferGeometryGroup;
}
export interface WebGLRendererParameters {
  canvas?: HTMLCanvasElement;
  context?: WebGLRenderingContext;
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  antialias?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  precision?: string;
  logarithmicDepthBuffer?: boolean;
}
export class WebGLRenderer {
  _canvas: HTMLCanvasElement;
  _context: WebGLRenderingContext;
  _alpha: boolean;
  _depth: boolean;
  _stencil: boolean;
  _antialias: boolean;
  _premultipliedAlpha: boolean;
  _preserveDrawingBuffer: boolean;
  lights: Light[] = [];
  opaqueObjects: RenderItem[] = [];
  opaqueObjectsLastIndex: number = - 1;
  transparentObjects: RenderItem[] = [];
  transparentObjectsLastIndex: number = - 1;
  morphInfluences = new Float32Array(8);
  sprites: Sprite[] = [];
  lensFlares: LensFlare[] = [];
  // public properties
  domElement: HTMLCanvasElement; // = this._canvas;
  context: WebGLRenderingContext = null;
  // clearing
  autoClear: boolean = true;
  autoClearColor: boolean = true;
  autoClearDepth: boolean = true;
  autoClearStencil: boolean = true;
  // scene graph
  sortObjects: boolean = true;
  // user-defined clipping
  clippingPlanes: Plane[] = [];
  localClippingEnabled: boolean = false;
  // physically based shading
  gammaFactor: number = 2.0;  // for backwards compatibility
  gammaInput: boolean = false;
  gammaOutput: boolean = false;
  // physical lights
  physicallyCorrectLights: boolean = false;
  // tone mapping
  toneMapping: ToneMapping = ToneMapping.Linear;
  toneMappingExposure: number = 1.0;
  toneMappingWhitePoint: number = 1.0;
  // morphs
  maxMorphTargets: number = 8;
  maxMorphNormals: number = 4;
  // internal state cache
  _currentProgram: number = null;
  _currentRenderTarget: WebGLRenderTarget = null;
  _currentFramebuffer: WebGLFramebuffer = null;
  _currentMaterialId: number = - 1;
  _currentGeometryProgram: string = '';
  _currentCamera: Camera = null;
  _currentScissor: Vector4 = new Vector4();
  _currentScissorTest: boolean = null;
  _currentViewport: Vector4 = new Vector4();
  //
  _usedTextureUnits: number = 0;
  //
  _clearColor: Color = new Color(0x000000);
  _clearAlpha: number = 0;
  _width: number; // = this._canvas.width;
  _height: number; // = this._canvas.height;
  _pixelRatio: number = 1;
  _scissor: Vector4; // = new Vector4(0, 0, this._width, this._height);
  _scissorTest: boolean = false;
  _viewport: Vector4; // = new Vector4(0, 0, this._width, this._height);
  // frustum
  _frustum: Frustum = new Frustum();
  // clipping
  _clipping: WebGLClipping = new WebGLClipping();
  _clippingEnabled: boolean = false;
  _localClippingEnabled: boolean = false;
  _sphere: Sphere = new Sphere();
  // camera matrices cache
  _projScreenMatrix: Matrix4 = new Matrix4();
  _vector3: Vector3 = new Vector3();
  // light arrays cache
  _lights = {
    hash: '',
    ambient: [0, 0, 0],
    directional: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotShadowMap: [],
    spotShadowMatrix: [],
    point: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    shadows: []
  };
  // info
  info = {
    render: {
      calls: 0,
      vertices: 0,
      faces: 0,
      points: 0
    },
    memory: {
      geometries: 0,
      textures: 0
    },
    programs: null
  };
  _infoRender = this.info.render;
  _gl: WebGLRenderingContext;
  extensions: WebGLExtensions;
  capabilities: WebGLCapabilities;
  state: WebGLState;
  properties: WebGLProperties;
  textures: WebGLTextures;
  objects: WebGLObjects;
  programCache: WebGLPrograms;
  lightCache: WebGLLights;
  bufferRenderer: WebGLBufferRenderer;
  indexedBufferRenderer: WebGLIndexedBufferRenderer;
  //
  backgroundCamera: OrthographicCamera;
  backgroundCamera2: PerspectiveCamera;
  backgroundPlaneMesh: Mesh;
  backgroundBoxShader: any;
  backgroundBoxMesh: Mesh;
  // shadow map
  shadowMap: WebGLShadowMap;
  // Plugins
  spritePlugin: SpritePlugin;
  lensFlarePlugin: LensFlarePlugin;
  constructor(parameters?: WebGLRendererParameters) {
    console.log('THREE.WebGLRenderer', REVISION);
    parameters = parameters || {};
    this._canvas = parameters.canvas !== undefined ? parameters.canvas : <HTMLCanvasElement> document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    this._context = parameters.context !== undefined ? parameters.context : null;
    this._alpha = parameters.alpha !== undefined ? parameters.alpha : false,
    this._depth = parameters.depth !== undefined ? parameters.depth : true,
    this._stencil = parameters.stencil !== undefined ? parameters.stencil : true,
    this._antialias = parameters.antialias !== undefined ? parameters.antialias : false,
    this._premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
    this._preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;
    this.domElement = this._canvas;
    this._width = this._canvas.width;
    this._height = this._canvas.height;
    this._scissor = new Vector4(0, 0, this._width, this._height);
    this._viewport = new Vector4(0, 0, this._width, this._height);
    // initialize
    ///let _gl;
    try {
      const attributes = {
        alpha: this._alpha,
        depth: this._depth,
        stencil: this._stencil,
        antialias: this._antialias,
        premultipliedAlpha: this._premultipliedAlpha,
        preserveDrawingBuffer: this._preserveDrawingBuffer
      };
      this._gl = <WebGLRenderingContext>(this._context || this._canvas.getContext('webgl', attributes) || this._canvas.getContext('experimental-webgl', attributes));
      if (this._gl === null) {
        if (this._canvas.getContext('webgl') !== null) {
          throw 'Error creating WebGL context with your selected attributes.';
        } else {
          throw 'Error creating WebGL context.';
        }
      }
      // Some experimental-webgl implementations do not have getShaderPrecisionFormat
      if (this._gl.getShaderPrecisionFormat === undefined) {
        this._gl.getShaderPrecisionFormat = function () {
          return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };
        };
      }
      this._canvas.addEventListener('webglcontextlost', this.onContextLost.bind(this), false);
    } catch (error) {
      console.error('THREE.WebGLRenderer: ' + error);
    }
    this.extensions = new WebGLExtensions(this._gl);
    this.extensions.get('WEBGL_depth_texture');
    this.extensions.get('OES_texture_float');
    this.extensions.get('OES_texture_float_linear');
    this.extensions.get('OES_texture_half_float');
    this.extensions.get('OES_texture_half_float_linear');
    this.extensions.get('OES_standard_derivatives');
    this.extensions.get('ANGLE_instanced_arrays');
    if (this.extensions.get('OES_element_index_uint')) {
      BufferGeometry.MaxIndex = 4294967296;
    }
    this.capabilities = new WebGLCapabilities(this._gl, this.extensions, parameters);
    this.state = new WebGLState(this._gl, this.extensions, this.paramThreeToGL.bind(this));
    this.properties = new WebGLProperties();
    this.textures = new WebGLTextures(this._gl, this.extensions, this.state, this.properties, this.capabilities, this.paramThreeToGL.bind(this), this.info);
    this.objects = new WebGLObjects(this._gl, this.properties, this.info);
    this.programCache = new WebGLPrograms(this, this.capabilities);
    this.lightCache = new WebGLLights();
    this.info.programs = this.programCache.programs;
    this.bufferRenderer = new WebGLBufferRenderer(this._gl, this.extensions, this._infoRender);
    this.indexedBufferRenderer = new WebGLIndexedBufferRenderer(this._gl, this.extensions, this._infoRender);
    //
    this.backgroundCamera = new OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
    this.backgroundCamera2 = new PerspectiveCamera();
    this.backgroundPlaneMesh = new Mesh(
      new PlaneBufferGeometry(2, 2),
      new MeshBasicMaterial({ depthTest: false, depthWrite: false, fog: false })
    );
    this.backgroundBoxShader = ShaderLib['cube'];
    this.backgroundBoxMesh = new Mesh(
      new BoxBufferGeometry(5, 5, 5),
      new ShaderMaterial({
        uniforms: this.backgroundBoxShader.uniforms,
        vertexShader: this.backgroundBoxShader.vertexShader,
        fragmentShader: this.backgroundBoxShader.fragmentShader,
        side: SideMode.Back,
        depthTest: false,
        depthWrite: false,
        fog: false
      })
    );
    this.setDefaultGLState();
    this.context = this._gl;
    // shadow map
    this.shadowMap = new WebGLShadowMap(this, this._lights, this.objects, this.capabilities);
    // Plugins
    this.spritePlugin = new SpritePlugin(this, this.sprites);
    this.lensFlarePlugin = new LensFlarePlugin(this, this.lensFlares);
  }
  getTargetPixelRatio(): number {
    return this._currentRenderTarget === null ? this._pixelRatio : 1;
  }
  glClearColor(r: number, g: number, b: number, a: number): void {
    if (this._premultipliedAlpha === true) {
      r *= a; g *= a; b *= a;
    }
    this.state.clearColor(r, g, b, a);
  }
  setDefaultGLState(): void {
    this.state.init();
    this.state.scissor(this._currentScissor.copy(this._scissor).multiplyScalar(this._pixelRatio));
    this.state.viewport(this._currentViewport.copy(this._viewport).multiplyScalar(this._pixelRatio));
    this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
  }
  resetGLState(): void {
    this._currentProgram = null;
    this._currentCamera = null;
    this._currentGeometryProgram = '';
    this._currentMaterialId = - 1;
    this.state.reset();
  }
  // API
  getContext(): WebGLRenderingContext {
    return this._gl;
  }
  getContextAttributes(): WebGLContextAttributes {
    return this._gl.getContextAttributes();
  }
  forceContextLoss(): void {
    this.extensions.get('WEBGL_lose_context').loseContext();
  }
  getMaxAnisotropy(): number {
    return this.capabilities.getMaxAnisotropy();
  }
  getPrecision(): string {
    return this.capabilities.precision;
  }
  getPixelRatio(): number {
    return this._pixelRatio;
  }
  setPixelRatio(value: number): void {
    if (value === undefined) return;
    this._pixelRatio = value;
    this.setSize(this._viewport.z, this._viewport.w, false);
  }
  getSize(): { width: number, height: number } {
    return {
      width: this._width,
      height: this._height
    };
  }
  setSize(width: number, height: number, updateStyle?: boolean): void {
    this._width = width;
    this._height = height;
    this._canvas.width = width * this._pixelRatio;
    this._canvas.height = height * this._pixelRatio;
    if (updateStyle !== false) {
      this._canvas.style.width = width + 'px';
      this._canvas.style.height = height + 'px';
    }
    this.setViewport(0, 0, width, height);
  }
  setViewport(x: number, y: number, width: number, height: number): void {
    this.state.viewport(this._viewport.set(x, y, width, height));
  }
  setScissor(x: number, y: number, width: number, height: number): void {
    this.state.scissor(this._scissor.set(x, y, width, height));
  }
  setScissorTest(test: boolean): void {
    this.state.setScissorTest(this._scissorTest = test);
  }
  // Clearing
  getClearColor(): Color {
    return this._clearColor;
  }
  setClearColor(color: Color | number | string, alpha: number = 1): void {
    this._clearColor.set(color);
    this._clearAlpha = alpha;
    this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
  }
  getClearAlpha(): number {
    return this._clearAlpha;
  }
  setClearAlpha(alpha: number): void {
    this._clearAlpha = alpha;
    this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
  }
  clear(color: boolean, depth: boolean, stencil: boolean): void {
    let bits = 0;
    if (color === undefined || color) bits |= this._gl.COLOR_BUFFER_BIT;
    if (depth === undefined || depth) bits |= this._gl.DEPTH_BUFFER_BIT;
    if (stencil === undefined || stencil) bits |= this._gl.STENCIL_BUFFER_BIT;
    this._gl.clear(bits);
  }
  clearColor(): void {
    this.clear(true, false, false);
  }
  clearDepth(): void {
    this.clear(false, true, false);
  }
  clearStencil(): void {
    this.clear(false, false, true);
  }
  clearTarget(renderTarget: WebGLRenderTarget, color: boolean, depth: boolean, stencil: boolean): void {
    this.setRenderTarget(renderTarget);
    this.clear(color, depth, stencil);
  }
  // Reset
  ///this.resetGLState = resetGLState;
  dispose(): void {
    this.transparentObjects = [];
    this.transparentObjectsLastIndex = -1;
    this.opaqueObjects = [];
    this.opaqueObjectsLastIndex = -1;
    this._canvas.removeEventListener('webglcontextlost', this.onContextLost.bind(this), false);
  }
  // Events
  onContextLost(event: WebGLContextEvent): void {
    event.preventDefault();
    this.resetGLState();
    this.setDefaultGLState();
    this.properties.clear();
  }
  onMaterialDispose(event: any): void {
    const material = event.target;
    material.removeEventListener('dispose', this.onMaterialDispose.bind(this));
    this.deallocateMaterial(material);
  }
  // Buffer deallocation
  deallocateMaterial(material: Material): void {
    this.releaseMaterialProgramReference(material);
    this.properties.delete(material);
  }
  releaseMaterialProgramReference(material: Material): void {
    const programInfo = this.properties.get(material).program;
    material.program = undefined;
    if (programInfo !== undefined) {
      this.programCache.releaseProgram(programInfo);
    }
  }
  // Buffer rendering
  renderBufferImmediate(object: Object3D, program: WebGLProgram, material: Material): void {
    this.state.initAttributes();
    const buffers = this.properties.get(object);
    if (object.hasPositions && ! buffers.position) buffers.position = this._gl.createBuffer();
    if (object.hasNormals && ! buffers.normal) buffers.normal = this._gl.createBuffer();
    if (object.hasUvs && ! buffers.uv) buffers.uv = this._gl.createBuffer();
    if (object.hasColors && ! buffers.color) buffers.color = this._gl.createBuffer();
    const attributes = program.getAttributes();
    if (object.hasPositions) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.position);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.positionArray, this._gl.DYNAMIC_DRAW);
      this.state.enableAttribute(attributes.position);
      this._gl.vertexAttribPointer(attributes.position, 3, this._gl.FLOAT, false, 0, 0);
    }
    if (object.hasNormals) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.normal);
      if (! (material instanceof MeshPhongMaterial) && ! (material instanceof MeshStandardMaterial) && material.shading === ShadingMode.Flat) {
        for (let i = 0, l = object.count * 3; i < l; i += 9) {
          const array = object.normalArray;
          const nx = (array[i + 0] + array[i + 3] + array[i + 6]) / 3;
          const ny = (array[i + 1] + array[i + 4] + array[i + 7]) / 3;
          const nz = (array[i + 2] + array[i + 5] + array[i + 8]) / 3;
          array[i + 0] = nx;
          array[i + 1] = ny;
          array[i + 2] = nz;
          array[i + 3] = nx;
          array[i + 4] = ny;
          array[i + 5] = nz;
          array[i + 6] = nx;
          array[i + 7] = ny;
          array[i + 8] = nz;
        }
      }
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.normalArray, this._gl.DYNAMIC_DRAW);
      this.state.enableAttribute(attributes.normal);
      this._gl.vertexAttribPointer(attributes.normal, 3, this._gl.FLOAT, false, 0, 0);
    }
    if (object.hasUvs && material.map) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.uv);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.uvArray, this._gl.DYNAMIC_DRAW);
      this.state.enableAttribute(attributes.uv);
      this._gl.vertexAttribPointer(attributes.uv, 2, this._gl.FLOAT, false, 0, 0);
    }
    if (object.hasColors && material.vertexColors !== ColorsMode.None) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.color);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.colorArray, this._gl.DYNAMIC_DRAW);
      this.state.enableAttribute(attributes.color);
      this._gl.vertexAttribPointer(attributes.color, 3, this._gl.FLOAT, false, 0, 0);
    }
    this.state.disableUnusedAttributes();
    this._gl.drawArrays(this._gl.TRIANGLES, 0, object.count);
    object.count = 0;
  }
  renderBufferDirect(camera: Camera, fog: Fog | FogExp2, geometry: BufferGeometry, material: Material, object: Object3D, group: BufferGeometryGroup): void {
    const _gl: WebGLRenderingContext = this._gl;
    this.setMaterial(material);
    const program = this.setProgram(camera, fog, material, object);
    let updateBuffers: boolean = false;
    const geometryProgram: string = geometry.id + '_' + program.id + '_' + material.wireframe;
    if (geometryProgram !== this._currentGeometryProgram) {
      this._currentGeometryProgram = geometryProgram;
      updateBuffers = true;
    }
    // morph targets
    const morphTargetInfluences = object.morphTargetInfluences;
    if (morphTargetInfluences !== undefined) {
      const activeInfluences = [];
      for (let i = 0, l = morphTargetInfluences.length; i < l; i ++) {
        const influence = morphTargetInfluences[i];
        activeInfluences.push([ influence, i ]);
      }
      activeInfluences.sort(WebGLRenderer.absNumericalSort);
      if (activeInfluences.length > 8) {
        activeInfluences.length = 8;
      }
      const morphAttributes = geometry.morphAttributes;
      for (let i = 0, l = activeInfluences.length; i < l; i ++) {
        const influence = activeInfluences[i];
        this.morphInfluences[i] = influence[0];
        if (influence[0] !== 0) {
          const index = influence[1];
          if (material.morphTargets === true && morphAttributes.position) geometry.addAttribute('morphTarget' + i, morphAttributes.position[index]);
          if (material.morphNormals === true && morphAttributes.normal) geometry.addAttribute('morphNormal' + i, morphAttributes.normal[index]);
        } else {
          if (material.morphTargets === true) geometry.removeAttribute('morphTarget' + i);
          if (material.morphNormals === true) geometry.removeAttribute('morphNormal' + i);
        }
      }
      for (let i = activeInfluences.length, il = this.morphInfluences.length; i < il; i ++) {
        this.morphInfluences[i] = 0.0;
      }
      program.getUniforms().setValue(
          this._gl, 'morphTargetInfluences', this.morphInfluences);
      updateBuffers = true;
    }
    //
    let index = geometry.index;
    const position = geometry.attributes.position;
    let rangeFactor = 1;
    if (material.wireframe === true) {
      index = this.objects.getWireframeAttribute(geometry);
      rangeFactor = 2;
    }
    let renderer;
    if (index !== null) {
      renderer = this.indexedBufferRenderer;
      renderer.setIndex(index);
    } else {
      renderer = this.bufferRenderer;
    }
    if (updateBuffers) {
      this.setupVertexAttributes(material, program, geometry);
      if (index !== null) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this.objects.getAttributeBuffer(index));
      }
    }
    //
    let dataCount = 0;
    if (index !== null) {
      dataCount = index.count;
    } else if (position !== undefined) {
      dataCount = position.count;
    }
    const rangeStart = geometry.drawRange.start * rangeFactor;
    const rangeCount = geometry.drawRange.count * rangeFactor;
    const groupStart = group !== null ? group.start * rangeFactor : 0;
    const groupCount = group !== null ? group.count * rangeFactor : Infinity;
    const drawStart = Math.max(rangeStart, groupStart);
    const drawEnd = Math.min(dataCount, rangeStart + rangeCount, groupStart + groupCount) - 1;
    const drawCount = Math.max(0, drawEnd - drawStart + 1);
    if (drawCount === 0) return;
    //
    if (object instanceof Mesh) {
      if (material.wireframe === true) {
        this.state.setLineWidth(material.wireframeLinewidth * this.getTargetPixelRatio());
        renderer.setMode(_gl.LINES);
      } else {
        switch (object.drawMode) {
          case DrawMode.Triangles:
            renderer.setMode(_gl.TRIANGLES);
            break;
          case DrawMode.TriangleStrip:
            renderer.setMode(_gl.TRIANGLE_STRIP);
            break;
          case DrawMode.TriangleFan:
            renderer.setMode(_gl.TRIANGLE_FAN);
            break;
        }
      }
    } else if (object instanceof Line) {
      let lineWidth = material.linewidth;
      if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material
      this.state.setLineWidth(lineWidth * this.getTargetPixelRatio());
      if (object instanceof LineSegments) {
        renderer.setMode(_gl.LINES);
      } else {
        renderer.setMode(_gl.LINE_STRIP);
      }
    } else if (object instanceof Points) {
      renderer.setMode(_gl.POINTS);
    }
    if (geometry && geometry instanceof InstancedBufferGeometry) {
      if (geometry.maxInstancedCount > 0) {
        (renderer as WebGLIndexedBufferRenderer).renderInstances(geometry, drawStart, drawCount);
      }
    } else {
      renderer.render(drawStart, drawCount);
    }
  }
  setupVertexAttributes(material: Material, program: WebGLProgram, geometry: BufferGeometry, startIndex: number = 0) {
    const _gl: WebGLRenderingContext = this._gl;
    let extension;
    if (geometry && geometry instanceof InstancedBufferGeometry) {
      extension = this.extensions.get('ANGLE_instanced_arrays');
      if (extension === null) {
        console.error('THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
        return;
      }
    }
    this.state.initAttributes();
    const geometryAttributes = geometry.attributes;
    const programAttributes = program.getAttributes();
    const materialDefaultAttributeValues = material.defaultAttributeValues;
    for (let name in programAttributes) {
      const programAttribute = programAttributes[name];
      if (programAttribute >= 0) {
        const geometryAttribute = geometryAttributes[name];
        if (geometryAttribute !== undefined) {
          let type = _gl.FLOAT;
          const array = geometryAttribute.array;
          const normalized = geometryAttribute.normalized;
          if (array instanceof Float32Array) {
            type = _gl.FLOAT;
          } else if (array instanceof Float64Array) {
            console.warn("Unsupported data buffer format: Float64Array");
          } else if (array instanceof Uint16Array) {
            type = _gl.UNSIGNED_SHORT;
          } else if (array instanceof Int16Array) {
            type = _gl.SHORT;
          } else if (array instanceof Uint32Array) {
            type = _gl.UNSIGNED_INT;
          } else if (array instanceof Int32Array) {
            type = _gl.INT;
          } else if (array instanceof Int8Array) {
            type = _gl.BYTE;
          } else if (array instanceof Uint8Array) {
            type = _gl.UNSIGNED_BYTE;
          }
          const size = geometryAttribute.itemSize;
          const buffer = this.objects.getAttributeBuffer(geometryAttribute);
          if (geometryAttribute instanceof InterleavedBufferAttribute) {
            const data = geometryAttribute.data;
            const stride = data.stride;
            const offset = geometryAttribute.offset;
            if (data && data instanceof InstancedInterleavedBuffer) {
              this.state.enableAttributeAndDivisor(programAttribute, data.meshPerAttribute, extension);
              if (geometry.maxInstancedCount === undefined) {
                geometry.maxInstancedCount = data.meshPerAttribute * data.count;
              }
            } else {
              this.state.enableAttribute(programAttribute);
            }
            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
            _gl.vertexAttribPointer(programAttribute, size, type, normalized, stride * data.array.BYTES_PER_ELEMENT, (startIndex * stride + offset) * data.array.BYTES_PER_ELEMENT);
          } else {
            if (geometryAttribute instanceof InstancedBufferAttribute) {
              this.state.enableAttributeAndDivisor(programAttribute, geometryAttribute.meshPerAttribute, extension);
              if (geometry.maxInstancedCount === undefined) {
                geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;
              }
            } else {
              this.state.enableAttribute(programAttribute);
            }
            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
            _gl.vertexAttribPointer(programAttribute, size, type, normalized, 0, startIndex * size * geometryAttribute.array.BYTES_PER_ELEMENT);
          }
        } else if (materialDefaultAttributeValues !== undefined) {
          const value = materialDefaultAttributeValues[name];
          if (value !== undefined) {
            switch (value.length) {
              case 2:
                _gl.vertexAttrib2fv(programAttribute, value);
                break;
              case 3:
                _gl.vertexAttrib3fv(programAttribute, value);
                break;
              case 4:
                _gl.vertexAttrib4fv(programAttribute, value);
                break;
              default:
                _gl.vertexAttrib1fv(programAttribute, value);
            }
          }
        }
      }
    }
    this.state.disableUnusedAttributes();
  }
  // Sorting
  static absNumericalSort(a: number[], b: number[]): number {
    return Math.abs(b[0]) - Math.abs(a[0]);
  }
  static painterSortStable(a: RenderItem, b: RenderItem): number {
    if (a.object.renderOrder !== b.object.renderOrder) {
      return a.object.renderOrder - b.object.renderOrder;
    } else if (a.material.program && b.material.program && a.material.program !== b.material.program) {
      return a.material.program.id - b.material.program.id;
    } else if (a.material.id !== b.material.id) {
      return a.material.id - b.material.id;
    } else if (a.z !== b.z) {
      return a.z - b.z;
    } else {
      return a.id - b.id;
    }
  }
  static reversePainterSortStable(a: RenderItem, b: RenderItem): number {
    if (a.object.renderOrder !== b.object.renderOrder) {
      return a.object.renderOrder - b.object.renderOrder;
    } if (a.z !== b.z) {
      return b.z - a.z;
    } else {
      return a.id - b.id;
    }
  }
  // Rendering
  render(scene: Scene, camera: Camera, renderTarget?: WebGLRenderTarget, forceClear?: boolean): void {
    if (camera !== undefined && camera instanceof Camera !== true) {
      console.error('THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.');
      return;
    }
    // reset caching for this frame
    this._currentGeometryProgram = '';
    this._currentMaterialId = - 1;
    this._currentCamera = null;
    // update scene graph
    if (scene.autoUpdate === true) scene.updateMatrixWorld();
    // update camera matrices and frustum
    if (camera.parent === null) camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    this._projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromMatrix(this._projScreenMatrix);
    this.lights.length = 0;
    this.opaqueObjectsLastIndex = - 1;
    this.transparentObjectsLastIndex = - 1;
    this.sprites.length = 0;
    this.lensFlares.length = 0;
    this._localClippingEnabled = this.localClippingEnabled;
    this._clippingEnabled = this._clipping.init(this.clippingPlanes, this._localClippingEnabled, camera);
    this.projectObject(scene, camera);
    this.opaqueObjects.length = this.opaqueObjectsLastIndex + 1;
    this.transparentObjects.length = this.transparentObjectsLastIndex + 1;
    if (this.sortObjects === true) {
      this.opaqueObjects.sort(WebGLRenderer.painterSortStable);
      this.transparentObjects.sort(WebGLRenderer.reversePainterSortStable);
    }
    //
    if (this._clippingEnabled) this._clipping.beginShadows();
    this.setupShadows(this.lights);
    this.shadowMap.render(scene, camera);
    this.setupLights(this.lights, camera);
    if (this._clippingEnabled) this._clipping.endShadows();
    //
    this._infoRender.calls = 0;
    this._infoRender.vertices = 0;
    this._infoRender.faces = 0;
    this._infoRender.points = 0;
    if (renderTarget === undefined) {
      renderTarget = null;
    }
    this.setRenderTarget(renderTarget);
    //
    const background = scene.background;
    if (background === null) {
      this.glClearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha);
    } else if (background && background instanceof Color) {
      this.glClearColor(background.r, background.g, background.b, 1);
      forceClear = true;
    }
    if (this.autoClear || forceClear) {
      this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
    }
    if (background && background instanceof CubeTexture) {
      this.backgroundCamera2.projectionMatrix.copy(camera.projectionMatrix);
      this.backgroundCamera2.matrixWorld.extractRotation(camera.matrixWorld);
      this.backgroundCamera2.matrixWorldInverse.getInverse(this.backgroundCamera2.matrixWorld);
      (this.backgroundBoxMesh.material as ShaderMaterial).uniforms["tCube"].value = background;
      this.backgroundBoxMesh.modelViewMatrix.multiplyMatrices(this.backgroundCamera2.matrixWorldInverse, this.backgroundBoxMesh.matrixWorld);
      this.objects.update(this.backgroundBoxMesh);
      this.renderBufferDirect(this.backgroundCamera2, null, this.backgroundBoxMesh.geometry as BufferGeometry, this.backgroundBoxMesh.material as Material, this.backgroundBoxMesh, null);
    } else if (background && background instanceof Texture) {
      this.backgroundPlaneMesh.material.map = background;
      this.objects.update(this.backgroundPlaneMesh);
      this.renderBufferDirect(this.backgroundCamera, null, this.backgroundPlaneMesh.geometry as BufferGeometry, this.backgroundPlaneMesh.material as Material, this.backgroundPlaneMesh, null);
    }
    //
    if (scene.overrideMaterial) {
      const overrideMaterial = scene.overrideMaterial;
      this.renderObjects(this.opaqueObjects, camera, scene, overrideMaterial);
      this.renderObjects(this.transparentObjects, camera, scene, overrideMaterial);
    } else {
      // opaque pass (front-to-back order)
      this.state.setBlending(BlendingMode.None);
      this.renderObjects(this.opaqueObjects, camera, scene);
      // transparent pass (back-to-front order)
      this.renderObjects(this.transparentObjects, camera, scene);
    }
    // custom render plugins (post pass)
    this.spritePlugin.render(scene, camera);
    this.lensFlarePlugin.render(scene, camera, this._currentViewport);
    // Generate mipmap if we're using any kind of mipmap filtering
    if (renderTarget) {
      this.textures.updateRenderTargetMipmap(renderTarget);
    }
    // Ensure depth buffer writing is enabled so it can be cleared on next render
    this.state.setDepthTest(true);
    this.state.setDepthWrite(true);
    this.state.setColorWrite(true);
    // _gl.finish();
  }
  pushRenderItem(object: Object3D, geometry: BufferGeometry, material: Material, z: number, group: BufferGeometryGroup): void {
    let array, index;
    // allocate the next position in the appropriate array
    if (material.transparent) {
      array = this.transparentObjects;
      index = ++ this.transparentObjectsLastIndex;
    } else {
      array = this.opaqueObjects;
      index = ++ this.opaqueObjectsLastIndex;
    }
    // recycle existing render item or grow the array
    let renderItem: RenderItem = array[index];
    if (renderItem !== undefined) {
      renderItem.id = object.id;
      renderItem.object = object;
      renderItem.geometry = geometry;
      renderItem.material = material;
      renderItem.z = this._vector3.z;
      renderItem.group = group;
    } else {
      renderItem = {
        id: object.id,
        object: object,
        geometry: geometry,
        material: material,
        z: this._vector3.z,
        group: group
      };
      // assert(index === array.length);
      array.push(renderItem);
    }
  }
  // TODO Duplicated code (Frustum)
  isObjectViewable(object: Object3D): boolean {
    const geometry = object.geometry;
    if (geometry.boundingSphere === null)
      geometry.computeBoundingSphere();
    this._sphere.copy(geometry.boundingSphere).
      applyMatrix4(object.matrixWorld);
    return this.isSphereViewable(this._sphere);
  }
  isSpriteViewable(sprite: Sprite): boolean {
    this._sphere.center.set(0, 0, 0);
    this._sphere.radius = 0.7071067811865476;
    this._sphere.applyMatrix4(sprite.matrixWorld);
    return this.isSphereViewable(this._sphere);
  }
  isSphereViewable(sphere: Sphere): boolean {
    if (! this._frustum.intersectsSphere(sphere)) return false;
    const numPlanes = this._clipping.numPlanes;
    if (numPlanes === 0) return true;
    const planes = this.clippingPlanes;
    const center = sphere.center;
    const negRad = - sphere.radius;
    let i = 0;
    do {
      // out when deeper than radius in the negative halfspace
      if (planes[i].distanceToPoint(center) < negRad) return false;
    } while (++ i !== numPlanes);
    return true;
  }
  projectObject(object: Object3D, camera: Camera): void {
    if (object.visible === false) return;
    const visible = (object.layers.mask & camera.layers.mask) !== 0;
    if (visible) {
      if (object instanceof Light) {
        this.lights.push(object);
      } else if (object instanceof Sprite) {
        if (object.frustumCulled === false || this.isSpriteViewable(object) === true) {
          this.sprites.push(object);
        }
      } else if (object instanceof LensFlare) {
        this.lensFlares.push(object);
      } else if (object instanceof ImmediateRenderObject) {
        if (this.sortObjects === true) {
          this._vector3.setFromMatrixPosition(object.matrixWorld);
          this._vector3.applyProjection(this._projScreenMatrix);
        }
        this.pushRenderItem(object, null, object.material as Material, this._vector3.z, null);
      } else if (object instanceof Mesh || object instanceof Line || object instanceof Points) {
        if (object instanceof SkinnedMesh) {
          object.skeleton.update();
        }
        if (object.frustumCulled === false || this.isObjectViewable(object) === true) {
          const material = object.material;
          if (material.visible === true) {
            if (this.sortObjects === true) {
              this._vector3.setFromMatrixPosition(object.matrixWorld);
              this._vector3.applyProjection(this._projScreenMatrix);
            }
            const geometry: BufferGeometry = this.objects.update(object);
            if (material instanceof MultiMaterial) {
              const groups = geometry.groups;
              const materials = material.materials;
              for (let i = 0, l = groups.length; i < l; i ++) {
                const group = groups[i];
                const groupMaterial = materials[group.materialIndex];
                if (!groupMaterial) continue; /// HACK
                if (groupMaterial.visible === true) {
                  this.pushRenderItem(object, geometry, groupMaterial, this._vector3.z, group);
                }
              }
            } else {
              this.pushRenderItem(object, geometry, material, this._vector3.z, null);
            }
          }
        }
      }
    }
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i ++) {
      this.projectObject(children[i], camera);
    }
  }
  renderObjects(renderList: RenderItem[], camera: Camera, scene: Scene, overrideMaterial?: Material): void {
    for (let i = 0, l = renderList.length; i < l; i ++) {
      const renderItem = renderList[i];
      const object = renderItem.object;
      const geometry = renderItem.geometry;
      const material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
      const group = renderItem.group;
      object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
      object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
      object.onBeforeRender(this, scene, camera, geometry, material, group);
      if (object instanceof ImmediateRenderObject) {
        this.setMaterial(material);
        const program = this.setProgram(camera, scene.fog, material, object);
        this._currentGeometryProgram = '';
        const that = this;
        object.render(function(object: Object3D): void {
          that.renderBufferImmediate(object, program, material);
        });
      } else {
        this.renderBufferDirect(camera, scene.fog, geometry, material, object, group);
      }
      object.onAfterRender(this, scene, camera, geometry, material, group);
    }
  }
  initMaterial(material: ShaderMaterial, fog: Fog | FogExp2, object: Object3D): void {
    const materialProperties = this.properties.get(material);
    const parameters = this.programCache.getParameters(
        material, this._lights, fog, this._clipping.numPlanes, this._clipping.numIntersection, object);
    const code = this.programCache.getProgramCode(material, parameters);
    let program = materialProperties.program;
    let programChange = true;
    if (program === undefined) {
      // new material
      material.addEventListener('dispose', this.onMaterialDispose.bind(this));
    } else if (program.code !== code) {
      // changed glsl or parameters
      this.releaseMaterialProgramReference(material);
    } else if (parameters.shaderID !== undefined) {
      // same glsl and uniform list
      return;
    } else {
      // only rebuild uniform list
      programChange = false;
    }
    if (programChange) {
      if (parameters.shaderID) {
        const shader = ShaderLib[parameters.shaderID];
        materialProperties.__webglShader = {
          name: material.type,
          uniforms: UniformsUtils.clone(shader.uniforms),
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader
        };
      } else {
        materialProperties.__webglShader = {
          name: material.type,
          uniforms: material.uniforms,
          vertexShader: material.vertexShader,
          fragmentShader: material.fragmentShader
        };
      }
      material.__webglShader = materialProperties.__webglShader;
      program = this.programCache.acquireProgram(material, parameters, code);
      materialProperties.program = program;
      material.program = program;
    }
    const attributes = program.getAttributes();
    if (material.morphTargets) {
      material.numSupportedMorphTargets = 0;
      for (let i = 0; i < this.maxMorphTargets; i ++) {
        if (attributes['morphTarget' + i] >= 0) {
          material.numSupportedMorphTargets ++;
        }
      }
    }
    if (material.morphNormals) {
      material.numSupportedMorphNormals = 0;
      for (let i = 0; i < this.maxMorphNormals; i ++) {
        if (attributes['morphNormal' + i] >= 0) {
          material.numSupportedMorphNormals ++;
        }
      }
    }
    const uniforms = materialProperties.__webglShader.uniforms;
    if (! (material instanceof ShaderMaterial) &&
         ! ((material as any) instanceof RawShaderMaterial) ||
           material.clipping === true) {
      materialProperties.numClippingPlanes = this._clipping.numPlanes;
      materialProperties.numIntersection = this._clipping.numIntersection;
      uniforms.clippingPlanes = this._clipping.uniform;
    }
    materialProperties.fog = fog;
    // store the light setup it was created for
    materialProperties.lightsHash = this._lights.hash;
    if (material.lights) {
      // wire up the material to this renderer's lighting state
      uniforms.ambientLightColor.value = this._lights.ambient;
      uniforms.directionalLights.value = this._lights.directional;
      uniforms.spotLights.value = this._lights.spot;
      uniforms.pointLights.value = this._lights.point;
      uniforms.hemisphereLights.value = this._lights.hemi;
      uniforms.directionalShadowMap.value = this._lights.directionalShadowMap;
      uniforms.directionalShadowMatrix.value = this._lights.directionalShadowMatrix;
      uniforms.spotShadowMap.value = this._lights.spotShadowMap;
      uniforms.spotShadowMatrix.value = this._lights.spotShadowMatrix;
      uniforms.pointShadowMap.value = this._lights.pointShadowMap;
      uniforms.pointShadowMatrix.value = this._lights.pointShadowMatrix;
    }
    const progUniforms = materialProperties.program.getUniforms(),
      uniformsList =
          WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);
    materialProperties.uniformsList = uniformsList;
  }
  setMaterial(material: Material): void {
    material.side === SideMode.Double
      ? this.state.disable(this._gl.CULL_FACE)
      : this.state.enable(this._gl.CULL_FACE);
    this.state.setFlipSided(material.side === SideMode.Back);
    material.transparent === true
      ? this.state.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha)
      : this.state.setBlending(BlendingMode.None);
    this.state.setDepthFunc(material.depthFunc);
    this.state.setDepthTest(material.depthTest);
    this.state.setDepthWrite(material.depthWrite);
    this.state.setColorWrite(material.colorWrite);
    this.state.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);
  }
  setProgram(camera: Camera, fog: Fog | FogExp2, material: Material, object: Object3D): any {
    this._usedTextureUnits = 0;
    const materialProperties = this.properties.get(material);
    if (this._clippingEnabled) {
      if (this._localClippingEnabled || camera !== this._currentCamera) {
        const useCache =
            camera === this._currentCamera &&
            material.id === this._currentMaterialId;
        // we might want to call this function with some ClippingGroup
        // object instead of the material, once it becomes feasible
        // (#8465, #8379)
        this._clipping.setState(
            material.clippingPlanes, material.clipIntersection, material.clipShadows,
            camera, materialProperties, useCache);
      }
    }
    if (material.needsUpdate === false) {
      if (materialProperties.program === undefined) {
        material.needsUpdate = true;
      } else if (material.fog && materialProperties.fog !== fog) {
        material.needsUpdate = true;
      } else if (material.lights && materialProperties.lightsHash !== this._lights.hash) {
        material.needsUpdate = true;
      } else if (materialProperties.numClippingPlanes !== undefined &&
        (materialProperties.numClippingPlanes !== this._clipping.numPlanes ||
           materialProperties.numIntersection  !== this._clipping.numIntersection)) {
        material.needsUpdate = true;
      }
    }
    if (material.needsUpdate) {
      this.initMaterial(material as ShaderMaterial, fog, object);
      material.needsUpdate = false;
    }
    let refreshProgram = false;
    let refreshMaterial = false;
    let refreshLights = false;
    const program = materialProperties.program;
    const p_uniforms = program.getUniforms();
    const m_uniforms = materialProperties.__webglShader.uniforms;
    if (program.id !== this._currentProgram) {
      this._gl.useProgram(program.program);
      this._currentProgram = program.id;
      refreshProgram = true;
      refreshMaterial = true;
      refreshLights = true;
    }
    if (material.id !== this._currentMaterialId) {
      this._currentMaterialId = material.id;
      refreshMaterial = true;
    }
    if (refreshProgram || camera !== this._currentCamera) {
      p_uniforms.set(this._gl, camera, 'projectionMatrix');
      if (this.capabilities.logarithmicDepthBuffer) {
        p_uniforms.setValue(this._gl, 'logDepthBufFC',
            2.0 / (Math.log(camera.far + 1.0) / Math.LN2));
      }
      if (camera !== this._currentCamera) {
        this._currentCamera = camera;
        // lighting uniforms depend on the camera so enforce an update
        // now, in case this material supports lights - or later, when
        // the next material that does gets activated:
        refreshMaterial = true;    // set to true on material change
        refreshLights = true;    // remains set until update done
      }
      // load material specific uniforms
      // (shader material also gets them for the sake of genericity)
      if (material instanceof ShaderMaterial ||
        material instanceof MeshPhongMaterial ||
        material instanceof MeshStandardMaterial ||
        material.envMap) {
        const uCamPos = p_uniforms.map.cameraPosition;
        if (uCamPos !== undefined) {
          uCamPos.setValue(this._gl,
              this._vector3.setFromMatrixPosition(camera.matrixWorld));
        }
      }
      if (material instanceof MeshPhongMaterial ||
        material instanceof MeshLambertMaterial ||
        material instanceof MeshBasicMaterial ||
        material instanceof MeshStandardMaterial ||
        material instanceof ShaderMaterial ||
        material.skinning) {
        p_uniforms.setValue(this._gl, 'viewMatrix', camera.matrixWorldInverse);
      }
      p_uniforms.set(this._gl, this, 'toneMappingExposure');
      p_uniforms.set(this._gl, this, 'toneMappingWhitePoint');
    }
    // skinning uniforms must be set even if material didn't change
    // auto-setting of texture unit for bone texture must go before other textures
    // not sure why, but otherwise weird things happen
    if (material.skinning) {
      p_uniforms.setOptional(this._gl, object, 'bindMatrix');
      p_uniforms.setOptional(this._gl, object, 'bindMatrixInverse');
      const skeleton = object.skeleton;
      if (skeleton) {
        if (this.capabilities.floatVertexTextures && skeleton.useVertexTexture) {
          p_uniforms.set(this._gl, skeleton, 'boneTexture');
          p_uniforms.set(this._gl, skeleton, 'boneTextureWidth');
          p_uniforms.set(this._gl, skeleton, 'boneTextureHeight');
        } else {
          p_uniforms.setOptional(this._gl, skeleton, 'boneMatrices');
        }
      }
    }
    if (refreshMaterial) {
      if (material.lights) {
        // the current material requires lighting info
        // note: all lighting uniforms are always set correctly
        // they simply reference the renderer's state for their
        // values
        //
        // use the current material's .needsUpdate flags to set
        // the GL state when required
        this.markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);
      }
      // refresh uniforms common to several materials
      if (fog && material.fog) {
        this.refreshUniformsFog(m_uniforms, fog);
      }
      if (material instanceof MeshBasicMaterial || material instanceof MeshLambertMaterial || material instanceof MeshPhongMaterial || material instanceof MeshStandardMaterial || material instanceof MeshDepthMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);
      }
      // refresh single material specific uniforms
      if (material instanceof LineBasicMaterial) {
        this.refreshUniformsLine(m_uniforms, material);
      } else if (material instanceof LineDashedMaterial) {
        this.refreshUniformsLine(m_uniforms, material);
        this.refreshUniformsDash(m_uniforms, material);
      } else if (material instanceof PointsMaterial) {
        this.refreshUniformsPoints(m_uniforms, material);
      } else if (material instanceof MeshLambertMaterial) {
        this.refreshUniformsLambert(m_uniforms, material);
      } else if (material instanceof MeshPhongMaterial) {
        this.refreshUniformsPhong(m_uniforms, material);
      } else if (material instanceof MeshPhysicalMaterial) {
        this.refreshUniformsPhysical(m_uniforms, material);
      } else if (material instanceof MeshStandardMaterial) {
        this.refreshUniformsStandard(m_uniforms, material);
      } else if (material instanceof MeshDepthMaterial) {
        if (material.displacementMap) {
          m_uniforms.displacementMap.value = material.displacementMap;
          m_uniforms.displacementScale.value = material.displacementScale;
          m_uniforms.displacementBias.value = material.displacementBias;
        }
      } else if (material instanceof MeshNormalMaterial) {
        m_uniforms.opacity.value = material.opacity;
      }
      WebGLUniforms.upload(
          this._gl, materialProperties.uniformsList, m_uniforms, this);
    }
    // common matrices
    p_uniforms.set(this._gl, object, 'modelViewMatrix');
    p_uniforms.set(this._gl, object, 'normalMatrix');
    p_uniforms.setValue(this._gl, 'modelMatrix', object.matrixWorld);
    return program;
  }
  // Uniforms (refresh uniforms objects)
  refreshUniformsCommon(uniforms: any, material: MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial | MeshDepthMaterial): void {
    uniforms.opacity.value = material.opacity;
    uniforms.diffuse.value = material.color;
    if (material.emissive) {
      uniforms.emissive.value.copy(material.emissive).multiplyScalar((material as any).emissiveIntensity);
    }
    uniforms.map.value = material.map;
    uniforms.specularMap.value = material.specularMap;
    uniforms.alphaMap.value = material.alphaMap;
    if ((material as any).aoMap) {
      uniforms.aoMap.value = (material as any).aoMap;
      uniforms.aoMapIntensity.value = (material as any).aoMapIntensity;
    }
    // uv repeat and offset setting priorities
    // 1. color map
    // 2. specular map
    // 3. normal map
    // 4. bump map
    // 5. alpha map
    // 6. emissive map
    let uvScaleMap;
    if (material.map) {
      uvScaleMap = material.map;
    } else if (material.specularMap) {
      uvScaleMap = material.specularMap;
    } else if (material.displacementMap) {
      uvScaleMap = material.displacementMap;
    } else if (material.normalMap) {
      uvScaleMap = material.normalMap;
    } else if (material.bumpMap) {
      uvScaleMap = material.bumpMap;
    } else if (material.roughnessMap) {
      uvScaleMap = material.roughnessMap;
    } else if (material.metalnessMap) {
      uvScaleMap = material.metalnessMap;
    } else if (material.alphaMap) {
      uvScaleMap = material.alphaMap;
    } else if (material.emissiveMap) {
      uvScaleMap = material.emissiveMap;
    }
    if (uvScaleMap !== undefined) {
      // backwards compatibility
      if (uvScaleMap instanceof WebGLRenderTarget) {
        uvScaleMap = uvScaleMap.texture;
      }
      const offset = uvScaleMap.offset;
      const repeat = uvScaleMap.repeat;
      uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);
    }
    uniforms.envMap.value = material.envMap;
    // don't flip CubeTexture envMaps, flip everything else:
    //  WebGLRenderTargetCube will be flipped for backwards compatibility
    //  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
    // this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
    uniforms.flipEnvMap.value = (! (material.envMap && material.envMap instanceof CubeTexture)) ? 1 : - 1;
    uniforms.reflectivity.value = material.reflectivity;
    uniforms.refractionRatio.value = (material as any).refractionRatio;
  }
  refreshUniformsLine(uniforms: any, material: LineBasicMaterial | LineDashedMaterial): void {
    uniforms.diffuse.value = material.color;
    uniforms.opacity.value = material.opacity;
  }
  refreshUniformsDash(uniforms: any, material: LineDashedMaterial): void {
    uniforms.dashSize.value = material.dashSize;
    uniforms.totalSize.value = material.dashSize + material.gapSize;
    uniforms.scale.value = material.scale;
  }
  refreshUniformsPoints(uniforms: any, material: PointsMaterial): void {
    uniforms.diffuse.value = material.color;
    uniforms.opacity.value = material.opacity;
    uniforms.size.value = material.size * this._pixelRatio;
    uniforms.scale.value = this._height * 0.5;
    uniforms.map.value = material.map;
    if (material.map !== null) {
      const offset = material.map.offset;
      const repeat = material.map.repeat;
      uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);
    }
  }
  refreshUniformsFog(uniforms: any, fog: Fog | FogExp2): void {
    uniforms.fogColor.value = fog.color;
    if (fog instanceof Fog) {
      uniforms.fogNear.value = fog.near;
      uniforms.fogFar.value = fog.far;
    } else if (fog instanceof FogExp2) {
      uniforms.fogDensity.value = fog.density;
    }
  }
  refreshUniformsLambert(uniforms: any, material: MeshLambertMaterial): void {
    if (material.lightMap) {
      uniforms.lightMap.value = material.lightMap;
      uniforms.lightMapIntensity.value = material.lightMapIntensity;
    }
    if (material.emissiveMap) {
      uniforms.emissiveMap.value = material.emissiveMap;
    }
  }
  refreshUniformsPhong(uniforms: any, material: MeshPhongMaterial): void {
    uniforms.specular.value = material.specular;
    uniforms.shininess.value = Math.max(material.shininess, 1e-4); // to prevent pow(0.0, 0.0)
    if (material.lightMap) {
      uniforms.lightMap.value = material.lightMap;
      uniforms.lightMapIntensity.value = material.lightMapIntensity;
    }
    if (material.emissiveMap) {
      uniforms.emissiveMap.value = material.emissiveMap;
    }
    if (material.bumpMap) {
      uniforms.bumpMap.value = material.bumpMap;
      uniforms.bumpScale.value = material.bumpScale;
    }
    if (material.normalMap) {
      uniforms.normalMap.value = material.normalMap;
      uniforms.normalScale.value.copy(material.normalScale);
    }
    if (material.displacementMap) {
      uniforms.displacementMap.value = material.displacementMap;
      uniforms.displacementScale.value = material.displacementScale;
      uniforms.displacementBias.value = material.displacementBias;
    }
  }
  refreshUniformsStandard(uniforms: any, material: MeshStandardMaterial): void {
    uniforms.roughness.value = material.roughness;
    uniforms.metalness.value = material.metalness;
    if (material.roughnessMap) {
      uniforms.roughnessMap.value = material.roughnessMap;
    }
    if (material.metalnessMap) {
      uniforms.metalnessMap.value = material.metalnessMap;
    }
    if (material.lightMap) {
      uniforms.lightMap.value = material.lightMap;
      uniforms.lightMapIntensity.value = material.lightMapIntensity;
    }
    if (material.emissiveMap) {
      uniforms.emissiveMap.value = material.emissiveMap;
    }
    if (material.bumpMap) {
      uniforms.bumpMap.value = material.bumpMap;
      uniforms.bumpScale.value = material.bumpScale;
    }
    if (material.normalMap) {
      uniforms.normalMap.value = material.normalMap;
      uniforms.normalScale.value.copy(material.normalScale);
    }
    if (material.displacementMap) {
      uniforms.displacementMap.value = material.displacementMap;
      uniforms.displacementScale.value = material.displacementScale;
      uniforms.displacementBias.value = material.displacementBias;
    }
    if (material.envMap) {
      //uniforms.envMap.value = material.envMap; // part of uniforms common
      uniforms.envMapIntensity.value = material.envMapIntensity;
    }
  }
  refreshUniformsPhysical(uniforms: any, material: MeshPhysicalMaterial): void {
    uniforms.clearCoat.value = material.clearCoat;
    uniforms.clearCoatRoughness.value = material.clearCoatRoughness;
    this.refreshUniformsStandard(uniforms, material);
  }
  // If uniforms are marked as clean, they don't need to be loaded to the GPU.
  markUniformsLightsNeedsUpdate(uniforms: any, value: boolean): void {
    uniforms.ambientLightColor.needsUpdate = value;
    uniforms.directionalLights.needsUpdate = value;
    uniforms.pointLights.needsUpdate = value;
    uniforms.spotLights.needsUpdate = value;
    uniforms.hemisphereLights.needsUpdate = value;
  }
  // Lighting
  setupShadows(lights: Light[]): void {
    let lightShadowsLength = 0;
    for (let i = 0, l = lights.length; i < l; i ++) {
      const light = lights[i];
      if (light.castShadow) {
        this._lights.shadows[lightShadowsLength ++] = light;
      }
    }
    this._lights.shadows.length = lightShadowsLength;
  }
  setupLights(lights: Light[], camera: Camera): void {
    let r = 0, g = 0, b = 0;
    const viewMatrix = camera.matrixWorldInverse;
    let directionalLength = 0;
    let pointLength = 0;
    let spotLength = 0;
    let hemiLength = 0;
    for (let l = 0, ll = lights.length; l < ll; l ++) {
      const light = lights[l];
      const color = light.color;
      const intensity = light.intensity;
      const distance = light.distance;
      const shadowMap = (light.shadow && light.shadow.map) ? light.shadow.map.texture : null;
      if (light instanceof AmbientLight) {
        r += color.r * intensity;
        g += color.g * intensity;
        b += color.b * intensity;
      } else if (light instanceof DirectionalLight) {
        const uniforms = this.lightCache.get(light);
        uniforms.color.copy(light.color).multiplyScalar(light.intensity);
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        this._vector3.setFromMatrixPosition(light.target.matrixWorld);
        uniforms.direction.sub(this._vector3);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.shadow = light.castShadow;
        if (light.castShadow) {
          uniforms.shadowBias = light.shadow.bias;
          uniforms.shadowRadius = light.shadow.radius;
          uniforms.shadowMapSize = light.shadow.mapSize;
        }
        this._lights.directionalShadowMap[directionalLength] = shadowMap;
        this._lights.directionalShadowMatrix[directionalLength] = light.shadow.matrix;
        this._lights.directional[directionalLength ++] = uniforms;
      } else if (light instanceof SpotLight) {
        const uniforms = this.lightCache.get(light);
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        uniforms.color.copy(color).multiplyScalar(intensity);
        uniforms.distance = distance;
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        this._vector3.setFromMatrixPosition(light.target.matrixWorld);
        uniforms.direction.sub(this._vector3);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.coneCos = Math.cos(light.angle);
        uniforms.penumbraCos = Math.cos(light.angle * (1 - light.penumbra));
        uniforms.decay = (light.distance === 0) ? 0.0 : light.decay;
        uniforms.shadow = light.castShadow;
        if (light.castShadow) {
          uniforms.shadowBias = light.shadow.bias;
          uniforms.shadowRadius = light.shadow.radius;
          uniforms.shadowMapSize = light.shadow.mapSize;
        }
        this._lights.spotShadowMap[spotLength] = shadowMap;
        this._lights.spotShadowMatrix[spotLength] = light.shadow.matrix;
        this._lights.spot[spotLength ++] = uniforms;
      } else if (light instanceof PointLight) {
        const uniforms = this.lightCache.get(light);
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        uniforms.color.copy(light.color).multiplyScalar(light.intensity);
        uniforms.distance = light.distance;
        uniforms.decay = (light.distance === 0) ? 0.0 : light.decay;
        uniforms.shadow = light.castShadow;
        if (light.castShadow) {
          uniforms.shadowBias = light.shadow.bias;
          uniforms.shadowRadius = light.shadow.radius;
          uniforms.shadowMapSize = light.shadow.mapSize;
        }
        this._lights.pointShadowMap[pointLength] = shadowMap;
        if (this._lights.pointShadowMatrix[pointLength] === undefined) {
          this._lights.pointShadowMatrix[pointLength] = new Matrix4();
        }
        // for point lights we set the shadow matrix to be a translation-only matrix
        // equal to inverse of the light's position
        this._vector3.setFromMatrixPosition(light.matrixWorld).negate();
        this._lights.pointShadowMatrix[pointLength].identity().setPosition(this._vector3);
        this._lights.point[pointLength ++] = uniforms;
      } else if (light instanceof HemisphereLight) {
        const uniforms = this.lightCache.get(light);
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.direction.normalize();
        uniforms.skyColor.copy(light.color).multiplyScalar(intensity);
        uniforms.groundColor.copy(light.groundColor).multiplyScalar(intensity);
        this._lights.hemi[hemiLength ++] = uniforms;
      }
    }
    this._lights.ambient[0] = r;
    this._lights.ambient[1] = g;
    this._lights.ambient[2] = b;
    this._lights.directional.length = directionalLength;
    this._lights.spot.length = spotLength;
    this._lights.point.length = pointLength;
    this._lights.hemi.length = hemiLength;
    this._lights.hash = directionalLength + ',' + pointLength + ',' + spotLength + ',' + hemiLength + ',' + this._lights.shadows.length;
  }
  // GL state setting
  setFaceCulling(cullFace: CullFace, frontFaceDirection: FrontFaceDirection): void {
    this.state.setCullFace(cullFace);
    this.state.setFlipSided(frontFaceDirection === FrontFaceDirection.CW);
  }
  // Textures
  allocTextureUnit(): number {
    const textureUnit = this._usedTextureUnits;
    if (textureUnit >= this.capabilities.maxTextures) {
      console.warn('WebGLRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this.capabilities.maxTextures);
    }
    this._usedTextureUnits += 1;
    return textureUnit;
  }
  ///this.allocTextureUnit = allocTextureUnit;
  // this.setTexture2D = setTexture2D;
  setTexture2D(texture: Texture, slot: number): void {
    let warned = false;
    // backwards compatibility: peel texture.texture
    //return function setTexture2D(texture, slot) {
      if (texture && texture instanceof WebGLRenderTarget) {
        if (! warned) {
          console.warn("THREE.WebGLRenderer.setTexture2D: don't use render targets as textures. Use their .texture property instead.");
          warned = true;
        }
        texture = texture.texture;
      }
      this.textures.setTexture2D(texture, slot);
    //};
  }
  setTexture(texture: Texture, slot: number): void {
    let warned = false;
    //return function setTexture(texture, slot) {
      if (! warned) {
        console.warn("THREE.WebGLRenderer: .setTexture is deprecated, use setTexture2D instead.");
        warned = true;
      }
      this.textures.setTexture2D(texture, slot);
    //};
  }
  setTextureCube(texture: Texture, slot: number): void {
    let warned = false;
    //return function setTextureCube(texture, slot) {
      // backwards compatibility: peel texture.texture
      if (texture && texture instanceof WebGLRenderTargetCube) {
        if (! warned) {
          console.warn("THREE.WebGLRenderer.setTextureCube: don't use cube render targets as textures. Use their .texture property instead.");
          warned = true;
        }
        texture = texture.texture;
      }
      // currently relying on the fact that WebGLRenderTargetCube.texture is a Texture and NOT a CubeTexture
      // TODO: unify these code paths
      if ((texture && texture instanceof CubeTexture) ||
         (Array.isArray(texture.image) && texture.image.length === 6)) {
        // CompressedTexture can have Array in image :/
        // this function alone should take care of cube textures
        this.textures.setTextureCube(texture, slot);
      } else {
        // assumed: texture property of THREE.WebGLRenderTargetCube
        this.textures.setTextureCubeDynamic(texture, slot);
      }
    //};
  }
  getCurrentRenderTarget(): WebGLRenderTarget {
    return this._currentRenderTarget;
  }
  setRenderTarget(renderTarget: WebGLRenderTarget): void {
    const _gl: WebGLRenderingContext = this._gl;
    this._currentRenderTarget = renderTarget;
    if (renderTarget && this.properties.get(renderTarget).__webglFramebuffer === undefined) {
      this.textures.setupRenderTarget(renderTarget);
    }
    let framebuffer;
    if (renderTarget) {
      const renderTargetProperties = this.properties.get(renderTarget);
      if (renderTarget && renderTarget instanceof WebGLRenderTargetCube) {
        framebuffer = renderTargetProperties.__webglFramebuffer[renderTarget.activeCubeFace];
      } else {
        framebuffer = renderTargetProperties.__webglFramebuffer;
      }
      this._currentScissor.copy(renderTarget.scissor);
      this._currentScissorTest = renderTarget.scissorTest;
      this._currentViewport.copy(renderTarget.viewport);
    } else {
      framebuffer = null;
      this._currentScissor.copy(this._scissor).multiplyScalar(this._pixelRatio);
      this._currentScissorTest = this._scissorTest;
      this._currentViewport.copy(this._viewport).multiplyScalar(this._pixelRatio);
    }
    if (this._currentFramebuffer !== framebuffer) {
      _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
      this._currentFramebuffer = framebuffer;
    }
    this.state.scissor(this._currentScissor);
    this.state.setScissorTest(this._currentScissorTest);
    this.state.viewport(this._currentViewport);
    if (renderTarget && renderTarget instanceof WebGLRenderTargetCube) {
      const textureProperties = this.properties.get(renderTarget.texture);
      _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, renderTarget.activeMipMapLevel);
    }
  }
  readRenderTargetPixels(renderTarget: WebGLRenderTarget, x: number, y: number, width: number, height: number, buffer: ArrayBufferView): void {
    const _gl: WebGLRenderingContext = this._gl;
    if ((renderTarget && renderTarget instanceof WebGLRenderTarget) === false) {
      console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.');
      return;
    }
    const framebuffer = this.properties.get(renderTarget).__webglFramebuffer;
    if (framebuffer) {
      let restore = false;
      if (framebuffer !== this._currentFramebuffer) {
        _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
        restore = true;
      }
      try {
        const texture = renderTarget.texture;
        const textureFormat = texture.format;
        const textureType = texture.type;
        if (textureFormat !== TextureFormat.RGBA && this.paramThreeToGL(textureFormat) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {
          console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.');
          return;
        }
        if (textureType !== TextureType.UnsignedByte && this.paramThreeToGL(textureType) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_TYPE) && // IE11, Edge and Chrome Mac < 52 (#9513)
             ! (textureType === TextureType.Float && (this.extensions.get('OES_texture_float') || this.extensions.get('WEBGL_color_buffer_float'))) && // Chrome Mac >= 52 and Firefox
             ! (textureType === TextureType.HalfFloat && this.extensions.get('EXT_color_buffer_half_float'))) {
          console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in TextureType.UnsignedByte or implementation defined type.');
          return;
        }
        if (_gl.checkFramebufferStatus(_gl.FRAMEBUFFER) === _gl.FRAMEBUFFER_COMPLETE) {
          // the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)
          if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {
            _gl.readPixels(x, y, width, height, this.paramThreeToGL(textureFormat), this.paramThreeToGL(textureType), buffer);
          }
        } else {
          console.error('THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.');
        }
      } finally {
        if (restore) {
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, this._currentFramebuffer);
        }
      }
    }
  }
  // Map three.js constants to WebGL constants
  paramThreeToGL(p: number): number {
    const _gl: WebGLRenderingContext = this._gl;
    let extension;
    if (p === TextureWrapping.Repeat) return _gl.REPEAT;
    if (p === TextureWrapping.ClampToEdge) return _gl.CLAMP_TO_EDGE;
    if (p === TextureWrapping.MirroredRepeat) return _gl.MIRRORED_REPEAT;
    if (p === TextureFilter.Nearest) return _gl.NEAREST;
    if (p === TextureFilter.NearestMipMapNearest) return _gl.NEAREST_MIPMAP_NEAREST;
    if (p === TextureFilter.NearestMipMapLinear) return _gl.NEAREST_MIPMAP_LINEAR;
    if (p === TextureFilter.Linear) return _gl.LINEAR;
    if (p === TextureFilter.LinearMipMapNearest) return _gl.LINEAR_MIPMAP_NEAREST;
    if (p === TextureFilter.LinearMipMapLinear) return _gl.LINEAR_MIPMAP_LINEAR;
    if (p === TextureType.UnsignedByte) return _gl.UNSIGNED_BYTE;
    if (p === TextureType.UnsignedShort4444) return _gl.UNSIGNED_SHORT_4_4_4_4;
    if (p === TextureType.UnsignedShort5551) return _gl.UNSIGNED_SHORT_5_5_5_1;
    if (p === TextureType.UnsignedShort565) return _gl.UNSIGNED_SHORT_5_6_5;
    if (p === TextureType.Byte) return _gl.BYTE;
    if (p === TextureType.Short) return _gl.SHORT;
    if (p === TextureType.UnsignedShort) return _gl.UNSIGNED_SHORT;
    if (p === TextureType.Int) return _gl.INT;
    if (p === TextureType.UnsignedInt) return _gl.UNSIGNED_INT;
    if (p === TextureType.Float) return _gl.FLOAT;
    if (p === TextureType.HalfFloat) {
      extension = this.extensions.get('OES_texture_half_float');
      if (extension !== null) return extension.HALF_FLOAT_OES;
    }
    if (p === TextureFormat.Alpha) return _gl.ALPHA;
    if (p === TextureFormat.RGB) return _gl.RGB;
    if (p === TextureFormat.RGBA) return _gl.RGBA;
    if (p === TextureFormat.Luminance) return _gl.LUMINANCE;
    if (p === TextureFormat.LuminanceAlpha) return _gl.LUMINANCE_ALPHA;
    if (p === TextureFormat.Depth) return _gl.DEPTH_COMPONENT;
    if (p === TextureFormat.DepthStencil) return _gl.DEPTH_STENCIL;
    if (p === BlendingEquation.Add) return _gl.FUNC_ADD;
    if (p === BlendingEquation.Subtract) return _gl.FUNC_SUBTRACT;
    if (p === BlendingEquation.ReverseSubtract) return _gl.FUNC_REVERSE_SUBTRACT;
    if (p === BlendingFactor.Zero) return _gl.ZERO;
    if (p === BlendingFactor.One) return _gl.ONE;
    if (p === BlendingFactor.SrcColor) return _gl.SRC_COLOR;
    if (p === BlendingFactor.OneMinusSrcColor) return _gl.ONE_MINUS_SRC_COLOR;
    if (p === BlendingFactor.SrcAlpha) return _gl.SRC_ALPHA;
    if (p === BlendingFactor.OneMinusSrcAlpha) return _gl.ONE_MINUS_SRC_ALPHA;
    if (p === BlendingFactor.DstAlpha) return _gl.DST_ALPHA;
    if (p === BlendingFactor.OneMinusDstAlpha) return _gl.ONE_MINUS_DST_ALPHA;
    if (p === BlendingFactor.DstColor) return _gl.DST_COLOR;
    if (p === BlendingFactor.OneMinusDstColor) return _gl.ONE_MINUS_DST_COLOR;
    if (p === BlendingFactor.SrcAlphaSaturate) return _gl.SRC_ALPHA_SATURATE;
    if (p === TextureFormat.RGB_S3TC_DXT1 || p === TextureFormat.RGBA_S3TC_DXT1 ||
      p === TextureFormat.RGBA_S3TC_DXT3 || p === TextureFormat.RGBA_S3TC_DXT5) {
      extension = this.extensions.get('WEBGL_compressed_texture_s3tc');
      if (extension !== null) {
        if (p === TextureFormat.RGB_S3TC_DXT1) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (p === TextureFormat.RGBA_S3TC_DXT1) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (p === TextureFormat.RGBA_S3TC_DXT3) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (p === TextureFormat.RGBA_S3TC_DXT5) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      }
    }
    if (p === TextureFormat.RGB_PVRTC_4BPPV1 || p === TextureFormat.RGB_PVRTC_2BPPV1 ||
       p === TextureFormat.RGBA_PVRTC_4BPPV1 || p === TextureFormat.RGBA_PVRTC_2BPPV1) {
      extension = this.extensions.get('WEBGL_compressed_texture_pvrtc');
      if (extension !== null) {
        if (p === TextureFormat.RGB_PVRTC_4BPPV1) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (p === TextureFormat.RGB_PVRTC_2BPPV1) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (p === TextureFormat.RGBA_PVRTC_4BPPV1) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (p === TextureFormat.RGBA_PVRTC_2BPPV1) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      }
    }
    if (p === TextureFormat.RGB_ETC1) {
      extension = this.extensions.get('WEBGL_compressed_texture_etc1');
      if (extension !== null) {
        if (p === TextureFormat.RGB_ETC1) return extension.COMPRESSED_RGB_ETC1_WEBGL;
      }
    }
    if (p === BlendingEquation.Min || p === BlendingEquation.Max) {
      extension = this.extensions.get('EXT_blend_minmax');
      if (extension !== null) {
        if (p === BlendingEquation.Min) return extension.MIN_EXT;
        if (p === BlendingEquation.Max) return extension.MAX_EXT;
      }
    }
    if (p === TextureType.UnsignedInt248) {
      extension = this.extensions.get('WEBGL_depth_texture');
      if (extension !== null) return extension.UNSIGNED_INT_24_8_WEBGL;
  }
    return 0;
  }
  supportsFloatTextures(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get(\"OES_texture_float\").");
    return this.extensions.get("OES_texture_float");
  }
  supportsHalfFloatTextures(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get(\"OES_texture_half_float\").");
    return this.extensions.get("OES_texture_half_float");
  }
  supportsStandardDerivatives(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get(\"OES_standard_derivatives\").");
    return this.extensions.get("OES_standard_derivatives");
  }
  supportsCompressedTextureS3TC(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get(\"WEBGL_compressed_texture_s3tc\").");
    return this.extensions.get("WEBGL_compressed_texture_s3tc");
  }
  supportsCompressedTexturePVRTC(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get(\"WEBGL_compressed_texture_pvrtc\").");
    return this.extensions.get("WEBGL_compressed_texture_pvrtc");
  }
  supportsBlendMinMax(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get(\"EXT_blend_minmax\").");
    return this.extensions.get("EXT_blend_minmax");
  }
  supportsVertexTextures(): boolean {
    return this.capabilities.vertexTextures;
  }
  supportsInstancedArrays(): boolean {
    console.warn("THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get(\"ANGLE_instanced_arrays\").");
    return this.extensions.get("ANGLE_instanced_arrays");
  }
  enableScissorTest(test: boolean): void {
    console.warn("THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest().");
    this.setScissorTest(test);
  }
  //initMaterial() {
  //  console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.");
  //}
  addPrePlugin(): void {
    console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.");
  }
  addPostPlugin(): void {
    console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.");
  }
  updateShadowMap(): void {
    console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.");
  }
  get shadowMapEnabled(): boolean {
    return this.shadowMap.enabled;
  }
  set shadowMapEnabled(value: boolean) {
    console.warn("THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.");
    this.shadowMap.enabled = value;
  }
  get shadowMapType(): number {
    return this.shadowMap.type;
  }
  set shadowMapType(value: number) {
    console.warn("THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.");
    this.shadowMap.type = value;
  }
  get shadowMapCullFace(): number {
    return this.shadowMap.cullFace;
  }
  set shadowMapCullFace(value: number) {
    console.warn("THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace.");
    this.shadowMap.cullFace = value;
  }
}
