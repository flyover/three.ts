import { Geometry } from "../core/Geometry";
import { RingBufferGeometry } from "./RingBufferGeometry";
/**
 * @author Kaleb Murphy
 */
export class RingGeometry extends Geometry {
  constructor(innerRadius: number, outerRadius: number, thetaSegments: number, phiSegments: number, thetaStart: number, thetaLength: number) {
    super();
    this.type = 'RingGeometry';
    this.parameters = {
      innerRadius: innerRadius,
      outerRadius: outerRadius,
      thetaSegments: thetaSegments,
      phiSegments: phiSegments,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
    this.fromBufferGeometry(new RingBufferGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength));
  }
}
