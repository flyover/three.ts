/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Geometry } from "../../core/Geometry";
import { BufferGeometry } from "../../core/BufferGeometry";
import { Object3D } from "../../core/Object3D";
import { InterleavedBufferAttribute } from "../../core/InterleavedBufferAttribute";
export class WebGLGeometries {
  gl: WebGLRenderingContext;
  properties: any;
  info: any;
  geometries: { [key: number]: BufferGeometry } = {};
  constructor(gl: WebGLRenderingContext, properties: any, info: any) {
    this.gl = gl;
    this.properties = properties;
    this.info = info;
  }
  get(object: Object3D): BufferGeometry {
    const gl: WebGLRenderingContext = this.gl;
    const properties = this.properties;
    const info = this.info;
    const geometries = this.geometries;
    const geometry = object.geometry;
    if (geometries[geometry.id] !== undefined) {
      return geometries[geometry.id];
    }
    geometry.addEventListener('dispose', onGeometryDispose);
    function onGeometryDispose(event: any) {
      const geometry = event.target;
      const buffergeometry = geometries[geometry.id];
      if (buffergeometry.index !== null) {
        deleteAttribute(buffergeometry.index);
      }
      deleteAttributes(buffergeometry.attributes);
      geometry.removeEventListener('dispose', onGeometryDispose);
      delete geometries[geometry.id];
      // TODO
      const property = properties.get(geometry);
      if (property.wireframe) {
        deleteAttribute(property.wireframe);
      }
      properties.delete(geometry);
      const bufferproperty = properties.get(buffergeometry);
      if (bufferproperty.wireframe) {
        deleteAttribute(bufferproperty.wireframe);
      }
      properties.delete(buffergeometry);
      //
      info.memory.geometries --;
    }
    function getAttributeBuffer(attribute: any) {
      if (attribute instanceof InterleavedBufferAttribute) {
        return properties.get(attribute.data).__webglBuffer;
      }
      return properties.get(attribute).__webglBuffer;
    }
    function deleteAttribute(attribute: any) {
      const buffer = getAttributeBuffer(attribute);
      if (buffer !== undefined) {
        gl.deleteBuffer(buffer);
        removeAttributeBuffer(attribute);
      }
    }
    function deleteAttributes(attributes: any) {
      for (let name in attributes) {
        const attribute = attributes[name];
        if (attribute === undefined) continue;
        deleteAttribute(attribute);
      }
    }
    function removeAttributeBuffer(attribute: any) {
      if (attribute instanceof InterleavedBufferAttribute) {
        properties.delete(attribute.data);
      } else {
        properties.delete(attribute);
      }
    }
    let buffergeometry;
    if (geometry instanceof BufferGeometry) {
      buffergeometry = geometry;
    } else if (geometry instanceof Geometry) {
      if (geometry._bufferGeometry === undefined) {
        geometry._bufferGeometry = new BufferGeometry().setFromObject(object);
      }
      buffergeometry = geometry._bufferGeometry;
    }
    geometries[geometry.id] = buffergeometry;
    info.memory.geometries ++;
    return buffergeometry;
  }
}
