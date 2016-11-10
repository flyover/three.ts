/**
 * @author mrdoob / http://mrdoob.com/
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */
import { Object3D } from "../core/Object3D";
import { AudioListener } from "./AudioListener";
import { AudioLoader } from "../loaders/AudioLoader";
export class Audio extends Object3D {
  context: AudioContext;
  source: AudioBufferSourceNode;
  gain: GainNode;
  autoplay: boolean = false;
  startTime: number = 0;
  playbackRate: number = 1;
  isPlaying: boolean = false;
  hasPlaybackControl: boolean = true;
  sourceType: string = 'empty';
  filters: AudioNode[] = [];
  constructor(listener: AudioListener) {
    super();
    this.type = 'Audio';
    this.context = listener.context;
    this.source = this.context.createBufferSource();
    this.source.onended = this.onEnded.bind(this);
    this.gain = this.context.createGain();
    this.gain.connect(listener.getInput());
  }
  getOutput(): AudioNode {
    return this.gain;
  }
  setNodeSource(audioNode: AudioBufferSourceNode): Audio {
    this.hasPlaybackControl = false;
    this.sourceType = 'audioNode';
    this.source = audioNode;
    this.connect();
    return this;
  }
  setBuffer(audioBuffer: AudioBuffer): Audio {
    this.source.buffer = audioBuffer;
    this.sourceType = 'buffer';
    if (this.autoplay) this.play();
    return this;
  }
  play(): Audio {
    if (this.isPlaying === true) {
      console.warn('THREE.Audio: Audio is already playing.');
      return this;
    }
    if (this.hasPlaybackControl === false) {
      console.warn('THREE.Audio: this Audio has no playback control.');
      return this;
    }
    const source = this.context.createBufferSource();
    source.buffer = this.source.buffer;
    source.loop = this.source.loop;
    source.onended = this.source.onended;
    source.start(0, this.startTime);
    source.playbackRate.value = this.playbackRate;
    this.isPlaying = true;
    this.source = source;
    return this.connect();
  }
  pause(): Audio {
    if (this.hasPlaybackControl === false) {
      console.warn('THREE.Audio: this Audio has no playback control.');
      return this;
    }
    this.source.stop();
    this.startTime = this.context.currentTime;
    this.isPlaying = false;
    return this;
  }
  stop(): Audio {
    if (this.hasPlaybackControl === false) {
      console.warn('THREE.Audio: this Audio has no playback control.');
      return this;
    }
    this.source.stop();
    this.startTime = 0;
    this.isPlaying = false;
    return this;
  }
  connect(): Audio {
    if (this.filters.length > 0) {
      this.source.connect(this.filters[0]);
      for (let i = 1, l = this.filters.length; i < l; i ++) {
        this.filters[i - 1].connect(this.filters[i]);
      }
      this.filters[this.filters.length - 1].connect(this.getOutput());
    } else {
      this.source.connect(this.getOutput());
    }
    return this;
  }
  disconnect(): Audio {
    if (this.filters.length > 0) {
      this.source.disconnect(this.filters[0]);
      for (let i = 1, l = this.filters.length; i < l; i ++) {
        this.filters[i - 1].disconnect(this.filters[i]);
      }
      this.filters[this.filters.length - 1].disconnect(this.getOutput());
    } else {
      this.source.disconnect(this.getOutput());
    }
    return this;
  }
  getFilters(): AudioNode[] {
    return this.filters;
  }
  setFilters(value: AudioNode[] = []): Audio {
    if (this.isPlaying === true) {
      this.disconnect();
      this.filters = value;
      this.connect();
    } else {
      this.filters = value;
    }
    return this;
  }
  getFilter(): AudioNode {
    return this.getFilters()[0];
  }
  setFilter(filter: AudioNode): Audio {
    return this.setFilters(filter ? [ filter ] : []);
  }
  setPlaybackRate(value: number): Audio {
    if (this.hasPlaybackControl === false) {
      console.warn('THREE.Audio: this Audio has no playback control.');
      return this;
    }
    this.playbackRate = value;
    if (this.isPlaying === true) {
      this.source.playbackRate.value = this.playbackRate;
    }
    return this;
  }
  getPlaybackRate(): number {
    return this.playbackRate;
  }
  onEnded(): void {
    this.isPlaying = false;
  }
  getLoop(): boolean {
    if (this.hasPlaybackControl === false) {
      console.warn('THREE.Audio: this Audio has no playback control.');
      return false;
    }
    return this.source.loop;
  }
  setLoop(value: boolean): void {
    if (this.hasPlaybackControl === false) {
      console.warn('THREE.Audio: this Audio has no playback control.');
      return;
    }
    this.source.loop = value;
  }
  getVolume(): number {
    return this.gain.gain.value;
  }
  setVolume(value: number): Audio {
    this.gain.gain.value = value;
    return this;
  }
  load(file: string): Audio {
    console.warn("THREE.Audio: .load has been deprecated. Please use THREE.AudioLoader.");
    const scope: Audio = this;
    const audioLoader: AudioLoader = new AudioLoader();
    audioLoader.load(file, function(buffer: AudioBuffer): void {
      scope.setBuffer(buffer);
    });
    return this;
  }
}
