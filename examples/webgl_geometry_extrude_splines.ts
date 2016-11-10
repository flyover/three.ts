import * as THREE from "../src/Three";
import * as THREE_Curves from "./js/CurveExtras";
import { OrbitControls as THREE_OrbitControls } from "./js/controls/OrbitControls";
let container: HTMLDivElement, stats: Stats;
let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer, splineCamera: THREE.PerspectiveCamera, cameraHelper: THREE.CameraHelper, cameraEye: THREE.Object3D;
let controls;
let targetRotation: number = 0;
//let targetRotationOnMouseDown: number = 0;
//let mouseX: number = 0;
//let mouseXOnMouseDown: number = 0;
let windowHalfX: number = window.innerWidth / 2;
let windowHalfY: number = window.innerHeight / 2;
const binormal: THREE.Vector3 = new THREE.Vector3();
const normal: THREE.Vector3 = new THREE.Vector3();
const pipeSpline: THREE.CatmullRomCurve3 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 10, -10), new THREE.Vector3(10, 0, -10),
    new THREE.Vector3(20, 0, 0), new THREE.Vector3(30, 0, 10),
    new THREE.Vector3(30, 0, 20), new THREE.Vector3(20, 0, 30),
    new THREE.Vector3(10, 0, 30), new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(-10, 10, 30), new THREE.Vector3(-10, 20, 30),
    new THREE.Vector3(0, 30, 30), new THREE.Vector3(10, 30, 30),
    new THREE.Vector3(20, 30, 15), new THREE.Vector3(10, 30, 10),
    new THREE.Vector3(0, 30, 10), new THREE.Vector3(-10, 20, 10),
    new THREE.Vector3(-10, 10, 10), new THREE.Vector3(0, 0, 10),
    new THREE.Vector3(10, -10, 10), new THREE.Vector3(20, -15, 10),
    new THREE.Vector3(30, -15, 10), new THREE.Vector3(40, -15, 10),
    new THREE.Vector3(50, -15, 10), new THREE.Vector3(60, 0, 10),
    new THREE.Vector3(70, 0, 0), new THREE.Vector3(80, 0, 0),
    new THREE.Vector3(90, 0, 0), new THREE.Vector3(100, 0, 0)
]);
const sampleClosedSpline: THREE.CatmullRomCurve3 = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -40, -40),
  new THREE.Vector3(0, 40, -40),
  new THREE.Vector3(0, 140, -40),
  new THREE.Vector3(0, 40, 40),
  new THREE.Vector3(0, -40, 40),
]);
sampleClosedSpline.type = 'catmullrom';
sampleClosedSpline.closed = true;
// Keep a dictionary of Curve instances
const splines: { [key: string]: THREE.Curve<THREE.Vector3> } = {
  GrannyKnot: new THREE_Curves.GrannyKnot(),
  HeartCurve: new THREE_Curves.HeartCurve(3.5),
  VivianiCurve: new THREE_Curves.VivianiCurve(70),
  KnotCurve: new THREE_Curves.KnotCurve(),
  HelixCurve: new THREE_Curves.HelixCurve(),
  TrefoilKnot: new THREE_Curves.TrefoilKnot(),
  TorusKnot: new THREE_Curves.TorusKnot(20),
  CinquefoilKnot: new THREE_Curves.CinquefoilKnot(20),
  TrefoilPolynomialKnot: new THREE_Curves.TrefoilPolynomialKnot(14),
  FigureEightPolynomialKnot: new THREE_Curves.FigureEightPolynomialKnot(),
  DecoratedTorusKnot4a: new THREE_Curves.DecoratedTorusKnot4a(),
  DecoratedTorusKnot4b: new THREE_Curves.DecoratedTorusKnot4b(),
  DecoratedTorusKnot5a: new THREE_Curves.DecoratedTorusKnot5a(),
  DecoratedTorusKnot5c: new THREE_Curves.DecoratedTorusKnot5c(),
  PipeSpline: pipeSpline,
  SampleClosedSpline: sampleClosedSpline
};
let extrudePath: THREE.Curve<THREE.Vector3> = new THREE_Curves.TrefoilKnot();
let dropdown: string = '<select id="dropdown">';
for (let s in splines) {
  dropdown += '<option value="' + s + '">' + s + '</option>';
}
dropdown += '</select>';
let closed2: boolean = true;
let parent: THREE.Object3D;
let tube, tubeMesh: THREE.Group;
let animation: boolean = false, lookAhead: boolean = false;
let scale: number = 1;
let showCameraHelper: boolean = false;
function addTube(): void {
  const value: string = (document.getElementById('dropdown') as HTMLSelectElement).value;
  const segments: number = parseInt((document.getElementById('segments') as HTMLSelectElement).value);
  closed2 = (document.getElementById('closed') as HTMLInputElement).checked;
  const radiusSegments: number = parseInt((document.getElementById('radiusSegments') as HTMLSelectElement).value);
  if (tubeMesh !== undefined) parent.remove(tubeMesh);
  extrudePath = splines[value];
  tube = new THREE.TubeBufferGeometry(extrudePath, segments, 2, radiusSegments, closed2);
  addGeometry(tube, 0xff00ff);
  setScale();
}
function setScale(): void {
  scale = parseInt((document.getElementById('scale') as HTMLSelectElement).value);
  tubeMesh.scale.set(scale, scale, scale);
}
function addGeometry(geometry: THREE.BufferGeometry, color: number): void {
  // 3d shape
  tubeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
    new THREE.MeshLambertMaterial({
      color: color
    }),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.3,
      wireframe: true,
      transparent: true
  })]);
  parent.add(tubeMesh);
}
function animateCamera(toggle: boolean = false) {
  if (toggle === true) {
    animation = animation === false;
    (document.getElementById('animation') as HTMLButtonElement).value = 'Camera Spline Animation View: ' + (animation ? 'ON' : 'OFF');
  }
  lookAhead = (document.getElementById('lookAhead') as HTMLInputElement).checked;
  showCameraHelper = (document.getElementById('cameraHelper') as HTMLInputElement).checked;
  cameraHelper.visible = showCameraHelper;
  cameraEye.visible = showCameraHelper;
}
init();
animate();
function init(): void {
  container = document.createElement('div');
  document.body.appendChild(container);
  const info: HTMLDivElement = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = 'Spline Extrusion Examples by <a href="http://www.lab4games.net/zz85/blog">zz85</a><br/>Select spline:';
  info.innerHTML += dropdown;
  info.innerHTML += '<br/>Scale: <select id="scale"><option>1</option><option>2</option><option selected>4</option><option>6</option><option>10</option></select>';
  info.innerHTML += '<br/>Extrusion Segments: <select id="segments"><option>50</option><option selected>100</option><option>200</option><option>400</option></select>';
  info.innerHTML += '<br/>Radius Segments: <select id="radiusSegments"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option><option>8</option><option>12</option></select>';
  info.innerHTML += '<br/>Closed:<input id="closed" type="checkbox" checked />';
  info.innerHTML += '<br/><br/><input id="animation" type="button" value="Camera Spline Animation View: OFF"/><br/> Look Ahead <input id="lookAhead" type="checkbox" /> Camera Helper <input id="cameraHelper" type="checkbox" />';
  container.appendChild(info);
  document.getElementById('dropdown').addEventListener('change', function(event) { addTube(); });
  document.getElementById('scale').addEventListener('change', function(event) { setScale(); });
  document.getElementById('segments').addEventListener('change', function(event) { addTube(); });
  document.getElementById('radiusSegments').addEventListener('change', function(event) { addTube(); });
  document.getElementById('closed').addEventListener('change', function(event) { addTube(); });
  document.getElementById('animation').addEventListener('click', function(event) { animateCamera(true); });
  document.getElementById('lookAhead').addEventListener('change', function(event) { animateCamera(); });
  document.getElementById('cameraHelper').addEventListener('change', function(event) { animateCamera(); });
  //
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 10000);
  camera.position.set(0, 50, 500);
  scene = new THREE.Scene();
  const light: THREE.DirectionalLight = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 1);
  scene.add(light);
  parent = new THREE.Object3D();
  parent.position.y = 100;
  scene.add(parent);
  splineCamera = new THREE.PerspectiveCamera(84, window.innerWidth / window.innerHeight, 0.01, 1000);
  parent.add(splineCamera);
  cameraHelper = new THREE.CameraHelper(splineCamera);
  scene.add(cameraHelper);
  addTube();
  // debug camera
  cameraEye = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({ color: 0xdddddd }));
  parent.add(cameraEye);
  cameraHelper.visible = showCameraHelper;
  cameraEye.visible = showCameraHelper;
  //
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xf0f0f0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  stats = new Stats();
  container.appendChild(stats.dom);
  //
  controls = new THREE_OrbitControls(camera, renderer.domElement);
  //
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize(): void {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
//
function animate(): void {
  requestAnimationFrame(animate);
  render();
  stats.update();
}
function render(): void {
  // Try Animate Camera Along Spline
  const time: number = Date.now();
  const looptime: number = 20 * 1000;
  const t: number = (time % looptime) / looptime;
  const pos: THREE.Vector3 = tube.parameters.path.getPointAt(t);
  pos.multiplyScalar(scale);
  // interpolation
  const segments: number = tube.tangents.length;
  const pickt: number = t * segments;
  const pick: number = Math.floor(pickt);
  const pickNext: number = (pick + 1) % segments;
  binormal.subVectors(tube.binormals[ pickNext ], tube.binormals[ pick ]);
  binormal.multiplyScalar(pickt - pick).add(tube.binormals[ pick ]);
  const dir: THREE.Vector3 = tube.parameters.path.getTangentAt(t);
  const offset: number = 15;
  normal.copy(binormal).cross(dir);
  // We move on a offset on its binormal
  pos.add(normal.clone().multiplyScalar(offset));
  splineCamera.position.copy(pos);
  cameraEye.position.copy(pos);
  // Camera Orientation 1 - default look at
  // splineCamera.lookAt(lookAt);
  // Using arclength for stablization in look ahead.
  const lookAt: THREE.Vector3 = tube.parameters.path.getPointAt((t + 30 / tube.parameters.path.getLength()) % 1).multiplyScalar(scale);
  // Camera Orientation 2 - up orientation via normal
  if (!lookAhead)
  lookAt.copy(pos).add(dir);
  splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
  splineCamera.rotation.setFromRotationMatrix(splineCamera.matrix, splineCamera.rotation.order);
  cameraHelper.update();
  parent.rotation.y += (targetRotation - parent.rotation.y) * 0.05;
  renderer.render(scene, animation === true ? splineCamera : camera);
}
