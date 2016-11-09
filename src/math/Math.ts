/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */
export class _Math {
  static DEG2RAD: number = Math.PI / 180;
  static RAD2DEG: number = 180 / Math.PI;
  private static generateUUID_chars: string[] = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  private static generateUUID_uuid: string[] = new Array(36);
  private static generateUUID_rnd: number = 0;
  static generateUUID(): string {
    const chars: string[] = _Math.generateUUID_chars;
    const uuid: string[] = _Math.generateUUID_uuid;
    for (let i = 0; i < 36; i ++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid[i] = '-';
      } else if (i === 14) {
        uuid[i] = '4';
      } else {
        let rnd: number = _Math.generateUUID_rnd;
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
        const r: number = rnd & 0xf;
        _Math.generateUUID_rnd = rnd >> 4;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  }
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
  // compute euclidian modulo of m % n
  // https://en.wikipedia.org/wiki/Modulo_operation
  static euclideanModulo(n: number, m: number): number {
    return ((n % m) + m) % m;
  }
  // Linear mapping from range <a1, a2> to range <b1, b2>
  static mapLinear(x: number, a1: number, a2: number, b1: number, b2: number): number {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
  }
  // https://en.wikipedia.org/wiki/Linear_interpolation
  static lerp(x: number, y: number, t: number): number {
    return (1 - t) * x + t * y;
  }
  // http://en.wikipedia.org/wiki/Smoothstep
  static smoothstep(x: number, min: number, max: number): number {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  }
  static smootherstep(x: number, min: number, max: number): number {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
  }
  static random16(): number {
    console.warn('THREE.Math.random16() has been deprecated. Use Math.random() instead.');
    return Math.random();
  }
  // Random integer from <low, high> interval
  static randInt(low: number, high: number): number {
    return low + Math.floor(Math.random() * (high - low + 1));
  }
  // Random float from <low, high> interval
  static randFloat(low: number, high: number): number {
    return low + Math.random() * (high - low);
  }
  // Random float from <-range/2, range/2> interval
  static randFloatSpread(range: number): number {
    return range * (0.5 - Math.random());
  }
  static degToRad(degrees: number): number {
    return degrees * _Math.DEG2RAD;
  }
  static radToDeg(radians: number): number {
    return radians * _Math.RAD2DEG;
  }
  static isPowerOfTwo(value: number): boolean {
    return (value & (value - 1)) === 0 && value !== 0;
  }
  static nearestPowerOfTwo(value: number): number {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
  }
  static nextPowerOfTwo(value: number): number {
    value --;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value ++;
    return value;
  }
}
