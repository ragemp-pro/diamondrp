/// <reference path="../../declaration/server.ts" />

import {enums} from '../enums';
import {methods} from '../modules/methods';
import {user} from '../user';
import {business} from '../business';

let shopList = enums.shopList;

export let cloth = {
  maskShop: new mp.Vector3(-1337.255, -1277.948, 3.872962),
    findNearest: function (pos: Vector3Mp) {
        methods.debug('shop.findNearest');
        let prevPos = new mp.Vector3(9999, 9999, 9999);
        shopList.forEach(function (item) {
            let shopPos = new mp.Vector3(item[3], item[4], item[5]);
            if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
                prevPos = shopPos;
        });
        return prevPos;
    },
  loadAll: function(){
      methods.debug('barberShop.loadAll');
  
      methods.createBlip(cloth.maskShop, 362, 0, 0.8, 'Магазин масок');
      methods.createStaticCheckpoint(cloth.maskShop.x, cloth.maskShop.y, cloth.maskShop.z, "Нажмите ~g~E~s~ чтобы открыть меню магазина", 0.8, -1, [33, 150, 243, 100], 0.3);
  
      try {
          for (let i = 0; i < shopList.length; i++) {
            let pos = new mp.Vector3(shopList[i][3], shopList[i][4], shopList[i][5]);
            let shopId = shopList[i][1];
            let shopType = shopList[i][0];
            let type = shopList[i][2];
  
              if (type == 0) {
                  switch (shopType) {
                      case 0:
                          methods.createBlip(pos, 73, 68, 0.8, 'Магазин одежды "Discount Store"');
                          break;
                      case 1:
                          methods.createBlip(pos, 73, 0, 0.8, 'Магазин одежды "Suburban"');
                          break;
                      case 2:
                          methods.createBlip(pos, 73, 21, 0.8, 'Магазин одежды "Ponsonbys"');
                          break;
                      case 3:
                          methods.createBlip(pos, 73, 73, 0.8, 'Магазин одежды "AmmoNation"');
                          break;
                      case 4:
                          methods.createBlip(pos, 617, 0, 0.8, 'Ювелирный магазин');
                          break;
                      case 5:
                          methods.createBlip(pos, 73, 81, 0.8, 'Магазин одежды "Binco"');
                          break;
                  }
              }
  
              methods.createStaticCheckpoint(pos.x, pos.y, pos.z, "Нажмите ~g~E~s~ чтобы открыть меню магазина", 0.8, -1, [33, 150, 243, 100], 0.3);
          }
      } catch (e) {
          console.log(e);
          throw e;
      }
  },
  
  checkPosForOpenMenu: function (player:PlayerMp) {
    //   methods.debug('barberShop.checkPosForOpenMenu');
      try {
          let playerPos = player.position;
  
          if (methods.distanceToPos(cloth.maskShop, playerPos) < 2) {
              player.call('client:menuList:showShopMaskMenu', [74]);
              return;
          }
  
          for (let i = 0; i < shopList.length; i++){
              if(methods.distanceToPos(playerPos, new mp.Vector3(shopList[i][3], shopList[i][4], shopList[i][5])) < 2.0){
                  player.call('client:menuList:showShopClothMenu', [shopList[i][1], shopList[i][0], shopList[i][2]]);
                  return;
              }
          }
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  changeProp: function (player:PlayerMp, body:number, clothId:number, color:number) {
    //   methods.debug('barberShop.changeProp');
      try {
          user.setProp(player, body, clothId, color);
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  buyProp: function (player:PlayerMp, price:number, body:number, clothId:number, color:number, shopId:number, isFree:boolean) {
      methods.debug('barberShop.buyProp');
  
      if (price < 1)
          return;
  
      if (!user.isLogin(player))
          return;
  
      if (user.getCashMoney(player) < price && !isFree) {
          player.notify('~r~У Вас недостаточно денег');
          user.updateCharacterCloth(player);
          return;
      }
  
      switch (body) {
          case 0:
              user.set(player, 'hat', clothId);
              user.set(player, 'hat_color', color);
              break;
          case 1:
              user.set(player, 'glasses', clothId);
              user.set(player, 'glasses_color', color);
              break;
          case 2:
              user.set(player, 'ear', clothId);
              user.set(player, 'ear_color', color);
              break;
          case 6:
              user.set(player, 'watch', clothId);
              user.set(player, 'watch_color', color);
              break;
          case 7:
              user.set(player, 'bracelet', clothId);
              user.set(player, 'bracelet_color', color);
              break;
      }
  
      if (!isFree) {
          user.removeCashMoney(player, price);
          business.addMoney(shopId, price);
          player.notify("~g~Вы купили аксессуар");
          user.log(player, "PlayerBuy", `Покупка аксессуара за ${price}`)
      }
  
      user.updateCharacterCloth(player);
      user.setProp(player, body, clothId, color);
  },
  
  change: function (player:PlayerMp, body:number, cloth:number, color:number, torso:number, torsoColor:number, parachute:number, parachuteColor:number) {
    //   methods.debug('barberShop.change');
      if (body == 11)
      {
          if (torso == -1) torso = 0;
          if (torsoColor == -1) torsoColor = 0;
          if (parachuteColor == -1) parachuteColor = 240;
          if (parachuteColor != 240) parachuteColor++;
  
          user.setComponentVariation(player, 3, torso, torsoColor);
          user.setComponentVariation(player, 8, parachute, parachuteColor);
      }
      user.setComponentVariation(player, body, cloth, color);
  },
  
  buy: function (player:PlayerMp, price:number, body:number, cloth:number, color:number, torso:number, torsoColor:number, parachute:number, parachuteColor:number, shopId = 0, isFree = false) {
      methods.debug('barberShop.buy', JSON.stringify({price, body, cloth, color, torso, torsoColor, parachute, parachuteColor, shopId, isFree}));
      if (!user.isLogin(player))
          return;
      if (user.getCashMoney(player) < price && !isFree) {
          player.notify('~r~У Вас недостаточно денег');
          user.updateCharacterCloth(player);
          return;
      }
  
      if (price < 1)
          return;
  
      switch (body) {
          case 1:
              user.set(player, 'mask', cloth);
              user.set(player, 'mask_color', color);
              break;
          case 4:
              user.set(player, 'leg', cloth);
              user.set(player, 'leg_color', color);
              break;
          case 5:
              user.set(player, 'hand', cloth);
              user.set(player, 'hand_color', color);
              break;
          case 6:
              user.set(player, 'foot', cloth);
              user.set(player, 'foot_color', color);
              break;
          case 7:
              user.set(player, 'accessorie', cloth);
              user.set(player, 'accessorie_color', color);
              break;
          case 10:
              user.set(player, 'decal', cloth);
              user.set(player, 'decal_color', color);
              break;
          case 11:
  
              if (torso == -1) torso = 0;
              if (torsoColor == -1) torsoColor = 0;
              if (parachuteColor == -1) parachuteColor = 240;
              if (parachuteColor != 240) parachuteColor++;
  
              user.set(player, 'body', cloth);
              user.set(player, 'body_color', color);
  
              user.set(player, 'torso', torso);
              user.set(player, 'torso_color', torsoColor);
              user.setComponentVariation(player, 3, torso, torsoColor);
  
              user.set(player, 'parachute', parachute);
              user.set(player, 'parachute_color', parachuteColor);
  
              user.set(player, 'tprint_c', '');
              user.set(player, 'tprint_o', '');
              user.setComponentVariation(player, 8, parachute, parachuteColor);
              break;
      }
  
      if (!isFree) {
          user.removeCashMoney(player, price);
          business.addMoney(shopId, price);
          player.notify("~g~Вы купили одежду");
          user.completeQuest(player, "Будь модным", true)
          user.log(player, "PlayerBuy", `Покупка одежды за ${price}`)
      }
  
      user.updateCharacterCloth(player);
      user.setComponentVariation(player, body, cloth, color);
  },
  
  changeMask: function (player:PlayerMp, clothId:number, color:number) {
      methods.debug('barberShop.buy');
      if (!user.isLogin(player))
          return;
      user.setComponentVariation(player, 1, clothId, color);
  },
  
  buyMask: function (player:PlayerMp, price:number, clothId:number, color:number, shopId:number) {
      methods.debug('barberShop.buy');
      if (!user.isLogin(player))
          return;
  
      if (price > 10) {
          if (user.getCashMoney(player) < price) {
              player.notify('~r~У Вас недостаточно денег');
              user.updateCharacterCloth(player);
              return;
          }
      }
  
      if (price < 1)
          return;
  
      user.set(player, 'mask', clothId);
      user.set(player, 'mask_color', color);
  
      user.updateCharacterCloth(player);
      user.setComponentVariation(player, 1, clothId, color);
  
      if (shopId == 0)
          return;
      user.removeCashMoney(player, price);
      business.addMoney(shopId, price);
      player.notify("~g~Вы купили маску");
  }
};
