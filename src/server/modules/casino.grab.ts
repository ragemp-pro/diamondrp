import { weather } from "../managers/weather";
import { user } from "../user";
import { inventory } from "../inventory";
import { items } from "../items";
import { testMode } from "..";
import { chat } from "./chat";
import { methods } from "./methods";
import { levelAccess } from "../../util/level";

const AMOUNT_MIN = 287;
const AMOUNT_MAX = 402;


let pacificPoss:[Vector3Mp, number][] = [
  [new mp.Vector3(982.40, 31.81, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
  [new mp.Vector3(987.22, 33.42, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
  [new mp.Vector3(978.44, 29.00, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
  [new mp.Vector3(972.21, 18.38, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
  [new mp.Vector3(997.18, -3.76, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
  [new mp.Vector3(994.77, -4.00, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
  [new mp.Vector3(992.28, -4.35, 71.74), methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX)],
]

let isgrab = 4;


const updatePacific = () => {
  let enabled = false;
  if(weather.getHour() == 9 && weather.getMin() == 1){
    enabled = true;
    qtick();
  }
  setTimeout(() => {
    updatePacific();
  }, enabled ? 120000 : 3000)
}

function qtick(){
  pacificPoss.map((item, index) => {
    pacificPoss[index][1] = methods.parseInt(methods.getRandomInt(AMOUNT_MIN, AMOUNT_MAX) / pacificPoss.length)
  })
  isgrab = 4
  methods.explodedDoors.forEach((item, index) => {
    if (item[3] == 3309500160){
      methods.openDoorRestore(...item)
      methods.explodedDoors.splice(index, 1);
    }
  })
}

chat.registerCommand('grabtestcasino', player => {
  if(!user.isAdminNow(player, 6)) return;
  // if(!testMode) return;
  qtick();
  player.notify("Ограбление казино обновлено")
})

updatePacific();
qtick();

methods.createExplopeCheckpoint(new mp.Vector3(999.67, 29.53, 71.76), 3309500160, player => {
  if (!testMode && weather.getHour() > 6) {
    player.notify("~r~Доступно только с 0 до 6 утра игрового времени");
    return false;
  }
  if (methods.explodedDoors.find((item) => item[3] == 3309500160)){
    player.notify("~r~Дверь взорвана")
    return false
  }
  return true;
});
methods.createEnterCheckpoint(new mp.Vector3(997.90, 26.56, 71.74), player => {
  if (methods.explodedDoors.find((item) => item[3] == 3309500160)) return;
  user.teleport(player, 999.68, 29.85, 71.76, 331.41);
  player.notify("~r~Дверь не взорвана");
})



pacificPoss.map((q, index) => {
  let pacificPos = q[0]
  methods.createDynamicCheckpoint(pacificPos, "Нажмите ~g~E~w~ чтобы ограбить ячейку №" + (index+1), player => {
    // let amount = pacificPoss[index][1]
    if(player.vehicle) return player.notify("~r~Грабить в транспорте?")
    if(isgrab == 0) return player.notify("~r~Сейчас точка занята");
  
    if (!testMode && weather.getHour() >= 6) {
      player.notify("~r~Доступно только с 0 до 6 утра игрового времени");
      return;
    }
  
    if (!methods.explodedDoors.find((item) => item[3] == 3309500160)) return player.notify("~r~Дверь не взорвана")
  
    if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
      return player.notify("~r~Требуется "+items.getItemNameById(263));
    }
    
    
    if (user.has(player, 'isGrab')) {
        player.notify('~r~Это действие сейчас не доступно');
        return;
    }
    
    if (!user.isMafia(player)) {
        player.notify('~r~Вы не состоите в Мафии');
        return;
    }
  
    if (user.get(player, 'fractionType') == 4) {
      player.notify('~r~Вы состоите в ОПГ');
      return;
    }
    
    if (user.getLevel(player) < levelAccess.pacificGrab) {
      player.notify('~r~Разрешено грабить с '+levelAccess.pacificGrab+' уровня');
        return;
    }
    
    if (!testMode && mp.players.length < 150 && !methods.isTestServer()) {
        player.notify("~r~Онлайн на сервере должен быть более 150 человек");
        return;
    }
    if (pacificPoss[index][1] <= 0) {
      player.notify("~r~Пусто");
      return;
    }
    user.set(player, 'isGrab', true)
    isgrab--;
    pacificPoss[index][1]--;
    user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
    user.disableAllControls(player, true);
    setTimeout(function() {
      user.playAnimation(player, "anim@heists@money_grab@duffel", "loop", 9);
    }, 5000);
    setTimeout(function() {
      
      setTimeout(() => {
        isgrab++;
      }, 5000)
  
      if (!user.isLogin(player))
          return 
    
      user.disableAllControls(player, false);
      user.giveWanted(player, 10, 'Ограбление казино Diamond');
    
  
      user.minigame(player, "gr6").then(status => {
        user.reset(player, 'isGrab');
        user.stopAnimation(player);
        if (user.isDead(player) || player.dist(pacificPos) > 20) return;
        if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
          return player.notify("~r~Требуется "+items.getItemNameById(263));
        }
        if (methods.getRandomInt(0, 3) == 0) {
            inventory.deleteItem(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263).id);
            player.notify('~r~Вы сломали отмычку');
        }
        if(!player.bankgrabmoney) player.bankgrabmoney = 0
        if(methods.getRandomInt(0, 10) >= 1){
          if(methods.getRandomInt(0, 200) == 0){
            const sum = methods.getRandomInt(10000, 20000)
            player.bankgrabmoney+=sum
            user.log(player, "Grab", `вытащил из ячейки казино куш ${sum}$`);
            player.notify("~y~Вы сорвали куш")
          } else {
            // user.takeNewItem(player, 141, methods.getRandomInt(500, 1500));
            const sum = methods.getRandomInt(800, 1000) * 2
            player.bankgrabmoney+=sum
            user.log(player, "Grab", `вытащил из ячейки казино ${sum}$`);
          }
          player.notify("~g~В сумке: "+player.bankgrabmoney+"$")
          user.setComponentVariation(player, 5, 45, 0);
        } else {
          player.notify("~r~Ячейка пустая")
        }
        if (pacificPoss[index][1] > 0) player.notify("Осталось ячеек: " + pacificPoss[index][1]);
        else player.notify("~r~Больше ячеек нет");
      });
    }, 10000);
  }, 2);
})
