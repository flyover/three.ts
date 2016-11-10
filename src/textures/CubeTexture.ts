import { Texture } from "./Texture";
import { TextureMapping, TextureWrapping, TextureEncoding, TextureType, TextureFormat, TextureFilter } from "../constants";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class CubeTexture extends Texture {
  readonly isCubeTexture: boolean = true;
  constructor(images: any[] = [], mapping: TextureMapping = TextureMapping.CubeReflection, wrapS?: TextureWrapping, wrapT?: TextureWrapping, magFilter?: TextureFilter, minFilter?: TextureFilter, format?: TextureFormat, type?: TextureType, anisotropy?: number, encoding?: TextureEncoding) {
    super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
    this.flipY = false;
  }
  get images(): any[] { return this.image; }
  set images(value: any[]) { this.image = value; }
}
