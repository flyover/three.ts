/**
 * @author takahiro / https://github.com/takahirox
 *
 * Dependencies
 *  - Ammo.js https://github.com/kripken/ammo.js
 *
 *
 * MMD specific Physics class.
 *
 * See THREE.MMDLoader for the passed parameter list of RigidBody/Constraint.
 *
 *
 * TODO
 *  - use Physijs http://chandlerprall.github.io/Physijs/
 *    and improve the performance by making use of Web worker.
 *  - if possible, make this class being non-MMD specific.
 */
import * as THREE from '../../../src/Three';
export class MMDPhysics {
  mesh;
  helper;
  unitStep;
  maxStepNum;
  world;
  bodies;
  constraints;
  constructor(mesh, params) {
    this.mesh = mesh;
    this.helper = new MMDPhysics.PhysicsHelper();
    /*
     * Note: Default 1 / 65 unit step is a workaround that
     *       some bones go wrong at near 60fps if it's 1 / 60.
     *       Be careful that small unitStep could cause heavy
     *       physics calculation.
     */
    this.unitStep = (params && params.unitStep) ? params.unitStep : 1 / 65;
    this.maxStepNum = (params && params.maxStepNum) ? params.maxStepNum : 3;
    this.world = null;
    this.bodies = [];
    this.constraints = [];
    this.init();
  }
  init() {
    this.initWorld();
    this.initRigidBodies();
    this.initConstraints();
    this.reset();
  }
  initWorld() {
    let config = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher(config);
    let cache = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();
    let world = new Ammo.btDiscreteDynamicsWorld(dispatcher, cache, solver, config);
    world.setGravity(new Ammo.btVector3(0, -10 * 10, 0));
    this.world = world;
  }
  initRigidBodies() {
    let bodies = this.mesh.geometry.rigidBodies;
    for (let i = 0; i < bodies.length; i++) {
      let b = new MMDPhysics.RigidBody(this.mesh, this.world, bodies[ i ], this.helper);
      this.bodies.push(b);
    }
  }
  initConstraints() {
    let constraints = this.mesh.geometry.constraints;
    for (let i = 0; i < constraints.length; i++) {
      let params = constraints[ i ];
      let bodyA = this.bodies[ params.rigidBodyIndex1 ];
      let bodyB = this.bodies[ params.rigidBodyIndex2 ];
      let c = new MMDPhysics.Constraint(this.mesh, this.world, bodyA, bodyB, params, this.helper);
      this.constraints.push(c);
    }
  }
  update(delta) {
    let unitStep = this.unitStep;
    let stepTime = delta;
    let maxStepNum = ((delta / unitStep) | 0) + 1;
    if (maxStepNum > this.maxStepNum) {
      maxStepNum = this.maxStepNum;
    }
    this.updateRigidBodies();
    this.world.stepSimulation(stepTime, maxStepNum, unitStep);
    this.updateBones();
  }
  updateRigidBodies() {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[ i ].updateFromBone();
    }
  }
  updateBones() {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[ i ].updateBone();
    }
  }
  reset() {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[ i ].reset();
    }
  }
  warmup(cycles) {
    for (let i = 0; i < cycles; i++) {
      this.update(1);
    }
  }
  /**
   * This helper class responsibilies are
   *
   * 1. manage Ammo.js and Three.js object resources and
   *    improve the performance and the memory consumption by
   *    reusing objects.
   *
   * 2. provide simple Ammo object operations.
   */
  static PhysicsHelper = class {
    // for Three.js
    threeVector3s = [];
    threeMatrix4s = [];
    threeQuaternions = [];
    // for Ammo.js
    transforms = [];
    quaternions = [];
    vector3s = [];
    allocThreeVector3() {
      return (this.threeVector3s.length > 0) ? this.threeVector3s.pop() : new THREE.Vector3();
    }
    freeThreeVector3(v) {
      this.threeVector3s.push(v);
    }
    allocThreeMatrix4() {
      return (this.threeMatrix4s.length > 0) ? this.threeMatrix4s.pop() : new THREE.Matrix4();
    }
    freeThreeMatrix4(m) {
      this.threeMatrix4s.push(m);
    }
    allocThreeQuaternion() {
      return (this.threeQuaternions.length > 0) ? this.threeQuaternions.pop() : new THREE.Quaternion();
    }
    freeThreeQuaternion(q) {
      this.threeQuaternions.push(q);
    }
    allocTransform() {
      return (this.transforms.length > 0) ? this.transforms.pop() : new Ammo.btTransform();
    }
    freeTransform(t) {
      this.transforms.push(t);
    }
    allocQuaternion() {
      return (this.quaternions.length > 0) ? this.quaternions.pop() : new Ammo.btQuaternion();
    }
    freeQuaternion(q) {
      this.quaternions.push(q);
    }
    allocVector3() {
      return (this.vector3s.length > 0) ? this.vector3s.pop() : new Ammo.btVector3();
    }
    freeVector3(v) {
      this.vector3s.push(v);
    }
    setIdentity(t) {
      t.setIdentity();
    }
    getBasis(t) {
      let q = this.allocQuaternion();
      t.getBasis().getRotation(q);
      return q;
    }
    getBasisAsMatrix3(t) {
      let q = this.getBasis(t);
      let m = this.quaternionToMatrix3(q);
      this.freeQuaternion(q);
      return m;
    }
    getOrigin(t) {
      return t.getOrigin();
    }
    setOrigin(t, v) {
      t.getOrigin().setValue(v.x(), v.y(), v.z());
    }
    copyOrigin(t1, t2) {
      let o = t2.getOrigin();
      this.setOrigin(t1, o);
    }
    setBasis(t, q) {
      t.setRotation(q);
    }
    setBasisFromMatrix3(t, m) {
      let q = this.matrix3ToQuaternion(m);
      this.setBasis(t, q);
      this.freeQuaternion(q);
    }
    setOriginFromArray3(t, a) {
      t.getOrigin().setValue(a[ 0 ], a[ 1 ], a[ 2 ]);
    }
    setBasisFromArray3(t, a) {
      t.getBasis().setEulerZYX(a[ 0 ], a[ 1 ], a[ 2 ]);
    }
    setBasisFromArray4(t, a) {
      let q = this.array4ToQuaternion(a);
      this.setBasis(t, q);
      this.freeQuaternion(q);
    }
    array4ToQuaternion(a) {
      let q = this.allocQuaternion();
      q.setX(a[ 0 ]);
      q.setY(a[ 1 ]);
      q.setZ(a[ 2 ]);
      q.setW(a[ 3 ]);
      return q;
    }
    multiplyTransforms(t1, t2) {
      let t = this.allocTransform();
      this.setIdentity(t);
      let m1 = this.getBasisAsMatrix3(t1);
      let m2 = this.getBasisAsMatrix3(t2);
      let o1 = this.getOrigin(t1);
      let o2 = this.getOrigin(t2);
      let v1 = this.multiplyMatrix3ByVector3(m1, o2);
      let v2 = this.addVector3(v1, o1);
      this.setOrigin(t, v2);
      let m3 = this.multiplyMatrices3(m1, m2);
      this.setBasisFromMatrix3(t, m3);
      this.freeVector3(v1);
      this.freeVector3(v2);
      return t;
    }
    inverseTransform(t) {
      let t2 = this.allocTransform();
      let m1 = this.getBasisAsMatrix3(t);
      let o = this.getOrigin(t);
      let m2 = this.transposeMatrix3(m1);
      let v1 = this.negativeVector3(o);
      let v2 = this.multiplyMatrix3ByVector3(m2, v1);
      this.setOrigin(t2, v2);
      this.setBasisFromMatrix3(t2, m2);
      this.freeVector3(v1);
      this.freeVector3(v2);
      return t2;
    }
    multiplyMatrices3(m1, m2) {
      let m3 = [];
      let v10 = this.rowOfMatrix3(m1, 0);
      let v11 = this.rowOfMatrix3(m1, 1);
      let v12 = this.rowOfMatrix3(m1, 2);
      let v20 = this.columnOfMatrix3(m2, 0);
      let v21 = this.columnOfMatrix3(m2, 1);
      let v22 = this.columnOfMatrix3(m2, 2);
      m3[ 0 ] = this.dotVectors3(v10, v20);
      m3[ 1 ] = this.dotVectors3(v10, v21);
      m3[ 2 ] = this.dotVectors3(v10, v22);
      m3[ 3 ] = this.dotVectors3(v11, v20);
      m3[ 4 ] = this.dotVectors3(v11, v21);
      m3[ 5 ] = this.dotVectors3(v11, v22);
      m3[ 6 ] = this.dotVectors3(v12, v20);
      m3[ 7 ] = this.dotVectors3(v12, v21);
      m3[ 8 ] = this.dotVectors3(v12, v22);
      this.freeVector3(v10);
      this.freeVector3(v11);
      this.freeVector3(v12);
      this.freeVector3(v20);
      this.freeVector3(v21);
      this.freeVector3(v22);
      return m3;
    }
    addVector3(v1, v2) {
      let v = this.allocVector3();
      v.setValue(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z());
      return v;
    }
    dotVectors3(v1, v2) {
      return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();
    }
    rowOfMatrix3(m, i) {
      let v = this.allocVector3();
      v.setValue(m[ i * 3 + 0 ], m[ i * 3 + 1 ], m[ i * 3 + 2 ]);
      return v;
    }
    columnOfMatrix3(m, i) {
      let v = this.allocVector3();
      v.setValue(m[ i + 0 ], m[ i + 3 ], m[ i + 6 ]);
      return v;
    }
    negativeVector3(v) {
      let v2 = this.allocVector3();
      v2.setValue(-v.x(), -v.y(), -v.z());
      return v2;
    }
    multiplyMatrix3ByVector3(m, v) {
      let v4 = this.allocVector3();
      let v0 = this.rowOfMatrix3(m, 0);
      let v1 = this.rowOfMatrix3(m, 1);
      let v2 = this.rowOfMatrix3(m, 2);
      let x = this.dotVectors3(v0, v);
      let y = this.dotVectors3(v1, v);
      let z = this.dotVectors3(v2, v);
      v4.setValue(x, y, z);
      this.freeVector3(v0);
      this.freeVector3(v1);
      this.freeVector3(v2);
      return v4;
    }
    transposeMatrix3(m) {
      let m2 = [];
      m2[ 0 ] = m[ 0 ];
      m2[ 1 ] = m[ 3 ];
      m2[ 2 ] = m[ 6 ];
      m2[ 3 ] = m[ 1 ];
      m2[ 4 ] = m[ 4 ];
      m2[ 5 ] = m[ 7 ];
      m2[ 6 ] = m[ 2 ];
      m2[ 7 ] = m[ 5 ];
      m2[ 8 ] = m[ 8 ];
      return m2;
    }
    quaternionToMatrix3(q) {
      let m = [];
      let x = q.x();
      let y = q.y();
      let z = q.z();
      let w = q.w();
      let xx = x * x;
      let yy = y * y;
      let zz = z * z;
      let xy = x * y;
      let yz = y * z;
      let zx = z * x;
      let xw = x * w;
      let yw = y * w;
      let zw = z * w;
      m[ 0 ] = 1 - 2 * (yy + zz);
      m[ 1 ] = 2 * (xy - zw);
      m[ 2 ] = 2 * (zx + yw);
      m[ 3 ] = 2 * (xy + zw);
      m[ 4 ] = 1 - 2 * (zz + xx);
      m[ 5 ] = 2 * (yz - xw);
      m[ 6 ] = 2 * (zx - yw);
      m[ 7 ] = 2 * (yz + xw);
      m[ 8 ] = 1 - 2 * (xx + yy);
      return m;
    }
    matrix3ToQuaternion(m) {
      let t = m[ 0 ] + m[ 4 ] + m[ 8 ];
      let s, x, y, z, w;
      if (t > 0) {
        s = Math.sqrt(t + 1.0) * 2;
        w = 0.25 * s;
        x = (m[ 7 ] - m[ 5 ]) / s;
        y = (m[ 2 ] - m[ 6 ]) / s;
        z = (m[ 3 ] - m[ 1 ]) / s;
      } else if ((m[ 0 ] > m[ 4 ]) && (m[ 0 ] > m[ 8 ])) {
        s = Math.sqrt(1.0 + m[ 0 ] - m[ 4 ] - m[ 8 ]) * 2;
        w = (m[ 7 ] - m[ 5 ]) / s;
        x = 0.25 * s;
        y = (m[ 1 ] + m[ 3 ]) / s;
        z = (m[ 2 ] + m[ 6 ]) / s;
      } else if (m[ 4 ] > m[ 8 ]) {
        s = Math.sqrt(1.0 + m[ 4 ] - m[ 0 ] - m[ 8 ]) * 2;
        w = (m[ 2 ] - m[ 6 ]) / s;
        x = (m[ 1 ] + m[ 3 ]) / s;
        y = 0.25 * s;
        z = (m[ 5 ] + m[ 7 ]) / s;
      } else {
        s = Math.sqrt(1.0 + m[ 8 ] - m[ 0 ] - m[ 4 ]) * 2;
        w = (m[ 3 ] - m[ 1 ]) / s;
        x = (m[ 2 ] + m[ 6 ]) / s;
        y = (m[ 5 ] + m[ 7 ]) / s;
        z = 0.25 * s;
      }
      let q = this.allocQuaternion();
      q.setX(x);
      q.setY(y);
      q.setZ(z);
      q.setW(w);
      return q;
    }
  };
  static RigidBody = class {
    mesh;
    world;
    params;
    helper;
    body = null;
    bone = null;
    boneOffsetForm = null;
    boneOffsetFormInverse = null;
    constructor(mesh, world, params, helper) {
      this.mesh  = mesh;
      this.world = world;
      this.params = params;
      this.helper = helper;
      this.init();
    }
    init() {
      function generateShape (p) {
        switch (p.shapeType) {
          case 0:
            return new Ammo.btSphereShape(p.width);
          case 1:
            return new Ammo.btBoxShape(new Ammo.btVector3(p.width, p.height, p.depth));
          case 2:
            return new Ammo.btCapsuleShape(p.width, p.height);
          default:
            throw 'unknown shape type ' + p.shapeType;
        }
      };
      let helper = this.helper;
      let params = this.params;
      let bones = this.mesh.skeleton.bones;
      let bone = (params.boneIndex === -1) ? new THREE.Bone() : bones[ params.boneIndex ];
      let shape = generateShape(params);
      let weight = (params.type === 0) ? 0 : params.weight;
      let localInertia = helper.allocVector3();
      localInertia.setValue(0, 0, 0);
      if (weight !== 0) {
        shape.calculateLocalInertia(weight, localInertia);
      }
      let boneOffsetForm = helper.allocTransform();
      helper.setIdentity(boneOffsetForm);
      helper.setOriginFromArray3(boneOffsetForm, params.position);
      helper.setBasisFromArray3(boneOffsetForm, params.rotation);
      let boneForm = helper.allocTransform();
      helper.setIdentity(boneForm);
      helper.setOriginFromArray3(boneForm, bone.getWorldPosition().toArray());
      let form = helper.multiplyTransforms(boneForm, boneOffsetForm);
      let state = new Ammo.btDefaultMotionState(form);
      let info = new Ammo.btRigidBodyConstructionInfo(weight, state, shape, localInertia);
      info.set_m_friction(params.friction);
      info.set_m_restitution(params.restriction);
      let body = new Ammo.btRigidBody(info);
      if (params.type === 0) {
        body.setCollisionFlags(body.getCollisionFlags() | 2);
        body.setActivationState(4);
      }
      body.setDamping(params.positionDamping, params.rotationDamping);
      body.setSleepingThresholds(0, 0);
      this.world.addRigidBody(body, 1 << params.groupIndex, params.groupTarget);
      this.body = body;
      this.bone = bone;
      this.boneOffsetForm = boneOffsetForm;
      this.boneOffsetFormInverse = helper.inverseTransform(boneOffsetForm);
      helper.freeVector3(localInertia);
      helper.freeTransform(form);
      helper.freeTransform(boneForm);
    }
    reset() {
      this.setTransformFromBone();
    }
    updateFromBone() {
      if (this.params.boneIndex === -1) {
        return;
      }
      if (this.params.type === 0) {
        this.setTransformFromBone();
      }
      if (this.params.type === 2) {
        this.setPositionFromBone();
      }
    }
    updateBone() {
      if (this.params.type === 0 || this.params.boneIndex === -1) {
        return;
      }
      this.updateBoneRotation();
      if (this.params.type === 1) {
        this.updateBonePosition();
      }
      this.bone.updateMatrixWorld(true);
    }
    getBoneTransform() {
      let helper = this.helper;
      let p = this.bone.getWorldPosition();
      let q = this.bone.getWorldQuaternion();
      let tr = helper.allocTransform();
      helper.setOriginFromArray3(tr, p.toArray());
      helper.setBasisFromArray4(tr, q.toArray());
      let form = helper.multiplyTransforms(tr, this.boneOffsetForm);
      helper.freeTransform(tr);
      return form;
    }
    getWorldTransformForBone() {
      let helper = this.helper;
      let tr = helper.allocTransform();
      this.body.getMotionState().getWorldTransform(tr);
      let tr2 = helper.multiplyTransforms(tr, this.boneOffsetFormInverse);
      helper.freeTransform(tr);
      return tr2;
    }
    setTransformFromBone() {
      let helper = this.helper;
      let form = this.getBoneTransform();
      // TODO: check the most appropriate way to set
      //this.body.setWorldTransform(form);
      this.body.setCenterOfMassTransform(form);
      this.body.getMotionState().setWorldTransform(form);
      helper.freeTransform(form);
    }
    setPositionFromBone() {
      let helper = this.helper;
      let form = this.getBoneTransform();
      let tr = helper.allocTransform();
      this.body.getMotionState().getWorldTransform(tr);
      helper.copyOrigin(tr, form);
      // TODO: check the most appropriate way to set
      //this.body.setWorldTransform(tr);
      this.body.setCenterOfMassTransform(tr);
      this.body.getMotionState().setWorldTransform(tr);
      helper.freeTransform(tr);
      helper.freeTransform(form);
    }
    updateBoneRotation() {
      this.bone.updateMatrixWorld(true);
      let helper = this.helper;
      let tr = this.getWorldTransformForBone();
      let q = helper.getBasis(tr);
      let thQ = helper.allocThreeQuaternion();
      let thQ2 = helper.allocThreeQuaternion();
      let thQ3 = helper.allocThreeQuaternion();
      thQ.set(q.x(), q.y(), q.z(), q.w());
      thQ2.setFromRotationMatrix(this.bone.matrixWorld);
      thQ2.conjugate();
      thQ2.multiply(thQ);
      //this.bone.quaternion.multiply(thQ2);
      thQ3.setFromRotationMatrix(this.bone.matrix);
      this.bone.quaternion.copy(thQ2.multiply(thQ3));
      helper.freeThreeQuaternion(thQ);
      helper.freeThreeQuaternion(thQ2);
      helper.freeThreeQuaternion(thQ3);
      helper.freeQuaternion(q);
      helper.freeTransform(tr);
    }
    updateBonePosition() {
      let helper = this.helper;
      let tr = this.getWorldTransformForBone();
      let thV = helper.allocThreeVector3();
      let o = helper.getOrigin(tr);
      thV.set(o.x(), o.y(), o.z());
      let v = this.bone.worldToLocal(thV);
      this.bone.position.add(v);
      helper.freeThreeVector3(thV);
      helper.freeTransform(tr);
    }
  };
  static Constraint = class {
    mesh;
    world;
    bodyA;
    bodyB;
    params;
    helper;
    constraint;
    constructor(mesh, world, bodyA, bodyB, params, helper) {
      this.mesh  = mesh;
      this.world = world;
      this.bodyA = bodyA;
      this.bodyB = bodyB;
      this.params = params;
      this.helper = helper;
      this.constraint = null;
      this.init();
    }
    init() {
      let helper = this.helper;
      let params = this.params;
      let bodyA = this.bodyA;
      let bodyB = this.bodyB;
      let form = helper.allocTransform();
      helper.setIdentity(form);
      helper.setOriginFromArray3(form, params.position);
      helper.setBasisFromArray3(form, params.rotation);
      let formA = helper.allocTransform();
      let formB = helper.allocTransform();
      bodyA.body.getMotionState().getWorldTransform(formA);
      bodyB.body.getMotionState().getWorldTransform(formB);
      let formInverseA = helper.inverseTransform(formA);
      let formInverseB = helper.inverseTransform(formB);
      let formA2 = helper.multiplyTransforms(formInverseA, form);
      let formB2 = helper.multiplyTransforms(formInverseB, form);
      let constraint = new Ammo.btGeneric6DofSpringConstraint(bodyA.body, bodyB.body, formA2, formB2, true);
      let lll = helper.allocVector3();
      let lul = helper.allocVector3();
      let all = helper.allocVector3();
      let aul = helper.allocVector3();
      lll.setValue(params.translationLimitation1[ 0 ],
                    params.translationLimitation1[ 1 ],
                    params.translationLimitation1[ 2 ]);
      lul.setValue(params.translationLimitation2[ 0 ],
                    params.translationLimitation2[ 1 ],
                    params.translationLimitation2[ 2 ]);
      all.setValue(params.rotationLimitation1[ 0 ],
                    params.rotationLimitation1[ 1 ],
                    params.rotationLimitation1[ 2 ]);
      aul.setValue(params.rotationLimitation2[ 0 ],
                    params.rotationLimitation2[ 1 ],
                    params.rotationLimitation2[ 2 ]);
      constraint.setLinearLowerLimit(lll);
      constraint.setLinearUpperLimit(lul);
      constraint.setAngularLowerLimit(all);
      constraint.setAngularUpperLimit(aul);
      for (let i = 0; i < 3; i++) {
        if (params.springPosition[ i ] !== 0) {
          constraint.enableSpring(i, true);
          constraint.setStiffness(i, params.springPosition[ i ]);
        }
      }
      for (let i = 0; i < 3; i++) {
        if (params.springRotation[ i ] !== 0) {
          constraint.enableSpring(i + 3, true);
          constraint.setStiffness(i + 3, params.springRotation[ i ]);
        }
      }
      this.world.addConstraint(constraint, true);
      this.constraint = constraint;
      helper.freeTransform(form);
      helper.freeTransform(formA);
      helper.freeTransform(formB);
      helper.freeTransform(formInverseA);
      helper.freeTransform(formInverseB);
      helper.freeTransform(formA2);
      helper.freeTransform(formB2);
      helper.freeVector3(lll);
      helper.freeVector3(lul);
      helper.freeVector3(all);
      helper.freeVector3(aul);
    }
  };
}
