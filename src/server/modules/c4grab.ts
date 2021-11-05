import { methods } from "./methods";
import { weather } from "../managers/weather";
import { user } from "../user";
import { inventory } from "../inventory";
import { items } from "../items";
import { levelAccess } from "../../util/level";
export let c4grabamount = 100;
let isgrab = 2;

const maxOnlineGrabArmyC4 = 100

export const c4grabDays = [1,5,9,13,17,21,25,29];

methods.createDynamicCheckpoint(new mp.Vector3(-1781.40, 2996.11, 31.81), "Нажмите ~g~E~w~ чтобы ограбить склад C4", player => {
  if(!isgrab) return player.notify("~r~Сейчас точка занята");
  let dateTime = new Date();
  if (dateTime.getHours() < 17 || dateTime.getHours() > 20) {
      player.notify('~r~Доступно только с 17 до 20 вечера ООС времени');
      return;
  }
  
  if (!c4grabDays.includes(dateTime.getDate())) {
      player.notify(`~r~Ограбление доступно в следующие дни: ${c4grabDays.join(', ')}`);
      return;
  }
  // if (weather.getHour() < 23 && weather.getHour() > 5) {
  //   player.notify("~r~Доступно только с 23 до 5 утра игрового времени");
  //   return;
  // }

  if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
    return player.notify("~r~Требуется "+items.getItemNameById(263));
  }
  
  
  if (user.has(player, 'isGrab')) {
      player.notify('~r~Это действие сейчас не доступно');
      return;
  }
  
  if (user.get(player, 'fractionType') != 4 && !user.isMafia(player)) {
      player.notify('~r~Вы не состоите в ОПГ или Мафии');
      return;
  }
  
  if(user.getLevel(player) < levelAccess.c4grab) return player.notify("~r~Необходимо иметь "+levelAccess.c4grab+" уровень")
  
  if (mp.players.length < maxOnlineGrabArmyC4) {
      player.notify("~r~Онлайн на сервере должен быть более " + maxOnlineGrabArmyC4 + " человек");
      return;
  }
  if (c4grabamount <= 0) {
      player.notify("~r~Пусто");
      return;
  }
  isgrab--;
  c4grabamount--;
  user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
  user.disableAllControls(player, true);
  setTimeout(function() {
    user.playAnimation(player, "anim@heists@money_grab@duffel", "loop", 9);
  }, 5000);
  setTimeout(function() {
    isgrab++;
    if (!user.isLogin(player))
        return;
  
    user.disableAllControls(player, false);
    user.giveWanted(player, 10, 'Ограбление хранилища USMC');
  

    user.reset(player, 'isGrab');
    user.stopAnimation(player);
    if(!inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263)){
      return player.notify("~r~Требуется "+items.getItemNameById(263));
    }
    if (methods.getRandomInt(0, 3) == 0) {
        inventory.deleteItem(inventory.getItemListData(1, user.getId(player)).find(itm => itm.item_id == 263).id);
        player.notify('~r~Вы сломали отмычку');
    }
    if(methods.getRandomInt(1, 4) == 1 && c4grabamount > 0){
      inventory.addItem(player, 262, 1, 1, user.getId(player), 1);
      player.notify("~g~Вы получили (x1) "+items.getItemNameById(262))
    } else {
      player.notify("~r~Контейнер оказался пустой");
    }
    if(c4grabamount > 0) player.notify("Осталось контейнеров: "+c4grabamount);
    else player.notify("~r~Больше контейнеров нет, ожидайте пополнение склада");
  }, 10000);
}, 2);