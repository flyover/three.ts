/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */
import { Vector2 } from "../math/Vector2";
export class ShapeUtils {
  // calculate area of the contour polygon
  static area(contour: Vector2[]): number {
    let n = contour.length;
    let a = 0.0;
    for (let p = n - 1, q = 0; q < n; p = q ++) {
      a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;
    }
    return a * 0.5;
  }
  static triangulate(contour: Vector2[], indices: boolean): Vector2[][] | number[][] {
    /**
     * This code is a quick port of code written in C++ which was submitted to
     * flipcode.com by John W. Ratcliff  // July 22, 2000
     * See original code and more information here:
     * http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
     *
     * ported to actionscript by Zevan Rosser
     * www.actionsnippet.com
     *
     * ported to javascript by Joshua Koo
     * http://www.lab4games.net/zz85/blog
     *
     */
    function snip(contour: Vector2[], u: number, v: number, w: number, n: number, verts: number[]): boolean {
      let p: number;
      let ax: number, ay: number, bx: number, by: number;
      let cx: number, cy: number, px: number, py: number;
      ax = contour[ verts[ u ] ].x;
      ay = contour[ verts[ u ] ].y;
      bx = contour[ verts[ v ] ].x;
      by = contour[ verts[ v ] ].y;
      cx = contour[ verts[ w ] ].x;
      cy = contour[ verts[ w ] ].y;
      if ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax) <= 0) return false;
      let aX: number, aY: number, bX: number, bY: number, cX: number, cY: number;
      let apx: number, apy: number, bpx: number, bpy: number, cpx: number, cpy: number;
      let cCROSSap: number, bCROSScp: number, aCROSSbp: number;
      aX = cx - bx;  aY = cy - by;
      bX = ax - cx;  bY = ay - cy;
      cX = bx - ax;  cY = by - ay;
      for (p = 0; p < n; p ++) {
        px = contour[ verts[ p ] ].x;
        py = contour[ verts[ p ] ].y;
        if (((px === ax) && (py === ay)) ||
           ((px === bx) && (py === by)) ||
           ((px === cx) && (py === cy)))  continue;
        apx = px - ax;  apy = py - ay;
        bpx = px - bx;  bpy = py - by;
        cpx = px - cx;  cpy = py - cy;
        // see if p is inside triangle abc
        aCROSSbp = aX * bpy - aY * bpx;
        cCROSSap = cX * apy - cY * apx;
        bCROSScp = bX * cpy - bY * cpx;
        if ((aCROSSbp >= - Number.EPSILON) && (bCROSScp >= - Number.EPSILON) && (cCROSSap >= - Number.EPSILON)) return false;
      }
      return true;
    }
    // takes in an contour array and returns
    //return function triangulate(contour, indices) {
      let n: number = contour.length;
      if (n < 3) return null;
      const result: Vector2[][] = [];
      const verts: number[] = [];
      const vertIndices: number[][] = [];
      /* we want a counter-clockwise polygon in verts */
      let u: number, v: number, w: number;
      if (ShapeUtils.area(contour) > 0.0) {
        for (v = 0; v < n; v ++) verts[ v ] = v;
      } else {
        for (v = 0; v < n; v ++) verts[ v ] = (n - 1) - v;
      }
      let nv: number = n;
      /*  remove nv - 2 vertices, creating 1 triangle every time */
      let count: number = 2 * nv;   /* error detection */
      for (v = nv - 1; nv > 2; ) {
        /* if we loop, it is probably a non-simple polygon */
        if ((count --) <= 0) {
          //** Triangulate: ERROR - probable bad polygon!
          //throw ("Warning, unable to triangulate polygon!");
          //return null;
          // Sometimes warning is fine, especially polygons are triangulated in reverse.
          console.warn('THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()');
          if (indices) return vertIndices;
          return result;
        }
        /* three consecutive vertices in current polygon, <u,v,w> */
        u = v;      if (nv <= u) u = 0;     /* previous */
        v = u + 1;  if (nv <= v) v = 0;     /* new v    */
        w = v + 1;  if (nv <= w) w = 0;     /* next     */
        if (snip(contour, u, v, w, nv, verts)) {
          let a: number, b: number, c: number, s: number, t: number;
          /* true names of the vertices */
          a = verts[ u ];
          b = verts[ v ];
          c = verts[ w ];
          /* output Triangle */
          result.push([ contour[ a ], contour[ b ], contour[ c ] ]);
          vertIndices.push([ verts[ u ], verts[ v ], verts[ w ] ]);
          /* remove v from the remaining polygon */
          for (s = v, t = v + 1; t < nv; s ++, t ++) {
            verts[ s ] = verts[ t ];
          }
          nv --;
          /* reset error detection counter */
          count = 2 * nv;
        }
      }
      if (indices) return vertIndices;
      return result;
    //};
  }
  static triangulateShape(contour: Vector2[], holes: Vector2[][]): number[][] {
    function removeDupEndPts(points: Vector2[]): void {
      let l: number = points.length;
      if (l > 2 && points[ l - 1 ].equals(points[ 0 ])) {
        points.pop();
      }
    }
    removeDupEndPts(contour);
    holes.forEach(removeDupEndPts);
    function point_in_segment_2D_colin(inSegPt1: Vector2, inSegPt2: Vector2, inOtherPt: Vector2): boolean {
      // inOtherPt needs to be collinear to the inSegment
      if (inSegPt1.x !== inSegPt2.x) {
        if (inSegPt1.x < inSegPt2.x) {
          return  ((inSegPt1.x <= inOtherPt.x) && (inOtherPt.x <= inSegPt2.x));
        } else {
          return  ((inSegPt2.x <= inOtherPt.x) && (inOtherPt.x <= inSegPt1.x));
        }
      } else {
        if (inSegPt1.y < inSegPt2.y) {
          return  ((inSegPt1.y <= inOtherPt.y) && (inOtherPt.y <= inSegPt2.y));
        } else {
          return  ((inSegPt2.y <= inOtherPt.y) && (inOtherPt.y <= inSegPt1.y));
        }
      }
    }
    function intersect_segments_2D(inSeg1Pt1: Vector2, inSeg1Pt2: Vector2, inSeg2Pt1: Vector2, inSeg2Pt2: Vector2, inExcludeAdjacentSegs: boolean): Vector2[] {
      let seg1dx: number = inSeg1Pt2.x - inSeg1Pt1.x, seg1dy: number = inSeg1Pt2.y - inSeg1Pt1.y;
      let seg2dx: number = inSeg2Pt2.x - inSeg2Pt1.x, seg2dy: number = inSeg2Pt2.y - inSeg2Pt1.y;
      let seg1seg2dx: number = inSeg1Pt1.x - inSeg2Pt1.x;
      let seg1seg2dy: number = inSeg1Pt1.y - inSeg2Pt1.y;
      let limit: number = seg1dy * seg2dx - seg1dx * seg2dy;
      let perpSeg1: number = seg1dy * seg1seg2dx - seg1dx * seg1seg2dy;
      if (Math.abs(limit) > Number.EPSILON) {
        // not parallel
        let perpSeg2: number;
        if (limit > 0) {
          if ((perpSeg1 < 0) || (perpSeg1 > limit)) return [];
          perpSeg2 = seg2dy * seg1seg2dx - seg2dx * seg1seg2dy;
          if ((perpSeg2 < 0) || (perpSeg2 > limit)) return [];
        } else {
          if ((perpSeg1 > 0) || (perpSeg1 < limit)) return [];
          perpSeg2 = seg2dy * seg1seg2dx - seg2dx * seg1seg2dy;
          if ((perpSeg2 > 0) || (perpSeg2 < limit)) return [];
        }
        // i.e. to reduce rounding errors
        // intersection at endpoint of segment#1?
        if (perpSeg2 === 0) {
          if ((inExcludeAdjacentSegs) &&
             ((perpSeg1 === 0) || (perpSeg1 === limit))) return [];
          return [ inSeg1Pt1 ];
        }
        if (perpSeg2 === limit) {
          if ((inExcludeAdjacentSegs) &&
             ((perpSeg1 === 0) || (perpSeg1 === limit))) return [];
          return [ inSeg1Pt2 ];
        }
        // intersection at endpoint of segment#2?
        if (perpSeg1 === 0) return [ inSeg2Pt1 ];
        if (perpSeg1 === limit) return [ inSeg2Pt2 ];
        // return real intersection point
        let factorSeg1 = perpSeg2 / limit;
        return [ new Vector2(inSeg1Pt1.x + factorSeg1 * seg1dx, inSeg1Pt1.y + factorSeg1 * seg1dy) ];
      } else {
        // parallel or collinear
        if ((perpSeg1 !== 0) ||
           (seg2dy * seg1seg2dx !== seg2dx * seg1seg2dy)) return [];
        // they are collinear or degenerate
        let seg1Pt: boolean = ((seg1dx === 0) && (seg1dy === 0));  // segment1 is just a point?
        let seg2Pt: boolean = ((seg2dx === 0) && (seg2dy === 0));  // segment2 is just a point?
        // both segments are points
        if (seg1Pt && seg2Pt) {
          if ((inSeg1Pt1.x !== inSeg2Pt1.x) || (inSeg1Pt1.y !== inSeg2Pt1.y)) return [];  // they are distinct  points
          return [ inSeg1Pt1 ]; // they are the same point
        }
        // segment#1  is a single point
        if (seg1Pt) {
          if (! point_in_segment_2D_colin(inSeg2Pt1, inSeg2Pt2, inSeg1Pt1)) return [];    // but not in segment#2
          return [ inSeg1Pt1 ];
        }
        // segment#2  is a single point
        if (seg2Pt) {
          if (! point_in_segment_2D_colin(inSeg1Pt1, inSeg1Pt2, inSeg2Pt1)) return [];    // but not in segment#1
          return [ inSeg2Pt1 ];
        }
        // they are collinear segments, which might overlap
        let seg1min: Vector2, seg1max: Vector2, seg1minVal: number, seg1maxVal: number;
        let seg2min: Vector2, seg2max: Vector2, seg2minVal: number, seg2maxVal: number;
        if (seg1dx !== 0) {
          // the segments are NOT on a vertical line
          if (inSeg1Pt1.x < inSeg1Pt2.x) {
            seg1min = inSeg1Pt1; seg1minVal = inSeg1Pt1.x;
            seg1max = inSeg1Pt2; seg1maxVal = inSeg1Pt2.x;
          } else {
            seg1min = inSeg1Pt2; seg1minVal = inSeg1Pt2.x;
            seg1max = inSeg1Pt1; seg1maxVal = inSeg1Pt1.x;
          }
          if (inSeg2Pt1.x < inSeg2Pt2.x) {
            seg2min = inSeg2Pt1; seg2minVal = inSeg2Pt1.x;
            seg2max = inSeg2Pt2; seg2maxVal = inSeg2Pt2.x;
          } else {
            seg2min = inSeg2Pt2; seg2minVal = inSeg2Pt2.x;
            seg2max = inSeg2Pt1; seg2maxVal = inSeg2Pt1.x;
          }
        } else {
          // the segments are on a vertical line
          if (inSeg1Pt1.y < inSeg1Pt2.y) {
            seg1min = inSeg1Pt1; seg1minVal = inSeg1Pt1.y;
            seg1max = inSeg1Pt2; seg1maxVal = inSeg1Pt2.y;
          } else {
            seg1min = inSeg1Pt2; seg1minVal = inSeg1Pt2.y;
            seg1max = inSeg1Pt1; seg1maxVal = inSeg1Pt1.y;
          }
          if (inSeg2Pt1.y < inSeg2Pt2.y) {
            seg2min = inSeg2Pt1; seg2minVal = inSeg2Pt1.y;
            seg2max = inSeg2Pt2; seg2maxVal = inSeg2Pt2.y;
          } else {
            seg2min = inSeg2Pt2; seg2minVal = inSeg2Pt2.y;
            seg2max = inSeg2Pt1; seg2maxVal = inSeg2Pt1.y;
          }
        }
        if (seg1minVal <= seg2minVal) {
          if (seg1maxVal <  seg2minVal) return [];
          if (seg1maxVal === seg2minVal) {
            if (inExcludeAdjacentSegs) return [];
            return [ seg2min ];
          }
          if (seg1maxVal <= seg2maxVal)  return [ seg2min, seg1max ];
          return  [ seg2min, seg2max ];
        } else {
          if (seg1minVal >  seg2maxVal) return [];
          if (seg1minVal === seg2maxVal) {
            if (inExcludeAdjacentSegs) return [];
            return [ seg1min ];
          }
          if (seg1maxVal <= seg2maxVal) return [ seg1min, seg1max ];
          return  [ seg1min, seg2max ];
        }
      }
    }
    function isPointInsideAngle(inVertex: Vector2, inLegFromPt: Vector2, inLegToPt: Vector2, inOtherPt: Vector2): boolean {
      // The order of legs is important
      // translation of all points, so that Vertex is at (0,0)
      let legFromPtX: number = inLegFromPt.x - inVertex.x, legFromPtY: number = inLegFromPt.y - inVertex.y;
      let legToPtX: number = inLegToPt.x - inVertex.x, legToPtY: number = inLegToPt.y  - inVertex.y;
      let otherPtX: number = inOtherPt.x - inVertex.x, otherPtY: number = inOtherPt.y  - inVertex.y;
      // main angle >0: < 180 deg.; 0: 180 deg.; <0: > 180 deg.
      let from2toAngle: number = legFromPtX * legToPtY - legFromPtY * legToPtX;
      let from2otherAngle: number  = legFromPtX * otherPtY - legFromPtY * otherPtX;
      if (Math.abs(from2toAngle) > Number.EPSILON) {
        // angle != 180 deg.
        let other2toAngle: number = otherPtX * legToPtY - otherPtY * legToPtX;
        // console.log("from2to: " + from2toAngle + ", from2other: " + from2otherAngle + ", other2to: " + other2toAngle);
        if (from2toAngle > 0) {
          // main angle < 180 deg.
          return ((from2otherAngle >= 0) && (other2toAngle >= 0));
        } else {
          // main angle > 180 deg.
          return ((from2otherAngle >= 0) || (other2toAngle >= 0));
        }
      } else {
        // angle == 180 deg.
        // console.log("from2to: 180 deg., from2other: " + from2otherAngle);
        return (from2otherAngle > 0);
      }
    }
    function removeHoles(contour: Vector2[], holes: Vector2[][]) {
      let shape: Vector2[] = contour.concat(); // work on this shape
      let hole: Vector2[];
      function isCutLineInsideAngles(inShapeIdx: number, inHoleIdx: number): boolean {
        // Check if hole point lies within angle around shape point
        let lastShapeIdx: number = shape.length - 1;
        let prevShapeIdx: number = inShapeIdx - 1;
        if (prevShapeIdx < 0) prevShapeIdx = lastShapeIdx;
        let nextShapeIdx: number = inShapeIdx + 1;
        if (nextShapeIdx > lastShapeIdx)  nextShapeIdx = 0;
        let insideAngle: boolean = isPointInsideAngle(shape[ inShapeIdx ], shape[ prevShapeIdx ], shape[ nextShapeIdx ], hole[ inHoleIdx ]);
        if (! insideAngle) {
          // console.log("Vertex (Shape): " + inShapeIdx + ", Point: " + hole[inHoleIdx].x + "/" + hole[inHoleIdx].y);
          return false;
        }
        // Check if shape point lies within angle around hole point
        let lastHoleIdx: number = hole.length - 1;
        let prevHoleIdx: number = inHoleIdx - 1;
        if (prevHoleIdx < 0) prevHoleIdx = lastHoleIdx;
        let nextHoleIdx: number = inHoleIdx + 1;
        if (nextHoleIdx > lastHoleIdx)  nextHoleIdx = 0;
        insideAngle = isPointInsideAngle(hole[ inHoleIdx ], hole[ prevHoleIdx ], hole[ nextHoleIdx ], shape[ inShapeIdx ]);
        if (! insideAngle) {
          // console.log("Vertex (Hole): " + inHoleIdx + ", Point: " + shape[inShapeIdx].x + "/" + shape[inShapeIdx].y);
          return false;
        }
        return true;
      }
      function intersectsShapeEdge(inShapePt: Vector2, inHolePt: Vector2): boolean {
        // checks for intersections with shape edges
        let sIdx: number, nextIdx: number, intersection: Vector2[];
        for (sIdx = 0; sIdx < shape.length; sIdx ++) {
          nextIdx = sIdx + 1; nextIdx %= shape.length;
          intersection = intersect_segments_2D(inShapePt, inHolePt, shape[ sIdx ], shape[ nextIdx ], true);
          if (intersection.length > 0) return true;
        }
        return false;
      }
      let indepHoles: number[] = [];
      function intersectsHoleEdge(inShapePt: Vector2, inHolePt: Vector2) {
        // checks for intersections with hole edges
        let ihIdx, chkHole, hIdx, nextIdx, intersection;
        for (ihIdx = 0; ihIdx < indepHoles.length; ihIdx ++) {
          chkHole = holes[ indepHoles[ ihIdx ]];
          for (hIdx = 0; hIdx < chkHole.length; hIdx ++) {
            nextIdx = hIdx + 1; nextIdx %= chkHole.length;
            intersection = intersect_segments_2D(inShapePt, inHolePt, chkHole[ hIdx ], chkHole[ nextIdx ], true);
            if (intersection.length > 0) return true;
          }
        }
        return false;
      }
      let holeIndex, shapeIndex,
        shapePt, holePt,
        holeIdx, cutKey, failedCuts: boolean[] = [],
        tmpShape1, tmpShape2,
        tmpHole1, tmpHole2;
      for (let h = 0, hl = holes.length; h < hl; h ++) {
        indepHoles.push(h);
      }
      let minShapeIndex = 0;
      let counter = indepHoles.length * 2;
      while (indepHoles.length > 0) {
        counter --;
        if (counter < 0) {
          console.log("Infinite Loop! Holes left:" + indepHoles.length + ", Probably Hole outside Shape!");
          break;
        }
        // search for shape-vertex and hole-vertex,
        // which can be connected without intersections
        for (shapeIndex = minShapeIndex; shapeIndex < shape.length; shapeIndex ++) {
          shapePt = shape[ shapeIndex ];
          holeIndex  = - 1;
          // search for hole which can be reached without intersections
          for (let h = 0; h < indepHoles.length; h ++) {
            holeIdx = indepHoles[ h ];
            // prevent multiple checks
            cutKey = shapePt.x + ":" + shapePt.y + ":" + holeIdx;
            if (failedCuts[ cutKey ] !== undefined)      continue;
            hole = holes[ holeIdx ];
            for (let h2 = 0; h2 < hole.length; h2 ++) {
              holePt = hole[ h2 ];
              if (! isCutLineInsideAngles(shapeIndex, h2))    continue;
              if (intersectsShapeEdge(shapePt, holePt))    continue;
              if (intersectsHoleEdge(shapePt, holePt))    continue;
              holeIndex = h2;
              indepHoles.splice(h, 1);
              tmpShape1 = shape.slice(0, shapeIndex + 1);
              tmpShape2 = shape.slice(shapeIndex);
              tmpHole1 = hole.slice(holeIndex);
              tmpHole2 = hole.slice(0, holeIndex + 1);
              shape = tmpShape1.concat(tmpHole1).concat(tmpHole2).concat(tmpShape2);
              minShapeIndex = shapeIndex;
              // Debug only, to show the selected cuts
              // glob_CutLines.push([ shapePt, holePt ]);
              break;
            }
            if (holeIndex >= 0)  break;    // hole-vertex found
            failedCuts[ cutKey ] = true;      // remember failure
          }
          if (holeIndex >= 0)  break;    // hole-vertex found
        }
      }
      return shape;       /* shape with no holes */
    }
    const allPointsMap = {};
    // To maintain reference to old shape, one must match coordinates, or offset the indices from original arrays. It's probably easier to do the first.
    const allpoints = contour.concat();
    for (let h = 0, hl = holes.length; h < hl; h ++) {
      Array.prototype.push.apply(allpoints, holes[ h ]);
    }
    //console.log("allpoints",allpoints, allpoints.length);
    // prepare all points map
    for (let i = 0, il = allpoints.length; i < il; i ++) {
      const key = allpoints[ i ].x + ":" + allpoints[ i ].y;
      if (allPointsMap[ key ] !== undefined) {
        console.warn("THREE.ShapeUtils: Duplicate point", key, i);
      }
      allPointsMap[ key ] = i;
    }
    // remove holes by cutting paths to holes and adding them to the shape
    const shapeWithoutHoles = removeHoles(contour, holes);
    const triangle_vertices: Vector2[][] = <Vector2[][]>ShapeUtils.triangulate(shapeWithoutHoles, false); // True returns indices for points of spooled shape
    const triangle_indices: number[][] = [];
    //console.log("triangles",triangles, triangles.length);
    // check all face vertices against all points map
    for (let i = 0, il = triangle_vertices.length; i < il; i ++) {
      const face_vertices = triangle_vertices[ i ];
      const face_indices = triangle_indices[ i ] = [];
      for (let f = 0; f < 3; f ++) {
        const key = face_vertices[ f ].x + ":" + face_vertices[ f ].y;
        const index = allPointsMap[ key ];
        if (index !== undefined) {
          face_indices[ f ] = index;
        }
      }
    }
    return triangle_indices;
  }
  static isClockWise(pts: Vector2[]): boolean {
    return ShapeUtils.area(pts) < 0;
  }
  // Bezier Curves formulas obtained from
  // http://en.wikipedia.org/wiki/B%C3%A9zier_curve
  // Quad Bezier Functions
  static b2(t: number, p0: number, p1: number, p2: number): number {
    function b2p0(t: number, p: number) {
      let k = 1 - t;
      return k * k * p;
    }
    function b2p1(t: number, p: number): number {
      return 2 * (1 - t) * t * p;
    }
    function b2p2(t: number, p: number): number {
      return t * t * p;
    }
    //return function b2(t, p0, p1, p2) {
      return b2p0(t, p0) + b2p1(t, p1) + b2p2(t, p2);
    //};
  }
  // Cubic Bezier Functions
  static b3(t: number, p0: number, p1: number, p2: number, p3: number): number {
    function b3p0(t: number, p: number): number {
      let k = 1 - t;
      return k * k * k * p;
    }
    function b3p1(t: number, p: number): number {
      let k = 1 - t;
      return 3 * k * k * t * p;
    }
    function b3p2(t: number, p: number): number {
      let k = 1 - t;
      return 3 * k * t * t * p;
    }
    function b3p3(t: number, p: number): number {
      return t * t * t * p;
    }
    //return function b3(t, p0, p1, p2, p3) {
      return b3p0(t, p0) + b3p1(t, p1) + b3p2(t, p2) + b3p3(t, p3);
    //};
  }
}
