/// <reference path="../declaration/server.ts" />

import { Container } from './modules/data';
import { enums } from './enums';
import { user } from './user';
import { coffer } from './coffer';
import { fuel } from './business/fuel';
import { methods, DynamicCheckpoint } from './modules/methods';
import { vSync } from './managers/vSync';
import { vehicleBoosterEntity } from './modules/entity/vehicleBooster';
import { inventory } from './inventory';
import { carsEntity } from './modules/entity/carsModel';
import { Sequelize } from 'sequelize-typescript';
import { vehicleSalePoints } from '../util/vehsell';
import { menu } from './modules/menu';
import { vehicleInfo } from './modules/vehicleInfo';

const MAX_VEHICLE_AFK_MINUTES = 30
const AFK_TIME_INTERVAL_SECS = 30
const offset = 200000;
export const vehicleOffset = offset;
export const offsetFr = -5000;
export const offsetFrNew = -6000;
const offsetJob = -10000;
const offsetRent = -1000000;
const offsetAll = -2000000;
let jobCount = 0;

let boostList:Map<string,number> = new Map();
let boostListHash:Map<number,number> = new Map();


// let creationQueue: {
//   args: [
//     number,
//     Vector3Mp,
//     { heading: number; numberPlate: string; engine: boolean; dimension: number }
//   ];
//   cb(veh: VehicleMp): void;
// }[] = [];
let removalQueue: VehicleMp[] = [];
let CountAllCars = 0;
let CountRentCars = 0;

export let vehSalesPointsData:[VehicleMp, PlayerMp, TextLabelMp, number, string][] = []
export let vehSalesShowChecks: DynamicCheckpoint[] = []

setInterval(() => {
  vehSalesPointsData.map((item, index) => {
    if(!item) return;
    if (!mp.players.exists(item[1]) || !mp.vehicles.exists(item[0]) || !mp.labels.exists(item[2])) {
      clearSellerPos(index)
    } else {
      if (methods.distanceToPos(item[0].position, vehicleSalePoints[index][0]) > 2){
        clearSellerPos(index)
      }
    }
  })
}, 30000)

const clearSellerPos = (index: number) => {
  if (vehSalesPointsData[index] && mp.labels.exists(vehSalesPointsData[index][2])) vehSalesPointsData[index][2].destroy();
  vehSalesPointsData[index] = null;
  let check = vehSalesShowChecks[index];
  if (check) check.updateDimension(1);
}


setTimeout(() => {
  mp.events.register('autosale:buyVeh', (player: PlayerMp, cost: number) => {
    if(!player.vehicle) return player.notify("~r~Вы должны быть в транспорте");
    if (user.isDriver(player)) return player.notify("~r~Вы не должны быть за рулём");
    const point = vehSalesPointsData.find(q => q && q[0] == player.vehicle);
    if (!point) return player.notify("~r~ТС не продаётся"); 
    const pointIndex = vehSalesPointsData.findIndex(q => q && q[0] == player.vehicle);
    if(!mp.players.exists(point[1])) return player.notify("~r~Продавец не в сети");
    if (point[1].vehicle !== player.vehicle) return player.notify("~r~Продавец должен быть в ТС");
    if(vehicles.getVehicleOwnerId(player.vehicle) !== user.getId(point[1])) return player.notify("~r~Данный ТС больше не принадлежит продавцу");
    if (point[3] !== cost) return player.notify(`~r~Стоимость продажи изменилась`);
    let slot = vehicles.getVehSlot(point[1], player.vehicle);
    clearSellerPos(pointIndex)
    mp.events.call('server:car:sellToPlayer:accept', player, point[3], user.getId(point[1]), slot)
  })

  vehicleSalePoints.map((item, index) => {
    const clear = () => {
      clearSellerPos(index)
    }
    const checkFree = () => {
      if (vehSalesPointsData[index]) {
        if (!mp.vehicles.exists(vehSalesPointsData[index][0]) || !mp.players.exists(vehSalesPointsData[index][1]) || !mp.labels.exists(vehSalesPointsData[index][2])) {
          clear();
          return true
        } else if (methods.distanceToPos(vehSalesPointsData[index][0].position, item[0]) > 2){
          clear();
          return true
        }
        return false
      }
      return true
    }
    const canControl = (player: PlayerMp) => {
      if (!player.vehicle){
        player.notify("~r~Вы должны быть в транспорте");
        return false;
      }
      if (!vehSalesPointsData[index]) {
        player.notify("~r~Место свободно");
        return false;
      }
      if (checkFree()) {
        player.notify("~r~Место свободно");
        return false;
      }
      if (vehSalesPointsData[index][1].id !== player.id){
        player.notify("~r~Данное место занято другим человеком");
        return false;
      }
      if (vehSalesPointsData[index][0].id !== player.vehicle.id){
        player.notify("~r~Данное место занято другим ТС");
        return false;
      }
      if (!user.isDriver(player)){
        player.notify("~r~Вы должны быть за рулём");
        return false; 
      }
      return true;
    }
    methods.createDynamicCheckpoint(new mp.Vector3(item[0].x, item[0].y, item[0].z + 0.5), "Нажмите ~g~E~w~ чтобы выставить ТС на продажу", player => {
      if(!player.vehicle) return player.notify("~r~Вы должны быть в транспорте");
      if (!user.isDriver(player)) return player.notify("~r~Вы должны быть за рулём");
      
      // if (vehSalesPointsData.find((q, i) => !!q && index !== i && q[1] && q[1].id === player.id)) return player.notify("~r~Вы уже продаёте ТС в другом месте");
      if (vehSalesPointsData.find((q, i) => !!q && index !== i && q[0] && q[0].id === player.vehicle.id)) return player.notify("~r~Ваш ТС уже продаётся в другом месте");
      if (!checkFree()) {
        let m = menu.new(player, "Авторынок", "Действия");
        m.newItem({
          name: "~y~Сменить стоимость",
          onpress: () => {
            if (!canControl(player)) return;
            menu.input(player, "Укажите стоимость продажи", "", 9, "int").then(sum => {
              if (!canControl(player)) return;
              if (!sum) return;
              if (sum < 100) return player.notify("~r~Стоимость не может быть ниже 100$")
              if (sum > 999999999) return player.notify("~r~Укажите корректную стоимость");
              if (sum === vehSalesPointsData[index][3]) return;
              vehSalesPointsData[index][3] = sum;
              vehSalesPointsData[index][2].text = `${vehSalesPointsData[index][4]}\n$${methods.numberFormat(sum)}\n${user.getRpName(player)}\n${user.getPhone(player)}`
            });
          }
        })
        m.newItem({
          name: "~g~Предложить покупку пассажиру",
          onpress: () => {
            if (!canControl(player)) return;
            const occupants = player.vehicle.getOccupants();
            if (occupants.length < 2) return player.notify("~r~В транспорте нет пассажира");
            if (occupants.length > 2) return player.notify("~r~В транспорте должны быть только вы и покупатель");
            const target = occupants.find(q => q.id !== player.id);
            const veh = vehSalesPointsData[index][0];
            let car = vehicles.getData(veh.getVariable('container'));
            let upgrade = JSON.parse(car.get('upgrade'));
            const name = vehSalesPointsData[index][4];
            m.close();
            player.notify("~g~Предложение о покупке отправлено");
            user.setGui(target, "autosale");
            mp.events.triggerBrowser(target, "autosale:data", "buy", index, veh.modelname, name, veh.numberPlate, `${user.getRpName(vehSalesPointsData[index][1])} ${user.getPhone(vehSalesPointsData[index][1])}`, upgrade['11'], upgrade['12'], upgrade['13'], !!upgrade['14'], vehSalesPointsData[index][3], car.get('price'));
          }
        })
        m.newItem({
          name: "~r~Снять с продажи",
          onpress: () => {
            if (!canControl(player)) return;
            user.accept(player, "Вы уверены?").then(status => {
              if (!canControl(player)) return;
              m.close();
              if (status) clear();
            })
          }
        })

        m.open();
        return;
      }
      
      const owner = vehicles.getVehicleOwnerId(player.vehicle) === user.getId(player);
      if (!owner) return player.notify("~r~Вы должны быть владельцем ТС");
      if (player.vehicle.velocity.x + player.vehicle.velocity.y + player.vehicle.velocity.z > 0.1) return player.notify("~r~Остановите ТС прежде чем выставить на продажу")
      menu.input(player, "Укажите стоимость продажи", "", 9, "int").then(sum => {
        if(!sum) return;
        if(sum < 100) return player.notify("~r~Стоимость не может быть ниже 100$")
        if(sum > 999999999) return player.notify("~r~Укажите корректную стоимость");
        if(!player.vehicle) return player.notify("~r~Вы должны быть в транспорте");
        if (!user.isDriver(player)) return player.notify("~r~Вы должны быть за рулём");
        if (!checkFree()) return player.notify("~r~Данное место занято");
        let name: string = player.vehicle.modelname;
        const cfg = vehicleInfo.findByVeh(player.vehicle);
        if(cfg) name = cfg.display_name
        vehSalesPointsData[index] = [
          player.vehicle, 
          player, 
          mp.labels.new(
            `${name}\n$${methods.numberFormat(sum)}\n${user.getRpName(player)}\n${user.getPhone(player)}`, 
            new mp.Vector3(item[1].x, item[1].y, item[1].z + 1), {
              drawDistance: 5
            }), 
          sum, 
          name
        ];
        showCheckpoint.updateDimension(0)
        player.notify("~g~Вы выставили ТС на продажу. Если ваш ТС покинет место продажи - объявление будет снято")
      })
    }, 2.0, 0, [0, 0, 255, 90], 1, 27)
    let showCheckpoint = methods.createDynamicCheckpoint(new mp.Vector3(item[1].x, item[1].y, item[1].z), "Нажмите ~g~E~w~ чтобы ознакомится с ТС", player => {
      if (checkFree()) return player.notify("~r~Место не занято");
      const veh = vehSalesPointsData[index][0] 
      let car = vehicles.getData(veh.getVariable('container'));
      let upgrade = JSON.parse(car.get('upgrade'));
      const name = vehSalesPointsData[index][4];
      user.setGui(player, "autosale");
      mp.events.triggerBrowser(player, "autosale:data", "show", index, veh.modelname, name, veh.numberPlate, `${user.getRpName(vehSalesPointsData[index][1])} ${user.getPhone(vehSalesPointsData[index][1])}`, upgrade['11'], upgrade['12'], upgrade['13'], !!upgrade['14'], vehSalesPointsData[index][3], car.get('price'));
    }, 1.0, 1, [0, 255, 0, 60]);

    vehSalesShowChecks[index] = showCheckpoint;
  })
}, 15000)




export let vehicles = {
  reloadBoostList: () => {
    vehicleBoosterEntity.findAll().then(items => {
      boostList = new Map();
      items.forEach(item => {
        boostList.set(item.model, item.speed)
        boostListHash.set(mp.joaat(item.model), item.speed)
      })
      mp.vehicles.forEach(vehicle => {
        if(boostListHash.has(vehicle.model)){
          vehicle.setVariable('boost', boostListHash.get(vehicle.model))
        }
      })
    })
  },
  newOrdered: (
    cb: (veh: VehicleMp) => void,
    creationArguments: [
      number,
      Vector3Mp,
      { heading: number; numberPlate: string; engine: boolean; dimension: number }, 
      string?
    ]
  ) => {

    let vehicle = <VehicleMp>mp.vehicles.new.apply(mp.vehicles, creationArguments);
    vehicle.position = creationArguments[1];
    if(boostListHash.has(vehicle.model)){
      vehicle.setVariable('boost', boostListHash.get(vehicle.model))
    }
    vSync.setEngineState(vehicle, false);
    if(creationArguments[3]) vehicle.modelname = creationArguments[3];
    vehicle.modelhash = creationArguments[0];
    cb(vehicle)
  },

  destroyOrdered: (vehicle: VehicleMp) => {
    if (mp.vehicles.exists(vehicle)) {
      removalQueue.push(vehicle);
    }
  },

  // processVehicleManager: () => {
  //   let cbs = [];

  //   for (let creation of creationQueue) {
  //     try {
  //       while(mp.vehicles.toArray().find(veh => veh.numberPlate == creation.args[2].numberPlate)) mp.vehicles.toArray().find(veh => veh.numberPlate == creation.args[2].numberPlate).destroy();
  //       let vehicle = mp.vehicles.new.apply(mp.vehicles, creation.args);
  //       vehicle.position = creation.args[1];
  //       vSync.setEngineState(vehicle, false);
  //       cbs.push([vehicle, creation.cb]);
  //     } catch (e) {
  //       methods.debug(e);
  //     }
  //     //await methods.sleep(100);
  //   }

  //   creationQueue = [];

  //   for (let removal of removalQueue) {
  //     try {
  //       removal.destroy();
  //     } catch (e) {
  //       methods.debug(e);
  //     }
  //   }

  //   removalQueue = [];

  //   for (let cb of cbs) {
  //     cb[1](cb[0]);
  //   }
  // },

  loadAllTimers: () => {
    methods.debug('vehicles.loadAllTimers');
    // setInterval(vehicles.processVehicleManager, 600);
  },

  loadPlayerVehicle: (player: PlayerMp) => {
    methods.debug('vehicles.loadPlayerVehicle');

    const playerId = user.getId(player);
    if (playerId && playerId > 0) {
      carsEntity.findAll({ where: { id_user: playerId}}).then(rows => {
        rows.forEach(function(item) {
          Container.Set(offset + methods.parseInt(item.id), 'id', item.id);
          Container.Set(offset + methods.parseInt(item.id), 'id_user', item.id_user);
          Container.Set(offset + methods.parseInt(item.id), 'user_name', item.user_name);
          Container.Set(offset + methods.parseInt(item.id), 'name', item.name);
          Container.Set(offset + methods.parseInt(item.id), 'class_type', item.class_type);
          Container.Set(offset + methods.parseInt(item.id), 'hash', item.hash);
          Container.Set(offset + methods.parseInt(item.id), 'price', item.price);
          Container.Set(offset + methods.parseInt(item.id), 'stock', item.stock);
          Container.Set(offset + methods.parseInt(item.id), 'stock_full', item.stock_full);
          Container.Set(offset + methods.parseInt(item.id), 'stock_item', item.stock_item);
          Container.Set(offset + methods.parseInt(item.id), 'fuel', item.fuel);
          Container.Set(offset + methods.parseInt(item.id), 'full_fuel', item.full_fuel);
          Container.Set(offset + methods.parseInt(item.id), 'fuel_minute', item.fuel_minute);
          Container.Set(offset + methods.parseInt(item.id), 'color1', item.color1);
          Container.Set(offset + methods.parseInt(item.id), 'color2', item.color2);
          Container.Set(offset + methods.parseInt(item.id), 'neon_type', item.neon_type);
          Container.Set(offset + methods.parseInt(item.id), 'neon_r', item.neon_r);
          Container.Set(offset + methods.parseInt(item.id), 'neon_g', item.neon_g);
          Container.Set(offset + methods.parseInt(item.id), 'neon_b', item.neon_b);
          Container.Set(offset + methods.parseInt(item.id), 'number', item.number);
          Container.Set(
            offset + methods.parseInt(item.id),
            'wanted_level',
            item.wanted_level
          );
          Container.Set(offset + methods.parseInt(item.id), 'lock_status', item.lock_status);
          Container.Set(offset + methods.parseInt(item.id), 's_mp', item.s_mp);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_l', item.s_wh_bk_l);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_b_l', item.s_wh_b_l);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_r', item.s_wh_bk_r);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_b_r', item.s_wh_b_r);
          Container.Set(offset + methods.parseInt(item.id), 's_engine', item.s_engine);
          Container.Set(
            offset + methods.parseInt(item.id),
            's_suspension',
            item.s_suspension
          );
          Container.Set(offset + methods.parseInt(item.id), 's_body', item.s_body);
          Container.Set(offset + methods.parseInt(item.id), 's_candle', item.s_candle);
          Container.Set(offset + methods.parseInt(item.id), 's_oil', item.s_oil);
          Container.Set(offset + methods.parseInt(item.id), 'livery', item.livery);
          Container.Set(offset + methods.parseInt(item.id), 'is_visible', item.is_visible);
          Container.Set(offset + methods.parseInt(item.id), 'x', item.x);
          Container.Set(offset + methods.parseInt(item.id), 'y', item.y);
          Container.Set(offset + methods.parseInt(item.id), 'z', item.z);
          Container.Set(offset + methods.parseInt(item.id), 'rot', item.rot);
          Container.Set(offset + methods.parseInt(item.id), 'x_park', item.x_park);
          Container.Set(offset + methods.parseInt(item.id), 'y_park', item.y_park);
          Container.Set(offset + methods.parseInt(item.id), 'z_park', item.z_park);
          Container.Set(offset + methods.parseInt(item.id), 'rot_park', item.rot_park);
          Container.Set(offset + methods.parseInt(item.id), 'upgrade', item.upgrade);
          Container.Set(offset + methods.parseInt(item.id), 'money_tax', item.money_tax);
          Container.Set(offset + methods.parseInt(item.id), 'score_tax', item.score_tax);
          Container.Set(
            offset + methods.parseInt(item.id),
            'cop_park_name',
            item.cop_park_name
          );
          Container.Set(offset + methods.parseInt(item.id), 'is_cop_park', item.is_cop_park);
          Container.Set(offset + methods.parseInt(item.id), 'sell_price', item.sell_price);

          if (item.sell_price > 0) {
            return;
          }

          //if (item.name == 'Camper' || item.name == 'Journey')
          // if (item.x_park != 0) vehicles.spawnPlayerCar(item.id);
        });
        //console.timeEnd('loadCarsForPlayer');
        methods.debug(`All vehicles loaded for player ${playerId} (${rows.length})`);
      });
    }
  },

  loadPlayerVehicleByPlayerId: (playerId: number, dim = 0) => {
    methods.debug('vehicles.loadPlayerVehicle');

    if (playerId && playerId > 0) {
      carsEntity.findAll({where: {id_user:playerId}}).then(rows => {
        // console.time('loadCarsForPlayer');
        rows.forEach(function(item) {
          Container.Set(offset + methods.parseInt(item.id), 'id', item.id);
          Container.Set(offset + methods.parseInt(item.id), 'id_user', item.id_user);
          Container.Set(offset + methods.parseInt(item.id), 'user_name', item.user_name);
          Container.Set(offset + methods.parseInt(item.id), 'name', item.name);
          Container.Set(offset + methods.parseInt(item.id), 'class_type', item.class_type);
          Container.Set(offset + methods.parseInt(item.id), 'hash', item.hash);
          Container.Set(offset + methods.parseInt(item.id), 'price', item.price);
          Container.Set(offset + methods.parseInt(item.id), 'stock', item.stock);
          Container.Set(offset + methods.parseInt(item.id), 'stock_full', item.stock_full);
          Container.Set(offset + methods.parseInt(item.id), 'stock_item', item.stock_item);
          Container.Set(offset + methods.parseInt(item.id), 'fuel', item.fuel);
          Container.Set(offset + methods.parseInt(item.id), 'full_fuel', item.full_fuel);
          Container.Set(offset + methods.parseInt(item.id), 'fuel_minute', item.fuel_minute);
          Container.Set(offset + methods.parseInt(item.id), 'color1', item.color1);
          Container.Set(offset + methods.parseInt(item.id), 'color2', item.color2);
          Container.Set(offset + methods.parseInt(item.id), 'neon_type', item.neon_type);
          Container.Set(offset + methods.parseInt(item.id), 'neon_r', item.neon_r);
          Container.Set(offset + methods.parseInt(item.id), 'neon_g', item.neon_g);
          Container.Set(offset + methods.parseInt(item.id), 'neon_b', item.neon_b);
          Container.Set(offset + methods.parseInt(item.id), 'number', item.number);
          Container.Set(
            offset + methods.parseInt(item.id),
            'wanted_level',
            item.wanted_level
          );
          Container.Set(offset + methods.parseInt(item.id), 'lock_status', item.lock_status);
          Container.Set(offset + methods.parseInt(item.id), 's_mp', item.s_mp);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_l', item.s_wh_bk_l);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_b_l', item.s_wh_b_l);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_r', item.s_wh_bk_r);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_b_r', item.s_wh_b_r);
          Container.Set(offset + methods.parseInt(item.id), 's_engine', item.s_engine);
          Container.Set(
            offset + methods.parseInt(item.id),
            's_suspension',
            item.s_suspension
          );
          Container.Set(offset + methods.parseInt(item.id), 's_body', item.s_body);
          Container.Set(offset + methods.parseInt(item.id), 's_candle', item.s_candle);
          Container.Set(offset + methods.parseInt(item.id), 's_oil', item.s_oil);
          Container.Set(offset + methods.parseInt(item.id), 'livery', item.livery);
          Container.Set(offset + methods.parseInt(item.id), 'is_visible', item.is_visible);
          Container.Set(offset + methods.parseInt(item.id), 'x', item.x);
          Container.Set(offset + methods.parseInt(item.id), 'y', item.y);
          Container.Set(offset + methods.parseInt(item.id), 'z', item.z);
          Container.Set(offset + methods.parseInt(item.id), 'rot', item.rot);
          Container.Set(offset + methods.parseInt(item.id), 'x_park', item.x_park);
          Container.Set(offset + methods.parseInt(item.id), 'y_park', item.y_park);
          Container.Set(offset + methods.parseInt(item.id), 'z_park', item.z_park);
          Container.Set(offset + methods.parseInt(item.id), 'rot_park', item.rot_park);
          Container.Set(offset + methods.parseInt(item.id), 'upgrade', item.upgrade);
          Container.Set(offset + methods.parseInt(item.id), 'money_tax', item.money_tax);
          Container.Set(offset + methods.parseInt(item.id), 'score_tax', item.score_tax);
          Container.Set(
            offset + methods.parseInt(item.id),
            'cop_park_name',
            item.cop_park_name
          );
          Container.Set(offset + methods.parseInt(item.id), 'is_cop_park', item.is_cop_park);
          Container.Set(offset + methods.parseInt(item.id), 'sell_price', item.sell_price);

          if (item.sell_price > 0) {
            return;
          }

          //if (item.name == 'Camper' || item.name == 'Journey')
          if (item.x_park != 0) vehicles.spawnPlayerCar(item.id, false, dim);
        });
        // console.timeEnd('loadCarsForPlayer');
        methods.debug(`All vehicles loaded for player ${playerId} (${rows.length})`);
      });
    }
  },
  loadPlayerVehicleById: async (player: PlayerMp, id: number) => {
    methods.debug('vehicles.loadPlayerVehicleById');

    const playerId = user.getId(player);
    if (playerId && playerId > 0) {
      carsEntity.findAll({
        where: {id_user: playerId,
        id: id,}
      }).then(rows => {
        // console.time('loadCarsForPlayer');
        rows.forEach(function(item) {
          //if (Container.Has(offset + methods.parseInt(item.id), 'id'))
          //    return;
          Container.Set(offset + methods.parseInt(item.id), 'id', item.id);
          Container.Set(offset + methods.parseInt(item.id), 'id_user', item.id_user);
          Container.Set(offset + methods.parseInt(item.id), 'user_name', item.user_name);
          Container.Set(offset + methods.parseInt(item.id), 'name', item.name);
          Container.Set(offset + methods.parseInt(item.id), 'class_type', item.class_type);
          Container.Set(offset + methods.parseInt(item.id), 'hash', item.hash);
          Container.Set(offset + methods.parseInt(item.id), 'price', item.price);
          Container.Set(offset + methods.parseInt(item.id), 'stock', item.stock);
          Container.Set(offset + methods.parseInt(item.id), 'stock_full', item.stock_full);
          Container.Set(offset + methods.parseInt(item.id), 'stock_item', item.stock_item);
          Container.Set(offset + methods.parseInt(item.id), 'fuel', item.fuel);
          Container.Set(offset + methods.parseInt(item.id), 'full_fuel', item.full_fuel);
          Container.Set(offset + methods.parseInt(item.id), 'fuel_minute', item.fuel_minute);
          Container.Set(offset + methods.parseInt(item.id), 'color1', item.color1);
          Container.Set(offset + methods.parseInt(item.id), 'color2', item.color2);
          Container.Set(offset + methods.parseInt(item.id), 'neon_type', item.neon_type);
          Container.Set(offset + methods.parseInt(item.id), 'neon_r', item.neon_r);
          Container.Set(offset + methods.parseInt(item.id), 'neon_g', item.neon_g);
          Container.Set(offset + methods.parseInt(item.id), 'neon_b', item.neon_b);
          Container.Set(offset + methods.parseInt(item.id), 'number', item.number);
          Container.Set(
            offset + methods.parseInt(item.id),
            'wanted_level',
            item.wanted_level
          );
          Container.Set(offset + methods.parseInt(item.id), 'lock_status', item.lock_status);
          Container.Set(offset + methods.parseInt(item.id), 's_mp', item.s_mp);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_l', item.s_wh_bk_l);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_b_l', item.s_wh_b_l);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_r', item.s_wh_bk_r);
          Container.Set(offset + methods.parseInt(item.id), 's_wh_b_r', item.s_wh_b_r);
          Container.Set(offset + methods.parseInt(item.id), 's_engine', item.s_engine);
          Container.Set(
            offset + methods.parseInt(item.id),
            's_suspension',
            item.s_suspension
          );
          Container.Set(offset + methods.parseInt(item.id), 's_body', item.s_body);
          Container.Set(offset + methods.parseInt(item.id), 's_candle', item.s_candle);
          Container.Set(offset + methods.parseInt(item.id), 's_oil', item.s_oil);
          Container.Set(offset + methods.parseInt(item.id), 'livery', item.livery);
          Container.Set(offset + methods.parseInt(item.id), 'is_visible', item.is_visible);
          Container.Set(offset + methods.parseInt(item.id), 'x', item.x);
          Container.Set(offset + methods.parseInt(item.id), 'y', item.y);
          Container.Set(offset + methods.parseInt(item.id), 'z', item.z);
          Container.Set(offset + methods.parseInt(item.id), 'rot', item.rot);
          Container.Set(offset + methods.parseInt(item.id), 'x_park', item.x_park);
          Container.Set(offset + methods.parseInt(item.id), 'y_park', item.y_park);
          Container.Set(offset + methods.parseInt(item.id), 'z_park', item.z_park);
          Container.Set(offset + methods.parseInt(item.id), 'rot_park', item.rot_park);
          Container.Set(offset + methods.parseInt(item.id), 'upgrade', item.upgrade);
          Container.Set(offset + methods.parseInt(item.id), 'money_tax', item.money_tax);
          Container.Set(offset + methods.parseInt(item.id), 'score_tax', item.score_tax);
          Container.Set(
            offset + methods.parseInt(item.id),
            'cop_park_name',
            item.cop_park_name
          );
          Container.Set(offset + methods.parseInt(item.id), 'is_cop_park', item.is_cop_park);

          if (item.sell_price > 0) {
            return;
          }

          //if (item.name == 'Camper' || item.name == 'Journey')
          if (item.x_park != 0) vehicles.spawnPlayerCar(item.id);
        });
        // console.timeEnd('loadCarsForPlayer');
        methods.debug(`All vehicles loaded for player ${playerId} (${rows.length})`);
      });
    }
  },
  removePlayerVehicle: (userId: number) => {
    mp.vehicles.forEach(function(v) {
      if (vehicles.exists(v) && v.getVariable('id_user') == userId) {
        vehicles.save(v.getVariable('container'));
        v.destroy();
      }
    });
  },
  save: (id: any) => {
    if(!id) return;
    if(typeof id != "number") return;
    
    methods.debug('vehicles.save');
  
    id = offset + id;
    if (!Container.Has(id, 'id')) {
      return;
    }
    if (!Container.Has(id, 'id_user')) {
      return;
    }

    carsEntity.update({
      fuel: parseFloat(Container.Get(id, 'fuel')),
      color1: methods.parseInt(Container.Get(id, 'color1')),
      color2: methods.parseInt(Container.Get(id, 'color2')),
      neon_type: methods.parseInt(Container.Get(id, 'neon_type')),
      neon_r: methods.parseInt(Container.Get(id, 'neon_r')),
      neon_g: methods.parseInt(Container.Get(id, 'neon_g')),
      neon_b: methods.parseInt(Container.Get(id, 'neon_b')),
      number: Container.Get(id, 'number'),
      wanted_level: methods.parseInt(Container.Get(id, 'wanted_level')),
      lock_status: methods.parseInt(Container.Get(id, 'lock_status')),
      livery: methods.parseInt(Container.Get(id, 'livery')),
      x_park: parseFloat(Container.Get(id, 'x_park')),
      y_park: parseFloat(Container.Get(id, 'y_park')),
      z_park: parseFloat(Container.Get(id, 'z_park')),
      rot_park: parseFloat(Container.Get(id, 'rot_park')),
      upgrade: Container.Get(id, 'upgrade'),
    }, { where: { id: methods.parseInt(Container.Get(id, 'id')) } })
  
  },
  loadAll: (dim = 0, spawn = true) => {
    methods.debug('vehicles.loadAll');
    carsEntity.findAll().then(rows => {

      console.time('loadCars');
      rows.forEach(function(item) {
        // if (Container.Has(offset + methods.parseInt(item.id), 'id')) return;
        Container.Set(offset + methods.parseInt(item.id), 'id', item.id);
        Container.Set(offset + methods.parseInt(item.id), 'id_user', item.id_user);
        Container.Set(offset + methods.parseInt(item.id), 'user_name', item.user_name);
        Container.Set(offset + methods.parseInt(item.id), 'name', item.name);
        Container.Set(offset + methods.parseInt(item.id), 'class_type', item.class_type);
        Container.Set(offset + methods.parseInt(item.id), 'hash', item.hash);
        Container.Set(offset + methods.parseInt(item.id), 'price', item.price);
        Container.Set(offset + methods.parseInt(item.id), 'stock', item.stock);
        Container.Set(offset + methods.parseInt(item.id), 'stock_full', item.stock_full);
        Container.Set(offset + methods.parseInt(item.id), 'stock_item', item.stock_item);
        Container.Set(offset + methods.parseInt(item.id), 'fuel', item.fuel);
        Container.Set(offset + methods.parseInt(item.id), 'full_fuel', item.full_fuel);
        Container.Set(offset + methods.parseInt(item.id), 'fuel_minute', item.fuel_minute);
        Container.Set(offset + methods.parseInt(item.id), 'color1', item.color1);
        Container.Set(offset + methods.parseInt(item.id), 'color2', item.color2);
        Container.Set(offset + methods.parseInt(item.id), 'neon_type', item.neon_type);
        Container.Set(offset + methods.parseInt(item.id), 'neon_r', item.neon_r);
        Container.Set(offset + methods.parseInt(item.id), 'neon_g', item.neon_g);
        Container.Set(offset + methods.parseInt(item.id), 'neon_b', item.neon_b);
        Container.Set(offset + methods.parseInt(item.id), 'number', item.number);
        Container.Set(offset + methods.parseInt(item.id), 'wanted_level', item.wanted_level);
        Container.Set(offset + methods.parseInt(item.id), 'lock_status', item.lock_status);
        Container.Set(offset + methods.parseInt(item.id), 's_mp', item.s_mp);
        Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_l', item.s_wh_bk_l);
        Container.Set(offset + methods.parseInt(item.id), 's_wh_b_l', item.s_wh_b_l);
        Container.Set(offset + methods.parseInt(item.id), 's_wh_bk_r', item.s_wh_bk_r);
        Container.Set(offset + methods.parseInt(item.id), 's_wh_b_r', item.s_wh_b_r);
        Container.Set(offset + methods.parseInt(item.id), 's_engine', item.s_engine);
        Container.Set(offset + methods.parseInt(item.id), 's_suspension', item.s_suspension);
        Container.Set(offset + methods.parseInt(item.id), 's_body', item.s_body);
        Container.Set(offset + methods.parseInt(item.id), 's_candle', item.s_candle);
        Container.Set(offset + methods.parseInt(item.id), 's_oil', item.s_oil);
        Container.Set(offset + methods.parseInt(item.id), 'livery', item.livery);
        Container.Set(offset + methods.parseInt(item.id), 'is_visible', item.is_visible);
        Container.Set(offset + methods.parseInt(item.id), 'x', item.x);
        Container.Set(offset + methods.parseInt(item.id), 'y', item.y);
        Container.Set(offset + methods.parseInt(item.id), 'z', item.z);
        Container.Set(offset + methods.parseInt(item.id), 'rot', item.rot);
        Container.Set(offset + methods.parseInt(item.id), 'x_park', item.x_park);
        Container.Set(offset + methods.parseInt(item.id), 'y_park', item.y_park);
        Container.Set(offset + methods.parseInt(item.id), 'z_park', item.z_park);
        Container.Set(offset + methods.parseInt(item.id), 'rot_park', item.rot_park);
        Container.Set(offset + methods.parseInt(item.id), 'upgrade', item.upgrade);
        Container.Set(offset + methods.parseInt(item.id), 'money_tax', item.money_tax);
        Container.Set(offset + methods.parseInt(item.id), 'score_tax', item.score_tax);
        Container.Set(
          offset + methods.parseInt(item.id),
          'cop_park_name',
          item.cop_park_name
        );
        Container.Set(offset + methods.parseInt(item.id), 'is_cop_park', item.is_cop_park);

        if(spawn) vehicles.spawnPlayerCar(item.id, false, dim);
      });
      console.timeEnd('loadCars');
    });
  },
  set: function(id: number, key: any, val: any) {
    //methods.debug(`vehicles.set ${id} ${key} ${val} | `);
    Container.Set(offset + methods.parseInt(id), key, val);
  },
  get: function(id: number, key: any) {
    //methods.debug('vehicles.get');
    return Container.Get(offset + methods.parseInt(id), key);
  },
  getData: function(id: number) {
    //methods.debug('vehicles.getData');
    return Container.GetAll(offset + methods.parseInt(id));
  },
  park: function(id: number, x: number, y: number, z: number, rot: number) {
    methods.debug('vehicles.park');
    rot = methods.parseInt(rot);
    vehicles.set(id, 'x_park', methods.parseInt(x));
    vehicles.set(id, 'y_park', methods.parseInt(y));
    vehicles.set(id, 'z_park', methods.parseInt(z));
    vehicles.set(id, 'rot_park', methods.parseInt(rot));
    carsEntity.update({
      x_park: methods.parseInt(x),
      y_park: methods.parseInt(y),
      z_park: methods.parseInt(z),
      rot_park: methods.parseInt(rot),
    }, {where: {id: id}})
  },
  destroy: (vehicle: VehicleMp) => {
    mp.events.call("vehicleDestroy", vehicle);
    vehicle.destroy();
  },
  respawn: (vehicle: VehicleMp, resp = true) => {
    if (!vehicles.exists(vehicle)) return;

    try {
      methods.debug('vehicles.respawn');
      let containerId = vehicle.getVariable('container');
      const iduser = vehicle.getVariable('id_user')
      vehicles.destroy(vehicle)
      if(resp){
        setTimeout(() => {
          if (!!containerId && typeof iduser == "number" && iduser > 0) vehicles.spawnPlayerCar(containerId, true);
        }, 500)
      }
      
    } catch (e) {
      methods.debug(e);
    }
  },
  findVehicleByNumber: (number: string) => {
    methods.debug('vehicles.findVehicleByNumber');
    let returnVehicle: VehicleMp = null;
    mp.vehicles.forEach((vehicle) => {
      if (!vehicles.exists(vehicle)) return;
      if (vehicle.numberPlate == number) returnVehicle = vehicle;
    });
    return returnVehicle;
  },
  spawnFractionCar: (id: number) => {
    methods.debug('vehicles.spawnFractionCar');
    try {
      let vehItem = enums.vehicleList[id];
      let model = vehItem[0];
      let position = new mp.Vector3(vehItem[1], vehItem[2], vehItem[3]);
      let livery = vehItem[5];
      let fractionId = vehItem[6];
      if (fractionId > 100) fractionId = fractionId - 100;

      let color1 = methods.getRandomInt(0, 156);
      let color2 = methods.getRandomInt(0, 156);
      let number = 'SA';
      let numberStyle = 0;

      switch (fractionId) {
        case 1:
          color1 = 146;
          color2 = 146;
          number = 'GOV' + id;
          numberStyle = 4;
          break;
        case 2:
          color1 = 111;
          color2 = 0;
          number = 'LSPD' + id;
          livery = methods.getRandomInt(0, 6);
          numberStyle = 4;

          switch (model) {
            case -590854301:
            case 1982188179:
            case -1286617882:
            case -118239187:
            case 376094636: {
              livery = methods.getRandomInt(3, 6);
              break;
            }
            case -561505450:
            case -271532569:
            case -660061144: {
              livery = methods.getRandomInt(2, 4);
              break;
            }
            case 1162796823:
            case -595004596:
            case -1973172295: {
              let colors = [0, 2, 141, 7, 34, 134, 146];

              color1 = colors[methods.getRandomInt(0, 6)];
              color2 = color1;
              break;
            }
            case 1127131465: {
              let colors = [0, 3, 6, 131, 134];
              color1 = colors[methods.getRandomInt(0, 4)];
              color2 = color1;
              break;
            }
            case -1647941228:
              color1 = 112;
              color2 = 112;
              break;
            case 837858166:
            case 2071877360:
            case 745926877:
              color1 = 0;
              color2 = 0;
              break;
          }
          break;
        case 7:
          color1 = 111;
          color2 = 0;
          number = 'SHRF' + id;
          livery = methods.getRandomInt(0, 6);
          numberStyle = 4;

          switch (model) {
            case -590854301:
            case 1982188179:
            case -1286617882:
            case -118239187:
            case 376094636: {
              livery = methods.getRandomInt(3, 6);
              break;
            }
            case -561505450:
            case -271532569:
            case -660061144: {
              livery = methods.getRandomInt(2, 4);
              break;
            }
            case 1162796823:
            case -595004596:
            case -1973172295: {
              let colors = [0, 2, 141, 7, 34, 134, 146];

              color1 = colors[methods.getRandomInt(0, 6)];
              color2 = color1;
              break;
            }
            case 1127131465: {
              let colors = [0, 3, 6, 131, 134];
              color1 = colors[methods.getRandomInt(0, 4)];
              color2 = color1;
              break;
            }
            case -1647941228:
              color1 = 112;
              color2 = 112;
              break;
            case 837858166:
            case 745926877:
            case 2071877360:
              color1 = 0;
              color2 = 0;
              break;
          }
          break;
        case 3: {
          color1 = 0;
          color2 = 0;
          number = 'FIB' + id;
          numberStyle = 4;
          break;
        }
        case 4: {
          color1 = 154;
          color2 = 154;

          if (
            model == -823509173 ||
            model == 321739290 ||
            model == 1074326203 ||
            model == 630371791
          ) {
            color1 = 111;
            color2 = 111;
          } else if (vehItem[6] == 104) {
            color1 = 119;
            color2 = 0;
          }
          number = 'USMC' + id;
          break;
        }
        case 5: {
          color1 = 77;
          color2 = 77;
          number = 'PRSN' + id;
          numberStyle = 4;
          break;
        }
        case 16: {
          color1 = 27;
          color2 = 27;
          number = 'EMS' + id;
          numberStyle = 4;

          if (model == 1938952078) {
            color1 = 111;
            color2 = 111;
          } else if (model == 353883353) {
            livery = 1;
          }
          break;
        }
      }

      vehicles.newOrdered(
        (veh) => {
          if (!vehicles.exists(veh)) return;
          let vInfo = methods.getVehicleInfo(model);

          veh.numberPlate = number;
          veh.numberPlateType = numberStyle;
          //veh.engine = false;
          vSync.setEngineState(veh, false);
          veh.locked = true;
          veh.livery = livery;
          veh.setColor(color1, color2);

          veh.setVariable('container', id + offsetFr);
          veh.setVariable('fuel', vInfo.fuel_full);
          veh.setVariable('fraction_id', fractionId);

          if (fractionId == 1) {
            veh.windowTint = 1;
          }

          if (
            fractionId == 2 ||
            fractionId == 4 ||
            fractionId == 7 ||
            fractionId == 16 ||
            fractionId == 1 ||
            fractionId == 3
          ) {
            try {
              veh.setMod(11, 2);
              veh.setMod(12, 2);
              veh.setMod(13, 3);
              veh.setMod(18, 0);
              veh.setMod(16, 2);
              veh.setVariable('boost', 1.79);
            } catch (e) {
              methods.debug(e);
            }
          }

          if (fractionId == 4 && model == -808457413)
            veh.setMod(48, methods.getRandomInt(0, 2) == 0 ? 8 : 18);
          if (fractionId == 4 && model == -121446169) veh.setMod(48, 4);

          veh.setVariable('id', id);

          vehicles.set(id + offsetFr, 'fuel', vInfo.fuel_full);
          vehicles.set(id + offsetFr, 'fraction_id', fractionId);
          vehicles.set(id + offsetFr, 'hash', model);
          if(boostListHash.has(veh.model)){
            veh.setVariable('boost', boostListHash.get(veh.model))
          }
        },
        [
          model,
          position,
          { heading: Math.floor(vehItem[4]), numberPlate: number, engine: false, dimension: 0 },
        ]
      );
    } catch (e) {
      methods.debug(e);
    }
  },
  setFuel: (veh: VehicleMp, fuel: number) => {
    //methods.debug('vehicles.setFuel');

    if (!vehicles.exists(veh)) return;

    let vInfo = methods.getVehicleInfo(veh.model);
    if (vInfo.fuel_full == 1) return;

    if (vInfo.fuel_full < fuel) fuel = vInfo.fuel_full;

    vehicles.set(veh.getVariable('container'), 'fuel', fuel);
    veh.setVariable('fuel', fuel);
  },
  getFuel: (veh: VehicleMp) => {
    //methods.debug('vehicles.getFuel');
    if (!vehicles.exists(veh)) return 0;
    return veh.getVariable('fuel');
  },
  setFuelFull: (veh:VehicleMp) => {
    if (!vehicles.exists(veh)) return;
    let vInfo = methods.getVehicleInfo(veh.model);
    if (vInfo.fuel_full == 1) return;
    vehicles.setFuel(veh, vInfo.fuel_full)
    veh.setVariable('fuel', vInfo.fuel_full);
  },
  checkVehiclesFuel: () => {
    // methods.debug('vehicles.checkVehiclesFuel');
    mp.vehicles.forEach(function(veh) {
      if (!vehicles.exists(veh)) return;

      if (!vSync.getEngineState(veh)) return;

      let vInfo = methods.getVehicleInfo(veh.model);
      if (vInfo.fuel_full == 1) return;

      let velocity = veh.velocity;
      let speed = Math.sqrt(
        velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z
      );
      let speedMph = Math.round(speed * 2.23693629);
      let fuelMinute = vInfo.fuel_full;
      let fuel = vehicles.getFuel(veh);

      if (fuel <= 0) {
        vehicles.setFuel(veh, 0);
        //veh.engine = false;
        vSync.setEngineState(veh, false);
        return;
      }

      if (speedMph < 1) {
        let result = fuel - (fuelMinute * 0.01) / 300;
        vehicles.setFuel(veh, result < 1 ? 0 : result);
      } else if (speedMph > 0 && speedMph < 61) {
        let result = fuel - (fuelMinute * 1.5) / 710;
        vehicles.setFuel(veh, result < 1 ? 0 : result);
      } else if (speedMph > 60 && speedMph < 101) {
        let result = fuel - (fuelMinute * 0.75) / 480;
        vehicles.setFuel(veh, result < 1 ? 0 : result);
      } else {
        let result = fuel - (fuelMinute * 0.75) / 240;
        vehicles.setFuel(veh, result < 1 ? 0 : result);
      }
    });

    setTimeout(vehicles.checkVehiclesFuel, 4500);
  },
  respBySlot: function(player: PlayerMp, slot: any, tome = false) {
    methods.debug('vehicles.respBySlot');
    if (!user.isLogin(player)) return false;
    /*if (user.getMoney(player) < 150) {
            player.notify('~r~У Вас нет средств чтобы оплатить механика');
            return;
        }*/
    let containerId = user.get(player, 'car_id' + slot);
    if(!containerId) return false;
    let isFind = false;
    
    let jacked = false
    mp.vehicles.forEach((veh) => {
      if(isFind) return;
      if (!vehicles.exists(veh)) return;

      if (veh.getVariable('container') == containerId) {
        if (veh.getOccupants().length > 0) {
          player.notify('~r~Транспорт в угоне');
          isFind = true;
          jacked = true;
          return;
        }
        vehicles.respawn(veh, tome ? false : true);
        isFind = true;
      }
    });

    if (vehicles.get(containerId, 'sell_price') > 0) {
      player.notify('~r~Для начала необходимо убрать транспорт с PDM');
      return false;
    }
    
    if(!tome){
      player.notifyWithPicture(
        'Доставка транспорта',
        'Механик',
        'В течении минуты ваш транспорт будет на месте',
        'CHAR_MECHANIC',
        2
      );
    }

    if(jacked) return false

    if(tome){
     setTimeout(() => {
      mp.vehicles.forEach((veh) => {
        if (!vehicles.exists(veh)) return;
        if (veh.getVariable('container') == containerId) {
          vehicles.respawn(veh, false);
        }
      });
     }, 3000);     
    }

    setTimeout(async function() {
      if(tome){
        if(!mp.players.exists(player)) return;
        let status = <number> await mp.events.callClient(player, "getGround")
        if (player.position.z - status > 5) return player.notifyWithPicture(
          'Доставка транспорта',
          'Механик',
          '~r~Мне не удалось доставить ваш транспорт по вашему местоположению',
          'CHAR_MECHANIC',
          2
        );
        if (player.dimension != 0) return player.notifyWithPicture(
          'Доставка транспорта',
          'Механик',
          '~r~Мне не удалось доставить ваш транспорт по вашему местоположению',
          'CHAR_MECHANIC',
          2
        );
      }
      if (isFind == false || (tome && !jacked)) vehicles.spawnPlayerCar(containerId, tome ? true : false, tome ? player.dimension : 0, tome ? player : null);
    }, tome ? 60000 : 1000);
    return true;
  },
  findBySlot: function(player: PlayerMp, slot: any) {
    methods.debug('vehicles.findBySlot');
    if (!user.isLogin(player)) return;
    let containerId = user.get(player, 'car_id' + slot);
    let isFind = false;
    mp.vehicles.forEach(function(veh) {
      if (!vehicles.exists(veh)) return;

      if (veh.getVariable('container') == containerId) {
        isFind = true;
        user.setWaypoint(player, veh.position.x, veh.position.y);
      }
    });

    if (isFind == false) player.notify('~r~Транспорт не найден, зареспавните его');
  },
  searchBySlot: function(player: PlayerMp, slot: any) {
    methods.debug('vehicles.findBySlot');
    if (!user.isLogin(player)) return;
    let containerId = user.get(player, 'car_id' + slot);
    let isFind = false;
    mp.vehicles.forEach(function(veh) {
      if (!vehicles.exists(veh)) return;
      if (veh.getVariable('container') == containerId) {
        isFind = true;
      }
    });
    return isFind;
  },
  getBySlot: function(player: PlayerMp, slot: any) {
    methods.debug('vehicles.findBySlot');
    if (!user.isLogin(player)) return;
    let containerId = user.get(player, 'car_id' + slot);
    let res:VehicleMp;
    mp.vehicles.forEach(function(veh) {
      if (!vehicles.exists(veh)) return;
      if (veh.getVariable('container') == containerId) {
        res = veh;
      }
    });
    return res;
  },
  getVehSlot: function(player: PlayerMp, veh: number|VehicleMp) {
    methods.debug('vehicles.findBySlot');
    if (!user.isLogin(player)) return 0;
    let vehId = typeof veh === 'number' ? veh : veh.getVariable('container');
    if(!vehId) return 0;
    let slot = 0
    for (let id = 1; id < 9; id++) if (user.get(player, 'car_id' + id) === vehId) {
      slot = id;
    }
    return slot;
  },
  generateNumber: function(length = 8) {
    let text = '';
    let possible = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  },
  getPrice : (id: number):Promise<number> => {
    return new Promise((resolve) => {
      carsEntity.findOne({
        where: {
          id: id
        }
      }).then(item => {
        if (!item) return resolve(null)
        else return resolve(item.price)
      })
    })
  },
  getOwner : (id: number):Promise<{id: number, nick: string}> => {
    return new Promise((resolve) => {
      carsEntity.findOne({
        where: {
          id: id
        }
      }).then(item => {
        if (!item) return resolve(null)
        else return resolve({
          id: item.id_user,
          nick: item.user_name,
        })
      })
    })
  },
  buy: (id:number,player:PlayerMp,pos:Vector3Mp,rot:number,color:number):Promise<boolean> => {
    return new Promise((resolve) => {
      if(!mp.players.exists(player)) return resolve(false)
      carsEntity.update({
        color1: color,
        color2: color,
        fuel: Sequelize.literal('full_fuel'),
        x: pos.x,
        y: pos.y,
        z: pos.z,
        x_park: pos.x,
        y_park: pos.y,
        z_park: pos.z,
        rot_park: rot,
        money_tax: 0,
        s_oil: 0,
        s_candle: 0,
        s_body: 0,
        s_suspension: 0,
        s_engine: 0,
        s_wh_b_r: 0,
        s_wh_bk_r: 0,
        s_wh_b_l: 0,
        s_wh_bk_l: 0,
        s_mp: 0,
        wanted_level: 0,
        lock_status: 0,
        neon_type: 0,
        sell_price: 0,
        upgrade: JSON.stringify({ 18: -1 }),
        user_name: user.getRpName(player),
        id_user: user.getId(player),
      }, {where: {id:id}}).then(() => {
        if (!mp.players.exists(player)) return resolve(true)
        vehicles.loadPlayerVehicleById(player, id).then((res) => {
          resolve(true)
        })
      }).catch(err => {
        console.error(err);
        resolve(false)
      });
    })
  },
  updateOwnerInfo: async (id: number, userId: number, userName: string) => {
    id = methods.parseInt(id);
    vehicles.set(id, 'user_name', methods.removeQuotes(userName));
    vehicles.set(id, 'id_user', methods.parseInt(userId));
    userId = methods.parseInt(userId);
    await carsEntity.update({
      user_name: userName,
      id_user: userId,
      money_tax: 0,
    }, {where: { id: id }})

    if (userId == 0) {
      vehicles.park(id, 0, 0, 0, 0);

      carsEntity.update({
        user_name: userName,
        id_user: userId,
        number: vehicles.generateNumber(),
        money_tax: 0,
        s_oil: 0,
        s_candle: 0,
        s_body: 0,
        s_suspension: 0,
        s_engine: 0,
        s_wh_b_r: 0,
        s_wh_bk_r: 0,
        s_wh_b_l: 0,
        s_wh_bk_l: 0,
        s_mp: 0,
        wanted_level: 0,
        lock_status: 0,
        neon_type: 0,
        sell_price: 0,
        upgrade: '{"18":-1}',
      }, { where: {id: id}})

      //Container.ResetAll(id + offset);
    }
  },
  sell: async (player: PlayerMp, slot: number) => {
    methods.debug('vehicles.sell');
    if (!user.isLogin(player)) return;

    if (user.get(player, 'car_id' + slot) == 0) {
      player.notify('~r~У Вас нет транспорта');
      return;
    }

    let containerId = user.get(player, 'car_id' + slot);
    const veh = mp.vehicles.toArray().find((veh) => veh.getVariable('container') == containerId);
    if (!vehicles.exists(veh) || !veh) return player.notify('~r~Для начала зареспавните ТС');

    let vInfo = vehicles.getData(user.get(player, 'car_id' + slot));
    let nalog = (vInfo.get('price') * (100 - ((coffer.get('cofferNalog') || 15) + 20))) / 100;

    user.set(player, 'car_id' + slot, 0);

    await vehicles.updateOwnerInfo(vInfo.get('id'), 0, '');

    coffer.removeMoney(nalog);
    user.addMoney(player, nalog);

    veh.destroy();
    user.log(player, "PlayerSellCar", 'Продал машину @veh' + vInfo.get('id') + ' Цена: $' + methods.numberFormat(nalog));
    if (!user.isLogin(player)) return;
    user.addHistory(
      player,
      3,
      'Продал транспорт ' + vInfo.get('name') + '. Цена: $' + methods.numberFormat(nalog)
    );
    player.notify('~g~Вы продали транспорт');
    player.notify(
      `~g~Налог:~s~ ${coffer.get('cofferNalog') +
        20}\n~g~Получено:~s~ $${methods.numberFormat(nalog)}`
    );
    user.saveAccount(player);
  },
  setTunning: (veh: VehicleMp) => {
    setTimeout(function() {
      if (vehicles.exists(veh)) {
        try {
          let car = vehicles.getData(veh.getVariable('container'));
          if (!car.has('color1')) return;

          veh.setColor(car.get('color1'), car.get('color2'));
          if(!car) return;
          if (car.get('neon_type') > 0)
            veh.setNeonColor(car.get('neon_r'), car.get('neon_g'), car.get('neon_b'));

          veh.livery = car.get('livery');

          if (car.has('upgrade')) {
            let upgrade = JSON.parse(car.get('upgrade'));
            for (let tune in upgrade) {
              if (methods.parseInt(tune) === 78) veh.wheelType = methods.parseInt(upgrade[tune]);
            }
            setTimeout(function() {
              try {
                if (!vehicles.exists(veh)) return;
                for (let tune in upgrade) {
                  if (methods.parseInt(tune) >= 100) continue;
                  if (methods.parseInt(tune) === 69)
                    veh.windowTint = methods.parseInt(upgrade[tune]);
                  else veh.setMod(methods.parseInt(tune), methods.parseInt(upgrade[tune]));
                }
              } catch (e) {
                console.log(e);
              }
            }, 500);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }, 2000);
  },
  getVehicleOwnerId: (vehicle: VehicleMp) : number => {
    if (!mp.vehicles.exists(vehicle)) return null;
    let data = vehicles.getData(vehicle.getVariable('container'));
    if(!data) return null;
    return data.get('id_user');
  },
  spawnPlayerCar: (id: number, isRespawn = false, dim = 0, player?:PlayerMp) => {
    methods.debug('vehicles.spawnPlayerCar');
    try {
      let car = vehicles.getData(id);
      if(!car) return console.error("We have problem with spawn player car", id);
      // console.log(vehicles.findVehicleByNumber(car.get('number').toString()))
      // const vh = vehicles.findVehicleByNumber(car.get('number').toString());
      // if (mp.vehicles.exists(vh)){
      //   const iduser = vh.getVariable('id_user')
      //   if(typeof iduser == "number" && iduser == car.get('id_user')) vh.destroy();
      // }
      let position = new mp.Vector3(car.get('x'), car.get('y'), car.get('z'));
      let rot = parseFloat(car.get('rot'));
      if (car.get('x_park') != 0) {
        position = new mp.Vector3(car.get('x_park'), car.get('y_park'), car.get('z_park'));
        rot = methods.parseInt(car.get('rot_park'));
      }
      if(player){
        if(!mp.players.exists(player)) return;
        if(player.inGreenZone) return player.notifyWithPicture(
          'Доставка транспорта',
          'Механик',
          'Мне не удалось доставить транспорт в зелёную зону',
          'CHAR_MECHANIC',
          2
        );
        // if(player.interrior) return player.notifyWithPicture(
        //   'Доставка транспорта',
        //   'Механик',
        //   'Мне не удалось доставить транспорт в помещение, либо близко ко входу в помещение',
        //   'CHAR_MECHANIC',
        //   2
        // );
        if(player.vehicle) return player.notifyWithPicture(
          'Доставка транспорта',
          'Механик',
          'Мне не удалось доставить транспорт. Вы уже в каком то ТС?',
          'CHAR_MECHANIC',
          2
        );
        position = methods.calculateAttachPosition(player.position, new mp.Vector3(0,0,player.heading), new mp.Vector3(0,3,0));
        rot = player.heading + 90;
        user.log(player, "SpawnVehicle", `Заказал доставку ТС @veh${id}`)
      }

      //let veh = mp.vehicles.new(car.get('hash'), position, { heading: parseFloat(car.get('rot_park') - 180) });
      // console.log(car.get('hash'))
      vehicles.newOrdered(
        (veh) => {
          if (!vehicles.exists(veh)) return;
          veh.dbid = id
          if (isRespawn) {
            veh.numberPlate = car.get('number').toString();
            vSync.setLockStatus(veh, true)
            vSync.setEngineState(veh, false)
            veh.setColor(car.get('color1'), car.get('color2'));

            let numberStyle = 0;

            if (car.get('id') % 3) numberStyle = 1;
            else if (car.get('id') % 4) numberStyle = 2;
            else if (car.get('id') % 5) numberStyle = 3;

            veh.numberPlateType = numberStyle;
            
            veh.setVariable('id_user', methods.parseInt(car.get('id_user')));
            veh.setVariable('container', id);
            veh.setVariable('fuel', car.get('fuel'));
            veh.setVariable('price', car.get('price'));

            vehicles.setTunning(veh);

            methods.debug(
              `[${car.get('id')}] Spawned ${car.get('name')} at ${position.x}, ${position.y}, ${
                position.z
              }`
            );
          } else {
            setTimeout(function() {
              if (!vehicles.exists(veh)) return;

              veh.numberPlate = car.get('number').toString();
              vSync.setLockStatus(veh, true)
              vSync.setEngineState(veh, false)
              veh.livery = car.get('livery');
              veh.setColor(car.get('color1'), car.get('color2'));

              let numberStyle = 0;

              if (car.get('id') % 3) numberStyle = 1;
              else if (car.get('id') % 4) numberStyle = 2;
              else if (car.get('id') % 5) numberStyle = 3;

              veh.numberPlateType = numberStyle;

              veh.setVariable('id_user', methods.parseInt(car.get('id_user')));
              veh.setVariable('container', id);
              veh.setVariable('fuel', car.get('fuel'));
              veh.setVariable('price', car.get('price'));

              vehicles.setTunning(veh);

              methods.debug(
                `[${car.get('id')}] Spawned ${car.get('name')} at ${position.x}, ${position.y}, ${
                  position.z
                } | ${veh.dimension}`
              );
            }, 5000);
          }
          // if (player){
          //   player.putIntoVehicle(veh, -1)
          // }
        },
        [
          car.get('hash'),
          position,
          { heading: rot, numberPlate: 'SA', engine: false, dimension: dim },
        ]
      );
    } catch (e) {
      console.log(e);
    }
  },
  spawnJobCar: (
    position: Vector3Mp,
    heading: number,
    nameOrModel: string | number,
    job: string,
    cb: (veh: VehicleMp) => any
  ) => {
    methods.debug('vehicles.spawnJobCar ' + nameOrModel);

    if (typeof nameOrModel == 'string') nameOrModel = mp.joaat(nameOrModel);

    jobCount++;

    let model = nameOrModel;
    let livery = 0;
    let id = jobCount;
    let CountCars = jobCount;

    let color1 = methods.getRandomInt(0, 156);
    let color2 = methods.getRandomInt(0, 156);
    let number = 'SA' + CountCars;

    switch (job) {
      case 'scrap': {
        color1 = 111;
        color2 = 111;
        number = 'SCRP' + CountCars;
        break;
      }
      case 'mail': {
        color1 = 111;
        color2 = 111;
        number = 'POST' + CountCars;
        break;
      }
      case 'mail2': {
        color1 = 111;
        color2 = 111;
        livery = 1;
        number = 'GO' + CountCars;
        break;
      }
      case 'trucker11': {
        color1 = 105;
        color2 = 105;
        number = 'POST' + CountCars;
        job = 'trucker1';
        break;
      }
      case 'trucker12': {
        color1 = 111;
        color2 = 111;
        livery = 1;
        number = 'GO' + CountCars;
        job = 'trucker1';
        break;
      }
      case 'trucker21': {
        color1 = 28;
        color2 = 0;
        number = 'BGO' + CountCars;
        job = 'trucker2';
        break;
      }
      case 'trucker22': {
        color1 = 127;
        color2 = 111;
        number = 'JET' + CountCars;
        job = 'trucker2';
        break;
      }
      case 'trucker23': {
        color1 = 13;
        color2 = 13;
        number = 'LAND' + CountCars;
        job = 'trucker2';
        break;
      }
      case 'trucker31': {
        color1 = 28;
        color2 = 0;
        number = 'BGO' + CountCars;
        job = 'trucker3';
        break;
      }
      case 'trucker32': {
        color1 = 127;
        color2 = 111;
        number = 'JET' + CountCars;
        job = 'trucker3';
        break;
      }
      case 'trucker33': {
        color1 = 8;
        color2 = 8;
        number = 'LAND' + CountCars;
        job = 'trucker3';
        break;
      }
      case 'trash': {
        color1 = 85;
        color2 = 59;
        number = 'TRSH' + CountCars;
        break;
      }
      case 'water': {
        color1 = 111;
        color2 = 111;
        livery = 3;
        number = 'LSWP' + CountCars;
        break;
      }
      case 'sunb': {
        color1 = 111;
        color2 = 111;
        number = 'SUN' + CountCars;
        break;
      }
      case 'bgstar': {
        color1 = 111;
        color2 = 111;
        number = 'BS' + CountCars;
        break;
      }
      case 'bshot': {
        color1 = 44;
        color2 = 44;
        number = 'BSH' + CountCars;
        break;
      }
      case 'bus1': {
        color1 = 38;
        color2 = 111;
        number = 'LS' + CountCars;
        break;
      }
      case 'bus2': {
        color1 = 134;
        color2 = 134;
        number = 'LSIA' + CountCars;
        break;
      }
      case 'bus3': {
        color1 = 132;
        color2 = 132;
        number = 'SA' + CountCars;
        break;
      }
      case 'hlab': {
        color1 = 2;
        color2 = 2;
        number = 'HLAB' + CountCars;
        break;
      }
      case 'three': {
        color1 = 111;
        color2 = 111;
        number = 'CNR' + CountCars;
        break;
      }
      case 'photo': {
        color1 = 44;
        color2 = 0;
        number = 'INV' + CountCars;
        break;
      }
      case 'gr6': {
        color1 = 111;
        color2 = 55;
        number = 'GR6' + CountCars;
        break;
      }
      case 'trucker1': {
        number = 'SA' + CountCars;
        break;
      }
      case 'taxi1': {
        color1 = 88;
        color2 = 0;

        if (model == -956048545) {
          color1 = 0;
          color2 = 88;
        }
        number = 'DTC' + CountCars;
        break;
      }
      case 'taxi2': {
        color1 = 111;
        color2 = 28;

        if (model == -1150599089) {
          color1 = 28;
          color2 = 111;
        }
        number = 'EXP' + CountCars;
        break;
      }
    }

    //let veh = mp.vehicles.new(model, position, {heading: parseFloat(heading), numberPlate: number, engine: false, dimension: 0});

    vehicles.newOrdered(
      (veh) => {
        if (!vehicles.exists(veh)) return;
        let vInfo = methods.getVehicleInfo(model);
        veh.isJob = true
        veh.numberPlate = number;
        //veh.engine = false;
        vSync.setEngineState(veh, false);
        veh.locked = false;
        veh.livery = livery;
        veh.setColor(color1, color2);

        veh.setVariable('container', id + offsetJob);
        veh.setVariable('fuel', vInfo.fuel_full);
        veh.setVariable('job', job);
        veh.setVariable('id', id);
        veh.setVariable('gr6Money', 0);

        vehicles.set(id + offsetJob, 'fuel', vInfo.fuel_full);
        vehicles.set(id + offsetJob, 'job', job);
        vehicles.set(id + offsetJob, 'hash', model);

        cb(veh);
      },
      [
        model,
        position,
        { heading: Math.floor(heading), numberPlate: number, engine: false, dimension: 0 },
      ]
    );
  },
  spawnRentCar: (
    player: PlayerMp,
    position: Vector3Mp,
    heading: number,
    nameOrModel: string | number,
    color: number = 1,
  ):Promise<VehicleMp> => {
    return new Promise(resolve => {
      
      methods.debug('vehicles.spawnRentCar ' + nameOrModel);
      if (!user.isLogin(player)) return resolve(null);
      try {
        if (typeof nameOrModel == 'string') nameOrModel = mp.joaat(nameOrModel);
  
        let model = nameOrModel;
        CountRentCars++;
        const ids = CountRentCars
        
        let number = 'RNT' + ids;
        inventory.getItemListData(8, number).map(item => {
          inventory.deleteItem(item.id)
        })
        vehicles.newOrdered(
          (veh) => {
            if (!vehicles.exists(veh)) return;
            let vInfo = methods.getVehicleInfo(model);
  
            // setTimeout(function() {
              // if (!vehicles.exists(veh)) return;
  
              veh.numberPlate = number;
              //veh.engine = false;
              vSync.setEngineState(veh, false);
              veh.locked = true;
              veh.isRent = true;
              veh.setColor(color, color);
  
              veh.setVariable('container', ids + offsetRent);
              veh.setVariable('fuel', vInfo.fuel_full);
              veh.setVariable('rentOwner', user.getId(player));
              veh.setVariable('id', ids);
  
              vehicles.set(ids + offsetRent, 'fuel', vInfo.fuel_full);
              vehicles.set(ids + offsetRent, 'rentOwner', user.getId(player));
              vehicles.set(ids + offsetRent, 'hash', model);

              resolve(veh)
              // player.setVariable('rentCar', veh);
            // }, 200);
          },
          [
            model,
            position,
            { heading: Math.floor(heading), numberPlate: number, engine: false, dimension: 0 },
          ]
        );
  
        //let veh = mp.vehicles.new(model, position, {heading: parseFloat(heading), numberPlate: number, engine: false, dimension: 0});
      } catch (e) {
        methods.debug(e);
      }
    })
  },
  spawnCar: (
    position: Vector3Mp,
    heading: number,
    nameOrModel: string | number,
    number: string = undefined
  ) => {
    methods.debug('vehicles.spawnCar ' + nameOrModel);
    let modelname = '';

    if (typeof nameOrModel == 'string') {
      modelname = `${nameOrModel}`;
      nameOrModel = mp.joaat(nameOrModel);
      
    }

    let model = nameOrModel;
    CountAllCars++;

    let color1 = methods.getRandomInt(0, 156);
    let color2 = color1;
    if (number === undefined) number = vehicles.generateNumber();

    let veh = mp.vehicles.new(model, position, {
      heading: Math.floor(heading),
      numberPlate: number,
      engine: false,
      dimension: 0,
    });
    if(modelname) veh.modelname = modelname;
    let vInfo = methods.getVehicleInfo(model);

    veh.numberPlate = number;
    //veh.engine = false;
    vSync.setEngineState(veh, false);
    veh.locked = false;
    veh.setColor(color1, color2);

    veh.setVariable('container', CountAllCars + offsetAll);
    veh.setVariable('fuel', vInfo.fuel_full);
    veh.setVariable('id', CountAllCars);

    vehicles.set(CountAllCars + offsetAll, 'fuel', vInfo.fuel_full);
    vehicles.set(CountAllCars + offsetAll, 'hash', model);

    return veh;
  },
  spawnCar2: (
    cb: (veh: VehicleMp) => any,
    position: Vector3Mp,
    heading: number,
    nameOrModel: string | number,
    color1 = -1,
    color2 = -1,
    liv = -1,
    number: string = undefined
  ) => { 
    methods.debug('vehicles.spawnCar2 ' + nameOrModel);
    if (typeof nameOrModel == 'string') nameOrModel = mp.joaat(nameOrModel.toLowerCase());

    let model = nameOrModel;
    CountAllCars++;

    if (color1 == -1) color1 = methods.getRandomInt(0, 156);
    if (color2 == -1) color2 = color1;
    if (number === undefined) number = vehicles.generateNumber();

    //let veh = mp.vehicles.new(model, position, {heading: parseFloat(heading), numberPlate: number, engine: false, dimension: 0});
    vehicles.newOrdered(
      (veh) => {
        if (!vehicles.exists(veh)) return;

        let vInfo = methods.getVehicleInfo(model);

        veh.numberPlate = number;
        //veh.engine = false;
        vSync.setEngineState(veh, false);
        veh.locked = false;
        if (liv >= 0) veh.livery = liv;
        veh.setColor(color1, color2);

        veh.setVariable('container', CountAllCars + offsetAll);
        veh.setVariable('fuel', vInfo.fuel_full);
        veh.setVariable('id', CountAllCars);

        vehicles.set(CountAllCars + offsetAll, 'fuel', vInfo.fuel_full);
        vehicles.set(CountAllCars + offsetAll, 'hash', model);

        cb(veh);
      },
      [
        model,
        position,
        { heading: Math.floor(heading), numberPlate: number, engine: false, dimension: 0 },
      ]
    );

    //return veh;
  },
  lockStatus: (player: PlayerMp, vehicle: VehicleMp, status:boolean = null) => {
    methods.debug('vehicles.lockStatus');
    // if (!user.isLogin(player)) return;
    // if (!vehicles.exists(vehicle)) return;
    try {
      let currentStatus = (status != null) ? !status : vehicle.locked
      vehicle.locked = !currentStatus;
      //let lockStatus = !vSync.getLockState(vehicle);
      vehicle.setVariable('locked', vehicle.locked);
      vSync.setLockStatus(vehicle, vehicle.locked);
      if (player && mp.players.exists(player)) mp.events.triggerBrowser(player, 'cef:speedometer:setLockCar', vehicle.locked);
      if (player && mp.players.exists(player)) inventory.updateInventory(player);
      if(status != null) return;
      if (!player || !mp.players.exists(player)) return;
      if (!vehicle.locked) player.notify('~g~Вы открыли транспорт');
      else player.notify('~r~Вы закрыли транспорт');
    } catch (e) {
      console.log(e);
    }
  },
  engineStatus: (player: PlayerMp, vehicle: VehicleMp, status:boolean = null) => {
    methods.debug('vehicles.engineStatus');
    if (!user.isLogin(player)) return;
    if (!vehicles.exists(vehicle)) return;
    try {
      if (vehicle.getVariable('fuel') == 0) {
        if(status != null) player.notify('~r~В транспорте закончился бензин');
        if(status != null) player.notify('~b~Метка на заправку установлена');
        if(status != null) {
          let pos = fuel.findNearest(player.position);
          user.setWaypoint(player, pos.x, pos.y);
        }
        vSync.setEngineState(vehicle, false);
        return;
      }
      //vehicle.engine = !vehicle.engine;
      let eStatus = status ? status : !vSync.getEngineState(vehicle);
      vSync.setEngineState(vehicle, eStatus);
      // vehicle.engine = eStatus;
      // mp.events.triggerBrowser(player, 'cef:speedometer:setEngine', eStatus);
      if(status != null) return;
      if (eStatus) player.notify('~g~Вы завели двигатель');
      else player.notify('~r~Вы заглушили двигатель');
    } catch (e) {
      console.log(e);
    }
  },
  neonStatus: (player: PlayerMp, vehicle: VehicleMp) => {
    methods.debug('vehicles.neonStatus');
    if (!user.isLogin(player)) return;
    if (!vehicles.exists(vehicle)) return;
    try {
      vehicle.neonEnabled = !vehicle.neonEnabled;
      if (vehicle.neonEnabled) {
        let car = vehicles.getData(vehicle.getVariable('container'));
        vehicle.setNeonColor(car.get('neon_r'), car.get('neon_g'), car.get('neon_b'));
      }
    } catch (e) {
      console.log(e);
    }
  },
  exists: (vehicle: VehicleMp) => {
    //methods.debug('vehicles.exists');
    return vehicle && mp.vehicles.exists(vehicle);
  },
};

mp.events.add('vehicleRadio', (player: PlayerMp, vehRadio:number) => {
  if(!player.vehicle) return;
  player.vehicle.setVariable('radioStation', vehRadio);
})


setInterval(() => {
  let plateList:string[] = [];
  mp.vehicles.forEach(veh => {
    if(!veh.blockboost && boostListHash.has(veh.model)){
      if(veh.getVariable('boost') != boostListHash.get(veh.model))
      veh.setVariable('boost', boostListHash.get(veh.model))
    }
    if(veh.getVariable('container')){
      if(plateList.indexOf(veh.numberPlate+veh.model+veh.getVariable('container')) > -1) veh.destroy();
      else plateList.push(veh.numberPlate+veh.model+veh.getVariable('container'))
    }
  })
}, 4000)
setInterval(() => {
  mp.vehicles.forEach(veh => {
    let vInfo = methods.getVehicleInfo(veh.model);
    if(vInfo){
      if(vInfo.class_name == "Boats") return;
    }
    if (!veh.afkCount) veh.afkCount = 0;
    if (veh.getOccupants().length == 0) veh.afkCount += AFK_TIME_INTERVAL_SECS
    else veh.afkCount = 0;
    let needTime = MAX_VEHICLE_AFK_MINUTES;
    if (veh.admin) needTime = 90;
    if (veh.dbid) needTime = 60;
    if (veh.fractiongarage) needTime = 180;
    if (needTime < veh.afkCount/60){
      vehicles.destroy(veh)
    }
  })
}, AFK_TIME_INTERVAL_SECS*1000)


mp.events.add('server:vehicleFreeze', (player:PlayerMp) => {
  if(!player.vehicle) return;
  player.vehicle.setVariable('freezePosition', !(!!player.vehicle.getVariable('freezePosition')));
})