/*
 * @author zz85
 *
 * Experimenting of primitive geometry creation using Surface Parametric equations
 *
 */
import { Vector3 } from "../../src/math/Vector3";
import { ParametricGeometry } from "../../src/geometries/ParametricGeometry";
import { Curve } from "../../src/extras/core/Curve";
//export namespace ParametricGeometries {
export function klein(v: number, u: number): Vector3 {
  u *= Math.PI;
  v *= 2 * Math.PI;
  u = u * 2;
  let x, y, z;
  if (u < Math.PI) {
    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
    z = - 8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
  } else {
    x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
    z = - 8 * Math.sin(u);
  }
  y = - 2 * (1 - Math.cos(u) / 2) * Math.sin(v);
  return new Vector3(x, y, z);
}
export function plane(width: number, height: number): (u: number, v: number) => Vector3 {
  return function(u: number, v: number): Vector3 {
    const x = u * width;
    const y = 0;
    const z = v * height;
    return new Vector3(x, y, z);
  };
}
export function mobius(u: number, t: number): Vector3 {
  // flat mobius strip
  // http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
  u = u - 0.5;
  const v = 2 * Math.PI * t;
  let x, y, z;
  const a = 2;
  x = Math.cos(v) * (a + u * Math.cos(v / 2));
  y = Math.sin(v) * (a + u * Math.cos(v / 2));
  z = u * Math.sin(v / 2);
  return new Vector3(x, y, z);
}
export function mobius3d(u: number, t: number): Vector3 {
  // volumetric mobius strip
  u *= Math.PI;
  t *= 2 * Math.PI;
  u = u * 2;
  const phi = u / 2;
  const major = 2.25, a = 0.125, b = 0.65;
  let x, y, z;
  x = a * Math.cos(t) * Math.cos(phi) - b * Math.sin(t) * Math.sin(phi);
  z = a * Math.cos(t) * Math.sin(phi) + b * Math.sin(t) * Math.cos(phi);
  y = (major + x) * Math.sin(u);
  x = (major + x) * Math.cos(u);
  return new Vector3(x, y, z);
}
/*********************************************
 *
 * Parametric Replacement for TubeGeometry
 *
 *********************************************/
export class TubeGeometry extends ParametricGeometry {
  path: Curve<Vector3>;
  segments: number;
  radius: number;
  segmentsRadius: number;
  closed: boolean;
  //debug: Object3D;
  tangents: Vector3[];
  normals: Vector3[];
  binormals: Vector3[];
  constructor(path: Curve<Vector3>, segments: number = 64, radius: number = 1, segmentsRadius: number = 8, closed: boolean = false, debug: boolean = false) {
    ///if (debug) this.debug = new Object3D();
    const frames = path.computeFrenetFrames(segments, closed);
    // proxy internals
    function ParametricTube(u: number, v: number): Vector3 {
      v *= 2 * Math.PI;
      let i = u * segments;
      i = Math.floor(i);
      const pos = path.getPointAt(u);
      //const tangent = frames.tangents[ i ];
      const normal = frames.normals[ i ];
      const binormal = frames.binormals[ i ];
      ///if (scope.debug) {
      ///  scope.debug.add(new ArrowHelper(tangent, pos, radius, 0x0000ff));
      ///  scope.debug.add(new ArrowHelper(normal, pos, radius, 0xff0000));
      ///  scope.debug.add(new ArrowHelper(binormal, pos, radius, 0x00ff00));
      ///}
      const cx = - radius * Math.cos(v); // TODO: Hack: Negating it so it faces outside.
      const cy = radius * Math.sin(v);
      const pos2 = pos.clone();
      pos2.x += cx * normal.x + cy * binormal.x;
      pos2.y += cx * normal.y + cy * binormal.y;
      pos2.z += cx * normal.z + cy * binormal.z;
      return pos2;
    };
    super(ParametricTube, segments, segmentsRadius);
    this.path = path;
    this.segments = segments;
    this.radius = radius;
    this.segmentsRadius = segmentsRadius;
    this.closed = closed;
    this.tangents = frames.tangents;
    this.normals = frames.normals;
    this.binormals = frames.binormals;
  }
}
 /*********************************************
  *
  * Parametric Replacement for TorusKnotGeometry
  *
  *********************************************/
class TorusKnotCurve extends Curve<Vector3> {
  radius: number;
  p: number;
  q: number;
  constructor(radius: number, p: number, q: number) {
    super();
    this.radius = radius;
    this.p = p;
    this.q = q;
  }
  getPoint(t: number): Vector3 {
    const radius = this.radius;
    const p = this.p;
    const q = this.q;
    t *= Math.PI * 2;
    const r = 0.5;
    const tx = (1 + r * Math.cos(q * t)) * Math.cos(p * t),
      ty = (1 + r * Math.cos(q * t)) * Math.sin(p * t),
      tz = r * Math.sin(q * t);
    return new Vector3(tx, ty, tz).multiplyScalar(radius);
  }
}
export class TorusKnotGeometry extends TubeGeometry {
  tube: number;
  segmentsT: number;
  segmentsR: number;
  p: number;
  q: number;
  constructor(radius: number = 200, tube: number = 40, segmentsT: number = 64, segmentsR: number = 8, p: number = 2, q: number = 3) {
    const extrudePath = new TorusKnotCurve(radius, p, q);
    super(extrudePath, segmentsT, tube, segmentsR, true, false);
    this.radius = radius;
    this.tube = tube;
    this.segmentsT = segmentsT;
    this.segmentsR = segmentsR;
    this.p = p;
    this.q = q;
  }
}
 /*********************************************
  *
  * Parametric Replacement for SphereGeometry
  *
  *********************************************/
export class SphereGeometry extends ParametricGeometry {
  constructor(size: number, u: number, v: number) {
    function sphere(u: number, v: number): Vector3 {
      u *= Math.PI;
      v *= 2 * Math.PI;
      const x = size * Math.sin(u) * Math.cos(v);
      const y = size * Math.sin(u) * Math.sin(v);
      const z = size * Math.cos(u);
      return new Vector3(x, y, z);
    }
    super(sphere, u, v/*, ! true*/);
  }
}
 /*********************************************
  *
  * Parametric Replacement for PlaneGeometry
  *
  *********************************************/
export class PlaneGeometry extends ParametricGeometry {
  constructor(width: number, depth: number, segmentsWidth: number, segmentsDepth: number) {
    function plane(u: number, v: number): Vector3 {
      const x = u * width;
      const y = 0;
      const z = v * depth;
      return new Vector3(x, y, z);
    }
    super(plane, segmentsWidth, segmentsDepth);
  }
}
//}
