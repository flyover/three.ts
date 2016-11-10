import { Interpolant } from "../Interpolant";
import { Quaternion } from "../Quaternion";
/**
 * Spherical linear unit quaternion interpolant.
 *
 * @author tschw
 */
export class QuaternionLinearInterpolant extends Interpolant {
  constructor(parameterPositions: number[] | Float32Array | Float64Array, sampleValues: number[] | Float32Array | Float64Array, sampleSize: number, resultBuffer: number[] | Float32Array | Float64Array) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  interpolate_(i1: number, t0: number, t: number, t1: number): any {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    let offset = i1 * stride;
    const alpha = (t - t0) / (t1 - t0);
    for (let end = offset + stride; offset !== end; offset += 4) {
      Quaternion.slerpFlat(result, 0,
          values, offset - stride, values, offset, alpha);
    }
    return result;
  }
}
