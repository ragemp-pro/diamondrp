/// <reference path="../../declaration/client.ts" />

import { user } from "../user";
import { methods } from "./methods";
import { doorsData } from "../../util/doors";

export {};
let doors: {
  [id: string]: {
    offset: number;
    mystatus: boolean;
    hash: string|number;
    x: number;
    y: number;
    z: number;
    locked: boolean;
    key: string;
    permission: string;
    name: string;
    pair?: number;
  };
} = { ...doorsData};
let pashaDoebalsyaDoImeni = false;
const player = mp.players.local;
mp.events.add({
  sendDoorsList: (list: string) => {
    if(pashaDoebalsyaDoImeni) return;
    let data: [string, boolean][] = JSON.parse(list);
    data.map(item => {
      doors[item[0]].locked = item[1];
    })
    pashaDoebalsyaDoImeni = true;
  },
  sendDoorState: (id: string, status: boolean) => {
    if(!pashaDoebalsyaDoImeni) return;
    if(!doors[id]) return;
    doors[id].locked = status;
  },
});

function doorSync(){
  if(!pashaDoebalsyaDoImeni) return;
  let pos = player.position;
  for (let id in doors) {
    // try {
      let data = doors[id];
      if(!data) return;
      if(typeof data.hash == "string") data.hash = mp.game.joaat(data.hash);
      if (
        data && mp.game.gameplay.getDistanceBetweenCoords(pos.x, pos.y, pos.z, data.x, data.y, data.z, true) <
        100
      ) {
  
        if(mp.game.object.getClosestObjectOfType(
          data.x,
          data.y,
          data.z,
          20.0,
          data.hash,
          false,
          false,
          false
        ) == 0) return;
  
        let door = mp.game.object.getStateOfClosestDoorOfType(
          data.hash,
          data.x,
          data.y,
          data.z,
          0,
          0
        );
        
        if(!door) return;
        let locked = door.locked ? true : false;
        if (locked != data.locked && (locked || (!locked && door.heading > -0.15 && door.heading < 0.15))) {
          mp.game.object.setStateOfClosestDoorOfType(
            data.hash,
            data.x,
            data.y,
            data.z,
            data.locked,
            0,
            false
          );
        }
      }
    // } catch (error) {
    //   methods.debug(error)
    // }
  }
}

function explodeSync() {
  let pos = player.position;
  models.forEach(([x,y,z,hash,exploded,ent], index) => {
    if (hash == 3309500160){
      if (mp.game.gameplay.getDistanceBetweenCoords(pos.x, pos.y, pos.z, x, y, z, true) < 100){
        if (exploded){
          if (mp.objects.exists(models[index][5])){
            models[index][5].rotation.z = 115
            models[index][5].setRotation(models[index][5].rotation.x, models[index][5].rotation.y, 115, 2, true)
          } else {
            models[index][5] = mp.objects.new(mp.game.joaat('p_fin_vaultdoor_s'), new mp.Vector3(997.4622, 29.38926, 73.29401), {
              rotation: new mp.Vector3(0.000, 0.000, 115)
            })
          }
        } else {
          if (!mp.objects.exists(models[index][5])){
            models[index][5] = mp.objects.new(mp.game.joaat('p_fin_vaultdoor_s'), new mp.Vector3(997.4622, 29.38926, 73.29401), {
              rotation: new mp.Vector3(0.000, 0.000, 335.000)
            })
          } else {
            models[index][5].rotation.z = 335
            models[index][5].setRotation(models[index][5].rotation.x, models[index][5].rotation.y, 335, 2, true)
          }
        }
      } else {
        if (mp.objects.exists(models[index][5])) models[index][5].destroy();
      }
    } else if(mp.game.gameplay.getDistanceBetweenCoords(pos.x, pos.y, pos.z, x, y, z, true) < 100){
      if (hash == 2121050683){
        let obj = mp.game.object.getClosestObjectOfType(
          x,
          y,
          z,
          20.0,
          hash,
          false,
          false,
          false
        )
        if(exploded){
          // 
          mp.game.invoke("0x1A9205C1B9EE827F", obj, false, false)
          // mp.game.invoke("0x428CA6DBD1094446", obj, true)
          mp.game.invoke("0xEA1C610A04DB6BBB", obj, false, 0)
        } else {
          mp.game.invoke("0x1A9205C1B9EE827F", obj, true, true)
          // mp.game.invoke("0x428CA6DBD1094446", obj, false)
          mp.game.invoke("0xEA1C610A04DB6BBB", obj, true, 0)
        }
        mp.game.object.deleteObject(obj)
      } else {
        mp.game.object.setStateOfClosestDoorOfType(
          hash,
          x,
          y,
          z,
          true,
          exploded ? 90 : 0, 
          false
        );
      }
    }
  })
}

setInterval(function() {
  doorSync()
  explodeSync()
}, 1000);

let models:[number,number,number,number,boolean,ObjectMp][] = []

mp.events.add('client:openDoorExplode', (x: number, y: number, z: number, hash: number) => {
  const itm = models.find(itm => (mp.game.gameplay.getDistanceBetweenCoords(itm[0], itm[1], itm[2], x ,y ,z, true) < 10 && itm[3] == hash))
  if(!itm) return;
  itm[4] = true;
  if(mp.game.gameplay.getDistanceBetweenCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, x ,y ,z, true) > 150) return;
  mp.game.fire.addExplosion(x, y, z, 2, 20, false, false, 0);
  mp.game.audio.playSoundFromCoord(-1, "Jet_Explosions", x, y, z, "exile_1", false, 0, false);
  explodeSync()

});
mp.events.add('client:openDoorRestore', (x: number, y: number, z: number, hash: number) => {
  const itm = models.find(itm => (mp.game.gameplay.getDistanceBetweenCoords(itm[0], itm[1], itm[2], x ,y ,z, true) < 10 && itm[3] == hash))
  if(!itm) return
  itm[4] = false;
  explodeSync()
});
mp.events.add('client:explodeDoorsAll', (data:string) => {
  models = JSON.parse(data);
  models.forEach(itm => {
    if (itm[3] == 3309500160){
      mp.game.entity.createModelHide(itm[0], itm[1], itm[2], 20, mp.game.joaat('p_fin_vaultdoor_s'), true);
    }
    itm[4] = false;
  })
});