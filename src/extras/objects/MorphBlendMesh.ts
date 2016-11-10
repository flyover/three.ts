import { Mesh } from "../../objects/Mesh";
import { _Math } from "../../math/Math";
/**
 * @author alteredq / http://alteredqualia.com/
 */
export class MorphBlendMesh extends Mesh {
  firstAnimation: any;
  animationsMap: any;
  animationsList: any;
  constructor(geometry: any, material: any) {
    super(geometry, material);
    this.animationsMap = {};
    this.animationsList = [];
    // prepare default animation
    // (all frames played together in 1 second)
    let numFrames = this.geometry.morphTargets.length;
    let name = "__default";
    let startFrame = 0;
    let endFrame = numFrames - 1;
    let fps = numFrames / 1;
    this.createAnimation(name, startFrame, endFrame, fps);
    this.setAnimationWeight(name, 1);
  }
  createAnimation(name: string, start: number, end: number, fps: number): any {
    let animation = {
      start: start,
      end: end,
      length: end - start + 1,
      fps: fps,
      duration: (end - start) / fps,
      lastFrame: 0,
      currentFrame: 0,
      active: false,
      time: 0,
      direction: 1,
      weight: 1,
      directionBackwards: false,
      mirroredLoop: false
    };
    this.animationsMap[name] = animation;
    this.animationsList.push(animation);
  };
  autoCreateAnimations(fps: number) {
    let pattern = /([a-z]+)_?(\d+)/i;
    let firstAnimation, frameRanges = {};
    let geometry = this.geometry;
    for (let i = 0, il = geometry.morphTargets.length; i < il; i ++) {
      let morph = geometry.morphTargets[i];
      let chunks = morph.name.match(pattern);
      if (chunks && chunks.length > 1) {
        let name = chunks[1];
        if (! frameRanges[name]) frameRanges[name] = { start: Infinity, end: - Infinity };
        let range = frameRanges[name];
        if (i < range.start) range.start = i;
        if (i > range.end) range.end = i;
        if (! firstAnimation) firstAnimation = name;
      }
    }
    for (let name in frameRanges) {
      let range = frameRanges[name];
      this.createAnimation(name, range.start, range.end, fps);
    }
    this.firstAnimation = firstAnimation;
  }
  setAnimationDirectionForward(name: string) {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.direction = 1;
      animation.directionBackwards = false;
    }
  }
  setAnimationDirectionBackward(name: string) {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.direction = - 1;
      animation.directionBackwards = true;
    }
  }
  setAnimationFPS(name: string, fps: number) {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.fps = fps;
      animation.duration = (animation.end - animation.start) / animation.fps;
    }
  }
  setAnimationDuration(name: string, duration: number) {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.duration = duration;
      animation.fps = (animation.end - animation.start) / animation.duration;
    }
  }
  setAnimationWeight(name: string, weight: number) {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.weight = weight;
    }
  }
  setAnimationTime(name: string, time: number) {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.time = time;
    }
  };
  getAnimationTime(name: string): number {
    let time = 0;
    let animation = this.animationsMap[name];
    if (animation) {
      time = animation.time;
    }
    return time;
  }
  getAnimationDuration(name: string): number {
    let duration = - 1;
    let animation = this.animationsMap[name];
    if (animation) {
      duration = animation.duration;
    }
    return duration;
  }
  playAnimation(name: string): void {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.time = 0;
      animation.active = true;
    } else {
      console.warn("THREE.MorphBlendMesh: animation[" + name + "] undefined in .playAnimation()");
    }
  }
  stopAnimation(name: string): void {
    let animation = this.animationsMap[name];
    if (animation) {
      animation.active = false;
    }
  }
  update(delta: number): void {
    for (let i = 0, il = this.animationsList.length; i < il; i ++) {
      let animation = this.animationsList[i];
      if (! animation.active) continue;
      let frameTime = animation.duration / animation.length;
      animation.time += animation.direction * delta;
      if (animation.mirroredLoop) {
        if (animation.time > animation.duration || animation.time < 0) {
          animation.direction *= - 1;
          if (animation.time > animation.duration) {
            animation.time = animation.duration;
            animation.directionBackwards = true;
          }
          if (animation.time < 0) {
            animation.time = 0;
            animation.directionBackwards = false;
          }
        }
      } else {
        animation.time = animation.time % animation.duration;
        if (animation.time < 0) animation.time += animation.duration;
      }
      let keyframe = animation.start + _Math.clamp(Math.floor(animation.time / frameTime), 0, animation.length - 1);
      let weight = animation.weight;
      if (keyframe !== animation.currentFrame) {
        this.morphTargetInfluences[animation.lastFrame] = 0;
        this.morphTargetInfluences[animation.currentFrame] = 1 * weight;
        this.morphTargetInfluences[keyframe] = 0;
        animation.lastFrame = animation.currentFrame;
        animation.currentFrame = keyframe;
      }
      let mix = (animation.time % frameTime) / frameTime;
      if (animation.directionBackwards) mix = 1 - mix;
      if (animation.currentFrame !== animation.lastFrame) {
        this.morphTargetInfluences[animation.currentFrame] = mix * weight;
        this.morphTargetInfluences[animation.lastFrame] = (1 - mix) * weight;
      } else {
        this.morphTargetInfluences[animation.currentFrame] = weight;
      }
    }
  };
}
