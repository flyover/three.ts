import { BufferGeometry } from "./BufferGeometry";
/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */
export class InstancedBufferGeometry extends BufferGeometry {
  type: string = 'InstancedBufferGeometry';
  maxInstancedCount: number = undefined;
  readonly isInstancedBufferGeometry: boolean = true;
  constructor() {
    super();
  }
  addGroup(start: number, count: number, materialIndex: number): void {
    this.groups.push({
      start: start,
      count: count,
      materialIndex: materialIndex
    });
  }
  copy(source: this): this {
    const index = source.index;
    if (index !== null) {
      this.setIndex(index.clone());
    }
    const attributes = source.attributes;
    for (let name in attributes) {
      const attribute = attributes[name];
      if (attribute === undefined) continue;
      this.addAttribute(name, attribute.clone());
    }
    const groups = source.groups;
    for (let i = 0, l = groups.length; i < l; i ++) {
      const group = groups[i];
      this.addGroup(group.start, group.count, group.materialIndex);
    }
    return this;
  }
}
