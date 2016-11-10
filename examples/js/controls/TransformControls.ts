/**
 * @author arodic / https://github.com/arodic
 */
import * as THREE from "../../../src/Three";
import { MeshBasicMaterial, MeshBasicMaterialParameters } from "../../../src/materials/MeshBasicMaterial";
import { LineBasicMaterial, LineBasicMaterialParameters } from "../../../src/materials/LineBasicMaterial";
class GizmoMaterial extends MeshBasicMaterial {
  oldColor: THREE.Color;
  oldOpacity: number;
  constructor(parameters: MeshBasicMaterialParameters) {
    super();
    this.depthTest = false;
    this.depthWrite = false;
    this.side = THREE.SideMode.Front;
    this.transparent = true;
    this.setValues(parameters);
    this.oldColor = this.color.clone();
    this.oldOpacity = this.opacity;
  }
  highlight(highlighted: boolean): void {
    if (highlighted) {
      this.color.setRGB(1, 1, 0);
      this.opacity = 1;
    } else {
      this.color.copy(this.oldColor);
      this.opacity = this.oldOpacity;
    }
  }
}
class GizmoLineMaterial extends LineBasicMaterial {
  oldColor: THREE.Color;
  oldOpacity: number;
  constructor(parameters?: LineBasicMaterialParameters) {
    super();
    this.depthTest = false;
    this.depthWrite = false;
    this.transparent = true;
    this.linewidth = 1;
    this.setValues(parameters);
    this.oldColor = this.color.clone();
    this.oldOpacity = this.opacity;
  }
  highlight(highlighted: boolean): void {
    if (highlighted) {
      this.color.setRGB(1, 1, 0);
      this.opacity = 1;
    } else {
      this.color.copy(this.oldColor);
      this.opacity = this.oldOpacity;
    }
  }
}
const pickerMaterial: GizmoMaterial = new GizmoMaterial({ visible: false, transparent: false });
export class TransformGizmo extends THREE.Object3D {
  handles: THREE.Object3D;
  pickers: THREE.Object3D;
  planes: THREE.Object3D;
  handleGizmos;
  pickerGizmos;
  activePlane: THREE.Mesh;
  constructor(handleGizmos: any, pickerGizmos: any) {
    super();
    this.handleGizmos = handleGizmos;
    this.pickerGizmos = pickerGizmos;
    this.handles = new THREE.Object3D();
    this.pickers = new THREE.Object3D();
    this.planes = new THREE.Object3D();
    this.add(this.handles);
    this.add(this.pickers);
    this.add(this.planes);
    //// PLANES
    const planeGeometry = new THREE.PlaneBufferGeometry(50, 50, 2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false, side: THREE.SideMode.Double });
    const planes = {
      "XY":   new THREE.Mesh(planeGeometry, planeMaterial),
      "YZ":   new THREE.Mesh(planeGeometry, planeMaterial),
      "XZ":   new THREE.Mesh(planeGeometry, planeMaterial),
      "XYZE": new THREE.Mesh(planeGeometry, planeMaterial)
    };
    this.activePlane = planes[ "XYZE" ];
    planes[ "YZ" ].rotation.set(0, Math.PI / 2, 0);
    planes[ "XZ" ].rotation.set(- Math.PI / 2, 0, 0);
    for (let i in planes) {
      planes[ i ].name = i;
      this.planes.add(planes[ i ]);
      this.planes[ i ] = planes[ i ];
    }
    //// HANDLES AND PICKERS
    function setupGizmos(gizmoMap: any, parent: THREE.Object3D): void {
      for (let name in gizmoMap) {
        for (let i = gizmoMap[ name ].length; i --; ) {
          const object = gizmoMap[ name ][ i ][ 0 ];
          const position = gizmoMap[ name ][ i ][ 1 ];
          const rotation = gizmoMap[ name ][ i ][ 2 ];
          object.name = name;
          if (position) object.position.set(position[ 0 ], position[ 1 ], position[ 2 ]);
          if (rotation) object.rotation.set(rotation[ 0 ], rotation[ 1 ], rotation[ 2 ]);
          parent.add(object);
        }
      }
    };
    setupGizmos(this.handleGizmos, this.handles);
    setupGizmos(this.pickerGizmos, this.pickers);
    // reset Transformations
    this.traverse(function (child: THREE.Object3D): void {
      if (child instanceof THREE.Mesh) {
        child.updateMatrix();
        const tempGeometry = child.geometry.clone();
        tempGeometry.applyMatrix(child.matrix);
        child.geometry = tempGeometry;
        child.position.set(0, 0, 0);
        child.rotation.set(0, 0, 0);
        child.scale.set(1, 1, 1);
      }
    });
  }
  highlight(axis: string): void {
    this.traverse(function(child: THREE.Object3D): void {
      if (child.material && (child.material instanceof GizmoMaterial || child.material instanceof GizmoLineMaterial)) {
        if (child.name === axis) {
          child.material.highlight(true);
        } else {
          child.material.highlight(false);
        }
      }
    });
  }
  update(rotation: THREE.Euler, eye: THREE.Vector3): void {
    const vec1 = new THREE.Vector3(0, 0, 0);
    const vec2 = new THREE.Vector3(0, 1, 0);
    const lookAtMatrix = new THREE.Matrix4();
    this.traverse(function(child: THREE.Object3D): void {
      if (child.name.search("E") !== - 1) {
        child.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(eye, vec1, vec2));
      } else if (child.name.search("X") !== - 1 || child.name.search("Y") !== - 1 || child.name.search("Z") !== - 1) {
        child.quaternion.setFromEuler(rotation);
      }
    });
  }
}
export class TransformGizmoTranslate extends TransformGizmo {
  constructor() {
    const arrowGeometry = new THREE.Geometry();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.05, 0.2, 12, 1, false));
    mesh.position.y = 0.5;
    mesh.updateMatrix();
    arrowGeometry.merge(mesh.geometry as THREE.Geometry, mesh.matrix);
    const lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.addAttribute('position', THREE.Float32Attribute([ 0, 0, 0,  1, 0, 0 ], 3));
    const lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.addAttribute('position', THREE.Float32Attribute([ 0, 0, 0,  0, 1, 0 ], 3));
    const lineZGeometry = new THREE.BufferGeometry();
    lineZGeometry.addAttribute('position', THREE.Float32Attribute([ 0, 0, 0,  0, 0, 1 ], 3));
    const handleGizmos = {
      X: [
        [ new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0xff0000 })), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
        [ new THREE.Line(lineXGeometry, new GizmoLineMaterial({ color: 0xff0000 })) ]
      ],
      Y: [
        [ new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x00ff00 })), [ 0, 0.5, 0 ] ],
        [  new THREE.Line(lineYGeometry, new GizmoLineMaterial({ color: 0x00ff00 })) ]
      ],
      Z: [
        [ new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x0000ff })), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
        [ new THREE.Line(lineZGeometry, new GizmoLineMaterial({ color: 0x0000ff })) ]
      ],
      XYZ: [
        [ new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new GizmoMaterial({ color: 0xffffff, opacity: 0.25 })), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
      ],
      XY: [
        [ new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new GizmoMaterial({ color: 0xffff00, opacity: 0.25 })), [ 0.15, 0.15, 0 ] ]
      ],
      YZ: [
        [ new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new GizmoMaterial({ color: 0x00ffff, opacity: 0.25 })), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
      ],
      XZ: [
        [ new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new GizmoMaterial({ color: 0xff00ff, opacity: 0.25 })), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
      ]
    };
    const pickerGizmos = {
      X: [
        [ new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
      ],
      Y: [
        [ new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [ 0, 0.6, 0 ] ]
      ],
      Z: [
        [ new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
      ],
      XYZ: [
        [ new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), pickerMaterial) ]
      ],
      XY: [
        [ new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), pickerMaterial), [ 0.2, 0.2, 0 ] ]
      ],
      YZ: [
        [ new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), pickerMaterial), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
      ],
      XZ: [
        [ new THREE.Mesh(new THREE.PlaneBufferGeometry(0.4, 0.4), pickerMaterial), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
      ]
    };
    super(handleGizmos, pickerGizmos);
  }
  setActivePlane(axis: string, eye: THREE.Vector3): void {
    const tempMatrix = new THREE.Matrix4();
    eye.applyMatrix4(tempMatrix.getInverse(tempMatrix.extractRotation(this.planes[ "XY" ].matrixWorld)));
    if (axis === "X") {
      this.activePlane = this.planes[ "XY" ];
      if (Math.abs(eye.y) > Math.abs(eye.z)) this.activePlane = this.planes[ "XZ" ];
    }
    if (axis === "Y") {
      this.activePlane = this.planes[ "XY" ];
      if (Math.abs(eye.x) > Math.abs(eye.z)) this.activePlane = this.planes[ "YZ" ];
    }
    if (axis === "Z") {
      this.activePlane = this.planes[ "XZ" ];
      if (Math.abs(eye.x) > Math.abs(eye.y)) this.activePlane = this.planes[ "YZ" ];
    }
    if (axis === "XYZ") this.activePlane = this.planes[ "XYZE" ];
    if (axis === "XY") this.activePlane = this.planes[ "XY" ];
    if (axis === "YZ") this.activePlane = this.planes[ "YZ" ];
    if (axis === "XZ") this.activePlane = this.planes[ "XZ" ];
  }
}
export class TransformGizmoRotate extends TransformGizmo {
  constructor() {
    function CircleGeometry(radius: number, facing: string, arc: number = 1): THREE.BufferGeometry {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let i = 0; i <= 64 * arc; ++ i) {
        if (facing === 'x') vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
        if (facing === 'y') vertices.push(Math.cos(i / 32 * Math.PI) * radius, 0, Math.sin(i / 32 * Math.PI) * radius);
        if (facing === 'z') vertices.push(Math.sin(i / 32 * Math.PI) * radius, Math.cos(i / 32 * Math.PI) * radius, 0);
      }
      geometry.addAttribute('position', THREE.Float32Attribute(vertices, 3));
      return geometry;
    };
    const handleGizmos = {
      X: [
        [ new THREE.Line(CircleGeometry(1, 'x', 0.5), new GizmoLineMaterial({ color: 0xff0000 })) ]
      ],
      Y: [
        [ new THREE.Line(CircleGeometry(1, 'y', 0.5), new GizmoLineMaterial({ color: 0x00ff00 })) ]
      ],
      Z: [
        [ new THREE.Line(CircleGeometry(1, 'z', 0.5), new GizmoLineMaterial({ color: 0x0000ff })) ]
      ],
      E: [
        [ new THREE.Line(CircleGeometry(1.25, 'z', 1), new GizmoLineMaterial({ color: 0xcccc00 })) ]
      ],
      XYZE: [
        [ new THREE.Line(CircleGeometry(1, 'z', 1), new GizmoLineMaterial({ color: 0x787878 })) ]
      ]
    };
    const pickerGizmos = {
      X: [
        [ new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 4, 12, Math.PI), pickerMaterial), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
      ],
      Y: [
        [ new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 4, 12, Math.PI), pickerMaterial), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
      ],
      Z: [
        [ new THREE.Mesh(new THREE.TorusBufferGeometry(1, 0.12, 4, 12, Math.PI), pickerMaterial), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
      ],
      E: [
        [ new THREE.Mesh(new THREE.TorusBufferGeometry(1.25, 0.12, 2, 24), pickerMaterial) ]
      ],
      XYZE: [
        [ new THREE.Mesh() ]// TODO
      ]
    };
    super(handleGizmos, pickerGizmos);
  }
  setActivePlane(axis: string): void {
    if (axis === "E") this.activePlane = this.planes[ "XYZE" ];
    if (axis === "X") this.activePlane = this.planes[ "YZ" ];
    if (axis === "Y") this.activePlane = this.planes[ "XZ" ];
    if (axis === "Z") this.activePlane = this.planes[ "XY" ];
  }
  update(rotation: THREE.Euler, eye2: THREE.Vector3): void {
    super.update(rotation, eye2);
    //const group = {
    //  handles: this[ "handles" ],
    //  pickers: this[ "pickers" ],
    //};
    const tempMatrix = new THREE.Matrix4();
    const worldRotation = new THREE.Euler(0, 0, 1);
    const tempQuaternion = new THREE.Quaternion();
    const unitX = new THREE.Vector3(1, 0, 0);
    const unitY = new THREE.Vector3(0, 1, 0);
    const unitZ = new THREE.Vector3(0, 0, 1);
    const quaternionX = new THREE.Quaternion();
    const quaternionY = new THREE.Quaternion();
    const quaternionZ = new THREE.Quaternion();
    const eye = eye2.clone();
    worldRotation.copy(this.planes[ "XY" ].rotation);
    tempQuaternion.setFromEuler(worldRotation);
    tempMatrix.makeRotationFromQuaternion(tempQuaternion).getInverse(tempMatrix);
    eye.applyMatrix4(tempMatrix);
    this.traverse(function(child) {
      tempQuaternion.setFromEuler(worldRotation);
      if (child.name === "X") {
        quaternionX.setFromAxisAngle(unitX, Math.atan2(- eye.y, eye.z));
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
        child.quaternion.copy(tempQuaternion);
      }
      if (child.name === "Y") {
        quaternionY.setFromAxisAngle(unitY, Math.atan2(eye.x, eye.z));
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
        child.quaternion.copy(tempQuaternion);
      }
      if (child.name === "Z") {
        quaternionZ.setFromAxisAngle(unitZ, Math.atan2(eye.y, eye.x));
        tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);
        child.quaternion.copy(tempQuaternion);
      }
    });
  }
}
export class TransformGizmoScale extends TransformGizmo {
  constructor() {
    const arrowGeometry = new THREE.Geometry();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.125, 0.125));
    mesh.position.y = 0.5;
    mesh.updateMatrix();
    arrowGeometry.merge(mesh.geometry as THREE.Geometry, mesh.matrix);
    const lineXGeometry = new THREE.BufferGeometry();
    lineXGeometry.addAttribute('position', THREE.Float32Attribute([ 0, 0, 0,  1, 0, 0 ], 3));
    const lineYGeometry = new THREE.BufferGeometry();
    lineYGeometry.addAttribute('position', THREE.Float32Attribute([ 0, 0, 0,  0, 1, 0 ], 3));
    const lineZGeometry = new THREE.BufferGeometry();
    lineZGeometry.addAttribute('position', THREE.Float32Attribute([ 0, 0, 0,  0, 0, 1 ], 3));
    const handleGizmos = {
      X: [
        [ new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0xff0000 })), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
        [ new THREE.Line(lineXGeometry, new GizmoLineMaterial({ color: 0xff0000 })) ]
      ],
      Y: [
        [ new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x00ff00 })), [ 0, 0.5, 0 ] ],
        [ new THREE.Line(lineYGeometry, new GizmoLineMaterial({ color: 0x00ff00 })) ]
      ],
      Z: [
        [ new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x0000ff })), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
        [ new THREE.Line(lineZGeometry, new GizmoLineMaterial({ color: 0x0000ff })) ]
      ],
      XYZ: [
        [ new THREE.Mesh(new THREE.BoxBufferGeometry(0.125, 0.125, 0.125), new GizmoMaterial({ color: 0xffffff, opacity: 0.25 })) ]
      ]
    };
    const pickerGizmos = {
      X: [
        [ new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
      ],
      Y: [
        [ new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [ 0, 0.6, 0 ] ]
      ],
      Z: [
        [ new THREE.Mesh(new THREE.CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), pickerMaterial), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
      ],
      XYZ: [
        [ new THREE.Mesh(new THREE.BoxBufferGeometry(0.4, 0.4, 0.4), pickerMaterial) ]
      ]
    };
    super(handleGizmos, pickerGizmos);
  }
  setActivePlane(axis: string, eye: THREE.Vector3): void {
    const tempMatrix = new THREE.Matrix4();
    eye.applyMatrix4(tempMatrix.getInverse(tempMatrix.extractRotation(this.planes[ "XY" ].matrixWorld)));
    if (axis === "X") {
      this.activePlane = this.planes[ "XY" ];
      if (Math.abs(eye.y) > Math.abs(eye.z)) this.activePlane = this.planes[ "XZ" ];
    }
    if (axis === "Y") {
      this.activePlane = this.planes[ "XY" ];
      if (Math.abs(eye.x) > Math.abs(eye.z)) this.activePlane = this.planes[ "YZ" ];
    }
    if (axis === "Z") {
      this.activePlane = this.planes[ "XZ" ];
      if (Math.abs(eye.x) > Math.abs(eye.y)) this.activePlane = this.planes[ "YZ" ];
    }
    if (axis === "XYZ") this.activePlane = this.planes[ "XYZE" ];
  };
}
export class TransformControls extends THREE.Object3D {
  // TODO: Make non-uniform scale and rotate play nice in hierarchies
  // TODO: ADD RXYZ contol
  camera: THREE.Camera;
  domElement: HTMLElement;
  object: THREE.Object3D = undefined;
  translationSnap: number = null;
  rotationSnap: number = null;
  space: string = "world";
  size: number = 1;
  axis: string = null;
  private _mode: string = "translate";
  private _dragging: boolean = false;
  private _plane: string = "XY";
  private _gizmo = {
    "translate": new TransformGizmoTranslate(),
    "rotate": new TransformGizmoRotate(),
    "scale": new TransformGizmoScale()
  };
  private _changeEvent = { type: "change" };
  private _mouseDownEvent = { type: "mouseDown" };
  private _mouseUpEvent = { type: "mouseUp", mode: "" };
  private _objectChangeEvent = { type: "objectChange" };
  private _ray = new THREE.Raycaster();
  private _pointerVector = new THREE.Vector2();
  private _point = new THREE.Vector3();
  private _offset = new THREE.Vector3();
  private _rotation = new THREE.Vector3();
  private _offsetRotation = new THREE.Vector3();
  private _scale: number = 1;
  private _lookAtMatrix = new THREE.Matrix4();
  private _eye = new THREE.Vector3();
  private _tempMatrix = new THREE.Matrix4();
  private _tempVector = new THREE.Vector3();
  private _tempQuaternion = new THREE.Quaternion();
  private _unitX = new THREE.Vector3(1, 0, 0);
  private _unitY = new THREE.Vector3(0, 1, 0);
  private _unitZ = new THREE.Vector3(0, 0, 1);
  private _quaternionXYZ = new THREE.Quaternion();
  private _quaternionX = new THREE.Quaternion();
  private _quaternionY = new THREE.Quaternion();
  private _quaternionZ = new THREE.Quaternion();
  private _quaternionE = new THREE.Quaternion();
  private _oldPosition = new THREE.Vector3();
  private _oldScale = new THREE.Vector3();
  private _oldRotationMatrix = new THREE.Matrix4();
  private _parentRotationMatrix  = new THREE.Matrix4();
  private _parentScale = new THREE.Vector3();
  private _worldPosition = new THREE.Vector3();
  private _worldRotation = new THREE.Euler();
  private _worldRotationMatrix  = new THREE.Matrix4();
  private _camPosition = new THREE.Vector3();
  private _camRotation = new THREE.Euler();
  constructor(camera: THREE.Camera, domElement: HTMLElement = document.body) {
    super();
    this.camera = camera;
    this.domElement = domElement;
    for (let type in this._gizmo) {
      const gizmoObj = this._gizmo[ type ];
      gizmoObj.visible = (type === this._mode);
      this.add(gizmoObj);
    }
    this.domElement.addEventListener("mousedown", this.onPointerDown.bind(this), false);
    this.domElement.addEventListener("touchstart", this.onPointerDown.bind(this), false);
    this.domElement.addEventListener("mousemove", this.onPointerHover.bind(this), false);
    this.domElement.addEventListener("touchmove", this.onPointerHover.bind(this), false);
    this.domElement.addEventListener("mousemove", this.onPointerMove.bind(this), false);
    this.domElement.addEventListener("touchmove", this.onPointerMove.bind(this), false);
    this.domElement.addEventListener("mouseup", this.onPointerUp.bind(this), false);
    this.domElement.addEventListener("mouseout", this.onPointerUp.bind(this), false);
    this.domElement.addEventListener("touchend", this.onPointerUp.bind(this), false);
    this.domElement.addEventListener("touchcancel", this.onPointerUp.bind(this), false);
    this.domElement.addEventListener("touchleave", this.onPointerUp.bind(this), false);
  }
  dispose(): void {
    this.domElement.removeEventListener("mousedown", this.onPointerDown.bind(this));
    this.domElement.removeEventListener("touchstart", this.onPointerDown.bind(this));
    this.domElement.removeEventListener("mousemove", this.onPointerHover.bind(this));
    this.domElement.removeEventListener("touchmove", this.onPointerHover.bind(this));
    this.domElement.removeEventListener("mousemove", this.onPointerMove.bind(this));
    this.domElement.removeEventListener("touchmove", this.onPointerMove.bind(this));
    this.domElement.removeEventListener("mouseup", this.onPointerUp.bind(this));
    this.domElement.removeEventListener("mouseout", this.onPointerUp.bind(this));
    this.domElement.removeEventListener("touchend", this.onPointerUp.bind(this));
    this.domElement.removeEventListener("touchcancel", this.onPointerUp.bind(this));
    this.domElement.removeEventListener("touchleave", this.onPointerUp.bind(this));
  }
  attach(object: THREE.Object3D): void {
    this.object = object;
    this.visible = true;
    this.update();
  }
  detach(): void {
    this.object = undefined;
    this.visible = false;
    this.axis = null;
  }
  getMode(): string {
    return this._mode;
  }
  setMode(mode: string): void {
    this._mode = mode ? mode : this._mode;
    if (this._mode === "scale") this.space = "local";
    for (let type in this._gizmo) this._gizmo[ type ].visible = (type === this._mode);
    this.update();
    this.dispatchEvent(this._changeEvent);
  }
  setTranslationSnap(translationSnap: number): void {
    this.translationSnap = translationSnap;
  }
  setRotationSnap(rotationSnap: number): void {
    this.rotationSnap = rotationSnap;
  }
  setSize(size: number): void {
    this.size = size;
    this.update();
    this.dispatchEvent(this._changeEvent);
  }
  setSpace(space: string): void {
    this.space = space;
    this.update();
    this.dispatchEvent(this._changeEvent);
  }
  update(): void {
    if (this.object === undefined) return;
    this.object.updateMatrixWorld();
    this._worldPosition.setFromMatrixPosition(this.object.matrixWorld);
    this._worldRotation.setFromRotationMatrix(this._tempMatrix.extractRotation(this.object.matrixWorld));
    this.camera.updateMatrixWorld();
    this._camPosition.setFromMatrixPosition(this.camera.matrixWorld);
    this._camRotation.setFromRotationMatrix(this._tempMatrix.extractRotation(this.camera.matrixWorld));
    this._scale = this._worldPosition.distanceTo(this._camPosition) / 6 * this.size;
    this.position.copy(this._worldPosition);
    this.scale.set(this._scale, this._scale, this._scale);
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this._eye.copy(this._camPosition).sub(this._worldPosition).normalize();
    } else if (this.camera instanceof THREE.OrthographicCamera) {
      this._eye.copy(this._camPosition).normalize();
    }
    if (this.space === "local") {
      this._gizmo[ this._mode ].update(this._worldRotation, this._eye);
    } else if (this.space === "world") {
      this._gizmo[ this._mode ].update(new THREE.Euler(), this._eye);
    }
    this._gizmo[ this._mode ].highlight(this.axis);
  }
  private onPointerHover(event: any): void {
    if (this.object === undefined || this._dragging === true || (event.button !== undefined && event.button !== 0)) return;
    const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    const intersect = this.intersectObjects(pointer, this._gizmo[ this._mode ].pickers.children);
    let axis = null;
    if (intersect) {
      axis = intersect.object.name;
      event.preventDefault();
    }
    if (this.axis !== axis) {
      this.axis = axis;
      this.update();
      this.dispatchEvent(this._changeEvent);
    }
  }
  private onPointerDown(event: any): void {
    if (this.object === undefined || this._dragging === true || (event.button !== undefined && event.button !== 0)) return;
    const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    if (pointer.button === 0 || pointer.button === undefined) {
      const intersect = this.intersectObjects(pointer, this._gizmo[ this._mode ].pickers.children);
      if (intersect) {
        event.preventDefault();
        event.stopPropagation();
        this.dispatchEvent(this._mouseDownEvent);
        this.axis = intersect.object.name;
        this.update();
        this._eye.copy(this._camPosition).sub(this._worldPosition).normalize();
        this._gizmo[ this._mode ].setActivePlane(this.axis, this._eye);
        const planeIntersect = this.intersectObjects(pointer, [ this._gizmo[ this._mode ].activePlane ]);
        if (planeIntersect) {
          this._oldPosition.copy(this.object.position);
          this._oldScale.copy(this.object.scale);
          this._oldRotationMatrix.extractRotation(this.object.matrix);
          this._worldRotationMatrix.extractRotation(this.object.matrixWorld);
          this._parentRotationMatrix.extractRotation(this.object.parent.matrixWorld);
          this._parentScale.setFromMatrixScale(this._tempMatrix.getInverse(this.object.parent.matrixWorld));
          this._offset.copy(planeIntersect.point);
        }
      }
    }
    this._dragging = true;
  }
  private onPointerMove(event: any): void {
    if (this.object === undefined || this.axis === null || this._dragging === false || (event.button !== undefined && event.button !== 0)) return;
    const pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    const planeIntersect = this.intersectObjects(pointer, [ this._gizmo[ this._mode ].activePlane ]);
    if (! planeIntersect) return;
    event.preventDefault();
    event.stopPropagation();
    this._point.copy(planeIntersect.point);
    if (this._mode === "translate") {
      this._point.sub(this._offset);
      this._point.multiply(this._parentScale);
      if (this.space === "local") {
        this._point.applyMatrix4(this._tempMatrix.getInverse(this._worldRotationMatrix));
        if (this.axis.search("X") === - 1) this._point.x = 0;
        if (this.axis.search("Y") === - 1) this._point.y = 0;
        if (this.axis.search("Z") === - 1) this._point.z = 0;
        this._point.applyMatrix4(this._oldRotationMatrix);
        this.object.position.copy(this._oldPosition);
        this.object.position.add(this._point);
      }
      if (this.space === "world" || this.axis.search("XYZ") !== - 1) {
        if (this.axis.search("X") === - 1) this._point.x = 0;
        if (this.axis.search("Y") === - 1) this._point.y = 0;
        if (this.axis.search("Z") === - 1) this._point.z = 0;
        this._point.applyMatrix4(this._tempMatrix.getInverse(this._parentRotationMatrix));
        this.object.position.copy(this._oldPosition);
        this.object.position.add(this._point);
      }
      if (this.translationSnap !== null) {
        if (this.space === "local") {
          this.object.position.applyMatrix4(this._tempMatrix.getInverse(this._worldRotationMatrix));
        }
        if (this.axis.search("X") !== - 1) this.object.position.x = Math.round(this.object.position.x / this.translationSnap) * this.translationSnap;
        if (this.axis.search("Y") !== - 1) this.object.position.y = Math.round(this.object.position.y / this.translationSnap) * this.translationSnap;
        if (this.axis.search("Z") !== - 1) this.object.position.z = Math.round(this.object.position.z / this.translationSnap) * this.translationSnap;
        if (this.space === "local") {
          this.object.position.applyMatrix4(this._worldRotationMatrix);
        }
      }
    } else if (this._mode === "scale") {
      this._point.sub(this._offset);
      this._point.multiply(this._parentScale);
      if (this.space === "local") {
        if (this.axis === "XYZ") {
          this._scale = 1 + ((this._point.y) / Math.max(this._oldScale.x, this._oldScale.y, this._oldScale.z));
          this.object.scale.x = this._oldScale.x * this._scale;
          this.object.scale.y = this._oldScale.y * this._scale;
          this.object.scale.z = this._oldScale.z * this._scale;
        } else {
          this._point.applyMatrix4(this._tempMatrix.getInverse(this._worldRotationMatrix));
          if (this.axis === "X") this.object.scale.x = this._oldScale.x * (1 + this._point.x / this._oldScale.x);
          if (this.axis === "Y") this.object.scale.y = this._oldScale.y * (1 + this._point.y / this._oldScale.y);
          if (this.axis === "Z") this.object.scale.z = this._oldScale.z * (1 + this._point.z / this._oldScale.z);
        }
      }
    } else if (this._mode === "rotate") {
      this._point.sub(this._worldPosition);
      this._point.multiply(this._parentScale);
      this._tempVector.copy(this._offset).sub(this._worldPosition);
      this._tempVector.multiply(this._parentScale);
      if (this.axis === "E") {
        this._point.applyMatrix4(this._tempMatrix.getInverse(this._lookAtMatrix));
        this._tempVector.applyMatrix4(this._tempMatrix.getInverse(this._lookAtMatrix));
        this._rotation.set(Math.atan2(this._point.z, this._point.y), Math.atan2(this._point.x, this._point.z), Math.atan2(this._point.y, this._point.x));
        this._offsetRotation.set(Math.atan2(this._tempVector.z, this._tempVector.y), Math.atan2(this._tempVector.x, this._tempVector.z), Math.atan2(this._tempVector.y, this._tempVector.x));
        this._tempQuaternion.setFromRotationMatrix(this._tempMatrix.getInverse(this._parentRotationMatrix));
        this._quaternionE.setFromAxisAngle(this._eye, this._rotation.z - this._offsetRotation.z);
        this._quaternionXYZ.setFromRotationMatrix(this._worldRotationMatrix);
        this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionE);
        this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionXYZ);
        this.object.quaternion.copy(this._tempQuaternion);
      } else if (this.axis === "XYZE") {
        //this._quaternionE.setFromEuler(this._point.clone().cross(this._tempVector).normalize()); // rotation axis
        const _axis = this._point.clone().cross(this._tempVector).normalize();
        this._quaternionE.setFromEuler(new THREE.Euler(_axis.x, _axis.y, _axis.z)); // rotation axis
        this._tempQuaternion.setFromRotationMatrix(this._tempMatrix.getInverse(this._parentRotationMatrix));
        //this._quaternionX.setFromAxisAngle(this._quaternionE, - this._point.clone().angleTo(this._tempVector));
        this._quaternionX.setFromAxisAngle(_axis.set(this._quaternionE.x, this._quaternionE.y, this._quaternionE.z), - this._point.clone().angleTo(this._tempVector));
        this._quaternionXYZ.setFromRotationMatrix(this._worldRotationMatrix);
        this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionX);
        this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionXYZ);
        this.object.quaternion.copy(this._tempQuaternion);
      } else if (this.space === "local") {
        this._point.applyMatrix4(this._tempMatrix.getInverse(this._worldRotationMatrix));
        this._tempVector.applyMatrix4(this._tempMatrix.getInverse(this._worldRotationMatrix));
        this._rotation.set(Math.atan2(this._point.z, this._point.y), Math.atan2(this._point.x, this._point.z), Math.atan2(this._point.y, this._point.x));
        this._offsetRotation.set(Math.atan2(this._tempVector.z, this._tempVector.y), Math.atan2(this._tempVector.x, this._tempVector.z), Math.atan2(this._tempVector.y, this._tempVector.x));
        this._quaternionXYZ.setFromRotationMatrix(this._oldRotationMatrix);
        if (this.rotationSnap !== null) {
          this._quaternionX.setFromAxisAngle(this._unitX, Math.round((this._rotation.x - this._offsetRotation.x) / this.rotationSnap) * this.rotationSnap);
          this._quaternionY.setFromAxisAngle(this._unitY, Math.round((this._rotation.y - this._offsetRotation.y) / this.rotationSnap) * this.rotationSnap);
          this._quaternionZ.setFromAxisAngle(this._unitZ, Math.round((this._rotation.z - this._offsetRotation.z) / this.rotationSnap) * this.rotationSnap);
        } else {
          this._quaternionX.setFromAxisAngle(this._unitX, this._rotation.x - this._offsetRotation.x);
          this._quaternionY.setFromAxisAngle(this._unitY, this._rotation.y - this._offsetRotation.y);
          this._quaternionZ.setFromAxisAngle(this._unitZ, this._rotation.z - this._offsetRotation.z);
        }
        if (this.axis === "X") this._quaternionXYZ.multiplyQuaternions(this._quaternionXYZ, this._quaternionX);
        if (this.axis === "Y") this._quaternionXYZ.multiplyQuaternions(this._quaternionXYZ, this._quaternionY);
        if (this.axis === "Z") this._quaternionXYZ.multiplyQuaternions(this._quaternionXYZ, this._quaternionZ);
        this.object.quaternion.copy(this._quaternionXYZ);
      } else if (this.space === "world") {
        this._rotation.set(Math.atan2(this._point.z, this._point.y), Math.atan2(this._point.x, this._point.z), Math.atan2(this._point.y, this._point.x));
        this._offsetRotation.set(Math.atan2(this._tempVector.z, this._tempVector.y), Math.atan2(this._tempVector.x, this._tempVector.z), Math.atan2(this._tempVector.y, this._tempVector.x));
        this._tempQuaternion.setFromRotationMatrix(this._tempMatrix.getInverse(this._parentRotationMatrix));
        if (this.rotationSnap !== null) {
          this._quaternionX.setFromAxisAngle(this._unitX, Math.round((this._rotation.x - this._offsetRotation.x) / this.rotationSnap) * this.rotationSnap);
          this._quaternionY.setFromAxisAngle(this._unitY, Math.round((this._rotation.y - this._offsetRotation.y) / this.rotationSnap) * this.rotationSnap);
          this._quaternionZ.setFromAxisAngle(this._unitZ, Math.round((this._rotation.z - this._offsetRotation.z) / this.rotationSnap) * this.rotationSnap);
        } else {
          this._quaternionX.setFromAxisAngle(this._unitX, this._rotation.x - this._offsetRotation.x);
          this._quaternionY.setFromAxisAngle(this._unitY, this._rotation.y - this._offsetRotation.y);
          this._quaternionZ.setFromAxisAngle(this._unitZ, this._rotation.z - this._offsetRotation.z);
        }
        this._quaternionXYZ.setFromRotationMatrix(this._worldRotationMatrix);
        if (this.axis === "X") this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionX);
        if (this.axis === "Y") this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionY);
        if (this.axis === "Z") this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionZ);
        this._tempQuaternion.multiplyQuaternions(this._tempQuaternion, this._quaternionXYZ);
        this.object.quaternion.copy(this._tempQuaternion);
      }
    }
    this.update();
    this.dispatchEvent(this._changeEvent);
    this.dispatchEvent(this._objectChangeEvent);
  }
  private onPointerUp(event: any): void {
    event.preventDefault(); // Prevent MouseEvent on mobile
    if (event.button !== undefined && event.button !== 0) return;
    if (this._dragging && (this.axis !== null)) {
      this._mouseUpEvent.mode = this._mode;
      this.dispatchEvent(this._mouseUpEvent);
    }
    this._dragging = false;
    if ('TouchEvent' in window && event instanceof TouchEvent) {
      // Force "rollover"
      this.axis = null;
      this.update();
      this.dispatchEvent(this._changeEvent);
    } else {
      this.onPointerHover(event);
    }
  }
  private intersectObjects(pointer: any, objects: THREE.Object3D[]): THREE.Intersect {
    const rect = this.domElement.getBoundingClientRect();
    const x = (pointer.clientX - rect.left) / rect.width;
    const y = (pointer.clientY - rect.top) / rect.height;
    this._pointerVector.set((x * 2) - 1, - (y * 2) + 1);
    this._ray.setFromCamera(this._pointerVector, this.camera);
    const intersections = this._ray.intersectObjects(objects, true);
    return intersections[ 0 ] ? intersections[ 0 ] : null;
  }
}
