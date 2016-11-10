import { BufferGeometry } from "../core/BufferGeometry";
import { Vector3 } from "../math/Vector3";
import { BufferAttribute } from "../core/BufferAttribute";
/**
 * @author Mugen87 / https://github.com/Mugen87
 */
export class BoxBufferGeometry extends BufferGeometry {
  constructor(width: number, height: number, depth: number, widthSegments?: number, heightSegments?: number, depthSegments?: number) {
    super();
    this.type = 'BoxBufferGeometry';
    this.parameters = {
      width: width,
      height: height,
      depth: depth,
      widthSegments: widthSegments,
      heightSegments: heightSegments,
      depthSegments: depthSegments
    };
    const scope = this;
    // segments
    widthSegments = Math.floor(widthSegments) || 1;
    heightSegments = Math.floor(heightSegments) || 1;
    depthSegments = Math.floor(depthSegments) || 1;
    // these are used to calculate buffer length
    const vertexCount = calculateVertexCount(widthSegments, heightSegments, depthSegments);
    const indexCount = calculateIndexCount(widthSegments, heightSegments, depthSegments);
    // buffers
    const indices = new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount);
    const vertices = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    // offset variables
    let vertexBufferOffset = 0;
    let uvBufferOffset = 0;
    let indexBufferOffset = 0;
    let numberOfVertices = 0;
    // group variables
    let groupStart = 0;
    // build each side of the box geometry
    buildPlane('z', 'y', 'x', - 1, - 1, depth, height,   width,  depthSegments, heightSegments, 0); // px
    buildPlane('z', 'y', 'x',   1, - 1, depth, height, - width,  depthSegments, heightSegments, 1); // nx
    buildPlane('x', 'z', 'y',   1,   1, width, depth,    height, widthSegments, depthSegments,  2); // py
    buildPlane('x', 'z', 'y',   1, - 1, width, depth,  - height, widthSegments, depthSegments,  3); // ny
    buildPlane('x', 'y', 'z',   1, - 1, width, height,   depth,  widthSegments, heightSegments, 4); // pz
    buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth,  widthSegments, heightSegments, 5); // nz
    // build geometry
    this.setIndex(new BufferAttribute(indices, 1));
    this.addAttribute('position', new BufferAttribute(vertices, 3));
    this.addAttribute('normal', new BufferAttribute(normals, 3));
    this.addAttribute('uv', new BufferAttribute(uvs, 2));
    // helper functions
    function calculateVertexCount(w: number, h: number, d: number) {
      let vertices = 0;
      // calculate the amount of vertices for each side (plane)
      vertices += (w + 1) * (h + 1) * 2; // xy
      vertices += (w + 1) * (d + 1) * 2; // xz
      vertices += (d + 1) * (h + 1) * 2; // zy
      return vertices;
    }
    function calculateIndexCount(w: number, h: number, d: number) {
      let index = 0;
      // calculate the amount of squares for each side
      index += w * h * 2; // xy
      index += w * d * 2; // xz
      index += d * h * 2; // zy
      return index * 6; // two triangles per square => six vertices per square
    }
    function buildPlane(u: string, v: string, w: string, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number, materialIndex: number) {
      const segmentWidth  = width / gridX;
      const segmentHeight = height / gridY;
      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const depthHalf = depth / 2;
      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;
      let vertexCounter = 0;
      let groupCount = 0;
      const vector = new Vector3();
      // generate vertices, normals and uvs
      for (let iy = 0; iy < gridY1; iy ++) {
        const y = iy * segmentHeight - heightHalf;
        for (let ix = 0; ix < gridX1; ix ++) {
          const x = ix * segmentWidth - widthHalf;
          // set values to correct vector component
          vector[u] = x * udir;
          vector[v] = y * vdir;
          vector[w] = depthHalf;
          // now apply vector to vertex buffer
          vertices[vertexBufferOffset] = vector.x;
          vertices[vertexBufferOffset + 1] = vector.y;
          vertices[vertexBufferOffset + 2] = vector.z;
          // set values to correct vector component
          vector[u] = 0;
          vector[v] = 0;
          vector[w] = depth > 0 ? 1 : - 1;
          // now apply vector to normal buffer
          normals[vertexBufferOffset] = vector.x;
          normals[vertexBufferOffset + 1] = vector.y;
          normals[vertexBufferOffset + 2] = vector.z;
          // uvs
          uvs[uvBufferOffset] = ix / gridX;
          uvs[uvBufferOffset + 1] = 1 - (iy / gridY);
          // update offsets and counters
          vertexBufferOffset += 3;
          uvBufferOffset += 2;
          vertexCounter += 1;
        }
      }
      // 1. you need three indices to draw a single face
      // 2. a single segment consists of two faces
      // 3. so we need to generate six (2*3) indices per segment
      for (let iy = 0; iy < gridY; iy ++) {
        for (let ix = 0; ix < gridX; ix ++) {
          // indices
          const a = numberOfVertices + ix + gridX1 * iy;
          const b = numberOfVertices + ix + gridX1 * (iy + 1);
          const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
          const d = numberOfVertices + (ix + 1) + gridX1 * iy;
          // face one
          indices[indexBufferOffset] = a;
          indices[indexBufferOffset + 1] = b;
          indices[indexBufferOffset + 2] = d;
          // face two
          indices[indexBufferOffset + 3] = b;
          indices[indexBufferOffset + 4] = c;
          indices[indexBufferOffset + 5] = d;
          // update offsets and counters
          indexBufferOffset += 6;
          groupCount += 6;
        }
      }
      // add a group to the geometry. this will ensure multi material support
      scope.addGroup(groupStart, groupCount, materialIndex);
      // calculate new start value for groups
      groupStart += groupCount;
      // update total number of vertices
      numberOfVertices += vertexCounter;
    }
  }
}
