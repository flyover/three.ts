/**
 * @author alteredq / http://alteredqualia.com
 */
import { WebGLRenderTarget } from "./WebGLRenderTarget";
export class WebGLRenderTargetCube extends WebGLRenderTarget {
  activeCubeFace: number = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
  activeMipMapLevel: number = 0;
  readonly isWebGLRenderTargetCube: boolean = true;
  constructor(width: number, height: number, options?: any) {
    super(width, height, options);
  }
}
