import { Box2 } from "../../../math/Box2";
import { Vector2 } from "../../../math/Vector2";
import { Vector3 } from "../../../math/Vector3";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */
export class LensFlarePlugin {
  renderer: any;
  flares: any;
  vertexBuffer: any;
  elementBuffer: any;
  shader: any;
  program: any;
  attributes: any;
  uniforms: any;
  tempTexture: any;
  occlusionTexture: any;
  constructor(renderer: any, flares: any) {
    this.renderer = renderer;
    this.flares = flares;
  }
  init(): void {
    const gl: WebGLRenderingContext = this.renderer.context;
    const state = this.renderer.state;
    const vertices = new Float32Array([
      - 1, - 1,  0, 0,
       1, - 1,  1, 0,
       1,  1,  1, 1,
      - 1,  1,  0, 1
    ]);
    const faces = new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ]);
    // buffers
    const vertexBuffer = this.vertexBuffer = gl.createBuffer();
    const elementBuffer = this.elementBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);
    // textures
    const tempTexture = this.tempTexture = gl.createTexture();
    const occlusionTexture = this.occlusionTexture = gl.createTexture();
    state.bindTexture(gl.TEXTURE_2D, tempTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 16, 16, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    state.bindTexture(gl.TEXTURE_2D, occlusionTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    const shader = this.shader = {
      vertexShader: [
        "uniform lowp int renderType;",
        "uniform vec3 screenPosition;",
        "uniform vec2 scale;",
        "uniform float rotation;",
        "uniform sampler2D occlusionMap;",
        "attribute vec2 position;",
        "attribute vec2 uv;",
        "varying vec2 vUV;",
        "varying float vVisibility;",
        "void main() {",
          "vUV = uv;",
          "vec2 pos = position;",
          "if (renderType == 2) {",
            "vec4 visibility = texture2D(occlusionMap, vec2(0.1, 0.1));",
            "visibility += texture2D(occlusionMap, vec2(0.5, 0.1));",
            "visibility += texture2D(occlusionMap, vec2(0.9, 0.1));",
            "visibility += texture2D(occlusionMap, vec2(0.9, 0.5));",
            "visibility += texture2D(occlusionMap, vec2(0.9, 0.9));",
            "visibility += texture2D(occlusionMap, vec2(0.5, 0.9));",
            "visibility += texture2D(occlusionMap, vec2(0.1, 0.9));",
            "visibility += texture2D(occlusionMap, vec2(0.1, 0.5));",
            "visibility += texture2D(occlusionMap, vec2(0.5, 0.5));",
            "vVisibility =        visibility.r / 9.0;",
            "vVisibility *= 1.0 - visibility.g / 9.0;",
            "vVisibility *=       visibility.b / 9.0;",
            "vVisibility *= 1.0 - visibility.a / 9.0;",
            "pos.x = cos(rotation) * position.x - sin(rotation) * position.y;",
            "pos.y = sin(rotation) * position.x + cos(rotation) * position.y;",
          "}",
          "gl_Position = vec4((pos * scale + screenPosition.xy).xy, screenPosition.z, 1.0);",
        "}"
      ].join("\n"),
      fragmentShader: [
        "uniform lowp int renderType;",
        "uniform sampler2D map;",
        "uniform float opacity;",
        "uniform vec3 color;",
        "varying vec2 vUV;",
        "varying float vVisibility;",
        "void main() {",
          // pink square
          "if (renderType == 0) {",
            "gl_FragColor = vec4(1.0, 0.0, 1.0, 0.0);",
          // restore
          "} else if (renderType == 1) {",
            "gl_FragColor = texture2D(map, vUV);",
          // flare
          "} else {",
            "vec4 texture = texture2D(map, vUV);",
            "texture.a *= opacity * vVisibility;",
            "gl_FragColor = texture;",
            "gl_FragColor.rgb *= color;",
          "}",
        "}"
      ].join("\n")
    };
    const program = this.program = this.createProgram(shader);
    this.attributes = {
      vertex: gl.getAttribLocation (program, "position"),
      uv:     gl.getAttribLocation (program, "uv")
    };
    this.uniforms = {
      renderType:     gl.getUniformLocation(program, "renderType"),
      map:            gl.getUniformLocation(program, "map"),
      occlusionMap:   gl.getUniformLocation(program, "occlusionMap"),
      opacity:        gl.getUniformLocation(program, "opacity"),
      color:          gl.getUniformLocation(program, "color"),
      scale:          gl.getUniformLocation(program, "scale"),
      rotation:       gl.getUniformLocation(program, "rotation"),
      screenPosition: gl.getUniformLocation(program, "screenPosition")
    };
  }
  /*
   * Render lens flares
   * Method: renders 16x16 0xff00ff-colored points scattered over the light source area,
   *         reads these back and calculates occlusion.
   */
  render(scene: any, camera: any, viewport: any): void {
    const gl: WebGLRenderingContext = this.renderer.context;
    const state = this.renderer.state;
    const flares = this.flares;
    if (flares.length === 0) return;
    const tempPosition = new Vector3();
    const invAspect = viewport.w / viewport.z;
    const halfViewportWidth = viewport.z * 0.5;
    const halfViewportHeight = viewport.w * 0.5;
    let size = 16 / viewport.w;
    const scale = new Vector2(size * invAspect, size);
    const screenPosition = new Vector3(1, 1, 0);
    const screenPositionPixels = new Vector2(1, 1);
    const validArea = new Box2();
    validArea.min.set(viewport.x, viewport.y);
    validArea.max.set(viewport.x + (viewport.z - 16), viewport.y + (viewport.w - 16));
    if (this.program === undefined) {
      this.init();
    }
    const uniforms = this.uniforms;
    const attributes = this.attributes;
    gl.useProgram(this.program);
    state.initAttributes();
    state.enableAttribute(attributes.vertex);
    state.enableAttribute(attributes.uv);
    state.disableUnusedAttributes();
    // loop through all lens flares to update their occlusion and positions
    // setup gl and common used attribs/uniforms
    gl.uniform1i(uniforms.occlusionMap, 0);
    gl.uniform1i(uniforms.map, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(attributes.vertex, 2, gl.FLOAT, false, 2 * 8, 0);
    gl.vertexAttribPointer(attributes.uv, 2, gl.FLOAT, false, 2 * 8, 8);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    state.disable(gl.CULL_FACE);
    state.setDepthWrite(false);
    for (let i = 0, l = flares.length; i < l; i ++) {
      size = 16 / viewport.w;
      scale.set(size * invAspect, size);
      // calc object screen position
      const flare = flares[i];
      tempPosition.set(flare.matrixWorld.elements[12], flare.matrixWorld.elements[13], flare.matrixWorld.elements[14]);
      tempPosition.applyMatrix4(camera.matrixWorldInverse);
      tempPosition.applyProjection(camera.projectionMatrix);
      // setup arrays for gl programs
      screenPosition.copy(tempPosition);
      // horizontal and vertical coordinate of the lower left corner of the pixels to copy
      screenPositionPixels.x = viewport.x + (screenPosition.x * halfViewportWidth) + halfViewportWidth - 8;
      screenPositionPixels.y = viewport.y + (screenPosition.y * halfViewportHeight) + halfViewportHeight - 8;
      // screen cull
      if (validArea.containsPoint(screenPositionPixels) === true) {
        // save current RGB to temp texture
        state.activeTexture(gl.TEXTURE0);
        state.bindTexture(gl.TEXTURE_2D, null);
        state.activeTexture(gl.TEXTURE1);
        state.bindTexture(gl.TEXTURE_2D, this.tempTexture);
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGB, screenPositionPixels.x, screenPositionPixels.y, 16, 16, 0);
        // render pink quad
        gl.uniform1i(uniforms.renderType, 0);
        gl.uniform2f(uniforms.scale, scale.x, scale.y);
        gl.uniform3f(uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z);
        state.disable(gl.BLEND);
        state.enable(gl.DEPTH_TEST);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        // copy result to occlusionMap
        state.activeTexture(gl.TEXTURE0);
        state.bindTexture(gl.TEXTURE_2D, this.occlusionTexture);
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screenPositionPixels.x, screenPositionPixels.y, 16, 16, 0);
        // restore graphics
        gl.uniform1i(uniforms.renderType, 1);
        state.disable(gl.DEPTH_TEST);
        state.activeTexture(gl.TEXTURE1);
        state.bindTexture(gl.TEXTURE_2D, this.tempTexture);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        // update object positions
        flare.positionScreen.copy(screenPosition);
        if (flare.customUpdateCallback) {
          flare.customUpdateCallback(flare);
        } else {
          flare.updateLensFlares();
        }
        // render flares
        gl.uniform1i(uniforms.renderType, 2);
        state.enable(gl.BLEND);
        for (let j = 0, jl = flare.lensFlares.length; j < jl; j ++) {
          const sprite = flare.lensFlares[j];
          if (sprite.opacity > 0.001 && sprite.scale > 0.001) {
            screenPosition.x = sprite.x;
            screenPosition.y = sprite.y;
            screenPosition.z = sprite.z;
            size = sprite.size * sprite.scale / viewport.w;
            scale.x = size * invAspect;
            scale.y = size;
            gl.uniform3f(uniforms.screenPosition, screenPosition.x, screenPosition.y, screenPosition.z);
            gl.uniform2f(uniforms.scale, scale.x, scale.y);
            gl.uniform1f(uniforms.rotation, sprite.rotation);
            gl.uniform1f(uniforms.opacity, sprite.opacity);
            gl.uniform3f(uniforms.color, sprite.color.r, sprite.color.g, sprite.color.b);
            state.setBlending(sprite.blending, sprite.blendEquation, sprite.blendSrc, sprite.blendDst);
            this.renderer.setTexture2D(sprite.texture, 1);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
          }
        }
      }
    }
    // restore gl
    state.enable(gl.CULL_FACE);
    state.enable(gl.DEPTH_TEST);
    state.setDepthWrite(true);
    this.renderer.resetGLState();
  }
  createProgram(shader: any): WebGLProgram {
    const gl: WebGLRenderingContext = this.renderer.context;
    const program = gl.createProgram();
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const prefix = "precision " + this.renderer.getPrecision() + " float;\n";
    gl.shaderSource(fragmentShader, prefix + shader.fragmentShader);
    gl.shaderSource(vertexShader, prefix + shader.vertexShader);
    gl.compileShader(fragmentShader);
    gl.compileShader(vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.linkProgram(program);
    return program;
  }
}
