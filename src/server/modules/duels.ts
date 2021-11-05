import { methods } from "./methods";
import { menu } from "./menu";
import { user } from "../user";
import { randomArrayEl } from "../../util/methods";
import { inventory } from "../inventory";
import { addAdminTP } from "../config/adminsTp";
export const registerPos = new mp.Vector3(-266.39, -2035.50, 29.15)
export const registerPos2 = new mp.Vector3(-272.05, -2038.56, 29.15)
export const exitPos = new mp.Vector3(-281.06, -2030.59, 30.15)
let activeDuelsIds = 0;
let activeDuels = new Map<number, {
    /** Кто создал */
    user: PlayerMp;
    /** Кто создал */
    user2?: PlayerMp;
    /** Название */
    user_name: string;
    /** Пароль, если указан */
    password: string;
    /** Ставка */
    cost: number;
    // /** Количество участников в одной команде */
    // count_in_team: number;
    // /** Количество команд */
    // count_teams: number;
    // /** Команды */
    // teams:number[][];
}>();
const costList:number[] = [0, 100, 500, 1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000, 100000];
let list: [number, number, number, number][][] = [
    [[1373.21, -758.82, 67.20, 355.64], [1379.76, -723.67, 67.19, 172.21]],
];
// let max_teams = 0;
// list.map(q => {if(max_teams < q.length) max_teams = q.length;})

const blip = mp.blips.new(310, registerPos, {
    dimension: 0,
    name: "Дуэли",
    scale: 0.5,
    color: 75,
    shortRange: true
})

addAdminTP('Дуэль', registerPos);

export const openDuelMenu = (player: PlayerMp) => {

    // if (user.isInMp(player)) return player.notify('~r~Вы не можете принимать участие в мероприятиях, поскольку уже зарегистрированы в другом мероприятии');
    let m = menu.new(player, "", "Действия");
    m.sprite = "duels"
    if(player.duelLobby){
        m.newItem({
            name: "~r~Покинуть текущее мероприятие",
            onpress: () => {
                m.close();
                let data = activeDuels.get(player.duelLobby);
                if(!data) return player.duelLobby = null;
                if(data.cost > 0) user.addCashMoney(player, data.cost);
                activeDuels.delete(player.duelLobby)
                player.duelLobby = null;
                player.notify('~g~Вы покинули мероприятие');
            }
        })
    }
    m.newItem({
        name: "Создать мероприятие",
        onpress: () => {
            if (user.isInMp(player)) return player.notify('~r~Вы не можете регистрировать мероприятие, поскольку уже зарегистрированы в другом мероприятии');
    
            let password = "";
            let cost = costList[0];
            let count_in_team = 1;
            let count_teams = 2;
            const createLobby = () => {
                if (user.isInMp(player)) return player.notify('~r~Вы не можете регистрировать мероприятие, поскольку уже зарегистрированы в другом мероприятии');
                let submenu = menu.new(player, "Создание мероприятия", "Параметры");
                submenu.newItem({
                    name: "Пароль",
                    more: `${password ? "Указан" : "Не указан"}`,
                    desc: "Если указать пароль, то принять участие в мероприятии сможет только тот, кто его укажет",
                    onpress: () => {
                        menu.input(player, "Введите пароль, если необходим", "", 15, "password").then(passwords => {
                            if (passwords === null) return createLobby();
                            password = passwords;
                            createLobby();
                        })
                    }
                })
                // if (max_teams > 2){
                //     submenu.newItem({
                //         name: `Количество команд`,
                //         type: "range",
                //         rangeselect: [2, max_teams],
                //         listSelected: (count_teams - 2),
                //         onchange: (val) => {
                //             let sel = val + 2;
                //             count_teams = sel;
                //         }
                //     })
                // }
                // submenu.newItem({
                //     name: `Количество участников в одной команде`,
                //     type: "range",
                //     rangeselect: [1, 15],
                //     listSelected: (count_in_team - 1),
                //     onchange: (val) => {
                //         let sel = val + 1;
                //         count_in_team = sel;
                //     }
                // })
                submenu.newItem({
                    name: `Стоимость участия`,
                    type: "list",
                    list: costList.map(item => {return item.toString()+"~g~$"}),
                    listSelected: costList.indexOf(cost),
                    onchange: (val) => {
                        cost = costList[val];
                    }
                })
                submenu.newItem({
                    name: `~g~Зарегистрировать мероприятие`,
                    onpress: () => {
                        if (user.isInMp(player)) return player.notify('~r~Вы не можете регистрировать мероприятие, поскольку уже зарегистрированы в другом мероприятии');
                        if(cost > user.getCashMoney(player)) return player.notify(`~r~Указанная ставка выше чем вы можете поставить`);
                        submenu.close();
                        activeDuelsIds = activeDuelsIds + 1;
                        const id = parseInt(`${activeDuelsIds}`);
                        let teams:number[][] = [];
                        for (let q = 0; q < count_teams; q++) teams.push([]);
                        player.duelLobby = id;
                        activeDuels.set(id, {
                            user: player,
                            user_name: user.getRpName(player),
                            password, cost, 
                            // count_in_team, count_teams, teams
                        })
                        player.notify('~g~Мероприятие зарегистрировано')
                        if (cost > 0) user.removeCashMoney(player, cost);
                    }
                })
                submenu.open();
            }
    
            createLobby();
        }
    })
    m.newItem({name:"~b~СПИСОК АКТИВНЫХ МЕРОПРИЯТИЙ"})
    activeDuels.forEach((item, id) => {
    
        const check = (notify = false) => {
            if (!activeDuels.has(id)) {
                if (notify) player.notify('~r~Мероприятие более не доступно')
                return false
            }
            if (item.user2){
                if (notify)player.notify('~r~Мероприятие уже запущено');
                return false;
            }
            let target = item.user;
            if (!target || !mp.players.exists(target)){
                if (notify)player.notify('~r~Организатор недоступен')
                activeDuels.delete(id);
                return false;
            }
            if (player.dist(target.position) > 100) {
                if (notify)player.notify('~r~Организатор уехал слишком далеко')
                activeDuels.delete(id);
                return false;
            }
            
            if (user.isInMp(player)) {
                if (notify) player.notify('~r~Вы не можете принимать участие в мероприятии, поскольку уже зарегистрированы в другом мероприятии')
                return false
            }
            return true
        }
    
        if (!check()) return;
        m.newItem({
            name: `#${id}. ${item.user_name}`,
            more: item.cost ? `${methods.numberFormat(item.cost)}~g~$` : "Тренировка",
            desc: `Пароль: ${item.password ? "Указан" : "Не указан"}`,
            onpress: async () => {
                if (!check(true)) return;
    
    
                if (user.getCashMoney(player) < item.cost) return player.notify('~r~У вас недостаточно средств чтобы принять участие в данном мероприятии');
                let havePass = !item.password ? true : (await menu.input(player, "Введите пароль от лобби", "", 15, "password")) == item.password;
                if(!havePass) return player.notify(`~r~Пароль указан не верно`);
                if (!check(true)) return;
    
                if(item.cost > 0) user.removeCashMoney(player, item.cost);
                let target = item.user;
                item.user2 = player;
                // activeDuels.set(id, item)
                player.duelLobby = id
                let pos_all = randomArrayEl(list)
                let pos1 = pos_all[0]
                let pos2 = pos_all[1]
    
                user.disableAllControls(player, true);
                user.disableAllControls(target, true);
    
                user.unEquipAllWeapons(player);
                user.unEquipAllWeapons(target);
    
                user.showLoadDisplay(player)
                user.showLoadDisplay(target)
    
                inventory.closeInventory(player);
                inventory.closeInventory(target);
    
                target.armour = 0;
                player.armour = 0;
    
                player.call('anticheat:inmp', [true])
                target.call('anticheat:inmp', [true])
    
                setTimeout(() => {
                    if(!mp.players.exists(player) || !mp.players.exists(target)) return;
                    user.teleport(player, pos1[0], pos1[1], pos1[2], pos1[3], target.id+1);
                    user.teleport(target, pos2[0], pos2[1], pos2[2], pos2[3], target.id+1);
                    setTimeout(() => {
                        if (!mp.players.exists(player) || !mp.players.exists(target)) return;
                        user.giveWeaponByHash(player, "WEAPON_REVOLVER", 50, true);
                        user.giveWeaponByHash(target, "WEAPON_REVOLVER", 50, true);
                        player.notify('Приготовьтесь');
                        target.notify('Приготовьтесь');
                        user.healProtect(player);
                        user.healProtect(target);
                        player.health = 100;
                        target.health = 100;
                        setTimeout(() => {
                            if(!mp.players.exists(player) || !mp.players.exists(target)) return;
                            user.disableAllControls(player, false);
                            user.disableAllControls(target, false);
                            player.notify('~g~Начали');
                            target.notify('~g~Начали');
                        }, methods.getRandomInt(2000, 5000))
                    }, 1000)
                }, 2000)
    
            }
        })
    })
    m.open();
}

methods.createDynamicCheckpoint(registerPos, "Нажмие ~g~E~w~ чтобы открыть центр регистрации дуэлей", player => {
    openDuelMenu(player)
})
methods.createDynamicCheckpoint(registerPos2, "Нажмие ~g~E~w~ чтобы открыть центр регистрации дуэлей", player => {
    openDuelMenu(player)
})

export const exitFromDuel = (looser:PlayerMp) => {
    let id = looser.duelLobby;
    let data = activeDuels.get(id);
    if(!data) return;
    let user1 = data.user;
    let user2 = data.user2;
    if (mp.players.exists(user1) && user1) user1.duelLobby = null;
    if (mp.players.exists(user2) && user2) user2.duelLobby = null;
    if (!data.user2) return activeDuels.delete(id);

    let winner = user1.id == looser.id ? user2 : user1


    
    if(mp.players.exists(looser)) looser.notify('~r~Вы проиграли')
    if (winner){
        winner.notify('~g~Вы победили');
        if (data.cost > 0) user.addCashMoney(winner, data.cost * 1.9);
    }
    if (mp.players.exists(user1) && mp.players.exists(user2) && data.cost > 0){
        methods.saveLog('Duel', `${user.getRpName(user1)} [${user.getId(user1)}] VS ${user.getRpName(user2)} [${user.getId(user2)}]. Winner - ${user.getId(winner)}. Bit: ${data.cost}, Reward: ${data.cost * 1.9}`)
    }
    activeDuels.delete(id);
    let targets = [user1, user2];
    targets.map(item => {
        if (!mp.players.exists(item)) return;
        user.clearWeapons(item);
        user.disableAllControls(item, true)
        setTimeout(() => {
            if (!mp.players.exists(item)) return;
            user.healProtect(item);
            if (item.health == 0){
                item.spawn(item.position);
            } else {
                item.health = 100
            }
            setTimeout(() => {
                if (!mp.players.exists(item)) return;
                user.disableAllControls(item, false)
                item.call('anticheat:inmp', [false])
                user.teleport(item, exitPos.x, exitPos.y, exitPos.z, 0, 0)
            }, 1000)
        }, 1000)
    })

}

mp.events.add('playerQuit', (player: PlayerMp) => {
    if(!player.duelLobby) return;
    exitFromDuel(player);
});
mp.events.add('playerDeath', (player: PlayerMp) => {
    if(!player.duelLobby) return;
    exitFromDuel(player);
});