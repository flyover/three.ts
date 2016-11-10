import { Geometry } from "../core/Geometry";
import { TetrahedronBufferGeometry } from "./TetrahedronBufferGeometry";
/**
 * @author timothypratley / https://github.com/timothypratley
 */
export class TetrahedronGeometry extends Geometry {
  constructor(radius: number, detail: number) {
    super();
    this.type = 'TetrahedronGeometry';
    this.parameters = {
      radius: radius,
      detail: detail
    };
    this.fromBufferGeometry(new TetrahedronBufferGeometry(radius, detail));
    this.mergeVertices();
  }
}
