import { Texture } from "./Texture";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class VideoTexture extends Texture {
  constructor(video: HTMLVideoElement, mapping: number, wrapS: number, wrapT: number, magFilter: number, minFilter: number, format: number, type: number, anisotropy: number) {
    super(video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
    this.generateMipmaps = false;
    const scope: VideoTexture = this;
    function update(): void {
      requestAnimationFrame(update);
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        scope.needsUpdate = true;
      }
    }
    update();
  }
}
