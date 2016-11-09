/**
 * @author mrdoob / http://mrdoob.com/
 */
export class WebGLIndexedBufferRenderer {
  gl: WebGLRenderingContext;
  extensions: any;
  infoRender: any;
  mode: number;
  type: number;
  size: number;
  constructor(gl: WebGLRenderingContext, extensions: any, infoRender: any) {
    this.gl = gl;
    this.extensions = extensions;
    this.infoRender = infoRender;
  }
  setMode(value: number): void {
    this.mode = value;
  }
  setIndex(index): void {
    if (index.array instanceof Uint32Array && this.extensions.get('OES_element_index_uint')) {
      this.type = this.gl.UNSIGNED_INT;
      this.size = 4;
    } else {
      this.type = this.gl.UNSIGNED_SHORT;
      this.size = 2;
    }
  }
  render(start: number, count: number): void {
    this.gl.drawElements(this.mode, count, this.type, start * this.size);
    this.infoRender.calls ++;
    this.infoRender.vertices += count;
    if (this.mode === this.gl.TRIANGLES) this.infoRender.faces += count / 3;
  }
  renderInstances(geometry: any, start: number, count: number): void {
    const extension = this.extensions.get('ANGLE_instanced_arrays');
    if (extension === null) {
      console.error('THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
      return;
    }
    extension.drawElementsInstancedANGLE(this.mode, count, this.type, start * this.size, geometry.maxInstancedCount);
    this.infoRender.calls ++;
    this.infoRender.vertices += count * geometry.maxInstancedCount;
    if (this.mode === this.gl.TRIANGLES) this.infoRender.faces += geometry.maxInstancedCount * count / 3;
  }
}
