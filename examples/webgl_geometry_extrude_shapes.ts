import * as THREE from "../src/Three";
import { TrackballControls  as THREE_TrackballControls } from "./js/controls/TrackballControls";
let camera, scene, renderer, controls;
init();
animate();
function init() {
  let info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.style.color = '#fff';
  // info.style.link = '#f80';
  info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - geometry extrude shapes';
  document.body.appendChild(info);
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x222222);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 0, 500);
  controls = new THREE_TrackballControls(camera, renderer.domElement);
  controls.minDistance = 200;
  controls.maxDistance = 500;
  scene.add(new THREE.AmbientLight(0x222222));
  let light = new THREE.PointLight(0xffffff);
  light.position.copy(camera.position);
  scene.add(light);
  //
  let pts, count, shape, geometry, material, material2, mesh;
  let closedSpline = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-60, -100,  60),
    new THREE.Vector3(-60,   20,  60),
    new THREE.Vector3(-60,  120,  60),
    new THREE.Vector3(60,   20, -60),
    new THREE.Vector3(60, -100, -60)
  ]);
  closedSpline.type = 'catmullrom';
  closedSpline.closed = true;
  let extrudeSettings: any = {
    steps      : 100,
    bevelEnabled  : false,
    extrudePath    : closedSpline
  };
  pts = [], count = 3;
  for (let i = 0; i < count; i ++) {
    let l = 20;
    let a = 2 * i / count * Math.PI;
    pts.push(new THREE.Vector2 (Math.cos(a) * l, Math.sin(a) * l));
  }
  shape = new THREE.Shape(pts);
  geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  material = new THREE.MeshLambertMaterial({ color: 0xb00000, wireframe: false });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  //
  let randomPoints = [];
  for (let i = 0; i < 10; i ++) {
    randomPoints.push(new THREE.Vector3((i - 4.5) * 50, THREE.Math.randFloat(- 50, 50), THREE.Math.randFloat(- 50, 50)));
  }
  let randomSpline =  new THREE.CatmullRomCurve3(randomPoints);
  //
  extrudeSettings = {
    steps      : 200,
    bevelEnabled  : false,
    extrudePath    : randomSpline
  };
  pts = [], count = 5;
  for (let i = 0; i < count * 2; i ++) {
    let l = i % 2 === 1 ? 10 : 20;
    let a = i / count * Math.PI;
    pts.push(new THREE.Vector2 (Math.cos(a) * l, Math.sin(a) * l));
  }
  shape = new THREE.Shape(pts);
  geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  material2 = new THREE.MeshLambertMaterial({ color: 0xff8000, wireframe: false });
  mesh = new THREE.Mesh(geometry, material2);
  scene.add(mesh);
  //
  let materials = [ material, material2 ];
  extrudeSettings = {
    amount      : 20,
    steps      : 1,
    material    : 1,
    extrudeMaterial : 0,
    bevelEnabled  : true,
    bevelThickness  : 2,
    bevelSize       : 4,
    bevelSegments   : 1,
  };
  geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));
  mesh.position.set(50, 100, 50);
  scene.add(mesh);
}
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
