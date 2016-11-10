/**
 * @author tschw
 *
 * Uniforms of a program.
 * Those form a tree structure with a special top-level container for the root,
 * which you get by calling 'new WebGLUniforms(gl, program, renderer)'.
 *
 *
 * Properties of inner nodes including the top-level container:
 *
 * .seq - array of nested uniforms
 * .map - nested uniforms by name
 *
 *
 * Methods of all nodes except the top-level container:
 *
 * .setValue(gl, value, [renderer])
 *
 *     uploads a uniform value(s)
 *    the 'renderer' parameter is needed for sampler uniforms
 *
 *
 * Static methods of the top-level container (renderer factorizations):
 *
 * .upload(gl, seq, values, renderer)
 *
 *     sets uniforms in 'seq' to 'values[id].value'
 *
 * .seqWithValue(seq, values) : filteredSeq
 *
 *     filters 'seq' entries with corresponding entry in values
 *
 *
 * Methods of the top-level container (renderer factorizations):
 *
 * .setValue(gl, name, value)
 *
 *     sets uniform with  name 'name' to 'value'
 *
 * .set(gl, obj, prop)
 *
 *     sets uniform from object and property with same name than uniform
 *
 * .setOptional(gl, obj, prop)
 *
 *     like .set for an optional property of the object
 *
 */
import { CubeTexture } from "../../textures/CubeTexture";
import { Texture } from "../../textures/Texture";
const emptyTexture = new Texture();
const emptyCubeTexture = new CubeTexture();
// --- Base for inner nodes (including the root) ---
class UniformContainer {
  seq: any[] = [];
  map: any[] = [];
}
// --- Utilities ---
// Array Caches (provide typed arrays for temporary by size)
const arrayCacheF32: any[] = [];
const arrayCacheI32: any[] = [];
// Flattening for arrays of vectors and matrices
function flatten(array: any, nBlocks: number, blockSize: number): Float32Array {
  const firstElem = array[0];
  if (firstElem <= 0 || firstElem > 0) return array;
  // unoptimized: ! isNaN(firstElem)
  // see http://jacksondunstan.com/articles/983
  const n = nBlocks * blockSize;
  let r = arrayCacheF32[n];
  if (r === undefined) {
    r = new Float32Array(n);
    arrayCacheF32[n] = r;
  }
  if (nBlocks !== 0) {
    firstElem.toArray(r, 0);
    for (let i = 1, offset = 0; i !== nBlocks; ++ i) {
      offset += blockSize;
      array[i].toArray(r, offset);
    }
  }
  return r;
}
// Texture unit allocation
function allocTexUnits(renderer: any, n: number): any {
  let r = arrayCacheI32[n];
  if (r === undefined) {
    r = new Int32Array(n);
    arrayCacheI32[n] = r;
  }
  for (let i = 0; i !== n; ++ i)
    r[i] = renderer.allocTextureUnit();
  return r;
}
// --- Uniform Classes ---
class SingleUniform {
  id: any;
  addr: any;
  setValue: any;
  constructor(id: any, activeInfo: any, addr: any) {
    this.id = id;
    this.addr = addr;
    this.setValue = this.getSingularSetter(activeInfo.type);
    // this.path = activeInfo.name; // DEBUG
  }
  // Note: Defining these methods externally, because they come in a bunch
  // and this way their names minify.
  // Single scalar
  private setValue1f(gl: WebGLRenderingContext, v: any): void { gl.uniform1f(this.addr, v); }
  private setValue1i(gl: WebGLRenderingContext, v: any): void { gl.uniform1i(this.addr, v); }
  // Single float vector (from flat array or THREE.VectorN)
  private setValue2fv(gl: WebGLRenderingContext, v: any): void {
    if (v.x === undefined) gl.uniform2fv(this.addr, v);
    else gl.uniform2f(this.addr, v.x, v.y);
  }
  private setValue3fv(gl: WebGLRenderingContext, v: any): void {
    if (v.x !== undefined)
      gl.uniform3f(this.addr, v.x, v.y, v.z);
    else if (v.r !== undefined)
      gl.uniform3f(this.addr, v.r, v.g, v.b);
    else
      gl.uniform3fv(this.addr, v);
  }
  private setValue4fv(gl: WebGLRenderingContext, v: any): void {
    if (v.x === undefined) gl.uniform4fv(this.addr, v);
    else gl.uniform4f(this.addr, v.x, v.y, v.z, v.w);
  }
  // Single matrix (from flat array or MatrixN)
  private setValue2fm(gl: WebGLRenderingContext, v: any): void {
    gl.uniformMatrix2fv(this.addr, false, v.elements || v);
  }
  private setValue3fm(gl: WebGLRenderingContext, v: any): void {
    gl.uniformMatrix3fv(this.addr, false, v.elements || v);
  }
  private setValue4fm(gl: WebGLRenderingContext, v: any): void {
    gl.uniformMatrix4fv(this.addr, false, v.elements || v);
  }
  // Single texture (2D / Cube)
  private setValueT1(gl: WebGLRenderingContext, v: any, renderer: any): void {
    const unit = renderer.allocTextureUnit();
    gl.uniform1i(this.addr, unit);
    renderer.setTexture2D(v || emptyTexture, unit);
  }
  private setValueT6(gl: WebGLRenderingContext, v: any, renderer: any): void {
    const unit = renderer.allocTextureUnit();
    gl.uniform1i(this.addr, unit);
    renderer.setTextureCube(v || emptyCubeTexture, unit);
  }
  // Integer / Boolean vectors or arrays thereof (always flat arrays)
  private setValue2iv(gl: WebGLRenderingContext, v: any): void { gl.uniform2iv(this.addr, v); }
  private setValue3iv(gl: WebGLRenderingContext, v: any): void { gl.uniform3iv(this.addr, v); }
  private setValue4iv(gl: WebGLRenderingContext, v: any): void { gl.uniform4iv(this.addr, v); }
  // Helper to pick the right setter for the singular case
  private getSingularSetter(type: number): any {
    switch (type) {
      case 0x1406: return this.setValue1f; // FLOAT
      case 0x8b50: return this.setValue2fv; // _VEC2
      case 0x8b51: return this.setValue3fv; // _VEC3
      case 0x8b52: return this.setValue4fv; // _VEC4
      case 0x8b5a: return this.setValue2fm; // _MAT2
      case 0x8b5b: return this.setValue3fm; // _MAT3
      case 0x8b5c: return this.setValue4fm; // _MAT4
      case 0x8b5e: return this.setValueT1; // SAMPLER_2D
      case 0x8b60: return this.setValueT6; // SAMPLER_CUBE
      case 0x1404: case 0x8b56: return this.setValue1i; // INT, BOOL
      case 0x8b53: case 0x8b57: return this.setValue2iv; // _VEC2
      case 0x8b54: case 0x8b58: return this.setValue3iv; // _VEC3
      case 0x8b55: case 0x8b59: return this.setValue4iv; // _VEC4
    }
  }
}
class PureArrayUniform {
  id: any;
  addr: any;
  size: any;
  setValue: any;
  constructor(id: any, activeInfo: any, addr: any) {
    this.id = id;
    this.addr = addr;
    this.size = activeInfo.size;
    this.setValue = this.getPureArraySetter(activeInfo.type);
    // this.path = activeInfo.name; // DEBUG
  }
  // Array of scalars
  private setValue1fv(gl: WebGLRenderingContext, v: any): void { gl.uniform1fv(this.addr, v); }
  private setValue1iv(gl: WebGLRenderingContext, v: any): void { gl.uniform1iv(this.addr, v); }
  // Array of vectors (flat or from THREE classes)
  private setValueV2a(gl: WebGLRenderingContext, v: any): void {
    gl.uniform2fv(this.addr, flatten(v, this.size, 2));
  }
  private setValueV3a(gl: WebGLRenderingContext, v: any): void {
    gl.uniform3fv(this.addr, flatten(v, this.size, 3));
  }
  private setValueV4a(gl: WebGLRenderingContext, v: any): void {
    gl.uniform4fv(this.addr, flatten(v, this.size, 4));
  }
  // Array of matrices (flat or from THREE clases)
  private setValueM2a(gl: WebGLRenderingContext, v: any): void {
    gl.uniformMatrix2fv(this.addr, false, flatten(v, this.size, 4));
  }
  private setValueM3a(gl: WebGLRenderingContext, v: any): void {
    gl.uniformMatrix3fv(this.addr, false, flatten(v, this.size, 9));
  }
  private setValueM4a(gl: WebGLRenderingContext, v: any): void {
    gl.uniformMatrix4fv(this.addr, false, flatten(v, this.size, 16));
  }
  // Array of textures (2D / Cube)
  private setValueT1a(gl: WebGLRenderingContext, v: any, renderer: any): void {
    const n = v.length,
      units = allocTexUnits(renderer, n);
    gl.uniform1iv(this.addr, units);
    for (let i = 0; i !== n; ++ i) {
      renderer.setTexture2D(v[i] || emptyTexture, units[i]);
    }
  }
  private setValueT6a(gl: WebGLRenderingContext, v: any, renderer: any): void {
    const n = v.length,
      units = allocTexUnits(renderer, n);
    gl.uniform1iv(this.addr, units);
    for (let i = 0; i !== n; ++ i) {
      renderer.setTextureCube(v[i] || emptyCubeTexture, units[i]);
    }
  }
  // Integer / Boolean vectors or arrays thereof (always flat arrays)
  private setValue2iv(gl: WebGLRenderingContext, v: any): void { gl.uniform2iv(this.addr, v); }
  private setValue3iv(gl: WebGLRenderingContext, v: any): void { gl.uniform3iv(this.addr, v); }
  private setValue4iv(gl: WebGLRenderingContext, v: any): void { gl.uniform4iv(this.addr, v); }
  // Helper to pick the right setter for a pure (bottom-level) array
  private getPureArraySetter(type: number): any {
    switch (type) {
      case 0x1406: return this.setValue1fv; // FLOAT
      case 0x8b50: return this.setValueV2a; // _VEC2
      case 0x8b51: return this.setValueV3a; // _VEC3
      case 0x8b52: return this.setValueV4a; // _VEC4
      case 0x8b5a: return this.setValueM2a; // _MAT2
      case 0x8b5b: return this.setValueM3a; // _MAT3
      case 0x8b5c: return this.setValueM4a; // _MAT4
      case 0x8b5e: return this.setValueT1a; // SAMPLER_2D
      case 0x8b60: return this.setValueT6a; // SAMPLER_CUBE
      case 0x1404: case 0x8b56: return this.setValue1iv; // INT, BOOL
      case 0x8b53: case 0x8b57: return this.setValue2iv; // _VEC2
      case 0x8b54: case 0x8b58: return this.setValue3iv; // _VEC3
      case 0x8b55: case 0x8b59: return this.setValue4iv; // _VEC4
    }
  }
}
class StructuredUniform extends UniformContainer {
  id: any;
  constructor(id: any) {
    super(); // mix-in
    this.id = id;
  }
  setValue(gl: WebGLRenderingContext, value: any) {
    // Note: Don't need an extra 'renderer' parameter, since samplers
    // are not allowed in structured uniforms.
    const seq = this.seq;
    for (let i = 0, n = seq.length; i !== n; ++ i) {
      const u = seq[i];
      u.setValue(gl, value[u.id]);
    }
  }
}
// --- Top-level ---
// Parser - builds up the property tree from the path strings
const RePathPart: RegExp = /([\w\d_]+)(\])?(\[|\.)?/g;
// extracts
//   - the identifier (member name or array index)
//  - followed by an optional right bracket (found when array index)
//  - followed by an optional left bracket or dot (type of subscript)
//
// Note: These portions can be read in a non-overlapping fashion and
// allow straightforward parsing of the hierarchy that WebGL encodes
// in the uniform names.
function addUniform(container: any, uniformObject: any) {
  container.seq.push(uniformObject);
  container.map[uniformObject.id] = uniformObject;
}
function parseUniform(activeInfo: any, addr: any, container: any) {
  const path = activeInfo.name;
  const pathLength = path.length;
  // reset RegExp object, because of the early exit of a previous run
  RePathPart.lastIndex = 0;
  for (; ; ) {
    const match = RePathPart.exec(path);
    const matchEnd = RePathPart.lastIndex;
    let id = match[1];
    const idIsIndex = match[2] === ']';
    const subscript = match[3];
    //if (idIsIndex) id = id | 0; // convert to integer
    if (idIsIndex) id = parseInt(id, 10).toString(); // convert to integer
    if (subscript === undefined ||
        subscript === '[' && matchEnd + 2 === pathLength) {
      // bare name or "pure" bottom-level array "[0]" suffix
      addUniform(container, subscript === undefined ?
          new SingleUniform(id, activeInfo, addr) :
          new PureArrayUniform(id, activeInfo, addr));
      break;
    } else {
      // step into inner node / create it in case it doesn't exist
      const map = container.map;
      let next = map[id];
      if (next === undefined) {
        next = new StructuredUniform(id);
        addUniform(container, next);
      }
      container = next;
    }
  }
}
// Root Container
export class WebGLUniforms extends UniformContainer {
  renderer: any;
  constructor(gl: WebGLRenderingContext, program: any, renderer: any) {
    super();
    this.renderer = renderer;
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i !== n; ++ i) {
      const info = gl.getActiveUniform(program, i),
        path = info.name,
        addr = gl.getUniformLocation(program, path);
      parseUniform(info, addr, this);
    }
  }
  setValue(gl: WebGLRenderingContext, name: any, value: any): void {
    const u = this.map[name];
    if (u !== undefined) u.setValue(gl, value, this.renderer);
  }
  set(gl: WebGLRenderingContext, object: any, name: any): void {
    const u = this.map[name];
    if (u !== undefined) u.setValue(gl, object[name], this.renderer);
  }
  setOptional(gl: WebGLRenderingContext, object: any, name: any): void {
    const v = object[name];
    if (v !== undefined) this.setValue(gl, name, v);
  }
  // Static interface
  static upload(gl: WebGLRenderingContext, seq: any, values: any, renderer: any): void {
    for (let i = 0, n = seq.length; i !== n; ++ i) {
      const u = seq[i],
        v = values[u.id];
      if (v.needsUpdate !== false) {
        // note: always updating when .needsUpdate is undefined
        u.setValue(gl, v.value, renderer);
      }
    }
  }
  static seqWithValue(seq: any, values: any): any[] {
    const r = [];
    for (let i = 0, n = seq.length; i !== n; ++ i) {
      const u = seq[i];
      if (u.id in values) r.push(u);
    }
    return r;
  }
}
