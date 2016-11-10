import { BufferGeometry } from "../core/BufferGeometry";
import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { BufferAttribute } from "../core/BufferAttribute";
import { _Math } from "../math/Math";
/**
 * @author Mugen87 / https://github.com/Mugen87
 */
 // points - to create a closed torus, one must use a set of points
 //    like so: [a, b, c, d, a], see first is the same as last.
 // segments - the number of circumference segments to create
 // phiStart - the starting radian
 // phiLength - the radian (0 to 2PI) range of the lathed section
 //    2PI is a closed lathe, less than 2PI is a portion.
export class LatheBufferGeometry extends BufferGeometry {
  constructor(points: Vector2[], segments: number, phiStart: number, phiLength: number) {
    super();
    this.type = 'LatheBufferGeometry';
    this.parameters = {
      points: points,
      segments: segments,
      phiStart: phiStart,
      phiLength: phiLength
    };
    segments = Math.floor(segments) || 12;
    phiStart = phiStart || 0;
    phiLength = phiLength || Math.PI * 2;
    // clamp phiLength so it's in range of [0, 2PI]
    phiLength = _Math.clamp(phiLength, 0, Math.PI * 2);
    // these are used to calculate buffer length
    const vertexCount = (segments + 1) * points.length;
    const indexCount = segments * points.length * 2 * 3;
    // buffers
    const indices = new BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount) , 1);
    const vertices = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const uvs = new BufferAttribute(new Float32Array(vertexCount * 2), 2);
    // helper variables
    let index = 0, indexOffset = 0;
    const inverseSegments = 1.0 / segments;
    const vertex = new Vector3();
    const uv = new Vector2();
    // generate vertices and uvs
    for (let i = 0; i <= segments; i ++) {
      const phi = phiStart + i * inverseSegments * phiLength;
      const sin = Math.sin(phi);
      const cos = Math.cos(phi);
      for (let j = 0; j <= (points.length - 1); j ++) {
        // vertex
        vertex.x = points[j].x * sin;
        vertex.y = points[j].y;
        vertex.z = points[j].x * cos;
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
        // uv
        uv.x = i / segments;
        uv.y = j / (points.length - 1);
        uvs.setXY(index, uv.x, uv.y);
        // increase index
        index ++;
      }
    }
    // generate indices
    for (let i = 0; i < segments; i ++) {
      for (let j = 0; j < (points.length - 1); j ++) {
        const base = j + i * points.length;
        // indices
        const a = base;
        const b = base + points.length;
        const c = base + points.length + 1;
        const d = base + 1;
        // face one
        indices.setX(indexOffset, a); indexOffset++;
        indices.setX(indexOffset, b); indexOffset++;
        indices.setX(indexOffset, d); indexOffset++;
        // face two
        indices.setX(indexOffset, b); indexOffset++;
        indices.setX(indexOffset, c); indexOffset++;
        indices.setX(indexOffset, d); indexOffset++;
      }
    }
    // build geometry
    this.setIndex(indices);
    this.addAttribute('position', vertices);
    this.addAttribute('uv', uvs);
    // generate normals
    this.computeVertexNormals();
    // if the geometry is closed, we need to average the normals along the seam.
    // because the corresponding vertices are identical (but still have different UVs).
    if (phiLength === Math.PI * 2) {
      const normals = this.attributes.normal.array;
      const n1 = new Vector3();
      const n2 = new Vector3();
      const n = new Vector3();
      // this is the buffer offset for the last line of vertices
      const base = segments * points.length * 3;
      for (let i = 0, j = 0; i < points.length; i ++, j += 3) {
        // select the normal of the vertex in the first line
        n1.x = normals[j + 0];
        n1.y = normals[j + 1];
        n1.z = normals[j + 2];
        // select the normal of the vertex in the last line
        n2.x = normals[base + j + 0];
        n2.y = normals[base + j + 1];
        n2.z = normals[base + j + 2];
        // average normals
        n.addVectors(n1, n2).normalize();
        // assign the new values to both normals
        normals[j + 0] = normals[base + j + 0] = n.x;
        normals[j + 1] = normals[base + j + 1] = n.y;
        normals[j + 2] = normals[base + j + 2] = n.z;
      } // next row
    }
  }
}
