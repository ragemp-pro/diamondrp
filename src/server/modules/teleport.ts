/// <reference path="../../declaration/server.ts" />

import teleportjson from '../config/teleport';
import {menu} from '../modules/menu';
import { user } from '../user';
import { methods } from './methods';

teleportjson.forEach(element => {
  element.points.map((pos, posid) => {
    if(element.oneway && posid != 0) return;
    methods.createDynamicCheckpoint(new mp.Vector3(pos[0], pos[1], (pos[2]-1)), "Нажмите ~g~E~w~ чтобы открыть "+element.name, player => {
      if(element.oneway){
        let pos = <number[]> element.points[1];
        if(pos[5]){
          let handle:(player:PlayerMp)=>boolean = <any>pos[6];
          if(!handle(player)) return;
        }
        user.teleport(player, pos[0], pos[1], pos[2]);
        return;
      }
      let item = menu.new(player, !element.sprite ? element.name : "", "Список");
      if(element.sprite) item.sprite = element.sprite;
      element.points.forEach((tp) => {
        if(player.dist(new mp.Vector3(tp[0], tp[1], tp[2])) > 3 || element.nocheckdist){
          item.newItem({
            name: (typeof tp[5] == "string") ? <string>tp[5] : tp[5](player),
            onpress: async () => {
              if(tp[6]){
                if(!tp[6](player)){
                  if(user.isAdminNow(player, 3)){
                    let askadm = await user.accept(player, "Войти как админ?");
                    if(!askadm) return;
                  } else return;
                }
              }
              if (element.allowveh && player.vehicle){
                if (!user.isDriver(player)) return player.notify(`~r~Вы должны быть за рулём`)
                user.teleportVeh(player, tp[0], tp[1], tp[2]+0.5)
                if (tp[3]){
                  player.vehicle.rotation.z = tp[3]
                }
                if (tp.length >= 5){
                  player.vehicle.dimension = tp[4]
                  player.vehicle.getOccupants().map(target => {
                    target.dimension = tp[4];
                  })
                }
              } else {
                const oldpos = {...player.position}
                const oldd = player.dimension
                user.teleport(player, tp[0], tp[1], tp[2], tp[3]);
                setTimeout(() => {
                  if(!mp.players.exists(player)) return;
                  if (methods.distanceToPos2D(player.position, new mp.Vector3(tp[0], tp[1], tp[2])) < 3){
                    if (tp[2] - player.position.z > 3){
                      user.teleport(player, oldpos.x, oldpos.y, oldpos.z);
                      player.dimension = oldd;
                      user.bigAlert(player, 'Вероятно у вас не загружен интерьер. Вам необходимо перезайти полностью в игру', 'error', 10000);
                    }
                  }
                }, 3000)
                player.heading = tp[3];
                if(tp.length >= 5) player.dimension = tp[4];
              }
            }
          })
        }
      })
      item.open()
    }, 1, pos[4] ? pos[4] : 0)
  })
})