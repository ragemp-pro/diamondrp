export const vdist = (v1: Vector3Mp, v2: Vector3Mp, useZ: boolean = true) => {
  const diffY = v1.y - v2.y;
  const diffX = v1.x - v2.x;

  if (useZ) {
    const diffZ = v1.z - v2.z;
    return Math.sqrt((diffY * diffY) + (diffX * diffX) + (diffZ * diffZ));
  } else {
    return Math.sqrt((diffY * diffY) + (diffX * diffX));
  }
};

export const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

export const calculateAttachPosition = (position: Vector3Mp, rotation: Vector3Mp, offset: Vector3Mp): Vector3Mp => {
  const _rotation = new mp.Vector3(rotation.x / 180 * Math.PI, rotation.y / 180 * Math.PI, rotation.z / 180 * Math.PI);
  const cos_rx = Math.cos(_rotation.x);
  const cos_ry = Math.cos(_rotation.y);
  const cos_rz = Math.cos(_rotation.z);
  const sin_rx = Math.sin(_rotation.x);
  const sin_ry = Math.sin(_rotation.y);
  const sin_rz = Math.sin(_rotation.z);

  return new mp.Vector3(
    position.x + offset.x * cos_ry * cos_rz - offset.x * sin_rx * sin_ry * sin_rz - offset.y * cos_rx * sin_rz + offset.z * sin_ry * cos_rz + offset.z * sin_rx * cos_ry * sin_rz,
    position.y + offset.x * cos_ry * sin_rz + offset.x * sin_rx * sin_ry * cos_rz + offset.y * cos_rx * cos_rz + offset.z * sin_ry * sin_rz - offset.z * sin_rx * cos_ry * cos_rz,
    position.z - offset.x * cos_rx * sin_ry + offset.y * sin_rx + offset.z * cos_rx * cos_ry
  );
};
