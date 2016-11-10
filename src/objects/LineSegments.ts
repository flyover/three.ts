import { Line } from "./Line";
import { Geometry } from "../core/Geometry";
import { BufferGeometry } from "../core/BufferGeometry";
import { Material } from "../materials/Material";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class LineSegments extends Line {
  readonly isLineSegments: boolean = true;
  constructor(geometry: Geometry | BufferGeometry, material: Material) {
    super(geometry, material);
    this.type = 'LineSegments';
    this._step = 2; // Line:raycast step
  }
}
