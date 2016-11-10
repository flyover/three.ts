import { Camera } from "./Camera";
import { _Math } from "../math/Math";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 */
export class PerspectiveCamera extends Camera {
  fov: number;
  zoom: number = 1;
  near: number;
  far: number;
  focus: number = 10;
  aspect: number;
  view: any = null;
  filmGauge: number = 35; // width of the film (default in millimeters)
  filmOffset: number = 0; // horizontal film offset (same unit as gauge)
  readonly isPerspectiveCamera: boolean = true;
  constructor(fov: number = 50, aspect: number = 1, near: number = 0.1, far: number = 2000) {
    super();
    this.type = 'PerspectiveCamera';
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = aspect;
    this.updateProjectionMatrix();
  }
  copy(source: this): this {
    super.copy(source);
    this.fov = source.fov;
    this.zoom = source.zoom;
    this.near = source.near;
    this.far = source.far;
    this.focus = source.focus;
    this.aspect = source.aspect;
    this.view = source.view === null ? null : Object.assign({}, source.view);
    this.filmGauge = source.filmGauge;
    this.filmOffset = source.filmOffset;
    return this;
  }
  setLens(focalLength: number, filmGauge: number): void {
    console.warn("THREE.PerspectiveCamera.setLens is deprecated. " +
        "Use .setFocalLength and .filmGauge for a photographic setup.");
    if (filmGauge !== undefined) this.filmGauge = filmGauge;
    this.setFocalLength(focalLength);
  }
  /**
   * Sets the FOV by focal length in respect to the current .filmGauge.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(focalLength: number): void {
    // see http://www.bobatkins.com/photography/technical/field_of_view.html
    const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;
    this.fov = _Math.RAD2DEG * 2 * Math.atan(vExtentSlope);
    this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength(): number {
    const vExtentSlope = Math.tan(_Math.DEG2RAD * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / vExtentSlope;
  }
  getEffectiveFOV(): number {
    return _Math.RAD2DEG * 2 * Math.atan(
        Math.tan(_Math.DEG2RAD * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth(): number {
    // film not completely covered in portrait format (aspect < 1)
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight(): number {
    // film not completely covered in landscape format (aspect > 1)
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *
   * then for each monitor you would call it like this
   *
   *   let w = 1920;
   *   let h = 1080;
   *   let fullWidth = w * 3;
   *   let fullHeight = h * 2;
   *
   *   --A--
   *   camera.setOffset(fullWidth, fullHeight, w * 0, h * 0, w, h);
   *   --B--
   *   camera.setOffset(fullWidth, fullHeight, w * 1, h * 0, w, h);
   *   --C--
   *   camera.setOffset(fullWidth, fullHeight, w * 2, h * 0, w, h);
   *   --D--
   *   camera.setOffset(fullWidth, fullHeight, w * 0, h * 1, w, h);
   *   --E--
   *   camera.setOffset(fullWidth, fullHeight, w * 1, h * 1, w, h);
   *   --F--
   *   camera.setOffset(fullWidth, fullHeight, w * 2, h * 1, w, h);
   *
   *   Note there is no reason monitors have to be the same size or in a grid.
   */
  setViewOffset(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number): void {
    this.aspect = fullWidth / fullHeight;
    this.view = {
      fullWidth: fullWidth,
      fullHeight: fullHeight,
      offsetX: x,
      offsetY: y,
      width: width,
      height: height
    };
    this.updateProjectionMatrix();
  }
  clearViewOffset(): void {
    this.view = null;
    this.updateProjectionMatrix();
  }
  updateProjectionMatrix(): void {
    const near = this.near;
    let top = near * Math.tan(
          _Math.DEG2RAD * 0.5 * this.fov) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = - 0.5 * width;
    const view = this.view;
    if (view !== null) {
      const fullWidth = view.fullWidth,
        fullHeight = view.fullHeight;
      left += view.offsetX * width / fullWidth;
      top -= view.offsetY * height / fullHeight;
      width *= view.width / fullWidth;
      height *= view.height / fullHeight;
    }
    const skew = this.filmOffset;
    if (skew !== 0) left += near * skew / this.getFilmWidth();
    this.projectionMatrix.makeFrustum(
        left, left + width, top - height, top, near, this.far);
  }
  toJSON(meta: any): any {
    const data = super.toJSON(meta);
    data.object.fov = this.fov;
    data.object.zoom = this.zoom;
    data.object.near = this.near;
    data.object.far = this.far;
    data.object.focus = this.focus;
    data.object.aspect = this.aspect;
    if (this.view !== null) data.object.view = Object.assign({}, this.view);
    data.object.filmGauge = this.filmGauge;
    data.object.filmOffset = this.filmOffset;
    return data;
  }
}
