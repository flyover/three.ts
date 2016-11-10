/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin   / http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga   / http://lantiga.github.io
 */
import * as THREE from "../../../src/Three";
const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };
const EPS = 0.000001;
export class TrackballControls extends THREE.EventDispatcher {
  object;
  domElement;
  // API
  enabled = true;
  screen = { left: 0, top: 0, width: 0, height: 0 };
  rotateSpeed = 1.0;
  zoomSpeed = 1.2;
  panSpeed = 0.3;
  noRotate = false;
  noZoom = false;
  noPan = false;
  staticMoving = false;
  dynamicDampingFactor = 0.2;
  minDistance = 0;
  maxDistance = Infinity;
  keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
  // internals
  private target = new THREE.Vector3();
  private lastPosition = new THREE.Vector3();
  private _state = STATE.NONE;
  private _prevState = STATE.NONE;
  private _eye = new THREE.Vector3();
  private _movePrev = new THREE.Vector2();
  private _moveCurr = new THREE.Vector2();
  private _lastAxis = new THREE.Vector3();
  private _lastAngle = 0;
  private _zoomStart = new THREE.Vector2();
  private _zoomEnd = new THREE.Vector2();
  private _touchZoomDistanceStart = 0;
  private _touchZoomDistanceEnd = 0;
  private _panStart = new THREE.Vector2();
  private _panEnd = new THREE.Vector2();
  // for reset
  private target0;
  private position0;
  private up0;
  // events
  private changeEvent = { type: 'change' };
  private startEvent = { type: 'start' };
  private endEvent = { type: 'end' };
  constructor(object, domElement) {
    super();
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;
    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();
    this.domElement.addEventListener('contextmenu', this.contextmenu.bind(this), false);
    this.domElement.addEventListener('mousedown', this.mousedown.bind(this), false);
    this.domElement.addEventListener('wheel', this.mousewheel.bind(this), false);
    this.domElement.addEventListener('touchstart', this.touchstart.bind(this), false);
    this.domElement.addEventListener('touchend', this.touchend.bind(this), false);
    this.domElement.addEventListener('touchmove', this.touchmove.bind(this), false);
    window.addEventListener('keydown', this.keydown.bind(this), false);
    window.addEventListener('keyup', this.keyup.bind(this), false);
    this.handleResize();
    // force an update at start
    this.update();
  }
  // methods
  handleResize() {
    if (this.domElement === document) {
      this.screen.left = 0;
      this.screen.top = 0;
      this.screen.width = window.innerWidth;
      this.screen.height = window.innerHeight;
    } else {
      let box = this.domElement.getBoundingClientRect();
      // adjustments come from similar code in the jquery offset() function
      let d = this.domElement.ownerDocument.documentElement;
      this.screen.left = box.left + window.pageXOffset - d.clientLeft;
      this.screen.top = box.top + window.pageYOffset - d.clientTop;
      this.screen.width = box.width;
      this.screen.height = box.height;
    }
  }
  handleEvent(event) {
    if (typeof this[ event.type ] === 'function') {
      this[ event.type ](event);
    }
  }
  private getMouseOnScreen(pageX, pageY) {
    let vector = new THREE.Vector2();
    //return function getMouseOnScreen(pageX, pageY) {
      vector.set(
        (pageX - this.screen.left) / this.screen.width,
        (pageY - this.screen.top) / this.screen.height
      );
      return vector;
    //};
  }
  private getMouseOnCircle(pageX, pageY) {
    let vector = new THREE.Vector2();
    //return function getMouseOnCircle(pageX, pageY) {
      vector.set(
        ((pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5)),
        ((this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width) // screen.width intentional
      );
      return vector;
    //};
  }
  rotateCamera() {
    let axis = new THREE.Vector3(),
      quaternion = new THREE.Quaternion(),
      eyeDirection = new THREE.Vector3(),
      objectUpDirection = new THREE.Vector3(),
      objectSidewaysDirection = new THREE.Vector3(),
      moveDirection = new THREE.Vector3(),
      angle;
    //return function rotateCamera() {
      moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0);
      angle = moveDirection.length();
      if (angle) {
        this._eye.copy(this.object.position).sub(this.target);
        eyeDirection.copy(this._eye).normalize();
        objectUpDirection.copy(this.object.up).normalize();
        objectSidewaysDirection.crossVectors(objectUpDirection, eyeDirection).normalize();
        objectUpDirection.setLength(this._moveCurr.y - this._movePrev.y);
        objectSidewaysDirection.setLength(this._moveCurr.x - this._movePrev.x);
        moveDirection.copy(objectUpDirection.add(objectSidewaysDirection));
        axis.crossVectors(moveDirection, this._eye).normalize();
        angle *= this.rotateSpeed;
        quaternion.setFromAxisAngle(axis, angle);
        this._eye.applyQuaternion(quaternion);
        this.object.up.applyQuaternion(quaternion);
        this._lastAxis.copy(axis);
        this._lastAngle = angle;
      } else if (! this.staticMoving && this._lastAngle) {
        this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor);
        this._eye.copy(this.object.position).sub(this.target);
        quaternion.setFromAxisAngle(this._lastAxis, this._lastAngle);
        this._eye.applyQuaternion(quaternion);
        this.object.up.applyQuaternion(quaternion);
      }
      this._movePrev.copy(this._moveCurr);
    //};
  }
  zoomCamera() {
    let factor;
    if (this._state === STATE.TOUCH_ZOOM_PAN) {
      factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
      this._touchZoomDistanceStart = this._touchZoomDistanceEnd;
      this._eye.multiplyScalar(factor);
    } else {
      factor = 1.0 + (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed;
      if (factor !== 1.0 && factor > 0.0) {
        this._eye.multiplyScalar(factor);
      }
      if (this.staticMoving) {
        this._zoomStart.copy(this._zoomEnd);
      } else {
        this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor;
      }
    }
  }
  panCamera() {
    let mouseChange = new THREE.Vector2(),
      objectUp = new THREE.Vector3(),
      pan = new THREE.Vector3();
    //return function panCamera() {
      mouseChange.copy(this._panEnd).sub(this._panStart);
      if (mouseChange.lengthSq()) {
        mouseChange.multiplyScalar(this._eye.length() * this.panSpeed);
        pan.copy(this._eye).cross(this.object.up).setLength(mouseChange.x);
        pan.add(objectUp.copy(this.object.up).setLength(mouseChange.y));
        this.object.position.add(pan);
        this.target.add(pan);
        if (this.staticMoving) {
          this._panStart.copy(this._panEnd);
        } else {
          this._panStart.add(mouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor));
        }
      }
    //};
  }
  checkDistances() {
    if (! this.noZoom || ! this.noPan) {
      if (this._eye.lengthSq() > this.maxDistance * this.maxDistance) {
        this.object.position.addVectors(this.target, this._eye.setLength(this.maxDistance));
        this._zoomStart.copy(this._zoomEnd);
      }
      if (this._eye.lengthSq() < this.minDistance * this.minDistance) {
        this.object.position.addVectors(this.target, this._eye.setLength(this.minDistance));
        this._zoomStart.copy(this._zoomEnd);
      }
    }
  }
  update() {
    this._eye.subVectors(this.object.position, this.target);
    if (! this.noRotate) {
      this.rotateCamera();
    }
    if (! this.noZoom) {
      this.zoomCamera();
    }
    if (! this.noPan) {
      this.panCamera();
    }
    this.object.position.addVectors(this.target, this._eye);
    this.checkDistances();
    this.object.lookAt(this.target);
    if (this.lastPosition.distanceToSquared(this.object.position) > EPS) {
      this.dispatchEvent(this.changeEvent);
      this.lastPosition.copy(this.object.position);
    }
  }
  reset() {
    this._state = STATE.NONE;
    this._prevState = STATE.NONE;
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.up.copy(this.up0);
    this._eye.subVectors(this.object.position, this.target);
    this.object.lookAt(this.target);
    this.dispatchEvent(this.changeEvent);
    this.lastPosition.copy(this.object.position);
  }
  // listeners
  private keydown(event) {
    if (this.enabled === false) return;
    window.removeEventListener('keydown', this.keydown.bind(this));
    this._prevState = this._state;
    if (this._state !== STATE.NONE) {
      return;
    } else if (event.keyCode === this.keys[ STATE.ROTATE ] && ! this.noRotate) {
      this._state = STATE.ROTATE;
    } else if (event.keyCode === this.keys[ STATE.ZOOM ] && ! this.noZoom) {
      this._state = STATE.ZOOM;
    } else if (event.keyCode === this.keys[ STATE.PAN ] && ! this.noPan) {
      this._state = STATE.PAN;
    }
  }
  private keyup(event) {
    if (this.enabled === false) return;
    this._state = this. _prevState;
    window.addEventListener('keydown', this.keydown.bind(this), false);
  }
  private mousedown(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();
    if (this._state === STATE.NONE) {
      this._state = event.button;
    }
    if (this._state === STATE.ROTATE && ! this.noRotate) {
      this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
      this._movePrev.copy(this._moveCurr);
    } else if (this._state === STATE.ZOOM && ! this.noZoom) {
      this._zoomStart.copy(this.getMouseOnScreen(event.pageX, event.pageY));
      this._zoomEnd.copy(this._zoomStart);
    } else if (this._state === STATE.PAN && ! this.noPan) {
      this._panStart.copy(this.getMouseOnScreen(event.pageX, event.pageY));
      this._panEnd.copy(this._panStart);
    }
    document.addEventListener('mousemove', this.mousemove.bind(this), false);
    document.addEventListener('mouseup', this.mouseup.bind(this), false);
    this.dispatchEvent(this.startEvent);
  }
  private mousemove(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();
    if (this._state === STATE.ROTATE && ! this.noRotate) {
      this._movePrev.copy(this._moveCurr);
      this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY));
    } else if (this._state === STATE.ZOOM && ! this.noZoom) {
      this._zoomEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY));
    } else if (this._state === STATE.PAN && ! this.noPan) {
      this._panEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY));
    }
  }
  private mouseup(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();
    this._state = STATE.NONE;
    document.removeEventListener('mousemove', this.mousemove.bind(this));
    document.removeEventListener('mouseup', this.mouseup.bind(this));
    this.dispatchEvent(this.endEvent);
  }
  private mousewheel(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();
    this._zoomStart.y -= event.deltaY * 0.01;
    this.dispatchEvent(this.startEvent);
    this.dispatchEvent(this.endEvent);
  }
  private touchstart(event) {
    if (this.enabled === false) return;
    switch (event.touches.length) {
      case 1:
        this._state = STATE.TOUCH_ROTATE;
        this._moveCurr.copy(this.getMouseOnCircle(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY));
        this._movePrev.copy(this._moveCurr);
        break;
      default: // 2 or more
        this._state = STATE.TOUCH_ZOOM_PAN;
        let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
        let x = (event.touches[ 0 ].pageX + event.touches[ 1 ].pageX) / 2;
        let y = (event.touches[ 0 ].pageY + event.touches[ 1 ].pageY) / 2;
        this._panStart.copy(this.getMouseOnScreen(x, y));
        this._panEnd.copy(this._panStart);
        break;
    }
    this.dispatchEvent(this.startEvent);
  }
  private touchmove(event) {
    if (this.enabled === false) return;
    event.preventDefault();
    event.stopPropagation();
    switch (event.touches.length) {
      case 1:
        this._movePrev.copy(this._moveCurr);
        this._moveCurr.copy(this.getMouseOnCircle(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY));
        break;
      default: // 2 or more
        let dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
        let dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
        this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
        let x = (event.touches[ 0 ].pageX + event.touches[ 1 ].pageX) / 2;
        let y = (event.touches[ 0 ].pageY + event.touches[ 1 ].pageY) / 2;
        this._panEnd.copy(this.getMouseOnScreen(x, y));
        break;
    }
  }
  private touchend(event) {
    if (this.enabled === false) return;
    switch (event.touches.length) {
      case 0:
        this._state = STATE.NONE;
        break;
      case 1:
        this._state = STATE.TOUCH_ROTATE;
        this._moveCurr.copy(this.getMouseOnCircle(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY));
        this._movePrev.copy(this._moveCurr);
        break;
    }
    this.dispatchEvent(this.endEvent);
  }
  private contextmenu(event) {
    event.preventDefault();
  }
  dispose() {
    this.domElement.removeEventListener('contextmenu', this.contextmenu.bind(this), false);
    this.domElement.removeEventListener('mousedown', this. mousedown.bind(this), false);
    this.domElement.removeEventListener('wheel', this.mousewheel.bind(this), false);
    this.domElement.removeEventListener('touchstart', this.touchstart.bind(this), false);
    this.domElement.removeEventListener('touchend', this.touchend.bind(this), false);
    this.domElement.removeEventListener('touchmove', this.touchmove.bind(this), false);
    document.removeEventListener('mousemove', this.mousemove.bind(this), false);
    document.removeEventListener('mouseup', this. mouseup.bind(this), false);
    window.removeEventListener('keydown', this.keydown.bind(this), false);
    window.removeEventListener('keyup', this.keyup.bind(this), false);
  };
}
