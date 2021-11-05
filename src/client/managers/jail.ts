import { methods } from '../modules/methods';
import {Container} from '../modules/data';
import { user } from '../user';
import {coffer} from '../coffer';
import { levelAccess } from '../../util/level';
import { healProtection } from '../modules/ach';

let _pos = new mp.Vector3(1707.69, 2546.69, 45.56);
let _posFree = new mp.Vector3(1849.444, 2601.747, 45.60717);
let _medPos = new mp.Vector3(288.61148, -1345.5358, 23.5378017);

let _izolPos1 = new mp.Vector3(1642.200927734375, 2570.389892578125, 44.56486129760742);
let _izolPos2 = new mp.Vector3(1651.0296630859375, 2570.64697265625, 44.56485366821289);
let _izolPos3 = new mp.Vector3(1629.5426025390625, 2571.131103515625, 44.56486892700195);

let prvTime = 0;

mp.events.add('server:fullHeal', () => {
  healProtection()
  user.set('med_time', 0);
  user.setData('med_time', 0);
  if (user.get('jail_time') == 0) prvTime = 0;
})
mp.events.add('server:jailworktime', (time:number) => {
  user.set('jail_time', time);
  prvTime = time;
})

let jail = {
  jailPos: _pos,
  timer: async () => {
    if (user.isLogin()) {
      if(user.get('med_time') > 0 && user.get('jail_time') > 0){
        user.set('med_time', 0);
        user.setData('med_time', 0);
        prvTime = user.get('jail_time');
      }
      if (user.get('med_time') < 0) user.setData('med_time', 0);
      if (user.get('med_time') > 1) {
        user.setData('med_time', user.get('med_time') - 1);
  
        if (typeof user.get('med_time') == "number"){
          setTimeout(() => {
            let vipData = user.getVipData()
            if (vipData) {
              if (vipData.healmultipler && user.get('med_time') > 3){
                user.setData('med_time', user.get('med_time') - 1);
              }
            }
          }, 500)
        }

        if (prvTime > user.get('med_time') + 20) {
          mp.gui.chat.push(
            `!{03A9F4}Здравствуйте, это была плохая идея. Всё равно не получится, да и администратор логи еще посмотрит. Оно того стоит?`
          );
          user.kickAntiCheat('Cheat Engine');
          methods.saveLog('CheatEngine', `${user.get('rp_name')} (${user.get('id')}) try unmed`);
          return;
        }
        prvTime = user.get('med_time') + methods.getRandomInt(1, 5);
  
        if (methods.distanceToPos(mp.players.local.position, _medPos) > 60) {
          mp.game.ui.notifications.show('~r~Вам необходимо проходить лечение');
          user.teleportv(_medPos);
        }
      }
  
      if (user.get('med_time') == 1) {
        user.setData('med_time', user.get('med_time') - 1);
        prvTime = user.get('med_time');
        jail.medFreePlayer();
      }
  
      if (user.get('jail_time') > 1) {
        if(mp.players.local.getVariable('isAfk')){
          mp.game.ui.notifications.show('~r~Время тюрьмы не идёт пока вы АФК');
        } else {
          user.setData('jail_time', user.get('jail_time') - 1);
        }
  
        if (prvTime > user.get('jail_time') + 20) {
          mp.gui.chat.push(
            `!{03A9F4}Очень плохая идея, вот очень. Всё равно не получится, да и администратор логи еще посмотрит. Оно того стоит?`
          );
          user.kickAntiCheat('Cheat Engine');
          methods.saveLog('CheatEngine', `${user.get('rp_name')} (${user.get('id')}) try unjail`);
          return;
        }
        prvTime = user.get('jail_time') + methods.getRandomInt(1, 5);
  
        if (user.get('med_time') > 0) user.setData('med_time', 0);
  
        if (!user.isDead()) {
          if (
            !Container.HasLocally(0, 'canRun') &&
            methods.distanceToPos(mp.players.local.position, _pos) > 200
          ) {
            mp.game.ui.notifications.show('~r~Попытка сбежать из тюрьмы');
  
            if (Container.HasLocally(0, 'izol')) {
              switch (Container.GetLocally(0, 'izol')) {
                case 1:
                  user.teleportv(_izolPos1);
                  break;
                case 2:
                  user.teleportv(_izolPos2);
                  break;
                default:
                  user.teleportv(_izolPos3);
                  break;
              }
            } else user.teleportv(_pos);
          }
        }
      }
      /*if (user.get('jail_time') < 1 && !user.isGos()) {
  
              if (methods.distanceToPos(mp.players.local.position, _pos) < 200) {
                  mp.game.ui.notifications.show("~r~Вам запрещено находится на этой территории");
                  user.teleportv(_posFree);
              }
          }*/
      if (user.get('jail_time') == 1) {
        user.setData('jail_time', user.get('jail_time') - 1);
        jail.jailFreePlayer();
      }
    }
  
    setTimeout(jail.timer, 1000);
  },

  setIzol: (type:number) => {
    Container.SetLocally(0, 'izol', type);
    switch (type) {
      case 1:
        user.teleportv(_izolPos1);
        break;
      case 2:
        user.teleportv(_izolPos2);
        break;
      default:
        user.teleportv(_izolPos3);
        type = 3;
        break;
    }
    user.setVirtualWorld(mp.players.local.remoteId + 1);
  },
  
  jailFreePlayer: async () => {
    prvTime = 0;
    user.set('jail_time', 0);
    user.setData('jail_time', 0);
    user.setData('jailed', false);
    user.setData('jailed_admin', 0);

    user.setVirtualWorld(0);
    if (
      Container.HasLocally(0, 'canRun') &&
      methods.distanceToPos(mp.players.local.position, _pos) < 200
    )
      user.teleportv(_posFree);
    else if (!Container.HasLocally(0, 'canRun')) user.teleportv(_posFree);
  
    mp.game.ui.notifications.show('~g~Вы отплатили свой долг. Теперь вы свободны.');
    user.updateCharacterCloth();
  
    Container.ResetLocally(0, 'izol');
    Container.ResetLocally(0, 'canRun');
  },

  medFreePlayer: (pay = true) => {
    user.set('med_time', 0);
    user.setData('med_time', 0);
    prvTime = 0;
    mp.game.ui.notifications.show('~g~Вы успешно прошли лечение');
  
    if(!pay) return;
    if (user.get('med_lic')) {
      user.removeMoney(10);
      coffer.addMoney(10);
      mp.game.ui.notifications.show('~g~Стоимость лечения со страховкой ~s~$10');
    } else {
      if (user.getLevel() <= levelAccess.healSkidka) {
        user.removeMoney(50);
        coffer.addMoney(50);
        mp.game.ui.notifications.show('~g~Стоимость лечения ~s~$50');
      } else {
        user.removeMoney(150);
        coffer.addMoney(150);
        mp.game.ui.notifications.show('~g~Стоимость лечения ~s~$150');
      }
    }
    //user.updateCharacterCloth();
  },
  
  jailPlayer: (sec:number, withIzol = false) => {
    try {
      sec = methods.parseInt(sec);
  
      user.unCuff();
      user.unTie();
  
      if (sec == 0) {
        jail.jailFreePlayer();
        if (!user.get('jailed_admin')) user.setData('wanted_level', 0);
        return;
      }
  
      if (user.get('jailed') === true) jail.setIzol(1);
      if (user.get('jailed_admin') === 1) jail.setIzol(1);
  
      if (withIzol) jail.setIzol(1);
      else user.teleportv(_pos);
  
      user.setGrabMoney(0);

      prvTime = sec
      user.setData('jail_time', sec);
      if (!user.get('jailed_admin')) user.setData('wanted_level', 0);
  
      mp.players.local.freezePosition(false);
      user.removeAllWeapons();
  
      if (user.getSex() == 1) {
        user.setComponentVariation(4, 3, 15);
        user.setComponentVariation(6, 5, 0);
        user.setComponentVariation(8, 60, 500);
        user.setComponentVariation(11, 0, 0);
        user.setComponentVariation(3, 0, 0);
      } else {
        if (methods.getRandomInt(0, 2) == 0) {
          user.setComponentVariation(3, 15, 0);
          user.setComponentVariation(11, 56, 1);
        } else {
          user.setComponentVariation(3, 0, 0);
          user.setComponentVariation(11, 56, 0);
        }
        user.setComponentVariation(4, 7, 15);
        user.setComponentVariation(8, 60, 500);
        user.setComponentVariation(6, 6, 0);
      }
  
      setTimeout(function() {
        user.updateCache().then();
      }, 5000);
    } catch (e) {
      methods.debug('Exception: jail.jailPlayer');
      methods.debug(e);
    }
  },
};

export { jail };
