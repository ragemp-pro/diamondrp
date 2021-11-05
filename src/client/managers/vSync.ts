import { methods } from '../modules/methods';
import { user } from '../user';
import { vehicles } from '../vehicles';
import { RAGE_BETA } from '../../util/newrage';
// mp.game.vehicle.defaultEngineBehaviour = false;

let trailerHeal = 1000;
let radioInterval: any = null;
let currentSound;

let vSync = {
  updateValues: (entity: VehicleMp) => {
    if (RAGE_BETA) return;
    if (entity && mp.vehicles.exists(entity)) {
      let typeor = typeof entity.getVariable('vehicleSyncData');
      let actualData = entity.getVariable('vehicleSyncData');
      if (typeor !== 'undefined') {
        if (vehicles.isVehicleSirenValid(entity.model)) {
          entity.setSirenSound(true);
          entity.setSiren(false);
  
          let vehId = entity.remoteId;
  
          if (actualData.SirenState == 0) {
            entity.setSiren(false);
            vSync.stopSound(vehId, 'srn');
          } else if (actualData.SirenState == 1) {
            entity.setSiren(true);
            vSync.stopSound(vehId, 'srn');
          } else if (actualData.SirenState > 1 && actualData.SirenState < 5) {
            entity.setSiren(true);
            vSync.playSound(vehId, 'srn', vehicles.getSirenSound(entity.model, actualData.SirenState));
          }
        }
  
        //ntity.setEngineOn(actualData.Engine, true, false);
        // mp.game.invoke(methods.SET_VEHICLE_UNDRIVEABLE, entity.handle, true);
  
        entity.setDirtLevel(actualData.Dirt);
        entity.setIndicatorLights(1, actualData.IndicatorLeftToggle);
        entity.setIndicatorLights(0, actualData.IndicatorRightToggle);
  
        if(typeof entity.setInteriorLight == "function") entity.setInteriorLight(actualData.InteriorLight);
        entity.setTaxiLights(actualData.TaxiLight);
  
        /*for (x = 0; x < 8; x++) {
                  if (actualData.Door[x] === 1)
                      entity.setDoorOpen(x, false, false);
                  else if (actualData.Door[x] === 0)
                      entity.setDoorShut(x, true);
                  else
                      entity.setDoorBroken(x, true);
              }
  
              for (x = 0; x < 4; x++) {
                  if (actualData.Window[x] === 0) {
                      entity.fixWindow(x);
                  }
                  else if (actualData.Window[x] === 1) {
                      entity.rollDownWindow(x);
                  }
                  else {
                      entity.smashWindow(x);
                  }
              }
  
              for (x = 0; x < 8; x++) {
                  if (actualData.Wheel[x] === 0) {
                      entity.setTyreFixed(x);
                  }
                  else if (actualData.Wheel[x] === 1) {
                      entity.setTyreBurst(x, false, 0);
                  }
                  else {
                      entity.setTyreBurst(x, true, 1000);
                  }
              }
  
              //For trailer mid wheels
              if (actualData.Wheel[8] === 0) {
                  entity.setTyreFixed(45);
              }
              else if (actualData.Wheel[8] === 1) {
                  entity.setTyreBurst(45, false, 0);
              }
              else {
                  entity.setTyreBurst(45, true, 1000);
              }
  
              if (actualData.Wheel[9] === 0) {
                  entity.setTyreFixed(47);
              }
              else if (actualData.Wheel[9] === 1) {
                  entity.setTyreBurst(47, false, 0);
              }
              else {
                  entity.setTyreBurst(47, true, 1000);
              }*/
      } else {
        // setTimeout(function() {
        //   mp.events.callRemote('s:vSync:setEngineStatus', entity, false);
        //   vSync.updateValues(entity);
        // }, 2000);
      }
  
      //Make doors breakable again
      /*setTimeout(() => {
              try {
                  if (!mp.vehicles.exists(entity))
                      return;
  
                  for (x = 0; x < 8; x++) {
                      entity.setDoorBreakable(x, true);
                  }
              }
              catch (e) {
                  methods.debug(e);
              }
          }, 1500);*/
    }
  },

  playSound: (vehId: number, prefix: string, name: string) => {
    try {
      let veh = mp.vehicles.atRemoteId(vehId);
      if (veh !== undefined && mp.vehicles.exists(veh)) {
        if (vehicles.has(veh.remoteId, prefix + 'currentSound')) {
          let sId = vehicles.get(veh.remoteId, prefix + 'currentSound');
          mp.game.audio.stopSound(sId);
          mp.game.audio.releaseSoundId(sId);
          vehicles.reset(veh.remoteId, prefix + 'currentSound');
        }
  
        let sId = mp.game.invoke(methods.GET_SOUND_ID);
        mp.game.invoke(methods.PLAY_SOUND_FROM_ENTITY, sId, name, veh.handle, 0, 0, 0);
        vehicles.set(veh.remoteId, prefix + 'currentSound', sId);
      }
    } catch (e) {
      methods.debug(e);
    }
  },
  
  stopSound: (vehId: number, prefix: string) => {
    try {
      let veh = mp.vehicles.atRemoteId(vehId);
      if (veh !== undefined && mp.vehicles.exists(veh)) {
        if (vehicles.has(veh.remoteId, prefix + 'currentSound')) {
          let sId = vehicles.get(veh.remoteId, prefix + 'currentSound');
          mp.game.audio.stopSound(sId);
          mp.game.audio.releaseSoundId(sId);
          vehicles.reset(veh.remoteId, prefix + 'currentSound');
        }
      }
    } catch (e) {
      methods.debug(e);
    }
  },

  syncToServer: (entity?: VehicleMp) => {
    if (RAGE_BETA) return;
    try {
      if (entity === undefined) {
        if (!mp.players.local.vehicle) return;
  
        entity = mp.players.local.vehicle;
        if (entity.getPedInSeat(-1) != mp.players.local.handle) return;
      }
  
      let typeor = typeof entity.getVariable('vehicleSyncData');
      let actualData = entity.getVariable('vehicleSyncData');
      let trailerId = entity.getVariable('trailer');
  
      if (trailerId) {
        let trailer = mp.vehicles.atRemoteId(trailerId);
        if (mp.vehicles.exists(trailer)) {
          if (methods.parseInt(trailerHeal) != methods.parseInt(trailer.getBodyHealth())) {
            trailerHeal = methods.parseInt(trailer.getBodyHealth());
            mp.events.callRemote('s:vSync:setBodyHealth', trailer, trailerHeal);
          }
        }
      }
  
      if (typeor !== 'undefined') {
        /*var Status = [];
              let y = 0;
              for (y = 0; y < 8; y++) {
                  if (entity.isDoorDamaged(y)) {
                      Status.push(2);
                  }
                  else if (entity.getDoorAngleRatio(y) > 0.15) {
                      Status.push(1);
                  }
                  else {
                      Status.push(0);
                  }
              }
  
              if (actualData.Door[0] != Status[0] || actualData.Door[1] != Status[1] || actualData.Door[2] != Status[2] || actualData.Door[3] != Status[3] || actualData.Door[4] != Status[4] || actualData.Door[5] != Status[5] || actualData.Door[6] != Status[6] || actualData.Door[7] != Status[7])
                  mp.events.callRemote("s:vSync:setDoorData", entity, Status[0], Status[1], Status[2], Status[3], Status[4], Status[5], Status[6], Status[7]);*/
  
        var Status = [];
        /*if (entity.isWindowIntact(0)) {
                  if (entity.getBoneIndexByName("window_rf") === -1) {
                      Status.push(1);
                  }
                  else {
                      Status.push(0);
                  }
              }
              else {
                  Status.push(2);
              }
              if (entity.isWindowIntact(1)) {
                  if (entity.getBoneIndexByName("window_lf") === -1) {
                      Status.push(1);
                  }
                  else {
                      Status.push(0);
                  }
              }
              else {
                  Status.push(2);
              }
              if (entity.isWindowIntact(2)) {
                  if (entity.getBoneIndexByName("window_rr") === -1) {
                      Status.push(1);
                  }
                  else {
                      Status.push(0);
                  }
              }
              else {
                  Status.push(2);
              }
              if (entity.isWindowIntact(3)) {
                  if (entity.getBoneIndexByName("window_lr") === -1) {
                      Status.push(1);
                  }
                  else {
                      Status.push(0);
                  }
              }
              else {
                  Status.push(2);
              }
  
              if (actualData.Window[0] != Status[0] || actualData.Window[1] != Status[1] || actualData.Window[2] != Status[2] || actualData.Window[3] != Status[3])
                  mp.events.callRemote("s:vSync:setWindowData", entity.remoteId, Status[0], Status[1], Status[2], Status[3]);
  
              Status = [];
              if (!entity.isTyreBurst(0, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(0, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(1, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(1, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(2, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(2, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(3, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(3, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(4, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(4, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(5, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(5, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(6, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(6, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(7, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(7, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(45, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(45, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (!entity.isTyreBurst(47, false)) {
                  Status.push(0);
              }
              else if (entity.isTyreBurst(47, false)) {
                  Status.push(1);
              }
              else {
                  Status.push(2);
              }
  
              if (actualData.Wheel[0] != Status[0] || actualData.Wheel[1] != Status[1] || actualData.Wheel[2] != Status[2] || actualData.Wheel[3] != Status[3] || actualData.Wheel[4] != Status[4] || actualData.Wheel[5] != Status[5] || actualData.Wheel[6] != Status[6] || actualData.Wheel[7] != Status[7] || actualData.Wheel[8] != Status[8] || actualData.Wheel[9] != Status[9])
                  mp.events.callRemote("s:vSync:setWheelData", entity, Status[0], Status[1], Status[2], Status[3], Status[4], Status[5], Status[6], Status[7], Status[8], Status[9]);*/
  
        let dirtLevel = entity.getDirtLevel();
        if (methods.parseInt(actualData.Dirt) != methods.parseInt(dirtLevel))
          mp.events.callRemote('s:vSync:setDirtLevel', entity, dirtLevel);
  
        /*let engineStatus = entity.getIsEngineRunning() == 1;
              if (actualData.Engine != engineStatus)
                  mp.events.callRemote("s:vSync:setEngineStatus", entity, engineStatus);*/
      }
    } catch (e) {
      methods.debug(e);
    }
  },
};

mp.events.add('vSync:playerExitVehicle', (vehId) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      vSync.syncToServer(veh);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:playSound', (vehId, prefix, name) => {
  vSync.playSound(vehId, prefix, name);
});

mp.events.add('vSync:stopSound', (vehId, prefix) => {
  vSync.stopSound(vehId, prefix);
});

mp.events.add('vSync:setVehicleWindowStatus', (vehId, windw, state) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      if (state === 1) {
        veh.rollDownWindow(windw);
      } else if (state === 0) {
        veh.fixWindow(windw);
        veh.rollUpWindow(windw);
      } else {
        veh.smashWindow(windw);
      }
    }
  } catch (e) {
    methods.debug(e);
  }
});



setInterval(() => {
  if (RAGE_BETA) return;
  const veh = mp.players.local.vehicle
  if(!veh) return;
  let currentRadio = mp.game.invoke(methods.GET_PLAYER_RADIO_STATION_INDEX);
  let vehRadio = veh.getVariable('radioStation')
  if (veh.getPedInSeat(-1) == mp.players.local.handle) {
    if (currentRadio != vehRadio) mp.events.callRemote('vehicleRadio', currentRadio)
    // else {
    //   mp.game.invoke(methods.SET_FRONTEND_RADIO_ACTIVE, true);
    //   mp.game.invoke(methods.SET_RADIO_TO_STATION_INDEX, vehRadio);
    // }
  } else {
    if (!vehRadio || vehRadio == 255){
      mp.game.audio.setRadioToStationName("OFF");
    } else if (vehRadio){
      mp.game.invoke(methods.SET_FRONTEND_RADIO_ACTIVE, true);
      mp.game.invoke(methods.SET_RADIO_TO_STATION_INDEX, vehRadio);
    }
  }
}, 500)

mp.events.add('vSync:setVehicleWheelStatus', (vehId, wheel, state) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      if (wheel === 9) {
        if (state === 1) {
          veh.setTyreBurst(45, false, 1000);
        } else if (state === 0) {
          veh.setTyreFixed(45);
        } else {
          veh.setTyreBurst(45, true, 1000);
        }
      } else if (wheel === 10) {
        if (state === 1) {
          veh.setTyreBurst(47, false, 1000);
        } else if (state === 0) {
          veh.setTyreFixed(47);
        } else {
          veh.setTyreBurst(47, true, 1000);
        }
      } else {
        if (state === 1) {
          veh.setTyreBurst(wheel, false, 1000);
        } else if (state === 0) {
          veh.setTyreFixed(wheel);
        } else {
          veh.setTyreBurst(wheel, true, 1000);
        }
      }
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setVehicleDirt', (vehId, dirt) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      veh.setDirtLevel(dirt);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setVehicleDoorState', (vehId, door, state) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      if (state === 0) veh.setDoorShut(door, false);
      else if (state === 1) veh.setDoorOpen(door, false, false);
      else veh.setDoorBroken(door, true);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setEngineState', (vehId, status) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      /*mp.console.logInfo(vehId, status);
            mp.console.logInfo(mp.players.local.vehicle && mp.players.local.vehicle.remoteId == vehId);
            if ((mp.players.local.vehicle && mp.players.local.vehicle.remoteId == vehId) === true)
                veh.setEngineOn(status, false, false);
            else*/
      //veh.setEngineOn(status, true, false);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setInteriorLightState', (vehId, status) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      veh.setInteriorLight(status);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setTaxiLightState', (vehId, status) => {
  if (RAGE_BETA) return;
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      veh.setTaxiLights(status);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setIndicatorRightToggle', (vehId, status) => {
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      veh.setIndicatorLights(0, status);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setIndicatorLeftToggle', (vehId, status) => {
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      veh.setIndicatorLights(1, status);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setLockStatus', (vehId, status) => {
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      if (status) {
        mp.game.audio.playSoundFromEntity(
          1,
          'Remote_Control_Close',
          veh.handle,
          'PI_Menu_Sounds',
          true,
          0
        );
      } else {
        mp.game.audio.playSoundFromEntity(
          1,
          'Remote_Control_Open',
          veh.handle,
          'PI_Menu_Sounds',
          true,
          0
        );
      }
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('vSync:setSirenState', (vehId, state) => {
  try {
    let veh = mp.vehicles.atRemoteId(vehId);
    if (veh !== undefined && mp.vehicles.exists(veh)) {
      if (vehicles.isVehicleSirenValid(veh.model)) {
        // veh.setSiren(true);
        // @ts-ignore
        veh.setSirenSound(true);

        if (state == 0) {
          veh.setSiren(false);
          vSync.stopSound(vehId, 'srn');
        } else if (state == 1) {
          veh.setSiren(true);
          vSync.stopSound(vehId, 'srn');
        } else if (state > 1 && state < 5) {
          //veh.setSiren(true);
          vSync.playSound(vehId, 'srn', vehicles.getSirenSound(veh.model, state));
        }
      }
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.add('playerEnterVehicle', (entity, seat) => {
  if (entity !== undefined && mp.vehicles.exists(entity)) {
    vSync.updateValues(entity);
  }
});

mp.events.add('playerLeaveVehicle', (entity) => {
  mp.events.callRemote('s:vSync:stopSound', entity, 'wrng');
});

mp.keys.bind(0x45, true, function() {
  if (!user.isLogin()) return;
  let veh = mp.players.local.vehicle;
  if (!methods.isBlockKeys() && veh && vehicles.isVehicleSirenValid(veh.model)) {
    //mp.game.invoke(methods.PLAY_SOUND_FROM_ENTITY, 9999, vehicles.getWarningSound(mp.players.local.vehicle.model), mp.players.local.vehicle.handle, 0, 0, 0);
    mp.events.callRemote(
      's:vSync:playSound',
      veh,
      'wrng',
      vehicles.getWarningSound(mp.players.local.vehicle.model)
    );
  }
});

mp.keys.bind(0x45, false, function() {
  if (!user.isLogin()) return;
  let veh = mp.players.local.vehicle;
  if (!methods.isBlockKeys() && veh && vehicles.isVehicleSirenValid(veh.model)) {
    mp.events.callRemote('s:vSync:stopSound', veh, 'wrng');
  }
});

mp.keys.bind(0x51, true, function() {
  if (!user.isLogin()) return;
  let veh = mp.players.local.vehicle;
  if (!methods.isBlockKeys() && veh && vehicles.isVehicleSirenValid(veh.model)) {
    let typeor = typeof veh.getVariable('vehicleSyncData');
    let actualData = veh.getVariable('vehicleSyncData');

    if (typeor !== 'undefined') {
      if (actualData.SirenState == 0) {
        mp.game.audio.playSound(
          -1,
          'NAV_LEFT_RIGHT',
          'HUD_FRONTEND_DEFAULT_SOUNDSET',
          false,
          0,
          true
        );
        mp.events.callRemote('s:vSync:setSirenState', veh, 1);
      } else {
        mp.game.audio.playSound(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false, 0, true);
        mp.events.callRemote('s:vSync:setSirenState', veh, 0);
      }
    }
  }
});

mp.keys.bind(0xbc, true, function() {
  if (!user.isLogin()) return;
  let veh = mp.players.local.vehicle;
  if (!methods.isBlockKeys() && veh && vehicles.isVehicleSirenValid(veh.model)) {
    let typeor = typeof veh.getVariable('vehicleSyncData');
    let actualData = veh.getVariable('vehicleSyncData');

    if (typeor !== 'undefined') {
      if (actualData.SirenState > 0) {
        let currentState = actualData.SirenState;
        currentState--;
        if (currentState < 1) currentState = 4;

        mp.game.audio.playSound(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false, 0, true);
        mp.events.callRemote('s:vSync:setSirenState', veh, currentState);
      }
    }
  }
});

mp.keys.bind(0xbe, true, function() {
  if (!user.isLogin()) return;
  let veh = mp.players.local.vehicle;
  if (!methods.isBlockKeys() && veh && vehicles.isVehicleSirenValid(veh.model)) {
    let typeor = typeof veh.getVariable('vehicleSyncData');
    let actualData = veh.getVariable('vehicleSyncData');

    if (typeor !== 'undefined') {
      if (actualData.SirenState > 0) {
        let currentState = actualData.SirenState;
        currentState++;
        if (currentState > 4) currentState = 1;

        mp.game.audio.playSound(-1, 'NAV_UP_DOWN', 'HUD_FRONTEND_DEFAULT_SOUNDSET', false, 0, true);
        mp.events.callRemote('s:vSync:setSirenState', veh, currentState);
      } else {
        mp.events.callRemote(
          's:vSync:playSound',
          veh,
          'srn',
          vehicles.getSirenSound(mp.players.local.vehicle.model, 2)
        );
      }
    }
  }
});

mp.keys.bind(0xbe, false, function() {
  if (!user.isLogin()) return;
  let veh = mp.players.local.vehicle;
  if (!methods.isBlockKeys() && veh && vehicles.isVehicleSirenValid(veh.model)) {
    let typeor = typeof veh.getVariable('vehicleSyncData');
    let actualData = veh.getVariable('vehicleSyncData');

    if (typeor !== 'undefined') {
      if (actualData.SirenState == 0) {
        mp.events.callRemote('s:vSync:stopSound', veh, 'srn');
      }
    }
  }
});



//Sync data on stream in
mp.events.add('entityStreamIn', (entity) => {
  try {
    if (entity.type === 'vehicle') {
      if (!mp.vehicles.exists(entity)) return;

      entity.trackVisibility();
      entity.setTyresCanBurst(true);

      // mp.game.invoke(methods.SET_VEHICLE_UNDRIVEABLE, entity.handle, true);
      vSync.updateValues(entity);

      //Set doors unbreakable for a moment
      /*let x = 0;
            for (x = 0; x < 8; x++) {
                entity.setDoorBreakable(x, false);
            }*/
    }
  } catch (e) {
    methods.debug(e);
  }
});

export { vSync };
