import { ImageLoader } from "./ImageLoader";
import { CubeTexture } from "../textures/CubeTexture";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class CubeTextureLoader {
  manager: LoadingManager;
  path: string;
  crossOrigin: string;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(urls: string[], onLoad: (texture: CubeTexture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) {
    const texture: CubeTexture = new CubeTexture();
    const loader: ImageLoader = new ImageLoader(this.manager);
    loader.setCrossOrigin(this.crossOrigin);
    loader.setPath(this.path);
    let loaded: number = 0;
    function loadTexture(i: number): void {
      loader.load(urls[i], function(image: HTMLImageElement): void {
        texture.images[i] = image;
        loaded ++;
        if (loaded === 6) {
          texture.needsUpdate = true;
          if (onLoad) onLoad(texture);
        }
      }, undefined, onError);
    }
    for (let i = 0; i < urls.length; ++ i) {
      loadTexture(i);
    }
    return texture;
  }
  setCrossOrigin(value: string): CubeTextureLoader {
    this.crossOrigin = value;
    return this;
  }
  setPath(value: string): CubeTextureLoader {
    this.path = value;
    return this;
  }
}
