import { BufferGeometry } from "../core/BufferGeometry";
import { BufferAttribute } from "../core/BufferAttribute";
import { Geometry } from "../core/Geometry";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class WireframeGeometry extends BufferGeometry {
  constructor(geometry: Geometry | BufferGeometry) {
    super();
    const edge = [ 0, 0 ], hash = {};
    function sortFunction(a: number, b: number): number {
      return a - b;
    }
    const keys = ['a', 'b', 'c'];
    if (geometry && geometry instanceof Geometry) {
      const vertices = geometry.vertices;
      const faces = geometry.faces;
      let numEdges = 0;
      // allocate maximal size
      const edges = new Uint32Array(6 * faces.length);
      for (let i = 0, l = faces.length; i < l; i ++) {
        const face = faces[i];
        for (let j = 0; j < 3; j ++) {
          edge[0] = face[keys[j]];
          edge[1] = face[keys[(j + 1) % 3]];
          edge.sort(sortFunction);
          const key = edge.toString();
          if (hash[key] === undefined) {
            edges[2 * numEdges] = edge[0];
            edges[2 * numEdges + 1] = edge[1];
            hash[key] = true;
            numEdges ++;
          }
        }
      }
      const coords = new Float32Array(numEdges * 2 * 3);
      for (let i = 0, l = numEdges; i < l; i ++) {
        for (let j = 0; j < 2; j ++) {
          const vertex = vertices[edges [2 * i + j]];
          const index = 6 * i + 3 * j;
          coords[index + 0] = vertex.x;
          coords[index + 1] = vertex.y;
          coords[index + 2] = vertex.z;
        }
      }
      this.addAttribute('position', new BufferAttribute(coords, 3));
    } else if (geometry && geometry instanceof BufferGeometry) {
      if (geometry.index !== null) {
        // Indexed BufferGeometry
        const indices = geometry.index.array;
        const vertices: BufferAttribute = geometry.attributes.position;
        const groups = geometry.groups;
        let numEdges = 0;
        if (groups.length === 0) {
          geometry.addGroup(0, indices.length);
        }
        // allocate maximal size
        const edges = new Uint32Array(2 * indices.length);
        for (let o = 0, ol = groups.length; o < ol; ++ o) {
          const group = groups[o];
          const start = group.start;
          const count = group.count;
          for (let i = start, il = start + count; i < il; i += 3) {
            for (let j = 0; j < 3; j ++) {
              edge[0] = indices[i + j];
              edge[1] = indices[i + (j + 1) % 3];
              edge.sort(sortFunction);
              const key = edge.toString();
              if (hash[key] === undefined) {
                edges[2 * numEdges] = edge[0];
                edges[2 * numEdges + 1] = edge[1];
                hash[key] = true;
                numEdges ++;
              }
            }
          }
        }
        const coords = new Float32Array(numEdges * 2 * 3);
        for (let i = 0, l = numEdges; i < l; i ++) {
          for (let j = 0; j < 2; j ++) {
            const index = 6 * i + 3 * j;
            const index2 = edges[2 * i + j];
            coords[index + 0] = vertices.getX(index2);
            coords[index + 1] = vertices.getY(index2);
            coords[index + 2] = vertices.getZ(index2);
          }
        }
        this.addAttribute('position', new BufferAttribute(coords, 3));
      } else {
        // non-indexed BufferGeometry
        const vertices = geometry.attributes.position.array;
        const numEdges = vertices.length / 3;
        const numTris = numEdges / 3;
        const coords = new Float32Array(numEdges * 2 * 3);
        for (let i = 0, l = numTris; i < l; i ++) {
          for (let j = 0; j < 3; j ++) {
            const index = 18 * i + 6 * j;
            const index1 = 9 * i + 3 * j;
            coords[index + 0] = vertices[index1];
            coords[index + 1] = vertices[index1 + 1];
            coords[index + 2] = vertices[index1 + 2];
            const index2 = 9 * i + 3 * ((j + 1) % 3);
            coords[index + 3] = vertices[index2];
            coords[index + 4] = vertices[index2 + 1];
            coords[index + 5] = vertices[index2 + 2];
          }
        }
        this.addAttribute('position', new BufferAttribute(coords, 3));
      }
    }
  }
}
