export function pointingAt(distance:number = 5) {
  const camera = mp.cameras.new("gameplay"); // gets the current gameplay camera

  let position = camera.getCoord(); // grab the position of the gameplay camera as Vector3

  let direction = camera.getDirection(); // get the forwarding vector of the direction you aim with the gameplay camera as Vector3

  let farAway = new mp.Vector3((direction.x * distance) + (position.x), (direction.y * distance) + (position.y), (direction.z * distance) + (position.z)); // calculate a random point, drawn on a invisible line between camera position and direction (* distance)

  let result = mp.raycasting.testPointToPoint(position, farAway, [1, 16]); // now test point to point

  return result; // and return the result ( undefined, if no hit )
}