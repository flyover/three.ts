import { KeyframeTrack } from "../KeyframeTrack";
/**
 *
 * A Track of keyframe values that represent color.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class NewColorKeyframeTrack extends KeyframeTrack {
  constructor(name: string, times: number[], values: any, interpolation: number) {
    super(name, times, values, interpolation);
  }
  ValueTypeName: string = 'color';
  // ValueBufferType is inherited
  // DefaultInterpolation is inherited
  // Note: Very basic implementation and nothing special yet.
  // However, this is the place for color space parameterization.
}
/*
export function OldColorKeyframeTrack(name: string, times: number[], values: any, interpolation: number) {
  KeyframeTrack.call(this, name, times, values, interpolation);
}
OldColorKeyframeTrack.prototype = Object.assign(Object.create(KeyframeTrack.prototype), {
  constructor: OldColorKeyframeTrack,
  ValueTypeName: 'color'
  // ValueBufferType is inherited
  // DefaultInterpolation is inherited
  // Note: Very basic implementation and nothing special yet.
  // However, this is the place for color space parameterization.
});
*/
export { NewColorKeyframeTrack as ColorKeyframeTrack }
