import { methods } from "./methods";
import { weather } from "../managers/weather";
import { user } from "../user";
import { inventory } from "../inventory";
import { items } from "../items";
import { testMode } from "..";
import { chat } from "./chat";

import { business } from "../business";
import { randomArrayEl } from "../../util/methods";
import { levelAccess } from "../../util/level";
// let amount = 1000;

function getAmountNew(){
  return methods.getRandomInt(200, 300)
}

let positions:{check:Vector3Mp,explodepos:Vector3Mp,pos:Vector3Mp,amount?:number,isgrab?:number,enabled?:boolean,fraction:number}[] = [
{check:new mp.Vector3(1174.33, 2711.59, 38.07),explodepos:new mp.Vector3(1176.22, 2711.64, 38.09),pos:new mp.Vector3(1173.13, 2716.49, 37.07),isgrab:3,amount:getAmountNew(),fraction:2},
// {explodepos:new mp.Vector3(-2958.538, 482.2705, 15.83594),pos:new mp.Vector3(-2952.47, 484.42, 14.68),isgrab:2,amount:methods.getRandomInt(200, 300)},
// {explodepos:new mp.Vector3(-1211.38, -334.92, 37.78),pos:new mp.Vector3(-1206.34, -338.78, 36.76),isgrab:2,amount:methods.getRandomInt(200, 300)},
  { check: new mp.Vector3(-351.64, -54.83, 49.01), explodepos: new mp.Vector3(-353.08, -53.67, 49.04), pos: new mp.Vector3(-352.29, -60.06, 48.01), isgrab: 3, amount: getAmountNew(), fraction: 7},
  { check: new mp.Vector3(313.44, -283.87, 54.14), explodepos: new mp.Vector3(312.358, -282.7301, 54.30365), pos: new mp.Vector3(312.36, -288.82, 53.14), isgrab: 3, amount: getAmountNew(), fraction: 3},
  { check: new mp.Vector3(148.94, -1045.64, 29.35), explodepos: new mp.Vector3(148.0266, -1044.364, 29.506930), pos: new mp.Vector3(148.34, -1050.38, 28.35), isgrab: 3, amount: getAmountNew(), fraction: 3},
];

const updateFleeca = () => {
  let enabled = false;
  if(weather.getHour() == 11 && weather.getMin() < 3){
    enabled = true;
    qtick()
  }
  setTimeout(() => {
    updateFleeca();
  }, enabled ? 220000 : 12000)
}

function qtick(){
  let enabled = positions.find(item => item.enabled);
  let list = positions.filter(item => !item.enabled)
  let newflec = randomArrayEl(list);
  newflec.enabled = true;
  if(enabled) enabled.enabled = false;
  positions.forEach(item => {
    item.amount = getAmountNew();
  })
}

updateFleeca();

chat.registerCommand('grabtest', player => {
  if(!user.isAdminNow(player, 6)) return;
  // if(!testMode) return;
  qtick();
  player.notify("Флека обновлена")
})

const gate = 2121050683;

const fleecaDisabledDays = [4, 8, 12, 16, 20, 24, 28]

function checkAccess(player:PlayerMp){
  let dateTime = new Date();
  if (fleecaDisabledDays.includes(dateTime.getDate())) {
    player.notify(`~r~Ограбление НЕдоступно в следующие дни: ${fleecaDisabledDays.join(', ')}`);
    return;
  }

  if(weather.getHour() < 12 || weather.getHour() >= 18){
    player.notify("~r~Доступно с 12 до 18")
    return false;
  }

  if (!user.isGang(player)) {
    player.notify('~r~Вы не состоите в банде');
    return false;
  }

  if (user.getLevel(player) < levelAccess.fleecaGrab) {
      player.notify('~r~Разрешено грабить с '+levelAccess.fleecaGrab+' уровня');
      return false;
  }
  
  if (!methods.isTestServer() && !testMode && mp.players.length < 100) {
      player.notify("~r~Онлайн на сервере должен быть более 100 человек");
      return false;
  }
  return true;
}


positions.forEach(item => {
  methods.createEnterCheckpoint(item.check, player => {
    if(methods.explodedDoors.find(itm => (methods.distanceToPos(new mp.Vector3(itm[0], itm[1], itm[2]), item.explodepos) < 10 && itm[3] == gate))) return;
    user.teleport(player, item.explodepos.x, item.explodepos.y, item.explodepos.z);
    player.notify("~r~Дверь не взорвана");
  })
  methods.createExplopeCheckpoint(item.explodepos, gate, (player) => {
    if(!item.enabled){
      player.notify("~r~Банк в данный момент недоступен")
      return false;
    }
    return checkAccess(player)
  }, (player) => {
    setTimeout(() => {
      const itm = methods.explodedDoors.findIndex(itm => (methods.distanceToPos(new mp.Vector3(itm[0], itm[1], itm[2]), item.explodepos) < 10 && itm[3] == gate))
      methods.openDoorRestore(item.explodepos.x,item.explodepos.y,item.explodepos.z,gate)
      methods.explodedDoors.splice(itm, 1);
    }, 60000 * 35)
  }, 8, true, item.fraction)
  methods.createDynamicCheckpoint(item.pos, "Нажмите ~g~E~w~ чтобы ограбить банк Fleeca", player => {
    if(player.vehicle) return player.notify("~r~Грабить в транспорте?")
    if(item.isgrab == 0) return player.notify("~r~Сейчас точка занята");
    if(!item.enabled) return player.notify("~r~Данный банк занят");  
    if(!methods.explodedDoors.find(itm => (methods.distanceToPos(new mp.Vector3(itm[0], itm[1], itm[2]), item.explodepos) < 10 && itm[3] == gate))) return player.notify("~r~Дверь не взорвана")
    if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
      return player.notify("~r~Требуется "+items.getItemNameById(263));
    }
    
    
    if (user.has(player, 'isGrab')) {
        player.notify('~r~Это действие сейчас не доступно');
        return;
    }
    


    if(!checkAccess(player)) return;
    if (item.amount <= 0) {
      player.notify("~r~Пусто");
      return;
    }
    item.isgrab--;
    item.amount--;
    user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
    user.disableAllControls(player, true);
    setTimeout(function() {
      if (user.isLogin(player))
      user.playAnimation(player, "anim@heists@money_grab@duffel", "loop", 9);
    }, 5000);
    setTimeout(function() {
      
      setTimeout(() => {
        item.isgrab++;
      }, 5000)

      if (!user.isLogin(player))
          return
    

          setTimeout(() => {
            if(!mp.players.exists(player)) item.isgrab++;
          }, 20000)

      user.giveWanted(player, 10, 'Ограбление банка Fleeca');
      user.minigame(player, "gr6").then(status => {
        user.disableAllControls(player, false);
        user.reset(player, 'isGrab');
        user.stopAnimation(player);
        if (user.isDead(player) || player.dist(item.pos) > 20) return;
        if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
          return player.notify("~r~Требуется "+items.getItemNameById(263));
        }
        if (methods.getRandomInt(0, 3) == 0) {
            inventory.deleteItem(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263).id);
            player.notify('~r~Вы сломали отмычку');
        }
        if (!player.bankgrabmoney) player.bankgrabmoney = 0
        if(methods.getRandomInt(1, 10) != 1){
          const sum = methods.getRandomInt(1600, 2000)
          user.log(player, "Grab", `вытащил из ячейки флеки ${sum}$`);
          player.bankgrabmoney += sum
          player.notify("~g~Вы загрузили в сумку "+sum+"$");
          user.setComponentVariation(player, 5, 45, 0);
        } else {
          player.notify("~r~Ячейка пустая")
        }
        if(item.amount > 0) player.notify("Осталось ячеек: "+item.amount);
        else player.notify("~r~Больше ячеек нет");
      })
    }, 10000);
  }, 2);
})
