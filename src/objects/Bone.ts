import { Object3D } from "../core/Object3D";
import { SkinnedMesh } from "./SkinnedMesh";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */
export class Bone extends Object3D {
  skin: SkinnedMesh;
  readonly isBone: boolean = true;
  constructor(skin?: SkinnedMesh) {
    super();
    this.type = 'Bone';
    this.skin = skin;
  }
  copy(source: this): this {
    super.copy(source);
    this.skin = source.skin;
    return this;
  }
}
