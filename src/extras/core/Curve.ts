/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Extensible curve object
 *
 * Some common of Curve methods
 * .getPoint(t), getTangent(t)
 * .getPointAt(u), getTangentAt(u)
 * .getPoints(), .getSpacedPoints()
 * .getLength()
 * .updateArcLengths()
 *
 * This following classes subclasses THREE.Curve:
 *
 * -- 2d classes --
 * THREE.LineCurve
 * THREE.QuadraticBezierCurve
 * THREE.CubicBezierCurve
 * THREE.SplineCurve
 * THREE.ArcCurve
 * THREE.EllipseCurve
 *
 * -- 3d classes --
 * THREE.LineCurve3
 * THREE.QuadraticBezierCurve3
 * THREE.CubicBezierCurve3
 * THREE.SplineCurve3
 *
 * A series of curves can be represented as a THREE.CurvePath
 *
 **/
/**************************************************************
 *  Abstract Curve base class
 **************************************************************/
import { _Math } from "../../math/Math";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Matrix4 } from "../../math/Matrix4";
interface Vector {
  clone(): this;
  distanceTo(v: Vector): number;
  sub(v: Vector);
}
export class Curve<T extends Vector> {
  __arcLengthDivisions: any;
  cacheArcLengths: any;
  needsUpdate: boolean;
  // Virtual base class method to overwrite and implement in subclasses
  //  - t [0 .. 1]
  getPoint(t: number): T {
    console.warn("THREE.Curve: Warning, getPoint() not implemented!");
    return null;
  }
  // Get point at relative position in curve according to arc length
  // - u [0 .. 1]
  getPointAt(u: number): T {
    const t: number = this.getUtoTmapping(u);
    return this.getPoint(t);
  }
  // Get sequence of points using getPoint(t)
  getPoints(divisions: number = 5): T[] {
    const points: T[] = [];
    for (let d = 0; d <= divisions; d ++) {
      points.push(this.getPoint(d / divisions));
    }
    return points;
  }
  // Get sequence of points using getPointAt(u)
  getSpacedPoints(divisions: number = 5): T[] {
    const points: T[] = [];
    for (let d = 0; d <= divisions; d ++) {
      points.push(this.getPointAt(d / divisions));
    }
    return points;
  }
  // Get total curve arc length
  getLength(): number {
    const lengths = this.getLengths();
    return lengths[lengths.length - 1];
  }
  // Get list of cumulative segment lengths
  getLengths(divisions?: number): number[] {
    if (! divisions) divisions = (this.__arcLengthDivisions) ? (this.__arcLengthDivisions) : 200;
    if (this.cacheArcLengths
      && (this.cacheArcLengths.length === divisions + 1)
      && ! this.needsUpdate) {
      //console.log("cached", this.cacheArcLengths);
      return this.cacheArcLengths;
    }
    this.needsUpdate = false;
    const cache: number[] = [];
    let current: T;
    let last: T = this.getPoint(0);
    let sum: number = 0;
    cache.push(0);
    for (let p = 1; p <= divisions; p ++) {
      current = this.getPoint(p / divisions);
      sum += current.distanceTo(last);
      cache.push(sum);
      last = current;
    }
    this.cacheArcLengths = cache;
    return cache; // { sums: cache, sum:sum }; Sum is in the last element.
  }
  updateArcLengths(): void {
    this.needsUpdate = true;
    this.getLengths();
  }
  // Given u (0 .. 1), get a t to find p. This gives you points which are equidistant
  getUtoTmapping(u: number, distance?: number): number {
    const arcLengths = this.getLengths();
    let i = 0;
    const il = arcLengths.length;
    let targetArcLength; // The targeted u distance value to get
    if (distance) {
      targetArcLength = distance;
    } else {
      targetArcLength = u * arcLengths[il - 1];
    }
    //const time = Date.now();
    // binary search for the index with largest value smaller than target u distance
    let low = 0, high = il - 1, comparison;
    while (low <= high) {
      i = Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats
      comparison = arcLengths[i] - targetArcLength;
      if (comparison < 0) {
        low = i + 1;
      } else if (comparison > 0) {
        high = i - 1;
      } else {
        high = i;
        break;
        // DONE
      }
    }
    i = high;
    //console.log('b' , i, low, high, Date.now()- time);
    if (arcLengths[i] === targetArcLength) {
      const t = i / (il - 1);
      return t;
    }
    // we could get finer grain at lengths, or use simple interpolation between two points
    const lengthBefore = arcLengths[i];
    const lengthAfter = arcLengths[i + 1];
    const segmentLength = lengthAfter - lengthBefore;
    // determine where we are between the 'before' and 'after' points
    const segmentFraction = (targetArcLength - lengthBefore) / segmentLength;
    // add that fractional amount to t
    const t = (i + segmentFraction) / (il - 1);
    return t;
  }
  // Returns a unit vector tangent at t
  // In case any sub curve does not implement its tangent derivation,
  // 2 points a small delta apart will be used to find its gradient
  // which seems to give a reasonable approximation
  getTangent(t: number): T {
    const delta = 0.0001;
    let t1 = t - delta;
    let t2 = t + delta;
    // Capping in case of danger
    if (t1 < 0) t1 = 0;
    if (t2 > 1) t2 = 1;
    const pt1 = this.getPoint(t1);
    const pt2 = this.getPoint(t2);
    const vec = pt2.clone().sub(pt1);
    return vec.normalize();
  }
  getTangentAt(u: number): T {
    const t = this.getUtoTmapping(u);
    return this.getTangent(t);
  }
  computeFrenetFrames(segments, closed) {
    // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
    let normal = new Vector3();
    let tangents: Vector3[] = [];
    let normals: Vector3[] = [];
    let binormals: Vector3[] = [];
    let vec = new Vector3();
    let mat = new Matrix4();
    let i, u, theta;
    // compute the tangent vectors for each segment on the curve
    for (i = 0; i <= segments; i ++) {
      u = i / segments;
      tangents[ i ] = <any>this.getTangentAt(u);
      tangents[ i ].normalize();
    }
    // select an initial normal vector perpendicular to the first tangent vector,
    // and in the direction of the minimum tangent xyz component
    normals[ 0 ] = new Vector3();
    binormals[ 0 ] = new Vector3();
    let min = Number.MAX_VALUE;
    let tx = Math.abs(tangents[ 0 ].x);
    let ty = Math.abs(tangents[ 0 ].y);
    let tz = Math.abs(tangents[ 0 ].z);
    if (tx <= min) {
      min = tx;
      normal.set(1, 0, 0);
    }
    if (ty <= min) {
      min = ty;
      normal.set(0, 1, 0);
    }
    if (tz <= min) {
      normal.set(0, 0, 1);
    }
    vec.crossVectors(tangents[ 0 ], normal).normalize();
    normals[ 0 ].crossVectors(tangents[ 0 ], vec);
    binormals[ 0 ].crossVectors(tangents[ 0 ], normals[ 0 ]);
    // compute the slowly-varying normal and binormal vectors for each segment on the curve
    for (i = 1; i <= segments; i ++) {
      normals[ i ] = normals[ i - 1 ].clone();
      binormals[ i ] = binormals[ i - 1 ].clone();
      vec.crossVectors(tangents[ i - 1 ], tangents[ i ]);
      if (vec.length() > Number.EPSILON) {
        vec.normalize();
        theta = Math.acos(_Math.clamp(tangents[ i - 1 ].dot(tangents[ i ]), - 1, 1)); // clamp for floating pt errors
        normals[ i ].applyMatrix4(mat.makeRotationAxis(vec, theta));
      }
      binormals[ i ].crossVectors(tangents[ i ], normals[ i ]);
    }
    // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
    if (closed === true) {
      theta = Math.acos(_Math.clamp(normals[ 0 ].dot(normals[ segments ]), - 1, 1));
      theta /= segments;
      if (tangents[ 0 ].dot(vec.crossVectors(normals[ 0 ], normals[ segments ])) > 0) {
        theta = - theta;
      }
      for (i = 1; i <= segments; i ++) {
        // twist a little...
        normals[ i ].applyMatrix4(mat.makeRotationAxis(tangents[ i ], theta * i));
        binormals[ i ].crossVectors(tangents[ i ], normals[ i ]);
      }
    }
    return {
      tangents: tangents,
      normals: normals,
      binormals: binormals
    };
  }
  // TODO: Transformation for Curves?
  /**************************************************************
   *  3D Curves
   **************************************************************/
  // A Factory method for creating new curve subclasses
  static create(constructor: any, getPointFunc: (t: number) => Vector3): any {
    constructor.prototype = Object.create(Curve.prototype);
    constructor.prototype.constructor = constructor;
    constructor.prototype.getPoint = getPointFunc;
    return constructor;
  }
}
export class Curve2 extends Curve<Vector2> {}
export class Curve3 extends Curve<Vector3> {}
/*
// For computing of Frenet frames, exposing the tangents, normals and binormals the spline
static FrenetFrames = class {
  tangents: Vector3[];
  normals: Vector3[];
  binormals: Vector3[];
  constructor(path: Curve<Vector3>, segments: number, closed: boolean) {
    const normal = new Vector3();
    const tangents: Vector3[] = [];
    const normals: Vector3[] = [];
    const binormals: Vector3[] = [];
    const vec = new Vector3();
    const mat = new Matrix4();
    const numpoints = segments + 1;
    // expose internals
    this.tangents = tangents;
    this.normals = normals;
    this.binormals = binormals;
    // compute the tangent vectors for each segment on the path
    for (let i = 0; i < numpoints; i ++) {
      const u = i / (numpoints - 1);
      tangents[i] = path.getTangentAt(u);
      tangents[i].normalize();
    }
    initialNormal3();
    //function initialNormal1(lastBinormal) {
    //  // fixed start binormal. Has dangers of 0 vectors
    //  normals[0] = new THREE.Vector3();
    //  binormals[0] = new THREE.Vector3();
    //  if (lastBinormal===undefined) lastBinormal = new THREE.Vector3(0, 0, 1);
    //  normals[0].crossVectors(lastBinormal, tangents[0]).normalize();
    //  binormals[0].crossVectors(tangents[0], normals[0]).normalize();
    //}
    //function initialNormal2() {
    //  // This uses the Frenet-Serret formula for deriving binormal
    //  const t2 = path.getTangentAt(epsilon);
    //  normals[0] = new THREE.Vector3().subVectors(t2, tangents[0]).normalize();
    //  binormals[0] = new THREE.Vector3().crossVectors(tangents[0], normals[0]);
    //  normals[0].crossVectors(binormals[0], tangents[0]).normalize(); // last binormal x tangent
    //  binormals[0].crossVectors(tangents[0], normals[0]).normalize();
    //}
    function initialNormal3() {
      // select an initial normal vector perpendicular to the first tangent vector,
      // and in the direction of the smallest tangent xyz component
      normals[0] = new Vector3();
      binormals[0] = new Vector3();
      let smallest = Number.MAX_VALUE;
      const tx = Math.abs(tangents[0].x);
      const ty = Math.abs(tangents[0].y);
      const tz = Math.abs(tangents[0].z);
      if (tx <= smallest) {
        smallest = tx;
        normal.set(1, 0, 0);
      }
      if (ty <= smallest) {
        smallest = ty;
        normal.set(0, 1, 0);
      }
      if (tz <= smallest) {
        normal.set(0, 0, 1);
      }
      vec.crossVectors(tangents[0], normal).normalize();
      normals[0].crossVectors(tangents[0], vec);
      binormals[0].crossVectors(tangents[0], normals[0]);
    }
    // compute the slowly-varying normal and binormal vectors for each segment on the path
    for (let i = 1; i < numpoints; i ++) {
      normals[i] = normals[i - 1].clone();
      binormals[i] = binormals[i - 1].clone();
      vec.crossVectors(tangents[i - 1], tangents[i]);
      if (vec.length() > Number.EPSILON) {
        vec.normalize();
        const theta = Math.acos(_Math.clamp(tangents[i - 1].dot(tangents[i]), - 1, 1)); // clamp for floating pt errors
        normals[i].applyMatrix4(mat.makeRotationAxis(vec, theta));
      }
      binormals[i].crossVectors(tangents[i], normals[i]);
    }
    // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
    if (closed) {
      let theta = Math.acos(_Math.clamp(normals[0].dot(normals[numpoints - 1]), - 1, 1));
      theta /= (numpoints - 1);
      if (tangents[0].dot(vec.crossVectors(normals[0], normals[numpoints - 1])) > 0) {
        theta = - theta;
      }
      for (let i = 1; i < numpoints; i ++) {
        // twist a little...
        normals[i].applyMatrix4(mat.makeRotationAxis(tangents[i], theta * i));
        binormals[i].crossVectors(tangents[i], normals[i]);
      }
    }
  }
};
*/
