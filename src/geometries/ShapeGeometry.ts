import { Geometry } from "../core/Geometry";
import { Face3 } from "../core/Face3";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { ShapeUtils } from "../extras/ShapeUtils";
import { ExtrudeGeometry } from "./ExtrudeGeometry";
import { Shape } from "../extras/core/Shape";
/**
 * @author jonobr1 / http://jonobr1.com
 *
 * Creates a one-sided polygonal geometry from a path shape. Similar to
 * ExtrudeGeometry.
 *
 * parameters = {
 *
 *  curveSegments: <int>, // number of points on the curves. NOT USED AT THE MOMENT.
 *
 *  material: <int> // material index for front and back faces
 *  uvGenerator: <Object> // object that provides UV generator functions
 *
 * }
 **/
export class ShapeGeometry extends Geometry {
  constructor(shapes: Shape | Shape[], options?: any) {
    super();
    this.type = 'ShapeGeometry';
    if (Array.isArray(shapes)) {
      this.addShapeList(shapes, options);
    } else {
      this.addShapeList([ shapes ], options);
    }
    this.computeFaceNormals();
  }
  /**
   * Add an array of shapes to THREE.ShapeGeometry.
   */
  addShapeList(shapes: Shape[], options?: any): ShapeGeometry {
    for (let i = 0, l = shapes.length; i < l; i ++) {
      this.addShape(shapes[i], options);
    }
    return this;
  };
  /**
   * Adds a shape to THREE.ShapeGeometry, based on THREE.ExtrudeGeometry.
   */
  addShape(shape: Shape, options?: any): void {
    if (options === undefined) options = {};
    const curveSegments: number = options.curveSegments !== undefined ? options.curveSegments : 12;
    const material = options.material;
    const uvgen = options.UVGenerator === undefined ? ExtrudeGeometry.WorldUVGenerator : options.UVGenerator;
    //
    const shapesOffset: number = this.vertices.length;
    const shapePoints: { shape: Vector2[], holes: Vector2[][] } = shape.extractPoints(curveSegments);
    let vertices: Vector2[] = shapePoints.shape;
    const holes: Vector2[][] = shapePoints.holes;
    let reverse: boolean = ! ShapeUtils.isClockWise(vertices);
    if (reverse) {
      vertices = vertices.reverse();
      // Maybe we should also check if holes are in the opposite direction, just to be safe...
      for (let i = 0, l = holes.length; i < l; i ++) {
        const hole = holes[i];
        if (ShapeUtils.isClockWise(hole)) {
          holes[i] = hole.reverse();
        }
      }
      reverse = false;
    }
    const faces: number[][] = ShapeUtils.triangulateShape(vertices, holes);
    // Vertices
    for (let i = 0, l = holes.length; i < l; i ++) {
      const hole: Vector2[] = holes[i];
      vertices = vertices.concat(hole);
    }
    //
    for (let i = 0, vlen = vertices.length; i < vlen; i ++) {
      const vert: Vector2 = vertices[i];
      this.vertices.push(new Vector3(vert.x, vert.y, 0));
    }
    for (let i = 0, flen = faces.length; i < flen; i ++) {
      const face: number[] = faces[i];
      const a: number = face[0] + shapesOffset;
      const b: number = face[1] + shapesOffset;
      const c: number = face[2] + shapesOffset;
      this.faces.push(new Face3(a, b, c, null, null, material));
      this.faceVertexUvs[0].push(uvgen.generateTopUV(this, a, b, c));
    }
  }
}
