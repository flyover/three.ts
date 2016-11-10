import { XHRLoader } from "./XHRLoader";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class ImageLoader {
  manager: LoadingManager;
  path: string;
  crossOrigin: string;
  withCredentials: boolean;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad: (image: HTMLImageElement) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): HTMLImageElement {
    const scope: ImageLoader = this;
    const image: HTMLImageElement = <HTMLImageElement> document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
    image.onload = function(event: UIEvent): void {
      image.onload = null;
      URL.revokeObjectURL(image.src);
      if (onLoad) onLoad(image);
      scope.manager.itemEnd(url);
    };
    image.onerror = onError;
    if (url.indexOf('data:') === 0) {
      image.src = url;
    } else {
      const loader: XHRLoader = new XHRLoader();
      loader.setPath(this.path);
      loader.setResponseType('blob');
      loader.setWithCredentials(this.withCredentials);
      loader.load(url, function(blob: Blob): void {
        image.src = URL.createObjectURL(blob);
      }, onProgress, onError);
    }
    scope.manager.itemStart(url);
    return image;
  }
  setCrossOrigin(value: string): ImageLoader {
    this.crossOrigin = value;
    return this;
  }
  setWithCredentials(value: boolean): ImageLoader {
    this.withCredentials = value;
    return this;
  }
  setPath(value: string): ImageLoader {
    this.path = value;
    return this;
  }
}
