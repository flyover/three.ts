/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
import * as THREE from "../../../src/Three";
const enum STATE {
  NONE = -1,
  ROTATE = 0,
  DOLLY,
  PAN,
  TOUCH_ROTATE,
  TOUCH_DOLLY,
  TOUCH_PAN
};
const EPS = 0.000001;
export class OrbitControls extends THREE.EventDispatcher {
  object;
  domElement;
  // Set to false to disable this control
  enabled = true;
  // "target" sets the location of focus, where the object orbits around
  target = new THREE.Vector3();
  // How far you can dolly in and out (PerspectiveCamera only)
  minDistance = 0;
  maxDistance = Infinity;
  // How far you can zoom in and out (OrthographicCamera only)
  minZoom = 0;
  maxZoom = Infinity;
  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  minPolarAngle = 0; // radians
  maxPolarAngle = Math.PI; // radians
  // How far you can orbit horizontally, upper and lower limits.
  // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
  minAzimuthAngle = - Infinity; // radians
  maxAzimuthAngle = Infinity; // radians
  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  enableDamping = false;
  dampingFactor = 0.25;
  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  enableZoom = true;
  zoomSpeed = 1.0;
  // Set to false to disable rotating
  enableRotate = true;
  rotateSpeed = 1.0;
  // Set to false to disable panning
  enablePan = true;
  keyPanSpeed = 7.0;  // pixels moved per arrow key push
  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  autoRotate = false;
  autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
  // Set to false to disable use of the keys
  enableKeys = true;
  // The four arrow keys
  keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
  // Mouse buttons
  mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
  target0;
  position0;
  zoom0;
  //
  // internals
  //
  private changeEvent = { type: 'change' };
  private startEvent = { type: 'start' };
  private endEvent = { type: 'end' };
  private state = STATE.NONE;
  //// current position in spherical coordinates
  private spherical = new THREE.Spherical();
  private sphericalDelta = new THREE.Spherical();
  private scale = 1;
  private panOffset = new THREE.Vector3();
  private zoomChanged = false;
  private rotateStart = new THREE.Vector2();
  private rotateEnd = new THREE.Vector2();
  private rotateDelta = new THREE.Vector2();
  private panStart = new THREE.Vector2();
  private panEnd = new THREE.Vector2();
  private panDelta = new THREE.Vector2();
  private dollyStart = new THREE.Vector2();
  private dollyEnd = new THREE.Vector2();
  private dollyDelta = new THREE.Vector2();
  constructor(object, domElement = document.body) {
    super();
    this.object = object;
    this.domElement = domElement;
    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    //
    this.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false);
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
    this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    // force an update at start
    this.update();
  }
  //
  // public methods
  //
  getPolarAngle() {
    return this.spherical.phi;
  }
  getAzimuthalAngle() {
    return this.spherical.theta;
  }
  reset() {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;
    this.object.updateProjectionMatrix();
    this.dispatchEvent(this.changeEvent);
    this.update();
    this.state = STATE.NONE;
  }
  // this method is exposed, but perhaps it would be better if we can make it private...
  update() {
    let offset = new THREE.Vector3();
    // so camera.up is the orbit axis
    let quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0));
    let quatInverse = quat.clone().inverse();
    let lastPosition = new THREE.Vector3();
    let lastQuaternion = new THREE.Quaternion();
    //return function update () {
      let position = this.object.position;
      offset.copy(position).sub(this.target);
      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);
      // angle from z-axis around y-axis
      this.spherical.setFromVector3(offset);
      if (this.autoRotate && this.state === STATE.NONE) {
        this.rotateLeft(this.getAutoRotationAngle());
      }
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
      // restrict theta to be between desired limits
      this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));
      // restrict phi to be between desired limits
      this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));
      this.spherical.makeSafe();
      this.spherical.radius *= this.scale;
      // restrict radius to be between desired limits
      this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));
      // move target to panned location
      this.target.add(this.panOffset);
      offset.setFromSpherical(this.spherical);
      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse);
      position.copy(this.target).add(offset);
      this.object.lookAt(this.target);
      if (this.enableDamping === true) {
        this.sphericalDelta.theta *= (1 - this.dampingFactor);
        this.sphericalDelta.phi *= (1 - this.dampingFactor);
      } else {
        this.sphericalDelta.set(0, 0, 0);
      }
      this.scale = 1;
      this.panOffset.set(0, 0, 0);
      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8
      if (this.zoomChanged ||
        lastPosition.distanceToSquared(this.object.position) > EPS ||
        8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
        this.dispatchEvent(this.changeEvent);
        lastPosition.copy(this.object.position);
        lastQuaternion.copy(this.object.quaternion);
        this.zoomChanged = false;
        return true;
      }
      return false;
    //};
  }
  dispose() {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu.bind(this), false);
    this.domElement.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
    this.domElement.removeEventListener('wheel', this.onMouseWheel.bind(this), false);
    this.domElement.removeEventListener('touchstart', this.onTouchStart.bind(this), false);
    this.domElement.removeEventListener('touchend', this.onTouchEnd.bind(this), false);
    this.domElement.removeEventListener('touchmove', this.onTouchMove.bind(this), false);
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
    window.removeEventListener('keydown', this.onKeyDown.bind(this), false);
    //this.dispatchEvent({ type: 'dispose' }); // should this be added here?
  }
  private getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
  }
  private getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }
  private rotateLeft(angle) {
    this.sphericalDelta.theta -= angle;
  }
  private rotateUp(angle) {
    this.sphericalDelta.phi -= angle;
  }
  private panLeft(distance, objectMatrix) {
    let v = new THREE.Vector3();
    //return function panLeft(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
      v.multiplyScalar(- distance);
      this.panOffset.add(v);
    //};
  }
  private panUp(distance, objectMatrix) {
    let v = new THREE.Vector3();
    //return function panUp(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 1); // get Y column of objectMatrix
      v.multiplyScalar(distance);
      this.panOffset.add(v);
    //};
  }
  // deltaX and deltaY are in pixels; right and down are positive
  private pan(deltaX, deltaY) {
    let offset = new THREE.Vector3();
    //return function pan (deltaX, deltaY) {
      let element = this.domElement === document ? this.domElement.body : this.domElement;
      if (this.object instanceof THREE.PerspectiveCamera) {
        // perspective
        let position = this.object.position;
        offset.copy(position).sub(this.target);
        let targetDistance = offset.length();
        // half of the fov is center to top of screen
        targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);
        // we actually don't use screenWidth, since perspective camera is fixed to screen height
        this.panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
        this.panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
      } else if (this.object instanceof THREE.OrthographicCamera) {
        // orthographic
        this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
        this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
      } else {
        // camera neither orthographic nor perspective
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
        this.enablePan = false;
      }
    //};
  }
  private dollyIn(dollyScale) {
    if (this.object instanceof THREE.PerspectiveCamera) {
      this.scale /= dollyScale;
    } else if (this.object instanceof THREE.OrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
      this.object.updateProjectionMatrix();
      this.zoomChanged = true;
    } else {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
    }
  }
  private dollyOut(dollyScale) {
    if (this.object instanceof THREE.PerspectiveCamera) {
      this.scale *= dollyScale;
    } else if (this.object instanceof THREE.OrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
      this.object.updateProjectionMatrix();
      this.zoomChanged = true;
    } else {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
    }
  }
  //
  // event callbacks - update the object state
  //
  private handleMouseDownRotate(event) {
    //console.log('handleMouseDownRotate');
    this.rotateStart.set(event.clientX, event.clientY);
  }
  private handleMouseDownDolly(event) {
    //console.log('handleMouseDownDolly');
    this.dollyStart.set(event.clientX, event.clientY);
  }
  private handleMouseDownPan(event) {
    //console.log('handleMouseDownPan');
    this.panStart.set(event.clientX, event.clientY);
  }
  private handleMouseMoveRotate(event) {
    //console.log('handleMouseMoveRotate');
    this.rotateEnd.set(event.clientX, event.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    let element = this.domElement === document ? this.domElement.body : this.domElement;
    // rotating across whole screen goes 360 degrees around
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
    // rotating up and down along whole screen attempts to go 360, but limited to 180
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);
    this.rotateStart.copy(this.rotateEnd);
    this.update();
  }
  private handleMouseMoveDolly(event) {
    //console.log('handleMouseMoveDolly');
    this.dollyEnd.set(event.clientX, event.clientY);
    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
    if (this.dollyDelta.y > 0) {
      this.dollyIn(this.getZoomScale());
    } else if (this.dollyDelta.y < 0) {
      this.dollyOut(this.getZoomScale());
    }
    this.dollyStart.copy(this.dollyEnd);
    this.update();
  }
  private handleMouseMovePan(event) {
    //console.log('handleMouseMovePan');
    this.panEnd.set(event.clientX, event.clientY);
    this.panDelta.subVectors(this.panEnd, this.panStart);
    this.pan(this.panDelta.x, this.panDelta.y);
    this.panStart.copy(this.panEnd);
    this.update();
  }
  private handleMouseUp(event) {
    //console.log('handleMouseUp');
  }
  private handleMouseWheel(event) {
    //console.log('handleMouseWheel');
    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }
    this.update();
  }
  private handleKeyDown(event) {
    //console.log('handleKeyDown');
    switch (event.keyCode) {
      case this.keys.UP:
        this.pan(0, this.keyPanSpeed);
        this.update();
        break;
      case this.keys.BOTTOM:
        this.pan(0, - this.keyPanSpeed);
        this.update();
        break;
      case this.keys.LEFT:
        this.pan(this.keyPanSpeed, 0);
        this.update();
        break;
      case this.keys.RIGHT:
        this.pan(- this.keyPanSpeed, 0);
        this.update();
        break;
    }
  }
  private handleTouchStartRotate(event) {
    //console.log('handleTouchStartRotate');
    this.rotateStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
  }
  private handleTouchStartDolly(event) {
    //console.log('handleTouchStartDolly');
    let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
    let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this.dollyStart.set(0, distance);
  }
  private handleTouchStartPan(event) {
    //console.log('handleTouchStartPan');
    this.panStart.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
  }
  private handleTouchMoveRotate(event) {
    //console.log('handleTouchMoveRotate');
    this.rotateEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);
    let element = this.domElement === document ? this.domElement.body : this.domElement;
    // rotating across whole screen goes 360 degrees around
    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientWidth * this.rotateSpeed);
    // rotating up and down along whole screen attempts to go 360, but limited to 180
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed);
    this.rotateStart.copy(this.rotateEnd);
    this.update();
  }
  private handleTouchMoveDolly(event) {
    //console.log('handleTouchMoveDolly');
    let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
    let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this.dollyEnd.set(0, distance);
    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);
    if (this.dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale());
    } else if (this.dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale());
    }
    this.dollyStart.copy(this.dollyEnd);
    this.update();
  }
  private handleTouchMovePan(event) {
    //console.log('handleTouchMovePan');
    this.panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
    this.panDelta.subVectors(this.panEnd, this.panStart);
    this.pan(this.panDelta.x, this.panDelta.y);
    this.panStart.copy(this.panEnd);
    this.update();
  }
  private handleTouchEnd(event) {
    //console.log('handleTouchEnd');
  }
  //
  // event handlers - FSM: listen for events and reset state
  //
  private onMouseDown(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    if (event.button === this.mouseButtons.ORBIT) {
      if (this.enableRotate === false) return;
      this.handleMouseDownRotate(event);
      this.state = STATE.ROTATE;
    } else if (event.button === this.mouseButtons.ZOOM) {
      if (this.enableZoom === false) return;
      this.handleMouseDownDolly(event);
      this.state = STATE.DOLLY;
    } else if (event.button === this.mouseButtons.PAN) {
      if (this.enablePan === false) return;
      this.handleMouseDownPan(event);
      this.state = STATE.PAN;
    }
    if (this.state !== STATE.NONE) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
      document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
      this.dispatchEvent(this.startEvent);
    }
  }
  private onMouseMove(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    if (this.state === STATE.ROTATE) {
      if (this.enableRotate === false) return;
      this.handleMouseMoveRotate(event);
    } else if (this.state === STATE.DOLLY) {
      if (this.enableZoom === false) return;
      this.handleMouseMoveDolly(event);
    } else if (this.state === STATE.PAN) {
      if (this.enablePan === false) return;
      this.handleMouseMovePan(event);
    }
  }
  private onMouseUp(event) {
    if (this.enabled === false) return;
    this.handleMouseUp(event);
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
    this.dispatchEvent(this.endEvent);
    this.state = STATE.NONE;
  }
  private onMouseWheel(event) {
    if (this.enabled === false || this.enableZoom === false || (this.state !== STATE.NONE && this.state !== STATE.ROTATE)) return;
    event.preventDefault();
    event.stopPropagation();
    this.handleMouseWheel(event);
    this.dispatchEvent(this.startEvent); // not sure why these are here...
    this.dispatchEvent(this.endEvent);
  }
  private onKeyDown(event) {
    if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return;
    this.handleKeyDown(event);
  }
  private onTouchStart(event) {
    if (this.enabled === false) return;
    switch (event.touches.length) {
      case 1:  // one-fingered touch: rotate
        if (this.enableRotate === false) return;
        this.handleTouchStartRotate(event);
        this.state = STATE.TOUCH_ROTATE;
        break;
      case 2:  // two-fingered touch: dolly
        if (this.enableZoom === false) return;
        this.handleTouchStartDolly(event);
        this.state = STATE.TOUCH_DOLLY;
        break;
      case 3: // three-fingered touch: pan
        if (this.enablePan === false) return;
        this.handleTouchStartPan(event);
        this.state = STATE.TOUCH_PAN;
        break;
      default:
        this.state = STATE.NONE;
    }
    if (this.state !== STATE.NONE) {
      this.dispatchEvent(this.startEvent);
    }
  }
  private onTouchMove(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();
    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (this.enableRotate === false) return;
        if (this.state !== STATE.TOUCH_ROTATE) return; // is this needed?...
        this.handleTouchMoveRotate(event);
        break;
      case 2: // two-fingered touch: dolly
        if (this.enableZoom === false) return;
        if (this.state !== STATE.TOUCH_DOLLY) return; // is this needed?...
        this.handleTouchMoveDolly(event);
        break;
      case 3: // three-fingered touch: pan
        if (this.enablePan === false) return;
        if (this.state !== STATE.TOUCH_PAN) return; // is this needed?...
        this.handleTouchMovePan(event);
        break;
      default:
        this.state = STATE.NONE;
    }
  }
  private onTouchEnd(event) {
    if (this.enabled === false) return;
    this.handleTouchEnd(event);
    this.dispatchEvent(this.endEvent);
    this.state = STATE.NONE;
  }
  private onContextMenu(event) {
    event.preventDefault();
  }
  get center() {
    console.warn('THREE.OrbitControls: .center has been renamed to .target');
    return this.target;
  }
  // backward compatibility
  get noZoom () {
    console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
    return ! this.enableZoom;
  }
  set noZoom (value) {
    console.warn('THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.');
    this.enableZoom = ! value;
  }
  get noRotate () {
    console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
    return ! this.enableRotate;
  }
  set noRotate (value) {
    console.warn('THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.');
    this.enableRotate = ! value;
  }
  get noPan () {
    console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
    return ! this.enablePan;
  }
  set noPan (value) {
    console.warn('THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.');
    this.enablePan = ! value;
  }
  get noKeys () {
    console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
    return ! this.enableKeys;
  }
  set noKeys (value) {
    console.warn('THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.');
    this.enableKeys = ! value;
  }
  get staticMoving () {
    console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
    return ! this.enableDamping;
  }
  set staticMoving (value) {
    console.warn('THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.');
    this.enableDamping = ! value;
  }
  get dynamicDampingFactor () {
    console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
    return this.dampingFactor;
  }
  set dynamicDampingFactor (value) {
    console.warn('THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.');
    this.dampingFactor = value;
  }
}
