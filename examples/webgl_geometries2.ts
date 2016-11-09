import * as THREE from '../src/Three';
import * as THREE_Curves from './js/CurveExtras';
import * as THREE_ParametricGeometries from './js/ParametricGeometries';
if (! Detector.webgl) Detector.addGetWebGLMessage();
let container, stats;
let camera, scene, renderer;
init();
animate();
function init() {
  container = document.createElement('div');
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.y = 400;
  scene = new THREE.Scene();
  let light, object, materials;
  scene.add(new THREE.AmbientLight(0x404040));
  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 1);
  scene.add(light);
  let map = new THREE.TextureLoader().load('textures/UV_Grid_Sm.jpg');
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;
  materials = [
    new THREE.MeshLambertMaterial({ map: map, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
  ];
  let p = 2;
  let q = 3;
  let radius = 150, tube = 10, segmentsT = 50, segmentsR = 20;
  let GrannyKnot =  new THREE_Curves.GrannyKnot();
  let torus2 = new THREE_ParametricGeometries.TorusKnotGeometry(radius, tube, segmentsT, segmentsR, p , q);
  let sphere2 = new THREE_ParametricGeometries.SphereGeometry(75, 20, 10);
  let tube2 = new THREE_ParametricGeometries.TubeGeometry(GrannyKnot, 150, 2, 8, true, false);
  let geo;
  // Klein Bottle
  geo = new THREE.ParametricBufferGeometry(THREE_ParametricGeometries.klein, 20, 20);
  object = THREE.SceneUtils.createMultiMaterialObject(geo, materials);
  object.position.set(0, 0, 0);
  object.scale.multiplyScalar(10);
  scene.add(object);
  // Mobius Strip
  geo = new THREE.ParametricBufferGeometry(THREE_ParametricGeometries.mobius, 20, 20);
  object = THREE.SceneUtils.createMultiMaterialObject(geo, materials);
  object.position.set(10, 0, 0);
  object.scale.multiplyScalar(100);
  scene.add(object);
  // Plane
  geo = new THREE.ParametricBufferGeometry(THREE_ParametricGeometries.plane(200, 200), 10, 20);
  object = THREE.SceneUtils.createMultiMaterialObject(geo, materials);
  object.position.set(0, 0, 0);
  scene.add(object);
  object = THREE.SceneUtils.createMultiMaterialObject(torus2, materials);
  object.position.set(0, 100, 0);
  scene.add(object);
  object = THREE.SceneUtils.createMultiMaterialObject(sphere2, materials);
  object.position.set(200, 0, 0);
  scene.add(object);
  object = THREE.SceneUtils.createMultiMaterialObject(tube2, materials);
  object.position.set(100, 0, 0);
  scene.add(object);
  object = new THREE.AxisHelper(50);
  object.position.set(200, 0, -200);
  scene.add(object);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  stats = new Stats();
  container.appendChild(stats.dom);
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}
function render() {
  let timer = Date.now() * 0.0001;
  camera.position.x = Math.cos(timer) * 800;
  camera.position.z = Math.sin(timer) * 800;
  camera.lookAt(scene.position);
  for (let i = 0, l = scene.children.length; i < l; i ++) {
    let object = scene.children[ i ];
    object.rotation.x = timer * 5;
    object.rotation.y = timer * 2.5;
  }
  renderer.render(scene, camera);
}
