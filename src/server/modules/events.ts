/// <reference path="../../declaration/server.ts" />
import { Container } from './data';
import { methods } from './methods';
import { pickups } from './pickups';
// import { mysql } from './mysql';
import { user } from '../user';
import { coffer } from '../coffer';
import { chat } from '../modules/chat';
import { vehicles } from '../vehicles';
import { houses } from '../houses';
import { condo } from '../condo';
import { stock } from '../stock';
import { apartments } from '../apartments';
import { business } from '../business';
import { enums } from '../enums';
import { inventory } from '../inventory';
import { weapons } from '../weapons';
import { weather } from '../managers/weather';
import { dispatcher, dispatchTaxiIdSet } from '../managers/dispatcher';
import { items } from '../items';
import { cloth } from '../business/cloth';
import { shop } from '../business/shop';
import { lsc } from '../business/lsc';
import { rent } from '../business/rent';
import { gun } from '../business/gun';
import { fuel } from '../business/fuel';
import { barberShop } from '../business/barberShop';
import { tattoo } from '../business/tattoo';
import { bar } from '../business/bar';
import { licenseCenter } from '../business/licenseCenter';
import { phone } from '../phone';
import { tax } from '../managers/tax';
import { trucker } from '../managers/trucker';
import { mafiaWar } from '../managers/mafiaWar';
import { bank } from '../business/bank';
import { autosalon } from '../business/autosalon/index';

import * as casinoSlotMachines from './casino_slot_machines';
import * as casinoRoulette from './casino_roulette';
import * as casinoThreeCardPoker from './casino_threecard_poker';
import * as casinoDice from './casino_dice';
import { mafiaCars, mafiaCarsCdtimer } from '../../util/sharedData';
import { menu } from './menu';
import { userEntity } from './entity/user';
import { customParams } from './admin';
import { getQuest } from '../config/quests';
import { blackListEntity } from './entity/blackList';
import { Op } from 'sequelize';
import { levelAccess } from '../../util/level';
import { log } from '../log';
import { fractionUtil } from '../../util/fractions';
import { RAGE_BETA } from '../../util/newrage';

let mafiaCarsCd:Map<string,boolean> = new Map();

export let sendMoney:Map<number,number> = new Map();
export const sendmoneymax = 500000000000
/*
mp.events.__add__ = mp.events.add;
// @ts-ignore
mp.events.add = (eventName: string, eventCallback: (...args: any[]) => void) => {
  const proxy = new Proxy(eventCallback, {
    apply: (target, thisArg, argumentsList) => {
      const entity = argumentsList[0];
      const entityType = entity ? entity.type : null;
      const entityName =
        entityType !== null
          ? entityType === 'player'
            ? entity.socialClub
            : `${entity.type}(${entity.id})`
          : null;

      const callText =
        entityName !== null ? `${entityName} call event ${eventName}` : `Event ${eventName} called`;

      methods.debug(callText);
      target.apply(thisArg, argumentsList);
      return;
    },
  });

  mp.events.__add__(eventName, proxy);
};

mp.events.addRemoteCounted = (eventName, handler) => {
  mp.events.add(eventName, function() {
    let plr = <PlayerMp>arguments[0];
    if(!mp.players.exists(plr)) return;

    if (++plr.countedTriggers > 50) {
      let dateNow = Date.now();

      if (dateNow - plr.countedTriggersSwap < 500) {
        methods.saveLog(
          'BugWithFlood',
          `${plr.socialClub} | ${user.getRpName(plr)} | ${eventName} | ${plr.countedTriggers}`
        );
        //plr.ban();
        user.kick(plr, 'Подозрение в не хороших вещах');
        //user.kickAntiCheat(plr, 'Buguse');
        return;
      } else {
        plr.countedTriggers = 0;
        plr.countedTriggersSwap = dateNow;
      }
    } else if (plr.countedTriggers > 20) {
      let dateNow = Date.now();

      if (dateNow - plr.countedTriggersSwap < 1000) {
        methods.saveLog(
          'BugWithFloodSlow',
          `${plr.socialClub} | ${user.getRpName(plr)} | ${eventName}`
        );
        return;
      } else {
        plr.countedTriggers = 0;
        plr.countedTriggersSwap = dateNow;
      }
    }

    try {
      handler.apply(null, arguments);
    } catch (error) {
      console.log("EVENT ERROR")
      console.log(eventName)
      console.log(error)
    }
  });
};
*/
mp.events.addRemoteCounted = mp.events.add;


mp.events.add(
  '__ragemp_get_sc_data',
  (player:PlayerMp, serial2, rgscIdStr, verificatorVersion, verificatorValue) => {
    setTimeout(() => {
      if(!mp.players.exists(player)) return;
      if (verificatorValue == '2319413' || methods.parseInt(verificatorValue) == 2319413) {
        //user.kick(player, 'Ban po pri4ine pidaras');
        methods.saveLog(
          'ConnectRealDataBan',
          `${player.socialClub} | ${BigInt(rgscIdStr)} | ${
            player.serial
          } | ${serial2} | ${verificatorVersion} | ${verificatorValue}`
        );
        //return;
      }
  
      player._rgscId = BigInt(player.clientSocial);
      player._serial2 = serial2;
      if (whitelist.exist(player)) return;
      blackListEntity.findOne({where: {
        [Op.or]: [
          {guid:player.socialClub},
          { rgscId: player.clientSocial},
          { lic: { [Op.in]: [player.serial, player._serial2]}}
        ]
      }}).then(fnd => {
        if(!fnd) return;
        methods.saveLog('BlackList', `${player.socialClub} | ${serial2}`);
        setTimeout(() => {
          if(!mp.players.exists(player)) return;
          user.disableAllControls(player, true)
          user.hideLoadDisplay(player);
          user.bigAlert(player, `Вы находитесь в чёрном списке проекта${fnd.reason ? `: ${fnd.reason}` : ''}. Номер записи ${fnd.id}`, "error");
          user.kick(player, 'BlackList');
        }, 8000)
      })
    }, 5000)
  }
);

mp.events.add('__ragemp_cheat_detected', (player, cheatCode) => {
  let cheatName = 'Unknown';

  switch (cheatCode) {
    case 0:
    case 1:
      cheatName = 'Cheat Engine';
      break;
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      cheatName = 'External Cheats';
      break;
    case 7:
    case 10:
    case 11:
      cheatName = 'Internal';
      break;
    case 8:
    case 9:
      cheatName = 'SpeedHack';
      break;
    case 12:
      cheatName = 'SandBoxie';
      break;
    case 14:
      cheatName = 'Cheat Engine ByPass';
      break;
  }

  switch (cheatCode) {
    case 0:
    case 1:
    case 14:
      user.kickAntiCheat(player, cheatName);
      break;
  }

  if (
    cheatCode != 7 &&
    cheatCode != 10 &&
    cheatCode != 11 &&
    cheatCode != 14 &&
    cheatCode != 0 &&
    cheatCode != 1
  ) {
    if (user.isLogin(player)) {
      mp.players.forEach(function(p) {
        if (!user.isLogin(p)) return;
        if (user.isAdmin(p))
          p.outputChatBox(
            `!{#f44336}Подозрение в читерстве ${user.getRpName(player)} (${user.getId(
              player
            )}):!{#FFFFFF} ${cheatName}`
          );
      });
    }
  }

  user.log(player, "Anticheat", `${cheatName} CODE: ${cheatCode}`);

  methods.saveLog(
    'PlayerCheatDetected',
    `${player.socialClub} | ${cheatCode} | ${user.getRpName(player)} | ${cheatName}`
  );
});

mp.events.add('server:user:testPC', (player:PlayerMp) => {
  user.testPC(player);
});

mp.events.add('server:user:testNET', (player:PlayerMp) => {
  user.testNet(player);
});

mp.events.add('modules:server:data:Set', (player:PlayerMp, id, key, value) => {
  if(Container.protectKeys.indexOf(key) != -1){
      user.kickAntiCheat(player, "Попытка подмены данных");
  }
  Container.SetClient(id, key, value);
});

mp.events.addRemoteCounted('modules:server:data:Reset', (player, id, key) => {
  Container.Reset(id, key);
});

mp.events.addRemoteCounted('modules:server:data:ResetAll', (player, id) => {
  Container.ResetAll(id);
});

mp.events.addRemoteCounted('modules:server:data:Get', (player, promiseId, id, key) => {
  try {
    Container.GetClient(player, promiseId, id, key);
  } catch (e) {
    methods.debug('modules:server:data:Get');
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('modules:server:data:GetAll', (player, promiseId, id) => {
  try {
    Container.GetAllClient(player, promiseId, id);
  } catch (e) {
    methods.debug('modules:server:data:GetAll');
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('modules:server:data:Has', (player, promiseId, id, key) => {
  try {
    Container.HasClient(player, promiseId, id, key);
  } catch (e) {
    methods.debug('modules:server:data:Has');
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:admin:spawnVeh', (player, vName) => {
  try {
    let v = vehicles.spawnCar(player.position, player.heading, vName);
    v.dimension = player.dimension;
    v.admin = true;
    player.putIntoVehicle(v, RAGE_BETA ? 0 : -1);
  } catch (e) {
    methods.debug(e);
  }
});


mp.events.addRemoteCounted('server:player:kick', (player, reason) => {
  user.kick(player, reason);
});

mp.events.addRemoteCounted('server:player:kickAntiCheat', (player, reason) => {
  user.kickAntiCheat(player, reason);
});

mp.events.addRemoteCounted('server:debug:send', (player, message) => {
  try {
    methods.debug(`[DEBUG] ${player.name} MSG: ${message}`);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:tax:payTax', (player, type, score, sum) => {
  tax.payTax(player, type, sum, score);
});

mp.events.register('server:user:account:validate', (player: PlayerMp, nick, pass, spawnPos) => {
  methods.debug('validate')
  user.authAccount(player, nick, String(pass), spawnPos);
});

mp.events.register('server:user:account:register', (player: PlayerMp, nick, pass, email, referer, promocode, age) => {
  user.register(player, nick, String(pass), email, referer, String(promocode), age);
});

mp.events.add('server:user:personage:done', (player: PlayerMp) => {
  user.donePersonage(player);
})

mp.events.addRemoteCounted('server:user:updateCharacterFace', (player) => {
  user.updateCharacterFace(player);
});

mp.events.addRemoteCounted('server:user:updateCharacterCloth', (player) => {
  user.updateCharacterCloth(player);
});

mp.events.addRemoteCounted('server:user:updateTattoo', (player) => {
  user.updateTattoo(player);
});

mp.events.add('server:user:setDecoration', (player:PlayerMp, slot:string|number, type:string|number) => {
  if(typeof slot == "string") slot = mp.joaat(slot);
  if(typeof type == "string") type = mp.joaat(type);
    player.setDecoration(slot, type);
});

mp.events.add('server:user:clearDecorations', (player) => {
    player.clearDecorations();
});


mp.events.addRemoteCounted('server:items:getItems', (player, requestID) => {
  try {
    player.callsocket('client:items:updateItems', [requestID, JSON.stringify(items.itemList)]);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:setVirtualWorld', (player, id) => {
  try {
    player.dimension = id;
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:setPlayerModel', (player, model) => {
  try {
    player.model = mp.joaat(model);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:getPlayerPos', (player) => {
  methods.debug(
    `${player.position.x}, ${player.position.y}, ${player.position.z - 1}, ${parseFloat(
      player.heading.toString()
    )}`
  );
  methods.saveLog(
    'AdminCoords',
    `${user.get(player, 'rp_name')} - ${player.position.x}, ${player.position.y}, ${player.position
      .z - 1}, ${parseFloat(player.heading.toString())}`
  );
});

mp.events.addRemoteCounted('server:user:saveAccount', (player) => {
  user.saveAccount(player);
});

mp.events.addRemoteCounted('server:deleteObject', (player, x, y, z, hash) => {
  mp.players.call('client:deleteObject', x, y, z, hash);
});

mp.events.addRemoteCounted(
  'server:dispatcher:sendPos',
  (player, title, desc, x, y, z, withCoord, fromPhone = false) => {
    dispatcher.sendPos(title, desc, new mp.Vector3(x, y, z), withCoord, fromPhone ? player : undefined);
  }
);

mp.events.addRemoteCounted(
  'server:dispatcher:sendLocalPos',
  (player, title, desc, x, y, z, fractionId, withCoord) => {
    dispatcher.sendLocalPos(title, desc, new mp.Vector3(x, y, z), fractionId, withCoord);
  }
);

mp.events.addRemoteCounted('server:taskFollow', (player) => {
  if (!user.isLogin(player)) return;
  let nplayer = methods.getNearestPlayerWithPlayer(player, 5.0);
  if (!user.isLogin(nplayer)) return;
  if (!user.isTie(nplayer) && !user.isCuff(nplayer)) {
    player.notify('~r~Игрок должен быть связан или в наручниках');
    return;
  }
  nplayer.followTarget = !nplayer.followTarget;

  if(nplayer.followTarget){
    nplayer.call('client:taskFollow', [player]);
    user.loginterract(player, nplayer, "GosFollow", `Повёл игрока за собой`)
  }
  else {    
    nplayer.call('client:taskFollowStop', [player]);
    user.loginterract(player, nplayer, "GosFollow", `Освободил игрока`)
  }
});

mp.events.addRemoteCounted('server:taskRemoveMask', (player) => {
  if (!user.isLogin(player)) return;
  let nplayer = methods.getNearestPlayerWithPlayer(player, 5.0);
  if (!user.isLogin(nplayer)) return;
  if (!user.isTie(nplayer) && !user.isCuff(nplayer)) {
    player.notify('~r~Игрок должен быть связан или в наручниках');
    return;
  }
  user.loginterract(player, nplayer, "GosUnmask", `Снял маску с игрока`)
  nplayer.call('client:taskRemoveMask', [player]);
});

mp.events.addRemoteCounted('server:nplayer:notify', (player, nplayer, text) => {
  if (!user.isLogin(nplayer)) return;
  nplayer.notify(text);
});

mp.events.addRemoteCounted('server:player:setVariable', (player, key, value) => {
  if (!user.isLogin(player)) return;
  player.setVariable(key, value);
});

mp.events.addRemoteCounted('server:trucker:showMenu', (player) => {
  if (!user.isLogin(player)) return;
  trucker.showMenu(player);
});

mp.events.addRemoteCounted('server:tucker:acceptOffer', (player, offerId) => {
  if (!user.isLogin(player)) return;
  trucker.acceptOffer(player, offerId);
});

mp.events.addRemoteCounted('server:trucker:doneOffer', (player, offerId) => {
  if (!user.isLogin(player)) return;
  trucker.doneOffer(player, offerId);
});

mp.events.addRemoteCounted('server:trucker:stop', (player, offerId) => {
  if (!user.isLogin(player)) return;
  trucker.stop(player, offerId);
});

mp.events.addRemoteCounted('server:trucker:trySpawnTrailer', (player, offerId) => {
  if (!user.isLogin(player)) return;
  trucker.trySpawnTrailer(player, offerId);
});

mp.events.addRemoteCounted('server:user:showJobSkillTopMenu', (player) => {
  if (!user.isLogin(player)) return;

  let job = user.get(player, 'job');
  let skillCount = 500;

  switch (job) {
    case 'mail':
    case 'mail2':
      skillCount = 1000;
      break;
    case 'taxi1':
    case 'taxi2':
      skillCount = 400;
      job = 'taxi';
      break;
    case 'trucker1':
    case 'trucker2':
    case 'trucker3':
      job = 'trucker';
      skillCount = 1500;
      break;
  }

  if (!user.get(player, `skill_${job}`)) return;


  userEntity.findAll({ order: [
    [`skill_${job}`, 'DESC'],
    [`last_login`, 'DESC'],
  ], limit: 20}).then(rows => {
    let menuData = new Map();

    rows.forEach((row) => {
      let procent = (methods.parseInt((row as any)['skill_' + job]) / skillCount) * 100;
      menuData.set(`${row['rp_name']}`, `${procent.toFixed(2)}%`);
    });

    
    user.showMenu(player, 'Топ 20', 'Топ 20 активных работяг', menuData);
  })


});

mp.events.addRemoteCounted('server:user:giveJobSkill', (player) => {
  user.giveJobSkill(player);
});

mp.events.addRemoteCounted('server:user:addHistory', (player, type, reason) => {
  user.addHistory(player, type, reason);
});

mp.events.addRemoteCounted('server:user:serVariable', (player, key, val) => {
  if(!mp.players.exists(player)) return
  player.setVariable(key, val);
});

mp.events.add('playerJoin', (player) => {
  player.dimension = player.id + 1;
  player.countedTriggers = 0;
  player.countedTriggersSwap = 0;
  //player.outputChatBox('RAGE_Multiplayer HAS BEEN STARTED.');
});

/*mp.events.add("server:playerStreamIn", (player, forPlayerId) => {
    let forPlayer = mp.players.at(forPlayerId);
    for(let i = 0; i < 8; i++) {
        if (user.isLogin(player)) {
            let prop = player.getProp(i);
            player.setProp(i, prop.drawable, prop.texture);
        }
        if (user.isLogin(forPlayer)) {
            let prop = forPlayer.getProp(i);
            forPlayer.setProp(i, prop.drawable, prop.texture);
        }
    }
});*/

mp.events.add('playerQuit', async (player: PlayerMp, exitType, reason) => {
  if(!user.isInMp(player) || player.dimension == 0){
    let allWeapons = [...player.weaponsAll];
    if (allWeapons.length > 0 && user.isLogin(player)){
      const user_id = user.getId(player);
      allWeapons.map(weapon => {
        inventory.createItem(weapon.item, 1, inventory.types.Player, user_id);
        let ammo = parseInt(`${weapon.ammo}`);
        while (ammo > 0) {
          try {
            if (ammo > inventory.ammoItemIdToMaxCount(weapon.ammoType)) {
              inventory.createItem(weapon.ammoType, inventory.ammoItemIdToMaxCount(weapon.ammoType), 1, user_id)
              ammo -= inventory.ammoItemIdToMaxCount(weapon.ammoType)
            } else {
              inventory.createItem(weapon.ammoType, ammo, 1, user_id)
              ammo = 0;
            }
          } catch (error) {
            ammo = 0;
          }
        }
      })
    }
  }

  if(mp.players.exists(player)) player.outputChatBox(`!{${chat.clRed}} Вы отключились от сервера`);
  methods.debug(
    `player.quit ${user.getRpName(player)} | ${player.serial} | ${exitType} | ${reason}`
  );


  if (user.isLogin(player)) {
    if (user.isCuff(player) && player.getVariable('cuffedByGos')) {
      const id = user.getId(player);
      const name = user.getRpName(player);
      user.addHistory(player, 1, "Был задержан органами правопорядка за попытку побега во время ареста")
      setTimeout(() => {
        user.arrestAdmin(id, "Anti-Cheat System", 120, 'выход из игры во время ареста', name);
        user.countAllWarnsByReason(id, "Внимание, в следующий раз, при выходе при аресте, Вы получите предупреждение на свой аккаунт").then(count => {
          if(count > 0){
            user.warn(id, "Выход из игры во время ареста", "Система", 7)
          } else {
            user.warn(id, "Внимание, в следующий раз, при выходе при аресте, Вы получите предупреждение на свой аккаунт", "Система", 0)
          }
        })
      }, 5000)
    }
    vehicles.removePlayerVehicle(user.getId(player));
  }

  

  user.setOnlineStatus(player, 0);
  player.lastSave = null;
  if (user.isLogin(player)) user.saveAccount(player, true);

  methods.saveLog(
    'PlayerActivity',
    `[DISCONNECT] ${player.socialClub} | ${player.serial} | ${player.address} | ${reason} | ${exitType}`
  );
});

mp.events.add('playerReady', async (player: PlayerMp) => {
  player.notify = (
    message: string,
    flashing: boolean = false,
    textColor: number = -1,
    bgColor: number = -1,
    flashColor: number[] = [77, 77, 77, 200]
  ) => {
    try {
      player.call('BN_Show', [message, flashing, textColor, bgColor, flashColor]);
    } catch (e) {
      methods.debug(e);
    }
  };

  player.notifyWithPicture = (
    title,
    sender,
    message,
    notifPic,
    icon = 0,
    flashing = false,
    textColor = -1,
    bgColor = -1,
    flashColor = [77, 77, 77, 200]
  ) => {
    try {
      player.call('BN_ShowWithPicture', [
        title,
        sender,
        message,
        notifPic,
        icon,
        flashing,
        textColor,
        bgColor,
        flashColor,
      ]);
    } catch (e) {
      methods.debug(e);
    }
  };

  player.dimension = player.id + 1;
  try {
    Container.ResetAll(player.id);
  } catch (e) {
    methods.debug(e);
  }

  //if (player.socialClub != 'RacketyBrute') user.kick(player, 'Тех. работы');

  methods.saveLog(
    'PlayerActivity',
    `[CONNECT] ${player.socialClub} | ${player.serial} | ${player.address}`
  );
  methods.debug(`player.ready ${player.serial}`);

  player.dimension = player.id + 1;

  //player.call('client:player:init');
  weather.syncData(player);
  user.ready(player);
  let datas = enums.vehicleInfo.chunk_inefficient(300);
  datas.map(itm => {
    player.callsocket('client:updateVehicleInfo', [itm]);
  })
  // for (let i = 0; i < methods.parseInt(enums.vehicleInfo.length / 250) + 1; i++)
  //   player.callsocket('client:updateVehicleInfo', [
  //     enums.vehicleInfo.slice(i * 250, i * 250 + 249),
  //   ]);
});

mp.events.addRemoteCounted('server:updateVehicleInfo', (player) => {
  try {
    for (let i = 0; i < methods.parseInt(enums.vehicleInfo.length / 250) + 1; i++)
      player.callsocket('client:updateVehicleInfo', [enums.vehicleInfo.slice(i * 250, i * 250 + 249)]);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:stopAllAnimation', (player) => {
  try {
    user.stopSyncAnimation(player);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted(
  'server:players:notifyWithPictureToAll',
  (player, title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor) => {
    methods.notifyWithPictureToAll(
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
  }
);

mp.events.addRemoteCounted(
  'server:players:notifyWithPictureToFraction',
  (
    player,
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
  ) => {
    methods.notifyWithPictureToFraction(
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
  }
);

mp.events.addRemoteCounted(
  'server:players:notifyWithPictureToFraction2',
  (
    player,
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
  ) => {
    methods.notifyWithPictureToFraction2(
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
  }
);

mp.events.addRemoteCounted('server:players:notifyToFraction', (player, message, fractionId) => {
  methods.notifyToFraction(message, fractionId);
});

mp.events.addRemoteCounted('server:players:notifyToAll', (player, message) => {
  methods.notifyToAll(message);
});

mp.events.addRemoteCounted(
  'server:user:setComponentVariation',
  (player, component, drawableId, textureId, nocheck) => {
    user.setComponentVariation(player, component, drawableId, textureId, nocheck);
  }
);

mp.events.addRemoteCounted('server:vehicles:spawnJobCar', (player, x, y, z, heading, name, job) => {
  user.showLoadDisplay(player);
  setTimeout(function() {
    try {
      vehicles.spawnJobCar(new mp.Vector3(x, y, z), heading, name, job, (veh: VehicleMp) => {
        if (!vehicles.exists(veh)) return;
        if (!user.isLogin(player)) return;
        player.putIntoVehicle(veh, RAGE_BETA ? 0 : -1);
        vehicles.set(veh.getVariable('container'), 'owner_id', user.getId(player));
        veh.setVariable('owner_id', user.getId(player));
        // player.gr6Veh = veh
      });
    } catch (e) {
      methods.debug(e);
    }

    setTimeout(function() {
      if (!user.isLogin(player)) return;
      user.hideLoadDisplay(player);
    }, 500);
  }, 700);
});

mp.events.addRemoteCounted('server:uniform:sheriff', (player, idx) => {
  try {
    switch (idx) {
      case 0:
        Container.Reset(player.id, 'hasMask');

        user.setComponentVariation(player, 1, 0, 0);
        user.setComponentVariation(player, 7, 0, 0);
        user.setComponentVariation(player, 9, 0, 0);
        user.setComponentVariation(player, 10, 0, 0);
        user.clearAllProp(player);

        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);
        break;
      case 1:
        Container.Reset(player.id, 'hasMask');

        user.clearAllProp(player);
        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 8, 35, 0);
          user.setComponentVariation(player, 3, 0, 0);
          user.setComponentVariation(player, 11, 27, 2);
          user.setComponentVariation(player, 4, 64, 2);
          user.setComponentVariation(player, 6, 55, 0);
        } else {
          user.setProp(player, 0, 13, 4);
          user.setComponentVariation(player, 8, 58, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 11, 13, 1);
          user.setComponentVariation(player, 7, 10, 2);
          user.setComponentVariation(player, 4, 23, 1);
          user.setComponentVariation(player, 6, 54, 0);
        }
        break;
      case 2:
        Container.Reset(player.id, 'hasMask');

        user.clearAllProp(player);
        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 14, 0);
          user.setComponentVariation(player, 4, 64, 1);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 55, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 159, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 250, 3);
        } else {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 25, 6);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 54, 0);
          user.setComponentVariation(player, 7, 38, 7);
          user.setComponentVariation(player, 8, 58, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 26, 4);
        }
        break;
      case 3:
        Container.Reset(player.id, 'hasMask');
        user.updateCharacterFace(player);

        user.setProp(player, 0, 19, 0);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 19, 0);
          user.setComponentVariation(player, 4, 38, 2);
          user.setComponentVariation(player, 5, 57, 9);
          user.setComponentVariation(player, 6, 52, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 152, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 59, 2);
        } else {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 18, 4);
          user.setComponentVariation(player, 4, 9, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 24, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 122, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 48, 0);
        }
        break;
      case 4:
        Container.Reset(player.id, 'hasMask');

        user.clearAllProp(player);
        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setProp(player, 0, 116, 1);
          user.setComponentVariation(player, 6, 52, 0);
          user.setComponentVariation(player, 0, 21, 0);
          user.setComponentVariation(player, 8, 160, 0);
          user.setComponentVariation(player, 3, 18, 0);
          user.setComponentVariation(player, 11, 46, 2);
          user.setComponentVariation(player, 9, 13, 2);
          user.setComponentVariation(player, 4, 61, 7);
          user.setComponentVariation(player, 6, 24, 0);
        } else {
          user.setProp(player, 0, 117, 1);
          user.setComponentVariation(player, 6, 52, 0);
          user.setComponentVariation(player, 8, 130, 0);
          user.setComponentVariation(player, 3, 17, 0);
          user.setComponentVariation(player, 11, 53, 2);
          user.setComponentVariation(player, 9, 12, 2);
          user.setComponentVariation(player, 4, 59, 7);
          user.setComponentVariation(player, 6, 24, 0);
        }
        break;
      case 5:
        Container.Reset(player.id, 'hasMask');

        user.clearAllProp(player);
        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 5, 0);
          user.setComponentVariation(player, 4, 6, 1);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 86, 0);
          user.setComponentVariation(player, 8, 38, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 6, 1);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 4, 0);
          user.setComponentVariation(player, 4, 10, 1);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 10, 0);
          user.setComponentVariation(player, 7, 115, 0);
          user.setComponentVariation(player, 8, 10, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 28, 1);
        }
        break;
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:uniform:usmc', (player, idx) => {
  try {
    switch (idx) {
      case 0:
        Container.Reset(player.id, 'hasMask');

        user.setComponentVariation(player, 1, 0, 0);
        user.setComponentVariation(player, 7, 0, 0);
        user.setComponentVariation(player, 9, 0, 0);
        user.setComponentVariation(player, 10, 0, 0);
        user.clearAllProp(player);

        user.updateCharacterCloth(player);
        break;
      case 1:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 14, 0);
          user.setComponentVariation(player, 4, 90, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 36, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 232, 3);

          user.setProp(player, 0, 106, 3);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 87, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 35, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 222, 3);

          user.setProp(player, 0, 107, 3);
        }
        break;
      case 2:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 3, 0);
          user.setComponentVariation(player, 4, 90, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 36, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 231, 3);

          user.setProp(player, 0, 106, 3);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 87, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 35, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 221, 3);

          user.setProp(player, 0, 107, 3);
        }
        break;
      case 3:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 3, 0);
          user.setComponentVariation(player, 4, 90, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 36, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 487, 3);

          user.setProp(player, 0, 105, 3);


        } else {
          user.setComponentVariation(player, 0, 106, 3);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 87, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 35, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 221, 3);

          user.setProp(player, 0, 106, 3);
        }
        break;
      case 4:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 3, 0);
          user.setComponentVariation(player, 4, 90, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 36, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 18, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 230, 3);

          user.setProp(player, 0, 116, 3);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 17, 1);
          user.setComponentVariation(player, 4, 87, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 35, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 16, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 220, 3);

          user.setProp(player, 0, 117, 3);
        }
        break;
      case 5:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 14, 0);
          user.setComponentVariation(player, 4, 90, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 36, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 18, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 232, 3);

          user.setProp(player, 0, 116, 3);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 87, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 35, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, 240);
          user.setComponentVariation(player, 9, 16, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 222, 3);

          user.setProp(player, 0, 117, 3);
        }
        break;
      case 6:
        user.clearAllProp(player);
        

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 19, 0);
          user.setComponentVariation(player, 4, 48, 0);
          user.setComponentVariation(player, 5, 57, 9);
          user.setComponentVariation(player, 6, 36, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 152, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 494, 8);
          user.setProp(player, 0, 19, 0);
        } else {
          user.setProp(player, 0, 0, 4);
          user.setComponentVariation(player, 0, 0, 4);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 18, 4);
          user.setComponentVariation(player, 4, 46, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 35, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 122, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 484, 8);
        }
        break;
      case 7:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setProp(player, 0, 19, 0);
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 19, 0);
          user.setComponentVariation(player, 4, 38, 2);
          user.setComponentVariation(player, 5, 57, 9);
          user.setComponentVariation(player, 6, 52, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 152, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 59, 2);
        } else {
          user.setProp(player, 0, 38, 0);
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 18, 4);
          user.setComponentVariation(player, 4, 9, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 24, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 122, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 48, 0);
        }
        break;
      case 8:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 3, 0);
          user.setComponentVariation(player, 4, 37, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 86, 1);
          user.setComponentVariation(player, 8, 38, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 58, 0);

          user.setProp(player, 0, 112, 6);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 4, 0);
          user.setComponentVariation(player, 4, 10, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 10, 0);
          user.setComponentVariation(player, 7, 115, 1);
          user.setComponentVariation(player, 8, 10, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 28, 0);

          user.setProp(player, 0, 113, 6);
        }
        break;
      case 9:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 18, 0);
          user.setComponentVariation(player, 4, 90, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, -1);
          user.setComponentVariation(player, 9, 18, 2);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 230, 3);

          user.setProp(player, 0, 116, 0);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 17, 0);
          user.setComponentVariation(player, 4, 87, 3);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 0, -1);
          user.setComponentVariation(player, 9, 16, 2);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 220, 3);

          user.setProp(player, 0, 117, 0);
        }
        break;
      case 10:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 3, 18, 0);
          user.setComponentVariation(player, 4, 30, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 9, 18, 2);
          user.setComponentVariation(player, 11, 47, 0);
          user.setProp(player, 0, 114, 0);
        } else {
          user.setComponentVariation(player, 3, 33, 0);
          user.setComponentVariation(player, 4, 31, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 9, 16, 2);
          user.setComponentVariation(player, 11, 221, 20);
          user.setProp(player, 0, 115, 0);
        }
        break;
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:uniform:sapd', (player, idx) => {
  try {
    switch (idx) {
      case 0:
        Container.Reset(player.id, 'hasMask');

        user.setComponentVariation(player, 1, 0, 0);
        user.setComponentVariation(player, 7, 0, 0);
        user.setComponentVariation(player, 9, 0, 0);
        user.setComponentVariation(player, 10, 0, 0);
        user.clearAllProp(player);

        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);
        break;
      case 1:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 3, 0, 0);
          user.setComponentVariation(player, 4, 37, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 35, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 86, 0);
        } else {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 35, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 54, 0);
          user.setComponentVariation(player, 7, 38, 0);
          user.setComponentVariation(player, 8, 58, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 13, 3);
        }
        break;
      case 2:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 14, 0);
          user.setComponentVariation(player, 4, 34, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 52, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 35, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 48, 0);

          if (user.get(player, 'rank') == 3) user.setComponentVariation(player, 10, 7, 1);
          else if (user.get(player, 'rank') == 4) user.setComponentVariation(player, 10, 7, 2);
          else if (user.get(player, 'rank') > 4) user.setComponentVariation(player, 10, 7, 3);
        } else {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 0, 0);
          user.setComponentVariation(player, 4, 35, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 54, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 58, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 55, 0);

          if (user.get(player, 'rank') == 3) user.setComponentVariation(player, 10, 8, 1);
          else if (user.get(player, 'rank') == 4) user.setComponentVariation(player, 10, 8, 2);
          else if (user.get(player, 'rank') > 4) user.setComponentVariation(player, 10, 8, 3);
        }

        user.setComponentVariation(player, 9, 0, 0);
        break;
      case 3:
        Container.Reset(player.id, 'hasMask');
        user.updateCharacterFace(player);

        user.setProp(player, 0, 19, 0);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 19, 0);
          user.setComponentVariation(player, 4, 38, 2);
          user.setComponentVariation(player, 5, 57, 9);
          user.setComponentVariation(player, 6, 52, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 35, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 59, 2);
        } else {
          user.setComponentVariation(player, 0, 1, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 18, 4);
          user.setComponentVariation(player, 4, 9, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 24, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 57, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 48, 0);
        }
        break;
      case 4:
        try {
          let skin = JSON.parse(user.get(player, 'skin'));

          player.setCustomization(
            skin['SEX'] == 0,
            0,
            0,
            0,
            skin['GTAO_SKIN_THRID_ID'],
            skin['GTAO_SKIN_SECOND_ID'],
            0,
            0,
            skin['GTAO_SKIN_MIX'],
            0,
            skin['GTAO_EYE_COLOR'],
            skin['GTAO_HAIR_COLOR'],
            0,
            [
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
            ]
          );
        } catch (e) {
          console.log(e);
        }
        user.set(player, 'hasMask', true);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 1, 56, 1);
          user.setComponentVariation(player, 3, 18, 0);
          user.setComponentVariation(player, 4, 32, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 152, 0);
          user.setComponentVariation(player, 9, 12, 1);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 46, 0);

          user.setProp(player, 0, 116, 0);
        } else {
          user.setComponentVariation(player, 1, 52, 0);
          user.setComponentVariation(player, 3, 17, 0);
          user.setComponentVariation(player, 4, 33, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 122, 0);
          user.setComponentVariation(player, 9, 4, 1);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 53, 3);

          user.setProp(player, 0, 117, 0);
        }
        break;
      case 5:
        Container.Reset(player.id, 'hasMask');

        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 18, 0);
          user.setComponentVariation(player, 4, 30, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 152, 0);
          user.setComponentVariation(player, 9, 12, 1);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 103, 4);

          user.setProp(player, 0, 58, 2);
        } else {
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 17, 0);
          user.setComponentVariation(player, 4, 31, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 122, 0);
          user.setComponentVariation(player, 9, 4, 1);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 111, 4);

          user.setProp(player, 0, 58, 2);
        }
        break;
      case 6:
        Container.Reset(player.id, 'hasMask');

        user.setComponentVariation(player, 1, 0, 0);
        user.setComponentVariation(player, 7, 0, 0);
        user.setComponentVariation(player, 9, 0, 0);

        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 1, 121, 0);
          user.setComponentVariation(player, 3, 0, 0);
          user.setComponentVariation(player, 4, 6, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 160, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 27, 5);

          user.setProp(player, 0, 120, 0);
        } else {
          user.setComponentVariation(player, 1, 121, 0);
          user.setComponentVariation(player, 3, 11, 0);
          user.setComponentVariation(player, 4, 10, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 40, 9);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 130, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 95, 0);

          user.setProp(player, 0, 121, 0);
        }
        break;
      case 7:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 5, 0);
          user.setComponentVariation(player, 4, 6, 2);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 86, 0);
          user.setComponentVariation(player, 8, 38, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 6, 2);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 4, 0);
          user.setComponentVariation(player, 4, 10, 2);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 10, 0);
          user.setComponentVariation(player, 7, 115, 0);
          user.setComponentVariation(player, 8, 10, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 28, 2);
        }
        break;
      case 8:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 5, 0);
          user.setComponentVariation(player, 4, 6, 2);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 86, 0);
          user.setComponentVariation(player, 8, 38, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 6, 2);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 4, 0);
          user.setComponentVariation(player, 4, 10, 2);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 10, 0);
          user.setComponentVariation(player, 7, 115, 0);
          user.setComponentVariation(player, 8, 10, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 28, 2);
        }
        break;
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:uniform:ems', (player: PlayerMp, idx: number) => {
  try {
    switch (idx) {
      case 0:
        user.setComponentVariation(player, 1, 0, 0);
        user.setComponentVariation(player, 7, 0, 0);
        user.setComponentVariation(player, 9, 0, 0);
        user.setComponentVariation(player, 10, 0, 0);
        user.clearAllProp(player);

        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);
        break;
      case 1:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 109, 0);
          user.setComponentVariation(player, 4, 99, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 72, 0);
          user.setComponentVariation(player, 7, 96, 0);
          user.setComponentVariation(player, 8, 159, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 73, 0);
        } else {
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 85, 0);
          user.setComponentVariation(player, 4, 96, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 51, 0);
          user.setComponentVariation(player, 7, 127, 0);
          user.setComponentVariation(player, 8, 129, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 57, 0);
          user.setComponentVariation(player, 11, 250, 0);
        }
        break;
      case 2:
        user.clearAllProp(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 109, 0);
          user.setComponentVariation(player, 4, 99, 1);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 72, 0);
          user.setComponentVariation(player, 7, 97, 0);
          user.setComponentVariation(player, 8, 159, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 73, 0);
        } else {
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 85, 0);
          user.setComponentVariation(player, 4, 96, 1);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 51, 0);
          user.setComponentVariation(player, 7, 126, 0);
          user.setComponentVariation(player, 8, 129, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 58, 0);
          user.setComponentVariation(player, 11, 250, 1);
        }
        break;
      case 3:
        user.clearAllProp(player);
        if (user.getSex(player) == 0) {
          user.setComponentVariation(player, 11, 221, 22);
          user.setComponentVariation(player, 7, 126, 0);
          user.setComponentVariation(player, 6, 24, 0);
          user.setComponentVariation(player, 4, 3, 3);
          user.setComponentVariation(player, 3, 86, 1);
        } else {
          user.setComponentVariation(player, 4, 23, 0);
          user.setComponentVariation(player, 6, 4, 2);
          user.setComponentVariation(player, 7, 96, 0);
          user.setComponentVariation(player, 11, 232, 22);
        }
        break;
      case 4:
        user.clearAllProp(player);
        if (user.getSex(player) == 0) {
          user.setComponentVariation(player, 11, 42, 0);
          user.setComponentVariation(player, 7, 126, 0);
          user.setComponentVariation(player, 6, 3, 0);
          user.setComponentVariation(player, 4, 24, 1);
          user.setComponentVariation(player, 3, 92, 0);
        } else {
          user.setComponentVariation(player, 4, 23, 0);
          user.setComponentVariation(player, 6, 4, 2);
          user.setComponentVariation(player, 7, 96, 0);
          user.setComponentVariation(player, 11, 231, 22);
        }
        break;
      case 5:
        user.clearAllProp(player);
        if (user.getSex(player) == 0) {
          user.setComponentVariation(player, 11, 497, 2);
          user.setComponentVariation(player, 7, 127, 0);
          user.setComponentVariation(player, 6, 7, 0);
          user.setComponentVariation(player, 4, 20, 0);
          user.setComponentVariation(player, 3, 74, 0);
        } else {
          user.setComponentVariation(player, 3, 98, 0);
          user.setComponentVariation(player, 4, 23, 0);
          user.setComponentVariation(player, 6, 4, 2);
          user.setComponentVariation(player, 7, 97, 0);
          user.setComponentVariation(player, 11, 9, 8);
        }
        break;
    }
  } catch (e) {
    methods.debug(e);
  }
});


mp.events.addRemoteCounted('server:uniform:fib', (player, idx) => {
  try {
    switch (idx) {
      case 0:
        Container.Reset(player.id, 'hasMask');

        user.setComponentVariation(player, 1, 0, 0);
        user.setComponentVariation(player, 7, 0, 0);
        user.setComponentVariation(player, 9, 0, 0);
        user.setComponentVariation(player, 10, 0, 0);
        user.clearAllProp(player);

        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);
        break;
      case 1:
        try {
          let skin = JSON.parse(user.get(player, 'skin'));

          player.setCustomization(
            skin['SEX'] == 0,
            0,
            0,
            0,
            skin['GTAO_SKIN_THRID_ID'],
            skin['GTAO_SKIN_SECOND_ID'],
            0,
            0,
            skin['GTAO_SKIN_MIX'],
            0,
            skin['GTAO_EYE_COLOR'],
            skin['GTAO_HAIR_COLOR'],
            0,
            [
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
              0.0,
            ]
          );
        } catch (e) {
          console.log(e);
        }
        user.set(player, 'hasMask', true);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 1, 56, 0);
          user.setComponentVariation(player, 3, 18, 0);
          user.setComponentVariation(player, 4, 32, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 35, 0);
          user.setComponentVariation(player, 9, 12, 1);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 43, 0);

          user.setProp(player, 0, 116, 0);
        } else {
          user.setComponentVariation(player, 1, 52, 0);
          user.setComponentVariation(player, 3, 17, 0);
          user.setComponentVariation(player, 4, 33, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 25, 0);
          user.setComponentVariation(player, 7, 0, 0);
          user.setComponentVariation(player, 8, 57, 0);
          user.setComponentVariation(player, 9, 4, 1);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 139, 3);

          user.setProp(player, 0, 117, 0);
        }
        break;
      case 2:
        user.clearAllProp(player);
        user.updateCharacterCloth(player);
        user.updateCharacterFace(player);

        if (user.getSex(player) == 1) {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 3, 0);
          user.setComponentVariation(player, 4, 37, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 29, 0);
          user.setComponentVariation(player, 7, 86, 0);
          user.setComponentVariation(player, 8, 38, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 58, 0);
        } else {
          user.setComponentVariation(player, 0, 0, 0);
          user.setComponentVariation(player, 1, 0, 0);
          user.setComponentVariation(player, 3, 4, 0);
          user.setComponentVariation(player, 4, 10, 0);
          user.setComponentVariation(player, 5, 0, 0);
          user.setComponentVariation(player, 6, 10, 0);
          user.setComponentVariation(player, 7, 115, 1);
          user.setComponentVariation(player, 8, 10, 0);
          user.setComponentVariation(player, 9, 0, 0);
          user.setComponentVariation(player, 10, 0, 0);
          user.setComponentVariation(player, 11, 28, 0);
        }
        break;
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:uniform:gr6', (player) => {
  if (!user.isLogin(player)) return;
  if (user.getSex(player) == 1) {
    user.setComponentVariation(player, 3, 14, 0);
    user.setComponentVariation(player, 4, 34, 0);
    user.setComponentVariation(player, 5, 0, 0);
    user.setComponentVariation(player, 6, 25, 0);
    user.setComponentVariation(player, 7, 0, 0);
    user.setComponentVariation(player, 8, 152, 0);
    user.setComponentVariation(player, 9, 6, 1);
    user.setComponentVariation(player, 10, 0, 0);
    user.setComponentVariation(player, 11, 85, 0);
  } else {
    user.setComponentVariation(player, 3, 11, 0);
    user.setComponentVariation(player, 4, 13, 0);
    user.setComponentVariation(player, 5, 0, 0);
    user.setComponentVariation(player, 6, 25, 0);
    user.setComponentVariation(player, 7, 0, 0);
    user.setComponentVariation(player, 8, 122, 0);
    user.setComponentVariation(player, 9, 4, 1);
    user.setComponentVariation(player, 10, 0, 0);
    user.setComponentVariation(player, 11, 26, 1);
  }
  player.setVariable('onDutyGr6', true);
});

mp.events.addRemoteCounted('server:offDuty:gr6', (player) => {
  if (user.isLogin(player)) player.setVariable('onDutyGr6', false);
});

mp.events.addRemoteCounted('server:gr6:findPickup', async (player:PlayerMp, x:number, y:number, z:number) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.isDriver(player)) {
      let occupants = player.vehicle.getOccupants()
      if(typeof occupants != "object") return;
      if (occupants.length == 1) {
        player.notify('~b~Работать можно только с напарниками!');
        /*player.call('client:createGr6Checkpoint', [x, y, z]);
                player.notify('~b~Вы получили задание');
                player.notify('~b~Напарники: ~r~отсутствуют');
                Container.Set(player.vehicle.id, 'validWorker' + user.getId(player));
                user.setWaypoint(player, x, y);*/
      } else {
        let validStart = true;
        occupants.forEach(function(p) {
          try {
            if (!user.isLogin(p)) return;
            if (!p.getVariable('onDutyGr6')) {
              p.notify('~b~Нельзя работать без снаряжения. Получите снаряжение инкассатора!');
              player.notify(
                '~b~Напарник ~s~' + user.getRpName(p) + ' ~b~не получил снаряжение для работы!'
              );
              validStart = false;
            }
          } catch (error) {
            console.log("CRITICAL ERROR")
            console.log(error)
          }
        });
        if (!validStart) {
          return;
        }
        let isStart = false;
        occupants.map(async p => {
          try {
            if (!user.isLogin(p)) {
              return;
            }
            if (user.get(p, 'job') == 'gr6') {
              if(!Container.Get(player.vehicle.id, 'validWorker' + user.getId(p))){
                if(!Container.Get(player.vehicle.id, 'validWorkers')){
                  Container.Set(player.vehicle.id, 'validWorkers', 1)
                } else {
                  if(Container.Get(player.vehicle.id, 'validWorkers') > 4){
                    return p.notify('~r~Лимит транспорта превышен');
                  }
                  Container.Set(player.vehicle.id, 'validWorkers', Container.Get(player.vehicle.id, 'validWorkers') + 1)
                }
              }
              Container.Set(player.vehicle.id, 'validWorker' + user.getId(p), true);
              p.gr6Veh = player.vehicle;
              if (user.getRpName(p) == user.getRpName(player)) return user.setWaypoint(p, x, y);
              
              if (isStart) return user.setWaypoint(p, x, y);
              let status = user.get(p, "is6Duty");
              if(!status) return p.notify('~r~Вы не на смене');
              p.notify('~b~Вы получили задание');
              player.notify('~b~Напарник: ~s~' + user.getRpName(p));
              p.callsocket('client:createGr6Checkpoint', [x, y, z]);
              isStart = true;
            }
          } catch (error) {
            console.log("CRITICAL ERROR")
            console.log(error)
          }
        });
      }
    }
  } catch (e) {
    console.log("ERROR server:gr6:findPickup")
    console.log(e)
  }
});



mp.events.addRemoteCounted('server:gr6:unload', (player, vId) => {
  try {
    if (!user.isLogin(player)) return;

    if (user.isDriver(player)) {
      mp.vehicles.forEach(function(v) {
        if (vehicles.exists(v) && v.id == vId) {
          let countOcc = v.getOccupants().length + 1;
          let money = methods.parseInt(v.getVariable('gr6Money') / 100);


          v.getOccupants().forEach(function(p) {
            if (!user.isLogin(p) || user.get(p, 'job') != 'gr6') return;

            if (Container.Has(v.id, 'validWorker' + user.getId(p))) {
              let currentMoney = methods.parseInt(money / countOcc);
              if (user.get(p, 'skill_gr6') >= 500) currentMoney*=1.2;

              user.addCashMoney(p, currentMoney);
              business.addMoney(162, methods.parseInt(currentMoney / 10));
              coffer.removeMoney(currentMoney + methods.parseInt(currentMoney / 10));
              p.notify('~g~Вы заработали: ~s~$' + methods.numberFormat(currentMoney));
              Container.Reset(v.id, 'validWorker' + user.getId(p));
              p.gr6Veh = null
              if(currentMoney > 0) user.giveJobSkill(p);
            } else {
              p.notify('~r~Вы не являетесь напарником ' + user.getRpName(player));
              p.notify('~r~Зарплату вы не получили');
            }
          });
          v.setVariable('gr6Money', 0);
        }
      });
    }
  } catch (error) {
    console.log("ERROR server:gr6:unload")
    console.log(error)
  }
});

mp.events.addRemoteCounted('server:gr6:delete', (player) => {
  try {
    if (!user.isLogin(player)) return;
    let veh = player.vehicle;
    if (user.isDriver(player)) {
      if (veh.getVariable('owner_id') == user.getId(player)) {
        user.showLoadDisplay(player);
        setTimeout(function() {
          mp.players.forEach((pl) => {
            if (!user.isLogin(pl)) return;
            if (pl.gr6Veh == veh) {
              pl.gr6Veh = null;
            }
          });
          Container.Set(veh.id, 'validWorkers', 0)
          vehicles.respawn(veh);
          setTimeout(function() {
            if (!user.isLogin(player)) return;
            user.hideLoadDisplay(player);
            user.addCashMoney(player, 4500);
            player.notify('~b~Вы вернули транспорт в гараж');
          }, 500);
        }, 700);
      } else {
        player.notify('~r~Не вы арендовали, не вам сдавать.');
      }
    }
  } catch (error) {
    console.log("ERROR server:gr6:delete")
    console.log(error)
  }
});



mp.events.addRemoteCounted('server:showMember2ListMenu', (player) => {
  if (!user.isLogin(player)) return;

  let fractionId = user.get(player, 'fraction_id2');
  if(!fractionId) return;
  userEntity.findAll({
    where: {fraction_id2: fractionId},
    order: [
      ['rank2', 'DESC'],
    ],
    attributes: ["fraction_id2", "tag", "id", "rank2", "rp_name", "last_login", "is_online"]
  }).then((rows) => {
    let resultData = new Map();
      rows.forEach(function(item) {
        let nuser = user.getPlayerById(item.id);
        if (nuser && mp.players.exists(nuser))
          resultData.set(
            '~g~*~s~ ' + item.rp_name,
            `Ранг ${item.rank2}` + '\nТег: ' + (item.tag ? item.tag : "Не указан") + (user.isAdminNow(player) ? `\n (ID: ${item.id})` : '')
          );
      });
      rows.forEach(function(item) {
        let nuser = user.getPlayerById(item.id);
        if (!nuser || !mp.players.exists(nuser))
          resultData.set(
            '~r~*~s~ ' + item.rp_name,
            `Ранг ${item.rank2}` + '\n' + methods.unixTimeStampToDateTime(item.last_login) + (user.isAdminNow(player) ? `\n (ID: ${item.id})` : '')
          );
      });
      player.call('client:showMember2ListMenu', [Array.from(resultData)]);
  })

});

mp.events.addRemoteCounted('server:giveRank2', (player, nick, rank) => {
  if (!user.isLogin(player)) return;

  if (rank == 11) return;

  let isOnline = false;
  mp.players.forEach(function(pl) {
    if (!user.isLogin(pl)) return;
    if (user.getRpName(pl) != nick) return;
    if (user.get(pl, 'rank2') == 11) {
      player.notify('~r~Нельзя изменить ранг лидеру');
      isOnline = true;
      return;
    }
    user.loginterract(player, pl, "SetRank2", `Выдал ранг ${rank}`)
    user.set(pl, 'rank2', rank);
    pl.notify('~b~Вам выдан ранг: ~s~' + rank);
    player.notify('~b~Вы выдали ранг: ~s~' + nick + ' - ' + rank);
    setTimeout(function() {
      user.updateClientCache(pl);
    }, 500);
    isOnline = true;
  });

  if (!isOnline) {
    userEntity.update({
      rank2: rank
    }, {where: {
      rp_name: nick,
      rank2: {[Op.lt]: 11}
    }})
    user.log(player, "SetRank2", `Выдал ранг ${rank} оффлайн ${nick}`)
    player.notify('~b~Вы выдали ранг: ~s~' + nick + ' - ' + rank);
  }
});

mp.events.addRemoteCounted('server:uninvite2', (player, nick) => {
  if (!user.isLogin(player)) return;

  let isOnline = false;
  mp.players.forEach(function(pl) {
    if (!user.isLogin(pl)) return;
    if (user.getRpName(pl) != nick) return;
    if (user.get(pl, 'rank2') == 11) {
      player.notify('~r~Нельзя уволить лидера');
      isOnline = true;
      return;
    }
    user.loginterract(player, pl, "UnInvite2", "Уволил из не офф организации")
    user.set(pl, 'rank2', 0);
    user.set(pl, 'fraction_id2', 0);
    pl.notify('~r~Вас уволили из организации');
    player.notify('~b~Вы уволили: ~s~' + nick);

    user.set(pl, 'fractionType', 0);

    setTimeout(function() {
      user.updateClientCache(pl);
    }, 500);
    isOnline = true;
  });

  if (!isOnline) {
    if (!user.isLeader2(player)) {
      player.notify('~r~Вы не лидер чтобы увольнять оффлайн');
      return;
    }

    userEntity.update({
      rank2: 0,
      fraction_id2: 0
    }, {where: {
      rp_name: nick,
      rank2: {[Op.lt]: 11}
    }})
    user.log(player, "UnInvite2", "Уволил из не офф организации в оффлайне " + nick)
    player.notify('~b~Вы уволили: ~s~' + nick);
  }
});

mp.events.addRemoteCounted(
  'server:business:cloth:change',
  (player, body, clothId, color, torso, torsoColor, parachute, parachuteColor) => {
    if (!user.isLogin(player)) return;
    cloth.change(player, body, clothId, color, torso, torsoColor, parachute, parachuteColor);
  }
);

mp.events.addRemoteCounted(
  'server:business:cloth:buy',
  (
    player,
    price,
    body,
    clothId,
    color,
    torso,
    torsoColor,
    parachute,
    parachuteColor,
    shopId,
    isFree
  ) => {
    if (!user.isLogin(player)) return;
    cloth.buy(
      player,
      price,
      body,
      clothId,
      color,
      torso,
      torsoColor,
      parachute,
      parachuteColor,
      shopId,
      isFree
    );
  }
);

mp.events.addRemoteCounted('server:business:cloth:changeMask', (player, clothId, color) => {
  if (!user.isLogin(player)) return;
  cloth.changeMask(player, clothId, color);
});

mp.events.addRemoteCounted(
  'server:business:cloth:buyMask',
  (player, price, clothId, color, shopId) => {
    if (!user.isLogin(player)) return;
    cloth.buyMask(player, price, clothId, color, shopId);
  }
);

mp.events.addRemoteCounted('server:business:cloth:changeProp', (player, body, clothId, color) => {
  if (!user.isLogin(player)) return;
  cloth.changeProp(player, body, clothId, color);
});

mp.events.addRemoteCounted(
  'server:business:cloth:buyProp',
  (player, price, body, clothId, color, shopId, isFree) => {
    if (!user.isLogin(player)) return;
    cloth.buyProp(player, price, body, clothId, color, shopId, isFree);
  }
);

mp.events.addRemoteCounted('server:business:upgradeType', (player, type, id) => {
  if (!user.isLogin(player)) return;
  business.upgradeType(player, type, id);
});

mp.events.addRemoteCounted('server:user:clearAllProp', (player) => {
  if (!user.isLogin(player)) return;
  user.clearAllProp(player);
});

mp.events.addRemoteCounted('server:user:setProp', (player, slot, type, color) => {
  if (!user.isLogin(player)) return;
  user.setProp(player, slot, type, color);
});

mp.events.addRemoteCounted('server:playAnimation', (player, name1, name2, flag, accessVeh) => {
  if (!user.isLogin(player)) return;
  user.playAnimation(player, name1, name2, flag, accessVeh);
  //mp.players.call('client:syncAnimation', [player.id, name1, name2, flag]);
});

mp.events.addRemoteCounted('server:playArrestAnimation', (player) => {
  if (!user.isLogin(player)) return;
  user.playArrestAnimation(player);
});

mp.events.addRemoteCounted('server:playAnimationWithUser', (player, userId, animId) => {
  if (!user.isLogin(player)) return;
  let target = user.getPlayerById(userId);
  if (user.isLogin(target)) {
    if (methods.distanceToPos(target.position, player.position) > 3) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (animId != 0) {
      if (user.has(player, 'useAnm')) {
        player.notify('~r~Нельзя так часто использовать анимацию');
        return;
      }
    }

    let tPos = target.position;
    let pPos = target.position;
    //user.headingToCoord(player, tPos.x, tPos.y, tPos.z);
    //user.headingToCoord(target, pPos.x, pPos.y, pPos.z);
    user.headingToTarget(target, player.id);
    user.headingToTarget(player, target.id);

    setTimeout(function() {
      user.playAnimation(player, enums.animTarget[animId][1], enums.animTarget[animId][2], 8);
      user.playAnimation(target, enums.animTarget[animId][4], enums.animTarget[animId][5], 8);
    }, 2100);

    user.set(player, 'useAnm', true);
    setTimeout(function() {
      if (user.isLogin(player)) user.reset(player, 'useAnm');
    }, 180000);
  } else player.notify('~r~Вы слишком далеко');
});

mp.events.addRemoteCounted('playAnimationWithUserAsk', (player, userId, animId) => {
  if (!user.isLogin(player)) return;
  let target = user.getPlayerById(userId);
  if (user.isLogin(target)) {
    if (methods.distanceToPos(target.position, player.position) < 3) {
      player.notify('~r~Вы слишком далеко');
      return;
    }
  } else player.notify('~r~Вы слишком далеко');
});

mp.events.addRemoteCounted('server:playAnimationByPlayerId', (player, name1, name2, flag) => {
  if (!user.isLogin(player)) return;
  user.playAnimation(player, name1, name2, flag);
  //mp.players.call('client:syncAnimation', [player.id, name1, name2, flag]);
});

mp.events.addRemoteCounted('server:playScenario', (player, name, x, y, z, h, teleport = true) => {
  if (!user.isLogin(player)) return;
  //player.playScenario(name);
  user.playScenario(player, name, x, y, z, h, teleport);
});
mp.events.addRemoteCounted('server:stopScenario', (player) => {
  if (!user.isLogin(player)) return;
  //player.playScenario(name);
  user.stopScenario(player);
});

mp.events.addRemoteCounted('server:playNearestScenarioCoord', (player:PlayerMp, x: number, y: number, z: number, r: number) => {
  if (!user.isLogin(player)) return;
  //player.playScenario(name);
  user.playNearestScenarioCoord(player, x, y, z, r);
});

mp.events.addRemoteCounted('server:coffer:addMoney', (player, money) => {
  coffer.addMoney(money);
});

mp.events.addRemoteCounted('server:coffer:removeMoney', (player, money) => {
  coffer.removeMoney(money);
});

mp.events.addRemoteCounted('server:coffer:setMoney', (player, money) => {
  coffer.setMoney(money);
});

mp.events.addRemoteCounted('server:business:addMoney', (player, id, money, ignoreLimit) => {
  business.addMoney(id, money, ignoreLimit);
});



mp.events.addRemoteCounted('server:user:addMoney', (player, money) => {
  user.addMoney(player, money);
});

mp.events.addRemoteCounted('server:user:removeMoney', (player, money) => {
  user.removeMoney(player, money);
});

mp.events.addRemoteCounted('server:user:setMoney', (player, money) => {
  user.setMoney(player, money);
});

mp.events.addRemoteCounted('server:user:addBankMoney', (player, money) => {
  user.addBankMoney(player, money);
});

mp.events.addRemoteCounted('server:user:removeBankMoney', (player, money) => {
  user.removeBankMoney(player, money);
});

mp.events.addRemoteCounted('server:user:setBankMoney', (player, money) => {
  user.setBankMoney(player, money);
});

mp.events.addRemoteCounted('server:user:addCashMoney', (player, money) => {
  user.addCashMoney(player, money);
});

mp.events.addRemoteCounted('server:user:removeCashMoney', (player, money) => {
  user.removeCashMoney(player, money);
});

mp.events.addRemoteCounted('server:user:setCashMoney', (player, money) => {
  methods.saveLog('MoneyDupe', `${user.getRpName(player)} (${user.getId(player)}) ${user.getCashMoney(player)} ${money}`);
  user.setCashMoney(player, money);
});

mp.events.addRemoteCounted('server:business:buy', (player, id) => {
  if (!user.isLogin(player)) return;
  business.buy(player, id);
});

mp.events.addRemoteCounted('server:business:sell', (player) => {
  if (!user.isLogin(player)) return;
  business.sell(player);
});

mp.events.addRemoteCounted('server:houses:buy', (player, id) => {
  if (!user.isLogin(player)) return;
  houses.buy(player, id);
});

mp.events.addRemoteCounted('server:houses:updatePin', (player, id, pin) => {
  if (!user.isLogin(player)) return;
  houses.updatePin(id, pin);
});

mp.events.addRemoteCounted('server:condo:buy', (player, id) => {
  if (!user.isLogin(player)) return;
  condo.buy(player, id);
});

mp.events.addRemoteCounted('server:condo:updatePin', (player, id, pin) => {
  if (!user.isLogin(player)) return;
  condo.updatePin(id, pin);
});

mp.events.addRemoteCounted('server:apartments:updatePin', (player, id, pin) => {
  if (!user.isLogin(player)) return;
  apartments.updatePin(id, pin);
});

mp.events.addRemoteCounted('server:stock:buy', (player, id) => {
  if (!user.isLogin(player)) return;
  stock.buy(player, id);
});

mp.events.addRemoteCounted('server:stock:updatePin1', (player, id, pin) => {
  stock.updatePin1(id, pin);
});

mp.events.addRemoteCounted('server:stock:updatePin2', (player, id, pin) => {
  stock.updatePin2(id, pin);
});

mp.events.addRemoteCounted('server:stock:updatePin3', (player, id, pin) => {
  stock.updatePin3(id, pin);
});

mp.events.addRemoteCounted('server:stock:addLog', (player, name, text, stockId) => {
  stock.addLog(name, text, stockId);
});

mp.events.addRemoteCounted('server:events:floorList', (player, floor, buildId) => {
  if (!user.isLogin(player)) return;

  floor = methods.parseInt(floor);
  buildId = methods.parseInt(buildId);


  apartmentEntity.findAll({where: {
    floor: floor,
    build_id: buildId
  }}).then(rows => {

      let resultData = new Map();
      rows.forEach(function(item) {
        resultData.set(methods.parseInt(item['id']), item['user_name']);
      });
      player.call('client:showApartmentFloorListMenu', [Array.from(resultData)]);
    }
  );
});

mp.events.addRemoteCounted('server:apartments:enter', (player, id) => {
  if (!user.isLogin(player)) return;

  id = methods.parseInt(id);
  let apartData = apartments.getApartData(id);

  if (apartData == null || apartData.get('id') == undefined) {
    player.notify('~r~Ошибка загрузки квартиры #1');
    return;
  }

  let pos = apartments.getInteriorCoords(
    apartData.get('interior_id'),
    apartData.get('is_exterior')
  );
  user.teleport(player, pos.x, pos.y, pos.z);

  player.dimension = id + 100000;
});

mp.events.addRemoteCounted('server:apartments:exit', (player, buildId) => {
  if (!user.isLogin(player)) return;
  buildId = methods.parseInt(buildId);
  user.teleport(
    player,
    enums.buildListData[buildId][0],
    enums.buildListData[buildId][1],
    enums.buildListData[buildId][2]
  );
  player.dimension = 0;
});

mp.events.addRemoteCounted('server:apartments:buy', (player, id) => {
  if (!user.isLogin(player)) return;
  apartments.buy(player, methods.parseInt(id));
});

mp.events.addRemoteCounted('server:events:showApartmentListMenu', (player, buildId) => {
  if (!user.isLogin(player)) return;
  player.call('client:showApartmentListMenu', [enums.buildListData[buildId][3], buildId]);
});

mp.events.addRemoteCounted('server:housePin:buy', async (player, pin, shopId) => {
  if (!user.isLogin(player)) return;
  if (user.getMoney(player) < 20000) {
    player.notify('~r~У Вас недостаточно средств');
    return;
  }

  let hId = user.get(player, 'id_house');
  if (houses.get(hId, 'pin') > 0) {
    player.notify('~r~У Вас уже установлен пинкод');
    let status = await user.accept(player, "Установить заново?");
    if(!status) return;
  }
  user.removeMoney(player, 20000);
  if (shopId == 0) {
    business.addMoney(92, 3000);
    business.addMoney(120, 3500);
    business.addMoney(126, 3500);
  } else {
    business.addMoney(shopId, 10000);
  }
  houses.updatePin(user.get(player, 'id_house'), pin);
  player.notify('~g~Вы произвели апгрейд недвижимости');
});

mp.events.addRemoteCounted('server:apartPin:buy', async (player, pin, shopId) => {
  if (!user.isLogin(player)) return;
  if (user.getMoney(player) < 20000) {
    player.notify('~r~У Вас недостаточно средств');
    return;
  }

  let hId = user.get(player, 'apartment_id');
  if (apartments.get(hId, 'pin') > 0) {
    player.notify('~r~У Вас уже установлен пинкод');
    let status = await user.accept(player, "Установить заново?");
    if(!status) return;
  }
  user.removeMoney(player, 20000);
  if (shopId == 0) {
    business.addMoney(92, 3000);
    business.addMoney(120, 3500);
    business.addMoney(126, 3500);
  } else {
    business.addMoney(shopId, 10000);
  }
  apartments.updatePin(user.get(player, 'apartment_id'), pin);
  player.notify('~g~Вы произвели апгрейд недвижимости');
});

mp.events.addRemoteCounted('server:condoPin:buy', async (player, pin, shopId) => {
  if (!user.isLogin(player)) return;
  if (user.getMoney(player) < 10000) {
    player.notify('~r~У Вас недостаточно средств');
    return;
  }

  let hId = user.get(player, 'condo_id');
  if (condo.get(hId, 'pin') > 0) {
    player.notify('~r~У Вас уже установлен пинкод');
    let status = await user.accept(player, "Установить заново?");
    if(!status) return;
  }
  user.removeMoney(player, 10000);

  if (shopId == 0) {
    business.addMoney(92, 3000);
    business.addMoney(120, 3500);
    business.addMoney(126, 3500);
  } else {
    business.addMoney(shopId, 10000);
  }
  business.addMoney(shopId, 10000);
  condo.updatePin(user.get(player, 'condo_id'), pin);
  player.notify('~g~Вы произвели апгрейд недвижимости');
});

mp.events.addRemoteCounted('server:gun:buy', (player, itemId, price, count, shopId) => {
  if (!user.isLogin(player)) return;
  gun.buy(player, itemId, price, count, shopId);
});

let sellVehList:string[] = [];

mp.events.addRemoteCounted('server:sellVeh', (player, number) => {
  if (!user.isLogin(player)) return;
  let veh = vehicles.findVehicleByNumber(number);
  if (!vehicles.exists(veh)) return;

  if (weather.getHour() < 22 && weather.getHour() > 4) {
    player.notify('~r~Доступно только с 22 до 4 утра игрового времени');
    return;
  }

  if (user.has(player, 'grabVeh')) {
    player.notify('~r~Вы не можете сейчас сбыть транспорт');
    return;
  }

  if(veh.fractiongarage) return player.notify('~r~ТС фракции сбыть нельзя');

  if (sellVehList.includes(veh.numberPlate)){
    return player.notify('~r~Данный ТС сбыть нельзя');
  }

  let money = 100;

  let vInfo = methods.getVehicleInfo(veh.model);

  switch (vInfo.class_name) {
    case 'Emergency':
    case 'Boats':
    case 'Helicopters':
    case 'Planes':
      player.notify('~r~Мы такое не принимаем');
      return;
    case 'Sports Classics':
      money += 350;
      break;
    case 'Sports':
    case 'Super':
      money += 220;
      break;
    case 'SUVs':
    case 'Muscle':
    case 'Off-Road':
      money += 90;
      break;
  }
  user.showLoadDisplay(player);
  money*=3
  user.addCashMoney(player, money);
  user.set(player, 'grabVeh', true);
  sellVehList.push(veh.numberPlate);
  setTimeout(function() {
    if (!user.isLogin(player)) return;
    user.hideLoadDisplay(player);
    player.notify('~g~Вы заработали: ~s~$' + money);
    if (!vehicles.exists(veh)) return;
    vehicles.respawn(veh);
  }, 1000);
});

mp.events.addRemoteCounted('server:lsc:showColor1', (player, number, idx) => {
  if (!user.isLogin(player)) return;
  lsc.showColor1(player, number, idx);
});

mp.events.addRemoteCounted('server:lsc:showColor2', (player, number, idx) => {
  if (!user.isLogin(player)) return;
  lsc.showColor2(player, number, idx);
});

mp.events.addRemoteCounted('server:lsc:buyColor1', (player, number, idx, price, shopId) => {
  if (!user.isLogin(player)) return;
  lsc.buyColor1(player, number, idx, price, shopId);
});

mp.events.addRemoteCounted('server:lsc:buyColor2', (player, number, idx, price, shopId) => {
  if (!user.isLogin(player)) return;
  lsc.buyColor2(player, number, idx, price, shopId);
});

mp.events.addRemoteCounted('server:lsc:resetMod', (player, number) => {
  if (!user.isLogin(player)) return;
  lsc.resetMod(number);
});

mp.events.addRemoteCounted(
  'server:lsc:showLscVehicleTunningMenu',
  (player, shopId, idx, vehNumber, price) => {
    if (!user.isLogin(player)) return;

    try {
      let veh = vehicles.findVehicleByNumber(vehNumber);

      if (!user.isAdmin(player)) {
        if (veh.getVariable('id_user') < 1) {
          player.notify('~r~Транспорт должен быть личный');
          return;
        }
      }

      let vehInfo = methods.getVehicleInfo(veh.model);

      if (
        vehInfo.class_name == 'Cycles' ||
        vehInfo.class_name == 'Helicopters' ||
        vehInfo.class_name == 'Planes' ||
        vehInfo.class_name == 'Commercials'
      ) {
        player.notify('~r~Данный транспорт нельзя тюнинговать');
        return;
      }

      veh.position = new mp.Vector3(lsc.carPos[idx][0], lsc.carPos[idx][1], veh.position.z);
      veh.rotation = new mp.Vector3(0, 0, lsc.carPos[idx][3]);

      player.call('client:menuList:showLscVehicleTunningMenu', [
        shopId,
        idx,
        vehNumber,
        veh.id,
        price,
      ]);
    } catch (e) {
      methods.debug(e);
    }
  }
);

// mp.events.addRemoteCounted(
//   'server:lsc:showLscVehicleSTunningMenu',
//   (player, shopId, idx, vehNumber, price) => {
//     if (!user.isLogin(player)) return;

//     try {
//       let veh = vehicles.findVehicleByNumber(vehNumber);

//       if (veh.getVariable('id_user') < 1) {
//         player.notify('~r~Транспорт должен быть личный');
//         return;
//       }

//       let vehInfo = methods.getVehicleInfo(veh.model);

//       if (
//         vehInfo.class_name == 'Cycles' ||
//         vehInfo.class_name == 'Helicopters' ||
//         vehInfo.class_name == 'Planes' ||
//         vehInfo.class_name == 'Motorcycles' ||
//         vehInfo.class_name == 'Commercials' ||
//         vehInfo.class_name == 'Vans'
//       ) {
//         player.notify('~r~Данный транспорт нельзя тюнинговать');
//         return;
//       }

//       if (vehInfo.fuel_full == 1) {
//         player.notify('~r~Электрокары нельзя тюнинговать');
//         return;
//       }

//       veh.position = new mp.Vector3(lsc.carPos[idx][0], lsc.carPos[idx][1], veh.position.z);
//       veh.rotation = new mp.Vector3(0, 0, lsc.carPos[idx][3]);

//       player.call('client:menuList:showLscVehicleSTunningMenu', [
//         shopId,
//         idx,
//         vehNumber,
//         veh.id,
//         price,
//       ]);
//     } catch (e) {
//       methods.debug(e);
//     }
//   }
// );

mp.events.addRemoteCounted('server:lsc:checkTun', (player, vehNumber, modType, idx) => {
  if (!user.isLogin(player)) return;
  lsc.showTun(player, vehNumber, modType, idx);
});


mp.events.addRemoteCounted('server:tattoo:buy', (player, slot, type, zone, price, shopId) => {
  if (!user.isLogin(player)) return;
  tattoo.buy(player, slot, type, zone, price, shopId);
});

mp.events.addRemoteCounted('server:print:buy', (player, slot, type, price) => {
  if (!user.isLogin(player)) return;
  tattoo.buyPrint(player, slot, type, price);
});

mp.events.addRemoteCounted('server:tattoo:clear', (player, zone, price, shopId) => {
  if (!user.isLogin(player)) return;
  tattoo.clear(player, zone, price, shopId);
});

mp.events.addRemoteCounted(
  'server:lsc:buyTun',
  (player, vehNumber, modType, idx, price, shopId) => {
    if (!user.isLogin(player)) return;
    lsc.buyTun(player, vehNumber, modType, idx, price, shopId);
  }
);

mp.events.addRemoteCounted('server:lsc:resetSTun', (player, vehNumber, modType) => {
  if (!user.isLogin(player)) return;
  lsc.resetSTun(player, vehNumber, modType);
});

mp.events.addRemoteCounted('server:lsc:buy', (player, number, price, shopId, action, newNumber) => {
  if (!user.isLogin(player)) return;
  lsc.buy(player, number, price, shopId, action, newNumber);
});

mp.events.addRemoteCounted('server:shop:buy', (player, itemId, price, shopId, nalog = 0) => {

  if (!user.isLogin(player)) return;
  shop.buy(player, itemId, price, shopId, nalog);
});

mp.events.addRemoteCounted('server:licenseCenter:buy', (player, type, price) => {
  if (!user.isLogin(player)) return;
  methods.debug('Event: server:licenseCenter:buy');
  licenseCenter.buy(player, type, price);
});

mp.events.addRemoteCounted('server:rent:buy', (player, hash, price, shopId) => {
  if (!user.isLogin(player)) return;
  rent.buy(player, hash, player.position, price, shopId);
});

mp.events.addRemoteCounted('server:user:respawn', (player, x, y, z) => {
  if (!user.isLogin(player)) return;
  player.spawn(new mp.Vector3(x, y, z));
});



// Server debug

mp.events.addRemoteCounted('server:debug:print', (player, text) => {
  if (!user.isLogin(player)) return;
  console.log(text);
});

mp.events.addRemoteCounted('server:changeWaypointPos', (player, x, y) => {
  if (!user.isLogin(player)) return;
  if (!vehicles.exists(player.vehicle)) return;
  player.waypoint = {x,y}
  player.vehicle.getOccupants().forEach((p) => {
    if (!user.isLogin(p)) return;
    user.setWaypoint(p, x, y);
  });
});

mp.events.addRemoteCounted('server:setTimeout', (player, miliseconds, callbackEvent) => {
  setTimeout(function() {
    if(!user.isLogin(player)) return;
    player.call(callbackEvent);
  }, miliseconds);
});

let count = 0;

let hashes: [number, number][] = [];


mp.events.addRemoteCounted(
  'server:inventory:equipItem',
  (player, id, itemId, prefix, number, keyId, countItems) => {
    if (!user.isLogin(player)) return;     
    
    if (!inventory.allItemsMap().has(id)) {
      methods.saveLog(
        'ErrorEquip',
        `${user.getRpName(player)} (${user.getId(
          player
        )}) - try equip: ${itemId}, ${prefix}, ${number}, ${countItems}`
      );
      player.notify('~r~Предмета не существует на сервере');
    } else {
      let item = inventory.allItemsMap().get(id);
      if(item.item_id != itemId) return player.notify(`~r~Действие не выполнимо`);
      if(item.owner_type != 1 || item.owner_id != user.getId(player)) return player.notify(`~r~Этот предмет вам более не принадлежит`);
      switch (itemId) {
        case 50:
          user.set(player, 'bank_number', number);
          user.set(player, 'bank_prefix', prefix);

          user.setBankMoney(player, methods.parseInt(item.count));

          player.notify('~g~Вы экипировали банковскую карту');
          inventory.deleteItem(id);
          user.updateClientCache(player);
          break;
        case 140:
        case 141:
          user.addCashMoney(player, countItems);
          player.notify(`~g~Вы положили $${methods.numberFormat(countItems)} в кошелёк`);
          inventory.deleteItem(id);
          break;
      }

      user.log(player, "PlayerInventoryInterraction", `Экипировал @item${id} ${items.getItemNameById(itemId)}`)
      inventory.updateInventory(player);
    }
  }
);

mp.events.addRemoteCounted('server:inventory:unEquip', async (player, itemId) => {
  if (!user.isLogin(player)) return;

  switch (itemId) {
    case 50: {
      if (user.get(player, 'bank_number') == 0) {
        player.notify('~r~Сначала надо экипировать карту');
        return;
      }
      await inventory.addItem(
        player,
        50,
        1,
        inventory.types.Player,
        user.getId(player),
        user.get(player, 'money_bank'),
        user.get(player, 'bank_prefix'),
        user.get(player, 'bank_number'),
        -1
      );

      user.set(player, 'bank_number', 0);
      user.set(player, 'bank_prefix', 0);

      user.setBankMoney(player, 0);

      player.notify('~g~Вы убрали банковскую карту');
      inventory.updateInventory(player);
      user.updateClientCache(player);
      break;
    }
  }
  user.log(player, "PlayerInventoryInterraction", `Снял с экипировки ${items.getItemNameById(itemId)}`)
  //user.updateClientCache(player);
});

mp.events.addRemoteCounted('server:inventory:equipGun', (player, id, hash) => {
  if (!user.isLogin(player)) return;

  let item = inventory.getById(id)

  
  if (!item) {
    methods.saveLog(
      'ErrorEquip',
      `${user.getRpName(player)} (${user.getId(player)}) - try equip GUN: ${hash}`
    );
    player.notify('~r~Предмета не существует на сервере');
  } else {
    if(user.hasWeapon(player, item.item_id)){
      player.notify('~r~Данное оружие уже экипировано');
      return inventory.openInventory(player);
    }
    if (inventory.currentAmount(1, user.getId(player)) > inventory.maxAmount(1, user.getId(player))) {
      player.notify('~r~У вас перевес');
      return;
    }
    inventory.deleteItem(id);
    player.notify('~g~Вы экипировали оружие');
    user.giveWeaponByHash(player, hash, 0);
    user.updateClientCache(player);
    user.log(player, "PlayerInventoryInterraction", `Экипировал оружие ${items.getItemNameById(item.item_id)}`)
    inventory.updateInventory(player);
  }
});

mp.events.addRemoteCounted('server:inventory:getItemList', (player, ownerType, ownerId) => {
  if (!user.isLogin(player)) return player.notify("Вы не авторизованы");
  inventory.getItemList(player, ownerType, ownerId);
});

mp.events.addRemoteCounted('server:inventory:closeItemMenu', (player, id) => {
  mp.players.call('client:inventory:closeItemMenu', [id]);
});

mp.events.addRemoteCounted(
  'server:inventory:dropItem',
  (player, id, itemId, posX, posY, posZ, rotX, rotY, rotZ, model, ownerType, ownerId) => {
    if (!user.isLogin(player)) return;
    inventory.dropItem(
      player,
      id,
      itemId,
      posX,
      posY,
      posZ,
      rotX,
      rotY,
      rotZ,
      model,
      ownerType,
      ownerId
    );
  }
);

mp.events.addRemoteCounted('server:inventory:getItemListInRadius', (player, posX, posY) => {
  if (!user.isLogin(player)) return;
  inventory.getItemListInRadius(player, posX, posY);
});

mp.events.addRemoteCounted('server:inventory:updateItemOwner', (player, id, ownerType, ownerId) => {
  if (!user.isLogin(player)) return;
  if(ownerType == 8) ownerId = methods.convertNumberToHash(ownerId);
  inventory.updateItemOwner(player, id, ownerType, ownerId);
});

mp.events.addRemoteCounted('server:inventory:updateAmount', (player, id, type) => {
  if (!user.isLogin(player)) return;
  if(type == 8) methods.convertNumberToHash(id);
  inventory.updateAmount(player, id, type);
});

mp.events.addRemoteCounted('server:inventory:deleteDropItem', (player, id) => {
  inventory.deleteDropItem(id);
  inventory.updateInventory(player);
});

mp.events.addRemoteCounted('server:inventory:deleteItem', (player, id) => {
  if (!user.isLogin(player)) return;
  if(!user.getItemById(player, id)) return;
  inventory.deleteItem(id);
  inventory.updateInventory(player);
});

mp.events.addRemoteCounted('server:inventory:useItem', (player, id, itemId) => {
  if (!user.isLogin(player)) return;
  inventory.useItem(player, id, itemId);
});

mp.events.addRemoteCounted(
  'server:inventory:addItem',
  async (player, itemId, count, ownerType, ownerId, countItems, prefix, number, keyId) => {
    if (!user.isLogin(player)) return;
    await inventory.addItem(player, itemId, count, ownerType, ownerId, countItems, prefix, number, keyId);
    user.log(player, "PlayerInventoryInterraction", `Выдан предмет x${countItems} @item_id${itemId} ${items.getItemNameById(itemId)} @inventorytype${ownerType} @inventoryid${ownerId} number ${number} key ${keyId}`)
    player.notify("~g~Предмет выдан");
    inventory.updateInventory(player);
  }
);


mp.events.addRemoteCounted('server:inventory:updateItemCount', (player, id, count) => {
  if (!user.isLogin(player)) return;
  inventory.updateItemCount(id, count);
});


// Inventory System End


let givedLic:Map<string,boolean> = new Map();

mp.events.addRemoteCounted('server:giveLic', (player, id, licName) => {
  if (!user.isLogin(player)) return;
  let licLabel = '';
  switch (licName) {
    case 'allow_marg':
      licLabel = 'рецепт на марихуану';
      break;
    case 'allow_antipohmel':
      licLabel = 'рецепт на антипохмелин';
      break;
    case 'biz_lic':
      licLabel = 'лицензию на бизнес';
      break;
    case 'fish_lic':
      licLabel = 'лицензию на рыбалку';
      break;
    case 'gun_lic':
      licLabel = 'лицензию на оружие';
      break;
    case 'med_lic':
      licLabel = 'мед. страховку';
      break;
    case 'law_lic':
      licLabel = 'лицензию адвоката';
      break;
  }

  if(givedLic.has(id+"_"+licName)) return player.notify("~r~Человек уже получал "+licLabel+"\nОграничение: 1 в ООС сутки");

  mp.players.forEach(function(p) {
    if (p.getVariable('id') == id) {
      if (methods.distanceToPos(p.position, player.position) < 2) {
        if (user.get(player, 'is_gos_blacklist')) {
          player.notify('~r~Данный человек состоит в чёрном списке');
          return;
        }

        givedLic.set(id+"_"+licName, true);

        user.set(p, licName, true);
        p.notify('~g~Вам выдали: ~s~' + licLabel);
        player.notify('~g~Вы выдали: ~s~' + licLabel);

        user.addHistory(p, 4, 'Получил ' + licLabel + '. Выдал: ' + user.getRpName(player));
        user.updateClientCache(p);
      } else player.notify('~y~Игрок слишком далеко');
    }
  });
});

mp.events.addRemoteCounted('server:removeLic', (player, id, licName) => {
  if (!user.isLogin(player)) return;
  if(user.get(player, 'rank') < 7) return player.notify('~y~Ваш ранг слишком низкий для этого');
  let licLabel = '';
  switch (licName) {
    case 'allow_marg':
      licLabel = 'рецепт на марихуану';
      break;
    case 'biz_lic':
      licLabel = 'лицензию на бизнес';
      break;
    case 'fish_lic':
      licLabel = 'лицензию на рыбалку';
      break;
    case 'gun_lic':
      licLabel = 'лицензию на оружие';
      break;
    case 'med_lic':
      licLabel = 'мед. страховку';
      break;
    case 'law_lic':
      licLabel = 'лицензию адвоката';
      break;
  }

  mp.players.forEach(function(p) {
    if (p.getVariable('id') == id) {
      if (methods.distanceToPos(p.position, player.position) < 2) {

        user.set(p, licName, false);
        p.notify('~g~У вас изъяли: ~s~' + licLabel);
        player.notify('~g~Вы вас изъяли: ~s~' + licLabel);

        user.addHistory(p, 4, 'Изъято ' + licLabel + '. Изъял: ' + user.getRpName(player));
        user.updateClientCache(p);
      } else player.notify('~y~Игрок слишком далеко');
    }
  });
});

mp.events.addRemoteCounted('server:takeLic', (player, id, licName) => {
  if (!user.isLogin(player)) return;
  let licLabel = '';
  switch (licName) {
    case 'allow_marg':
      licLabel = 'рецепт на марихуану';
      break;
    case 'biz_lic':
      licLabel = 'лицензию на бизнес';
      break;
    case 'fish_lic':
      licLabel = 'лицензию на рыбалку';
      break;
    case 'gun_lic':
      licLabel = 'лицензию на оружие';
      break;
    case 'med_lic':
      licLabel = 'мед. страховку';
      break;
    case 'law_lic':
      licLabel = 'лицензию адвоката';
      break;
    case 'a_lic':
      licLabel = 'лицензию категории B';
      break;
    case 'b_lic':
      licLabel = 'лицензию категории B';
      break;
    case 'c_lic':
      licLabel = 'лицензию категории C';
      break;
  }

  mp.players.forEach(function(p) {
    if (p.getVariable('id') == id) {
      if (methods.distanceToPos(p.position, player.position) < 2) {
        user.set(p, licName, false);
        p.notify('~g~У Вас изъяли: ~s~' + licLabel);
        player.notify('~g~Вы изъяли: ~s~' + licLabel);
        user.addHistory(p, 4, 'Изъяли ' + licLabel + '. Изъял: ' + user.getRpName(player));
        user.updateClientCache(p);
      } else player.notify('~y~Игрок слишком далеко');
    }
  });
});

mp.events.addRemoteCounted('server:mafiaWar:attack', (player) => {
  if (!user.isLogin(player)) return;
  mafiaWar.startWar(player);
});


mp.events.addRemoteCounted('server:mafiaWar:takeBank', (player, id, sum) => {
  if (!user.isLogin(player)) return;
  mafiaWar.takeBank(player, id, sum);
});
setTimeout(() => {
  mp.events.register('server:mafiaWar:attack', (player) => {
    if (!user.isLogin(player) || !user.isSubLeader(player) || !user.isMafia(player)) return;
    mafiaWar.startWar(player);
  });
  mp.events.register('server:mafiaWar:takeBank', (player, id, sum) => {
    if (!user.isLogin(player) || !user.isLeader(player) || !user.isMafia(player)) return;
    mafiaWar.takeBank(player, id, sum);
  });
}, 200)



mp.events.addRemoteCounted('server:getMafiaGunCar0', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.Ammo) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 1;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    user.removeCashMoney(player, mafiaCars.Ammo);

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );

    let numberPlate = vehicles.generateNumber();
    player.notify('~b~Фургон был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Burrito3', numberPlate);
      let numberHash = methods.convertNumberToHash(numberPlate);

      setTimeout(function() {
        let items:[string,number][] = [
          ["30", 5],
          ["29", 5],
          ["28", 5],
          ["153", 10],
          ["27", 10],
          ["146", 2],
        ];
        veh.setVariable('chestWeaponItems', JSON.stringify(items));
        dispatcher.sendPos('Код 2', `Марка: ~y~Burrito3~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
      
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:getMafiaGunCar1', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.EasyWeapon) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 2;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    user.removeCashMoney(player, mafiaCars.EasyWeapon);

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );

    let numberPlate = vehicles.generateNumber();
    player.notify('~b~Фургон был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Burrito3', numberPlate);
      let numberHash = methods.convertNumberToHash(numberPlate);

      
      setTimeout(function() {
        let items:[string,number][] = [
          ["77", 10],
          ["71", 5],
          ["101", 4],
          ["63", 2],
          ["153", 5],
          ["27", 10],
               ];
        veh.setVariable('chestWeaponItems', JSON.stringify(items));
        dispatcher.sendPos('Код 2', `Марка: ~y~Burrito3~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:getMafiaGunCar2', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.MediumWeapon) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 3;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    user.removeCashMoney(player, mafiaCars.MediumWeapon);

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );

    let numberPlate = vehicles.generateNumber();

    player.notify('~b~Фургон был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Burrito3', numberPlate);
      let numberHash = methods.convertNumberToHash(numberPlate);

      setTimeout(function() {

        let items:[string,number][] = [
          ["101", 10],
          ["94", 5],
          ["87", 2],
          ["153", 15],
          ["28", 5],
                   ];
        veh.setVariable('chestWeaponItems', JSON.stringify(items));

        dispatcher.sendPos('Код 2', `Марка: ~y~Burrito3~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:getMafiaGunCar3', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.HardWeapon) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 4;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    user.removeCashMoney(player, mafiaCars.HardWeapon);

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );

    let numberPlate = vehicles.generateNumber();

    player.notify('~b~Фургон был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Burrito3', numberPlate);
      let numberHash = methods.convertNumberToHash(numberPlate);


      let items:[string,number][] = [
        ["106", 6],
        ["117", 1],
        ["108", 4],
        ["112", 4],
        ["30", 15],
        ["146", 2],
      ];
      veh.setVariable('chestWeaponItems', JSON.stringify(items));

      setTimeout(function() {
        dispatcher.sendPos('Код 2', `Марка: ~y~Burrito3~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:getMafiaDrugCar', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.HardDrugs) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 5;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );

    let numberPlate = vehicles.generateNumber();
    player.notify('~b~ТС был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    user.removeCashMoney(player, mafiaCars.HardDrugs);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Habanero', numberPlate);
      let numberHash = methods.convertNumberToHash(numberPlate);

      let items:[string,number][] = [
        ["156", 1],
        ["176", 1],
        ["177", 1],
        ["178", 1],
        ["179", 1],
        ["180", 1],
      ];
      veh.setVariable('chestWeaponItems', JSON.stringify(items));

      setTimeout(function() {
        dispatcher.sendPos('Код 2', `Марка: ~y~Habanero~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:getMafiaMargCar', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.LightDrugs) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }


    const vehcarid = 6;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );
    let numberPlate = vehicles.generateNumber();

    player.notify('~b~ТС был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);


    user.removeCashMoney(player, mafiaCars.LightDrugs);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Primo', numberPlate);
      let numberHash = methods.convertNumberToHash(numberPlate);
      let items:[string,number][] = [
        ["145", 1],
        ["143", 1],
       ];
      veh.setVariable('chestWeaponItems', JSON.stringify(items));

      setTimeout(function() {
        dispatcher.sendPos('Код 2', `Марка: ~y~Primo~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:getMafiaSpecialCar', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.Special) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 7;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );
    user.removeCashMoney(player, mafiaCars.Special);
    let numberPlate = vehicles.generateNumber();
    player.notify('~b~ТС был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Asea', numberPlate);
      let items:[string,number][] = [
        ["276", 1],
        ["40", 2],
      ];
      veh.setVariable('chestWeaponItems', JSON.stringify(items));
      let numberHash = methods.convertNumberToHash(numberPlate);
      setTimeout(function() {
        dispatcher.sendPos('Код 2', `Марка: ~y~Asea~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});


mp.events.addRemoteCounted('server:getMafiaC4Car', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.getCashMoney(player) < mafiaCars.Bomb) {
      player.notify('~r~У Вас недостаточно денег на руках');
      return;
    }

    const vehcarid = 8;
    const fractionid = user.get(player, 'fraction_id');
    if(mafiaCarsCd.has(fractionid+"_"+vehcarid)) return player.notify("~r~Данный фургон временно недоступен к заказу")
    mafiaCarsCd.set(fractionid+"_"+vehcarid, true);
    setTimeout(() => {mafiaCarsCd.delete(fractionid+"_"+vehcarid)}, mafiaCarsCdtimer)

    let posId = methods.getRandomInt(0, enums.mafiaVehPos.length - 1);
    let pos = new mp.Vector3(
      enums.mafiaVehPos[posId][0],
      enums.mafiaVehPos[posId][1],
      enums.mafiaVehPos[posId][2]
    );

    user.removeCashMoney(player, mafiaCars.Bomb);

    let numberPlate = vehicles.generateNumber();
    player.notify('~b~ТС был доставлен на точку');
    player.notify('~b~Номера: ~s~' + numberPlate);
    user.setWaypointTarget(player, pos.x, pos.y, pos.z);

    setTimeout(function() {
      let veh = vehicles.spawnCar(pos, enums.mafiaVehPos[posId][3], 'Asea', numberPlate);
      let items:[string,number][] = [
        ["262", 5],
      ];
      veh.setVariable('chestWeaponItems', JSON.stringify(items));
      let numberHash = methods.convertNumberToHash(numberPlate);
      setTimeout(function() {
        dispatcher.sendPos('Код 2', `Марка: ~y~Asea~s~\nНомера: ~y~${numberPlate}`, pos, false);
      }, 60000);
    }, 60000);
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:removeAllWeaponsNearst', (player) => {
  if (!user.isLogin(player)) return;
  let pl = methods.getNearestPlayerWithPlayer(player, 2);
  if (pl && mp.players.exists(pl)) {
    if (!user.isTie(pl) && !user.isCuff(pl)) {
      player.notify('~r~Игрок должен быть связан или в наручниках');
      return;
    }
    pl.removeAllWeapons();
    //pl.call('client:dropAllWeapons');
    player.notify('~b~Вы изъяли у игрока всё оружие');
  } else player.notify('~r~Рядом с вами никого нет');
});

mp.events.addRemoteCounted('server:user:grab', (player, shopId) => {
  if (!user.isLogin(player)) return;
  if(player.dimension != 0) return player.notify('~r~Нельзя грабить в виртуальном измерении');
  user.grab(player, shopId);
});

// mp.events.addRemoteCounted('server:getInvNearst', (player) => {
//   if (!user.isLogin(player)) return;
//   let pl = methods.getNearestPlayerWithPlayer(player, 2);
//   if (pl && mp.players.exists(pl)) {
//     if (!user.isTie(pl) && !user.isCuff(pl)) {
//       player.notify('~r~Игрок должен быть связан или в наручниках');
//       return;
//     }
//     // if (pl.getVariable('cuffedByGos') || !user.isGos(player)) {
//     //   player.notify('~r~Вы не можете обыскать данного игрока');
//     //   return;
//     // }
//     inventory.getItemList(player, inventory.types.Player, user.getId(pl));
//   } else player.notify('~r~Рядом с вами никого нет');
// });

mp.events.addRemoteCounted('server:inCarNearst', (player) => {
  if (!user.isLogin(player)) return;
  let pl = methods.getNearestPlayerWithPlayer(player, 2);
  if (pl && mp.players.exists(pl)) {
    if (!user.isTie(pl) && !user.isCuff(pl)) {
      player.notify('~r~Игрок должен быть связан или в наручниках');
      return;
    }
    let v = methods.getNearestVehicleWithCoords(player.position, 7);
    if (v && mp.vehicles.exists(v)) {
      let seats:Map<number,boolean> = new Map();
      seats.set(0, true);
      seats.set(1, true);
      seats.set(2, true);
      v.getOccupants().forEach(nuser => {
        seats.delete(nuser.seat);
      })
      if([...seats].length == 0) return player.notify('~r~В ближайшем ТС нет свободных мест');
      if (seats.has(1)) pl.putIntoVehicle(v, RAGE_BETA ? 2 : 1);
      else if (seats.has(2)) pl.putIntoVehicle(v, RAGE_BETA ? 3 : 2);
      else if (seats.has(0)) pl.putIntoVehicle(v, RAGE_BETA ? 1 : 0);
      player.notify('~g~Вы затащили человека в транспорт');
      pl.notify('~r~Вас затащили в транспорт');
    } else {
      player.notify('~r~Рядом с вами нет транспорта');
    }
  } else player.notify('~r~Рядом с вами никого нет');
});

mp.events.addRemoteCounted('server:removeFromCar', (player) => {
  if (!user.isLogin(player)) return;
  let pl = methods.getNearestPlayerWithPlayer(player, 3.5);
  if (pl && mp.players.exists(pl)) {
    if (!user.isTie(pl) && !user.isCuff(pl)) {
      player.notify('~r~Игрок должен быть связан или в наручниках');
      return;
    }
    if (pl.vehicle && mp.vehicles.exists(pl.vehicle)) {
      pl.removeFromVehicle();
      player.notify('~g~Вы вытащили человека из транспорта');
      pl.notify('~r~Вас вытащили из транспорта');
    } else {
      player.notify('~r~Игрок не в транспорте');
    }
  } else player.notify('~r~Рядом с вами никого нет');
});

mp.events.add('playerDeath', (player:PlayerMp) => {
  user.unCuff(player);
  user.unTie(player);
})

mp.events.addRemoteCounted('server:unCuffNearst', async (player) => {
  if (!user.isLogin(player)) return;
  let pl = methods.getNearestPlayerWithPlayer(player, 2);
  if(!pl) return player.notify("Поблизости никого нет")
  if(!user.isCuff(pl)) return player.notify("Игрок уже не в наручниках");
  if (pl && mp.players.exists(pl)) {

    let status = true;

    if(!user.isGos(player) && pl.getVariable('cuffedByGos')){
      if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263) && !inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 4)){
        return player.notify("~r~Требуется "+items.getItemNameById(4)+" либо "+items.getItemNameById(263));
      }
      player.notify("Вставьте обе отмычки в один из замков и взламывайте, нажимая SPACE. Выполните это действие с двумя замками")
      user.headingToTarget(player, pl.id)
      setTimeout(() => {
        if(mp.players.exists(player))
        user.playAnimation(player, "mini@repair", "fixing_a_ped", 9)
      }, 3000)
      status = await user.minigame(player, "unlock");
      user.stopAnimation(player);
    }
    if(!status){
      if(methods.getRandomInt(1, 5) == 5){
        if(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 4)){
          inventory.deleteItem(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 4).id);
          player.notify("~r~Вы сломали "+items.getItemNameById(4))
        } else if(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
          inventory.deleteItem(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263).id);
          player.notify("~r~Вы сломали "+items.getItemNameById(263))
        }
      }
      return player.notify("~r~Вам не удалось снять наручники");
    }
    if(!mp.players.exists(pl)) return;
    if(player.dist(pl.position) > 3) return player.notify("~r~Игрок отошёл слишком далеко")
    methods.saveLog(
      'PlayerCuff',
      `${user.get(pl, 'rp_name')} (${user.getId(pl)}) uncuffed by ${user.get(
        player,
        'rp_name'
      )} (${user.getId(player)})`
    );
    chat.sendMeCommand(player, `снял наручники с человека рядом (${user.getId(pl)})`);
    user.stopAnimation(pl);
    user.headingToTarget(player, pl.id)
    user.playAnimation(player, 'mp_arresting', 'a_uncuff', 8);
    user.unCuff(pl);
    user.loginterract(player, pl, "PlayerUnCuffed", `снял наручники`)
    inventory.addItem(player, 40, 1, 1, user.getId(player), 1, -1, -1, -1)
  } else player.notify('~r~Рядом с вами никого нет');
});

mp.events.addRemoteCounted('server:cuffNearst', (player) => {
  if (!user.isLogin(player)) return;
  let pl = methods.getNearestPlayerWithPlayer(player, 2);
  if (pl && mp.players.exists(pl)) {

    let rows = inventory.allItems().find((item) => item.owner_id == user.getId(player) && item.owner_type == 1 && item.item_id == 40);
    if (!rows) return player.notify('~r~У Вас нет наручников');
    if(!user.checkCanHandCuff(player, pl)) return;
    inventory.deleteItem(rows.id);
    user.arrestAnimation(player, pl).then(() => {
      if(!user.checkCanHandCuff(player, pl)) return;
      user.loginterract(player, pl, "PlayerCuffed", `надел наручники`)
      chat.sendMeCommand(player, `надел наручники на человека рядом (${user.getId(pl)})`);
      user.cuff(pl);
      if (user.isGos(player)) pl.setVariable('cuffedByGos', true);
      log.new("PlayerCuffed", `${log.convertIdPlayerToData(player)} надел наручники на ${log.convertIdPlayerToData(pl)}`)
    });
    
      
  } else player.notify('~r~Рядом с вами никого нет');
});

mp.events.addRemoteCounted('server:gps:findFleeca', (player) => {
  if (!user.isLogin(player)) return;
  let pos = bank.findNearestFleeca(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findFleeca', (player) => {
  if (!user.isLogin(player)) return;
  let pos = bank.findNearestFleeca(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:find247', (player) => {
  if (!user.isLogin(player)) return;
  let pos = shop.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findCloth', (player) => {
  if (!user.isLogin(player)) return;
  let pos = cloth.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findFuel', (player) => {
  if (!user.isLogin(player)) return;
  let pos = fuel.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findRent', (player) => {
  if (!user.isLogin(player)) return;
  let pos = rent.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findGunShop', (player) => {
  if (!user.isLogin(player)) return;
  let pos = gun.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findBar', (player) => {
  if (!user.isLogin(player)) return;
  let pos = bar.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findBarberShop', (player) => {
  if (!user.isLogin(player)) return;
  let pos = barberShop.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findLsc', (player) => {
  if (!user.isLogin(player)) return;
  let pos = lsc.findNearest(player.position);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:gps:findAutosalon1', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(1);
  user.setWaypoint(player, pos.x, pos.y);
});
mp.events.addRemoteCounted('server:gps:findAutosalon2', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(2);
  user.setWaypoint(player, pos.x, pos.y);
});
mp.events.addRemoteCounted('server:gps:findAutosalon3', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(3);
  user.setWaypoint(player, pos.x, pos.y);
});
mp.events.addRemoteCounted('server:gps:findAutosalon4', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(4);
  user.setWaypoint(player, pos.x, pos.y);
});
mp.events.addRemoteCounted('server:gps:findAutosalon5', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(5);
  user.setWaypoint(player, pos.x, pos.y);
});
mp.events.addRemoteCounted('server:gps:findAutosalon6', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(6);
  user.setWaypoint(player, pos.x, pos.y);
});
mp.events.addRemoteCounted('server:gps:findAutosalon7', (player) => {
  if (!user.isLogin(player)) return;
  let pos = autosalon.findNearest(7);
  user.setWaypoint(player, pos.x, pos.y);
});

mp.events.addRemoteCounted('server:user:setAlpha', (player, amount) => {
  if (!user.isLogin(player)) return;
  player.alpha = amount;
});

mp.events.addRemoteCounted('server:user:cuff', (player) => {
  if (!user.isLogin(player)) return;
  if(player.vehicle){
    return;
  }
  user.cuff(player);
});

mp.events.addRemoteCounted('server:user:unCuff', (player) => {
  if (!user.isLogin(player)) return;
  user.unCuff(player);
});

mp.events.addRemoteCounted('server:user:tie', (player) => {
  if (!user.isLogin(player)) return;
  user.tie(player);
});

mp.events.addRemoteCounted('server:user:unTie', (player) => {
  if (!user.isLogin(player)) return;
  user.unTie(player);
});

mp.events.addRemoteCounted('server:giveWeapon', (player, model, pt) => {
  if (!user.isLogin(player)) return;
  player.giveWeapon(model, pt);
});

let arrestMapTimer = new Map<number,boolean>();


mp.events.addRemoteCounted('server:user:arrest', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (user.get(p, 'jail_time') > 0) return player.notify(`~r~Игрок в тюрьме`);
      if (!user.isLogin(p) || user.get(p, 'wanted_level') <= 0) {
        player.notify('~r~У игрока нет розыска');
        return;
      }
      if(player.dist(p.position) > 10) return player.notify(`~r~Игрок слишком далеко от вас`)
      if(user.get(p, 'jailed')){
        player.notify('~r~Игрок уже в тюрьме');
        return;
      }
      if (arrestMapTimer.has(user.getId(p))){
        player.notify('~g~Вы произвели арест');
      } else {
        user.addCashMoney(player, 1500);
        player.notify('~g~Вы произвели арест. Премия: ~s~$1500');
        const qid = user.getId(p)
        arrestMapTimer.set(qid, true)
        setTimeout(() => {
          arrestMapTimer.delete(qid)
        }, 60000*30)
      }
      user.addCashMoney(player, 1500);
      player.notify('~g~Вы произвели арест. Премия: ~s~$1500');
      user.arrest(p);
    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:giveWanted', (player, id, level, reason) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (user.get(p, 'jail_time') > 0) return player.notify(`~r~Игрок в тюрьме`);
      if (reason == 'clear') {
        if(p.id == player.id){
          player.notify('~r~Вы не можете снять розыск с самого себя');
          return;
        }
        logFractionGunEntity.create({
          name: user.getRpName(player), 
          do: user.getRpName(p) + ' - Очистил розыск',
          fraction_id: user.getPlayerFraction(player),
          timestamp: methods.getTimeStamp()
        });
        player.notify('~g~Вы очистили розыск');
      } else {
        if (user.get(p, 'mask') > 0) player.notify('~r~Розыск не был выдан. Игрок в маске');
        else player.notify('~g~Вы выдали розыск');
      }
      methods.saveLog(
        'GiveWanted',
        `${user.getRpName(player)} give to ${user.getRpName(p)} - ${level} - ${reason}`
      );
      user.loginterract(player, p, "GosWanted", "Выдал розыск "+level+"ур. "+reason)
      user.giveWanted(p, level, reason);
    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});
mp.events.register('server:user:giveWanted', async (player, id, level = 0, reason = "clear") => {
  if (!user.isLogin(player)) return;
  try {
    const mafia = user.isMafia(player)
    if(!mafia && !user.isGos(player)) return player.notify(`~r~У вас нет доступа`);
    else if(mafia && !user.isMafia(player)) return player.notify(`~r~У вас нет доступа`);
    else if(mafia && reason != 'clear') return player.notify(`~r~Розыск можно только снять`);
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (user.get(p, 'jail_time') > 0) return player.notify(`~r~Игрок в тюрьме`);
      if(user.get(p, "jail_time") > 0) return player.notify(`~g~Игрок в тюрьме. Выдать или снять розыск нельзя`)
      if (reason == 'clear') {
        
        if(p.id == player.id){
          player.notify('~r~Вы не можете снять розыск с самого себя');
          return;
        }
        if (user.get(p, 'wanted_level') == 0) {
          player.notify('~r~Игрок не в розыске');
          return;
        }
        if(mafia){
          if (user.getMoney(player) < 10000) {
            player.notify('~r~У Вас недостаточно денег');
            return;
          }
          if (methods.distanceToPos(p.position, player.position) > 10) {
            player.notify('~r~Вы должны находиться рядом друг с другом');
            return;
          }
          
          player.notify('~g~Ожидаем согласия')
          let status = await user.accept(p, "Снять розыск?");
          if(!mp.players.exists(player)) return;
          if(!status) return player.notify("~r~Игрок отказался")
          if (user.getMoney(player) < 10000) {
            player.notify('~r~У Вас недостаточно денег');
            return;
          }
          if (methods.distanceToPos(p.position, player.position) > 10) {
            player.notify('~r~Вы должны находиться рядом друг с другом');
            return;
          }
          if (user.get(p, 'wanted_level') == 0) {
            player.notify('~r~Игрок не в розыске');
            return;
          }
          player.notify("~g~Розыск снят")
          p.notify("~g~Розыск снят")
          user.removeMoney(player, 10000);
        } else {
          logFractionGunEntity.create({
            name: user.getRpName(player),
            do: user.getRpName(p) + ' - Очистил розыск',
            fraction_id: user.getPlayerFraction(player),
            timestamp: methods.getTimeStamp()
          });
        }
        chat.sendFractionMessage(player, user.getPlayerFraction(player), `Очистил розыск гражданину ${user.getId(p)}`)
        player.notify('~g~Вы очистили розыск');
      } else {
        if (user.get(p, 'mask') > 0) return player.notify('~r~Розыск не был выдан. Игрок в маске');
        else player.notify('~g~Вы выдали розыск');
        chat.sendFractionMessage(player, user.getPlayerFraction(player), `Выдал розыск подозреваемому ${user.getId(p)} (${level} ур) по причине ${reason}`)
      }
      methods.saveLog(
        'GiveWanted',
        `${user.getRpName(player)} give to ${user.getRpName(p)} - ${level} - ${reason}`
      );
      user.loginterract(player, p, "GosWanted", "Выдал розыск "+level+"ур. "+reason)
      user.giveWanted(p, level, reason);
    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:adrenaline', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if(p == player && p.health == 0 && !user.isAdminNow(player)) return player.notify('~r~Вы не можете реанимировать самого себя');
    if (user.isLogin(p) && methods.distanceToPos(player.position, p.position) < 3) {
      user.useAdrenaline(p);
      p.health = 10;
      setTimeout(() => {
        if (mp.players.exists(p)) user.healProtect(p), p.health = 10;
      }, 1000)
      chat.sendMeCommand(player, 'использовал дефибриллятор на пострадавшем');
    } else player.notify('~r~Рядом игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

let _medPos = new mp.Vector3(288.61148, -1345.5358, 23.5378017);
mp.events.addRemoteCounted('server:user:heal', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    if (methods.distanceToPos(_medPos, player.position) > 100) {
      player.notify('~r~Доступно только в больнице');
      return;
    }

    let p = methods.getPlayerById(id);
    if(!p) return player.notify('~r~Игрок не найден');
    if (user.isLogin(p) && methods.distanceToPos(player.position, p.position) < 20) {
      user.set(p, 'med_time', 0);
      p.call('client:medTimerFree');
      p.call('server:fullHeal')
      p.health = 100;
      chat.sendMeCommand(player, 'выписал человека');
      user.giveItemAnimation(player, p);
    } else player.notify('~r~Рядом игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:healFirst', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if(!p) return player.notify('~r~Игрок не найден');
    if (user.isLogin(p) && methods.distanceToPos(player.position, p.position) < 3) {
      user.healProtect(p)
      p.health = 100;
      chat.sendMeCommand(player, 'достал аптечку и оказал первую помощь пострадавшему');
    } else player.notify('~r~Рядом игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
}); 
mp.events.addRemoteCounted('server:user:healFirstAdmin', (player, id) => {
  if (!user.isLogin(player)) return;
  if (!user.isAdminNow(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if(!p) return player.notify('~r~Игрок не найден');
    if (user.isLogin(p) && methods.distanceToPos(player.position, p.position) < 3) {
      user.healProtect(p)
      p.health = 100;
      user.set(p, 'med_time', 0);
      p.call('server:fullHeal')
      player.notify("Игрок вылечен");
      //chat.sendMeCommand(player, 'достал аптечку и оказал первую помощь пострадавшему');
    } else player.notify('~r~Рядом игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:giveIzol', (player, id, level, reason) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (methods.distanceToPos(p.position, player.position) < 10) {
        if (user.get(p, 'jail_time') > 0) {
          methods.notifyWithPictureToFraction(
            user.getRpName(player),
            `SDBP`,
            `Посадил в изолятор ${user.getRpName(p)}`,
            'DIA_POLICE',
            5
          );
          user.setIzol(p, level, reason);
        } else player.notify('~r~Игрок не в тюрьме');
      } else player.notify('~r~Вы слишком далеко от игрока');
    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:giveJailRun', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (methods.distanceToPos(p.position, player.position) < 10) {
        if (user.get(p, 'jail_time') > 0) {
          methods.notifyWithPictureToFraction(
            user.getRpName(player),
            `SDBP`,
            `Выдал доспуск ${user.getRpName(p)}`,
            'DIA_POLICE',
            5
          );
          user.giveJailRun(p);
        } else player.notify('~r~Игрок не в тюрьме');
      } else player.notify('~r~Вы слишком далеко от игрока');
    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:user:takeJailRun', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (methods.distanceToPos(p.position, player.position) < 10) {
        if (user.get(p, 'jail_time') > 0) {
          methods.notifyWithPictureToFraction(
            user.getRpName(player),
            `SDBP`,
            `Забрал доспуск ${user.getRpName(p)}`,
            'DIA_POLICE',
            5
          );
          user.takeJailRun(p);
        } else player.notify('~r~Игрок не в тюрьме');
      } else player.notify('~r~Вы слишком далеко от игрока');
    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});




mp.events.add('server:user:changeIdadmin', (player:PlayerMp, id) => {
  if (!user.isLogin(player)) return;
  if (!user.isAdmin(player, 3)) return player.notify('~r~У вас нет доступа к смене ID');
  if (!id) return player.notify('~g~Вы вернули ID'), player.setVariable('idLabel', user.getId(player)), methods.saveLog('AdminJob', user.getId(player) + ' return '),user.log(player, "AdminJob", "Вернул свой ID");
  user.getUserDataFromDB(id).then(data => {
    if(data) return player.notify('~r~Данный ID уже занят');
    methods.saveLog('ChangeFibId', user.getId(player) + ' to ' + id);
    user.log(player, "AdminJob", "Сменил ID на "+id)
    player.setVariable('idLabel', id);
    player.notify('~b~Вы сменили ID');
  }).catch((err) => {
    console.error(err)
    player.notify('~r~Попробуйте еще раз');
  })
});
mp.events.register('server:user:changeId', (player, id) => {
  if (!user.isLogin(player)) return;
  if (!id) return player.notify('~g~Вы вернули ID'), player.setVariable('idLabel', user.getId(player)), methods.saveLog('ChangeFibId', user.getId(player) + ' return '),user.log(player, "ChangeFibId", "Вернул свой ID");
  user.getUserDataFromDB(id).then(data => {
    if(data) return player.notify('~r~Данный ID уже занят');
    methods.saveLog('ChangeFibId', user.getId(player) + ' to ' + id);
    user.log(player, "ChangeFibId", "Сменил ID на "+id)
    player.setVariable('idLabel', id);
    player.notify('~b~Вы сменили ID');
  }).catch((err) => {
    console.error(err)
    player.notify('~r~Попробуйте еще раз');
  })
});


mp.events.register('server:mafia:removeBlackList', (player, id) => {
  if (!user.isLogin(player)) return;
  try {
    let p = methods.getPlayerById(id);
    if (user.isLogin(p)) {
      if (user.getMoney(player) < 100000) {
        player.notify('~r~У Вас недостаточно денег');
        return;
      }
      if (methods.distanceToPos(p.position, player.position) > 10) {
        player.notify('~r~Вы должны находиться рядом друг с другом');
        return;
      }
      if (Container.Has(enums.world, 'mafiaBlackList' + user.get(player, 'fraction_id'))) {
        player.notify('~r~Доступно только раз в 24ч (Реальные)');
        return;
      }
      if (!user.get(p, 'is_gos_blacklist')) {
        player.notify('~r~Игрок не находится в чёрном списке');
        return;
      }

      Container.Set(enums.world, 'mafiaBlackList' + user.get(player, 'fraction_id'), true);
      user.removeMoney(player, 100000);
      player.notify('~g~Вы убрали человека из черного списка гос. орг.');
      p.notify('~g~Вас убрали человека из черного списка гос. орг.');
      user.set(p, 'is_gos_blacklist', false);
      user.set(p, 'gos_blacklist_reason', '');
      user.updateClientCache(p);

    } else player.notify('~r~Игрок не найден');
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:sendAsk', (player, message) => {
  if (!user.isLogin(player)) return;
  if (user.checkMutePlayer(player, "chat")) return player.outputChatBox("У вас блокировка текстового чата до " + user.getTimeFormat(user.checkMutePlayer(player, "chat")));
  player.outputChatBox(
    `!{#FFC107}Вопрос ${user.getRpName(player)} (${user.getId(player)}):!{#FFFFFF} ${escape(message)}`
  );
  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;
    if (user.isHelper(p)){
      p.outputChatBox(
        `[${chat.getTime()}] !{#FFC107}${user.isMedia(player) ? '[MEDIA] ': ''}Вопрос от ${user.getRpName(player)} (${user.getId(
          player
        )}):!{#FFFFFF} ${escape(message)}`
      );
    }
  });
});

mp.events.addRemoteCounted('server:sendReport', (player, message) => {
  if (!user.isLogin(player)) return;
  if (user.checkMutePlayer(player, "chat")) return player.outputChatBox("У вас блокировка текстового чата до " + user.getTimeFormat(user.checkMutePlayer(player, "chat")));
  player.outputChatBox(
    `!{#f44336}Жалоба ${user.getRpName(player)} (${user.getId(player)}):!{#FFFFFF} ${escape(message)}`
  );
  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;
    if (user.isAdmin(p)) {
      if (user.isMedia(player))
        p.outputChatBox(
          `[${chat.getTime()}] !{#3F51B5}[MEDIA] Жалоба от ${user.getRpName(player)} (${user.getId(
            player
          )}):!{#FFFFFF} ${escape(message)}`
        );
      else
        p.outputChatBox(
          `[${chat.getTime()}] !{#f44336}Жалоба от ${user.getRpName(player)} (${user.getId(
            player
          )}):!{#FFFFFF} ${escape(message)}`
        );
    }
  });
});

mp.events.addRemoteCounted('server:sendWarning', (player, message) => {
  if (!user.isLogin(player)) return;
  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;
    if (user.isAdmin(p))
      p.outputChatBox(
        `!{#f44336}WARNING от ${user.getRpName(player)} (${user.getId(
          player
        )}):!{#FFFFFF} ${escape(message)}`
      );
  });
});

mp.events.addRemoteCounted('server:sendAnswerAsk', (player, id, msg) => {
  if (!user.isLogin(player)) return;
  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;
    if (user.isHelper(p) || user.getId(p) == id){
      p.outputChatBox(
        `!{#FFC107}Ответ от хелпера ${user.getRpName(player)} (${user.getId(
          player
        )}) игроку ${id}:!{#FFFFFF} ${escape(msg)}`
      );
    }
  });
  methods.saveLog(
    'AnswerAsk',
    `${user.getRpName(player)} (${user.getId(player)}) to ${id}: ${msg}`
  );
  user.set(player, 'count_hask', user.get(player, 'count_hask') + 1);
});

mp.events.addRemoteCounted('server:sendAnswerReport', (player, id, msg) => {
  if (!user.isLogin(player)) return;
  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;
    if (user.isAdmin(p) || user.getId(p) == id){
      p.outputChatBox(
        `!{#f44336}Ответ от администратора ${user.getRpName(player)} (${user.getId(
          player
        )}) игроку ${id}:!{#FFFFFF} ${escape(msg)}`
      );
    }   
  });
  methods.saveLog(
    'AnswerReport',
    `${user.getRpName(player)} (${user.getId(player)}) to ${id}: ${msg}`
  );
  user.set(player, 'count_aask', user.get(player, 'count_aask') + 1);
});

mp.events.addRemoteCounted('server:user:kickByAdmin', (player, id, reason) => {
  if (!user.isLogin(player)) return;
  if (!user.isAdmin(player)) return;
  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;
    if (user.getId(p) != id) return;

    chat.sendToAll(
      `Администратор ${user.getRpName(player)} (${user.getId(player)})`,
      `${user.getRpName(p)} (${user.getId(p)})!{${chat.clRed}} был кикнут с причиной!{${
        chat.clWhite
      }} ${reason}`,
      chat.clRed
    );
    player.outputChatBox(
      `!{#f44336}Вы кикнули!{FFFFFF} ${user.getRpName(p)}!{#f44336} с причиной: !{FFFFFF}${reason}`
    );
    user.kick(p, reason, `Вы были кикнуты администратором:!{FFFFFF} ${user.getRpName(player)}`);
  });
});



mp.events.addRemoteCounted('server:user:jailByAdmin', (player, id, reason, min) => {
  user.arrestAdmin(id, player, min, reason);
});

mp.events.addRemoteCounted('server:user:tpTo', (player, id) => {
  if (!user.isLogin(player)) return;
  if (!user.isAdmin(player)) return;
  let p = methods.getPlayerById(id);
  if (p) {
    if (p.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~К данному администратору нельзя телепортироваться`);
    player.dimension = p.dimension;
    user.teleport(player, p.position.x, p.position.y, p.position.z);
  } else {
    player.notify('~r~Человека с данным id нет на сервере.');
  }
});

mp.events.addRemoteCounted('server:user:tpToMe', (player, id) => {
  if (!user.isLogin(player)) return;
  if (!user.isAdmin(player)) return;
  let p = methods.getPlayerById(id);
  if (p) {
    if (p.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~Данного администратора нельзя телепортировать`);
    p.dimension = player.dimension;
    user.teleport(p, player.position.x, player.position.y, player.position.z);
    p.outputChatBox(
      `!{#f44336}Вас телепортировал к себе администратор:!{FFFFFF} ${user.getRpName(player)}`
    );
  } else {
    player.notify('~r~Человека с данным id нет на сервере.');
  }
});

mp.events.addRemoteCounted('server:user:fixNearestVehicle', (player) => {
  if (!user.isLogin(player)) return;
  let veh = methods.getNearestVehicleWithCoords(player.position, 10.0);
  if (vehicles.exists(veh)) veh.repair();
});

mp.events.addRemoteCounted('server:deleteNearstVehicle', (player) => {
  if (!user.isLogin(player)) return;
  let vehicle = methods.getNearestVehicleWithCoords(player.position, 5);
  if (vehicles.exists(vehicle))
  vehicles.destroy(vehicle)
  // vehicle.destroy();
});

mp.events.register('server:respawnNearstVehicle', player => {
  if (!user.isLogin(player)) return;
  let vehicle = methods.getNearestVehicleWithCoords(player.position, 5);
  if (!vehicles.exists(vehicle)) return;
  if(vehicle.getVariable("raceVehicle")) return;
  chat.sendMeCommand(player, `Эвакуировал транспорт ${vehicle.numberPlate}`);
  vehicles.destroy(vehicle)
})

mp.events.addRemoteCounted('server:respawnNearstVehicle', (player) => {
  if (!user.isLogin(player)) return;
  let vehicle = methods.getNearestVehicleWithCoords(player.position, 5);
  if (!vehicles.exists(vehicle)) return;
  if(vehicle.getVariable("raceVehicle")) return;
  if(!user.isAdminNow(player)) chat.sendMeCommand(player, `Эвакуировал транспорт ${vehicle.numberPlate}`);
  vehicles.respawn(vehicle);
});

mp.events.addRemoteCounted('server:flipNearstVehicle', (player) => {
  if (!user.isLogin(player)) return;
  let vehicle = methods.getNearestVehicleWithCoords(player.position, 5);
  if (vehicles.exists(vehicle)) vehicle.rotation = new mp.Vector3(0, 0, vehicle.heading);
});

mp.events.addRemoteCounted('server:vehicle:engineStatus', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.isDriver(player)) {
      let data = vehicles.getData(player.vehicle.getVariable('container'));
      if (data.has('fraction_id')) {
        if (data.get('fraction_id') == user.get(player, 'fraction_id'))
          vehicles.engineStatus(player, player.vehicle);
        else player.notify('~r~У Вас нет ключей от транспорта');
      } else {
        vehicles.engineStatus(player, player.vehicle);
      }
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:vehicle:lockStatus', (player) => {
  if (!user.isLogin(player)) return;
  try {
    let vehicle = methods.getNearestVehicleWithCoords(player.position, 5);
    if (vehicles.exists(vehicle)) {

      if (user.isAdminNow(player, 2)) {
        vehicles.lockStatus(player, vehicle);
        return;
      }

      let data = vehicles.getData(vehicle.getVariable('container'));
      if (data.has('fraction_id')) {
        if (data.get('fraction_id') == user.get(player, 'fraction_id'))
          vehicles.lockStatus(player, vehicle);
        else player.notify('~r~У Вас нет ключей от транспорта');
      } else if (data.has('owner_id')) {
        if (data.get('owner_id') == user.getId(player)) vehicles.lockStatus(player, vehicle);
        else player.notify('~r~У Вас нет ключей от транспорта');
      } else if (data.has('rentOwner')) {
        if (data.get('rentOwner') == user.getId(player)) vehicles.lockStatus(player, vehicle);
        else player.notify('~r~У Вас нет ключей от транспорта');
      } else if (data.has('id_user')) {
        if (data.get('id_user') == user.getId(player)) vehicles.lockStatus(player, vehicle);
        else player.notify('~r~У Вас нет ключей от транспорта');
      } else vehicles.lockStatus(player, vehicle);
    }
  } catch (e) {
    methods.debug(e);
  }
});



mp.events.addRemoteCounted('server:vehicle:setColor', (player, color1, color2) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.isDriver(player)) {
      player.vehicle.setColor(color1, color2);
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:vehicle:setLivery', (player, liv) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.isDriver(player)) {
      player.vehicle.livery = liv;
    }
  } catch (e) {
    methods.debug(e);
  }
});

mp.events.addRemoteCounted('server:vehicle:occ', (player) => {
  if (!user.isLogin(player)) return;
  try {
    if (user.isDriver(player)) {
      player.vehicle.getOccupants().forEach(function(pl) {
        methods.debug(user.getRpName(pl));
      });
    }
  } catch (e) {
    methods.debug(e);
  }
});



mp.events.addRemoteCounted('server:shop:sellFish', (player, shopId) => {
  if (!user.isLogin(player)) return;

  if (!user.get(player, 'fish_lic')) {
    player.notify('~r~У Вас нет лицензии рыболовства');
    return;
  }
  let rows = inventory.allItems().filter((item) => item.owner_id == user.getId(player) && item.owner_type == 1);
  let money = 0;
  let count = 0;

  rows.forEach((item) => {
    if (item['item_id'] == 241) {
      money += 144;
      count++;
      inventory.deleteItem(item['id']);
    } else if (item['item_id'] == 242) {
      money += 14;
      count++;
      inventory.deleteItem(item['id']);
    } else if (item['item_id'] == 243) {
      money += 55;
      count++;
      inventory.deleteItem(item['id']);
    } else if (item['item_id'] == 244) {
      money += 28;
      count++;
      inventory.deleteItem(item['id']);
    } else if (item['item_id'] == 245) {
      money += 7;
      count++;
      inventory.deleteItem(item['id']);
    }
  });

  money*=3;

  if (count > 0) {
    business.addMoney(shopId, methods.parseInt(money * 0.1));
    player.notify(`~g~Вы продали ${count}шт. рыбы`);
    player.notify(`~g~Вы заработали: ~s~$${methods.numberFormat(money)}`);
    user.addMoney(player, money);
  } else {
    player.notify('~r~У Вас нет рыбы для продажи');
  }
});

mp.events.addRemoteCounted('server:shop:sellGun', (player, shopId) => {
  if (!user.isLogin(player)) return;

  let rows = inventory.allItems().filter((item) => item.owner_id == user.getId(player) && item.owner_type == 1 && item.item_id == 88);
  let money = 0;
  let count = 0;

  rows.forEach((item) => {
    money += 12000;
    count++;
    inventory.deleteItem(item['id']);
  });

  if (count > 0) {
    player.notify(`~g~Вы продали ${count}шт. оружия`);
    player.notify(`~g~Вы заработали: ~s~$${methods.numberFormat(money)}`);
    user.addMoney(player, money);
  } else {
    player.notify('~r~У Вас нет оружия для продажи');
  }
});

mp.events.addRemoteCounted('server:shop:winLoto', (player, shopId) => {
  if (!user.isLogin(player)) return;

  let rows = inventory.allItems().filter((item) => item.owner_id == user.getId(player) && item.owner_type == 1 && item.item_id == 277 && item.key_id == 1);
  if (rows.length > 0) {
    rows.forEach((item) => {
      user.addCashMoney(player, item['prefix']);
      inventory.deleteItem(item['id']);
      methods.notifyWithPictureToPlayer(
        player,
        'Поздравляем!',
        `#${item['number']}`,
        `~g~Вы обменяли билетик: ~s~$${methods.numberFormat(item['prefix'])}`,
        'WEB_PILLPHARM'
      );
    });
  } else {
    player.notify('~r~У Вас нет билетиков');
  }

});

mp.events.addRemoteCounted('server:shop:sellLoto', (player) => {
  if (!user.isLogin(player)) return;
  let rows = inventory.allItems().filter((item) => item.owner_id == user.getId(player) && item.owner_type == 1 && item.item_id == 277 && item.key_id == -1);
  rows.map(item => {
    inventory.deleteItem(item.id)
  })

  methods.notifyWithPictureToPlayer(
    player,
    'American Loto',
    `Спасибо!`,
    `~g~Вы сдали все просроченные билетики`,
    'WEB_PILLPHARM'
  );
});

mp.events.addRemoteCounted('server:user:giveMeWanted', (player, level, reason) => {
  if (!user.isLogin(player)) return;
  user.giveWanted(player, level, reason);
});

mp.events.addRemoteCounted('server:bank:withdraw', (player, money, procent) => {
  if (!user.isLogin(player)) return;
  bank.withdraw(player, money, procent);
});

mp.events.addRemoteCounted('server:bank:deposit', (player, money, procent) => {
  if (!user.isLogin(player)) return;
  bank.deposit(player, money, procent);
});

mp.events.addRemoteCounted('server:bank:transferMoney', (player, bankPrefix, bankNumber, money) => {
  if (!user.isLogin(player)) return;
  bank.transferMoney(player, bankPrefix, bankNumber, money);
});

mp.events.addRemoteCounted('server:bank:changeCardNumber', (player, bankNumber) => {
  if (!user.isLogin(player)) return;
  bank.changeCardNumber(player, bankNumber);
});

mp.events.addRemoteCounted('server:changePhoneNumber', (player, bankNumber) => {
  if (!user.isLogin(player)) return;
  let money = 25000;

  if (user.getCashMoney(player) < money) {
    player.notify('~r~У Вас недостаточно средств');
    return;
  }
  if (bankNumber < 9999) {
    player.notify('~r~Номер должен быть больше 4-х цифр');
    return;
  }

  let bankPrefix = user.get(player, 'phone_code');


  userEntity.count({
    where: {
      phone: bankNumber,
      phone_code: bankPrefix,
    }
  }).then(count => { 
    if (count === 0) {
        let find = inventory.allItems().find((item) => item.number == bankNumber && item.prefix == bankPrefix);
          if (!find) {
            user.set(player, 'phone', bankNumber);
            user.removeCashMoney(player, money);
            //bank.addBusinessBankMoneyByPrefix(bankPrefix, money);
            business.addMoney(92, money);
            bank.sendSmsBankOperation(player, 'Ваш номер был изменён');
            user.saveAccount(player);
          } else bank.sendSmsBankOperation(player, 'Номер уже существует', '~r~Ошибка');
      } else bank.sendSmsBankOperation(player, 'Номер уже существует', '~r~Ошибка');
    }
  );
});

mp.events.addRemoteCounted('server:bank:closeCard', (player) => {
  if (!user.isLogin(player)) return;
  bank.closeCard(player);
});

mp.events.addRemoteCounted('server:bank:openCard', (player, bankId, priceCard) => {
  if (!user.isLogin(player)) return;
  bank.openCard(player, bankId, priceCard);
});

mp.events.addRemoteCounted('server:vehicle:spawnFractionCar', (player, id) => {
  if (!user.isLogin(player)) return;
  vehicles.spawnFractionCar(id);
  player.notify('~b~Транспорт стоит на парковке, возьмите его');
});

mp.events.addRemoteCounted('server:houses:sell', (player) => {
  if (!user.isLogin(player)) return;
  houses.sell(player);
});

mp.events.addRemoteCounted('server:condo:sell', (player) => {
  if (!user.isLogin(player)) return;
  condo.sell(player);
});

mp.events.addRemoteCounted('server:stock:sell', (player) => {
  if (!user.isLogin(player)) return;
  stock.sell(player);
});

mp.events.addRemoteCounted('server:apartments:sell', (player) => {
  if (!user.isLogin(player)) return;
  apartments.sell(player);
});

mp.events.addRemoteCounted('server:houses:sellToPlayer', (player, buyerId, sum) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'id_house') === 0) {
    player.notify('~r~У Вас нет дома');
    return;
  }

  let hInfo = houses.getHouseData(user.get(player, 'id_house'));
  if (hInfo.get('id_user') != user.get(player, 'id')) {
    player.notify('~r~Этот дом вам не пренадлежит');
    return;
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'id_house') > 0) {
      player.notify('~r~У игрока уже есть дом');
      buyer.notify('~r~У Вас уже есть дом');
      return;
    }

    buyer.call('client:houses:sellToPlayer', [
      user.get(player, 'id_house'),
      sum,
      user.getId(player),
    ]);
    buyer.notify('~b~Вам предложили купить дом на ' + hInfo.get('address') + ' ' + hInfo.get('id')+' за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы предложили купить дом игроку');
  }
});

mp.events.addRemoteCounted('server:houses:addUser', (player, buyerId) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'id_house') === 0) {
    player.notify('~r~У Вас нет дома');
    return;
  }

  if (user.getCashMoney(player) < 50000) {
    player.notify('~r~У Вас недостаточно средств на руках');
    return;
  }

  let hInfo = houses.getHouseData(user.get(player, 'id_house'));
  if (hInfo.get('id_user') != user.get(player, 'id')) {
    player.notify('~r~Этот дом вам не пренадлежит');
    return;
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'id_house') > 0) {
      player.notify('~r~У игрока уже есть дом');
      buyer.notify('~r~У Вас уже есть дом');
      return;
    }

    houses.getCountLiveUser(user.get(player, 'id_house'), function(count: number) {
      if (!user.isLogin(player)) return;
      if (!user.isLogin(buyer)) return;

      --count;
      if (count == 1 && hInfo.get('price') < 250000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $250.000');
        return;
      } else if (count == 2 && hInfo.get('price') < 500000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $500.000');
        return;
      } else if (count == 3 && hInfo.get('price') < 1000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $1.000.000');
        return;
      } else if (count == 4 && hInfo.get('price') < 2000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $2.000.000');
        return;
      } else if (count == 5 && hInfo.get('price') < 3000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $3.000.000');
        return;
      } else if (count == 6 && hInfo.get('price') < 5000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $5.000.000');
        return;
      } else if (count == 7 && hInfo.get('price') < 7000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $7.000.000');
        return;
      } else if (count == 8 && hInfo.get('price') < 8000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $8.000.000');
        return;
      } else if (count == 9 && hInfo.get('price') < 9000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $9.000.000');
        return;
      } else if (count == 10 && hInfo.get('price') < 10000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $10.000.000');
        return;
      } else if (count == 15 && hInfo.get('price') < 15000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Чтобы посделить больше друзей, нужен дом от $15.000.000');
        return;
      } else if (count == 20 && hInfo.get('price') < 20000000) {
        player.notify('~r~В вашем доме не осталось места');
        player.notify('~r~Больше друзей подселить невозможно');
        return;
      }

      user.removeCashMoney(player, 50000);
      coffer.addMoney(50000);
      user.set(buyer, 'id_house', user.get(player, 'id_house'));
      player.notify('~b~Вы подселили игрока');
      buyer.notify('~b~Вас подселили в дом');

      user.saveAccount(player);
      user.saveAccount(buyer);
    });
  }
});

mp.events.addRemoteCounted('server:houses:lawyer:tryaddUser', (player, ownerId, buyerId) => {
  let owner = user.getPlayerById(ownerId);
  if (user.isLogin(owner) && user.isLogin(player)) {
    if (user.get(owner, 'id_house') === 0) {
      owner.notify('~r~У Вас нет дома');
      player.notify('~r~У игрока нет дома');
      return;
    }

    if (user.getCashMoney(owner) < 10000) {
      owner.notify('~r~У Вас недостаточно средств на руках');
      player.notify('~r~У игрока недостаточно средств на руках');
      return;
    }

    if (methods.distanceToPos(owner.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    owner.call('client:lawyer:house:accept', [buyerId, user.getId(player)]);
  }
});

mp.events.addRemoteCounted('server:houses:userList', (player) => {
  if (!user.isLogin(player)) return;

  if (user.get(player, 'id_house') === 0) {
    player.notify('~r~У Вас нет дома');
    return;
  }

  let hInfo = houses.getHouseData(user.get(player, 'id_house'));
  if (hInfo.get('id_user') != user.get(player, 'id')) {
    player.notify('~r~Этот дом вам не пренадлежит');
    return;
  }

  let houseId = user.get(player, 'id_house');


  userEntity.findAll({where: {
    id_house: houseId
  }, order: [["is_online", "DESC"], ["rp_name", "ASC"]]}).then(rows => {
      let resultData = new Map();
      rows.forEach(function(item) {
        if (item['is_online']) resultData.set(item['id'].toString(), '~g~*~s~ ' + item['rp_name']);
        else resultData.set(item['id'].toString(), '~r~*~s~ ' + item['rp_name']);
      });
      player.call('client:showMazeBankHousePeopleListMenu', [Array.from(resultData)]);
    }
  );
});

mp.events.addRemoteCounted('server:houses:lawyer:addUser', (player, lawyerId, buyerId) => {
  let buyer = user.getPlayerById(buyerId);
  let lawyer = user.getPlayerById(lawyerId);
  let owner = player;
  if (user.isLogin(buyer) && user.isLogin(owner) && user.isLogin(lawyer)) {
    if (user.get(owner, 'id_house') === 0) {
      owner.notify('~r~У Вас нет дома');
      return;
    }

    if (user.getCashMoney(owner) < 10000) {
      owner.notify('~r~У Вас недостаточно средств на руках');
      return;
    }

    let hInfo = houses.getHouseData(user.get(owner, 'id_house'));
    if (hInfo.get('id_user') != user.get(owner, 'id')) {
      owner.notify('~r~Этот дом вам не пренадлежит');
      return;
    }

    if (methods.distanceToPos(buyer.position, owner.position) > 2) {
      owner.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'id_house') > 0) {
      owner.notify('~r~У игрока уже есть дом');
      buyer.notify('~r~У Вас уже есть дом');
      return;
    }

    houses.getCountLiveUser(user.get(owner, 'id_house'), function(count: number) {
      if (!user.isLogin(owner)) return;
      if (!user.isLogin(buyer)) return;

      --count;
      if (count == 1 && hInfo.get('price') < 250000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $250.000');
        return;
      } else if (count == 2 && hInfo.get('price') < 500000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $500.000');
        return;
      } else if (count == 3 && hInfo.get('price') < 1000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $1.000.000');
        return;
      } else if (count == 4 && hInfo.get('price') < 2000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $2.000.000');
        return;
      } else if (count == 5 && hInfo.get('price') < 3000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $3.000.000');
        return;
      } else if (count == 6 && hInfo.get('price') < 5000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $5.000.000');
        return;
      } else if (count == 7 && hInfo.get('price') < 7000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $7.000.000');
        return;
      } else if (count == 8 && hInfo.get('price') < 8000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $8.000.000');
        return;
      } else if (count == 9 && hInfo.get('price') < 9000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $9.000.000');
        return;
      } else if (count == 10 && hInfo.get('price') < 10000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $10.000.000');
        return;
      } else if (count == 15 && hInfo.get('price') < 15000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Чтобы посделить больше друзей, нужен дом от $15.000.000');
        return;
      } else if (count == 20 && hInfo.get('price') < 20000000) {
        owner.notify('~r~В вашем доме не осталось места');
        owner.notify('~r~Больше друзей подселить невозможно');
        return;
      }

      user.removeCashMoney(owner, 10000);
      user.addCashMoney(lawyer, 8000);

      switch (user.get(lawyer, 'job')) {
        case 'lawyer1':
          business.addMoney(58, 2000);
          break;
        case 'lawyer2':
          business.addMoney(59, 2000);
          break;
        case 'lawyer3':
          business.addMoney(60, 2000);
          break;
      }

      user.set(buyer, 'id_house', user.get(owner, 'id_house'));
      owner.notify('~b~Вы подселили игрока');
      buyer.notify('~b~Вас подселили в дом');
      lawyer.notify('~b~Вы совершили сделку, заработав ~g~$8.000');

      user.saveAccount(player);
      user.saveAccount(buyer);
    });
  }
});

mp.events.addRemoteCounted('server:houses:removeMe', (player) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'id_house') === 0) {
    player.notify('~r~Вы нигде не живете');
    return;
  }

  if (user.getCashMoney(player) < 1000) {
    player.notify('~r~У Вас недостаточно средств на руках');
    return;
  }

  let hInfo = houses.getHouseData(user.get(player, 'id_house'));
  if (hInfo && hInfo.get('id_user') == user.get(player, 'id')) {
    player.notify('~r~Это ваш дом, его можно только продать');
    return;
  }

  user.removeCashMoney(player, 1000);
  coffer.addMoney(1000);
  user.set(player, 'id_house', 0);
  player.notify('~r~Вы выселились из дома');
  user.saveAccount(player);
});

mp.events.addRemoteCounted('server:house:removeId', (player, userId) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'id_house') === 0) {
    player.notify('~r~Вы нигде не живете');
    return;
  }

  if (user.getCashMoney(player) < 1000) {
    player.notify('~r~У Вас недостаточно средств на руках');
    return;
  }

  let hInfo = houses.getHouseData(user.get(player, 'id_house'));
  if (hInfo.get('id_user') != user.get(player, 'id')) {
    player.notify('~r~Этот дом вам не пренадлежит');
    return;
  }

  user.removeCashMoney(player, 1000);
  coffer.addMoney(1000);

  player.notify('~r~Вы выселили из дома ' + userId);

  let seller = user.getPlayerById(userId);
  if (user.isLogin(seller)) {
    user.set(seller, 'id_house', 0);
    seller.notify('~r~Вас выселил из дома владелец');
    user.saveAccount(seller);
  } else {
    userEntity.update({
      id_house: 0
    }, { where: {
      id: userId
    }})
  }
});

mp.events.addRemoteCounted(
  'server:houses:sellToPlayer:accept',
  (player, houseId, sum, sellerId) => {
    if (!user.isLogin(player)) return;
    if (user.get(player, 'id_house') > 0) {
      player.notify('~r~У Вас есть дом');
      return;
    }

    if (isNaN(sum) || sum <= 0) {
      player.notify('~r~Сумма указана не верно');
      return;
    }

    if (user.getCashMoney(player) < sum) {
      player.notify('~r~У Вас нет столько денег');
      return;
    }

    let seller = user.getPlayerById(sellerId);
    if (user.isLogin(seller)) {
      let hId = user.get(seller, 'id_house');
      if (hId === 0) {
        player.notify('~r~У игрока уже нет дома');
        seller.notify('~r~У Вас нет дома');
        return;
      }

      houses.updateOwnerInfo(hId, user.getId(player), user.getRpName(player));
      user.set(player, 'id_house', hId);
      user.set(seller, 'id_house', 0);

      user.addCashMoney(seller, sum);
      user.removeCashMoney(player, sum);

      seller.notify('~b~Вы продали дом за ~s~$' + methods.numberFormat(sum));
      player.notify('~b~Вы купили дом за ~s~$' + methods.numberFormat(sum));
      user.loginterract(player, seller, "PlayerSell", `Продал дом @house${hId} за $${sum}`)
      user.saveAccount(player);
      user.saveAccount(seller);
    }
  }
);

mp.events.addRemoteCounted('server:car:sellToPlayer', (player, buyerId, sum, slot) => {
  if (!user.isLogin(player)) return;

  if (user.get(player, 'car_id' + slot) == 0) {
    player.notify('~r~У Вас нет транспорта');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  if(!vehicles.searchBySlot(player, slot)){
    return player.notify("~r~Необходимо заспавнить ТС")
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    let isValid = false;
    if (user.get(buyer, 'car_id1') == 0) isValid = true;
    else if (user.get(buyer, 'car_id2') == 0) {
      if (
        user.get(buyer, 'id_house') > 0 ||
        user.get(buyer, 'condo_id') > 0 ||
        user.get(buyer, 'apartment_id') > 0
      )
        isValid = true;
    } else if (user.get(buyer, 'car_id3') == 0) {
      if (user.get(buyer, 'id_house') > 0) {
        let hInfo = houses.getHouseData(user.get(buyer, 'id_house'));
        if (hInfo.get('price') > 1000000) isValid = true;
      }
    } else if (user.get(buyer, 'car_id4') == 0) {
      if (user.get(buyer, 'id_house') > 0) {
        let hInfo = houses.getHouseData(user.get(buyer, 'id_house'));
        if (hInfo.get('price') > 2500000) isValid = true;
      }
    } else if (user.get(buyer, 'car_id5') == 0) {
      if (user.get(buyer, 'id_house') > 0) {
        let hInfo = houses.getHouseData(user.get(buyer, 'id_house'));
        if (hInfo.get('price') > 5000000) isValid = true;
      }
    }

    if (isValid) {
      let vInfo = vehicles.getData(user.get(player, 'car_id' + slot));
      buyer.call('client:car:sellToPlayer', [
        user.get(player, 'car_id' + slot),
        vInfo.get('name'),
        sum,
        user.getId(player),
        slot,
      ]);
      buyer.notify(
        '~b~Вам предложили купить ' + vInfo.get('name') + ' за ~s~$' + methods.numberFormat(sum)
      );
      player.notify('~b~Вы предложили купить ' + vInfo.get('name') + ' игроку');
    } else {
      buyer.notify('~r~У Вас нет доступных свободных слотов');
      player.notify('~r~У игрока нет доступных слотов под ТС');
    }
  }
});

mp.events.addRemoteCounted(
  'server:car:sellToPlayer:accept',
  (player, sum, sellerId, slot) => {
    if (!user.isLogin(player)) return;

    let slotBuy = 0;

    if (isNaN(sum) || sum <= 0) {
      player.notify('~r~Сумма указана не верно');
      return;
    }

    if (user.get(player, 'car_id1') == 0) slotBuy = 1;
    else if (user.get(player, 'car_id2') == 0) {
      if (
        user.get(player, 'id_house') > 0 ||
        user.get(player, 'condo_id') > 0 ||
        user.get(player, 'apartment_id') > 0
      )
        slotBuy = 2;
    } else if (user.get(player, 'car_id3') == 0) {
      if (user.get(player, 'id_house') > 0) {
        let hInfo = houses.getHouseData(user.get(player, 'id_house'));
        if (hInfo.get('price') > 1000000) slotBuy = 3;
      }
    } else if (user.get(player, 'car_id4') == 0) {
      if (user.get(player, 'id_house') > 0) {
        let hInfo = houses.getHouseData(user.get(player, 'id_house'));
        if (hInfo.get('price') > 2500000) slotBuy = 4;
      }
    } else if (user.get(player, 'car_id5') == 0) {
      if (user.get(player, 'id_house') > 0) {
        let hInfo = houses.getHouseData(user.get(player, 'id_house'));
        if (hInfo.get('price') > 5000000) slotBuy = 5;
      }
    }

    if (slotBuy == 0) {
      player.notify('~r~У Вас нет доступных слотов');
      return;
    }

    if (user.getCashMoney(player) < sum) {
      player.notify('~r~У Вас нет столько денег');
      return;
    }

    let seller = user.getPlayerById(sellerId);
    if (user.isLogin(seller)) {
      let hId = user.get(seller, 'car_id' + slot);
      if (hId === 0) {
        player.notify('~r~У игрока уже нет транспорта');
        seller.notify('~r~У Вас нет транспорта');
        return;
      }

      vehicles.updateOwnerInfo(hId, user.getId(player), user.getRpName(player));
      user.set(player, 'car_id' + slotBuy, hId);
      user.set(seller, 'car_id' + slot, 0);

      user.addCashMoney(seller, sum);
      user.removeCashMoney(player, sum);

      seller.notify('~b~Вы продали ТС за ~s~$' + methods.numberFormat(sum));
      player.notify('~b~Вы купили ТС за ~s~$' + methods.numberFormat(sum));
      carsEntity.findOne({where: {id: hId}}).then(car => {
        if (car) user.loginterract(player, seller, "PlayerSell", `Продал ТС @veh${hId} ${car.name} (Стоимость ${car.price}) за $${sum}`)
        else user.loginterract(player, seller, "PlayerSell", `Продал ТС @veh${hId} за $${sum}`)
      })
      
      user.saveAccount(player);
      user.saveAccount(seller);
    }
  }
);

mp.events.addRemoteCounted('server:condo:sellToPlayer', (player, buyerId, sum) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'condo_id') === 0) {
    player.notify('~r~У Вас нет квартиры');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'condo_id') > 0) {
      player.notify('~r~У игрока уже есть квартира');
      buyer.notify('~r~У Вас уже есть квартира');
      return;
    }

    buyer.call('client:condo:sellToPlayer', [
      user.get(player, 'condo_id'),
      sum,
      user.getId(player),
    ]);
    buyer.notify('~b~Вам предложили купить квартиру на ' + condo.get(user.get(player, 'condo_id'), 'address') + ' ' + condo.get(user.get(player, 'condo_id'), 'id') +' за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы предложили купить квартиру игроку');
  }
});

mp.events.addRemoteCounted('server:condo:sellToPlayer:accept', (player, houseId, sum, sellerId) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'condo_id') > 0) {
    player.notify('~r~У Вас есть квартира');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  if (user.getCashMoney(player) < sum) {
    player.notify('~r~У Вас нет столько денег');
    return;
  }

  let seller = user.getPlayerById(sellerId);
  if (user.isLogin(seller)) {
    let hId = user.get(seller, 'condo_id');
    if (hId === 0) {
      player.notify('~r~У игрока уже нет квартиры');
      seller.notify('~r~У Вас нет квартиры');
      return;
    }

    condo.updateOwnerInfo(hId, user.getId(player), user.getRpName(player));
    user.set(player, 'condo_id', hId);
    user.set(seller, 'condo_id', 0);

    user.addCashMoney(seller, sum);
    user.removeCashMoney(player, sum);

    seller.notify('~b~Вы продали квартиру за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы купили квартиру за ~s~$' + methods.numberFormat(sum));
    user.loginterract(player, seller, "PlayerSell", `Продал квартиру @condo${hId} за $${sum}`)
    user.saveAccount(player);
    user.saveAccount(seller);
  }
});

mp.events.addRemoteCounted('server:business:sellToPlayer', (player, buyerId, sum) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'business_id') === 0) {
    player.notify('~r~У Вас нет бизнеса');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'business_id') > 0) {
      player.notify('~r~У игрока уже есть бизнес');
      buyer.notify('~r~У Вас уже есть бизнес');
      return;
    }

    
    if (user.getLevel(buyer) < levelAccess.buyBusiness) {
      player.notify('~r~Для покупки игроку нужно иметь '+levelAccess.buyBusiness+" ур.");
      return false;
    }

    buyer.call('client:business:sellToPlayer', [
      user.get(player, 'business_id'),
      sum,
      user.getId(player),
    ]);
    buyer.notify('~b~Вам предложили купить бизнес ' + business.get(user.get(player, 'business_id'), 'name')+' за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы предложили купить бизнес игроку');
  }
});

mp.events.addRemoteCounted(
  'server:business:sellToPlayer:accept',
  (player, houseId, sum, sellerId) => {
    if (!user.isLogin(player)) return;
    if (user.get(player, 'is_gos_blacklist')) {
      player.notify('~r~Вы состоите в чёрном списке');
      return;
    }

    if (isNaN(sum) || sum <= 0) {
      player.notify('~r~Сумма указана не верно');
      return;
    }

    if (user.get(player, 'business_id') > 0) {
      player.notify('~r~У Вас есть бизнес');
      return;
    }

    if (user.getCashMoney(player) < sum) {
      player.notify('~r~У Вас нет столько денег');
      return;
    }


    if (user.getLevel(player) < levelAccess.buyBusiness) {
      player.notify('~r~Для покупки нужно иметь '+levelAccess.buyBusiness+" ур.");
      return false;
    }

    if (user.get(player, 'biz_lic') === false) {
      player.notify('~r~У Вас нет лицензии на бизнес');
      player.notify('~r~Купить её можно у сотрудников правительства');
      return false;
    }

    if (user.get(player, 'fraction_id') == 1 && user.get(player, 'rank') > 7) {
      player.notify('~r~Запрещено покупать бизнесы сотрудникам правительства выше 7 ранга');
      return false;
    }

    let seller = user.getPlayerById(sellerId);
    if (user.isLogin(seller)) {
      let hId = user.get(seller, 'business_id');
      if (hId === 0) {
        player.notify('~r~У игрока уже нет бизнеса');
        seller.notify('~r~У Вас нет бизнеса');
        return;
      }

      business.updateOwnerInfo(hId, user.getId(player), user.getRpName(player));
      user.set(player, 'business_id', hId);
      user.set(seller, 'business_id', 0);
      user.set(player, 'fraction_id2', hId);
      user.set(player, 'rank2', 11);
      user.set(seller, 'fraction_id2', 0);
      user.set(seller, 'rank2', 0);

      user.addCashMoney(seller, sum);
      user.removeCashMoney(player, sum);

      seller.notify('~b~Вы продали бизнес за ~s~$' + methods.numberFormat(sum));
      player.notify('~b~Вы купили бизнес за ~s~$' + methods.numberFormat(sum));

      user.loginterract(player, seller, "PlayerSell", `Продал бизнес @business${hId} за $${sum}`)

      user.saveAccount(player);
      user.saveAccount(seller);
    }
  }
);

mp.events.addRemoteCounted('server:apartments:sellToPlayer', (player, buyerId, sum) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'apartment_id') === 0) {
    player.notify('~r~У Вас нет апартаментов');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'apartment_id') > 0) {
      player.notify('~r~У игрока уже есть апартаменты');
      buyer.notify('~r~У Вас уже есть апартаменты');
      return;
    }

    buyer.call('client:apartments:sellToPlayer', [
      user.get(player, 'apartment_id'),
      sum,
      user.getId(player),
    ]);
    buyer.notify('~b~Вам предложили купить апартаменты ' + apartments.get(user.get(player, 'apartment_id'), 'id')+' за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы предложили купить апартаменты игроку');
  }
});

mp.events.addRemoteCounted(
  'server:apartments:sellToPlayer:accept',
  (player, houseId, sum, sellerId) => {
    if (!user.isLogin(player)) return;
    if (user.get(player, 'apartment_id') > 0) {
      player.notify('~r~У Вас есть апартаменты');
      return;
    }

    if (isNaN(sum) || sum <= 0) {
      player.notify('~r~Сумма указана не верно');
      return;
    }

    if (user.getCashMoney(player) < sum) {
      player.notify('~r~У Вас нет столько денег');
      return;
    }

    let seller = user.getPlayerById(sellerId);
    if (user.isLogin(seller)) {
      let hId = user.get(seller, 'apartment_id');
      if (hId === 0) {
        player.notify('~r~У игрока уже нет апартаментов');
        seller.notify('~r~У Вас нет апартаментов');
        return;
      }

      apartments.updateOwnerInfo(hId, user.getId(player), user.getRpName(player));
      user.set(player, 'apartment_id', hId);
      user.set(seller, 'apartment_id', 0);

      user.addCashMoney(seller, sum);
      user.removeCashMoney(player, sum);

      seller.notify('~b~Вы продали апартаменты за ~s~$' + methods.numberFormat(sum));
      player.notify('~b~Вы купили апартаменты за ~s~$' + methods.numberFormat(sum));

      user.loginterract(player, seller, "PlayerSell", `Продал апартаменты @apartment${hId} за $${sum}`)

      user.saveAccount(player);
      user.saveAccount(seller);
    }
  }
);

mp.events.addRemoteCounted('server:stock:sellToPlayer', (player, buyerId, sum) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'stock_id') === 0) {
    player.notify('~r~У Вас нет склада');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  let buyer = user.getPlayerById(buyerId);
  if (user.isLogin(buyer)) {
    if (methods.distanceToPos(buyer.position, player.position) > 2) {
      player.notify('~r~Вы слишком далеко');
      return;
    }

    if (user.get(buyer, 'stock_id') > 0) {
      player.notify('~r~У игрока уже есть склад');
      buyer.notify('~r~У Вас уже есть склад');
      return;
    }

    buyer.call('client:stock:sellToPlayer', [
      user.get(player, 'stock_id'),
      sum,
      user.getId(player),
    ]);
    buyer.notify('~b~Вам предложили купить склад ' + stock.get(user.get(player, 'stock_id'), 'address') + ' (' + stock.get(user.get(player, 'stock_id'), 'id') +') за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы предложили купить склад игроку');
  }
});

mp.events.addRemoteCounted('server:stock:sellToPlayer:accept', (player, houseId, sum, sellerId) => {
  if (!user.isLogin(player)) return;
  if (user.get(player, 'stock_id') > 0) {
    player.notify('~r~У Вас есть склад');
    return;
  }

  if (isNaN(sum) || sum <= 0) {
    player.notify('~r~Сумма указана не верно');
    return;
  }

  if (user.getCashMoney(player) < sum) {
    player.notify('~r~У Вас нет столько денег');
    return;
  }

  let seller = user.getPlayerById(sellerId);
  if (user.isLogin(seller)) {
    let hId = user.get(seller, 'stock_id');
    if (hId === 0) {
      player.notify('~r~У игрока уже нет склада');
      seller.notify('~r~У Вас нет склада');
      return;
    }

    stock.updateOwnerInfo(hId, user.getId(player), user.getRpName(player));
    user.set(player, 'stock_id', hId);
    user.set(seller, 'stock_id', 0);

    user.addCashMoney(seller, sum);
    user.removeCashMoney(player, sum);

    seller.notify('~b~Вы продали склад за ~s~$' + methods.numberFormat(sum));
    player.notify('~b~Вы купили склад за ~s~$' + methods.numberFormat(sum));

    user.loginterract(player, seller, "PlayerSell", `Продал апартаменты @stock${hId} за $${sum}`)

    user.saveAccount(player);
    user.saveAccount(seller);
  }
});

mp.events.addRemoteCounted('server:car1:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 1);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car2:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 2);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car3:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 3);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car4:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 4);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car5:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 5);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car6:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 6);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car7:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 7);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:car8:sell', async (player) => {
  if (!user.isLogin(player)) return;
  await vehicles.sell(player, 8);
  autosalon.loadCars();
});

mp.events.addRemoteCounted('server:user:seeGosDoc', (player, playerRemoteId) => {
  if (!user.isLogin(player)) return;

  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer && user.isLogin(remotePlayer)) {
    if (user.isCuff(remotePlayer)) {
      player.notify('~r~Игрок в наручниках');
      return;
    }

    if (user.isSheriff(remotePlayer) || user.isSapd(remotePlayer)) {
      player.notify(`~y~Номер жетона:~s~ ${user.getId(remotePlayer)}`);
      player.notify(`~y~Имя:~s~ ${user.getRpName(remotePlayer)}`);
      player.notify(
        `~y~Организация:~s~ ${methods.getFractionName(user.get(remotePlayer, 'fraction_id'))}`
      );
    } else {
      player.notify('~r~Вы не нашли жетон');
    }
  }
});

mp.events.addRemoteCounted('server:user:showGosDoc', (player, playerRemoteId) => {
  if (!user.isLogin(player)) return;

  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer && user.isLogin(remotePlayer)) {


    if (!user.isCuff(remotePlayer) && remotePlayer != player) {
      user.playAnimation(remotePlayer, 'mp_common', 'givetake2_a', 8);
      user.playAnimation(player, 'mp_common', 'givetake1_a', 8);
    }


    if ([2, 3, 7].includes(user.get(player, 'fraction_id'))) {
      const fId = user.get(player, 'fraction_id');
      const data = {
        type: fId == 2 ? 'police' : fId == 3 ? 'fib' : fId == 7 ? 'sheriff' : '',
        name: user.getRpName(player),
        organization: methods.getFractionName(user.get(player, 'fraction_id')),
        post: user.getRankName(user.get(player, 'fraction_id'), user.get(player, 'rank')),
        division: (user.get(player, 'tag') == '' ? null : user.get(player, 'tag'))
      }

      user.setGui(remotePlayer, 'police_bage');
      setTimeout(() => mp.events.triggerBrowser(remotePlayer, 'cef:police_bage:init', ...Object.values(data)), 100);
    } else {
      let menuData = new Map();

      menuData.set('Card ID', '' + user.getId(player));
      menuData.set('Имя', '' + user.getRpName(player));
      menuData.set('Организация', '' + methods.getFractionName(user.get(player, 'fraction_id')));
      menuData.set(
        'Должность',
        '' + user.getRankName(user.get(player, 'fraction_id'), user.get(player, 'rank'))
      );
      menuData.set(
        'Отдел',
        '' + (user.get(player, 'tag') == '' ? '~r~Нет' : user.get(player, 'tag'))
      );

      user.showMenu(remotePlayer, 'Документы', user.getRpName(player), menuData, true);
    }
  }
});

mp.events.addRemoteCounted('server:user:showLic', (player, playerRemoteId) => {
  if (!user.isLogin(player)) return;

  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer && user.isLogin(remotePlayer)) {
    if (user.isCuff(remotePlayer)) {
      player.notify('~r~Игрок в наручниках');
      return;
    }

    if (remotePlayer != player) {
      user.playAnimation(remotePlayer, 'mp_common', 'givetake2_a', 8);
      user.playAnimation(player, 'mp_common', 'givetake1_a', 8);
    }

    const data = {
      name: user.getRpName(player),
      a_lic: user.get(player, 'a_lic'),
      b_lic: user.get(player, 'b_lic'),
      c_lic: user.get(player, 'c_lic'),
      air_lic: user.get(player, 'air_lic'),
      ship_lic: user.get(player, 'ship_lic'),
      gun_lic: user.get(player, 'gun_lic'),
      taxi_lic: user.get(player, 'taxi_lic'),
      law_lic: user.get(player, 'law_lic'),
      med_lic: user.get(player, 'med_lic'),
      biz_lic: user.get(player, 'biz_lic'),
      animal_lic: user.get(player, 'animal_lic'),
      fish_lic: user.get(player, 'fish_lic'),
    }
    user.setGui(remotePlayer, 'license');
    setTimeout(() => {
      if(mp.players.exists(remotePlayer))
      mp.events.triggerBrowser(remotePlayer, 'cef:license:init', data);
    }, 100);

    // let menuData = new Map();

    // menuData.set('Права категории А', '' + (user.get(player, 'a_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Права категории B', '' + (user.get(player, 'b_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Права категории C', '' + (user.get(player, 'c_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Лицензия пилота', '' + (user.get(player, 'air_lic') ? 'есть' : '~r~нет'));
    // menuData.set(
    //   'Лицензия на водный транспорт',
    //   '' + (user.get(player, 'ship_lic') ? 'есть' : '~r~нет')
    // );
    // menuData.set('Лицензия на оружие', '' + (user.get(player, 'gun_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Лицензия таксиста', '' + (user.get(player, 'taxi_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Лицензия адвоката', '' + (user.get(player, 'law_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Мед. страховка', '' + (user.get(player, 'med_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Лицензия на рыбалку', '' + (user.get(player, 'fish_lic') ? 'есть' : '~r~нет'));
    // menuData.set('Рецепт марихуаны', '' + (user.get(player, 'allow_marg') ? 'есть' : '~r~нет'));

    // user.showMenu(remotePlayer, 'Документы', user.getRpName(player), menuData);
  }
});

mp.events.addRemoteCounted('server:user:showCardId', (player, playerRemoteId) => {
  if (!user.isLogin(player)) return;

  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer && user.isLogin(remotePlayer)) {
    if (user.isCuff(remotePlayer)) {
      player.notify('~r~Игрок в наручниках');
      return;
    }

    if (remotePlayer != player) {
      user.playAnimation(remotePlayer, 'mp_common', 'givetake2_a', 8);
      user.playAnimation(player, 'mp_common', 'givetake1_a', 8);
    }

    let menuData = new Map();

    let years = user.getYears(player);
    // let month = user.getMonths(player);

    menuData.set('Card ID', '' + user.getId(player));
    menuData.set('Имя', '' + user.getRpName(player));
    menuData.set('Проживает в штате', `${years} лет.`);
    menuData.set('Возраст', `${user.get(player, "age")} лет.`);
    menuData.set('Регистрация', '' + user.getRegStatusName(player));

    user.showMenu(remotePlayer, 'Документы', user.getRpName(player), menuData);
  }
});

mp.events.addRemoteCounted('server:user:giveMoneyToPlayerId', (player, playerRemoteId, money) => {
  if (!user.isLogin(player)) return;

  if (user.getCashMoney(player) < money) {
    player.notify('~r~У Вас нет столько денег');
    return;
  }
  const userid = user.getId(player)
  if(!sendMoney.has(userid)) sendMoney.set(userid, 0)

  if((sendMoney.get(userid) + money) > sendmoneymax) return player.notify('~r~Лимит передачи денег с рук на руки в сутки: '+sendmoneymax+'$');

  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer && user.isLogin(remotePlayer)) {
    user.removeCashMoney(player, money);
    sendMoney.set(userid, sendMoney.get(userid) + money)
    user.addCashMoney(remotePlayer, money);
    user.playAnimation(remotePlayer, 'mp_common', 'givetake2_a', 8);
    user.playAnimation(player, 'mp_common', 'givetake1_a', 8);

    remotePlayer.notify('Вам передали ~g~$' + methods.numberFormat(money));
    player.notify('Вы передали ~g~$' + methods.numberFormat(money));

    methods.saveLog(
      'GiveCash',
      `${user.getRpName(player)} (${user.getId(player)}) to ${user.getRpName(
        remotePlayer
      )} (${user.getId(remotePlayer)}) count $${money}`
    );
  }
});

mp.events.addRemoteCounted('server:user:askDatingToPlayerId', (player, playerRemoteId, name) => {
  if (!user.isLogin(player)) return;

  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer && user.isLogin(remotePlayer)) {
    remotePlayer.call('client:user:askDatingToPlayerId', [player.id, name]);
  }
});

mp.events.addRemoteCounted(
  'server:user:askDatingToPlayerIdYes',
  (player, playerRemoteId, name, nameAnswer) => {
    if (!user.isLogin(player)) return;
    let remotePlayer = mp.players.at(playerRemoteId);
    if (user.isLogin(remotePlayer)) {
      userDatingEntity.destroy({
        where: {
          user_id: user.getId(player),
          user_owner: user.getId(remotePlayer)
        }
      })
      userDatingEntity.destroy({
        where: {
          user_id: user.getId(remotePlayer),
          user_owner: user.getId(player)
        }
      })

      setTimeout(function() {
        if (!user.isLogin(remotePlayer) || !user.isLogin(player)) return;


        userDatingEntity.create({
          user_owner: user.getId(remotePlayer),
          user_id: user.getId(player),
          user_name: nameAnswer,
        })
        userDatingEntity.create({
          user_owner: user.getId(player),
          user_id: user.getId(remotePlayer),
          user_name: name,
        })

      }, 5000);

      user.setDating(player, user.getId(remotePlayer), name);
      user.setDating(remotePlayer, user.getId(player), nameAnswer);
    }
  }
);

mp.events.addRemoteCounted('server:user:inviteFraction', async (player, playerRemoteId) => {
  if (!user.isLogin(player)) return;
  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer) {
    if (user.get(remotePlayer, 'fraction_id') > 0) {
      player.notify('Игрок уже состоит в организации');
      return;
    }

    if(await user.countWarns(remotePlayer) > 0){
      return player.notify("~r~Данный игрок имеет предупреждение")
    }

    if (user.isGos(player) && user.get(remotePlayer, 'is_gos_blacklist')) {
      player.outputChatBox(`!{${chat.clRed}} Игрок состоит в чёрном списке гос. организаций`);
      player.outputChatBox(
        `!{${chat.clRed}} Причина: !{${chat.clWhite}} ${user.get(
          remotePlayer,
          'gos_blacklist_reason'
        )}`
      );
      return;
    }
    user.accept(remotePlayer, "Хотите вступить в организацию?").then(res => {
      if(!res){
        player.notify('~r~Игрок отклонил предложение');
        return;
      }
      if (user.isGos(player)) {
        user.addHistory(
          remotePlayer,
          0,
          'Был принят в организацию ' +
            methods.getFractionName(user.get(player, 'fraction_id')) +
            '. Принял: ' +
            user.getRpName(player)
        );
      }
      user.loginterract(player, remotePlayer, "Invite", "Принял в организацию")

      user.set(remotePlayer, 'fraction_id', user.get(player, 'fraction_id'));
      user.set(remotePlayer, 'rank', 1);
      user.saveAccount(remotePlayer);
      user.updateClientCache(remotePlayer);
      remotePlayer.notify(
        'Вас приняли в организацию ~g~' + methods.getFractionName(user.get(player, 'fraction_id'))
      );
      player.notify('Вы приняли в организацию ~g~' + remotePlayer.getVariable('id'));

      methods.saveLog(
        'inviteFraction',
        'Был принят в организацию ' +
          methods.getFractionName(user.get(player, 'fraction_id')) +
          '. Принял: ' +
          user.getRpName(player)
      );
    });
  }
});

mp.events.addRemoteCounted('server:user:inviteFraction2', (player, playerRemoteId) => {
  if (!user.isLogin(player)) return;
  if (!business.isOffice(user.get(player, 'fraction_id2'))) return player.notify(`~r~Доступно только для офисов`)
  let remotePlayer = mp.players.at(playerRemoteId);
  if (remotePlayer) {
    if (user.get(remotePlayer, 'fraction_id2') > 0) {
      player.notify('~r~Игрок уже состоит в организации');
      return;
    }
    if (
      user.getLevel(remotePlayer) < levelAccess.inviteFraction2 &&
      business.getFractionType(user.get(player, 'fraction_id2')) != 3
    ) {
      player.notify('~r~Игрок должен иметь уровень '+levelAccess.inviteFraction2);
      // player.notify('~r~С 18 лет доступен инвайт только в банду');
      return;
    }
    user.accept(remotePlayer, "Хотите вступить в организацию?").then(res => {
      if(!res){
        player.notify('~r~Игрок отклонил предложение');
        return;
      }
      user.loginterract(player, remotePlayer, "Invite", "Принял в не офф организацию")
      user.set(remotePlayer, 'fraction_id2', user.get(player, 'fraction_id2'));
      user.set(remotePlayer, 'rank2', 1);
      user.saveAccount(remotePlayer);
      remotePlayer.notify('Вас приняли в организацию');
      player.notify('Вы приняли в организацию');
  
      user.set(
        remotePlayer,
        'fractionType',
        business.getFractionType(user.get(remotePlayer, 'fraction_id2'))
      );
  
      setTimeout(function() {
        if(mp.players.exists(remotePlayer)) user.updateClientCache(remotePlayer);
      }, 500);
    })
  }
});


mp.events.addRemoteCounted('server:fixCheckpointList', (player) => {
  try {
    for (let i = 0; i < methods.parseInt(methods.getCheckPointStaticList().length / 500) + 1; i++)
      player.call('client:updateCheckpointList', [
        methods.getCheckPointStaticList().slice(i * 500, i * 500 + 499),
        i
      ]);
  } catch (e) {
    methods.debug(e);
  }
});




mp.events.addRemoteCounted(
  'server:houses:getRandomHousePositionOfLosSantos',
  (player, triggerName) => {
    if (!user.isLogin(player)) return;
    houses.getRandomHousePositionOfLosSantos(player, triggerName);
  }
);


mp.events.add('server:azs:openAzs', (player) => {
  if(player.vehicle) return player.notify("Покиньте транспорт")
    let playerPos = player.position;
    fuel.stations.forEach(function(item, idx) {
        let fuelStationShopPos = new mp.Vector3(item[0], item[1], item[2]);
        if (methods.distanceToPos(playerPos, fuelStationShopPos) < 2) {
            let stationId = methods.parseInt(item[6]);
            let fuelStationPos = new mp.Vector3(fuel.markers[idx][0], fuel.markers[idx][1], fuel.markers[idx][2]);
            let vehicleList = methods.getListOfVehicleInRadius(fuelStationPos, methods.parseInt(item[5]));
            let vehicleNames: [string, string][] = []
            let fullTank: number[] = [];
            let currentTank: number[] = [];
            vehicleList.map(veh => {
                let vInfo = methods.getVehicleInfo(veh.model);
                currentTank.push(vehicles.getFuel(veh))
                fullTank.push(vInfo.fuel_full);
                vehicleNames.push([vInfo.display_name, veh.numberPlate]);
            })

            try {
                user.setGui(player, 'azs');
                setTimeout(() => mp.events.triggerBrowser(player, 'cef:azs:init', vehicleNames, stationId, fullTank, currentTank, business.getPrice(stationId)), 100)
            }
            catch (e) {
                methods.debug(e);
            }
        }
    });

});
mp.events.register('server:azs:buyCanister', (player, shopId, price) => {
  if (user.getMoney(player) < price * 10) {
    player.notify('~r~У Вас недостаточно средств');
    return;
  }
  let amount = inventory.getInvAmount(player, user.getId(player), 1);
  if (amount + items.getItemAmountById(9) > inventory.maxAmount(1, user.getId(player))) {
    player.notify('~r~Инвентарь заполнен');
    return;
  }
  user.setGui(player, null);
  user.removeMoney(player, price * 10);  
  business.addMoney(shopId, price * 10);
  inventory.addItem(player, 9, 1, 1, user.getId(player), 1, -1, -1, -1)
  inventory.updateAmount(player, user.getId(player), 1);
  player.notify('~g~Вы купили канистру по цене: $' + price * 10);
});

mp.events.register('server:azs:fill', (player, number, fuel, shopId, price) => {
  if (!user.isLogin(player)) return;
  let veh = vehicles.findVehicleByNumber(number);
  if(!veh) return;
  if (!vehicles.exists(veh)) {
    player.notify('~r~Транспорт не был заправлен');
    return;
  }

  let vInfo = methods.getVehicleInfo(veh.model);

  if (vInfo.fuel_full == 1) {
    player.notify('~r~Заправлять электроавто не нужно');
    return;
  }
  if(vInfo.fuel_full - vehicles.getFuel(veh) < fuel) fuel = vInfo.fuel_full - vehicles.getFuel(veh);
  if(fuel <= 0) return player.notify("ТС уже заправлен")
  let money = methods.parseInt(fuel * price);

  if (!veh.is_gos && user.getMoney(player) < money) {
    player.notify('~r~У Вас недостаточно средств');
    return;
  }
  vehicles.setFuel(veh, vehicles.getFuel(veh) + fuel);
  if(veh.is_gos){
    player.notify(`~g~Данный ТС заправляется бесплатно`)
  } else {
    business.addMoney(shopId, money);
    player.notify('~g~Вы заправили свой транспорт по цене: $' + money);
    user.removeMoney(player, money);
  }
  user.setGui(player, null);
})

mp.events.addRemoteCounted('server:addFractionLog', (player, name, doName, fractionId) => {
  logFractionGunEntity.create({
    name: name,
    do: doName,
    fraction_id: fractionId,
    timestamp: methods.getTimeStamp()
  });
});

mp.events.addRemoteCounted('server:methods:saveLog', (player, name, log) => {
  methods.saveLog(name, log);
});

mp.events.addRemoteCounted(
  'server:methods:createGlobalPedInVehicle',
  (player, model, vehicleId) => {
    methods.createGlobalPedInVehicle(model, vehicleId);
  }
);

mp.events.addRemoteCounted('server:methods:deleteGlobalPed', (player, id) => {
  methods.deleteGlobalPed(id);
});

mp.events.addRemoteCounted('server:user:setHeal', (player, level) => {
  user.healProtect(player)
  player.health = level;
});

mp.events.addRemoteCounted('server:user:getTaxi', (player, type, price) => {
  if (!user.isLogin(player)) return;

  user.set(player, 'taxiType', type);
  user.set(player, 'taxiPrice', price);
  setTimeout(function() {
    if (user.isLogin(player)) {
      if (!player.vehicle) {
        user.reset(player, 'taxiPrice');
        user.reset(player, 'taxiType');
      }
    }
  }, 1000 * 60 * 5);
  const ids = dispatchTaxiIdSet();
  mp.vehicles.forEach(function(v) {
    if (
      (v.getVariable('job') == 'taxi1' || v.getVariable('job') == 'taxi2') &&
      v.getOccupants().length > 0
    ) {
      v.getOccupants().forEach(function(p) {
        if (
          user.isLogin(p) &&
          (user.get(p, 'job') == 'taxi1' || user.get(p, 'job') == 'taxi2') &&
          p.seat == -1
        ) {
          switch (type) {
            case 0:
              if (
                methods.getVehicleInfo(v.model).display_name == 'Primo' ||
                methods.getVehicleInfo(v.model).display_name == 'Taxi' ||
                methods.getVehicleInfo(v.model).display_name == 'Oracle2' ||
                methods.getVehicleInfo(v.model).display_name == 'Schafter4' ||
                methods.getVehicleInfo(v.model).display_name == 'Revolter' ||
                methods.getVehicleInfo(v.model).display_name == 'SC1'
              )
                dispatcher.sendTaxiPosForPlayer(
                  p,
                  user.getPhone(player),
                  'Клиент вызвал такси ~b~эконом ~s~класса. Цена: ~g~$' + price,
                  price,
                  player.position,
                  ids
                );
              break;
            case 1:
              if (
                methods.getVehicleInfo(v.model).display_name == 'Oracle2' ||
                methods.getVehicleInfo(v.model).display_name == 'Schafter4' ||
                methods.getVehicleInfo(v.model).display_name == 'Revolter' ||
                methods.getVehicleInfo(v.model).display_name == 'SC1'
              )
                dispatcher.sendTaxiPosForPlayer(
                  p,
                  user.getPhone(player),
                  'Клиент вызвал такси ~b~комфорт ~s~класса. Цена: ~g~$' + price,
                  price,
                  player.position,
                  ids
                );
              break;
            case 2:
              if (
                methods.getVehicleInfo(v.model).display_name == 'Schafter4' ||
                methods.getVehicleInfo(v.model).display_name == 'Revolter' ||
                methods.getVehicleInfo(v.model).display_name == 'SC1'
              )
                dispatcher.sendTaxiPosForPlayer(
                  p,
                  user.getPhone(player),
                  'Клиент вызвал такси ~b~комфорт+ ~s~класса. Цена: ~g~$' + price,
                  price,
                  player.position,
                  ids
                );
              break;
            case 3:
              if (
                methods.getVehicleInfo(v.model).display_name == 'Revolter' ||
                methods.getVehicleInfo(v.model).display_name == 'SC1'
              )
                dispatcher.sendTaxiPosForPlayer(
                  p,
                  user.getPhone(player),
                  'Клиент вызвал такси ~b~бизнес ~s~класса. Цена: ~g~$' + price,
                  price,
                  player.position,
                  ids
                );
              break;
            case 4:
              if (methods.getVehicleInfo(v.model).display_name == 'SC1')
                dispatcher.sendTaxiPosForPlayer(
                  p,
                  user.getPhone(player),
                  'Клиент вызвал такси ~b~премиум ~s~класса. Цена: ~g~$' + price,
                  price,
                  player.position,
                  ids
                );
              break;
          }
        }
      });
    }
  });
});

mp.events.addRemoteCounted('server:user:sendTaxiAccept', (player, phone, id) => {
  if (!user.isLogin(player) || !player.vehicle) return;

  let iconPic:any = user.get(player, 'job') == 'taxi1' ? 'CHAR_TAXI' : 'CHAR_TAXI_LIZ';
  Container.Set(id, 'acceptTaxi', true);

  mp.players.forEach(function(p) {
    if (!user.isLogin(p)) return;

    if (user.getPhone(p) == phone) {
      let distance = methods
        .parseInt(methods.distanceToPos(p.position, player.position))
        .toString();
      let min = '1';

      if (distance.length == 4) min = distance.charAt(0);
      else if (distance.length == 5) min = distance.charAt(0) + distance.charAt(1);

      p.notifyWithPicture(
        user.getRpName(player),
        'Диспетчер',
        `Таксист принял заказ, время ожидания ~b~${min}мин.`,
        iconPic,
        1,
        false,
        -1,
        -1,
        [77, 77, 77, 200]
      );
      p.notify(`~y~Марка авто: ~s~${methods.getVehicleInfo(player.vehicle.model).display_name}`);
      p.notify(
        `~y~Цвет: ~s~${user.get(player, 'job') == 'taxi1' ? 'Желто-черный' : 'Бело-красный'}`
      );
      p.notify(`~y~Номер: ~s~${player.vehicle.numberPlate}`);
      p.notify(`~y~Пожалуйста оставайтесь на месте`);
    }

    if (p.vehicle && p.seat == -1 && user.get(p, 'job') == user.get(player, 'job'))
      p.notifyWithPicture(
        user.getRpName(player),
        'Диспетчер',
        `Заказ ~b~#${id}~s~ был принят`,
        iconPic,
        1,
        false,
        -1,
        -1,
        [77, 77, 77, 200]
      );
  });
});

mp.events.add('playerEnterVehicle', (player: PlayerMp, vehicle: VehicleMp, seat: number) => {
  if (seat == -1) return;

  if (!user.has(player, 'taxiType')) return;

  if (vehicle.getVariable('job') == 'taxi1' || vehicle.getVariable('job') == 'taxi2') {
    vehicle.getOccupants().forEach(function(p) {
      if (p.seat == -1) {
        if (user.getLevel(player) == levelAccess.freeTaxi) player.notify('~g~Акция от компании, поездка бесплатна');

        p.notify('~g~Ваш клиент сел к вам в такси');
        player.notify('~g~По завершению поездки будет выставлен счёт');
        let pos = player.position;
        user.set(player, 'taxiStartPosX', pos.x);
        user.set(player, 'taxiStartPosY', pos.y);
        user.set(player, 'taxiStartPosZ', pos.z);

        if (user.has(player, 'taxiPosX')) {
          let finalPosX = user.get(player, 'taxiPosX');
          let finalPosY = user.get(player, 'taxiPosY');
          user.setWaypoint(p, finalPosX, finalPosY);
        }
      }
    });
  }
});

mp.events.add('playerExitVehicle', (player, vehicle) => {
  if (vehicle.getVariable('job') == 'taxi1' || vehicle.getVariable('job') == 'taxi2') {
    if (user.has(player, 'taxiStartPosX')) {
      let driver = user.getVehicleDriver(vehicle);

      let pos = player.position;
      let startPosX = user.get(player, 'taxiStartPosX');
      let startPosY = user.get(player, 'taxiStartPosY');
      let startPosZ = user.get(player, 'taxiStartPosZ');
      let startPos = new mp.Vector3(startPosX, startPosY, startPosZ);

      if (user.has(player, 'taxiPosX')) {

        let dist = methods.distanceToPos2D(pos, startPos);
        let classType = user.has(player, 'taxiType')
          ? user.get(player, 'taxiType')
          : methods.getTaxiModalClass(vehicle.model);
        if (user.getLevel(player) == levelAccess.freeTaxi) classType = 0;
        let finalPrice = user.has(player, 'taxiPrice')
          ? user.get(player, 'taxiPrice')
          : methods.getTaxiDistPrice(pos, startPos, classType);

        if (dist < 200){
          player.notify('~r~Ваша поездка была слишком короткой')
          if(mp.players.exists(driver))driver.notify('~r~Ваша поездка была слишком короткой')
        } else {
          finalPrice = methods.getTaxiDistPrice(pos, startPos, classType);
  
          try {
            if (user.isLogin(driver)) {
              if (user.get(driver, 'job') == 'taxi1' || user.get(driver, 'job') == 'taxi2') {
                if (user.getLevel(player) == levelAccess.freeTaxi) {
                  user.giveTaxiJobMoney(driver, finalPrice*0.8);
                  player.notify('~g~Акция от компании, поездка бесплатна');
                } else { 
                  if (finalPrice >= 150 && user.get(driver, 'skill_taxi') < 400){
                    if (mp.players.exists(driver))user.set(driver, 'skill_taxi', user.get(driver, 'skill_taxi') + methods.parseInt(finalPrice/100));
                  }
                  user.removeCashMoney(player, finalPrice);
                  player.notify('~g~Вы заплатили за поездку ~s~$' + methods.numberFormat(finalPrice));
                  if (mp.players.exists(driver))user.giveTaxiJobMoney(driver, finalPrice*0.9);
                }
                if (mp.players.exists(driver))driver.notify('~g~Поездка была завершена');
              }
            }
          } catch (e) {
            methods.debug(e);
          }
        }
      }

      user.reset(player, 'taxiStartPosX');
      user.reset(player, 'taxiStartPosY');
      user.reset(player, 'taxiStartPosZ');
      user.reset(player, 'taxiPosX');
      user.reset(player, 'taxiPosY');
      user.reset(player, 'taxiType');
      user.reset(player, 'taxiPrice');
    }
  }
});

mp.events.add('rappel', (player: PlayerMp) => {
  mp.players.call('rappelSync', [player.id])
})

mp.events.add('playerDeath', (player, reason, killer) => {
  if (user.isLogin(killer) && user.isLogin(player)) {
    try {
      let killerPos = killer.position;
      methods.saveLog(
        'PlayerDeath',
        `${user.getRpName(player)} (${user.getId(player)}) kill by ${user.getRpName(
          killer
        )} (${user.getId(killer)}) ${reason} [${killerPos.x}, ${killerPos.y}, ${killerPos.z}]`
      );
    } catch (e) {
      methods.debug(e);
    }
  } else if (user.isLogin(player)) {
    try {
      methods.saveLog('PlayerDeath', `${user.getRpName(player)} (${user.getId(player)}) ${reason}`);
    } catch (e) {
      methods.debug(e);
    }
  }

  user.set(player, 'killerInJail', false);

  if (user.isLogin(killer)) {
    if(user.isGosPD(killer) && !user.isGosPD(player)){
      if (user.get(player, 'wanted_level') > 0) {
        user.set(player, 'killerInJail', true);
      }
    }
  }


});

mp.events.addRemoteCounted('server:sendMegaphonePrison', (player, text) => {
  if (user.isLogin(player)) {
    let playerName = user.getRpName(player);
    chat.sendPos(
      new mp.Vector3(1707.69, 2546.69, 45.56),
      200,
      `Мегафон тюрьмы (( ${playerName} ))`,
      text,
      chat.clOrange
    );
  }
});

mp.events.addRemoteCounted('playerDeathDone', (player) => {
  if (user.isLogin(player)) {
    if (user.has(player, 'killerInJail') && user.get(player, 'killerInJail')) {
      user.jail(player, user.get(player, 'wanted_level') * 450);
      player.outputChatBox(
        '!{#FFC107}Вас привезли в больницу с огнестрельным ранением и у врачей возникли подозрения, поэтому они сделали запрос в SAPD и сотрудники SAPD выяснили, что у вас есть розыск. После лечения вы отправились в тюрьму.'
      );
    }
  }
});

const AFTER_DEATH_TIMER = 30;
let deadListids = 0;
export let deadList: { ids:number,id: number, x: number, y: number, z: number }[] = [];
mp.events.addRemoteCounted('server:login:success:after', (player) => {
  if(user.isAdmin(player)){
    player.call('listAfterDeath', [JSON.stringify(deadList)]);
  }
});
mp.events.addRemoteCounted('playerDeathDone', (player) => {
  if (user.isLogin(player)) {
    deadListids++;
    const id = parseInt(`${deadListids}`);
    let obj = { ids: id, id: user.getId(player), x: player.position.x, y: player.position.y, z: player.position.z }
    deadList.push(obj)
    mp.players.toArray().filter(target => user.isLogin(target) && user.isAdmin(target)).map(target => {
      target.call('addAfterDeath', [obj])
    })
    setTimeout(() => {
      let fnd = deadList.findIndex(value => value.ids == id);
      if (fnd > -1){
        deadList.splice(fnd, 1);
        mp.players.toArray().filter(target => user.isLogin(target) && user.isAdmin(target)).map(target => {
          target.call('removeAfterDeath', [id])
        })
      }
    }, AFTER_DEATH_TIMER * 60 * 1000)
  }
});

mp.events.addRemoteCounted('onKeyPress:2', (player) => {
  if (!user.isLogin(player)) return;
  if (user.isDriver(player)){
    let data = vehicles.getData(player.vehicle.getVariable('container'));
    let vInfo = methods.getVehicleInfo(player.vehicle.model);
    let ownerName = 'Государство';
    if (data.get('id_user') > 0) ownerName = data.get('user_name');
    if (data.get('fraction_id') > 0) ownerName = methods.getFractionName(data.get('fraction_id'));
    // !todo -> if (data.has('job') > 0) ownerName = methods.getCompanyName(data.get('job'));
    if (data.get('job') > 0) ownerName = methods.getCompanyName(data.get('job'));
    let m = menu.new(player, "", `~b~Владелец: ~s~${ownerName}`);
    m.sprite = "shopui_title_ie_modgarage";
    m.newItem({
      name: `Выкинуть пассажира из ТС`,
      onpress: () => {
        if (!player.vehicle) return menu.close(player);
        let list = player.vehicle.getOccupants()
        if (list.length <= 1) return player.notify(`~r~В ТС нет пассажиров`)
        menu.selectNearestPlayers(player, 0).then(target => {
          if (!player.vehicle) return menu.close(player);
          if(!target) return;
          if(!target.vehicle || player.vehicle != target.vehicle) return;
          if (user.getId(target) == data.get('id_user')) return player.notify("~r~Нельзя выкинуть владельца ТС");
          target.removeFromVehicle()
          target.notify('~r~Водитель вас выкинул из ТС');
        })
      }
    })
    if (vInfo.class_name != 'Cycles'){
      m.newItem({
        name: `~g~Вкл~s~ / ~r~выкл~s~ двигатель`,
        onpress: () => {
          if(!player.vehicle) return menu.close(player);
          if (user.isDriver(player)) {
            const veh = player.vehicle;
            if (user.isAdminNow(player)) return vehicles.engineStatus(player, player.vehicle);
            if(veh.fraction_id){
              if (user.getPlayerFraction(player) == veh.fraction_id) vehicles.engineStatus(player, player.vehicle);
              else player.notify('~r~У Вас нет ключей от транспорта');
            } else {
              vehicles.engineStatus(player, player.vehicle);
            }
          }
        }
      })
    }
    if (vInfo.class_name == 'Boats' || [mp.joaat('riot'), mp.joaat('riot2'), mp.joaat('insurgent'), mp.joaat('insurgent2')].includes(player.vehicle.model)){
      m.newItem({
        name: `~g~Вкл~s~ / ~r~выкл~s~ ${vInfo.class_name == 'Boats' ? 'якорь' : 'ручник'}`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          player.vehicle.setVariable('freezePosition', !(!!player.vehicle.getVariable('freezePosition')));
          player.notify(`~g~${vInfo.class_name == 'Boats' ? 'Якорь' : 'Ручник'}: ${!!player.vehicle.getVariable('freezePosition') ? '~g~Опущен' : '~b~Поднят'}`)
        }
      })
    }

    if (vInfo.fuel_min > 0)
      m.newItem({
        name: `Топливо`,
        more: `Топливо: ~g~${Math.round(data.get('fuel'))}~s~л.`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          let pos = fuel.findNearest(player.position);
          if (!pos) return player.notify(`~r~Не удалось найти заправку поблизости`)
          user.setWaypoint(player, pos.x, pos.y);
          player.notify('~b~Метка на заправку установлена');
        }
      })
    else if (vInfo.class_name != 'Cycles'){

      m.newItem({
        name: `Топливо`,
        more: `Не требует заправки`
      })
    }
    // @ts-ignore
    if (vInfo.class_name !== 'Planes' || vInfo.class_name !== 'Cycles' || vInfo.class_name !== 'Helicopters' || vInfo.class_name !== 'Boats'){
      m.newItem({
        name: `Управление транспортом`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          player.call('showVehicleDoMenu')
        }
      })
    }

    if (vInfo.fuel_min == 0 && vInfo.class_name != 'Cycles')
      m.newItem({
        name: `Автопилот`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          player.call('showVehicleAutopilotMenu')
        }
      })

    if (data.get('id_user') > 0 && user.getId(player) == data.get('id_user')){
      let v = player.vehicle;
      // if (isPointInSalePosition(player.position)){
      //   m.newItem({
      //     name: `Продать ТС пассажиру`,
      //     onpress: () => {


      //       if (!isPointInSalePosition(player.position)) return menu.close(player), player.notify("~r~Вы покинули точку продажи ТС");
      //       const veh = player.vehicle;
      //       if (!veh) return menu.close(player);
      //       if (v.id != veh.id) return menu.close(player);
      //       const occupants = veh.getOccupants();
      //       if (occupants.length < 2) return player.notify("~r~В транспорте нет пассажира");
      //       if (occupants.length > 2) return player.notify("~r~В транспорте должны быть только вы и покупатель");

      //       menu.close(player);
      //       menu.input(player, "Введите стоимость продажи", "", 8, 'int').then(sum => {
      //         if(sum === null) return;
      //         if(isNaN(sum) || sum <= 0) return player.notify("~r~Стоимость продажи указана не верно");
      //         if (!player.vehicle) return player.notify("~r~Вы покинули транспорт");
      //         if (!user.isDriver(player)) return player.notify("~r~Вы покинули транспорт");
      //         if (!isPointInSalePosition(player.position)) return player.notify("~r~Вы покинули точку продажи ТС");
      //         const occupants = veh.getOccupants();
      //         if (occupants.length < 2) return player.notify("~r~В транспорте нет пассажира");
      //         if (occupants.length > 2) return player.notify("~r~В транспорте должны быть только вы и покупатель");
      //         const target = occupants.find(pl => pl.id !== player.id);
      //         if (!target) return;
      //         const reject = () => {
      //           if(mp.players.exists(player)) player.notify("~r~Покупка не состоялась")
      //           if (mp.players.exists(target)) target.notify("~r~Покупка не состоялась")
      //         }
      //         let m = menu.new(target, "", "Продажа транспорта");
      //         m.onclose = () => { reject() };
      //         getVehicleVisualParams("").map(itm => {
      //           m.newItem({
      //             name: itm[0],
      //             more: itm[1]
      //           })
      //         })
      //         m.newItem({
      //           name: '~y~Стоимость',
      //           more: `$${methods.numberFormat(sum)}`
      //         })
      //         m.newItem({
      //           name: "~g~Согласится",
      //           onpress: () => {
      //             if(!mp.players.exists(player)) return reject();
      //             if(!mp.players.exists(target)) return reject();
      //             if (!player.vehicle) return reject();
      //             if (!target.vehicle) return reject();
      //             if (target.vehicle.id !== v.id) return reject();
      //             if (target.vehicle.id !== player.vehicle.id) return reject();
      //             const occupants = target.vehicle.getOccupants();
      //             if (occupants.length < 2) return reject();
      //             if (occupants.length > 2) return reject();
      //             if (user.getCashMoney(target) < sum){
      //               target.notify('~r~У вас недостаточно средств для оплаты');
      //               return reject();
      //             }
      //             let slot = vehicles.getVehSlot(player, target.vehicle);
      //             if(!slot) return reject();
      //             mp.events.call('server:car:sellToPlayer:accept', target, sum, player.id, slot)
      //           }
      //         })
      //         m.newItem({
      //           name: "~r~Отказатся",
      //           onpress: () => {
      //             m.close();
      //             reject()
      //           }
      //         })
      //         m.open();
      //       })
      //     }
      //   })
      // }
      m.newItem({
        name: `~g~Открыть~s~ / ~r~Закрыть~s~`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          vehicles.lockStatus(player, player.vehicle);
        }
      })
      m.newItem({
        name: `Припарковать`,
        desc: "Транспорт будет спавниться на месте парковки",
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          let pos = player.vehicle.position;
          vehicles.park(player.vehicle.getVariable('container'), pos.x, pos.y, pos.z, player.vehicle.heading);
          player.notify('~b~Вы припарковали свой транспорт');
        }
      })

      if(data.get('neon_type') > 0){
        m.newItem({
          name: `~g~Вкл~s~ / ~r~выкл~s~ неон`,
          onpress: () => {
            if (!player.vehicle) return menu.close(player);
            vehicles.neonStatus(player, player.vehicle);
          }
        })
        if (data.get('neon_type') > 1) {
          m.newItem({
            name: `~b~Цвет неона`,
            onpress: async () => {
              if (!player.vehicle) return menu.close(player);
              vehicles.neonStatus(player, player.vehicle);
              let r = await menu.input(player, 'Оттенок красного (0-255)', '0', 3, 'int');
              if (typeof r != 'number' || isNaN(r)) return;
              if (r < 0 || r > 255) return;
              let g = await menu.input(player, 'Оттенок красного (0-255)', '0', 3, 'int');
              if (typeof g != 'number' || isNaN(g)) return;
              if (g < 0 || g > 255) return;
              let b = await menu.input(player, 'Оттенок красного (0-255)', '0', 3, 'int');
              if (typeof b != 'number' || isNaN(b)) return;
              if (b < 0 || b > 255) return;
              player.vehicle.setNeonColor(r, g, b);
              vehicles.set(player.vehicle.getVariable('container'), 'neon_r', r);
              vehicles.set(player.vehicle.getVariable('container'), 'neon_g', g);
              vehicles.set(player.vehicle.getVariable('container'), 'neon_b', b);
            }
          })
        }
      }
    }

    m.newItem({
      name: `Характеристики`,
      onpress: () => {
        if (!player.vehicle) return menu.close(player);
        let submenu = menu.new(player, "Характеристики транспорта")
        submenu.newItem({ name: `~b~Класс: ~s~`, more: `${vInfo.class_name}`})
        submenu.newItem({ name: `~b~Модель: ~s~`, more: `${vInfo.display_name}`})
        if (vInfo.fuel_min > 0) {
          submenu.newItem({ name: `~b~Вместимость бака: ~s~`, more: `${vInfo.fuel_full}л.`})
          submenu.newItem({ name: `~b~Расход топлива: ~s~`, more: `${vInfo.fuel_min}л.`})

        } else {
          submenu.newItem({ name: `~b~Расход топлива: ~s~`, more: `Электрокар` })
        }
        
        let stockFull = vInfo.stock;
        if (vInfo.stock > 0){
          stockFull = stockFull / 1000;
          submenu.newItem({ name: `~b~Вместимость багажника: ~s~`, more: `${stockFull}кг.` })
        }


        submenu.open();
      }
    })

    if (player.vehicle.getVariable('rentOwner') == user.getId(player)){
      m.newItem({
        name: `~y~Отказатся от аренды`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          if (player.vehicle.getVariable('rentOwner') != user.getId(player)) return player.notify('~b~Вы не арендуете данный ТС');
          player.vehicle.destroy();
          player.notify('~g~Вы отказались от аренды ТС');
        }
      })
    }

    if (data.get('job') || user.get(player, 'job')){
      m.newItem({
        name: `~b~Управление рабочим транспортом`,
        onpress: () => {
          if (!player.vehicle) return menu.close(player);
          player.callsocket('client:menuList:showVehicleMenu', [
            Array.from(vehicles.getData(player.vehicle.getVariable('container'))),
          ]);
        }
      })
    }

    m.open();
    return;
    
  } else {
    player.notify(`~r~Вы должны быть в транспорте`);
  }
});

mp.events.addRemoteCounted('onKeyPress:L', (player) => {
  if (!user.isLogin(player)) return;
  let admin = user.isAdminNow(player, 2);
  let vehicle = methods.getNearestVehicleWithCoords(player.position, 5);
  if (vehicles.exists(vehicle)) {
    let data = vehicles.getData(vehicle.getVariable('container'));
    if(!data) return;
    if (data.has('fraction_id')) {
      if (admin || data.get('fraction_id') == user.get(player, 'fraction_id'))
        vehicles.lockStatus(player, vehicle);
      else player.notify('~r~У Вас нет ключей от транспорта');
    } else if (data.has('owner_id')) {
      if (admin || data.get('owner_id') == user.getId(player)) vehicles.lockStatus(player, vehicle);
      else player.notify('~r~У Вас нет ключей от транспорта');
    } else if (data.has('rentOwner')) {
      if (admin || data.get('rentOwner') == user.getId(player)) vehicles.lockStatus(player, vehicle);
      else player.notify('~r~У Вас нет ключей от транспорта');
    } else if (data.has('id_user')) {
      if (admin || data.get('id_user') == user.getId(player)) vehicles.lockStatus(player, vehicle);
      else player.notify('~r~У Вас нет ключей от транспорта');
    } else vehicles.lockStatus(player, vehicle);
  }
});

mp.events.addRemoteCounted('onKeyPress:LAlt', (player) => {
  if (!user.isLogin(player)) return;
  pickups.checkPressLAlt(player);
});

mp.events.add('onPressKeyCasino:e', (player) => {
  if (!user.isLogin(player)) return;

  if (!casinoSlotMachines.pressE(player)) {
    if (!casinoRoulette.pressE(player)) {
      if (!casinoThreeCardPoker.pressE(player)) {
        casinoDice.pressE(player)
      }
    }
  }
});

mp.events.addRemoteCounted('playerEnterCheckpoint', (player, checkpoint) => {
  if (!user.isLogin(player)) return;
  if (Container.Has(999999, 'checkpointLabel' + checkpoint.id)){
    let text = <string>Container.Get(999999, 'checkpointLabel' + checkpoint.id).toString();
    if(text.regexIndexOf(/Нажмите ~[a-zA-Z]~[a-zA-Zа-яА-Я]~[a-zA-Z]~ чтобы /g, 0) == 0){
      let res = text.replace(/Нажмите ~[a-zA-Z]~[a-zA-Zа-яА-Я]~[a-zA-Z]~ чтобы /g, '');
      res = res[0].toUpperCase() + res.slice(1);
      user.setHelpKey(player, text.split(/Нажмите ~[a-zA-Z]~/g)[1].split(/~[a-zA-Z]~ чтобы /g)[0], res, 3000);
    }
    else player.notify(Container.Get(999999, 'checkpointLabel' + checkpoint.id));
  }
});

mp.events.add('client:enterStaticCheckpoint', (player, checkpointId) => {
  if (!user.isLogin(player)) return;
  //TODO когда будет реализован ShowTooltip тогда переделаем.
  if (Container.Has(999999, 'checkpointStaticLabel' + checkpointId)){
    let text = <string>Container.Get(999999, 'checkpointStaticLabel' + checkpointId).toString();
    if(text.regexIndexOf(/Нажмите ~[a-zA-Z]~[a-zA-Zа-яА-Я]~[a-zA-Z]~ чтобы /g, 0) == 0){
      let res = text.replace(/Нажмите ~[a-zA-Z]~[a-zA-Zа-яА-Я]~[a-zA-Z]~ чтобы /g, '');
      res = res[0].toUpperCase() + res.slice(1);
      user.setHelpKey(player, text.split(/Нажмите ~[a-zA-Z]~/g)[1].split(/~[a-zA-Z]~ чтобы /g)[0], res, 3000);
    }
    else player.notify(Container.Get(999999, 'checkpointStaticLabel' + checkpointId));
  }
});

// Phone Server Events
mp.events.addRemoteCounted('server:phone:SendSms', (player, number, text) => {
  if (!user.isLogin(player)) return;
  phone.sendSms(player, number, text);
});

let callIds = 1;

mp.events.addRemoteCounted('server:phone:call', (player, number) => {
  if (!user.isLogin(player)) return;
  if(player.getVariable('call')) return player.notify("Вы уже с кем то разговариваете");
  let target = phone.getByNumber(number);
  if(!target) return player.notify("Номер набран не верно либо абонент не в сети")
  if(target == player) return player.notify("Это ваш номер")
  if(target.getVariable('call')) return player.notify("Абонент с кем то разговаривает");
  user.accept(target, "Звонок от "+phone.getNumber(player)).then(status => {
    if (!mp.players.exists(target) || !mp.players.exists(player)) return;
    if(!status) return player.notify("Абонент отклонил вызов");
    player.enableVoiceTo(target)
    target.enableVoiceTo(player)
    player.notify("Соединение установлено")
    target.notify("Соединение установлено")
    player.setVariable('call', callIds);
    target.setVariable('call', callIds);
    player.callsocket('callStart', [target])
    target.callsocket('callStart', [player])
    callIds++;
  })
});
mp.events.addRemoteCounted('server:phone:cancelCall', (player) => {
  if (!user.isLogin(player)) return;
  if(!player.getVariable('call')) return player.notify("Вы ни с кем не разговариваете");
  let target = mp.players.toArray().find(usr => usr.id != player.id && usr.getVariable('call') == player.getVariable('call'))
  player.notify("Звонок завершен")
  if(target && mp.players.exists(target))target.notify("Звонок завершен")
  if (target && mp.players.exists(target))player.disableVoiceTo(target)
  if(target && mp.players.exists(target))target.disableVoiceTo(player)
  player.setVariable('call', null);
  user.stopSyncAnimation(player);
  if(target && mp.players.exists(target))target.setVariable('call', null);
  if(target && mp.players.exists(target))user.stopSyncAnimation(target);
  player.callsocket('callStop')
  if (target && mp.players.exists(target)) target.callsocket('callStop')
});

mp.events.addRemoteCounted('server:phone:OpenSmsListMenu', (player, number) => {
  if (!user.isLogin(player)) return;
  phone.openSmsListMenu(player, number);
});

mp.events.addRemoteCounted('server:phone:OpenContactListMenu', (player, number) => {
  if (!user.isLogin(player)) return;
  phone.openContactListMenu(player, number);
});

mp.events.addRemoteCounted('server:phone:OpenSmsInfoMenu', (player, id) => {
  if (!user.isLogin(player)) return;
  phone.openSmsInfoMenu(player, id);
});

mp.events.addRemoteCounted('server:phone:OpenContInfoMenu', (player, id) => {
  if (!user.isLogin(player)) return;
  phone.openContInfoMenu(player, id);
});

mp.events.addRemoteCounted('server:phone:DeleteSms', (player, id) => {
  if (!user.isLogin(player)) return;
  phone.deleteSms(player, id);
});

mp.events.addRemoteCounted('server:phone:AddContact', (player, phonenumber, title, num) => {
  if (!user.isLogin(player)) return;
  phone.addContact(player, phonenumber, title, num);
});

mp.events.addRemoteCounted('server:phone:DeleteContact', (player, id) => {
  if (!user.isLogin(player)) return;
  phone.deleteContact(player, id);
});

mp.events.addRemoteCounted('server:phone:RenameContact', (player, id, name) => {
  if (!user.isLogin(player)) return;
  phone.renameContact(player, id, name);
});

import Discord from 'discord.js'
import { promocodeUsingEntity, promocodeEntity } from './entity/promocodeUsing';
import { sequelize } from './sequelize';
import { logFractionGunEntity } from './entity/logFractionGunEntity';
import { vSync } from '../managers/vSync';
import { apartmentEntity } from './entity/apartmentEntity';
import { userDatingEntity } from './entity/userDatingEntity';
import { rpInvaderAdEntity } from './entity/rpInvaderAdEntity';
import { promocodeTopListEntity } from './entity/promocodeTopEntity';
import { whitelist } from './whitelist';
import { isPointInSalePosition, getVehicleVisualParams } from '../../util/vehsell';
import { carsEntity } from './entity/carsModel';
const hook = new Discord.WebhookClient('681575693955760171', 'Jgmj0WC_UemhkRGbPUTLas7yPVibpn1sQwkVuFWWCPBOm55MGDHUhSF5xw_WBvgalWeL');
mp.events.addRemoteCounted('server:phone:AddAd', (player, text, rpName, phone, type) => {
  if (!user.isLogin(player)) return;
  //phone.addAd(player, text, rpName, phone, type);
  if(!methods.isTestServer()){
    const exampleEmbed = new Discord.RichEmbed()
      .setColor('#f00c17')
      .setTitle(`Объявление [${type}]`)
      .setURL('https://rp.gta-5.ru/rp/news')
      .setAuthor(`${phone} [${user.getId(player)}]`)
      .setDescription(text)
      .setTimestamp()
      .setFooter('LifeInvader', 'https://i.imgur.com/qats7HI.png');
    hook.send(exampleEmbed)
  }

  rpInvaderAdEntity.create({
    datetime: weather.getRpDateTime(),
    name: rpName,
    phone: phone,
    title: type,
    text: text,
  })
});

// Promocodes
export let tempPromocodes = new Map<string, {label:TextLabelMp,sum:number}>();
export const createTempPromocode = (player:PlayerMp, sum:number,dist:number,los:boolean):void => {
  let code = vehicles.generateNumber(10);
  code = code.toUpperCase();
  if (tempPromocodes.has(code)) return createTempPromocode(player, sum, dist, los);
  tempPromocodes.set(code, {sum,label:mp.labels.new('~b~Ивентовый бонус-код на ~g~$'+methods.numberFormat(sum)+'\r~p~'+code, player.position, {
    dimension: player.dimension,
    font: 0,
    los: los,
    drawDistance: dist
  })})
}


mp.events.addRemoteCounted('server:activatePromocode', async (player, promocode) => {
  if (!user.isLogin(player)) return;
  promocode = promocode.toUpperCase();
  if(player.spamProtect) return player.notify(`~r~Подождите пару секунд`)
  player.spamProtect = true;
  setTimeout(() => {
    player.spamProtect = false;
  }, 5000)
  if (tempPromocodes.has(promocode)){
    let data = tempPromocodes.get(promocode);
    user.addCashMoney(player, data.sum);
    if(mp.labels.exists(data.label)) data.label.destroy();
    player.notify('~g~Вы успешно активировали промокод на сумму $' + methods.numberFormat(data.sum))
    tempPromocodes.delete(promocode);
    return;
  }
  let acs = await user.getAllAccounts(player)
  let myAccounts = acs.map(usr => {return usr.id});
  let alreadyEntered = !!(await promocodeUsingEntity.findOne({ where: { user_id: { [Op.in]: myAccounts }, promocode_name: promocode}}))
  if (alreadyEntered) return player.notify('~r~Вы уже активировали этот промокод');
  promocodeEntity.findAll({
    where: {
      code: promocode
    }, limit: 1
  }).then(rows => {
      if (rows.length >= 1) {
        rows.forEach((row) => {
          user.addMoney(player, methods.parseInt(row['bonus']));
          player.notify(
            `~g~Промокод: ${promocode} активирован, вы получили $${methods.numberFormat(
              row['bonus']
            )}`
          );
          promocodeUsingEntity.create({
            user_id: user.getId(player),
            promocode_name: promocode
          })
        });
      } else {
        promocodeTopListEntity.findAll({where: {
          promocode: promocode,
        }, limit: 1}).then(rows => {
            if (rows.length >= 1) {
              if (user.get(player, 'promocode') == '') {
                if (user.getLevel(player) <= levelAccess.startPromocode) {
                  user.set(player, 'promocode', promocode);
                  player.notify('~g~Вы ввели промокод: ~s~' + promocode);
                  user.addCashMoney(player, 1000);
                  user.updateClientCache(player);
                  user.saveAccount(player);
                  userEntity.increment({ money_donate: 2 }, { where: { parthner_promocode: user.get(player, 'promocode')}})
                  return;
                }
                player.notify('~r~Доступно до уровня ' + levelAccess.startPromocode);
                return;
              }
              player.notify('~r~Вы уже активировали этот промокод');
            } else {
              player.notify('~r~Такого промокода не существует');
            }
          }
        );
      }
    }
  );
});




mp.events.add("sync.elements", (player:PlayerMp, datas:string) => {
  let data = JSON.parse(datas);
  methods.debug(user.getRpName(player), user.getId(player), "called sync.elements", data)
  player.inGreenZone = data.insaveZone;
  player.interrior = data.interrior;
  player.weaponsAll = data.weapons
})


mp.events.addRemoteCounted("custom:norpfload", player => {
  player.notify("~r~Внимание!!! ~r~У вас нет необходимых текстур");
  player.outputChatBox("Внимание!!! Мы обнаружили что у вас в клиенте нет необходимых для нормальной работы кастомных текстур. Убедительная просьба полностью закрыть RAGE Multiplayer и перезайти на сервер для корректной работы.")
})

mp.events.addRemoteCounted("server:vehicle:tunmoney:return", async player => {
  if(!player.vehicle) return player.notify("~r~Вы должны быть в транспорте");
  const vehicle = player.vehicle;
  let car = await vehicles.getData(vehicle.getVariable('container'));
    if(car){
      if(car.has('upgrade')){
        let upgrade = JSON.parse(car.get('upgrade'));
        if(upgrade){
          const percent = 0.5;
          let price = 1;
          let resprice = 0;
          if (vehicle.getVariable('price') >= 8000 && vehicle.getVariable('price') < 15000) price = 1.2;
          else if (vehicle.getVariable('price') >= 15000 && vehicle.getVariable('price') < 30000) price = 1.4;
          else if (vehicle.getVariable('price') >= 30000 && vehicle.getVariable('price') < 45000) price = 1.6;
          else if (vehicle.getVariable('price') >= 45000 && vehicle.getVariable('price') < 60000) price = 1.8;
          else if (vehicle.getVariable('price') >= 60000 && vehicle.getVariable('price') < 75000) price = 2;
          else if (vehicle.getVariable('price') >= 90000 && vehicle.getVariable('price') < 105000) price = 2.2;
          else if (vehicle.getVariable('price') >= 105000 && vehicle.getVariable('price') < 120000) price = 2.4;
          else if (vehicle.getVariable('price') >= 120000 && vehicle.getVariable('price') < 135000) price = 2.6;
          else if (vehicle.getVariable('price') >= 135000 && vehicle.getVariable('price') < 150000) price = 2.8;
          else if (vehicle.getVariable('price') >= 150000 && vehicle.getVariable('price') < 200000) price = 3;
          else if (vehicle.getVariable('price') >= 200000 && vehicle.getVariable('price') < 240000) price = 3.3;
          else if (vehicle.getVariable('price') >= 240000 && vehicle.getVariable('price') < 280000) price = 3.6;
          else if (vehicle.getVariable('price') >= 280000 && vehicle.getVariable('price') < 320000) price = 4;
          else if (vehicle.getVariable('price') >= 320000 && vehicle.getVariable('price') < 380000) price = 4.4;
          else if (vehicle.getVariable('price') >= 380000 && vehicle.getVariable('price') < 500000) price = 5;
          else if (vehicle.getVariable('price') >= 500000 && vehicle.getVariable('price') < 600000) price = 5.5;
          else if (vehicle.getVariable('price') >= 600000 && vehicle.getVariable('price') < 700000) price = 6;
          else if (vehicle.getVariable('price') >= 700000 && vehicle.getVariable('price') < 800000) price = 6.5;
          else if (vehicle.getVariable('price') >= 800000) price = 7;
          
          for(let id = 0;id<9;id++){
            if (upgrade != null && upgrade[id + 100]) resprice+=((<number>enums.lscSNames[id][1])*price)*percent;
          }
          if(resprice == 0) return player.notify("~r~У вас в данном ТС нет чип тюнинга.");
          for(let id = 0;id<9;id++){
            if (upgrade != null && upgrade[id + 100]) delete upgrade[id + 100]
          }
          if(resprice > 0){
            vehicles.set(vehicle.getVariable('container'), 'upgrade', JSON.stringify(upgrade));
            user.addCashMoney(player, resprice);
            player.notify("~g~Вы получили компенсацию в размере "+resprice+"$");
            vehicles.respawn(vehicle);
          } else {
            return player.notify("~r~У вас в данном ТС нет чип тюнинга.");
          }
        }
      }
    }
})
mp.events.add("vehicleDeath", (vehicle:VehicleMp) => {
  vehicle.getOccupants().forEach(p => {
    p.health = 0;
  })
  vehicles.respawn(vehicle);
});

mp.events.add("my:gps", (player:PlayerMp) => {
  let m = menu.new(player, "Имущество");
  if(user.get(player, "id_house")){
    let item = houses.getHouseData(user.get(player, "id_house"));
    if(item){
      m.newItem({
        name: item.get('address')+" #"+item.get('id'),
        more: "Дом",
        onpress: () => {
          user.setWaypoint(player, item.get('x'), item.get('y'));
          player.notify("~g~Метка установлена")
        }
      })
    }
  }
  if(user.get(player, "stock_id")){
    let item = stock.getData(user.get(player, "stock_id"));
    if(item){
      m.newItem({
        name: item.get('address')+" #"+item.get('id'),
        more: "Склад",
        onpress: (itm) => {
          user.setWaypoint(player, item.get('x'), item.get('y'));
          player.notify("~g~Метка установлена")
        }
      })
    }
  }


  if (user.get(player, "apartment_id") > 0) {
    let buildData = apartments.getApartData(user.get(player, "apartment_id"));
    if(buildData){
      let buildId = buildData.get('build_id');
      if(typeof buildId == "number"){
        m.newItem({
          name: `Номер ${buildId} #${buildData.get('id')}`,
          more: "Апартаменты",
          onpress: (itm) => {
            user.setWaypoint(player, enums.buildListData[buildId][0], enums.buildListData[buildId][1]);
            player.notify("~g~Метка установлена")
          }
        })
      }
    }
  }

  if (user.get(player, "condo_id") > 0) {
    let hData = condo.getHouseData(user.get(player, "condo_id"));
    if(hData){
      m.newItem({
        name: hData.get('address')+" #"+hData.get('id'),
        more: "Квартира",
        onpress: (itm) => {
          user.setWaypoint(player, hData.get('x'), hData.get('y'));
          player.notify("~g~Метка установлена")
        }
      })
    }
  }


  // if(user.get(player, "condo_id")){
  //   let item = stock.getData(user.get(player, "condo_id"));
  //   if(item){
  //     m.newItem({
  //       name: item.address+" #"+item.id,
  //       more: "Квартира",
  //       onpress: (itm) => {
  //         user.setWaypoint(player, item.x, item.y);
  //         player.notify("~g~Метка установлена")
  //       }
  //     })
  //   }
  // }
  // if(user.get(player, "apartment_id")){
  //   let item = apartments.getApartData(user.get(player, "apartment_id"));
  //   if(item){
  //     m.newItem({
  //       name: item.address,
  //       more: "Склад",
  //       onpress: (itm) => {
  //         user.setWaypoint(player, item.x, item.y);
  //         player.notify("~g~Метка установлена")
  //       }
  //     })
  //   }
  // }
  


  m.open();
})

mp.events.addRemoteCounted("server:user:addJobMoney", (player, money:number) => {
  if(!player.jobmoneyfarm) player.jobmoneyfarm = 0;
  player.jobmoneyfarm+=money;
  if(customParams.jobx2) user.addCashMoney(player, money), player.jobmoneyfarm+=money;;
  user.questWorks(player)
})
mp.events.addRemoteCounted("server:show:quests", (player) => {
  if(!player.quests) return;
  if(player.quests.length == 0) return;
  user.questWorks(player)
  
  let data:{
    desc: string;
    rewards: string[];
    group: string;
    progress: string[];
    name: string;
    complete: boolean;
  }[] = []
  player.quests.map(item => {
    let datas = getQuest(item.name);
    if(!datas && typeof datas != "object") return;
    data.push({
      ...item, desc:datas.desc, rewards: datas.rewards, group: datas.group, progress: (datas.progress && !item.complete) ? datas.progress(player) : []
    })
  })
  if(data.length > 0){
    user.setGui(player, 'quests');
    mp.events.triggerBrowser(player, "cef:quest:init", data)
  }
})


mp.events.add("playerDeath", (player:PlayerMp) => {
  player.setVariable('isCrouched', false)
});

mp.events.add("toggleCrouch", (player) => {
  if (!player.getVariable('isCrouched')) {
    player.setVariable('isCrouched', true)
  } else {
    player.setVariable('isCrouched', false)
  }
});
