import { Font } from "../extras/core/Font";
import { XHRLoader } from "./XHRLoader";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class FontLoader {
  manager: LoadingManager;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad: (font: Font) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) {
    const scope: FontLoader = this;
    const loader: XHRLoader = new XHRLoader(this.manager);
    loader.load(url, function(text: string): void {
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn('THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.');
        json = JSON.parse(text.substring(65, text.length - 2));
      }
      const font: Font = scope.parse(json);
      if (onLoad) onLoad(font);
    }, onProgress, onError);
  }
  parse(json: any): Font {
    return new Font(json);
  }
}
