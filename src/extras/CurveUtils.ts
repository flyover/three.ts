/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */
export class CurveUtils {
  static tangentQuadraticBezier(t: number, p0: number, p1: number, p2: number): number {
    return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
  }
  // Puay Bing, thanks for helping with this derivative!
  static tangentCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    return - 3 * p0 * (1 - t) * (1 - t)  +
      3 * p1 * (1 - t) * (1 - t) - 6 * t * p1 * (1 - t) +
      6 * t *  p2 * (1 - t) - 3 * t * t * p2 +
      3 * t * t * p3;
  }
  static tangentSpline(t: number, p0: number, p1: number, p2: number, p3: number): number {
    // To check if my formulas are correct
    let h00 = 6 * t * t - 6 * t;   // derived from 2t^3 − 3t^2 + 1
    let h10 = 3 * t * t - 4 * t + 1; // t^3 − 2t^2 + t
    let h01 = - 6 * t * t + 6 * t;   // − 2t3 + 3t2
    let h11 = 3 * t * t - 2 * t;  // t3 − t2
    return h00 + h10 + h01 + h11;
  }
  // Catmull-Rom
  static interpolate(p0: number, p1: number, p2: number, p3: number, t: number): number {
    let v0 = (p2 - p0) * 0.5;
    let v1 = (p3 - p1) * 0.5;
    let t2 = t * t;
    let t3 = t * t2;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
  }
}
