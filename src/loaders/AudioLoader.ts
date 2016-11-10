import { getAudioContext } from "../audio/AudioContext";
import { XHRLoader } from "./XHRLoader";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */
export class AudioLoader {
  manager: LoadingManager;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad: (audioBuffer: AudioBuffer) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void {
    const loader: XHRLoader = new XHRLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, function(buffer: ArrayBuffer): void {
      const context: AudioContext = getAudioContext();
      context.decodeAudioData(buffer, function(audioBuffer: AudioBuffer): void {
        onLoad(audioBuffer);
      });
    }, onProgress, onError);
  }
}
