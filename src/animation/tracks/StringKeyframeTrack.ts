import { InterpolateMode } from "../../constants";
import { KeyframeTrack } from "../KeyframeTrack";
/**
 *
 * A Track that interpolates Strings
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class NewStringKeyframeTrack extends KeyframeTrack {
  constructor(name: string, times: number[], values: any, interpolation?: number) {
    super(name, times, values, interpolation);
  }
  ValueTypeName: string = 'string';
  ValueBufferType = Array;
  DefaultInterpolation: InterpolateMode = InterpolateMode.Discrete;
  ///InterpolantFactoryMethodLinear = undefined; // !!TODO
  ///InterpolantFactoryMethodSmooth = undefined; // !!TODO
}
/*
export function OldStringKeyframeTrack(name: string, times: number[], values: any, interpolation: number) {
  KeyframeTrack.call(this, name, times, values, interpolation);
}
OldStringKeyframeTrack.prototype = Object.assign(Object.create(KeyframeTrack.prototype), {
  constructor: OldStringKeyframeTrack,
  ValueTypeName: 'string',
  ValueBufferType: Array,
  DefaultInterpolation: InterpolateMode.Discrete,
  InterpolantFactoryMethodLinear: undefined,
  InterpolantFactoryMethodSmooth: undefined
});
*/
export { NewStringKeyframeTrack as StringKeyframeTrack }
