import * as THREE from '../src/Three';
import { TGALoader as THREE_TGALoader } from './js/loaders/TGALoader';
if (! Detector.webgl) Detector.addGetWebGLMessage();
let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let container, stats;
let camera, scene, renderer;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
init();
animate();
function init() {
  container = document.createElement('div');
  document.body.appendChild(container);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  camera = new THREE.PerspectiveCamera(35, SCREEN_WIDTH / SCREEN_HEIGHT, 10, 2000);
  camera.position.z = 200;
  scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);
  let loader = new THREE_TGALoader();
  // add box 1 - grey8 texture
  let texture1 = loader.load('textures/crate_grey8.tga');
  let material1 = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture1 });
  let geometry = new THREE.BoxGeometry(50, 50, 50);
  let mesh1 = new THREE.Mesh(geometry, material1);
  mesh1.position.x = - 50;
  scene.add(mesh1);
  // add box 2 - tga texture
  let texture2 = loader.load('textures/crate_color8.tga');
  let material2 = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture2 });
  let mesh2 = new THREE.Mesh(geometry, material2);
  mesh2.position.x = 50;
  scene.add(mesh2);
  // RENDERER
  renderer.setClearColor(0xf2f7ff);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.domElement.style.position = "relative";
  container.appendChild(renderer.domElement);
  // STATS1
  stats = new Stats();
  container.appendChild(stats.dom);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
}
function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
}
function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}
function render() {
  camera.position.x += (mouseX - camera.position.x) * .05;
  camera.position.y = THREE.Math.clamp(camera.position.y + (- (mouseY - 200) - camera.position.y) * .05, 50, 1000);
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
