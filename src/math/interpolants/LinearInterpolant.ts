import { Interpolant } from "../Interpolant";
/**
 * @author tschw
 */
export class LinearInterpolant extends Interpolant {
  constructor(parameterPositions: number[] | Float32Array | Float64Array, sampleValues: number[] | Float32Array | Float64Array, sampleSize: number, resultBuffer?: number[] | Float32Array | Float64Array) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  interpolate_(i1: number, t0: number, t: number, t1: number): any {
    const result = this.resultBuffer;
    const values = this.sampleValues;
    const stride = this.valueSize;
    const offset1 = i1 * stride;
    const offset0 = offset1 - stride;
    const weight1 = (t - t0) / (t1 - t0);
    const weight0 = 1 - weight1;
    for (let i = 0; i !== stride; ++ i) {
      result[ i ] =
          values[ offset0 + i ] * weight0 +
          values[ offset1 + i ] * weight1;
    }
    return result;
  }
}
