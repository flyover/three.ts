/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Defines a 2d shape plane using paths.
 **/
// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 ExtrudeGeometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate each shape, add faces.
import { Path } from "./Path";
import { ExtrudeGeometry } from "../../geometries/ExtrudeGeometry";
import { ShapeGeometry } from "../../geometries/ShapeGeometry";
import { Vector2 } from "../../math/Vector2";
export class Shape extends Path {
  holes: Path[];
  constructor(points?: Vector2[]) {
    super(points);
    this.holes = [];
  }
  getPointsHoles(divisions: number): Vector2[][] {
    const holesPts: Vector2[][] = [];
    for (let i = 0, l = this.holes.length; i < l; i ++) {
      holesPts[i] = this.holes[i].getPoints(divisions);
    }
    return holesPts;
  }
  // Get points of shape and holes (keypoints based on segments parameter)
  extractAllPoints(divisions: number): { shape: Vector2[], holes: Vector2[][] } {
    return {
      shape: this.getPoints(divisions),
      holes: this.getPointsHoles(divisions)
    };
  }
  extractPoints(divisions: number): { shape: Vector2[], holes: Vector2[][] } {
    return this.extractAllPoints(divisions);
  }
  extrude(options: any): ExtrudeGeometry {
    console.warn("THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead.");
    return new ExtrudeGeometry(this, options);
  }
  makeGeometry(options: any): ShapeGeometry {
    console.warn("THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead.");
    return new ShapeGeometry(this, options);
  }
}
