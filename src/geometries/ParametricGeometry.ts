import { Geometry } from "../core/Geometry";
import { ParametricBufferGeometry } from "./ParametricBufferGeometry";
/**
 * @author zz85 / https://github.com/zz85
 *
 * Parametric Surfaces Geometry
 * based on the brilliant article by @prideout http://prideout.net/blog/?p=44
 */
export class ParametricGeometry extends Geometry {
  constructor(func, slices, stacks) {
    super();
    this.type = 'ParametricGeometry';
    this.parameters = {
      func: func,
      slices: slices,
      stacks: stacks
    };
    this.fromBufferGeometry(new ParametricBufferGeometry(func, slices, stacks));
    this.mergeVertices();
  }
}
