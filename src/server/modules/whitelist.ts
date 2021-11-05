import { whiteListTestEntity } from "./entity/whiteListTest"
import { methods } from "./methods"
import { user } from "../user"

export const whitelist = {
    exist: (social:PlayerMp|string) => {
        return whitelist.list.includes(typeof social == "string" ? social.toLowerCase() : social.socialClub.toLowerCase())
    },
    list: <string[]>[],
    load: () => {
        whiteListTestEntity.findAll().then(items => {
            whitelist.list = []
            items.map(item => {
                whitelist.list.push(item.social.toLowerCase())
            })  
        })
    },
    new: (player:PlayerMp, social:string) => {
        whiteListTestEntity.create({
            social: social.toLowerCase(),
            admin: player ? user.getId(player) : 0
        })
        whitelist.list.push(social.toLowerCase())
    },
    remove: (social:string) => {
        whiteListTestEntity.destroy({
            where: { social: social.toLowerCase()}
        })
        whitelist.list.splice(whitelist.list.indexOf(social.toLowerCase()), 1)
        let target = mp.players.toArray().find(player => player.socialClub.toLowerCase() == social.toLowerCase());
        if(target){
            user.kickAntiCheat(target, "Пользователь исключён из списка тестеров проекта", "Удаление Social из списка доступа")
        }
    },
}

mp.events.add('server:login:success:after', (player:PlayerMp) => { 
    return true
    if(!methods.isTestServer()) return true;
    if (whitelist.list.includes(player.socialClub.toLowerCase()) || player.ip == "127.0.0.1") return true;
    setTimeout(() => {
        if (!mp.players.exists(player)) return;
        user.disableAllControls(player, true)
        user.hideLoadDisplay(player);
        user.bigAlert(player, `У вас нет доступа к тестовому серверу`, "error", 120000);
        user.kick(player, 'У вас нет доступа к тестовому серверу');
    }, 5000)
});