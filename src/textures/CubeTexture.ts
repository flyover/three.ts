import { Texture } from "./Texture";
import { CubeReflectionMapping } from "../constants";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class CubeTexture extends Texture {
  readonly isCubeTexture: boolean = true;
  constructor(images: any[] = [], mapping: number = CubeReflectionMapping, wrapS?: number, wrapT?: number, magFilter?: number, minFilter?: number, format?: number, type?: number, anisotropy?: number, encoding?: number) {
    super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);
    this.flipY = false;
  }
  get images(): any[] { return this.image; }
  set images(value: any[]) { this.image = value; }
}
