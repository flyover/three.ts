import { Material, MaterialParameters } from "./Material";
import { Vector2 } from "../math/Vector2";
import { Color } from "../math/Color";
import { Texture } from "../textures/Texture";
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture(<Image>),
 *
 *  uvOffset: new THREE.Vector2(),
 *  uvScale: new THREE.Vector2()
 * }
 */
export interface SpriteMaterialParameters extends MaterialParameters {
  color?: number;
  opacity?: number;
  map?: Texture;

  uvOffset?: Vector2;
  uvScale?: Vector2;
}
export class SpriteMaterial extends Material {
  rotation: number;
  readonly isSpriteMaterial: boolean = true;
  constructor(parameters?: SpriteMaterialParameters) {
    super();
    this.type = 'SpriteMaterial';
    this.color = new Color(0xffffff);
    this.map = null;
    this.rotation = 0;
    this.fog = false;
    this.lights = false;
    this.setValues(parameters);
  }
  copy(source: this): this {
    super.copy(source);
    this.color.copy(source.color);
    this.map = source.map;
    this.rotation = source.rotation;
    return this;
  };
}
