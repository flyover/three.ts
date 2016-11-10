/**
 * @author mrdoob / http://mrdoob.com/
 */
import { TextureFormat, TextureType, TextureWrapping, TextureFilter } from "../../constants";
import { _Math } from "../../math/Math";
import { Texture } from "../../textures/Texture";
import { DepthTexture } from "../../textures/DepthTexture";
import { DataTexture } from "../../textures/DataTexture";
import { CompressedTexture } from "../../textures/CompressedTexture";
import { WebGLRenderTargetCube } from "../WebGLRenderTargetCube";
export class WebGLTextures {
  _gl: any;
  _infoMemory: any;
  _isWebGL2: any;
  extensions: any;
  state: any;
  properties: any;
  capabilities: any;
  paramThreeToGL: any;
  info: any;
  constructor(_gl: any, extensions: any, state: any, properties: any, capabilities: any, paramThreeToGL: any, info: any) {
    this._gl = _gl;
    this.extensions = extensions;
    this.state = state;
    this.properties = properties;
    this.capabilities = capabilities;
    this.paramThreeToGL = paramThreeToGL;
    this.info = info;
    this._infoMemory = info.memory;
    this._isWebGL2 = (typeof WebGL2RenderingContext !== 'undefined' && _gl instanceof WebGL2RenderingContext);
  }
  //
  private static clampToMaxSize(image: any, maxSize: any) {
    if (image.width > maxSize || image.height > maxSize) {
      // Warning: Scaling through the canvas will only work with images that use
      // premultiplied alpha.
      const scale = maxSize / Math.max(image.width, image.height);
      const canvas = <HTMLCanvasElement> document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
      canvas.width = Math.floor(image.width * scale);
      canvas.height = Math.floor(image.height * scale);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
      console.warn('THREE.WebGLRenderer: image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
      return canvas;
    }
    return image;
  }
  private static isPowerOfTwo(image: any) {
    return _Math.isPowerOfTwo(image.width) && _Math.isPowerOfTwo(image.height);
  }
  private static makePowerOfTwo(image: any) {
    if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
      const canvas = <HTMLCanvasElement> document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
      canvas.width = _Math.nearestPowerOfTwo(image.width);
      canvas.height = _Math.nearestPowerOfTwo(image.height);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      console.warn('THREE.WebGLRenderer: image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
      return canvas;
    }
    return image;
  }
  private static textureNeedsPowerOfTwo(texture: Texture): boolean {
    if (texture.wrapS !== TextureWrapping.ClampToEdge || texture.wrapT !== TextureWrapping.ClampToEdge) return true;
    if (texture.minFilter !== TextureFilter.Nearest && texture.minFilter !== TextureFilter.Linear) return true;
    return false;
  }
  // Fallback filters for non-power-of-2 textures
  private filterFallback(f: number): GLenum {
    const _gl = this._gl;
    if (f === TextureFilter.Nearest || f === TextureFilter.NearestMipMapNearest || f === TextureFilter.NearestMipMapLinear) {
      return _gl.NEAREST;
    }
    return _gl.LINEAR;
  }
  //
  private onTextureDispose(event: any): void {
    const texture = event.target;
    texture.removeEventListener('dispose', this.onTextureDispose.bind(this));
    this.deallocateTexture(texture);
    this._infoMemory.textures --;
  }
  private onRenderTargetDispose(event: any): void {
    const renderTarget = event.target;
    renderTarget.removeEventListener('dispose', this.onRenderTargetDispose.bind(this));
    this.deallocateRenderTarget(renderTarget);
    this._infoMemory.textures --;
  }
  //
  private deallocateTexture(texture: Texture): void {
    const _gl = this._gl;
    const textureProperties = this.properties.get(texture);
    if (texture.image && textureProperties.__image__webglTextureCube) {
      // cube texture
      _gl.deleteTexture(textureProperties.__image__webglTextureCube);
    } else {
      // 2D texture
      if (textureProperties.__webglInit === undefined) return;
      _gl.deleteTexture(textureProperties.__webglTexture);
    }
    // remove all webgl this.properties
    this.properties.delete(texture);
  }
  private deallocateRenderTarget(renderTarget: any): void {
    const _gl = this._gl;
    const renderTargetProperties = this.properties.get(renderTarget);
    const textureProperties = this.properties.get(renderTarget.texture);
    if (! renderTarget) return;
    if (textureProperties.__webglTexture !== undefined) {
      _gl.deleteTexture(textureProperties.__webglTexture);
    }
    if (renderTarget.depthTexture) {
      renderTarget.depthTexture.dispose();
    }
    if ((renderTarget && renderTarget instanceof WebGLRenderTargetCube)) {
      for (let i = 0; i < 6; i ++) {
        _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
        if (renderTargetProperties.__webglDepthbuffer) _gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer[i]);
      }
    } else {
      _gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
      if (renderTargetProperties.__webglDepthbuffer) _gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer);
    }
    this.properties.delete(renderTarget.texture);
    this.properties.delete(renderTarget);
  }
  //
  setTexture2D(texture: Texture, slot: number): void {
    const _gl = this._gl;
    const textureProperties = this.properties.get(texture);
    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      const image = texture.image;
      if (image === undefined) {
        console.warn('THREE.WebGLRenderer: Texture marked for update but image is undefined', texture);
      } else if (image.complete === false) {
        console.warn('THREE.WebGLRenderer: Texture marked for update but image is incomplete', texture);
      } else {
        this.uploadTexture(textureProperties, texture, slot);
        return;
      }
    }
    this.state.activeTexture(_gl.TEXTURE0 + slot);
    this.state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture);
  }
  setTextureCube(texture: Texture, slot: number): void {
    const _gl = this._gl;
    const textureProperties = this.properties.get(texture);
    if (texture.image.length === 6) {
      if (texture.version > 0 && textureProperties.__version !== texture.version) {
        if (! textureProperties.__image__webglTextureCube) {
          texture.addEventListener('dispose', this.onTextureDispose.bind(this));
          textureProperties.__image__webglTextureCube = _gl.createTexture();
          this._infoMemory.textures ++;
        }
        this.state.activeTexture(_gl.TEXTURE0 + slot);
        this.state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);
        _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
        const isCompressed = (texture && texture instanceof CompressedTexture);
        const isDataTexture = (texture.image[0] && texture.image[0] instanceof DataTexture);
        const cubeImage = [];
        for (let i = 0; i < 6; i ++) {
          if (! isCompressed && ! isDataTexture) {
            cubeImage[i] = WebGLTextures.clampToMaxSize(texture.image[i], this.capabilities.maxCubemapSize);
          } else {
            cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];
          }
        }
        const image = cubeImage[0],
        isPowerOfTwoImage = WebGLTextures.isPowerOfTwo(image),
        glFormat = this.paramThreeToGL(texture.format),
        glType = this.paramThreeToGL(texture.type);
        this.setTextureParameters(_gl.TEXTURE_CUBE_MAP, texture, isPowerOfTwoImage);
        for (let i = 0; i < 6; i ++) {
          if (! isCompressed) {
            if (isDataTexture) {
              this.state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, cubeImage[i].width, cubeImage[i].height, 0, glFormat, glType, cubeImage[i].data);
            } else {
              this.state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[i]);
            }
          } else {
            let mipmap;
            const mipmaps = cubeImage[i].mipmaps;
            for (let j = 0, jl = mipmaps.length; j < jl; j ++) {
              mipmap = mipmaps[j];
              if (texture.format !== TextureFormat.RGBA && texture.format !== TextureFormat.RGB) {
                if (this.state.getCompressedTextureFormats().indexOf(glFormat) > - 1) {
                  this.state.compressedTexImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);
                } else {
                  console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");
                }
              } else {
                this.state.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
              }
            }
          }
        }
        if (texture.generateMipmaps && isPowerOfTwoImage) {
          _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);
        }
        textureProperties.__version = texture.version;
        if (texture.onUpdate) texture.onUpdate(texture);
      } else {
        this.state.activeTexture(_gl.TEXTURE0 + slot);
        this.state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);
      }
    }
  }
  setTextureCubeDynamic(texture: Texture, slot: number): void {
    const _gl = this._gl;
    this.state.activeTexture(_gl.TEXTURE0 + slot);
    this.state.bindTexture(_gl.TEXTURE_CUBE_MAP, this.properties.get(texture).__webglTexture);
  }
  private setTextureParameters(textureType: GLenum, texture: Texture, isPowerOfTwoImage: boolean): void {
    const _gl = this._gl;
    let extension;
    if (isPowerOfTwoImage) {
      _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, this.paramThreeToGL(texture.wrapS));
      _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, this.paramThreeToGL(texture.wrapT));
      _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, this.paramThreeToGL(texture.magFilter));
      _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, this.paramThreeToGL(texture.minFilter));
    } else {
      _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
      _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
      if (texture.wrapS !== TextureWrapping.ClampToEdge || texture.wrapT !== TextureWrapping.ClampToEdge) {
        console.warn('THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.TextureWrapping.ClampToEdge.', texture);
      }
      _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, this.filterFallback(texture.magFilter));
      _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, this.filterFallback(texture.minFilter));
      if (texture.minFilter !== TextureFilter.Nearest && texture.minFilter !== TextureFilter.Linear) {
        console.warn('THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.TextureFilter.Nearest or THREE.TextureFilter.Linear.', texture);
      }
    }
    extension = this.extensions.get('EXT_texture_filter_anisotropic');
    if (extension) {
      if (texture.type === TextureType.Float && this.extensions.get('OES_texture_float_linear') === null) return;
      if (texture.type === TextureType.HalfFloat && this.extensions.get('OES_texture_half_float_linear') === null) return;
      if (texture.anisotropy > 1 || this.properties.get(texture).__currentAnisotropy) {
        _gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, this.capabilities.getMaxAnisotropy()));
        this.properties.get(texture).__currentAnisotropy = texture.anisotropy;
      }
    }
  }
  private uploadTexture(textureProperties: any, texture: Texture, slot: number): void {
    const _gl = this._gl;
    if (textureProperties.__webglInit === undefined) {
      textureProperties.__webglInit = true;
      texture.addEventListener('dispose', this.onTextureDispose.bind(this));
      textureProperties.__webglTexture = _gl.createTexture();
      this._infoMemory.textures ++;
    }
    this.state.activeTexture(_gl.TEXTURE0 + slot);
    this.state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture);
    _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
    _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
    _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
    let image = WebGLTextures.clampToMaxSize(texture.image, this.capabilities.maxTextureSize);
    if (WebGLTextures.textureNeedsPowerOfTwo(texture) && WebGLTextures.isPowerOfTwo(image) === false) {
      image = WebGLTextures.makePowerOfTwo(image);
    }
    const isPowerOfTwoImage = WebGLTextures.isPowerOfTwo(image),
    glFormat = this.paramThreeToGL(texture.format),
    glType = this.paramThreeToGL(texture.type);
    this.setTextureParameters(_gl.TEXTURE_2D, texture, isPowerOfTwoImage);
    let mipmap;
    const mipmaps = texture.mipmaps;
    if ((texture && texture instanceof DepthTexture)) {
      // populate depth texture with dummy data
      let internalFormat = _gl.DEPTH_COMPONENT;
      if (texture.type === TextureType.Float) {
        if (!this._isWebGL2) throw new Error('Float Depth Texture only supported in WebGL2.0');
        internalFormat = _gl.DEPTH_COMPONENT32F;
      } else if (this._isWebGL2) {
        // WebGL 2.0 requires signed internalformat for glTexImage2D
        internalFormat = _gl.DEPTH_COMPONENT16;
      }
      // Depth stencil textures need the DEPTH_STENCIL internal format
      // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
      if (texture.format === TextureFormat.DepthStencil) {
        internalFormat = _gl.DEPTH_STENCIL;
      }
      this.state.texImage2D(_gl.TEXTURE_2D, 0, internalFormat, image.width, image.height, 0, glFormat, glType, null);
    } else if ((texture && texture instanceof DataTexture)) {
      // use manually created mipmaps if available
      // if there are no manual mipmaps
      // set 0 level mipmap and then use GL to generate other mipmap levels
      if (mipmaps.length > 0 && isPowerOfTwoImage) {
        for (let i = 0, il = mipmaps.length; i < il; i ++) {
          mipmap = mipmaps[i];
          this.state.texImage2D(_gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
        }
        texture.generateMipmaps = false;
      } else {
        this.state.texImage2D(_gl.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data);
      }
    } else if ((texture && texture instanceof CompressedTexture)) {
      for (let i = 0, il = mipmaps.length; i < il; i ++) {
        mipmap = mipmaps[i];
        if (texture.format !== TextureFormat.RGBA && texture.format !== TextureFormat.RGB) {
          if (this.state.getCompressedTextureFormats().indexOf(glFormat) > - 1) {
            this.state.compressedTexImage2D(_gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);
          } else {
            console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          }
        } else {
          this.state.texImage2D(_gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
        }
      }
    } else {
      // regular Texture (image, video, canvas)
      // use manually created mipmaps if available
      // if there are no manual mipmaps
      // set 0 level mipmap and then use GL to generate other mipmap levels
      if (mipmaps.length > 0 && isPowerOfTwoImage) {
        for (let i = 0, il = mipmaps.length; i < il; i ++) {
          mipmap = mipmaps[i];
          this.state.texImage2D(_gl.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap);
        }
        texture.generateMipmaps = false;
      } else {
        this.state.texImage2D(_gl.TEXTURE_2D, 0, glFormat, glFormat, glType, image);
      }
    }
    if (texture.generateMipmaps && isPowerOfTwoImage) _gl.generateMipmap(_gl.TEXTURE_2D);
    textureProperties.__version = texture.version;
    if (texture.onUpdate) texture.onUpdate(texture);
  }
  // Render targets
  // Setup storage for target texture and bind it to correct framebuffer
  private setupFrameBufferTexture(framebuffer: any, renderTarget: any, attachment: GLenum, textureTarget: GLenum): void {
    const _gl = this._gl;
    const glFormat = this.paramThreeToGL(renderTarget.texture.format);
    const glType = this.paramThreeToGL(renderTarget.texture.type);
    this.state.texImage2D(textureTarget, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);
    _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
    _gl.framebufferTexture2D(_gl.FRAMEBUFFER, attachment, textureTarget, this.properties.get(renderTarget.texture).__webglTexture, 0);
    _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
  }
  // Setup storage for internal depth/stencil buffers and bind to correct framebuffer
  private setupRenderBufferStorage(renderbuffer: any, renderTarget: any): void {
    const _gl = this._gl;
    _gl.bindRenderbuffer(_gl.RENDERBUFFER, renderbuffer);
    if (renderTarget.depthBuffer && ! renderTarget.stencilBuffer) {
      _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height);
      _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer);
    } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
      _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height);
      _gl.framebufferRenderbuffer(_gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer);
    } else {
      // FIXME: We don't support !depth !stencil
      _gl.renderbufferStorage(_gl.RENDERBUFFER, _gl.RGBA4, renderTarget.width, renderTarget.height);
    }
    _gl.bindRenderbuffer(_gl.RENDERBUFFER, null);
  }
  // Setup resources for a Depth Texture for a FBO (needs an extension)
  private setupDepthTexture(framebuffer: any, renderTarget: any): void {
    const _gl = this._gl;
    const isCube = ((renderTarget && renderTarget instanceof WebGLRenderTargetCube));
    if (isCube) throw new Error('Depth Texture with cube render targets is not supported!');
    _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
    if (!((renderTarget.depthTexture && renderTarget.depthTexture instanceof DepthTexture))) {
      throw new Error('renderTarget.depthTexture must be an instance of THREE.DepthTexture');
    }
    // upload an empty depth texture with framebuffer size
    if (!this.properties.get(renderTarget.depthTexture).__webglTexture ||
        renderTarget.depthTexture.image.width !== renderTarget.width ||
        renderTarget.depthTexture.image.height !== renderTarget.height) {
      renderTarget.depthTexture.image.width = renderTarget.width;
      renderTarget.depthTexture.image.height = renderTarget.height;
      renderTarget.depthTexture.needsUpdate = true;
    }
    this.setTexture2D(renderTarget.depthTexture, 0);
    const webglDepthTexture = this.properties.get(renderTarget.depthTexture).__webglTexture;
    if (renderTarget.depthTexture.format === TextureFormat.Depth) {
      _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0);
    } else if (renderTarget.depthTexture.format === TextureFormat.DepthStencil) {
      _gl.framebufferTexture2D(_gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.TEXTURE_2D, webglDepthTexture, 0);
    } else {
      throw new Error('Unknown depthTexture format');
    }
  }
  // Setup GL resources for a non-texture depth buffer
  private setupDepthRenderbuffer(renderTarget: any): void {
    const _gl = this._gl;
    const renderTargetProperties = this.properties.get(renderTarget);
    const isCube = ((renderTarget && renderTarget instanceof WebGLRenderTargetCube));
    if (renderTarget.depthTexture) {
      if (isCube) throw new Error('target.depthTexture not supported in Cube render targets');
      this.setupDepthTexture(renderTargetProperties.__webglFramebuffer, renderTarget);
    } else {
      if (isCube) {
        renderTargetProperties.__webglDepthbuffer = [];
        for (let i = 0; i < 6; i ++) {
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[i]);
          renderTargetProperties.__webglDepthbuffer[i] = _gl.createRenderbuffer();
          this.setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer[i], renderTarget);
        }
      } else {
        _gl.bindFramebuffer(_gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
        renderTargetProperties.__webglDepthbuffer = _gl.createRenderbuffer();
        this.setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer, renderTarget);
      }
    }
    _gl.bindFramebuffer(_gl.FRAMEBUFFER, null);
  }
  // Set up GL resources for the render target
  setupRenderTarget(renderTarget: any): void {
    const _gl = this._gl;
    const renderTargetProperties = this.properties.get(renderTarget);
    const textureProperties = this.properties.get(renderTarget.texture);
    renderTarget.addEventListener('dispose', this.onRenderTargetDispose.bind(this));
    textureProperties.__webglTexture = _gl.createTexture();
    this._infoMemory.textures ++;
    const isCube = ((renderTarget && renderTarget instanceof WebGLRenderTargetCube));
    const isTargetPowerOfTwo = WebGLTextures.isPowerOfTwo(renderTarget);
    // Setup framebuffer
    if (isCube) {
      renderTargetProperties.__webglFramebuffer = [];
      for (let i = 0; i < 6; i ++) {
        renderTargetProperties.__webglFramebuffer[i] = _gl.createFramebuffer();
      }
    } else {
      renderTargetProperties.__webglFramebuffer = _gl.createFramebuffer();
    }
    // Setup color buffer
    if (isCube) {
      this.state.bindTexture(_gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
      this.setTextureParameters(_gl.TEXTURE_CUBE_MAP, renderTarget.texture, isTargetPowerOfTwo);
      for (let i = 0; i < 6; i ++) {
        this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[i], renderTarget, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_CUBE_MAP_POSITIVE_X + i);
      }
      if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo) _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);
      this.state.bindTexture(_gl.TEXTURE_CUBE_MAP, null);
    } else {
      this.state.bindTexture(_gl.TEXTURE_2D, textureProperties.__webglTexture);
      this.setTextureParameters(_gl.TEXTURE_2D, renderTarget.texture, isTargetPowerOfTwo);
      this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, _gl.COLOR_ATTACHMENT0, _gl.TEXTURE_2D);
      if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo) _gl.generateMipmap(_gl.TEXTURE_2D);
      this.state.bindTexture(_gl.TEXTURE_2D, null);
    }
    // Setup depth and stencil buffers
    if (renderTarget.depthBuffer) {
      this.setupDepthRenderbuffer(renderTarget);
    }
  }
  updateRenderTargetMipmap(renderTarget: any): void {
    const _gl = this._gl;
    const texture = renderTarget.texture;
    if (texture.generateMipmaps && WebGLTextures.isPowerOfTwo(renderTarget) &&
        texture.minFilter !== TextureFilter.Nearest &&
        texture.minFilter !== TextureFilter.Linear) {
      const target = (renderTarget && renderTarget instanceof WebGLRenderTargetCube) ? _gl.TEXTURE_CUBE_MAP : _gl.TEXTURE_2D;
      const webglTexture = this.properties.get(texture).__webglTexture;
      this.state.bindTexture(target, webglTexture);
      _gl.generateMipmap(target);
      this.state.bindTexture(target, null);
    }
  }
}
