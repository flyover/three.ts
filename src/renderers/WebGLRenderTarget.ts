/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 * @author Marius Kintel / https://github.com/kintel
 */
import { EventDispatcher } from "../core/EventDispatcher";
import { Texture } from "../textures/Texture";
import { TextureFilter } from "../constants";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { _Math } from "../math/Math";
export class WebGLRenderTarget extends EventDispatcher {
  uuid: string;
  width: number;
  height: number;
  scissor: Vector4;
  scissorTest: boolean;
  viewport: Vector4;
  texture: Texture;
  depthBuffer: boolean;
  stencilBuffer: boolean;
  depthTexture: Texture;
  readonly isWebGLRenderTarget: boolean = true;
  /*
   In options, we can specify:
   * Texture parameters for an auto-generated target texture
   * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
  */
  constructor(width: number, height: number, options?: any) {
    super();
    this.uuid = _Math.generateUUID();
    this.width = width;
    this.height = height;
    this.scissor = new Vector4(0, 0, width, height);
    this.scissorTest = false;
    this.viewport = new Vector4(0, 0, width, height);
    options = options || {};
    if (options.minFilter === undefined) options.minFilter = TextureFilter.Linear;
    this.texture = new Texture(undefined, undefined, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.encoding);
    this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
    this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;
    this.depthTexture = options.depthTexture !== undefined ? options.depthTexture : null;
  }
  setSize(width: number, height: number): void {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.dispose();
    }
    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  copy(source: this): this {
    this.width = source.width;
    this.height = source.height;
    this.viewport.copy(source.viewport);
    this.texture = source.texture.clone();
    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;
    this.depthTexture = source.depthTexture;
    return this;
  }
  dispose(): void {
    this.dispatchEvent({ type: 'dispose' });
  }
  get wrapS(): number {
    console.warn("THREE.WebGLRenderTarget .wrapS is now .texture.wrapS.");
    return this.texture.wrapS;
  }
  set wrapS(value: number) {
    console.warn("THREE.WebGLRenderTarget .wrapS is now .texture.wrapS.");
    this.texture.wrapS = value;
  }
  get wrapT(): number {
    console.warn("THREE.WebGLRenderTarget .wrapT is now .texture.wrapT.");
    return this.texture.wrapT;
  }
  set wrapT(value: number) {
    console.warn("THREE.WebGLRenderTarget .wrapT is now .texture.wrapT.");
    this.texture.wrapT = value;
  }
  get magFilter(): number {
    console.warn("THREE.WebGLRenderTarget .magFilter is now .texture.magFilter.");
    return this.texture.magFilter;
  }
  set magFilter(value: number) {
    console.warn("THREE.WebGLRenderTarget .magFilter is now .texture.magFilter.");
    this.texture.magFilter = value;
  }
  get minFilter(): number {
    console.warn("THREE.WebGLRenderTarget .minFilter is now .texture.minFilter.");
    return this.texture.minFilter;
  }
  set minFilter(value: number) {
    console.warn("THREE.WebGLRenderTarget .minFilter is now .texture.minFilter.");
    this.texture.minFilter = value;
  }
  get anisotropy(): number {
    console.warn("THREE.WebGLRenderTarget .anisotropy is now .texture.anisotropy.");
    return this.texture.anisotropy;
  }
  set anisotropy(value: number) {
    console.warn("THREE.WebGLRenderTarget .anisotropy is now .texture.anisotropy.");
    this.texture.anisotropy = value;
  }
  get offset(): Vector2 {
    console.warn("THREE.WebGLRenderTarget .offset is now .texture.offset.");
    return this.texture.offset;
  }
  set offset(value: Vector2) {
    console.warn("THREE.WebGLRenderTarget .offset is now .texture.offset.");
    this.texture.offset = value;
  }
  get repeat(): Vector2 {
    console.warn("THREE.WebGLRenderTarget .repeat is now .texture.repeat.");
    return this.texture.repeat;
  }
  set repeat(value: Vector2) {
    console.warn("THREE.WebGLRenderTarget .repeat is now .texture.repeat.");
    this.texture.repeat = value;
  }
  get format(): number {
    console.warn("THREE.WebGLRenderTarget .format is now .texture.format.");
    return this.texture.format;
  }
  set format(value: number) {
    console.warn("THREE.WebGLRenderTarget .format is now .texture.format.");
    this.texture.format = value;
  }
  get type(): number {
    console.warn("THREE.WebGLRenderTarget .type is now .texture.type.");
    return this.texture.type;
  }
  set type(value: number) {
    console.warn("THREE.WebGLRenderTarget .type is now .texture.type.");
    this.texture.type = value;
  }
  get generateMipmaps(): boolean {
    console.warn("THREE.WebGLRenderTarget .generateMipmaps is now .texture.generateMipmaps.");
    return this.texture.generateMipmaps;
  }
  set generateMipmaps(value: boolean) {
    console.warn("THREE.WebGLRenderTarget .generateMipmaps is now .texture.generateMipmaps.");
    this.texture.generateMipmaps = value;
  }
}
