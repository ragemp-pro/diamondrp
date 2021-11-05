/// <reference path="../../../declaration/server.ts" />

import { methods } from '../../modules/methods';
import { business } from '../../business';
import { menu } from '../../modules/menu';
import { colors } from './colors';
import { rentPos } from './rentPos';
import { user } from '../../user';
import { vehicles } from '../../vehicles';
import { houses } from '../../houses';
import { chat, enabledSystem } from '../../modules/chat';
import _ from 'lodash';
import { getParkPosition } from '../../managers/parking';
import { RAGE_BETA } from '../../../util/newrage';
import { autosalonModelsEntity } from '../../modules/entity/autosalonModels';
import { carsEntity } from '../../modules/entity/carsModel';
import { Op } from 'sequelize';
import { autosalonPercentEntity } from '../../modules/entity/autosalonPercent';
import { carRentEntity } from '../../modules/entity/carRent';

const getPos = (
  poses: [number, number, number, number, number, number][]
): [number, number, number, number, number, number] => {
  const allPos = _.sample(poses);
  const pos = <[number, number, number]>allPos.slice(0, 3);
  let in_pos = false;
  mp.vehicles.forEachInRange(new mp.Vector3(...pos), 1, (vehicle: VehicleMp) => {
    if (mp.vehicles.exists(vehicle)) in_pos = true;
  });
  if (!in_pos) return allPos;
  else return _.sample(poses.filter((i) => i[0] != allPos[0]));
};

export let autosalon = {
  models: <string[][]>[
    //! Эконом
    [],
    //! Комфорт
    [],
    //! Элитный
    [],
    //! вело-мото
    [],
    //! лодки
    [],
    //! воздушный транспорт
    [],
    //! Тех транспорт
    [],
  ],
  //? Название, X, Y, Z, Иконка, ID, Процент с продажи, цвет иконки
  list: <[string, number, number, number, number, number, number][]>[
    ['Автосалон Эконом', -44.23451232910156, -1660.8045654296875, 29.283042907714844, 225, 173, 5],
    ['Автосалон Комфорт', -32.23559951782226, -1111.933471679687, 26.4223518371582, 225, 174, 5],
    ['Автосалон Элитный', -69.3691177, 62.7385559, 71.8934402, 225, 175, 5],
    ['Мотосалон', 268.23211669921875, -1155.246826171875, 29.290678024291992, 226, 176, 5],
    ['Лодочная станция', -786.2677001953125, -1355.430419921875, 5.150264739990234, 427, 177, 5],
    ['Воздушный транспорт', -1071.0123291015625, -2868.7138671875, 13.951811790466309, 307, 178, 5],
    ['Тех. транспорт', 796.626953125, -2988.70166015625, 6.020936012268066, 318, 179, 5],
  ],

  colors,
  cars: <
    {
      [x: string]: Map<number, CarInstance>;
    }
  >{},
  rentPos,
  rentCars: <
    {
    [x: string]: Map<number, carRentEntity>;
    }
  >{},

  loadAll: async () => {
    methods.debug('autosalon.loadAll');
    autosalon.list.map(async (item, idx) => {
      let shopPos = new mp.Vector3(item[1], item[2], item[3]);
      methods.createBlip(shopPos, item[4], 77, 0.7, item[0]);
      methods.createStaticCheckpoint(
        shopPos.x,
        shopPos.y,
        shopPos.z - 1,
        'Нажмите ~g~Е~s~ чтобы открыть меню'
      );
    });
    autosalon.loadCars();
    autosalon.loadRentCars();
  },

  loadModels: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      autosalon.models = [
        //! Эконом
        [],
        //! Комфорт
        [],
        //! Элитный
        [],
        //! вело-мото
        [],
        //! лодки
        [],
        //! воздушный транспорт
        [],
        //! Тех транспорт
        [],
      ]
      autosalonModelsEntity.findAll().then(data => {
        data.map(item => {
          autosalon.models[item.autosalon].push(item.model)
        })
        resolve(true)
      })
    })
  },

  removeModel: (salonid:number,model:string) => {
    autosalonModelsEntity.destroy({
      where: {autosalon: salonid,
      model: model,}
    }).then(() => {
      autosalon.loadCars();
    })
  },

  addModel: (salonid:number,model:string) => {
    autosalonModelsEntity.create({
      autosalon: salonid,
      model: model,
    }).then(() => {
      autosalon.loadCars();
    })
  },

  loadCars: async () => {
    methods.debug('autosalon.loadCars');
    await autosalon.loadModels();
    autosalon.list.map(async (item, idx) => {
      const typeModels = autosalon.models[idx].reduce((str, item, index) => {
        return str + `'${item}'` + (index != autosalon.models[idx].length - 1 ? ',' : '');
      }, ``);
      let q = autosalon.models[idx]
      carsEntity.findAll({
        where: {
          id_user: 0,
          user_name: '',
          name: { [Op.in]: q}
        }
      }).then(cars => {
        if (autosalon.cars[idx] && autosalon.cars[idx] instanceof Map) {
          autosalon.cars[idx].clear();
        }
        autosalon.cars[idx] = new Map();
        cars.map((item) => {
          autosalon.cars[idx].set(item.id, item);
        });
        autosalonPercentEntity.findAll({
          where: {business_id: item[5]}
        }).then(rows => {
          autosalon.list[idx][6] = rows[0].percent;
        })
      })
    });
  },

  loadRentCars: async () => {
    methods.debug('autosalon.loadRentCars');
    for (let idx = 0; idx < autosalon.list.length; idx++) {
      const item = autosalon.list[idx];
      carRentEntity.findAll({
        where: {
          business_id: item[5]
        }
      }).then(rentCars => {
        if (autosalon.rentCars[idx] && autosalon.rentCars[idx] instanceof Map) {
          autosalon.rentCars[idx].clear();
        }
        autosalon.rentCars[idx] = new Map();
        rentCars.map((car) => {
          autosalon.rentCars[idx].set(car.id, car);
        });
      });
    }
  },

  getLocalInRadius: (pos: Vector3Mp, radius = 2) => {
    // methods.debug('autosalon.getLocalInRadius');
    let asId = -1;
    autosalon.list.map((item, idx) => {
      if (asId != -1) return;
      let shopPos = new mp.Vector3(item[1], item[2], item[3]);
      if (methods.distanceToPos(pos, shopPos) < radius) {
        asId = idx;
        return;
      }
    });
    return asId;
  },

  getRemoteInRadius: (pos: Vector3Mp, radius = 2) => {
    // methods.debug('autosalon.getRemoteInRadius');
    let asId = autosalon.getLocalInRadius(pos, radius);
    if (asId == -1) return -1;
    return autosalon.list[asId][5];
  },

  checkPosForOpenMenu: (player: PlayerMp) => {
    // methods.debug('autosalon.checkPosForOpenMenu');
    if (!mp.players.exists(player)) return;
    if (!user.isLogin(player)) return;
    let playerPos = player.position;
    let asIdRemote = autosalon.getRemoteInRadius(playerPos, 2);
    let asIdLocal = autosalon.getLocalInRadius(playerPos, 2);
    if (asIdRemote == -1) return;
    const m = menu.new(player, business.getName(asIdRemote), 'Действия', [
      {
        name: 'Покупка ТС',
        onpress: () => {
          if(!enabledSystem.buycar) return player.notify("Салон на временных тех работах. Загляните чуть позже")
          autosalon.startBuy(player, asIdLocal, 'buy');
          m.close();
        },
      },
    ]);
    if (asIdRemote != 179) {
      m.newItem({
        name: 'Аренда ТС',
        onpress: () => {
          if(!enabledSystem.rent) return player.notify("Салон на временных тех работах. Загляните чуть позже")
          autosalon.startBuy(player, asIdLocal, 'rent');
          m.close();
        },
      });
    }
    m.newItem({
      name: '~r~Закрыть',
      onpress: () => m.close(),
    });
    m.open();
  },

  startBuy: async (player: PlayerMp, asId: number, type: string) => {
    methods.debug('autosalon.startBuy');
    if (!mp.players.exists(player)) return;
    if (!user.isLogin(player)) return;
    user.showLoadDisplay(player);
    await methods.sleep(500);
    player.dimension = 100 + player.id;
    player.currentAutosalonId = asId;
    let showType = 'auto';
    if (asId == 4) {
      showType = 'boat';
    } else if (asId == 5) {
      showType = 'plane';
    } else if (asId == 6) {
      showType = 'technical';
    }
    if (type == 'buy') {
      const cars = [...autosalon.cars[asId]].map(([key, item]: [number, CarInstance]) => item);
      let uniq = _.uniqBy(cars, 'name');
      uniq = uniq.map((item) => {
        let same = uniq.filter((i) => i.name == item.name);
        let random = _.sample(same);
        return random;
      });
      const carsData = uniq.map((item) => ({
        id: item.id,
        model: item.name.toLowerCase(),
        name: methods.getVehicleInfo(item.name) ? methods.getVehicleInfo(item.name).display_name : item.name,
        stock: methods.getVehicleInfo(item.name) ? methods.getVehicleInfo(item.name).stock : 0,
        fuel: item.full_fuel,
        price: item.price,
      })).sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      player.call('client:autosalon:startBuyCar', [carsData, autosalon.colors, type, showType]);
    } else if (type == 'rent') {
      const carsData = [...autosalon.rentCars[asId]].map(
        ([key, item]) => ({
          id: item.id,
          model: item.name.toLowerCase(),
          name: item.name,
          fuel: methods.getVehicleInfo(item.name.toLowerCase()).fuel_full,
          price: item.price,
        })
      ).sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      player.call('client:autosalon:startBuyCar', [carsData, autosalon.colors, type, showType]);
    }
  },

  buyCar: async (player: PlayerMp, slot: number, car: CarInstance, color: number) => {
    methods.debug('autosalon.buyCar');
    if (!mp.players.exists(player)) return;
    if (!user.isLogin(player)) return;
    // user.alert(player, 'Операция выполняется...');
    try {
      const user_id = user.getId(player);
      const rows = await carsEntity.findAll({ where: {
        name: car.name,
        id_user: 0
      }})
      if (!rows.length) {
        user.bigAlert(player, 'ТС нет в наличии', 'warning');
        return false;
      }
      car = rows[0];
      if (car.user_name || car.id_user) {
        user.bigAlert(player, 'ТС уже куплен', 'warning');
        return false;
      }

      
      const allPos = getPos(autosalon.rentPos[player.currentAutosalonId]);
      let pos = allPos.slice(0, 3);
      let rot = allPos.slice(3, 6);
      let parkpos = getParkPosition(new mp.Vector3(pos[0], pos[1], pos[2]));
      if(parkpos && parkpos.pos){
        pos = [parkpos.pos.x, parkpos.pos.y, parkpos.pos.z]
        rot = [parkpos.rot.x, parkpos.rot.y, parkpos.rot.z]
      }
      
      await vehicles.buy(car.id, player, new mp.Vector3(pos[0], pos[1], pos[2]), rot[2], color)
      user.set(player, 'car_id' + slot, car.id);
      user.updateClientCache(player);
      user.removeCashMoney(player, car.price);
      user.bigAlert(player, `Поздравляем с покупкой транспорта. ${user.getLevel(player) < 4 ? 'Не забудьте перепарковать транспорт в любом удобном для вас месте.' : ''}`, 'success', 10000);
      user.saveAccount(player);
      user.log(player, "PlayerBuy", `Купил ТС ${car.name} @veh${car.id} за $${car.price}`)
      const asId = autosalon.list[player.currentAutosalonId][5];
      business.addMoney(asId, (car.price / 100) * autosalon.list[player.currentAutosalonId][6]);
      
      
      methods.saveLog(
        'BuyVehicle',
        `ID: ${car.id}, BUY NAME: ${user.getRpName(player)}, PRICE: ${car.price}, VEHICLE NAME: ${
          car.name
        }`
      );
      autosalon.loadCars();
      return true;
      // todo Узнать насчет лога в бд
    } catch (e) {
      // player.notify('Произошла ошибка');
      console.error(e);
      methods.debug(e);
      return false;
    }
  },

  rentCar: async (player: PlayerMp, model: string, price: number, color: number) => {
    methods.debug('autosalon.rentCar');
    if (!mp.players.exists(player)) return;
    if (!user.isLogin(player)) return;
    const hash = mp.joaat(model);
    let className = methods.getVehicleInfo(hash).class_name;

    const find = mp.vehicles.toArray().find((veh) => veh.getVariable('rentOwner') == user.getId(player));
    if (find) {
      player.notify('~y~Вы уже арендовали ТС, закончите аренду ~b~(/unrent)');
      return;
    }

    switch (className) {
      case 'Planes':
      case 'Helicopters':
        if (!user.get(player, 'air_lic')) {
          user.bigAlert(player, 'У Вас нет лицензии пилота', 'warning');
          return;
        }
        break;
      case 'Boats':
        if (!user.get(player, 'ship_lic')) {
          user.bigAlert(player, 'У Вас нет лицензии на водный транспорт', 'warning');
          return;
        }
        break;
      case 'Commercials':
      case 'Industrial':
        if (!user.get(player, 'c_lic')) {
          user.bigAlert(player, 'У Вас нет лицензии категории C', 'warning');
          return;
        }
        break;
      case 'Compacts':
      case 'Coupes':
      case 'Muscle':
      case 'Off-Road':
      case 'Sedans':
      case 'Sports':
      case 'Sports Classics':
      case 'Super':
      case 'SUVs':
      case 'Utility':
      case 'Vans':
        if (!user.get(player, 'b_lic')) {
          user.bigAlert(player, 'У Вас нет лицензии категории B', 'warning');
          return;
        }
        break;
      case 'Motorcycles':
        if (hash != -1842748181 && !user.get(player, 'a_lic')) {
          user.bigAlert(player, 'У Вас нет лицензии категории А. Вы можете взять Faggio', 'warning');
          return;
        }
        break;
    }

    user.removeMoney(player, price);
    user.log(player, "PlayerRent", `Взял в аренду ${model} за $${price}`)
    const asId = autosalon.list[player.currentAutosalonId][5];
    business.addMoney(asId, price/2);
    
    user.saveAccount(player);

    const allPos = getPos(autosalon.rentPos[player.currentAutosalonId]);
    const pos = allPos.slice(0, 3);
    const rot = allPos.slice(3, 6);

    //user.bigAlert(player, `Вы арендовали транспорт. Для отказа введите /unrent`, 'success');
    user.bigAlert(player, `Вы арендовали транспорт, подождите пару секунд`, 'success');
    player.notify('~b~Введите ~y~/unrent ~s~для отказа от аренды');
    let parkpos = getParkPosition(new mp.Vector3(pos[0], pos[1], pos[2]));
    if(parkpos && parkpos.pos){
      vehicles.spawnRentCar(player, parkpos.pos, parkpos.h, hash, color).then(veh => {
        setTimeout(() => {
          if(!mp.players.exists(player)) return;
          if(!mp.vehicles.exists(veh)) return;
          if (veh) player.putIntoVehicle(veh, RAGE_BETA ? 0 : -1);
        }, 100)
      });
      return;
    }
    vehicles.spawnRentCar(player, new mp.Vector3(pos[0], pos[1], pos[2]), rot[2], hash, color).then(veh => {
      setTimeout(() => {
        if(!mp.players.exists(player)) return;
        if(!mp.vehicles.exists(veh)) return;
        if (veh) player.putIntoVehicle(veh, RAGE_BETA ? 0 : -1);
      }, 100)
    });
  },

  changeRentPriceMenu: (player: PlayerMp, remoteId: number) => {
    methods.debug('autosalon.changeRentPriceMenu');
    if (!mp.players.exists(player)) return;
    if (business.get(remoteId, 'user_id') != user.getId(player)) return;
    const item = autosalon.list.find((item) => item[5] == remoteId);
    if (!item) return;
    const localId = autosalon.list.indexOf(item);
    const cars = autosalon.rentCars[localId];
    const m = menu.new(player, 'Аренда', 'Выберите ТС');
    cars.forEach((car) => {
      m.newItem({
        name: `${car.name} ($${car.price})`,
        onpress: () => {
          autosalon.changeRentPrice(player, car.id).then(() => {
            m.close();
            autosalon.changeRentPriceMenu(player, remoteId);
          });
        },
      });
    });
    m.newItem({
      name: '~r~Закрыть',
      onpress: () => m.close(),
    });
    m.open();
  },

  changeRentPrice: async (player: PlayerMp, id: number) => {
    methods.debug('autosalon.changeRentPrice');
    if (!mp.players.exists(player)) return;
    let input = await menu.input(player, 'Новую цену', '', 5, 'int');
    if (typeof input != 'number') return;
    const price = methods.parseInt(input);
    // if (isNaN(price)) {
    //   autosalon.changeRentPrice(player, id);
    //   return player.notify('~r~Введите сумму ($10-$50.000)');
    // }
    if (price < 10 || price > 50000) {
      autosalon.changeRentPrice(player, id);
      return player.notify('~r~Введите сумму ($10-$50.000)');
    }
    await carRentEntity.update({
      price: price
    }, { where: {
      id:id
    }})
    await autosalon.loadRentCars();
    player.notify('~g~Вы обновили цену аренды');
    return;
  },

  findNearest: (id: number) => {
    methods.debug('autosalon.findNearest');
    const posData = <[number, number ,number]>autosalon.list[id - 1].slice(1, 4)
    const pos = new mp.Vector3(posData[0], posData[1], posData[2]);
    return pos;
  },
};



let buyWaiting: Map<number, { id: number, colorId: number }> = new Map();

setInterval(() => {
  // methods.debug('autosalon:buyInterval');
  let q = false;
  buyWaiting.forEach((item, playerId) => {
    if (q) return;
    q = true;
    let player = mp.players.at(playerId);

    if (!mp.players.exists(player)) return buyWaiting.delete(playerId);
    buy(player, item.id, item.colorId).then((status) => {
      methods.debug(`Autosalon buy status | PLAYER_ID ${playerId} | CAR_ID ${item.id} | STATUS ${status}`);
      if (!status) {
        user.alert(player, 'Повторите попытку', 'error');
      }

    });
    buyWaiting.delete(playerId);
  });
}, 1500);

mp.events.add('server:autosalon:buyCar', (player: PlayerMp, id: number, colorId: number) => {
  methods.debug('server:autosalon:buyCar');
  if (!mp.players.exists(player)) return;
  buyWaiting.set(player.id, { id, colorId });
  player.notify('Ищем ТС на складе, подождите пару секунд');
});

function buy(player: PlayerMp, id: number, colorId: number) {
  methods.debug('autosalon:buyFunctionFromInterval');
  return new Promise(async (resolve) => {
    if (!player) return resolve(false);
    if (!mp.players.exists(player)) return resolve(false);
    const asId = player.currentAutosalonId;
    if (isNaN(Number(asId))) return resolve(false);
    const car: CarInstance = autosalon.cars[asId].get(id);
    if (!car) return resolve(false);
    if (car.id_user || car.user_name) return user.alert(player, 'ТС уже куплен', 'warning'), resolve(false);
    if (user.get(player, 'money') < car.price) {
      user.bigAlert(player, 'Недостаточно средств', 'warning');
      return resolve(false)
    }
  
    const color = autosalon.colors[colorId][0];
  
    if (!user.get(player, 'car_id1')) {
      resolve(await autosalon.buyCar(player, 1, car, color));
      return;
    } else if (!user.get(player, 'car_id2')) {
      if (
        !(
          user.get(player, 'id_house') != 0 ||
          user.get(player, 'apartment_id') != 0 ||
          user.get(player, 'condo_id') != 0
        )
      ) {
        return user.bigAlert(
          player,
          'У вас должен быть дом/склад/аппартаменты, чтобы купить 2-й транспорт',
          'warning'
        ), resolve(false);
      }
      resolve(await autosalon.buyCar(player, 2, car, color));
      return;
    } else if (!user.get(player, 'car_id3')) {
      if (user.get(player, 'id_house') == 0) {
        return user.bigAlert(player, 'У вас должен быть дом, чтобы купить 3-й транспорт', 'warning'), resolve(false);
      }
      if (houses.get(user.get(player, 'id_house'), 'price') < 1000000) {
        return user.bigAlert(
          player,
          'Ваш дом должен стоить минимум $1.000.000, чтобы купить 3-й транспорт',
          'warning'
        ), resolve(false);
      }
      resolve(await autosalon.buyCar(player, 3, car, color));
      return;
    } else if (!user.get(player, 'car_id4')) {
      if (user.get(player, 'id_house') == 0) {
        return user.bigAlert(player, 'У вас должен быть дом, чтобы купить 4-й транспорт', 'warning'), resolve(false);
      }
      if (houses.get(user.get(player, 'id_house'), 'price') < 2500000) {
        return user.bigAlert(
          player,
          'Ваш дом должен стоить минимум $2.500.000, чтобы купить 4-й транспорт',
          'warning'
        ), resolve(false);
      }
      resolve(await autosalon.buyCar(player, 4, car, color));
      return;
    } else if (!user.get(player, 'car_id5')) {
      if (user.get(player, 'id_house') == 0) {
        return user.bigAlert(player, 'У вас должен быть дом, чтобы купить 5-й транспорт', 'warning'), resolve(false);
      }
      if (houses.get(user.get(player, 'id_house'), 'price') < 5000000) {
        return user.bigAlert(
          player,
          'Ваш дом должен стоить минимум $5.000.000, чтобы купить 5-й транспорт',
          'warning'
        ), resolve(false);
      }
      resolve(await autosalon.buyCar(player, 5, car, color));
      return;
    } else if (
      !user.get(player, 'car_id6') ||
      !user.get(player, 'car_id7') ||
      !user.get(player, 'car_id8')
    ) {
      return user.bigAlert(player, '6, 7, 8 транспорт можно купить с помощью Appi Coins', 'info'), resolve(false);
    }
  })
}


mp.events.add(
  'server:autosalon:rentCar',
  (player: PlayerMp, id: number, colorId: number) => {
    methods.debug('server:autosalon:rentCar');
    if(!enabledSystem.rent) return player.notify("Салон на временных тех работах. Загляните чуть позже")
    // user.alert(player, 'Операция выполняется...');
    if (!mp.players.exists(player)) return;
    const asId = player.currentAutosalonId;
    if (isNaN(Number(asId))) return;
    const car = autosalon.rentCars[asId].get(id);
    if (!car) return;
    if (user.get(player, 'money') < car.price) {
      return user.bigAlert(player, 'Недостаточно средств', 'warning');
    }
    const color = autosalon.colors[colorId][0];
    // todo
    autosalon.rentCar(player, car.name.toLowerCase(), car.price, color);
  }
);






// mp.events.add('playerExitVehicle', (player: PlayerMp, vehicle: VehicleMp) => {
//   if (!player.getVariable('rentCar')) return;
//   const rentVeh = player.getVariable('rentCar');
//   if (!mp.vehicles.exists(rentVeh) || rentVeh != vehicle) return;
//   player.notify('~y~Арендованный ТС пропадет через ~b~10 ~y~мин.');
// });

// mp.events.add('playerEnterVehicle', (player: PlayerMp, vehicle: VehicleMp) => {
//   if (!player.getVariable('rentCar')) return;
//   const rentVeh = player.getVariable('rentCar');
//   if (!mp.vehicles.exists(rentVeh) || rentVeh != vehicle) return;
//   player.setVariable('rentCarTimer', null);
// });

mp.events.add('playerStartEnterVehicle', (player: PlayerMp, vehicle: VehicleMp, seat: number) => {
  methods.debug('playerStartEnterVehicle');
  if (seat != -1) return;
  const hash = vehicle.model;
  let className = methods.getVehicleInfo(hash).class_name;

  switch (className) {
    case 'Planes':
    case 'Helicopters':
      if (!user.get(player, 'air_lic')) {
        player.notify('~r~У Вас нет лицензии пилота');
        player.stopAnimation();
        return;
      }
      break;
    case 'Boats':
      if (!user.get(player, 'ship_lic')) {
        player.notify('~r~У Вас нет лицензии на водный транспорт');
        player.stopAnimation();
        return;
      }
      break;
    // case 'Commercials':
    // case 'Industrial':
    //   if (!user.get(player, 'c_lic')) {
    //     player.notify('~r~У Вас нет лицензии категории C');
    //     player.stopAnimation();
    //     return;
    //   }
    //   break;
    // case 'Compacts':
    // case 'Coupes':
    // case 'Muscle':
    // case 'Off-Road':
    // case 'Sedans':
    // case 'Sports':
    // case 'Sports Classics':
    // case 'Super':
    // case 'SUVs':
    // case 'Utility':
    // case 'Vans':
    //   if (!user.get(player, 'b_lic')) {
    //     player.notify('~r~У Вас нет лицензии категории B');
    //     player.stopAnimation();
    //     return;
    //   }
    //   break;
    // case 'Motorcycles':
    //   if (hash != -1842748181 && !user.get(player, 'a_lic')) {
    //     player.notify('~r~У Вас нет лицензии категории А');
    //     player.stopAnimation();
    //     return;
    //   }
    //   break;
  }
});

mp.events.add('server:autosalon:changeRentPrice', autosalon.changeRentPriceMenu);

setTimeout(() => {

  mp.events.register('server:autosalon:getAutosalonNalog', async (player: PlayerMp, id: number) => {
    methods.debug('server:autosalon:getAutosalonNalog');
    let item = await autosalonPercentEntity.findOne({
      where: {
        business_id: id
      }
    })
    if (!item) return;
    return item.percent;
  });
  mp.events.register('server:autosalon:isCarRented', (player: PlayerMp, vehId: number) => {
    methods.debug('server:autosalon:isCarRented');
    if (!mp.players.exists(player)) return false;
    const vehicle = mp.vehicles.at(vehId);
    if (!mp.vehicles.exists(vehicle)) return false;
    const rentedVehicle = mp.vehicles.toArray().find((veh) => veh.getVariable('rentOwner') == user.getId(player));
    if (!rentedVehicle) return false;
    if (!mp.vehicles.exists(rentedVehicle)) return false;
    if (rentedVehicle.id == vehicle.id) return true;
    return false;
  });
  mp.events.register('server:autosalon:stopBuyCar', async (player: PlayerMp) => {
    methods.debug('server:autosalon:stopBuyCar');
    if (!mp.players.exists(player)) return;
    user.showLoadDisplay(player);
    await methods.sleep(500);
    const asId = player.currentAutosalonId;
    if (isNaN(Number(asId))) return;
    const item = autosalon.list[asId];
    const exitPos = new mp.Vector3(item[1], item[2], item[3]);
    // player.position = exitPos;
    user.teleport(player, exitPos.x, exitPos.y, exitPos.z, player.heading - 180)
    // player.heading = player.heading - 180;
    player.dimension = 0;
    player.call('client:autosalon:stopBuyCar');
  });
  chat.registerCommand('unrent', (player: PlayerMp) => {
    methods.debug('chat:unrent');
    const vehicle: VehicleMp = mp.vehicles.toArray().find((veh) => veh.getVariable('rentOwner') == user.getId(player));
    if (!vehicle) return player.notify('~b~Вы не арендуете ТС');
    if (!mp.vehicles.exists(vehicle)) return;
    vehicle.destroy();
    player.notify('~g~Вы отказались от аренды ТС');
  });

}, 1000)



mp.events.add('server:autosalon:unrent', (player: PlayerMp) => {
  methods.debug('server:autosalon:unrent');
  const vehicle: VehicleMp = mp.vehicles.toArray().find((veh) => veh.getVariable('rentOwner') == user.getId(player));
  if (!vehicle) return player.notify('~b~Вы не арендуете ТС');
  if (!mp.vehicles.exists(vehicle)) return;
  vehicle.destroy();
  player.notify('~g~Вы отказались от аренды ТС');
});

mp.events.add('playerQuit', (player: PlayerMp) => {
  const vehicle: VehicleMp = mp.vehicles.toArray().find((veh) => veh.getVariable('rentOwner') == user.getId(player));
  if (!mp.vehicles.exists(vehicle)) return;
  const id = user.getId(player);
  vehicles.lockStatus(null, vehicle, true)
  setTimeout(() => {
    if(!user.getPlayerById(id)){
      if (mp.vehicles.exists(vehicle)) vehicle.destroy();
    }
  }, 5 * 60000)
});

