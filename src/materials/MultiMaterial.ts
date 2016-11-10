import { _Math } from "../math/Math";
import { Material } from "./Material";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class MultiMaterial {
  uuid: string = _Math.generateUUID();
  type: string = 'MultiMaterial';
  materials: Material[];
  visible: boolean = true;
  // {
  side;
  opacity;
  transparent;
  color;
  map;
  id;
  program;
  // }
  dispose(): void {}
  readonly isMultiMaterial: boolean = true;
  constructor(materials: Material[] = []) {
    this.materials = materials;
  }
  toJSON(meta: any): any {
    const output: any = {
      metadata: {
        version: 4.2,
        type: 'material',
        generator: 'MaterialExporter'
      },
      uuid: this.uuid,
      type: this.type,
      materials: []
    };
    const materials = this.materials;
    for (let i = 0, l = materials.length; i < l; i ++) {
      const material = materials[i].toJSON(meta);
      delete material.metadata;
      output.materials.push(material);
    }
    output.visible = this.visible;
    return output;
  }
  clone(): this {
    const material = new (this.constructor as any)();
    for (let i = 0; i < this.materials.length; i ++) {
      material.materials.push(this.materials[i].clone());
    }
    material.visible = this.visible;
    return material;
  }
}
