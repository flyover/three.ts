import { TextureFilter, TextureWrapping } from "../constants";
import { XHRLoader } from "./XHRLoader";
import { DataTexture } from "../textures/DataTexture";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author Nikos M. / https://github.com/foo123/
 *
 * Abstract Base class to load generic binary textures formats (rgbe, hdr, ...)
 */
export class BinaryTextureLoader {
  manager: LoadingManager;
  _parser: (buffer: ArrayBuffer) => any;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
    // override in sub classes
    this._parser = null;
  }
  load(url: string, onLoad?: (texture: DataTexture, texData: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): DataTexture {
    const scope: BinaryTextureLoader = this;
    const texture: DataTexture = new DataTexture();
    const loader: XHRLoader = new XHRLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, function(buffer: ArrayBuffer): void {
      const texData: any = scope._parser(buffer);
      if (! texData) return;
      if (undefined !== texData.image) {
        texture.image = texData.image;
      } else if (undefined !== texData.data) {
        texture.image.width = texData.width;
        texture.image.height = texData.height;
        texture.image.data = texData.data;
      }
      texture.wrapS = undefined !== texData.wrapS ? texData.wrapS : TextureWrapping.ClampToEdge;
      texture.wrapT = undefined !== texData.wrapT ? texData.wrapT : TextureWrapping.ClampToEdge;
      texture.magFilter = undefined !== texData.magFilter ? texData.magFilter : TextureFilter.Linear;
      texture.minFilter = undefined !== texData.minFilter ? texData.minFilter : TextureFilter.LinearMipMapLinear;
      texture.anisotropy = undefined !== texData.anisotropy ? texData.anisotropy : 1;
      if (undefined !== texData.format) {
        texture.format = texData.format;
      }
      if (undefined !== texData.type) {
        texture.type = texData.type;
      }
      if (undefined !== texData.mipmaps) {
        texture.mipmaps = texData.mipmaps;
      }
      if (1 === texData.mipmapCount) {
        texture.minFilter = TextureFilter.Linear;
      }
      texture.needsUpdate = true;
      if (onLoad) onLoad(texture, texData);
    }, onProgress, onError);
    return texture;
  }
}
export const DataTextureLoader = BinaryTextureLoader;
