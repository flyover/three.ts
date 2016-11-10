import { Geometry } from "../core/Geometry";
import { IcosahedronBufferGeometry } from "./IcosahedronBufferGeometry";
/**
 * @author timothypratley / https://github.com/timothypratley
 */
export class IcosahedronGeometry extends Geometry {
  constructor(radius: number, detail: number) {
    super();
    this.type = 'IcosahedronGeometry';
    this.parameters = {
      radius: radius,
      detail: detail
    };
    this.fromBufferGeometry(new IcosahedronBufferGeometry(radius, detail));
    this.mergeVertices();
  }
}
