import { Vector2 } from "../../math/Vector2";
import { Path } from "./Path";
import { Shape } from "./Shape";
import { ShapeUtils } from "../ShapeUtils";
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 *
 **/
// minimal class for proxing functions to Path. Replaces old "extractSubpaths()"
export class ShapePath {
  subPaths: any[];
  currentPath: any;
  constructor() {
    this.subPaths = [];
    this.currentPath = null;
  }
  moveTo(x: number, y: number): void {
    this.currentPath = new Path();
    this.subPaths.push(this.currentPath);
    this.currentPath.moveTo(x, y);
  }
  lineTo(x: number, y: number): void {
    this.currentPath.lineTo(x, y);
  }
  quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): void {
    this.currentPath.quadraticCurveTo(aCPx, aCPy, aX, aY);
  }
  bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number): void {
    this.currentPath.bezierCurveTo(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY);
  }
  splineThru(pts: Vector2[]): void {
    this.currentPath.splineThru(pts);
  }
  arc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void {
    this.currentPath.arc(aX, aY, aStartAngle, aEndAngle, aClockwise);
  }
  absarc(aX: number, aY: number, aRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean): void {
    this.currentPath.absarc(aX, aY, aStartAngle, aEndAngle, aClockwise);
  }
  ellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation?: number): void {
    this.currentPath.ellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
  }
  absellipse(aX: number, aY: number, xRadius: number, yRadius: number, aStartAngle: number, aEndAngle: number, aClockwise: boolean, aRotation?: number): void {
    this.currentPath.absellipse(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
  }
  toShapes(isCCW?: boolean, noHoles?: boolean): Shape[] {
    function toShapesNoHoles(inSubpaths: Path[]): Shape[] {
      let shapes = [];
      for (let i = 0, l = inSubpaths.length; i < l; i ++) {
        let tmpPath = inSubpaths[i];
        let tmpShape = new Shape();
        tmpShape.curves = tmpPath.curves;
        shapes.push(tmpShape);
      }
      return shapes;
    }
    function isPointInsidePolygon(inPt: Vector2, inPolygon: Vector2[]): boolean {
      let polyLen = inPolygon.length;
      // inPt on polygon contour => immediate success    or
      // toggling of inside/outside at every single! intersection point of an edge
      //  with the horizontal line through inPt, left of inPt
      //  not counting lowerY endpoints of edges and whole edges on that line
      let inside = false;
      for (let p = polyLen - 1, q = 0; q < polyLen; p = q ++) {
        let edgeLowPt  = inPolygon[p];
        let edgeHighPt = inPolygon[q];
        let edgeDx = edgeHighPt.x - edgeLowPt.x;
        let edgeDy = edgeHighPt.y - edgeLowPt.y;
        if (Math.abs(edgeDy) > Number.EPSILON) {
          // not parallel
          if (edgeDy < 0) {
            edgeLowPt  = inPolygon[q]; edgeDx = - edgeDx;
            edgeHighPt = inPolygon[p]; edgeDy = - edgeDy;
          }
          if ((inPt.y < edgeLowPt.y) || (inPt.y > edgeHighPt.y))     continue;
          if (inPt.y === edgeLowPt.y) {
            if (inPt.x === edgeLowPt.x)    return  true;    // inPt is on contour ?
            // continue;        // no intersection or edgeLowPt => doesn't count !!!
          } else {
            let perpEdge = edgeDy * (inPt.x - edgeLowPt.x) - edgeDx * (inPt.y - edgeLowPt.y);
            if (perpEdge === 0)        return  true;    // inPt is on contour ?
            if (perpEdge < 0)         continue;
            inside = ! inside;    // true intersection left of inPt
          }
        } else {
          // parallel or collinear
          if (inPt.y !== edgeLowPt.y)     continue;      // parallel
          // edge lies on the same horizontal line as inPt
          if (((edgeHighPt.x <= inPt.x) && (inPt.x <= edgeLowPt.x)) ||
             ((edgeLowPt.x <= inPt.x) && (inPt.x <= edgeHighPt.x)))    return  true;  // inPt: Point on contour !
          // continue;
        }
      }
      return  inside;
    }
    let isClockWise = ShapeUtils.isClockWise;
    let subPaths = this.subPaths;
    if (subPaths.length === 0) return [];
    if (noHoles === true)  return  toShapesNoHoles(subPaths);
    let solid, tmpPath, tmpShape, shapes = [];
    if (subPaths.length === 1) {
      tmpPath = subPaths[0];
      tmpShape = new Shape();
      tmpShape.curves = tmpPath.curves;
      shapes.push(tmpShape);
      return shapes;
    }
    let holesFirst: boolean = ! isClockWise(subPaths[0].getPoints());
    holesFirst = isCCW ? ! holesFirst : holesFirst;
    // console.log("Holes first", holesFirst);
    let betterShapeHoles: any[] = [];
    let newShapes: any[] = [];
    let newShapeHoles: any[] = [];
    let mainIdx: number = 0;
    let tmpPoints;
    newShapes[mainIdx] = undefined;
    newShapeHoles[mainIdx] = [];
    for (let i = 0, l = subPaths.length; i < l; i ++) {
      tmpPath = subPaths[i];
      tmpPoints = tmpPath.getPoints();
      solid = isClockWise(tmpPoints);
      solid = isCCW ? ! solid : solid;
      if (solid) {
        if ((! holesFirst) && (newShapes[mainIdx]))  mainIdx ++;
        newShapes[mainIdx] = { s: new Shape(), p: tmpPoints };
        newShapes[mainIdx].s.curves = tmpPath.curves;
        if (holesFirst)  mainIdx ++;
        newShapeHoles[mainIdx] = [];
        //console.log('cw', i);
      } else {
        newShapeHoles[mainIdx].push({ h: tmpPath, p: tmpPoints[0] });
        //console.log('ccw', i);
      }
    }
    // only Holes? -> probably all Shapes with wrong orientation
    if (! newShapes[0])  return  toShapesNoHoles(subPaths);
    if (newShapes.length > 1) {
      let ambiguous = false;
      let toChange = [];
      for (let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx ++) {
        betterShapeHoles[sIdx] = [];
      }
      for (let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx ++) {
        let sho = newShapeHoles[sIdx];
        for (let hIdx = 0; hIdx < sho.length; hIdx ++) {
          let ho = sho[hIdx];
          let hole_unassigned = true;
          for (let s2Idx = 0; s2Idx < newShapes.length; s2Idx ++) {
            if (isPointInsidePolygon(ho.p, newShapes[s2Idx].p)) {
              if (sIdx !== s2Idx)  toChange.push({ froms: sIdx, tos: s2Idx, hole: hIdx });
              if (hole_unassigned) {
                hole_unassigned = false;
                betterShapeHoles[s2Idx].push(ho);
              } else {
                ambiguous = true;
              }
            }
          }
          if (hole_unassigned) {
            betterShapeHoles[sIdx].push(ho);
          }
        }
      }
      // console.log("ambiguous: ", ambiguous);
      if (toChange.length > 0) {
        // console.log("to change: ", toChange);
        if (! ambiguous)  newShapeHoles = betterShapeHoles;
      }
    }
    let tmpHoles: any;
    for (let i = 0, il = newShapes.length; i < il; i ++) {
      tmpShape = newShapes[i].s;
      shapes.push(tmpShape);
      tmpHoles = newShapeHoles[i];
      for (let j = 0, jl = tmpHoles.length; j < jl; j ++) {
        tmpShape.holes.push(tmpHoles[j].h);
      }
    }
    //console.log("shape", shapes);
    return shapes;
  }
}
