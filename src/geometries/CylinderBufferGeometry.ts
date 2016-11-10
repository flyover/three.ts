import { BufferGeometry } from "../core/BufferGeometry";
import { Vector3 } from "../math/Vector3";
import { Vector2 } from "../math/Vector2";
import { BufferAttribute } from "../core/BufferAttribute";
/**
 * @author Mugen87 / https://github.com/Mugen87
 */
export class CylinderBufferGeometry extends BufferGeometry {
  constructor(radiusTop: number, radiusBottom: number, height: number, radialSegments: number, heightSegments: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number) {
    super();
    this.type = 'CylinderBufferGeometry';
    this.parameters = {
      radiusTop: radiusTop,
      radiusBottom: radiusBottom,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
    const scope = this;
    radiusTop = radiusTop !== undefined ? radiusTop : 20;
    radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
    height = height !== undefined ? height : 100;
    radialSegments = Math.floor(radialSegments) || 8;
    heightSegments = Math.floor(heightSegments) || 1;
    openEnded = openEnded !== undefined ? openEnded : false;
    thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
    thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI;
    // used to calculate buffer length
    let nbCap = 0;
    if (openEnded === false) {
      if (radiusTop > 0) nbCap ++;
      if (radiusBottom > 0) nbCap ++;
    }
    const vertexCount = calculateVertexCount();
    const indexCount = calculateIndexCount();
    // buffers
    const indices = new BufferAttribute(new (indexCount > 65535 ? Uint32Array : Uint16Array)(indexCount), 1);
    const vertices = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const normals = new BufferAttribute(new Float32Array(vertexCount * 3), 3);
    const uvs = new BufferAttribute(new Float32Array(vertexCount * 2), 2);
    // helper variables
    let index = 0,
        indexOffset = 0,
        indexArray: any[] = [],
        halfHeight = height / 2;
    // group variables
    let groupStart = 0;
    // generate geometry
    generateTorso();
    if (openEnded === false) {
      if (radiusTop > 0) generateCap(true);
      if (radiusBottom > 0) generateCap(false);
    }
    // build geometry
    this.setIndex(indices);
    this.addAttribute('position', vertices);
    this.addAttribute('normal', normals);
    this.addAttribute('uv', uvs);
    // helper functions
    function calculateVertexCount() {
      let count = (radialSegments + 1) * (heightSegments + 1);
      if (openEnded === false) {
        count += ((radialSegments + 1) * nbCap) + (radialSegments * nbCap);
      }
      return count;
    }
    function calculateIndexCount() {
      let count = radialSegments * heightSegments * 2 * 3;
      if (openEnded === false) {
        count += radialSegments * nbCap * 3;
      }
      return count;
    }
    function generateTorso() {
      const normal = new Vector3();
      const vertex = new Vector3();
      let groupCount = 0;
      // this will be used to calculate the normal
      const slope = (radiusBottom - radiusTop) / height;
      // generate vertices, normals and uvs
      for (let y = 0; y <= heightSegments; y ++) {
        const indexRow = [];
        const v = y / heightSegments;
        // calculate the radius of the current row
        const radius = v * (radiusBottom - radiusTop) + radiusTop;
        for (let x = 0; x <= radialSegments; x ++) {
          const u = x / radialSegments;
          const theta = u * thetaLength + thetaStart;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);
          // vertex
          vertex.x = radius * sinTheta;
          vertex.y = - v * height + halfHeight;
          vertex.z = radius * cosTheta;
          vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
          // normal
          normal.set(sinTheta, slope, cosTheta).normalize();
          normals.setXYZ(index, normal.x, normal.y, normal.z);
          // uv
          uvs.setXY(index, u, 1 - v);
          // save index of vertex in respective row
          indexRow.push(index);
          // increase index
          index ++;
        }
        // now save vertices of the row in our index array
        indexArray.push(indexRow);
      }
      // generate indices
      for (let x = 0; x < radialSegments; x ++) {
        for (let y = 0; y < heightSegments; y ++) {
          // we use the index array to access the correct indices
          const i1 = indexArray[y][x];
          const i2 = indexArray[y + 1][x];
          const i3 = indexArray[y + 1][x + 1];
          const i4 = indexArray[y][x + 1];
          // face one
          indices.setX(indexOffset, i1); indexOffset ++;
          indices.setX(indexOffset, i2); indexOffset ++;
          indices.setX(indexOffset, i4); indexOffset ++;
          // face two
          indices.setX(indexOffset, i2); indexOffset ++;
          indices.setX(indexOffset, i3); indexOffset ++;
          indices.setX(indexOffset, i4); indexOffset ++;
          // update counters
          groupCount += 6;
        }
      }
      // add a group to the geometry. this will ensure multi material support
      scope.addGroup(groupStart, groupCount, 0);
      // calculate new start value for groups
      groupStart += groupCount;
    }
    function generateCap(top: boolean) {
      const uv = new Vector2();
      const vertex = new Vector3();
      let groupCount = 0;
      const radius = (top === true) ? radiusTop : radiusBottom;
      const sign = (top === true) ? 1 : - 1;
      // save the index of the first center vertex
      const centerIndexStart = index;
      // first we generate the center vertex data of the cap.
      // because the geometry needs one set of uvs per face,
      // we must generate a center vertex per face/segment
      for (let x = 1; x <= radialSegments; x ++) {
        // vertex
        vertices.setXYZ(index, 0, halfHeight * sign, 0);
        // normal
        normals.setXYZ(index, 0, sign, 0);
        // uv
        uv.x = 0.5;
        uv.y = 0.5;
        uvs.setXY(index, uv.x, uv.y);
        // increase index
        index ++;
      }
      // save the index of the last center vertex
      const centerIndexEnd = index;
      // now we generate the surrounding vertices, normals and uvs
      for (let x = 0; x <= radialSegments; x ++) {
        const u = x / radialSegments;
        const theta = u * thetaLength + thetaStart;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        // vertex
        vertex.x = radius * sinTheta;
        vertex.y = halfHeight * sign;
        vertex.z = radius * cosTheta;
        vertices.setXYZ(index, vertex.x, vertex.y, vertex.z);
        // normal
        normals.setXYZ(index, 0, sign, 0);
        // uv
        uv.x = (cosTheta * 0.5) + 0.5;
        uv.y = (sinTheta * 0.5 * sign) + 0.5;
        uvs.setXY(index, uv.x, uv.y);
        // increase index
        index ++;
      }
      // generate indices
      for (let x = 0; x < radialSegments; x ++) {
        const c = centerIndexStart + x;
        const i = centerIndexEnd + x;
        if (top === true) {
          // face top
          indices.setX(indexOffset, i); indexOffset ++;
          indices.setX(indexOffset, i + 1); indexOffset ++;
          indices.setX(indexOffset, c); indexOffset ++;
        } else {
          // face bottom
          indices.setX(indexOffset, i + 1); indexOffset ++;
          indices.setX(indexOffset, i); indexOffset ++;
          indices.setX(indexOffset, c); indexOffset ++;
        }
        // update counters
        groupCount += 3;
      }
      // add a group to the geometry. this will ensure multi material support
      scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);
      // calculate new start value for groups
      groupStart += groupCount;
    }
  }
}
