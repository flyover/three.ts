/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";
import { Object3D } from "../core/Object3D";
import { getAudioContext } from "./AudioContext";
export class AudioListener extends Object3D {
  context: AudioContext;
  gain: GainNode;
  filter: AudioNode;
  constructor() {
    super();
    this.type = 'AudioListener';
    this.context = getAudioContext();
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
    this.filter = null;
  }
  getInput(): GainNode {
    return this.gain;
  }
  removeFilter(): void {
    if (this.filter !== null) {
      this.gain.disconnect(this.filter);
      this.filter.disconnect(this.context.destination);
      this.gain.connect(this.context.destination);
      this.filter = null;
    }
  }
  getFilter(): AudioNode {
    return this.filter;
  }
  setFilter(value: AudioNode): void {
    if (this.filter !== null) {
      this.gain.disconnect(this.filter);
      this.filter.disconnect(this.context.destination);
    } else {
      this.gain.disconnect(this.context.destination);
    }
    this.filter = value;
    this.gain.connect(this.filter);
    this.filter.connect(this.context.destination);
  }
  getMasterVolume(): number {
    return this.gain.gain.value;
  }
  setMasterVolume(value: number): void {
    this.gain.gain.value = value;
  }
  updateMatrixWorld(force: boolean): void {
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    const orientation = new Vector3();
    //return function updateMatrixWorld(force) {
      super.updateMatrixWorld(force);
      const listener = this.context.listener;
      const up = this.up;
      this.matrixWorld.decompose(position, quaternion, scale);
      orientation.set(0, 0, - 1).applyQuaternion(quaternion);
      listener.setPosition(position.x, position.y, position.z);
      listener.setOrientation(orientation.x, orientation.y, orientation.z, up.x, up.y, up.z);
    //};
  }
}
