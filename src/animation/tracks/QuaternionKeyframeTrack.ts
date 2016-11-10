import { InterpolateMode } from "../../constants";
import { QuaternionLinearInterpolant } from "../../math/interpolants/QuaternionLinearInterpolant";
import { KeyframeTrack } from "../KeyframeTrack";
import { Interpolant } from "../../math/Interpolant";
/**
 *
 * A Track of quaternion keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class NewQuaternionKeyframeTrack extends KeyframeTrack {
  constructor(name: string, times: number[], values: any, interpolation: number) {
    super(name, times, values, interpolation);
  }
  ValueTypeName: string = 'quaternion';
  // ValueBufferType is inherited
  DefaultInterpolation: InterpolateMode = InterpolateMode.Linear;
  InterpolantFactoryMethodLinear(result: number[] | Float32Array): Interpolant {
    return new QuaternionLinearInterpolant(
        this.times, this.values, this.getValueSize(), result);
  }
  ///InterpolantFactoryMethodSmooth = undefined; // !!TODO: not yet implemented
}
/*
export function OldQuaternionKeyframeTrack(name: string, times: number[], values: any, interpolation: number) {
  KeyframeTrack.call(this, name, times, values, interpolation);
}
OldQuaternionKeyframeTrack.prototype = Object.assign(Object.create(KeyframeTrack.prototype), {
  constructor: OldQuaternionKeyframeTrack,
  ValueTypeName: 'quaternion',
  // ValueBufferType is inherited
  DefaultInterpolation: InterpolateMode.Linear,
  InterpolantFactoryMethodLinear: function(result: number[] | Float32Array): Interpolant {
    return new QuaternionLinearInterpolant(
        this.times, this.values, this.getValueSize(), result);
  },
  InterpolantFactoryMethodSmooth: undefined // not yet implemented
});
*/
export { NewQuaternionKeyframeTrack as QuaternionKeyframeTrack }
