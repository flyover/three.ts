import { TextureFormat } from "../constants";
import { ImageLoader } from "./ImageLoader";
import { Texture } from "../textures/Texture";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class TextureLoader {
  manager: LoadingManager;
  path: string;
  crossOrigin: string;
  withCredentials: boolean;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad?: (texture: Texture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): Texture {
    const texture: Texture = new Texture();
    const loader: ImageLoader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setWithCredentials(this.withCredentials);
    loader.setPath(this.path);
    loader.load(url, function(image: HTMLImageElement): void {
      // JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
      const isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;
      texture.format = isJPEG ? TextureFormat.RGB : TextureFormat.RGBA;
      texture.image = image;
      texture.needsUpdate = true;
      if (onLoad !== undefined) {
        onLoad(texture);
      }
    }, onProgress, onError);
    return texture;
  }
  setCrossOrigin(value: string): TextureLoader {
    this.crossOrigin = value;
    return this;
  }
  setWithCredentials(value: boolean): TextureLoader {
    this.withCredentials = value;
    return this;
  }
  setPath(value: string): TextureLoader {
    this.path = value;
    return this;
  }
}
