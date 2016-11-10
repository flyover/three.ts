import { Texture } from "./Texture";
import { TextureMapping, TextureWrapping, TextureEncoding, TextureType, TextureFormat, TextureFilter } from "../constants";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class CanvasTexture extends Texture {
  constructor(canvas: HTMLCanvasElement, mapping?: TextureMapping, wrapS?: TextureWrapping, wrapT?: TextureWrapping, magFilter?: TextureFilter, minFilter?: TextureFilter, format?: TextureFormat, type?: TextureType, anisotropy?: number) {
    super(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
    this.needsUpdate = true;
  }
}
