import { Container } from './data';
import UIMenu from './menu';
import { methods } from './methods';
import { weather } from '../managers/weather';
import { checkpoint } from '../managers/checkpoint';
import { dispatcher } from '../managers/dispatcher';
import { spawn } from '../managers/spawn';
import { ui } from './ui';
import { cloth } from '../business/cloth';
import { menuList } from '../menuList';
import { user } from '../user';
import { inventory } from '../inventory';
import { enums } from '../enums';
import { items_old } from '../items_old';
let items = items_old;
import { skills } from '../skills';
import { timer } from './timer';
import { coffer } from '../coffer';
import { phone } from '../phone';
import { jail } from '../managers/jail';
import { chat } from '../chat';
import { weapons } from '../weapons';
import { vehicles } from '../vehicles';
import { taxi } from '../jobs/taxi';
import { trucker } from '../jobs/trucker';
import { vSync } from '../managers/vSync';
import { gui } from './gui';
// import voice from '../voice';
import { formatTime, sleep } from '../../util/methods';
import { pointingAt } from '../managers/raycast';
import { hiddenIdMask } from '../../util/mask';
import { checkSitPosition } from '../managers/sitAnim';
import { restartVoice } from '../ragevoice';
export {}
let flag1 = 8;
let flag2 = 9;
let maxSpeed = 350;

/** Ремень безопасности */
export let seatBelt = false;

export let _playerDisableAllControls = false;
let _playerDisableDefaultControls = false;

let loadIndicatorDist = 30;

mp.events.add('modules:client:player:DisableAllControls', (playerDisableAllControls) => {
  _playerDisableAllControls = playerDisableAllControls;
});

mp.events.add('modules:client:player:DisableDefaultControls', (playerDisableDefaultControls) => {
  _playerDisableDefaultControls = playerDisableDefaultControls;
  mp.players.local.setEnableHandcuffs(_playerDisableDefaultControls);
  mp.players.local.setCanSwitchWeapon(!_playerDisableDefaultControls);
});

mp.events.add('client:clearChat', () => {
  user.clearChat();
});


let deadList:{ids:number,id:number,x:number,y:number,z:number}[] = [];

mp.events.add('listAfterDeath', (datas: string) => {
  let data = JSON.parse(datas);
  deadList.push(...data);
});
mp.events.add('addAfterDeath', (data: { ids: number, id: number, x: number, y: number, z: number }) => {
  deadList.push(data);
});
mp.events.add('removeAfterDeath', (id:number) => {
  let fnd = deadList.findIndex(value => value.ids == id);
  if (fnd > -1) {
    deadList.splice(fnd, 1);
  }
});


mp.events.add('client:teleport', (x, y, z, h?:number) => {
  methods.debug('Event: client:teleport', x, y, z, h);
  user.teleport(x, y, z, h);
});

mp.events.add('client:teleportWaypoint', () => {
  user.tpToWaypoint()
});
mp.events.add('client:teleportVeh', (x, y, z) => {
  methods.debug('Event: client:teleportVeh', x, y, z);
  user.teleportVeh(x, y, z);
});
mp.events.add('client:medTimerFree', (pay = true) => {
  jail.medFreePlayer(pay);
});

mp.events.add('client:dispatcher:addDispatcherList', (title, desc, time, x, y, z, withCoord) => {
  methods.debug(
    'Event: client:dispatcher:addDispatcherList',
    title,
    desc,
    time,
    x,
    y,
    z,
    withCoord
  );
  dispatcher.addDispatcherList(title, desc, time, x, y, z, withCoord);
});

mp.events.add(
  'client:dispatcher:addDispatcherTaxiList',
  (count, title, desc, time, price, x, y, z, id) => {
    methods.debug(
      'Event: client:dispatcher:addDispatcherTaxiList',
      count,
      title,
      desc,
      time,
      price,
      x,
      y,
      z
    );
    dispatcher.addDispatcherTaxiList(count, title, desc, time, price, x, y, z, id);
  }
);

mp.events.add('client:menuList:showMeriaMainMenu', () => {
  methods.debug('Event: client:menuList:showMeriaMainMenu');
  menuList.showMeriaMainMenu();
});

mp.events.add('client:menuList:showMazeOfficeMenu', () => {
  methods.debug('Event: client:menuList:showMazeOfficeMenu');
  menuList.showMazeOfficeMenu();
});

mp.events.add('client:menuList:showInvaderShopMenu', () => {
  methods.debug('Event: client:menuList:showInvaderShopMenu');
  menuList.showInvaderShopMenu();
});

mp.events.add('client:menuList:showPrintShopMenu', () => {
  methods.debug('Event: client:menuList:showPrintShopMenu');
  menuList.showPrintShopMenu();
});

mp.events.add('client:menuList:showRentVehBugstarMenu', () => {
  methods.debug('Event: client:menuList:showRentVehBugstarMenu');
  menuList.showRentVehBugstarMenu();
});

mp.events.add('client:menuList:showRentVehBshotMenu', () => {
  methods.debug('Event: client:menuList:showRentVehBshotMenu');
  menuList.showRentVehBshotMenu();
});

mp.events.add('client:menuList:showRentVehBusMenu', () => {
  methods.debug('Event: client:menuList:showRentVehBusMenu');
  menuList.showRentVehBusMenu();
});

mp.events.add('client:menuList:showRentVehTaxi1Menu', () => {
  methods.debug('Event: client:menuList:showRentVehTaxi1Menu');
  menuList.showRentVehTaxi1Menu();
});

mp.events.add('client:menuList:showRentVehTaxi2Menu', () => {
  methods.debug('Event: client:menuList:showRentVehTaxi2Menu');
  menuList.showRentVehTaxi2Menu();
});


mp.events.add('client:menuList:showRentVehMailMenu', () => {
  methods.debug('Event: client:menuList:showRentVehMailMenu');
  menuList.showRentVehMailMenu();
});

mp.events.add('client:menuList:showRentVehSunsetBleachMenu', () => {
  methods.debug('Event: client:menuList:showRentVehSunsetBleachMenu');
  menuList.showRentVehSunsetBleachMenu();
});

mp.events.add('client:menuList:showRentVehGardenerMenu', () => {
  methods.debug('Event: client:menuList:showRentVehGardenerMenu');
  menuList.showRentVehGardenerMenu();
});

mp.events.add('client:menuList:showRentVehPhotoMenu', () => {
  methods.debug('Event: client:menuList:showRentVehPhotoMenu');
  menuList.showRentVehPhotoMenu();
});

mp.events.add('client:menuList:showRentVehTruckerMenu', (id) => {
  methods.debug('Event: client:menuList:showRentVehPhotoMenu');
  menuList.showRentVehTruckerMenu(id);
});

mp.events.add('client:menuList:showRentVehWaterPowerMenu', () => {
  methods.debug('Event: client:menuList:showRentVehWaterPowerMenu');
  menuList.showRentVehWaterPowerMenu();
});

mp.events.add('client:showApartmentListMenu', (countFloor, buildId) => {
  methods.debug('Event: client:menuList:showApartmentListMenu');
  menuList.showApartmentListMenu(countFloor, buildId);
});

mp.events.add('client:showApartmentFloorListMenu', (data) => {
  methods.debug('Event: client:showApartmentFloorListMenu');
  menuList.showApartmentFloorListMenu(data);
  //menuList.showApartmentFloorListMenu(new Map(data));
});

mp.events.add('client:showApartmentInfoMenu', (data) => {
  try {
    methods.debug('Event: client:showApartmentInfoMenu');
    menuList.showApartmentInfoMenu(new Map(data));
  } catch (e) {
    methods.debug('Exception: events:client:showApartmentInfoMenu');
    methods.debug(e);
  }
});


mp.events.add('client:showMember2ListMenu', (data) => {
  methods.debug('Event: client:showMember2ListMenu');
  menuList.showMember2ListMenu(data);
});





mp.events.add('client:menuList:showMazeOfficeTeleportMenu', () => {
  methods.debug('Event: client:menuList:showMazeOfficeTeleportMenu');
  menuList.showMazeOfficeTeleportMenu();
});


mp.events.add('client:menuList:showFibOfficeTeleportMenu', () => {
  methods.debug('Event: client:menuList:showFibOfficeTeleportMenu');
  menuList.showFibOfficeTeleportMenu();
});

mp.events.add('client:menuList:showGovOfficeTeleportMenu', () => {
  methods.debug('Event: client:menuList:showGovOfficeTeleportMenu');
  menuList.showGovOfficeTeleportMenu();
});



mp.events.add('client:menuList:showVehicleMenu', (data) => {
  try {
    methods.debug('Event: client:menuList:showVehicleMenu');
    menuList.showVehicleMenu(new Map(data));
  } catch (e) {
    methods.debug('Exception: events:client:showVehicleMenu');
    methods.debug(e);
  }
});




mp.events.add('client:deleteObject', (x, y, z, hash, range = 1) => {
  mp.game.entity.createModelHide(x, y, z, range, hash, true);
});

mp.events.add('client:restoreObject', (x, y, z, hash) => {
  // mp.game.entity.removeModelHide(x, y, z, 1, hash, 1);
});

mp.events.add('client:explodeObject', (x: number, y: number, z: number, hash: HashOrString) => {
  mp.game.fire.addExplosion(x, y, z, 2, 20, false, false, 0);
  mp.game.entity.createModelHide(x, y, z, 1, hash, true);
  if(mp.game.gameplay.getDistanceBetweenCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, x ,y ,z, true) > 150) return;
  mp.game.audio.playSoundFromCoord(-1, "Jet_Explosions", x, y, z, "exile_1", false, 0, false)
});

mp.events.add('client:showCondoOutMenu', (item) => {
  try {
    methods.debug('Event: client:menuList:showCondoOutMenu');
    menuList.showCondoOutMenu(new Map(item));
  } catch (e) {
    methods.debug('Exception: events:client:showCondoOutMenu');
    methods.debug(e);
  }
});

mp.events.add('client:showCondoBuyMenu', (item) => {
  try {
    methods.debug('Event: client:menuList:showCondoBuyMenu');
    menuList.showCondoBuyMenu(new Map(item));
  } catch (e) {
    methods.debug('Exception: events:client:showCondoBuyMenu');
    methods.debug(e);
  }
});

mp.events.add('client:showCondoInMenu', (item) => {
  try {
    methods.debug('Event: client:menuList:showCondoInMenu');
    menuList.showCondoInMenu(new Map(item));
  } catch (e) {
    methods.debug('Exception: events:client:showCondoInMenu');
    methods.debug(e);
  }
});

mp.events.add('client:showStockOutMenu', (item) => {
  try {
    methods.debug('Event: client:menuList:showStockOutMenu');
    menuList.showStockOutMenu(new Map(item));
  } catch (e) {
    methods.debug('Exception: events:client:showStockOutMenu');
    methods.debug(e);
  }
});

mp.events.add('client:showStockBuyMenu', (item) => {
  try {
    methods.debug('Event: client:menuList:showStockBuyMenu');
    menuList.showStockBuyMenu(new Map(item));
  } catch (e) {
    methods.debug('Exception: events:client:showStockBuyMenu');
    methods.debug(e);
  }
});

mp.events.add('client:showStockInMenu', (item) => {
  try {
    methods.debug('Event: client:menuList:showStockInMenu');
    menuList.showStockInMenu(new Map(item));
  } catch (e) {
    methods.debug('Exception: events:client:showStockInMenu');
    methods.debug(e);
  }
});



mp.events.add('client:jail:jailPlayer', (sec, withIzol) => {
  methods.debug('Event: client:jail:jailPlayer' + sec);
  jail.jailPlayer(sec, withIzol);
});



mp.events.add('client:menuList:showSapdArrestMenu', () => {
  methods.debug('Event: client:menuList:showSapdArrestMenu');
  menuList.showSapdArrestMenu();
});

mp.events.add('client:menuList:showSapdClearMenu', () => {
  methods.debug('Event: client:menuList:showSapdClearMenu');
  menuList.showSapdClearMenu();
});


mp.events.add('client:menuList:showFuelMenu', (stationId, isShop, price) => {
  methods.debug('Event: client:menuList:showFuelMenu', stationId, isShop, price);
  menuList.showFuelMenu(stationId, isShop, price);
});

mp.events.add('client:menuList:showBarberShopMenu', (shopId) => {
  methods.debug('Event: client:menuList:showBarberShopMenu');
  menuList.showBarberShopMenu(shopId);
});


mp.events.add('client:menuList:showAptekaShopMenu', (shopId) => {
  methods.debug('Event: client:menuList:showAptekaShopMenu');
  menuList.showAptekaShopMenu(shopId);
});

mp.events.add('client:menuList:showElectroShopMenu', (shopId) => {
  methods.debug('Event: client:menuList:showElectroShopMenu');
  menuList.showElectroShopMenu(shopId);
});

mp.events.add('client:menuList:showGunShopMenu', (shopId, price) => {
  methods.debug('Event: client:menuList:showGunShopMenu');
  menuList.showGunShopMenu(shopId, price);
});

mp.events.add('client:menuList:showLscMenu', (shopId, price, idx, vListTun, vListColor) => {
  methods.debug('Event: client:menuList:showLscMenu');
  menuList.showLscMenu(shopId, price, idx, vListTun, vListColor);
});

mp.events.add('client:menuList:showShopMenu', (shopId, price) => {
  methods.debug('Event: client:menuList:showShopMenu');
  mp.console.logInfo(shopId, price)
  menuList.showShopMenu(shopId, price);
});

mp.events.add('client:menuList:showBarMenu', (shopId, price) => {
  methods.debug('Event: client:menuList:showBarMenu');
  menuList.showBarMenu(shopId, price);
});

mp.events.add('client:menuList:showBarFreeMenu', (businessid = 0) => {
  methods.debug('Event: client:menuList:showBarFreeMenu');
  menuList.showBarFreeMenu(1, businessid);
});



mp.events.add('client:menuList:showRentBikeMenu', (shopId, price) => {
  methods.debug('Event: client:menuList:showRentBikeMenu');
  menuList.showRentBikeMenu(shopId, price);
});

mp.events.add('client:menuList:showLicBuyMenu', () => {
  methods.debug('Event: client:menuList:showLicBuyMenu');
  //menuList.showLicBuyMenu();
});

mp.events.add(
  'client:menuList:showLscVehicleTunningMenu',
  (shopId, idx, vehNumber, vehId, price) => {
    methods.debug(
      'Event: client:menuList:showLscVehicleTunningMenu',
      shopId,
      idx,
      vehNumber,
      vehId,
      price
    );
    menuList.showLscVehicleTunningMenu(shopId, idx, vehNumber, vehId, price);
  }
);

mp.events.add(
  'client:menuList:showLscVehicleSTunningMenu',
  (shopId, idx, vehNumber, vehId, price) => {
    methods.debug(
      'Event: client:menuList:showLscVehicleSTunningMenu',
      shopId,
      idx,
      vehNumber,
      vehId,
      price
    );
    menuList.showLscVehicleSTunningMenu(shopId, idx, vehNumber, vehId, price);
  }
);

mp.events.add('client:menuList:showShopClothMenu', (component, clothColor, ClothData) => {
  methods.debug('Event: client:menuList:showShopClothMenu');
  menuList.showShopClothMenu(component, clothColor, ClothData);
});

mp.events.add('client:menuList:showShopMaskMenu', (shopId) => {
  methods.debug('Event: client:menuList:showShopMaskMenu');
  menuList.showShopMaskMenu(shopId);
});

mp.events.add('client:menuList:showBankMenu', (bankId, priceCard) => {
  methods.debug('Event: client:menuList:showBankMenu');
  menuList.showBankMenu(bankId, priceCard);
});

mp.events.add('client:user:setWaypoint', (x, y) => {
  methods.debug('Event: client:user:setWaypoint');
  user.setWaypoint(x, y);
});

mp.events.add('client:user:setWaypointTarget', (x, y, z) => {
  methods.debug('Event: client:user:setWaypointTarget');
  user.setWaypointTarget(x, y, z);
});
mp.events.add('client:user:removeWaypointTarget', () => {
  methods.debug('Event: client:user:removeWaypointTarget');
  user.clearWaypointTarget();
});

mp.events.add('client:jail:izol', (number) => {
  methods.debug('Event: client:jail:izol');
  jail.setIzol(number);
});

mp.events.add('client:jail:giveJailRun', () => {
  methods.debug('Event: client:jail:giveJailRun');
  Container.SetLocally(0, 'canRun', true);
});

mp.events.add('client:jail:takeJailRun', () => {
  methods.debug('Event: client:jail:takeJailRun');
  Container.ResetLocally(0, 'canRun');
});

mp.events.add('client:grabBank:success', (bankId) => {
  if (methods.getRandomInt(0, 200) == 0) {
    inventory.takeNewItem(141, methods.getRandomInt(15000, 30000));
    mp.game.ui.notifications.show(`~y~Вы сорвали куш`);
  } else {
    switch (methods.getRandomInt(0, 2000)) {
      case 0:
        inventory.takeNewItem(83);
        break;
      case 6:
        inventory.takeNewItem(89);
        break;
      case 7:
        inventory.takeNewItem(97);
        break;
      default:
        //inventory.takeNewItem(140, methods.getRandomInt(400, 1100));
        if (bankId == 5) {
          user.addGrabMoney(methods.getRandomInt(800, 1600));
          mp.game.ui.notifications.show(`~y~Необходимо отмыть деньги`);
        } else {
          user.addGrabMoney(methods.getRandomInt(500, 1500));
          mp.game.ui.notifications.show(`~y~Необходимо отмыть деньги`);
        }
        break;
    }
  }
});

mp.events.add('client:user:addGrabMoney', (money) => {
  user.addGrabMoney(money);
});

mp.events.add('client:user:removeGrabMoney', (money) => {
  user.removeGrabMoney(money);
});

mp.events.add('client:user:setGrabMoney', (money) => {
  user.setGrabMoney(money);
});

mp.events.add('client:user:addDrugLevel', (drugType, level) => {
  user.addDrugLevel(drugType, level);
});

mp.events.add('client:user:removeDrugLevel', (drugType, level) => {
  user.removeDrugLevel(drugType, level);
});

mp.events.add('client:user:setDrugLevel', (drugType, level) => {
  user.setDrugLevel(drugType, level);
});

mp.events.add('client:user:stopAllScreenEffects', () => {
  user.stopAllScreenEffect();
});

mp.events.add('client:user:freeze', (freeze) => {
  mp.players.local.freezePosition(freeze);
});

mp.events.add('client:user:disableAllControls', (disable) => {
  methods.disableAllControls(disable);
});

mp.events.add('client:houses:sellToPlayer', (houseId, sum, userId) => {
  menuList.showHouseSellToPlayerMenu(houseId, sum, userId);
});

mp.events.add('client:car:sellToPlayer', (houseId, name, sum, userId, slot) => {
  menuList.showCarSellToPlayerMenu(houseId, name, sum, userId, slot);
});

mp.events.add('client:stock:sellToPlayer', (houseId, sum, userId) => {
  menuList.showStockSellToPlayerMenu(houseId, sum, userId);
});

mp.events.add('client:apartments:sellToPlayer', (houseId, sum, userId) => {
  menuList.showApartSellToPlayerMenu(houseId, sum, userId);
});

mp.events.add('client:business:sellToPlayer', (houseId, sum, userId) => {
  menuList.showBusinessSellToPlayerMenu(houseId, sum, userId);
});

mp.events.add('client:condo:sellToPlayer', (houseId, sum, userId) => {
  menuList.showCondoSellToPlayerMenu(houseId, sum, userId);
});



mp.events.add('client:inventory:closeItemMenu', (id) => {
  inventory.closeItemMenu(id);
});


mp.events.add('client:console', (e) => {
  mp.console.logError(e);
});




mp.events.add('client:sendToPlayerItemListUpdateAmountMenu', (data, ownerType, ownerId) => {
  methods.debug('Event: client:sendToPlayerItemListUpdateAmountMenu');
  inventory.sendToPlayerItemListUpdateAmountMenu(data, ownerType, ownerId);
});

mp.events.add('client:startFishing', () => {
  methods.debug('Event: client:startFishing');
  inventory.startFishing();
});

let handcuffTimerId: any = null;

mp.events.add('clearWeapons', () => {
  user.removeAllWeapons()
})
mp.events.add('clearWeapon', (hash:number) => {
  user.removeWeapon(hash)
})

mp.events.add('client:handcuffs', (value) => {
  if(!UIMenu.Menu.GetCurrentMenu() || !UIMenu.Menu.GetCurrentMenu().workAnyTime)
  UIMenu.Menu.HideMenu();
  methods.debug('Event: client:handcuffs');
  methods.disableDefaultControls(value);

  /*if (value == false) {
        mp.players.local.clearTasks();
    }*/
  //mp.game.invoke(methods.SET_ENABLE_HANDCUFFS, mp.players.local.handle, value);
  if (value) {
    handcuffTimerId = setInterval(function() {
      if (user.isCuff() && !mp.players.local.isPlayingAnim('mp_arresting', 'idle', 3))
        mp.players.local.clearTasks();
        user.playAnimation('mp_arresting', 'idle', 49);
    }, 2500);
  } else {
    clearInterval(handcuffTimerId);
  }
});

// Inventory System End

// Auth

mp.events.add('client:user:askDatingToPlayerId', (playerId, nick) => {
  menuList.showPlayerDatingAskMenu(playerId, nick);
});

mp.events.add('client:user:setDating', (key, val) => {
  user.setDating(key, val);
});

mp.events.add('client:user:loginAuth', function(nick, password) {
  nick = nick.replace(/[^a-zA-Z\s]/gi, '');
  methods.storage.set('nick', nick);
  //mp.events.callRemote('server:user:validate:account', nick, password);
});

mp.events.add('client:user:registerAuth', function(
  name,
  surname,
  email,
  pass1,
  pass2,
  referer,
  promocode,
  acceptRules = false
) {
  name = name.replace(/[^a-zA-Z\s]/gi, '');
  surname = surname.replace(/[^a-zA-Z\s]/gi, '');
  email = email.replace("'", '');
  referer = referer.replace(/[^a-zA-Z\s]/gi, '');
  promocode = promocode.replace(/[^\w\s]/gi, '');
  if (name == '') {
    mp.game.ui.notifications.show('~r~Имя - поле не заполнено');
    return;
  }
  if (surname == '') {
    mp.game.ui.notifications.show('~r~Фамилия - поле не заполнено');
    return;
  }
  if (email == '') {
    mp.game.ui.notifications.show('~r~Email - полеpromocode_top_list не заполнено');
    return;
  }
  if (pass1 == '') {
    mp.game.ui.notifications.show('~r~Пароль - поле не заполнено');
    return;
  }
  if (pass2 != pass1) {
    mp.game.ui.notifications.show('~r~Пароли не совпадают');
    return;
  }
  if (acceptRules == false) {
    mp.game.ui.notifications.show('~r~Вы не согласились с правилами сервера');
    return;
  }
  mp.game.ui.notifications.show('~b~Пожалуйста подождите...');
  methods.storage.set('nick', name + ' ' + surname);
  mp.events.callRemote(
    'server:user:register:account',
    name + ' ' + surname,
    pass1,
    email,
    referer,
    promocode
  );
  //UIMenu.Menu.HideMenu();
});

mp.events.add('client:washVehicle', (vId) => {
  try {
    let veh = mp.vehicles.atRemoteId(vId);
    if (mp.vehicles.exists(veh)) veh.setDirtLevel(0);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('client:user:updateCache', (data) => {
  try {
    methods.debug('Event: client:user:updateCache');
    user.setCacheData(new Map(data));
  } catch (e) {
    methods.debug('Exception: events:client:user:updateCache');
    methods.debug(e);
  }
});

mp.events.add('client:user:hideLoadDisplay', (hud) => {
  methods.debug('Event: client:user:hideLoadDisplay');
  user.hideLoadDisplay(500, hud);
});


mp.events.add('client:user:showLoadDisplay', (hud) => {
  methods.debug('Event: client:user:showLoadDisplay');
  user.showLoadDisplay(500, hud);
});

mp.events.add('client:updateCheckpointList', (data, i) => {
  methods.debug('Event: client:updateCheckpointList');
  checkpoint.updateCheckpointList(data, i);
});

mp.events.add('client:updateGangZoneList', (data) => {
  methods.debug('Event: client:updateGangZoneList');
  methods.updateGangZoneList(data);
});

mp.events.add('client:updateVehicleInfo', (data) => {
  methods.debug('Event: client:updateVehicleInfo');
  enums.updateVehicleInfo(data);
});

mp.events.add('client:removeVehicleInfo', (id) => {
  enums.removeVehicleInfo(id);
});
mp.events.add('client:editVehicleInfo', (id:number, value:{[param:string]:any}) => {
  enums.editVehicleInfo(id, value);
});

mp.events.add('client:user:clearAllProp', (playerId) => {
  try {
    let remotePlayer = mp.players.atRemoteId(playerId);
    if (remotePlayer && mp.players.exists(remotePlayer)) {
      methods.debug('Event: events:client:user:clearAllProp');
      if (remotePlayer === mp.players.local) remotePlayer = mp.players.local;
      remotePlayer.clearProp(0);
      remotePlayer.clearProp(1);
      remotePlayer.clearProp(2);
      remotePlayer.clearProp(6);
      remotePlayer.clearProp(7);
    }
  } catch (e) {
    methods.debug('Exception: events:client:user:clearAllProp');
    methods.debug(e);
  }
});

mp.events.add('client:user:setComponentVariation', (component, drawableId, textureId) => {
  methods.debug('Event: client:user:setComponentVariation', component, drawableId, textureId);
  mp.players.local.setComponentVariation(component, drawableId, textureId, 2);
});


mp.events.add('weatherdata:set', (...args) => {
  weather.syncDateTime(args[0], args[1], args[2], args[3], args[4]);
  weather.syncRealTime(args[5]);
  weather.syncWeatherTemp(args[6]);
  weather.syncRealFullDateTime(args[7]);
  weather.nextWeather(args[8], args[9] ? 1 : 10)
})






mp.events.add('client:user:stopAnimation', () => {
  methods.debug('Event: client:user:stopAnimation');
  if (!mp.players.local.getVariable('isBlockAnimation')) {
    mp.players.local.clearTasks();
    //mp.players.local.clearSecondaryTask();
  }
});

mp.events.add('client:user:revive', (hp) => {
  methods.debug('Event: client:user:revive');
  user.revive(hp);
});

mp.events.add('client:menuList:showMenu', (title, desc, menuData) => {
  methods.debug('Event: client:menuList:showMenu');
  menuList.showMenu(title, desc, new Map(menuData));
});

mp.events.add('client:menuList:showTruckerOffersMenu', (menuData) => {
  methods.debug('Event: client:menuList:showTruckerOffersMenu');
  menuList.showTruckerOffersMenu(menuData);
});



mp.events.add('client:lawyer:accept', (price, id, rpName) => {
  methods.debug('Event: client:lawyer:accept', price, id, rpName);
  menuList.showLawyerOffersMenu(price, id, rpName);
});

mp.events.add('client:lawyer:house:accept', (buyerId, id) => {
  menuList.showLawyerHouseOffersMenu(buyerId, id);
});

mp.events.add('client:showMazeBankHousePeopleListMenu', (data) => {
  menuList.showMazeBankHousePeopleListMenu(data);
});

mp.events.add('client:trucker:acceptOffer1', (id, name, company, x, y, z, px, py, pz, price) => {
  methods.debug('Event: client:trucker:acceptOffer1');
  trucker.acceptOffer1(id, name, company, x, y, z, px, py, pz, price);
});

mp.events.add(
  'client:trucker:acceptOffer2',
  (id, name, company, trName, cl1, cl2, liv, x, y, z, rot, px, py, pz, price) => {
    methods.debug('Event: client:trucker:acceptOffer2');
    trucker.acceptOffer2(id, name, company, trName, cl1, cl2, liv, x, y, z, rot, px, py, pz, price);
  }
);

mp.events.add('client:user:takeNewItem', (itemId, count) => {
  methods.debug('Event: client:user:takeNewItem');
  inventory.takeNewItem(itemId, count);
});



mp.events.add('client:chatTyping', (enable) => {
  user.setVariable('isTyping', enable);
});

mp.events.add('client:setPlayerDecoration', (id, slot, overlay) => {
  methods.debug('Event: client:setPlayerDecoration', id, slot, overlay);
  let remotePlayer = mp.players.atRemoteId(id);
  if (mp.players.exists(remotePlayer))
    remotePlayer.setDecoration(
      mp.game.gameplay.getHashKey(slot),
      mp.game.gameplay.getHashKey(overlay)
    );
});

mp.events.add('client:clearPlayerDecorations', (id) => {
  methods.debug('Event: client:clearPlayerDecorations', id);
  let remotePlayer = mp.players.atRemoteId(id);
  if (mp.players.exists(remotePlayer)) remotePlayer.clearDecorations();
});

mp.events.add('client:user:giveWeaponByHash', (hash, pt, inHand = false) => {
  methods.debug('Event: client:user:giveWeaponByHash', hash, pt);
  user.giveWeaponByHash(hash, pt, inHand);
});

mp.events.add('client:distId', (loadDist) => {
  methods.debug('Event: client:distId', loadDist);
  loadIndicatorDist = loadDist;
});

mp.events.add('entityStreamIn', (entity) => {
  if (entity.type === 'player') {
    let remotePlayer = entity;
    if (mp.players.exists(remotePlayer)) {
      for (let i = 0; i < 8; i++) {
        try {
          let propType = remotePlayer.getVariable('propType' + i);
          let propColor = remotePlayer.getVariable('propColor' + i);
          if (propType < 0 || propType == undefined) remotePlayer.clearProp(i);
          else remotePlayer.setPropIndex(i, propType, propColor, true);
        } catch (e) {
          methods.debug(e);
        }
      }
    }
    //mp.events.callRemote('server:playerStreamIn', entity.remoteId);
  }
});

mp.events.add('playerDeath', async function(player, reason, killer) {
  if(mp.players.local.getVariable('inMp')) return;
  /*methods.debug(player);
    methods.debug(reason);
    methods.debug(killer);*/
  // mp.game.ui.notifications.show('~y~Нажмите ~s~Y~y~ чтобы вызвать врача');
  // mp.game.ui.notifications.show('~y~Нажмите ~s~N~y~ чтобы отказаться от врача');

  // mp.events.triggerBrowser('cef:alert:setHelpKey', 'Y/N', escape("Вызвать/Отказатся от врача"), 15000);
  mp.events.triggerBrowser('cef:alert:setBigAlert', 'success', escape("Нажмите Y чтобы вызвать врача. Нажмите N чтобы отказаться от врача"), 7000);
  
  if (
    methods.distanceToPos(
      mp.players.local.position,
      new mp.Vector3(288.61148, -1345.5358, 23.5378017)
    ) > 3000
  )
    timer.setDeathTimer(400);
  else if (
    methods.distanceToPos(
      mp.players.local.position,
      new mp.Vector3(288.61148, -1345.5358, 23.5378017)
    ) > 4000
  )
    timer.setDeathTimer(500);
  else if (
    methods.distanceToPos(
      mp.players.local.position,
      new mp.Vector3(288.61148, -1345.5358, 23.5378017)
    ) > 5000
  )
    timer.setDeathTimer(600);
  else timer.setDeathTimer(300);

  if (player.getVariable('enableAdmin')) timer.setDeathTimer(10);


  UIMenu.Menu.HideMenu();
  inventory.hide();

  mp.game.gameplay.disableAutomaticRespawn(true);
  mp.game.gameplay.ignoreNextRestart(true);
  mp.game.gameplay.setFadeInAfterDeathArrest(true);
  mp.game.gameplay.setFadeOutAfterDeath(false);

  user.stopAllScreenEffect();

  mp.players.local.freezePosition(false);
  mp.players.local.setCollision(true, true);
  Container.ResetLocally(0, 'hasSeat');
  Container.ResetLocally(0, 'canRun');

});

let blockMaxSpeed = false
/** Костыль для блокирования перенавешивания maxSpeed */
export function blockSpeedMax(time = 1000){
  blockMaxSpeed = true;
  setTimeout(() => {
    blockMaxSpeed = false;
  }, time)
}

// let raycastRes:RaycastResult;

// setInterval(() => {
//   raycastRes = pointingAt(loadIndicatorDist);
// }, 400);

const baseKeyDisable = () => {
  mp.game.controls.disableControlAction(0, 21, true); // disable sprint
  mp.game.controls.disableControlAction(0, 24, true); // disable attack
  mp.game.controls.disableControlAction(0, 25, true); // disable aim
  //--mp.game.controls.disableControlAction(0,47,true) // disable weapon
  mp.game.controls.disableControlAction(0, 58, true); // disable weapon
  mp.game.controls.disableControlAction(0, 263, true); // disable melee
  mp.game.controls.disableControlAction(0, 264, true); // disable melee
  mp.game.controls.disableControlAction(0, 257, true); // disable melee
  mp.game.controls.disableControlAction(0, 140, true); // disable melee
  mp.game.controls.disableControlAction(0, 141, true); // disable melee
  mp.game.controls.disableControlAction(0, 142, true); // disable melee
  mp.game.controls.disableControlAction(0, 143, true); // disable melee
  mp.game.controls.disableControlAction(0, 75, true); // disable exit vehicle
  mp.game.controls.disableControlAction(27, 75, true); // disable exit vehicle
  mp.game.controls.disableControlAction(0, 23, true); // disable enter vehicle
  mp.game.controls.disableControlAction(27, 23, true); // disable enter vehicle
  mp.game.controls.disableControlAction(0, 22, true); // disable jump
  mp.game.controls.disableControlAction(0, 32, true); // disable move up
  mp.game.controls.disableControlAction(0, 268, true);
  mp.game.controls.disableControlAction(0, 33, true); // disable move down
  mp.game.controls.disableControlAction(0, 269, true);
  mp.game.controls.disableControlAction(0, 34, true); // disable move left
  mp.game.controls.disableControlAction(0, 270, true);
  mp.game.controls.disableControlAction(0, 35, true); // disable move right
  mp.game.controls.disableControlAction(0, 271, true);
  mp.game.controls.disableControlAction(0, 37, true); // disable select weapon
  mp.game.controls.disableControlAction(0, 91, true); // disable select weapon
  mp.game.controls.disableControlAction(0, 92, true); // disable select weapon
  mp.game.controls.disableControlAction(27, 91, true); // disable select weapon
  mp.game.controls.disableControlAction(27, 92, true); // disable select weapon
}

mp.events.add('render', () => {
  mp.game.controls.disableControlAction(0, 243, true);

  //TODO DELUXO FIX
  mp.game.controls.disableControlAction(0, 357, true);

  if (phone.ingameBrowser || (gui.isActionGui() && !gui.isActionMoveGui())) mp.game.controls.disableAllControlActions(1);
  if (_playerDisableAllControls || phone.ingameBrowser || (gui.isActionGui() && !gui.isActionMoveGui())) {
    mp.game.controls.disableAllControlActions(0);
    mp.game.controls.disableAllControlActions(2);
    mp.game.controls.enableControlAction(2, 172, true);
    mp.game.controls.enableControlAction(2, 173, true);
    mp.game.controls.enableControlAction(2, 174, true);
    mp.game.controls.enableControlAction(2, 175, true);
    mp.game.controls.enableControlAction(2, 201, true);
    mp.game.controls.enableControlAction(2, 177, true);
  }
  if (_playerDisableDefaultControls) {
    baseKeyDisable();
    mp.players.local.setEnableHandcuffs(true);
    mp.players.local.setCanSwitchWeapon(false);
    if(mp.players.local.vehicle)mp.game.controls.disableAllControlActions(0);
  }
  if (ui.DisableMouseControl || ui.isShowMenu()) {
    mp.game.controls.disableControlAction(0, 12, true); // disable sprint
    mp.game.controls.disableControlAction(0, 13, true); // disable sprint
    mp.game.controls.disableControlAction(0, 14, true); // disable sprint
    mp.game.controls.disableControlAction(0, 15, true); // disable sprint
    mp.game.controls.disableControlAction(0, 17, true); // disable sprint
    mp.game.controls.disableControlAction(0, 18, true); // disable sprint
    mp.game.controls.disableControlAction(0, 24, true); // disable sprint
    mp.game.controls.disableControlAction(0, 25, true); // disable sprint

    //Disable Cam
    mp.game.controls.disableControlAction(0, 1, true);
    mp.game.controls.disableControlAction(0, 2, true);
    mp.game.controls.disableControlAction(0, 3, true);
    mp.game.controls.disableControlAction(0, 4, true);
    mp.game.controls.disableControlAction(0, 5, true);
    mp.game.controls.disableControlAction(0, 6, true);
  }
  if (gui.isActionMoveGui()) mp.gui.cursor.show(false, true);
  else if (gui.isActionGui() && !mp.gui.cursor.visible) mp.gui.cursor.show(true, true);

  if(gui.isActionMoveGui()){
    //Disable Cam
    mp.game.controls.disableControlAction(0, 1, true);
    mp.game.controls.disableControlAction(0, 2, true);
    mp.game.controls.disableControlAction(0, 3, true);
    mp.game.controls.disableControlAction(0, 4, true);
    mp.game.controls.disableControlAction(0, 5, true);
    mp.game.controls.disableControlAction(0, 6, true);
    mp.game.controls.disableControlAction(0, 199, true);

    baseKeyDisable();
  }

  let veh = mp.players.local.vehicle;
  if (veh && veh.getClass() != 8) {
    if (veh.getPedInSeat(-1) == mp.players.local.handle) {
      if (user.get('mp0_shooting_ability') < 99 && !user.isPolice()) {
        mp.game.controls.disableControlAction(2, 24, true);
        mp.game.controls.disableControlAction(2, 25, true);
        mp.game.controls.disableControlAction(2, 66, true);
        mp.game.controls.disableControlAction(2, 67, true);
        mp.game.controls.disableControlAction(2, 69, true);
        mp.game.controls.disableControlAction(2, 70, true);
        mp.game.controls.disableControlAction(2, 140, true);
        mp.game.controls.disableControlAction(2, 141, true);
        mp.game.controls.disableControlAction(2, 143, true);
        mp.game.controls.disableControlAction(2, 263, true);
      }
    }
  }
  else if (veh && veh.getClass() == 8 && methods.getCurrentSpeed() > 50) {
    mp.game.controls.disableControlAction(2, 24, true);
    mp.game.controls.disableControlAction(2, 25, true);
    mp.game.controls.disableControlAction(2, 66, true);
    mp.game.controls.disableControlAction(2, 67, true);
    mp.game.controls.disableControlAction(2, 69, true);
    mp.game.controls.disableControlAction(2, 70, true);
    mp.game.controls.disableControlAction(2, 140, true);
    mp.game.controls.disableControlAction(2, 141, true);
    mp.game.controls.disableControlAction(2, 143, true);
    mp.game.controls.disableControlAction(2, 263, true);
  }
  if (user.get('med_time') > 0) {
    mp.game.controls.disableControlAction(2, 24, true);
    mp.game.controls.disableControlAction(2, 25, true);
    mp.game.controls.disableControlAction(2, 66, true);
    mp.game.controls.disableControlAction(2, 67, true);
    mp.game.controls.disableControlAction(2, 69, true);
    mp.game.controls.disableControlAction(2, 70, true);
    mp.game.controls.disableControlAction(2, 140, true);
    mp.game.controls.disableControlAction(2, 141, true);
    mp.game.controls.disableControlAction(2, 143, true);
    mp.game.controls.disableControlAction(2, 263, true);
  }
  let plPos = mp.players.local.position;
  if ([60674, 60418].includes(mp.game.interior.getInteriorAtCoords(plPos.x, plPos.y, plPos.z))) {
    mp.game.graphics.drawLightWithRange(291.9079, -1348.883, 27.03455, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(279.4622, -1337.024, 27.03455, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(272.779, -1341.37, 27.03455, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(264.4822, -1360.97, 27.03455, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(253.408, -1364.389, 27.03455, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(254.8074, -1349.439, 27.03455, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(240.4855, -1368.784, 32.28351, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(247.7051, -1366.653, 32.34088, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(257.9836, -1358.863, 41.80476, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(255.0098, -1383.685, 42.01367, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(230.9255, -1367.348, 42.03852, 255, 255, 255, 20.0, 0.5);
    mp.game.graphics.drawLightWithRange(243.6069, -1366.777, 26.78872, 255, 255, 255, 20.0, 0.5);
  }
  mp.game.ui.hideHudComponentThisFrame(1); // Wanted Stars
  mp.game.ui.hideHudComponentThisFrame(2); // Weapon Icon
  mp.game.ui.hideHudComponentThisFrame(3); // Cash
  mp.game.ui.hideHudComponentThisFrame(4); // MP Cash
  mp.game.ui.hideHudComponentThisFrame(6); // Vehicle Name
  mp.game.ui.hideHudComponentThisFrame(7); // Area Name
  mp.game.ui.hideHudComponentThisFrame(8);// Vehicle Class
  mp.game.ui.hideHudComponentThisFrame(9); // Street Name
  mp.game.ui.hideHudComponentThisFrame(13); // Cash Change
  mp.game.ui.hideHudComponentThisFrame(17); // Save Game
  mp.game.ui.hideHudComponentThisFrame(20); // Weapon Stats

  /*mp.game.controls.mp.game.controls.disableControlAction(0, 157, true);
    mp.game.controls.mp.game.controls.disableControlAction(0, 158, true);
    mp.game.controls.mp.game.controls.disableControlAction(0, 160, true);
    mp.game.controls.mp.game.controls.disableControlAction(0, 164, true);*/

  //TODO
  //if (user.isLogin() && user.get('mp0_shooting_ability') < 70)
  //    mp.game.ui.hideHudComponentThisFrame(14);
  let vehicle = veh;
  if (vehicle && mp.players.local.isInAnyVehicle(false) && !blockMaxSpeed) {
    // And fix max speed
    vehicle.setMaxSpeed(maxSpeed / 3.6); // fix max speed
    if (vehicle.getVariable('boost') > 0) {
      vehicle.setEngineTorqueMultiplier(vehicle.getVariable('boost'));
    } else vehicle.setEngineTorqueMultiplier(1.3);
  }
  if (mp.players.local.isBeingStunned(0)) mp.players.local.setMinGroundTimeForStungun(30000);
  mp.game.player.setHealthRechargeMultiplier(0.0);
  if (user.isLogin() && showIds) {
    let localPlayer = mp.players.local;
    let __localPlayerPosition__ = mp.players.local.position;
    let admin = mp.players.local.getVariable('enableAdmin');

    if(admin && user.adminAdvancedData){
      mp.vehicles.forEach(vehicle => {
        const pos = vehicle.position
        const dist = methods.distanceToPos(__localPlayerPosition__, pos)
        if(dist < loadIndicatorDist){
          let text = ``;
          if(dist < loadIndicatorDist*0.75)text+=`[${vehicle.getNumberPlateText()}]\n`
          if(vehicle.getVariable('id_user')) text+=`USER: ${vehicle.getVariable('id_user')} ~b~|~w~`
          if (vehicle.getVariable('fraction_id')) text += `FRACTION: ${vehicle.getVariable('fraction_id')} ~b~|~w~`
          text+=`ID: ${vehicle.remoteId}\n`
          let velocity = vehicle.getVelocity();
          let speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
          //speed = Math.round(speed * 2.23693629);
          speed = Math.round(speed * 3.6);
          let maxSpeed = mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model);
          if (vehicle.getVariable('boost')) maxSpeed *= vehicle.getVariable('boost');
          else maxSpeed *= 1.3
          if (speed > 30) text += (vehicle.getSpeed() > (maxSpeed+10) ? '~r~' : '~b~')+'Speed: ' + speed + '~w~\n';
          if (speed > ((maxSpeed * 3.6) / 2)) text += '~r~Max: ' + (maxSpeed*3.6).toFixed(0)+'~w~\n';
          text += (vehicle.getVariable('locked') ? '~r~Doors~s~' : '~g~Doors~s~') + "/" + (vehicle.getVariable('engine') ? '~g~Engine~s~' : '~r~Engine~s~') + '\n';
          ui.drawText3D(text, pos.x, pos.y, pos.z-1.0);
        }
      })
    }
    mp.players.forEachInStreamRange((player) => {
      if(!player.handle) return;
      if (player === localPlayer || !mp.players.exists(player)) {
        return false;
      }
      if (player.getAlpha() < 10 && !admin && !player.getVariable('skate')) return false;

      const __playerPosition__ = player.position;
      const distance = methods.distanceToPos(__localPlayerPosition__, __playerPosition__);

      if (distance <= loadIndicatorDist && player.dimension == localPlayer.dimension) {
        const isConnected = player.isListening;
        const isEnable = player.isSpeaking;
        let indicatorColor = '~m~•';
        if (isConnected && !isEnable) indicatorColor = '~m~•';
        else if (isConnected && isEnable) indicatorColor = '~w~•';
        const headPosition = { ...player.position, z: player.position.z+0.6}

        let typingLabel = '';
        const IN_MASK = hiddenIdMask.includes(player.getDrawableVariation(1))
        if (user.isDead(player)) typingLabel += '\n~r~Без сознания';
        if (player.getVariable('enableAdmin') && (!player.getVariable('enableAdminHidden') || user.get('admin_level') >= 5)) typingLabel += '\n~r~ADMIN MOD';
        else if (player.getVariable('hiddenId')) typingLabel += '\n~m~HIDDEN ID';
        if (player.getVariable('isAfk')) typingLabel += '\n~r~AFK...';
        else if (player.getVariable('isTyping')) typingLabel += '\n~b~Печатает...';
        // else if (player.getVariable('collapsedGame')) typingLabel += '\n~y~Свёрнут...';
        
        if ((admin && user.showhpap) || (mp.game.player.isFreeAimingAtEntity(player.handle))) typingLabel += '\n~g~HP:'+player.getHealth()+' ~b~AP:'+player.getArmour();
        if (admin){
          deadList.filter(item => item.id == player.getVariable('id')).map(item => {
            const posdeath = item
            if(admin && posdeath && mp.game.gameplay.getDistanceBetweenCoords(player.position.x, player.position.y, player.position.z, posdeath.x, posdeath.y, posdeath.z, true) <= 100.0) typingLabel += '\n~r~AFTER DEATH '+methods.parseInt(mp.game.gameplay.getDistanceBetweenCoords(player.position.x, player.position.y, player.position.z, posdeath.x, posdeath.y, posdeath.z, true))+"m";
          })
        }

        let name = '';
        let dbid = player.getVariable('id');
        if (user.hasDating(dbid) && !IN_MASK)
          name = user.getDating(dbid) + ' | ';
        if (admin || (!player.getVariable('hiddenId') && mp.players.local.hasClearLosTo(player.handle, 17))) {
          ui.drawText3D(
            name + (player.getVariable('fraction_id') && admin && user.showhpap ? `(F:${player.getVariable('fraction_id')}) `: '')+user.getShowingIdString(player) + ' ' + indicatorColor + typingLabel,
            headPosition.x,
            headPosition.y,
            headPosition.z + 0.1
          );
        }
      }
    });
  }
  if (user.isLogin()) {
    if (user.get('jail_time')) {
      mp.game.graphics.drawText(formatTime(user.get('jail_time')) + ' до освобождения', [0.5, 0.9], {
        font: 0,
        color: [255, 255, 255, 100],
        scale: [0.4, 0.4],
        outline: true,
        centre: false,
      });
    }
    if (user.get('med_time')) {
      mp.game.graphics.drawText(formatTime(user.get('med_time')) + ' до выздоровления', [0.5, 0.9], {
        font: 0,
        color: [255, 255, 255, 100],
        scale: [0.4, 0.4],
        outline: true,
        centre: false,
      });
    }
  }
});

mp.events.add('playerStartEnterVehicle', (vehicle: VehicleMp) => {
  if (typeof vehicle.getVariable('locked') == 'boolean') {
    vehicle.setDoorsLockedForPlayer(mp.players.local.handle, vehicle.getVariable('locked'));
  }
});

mp.events.add('playerLeaveVehicle', function() {
  mp.players.local.setConfigFlag(32, true);
  seatBelt = false;
});

mp.events.add('playerEnterVehicle', async function(vehicle, seat) {
  // if(vehicle.getVariable("raceVehicle")) return;
  // let boost = 0;
  // if (vehicle.getMod(18) == 1) boost = 5;

  // let vehInfo = methods.getVehicleInfo(vehicle.model);
  // if (vehInfo.class_name == 'Emergency') boost = boost + 10;

  // boost = boost + vehicles.getSpeedBoost(vehicle.model);

  // maxSpeed = vehicles.getSpeedMax(vehicle.model);
  // if (maxSpeed == 1) maxSpeed = 350;

  // if (vehicle.getVariable('boost') > 0)
  //   vehicle.setEnginePowerMultiplier(vehicle.getVariable('boost') + boost);
  // else if (boost > 1) vehicle.setEnginePowerMultiplier(boost);

  // try {
  //   if (vehicle.getVariable('container') != undefined && vehicle.getVariable('id_user') > 0) {
  //     let car = await vehicles.getData(vehicle.getVariable('container'));

  //     if (car.has('upgrade')) {
  //       let upgrade = JSON.parse(car.get('upgrade'));
  //       for (let tune in upgrade) {
  //         try {
  //           let modType = methods.parseInt(tune);
  //           if (modType == 18) maxSpeed += 20;
  //           if (modType >= 100) {
  //             if (methods.parseInt(upgrade[modType]) < 0) continue;

  //             if (modType == 101 || modType == 102) maxSpeed += 20;

  //             if (modType == 101) vehicle.setEnginePowerMultiplier(boost + 50);
  //             else
  //               vehicle.setHandling(
  //                 vehicles.getSpecialModName(modType),
  //                 upgrade[modType].toString()
  //               );
  //           }
  //         } catch (e) {
  //           methods.debug(e);
  //         }
  //       }
  //     }
  //   }
  // } catch (e) {
  //   methods.debug(e);
  // }
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type === 'vehicle') {
      if (entity.getVariable('freezePosition') === true)
            entity.freezePosition(true);
    }
});
mp.events.addDataHandler("freezePosition", (entity: VehicleMp, value: boolean) => {
  if (entity.type != "vehicle") return;
  entity.freezePosition(value);
});

mp.gui.execute(
  "const _enableChatInput = enableChatInput;enableChatInput = (enable) => { mp.trigger('chatEnabled', enable); _enableChatInput(enable) };"
);

mp.events.add('chatEnabled', (isEnabled) => {
  mp.gui.chat.enabled = isEnabled;
  methods.disableAllControls(isEnabled);
});

mp.keys.bind(0x1b, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (phone.ingameBrowser) {
    phone.destroyBrowser();
    mp.gui.cursor.show(false, false);
  }
  if (!inventory.isHide()) inventory.hide();
});
mp.keys.bind(118, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  restartVoice()
});

mp.keys.bind(0x08, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!phone.ingameBrowser && !inventory.isHide()) inventory.hide();
});

let keyEspam = false;

mp.keys.bind(0x45, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if(mp.gui.cursor.visible) return;
  if (keyEspam) return;
  keyEspam = true;
  setTimeout(() => {
    keyEspam = false;
  }, 1000)
  if (!methods.isBlockKeys()) {
    // if (!checkSitPosition()){
      methods.pressEToPayRespect();
      mp.events.callSocket('onKeyPress:E');
    // }
  }
});

//N
mp.keys.bind(0x4e, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (user.isDead()) {
    if (Container.HasLocally(mp.players.local.remoteId, 'isEmsTimeout')) {
      mp.game.ui.notifications.show('~r~Нельзя так часто нажимать эту кнопку');
      mp.game.ui.notifications.show('~r~Подождите 30 секунд');
      return;
    }

    if (timer.getDeathTimer() > 60) timer.setDeathTimer(60);
    mp.events.triggerBrowser('cef:alert:removeHelpKey');
    mp.game.ui.notifications.show('~r~Вы отказались от вызова медиков');

    Container.SetLocally(mp.players.local.remoteId, 'isEmsTimeout', true);

    setTimeout(function() {
      Container.ResetLocally(mp.players.local.remoteId, 'isEmsTimeout');
    }, 30000);
  }
});

//Y
mp.keys.bind(0x59, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (user.isDead()) {
    if (Container.HasLocally(mp.players.local.remoteId, 'isEmsTimeout')) {
      mp.game.ui.notifications.show('~r~Нельзя так часто нажимать эту кнопку');
      mp.game.ui.notifications.show('~r~Подождите 30 секунд');
      return;
    }

    dispatcher.callFraction(`[EMS] Код 3`, `Человек без сознания`, [16]);
    // mp.events.triggerBrowser('cef:alert:removeHelpKey');
    mp.game.ui.notifications.show('~b~Вызов был отправлен медикам, ожидайте');

    Container.SetLocally(mp.players.local.remoteId, 'isEmsTimeout', true);

    setTimeout(function() {
      Container.ResetLocally(mp.players.local.remoteId, 'isEmsTimeout');
    }, 30000);
  }
});

//G
mp.keys.bind(0x47, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) {
    ui.showOrHideMenu();
  }
});

mp.keys.bind(0xdb, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && enums.lscCam != null) {
    try {
      enums.lscCamRot = enums.lscCamRot - 0.2;
      let pos = new mp.Vector3(
        enums.lscCam.getRange * Math.sin(enums.lscCamRot) + enums.lscCam.getPointAtCoords.x,
        enums.lscCam.getRange * Math.cos(enums.lscCamRot) + enums.lscCam.getPointAtCoords.y,
        enums.lscCam.getPointAtCoords.z
      );
      enums.lscCam.setCoord(pos.x, pos.y, pos.z + 1.7);
    } catch (e) {
      methods.debug(e);
    }
  } else if (!methods.isBlockKeys() && mp.players.local.vehicle) {
    let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');
    vehicles.setIndicatorLeftState(!actualData.IndicatorLeftToggle);
    vehicles.setIndicatorRightState(false);
  }
});

mp.keys.bind(0xdd, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && enums.lscCam != null) {
    try {
      enums.lscCamRot = enums.lscCamRot + 0.2;
      let pos = new mp.Vector3(
        enums.lscCam.getRange * Math.sin(enums.lscCamRot) + enums.lscCam.getPointAtCoords.x,
        enums.lscCam.getRange * Math.cos(enums.lscCamRot) + enums.lscCam.getPointAtCoords.y,
        enums.lscCam.getPointAtCoords.z
      );
      enums.lscCam.setCoord(pos.x, pos.y, pos.z + 1.7);
    } catch (e) {
      methods.debug(e);
    }
  } else if (!methods.isBlockKeys() && mp.players.local.vehicle) {
    let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');
    vehicles.setIndicatorRightState(!actualData.IndicatorRightToggle);
    vehicles.setIndicatorLeftState(false);
  }
});

mp.keys.bind(0xbb, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && enums.lscCam != null) {
    try {
      enums.lscCam.getRange = enums.lscCam.getRange - 0.2;
      let pos = new mp.Vector3(
        enums.lscCam.getRange * Math.sin(enums.lscCamRot) + enums.lscCam.getPointAtCoords.x,
        enums.lscCam.getRange * Math.cos(enums.lscCamRot) + enums.lscCam.getPointAtCoords.y,
        enums.lscCam.getPointAtCoords.z
      );
      enums.lscCam.setCoord(pos.x, pos.y, pos.z + 1.7);
    } catch (e) {
      methods.debug(e);
    }
  }
});

mp.keys.bind(0xbd, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && enums.lscCam != null) {
    try {
      enums.lscCam.getRange = enums.lscCam.getRange + 0.2;
      if (enums.lscCam.getRange > 4.6) enums.lscCam.getRange = 4.6;
      let pos = new mp.Vector3(
        enums.lscCam.getRange * Math.sin(enums.lscCamRot) + enums.lscCam.getPointAtCoords.x,
        enums.lscCam.getRange * Math.cos(enums.lscCamRot) + enums.lscCam.getPointAtCoords.y,
        enums.lscCam.getPointAtCoords.z
      );
      enums.lscCam.setCoord(pos.x, pos.y, pos.z + 1.7);
    } catch (e) {
      methods.debug(e);
    }
  }
});

mp.keys.bind(0x4b, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && enums.lscCam != null) {
    let veh = mp.vehicles.atRemoteId(enums.lscCam.vehId);
    if (mp.vehicles.exists(veh)) {
      if (veh.allDoorsOpen) {
        veh.allDoorsOpen = false;
        for (let i = 0; i < 8; i++) veh.setDoorShut(i, true);
      } else {
        veh.allDoorsOpen = true;
        for (let i = 0; i < 8; i++) veh.setDoorOpen(i, false, true);
      }

      vSync.syncToServer(veh);
    }
  }
});

mp.keys.bind(0x12, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) mp.events.callSocket('onKeyPress:LAlt');
});

mp.keys.bind(0x32, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) mp.events.callSocket('onKeyPress:2');
});

mp.keys.bind(0x4c, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) mp.events.callSocket('onKeyPress:L');
});

mp.events.add('unb', () => {
  let int = setInterval(() => {
    if(!gui.browser || !gui.browser.execute) return;
    clearInterval(int);
    gui.browser.execute(`freedombb()`);
  }, 100)
})

mp.keys.bind(0x33, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (methods.isBlockKeys()) return;
  if (!user.get('tablet_equip')) return user.notify("~r~У вас нет планшета в экипировке. Купите его в магазине либо экипируйте из инвентаря") 
  mp.events.callRemote('tablet:main');
});

mp.keys.bind(0x34, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && user.get('fraction_id2') > 0) menuList.showFraction2Menu();
});

mp.keys.bind(0x35, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && user.get('phone_code') > 0) menuList.showPlayerPhoneMenu();
  else if(!(user.get('phone_code') > 0)) return user.notify("~r~У вас нет телефона. Купите его в магазине")
});

mp.keys.bind(0x36, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && user.get('is_buy_walkietalkie'))
    menuList.showPlayerWalkietalkieMenu();
});

mp.keys.bind(0x38, true, function() {
  if (
    gui.chatActive ||
    !user.isLogin() ||
    !user.isAdmin() ||
    gui.currentGui === 'casino'
  ) {
    return;
  }

  if (!methods.isShowInput()) menuList.showAdminMenu();
});

mp.keys.bind(0x31, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) menuList.showPlayerMenu();
});

mp.keys.bind(0x39, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;

  if (!methods.isBlockKeys()) menuList.showAnimationTypeListMenu();
});

//B
mp.keys.bind(0x42, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) user.engineVehicle();
});


//X
let seatBlock = false;
mp.keys.bind(0x58, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (seatBlock) return;
  if (!methods.isBlockKeys()) {
    if (mp.players.local.vehicle) {
      if (seatBelt) {
        seatBelt = false;
        mp.players.local.setConfigFlag(32, true);
        mp.game.ui.notifications.show('~r~Вы отстегнули ремень безопасности');
        chat.sendMeCommand('отстегнул ремень безопасности');
        ui.unbuckle()
      } else {
        seatBelt = true;
        mp.players.local.setConfigFlag(32, false);
        mp.game.ui.notifications.show('~g~Вы пристегнули ремень безопасности');
        chat.sendMeCommand('пристегнул ремень безопасности');
        ui.buckle()
      }
      seatBlock = true;
      setTimeout(() => {
        seatBlock = false;
      }, 5000)
    }
    /*else {
            user.playAnimation("random@mugging3", "handsup_standing_base", 49);
        }*/
  }
});

//Z
/*mp.keys.bind(0x5A, true, function() {
    if (!user.isLogin())
        return;
    if (user.isAdmin())
        return;
    if (!user.isPolice())
        return;
    if (!methods.isBlockKeys() && !mp.players.local.vehicle) {
        user.playAnimation("move_m@intimidation@cop@unarmed", "idle", 49);
    }
});*/

//H
mp.keys.bind(0x48, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys() && !mp.players.local.vehicle) {
    user.playAnimation('gestures@m@standing@casual', 'gesture_hello', 48);
  }
});

//M
mp.keys.bind(0x4d, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) menuList.showMainMenu();
});

//F2
mp.keys.bind(0x71, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (gui.currentGui != null) return;
  if (!methods.isBlockKeys()) menuList.showHelpMenu();
});

//F3
mp.keys.bind(0x72, false, () => {
  if (gui.chatActive) return;
  if (!user.isLogin()) mp.gui.cursor.show(true, true);
});

//F9
mp.keys.bind(0x78, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (!methods.isBlockKeys()) ui.showOrHideRadar();
});

//F10
mp.keys.bind(0x79, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if(mp.game.interior.getInteriorAtCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z) == 275201) return;
  if (methods.isBlockKeys()) return;
  if(mp.players.local.isReloading()) return;
  user.stopAllAnimation();
});

// ~ Key Code
mp.keys.bind(0xc0, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (phone.ingameBrowser) return;
  if (!methods.isBlockKeys()) menuList.showInvMenu();
});

// I Key Code
mp.keys.bind(0x49, true, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if (phone.ingameBrowser) return;
  if (!methods.isBlockKeys()) menuList.showInvMenu();
});



/*
 *
 *       RENDER UI BLOCK - PLAYER IDS
 *
 */

let showIds = true;

// mp.keys.bind(105, true, function() {
//   if (gui.chatActive) return;
//   showIds = true;
// });
// mp.keys.bind(105, false, function() {
//   if (gui.chatActive) return;
//   showIds = false;
// });

// mp.keys.bind(116, true, function() {
//   if (gui.chatActive) return;
//   showIds = true;
// });
// mp.keys.bind(116, false, function() {
//   if (gui.chatActive) return;
//   showIds = false;
// });

mp.events.add('client:showId', () => {
  showIds = !showIds;
  if (showIds) mp.game.ui.notifications.show('Вы ~g~включили~s~ ID игроков');
  else mp.game.ui.notifications.show('Вы ~r~отключили~s~ ID игроков');
});


/*
 *
 *       RENDER UI BLOCK
 *
 */

let money = '$0';
let moneyBank = '$0';

let timerId = setTimeout(function updateMoney() {
  if (user.isLogin()) {
    money = '$' + methods.numberFormat(parseInt(user.get('money')));
    moneyBank = '$' + methods.numberFormat(parseInt(user.get('money_bank')));

    //TODO need test (Установка максимальной скорости авто)
    //if (mp.players.local.isSittingInAnyVehicle())
    //    mp.players.local.vehicle.setMaxSpeed(300 / 2.23693629);

    ui.updateZoneAndStreet();
  }
  timerId = setTimeout(updateMoney, 200);
}, 200);



mp.events.add('client:clearGrabMoney', () => {
  let grabMoney = user.getGrabMoney();
  if (grabMoney > 0) {
    user.addCashMoney(grabMoney);
    user.setGrabMoney(0);
    mp.game.ui.notifications.show('~g~Вы отмыли: ~s~$' + methods.numberFormat(grabMoney));
  } else {
    mp.game.ui.notifications.show('~r~У Вас нет денег для того, чтобы их отмыть');
  }
});

let mafiaWarTimeout: any = null;
mp.events.add('client:mafiaWar:sendInfo', (lme, rm, trd, lcn, timerCounter) => {
  if (mafiaWarTimeout) {
    clearTimeout(mafiaWarTimeout);
    mafiaWarTimeout = null;
  }

  try {
    ui.showMafiaInfo();
    ui.updateMafiaInfo(lme, rm, trd, lcn, timerCounter);
    mafiaWarTimeout = setTimeout(function() {
      ui.hideMafiaInfo();
    }, 3000);
  } catch (e) {
    mp.console.logError(e);
    ui.hideMafiaInfo();
  }
});

let isZone = false;
let gangWarTimeout: any = null;
mp.events.add('client:gangWar:sendInfo', (atC, defC, x, y, z, timerCounter) => {
  if (gangWarTimeout) {
    clearTimeout(gangWarTimeout);
    gangWarTimeout = null;
  }

  try {
    const local = mp.players.local;
    let street = mp.game.pathfind.getStreetNameAtCoord(
      local.position.x,
      local.position.y,
      local.position.z,
      0,
      0
    ).streetName;
    let zone = mp.game.zone.getNameOfZone(local.position.x, local.position.y, local.position.z);

    let street2 = mp.game.pathfind.getStreetNameAtCoord(x, y, z, 0, 0).streetName;
    let zone2 = mp.game.zone.getNameOfZone(x, y, z);

    if (street2 == street && zone2 == zone) {
      if (!isZone) user.setData('isGangZone', true);
      isZone = true;
      ui.showGangInfo();
      ui.updateGangInfo(atC, defC, timerCounter);
      gangWarTimeout = setTimeout(function() {
        ui.hideGangInfo();
        user.resetData('isGangZone');
        isZone = false;
      }, 3000);
    } else {
      if (isZone) user.resetData('isGangZone');
      isZone = false;
      ui.hideGangInfo();
    }
  } catch (e) {
    mp.console.logError(e);
    ui.hideGangInfo();
  }
});

// Inventory events //

mp.events.add('client:inv:updateItems', (ownerId, ownerType) => {
  ownerId = methods.parseInt(ownerId);
  ownerType = methods.parseInt(ownerType);

  if (ownerType == 0) {
    if (!mp.players.local.isSittingInAnyVehicle()) {
      inventory.getItemListInRadius(mp.players.local.position);
    } else {
      mp.game.ui.notifications.show(`~r~Вы находитесь в транспорте`);
    }
  } else if (ownerType == 8)
    menuList.showInvVehBagMenu(methods.getNearestVehicleWithCoords(mp.players.local.position, 5.0));
  else if (ownerType == 1 && ownerId == 0)
    inventory.getItemList(1, user.get('id'));
  else inventory.getItemList(ownerType, ownerId);
});

mp.events.add('client:inv:hide', () => {
  inventory.hide();
});

mp.events.add(
  'client:inv:doItem',
  async (doName, ownerId, ownerType, id, itemId, number, prefix, countItems, keyId) => {
    if (user.isDead()) {
      mp.game.ui.notifications.show(`~r~Вы мертвы`);
      return;
    }

    ownerId = methods.parseInt(ownerId);
    ownerType = methods.parseInt(ownerType);
    id = methods.parseInt(id);
    itemId = methods.parseInt(itemId);
    number = methods.parseInt(number);
    prefix = methods.parseInt(prefix);
    countItems = methods.parseInt(countItems);
    keyId = methods.parseInt(keyId);

    if (doName === 'useEquipItemButton') {
      inventory.useItem(id, itemId);
    } else if (doName === 'equipItemButton') {
      inventory.equipItem(id, itemId, prefix, number, keyId, countItems);
    } else if (doName === 'takeOneGrammPlayerItemButton') {
      inventory.takeDrugItem(id, itemId, countItems);
    } else if (doName === 'takeOneItemPlayerItemButton') {
      inventory.takeCountItem(id, itemId, countItems);
    } else if (doName === 'takeTenGrammPlayerItemButton') {
      inventory.takeDrugItem(id, itemId, countItems, true, 10);
    } else if (doName === 'takeFiftyGrammPlayerItemButton') {
      inventory.takeDrugItem(id, itemId, countItems, true, 50);
    } else if (doName === 'weighPlayerItemButton') {
      chat.sendMeCommand('взвесил');
      mp.game.ui.notifications.show(`~g~В пачке ${countItems}гр.`);
    } else if (doName === 'countPlayerItemButton') {
      chat.sendMeCommand('считает');
      mp.game.ui.notifications.show(`~g~В пачке ${countItems}шт.`);
    } else if (doName === 'upNearest10') {
      mp.events.callRemote('upNearest10', false)
    } else if (doName === 'upNearest100') {
      mp.events.callRemote('upNearest100', false)
    } else if (doName === 'upNearestPay10') {
      mp.events.callRemote('upNearest10', true)
    } else if (doName === 'upNearestPay100') {
      mp.events.callRemote('upNearest100', true)
    } else if (doName === 'healNearest') {
      mp.events.callRemote('healNearest', false)
    } else if (doName === 'healNearestPay') {
      mp.events.callRemote('healNearest', true)
    } else if (doName === 'bankcardreward') {
      mp.events.callRemote('bankcardreward', id)
    } else if (doName === 'usePlayerItemButton') {
      if(itemId == 279){
        mp.events.callRemote("skate");
      } else {
        inventory.useItem(id, itemId);
      }
    } else if (doName === 'countMoneyPlayerItemButton') {
      chat.sendMeCommand('считает наличку');
      mp.game.ui.notifications.show(`~g~В пачке $${methods.numberFormat(countItems)}`);
    } else if (doName === 'countBulletsPlayerItemButton') {
      chat.sendMeCommand('считает патроны');
      mp.game.ui.notifications.show(`~g~В коробке ${methods.numberFormat(countItems)}пт.`);
    } else if (doName === 'transferToSapdStockPlayerItemButton') {
      // !todo commented
      //inventory.dropItemToStockGang(id, itemId, user.isSapd()); // Заглушечка(разобраться как работает)
    } else if (doName === 'transferToFridgePlayerItemButton') {
      inventory.dropItemToFridge(id, itemId, mp.players.local.dimension);
    } else if (doName === 'transferToStockGosItemButton') {
      let money = 0;
      if (itemId == 88) money = 10000;
      if (itemId == 95) money = 20000;
      if (itemId == 100) money = 20000;
      if (itemId >= 171 && itemId <= 180) money = 50;
      if (itemId >= 154 && itemId <= 157) money = 50;
      if (itemId == 262) money = 50;

      if (money > 0) {
        user.addMoney(money);
        mp.game.ui.notifications.show(`~g~Вы получили премию: $${money}`);
      }
      inventory.deleteItemServer(id);
    } else if (doName === 'skate') {
      mp.events.callRemote("skate");
    } else if (doName === 'throwToGroundPlayerItemButton') {
      let hash = items.getItemHashById(itemId);
      //TODO ON GROUND
      //let plPos = mp.players.local.position;
      //let z = mp.game.gameplay.getGroundZFor3dCoord(plPos.x, plPos.y, 999, 999, false);
      //inventory.dropItem(id, itemId, new mp.Vector3(plPos.x, plPos.y, z), new mp.Vector3(0.0, 0.0, 0.0), hash, inventory.types.World, 0);

      if (methods.isPlayerInOcean()) {
        inventory.deleteItemServer(id);
        mp.game.ui.notifications.show(`~g~Предмет был выброшен в океан`);
        return;
      }

      inventory.dropItem(
        id,
        itemId,
        mp.players.local.position,
        new mp.Vector3(0.0, 0.0, 0.0),
        hash,
        inventory.types.World,
        0
      );
    } else if (doName === 'takeItemButton') {
      inventory.takeItem(id, itemId, ownerType);
    } else if (doName == 'infoLotoItemButton') {
      mp.game.ui.notifications.show(`~g~Номер билета: ~s~${number}`);
      mp.game.ui.notifications.show(`~g~Розыгрыш: ~s~$${methods.numberFormat(prefix)}`);
      if (keyId == 1) mp.game.ui.notifications.show(`~g~Статус: ~s~Победитель`);
      else if (keyId == 0) mp.game.ui.notifications.show(`~g~Статус: ~s~Ожидание розыгрыша`);
      else if (keyId == -1) mp.game.ui.notifications.show(`~g~Статус: ~s~Проигрыш`);
    }

    if (doName != 'transferPlayerItemButton' && doName != 'transferToStockPlayerItemButton') {
      setTimeout(function() {
        if (inventory.isHide()) return;

        if (ownerType == 0) inventory.getItemListInRadius(mp.players.local.position);
        else if (ownerType == 8)
          menuList.showInvVehBagMenu(
            methods.getNearestVehicleWithCoords(mp.players.local.position, 5.0)
          );
        else inventory.getItemList(ownerType, ownerId);
      }, 1000);
    }
  }
);

mp.events.add('client:inv:openPhone', () => {
  inventory.hide();
  menuList.showPlayerPhoneMenu();
});

mp.events.add('client:inv:doItemUnEquip', (itemId) => {
  if (user.isDead()) {
    mp.game.ui.notifications.show(`~r~Вы мертвы`);
    return;
  }
  if (items.isWeapon(itemId)) return mp.events.callRemote('inventory:unequipgun', itemId)

  inventory.unEquipItem(methods.parseInt(itemId));

});

// Phone events //

/*
mp.events.add('client:phone:hidePhone', () => {
    let data = {
        type : 'hidePhone'
    }
    phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});*/

mp.events.add('client:phone:contInfo', (id) => {
  methods.debug('Execute: client:phone:contInfo ' + id);
  phone.contInfo(id);
});

mp.events.add('client:phone:smsInfo', (id) => {
  phone.smsInfo(id);
});

mp.events.add('client:phone:newSms', () => {
  phone.newSms();
});

mp.events.add('client:phone:newCont', () => {
  phone.newCont();
});

mp.events.add('client:phone:newSmsWithNum', (number) => {
  phone.newSmsWithNumber(number);
});

mp.events.add('client:phone:callwithnum', (number) => {
  if(mp.players.local.getVariable('call')) return;
  phone.callWithNumber(number);
});


mp.events.add('client:phone:cancelCall', () => {
  if(!mp.players.local.getVariable('call')) return;
  phone.cancelCall();
});

mp.events.add('client:phone:readSms', (text) => {
  phone.readSms(text);
});

mp.events.add('client:phone:delSms', (id) => {
  phone.delSms(id);
});

mp.events.add('client:phone:delCont', (id) => {
  phone.delCont(id);
});

mp.events.add('client:phone:renCont', (id) => {
  phone.renCont(id);
});

mp.events.add('client:phone:showSmsList', () => {
  phone.showSmsList();
});

mp.events.add('client:phone:showContList', () => {
  phone.showContList();
});

mp.events.add('client:phone:enableRadio', () => {
  phone.enableRadio();
});

mp.events.add('client:phone:disableRadio', () => {
  phone.disableRadio();
});

/*mp.events.add('client:phone:addConsoleMessage', (message) => {
    phone.addConsoleMessage(message);
});*/

mp.events.add('client:phone:arcadiusMenu', () => {
  phone.arcadiusMenu();
});

mp.events.add('client:phone:misterk1', () => {
  phone.misterk1();
});

mp.events.add('client:phone:misterk2', () => {
  phone.misterk2();
});

mp.events.add('client:phone:9111', () => {
  phone.call911(1);
});

mp.events.add('client:phone:9112', () => {
  phone.call911(2);
});

mp.events.add('client:phone:9113', () => {
  phone.call911(3);
});

mp.events.add('client:phone:getTaxi', (type) => {
  phone.getTaxi(type);
});

mp.events.add('client:phone:getTaxi2', (type) => {
  phone.getTaxi(type);
});

mp.events.add('client:phone:invaderLoto', () => {
  phone.invaderLoto();
});

mp.events.add('client:phone:invaderAd', (dix) => {
  phone.invaderAd(dix);
});

mp.events.add('client:phone:setWaypoint', (x, y) => {
  user.setWaypoint(x, y);
});

mp.events.add('client:phone:bankMenu', () => {
  phone.showBankMenu();
});

mp.events.add('client:phone:transferBank', () => {
  phone.transferBank();
});

mp.events.add('client:phone:payTaxByNumber', async () => {
  let number = methods.parseInt(await UIMenu.Menu.GetUserInput('Счёт', '', 10));
  if (number == 0) return;
  let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
  if (sum == 0) return;
  mp.events.callRemote('server:tax:payTax', 1, number, sum);
});

mp.events.add('client:phone:addNewSms', (numberFrom, text) => {
  phone.addNewSms(numberFrom, text);
});

mp.events.add('client:phone:sendToPlayerSmsListMenu', (data, number) => {
  menuList.showPlayerPhoneSmsMenu(data, number);
});

mp.events.add(
  'client:phone:sendToPlayerSmsInfoMenu',
  (id, numberFrom, numberTo, text, dateTime) => {
    menuList.showPlayerPhoneSmsInfoMenu(id, numberFrom, numberTo, text, dateTime);
  }
);

mp.events.add('client:phone:sendToPlayerContactListMenu', (data) => {
  menuList.showPlayerPhoneBookMenu(data);
});

mp.events.add('client:phone:sendToPlayerContInfoMenu', (id, title, number) => {
  menuList.showPlayerPhoneContInfoMenu(id, title, number);
});

mp.events.add('client:phone:show', function() {
  /*SendNUIMessage({
    type = 'showPhone'
  })*/
  let data = {
    type: 'showPhone',
  };
  phone.phoneShowSet(true)
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:hide', function() {
  /*SendNUIMessage({
    type = 'hidePhone'
  })*/
  let data = {
    type: 'hidePhone',
  };
  phone.phoneShowSet(false)
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:addSmsList', function(list) {
  /*SendNUIMessage({
    type = 'addSmsList',
    list = list
  })*/
  let data = {
    type: 'addSmsList',
    list: list,
  };
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:addContList', function(list) {
  /*SendNUIMessage({
    type = 'addContList',
    list = list
  })*/
  let data = {
    type: 'addContList',
    list: list,
  };
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:showSmsItem', function(item) {
  /*SendNUIMessage({
    type = 'showSmsItem',
    item = item
  })*/
  let data = {
    type: 'showSmsItem',
    item: item,
  };
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:showContItem', function(item) {
  /*SendNUIMessage({
    type = 'showContItem',
    item = item
  })*/
  let data = {
    type: 'showContItem',
    item: item,
  };
  methods.debug('Execute: client:phone:showContItem');
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:addConsoleMessage', function(msg) {
  /*SendNUIMessage({
    type = 'addConsoleMessageEvent',
    msg = msg
  })*/
  let data = {
    type: 'addConsoleMessageEvent',
    msg: msg,
  };
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:debug', function(msg) {
  methods.debug(msg);
});

mp.events.add('client:phone:updateValues', function(
  udayName,
  udate,
  utime,
  utemp,
  ucode,
  ubprefix,
  unetwork
) {
  /*
  SendNUIMessage({
    type = 'updateValues',
    dayname = udayName,
    date = udate,
    time = utime,
    temp = utemp,
    code = ucode,
    bprefix = ubprefix,
    network = unetwork
  })*/
  let data = {
    type: 'updateValues',
    dayname: udayName,
    date: weather.getMonthYearDate(),
    time: utime,
    temp: utemp,
    code: ucode,
    bprefix: ubprefix,
    network: unetwork,
  };
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:showBankMenu', function(money, number) {
  /*SendNUIMessage({
    type = 'showBankMenu',
    money = money,
    number = number
  })*/
  let data = {
    type: 'showBankMenu',
    money: money,
    number: number,
  };
  phone.browser.execute(`eventSend(${JSON.stringify(data)});`);
});

mp.events.add('client:phone:showBrowser', function() {
  phone.showBrowser();
});

mp.events.add('client:taskRemoveMask', function() {
  if (user.get('mask') > 0) inventory.unEquipItem(274);
});

mp.events.add('playerRuleTriggered', (rule, counter) => {
  if (rule === 'ping' && counter > 5) {
    user.kick('Ваш пинг слишком большой');
  }
});

//UI MENU
mp.events.add('client:uimenu:hide', () => {
  ui.hideMenu();
});

mp.events.add('client:uimenu:trigger', async (action) => {
  if (action == 'donate') {
    // user.clearChat();
    mp.gui.chat.push(`!{03A9F4}Донат`);
    mp.gui.chat.push(
      `О всех услугах доната вы можете узнать в личном кабинете на сайте !{ef9a9a}gta-5.ru`
    );
  } else if (action == 'settings') {
    menuList.showSettingsMenu();
  } else if (action == 'gps') {
    menuList.showGpsMenu();
  } else if (action == 'faq') {
    phone.showFaqBrowser();
  } else if (action == 'lockV') {
    if (!methods.isBlockKeys()) mp.events.callRemote('onKeyPress:L');
  } else if (action == 'ask') {
    let text = await UIMenu.Menu.GetUserInput('Задайте вопрос', '', 300);
    if (text != '') mp.events.callRemote('server:sendAsk', text);
  } else if (action == 'report') {
    let text = await UIMenu.Menu.GetUserInput('Опишите жалобу', '', 300);
    if (text != '') mp.events.callRemote('server:sendReport', text);
  } else if (action == 'uncuff') {
    mp.events.callRemote('server:unCuffNearst');
  } else if (action == 'cuff') {
    if (user.get('jail_time') > 0 || user.get('med_time') > 0) {
      mp.game.ui.notifications.show('~r~Данное действие сейчас запрещено');
      return;
    }
    mp.events.callRemote('server:cuffNearst');
    if (user.get('jail_time') > 0 || user.get('med_time') > 0) {
      mp.game.ui.notifications.show('~r~Данное действие сейчас запрещено');
      return;
    }
  } else if (action == 'inCar') {
    mp.events.callRemote('server:inCarNearst');
  } else if (action == 'outCar') {
    mp.events.callRemote('server:removeFromCar');
  } else if (action == 'takeGun') {
    if (user.get('jail_time') > 0 || user.get('med_time') > 0) {
      mp.game.ui.notifications.show('~r~Данное действие сейчас запрещено');
      return;
    }
    mp.events.callRemote('server:removeAllWeaponsNearst');
  } else if (action == 'takeMask') {
    if (user.get('jail_time') > 0 || user.get('med_time') > 0) {
      mp.game.ui.notifications.show('~r~Данное действие сейчас запрещено');
      return;
    }
    mp.events.callRemote('server:taskRemoveMask');
  } else if (action == 'followUs') {
    if (user.get('jail_time') > 0 || user.get('med_time') > 0) {
      mp.game.ui.notifications.show('~r~Данное действие сейчас запрещено');
      return;
    }
    mp.events.callRemote('server:taskFollow');
  } else if (action == 'leftIndicator') {
    if (mp.players.local.vehicle) {
      let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');
      vehicles.setIndicatorLeftState(!actualData.IndicatorLeftToggle);
      vehicles.setIndicatorRightState(false);
    } else {
      mp.game.ui.notifications.show('~r~Вы должны находиться в транспорте');
    }
  } else if (action == 'rightIndicator') {
    if (mp.players.local.vehicle) {
      let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');
      vehicles.setIndicatorRightState(!actualData.IndicatorRightToggle);
      vehicles.setIndicatorLeftState(false);
    } else {
      mp.game.ui.notifications.show('~r~Вы должны находиться в транспорте');
    }
  } else if (action == 'twoIndicator') {
    if (mp.players.local.vehicle) {
      let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');
      let enable = !actualData.IndicatorRightToggle && !actualData.IndicatorLeftToggle;
      vehicles.setIndicatorLeftState(enable);
      vehicles.setIndicatorRightState(enable);
    } else {
      mp.game.ui.notifications.show('~r~Вы должны находиться в транспорте');
    }
  } else if (action == 'giveMoney' || action == 'friend') {
    let list: { id: string; title: string }[] = [];

    mp.players.forEachInRange(mp.players.local.position, 2, (nplayer) => {
      if (mp.players.local !== nplayer) {
        if (list.length > 7) return;
        let nid = nplayer.getVariable('id');
        list.push({ id: `${action}_${nplayer.remoteId}`, title: `ID ${user.getShowingIdString(nplayer)}` });
      }
    });

    if (list.length == 0) mp.game.ui.notifications.show('~r~Рядом с вами никого нет');

    ui.showMenuIds(list);
  } else if (action == 'showGosDoc' || action == 'showCardId' || action == 'showLic') {
    if (!user.isGos() && action == 'showGosDoc') {
      mp.game.ui.notifications.show('~r~Вы не состоите в гос. организации');
      return;
    }

    let list: { id: string; title: string }[] = [];

    mp.players.forEachInRange(mp.players.local.position, 2, (nplayer) => {
      if (list.length > 7) return;
      let nid = nplayer.getVariable('id');
      list.push({ id: `${action}_${nplayer.remoteId}`, title: `ID ${user.getShowingIdString(nplayer)}` });
    });

    if (list.length == 0) mp.game.ui.notifications.show('~r~Рядом с вами никого нет');

    ui.showMenuIds(list);
  } else if (action == 'animDoPlayer') {
    let list: { id: string; title: string }[] = [];

    mp.players.forEachInRange(mp.players.local.position, 2, (nplayer) => {
      if (mp.players.local !== nplayer) {
        if (list.length > 7) return;
        let nid = nplayer.getVariable('id');
        list.push({ id: `${action}_${nid}`, title: `ID ${user.getShowingIdString(nplayer)}` });
      }
    });

    if (list.length == 0) mp.game.ui.notifications.show('~r~Рядом с вами никого нет');

    ui.showMenuIds(list);
  } else if (action == 'animStop') {
    user.stopAllAnimation();
  } else if (action == 'animAll') {
    menuList.showAnimationTypeListMenu();
  } else if (action == 'animDance1') {
    user.playAnimation('misschinese2_crystalmazemcs1_ig', 'dance_loop_tao', 9);
  } else if (action == 'animDance2') {
    user.playAnimation('mini@strip_club@lap_dance_2g@ld_2g_p2', 'ld_2g_p2_s1', 9);
  } else if (action == 'animDance3') {
    user.playAnimation('mini@strip_club@lap_dance_2g@ld_2g_p3', 'ld_2g_p3_s2', 9);
  } else if (action == 'animDance4') {
    user.playAnimation('amb@world_human_partying@female@partying_beer@idle_a', 'idle_b', 9);
  } else if (action == 'animDance5') {
    user.playAnimation('amb@world_human_prostitute@cokehead@idle_a', 'idle_a', 9);
  } else if (action == 'animDance6') {
    user.playAnimation('amb@world_human_prostitute@cokehead@idle_a', 'idle_c', 9);
  } else if (action == 'animDance7') {
    user.playAnimation('amb@world_human_jog_standing@female@base', 'base', 9);
  } else if (action == 'animDance8') {
    user.playAnimation('timetable@tracy@ig_8@idle_a', 'idle_a', 9);
  } else if (action == 'animEmoji1') {
    user.playAnimation('missmic_4premiere', 'movie_prem_01_f_a', 8);
  } else if (action == 'animEmoji2') {
    user.playAnimation('amb@world_human_cheering@female_a', 'base', 8);
  } else if (action == 'animEmoji3') {
    user.playAnimation('anim@mp_player_intcelebrationfemale@bro_love', 'bro_love', 8);
  } else if (action == 'animEmoji4') {
    user.playAnimation('mini@dartsoutro', 'darts_outro_03_guy1', 8);
  } else if (action == 'animEmoji5') {
    user.playAnimation('anim@mp_player_intcelebrationfemale@you_loco', 'you_loco', 8);
  } else if (action == 'animPose1') {
    user.playAnimation('missmic4premiere', 'wave_b', 8);
  } else if (action == 'animPose2') {
    user.playAnimation('amb@code_human_police_investigate@base', 'base', 9);
  } else if (action == 'animPose3') {
    user.playAnimation('missfbi4mcs_2', 'loop_sec_b', 9);
  } else if (action == 'animPose4') {
    user.playAnimation('amb@world_human_muscle_flex@arms_at_side@idle_a', 'idle_a', 8);
  } else if (action == 'animPose5') {
    user.playAnimation('amb@world_human_bum_slumped@male@laying_on_right_side@base', 'base', 9);
  } else if (action == 'animDo1') {
    user.playAnimation('random@mugging3', 'handsup_standing_base', 49);
  } else if (action == 'animDo2') {
    user.playAnimation('anim@mp_player_intincarsalutestd@ds@', 'idle_a', 49);
  } else if (action == 'animDo3') {
    user.playAnimation('gestures@m@standing@casual', 'gesture_i_will', 8);
  } else if (action == 'animDo4') {
    user.playAnimation('gestures@m@standing@casual', 'gesture_nod_no_hard', 8);
  } else if (action == 'animDo5') {
    user.playAnimation('move_m@intimidation@cop@unarmed', 'idle', 49);
  } else {
    action = action.split('_');
    if (action.length > 1) {
      let id = methods.parseInt(action[1]);
      let act = action[0];

      if (act == 'giveMoney') {
        let money = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
        if (money < 1) {
          mp.game.ui.notifications.show('~r~Нельзя передавать меньше 1$');
          return;
        }
        mp.events.callRemote('server:user:giveMoneyToPlayerId', id, money);
      } else if (act == 'friend') {
        let name = '';
        if (methods.storage.get('dating_nick') == '') {
          let rpName = methods.storage.get('dating_nick');
          name = await UIMenu.Menu.GetUserInput('Как вы себя представите?', rpName, 30);
        } else {
          let rpName = user.get('rp_name').split(' ');
          name = await UIMenu.Menu.GetUserInput('Как вы себя представите?', rpName[0], 30);
        }
        if (name == '') return;
        name = name.replace(/[^a-zA-Z\s]/gi, '');
        if (name == '' || name == ' ') {
          mp.game.ui.notifications.show('~r~Доступны только английские буквы');
          return;
        }
        methods.storage.set('dating_nick', name);
        mp.events.callRemote('server:user:askDatingToPlayerId', id, name);
      } else if (act == 'showGosDoc' || act == 'showCardId' || act == 'showLic') {
        chat.sendMeCommand('показал документы');
        mp.events.callSocket('server:user:' + act, id);
      } else if (act == 'animDoPlayer1') {
        user.playAnimationWithUser(id, 0);
      } else if (act == 'animDoPlayer2') {
        user.playAnimationWithUser(id, 2);
      } else if (act == 'animDoPlayer3') {
        user.playAnimationWithUser(id, 1);
      } else if (act == 'animDoPlayer4') {
        user.playAnimationWithUser(id, 3);
      }
    }
  }
  mp.console.logInfo(action);
});

// Task Follow
let taskFollowed: PlayerMp = null;
let timerFollowedId: any = null;

setInterval(() => {
  if(taskFollowed){
    if(!user.isCuff() || user.isDead()){
      user.stopAllAnimation();
      taskFollowed = null;
      clearInterval(timerFollowedId);
    }
  }
}, 1000);

mp.events.add('client:taskFollowStop', (nplayer) => {
  user.stopAllAnimation();
  if(nplayer) mp.game.ui.notifications.show('~g~Вас отпустили');
  if(nplayer) mp.events.callRemote(
    'server:nplayer:notify',
    nplayer,
    `~g~Вы отпустили человека (ID: ${user.get('id')})`
  );
  taskFollowed = null;
  clearInterval(timerFollowedId);
  mp.players.local.clearTasks();
  mp.events.callRemote('server:stopAllAnimation');
  if (user.isCuff()) user.playAnimation('mp_arresting', 'idle', 49);
  else _playerDisableDefaultControls = false;

});

mp.events.add('client:taskFollow', (nplayer:PlayerMp) => {
  if (!mp.players.exists(nplayer)) return;
  if (!taskFollowed) {
    _playerDisableDefaultControls = true;
    if (user.isCuff()) user.playAnimation('mp_arresting', 'idle', 49);
    mp.game.invoke(
      methods.TASK_GO_TO_ENTITY,
      mp.players.local.handle,
      nplayer.handle,
      -1,
      10.0,
      1073741824.0,
      0
    );
    mp.game.invoke(methods.SET_PED_KEEP_TASK, mp.players.local.handle, true);
    mp.game.ui.notifications.show('~r~Человек повел вас за собой');
    mp.events.callRemote(
      'server:nplayer:notify',
      nplayer,
      `~g~Вы повели человека за собой`
    );
    taskFollowed = nplayer;
    timerFollowedId = setInterval(function() {
      if (mp.players.local.dimension != taskFollowed.dimension) {
        mp.players.local.clearTasks();
        mp.events.callRemote('server:stopAllAnimation');
        mp.game.ui.notifications.show('~g~Вас отпустили');
        mp.events.callRemote(
          'server:nplayer:notify',
          nplayer,
          `~g~Вы отпустили человека`
        );
        taskFollowed = null;
        clearInterval(timerFollowedId);
        if (user.isCuff()) user.playAnimation('mp_arresting', 'idle', 49);
      }
      if (
        taskFollowed &&
        methods.distanceToPos(mp.players.local.position, taskFollowed.position) > 50.0
      ) {
        user.teleport(taskFollowed.position.x, taskFollowed.position.y, taskFollowed.position.z);
        if (user.isCuff()) user.playAnimation('mp_arresting', 'idle', 49);
      }
      /*if (taskFollowed.getVehicleIsIn() && mp.players.local.vehicle !== taskFollowed.getVehicleIsIn()) {
                mp.console.logInfo(taskFollowed.vehicle, taskFollowed.getVehicleIsIn(), taskFollowed.position);
                mp.players.local.taskEnterVehicle(taskFollowed.getVehicleIsIn(), 0, 0, 1.0, 1, 0);
            }
            if (!taskFollowed.vehicle && mp.players.local.vehicle) {
                mp.players.local.taskLeaveAnyVehicle(1, 1);
            }*/
      if (!mp.players.local.vehicle) {
        mp.game.invoke(
          methods.TASK_GO_TO_ENTITY,
          mp.players.local.handle,
          taskFollowed.handle,
          -1,
          10.0,
          1073741824.0,
          0
        );
        mp.game.invoke(methods.SET_PED_KEEP_TASK, mp.players.local.handle, true);
      }
    }, 3000);
  } else {

    user.stopAllAnimation();
    if(nplayer) mp.game.ui.notifications.show('~g~Вас отпустили');
    if(nplayer) mp.events.callRemote(
      'server:nplayer:notify',
      nplayer,
      `~g~Вы отпустили человека (ID: ${user.get('id')})`
    );
    taskFollowed = null;
    clearInterval(timerFollowedId);
    if (user.isCuff()) user.playAnimation('mp_arresting', 'idle', 49);
    else _playerDisableDefaultControls = false;
  }
});

// mp.keys.bind(0x45, true, () => {
//   if (gui.chatActive) return;
//   if (!user.isLogin()) return;
//   if(mp.gui.cursor.visible) return;
//   if (!methods.isBlockKeys()) {
//     methods.pressEToPayRespect();
//     mp.events.callRemote('keypress:E');
//   }
// });


setTimeout(() => {
  mp.events.register("admin:debug:interrior", () => {
    return mp.game.interior.getInteriorAtCoords(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);
  })
}, 5000)


mp.events.add('entityStreamIn', (player:PlayerMp) => {
  if(player.type != "player") return;
  if(mp.players.local == player) return;
  if(player.isActiveInScenario() && !player.getVariable('use_scenario')){
    player.clearTasksImmediately();
  } else if(!player.isActiveInScenario() && player.getVariable('use_scenario')) {
    const [name, x, y, z, h, teleport] = JSON.parse(player.getVariable('use_scenario'));
    mp.events.call('client:syncScenario', player.remoteId, name, x, y, z, h, teleport);
  }
});

setInterval(() => {
  mp.players.forEachInStreamRange((player) => {
    if(mp.players.local == player) return;
    if(player.isActiveInScenario() && !player.getVariable('use_scenario')){
      player.clearTasksImmediately();
    } else if(!player.isActiveInScenario() && player.getVariable('use_scenario')) {
      const [name, x, y, z, h, teleport] = JSON.parse(player.getVariable('use_scenario'));
      mp.events.call('client:syncScenario', player.remoteId, name, x, y, z, h, teleport);
    }
  })
}, 2000)
