import { Color } from "../math/Color";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
export class FogExp2 {
  name: string = '';
  color: Color;
  density: number;
  readonly isFogExp2: boolean = true;
  constructor(color: number, density: number = 0.00025) {
    this.color = new Color(color);
    this.density = density;
  }
  clone(): this {
    return new (this.constructor as any)(this.color.getHex(), this.density);
  }
  toJSON(meta: any): any {
    return {
      type: 'FogExp2',
      color: this.color.getHex(),
      density: this.density
    };
  }
}
