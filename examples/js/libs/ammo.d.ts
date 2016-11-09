declare namespace Ammo {
  class btVector3 {
    constructor(x?, y?, z?);
  }
  class btQuaternion {
    constructor(x?, y?, z?, w?);
  }
  class btTransform {}
  class btSphereShape {
    constructor(r?);
    calculateLocalInertia(a, b?);
  }
  class btBoxShape {
    constructor(v?);
    calculateLocalInertia(a, b?);
  }
  class btCapsuleShape {
    constructor(w?, h?);
    calculateLocalInertia(a, b?);
  }
  class btDefaultCollisionConfiguration {}
  class btCollisionDispatcher {
    constructor(config);
  }
  class btDbvtBroadphase {}
  class btSequentialImpulseConstraintSolver {}
  class btDiscreteDynamicsWorld {
    constructor(a, b, c, d);
    setGravity(v);
  }
  class btDefaultMotionState {
    constructor(a);
  }
  class btRigidBodyConstructionInfo {
    constructor(a, b, c, d);
    set_m_friction(a);
    set_m_restitution(a);
  }
  class btRigidBody {
    constructor(a?);
    setCollisionFlags(a);
    getCollisionFlags();
    setActivationState(a);
    setDamping(a, b);
    setSleepingThresholds(a, b);
  }
  class btGeneric6DofSpringConstraint {
    constructor(a, b, c, d, e);
    setLinearLowerLimit(a);
    setLinearUpperLimit(a);
    setAngularLowerLimit(a);
    setAngularUpperLimit(a);
    enableSpring(a, b);
    setStiffness(a, b);
  }
}
