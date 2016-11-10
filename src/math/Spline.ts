import { Vector3 } from "./Vector3";
/**
 * Spline from Tween.js, slightly optimized (and trashed)
 * http://sole.github.com/tween.js/examples/05_spline.html
 *
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
export class Spline {
  points: any[];
  constructor(points: any[]) {
    this.points = points;
  }
  initFromArray(a: any[]): void {
    this.points = [];
    for (let i = 0; i < a.length; i ++) {
      this.points[i] = { x: a[i][0], y: a[i][1], z: a[i][2] };
    }
  }
  getPoint(k: number): any {
    const c = [], v3 = { x: 0, y: 0, z: 0 };
    let point, intPoint, weight, w2, w3,
    pa, pb, pc, pd;
    point = (this.points.length - 1) * k;
    intPoint = Math.floor(point);
    weight = point - intPoint;
    c[0] = intPoint === 0 ? intPoint : intPoint - 1;
    c[1] = intPoint;
    c[2] = intPoint  > this.points.length - 2 ? this.points.length - 1 : intPoint + 1;
    c[3] = intPoint  > this.points.length - 3 ? this.points.length - 1 : intPoint + 2;
    pa = this.points[c[0]];
    pb = this.points[c[1]];
    pc = this.points[c[2]];
    pd = this.points[c[3]];
    w2 = weight * weight;
    w3 = weight * w2;
    v3.x = Spline.interpolate(pa.x, pb.x, pc.x, pd.x, weight, w2, w3);
    v3.y = Spline.interpolate(pa.y, pb.y, pc.y, pd.y, weight, w2, w3);
    v3.z = Spline.interpolate(pa.z, pb.z, pc.z, pd.z, weight, w2, w3);
    return v3;
  }
  getControlPointsArray(): any[] {
    const l = this.points.length,
      coords = [];
    for (let i = 0; i < l; i ++) {
      const p = this.points[i];
      coords[i] = [ p.x, p.y, p.z ];
    }
    return coords;
  }
  // approximate length by summing linear segments
  getLength(nSubDivisions: number = 100): any {
    let oldIntPoint = 0;
    const oldPosition = new Vector3();
    const tmpVec = new Vector3();
    const chunkLengths = [];
    let totalLength = 0;
    // first point has 0 length
    chunkLengths[0] = 0;
    const nSamples = this.points.length * nSubDivisions;
    oldPosition.copy(this.points[0]);
    for (let i = 1; i < nSamples; i ++) {
      const index = i / nSamples;
      const position = this.getPoint(index);
      tmpVec.copy(position);
      totalLength += tmpVec.distanceTo(oldPosition);
      oldPosition.copy(position);
      const point = (this.points.length - 1) * index;
      const intPoint = Math.floor(point);
      if (intPoint !== oldIntPoint) {
        chunkLengths[intPoint] = totalLength;
        oldIntPoint = intPoint;
      }
    }
    // last point ends with total length
    chunkLengths[chunkLengths.length] = totalLength;
    return { chunks: chunkLengths, total: totalLength };
  }
  reparametrizeByArcLength(samplingCoef: number): void {
    const newpoints = [];
    const tmpVec = new Vector3();
    const sl = this.getLength();
    newpoints.push(tmpVec.copy(this.points[0]).clone());
    for (let i = 1; i < this.points.length; i ++) {
      //tmpVec.copy(this.points[i - 1]);
      //linearDistance = tmpVec.distanceTo(this.points[i]);
      const realDistance = sl.chunks[i] - sl.chunks[i - 1];
      const sampling = Math.ceil(samplingCoef * realDistance / sl.total);
      const indexCurrent = (i - 1) / (this.points.length - 1);
      const indexNext = i / (this.points.length - 1);
      for (let j = 1; j < sampling - 1; j ++) {
        const index = indexCurrent + j * (1 / sampling) * (indexNext - indexCurrent);
        const position = this.getPoint(index);
        newpoints.push(tmpVec.copy(position).clone());
      }
      newpoints.push(tmpVec.copy(this.points[i]).clone());
    }
    this.points = newpoints;
  }
  // Catmull-Rom
  static interpolate(p0: number, p1: number, p2: number, p3: number, t: number, t2: number, t3: number): number {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    return (2 * (p1 - p2) + v0 + v1) * t3 + (- 3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
  }
}
