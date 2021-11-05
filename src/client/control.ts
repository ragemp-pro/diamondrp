import { RAGE_BETA } from "../util/newrage";

mp.events.add('render', () => {
  if(!RAGE_BETA) mp.game.controls.disableControlAction(1, 44, true);
  let veh = mp.players.local.vehicle;
  if(!veh){
    mp.game.controls.disableControlAction(0, 36, true);
  } else {
    if (veh.getClass() == 18){
      mp.game.controls.disableControlAction(0, 86, true);
      mp.game.controls.disableControlAction(0, 81, true);
      mp.game.controls.disableControlAction(0, 82, true);
      mp.game.controls.disableControlAction(0, 85, true);
      mp.game.controls.disableControlAction(0, 80, true);
      mp.game.controls.disableControlAction(0, 19, true);
    }
    if(veh.getVariable("skate")){
      mp.game.controls.disableControlAction(0, 75, true);
    }
    if(veh.doesHaveWeapons()){
      mp.game.controls.disableControlAction(0, 69, true);
      mp.game.controls.disableControlAction(0, 70, true);
      mp.game.controls.disableControlAction(0, 76, true);
      mp.game.controls.disableControlAction(0, 331, true);
      mp.game.controls.disableControlAction(0, 330, true);
      mp.game.controls.disableControlAction(0, 347, true);
      mp.game.controls.disableControlAction(0, 25, true);
      mp.game.controls.disableControlAction(0, 114, true);
    }
  }
  // mp.game.controls.disableControlAction(0, 157, true);
  // mp.game.controls.disableControlAction(0, 158, true);
  // mp.game.controls.disableControlAction(0, 159, true);
  // mp.game.controls.disableControlAction(0, 160, true);
  // mp.game.controls.disableControlAction(0, 161, true);
  // mp.game.controls.disableControlAction(0, 162, true);
  // mp.game.controls.disableControlAction(0, 163, true);
  // mp.game.controls.disableControlAction(0, 164, true);
  // mp.game.controls.disableControlAction(0, 165, true);
  moveX = mp.gui.cursor.position[0] - oldX
  moveY = mp.gui.cursor.position[1] - oldY
  oldX = mp.gui.cursor.position[0]
  oldY = mp.gui.cursor.position[1]
})


let leftKeyPressed = false;
let rightKeyPressed = false;
let oldX = mp.gui.cursor.position[0]
let oldY = mp.gui.cursor.position[1]
let moveX = mp.gui.cursor.position[0]
let moveY = mp.gui.cursor.position[1]

mp.events.add('click', (x:number, y:number, upOrDown: "up" | "down", leftOrRight:"left"|"right", relativeX:number, relativeY:number, worldPosition:number, hitEntity) => {
  if(leftOrRight === "left"){
    leftKeyPressed = upOrDown === "down"
  } else {
    rightKeyPressed = upOrDown === "down"
  }
});

export const mouseMove = (cb:(right:number,down:number,leftKey:boolean,rightKey:boolean)=>void,interval:number = 100) => {
  setInterval(() => {
    if (!leftKeyPressed && !rightKeyPressed) return;
    cb(moveX, moveY, leftKeyPressed, rightKeyPressed);
  }, interval)
}
