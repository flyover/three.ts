/**
 * @author alteredq / http://alteredqualia.com/
 */
export class Clock {
  autoStart: boolean;
  startTime: number = 0;
  oldTime: number = 0;
  elapsedTime: number = 0;
  running: boolean = false;
  constructor(autoStart: boolean = true) {
    this.autoStart = autoStart;
  }
  start(): void {
    this.startTime = (performance || Date).now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }
  stop(): void {
    this.getElapsedTime();
    this.running = false;
  }
  getElapsedTime(): number {
    this.getDelta();
    return this.elapsedTime;
  }
  getDelta(): number {
    let diff: number = 0;
    if (this.autoStart && ! this.running) {
      this.start();
    }
    if (this.running) {
      const newTime: number = (performance || Date).now();
      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }
    return diff;
  }
}
