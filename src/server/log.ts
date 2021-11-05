import { user } from "./user";
import { methods } from "./modules/methods";
import { logEntity } from "./modules/entity/logEntity";
import { customParams } from "./modules/admin";

export type LogType =
    "TryBlackList" |
    "Anticheat" |
    "ChangeFibId" |
    "Invite" |
    "Invite2" |
    "UnInvite" |
    "UnInvite2" |
    "ClearMoney" |
    "ChangeNick" |
    "BankTransferMoney" |
    "BusinessAddMoney" |
    "BusinessRemoveMoney" |
    "SpawnVehicle" |
    "PlayerSystem" |
    "PlayerJoin" |
    "PlayerRegister" |
    "PlayerLeave" |
    "PlayerKick" |
    "PlayerBan" |
    "PlayerBlackList" |
    "PlayerKill" |
    "PlayerEquip" |
    "PlayerUnEquip" |
    "PlayerBuy" |
    "PlayerRent" |
    "PlayerSell" |
    "ExplodeDoor" |
    "Grab" |
    "SetRank" |
    "SetRank2" |
    "Tattoo" |
    "Print" |
    "VehicleTuning" |
    "ChestLog" |
    "Casino" |
    "GarageTakeVehicle" |
    "GarageReturnVehicle" |
    "PlayerJoinFraction" |
    "PlayerLeaveFraction" |
    "PlayerChangeRankFraction" |
    "PlayerFractionBlackList" |
    "PlayerInterractionPlayer" |
    "PlayerInventoryInterraction" |
    "CofferAddMoney" |
    "CofferRemoveMoney" |
    "CofferEjectMoney" |
    "PlayerCuffed" |
    "PlayerUnCuffed" |
    "GosUnmask" |
    "GosFollow" |
    "GosCuffed" |
    "GosUnCuffed" |
    "GosWanted" |
    "GosUnWanted" |
    "GosJail" |
    "GosUnJail" |
    "PlayerSellBiz" |
    "PlayerSellCar" |
    "GosEvacuateVehicle" |
    "StartServer" |
    "AdminRebootServer" |
    "AdminJail" |
    "AdminUnJail" |
    "AdminJob"

export const log = {
    generatePlayerDump: (target: PlayerMp | number) => {
        return new Promise(async (resolve, reject) => {
            const id = typeof target == "number" ? target : user.getId(target);
            const online = user.getPlayerById(id)
            let data = !online ? await user.getUserDataFromDB(id) : null;
            target = user.getPlayerById(id);
            resolve( {
                id: id,
                status: online ? "online" : "offline",
                name: online ? user.getRpName(target) : data.rp_name,
                social: online ? target.socialClub : data.name,
                ip: online ? target.ip : "",
                lic: online ? target.serial : data.lic,
                position: online ? { x: target.position.x, y: target.position.y, z: target.position.z, d: target.dimension, h: target.heading } : null,
                health: online ? target.health : -1,
                armour: online ? target.armour : -1,
                money: online ? user.getCashMoney(target) : data.money,
                bank: online ? user.getBankMoney(target) : data.money_bank,
                donate: data ? data.money_donate : null,
                chips: online ? user.getChips(target) : data.chipsBalance,
                bank_number: online ? (user.get(target, 'bank_prefix') + '-' + user.get(target, 'bank_number')) : (data.bank_prefix + '-' + data.bank_number),
                fraction: online ? user.get(target, 'fraction_id') : data.fraction_id,
                rank: online ? user.get(target, 'rank') : data.rank,
                fraction2: online ? user.get(target, 'fraction_id2') : data.fraction_id2,
                rank2: online ? user.get(target, 'rank2') : data.rank2,
                wanted_level: online ? user.get(target, 'wanted_level') : data.wanted_level,
                wanted_reason: online ? user.get(target, 'wanted_reason') : data.wanted_reason,
                job: online ? user.get(target, 'job') : data.job,
                nearest: online ? mp.players.toArray().map(npl => {
                    // @ts-ignore
                    if (npl.dimension == target.dimension && npl.id != target.id) {
                        // @ts-ignore
                        const dist = methods.distanceToPos(npl.position, target.position);
                        if (dist < 20) {
                            return { id: user.getId(npl), dist, hp: npl.health }
                        }
                    }
                }) : []
            })
        })
    },
    convertIdPlayerToData: (target: PlayerMp|number) => {
        return (typeof target == "number" ? `@user${target}`:`@user${user.getId(target)}`);
    },
    new: (type: LogType, reason: string) => {
        if (!customParams.logs) return;
        
        // methods.debugStart('log '+type+': '+reason)
        let interractions: number[] = [];
        let list = reason.match(/@user\d+/g);
        if (list) {
            list.forEach(itm => {
                let id = methods.parseInt(itm.replace('@user', ""))
                if(!id) return;
                if (interractions.includes(id)) return;
                interractions.push(id);
            })
        }
        // let data: any = [];
        // if(type != "PlayerRegister"){
        //     for (let ids in interractions) {
        //             const id = interractions[ids];
        //             data.push(await log.generatePlayerDump(id));
        //     }
        // }
        listLogsInserts.push({ type, interractions, reason, timestamp: methods.getTimeStamp()})
        if (listLogsInserts.length > 20) writelogs();
        // logEntity.create({
        //     type,
        //     interractions,
        //     reason,
        //     timestamp: methods.getTimeStamp(),
        //     // interractionsdata: JSON.stringify(data)
        // })

    }
}
let listLogsInserts: Partial<logEntity>[] = [];
setInterval(() => {
    writelogs();
}, 5000)

function writelogs(){
    if (listLogsInserts.length == 0) return;
    logEntity.bulkCreate(listLogsInserts)
    listLogsInserts = [];
}