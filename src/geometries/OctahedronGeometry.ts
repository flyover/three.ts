import { Geometry } from "../core/Geometry";
import { OctahedronBufferGeometry } from "./OctahedronBufferGeometry";
/**
 * @author timothypratley / https://github.com/timothypratley
 */
export class OctahedronGeometry extends Geometry {
  constructor(radius: number, detail: number) {
    super();
    this.type = 'OctahedronGeometry';
    this.parameters = {
      radius: radius,
      detail: detail
    };
    this.fromBufferGeometry(new OctahedronBufferGeometry(radius, detail));
    this.mergeVertices();
  }
}
