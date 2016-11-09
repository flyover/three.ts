import * as THREE from '../src/Three';
import { MMDLoader as THREE_MMDLoader, MMDHelper as THREE_MMDHelper } from './js/loaders/MMDLoader';
let container, stats;
let camera, scene, renderer;
let helper;
let vpds = [];
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
  camera.position.z = 25;
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
  let vpdFiles = [
    'models/mmd/vpd/01.vpd',
    'models/mmd/vpd/02.vpd',
    'models/mmd/vpd/03.vpd',
    'models/mmd/vpd/04.vpd',
    'models/mmd/vpd/05.vpd',
    'models/mmd/vpd/06.vpd',
    'models/mmd/vpd/07.vpd',
    'models/mmd/vpd/08.vpd',
    //'models/mmd/vpd/09.vpd',
    //'models/mmd/vpd/10.vpd',
    'models/mmd/vpd/11.vpd'
  ];
  helper = new THREE_MMDHelper(renderer);
  let loader = new THREE_MMDLoader();
  loader.setDefaultTexturePath('./models/mmd/default/');
  loader.loadModel(modelFile, function(object) {
    let mesh = object;
    mesh.position.y = -10;
    helper.add(mesh);
    scene.add(mesh);
    let vpdIndex = 0;
    function loadVpd () {
      let vpdFile = vpdFiles[ vpdIndex ];
      loader.loadVpd(vpdFile, function(vpd) {
        vpds.push(vpd);
        vpdIndex++;
        if (vpdIndex < vpdFiles.length) {
          loadVpd();
        } else {
          initGui(mesh, vpds);
          ready = true;
        }
      }, onProgress, onError);
    };
    loadVpd();
  }, onProgress, onError);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  //
  window.addEventListener('resize', onWindowResize, false);
  function initGui (mesh, vpds) {
    let gui = new dat.GUI();
    let dictionary = mesh.morphTargetDictionary;
    let controls: any = {};
    let keys = [];
    let poses = gui.addFolder('Poses');
    let morphs = gui.addFolder('Morphs');
    function getBaseName (s) {
      return s.slice(s.lastIndexOf('/') + 1);
    };
    function initControls () {
      for (let key in dictionary) {
        controls[ key ] = 0.0;
      }
      controls.pose = -1;
      for (let i = 0; i < vpdFiles.length; i++) {
        controls[ getBaseName(vpdFiles[ i ]) ] = false;
      }
    };
    function initKeys () {
      for (let key in dictionary) {
        keys.push(key);
      }
    };
    function initPoses () {
      let files = { default: -1 };
      for (let i = 0; i < vpdFiles.length; i++) {
        files[ getBaseName(vpdFiles[ i ]) ] = i;
      }
      poses.add(controls, 'pose', files).onChange(onChangePose);
    };
    function initMorphs () {
      for (let key in dictionary) {
        morphs.add(controls, key, 0.0, 1.0, 0.01).onChange(onChangeMorph);
      }
    };
    function onChangeMorph () {
      for (let i = 0; i < keys.length; i++) {
        let key = keys[ i ];
        let value = controls[ key ];
        mesh.morphTargetInfluences[ i ] = value;
      }
    };
    function onChangePose () {
      let index = parseInt(controls.pose);
      if (index === -1) {
        mesh.pose();
      } else {
        helper.poseAsVpd(mesh, vpds[ index ]);
      }
    };
    initControls();
    initKeys();
    initPoses();
    initMorphs();
    onChangeMorph();
    onChangePose();
    poses.open();
    morphs.open();
  }
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
/*
  camera.position.x += (- mouseX - camera.position.x) * .05;
  camera.position.y += (- mouseY - camera.position.y) * .05;
  camera.lookAt(scene.position);
*/
  if (ready) {
    helper.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}
