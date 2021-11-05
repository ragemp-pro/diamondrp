import { randomArrayEl } from "../../util/methods"
import { user } from "../user"
import { gangDeliverCost, gangDeliverSpawn, gangDeliverCoolDown, gangDeliverTarget, gangDeliverReward, gangDeliverRewardFraction } from "../../util/gang.deliver"
import { vehicles } from "../vehicles";
import { methods } from "../modules/methods";
import { fractionUtil } from "../../util/fractions";
import { gangzones } from "./gangwar";
import { moneyChests } from "./moneyChest";
import { dispatcher } from "../managers/dispatcher";
import { RAGE_BETA } from "../../util/newrage";

let coolDownMap = new Map<number,boolean>();
const vehModel = 'Pony2'
const vehModel2 = 'Faggio'
const motoTime = 10;
setTimeout(() => {
    mp.events.register('tablet:gangcar:order', (player: PlayerMp) => {
        if(!user.isGang(player) && !user.isMafia(player)) return player.notify('~r~Для вас это не доступно')
        if (coolDownMap.has(user.getPlayerFraction(player))) return player.notify("~r~Сейчас заказов нет")
        let car = randomArrayEl(gangDeliverSpawn)
        if (user.getCashMoney(player) < gangDeliverCost){
            return player.notify(`~r~У вас недостаточно средст для внесения залога`)
        }
        if(user.getPlayerFractionRank(player) < 2) return player.notify(`~r~Доступно со второго ранга`)

        user.removeCashMoney(player, gangDeliverCost);

        user.bigAlert(player, 'Залог за фургон внесён. Заберите его и доставьте по координатам, которые вам отправят когда вы до него доберётесь', 'success', 8000)
        user.setWaypointTarget(player, car.x, car.y, car.z);
        let veh:VehicleMp;
        const fractionid = user.getPlayerFraction(player)
        setTimeout(() => {
            if(!mp.players.exists(player)) return;
            veh = vehicles.spawnCar(new mp.Vector3(car.x, car.y, car.z), 0, vehModel, vehicles.generateNumber());
            veh.deliverTarget = randomArrayEl(gangDeliverTarget);
            veh.deliverFraction = fractionid;
            veh.deliverPlayer = user.getId(player);
        }, 30000)
        setTimeout(() => {
            if (mp.vehicles.exists(veh)){
                if (veh.dist(new mp.Vector3(car.x, car.y, car.z)) < 1 && veh.getOccupants().length == 0){
                    if (mp.players.exists(player)) player.notify('~g~Фургон пропал'), user.clearWaypointTarget(player)
                    veh.destroy()
                }
            }
            if (mp.players.exists(player)){
                let qs: number  = setInterval(() => {
                    if (!mp.players.exists(player)) return clearInterval(qs);
                    if(!mp.vehicles.exists(veh)){
                        user.clearWaypointTarget(player)
                        return clearInterval(qs)
                    }
                }, 5000)
            }
        }, 900000)
        
        
        coolDownMap.set(fractionid, true)
        setTimeout(() => {
            coolDownMap.delete(fractionid)
        }, gangDeliverCoolDown * 60000)
        
    })
}, 1000)


gangDeliverTarget.map(item => {
    methods.createDynamicCheckpoint(new mp.Vector3(item.x, item.y, item.z), "Нажмите ~g~E~w~ чтобы сдать фургон", player => {
        if (!player.vehicle) return;
        const vehicle = player.vehicle;
        if (vehicle.deliverFraction != user.getPlayerFraction(player)) return player.notify('~r~Мы не вас ожидали');
        if (!user.isDriver(player)) return player.notify('~r~Вы должны быть за рулём');
        if (vehicle.dist(vehicle.deliverTarget) > 50) return player.notify('~r~Вы должны быть за рулём');
        if (vehicle.velocity.x > 1 || vehicle.velocity.y > 1 || vehicle.velocity.z > 1) return player.notify('~g~Остановите транспорт');
        user.addCashMoney(player, gangDeliverReward);
        player.notify('~g~Вы получили награду в размере $' + gangDeliverReward);
        let givechest = false;
        moneyChests.forEach(item => {
            if (givechest) return;
            if (item.fraction == vehicle.deliverFraction) {
                givechest = true;
                item.money += gangDeliverRewardFraction;
                item.logWrite(`${user.getRpName(player)} (${user.getId(player)})`, `Фургон за $${gangDeliverRewardFraction}`)
                item.save();
            }
        })
        vehicle.destroy();
        setTimeout(() => {
            let veh = vehicles.spawnCar(new mp.Vector3(player.position.x, player.position.y, player.position.z), player.heading, vehModel2, vehicles.generateNumber());
            player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
            user.alert(player, "Мы вам дали Faggio, чтобы вы смогли скрытся. Движок там побитый, минут " + motoTime+" проработает", "error");
            setTimeout(() => {
                if(!mp.vehicles.exists(veh)) return;
                veh.destroy();
            }, 60000 * motoTime)
        }, 1000);
        
    }, 3, 0, [0, 250, 0, 120])
})

mp.events.add("playerStartEnterVehicle", (player:PlayerMp, vehicle:VehicleMp, seat:number) => {
    // console.log(seat);
    if (!vehicle.deliverFraction) return;
    if (vehicle.deliverFraction != user.getPlayerFraction(player) && vehicle.deliverPlayer){
        let target = user.getPlayerById(vehicle.deliverPlayer)
        if(target) target.notify(`~r~Заказаный фургон угнали.`)
        vehicle.deliverPlayer = null;
    };
    if(user.isGosPD(player)){
        player.notify('~g~Отвезите данный фургон в гараж '+user.getPlayerFractionName(player)+' для получения награды')
        return;
    }
    if (vehicle.deliverFraction != user.getPlayerFraction(player)) return player.notify('Этот фургон не для вас');
    user.bigAlert(player, 'Доставьте фургон по координатам в вашем GPS', 'info', 4000)
    user.setWaypointTarget(player, vehicle.deliverTarget.x, vehicle.deliverTarget.y, vehicle.deliverTarget.z);
    if (!vehicle.deliverCheckpoint){
        dispatcher.sendPos('Код 2', `Поступила информации о подозрительном фургоне.\nМарка: ~y~${vehModel}~s~\nНомера: ~y~${vehicle.numberPlate}`, vehicle.position, true);
        vehicle.deliverCheckpoint = true
    }
});

