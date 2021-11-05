import { methods } from "../modules/methods";
import { randomArrayEl } from "../../util/methods";
import { user } from "../user";

const moneyAdd = 3;
const prisonMinus = 10;


let points: {x: number, y: number, z: number, h: number, use?: boolean }[] = [
    {x: 1667.7022705078125, y: 2512.77734375, z: 45.564849853515625, h: 111.30290222167969 },
    {x: 1666.84423828125, y: 2511.0625, z: 45.564849853515625, h: 18.863767623901367 },
    {x: 1662.6588134765625, y: 2504.283447265625, z: 45.564849853515625, h: 132.16677856445312 },
    {x: 1660.7115478515625, y: 2504.41796875, z: 45.564849853515625, h: 225.70050048828125 },
    {x: 1660.933837890625, y: 2502.329833984375, z: 45.564849853515625, h: 313.5859375 },
    {x: 1657.09521484375, y: 2508.19921875, z: 45.564849853515625, h: 344.06561279296875 },
    {x: 1657.46533203125, y: 2514.520751953125, z: 45.564849853515625, h: 358.3420104980469 },
    {x: 1658.8133544921875, y: 2515.80908203125, z: 45.564849853515625, h: 82.8930892944336 },
    {x: 1657.4698486328125, y: 2517.48876953125, z: 45.564849853515625, h: 174.1128387451172 },
    {x: 1658.1241455078125, y: 2521.0009765625, z: 45.564849853515625, h: 339.6223449707031 },
    {x: 1665.3275146484375, y: 2522.23193359375, z: 45.564849853515625, h: 219.3057861328125 },
    {x: 1663.404541015625, y: 2521.697265625, z: 45.564849853515625, h: 212.1258544921875 },
    {x: 1664.7523193359375, y: 2527.291259765625, z: 45.56486129760742, h: 319.0823669433594 },
    {x: 1667.544189453125, y: 2530.50927734375, z: 45.56486129760742, h: 208.15676879882812 },
    {x: 1668.724853515625, y: 2533.615966796875, z: 45.56486129760742, h: 328.682861328125 },
    {x: 1676.2261962890625, y: 2532.616943359375, z: 45.56486129760742, h: 233.70193481445312 },
    {x: 1683.5537109375, y: 2532.177490234375, z: 45.56486129760742, h: 278.6702575683594 },
    {x: 1682.710205078125, y: 2544.1181640625, z: 45.56486129760742, h: 351.1258544921875 },
    {x: 1681.994873046875, y: 2546.90673828125, z: 45.56486129760742, h: 23.521282196044922 },
    {x: 1682.9901123046875, y: 2554.48291015625, z: 45.56486129760742, h: 34.78386306762695 },
    {x: 1695.3524169921875, y: 2521.91064453125, z: 45.56488800048828, h: 290.0921325683594 },
    {x: 1699.92919921875, y: 2517.427734375, z: 45.56488800048828, h: 355.9129638671875 },
    {x: 1681.209716796875, y: 2479.452880859375, z: 45.56491470336914, h: 144.16732788085938 },
    {x: 1683.466064453125, y: 2484.93603515625, z: 45.56491470336914, h: 339.9389953613281 },
    {x: 1686.203369140625, y: 2487.2529296875, z: 45.56491470336914, h: 83.67436218261719 }
];


let marker1: {
    delete: () => void;
    updatePos: (posnew: Vector3Mp) => void;
    updateName: (name: string) => void;
} = null;
let marker2: {
    delete: () => void;
    updatePos: (posnew: Vector3Mp) => void;
    updateName: (name: string) => void;
} = null;

function reCreatePoint() {
    createMarker1();
    createMarker2();
}
reCreatePoint();

function createMarker1() {
    let pos = randomArrayEl(points.filter(item => !item.use))
    pos.use = true;
    marker1 = methods.createEnterCheckpoint(new mp.Vector3(pos.x, pos.y, pos.z - 1), player => {
        if (user.get(player, 'jail_time') <= 0) return player.notify("~r~Данная работа предназначена для заключённых");
        if (user.get(player, 'jail_time') <= 80) return player.notify("~r~Ваш срок заключения подходит к концу");
        if (player.vehicle) return player.notify("~r~В машине работать?");
        marker1.delete();
        marker1 = null;
        user.playScenario(player, "WORLD_HUMAN_GARDENER_PLANT", pos.x, pos.y, pos.z, pos.h, false);
        setTimeout(() => {
            setTimeout(() => {
                createMarker1()
                pos.use = false;
            }, 10000)
            if (!mp.players.exists(player)) return;
            user.isPlayTask(player).then(status => {
                if (!status || player.dist(pos) > 3) return player.notify("~r~Вы прекратили работу")
                user.stopScenario(player);
                user.addCashMoney(player, moneyAdd);
                player.notify('~g~Вы заработали $' + moneyAdd+', срок заключения сокращён на ' + prisonMinus+' секунд')
                let time = user.get(player, 'jail_time');
                let rtime = time - prisonMinus;
                user.set(player, 'jail_time', rtime > 2 ? rtime : 2)
                player.call('server:jailworktime', [rtime])
            })
        }, 30000)
    }, 1, 0, [33, 150, 243, 100])
}
function createMarker2() {
    let pos = randomArrayEl(points.filter(item => !item.use))
    pos.use = true;
    marker2 = methods.createEnterCheckpoint(new mp.Vector3(pos.x, pos.y, pos.z - 1), player => {
        if (user.get(player, 'jail_time') <= 0) return player.notify("~r~Данная работа предназначена для заключённых");
        if (user.get(player, 'jail_time') <= 80) return player.notify("~r~Ваш срок заключения подходит к концу");
        if (player.vehicle) return player.notify("~r~В машине работать?");
        marker2.delete();
        marker2 = null;
        user.playScenario(player, "WORLD_HUMAN_GARDENER_PLANT", pos.x, pos.y, pos.z, pos.h, false);
        setTimeout(() => {
            setTimeout(() => {
                createMarker2()
                pos.use = false;
            }, 10000)
            if (!mp.players.exists(player)) return;
            user.isPlayTask(player).then(status => {
                if (!status || player.dist(pos) > 3) return player.notify("~r~Вы прекратили работу")
                user.stopScenario(player);
                user.addCashMoney(player, moneyAdd);
                player.notify('~g~Вы заработали $' + moneyAdd +', срок заключения сокращён на ' + prisonMinus +' секунд')
                let time = user.get(player, 'jail_time');
                let rtime = time - prisonMinus;
                user.set(player, 'jail_time', rtime > 2 ? rtime : 2)
                player.call('server:jailworktime', [rtime])
            })
        }, 30000)
    }, 1, 0, [33, 150, 243, 100])
}