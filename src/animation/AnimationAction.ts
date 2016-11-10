import { EndingMode, LoopMode } from "../constants";
/**
 *
 * Action provided by AnimationMixer for scheduling clip playback on specific
 * objects.
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 *
 */
export class AnimationAction {
  private _mixer: any;
  private _clip: any;
  private _localRoot: any;
  private _interpolantSettings: any;
  private _interpolants: any;
  private _propertyBindings: any;
  private _cacheIndex: any;
  private _byClipCacheIndex: any;
  private _timeScaleInterpolant: any;
  private _weightInterpolant: any;
  loop: LoopMode;
  private _loopCount: any;
  private _startTime: any;
  time: any;
  timeScale: any;
  private _effectiveTimeScale: any;
  weight: any;
  private _effectiveWeight: any;
  repetitions: any;
  paused: any;
  enabled: any;
  clampWhenFinished: any;
  zeroSlopeAtStart: any;
  zeroSlopeAtEnd: any;
  loopCount: any;
  constructor(mixer: any, clip: any, localRoot: any) {
    this._mixer = mixer;
    this._clip = clip;
    this._localRoot = localRoot || null;
    let tracks = clip.tracks,
      nTracks = tracks.length,
      interpolants = new Array(nTracks);
    let interpolantSettings = {
        endingStart:   EndingMode.ZeroCurvature,
        endingEnd:    EndingMode.ZeroCurvature
    };
    for (let i = 0; i !== nTracks; ++ i) {
      let interpolant = tracks[ i ].createInterpolant(null);
      interpolants[ i ] = interpolant;
      interpolant.settings = interpolantSettings;
    }
    this._interpolantSettings = interpolantSettings;
    this._interpolants = interpolants;  // bound by the mixer
    // inside: PropertyMixer (managed by the mixer)
    this._propertyBindings = new Array(nTracks);
    this._cacheIndex = null;      // for the memory manager
    this._byClipCacheIndex = null;    // for the memory manager
    this._timeScaleInterpolant = null;
    this._weightInterpolant = null;
    this.loop = LoopMode.Repeat;
    this._loopCount = -1;
    // global mixer time when the action is to be started
    // it's set back to 'null' upon start of the action
    this._startTime = null;
    // scaled local time of the action
    // gets clamped or wrapped to 0..clip.duration according to loop
    this.time = 0;
    this.timeScale = 1;
    this._effectiveTimeScale = 1;
    this.weight = 1;
    this._effectiveWeight = 1;
    this.repetitions = Infinity;     // no. of repetitions when looping
    this.paused = false;        // false -> zero effective time scale
    this.enabled = true;        // true -> zero effective weight
    this.clampWhenFinished   = false;  // keep feeding the last frame?
    this.zeroSlopeAtStart   = true;    // for smooth interpolation w/o separate
    this.zeroSlopeAtEnd    = true;    // clips for start, loop and end
  }
  // State & Scheduling
  play() {
    this._mixer._activateAction(this);
    return this;
  }
  stop() {
    this._mixer._deactivateAction(this);
    return this.reset();
  }
  reset() {
    this.paused = false;
    this.enabled = true;
    this.time = 0;      // restart clip
    this._loopCount = -1;  // forget previous loops
    this._startTime = null;  // forget scheduling
    return this.stopFading().stopWarping();
  }
  isRunning() {
    return this.enabled && ! this.paused && this.timeScale !== 0 &&
        this._startTime === null && this._mixer._isActiveAction(this);
  }
  // return true when play has been called
  isScheduled() {
    return this._mixer._isActiveAction(this);
  }
  startAt(time: number): AnimationAction {
    this._startTime = time;
    return this;
  }
  setLoop(mode: any, repetitions: number): AnimationAction {
    this.loop = mode;
    this.repetitions = repetitions;
    return this;
  }
  // Weight
  // set the weight stopping any scheduled fading
  // although .enabled = false yields an effective weight of zero, this
  // method does *not* change .enabled, because it would be confusing
  setEffectiveWeight(weight: number): AnimationAction {
    this.weight = weight;
    // note: same logic as when updated at runtime
    this._effectiveWeight = this.enabled ? weight : 0;
    return this.stopFading();
  }
  // return the weight considering fading and .enabled
  getEffectiveWeight(): number {
    return this._effectiveWeight;
  }
  fadeIn(duration: number): AnimationAction {
    return this._scheduleFading(duration, 0, 1);
  }
  fadeOut(duration: number): AnimationAction {
    return this._scheduleFading(duration, 1, 0);
  }
  crossFadeFrom(fadeOutAction: any, duration: number, warp: boolean): AnimationAction {
    fadeOutAction.fadeOut(duration);
    this.fadeIn(duration);
    if (warp) {
      let fadeInDuration = this._clip.duration,
        fadeOutDuration = fadeOutAction._clip.duration,
        startEndRatio = fadeOutDuration / fadeInDuration,
        endStartRatio = fadeInDuration / fadeOutDuration;
      fadeOutAction.warp(1.0, startEndRatio, duration);
      this.warp(endStartRatio, 1.0, duration);
    }
    return this;
  }
  crossFadeTo(fadeInAction: any, duration: number, warp: boolean): AnimationAction {
    return fadeInAction.crossFadeFrom(this, duration, warp);
  }
  stopFading(): AnimationAction {
    let weightInterpolant = this._weightInterpolant;
    if (weightInterpolant !== null) {
      this._weightInterpolant = null;
      this._mixer._takeBackControlInterpolant(weightInterpolant);
    }
    return this;
  }
  // Time Scale Control
  // set the weight stopping any scheduled warping
  // although .paused = true yields an effective time scale of zero, this
  // method does *not* change .paused, because it would be confusing
  setEffectiveTimeScale(timeScale: number): AnimationAction {
    this.timeScale = timeScale;
    this._effectiveTimeScale = this.paused ? 0 : timeScale;
    return this.stopWarping();
  }
  // return the time scale considering warping and .paused
  getEffectiveTimeScale(): number {
    return this._effectiveTimeScale;
  }
  setDuration(duration: number): AnimationAction {
    this.timeScale = this._clip.duration / duration;
    return this.stopWarping();
  }
  syncWith(action: any): AnimationAction {
    this.time = action.time;
    this.timeScale = action.timeScale;
    return this.stopWarping();
  }
  halt(duration: number): AnimationAction {
    return this.warp(this._effectiveTimeScale, 0, duration);
  }
  warp(startTimeScale: number, endTimeScale: number, duration: number): AnimationAction {
    let mixer = this._mixer, now = mixer.time,
      interpolant = this._timeScaleInterpolant,
      timeScale = this.timeScale;
    if (interpolant === null) {
      interpolant = mixer._lendControlInterpolant(),
      this._timeScaleInterpolant = interpolant;
    }
    let times = interpolant.parameterPositions,
      values = interpolant.sampleValues;
    times[ 0 ] = now;
    times[ 1 ] = now + duration;
    values[ 0 ] = startTimeScale / timeScale;
    values[ 1 ] = endTimeScale / timeScale;
    return this;
  }
  stopWarping(): AnimationAction {
    let timeScaleInterpolant = this._timeScaleInterpolant;
    if (timeScaleInterpolant !== null) {
      this._timeScaleInterpolant = null;
      this._mixer._takeBackControlInterpolant(timeScaleInterpolant);
    }
    return this;
  }
  // Object Accessors
  getMixer() {
    return this._mixer;
  }
  getClip() {
    return this._clip;
  }
  getRoot() {
    return this._localRoot || this._mixer._root;
  }
  // Interna
  _update(time: number, deltaTime: number, timeDirection: number, accuIndex: number) {
    // called by the mixer
    let startTime = this._startTime;
    if (startTime !== null) {
      // check for scheduled start of action
      let timeRunning = (time - startTime) * timeDirection;
      if (timeRunning < 0 || timeDirection === 0) {
        return; // yet to come / don't decide when delta = 0
      }
      // start
      this._startTime = null; // unschedule
      deltaTime = timeDirection * timeRunning;
    }
    // apply time scale and advance time
    deltaTime *= this._updateTimeScale(time);
    let clipTime = this._updateTime(deltaTime);
    // note: _updateTime may disable the action resulting in
    // an effective weight of 0
    let weight = this._updateWeight(time);
    if (weight > 0) {
      let interpolants = this._interpolants;
      let propertyMixers = this._propertyBindings;
      for (let j = 0, m = interpolants.length; j !== m; ++ j) {
        interpolants[ j ].evaluate(clipTime);
        propertyMixers[ j ].accumulate(accuIndex, weight);
      }
    }
  }
  private _updateWeight(time: number) {
    let weight = 0;
    if (this.enabled) {
      weight = this.weight;
      let interpolant = this._weightInterpolant;
      if (interpolant !== null) {
        let interpolantValue = interpolant.evaluate(time)[ 0 ];
        weight *= interpolantValue;
        if (time > interpolant.parameterPositions[ 1 ]) {
          this.stopFading();
          if (interpolantValue === 0) {
            // faded out, disable
            this.enabled = false;
          }
        }
      }
    }
    this._effectiveWeight = weight;
    return weight;
  }
  private _updateTimeScale(time: number) {
    let timeScale = 0;
    if (! this.paused) {
      timeScale = this.timeScale;
      let interpolant = this._timeScaleInterpolant;
      if (interpolant !== null) {
        let interpolantValue = interpolant.evaluate(time)[ 0 ];
        timeScale *= interpolantValue;
        if (time > interpolant.parameterPositions[ 1 ]) {
          this.stopWarping();
          if (timeScale === 0) {
            // motion has halted, pause
            this.paused = true;
          } else {
            // warp done - apply final time scale
            this.timeScale = timeScale;
          }
        }
      }
    }
    this._effectiveTimeScale = timeScale;
    return timeScale;
  }
  private _updateTime(deltaTime: number) {
    let time = this.time + deltaTime;
    if (deltaTime === 0) return time;
    let duration = this._clip.duration,
      loop = this.loop,
      loopCount = this._loopCount;
    if (loop === LoopMode.Once) {
      if (loopCount === -1) {
        // just started
        this.loopCount = 0;
        this._setEndings(true, true, false);
      }
      handle_stop: {
        if (time >= duration) {
          time = duration;
        } else if (time < 0) {
          time = 0;
        } else break handle_stop;
        if (this.clampWhenFinished) this.paused = true;
        else this.enabled = false;
        this._mixer.dispatchEvent({
          type: 'finished', action: this,
          direction: deltaTime < 0 ? -1 : 1
        });
      }
    } else { // repetitive Repeat or PingPong
      let pingPong = (loop === LoopMode.PingPong);
      if (loopCount === -1) {
        // just started
        if (deltaTime >= 0) {
          loopCount = 0;
          this._setEndings(
              true, this.repetitions === 0, pingPong);
        } else {
          // when looping in reverse direction, the initial
          // transition through zero counts as a repetition,
          // so leave loopCount at -1
          this._setEndings(
              this.repetitions === 0, true, pingPong);
        }
      }
      if (time >= duration || time < 0) {
        // wrap around
        let loopDelta = Math.floor(time / duration); // signed
        time -= duration * loopDelta;
        loopCount += Math.abs(loopDelta);
        let pending = this.repetitions - loopCount;
        if (pending < 0) {
          // have to stop (switch state, clamp time, fire event)
          if (this.clampWhenFinished) this.paused = true;
          else this.enabled = false;
          time = deltaTime > 0 ? duration : 0;
          this._mixer.dispatchEvent({
            type: 'finished', action: this,
            direction: deltaTime > 0 ? 1 : -1
          });
        } else {
          // keep running
          if (pending === 0) {
            // entering the last round
            let atStart = deltaTime < 0;
            this._setEndings(atStart, ! atStart, pingPong);
          } else {
            this._setEndings(false, false, pingPong);
          }
          this._loopCount = loopCount;
          this._mixer.dispatchEvent({
            type: 'loop', action: this, loopDelta: loopDelta
          });
        }
      }
      if (pingPong && (loopCount & 1) === 1) {
        // invert time for the "pong round"
        this.time = time;
        return duration - time;
      }
    }
    this.time = time;
    return time;
  }
  private _setEndings(atStart: boolean, atEnd: boolean, pingPong: boolean) {
    let settings = this._interpolantSettings;
    if (pingPong) {
      settings.endingStart   = EndingMode.ZeroSlope;
      settings.endingEnd    = EndingMode.ZeroSlope;
    } else {
      // assuming for LoopMode.Once atStart == atEnd == true
      if (atStart) {
        settings.endingStart = this.zeroSlopeAtStart ?
            EndingMode.ZeroSlope : EndingMode.ZeroCurvature;
      } else {
        settings.endingStart = EndingMode.WrapAround;
      }
      if (atEnd) {
        settings.endingEnd = this.zeroSlopeAtEnd ?
            EndingMode.ZeroSlope : EndingMode.ZeroCurvature;
      } else {
        settings.endingEnd    = EndingMode.WrapAround;
      }
    }
  }
  private _scheduleFading(duration: number, weightNow: number, weightThen: number) {
    let mixer = this._mixer, now = mixer.time,
      interpolant = this._weightInterpolant;
    if (interpolant === null) {
      interpolant = mixer._lendControlInterpolant(),
      this._weightInterpolant = interpolant;
    }
    let times = interpolant.parameterPositions,
      values = interpolant.sampleValues;
    times[ 0 ] = now;         values[ 0 ] = weightNow;
    times[ 1 ] = now + duration;  values[ 1 ] = weightThen;
    return this;
  }
}
