import { Geometry } from "../core/Geometry";
import { DodecahedronBufferGeometry } from "./DodecahedronBufferGeometry";
/**
 * @author Abe Pazos / https://hamoid.com
 */
export class DodecahedronGeometry extends Geometry {
  constructor(radius: number, detail: number) {
    super();
    this.type = 'DodecahedronGeometry';
    this.parameters = {
      radius: radius,
      detail: detail
    };
    this.fromBufferGeometry(new DodecahedronBufferGeometry(radius, detail));
    this.mergeVertices();
  }
}
