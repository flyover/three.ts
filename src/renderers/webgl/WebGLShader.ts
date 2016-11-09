/**
 * @author mrdoob / http://mrdoob.com/
 */
function addLineNumbers(code: string): string {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i ++) {
    lines[i] = (i + 1) + ': ' + lines[i];
  }
  return lines.join('\n');
}
export function WebGLShader(gl: WebGLRenderingContext, type: number, code: string): WebGLShader {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
    console.error('THREE.WebGLShader: Shader couldn\'t compile.');
  }
  if (gl.getShaderInfoLog(shader) !== '') {
    console.warn('THREE.WebGLShader: gl.getShaderInfoLog()', type === gl.VERTEX_SHADER ? 'vertex' : 'fragment', gl.getShaderInfoLog(shader), addLineNumbers(code));
  }
  // --enable-privileged-webgl-extension
  // console.log(type, gl.getExtension('WEBGL_debug_shaders').getTranslatedShaderSource(shader));
  return shader;
}
