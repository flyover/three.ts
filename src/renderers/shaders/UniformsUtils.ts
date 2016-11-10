/**
 * Uniform Utilities
 */
import { Color } from "../../math/Color";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { Matrix3 } from "../../math/Matrix3";
import { Matrix4 } from "../../math/Matrix4";
import { Texture } from "../../textures/Texture";
export class UniformsUtils {
  static merge(uniforms: any): any {
    const merged = {};
    for (let u = 0; u < uniforms.length; u ++) {
      const tmp = UniformsUtils.clone(uniforms[u]);
      for (let p in tmp) {
        merged[p] = tmp[p];
      }
    }
    return merged;
  }
  static clone(uniforms_src: any): any {
    const uniforms_dst = {};
    for (let u in uniforms_src) {
      uniforms_dst[u] = {};
      for (let p in uniforms_src[u]) {
        const parameter_src = uniforms_src[u][p];
        if (parameter_src && (parameter_src instanceof Color ||
          parameter_src instanceof Matrix3 || parameter_src instanceof Matrix4 ||
          parameter_src instanceof Vector2 || parameter_src instanceof Vector3 || parameter_src instanceof Vector4 ||
          parameter_src instanceof Texture)) {
          uniforms_dst[u][p] = parameter_src.clone();
        } else if (Array.isArray(parameter_src)) {
          uniforms_dst[u][p] = parameter_src.slice();
        } else {
          uniforms_dst[u][p] = parameter_src;
        }
      }
    }
    return uniforms_dst;
  }
}
