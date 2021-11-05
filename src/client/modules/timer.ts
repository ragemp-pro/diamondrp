import { user } from '../user';
import {weather} from '../managers/weather';
import { methods } from './methods';
import { weapons } from '../weapons';
import {vehicles} from '../vehicles';
import {Container} from './data';
import { ui } from './ui';
import {vSync} from '../managers/vSync';
import {inventory} from '../inventory';
import {enums} from '../enums';
import {dispatcher} from '../managers/dispatcher';
import { gui } from './gui';

let EntityFleeca = 0;
let EntityOther1 = 0;
let EntityOther2 = 0;
let EntityOther3 = 0;

let isDisableControl = false;
let allModelLoader = false;
let allVehiclesLoader = false;
// let afkTimer = 0;
// let afkLastPos = new mp.Vector3(0, 0, 0);

let deathTimer = 0;

let prevPos = new mp.Vector3(0, 0, 0);
let prevWpPos = new mp.Vector3(0, 0, 0);

let timer = {
  setDeathTimer: (sec: number) => {
    deathTimer = sec;
    if (sec > 0) ui.showDeathTimer();
    else ui.hideDeathTimer();
  },
  
  getDeathTimer: () => {
    return deathTimer;
  },
  
  twoMinTimer: () => {
    methods.showHelpNotify();
  
    let veh = mp.players.local.vehicle;
    if (veh && mp.vehicles.exists(veh) && veh.getClass() == 18 && !user.isGos()) {
      if (veh.getPedInSeat(-1) == mp.players.local.handle) {
        user.giveWanted(10, 'Угон служебного ТС');
        dispatcher.send(`Код 0`, `Неизвестный угнал служебный транспорт`);
      }
    }
  
    setTimeout(timer.twoMinTimer, 1000 * 60 * 2);
  
    return;
  },

  oneMinTimer: () => {
    // if (methods.distanceToPos(afkLastPos, mp.players.local.position) < 1) {
    //   afkTimer++;
    //   if (afkTimer > 10) user.setVariable('isAfk', true);
    // } else {
    //   if (mp.players.local.getVariable('isAfk')) user.setVariable('isAfk', false);
    //   afkTimer = 0;
    // }
  
    // afkLastPos = mp.players.local.position;
  
    // setTimeout(timer.oneMinTimer, 1000 * 60);
  },
  
  min15Timer: () => {
    user.saveAccount();
    setTimeout(timer.min15Timer, 1000 * 60 * 16);
  },
  
  ms300Timer: () => {
    gui.updateHud();
    isDisableControl = vehicles.checkerControl();  
    if (Container.HasLocally(0, 'hasSeat')) {
      mp.players.local.freezePosition(true);
      mp.players.local.setCollision(false, false);
    }
    setTimeout(timer.ms300Timer, 300);
  },
  
  twoSecTimer: () => {
    if (user.isLogin())
      inventory.updateInfo(
        user.get('rp_name'),
        user.getLevel(),
        ``
      );
  
    let plPos = mp.players.local.position;
  
    EntityFleeca = mp.game.object.getClosestObjectOfType(
      plPos.x,
      plPos.y,
      plPos.z,
      0.68,
      506770882,
      false,
      false,
      false
    );
    EntityOther1 = mp.game.object.getClosestObjectOfType(
      plPos.x,
      plPos.y,
      plPos.z,
      0.68,
      -1126237515,
      false,
      false,
      false
    );
    EntityOther2 = mp.game.object.getClosestObjectOfType(
      plPos.x,
      plPos.y,
      plPos.z,
      0.68,
      -1364697528,
      false,
      false,
      false
    );
    EntityOther3 = mp.game.object.getClosestObjectOfType(
      plPos.x,
      plPos.y,
      plPos.z,
      0.68,
      -870868698,
      false,
      false,
      false
    );
  
    if ((EntityFleeca != 0 || EntityOther1 != 0 || EntityOther2 != 0 || EntityOther3 != 0) && !mp.gui.cursor.visible)
      mp.game.ui.notifications.show('Нажмите ~g~E~s~ чтобы открыть меню банкомата');
  
    // if (user.isLogin() && !user.isAdmin()) {
    //   if (
    //     mp.players.local.getInvincible() ||
    //     mp.players.local.getMaxHealth() >= 1000 ||
    //     mp.players.local.health >= 1000
    //   ) {
    //     user.kickAntiCheat('GodMode');
    //   }
    // }
  
    setTimeout(timer.twoSecTimer, 2000);
  },

  allModelLoader: () => {
    allModelLoader = !allModelLoader;
    if (allModelLoader) mp.game.ui.notifications.show('Прогрузка моделей ~g~включена');
    else mp.game.ui.notifications.show('Прогрузка моделей ~r~выключена');
  },
  
  allVehiclesLoader: () => {
    allVehiclesLoader = !allVehiclesLoader;
    if (allVehiclesLoader) mp.game.ui.notifications.show('Прогрузка моделей транспорта ~g~включена');
    else mp.game.ui.notifications.show('Прогрузка моделей транспорта ~r~выключена');
  },
  
  tenSecTimer: () => {
    if (user.isLogin()) vSync.syncToServer();
  
    if (allModelLoader) {
      try {
        mp.game.invoke('0xBD6E84632DD4CB3F');
      } catch (e) {
        methods.debug(e);
      }
    }
  
    if (allVehiclesLoader) {
      let vehInfo = <any>enums.get('vehicleInfo');
      for (let item in vehInfo) {
        try {
          let vItem = vehInfo[item];
          mp.game.streaming.requestModel(mp.game.joaat(vItem.display_name.toString().toLowerCase()));
        } catch (e) {
          methods.debug(e);
        }
      }
    }
  
    weapons.hashesMap.forEach((item) => {
      let hash = item[1] / 2;
      if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false)) {
        if (Container.HasLocally(0, hash.toString())) {
          Container.ResetLocally(0, hash.toString());
          Container.Reset(mp.players.local.remoteId, hash.toString());
        }
      }
    });
  
    setTimeout(timer.tenSecTimer, 10000);
  },

  secTimer: () => {
    if (deathTimer > 0) {
      deathTimer--;
  
      ui.updateDeathTimer(deathTimer);
  
      if (deathTimer == 0) {
        user.showLoadDisplay(500);
  
        timer.setDeathTimer(0);
  
        let hospPos = new mp.Vector3(294.3142, -1350.633, 23.53781);
        //mp.players.local.resurrect();
        mp.players.local.clearBloodDamage();
        //mp.players.local.position = hospPos;
        //mp.players.local.health = 100;
        mp.players.local.freezePosition(false);
  
        // Перестраховочка
        if (!user.isGos()) user.removeAllWeapons();
        else if ((weather.getHour() > 20 || weather.getHour() < 6) && user.isGos())
          user.removeAllWeapons();
  
        if (user.isSheriff()) user.respawn(-242.5556, 6326.2358, 31.4261);
        else user.respawn(288.61148, -1345.5358, 23.5378017);
        user.setVirtualWorld(0);
  
        mp.game.ui.displayRadar(true);
        mp.game.ui.displayHud(true);
        //mp.game.ui.setMinimapVisible(false);
  
        if (user.get('jail_time') == 0) {
          if (!user.isSheriff() && !user.isAdmin()) {
            if (user.get('med_lic')) user.setData('med_time', 200);
            else user.setData('med_time', 500);
          }
        }
  
        mp.events.callRemote('playerDeathDone');
  
        user.setGrabMoney(0);
        user.unCuff();
        user.unTie();
  
        setTimeout(function() {
          user.hideLoadDisplay();
        }, 1000);
      }
  
      if (!user.isDead()) timer.setDeathTimer(0);
    }
  
    /**   Drug Types
          - Amf 0
          - Coca 1
          - Dmt 2
          - Ket 3
          - Lsd 4
          - Mef 5
          - Marg 6
      */
    let drugId = 0;
  
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }
  
      if (!mp.game.graphics.getScreenEffectIsActive('DrugsMichaelAliensFightIn'))
        mp.game.graphics.startScreenEffect('DrugsMichaelAliensFightIn', 0, true);
  
      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('DrugsMichaelAliensFightIn');
        mp.game.graphics.startScreenEffect('DrugsMichaelAliensFightOut', 0, false);
        setTimeout(function() {
          mp.game.graphics.stopScreenEffect('DrugsMichaelAliensFightOut');
        }, 10000);
      }
    }
  
    drugId = 1;
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }
  
      if (!mp.game.graphics.getScreenEffectIsActive('DrugsTrevorClownsFightIn'))
        mp.game.graphics.startScreenEffect('DrugsTrevorClownsFightIn', 0, true);
      
      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('DrugsTrevorClownsFightIn');
        mp.game.graphics.startScreenEffect('DrugsTrevorClownsFightOut', 0, false);
        setTimeout(function() {
          mp.game.graphics.stopScreenEffect('DrugsTrevorClownsFightOut');
        }, 10000);
      }
      
    }
  
    drugId = 2;
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }
  
      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (!mp.game.graphics.getScreenEffectIsActive('DMT_flight'))
        mp.game.graphics.startScreenEffect('DMT_flight', 0, true);
  
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('DMT_flight');
      }
    }
  
    drugId = 3;
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }

      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (!mp.game.graphics.getScreenEffectIsActive('Rampage'))
        mp.game.graphics.startScreenEffect('Rampage', 0, true);
  
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('Rampage');
      }
    }
  
    drugId = 4;
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }
  
      if (!mp.game.graphics.getScreenEffectIsActive('DrugsDrivingIn'))
        mp.game.graphics.startScreenEffect('DrugsDrivingIn', 0, true);
  
      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('DrugsDrivingIn');
        mp.game.graphics.startScreenEffect('DrugsDrivingOut', 0, false);
        setTimeout(function() {
          mp.game.graphics.stopScreenEffect('DrugsDrivingOut');
        }, 10000);
      }
      
    }
  
    drugId = 5;
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }
  
      if (!mp.game.graphics.getScreenEffectIsActive('PeyoteEndIn'))
        mp.game.graphics.startScreenEffect('PeyoteEndIn', 0, true);
  
      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('PeyoteEndIn');
        mp.game.graphics.startScreenEffect('PeyoteEndOut', 0, false);
        setTimeout(function() {
          mp.game.graphics.stopScreenEffect('PeyoteEndOut');
        }, 10000);
      }
      
    }
  
    drugId = 99;
    if (user.getDrugLevel(drugId) > 0) {
      user.removeDrugLevel(drugId, 1);
  
      if (user.getDrugLevel(drugId) > 210) {
        mp.gui.chat.push(`!{03A9F4}Вы в коме от передозировки`);
        user.setHeal(0);
      }
  

      if (user.isDead()) user.setDrugLevel(drugId, 0)
      if (!mp.game.graphics.getScreenEffectIsActive('ChopVision'))
        mp.game.graphics.startScreenEffect('ChopVision', 0, true);
  
      if (user.getDrugLevel(drugId) < 1) {
        mp.game.graphics.stopScreenEffect('ChopVision');
      }
      
    }

  
    if (user.has('id')) {
      if (user.currentId - 1000000 != user.get('id')) {
        mp.gui.chat.push(
          `!{03A9F4}Ой, ну зря ты попытался сменить ID. Логи были отправлены администрации, ВАМ БАН!`
        );
        user.kickAntiCheat(`Cheat Engine`);
        methods.saveLog('CheatEngine', `${user.get('rp_name')} (${user.get('id')}) try change ID`);
        return;
      }
    }
  
    if (user.get('money') < -15000 || user.get('money_bank') < -15000) {
      user.kick(`Anti-Cheat System: Пожалуйста, свяжитесь с администрацией`);
      methods.saveLog('CheaterMoney', `${user.get('rp_name')} (${user.get('id')})`);
      return;
    }
    
  
    let wpPos = methods.getWaypointPosition();
    if (mp.players.local.vehicle && wpPos.x != 0 && wpPos.y != 0) {
      if (prevWpPos.x != wpPos.x && prevWpPos.y != wpPos.y)
        mp.events.callRemote('server:changeWaypointPos', wpPos.x, wpPos.y);
    }
    prevWpPos = wpPos;
  
    try {
      let time = weather.getFullRpDateTime().split('|');
      mp.events.call(
        'client:phone:updateValues',
        weather.getCurrentDayName(),
        time[1],
        time[0],
        weather.getWeatherTemp(),
        user.get('phone_code'),
        user.get('bank_prefix'),
        100
      );
    } catch (e) {
      methods.debug(e);
    }
  
    setTimeout(timer.secTimer, 1000);
  },

  loadAll: () => {
    timer.min15Timer();
    timer.twoMinTimer();
    timer.oneMinTimer();
    timer.twoSecTimer();
    timer.tenSecTimer();
    timer.secTimer();
    timer.ms300Timer();
  },
  
  isFleecaAtm: () => {
    return user.get('bank_prefix') == 2222 && EntityFleeca != 0;
  },
  
  isOtherAtm: () => {
    return (
      user.get('bank_prefix') > 0 && (EntityOther1 != 0 || EntityOther2 != 0 || EntityOther3 != 0)
    );
  },
};

mp.events.add('render', () => {
  if (isDisableControl) {
    mp.game.controls.disableControlAction(0, 21, true); //disable sprint
    mp.game.controls.disableControlAction(0, 24, true); //disable attack
    mp.game.controls.disableControlAction(0, 25, true); //disable aim
    mp.game.controls.disableControlAction(0, 47, true); //disable weapon
    mp.game.controls.disableControlAction(0, 58, true); //disable weapon
    mp.game.controls.disableControlAction(0, 263, true); //disable melee
    mp.game.controls.disableControlAction(0, 264, true); //disable melee
    mp.game.controls.disableControlAction(0, 257, true); //disable melee
    mp.game.controls.disableControlAction(0, 140, true); //disable melee
    mp.game.controls.disableControlAction(0, 141, true); //disable melee
    mp.game.controls.disableControlAction(0, 142, true); //disable melee
    mp.game.controls.disableControlAction(0, 143, true); //disable melee
    //mp.game.controls.disableControlAction(0, 75, true); //disable exit vehicle
    //mp.game.controls.disableControlAction(27, 75, true); //disable exit vehicle
    mp.game.controls.disableControlAction(0, 32, true); //move (w)
    mp.game.controls.disableControlAction(0, 34, true); //move (a)
    mp.game.controls.disableControlAction(0, 33, true); //move (s)
    mp.game.controls.disableControlAction(0, 35, true); //move (d)
    mp.game.controls.disableControlAction(0, 59, true);
    mp.game.controls.disableControlAction(0, 60, true);
  }
});

export { timer };
