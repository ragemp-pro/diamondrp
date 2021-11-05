/// <reference path="../../declaration/server.ts" />

import {methods} from '../modules/methods';
import {Container} from '../modules/data';
import {user} from '../user';
import {weather} from './weather';
import { tablet } from './tablet.events';
import { mafiaTerritoriesData } from '../../util/mafiaData';
import { mafiaWarEntity } from '../modules/entity/mafiaWarEntity';


let offset = 500000;
let keyPrefix = 'mafiaWar';

let isStartTimer1 = false;
let timerCounter1 = 0;
let warPos1 = new mp.Vector3(34.23244857788086, -2711.05078125, 4.38362455368042);
let warPosRadius1 = 50;

let isStartTimer2 = false;
let timerCounter2 = 0;
let warPos2 = new mp.Vector3(-552.1932983398438, -1656.835205078125, 18.24129867553711);
let warPosRadius2 = 70;

let isStartTimer3 = false;
let timerCounter3 = 0;
let warPos3 = new mp.Vector3(2106.784423828125, 4790.55029296875, 40.13631820678711);
let warPosRadius3 = 50;

let lcn1 = 0;
let rm1 = 0;
let trd1 = 0;
let lme1 = 0;

let lcn2 = 0;
let rm2 = 0;
let trd2 = 0;
let lme2 = 0;

let lcn3 = 0;
let rm3 = 0;
let trd3 = 0;
let lme3 = 0;



export let mafiaWar = {
    loadAll: function() {
        methods.debug('mafiaWar.loadAll');
        mafiaWarEntity.findAll().then(rows => {    
            rows.forEach(row => {
                mafiaWar.set(row['id'], 'ownerId', row['owner_id']);
                mafiaWar.set(row['id'], 'canWar',true);
                mafiaWar.set(row['id'], 'money', row['money']);
            });
        });
    

        let givedmoney = false;
        setInterval(() => {
            if (givedmoney) return;
            let d = new Date();
            let used = (d.getHours() == 0 && d.getMinutes() == 2);
            if (used) {
                givedmoney = true;
                setTimeout(() => {
                    givedmoney = false
                }, 120000)
                mafiaWar.saveMoney(1, mafiaWar.get(1, 'money') + mafiaTerritoriesData[0].cost);
                mafiaWar.saveMoney(2, mafiaWar.get(2, 'money') + mafiaTerritoriesData[1].cost);
                mafiaWar.saveMoney(3, mafiaWar.get(3, 'money') + mafiaTerritoriesData[2].cost);
            }
        }, 5000)

    },
    
    save: function(id:number, ownerId:number) {
        methods.debug('mafiaWar.save');
        mafiaWar.set(id, 'ownerId', ownerId);
        mafiaWarEntity.update({
            owner_id: ownerId
        }, {where: {id:id}})
    },
    
    saveMoney: function(id:number, money:number) {
        methods.debug('mafiaWar.saveMoney');
        mafiaWar.set(id, 'money', money);
        mafiaWarEntity.update({
            money: money
        }, { where: { id: id } })
    },
    
    getZoneId: function(position:Vector3Mp) {
        methods.debug('mafiaWar.getZoneId');
        if (methods.distanceToPos(position, warPos1) < warPosRadius1)
            return 1;
        if (methods.distanceToPos(position, warPos2) < warPosRadius2)
            return 2;
        if (methods.distanceToPos(position, warPos3) < warPosRadius3)
            return 3;
        return 0;
    },
    
    takeBank: function(player:PlayerMp, id:number, sum:number) {
        methods.debug('mafiaWar.takeBank');
        if (!user.isLogin(player))
            return;
        if (mafiaWar.get(id, 'money') < sum) {
            player.notify('~r~Такой суммы нет на счету');
            return;
        }
    
        let zoneId = mafiaWar.getZoneId(player.position);
    
        if (zoneId == id) {
            mafiaWar.saveMoney(id, mafiaWar.get(id, 'money') - sum);
            player.notify('~y~Вы сняли деньги со счета территории');
            user.addMoney(player, sum);
            tablet.openMafiaTer(player)
        }
        else {
            player.notify('~r~Необходимо находиться на территории');
        }
    },
    
    startWar: function(player:PlayerMp) {
        methods.debug('mafiaWar.startWar');
        if (!user.isLogin(player))
            return;
    
        let id = mafiaWar.getZoneId(player.position);
    
        if (id == 0) {
            player.notify('~r~Вы слишком далеко от какой либо территории');
            return;
        }
    
        if (!mafiaWar.get(id, 'canWar')) {
            player.notify('~r~Захват этой территории будет доступен завтра');
            return;
        }
        if (weather.getHour() < 20 && weather.getHour() > 8) {
            player.notify('~r~Доступно только с 20 до 8 утра IC времени');
            return;
        }
    
        let ownerId = mafiaWar.get(id, 'ownerId');
    
        let dateTime = new Date();
        if (ownerId > 0) {
            if (dateTime.getDate() % 3) {
                player.notify('~r~Доступно каждые 3 дня (ООС)');
                player.notify('~r~А именно: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30 число на календаре');
                return;
            }
        }
    
        if (dateTime.getHours() < 20) {
            player.notify('~r~Доступно только с 20 до 24 ночи ООС времени');
            return;
        }
    
        switch (id) {
            case 1:
                if (isStartTimer1) {
                    player.notify('~r~В данный момент территория захватывается');
                    return;
                }
                isStartTimer1 = true;
                timerCounter1 = 900;
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Элизиан Айленд', 'CHAR_DEFAULT', 8);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Элизиан Айленд', 'CHAR_DEFAULT', 9);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Элизиан Айленд', 'CHAR_DEFAULT', 10);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Элизиан Айленд', 'CHAR_DEFAULT', 11);
                break;
            case 2:
                if (isStartTimer2) {
                    player.notify('~r~В данный момент территория захватывается');
                    return;
                }
                isStartTimer2 = true;
                timerCounter2 = 900;
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Ла Пуэрта', 'CHAR_DEFAULT', 8);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Ла Пуэрта', 'CHAR_DEFAULT', 9);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Ла Пуэрта', 'CHAR_DEFAULT', 10);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Ла Пуэрта', 'CHAR_DEFAULT', 11);
                break;
            case 3:
                if (isStartTimer3) {
                    player.notify('~r~В данный момент территория захватывается');
                    return;
                }
                isStartTimer3 = true;
                timerCounter3 = 900;
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Грейпсид Аэропорт', 'CHAR_DEFAULT', 8);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Грейпсид Аэропорт', 'CHAR_DEFAULT', 9);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Грейпсид Аэропорт', 'CHAR_DEFAULT', 10);
                methods.notifyWithPictureToFraction('Война за территорию', `Организация`, 'Начался захват территории ~y~Грейпсид Аэропорт', 'CHAR_DEFAULT', 11);
                break;
        }
        return true;
    },
    
    timer: function() {
        if (isStartTimer1) {
            timerCounter1--;
    
            if (timerCounter1 % 30 == 0) {
                mp.players.forEachInRange(warPos1, warPosRadius1, p => {
                    if (user.get(p, 'rank') > 1) {
                        if (p.health == 0) return;
                        if (user.isLaEme(p))
                            lme1++;
                        if (user.isRussianMafia(p))
                            rm1++;
                        if (user.isYakuza(p))
                            trd1++;
                        if (user.isCosaNostra(p))
                            lcn1++;
                    }
                });
            }
    
            if (timerCounter1 < 1) {
                timerCounter1 = 0;
                isStartTimer1 = false;
                let zoneId = mafiaWar.getZoneId(warPos1);
                let ownerId = mafiaWar.getMaxCounterFractionId(lme1, rm1, trd1, lcn1);
                let fractionName = methods.getMafiaName(ownerId);
                mafiaWar.save(zoneId, ownerId);
                mafiaWar.set(zoneId, 'ownerId', ownerId);
                mafiaWar.set(zoneId, 'canWar', false);
    
                methods.notifyWithPictureToFraction('Итоги войны', `Элизиан Айленд`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 8);
                methods.notifyWithPictureToFraction('Итоги войны', `Элизиан Айленд`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 9);
                methods.notifyWithPictureToFraction('Итоги войны', `Элизиан Айленд`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 10);
                methods.notifyWithPictureToFraction('Итоги войны', `Элизиан Айленд`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 11);
            }
            mp.players.callInRange(warPos1, warPosRadius1, "client:mafiaWar:sendInfo", [lme1, rm1, trd1, lcn1, timerCounter1]);
        }
        if (isStartTimer2) {
            timerCounter2--;
    
            if (timerCounter2 % 30 == 0) {
                mp.players.forEachInRange(warPos2, warPosRadius2, p => {
                    if (user.get(p, 'rank') > 1) {
                        if (p.health == 0) return;
                        if (user.isLaEme(p))
                            lme2++;
                        if (user.isRussianMafia(p))
                            rm2++;
                        if (user.isYakuza(p))
                            trd2++;
                        if (user.isCosaNostra(p))
                            lcn2++;
                    }
                });
            }
    
            if (timerCounter2 < 1) {
                timerCounter2 = 0;
                isStartTimer2 = false;
                let zoneId = mafiaWar.getZoneId(warPos2);
                let ownerId = mafiaWar.getMaxCounterFractionId(lme2, rm2, trd2, lcn2);
                let fractionName = methods.getMafiaName(ownerId);
                mafiaWar.save(zoneId, ownerId);
                mafiaWar.set(zoneId, 'ownerId', ownerId);
                mafiaWar.set(zoneId, 'canWar', false);
    
                methods.notifyWithPictureToFraction('Итоги войны', `Ла Пуэрта`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 8);
                methods.notifyWithPictureToFraction('Итоги войны', `Ла Пуэрта`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 9);
                methods.notifyWithPictureToFraction('Итоги войны', `Ла Пуэрта`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 10);
                methods.notifyWithPictureToFraction('Итоги войны', `Ла Пуэрта`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 11);
            }
            mp.players.callInRange(warPos2, warPosRadius2, "client:mafiaWar:sendInfo", [lme2, rm2, trd2, lcn2, timerCounter2]);
        }
        if (isStartTimer3) {
            timerCounter3--;
    
            if (timerCounter3 % 30 == 0) {
                mp.players.forEachInRange(warPos3, warPosRadius3, p => {
                    if (!user.isLogin(p))
                        return;
                    if (user.get(p, 'rank') > 1) {
                        if (p.health == 0) return;
                        if (user.isLaEme(p))
                            lme3++;
                        if (user.isRussianMafia(p))
                            rm3++;
                        if (user.isYakuza(p))
                            trd3++;
                        if (user.isCosaNostra(p))
                            lcn3++;
                    }
                });
            }
    
            if (timerCounter3 < 1) {
                timerCounter3 = 0;
                isStartTimer3 = false;
                let zoneId = mafiaWar.getZoneId(warPos3);
                let ownerId = mafiaWar.getMaxCounterFractionId(lme3, rm3, trd3, lcn3);
                let fractionName = methods.getMafiaName(ownerId);
                mafiaWar.save(zoneId, ownerId);
                mafiaWar.set(zoneId, 'ownerId', ownerId);
                mafiaWar.set(zoneId, 'canWar', false);
    
                methods.notifyWithPictureToFraction('Итоги войны', `Грейпсид Аэропорт`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 8);
                methods.notifyWithPictureToFraction('Итоги войны', `Грейпсид Аэропорт`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 9);
                methods.notifyWithPictureToFraction('Итоги войны', `Грейпсид Аэропорт`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 10);
                methods.notifyWithPictureToFraction('Итоги войны', `Грейпсид Аэропорт`, 'Территория под контролем ' + fractionName, 'CHAR_DEFAULT', 11);
            }
            mp.players.callInRange(warPos3, warPosRadius3, "client:mafiaWar:sendInfo", [lme3, rm3, trd3, lcn3, timerCounter3]);
        }
        setTimeout(mafiaWar.timer, 1000);
    },
    
    timerMoney: function() {
        // mafiaWar.saveMoney(1, mafiaWar.get(1, 'money') + mafiaTerritoriesData[0].cost);
        // mafiaWar.saveMoney(2, mafiaWar.get(2, 'money') + mafiaTerritoriesData[1].cost);
        // mafiaWar.saveMoney(3, mafiaWar.get(3, 'money') + mafiaTerritoriesData[2].cost);
        // setTimeout(mafiaWar.timerMoney, 8500 * 60);
    },
    
    getMaxCounterFractionId: function(lme:number, rm:number, trd:number, lcn:number) {
        let maxValue = Math.max(lme, rm, trd, lcn);
        if (lme == maxValue)
            return 11;
        if (rm == maxValue)
            return 8;
        if (trd == maxValue)
            return 10;
        if (lcn == maxValue)
            return 9;
        return 0;
    },
    
    set: function(id:number, key:string, val:any) {
        Container.Set(offset + methods.parseInt(id), keyPrefix + key, val);
    },
    
    reset: function(id:number, key:string) {
        Container.Reset(offset + methods.parseInt(id), keyPrefix + key);
    },
    
    get: function(id:number, key:string) {
        return Container.Get(offset + methods.parseInt(id), keyPrefix + key);
    },
    
    has: function(id:number, key:string) {
        return Container.Has(offset + methods.parseInt(id), keyPrefix + key);
    }
};


setTimeout(() => {
    mafiaWar.timer()
}, 30000)