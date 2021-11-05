import * as helpers from './index';

class Quaternion {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  w: number = 0;

  constructor(x?: number|{x: number, y: number, z: number, w: number}, y?: number, z?: number, w?: number) {
    if (typeof x === 'object') {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
      this.w = x.w || 0;
    } else {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.w = w || 0;
    }
  }

  slerp(qb: Quaternion, t: number) {
    return Quaternion.slerp(this, qb, t);
  }

  static slerp(qa: Quaternion, qb: Quaternion, t: number): Quaternion {
    const qm = new Quaternion();

    const cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;

    if (Math.abs(cosHalfTheta) >= 1.0) {
      qm.w = qa.w;
      qm.x = qa.x;
      qm.y = qa.y;
      qm.z = qa.z;
      return qm;
    }

    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta*cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
      qm.w = (qa.w * 0.5 + qb.w * 0.5);
      qm.x = (qa.x * 0.5 + qb.x * 0.5);
      qm.y = (qa.y * 0.5 + qb.y * 0.5);
      qm.z = (qa.z * 0.5 + qb.z * 0.5);
      return qm;
    }

    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    qm.w = (qa.w * ratioA + qb.w * ratioB);
    qm.x = (qa.x * ratioA + qb.x * ratioB);
    qm.y = (qa.y * ratioA + qb.y * ratioB);
    qm.z = (qa.z * ratioA + qb.z * ratioB);

    return qm;
  }

  fromEuler(vector: Vector3Mp) {
    const qa = Quaternion.fromEuler(vector);

    this.x = qa.x;
    this.y = qa.y;
    this.z = qa.z;
    this.w = qa.w;

    return this;
  }

  static fromEuler(vector: Vector3Mp): Quaternion {
    const qm = new Quaternion();

    let {
      x: roll,
      y: pitch,
      z: yaw
    } = vector;

    pitch = helpers.toRad(helpers.normalizeAngle(pitch));
    roll = helpers.toRad(helpers.normalizeAngle(roll));
    yaw = helpers.toRad(helpers.normalizeAngle(yaw));

    qm.x = Math.sin(roll / 2) * Math.cos(pitch / 2) * Math.cos(yaw / 2) - Math.cos(roll / 2) * Math.sin(pitch / 2) * Math.sin(yaw / 2);
    qm.y = Math.cos(roll / 2) * Math.sin(pitch / 2) * Math.cos(yaw / 2) + Math.sin(roll / 2) * Math.cos(pitch / 2) * Math.sin(yaw / 2);
    qm.z = Math.cos(roll / 2) * Math.cos(pitch / 2) * Math.sin(yaw / 2) - Math.sin(roll / 2) * Math.sin(pitch / 2) * Math.cos(yaw / 2);
    qm.w = Math.cos(roll / 2) * Math.cos(pitch / 2) * Math.cos(yaw / 2) + Math.sin(roll / 2) * Math.sin(pitch / 2) * Math.sin(yaw / 2);

    return qm;
  }

  toEuler() {
    // (x, y, z, w) = (q[0], q[1], q[2], q[3])

    const Rx = Math.atan2(2 * (this.x * this.y + this.z * this.w), 1 - (2 * (this.y * this.y + this.z * this.z)));
    const Ry = Math.asin(2 * (this.x * this.y - this.w * this.y));
    const Rz = Math.atan2(2 * (this.x * this.w + this.y * this.z), 1 - (2  * (this.z * this.z + this.w * this.w)));

    // const t0 = +2.0 * (w * x + y * z)
    // t1 = +1.0 - 2.0 * (x * x + y * y)
    // roll = math.atan2(t0, t1)
    // t2 = +2.0 * (w * y - z * x)
    // t2 = +1.0 if t2 > +1.0 else t2
    // t2 = -1.0 if t2 < -1.0 else t2
    // pitch = math.asin(t2)
    // t3 = +2.0 * (w * z + x * y)
    // t4 = +1.0 - 2.0 * (y * y + z * z)
    // yaw = math.atan2(t3, t4)
    // return [yaw, pitch, roll]

    return new mp.Vector3(
      Rx,
      Ry,
      Rz
    );
  }
}

export default Quaternion;
