import { CylinderGeometry } from "./CylinderGeometry";
/**
 * @author abelnation / http://github.com/abelnation
 */
export class ConeGeometry extends CylinderGeometry {
  constructor(radius: number, height: number, radialSegments: number, heightSegments: number, openEnded: boolean, thetaStart: number, thetaLength: number) {
    super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
    this.type = 'ConeGeometry';
    this.parameters = {
      radius: radius,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
  }
}
