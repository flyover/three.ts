import { EventDispatcher } from "../core/EventDispatcher";
import { ColorsMode, SideMode, ShadingMode, DepthFunction, BlendingEquation, BlendingFactor } from "../constants";
import { BlendingMode } from "../constants";
import { Color } from "../math/Color";
import { _Math } from "../math/Math";
import { Vector3 } from "../math/Vector3";
import { Plane } from "../math/Plane";
import { Texture } from "../textures/Texture";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
export interface MaterialParameters {
  fog?: boolean;
  lights?: boolean;
  blending?: BlendingMode;
  side?: SideMode;
  shading?: ShadingMode;
  vertexColors?: ColorsMode;
  opacity?: number;
  transparent?: boolean;
  blendSrc?: BlendingFactor;
  blendDst?: BlendingFactor;
  blendEquation?: BlendingEquation;
  blendSrcAlpha?: BlendingFactor;
  blendDstAlpha?: BlendingFactor;
  blendEquationAlpha?: BlendingEquation;
  depthFunc?: DepthFunction;
  depthTest?: boolean;
  depthWrite?: boolean;
  clipping?: boolean;
  clippingPlanes?: Plane[];
  clipIntersection?: boolean;
  clipShadows?: boolean;
  colorWrite?: boolean;
  precision?: string;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  polygonOffsetUnits?: number;
  alphaTest?: number;
  premultipliedAlpha?: boolean;
  overdraw?: number;
  visible?: boolean;
}
export class Material extends EventDispatcher {
  id: number = MaterialIdCount();
  uuid: string = _Math.generateUUID();
  name: string = '';
  type: string = 'Material';
  fog: boolean = true;
  lights: boolean = true;
  blending: BlendingMode = BlendingMode.Normal;
  side: SideMode = SideMode.Front;
  shading: ShadingMode = ShadingMode.Smooth; // THREE.ShadingMode.Flat, THREE.ShadingMode.Smooth
  vertexColors: ColorsMode = ColorsMode.None; // THREE.ColorsMode.No, THREE.ColorsMode.Vertex, THREE.ColorsMode.Face
  _opacity: number = 1;
  transparent: boolean = false;
  blendSrc: BlendingFactor = BlendingFactor.SrcAlpha;
  blendDst: BlendingFactor = BlendingFactor.OneMinusSrcAlpha;
  blendEquation: BlendingEquation = BlendingEquation.Add;
  blendSrcAlpha: BlendingFactor = null;
  blendDstAlpha: BlendingFactor = null;
  blendEquationAlpha: BlendingEquation = null;
  depthFunc: DepthFunction = DepthFunction.LessEqual;
  depthTest: boolean = true;
  depthWrite: boolean = true;
  clipping: boolean = false;
  clippingPlanes: Plane[] = null;
  clipIntersection: boolean = false;
  clipShadows: boolean = false;
  colorWrite: boolean = true;
  precision: string = null; // override the renderer's default precision for this material
  polygonOffset: boolean = false;
  polygonOffsetFactor: number = 0;
  polygonOffsetUnits: number = 0;
  alphaTest: number = 0;
  premultipliedAlpha: boolean = false;
  overdraw: number = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer
  visible: boolean = true;
  _needsUpdate: boolean = true;
  // {
  color: any;
  roughness: any;
  metalness: any;
  emissive: any;
  specular: any;
  map: any;
  shininess: any;
  alphaMap: any;
  lightMap: any;
  bumpMap: any;
  bumpScale: any;
  normalMap: any;
  normalScale: any;
  displacementMap: any;
  displacementScale: any;
  displacementBias: any;
  roughnessMap: any;
  metalnessMap: any;
  emissiveMap: any;
  specularMapl: any;
  envMap: any;
  specularMap: any;
  reflectivity: any;
  size: any;
  sizeAttenuation: any;
  wireframe: any;
  wireframeLinewidth: any;
  wireframeLinecap: any;
  wireframeLinejoin: any;
  skinning: any;
  morphTargets: any;
  materials: any;
  defaultAttributeValues: any;
  linewidth: any;
  morphNormals: any;
  program: any;
  uniforms: any;
  morphTransparency: any;
  // }
  readonly isMaterial: boolean = true;
  readonly isMultiMaterial: boolean = false;
  constructor() {
    super();
  }
  get opacity(): number {
    return this._opacity;
  }
  set opacity(value: number) {
    this._opacity = value;
  }
  get needsUpdate(): boolean {
    return this._needsUpdate;
  }
  set needsUpdate(value: boolean) {
    if (value === true) this.update();
    this._needsUpdate = value;
  }
  setValues(values: MaterialParameters): void {
    if (values === undefined) return;
    for (let key in values) {
      let newValue = values[key];
      if (newValue === undefined) {
        console.warn("THREE.Material: '" + key + "' parameter is undefined.");
        continue;
      }
      let currentValue = this[key];
      if (currentValue === undefined) {
        console.warn("THREE." + this.type + ": '" + key + "' is not a property of this material.");
        continue;
      }
      if ((currentValue && currentValue instanceof Color)) {
        currentValue.set(newValue);
      } else if ((currentValue && currentValue instanceof Vector3) && (newValue && newValue instanceof Vector3)) {
        currentValue.copy(newValue);
      } else if (key === 'overdraw') {
        // ensure overdraw is backwards-compatible with legacy boolean type
        this[key] = Number(newValue);
      } else {
        this[key] = newValue;
      }
    }
  }
  toJSON(meta: any): any {
    let isRoot = meta === undefined;
    if (isRoot) {
      meta = {
        textures: {},
        images: {}
      };
    }
    let data: any = {
      metadata: {
        version: 4.4,
        type: 'Material',
        generator: 'Material.toJSON'
      }
    };
    // standard Material serialization
    data.uuid = this.uuid;
    data.type = this.type;
    if (this.name !== '') data.name = this.name;
    if ((this.color && this.color instanceof Color)) data.color = this.color.getHex();
    if (this.roughness !== undefined) data.roughness = this.roughness;
    if (this.metalness !== undefined) data.metalness = this.metalness;
    if ((this.emissive && this.emissive instanceof Color)) data.emissive = this.emissive.getHex();
    if ((this.specular && this.specular instanceof Color)) data.specular = this.specular.getHex();
    if (this.shininess !== undefined) data.shininess = this.shininess;
    if ((this.map && this.map instanceof Texture)) data.map = this.map.toJSON(meta).uuid;
    if ((this.alphaMap && this.alphaMap instanceof Texture)) data.alphaMap = this.alphaMap.toJSON(meta).uuid;
    if ((this.lightMap && this.lightMap instanceof Texture)) data.lightMap = this.lightMap.toJSON(meta).uuid;
    if ((this.bumpMap && this.bumpMap instanceof Texture)) {
      data.bumpMap = this.bumpMap.toJSON(meta).uuid;
      data.bumpScale = this.bumpScale;
    }
    if ((this.normalMap && this.normalMap instanceof Texture)) {
      data.normalMap = this.normalMap.toJSON(meta).uuid;
      data.normalScale = this.normalScale.toArray();
    }
    if ((this.displacementMap && this.displacementMap instanceof Texture)) {
      data.displacementMap = this.displacementMap.toJSON(meta).uuid;
      data.displacementScale = this.displacementScale;
      data.displacementBias = this.displacementBias;
    }
    if ((this.roughnessMap && this.roughnessMap instanceof Texture)) data.roughnessMap = this.roughnessMap.toJSON(meta).uuid;
    if ((this.metalnessMap && this.metalnessMap instanceof Texture)) data.metalnessMap = this.metalnessMap.toJSON(meta).uuid;
    if ((this.emissiveMap && this.emissiveMap instanceof Texture)) data.emissiveMap = this.emissiveMap.toJSON(meta).uuid;
    if ((this.specularMap && this.specularMap instanceof Texture)) data.specularMap = this.specularMap.toJSON(meta).uuid;
    if ((this.envMap && this.envMap instanceof Texture)) {
      data.envMap = this.envMap.toJSON(meta).uuid;
      data.reflectivity = this.reflectivity; // Scale behind envMap
    }
    if (this.size !== undefined) data.size = this.size;
    if (this.sizeAttenuation !== undefined) data.sizeAttenuation = this.sizeAttenuation;
    if (this.blending !== BlendingMode.Normal) data.blending = this.blending;
    if (this.shading !== ShadingMode.Smooth) data.shading = this.shading;
    if (this.side !== SideMode.Front) data.side = this.side;
    if (this.vertexColors !== ColorsMode.None) data.vertexColors = this.vertexColors;
    if (this.opacity < 1) data.opacity = this.opacity;
    if (this.transparent === true) data.transparent = this.transparent;
    data.depthFunc = this.depthFunc;
    data.depthTest = this.depthTest;
    data.depthWrite = this.depthWrite;
    if (this.alphaTest > 0) data.alphaTest = this.alphaTest;
    if (this.premultipliedAlpha === true) data.premultipliedAlpha = this.premultipliedAlpha;
    if (this.wireframe === true) data.wireframe = this.wireframe;
    if (this.wireframeLinewidth > 1) data.wireframeLinewidth = this.wireframeLinewidth;
    if (this.wireframeLinecap !== 'round') data.wireframeLinecap = this.wireframeLinecap;
    if (this.wireframeLinejoin !== 'round') data.wireframeLinejoin = this.wireframeLinejoin;
    data.skinning = this.skinning;
    data.morphTargets = this.morphTargets;
    // TODO: Copied from Object3D.toJSON
    function extractFromCache(cache: any) {
      let values = [];
      for (let key in cache) {
        let data = cache[key];
        delete data.metadata;
        values.push(data);
      }
      return values;
    }
    if (isRoot) {
      let textures = extractFromCache(meta.textures);
      let images = extractFromCache(meta.images);
      if (textures.length > 0) data.textures = textures;
      if (images.length > 0) data.images = images;
    }
    return data;
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  copy(source: this): this {
    this.name = source.name;
    this.fog = source.fog;
    this.lights = source.lights;
    this.blending = source.blending;
    this.side = source.side;
    this.shading = source.shading;
    this.vertexColors = source.vertexColors;
    this.opacity = source.opacity;
    this.transparent = source.transparent;
    this.blendSrc = source.blendSrc;
    this.blendDst = source.blendDst;
    this.blendEquation = source.blendEquation;
    this.blendSrcAlpha = source.blendSrcAlpha;
    this.blendDstAlpha = source.blendDstAlpha;
    this.blendEquationAlpha = source.blendEquationAlpha;
    this.depthFunc = source.depthFunc;
    this.depthTest = source.depthTest;
    this.depthWrite = source.depthWrite;
    this.colorWrite = source.colorWrite;
    this.precision = source.precision;
    this.polygonOffset = source.polygonOffset;
    this.polygonOffsetFactor = source.polygonOffsetFactor;
    this.polygonOffsetUnits = source.polygonOffsetUnits;
    this.alphaTest = source.alphaTest;
    this.premultipliedAlpha = source.premultipliedAlpha;
    this.overdraw = source.overdraw;
    this.visible = source.visible;
    this.clipShadows = source.clipShadows;
    this.clipIntersection = source.clipIntersection;
    let srcPlanes = source.clippingPlanes,
      dstPlanes = null;
    if (srcPlanes !== null) {
      let n = srcPlanes.length;
      dstPlanes = new Array(n);
      for (let i = 0; i !== n; ++ i)
        dstPlanes[i] = srcPlanes[i].clone();
    }
    this.clippingPlanes = dstPlanes;
    return this;
  }
  update(): void {
    this.dispatchEvent({ type: 'update' });
  }
  dispose(): void {
    this.dispatchEvent({ type: 'dispose' });
  }
  get wrapAround(): boolean {
    console.warn("THREE." + this.type + ": .wrapAround has been removed.");
    return false;
  }
  set wrapAround(value: boolean) {
    console.warn("THREE." + this.type + ": .wrapAround has been removed.");
  }
  get wrapRGB(): Color {
    console.warn("THREE." + this.type + ": .wrapRGB has been removed.");
    return new Color();
  }
}
let count: number = 0;
export function MaterialIdCount(): number { return count++; };
