import { LineSegments } from "../../objects/LineSegments";
import { ColorsMode } from "../../constants";
import { LineBasicMaterial } from "../../materials/LineBasicMaterial";
import { BufferAttribute } from "../../core/BufferAttribute";
import { BufferGeometry } from "../../core/BufferGeometry";
/**
 * @author sroucheray / http://sroucheray.org/
 * @author mrdoob / http://mrdoob.com/
 */
export class AxisHelper extends LineSegments {
  constructor(size: number = 1) {
    const vertices = new Float32Array([
      0, 0, 0,  size, 0, 0,
      0, 0, 0,  0, size, 0,
      0, 0, 0,  0, 0, size
    ]);
    const colors = new Float32Array([
      1, 0, 0,  1, 0.6, 0,
      0, 1, 0,  0.6, 1, 0,
      0, 0, 1,  0, 0.6, 1
    ]);
    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(vertices, 3));
    geometry.addAttribute('color', new BufferAttribute(colors, 3));
    const material = new LineBasicMaterial({ vertexColors: ColorsMode.Vertex });
    super(geometry, material);
  }
}
