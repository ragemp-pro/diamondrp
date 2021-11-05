import { ui } from "../modules/ui";
import { methods } from "../modules/methods";

let rulletPos:{x:number;y:number;z:number} = null;
mp.events.add('server:rullet', () => {
  rulletPos = {...mp.players.local.position};
})
mp.events.add('server:rullet:stop', () => {
  rulletPos = null;
})

mp.events.add("render", () => {
  if(!rulletPos) return;
  ui.drawText3D(methods.distanceToPos(mp.players.local.position, new mp.Vector3(rulletPos.x, rulletPos.y, rulletPos.z)).toFixed(2)+"m.", rulletPos.x, rulletPos.y, rulletPos.z)
  mp.game.graphics.drawLine(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, rulletPos.x, rulletPos.y, rulletPos.z, 255, 0, 0, 255);
})