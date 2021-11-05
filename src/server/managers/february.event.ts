import { methods } from "../modules/methods";
import { menu } from "../modules/menu";
import { user } from "../user";
import { chat } from "../modules/chat";
import { shootingRecordsEntity } from "../modules/entity/shooting";
const POSITION = new mp.Vector3(-1754.93, 2926.23, 31.81)
const WEAPON_COST = 4000;
const AMMO_COST = 1000;
const WEAPON_COST_P = 2000;
const AMMO_COST_P = 750;

/** Ранг военного, который необходим чтобы выдавать разрешение на стрельбище */
const RANK_CAN_GIVE_ACCESS = 6;

let listTopString = ""
function updateTop3(player?:PlayerMp){
    shootingRecordsEntity.findAll({
        order: [
            ['count', 'ASC']
        ],
        limit: 5
    }).then(items => {
        if (player && !mp.players.exists(player)) return;
        let data: string[] = []
        items.map(res => {
            data.push(`${res.username} [${res.user}] -> ${(res.count / 1000).toFixed(2)}сек.`)
        })
        if (player) return player.call('updateshoottop3', [data])
        if (JSON.stringify(data) == listTopString) return;
        listTopString = JSON.stringify(data);
        mp.players.call('updateshoottop3', [data])
    })
    
}

mp.events.add("playerQuit", (player: PlayerMp) => {
    if (!player.startShootingEvent) return;
    player.dimension = 0;
    player.startShootingEvent = false;
});

mp.events.add('playerDeath', async function (player:PlayerMp) {
    if (!player.startShootingEvent) return;
    setTimeout(() => {
        player.spawn(new mp.Vector3(-1749.08, 2920.04, 31.81))
        player.dimension = 0;
        player.startShootingEvent = false;
    }, 1000)
});

mp.events.add("playerJoin", (player: PlayerMp) => {
    updateTop3(player)
})

const blip = mp.blips.new(119, POSITION, {
    dimension: 0,
    name: "Стрельбище",
    scale: 0.7,
    color: 2,
    shortRange: true
})

setTimeout(() => {
    methods.createEnterCheckpoint(new mp.Vector3(-1744.65, 2941.65, 35.54), async player => {
        if (player.dimension == 0) return player.notify(`~r~Вам необходимо начать испытание около стойки прежде чем заходить на полигон. Мишени появлятся без этого не будут`)
        if(player.startShootingEvent) return player.notify(`~r~Завершить прохождение испытания можно только на финише`)
        player.startShootingEvent = true;
        player.notify('~g~Время пошло')
        const start = new Date().getTime();
        const status:boolean = await mp.events.callClient(player, 'shootingRangeWait');
        const end = new Date().getTime();
        player.startShootingEvent = false;
        player.dimension = 0;
        user.teleport(player, -1749.08, 2920.04, 31.81)
        if (!status) return player.notify(`~r~Вы провалили испытание`)
        
        let res = end - start;
        shootingRecordsEntity.findOne({where: {user: user.getId(player)}}).then(result => {
            if(!result){
                shootingRecordsEntity.create({
                    user: user.getId(player),
                    username: user.getRpName(player),
                    count: res
                }).then(() => {
                    updateTop3()
                })
                player.notify(`~g~Вы справились за ${(res / 1000).toFixed(2)}сек`)
            } else {
                if (result.count > res){
                    player.notify(`~g~Вы справились за ${(res / 1000).toFixed(2)}сек. Это рекорд. Ваш предыдущий лучший результат: ${(result.count / 1000).toFixed(2)}сек.`)
                    result.count = res;
                    result.username = user.getRpName(player);
                    result.save().then(() => {
                        updateTop3()
                    });
                } else {
                    player.notify(`~g~Вы справились за ${(res / 1000).toFixed(2)}сек. Ваш лучший результат: ${(result.count / 1000).toFixed(2)}сек.`)
                }
            }
        })
    }, 1.5, -1)
    
    methods.createDynamicCheckpoint(POSITION, "Нажмите ~g~Е~s~ чтобы открыть меню", player => {
        let m = menu.new(player, "", "Стрельбище")
        m.sprite = "shopui_title_gr_gunmod"
        m.newItem({
            name: "~b~Таблица лидеров",
            onpress: () => {
                shootingRecordsEntity.findAll({
                    order: [
                        ['count', 'ASC']
                    ],
                    limit: 50
                }).then(items => {
                    let submenu = menu.new(player, "Топ-50 лидеров");
                    shootingRecordsEntity.findOne({
                        where: {user: user.getId(player)}
                    }).then(me => {
                        if (me){
                            submenu.newItem({
                                name: `Ваш результат: ~b~${me.username} [${me.user}]`,
                                more: `${(me.count / 1000).toFixed(2)}сек.`
                            }) 
                        }
                        items.map(res => {
                            submenu.newItem({
                                name: `${res.username} [${res.user}]`,
                                more: `${(res.count / 1000).toFixed(2)}сек.`
                            })
                        })
                        submenu.open();
                    })
                })
            }
        })
        if(user.isUsmc(player) && user.isLeader(player)){
            m.newItem({
                name: "~r~Очистить таблицу рекордов",
                onpress: () => {
                    user.accept(player, "Вы уверены?").then(status => {
                        if(!status) return;
                        shootingRecordsEntity.destroy({where: {}}).then((cnt) => {
                            if(cnt == 0) return player.notify(`~r~Таблица уже обнулена`);
                            updateTop3()
                            player.notify(`~g~Таблица успешно обнулена`);
                        })
                    })
                }
            })
        }
        if ((user.isUsmc(player) && user.getPlayerFractionRank(player) >= RANK_CAN_GIVE_ACCESS) || user.isAdminNow(player, 4)){
            m.newItem({
                name: "~b~Выдать разрешение на стрельбище",
                desc: "Разрешение выдаётся на 1 час",
                onpress: () => {
                    menu.selectNearestPlayers(player, 5).then(target => {
                        if (!target) return;
                        if(user.isUsmc(target)) return player.notify(`~r~Военному не требуется специальное разрешение на посещение стрельбища`);
                        if (target.shootingRangeAccess) return player.notify(`~r~Гражданин уже имеет временное специальное разрешение на посещение стрельбища`);
                        if (!user.get(target, "gun_lic")) return player.notify(`~r~У гражданина нет лицензии на оружие. Такому человеку нельзя выдавать разрешение`);
                        target.shootingRangeAccess = true;
                        target.notify(`~g~Вам выдано временное разрешение на посещение стрельбища`);
                        setTimeout(() => {
                            if(!mp.players.exists(target)) return;
                            target.notify(`~r~Временное разрешение на посещение стрельбища истекло`)
                        }, 60 * 60000)
                    })
                }
            })
        }
        if(player.dimension == 0){
            m.newItem({
                name: "Начать испытание",
                onpress: () => {
                    if (!user.get(player, "gun_lic")) return player.notify(`~r~Принимать участие могут только те, кто имеет лицензию на оружие`)
                    if (!user.isUsmc(player) && !player.shootingRangeAccess) return player.notify(`~r~У вас нет разрешения на посещение стрельбища`)
                    if(player.weaponsAll.length == 0) return player.notify(`~r~Вам стоит экипировать оружие перед тем, как начать`)
                    if(player.vehicle) return player.notify(`~r~Не в транспорте`)
                    player.dimension = player.id + 1;
                    user.teleport(player, -1749.64, 2944.54, 32.81, 235.56)
                    player.notify('~g~Проследуйте к точке старта и начинайте.')
                    m.close()
                }
            })
        } else {
            m.newItem({
                name: "Завершить испытание",
                onpress: () => {
                    if (player.startShootingEvent) player.call('shootingRangeClose')
                    else player.dimension = 0;
                }
            })
        }
        m.newItem({
            name: "MP5 и патроны",
            more: (WEAPON_COST + AMMO_COST)+"$",
            onpress: () => {
                if(!user.get(player, "gun_lic")) return player.notify(`~r~Принимать участие могут только те, кто имеет лицензию на оружие`)
                if (!user.isUsmc(player) && !player.shootingRangeAccess) return player.notify(`~r~У вас нет разрешения на посещение стрельбища`)
                if(player.weaponsAll.find(item => item.item == 103)){
                    if (user.getCashMoney(player) < AMMO_COST) return player.notify("У вас недостаточно средств для оплаты патронов")
                    user.removeMoney(player, AMMO_COST)
                    player.notify("Вы получили пачку патронов")
                } else {
                    if (user.getCashMoney(player) < (WEAPON_COST + AMMO_COST)) return player.notify("У вас недостаточно средств для оплаты оружия и патронов")
                    user.removeMoney(player, WEAPON_COST + AMMO_COST)
                    player.notify("Вы получили MP5 и пачку патронов")
                }
                user.giveWeaponByHash(player, mp.joaat('WEAPON_SMG'), 200);
                m.close()
            }
        })
        m.newItem({
            name: "Пистолет и патроны",
            more: (WEAPON_COST_P + AMMO_COST_P)+"$",
            onpress: () => {
                if(!user.get(player, "gun_lic")) return player.notify(`~r~Принимать участие могут только те, кто имеет лицензию на оружие`)
                if (!user.isUsmc(player) && !player.shootingRangeAccess) return player.notify(`~r~У вас нет разрешения на посещение стрельбища`)
                if(player.weaponsAll.find(item => item.item == 77)){
                    if (user.getCashMoney(player) < AMMO_COST_P) return player.notify("У вас недостаточно средств для оплаты патронов")
                    user.removeMoney(player, AMMO_COST_P)
                    player.notify("Вы получили пачку патронов")
                } else {
                    if (user.getCashMoney(player) < (WEAPON_COST_P + AMMO_COST_P)) return player.notify("У вас недостаточно средств для оплаты оружия и патронов")
                    user.removeMoney(player, WEAPON_COST_P + AMMO_COST_P)
                    player.notify("Вы получили пистолет и пачку патронов")
                }
                user.giveWeaponByHash(player, mp.joaat('WEAPON_PISTOL'), 100);
                m.close()
            }
        })
        m.open()
    }, 2, -1)
}, 1000)

