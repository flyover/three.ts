/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Vector3 } from "../math/Vector3";
import { Audio } from "./Audio";
import { AudioListener } from "./AudioListener";
export class PositionalAudio extends Audio {
  panner: PannerNode;
  constructor(listener: AudioListener) {
    super(listener);
    this.panner = this.context.createPanner();
    this.panner.connect(this.gain);
  }
  getOutput(): AudioNode {
    return this.panner;
  }
  getRefDistance(): number {
    return this.panner.refDistance;
  }
  setRefDistance(value: number): void {
    this.panner.refDistance = value;
  }
  getRolloffFactor(): number {
    return this.panner.rolloffFactor;
  }
  setRolloffFactor(value: number): void {
    this.panner.rolloffFactor = value;
  }
  getDistanceModel(): string {
    return this.panner.distanceModel;
  }
  setDistanceModel(value: string): void {
    this.panner.distanceModel = value as DistanceModelType;
  }
  getMaxDistance(): number {
    return this.panner.maxDistance;
  }
  setMaxDistance(value: number): void {
    this.panner.maxDistance = value;
  }
  updateMatrixWorld(force: boolean): void {
    const position = new Vector3();
    //return function updateMatrixWorld(force) {
      super.updateMatrixWorld(force);
      position.setFromMatrixPosition(this.matrixWorld);
      this.panner.setPosition(position.x, position.y, position.z);
    //};
  }
}
