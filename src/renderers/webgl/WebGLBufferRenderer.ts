/**
 * @author mrdoob / http://mrdoob.com/
 */
import { WebGLExtensions } from "./WebGLExtensions";
import { Geometry } from "../../core/Geometry";
import { BufferGeometry } from "../../core/BufferGeometry";
import { InterleavedBufferAttribute } from "../../core/InterleavedBufferAttribute";
export class WebGLBufferRenderer {
  gl: WebGLRenderingContext;
  extensions: WebGLExtensions;
  infoRender: any;
  mode: number;
  constructor(gl: WebGLRenderingContext, extensions: WebGLExtensions, infoRender: any) {
    this.gl = gl;
    this.extensions = extensions;
    this.infoRender = infoRender;
  }
  setMode(value: number): void {
    this.mode = value;
  }
  render(start: number, count: number): void {
    const gl: WebGLRenderingContext = this.gl;
    gl.drawArrays(this.mode, start, count);
    this.infoRender.calls ++;
    this.infoRender.vertices += count;
    if (this.mode === gl.TRIANGLES) this.infoRender.faces += count / 3;
  }
  renderInstances(geometry: BufferGeometry): void {
    const gl: WebGLRenderingContext = this.gl;
    const extension = this.extensions.get('ANGLE_instanced_arrays');
    if (extension === null) {
      console.error('THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
      return;
    }
    const position = geometry.attributes.position;
    let count = 0;
    if ((position && position instanceof InterleavedBufferAttribute)) {
      count = position.data.count;
      extension.drawArraysInstancedANGLE(this.mode, 0, count, geometry.maxInstancedCount);
    } else {
      count = position.count;
      extension.drawArraysInstancedANGLE(this.mode, 0, count, geometry.maxInstancedCount);
    }
    this.infoRender.calls ++;
    this.infoRender.vertices += count * geometry.maxInstancedCount;
    if (this.mode === gl.TRIANGLES) this.infoRender.faces += geometry.maxInstancedCount * count / 3;
  }
}
