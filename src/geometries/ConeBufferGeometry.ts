import { CylinderBufferGeometry } from "./CylinderBufferGeometry";
/*
 * @author: abelnation / http://github.com/abelnation
 */
export class ConeBufferGeometry extends CylinderBufferGeometry {
  constructor(
    radius: number, height: number, radialSegments: number, heightSegments: number, openEnded: boolean, thetaStart: number, thetaLength: number) {
    super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
    this.type = 'ConeBufferGeometry';
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
