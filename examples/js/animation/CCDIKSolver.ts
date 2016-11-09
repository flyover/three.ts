/**
 * @author takahiro / https://github.com/takahirox
 *
 * CCD Algorithm
 *  https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * mesh.geometry needs to have iks array.
 *
 * ik parameter example
 *
 * ik = {
 *  target: 1,
 *  effector: 2,
 *  links: [ { index: 5 }, { index: 4, limitation: new THREE.Vector3(1, 0, 0) }, { index : 3 } ],
 *  iteration: 10,
 *  minAngle: 0.0,
 *  maxAngle: 1.0,
 * };
 */
import * as THREE from '../../../src/Three';
export class CCDIKSolver {
  mesh;
  constructor(mesh) {
    this.mesh = mesh;
  }
  update() {
    let effectorVec = new THREE.Vector3();
    let targetVec = new THREE.Vector3();
    let axis = new THREE.Vector3();
    let q = new THREE.Quaternion();
    let bones = this.mesh.skeleton.bones;
    let iks = this.mesh.geometry.iks;
    // for reference overhead reduction in loop
    let math = Math;
    for (let i = 0, il = iks.length; i < il; i++) {
      let ik = iks[ i ];
      let effector = bones[ ik.effector ];
      let target = bones[ ik.target ];
      let targetPos = target.getWorldPosition();
      let links = ik.links;
      let iteration = ik.iteration !== undefined ? ik.iteration : 1;
      for (let j = 0; j < iteration; j++) {
        for (let k = 0, kl = links.length; k < kl; k++) {
          let link = bones[ links[ k ].index ];
          let limitation = links[ k ].limitation;
          let linkPos = link.getWorldPosition();
          let invLinkQ = link.getWorldQuaternion().inverse();
          let effectorPos = effector.getWorldPosition();
          // work in link world
          effectorVec.subVectors(effectorPos, linkPos);
          effectorVec.applyQuaternion(invLinkQ);
          effectorVec.normalize();
          targetVec.subVectors(targetPos, linkPos);
          targetVec.applyQuaternion(invLinkQ);
          targetVec.normalize();
          let angle = targetVec.dot(effectorVec);
          // TODO: continue (or break) the loop for the performance
          //       if no longer needs to rotate (angle > 1.0-1e-5 ?)
          if (angle > 1.0) {
            angle = 1.0;
          } else if (angle < -1.0) {
            angle = -1.0;
          }
          angle = math.acos(angle);
          if (ik.minAngle !== undefined && angle < ik.minAngle) {
            angle = ik.minAngle;
          }
          if (ik.maxAngle !== undefined && angle > ik.maxAngle) {
            angle = ik.maxAngle;
          }
          axis.crossVectors(effectorVec, targetVec);
          axis.normalize();
          q.setFromAxisAngle(axis, angle);
          link.quaternion.multiply(q);
          // TODO: re-consider the limitation specification
          if (limitation !== undefined) {
            let c = link.quaternion.w;
            if (c > 1.0) {
              c = 1.0;
            }
            let c2 = math.sqrt(1 - c * c);
            link.quaternion.set(limitation.x * c2,
                                 limitation.y * c2,
                                 limitation.z * c2,
                                 c);
          }
          link.updateMatrixWorld(true);
        }
      }
    }
  }
}
