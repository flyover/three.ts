import { Geometry } from "../core/Geometry";
import { TorusKnotBufferGeometry } from "./TorusKnotBufferGeometry";
/**
 * @author oosmoxiecode
 */
export class TorusKnotGeometry extends Geometry {
  constructor(radius: number, tube: number, tubularSegments: number, radialSegments: number, p?: number, q?: number, heightScale?: number) {
    super();
    this.type = 'TorusKnotGeometry';
    this.parameters = {
      radius: radius,
      tube: tube,
      tubularSegments: tubularSegments,
      radialSegments: radialSegments,
      p: p,
      q: q
    };
    if (heightScale !== undefined) console.warn('THREE.TorusKnotGeometry: heightScale has been deprecated. Use .scale(x, y, z) instead.');
    this.fromBufferGeometry(new TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q));
    this.mergeVertices();
  }
}
