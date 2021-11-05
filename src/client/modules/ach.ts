import { user, userData, userDataCh } from "../user";
import { methods } from "./methods";
import { weapons } from "../weapons";
import { Container } from "./data";
import { WEAPON_LEVEL_MIN, blackListWeapon } from "../../util/weapons";
const player = mp.players.local;
export {}
/** Флаг, чтобы мы не заспамили уведомлениями о том, что человек является читером */
let isCheatDetect = false;
const TELEPORT_FOOT_DIST = 100;
const TELEPORT_VEHICLE_DIST = 200;
const TELEPORT_TIMER_CHECK = 100;

const USERDATA_CHECK = 1000;
const WEAPON_TIMER_CHECK = 1000;
const VEHICLE_BOOST_TIMER_CHECK = 1000;

const AUTOHEAL_TIMER_CHECK = 100;
let oldHp:number;
let healProtectionStatus = 0;
//! NEED TO INCLUDE PROTECT FUNCTION IN ALL PLAYERS AND VEHICLE (getOccupants)

let lastPosition:Vector3Mp;
let teleportProtectionStatus = 0;

export const teleportProtection = (time = 5000) => {
    teleportProtectionStatus++;
    setTimeout(() => {
        teleportProtectionStatus--;
    }, time)
}
export const healProtection = (time = 1000) => {
    healProtectionStatus++;
    setTimeout(() => {
        healProtectionStatus--;
    }, time)
}

mp.events.add('teleport:protect', (time = 5000) => {
    teleportProtection(time);
})
mp.events.add('heal:protect', (time = 1000) => {
    healProtection(time);
})
let inmp = false;
mp.events.add('anticheat:inmp', (status:boolean) => {
    inmp = status;
})

setInterval(() => {
    if (!user.isLogin()) return lastPosition = player.position;
    if (user.isAdmin()) return lastPosition = player.position;
    if (teleportProtectionStatus) return lastPosition = player.position;
    if (user.isTeleport) return lastPosition = player.position;
    if(!lastPosition) return lastPosition = player.position;
    if(!player.vehicle){
        if(methods.distanceToPos(lastPosition, player.position) > TELEPORT_FOOT_DIST){
            sendCheater("TELEPORT_FOOT", `Преодоление ${methods.distanceToPos(lastPosition, player.position).toFixed(0)}m за ${TELEPORT_TIMER_CHECK}ms`)
        }
        lastPosition = player.position;
    } else {

        if (methods.distanceToPos(lastPosition, player.position) > TELEPORT_VEHICLE_DIST) {
            if (player.vehicle.getPedInSeat(-1) != mp.players.local.handle) return;
            sendCheater("TELEPORT_VEHICLE", `Преодоление ${methods.distanceToPos(lastPosition, player.position).toFixed(0)}m за ${TELEPORT_TIMER_CHECK}ms`)
        }
        lastPosition = player.position;
    }
}, TELEPORT_TIMER_CHECK)
setInterval(() => {
    if (!user.isLogin()) oldHp = player.health;
    if (user.isAdmin()) oldHp = player.health;
    if (healProtectionStatus) oldHp = player.health;
    if (typeof oldHp != 'number') oldHp = player.health;
    if (player.health > oldHp) return sendCheater("AUTO_HEAL", `Было ${oldHp.toFixed(0)}, Стало ${player.health.toFixed(0)}`)
    else oldHp = player.health;
}, AUTOHEAL_TIMER_CHECK)
// setInterval(() => {
//     if(!user.isLogin()) return;
//     if(user.isAdmin()) return;
//     userData.forEach((value, key) => {
//         let ch = userDataCh.get(key);
//         if(!value && !ch) return;
//         if(typeof value == "number"){
//             if (value - ch > -5 && value - ch < 5){
//                 userDataCh.set(key, methods.getRandomInt(value - 3, value + 3));
//             } else {
//                 sendCheater("USER_DATA", `Параметр: ${key}, поддельное значение: ${value}, примерное реальное: ${ch}`)
//             }
//         } else if(typeof value === "string"){
//             if((ch as string).includes(value)){
//                 userDataCh.set(key, methods.randomStr(5) + value + methods.randomStr(5));
//             } else {
//                 sendCheater("USER_DATA", `Параметр: ${key}, поддельное значение: ${value}, примерное реальное неизвестно, однако есть в строке: ${ch}`)
//             }
//         }
//     })
// }, USERDATA_CHECK)
setInterval(() => {
    if(!user.isLogin()) return;
    if(user.isAdmin()) return;
    if (inmp) return;
    let q:string[] = [];
    // const have_any_weapon = <boolean>mp.game.invoke('0x475768A975D5AD17', player.handle, 6)
    // mp.gui.chat.push('' + have_any_weapon)
    weapons.hashesMap.forEach((item) => {
        if (mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, item[1] / 2, false)) {
            if (WEAPON_LEVEL_MIN > user.getLevel()) return sendCheater('WEAPON', 'Уровень игрока ниже допустимого для использования оружия')
            if (!Container.HasLocally(0, (item[1] / 2).toString()) && item[0] != 'Unarmed') {
                q.push(item[0]);
                return;
            }
        }
    });
    if (q.length > 0) {
        sendCheater('WEAPON', 'список: ' + q.join(', '))
        mp.game.invoke("0xF25DF915FA38C5F3", player.handle, true)
    }
    let usedBlWeapon:string[] = [];
    blackListWeapon.map(name => {
        let hash = mp.game.joaat(name.toUpperCase());
        if (mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false)){
            usedBlWeapon.push(name.toUpperCase().replace('WEAPON_', ''));
        }
    })
    if(usedBlWeapon.length > 0){
        sendCheater('WEAPON', 'использование оружия из чёрного списка: ' + usedBlWeapon.join(', '))
        mp.game.invoke("0xF25DF915FA38C5F3", player.handle, true)
    }
    
    // if(have_any_weapon && WEAPON_LEVEL_MIN > user.getLevel()){
    //     sendCheater('WEAPON', 'Уровень игрока ниже допустимого для использования оружия')
    //     mp.game.invoke("0xF25DF915FA38C5F3", player.handle, true)
    // }
    if(player.vehicle) return;
    // let currentWeapon = mp.game.invoke(methods.GET_SELECTED_PED_WEAPON, mp.players.local.handle)
    // if(currentWeapon == -1569615261) return;
    // let access = Container.HasLocally(0, currentWeapon.toString());
    // if(!access){
    //     sendCheater('WEAPON', 'в руках '+currentWeapon)
    //     mp.game.invoke("0xF25DF915FA38C5F3", player.handle, true)
    // }
}, WEAPON_TIMER_CHECK)
setInterval(() => {
    if(!user.isLogin()) return;
    if(user.isAdmin()) return;
    if(!player.vehicle) return;
    if(player.vehicle.isInAir()) return;
    let maxSpeed = mp.game.vehicle.getVehicleModelMaxSpeed(player.vehicle.model);
    if(player.vehicle.getVariable('boost')) maxSpeed*=player.vehicle.getVariable('boost');
    else maxSpeed *= 1.3
    maxSpeed += 50;
    if (player.vehicle.getSpeed() > (maxSpeed)){
        sendCheater("VEHICLE_BOOST", `Текущая скорость: ${(player.vehicle.getSpeed() * 3.6).toFixed(0)}, Максимальная: ${(maxSpeed * 3.6).toFixed(0)}`);
    }
}, VEHICLE_BOOST_TIMER_CHECK)




const sendCheater = (reason:"TELEPORT_FOOT"|"TELEPORT_VEHICLE"|"AUTO_HEAL"|"WEAPON"|"VEHICLE_BOOST"|"USER_DATA", more?:string) => {
    // mp.console.logInfo("SEND CHEATER", reason, ...args);
    if(isCheatDetect) return;
    isCheatDetect = true;
    if (reason.includes('TELEPORT_')){
        setTimeout(() => {
            if (teleportProtectionStatus){
                isCheatDetect = false;
                return;
            }
            mp.events.callRemote('cheat:detect', reason, more);
            setTimeout(() => {
                isCheatDetect = false;
            }, 30000)
        }, 1000)
    } else if(reason === "AUTO_HEAL"){
        setTimeout(() => {
            if (teleportProtectionStatus) {
                isCheatDetect = false;
                return;
            }
            mp.events.callRemote('cheat:detect', reason, more);
            setTimeout(() => {
                isCheatDetect = false;
            }, 30000)
        }, 1000)
    } else {
        mp.events.callRemote('cheat:detect', reason, more);
        setTimeout(() => {
            isCheatDetect = false;
        }, 30000)
    }
}