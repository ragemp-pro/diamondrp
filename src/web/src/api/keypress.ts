
export let keysPressed:{[keycode:number]:boolean} = {};
export const keypressCheck = {
  shift: () => !!keysPressed[16]
}
window.onkeyup = function(e) {
  keysPressed[e.keyCode] = false;
};
window.onkeydown = function(e) {
  keysPressed[e.keyCode] = true;
};

