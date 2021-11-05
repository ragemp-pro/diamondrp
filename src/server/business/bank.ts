/// <reference path="../../declaration/server.ts" />

import {methods} from '../modules/methods';
import {Container} from '../modules/data';
import {business} from '../business';
import {user} from '../user';
import {coffer} from '../coffer';
import { inventory } from '../inventory';
import { sendMoney, sendmoneymax } from '../modules/events';
import { userEntity } from '../modules/entity/user';




export let bank = {

  markers: [[253.4611,220.7204,106.2865,108],[251.749,221.4658,106.2865,108],[248.3227,222.5736,106.2867,108],[246.4875,223.2582,106.2867,108],[243.1434,224.4678,106.2868,108],[241.1435,225.0419,106.2868,108],[148.5,-1039.971,29.37775,1],[1175.054,2706.404,38.09407,1],[-1212.83,-330.3573,37.78702,1],[314.3541,-278.5519,54.17077,1],[-2962.951,482.8024,15.7031,1],[-350.6871,-49.60739,49.04258,1],[-111.1722,6467.846,31.62671,2],[-113.3064,6469.969,31.62672,2]],
  fleecaMarkers: [[148.5,-1039.971,29.37775],[1175.054,2706.404,38.09407],[-1212.83,-330.3573,37.78702],[-2962.951,482.8024,14.7031],[-350.6871,-49.60739,48.04258],[314.3541,-278.5519,54.17077]],
  blainePos: new mp.Vector3(-110.9777, 6470.198, 31.62671),
  pacificPos: new mp.Vector3(235.5093, 216.8752, 106.2867),
  mazePos: new mp.Vector3(-66.66476, -802.0474, 44.22729),
  
  
  /** [x,y,z,count] */
  grabPos: <any>[], 
  
  doorPos: <any>[],
  
  bombPos: [
      [254.0034, 225.1687, 100.8757],
      [147.2123, -1044.969, 28.36802],
      [311.5067, -283.4736, 53.16475],
      [-353.559, -54.34758, 48.03654],
      //[-2957.552, 481.6652, 14.69703],
      [1175.989, 2711.895, 37.088]
  ],
  
  loadAll: function() {
      methods.debug('bank.loadAll');
  
      //methods.createBlip(bank.mazePos, 374, 59, 0.8, 'Государственный банк "Maze"');
      methods.createBlip(bank.pacificPos, 374, 65, 0.8, 'Частный банк "Pacific Standard"');
      methods.createBlip(bank.blainePos, 374, 67, 0.8, 'Частный банк "Blaine County"');
  
  
      bank.fleecaMarkers.forEach(function (item) {
          let bankPos = new mp.Vector3(item[0], item[1], item[2]);
          methods.createBlip(bankPos, 374, 69, 0.8, 'Частный банк "Fleeca"');
      });
  
      bank.markers.forEach(function (item) {
          let bankPos = new mp.Vector3(item[0], item[1], item[2] - 1);
          methods.createStaticCheckpointV(bankPos, "Нажмите ~g~Е~s~ чтобы открыть меню");
      });
  

  
      let idx = 0;

      
      methods.debug('LOAD ALL BANKS');
  },
  
  loadGrabCounts: function() {
      
  },
  
  sendSmsBankOperation: function(player:PlayerMp, text:string, title = 'Операция со счётом') {
      methods.debug('bank.sendSmsBankOperation');
      if (!user.isLogin(player))
          return;
  
      try {
          switch (user.get(player, 'bank_prefix')) {
              case 1111:
                  player.notifyWithPicture(title, '~r~Maze~s~ Bank', text, 'CHAR_BANK_MAZE', 2);
                  break;
              case 2222:
                  player.notifyWithPicture(title, '~g~Fleeca~s~ Bank', text, 'CHAR_BANK_FLEECA', 2);
                  break;
              case 3333:
                  player.notifyWithPicture(title, '~b~Blaine~s~ Bank', text, 'DIA_CUSTOMER', 2);
                  break;
              case 4444:
                  player.notifyWithPicture(title, '~o~Pacific~s~ Bank', text, 'WEB_SIXFIGURETEMPS', 2);
                  break;
          }
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  transferMoney: function(player:PlayerMp, bankPrefix:number, bankNumber:number, money:number) {
      methods.debug('bank.transferMoney');
      if (!user.isLogin(player))
          return;
  
      if (money < 1) {
          player.notify('~r~Сумма должна быть больше нуля');
          user.updateClientCache(player);
          return;
      }

      const userid = user.getId(player)

      if(!sendMoney.has(userid)) sendMoney.set(userid, 0)

      if((sendMoney.get(userid) + money) > sendmoneymax) return player.notify('~r~Лимит передачи денег в сутки: '+sendmoneymax+'$');

      if (bankPrefix < 1) {
          player.notify('~r~Префикс карты должен быть больше нуля');
          user.updateClientCache(player);
          return;
      }
      if (bankNumber < 1) {
          player.notify('~r~Номер карты должен быть больше нуля');
          user.updateClientCache(player);
          return;
      }
  
      if (user.getBankMoney(player) < money) {
          player.notify('~r~У Вас недостаточно средств');
          user.updateClientCache(player);
          return;
      }
  
      let sumForBiz = methods.parseInt(money * 0.005);
      let sumFinal = methods.parseInt(money * 0.99);
  
      let isOnline = false;
      let isEquip = false;
  
      
  
      let pl = mp.players.toArray().find(target => (user.isLogin(target) && user.get(target, 'bank_prefix') == bankPrefix && user.get(target, 'bank_number') == bankNumber));
      
      if (pl) {
        methods.saveLog('GiveBank', `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'bank_prefix')}-${user.get(player, 'bank_number')}] to ${bankPrefix}-${bankNumber} count $${money} (${user.getId(pl)} online)`);
          isOnline = true;

          bank.addBusinessBankMoneyByPrefix(bankPrefix, sumForBiz);
          bank.addBusinessBankMoneyByPrefix(user.get(player, 'bank_prefix'), sumForBiz);

          bank.sendSmsBankOperation(player, 'Перевод: ~g~$' + methods.numberFormat(sumFinal));
          bank.sendSmsBankOperation(pl, 'Зачисление: ~g~$' + methods.numberFormat(sumFinal));
          user.removeBankMoney(player, money);
          sendMoney.set(userid, sendMoney.get(userid) + money)
          user.addBankMoney(pl, sumFinal);
          user.loginterract(player, pl, "BankTransferMoney", 'Перевёл '+methods.numberFormat(sumFinal))
      }
  
      if (!isOnline) {

        userEntity.findAll({ where: {
            bank_number: bankNumber,
            bank_prefix: bankPrefix,
        }}).then(rows => {

              if(rows.length == 1){
                let item = rows[0];
                bank.addBusinessBankMoneyByPrefix(bankPrefix, sumForBiz);
                bank.addBusinessBankMoneyByPrefix(user.get(player, 'bank_prefix'), sumForBiz);

                bank.sendSmsBankOperation(player, 'Перевод: ~g~$' + methods.numberFormat(sumFinal));
                user.removeBankMoney(player, money);
                sendMoney.set(userid, sendMoney.get(userid) + money)

                userEntity.update({
                    money_bank: item.money_bank + sumFinal
                }, {where: {
                    id: item.id
                }})
                isEquip = true;
                methods.saveLog('GiveBank', `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'bank_prefix')}-${user.get(player, 'bank_number')}] to ${bankPrefix}-${bankNumber} count $${money} (${item.id} offline)`);
                user.loginterract(player, item.id, "BankTransferMoney", 'Перевёл '+methods.numberFormat(sumFinal))
              }

              if (!isEquip) {
  
                  
                  let rows2 = inventory.allItems().filter((item) => item.number == bankNumber && item.prefix == bankPrefix)
                  if(rows2.length == 1){
                      let item2 = rows2[0];
  
                      bank.addBusinessBankMoneyByPrefix(bankPrefix, sumForBiz);
                      bank.addBusinessBankMoneyByPrefix(user.get(player, 'bank_prefix'), sumForBiz);
  
                      bank.sendSmsBankOperation(player, 'Перевод: ~g~$' + methods.numberFormat(sumFinal));
                      user.removeBankMoney(player, money);
                      sendMoney.set(userid, sendMoney.get(userid) + money)
                      methods.saveLog('GiveBank', `${user.getRpName(player)} (${user.getId(player)}) [${user.get(player, 'bank_prefix')}-${user.get(player, 'bank_number')}] to ${bankPrefix}-${bankNumber} count $${money} (non equip)`);
  
                      inventory.updateItemCount(item2.id, (item2.count + sumFinal))
                      user.log(player, "BankTransferMoney", `Перевёл на карту @item${item2.id} ${bankPrefix}-${bankNumber} $${methods.numberFormat(sumFinal)}. Карта не экипирована, владелец ТИП: ${item2.owner_type} ID: ${item2.owner_id}`);
                      isEquip = true;
                  };
  
                  if (!isOnline && !isEquip)
                      bank.sendSmsBankOperation(player, 'Счёт не был найден', '~r~Ошибка перевода');
            }

          });
  
      }
  
      user.updateClientCache(player);
  },
  
  changeCardNumber: function(player:PlayerMp, bankNumber:number) {
      methods.debug('bank.changeCardNumber');
      if (!user.isLogin(player))
          return;
  
      let money = 100000;
  
      if (user.getCashMoney(player) < money) {
          player.notify('~r~У Вас недостаточно средств');
          return;
      }
      if (bankNumber < 9999) {
          player.notify('~r~Номер карты должен быть больше 4-х цифр');
          return;
      }
  
  
      let bankPrefix = user.get(player, 'bank_prefix');
      userEntity.findAll({
          where: {
              bank_number: bankNumber,
              bank_prefix: bankPrefix,
          }
      }).then(rows => {
          if (rows.length === 0) {
              
              let rows = inventory.allItems().filter((item) => item.number == bankNumber && item.prefix == bankPrefix)
                if (rows.length === 0) {
                    methods.saveLog("changeCardNumber", `${user.getRpName(player)} (${user.getId(player)}) Сменил номер карты ${user.get(player, 'bank_number')} на ${bankNumber}`)
                    user.set(player, 'bank_number', bankNumber);
                    user.removeCashMoney(player, money);
                    bank.addBusinessBankMoneyByPrefix(bankPrefix, money);
                    bank.sendSmsBankOperation(player, 'Ваш номер карты был изменён');
                    user.saveAccount(player);
                }
                else
                    bank.sendSmsBankOperation(player, 'Номер карты уже существует', '~r~Ошибка');

          }
          else
              bank.sendSmsBankOperation(player, 'Номер карты уже существует', '~r~Ошибка');
      });
  },
  
  withdraw: function(player:PlayerMp, money:number, procent = 0) {
      methods.debug('bank.withdraw');
  
      //setTimeout(function () {
  
          procent = methods.parseInt(procent);
          if (!user.isLogin(player))
              return;
  
          if (money < 1) {
              player.notify('~r~Сумам должна быть больше нуля');
              return;
          }
  
          if (user.getBankMoney(player) < money) {
              player.notify('~r~У Вас недостаточно средств');
              return;
          }
  
          if (procent == 0) {
              bank.sendSmsBankOperation(player, 'Вывод: ~g~$' + methods.numberFormat(money));
              user.addCashMoney(player, money);
              user.removeBankMoney(player, money);
          }
          else {
              let sum = methods.parseInt(money * ((100 - procent) / 100));
              let sumBank = methods.parseInt(money * (procent / 100));
  
              bank.sendSmsBankOperation(player, 'Вывод: ~g~$' + methods.numberFormat(sum));
              bank.addBusinessBankMoneyByPrefix(user.get(player, 'bank_prefix'), sumBank);
              user.addCashMoney(player, sum);
              user.removeBankMoney(player, money);
          }
      //}, 1500);
  },
  
  deposit: function(player:PlayerMp, money:number, procent = 0) {
      methods.debug('bank.deposit');
      procent = methods.parseInt(procent);
      if (!user.isLogin(player))
          return;
  
      if (money < 1) {
          player.notify('~r~Сумам должна быть больше нуля');
          return;
      }
  
      if (user.getCashMoney(player) < money) {
          player.notify('~r~У Вас недостаточно средств');
          return;
      }
  
      if (procent == 0) {
          bank.sendSmsBankOperation(player, 'Зачисление: ~g~$' + methods.numberFormat(money));
          user.addBankMoney(player, money);
          user.removeCashMoney(player, money);
      }
      else {
          let sum = methods.parseInt(money * ((100 - procent) / 100));
          let sumBank = methods.parseInt(money * (procent / 100));
  
          bank.sendSmsBankOperation(player, 'Зачисление: ~g~$' + methods.numberFormat(sum));
          bank.addBusinessBankMoneyByPrefix(user.get(player, 'bank_prefix'), sumBank);
          user.addBankMoney(player, sum);
          user.removeCashMoney(player, money);
      }
  },
  
  addBusinessBankMoneyByPrefix: function(prefix:number, money:number) {
      methods.debug('bank.addBusinessBankMoneyByPrefix');
      switch (prefix)
      {
          case 2222:
              business.addMoney(1, money);
              break;
          case 3333:
              business.addMoney(2, money);
              break;
          case 4444:
              business.addMoney(108, money);
              break;
          default:
              coffer.addMoney(money);
              break;
      }
  },
  
  openCard: function(player:PlayerMp, bankId:number, price:number) {
      methods.debug('bank.openCard');
      if (!user.isLogin(player))
          return;
  
      if (user.getMoney(player) < price) {
          player.notify('~r~У Вас недостаточно средств');
          return;
      }
  
      if (user.get(player, 'bank_prefix') > 0) {
          player.notify('~r~У Вас уже есть банковская карта');
          return;
      }
  
      if (price < 1)
          return;
  
      let bankPrefix = 1111;
  
      switch (bankId)
      {
          case 1:
              bankPrefix = 2222;
              break;
          case 2:
              bankPrefix = 3333;
              break;
          case 108:
              bankPrefix = 4444;
              break;
      }
  
      let number = methods.getRandomInt(10000, 9999999);
      user.set(player, 'bank_prefix', bankPrefix);
      user.set(player, 'bank_number', number);
  
      methods.saveLog('BuyCardNumber', `${user.getRpName(player)} (${user.getId(player)}): ${bankPrefix}-${number}`);
  
      user.removeCashMoney(player, price);
  
      if (bankId == 0)
          coffer.addMoney(price);
      else
          business.addMoney(bankId, price);
  
      bank.sendSmsBankOpenOperation(player);
  },
  
  closeCard: function(player:PlayerMp) {
      methods.debug('bank.closeCard');
      if (!user.isLogin(player))
          return;
      bank.sendSmsBankCloseOperation(player);
  
      user.set(player, 'bank_prefix', 0);
      user.set(player, 'bank_number', 0);
      let currentBankMoney = user.getBankMoney(player);
      user.removeBankMoney(player, currentBankMoney);
      user.addCashMoney(player, currentBankMoney);
  },
  
  sendSmsBankCloseOperation: function(player:PlayerMp) {
      bank.sendSmsBankOperation(player, 'Ваш счёт в банке был закрыт.');
  },
  
  sendSmsBankOpenOperation: function(player:PlayerMp) {
      bank.sendSmsBankOperation(player, 'Поздравляем с открытием счёта!');
  },
  
  getInRadius: function(pos:Vector3Mp, radius = 2) {
      let stationId = -1;
      bank.markers.forEach(function (item) {
          let fuelStationShopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(pos, fuelStationShopPos) < radius)
              stationId = methods.parseInt(item[3]);
      });
      return stationId;
  },
  
  getGrabInRadius: function(pos:Vector3Mp, radius = 5) {
      let idx = 0;
      let result = -1;
      
      return result;
  },
  
  getBombInRadius: function(pos:Vector3Mp, radius = 2) {
      let idx = 0;
      let result = -1;
      bank.bombPos.forEach(function (item) {
          let fuelStationShopPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(pos, fuelStationShopPos) < radius)
              result = idx;
          idx++;
      });
      return result;
  },
  
  checkPosForOpenMenu: function(player:PlayerMp) {
    //   methods.debug('bank.checkPosForOpenMenu');
      try {
          let playerPos = player.position;
          let shopId = bank.getInRadius(playerPos, 2);
          if (shopId == -1) {
              return;
          }
          player.call('client:menuList:showBankMenu', [shopId, business.get(shopId, 'price_card1')]);
      }
      catch (e) {
          methods.debug(e);
      }
  },
  
  findNearest: function(pos:Vector3Mp) {
      methods.debug('bank.findNearest');
      let prevPos = new mp.Vector3(9999, 9999, 9999);
      bank.markers.forEach(function (item,) {
          let fuelPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(fuelPos, pos) < methods.distanceToPos(prevPos, pos))
              prevPos = fuelPos;
      });
      return prevPos;
  },
  
  findNearestFleeca: function(pos:Vector3Mp) {
      methods.debug('bank.findNearestFleeca');
      let prevPos = new mp.Vector3(9999, 9999, 9999);
      bank.fleecaMarkers.forEach(function (item,) {
          let fuelPos = new mp.Vector3(item[0], item[1], item[2]);
          if (methods.distanceToPos(fuelPos, pos) < methods.distanceToPos(prevPos, pos))
              prevPos = fuelPos;
      });
      return prevPos;
  }
};
