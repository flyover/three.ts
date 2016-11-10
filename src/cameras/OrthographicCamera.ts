import { Camera } from "./Camera";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author arose / http://github.com/arose
 */
export class OrthographicCamera extends Camera {
  zoom: number = 1;
  view: any = null;
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
  readonly isOrthographicCamera: boolean = true;
  constructor(left: number, right: number, top: number, bottom: number, near: number = 0.1, far: number = 2000) {
    super();
    this.type = 'OrthographicCamera';
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
  }
  copy(source: this): this {
    super.copy(source);
    this.left = source.left;
    this.right = source.right;
    this.top = source.top;
    this.bottom = source.bottom;
    this.near = source.near;
    this.far = source.far;
    this.zoom = source.zoom;
    this.view = source.view === null ? null : Object.assign({}, source.view);
    return this;
  }
  setViewOffset(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number): void {
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
    const dx = (this.right - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.right + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;
    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;
    if (this.view !== null) {
      const zoomW = this.zoom / (this.view.width / this.view.fullWidth);
      const zoomH = this.zoom / (this.view.height / this.view.fullHeight);
      const scaleW = (this.right - this.left) / this.view.width;
      const scaleH = (this.top - this.bottom) / this.view.height;
      left += scaleW * (this.view.offsetX / zoomW);
      right = left + scaleW * (this.view.width / zoomW);
      top -= scaleH * (this.view.offsetY / zoomH);
      bottom = top - scaleH * (this.view.height / zoomH);
    }
    this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
  }
  toJSON(meta: any): any {
    const data = super.toJSON(meta);
    data.object.zoom = this.zoom;
    data.object.left = this.left;
    data.object.right = this.right;
    data.object.top = this.top;
    data.object.bottom = this.bottom;
    data.object.near = this.near;
    data.object.far = this.far;
    if (this.view !== null) data.object.view = Object.assign({}, this.view);
    return data;
  }
}
