import { Object3D } from "../../core/Object3D";
import { Material } from "../../materials/Material";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class ImmediateRenderObject extends Object3D {
  readonly isImmediateRenderObject: boolean = true;
  constructor(material: Material) {
    super();
    this.material = material;
  }
  render(renderCallback: any) {
  }
}
