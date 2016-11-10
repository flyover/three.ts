import { TextureFilter } from "../constants";
import { XHRLoader } from "./XHRLoader";
import { CompressedTexture } from "../textures/CompressedTexture";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 *
 * Abstract Base class to block based textures loader (dds, pvr, ...)
 */
export class CompressedTextureLoader {
  manager: LoadingManager;
  _parser: (buffer: ArrayBuffer, x: boolean) => any;
  path: string;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
    // override in sub classes
    this._parser = null;
  }
  load(url: string | string[], onLoad: (texture: CompressedTexture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): CompressedTexture {
    const scope: CompressedTextureLoader = this;
    const images: any[] = [];
    const texture: CompressedTexture = new CompressedTexture();
    texture.image = images;
    const loader: XHRLoader = new XHRLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    let loaded: number = 0;
    function loadTexture(i: number): void {
      loader.load(url[i], function(buffer: ArrayBuffer): void {
        const texDatas = scope._parser(buffer, true);
        images[i] = {
          width: texDatas.width,
          height: texDatas.height,
          format: texDatas.format,
          mipmaps: texDatas.mipmaps
        };
        loaded += 1;
        if (loaded === 6) {
          if (texDatas.mipmapCount === 1)
            texture.minFilter = TextureFilter.Linear;
          texture.format = texDatas.format;
          texture.needsUpdate = true;
          if (onLoad) onLoad(texture);
        }
      }, onProgress, onError);
    }
    if (Array.isArray(url)) {
      loaded = 0;
      for (let i = 0, il = url.length; i < il; ++ i) {
        loadTexture(i);
      }
    } else {
      // compressed cubemap texture stored in a single DDS file
      loader.load(url, function(buffer: ArrayBuffer): void {
        const texDatas = scope._parser(buffer, true);
        if (texDatas.isCubemap) {
          const faces = texDatas.mipmaps.length / texDatas.mipmapCount;
          for (let f = 0; f < faces; f ++) {
            images[f] = { mipmaps : [] };
            for (let i = 0; i < texDatas.mipmapCount; i ++) {
              images[f].mipmaps.push(texDatas.mipmaps[f * texDatas.mipmapCount + i]);
              images[f].format = texDatas.format;
              images[f].width = texDatas.width;
              images[f].height = texDatas.height;
            }
          }
        } else {
          texture.image.width = texDatas.width;
          texture.image.height = texDatas.height;
          texture.mipmaps = texDatas.mipmaps;
        }
        if (texDatas.mipmapCount === 1) {
          texture.minFilter = TextureFilter.Linear;
        }
        texture.format = texDatas.format;
        texture.needsUpdate = true;
        if (onLoad) onLoad(texture);
      }, onProgress, onError);
    }
    return texture;
  }
  setPath(value: string): CompressedTextureLoader {
    this.path = value;
    return this;
  }
}
