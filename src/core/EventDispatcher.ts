/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */
export class EventDispatcher {
  _listeners: any;
  addEventListener(type: string, listener: (event: any) => void): void {
    if (this._listeners === undefined) this._listeners = {};
    const listeners = this._listeners;
    if (listeners[type] === undefined) {
      listeners[type] = [];
    }
    if (listeners[type].indexOf(listener) === - 1) {
      listeners[type].push(listener);
    }
  }
  hasEventListener(type: string, listener: (event: any) => void): boolean {
    if (this._listeners === undefined) return false;
    const listeners = this._listeners;
    if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1) {
      return true;
    }
    return false;
  }
  removeEventListener(type: string, listener: (event: any) => void): void {
    if (this._listeners === undefined) return;
    const listeners = this._listeners;
    const listenerArray = listeners[type];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== - 1) {
        listenerArray.splice(index, 1);
      }
    }
  }
  dispatchEvent(event: any): void {
    if (this._listeners === undefined) return;
    const listeners = this._listeners;
    const listenerArray = listeners[event.type];
    if (listenerArray !== undefined) {
      event.target = this;
      const array = [];
      const length = listenerArray.length;
      for (let i = 0; i < length; i ++) {
        array[i] = listenerArray[i];
      }
      for (let i = 0; i < length; i ++) {
        array[i].call(this, event);
      }
    }
  }
  apply(target: any): void {
    console.warn("THREE.EventDispatcher: .apply is deprecated, " +
        "just inherit or Object.assign the prototype to mix-in.");
    Object.assign(target, this);
  }
}
