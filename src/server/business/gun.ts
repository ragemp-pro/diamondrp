/// <reference path="../../declaration/server.ts" />

import { business } from '../business';
import { methods } from '../modules/methods';
import {user} from '../user';
import {items} from '../items';
import {inventory} from '../inventory';


export let gun = {

  list: [[22.08832,-1106.986,29.79703,75],[252.17,-50.08245,69.94106,76],[842.2239,-1033.294,28.19486,77],[-661.947,-935.6796,21.82924,78],[-1305.899,-394.5485,36.69577,79],[809.9118,-2157.209,28.61901,102],[2567.651,294.4759,107.7349,103],[-3171.98,1087.908,19.83874,104],[-1117.679,2698.744,17.55415,105],[1693.555,3759.9,33.70533,106],[-330.36,6083.885,30.45477,107]],
  
  loadAll: function() {
      methods.debug('gun.loadAll');
      gun.list.forEach(function (item) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2] - 1);
          methods.createBlip(shopPos, 110, 0, 0.8);
          methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
      });
  },
  
  getInRadius: function(pos:Vector3Mp, radius = 2) {
    //   methods.debug('gun.getInRadius');
      let shopId = -1;
      gun.list.forEach(function (item, idx) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(pos, shopPos) < radius)
              shopId = methods.parseInt(item[3]);
      });
      return shopId;
  },
  
  checkPosForOpenMenu: function(player:PlayerMp) {
    //   methods.debug('gun.checkPosForOpenMenu');
      try {
          let playerPos = player.position;
          let shopId = gun.getInRadius(playerPos, 2);
          if (shopId == -1)
              return;
          player.call('client:menuList:showGunShopMenu', [shopId, business.getPrice(shopId)]);
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  findNearest: function(pos:Vector3Mp) {
      methods.debug('gun.findNearest');
      let prevPos = new mp.Vector3(9999, 9999, 9999);
      gun.list.forEach(function (item,) {
          let shopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
              prevPos = shopPos;
      });
      return prevPos;
  },
  
  buy: function(player:PlayerMp, itemId:number, price:number, count:number, shopId:number) {
      methods.debug('gun.buy');
  
      if (!user.isLogin(player))
          return;
  
      if (user.getMoney(player) < price) {
          player.notify('~r~У вас недостаточно средств');
          return;
      }
  
      if (price < 1)
          return;
  
          if (inventory.currentAmount(1, user.getId(player)) + items.getItemAmountById(itemId) > inventory.maxAmount(1, user.getId(player))) {
            player.notify('~r~Инвентарь заполнен');
            return;
        }
  
      switch (itemId) {
          case 27:
          case 28:
          case 29:
          case 30:
          case 146:
          case 147:
          case 148:
          case 149:
          case 150:
          case 151:
          case 152:
          case 153:
              
              inventory.addItem(player, itemId, 1, 1, user.getId(player), count, -1, -1, -1);
              player.notify('~g~Вы купили товар по цене: ~s~$' + price);
              user.removeMoney(player, price);
              business.addMoney(shopId, price);
              inventory.updateAmount(player, user.getId(player), 1);
              user.log(player, "PlayerBuy", `Покупка в оружейном магазине за $${price} ${items.getItemNameById(itemId)}`)
              break;
          default:
              inventory.addItem(player, itemId, 1, 1, user.getId(player), 1, -1, -1, -1);
              player.notify('~g~Вы купили товар по цене: ~s~$' + price);
              user.removeMoney(player, price);
              business.addMoney(shopId, price);
              inventory.updateAmount(player, user.getId(player), 1);
              user.log(player, "PlayerBuy", `Покупка в оружейном магазине за ${price} ${items.getItemNameById(itemId)}`)
              break;
      }
  }
};