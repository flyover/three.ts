/**
 * @author fordacious / fordacious.github.io
 */
export class WebGLProperties {
  properties: any = {};
  get(object: any): any {
    const uuid = object.uuid;
    let map = this.properties[uuid];
    if (map === undefined) {
      map = {};
      this.properties[uuid] = map;
    }
    return map;
  }
  delete(object: any) {
    delete this.properties[object.uuid];
  }
  clear(): void {
    this.properties = {};
  }
}
