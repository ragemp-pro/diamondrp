/// <reference path="../../declaration/server.ts" />

import {methods} from '../modules/methods';
import {business} from '../business';
import {vSync} from '../managers/vSync';
import {user} from '../user';



export let carWash = {
  list: [[-700.0402, -932.4921, 17.34011], [22.56987, -1391.852, 27.91351], [170.6151, -1718.647, 27.88343]],
  
  loadAll: function() {
      methods.debug('carWash.loadAll');
      carWash.list.forEach(function (item) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          methods.createBlip(shopPos, 100, 0, 0.8);
          methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "Нажмите ~g~Е~s~ чтобы воспользоваться", 4, 0, [0, 0, 0, 0]);
      });
  },
  
  getInRadius: function(pos:Vector3Mp, radius = 2) {
    //   methods.debug('carWash.getInRadius');
      let shopId = -1;
      carWash.list.forEach(function (item, idx) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(pos, shopPos) < radius)
              shopId = methods.parseInt(item[0]);
      });
      return shopId;
  },
  
  checkPosForOpenMenu: function(player:PlayerMp) {
    //   methods.debug('carWash.checkPosForOpenMenu');
      try {
          let playerPos = player.position;
          let shopId = carWash.getInRadius(playerPos, 2);
          if (shopId == -1)
              return;
          if (player.vehicle) {
              if (user.getCashMoney(player) < 100) {
                  player.notify('~r~Необходимо иметь 100$ для того чтобы помыть ТС');
                  return;
              }
              user.showLoadDisplay(player);
              setTimeout(function () {
                  if(!user.isLogin(player)) return;
                  if(!player.vehicle) return;
  
                  user.removeCashMoney(player, 100);
                  business.addMoney(113, 100);
  
                  vSync.setVehicleDirt(player.vehicle, 0);
  
                  player.notify('~g~Ваш транспорт теперь чист');
                  player.notify('~g~Стоимость услуги:~s~ $51');
  
                  setTimeout(function () {
                    if(!user.isLogin(player)) return;
                    user.hideLoadDisplay(player);
                  }, 500);
              }, 500);
          }
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  findNearest: function(pos:Vector3Mp) {
      methods.debug('shop.findNearest');
      let prevPos = new mp.Vector3(9999, 9999, 9999);
      carWash.list.forEach(function (item) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
              prevPos = shopPos;
      });
      return prevPos;
  }
};