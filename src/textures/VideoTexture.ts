import { Texture } from "./Texture";
import { TextureMapping, TextureWrapping, TextureEncoding, TextureType, TextureFormat, TextureFilter } from "../constants";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class VideoTexture extends Texture {
  constructor(video: HTMLVideoElement, mapping: TextureMapping, wrapS: TextureWrapping, wrapT: TextureWrapping, magFilter: TextureFilter, minFilter: TextureFilter, format: TextureFormat, type: TextureType, anisotropy: number) {
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
