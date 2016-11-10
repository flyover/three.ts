import { Texture } from "./Texture";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class CompressedTexture extends Texture {
  readonly isCompressedTexture: boolean = true;
  constructor(mipmaps?: any[], width?: number, height?: number, format?: number, type?: number, mapping?: number, wrapS?: number, wrapT?: number, magFilter?: number, minFilter?: number, anisotropy?: number, encoding?: number) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
    this.image = { width: width, height: height };
    this.mipmaps = mipmaps;
    // no flipping for cube textures
    // (also flipping doesn't work for compressed textures)
    this.flipY = false;
    // can't generate mipmaps for compressed textures
    // mips must be embedded in DDS files
    this.generateMipmaps = false;
  }
}
