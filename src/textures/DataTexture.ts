import { Texture } from "./Texture";
import { TextureMapping, TextureWrapping, TextureEncoding, TextureType, TextureFormat, TextureFilter } from "../constants";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class DataTexture extends Texture {
  readonly isDataTexture: boolean = true;
  constructor(data?: any, width?: number, height?: number, format?: TextureFormat, type?: TextureType, mapping?: TextureMapping, wrapS?: TextureWrapping, wrapT?: TextureWrapping, magFilter: TextureFilter = TextureFilter.Nearest, minFilter: TextureFilter = TextureFilter.Nearest, anisotropy?: number, encoding?: TextureEncoding) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
    this.image = { data: data, width: width, height: height };
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.generateMipmaps  = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }
}
