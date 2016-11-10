import { AnimationUtils } from "./AnimationUtils";
import { InterpolateMode } from "../constants";
import { Interpolant } from "../math/Interpolant";
import { CubicInterpolant } from "../math/interpolants/CubicInterpolant";
import { LinearInterpolant } from "../math/interpolants/LinearInterpolant";
import { DiscreteInterpolant } from "../math/interpolants/DiscreteInterpolant";
/**
 *
 * A timed sequence of keyframes for a specific property.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
export class KeyframeTrack {
  name: string;
  times: number[];
  values: number[] | Float32Array | Float64Array;
  constructor(name: string, times: number[], values: number[] | Float32Array | Float64Array, interpolation: number) {
    if (name === undefined) throw new Error("track name is undefined");
    if (times === undefined || times.length === 0) {
      throw new Error("no keyframes in track named " + name);
    }
    this.name = name;
    this.times = AnimationUtils.convertArray(times, this.TimeBufferType);
    this.values = AnimationUtils.convertArray(values, this.ValueBufferType);
    this.setInterpolation(interpolation || this.DefaultInterpolation);
    this.validate();
    this.optimize();
  }
  TimeBufferType: ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor = Float32Array;
  ValueBufferType: ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor = Float32Array;
  DefaultInterpolation: InterpolateMode = InterpolateMode.Linear;
  InterpolantFactoryMethodDiscrete(result: number[] | Float32Array | Float64Array): Interpolant {
    return new DiscreteInterpolant(
        this.times, this.values, this.getValueSize(), result);
  }
  InterpolantFactoryMethodLinear(result: number[] | Float32Array | Float64Array): Interpolant {
    return new LinearInterpolant(
        this.times, this.values, this.getValueSize(), result);
  }
  InterpolantFactoryMethodSmooth(result: number[] | Float32Array | Float64Array): Interpolant {
    return new CubicInterpolant(
        this.times, this.values, this.getValueSize(), result);
  }
  ValueTypeName: string;
  createInterpolant: (result: number[] | Float32Array | Float64Array) => Interpolant;
  setInterpolation(interpolation: InterpolateMode): void {
    let factoryMethod: (result: number[] | Float32Array | Float64Array) => Interpolant;
    switch (interpolation) {
      case InterpolateMode.Discrete:
        factoryMethod = this.InterpolantFactoryMethodDiscrete;
        break;
      case InterpolateMode.Linear:
        factoryMethod = this.InterpolantFactoryMethodLinear;
        break;
      case InterpolateMode.Smooth:
        factoryMethod = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (factoryMethod === undefined) {
      const message = "unsupported interpolation for " +
          this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === undefined) {
        // fall back to default, unless the default itself is messed up
        if (interpolation !== this.DefaultInterpolation) {
          this.setInterpolation(this.DefaultInterpolation);
        } else {
          throw new Error(message); // fatal, in this case
        }
      }
      console.warn(message);
      return;
    }
    this.createInterpolant = factoryMethod;
  }
  getInterpolation(): InterpolateMode {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return InterpolateMode.Discrete;
      case this.InterpolantFactoryMethodLinear:
        return InterpolateMode.Linear;
      case this.InterpolantFactoryMethodSmooth:
        return InterpolateMode.Smooth;
    }
    throw new Error();
  }
  getValueSize(): number {
    return this.values.length / this.times.length;
  }
  // move all keyframes either forwards or backwards in time
  shift(timeOffset: number): any {
    if (timeOffset !== 0.0) {
      const times = this.times;
      for (let i = 0, n = times.length; i !== n; ++ i) {
        times[ i ] += timeOffset;
      }
    }
    return this;
  }
  // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
  scale(timeScale: number): any {
    if (timeScale !== 1.0) {
      const times = this.times;
      for (let i = 0, n = times.length; i !== n; ++ i) {
        times[ i ] *= timeScale;
      }
    }
    return this;
  }
  // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
  // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
  trim(startTime: number, endTime: number): any {
    const times = this.times;
    const nKeys = times.length;
    let from = 0;
    let to = nKeys - 1;
    while (from !== nKeys && times[ from ] < startTime) ++ from;
    while (to !== -1 && times[ to ] > endTime) -- to;
    ++ to; // inclusive -> exclusive bound
    if (from !== 0 || to !== nKeys) {
      // empty tracks are forbidden, so keep at least one keyframe
      if (from >= to) to = Math.max(to , 1), from = to - 1;
      const stride = this.getValueSize();
      this.times = AnimationUtils.arraySlice(times, from, to);
      this.values = AnimationUtils.
          arraySlice(this.values, from * stride, to * stride);
    }
    return this;
  }
  // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
  validate(): boolean {
    let valid = true;
    const valueSize = this.getValueSize();
    if (valueSize - Math.floor(valueSize) !== 0) {
      console.error("invalid value size in track", this);
      valid = false;
    }
    const times = this.times;
    const values = this.values;
    const nKeys = times.length;
    if (nKeys === 0) {
      console.error("track is empty", this);
      valid = false;
    }
    let prevTime = null;
    for (let i = 0; i !== nKeys; i ++) {
      const currTime = times[ i ];
      if (typeof currTime === 'number' && isNaN(currTime)) {
        console.error("time is not a valid number", this, i, currTime);
        valid = false;
        break;
      }
      if (prevTime !== null && prevTime > currTime) {
        console.error("out of order keys", this, i, currTime, prevTime);
        valid = false;
        break;
      }
      prevTime = currTime;
    }
    if (values !== undefined) {
      if (AnimationUtils.isTypedArray(values)) {
        for (let i = 0, n = values.length; i !== n; ++ i) {
          const value = values[ i ];
          if (isNaN(value)) {
            console.error("value is not a valid number", this, i, value);
            valid = false;
            break;
          }
        }
      }
    }
    return valid;
  }
  // removes equivalent sequential keys as common in morph target sequences
  // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
  optimize(): any {
    const times = this.times;
    const values = this.values;
    const stride = this.getValueSize();
    const smoothInterpolation = this.getInterpolation() === InterpolateMode.Smooth;
    let writeIndex = 1;
    const lastIndex = times.length - 1;
    for (let i = 1; i < lastIndex; ++ i) {
      let keep = false;
      const time = times[ i ];
      const timeNext = times[ i + 1 ];
      // remove adjacent keyframes scheduled at the same time
      if (time !== timeNext && (i !== 1 || time !== time[ 0 ])) {
        if (! smoothInterpolation) {
          // remove unnecessary keyframes same as their neighbors
          const offset = i * stride;
          const offsetP = offset - stride;
          const offsetN = offset + stride;
          for (let j = 0; j !== stride; ++ j) {
            const value = values[ offset + j ];
            if (value !== values[ offsetP + j ] ||
                value !== values[ offsetN + j ]) {
              keep = true;
              break;
            }
          }
        } else keep = true;
      }
      // in-place compaction
      if (keep) {
        if (i !== writeIndex) {
          times[ writeIndex ] = times[ i ];
          const readOffset = i * stride;
          const writeOffset = writeIndex * stride;
          for (let j = 0; j !== stride; ++ j)
            values[ writeOffset + j ] = values[ readOffset + j ];
        }
        ++ writeIndex;
      }
    }
    // flush last keyframe (compaction looks ahead)
    if (lastIndex > 0) {
      times[ writeIndex ] = times[ lastIndex ];
      for (let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++ j)
        values[ writeOffset + j ] = values[ readOffset + j ];
      ++ writeIndex;
    }
    if (writeIndex !== times.length) {
      this.times = AnimationUtils.arraySlice(times, 0, writeIndex);
      this.values = AnimationUtils.arraySlice(values, 0, writeIndex * stride);
    }
    return this;
  }
}
