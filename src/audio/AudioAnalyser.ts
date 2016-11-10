/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Audio } from "./Audio";
export class AudioAnalyser {
  analyser: AnalyserNode;
  data: Uint8Array;
  constructor(audio: Audio, fftSize: number = 2048) {
    this.analyser = audio.context.createAnalyser();
    this.analyser.fftSize = fftSize;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    audio.getOutput().connect(this.analyser);
  }
  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.data);
    return this.data;
  }
  getAverageFrequency(): number {
    let value = 0;
    const data = this.getFrequencyData();
    for (let i = 0; i < data.length; i ++) {
      value += data[i];
    }
    return value / data.length;
  }
  getData(file: string): Uint8Array {
    console.warn("THREE.AudioAnalyser: .getData() is now .getFrequencyData().");
    return this.getFrequencyData();
  }
}
