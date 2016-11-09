/**
 * @author mrdoob / http://mrdoob.com/
 */
export class Uniform {
  value: any;
  constructor(value: any) {
    if (typeof value === 'string') {
      console.warn('THREE.Uniform: Type parameter is no longer needed.');
      value = arguments[1];
    }
    this.value = value;
  }
  set dynamic(value) {
    console.warn('THREE.Uniform: .dynamic has been removed. Use object.onBeforeRender() instead.');
  }
  onUpdate(callback: () => void): Uniform {
    console.warn('THREE.Uniform: .onUpdate() has been removed. Use object.onBeforeRender() instead.');
    return this;
  }
}
