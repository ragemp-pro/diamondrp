import { gui } from "./gui";
import { user } from "../user";

let greenzones:{x:number;y:number;z:number;r:number,customd?:boolean}[] = [
  // {x:337.94,y:-1395.91,z:32.51,r:100},
  // {x:-1378.70,y:-512.83,z:31.40,r:50},
  {x:-715.31,y:-1295.16,z:5.10,r:30},
  {x:-261.15,y:-2025.24,z:30.15,r:50},
  {x:-116.84,y:-605.05,z:36.28,r:50},
  {x:-66.51,y:-802.07,z:44.23,r:50},
  // Спавны
  {x:124.8076, y:-1215.845, z:28.33152,r:50},
  {x:1.66987, y:-1225.569, z:28.29525,r:50},
  {x:462.8509, y:-850.47, z:26.12981,r:30},
  ///////////////////////
  {x:359.9,y:-590.07,z:28.23,r:40},
  {x:1692.77,y:2603.04,z:45.56,r:250},
  {x:978.22,y:-3114.71,z:5.90,r:320},
  // {x:-23.83,y:-1666.18,z:29.30,r:40},
  {x:-40.70,y:-1097.67,z:26.42,r:20},
  {x:-94.41,y: 84.65,z:71.67,r:40},
  {x:478.74,y: -107.67,z:62.16,r:50},
  {x:-422.88,y:1135.57,z:325.85,r:100,customd:true},
  {x:-430.16, y:258.72, z:83.01, r:40},
  {x:-552.77, y:272.35, z:83.02, r:30},
  {x:-26.29, y:215.28, z:106.52, r:40},
  {x:128.42, y:-1301.55, z:28.98, r:50},
  {x:470.07, y:-1093.59, z:29.20, r:30},


  {x:454.48, y:-990.5, z:30.69, r:50},
  { x: 135.51, y: -717.06, z: 33.13, r: 60},
  {x:1849.89, y:3688.99, z:34.27, r:30},
  {x:-446.30, y:6010.08, z:31.72, r:40},

  // USMC Garderob savezone
  { x: -2343.30, y: 3264.50, z: 32.83, r:40},

  { x: -527.33, y: -234.79, z: 37.92, r:90},

  { x: -1387.15, y: -623.27, z: 30.82, r:43},

  { x: -1648.79, y: -897.86, z: 8.71, r: 90},
];
let disableSaveZon: { x: number; y: number; z: number; r: number, customd?: boolean }[] = [
  { x: 230.34, y: -878.80, z: 23.87, r: 100.83, customd: true}
]
let greenzonesInt: number[] = [60418, 243201, 237313, 238849, 65026, 275201, 274689, 60674];

let gosdisable = false;
let ingreenzones = false;

export const inGreenZone = () => ingreenzones;

setInterval(() => {
  if(!user.isLogin()) return;
  let blockzone = disableSaveZon.find(item => mp.game.gameplay.getDistanceBetweenCoords(item.x, item.y, item.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true) < item.r && ((mp.players.local.dimension != 0 && item.customd) || (mp.players.local.dimension == 0 && !item.customd)));
  if (blockzone){
    gui.browser.execute(`CEF.hud.setGreenZone(${0});`);
    ingreenzones = false;
    return
  }
  let grzn = greenzones.find(item => mp.game.gameplay.getDistanceBetweenCoords(item.x, item.y, item.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true) < item.r);
  gosdisable = greenzones.find(item => mp.game.gameplay.getDistanceBetweenCoords(item.x, item.y, item.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true) < item.r) ? (greenzones.find(item => mp.game.gameplay.getDistanceBetweenCoords(item.x, item.y, item.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, true) < item.r).customd && mp.players.local.dimension != 0) : false
  
  let grznint = !!greenzonesInt.find(item => mp.game.interior.getInteriorAtCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z) == item);
  let allowCurrentZone = grznint
  if(grzn){
    allowCurrentZone = ((mp.players.local.dimension == 0) || (grzn.customd && mp.players.local.dimension != 0))
  }
  if (ingreenzones == allowCurrentZone) return;
  gui.browser.execute(`CEF.hud.setGreenZone(${(allowCurrentZone) ? 1: 0});`);
  ingreenzones = allowCurrentZone;
  // mp.events.callRemote("client:setInGreenZone", ingreenzones)
}, 2000)


mp.events.add("render", () => {
  if(ingreenzones){
    if((user.isGos() && !user.isEms()) && !gosdisable) return;
    mp.game.controls.disableControlAction(0, 24, true)
    mp.game.controls.disableControlAction(0, 68, true)
    mp.game.controls.disableControlAction(0, 69, true)
    mp.game.controls.disableControlAction(0, 70, true)
    mp.game.controls.disableControlAction(0, 91, true)
    mp.game.controls.disableControlAction(0, 92, true)
    mp.game.controls.disableControlAction(0, 140, true)
    mp.game.controls.disableControlAction(0, 141, true)
    mp.game.controls.disableControlAction(0, 142, true)
    mp.game.controls.disableControlAction(0, 257, true)
  }
})
