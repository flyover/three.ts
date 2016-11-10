import * as THREE from "../src/Three";
import { MMDLoader as THREE_MMDLoader, MMDHelper as THREE_MMDHelper } from "./js/loaders/MMDLoader";
let container, stats;
let mesh, camera, scene, renderer;
let helper;
let ready = false;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let clock = new THREE.Clock();
init();
animate();
function init() {
  container = document.createElement('div');
  document.body.appendChild(container);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  // scene
  scene = new THREE.Scene();
  let ambient = new THREE.AmbientLight(0x666666);
  scene.add(ambient);
  let directionalLight = new THREE.DirectionalLight(0x887766);
  directionalLight.position.set(-1, 1, 1).normalize();
  scene.add(directionalLight);
  //
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0xffffff));
  container.appendChild(renderer.domElement);
  // model
  let onProgress = function(xhr) {
    if (xhr.lengthComputable) {
      let percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete) + '% downloaded');
    }
  };
  let onError = function(xhr) {
  };
  let modelFile = 'models/mmd/miku/miku_v2.pmd';
  let vmdFiles = [ 'models/mmd/vmd/wavefile_v2.vmd' ];
  let cameraFiles = [ 'models/mmd/vmd/wavefile_camera.vmd' ];
  let stageFile = 'models/mmd/stage/stage.pmd';
  let audioFile = 'models/mmd/audio/wavefile_short.mp3';
  let audioParams = { delayTime: 160 * 1 / 30 };
  helper = new THREE_MMDHelper(renderer);
  let loader = new THREE_MMDLoader();
  loader.setDefaultTexturePath('./models/mmd/default/');
  loader.load(modelFile, vmdFiles, function(object) {
    mesh = object;
    helper.add(mesh);
    helper.setAnimation(mesh);
    /*
     * Note: You must set Physics
     *       before you add mesh to scene or any other 3D object.
     * Note: Physics calculation is pretty heavy.
     *       It may not be acceptable for most mobile devices yet.
      */
    if (! isMobileDevice()) {
      helper.setPhysics(mesh);
    }
    loader.loadVmds(cameraFiles, function(vmd) {
      helper.setCamera(camera);
      loader.pourVmdIntoCamera(camera, vmd);
      helper.setCameraAnimation(camera);
      loader.loadModel(stageFile, function(stage) {
        loader.loadAudio(audioFile, function(audio, listener) {
          listener.position.z = 1;
          helper.setAudio(audio, listener, audioParams);
          /*
           * Note: call this method after you set all animations
           *       including camera and audio.
           */
          helper.unifyAnimationDuration();
          scene.add(audio);
          scene.add(listener);
          scene.add(stage);
          scene.add(mesh);
          ready = true;
        }, onProgress, onError);
      }, onProgress, onError);
    }, onProgress, onError);
  }, onProgress, onError);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  //
  window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  helper.setSize(window.innerWidth, window.innerHeight);
}
function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
}
//
function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  if (ready) {
    let delta = clock.getDelta();
    helper.animate(delta);
    helper.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}
// easy mobile device detection
function isMobileDevice () {
  if (navigator === undefined || navigator.userAgent === undefined) {
    return true;
  }
  let s = navigator.userAgent;
  if (s.match(/iPhone/i)
  //|| s.match(/iPad/i)
  || s.match(/iPod/i)
  || s.match(/webOS/i)
  || s.match(/BlackBerry/i)
  || (s.match(/Windows/i) && s.match(/Phone/i))
  || (s.match(/Android/i) && s.match(/Mobile/i))) {
    return true;
  }
  return false;
}
