/// <reference path="../../declaration/client.ts" />

import { gui } from "./gui";
import { methods } from "./methods";



let npcDialogList:Map<number,clientNpcDialog> = new Map();

mp.events.add("dialog:sendlist:npc", (data:clientNpcDialog[]) => {
  data.forEach(item => npcDialogList.set(item.id, item));
  const position = mp.players.local.position;
  npcDialogList.forEach(item => {
    item.ped = mp.peds.new(mp.game.joaat(item.model), item.position, item.heading, item.dimension);
    item.ped.npcDialog = item.id;
  })
})
mp.events.add("dialog:sendnew:npc", (item:clientNpcDialog) => npcDialogList.set(item.id, item));
mp.events.add("dialog:delete:npc", (id:number) => {
  if(!npcDialogList.has(id)) return;
  let npc = npcDialogList.get(id);
  if(npc.ped) npc.ped.destroy();
  npcDialogList.delete(id)
});

/** Параметр дистанции создания */
let distanceForCreate = 500;

// setInterval(() => {
  
// }, 1000);

mp.events.add("npc:close", () => gui.setGui(null))



setTimeout(() => {
  mp.events.register('npc:vehicle:road', (modelped:string,modelveh:string,startpos:Vector3Mp,heading:number,endpos:Vector3Mp) => {
    return new Promise((resolve) => {
      let vehicle = mp.vehicles.new(mp.game.joaat(modelveh), startpos, {
        heading
      });
      let q = setInterval(() => {
        if(vehicle.getHeading() - methods.parseFloat(heading) < -3 || vehicle.getHeading() - methods.parseFloat(heading) > 3) vehicle.setHeading(methods.parseFloat(heading))
      }, 100)

      let ped = mp.peds.new(mp.game.joaat(modelped), startpos, 0);
      ped.setCollision(false, false);
      
      let a = setInterval(() => {
        if(!ped){
          ped = mp.peds.new(mp.game.joaat(modelped), vehicle.position, 0);
          ped.setCollision(false, false);
        }
        if(vehicle.getSpeed() < 3){
          mp.game.invoke(methods.TASK_ENTER_VEHICLE, ped.handle, vehicle.handle, 3, -1, 0, 16);
          mp.game.invoke("0x158BB33F920D360C", ped.handle, vehicle.handle, endpos.x, endpos.y, endpos.z, 30 / 2.2, 786603, 5);
        }
        let distance = mp.game.gameplay.getDistanceBetweenCoords(endpos.x, endpos.y, endpos.z, vehicle.position.x, vehicle.position.y, vehicle.position.z, false);
        if(distance < 5){
          clearInterval(q);
          clearInterval(a);
          resolve(true);
        }
      }, 1000)
    })

  })
}, 1000)