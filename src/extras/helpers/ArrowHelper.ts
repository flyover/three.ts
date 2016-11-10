/**
 * @author WestLangley / http://github.com/WestLangley
 * @author zz85 / http://github.com/zz85
 * @author bhouston / http://clara.io
 *
 * Creates an arrow for visualizing directions
 *
 * Parameters:
 *  dir - Vector3
 *  origin - Vector3
 *  length - Number
 *  color - color in hex value
 *  headLength - Number
 *  headWidth - Number
 */
import { Vector3 } from "../../math/Vector3";
import { Object3D } from "../../core/Object3D";
import { CylinderBufferGeometry } from "../../geometries/CylinderBufferGeometry";
import { Float32Attribute } from "../../core/BufferAttribute";
import { BufferGeometry } from "../../core/BufferGeometry";
import { MeshBasicMaterial } from "../../materials/MeshBasicMaterial";
import { Mesh } from "../../objects/Mesh";
import { LineBasicMaterial } from "../../materials/LineBasicMaterial";
import { Line } from "../../objects/Line";
const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', Float32Attribute([ 0, 0, 0, 0, 1, 0 ], 3));
const coneGeometry = new CylinderBufferGeometry(0, 0.5, 1, 5, 1);
coneGeometry.translate(0, - 0.5, 0);
export class ArrowHelper extends Object3D {
  line: Line;
  cone: Mesh;
  constructor(dir: Vector3, origin: Vector3, length?: number, color?: number, headLength?: number, headWidth?: number) {
    // dir is assumed to be normalized
    super();
    if (color === undefined) color = 0xffff00;
    if (length === undefined) length = 1;
    if (headLength === undefined) headLength = 0.2 * length;
    if (headWidth === undefined) headWidth = 0.2 * headLength;
    this.position.copy(origin);
    this.line = new Line(lineGeometry, new LineBasicMaterial({ color: color }));
    this.line.matrixAutoUpdate = false;
    this.add(this.line);
    this.cone = new Mesh(coneGeometry, new MeshBasicMaterial({ color: color }));
    this.cone.matrixAutoUpdate = false;
    this.add(this.cone);
    this.setDirection(dir);
    this.setLength(length, headLength, headWidth);
  }
  setDirection(dir: Vector3): void {
    const axis = new Vector3();
    //return function setDirection(dir) {
      // dir is assumed to be normalized
      if (dir.y > 0.99999) {
        this.quaternion.set(0, 0, 0, 1);
      } else if (dir.y < - 0.99999) {
        this.quaternion.set(1, 0, 0, 0);
      } else {
        axis.set(dir.z, 0, - dir.x).normalize();
        const radians = Math.acos(dir.y);
        this.quaternion.setFromAxisAngle(axis, radians);
      }
    //};
  }
  setLength(length: number, headLength: number, headWidth: number): void {
    if (headLength === undefined) headLength = 0.2 * length;
    if (headWidth === undefined) headWidth = 0.2 * headLength;
    this.line.scale.set(1, Math.max(0, length - headLength), 1);
    this.line.updateMatrix();
    this.cone.scale.set(headWidth, headLength, headWidth);
    this.cone.position.y = length;
    this.cone.updateMatrix();
  }
  setColor(color: number): void {
    this.line.material.color.copy(color);
    this.cone.material.color.copy(color);
  }
}
