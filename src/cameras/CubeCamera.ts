import { Object3D } from "../core/Object3D";
import { WebGLRenderTargetCube } from "../renderers/WebGLRenderTargetCube";
import { TextureFilter, TextureFormat } from "../constants";
import { Vector3 } from "../math/Vector3";
import { PerspectiveCamera } from "./PerspectiveCamera";
import { Scene } from "../scenes/Scene";
/**
 * Camera for rendering cube maps
 *  - renders scene into axis-aligned cube
 *
 * @author alteredq / http://alteredqualia.com/
 */
export class CubeCamera extends Object3D {
  cameraPX: PerspectiveCamera;
  cameraNX: PerspectiveCamera;
  cameraPY: PerspectiveCamera;
  cameraNY: PerspectiveCamera;
  cameraPZ: PerspectiveCamera;
  cameraNZ: PerspectiveCamera;
  renderTarget: WebGLRenderTargetCube;
  constructor(near: number, far: number, cubeResolution: number) {
    super();
    this.type = 'CubeCamera';
    const fov = 90, aspect = 1;
    this.cameraPX = new PerspectiveCamera(fov, aspect, near, far);
    this.cameraPX.up.set(0, - 1, 0);
    this.cameraPX.lookAt(new Vector3(1, 0, 0));
    this.add(this.cameraPX);
    this.cameraNX = new PerspectiveCamera(fov, aspect, near, far);
    this.cameraNX.up.set(0, - 1, 0);
    this.cameraNX.lookAt(new Vector3(- 1, 0, 0));
    this.add(this.cameraNX);
    this.cameraPY = new PerspectiveCamera(fov, aspect, near, far);
    this.cameraPY.up.set(0, 0, 1);
    this.cameraPY.lookAt(new Vector3(0, 1, 0));
    this.add(this.cameraPY);
    this.cameraNY = new PerspectiveCamera(fov, aspect, near, far);
    this.cameraNY.up.set(0, 0, - 1);
    this.cameraNY.lookAt(new Vector3(0, - 1, 0));
    this.add(this.cameraNY);
    this.cameraPZ = new PerspectiveCamera(fov, aspect, near, far);
    this.cameraPZ.up.set(0, - 1, 0);
    this.cameraPZ.lookAt(new Vector3(0, 0, 1));
    this.add(this.cameraPZ);
    this.cameraNZ = new PerspectiveCamera(fov, aspect, near, far);
    this.cameraNZ.up.set(0, - 1, 0);
    this.cameraNZ.lookAt(new Vector3(0, 0, - 1));
    this.add(this.cameraNZ);
    const options = { format: TextureFormat.RGB, magFilter: TextureFilter.Linear, minFilter: TextureFilter.Linear };
    this.renderTarget = new WebGLRenderTargetCube(cubeResolution, cubeResolution, options);
  }
  updateCubeMap(renderer: any, scene: Scene): void {
    if (this.parent === null) this.updateMatrixWorld();
    const renderTarget = this.renderTarget;
    const generateMipmaps = renderTarget.texture.generateMipmaps;
    renderTarget.texture.generateMipmaps = false;
    renderTarget.activeCubeFace = 0;
    renderer.render(scene, this.cameraPX, renderTarget);
    renderTarget.activeCubeFace = 1;
    renderer.render(scene, this.cameraNX, renderTarget);
    renderTarget.activeCubeFace = 2;
    renderer.render(scene, this.cameraPY, renderTarget);
    renderTarget.activeCubeFace = 3;
    renderer.render(scene, this.cameraNY, renderTarget);
    renderTarget.activeCubeFace = 4;
    renderer.render(scene, this.cameraPZ, renderTarget);
    renderTarget.texture.generateMipmaps = generateMipmaps;
    renderTarget.activeCubeFace = 5;
    renderer.render(scene, this.cameraNZ, renderTarget);
    renderer.setRenderTarget(null);
  }
}
