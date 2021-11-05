import {Sequelize} from 'sequelize-typescript';
 

// import mysql2 from 'mysql'

import "reflect-metadata";

import ip from 'ip';
let ip_address = ip.address();
import mysqlconf from '../config/mysql.json';
import { methods } from "./methods";

// Entities
import { weaponChest } from "./entity/weaponChest";
import { garderobEntity } from './entity/garderob';
import { moneyChestEntity } from './entity/moneyChest';
import { userEntity } from './entity/user';
import { inventoryEntity } from './entity/inventory';
import { fractionGarageEntity } from './entity/fractionGarage';
import { banListEntity } from './entity/banList';
import { businessEntity } from './entity/business';
import { blackListEntity } from './entity/blackList';
import { logEntity } from './entity/logEntity';
import { vehicleBoosterEntity } from './entity/vehicleBooster';
import { userWarnEntity } from './entity/warns';
import { cofferDonateEntity, cofferEntity } from './entity/coffer';
import { rpNewsEntity } from './entity/rpNews';
import { shootingRecordsEntity } from './entity/shooting';
import { whiteListTestEntity } from './entity/whiteListTest';
import { gangWarsZoneEntity } from './entity/gangWarsZone';
import { customChest } from './entity/customChest';
// import { ticketEntity } from './entity/ticketsModel';
import { promocodeUsingEntity, promocodeEntity } from './entity/promocodeUsing';
import { userNotifyEntity } from './entity/userNotifyEntity';
import { carsEntity } from './entity/carsModel';
import { eventToServerEntity } from './entity/eventToServer';
import { monitoringEntity } from './entity/monitoringEntity';
import { userDatingEntity } from './entity/userDatingEntity';
import { logPlayerEntity } from './entity/logPlayerEntity';
import { apartmentEntity } from './entity/apartmentEntity';
import { condoEntity } from './entity/condoEntity';
import { housesEntity } from './entity/housesEntity';
import { phoneContactEntity, phoneSMSEntity } from './entity/phone';
import { stocksEntity, logStockEntity } from './entity/stockEntity';
import { logReferrerEntity } from './entity/logReferrerEntity';
import { logAuthEntity } from './entity/logAuthEntity';
import { mafiaWarEntity } from './entity/mafiaWarEntity';
import { parkPlaceEntity } from './entity/parkPlaceEntity';
import { carRentEntity } from './entity/carRent';
import { autosalonPercentEntity } from './entity/autosalonPercent';
import { autosalonModelsEntity } from './entity/autosalonModels';
import { rpInvaderAdEntity } from './entity/rpInvaderAdEntity';
import { daynightEntity } from './entity/daynightEntity';
import { auctionSettingsEntity } from './entity/auctionSettingsEntity';
import { auctionEntity } from './entity/auctionEntity';
import { promocodeTopListEntity } from './entity/promocodeTopEntity';
import { logFractionGunEntity } from './entity/logFractionGunEntity';
import { vehInfoEntity } from './entity/vehInfoEntity';
import { raceCfgEntity } from './entity/raceCfgEntity';
import { tradeLogEntity } from './entity/tradeLogEntity';

export let sequelize:Sequelize;
export let mysqlpool:any;
export const sequelizeInit = () => {
  return new Promise((resolve) => {

    sequelize = new Sequelize({
      dialect: 'mariadb',
      host: mysqlconf.host,
      port: mysqlconf.port || 5981,
      username: mysqlconf.db_user,
      password: mysqlconf.password,
      database: mysqlconf.database,
      dialectOptions: {
        timezone: 'Etc/GMT+3',
        connectTimeout: 60000
      },
      define: {
        charset: 'utf8',
        collate: 'utf8_general_ci', 
        timestamps: false,
        freezeTableName: true
      },
      logging: methods.debugSeq,
      pool: {
        max: methods.isTestServer() ? 10 : 300,
        min: methods.isTestServer() ? 0 : 200
      }
    });
    


    

    // const q = (cs = 1) => {
    //   const count = 1000;
    //   console.time('testQuery'+cs);
    //   let c = 0;
    //   for (let i = 0; i < count; i++){
    //     setTimeout(() => {
    //       userEntity.findOne().then(() => {
    //         c++;
    //         if (c == count) return console.timeEnd('testQuery' + cs), q(cs+1);
    //       }).catch((err) => {
    //         console.error(err)
    //         c++;
    //         if (c == count) return console.timeEnd('testQuery' + cs), q(cs+1);
    //       })
    //     }, 100)
    //   }
    // }
    // setTimeout(() => {
    //   q();
    // }, 5000)
    // sequelize.addModels([userEntity])
    // return;
    sequelize.addModels([
      // ticketEntity, 
      promocodeTopListEntity, 
      userNotifyEntity, 
      condoEntity, 
      logAuthEntity, 
      mafiaWarEntity, 
      parkPlaceEntity, 
      logFractionGunEntity, 
      carRentEntity,
      stocksEntity, 
      logStockEntity, 
      housesEntity, 
      logReferrerEntity, 
      phoneSMSEntity, 
      phoneContactEntity, 
      customChest, 
      weaponChest, 
      garderobEntity,
      moneyChestEntity,
      userEntity,
      inventoryEntity,
      fractionGarageEntity,
      banListEntity,
      businessEntity,
      blackListEntity,
      logEntity,
      vehicleBoosterEntity,
      userWarnEntity,
      cofferDonateEntity,
      cofferEntity,
      rpNewsEntity,
      shootingRecordsEntity,
      whiteListTestEntity,
      gangWarsZoneEntity,
      auctionEntity,
      promocodeEntity, 
      promocodeUsingEntity,
      eventToServerEntity,
      monitoringEntity,
      apartmentEntity,
      userDatingEntity,
      logPlayerEntity,
      autosalonModelsEntity,
      rpInvaderAdEntity,
      auctionSettingsEntity,
      daynightEntity,
      carsEntity,
      autosalonPercentEntity,
      vehInfoEntity,
      raceCfgEntity,
      tradeLogEntity,
    ]);
    setTimeout(() => {
      sequelize.sync(/*{alter: true}*/).then(() => {
        userEntity.update({quests: []}, {where: {quests: '["[","]"]'}}).then(() => {
          resolve();
          // let q = new Sequelize({
          //   dialect: 'mariadb',
          //   host: mysqlconf.host,
          //   port: 5919,
          //   username: mysqlconf.db_user,
          //   password: mysqlconf.password,
          //   database: mysqlconf.database,
          //   dialectOptions: {
          //     timezone: 'Etc/GMT+3',
          //     connectTimeout: 60000
          //   },
          //   define: {
          //     charset: 'utf8',
          //     collate: 'utf8_general_ci',
          //     timestamps: false,
          //     freezeTableName: true
          //   },
          //   logging: methods.debugSeq,
          //   pool: {
          //     max: methods.isTestServer() ? 10 : 200,
          //     min: 0
          //   }
          // });
          // q.addModels([logEntity])
          // q.sync();
        })
      });
    }, 500)
  })
}
