/// <reference path="../declaration/server.ts" />
import '../util/newrage';
if (mp.peds) {
  SET_RAGE_BETA()
  console.warn("SERVER IN NEW RAGE MOD")
}
import './promisehack';
import '../util/string';
let errorLogWitten = false;
process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace

  if (errorLogWitten) return;
  errorLogWitten = true;
  setTimeout(() => {
    errorLogWitten = false;
  }, 2000)
  let text = `
  !!! warning !!!
  ${warning.name}
  --------
  ${warning.message}
  ${warning.stack}
  --------
  LAST DEBUG
  ${JSON.stringify(lastMessageLog)}
  --------







  `;
  methods.saveLog('warningLog', text);
});

process.on('uncaughtException', function (err) {
  if (errorLogWitten) return;
  errorLogWitten = true;
  setTimeout(() => {
    errorLogWitten = false;
  }, 2000)
  let text = `
  !!! uncaughtException !!!
  ${err.name}
  --------
  ${err.message}
  --------
  LAST DEBUG
  ${JSON.stringify(lastMessageLog)}
  --------







  `;
  console.log(err);
  // methods.saveLog('errorLog', text);
});

process.on('unhandledRejection', (reason, promise) => {
  if (errorLogWitten) return;
  errorLogWitten = true;
  setTimeout(() => {
    errorLogWitten = false;
  }, 2000)
  let text = `
  !!! unhandledRejection !!!
  reason
  ${JSON.stringify(reason)}
  promise
  ${JSON.stringify(promise)}
  --------
  LAST DEBUG
  ${JSON.stringify(lastMessageLog)}
  --------




  `;
  console.log("unhandledRejection");
  methods.saveLog('errorLog', text);
})
import v8 from 'v8'



setInterval(() => {
    let total = {
      cpu: process.cpuUsage(),
      mem: process.memoryUsage(),
      uptime: process.uptime(),
    }
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalHeapSize = v8.getHeapStatistics().total_available_size;
    let totalHeapSizaInMB = (totalHeapSize / 1024 / 1024).toFixed(2)
    methods.saveLog('cpuUsage', JSON.stringify(total));
    methods.saveLog('cpuUsage', `The script uses approximately ${used} MB`);
    methods.saveLog('cpuUsage', `V8 Total Heap Size ${totalHeapSizaInMB} MB`);
}, 30000)

function fatalWork(){
  console.log(lastMessageLog)
  methods.saveAll();
  saveNoSQLplayerData();
  if(methods.isTestServer()) return process.exit(0);
}

process.on('SIGABRT', fatalWork)
process.on('SIGSEGV', fatalWork);
process.on('SIGHUP', fatalWork);
process.on('SIGQUIT', fatalWork);
process.on('SIGTERM', fatalWork);
process.on('SIGINT', fatalWork);

import './customEvent';
import './modules/events';
import './modules/shutdown';
import './modules/data';
import './modules/fly';
import './modules/mp';
import './modules/doors';
import './log';
import './voice/voice'; 
import './web'; 
import './socket'; 
import './ragevoice'; 
import './modules/teleport'; 
import './modules/npc'; 
import './modules/quest'; 
import './modules/chest'; 
import './modules/mobile'; 
// import './modules/tg'; 
import './managers/restart'; 
import './managers/parking';
import './managers/attach_system';
import './managers/newPrototype';
import './managers/tablet.events';
import './managers/pickup.gift';
import './managers/february.event';
import './modules/gangwar';
import './modules/gang.deliver';
import './modules/ach';


import './modules/casino_slot_machines';
import './modules/casino_roulette';
import './modules/casino_threecard_poker';
import './modules/casino_dice';
import './modules/fingerpoint';


import './modules/christmas';
import './modules/skate';

import './modules/c4grab';
import './modules/pacific.grab';
import './modules/casino.grab';
import './modules/fleeca.grab';
import './modules/army.weapon.grab';
import './modules/duels';
import {loadAuction} from './modules/auction';


import { mysql, loadIntervalsMySQL } from './modules/mysql';
import { methods, lastMessageLog } from './modules/methods';
import { pickups } from './modules/pickups';
import { vehicleInfo } from './modules/vehicleInfo';
// import { chat } from './modules/chat';
import { timer } from './modules/timer';
import { weather } from './managers/weather';
import { tax } from './managers/tax';
// import { vSync } from './managers/vSync';
import { mafiaWar } from './managers/mafiaWar';
import { object } from './managers/object';
import { inventory } from './inventory';
// import { user } from './user';
import { coffer } from './coffer';
import { houses } from './houses'; 
import { condo } from './condo';
import { stock } from './stock';
import { apartments } from './apartments';
import { business } from './business';
import { vehicles } from './vehicles';
import { cloth } from './business/cloth';
import { fuel } from './business/fuel';
import { shop } from './business/shop';
import { carWash } from './business/carWash';
import { barberShop } from './business/barberShop';
import { bank } from './business/bank';
import { rent } from './business/rent';
import { gun } from './business/gun';
import { lsc } from './business/lsc';
import { bar } from './business/bar';
import { tattoo } from './business/tattoo';
import { autosalon } from './business/autosalon/index';
import './modules/race2'
import './managers/cameraRecord';
//import {trucker} from './business/trucker';
import './jobs'; 
import './managers/autoschool'; 
import './modules/nosql'; 

import './test'

// import { exec } from 'child_process';
//let fp = require('./fp');
import './modules/admin';
import { initChests } from './modules/chest';
import { loadGarderobs } from './modules/garderob';
import { loadFractionGarages } from './modules/fraction.vehicles.spawn';
import { sequelizeInit } from './modules/sequelize';
import { loadMoneyChests } from './modules/moneyChest';
import { loadParkPlace } from './managers/parking';
import { whitelist } from './modules/whitelist';
import { reloadGangWarZones } from './modules/gangwar';
import { chest } from './modules/customchest';
import { userEntity } from './modules/entity/user';
import { SET_RAGE_BETA } from '../util/newrage';
import { saveNoSQLplayerData } from './user';


export let testMode = false;
let oneinit = false
async function init() {
  methods.debug('init');
  console.log('INIT GAMEMODE');
    sequelizeInit().then(async () => {
      if(oneinit) return;
      oneinit = true;
      houses.loadAll();
      condo.loadAll();
      stock.loadAll();
      apartments.loadAll();
      chest.load()
      whitelist.load()
      reloadGangWarZones()
      vehicles.reloadBoostList();
      loadIntervalsMySQL();
      loadParkPlace()
      tax.loadAll();
      initChests();
      mafiaWar.loadAll();
      
      methods.loadInteriorCheckpoints();
  
      
      methods.loadAllBlips();
      cloth.loadAll();
      weather.loadAll();
      vehicleInfo.loadAll();
      
      inventory.loadAll();
      pickups.createPickups();
      coffer.load();
      
      vehicles.checkVehiclesFuel();
      vehicles.loadAllTimers();
  
      vehicles.loadAll();
      object.loadAll();
      timer.loadAll();
  
      tattoo.loadAll();
      lsc.loadAll();
      fuel.loadAll();
      shop.loadAll();
      bank.loadAll();
      barberShop.loadAll();
      rent.loadAll();
      gun.loadAll();
      bar.loadAll();
      carWash.loadAll();
      autosalon.loadAll();
  
      loadAuction();
      loadGarderobs();
      loadFractionGarages();
      loadMoneyChests();
      
      methods.saveLog('LoadServer', 'Success');
  
      setInterval(methods.saveAllAnother, 15 * 1000 * 60);
      userEntity.update({
        is_online: 0
      }, {where: {}})
    }).catch(e => {
      methods.debug(e);
      methods.saveLog('LoadServer', e);
    });
  
}

init()
