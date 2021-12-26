/// <reference path="../declaration/client.ts" />
import '../util/newrage';
mp.events.add('web:browsers:urls', (q) => {
  let url = q[0]
  if (url.includes('ragebeta')) SET_RAGE_BETA()
});

if(!mp.console){
  Object.defineProperty(mp, "console", {
    writable: true
  })
  mp.console = {
    clear: console.clear,
    reset: console.clear,
    logInfo: console.info,
    logWarning: console.warn,
    logError: console.error,
    logFatal: console.error,
  }
  mp.console.clear();
  // SET_RAGE_BETA()
  mp.console.logInfo('ENABLE NEW RAGE MOD def')
} else {
  mp.console.clear();
}

import { ClientEvent } from './customEvent';

mp.events.container = ClientEvent.container;
mp.events.eventRemoteRequestId = ClientEvent.eventRemoteRequestId;
mp.events.eventRemoteRequestData = ClientEvent.eventRemoteRequestData;
mp.events.eventID = ClientEvent.eventID;
mp.events.containerLocal = ClientEvent.containerLocal;
mp.events.register = ClientEvent.register.bind(mp.events);
mp.events.registerLocal = ClientEvent.registerLocal.bind(mp.events);
mp.events.triggerLocal = ClientEvent.triggerLocal.bind(mp.events);
mp.events.triggerServer = ClientEvent.triggerServer.bind(mp.events);
mp.events.triggerBrowser = ClientEvent.triggerBrowser.bind(mp.events);
mp.events.callLocal = ClientEvent.callLocal.bind(mp.events);
mp.events.callServer = ClientEvent.callServer.bind(mp.events);
mp.events.callBrowser = ClientEvent.callBrowser.bind(mp.events);

import { gui } from './modules/gui';

mp.events.callRemote('setSocial', mp.game.invoke('0x198D161F458ECC7F'))

// import './managers/sitAnim';
import './modules/data';
import './modules/afk';
import './modules/pickups';
import './modules/test';
import './modules/events';
import './managers/sync';
import './managers/shooting';
import './managers/fingerpoint';
import './managers/anticheat';
import './managers/attach_system';
import './managers/anim_auto';
import './managers/npc';
import './managers/menu';
//import './managers/crouch'; v2545 update broken
import './managers/custom_sound';
import './modules/race2';
import './modules/socket';
import './modules/savezone';

import './customEvent';
import './ragevoice';
// import './voice';
import './fly';
import './control';


import { enums } from './enums';
import { items } from './items';
import { user } from './user';
import { methods } from './modules/methods';
import './betternotifs';
import { object } from './managers/object';
import { weapons } from './weapons';
import { trucker } from './jobs/trucker';
import { breakLight } from './managers/breakLight';


import './auth';
import './hud';
import './modules/spectate';
import './modules/doors';
import './modules/minigame';
import './modules/npc';
import './managers/autoschool';
import './managers/cameraRecord';
import './managers/sync.elements';

import './business/autosalon';

import './modules/spikes';

import './modules/casino_slot_machines';
import './modules/casino_roulette';
import './modules/casino_threecard_poker';
import './modules/casino_dice';

import './modules/skate';
import './modules/rappel';
import './managers/pickup.gift';
import './managers/admin';
import { SET_RAGE_BETA, RAGE_BETA } from '../util/newrage';



const player = mp.players.local;

try {
  user.showLoadDisplay(500);
  mp.gui.chat.show(false);


  //TODO Сделать нормальное шифрование
  for (let i = 0; i < weapons.hashesMap.length; i++) weapons.hashesMap[i][1] *= 2;

  enums.customIpl.forEach((item: any[]) => {
    object.createIpl(item[0], new mp.Vector3(item[1], item[2], item[3]), item[4]);
  });

  // mp.game.ped.setAiMeleeWeaponDamageModifier(1.5);
  // mp.game.player.setMeleeWeaponDefenseModifier(1.5);
  // mp.game.player.setWeaponDefenseModifier(1.5)

  // ui.init();
  // user.showLoadDisplay(500);
  methods.debug('Execute: index');
  items.loadItems();
  object.load();
  // npc.loadAll();
  trucker.loadAll();
  breakLight.timer();
  methods.requestIpls();

  //weather.secSyncTimer();
} catch (e) {
  methods.debug('Exception: index');
  methods.debug(e);
  console.error(e);
}

mp.events.add('guiStarted', () => {
  mp.gui.chat.show(true);
});

mp.events.add('setChatActiveInput', (active) => {
  gui.chatActive = active;
});

setInterval(() => {
  mp.game.invoke('0xF4F2C0D4EE209E20'); // Disable AFK Camera
}, 25000);

let halfBlockStep = false;
mp.events.add('render', () => {
  halfBlockStep = !halfBlockStep;
  if(!halfBlockStep) return;
  mp.events.call('renderHalf');
})

setTimeout(() => {
  if(!mp.game.dlc2.isDlcPresent(mp.game.joaat("fluorine4305_deadmoroz"))){
    // mp.events.callRemote("custom:norpfload")
  }
  mp.events.register("models:checkValid", (models:HashOrString[]) => {
    return new Promise(resolve => {
      let status = true;
      models.map(model => {
        mp.game.streaming.requestModel2(typeof model == "string" ? mp.game.joaat(model) : model)
        mp.game.streaming.requestModel(typeof model == "string" ? mp.game.joaat(model) : model)
        setTimeout(() => {
          if(!mp.game.streaming.isModelValid(typeof model == "string" ? mp.game.joaat(model) : model)) status = false;
        }, 800)
      })
      setTimeout(() => {
        return resolve(status);
      }, 1000)
    })
  })
}, 5000)

//
// setInterval(() => {
//   const me = mp.players.local
//   mp.players.forEach((pl) => {
//     if(pl == me) return;
//     if(user.isDead(pl)){
//       pl.resurrect();
//       pl.setToRagdoll(1000, 1000, 0, false, false, false)
//     }
//   })
// }, 1000)
