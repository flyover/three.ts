import { EventDispatcher } from "../core/EventDispatcher";
import { TextureMapping, TextureWrapping, TextureEncoding, TextureType, TextureFormat, TextureFilter } from "../constants";
import { _Math } from "../math/Math";
import { Vector2 } from "../math/Vector2";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */
export class Texture extends EventDispatcher {
  id: number = TextureIdCount();
  uuid: string = _Math.generateUUID();
  name: string = '';
  sourceFile: string = '';
  image: any;
  mipmaps: any[] = [];
  mapping: TextureMapping;
  wrapS: TextureWrapping;
  wrapT: TextureWrapping;
  magFilter: TextureFilter;
  minFilter: TextureFilter;
  anisotropy: number;
  format: TextureFormat;
  type: TextureType;
  offset: Vector2 = new Vector2(0, 0);
  repeat: Vector2 = new Vector2(1, 1);
  generateMipmaps: boolean = true;
  premultiplyAlpha: boolean = false;
  flipY: boolean = true;
  unpackAlignment: number = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
  // Values of encoding !== THREE.TextureEncoding.Linear only supported on map, envMap and emissiveMap.
  //
  // Also changing the encoding after already used by a Material will not automatically make the Material
  // update.  You need to explicitly call Material.needsUpdate to trigger it to recompile.
  encoding: TextureEncoding;
  version: number = 0;
  onUpdate: (texture: Texture) => void = null;
  readonly isTexture: boolean = true;
  static DEFAULT_IMAGE: any = undefined;
  static DEFAULT_MAPPING: TextureMapping = TextureMapping.UV;
  constructor(image: any = Texture.DEFAULT_IMAGE, mapping: TextureMapping = Texture.DEFAULT_MAPPING, wrapS: TextureWrapping = TextureWrapping.ClampToEdge, wrapT: TextureWrapping = TextureWrapping.ClampToEdge, magFilter: TextureFilter = TextureFilter.Linear, minFilter: TextureFilter = TextureFilter.LinearMipMapLinear, format: TextureFormat = TextureFormat.RGBA, type: TextureType = TextureType.UnsignedByte, anisotropy: number = 1, encoding: TextureEncoding = TextureEncoding.Linear) {
    super();
    this.image = image;
    this.mapping = mapping;
    this.wrapS = wrapS;
    this.wrapT = wrapT;
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.anisotropy = anisotropy;
    this.format = format;
    this.type = type;
    this.encoding = encoding;
  }
  set needsUpdate(value: boolean) {
    if (value === true) this.version ++;
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  copy(source: this): this {
    this.image = source.image;
    this.mipmaps = source.mipmaps.slice(0);
    this.mapping = source.mapping;
    this.wrapS = source.wrapS;
    this.wrapT = source.wrapT;
    this.magFilter = source.magFilter;
    this.minFilter = source.minFilter;
    this.anisotropy = source.anisotropy;
    this.format = source.format;
    this.type = source.type;
    this.offset.copy(source.offset);
    this.repeat.copy(source.repeat);
    this.generateMipmaps = source.generateMipmaps;
    this.premultiplyAlpha = source.premultiplyAlpha;
    this.flipY = source.flipY;
    this.unpackAlignment = source.unpackAlignment;
    this.encoding = source.encoding;
    return this;
  }
  toJSON(meta: any): any {
    if (meta.textures[ this.uuid ] !== undefined) {
      return meta.textures[ this.uuid ];
    }
    function getDataURL(image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement): string {
      let canvas: HTMLCanvasElement;
      if (image instanceof HTMLCanvasElement) {
        canvas = image;
      } else {
        canvas = <HTMLCanvasElement> document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
      }
      if (canvas.width > 2048 || canvas.height > 2048) {
        return canvas.toDataURL('image/jpeg', 0.6);
      } else {
        return canvas.toDataURL('image/png');
      }
    }
    const output: any = {
      metadata: {
        version: 4.4,
        type: 'Texture',
        generator: 'Texture.toJSON'
      },
      uuid: this.uuid,
      name: this.name,
      mapping: this.mapping,
      repeat: [ this.repeat.x, this.repeat.y ],
      offset: [ this.offset.x, this.offset.y ],
      wrap: [ this.wrapS, this.wrapT ],
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY
    };
    if (this.image !== undefined) {
      // TODO: Move to THREE.Image
      const image = this.image;
      if (image.uuid === undefined) {
        image.uuid = _Math.generateUUID(); // UGH
      }
      if (meta.images[ image.uuid ] === undefined) {
        meta.images[ image.uuid ] = {
          uuid: image.uuid,
          url: getDataURL(image)
        };
      }
      output.image = image.uuid;
    }
    meta.textures[ this.uuid ] = output;
    return output;
  }
  dispose(): void {
    this.dispatchEvent({ type: 'dispose' });
  }
  transformUv(uv: Vector2): void {
    if (this.mapping !== TextureMapping.UV)  return;
    uv.multiply(this.repeat);
    uv.add(this.offset);
    if (uv.x < 0 || uv.x > 1) {
      switch (this.wrapS) {
        case TextureWrapping.Repeat:
          uv.x = uv.x - Math.floor(uv.x);
          break;
        case TextureWrapping.ClampToEdge:
          uv.x = uv.x < 0 ? 0 : 1;
          break;
        case TextureWrapping.MirroredRepeat:
          if (Math.abs(Math.floor(uv.x) % 2) === 1) {
            uv.x = Math.ceil(uv.x) - uv.x;
          } else {
            uv.x = uv.x - Math.floor(uv.x);
          }
          break;
      }
    }
    if (uv.y < 0 || uv.y > 1) {
      switch (this.wrapT) {
        case TextureWrapping.Repeat:
          uv.y = uv.y - Math.floor(uv.y);
          break;
        case TextureWrapping.ClampToEdge:
          uv.y = uv.y < 0 ? 0 : 1;
          break;
        case TextureWrapping.MirroredRepeat:
          if (Math.abs(Math.floor(uv.y) % 2) === 1) {
            uv.y = Math.ceil(uv.y) - uv.y;
          } else {
            uv.y = uv.y - Math.floor(uv.y);
          }
          break;
      }
    }
    if (this.flipY) {
      uv.y = 1 - uv.y;
    }
  }
}
let count: number = 0;
export function TextureIdCount(): number { return count++; };
