import { Interpolant } from "../Interpolant";
/**
 *
 * Interpolant that evaluates to the sample value at the position preceeding
 * the parameter.
 *
 * @author tschw
 */
export class DiscreteInterpolant extends Interpolant {
  constructor(parameterPositions: number[] | Float32Array | Float64Array, sampleValues: number[] | Float32Array | Float64Array, sampleSize: number, resultBuffer?: number[] | Float32Array | Float64Array) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer);
  }
  interpolate_(i1: number, t0: number, t: number, t1: number): any {
    return this.copySampleValue_(i1 - 1);
  }
}
