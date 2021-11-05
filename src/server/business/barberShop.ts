/// <reference path="../../declaration/server.ts" />

import {methods} from '../modules/methods';
import {business} from '../business';
import { user } from '../user';


export let barberShop = {

  
  list: [[138.7087, -1705.711, 28.29162, 109],[1214.091,-472.9952,65.208,109],[-276.4055,6226.398,30.69552,109],[-1282.688,-1117.432,5.990113,110],[1931.844,3730.305,31.84443,111],[-33.34319,-154.1892,56.07654,48],[-813.5332,-183.2378,36.5689,112]],
  
  loadAll: function() {
      methods.debug('barberShop.loadAll');
      barberShop.list.forEach(function (item) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          methods.createBlip(shopPos, 71, 0, 0.8, 'Парикмахерская');
          methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
      });
  },
  
  getInRadius: function(pos:Vector3Mp, radius = 2) {
    //   methods.debug('barberShop.getInRadius');
      let shopId = -1;
      barberShop.list.forEach(function (item, idx) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(pos, shopPos) < radius)
              shopId = methods.parseInt(item[3]);
      });
      return shopId;
  },
  
  checkPosForOpenMenu: function(player:PlayerMp) {
    //   methods.debug('barberShop.checkPosForOpenMenu');
      try {
          let playerPos = player.position;
          let shopId = barberShop.getInRadius(playerPos, 2);
          if (shopId == -1)
              return;
          //user.unEquipAllWeapons(player)
          if (user.hasAnyWeapon(player)) return player.notify(`~r~Снимите оружие прежде чем посетить барбершоп`)
          player.call('client:menuList:showBarberShopMenu', [shopId]);
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  findNearest: function(pos:Vector3Mp) {
      methods.debug('barberShop.findNearest');
      let prevPos = new mp.Vector3(9999, 9999, 9999);
      barberShop.list.forEach(function (item) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
              prevPos = shopPos;
      });
      return prevPos;
  }
};