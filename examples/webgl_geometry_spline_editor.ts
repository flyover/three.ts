import * as THREE from '../src/Three';
import { DragControls as THREE_DragControls } from './js/controls/DragControls';
import { OrbitControls as THREE_OrbitControls } from './js/controls/OrbitControls';
import { TransformControls as THREE_TransformControls } from './js/controls/TransformControls';
function format(str, ...args) {
  for (let i = 1; i < arguments.length; i ++) {
    str = str.replace('{' + (i - 1) + '}', arguments[ i ]);
  }
  return str;
}
let container, stats;
let camera, scene, renderer;
let controls;
let transformControl;
const splineHelperObjects = [];
let splineOutline;
let splinePointsLength = 4;
let positions = [];
const geometry = new THREE.BoxGeometry(20, 20, 20);
const ARC_SEGMENTS = 200;
const splines: any = {};
init();
animate();
function init() {
  container = document.createElement('div');
  document.body.appendChild(container);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 1000;
  scene.add(camera);
  scene.add(new THREE.AmbientLight(0xf0f0f0));
  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 1500, 200);
  light.castShadow = true;
  light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
  light.shadow.bias = -0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);
  // scene.add(new THREE.CameraHelper(light.shadow.camera));
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  planeGeometry.rotateX(- Math.PI / 2);
  const planeMaterial = new THREE.ShadowMaterial();
  planeMaterial.opacity = 0.2;
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.receiveShadow = true;
  scene.add(plane);
  const helper = new THREE.GridHelper(1000, 100);
  helper.position.y = - 199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);
  const axis = new THREE.AxisHelper();
  axis.position.set(-500, -500, -500);
  scene.add(axis);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0xf0f0f0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  const info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = 'catmull-rom rom spline comparisions';
  const options = document.createElement('div');
  options.style.position = 'absolute';
  options.style.top = '30px';
  options.style.width = '100%';
  options.style.textAlign = 'center';
  options.innerHTML = 'Points: <input type="button" id="addPoint" value="+" />\
    <input type="button" id="removePoint" value="-" />\
    <input type="button" id="exportSpline" value="Export" /><br />\
    <input type="checkbox" id="uniform" checked /> <label for="uniform">Uniform Catmull-rom</label>  <input type="range" id="tension" min=0 max=1 step=0.01 value=0.5 /> <span id="tension_value" /></span> <br />\
    <input type="checkbox" id="centripetal" checked /> Centripetal Catmull-rom<br />\
    <input type="checkbox" id="chordal" checked /> Chordal Catmull-rom<br />';
  container.appendChild(info);
  container.appendChild(options);
  document.getElementById('addPoint').addEventListener('click', function(event) { addPoint(); });
  document.getElementById('removePoint').addEventListener('click', function(event) { removePoint(); });
  document.getElementById('exportSpline').addEventListener('click', function(event) { exportSpline(); });
  document.getElementById('uniform').addEventListener('change', function(this: HTMLInputElement, event) { splines.uniform.mesh.visible = this.checked; });
  document.getElementById('tension').addEventListener('change', function(this: HTMLInputElement, event) { splines.uniform.curve.tension = this.value; updateSplineOutline(); });
  document.getElementById('centripetal').addEventListener('change', function(this: HTMLInputElement, event) { splines.centripetal.mesh.visible = this.checked; });
  document.getElementById('chordal').addEventListener('change', function(this: HTMLInputElement, event) { splines.chordal.mesh.visible = this.checked; });
  stats = new Stats();
  container.appendChild(stats.dom);
  // Controls
  controls = new THREE_OrbitControls(camera, renderer.domElement);
  controls.dampingFactor = 0.2;
  //controls.addEventListener('change', render);
  transformControl = new THREE_TransformControls(camera, renderer.domElement);
  //transformControl.addEventListener('change', render);
  scene.add(transformControl);
  // Hiding transform situation is a little in a mess :()
  transformControl.addEventListener('change', function(e) { cancelHideTransorm(); });
  transformControl.addEventListener('mouseDown', function(e) { cancelHideTransorm(); });
  transformControl.addEventListener('mouseUp', function(e) { delayHideTransform(); });
  transformControl.addEventListener('objectChange', function(e) { updateSplineOutline(); });
  const dragcontrols = new THREE_DragControls(camera, splineHelperObjects, renderer.domElement); //
  dragcontrols.on('hoveron', function(e) {
    transformControl.attach(e.object);
    cancelHideTransorm(); // *
  });
  dragcontrols.on('hoveroff', function(e) {
    if (e) delayHideTransform();
  });
  controls.addEventListener('start', function() {
    cancelHideTransorm();
  });
  controls.addEventListener('end', function() {
    delayHideTransform();
  });
  let hiding;
  function delayHideTransform() {
    cancelHideTransorm();
    hideTransform();
  }
  function hideTransform() {
    hiding = setTimeout(function() {
      transformControl.detach(transformControl.object);
    }, 2500);
  }
  function cancelHideTransorm() {
    if (hiding) clearTimeout(hiding);
  }
  /*******
   * Curves
   *********/
  for (let i = 0; i < splinePointsLength; i ++) {
    addSplineObject(positions[ i ]);
  }
  positions = [];
  for (let i = 0; i < splinePointsLength; i ++) {
    positions.push(splineHelperObjects[ i ].position);
  }
  const geometry = new THREE.Geometry();
  for (let i = 0; i < ARC_SEGMENTS; i ++) {
    geometry.vertices.push(new THREE.Vector3());
  }
  let curve;
  let mesh;
  curve = new THREE.CatmullRomCurve3(positions);
  curve.type = 'catmullrom';
  mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
    color: 0xff0000,
    opacity: 0.35,
    linewidth: 2
    }));
  mesh.castShadow = true;
  splines.uniform = { curve: curve, mesh: mesh };
  curve = new THREE.CatmullRomCurve3(positions);
  curve.type = 'centripetal';
  mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
    color: 0x00ff00,
    opacity: 0.35,
    linewidth: 2
    }));
  mesh.castShadow = true;
  splines.centripetal = { curve: curve, mesh: mesh };
  curve = new THREE.CatmullRomCurve3(positions);
  curve.type = 'chordal';
  mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
    color: 0x0000ff,
    opacity: 0.35,
    linewidth: 2
    }));
  mesh.castShadow = true;
  splines.chordal = { curve: curve, mesh: mesh };
  for (const k in splines) {
    const spline = splines[ k ];
    scene.add(spline.mesh);
  }
  load([ new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
      new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
      new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
      new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746) ]);
}
function addSplineObject(position?) {
  const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
  //material.ambient = material.color;
  const object = new THREE.Mesh(geometry, material);
  if (position) {
    object.position.copy(position);
  } else {
    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600;
    object.position.z = Math.random() * 800 - 400;
  }
  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object);
  splineHelperObjects.push(object);
  return object;
}
function addPoint() {
  splinePointsLength ++;
  positions.push(addSplineObject().position);
  updateSplineOutline();
}
function removePoint() {
  if (splinePointsLength <= 4) {
    return;
  }
  splinePointsLength --;
  positions.pop();
  scene.remove(splineHelperObjects.pop());
  updateSplineOutline();
}
function updateSplineOutline() {
  for (let k in splines) {
    const spline = splines[ k ];
    const splineCurve = spline.curve;
    const splineMesh = spline.mesh;
    for (let i = 0; i < ARC_SEGMENTS; i ++) {
      const p = splineMesh.geometry.vertices[ i ];
      p.copy(splineCurve.getPoint(i /  (ARC_SEGMENTS - 1)));
    }
    splineMesh.geometry.verticesNeedUpdate = true;
  }
}
function exportSpline() {
  const strplace = [];
  for (let i = 0; i < splinePointsLength; i ++) {
    const p = splineHelperObjects[ i ].position;
    strplace.push(format('new THREE.Vector3({0}, {1}, {2})', p.x, p.y, p.z));
  }
  console.log(strplace.join(',\n'));
  const code = '[' + (strplace.join(',\n\t')) + ']';
  prompt('copy and paste code', code);
}
function load(new_positions) {
  while (new_positions.length > positions.length) {
    addPoint();
  }
  while (new_positions.length < positions.length) {
    removePoint();
  }
  for (let i = 0; i < positions.length; i ++) {
    positions[ i ].copy(new_positions[ i ]);
  }
  updateSplineOutline();
}
function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
  controls.update();
  transformControl.update();
}
function render() {
  renderer.render(scene, camera);
}
