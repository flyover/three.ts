import { BufferGeometry } from "../core/BufferGeometry";
import { BufferAttribute } from "../core/BufferAttribute";
/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */
export class PlaneBufferGeometry extends BufferGeometry {
  constructor(width: number, height: number, widthSegments?: number, heightSegments?: number) {
    super();
    this.type = 'PlaneBufferGeometry';
    this.parameters = {
      width: width,
      height: height,
      widthSegments: widthSegments,
      heightSegments: heightSegments
    };
    const width_half = width / 2;
    const height_half = height / 2;
    const gridX = Math.floor(widthSegments) || 1;
    const gridY = Math.floor(heightSegments) || 1;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segment_width = width / gridX;
    const segment_height = height / gridY;
    const vertices = new Float32Array(gridX1 * gridY1 * 3);
    const normals = new Float32Array(gridX1 * gridY1 * 3);
    const uvs = new Float32Array(gridX1 * gridY1 * 2);
    let offset = 0;
    let offset2 = 0;
    for (let iy = 0; iy < gridY1; iy ++) {
      const y = iy * segment_height - height_half;
      for (let ix = 0; ix < gridX1; ix ++) {
        const x = ix * segment_width - width_half;
        vertices[offset] = x;
        vertices[offset + 1] = - y;
        normals[offset + 2] = 1;
        uvs[offset2] = ix / gridX;
        uvs[offset2 + 1] = 1 - (iy / gridY);
        offset += 3;
        offset2 += 2;
      }
    }
    offset = 0;
    const indices = new ((vertices.length / 3) > 65535 ? Uint32Array : Uint16Array)(gridX * gridY * 6);
    for (let iy = 0; iy < gridY; iy ++) {
      for (let ix = 0; ix < gridX; ix ++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = (ix + 1) + gridX1 * (iy + 1);
        const d = (ix + 1) + gridX1 * iy;
        indices[offset] = a;
        indices[offset + 1] = b;
        indices[offset + 2] = d;
        indices[offset + 3] = b;
        indices[offset + 4] = c;
        indices[offset + 5] = d;
        offset += 6;
      }
    }
    this.setIndex(new BufferAttribute(indices, 1));
    this.addAttribute('position', new BufferAttribute(vertices, 3));
    this.addAttribute('normal', new BufferAttribute(normals, 3));
    this.addAttribute('uv', new BufferAttribute(uvs, 2));
  }
}
