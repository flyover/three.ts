import { Texture } from "./Texture";
import { TextureMapping, TextureWrapping, TextureEncoding, TextureType, TextureFormat, TextureFilter } from "../constants";
/**
 * @author Matt DesLauriers / @mattdesl
 * @author atix / arthursilber.de
 */
export class DepthTexture extends Texture {
  readonly isDepthTexture: boolean = true;
  constructor(width: number, height: number, type: number = TextureType.UnsignedShort, mapping: TextureMapping, wrapS: TextureWrapping, wrapT: TextureWrapping, magFilter: TextureFilter = TextureFilter.Nearest, minFilter: TextureFilter = TextureFilter.Nearest, anisotropy: number, format: TextureFormat = TextureFormat.Depth) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
    if (format !== TextureFormat.Depth && format !== TextureFormat.DepthStencil) {
      throw new Error('DepthTexture format must be either THREE.TextureFormat.Depth or THREE.TextureFormat.DepthStencil');
    }
    this.image = { width: width, height: height };
    this.type = type;
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.flipY = false;
    this.generateMipmaps  = false;
  }
}
