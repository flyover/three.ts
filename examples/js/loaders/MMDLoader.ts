/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - charset-encoder-js https://github.com/takahirox/charset-encoder-js
 *  - ammo.js https://github.com/kripken/ammo.js
 *  - THREE.TGALoader
 *  - THREE.MMDPhysics
 *  - THREE.CCDIKSolver
 *  - THREE.OutlineEffect
 *
 *
 * This loader loads and parses PMD/PMX and VMD binary files
 * then creates mesh for Three.js.
 *
 * PMD/PMX is a model data format and VMD is a motion data format
 * used in MMD(Miku Miku Dance).
 *
 * MMD is a 3D CG animation tool which is popular in Japan.
 *
 *
 * MMD official site
 *  http://www.geocities.jp/higuchuu4/index_e.htm
 *
 * PMD, VMD format
 *  http://blog.goo.ne.jp/torisu_tetosuki/e/209ad341d3ece2b1b4df24abf619d6e4
 *
 * PMX format
 *  http://gulshan-i-raz.geo.jp/labs/2012/10/17/pmx-format1/
 *
 *
 * TODO
 *  - light motion in vmd support.
 *  - SDEF support.
 *  - uv/material/bone morphing support.
 *  - more precise grant skinning support.
 *  - shadow support.
 */
import * as THREE from '../../../src/Three';
import { TGALoader as THREE_TGALoader } from './TGALoader';
import { CCDIKSolver as THREE_CCDIKSolver } from '../animation/CCDIKSolver';
import { MMDPhysics as THREE_MMDPhysics } from '../animation/MMDPhysics';
import { OutlineEffect as THREE_OutlineEffect } from '../effects/OutlineEffect';
export class MMDLoader extends THREE.Loader {
  manager: THREE.LoadingManager;
  defaultTexturePath = './models/default/';
  constructor(manager: THREE.LoadingManager = THREE.DefaultLoadingManager) {
    super();
    this.manager = manager;
  }
  setDefaultTexturePath(path) {
    this.defaultTexturePath = path;
  }
  load(modelUrl, vmdUrls, callback, onProgress, onError) {
    let scope = this;
    this.loadModel(modelUrl, function(mesh) {
      scope.loadVmds(vmdUrls, function(vmd) {
        scope.pourVmdIntoModel(mesh, vmd);
        callback(mesh);
      }, onProgress, onError);
    }, onProgress, onError);
  }
  loadModel(url, callback, onProgress, onError) {
    let scope = this;
    let texturePath = this.extractUrlBase(url);
    let modelExtension = this.extractExtension(url);
    this.loadFileAsBuffer(url, function(buffer) {
      callback(scope.createModel(buffer, modelExtension, texturePath));
    }, onProgress, onError);
  }
  createModel(buffer, modelExtension, texturePath) {
    return this.createMesh(this.parseModel(buffer, modelExtension), texturePath);
  }
  loadVmd(url, callback, onProgress, onError) {
    let scope = this;
    this.loadFileAsBuffer(url, function(buffer) {
      callback(scope.parseVmd(buffer));
    }, onProgress, onError);
  }
  loadVmds(urls, callback, onProgress, onError) {
    let scope = this;
    let vmds = [];
    function run () {
      let url = urls.shift();
      scope.loadVmd(url, function(vmd) {
        vmds.push(vmd);
        if (urls.length > 0) {
          run();
        } else {
          callback(scope.mergeVmds(vmds));
        }
      }, onProgress, onError);
    }
    run();
  }
  loadAudio(url, callback, onProgress, onError) {
    let listener = new THREE.AudioListener();
    let audio = new THREE.Audio(listener);
    let loader = new THREE.AudioLoader(this.manager);
    loader.load(url, function(buffer) {
      audio.setBuffer(buffer);
      callback(audio, listener);
    }, onProgress, onError);
  }
  loadVpd(url, callback, onProgress?, onError?, params?) {
    let scope = this;
    let func = ((params && params.charcode === 'unicode') ? this.loadFileAsText : this.loadFileAsShiftJISText).bind(this);
    func(url, function(text) {
      callback(scope.parseVpd(text));
    }, onProgress, onError);
  }
  mergeVmds(vmds) {
    let v: any = {};
    v.metadata = {};
    v.metadata.name = vmds[ 0 ].metadata.name;
    v.metadata.coordinateSystem = vmds[ 0 ].metadata.coordinateSystem;
    v.metadata.motionCount = 0;
    v.metadata.morphCount = 0;
    v.metadata.cameraCount = 0;
    v.motions = [];
    v.morphs = [];
    v.cameras = [];
    for (let i = 0; i < vmds.length; i++) {
      let v2 = vmds[ i ];
      v.metadata.motionCount += v2.metadata.motionCount;
      v.metadata.morphCount += v2.metadata.morphCount;
      v.metadata.cameraCount += v2.metadata.cameraCount;
      for (let j = 0; j < v2.metadata.motionCount; j++) {
        v.motions.push(v2.motions[ j ]);
      }
      for (let j = 0; j < v2.metadata.morphCount; j++) {
        v.morphs.push(v2.morphs[ j ]);
      }
      for (let j = 0; j < v2.metadata.cameraCount; j++) {
        v.cameras.push(v2.cameras[ j ]);
      }
    }
    return v;
  }
  pourVmdIntoModel(mesh, vmd, name?) {
    this.createAnimation(mesh, vmd, name);
  }
  pourVmdIntoCamera(camera, vmd, name?) {
    let helper = new MMDLoader.DataCreationHelper();
    function initAnimation() {
      let orderedMotions = helper.createOrderedMotionArray(vmd.cameras);
      let q = new THREE.Quaternion();
      let e = new THREE.Euler();
      let pkeys = [];
      let ckeys = [];
      let ukeys = [];
      let fkeys = [];
      for (let i = 0; i < orderedMotions.length; i++) {
        let m = orderedMotions[ i ];
        let t = m.frameNum / 30;
        let p = m.position;
        let r = m.rotation;
        let d = m.distance;
        let f = m.fov;
        let position = new THREE.Vector3(0, 0, -d);
        let center = new THREE.Vector3(p[ 0 ], p[ 1 ], p[ 2 ]);
        let up = new THREE.Vector3(0, 1, 0);
        e.set(-r[ 0 ], -r[ 1 ], -r[ 2 ]);
        q.setFromEuler(e);
        position.add(center);
        position.applyQuaternion(q);
        up.applyQuaternion(q);
        helper.pushAnimationKey(pkeys, t, position, true);
        helper.pushAnimationKey(ckeys, t, center, true);
        helper.pushAnimationKey(ukeys, t, up, true);
        helper.pushAnimationKey(fkeys, t, f, true);
      }
      helper.insertAnimationKeyAtTimeZero(pkeys, new THREE.Vector3(0, 0, 0));
      helper.insertAnimationKeyAtTimeZero(ckeys, new THREE.Vector3(0, 0, 0));
      helper.insertAnimationKeyAtTimeZero(ukeys, new THREE.Vector3(0, 0, 0));
      helper.insertAnimationKeyAtTimeZero(fkeys, 45);
      helper.insertStartAnimationKey(pkeys);
      helper.insertStartAnimationKey(ckeys);
      helper.insertStartAnimationKey(ukeys);
      helper.insertStartAnimationKey(fkeys);
      let tracks = [];
      tracks.push(helper.generateTrackFromAnimationKeys(pkeys, 'VectorKeyframeTrackEx', '.position'));
      tracks.push(helper.generateTrackFromAnimationKeys(ckeys, 'VectorKeyframeTrackEx', '.center'));
      tracks.push(helper.generateTrackFromAnimationKeys(ukeys, 'VectorKeyframeTrackEx', '.up'));
      tracks.push(helper.generateTrackFromAnimationKeys(fkeys, 'NumberKeyframeTrackEx', '.fov'));
      camera.center = new THREE.Vector3(0, 0, 0);
      if (camera.animations === undefined) {
        camera.animations = [];
      }
      camera.animations.push(new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name, -1, tracks));
    };
    this.leftToRightVmd(vmd);
    initAnimation();
  }
  extractExtension(url) {
    let index = url.lastIndexOf('.');
    if (index < 0) {
      return null;
    }
    return url.slice(index + 1);
  }
  loadFile(url, onLoad, onProgress, onError, responseType) {
    let loader = new THREE.XHRLoader(this.manager);
    loader.setResponseType(responseType);
    let request = loader.load(url, function(result) {
      onLoad(result);
    }, onProgress, onError);
    return request;
  }
  loadFileAsBuffer(url, onLoad, onProgress, onError) {
    this.loadFile(url, onLoad, onProgress, onError, 'arraybuffer');
  }
  loadFileAsText(url, onLoad, onProgress, onError) {
    this.loadFile(url, onLoad, onProgress, onError, 'text');
  }
  loadFileAsShiftJISText(url, onLoad, onProgress, onError) {
    let request = this.loadFile(url, onLoad, onProgress, onError, 'text');
    /*
     * TODO: some browsers seem not support overrideMimeType
     *       so some workarounds for them may be necessary.
     * Note: to set property of request after calling request.send(null)
     *       (it's called in THREE.XHRLoader.load()) could be a bad manner.
     */
    request.overrideMimeType('text/plain; charset=shift_jis');
  }
  parseModel(buffer, modelExtension) {
    // Should I judge from model data header?
    switch (modelExtension.toLowerCase()) {
      case 'pmd':
        return this.parsePmd(buffer);
      case 'pmx':
        return this.parsePmx(buffer);
      default:
        throw 'extension ' + modelExtension + ' is not supported.';
    }
  }
  parsePmd(buffer) {
    let scope = this;
    let pmd: any = {};
    let dv = new MMDLoader.DataView(buffer);
    let helper = new MMDLoader.DataCreationHelper();
    pmd.metadata = {};
    pmd.metadata.format = 'pmd';
    pmd.metadata.coordinateSystem = 'left';
    function parseHeader() {
      let metadata = pmd.metadata;
      metadata.magic = dv.getChars(3);
      if (metadata.magic !== 'Pmd') {
        throw 'PMD file magic is not Pmd, but ' + metadata.magic;
      }
      metadata.version = dv.getFloat32();
      metadata.modelName = dv.getSjisStringsAsUnicode(20);
      metadata.comment = dv.getSjisStringsAsUnicode(256);
    };
    function parseVertices() {
      function parseVertex() {
        let p: any = {};
        p.position = dv.getFloat32Array(3);
        p.normal = dv.getFloat32Array(3);
        p.uv = dv.getFloat32Array(2);
        p.skinIndices = dv.getUint16Array(2);
        p.skinWeights = [ dv.getUint8() / 100 ];
        p.skinWeights.push(1.0 - p.skinWeights[ 0 ]);
        p.edgeFlag = dv.getUint8();
        return p;
      };
      let metadata = pmd.metadata;
      metadata.vertexCount = dv.getUint32();
      pmd.vertices = [];
      for (let i = 0; i < metadata.vertexCount; i++) {
        pmd.vertices.push(parseVertex());
      }
    };
    function parseFaces() {
      function parseFace() {
        let p: any = {};
        p.indices = dv.getUint16Array(3);
        return p;
      };
      let metadata = pmd.metadata;
      metadata.faceCount = dv.getUint32() / 3;
      pmd.faces = [];
      for (let i = 0; i < metadata.faceCount; i++) {
        pmd.faces.push(parseFace());
      }
    };
    function parseMaterials() {
      function parseMaterial() {
        let p: any = {};
        p.diffuse = dv.getFloat32Array(4);
        p.shininess = dv.getFloat32();
        p.specular = dv.getFloat32Array(3);
        p.emissive = dv.getFloat32Array(3);
        p.toonIndex = dv.getInt8();
        p.edgeFlag = dv.getUint8();
        p.faceCount = dv.getUint32() / 3;
        p.fileName = dv.getSjisStringsAsUnicode(20);
        return p;
      };
      let metadata = pmd.metadata;
      metadata.materialCount = dv.getUint32();
      pmd.materials = [];
      for (let i = 0; i < metadata.materialCount; i++) {
        pmd.materials.push(parseMaterial());
      }
    };
    function parseBones() {
      function parseBone() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(20);
        p.parentIndex = dv.getInt16();
        p.tailIndex = dv.getInt16();
        p.type = dv.getUint8();
        p.ikIndex = dv.getInt16();
        p.position = dv.getFloat32Array(3);
        return p;
      };
      let metadata = pmd.metadata;
      metadata.boneCount = dv.getUint16();
      pmd.bones = [];
      for (let i = 0; i < metadata.boneCount; i++) {
        pmd.bones.push(parseBone());
      }
    };
    function parseIks() {
      function parseIk() {
        let p: any = {};
        p.target = dv.getUint16();
        p.effector = dv.getUint16();
        p.linkCount = dv.getUint8();
        p.iteration = dv.getUint16();
        p.maxAngle = dv.getFloat32();
        p.links = [];
        for (let i = 0; i < p.linkCount; i++) {
          let link: any = {};
          link.index = dv.getUint16();
          p.links.push(link);
        }
        return p;
      };
      let metadata = pmd.metadata;
      metadata.ikCount = dv.getUint16();
      pmd.iks = [];
      for (let i = 0; i < metadata.ikCount; i++) {
        pmd.iks.push(parseIk());
      }
    };
    function parseMorphs() {
      function parseMorph() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(20);
        p.elementCount = dv.getUint32();
        p.type = dv.getUint8();
        p.elements = [];
        for (let i = 0; i < p.elementCount; i++) {
          p.elements.push({
            index: dv.getUint32(),
            position: dv.getFloat32Array(3)
          }) ;
        }
        return p;
      };
      let metadata = pmd.metadata;
      metadata.morphCount = dv.getUint16();
      pmd.morphs = [];
      for (let i = 0; i < metadata.morphCount; i++) {
        pmd.morphs.push(parseMorph());
      }
    };
    function parseMorphFrames() {
      function parseMorphFrame() {
        let p: any = {};
        p.index = dv.getUint16();
        return p;
      };
      let metadata = pmd.metadata;
      metadata.morphFrameCount = dv.getUint8();
      pmd.morphFrames = [];
      for (let i = 0; i < metadata.morphFrameCount; i++) {
        pmd.morphFrames.push(parseMorphFrame());
      }
    };
    function parseBoneFrameNames() {
      function parseBoneFrameName() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(50);
        return p;
      };
      let metadata = pmd.metadata;
      metadata.boneFrameNameCount = dv.getUint8();
      pmd.boneFrameNames = [];
      for (let i = 0; i < metadata.boneFrameNameCount; i++) {
        pmd.boneFrameNames.push(parseBoneFrameName());
      }
    };
    function parseBoneFrames() {
      function parseBoneFrame() {
        let p: any = {};
        p.boneIndex = dv.getInt16();
        p.frameIndex = dv.getUint8();
        return p;
      };
      let metadata = pmd.metadata;
      metadata.boneFrameCount = dv.getUint32();
      pmd.boneFrames = [];
      for (let i = 0; i < metadata.boneFrameCount; i++) {
        pmd.boneFrames.push(parseBoneFrame());
      }
    };
    function parseEnglishHeader() {
      let metadata = pmd.metadata;
      metadata.englishCompatibility = dv.getUint8();
      if (metadata.englishCompatibility > 0) {
        metadata.englishModelName = dv.getSjisStringsAsUnicode(20);
        metadata.englishComment = dv.getSjisStringsAsUnicode(256);
      }
    };
    function parseEnglishBoneNames() {
      function parseEnglishBoneName() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(20);
        return p;
      };
      let metadata = pmd.metadata;
      if (metadata.englishCompatibility === 0) {
        return;
      }
      pmd.englishBoneNames = [];
      for (let i = 0; i < metadata.boneCount; i++) {
        pmd.englishBoneNames.push(parseEnglishBoneName());
      }
    };
    function parseEnglishMorphNames() {
      function parseEnglishMorphName() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(20);
        return p;
      };
      let metadata = pmd.metadata;
      if (metadata.englishCompatibility === 0) {
        return;
      }
      pmd.englishMorphNames = [];
      for (let i = 0; i < metadata.morphCount - 1; i++) {
        pmd.englishMorphNames.push(parseEnglishMorphName());
      }
    };
    function parseEnglishBoneFrameNames() {
      function parseEnglishBoneFrameName() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(50);
        return p;
      };
      let metadata = pmd.metadata;
      if (metadata.englishCompatibility === 0) {
        return;
      }
      pmd.englishBoneFrameNames = [];
      for (let i = 0; i < metadata.boneFrameNameCount; i++) {
        pmd.englishBoneFrameNames.push(parseEnglishBoneFrameName());
      }
    };
    function parseToonTextures() {
      function parseToonTexture() {
        let p: any = {};
        p.fileName = dv.getSjisStringsAsUnicode(100);
        return p;
      };
      pmd.toonTextures = [];
      for (let i = 0; i < 10; i++) {
        pmd.toonTextures.push(parseToonTexture());
      }
    };
    function parseRigidBodies() {
      function parseRigidBody() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(20);
        p.boneIndex = dv.getInt16();
        p.groupIndex = dv.getUint8();
        p.groupTarget = dv.getUint16();
        p.shapeType = dv.getUint8();
        p.width = dv.getFloat32();
        p.height = dv.getFloat32();
        p.depth = dv.getFloat32();
        p.position = dv.getFloat32Array(3);
        p.rotation = dv.getFloat32Array(3);
        p.weight = dv.getFloat32();
        p.positionDamping = dv.getFloat32();
        p.rotationDamping = dv.getFloat32();
        p.restriction = dv.getFloat32();
        p.friction = dv.getFloat32();
        p.type = dv.getUint8();
        return p;
      };
      let metadata = pmd.metadata;
      metadata.rigidBodyCount = dv.getUint32();
      pmd.rigidBodies = [];
      for (let i = 0; i < metadata.rigidBodyCount; i++) {
        pmd.rigidBodies.push(parseRigidBody());
      }
    };
    function parseConstraints() {
      function parseConstraint() {
        let p: any = {};
        p.name = dv.getSjisStringsAsUnicode(20);
        p.rigidBodyIndex1 = dv.getUint32();
        p.rigidBodyIndex2 = dv.getUint32();
        p.position = dv.getFloat32Array(3);
        p.rotation = dv.getFloat32Array(3);
        p.translationLimitation1 = dv.getFloat32Array(3);
        p.translationLimitation2 = dv.getFloat32Array(3);
        p.rotationLimitation1 = dv.getFloat32Array(3);
        p.rotationLimitation2 = dv.getFloat32Array(3);
        p.springPosition = dv.getFloat32Array(3);
        p.springRotation = dv.getFloat32Array(3);
        return p;
      };
      let metadata = pmd.metadata;
      metadata.constraintCount = dv.getUint32();
      pmd.constraints = [];
      for (let i = 0; i < metadata.constraintCount; i++) {
        pmd.constraints.push(parseConstraint());
      }
    };
    parseHeader();
    parseVertices();
    parseFaces();
    parseMaterials();
    parseBones();
    parseIks();
    parseMorphs();
    parseMorphFrames();
    parseBoneFrameNames();
    parseBoneFrames();
    parseEnglishHeader();
    parseEnglishBoneNames();
    parseEnglishMorphNames();
    parseEnglishBoneFrameNames();
    parseToonTextures();
    parseRigidBodies();
    parseConstraints();
    // console.log(pmd); // for console debug
    return pmd;
  };
  parsePmx(buffer) {
    let scope = this;
    let pmx: any = {};
    let dv = new MMDLoader.DataView(buffer);
    let helper = new MMDLoader.DataCreationHelper();
    pmx.metadata = {};
    pmx.metadata.format = 'pmx';
    pmx.metadata.coordinateSystem = 'left';
    function parseHeader() {
      let metadata = pmx.metadata;
      metadata.magic = dv.getChars(4);
      // Note: don't remove the last blank space.
      if (metadata.magic !== 'PMX ') {
        throw 'PMX file magic is not PMX , but ' + metadata.magic;
      }
      metadata.version = dv.getFloat32();
      if (metadata.version !== 2.0 && metadata.version !== 2.1) {
        throw 'PMX version ' + metadata.version + ' is not supported.';
      }
      metadata.headerSize = dv.getUint8();
      metadata.encoding = dv.getUint8();
      metadata.additionalUvNum = dv.getUint8();
      metadata.vertexIndexSize = dv.getUint8();
      metadata.textureIndexSize = dv.getUint8();
      metadata.materialIndexSize = dv.getUint8();
      metadata.boneIndexSize = dv.getUint8();
      metadata.morphIndexSize = dv.getUint8();
      metadata.rigidBodyIndexSize = dv.getUint8();
      metadata.modelName = dv.getTextBuffer();
      metadata.englishModelName = dv.getTextBuffer();
      metadata.comment = dv.getTextBuffer();
      metadata.englishComment = dv.getTextBuffer();
    };
    function parseVertices() {
      function parseVertex() {
        let p: any = {};
        p.position = dv.getFloat32Array(3);
        p.normal = dv.getFloat32Array(3);
        p.uv = dv.getFloat32Array(2);
        p.auvs = [];
        for (let i = 0; i < pmx.metadata.additionalUvNum; i++) {
          p.auvs.push(dv.getFloat32Array(4));
        }
        p.type = dv.getUint8();
        let indexSize = metadata.boneIndexSize;
        if (p.type === 0) {  // BDEF1
          p.skinIndices = dv.getIndexArray(indexSize, 1);
          p.skinWeights = [ 1.0 ];
        } else if (p.type === 1) {  // BDEF2
          p.skinIndices = dv.getIndexArray(indexSize, 2);
          p.skinWeights = dv.getFloat32Array(1);
          p.skinWeights.push(1.0 - p.skinWeights[ 0 ]);
        } else if (p.type === 2) {  // BDEF4
          p.skinIndices = dv.getIndexArray(indexSize, 4);
          p.skinWeights = dv.getFloat32Array(4);
        } else if (p.type === 3) {  // SDEF
          p.skinIndices = dv.getIndexArray(indexSize, 2);
          p.skinWeights = dv.getFloat32Array(1);
          p.skinWeights.push(1.0 - p.skinWeights[ 0 ]);
          p.skinC = dv.getFloat32Array(3);
          p.skinR0 = dv.getFloat32Array(3);
          p.skinR1 = dv.getFloat32Array(3);
          // SDEF is not supported yet and is handled as BDEF2 so far.
          // TODO: SDEF support
          p.type = 1;
        } else {
          throw 'unsupport bone type ' + p.type + ' exception.';
        }
        p.edgeRatio = dv.getFloat32();
        return p;
      };
      let metadata = pmx.metadata;
      metadata.vertexCount = dv.getUint32();
      pmx.vertices = [];
      for (let i = 0; i < metadata.vertexCount; i++) {
        pmx.vertices.push(parseVertex());
      }
    };
    function parseFaces() {
      function parseFace() {
        let p: any = {};
        p.indices = dv.getIndexArray(metadata.vertexIndexSize, 3, true);
        return p;
      };
      let metadata = pmx.metadata;
      metadata.faceCount = dv.getUint32() / 3;
      pmx.faces = [];
      for (let i = 0; i < metadata.faceCount; i++) {
        pmx.faces.push(parseFace());
      }
    };
    function parseTextures() {
      function parseTexture() {
        return dv.getTextBuffer();
      };
      let metadata = pmx.metadata;
      metadata.textureCount = dv.getUint32();
      pmx.textures = [];
      for (let i = 0; i < metadata.textureCount; i++) {
        pmx.textures.push(parseTexture());
      }
    };
    function parseMaterials() {
      function parseMaterial() {
        let p: any = {};
        p.name = dv.getTextBuffer();
        p.englishName = dv.getTextBuffer();
        p.diffuse = dv.getFloat32Array(4);
        p.specular = dv.getFloat32Array(3);
        p.shininess = dv.getFloat32();
        p.emissive = dv.getFloat32Array(3);
        p.flag = dv.getUint8();
        p.edgeColor = dv.getFloat32Array(4);
        p.edgeSize = dv.getFloat32();
        p.textureIndex = dv.getIndex(pmx.metadata.textureIndexSize);
        p.envTextureIndex = dv.getIndex(pmx.metadata.textureIndexSize);
        p.envFlag = dv.getUint8();
        p.toonFlag = dv.getUint8();
        if (p.toonFlag === 0) {
          p.toonIndex = dv.getIndex(pmx.metadata.textureIndexSize);
        } else if (p.toonFlag === 1) {
          p.toonIndex = dv.getInt8();
        } else {
          throw 'unknown toon flag ' + p.toonFlag + ' exception.';
        }
        p.comment = dv.getTextBuffer();
        p.faceCount = dv.getUint32() / 3;
        return p;
      };
      let metadata = pmx.metadata;
      metadata.materialCount = dv.getUint32();
      pmx.materials = [];
      for (let i = 0; i < metadata.materialCount; i++) {
        pmx.materials.push(parseMaterial());
      }
    };
    function parseBones() {
      function parseBone() {
        let p: any = {};
        p.name = dv.getTextBuffer();
        p.englishName = dv.getTextBuffer();
        p.position = dv.getFloat32Array(3);
        p.parentIndex = dv.getIndex(pmx.metadata.boneIndexSize);
        p.transformationClass = dv.getUint32();
        p.flag = dv.getUint16();
        if (p.flag & 0x1) {
          p.connectIndex = dv.getIndex(pmx.metadata.boneIndexSize);
        } else {
          p.offsetPosition = dv.getFloat32Array(3);
        }
        if (p.flag & 0x100 || p.flag & 0x200) {
          // Note: I don't think Grant is an appropriate name
          //       but I found that some English translated MMD tools use this term
          //       so I've named it Grant so far.
          //       I'd rename to more appropriate name from Grant later.
          let grant: any = {};
          grant.isLocal = (p.flag & 0x80) !== 0 ? true : false;
          grant.affectRotation = (p.flag & 0x100) !== 0 ? true : false;
          grant.affectPosition = (p.flag & 0x200) !== 0 ? true : false;
          grant.parentIndex = dv.getIndex(pmx.metadata.boneIndexSize);
          grant.ratio = dv.getFloat32();
          p.grant = grant;
        }
        if (p.flag & 0x400) {
          p.fixAxis = dv.getFloat32Array(3);
        }
        if (p.flag & 0x800) {
          p.localXVector = dv.getFloat32Array(3);
          p.localZVector = dv.getFloat32Array(3);
        }
        if (p.flag & 0x2000) {
          p.key = dv.getUint32();
        }
        if (p.flag & 0x20) {
          let ik: any = {};
          ik.effector = dv.getIndex(pmx.metadata.boneIndexSize);
          ik.target = null;
          ik.iteration = dv.getUint32();
          ik.maxAngle = dv.getFloat32();
          ik.linkCount = dv.getUint32();
          ik.links = [];
          for (let i = 0; i < ik.linkCount; i++) {
            let link: any = {};
            link.index = dv.getIndex(pmx.metadata.boneIndexSize);
            link.angleLimitation = dv.getUint8();
            if (link.angleLimitation === 1) {
              link.lowerLimitationAngle = dv.getFloat32Array(3);
              link.upperLimitationAngle = dv.getFloat32Array(3);
            }
            ik.links.push(link);
          }
          p.ik = ik;
        }
        return p;
      };
      let metadata = pmx.metadata;
      metadata.boneCount = dv.getUint32();
      pmx.bones = [];
      for (let i = 0; i < metadata.boneCount; i++) {
        pmx.bones.push(parseBone());
      }
    };
    function parseMorphs() {
      function parseMorph() {
        let p: any = {};
        p.name = dv.getTextBuffer();
        p.englishName = dv.getTextBuffer();
        p.panel = dv.getUint8();
        p.type = dv.getUint8();
        p.elementCount = dv.getUint32();
        p.elements = [];
        for (let i = 0; i < p.elementCount; i++) {
          if (p.type === 0) {  // group morph
            let m: any = {};
            m.index = dv.getIndex(pmx.metadata.morphIndexSize);
            m.ratio = dv.getFloat32();
            p.elements.push(m);
          } else if (p.type === 1) {  // vertex morph
            let m: any = {};
            m.index = dv.getIndex(pmx.metadata.vertexIndexSize, true);
            m.position = dv.getFloat32Array(3);
            p.elements.push(m);
          } else if (p.type === 2) {  // bone morph
            let m: any = {};
            m.index = dv.getIndex(pmx.metadata.boneIndexSize);
            m.position = dv.getFloat32Array(3);
            m.rotation = dv.getFloat32Array(4);
            p.elements.push(m);
          } else if (p.type === 3) {  // uv morph
            let m: any = {};
            m.index = dv.getIndex(pmx.metadata.vertexIndexSize, true);
            m.uv = dv.getFloat32Array(4);
            p.elements.push(m);
          } else if (p.type === 4) {  // additional uv1
            // TODO: implement
          } else if (p.type === 5) {  // additional uv2
            // TODO: implement
          } else if (p.type === 6) {  // additional uv3
            // TODO: implement
          } else if (p.type === 7) {  // additional uv4
            // TODO: implement
          } else if (p.type === 8) {  // material morph
            let m: any = {};
            m.index = dv.getIndex(pmx.metadata.materialIndexSize);
            m.type = dv.getUint8();
            m.diffuse = dv.getFloat32Array(4);
            m.specular = dv.getFloat32Array(3);
            m.shininess = dv.getFloat32();
            m.emissive = dv.getFloat32Array(3);
            m.edgeColor = dv.getFloat32Array(4);
            m.edgeSize = dv.getFloat32();
            m.textureColor = dv.getFloat32Array(4);
            m.sphereTextureColor = dv.getFloat32Array(4);
            m.toonColor = dv.getFloat32Array(4);
            p.elements.push(m);
          }
        }
        return p;
      };
      let metadata = pmx.metadata;
      metadata.morphCount = dv.getUint32();
      pmx.morphs = [];
      for (let i = 0; i < metadata.morphCount; i++) {
        pmx.morphs.push(parseMorph());
      }
    };
    function parseFrames() {
      function parseFrame() {
        let p: any = {};
        p.name = dv.getTextBuffer();
        p.englishName = dv.getTextBuffer();
        p.type = dv.getUint8();
        p.elementCount = dv.getUint32();
        p.elements = [];
        for (let i = 0; i < p.elementCount; i++) {
          let e: any = {};
          e.target = dv.getUint8();
          e.index = (e.target === 0) ? dv.getIndex(pmx.metadata.boneIndexSize) : dv.getIndex(pmx.metadata.morphIndexSize);
          p.elements.push(e);
        }
        return p;
      };
      let metadata = pmx.metadata;
      metadata.frameCount = dv.getUint32();
      pmx.frames = [];
      for (let i = 0; i < metadata.frameCount; i++) {
        pmx.frames.push(parseFrame());
      }
    };
    function parseRigidBodies() {
      function parseRigidBody() {
        let p: any = {};
        p.name = dv.getTextBuffer();
        p.englishName = dv.getTextBuffer();
        p.boneIndex = dv.getIndex(pmx.metadata.boneIndexSize);
        p.groupIndex = dv.getUint8();
        p.groupTarget = dv.getUint16();
        p.shapeType = dv.getUint8();
        p.width = dv.getFloat32();
        p.height = dv.getFloat32();
        p.depth = dv.getFloat32();
        p.position = dv.getFloat32Array(3);
        p.rotation = dv.getFloat32Array(3);
        p.weight = dv.getFloat32();
        p.positionDamping = dv.getFloat32();
        p.rotationDamping = dv.getFloat32();
        p.restriction = dv.getFloat32();
        p.friction = dv.getFloat32();
        p.type = dv.getUint8();
        return p;
      };
      let metadata = pmx.metadata;
      metadata.rigidBodyCount = dv.getUint32();
      pmx.rigidBodies = [];
      for (let i = 0; i < metadata.rigidBodyCount; i++) {
        pmx.rigidBodies.push(parseRigidBody());
      }
    };
    function parseConstraints() {
      function parseConstraint() {
        let p: any = {};
        p.name = dv.getTextBuffer();
        p.englishName = dv.getTextBuffer();
        p.type = dv.getUint8();
        p.rigidBodyIndex1 = dv.getIndex(pmx.metadata.rigidBodyIndexSize);
        p.rigidBodyIndex2 = dv.getIndex(pmx.metadata.rigidBodyIndexSize);
        p.position = dv.getFloat32Array(3);
        p.rotation = dv.getFloat32Array(3);
        p.translationLimitation1 = dv.getFloat32Array(3);
        p.translationLimitation2 = dv.getFloat32Array(3);
        p.rotationLimitation1 = dv.getFloat32Array(3);
        p.rotationLimitation2 = dv.getFloat32Array(3);
        p.springPosition = dv.getFloat32Array(3);
        p.springRotation = dv.getFloat32Array(3);
        return p;
      };
      let metadata = pmx.metadata;
      metadata.constraintCount = dv.getUint32();
      pmx.constraints = [];
      for (let i = 0; i < metadata.constraintCount; i++) {
        pmx.constraints.push(parseConstraint());
      }
    };
    parseHeader();
    parseVertices();
    parseFaces();
    parseTextures();
    parseMaterials();
    parseBones();
    parseMorphs();
    parseFrames();
    parseRigidBodies();
    parseConstraints();
    // console.log(pmx); // for console debug
    return pmx;
  };
  parseVmd(buffer) {
    let scope = this;
    let vmd: any = {};
    let dv = new MMDLoader.DataView(buffer);
    let helper = new MMDLoader.DataCreationHelper();
    vmd.metadata = {};
    vmd.metadata.coordinateSystem = 'left';
    function parseHeader() {
      let metadata = vmd.metadata;
      metadata.magic = dv.getChars(30);
      if (metadata.magic !== 'Vocaloid Motion Data 0002') {
        throw 'VMD file magic is not Vocaloid Motion Data 0002, but ' + metadata.magic;
      }
      metadata.name = dv.getSjisStringsAsUnicode(20);
    };
    function parseMotions() {
      function parseMotion() {
        let p: any = {};
        p.boneName = dv.getSjisStringsAsUnicode(15);
        p.frameNum = dv.getUint32();
        p.position = dv.getFloat32Array(3);
        p.rotation = dv.getFloat32Array(4);
        p.interpolation = dv.getUint8Array(64);
        return p;
      };
      let metadata = vmd.metadata;
      metadata.motionCount = dv.getUint32();
      vmd.motions = [];
      for (let i = 0; i < metadata.motionCount; i++) {
        vmd.motions.push(parseMotion());
      }
    };
    function parseMorphs() {
      function parseMorph() {
        let p: any = {};
        p.morphName = dv.getSjisStringsAsUnicode(15);
        p.frameNum = dv.getUint32();
        p.weight = dv.getFloat32();
        return p;
      };
      let metadata = vmd.metadata;
      metadata.morphCount = dv.getUint32();
      vmd.morphs = [];
      for (let i = 0; i < metadata.morphCount; i++) {
        vmd.morphs.push(parseMorph());
      }
    };
    function parseCameras() {
      function parseCamera() {
        let p: any = {};
        p.frameNum = dv.getUint32();
        p.distance = dv.getFloat32();
        p.position = dv.getFloat32Array(3);
        p.rotation = dv.getFloat32Array(3);
        p.interpolation = dv.getUint8Array(24);
        p.fov = dv.getUint32();
        p.perspective = dv.getUint8();
        return p;
      };
      let metadata = vmd.metadata;
      metadata.cameraCount = dv.getUint32();
      vmd.cameras = [];
      for (let i = 0; i < metadata.cameraCount; i++) {
        vmd.cameras.push(parseCamera());
      }
    };
    parseHeader();
    parseMotions();
    parseMorphs();
    parseCameras();
    // console.log(vmd); // for console debug
    return vmd;
  }
  parseVpd(text) {
    let helper = new MMDLoader.DataCreationHelper();
    let vpd: any = {};
    vpd.metadata = {};
    vpd.metadata.coordinateSystem = 'left';
    vpd.bones = [];
    let commentPatternG = /\/\/\w*(\r|\n|\r\n)/g;
    let newlinePattern = /\r|\n|\r\n/;
    let lines = text.replace(commentPatternG, '').split(newlinePattern);
    function throwError () {
      throw 'the file seems not vpd file.';
    };
    function checkMagic () {
      if (lines[ 0 ] !== 'Vocaloid Pose Data file') {
        throwError();
      }
    };
    function parseHeader () {
      if (lines.length < 4) {
        throwError();
      }
      vpd.metadata.parentFile = lines[ 2 ];
      vpd.metadata.boneCount = parseInt(lines[ 3 ]);
    };
    function parseBones () {
      let boneHeaderPattern = /^\s*(Bone[0-9]+)\s*\{\s*(.*)$/;
      let boneVectorPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
      let boneQuaternionPattern = /^\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*,\s*(-?[0-9]+\.[0-9]+)\s*;/;
      let boneFooterPattern = /^\s*}/;
      let bones = vpd.bones;
      let n = null;
      let v = null;
      let q = null;
      let encoder = new CharsetEncoder();
      for (let i = 4; i < lines.length; i++) {
        let line = lines[ i ];
        let result;
        result = line.match(boneHeaderPattern);
        if (result !== null) {
          if (n !== null) {
            throwError();
          }
          n = result[ 2 ];
        }
        result = line.match(boneVectorPattern);
        if (result !== null) {
          if (v !== null) {
            throwError();
          }
          v = [
            parseFloat(result[ 1 ]),
            parseFloat(result[ 2 ]),
            parseFloat(result[ 3 ])
          ];
        }
        result = line.match(boneQuaternionPattern);
        if (result !== null) {
          if (q !== null) {
            throwError();
          }
          q = [
            parseFloat(result[ 1 ]),
            parseFloat(result[ 2 ]),
            parseFloat(result[ 3 ]),
            parseFloat(result[ 4 ])
          ];
        }
        result = line.match(boneFooterPattern);
        if (result !== null) {
          if (n === null || v === null || q === null) {
            throwError();
          }
          bones.push({
            name: n,
            translation: v,
            quaternion: q
          });
          n = null;
          v = null;
          q = null;
        }
      }
      if (n !== null || v !== null || q !== null) {
        throwError();
      }
    };
    checkMagic();
    parseHeader();
    parseBones();
    this.leftToRightVpd(vpd);
    // console.log(vpd);  // for console debug
    return vpd;
  }
  createMesh(model, texturePath, onProgress?, onError?) {
    let scope = this;
    let geometry = new THREE.BufferGeometry();
    let material = new THREE.MultiMaterial();
    let helper = new MMDLoader.DataCreationHelper();
    let buffer: any = {};
    buffer.vertices = [];
    buffer.uvs = [];
    buffer.normals = [];
    buffer.skinIndices = [];
    buffer.skinWeights = [];
    buffer.indices = [];
    function initVartices() {
      for (let i = 0; i < model.metadata.vertexCount; i++) {
        let v = model.vertices[ i ];
        for (let j = 0, jl = v.position.length; j < jl; j ++) {
          buffer.vertices.push(v.position[ j ]);
        }
        for (let j = 0, jl = v.normal.length; j < jl; j ++) {
          buffer.normals.push(v.normal[ j ]);
        }
        for (let j = 0, jl = v.uv.length; j < jl; j ++) {
          buffer.uvs.push(v.uv[ j ]);
        }
        for (let j = 0; j < 4; j ++) {
          buffer.skinIndices.push(v.skinIndices.length - 1 >= j ? v.skinIndices[ j ] : 0.0);
        }
        for (let j = 0; j < 4; j ++) {
          buffer.skinWeights.push(v.skinWeights.length - 1 >= j ? v.skinWeights[ j ] : 0.0);
        }
      }
    };
    function initFaces() {
      for (let i = 0; i < model.metadata.faceCount; i++) {
        let f = model.faces[ i ];
        for (let j = 0, jl = f.indices.length; j < jl; j ++) {
          buffer.indices.push(f.indices[ j ]);
        }
      }
    };
    function initBones() {
      let bones = [];
      for (let i = 0; i < model.metadata.boneCount; i++) {
        let bone: any = {};
        let b = model.bones[ i ];
        bone.parent = b.parentIndex;
        bone.name = b.name;
        bone.pos = [ b.position[ 0 ], b.position[ 1 ], b.position[ 2 ] ];
        bone.rotq = [ 0, 0, 0, 1 ];
        bone.scl = [ 1, 1, 1 ];
        if (bone.parent !== -1) {
          bone.pos[ 0 ] -= model.bones[ bone.parent ].position[ 0 ];
          bone.pos[ 1 ] -= model.bones[ bone.parent ].position[ 1 ];
          bone.pos[ 2 ] -= model.bones[ bone.parent ].position[ 2 ];
        }
        bones.push(bone);
      }
      geometry.bones = bones;
    };
    function initIKs() {
      let iks = [];
      // TODO: remove duplicated codes between PMD and PMX
      if (model.metadata.format === 'pmd') {
        for (let i = 0; i < model.metadata.ikCount; i++) {
          let ik = model.iks[i];
          let param: any = {};
          param.target = ik.target;
          param.effector = ik.effector;
          param.iteration = ik.iteration;
          param.maxAngle = ik.maxAngle * 4;
          param.links = [];
          for (let j = 0; j < ik.links.length; j++) {
            let link: any = {};
            link.index = ik.links[ j ].index;
            if (model.bones[ link.index ].name.indexOf('ひざ') >= 0) {
              link.limitation = new THREE.Vector3(1.0, 0.0, 0.0);
            }
            param.links.push(link);
          }
          iks.push(param);
        }
      } else {
        for (let i = 0; i < model.metadata.boneCount; i++) {
          let b = model.bones[ i ];
          let ik = b.ik;
          if (ik === undefined) {
            continue;
          }
          let param: any = {};
          param.target = i;
          param.effector = ik.effector;
          param.iteration = ik.iteration;
          param.maxAngle = ik.maxAngle;
          param.links = [];
          for (let j = 0; j < ik.links.length; j++) {
            let link: any = {};
            link.index = ik.links[ j ].index;
            if (ik.links[ j ].angleLimitation === 1) {
              link.limitation = new THREE.Vector3(1.0, 0.0, 0.0);
              // TODO: use limitation angles
              // link.lowerLimitationAngle;
              // link.upperLimitationAngle;
            }
            param.links.push(link);
          }
          iks.push(param);
        }
      }
      geometry.iks = iks;
    }
    function initGrants() {
      if (model.metadata.format === 'pmd') {
        return;
      }
      let grants = [];
      for (let i = 0; i < model.metadata.boneCount; i++) {
        let b = model.bones[ i ];
        let grant = b.grant;
        if (grant === undefined) {
          continue;
        }
        let param: any = {};
        param.index = i;
        param.parentIndex = grant.parentIndex;
        param.ratio = grant.ratio;
        param.isLocal = grant.isLocal;
        param.affectRotation = grant.affectRotation;
        param.affectPosition = grant.affectPosition;
        grants.push(param);
      }
      geometry.grants = grants;
    };
    function initMorphs() {
      function updateVertex(attribute, index, v, ratio) {
        attribute.array[ index * 3 + 0 ] += v.position[ 0 ] * ratio;
        attribute.array[ index * 3 + 1 ] += v.position[ 1 ] * ratio;
        attribute.array[ index * 3 + 2 ] += v.position[ 2 ] * ratio;
      };
      function updateVertices (attribute, m, ratio) {
        for (let i = 0; i < m.elementCount; i++) {
          let v = m.elements[ i ];
          let index;
          if (model.metadata.format === 'pmd') {
            index = model.morphs[ 0 ].elements[ v.index ].index;
          } else {
            index = v.index;
          }
          updateVertex(attribute, index, v, ratio);
        }
      };
      let morphTargets = [];
      let attributes = [];
      for (let i = 0; i < model.metadata.morphCount; i++) {
        let m = model.morphs[ i ];
        let params = { name: m.name };
        let attribute = THREE.Float32Attribute(model.metadata.vertexCount * 3, 3);
        for (let j = 0; j < model.metadata.vertexCount * 3; j++) {
          attribute.array[ j ] = buffer.vertices[ j ];
        }
        if (model.metadata.format === 'pmd') {
          if (i !== 0) {
            updateVertices(attribute, m, 1.0);
          }
        } else {
          if (m.type === 0) { // group
            for (let j = 0; j < m.elementCount; j++) {
              let m2 = model.morphs[ m.elements[ j ].index ];
              let ratio = m.elements[ j ].ratio;
              if (m2.type === 1) {
                updateVertices(attribute, m2, ratio);
              } else {
                // TODO: implement
              }
            }
          } else if (m.type === 1) {      // vertex
            updateVertices(attribute, m, 1.0);
          } else if (m.type === 2) {    // bone
            // TODO: implement
          } else if (m.type === 3) {    // uv
            // TODO: implement
          } else if (m.type === 4) {    // additional uv1
            // TODO: implement
          } else if (m.type === 5) {    // additional uv2
            // TODO: implement
          } else if (m.type === 6) {    // additional uv3
            // TODO: implement
          } else if (m.type === 7) {    // additional uv4
            // TODO: implement
          } else if (m.type === 8) {    // material
            // TODO: implement
          }
        }
        morphTargets.push(params);
        attributes.push(attribute);
      }
      geometry.morphTargets = morphTargets;
      geometry.morphAttributes.position = attributes;
    };
    function initMaterials() {
      let textures = [];
      let textureLoader = new THREE.TextureLoader(scope.manager);
      let tgaLoader = new THREE_TGALoader(scope.manager);
      let color = new THREE.Color();
      let offset = 0;
      let materialParams = [];
      function loadTexture (filePath, params?) {
        if (params === undefined) {
          params = {};
        }
        let directoryPath = (params.defaultTexturePath === true) ? scope.defaultTexturePath : texturePath;
        let fullPath = directoryPath + filePath;
        let loader = THREE.Loader.Handlers.get(fullPath);
        if (loader === null) {
          loader = (filePath.indexOf('.tga') >= 0) ? tgaLoader : textureLoader;
        }
        let texture = loader.load(fullPath, function(t) {
          t.flipY = false;
          t.wrapS = THREE.RepeatWrapping;
          t.wrapT = THREE.RepeatWrapping;
          if (params.sphericalReflectionMapping === true) {
            t.mapping = THREE.SphericalReflectionMapping;
          }
          for (let i = 0; i < texture.readyCallbacks.length; i++) {
            texture.readyCallbacks[ i ](texture);
          }
          delete texture.readyCallbacks;
        });
        texture.readyCallbacks = [];
        let uuid = THREE.Math.generateUUID();
        textures[ uuid ] = texture;
        return uuid;
      };
      function getTexture(name, textures) {
        if (textures[ name ] === undefined) {
          console.warn('MMDLoader: Undefined texture', name);
        }
        return textures[ name ];
      };
      for (let i = 0; i < model.metadata.materialCount; i++) {
        let m = model.materials[ i ];
        let params: any = {};
        params.faceOffset = offset;
        params.faceNum = m.faceCount;
        offset += m.faceCount;
        params.name = m.name;
        params.color = color.fromArray([ m.diffuse[ 0 ], m.diffuse[ 1 ], m.diffuse[ 2 ] ]).clone();
        params.opacity = m.diffuse[ 3 ];
        params.specular = color.fromArray([ m.specular[ 0 ], m.specular[ 1 ], m.specular[ 2 ] ]).clone();
        params.shininess = m.shininess;
        if (params.opacity === 1.0) {
          params.side = THREE.FrontSide;
          params.transparent = false;
        } else {
          params.side = THREE.DoubleSide;
          params.transparent = true;
        }
        if (model.metadata.format === 'pmd') {
          if (m.fileName) {
            let fileName = m.fileName;
            let fileNames = [];
            let index = fileName.lastIndexOf('*');
            if (index >= 0) {
              fileNames.push(fileName.slice(0, index));
              fileNames.push(fileName.slice(index + 1));
            } else {
              fileNames.push(fileName);
            }
            for (let j = 0; j < fileNames.length; j++) {
              let n = fileNames[ j ];
              if (n.indexOf('.sph') >= 0 || n.indexOf('.spa') >= 0) {
                params.envMap = loadTexture(n, { sphericalReflectionMapping: true });
                if (n.indexOf('.sph') >= 0) {
                  params.envMapType = THREE.MultiplyOperation;
                } else {
                  params.envMapType = THREE.AddOperation;
                }
              } else {
                params.map = loadTexture(n);
              }
            }
          }
        } else {
          if (m.textureIndex !== -1) {
            let n = model.textures[ m.textureIndex ];
            params.map = loadTexture(n);
          }
          // TODO: support m.envFlag === 3
          if (m.envTextureIndex !== -1 && (m.envFlag === 1 || m.envFlag === 2)) {
            let n = model.textures[ m.envTextureIndex ];
            params.envMap = loadTexture(n, { sphericalReflectionMapping: true });
            if (m.envFlag === 1) {
              params.envMapType = THREE.MultiplyOperation;
            } else {
              params.envMapType = THREE.AddOperation;
            }
          }
        }
        // TODO: check if this logic is right
        if (params.map === undefined /* && params.envMap === undefined */) {
          params.emissive = color.fromArray([ m.emissive[ 0 ], m.emissive[ 1 ], m.emissive[ 2 ] ]).clone();
        }
        materialParams.push(params);
      }
      let shader = MMDLoader.SHADER; /*THREE.ShaderLib[ 'mmd' ];*/
      for (let i = 0; i < materialParams.length; i++) {
        let p = materialParams[ i ];
        let p2 = model.materials[ i ];
        let m = new THREE.ShaderMaterial({
          uniforms: THREE.UniformsUtils.clone(shader.uniforms),
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader
        });
        geometry.addGroup(p.faceOffset * 3, p.faceNum * 3, i);
        if (p.name !== undefined) m.name = p.name;
        m.skinning = geometry.bones.length > 0 ? true : false;
        m.morphTargets = geometry.morphTargets.length > 0 ? true : false;
        m.lights = true;
        m.side = (model.metadata.format === 'pmx' && (p2.flag & 0x1) === 1) ? THREE.DoubleSide : p.side;
        m.transparent = p.transparent;
        m.fog = true;
        m.blending = THREE.BlendingMode.CustomBlending;
        m.blendSrc = THREE.SrcAlphaFactor;
        m.blendDst = THREE.OneMinusSrcAlphaFactor;
        m.blendSrcAlpha = THREE.SrcAlphaFactor;
        m.blendDstAlpha = THREE.DstAlphaFactor;
        if (p.map !== undefined) {
          m.faceOffset = p.faceOffset;
          m.faceNum = p.faceNum;
          // Check if this part of the texture image the material uses requires transparency
          function checkTextureTransparency (m) {
            m.map.readyCallbacks.push(function(t) {
              // Is there any efficient ways?
              function createImageData (image) {
                let c = document.createElement('canvas');
                c.width = image.width;
                c.height = image.height;
                let ctx = c.getContext('2d');
                ctx.drawImage(image, 0, 0);
                return ctx.getImageData(0, 0, c.width, c.height);
              };
              function detectTextureTransparency (image, uvs, indices) {
                let width = image.width;
                let height = image.height;
                let data = image.data;
                let threshold = 253;
                if (data.length / (width * height) !== 4) {
                  return false;
                }
                for (let i = 0; i < indices.length; i++) {
                  let centerUV = { x: 0.0, y: 0.0 };
                  for (let j = 0; j < 3; j++) {
                    let index = indices[ i * 3 + j ];
                    let uv = { x: uvs[ index * 2 + 0 ], y: uvs[ index * 2 + 1 ] };
                    if (getAlphaByUv(image, uv) < threshold) {
                      return true;
                    }
                    centerUV.x += uv.x;
                    centerUV.y += uv.y;
                  }
                  centerUV.x /= 3;
                  centerUV.y /= 3;
                  if (getAlphaByUv(image, centerUV) < threshold) {
                    return true;
                  }
                }
                return false;
              };
              /*
               * This method expects
               *   t.flipY = false
               *   t.wrapS = THREE.RepeatWrapping
               *   t.wrapT = THREE.RepeatWrapping
               * TODO: more precise
               */
              function getAlphaByUv (image, uv) {
                let width = image.width;
                let height = image.height;
                let x = Math.round(uv.x * width) % width;
                let y = Math.round(uv.y * height) % height;
                if (x < 0) {
                  x += width;
                }
                if (y < 0) {
                  y += height;
                }
                let index = y * width + x;
                return image.data[ index * 4 + 3 ];
              };
              let imageData = t.image.data !== undefined ? t.image : createImageData(t.image);
              let indices = geometry.index.array.slice(m.faceOffset * 3, m.faceOffset * 3 + m.faceNum * 3);
              if (detectTextureTransparency(imageData, geometry.attributes.uv.array, indices)) m.transparent = true;
              delete m.faceOffset;
              delete m.faceNum;
            });
          }
          m.map = getTexture(p.map, textures);
          m.uniforms.map.value = m.map;
          checkTextureTransparency(m);
        }
        if (p.envMap !== undefined) {
          m.envMap = getTexture(p.envMap, textures);
          m.uniforms.envMap.value = m.envMap;
          m.combine = p.envMapType;
          // TODO: WebGLRenderer should automatically update?
          m.envMap.readyCallbacks.push(function(t) {
            m.needsUpdate = true;
          });
        }
        m.uniforms.opacity.value = p.opacity;
        m.uniforms.diffuse.value.copy(p.color);
        if (p.emissive !== undefined) {
          m.uniforms.emissive.value.copy(p.emissive);
        }
        m.uniforms.specular.value.copy(p.specular);
        m.uniforms.shininess.value = Math.max(p.shininess, 1e-4); // to prevent pow(0.0, 0.0)
        if (model.metadata.format === 'pmd') {
          function isDefaultToonTexture (n) {
            if (n.length !== 10) {
              return false;
            }
            return n.match(/toon(10|0[0-9]).bmp/) === null ? false : true;
          };
          m.outlineParameters = {
            thickness: p2.edgeFlag === 1 ? 0.003 : 0.0,
            color: new THREE.Color(0.0, 0.0, 0.0),
            alpha: 1.0
          };
          if (m.outlineParameters.thickness === 0.0) m.outlineParameters.visible = false;
          m.uniforms.toonMap.value = textures[ p2.toonIndex ];
          m.uniforms.celShading.value = 1;
          if (p2.toonIndex === -1) {
            m.uniforms.hasToonTexture.value = 0;
          } else {
            let n = model.toonTextures[ p2.toonIndex ].fileName;
            let uuid = loadTexture(n, { defaultTexturePath: isDefaultToonTexture(n) });
            m.uniforms.toonMap.value = textures[ uuid ];
            m.uniforms.hasToonTexture.value = 1;
          }
        } else {
          m.outlineParameters = {
            thickness: p2.edgeSize / 300,
            color: new THREE.Color(p2.edgeColor[ 0 ], p2.edgeColor[ 1 ], p2.edgeColor[ 2 ]),
            alpha: p2.edgeColor[ 3 ]
          };
          if ((p2.flag & 0x10) === 0 || m.outlineParameters.thickness === 0.0) m.outlineParameters.visible = false;
          m.uniforms.celShading.value = 1;
          if (p2.toonIndex === -1) {
            m.uniforms.hasToonTexture.value = 0;
          } else {
            if (p2.toonFlag === 0) {
              let n = model.textures[ p2.toonIndex ];
              let uuid = loadTexture(n);
              m.uniforms.toonMap.value = textures[ uuid ];
            } else {
              let num = p2.toonIndex + 1;
              let fileName = 'toon' + (num < 10 ? '0' + num : num) + '.bmp';
              let uuid = loadTexture(fileName, { defaultTexturePath: true });
              m.uniforms.toonMap.value = textures[ uuid ];
            }
            m.uniforms.hasToonTexture.value = 1;
          }
        }
        material.materials.push(m);
      }
      if (model.metadata.format === 'pmx') {
        function checkAlphaMorph (morph, elements) {
          if (morph.type !== 8) {
            return;
          }
          for (let i = 0; i < elements.length; i++) {
            let e = elements[ i ];
            if (e.index === -1) {
              continue;
            }
            let m = material.materials[ e.index ];
            if (m.uniforms.opacity.value !== e.diffuse[ 3 ]) {
              m.transparent = true;
            }
          }
        }
        for (let i = 0; i < model.morphs.length; i++) {
          let morph = model.morphs[ i ];
          let elements = morph.elements;
          if (morph.type === 0) {
            for (let j = 0; j < elements.length; j++) {
              let morph2 = model.morphs[ elements[ j ].index ];
              let elements2 = morph2.elements;
              checkAlphaMorph(morph2, elements2);
            }
          } else {
            checkAlphaMorph(morph, elements);
          }
        }
      }
    };
    function initPhysics() {
      let rigidBodies = [];
      let constraints = [];
      for (let i = 0; i < model.metadata.rigidBodyCount; i++) {
        let b = model.rigidBodies[ i ];
        let keys = Object.keys(b);
        let p: any = {};
        for (let j = 0; j < keys.length; j++) {
          let key = keys[ j ];
          p[ key ] = b[ key ];
        }
        /*
         * RigidBody position parameter in PMX seems global position
         * while the one in PMD seems offset from corresponding bone.
         * So unify being offset.
         */
        if (model.metadata.format === 'pmx') {
          if (p.boneIndex !== -1) {
            let bone = model.bones[ p.boneIndex ];
            p.position[ 0 ] -= bone.position[ 0 ];
            p.position[ 1 ] -= bone.position[ 1 ];
            p.position[ 2 ] -= bone.position[ 2 ];
          }
        }
        rigidBodies.push(p);
      }
      for (let i = 0; i < model.metadata.constraintCount; i++) {
        let c = model.constraints[ i ];
        let keys = Object.keys(c);
        let p: any = {};
        for (let j = 0; j < keys.length; j++) {
          let key = keys[ j ];
          p[ key ] = c[ key ];
        }
        let bodyA = rigidBodies[ p.rigidBodyIndex1 ];
        let bodyB = rigidBodies[ p.rigidBodyIndex2 ];
        /*
        * Refer to http://www20.atpages.jp/katwat/wp/?p=4135
         */
        if (bodyA.type !== 0 && bodyB.type === 2) {
          if (bodyA.boneIndex !== -1 && bodyB.boneIndex !== -1 &&
               model.bones[ bodyB.boneIndex ].parentIndex === bodyA.boneIndex) {
            bodyB.type = 1;
          }
        }
        constraints.push(p);
      }
      geometry.rigidBodies = rigidBodies;
      geometry.constraints = constraints;
    };
    function initGeometry() {
      geometry.setIndex((buffer.indices.length > 65535 ? THREE.Uint32Attribute : THREE.Uint16Attribute)(buffer.indices, 1));
      geometry.addAttribute('position', THREE.Float32Attribute(buffer.vertices, 3));
      geometry.addAttribute('normal', THREE.Float32Attribute(buffer.normals, 3));
      geometry.addAttribute('uv', THREE.Float32Attribute(buffer.uvs, 2));
      geometry.addAttribute('skinIndex', THREE.Float32Attribute(buffer.skinIndices, 4));
      geometry.addAttribute('skinWeight', THREE.Float32Attribute(buffer.skinWeights, 4));
      geometry.computeBoundingSphere();
      geometry.mmdFormat = model.metadata.format;
    };
    this.leftToRightModel(model);
    initVartices();
    initFaces();
    initBones();
    initIKs();
    initGrants();
    initMorphs();
    initMaterials();
    initPhysics();
    initGeometry();
    let mesh = new THREE.SkinnedMesh(geometry, material);
    // console.log(mesh); // for console debug
    return mesh;
  }
  createAnimation(mesh, vmd, name?) {
    let scope = this;
    let helper = new MMDLoader.DataCreationHelper();
    function initMotionAnimations() {
      if (vmd.metadata.motionCount === 0) {
        return;
      }
      let bones = mesh.geometry.bones;
      let orderedMotions = helper.createOrderedMotionArrays(bones, vmd.motions, 'boneName');
      let animation = {
        name: name === undefined ? THREE.Math.generateUUID() : name,
        fps: 30,
        hierarchy: []
      };
      for (let i = 0; i < orderedMotions.length; i++) {
        animation.hierarchy.push(
          {
            parent: bones[ i ].parent,
            keys: []
          }
        );
        let array = orderedMotions[ i ];
        let keys = animation.hierarchy[ i ].keys;
        let bone = bones[ i ];
        for (let j = 0; j < array.length; j++) {
          let t = array[ j ].frameNum / 30;
          let p = array[ j ].position;
          let r = array[ j ].rotation;
          helper.pushBoneAnimationKey(keys, t, bone, p, r);
        }
        helper.insertBoneAnimationKeyAtTimeZero(keys, bone);
        helper.insertStartBoneAnimationKey(keys);
      }
      let clip = THREE.AnimationClip.parseAnimation(animation, mesh.geometry.bones);
      if (clip !== null) {
        if (mesh.geometry.animations === undefined) {
          mesh.geometry.animations = [];
        }
        mesh.geometry.animations.push(clip);
      }
    }
    function initMorphAnimations() {
      if (vmd.metadata.morphCount === 0) {
        return;
      }
      let orderedMorphs = helper.createOrderedMotionArrays(mesh.geometry.morphTargets, vmd.morphs, 'morphName');
      let morphAnimation = {
        fps: 30,
        hierarchy: []
      };
      for (let i = 0; i < orderedMorphs.length; i++) {
        morphAnimation.hierarchy.push({ keys: [] });
        let array = orderedMorphs[ i ];
        let keys = morphAnimation.hierarchy[ i ].keys;
        for (let j = 0; j < array.length; j++) {
          let t = array[ j ].frameNum / 30;
          let w = array[ j ].weight;
          helper.pushAnimationKey(keys, t, w);
        }
      }
      // TODO: should we use THREE.AnimationClip.CreateFromMorphTargetSequence() instead?
      let tracks = [];
      for (let i = 0; i < orderedMorphs.length; i++) {
        let keys = morphAnimation.hierarchy[ i ].keys;
        if (keys.length === 0) {
          continue;
        }
        tracks.push(helper.generateTrackFromAnimationKeys(keys, 'NumberKeyframeTrackEx', '.morphTargetInfluences[' + i + ']'));
      }
      let clip = new THREE.AnimationClip(name === undefined ? THREE.Math.generateUUID() : name + 'Morph', -1, tracks);
      if (clip !== null) {
        if (mesh.geometry.animations === undefined) {
          mesh.geometry.animations = [];
        }
        mesh.geometry.animations.push(clip);
      }
    };
    this.leftToRightVmd(vmd);
    initMotionAnimations();
    initMorphAnimations();
  }
  leftToRightModel(model) {
    if (model.metadata.coordinateSystem === 'right') {
      return;
    }
    model.metadata.coordinateSystem = 'right';
    let helper = new MMDLoader.DataCreationHelper();
    for (let i = 0; i < model.metadata.vertexCount; i++) {
      helper.leftToRightVector3(model.vertices[ i ].position);
      helper.leftToRightVector3(model.vertices[ i ].normal);
    }
    for (let i = 0; i < model.metadata.faceCount; i++) {
      helper.leftToRightIndexOrder(model.faces[ i ].indices);
    }
    for (let i = 0; i < model.metadata.boneCount; i++) {
      helper.leftToRightVector3(model.bones[ i ].position);
    }
    // TODO: support other morph for PMX
    for (let i = 0; i < model.metadata.morphCount; i++) {
      let m = model.morphs[ i ];
      if (model.metadata.format === 'pmx' && m.type !== 1) {
        // TODO: implement
        continue;
      }
      for (let j = 0; j < m.elements.length; j++) {
        helper.leftToRightVector3(m.elements[ j ].position);
      }
    }
    for (let i = 0; i < model.metadata.rigidBodyCount; i++) {
      helper.leftToRightVector3(model.rigidBodies[ i ].position);
      helper.leftToRightEuler(model.rigidBodies[ i ].rotation);
    }
    for (let i = 0; i < model.metadata.constraintCount; i++) {
      helper.leftToRightVector3(model.constraints[ i ].position);
      helper.leftToRightEuler(model.constraints[ i ].rotation);
      helper.leftToRightVector3Range(model.constraints[ i ].translationLimitation1, model.constraints[ i ].translationLimitation2);
      helper.leftToRightEulerRange(model.constraints[ i ].rotationLimitation1, model.constraints[ i ].rotationLimitation2);
    }
  }
  leftToRightVmd(vmd) {
    if (vmd.metadata.coordinateSystem === 'right') {
      return;
    }
    vmd.metadata.coordinateSystem = 'right';
    let helper = new MMDLoader.DataCreationHelper();
    for (let i = 0; i < vmd.metadata.motionCount; i++) {
      helper.leftToRightVector3(vmd.motions[ i ].position);
      helper.leftToRightQuaternion(vmd.motions[ i ].rotation);
    }
    for (let i = 0; i < vmd.metadata.cameraCount; i++) {
      helper.leftToRightEuler(vmd.cameras[ i ].rotation);
    }
  }
  leftToRightVpd(vpd) {
    if (vpd.metadata.coordinateSystem === 'right') {
      return;
    }
    vpd.metadata.coordinateSystem = 'right';
    let helper = new MMDLoader.DataCreationHelper();
    for (let i = 0; i < vpd.bones.length; i++) {
      helper.leftToRightVector3(vpd.bones[ i ].translation);
      helper.leftToRightQuaternion(vpd.bones[ i ].quaternion);
    }
  }
  static DataCreationHelper = class {
    leftToRightVector3(v) {
      v[ 2 ] = -v[ 2 ];
    }
    leftToRightQuaternion(q) {
      q[ 0 ] = -q[ 0 ];
      q[ 1 ] = -q[ 1 ];
    }
    leftToRightEuler(r) {
      r[ 0 ] = -r[ 0 ];
      r[ 1 ] = -r[ 1 ];
    }
    leftToRightIndexOrder(p) {
      let tmp = p[ 2 ];
      p[ 2 ] = p[ 0 ];
      p[ 0 ] = tmp;
    }
    leftToRightVector3Range(v1, v2) {
      let tmp = -v2[ 2 ];
      v2[ 2 ] = -v1[ 2 ];
      v1[ 2 ] = tmp;
    }
    leftToRightEulerRange(r1, r2) {
      let tmp1 = -r2[ 0 ];
      let tmp2 = -r2[ 1 ];
      r2[ 0 ] = -r1[ 0 ];
      r2[ 1 ] = -r1[ 1 ];
      r1[ 0 ] = tmp1;
      r1[ 1 ] = tmp2;
    }
    /*
           * Note: Sometimes to use Japanese Unicode characters runs into problems in Three.js.
     *       In such a case, use this method to convert it to Unicode hex charcode strings,
           *       like 'あいう' -> '0x30420x30440x3046'
           */
    toCharcodeStrings(s) {
      let str = '';
      for (let i = 0; i < s.length; i++) {
        str += '0x' + ('0000' + s[ i ].charCodeAt().toString(16)).substr(-4);
      }
      return str;
    }
    createDictionary(array) {
      let dict = {};
      for (let i = 0; i < array.length; i++) {
        dict[ array[ i ].name ] = i;
      }
      return dict;
    }
    initializeMotionArrays(array) {
      let result = [];
      for (let i = 0; i < array.length; i++) {
        result[ i ] = [];
      }
      return result;
    }
    sortMotionArray(array) {
      array.sort(function(a, b) {
        return a.frameNum - b.frameNum;
      }) ;
    }
    sortMotionArrays(arrays) {
      for (let i = 0; i < arrays.length; i++) {
        this.sortMotionArray(arrays[ i ]);
      }
    }
    createMotionArray(array) {
      let result = [];
      for (let i = 0; i < array.length; i++) {
        result.push(array[ i ]);
      }
      return result;
    }
    createMotionArrays(array, result, dict, key) {
      for (let i = 0; i < array.length; i++) {
        let a = array[ i ];
        let num = dict[ a[ key ] ];
        if (num === undefined) {
          continue;
        }
        result[ num ].push(a);
      }
    }
    createOrderedMotionArray(array) {
      let result = this.createMotionArray(array);
      this.sortMotionArray(result);
      return result;
    }
    createOrderedMotionArrays(targetArray, motionArray, key) {
      let dict = this.createDictionary(targetArray);
      let result = this.initializeMotionArrays(targetArray);
      this.createMotionArrays(motionArray, result, dict, key);
      this.sortMotionArrays(result);
      return result;
    }
    pushAnimationKey(keys, time, value, preventInterpolation?) {
      /*
       * Note: This is a workaround not to make Animation system calculate lerp
       *       if the diff from the last frame is 1 frame (in 30fps).
       */
      if (keys.length > 0 && preventInterpolation === true) {
        let k = keys[ keys.length - 1 ];
        if (time < k.time + (1 / 30) * 1.5) {
          keys.push(
            {
              time: time - 1e-13,
              value: k.value.clone === undefined ? k.value : k.value.clone()
            }
          );
        }
      }
      keys.push(
        {
          time: time,
          value: value
        }
      );
    }
    insertAnimationKeyAtTimeZero(keys, value) {
      if (keys.length === 0) {
        keys.push(
          {
            time: 0.0,
            value: value
          }
        );
      }
    }
    insertStartAnimationKey(keys) {
      let k = keys[ 0 ];
      if (k.time !== 0.0) {
        keys.unshift(
          {
            time: 0.0,
            value: k.value.clone === undefined ? k.value : k.value.clone()
          }
        );
      }
    }
    pushBoneAnimationKey(keys, time, bone, pos, rot) {
      keys.push(
        {
          time: time,
           pos: [ bone.pos[ 0 ] + pos[ 0 ],
                  bone.pos[ 1 ] + pos[ 1 ],
                  bone.pos[ 2 ] + pos[ 2 ] ],
           rot: [ rot[ 0 ], rot[ 1 ], rot[ 2 ], rot[ 3 ] ],
           scl: [ 1, 1, 1 ]
        }
      );
    }
    insertBoneAnimationKeyAtTimeZero(keys, bone) {
      if (keys.length === 0) {
        keys.push(
          {
            time: 0.0,
             pos: [ bone.pos[ 0 ], bone.pos[ 1 ], bone.pos[ 2 ] ],
             rot: [ 0, 0, 0, 1 ],
             scl: [ 1, 1, 1 ]
          }
        );
      }
    }
    insertStartBoneAnimationKey(keys) {
      let k = keys[ 0 ];
      if (k.time !== 0.0) {
        keys.unshift(
          {
            time: 0.0,
            pos: [ k.pos[ 0 ], k.pos[ 1 ], k.pos[ 2 ] ],
            rot: [ k.rot[ 0 ], k.rot[ 1 ], k.rot[ 2 ], k.rot[ 3 ] ],
            scl: [ k.scl[ 0 ], k.scl[ 1 ], k.scl[ 2 ] ]
          }
        );
      }
    }
    /*
     * This method wraps r74 Animation key frame track API for r73 Animation.
     */
    generateTrackFromAnimationKeys(keys, trackKey, name) {
      let times = [];
      let values = [];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[ i ];
        times.push(key.time);
        if (trackKey === 'VectorKeyframeTrackEx') {
          values.push(key.value.x);
          values.push(key.value.y);
          values.push(key.value.z);
        } else {
          values.push(key.value);
        }
      }
      return new MMDLoader[ trackKey ](name, times, values);
    }
  };
  /*
   * These two classes are for high precision of times and values.
   * TODO: Let Three.KeyframeTrack support type select on instance creation.
   */
  static VectorKeyframeTrackEx = class extends THREE.VectorKeyframeTrack {
    constructor(name, times, values, interpolation) {
      super(name, times, values, interpolation);
    }
    TimeBufferType = Float64Array;
  };
  static NumberKeyframeTrackEx = class extends THREE.NumberKeyframeTrack {
    constructor(name, times, values, interpolation) {
      super(name, times, values, interpolation);
    }
    TimeBufferType = Float64Array;
  };
  static DataView = class {
    dv;
    offset;
    littleEndian;
    encoder;
    constructor(buffer, littleEndian?) {
      this.dv = new DataView(buffer);
      this.offset = 0;
      this.littleEndian = (littleEndian !== undefined) ? littleEndian : true;
      this.encoder = new CharsetEncoder();
    }
    getInt8() {
      let value = this.dv.getInt8(this.offset);
      this.offset += 1;
      return value;
    }
    getInt8Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getInt8());
      }
      return a;
    }
    getUint8() {
      let value = this.dv.getUint8(this.offset);
      this.offset += 1;
      return value;
    }
    getUint8Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getUint8());
      }
      return a;
    }
    getInt16() {
      let value = this.dv.getInt16(this.offset, this.littleEndian);
      this.offset += 2;
      return value;
    }
    getInt16Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getInt16());
      }
      return a;
    }
    getUint16() {
      let value = this.dv.getUint16(this.offset, this.littleEndian);
      this.offset += 2;
      return value;
    }
    getUint16Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getUint16());
      }
      return a;
    }
    getInt32() {
      let value = this.dv.getInt32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    }
    getInt32Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getInt32());
      }
      return a;
    }
    getUint32() {
      let value = this.dv.getUint32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    }
    getUint32Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getUint32());
      }
      return a;
    }
    getFloat32() {
      let value = this.dv.getFloat32(this.offset, this.littleEndian);
      this.offset += 4;
      return value;
    }
    getFloat32Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getFloat32());
      }
      return a;
    }
    getFloat64() {
      let value = this.dv.getFloat64(this.offset, this.littleEndian);
      this.offset += 8;
      return value;
    }
    getFloat64Array(size) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getFloat64());
      }
      return a;
    }
    getIndex(type, isUnsigned?) {
      switch (type) {
        case 1:
          return (isUnsigned === true) ? this.getUint8() : this.getInt8();
        case 2:
          return (isUnsigned === true) ? this.getUint16() : this.getInt16();
        case 4:
          return this.getInt32(); // No Uint32
        default:
          throw 'unknown number type ' + type + ' exception.';
      }
    }
    getIndexArray(type, size, isUnsigned?) {
      let a = [];
      for (let i = 0; i < size; i++) {
        a.push(this.getIndex(type, isUnsigned));
      }
      return a;
    }
    getChars(size) {
      let str = '';
      while (size > 0) {
        let value = this.getUint8();
        size--;
        if (value === 0) {
          break;
        }
        str += String.fromCharCode(value);
      }
      while (size > 0) {
        this.getUint8();
        size--;
      }
      return str;
    }
    getSjisStringsAsUnicode(size) {
      let a = [];
      while (size > 0) {
        let value = this.getUint8();
        size--;
        if (value === 0) {
          break;
        }
        a.push(value);
      }
      while (size > 0) {
        this.getUint8();
        size--;
      }
      return this.encoder.s2u(new Uint8Array(a));
    }
    getUnicodeStrings(size) {
      let str = '';
      while (size > 0) {
        let value = this.getUint16();
        size -= 2;
        if (value === 0) {
          break;
        }
        str += String.fromCharCode(value);
      }
      while (size > 0) {
        this.getUint8();
        size--;
      }
      return str;
    }
    getTextBuffer() {
      let size = this.getUint32();
      return this.getUnicodeStrings(size);
    }
  };
  /*
   * Shaders are copied from MeshPhongMaterial and then MMD spcific codes are inserted.
   * Keep shaders updated on MeshPhongMaterial.
   */
  static SHADER = /*THREE.ShaderLib[ 'mmd' ] =*/ {
    uniforms: THREE.UniformsUtils.merge([
      THREE.ShaderLib[ 'phong' ].uniforms,
      // MMD specific for toon mapping
      {
        "celShading"      : { type: "i", value: 0 },
        "toonMap"         : { type: "t", value: null },
        "hasToonTexture"  : { type: "i", value: 0 }
      }
    ]),
    vertexShader: THREE.ShaderLib[ 'phong' ].vertexShader,
    // put toon mapping logic right before "void main() {...}"
    fragmentShader: THREE.ShaderLib[ 'phong' ].fragmentShader.replace(/void\s+main\s*\(\s*\)/, [
      "  uniform bool celShading;",
      "  uniform sampler2D toonMap;",
      "  uniform bool hasToonTexture;",
      "  vec3 toon (vec3 lightDirection, vec3 norm) {",
      "    if (! hasToonTexture) {",
      "      return vec3(1.0);",
      "    }",
      "    vec2 coord = vec2(0.0, 0.5 * (1.0 - dot(lightDirection, norm)));",
      "    return texture2D(toonMap, coord).rgb;",
      "  }",
      // redefine for MMD
      "#undef RE_Direct",
      "void RE_Direct_BlinnMMD(const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight) {",
      "  float dotNL = saturate(dot(geometry.normal, directLight.direction));",
      "  vec3 irradiance = dotNL * directLight.color;",
      "  #ifndef PHYSICALLY_CORRECT_LIGHTS",
      "    irradiance *= PI; // punctual light",
      "  #endif",
      // ---- MMD specific for toon mapping
      "  if (celShading) {",
      "    reflectedLight.directDiffuse += material.diffuseColor * directLight.color * toon(directLight.direction, geometry.normal);",
      "  } else {",
      "    reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert(material.diffuseColor);",
      "  }",
      // ---- MMD specific for toon mapping
      "  reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(directLight, geometry, material.specularColor, material.specularShininess) * material.specularStrength;",
      "}",
      // ---- MMD specific for toon mapping
      "#define RE_Direct  RE_Direct_BlinnMMD",
      // ---- MMD specific for toon mapping
      "void main()",
    ].join("\n"))
  };
}
export class MMDAudioManager {
  audio;
  listener;
  elapsedTime;
  currentTime;
  delayTime;
  audioDuration;
  duration;
  constructor(audio, listener, p) {
    let params = (p === null || p === undefined) ? {} : p;
    this.audio = audio;
    this.listener = listener;
    this.elapsedTime = 0.0;
    this.currentTime = 0.0;
    this.delayTime = params.delayTime !== undefined ? params.delayTime : 0.0;
    this.audioDuration = this.audio.source.buffer.duration;
    this.duration = this.audioDuration + this.delayTime;
  }
  control(delta) {
    this.elapsedTime += delta;
    this.currentTime += delta;
    if (this.checkIfStopAudio()) {
      this.audio.stop();
    }
    if (this.checkIfStartAudio()) {
      this.audio.play();
    }
  }
  checkIfStartAudio() {
    if (this.audio.isPlaying) {
      return false;
    }
    while (this.currentTime >= this.duration) {
      this.currentTime -= this.duration;
    }
    if (this.currentTime < this.delayTime) {
      return false;
    }
    this.audio.startTime = this.currentTime - this.delayTime;
    return true;
  }
  checkIfStopAudio() {
    if (! this.audio.isPlaying) {
      return false;
    }
    if (this.currentTime >= this.duration) {
      return true;
    }
    return false;
  }
};
export class MMDGrantSolver {
  mesh;
  constructor(mesh) {
    this.mesh = mesh;
  }
  update() {
    let q = new THREE.Quaternion();
    //return function() {
      for (let i = 0; i < this.mesh.geometry.grants.length; i ++) {
        let g = this.mesh.geometry.grants[ i ];
        let b = this.mesh.skeleton.bones[ g.index ];
        let pb = this.mesh.skeleton.bones[ g.parentIndex ];
        if (g.isLocal) {
          // TODO: implement
          if (g.affectPosition) {
          }
          // TODO: implement
          if (g.affectRotation) {
          }
        } else {
          // TODO: implement
          if (g.affectPosition) {
          }
          if (g.affectRotation) {
            q.set(0, 0, 0, 1);
            q.slerp(pb.quaternion, g.ratio);
            b.quaternion.multiply(q);
            b.updateMatrixWorld(true);
          }
        }
      }
    //};
  }
}
export class MMDHelper {
  renderer;
  outlineEffect = null;
  effect = null;
  autoClear = true;
  meshes = [];
  doAnimation = true;
  doIk = true;
  doGrant = true;
  doPhysics = true;
  doOutlineDrawing = true;
  doCameraAnimation = true;
  audioManager = null;
  camera = null;
  constructor(renderer) {
    this.renderer = renderer;
    this.init();
  }
  init() {
    this.outlineEffect = new THREE_OutlineEffect(this.renderer);
    let size = this.renderer.getSize();
    this.setSize(size.width, size.height);
  }
  add(mesh) {
    if (! (mesh instanceof THREE.SkinnedMesh)) {
      throw new Error('THREE.MMDHelper.add() accepts only THREE.SkinnedMesh instance.');
    }
    mesh.mixer = null;
    mesh.ikSolver = null;
    mesh.grantSolver = null;
    mesh.physics = null;
    this.meshes.push(mesh);
    // workaround until I make IK and Physics Animation plugin
    this.initBackupBones(mesh);
  }
  setSize(width, height) {
    this.outlineEffect.setSize(width, height);
  }
  /*
   * Note: There may be a possibility that Outline wouldn't work well with Effect.
   *       In such a case, try to set doOutlineDrawing = false or
   *       manually comment out renderer.clear() in *Effect.render().
   */
  setEffect(effect) {
    this.effect = effect;
  }
  setAudio(audio, listener, params) {
    this.audioManager = new MMDAudioManager(audio, listener, params);
  }
  setCamera(camera) {
    camera.mixer = null;
    this.camera = camera;
  }
  setPhysicses(params) {
    for (let i = 0; i < this.meshes.length; i++) {
      this.setPhysics(this.meshes[ i ], params);
    }
  }
  setPhysics(mesh, params) {
    mesh.physics = new THREE_MMDPhysics(mesh, params);
    mesh.physics.warmup(10);
  }
  setAnimations() {
    for (let i = 0; i < this.meshes.length; i++) {
      this.setAnimation(this.meshes[ i ]);
    }
  }
  setAnimation(mesh) {
    if (mesh.geometry.animations !== undefined) {
      mesh.mixer = new THREE.AnimationMixer(mesh);
      let foundAnimation = false;
      let foundMorphAnimation = false;
      for (let i = 0; i < mesh.geometry.animations.length; i++) {
        let clip = mesh.geometry.animations[ i ];
        let action = mesh.mixer.clipAction(clip);
        if (clip.tracks[ 0 ].name.indexOf('.morphTargetInfluences') === 0) {
          if (! foundMorphAnimation) {
            action.play();
            foundMorphAnimation = true;
          }
        } else {
          if (! foundAnimation) {
            action.play();
            foundAnimation = true;
          }
        }
      }
      if (foundAnimation) {
        mesh.ikSolver = new THREE_CCDIKSolver(mesh);
        if (mesh.geometry.grants !== undefined) {
          mesh.grantSolver = new MMDGrantSolver(mesh);
        }
      }
    }
  }
  setCameraAnimation(camera) {
    if (camera.animations !== undefined) {
      camera.mixer = new THREE.AnimationMixer(camera);
      camera.mixer.clipAction(camera.animations[ 0 ]).play();
    }
  }
  /*
   * detect the longest duration among model, camera, and audio animations and then
   * set it to them to sync.
   * TODO: touching private properties (._actions and ._clip) so consider better way
   *       to access them for safe and modularity.
   */
  unifyAnimationDuration(params) {
    params = params === undefined ? {} : params;
    let max = 0.0;
    let camera = this.camera;
    let audioManager = this.audioManager;
    // check the longest duration
    for (let i = 0; i < this.meshes.length; i++) {
      let mesh = this.meshes[ i ];
      let mixer = mesh.mixer;
      if (mixer === null) {
        continue;
      }
      for (let j = 0; j < mixer._actions.length; j++) {
        let action = mixer._actions[ j ];
        max = Math.max(max, action._clip.duration);
      }
    }
    if (camera !== null && camera.mixer !== null) {
      let mixer = camera.mixer;
      for (let i = 0; i < mixer._actions.length; i++) {
        let action = mixer._actions[ i ];
        max = Math.max(max, action._clip.duration);
      }
    }
    if (audioManager !== null) {
      max = Math.max(max, audioManager.duration);
    }
    if (params.afterglow !== undefined) {
      max += params.afterglow;
    }
    // set the duration
    for (let i = 0; i < this.meshes.length; i++) {
      let mesh = this.meshes[ i ];
      let mixer = mesh.mixer;
      if (mixer === null) {
        continue;
      }
      for (let j = 0; j < mixer._actions.length; j++) {
        let action = mixer._actions[ j ];
        action._clip.duration = max;
      }
    }
    if (camera !== null && camera.mixer !== null) {
      let mixer = camera.mixer;
      for (let i = 0; i < mixer._actions.length; i++) {
        let action = mixer._actions[ i ];
        action._clip.duration = max;
      }
    }
    if (audioManager !== null) {
      audioManager.duration = max;
    }
  }
  controlAudio(delta) {
    if (this.audioManager === null) {
      return;
    }
    this.audioManager.control(delta);
  }
  animate(delta) {
    this.controlAudio(delta);
    for (let i = 0; i < this.meshes.length; i++) {
      this.animateOneMesh(delta, this.meshes[ i ]);
    }
    this.animateCamera(delta);
  }
  animateOneMesh(delta, mesh) {
    let mixer = mesh.mixer;
    let ikSolver = mesh.ikSolver;
    let grantSolver = mesh.grantSolver;
    let physics = mesh.physics;
    if (mixer !== null && this.doAnimation === true) {
      // restore/backupBones are workaround
      // until I make IK, Grant, and Physics Animation plugin
      this.restoreBones(mesh);
      mixer.update(delta);
      this.backupBones(mesh);
    }
    if (ikSolver !== null && this.doIk === true) {
      ikSolver.update();
    }
    if (grantSolver !== null && this.doGrant === true) {
      grantSolver.update();
    }
    if (physics !== null && this.doPhysics === true) {
      physics.update(delta);
    }
  }
  animateCamera(delta) {
    if (this.camera === null) {
      return;
    }
    let mixer = this.camera.mixer;
    if (mixer !== null && this.camera.center !== undefined && this.doCameraAnimation === true) {
      mixer.update(delta);
      // TODO: Let PerspectiveCamera automatically update?
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.camera.center);
    }
  }
  render(scene, camera) {
    if (this.effect === null) {
      if (this.doOutlineDrawing) {
        this.outlineEffect.autoClear = this.autoClear;
        this.outlineEffect.render(scene, camera);
      } else {
        let currentAutoClear = this.renderer.autoClear;
        this.renderer.autoClear = this.autoClear;
        this.renderer.render(scene, camera);
        this.renderer.autoClear = currentAutoClear;
      }
    } else {
      let currentAutoClear = this.renderer.autoClear;
      this.renderer.autoClear = this.autoClear;
      if (this.doOutlineDrawing) {
        this.renderWithEffectAndOutline(scene, camera);
      } else {
        this.effect.render(scene, camera);
      }
      this.renderer.autoClear = currentAutoClear;
    }
  }
  /*
   * Currently(r82 dev) there's no way to render with two Effects
   * then attempt to get them to coordinately run by myself.
   *
   * What this method does
   * 1. let OutlineEffect make outline materials (only once)
   * 2. render normally with effect
   * 3. set outline materials
   * 4. render outline with effect
   * 5. restore original materials
   */
  renderWithEffectAndOutline(scene, camera) {
    let hasOutlineMaterial = false;
    function checkIfObjectHasOutlineMaterial (object) {
      if (object.material === undefined) return;
      if (object.userData.outlineMaterial !== undefined) hasOutlineMaterial = true;
    }
    function setOutlineMaterial (object) {
      if (object.material === undefined) return;
      if (object.userData.outlineMaterial === undefined) return;
      object.userData.originalMaterial = object.material;
      object.material = object.userData.outlineMaterial;
    }
    function restoreOriginalMaterial (object) {
      if (object.material === undefined) return;
      if (object.userData.originalMaterial === undefined) return;
      object.material = object.userData.originalMaterial;
    }
    //return function renderWithEffectAndOutline(scene, camera) {
      hasOutlineMaterial = false;
      let forceClear = false;
      scene.traverse(checkIfObjectHasOutlineMaterial);
      if (! hasOutlineMaterial) {
        this.outlineEffect.render(scene, camera);
        forceClear = true;
        scene.traverse(checkIfObjectHasOutlineMaterial);
      }
      if (hasOutlineMaterial) {
        this.renderer.autoClear = this.autoClear || forceClear;
        this.effect.render(scene, camera);
        scene.traverse(setOutlineMaterial);
        let currentShadowMapEnabled = this.renderer.shadowMap.enabled;
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = false;
        this.effect.render(scene, camera);
        this.renderer.shadowMap.enabled = currentShadowMapEnabled;
        scene.traverse(restoreOriginalMaterial);
      } else {
        this.outlineEffect.autoClear = this.autoClear || forceClear;
        this.outlineEffect.render(scene, camera);
      }
    //}
  }
  poseAsVpd(mesh, vpd, params) {
    if (! (params && params.preventResetPose === true)) {
      mesh.pose();
    }
    let bones = mesh.skeleton.bones;
    let bones2 = vpd.bones;
    let table = {};
    for (let i = 0; i < bones.length; i++) {
      let b = bones[ i ];
      table[ b.name ] = i;
    }
    let thV = new THREE.Vector3();
    let thQ = new THREE.Quaternion();
    for (let i = 0; i < bones2.length; i++) {
      let b = bones2[ i ];
      let index = table[ b.name ];
      if (index === undefined) {
        continue;
      }
      let b2 = bones[ index ];
      let t = b.translation;
      let q = b.quaternion;
      thV.set(t[ 0 ], t[ 1 ], t[ 2 ]);
      thQ.set(q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ]);
      b2.position.add(thV);
      b2.quaternion.multiply(thQ);
      b2.updateMatrixWorld(true);
    }
    if (params === undefined || params.preventIk !== true) {
      let solver = new THREE_CCDIKSolver(mesh);
      solver.update();
    }
    if (params === undefined || params.preventGrant !== true) {
      if (mesh.geometry.grants !== undefined) {
        let solver = new MMDGrantSolver(mesh);
        solver.update();
      }
    }
  }
  /*
   * Note: These following three functions are workaround for r74dev.
   *       THREE.PropertyMixer.apply() seems to save values into buffer cache
   *       when mixer.update() is called.
   *       ikSolver.update() and physics.update() change bone position/quaternion
   *       without mixer.update() then buffer cache will be inconsistent.
   *       So trying to avoid buffer cache inconsistency by doing
   *       backup bones position/quaternion right after mixer.update() call
   *       and then restore them after rendering.
   */
  initBackupBones(mesh) {
    mesh.skeleton.backupBones = [];
    for (let i = 0; i < mesh.skeleton.bones.length; i++) {
      mesh.skeleton.backupBones.push(mesh.skeleton.bones[ i ].clone());
    }
  }
  backupBones(mesh) {
    mesh.skeleton.backupBoneIsSaved = true;
    for (let i = 0; i < mesh.skeleton.bones.length; i++) {
      let b = mesh.skeleton.backupBones[ i ];
      let b2 = mesh.skeleton.bones[ i ];
      b.position.copy(b2.position);
      b.quaternion.copy(b2.quaternion);
    }
  }
  restoreBones(mesh) {
    if (mesh.skeleton.backupBoneIsSaved !== true) {
      return;
    }
    mesh.skeleton.backupBoneIsSaved = false;
    for (let i = 0; i < mesh.skeleton.bones.length; i++) {
      let b = mesh.skeleton.bones[ i ];
      let b2 = mesh.skeleton.backupBones[ i ];
      b.position.copy(b2.position);
      b.quaternion.copy(b2.quaternion);
    }
  }
}
