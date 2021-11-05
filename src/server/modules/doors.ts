import { user } from '../user';
import { methods } from './methods';
import { sleep } from '../../util/methods';
import { inventory } from '../inventory';
import { doorsData } from '../../util/doors';
/// <reference path="../../declaration/server.ts" />

let doors: {
  [id: string]: {
    offset: number;
    mystatus: boolean;
    hash: string|number;
    x: number;
    y: number;
    z: number;
    locked: boolean;
    key: string;
    permission: string;
    name: string;
    pair?: number;
    unlock?: boolean;
    alert?: boolean;
  };
} = { ...doorsData};

for (let id in doors) {
  let data = doors[id];
  let unlocking = false;
  methods.createDynamicCheckpoint(new mp.Vector3(data.x, data.y, data.z), "Нажмите ~g~E~w~ чтобы открыть двери "+data.name, async player => {
    if(player.spamProtect) return player.notify("~r~Не так быстро");
    player.spamProtect = true;
    setTimeout(() => {
      if(mp.players.exists(player)) player.spamProtect = false;
    }, 5000)
    if (!data) return;
    let access = true;
    if (data.permission.indexOf('.') > -1) {
      let frac = data.permission.split('.')[0];
      if (user.get(player, 'fraction_id') != methods.parseInt(frac) && !user.isAdminNow(player))
      access = false
      let sec = data.permission.split('.')[1];
      if (sec == 'leader' && !user.isLeader(player) && !user.isAdminNow(player))
      access = false
    } else {
      if (user.get(player, 'fraction_id') != methods.parseInt(data.permission) && !user.isAdminNow(player))
      access = false;
    }

    let acceptUnlock = false;
    if(!access && data.locked && data.unlock) acceptUnlock = await user.accept(player, "Взломать с помощью отмычки?")
    if(!access && !acceptUnlock){
      return player.notify('У вас нет ключей от дверей ' + data.name);
    }

    if(acceptUnlock){
      if(!user.getItem(player, 263)) return player.notify("~r~У вас нет специальной отмычки");
      if (user.get(player, 'fractionType') != 4 && !user.isMafia(player) && !user.isGang(player)) {
        player.notify('~r~Вы не состоите в ОПГ или Мафии');
        return;
      }
      if(unlocking) return player.notify("~r~Кто то уже взламывает замок");
      user.playAnimation(player, "mp_arresting", "a_uncuff", 8);
      user.disableAllControls(player, true);
      unlocking = true;
      await sleep(20000)
      unlocking = false;
      if(!mp.players.exists(player)) return;
      user.stopAnimation(player);
      user.disableAllControls(player, false);
      if(!user.getItem(player, 263)) return player.notify("~r~У вас нет специальной отмычки");
      if(!data.locked) return player.notify("~r~Уже открыто");
      if (methods.getRandomInt(0, 3) == 0) {
        inventory.deleteItem(user.getItem(player, 263).id);
        player.notify('~r~Вы сломали отмычку');
      }
      if (methods.getRandomInt(0, 3) == 0) {
        return player.notify("~r~У вас не получилось взломать замок");
      }
      if (data.alert){
        mp.players.toArray().filter(player => user.getPlayerFraction(player) == methods.parseInt(data.permission)).map(player => {
          user.alert(player, `Внимание!!! ${data.name} были взломаны`, 'warning')
        })
      }
    }
    if(!mp.players.exists(player)) return;

    data.locked = acceptUnlock ? false : !data.locked;

    user.playAnimation(player, 'veh@std@bobcat@ds@enter_exit', 'd_locked', 8)
    setTimeout(function() {
      mp.players.call('sendDoorState', [id, data.locked]);
      if (data.pair) {
        doors[data.pair.toString()].locked = data.locked;
        mp.players.call('sendDoorState', [data.pair, data.locked]);
      }
      if(!mp.players.exists(player)) return;

      if (data.locked) {
        //market.text = "~r~Закрыто";
        player.notify('Дверь закрыта');
      } else {
        //market.text = "~g~Открыто";
        player.notify('Дверь открыта');
      }
    }, 1500);
  }, 1, 0, [0,0,0,0])
}


mp.events.add('playerJoin', (player: PlayerMp) => {
  let datas:[string, boolean][] = [];
  for (let id in doors) {
    datas.push([id, doors[id].locked])
  }
  player.call('sendDoorsList', [JSON.stringify(datas)]);
})