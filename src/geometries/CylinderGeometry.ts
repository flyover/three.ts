import { Geometry } from "../core/Geometry";
import { CylinderBufferGeometry } from "./CylinderBufferGeometry";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class CylinderGeometry extends Geometry {
  constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments: number, heightSegments: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number) {
    super();
    this.type = 'CylinderGeometry';
    this.parameters = {
      radiusTop: radiusTop,
      radiusBottom: radiusBottom,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
    this.fromBufferGeometry(new CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength));
    this.mergeVertices();
  }
}
