import { KeyframeTrack } from "../KeyframeTrack";
/**
 *
 * A Track of numeric keyframe values.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class NewNumberKeyframeTrack extends KeyframeTrack {
  constructor(name: string, times: number[], values: any, interpolation?: number) {
    super(name, times, values, interpolation);
  }
  ValueTypeName: string = 'number';
  // ValueBufferType is inherited
  // DefaultInterpolation is inherited
}
/*
export function OldNumberKeyframeTrack(name: string, times: number[], values: any, interpolation?: number) {
  KeyframeTrack.call(this, name, times, values, interpolation);
}
OldNumberKeyframeTrack.prototype = Object.assign(Object.create(KeyframeTrack.prototype), {
  constructor: OldNumberKeyframeTrack,
  ValueTypeName: 'number',
  // ValueBufferType is inherited
  // DefaultInterpolation is inherited
});
*/
export { NewNumberKeyframeTrack as NumberKeyframeTrack }
