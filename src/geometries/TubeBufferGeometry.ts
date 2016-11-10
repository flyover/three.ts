import { BufferGeometry } from "../core/BufferGeometry";
import { Float32Attribute, Uint16Attribute, Uint32Attribute } from "../core/BufferAttribute";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Curve } from "../extras/core/Curve";
/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Creates a tube which extrudes along a 3d spline.
 *
 */
export class TubeBufferGeometry extends BufferGeometry {
  tangents: Vector3[];
  normals: Vector3[];
  binormals: Vector3[];
  constructor(path: Curve<Vector3>, tubularSegments: number, radius: number, radialSegments: number, closed: boolean) {
    super();
    this.type = 'TubeBufferGeometry';
    this.parameters = {
      path: path,
      tubularSegments: tubularSegments,
      radius: radius,
      radialSegments: radialSegments,
      closed: closed
    };
    tubularSegments = tubularSegments || 64;
    radius = radius || 1;
    radialSegments = radialSegments || 8;
    closed = closed || false;
    let frames = path.computeFrenetFrames(tubularSegments, closed);
    // expose internals
    this.tangents = frames.tangents;
    this.normals = frames.normals;
    this.binormals = frames.binormals;
    // helper variables
    let vertex = new Vector3();
    let normal = new Vector3();
    let uv = new Vector2();
    // buffer
    let vertices = [];
    let normals = [];
    let uvs = [];
    let indices = [];
    // create buffer data
    generateBufferData();
    // build geometry
    this.setIndex((indices.length > 65535 ? Uint32Attribute : Uint16Attribute)(indices, 1));
    this.addAttribute('position', Float32Attribute(vertices, 3));
    this.addAttribute('normal', Float32Attribute(normals, 3));
    this.addAttribute('uv', Float32Attribute(uvs, 2));
    // functions
    function generateBufferData() {
      for (let i = 0; i < tubularSegments; i ++) {
        generateSegment(i);
      }
      // if the geometry is not closed, generate the last row of vertices and normals
      // at the regular position on the given path
      //
      // if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)
      generateSegment((closed === false) ? tubularSegments : 0);
      // uvs are generated in a separate function.
      // this makes it easy compute correct values for closed geometries
      generateUVs();
      // finally create faces
      generateIndices();
    }
    function generateSegment(i) {
      // we use getPointAt to sample evenly distributed points from the given path
      let P = path.getPointAt(i / tubularSegments);
      // retrieve corresponding normal and binormal
      let N = frames.normals[ i ];
      let B = frames.binormals[ i ];
      // generate normals and vertices for the current segment
      for (let j = 0; j <= radialSegments; j ++) {
        let v = j / radialSegments * Math.PI * 2;
        let sin =   Math.sin(v);
        let cos = - Math.cos(v);
        // normal
        normal.x = (cos * N.x + sin * B.x);
        normal.y = (cos * N.y + sin * B.y);
        normal.z = (cos * N.z + sin * B.z);
        normal.normalize();
        normals.push(normal.x, normal.y, normal.z);
        // vertex
        vertex.x = P.x + radius * normal.x;
        vertex.y = P.y + radius * normal.y;
        vertex.z = P.z + radius * normal.z;
        vertices.push(vertex.x, vertex.y, vertex.z);
      }
    }
    function generateIndices() {
      for (let j = 1; j <= tubularSegments; j ++) {
        for (let i = 1; i <= radialSegments; i ++) {
          let a = (radialSegments + 1) * (j - 1) + (i - 1);
          let b = (radialSegments + 1) * j + (i - 1);
          let c = (radialSegments + 1) * j + i;
          let d = (radialSegments + 1) * (j - 1) + i;
          // faces
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }
    }
    function generateUVs() {
      for (let i = 0; i <= tubularSegments; i ++) {
        for (let j = 0; j <= radialSegments; j ++) {
          uv.x = i / tubularSegments;
          uv.y = j / radialSegments;
          uvs.push(uv.x, uv.y);
        }
      }
    }
  }
}
