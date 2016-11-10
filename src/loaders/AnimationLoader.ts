import { AnimationClip } from "../animation/AnimationClip";
import { XHRLoader } from "./XHRLoader";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author bhouston / http://clara.io/
 */
export class AnimationLoader {
  manager: LoadingManager;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad: (animations: any[]) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void {
    const scope: AnimationLoader = this;
    const loader: XHRLoader = new XHRLoader(scope.manager);
    loader.load(url, function(text: string): void {
      onLoad(scope.parse(JSON.parse(text)));
    }, onProgress, onError);
  }
  parse(json: any/*, onLoad: (animations: any[]) => void*/): any[] {
    const animations: any[] = [];
    for (let i = 0; i < json.length; i ++) {
      const clip: any = AnimationClip.parse(json[i]);
      animations.push(clip);
    }
    //onLoad(animations);
    return animations;
  }
}
