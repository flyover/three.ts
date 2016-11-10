import { BufferGeometry } from "../core/BufferGeometry";
import { BufferAttribute } from "../core/BufferAttribute";
import { Geometry } from "../core/Geometry";
import { _Math } from "../math/Math";
/**
 * @author WestLangley / http://github.com/WestLangley
 */
export class EdgesGeometry extends BufferGeometry {
  constructor(geometry: Geometry | BufferGeometry, thresholdAngle: number = 1) {
    super();
    const thresholdDot = Math.cos(_Math.DEG2RAD * thresholdAngle);
    const edge = [0, 0], hash = {};
    function sortFunction(a: number, b: number): number {
      return a - b;
    }
    const keys = ['a', 'b', 'c'];
    let geometry2: Geometry;
    if ((geometry && geometry instanceof BufferGeometry)) {
      geometry2 = new Geometry();
      geometry2.fromBufferGeometry(geometry);
    } else if (geometry && geometry instanceof Geometry) {
      geometry2 = geometry.clone();
    }
    geometry2.mergeVertices();
    geometry2.computeFaceNormals();
    const vertices = geometry2.vertices;
    const faces = geometry2.faces;
    for (let i = 0, l = faces.length; i < l; i ++) {
      const face = faces[i];
      for (let j = 0; j < 3; j ++) {
        edge[0] = face[keys[j]];
        edge[1] = face[keys[(j + 1) % 3]];
        edge.sort(sortFunction);
        const key = edge.toString();
        if (hash[key] === undefined) {
          hash[key] = { vert1: edge[0], vert2: edge[1], face1: i, face2: undefined };
        } else {
          hash[key].face2 = i;
        }
      }
    }
    const coords = [];
    for (let key in hash) {
      const h = hash[key];
      if (h.face2 === undefined || faces[h.face1].normal.dot(faces[h.face2].normal) <= thresholdDot) {
        const vertex1 = vertices[h.vert1];
        coords.push(vertex1.x);
        coords.push(vertex1.y);
        coords.push(vertex1.z);
        const vertex2 = vertices[h.vert2];
        coords.push(vertex2.x);
        coords.push(vertex2.y);
        coords.push(vertex2.z);
      }
    }
    this.addAttribute('position', new BufferAttribute(new Float32Array(coords), 3));
  }
}
