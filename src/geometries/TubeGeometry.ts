import { Geometry } from "../core/Geometry";
import { TubeBufferGeometry } from "./TubeBufferGeometry";
import { Curve } from "../extras/core/Curve";
import { Vector3 } from "../math/Vector3";
/**
 * @author oosmoxiecode / https://github.com/oosmoxiecode
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 * @author jonobr1 / https://github.com/jonobr1
 *
 * Creates a tube which extrudes along a 3d spline.
 */
export class TubeGeometry extends Geometry {
  tangents: Vector3[];
  normals: Vector3[];
  binormals: Vector3[];
  constructor(path: Curve<Vector3>, tubularSegments: number, radius: number, radialSegments: number, closed: boolean, taper?: number) {
    super();
    this.type = 'TubeGeometry';
    this.parameters = {
      path: path,
      tubularSegments: tubularSegments,
      radius: radius,
      radialSegments: radialSegments,
      closed: closed
    };
    if (taper !== undefined) console.warn('THREE.TubeGeometry: taper has been removed.');
    let bufferGeometry = new TubeBufferGeometry(path, tubularSegments, radius, radialSegments, closed);
    // expose internals
    this.tangents = bufferGeometry.tangents;
    this.normals = bufferGeometry.normals;
    this.binormals = bufferGeometry.binormals;
    // create geometry
    this.fromBufferGeometry(bufferGeometry);
    this.mergeVertices();
  }
}
