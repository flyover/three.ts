import { BufferAttribute } from "./BufferAttribute";
/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */
export class InstancedBufferAttribute extends BufferAttribute {
  meshPerAttribute: number;
  readonly isInstancedBufferAttribute: boolean = true;
  constructor(array: any, itemSize: number, meshPerAttribute: number = 1) {
    super(array, itemSize);
    this.meshPerAttribute = meshPerAttribute;
  }
  copy(source: this): this {
    super.copy(source);
    this.meshPerAttribute = source.meshPerAttribute;
    return this;
  }
}
