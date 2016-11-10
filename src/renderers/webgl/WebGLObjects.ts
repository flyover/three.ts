/**
 * @author mrdoob / http://mrdoob.com/
 */
import { BufferAttribute } from "../../core/BufferAttribute";
import { WebGLGeometries } from "./WebGLGeometries";
import { Object3D } from "../../core/Object3D";
import { Geometry } from "../../core/Geometry";
import { BufferGeometry } from "../../core/BufferGeometry";
import { InterleavedBufferAttribute } from "../../core/InterleavedBufferAttribute";
export class WebGLObjects {
  gl: WebGLRenderingContext;
  properties: any;
  info: any;
  geometries: WebGLGeometries;
  constructor(gl: WebGLRenderingContext, properties: any, info: any) {
    this.gl = gl;
    this.properties = properties;
    this.info = info;
    this.geometries = new WebGLGeometries(gl, properties, info);
  }
  //
  update(object: Object3D): BufferGeometry {
    const gl = this.gl;
    // TODO: Avoid updating twice (when using shadowMap). Maybe add frame counter.
    const geometry = this.geometries.get(object);
    if (object.geometry instanceof Geometry) {
      geometry.updateFromObject(object);
    }
    const index = geometry.index;
    const attributes = geometry.attributes;
    if (index !== null) {
      this.updateAttribute(index, gl.ELEMENT_ARRAY_BUFFER);
    }
    for (let name in attributes) {
      const attribute = attributes[name];
      if (attribute === undefined) continue;
      this.updateAttribute(attribute, gl.ARRAY_BUFFER);
    }
    // morph targets
    const morphAttributes = geometry.morphAttributes;
    for (let name in morphAttributes) {
      const array = morphAttributes[name];
      for (let i = 0, l = array.length; i < l; i ++) {
        this.updateAttribute(array[i], gl.ARRAY_BUFFER);
      }
    }
    return geometry;
  }
  private updateAttribute(attribute: any, bufferType: any): void {
    if (!attribute) return;
    const data = (attribute instanceof InterleavedBufferAttribute) ? attribute.data : attribute;
    const attributeProperties = this.properties.get(data);
    if (attributeProperties.__webglBuffer === undefined) {
      this.createBuffer(attributeProperties, data, bufferType);
    } else if (attributeProperties.version !== data.version) {
      this.updateBuffer(attributeProperties, data, bufferType);
    }
  }
  private createBuffer(attributeProperties: any, data: any, bufferType: any): void {
    const gl = this.gl;
    attributeProperties.__webglBuffer = gl.createBuffer();
    gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);
    const usage = data.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
    gl.bufferData(bufferType, data.array, usage);
    attributeProperties.version = data.version;
  }
  private updateBuffer(attributeProperties: any, data: any, bufferType: any): void {
    const gl = this.gl;
    gl.bindBuffer(bufferType, attributeProperties.__webglBuffer);
    if (data.dynamic === false) {
      gl.bufferData(bufferType, data.array, gl.STATIC_DRAW);
    } else if (data.updateRange.count === - 1) {
      // Not using update ranges
      gl.bufferSubData(bufferType, 0, data.array);
    } else if (data.updateRange.count === 0) {
      console.error('THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.');
    } else {
      gl.bufferSubData(bufferType, data.updateRange.offset * data.array.BYTES_PER_ELEMENT,
                data.array.subarray(data.updateRange.offset, data.updateRange.offset + data.updateRange.count));
      data.updateRange.count = 0; // reset range
    }
    attributeProperties.version = data.version;
  }
  getAttributeBuffer(attribute: any): any {
    if (attribute instanceof InterleavedBufferAttribute) {
      return this.properties.get(attribute.data).__webglBuffer;
    }
    return this.properties.get(attribute).__webglBuffer;
  }
  getWireframeAttribute(geometry: any): any {
    const gl = this.gl;
    const property = this.properties.get(geometry);
    if (property.wireframe !== undefined) {
      return property.wireframe;
    }
    const indices = [];
    const index = geometry.index;
    const attributes = geometry.attributes;
    const position = attributes.position;
    // console.time('wireframe');
    if (index !== null) {
      //const edges = {};
      const array = index.array;
      for (let i = 0, l = array.length; i < l; i += 3) {
        const a = array[i + 0];
        const b = array[i + 1];
        const c = array[i + 2];
        indices.push(a, b, b, c, c, a);
      }
    } else {
      const array = attributes.position.array;
      for (let i = 0, l = (array.length / 3) - 1; i < l; i += 3) {
        const a = i + 0;
        const b = i + 1;
        const c = i + 2;
        indices.push(a, b, b, c, c, a);
      }
    }
    // console.timeEnd('wireframe');
    const TypeArray = position.count > 65535 ? Uint32Array : Uint16Array;
    const attribute = new BufferAttribute(new TypeArray(indices), 1);
    this.updateAttribute(attribute, gl.ELEMENT_ARRAY_BUFFER);
    property.wireframe = attribute;
    return attribute;
  }
}
