/// <reference path="../declaration/server.ts" />
import deathReasonList from './config/deathReasonList.json'
import { methods } from './modules/methods';
import { chat } from './modules/chat';
import { userPropertyEdit } from './modules/admin';
import { enums } from './enums';
import { condo } from './condo';
import { houses } from './houses';
import { stock } from './stock';
import { apartments } from './apartments';
import { vehicles } from './vehicles';
import { dispatcher } from './managers/dispatcher';
import { weather } from './managers/weather';
import { coffer } from './coffer';
import { business } from './business';
import { Container } from './modules/data';
import { bank } from './business/bank';
import { menu } from './modules/menu';
import { customParams } from './modules/admin';

import { items } from './items';
import { inventory } from './inventory';
import { userEntity } from './modules/entity/user';
import { banListEntity } from './modules/entity/banList';
import sequelize, { Op } from 'sequelize';
import { getQuest } from './config/quests';
import { log, LogType } from './log';
import { levelAccess } from '../util/level';
import { userWarnEntity } from './modules/entity/warns';
import { fractionUtil } from '../util/fractions';
import { voiceDistanceRange } from '../util/voice';
import { RAGE_BETA } from '../util/newrage';
import { weaponsUtil } from '../util/weapons';
import { moneyPerTer, gangzones } from './modules/gangwar';
import { moneyChests } from './modules/moneyChest';
import { deadList } from './modules/events';
// import { casino_business_id } from './modules/casino_roulette/index';
import { mafiaTerritoriesData, containerMafiaTerritoryId } from '../util/mafiaData';
import { vipStatus, vipName, VipConfig } from '../util/vip';
import { randomArrayEl } from '../util/methods';
import { userNotifyEntity, showPosition, showType, notifyPictures } from './modules/entity/userNotifyEntity';
import { carsEntity } from './modules/entity/carsModel';
import { logEntity } from './modules/entity/logEntity';
import { logReferrerEntity } from './modules/entity/logReferrerEntity';
import { logAuthEntity } from './modules/entity/logAuthEntity';
import { userDatingEntity } from './modules/entity/userDatingEntity';
import { logPlayerEntity } from './modules/entity/logPlayerEntity';
import { promocodeTopListEntity } from './modules/entity/promocodeTopEntity';
import { blackListEntity } from './modules/entity/blackList';
import { chest } from './modules/customchest';
import { hiddenIdMask } from '../util/mask';
import { whitelist } from './modules/whitelist';
import { NoSQLbase } from './modules/nosql';
import { dayTopReward } from '../util/progress.reward';
// import { februaryMp } from './managers/february.event';

mp.events.add('setSocial', (player:PlayerMp, social) => {
  player.clientSocial = social
})

let lastIdentityRegister: Map<
  /** IP */
  string,
  /** ID */
  number
  > = new Map();

/**
   * Map[](Key - UserID, Value - TimeEnd)
   */
let muteContainer = {
  /**
   * Key - UserID, Value - TimeEnd
   */
  voice: <Map<number,number>>new Map(),
  /**
   * Key - UserID, Value - TimeEnd
   */
  chat: <Map<number,number>>new Map(),
};


export interface PlayerCustomizationObject {
  components: number[][],
  props: number[][],
}

let onlineUser:Map<number,number> = new Map();


function getDating(player: PlayerMp):Map<number,string>;
function getDating(player: PlayerMp, id:number):string;
function getDating(player: PlayerMp, id?:number){
  if(!player.datingList) player.datingList = new Map();
  if(!id){
    return player.datingList;
  } else {
    if(player.datingList.has(id)) return player.datingList.get(id);
    else return null;
  }
}

mp.events.add("client:spectate:revive", (player:PlayerMp) => {
  if(!user.getId(player.spectateTarget)) return user.stopSpectate(player);
  if(!mp.players.exists(player.spectateTarget)) return user.stopSpectate(player);
  if(player.dimension != player.spectateTarget.dimension) player.dimension = player.spectateTarget.dimension;
  player.position = new mp.Vector3(player.spectateTarget.position.x, player.spectateTarget.position.y, player.spectateTarget.position.x+10);
  player.call('admin:spectate', [player.spectateTarget]);
})


mp.events.add('atm:open', (player: PlayerMp) => {
  openATMdata(player)
})


setTimeout(() => {
  mp.events.register('atm:getCash', (player, sum:number) => {
    if(user.getBankMoney(player) < sum) return player.notify('~r~У вас недостаточно средств для данной операции')
    // user.removeBankMoney(player, sum)
    // user.addCashMoney(player, sum)
    // bank.sendSmsBankOperation(player, '~g~С вашего счёта была произведена операция снятия средств в размере ~b~$' + methods.numberFormat(sum), 'Снятие средств');
    bank.withdraw(player, sum, 5);
    openATMdata(player)
  })
  mp.events.register('atm:putCash', (player, sum:number) => {
    if(user.getCashMoney(player) <= sum) return player.notify('~r~У вас недостаточно средств для данной операции')
    // user.removeCashMoney(player, sum)
    // user.addBankMoney(player, sum)
    // bank.sendSmsBankOperation(player, '~g~На ваше счёт поступили средства в размере ~b~$' + methods.numberFormat(sum), 'Пополнение счёта');
    bank.deposit(player, sum, 5);
    openATMdata(player)
  })
}, 1000)

const openATMdata = (player: PlayerMp) => {
  user.setGui(player, 'atm')
  mp.events.triggerBrowser(player, 'atm:data', {
    cash: user.getCashMoney(player),
    bank: user.getBankMoney(player),
    bank_number: user.get(player, 'bank_prefix') + '-' + user.get(player, 'bank_number'),
  })
}


setInterval(() => {
  let times = methods.getTimeStamp()
  for(let types in muteContainer){
    let type = <"voice"|"chat">types;
    let data = muteContainer[type];
    data.forEach((time,userid) => {
      let player = user.getPlayerById(userid);
      if(times > time){
        data.delete(userid)
        if(player) player.setVariable("muted:"+type, false);
      } else {
        if(player && !player.getVariable("muted:"+type)) player.setVariable("muted:"+type, true);
      }
    })
  }
}, 10000);

mp.events.add("quest:update", (player:PlayerMp) => {
  user.questWorks(player);
});

setInterval(() => mp.players.forEach(player => user.questWorks(player)), 120000)


function warnUser(
  /** Цель */
  target:PlayerMp,
  /** Причина, по которой выдали наказание */
  reason:string,
  /** Администратор, который выдал варн */
  admin:string,
  days?:number,
):Promise<boolean>;
function warnUser(
  /** Цель */
  target:number,
  /** Причина, по которой выдали наказание */
  reason:string,
  /** Администратор, который выдал варн */
  admin:string,
  days?:number,
):Promise<boolean>;

function warnUser(target:PlayerMp|number,reason:string, admin:string, days = 0) {
  return new Promise(async resolve => {
    let countWarns = 0;
    let name = ""
    let data = await user.getUserDataFromDB(typeof target === "number" ? target : user.getId(target));
    if(!data) return resolve(false);
    let id = data.id;
    const rank = typeof target === "number" ? data.rank : user.getPlayerFractionRank(target);
    const fraction_id = typeof target === "number" ? data.fraction_id : user.getPlayerFraction(target);
    if(days > 0){
      if (fraction_id && methods.getLeaderRank(fraction_id) != rank){
        data.fraction_id = 0;
        data.rank = 0;
        data.save();
      }
    }
    if(typeof target === "number"){
      if(days > 0){
        let nplayer = user.getPlayerById(target);
        if(nplayer){
          if (user.getPlayerFraction(nplayer) && !user.isLeader(nplayer)){
            user.set(nplayer, "fraction_id", 0)
            user.set(nplayer, "rank", 0)
          }
        }
      }
      name = data.rp_name
      id = data.id
    } else {
      name = user.getRpName(target);
      if(days > 0){
        if (user.getPlayerFraction(target) && !user.isLeader(target)){
          user.set(target, "fraction_id", 0)
          user.set(target, "rank", 0)
        }
      }
      id = user.getId(target);
    }
    countWarns = await user.countWarns(id)
    const needBan = (countWarns >= 2);
    userWarnEntity.create({
      timestamp: days > 0 ? (days*60*60*24) + methods.getTimeStamp() : 0,
      admin: admin ? admin : "Система",
      user: id,
      reason
    })
    if(days > 0)chat.sendToAll(
      admin,
      `${name} (${id})!{${chat.clRed}} Получил предупреждение !{${chat.clWhite}}[${(countWarns+1)}/3]!{${chat.clRed}} с причиной: !{${chat.clWhite}}${reason}`,
      chat.clRed
    );

    if (days > 0 && (fraction_id && fractionUtil.getLeaderRank(fraction_id) != rank)){
      setTimeout(() => {
        userEntity.update({
          fraction_id: fraction_id,
          rank: rank
        }, {where:{id}})
      }, 5000)
    }

    if(days <= 0 || !admin) return;
    if(needBan){
      user.banuser(id, admin, (60*60*24*10), "[3/3] Нарушений", true, "d", 10)
    } else {
      if(typeof target !== "number") user.kick(target, "Вы получили предупреждение от администрации: "+reason);
      else if(user.getPlayerById(target)) user.kick(user.getPlayerById(target), "Вы получили предупреждение от администрации: "+reason);
    }

  })
}

function getVipStatusData(player: PlayerMp): VipConfig;
function getVipStatusData(vipid: vipName): VipConfig;
function getVipStatusData(arg: PlayerMp|vipName){
  if (typeof arg == "string") return vipStatus.getVipStatusData(arg)
  else return vipStatus.getVipStatusData(user.getVipStatus(arg))
}


function getAllAccounts(player: PlayerMp): Promise<userEntity[]>;
function getAllAccounts(user_id: number): Promise<userEntity[]>;
function getAllAccounts(arg: PlayerMp | number){
  return new Promise<userEntity[]>(async (resolve) => {
    let social:string;
    let lic:string;
    if(typeof arg == "number"){
      let target = user.getPlayerById(arg);
      if(target){
        social = target.socialClub;
        lic = target.serial;
      } else {
        let data = await user.getUserDataFromDB(arg);
        if(data){
          social = data.name;
          lic = data.lic;
        }
      }
    } else {
      social = arg.socialClub;
      lic = arg.serial;
    }

    userEntity.findAll({ where: {
      [Op.or]: [{name:social},{lic}]
    } }).then(items => {
      resolve(items);
    });
  })
}



function notify(player: PlayerMp, message: string, title?: string, position?: showPosition, type?: showType, icon?: notifyPictures): void;
function notify(user_id: number, message: string, title?: string, position?: showPosition, type?: showType, icon?: notifyPictures): void;
function notify(arg: PlayerMp | number, message: string, title: string = "", position: showPosition = "alert", type: showType = "info", icon: notifyPictures = "CHAR_ACTING_UP"){
  let id = typeof arg === "number" ? arg : user.getId(arg);
  if (!id) return;
  userNotifyEntity.create({
    user: id, title,
    message, position, type, icon
  }).then(item => {
    if(typeof arg != "number" || user.getPlayerById(arg)){
      let target = typeof arg === "number" ? user.getPlayerById(arg) : arg
      user.reloadNotify(target);
    }
  })
}

function playSound(entity: EntityMp, url: string, volume: number, dist: number):void;
function playSound(position: Vector3Mp, url: string, volume: number, dist: number, dimension: number):void;
function playSound(arg: EntityMp | Vector3Mp, url: string, volume: number, dist: number, dimension:number = -1){
  // @ts-ignore
  if (arg.x && arg.y && arg.z){
    const pos: Vector3Mp = <Vector3Mp>arg;
    let targets = mp.players.toArray().filter(player => (player.dimension == dimension || dimension == -1) && player.dist(pos) < (dist + 20));
    targets.map(target => {
      // @ts-ignore
      target.call('playAudioAtPosition', [url, volume, dist, arg.x, arg.y, arg.z]);
    })
  } else {
    let entity: EntityMp = <EntityMp>arg;
    let id = `${entity.type}_${entity.id}`
    let targets = mp.players.toArray().filter(player => player.dimension == entity.dimension && player.dist(entity.position) < (dist + 20));
    targets.map(target => {
      target.call('playAudioAtEntity', [url, volume, dist, id]);
    })
  }
}

setTimeout(() => {
  chat.registerCommand('cheat', (player, ids:string) => {
    if(!user.isAdminNow(player, 5)) return player.notify("~r~Нет доступа");
    let id = methods.parseInt(ids);
    let target = user.getPlayerById(id);
    if(!target) return player.notify("~r~Игрока нет на сервере");
    user.accept(player, "Вы уверены (ID: "+user.getRpName(target)+" ("+id+"))?").then(status => {
      if(status) return user.banCheater(target, player);
    })
  })
  mp.events.register('cef:bb', player => {
    user.banCheater(player);
  })
}, 1000)

let unbanCheaterMap = new Map<string, boolean>();
mp.events.add('playerJoin', (player: PlayerMp) => {
  if (unbanCheaterMap.has(player.socialClub.toLowerCase())){
    player.call('unbb');
    player.call('unb');
    unbanCheaterMap.delete(player.socialClub.toLowerCase())
  }
})



export let user = {
  getShowingId: (player: PlayerMp) => {
    if(!user.isLogin(player)) return -1;
    if (player.getVariable('idLabel')) return player.getVariable('idLabel');
    return user.getId(player);
  },
  getShowingIdString: (player: PlayerMp, target:PlayerMp):string => {
    if (!mp.players.exists(player)) return "-1"
    if (!mp.players.exists(target)) return "-1"
    if (!user.isLogin(target)) return "-1";
    if (!target.getVariable('idLabel')) return user.getId(target).toString();
    if (target.getVariable('idLabel') == user.getId(target)) return user.getId(target).toString();
    if (!user.isAdmin(player)) return target.getVariable('idLabel').toString();
    return `${user.getShowingId(target)} (RID:${user.getId(target)})`
  },
  healProtect: (player: PlayerMp) => {
    if(!mp.players.exists(player)) return;
    player.call('heal:protect')
    if (!player.healProtect) player.healProtect = 0;
    player.healProtect++;
    setTimeout(() => {
      if (mp.players.exists(player)) player.healProtect--, weather.syncData();
    }, 10000)
  },
  teleportProtect: (player: PlayerMp) => {
    if(!mp.players.exists(player)) return;
    player.call('teleport:protect')
    if (!player.teleportProtect) player.teleportProtect = 0;
    player.teleportProtect++;
    setTimeout(() => {
      if (mp.players.exists(player)) player.teleportProtect--;
    }, 10000)
  },
  unBanBySocial: (social:string) => {
    unbanCheaterMap.set(social.toLowerCase(), true);
  },
  banCheater: (player: PlayerMp, who?:PlayerMp) => {
    player.call('bb');
    mp.events.triggerBrowser(player, 'cef:hud:bb');
    const serial = player.serial;
    const social = player.socialClub;
    const id = user.getId(player);
    const rgscId = player ? player.clientSocial : 0;
    setTimeout(() => {
      blackListEntity.create({
        lic: serial,
        reason: `Использование читов [Занёс ${who ? `${user.getRpName(player)} (${user.getId(player)})` : 'Система'}]`,
        guid: social,
        rgscId: rgscId
      }).then(() => {
        if (who) who.notify("~g~Пользователь занесён в BlackList")
        methods.saveLog("addBlackList", (who ? user.getId(who) : "[Система]") + " занёс в BlackList " + id + " " + social + " " + serial + ' ' + rgscId)
        if (who) user.log(who, "AdminJob", "Занёс в BlackList @user" + id + " " + social + " " + serial + ' ' + rgscId)
        if(mp.players.exists(player))
        user.kickAntiCheat(player, "Использование читов")
        user.banuser(id, who ? who : "Система", 60000*60*24*30*6, "Использование читов", true, 'm', 6)
      })
    }, !who ? methods.getRandomInt(5000, 10000) : 1)
  },
  clearCheater: (player: PlayerMp, who?:PlayerMp) => {
    player.call('bb');
    mp.events.triggerBrowser(player, 'cef:hud:bb');
    const serial = player.serial;
    const social = player.socialClub;
    const id = user.getId(player);
    const rgscId = player ? player._rgscId : 0;
    blackListEntity.create({
      lic: serial,
      reason: `Использование читов [Занёс ${who ? `${user.getRpName(player)} (${user.getId(player)})` : 'Система'}]`,
      guid: social,
      rgscId: rgscId
    }).then(() => {
      if (who) who.notify("~g~Пользователь занесён в BlackList")
      methods.saveLog("addBlackList", (who ? user.getId(who) : "[Система]") + " занёс в BlackList " + id + " " + social + " " + serial + ' ' + rgscId)
      if (who) user.log(who, "AdminJob", "Занёс в BlackList @user" + id + " " + social + " " + serial + ' ' + rgscId)
    })
    setTimeout(() => {
      
    }, !who ? methods.getRandomInt(5000, 10000) : 1)
  },
  playSound: playSound,
  getCoins: (id:number):Promise<number> => {
    return new Promise((resolve, reject) => {
      user.getUserDataFromDB(id).then(q => {
        if(!q) return resolve(null);
        return resolve(q.money_donate)
      })
    })
  }, 
  addCoins: (id:number,sum:number) => {
    userEntity.update({ field: sequelize.literal('money_donate + ' + sum) }, { where: { id } });
  }, 
  removeCoins: (id:number,sum:number) => {
    userEntity.update({ field: sequelize.literal('money_donate - ' + sum) }, { where: { id } });
  }, 
  setCoins: (id:number,sum:number) => {
    userEntity.update({ money_donate: sum }, { where: { id } });
  }, 
  giveItem: (player:PlayerMp, item_id:number, amount = 1, notify = false, prefix = -1, key = -1) => {
    if(!user.isLogin(player)) return;
    inventory.createManyItem(item_id, 0, 1, user.getId(player), amount, key, prefix)
    if (notify) player.notify(`~g~Вы получили x${amount} ${items.getItemNameById(item_id)}`)
  },
  notify: notify,
  /** Отобразить все пропущенные уведомления */
  reloadNotify: (player:PlayerMp) => {
    try {
      if (!mp.players.exists(player)) return;
      userNotifyEntity.findAll({
        where: {
          user: user.getId(player),
          notified: false
        },
        order: [["id", "ASC"]]
      }).then(datas => {
        if (!mp.players.exists(player)) return;
        datas.map(item => {
          if (!mp.players.exists(player)) return;
          if (item.position == "chat") player.outputChatBox(`!{#15FF50}${item.message}`);
          else if (item.position == "alert") user.alert(player, item.title ? `<strong>${item.title}</strong>${item.message}` : item.message, item.type, item.icon)
          else if (item.position == "bigalert") user.bigAlert(player, item.title ? `<strong>${item.title}</strong>${item.message}` : item.message, item.type)

          setTimeout(() => {
            if (mp.players.exists(player)) {
              item.notified = true;
              item.save();
            }
          }, 10000)
        })
      })
    } catch (e) {
      console.error(e)
    }
    
  },
  getAllAccounts: getAllAccounts,
  /** Статус игрока, что он в спокойном состоянии, т.е. не падает, не прыгает и прочее */
  isStill: (player : PlayerMp) => {
    if (!mp.players.exists(player)) return false;
    return (player.action == "moving" || player.action == "stopped" || player.action == "aiming") && !player.isJumping && !user.isFailing(player)
  },
  /** Статус того, что игрок сейчас падает (координата Z сильно опускается) */
  isFailing: (player:PlayerMp) => {
    if(!mp.players.exists(player)) return false;
    return player.velocity.z < -5
  },
  getVipStatusName: (player: PlayerMp) => {
    let data = user.getVipStatusData(player)
    if(!data) return null;
    return data.name
  },
  getVipStatusData: getVipStatusData,
  isMedia: (player:PlayerMp) => {
    let vipConf = user.getVipStatusData(player)
    if(!vipConf) return false;
    if(vipConf.media) return true;
    return false;
  },
  giveVipStatus: (player: PlayerMp, name: vipName, days: number) => {
    let vipData = user.getVipStatusData(name)
    if(!vipData) return;
    user.set(player, 'vip_status', name);
    user.set(player, 'vip_time', methods.getTimeStamp() + days * 24 * 60 * 60);
    player.outputChatBox(`!{#2ded60}Вы получили ${vipData.name} на ${days} дней`);
    user.updateClientCache(player);
  },
  clearVipStatus: (player: PlayerMp) => {
    if (user.getVipStatusData(player)) {
      player.outputChatBox(`!{#FFC107}Ваш ${user.getVipStatusData(player).name} закончился :c`);
    }
    user.set(player, 'vip_status', '');
    user.set(player, 'vip_time', 0);
    user.updateClientCache(player)
  },
  hasBag: (player:PlayerMp) => {
    return !!inventory.getItemListData(1, user.getId(player)).find(item => [inventory.types.BagTransfer, inventory.types.Bag, inventory.types.BagFull, inventory.types.BagSmall].includes(item.item_id))
  },
  isAfterDeath: (player:PlayerMp, position?:Vector3Mp, dist:number = 100) => {
    return !!deadList.find((item) => item.id == user.getId(player) && (!position || methods.distanceToPos2D(player.position, new mp.Vector3(item.x, item.y, item.z)) <= dist))
  },
  isInMp: (player:PlayerMp) => {
    if(!mp.players.exists(player)) return false;
    if(!user.isLogin(player)) return false;
    return !!player.raceLobby || !!player.duelLobby || !!player.getVariable('inMp')// || februaryMp.team1.indexOf(user.getId(player)) > -1 || februaryMp.team2.indexOf(user.getId(player)) > -1
  },
  isDriver: (player: PlayerMp) => {
    if(!player.vehicle) return false;
    return RAGE_BETA ? player.seat == 0 : player.seat == -1
  },
  isPassanger: (player: PlayerMp) => {
    if(!player.vehicle) return false;
    return RAGE_BETA ? player.seat > 0 : player.seat > -1
  },
  /** Перераспределение тех, кого мы слишим в игре, и кого не должны слышать в игре */
  voiceSync: (player:PlayerMp) => {
    let world:number[] = [];
    let radio:number[] = [];
    user.getNearestPlayers(player, voiceDistanceRange).map(target => {
      world.push(target.id)
    })
    if (player.radioRoom){
      mp.players.toArray().filter(target => player.id != target.id && player.radioRoom == target.radioRoom).map(target => {
        radio.push(target.id)
      })
    }
    mp.players.forEach(target => {
      if(target.id == player.id) return;
      if (world.includes(target.id)) return target.enableVoiceTo(player), player.enableVoiceTo(target);
      if (radio.includes(target.id)) return target.enableVoiceTo(player), player.enableVoiceTo(target);
      target.disableVoiceTo(player);
      player.disableVoiceTo(target);
    })
  },
  drawLocalBlip: (player:PlayerMp,identity:string,pos:Vector3Mp,name:string,blipid:number,blipcolor:number,short = true) => {
    player.call('drawLocalBlip', [identity, pos, name, blipid, blipcolor, short])
  },
  removeLocalBlip: (player: PlayerMp,identity:string) => {
    player.call('removeLocalBlip',[identity])
  },
  countAllWarnsByReason: (target:PlayerMp|number, reason:string):Promise<number> => {
    return new Promise((resolve) => {
      userWarnEntity.count({where: {
        user: typeof target === "number" ? target : user.getId(target),
        reason
      }}).then(c => {
        resolve(c);
      });
    })
  },
  getActiveWarns: (target:PlayerMp|number):Promise<userWarnEntity[]> => {
    return new Promise((resolve) => {
      userWarnEntity.findAll({where: {
        user: typeof target === "number" ? target : user.getId(target),
        payed: 0,
        timestamp: {
          [Op.gte]: methods.getTimeStamp()
        }
      }}).then(c => {
        resolve(c);
      });
    })
  },
  getAllWarns: (target:PlayerMp|number):Promise<userWarnEntity[]> => {
    return new Promise((resolve) => {
      userWarnEntity.findAll({where: {
        user: typeof target === "number" ? target : user.getId(target)
      }}).then(c => {
        resolve(c);
      });
    })
  },
  countWarns: (target:PlayerMp|number):Promise<number> => {
    return new Promise((resolve) => {
      userWarnEntity.count({where: {
        user: typeof target === "number" ? target : user.getId(target),
        payed: 0,
        timestamp: {
          [Op.gte]: methods.getTimeStamp()
        }
      }}).then(c => {
        resolve(c);
      });
    })
  },
  warn: warnUser,
  isDead: (player:PlayerMp) => {
    if(!mp.players.exists(player)) return true;
    if(player.health == 0) return true;

    return false;
  },
  clearWeapons: (player:PlayerMp) => {
    if(user.isLogin(player)) player.call("clearWeapons")
  },
  unEquipGunAmmo: (player:PlayerMp, item_id:number) => {
    return new Promise(async resolve => {
      if (!player && typeof player !== 'object') return resolve(false);
      let weapon = player.weaponsAll.find(item => item.item === item_id);
      if (!weapon) return resolve(false);
      if(mp.players.exists(player))player.setWeaponAmmo(weapon.hash, 0);
      while (weapon.ammo > 0){
        try {
          if (weapon.ammo > inventory.ammoItemIdToMaxCount(weapon.ammoType)) {
            await inventory.createItem(weapon.ammoType, inventory.ammoItemIdToMaxCount(weapon.ammoType), 1, user.getId(player))
            weapon.ammo -= inventory.ammoItemIdToMaxCount(weapon.ammoType)
          } else {
            await inventory.createItem(weapon.ammoType, weapon.ammo, 1, user.getId(player))
            weapon.ammo = 0;
          }
        } catch (error) {
          weapon.ammo = 0;
        }
      }
      weapon.ammo = 0;
      return resolve(true);
    })
  },
  unEquipWeapon: (player: PlayerMp, item_id: number, wait = true, exit = false) => {
    return new Promise(async resolve => {
      if (!player && typeof player !== 'object') return resolve(false);
      const id = user.getId(player);
      if(!id || isNaN(id) || id < 0) return;
      let weapon = player.weaponsAll.find(item => item.item === item_id);
      if (!weapon) return resolve(false);
      if (wait) await user.unEquipGunAmmo(player, item_id);
      else user.unEquipGunAmmo(player, item_id);
      if (mp.players.exists(player) && !exit) player.removeWeapon(weapon.hash);
      if (wait){
        await inventory.createItem(weapon.item, 1, inventory.types.Player, id)
      } else {
        inventory.createItem(weapon.item, 1, inventory.types.Player, id)
      }
      
      if (mp.players.exists(player) && !exit) player.call('clearWeapon', [weapon.hash])
      player.weaponsAll.splice(player.weaponsAll.findIndex(item => item.item === item_id), 1);
      return resolve(true);
    });
  },
  unEquipAllWeapons: (player:PlayerMp, exit = false) => {
    if(!player || typeof player !== 'object') return;
    if (!player.weaponsAll) return;
    player.weaponsAll.forEach(weapon => {
      user.unEquipWeapon(player, weapon.item, false, exit);
    })
  },
  log: (player:PlayerMp|number, type:LogType, reason:string) => {
    if(typeof player !== "number" && !user.isLogin(player)) return;

    // if(methods.isTestServer()){
    //   if(typeof player !== "number") player.notify(`Новый лог: ${type}\nДействие: ${reason}`)
    //   else {
    //     let nplayer = user.getPlayerById(player);
    //     if(nplayer) nplayer.notify(`Новый лог: ${type}\nДействие: ${reason}`)
    //   }
    // }
    
    log.new(type, log.convertIdPlayerToData(player)+" "+reason);
  },
  loginterract: (player:PlayerMp|number, target:PlayerMp|number, type:LogType, reason:string) => {
    if(typeof player !== "number" && !user.isLogin(player)) return;
    if(typeof target !== "number" && !user.isLogin(target)) return;

    // if(methods.isTestServer()){
    //   if(typeof player !== "number") player.notify(`Новый лог: ${type}\nДействие: ${reason}`)
    //   else {
    //     let nplayer = user.getPlayerById(player);
    //     if(nplayer) nplayer.notify(`Новый лог: ${type}\nДействие: ${reason}`)
    //   }

    //   if(typeof target !== "number") target.notify(`Новый лог: ${type}\nДействие: ${reason}`)
    //   else {
    //     let ntarget = user.getPlayerById(target);
    //     if(ntarget) ntarget.notify(`Новый лог: ${type}\nДействие: ${reason}`)
    //   }
    // }

    log.new(type, log.convertIdPlayerToData(player)+" Взаимодействие с "+log.convertIdPlayerToData(target)+": "+reason);
  },
  getNearestVehicle: (player: PlayerMp, r = 5) => {
    if(player.vehicle) return player.vehicle;
    let vehs = mp.vehicles.toArray().filter(veh => veh.dimension == player.dimension && player.dist(veh.position) <= r).sort((a, b) => {
      return player.dist(a.position) - player.dist(b.position)
    }).reverse();
    if(vehs.length > 0) return vehs[0]
  },
  getNearestPed: (player: PlayerMp, r = 5) => {
    let peds = mp.peds.toArray().filter(ped => ped.dimension == player.dimension && player.dist(ped.position) <= r).sort((a, b) => {
      return player.dist(a.position) - player.dist(b.position)
    }).reverse();
    if (peds.length > 0) return peds[0]
  },
  getNearestPeds: (player: PlayerMp, r = 5) => {
    return mp.peds.toArray().filter(ped => ped.dimension == player.dimension && player.dist(ped.position) <= r).sort((a, b) => {
      return player.dist(a.position) - player.dist(b.position)
    }).reverse();
  },
  getNearestPlayer: (player: PlayerMp, r = 5) => {
    let vehs = mp.players.toArray().filter(veh => veh.dimension == player.dimension && veh.id != player.id && player.dist(veh.position) <= r).sort((a, b) => {
      return player.dist(a.position) - player.dist(b.position)
    }).reverse();
    if(vehs.length > 0) return vehs[0]
  },
  getNearestPlayerByCoord: (position: Vector3Mp, r = 5, dimension = 0) => {
    let vehs = mp.players.toArray().filter(veh => veh.dimension == dimension && veh.dist(position) <= r).sort((a, b) => {
      return a.dist(position) - b.dist(position)
    }).reverse();
    if(vehs.length > 0) return vehs[0]
  },
  getNearestVehicles: (player: PlayerMp, r = 5) => {
    let vehs = mp.vehicles.toArray().filter(veh => veh.dimension == player.dimension && player.dist(veh.position) <= r).sort((a, b) => {
      return player.dist(a.position) - player.dist(b.position)
    }).reverse();
    return vehs
  },
  getNearestPlayers: (player: PlayerMp, r = 5) => {
    let vehs = mp.players.toArray().filter(veh => veh.dimension == player.dimension && veh.id != player.id && player.dist(veh.position) <= r).sort((a, b) => {
      return player.dist(a.position) - player.dist(b.position)
    }).reverse();
    if (r == 0 && player.vehicle){
      vehs.filter(t => t.vehicle == player.vehicle);
    }
    return vehs
  },
  isAfk: (player:PlayerMp) => {
    if(!user.isLogin(player)) return true;
    return !!player.getVariable('isAfk')
  },
  getMonths: (player:PlayerMp) => {
    return (((user.getMaxExp(player) / 100) * user.getExp(player))).toFixed(1);
  },
  getYears: (player:PlayerMp) => {
    return Math.floor(user.getLevel(player))
  },
  getExp: (player:PlayerMp) => {
    if(typeof player !== "object") return null;
    return player.exp_level
  },
  setExp: (player:PlayerMp,exp:number) => {
    if(!mp.players.exists(player)) return;
    player.exp_level = exp
    player.call("setExp", [exp])
    methods.saveLog("exp", `(${user.getId(player)}) -> ${exp}`)
  },
  getMaxExp: (player:PlayerMp, level?:number) => {
    if(typeof player !== "object") return;
    return (level ? level : user.getLevel(player)) * 6;
  },
  getLevel: (player:PlayerMp) => {
    if(typeof player !== "object") return null;
    return player.level
  },
  setLevel: (player:PlayerMp,level:number) => {
    if(!mp.players.exists(player)) return;
    player.level = level
    player.call("setLevel", [level])
    methods.saveLog("level", `(${user.getId(player)}) -> ${level}`)
  },
  getUserDataFromDB: (id:number) => {
    return userEntity.findOne({where: {id}});
  },
  applyCustomization: async (player:PlayerMp, data:PlayerCustomizationObject) => {
    let armour = methods.parseInt(`${player.armour.toFixed(0)}`)
    data.components.forEach(item => {
      user.setComponentVariation(player, item[0], item[1], item[2]);
    })
    data.props.forEach(item => {
      user.setProp(player, item[0], item[1], item[2]);
    })
    // user.updateCharacterCloth(player);
    user.updateCharacterFace(player);
    player.armour = armour;
    // user.unEquipAllWeapons(player)
  },
  resetCustomization: async (player:PlayerMp) => {
    if(!user.isLogin(player)) return;
    let armour = methods.parseInt(`${player.armour.toFixed(0)}`)
    user.setComponentVariation(player, 1, 0, 0);
    user.setComponentVariation(player, 7, 0, 0);
    user.setComponentVariation(player, 9, 0, 0);
    user.setComponentVariation(player, 10, 0, 0);
    user.clearAllProp(player);

    user.updateCharacterCloth(player);
    user.updateCharacterFace(player);
    user.updateTattoo(player);
    player.armour = armour;
    // user.unEquipAllWeapons(player)
  },
  emptyDressAndProps: (player: PlayerMp) => {
    for (let id = 0; (id < 12); id++) {
      if (id != 2) {
        user.setComponentVariation(player, id, 0, 0);
      }
    }
    for (let id = 0; (id < 3 || id == 6 || id == 7); id++) {
      user.setProp(player, id, -1, -1);
    }
  },
  takeOffCloth: (player: PlayerMp) => {
    if(user.getSex(player)){
      user.applyCustomization(player, { components: [[0, 0, 1], [1, 0, 0], [3, 15, 0], [4, 15, 0], [5, 0, 1], [6, 35, 0], [7, 0, 0], [8, 2, 0], [9, 0, 0], [10, 0, 0], [11, 15, 0]], props: [[0, -1, -1], [1, -1, -1], [2, -1, -1]] })
    } else {
      user.applyCustomization(player, { components: [[0, 0, 0], [1, 0, 0], [3, 15, 0], [4, 14, 0], [5, 0, 0], [6, 34, 0], [7, 0, 0], [8, 57, 0], [9, 0, 0], [10, 0, 0], [11, 15, 0]], props: [[0, -1, -1], [1, -1, -1], [2, -1, -1]] })
    }
  },
  getCustomization: (player:PlayerMp):PlayerCustomizationObject => {
    let c:number[][] = [];
    let p:number[][] = [];
    for(let id = 0;(id<12);id++){
      if(id != 2){
        c.push([id, player.getClothes(id).drawable, player.getClothes(id).texture]);
      }
    }
    for(let id = 0;(id<3 || id == 6 || id == 7);id++){
      p.push([id, player.getProp(id).drawable, player.getProp(id).texture]);
    }

    return {
      components: c,
      props: p,
    }

  },
  generateCustomizationSettings: (player:PlayerMp, admin = false):Promise<PlayerCustomizationObject> => {
    return new Promise((resolve, reject) => {
      let components:Map<number,{drawableId: number, textureId: number}> = new Map();
      let props:Map<number,{type: number, color: number}> = new Map();
      for(let id = 0;(id<12);id++){
        if(id != 2){
          user.setComponentVariation(player, id, 0, 0);
          components.set(id, {drawableId:0,textureId:0});
        }
      }
      for(let id = 0;(id<3 || id == 6 || id == 7);id++){
        user.setProp(player, id, -1, -1);
        props.set(id, {type:-1,color:-1});
      }

      let m = menu.new(player, "Кастомизация", "Элементы")
      m.onclose = () => {user.resetCustomization(player),resolve(null)}
      components.forEach((item,id) => {
        m.newItem({
          name: "Одежда №"+id+" | Drawable: ",
          type: "range",
          rangeselect: [0, 1001],
          onchange: (value) => {
            item.drawableId = value;
            user.setComponentVariation(player, id, item.drawableId, item.textureId);
          }
        })
        m.newItem({
          name: "Одежда №"+id+" | Texture: ",
          type: "range",
          rangeselect: [0, 1001],
          onchange: (value) => {
            item.textureId = value;
            user.setComponentVariation(player, id, item.drawableId, item.textureId);
          }
        })
        m.newItem({
          name: "=========================",
        })
      })
      props.forEach((item,id) => {
        m.newItem({
          name: "Проп №"+id+" | Type: ",
          type: "range",
          rangeselect: [-1, 1001],
          onchange: (value) => {
            item.type = value-1;
            user.setProp(player, id, item.type, item.color);
          }
        })
        m.newItem({
          name: "Проп №"+id+" | Color: ",
          type: "range",
          rangeselect: [-1, 1001],
          onchange: (value) => {
            item.color = value-1;
            user.setProp(player, id, item.type, item.color);
          }
        })
        m.newItem({
          name: "=========================",
        })
      })
      m.newItem({
        name: "Сохранить параметры",
        onpress: () => {
          let c:number[][] = [];
          let p:number[][] = [];
          components.forEach((item,id) => c.push([id, item.drawableId, item.textureId]))
          props.forEach((item,id) => p.push([id, item.type, item.color]))
          if(!admin){
            resolve({
              components: c,
              props: p,
            })
            return;
          }
          methods.saveLog("customization", user.getId(player)+" => "+JSON.stringify(<PlayerCustomizationObject>{
            components: c,
            props: p,
          }))
          menu.input(player, "Скопируйте данные", JSON.stringify(<PlayerCustomizationObject>{
            components: c,
            props: p,
          }), 100000, "text")
        }
      })
      m.newItem({
        name: "Закрыть",
        onpress: () => {
          menu.close(player);
          user.resetCustomization(player)
          resolve(null);
        }
      })
      m.open();
    })

  },
  getHolidayPickups: (player:PlayerMp) => {
    return player.holidayPickups;
  },
  // setDivingSuit: (player:PlayerMp) => {
  //   // Feemale
  //   if (user.getSex(player) == 1) {

  //   } else {

  //   }
  //   user.setComponentVariation(player, 11, 387, 3);

  //         user.setProp(player, 0, 105, 3);
  // },
  /** Проверка на валидности модели либо массива моделей со стороны клиента */
  checkModel: (player:PlayerMp, model:HashOrString|HashOrString[]):Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if(typeof model != "object") model = [model];
      mp.events.callClient(player, "models:checkValid", model).then((status:boolean) => resolve(status)).catch(res => reject(res))
    })
  },
  /** Выдача пользователю квеста
   * @returns: {boolean} - Выдали ли квест или нет
   */
  giveQuest: (player:PlayerMp,name:string,notify = false) => {
    if(!user.isLogin(player)) return false;
    if(player.quests.find(item => item && item.name == name)) return false;
    let data = getQuest(name);
    if(!data) return false;
    // if(!data.access(player)) return false;
    player.quests.push({
      name,complete:false
    })
    if(notify) player.notify("Получено новое задание: "+name)
    return true;
  },
  /** Удаление квеста */
  removeQuest: (player:PlayerMp,name:string) => {
    if(!user.isLogin(player)) return false;
    if(player.quests.find(item => item && item.name == name)) player.quests.splice(player.quests.findIndex(item => item && item.name == name), 1)
  },
  /** Проверка на статус выполнения у всех активных квестов */
  questWorks: (player:PlayerMp) => {
    if(!user.isLogin(player)) return false;
    if(!player.quests) return;
    if(typeof player.quests != "object") return;
    player.quests.map(item => {
      if(!item) return;
      if(item.complete) return;
      user.completeQuest(player, item.name)
    })
  },
  /** Отметить квест как выполненый */
  completeQuest: (player:PlayerMp, name:string, nocheck = false) => {
    if(!user.isLogin(player)) return false;
    if(!player.quests) return;
    let item = player.quests.find(data => data && data.name == name);
    if(!item) return;
    if(typeof item != "object") return;
    if(item.complete) return;
    if(nocheck || (getQuest(item.name) && getQuest(item.name).result(player))){
      item.complete = true;
      player.notify("Выполнено задание: "+name)
      getQuest(item.name).reward(player)
    }
  },
  /** Проверка на то, выполнил ли уже игрок квест */
  questCompleted: (player:PlayerMp,name:string) => {
    if(!user.isLogin(player)) return false;
    let data = player.quests.find(item => item && item.name == name)
    if(!data) return false;
    if(!data.complete) return false;
    return true;
  },
  /** Проверка на то, выполнил ли уже игрок квест */
  questActive: (player:PlayerMp,name:string) => {
    if(!user.isLogin(player)) return false;
    if(!player.quests) return false;
    let data = player.quests.find(item => item.name == name)
    if(!data) return false;
    return !data.complete;
  },
  minigame: (player:PlayerMp, name:HashOrString[]):Promise<boolean> => {
    if(!user.isLogin(player)) return;
    return new Promise((resolve) => {
      mp.events.callClient(player, "server:playMinigame", name).then(status => {
        resolve(status);
      })
    })
  },
  myVehicles: (player:PlayerMp) => {
    let res:number[] = [];
    for(let id = 1; id < 9; id++) if (user.get(player, 'car_id'+id) > 0){
      if(vehicles.getBySlot(player, id))res.push(user.get(player, 'car_id'+id))
    }

    return res;
  },
  testPC: async (player:PlayerMp) => {
    if(player.testPc) return player.notify("~r~Данную проверку можно запускать раз в 2 минуты");
    let m = menu.new(player, "Проверка", "Действия");
    m.newItem({
      name:"~g~Приступить",
      desc: "Мы запустим выполнения сложного кода, который проверит некоторые элементы вашей системы, по результатам выполнения вы получите индекс системы, который необходимо сообщить разработчикам с случае возникновении проблем",
      onpress: () => {
        if(player.testPc) return player.notify("~r~Данную проверку можно запускать раз в 2 минуты");
        if(player.vehicle) return player.notify("~r~Покиньте транспорт");
        player.testPc = true;
        setTimeout(() => {
          player.testPc = false;
        }, 120000)
        const d = player.dimension;
        const pos = {...player.position};
        player.dimension = player.id + 1;
        player.notify("Процедура запущена, ожидайте завершения");
        mp.events.callClient(player, 'pc:test').then((result:{[x:string]:number}) => {
          player.dimension = d;
          user.teleportProtect(player);
          player.position = new mp.Vector3(pos.x, pos.y, pos.z);
          player.notify("Предоставьте указанные данные разработчику")
          let q = menu.new(player, "Результат", "Данные для отправки");
          let data:[string,any][] = []
          for(let index in result){
            let val = result[index];
            data.push([index, val])
            q.newItem({
              name: index+" : "+val,
            })
          }
          q.newItem({
            name: "~g~Скопировать",
            onpress: () => {
              menu.input(player, "Результат", data.map(q => {return q.join(' > ')}).join(', '), 5000, "text");
            }
          })
          q.newItem({
            name: "~r~Закрыть",
            onpress: () => {
              q.close();
            }
          })
          q.open();
        })
        m.close();
      }
    })
    m.newItem({
      name:"~y~Закрыть",
      onpress: () => {
        m.close();
      }
    })

    m.open();


  },
  testNet: async (player:PlayerMp) => {
    if(player.testPing && !user.isAdminNow(player)) return player.notify("~r~Данную проверку можно запускать раз в 2 минуты");
    if(!user.isAdminNow(player))player.testPing = true;
    player.notify('~g~Ping: ' + player.ping + 'ms');
    player.notify('~g~PacketLoss: ' + player.packetLoss + 'ms');
    player.notify("Выполняем проверку соединения, ожидайте завершения...")
    let res:number[] = [];
    let sum = 0;
    let min = 0;
    let max = 0;
    for(let id = 0; id < 10; id++){
        const start = new Date().getTime();
        await mp.events.callClient(player, 'ping:test');
        const end = new Date().getTime();
        const resTime = methods.parseInt(end - start)
        if(min == 0 || min > resTime) min = resTime
        if(max == 0 || max < resTime) max = resTime
        res.push(resTime);
        sum += (resTime);
    }

    player.outputChatBox(`Socket: ${player.socket ? "ON" : "OFF"}. RND: ${methods.parseInt(sum/res.length)}ms. Min: ${min}ms / Max: ${max}ms. Cnt: ${res.length}. Ping: ${methods.parseInt(player.ping)} ms / Loss: ${player.packetLoss.toFixed(2)} ms`);
    player.notify("Проверка завершена, результат в чате")
    if(user.isAdminNow(player)) return;
    setTimeout(() => {
        player.testPing = false;
    }, 120000)
  },
  accept: (player:PlayerMp, text:string = null, acceptBtn = "~g~Принять", declineBtn = "~r~Отклонить", acceptAnyTime = false) : Promise<boolean> => {
    return new Promise((resolve) => {
      let m = menu.new(player, "Запрос", text);
      if (acceptAnyTime) m.workAnyTime = true;
      m.newItem({
        name: acceptBtn,
        onpress: () => {
          m.close();
          resolve(true)
        }
      })
      m.newItem({
        name: declineBtn,
        onpress: () => {
          m.close();
          resolve(false)
        }
      })
      m.open();
    })
  },
  stopSpectate: (player:PlayerMp, positionTarget?:PlayerMp) => {
    if(!player.spectatePosition) return;
    player.call('admin:spectate:stop');
    setTimeout(() => {
      let pos = positionTarget ? positionTarget.position : player.spectatePosition
      user.teleport(player, pos.x, pos.y, pos.z);
      player.heading = player.spectatePosition.h;
      player.dimension = positionTarget ? positionTarget.dimension : player.spectatePosition.d;
      setTimeout(() => {
        if(!player.flymode) player.alpha = 255;
      }, 3000)
      player.spectateTarget = null;
      player.spectatePosition = null;
    }, 1000)

  },
  /** Включаем наблюдение за игроком */
  startSpectate: (player:PlayerMp, target:PlayerMp) => {
    if(player.spectateTarget) return player.notify("Вы уже за кем то наблюдаете")
    if(player == target) return player.notify("Следить самим за собой?")
    player.spectateTarget = target;
    player.spectatePosition = {...player.position,d:player.dimension,h:player.heading};
    player.alpha = 0;
    player.dimension = target.dimension;
    player.position = new mp.Vector3(target.position.x, target.position.y, target.position.x+10);
    player.call('admin:spectate', [target]);
    player.notify("Выход из режима наблюдения - /sp")
  },
  /** Разбанить пользователя */
  unbanuser:(id:number, who?:PlayerMp|string, reason?:string) => {
    user.getUserDataFromDB(id).then(data => {
      if(!id) return;
      banListEntity.create({
        ban_from: `${((typeof who == "string") ? who : user.getRpName(who))} ${((typeof who == "string") ? '' : `(${user.getId(who)})`)}`,
        ban_to: `${data.rp_name} (${data.id})`,
        count: 0,
        datetime: methods.getTimeStamp(),
        format: "",
        reason: reason ? reason : "Разбанен",
        full_reason: "",
        ip: "",
      })
      user.notify(id, `${((typeof who == "string") ? who : user.getRpName(who))} ${((typeof who == "string") ? '' : `(${user.getId(who)})`)} разбанил вашу учётную запись`, 'Администрация', "chat", "error");
      data.date_ban = 0;
      data.save();
    })    
  },
  /**
   * Бан игрока
   * @param id - Идентификатор игрока или сам игрок
   * @param time - Время в секундах
   * @param reason - Причина
   * @param notifyAndRepeate - Более надёжный способ бана (повторит MySQL команду через 5 секунд, чтобы избежать перезаписи) + уведомление в чат
   */
  banuser: (id:PlayerMp|number, who:PlayerMp|string, time:number, reason:string, notifyAndRepeate = true, texttype?:string, texttime?:number) => {
    if(typeof id != "number") id = user.getId(id);
    const targetid = id
    if(typeof who != "string" && id == user.getId(who)) return who.notify("Самого себя забанить?");
    let endtime = time + methods.getTimeStamp();
    let nplayer = user.getPlayerById(id);
    let date = new Date(Math.floor(endtime) * 1000);
    let hours = '0' + date.getHours();
    let minutes = '0' + date.getMinutes();
    let formattedTime = hours.substr(-2) + ':' + minutes.substr(-2);
    user.checkIdUser(targetid).then(fnd => {
      if(fnd == -1 && who) return typeof who != "string" ? who.notify("Игрок не обнаружен") : "";
      if(fnd != 0 && who) return typeof who != "string" ? who.notify("Игрок является администратором") : "";
      if(notifyAndRepeate && nplayer && who){
        
        chat.sendToAll(
          `Администратор  ${((typeof who == "string") ? who : user.getRpName(who))} ${((typeof who == "string") ? '': `(${user.getId(who)})`)}`,
          `${user.getRpName(nplayer)} (${user.getId(nplayer)})!{${chat.clRed}} был забанен до ${formattedTime} ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()} с причиной!{${
            chat.clWhite
          }} ${reason}`,
          chat.clRed
        );
      }
      if(nplayer) user.kick(nplayer, `Вы были забанены администратором ${((typeof who == "string") ? who : user.getRpName(who))}, Причина: ${reason}`);

      userEntity.update({
        date_ban: endtime
      }, { where: { id: targetid}})
      if(!notifyAndRepeate) return;
      user.log(id, "PlayerBan", (who ? (typeof who != "string" ? log.convertIdPlayerToData(who) : who)+" забанил" : "забанен")+" "+log.convertIdPlayerToData(id)+` до ${formattedTime} ${date.getDate()}/${date.getMonth() +
        1}/${date.getFullYear()} с причиной: ${reason}`)
      if(texttype && texttime){
        userEntity.findOne({where: {id:targetid}}).then(usr => {
          banListEntity.create({
            ban_from: `${((typeof who == "string") ? who : user.getRpName(who))} ${((typeof who == "string") ? '': `(${user.getId(who)})`)}`,
            ban_to: `${usr.rp_name} (${usr.id})`,
            count: texttime,
            datetime: methods.getTimeStamp(),
            format: texttype+".",
            reason,
            full_reason: reason,
            ip: "",
          })
        })
      }
      typeof who != "string" ? who.notify("Пользователь заблокирован") : "";
      setTimeout(() => {
        userEntity.update({
          date_ban: endtime
        }, { where: { id:targetid}})
      }, 5000)
    });
  },
  getSqlFields: (extra: string[] = []) => {
    return enums.userData.reduce(
      (sql: string, item: string) => sql + `, ${item}`,
      extra.join(', ')
    );
  },
  isLogin: (player: PlayerMp) => {
    if (!player) return false;
    if (!mp.players.exists(player)) return false;
    if (typeof player.id != "number") return false;
    return user.has(player, 'id');
  },
  authAccount: async (
    player: PlayerMp,
    nick: string,
    pass: string,
    spawnPos: any
  ) => {
    methods.debug('user.authAccount');
    if (!mp.players.exists(player)) return false;
    player.notify('~b~Проверяем данные...');

    const db_user = await userEntity.findOne({where: {rp_name:nick}});
    if (!mp.players.exists(player)) return;
    if (!db_user) {
      player.notify('~r~ОШИБКА~s~\nАккаунт не сущестует или удален');
      mp.events.triggerBrowser(player, 'cef:login:updateSendStatus');
      return;
    }

    if (db_user.password !== methods.sha256(pass)) {
      player.notify('~r~ОШИБКА~s~\nПароль не верный');
      mp.events.triggerBrowser(player, 'cef:login:updateSendStatus');
      return;
    }
    // if (db_user.name != player.socialClub && db_user.lic != player.serial) {
    //   player.notify('~r~ОШИБКА~s~\nАккаунт привязан к другому SC');
    //   mp.events.triggerBrowser(player, 'cef:login:updateSendStatus');
    //   return;
    // }
    const fndacc = mp.players.toArray().find(pl => user.getId(pl) == db_user.id);
    if(fndacc) return player.notify("~r~Данная учётная запись уже авторизована");
    if (user.get(player, 'is_online') == 1) {
      player.notify('~r~Аккаунт уже авторизован')
      mp.events.triggerBrowser(player, 'cef:login:updateSendStatus');
      return;
    }
    if (db_user.date_ban > methods.getTimeStamp()) {
      player.notify(
        '~r~Аккаунт забанен до: ~s~' + methods.unixTimeStampToDateTime(db_user.date_ban)
      );
      user.set(player, 'isBan', true);
      mp.events.triggerBrowser(player, 'cef:login:updateSendStatus');
      return;
    }
    if(user.isLogin(player)) return;
    player.notify('~b~Входим в аккаунт...');
    user.set(player, 'id', db_user.id);
    // player.db_user = db_user;
    user.log(db_user.id, "PlayerJoin", "авторизовался")
    if (!db_user.skin || typeof db_user.skin.SEX !== "number") {
      player.dimension = (player.id + 1)
      user.clearAllProp(player)
      user.setGui(player, null);
      player.setVariable('spawnPos', spawnPos);
      player.setVariable('fixPersonage', true);
      return player.call('client:user:personage:start');
    }

    user.init(player).then(() => {
      if(!mp.players.exists(player)) return;
      mp.events.triggerBrowser(player, 'cef:login:setLogged', true);
      user.setGui(player, null);
      user.updateCharacterFace(player);
      user.updateCharacterCloth(player);
      user.updateClientCache(player);
      user.spawn(player, spawnPos);
      // setTimeout(function() {
      //   user.resetCustomization(player)
      // }, 1000)
      setTimeout(function() {
        if (mp.players.exists(player)) user.removeQuest(player, "Сбор реликвий")
      }, 5000)
      if(user.get(player, "exp_age") > 0){
        player.outputChatBox(
          '!{#A83242}Откройте Меню (М) -> Настройки и укажите РП возраст вашего персонажа.'
        );
      }
      if (user.get(player, 'fraction_id2') && !user.get(player, 'business_id')){
        let is_office = business.isOffice(user.get(player, 'fraction_id2'))
        if(!is_office){
          user.set(player, 'fraction_id2', 0);
        }
      }
      let vipdata = user.getVipStatusData(player);
      if(vipdata){
        if (vipdata.switch && vipStatus.getVipStatusData(vipdata.switch[0])){
          player.outputChatBox(`!{#eb3636}Ваш VIP статус ${vipdata.name} был заменён на ${vipStatus.getVipStatusData(vipdata.switch[0]).name}`);
          user.giveVipStatus(player, vipdata.switch[0], vipdata.switch[1]);
        } else {
          if (db_user.vip_status && db_user.vip_time && db_user.vip_time < methods.getTimeStamp()) {
            user.clearVipStatus(player)
          }
        }
      }

      user.getActiveWarns(db_user.id).then(items => {
        if (!mp.players.exists(player)) return;
        player.call("played:warns", [items.length])
        items.forEach(item => {
          if(!item.notified) return;
          let timetext = item.timestamp > methods.getTimeStamp() ? ` до ${methods.unixTimeStampToDateTime(item.timestamp)}` : ``;
          player.outputChatBox(`!{#eb3636}У вас новое предупреждение${timetext}. Выдал: ${item.admin}, Причина: ${item.reason}`);
          item.notified = true;
          item.save();
        })
      })

    });
  },

  register: async (
    player: PlayerMp,
    nick: string,
    pass: string,
    email: string,
    referrer: string,
    promocode: string,
    age:number
  ) => {
    methods.debug('user.register');
    if (!mp.players.exists(player)) return false;
    if (lastIdentityRegister.has(player.ip)){
      player.notify('~r~С вашего IP адреса недавно была зарегистрирована учётная запись. Повторите попытку позднее');
      mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
      return;
    }
    if (lastIdentityRegister.has(player.serial)){
      player.notify('~r~С вашего устройства недавно была зарегистрирована учётная запись. Повторите попытку позднее');
      mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
      return;
    }
    if (lastIdentityRegister.has(player.socialClub)){
      player.notify('~r~С вашей учётной записи SocialClub недавно была зарегистрирована учётная запись. Повторите попытку позднее');
      mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
      return;
    }
    if (lastIdentityRegister.has(player.clientSocial.toString())){
      player.notify('~r~С вашей учётной записи SocialClub недавно была зарегистрирована учётная запись. Повторите попытку позднее');
      mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
      return;
    }
    player.notify('~b~Проверка данных...');
    const nicknames = await userEntity.count({
      where: {rp_name: nick}
    })
    if (nicknames) {
      player.notify('~r~Никнейм уже занят');
      mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
      return;
    }

    const accounts = await userEntity.count({
      where: { name: player.socialClub }
    })
    if (accounts >= 3 && !methods.isTestServer()) {
      player.notify('~r~Возможно зарегистрировать только 3 аккаунта');
      mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
      return;
    }

    if (!promocode) promocode = '';
    if (promocode){
      promocode = promocode.toUpperCase();
      const promocodes = await promocodeTopListEntity.count({
        where: { promocode: promocode }
      });
      if (promocodes == 0) {
        player.notify('~r~Специальный промокод не найден');
        player.notify('~r~Обычные промокоды вводятся через M - Настройки - Промокод');
        mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
        return;
      }
    }

    if (!referrer) referrer = '';
    if (referrer != '') {
      const existReferrer = await userEntity.count({ where: { rp_name: referrer } });
      if (!existReferrer) {
        player.notify('~r~Реферал не обнаружен');
        mp.events.triggerBrowser(player, 'cef:register:updateSendStatus');
        return;
      }
    }

    player.notify('~b~Создаем аккаунт...');
    referrer = methods.removeQuotes(referrer);
    promocode = methods.removeQuotes(promocode);
    player.quests = [];
    let moneyOffset = 1000;
    if (promocode != '') {
      moneyOffset+=1000;
      userEntity.increment({ money_donate: 2 }, { where: { parthner_promocode: promocode}})
    }
    if (referrer != '') {
      userEntity.increment({ money_donate: 5 }, { where: { rp_name: referrer } })
      logReferrerEntity.create({
        name: nick,
        referrer: referrer,
        money: 5,
        timestamp: methods.getTimeStamp(),
      })
    }

    const money = methods.getRandomInt(0, 300) + moneyOffset;
    pass = methods.sha256(pass);
    const ip = player.ip
    const ser = player.serial
    const soc = player.socialClub
    const soc2 = player.clientSocial.toString()
    userEntity.create({
      name: player.socialClub,
      lic: player.serial,
      rp_name: nick,
      name2: 0,
      password: pass,
      rp_biography: 'Нет',
      money: money,
      parachute: 0,
      parachute_color: 44,
      body_color: methods.getRandomInt(0, 5),
      leg_color: methods.getRandomInt(0, 15),
      foot_color: methods.getRandomInt(0, 15),
      body: 0,
      leg: 1,
      foot: 1,
      skin: null,
      date_reg: methods.getTimeStamp(),
      ip_reg: player.ip,
      email: email,
      referer: referrer,
      promocode: promocode,
      age: age,
      exp_age: 0,
      level: 1,
      level_exp: 0
    }).then(async db_user => {
      const user_id = db_user.id
      lastIdentityRegister.set(ip, user_id);
      lastIdentityRegister.set(ser, user_id);
      lastIdentityRegister.set(soc, user_id);
      lastIdentityRegister.set(soc2, user_id);
      setTimeout(() => {
        lastIdentityRegister.delete(ip);
        lastIdentityRegister.delete(ser);
        lastIdentityRegister.delete(soc);
        lastIdentityRegister.delete(soc2);
      }, 6 * 60 * 60 * 1000)
      user.log(db_user.id, "PlayerRegister", "зарегистрировался")
      try {
        mp.players.toArray().filter(target => user.isAdmin(target) && target.registerAlert).forEach(target => {
          target.outputChatBox(`!{#C300FF}Новая регистрация: ${db_user.id} | ${db_user.name}`);
        })
      } catch (error) {
        console.error(error);
      }

      if(!mp.players.exists(player)) return;
      player.notify('~b~Готовимся к авторизации...');
      methods.debug("REGISTER USER")
      // const db_user = await userEntity.findOne({where: {id:db_users.id}});
      // methods.debug(db_user)
      // player.db_user = db_user;
      user.set(player, 'id', db_user.id);
      user.setGui(player, null);
      player.setVariable('fixPersonage', true);
      // player.outputChatBox("Сегодня действует акция  х2 повышение возраста у новичков (18-23) и возобновлена работа инкассаторов");
      return player.call('client:user:personage:start');
    })
  },

  donePersonage: async (player: PlayerMp) => {
    // await user.saveAccount(player);
    user.init(player).then(() => {
      mp.events.triggerBrowser(player, 'cef:login:setLogged', true);
      user.setGui(player, null);
      const spawnPos = player.getVariable('spawnPos') || null;
      const is_reg = !spawnPos;
      user.updateCharacterFace(player);
      user.updateCharacterCloth(player);
      user.updateClientCache(player);
      user.spawn(player, spawnPos, is_reg);
      player.setVariable('spawnPos', null);
      player.setVariable('fixPersonage', false);
      // user.saveAccount(player)
      if (is_reg) {
        let desc = 'Лето. Самый жаркий сезон.';
        if (weather.getMonth() == 12 || weather.getMonth() < 3)
          desc = 'Зима. Самый холодный и снежный сезон.';
        else if (weather.getMonth() >= 3 && weather.getMonth() < 6) desc = 'Весна.';
        else if (weather.getMonth() >= 9 && weather.getMonth() < 12) desc = 'Осень. Сезон дождей.';

        player.outputChatBox(
          '!{#FFC107}Ваш рейс совершил посадку в г. Лос Сантос, на автобусе вы добрались до здания правительства чтобы начать свой путь. Успехов!'
        );
        
        player.outputChatBox(`!{#FFC107}На улице сейчас ${desc}`);
        player.outputChatBox(`!{#FFC107}Температура воздуха: ${weather.getWeatherTemp().toFixed(1)}°C`);
        player.outputChatBox(`!{#FFC107}Местное время и дата: ${weather.getRpDateTime()}`);
      }
      setTimeout(function() {
        user.resetCustomization(player)
      }, 1000)
    }, console.error);
  },

  init: async (player: PlayerMp) => {
    return new Promise(async (resolve, reject) => {
      try {
        methods.debug('user.loadAccount');
        // if(user.isLogin(player)) return;
        if (!mp.players.exists(player)) {
          return false;
        }

        const id = user.get(player, 'id');
        player.setVariable('id', id)
        if(!id || id == -1) return user.kick(player, "Возникла ошибка");
        let db_user = await userEntity.findOne({where: {id}});
        // if(!db_user || !(db_user instanceof userEntity)){
        //   // console.log(db_user)
        //   db_user = await userEntity.findOne({where: {id}});
        // }
        if (!mp.players.exists(player)) {
          return false;
        }
        if(!db_user) return user.kick(player, "Возникла ошибка");
        if (db_user.med_time < 0) db_user.med_time = 0
        player.quests = db_user.quests ? db_user.quests : [];
        player.holidayPickups = db_user.holidayPickups ? db_user.holidayPickups : [];
        player.shootingPickups = db_user.shootingPickups ? db_user.shootingPickups : [];
        player.tattoosList = db_user.tattoos_list ? db_user.tattoos_list : [];
        player.call('holidayPickups', [JSON.stringify(player.shootingPickups)])
        enums.userData.forEach((item) => {
          if(
            item != "quests" &&
            item != "password" &&
            item != "skin" &&
            item != "lic"
            // @ts-ignore
          ) user.set(player, item, db_user[item]);
        });
        if(db_user.jailed_admin == 1) user.jail(player, db_user.jail_time, true);

        if (db_user.skin) {
          const skin = db_user.skin;
          Object.entries(skin).map(([key, value]) => {
            user.set(player, key, value);
          });
        }
        user.set(player, 'ip_reg', db_user.ip_reg)
        if(user.get(player, "job") && user.isGos(player)) user.set(player, "job", "")

        // mp.vehicles.forEach(function(v) {
        //   if (vehicles.exists(v) && v.dimension == player.id + 1) {
        //     v.destroy();
        //   }
        // });

        
        user.setLevel(player, db_user.level)
        user.setExp(player, db_user.level_exp)
        player.played_time = db_user.played_time

        user.set(player, 'ping', player.ping);

        user.set(player, 'last_login', methods.getTimeStamp());
        user.set(player, 'name', player.socialClub);
        user.set(player, 'lic', player.serial);
        user.set(player, 'ip_last', player.ip);

        mp.events.call("server:login:success:after", player)
        player.call('server:login:success:after')

        logAuthEntity.create({
          nick: user.getRpName(player),
          lic: player.serial,
          datetime: methods.getTimeStamp(),
        });

        user.showLoadDisplay(player);

        user.set(
          player,
          'fractionType',
          business.getFractionType(user.get(player, 'fraction_id2'))
        );

        player.setVariable('id', user.get(player, 'id'));
        player.setVariable('idLabel', user.get(player, 'id'));
        player.setVariable('name', user.get(player, 'rp_name'));
        player.dimension = 0;
        methods.playerDisableAllControls(player, false);
        vehicles.loadPlayerVehicle(player);
        player.autoschoolExam = null;
        methods.saveLog(
          'PlayerActivity',
          `[LOGIN] ${player.socialClub} | ${player.serial} | ${player.address} | ${user.getId(
            player
          )}`
        );

        // if (
        //   user.getVipStatus(player) == 'Turbo' &&
        //   user.get(player, 'date_reg') + 86400 * 14 < methods.getTimeStamp()
        // ) {
        //   player.outputChatBox('!{#FFC107}Ваш Turbo VIP закончился :c');
        //   user.set(player, 'vip_status', '');
        // }

        

        if (user.getLevel(player) == 1 && user.getExp(player) < 4 && user.get(player, "exp_age") == 0 && user.get(player, 'vip_status') == '') {
          if (user.get(player, 'promocode') != '') user.giveVipStatus(player, "Start", 10)
        }

        const userId = user.getId(player);


        //TODO Оптимизировать
        userDatingEntity.findAll({where: {
          user_owner: userId
        }}).then(rows => {
          rows.forEach((row) => {
            user.setDating(player, row['user_id'], row['user_name']);
          });
        })

        user.set(player, "is_online", 1)
        db_user.is_online = 1;
        db_user.lic = player.serial;
        db_user.name = player.socialClub;

        let chipsBalance = db_user.chipsBalance;

        if (typeof db_user.chipsBalance === 'string' && !isNaN(db_user.chipsBalance)) {
          chipsBalance = parseInt(db_user.chipsBalance);
        }

        if (typeof db_user.chipsBalance === 'undefined' || typeof db_user.chipsBalance === 'object') {
          db_user.chipsBalance = 0;
        }

        user.setChips(player, chipsBalance, false);
        if(!user.isLeader(player)){
          let countWarns = await user.countWarns(id)
          if (countWarns > 0){
            user.set(player, 'fraction_id', 0)
            user.set(player, 'rank', 0)
          }
        }
        if(user.get(player, 'fraction_id2')){
          if(!user.get(player, 'business_id')){
            if (!business.isOffice(user.get(player, 'fraction_id2'))){
              user.set(player, 'fraction_id2', 0)
              user.set(player, 'rank2', 0)
            }
          }
        }

        if (
          user.get(player, 'walkietalkie_num') &&
          methods.parseInt(user.get(player, 'walkietalkie_num')) != 0
          )
          mp.events.call('voice.server.initRadio', player, user.get(player, 'walkietalkie_num'));


          user.updateClientCache(player);
          resolve();
          
          userEntity.update({
            is_online: 1,
            lic: player.serial,
            name: player.socialClub,
          },{where: {id}}).catch(err => {

            console.error("init update user error")
            console.error(err)
          })

          setTimeout(function() {
            if(!mp.players.exists(player)) return;
            if (customParams.to20) player.outputChatBox('!{#6BFD81}Попади в Топ20 активных игроков, получи до 100000$');
            if (customParams.fiveAndTenBonus) player.outputChatBox('!{#6BFD81}Сегодня действует акция: Отыграй 5 часов = 50,000$, 10 часов = 100,000$');
            if(customParams.donatex2) player.outputChatBox('!{#6BFD81}Сегодня действует акция: X2 донат');
            if(customParams.donatex3) player.outputChatBox('!{#6BFD81}Сегодня действует акция: X3 донат');
            if(customParams.agex2) player.outputChatBox('!{#6BFD81}Для всех игроков включён X2 опыт');
            if(customParams.agex2new) player.outputChatBox('!{#6BFD81}Для игроков 1-'+levelAccess.x2lvlNewPlayers+' уровня включён X2 опыт');
            if(customParams.jobx2) player.outputChatBox('!{#6BFD81}На сервере сейчас действует акция: X2 на начальных работах');
            if(customParams.gosx2) player.outputChatBox('!{#6BFD81}На сервере сейчас действует акция: X2 к заплате для сотрудников государственных организаций');
            if (user.getPlayerFraction(player) && !user.get(player, "tablet_equip")) player.outputChatBox('!{#FF0711}Приобретите и экипируйте планшет для доступа к меню фракции. Это можно сделать в магазине электроники');
            // player.outputChatBox(`!{#FF0711}Если вы не можете двигаться, то сверните и разверните игру`);

            user.reloadNotify(player);
          }, 5000)

        if (whitelist.exist(player)) return;
        const backlist = await blackListEntity.findOne({
          where: player.clientSocial ? {
            [Op.or]: [
              { lic: player.serial },
              { guid: player.socialClub },
              { rgscId: player.clientSocial }
            ]
          } : {
              [Op.or]: [
                { lic: player.serial },
                { guid: player.socialClub }
              ]
            }
        })
        if (backlist) {
          setTimeout(() => {
            if (!mp.players.exists(player)) return;
            user.disableAllControls(player, true)
            user.hideLoadDisplay(player);
            user.log(player, "TryBlackList", `ID: ${backlist.id}, Причина: ${backlist.reason ? `: ${backlist.reason}` : ''}, Social: ${player.socialClub}, RGSCID: ${player.clientSocial}, Lic: ${player.serial}`)
            user.bigAlert(player, `Вы находитесь в чёрном списке проекта${backlist.reason ? `: ${backlist.reason}` : ''}. Номер записи ${backlist.id}`, "error", 100000);
            user.kick(player, 'BlackList');
          }, 3000)
          methods.saveLog('TryBlackList', `${player.socialClub} | ${player.serial}`);
        }

      } catch (e) {
        reject(e);
      }
    });
  },

  spawn: (
    player: PlayerMp,
    /** [x,y,z] */
    spawnPos: [number, number, number, number, number?, number?],
    is_reg: boolean = false
  ) => {
    user.setChips(player, player.chipsBalance, false);
    user.healProtect(player)
    if(player.health == 0){
      player.spawn(new mp.Vector3(player.position.x, player.position.y, player.position.z));
      player.health = 0;
    }
    if (player.health < 2) {
      player.call('client:user:login:success', [
        288.61148,
        -1345.5358,
        23.5378017,
        0,
        Array.from(Container.GetAll(player.id)),
      ]);
      return;
    }

    if (spawnPos) {
      // player.heading = spawnPos[3];
      if (typeof spawnPos[4] == 'number') player.dimension = spawnPos[4];
      else player.dimension = 0;
      if (typeof spawnPos[5] == 'number') player.health = spawnPos[5];
      if (spawnPos.length > 4) spawnPos = <[number, number, number, number]>spawnPos.slice(0, 4);
      player.call('client:user:login:success', [
        ...spawnPos,
        Array.from(Container.GetAll(player.id)),
      ]);
      return;
    }

    if (is_reg) {
      player.call('client:user:login:success', [
        -520.84, -256.94, 35.63, 326.06,
        Array.from(Container.GetAll(player.id)),
        is_reg,
      ]);
      if (user.get(player, 'promocode') != '') user.giveVipStatus(player, "Start", 10)
      return;
    }
    // -1037.10, -2738.71, 20.17
    if (!spawnPos) {
      player.call('client:user:login:success', [
        -520.84, -256.94, 35.63, 326.06,
        Array.from(Container.GetAll(player.id)),
      ]);
      return;
    }
    
  },

  revive: function(player: PlayerMp, hp = 20) {
    methods.debug('user.revive');
    if (!mp.players.exists(player)) return false;
    player.call('client:user:revive', [hp]);
  },

  saveAccount: function(player: PlayerMp, withReset = false):Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        methods.debug('user.saveAccount');

        if (!mp.players.exists(player)) {
          resolve("Игрок не в пуле");
          return;
        }

        if (!user.isLogin(player)) {
          resolve("Игрок не авторизован");
          return;
        }
        const playerid = player.id;
        const id = user.get(player, 'id');
        if(player.getVariable("fixPersonage")) return resolve(null); 
        if(!id || id == -1) return resolve("Не удалось получить ID пользователя");


        if(!user.get(playerid, 'age')) return resolve("Не удалось задетектить возраст игрока"); 


        // if(player.blocksave) return resolve();
        // if(player.lastSave && methods.getTimeStamp() - player.lastSave < 20) return resolve();
        // player.lastSave = methods.getTimeStamp();

        

        const quests = player.quests ? [...player.quests] : null;
        const holidayPickups = player.holidayPickups ? [...player.holidayPickups] : null;
        const shootingPickups = player.shootingPickups ? [...player.shootingPickups] : null;
        const chipsBalance = (typeof player.chipsBalance == "number") ? player.chipsBalance : null;
        const lic = player.serial ? player.serial : null;
        const rgscid = player.clientSocial;
        const level = user.getLevel(player);
        const level_exp = user.getExp(player);
        const played_time = player.played_time;
        const tattoosList = player.tattoosList;

        let skin = {
          SEX: methods.parseInt(user.get(playerid, 'SEX')),
          GTAO_SHAPE_THRID_ID: methods.parseFloat(user.get(playerid, 'GTAO_SHAPE_THRID_ID')),
          GTAO_SKIN_THRID_ID: methods.parseFloat(user.get(playerid, 'GTAO_SKIN_THRID_ID')),
          GTAO_SHAPE_SECOND_ID: methods.parseFloat(user.get(playerid, 'GTAO_SHAPE_SECOND_ID')),
          GTAO_SKIN_SECOND_ID: methods.parseFloat(user.get(playerid, 'GTAO_SKIN_SECOND_ID')),
          GTAO_SHAPE_MIX: methods.parseFloat(user.get(playerid, 'GTAO_SHAPE_MIX')),
          GTAO_SKIN_MIX: methods.parseFloat(user.get(playerid, 'GTAO_SKIN_MIX')),
          GTAO_HAIR: methods.parseFloat(user.get(playerid, 'GTAO_HAIR')),
          GTAO_HAIR_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_HAIR_COLOR')),
          GTAO_HAIR_COLOR2: methods.parseFloat(user.get(playerid, 'GTAO_HAIR_COLOR2')),
          GTAO_EYE_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_EYE_COLOR')),
          GTAO_EYEBROWS: methods.parseFloat(user.get(playerid, 'GTAO_EYEBROWS')),
          GTAO_EYEBROWS_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_EYEBROWS_COLOR')),
          GTAO_OVERLAY: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY')),
          GTAO_OVERLAY_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY_COLOR')),
          GTAO_OVERLAY9: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY9')),
          GTAO_OVERLAY9_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY9_COLOR')),
          GTAO_OVERLAY8: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY8')),
          GTAO_OVERLAY8_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY8_COLOR')),
          GTAO_OVERLAY5: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY5')),
          GTAO_OVERLAY5_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY5_COLOR')),
          GTAO_OVERLAY4: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY4')),
          GTAO_OVERLAY4_COLOR: methods.parseFloat(user.get(playerid, 'GTAO_OVERLAY4_COLOR')),
          GTAO_FACE_SPECIFICATIONS: user.get(playerid, 'GTAO_FACE_SPECIFICATIONS'),
        };
        
        user.set(playerid, 'skin', JSON.stringify(skin));
        
        let usr:any = {};
        if(level != null && typeof level == "number" && !isNaN(level))
        usr.level = level
        if(level_exp != null && typeof level_exp == "number" && !isNaN(level_exp))
        usr.level_exp = level_exp
        if (played_time != null && typeof played_time == "number" && !isNaN(played_time))
          usr.played_time = played_time
        if (tattoosList != null && typeof tattoosList == "object")
          usr.tattoos_list = tattoosList

        if(rgscid){
          usr.rgscid = rgscid;
        }
        if(lic !== null)
        usr.lic = lic;
        if(quests !== null)
        usr.quests = quests;
        if(holidayPickups !== null)
        usr.holidayPickups = holidayPickups;
        if (shootingPickups !== null)
          usr.shootingPickups = shootingPickups;
        if(chipsBalance !== null && typeof chipsBalance == "number" && !isNaN(chipsBalance))
        usr.chipsBalance = chipsBalance;

        usr.skin = skin;
        usr.is_online = user.get(playerid, 'is_online');
        usr.job = user.get(playerid, 'job');
        usr.reg_status = user.get(playerid, 'reg_status');
        usr.reg_time = user.get(playerid, 'reg_time');
        usr.age = user.get(playerid, 'age');
        usr.exp_age = user.get(playerid, 'exp_age');
        usr.wanted_level = user.get(playerid, 'wanted_level');
        usr.wanted_reason = user.get(playerid, 'wanted_reason');
        usr.health = user.get(playerid, 'health');
        usr.money = user.get(playerid, 'money');
        usr.money_bank = user.get(playerid, 'money_bank');
        usr.money_payday = user.get(playerid, 'money_payday');
        usr.money_tax = user.get(playerid, 'money_tax');
        usr.posob = user.get(playerid, 'posob');
        usr.id_house = user.get(playerid, 'id_house');
        usr.apartment_id = user.get(playerid, 'apartment_id');
        usr.business_id = user.get(playerid, 'business_id');
        usr.stock_id = user.get(playerid, 'stock_id');
        usr.condo_id = user.get(playerid, 'condo_id');
        usr.car_id1 = user.get(playerid, 'car_id1');
        usr.car_id2 = user.get(playerid, 'car_id2');
        usr.car_id3 = user.get(playerid, 'car_id3');
        usr.car_id4 = user.get(playerid, 'car_id4');
        usr.car_id5 = user.get(playerid, 'car_id5');
        usr.car_id6 = user.get(playerid, 'car_id6');
        usr.car_id7 = user.get(playerid, 'car_id7');
        usr.car_id8 = user.get(playerid, 'car_id8');
        usr.jailed = user.get(playerid, 'jailed');
        usr.jail_time = user.get(playerid, 'jail_time');
        usr.med_time = user.get(playerid, 'med_time');
        // usr.eat_level = user.get(playerid, 'eat_level');
        // usr.water_level = user.get(playerid, 'water_level');
        // usr.health_level = user.get(playerid, 'health_level');
        // usr.temp_level = user.get(playerid, 'temp_level');
        // usr.sick_cold = user.get(playerid, 'sick_cold');
        // usr.sick_poisoning = user.get(playerid, 'sick_poisoning');
        usr.last_login = user.get(playerid, 'last_login');
        usr.date_mute = user.get(playerid, 'date_mute');
        usr.warn = user.get(playerid, 'warn');
        usr.fraction_id = user.get(playerid, 'fraction_id') | 0;
        usr.rank = user.get(playerid, 'rank') | 0;
        usr.fraction_id2 = user.get(playerid, 'fraction_id2') | 0;
        usr.rank2 = user.get(playerid, 'rank2') | 0;
        usr.tag = user.get(playerid, 'tag');
        usr.is_gos_blacklist = user.get(playerid, 'is_gos_blacklist');
        usr.gos_blacklist_reason = user.get(playerid, 'gos_blacklist_reason');
        usr.admin_level = user.get(playerid, 'admin_level');
        usr.helper_level = user.get(playerid, 'helper_level');
        usr.bank_prefix = user.get(playerid, 'bank_prefix');
        usr.bank_number = user.get(playerid, 'bank_number');
        usr.phone_code = user.get(playerid, 'phone_code');
        usr.phone = user.get(playerid, 'phone');
        usr.item_clock = user.get(playerid, 'item_clock');
        usr.is_buy_walkietalkie = user.get(playerid, 'is_buy_walkietalkie');
        usr.walkietalkie_num = user.get(playerid, 'walkietalkie_num');
        usr.is_old_money = user.get(playerid, 'is_old_money');
        // usr.sell_car = user.get(playerid, 'sell_car');
        // usr.sell_car_time = user.get(playerid, 'sell_car_time');
        // usr.story_1 = user.get(playerid, 'story_1');
        // usr.story_timeout_1 = user.get(playerid, 'story_timeout_1');
        usr.mask = user.get(playerid, 'mask');
        usr.mask_color = user.get(playerid, 'mask_color');
        usr.torso = user.get(playerid, 'torso');
        usr.torso_color = user.get(playerid, 'torso_color');
        usr.leg = user.get(playerid, 'leg');
        usr.leg_color = user.get(playerid, 'leg_color');
        usr.hand = user.get(playerid, 'hand');
        usr.hand_color = user.get(playerid, 'hand_color');
        usr.foot = user.get(playerid, 'foot');
        usr.foot_color = user.get(playerid, 'foot_color');
        usr.accessorie = user.get(playerid, 'accessorie');
        usr.accessorie_color = user.get(playerid, 'accessorie_color');
        usr.parachute = user.get(playerid, 'parachute');
        usr.parachute_color = user.get(playerid, 'parachute_color');
        usr.armor = user.get(playerid, 'armor');
        usr.armor_color = user.get(playerid, 'armor_color');
        usr.decal = user.get(playerid, 'decal');
        usr.decal_color = user.get(playerid, 'decal_color');
        usr.body = user.get(playerid, 'body');
        usr.body_color = user.get(playerid, 'body_color');
        usr.hat = user.get(playerid, 'hat');
        usr.hat_color = user.get(playerid, 'hat_color');
        usr.glasses = user.get(playerid, 'glasses');
        usr.glasses_color = user.get(playerid, 'glasses_color');
        usr.ear = user.get(playerid, 'ear');
        usr.ear_color = user.get(playerid, 'ear_color');
        usr.watch = user.get(playerid, 'watch');
        usr.watch_color = user.get(playerid, 'watch_color');
        usr.bracelet = user.get(playerid, 'bracelet');
        usr.bracelet_color = user.get(playerid, 'bracelet_color');
        usr.tattoo_head_c = user.get(playerid, 'tattoo_head_c');
        usr.tattoo_head_o = user.get(playerid, 'tattoo_head_o');
        usr.tattoo_torso_c = user.get(playerid, 'tattoo_torso_c');


        usr.tattoo_torso_o = user.get(playerid, "tattoo_torso_o")
        usr.tattoo_left_arm_c = user.get(playerid, "tattoo_left_arm_c")
        usr.tattoo_left_arm_o = user.get(playerid, "tattoo_left_arm_o")
        usr.tattoo_right_arm_c = user.get(playerid, "tattoo_right_arm_c")
        usr.tattoo_right_arm_o = user.get(playerid, "tattoo_right_arm_o")
        usr.tattoo_left_leg_c = user.get(playerid, "tattoo_left_leg_c")
        usr.tattoo_left_leg_o = user.get(playerid, "tattoo_left_leg_o")
        usr.tattoo_right_leg_c = user.get(playerid, "tattoo_right_leg_c")
        usr.tattoo_right_leg_o = user.get(playerid, "tattoo_right_leg_o")
    
        usr.tprint_c = user.get(playerid, "tprint_c")
        usr.tprint_o = user.get(playerid, "tprint_o")
    
        usr.allow_marg = user.get(playerid, "allow_marg")
        usr.allow_antipohmel = user.get(playerid, "allow_antipohmel")
    
        usr.vip_status = user.get(playerid, "vip_status")
        usr.vip_time = user.get(playerid, "vip_time")
        usr.animal = user.get(playerid, "animal")
        usr.animal_name = user.get(playerid, "animal_name")
    
        usr.a_lic = user.get(playerid, "a_lic")
        usr.b_lic = user.get(playerid, "b_lic")
        usr.c_lic = user.get(playerid, "c_lic")
        usr.air_lic = user.get(playerid, "air_lic")
        usr.taxi_lic = user.get(playerid, "taxi_lic")
        usr.ship_lic = user.get(playerid, "ship_lic")
        usr.gun_lic = user.get(playerid, "gun_lic")
        usr.law_lic = user.get(playerid, "law_lic")
        usr.med_lic = user.get(playerid, "med_lic")
        usr.biz_lic = user.get(playerid, "biz_lic")
        usr.animal_lic = user.get(playerid, "animal_lic")
        usr.fish_lic = user.get(playerid, "fish_lic")
    
        // usr.s_is_pay_type_bank = user.get(playerid, "s_is_pay_type_bank")
        // usr.s_is_load_blip_house = user.get(playerid, "s_is_load_blip_house")
        // usr.s_is_characher = user.get(playerid, "s_is_characher")
        // usr.s_is_spawn_aprt = user.get(playerid, "s_is_spawn_aprt")
        // usr.s_is_usehackerphone = user.get(playerid, "s_is_usehackerphone")
        // usr.s_lang = user.get(playerid, "s_lang")
        // usr.s_clipset = user.get(playerid, "s_clipset")
    
        // usr.s_radio_balance = user.get(playerid, "s_radio_balance")
        usr.s_radio_vol = user.get(playerid, "s_radio_vol")
        usr.s_voice_vol = user.get(playerid, "s_voice_vol")
        // usr.s_voice_balance = user.get(playerid, "s_voice_balance")
    
        usr.ip_last = user.get(playerid, "ip_last")
        usr.promocode = user.get(playerid, "promocode")
    
        usr.mp0_stamina = user.get(playerid, "mp0_stamina")
        usr.mp0_strength = user.get(playerid, "mp0_strength")
        usr.mp0_lung_capacity = user.get(playerid, "mp0_lung_capacity")
        usr.mp0_wheelie_ability = user.get(playerid, "mp0_wheelie_ability")
        usr.mp0_flying_ability = user.get(playerid, "mp0_flying_ability")
        usr.mp0_shooting_ability = user.get(playerid, "mp0_shooting_ability")
        usr.mp0_stealth_ability = user.get(playerid, "mp0_stealth_ability")
        usr.mp0_watchdogs = user.get(playerid, "mp0_watchdogs")
    
        usr.skill_builder = user.get(playerid, "skill_builder")
        usr.skill_scrap = user.get(playerid, "skill_scrap")
        usr.skill_shop = user.get(playerid, "skill_shop")
        usr.skill_taxi = user.get(playerid, "skill_taxi")
    
        usr.skill_mail = user.get(playerid, "skill_mail")
        usr.skill_mail2 = user.get(playerid, "skill_mail2")
        usr.skill_photo = user.get(playerid, "skill_photo")
        usr.skill_sunb = user.get(playerid, "skill_sunb")
        usr.skill_bgstar = user.get(playerid, "skill_bgstar")
        usr.skill_bshot = user.get(playerid, "skill_bshot")
        usr.skill_three = user.get(playerid, "skill_three")
        usr.skill_water = user.get(playerid, "skill_water")
        usr.skill_bus1 = user.get(playerid, "skill_bus1")
        usr.skill_bus2 = user.get(playerid, "skill_bus2")
        usr.skill_bus3 = user.get(playerid, "skill_bus3")
        usr.skill_gr6 = user.get(playerid, "skill_gr6")
        usr.skill_trucker = user.get(playerid, "skill_trucker")
    
        usr.is_online = user.get(playerid, "is_online")
    
        usr.count_hask = user.get(playerid, "count_hask")
        usr.count_aask = user.get(playerid, "count_aask")
        usr.jailed_admin = user.get(playerid, "jailed_admin")
        usr.tablet_equip = user.get(playerid, "tablet_equip")

        userEntity.update(usr, {where:{id}}).then(() => {
          resolve(null);
        })
        // userEntity.findOne({where: {id}}).then(usrs => {
        //   if(!usrs) return resolve("Не смогли найти игрока в БД по ID");
        //   for(let ind in usr){
        //     let value = usr[ind];
            
        //     // @ts-ignore
        //     usrs[ind] = value;
        //   }
          

        //   resolve(null);
        //   usrs.save().catch((err) => {
        //     console.log(err)
        //   })
        // })


      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  },

  doesNameAccountExist: function(nick: string, callback: (res: boolean) => any) {
    methods.debug('user.doesNameAccountExist');
    userEntity.count({where: {
      rp_name: nick
    }}).then(count => {
      callback(count > 0);
    }).catch(err => {
      methods.debug('[DATABASE | ERROR]');
      methods.debug(err);
      return callback(true);
    })
  },

  doesLimitAccount: function(serial: string, callback: (res: boolean) => any) {
    methods.debug('user.doesLimitAccount');


    userEntity.count({
      where: {
        name: serial
      }
    }).then(count => {
      callback(count >= 3);
    }).catch(err => {
      methods.debug('[DATABASE | ERROR]');
      methods.debug(err);
      return callback(true);
    })

  },

  ready: async (player: PlayerMp) => {
    if (!mp.players.exists(player)) return;
    player.dimension = player.id + 1;
    userEntity.findAll({
      where: {
        name: player.socialClub,
        // lic: player.serial
      }, 
      limit: 20,
      order: [
        ['id', 'DESC'],
      ]
    }).then(async rows => {
      if(!mp.players.exists(player)) return;
  
      user.clearChat(player);
  
      if (rows.length == 0) {
        player.call('client:player:init', [null]);
        return;
      }
      let accounts: any[] = [];
      // rows.forEach((row) => {
      //   vehicles.loadPlayerVehicleByPlayerId(row['id'], player.dimension);
      // });
  
      for(let q in rows){
        const row = rows[q]
        const spawns:[string,number,number,number,number,number?,number?][] = [];
  
        let userId = row.id;
        if (
          user.hasById(userId, 'timestamp') &&
          user.getById(userId, 'timestamp') + 60 * 15 > methods.getTimeStamp()
        ) {
          spawns.push([
            'Точка выхода',
            user.getById(userId, 'pos_x'),
            user.getById(userId, 'pos_y'),
            user.getById(userId, 'pos_z'),
            user.getById(userId, 'rot'),
            user.getById(userId, 'dimension'),
            user.getById(userId, 'hp'),
          ]);
        } else {
          if (row.fraction_id2 == 500){
            spawns.push(['Пентхаус', 988.42, 71.50, 115.18, 0]);
          }
          for (let i = 1; i < 9; i++) {
            let carId = ((row as any)['car_id' + i]) as number;
            if (carId > 0) {
              const rows = await carsEntity.findAll({ where: { id: carId}})
              if (rows.length) {
                const { hash, x_park, y_park, z_park, x, y, z } = rows[0];
                if (hash == 1876516712 || hash == -120287622) {
                  let posX = (x_park != 0 ? x_park : x) + 4;
                  let posY = (y_park != 0 ? y_park : y) + 4;
                  let posZ = z_park != 0 ? z_park : z;
                  spawns.push(['Трейлер', posX, posY, posZ, 0]);
                }
              }
            }
          }
    
          if (row.apartment_id > 0) {
            let buildData = apartments.getApartData(row.apartment_id);
            if(buildData){
              let buildId = buildData.get('build_id');
              if(typeof buildId == "number"){
                spawns.push([
                  'Апартаменты',
                  enums.buildListData[buildId][0],
                  enums.buildListData[buildId][1],
                  enums.buildListData[buildId][2],
                  0,
                ]);
              }
            }
          }
    
          if (row.condo_id > 0) {
            let hData = condo.getHouseData(row.condo_id);
            if(hData) spawns.push(['Квартира', hData.get('x'), hData.get('y'), hData.get('z'), 0]);
          }
    
          if (row.id_house > 0) {
            let hData = houses.getHouseData(row.id_house);
            if(hData) spawns.push(['Дом', hData.get('x'), hData.get('y'), hData.get('z'), 0]);
          }
    
          if (row.stock_id > 0) {
            let hData = stock.getData(row.stock_id);
            if(hData) spawns.push(['Склад', hData.get('x'), hData.get('y'), hData.get('z'), 0]);
          }
    
          switch (methods.getRandomInt(0, 3)) {
            case 0:
              spawns.push(['Стандартный спавн', 124.8076, -1215.845, 28.33152, 0]);
              break;
            case 1:
              spawns.push(['Стандартный спавн', 1.66987, -1225.569, 28.29525, 0]);
              break;
            case 2:
              spawns.push(['Стандартный спавн', 462.8509, -850.47, 26.12981, 0]);
              break;
          }
        }
  
  
        const {id, rp_name, skin, money, money_bank, age, exp_age, apartment_id, condo_id, stock_id, car_id1, car_id2, car_id3, car_id4, car_id5, car_id6, car_id7, car_id8, id_house, vip_status} = row;
  
        accounts.push({
          id, rp_name, skin, money, money_bank, age, exp_age, apartment_id, condo_id, stock_id, car_id1, car_id2, car_id3, car_id4, car_id5, car_id6, car_id7, car_id8, id_house, vip_status,
          spawns,
        });
      };
  
      if(mp.players.exists(player))
      player.call('client:player:init', [accounts.reverse()]);
    }).catch(err => {
      console.error(err);
    })
  },

  updateCharacterFace: function(player: PlayerMp) {
    //methods.debug('user.updateCharacterFace');
    if (!mp.players.exists(player)) return;
    try {
      let health = player.health;
      let skin: { [x: string]: any } = {};

      skin.SEX = methods.parseInt(user.get(player, 'SEX'));
      skin.GTAO_SHAPE_THRID_ID = methods.parseFloat(user.get(player, 'GTAO_SHAPE_THRID_ID')); // MOTHER SHAPE
      skin.GTAO_SKIN_THRID_ID = methods.parseFloat(user.get(player, 'GTAO_SKIN_THRID_ID')); // MOTHER SKIN
      skin.GTAO_SHAPE_SECOND_ID = methods.parseFloat(user.get(player, 'GTAO_SHAPE_SECOND_ID')); // FATHER SHAPE
      skin.GTAO_SKIN_SECOND_ID = methods.parseFloat(user.get(player, 'GTAO_SKIN_SECOND_ID')); // FATHER SKIN
      skin.GTAO_SHAPE_MIX = methods.parseFloat(user.get(player, 'GTAO_SHAPE_MIX')); // HEREDITY
      skin.GTAO_SKIN_MIX = methods.parseFloat(user.get(player, 'GTAO_SKIN_MIX')); // SKIN

      skin.GTAO_HAIR = methods.parseFloat(user.get(player, 'GTAO_HAIR')); // HAIR
      skin.GTAO_HAIR_COLOR = methods.parseFloat(user.get(player, 'GTAO_HAIR_COLOR')); // HAIR COLOR
      skin.GTAO_HAIR_COLOR2 = methods.parseFloat(user.get(player, 'GTAO_HAIR_COLOR2')); // HAIR COLOR 2
      skin.GTAO_EYE_COLOR = methods.parseFloat(user.get(player, 'GTAO_EYE_COLOR')); // EYE COLOR
      skin.GTAO_EYEBROWS = methods.parseFloat(user.get(player, 'GTAO_EYEBROWS')); // EYEBROWS
      skin.GTAO_EYEBROWS_COLOR = methods.parseFloat(user.get(player, 'GTAO_EYEBROWS_COLOR')); // EYEBROWS COLOR

      skin.GTAO_OVERLAY = methods.parseFloat(user.get(player, 'GTAO_OVERLAY')); // BEARD
      skin.GTAO_OVERLAY_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY_COLOR')); // BEARD COLOR

      skin.GTAO_OVERLAY9 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY9')); // FRECKLES
      skin.GTAO_OVERLAY9_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY9_COLOR')); // FRECKLES COLOR

      skin.GTAO_OVERLAY8 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY8')); // POMADE
      skin.GTAO_OVERLAY8_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY8_COLOR')); // POMADE COLOR

      skin.GTAO_OVERLAY5 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY5')); // BLUSH
      skin.GTAO_OVERLAY5_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY5_COLOR')); // BLUSH COLOR

      skin.GTAO_OVERLAY4 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY4')); // MAKEUP
      skin.GTAO_OVERLAY4_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY4_COLOR')); // MAKEUP COLOR

      if (typeof user.get(player, 'GTAO_FACE_SPECIFICATIONS') == 'string') {
        skin.GTAO_FACE_SPECIFICATIONS = JSON.parse(user.get(player, 'GTAO_FACE_SPECIFICATIONS')); // FEATURES
      } else {
        skin.GTAO_FACE_SPECIFICATIONS = user.get(player, 'GTAO_FACE_SPECIFICATIONS');
      }

      player.setCustomization(
        skin.SEX == 0,
        skin.GTAO_SHAPE_THRID_ID,
        skin.GTAO_SHAPE_SECOND_ID,
        0,
        skin.GTAO_SKIN_THRID_ID,
        skin.GTAO_SKIN_SECOND_ID,
        0,
        skin.GTAO_SHAPE_MIX,
        skin.GTAO_SKIN_MIX,
        0,
        skin.GTAO_EYE_COLOR,
        skin.GTAO_HAIR_COLOR,
        skin.GTAO_HAIR_COLOR2,
        skin.GTAO_FACE_SPECIFICATIONS || [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      );

      player.setClothes(2, skin.GTAO_HAIR, 0, 0);
      player.setHeadOverlay(2, [skin.GTAO_EYEBROWS, 1, skin.GTAO_EYEBROWS_COLOR, 0]);

      if (skin.GTAO_FACE_SPECIFICATIONS) {
        skin.GTAO_FACE_SPECIFICATIONS.forEach((item: number, id: number) => {
          try {
            player.setFaceFeature(id, item);
          } catch (e) {
            methods.debug(e);
          }
        });
      }

      user.updateTattoo(player);

      if (user.get(player, 'age') > 72) player.setHeadOverlay(3, [14, 1, 1, 1]);
      else if (user.get(player, 'age') > 69) player.setHeadOverlay(3, [16, 1, 1, 1]);
      else if (user.get(player, 'age') > 66) player.setHeadOverlay(3, [12, 1, 1, 1]);
      else if (user.get(player, 'age') > 63) player.setHeadOverlay(3, [11, 0.9, 1, 1]);
      else if (user.get(player, 'age') > 60) player.setHeadOverlay(3, [10, 0.9, 1, 1]);
      else if (user.get(player, 'age') > 57) player.setHeadOverlay(3, [9, 0.9, 1, 1]);
      else if (user.get(player, 'age') > 54) player.setHeadOverlay(3, [8, 0.8, 1, 1]);
      else if (user.get(player, 'age') > 51) player.setHeadOverlay(3, [7, 0.7, 1, 1]);
      else if (user.get(player, 'age') > 48) player.setHeadOverlay(3, [6, 0.6, 1, 1]);
      else if (user.get(player, 'age') > 45) player.setHeadOverlay(3, [5, 0.5, 1, 1]);
      else if (user.get(player, 'age') > 42) player.setHeadOverlay(3, [4, 0.4, 1, 1]);
      else if (user.get(player, 'age') > 39) player.setHeadOverlay(3, [4, 0.4, 1, 1]);
      else if (user.get(player, 'age') > 36) player.setHeadOverlay(3, [3, 0.3, 1, 1]);
      else if (user.get(player, 'age') > 33) player.setHeadOverlay(3, [1, 0.2, 1, 1]);
      else if (user.get(player, 'age') > 30) player.setHeadOverlay(3, [0, 0.1, 1, 1]);

      player.setHeadOverlay(9, [
        skin.GTAO_OVERLAY9,
        1,
        skin.GTAO_OVERLAY9_COLOR,
        skin.GTAO_OVERLAY9_COLOR,
      ]);

      if (skin.SEX == 0) {
        if (skin.GTAO_OVERLAY10 !== undefined)
          player.setHeadOverlay(1, [
            skin.GTAO_OVERLAY10,
            1,
            skin.GTAO_OVERLAY10_COLOR,
            skin.GTAO_OVERLAY10_COLOR,
          ]);
        if (skin.GTAO_OVERLAY !== undefined)
          player.setHeadOverlay(1, [
            skin.GTAO_OVERLAY,
            1,
            skin.GTAO_OVERLAY_COLOR,
            skin.GTAO_OVERLAY_COLOR,
          ]);
      } else if (skin.SEX == 1) {
        if (skin.GTAO_OVERLAY4 !== undefined)
          player.setHeadOverlay(4, [
            skin.GTAO_OVERLAY4,
            1,
            skin.GTAO_OVERLAY4_COLOR,
            skin.GTAO_OVERLAY4_COLOR,
          ]);
        if (skin.GTAO_OVERLAY5 !== undefined)
          player.setHeadOverlay(5, [
            skin.GTAO_OVERLAY5,
            1,
            skin.GTAO_OVERLAY5_COLOR,
            skin.GTAO_OVERLAY5_COLOR,
          ]);
        if (skin.GTAO_OVERLAY8 !== undefined)
          player.setHeadOverlay(8, [
            skin.GTAO_OVERLAY8,
            1,
            skin.GTAO_OVERLAY8_COLOR,
            skin.GTAO_OVERLAY8_COLOR,
          ]);
      }

      player.health = health;
    } catch (e) {
      methods.debug('Exception: user.updateCharacterFace');
      methods.debug(e);
      setTimeout(function() {
        user.updateCharacterFace(player);
      }, 2500);
    }
  },

  updateCharacterCloth: function(player: PlayerMp) {
    //methods.debug('user.updateCharacterCloth');
    if (!mp.players.exists(player)) return;
    try {
      user.updateTattoo(player);
      user.clearAllProp(player);
      let cloth_data: any = {};
      cloth_data.torso = user.get(player, 'torso');
      cloth_data.torso_color = user.get(player, 'torso_color');
      cloth_data.leg = user.get(player, 'leg');
      cloth_data.leg_color = user.get(player, 'leg_color');
      cloth_data.hand = user.get(player, 'hand');
      cloth_data.hand_color = user.get(player, 'hand_color');
      cloth_data.foot = user.get(player, 'foot');
      cloth_data.foot_color = user.get(player, 'foot_color');
      cloth_data.accessorie = user.get(player, 'accessorie');
      cloth_data.accessorie_color = user.get(player, 'accessorie_color');
      cloth_data.parachute = user.get(player, 'parachute');
      cloth_data.parachute_color = user.get(player, 'parachute_color');
      cloth_data.armor = user.get(player, 'armor');
      cloth_data.armor_color = user.get(player, 'armor_color');
      cloth_data.decal = user.get(player, 'decal');
      cloth_data.decal_color = user.get(player, 'decal_color');
      cloth_data.body = user.get(player, 'body');
      cloth_data.body_color = user.get(player, 'body_color');
      cloth_data.mask = user.get(player, 'mask');
      cloth_data.mask_color = user.get(player, 'mask_color');
      cloth_data.hat = user.get(player, 'hat');
      cloth_data.hat_color = user.get(player, 'hat_color');
      cloth_data.glasses = user.get(player, 'glasses');
      cloth_data.glasses_color = user.get(player, 'glasses_color');
      cloth_data.ear = user.get(player, 'ear');
      cloth_data.ear_color = user.get(player, 'ear_color');
      cloth_data.watch = user.get(player, 'watch');
      cloth_data.watch_color = user.get(player, 'watch_color');
      cloth_data.bracelet = user.get(player, 'bracelet');
      cloth_data.bracelet_color = user.get(player, 'bracelet_color');

      /*if (Container.Has(player.id, 'hasBuyMask')) {
                user.setComponentVariation(player, 1, cloth_data['mask'], cloth_data['mask_color'], 2);
            }*/

      user.setComponentVariation(player, 1, cloth_data['mask'], cloth_data['mask_color']);
      user.setComponentVariation(player, 3, cloth_data['torso'], cloth_data['torso_color']);
      user.setComponentVariation(player, 4, cloth_data['leg'], cloth_data['leg_color']);
      user.setComponentVariation(player, 5, cloth_data['hand'], cloth_data['hand_color']);
      user.setComponentVariation(player, 6, cloth_data['foot'], cloth_data['foot_color']);
      user.setComponentVariation(
        player,
        7,
        cloth_data['accessorie'],
        cloth_data['accessorie_color']
      );
      user.setComponentVariation(player, 8, cloth_data['parachute'], cloth_data['parachute_color']);
      user.setComponentVariation(player, 9, cloth_data['armor'], cloth_data['armor_color']);
      user.setComponentVariation(player, 10, cloth_data['decal'], cloth_data['decal_color']);
      user.setComponentVariation(player, 11, cloth_data['body'], cloth_data['body_color']);

      setTimeout(function() {
        if (!mp.players.exists(player)) return;
        if (cloth_data['hat'] >= 0) {
          user.setProp(player, 0, cloth_data['hat'], cloth_data['hat_color']);
        }
        if (cloth_data['glasses'] >= 0) {
          user.setProp(player, 1, cloth_data['glasses'], cloth_data['glasses_color']);
        }
        if (cloth_data['ear'] >= 0) {
          user.setProp(player, 2, cloth_data['ear'], cloth_data['ear_color']);
        }
        if (cloth_data['watch'] >= 0) {
          user.setProp(player, 6, cloth_data['watch'], cloth_data['watch_color']);
        }
        if (cloth_data['bracelet'] >= 0) {
          user.setProp(player, 7, cloth_data['bracelet'], cloth_data['bracelet_color']);
        }
      }, 100);
    } catch (e) {
      methods.debug(e);
    }
  },
  addTattoo: (player: PlayerMp, collection: string, overlay: string) => {
    if (!mp.players.exists(player)) return;
    if (!player.tattoosList) player.tattoosList = [];
    if(player.tattoosList.find(item => item[0] == collection && item[1] == overlay)) return;
    player.tattoosList.push([collection, overlay]);
    player.setDecoration(mp.joaat(collection), mp.joaat(overlay))
  },
  removeTattoo: (player: PlayerMp, collection: string, overlay: string) => {
    if (!mp.players.exists(player)) return;
    if (!player.tattoosList){
      player.tattoosList = [];
      return;
    }
    if (!player.tattoosList.find(item => item[0] == collection && item[1] == overlay)) return;
    player.tattoosList.splice(player.tattoosList.findIndex(item => item[0] == collection && item[1] == overlay), 1);
    user.updateTattoo(player);
  },
  hasTattoo: (player: PlayerMp, collection: string, overlay: string) => {
    if (!mp.players.exists(player)) return false;
    if (!player.tattoosList) {
      player.tattoosList = [];
      return false;
    }
    if (!player.tattoosList.find(item => item[0] == collection && item[1] == overlay)) return false;
    return true;
  },

  updateTattoo: function(player: PlayerMp) {
    //methods.debug('user.updateTattoo');
    if (!mp.players.exists(player)) return;
    if (!player.tattoosList) player.tattoosList = [];
    try {
      player.clearDecorations();
      player.tattoosList.map(([collection, overlay]) => {
        player.setDecoration(mp.joaat(collection), mp.joaat(overlay))
      })
      if (user.get(player, 'tattoo_head_c') && user.get(player, 'tattoo_head_o')){
        user.addTattoo(player, user.get(player, 'tattoo_head_c'), user.get(player, 'tattoo_head_o'))
        user.set(player, 'tattoo_head_c', "")
        user.set(player, 'tattoo_head_o', "")
      }
      if (user.get(player, 'tattoo_torso_c') && user.get(player, 'tattoo_torso_o')){
        user.addTattoo(player, user.get(player, 'tattoo_torso_c'), user.get(player, 'tattoo_torso_o'))
        user.set(player, 'tattoo_torso_c', "")
        user.set(player, 'tattoo_torso_o', "")
      }
      if (user.get(player, 'tattoo_left_arm_c') && user.get(player, 'tattoo_left_arm_o')){
        user.addTattoo(player, user.get(player, 'tattoo_left_arm_c'), user.get(player, 'tattoo_left_arm_o'))
        user.set(player, 'tattoo_left_arm_c', "")
        user.set(player, 'tattoo_left_arm_o', "")
      }
      if (user.get(player, 'tattoo_right_arm_c') && user.get(player, 'tattoo_right_arm_o')){
        user.addTattoo(player, user.get(player, 'tattoo_right_arm_c'), user.get(player, 'tattoo_right_arm_o'))
        user.set(player, 'tattoo_right_arm_c', "")
        user.set(player, 'tattoo_right_arm_o', "")
      }
      if (user.get(player, 'tattoo_left_leg_c') && user.get(player, 'tattoo_left_leg_o')){
        user.addTattoo(player, user.get(player, 'tattoo_left_leg_c'), user.get(player, 'tattoo_left_leg_o'))
        user.set(player, 'tattoo_left_leg_c', "")
        user.set(player, 'tattoo_left_leg_o', "")
      }
      if (user.get(player, 'tattoo_right_leg_c') && user.get(player, 'tattoo_right_leg_o')){
        user.addTattoo(player, user.get(player, 'tattoo_right_leg_c'), user.get(player, 'tattoo_right_leg_o'))
        user.set(player, 'tattoo_right_leg_c', "")
        user.set(player, 'tattoo_right_leg_o', "")
      }

      user.setDecoration(player, user.get(player, 'tprint_c'), user.get(player, 'tprint_o'));
    } catch (e) {
      methods.debug(e);
    }
  },

  /** Результат
   * 1 - Женщина
   * 0 - Мужчина
   */
  getSex: function(player: PlayerMp):0|1 {
    //methods.debug('user.getSex');
    if (!mp.players.exists(player)) return null;
    if (user.isLogin(player)) {
      if (user.has(player, 'sex')) return user.get(player, 'sex');
      else {
        let skin = JSON.parse(user.get(player, 'skin'));
        user.set(player, 'sex', skin['SEX']);
        return skin['SEX'];
      }
    }
    return 0;
  },

  setSkinData: (player: PlayerMp, data: any) => {
    //methods.debug('user.setSkinData');
    if (!mp.players.exists(player)) return false;
    if (user.isLogin(player)) {
      let skin = !data ? JSON.parse(user.get(player, 'skin')) : data;
      Object.entries(skin).map(([key, value]) => {
        user.set(player, key, value);
      });
    }
  },

  clearAllProp: function(player: PlayerMp) {
    //methods.debug('user.clearAllProp');
    if (!mp.players.exists(player)) return false;

    for (let i = 0; i < 8; i++) user.setProp(player, i, -1, -1);

    let pos = player.position;
    mp.players.forEach((p) => {
      if (methods.distanceToPos(pos, p.position) < 300)
        p.call('client:user:clearAllProp', [player.id]);
    });
    //mp.players.call('client:user:clearAllProp', [player.id]);
  },

  checkComponents: (player:PlayerMp) => {
    // methods.debug('checkComponents')
    if(player.bankgrabmoney){
      user.setComponentVariation(player, 5, 40, 0, true);
    } else if(player.getVariable("chestWeaponItems")) {
      user.setComponentVariation(player, 5, 40, 0, true);
    } else if (user.hasItem(player, inventory.types.BagFull)) {
      user.setComponentVariation(player, 5, 45, 0, true);
    } else if (user.hasItem(player, inventory.types.BagTransfer)) {
      user.setComponentVariation(player, 5, 82, 0, true);
    } else if (user.hasItem(player, inventory.types.BagSmall)) {
      user.setComponentVariation(player, 5, 31, 0, true);
    } else {
      user.setComponentVariation(player, 5, 0, 0, true);
    }
  },

  setComponentVariation: function(
    player: PlayerMp,
    component: number,
    drawableId: number,
    textureId: number,
    nocheck = false
  ) {
    //methods.debug('user.setComponentVariation');
    if (!mp.players.exists(player)) return false;
    component = methods.parseInt(component);
    drawableId = methods.parseInt(drawableId);
    textureId = methods.parseInt(textureId);

    if (component == 8 && drawableId == -1 && textureId == 240) {
      textureId = -1;
      drawableId = 0;
    }

    if(!player.dressData){
      player.dressData = {}
    }
    player.dressData[component.toString()] = [drawableId, textureId]

    // player.setClothes(component, drawableId, textureId, 2);
    if(!nocheck)user.checkComponents(player);

    if (player.dressSync) return;
    player.dressSync = true;
    setTimeout(() => {
      if(mp.players.exists(player)){
        player.setVariable('dressSync', JSON.stringify(player.dressData));
        player.dressSync = false;
      }
    }, 100)

    //player.call('client:user:setComponentVariation', [component, drawableId, textureId]);
  },

  setProp: function(player: PlayerMp, slot: number, type: number, color: number, check = false) {
    //methods.debug('user.setProp');
    if (!mp.players.exists(player)) return false;

    slot = methods.parseInt(slot);
    type = methods.parseInt(type);
    color = methods.parseInt(color);



    if (!player.dressData) {
      player.dressData = {}
    }
    player.dressData['p'+slot.toString()] = [type, color]


    if (player.dressSync) return;
    player.dressSync = true;
    setTimeout(() => {
      if (mp.players.exists(player)) {
        player.setVariable('dressSync', JSON.stringify(player.dressData));
        player.dressSync = false;
      }
    }, 100)

    // player.setVariable('propType' + slot, type);
    // player.setVariable('propColor' + slot, color);

    // player.setProp(slot, type, color);
    // if(check)user.checkComponents(player);
  },

  setDecoration: function(player: PlayerMp, slot: string, overlay: string) {
    //methods.debug('user.setDecoration');
    if (!mp.players.exists(player)) return false;
    if(!slot || !overlay) return;
    player.setDecoration(mp.joaat(slot), mp.joaat(overlay));

    /*let count = 0;
        if (player.getVariable('tattooCount') != undefined)
            count = player.getVariable('tattooCount');

        mp.players.call('client:setPlayerDecoration', [player.id, slot, overlay]);
        player.setVariable('tattooType' + count, slot);
        player.setVariable('tattooColor' + count, overlay);
        player.setVariable('tattooCount', ++count);*/
  },

  getDating,

  setDating: function(player: PlayerMp, key: number, value: string) {
    if (!mp.players.exists(player)) return;
    if(!player.datingList) player.datingList = new Map();
    player.datingList.set(key, value);
    player.call('client:user:setDating', [key, value]);
  },

  set: function(player: PlayerMp|number, key: string, val: any) {
    //methods.debug('user.set');
    if (typeof player != "number" && !mp.players.exists(player)) return false;
    if (key == "fraction_id" || key == "rank"){
      if (typeof player != "number" && mp.players.exists(player)){
        player.setVariable(key, val);
      }
    }
    Container.Set((typeof player != "number" ? player.id : player), key, val);
  },

  setById: function(id: any, key: any, val: any) {
    Container.Set(id, key, val);
  },

  hasById: function(id: any, key: any) {
    return Container.Has(id, key);
  },

  getById: function(id: any, key: any) {
    try {
      return Container.Get(id, key);
    } catch (e) {
      methods.debug(e);
    }
    return null;
  },

  reset: function(player: PlayerMp, key: any) {
    if (!mp.players.exists(player)) return false;
    methods.debug('user.reset', user.getRpName(player), key);
    Container.Reset(player.id, key);
  },

  get: function(player: PlayerMp | number, key: any) {
    //methods.debug('user.get');
    if (typeof player != "number" && !mp.players.exists(player)) return null;
    try {
      return Container.Get(typeof player == "number" ? player : player.id, key);
    } catch (e) {
      methods.debug(e);
    }
    return null;
  },

  getPlayerById: function(id: number) {
    let player: PlayerMp = null;
    mp.players.forEach((pl) => {
      if (user.isLogin(pl) && user.getId(pl) == id) player = pl;
    });
    return player;
  },

  /** Проверить есть ли мут у игрока (вернёт 0 или время, когда будет конец мута) */
  checkMutePlayer: (target:PlayerMp|number,type:"voice"|"chat") => {
    let id = (typeof target == "number" ? target : user.getId(target));
    return muteContainer[type].get(id) ? muteContainer[type].get(id) : 0;
  },
  /** Вернёт отформатированое время (строку) чтобы вывести в чат и т.д. */
  getTimeFormat: (time:number) => {
    let date = new Date(Math.floor(time) * 1000);
    return ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  },
  /** Снять мут с игрока */
  unmutePlayer: (target:PlayerMp,type:"voice"|"chat") => {
    let id = user.getId(target);
    muteContainer[type].set(id, 0);
  },
  /** Функция для выдачи мута игроку */
  mutePlayer: (target:PlayerMp, who:PlayerMp, minutes:number, type:"voice"|"chat", reason?:string) => {
    let id = user.getId(target);
    if(minutes == 0){
      return muteContainer[type].set(id, minutes)
    }
    let endtime = minutes * 60 + (muteContainer[type].get(id) ? muteContainer[type].get(id) : methods.getTimeStamp()) ;
    let date = new Date(Math.floor(endtime) * 1000);
    let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2);
    chat.sendToAll(
      `Администратор  ${user.getRpName(who)} (${user.getId(who)})`,
      `${user.getRpName(target)} (${user.getId(target)})!{${chat.clRed}} получил ${(muteContainer[type].get(id) ? 'продление мута' : 'мут')} ${(type == "voice") ? 'голосового чата' : 'текстового чата'} до ${formattedTime} ${date.getDate()}/${date.getMonth() +
        1}/${date.getFullYear()} с причиной!{${
        chat.clWhite
      }} ${reason}`,
      chat.clRed
    );
    setTimeout(() => {
      muteContainer[type].set(id, endtime);
    }, 100)
  },

  getVehicleDriver: function(vehicle: VehicleMp) {
    if(!mp.vehicles.exists(vehicle)) return null;
    let driver: PlayerMp;
    vehicle.getOccupants().forEach((p) => {
      if (p.seat == -1) {
        driver = p;
      }
    });
    return driver;
  },

  has: function(player: PlayerMp, key: any) {
    if (!mp.players.exists(player)) return false;
    return Container.Has(player.id, key);
  },

  clearChat: function(player: PlayerMp) {
    if (!mp.players.exists(player)) return false;
    player.call('client:clearChat');
  },

  teleportWaypoint: function(player: PlayerMp) {
    //methods.debug('user.teleport');
    if (!mp.players.exists(player)) return false;
    user.teleportProtect(player)
    player.call('client:teleportWaypoint');
  },
  teleport: function(player: PlayerMp, x: number, y: number, z: number, h:number = null, d:number = null) {
    //methods.debug('user.teleport');
    if (!mp.players.exists(player)) return false;
    user.teleportProtect(player)
    player.call('client:teleport', [x, y, z, h]);
    if (d !== null) player.dimension = d;
  },

  teleportVeh: function(player: PlayerMp, x: number, y: number, z: number) {
    //methods.debug('user.teleportVeh');
    if (!mp.players.exists(player)) return false;
    user.teleportProtect(player)
    player.call('client:teleportVeh', [x, y, z]);
  },

  setWaypoint: function(player: PlayerMp, x: number, y: number) {
    //methods.debug('user.setWaypoint');
    if (!mp.players.exists(player)) return false;
    player.call('client:user:setWaypoint', [x, y]);
  },

  setWaypointTarget: function(player: PlayerMp, x: number, y: number, z:number) {
    //methods.debug('user.setWaypoint');
    if (!mp.players.exists(player)) return false;
    player.call('client:user:setWaypointTarget', [x, y, z]);
  },

  clearWaypointTarget: (player:PlayerMp) => {
    if (!mp.players.exists(player)) return false;
    player.call('client:user:removeWaypointTarget');
  },

  /** Проверит, что игрок живой, не в наручниках, не в тюрьме и так далее */
  isReadyForSmth: (player:PlayerMp) => {
    if(user.isCuff(player)) return false;
    if(user.isTie(player)) return false;
    if(player.getVariable("isKnockout")) return false;
    if(player.getVariable("isTieBandage")) return false;
    if(user.get(player, 'med_time') && user.get(player, 'med_time') > 0) return false;
    if(user.get(player, 'jail_time') && user.get(player, 'jail_time') > 0) return false;
    return true;
  },

  showMenu: function(player: PlayerMp, title: string, desc: string, menuData: Map<string,string>, workAnyTime = false) {
    methods.debug('user.showMenu');
    if (!mp.players.exists(player)) return false;
    let m = menu.new(player, title, desc);
    menuData.forEach((more, name) => {
      m.newItem({
        name,
        more
      })
    })
    m.workAnyTime = workAnyTime;
    m.open()
  },
  giveItemAnimation: (player:PlayerMp, target:PlayerMp) => {
    user.playAnimation(player, 'mp_common', 'givetake1_a', 8);
    user.headingToTarget(player, target.id);
    user.headingToTarget(target, player.id);
    setTimeout(() => {
      if(mp.players.exists(target))
      user.playAnimation(target, 'mp_common', 'givetake2_a', 8);
    }, 1500)
  },
  arrestAnimation: (
    /** COP */
    player:PlayerMp, 
    /** Player that arresting */
    target:PlayerMp
    ) => {
      return new Promise((resolve, reject) => {
        if(!mp.players.exists(player)) return;
        if(!mp.players.exists(target)) return;
        // user.disableAllControls(player, true)
        // user.disableAllControls(target, true)
        const pos = methods.calculateAttachPosition(player.position, player.heading, new mp.Vector3(0, 0.2, 0));
        user.teleportProtect(target)
        target.position = pos;
        target.call("set:heading", [player.heading])
        target.heading = player.heading;
        setTimeout(function() {
          if(!mp.players.exists(player))return;
          if(!mp.players.exists(target))return;
          const dictionary = 'mp_arresting';
          user.playAnimation(player, dictionary, "a_uncuff", 8)
          user.playAnimation(target, dictionary, "arrested_spin_l_0", 8)
          setTimeout(() => {
            setTimeout(() => {
              // if(mp.players.exists(player)) user.disableAllControls(player, false)
              // if(mp.players.exists(target)) user.disableAllControls(target, false)
              if(mp.players.exists(player) && mp.players.exists(target))
              if(!mp.players.exists(player)) return;
              if(mp.players.exists(player))user.stopAnimation(player);
              if(mp.players.exists(target))user.stopAnimation(target);
            }, 2000)
            if(mp.players.exists(player) && mp.players.exists(target)) return resolve(true)
            resolve(false)
          }, 2000)
        }, 100)
        
      })
  },
  isPlayAnimation: (player: PlayerMp, dict: string, anim: string):Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if(!mp.players.exists(player)) return resolve(false);
      mp.events.callClient(player, "isPlayAnimation", dict, anim).then((res:boolean) => {
        resolve(res);
      })
    })
  },
  isPlayTask: (player: PlayerMp):Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if(!mp.players.exists(player)) return resolve(false);
      mp.events.callClient(player, "isPlayTask").then((res:boolean) => {
        resolve(res);
      })
    })
  },
  /**
   * Список флагов
   * - 8 = нормально играть
     - 9 = цикл
     - 48 = нормально играть только верхнюю часть тела
     - 49 = цикл только верхняя часть тела
      */
  playAnimation: function (player: PlayerMp, dict: string, anim: string, flag: 8 | 9 | 48 | 49 = 49, accessVeh = false) {
    methods.debug('user.playAnimation');
    if (!mp.players.exists(player)) return false;
    if (!RAGE_BETA){
      let pos = player.position;
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncAnimation', [player.id, dict, anim, flag, accessVeh]);
        } catch (e) {
          methods.debug(e);
        }
      });
    } else {
      player.call('client:syncAnimation', [player.id, dict, anim, flag, accessVeh])
    }
  },
  playArrestAnimation: function(player: PlayerMp) {
    methods.debug('user.playAnimation');
    if (!mp.players.exists(player)) return false;
    let pos = player.position;
    if (!RAGE_BETA){
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncArrestAnimation', [player.id]);
        } catch (e) {
          methods.debug(e);
        }
      });
    } else {
      player.callsocket('client:syncArrestAnimation', [player.id]);
    }
  },

  headingToCoord: function(player: PlayerMp, x: number, y: number, z: number) {
    methods.debug('user.headingToCoord');
    if (!mp.players.exists(player)) return false;
    let pos = player.position;
    if (!RAGE_BETA) {
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncHeadingToCoord', [player.id, x, y, z]);
        } catch (e) {
          methods.debug(e);
        }
      });
    } else {
      player.callsocket('client:syncHeadingToCoord', [player.id, x, y, z]);
    }
  },

  headingToTarget: function(player: PlayerMp, targetId: number) {
    methods.debug('user.headingToCoord');
    if (!mp.players.exists(player)) return false;
    let pos = player.position;
    if (!RAGE_BETA) {
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncHeadingToTarget', [player.id, targetId]);
        } catch (e) {
          methods.debug(e);
        }
      });
    } else {
      player.callsocket('client:syncHeadingToTarget', [player.id, targetId]);
    }
  },

  takeNewItem: function(player: PlayerMp, itemId: number, count = 1) {
    methods.debug('user.takeNewItem');
    if (!mp.players.exists(player)) return;
    inventory.addItem(player, itemId, 1, 1, user.getId(player), count)
  },

  /** Получить предмет по его ИД */
  hasItem: function(player: PlayerMp, itemId: number) {
    return !!user.getItem(player, itemId);
  },
  /** Получить предмет по его ИД */
  getItem: function(player: PlayerMp, itemId: number) {
    return inventory.getItemListData(1, user.getId(player)).find(item => item.item_id == itemId);
  },
  /** Удалить предмет из инвентаря по его ID (НЕ ID из БД) */
  removeItem: (player:PlayerMp, item_id:number) => {
    let item = user.getItem(player, item_id);
    if(item){
      inventory.deleteItem(item.id)
      return true
    } else return false
  },
  /** Получить предмет по его ИД в БД, то есть уникальному */
  getItemById: function(player: PlayerMp, id: number) {
    return inventory.getItemListData(1, user.getId(player)).find(item => item.id == id);
  },

  stopAnimation: function(player: PlayerMp) {
    methods.debug('user.stopAnimation');
    if (!mp.players.exists(player)) return false;
    if (!player.getVariable('isBlockAnimation')) {
      player.call('client:user:stopAnimation');
      user.stopSyncAnimation(player);
    }
  },

  stopSyncAnimation: function(player: PlayerMp) {
    methods.debug('user.stopSyncAnimation');
    player.setVariable('use_scenario', null);
    if (!mp.players.exists(player)) return false;
    let pos = player.position;
    if (!RAGE_BETA) {
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncStopAnimation', [player.id]);
        } catch (e) {
          methods.debug(e);
        }
      });
    } else {
      player.callsocket('client:syncStopAnimation', [player.id]);
    }
  },

  playScenario: function(player: PlayerMp, name: string, x?:number, y?:number, z?:number, h?:number, teleport = true) {
    methods.debug('user.playScenario');
    if (!mp.players.exists(player)) return false;
    if (!player.getVariable('isBlockAnimation')) {
      let pos = player.position;
      if (!RAGE_BETA){
        player.setVariable('use_scenario', JSON.stringify([name, x, y, z, h, teleport]));
        mp.players.forEach((p) => {
          try {
            if (methods.distanceToPos(pos, p.position) < 300)
              p.callsocket('client:syncScenario', [player.id, name, x, y, z, h, teleport]);
          } catch (e) {
            methods.debug(e);
          }
        });
      } else {
        player.callsocket('client:syncScenario', [player.id, name, x, y, z, h, teleport]);
      }

      //mp.players.call('client:syncScenario', [player.id, name]);
      //mp.players.call('client:syncAnimation', player.id, dict, anim, flag);
      //player.call('client:user:playAnimation', [dict, anim, flag]);
      //player.playScenario(name);
    }
  },

  stopScenario: function(player: PlayerMp, quick = false) {
    methods.debug('user.stopScenario');
    if (!mp.players.exists(player)) return false;
    let pos = player.position;
    if (!RAGE_BETA) {
      player.setVariable('use_scenario', null);
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncStopScenario', [player.id, quick]);
        } catch (e) {
          methods.debug(e);
        }
      });
    } else {
      player.callsocket('client:syncStopScenario', [player.id, quick]);
    }
  },

  playNearestScenarioCoord: function(player: PlayerMp, x: number, y: number, z: number, r: number) {
    methods.debug('user.playScenario');
    if (!mp.players.exists(player)) return false;
    if (!player.getVariable('isBlockAnimation')) {
      let pos = player.position;
      player.setVariable('use_scenario', true);
      mp.players.forEach((p) => {
        try {
          if (methods.distanceToPos(pos, p.position) < 300)
            p.callsocket('client:syncScenarioCoord', [player.id, x, y, z, r]);
        } catch (e) {
          methods.debug(e);
        }
      });

      //mp.players.call('client:syncScenario', [player.id, name]);
      //mp.players.call('client:syncAnimation', player.id, dict, anim, flag);
      //player.call('client:user:playAnimation', [dict, anim, flag]);
      //player.playScenario(name);
    }
  },

  hideLoadDisplay: (player: PlayerMp, hud: boolean = true) => {
    methods.debug('user.hideLoadDisplay');
    if (!mp.players.exists(player)) return false;
    player.callsocket('client:user:hideLoadDisplay', [hud]);
  },

  showLoadDisplay: (player: PlayerMp, hud: boolean = true) => {
    methods.debug('user.showLoadDisplay');
    if (!mp.players.exists(player)) return false;
    player.callsocket('client:user:showLoadDisplay', [hud]);
  },

  removeWaypoint: function(player: PlayerMp) {
    methods.debug('user.removeWaypoint');
    if (!mp.players.exists(player)) return false;
    user.setWaypoint(player, player.position.x, player.position.y);
  },

  getRpName: function(player: PlayerMp) {
    //methods.debug('user.getRpName');
    if (!mp.players.exists(player)) return 'NO_NAME';
    if (user.has(player, 'rp_name')) return user.get(player, 'rp_name').replace(/\'/g,'').replace(/\"/g,'').replace(/\`/g,'');
    return player.socialClub;
  },

  getPhone: function(player: PlayerMp) {
    //methods.debug('user.getRpName');
    if (!user.isLogin(player)) return;
    return user.get(player, 'phone_code') + '-' + user.get(player, 'phone');
  },

  getId: function(player: PlayerMp) {
    //methods.debug('user.getId');
    if (!mp.players.exists(player)) return -1;
    if (player.getVariable('id')) return methods.parseInt(player.getVariable('id'));
    return -1;
  },

  getRegStatusName: function(player: PlayerMp) {
    methods.debug('user.getRegStatusName');
    if (!mp.players.exists(player)) return '~r~Нет';
    switch (user.get(player, 'reg_status')) {
      case 1:
        return 'временная';
      case 2:
        return 'получение гражданства';
      case 3:
        return 'гражданство США';
      default:
        return '~r~Нет';
    }
  },

  updateClientCache: function(player: PlayerMp) {
    methods.debug('user.updateClientCache');
    if (!mp.players.exists(player)) return;
    try {
      let skin: any = {};

      skin.SEX = methods.parseInt(user.get(player, 'SEX'));
      skin.GTAO_SHAPE_THRID_ID = methods.parseFloat(user.get(player, 'GTAO_SHAPE_THRID_ID')); //
      skin.GTAO_SKIN_THRID_ID = methods.parseFloat(user.get(player, 'GTAO_SKIN_THRID_ID')); //
      skin.GTAO_SHAPE_SECOND_ID = methods.parseFloat(user.get(player, 'GTAO_SHAPE_SECOND_ID')); //
      skin.GTAO_SKIN_SECOND_ID = methods.parseFloat(user.get(player, 'GTAO_SKIN_SECOND_ID')); //
      skin.GTAO_SHAPE_MIX = methods.parseFloat(user.get(player, 'GTAO_SHAPE_MIX')); //
      skin.GTAO_SKIN_MIX = methods.parseFloat(user.get(player, 'GTAO_SKIN_MIX')); //

      skin.GTAO_HAIR = methods.parseFloat(user.get(player, 'GTAO_HAIR')); //
      skin.GTAO_HAIR_COLOR = methods.parseFloat(user.get(player, 'GTAO_HAIR_COLOR')); //
      skin.GTAO_HAIR_COLOR2 = methods.parseFloat(user.get(player, 'GTAO_HAIR_COLOR2')); //
      skin.GTAO_EYE_COLOR = methods.parseFloat(user.get(player, 'GTAO_EYE_COLOR')); //
      skin.GTAO_EYEBROWS = methods.parseFloat(user.get(player, 'GTAO_EYEBROWS')); //
      skin.GTAO_EYEBROWS_COLOR = methods.parseFloat(user.get(player, 'GTAO_EYEBROWS_COLOR')); //

      skin.GTAO_OVERLAY = methods.parseFloat(user.get(player, 'GTAO_OVERLAY')); //
      skin.GTAO_OVERLAY_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY_COLOR')); //

      skin.GTAO_OVERLAY9 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY9')); //
      skin.GTAO_OVERLAY9_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY9_COLOR')); //

      skin.GTAO_OVERLAY8 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY8')); //
      skin.GTAO_OVERLAY8_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY8_COLOR')); //

      skin.GTAO_OVERLAY5 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY5')); //
      skin.GTAO_OVERLAY5_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY5_COLOR')); //

      skin.GTAO_OVERLAY4 = methods.parseFloat(user.get(player, 'GTAO_OVERLAY4')); //
      skin.GTAO_OVERLAY4_COLOR = methods.parseFloat(user.get(player, 'GTAO_OVERLAY4_COLOR')); //

      if (typeof user.get(player, 'GTAO_FACE_SPECIFICATIONS') == 'string') {
        skin.GTAO_FACE_SPECIFICATIONS = JSON.parse(user.get(player, 'GTAO_FACE_SPECIFICATIONS')); // FEATURES
      } else {
        skin.GTAO_FACE_SPECIFICATIONS = user.get(player, 'GTAO_FACE_SPECIFICATIONS');
      }

      user.set(player, 'skin', JSON.stringify(skin));

      player.callsocket('client:user:updateCache', [Array.from(Container.GetAll(player.id))]);
    } catch (e) {
      methods.debug(e);
    }
  },

  getChips: function(player: PlayerMp) {
    if(player && player.chipsBalance) return player.chipsBalance;
    return 0
  },

  setChips: function(player: PlayerMp, money: number, save = true) {
    if (
      !mp.players.exists(player) ||
      typeof money !== "number" ||
      isNaN(money)) {
      return;
    }
    if(save) user.log(player, "PlayerSystem", "смена баланса фишек казино с "+player.chipsBalance+" на "+money)

    player.chipsBalance = money;

    if (player.chipsBalance < 0) {
      player.chipsBalance = 0;
    }

    // if(save) user.saveAccount(player)
    
    player.call('user.client.updateChips', [player.chipsBalance]);
  },

  addChips: function(player: PlayerMp, money: number) {
    if(typeof money != "number" || isNaN(money)) return;
    if(!mp.players.exists(player)) return;
    user.setChips(player, user.getChips(player)+money)
    methods.saveLog("chips", user.getId(player)+" add "+money+" | res "+user.getChips(player))
  },

  removeChips: function(player: PlayerMp, money: number) {
    if(typeof money != "number" || isNaN(money)) return;
    if(!mp.players.exists(player)) return;
    user.setChips(player, user.getChips(player)-money)
    methods.saveLog("chips", user.getId(player)+" remove "+money+" | res "+user.getChips(player))
  },

  addMoneyOffline: function(id: number, money: number, notify?:string) {
    if(notify) user.notify(id, `${notify}: ~g~$${methods.numberFormat(money)}`, null, "chat", "success");
    let target = user.getPlayerById(id);
    if(target){
      user.addMoney(target, money);
      return
    }
    user.getUserDataFromDB(id).then(player => {
      if(!player) return;
      player.money+=money;
      player.save();
    })
  },
  addMoney: function(player: PlayerMp, money: number) {
    user.addCashMoney(player, money);
  },

  removeMoney: function(player: PlayerMp, money: number) {
    user.removeCashMoney(player, money);
  },

  setMoney: function(player: PlayerMp, money: number) {
    user.setCashMoney(player, money);
  },

  getMoney: function(player: PlayerMp) {
    return user.getCashMoney(player);
  },

  addCashMoney: function(player: PlayerMp, money: number) {
    // if(money <= 0) return;
    methods.saveLog(
      'Money',
      `[ADD_CASH] ${user.getRpName(player)} (${user.getId(player)}) ${user.getCashMoney(
        player
      )} - ${money}`
    );
    user.setCashMoney(player, user.getCashMoney(player) + methods.parseInt(money));
  },

  removeCashMoney: function(player: PlayerMp, money: number) {
    // if (money <= 0) return;
    methods.saveLog(
      'Money',
      `[REMOVE_CASH] ${user.getRpName(player)} (${user.getId(player)}) ${user.getCashMoney(
        player
      )} + ${money}`
    );
    user.setCashMoney(player, user.getCashMoney(player) - methods.parseInt(money));
  },

  setCashMoney: function(player: PlayerMp, money: number) {
    // if (money <= 0) return;
    user.log(player, "PlayerSystem", "смена баланса на руках с "+user.getCashMoney(player)+"$ на "+money+"$")
    user.set(player, 'money', methods.parseInt(money));
    user.updateClientCache(player);
    mp.events.triggerBrowser(player, 'cef:hud:setMoney', money);
    // user.saveAccount(player);
  },

  getCashMoney: function(player: PlayerMp) {
    if (user.has(player, 'money')) return methods.parseInt(user.get(player, 'money'));
    return 0;
  },

  addBankMoney: function(player: PlayerMp, money: number) {
    methods.saveLog(
      'Money',
      `[ADD_BANK] ${user.getRpName(player)} (${user.getId(player)}) ${user.getBankMoney(
        player
      )} - ${money}`
    );
    user.setBankMoney(player, user.getBankMoney(player) + methods.parseInt(money));
  },

  removeBankMoney: function(player: PlayerMp, money: number) {
    methods.saveLog(
      'Money',
      `[REMOVE_BANK] ${user.getRpName(player)} (${user.getId(player)}) ${user.getBankMoney(
        player
      )} + ${money}`
    );
    user.setBankMoney(player, user.getBankMoney(player) - methods.parseInt(money));
  },

  setBankMoney: function(player: PlayerMp, money: number) {
    user.log(player, "PlayerSystem", "смена баланса в банке с "+user.getBankMoney(player)+"$ на "+money+"$")
    user.set(player, 'money_bank', methods.parseInt(money));
    user.updateClientCache(player);
    mp.events.triggerBrowser(player, 'cef:hud:setMoneyBank', money);
    // user.saveAccount(player);
  },

  getBankMoney: function(player: PlayerMp) {
    if (user.has(player, 'money_bank')) return methods.parseInt(user.get(player, 'money_bank'));
    return 0;
  },

  addPayDayMoney: function(player: PlayerMp, money: number) {
    user.setPayDayMoney(player, user.getPayDayMoney(player) + methods.parseInt(money));
  },

  removePayDayMoney: function(player: PlayerMp, money: number) {
    user.setPayDayMoney(player, user.getPayDayMoney(player) - methods.parseInt(money));
  },

  setPayDayMoney: function(player: PlayerMp, money: number) {
    user.set(player, 'money_payday', methods.parseInt(money));
    user.saveAccount(player);
  },

  getPayDayMoney: function(player: PlayerMp) {
    if (user.has(player, 'money_payday')) return methods.parseInt(user.get(player, 'money_payday'));
    return 0;
  },

  addGrabMoney: function(player: PlayerMp, money: number) {
    if (user.isLogin(player)) player.call('client:user:addGrabMoney', [money]);
  },

  removeGrabMoney: function(player: PlayerMp, money: number) {
    if (user.isLogin(player)) player.call('client:user:removeGrabMoney', [money]);
  },

  setGrabMoney: function(player: PlayerMp, money: number) {
    if (user.isLogin(player)) player.call('client:user:setGrabMoney', [money]);
  },

  giveTaxiJobMoney: function(player: PlayerMp, money: number) {
    if (!user.isLogin(player)) return;
    let businessId = user.get(player, 'job') == 'taxi2' ? 147 : 114;

    let taxiMoney = methods.parseInt(money * ((100 - business.getPrice(businessId) * 2) / 100));
    let businessMoney = methods.parseInt(money * ((business.getPrice(businessId) * 2) / 100));

    if (user.get(player, 'bank_prefix') < 1) {
      user.addCashMoney(player, taxiMoney);
      player.notify('Вы заработали: ~g~$' + taxiMoney);
    } else {
      user.addBankMoney(player, taxiMoney);
      bank.sendSmsBankOperation(player, `Зачисление средств: ~g~$${taxiMoney}`);
    }

    business.addMoney(businessId, businessMoney);
  },

  giveJobMoney: function(player: PlayerMp, money: number) {
    if (!user.isLogin(player)) return;
    money = methods.parseInt(money);

    if(user.get(player, 'bank_prefix') < 1) {
      user.addCashMoney(player, money);
      player.notify('Вы заработали: ~g~$' + money);
    } else {
      user.addBankMoney(player, money);
      bank.sendSmsBankOperation(player, `Зачисление средств: ~g~$${money}`);
    }

    coffer.removeMoney(money);
  },

  jail: function(player: PlayerMp, sec: number, withIzol = false) {
    methods.debug('user.jail');
    if (!user.isLogin(player)) return false;
    player.call('client:jail:jailPlayer', [sec, withIzol]);
  },

  arrest: function(player: PlayerMp) {
    user.log(player, "GosJail", 'Был посажен в тюрьму на ' + user.get(player, 'wanted_level') + ' лет')
    methods.debug('user.arrest');
    if (!user.isLogin(player)) return false;
    if (parseInt(user.get(player, 'wanted_level')) <= 0) return false;

    user.addHistory(
      player,
      1,
      'Был посажен в тюрьму на ' + user.get(player, 'wanted_level') + ' лет'
    );
    user.jail(player, methods.parseInt(user.get(player, 'wanted_level')) * 450);
    mp.events.call("playerArrested", player)
  },

  /** Позволяет отправить игрока в тюрьму */
  arrestAdmin: (player:PlayerMp|number,admin:PlayerMp|string,time:number,reason:string,name?:string):Promise<boolean> => {
    return new Promise(resolve => {
      if(typeof admin != "string" && !user.isAdminNow(admin)) return resolve(true);
      if(typeof player == "string") player = methods.parseInt(player);
      let id = (typeof player == "number" ? player : user.getId(player));
      if(!name && typeof player != "number") name = user.getRpName(player);
      if(typeof time != 'number') time = methods.parseInt(time);
      if(isNaN(time) || time < 0) return (typeof admin == "string" ? null : admin.notify("Время указанно не верно")), resolve(true);
      if(!reason || reason.length < 2) return (typeof admin == "string" ? null : admin.notify("Укажите причину ареста")), resolve(true);
      user.checkIdUser(id).then(fnd => {
        if(fnd == -1 && typeof admin != "string") return (admin.notify("Игрок не обнаружен")), resolve(true);
        if(fnd == -1) return resolve(true);
        if(fnd > 0 && typeof admin != "string" && time > 0) return (admin.notify("Нельзя посадить в тюрьму администратора")), resolve(true);
        if(typeof player == "number" && mp.players.toArray().find(usr => user.getId(usr) == id)) player = mp.players.toArray().find(usr => user.getId(usr) == id);
        if(typeof player != "number" && time > 0) chat.sendToAll(
          `Администратор ${typeof admin == "string" ? admin : `${user.getRpName(admin)} (${user.getId(admin)})`}`,
          `${user.getRpName(player)} (${user.getId(player)})!{${chat.clRed}} был посажен в тюрьму с причиной!{${
            chat.clWhite
          }} ${reason} на ${time} мин.`,
          chat.clRed
        );
        else if(name && time > 0){
          chat.sendToAll(
            `Администратор ${typeof admin == "string" ? admin : `${user.getRpName(admin)} (${user.getId(admin)})`}`,
            `${name} (${id})!{${chat.clRed}} был посажен в тюрьму с причиной!{${
              chat.clWhite
            }} ${reason} на ${time} мин.`,
            chat.clRed
          );
        }
        else if(typeof admin != "string" && time > 0)admin.outputChatBox(
          `!{#f44336}Вы посадили!{FFFFFF} Игрока ID: ${id} в тюрьму с причиной: !{${
            chat.clWhite
          }}${reason} на ${time} мин.`
        );
        if(time == 0){
          chat.broadcastAdmins(
            `Администратор ${typeof admin == "string" ? admin : `${user.getRpName(admin)} (${user.getId(admin)})`}`,
            `${name ? name : "Игрок"} (${id})!{${chat.clRed}} был выпущен из тюрьмы`,
            chat.clRed
          );
        }
        if (typeof admin == "string"){
          user.log(player, "AdminJail", `Был посажен в тюрьму администратором ${typeof admin == "string" ? admin : `${user.getRpName(admin)} (${user.getId(admin)})`} на ` + time + ' лет с причиной: '+reason)
        } else {
          user.loginterract(player, admin, "AdminJail", `Был посажен в тюрьму администратором ${typeof admin == "string" ? admin : `${user.getRpName(admin)} (${user.getId(admin)})`} на ` + time + ' лет с причиной: '+reason)
        }
        user.notify(id, `Вы были посажены в тюрьму администратором ${typeof admin == "string" ? admin : `${user.getRpName(admin)} (${user.getId(admin)})`} на ${time} минут с причиной: ${reason}`, "Администрация", "chat" ,"error")
        if(typeof player != "number") user.jail(player, time * 60, true), mp.events.call("playerArrested", player); // Нужно же превратить минуты в секунды
        else user.offlineJail(id, time);
        user.set(id, 'jailed', (time != 0));
        if(time != 0) user.set(id, 'jailed_admin', 1);
        else user.set(id, 'jailed_admin', 0);
        resolve(true);
      })
    })
  },

  /** Офлайн тюрьма, чисто технический момент, вызывать не нужно */
  offlineJail: (id:number, time:number) => {
    userEntity.update({
      jailed: 1,
      jail_time: time * 60,
      jailed_admin: time > 0 ? 1 : 0,
    }, {where: {
      id: id
    }})
  },

  /** Позволяет проверить является ли указанный ID верным. Можно проверить как среди онлайн так и среди всех
   * @returns rank {number} | -1
   */
  checkIdUser: (id:number, onlyOnline = false):Promise<number> => {
    return new Promise((resolve) => {
      let checkOnline = mp.players.toArray().find(usr => user.getId(usr) == id);
      if(checkOnline) return resolve(user.get(checkOnline, 'admin_level'));
      if(onlyOnline) return resolve(-1);
      userEntity.findOne({
        where: {
          id: id
        }
      }).then(res => {
        if(!res) return resolve(-1);
        else return resolve(res.admin_level)
      })
    })
  },

  hasWeapon: (player: PlayerMp, weapon:number) => {
    if(!user.isLogin(player)) return;
    return (player.weaponsAll.find(itm => (itm.hash == weapon || itm.item == weapon)))
  },
  hasAnyWeapon: (player: PlayerMp) => {
    if(!user.isLogin(player)) return;
    return (player.weaponsAll.length > 0)
  },
  giveWeaponByHash: function(player: PlayerMp, hash: Hash, pt: number, inHand = false) {
    methods.debug('user.giveWeaponByHash');
    if (!user.isLogin(player)) return false;
    player.call('client:user:giveWeaponByHash', [hash, pt, inHand]);
  },

  giveWanted: function(player: PlayerMp, level: number, reason: string) {
    methods.debug('user.giveWanted');
    if (!user.isLogin(player)) return false;
    
    if (reason == 'clear') {
      user.log(player, "GosUnWanted", `был снят розыск`)
      user.set(player, 'wanted_level', 0);
      user.set(player, 'wanted_reason', 0);
      player.notifyWithPicture(
        'Уведомление',
        'Police Department',
        'Вы больше не находитесь в розыске',
        'WEB_LOSSANTOSPOLICEDEPT',
        2
        );
        user.addHistory(player, 1, 'Был очищен розыск');
    } else {
      if (user.isInMp(player)) return false;
      if (user.get(player, 'mask') > 0) return false;
      if (hiddenIdMask.includes(player.getClothes(1).drawable)) return false;
      user.log(player, "GosWanted", `был выдан розыск ${level}, причина: ${reason}`)
      let currentLvl = user.get(player, 'wanted_level');
      if (currentLvl + level >= 10) {
        //methods.notifyWithPictureToAll('Федеральный розыск', 'Police Department', `${user.getRpName(player)} был объявлен в розыск`, 'WEB_LOSSANTOSPOLICEDEPT', 2);
        user.set(player, 'wanted_level', 10);
      } else user.set(player, 'wanted_level', currentLvl + level);
      user.set(player, 'wanted_reason', reason);
      player.notifyWithPicture(
        'Уведомление',
        'Police Department',
        'Просим Вас явиться в участок Los Santos Police Department',
        'WEB_LOSSANTOSPOLICEDEPT',
        2
      );

      user.addHistory(player, 1, 'Был выдан розыск ' + level + '. Причина: ' + reason);
    }
    user.updateClientCache(player);
  },

  setIzol: function(player: PlayerMp, number: number, reason: string) {
    methods.debug('user.setIzol');
    if (!mp.players.exists(player)) return false;
    if (!user.isLogin(player)) return false;
    player.call('client:jail:izol', [number]);
    player.notify('~r~Вас посадили в изолятор №' + number + ' с причиной:');
    player.notify('~r~' + reason);
  },

  giveJailRun: function(player: PlayerMp) {
    methods.debug('user.giveJailRun');
    if (!mp.players.exists(player)) return false;
    if (!user.isLogin(player)) return false;
    player.call('client:jail:giveJailRun');
    player.notify('~g~Вам выдали допуск к прогулке');
  },

  takeJailRun: function(player: PlayerMp) {
    methods.debug('user.takeJailRun');
    if (!mp.players.exists(player)) return false;
    if (!user.isLogin(player)) return false;
    player.call('client:jail:takeJailRun');
    player.notify('~g~У вас забрали допуск к прогулке');
  },

  isAdmin: function(player: PlayerMp, adminLevel = 1) {
    //methods.debug('user.isAdmin');
    return user.isLogin(player) && user.get(player, 'admin_level') >= adminLevel;
  },

  isAdminNow: function(player: PlayerMp, adminLevel = 1) {
    if(user.isLogin(player) && user.get(player, 'admin_level') >= adminLevel && player.getVariable('enableAdmin')) return true;
    return false;
  },

  getAdminLevel: function(player: PlayerMp) {
    //methods.debug('user.isAdmin');
    return user.get(player, 'admin_level');
  },

  setAdminLevel: function(player: PlayerMp, lvl:number) {
    //methods.debug('user.isAdmin');
    lvl = methods.parseInt(lvl);
    user.set(player, 'admin_level', lvl);
    user.updateClientCache(player);
  },

  isHelper: function(player: PlayerMp) {
    //methods.debug('user.isHelper');
    return user.isLogin(player) && user.get(player, 'helper_level') >= 1;
  },
  getHelperLevel: function(player: PlayerMp):number {
    //methods.debug('user.isHelper');
    return user.isLogin(player) ? user.get(player, 'helper_level') : 0;
  },
  setHelperLevel: function(player: PlayerMp, level:number):number {
    if (!user.isLogin(player)) return;
    user.set(player, 'helper_level', level);
    user.updateClientCache(player);
  },

  isLeader2: function(player: PlayerMp) {
    //methods.debug('user.isLeader');
    return user.isLogin(player) && user.get(player, 'rank2') == 11;
  },

  isLeader: function(player: PlayerMp) {
    //methods.debug('user.isLeader');
    return user.isLogin(player) && fractionUtil.isLeader(user.get(player, 'fraction_id'), user.get(player, 'rank'));
  },

  isSubLeader: function(player: PlayerMp) {
    //methods.debug('user.isSubLeader');
    if (!mp.players.exists(player)) return false;
    if (!user.isLogin(player)) return false;
    return fractionUtil.isSubLeader(user.get(player, 'fraction_id'), user.get(player, 'rank'))
  },

  isGang: (player: PlayerMp) => {
    if (!mp.players.exists(player)) return false;
    if (!user.isLogin(player)) return false;
    if(!user.getPlayerFraction(player)) return false;
    return !!fractionUtil.getFraction(user.getPlayerFraction(player)).gang
  },

  isGos: function(player: PlayerMp) {
    //methods.debug('user.isGos');
    return (
      user.isLogin(player) &&
      (user.isSapd(player) ||
        user.isFib(player) ||
        user.isUsmc(player) ||
        user.isGov(player) ||
        user.isEms(player) ||
        user.isSheriff(player) ||
        user.isPrison(player))
    );
  },

  isGosPD: function(player: PlayerMp) {
    //methods.debug('user.isGos');
    return (
      user.isLogin(player) &&
      (user.isSapd(player) ||
        user.isFib(player) ||
        user.isUsmc(player) ||
        user.isGov(player) ||
        user.isSheriff(player) ||
        user.isPrison(player))
    );
  },

  isGov: function(player: PlayerMp) {
    //methods.debug('user.isGov');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 1;
  },

  isSapd: function(player: PlayerMp) {
    //methods.debug('user.isSapd');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 2;
  },

  isFib: function(player: PlayerMp) {
    //methods.debug('user.isFib');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 3;
  },

  isUsmc: function(player: PlayerMp) {
    //methods.debug('user.isUsmc');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 4;
  },

  isSheriff: function(player: PlayerMp) {
    //methods.debug('user.isSheriff');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 7;
  },

  isPrison: function(player: PlayerMp) {
    //methods.debug('user.isPrison');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 5;
  },

  isRussianMafia: function(player: PlayerMp) {
    //methods.debug('user.isRussianMafia');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 8;
  },

  isCosaNostra: function(player: PlayerMp) {
    //methods.debug('user.isCosaNostra');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 9;
  },

  isYakuza: function(player: PlayerMp) {
    //methods.debug('user.isYakuza');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 10;
  },

  isLaEme: function(player: PlayerMp) {
    //methods.debug('user.isLaEme');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 11;
  },

  isMafia: function(player: PlayerMp) {
    let fraction = user.getPlayerFraction(player);
    if(!fraction) return false;
    return !!fractionUtil.getFraction(fraction).mafia
  },

  isEms: function(player: PlayerMp) {
    //methods.debug('user.isEms');
    return user.isLogin(player) && user.get(player, 'fraction_id') == 16;
  },

  getFractionName: function(fractionId: number) {
    //methods.debug('user.getFractionName');
    return fractionUtil.getFractionName(fractionId)
  },

  getPlayerFraction: function(player:PlayerMp):number {
    if(!mp.players.exists(player)) return;
    return user.get(player, "fraction_id")
  },
  getPlayerFractionRank: function(player:PlayerMp):number {
    if(!mp.players.exists(player)) return;
    return user.get(player, "rank")
  },
  getPlayerFractionName: function(player:PlayerMp) {
    if(!mp.players.exists(player)) return;
    return user.getFractionName(user.getPlayerFraction(player))
  },

  getRankName: function(fractionId: number, rank: number) {
    //methods.debug('user.getRankName');
    return fractionUtil.getRankName(fractionId, rank)
  },

  setOnlineStatus: function(player: PlayerMp, isOnline: number) {
    //methods.debug('user.setOnlineStatus');
    if (isOnline == undefined) isOnline = 0;
    if (user.isLogin(player))
      userEntity.update({
        is_online: isOnline
      }, {where: {
        id: user.getId(player)
      }})
  },

  kick: function(player: PlayerMp, reason: string, title = 'Вы были кикнуты.') {
    if (!mp.players.exists(player)) return;
    methods.debug('user.kick ' + player.socialClub + ' ' + reason);
    player.outputChatBox('!{f44336}' + title);
    player.outputChatBox('!{f44336}Причина: !{FFFFFF}' + reason);
    user.log(player, "PlayerKick", `${title}, причина: ${reason}`)
    user.notify(player, reason, title, 'chat', 'error')
    player.kick(reason);
  },

  kickAntiCheat: function(player: PlayerMp, reason: string, title = 'Вы были кикнуты.') {
    if(!mp.players.exists(player)) return;
    player.weaponsAll = [];
    methods.debug('user.kickAntiCheat');
    user.kick(player, reason, title);
    user.log(player, "PlayerKick", `[Античит] ${title}, причина: ${reason}`)
    if (user.isLogin(player)) {
      methods.saveLog('AntiCheat', `${user.getRpName(player)} (${user.getId(player)}) - ${reason}`);
      chat.sendToAll(
        'Anti-Cheat System',
        `${user.getRpName(player)} (${user.getId(player)})!{${chat.clRed}} был кикнут с причиной!{${
          chat.clWhite
        }} ${reason}`,
        chat.clRed
      );
    }
  },

  freeze: function(player: PlayerMp, isFreeze: boolean) {
    if (!user.isLogin(player)) return;
    player.call('client:user:freeze', [isFreeze]);
  },

  disableAllControls: function(player: PlayerMp, disable: boolean) {
    if (!user.isLogin(player)) return;
    player.call('client:user:disableAllControls', [disable]);
  },

  addHistory: function(player: PlayerMp|number, type: number, reason: string) {
    if (typeof player != "number" && !user.isLogin(player)) return;

    let time = methods.getTimeWithoutSec();
    let date = methods.getDate();
    let rpDateTime = weather.getRpDateTime();
    let dateTime = time + ' ' + date;

    logPlayerEntity.create({
      user_id: typeof player != "number" ? user.getId(player) : player,
      datetime: `${rpDateTime} (( ${dateTime} ))`,
      type: type,
      do: reason,
    })
  },

  grab: function(player: PlayerMp, shopId: any) {
    if (!user.isLogin(player)) return;


    // if (user.get(player, 'fraction_id2') == 0) {
    //   player.notify('~r~Необходимо состоять в неоф. организации');
    //   return;
    // }

    // if (!business.isGang(user.get(player, 'fraction_id2'))){
    //   player.notify('~r~Необходимо состоять в неоф. организации с прокачкой до банды');
    //   return;
    // }

    if (!user.isGang(player) && !user.isMafia(player) && !business.isGang(user.get(player, 'fraction_id2'))) {
      player.notify('~r~Вы не можете грабить');
      return;
    }

    // if (user.isMafia(player)) {
    //   player.notify('~r~Вы состоите в мафии');
    //   return;
    // }

    // if (user.isGang(player)) {
    //   player.notify('~r~Вы состоите в банде');
    //   return;
    // }

    if (mp.players.length < 75) {
      player.notify('~r~Онлайн на сервере должен быть более 75 человек');
      return;
    }



    if (player.dimension != 0) {
      player.notify('~r~Нельзя грабить в виртуальном мире');
      return;
    }

    if (Container.Has(shopId, 'isGrabShop')) {
      player.notify('~r~Данный магазин уже ограблен');
      return;
    }

    if (Container.Has(shopId, 'isGrabGunShop')) {
      player.notify('~r~Магазин уже был ограблен');
      return;
    }

    const pos = new mp.Vector3(player.position.x, player.position.y, player.position.z)

    user.set(player, 'isGrabingShop', true);


    Container.Set(shopId, 'isGrabShop', true);
    user.playAnimation(player, 'anim@heists@money_grab@duffel', 'loop', 9);
    // user.disableAllControls(player, true);

    if (methods.getRandomInt(0, 1) == 0) {
      dispatcher.sendPos('Код 3', 'Всем патрулям, ограбление', pos, true, null, [2, 7, 3]);
      player.notify('~y~Сработала сигнализация');
    }

    setTimeout(function() {
      if (!user.isLogin(player)) return;
      if(methods.distanceToPos(pos, player.position) > 2){
        return player.notify("~r~Вы отошли слишком далеко")
      }
      user.isPlayAnimation(player, 'anim@heists@money_grab@duffel', 'loop').then(stas => {
        if(!stas) return player.notify("~r~Вы прервали анимацию")
        user.minigame(player, "gr6").then(status => {
          if(methods.distanceToPos(pos, player.position) > 2){
            player.notify("~r~Вы отошли слишком далеко")
          } else {
            user.reset(player, 'isGrabingShop');
            user.giveWanted(player, 4, 'Ограбление');
            const sum = methods.getRandomInt(4500, 5000)
            if (!player.bankgrabmoney) player.bankgrabmoney = 0;
            player.notify(`~g~Вы ограбили магазин на сумму $${sum}`)
            player.bankgrabmoney += sum;
            user.setComponentVariation(player, 5, 45, 0);
            if (user.isGang(player) || user.isMafia(player)){
              player.notify('~y~Теперь необходимо отнести сумку с деньгами в сейф фракции');
            } else {
              player.notify('~y~Теперь необходимо отмыть средства');
            }
          }
  
          // user.disableAllControls(player, false);
          user.stopAnimation(player);
  
          setTimeout(function() {
            Container.Set(shopId, 'isGrabGunShop', true);
          }, 1000 * 1000);
        })
      })
    }, 70 * 1000);
  },

  payDay: async function(player: PlayerMp) {
    // methods.debug('user.payDay');
    if (!mp.players.exists(player)) return false;
    if (!user.isLogin(player)) return false;
    // player.blocksave = true;
    // setTimeout(() => {
    //   if(mp.players.exists(player)) player.blocksave = false;
    // }, 20000)

    // Отыгранное время
    if (!player.played_time) player.played_time = 0;
    player.played_time++;

    // Опыт игрока
    let addExp = 1
    if (customParams.agex2) addExp++
    if (customParams.agex2new && user.getLevel(player) <= levelAccess.x2lvlNewPlayers) addExp++;
    let vipConfig = user.getVipStatusData(player);
    if(vipConfig){
      addExp+=vipConfig.expbonus
      if(vipConfig.givecoin > 0){
        userEntity.increment({ money_donate: vipConfig.givecoin }, { where: { id: user.getId(player)}})
      }
    }
    if (addExp > 5) addExp = 5
    user.setExp(player, user.getExp(player) + addExp);


    if (user.get(player, 'reg_time') <= 0 && user.get(player, 'reg_status') == 1)
      user.set(player, 'reg_status', 0);

    if (user.get(player, 'reg_time') <= 0 && user.get(player, 'reg_status') == 2) {
      user.set(player, 'reg_status', 3);
      player.notifyWithPicture(
        '323-555-0001',
        'Адвокат',
        'Поздравляю, Вы получили гражданство США.',
        'CHAR_BARRY',
        2
      );
    }




    if (user.getExp(player) >= user.getMaxExp(player)) {
      user.setExp(player, 0)
      user.setLevel(player, user.getLevel(player) + 1);

      const moneylevel = user.getLevel(player) * 200;
      bank.sendSmsBankOperation(
        player,
        'В честь достижения нового уровня ('+user.getLevel(player)+'), мы дарим Вам ~g~$'+moneylevel,
        'Новый уровень'
      );
      user.addCashMoney(player, moneylevel)


      if (user.getLevel(player) == 3 && user.get(player, 'referer') != '' && user.get(player, "exp_age") == 0) {
        user.addCashMoney(player, 25000);
        player.notify(`~g~Вы получили $25,000 по реферальной системе`);
        player.notify(
          `~g~Пригласивший ${user.get(player, 'referer')} получил 200ac на личный счёт`
        );
        userEntity.increment({ money_donate: 200 }, { where: { rp_name: user.get(player, 'referer') } })
        logReferrerEntity.create({
          name: user.getRpName(player),
          referrer: user.get(player, 'referer'),
          money: 200,
          timestamp: methods.getTimeStamp(),
        })
      }


      if (user.getLevel(player) == 3 && user.get(player, 'promocode') != '' && user.get(player, "exp_age") == 0) {
        player.notify(
          `~g~Вы получили ~s~$25000 ~g~по промокоду ~s~${user.get(player, 'promocode')}`
        );
        user.addCashMoney(player, 25000);
        userEntity.increment({ money_donate: 50 }, { where: { parthner_promocode: user.get(player, 'promocode') } })
      }
    }

    let money = 0;
    let moneyBonus = 0;
    const moneyMultipler = 9;
    let rank = (user.getPlayerFractionRank(player) > 14) ? 14 : user.getPlayerFractionRank(player);
    let fraction = user.getPlayerFraction(player);
    
    let lvladmin = user.getAdminLevel(player);
    let lvlhelper = user.get(player, 'helper_level');

    if(user.isAfk(player)){
      if(!user.isLogin(player)) return;
      return player.notify(`~r~Зарплату вы не получили, связи с тем, что вы AFK`)
    }
    if(!user.isAdmin(player)){
      if (user.isGang(player)){
        let countter = gangzones.filter(item => item.ownerid == fraction).length
        if(countter > 0){
          money += moneyPerTer * countter
          let givechest = false;
          moneyChests.forEach(item => {
            if (givechest) return;
            if (item.fraction == fraction){
              givechest = true;
              item.money += methods.parseInt((moneyPerTer * countter)*0.1);
              // item.save();
            }
          })
        }
      }
      if (user.isGos(player)){
        let ch = chest.pool.find(q => q.settings.fraction == fraction)
        if(ch) {
          if(ch.grabmoney > 0){
            let res = methods.parseInt(ch.grabmoney / 100);
            if (res > 3000) res = 3000;
            money += res;
          }
        }
        
      }
      if (user.isMafia(player)){
        for (let id in mafiaTerritoriesData) {
          let data1 = await Container.GetAll(containerMafiaTerritoryId + (parseInt(id) + 1));
          if (data1.get('mafiaWarownerId') == user.getPlayerFraction(player)){
            money += (rank*300 + 1500)
            // money += rank*400
          }
        }
      }
      let fractiondata = fractionUtil.getFraction(fraction)
      if (fractiondata) money += (fractiondata.moneybase + rank * fractiondata.moneymultipler);
    }

    
    if(customParams.gosx2) money*=2;


    if(user.get(player, 'is_old_money')){
      if (money == 0) money+=coffer.getMoneyOld()
      else player.notify('~r~Пенсионный фонд обнаружил у вас доходы, пенсии вам не видать');
    } else if(user.get(player, 'posob')){
      if (money == 0) money += coffer.getPosob()
      else player.notify('~r~Фонд социальной помощи обнаружил у вас доходы, пособия вам не видать');
    }

    if (customParams.fiveAndTenBonus){
      if (player.played_time == 5) moneyBonus += 50000, player.notify('~g~Вы получили бонус за 5 часов отыгранного времени');
      if (player.played_time == 10) moneyBonus += 50000, player.notify('~g~Вы получили бонус за 10 часов отыгранного времени');
    }

    if (lvladmin == 1) moneyBonus += 4000;
    if (lvladmin == 2) moneyBonus += 9000;
    if (lvladmin == 3) moneyBonus += 14000;
    if (lvladmin == 4) moneyBonus += 16000;
    if (lvladmin == 5) moneyBonus += 18000;

    if (lvlhelper == 1) moneyBonus += 150;
    else if (lvlhelper == 2) moneyBonus += 300;
    else if (lvlhelper == 3) moneyBonus += 450;


    if (vipConfig) {
      moneyBonus += vipConfig.moneybonus
    }

    if(money > 0 || moneyBonus > 0){
      let nalog = methods.parseInt((money / 100) * coffer.getNalog());
      money = methods.parseInt(money - nalog);
      if (user.get(player, 'bank_prefix') > 0) {
        user.addBankMoney(player, (money + moneyBonus));
      } else {
        user.addCashMoney(player, (money + moneyBonus));
        player.notify(`~r~Настоятельно рекомендуем оформить банковскую карту`)
      }
      bank.sendSmsBankOperation(player, `~g~~b~Сумма: ~g~$${money}${(!user.get(player, 'is_old_money') && money > 0) ? `\n~b~Налог: ~g~$${nalog} ~w~${coffer.getNalog()}%` : ``}${(moneyBonus > 0) ? `\n~b~Прибавка: ~g~$${moneyBonus}` : ``}`, 'Зачисление средств');
    }

    coffer.removeMoney(money + moneyBonus);

    return true;
  },
  getVipStatus: function (player: PlayerMp): vipName {
    //methods.debug('user.getVipStatus');
    return user.get(player, 'vip_status') == '' ? 'none' : user.get(player, 'vip_status');
  },

  /** Inventory Items methods */
  playDrugAnimation: function(player: PlayerMp) {
    //methods.debug('user.playDrugAnimation');
    if(!mp.players.exists(player)) return;
    player.setVariable('isBlockAnimation', true);
    user.playAnimation(player, 'move_m@drunk@transitions', 'slightly_to_idle', 8);
    setTimeout(() => {
      if (!mp.players.exists(player)) return;
      player.setVariable('isBlockAnimation', false);
    }, 5000)
  },

  /**
        Drug Types
        - Amf 0
        - Coca 1
        - Dmt 2
        - Ket 3
        - Lsd 4
        - Mef 5
        - Marg 6
    */
  addDrugLevel: function(player: PlayerMp, drugType: any, level: any) {
    if (user.isLogin(player)) player.call('client:user:addDrugLevel', [drugType, level]);
  },

  removeDrugLevel: function(player: PlayerMp, drugType: any, level: any) {
    if (user.isLogin(player)) player.call('client:user:removeDrugLevel', [drugType, level]);
  },

  setDrugLevel: function(player: PlayerMp, drugType: any, level: any) {
    if (user.isLogin(player)) player.call('client:user:setDrugLevel', [drugType, level]);
  },
  getWaterLevel: function(player: PlayerMp): number {
    return user.get(player, 'water_level');
  },

  stopAllScreenEffects: function(player: PlayerMp) {
    if (user.isLogin(player)) player.call('client:user:stopAllScreenEffects');
  },

  playEatAnimation: function(player: PlayerMp) {
    user.playAnimation(player, 'mp_player_inteat@burger', 'mp_player_int_eat_burger', 48);
  },
  addEatLevel: function(player: PlayerMp, level: number) {
    if (level > 100) {
      user.setEatLevel(player, 110);
      return true;
    }
    if (user.getEatLevel(player) + level > 100) {
      user.setEatLevel(player, 100);
      return true;
    }
    user.setEatLevel(player, user.getEatLevel(player) + level);
    return true;
  },

  removeEatLevel: function(player: PlayerMp, level: number) {
    if (user.getEatLevel(player) - level < 0) {
      user.setEatLevel(player, 0);
      return true;
    }
    user.setEatLevel(player, user.getEatLevel(player) - level);
    return true;
  },

  setEatLevel: function(player: PlayerMp, level: number) {
    user.set(player, 'eat_level', level);
    return true;
  },

  getEatLevel: function(player: PlayerMp): number {
    return user.get(player, 'eat_level');
  },

  // Drink

  playDrinkAnimation: function(player: PlayerMp) {
    user.playAnimation(player, 'mp_player_intdrink', 'loop_bottle', 48);
  },

  // Drink

  giveJobSkill: function(player: PlayerMp) {
    if (user.isLogin(player)) {
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

      if (user.has(player, 'skill_' + job)) {
        let currentSkill = user.get(player, 'skill_' + job);
        if (currentSkill >= skillCount)
            return;

        if (currentSkill == skillCount - 1) {
            user.set(player, 'skill_' + job, skillCount);
            methods.getSkillCountPlayers(job, currentSkill, function (count) {
                if (count < 3) {
                    chat.sendToAll('Конкурс', `${user.getRpName(player)} !{${chat.clBlue}} стал одним из лучших работников штата San Andreas, получив вознаграждение $10,000`, chat.clBlue);
                    user.addMoney(player, 10000);
                }
            });
        }
        else {
            user.set(player, 'skill_' + job, currentSkill + 1);
          let vipData = user.getVipStatusData(player)
          if (vipData) {
            if (vipData.skilljobbonus > 0 && user.get(player, 'skill_' + job) && user.get(player, 'skill_' + job) % vipData.skilljobbonus === 0) user.set(player, 'skill_' + job, user.get(player, 'skill_' + job) + 1);
          }
            player.notify('~g~Навык вашей профессии был повышен');
        }
      }
    }
  },

  // Water Level

  addWaterLevel: function(player: PlayerMp, level: number) {
    //methods.debug('user.addWaterLevel');
    if (level > 100) {
      user.setWaterLevel(player, 110);
      return true;
    }
    if (user.getWaterLevel(player) + level > 100) {
      user.setWaterLevel(player, 100);
      return true;
    }
    user.setWaterLevel(player, user.getWaterLevel(player) + level);
    return true;
  },

  removeWaterLevel: function(player: PlayerMp, level: number) {
    if (user.getWaterLevel(player) - level < 0) {
      user.setWaterLevel(player, 0);
      return true;
    }
    user.setWaterLevel(player, user.getWaterLevel(player) - level);
    return true;
  },

  setWaterLevel: function(player: PlayerMp, level: number) {
    user.set(player, 'water_level', level);
    return true;
  },

  /** Adrenalin */
  useAdrenaline: function(player: PlayerMp) {
    //methods.debug('user.useAdrenaline');
    if (!mp.players.exists(player)) return false;
    user.revive(player);
    // Нужно как-то очищать скрин эффект Заглушечка
    // Dispatcher // Нужно ли это тут?
  },
  checkCanHandCuff: (player:PlayerMp, target:PlayerMp) => {
    if (!user.isLogin(player)) return false;
    if (!user.isLogin(target)) return false;
    if (user.isCuff(target)) {
      player.notify('~r~Игрок уже в наручниках');
      return false;
    }
    if (user.isCuff(player) || user.isTie(player)) {
      player.notify("~r~Вы в наручниках либо связаны");
      return false;
    }
    if(target.vehicle){
      player.notify("~r~Нельзя надевать наручники на человека в транспорте");
      return;
    }
    if (target.health == 0) {
      player.notify("~r~Нельзя надевать наручники на человека в коме");
      return false;
    }
    if (player.health == 0) {
      player.notify("~r~Вы в коме");
      return false;
    }
    if (player.vehicle) {
      player.notify("~r~Нельзя надевать наручники на человека в транспорте");
      return false;
    }
    if(target.inGreenZone && !user.isGosPD(player)){
      player.notify("~r~Нельзя надевать наручники на человека в зелёной зоне");
      return false;
    }
    if(!user.isGosPD(player) && !user.isMafia(player) && !user.isGang(player)){
      player.notify("~r~Вы не можете пользоваться наручниками");
      return false;
    }
    if(user.isInMp(target) && target.dimension != 0){
      player.notify("~r~В данном месте нельзя надевать наручники");
      return false;
    }
    return true;
  },

  /** Cuff system */
  cuff: function(player: PlayerMp) {
    //methods.debug('user.cuff');
    if (!mp.players.exists(player)) return false;
    if(user.isCuff(player)) return;
    user.unEquipAllWeapons(player);
    player.setVariable('isCuff', true);
    user.playAnimation(player, 'mp_arresting', 'idle', 49);
    player.call('client:handcuffs', [true]);
    player.setVariable('isBlockAnimation', true);
    inventory.updateInventory(player)
  },

  unCuff: function(player: PlayerMp) {
    //methods.debug('user.unCuff');
    if (!mp.players.exists(player)) return false;
    player.call('client:handcuffs', [false]);
    player.setVariable('isBlockAnimation', false);
    player.setVariable('isCuff', false);
    player.setVariable('cuffedByGos', false);

    player.call('client:user:stopAnimation');
    user.stopSyncAnimation(player);
    inventory.updateInventory(player)
  },

  isCuff: function(player: PlayerMp) {
    //methods.debug('user.isCuff');
    if (!mp.players.exists(player)) return false;
    return player.getVariable('isCuff') === true;
  },
  tie: function(player: PlayerMp) {
    //methods.debug('user.tie');
    if (!mp.players.exists(player)) return false;
    user.playAnimation(player, 'mp_arresting', 'idle', 49);
    player.call('client:handcuffs', [true]);
    user.unEquipAllWeapons(player);
    player.setVariable('isTie', true);
    player.setVariable('isBlockAnimation', true);
    //methods.playerDisableAllControls(player, true);

    player.notify('~r~Вас связали');
  },

  isTie: function(player: PlayerMp) {
    //methods.debug('user.isTie');
    if (!mp.players.exists(player)) return false;
    return player.getVariable('isTie') === true;
  },

  unTie: function(player: PlayerMp) {
    //methods.debug('user.unTie');
    if (!mp.players.exists(player)) return false;
    player.call('client:handcuffs', [false]);
    player.setVariable('isTie', false);
    player.setVariable('isBlockAnimation', false);
    methods.playerDisableAllControls(player, false);
  },

  tieBandage: function(player: PlayerMp) {
    //methods.debug('user.tieBandage');
    if (!mp.players.exists(player)) return false;
    player.setVariable('isTieBandage', true);
    player.notify('~r~На вас надели повязку');
  },

  unTieBandage: function(player: PlayerMp) {
    //methods.debug('user.unTieBandage');
    if (!mp.players.exists(player)) return false;
    player.setVariable('isTieBandage', false);
    player.notify('~g~С вас сняли повязку');
  },

  //* Interface

  setGui: (player: PlayerMp, gui: string | null) => {
    if(!mp.players.exists(player)) return;
    player.call('client:gui:set', [gui]);
  },

  alert: (player: PlayerMp, text: string, type?: 'success'|'info'|'warning'|'error', img?: string) => {
    if(!mp.players.exists(player)) return;
    mp.events.triggerBrowser(player, 'cef:alert:setAlert', type, escape(text), img);
  },

  bigAlert: (player: PlayerMp, text: string, type?: 'success'|'info'|'warning'|'error', time = 5000) => {
    if(!mp.players.exists(player)) return;
    mp.events.triggerBrowser(player, 'cef:alert:setBigAlert', type, escape(text), time);
  },

  setHelp: (player: PlayerMp, text: string) => {
    if(!mp.players.exists(player)) return;
    mp.events.triggerBrowser(player, 'cef:alert:setHelp', escape(text));
  },

  setHelpKey: (player: PlayerMp, key: string, text: string, time?:number) => {

    if(!mp.players.exists(player)) return;
    mp.events.triggerBrowser(player, 'cef:alert:setHelpKey', key, escape(text));
    if(!time) return;
    setTimeout(() => {
      user.removeHelpKey(player)
    }, time)
  },

  removeHelpKey: (player: PlayerMp) => {
    if(!mp.players.exists(player)) return;
    mp.events.triggerBrowser(player, 'cef:alert:removeHelpKey');
  },
  fullHeal: (player:PlayerMp, pay = true) => {
    if(!mp.players.exists(player)) return;
    user.healProtect(player)
    if(player.health == 0){
      player.spawn(new mp.Vector3(player.position.x, player.position.y, player.position.z));
    }
    player.health = 100;
    user.set(player, "med_time", 0);
    player.call('client:medTimerFree', [pay]);
  }
};

export function banUser(player:PlayerMp,id:number,name:string,lvl:number, reason:string){
  if(!mp.players.exists(player)) return;
  if(user.getAdminLevel(player) < 2) return player.notify("~r~У вас нет доступа к бану игроков")
  let target = user.getPlayerById(id);
  let block = menu.new(player, `Бан пользователя`, `${name} (${id}) ${target ? 'Online':'Offline'}`);
  let month = 0;
  let days = 0;
  let hours = 0;

  block.newItem({name: "Количество месяцев",type: "range", rangeselect: [0, 56],onchange: (value) => month = value})
  block.newItem({name: "Количество дней",type: "range", rangeselect: [0, 31], onchange: (value) => days = value})
  block.newItem({name: "Количество часов",type: "range", rangeselect: [0, 24], onchange: (value) => hours = value})


  block.newItem({name: "~r~Забанить",type: "select", onpress: () => {
    let time = (hours * 60 * 60) + (days * 60 * 60 * 24) + (month * 60 * 60 * 24 * 30);
    if(time <= 0) return player.notify("~r~Время не указано");
    let timetype = month > 0 ? `m` : days > 0 ? 'd' : 'h'
    let timetext = month > 0 ? month : days > 0 ? days : hours
    user.banuser(target ? target : id, player, time, reason, true, timetype, timetext)
  }
  });

  block.newItem({name: "Назад",type: "select", onpress: () => workUser(player, id, name, lvl)});

  block.open();
}

export async function workUser(player:PlayerMp,id:number,name?:string,lvl?:number){
  if(!mp.players.exists(player)) return;
  let target = user.getPlayerById(id);
  if(!name || typeof lvl != "number"){
    if(mp.players.exists(target)){
      name = user.getRpName(target)
      lvl = user.getAdminLevel(target);
    } else {
      let data = await user.getUserDataFromDB(id);
      if(!data) return;
      name = data.rp_name
      lvl = data.admin_level;
    }
    workUser(player, id, name, lvl)
    return;
  }
  if (methods.isTestServer() && !user.isAdminNow(player) && target){
    let block = menu.new(player, `Действие`);
    block.newItem({
      name: "ТП к игроку",
      onpress: () => {
        if(target.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~К данному администратору нельзя телепортироваться`);
        user.teleportVeh(player, target.position.x, target.position.y, target.position.z + 3)
        player.dimension = target.dimension
        if (player.vehicle) player.vehicle.dimension = target.dimension
      }
    })
    block.open()
    return;
  }
  let adminLvl = user.getAdminLevel(player)
  if(!user.isAdminNow(player)) return player.notify("Действия доступны только администраторам");
  
  let block = menu.new(player, `Действие`, `${name} (${id}) ${target ? 'Online':'Offline'}`);
  if(target){
    if(adminLvl > lvl) block.newItem({
      name: "Кикнуть",
      onpress: () => {
        if(lvl > 0) return workUser(player, id, name, lvl), player.notify("Нельзя кикнуть администратора");
        menu.input(player, "Введите причину (3 симв. минимум)").then(res => {
          if(!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
          user.kick(target, res, 'Кикнут администратором');
          user.loginterract(player, target, "AdminJob", "Кикнул")
          player.notify("Игрок кикнут");
        })
      }
    })
    block.newItem({
      name: "Снять/Надеть наручники",
      onpress: () => {
        if(mp.players.exists(target)){
          if(user.isCuff(target)){
            user.unCuff(target)
          } else {
            user.cuff(target)
          }
        } else {
          player.notify('~r~Игрок покинул сервер')
        }
      }
    })
    block.newItem({
      name: "ТП к игроку",
      onpress: () => {
        if (target.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~К данному администратору нельзя телепортироваться`);
        user.teleportVeh(player, target.position.x, target.position.y, target.position.z+3)
        player.dimension = target.dimension
        if(player.vehicle) player.vehicle.dimension = target.dimension
        user.loginterract(player, target, "AdminJob", "Телепортировался к игроку")
      }
    })
    block.newItem({
      name: "ТП игрока",
      onpress: () => {
        if (target.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~Данного администратора нельзя телепортировать`);
        user.teleportVeh(target, player.position.x, player.position.y, player.position.z)
        target.dimension = player.dimension
        if(target.vehicle) target.vehicle.dimension = player.dimension
        user.loginterract(player, target, "AdminJob", "Телепортировал игрока")
      }
    })
    block.newItem({
      name: "Проследить",
      onpress: () => {
        if (target.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~За данным администратором нельзя наблюдать`);
        user.startSpectate(player, target)
      }
    })
    block.newItem({
      name: "~y~Выйти из слежки у текущего игрока",
      onpress: () => user.stopSpectate(player, target)
    })
    block.newItem({
      name: "~y~Остановить текущую слежку",
      onpress: () => user.stopSpectate(player)
    })
    if(user.isAdminNow(player, 5)){
      block.newItem({
        name: "~g~50% армор",
        onpress: () => {
          target.armour = 50;
          user.loginterract(player, target, "AdminJob", "Выдал 50% армор")
        }
      })
      block.newItem({
        name: "~g~100% армор",
        onpress: () => {
          target.armour = 100;
          user.loginterract(player, target, "AdminJob", "Выдал 100% армор")
        }
      })
    }
    block.newItem({
      name: "~g~Исцелить",
      onpress: () => {
        user.fullHeal(target);
        user.loginterract(player, target, "AdminJob", "Исцелил")
      }
    })
    block.newItem({
      name: "~r~Убить",
      onpress: () => {
        target.health = 0;
        user.loginterract(player, target, "AdminJob", "Убил")
      }
    })
    block.newItem({
      name: "~y~Сохранить игрока в БД",
      desc: "Необходимо для просмотра актуальных данных на сайте",
      onpress: () => {
        if(mp.players.exists(target)) return;
        if(player.spamProtect) return player.notify("~r~Не спамьте этой кнопкой")
        player.spamProtect = true;
        setTimeout(() => {
          if(mp.players.exists(player))
          player.spamProtect = false;
        }, 5000)
        user.saveAccount(target);
        user.loginterract(player, target, "AdminJob", "Принудительно сохранил игрока в базе данных")
      }
    })
    if(adminLvl >= 4){
      if(target){
        block.newItem({
          name: "Выдать офф фракцию",
          more: user.getPlayerFractionName(target),
          onpress: () => {
            menu.selectFraction(player).then(fract => {
              if(fract == null) return;
              user.loginterract(player, target, "AdminJob", "Выдал фракцию "+fract)
              user.set(target, "fraction_id", fract);
              user.set(target, "rank", 1);
              methods.saveLog('adminJob', user.getId(player)+" выдал фракцию "+fract+" пользователю "+user.getId(target));
              user.updateClientCache(target);
              player.notify("~g~Фракция установлена")
              user.saveAccount(target)
              return workUser(player, id, name, lvl)
            })
          }
        })
        if (user.getPlayerFraction(target)){
          block.newItem({
            name: "Ранг офф фракции",
            more: `${user.getRankName(user.getPlayerFraction(target), user.getPlayerFractionRank(target))} [${user.getPlayerFractionRank(target)}]`,
            onpress: () => {
              if (!user.getPlayerFraction(target)) return workUser(player, id, name, lvl) ;
              let fractionranks = fractionUtil.getFractionRanks(user.getPlayerFraction(target));
              menu.selector(player, "Выберите ранг", ["~r~Отмена", ...fractionranks], true).then(rank => {
                if (!rank) return workUser(player, id, name, lvl)
                user.set(target, 'rank', rank);
                player.notify(`~g~Успешно`);
                user.updateClientCache(target);
                user.saveAccount(target)
                methods.saveLog('adminJob', user.getId(player) + " выдал ранг " + rank + " пользователю " + user.getId(target));
                return workUser(player, id, name, lvl)
              })
            }
          })
        }
      }

    }
    if(adminLvl > 5){
      
      block.newItem({
        name: "~o~VIP Статус",
        desc: (user.getVipStatusData(target) ? user.getVipStatusData(target).name + " до " + methods.unixTimeStampToDateTime(user.get(target, 'vip_time')) : "~r~Нет"),
        onpress: () => {
          menu.selector(player, "Выберите VIP", ["~r~Отмена","~b~Снять",...vipStatus.data.filter(item => !item.switch).map(item => {return item.name})], true).then(vipid => {
            if (typeof vipid != "number" || !vipid) return workUser(player, id, name, lvl);
            if (vipid == 1){
              user.accept(player, 'Снять випку?').then(status => {
                if (!status) return workUser(player, id, name, lvl);
                if(!user.getVipStatusData(target)){
                  player.notify('~r~У игрока нет ВИП статуса')
                  return workUser(player, id, name, lvl);
                }
                user.loginterract(player, target, "AdminJob", "Снял вип статус "+user.getVipStatusData(target).name)
                user.clearVipStatus(target);
                player.notify('~g~Вы сняли VIP статус')
                workUser(player, id, name, lvl);
              })
              return;
            }
            vipid-=2;
            let vipcfg = vipStatus.data.filter(item => !item.switch)[vipid];
            user.accept(player, "Выдать "+vipcfg.name+"?").then(status => {
              if (!status) return workUser(player, id, name, lvl);
              menu.input(player, "Введите количество дней", "30", 6, "int").then(m => {
                let days = methods.parseInt(m);
                if (isNaN(days) || days < 0) return player.notify("Срок указан не верно")
                user.loginterract(player, target, "AdminJob", "Выдал випку " + vipcfg.name + " на " + days)
                player.notify("Випка выдана")
                workUser(player, id, name, lvl)
                user.giveVipStatus(target, vipcfg.id, days)
              })
            })
          })
        }
      })
      block.newItem({
        name: "~o~Уровень",
        desc: "~g~"+user.getLevel(target),
        onpress: () => {
          menu.input(player, "Введите уровень", user.getLevel(target).toString()).then(m => {
            let money = methods.parseInt(m);
            if(isNaN(money) || money < 0) return player.notify("Новый баланс указан не верно")
            user.loginterract(player, target, "AdminJob", "Выдал уровень "+money)
            user.setLevel(target, money);
            player.notify("Баланс установлен")
            workUser(player, id, name, lvl)
          })
        }
      })
      block.newItem({
        name: "~b~Гражданство",
        desc: "~g~" + user.getRegStatusName(target),
        onpress: () => {
          let list = ["~r~Нет", "временная", "получение гражданства", "гражданство США"]
          let submenu = menu.new(player, "Выберите новый статус");
          list.map((q, ind) => {
            submenu.newItem({
              name: q,
              onpress: () => {
                workUser(player, id, name, lvl)
                if(!mp.players.exists(target)) return player.notify(`~r~Игрок покинул сервер`);
                user.set(target, 'reg_status', ind)
                user.updateClientCache(target);
                player.notify('~g~Статус изменён');
              }
            })
          })
          submenu.open();
          menu.input(player, "Введите уровень", user.getLevel(target).toString()).then(m => {
            let money = methods.parseInt(m);
            if(isNaN(money) || money < 0) return player.notify("Новый баланс указан не верно")
            user.loginterract(player, target, "AdminJob", "Выдал уровень "+money)
            user.setLevel(target, money);
            player.notify("Баланс установлен")
            workUser(player, id, name, lvl)
          })
        }
      })
      
      block.newItem({
        name: "~o~Фишки казино",
        desc: "~g~"+user.getChips(target),
        onpress: () => {
          menu.input(player, "Введите баланс", user.getChips(target).toString()).then(m => {
            let money = methods.parseInt(m);
            if(isNaN(money) || money < 0) return player.notify("Новый баланс указан не верно")
            user.loginterract(player, target, "AdminJob", "Выдал "+(user.getMoney(target)-money)+" фишек казино ")
            methods.saveLog('adminJob', user.getId(player)+" выдал "+(user.getMoney(target)-money)+" фишек казино "+user.getId(target));
            user.setChips(target, money);
            player.notify("Баланс установлен")
            workUser(player, id, name, lvl)
          })
        }
      })
      block.newItem({
        name: "~o~Баланс",
        desc: "$~g~"+user.getMoney(target),
        onpress: () => {
          menu.input(player, "Введите баланс", user.getMoney(target).toString()).then(m => {
            let money = methods.parseInt(m);
            if(isNaN(money) || money < 0) return player.notify("Новый баланс указан не верно")
            user.loginterract(player, target, "AdminJob", "Выдал "+(user.getMoney(target)-money)+"$ на руки ")
            methods.saveLog('adminJob', user.getId(player)+" выдал "+(user.getMoney(target)-money)+"$ на руки "+user.getId(target));
            user.setMoney(target, money);
            player.notify("Баланс установлен")
            workUser(player, id, name, lvl)
          })
        }
      })
      block.newItem({
        name: "~o~Банковский баланс",
        desc: "$~g~"+user.getBankMoney(target),
        onpress: () => {
          menu.input(player, "Введите баланс", user.getBankMoney(target).toString()).then(m => {
            let money = methods.parseInt(m);
            if(isNaN(money) || money < 0) return player.notify("Новый баланс указан не верно")
            user.loginterract(player, target, "AdminJob", "Выдал "+(user.getMoney(target)-money)+"$ на банк ")
            methods.saveLog('adminJob', user.getId(player)+" выдал "+(user.getMoney(target)-money)+"$ в банк "+user.getId(target));
            user.setBankMoney(target, money);
            player.notify("Баланс установлен")
            workUser(player, id, name, lvl)
          })
        }
      })
      if(adminLvl >= 6){
        block.newItem({
          name: `~r~Выдать PayDay`,
          onpress: () => {
            user.payDay(target);
            player.notify(`~g~PayDay выдан`)
            user.loginterract(player, target, "AdminJob", "Выдал PayDay")
          }
        })
        block.newItem({
          name: `~b~Уровень админки (${user.getAdminLevel(target)})`,
          onpress: () => {
            menu.input(player, "Введите уровень (0-5)", user.getAdminLevel(target).toString()).then(m => {
              let lvl = methods.parseInt(m);
              if(isNaN(lvl) || lvl < 0 || lvl > 6 || (lvl > 5 && !methods.isTestServer())) return player.notify("Уровень указан не верно")
              user.loginterract(player, target, "AdminJob", "Выдал админку "+lvl)
              methods.saveLog('adminJob', user.getId(player)+" выдал админку "+lvl+" "+user.getId(target));
              user.setAdminLevel(target, lvl);
              player.notify("Уровень админки установлен")
              workUser(player, id, name, lvl)
            })
          }
        })
        block.newItem({
          name: `~b~Уровень хелперки (${user.getHelperLevel(target)})`,
          onpress: () => {
            menu.input(player, "Введите уровень (0-3)", user.getHelperLevel(target).toString()).then(m => {
              let lvl = methods.parseInt(m);
              if(isNaN(lvl) || lvl < 0 || lvl > 3) return player.notify("Уровень указан не верно")
              user.loginterract(player, target, "AdminJob", "Выдал хелперку "+lvl)
              methods.saveLog('adminJob', user.getId(player)+" выдал хелперку "+lvl+" "+user.getId(target));
              user.setHelperLevel(target, lvl);
              player.notify("Уровень хелперки установлен")
              workUser(player, id, name, lvl)
            })
          }
        })
      }
    }
    if(lvl == 0) block.newItem({
      name: "Выдать мут текстового чата",
      onpress: () => {
        menu.input(player, "Введите причину (3 симв. минимум)").then(res => {
          if(!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
          menu.input(player, "Введите количество минут").then(m => {
            let minute = methods.parseInt(m);
            if(isNaN(minute) || minute < 0) return player.notify("Количество минут указано не верно")
            user.mutePlayer(target, player, minute, "chat", res)
            user.loginterract(player, target, "AdminJob", "Выдал мут текстового чата на "+minute)
            player.notify("Мут выдан");
            userList(player)
          })
        })
      }
    })
    if(lvl == 0) block.newItem({
      name: "Выдать мут голосового чата",
      onpress: () => {
        menu.input(player, "Введите причину (3 симв. минимум)").then(res => {
          if(!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
          menu.input(player, "Введите количество минут").then(m => {
            let minute = methods.parseInt(m);
            if(isNaN(minute) || minute < 0) return player.notify("Количество минут указано не верно")
            user.mutePlayer(target, player, minute, "voice", res)
            user.loginterract(player, target, "AdminJob", "Выдал мут голосового чата на "+minute)
            player.notify("Мут выдан");
            userList(player)
          })
        })
      }
    })
    block.newItem({
      name: "Снять мут текстового чата",
      onpress: () => {
        user.unmutePlayer(target, "chat");
        player.notify("Мут снят");
        user.loginterract(player, target, "AdminJob", "Снял мут текстового чата")
      }
    })
    block.newItem({
      name: "Снять мут голосового чата",
      onpress: () => {
        user.unmutePlayer(target, "voice");
        player.notify("Мут снят");
        user.loginterract(player, target, "AdminJob", "Снял мут голосового чата")
      }
    })
  }
  block.newItem({
    name: "Транспорт игрока",
    onpress: () => {
      const q = () => {
        carsEntity.findAll({where: {id_user:id}}).then(cars => {
          let submenu = menu.new(player, "Список транспорта");
          cars.map(car => {
            let excar = mp.vehicles.toArray().find(veh => veh.dbid == car.id);
            submenu.newItem({
              name: `(${car.id}) ${car.name}`,
              more: car.number,
              desc: excar ? "~g~На сервере" : "~r~Не на сервере", 
              onpress: () => {
                excar = mp.vehicles.toArray().find(veh => veh.dbid == car.id);
                let submenu2 = menu.new(player, "Действия", `(${car.id}) ${car.name} | ${car.number}`);
                submenu2.onclose = () => {q();}
                submenu2.newItem({
                  name: "Багажник",
                  onpress: () => {
                    excar = mp.vehicles.toArray().find(veh => veh.dbid == car.id);
                    if (user.getAdminLevel(player) < 5) return player.notify(`~r~Вы не можете удалённо просматривать инветарь ТС`);
                    if (excar) return player.notify(`~r~ТС на сервере, используйте обычный метод доступа к инвентарю`)
                    menu.close(player);
                    inventory.openInventory(player, 8, methods.convertNumberToHash(car.number));
                  }
                })
                submenu2.newItem({
                  name: "ТП машины к себе",
                  onpress: () => {
                    excar = mp.vehicles.toArray().find(veh => veh.dbid == car.id);
                    if (!excar) return player.notify(`~r~ТС не на сервере`)
                    try {
                      methods.teleportVehicle(excar, player.position, player.heading - 90, player.dimension)
                    } catch (error) {
                      console.error(error)
                    }
                  }
                })
                submenu2.open();
              }
            })
          })
          submenu.open()
        })
      }
      q();
    }
  })
  
  if(user.getAdminLevel(player) >= 5){
    block.newItem({
      name: "~b~Заглянуть в инвентарь",
      onpress: () => {
        if(target) return player.notify(`~r~Игрок в сети, используйте обычный метод доступа к инвентарю`)
        menu.close(player);
        inventory.openInventory(player, 1, id)
      }
    })
  }
  if(adminLvl > lvl) block.newItem({
    name: "Забанить",
    onpress: () => {
      if (user.getAdminLevel(player) == 1){
        if(mp.players.toArray().find(t => user.getAdminLevel(t) > 1)) return player.notify(`~r~Забанить игрока на вашем уровне админки можно только тогда когда нет админов более высокого уровня`);
        else player.notify(`~g~В связи с тем что в сети нет админов более высокого уровня вам временно предоставлен доступ к бану игроков`);
      }
      if(lvl > 0) return workUser(player, id, name, lvl), player.notify("Нельзя забанить администратора");
      menu.input(player, "Введите причину (3 симв. минимум)").then(res => {
        if(!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
        banUser(player, id, name, lvl, res);
      })
    }
  })
  let warns = await user.getActiveWarns(id);
  let warnsall = await user.getAllWarns(id);
  if(warns.length > 0 && adminLvl > lvl){
    block.newItem({
      name: "Активные варны",
      more: warns.length + " шт",
      onpress: () => {
        let submenu = menu.new(player, "Список активных варнов");
        warns.map(itm => {
          submenu.newItem({
            name: `ID: ${itm.id} | ${methods.unixTimeStampToDateTime(itm.timestamp)}`,
            more: itm.admin,
            desc: itm.reason,
            onpress: () => {
              if (user.getAdminLevel(player) <= 4) return player.notify(`~r~Удаление доступно только администраторам 5+ ЛВЛ`)
              user.accept(player, "Удалить?").then(status => {
                if(status){
                  user.loginterract(player, target, "AdminJob", `Удалил варн ${itm.id}, выдал ${itm.admin} до ${methods.unixTimeStampToDateTime(itm.timestamp)} с причиной ${itm.reason}`)
                  itm.destroy();
                }
                workUser(player, id, name, lvl)
              })
            }
          })
        })
        submenu.open();
      }
    })
  }
  if (user.getAdminLevel(player) > 5){
    let coins = await user.getCoins(id)
    block.newItem({
      name: "~o~Коины",
      more: "~g~" + coins,
      onpress: () => {
        menu.input(player, "Введите количество коинов", coins.toString()).then(m => {
          let money = methods.parseInt(m);
          if (isNaN(money) || money < 0) return player.notify("Новый баланс указан не верно")
          user.loginterract(player, id, "AdminJob", "Установил значение коинов " + money)
          user.setCoins(id, money);
          player.notify("Баланс установлен")
          workUser(player, id, name, lvl)
        })
      }
    })
  }
  if (warnsall.length > 0 && user.getAdminLevel(player) > 5 && adminLvl > lvl){
    block.newItem({
      name: "Все варны",
      more: warnsall.length+" шт",
      onpress: () => {
        let submenu = menu.new(player, "Список всех варнов");
        warns.map(itm => {
          submenu.newItem({
            name: (itm.timestamp > methods.getTimeStamp() ? "~r~[АКТИВНЫЙ] " : "~g~[ИСТЁК] ")+methods.unixTimeStampToDateTime(itm.timestamp),
            more: itm.admin,
            desc: itm.reason,
            onpress: () => {
              user.accept(player, "Удалить?").then(status => {
                if(status) itm.destroy();
                workUser(player, id, name, lvl)
              })
            }
          })
        })
        submenu.open();
      }
    })
  }
  block.newItem({
    name: "Выдать предупреждение",
    more: `Активных: [${warns.length}/3]`,
    onpress: () => {
      if(user.getAdminLevel(player) <= 1 || adminLvl <= lvl) return player.notify(`~r~Вы не можете выдать предупреждение`), workUser(player, id, name, lvl)
      if(warns.length >= 3) return player.notify(`~r~Количество предупреждение больше либо превышает 3`), workUser(player, id, name, lvl)
      menu.input(player, "Введите причину (3 симв. минимум)").then(res => {
        if(!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
        user.warn(id, res, "Администратор "+user.getRpName(player), 7)
        player.notify("~g~Предупреждение выдано")
        user.loginterract(player, id, "AdminJob", "Выдал предупреждение игроку: "+res)
      })
    }
  })
  block.newItem({
    name: "Разбанить",
    onpress: () => {
      menu.input(player, "Введите причину (3 симв. минимум)", '[Разбанен] ').then(res => {
        if (!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
        user.unbanuser(id, player, res);
        user.loginterract(player, id, "AdminJob", "Разбанил игрока")
      })
      
    }
  })
  if(lvl == 0) block.newItem({
    name: "Посадить в тюрьму",
    onpress: () => {
      if(lvl > 0) return workUser(player, id, name, lvl), player.notify("Нельзя посадить в тюрьму администратора");
      menu.input(player, "Введите причину (3 симв. минимум)").then(res => {
        if(!res || res.length < 3) return workUser(player, id, name, lvl), player.notify("Причина не указана");
        menu.input(player, "Введите количество минут").then(m => {
          let minute = methods.parseInt(m);
          if(isNaN(minute) || minute < 0) return player.notify("Количество минут указано не верно")
          if(target){
            user.fullHeal(target);
            setTimeout(() => {
              user.arrestAdmin(id, player, minute, res, name)
            }, 1000)
          } else {
            user.arrestAdmin(id, player, minute, res, name)
          }
          userList(player)
        })
      })
    }
  })
  block.newItem({
    name: "Освободить из тюрьмы",
    onpress: () => {
      user.arrestAdmin(id, player, 0, "Освобождён")
      player.notify("Игрок освобождён");
      userList(player)
      user.loginterract(player, id, "AdminJob", "Освободил из тюрьмы")
    }
  })
  if(adminLvl > 5){
    block.newItem({
      name: "Выдать предмет по ID",
      onpress: () => {
        menu.input(player, "Введите ID предмета").then(m => {
          let itemq = methods.parseInt(m);
          if(isNaN(itemq) || itemq < 0) return player.notify("~r~ID предмета указан не верно"), workUser(player, id, name, lvl)
          if(items.getItemNameById(itemq) == "UNKNOWN") return player.notify(`~r~Такого предмета не существует`), workUser(player, id, name, lvl)
          user.accept(player, "Выдать "+items.getItemNameById(itemq)+"?").then(status => {
            if(!status) return workUser(player, id, name, lvl);
            menu.input(player, "Введите количество", "1", 5, "int").then(count => {
              if(!count) return player.notify(`~r~Количество указанно не верно`), workUser(player, id, name, lvl)
              if(count > 50) return player.notify(`~r~Количество не более 50`), workUser(player, id, name, lvl)
              inventory.createManyItem(itemq, 0, 1, id, count)
              user.loginterract(player, id, "AdminJob", "Выдал предмет "+items.getItemNameById(itemq)+" x"+count)
              workUser(player, id, name, lvl)
            })
          })

        });
      }
    })
    block.newItem({
      name: "Выдать оружие",
      onpress: () => {
        menu.selector(player, "Выберите оружие", weaponsUtil.hashesMap.map(([name, hashhalh]) => name), true).then(async ids => {
          if (typeof ids !== "number") return workUser(player, id, name, lvl);
          let weapon = weaponsUtil.hashesMap[ids];
          let ammo = await menu.input(player, "Количество патронов", "100", 10, "int");
          if (!ammo || ammo < 1) return player.notify(`~r~Количество патронов указано не верно`), workUser(player, id, name, lvl);
          user.giveWeaponByHash(player, mp.joaat("WEAPON_"+weapon[0].toUpperCase()), ammo)
          player.notify('~g~Оружие выдано');
          return workUser(player, id, name, lvl);
        });
      }
    })
    if(target){
      block.newItem({
        name: "Сделать владельцем имущества",
        onpress: () => {
          let list = ["Дом", "Склад", "Квартира", "Апартаменты"];
          menu.selector(player, "Выберите тип", list, true).then(ids => {
            if(ids == null) return;
            let itq = (ids == 0) ? houses : (ids == 1) ? stock : (ids == 2) ? condo : apartments;
            const itqs = (ids == 0) ? "id_house" : (ids == 1) ? "stock_id" : (ids == 2) ? "condo_id" : "apartment_id";
            menu.input(player, "Введите ID").then(m => {
              let itemq = methods.parseInt(m);
              if(isNaN(itemq) || itemq <= 0) return player.notify("~r~ID указан не верно")
              itq.updateOwnerInfo(itemq, id, user.getRpName(target));
              user.set(target, itqs, itemq)
              user.updateClientCache(target)
              if(itqs == "id_house") user.loginterract(player, id, "AdminJob", "Сделал владельцем дома @house"+itemq)
              else if(itqs == "apartment_id") user.loginterract(player, id, "AdminJob", "Сделал владельцем апаратаментов @apartment"+itemq)
              else if(itqs == "condo_id") user.loginterract(player, id, "AdminJob", "Сделал владельцем квартиры @condo"+itemq)
              else if(itqs == "stock_id") user.loginterract(player, id, "AdminJob", "Сделал владельцем склада @stock"+itemq)
              
              player.notify("~g~Успешно");
            });
          })
        }
      })
      block.newItem({
        name: "Сделать владельцем бизнеса",
        onpress: () => {
          menu.input(player, "Введите ID бизнеса").then(m => {
            let itemq = methods.parseInt(m);
            if(isNaN(itemq) || itemq <= 0) return player.notify("~r~ID указан не верно")
            business.updateOwnerInfo(itemq, id, user.getRpName(target));
            user.set(target, 'business_id', itemq)
            user.set(target, 'fraction_id2', itemq)
            user.set(target, 'rank2', 11)
            user.loginterract(player, id, "AdminJob", "Сделал владельцем бизнеса @business"+itemq)
            user.updateClientCache(target)
            player.notify("~g~Успешно");
          });
        }
      })
    }
    block.newItem({
      name: "Редактор статистики",
      onpress: () => {
        // if(!methods.isTestServer() && uid != 29975 && uid != 1 && uid != 3635 && uid != 4340) return player.notify("У вас нет доступа к редактированию статистики игрока")
        statUserEdit(player, id, name, lvl);
      }
    })
    block.newItem({
      name: "Проверка имущества",
      onpress: () => {
        // if(!methods.isTestServer() && uid != 29975 && uid != 1 && uid != 3635 && uid != 4340) return player.notify("У вас нет доступа к редактированию статистики игрока")
        userPropertyEdit(player, id);
      }
    })
  }

  block.newItem({name: "Назад",type: "select", onpress: () => userList(player)});
  block.open();
}

async function statUserEdit(player:PlayerMp,id:number,name:string,lvl:number){
  let adminLvl = user.getAdminLevel(player)
  if(!user.isAdminNow(player)) return player.notify("Действия доступны только администраторам");
  let target = user.getPlayerById(id);
  let block = menu.new(player, `Редактор статы`, `${name} (${id}) ${target ? 'Online':'Offline'}`);
  let statData:any;
  if(!target){
    let q = await userEntity.findOne({ where: {id:id}})
    if(!q) return player.notify("Неверный ID");
    statData = q;
  }
  const statList = [
    "age",
    "exp_age",
    "id_house",
    "apartment_id",
    "condo_id",
    "business_id",
    "stock_id",
    "car_id1",
    "car_id2",
    "car_id3",
    "car_id4",
    "car_id5",
    "car_id6",
    "car_id7",
    "car_id8",
    "fraction_id",
    "rank",
    "fraction_id2",
    "rank2",
    "jail_time",
    "jailed_admin",
    "med_time",
    "a_lic",
    "b_lic",
    "c_lic",
    "air_lic",
    "ship_lic",
    "gun_lic",
    "fish_lic",
    "taxi_lic",
    "skill_builder",
    "skill_scrap",
    "skill_shop",
    "skill_taxi",
    "skill_mail",
    "skill_mail2",
    "skill_photo",
    "skill_sunb",
    "skill_bgstar",
    "skill_bshot",
    "skill_three",
    "skill_water",
    "skill_bus1",
    "skill_bus2",
    "skill_bus3",
    "skill_gr6",
    "skill_trucker",
    "money",
    "money_bank",
  ]
  const statListText = [
    "job",
    "vip_status",
  ]
  statList.map(item => {
    let value = target ? user.get(target, item) : statData[item]
    block.newItem({
      name: `${item} (${value})`,
      onpress: () => {
        menu.input(player, "Новое значение", value, 20, "int").then(async res => {
          if(res == null) return;
          let newitem = methods.parseInt(res);
          if(target){
            user.set(target, item, newitem);
            user.updateClientCache(target);
            user.saveAccount(target);
          } else {
            let datas:any = {};
            datas[item] = newitem;
            await userEntity.update({...datas},{where: {id}})
          }
          methods.saveLog('adminJob', user.getId(player)+" сменил параметр "+item+" => "+value+" на "+newitem+" "+id);
          user.loginterract(player, id, "AdminJob", "Сменил параметр "+item+" => "+value+" на "+newitem)
          statUserEdit(player,id,name,lvl)
        })
      }
    })
  })
  statListText.map(item => {
    let value = target ? user.get(target, item) : statData[item]
    block.newItem({
      name: `${item} (${value})`,
      onpress: () => {
        menu.input(player, "Новое значение", value).then(async res => {
          let newitem = res;
          if(target){
            user.set(target, item, newitem);
            user.saveAccount(target);
          } else {
            let datas: any = {};
            datas[item] = newitem;
            await userEntity.update({ ...datas }, { where: { id } })
          }
          methods.saveLog('adminJob', user.getId(player)+" сменил параметр "+item+" => "+value+" на "+newitem+" "+id);
          user.loginterract(player, id, "AdminJob", "Сменил параметр "+item+" => "+value+" на "+newitem)
          statUserEdit(player,id,name,lvl)
        })
      }
    })
  })
  block.newItem({name: "Назад",type: "select", onpress: () => workUser(player, id, name, lvl)});
  block.open();
}

async function userList(player:PlayerMp,offline = false, search = ""){
  menu.close(player)
  if(offline && !user.isAdminNow(player)) return player.notify("Доступно только для администраторов");
  let block = menu.new(player, "Пользователи");
  let isAdmin = user.isAdminNow(player);
  let id = methods.parseInt(search);
  block.newItem({name: `~y~Закрыть`, onpress: () => block.close()})
  if(isNaN(id) || id < 0) id = 0;
  block.newItem({
    name: `Поиск игрока ${search ? `(${search})` : ''}`,
    onpress: () => {
      menu.input(player, "Введите имя или ID", search).then(res => {
        if(!res) res = ""
        userList(player, offline, res);
      })
    }
  })
  block.newItem({name: `~g~Игроки онлайн`})
  let players = mp.players.toArray();
  const myid = user.getId(player)
  players.sort((a,b) => {
    if(!user.isLogin(a)) return 1;
    if(!user.isLogin(b)) return 1;
    if(user.getId(a) == myid) return -1;
    if(user.getId(b) == myid) return -1;
    if(a.level > b.level) return -1;
    // if(a.online_time > b.online_time) return -1;
    return 1;
  });
  
  players.forEach(target => {
    const targetid = user.getId(target)
    if(targetid == -1) return;
    let name = user.getRpName(target);
    if(search){
      if(id != targetid && name.toLowerCase().indexOf(search.toLowerCase()) == -1) return;
    }
    let crdPos = `X: ${target.position.x.toFixed(3)}\nY: ${target.position.y.toFixed(3)}\nZ: ${target.position.z.toFixed(3)}`
    block.newItem({
      name: (isAdmin ? `${name} | ` : '')+(user.getDating(player, targetid) ? user.getDating(player, targetid) : (myid == targetid ? "Вы" : "Незнакомец"))+` (${targetid})`,
      more: "Уровень: "+user.getLevel(target),
      desc: !isAdmin ? "~g~Online" : `~g~Online\nIP: ${target.ip}\nMoney: $${user.getMoney(target)} / ${user.getBankMoney(target)}\nPing: ${target.ping.toFixed(0)}ms`,
      type: "select",
      onpress: () => workUser(player, targetid, user.getRpName(target), user.get(target, "admin_level"))
    })
  })
  if(isAdmin){
    block.newItem({
      name: offline ? `~r~Игроки offline ~g~(Включён)~w~ (500 max)` : `~r~Игроки offline (Отключён)`,
      onpress: () => {
        userList(player, !offline, search);
      }
    })
    if(offline){
      let usersdb = await userEntity.findAll({
        where: {
          [Op.or]: [{ id }, { rp_name: { [Op.like]: `%${search}%`}}]
        }, limit: 500
      });
      usersdb.forEach((user:any) => {
        block.newItem({
          name: user.rp_name+` (${user.id})`,
          desc: "~r~Offline",
          type: "select",
          onpress: () => workUser(player, user.id, user.rp_name, user.admin_level)
        })
      })
    }
  }

  block.open();
}

mp.events.add("users:top", (player:PlayerMp) => {
  let m = menu.new(player, "Топ игроков", "Категории");
  m.newItem({
    name: "Топ 20 активных за сутки",
    onpress: () => {
      let submenu = menu.new(player, "Список");
      let daydata = [...playerDataSQL.data]
      daydata.sort((c, b) => {
        return b.played_time_day - c.played_time_day
      })
      let mypos = daydata.findIndex(a => a.id == user.getId(player))+1;
      if(mypos > 0){
        submenu.newItem({
          name: "Ваша позиция",
          more: `${mypos} (${methods.secondsToTime(daydata[mypos - 1].played_time_day * 60)})`
        })
      }
      let res = daydata.splice(0, 20);
      res.map((itm, index) => {
        submenu.newItem({
          name: `${(index + 1)}) Игрок: ${itm.id}`,
          more: `(${methods.secondsToTime(itm.played_time_day * 60)})`
        })
      })
      submenu.open();
    }
  })
  m.open();
})

mp.events.add("server:users:list", (player:PlayerMp) => {
  userList(player);
})

mp.events.add("setAge", (player:PlayerMp) => {
  if(user.get(player, "exp_age") == 0) return player.notify("~r~Вы не можете указывать возраст");
  // if(user.getLevel(player) > 1) return player.notify("~r~Вы не можете указывать возраст, поскольку ваш уровень выше первого");

  menu.input(player, "Укажите возраст (16 - 90)", user.get(player, "age"), 3, "int").then(age => {
    if(user.get(player, "exp_age") == 0) return player.notify("~r~Вы не можете указывать возраст");
    // if(user.getLevel(player) > 1) return player.notify("~r~Вы не можете указывать возраст, поскольку ваш уровень выше первого");
    if(age == null) return player.notify("~r~Отмена");
    age = methods.parseInt(age);
    if(isNaN(age)) return player.notify("~r~Возраст указан не верно");
    if(age < 16 || age > 90) return player.notify("~r~Возраст должен быть от 16 до 90 лет");
    const currentage = user.get(player, "age");
    if(currentage >= 40 && user.getLevel(player) < 15) user.setLevel(player, 15), user.setExp(player, 0)
    else if(currentage >= 35 && user.getLevel(player) < 10) user.setLevel(player, 10), user.setExp(player, 0)
    else if(currentage >= 30 && user.getLevel(player) < 7) user.setLevel(player, 7), user.setExp(player, 0)
    else if(currentage >= 25 && user.getLevel(player) < 5) user.setLevel(player, 5), user.setExp(player, 0)
    else if(currentage >= 20 && user.getLevel(player) < 4) user.setLevel(player, 4), user.setExp(player, 0)
    
    user.set(player, "exp_age", 0);
    user.set(player, "age", age);
    user.updateCharacterFace(player);
    user.updateCharacterCloth(player);
    user.updateClientCache(player);
    player.notify("~g~Возраст указан, уровень вашего персонажа теперь: "+user.getLevel(player))

  })
})


// setInterval(() => {
//   methods.saveAllUser();
// }, 480000)

const dropBag = (player:PlayerMp) => {
  if(!mp.players.exists(player)) return;
  if (!player.bankgrabmoney) return;
  user.log(player, "Grab", `Выронил сумку с деньгами, количество: ${player.bankgrabmoney}$`);
  let existSum = true;
  const countSum = methods.parseInt(`${player.bankgrabmoney}`);
  player.bankgrabmoney = 0;
  user.checkComponents(player)
  let check = methods.createDynamicCheckpoint(new mp.Vector3(player.position.x, player.position.y, player.position.z - 1), "Нажмите ~g~Е~s~ чтобы взять сумку с деньгами", target => {
    if (!user.isGos(target) && !user.isMafia(target) && !user.isGang(target)) return target.notify(`~r~Вам эта сумка не нужна`);
    if (!existSum) return target.notify(`~r~Сумку уже подняли`);
    user.playAnimation(target, 'anim@heists@money_grab@duffel', 'loop', 9);
    user.disableAllControls(target, true);
    setTimeout(() => {
      user.disableAllControls(target, false);
      user.stopAnimation(target);
      if (!existSum) return target.notify(`~r~Сумку уже подняли`);
      if(!target.bankgrabmoney) target.bankgrabmoney = 0;
      target.bankgrabmoney+=countSum;
      player.notify(`~g~Вы подняли сумку с деньгами на сумму $${methods.numberFormat(countSum)}`)
      user.setComponentVariation(target, 5, 45, 0);
      existSum = false;
      check.delete();
    }, 5000)
  }, 1.2, player.dimension, [0,255,50,40]);
      setTimeout(() => {
        if(existSum && check) check.delete();
      }, 15 * 60000)
}



mp.events.add('playerQuit', (player: PlayerMp, exitType: "disconnect"|"timeout"|"kicked", reason:string) => {
  if(!user.isLogin(player)) return;
  user.set(player, 'is_online', 0);
  const id = user.getId(player);
  if(!id || id == -1) return;
  dropBag(player)
  user.log(id, "PlayerLeave", "покинул сервер, тип выхода: "+exitType+", причина: "+reason)
  userEntity.update({is_online:0},{where: {id}})
});

mp.events.add('playerDeath', (player: PlayerMp, reason:number, killer: PlayerMp) => {
  dropBag(player)
  user.setDrugLevel(player, 0, 0);
  user.setDrugLevel(player, 1, 0);
  user.setDrugLevel(player, 2, 0);
  user.setDrugLevel(player, 3, 0);
  user.setDrugLevel(player, 4, 0);
  user.setDrugLevel(player, 5, 0);
  user.setDrugLevel(player, 99, 0);
  user.stopAllScreenEffects(player);

  if(killer){
    if(user.isGos(player) && !user.isGos(killer)){
      user.giveWanted(killer, 1, 'Убийство сотрудника гос.организации');
    }
  }


  let reasonText = ``;
  if(killer){
    reasonText+=`Убил ${user.getRpName(killer)} @user${user.getId(killer)} `
  }
  if(reason){
    let srcReason = (deathReasonList as any)[reason.toString()]
    if(srcReason){
      reasonText+=` (${srcReason} ${reason})`
    }
  }
  if(!reasonText) reasonText = 'Погиб'
  if(killer) user.loginterract(player, killer, "PlayerKill", reasonText)
  else user.log(player, "PlayerKill", reasonText)
});

let givedAutoPayday = false;


setInterval(() => {
  if (givedAutoPayday) return;
  let d = new Date();
  let used = (d.getMinutes() == 0);
  if (used) {
    givedAutoPayday = true;
    setTimeout(() => {
      givedAutoPayday = false
    }, 120000)
    mp.players.forEach(player => {
      if (!user.isLogin(player)) return;
      if (!onlineUser.has(user.getId(player))) onlineUser.set(user.getId(player), 0)
      if (onlineUser.get(user.getId(player)) < 25) return player.notify(`~r~Вы не получили PayDay поскольку отыграли менее 25 минут`);
      if (user.isAfk(player)) return player.notify(`~r~Вы не получили PayDay поскольку стоите AFK`);
      user.payDay(player)
      onlineUser.set(user.getId(player), 0)
    })
    setTimeout(() => {
      chest.pool.map(ch => {
        ch.grabmoney = 0;
      })
    }, 5000)
    if (d.getHours() == 0) {
      setTimeout(() => {
        userEntity.update({ played_time: 0 }, { where: {} });
        mp.players.forEach(player => {
          player.played_time = 0
        })
      }, 10000)
    }
    if (d.getHours() == 18) {
      let players = mp.players.toArray().filter(player => user.isLogin(player) && !user.isAfk(player) && !user.getVipStatusData(player) && player.played_time && player.played_time >= 3)
      let winner1 = randomArrayEl(players);
      let winner2 = randomArrayEl(players);
      let winner3 = randomArrayEl(players);
      let winners = [winner1, winner2, winner3]
      winners.map(winner => {
        if(mp.players.exists(winner))
        user.giveVipStatus(winner, "Bonus", 4);
      })
      methods.notifyToAll('~b~Результаты розыгрыша ~b~' + user.getVipStatusData("Bonus").name + ' на 4 дня\r~g~Поздравляем! победители: ~s~' + winners.map(player => { return user.getRpName(player)}).join(', '));
    }
  }
}, 10000)

setInterval(() => {
  mp.players.forEach(player => {
    if(!user.isLogin(player)) return;
    if(!onlineUser.has(user.getId(player))) onlineUser.set(user.getId(player), 0)
    if(!user.isAfk(player)){
      onlineUser.set(user.getId(player), onlineUser.get(user.getId(player)) + 2)
      player.call("played:time", [onlineUser.get(user.getId(player)), player.played_time])
    }
  })
}, 120000)


let playerDataSQL = new NoSQLbase<{ id:number; played_time_day:number }>('playerData');
playerDataSQL.init().then(() => {
  setInterval(() => {
    let badID = playerDataSQL.findOne({ where: { id: -1 } })
    if(badID){
      badID.played_time_day = 0;
    }
    let d = new Date();
    let newday = (d.getMinutes() == 0 && d.getHours() == 0);
    // let newweek = (newday && d.getDay() == 0);


    if (newday) {
      let daydata = [...playerDataSQL.data]
      daydata.sort((c, b) => {
        return b.played_time_day - c.played_time_day
      })
      let res = daydata.splice(0, dayTopReward.length);
      res.map((itm, index) => {
        user.addMoneyOffline(itm.id, dayTopReward[index], `Вы получили бонус как самый активный игрок дня (${index + 1} место)`)
      })
      playerDataSQL.clear();
    }
    mp.players.toArray().filter(player => user.isLogin(player) && !user.isAfk(player)).map(player => {
      const user_id = user.getId(player);
      let data = playerDataSQL.findOne({
        where: {
          id: user_id
        }
      });
      if(!data){
        playerDataSQL.insert({ id: user_id, played_time_day: 0});
      } else {
        data.played_time_day++;
      }
    })
  }, 60000)

  setInterval(() => {
    playerDataSQL.save();
  }, 120000)

})




export const saveNoSQLplayerData = () => {
  playerDataSQL.save();
}