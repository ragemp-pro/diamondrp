import { weather } from "../managers/weather";
import { user } from "../user";
import { inventory } from "../inventory";
import { items } from "../items";
import { testMode } from "..";
import { chat } from "./chat";
import { methods } from "./methods";
import { levelAccess } from "../../util/level";
let amount = methods.getRandomInt(287, 402);
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
  amount = methods.getRandomInt(287, 402)
  isgrab = 4
  methods.explodedDoors.forEach((item, index) => {
    if(item[3] == 961976194){
      methods.openDoorRestore(...item)
      methods.explodedDoors.splice(index, 1);
    }
  })
}

chat.registerCommand('grabtest', player => {
  if(!user.isAdminNow(player, 6)) return;
  if(!testMode) return;
  qtick();
  player.notify("Pacific обновлён")
})

updatePacific();

methods.createExplopeCheckpoint(new mp.Vector3(255.2283, 223.976, 102.3932), 961976194, player => {
  if (!testMode && weather.getHour() > 6) {
    player.notify("~r~Доступно только с 0 до 6 утра игрового времени");
    return false;
  }
  if(methods.explodedDoors.find((item) => item[3] == 961976194)){
    player.notify("~r~Дверь взорвана")
    return false
  }
  return true;
});
methods.createEnterCheckpoint(new mp.Vector3(252.72, 221.68, 101.68), player => {
  if (methods.explodedDoors.find((item) => item[3] == 961976194)) return;
  user.teleport(player, 254.12, 225.42, 101.88, 263.64);
  player.notify("~r~Дверь не взорвана");
})

const pacificPos = new mp.Vector3(265.37, 213.73, 100.68)

let intervalEvent:any;

methods.createDynamicCheckpoint(pacificPos, "Нажмите ~g~E~w~ чтобы ограбить банк Pacific", player => {
  if(player.vehicle) return player.notify("~r~Грабить в транспорте?")
  if(isgrab == 0) return player.notify("~r~Сейчас точка занята");

  if (!testMode && weather.getHour() >= 6) {
    player.notify("~r~Доступно только с 0 до 6 утра игрового времени");
    return;
  }

  if(!methods.explodedDoors.find((item) => item[3] == 961976194)) return player.notify("~r~Дверь не взорвана")

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
  
  if (!testMode && mp.players.length < 150) {
      player.notify("~r~Онлайн на сервере должен быть более 150 человек");
      return;
  }
  if (amount <= 0) {
    player.notify("~r~Пусто");
    return;
  }
  isgrab--;
  amount--;
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
    user.giveWanted(player, 10, 'Ограбление банка Pacific');
  

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
          user.log(player, "Grab", `вытащил из ячейки пацифика куш ${sum}$`);
          player.notify("~y~Вы сорвали куш")
        } else {
          // user.takeNewItem(player, 141, methods.getRandomInt(500, 1500));
          const sum = methods.getRandomInt(800, 1000) * 2
          player.bankgrabmoney+=sum
          user.log(player, "Grab", `вытащил из ячейки пацифика ${sum}$`);
        }
        player.notify("~g~В сумке: "+player.bankgrabmoney+"$")
        user.setComponentVariation(player, 5, 45, 0);
      } else {
        player.notify("~r~Ячейка пустая")
      }
      if(amount > 0) player.notify("Осталось ячеек: "+amount);
      else player.notify("~r~Больше ячеек нет");
    });
  }, 10000);
}, 2);