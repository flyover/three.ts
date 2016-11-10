import { InterleavedBuffer } from "./InterleavedBuffer";
/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */
export class InstancedInterleavedBuffer extends InterleavedBuffer {
  meshPerAttribute: number;
  readonly isInstancedInterleavedBuffer: boolean = true;
  constructor(array: any, stride: number, meshPerAttribute: number = 1) {
    super(array, stride);
    this.meshPerAttribute = meshPerAttribute;
  }
  copy(source: this): this {
    super.copy(source);
    this.meshPerAttribute = source.meshPerAttribute;
    return this;
  }
}
