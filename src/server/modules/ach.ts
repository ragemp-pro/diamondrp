import { user } from "../user"
import { chat } from "./chat";

const reasonListNames = {
    TELEPORT_FOOT: "Телепортация на ногах",
    TELEPORT_VEHICLE: "Телепортация на транспорте",
    AUTO_HEAL: "Автопополнение здоровья",
    WEAPON: "Оружие",
    VEHICLE_BOOST: "Ускорение ТС",
    USER_DATA: "Подделка клиентских данных",
}

mp.events.add('cheat:detect', (player: PlayerMp, reason: "TELEPORT_FOOT" | "TELEPORT_VEHICLE" | "AUTO_HEAL" | "WEAPON" | "VEHICLE_BOOST", more?:string) => {
    if(!user.isLogin(player)) return;
    if(user.isAdmin(player)) return;
    if(reason == "AUTO_HEAL" && player.healProtect) return;
    if(reason.includes('TELEPORT_') && player.teleportProtect) return;
    user.log(player, "Anticheat", `${reasonListNames[reason] ? reasonListNames[reason] : reason}${more ? ` ${more}`:''}`);
    mp.players.toArray().filter(target => user.isAdmin(target) && target.registerAnticheat).forEach(target => {
        target.outputChatBox(`!{#FF383B}Anti-cheat Guard: ${user.getRpName(player)} (${user.getId(player)}): ${reasonListNames[reason] ? reasonListNames[reason] : reason}${more ? ` ${more}` : ''}`);
    })
    if (reason != "WEAPON") return;
    user.kickAntiCheat(player, reason)
})