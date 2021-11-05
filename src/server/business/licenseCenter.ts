/// <reference path="../../declaration/server.ts" />


import { methods } from '../modules/methods';
import { pickups } from '../modules/pickups';
import { coffer } from '../coffer';
import { user } from '../user';



export let licenseCenter = {
  checkPosForOpenMenu: function (player:PlayerMp) {
    //   methods.debug('licenseCenter.checkPosForOpenMenu');
      let playerPos = player.position;
      if(methods.distanceToPos(playerPos, pickups.LicBuyPos) < 2.0){
          player.call('client:menuList:showLicBuyMenu');
      }
  },
  
  buy: function(player:PlayerMp, type:any, price:number)
  {
      methods.debug('licenseCenter.buy');
      if (!user.isLogin(player))
          return;
  
      if (price < 1)
          return;
  
      try {
          if (user.get(player, 'reg_status') == 0)
          {
              player.notify('~r~У Вас нет регистрации');
              player.notify('~r~(M - GPS - Важные места - Здание правительства)');
              return;
          }
  
          if (!user.get(player, type))
          {
              if (user.getMoney(player) < price)
              {
                  player.notify("~r~У Вас недостаточно средств");
                  return;
              }
              user.set(player, type, true);
              user.removeMoney(player, price);
              coffer.addMoney(price);
  
              player.notify("~g~Поздравляем с покупкой лицензии");
              return;
          }
          player.notify("~r~У вас уже есть данная лицензия");
      }
      catch (e) {
          methods.debug('Exception: licenseCenter.buy');
          methods.debug(e);
      }
  }
};
