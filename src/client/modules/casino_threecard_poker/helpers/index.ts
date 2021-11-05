export const lerpVector3 = (vector1: Vector3Mp, vector2: Vector3Mp, deltaTime: number) => {
  return new mp.Vector3(
    (1 - deltaTime) * vector1.x + deltaTime * vector2.x,
    (1 - deltaTime) * vector1.y + deltaTime * vector2.y,
    (1 - deltaTime) * vector1.z + deltaTime * vector2.z
  );
};

export const toRad = (value: number) => value / 180 * Math.PI;

export const normalizeAngle = (angle: number) => {
  let newAngle = angle;

  while (newAngle <= -180) {
    newAngle += 360;
  }

  while (newAngle > 180) {
    newAngle -= 360;
  }

  return newAngle;
};

export const getObjectOffsetFromCoords = (v: Vector3Mp, heading: number, offset: Vector3Mp) => mp.game.object.getObjectOffsetFromCoords(v.x, v.y, v.z, heading, offset.x, offset.y, offset.z);
