import { InterpolateMode } from "../../constants";
import { KeyframeTrack } from "../KeyframeTrack";
/**
 *
 * A Track of Boolean keyframe values.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class NewBooleanKeyframeTrack extends KeyframeTrack {
  constructor(name: string, times: number[], values: any, interpolation: number) {
    super(name, times, values, interpolation);
  }
  ValueTypeName: string = 'color';
  ValueBufferType = Array;
  DefaultInterpolation: InterpolateMode = InterpolateMode.Discrete;
  ///InterpolantFactoryMethodLinear: undefined; // !!TODO
  ///InterpolantFactoryMethodSmooth: undefined; // !!TODO
  // Note: Actually this track could have a optimized / compressed
  // representation of a single value and a custom interpolant that
  // computes "firstValue ^ isOdd(index)".
}
/*
export function OldBooleanKeyframeTrack(name: string, times: number, values: number[] | Float32Array) {
  KeyframeTrack.call(this, name, times, values);
}
OldBooleanKeyframeTrack.prototype = Object.assign(Object.create(KeyframeTrack.prototype), {
  constructor: OldBooleanKeyframeTrack,
  ValueTypeName: 'bool',
  ValueBufferType: Array,
  DefaultInterpolation: InterpolateMode.Discrete,
  InterpolantFactoryMethodLinear: undefined,
  InterpolantFactoryMethodSmooth: undefined
  // Note: Actually this track could have a optimized / compressed
  // representation of a single value and a custom interpolant that
  // computes "firstValue ^ isOdd(index)".
});
*/
export { NewBooleanKeyframeTrack as BooleanKeyframeTrack }
