import { Container } from './data';
import { enums } from '../enums';
import { builder } from '../jobs/builder';
import { cleaner } from '../jobs/cleaner';
import { timer } from './timer';
import { menuList } from '../menuList';
import Menu from './menu';
import { user } from '../user';
import { roadWorker } from '../jobs/roadWorker';
import { mainer } from '../jobs/mainer';
import { inventory } from '../inventory';

import { gui } from './gui';
import { levelAccess } from '../../util/level';
import { fractionUtil } from '../../util/fractions';
import { getCompanyName } from '../../util/company.names';
import { vehicleInfoCarConf } from '../../util/vehicles';
let testServer = false;
mp.events.add("server:test", () => {
  testServer = true;
})

const streamedPlayers: Set<PlayerMp> = new Set();
mp.events.add({
  entityStreamIn: (entity) => {
    if (entity.type === 'player') {
      streamedPlayers.add(entity);
    }
  },
  entityStreamOut: (entity) => {
    if (entity.type === 'player') {
      streamedPlayers.delete(entity);
    }
  },
});


const meriaDoorsPos = new mp.Vector3(-544.89, -204.41, 38.21);
let checkedDoors = false;
setInterval(() => {
  if(checkedDoors) return;
  const dist = methods.distanceToPos(mp.players.local.position, meriaDoorsPos) < 6;
  if(dist){
    checkedDoors = true;
    if(!mp.game.object.getClosestObjectOfType(meriaDoorsPos.x, meriaDoorsPos.y, meriaDoorsPos.z, 10, mp.game.joaat('maindoor'), false, false, false)){
      user.notify('~r~У вас не загружен интерьер здания мерии. Вам необходимо полностью перезайти в игру');
    }
  }
}, 3000);


let gangZoneList: { x: number, y: number, z: number, id: number }[] = [];

let methods = {
  getTimeStamp: function () {
    return Date.now() / 1000 | 0;
  },
  getTimeStampMS: function () {
    return Date.now() | 0;
  },
  unixTimeStampToDateTime: function (timestamp: number) {
    let dateTime = new Date(timestamp * 1000);
    return `${methods.digitFormat(dateTime.getDate())}/${methods.digitFormat(dateTime.getMonth() + 1)}/${dateTime.getFullYear()} ${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(dateTime.getMinutes())}`
  },
  pointInBox: (point: [number, number], vs: [number, number][]) => {
    let min1: number = 99999999999999;
    let max1: number = -1111111111111;
    let min2: number = 99999999999999;
    let max2: number = -1111111111111;
    for (let id in vs) {
      let item = vs[id];
      let item1 = item[0];
      let item2 = item[1];
      if (item1 < min1) min1 = item1;
      if (item2 < min2) min2 = item2;
      if (item1 > max1) max1 = item1;
      if (item2 > max2) max2 = item2;
    }
    let point1 = point[0];
    let point2 = point[1];
    if (point1 < min1) return false;
    if (point2 < min2) return false;
    if (point1 > max1) return false;
    if (point2 > max2) return false;
    return true;
  },
  GIVE_WEAPON_TO_PED: '0xBF0FD6E56C964FCB',
  REMOVE_WEAPON_FROM_PED: '0x4899CB088EDF59B8',
  HAS_PED_GOT_WEAPON: '0x8DECB02F88F428BC',
  GET_AMMO_IN_PED_WEAPON: '0x015A522136D7F951',
  GET_PED_AMMO_TYPE_FROM_WEAPON: '0x7FEAD38B326B9F74',
  ADD_AMMO_TO_PED: '0x78F0424C34306220',
  SET_PED_AMMO: '0x14E56BC5B5DB6A19',
  IS_WAYPOINT_ACTIVE: '0x1DD1F58F493F1DA5',
  SET_ENABLE_HANDCUFFS: '0xDF1AF8B5D56542FA',
  TASK_GO_TO_ENTITY: '0x6A071245EB0D1882',
  SET_PED_KEEP_TASK: '0x971D38760FBC02EF',
  TASK_ENTER_VEHICLE: '0xC20E50AA46D09CA8',
  FREEZE_ENTITY_POSITION: '0x428CA6DBD1094446',
  SET_INTERIOR_PROP_COLOR: '0xC1F1920BAF281317',
  DISABLE_VEHICLE_IMPACT_EXPLOSION_ACTIVATION: '0xD8050E0EB60CF274',
  SET_RADIO_TO_STATION_INDEX: '0xA619B168B8A8570F',
  SET_FRONTEND_RADIO_ACTIVE: '0xF7F26C6E9CC9EBB8',
  GET_PLAYER_RADIO_STATION_INDEX: '0xE8AF77C4C06ADC93',
  PLAY_SOUND_FROM_ENTITY: '0xE65F427EB70AB1ED',
  GET_SOUND_ID: '0x430386FE9BF80B45',
  STOP_ALL_SCREEN_EFFECTS: '0xB4EDDC19532BFB85',
  SET_ENTITY_COORDS_NO_OFFSET: '0x239A3351AC1DA385',
  SET_PED_CAN_BE_TARGETTED: '0x63F58F7C80513AAD',
  SET_PED_CAN_BE_TARGETTED_BY_PLAYER: '0x66B57B72E0836A76',
  SET_BLOCKING_OF_NON_TEMPORARY_EVENTS: '0x9F8AA94D6D97DBF4',
  TASK_SET_BLOCKING_OF_NON_TEMPORARY_EVENTS: '0x90D2156198831D69',
  SET_ENTITY_INVINCIBLE: '0x3882114BDE571AD4',
  SET_PED_CAN_RAGDOLL: '0xB128377056A54E2A',
  SET_PED_CAN_EVASIVE_DIVE: '0x6B7A646C242A7059',
  SET_PED_GET_OUT_UPSIDE_DOWN_VEHICLE: '0xBC0ED94165A48BC2',
  SET_PED_AS_ENEMY: '0x02A0C9720B854BFA',
  SET_CAN_ATTACK_FRIENDLY: '0xB3B1CB349FF9C75D',
  SET_PED_DEFAULT_COMPONENT_VARIATION: '0x45EEE61580806D63',
  TASK_START_SCENARIO_IN_PLACE: '0x142A02425FF02BD9',
  TASK_PLAY_ANIM: '0xEA47FE3719165B94',
  DELETE_ENTITY: '0xAE3CBE5BF394C9C9',
  DELETE_PED: '0x9614299DCB53E54B',
  PLAY_AMBIENT_SPEECH1: '0x8E04FEDD28D42462',
  SET_ENTITY_AS_NO_LONGER_NEEDED: '0xB736A491E64A32CF',
  SET_PED_AS_NO_LONGER_NEEDED: '0xB736A491E64A32CF',
  SET_MODEL_AS_NO_LONGER_NEEDED: '0xE532F5D78798DAAB',
  SET_ENTITY_AS_MISSION_ENTITY: '0xAD738C3085FE7E11',
  SET_VEHICLE_MOD: '0x6AF0636DDEDCB6DD',
  SET_VEHICLE_UNDRIVEABLE: '0x8ABA6AF54B942B95',
  GET_SELECTED_PED_WEAPON: '0x0A6DB4965674D243',
  filter: (str: string) => {
    if (!str) return str;
    if (typeof str !== "string") return str
    return str.replace(/[^-0-9A-Zа-я-[\]() ]/gim, '')
  },
  createBlip: (pos: Vector3Mp, sprite: number, color: number, scale?: number, name?: string, dimension?: number) => {
    if (scale == undefined)
      scale = 0.8;
    if (dimension == undefined)
      dimension = -1;

    return mp.blips.new(sprite, pos, {
      name,
      color,
      scale,
      shortRange: true,
      dimension,
    });

  },
  isTestServer: () => testServer,
  debug: (text: any, ...args: any) => {
    if (!testServer) return;
    let dateTime = new Date();
    let dateResult =
      methods.digitFormat(dateTime.getHours()) +
      ':' +
      methods.digitFormat(dateTime.getMinutes()) +
      ':' +
      methods.digitFormat(dateTime.getSeconds());
    mp.console.logInfo(`[DEBUG | ${dateResult}] ${text}`, ...args);
  },

  parseInt: (str: number | string) => {
    if (typeof str == "string") str = parseInt(str);
    else str = Math.floor(str);
    if (isNaN(str)) str = 0;
    return str
  },
  parseFloat: (str: number | string) => {
    if (typeof str == "string") str = parseFloat(str);
    else str = parseFloat(str.toFixed(2));
    if (isNaN(str)) str = 0;
    return str
  },

  saveLog: (name: string, log: any) => { // todo check types
    mp.events.callRemote('server:methods:saveLog', name, log);
  },

  getWaypointPosition: () => {
    let pos = new mp.Vector3(0, 0, 0);
    if (mp.game.invoke('0x1DD1F58F493F1DA5')) {
      let blipInfoIdIterator = mp.game.invoke('0x186E5D252FA50E7D');
      for (
        let index = mp.game.invoke('0x1BEDE233E6CD2A1F', blipInfoIdIterator);
        mp.game.invoke('0xA6DB27D19ECBB7DA', index);
        index = mp.game.invoke('0x14F96AA50D6FBEA7', blipInfoIdIterator)
      )
        if (mp.game.invoke('0xBE9B0959FFD0779B', index) == 4)
          pos = mp.game.ui.getBlipInfoIdCoord(index);

      pos.z += 1550;
    }
    return pos;
  },

  isBlockKeys: () => {
    return Menu.Menu.IsShowInput() || user.isCuff() || user.isTie() || user.isDead() || !inventory.isHide() || gui.currentGui === 'casino' || gui.currentGui === 'inventory' || gui.currentGui === 'tablet' || gui.currentGui === 'atm';
  },

  isShowInput: () => {
    return Menu.Menu.IsShowInput();
  },

  sleep: (ms: number = 500) => {
    return new Promise((res) => setTimeout(res, ms));
  },

  wait: (ms: number) => {
    mp.game.wait(ms);
  },
  randomStr: (len: number, arr: string = '1234567890abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXY') => {
    var ans = '';
    for (var i = len; i > 0; i--) {
      ans +=
        arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
  },
  getRandomInt: (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  distanceToPos: (v1: Vector3Mp, v2: Vector3Mp) => {
    return Math.abs(
      Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2) + Math.pow(v2.z - v1.z, 2))
    );
  },

  distanceToPos2D: (v1: Vector2, v2: Vector2) => {
    return Math.abs(Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)));
  },

  updateGangZoneList: (data: any) => {
    try {
      methods.debug('Execute: checkpoint.updateGangZoneList');
      gangZoneList = gangZoneList.concat(data);
    } catch (e) {
      methods.debug('Exception: checkpoint.updateGangZoneList');
      methods.debug(e);
      //TODO очистить выполнить еще раз
    }
  },

  getGangZoneList: () => {
    return gangZoneList;
  },

  getStreamPlayerList: () => {
    return streamedPlayers;
  },

  storage: {
    set: function (key: string, value: any) {
      mp.storage.data[key] = value;
      this.flush();
    },
    get: function (key: string) {
      if (mp.storage.data[key] != undefined) return mp.storage.data[key];
      return '';
    },
    flush: function () {
      mp.storage.flush();
    },
  },

  disableAllControls: (disable: boolean) => {
    mp.events.call('modules:client:player:DisableAllControls', disable);
  },

  disableDefaultControls: (disable: boolean) => {
    mp.events.call('modules:client:player:DisableDefaultControls', disable);
  },

  pressEToPayRespect: () => {
    if (timer.isFleecaAtm() || timer.isOtherAtm()) menuList.showAtmMenu();
    builder.checkPressE();
    cleaner.checkPressE();
    roadWorker.checkPressE();
    mainer.checkPressE();
  },

  startLoadingMessage: (text: string, timeout: number) => {
    mp.game.ui.setLoadingPromptTextEntry('STRING');
    mp.game.ui.addTextComponentSubstringPlayerName(text);
    mp.game.ui.showLoadingPrompt(4);

    setTimeout(() => {
      mp.game.invoke('0x10D373323E5B9C0D'); //stop after 15s
    }, timeout);
  },

  createStaticCheckpoint: (x: number, y: number, z: number, message: string, scale: number, dimension: number) => {
    if (scale == undefined) scale = 1;

    if (dimension == undefined) dimension = 0;

    let pos = new mp.Vector3(x, y, z);
    mp.markers.new(1, pos, scale, {
      color: [33, 150, 243, 100],
      dimension: 0,
    });

    //return mp.colshapes.newTube(x, y, z, scale + 0.4, scale + 0.6);
    let checkpoint = mp.checkpoints.new(1, pos, scale, {
      direction: new mp.Vector3(0, 0, 1.5),
      color: [33, 150, 243, 0],
      visible: true,
      dimension: 0,
    });
    if (message != undefined) Container.Set(999999, 'checkpointLabel' + checkpoint.id, message);
    return checkpoint;
  },

  arrayRemove: (arr: any[], value: any) => {
    return arr.filter(function (ele) {
      return ele != value;
    });
  },

  notifyWithPictureToAll: (
    title: string,
    sender: string,
    message: string,
    notifPic: string,
    icon = 0,
    flashing = false,
    textColor = -1,
    bgColor = -1,
    flashColor = [77, 77, 77, 200]
  ) => {
    mp.events.callRemote(
      'server:players:notifyWithPictureToAll',
      title,
      sender,
      message,
      notifPic,
      icon,
      flashing,
      textColor,
      bgColor,
      flashColor
    );
  },

  notifyWithPictureToFraction: (
    title: string,
    sender: string,
    message: string,
    notifPic: string,
    fractionId = 0,
    icon = 0,
    flashing = false,
    textColor = -1,
    bgColor = -1,
    flashColor = [77, 77, 77, 200]
  ) => {
    mp.events.callRemote(
      'server:players:notifyWithPictureToFraction',
      title,
      sender,
      message,
      notifPic,
      fractionId,
      icon,
      flashing,
      textColor,
      bgColor,
      flashColor
    );
  },

  notifyWithPictureToFraction2: (
    title: string,
    sender: string,
    message: string,
    notifPic: string,
    fractionId = 0,
    icon = 0,
    flashing = false,
    textColor = -1,
    bgColor = -1,
    flashColor = [77, 77, 77, 200]
  ) => {
    mp.events.callRemote(
      'server:players:notifyWithPictureToFraction2',
      title,
      sender,
      message,
      notifPic,
      fractionId,
      icon,
      flashing,
      textColor,
      bgColor,
      flashColor
    );
  },

  notifyToFraction: (message: string, fractionId = 0) => {
    mp.events.callRemote('server:players:notifyToFraction', message, fractionId);
  },

  notifyToAll: (message: string) => {
    mp.events.callRemote('server:players:notifyToAll', message);
  },

  numerToK: (num: number) => {
    return Math.abs(num) > 999
      ? Math.sign(num) * (Math.abs(num) / 1000) + 'k'
      : Math.sign(num) * Math.abs(num);
  },

  getCurrentSpeed: (target = mp.players.local) => {
    let speed = 0;
    if (target.isSittingInAnyVehicle()) {
      let velocity = target.vehicle.getVelocity();
      speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
      //speed = Math.round(speed * 2.23693629);
      speed = Math.round(speed * 3.6);
    }
    return speed;
  },

  getVehicleInfo: (model: number):vehicleInfoCarConf => {
    let vehInfo = <any>enums.get('vehicleInfo');
    for (let item in vehInfo) {
      let vItem = vehInfo[item];
      if (
        vItem.hash == model ||
        vItem.display_name == model ||
        mp.game.joaat(vItem.display_name.toString().toLowerCase()) == model
      )
        return vItem;
    }

    if (vehInfo.length < 100) {
      enums.resetVehicleInfo();
      mp.events.callRemote('server:updateVehicleInfo');
    }
    return {
      id: 0,
      hash: model,
      display_name: 'Unknown',
      class_name: 'Unknown',
      stock: 378000,
      fuel_full: 75,
      fuel_min: 8,
    };
  },
  getFractionName: fractionUtil.getFractionName,
  getMafiaName: fractionUtil.getFractionName,
  getJobName: (job: string) => {
    switch (job) {
      case 'swater':
      case 'sground':
        return 'Учёный';
      case 'water':
        return 'Мехатроник';
      case 'sunb':
        return 'Уборщик квартир';
      case 'bgstar':
        return 'Дезинсектор';
      case 'lawyer1':
      case 'lawyer2':
      case 'lawyer3':
        return 'Адвокат';
      case 'mail':
      case 'mail2':
        return 'Почтальон';
      case 'gr6':
        return 'Инкассатор';
      case 'three':
        return 'Садовник';
      case 'photo':
        return 'Фотограф';
      case 'taxi1':
      case 'taxi2':
        return 'Таксист';
      case 'trucker1':
      case 'trucker2':
      case 'trucker3':
        return 'Дальнобойщик';
    }
    return '~r~Нет';
  },

  getCompanyName: getCompanyName,

  loadAllPeds: () => {
    //? In methods_peds.ts
  },

  createPed: (
    model: HashOrString,
    position: Vector3Mp,
    heading: number,
    isDefault = false,
    scenario = '',
    animation1 = '',
    animation2 = '',
    flag = 9
  ) => {
    mp.peds.new(model, position, heading);
  },

  deleteObjectGlobal: (x: number, y: number, z: number, hash: HashOrString) => {
    mp.events.callRemote('server:deleteObject', x, y, z, hash);
  },

  showHelpNotify: () => {
    if (user.isLogin() && user.getLevel() === 1) {
      if (user.getLevel() <= levelAccess.freeTaxi) {
        mp.game.ui.notifications.show('~g~Для новичков, такси - бесплатное\n' + (user.get('phone_code') === 0 ? '~g~Купите для начала телефон' : '~g~1 - Телефон - TAXI'));
      }

      if (user.get('reg_status') === 0) {
        mp.game.ui.notifications.show('~y~Получи регистрацию в здании правительства\n~y~M - GPS - Важные места - Правительство');
      } else if (user.getMoney() < 300 && user.get('b_lic') === false) {
        mp.game.ui.notifications.show('~y~Заработай первые деньги\n~y~M - GPS - Работы - Мойщик окон');
      } else if (user.get('b_lic') === false) {
        mp.game.ui.notifications.show('~y~У тебя нет прав категории B\n~y~M - GPS - Важные места - Здание правительства');
      } else if (user.get('job') === '') {
        mp.game.ui.notifications.show('~y~Устройся на работу\n~y~M - GPS - Важные места - Правительство - Трудовая биржа');
      } else if (user.get('phone_code') === 0) {
        mp.game.ui.notifications.show('~y~Купи телефон\n~y~M - GPS - Магазины и прочее - Магазин электронной техники');
      }
    }
  },

  getOrbitPosition: (x: number, y: number, z: number, rot: number, range: number) => {
    let newPos = new mp.Vector3(range * Math.sin(rot) + x, range * Math.cos(rot) + y, z);
    return newPos;
  },

  saveFractionLog: (name: string, doName: string, fractionId = 0) => {
    methods.saveLog('FractionLog', `[FractionID: ${fractionId}] ${name} - ${doName}`);
    mp.events.callRemote('server:addFractionLog', name, doName, fractionId);
  },

  createGlobalPedInVehicle: (model: string, vehicleId: number) => {
    mp.events.callRemote('server:methods:createGlobalPedInVehicle', model, vehicleId);
  },

  deleteGlobalPed: (id: number) => {
    mp.events.callRemote('server:methods:deleteGlobalPed', id);
  },

  getNearestHousePos: (pos: Vector3Mp, r: number) => {
    let nearest, dist;
    let min = r;
    mp.blips.forEach((b) => {
      if (b.getSprite() !== 40) return;

      dist = methods.distanceToPos(pos, b.getCoords());
      if (dist < min) {
        nearest = b.getCoords();
        min = dist;
      }
    });
    return nearest || new mp.Vector3(0, 0, 0);
  },

  getNearestPlayerWithCoords: (pos: Vector3Mp, r: number) => {
    let nearest, dist;
    let min = r;
    let players = methods.getListOfPlayersInStream();
    players.forEach((player) => {
      dist = methods.distanceToPos(pos, player.position);
      if (dist < min) {
        nearest = player;
        min = dist;
      }
    });
    return nearest;
  },

  getListOfPlayersInStream: () => {
    let returnPlayers: PlayerMp[] = [];
    mp.players.forEachInStreamRange((player) => {
      if (mp.players.local !== player) {
        returnPlayers.push(player);
      }
    });
    return returnPlayers;
  },

  getNearestVehicleWithCoords: (pos: Vector3Mp, r: number) => {
    let nearest: VehicleMp = undefined,
      dist;
    let min = r;
    methods.getListOfVehicleInStream().forEach((vehicle) => {
      dist = methods.distanceToPos(pos, vehicle.position);
      if (dist < min) {
        nearest = vehicle;
        min = dist;
      }
    });
    return nearest;
  },

  getListOfVehicleInStream: () => {
    let returnVehicles: VehicleMp[] = [];
    mp.vehicles.forEachInStreamRange((vehicle) => {
      returnVehicles.push(vehicle);
    });
    return returnVehicles;
  },

  digitFormat: (number: string | number) => {
    return ('0' + number).slice(-2);
  },

  numberFormat: (currentMoney: number) => {
    return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
      return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
    });
  },

  setIplPropState: (interiorId: number, prop: string, state = true) => {
    if (state) mp.game.interior.enableInteriorProp(interiorId, prop);
    else mp.game.interior.disableInteriorProp(interiorId, prop);
  },

  iplMichaelDefault: () => {
    let interiorId = 166657;
    let garageId = 166401;

    methods.setIplPropState(interiorId, 'V_Michael_bed_tidy');
    methods.setIplPropState(interiorId, 'V_Michael_bed_Messy');
    methods.setIplPropState(interiorId, 'Michael_premier', false);
    methods.setIplPropState(interiorId, 'V_Michael_FameShame', false);
    methods.setIplPropState(interiorId, 'V_Michael_plane_ticket', false);
    methods.setIplPropState(interiorId, 'V_Michael_JewelHeist', false);
    methods.setIplPropState(interiorId, 'burgershot_yoga', false);
    mp.game.interior.refreshInterior(interiorId);

    methods.setIplPropState(garageId, 'V_Michael_Scuba', false);
    mp.game.interior.refreshInterior(garageId);
  },

  iplSimonDefault: () => {
    let interiorId = 7170;
    mp.game.streaming.requestIpl('shr_int');
    methods.setIplPropState(interiorId, 'csr_beforeMission');
    methods.setIplPropState(interiorId, 'shutter_open');
    mp.game.interior.refreshInterior(interiorId);
  },

  iplFranklinAuntDefault: () => {
    let interiorId = 197889;
    methods.setIplPropState(interiorId, '');
    methods.setIplPropState(interiorId, 'V_57_GangBandana', false);
    methods.setIplPropState(interiorId, 'V_57_Safari', false);
    mp.game.interior.refreshInterior(interiorId);
  },

  iplFranklinDefault: () => {
    let interiorId = 206849;
    methods.setIplPropState(interiorId, '');
    methods.setIplPropState(interiorId, 'unlocked');
    methods.setIplPropState(interiorId, 'progress_flyer', false);
    methods.setIplPropState(interiorId, 'progress_tux', false);
    methods.setIplPropState(interiorId, 'progress_tshirt', false);
    methods.setIplPropState(interiorId, 'bong_and_wine', true);
    mp.game.interior.refreshInterior(interiorId);
  },

  iplFloydDefault: () => {
    let interiorId = 171777;
    methods.setIplPropState(interiorId, 'swap_clean_apt');
    methods.setIplPropState(interiorId, 'swap_mrJam_A');
    mp.game.interior.refreshInterior(interiorId);
  },

  iplTrevorDefault: () => {
    let interiorId = 2562;
    mp.game.streaming.requestIpl('trevorstrailertidy');
    methods.setIplPropState(interiorId, 'V_26_Trevor_Helmet3', false);
    methods.setIplPropState(interiorId, 'V_24_Trevor_Briefcase3', false);
    methods.setIplPropState(interiorId, 'V_26_Michael_Stay3', false);
    mp.game.interior.refreshInterior(interiorId);
  },

  iplAmmoDefault: () => {
    let ammunationsId = [
      140289, //249.8, -47.1, 70.0
      153857, //844.0, -1031.5, 28.2
      168193, //-664.0, -939.2, 21.8
      164609, //-1308.7, -391.5, 36.7
      176385, //-3170.0, 1085.0, 20.8
      175617, //-1116.0, 2694.1, 18.6
      200961, //1695.2, 3756.0, 34.7
      180481, //-328.7, 6079.0, 31.5
      178689, //2569.8, 297.8, 108.7
    ];
    let gunclubsId = [
      137729, //19.1, -1110.0, 29.8
      248065, //811.0, -2152.0, 29.6
    ];

    ammunationsId.forEach((interiorId) => {
      methods.setIplPropState(interiorId, 'GunStoreHooks');
      methods.setIplPropState(interiorId, 'GunClubWallHooks');
      mp.game.interior.refreshInterior(interiorId);
    });

    gunclubsId.forEach((interiorId) => {
      methods.setIplPropState(interiorId, 'GunStoreHooks');
      methods.setIplPropState(interiorId, 'GunClubWallHooks');
      mp.game.interior.refreshInterior(interiorId);
    });
  },

  iplLesterFactoryDefault: () => {
    let interiorId = 92674;
    methods.setIplPropState(interiorId, 'V_53_Agency_Blueprint', false);
    methods.setIplPropState(interiorId, 'V_35_KitBag', false);
    methods.setIplPropState(interiorId, 'V_35_Fireman', false);
    methods.setIplPropState(interiorId, 'V_35_Body_Armour', false);
    methods.setIplPropState(interiorId, 'Jewel_Gasmasks', false);
    methods.setIplPropState(interiorId, 'v_53_agency_overalls', false);
    mp.game.interior.refreshInterior(interiorId);
  },

  iplStripClubDefault: () => {
    let interiorId = 197121;
    methods.setIplPropState(interiorId, 'V_19_Trevor_Mess', false);
    mp.game.interior.refreshInterior(interiorId);
  },

  requestIpls: () => {
    //mp.game.streaming.requestIpl("RC12B_HospitalInterior");

    //Michael: -802.311, 175.056, 72.8446
    methods.iplMichaelDefault();
    //Simeon: -47.16170 -1115.3327 26.5
    methods.iplSimonDefault();
    //Franklin's aunt: -9.96562, -1438.54, 31.1015
    methods.iplFranklinAuntDefault();
    //Franklin
    methods.iplFranklinDefault();
    //Floyd: -1150.703, -1520.713, 10.633
    methods.iplFloydDefault();
    //Trevor: 1985.48132, 3828.76757, 32.5
    methods.iplTrevorDefault();
    methods.iplAmmoDefault();
    methods.iplLesterFactoryDefault();
    methods.iplStripClubDefault();

    //CASINO
    mp.game.streaming.requestIpl('vw_casino_main');

    let cIntID = mp.game.interior.getInteriorAtCoords(1100.0, 220.0, -50.0);
    mp.game.interior.enableInteriorProp(cIntID, 'casino_manager_﻿default﻿﻿﻿');
    mp.game.invoke(methods.SET_INTERIOR_PROP_COLOR, cIntID, 'casino_manager_﻿default﻿﻿﻿', 1);
    mp.game.interior.refreshInterior(cIntID);

    mp.game.streaming.requestIpl('hei_dlc_windows_casino');
    mp.game.streaming.requestIpl('hei_dlc_casino_aircon');
    mp.game.streaming.requestIpl('vw_dlc_casino_door');
    mp.game.streaming.requestIpl('hei_dlc_casino_door');
    mp.game.streaming.requestIpl('hei_dlc_windows_casino﻿');
    mp.game.streaming.requestIpl('vw_casino_penthouse');
    mp.game.streaming.requestIpl('vw_casino_garage');

    let phIntID = mp.game.interior.getInteriorAtCoords(976.636, 70.295, 115.164);
    let phPropList = [
      'Set_Pent_Tint_Shell',
      'Set_Pent_Pattern_01',
      'Set_Pent_Spa_Bar_Open',
      'Set_Pent_Media_Bar_Open',
      'Set_Pent_Dealer',
      'Set_Pent_Arcade_Retro',
      'Set_Pent_Bar_Clutter',
      'Set_Pent_Clutter_01',
      'set_pent_bar_light_01',
      'set_pent_bar_party_0',
    ];

    for (const propName of phPropList) {
      mp.game.interior.enableInteriorProp(phIntID, propName);
      mp.game.invoke(methods.SET_INTERIOR_PROP_COLOR, phIntID, propName, 1);
    }

    mp.game.interior.refreshInterior(phIntID);

    //---

    mp.game.streaming.requestIpl('imp_dt1_02_modgarage');

    //Heist Jewel: -637.20159 -239.16250 38.1
    mp.game.streaming.requestIpl('post_hiest_unload');

    //Max Renda: -585.8247, -282.72, 35.45475  Работу можно намутить
    mp.game.streaming.requestIpl('refit_unload');

    //Heist Union Depository: 2.69689322, -667.0166, 16.1306286
    mp.game.streaming.requestIpl('FINBANK');

    //Morgue: 239.75195, -1360.64965, 39.53437
    mp.game.streaming.requestIpl('Coroner_Int_on');

    //1861.28, 2402.11, 58.53
    mp.game.streaming.requestIpl('ch3_rd2_bishopschickengraffiti');
    //2697.32, 3162.18, 58.1
    mp.game.streaming.requestIpl('cs5_04_mazebillboardgraffiti');
    //2119.12, 3058.21, 53.25
    mp.game.streaming.requestIpl('cs5_roads_ronoilgraffiti');

    //Cluckin Bell: -146.3837, 6161.5, 30.2062
    mp.game.streaming.requestIpl('CS1_02_cf_onmission1');
    mp.game.streaming.requestIpl('CS1_02_cf_onmission2');
    mp.game.streaming.requestIpl('CS1_02_cf_onmission3');
    mp.game.streaming.requestIpl('CS1_02_cf_onmission4');

    //Grapeseed's farm: 2447.9, 4973.4, 47.7
    mp.game.streaming.requestIpl('farm');
    mp.game.streaming.requestIpl('farmint');
    mp.game.streaming.requestIpl('farm_lod');
    mp.game.streaming.requestIpl('farm_props');
    mp.game.streaming.requestIpl('des_farmhouse');

    //FIB lobby: 105.4557, -745.4835, 44.7548
    mp.game.streaming.requestIpl('FIBlobby');
    mp.game.streaming.requestIpl('dt1_05_fib2_normal');

    mp.game.streaming.removeIpl('hei_bi_hw1_13_door');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_v_comedy_milo_');
    mp.game.streaming.requestIpl('apa_ss1_11_interior_v_rockclub_milo_');
    mp.game.streaming.requestIpl('ferris_finale_Anim');
    mp.game.streaming.requestIpl('gr_case6_bunkerclosed');

    //Billboard: iFruit
    mp.game.streaming.requestIpl('FruitBB');
    mp.game.streaming.requestIpl('sc1_01_newbill');
    mp.game.streaming.requestIpl('hw1_02_newbill');
    mp.game.streaming.requestIpl('hw1_emissive_newbill');
    mp.game.streaming.requestIpl('sc1_14_newbill');
    mp.game.streaming.requestIpl('dt1_17_newbill');

    //Lester's factory: 716.84, -962.05, 31.59
    mp.game.streaming.requestIpl('id2_14_during_door');
    mp.game.streaming.requestIpl('id2_14_during1');

    //Life Invader lobby: -1047.9, -233.0, 39.0
    mp.game.streaming.requestIpl('facelobby');

    //Авианосец
    mp.game.streaming.requestIpl('hei_carrier');
    mp.game.streaming.requestIpl('hei_carrier_distantlights');
    mp.game.streaming.requestIpl('hei_carrier_int1');
    mp.game.streaming.requestIpl('hei_carrier_int1_lod');
    mp.game.streaming.requestIpl('hei_carrier_int2');
    mp.game.streaming.requestIpl('hei_carrier_int2_lod');
    mp.game.streaming.requestIpl('hei_carrier_int3');
    mp.game.streaming.requestIpl('hei_carrier_int3_lod');
    mp.game.streaming.requestIpl('hei_carrier_int4');
    mp.game.streaming.requestIpl('hei_carrier_int4_lod');
    mp.game.streaming.requestIpl('hei_carrier_int5');
    mp.game.streaming.requestIpl('hei_carrier_int5_lod');
    mp.game.streaming.requestIpl('hei_carrier_int6');
    mp.game.streaming.requestIpl('hei_carrier_lod');
    mp.game.streaming.requestIpl('hei_carrier_lodlights');
    mp.game.streaming.requestIpl('hei_carrier_slod');

    //Яхта
    mp.game.streaming.requestIpl('hei_yacht_heist');
    mp.game.streaming.requestIpl('hei_yacht_heist_enginrm');
    mp.game.streaming.requestIpl('hei_yacht_heist_Lounge');
    mp.game.streaming.requestIpl('hei_yacht_heist_Bridge');
    mp.game.streaming.requestIpl('hei_yacht_heist_Bar');
    mp.game.streaming.requestIpl('hei_yacht_heist_Bedrm');
    mp.game.streaming.requestIpl('hei_yacht_heist_DistantLights');
    mp.game.streaming.requestIpl('hei_yacht_heist_LODLights');

    //Яхта2
    mp.game.streaming.requestIpl('gr_heist_yacht2');
    mp.game.streaming.requestIpl('gr_heist_yacht2_bar');
    mp.game.streaming.requestIpl('gr_heist_yacht2_bedrm');
    mp.game.streaming.requestIpl('gr_heist_yacht2_bridge');
    mp.game.streaming.requestIpl('gr_heist_yacht2_enginrm');
    mp.game.streaming.requestIpl('gr_heist_yacht2_lounge');
    mp.game.streaming.requestIpl('gr_grdlc_interior_placement_interior_0_grdlc_int_01_milo_');

    //Tunnels
    mp.game.streaming.requestIpl('v_tunnel_hole');

    //Carwash: 55.7, -1391.3, 30.5
    mp.game.streaming.requestIpl('Carwash_with_spinners');

    //Stadium "Fame or Shame": -248.49159240722656, -2010.509033203125, 34.57429885864258
    mp.game.streaming.requestIpl('sp1_10_real_interior');
    mp.game.streaming.requestIpl('sp1_10_real_interior_lod');

    //House in Banham Canyon: -3086.428, 339.2523, 6.3717
    mp.game.streaming.requestIpl('ch1_02_open');

    //Garage in La Mesa (autoshop): 970.27453, -1826.56982, 31.11477
    mp.game.streaming.requestIpl('bkr_bi_id1_23_door');

    //Hill Valley church - Grave: -282.46380000, 2835.84500000, 55.91446000
    mp.game.streaming.requestIpl('lr_cs6_08_grave_closed');

    //Lost's trailer park: 49.49379000, 3744.47200000, 46.38629000
    mp.game.streaming.requestIpl('methtrailer_grp1');

    //Lost safehouse: 984.1552, -95.3662, 74.50
    mp.game.streaming.requestIpl('bkr_bi_hw1_13_int');

    //Raton Canyon river: -1652.83, 4445.28, 2.52
    mp.game.streaming.requestIpl('CanyonRvrShallow');

    //Zancudo Gates (GTAO like): -1600.30100000, 2806.73100000, 18.79683000
    //mp.game.streaming.requestIpl('CS3_07_MPGates');

    //Pillbox hospital:
    mp.game.streaming.requestIpl('rc12b_default');

    //mp.game.streaming.removeIpl("rc12b_default");
    //mp.game.streaming.requestIpl("rc12b_hospitalinterior");

    //Josh's house: -1117.1632080078, 303.090698, 66.52217
    mp.game.streaming.requestIpl('bh1_47_joshhse_unburnt');
    mp.game.streaming.requestIpl('bh1_47_joshhse_unburnt_lod');

    mp.game.streaming.removeIpl('sunkcargoship');
    mp.game.streaming.requestIpl('cargoship');

    mp.game.streaming.requestIpl('ex_sm_13_office_02b'); //АШ

    //mp.game.streaming.requestIpl("ex_dt1_02_office_02a"); // Бизнес Центр - old ex_dt1_02_office_03a

    mp.game.streaming.requestIpl('ex_dt1_02_office_02b');

    mp.game.streaming.requestIpl('ex_sm_15_office_01a'); // Meria - old ex_dt1_02_office_03a

    mp.game.streaming.requestIpl('ex_dt1_11_office_01b'); //Maze Bank Office

    //Bahama Mamas: -1388.0013, -618.41967, 30.819599
    mp.game.streaming.requestIpl('hei_sm_16_interior_v_bahama_milo_');

    mp.game.streaming.requestIpl('apa_v_mp_h_01_a');
    mp.game.streaming.requestIpl('apa_v_mp_h_02_b');
    mp.game.streaming.requestIpl('apa_v_mp_h_08_c');

    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_v_studio_lo_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_v_apart_midspaz_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_32_dlc_apart_high2_new_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_10_dlc_apart_high_new_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_28_dlc_apart_high2_new_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_27_dlc_apart_high_new_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_29_dlc_apart_high2_new_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_30_dlc_apart_high2_new_milo_');
    mp.game.streaming.requestIpl('hei_hw1_blimp_interior_31_dlc_apart_high2_new_milo_');
    mp.game.streaming.requestIpl('apa_ch2_05e_interior_0_v_mp_stilts_b_milo_');
    mp.game.streaming.requestIpl('apa_ch2_04_interior_0_v_mp_stilts_b_milo_');
    mp.game.streaming.requestIpl('apa_ch2_04_interior_1_v_mp_stilts_a_milo_');
    mp.game.streaming.requestIpl('apa_ch2_09c_interior_2_v_mp_stilts_b_milo_');
    mp.game.streaming.requestIpl('apa_ch2_09b_interior_1_v_mp_stilts_b_milo_');
    mp.game.streaming.requestIpl('apa_ch2_09b_interior_0_v_mp_stilts_a_milo_');
    mp.game.streaming.requestIpl('apa_ch2_05c_interior_1_v_mp_stilts_a_milo_');
    mp.game.streaming.requestIpl('apa_ch2_12b_interior_0_v_mp_stilts_a_milo_');

    //Galaxy
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_clubname_01');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_Style02');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_style02_podium');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_equipment_setup');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_equipment_upgrade');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_security_upgrade');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_dj01');
    mp.game.interior.enableInteriorProp(271617, 'DJ_03_Lights_02');
    mp.game.interior.enableInteriorProp(271617, 'DJ_04_Lights_01');
    mp.game.interior.enableInteriorProp(271617, 'DJ_03_Lights_03');
    mp.game.interior.enableInteriorProp(271617, 'DJ_04_Lights_04');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_bar_content');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_booze_01');
    mp.game.interior.enableInteriorProp(271617, 'Int01_ba_dry_ice');
    mp.game.interior.refreshInterior(271617);
  },

  isPlayerInOcean: () => {
    let pos = mp.players.local.position;
    return mp.game.zone.getNameOfZone(pos.x, pos.y, pos.z) === 'OCEANA';
  },

  getRandomArbitrary: (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  },

  getKeyFromTwoDimensionalArray: <T>(array: T[], value: T): number => {
    // !todo -> array.forEach(key, (val:any) => {
    array.forEach((val: any, key) => {
      if (val === value) {
        return key;
      }
    });
    return null;
  },

  getValueForIndexFromTwoDimensionalArray: (array: any[], checkval: any, icheck: any, iselect: any): any => {
    let returnVal = null; // Жуткий костыль который нужно поправить
    array.forEach((val) => {
      if (val[icheck] === checkval) {
        returnVal = val[iselect];
      }
    });
    return returnVal;
  },


  removeQuotes: (text: string) => {
    return text.replace("'", '');
  },

  removeQuotes2: (text: string) => {
    return text.replace('"', '');
  },


};

/*
function SetIplPropState(interiorId, props, state, refresh)
    if refresh == nil then refresh = false end
    if IsTable(interiorId) then
        for key, value in pairs(interiorId) do
            SetIplPropState(value, props, state, refresh)
        end
    else
        if IsTable(props) then
            for key, value in pairs(props) do
                SetIplPropState(interiorId, value, state, refresh)
            end
        else
            if state then
                if not IsInteriorPropEnabled(interiorId, props) then EnableInteriorProp(interiorId, props) end
            else
                if IsInteriorPropEnabled(interiorId, props) then DisableInteriorProp(interiorId, props) end
            end
        end
        if refresh == true then RefreshInterior(interiorId) end
    end
end
*/

export { methods };
