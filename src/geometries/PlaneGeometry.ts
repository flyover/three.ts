import { Geometry } from "../core/Geometry";
import { PlaneBufferGeometry } from "./PlaneBufferGeometry";
/**
 * @author mrdoob / http://mrdoob.com/
 * based on http://papervision3d.googlecode.com/svn/trunk/as3/trunk/src/org/papervision3d/objects/primitives/Plane.as
 */
export class PlaneGeometry extends Geometry {
  constructor(width: number, height: number, widthSegments?: number, heightSegments?: number) {
    super();
    this.type = 'PlaneGeometry';
    this.parameters = {
      width: width,
      height: height,
      widthSegments: widthSegments,
      heightSegments: heightSegments
    };
    this.fromBufferGeometry(new PlaneBufferGeometry(width, height, widthSegments, heightSegments));
  }
}
