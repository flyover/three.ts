import { PolyhedronBufferGeometry } from "./PolyhedronBufferGeometry";
/**
 * @author Mugen87 / https://github.com/Mugen87
 */
export class TetrahedronBufferGeometry extends PolyhedronBufferGeometry {
  constructor(radius, detail) {
    let vertices = [
      1,  1,  1,   - 1, - 1,  1,   - 1,  1, - 1,    1, - 1, - 1
    ];
    let indices = [
      2,  1,  0,    0,  3,  2,    1,  3,  0,    2,  3,  1
    ];
    super(vertices, indices, radius, detail);
    this.type = 'TetrahedronBufferGeometry';
    this.parameters = {
      radius: radius,
      detail: detail
    };
  }
}
