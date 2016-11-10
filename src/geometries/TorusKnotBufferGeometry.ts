import { BufferGeometry } from "../core/BufferGeometry";
import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { BufferAttribute } from "../core/BufferAttribute";
/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * see: http://www.blackpawn.com/texts/pqtorus/
 */
export class TorusKnotBufferGeometry extends BufferGeometry {
  constructor(radius: number, tube: number, tubularSegments: number, radialSegments: number, p: number, q: number) {
    super();
    this.type = 'TorusKnotBufferGeometry';
    this.parameters = {
      radius: radius,
      tube: tube,
      tubularSegments: tubularSegments,
      radialSegments: radialSegments,
      p: p,
      q: q
    };
    radius = radius || 100;
    tube = tube || 40;
    tubularSegments = Math.floor(tubularSegments) || 64;
    radialSegments = Math.floor(radialSegments) || 8;
    p = p || 2;
    q = q || 3;
    // used to calculate buffer length
    const vertexCount = ((radialSegments + 1) * (tubularSegments + 1));
    const indexCount = radialSegments * tubularSegments * 2 * 3;
    // buffers
    const indices = new BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount) , 1);
    const vertices = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const normals = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const uvs = new BufferAttribute(new Float32Array(vertexCount * 2), 2);
    // helper variables
    let index = 0, indexOffset = 0;
    const vertex = new Vector3();
    const normal = new Vector3();
    const uv = new Vector2();
    const P1 = new Vector3();
    const P2 = new Vector3();
    const B = new Vector3();
    const T = new Vector3();
    const N = new Vector3();
    // generate vertices, normals and uvs
    for (let i = 0; i <= tubularSegments; ++ i) {
      // the radian "u" is used to calculate the position on the torus curve of the current tubular segement
      const u = i / tubularSegments * p * Math.PI * 2;
      // now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
      // these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions
      calculatePositionOnCurve(u, p, q, radius, P1);
      calculatePositionOnCurve(u + 0.01, p, q, radius, P2);
      // calculate orthonormal basis
      T.subVectors(P2, P1);
      N.addVectors(P2, P1);
      B.crossVectors(T, N);
      N.crossVectors(B, T);
      // normalize B, N. T can be ignored, we don't use it
      B.normalize();
      N.normalize();
      for (let j = 0; j <= radialSegments; ++ j) {
        // now calculate the vertices. they are nothing more than an extrusion of the torus curve.
        // because we extrude a shape in the xy-plane, there is no need to calculate a z-value.
        const v = j / radialSegments * Math.PI * 2;
        const cx = - tube * Math.cos(v);
        const cy = tube * Math.sin(v);
        // now calculate the final vertex position.
        // first we orient the extrusion with our basis vectos, then we add it to the current position on the curve
        vertex.x = P1.x + (cx * N.x + cy * B.x);
        vertex.y = P1.y + (cx * N.y + cy * B.y);
        vertex.z = P1.z + (cx * N.z + cy * B.z);
        // vertex
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
        // normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)
        normal.subVectors(vertex, P1).normalize();
        normals.setXYZ(index, normal.x, normal.y, normal.z);
        // uv
        uv.x = i / tubularSegments;
        uv.y = j / radialSegments;
        uvs.setXY(index, uv.x, uv.y);
        // increase index
        index ++;
      }
    }
    // generate indices
    for (let j = 1; j <= tubularSegments; j ++) {
      for (let i = 1; i <= radialSegments; i ++) {
        // indices
        const a = (radialSegments + 1) * (j - 1) + (i - 1);
        const b = (radialSegments + 1) * j + (i - 1);
        const c = (radialSegments + 1) * j + i;
        const d = (radialSegments + 1) * (j - 1) + i;
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
    this.addAttribute('normal', normals);
    this.addAttribute('uv', uvs);
    // this function calculates the current position on the torus curve
    function calculatePositionOnCurve(u: number, p: number, q: number, radius: number, position: Vector3) {
      const cu = Math.cos(u);
      const su = Math.sin(u);
      const quOverP = q / p * u;
      const cs = Math.cos(quOverP);
      position.x = radius * (2 + cs) * 0.5 * cu;
      position.y = radius * (2 + cs) * su * 0.5;
      position.z = radius * Math.sin(quOverP) * 0.5;
    }
  }
}
