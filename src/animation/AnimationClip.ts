///import { KeyframeTrack } from "./KeyframeTrack";
import { KeyframeTrackUtils } from "./KeyframeTrackUtils";
import { KeyframeTrack } from "./KeyframeTrack";
import { VectorKeyframeTrack } from "./tracks/VectorKeyframeTrack";
import { QuaternionKeyframeTrack } from "./tracks/QuaternionKeyframeTrack";
import { NumberKeyframeTrack } from "./tracks/NumberKeyframeTrack";
import { AnimationUtils } from "./AnimationUtils";
import { _Math } from "../math/Math";
import { Bone } from "../objects/Bone";
/**
 *
 * Reusable set of Tracks that represent an animation.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */
export class AnimationClip {
  name: string;
  tracks: KeyframeTrack[];
  duration: number;
  uuid: string;
  constructor(name: string, duration: number, tracks: KeyframeTrack[]) {
    this.name = name;
    this.tracks = tracks;
    this.duration = (duration !== undefined) ? duration : -1;
    this.uuid = _Math.generateUUID();
    // this means it should figure out its duration by scanning the tracks
    if (this.duration < 0) {
      this.resetDuration();
    }
    this.optimize();
  }
  resetDuration(): void {
    const tracks = this.tracks;
    let duration = 0;
    for (let i = 0, n = tracks.length; i !== n; ++ i) {
      const track = this.tracks[ i ];
      duration = Math.max(
          duration, track.times[ track.times.length - 1 ]);
    }
    this.duration = duration;
  }
  trim(): AnimationClip {
    for (let i = 0; i < this.tracks.length; i ++) {
      this.tracks[ i ].trim(0, this.duration);
    }
    return this;
  }
  optimize(): AnimationClip {
    for (let i = 0; i < this.tracks.length; i ++) {
      this.tracks[ i ].optimize();
    }
    return this;
  }
  // Static methods:
  static parse(json: any): any {
    const tracks = [],
      jsonTracks = json.tracks,
      frameTime = 1.0 / (json.fps || 1.0);
    for (let i = 0, n = jsonTracks.length; i !== n; ++ i) {
      tracks.push(KeyframeTrackUtils.parse(jsonTracks[ i ]).scale(frameTime));
    }
    return new AnimationClip(json.name, json.duration, tracks);
  }
  static toJSON(clip: AnimationClip): any {
    const tracks: any = [];
    const clipTracks = clip.tracks;
    const json = {
      'name': clip.name,
      'duration': clip.duration,
      'tracks': tracks
    };
    for (let i = 0, n = clipTracks.length; i !== n; ++ i) {
      tracks.push(KeyframeTrackUtils.toJSON(clipTracks[ i ]));
    }
    return json;
  }
  static CreateFromMorphTargetSequence(name: string, morphTargetSequence: any[], fps: number, noLoop: boolean): AnimationClip {
    const numMorphTargets = morphTargetSequence.length;
    const tracks = [];
    for (let i = 0; i < numMorphTargets; i ++) {
      let times = [];
      let values = [];
      times.push(
          (i + numMorphTargets - 1) % numMorphTargets,
          i,
          (i + 1) % numMorphTargets);
      values.push(0, 1, 0);
      const order = AnimationUtils.getKeyframeOrder(times);
      times = AnimationUtils.sortedArray(times, 1, order);
      values = AnimationUtils.sortedArray(values, 1, order);
      // if there is a key at the first frame, duplicate it as the
      // last frame as well for perfect loop.
      if (! noLoop && times[ 0 ] === 0) {
        times.push(numMorphTargets);
        values.push(values[ 0 ]);
      }
      tracks.push(
          new NumberKeyframeTrack(
            '.morphTargetInfluences[' + morphTargetSequence[ i ].name + ']',
            times, values
          ).scale(1.0 / fps));
    }
    return new AnimationClip(name, -1, tracks);
  }
  static findByName(objectOrClipArray: any, name: string): any {
    let clipArray = objectOrClipArray;
    if (! Array.isArray(objectOrClipArray)) {
      const o = objectOrClipArray;
      clipArray = o.geometry && o.geometry.animations || o.animations;
    }
    for (let i = 0; i < clipArray.length; i ++) {
      if (clipArray[ i ].name === name) {
        return clipArray[ i ];
      }
    }
    return null;
  }
  static CreateClipsFromMorphTargetSequences(morphTargets: any[], fps: number, noLoop?: boolean): AnimationClip[] {
    const animationToMorphTargets = {};
    // tested with https://regex101.com/ on trick sequences
    // such flamingo_flyA_003, flamingo_run1_003, crdeath0059
    const pattern: RegExp = /^([\w-]*?)([\d]+)$/;
    // sort morph target names into animation groups based
    // patterns like Walk_001, Walk_002, Run_001, Run_002
    for (let i = 0, il = morphTargets.length; i < il; i ++) {
      const morphTarget = morphTargets[ i ];
      const parts = morphTarget.name.match(pattern);
      if (parts && parts.length > 1) {
        const name = parts[ 1 ];
        let animationMorphTargets = animationToMorphTargets[ name ];
        if (! animationMorphTargets) {
          animationToMorphTargets[ name ] = animationMorphTargets = [];
        }
        animationMorphTargets.push(morphTarget);
      }
    }
    const clips: AnimationClip[] = [];
    for (let name in animationToMorphTargets) {
      clips.push(AnimationClip.CreateFromMorphTargetSequence(name, animationToMorphTargets[ name ], fps, noLoop));
    }
    return clips;
  }
  // parse the animation.hierarchy format
  static parseAnimation(animation: any, bones: Bone[]): AnimationClip {
    if (! animation) {
      console.error("  no animation in JSONLoader data");
      return null;
    }
    function addNonemptyTrack(trackType: any, trackName: string, animationKeys: any, propertyName: string, destTracks: any): void {
      // only return track if there are actually keys.
      if (animationKeys.length !== 0) {
        const times: any[] = [];
        const values: any[] = [];
        AnimationUtils.flattenJSON(
            animationKeys, times, values, propertyName);
        // empty keys are filtered out, so check again
        if (times.length !== 0) {
          destTracks.push(new trackType(trackName, times, values));
        }
      }
    }
    const tracks = [];
    const clipName = animation.name || 'default';
    // automatic length determination in AnimationClip.
    let duration = animation.length || -1;
    const fps = animation.fps || 30;
    const hierarchyTracks = animation.hierarchy || [];
    for (let h = 0; h < hierarchyTracks.length; h ++) {
      const animationKeys = hierarchyTracks[ h ].keys;
      // skip empty tracks
      if (! animationKeys || animationKeys.length === 0) continue;
      // process morph targets in a way exactly compatible
      // with AnimationHandler.init(animation)
      if (animationKeys[0].morphTargets) {
        // figure out all morph targets used in this track
        const morphTargetNames: any = {};
        let k;
        for (k = 0; k < animationKeys.length; k ++) {
          if (animationKeys[k].morphTargets) {
            for (let m = 0; m < animationKeys[k].morphTargets.length; m ++) {
              morphTargetNames[ animationKeys[k].morphTargets[m] ] = -1;
            }
          }
        }
        // create a track for each morph target with all zero
        // morphTargetInfluences except for the keys in which
        // the morphTarget is named.
        for (let morphTargetName in morphTargetNames) {
          let times = [];
          let values = [];
          for (let m = 0;
              m !== animationKeys[k].morphTargets.length; ++ m) {
            const animationKey = animationKeys[k];
            times.push(animationKey.time);
            values.push((animationKey.morphTarget === morphTargetName) ? 1 : 0);
          }
          tracks.push(new NumberKeyframeTrack(
              '.morphTargetInfluence[' + morphTargetName + ']', times, values));
        }
        duration = morphTargetNames.length * (fps || 1.0);
      } else {
        // ...assume skeletal animation
        const boneName = '.bones[' + bones[ h ].name + ']';
        addNonemptyTrack(
            VectorKeyframeTrack, boneName + '.position',
            animationKeys, 'pos', tracks);
        addNonemptyTrack(
            QuaternionKeyframeTrack, boneName + '.quaternion',
            animationKeys, 'rot', tracks);
        addNonemptyTrack(
            VectorKeyframeTrack, boneName + '.scale',
            animationKeys, 'scl', tracks);
      }
    }
    if (tracks.length === 0) {
      return null;
    }
    const clip = new AnimationClip(clipName, duration, tracks);
    return clip;
  }
}
