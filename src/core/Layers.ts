/**
 * @author mrdoob / http://mrdoob.com/
 */
export class Layers {
  mask: number = 1;
  set(channel: number): void {
    this.mask = 1 << channel;
  }
  enable(channel: number): void {
    this.mask |= 1 << channel;
  }
  toggle(channel: number): void {
    this.mask ^= 1 << channel;
  }
  disable(channel: number): void {
    this.mask &= ~ (1 << channel);
  }
  test(layers: Layers): boolean {
    return (this.mask & layers.mask) !== 0;
  }
}
