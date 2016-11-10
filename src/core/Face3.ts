import { Color } from "../math/Color";
import { Vector3 } from "../math/Vector3";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
export class Face3 {
  a: number;
  b: number;
  c: number;
  normal: Vector3;
  vertexNormals: Vector3[];
  color: Color;
  vertexColors: Color[];
  materialIndex: number;
  _id: any; // Geometry
  __originalFaceNormal: any; // Geometry
  __originalVertexNormals: any; // Geometry
  constructor(a?: number, b?: number, c?: number, normal?: Vector3 | Vector3[], color?: Color | Color[], materialIndex?: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = (normal && normal instanceof Vector3) ? normal : new Vector3();
    this.vertexNormals = Array.isArray(normal) ? normal : [];
    this.color = (color && color instanceof Color) ? color : new Color();
    this.vertexColors = Array.isArray(color) ? color : [];
    this.materialIndex = materialIndex !== undefined ? materialIndex : 0;
  }
  clone(): this {
    return new (this.constructor as any)().copy(this);
  }
  copy(source: this): this {
    this.a = source.a;
    this.b = source.b;
    this.c = source.c;
    this.normal.copy(source.normal);
    this.color.copy(source.color);
    this.materialIndex = source.materialIndex;
    for (let i = 0, il = source.vertexNormals.length; i < il; i ++) {
      this.vertexNormals[i] = source.vertexNormals[i].clone();
    }
    for (let i = 0, il = source.vertexColors.length; i < il; i ++) {
      this.vertexColors[i] = source.vertexColors[i].clone();
    }
    return this;
  }
}
