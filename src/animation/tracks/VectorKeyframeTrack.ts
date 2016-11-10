import { KeyframeTrack } from "../KeyframeTrack";
/**
 *
 * A Track of vectored keyframe values.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class NewVectorKeyframeTrack extends KeyframeTrack {
  constructor(name: string, times: number[], values: any, interpolation: number) {
    super(name, times, values, interpolation);
  }
  ValueTypeName: string = 'vector';
  // ValueBufferType is inherited
  // DefaultInterpolation is inherited
}
/*
export function OldVectorKeyframeTrack(name: string, times: number[], values: any, interpolation: number) {
  KeyframeTrack.call(this, name, times, values, interpolation);
}
OldVectorKeyframeTrack.prototype = Object.assign(Object.create(KeyframeTrack.prototype), {
  constructor: OldVectorKeyframeTrack,
  ValueTypeName: 'vector'
  // ValueBufferType is inherited
  // DefaultInterpolation is inherited
});
*/
export { NewVectorKeyframeTrack as VectorKeyframeTrack }
