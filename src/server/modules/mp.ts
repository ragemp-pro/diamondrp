/// <reference path="../../declaration/server.ts" />

import { methods } from './methods';
import { user } from '../user';
import { vehicles } from '../vehicles';
import { chat } from './chat';

let mpList:Map<string,{x:number,y:number,z:number,d:number,cnt:number,open:boolean}> = new Map();
let mpUser:Map<number,{name:string,x:number,y:number,z:number,d:number}> = new Map();




mp.events.add("playerDeath", (player:PlayerMp) => {
  exitFromMp(user.getId(player))
});

chat.registerCommand('cmp', (player, name, cnt) => {
    if (!user.isAdminNow(player)) return;
    if(!name) return player.notify("Формат команды /cmp name");
    name = name.toLowerCase();
    if (mpList.has(name)) return player.notify("Мероприятие с таким названием уже существует");
    let many = methods.parseInt(cnt);
    if(isNaN(many) || many < 0) many = 0;
    mpList.set(name, {...player.position, d:player.dimension, cnt:many, open:true});
    chat.sendToAll(
        `Администратор  ${user.getRpName(player)} ${`(${user.getId(player)})`}`,
        `создал мероприятие. Участвовать - !{${
          chat.clWhite
        }} /mp ${name}`,
        chat.clRed
      );
});
chat.registerCommand('checkmp', (player, name, cnt) => {
    if (!user.isAdminNow(player)) return;
    if(!name) return player.notify("Формат команды /checkmp name");
    name = name.toLowerCase();
    if (!mpList.has(name)) return player.notify("Мероприятие с таким названием не существует");
    let mpdata = mpList.get(name);
    let h = 0;
    mpUser.forEach((item) => {
      if(item.name == name) h++;
    })
    return player.notify(`Количество участников ${h} / ${mpdata.cnt}`);
});

chat.registerCommand('dmp', (player, name) => {
    if (!user.isAdminNow(player)) return;
    if(!name) return player.notify("Формат команды /cmp name");
    name = name.toLowerCase();
    if (!mpList.has(name)) return player.notify("Мероприятие с таким названием не существует");
    mpList.delete(name);
    chat.sendToAll(
        `Администратор  ${user.getRpName(player)} ${`(${user.getId(player)})`}`,
        `мероприятие ${name} завершено`,
        chat.clRed
      );
    mpUser.forEach((item,id) => {
      exitFromMp(id)
    })
});

chat.registerCommand('stopmp', (player, name) => {
    if (!user.isAdminNow(player)) return;
    if(!name) return player.notify("Формат команды /cmp name");
    name = name.toLowerCase();
    if (!mpList.has(name)) return player.notify("Мероприятие с таким названием не существует");
    mpList.get(name).open = false;
    player.notify("МП закрыто для участия");
});


chat.registerCommand('mp', (player, name) => {
    if(!name) return player.notify("Формат команды /cmp name");
    name = name.toLowerCase();
    if (!mpList.has(name)) return player.notify("Мероприятие с таким названием не существует либо уже завершенно");
    let mpdata = mpList.get(name);
    if (!mpdata.open) return player.notify("Мероприятие не доступно для телепортации");
    if(mpdata.cnt != 0){
      let h = 0;
      mpUser.forEach((item) => {
        if(item.name == name) h++;
      })
      if(h >= mpdata.cnt) return player.notify("Лимит участников в МП превышен");
    }
    if (mpUser.has(user.getId(player))) return player.notify("Вы уже участвуете в мероприятии");
    if (user.isInMp(player)) return player.notify(`~r~Вы уже зарегистрированы либо принимаете участие в другом мероприятии`)
    if (!user.isReadyForSmth(player)) return player.notify("Вы не можете участвовать в мероприятии");
    mpUser.set(user.getId(player), {...player.position, d:player.dimension, name});
    player.setVariable("inMp", true)
    user.teleport(player, mpdata.x, mpdata.y, mpdata.z);
    player.dimension = mpdata.d;
});

function exitFromMp(id:number){
  setTimeout(() => {
    let item = mpUser.get(id);
    if(!item) return;
    let target = user.getPlayerById(id);
    if(target && mp.players.exists(target)){
      user.healProtect(target)
      target.setVariable("inMp", false)
      target.notify("Вы покинули мероприятие")
      target.spawn(new mp.Vector3(item.x, item.y, item.z));
      target.health = 100;
      target.dimension = item.d;
    }
    mpUser.delete(id);
  }, 200)
}