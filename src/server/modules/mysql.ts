/// <reference path="../../declaration/server.ts" />
'use strict';

import { MysqlError } from 'mysql';

import { user } from '../user';
import { methods } from './methods';
import { business } from '../business';
import { vehicles, vehicleOffset } from '../vehicles';
import { coffer } from '../coffer';

//let mysql = exports;

let isConnected = true;

console.log('[DATABASE] Mysql connect to db.');

import { apartments } from '../apartments';
import { condo } from '../condo';
import { houses } from '../houses';
import { stock } from '../stock';
import { sequelize, mysqlpool } from './sequelize';
import { inventory, itemsDB } from '../inventory';
import { restartProtocol } from './admin';
import { inventoryEntity } from './entity/inventory';
import { Container } from './data';
import { carsEntity } from './entity/carsModel';
import { eventToServerEntity } from './entity/eventToServer';
import { userEntity } from './entity/user';
import { monitoringEntity } from './entity/monitoringEntity';
import { userDatingEntity } from './entity/userDatingEntity';
import { Op, Sequelize } from 'sequelize';
import { logPlayerEntity } from './entity/logPlayerEntity';






function promisePool(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    userEntity.findOne().then(() => {
      resolve(true);
    })
  });
}

interface mysqlArray<T> extends Array<T> {
  insertId?:number;
}

// setTimeout(() => {
//   mysql.stressTest();
// }, 15000)

export let mysql = {
  likefilter: (search:string) => {
    return sequelize.escape('%' + search + '%')
  },
  test: false,
  stressTest: async function() {
    const start = new Date().getTime();
    let i = 0;
    while (i < 20) {
      await promisePool();
      i++;
    }
    const end = new Date().getTime();
    methods.debug(`executeQuery LOL: ${end - start}ms`);
  },
  isConnected: function() {
    return isConnected;
  },
  getTime: function() {
    let dateTime = new Date();
    return `${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(
      dateTime.getMinutes()
    )}:${methods.digitFormat(dateTime.getSeconds())}`;
  },
  getParam: function() {
    let dateTime = new Date();
    return `${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(
      dateTime.getMinutes()
    )}:${methods.digitFormat(dateTime.getSeconds())}`;
  },
  executeQuerys: function(
    query: string,
    values?: ((err: MysqlError, rows?: mysqlArray<any>, fields?:any) => any) | any[],
    callback?: (err: MysqlError, rows?: mysqlArray<any>, fields?:any) => any
  ): Promise<mysqlArray<any>> {
    return;
    // return new Promise((resolve, reject) => {
    //   const start = new Date().getTime();

    //    if (typeof values == 'function') {
    //     methods.debug(query);
    //     mysqlpool.query(query, function(err, rows, fields) {
    //       if (!err) {
    //         values(null, rows, fields);
    //         resolve(rows);
    //       } else {
    //         console.log('[DATABASE | ERROR | ' + mysql.getTime() + ']');
    //         console.log(query);
    //         console.log(err);
    //         values(err);
    //         reject(err);
    //       }

    //       const end = new Date().getTime();
    //       methods.debug(`executeQuery: ${end - start}ms`);
    //     });
    //   } else {
    //     methods.debug(query, values ? values : null);
    //     mysqlpool.query(query, values ? values : [], function(err, rows, fields) {
    //       if (!err) {
    //         if (callback) callback(null, rows, fields);
    //         resolve(rows);
    //       } else {
    //         console.log('[DATABASE | ERROR | ' + mysql.getTime() + ']');
    //         console.log(query);
    //         console.log(err);
    //         if (callback) callback(err);
    //         reject(err)
    //       }

    //       const end = new Date().getTime();
    //       // methods.debug(`executeQuery: ${end - start}ms`);
    //     });
    //   }

    // });
  }
};

export const loadIntervalsMySQL = () => {
setInterval(() => {
  monitoringEntity.update({
    online: mp.players.length,
    last_update: Math.round(new Date().getTime() / 1000),
  }, {
    where : {
      id: 1
    }
  })
}, 30 * 1000);

setInterval(() => {

  eventToServerEntity.findAll().then(rows => {
    rows.forEach(async function (item) {
      try {
        let id = item.id;
        let param = JSON.parse(methods.replaceAll(item['params'].toString(), '&quot;', '"'));
        let type = item.type;
        let itemId = item.item_id;
        let action = item.action;

        if (type == 5) {
          if (action == "rebootServer") {
            restartProtocol(param.time, param.reason);
            item.destroy();
          }
        } else if (type == 4) {
          switch (action) {
            case 'ChangeNick': {
              const userid = itemId;
              let nick = <string>param['nick'];
              user.log(userid, "ChangeNick", 'Сменил игровое имя на ' + nick)
              let data: { [x: string]: any } = {}
              let target = user.getPlayerById(userid);
              if (target) {
                user.set(target, 'rp_name', nick);
                user.set(target, 'wanted_level', 0);
                user.set(target, 'wanted_reason', 0);
                data.business_id = user.get(target, 'business_id');
                data.cars = await user.myVehicles(target);
                data.apart = user.get(target, 'apartment_id');
                data.house = user.get(target, 'id_house');
                data.condo = user.get(target, 'condo_id');
                data.stock = user.get(target, 'stock_id');
              } else {
                let qd = await userEntity.findOne({ where: { id: userid}})
                if (!qd) return;
                let vehs = await carsEntity.findAll({ where: { id_user: userid}})
                vehs.forEach((veh) => {
                  vehicles.updateOwnerInfo(veh.id, userid, nick);
                })
                data.business_id = qd.business_id
                data.apart = qd.apartment_id;
                data.house = qd.id_house;
                data.condo = qd.condo_id;
                data.stock = qd.stock_id;
              }
              userEntity.update({
                rp_name: nick,
                wanted_level: 0,
                wanted_reason: ''
              }, { where: { id: userid}})
              if (data.business_id) {
                business.updateOwnerInfo(data.business_id, userid, nick);
              }
              if (data.cars) {
                data.cars.forEach((car: number) => {
                  vehicles.updateOwnerInfo(car, userid, nick);
                })
              }
              if (data.apart) {
                if (apartments.getOwnerId(data.apart) == userid)
                  apartments.updateOwnerInfo(data.apart, userid, nick);
              }
              if (data.condo) {
                if (condo.getOwnerId(data.condo) == userid)
                  condo.updateOwnerInfo(data.condo, userid, nick);
              }
              if (data.house) {
                if (houses.getOwnerId(data.house) == userid)
                  houses.updateOwnerInfo(data.house, userid, nick);
              }
              if (data.stock) {
                stock.updateOwnerInfo(data.stock, userid, nick);
              }
              if (target) user.updateClientCache(target);

              userDatingEntity.destroy({
                where: {
                  [Op.or]: [{ user_owner: userid }, {user_id: userid}]
                }
              })
              logPlayerEntity.destroy({ where: { user_id: userid}})
              item.destroy();
              break;
            }
            case 'ChangeId': {
              const userid = itemId;
              let newID = <number>param['id'];
              user.log(userid, "ChangeNick", 'Сменил игровой ID на ' + newID)
              let data: { [x: string]: any } = {}
              let target = user.getPlayerById(userid);
              let qd = await userEntity.findOne({ where: { id: userid } })
              if (!qd) return;
              if (target) {
                return;
              } else {
                let vehs = await carsEntity.findAll({ where: { id_user: userid}})
                vehs.forEach((veh) => {
                  vehicles.updateOwnerInfo(veh.id, newID, qd.rp_name);
                })
                data.business_id = qd.business_id
                data.apart = qd.apartment_id;
                data.house = qd.id_house;
                data.condo = qd.condo_id;
                data.stock = qd.stock_id;
              }
              userEntity.update({
                id: newID,
                wanted_level: 0,
                wanted_reason: ''
              }, { where: { id: userid}})
              if (data.business_id) {
                business.updateOwnerInfo(data.business_id, newID, qd.rp_name);
              }
              if (data.cars) {
                data.cars.forEach((car: number) => {
                  vehicles.updateOwnerInfo(car, newID, qd.rp_name);
                })
              }
              if (data.apart) {
                if (apartments.getOwnerId(data.apart) == userid)
                  apartments.updateOwnerInfo(data.apart, newID, qd.rp_name);
              }
              if (data.condo) {
                if (condo.getOwnerId(data.condo) == userid)
                  condo.updateOwnerInfo(data.condo, newID, qd.rp_name);
              }
              if (data.house) {
                if (houses.getOwnerId(data.house) == userid)
                  houses.updateOwnerInfo(data.house, newID, qd.rp_name);
              }
              if (data.stock) {
                stock.updateOwnerInfo(data.stock, newID, qd.rp_name);
              }

              inventory.getItemListData(1, userid).map(item => {
                inventory.updateItemOwnerSystem(item.id, 1, newID);
              })

              
              userDatingEntity.destroy({
                where: {
                  [Op.or]: [{ user_owner: userid }, {user_id: userid}]
                }
              })
              logPlayerEntity.destroy({ where: { user_id: userid}})
              item.destroy();
              break;
            }
            case 'BuyItem': {
              const userid = itemId;
              let item_id = <number>param['item_id'];
              let number = <number>param['number'];
              let key_id = <number>param['key_id'];
              let prefix = <number>param['prefix'];
              inventory.createItem(item_id, 1, 1, userid, prefix, number, key_id);
              item.destroy();
              break;
            }
            case 'DeleteItem': {
              inventory.deleteItem(itemId)
              item.destroy();
              break;
            }
            case 'AddUserItem': {
              let userid = <number>param['userid'];
              inventory.createItem(itemId, 1, 1, userid)
              item.destroy();
              break;
            }
            case 'AppartFridge': {
              houses.setChestLevel(itemId, 2)
              item.destroy();
              break;
            }
            case 'VehicleNumber': {
              const vehid = itemId;
              let oldNumber = <string>param['oldNumber'];
              let newNumber = <string>param['newNumber'];
              let veh = mp.vehicles.toArray().find(veh => veh.numberPlate == oldNumber);
              if (veh) veh.numberPlate = newNumber;
              let oldOwnerId = methods.convertNumberToHash(oldNumber)
              let newOwnerId = methods.convertNumberToHash(newNumber)
              inventory.allItems().filter(item => item.owner_type == 8 && item.owner_id == oldOwnerId).map(item => {
                inventory.updateItemOwnerSystem(item.id, 8, newOwnerId)
              })
              Container.Set(vehicleOffset + vehid, 'number', newNumber);
              carsEntity.update({
                number: newNumber
              }, { where: { id: vehid } });
              vehicles.save(vehid);
              item.destroy();
              break;
            }
            case 'DeleteAllItemId': {
              inventoryEntity.destroy({ where: { item_id: itemId } });
              item.destroy();
              inventory.allItems().filter(itm => itm.item_id == itemId).map((itm) => {
                if (itm.owner_type == 0) {
                  inventory.deleteDropItem(itm.id);
                }
                itemsDB.delete(itm.id);
              })
              break;
            }
          }
        } else if (type == 3) {
          switch (action) {
            case 'AddMoney':
              let bId = methods.parseInt(param['bId']);
              let money = methods.parseInt(param['money']);

              if (bId == 0) break;
              if (money == 0) break;

              business.addMoney(bId, money);
              item.destroy();
              break;
          }
        } else if (type == 1) {
          let player = user.getPlayerById(itemId);

          switch (action) {
            case 'KickAll': {
              item.destroy();
              mp.players.forEach(function (p) {
                user.kick(p, 'Рестарт');
              });
              break;
            }
            case 'Kick': {
              item.destroy();
              if (player == null) break;
              user.kick(player, param['msg']);
              break;
            }
            case 'AddMoney': {
              if (player == null) break;
              let money = methods.parseInt(param['money']);
              if (money == 0) break;
              user.addCashMoney(player, money);
              player.notify(`~g~Вам поступило на счёт ~s~$${methods.numberFormat(money)}`);

              item.destroy();
              break;
            }
            case 'BuyVehicle': {
              item.destroy();

              let slot = methods.parseInt(param['slot']);
              let vId = methods.parseInt(param['vId']);
              let price = methods.parseInt(param['price']);

              if (player == null) {
                for (let i = 0; i <= 1000; i++) {
                  if (user.hasById(i, 'id') && user.getById(i, 'id') == itemId) {
                    user.setById(
                      i,
                      'money_bank',
                      methods.parseInt(user.getById(i, 'money_bank') - price)
                    );
                    user.setById(i, 'car_id' + slot, vId);
                  }
                }
                break;
              }

              try {
                if (user.getBankMoney(player) < price) {
                  carsEntity.update({
                    user_name: '',
                    id_user: 0,
                  }, {where: { id: vId }})
                  player.notify('~r~У Вас недостаточно средств');
                  return;
                }

                vehicles.loadPlayerVehicleById(player, vId);
                user.set(player, 'car_id' + slot, vId);
                coffer.addMoney(price);
                user.removeBankMoney(player, price);
                user.saveAccount(player);

                player.notify(`~g~Поздравляем с покупкой транспорта`);
                methods.saveLog(
                  'BuyVehicle',
                  `ID: ${vId}, BUY NAME: ${user.getRpName(player)}, PRICE: ${price}`
                );
              } catch (e) {
                methods.debug(e);
              }
              break;
            }
            case 'SellMotorVehicle': {
              let uName = param['uName'];
              let uId = methods.parseInt(param['uId']);
              let vId = methods.parseInt(param['vId']);
              let price = methods.parseInt(param['price']);
              if (uId == 0) break;
              if (vId == 0) break;
              if (price == 0) break;
              vehicles.updateOwnerInfo(vId, uId, uName);
              methods.saveLog(
                'BuyMotorCar',
                `ID: ${vId}, SELL USER: ${itemId}, BUY USER: ${uId}, PRICE: ${price}`
              );
              if (player == null) {
                let money = methods.parseInt(price * 0.95);
                let data = await user.getUserDataFromDB(itemId);
                data.money_bank+=money;
                if (data.car_id1 == vId) data.car_id1 = 0;
                if (data.car_id2 == vId) data.car_id2 = 0;
                if (data.car_id3 == vId) data.car_id3 = 0;
                if (data.car_id4 == vId) data.car_id4 = 0;
                if (data.car_id5 == vId) data.car_id5 = 0;
                if (data.car_id6 == vId) data.car_id6 = 0;
                if (data.car_id7 == vId) data.car_id7 = 0;
                if (data.car_id8 == vId) data.car_id8 = 0;
                data.save();

                for (let i = 0; i <= 1000; i++) {
                  if (user.hasById(i, 'id') && user.getById(i, 'id') == itemId) {
                    user.setById(
                      i,
                      'money_bank',
                      methods.parseInt(user.getById(i, 'money_bank') + price)
                    );
                    for (let j = 1; j < 9; j++) {
                      if (methods.parseInt(user.getById(i, 'car_id' + j)) == vId)
                        user.setById(i, 'car_id' + j, 0);
                    }
                  }
                }
              } else {
                for (let i = 1; i < 9; i++) {
                  if (methods.parseInt(user.get(player, 'car_id' + i)) == vId)
                    user.set(player, 'car_id' + i, 0);
                }

                let money = methods.parseInt(price * 0.95);
                let data = await user.getUserDataFromDB(itemId);
                data.money_bank += money;
                if (data.car_id1 == vId) data.car_id1 = 0;
                if (data.car_id2 == vId) data.car_id2 = 0;
                if (data.car_id3 == vId) data.car_id3 = 0;
                if (data.car_id4 == vId) data.car_id4 = 0;
                if (data.car_id5 == vId) data.car_id5 = 0;
                if (data.car_id6 == vId) data.car_id6 = 0;
                if (data.car_id7 == vId) data.car_id7 = 0;
                if (data.car_id8 == vId) data.car_id8 = 0;
                data.save();

                user.addMoney(player, money);
                user.saveAccount(player);
                user.addHistory(
                  player,
                  3,
                  'Продал транспорт на PDM. Цена: $' + methods.numberFormat(money)
                );
                player.notify(
                  `~b~Вы продали свой автомобиль по цене:~s~ $${methods.numberFormat(money)}`
                );
              }

              business.addMoney(86, methods.parseInt(price * 0.05));
              item.destroy();
              break;
            }
          }
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  })
}, 5000);
};

