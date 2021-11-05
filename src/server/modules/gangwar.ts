import { app } from "../web"
import { gangWarTerData, GangTerData, GangPosition, attackMinRank } from "../../declaration/gangwar"
import { gangWarsZoneEntity } from "./entity/gangWarsZone"
import { fractionUtil } from "../../util/fractions"
import { user } from "../user"
import { menu } from "./menu"
import { methods } from "../modules/methods"
import { moneyChests } from "./moneyChest"
const minTimeAttack = 15
const maxTimeAttack = 22

/** Количество участников фракции, которые должны быть в сети */
const onlineRequest = 5

/** Радиус, на котором мы учитываем AFTER DEATH */
const afterDeathRadius = 200
/** Радиус, на котором мы учитываем */
const distanceForKill = 150

/** Сколько раз между рестартами банда может нападать */
const maxAttacksFraction = 3;
/** Сколько раз между рестартами на банду можно напасть */
const maxAttacksFractionTarget = 4;

/** Количество минут, в течении которых идёт капт */
const warTime = 12;

export const moneyPerTer = 100;
export const baseDzone = 75



export const gangRespPosition: GangPosition[] = [
    { x: 414.68, y: -2071.86, z: 21.50, fractionid: 21, color: 5},
    { x: -41.47, y: -1490.43, z: 31.39, fractionid: 19, color: 52},
    { x: 102.63, y: -1957.95, z: 20.74, fractionid: 18, color: 7},
    { x: 423.09, y: -1562.20, z: 29.28, fractionid: 20, color: 38},
]

gangRespPosition.map(item => {
    mp.blips.new(84, new mp.Vector3(item.x, item.y, item.z), {
        color: item.color,
        name: "Убежище",
        scale: 0.75,
        shortRange:true
    })
})

export let attackList:Map<
/** ID Территории */
number,{
    /** Владелец терры */
    owner:number,
    /** Атакаующая сторона */
    attack:number,
    /** UNIX время начала атаки */
    start:number,
    /** Количество убийств владельца теры */
    killowner:number,
    /** Количество убийств атакущей стороны */
    killattack:number,
    /** Место проведения капта (его центр) */
    position: { x: number; y: number; z: number;};
    killfeed: { id?: number; killer: string, gun: string, who: string, attack: boolean }[],
    timer:number
}> = new Map()
/** Индикатор блокировки терры */
export let attackTerBlock:Map<number,boolean> = new Map();
/** Индикатор временной блокировки */
export let attackBlock:Map<number,boolean> = new Map();
/** Счётчик атак после рестарта */
export let attackCounter:Map<number,number> = new Map();
/** Счётчик защит после рестарта */
export let defenceCounter:Map<number,number> = new Map();

export const reloadGangWarZones = () => {
    gangWarsZoneEntity.findAll().then(q => {
        gangzones = [];
        q.map(item => {
            gangzones.push({ ownerid: item.owner, resp: item.resp, id: item.id, position: item.position, name: item.name, ownername: item.owner ? fractionUtil.getFractionName(item.owner) : "Никто", attack: attackList.has(item.id), color: fractionUtil.getFractionColor(item.owner) })
        })
        loadTerrData()
    })
}

const updateTerOwner = (id:number,ownerid:number) => {
    // console.log(id, ownerid)
    gangWarsZoneEntity.findOne({ where: { id}}).then(item => {
        if(item){
            item.owner = ownerid;
            item.save().then(() => {
                reloadGangWarZones()
            })
        }
    })
}

export let gangzones: gangWarTerData[] = [
    // { position: { x: 300, y: 0, z: 0, d: 210 }, name: "Глотка мангуста", ownername:"Опастные обезьяны", attack: true, color: {r:255, g: 0, b: 0}}
]

app.get("/warzones", (req, res) => {
    res.send(gangzones);
})
app.get("/resps", (req, res) => {
    res.send(gangRespPosition);
})

setTimeout(() => {
    mp.events.register('tablet:gangter:data:load', (player: PlayerMp) => {
        if (!user.isGang(player)) return player.notify('~r~Вы не в банде')
        let list: GangTerData[] = []
        let fractionid = user.getPlayerFraction(player)
        gangzones.filter(item => methods.pointInBox([player.position.x, player.position.y], methods.coordBoxToPoints(item.position, item.position.d))).map(item => {
            list.push({
                id: item.id,
                name: item.name,
                attack: !!item.attack,
                resp: !!item.resp,
                ownerid: item.ownerid,
                ownername: "",
            })
        })
        gangzones.filter(item => item.ownerid == fractionid && !methods.pointInBox([player.position.x, player.position.y], methods.coordBoxToPoints(item.position, item.position.d))).map(item => {
            list.push({
                id: item.id,
                name: item.name,
                attack: !!item.attack,
                resp: !!item.resp,
                ownerid: item.ownerid,
                ownername: "",
            })
        })
        gangzones.filter(item => item.ownerid != fractionid && !methods.pointInBox([player.position.x, player.position.y], methods.coordBoxToPoints(item.position, item.position.d))).map(item => {
            list.push({
                id: item.id,
                name: item.name,
                attack: !!item.attack,
                resp: !!item.resp,
                ownerid: item.ownerid,
                ownername: "",
            })
        })

        let countter = gangzones.filter(item => item.ownerid == fractionid).length
        mp.events.triggerBrowser(player, 'tablet:gangter:data', list, user.isSubLeader(player), user.isLeader(player), user.getPlayerFraction(player), (countter * moneyPerTer + mp.players.toArray().filter(target => user.getPlayerFraction(target) == fractionid).length * countter * (moneyPerTer * .1)), user.getPlayerFractionRank(player))
    })
    mp.events.register('tablet:gangter:pos', (player: PlayerMp, id: number) => {
        if (!user.isGang(player)) return player.notify('~r~Вы не член банды')
        let q = gangzones.find(item => item.id == id)
        if (!q) return player.notify('~r~Территория не обнаружена');
        user.setWaypoint(player, q.position.x, q.position.y)
    })
    mp.events.register('tablet:gangter:sell', (player: PlayerMp, id: number) => {
        if (!user.isGang(player)) return player.notify('~r~Вы не член банды')
        let q = gangzones.find(item => item.id == id)
        if (!q) return player.notify('~r~Территория не обнаружена');
        if (!q.ownerid) return player.notify('~r~Территория никому не принадлежит');
        if (q.ownerid != user.getPlayerFraction(player)) return player.notify('~r~Территория не принадлежит вашей банде');
        if (methods.distanceToPos2D(player.position, q.position) > q.position.d) return player.notify('~r~Вы должны находится на территории');
        if (q.resp) return player.notify('~r~Респу нельзя продавать');
        if (q.attack) return player.notify('~r~Территория под атакой');
        if (!user.isLeader(player)) return player.notify('~r~Данное действие может выполнить только лидер')
        menu.input(player, "Введите стоимость", "", 8, "int").then(sum => {
            if (!sum) return player.notify('~r~Сумма не указана');
            if (isNaN(sum) || sum < 0 || sum > 100000000) return player.notify('~r~Сумма указана не верно');
            menu.selectFraction(player, 'gang').then(targetfraction => {
                menu.close(player)
                if (typeof targetfraction !== 'number') return;
                if (targetfraction == user.getPlayerFraction(player)) return player.notify('~r~Вы действительно хотите продать территорию самим себе?')
                let target = user.getNearestPlayers(player, 5).find(item => user.getPlayerFraction(item) == targetfraction && user.isLeader(player));
                if (!target) return player.notify('~r~Лидер ' + fractionUtil.getFractionName(targetfraction) + ' поблизости не обнаружен');
                if (!gangzones.find(item => item.id != q.id && item.ownerid == user.getPlayerFraction(target) && methods.distanceToPos2D(q.position, item.position) <= (108))) return player.notify('~r~Данная территория не прилегает к подконтрольным выбранной банде');
                player.notify('~g~Предложение отправлено')
                user.accept(target, "Забрать территорию?", "~g~Забрать за $" + sum, "~r~Нет").then(status => {
                    if (!mp.players.exists(player)) return;
                    if (!mp.players.exists(target)) return;
                    if (!status) {
                        player.notify('~r~Предложение отклонено')
                        target.notify('~r~Вы отклонили предложение')
                        return;
                    }
                    if (user.getCashMoney(target) < sum) {
                        player.notify('~r~Продать не удалось')
                        target.notify('~r~У вас недостаточно средств')
                        return;
                    }
                    user.removeCashMoney(target, sum)
                    user.addCashMoney(player, sum)
                    gangWarsZoneEntity.findOne({ where: { id } }).then(item => {
                        item.owner = targetfraction;
                        item.save().then(() => {
                            reloadGangWarZones();
                            player.notify('~g~Успешно')
                            target.notify('~g~Успешно')
                        })
                    })
                })
            })
        })
    })
    mp.events.register('tablet:gangter:attack', (player:PlayerMp, id:number) => {
        if (!user.isGang(player)) return player.notify('~r~Вы не член банды')
        let q = gangzones.find(item => item.id == id)
        if (!q) return player.notify('~r~Территория не обнаружена');
        if (!q.ownerid) return player.notify('~r~Территория никому не принадлежит');
        if (q.ownerid == user.getPlayerFraction(player)) return player.notify('~r~Территория принадлежит вашей банде');
        if (!methods.pointInBox([player.position.x, player.position.y], methods.coordBoxToPoints(q.position, q.position.d))) return player.notify('~r~Вы должны находится на территории');
        if (user.getPlayerFractionRank(player) < attackMinRank) return player.notify(`~r~Для атаки необходимо иметь ранг ${attackMinRank} или выше`)
        if (q.resp) return player.notify('~r~Респу нельзя атаковать');
        if (attackCounter.has(user.getPlayerFraction(player))){
            if (attackCounter.get(user.getPlayerFraction(player)) >= maxAttacksFraction){
                return player.notify('~r~В сутки можно нападать только ' + maxAttacksFraction+' раза');
            }
        }
        if (defenceCounter.has(user.getPlayerFraction(player))){
            if (defenceCounter.get(q.ownerid) >= maxAttacksFractionTarget){
                return player.notify('~r~На эту банду уже слишком много раз нападали');
            }
        }
        if (attackTerBlock.has(q.id)){
            player.notify('~r~У данной территории временный иммунитет');
        }
        let time = new Date();
        if (!methods.isTestServer() && (time.getHours() < minTimeAttack || time.getHours() > maxTimeAttack)) return player.notify(`~r~Атаковать можно с ${minTimeAttack} до ${maxTimeAttack} OOC времени`);
        if (gangzones.find(item => item.attack)) return player.notify('~r~На данный момент уже атакуется другая территория');
        if (!gangzones.find(item => item.id != q.id && item.ownerid == user.getPlayerFraction(player) && methods.distanceToPos2D(q.position, item.position) <= (108))) return player.notify('~r~Данная территория не прилегает к подконтрольным вашей банде');
        if (attackBlock.has(user.getPlayerFraction(player))) return player.notify('~r~Ваша банда уже атакует либо защищает какую то территорию либо это происходило менее 30 минут назад');
        let protects: PlayerMp[] = mp.players.toArray().filter(item => user.getPlayerFraction(item) == q.ownerid);
        if (!methods.isTestServer() && protects.length < onlineRequest) return player.notify(`~r~Количество членов банды ${fractionUtil.getFractionName(q.ownerid)} в штате менее ${onlineRequest}`)
        let attacks: PlayerMp[] = mp.players.toArray().filter(item => user.getPlayerFraction(item) == user.getPlayerFraction(player));
        if (!methods.isTestServer() && attacks.length < onlineRequest) return player.notify(`~r~Количество членов банды ${fractionUtil.getFractionName(user.getPlayerFraction(player))} в штате менее ${onlineRequest}`)
        player.notify('~g~Вы начали атаку');
        mp.players.toArray().filter(target => user.getPlayerFraction(target) == q.ownerid).map(target => {
            // target.notify(`~r~На вашу территорию (${q.name}) напали`);
            user.bigAlert(target, `На вашу территорию (${q.name}) напали`, 'warning', 7500);
            user.setWaypoint(target, q.position.x, q.position.y)
        })
        attack(q, user.getPlayerFraction(player))
    })
}, 100)

function attack(ter: gangWarTerData, attack:number){
    const terid = ter.id
    attackList.set(ter.id, { owner: ter.ownerid, attack, killowner: 0, killattack: 0, start: methods.getTimeStamp(), position: ter.position, killfeed: [], timer: warTime});
    reloadGangWarZones();
    mp.players.call('gangWarPos', [JSON.stringify(ter.position)])
    let ints = setInterval(() => {
        let item = attackList.get(terid)
        if (item){
            if (item.timer > 0){
                attackList.set(terid, { ...item, timer: item.timer - 1})
            } else {
                clearInterval(ints)
            }
        } else {
            clearInterval(ints)
        }
    }, 1000)
    setTimeout(() => {
        let data = attackList.get(ter.id)
        if(!data) return;
        mp.players.call('gangWarStop')
        if(data.killattack == 0 && data.killowner == 0){
            if (mp.players.toArray().filter(target => [attack].includes(user.getPlayerFraction(target)) && target.dist(data.position) <= distanceForKill/2).length > 0){
                mp.players.toArray().filter(target => [ter.ownerid, attack].includes(user.getPlayerFraction(target))).map(target => {
                    if (user.getPlayerFraction(target) == ter.ownerid) target.notify('~r~Вы не смогли отстоять территорию');
                    else target.notify('~g~Ваша банда захватила территорию');
                    mp.events.triggerBrowser(target, 'gangWarEnd')
                })
                setTimeout(() => {
                    updateTerOwner(terid, attack)
                }, 3000)
            } else {
                mp.players.toArray().filter(target => [ter.ownerid, attack].includes(user.getPlayerFraction(target))).map(target => {
                    if (user.getPlayerFraction(target) == ter.ownerid) target.notify('~g~Ваша банда смогла отстоять территорию');
                    else target.notify('~r~Вам не удалось захватить территорию');
                    mp.events.triggerBrowser(target, 'gangWarEnd')
                })
                setTimeout(() => {
                    reloadGangWarZones();
                }, 3000)
            }

        } else if(data.killattack > data.killowner){
            // Тера переходит
            mp.players.toArray().filter(target => [ter.ownerid, attack].includes(user.getPlayerFraction(target))).map(target => {
                if (user.getPlayerFraction(target) == ter.ownerid) target.notify('~r~Вы не смогли отстоять территорию');
                else target.notify('~g~Ваша банда захватила территорию');
                mp.events.triggerBrowser(target, 'gangWarEnd')
            })
            setTimeout(() => {
                updateTerOwner(terid, attack)
            }, 3000)
        } else {
            mp.players.toArray().filter(target => [ter.ownerid, attack].includes(user.getPlayerFraction(target))).map(target => {
                if (user.getPlayerFraction(target) == ter.ownerid) target.notify('~g~Ваша банда смогла отстоять территорию');
                else target.notify('~r~Вам не удалось захватить территорию');
                mp.events.triggerBrowser(target, 'gangWarEnd')
            })
            setTimeout(() => {
                reloadGangWarZones();
            }, 3000)
        }
        if (attackCounter.has(attack)){
            attackCounter.set(attack, attackCounter.get(attack) + 1)
        } else {
            attackCounter.set(attack, 1)
        }
        if (defenceCounter.has(ter.ownerid)){
            defenceCounter.set(ter.ownerid, defenceCounter.get(ter.ownerid) + 1)
        } else {
            defenceCounter.set(ter.ownerid, 1)
        }
        attackBlock.set(attack, true);
        setTimeout(() => {
            attackBlock.delete(attack);
        }, 30*1000*60)
        attackTerBlock.set(terid,true);
        setTimeout(() => {
            attackTerBlock.delete(terid);
        }, 60000 * 60 * 1.5)
        attackList.delete(ter.id);
        
    }, warTime*60*1000)
    sendWarData({ owner: ter.ownerid, attack, killowner: 0, killattack: 0, start: methods.getTimeStamp(), position: ter.position, killfeed: [], timer: warTime })
}

mp.events.add('server:login:success:after', (player:PlayerMp) => {
    loadTerrData(player)
    if(!user.isGang(player)) return;
    attackList.forEach(item => {
        if (user.getPlayerFraction(player) == item.attack || user.getPlayerFraction(player) == item.owner){
            let targets = mp.players.toArray().filter(target => [item.owner, item.attack].includes(user.getPlayerFraction(target)));
            const attacks = targets.filter(player => user.getPlayerFraction(player) === item.attack && methods.distanceToPos(item.position, player.position) < 150).length;
            const owners = targets.filter(player => user.getPlayerFraction(player) === item.owner && methods.distanceToPos(item.position, player.position) < 150).length;
            mp.events.triggerBrowser(player, 'gangWarDataSend', item.killattack, item.killowner, item.attack, item.owner, item.timer, attacks, owners)
            player.call('gangWarPos', [JSON.stringify(item.position)])
        }
    })
})


function loadTerrData(player?:PlayerMp){
    if (player) return player.call('gangTerData', [JSON.stringify(gangzones)])
    mp.players.call('gangTerData', [JSON.stringify(gangzones)])
}

mp.events.add("playerDeath", (player:PlayerMp, reason:number, killer: PlayerMp) => {
    if(!killer) return;
    if (!user.isGang(player)) return;
    if (!user.isGang(killer)) return;
    let attackGetq = [...attackList].find(([_, item]) => [item.attack, item.owner].includes(user.getPlayerFraction(player)));
    if (!attackGetq) return;
    if (![...attackList].find(([_, item]) => [item.attack, item.owner].includes(user.getPlayerFraction(killer)))) return;
    if (![...attackList].find(([_, item]) => [item.attack, item.owner].includes(user.getPlayerFraction(player)))) return;
    let attackGet = attackGetq[1];
    if (methods.distanceToPos2D(killer.position, attackGet.position) > distanceForKill) return;
    
    // const afterDeathKiller = user.isAfterDeath(killer, new mp.Vector3(attackGet.position.x, attackGet.position.y, attackGet.position.z), afterDeathRadius)
    // const afterDeathTarget = user.isAfterDeath(player, new mp.Vector3(attackGet.position.x, attackGet.position.y, attackGet.position.z), afterDeathRadius)
    // if (afterDeathKiller && afterDeathTarget){
    //     player.notify(`~r~Вы вернулись после смерти, убийство засчитано не будет`);
    //     killer.notify(`~r~Вы вернулись после смерти, убийство засчитано не будет`);
    //     return 
    // }
    attackGet.killfeed.push({ killer: `${user.getRpName(killer)}`, who: `${user.getRpName(player)}`, gun: "", attack: attackGet.attack == user.getPlayerFraction(killer) })
    setTimeout(() => {
        let targets = mp.players.toArray().filter(target => [attackGet.owner, attackGet.attack].includes(user.getPlayerFraction(target)));
        const attacks = targets.filter(player => user.getPlayerFraction(player) === attackGet.attack && methods.distanceToPos(attackGet.position, player.position) < 150).length;
        const owners = targets.filter(player => user.getPlayerFraction(player) === attackGet.owner && methods.distanceToPos(attackGet.position, player.position) < 150).length;
        targets.map(target => {
            mp.events.triggerBrowser(target, 'gangWarKill', { killer: `${user.getRpName(killer)}`, who: `${user.getRpName(player)}`, gun: "", attack: attackGet.attack == user.getPlayerFraction(killer), targetattack: attackGet.attack == user.getPlayerFraction(player) }, attackGet.killattack, attackGet.killowner, attacks, owners)
        })
    }, 500)
    // if(afterDeathKiller){
    //     killer.notify(`~r~Вы вернулись после смерти. Ваш фраг зачислен вражеской команде`);
    //     if (attackGet.owner == user.getPlayerFraction(killer)) attackGet.killattack += 1;
    //     if (attackGet.attack == user.getPlayerFraction(killer)) attackGet.killowner += 1;
    //     return
    // }
    // if (attackGet.owner == user.getPlayerFraction(killer)) attackGet.killowner += (afterDeathTarget ? 2 : 1);
    // if (attackGet.attack == user.getPlayerFraction(killer)) attackGet.killattack += (afterDeathTarget ? 2 : 1);
    if (user.getPlayerFraction(player) == user.getPlayerFraction(killer)) {
        if (attackGet.owner == user.getPlayerFraction(killer)) attackGet.killattack += 1;
        if (attackGet.attack == user.getPlayerFraction(killer)) attackGet.killowner += 1;
    } else if (attackGet.owner == user.getPlayerFraction(killer)) attackGet.killowner += 1;
    else if (attackGet.attack == user.getPlayerFraction(killer)) attackGet.killattack += 1;
});

function sendWarData(item: {
    owner: number;
    attack: number;
    start: number;
    killowner: number;
    killattack: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
    killfeed: {
        id?: number;
        killer: string;
        gun: string;
        who: string;
        attack: boolean;
    }[], timer:number
}){
    let targets = mp.players.toArray().filter(target => [item.owner, item.attack].includes(user.getPlayerFraction(target)));

    const attacks = targets.filter(player => user.getPlayerFraction(player) === item.attack && methods.distanceToPos(item.position, player.position) < 150).length;
    const owners = targets.filter(player => user.getPlayerFraction(player) === item.owner && methods.distanceToPos(item.position, player.position) < 150).length;

    targets.map(target => {
        mp.events.triggerBrowser(target, 'gangWarDataSend', item.killattack, item.killowner, item.attack, item.owner, item.timer, attacks, owners)
    })
    mp.players.call('gangWarPos', [JSON.stringify(item.position)])
}


let givedmoney = false;
setInterval(() => {
    if (givedmoney) return;
    let d = new Date();
    let used = (d.getMinutes() == 2);
    if (used) {
        givedmoney = true;
        setTimeout(() => {
            givedmoney = false
        }, 120000)
        fractionUtil.list.filter(item => item.gang).map((fraction) => {
            let countter = gangzones.filter(item => item.ownerid == fraction.id).length
            if (countter > 0) {
                let givechest = false;
                moneyChests.forEach(item => {
                    if (givechest) return;
                    if (item.fraction == fraction.id) {
                        givechest = true;
                        item.money += methods.parseInt((moneyPerTer * countter));
                        item.save();
                    }
                })
            }
        })
    }
}, 30000)