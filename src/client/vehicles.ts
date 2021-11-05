/// <reference path="../declaration/client.ts" />
let player = mp.players.local;
import { methods } from './modules/methods';
import { user } from './user';
import {Container} from './modules/data';
import { registerDrawNow } from './auth';
import { testDriveMode } from './business/autosalon';

let isAutopilotEnable = false;
let offset = 1000000;

let carCompareShow = false;
mp.events.add('carCompare', () => {
  carCompareShow = !carCompareShow
  mp.events.triggerBrowser('carCompareShow', carCompareShow)
})

let currentSpeed:number;
let currentTime:number;
let time0To100:number;
let time0To200:number;
let vmax:number;
let startTime:number;
let modify0To100:boolean;
let modify0To200:boolean;
let modifyCurrentTime:boolean;

currentSpeed = currentTime = time0To100 = time0To200 = vmax = startTime = 0;
modify0To100 = modify0To200 = modifyCurrentTime = true;
mp.events.add('render', () => {
  if (!carCompareShow) return;
  if (!player.vehicle) return;
  // if (player.vehicle.getPedInSeat(-1) !== player.handle) return;
  currentSpeed = (<any>(player.vehicle.getSpeed() * 3.6).toFixed(0) * 1);
  if (currentSpeed == 0) {
    currentTime = time0To100 = time0To200 = vmax = startTime = 0;
    modify0To100 = modify0To200 = modifyCurrentTime = true;
  } else {
    if (currentSpeed > vmax) vmax = currentSpeed;
    if (startTime == 0) startTime = new Date().getTime();
    if (modifyCurrentTime) currentTime = <any>((new Date().getTime() - startTime) / 1000).toFixed(3);
    if (modify0To100) time0To100 = currentTime;
    if (currentSpeed >= 100) modify0To100 = false;
    if (modify0To200) time0To200 = currentTime;
    if (currentSpeed >= 200) {
      modify0To200 = false;
      modifyCurrentTime = false;
    }
  }
  mp.events.triggerBrowser('carCompareData', time0To100, time0To200, vmax)
  
});

let vehicles = {
  set: (id:number, key:any, val:any) => {
    Container.SetLocally(offset + id, key, val);
  },
  
  reset: (id:number, key:any) => {
    Container.ResetLocally(offset + id, key);
  },
  
  get: (id:number, key:any) => {
    if (vehicles.has(id, key)) return Container.GetLocally(offset + id, key);
    return undefined;
  },
  
  has: (id:number, key:any) => {
    return Container.HasLocally(offset + id, key);
  },
  
  enableAutopilot: () => {
    if (mp.game.invoke(methods.IS_WAYPOINT_ACTIVE)) {
      let pos = methods.getWaypointPosition();
      mp.players.local.taskVehicleDriveToCoordLongrange(
        mp.players.local.vehicle.handle,
        pos.x,
        pos.y,
        pos.z,
        55 / 2.2,
        786603,
        30
      );
      isAutopilotEnable = true;
      vehicles.checkAutopilot();
      mp.game.ui.notifications.show('~g~Автопилот активирован');
    } else {
      mp.players.local.clearTasks();
      mp.game.ui.notifications.show('Сначала установите маркер на карте');
    }
  },
  
  disableAutopilot: () => {
    mp.game.ui.notifications.show('~y~Автопилот деактивирован');
    mp.players.local.clearTasks();
    isAutopilotEnable = false;
  },
  
  setInteriorLightState: (state:boolean) => {
    if (mp.players.local.vehicle)
      mp.events.callRemote('s:vSync:setInteriorLightState', mp.players.local.vehicle, state);
  },
  
  setTaxiLightState: (state:boolean) => {
    if (mp.players.local.vehicle)
      mp.events.callRemote('s:vSync:setTaxiLightState', mp.players.local.vehicle, state);
  },
  
  setIndicatorLeftState: (state:boolean) => {
    if (mp.players.local.vehicle)
      mp.events.callRemote('s:vSync:setIndicatorLeftState', mp.players.local.vehicle, state);
  },
  
  setIndicatorRightState: (state:boolean) => {
    if (mp.players.local.vehicle)
      mp.events.callRemote('s:vSync:setIndicatorRightState', mp.players.local.vehicle, state);
  },
  
  checkerControl: () => {
    let veh = mp.players.local.vehicle;
    if (veh) {
      let vInfo = methods.getVehicleInfo(veh.model);
      if (
        vInfo.class_name == 'Helicopters' ||
        vInfo.class_name == 'Planes' ||
        vInfo.class_name == 'Boats' ||
        vInfo.class_name == 'Motorcycles' ||
        vInfo.class_name == 'Cycles'
      )
        return false;
      return (
        // veh.getRotation(0).x > 90 ||
        // veh.getRotation(0).x < -90 ||
        // veh.getRotation(0).y > 90 ||
        // veh.getRotation(0).y < -90 ||
        veh.isInAir()
      );
    }
    return false;
  },
  
  checkAutopilot: () => {
    if (isAutopilotEnable) {
      if (methods.getWaypointPosition().x == 0) {
        mp.players.local.clearTasks();
        isAutopilotEnable = false;
        mp.players.local.taskVehicleTempAction(mp.players.local.vehicle.handle, 27, 8000);
        setTimeout(function() {
          mp.game.ui.notifications.show('~g~Вы достигли конечной точки маршрута');
          mp.game.ui.notifications.show('~y~Автопилот деактивирован');
          mp.players.local.clearTasks();
        }, 8000);
      } else setTimeout(vehicles.checkAutopilot, 1000);
    }
  },
  
  getData: async (id: number) => {
    return await Container.GetAll(200000 + methods.parseInt(id));
  },

  getSpecialModName: (id: number) => {
    if (id >= 100) id = id - 100;
    switch (id) {
      case 0:
        return 'fDriveBiasFront';
      case 1:
        return 'fInitialDriveForce';
      case 2:
        return 'fDriveInertia';
      case 3:
        return 'fBrakeForce';
      case 4:
        return 'fBrakeBiasFront';
      case 5:
        return 'fHandBrakeForce';
      case 6:
        return 'fSteeringLock';
      case 7:
        return 'fTractionCurveMax';
      case 8:
        return 'fTractionCurveMin';
    }
  },
  
  isVehicleSirenValid: (model:number) => {
    let vInfo = methods.getVehicleInfo(model);
    switch (vInfo.display_name) {
      case 'Police':
      case 'Police2':
      case 'Police3':
      case 'Police4':
      case 'PoliceT':
      case 'Policeb':
      case 'FBI':
      case 'FBI2':
      case 'Sheriff':
      case 'Sheriff2':
      case 'Riot':
      case 'Riot2':
      case 'Lguard':
      case 'Pranger':
      case 'Ambulance':
      case 'FireTruck':
      case 'PoliceOld1':
      case 'PoliceOld2':
        return true;
    }
    return false;
  },
  
  getSirenSound: (model:number, state: number) => {
    let vInfo = methods.getVehicleInfo(model);
    switch (vInfo.display_name) {
      case 'Police':
      case 'FBI2':
      case 'Sheriff':
      case 'Sheriff2':
      case 'Pranger': {
        if (state == 2) return 'RESIDENT_VEHICLES_SIREN_WAIL_03';
        if (state == 3) return 'RESIDENT_VEHICLES_SIREN_QUICK_03';
        if (state == 4) return 'VEHICLES_HORNS_POLICE_WARNING';
        break;
      }
      case 'Police2':
      case 'Police3': {
        if (state == 2) return 'VEHICLES_HORNS_SIREN_1';
        if (state == 3) return 'VEHICLES_HORNS_SIREN_2';
        if (state == 4) return 'VEHICLES_HORNS_POLICE_WARNING';
        break;
      }
      case 'FBI':
      case 'Police4':
      case 'Lguard':
      case 'PoliceT': {
        if (state == 2) return 'RESIDENT_VEHICLES_SIREN_WAIL_02';
        if (state == 3) return 'RESIDENT_VEHICLES_SIREN_QUICK_02';
        if (state == 4) return 'VEHICLES_HORNS_POLICE_WARNING';
        break;
      }
      case 'Policeb':
      case 'Riot':
      case 'Riot2':
      case 'Ambulance':
      case 'PoliceOld1':
      case 'PoliceOld2': {
        if (state == 2) return 'RESIDENT_VEHICLES_SIREN_WAIL_01';
        if (state == 3) return 'RESIDENT_VEHICLES_SIREN_QUICK_01';
        if (state == 4) return 'VEHICLES_HORNS_POLICE_WARNING';
        break;
      }
      case 'FireTruck': {
        if (state == 2) return 'RESIDENT_VEHICLES_SIREN_FIRETRUCK_QUICK_01';
        if (state == 3) return 'RESIDENT_VEHICLES_SIREN_FIRETRUCK_QUICK_01';
        if (state == 4) return 'VEHICLES_HORNS_FIRETRUCK_WARNING';
        break;
      }
    }
    return '';
  },
  
  getWarningSound: (model:number) => {
    let vInfo = methods.getVehicleInfo(model);
    switch (vInfo.display_name) {
      case 'Police':
      case 'Police2':
      case 'Police3':
      case 'Police4':
      case 'PoliceT':
      case 'Policeb':
      case 'FBI':
      case 'FBI2':
      case 'Sheriff':
      case 'Sheriff2':
      case 'Riot':
      case 'Riot2':
      case 'Lguard':
      case 'Pranger':
      case 'Ambulance':
      case 'PoliceOld1':
      case 'PoliceOld2':
        return 'SIRENS_AIRHORN';
      case 'FireTruck':
        return 'VEHICLES_HORNS_FIRETRUCK_WARNING';
    }
  },

  getSpeedBoost: (model:number) => {
    let modelName = methods.getVehicleInfo(model).display_name;
    switch (modelName) {
      case 'Adder':
        return 47;
      case 'Akuma':
        return 26;
      case 'Ambulance':
        return 5;
      case 'Autarch':
        return 45;
      case 'Bagger':
        return 8;
      case 'Bati':
        return 35;
      case 'Bati2':
        return 35;
      case 'Bullet':
        return 20;
      case 'Cheetah':
        return 40;
      case 'Cheetah2':
        return 23;
      case 'Cyclone':
        return 40;
      case 'Deveste':
        return 48;
      case 'Diablous':
        return 20;
      case 'Diablous2':
        return 30;
      case 'Double':
        return 30;
      case 'Entity2':
        return 60;
      case 'EntityXF':
        return 47;
      case 'FBI':
        return 30;
      case 'FBI2':
        return 20;
      case 'GP1':
        return 40;
      case 'Hakuchou':
        return 20;
      case 'Hakuchou2':
        return 40;
      case 'Hexer':
        return 2;
      case 'Infernus':
        return 20;
      case 'Infernus2':
        return 20;
      case 'Insurgent':
        return 10;
      case 'Insurgent2':
        return 10;
      case 'Insurgent3':
        return 10;
      case 'LE7B':
        return 35;
      case 'Lectro':
        return 10;
      case 'Lguard':
        return 10;
      case 'Nemesis':
        return 10;
      case 'Neon':
        return 30;
      case 'Nero':
        return 62;
      case 'Nero2':
        return 63;
      case 'Nightblade':
        return 5;
      case 'PCJ':
        return 10;
      case 'Penetrator':
        return 35;
      case 'Pfister811':
        return 25;
      case 'Police':
        return 35;
      case 'Police2':
        return 25;
      case 'Police3':
        return 30;
      case 'Police4':
        return 30;
      case 'Policeb':
        return 30;
      case 'PoliceBuffalo':
        return 30;
      case 'PoliceOld1':
        return 10;
      case 'PoliceOld2':
        return 10;
      case 'PoliceT':
        return 10;
      case 'Polmav':
        return 50;
      case 'Prototipo':
        return 50;
      case 'Raiden':
        return 20;
      case 'Reaper':
        return 50;
      case 'Ruffian':
        return 10;
      case 'Sanctus':
        return 4;
      case 'SC1':
        return 20;
      case 'Schlagen':
        return 23;
      case 'Sheriff':
        return 30;
      case 'Sheriff2':
        return 30;
      case 'Shotaro':
        return 10;
      case 'Sovereign':
        return 5;
      case 'Stinger':
        return 10;
      case 'StingerGT':
        return 14;
      case 'Swinger':
        return 20;
      case 'T20':
        return 44;
      case 'Tempesta':
        return 30;
      case 'Tezeract':
        return 46;
      case 'Thrust':
        return 8;
      case 'Turismo2':
        return 20;
      case 'Turismor':
        return 44;
      case 'Tyrant':
        return 42;
      case 'Tyrus':
        return 40;
      case 'Vacca':
        return 30;
      case 'Visione':
        return 42;
      case 'Voltic':
        return 20;
      case 'Wolfsbane':
        return 3;
      case 'XA21':
        return 40;
      case 'Zentorno':
        return 38;
      case 'Zombiea':
        return 8;
      case 'Zombieb':
        return 8;
      case 'Emerus':
        return 48;
      case 'Krieger':
        return 45;
      case 'Neo':
        return 31;
      case 'S80':
        return 40;
      case 'Thrax':
        return 60;
      case 'Zorrusso':
        return 40;
      case 'Vagner':
        return 40;
      case 'Taipan':
        return 30;
      case 'Osiris':
        return 30;
      case 'Gauntlet4':
        return 30;
      case 'Tropos':
        return 30;
      case 'FlashGT':
        return 30;
      case 'Surrano':
        return 30;
      case 'Jugular':
        return 30;
      case 'Verlierer2':
        return 20;
      case 'Specter':
        return 35;
      case 'Specter2':
        return 39;
      case 'Dominator3':
        return 60;
    }
    return 1;
  },
  
  getSpeedMax: (model: any) => {
    let modelName = methods.getVehicleInfo(model).display_name;
    switch (modelName) {
      case 'Adder':
        return 340;
      case 'Akuma':
        return 285;
      case 'Alpha':
        return 240;
      case 'Ambulance':
        return 203;
      case 'Ardent':
        return 240;
      case 'Asea':
        return 150;
      case 'Asterope':
        return 150;
      case 'Autarch':
        return 340;
      case 'Avarus':
        return 200;
      case 'Bagger':
        return 230;
      case 'Baller':
        return 180;
      case 'Baller2':
        return 180;
      case 'Baller3':
        return 190;
      case 'Baller4':
        return 180;
      case 'Banshee':
        return 252;
      case 'Banshee2':
        return 280;
      case 'Barracks':
        return 150;
      case 'Barracks2':
        return 150;
      case 'Barracks3':
        return 150;
      case 'Bati':
        return 290;
      case 'Bati2':
        return 292;
      case 'Benson':
        return 150;
      case 'BestiaGTS':
        return 273;
      case 'BF400':
        return 130;
      case 'BfInjection':
        return 140;
      case 'Biff':
        return 150;
      case 'Bifta':
        return 150;
      case 'Bison':
        return 170;
      case 'Bison2':
        return 170;
      case 'Bison3':
        return 170;
      case 'BJXL':
        return 170;
      case 'Blade':
        return 170;
      case 'Blazer':
        return 140;
      case 'Blazer2':
        return 140;
      case 'Blazer3':
        return 150;
      case 'Blazer4':
        return 160;
      case 'Blazer5':
        return 150;
      case 'Blimp':
        return 1;
      case 'Blimp2':
        return 1;
      case 'Blimp3':
        return 1;
      case 'Blista':
        return 170;
      case 'Blista2':
        return 170;
      case 'Blista3':
        return 170;
      case 'Bmx':
        return 60;
      case 'BoatTrailer':
        return 1;
      case 'BobcatXL':
        return 180;
      case 'Bodhi2':
        return 160;
      case 'Bombushka':
        return 1;
      case 'Boxville':
        return 140;
      case 'Boxville2':
        return 140;
      case 'Boxville3':
        return 140;
      case 'Boxville4':
        return 140;
      case 'Boxville5':
        return 140;
      case 'Brawler':
        return 239;
      case 'Brickade':
        return 160;
      case 'Brioso':
        return 180;
      case 'Bruiser':
        return 190;
      case 'Bruiser2':
        return 190;
      case 'Bruiser3':
        return 190;
      case 'Brutus':
        return 190;
      case 'Brutus2':
        return 190;
      case 'Brutus3':
        return 190;
      case 'BType':
        return 130;
      case 'BType2':
        return 180;
      case 'BType3':
        return 180;
      case 'Buccaneer':
        return 1;
      case 'Buccaneer2':
        return 1;
      case 'Buffalo':
        return 200;
      case 'Buffalo2':
        return 211;
      case 'Buffalo3':
        return 210;
      case 'Bulldozer':
        return 40;
      case 'Bullet':
        return 270;
      case 'Burrito':
        return 180;
      case 'Burrito2':
        return 180;
      case 'Burrito3':
        return 180;
      case 'Burrito4':
        return 180;
      case 'Burrito5':
        return 180;
      case 'Bus':
        return 170;
      case 'Buzzard':
        return 1;
      case 'Buzzard2':
        return 1;
      case 'CableCar':
        return 1;
      case 'Caddy':
        return 70;
      case 'Caddy2':
        return 70;
      case 'Caddy3':
        return 70;
      case 'Camper':
        return 180;
      case 'Caracara':
        return 200;
      case 'Carbonizzare':
        return 280;
      case 'CarbonRS':
        return 280;
      case 'Cargobob':
        return 1;
      case 'Cargobob3':
        return 1;
      case 'Cargobob4':
        return 1;
      case 'CargoPlane':
        return 1;
      case 'Casco':
        return 220;
      case 'Cavalcade':
        return 180;
      case 'Cavalcade2':
        return 180;
      case 'Cerberus':
        return 120;
      case 'Cerberus2':
        return 120;
      case 'Cerberus3':
        return 120;
      case 'Cheburek':
        return 170;
      case 'Cheetah':
        return 290;
      case 'Cheetah2':
        return 220;
      case 'Chernobog':
        return 1;
      case 'Chimera':
        return 220;
      case 'Chino':
        return 180;
      case 'Chino2':
        return 180;
      case 'Cliffhanger':
        return 205;
      case 'Clique':
        return 220;
      case 'Coach':
        return 170;
      case 'Cog55':
        return 215;
      case 'CogCabrio':
        return 215;
      case 'Cognoscenti':
        return 215;
      case 'Comet2':
        return 280;
      case 'Comet3':
        return 275;
      case 'Comet4':
        return 270;
      case 'Comet5':
        return 280;
      case 'Contender':
        return 190;
      case 'Coquette':
        return 250;
      case 'Coquette2':
        return 220;
      case 'Coquette3':
        return 222;
      case 'Cruiser':
        return 20;
      case 'Crusader':
        return 200;
      case 'Cuban800':
        return 1;
      case 'Cutter':
        return 30;
      case 'Cyclone':
        return 280;
      case 'Daemon':
        return 220;
      case 'Daemon2':
        return 220;
      case 'Deathbike':
        return 220;
      case 'Deathbike2':
        return 230;
      case 'Deathbike3':
        return 230;
      case 'Defiler':
        return 270;
      case 'Deluxo':
        return 1;
      case 'Deveste':
        return 330;
      case 'Deviant':
        return 234;
      case 'Diablous':
        return 250;
      case 'Diablous2':
        return 280;
      case 'Dilettante':
        return 195;
      case 'Dilettante2':
        return 200;
      case 'Dinghy':
        return 1;
      case 'Dinghy2':
        return 1;
      case 'Dinghy3':
        return 1;
      case 'Dinghy4':
        return 1;
      case 'DLoader':
        return 170;
      case 'DockTrailer':
        return 1;
      case 'Docktug':
        return 50;
      case 'Dodo':
        return 1;
      case 'Dominator':
        return 245;
      case 'Dominator2':
        return 245;
      case 'Dominator3':
        return 290;
      case 'Dominator4':
        return 250;
      case 'Dominator5':
        return 250;
      case 'Dominator6':
        return 250;
      case 'Double':
        return 279;
      case 'Dubsta':
        return 213;
      case 'Dubsta2':
        return 223;
      case 'Dubsta3':
        return 220;
      case 'Dukes':
        return 200;
      case 'Dukes2':
        return 200;
      case 'Dump':
        return 70;
      case 'Dune':
        return 160;
      case 'Dune2':
        return 160;
      case 'Dune3':
        return 160;
      case 'Dune4':
        return 160;
      case 'Dune5':
        return 160;
      case 'Duster':
        return 1;
      case 'Elegy':
        return 280;
      case 'Elegy2':
        return 270;
      case 'Ellie':
        return 220;
      case 'Emperor':
        return 160;
      case 'Emperor2':
        return 140;
      case 'Emperor3':
        return 140;
      case 'Enduro':
        return 170;
      case 'Entity2':
        return 350;
      case 'EntityXF':
        return 330;
      case 'Esskey':
        return 220;
      case 'Exemplar':
        return 240;
      case 'F620':
        return 250;
      case 'Faction':
        return 170;
      case 'Faction2':
        return 170;
      case 'Faction3':
        return 160;
      case 'Fagaloa':
        return 150;
      case 'Faggio':
        return 90;
      case 'Faggio2':
        return 90;
      case 'Faggio3':
        return 90;
      case 'FBI':
        return 300;
      case 'FBI2':
        return 290;
      case 'Fcr':
        return 270;
      case 'Fcr2':
        return 270;
      case 'Felon':
        return 230;
      case 'Felon2':
        return 230;
      case 'Feltzer2':
        return 250;
      case 'Feltzer3':
        return 190;
      case 'Fixter':
        return 60;
      case 'FlashGT':
        return 296;
      case 'Flatbed':
        return 170;
      case 'FMJ':
        return 298;
      case 'Forklift':
        return 60;
      case 'FQ2':
        return 200;
      case 'Freecrwaler':
        return 206;
      case 'Frogger':
        return 1;
      case 'Frogger2':
        return 1;
      case 'Fugitive':
        return 250;
      case 'Furoregt':
        return 256;
      case 'Fusilade':
        return 205;
      case 'Futo':
        return 190;
      case 'Gargoyle':
        return 201;
      case 'Gauntlet':
        return 220;
      case 'Gauntlet2':
        return 220;
      case 'GB200':
        return 260;
      case 'GBurrito':
        return 180;
      case 'GBurrito2':
        return 180;
      case 'Glendale':
        return 180;
      case 'GP1':
        return 290;
      case 'GrainTrailer':
        return 1;
      case 'Granger':
        return 190;
      case 'Gresley':
        return 195;
      case 'GT500':
        return 210;
      case 'Guardian':
        return 190;
      case 'Habanero':
        return 190;
      case 'Hakuchou':
        return 290;
      case 'Hakuchou2':
        return 305;
      case 'Halftrack':
        return 120;
      case 'Handler':
        return 40;
      case 'Hauler':
        return 170;
      case 'Havok':
        return 1;
      case 'Hermes':
        return 170;
      case 'Hexer':
        return 210;
      case 'Hotknife':
        return 201;
      case 'Howard':
        return 1;
      case 'Hunter':
        return 1;
      case 'Huntley':
        return 220;
      case 'Hustler':
        return 220;
      case 'Hydra':
        return 1;
      case 'Impaler':
        return 170;
      case 'Impaler2':
        return 170;
      case 'Impaler3':
        return 170;
      case 'Impaler4':
        return 170;
      case 'Imperator':
        return 210;
      case 'Imperator2':
        return 210;
      case 'Imperator3':
        return 210;
      case 'Infernus':
        return 260;
      case 'Infernus2':
        return 240;
      case 'Ingot':
        return 130;
      case 'Innovation':
        return 210;
      case 'Insurgent':
        return 250;
      case 'Insurgent2':
        return 250;
      case 'Insurgent3':
        return 250;
      case 'Intruder':
        return 170;
      case 'Issi2':
        return 150;
      case 'Issi3':
        return 150;
      case 'Issi4':
        return 150;
      case 'Issi5':
        return 150;
      case 'Issi6':
        return 150;
      case 'Italigtb':
        return 286;
      case 'Italigtb2':
        return 286;
      case 'Italigto':
        return 280;
      case 'Jackal':
        return 230;
      case 'JB700':
        return 200;
      case 'Jester':
        return 267;
      case 'Jester2':
        return 267;
      case 'Jester3':
        return 262;
      case 'Jet':
        return 1;
      case 'Jetmax':
        return 1;
      case 'Journey':
        return 150;
      case 'Kalahari':
        return 120;
      case 'Kamacho':
        return 200;
      case 'Khamelion':
        return 230;
      case 'Khanjali':
        return 1;
      case 'Kuruma':
        return 220;
      case 'Landstalker':
        return 180;
      case 'Lazer':
        return 1;
      case 'LE7B':
        return 330;
      case 'Lectro':
        return 260;
      case 'Lguard':
        return 260;
      case 'Lurcher':
        return 200;
      case 'Luxor':
        return 1;
      case 'Luxor2':
        return 1;
      case 'Lynx':
        return 270;
      case 'Mamba':
        return 200;
      case 'Mammatus':
        return 1;
      case 'Manana':
        return 170;
      case 'Manchez':
        return 200;
      case 'Marquis':
        return 1;
      case 'Massacro':
        return 277;
      case 'Massacro2':
        return 280;
      case 'Maverick':
        return 1;
      case 'Menacer':
        return 180;
      case 'Mesa':
        return 200;
      case 'Mesa2':
        return 200;
      case 'Mesa3':
        return 200;
      case 'Michelli':
        return 230;
      case 'Microlight':
        return 1;
      case 'Miljet':
        return 1;
      case 'Minivan':
        return 190;
      case 'Minivan2':
        return 190;
      case 'Mixer':
        return 160;
      case 'Mixer2':
        return 160;
      case 'Mogul':
        return 1;
      case 'Molotok':
        return 1;
      case 'Monroe':
        return 210;
      case 'Monster3':
        return 200;
      case 'Monster4':
        return 200;
      case 'Monster5':
        return 200;
      case 'Moonbeam':
        return 180;
      case 'Moonbeam2':
        return 180;
      case 'Mower':
        return 30;
      case 'Mule':
        return 170;
      case 'Mule2':
        return 170;
      case 'Mule3':
        return 170;
      case 'Mule4':
        return 170;
      case 'Nemesis':
        return 240;
      case 'Neon':
        return 270;
      case 'Nero':
        return 350;
      case 'Nero2':
        return 350;
      case 'Nightblade':
        return 220;
      case 'Nightshade':
        return 220;
      case 'Nightshark':
        return 180;
      case 'Nimbus':
        return 1;
      case 'Ninef':
        return 220;
      case 'Ninef2':
        return 220;
      case 'Nokota':
        return 1;
      case 'Omnis':
        return 230;
      case 'Oppressor':
        return 1;
      case 'Oppressor2':
        return 1;
      case 'Oracle':
        return 220;
      case 'Oracle2':
        return 220;
      case 'Osiris':
        return 331;
      case 'Packer':
        return 170;
      case 'Panto':
        return 150;
      case 'Paradise':
        return 160;
      case 'Pariah':
        return 250;
      case 'Patriot':
        return 180;
      case 'Patriot2':
        return 180;
      case 'PBus':
        return 170;
      case 'PBus2':
        return 170;
      case 'PCJ':
        return 260;
      case 'Penetrator':
        return 290;
      case 'Penumbra':
        return 210;
      case 'Peyote':
        return 140;
      case 'Pfister811':
        return 294;
      case 'Phantom':
        return 170;
      case 'Phantom2':
        return 170;
      case 'Phantom3':
        return 170;
      case 'Phoenix':
        return 210;
      case 'Picador':
        return 160;
      case 'Pigalle':
        return 140;
      case 'Police':
        return 290;
      case 'Police2':
        return 290;
      case 'Police3':
        return 290;
      case 'Police4':
        return 290;
      case 'Policeb':
        return 290;
      case 'PoliceBuffalo':
        return 290;
      case 'PoliceOld1':
        return 290;
      case 'PoliceOld2':
        return 290;
      case 'PoliceT':
        return 250;
      case 'Polmav':
        return 1;
      case 'Pony':
        return 170;
      case 'Pony2':
        return 170;
      case 'Pounder':
        return 170;
      case 'Pounder2':
        return 170;
      case 'Prairie':
        return 160;
      case 'Pranger':
        return 280;
      case 'Predator':
        return 280;
      case 'Premier':
        return 160;
      case 'Primo':
        return 160;
      case 'Primo2':
        return 160;
      case 'PropTrailer':
        return 1;
      case 'Prototipo':
        return 350;
      case 'Pyro':
        return 1;
      case 'Radi':
        return 150;
      case 'Raiden':
        return 240;
      case 'RakeTrailer':
        return 1;
      case 'RancherXL':
        return 170;
      case 'RancherXL2':
        return 170;
      case 'RapidGT':
        return 210;
      case 'RapidGT2':
        return 210;
      case 'RapidGT3':
        return 190;
      case 'Raptor':
        return 170;
      case 'Ratbike':
        return 160;
      case 'RatLoader':
        return 140;
      case 'RatLoader2':
        return 180;
      case 'Rcbandito':
        return 1;
      case 'Reaper':
        return 350;
      case 'Rebel':
        return 140;
      case 'Rebel2':
        return 180;
      case 'Regina':
        return 140;
      case 'RentalBus':
        return 170;
      case 'Retinue':
        return 230;
      case 'Revolter':
        return 230;
      case 'Rhapsody':
        return 150;
      case 'Rhino':
        return 1;
      case 'Riata':
        return 200;
      case 'Riot':
        return 200;
      case 'Riot2':
        return 200;
      case 'Ripley':
        return 60;
      case 'Rocoto':
        return 190;
      case 'Rogue':
        return 1;
      case 'Romero':
        return 170;
      case 'Rubble':
        return 170;
      case 'Ruffian':
        return 260;
      case 'Ruiner':
        return 170;
      case 'Ruiner2':
        return 170;
      case 'Ruiner3':
        return 170;
      case 'Rumpo2':
        return 170;
      case 'Rumpo3':
        return 200;
      case 'Ruston':
        return 207;
      case 'Sabre':
        return 180;
      case 'SabreGT':
        return 190;
      case 'SabreGT2':
        return 190;
      case 'Sadler':
        return 170;
      case 'Sadler2':
        return 170;
      case 'Sanchez':
        return 200;
      case 'Sanchez2':
        return 200;
      case 'Sanctus':
        return 230;
      case 'Sandking':
        return 180;
      case 'Sandking2':
        return 180;
      case 'Savage':
        return 1;
      case 'Savestra':
        return 240;
      case 'SC1':
        return 280;
      case 'Scarab':
        return 170;
      case 'Scarab2':
        return 170;
      case 'Scarab3':
        return 170;
      case 'Schafter2':
        return 210;
      case 'Schafter3':
        return 230;
      case 'Schafter4':
        return 210;
      case 'Schlagen':
        return 304;
      case 'Schwarzer':
        return 250;
      case 'Scorcher':
        return 30;
      case 'Scramjet':
        return 1;
      case 'Scrap':
        return 170;
      case 'Seabreeze':
        return 1;
      case 'Seashark':
        return 1;
      case 'Seashark2':
        return 1;
      case 'Seashark3':
        return 1;
      case 'Seasparrow':
        return 1;
      case 'Seminole':
        return 190;
      case 'Seminole2':
        return 1;
      case 'Sentinel':
        return 200;
      case 'Sentinel2':
        return 200;
      case 'Sentinel3':
        return 200;
      case 'Serrano':
        return 190;
      case 'Seven70':
        return 280;
      case 'Shamal':
        return 1;
      case 'Sheava':
        return 280;
      case 'Sheriff':
        return 290;
      case 'Sheriff2':
        return 290;
      case 'Shotaro':
        return 310;
      case 'SlamVan':
        return 200;
      case 'SlamVan2':
        return 215;
      case 'SlamVan3':
        return 220;
      case 'SlamVan4':
        return 220;
      case 'SlamVan5':
        return 220;
      case 'SlamVan6':
        return 220;
      case 'Smuggler':
        return 200;
      case 'Sovereign':
        return 250;
      case 'Specter':
        return 285;
      case 'Specter2':
        return 310;
      case 'Speeder':
        return 1;
      case 'Speeder2':
        return 1;
      case 'Speedo2':
        return 170;
      case 'Speedo4':
        return 170;
      case 'Squalo':
        return 1;
      case 'Stafford':
        return 130;
      case 'Stalion':
        return 175;
      case 'Stalion2':
        return 175;
      case 'Stanier':
        return 180;
      case 'Starling':
        return 1;
      case 'Stinger':
        return 200;
      case 'StingerGT':
        return 210;
      case 'Stockade':
        return 170;
      case 'Stockade3':
        return 170;
      case 'Stratum':
        return 170;
      case 'Streiter':
        return 230;
      case 'Stretch':
        return 170;
      case 'Strikeforce':
        return 1;
      case 'Stromberg':
        return 240;
      case 'Stunt':
        return 1;
      case 'Submersible':
        return 1;
      case 'Submersible2':
        return 1;
      case 'Sultan':
        return 221;
      case 'SultanRS':
        return 281;
      case 'Suntrap':
        return 1;
      case 'Superd':
        return 200;
      case 'Supervolito':
        return 1;
      case 'Supervolito2':
        return 1;
      case 'Surano':
        return 240;
      case 'Surfer':
        return 170;
      case 'Surfer2':
        return 170;
      case 'Surge':
        return 170;
      case 'Swift':
        return 1;
      case 'Swift2':
        return 1;
      case 'Swinger':
        return 210;
      case 'T20':
        return 345;
      case 'Taco':
        return 160;
      case 'Tailgater':
        return 225;
      case 'Taipan':
        return 335;
      case 'Tampa':
        return 210;
      case 'Tampa2':
        return 270;
      case 'Tampa3':
        return 200;
      case 'Tanker':
        return 1;
      case 'Tanker2':
        return 1;
      case 'Taxi':
        return 186;
      case 'Technical':
        return 200;
      case 'Technical2':
        return 200;
      case 'Technical3':
        return 200;
      case 'Tempesta':
        return 290;
      case 'Terbyte':
        return 150;
      case 'Tezeract':
        return 350;
      case 'Thrust':
        return 240;
      case 'Thruster':
        return 1;
      case 'TipTruck':
        return 170;
      case 'TipTruck2':
        return 170;
      case 'Titan':
        return 1;
      case 'Torero':
        return 267;
      case 'Tornado':
        return 180;
      case 'Tornado2':
        return 180;
      case 'Tornado3':
        return 170;
      case 'Tornado4':
        return 170;
      case 'Tornado5':
        return 180;
      case 'Tornado6':
        return 250;
      case 'Toro':
        return 1;
      case 'Toro2':
        return 1;
      case 'Toros':
        return 280;
      case 'Tourbus':
        return 170;
      case 'TowTruck':
        return 1;
      case 'TowTruck2':
        return 1;
      case 'Tractor':
        return 70;
      case 'Tractor2':
        return 70;
      case 'Tractor3':
        return 70;
      case 'Trash':
        return 120;
      case 'Trash2':
        return 120;
      case 'TriBike':
        return 50;
      case 'TriBike2':
        return 50;
      case 'TriBike3':
        return 50;
      case 'TrophyTruck':
        return 230;
      case 'TrophyTruck2':
        return 230;
      case 'Tropic':
        return 1;
      case 'Tropic2':
        return 1;
      case 'Tropos':
        return 288;
      case 'Tula':
        return 1;
      case 'Tulip':
        return 170;
      case 'Turismo2':
        return 285;
      case 'Turismor':
        return 340;
      case 'Tyrant':
        return 330;
      case 'Tyrus':
        return 330;
      case 'Vacca':
        return 300;
      case 'Vader':
        return 260;
      case 'Vagner':
        return 340;
      case 'Vamos':
        return 170;
      case 'Velum':
        return 1;
      case 'Velum2':
        return 1;
      case 'Verlierer2':
        return 240;
      case 'Vestra':
        return 1;
      case 'Vigero':
        return 180;
      case 'Vigilante':
        return 1;
      case 'Vindicator':
        return 240;
      case 'Virgo':
        return 170;
      case 'Virgo2':
        return 170;
      case 'Virgo3':
        return 170;
      case 'Viseris':
        return 250;
      case 'Visione':
        return 1;
      case 'Voltic':
        return 260;
      case 'Voodoo':
        return 170;
      case 'Voodoo2':
        return 160;
      case 'Vortex':
        return 285;
      case 'Warrener':
        return 210;
      case 'Washington':
        return 190;
      case 'Windsor':
        return 211;
      case 'Windsor2':
        return 211;
      case 'Wolfsbane':
        return 211;
      case 'XA21':
        return 330;
      case 'XLS':
        return 200;
      case 'Yosemite':
        return 220;
      case 'Youga':
        return 185;
      case 'Youga2':
        return 185;
      case 'Z190':
        return 190;
      case 'Zentorno':
        return 349;
      case 'Zion':
        return 230;
      case 'Zion2':
        return 230;
      case 'Zombiea':
        return 220;
      case 'Zombieb':
        return 220;
      case 'ZType':
        return 210;
      case 'Caracara2':
        return 240;
      case 'Dynasty':
        return 150;
      case 'Emerus':
        return 345;
      case 'Hellion':
        return 166;
      case 'Krieger':
        return 350;
      case 'Loсust':
        return 280;
      case 'Nebula':
        return 150;
      case 'Neo':
        return 330;
      case 'Rrocket':
        return 250;
      case 'S80':
        return 340;
      case 'Thrax':
        return 370;
      case 'Zion3':
        return 210;
      case 'Drafter':
        return 298;
      case 'Gauntlet3':
        return 240;
      case 'Gauntlet4':
        return 298;
      case 'Issi7':
        return 250;
      case 'Jugular':
        return 290;
      case 'Paragon':
        return 280;
      case 'Paragon2':
        return 260;
      case 'Peyote2':
        return 280;
      case 'Zorrusso':
        return 320;
      case 'Novak':
        return 270;
      case 'Deluxo':
        return 240;
    }
    return 1;
  },

  spawnJobCar: (x: number, y: number, z: number, heading: number, name: any, job: any) => {
    user.setWaypoint(x, y);
    mp.game.ui.notifications.show('Нажмите ~g~2~s~ рядом с ТС, чтобы его открыть');
    mp.game.ui.notifications.show('Транспорт стоит на парковке');
    mp.events.callRemote('server:vehicles:spawnJobCar', x, y, z, heading, name, job);
  },
  
  findVehicleByNumber: (number: string): any => {
    methods.debug('vehicles.findVehicleByNumber');
    let returnVehicle = null;
    try {
      mp.vehicles.forEach((vehicle) => {
        if (!mp.vehicles.exists(vehicle)) return;
        if (vehicle.numberPlate == number) returnVehicle = vehicle;
      });
    } catch (e) {
      methods.debug(e);
    }
    return returnVehicle;
  },

};


mp.events.add('entityStreamIn', (entity:VehicleMp) => {
  if(entity.type != "vehicle") return;
  if(entity.getVariable('engine')) entity.setEngineOn(true, true, false)
  else entity.setEngineOn(false, true, false)
  entity.setUndriveable(entity.getVariable('engine') ? false : true)
});

mp.events.addDataHandler("engine", (entity:VehicleMp, value) => {
  if(!value) entity.setEngineOn(false, true, false)
  else entity.setEngineOn(true, true, false)
  entity.setUndriveable(value ? false : true)
});

mp.events.add('entityStreamIn', (entity:VehicleMp) => {
  if(entity.type != "vehicle") return;
  if (entity.getVariable('freezePosition')) entity.freezePosition(true)
});

mp.events.addDataHandler("freezePosition", (entity:VehicleMp, value) => {
  if (!value) entity.freezePosition(false)
  else entity.freezePosition(true)
});


mp.events.add('entityStreamIn', (entity:VehicleMp) => {
  if(entity.type != "vehicle") return;
  if (entity.getVariable('anchor')) mp.game.invoke('0x75DBEC174AEEAD10', entity.handle, true)
});

mp.events.addDataHandler("anchor", (entity:VehicleMp, value) => {
  if (!value) mp.game.invoke('0x75DBEC174AEEAD10', entity.handle, false)
  else mp.game.invoke('0x75DBEC174AEEAD10', entity.handle, true)
});

setInterval(() => {
  if(!mp.players.local.vehicle) return;
  if(!mp.players.local.vehicle.remoteId) return;
  if (registerDrawNow) return;
  if (testDriveMode) return;
  const vehicle = mp.players.local.vehicle;
  if(vehicle.getVariable('engine')) vehicle.setEngineOn(true, true, true)
  else vehicle.setEngineOn(false, true, true)
  vehicle.setUndriveable(vehicle.getVariable('engine') ? false : true)
}, 700)

setTimeout(() => {
  mp.events.register('getGround', () => {
    return mp.game.gameplay.getGroundZFor3dCoord(
      mp.players.local.position.x,
      mp.players.local.position.y,
      mp.players.local.position.z,
      0.0,
      false
    );
  })
}, 1000)

export { vehicles };
