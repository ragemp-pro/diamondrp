import { RAGE_BETA } from "../../util/newrage";
import { user } from "../user";

const localPlayer = mp.players.local;
const maxSpeed = 10.0;
const minHeight = 15.0;
const maxHeight = 60.0;
const maxAngle = 15.0;
let timePressKey = 0


mp.events.add('rappelSync', (id:number) => {
    let target = mp.players.atRemoteId(id);
    if(!target.handle) return;
    target.clearTasks();
    target.taskRappelFromHeli(10.0);
})

setInterval(() => {
    if(mp.keys.isDown(69)){
        // if (!RAGE_BETA) return timePressKey = 0;
        const vehicle = localPlayer.vehicle;
        if (!vehicle) return timePressKey = 0;
        if (!mp.game.invoke("0x4E417C547182C84D", vehicle.handle)) return timePressKey = 0;

        if (vehicle.getSpeed() > maxSpeed) {
            user.notify("~r~Вертолёт летит слишком быстро для спуска на тросе");
            return timePressKey = 0;
        }

        if (vehicle.getPedInSeat(-1) === localPlayer.handle || vehicle.getPedInSeat(0) === localPlayer.handle) {
            user.notify("~r~С данного места спуск на тросе невозможен");
            return timePressKey = 0;
        }

        const taskStatus = localPlayer.getScriptTaskStatus(-275944640);
        if (taskStatus === 0 || taskStatus === 1) {
            user.notify("~r~Вы уже спускаетесь на тросе");
            return timePressKey = 0;
        }

        const curHeight = vehicle.getHeightAboveGround();
        if (curHeight < minHeight || curHeight > maxHeight) {
            user.notify("~r~Вертолёт слишком высоко/низко для спуска на тросе");
            return timePressKey = 0;
        }

        if (!vehicle.isUpright(maxAngle) || vehicle.isUpsidedown()) {
            user.notify("~r~Стабилизируйте вертолёт для спуска на тросе");
            return timePressKey = 0;
        }

        if (!user.isGos()) {
            user.notify("~r~Доступно только сотрудникам гос.организаций");
            return timePressKey = 0;
        }

        timePressKey++;
        if(timePressKey < 2) return;
        timePressKey = 0;
        if (RAGE_BETA){
            localPlayer.clearTasks();
            localPlayer.taskRappelFromHeli(10.0);
        } else {
            mp.events.callRemote('rappel')
        }
    } else {
        timePressKey = 0;
    }
}, 1000);