import { BufferGeometry } from "../core/BufferGeometry";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { BufferAttribute } from "../core/BufferAttribute";
/**
 * @author Mugen87 / https://github.com/Mugen87
 */
export class RingBufferGeometry extends BufferGeometry {
  constructor(innerRadius: number, outerRadius: number, thetaSegments: number, phiSegments: number, thetaStart: number, thetaLength: number) {
    super();
    this.type = 'RingBufferGeometry';
    this.parameters = {
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      thetaSegments: thetaSegments,
      phiSegments: phiSegments,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
    innerRadius = innerRadius || 20;
    outerRadius = outerRadius || 50;
    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;
    thetaSegments = thetaSegments !== undefined ? Math.max(3, thetaSegments) : 8;
    phiSegments = phiSegments !== undefined ? Math.max(1, phiSegments) : 1;
    // these are used to calculate buffer length
    const vertexCount = (thetaSegments + 1) * (phiSegments + 1);
    const indexCount = thetaSegments * phiSegments * 2 * 3;
    // buffers
    const indices = new BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount) , 1);
    const vertices = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const normals = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const uvs = new BufferAttribute(new Float32Array(vertexCount * 2), 2);
    // some helper variables
    let index = 0, indexOffset = 0;
    let radius = innerRadius;
    const radiusStep = ((outerRadius - innerRadius) / phiSegments);
    const vertex = new Vector3();
    const uv = new Vector2();
    // generate vertices, normals and uvs
    // values are generate from the inside of the ring to the outside
    for (let j = 0; j <= phiSegments; j ++) {
      for (let i = 0; i <= thetaSegments; i ++) {
        const segment = thetaStart + i / thetaSegments * thetaLength;
        // vertex
        vertex.x = radius * Math.cos(segment);
        vertex.y = radius * Math.sin(segment);
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
        // normal
        normals.setXYZ(index, 0, 0, 1);
        // uv
        uv.x = (vertex.x / outerRadius + 1) / 2;
        uv.y = (vertex.y / outerRadius + 1) / 2;
        uvs.setXY(index, uv.x, uv.y);
        // increase index
        index++;
      }
      // increase the radius for next row of vertices
      radius += radiusStep;
    }
    // generate indices
    for (let j = 0; j < phiSegments; j ++) {
      const thetaSegmentLevel = j * (thetaSegments + 1);
      for (let i = 0; i < thetaSegments; i ++) {
        const segment = i + thetaSegmentLevel;
        // indices
        const a = segment;
        const b = segment + thetaSegments + 1;
        const c = segment + thetaSegments + 2;
        const d = segment + 1;
        // face one
        indices.setX(indexOffset, a); indexOffset++;
        indices.setX(indexOffset, b); indexOffset++;
        indices.setX(indexOffset, c); indexOffset++;
        // face two
        indices.setX(indexOffset, a); indexOffset++;
        indices.setX(indexOffset, c); indexOffset++;
        indices.setX(indexOffset, d); indexOffset++;
      }
    }
    // build geometry
    this.setIndex(indices);
    this.addAttribute('position', vertices);
    this.addAttribute('normal', normals);
    this.addAttribute('uv', uvs);
  }
}
