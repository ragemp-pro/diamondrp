/// <reference path="../../declaration/server.ts" />

import { methods } from "../modules/methods";
import { menu } from "../modules/menu";
import { user } from "../user";
import { vehicles } from "../vehicles";
import { randomArrayEl } from "../../util/methods";
import { coffer } from "../coffer";
import { business } from "../business";
import { enabledSystem } from "../modules/chat";
import { levelAccess } from "../../util/level";
import { RAGE_BETA } from "../../util/newrage";

/** Координаты базы */
let gr6basePosition = new mp.Vector3(484.50, -1095.77, 28.2);
//let gr6basePosition = new mp.Vector3(484.50, -1123.77, 28.2);
let gr6baseDistance = 30;
/** Координаты точек спавна ТС */
let gr6CarPositions:[{x:number;y:number;z:number}, number][] = [
  [{"x":484.756103515625,"y":-1102.3062744140625,"z":28.807342529296875},95.42744445800781],[{"x":485.1808776855469,"y":-1105.6689453125,"z":28.806692123413086},95.42744445800781],[{"x":484.790283203125,"y":-1109.1700439453125,"z":28.805891036987305},95.42744445800781],[{"x":485.1467590332031,"y":-1112.6395263671875,"z":28.80535316467285},95.42744445800781],[{"x":471.6806335449219,"y":-1109.257568359375,"z":28.806224822998047},95.42744445800781],[{"x":471.520751953125,"y":-1105.9871826171875,"z":28.80721092224121},95.42744445800781],[{"x":471.97943115234375,"y":-1102.6512451171875,"z":28.807701110839844},95.42744445800781],[{"x":471.4292297363281,"y":-1098.9801025390625,"z":28.8061580657959},95.42744445800781],[{"x":471.7353820800781,"y":-1095.6881103515625,"z":28.808027267456055},95.42744445800781],[{"x":472.109619140625,"y":-1092.3970947265625,"z":28.806678771972656},95.42744445800781],[{"x":472.0760192871094,"y":-1089.136474609375,"z":28.80914878845215},95.42744445800781],[{"x":484.596923828125,"y":-1083.2073974609375,"z":28.80978012084961},95.42744445800781],[{"x":485.1408996582031,"y":-1079.53662109375,"z":28.806983947753906},95.42744445800781],[{"x":459.60943603515625,"y":-1080.236572265625,"z":28.8100643157959},95.42744445800781],[{"x":459.78521728515625,"y":-1083.945068359375,"z":28.80739402770996},95.42744445800781],[{"x":459.5370788574219,"y":-1087.6214599609375,"z":28.808650970458984},95.42744445800781],[{"x":459.64013671875,"y":-1091.38427734375,"z":28.8077449798584},95.42744445800781],[{"x":459.7898864746094,"y":-1095.2694091796875,"z":28.807132720947266},95.42744445800781],[{"x":459.6727294921875,"y":-1098.6854248046875,"z":28.807165145874023},95.42744445800781],[{"x":459.8841247558594,"y":-1109.1917724609375,"z":28.80704116821289},95.42744445800781],[{"x":459.76300048828125,"y":-1112.7598876953125,"z":28.805830001831055},95.42744445800781],[{"x":485.3493347167969,"y":-1151.8433837890625,"z":28.90336799621582},95.42744445800781],[{"x":474.4845886230469,"y":-1151.60595703125,"z":28.89848518371582},95.42744445800781],[{"x":466.0248718261719,"y":-1151.508056640625,"z":28.898408889770508},95.42744445800781],[{"x":452.1874694824219,"y":-1151.5057373046875,"z":28.898778915405273},95.42744445800781],[{"x":442.15167236328125,"y":-1151.46044921875,"z":28.89842414855957},95.42744445800781],[{"x":432.4815368652344,"y":-1151.4814453125,"z":28.897207260131836},95.42744445800781],[{"x":432.4815368652344,"y":-1151.4814453125,"z":28.897207260131836},95.42744445800781],[{"x":423.1426086425781,"y":-1151.4599609375,"z":28.89789581298828},95.42744445800781],[{"x":412.9697570800781,"y":-1151.439453125,"z":28.898574829101562},95.42744445800781],[{"x":485.8990783691406,"y":-1154.695556640625,"z":28.897493362426758},95.42744445800781],[{"x":475.21368408203125,"y":-1154.652587890625,"z":28.89752960205078},95.42744445800781],[{"x":466.0748291015625,"y":-1154.6134033203125,"z":28.898948669433594},95.42744445800781],[{"x":451.86932373046875,"y":-1154.6590576171875,"z":28.89619255065918},95.42744445800781],[{"x":443.1600341796875,"y":-1154.599853515625,"z":28.898189544677734},95.42744445800781],[{"x":432.1284484863281,"y":-1154.6090087890625,"z":28.897031784057617},95.42744445800781],[{"x":423.48699951171875,"y":-1154.6842041015625,"z":28.897680282592773},95.42744445800781],[{"x":412.7337341308594,"y":-1154.6322021484375,"z":28.89877700805664},95.42744445800781],[{"x":485.117919921875,"y":-1157.8311767578125,"z":28.896793365478516},95.42744445800781],[{"x":474.7124938964844,"y":-1157.82470703125,"z":28.89902687072754},95.42744445800781],[{"x":466.2529296875,"y":-1157.6629638671875,"z":28.89669418334961},95.42744445800781],[{"x":451.5395812988281,"y":-1157.7333984375,"z":28.897708892822266},95.42744445800781],[{"x":442.9903259277344,"y":-1157.70263671875,"z":28.89864158630371},95.42744445800781],[{"x":432.6658935546875,"y":-1157.7904052734375,"z":28.896804809570312},95.42744445800781],[{"x":423.3752136230469,"y":-1157.6414794921875,"z":28.899463653564453},95.42744445800781],[{"x":413.1678161621094,"y":-1157.691162109375,"z":28.897109985351562},95.42744445800781],[{"x":485.9555358886719,"y":-1160.775634765625,"z":28.897180557250977},95.42744445800781],[{"x":475.05218505859375,"y":-1160.9090576171875,"z":28.89944839477539},95.42744445800781],[{"x":466.025146484375,"y":-1160.7391357421875,"z":28.901142120361328},95.42744445800781],[{"x":451.664306640625,"y":-1160.911865234375,"z":28.898273468017578},95.42744445800781],[{"x":442.8725891113281,"y":-1160.76171875,"z":28.898054122924805},95.42744445800781],[{"x":432.25238037109375,"y":-1160.9447021484375,"z":28.89756202697754},95.42744445800781],[{"x":423.740478515625,"y":-1160.7030029296875,"z":28.898643493652344},95.42744445800781],[{"x":413.2269287109375,"y":-1160.9742431640625,"z":28.898902893066406},95.42744445800781],[{"x":485.84649658203125,"y":-1163.912353515625,"z":28.896406173706055},95.42744445800781],[{"x":475.08453369140625,"y":-1163.8265380859375,"z":28.898296356201172},95.42744445800781],[{"x":442.9339904785156,"y":-1163.8272705078125,"z":28.89691734313965},95.42744445800781],[{"x":432.4906005859375,"y":-1163.939453125,"z":28.89862823486328},95.42744445800781],[{"x":423.51898193359375,"y":-1163.8770751953125,"z":28.897737503051758},95.42744445800781],[{"x":412.7418212890625,"y":-1163.8931884765625,"z":28.89671516418457},95.42744445800781],[{"x":485.5042724609375,"y":-1167.5911865234375,"z":28.897724151611328},95.42744445800781],[{"x":471.6871643066406,"y":-1125.2222900390625,"z":28.948108673095703},95.42744445800781],[{"x":456.1492004394531,"y":-1125.323486328125,"z":28.949399948120117},95.42744445800781],[{"x":494.553955078125,"y":-1077.1307373046875,"z":28.364866256713867},95.42744445800781],[{"x":494.7682189941406,"y":-1089,"z":28.529794692993164},95.42744445800781],[{"x":494.3519592285156,"y":-1099.528564453125,"z":28.663164138793945},95.42744445800781]
];

/** Делитель растояния для получения суммы */
const distCeil = 4;
/** Стоимость работы */
const gr6JobCost = 500;
/** Стоимость машины */
const gr6CarCost = 5000;
/** Стоимость доп.амуниции */
const gr6AmmoCost = 2700;

/** Позиции точек сбора */
let markers = [
  [253.4611,220.7204,106.2865,108],
  [251.749,221.4658,106.2865,108],
  [248.3227,222.5736,106.2867,108],
  [246.4875,223.2582,106.2867,108],
  [243.1434,224.4678,106.2868,108],
  [241.1435,225.0419,106.2868,108],
  [148.5,-1039.971,29.37775,1],
  [1175.054,2706.404,38.09407,1],
  [-1212.83,-330.3573,37.78702,1],
  [314.3541,-278.5519,54.17077,1],
  [-2962.951,482.8024,15.7031,1],
  [-350.6871,-49.60739,49.04258,1],
  [-111.1722,6467.846,31.62671,2],
  [-113.3064,6469.969,31.62672,2],
  [138.7087, -1705.711, 28.29162, 109],
  [1214.091,-472.9952,65.208,109],
  [-276.4055,6226.398,30.69552,109],
  [-1282.688,-1117.432,5.990113,110],
  [1931.844,3730.305,31.84443,111],
  [-33.34319,-154.1892,56.07654,48],
  [-813.5332,-183.2378,36.5689,112],
  [22.08832,-1106.986,29.79703,75],
  [252.17,-50.08245,69.94106,76],
  [842.2239,-1033.294,28.19486,77],
  [-661.947,-935.6796,21.82924,78],
  [-1305.899,-394.5485,36.69577,79],
  [809.9118,-2157.209,28.61901,102],
  [2567.651,294.4759,107.7349,103],
  [-3171.98,1087.908,19.83874,104],
  [-1117.679,2698.744,17.55415,105],
  [1693.555,3759.9,33.70533,106],
  [-330.36,6083.885,30.45477,107],
  [-1148.878,-2000.123,12.18026,14],
  [-347.0815,-133.3432,38.00966,54],
  [726.0679,-1071.613,27.31101,55],
  [-207.0201,-1331.493,33.89437,56],
  [1187.764,2639.15,37.43521,57],
  [101.0262,6618.267,31.43771,71],
  [-146.2072,-584.2731,166.0002,121],
  [472.2666,-1310.529,28.22178,123],
  [26.213,-1345.442,29.49702,3],
  [-1223.059,-906.7239,12.32635,4],
  [-1487.533,-379.3019,40.16339,5],
  [1135.979,-982.2205,46.4158,6],
  [1699.741,4924.002,42.06367,7],
  [374.3559,327.7817,103.5664,8],
  [-3241.895,1001.701,12.83071,9],
  [-3039.184,586.3903,7.90893,11],
  [-2968.295,390.9566,15.04331,10],
  [547.8511,2669.281,42.1565,50],
  [1165.314,2709.109,38.15772,51],
  [1960.845,3741.882,32.34375,84],
  [1729.792,6414.979,35.03723,85],
  [-657.087, -857.313, 23.490,85],
  [1133.0963, -472.6430, 65.7651,85],
  [318.2640, -1076.7376, 28.4785,85]
]

mp.labels.new("База инкассаторов", new mp.Vector3(gr6basePosition.x, gr6basePosition.y, gr6basePosition.z+1.2), {
  dimension: 0,
  drawDistance: 10,
  los: true,
  font: 1
})
mp.blips.new(318, gr6basePosition, {
  dimension: 0,
  name: "База инкассаторов",
  scale: 0.8,
  color: 2,
  shortRange: true
})

function findFreePlace(){
  let fnd:[{x:number;y:number;z:number}, number] = null;
  gr6CarPositions.map(([pos, heading]) => {
    if(fnd == null){
      let q = true;
      mp.vehicles.forEachInRange(pos, 5, (veh) => {
        q = false;
      })
      if(q) fnd = [pos, heading]; 
    }
  })
  return fnd
}


function startJob(player:PlayerMp){
  if (!user.isLogin(player)) return;
  if (user.getSex(player) == 1) {
    user.setComponentVariation(player, 3, 14, 0);
    user.setComponentVariation(player, 4, 34, 0);
    user.setComponentVariation(player, 5, 0, 0);
    user.setComponentVariation(player, 6, 25, 0);
    user.setComponentVariation(player, 7, 0, 0);
    user.setComponentVariation(player, 8, 152, 0);
    user.setComponentVariation(player, 9, 6, 1);
    user.setComponentVariation(player, 10, 0, 0);
    user.setComponentVariation(player, 11, 85, 0);
  } else {
    user.setComponentVariation(player, 3, 11, 0);
    user.setComponentVariation(player, 4, 13, 0);
    user.setComponentVariation(player, 5, 0, 0);
    user.setComponentVariation(player, 6, 25, 0);
    user.setComponentVariation(player, 7, 0, 0);
    user.setComponentVariation(player, 8, 122, 0);
    user.setComponentVariation(player, 9, 4, 1);
    user.setComponentVariation(player, 10, 0, 0);
    user.setComponentVariation(player, 11, 26, 1);
  }
  player.gr6duty = true;
  player.notify("Вы заступили на смену")
  if(player.armour < 20) player.armour = 20;
  user.giveWeaponByHash(player, mp.joaat('WEAPON_PISTOL'), 100);
  user.set(player, "is6Duty", true)
  user.updateClientCache(player)
}

mp.events.add("gr6:fakeCar", (player:PlayerMp) => {
  stopJob(player)
})

function stopJob(player:PlayerMp){
  player.notify("Вы завершили рабочий день");
  player.call("server:gr6:stop")
  if(player.armour <= 20) player.armour = 0;
  player.gr6duty = false;
  removeTask(player)
  user.updateCharacterCloth(player);
  user.set(player, "is6Duty", false)
  user.updateClientCache(player)
}

function despawnVeh(veh:VehicleMp, del = true){
  if(!mp.vehicles.exists(veh)) return;
  checkVehUsers(veh)
  if(!veh.gr6users) return
  veh.gr6users.forEach(n => {
    if(mp.players.exists(n)) n.gr6TaskVeh = null;
    removeTask(n)
  })
  if(del) vehicles.respawn(veh);
  return true;
}

methods.createDynamicCheckpoint(gr6basePosition, "Нажмите ~g~Е~s~ чтобы открыть меню инкассаторов", (player) => {
  if(!enabledSystem.gr6) return player.notify("Лицензионный центр на временных тех работах. Загляните чуть позже")
  let m = menu.new(player, "", 'Инкассаторы');
  m.sprite = "gr6"
  if(!player.gr6duty){
    m.newItem({
      name: "Начать рабочий день",
      more: gr6JobCost+"$",
      onpress: () => {
        if(user.getLevel(player) < levelAccess.gr6) return player.notify("~r~Необходимо иметь "+levelAccess.gr6+" уровень")
        if(user.get(player, "job") != "gr6") return player.notify("Вы не работаете инкассатором");
        if(user.isGos(player)) return player.notify("Гос служащим запрещено работать инкассаторами");
        if(user.get(player, "gun_lic") != 1) return player.notify("У вас нет лицензии на оружие");
        if(user.getCashMoney(player) < gr6JobCost) return player.notify("У вас недостаточно средств для выхода на смену")
        user.removeMoney(player, gr6JobCost)
        startJob(player)
        m.close();
      }
    })
  } else {
    m.newItem({
      name: "Закончить смену",
      onpress: () => {
        stopJob(player)
        m.close();
      }
    })
  }

  if(player.gr6Veh){
    if(mp.vehicles.exists(player.gr6Veh)){
      m.newItem({
        name: "~y~Вернуть транспорт",
        more: "+"+(gr6CarCost-500)+"$",
        onpress: () => {
          if(!player.gr6Veh) return player.notify("У вас нет арендованного ТС")
          if(!mp.vehicles.exists(player.gr6Veh)) return player.notify("ТС уничтожен"), player.gr6Veh = null;
          if(player.gr6Veh.dist(gr6basePosition) > gr6baseDistance) return player.notify("ТС слишком далеко от базы");
          despawnVeh(player.gr6Veh);
          player.gr6Veh = null;
          user.addCashMoney(player, (gr6CarCost-500))
          player.notify("Вы вернули залог за ТС")
          m.close();
        }
      })
    } else {
      player.gr6Veh = null;
    }
  }

  if(player.gr6TaskVeh || player.gr6haveTask){
    m.newItem({
      name: "~r~Завершить текущий наряд",
      desc: "Завершить текущее задание и открепится от экипажа",
      onpress: () => {
        removeTask(player)
      }
    })
  }

  m.newItem({
    name: "Арендовать служебный транспорт",
    more: gr6CarCost+"$",
    onpress: async () => {
      if(user.getLevel(player) < levelAccess.gr6) return player.notify("~r~Необходимо иметь "+levelAccess.gr6+" уровень")
      if(user.get(player, "c_lic") != 1) return player.notify("Необходимо удостоверение категории C")
      if(!player.gr6duty) return player.notify("Вы не на смене")
      if(user.getCashMoney(player) < gr6CarCost) return player.notify("У вас недостаточно средств для аренды ТС")
      m.close();
      let pos = findFreePlace();
      if(!pos) return player.notify("На парковке не найдено свободное место");
      if(player.gr6Veh){
        let status = await user.accept(player, "Старое ТС будет потеряно");
        if(!status) return player.notify("В таком случае вам необходимо его вернуть")
        if(player.gr6Veh.dist(gr6basePosition) <= gr6baseDistance) despawnVeh(player.gr6Veh), player.gr6Veh = null;
        else despawnVeh(player.gr6Veh, false)
      }
      removeTask(player);
      user.removeMoney(player, gr6CarCost)
      user.showLoadDisplay(player); // 484.862, -1105.761, 27.8124, 90.528, 1747439474
      
      setTimeout(() => {
        vehicles.spawnJobCar(new mp.Vector3(pos[0].x, pos[0].y, pos[0].z), pos[1], 1747439474, "gr6", (veh: VehicleMp) => {
          if (!vehicles.exists(veh)) return;
          if (!user.isLogin(player)) return;
          player.putIntoVehicle(veh, RAGE_BETA ? 0 : -1);
          vehicles.set(veh.getVariable('container'), 'owner_id', user.getId(player));
          veh.setVariable('owner_id', user.getId(player));
          player.gr6Veh = veh
          veh.gr6money = 0;
          veh.gr6users = [player]
          veh.gr6Owner = user.getId(player)
          player.gr6TaskVeh = veh;
        });
      }, 500)
      setTimeout(function() {
        if (!user.isLogin(player)) return;
        user.hideLoadDisplay(player);
      }, 1500);
    }
  })
  m.newItem({
    name: "Вооружение",
    more: gr6AmmoCost+"$",
    onpress: () => {
      if(!player.gr6duty) return player.notify("Вы не на смене")
      if(user.getCashMoney(player) < gr6AmmoCost) return player.notify("У вас недостаточно средств для покупки")
      user.removeMoney(player, gr6AmmoCost)
      //user.giveWeaponByHash(player, 'WEAPON_SMG', 200);
      user.giveWeaponByHash(player, mp.joaat('WEAPON_SMG'), 200);
      player.notify("Вы получили MP5 и комплект брони")
      player.armour = 35;
      m.close();
    }
  })

  m.open();
});

function checkVehStatus(player:PlayerMp){
  if(!player.gr6duty){
    player.notify("Вы не на смене");
    return false;
  }
  if(!player.gr6Veh){
    player.notify("У вас нет арендованого ТС");
    return false;
  }
  if(!player.vehicle){
    player.notify("Вы не в ТС");
    return false;
  }
  if(!mp.vehicles.exists(player.gr6Veh)){
    player.notify("ТС уничтожен");
    player.gr6Veh = null;
    return false;
  }
  if(player.vehicle != player.gr6Veh){
    player.notify("Вы не в своём ТС");
    return false;
  }

  return true;
}

function checkVehUsers(veh:VehicleMp){
  if(!mp.vehicles.exists(veh)) return;
  if(!veh.gr6users) return;
  if(veh.gr6users.length == 0) return;
  veh.gr6users.forEach((target, index) => {
    if(!mp.players.exists(target)) veh.gr6users.splice(index, 1);
    if(!target.gr6duty) veh.gr6users.splice(index, 1), target.notify("Вы были исключены из напарников после окончания смены"), removeTask(target);
  })
}

function removeTask(player:PlayerMp){
  if(!mp.players.exists(player)) return;
  if(player.gr6haveTask) player.notify("Задание было отменено")
  player.gr6Task = null;
  player.gr6haveTask = false;
  if(mp.vehicles.exists(player.gr6TaskVeh)){
    if(player.gr6TaskVeh.gr6users.indexOf(player) > -1)player.gr6TaskVeh.gr6users.splice(player.gr6TaskVeh.gr6users.indexOf(player), 1), player.notify("Вы были откреплены от экипажа")
  }
  player.gr6TaskVeh = null;
  player.call("server:gr6:removeTask")
}

function userChoice(player:PlayerMp, target:PlayerMp){
  if(!checkVehStatus(player)) return;
  let veh = player.gr6Veh;
  checkVehUsers(veh)
  if(veh.gr6users.indexOf(target) == -1) return;
  let m = menu.new(player, user.getRpName(target));
  m.newItem({
    name: "Выгнать",
    onpress: () => {
      if(!checkVehStatus(player)) return;
      checkVehUsers(veh)
      user.accept(player, "Вы уверены?").then(status => {
        if(status){
          if(mp.players.exists(target)) veh.gr6users.splice(veh.gr6users.indexOf(target), 1), target.notify("Водитель исключил Вас"), target.removeFromVehicle(), removeTask(target);
          player.notify("Напарник исключён");
        }
        usersVehList(player)
      })
    }
  })
  if (target.gr6haveTask && target.gr6Task){
    let dist = methods.parseInt(veh.dist(new mp.Vector3(target.gr6Task.x, target.gr6Task.y, target.gr6Task.z)));
    m.newItem({
      name: "Навигатор задания",
      more: dist+"m ("+methods.parseInt(dist*100/distCeil)+"$)",
      onpress: () => {
        if(!checkVehStatus(player)) return;
        checkVehUsers(veh)
        if (!target.gr6haveTask || !target.gr6Task) return player.notify('~r~Задание более недоступно')
        user.setWaypoint(player, target.gr6Task.x, target.gr6Task.y)
        player.notify("Навигатор запущен")
        veh.gr6users.forEach(ntr => {
          if(ntr != player) ntr.notify(user.getRpName(player)+" установил маршрут на точку "+user.getRpName(target)), ntr.notify(`Дистанция: ${dist}m, Сумма: ${methods.parseInt(dist*100/distCeil)}$`), user.setWaypoint(ntr, target.gr6Task.x, target.gr6Task.y);
        })
      }
    })
  }
  m.open();
}

function usersVehList(player:PlayerMp){
  if(!checkVehStatus(player)) return;
  let veh = player.gr6Veh;
  checkVehUsers(veh)
  let m = menu.new(player, "Напарники")
  m.onclose = () => {
    carMenu(player);
  }
  m.newItem({
    name: "Новый напарник",
    onpress: async () => {
      if(!checkVehStatus(player)) return;
      let id = methods.parseInt(await menu.input(player, "Введите ID напарника"));
      if(isNaN(id) || id < 1) return player.notify("ID указан не верно");
      checkVehUsers(veh)
      let target = user.getPlayerById(id);
      if(!target) return player.notify("ID не обнаружен");
      if(target.vehicle != player.gr6Veh) return player.notify("Напарник должен находится в вашем ТС");
      if(!target.gr6duty) return player.notify("Указанный ID не на смене");
      if(target.gr6haveTask) return player.notify("Сотрудник уже на задании");
      if(target.gr6TaskVeh == veh) return player.notify("Сотрудник уже является напарником");
      if(target.gr6TaskVeh) return player.notify("Сотрудник уже закреплён за другим ТС");
      if(veh.gr6users.length >= 4) return player.notify("Лимит напарников превышен");
      veh.gr6users.push(target);
      target.gr6TaskVeh = veh;
      target.notify("Вы стали напарником "+user.getRpName(player))
      player.notify(user.getRpName(target)+ " стал вашим напарником")
      usersVehList(player)
    }
  })
  veh.gr6users.forEach((target, index) => {
    let dist = target.gr6haveTask ? methods.parseInt(veh.dist(new mp.Vector3(target.gr6Task.x, target.gr6Task.y, target.gr6Task.z))) : 0;
    m.newItem({
      name: user.getRpName(target),
      more: target == player ? "Водитель (Вы)" : "Напарник"+(target.gr6haveTask ? " ("+dist+"m ("+methods.parseInt(dist*100/distCeil)+"$))" : "(нет задания)"),
      onpress: async () => {
        if(target == player) return player.notify("С собой вы не можете ничего делать");
        userChoice(player, target)
      }
    })
  })
  m.newItem({
    name: "Распустить всех",
    onpress: async () => {
      if(!checkVehStatus(player)) return;
      checkVehUsers(veh)
      user.accept(player, "Вы уверены?").then(status => {
        if(status){
          veh.gr6users.forEach((usr) => {
            if(usr != player) removeTask(usr)
          })
          veh.gr6users = [player];
          player.notify("Вы всех распустили");
        }
        usersVehList(player)
      })
    }
  })
  m.open();
}

function carMenu(player:PlayerMp){
  if(!player.vehicle) return;
  if(!player.gr6Veh && player.vehicle.gr6Owner){
    let veh = player.vehicle
    if(player.vehicle.gr6Owner == user.getId(player)) player.gr6Veh = player.vehicle;
    checkVehUsers(veh);
    player.gr6Veh = veh
    let fnd = false
    veh.gr6users.forEach((target, index) => {
      if(!mp.players.exists(target)){
        if(user.getId(target) == user.getId(player)) fnd = true;
      }
    })
    if(!fnd) veh.gr6users.push(player)
    veh.gr6Owner = user.getId(player)
    player.gr6TaskVeh = veh;
  }
  if(!checkVehStatus(player)) return;
  let m = menu.new(player, "Инкассатор");
  let veh = player.gr6Veh;
  m.newItem({
    name: "Напарники",
    onpress: () => {
      if(!checkVehStatus(player)) return;
      usersVehList(player);
    }
  })
  m.newItem({
    name: "Получить задания",
    onpress: () => {
      if(!checkVehStatus(player)) return;
      checkVehUsers(veh);
      let newTask = false;
      if(veh.gr6users.length == 1) return player.notify("У вас нет напарников, необходимо добавить"), usersVehList(player);
      if(veh.position.z < 0) return player.notify("Из данного места нельзя брать заказы");
      if(veh.gr6money > 3500000) return player.notify("У вас в машине более 3.5млн$, больше не влезает"), user.setWaypoint(player, gr6basePosition.x, gr6basePosition.y), player.notify("Построен маршрут до базы");
      veh.gr6users.forEach(target => {
        if(target != player){
          if(target.vehicle != veh) target.notify("Вы не получили задание, потому что не были в ТС")
          else if(target.gr6haveTask) target.notify("Вы не получили задание, у вас уже есть задание")
          else {
            let pos = randomArrayEl(markers);
            if(!pos && methods.parseInt(veh.dist(new mp.Vector3(pos[0], pos[1], pos[2]))) < 20){
              target.notify("Для вас не было найдено подходящего задания");
            } else {
              const [x,y,z] = pos;
              target.call('client:createGr6Checkpoint', [x, y, z]);
              target.notify("Вы получили задание");
              target.gr6Task = {
                x,y,z,dist:methods.parseInt(veh.dist(new mp.Vector3(x,y,z)))
              };
              target.gr6haveTask = true;
              player.notify(user.getRpName(target)+" получил задание ("+target.gr6Task.dist+"m)");
              newTask = true;
            }
          }
        }
      })
      if(newTask) player.notify("Вы получили новые задания."), player.notify("В списке напарников выберите маршрут"), usersVehList(player);
      else player.notify("Новых заданий нет");
    }
  })
  m.newItem({
    name: "Отгрузить выручку",
    more: veh.gr6money+"$",
    onpress: () => {
      if(!checkVehStatus(player)) return;
      m.close();
      checkVehUsers(veh)
      if(veh.dist(gr6basePosition) > gr6baseDistance) return player.notify("ТС слишком далеко от базы"), user.setWaypoint(player, gr6basePosition.x, gr6basePosition.y);
      if(veh.gr6money == 0) return player.notify("В ТС нет выручки");

      let money = methods.parseInt(veh.gr6money / 50 / veh.gr6users.length);
      veh.gr6users.forEach(target => {
        if(mp.players.exists(target)){
          let resMoney = user.get(target, 'skill_gr6') >= 500 ? (money*2) : money;
          user.addCashMoney(target, resMoney);
          target.notify("Ваша выручка: "+resMoney+"$"+(user.get(target, 'skill_gr6') >= 500 ? " (+20%)": ""));
          user.giveJobSkill(target);
          user.giveJobSkill(player);
          business.addMoney(162, methods.parseInt(resMoney / 10));
          coffer.addMoney(resMoney + methods.parseInt(resMoney / 10));
        }
      })
      veh.gr6money = 0;
    }
  })
  m.newItem({
    name: "Справка",
    desc: "Катайтесь по заданиям, собирайте деньги с магазинов и везите их в хранилище. Есть возможность работать с напарником, до 4 человек."
  })

  m.open()
}

mp.events.add("server:login:success:after", (player:PlayerMp) => {
  let id = user.getId(player);
  mp.vehicles.forEach(veh => {
    if(veh.gr6Owner && veh.gr6Owner == id){
      checkVehUsers(veh);
      player.gr6Veh = veh
      let fnd = false
      veh.gr6users.forEach((target, index) => {
        if(!mp.players.exists(target)){
          if(user.getId(target) == id) fnd = true;
        }
      })
      if(fnd) veh.gr6users.push(player)
      veh.gr6Owner = user.getId(player)
      player.gr6TaskVeh = veh;
    }
  })
})

mp.events.addRemoteCounted('server:gr6:dropCar', (player:PlayerMp, vId:number) => {
  if (!user.isLogin(player)) return;
  vId = methods.parseInt(vId);
  if(isNaN(vId) || vId < 0) return player.notify("Какой то странный ТС");
  let veh = mp.vehicles.at(vId);
  if(!veh) return;
  checkVehUsers(veh);
  if(veh.gr6users){
    if(veh.gr6users.indexOf(player) == -1) return player.notify("Это не ваш ТС");
    let money = methods.parseInt(player.gr6Task.dist * 100 / distCeil);
    if(money > (2200 * 100)) money = (2200 * 100);
    veh.gr6money += money;
    veh.gr6users.forEach(target => {
      target.notify(user.getRpName(player)+" загрузил "+money+"$");
    })
  } else {
    player.notify("Это не служебный транспорт")
  }
  player.gr6haveTask = false
  player.gr6Task = null;
});

mp.events.addRemoteCounted('gr6:menuVeh', (player:PlayerMp) => {
  carMenu(player)
})


mp.events.addRemoteCounted('server:gr6:grab', (player) => {
  if (!user.isLogin(player)) return;
  if(!player.vehicle) return player.notify("Вы должны быть в ТС");
  let veh = player.vehicle;
  if (veh.getVariable('job') != 'gr6') return player.notify("ТС не принадлежит инкассаторам");
  if(!veh.gr6users) return player.notify("ТС не принадлежит инкассаторам");
  if(veh.gr6users.indexOf(player) != -1) return player.notify("Самих себя грабить задумали?");
  user.showLoadDisplay(player);
  if(veh.gr6money == 0) return player.notify("~r~В машине нет денег");
  const money = methods.parseInt(veh.gr6money / 60);
  veh.gr6money = 0;
  if(!mp.vehicles.exists(veh)) return;
  despawnVeh(veh)
  setTimeout(function() {
    if (!user.isLogin(player)) return;
    user.hideLoadDisplay(player);
    user.addCashMoney(player, money);
    player.notify('~b~Вы ограбили транспорт на сумму: ~s~$' + methods.numberFormat(money));
  }, 1500);
});
