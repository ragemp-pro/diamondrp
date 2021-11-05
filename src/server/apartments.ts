/// <reference path="../declaration/server.ts" />

import {Container} from './modules/data';
import {methods} from './modules/methods';
import {user} from './user';
import {coffer} from './coffer';
import {enums} from './enums';
import { apartmentEntity } from './modules/entity/apartmentEntity';

export let apartments = {
    loadAll: function() {
        methods.debug('apartments.loadAll');
        apartmentEntity.findAll().then(rows => {
            rows.forEach(function (item) {
    
                Container.Set(-100000 + methods.parseInt(item.id), 'id', item.id);
                Container.Set(-100000 + methods.parseInt(item.id), 'user_id', item.user_id);
                Container.Set(-100000 + methods.parseInt(item.id), 'user_name', item.user_name);
                Container.Set(-100000 + methods.parseInt(item.id), 'price', item.price);
                Container.Set(-100000 + methods.parseInt(item.id), 'build_id', item.build_id);
                Container.Set(-100000 + methods.parseInt(item.id), 'floor', item.floor);
                Container.Set(-100000 + methods.parseInt(item.id), 'interior_id', item.interior_id);
                Container.Set(-100000 + methods.parseInt(item.id), 'pin', item.pin);
                Container.Set(-100000 + methods.parseInt(item.id), 'is_exterior', item.is_exterior);
            });
            methods.debug('All apartments Loaded: ' + rows.length);
        })
  },
  
  getApartData: function(id:number) {
      methods.debug('apartments.getApartData');
      return Container.GetAll(-100000 + methods.parseInt(id));
  },

  get: function(id:number, key:any) {
    return Container.Get(-100000 + methods.parseInt(id), key);
  },

  getPin(id:number):number{
      return Container.Get(-100000 + methods.parseInt(id), 'pin');
  },
  
  getInteriorCoords: function(id:number, isEx:boolean) {
      methods.debug('apartments.getInteriorCoords');
      return isEx ? new mp.Vector3(enums.apartIntData[id][0], enums.apartIntData[id][1], enums.apartIntData[id][2]) : new mp.Vector3(enums.houseIntData[id][0], enums.houseIntData[id][1], enums.houseIntData[id][2]);
  },

  getOwnerId: (id:number):number => {
    return Container.Get(-100000 + id, "user_id")
  },
  
  updateOwnerInfo: function (id:number, userId:number, userName:string) {
      methods.debug('apartments.updateOwnerInfo');
      id = methods.parseInt(id);
      userId = methods.parseInt(userId);
      Container.Set(-100000 + id, "user_name", userName);
      Container.Set(-100000 + id, "user_id", userId);
      if(userId == 0){
          apartmentEntity.update({
              pin: 0,
              money_tax: 0,
              user_name: userName,
              user_id: userId,
          }, { where: { id: id}})
          Container.Set(-100000 + id, "pin", 0);
      } else {
          apartmentEntity.update({
              money_tax: 0,
              user_name: userName,
              user_id: userId,
          }, { where: { id: id } })
      }
  },
  
  updatePin: function (id:number, pin:number) {
      methods.debug('apartments.updatePin');
      id = methods.parseInt(id);
      pin = methods.parseInt(pin);
      Container.Set(-100000 + id, 'pin', pin);
      apartmentEntity.update({
          pin: pin
      }, { where: { id: id } })
  },
  
  sell: function (player:PlayerMp) {
      methods.debug('apartments.sell');
      if (!user.isLogin(player))
          return;
  
      if (user.get(player, 'apartment_id') == 0) {
          player.notify('~r~У Вас нет недвижимости');
          return;
      }
  
      let hInfo = apartments.getApartData(user.get(player, 'apartment_id'));
      let nalog = methods.parseInt(hInfo.get('price') * (100 - coffer.get('cofferNalog')) / 100);
  
      user.set(player, 'apartment_id', 0);
  
      if (user.get(player, 'reg_status') != 3)
      {
          user.set(player, "reg_time", 28);
          user.set(player, "reg_status", 1);
      }
  
      apartments.updateOwnerInfo(hInfo.get('id'), 0, '');
  
      coffer.removeMoney(nalog);
      user.addMoney(player, nalog);
      user.log(player, "PlayerSell", `Продал апартаменты ${hInfo.get('address')} @apartment${hInfo.get('id')} за $${nalog}`)
      setTimeout(function () {
  
          if (!user.isLogin(player))
              return;
  
          user.addHistory(player, 3, 'Продал апартаменты №' + hInfo.get('id') + '. Цена: $' + methods.numberFormat(nalog));
          player.notify('~g~Вы продали недвижимость');
          player.notify(`~g~Налог:~s~ ${coffer.get('cofferNalog')}%\n~g~Получено:~s~ $${methods.numberFormat(nalog)}`);
          user.saveAccount(player);
          user.updateClientCache(player);
      }, 1000);
  },
  
  buy: function (player:PlayerMp, id:number) {
      methods.debug('apartments.buy');
  
      if (!user.isLogin(player))
          return;
  
      let hInfo = apartments.getApartData(id);
      if (user.get(player, 'apartment_id') > 0) {
          player.notify('~r~У Вас есть недвижимость');
          return false;
      }
      if (hInfo.get('price') > user.getMoney(player)) {
          player.notify('~r~У Вас не хватает средств');
          return false;
      }
      if (hInfo.get('user_id') > 0) {
          player.notify('~r~Недвижимость уже куплена');
          return false;
      }
  
      user.set(player, 'apartment_id', id);
  
      if (user.get(player, 'reg_status') != 3) {
          user.set(player, 'reg_time', 372);
          user.set(player, 'reg_status', 2);
      }
  
      apartments.updateOwnerInfo(id, user.get(player, 'id'), user.get(player, 'rp_name'));
  
      coffer.addMoney(hInfo.get('price'));
      user.removeMoney(player, hInfo.get('price'));
      user.log(player, "PlayerBuy", `Купил апартаменты ${hInfo.get('address')} @apartment${hInfo.get('id')} за $${hInfo.get('price')}`)
      setTimeout(function () {
          if (!user.isLogin(player))
              return;
          user.addHistory(player, 3, 'Купил апартаменты №' + hInfo.get('id') + '. Цена: $' + methods.numberFormat(hInfo.get('price')));
          user.saveAccount(player);
          player.notify('~g~Поздравляем с покупкой недвижимости!');
          user.updateClientCache(player);
      }, 1000);
      return true;
  }
};