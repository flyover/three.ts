import { LineSegments } from "../../objects/LineSegments";
import { ColorsMode } from "../../constants";
import { LineBasicMaterial } from "../../materials/LineBasicMaterial";
import { Float32Attribute } from "../../core/BufferAttribute";
import { BufferGeometry } from "../../core/BufferGeometry";
import { Color } from "../../math/Color";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class GridHelper extends LineSegments {
  constructor(size: number, divisions = 1, color1 = 0x444444, color2 = 0x888888) {
    const _color1 = new Color(color1);
    const _color2 = new Color(color2);
    let center = divisions / 2;
    let step = (size * 2) / divisions;
    let vertices = [], colors: number[] = [];
    for (let i = 0, j = 0, k = - size; i <= divisions; i ++, k += step) {
      vertices.push(- size, 0, k, size, 0, k);
      vertices.push(k, 0, - size, k, 0, size);
      let color = i === center ? _color1 : _color2;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
      color.toArray(colors, j); j += 3;
    }
    let geometry = new BufferGeometry();
    geometry.addAttribute('position', Float32Attribute(vertices, 3));
    geometry.addAttribute('color', Float32Attribute(colors, 3));
    let material = new LineBasicMaterial({ vertexColors: ColorsMode.Vertex });
    super(geometry, material);
  }
  setColors() {
    console.error('THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.');
  }
}
