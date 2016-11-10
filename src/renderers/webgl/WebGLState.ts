/**
 * @author mrdoob / http://mrdoob.com/
 */
import { DepthFunction, CullFace } from "../../constants";
import { BlendingMode } from "../../constants";
import { Vector4 } from "../../math/Vector4";
class ColorBuffer {
  state: any;
  locked: boolean = false;
  color: Vector4 = new Vector4();
  currentColorMask: number = null;
  currentColorClear: Vector4 = new Vector4();
  constructor(state: any) {
    this.state = state;
  }
  setMask(colorMask: number): void {
    if (this.currentColorMask !== colorMask && ! this.locked) {
      this.state.gl.colorMask(colorMask, colorMask, colorMask, colorMask);
      this.currentColorMask = colorMask;
    }
  }
  setLocked(lock: boolean): void {
    this.locked = lock;
  }
  setClear(r: number, g: number, b: number, a: number): void {
    this.color.set(r, g, b, a);
    if (this.currentColorClear.equals(this.color) === false) {
      this.state.gl.clearColor(r, g, b, a);
      this.currentColorClear.copy(this.color);
    }
  }
  reset(): void {
    this.locked = false;
    this.currentColorMask = null;
    this.currentColorClear.set(0, 0, 0, 1);
  }
}
class DepthBuffer {
  state: any;
  locked: boolean = false;
  currentDepthMask: number = null;
  currentDepthFunc: number = null;
  currentDepthClear: number = null;
  constructor(state: any) {
    this.state = state;
  }
  setTest(depthTest: boolean): void {
    const gl = this.state.gl;
    if (depthTest) {
      this.state.enable(gl.DEPTH_TEST);
    } else {
      this.state.disable(gl.DEPTH_TEST);
    }
  }
  setMask(depthMask: number): void {
    const gl = this.state.gl;
    if (this.currentDepthMask !== depthMask && ! this.locked) {
      gl.depthMask(depthMask);
      this.currentDepthMask = depthMask;
    }
  }
  setFunc(depthFunc: number): void {
    const gl = this.state.gl;
    if (this.currentDepthFunc !== depthFunc) {
      if (depthFunc) {
        switch (depthFunc) {
          case DepthFunction.Never:
            gl.depthFunc(gl.NEVER);
            break;
          case DepthFunction.Always:
            gl.depthFunc(gl.ALWAYS);
            break;
          case DepthFunction.Less:
            gl.depthFunc(gl.LESS);
            break;
          case DepthFunction.LessEqual:
            gl.depthFunc(gl.LEQUAL);
            break;
          case DepthFunction.Equal:
            gl.depthFunc(gl.EQUAL);
            break;
          case DepthFunction.GreaterEqual:
            gl.depthFunc(gl.GEQUAL);
            break;
          case DepthFunction.Greater:
            gl.depthFunc(gl.GREATER);
            break;
          case DepthFunction.NotEqual:
            gl.depthFunc(gl.NOTEQUAL);
            break;
          default:
            gl.depthFunc(gl.LEQUAL);
        }
      } else {
        gl.depthFunc(gl.LEQUAL);
      }
      this.currentDepthFunc = depthFunc;
    }
  }
  setLocked(lock: boolean): void {
    this.locked = lock;
  }
  setClear(depth: number): void {
    const gl = this.state.gl;
    if (this.currentDepthClear !== depth) {
      gl.clearDepth(depth);
      this.currentDepthClear = depth;
    }
  }
  reset(): void {
    this.locked = false;
    this.currentDepthMask = null;
    this.currentDepthFunc = null;
    this.currentDepthClear = null;
  }
}
class StencilBuffer {
  state: any;
  locked: boolean = false;
  currentStencilMask: number = null;
  currentStencilFunc: number = null;
  currentStencilRef: number = null;
  currentStencilFuncMask: number = null;
  currentStencilFail: number  = null;
  currentStencilZFail: number = null;
  currentStencilZPass: number = null;
  currentStencilClear: number = null;
  constructor(state: any) {
    this.state = state;
  }
  setTest(stencilTest: number): void {
    const gl = this.state.gl;
    if (stencilTest) {
      this.state.enable(gl.STENCIL_TEST);
    } else {
      this.state.disable(gl.STENCIL_TEST);
    }
  }
  setMask(stencilMask: number): void {
    const gl = this.state.gl;
    if (this.currentStencilMask !== stencilMask && ! this.locked) {
      gl.stencilMask(stencilMask);
      this.currentStencilMask = stencilMask;
    }
  }
  setFunc(stencilFunc: number, stencilRef: number, stencilMask: number): void {
    const gl = this.state.gl;
    if (this.currentStencilFunc !== stencilFunc ||
        this.currentStencilRef   !== stencilRef   ||
        this.currentStencilFuncMask !== stencilMask) {
      gl.stencilFunc(stencilFunc,  stencilRef, stencilMask);
      this.currentStencilFunc = stencilFunc;
      this.currentStencilRef  = stencilRef;
      this.currentStencilFuncMask = stencilMask;
    }
  }
  setOp(stencilFail: number, stencilZFail: number, stencilZPass: number): void {
    const gl = this.state.gl;
    if (this.currentStencilFail   !== stencilFail   ||
        this.currentStencilZFail !== stencilZFail ||
        this.currentStencilZPass !== stencilZPass) {
      gl.stencilOp(stencilFail,  stencilZFail, stencilZPass);
      this.currentStencilFail  = stencilFail;
      this.currentStencilZFail = stencilZFail;
      this.currentStencilZPass = stencilZPass;
    }
  }
  setLocked(lock: boolean): void {
    this.locked = lock;
  }
  setClear(stencil: number) {
    const gl = this.state.gl;
    if (this.currentStencilClear !== stencil) {
      gl.clearStencil(stencil);
      this.currentStencilClear = stencil;
    }
  }
  reset(): void {
    this.locked = false;
    this.currentStencilMask = null;
    this.currentStencilFunc = null;
    this.currentStencilRef = null;
    this.currentStencilFuncMask = null;
    this.currentStencilFail = null;
    this.currentStencilZFail = null;
    this.currentStencilZPass = null;
    this.currentStencilClear = null;
  }
}
export class WebGLState {
  //
  gl: any;
  extensions: any;
  paramThreeToGL: any;
  colorBuffer: any;
  depthBuffer: any;
  stencilBuffer: any;
  maxVertexAttributes: any;
  newAttributes: any;
  enabledAttributes: any;
  attributeDivisors: any;
  capabilities: any = {};
  compressedTextureFormats: any = null;
  currentBlending: any = null;
  currentBlendEquation: any = null;
  currentBlendSrc: any = null;
  currentBlendDst: any = null;
  currentBlendEquationAlpha: any = null;
  currentBlendSrcAlpha: any = null;
  currentBlendDstAlpha: any = null;
  currentPremultipledAlpha: any = false;
  currentFlipSided: any = null;
  currentCullFace: any = null;
  currentLineWidth: any = null;
  currentPolygonOffsetFactor: any = null;
  currentPolygonOffsetUnits: any = null;
  currentScissorTest: any = null;
  maxTextures: any;
  currentTextureSlot: any = null;
  currentBoundTextures: any = {};
  currentScissor = new Vector4();
  currentViewport = new Vector4();
  emptyTextures = {};
  buffers: any;
  constructor(gl: any, extensions: any, paramThreeToGL: any) {
    this.gl = gl;
    this.extensions = extensions;
    this.paramThreeToGL = paramThreeToGL;
    this.colorBuffer = new ColorBuffer(this);
    this.depthBuffer = new DepthBuffer(this);
    this.stencilBuffer = new StencilBuffer(this);
    this.maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.newAttributes = new Uint8Array(this.maxVertexAttributes);
    this.enabledAttributes = new Uint8Array(this.maxVertexAttributes);
    this.attributeDivisors = new Uint8Array(this.maxVertexAttributes);
    this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.emptyTextures[gl.TEXTURE_2D] = this.createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
    this.emptyTextures[gl.TEXTURE_CUBE_MAP] = this.createTexture(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);
    this.buffers = {
      color: this.colorBuffer,
      depth: this.depthBuffer,
      stencil: this.stencilBuffer
    };
  }
  createTexture(type: GLenum, target: GLenum, count: number): GLint {
    const gl = this.gl;
    const data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
    const texture = gl.createTexture();
    gl.bindTexture(type, texture);
    gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    for (let i = 0; i < count; i ++) {
      gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    }
    return texture;
  }
  //
  init(): void {
    const gl = this.gl;
    this.clearColor(0, 0, 0, 1);
    this.clearDepth(1);
    this.clearStencil(0);
    this.enable(gl.DEPTH_TEST);
    this.setDepthFunc(DepthFunction.LessEqual);
    this.setFlipSided(false);
    this.setCullFace(CullFace.Back);
    this.enable(gl.CULL_FACE);
    this.enable(gl.BLEND);
    this.setBlending(BlendingMode.Normal);
  }
  initAttributes(): void {
    for (let i = 0, l = this.newAttributes.length; i < l; i ++) {
      this.newAttributes[i] = 0;
    }
  }
  enableAttribute(attribute: any): void {
    const gl = this.gl;
    this.newAttributes[attribute] = 1;
    if (this.enabledAttributes[attribute] === 0) {
      gl.enableVertexAttribArray(attribute);
      this.enabledAttributes[attribute] = 1;
    }
    if (this.attributeDivisors[attribute] !== 0) {
      const extension = this.extensions.get('ANGLE_instanced_arrays');
      extension.vertexAttribDivisorANGLE(attribute, 0);
      this.attributeDivisors[attribute] = 0;
    }
  }
  enableAttributeAndDivisor(attribute: any, meshPerAttribute: any, extension: any): void {
    const gl = this.gl;
    this.newAttributes[attribute] = 1;
    if (this.enabledAttributes[attribute] === 0) {
      gl.enableVertexAttribArray(attribute);
      this.enabledAttributes[attribute] = 1;
    }
    if (this.attributeDivisors[attribute] !== meshPerAttribute) {
      extension.vertexAttribDivisorANGLE(attribute, meshPerAttribute);
      this.attributeDivisors[attribute] = meshPerAttribute;
    }
  }
  disableUnusedAttributes(): void {
    const gl = this.gl;
    for (let i = 0, l = this.enabledAttributes.length; i !== l; ++ i) {
      if (this.enabledAttributes[i] !== this.newAttributes[i]) {
        gl.disableVertexAttribArray(i);
        this.enabledAttributes[i] = 0;
      }
    }
  }
  enable(id: any): void {
    const gl = this.gl;
    if (this.capabilities[id] !== true) {
      gl.enable(id);
      this.capabilities[id] = true;
    }
  }
  disable(id: any): void {
    const gl = this.gl;
    if (this.capabilities[id] !== false) {
      gl.disable(id);
      this.capabilities[id] = false;
    }
  }
  getCompressedTextureFormats(): string[] {
    const gl = this.gl;
    if (this.compressedTextureFormats === null) {
      this.compressedTextureFormats = [];
      if (this.extensions.get('WEBGL_compressed_texture_pvrtc') ||
        this.extensions.get('WEBGL_compressed_texture_s3tc') ||
        this.extensions.get('WEBGL_compressed_texture_etc1')) {
        const formats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
        for (let i = 0; i < formats.length; i ++) {
          this.compressedTextureFormats.push(formats[i]);
        }
      }
    }
    return this.compressedTextureFormats;
  }
  setBlending(blending: number, blendEquation?: number, blendSrc?: number, blendDst?: number, blendEquationAlpha?: number, blendSrcAlpha?: number, blendDstAlpha?: number, premultipliedAlpha?: boolean): void {
    const gl = this.gl;
    if (blending !== BlendingMode.None) {
      this.enable(gl.BLEND);
    } else {
      this.disable(gl.BLEND);
    }
    if (blending !== this.currentBlending || premultipliedAlpha !== this.currentPremultipledAlpha) {
      if (blending === BlendingMode.Additive) {
        if (premultipliedAlpha) {
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
          gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
        } else {
          gl.blendEquation(gl.FUNC_ADD);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        }
      } else if (blending === BlendingMode.Subtractive) {
        if (premultipliedAlpha) {
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
          gl.blendFuncSeparate(gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA);
        } else {
          gl.blendEquation(gl.FUNC_ADD);
          gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
        }
      } else if (blending === BlendingMode.Multiply) {
        if (premultipliedAlpha) {
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
          gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
        } else {
          gl.blendEquation(gl.FUNC_ADD);
          gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
        }
      } else {
        if (premultipliedAlpha) {
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
          gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        } else {
          gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
      }
      this.currentBlending = blending;
      this.currentPremultipledAlpha = premultipliedAlpha;
    }
    if (blending === BlendingMode.Custom) {
      blendEquationAlpha = blendEquationAlpha || blendEquation;
      blendSrcAlpha = blendSrcAlpha || blendSrc;
      blendDstAlpha = blendDstAlpha || blendDst;
      if (blendEquation !== this.currentBlendEquation || blendEquationAlpha !== this.currentBlendEquationAlpha) {
        gl.blendEquationSeparate(this.paramThreeToGL(blendEquation), this.paramThreeToGL(blendEquationAlpha));
        this.currentBlendEquation = blendEquation;
        this.currentBlendEquationAlpha = blendEquationAlpha;
      }
      if (blendSrc !== this.currentBlendSrc || blendDst !== this.currentBlendDst || blendSrcAlpha !== this.currentBlendSrcAlpha || blendDstAlpha !== this.currentBlendDstAlpha) {
        gl.blendFuncSeparate(this.paramThreeToGL(blendSrc), this.paramThreeToGL(blendDst), this.paramThreeToGL(blendSrcAlpha), this.paramThreeToGL(blendDstAlpha));
        this.currentBlendSrc = blendSrc;
        this.currentBlendDst = blendDst;
        this.currentBlendSrcAlpha = blendSrcAlpha;
        this.currentBlendDstAlpha = blendDstAlpha;
      }
    } else {
      this.currentBlendEquation = null;
      this.currentBlendSrc = null;
      this.currentBlendDst = null;
      this.currentBlendEquationAlpha = null;
      this.currentBlendSrcAlpha = null;
      this.currentBlendDstAlpha = null;
    }
  }
  // TODO Deprecate
  setColorWrite(colorWrite: boolean): void {
    this.colorBuffer.setMask(colorWrite);
  }
  setDepthTest(depthTest: boolean): void {
    this.depthBuffer.setTest(depthTest);
  }
  setDepthWrite(depthWrite: boolean): void {
    this.depthBuffer.setMask(depthWrite);
  }
  setDepthFunc(depthFunc: number): void {
    this.depthBuffer.setFunc(depthFunc);
  }
  setStencilTest(stencilTest: number): void {
    this.stencilBuffer.setTest(stencilTest);
  }
  setStencilWrite(stencilWrite: number): void {
    this.stencilBuffer.setMask(stencilWrite);
  }
  setStencilFunc(stencilFunc: number, stencilRef: number, stencilMask: number): void {
    this.stencilBuffer.setFunc(stencilFunc, stencilRef, stencilMask);
  }
  setStencilOp(stencilFail: number, stencilZFail: number, stencilZPass: number): void {
    this.stencilBuffer.setOp(stencilFail, stencilZFail, stencilZPass);
  }
  //
  setFlipSided(flipSided: boolean): void {
    const gl = this.gl;
    if (this.currentFlipSided !== flipSided) {
      if (flipSided) {
        gl.frontFace(gl.CW);
      } else {
        gl.frontFace(gl.CCW);
      }
      this.currentFlipSided = flipSided;
    }
  }
  setCullFace(cullFace: CullFace): void {
    const gl = this.gl;
    if (cullFace !== CullFace.None) {
      gl.enable(gl.CULL_FACE);
      if (cullFace !== this.currentCullFace) {
        if (cullFace === CullFace.Back) {
          gl.cullFace(gl.BACK);
        } else if (cullFace === CullFace.Front) {
          gl.cullFace(gl.FRONT);
        } else {
          gl.cullFace(gl.FRONT_AND_BACK);
        }
      }
    } else {
      this.disable(gl.CULL_FACE);
    }
    this.currentCullFace = cullFace;
  }
  setLineWidth(width: number): void {
    const gl = this.gl;
    if (width !== this.currentLineWidth) {
      gl.lineWidth(width);
      this.currentLineWidth = width;
    }
  }
  setPolygonOffset(polygonOffset: boolean, factor: number, units: number): void {
    const gl = this.gl;
    if (polygonOffset) {
      this.enable(gl.POLYGON_OFFSET_FILL);
      if (this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units) {
        gl.polygonOffset(factor, units);
        this.currentPolygonOffsetFactor = factor;
        this.currentPolygonOffsetUnits = units;
      }
    } else {
      this.disable(gl.POLYGON_OFFSET_FILL);
    }
  }
  getScissorTest(): number {
    return this.currentScissorTest;
  }
  setScissorTest(scissorTest: boolean): void {
    const gl = this.gl;
    this.currentScissorTest = scissorTest;
    if (scissorTest) {
      this.enable(gl.SCISSOR_TEST);
    } else {
      this.disable(gl.SCISSOR_TEST);
    }
  }
  // texture
  activeTexture(webglSlot?: number): void {
    const gl = this.gl;
    if (webglSlot === undefined) webglSlot = gl.TEXTURE0 + this.maxTextures - 1;
    if (this.currentTextureSlot !== webglSlot) {
      gl.activeTexture(webglSlot);
      this.currentTextureSlot = webglSlot;
    }
  }
  bindTexture(webglType: number, webglTexture: number): void {
    const gl = this.gl;
    if (this.currentTextureSlot === null) {
      this.activeTexture();
    }
    let boundTexture = this.currentBoundTextures[this.currentTextureSlot];
    if (boundTexture === undefined) {
      boundTexture = { type: undefined, texture: undefined };
      this.currentBoundTextures[this.currentTextureSlot] = boundTexture;
    }
    if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {
      gl.bindTexture(webglType, webglTexture || this.emptyTextures[webglType]);
      boundTexture.type = webglType;
      boundTexture.texture = webglTexture;
    }
  }
  compressedTexImage2D(): void {
    const gl = this.gl;
    try {
      gl.compressedTexImage2D.apply(gl, arguments);
    } catch (error) {
      console.error(error);
    }
  }
  texImage2D(): void {
    const gl = this.gl;
    try {
      gl.texImage2D.apply(gl, arguments);
    } catch (error) {
      console.error(error);
    }
  }
  // TODO Deprecate
  clearColor(r: number, g: number, b: number, a: number): void {
    this.colorBuffer.setClear(r, g, b, a);
  }
  clearDepth(depth: number): void {
    this.depthBuffer.setClear(depth);
  }
  clearStencil(stencil: number): void {
    this.stencilBuffer.setClear(stencil);
  }
  //
  scissor(scissor: Vector4): void {
    const gl = this.gl;
    if (this.currentScissor.equals(scissor) === false) {
      gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
      this.currentScissor.copy(scissor);
    }
  }
  viewport(viewport: Vector4): void {
    const gl = this.gl;
    if (this.currentViewport.equals(viewport) === false) {
      gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
      this.currentViewport.copy(viewport);
    }
  }
  //
  reset(): void {
    const gl = this.gl;
    for (let i = 0; i < this.enabledAttributes.length; i ++) {
      if (this.enabledAttributes[i] === 1) {
        gl.disableVertexAttribArray(i);
        this.enabledAttributes[i] = 0;
      }
    }
    this.capabilities = {};
    this.compressedTextureFormats = null;
    this.currentTextureSlot = null;
    this.currentBoundTextures = {};
    this.currentBlending = null;
    this.currentFlipSided = null;
    this.currentCullFace = null;
    this.colorBuffer.reset();
    this.depthBuffer.reset();
    this.stencilBuffer.reset();
  }
}
