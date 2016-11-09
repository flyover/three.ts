/*
 * A bunch of parametric curves
 * @author zz85
 *
 * Formulas collected from various sources
 *  http://mathworld.wolfram.com/HeartCurve.html
 *  http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page6.html
 *  http://en.wikipedia.org/wiki/Viviani%27s_curve
 *  http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page4.html
 *  http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 *  http://prideout.net/blog/?p=44
 */
import { Vector3 } from "../../src/math/Vector3";
import { Curve } from "../../src/extras/core/Curve";
// Lets define some curves
//export namespace Curves {
export class GrannyKnot extends Curve<Vector3> {
  getPoint(t: number): Vector3 {
    t = 2 * Math.PI * t;
    const x = - 0.22 * Math.cos(t) - 1.28 * Math.sin(t) - 0.44 * Math.cos(3 * t) - 0.78 * Math.sin(3 * t);
    const y = - 0.1 * Math.cos(2 * t) - 0.27 * Math.sin(2 * t) + 0.38 * Math.cos(4 * t) + 0.46 * Math.sin(4 * t);
    const z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t);
    return new Vector3(x, y, z).multiplyScalar(20);
  }
}
export class HeartCurve extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 5) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    t *= 2 * Math.PI;
    const tx = 16 * Math.pow(Math.sin(t), 3);
    const ty = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t), tz = 0;
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}
// Viviani's Curve
export class VivianiCurve extends Curve<Vector3> {
  radius: number;
  constructor(radius: number) {
    super();
    this.radius = radius;
  }
  getPoint(t: number): Vector3 {
    t = t * 4 * Math.PI; // Normalized to 0..1
    const a = this.radius / 2;
    const tx = a * (1 + Math.cos(t)),
      ty = a * Math.sin(t),
      tz = 2 * a * Math.sin(t / 2);
    return new Vector3(tx, ty, tz);
  }
}
export class KnotCurve extends Curve<Vector3> {
  getPoint(t: number): Vector3 {
    t *= 2 * Math.PI;
    const R = 10;
    const s = 50;
    const tx = s * Math.sin(t),
      ty = Math.cos(t) * (R + s * Math.cos(t)),
      tz = Math.sin(t) * (R + s * Math.cos(t));
    return new Vector3(tx, ty, tz);
  }
}
export class HelixCurve extends Curve<Vector3> {
  getPoint(t: number): Vector3 {
    const a = 30; // radius
    const b = 150; //height
    const t2 = 2 * Math.PI * t * b / 30;
    const tx = Math.cos(t2) * a,
      ty = Math.sin(t2) * a,
      tz = b * t;
    return new Vector3(tx, ty, tz);
  }
}
export class TrefoilKnot extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 10) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    t *= Math.PI * 2;
    const tx = (2 + Math.cos(3 * t)) * Math.cos(2 * t),
      ty = (2 + Math.cos(3 * t)) * Math.sin(2 * t),
      tz = Math.sin(3 * t);
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}
export class TorusKnot extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 10) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    const p = 3,
      q = 4;
    t *= Math.PI * 2;
    const tx = (2 + Math.cos(q * t)) * Math.cos(p * t),
      ty = (2 + Math.cos(q * t)) * Math.sin(p * t),
      tz = Math.sin(q * t);
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}
export class CinquefoilKnot extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 10) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    const p = 2,
      q = 5;
    t *= Math.PI * 2;
    const tx = (2 + Math.cos(q * t)) * Math.cos(p * t),
      ty = (2 + Math.cos(q * t)) * Math.sin(p * t),
      tz = Math.sin(q * t);
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}
export class TrefoilPolynomialKnot extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 10) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    t = t * 4 - 2;
    const tx = Math.pow(t, 3) - 3 * t,
      ty = Math.pow(t, 4) - 4 * t * t,
      tz = 1 / 5 * Math.pow(t, 5) - 2 * t;
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}
// const scaleTo = function(x, y) {
//   const r = y - x;
//   return function(t) {
//     t * r + x;
//   };
// }
const scaleTo = function(x: number, y: number, t: number): number {
  const r: number = y - x;
  return t * r + x;
};
export class FigureEightPolynomialKnot extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 1) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    t = scaleTo(- 4, 4, t);
    const tx = 2 / 5 * t * (t * t - 7) * (t * t - 10),
      ty = Math.pow(t, 4) - 13 * t * t,
      tz = 1 / 10 * t * (t * t - 4) * (t * t - 9) * (t * t - 12);
    return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
  }
}
export class DecoratedTorusKnot4a extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 40) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    t *= Math.PI * 2;
    const
    x = Math.cos(2 * t) * (1 + 0.6 * (Math.cos(5 * t) + 0.75 * Math.cos(10 * t))),
      y = Math.sin(2 * t) * (1 + 0.6 * (Math.cos(5 * t) + 0.75 * Math.cos(10 * t))),
      z = 0.35 * Math.sin(5 * t);
    return new Vector3(x, y, z).multiplyScalar(this.scale);
  }
}
export class DecoratedTorusKnot4b extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 40) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    const fi = t * Math.PI * 2;
    const x = Math.cos(2 * fi) * (1 + 0.45 * Math.cos(3 * fi) + 0.4 * Math.cos(9 * fi)),
      y = Math.sin(2 * fi) * (1 + 0.45 * Math.cos(3 * fi) + 0.4 * Math.cos(9 * fi)),
      z = 0.2 * Math.sin(9 * fi);
    return new Vector3(x, y, z).multiplyScalar(this.scale);
  }
}
export class DecoratedTorusKnot5a extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 40) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    const fi = t * Math.PI * 2;
    const x = Math.cos(3 * fi) * (1 + 0.3 * Math.cos(5 * fi) + 0.5 * Math.cos(10 * fi)),
      y = Math.sin(3 * fi) * (1 + 0.3 * Math.cos(5 * fi) + 0.5 * Math.cos(10 * fi)),
      z = 0.2 * Math.sin(20 * fi);
    return new Vector3(x, y, z).multiplyScalar(this.scale);
  }
}
export class DecoratedTorusKnot5c extends Curve<Vector3> {
  scale: number;
  constructor(s: number = 40) {
    super();
    this.scale = s;
  }
  getPoint(t: number): Vector3 {
    const fi = t * Math.PI * 2;
    const x = Math.cos(4 * fi) * (1 + 0.5 * (Math.cos(5 * fi) + 0.4 * Math.cos(20 * fi))),
      y = Math.sin(4 * fi) * (1 + 0.5 * (Math.cos(5 * fi) + 0.4 * Math.cos(20 * fi))),
      z = 0.35 * Math.sin(15 * fi);
    return new Vector3(x, y, z).multiplyScalar(this.scale);
  }
}
//}
