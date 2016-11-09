/**
 * Controller class for the Timeliner GUI.
 *
 * Timeliner GUI library (required to use this class):
 *
 *     ./libs/timeliner_gui.min.js
 *
 * Source code:
 *
 *     https://github.com/tschw/timeliner_gui
 *     https://github.com/zz85/timeliner (fork's origin)
 *
 * @author tschw
 *
 */
import * as THREE from '../../src/Three';
export class TimelinerController {
  _scene;
  _trackInfo;
  _onUpdate;
  _mixer;
  _clip = null;
  _action = null;
  _tracks = {};
  _propRefs = {};
  _channelNames = [];
  constructor(scene, trackInfo, onUpdate) {
    this._scene = scene;
    this._trackInfo = trackInfo;
    this._onUpdate = onUpdate;
    this._mixer = new THREE.AnimationMixer(scene);
  }
  init(timeliner) {
    let tracks = [],
      trackInfo = this._trackInfo;
    for (let i = 0, n = trackInfo.length; i !== n; ++ i) {
      let spec = trackInfo[ i ];
      tracks.push(this._addTrack(
          spec.type, spec.propertyPath,
          spec.initialValue, spec.interpolation));
    }
    this._clip = new THREE.AnimationClip('editclip', 0, tracks);
    this._action = this._mixer.clipAction(this._clip).play();
  }
  setDisplayTime(time) {
    this._action.time = time;
    this._mixer.update(0);
    this._onUpdate();
  }
  setDuration(duration) {
    this._clip.duration = duration;
  }
  getChannelNames() {
    return this._channelNames;
  }
  getChannelKeyTimes(channelName) {
    return this._tracks[ channelName ].times;
  }
  setKeyframe(channelName, time) {
    let track = this._tracks[ channelName ],
      times = track.times,
      index = Timeliner.binarySearch(times, time),
      values = track.values,
      stride = track.getValueSize(),
      offset = index * stride;
    if (index < 0) {
      // insert new keyframe
      index = ~ index;
      offset = index * stride;
      let nTimes = times.length + 1,
        nValues = values.length + stride;
      for (let i = nTimes - 1; i !== index; -- i) {
        times[ i ] = times[ i - 1 ];
      }
      for (let i = nValues - 1,
          e = offset + stride - 1; i !== e; -- i) {
        values[ i ] = values[ i - stride ];
      }
    }
    times[ index ] = time;
    this._propRefs[ channelName ].getValue(values, offset);
  }
  delKeyframe(channelName, time) {
    let track = this._tracks[ channelName ],
      times = track.times,
      index = Timeliner.binarySearch(times, time);
    // we disallow to remove the keyframe when it is the last one we have,
    // since the animation system is designed to always produce a defined
    // state
    if (times.length > 1 && index >= 0) {
      let nTimes = times.length - 1,
        values = track.values,
        stride = track.getValueSize(),
        nValues = values.length - stride;
      // note: no track.getValueSize when array sizes are out of sync
      for (let i = index; i !== nTimes; ++ i) {
        times[ i ] = times[ i + 1 ];
      }
      times.pop();
      for (let offset = index * stride; offset !== nValues; ++ offset) {
        values[ offset ] = values[ offset + stride ];
      }
      values.length = nValues;
    }
  }
  moveKeyframe(channelName, time, delta, moveRemaining) {
    let track = this._tracks[ channelName ],
      times = track.times,
      index = Timeliner.binarySearch(times, time);
    if (index >= 0) {
      let endAt = moveRemaining ? times.length : index + 1,
        needsSort = times[ index - 1 ] <= time ||
          ! moveRemaining && time >= times[ index + 1 ];
      while (index !== endAt) times[ index ++ ] += delta;
      if (needsSort) this._sort(track);
    }
  }
  serialize() {
    let result = {
        duration: this._clip.duration,
        channels: {}
      },
      names = this._channelNames,
      tracks = this._tracks,
      channels = result.channels;
    for (let i = 0, n = names.length; i !== n; ++ i) {
      let name = names[ i ],
        track = tracks[ name ];
      channels[ name ] = {
        times: track.times,
        values: track.values
      };
    }
    return result;
  }
  deserialize(structs) {
    let names = this._channelNames,
      tracks = this._tracks,
      channels = structs.channels;
    this.setDuration(structs.duration);
    for (let i = 0, n = names.length; i !== n; ++ i) {
      let name = names[ i ],
        track = tracks[ name ],
        data = channels[ name ];
      this._setArray(track.times, data.times);
      this._setArray(track.values, data.values);
    }
    // update display
    this.setDisplayTime(this._mixer.time);
  }
  private _sort(track) {
    let times = track.times,
      order = THREE.AnimationUtils.getKeyframeOrder(times);
    this._setArray(times,
        THREE.AnimationUtils.sortedArray(times, 1, order));
    let values = track.values,
      stride = track.getValueSize();
    this._setArray(values,
        THREE.AnimationUtils.sortedArray(values, stride, order));
  }
  private _setArray(dst, src) {
    dst.length = 0;
    dst.push.apply(dst, src);
  }
  private _addTrack(type, prop, initialValue, interpolation) {
    let track = new type(
        prop, [ 0 ], initialValue, interpolation);
    // data must be in JS arrays so it can be resized
    track.times = Array.prototype.slice.call(track.times);
    track.values = Array.prototype.slice.call(track.values);
    this._channelNames.push(prop);
    this._tracks[ prop ] = track;
    // for recording the state:
    this._propRefs[ prop ] = new THREE.PropertyBinding(this._scene, prop);
    return track;
  }
}
