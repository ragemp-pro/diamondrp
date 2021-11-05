/// <reference path="../../declaration/server.ts" />

import { methods } from '../modules/methods';
import { business } from '../business';
import { user } from '../user';
import { vehicles } from '../vehicles';
import { RAGE_BETA } from '../../util/newrage';

export let rent = {
  listBike: [
    [-1012.002, -2682.319, 12.98185, 15],
    [56.84695, -1332.3, 28.31281, 16],
    [318.2011, 133.5345, 102.5149, 17],
    [-511.15, -290.38, 34.41, 18],
    [-3239.305, 978.7662, 11.71953, 19],
    [-264.9207, 6285.907, 30.47458, 20],
    [1681.711, 4849.298, 41.10908, 21],
    [1868.006, 3684.482, 32.73838, 22],
    [1932.747, 2624.953, 45.1698, 23],
    [297.4761, -602.786, 42.30347, 24],
    [1128.115, -504.1843, 63.19245, 148],
    [-53.82885, -914.3015, 28.43705, 149],
    [-873.4641, -811.7601, 18.29254, 150],
    [-824.2698, -116.8545, 36.58223, 151],
    [-734.49, -1299.63, 4.05, 152],
    [287.8639, 2594.688, 43.43363, 153],
    [387.4266, -948.5322, 28.42553, 157],
  ],


  loadAll: function() {
    methods.debug('rent.loadAll');
    rent.listBike.forEach(function(item) {
      let shopPos = new mp.Vector3(item[0], item[1], item[2]);
      methods.createBlip(shopPos, 226, 33, 0.7, 'Пункт аренды вело/мото');
      methods.createStaticCheckpoint(
        shopPos.x,
        shopPos.y,
        shopPos.z,
        'Нажмите ~g~Е~s~ чтобы открыть меню',
        0.8,
        -1,
        [33, 150, 243, 100],
        0.3
      );
    });
  },



  getBikeInRadius: function(pos: Vector3Mp, radius = 2) {
    let shopId = -1;
    rent.listBike.forEach(function(item, idx) {
      let shopPos = new mp.Vector3(item[0], item[1], item[2]);
      if (methods.distanceToPos(pos, shopPos) < radius) shopId = methods.parseInt(item[3]);
    });
    return shopId;
  },



  checkPosForOpenBikeMenu: function(player: PlayerMp) {
    // methods.debug('rent.checkPosForOpenBikeMenu');
    try {
      let playerPos = player.position;
      let shopId = rent.getBikeInRadius(playerPos, 2);
      if (shopId == -1) return;
      player.call('client:menuList:showRentBikeMenu', [shopId, business.getPrice(shopId)]);
    } catch (e) {
      methods.debug(e);
    }
  },

  findNearest: function(pos: Vector3Mp) {
    methods.debug('rent.findNearest');
    let prevPos = new mp.Vector3(9999, 9999, 9999);
    rent.listBike.forEach(function(item) {
      let shopPos = new mp.Vector3(item[0], item[1], item[2]);
      if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
        prevPos = shopPos;
    });
    return prevPos;
  },

  buy: function(
    player: PlayerMp,
    hash: number,
    spawnPoint: Vector3Mp,
    price: number,
    shopId: number
  ) {
    methods.debug('rent.buy');
    if (!user.isLogin(player)) return;
    if (user.getMoney(player) < price) {
      player.notify('~r~У вас недостаточно средств');
      return;
    }
    if (price < 1) return;
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
          player.notify('~r~У Вас нет лицензии пилота');
          return;
        }
        break;
      case 'Boats':
        if (!user.get(player, 'ship_lic')) {
          player.notify('~r~У Вас нет лицензии на водный транспорт');
          return;
        }
        break;
      case 'Commercials':
      case 'Industrial':
        if (!user.get(player, 'c_lic')) {
          player.notify('~r~У Вас нет лицензии категории C');
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
          player.notify('~r~У Вас нет лицензии категории B');
          return;
        }
        break;
      case 'Motorcycles':
        if (hash != -1842748181 && !user.get(player, 'a_lic')) {
          player.notify('~r~У Вас нет лицензии категории А. Вы можете взять Faggio');
          return;
        }
        break;
    }

    user.removeMoney(player, price);
    business.addMoney(shopId, price);

    // if (shopId == 86)
    //   spawnPoint = new mp.Vector3(
    //     Math.floor(rent.list[0][4]),
    //     Math.floor(rent.list[0][5]),
    //     Math.floor(rent.list[0][6])
    //   );
    // else if (shopId == 87)
    //   spawnPoint = new mp.Vector3(
    //     Math.floor(rent.list[1][4]),
    //     Math.floor(rent.list[1][5]),
    //     Math.floor(rent.list[1][6])
    //   );
    // else if (shopId == 88)
    //   spawnPoint = new mp.Vector3(
    //     Math.floor(rent.list[2][4]),
    //     Math.floor(rent.list[2][5]),
    //     Math.floor(rent.list[2][6])
    //   );
    // else if (shopId == 89)
    //   spawnPoint = new mp.Vector3(
    //     Math.floor(rent.list[3][4]),
    //     Math.floor(rent.list[3][5]),
    //     Math.floor(rent.list[3][6])
    //   );
    // else if (shopId == 90)
    //   spawnPoint = new mp.Vector3(
    //     Math.floor(rent.list[4][4]),
    //     Math.floor(rent.list[4][5]),
    //     Math.floor(rent.list[4][6])
    //   );
    // else if (shopId == 93)
    //   spawnPoint = new mp.Vector3(
    //     Math.floor(rent.list[5][4]),
    //     Math.floor(rent.list[5][5]),
    //     Math.floor(rent.list[5][6])
    //   );

    player.notify('~g~Вы арендовали транспорт');
    player.notify('~g~Для того чтобы его открыть, нажмите ~s~L');
    vehicles.spawnRentCar(player, spawnPoint, 0, hash).then(veh => {
      if (veh) player.putIntoVehicle(veh, RAGE_BETA ? 0 : -1);
    });
  },
};
