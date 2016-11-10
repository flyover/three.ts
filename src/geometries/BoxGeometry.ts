import { Geometry } from "../core/Geometry";
import { BoxBufferGeometry } from "./BoxBufferGeometry";
/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Cube.as
 */
export class BoxGeometry extends Geometry {
  constructor(width: number, height: number, depth: number, widthSegments?: number, heightSegments?: number, depthSegments?: number) {
    super();
    this.type = 'BoxGeometry';
    this.parameters = {
      width: width,
      height: height,
      depth: depth,
      widthSegments: widthSegments,
      heightSegments: heightSegments,
      depthSegments: depthSegments
    };
    this.fromBufferGeometry(new BoxBufferGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
    this.mergeVertices();
  }
}
