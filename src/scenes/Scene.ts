import { Object3D } from "../core/Object3D";
import { Color } from "../math/Color";
import { Texture } from "../textures/Texture";
import { CubeTexture } from "../textures/CubeTexture";
import { Fog } from "./Fog";
import { FogExp2 } from "./FogExp2";
import { Material } from "../materials/Material";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class Scene extends Object3D {
  background: Color | Texture | CubeTexture = null;
  fog: Fog | FogExp2 = null;
  overrideMaterial: Material = null;
  autoUpdate: boolean = true; // checked by the renderer
  constructor() {
    super();
    this.type = 'Scene';
  }
  copy(source: this, recursive: boolean): this {
    super.copy(source, recursive);
    if (source.background !== null) this.background = source.background.clone();
    if (source.fog !== null) this.fog = source.fog.clone();
    if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();
    this.autoUpdate = source.autoUpdate;
    this.matrixAutoUpdate = source.matrixAutoUpdate;
    return this;
  }
  toJSON(meta: any): any {
    let data = super.toJSON(meta);
    if (this.background !== null) data.object.background = this.background.toJSON(meta);
    if (this.fog !== null) data.object.fog = this.fog.toJSON(meta);
    return data;
  }
}
