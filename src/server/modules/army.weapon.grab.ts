import { methods } from "./methods";
import { weather } from "../managers/weather";
import { user } from "../user";
import { inventory } from "../inventory";
import { items } from "../items";
import { levelAccess } from "../../util/level";
import { randomArrayEl } from "../../util/methods";
import { dispatcher } from "../managers/dispatcher";

/** Таймер в минутах на то, что мы получим награду за убийство */
const alreadyKillerTimer = 30;

const maxOnlineGrabArmyWeapon = 150

const MAX_AMOUNT = 150
const MAX_GRAB = 4
const weapons = [106, 110]
const ammo = [30]


let locked = true;
let locking = false;
// let lastFractions:number[] = [];

const pos = new mp.Vector3(465.97, -3119.84, 5.07)
const postext = new mp.Vector3(465.97, -3119.84, 6.07)


export let weapongrabamount = MAX_AMOUNT;
let isgrab = MAX_GRAB;

interface killGangByArmyRewardItem {
    x:number;
    y:number;
    z:number;
    r:number;
    cost:number;
}

const killGangByArmyRewardList: killGangByArmyRewardItem[] = [
    {x:-2091.88, y:3289.92, z:31.81, r:500, cost: 500},
    { x: 467.01, y: -3121.13, z: 6.07, r:180, cost: 500},
]




let usedRestore = false;


setInterval(() => {
    if (usedRestore) return;
    let used = (weather.getHour() == 20 && weather.getMin() == 0);
    if (used) {
        usedRestore = true;
        setTimeout(() => {
            usedRestore = false
        }, 120000)
        weapongrabamount = MAX_AMOUNT;
        isgrab = MAX_GRAB;
        locked = true;
        // locking = false;
    }
}, 1000)


export const weaponGrabDays = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];

methods.createDynamicCheckpoint(pos, "Нажмите ~g~E~w~ чтобы ограбить склад с оружием", player => {
    if (user.isCuff(player)) return;
    if (user.isDead(player)) return;
    if (!isgrab) return player.notify("~r~Сейчас точка занята");
    // let dateTime = new Date();
    // if (!methods.isTestServer() && (dateTime.getHours() < 17 || dateTime.getHours() > 20)) {
    //     player.notify('~r~Доступно только с 17 до 20 вечера ООС времени');
    //     return;
    // }

    if (weather.getHour() < 23 && weather.getHour() > 5) {
        player.notify("~r~Доступно только с 23 до 5 утра игрового времени");
        return;
    }

    let dateTime = new Date();
    if (!methods.isTestServer() && !weaponGrabDays.includes(dateTime.getDate())) {
        player.notify(`~r~Ограбление доступно в следующие дни: ${weaponGrabDays.join(', ')}`);
        return;
    }

    if (!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)) {
        return player.notify("~r~Требуется " + items.getItemNameById(263));
    }
    
    if (weapongrabamount <= 0) return player.notify("~r~Больше контейнеров нет, ожидайте пополнение склада");


    if (user.has(player, 'isGrab')) {
        player.notify('~r~Это действие сейчас не доступно');
        return;
    }

    if (!user.isGang(player)) {
        player.notify('~r~Вы не состоите в банде');
        return;
    }

    if (user.getLevel(player) < levelAccess.weapongrab) return player.notify("~r~Необходимо иметь " + levelAccess.weapongrab + " уровень")

    if (!methods.isTestServer() && mp.players.length < maxOnlineGrabArmyWeapon) {
        player.notify("~r~Онлайн на сервере должен быть более " + maxOnlineGrabArmyWeapon+" человек");
        return;
    }

    const VEHS_EXIST = user.getNearestVehicles(player, 15).filter(veh => veh.fraction_id == user.getPlayerFraction(player)).length > 0;

    if (!VEHS_EXIST){
        player.notify("~r~Поблизости нет транспорта вашей банды");
        return;
    }
    const fraction = user.getPlayerFraction(player)

    

    if (locked){
        player.notify('~r~Хранилище закрыто крепким замком, сначала нужно вскрыть')
        user.accept(player, "Начать взлом замка?").then(status => {
            if(!status) return;
            if (locking) return player.notify('~r~Замок уже вскрывается')
            if (!locked) return player.notify('~r~Замок уже вскрыт')
            
            // if (lastFractions.includes(fraction)) return player.notify('~r~Ваша фракция уже вскрывала замок')
            player.notify('~g~Вы начали взлом, ожидайте')
            user.playAnimation(player, "mini@repair", "fixing_a_ped", 8);
            user.disableAllControls(player, true)
            setTimeout(() => {
                if (!mp.players.exists(player)) return;
                user.stopAnimation(player);
                user.disableAllControls(player, false)
                if (locking) return player.notify('~r~Замок уже вскрывается')
                if (!locked) return player.notify('~r~Замок уже вскрыт')
                // if (lastFractions.includes(fraction)) return player.notify('~r~Ваша фракция уже вскрывала замок')
                player.notify('~r~Не отходите далеко, иначе взлом остановится')
                locking = true;
                let secs = 7 * 60
                let text = mp.labels.new('Вскрытие замка (' + secs + ')', postext, {
                    drawDistance: 5,
                    los: true
                })
                dispatcher.sendPosImage('Военный порт', 'Диспетчер', `Внимание!!! [Склад с вооружением в порту] атакован`, "CHAR_MILSITE", pos, 4)
                let q = setInterval(() => {
                    if(secs == 0){
                        clearInterval(q)
                        if(mp.labels.exists(text)) text.destroy();
                        locked = false;
                        locking = false;
                        methods.createEvent('port', "Ограбление порта", pos.x, pos.y, pos.z, 250)
                        let checkT = setInterval(() => {
                            if (weather.getHour() > 5){
                                methods.removeEvent('port');
                                clearInterval(checkT);
                            }
                        }, 1000)
                        // lastFractions.push(fraction);
                        return;
                    }
                    if (secs % 20 === 0){
                        if (mp.players.toArray().filter(target => [fraction].includes(user.getPlayerFraction(target)) && target.dist(pos) <= 10).length == 0){
                            locking = false;
                            clearInterval(q)
                            if (mp.labels.exists(text)) text.destroy();
                            return;
                        }
                    }
                    secs--;
                    text.text = 'Вскрытие замка (' + secs + ')';
                }, 1000)
            }, 10000)
        })

        return;
    }

    // if (lastFractions.length > 0) {
    //     if (lastFractions.indexOf(fraction) != (lastFractions.length - 1)) return player.notify(`~r~Вы не можете грабить военку`)
    // }

    isgrab--;
    weapongrabamount--;
    user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
    user.disableAllControls(player, true);
    user.set(player, 'isGrab', true)
    setTimeout(function () {
        user.playAnimation(player, "anim@heists@money_grab@duffel", "loop", 9);
    }, 5000);
    setTimeout(async function () {
        isgrab++;
        if (!user.isLogin(player))
            return;

        user.disableAllControls(player, false);
        user.giveWanted(player, 10, 'Ограбление хранилища USMC');


        user.reset(player, 'isGrab');
        user.stopAnimation(player);
        if (user.isCuff(player)) return;
        if (user.isDead(player)) return;
        if (!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)) {
            return player.notify("~r~Требуется " + items.getItemNameById(263));
        }
        if (methods.getRandomInt(0, 3) == 0) {
            inventory.deleteItem(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263).id);
            player.notify('~r~Вы сломали отмычку');
        }

        let chance = methods.getRandomInt(1, 10);
        let chestid = methods.getTimeStamp()
        if(chance == 1){
            player.notify("~r~Контейнер оказался пустой");
        } else if(chance <= 3){
            // Оружие
            let randomweapon = randomArrayEl(weapons)
            await inventory.addItem(player, randomweapon, 1, 999, chestid, 1);
            if(mp.players.exists(player)) inventory.openInventory(player, 999, chestid)
        } else {
            // Патроны
            let randomammo = randomArrayEl(ammo)
            await inventory.addItem(player, randomammo, 2, 999, chestid, inventory.ammoItemIdToMaxCount(randomammo));
            if (mp.players.exists(player)) inventory.openInventory(player, 999, chestid)
        }

        if (weapongrabamount > 0) player.notify("Осталось контейнеров: " + weapongrabamount);
        else player.notify("~r~Больше контейнеров нет, ожидайте пополнение склада");
    }, 10000);
}, 2);

let alreadyKiller:Map<number,boolean> = new Map();
mp.events.add("playerDeath", (player: PlayerMp, reason: number, killer: PlayerMp) => {
    if(!killer) return;
    if(!user.isGang(player) && !user.isMafia(player)) return;
    if(!user.isUsmc(killer)) return;
    if (alreadyKiller.has(user.getId(player))) return;
    const inZone = killGangByArmyRewardList.find(item => player.dist(new mp.Vector3(item.x, item.y, item.z)) <= item.r)
    if (!inZone) return;
    user.addCashMoney(killer, inZone.cost);
    killer.notify(`~g~Вы получили награду за убийство члена ${user.getPlayerFractionName(player)}`);
    
    const ids = user.getId(player);
    alreadyKiller.set(ids, true);
    setTimeout(() => {
        alreadyKiller.delete(ids);
    }, alreadyKillerTimer * 60000)
});