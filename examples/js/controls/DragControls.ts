/*
 * @author zz85 / https://github.com/zz85
 * Running this will allow you to drag three.js objects around the screen.
 */
import * as THREE from "../../../src/Three";
export class DragControls {
  _camera;
  _objects;
  _domElement;
  _raycaster = new THREE.Raycaster();
  _mouse = new THREE.Vector2();
  _offset = new THREE.Vector3();
  _selected;
  _hovered;
  p3subp1 = new THREE.Vector3();
  targetposition = new THREE.Vector3();
  zerovector = new THREE.Vector3();
  enabled = false;
   /* Custom Event Handling */
  _listeners = {};
  constructor(_camera, _objects, _domElement) {
    this._camera = _camera;
    this._objects = _objects;
    this._domElement = _domElement;
    this.activate();
    this.setObjects(_objects);
  }
  on(event, handler) {
    if (! this._listeners[ event ]) this._listeners[ event ] = [];
    this._listeners[ event ].push(handler);
    return this;
  }
  off(event, handler) {
    let l = this._listeners[ event ];
    if (! l) return this;
    if (l.indexOf(handler) > - 1) {
      l.splice(handler, 1);
    }
    return this;
  }
  notify(event, data, member?) {
    let l = this._listeners[ event ];
    if (! l) return;
    if (! member) {
      for (let i = 0; i < l.length; i ++) {
        l[ i ](data);
      }
    }
  }
  setObjects(objects) {
    if (objects instanceof THREE.Scene) {
      this._objects = objects.children;
    } else {
      this._objects = objects;
    }
  }
  activate() {
    this._domElement.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
    this._domElement.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
    this._domElement.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
  }
  deactivate() {
    this._domElement.removeEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
    this._domElement.removeEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
    this._domElement.removeEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
  }
  dispose() {
    this.deactivate();
  }
  private onDocumentMouseMove(event) {
    event.preventDefault();
    this._mouse.x = (event.clientX / this._domElement.width) * 2 - 1;
    this._mouse.y = - (event.clientY / this._domElement.height) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);
    let ray = this._raycaster.ray;
    if (this._selected && this.enabled) {
      let normal = this._selected.normal;
      // I found this article useful about plane-line intersections
      // http://paulbourke.net/geometry/planeline/
      let denom = normal.dot(ray.direction);
      if (denom === 0) {
        // bail
        console.log('no or infinite solutions');
        return;
      }
      let num = normal.dot(this.p3subp1.copy(this._selected.point).sub(ray.origin));
      let u = num / denom;
      this.targetposition.copy(ray.direction).multiplyScalar(u).add(ray.origin).sub(this._offset);
      // _selected.object.position.copy(targetposition);
      let xLock, yLock, zLock = false;
      let moveX, moveY, moveZ;
      if (xLock) {
        moveX = true;
        moveY = false;
        moveZ = false;
      } else if (yLock) {
        moveX = false;
        moveY = true;
        moveZ = false;
      } else {
        moveX = moveY = moveZ = true;
      }
      // Reverse Matrix?
      if (moveX) this._selected.object.position.x = this.targetposition.x;
      if (moveY) this._selected.object.position.y = this.targetposition.y;
      if (moveZ) this._selected.object.position.z = this.targetposition.z;
      this.notify('drag', this._selected);
      return;
    }
    this._raycaster.setFromCamera(this._mouse, this._camera);
    let intersects = this._raycaster.intersectObjects(this._objects);
    if (intersects.length > 0) {
      this._domElement.style.cursor = 'pointer';
      this._hovered = intersects[ 0 ];
      this.notify('hoveron', this._hovered);
    } else {
      this.notify('hoveroff', this._hovered);
      this._hovered = null;
      this._domElement.style.cursor = 'auto';
    }
  }
  private onDocumentMouseDown(event) {
    event.preventDefault();
    this._mouse.x = (event.clientX / this._domElement.width) * 2 - 1;
    this._mouse.y = - (event.clientY / this._domElement.height) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);
    let intersects = this._raycaster.intersectObjects(this._objects);
    let ray = this._raycaster.ray;
    let normal = ray.direction; // normal ray to the camera position
    if (intersects.length > 0) {
      this._selected = intersects[ 0 ];
      this._selected.ray = ray;
      this._selected.normal = normal ;
      this._offset.copy(this._selected.point).sub(this._selected.object.position);
      this._domElement.style.cursor = 'move';
      this.notify('dragstart', this._selected);
    }
  }
  private onDocumentMouseUp(event) {
    event.preventDefault();
    if (this._selected) {
      this.notify('dragend', this._selected);
      this._selected = null;
    }
    this._domElement.style.cursor = 'auto';
  }
}
