import { Texture } from './Texture';
import { NearestFilter, UnsignedShortType, DepthFormat, DepthStencilFormat } from '../constants';
/**
 * @author Matt DesLauriers / @mattdesl
 * @author atix / arthursilber.de
 */
export class DepthTexture extends Texture {
  readonly isDepthTexture: boolean = true;
  constructor(width: number, height: number, type: number = UnsignedShortType, mapping: number, wrapS: number, wrapT: number, magFilter: number = NearestFilter, minFilter: number = NearestFilter, anisotropy: number, format: number = DepthFormat) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);
    if (format !== DepthFormat && format !== DepthStencilFormat) {
      throw new Error('DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat');
    }
    this.image = { width: width, height: height };
    this.type = type;
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.flipY = false;
    this.generateMipmaps  = false;
  }
}
