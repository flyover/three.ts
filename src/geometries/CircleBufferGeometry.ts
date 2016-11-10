import { BufferGeometry } from "../core/BufferGeometry";
import { Vector3 } from "../math/Vector3";
import { Sphere } from "../math/Sphere";
import { BufferAttribute } from "../core/BufferAttribute";
/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */
export class CircleBufferGeometry extends BufferGeometry {
  constructor(radius: number, segments: number, thetaStart: number, thetaLength: number) {
    super();
    this.type = 'CircleBufferGeometry';
    this.parameters = {
      radius: radius,
      segments: segments,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
    radius = radius || 50;
    segments = segments !== undefined ? Math.max(3, segments) : 8;
    thetaStart = thetaStart !== undefined ? thetaStart : 0;
    thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;
    const vertices = segments + 2;
    const positions = new Float32Array(vertices * 3);
    const normals = new Float32Array(vertices * 3);
    const uvs = new Float32Array(vertices * 2);
    // center data is already zero, but need to set a few extras
    normals[2] = 1.0;
    uvs[0] = 0.5;
    uvs[1] = 0.5;
    for (let s = 0, i = 3, ii = 2 ; s <= segments; s ++, i += 3, ii += 2) {
      const segment = thetaStart + s / segments * thetaLength;
      positions[i] = radius * Math.cos(segment);
      positions[i + 1] = radius * Math.sin(segment);
      normals[i + 2] = 1; // normal z
      uvs[ii] = (positions[i] / radius + 1) / 2;
      uvs[ii + 1] = (positions[i + 1] / radius + 1) / 2;
    }
    const indices = [];
    for (let i = 1; i <= segments; i ++) {
      indices.push(i, i + 1, 0);
    }
    this.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
    this.addAttribute('position', new BufferAttribute(positions, 3));
    this.addAttribute('normal', new BufferAttribute(normals, 3));
    this.addAttribute('uv', new BufferAttribute(uvs, 2));
    this.boundingSphere = new Sphere(new Vector3(), radius);
  }
}
