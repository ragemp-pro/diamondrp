/// <reference path="../../declaration/server.ts" />

import { methods } from './methods';
import { user, banUser } from '../user';
import { vehicles } from '../vehicles';
import { randomArrayEl } from '../../util/methods';
import { vipStatus } from '../../util/vip';
import { menu } from './menu';

let commands: { [name: string]: any } = {};



export const chat = {
    registerCommand: (name: string|string[], func: (player: PlayerMp, ...args: string[]) => any) => {
        console.log("[Register chat command]", name);
        if(typeof name != "string"){
          name.map(sname => {
            commands[sname] = func;
          })
        } else commands[name] = func;
    },
    clRed: <'#f44336'>'#f44336',
    clBlue: <'#2196F3'>'#2196F3',
    clOrange: <'#FFC107'>'#FFC107',
    clWhite: <'#FFFFFF'>'#FFFFFF',
    clGreen: <'#2ef26c'>'#2ef26c',
    clBlack: <'#000000'>'#000000',
    sendBCommand: function(player: PlayerMp, text: string) {
        if (user.isLogin(player)) {
            mp.players.forEach((nplayer) => {
                if(nplayer.dist(player.position) < range && nplayer.dimension == player.dimension)
                nplayer.outputChatBox(
                    `[${chat.getTime()}] !{2196F3} Игрок (${user.getShowingIdString(nplayer, player)}): !{FFFFFF}(( ${escape(text)} )) `
                )
            })
            methods.saveLog('ChatCmd', `/b ${user.getRpName(player)} (${user.getId(player)}): ${(text)}`);
        }
    },
    sendTryCommand: function(player: PlayerMp, text: string) {
        if (user.isLogin(player)) {
            let lucky = methods.getRandomInt(0, 2) == 0 ? 'Не удачно' : 'Удачно'
            mp.players.forEach((nplayer) => {
                if(nplayer.dist(player.position) < range && nplayer.dimension == player.dimension)
                nplayer.outputChatBox(
                    `[${chat.getTime()}] !{C2A2DA} ${
                        lucky
                    } ${user.getShowingIdString(nplayer, player)}  ${escape(text)}`
                )
            })
            methods.saveLog('ChatCmd', `/try ${user.getRpName(player)} (${user.getId(player)}): ${(text)} (${lucky})`);
        }
    },

    sendDoCommand: function(player: PlayerMp, text: string) {
        if (user.isLogin(player)) {
            mp.players.forEach((nplayer) => {
                if (nplayer.dist(player.position) < range && nplayer.dimension == player.dimension) nplayer.outputChatBox(`[${chat.getTime()}] !{C2A2DA} (( ${escape(text)} )) ${user.getShowingIdString(nplayer, player)} `)
            })
            methods.saveLog('ChatCmd', `/do ${user.getRpName(player)} (${user.getId(player)}): ${(text)}`);
        }
    },
    sendMeCommand: function(player: PlayerMp, text: string) {
        if (user.isLogin(player)) {
            mp.players.forEach((nplayer) => {
                if(nplayer.dist(player.position) < range && nplayer.dimension == player.dimension)
                nplayer.outputChatBox(
                    `[${chat.getTime()}] !{C2A2DA}${user.getShowingIdString(nplayer, player)} ${escape(text)}`
                )
            })
            methods.saveLog('ChatCmd', `/me ${user.getRpName(player)} (${user.getId(player)}): ${(text)}`);
        }
    },
    sendDiceCommand: function(player: PlayerMp) {
        if (user.isLogin(player)) {
            let dice = methods.getRandomInt(1, 6);
            mp.players.forEach((nplayer) => {
                if(nplayer.dist(player.position) < range && nplayer.dimension == player.dimension)
                nplayer.outputChatBox(
                    `[${chat.getTime()}] !{C2A2DA}${user.getShowingIdString(nplayer, player)} бросил кости !{FF9800}(( Выпало ${dice} ))`
                )
            })
            methods.saveLog('Dice', `${user.getRpName(player)} (${user.getId(player)}): ${dice}`);
        }
    },
    send: function(player: PlayerMp, text: string) {
        if (user.isLogin(player)) {
            mp.players.forEach((nplayer) => {
                if(nplayer.dist(player.position) < range && nplayer.dimension == player.dimension)
                nplayer.outputChatBox(
                    `[${chat.getTime()}] !{2196F3}Игрок (${user.getShowingIdString(nplayer, player)}) говорит:!{FFFFFF} ${escape(text)}`
                )
            })
            methods.saveLog('Chat', `${user.getRpName(player)} (${user.getId(player)}): ${(text)}`);
        }
    },
    sendPos: function(pos: Vector3Mp, range: number, sender: string, text: string, color = '2196F3') {
        mp.players.broadcastInRange(
            pos,
            range,
            `[${chat.getTime()}] !{${color}} ${sender}:!{FFFFFF} ${escape(text)}`
        );
    },
    sendToAll: function(sender: string, text: string, color = '2196F3') {
        mp.players.broadcast(`[${chat.getTime()}] !{${color}} ${sender}:!{FFFFFF} ${escape(text)}`);
    },
    sendAdmins: function(sender: PlayerMp, text: string, color = '309c7f') {
        mp.players.forEach(nuser => {
            if (user.isAdmin(nuser) && nuser.getVariable('enableAdmin')) nuser.outputChatBox(`[${chat.getTime()}] !{${color}} ADMIN ${user.getRpName(sender)} (${user.getId(sender)}) (LVL:${user.get(sender, 'admin_level')}):!{FFFFFF} ${escape(text)}`);
        })
    },
    sendFractionMessage: function (sender: PlayerMp, fraction: number, text: string, color = '5d98f1') {
        mp.players.forEach(nuser => {
            if (user.getPlayerFraction(nuser) == fraction) nuser.outputChatBox(`[${chat.getTime()}] !{${color}} [${user.getPlayerFractionName(nuser)}] ${user.getRpName(sender)}:!{FFFFFF} ${escape(text)}`);
        })
    },
    broadcastAdmins: function(sender: string, text: string, color = '2196F3') {
        mp.players.forEach(nuser => {
            if (user.isAdmin(nuser) && nuser.getVariable('enableAdmin')) nuser.outputChatBox(`[${chat.getTime()}] !{${color}} ${sender}:!{FFFFFF} ${escape(text)}`);
        })
    },
    sendHelpers: function(sender: PlayerMp, text: string, color = 'f7a500') {
        mp.players.forEach(nuser => {
            if (user.isHelper(nuser)) nuser.outputChatBox(`[${chat.getTime()}] !{${color}} HELPER ${user.getRpName(sender)} (${user.getId(sender)}) (LVL:${user.get(sender, 'helper_level')}):!{FFFFFF} ${escape(text)}`);
        })
    },
    sendGosRank: function(sender: PlayerMp, text: string, rank = 7, color = '7FADED') {
        mp.players.forEach(nuser => {
            if(user.isGos(nuser) && user.get(nuser, 'rank') >= rank) nuser.outputChatBox(`[${chat.getTime()}] !{${color}} [GOS] ${user.getRpName(sender)} (${user.getFractionName(user.get(sender, 'fraction_id'))}):!{FFFFFF} ${escape(text)}`);
        })
    },
    getTime: function() {
        let dateTime = new Date();
        return `${methods.digitFormat(dateTime.getHours())}:${methods.digitFormat(
            dateTime.getMinutes()
        )}:${methods.digitFormat(dateTime.getSeconds())}`;
    },
    text: (args: string[]) => args.join(' ')
};

let range = 15;

mp.events.add('server:chat:sendBCommand', function(player: PlayerMp, text: string) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.sendBCommand(player, text);
});

mp.events.add('server:chat:sendTryCommand', function(player: PlayerMp, text: string) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.sendTryCommand(player, text);
});

mp.events.add('server:chat:sendDoCommand', function(player: PlayerMp, text: string) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.sendDoCommand(player, text);
});

mp.events.add('server:chat:sendMeCommand', function(player: PlayerMp, text: string) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.sendMeCommand(player, text);
});

mp.events.add('server:chat:sendDiceCommand', function(player) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.sendDiceCommand(player);
});

mp.events.add('server:chat:send', function(player: PlayerMp, text: string) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.send(player, text);
});

mp.events.add('server:chat:sendToAll', function(player, sender, text, color) {
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.sendToAll(sender, text, color);
});

mp.events.add('playerChat', function(player: PlayerMp, text: string) {
    if(player.health == 0) return player.outputChatBox("Вы без сознания");
    let mute = user.checkMutePlayer(player, "chat");
    if (mute) {
        let date = new Date(Math.floor(mute) * 1000);
        let formattedTime = ('0' + date.getHours()).substr(-2) + ':' + ('0' + date.getMinutes()).substr(-2) + ` ${date.getDate()}/${date.getMonth() +
            1}/${date.getFullYear()}`;
        return player.outputChatBox("У вас блокировка текстового чата до " + formattedTime)
    }
    chat.send(player, text);
});

mp.events.add('playerCommand', (player: PlayerMp, command: string) => {
    const args = command.split(/[ ]+/);
    const commandName = args[0].toLowerCase();
    args.shift();
    if (commands[commandName]) commands[commandName](player, ...args);
    else {
      player.outputChatBox(
        `!{FFC107}Список доступных команд: /me, /do, /try, /b. Используйте меню на кнопку M`
      );
      if(user.isAdminNow(player)) player.outputChatBox(
        `!{FFC107}Со списком команд администратора вы можете ознакомится вызвав команду /ahelp`
      );
      if(user.isHelper(player)) player.outputChatBox(
        `!{FFC107}Для хелперов доступен чат, команда /h [TEXT]`
      );
      if(user.isGos(player) && user.get(player, 'rank') >= 7) player.outputChatBox(
        `!{FFC107}Для членов гос.фракций (>6) доступен чат /g [TEXT]`
      );
    }
});


let maxNumberForQuiz = 30;
let currentQuiz = 0;
let answersQuiz = ["Вы были близко, но мимо", "Неа, не верно", "Верно, а не, ошибочка", "Ответ не верный", "Мы бы хотели чтобы это был правильный ответ, но он не правильный", "В другой раз вы угадаете"];
setTimeout(() => {
    setTimeout(() => {
        runQuiz()
    }, 60000 * methods.getRandomInt(40, 60))
}, 10000)

function runQuiz(){
    maxNumberForQuiz = methods.getRandomInt(30, 50);
    currentQuiz = methods.getRandomInt(1, maxNumberForQuiz)
    chat.sendToAll('Викторина', `!{${chat.clBlue}} Внезапная викторина, отгадайте случайное число !{${chat.clWhite}}от 1 до ${maxNumberForQuiz}!{${chat.clBlue}}. Кто первый отгадает получит !{${chat.clGreen}}$${(maxNumberForQuiz*100)}!{${chat.clBlue}}. Чтобы отгадать введите в чат команду !{${chat.clWhite}}/quiz ЦИФРА!{${chat.clBlue}}`, chat.clBlue)
    let tm:any = setInterval(() => {
        if(currentQuiz == 0) return clearInterval(tm)
        chat.sendToAll('Викторина', `!{${chat.clBlue}} Внезапная викторина, отгадайте случайное число !{${chat.clWhite}}от 1 до ${maxNumberForQuiz}!{${chat.clBlue}}. Кто первый отгадает получит !{${chat.clGreen}}$${(maxNumberForQuiz*100)}!{${chat.clBlue}}. Чтобы отгадать введите в чат команду !{${chat.clWhite}}/quiz ЦИФРА!{${chat.clBlue}}`, chat.clBlue)
    }, 120000)
}

chat.registerCommand('quiz', (player, numbs) => {
    if(!user.isLogin(player)) return;
    if(player.spamProtect) return player.notify(`~r~Вы не можете вводить ответ так часто.`);
    if(currentQuiz == 0) return player.notify(`~r~Сейчас нет викторины.`)
    if(!numbs) return player.notify(`~r~Вы не указали свой вариант ответа`)
    player.spamProtect = true;
    setTimeout(() => {
        player.spamProtect = false;
    }, 3000)
    let numb = methods.parseInt(numbs);
    if(isNaN(numb) || numb < 1 || numb > maxNumberForQuiz) return player.notify("~r~Допускается цифра от 1 до "+maxNumberForQuiz)
    if(numb == currentQuiz){
        const answ = currentQuiz;
        currentQuiz = 0;
        player.notify('~g~Поздравляем, вы выиграли '+(maxNumberForQuiz*100)+"$");
        user.addCashMoney(player, (maxNumberForQuiz*100));
        chat.sendToAll('Викторина', `!{${chat.clBlue}}А вот и победитель, а его имя !{${chat.clWhite}}${user.getRpName(player)} (${user.getId(player)})!{${chat.clBlue}}`, chat.clBlue)
        setTimeout(() => {
            runQuiz();
        }, 60000 * methods.getRandomInt(40, 60))
    } else {
        player.notify(`~r~${randomArrayEl(answersQuiz)}`)
    }
});

chat.registerCommand('g', (player, ...textarr) => {
    if(!user.isGos(player)) return;
    if(user.get(player, 'rank') < 7) return;
    let text = chat.text(textarr);
    chat.sendGosRank(player, text);
});


chat.registerCommand('cmute', (player, ids, times, ...reasonarr) => {
    if (!user.isAdminNow(player)) return;
    if (!ids) return player.outputChatBox('Синтаксис команды следующий: /cmute [id] [time] [reason]. id указывайте игрока (игрок должен быть в сети), time - время в минутах (если уже есть мут - он будет продлён), reason - причина');
    let id = methods.parseInt(ids);
    if (isNaN(id) || id < 0) return player.notify("ID указан не верно")
    let minutes = methods.parseInt(times);
    if (isNaN(minutes) || minutes < 0) return player.notify("Время указанно не верно")
    let nplayer = user.getPlayerById(id);
    if (!nplayer) return player.notify("ID указан не верно")
    if (minutes == 0) return user.mutePlayer(nplayer, player, minutes, "chat"), player.notify("Мут снят");
    let reason = reasonarr.join(' ');
    if (reason.length < 2) return player.notify("Укажите причину")
    user.mutePlayer(nplayer, player, minutes, "chat", reason);
});

chat.registerCommand('vmute', (player, ids, times, ...reasonarr) => {
    if (!user.isAdminNow(player)) return;
    if (!ids) return player.outputChatBox('Синтаксис команды следующий: /vmute [id] [time] [reason]. id указывайте игрока (игрок должен быть в сети), time - время в минутах (если уже есть мут - он будет продлён), reason - причина');
    let id = methods.parseInt(ids);
    if (isNaN(id) || id < 0) return player.notify("ID указан не верно")
    let minutes = methods.parseInt(times);
    if (isNaN(minutes) || minutes < 0) return player.notify("Время указанно не верно");
    let nplayer = user.getPlayerById(id);
    if (!nplayer) return player.notify("ID указан не верно")
    if (minutes == 0) return user.mutePlayer(nplayer, player, minutes, "voice"), player.notify("Мут снят");
    let reason = reasonarr.join(' ');
    if (reason.length < 2) return player.notify("Укажите причину")
    user.mutePlayer(nplayer, player, minutes, "voice", reason);
})

chat.registerCommand('ahelp', (player) => {
    if (!user.isAdmin(player)) return;
    player.outputChatBox('Список доступных команд:');
    player.outputChatBox('/ban [id] [reason] - Забанить игрока по ID');
    // player.outputChatBox('/jail [id] [time] [reason] - Посадить в тюрьму');
    player.outputChatBox('/unban [id] - Разбанить игрока');
    player.outputChatBox('/cmute [id] [time] [reason] - Выдать мут игроку в минутах в текстовом чате');
    player.outputChatBox('/vmute [id] [time] [reason] - Выдать мут игроку в минутах в голосовом чате');
    player.outputChatBox('/sp [id] - Следить за игроком');
    player.outputChatBox('/d [id] - Сменить измерение (Основное - 0)');
    player.outputChatBox('/admins - Список администраторов в сети');
    player.outputChatBox('/helpers - Список хелперов в сети');
    player.outputChatBox('/a [TEXT] - Отправить сообщение в чат администраторов');
    player.outputChatBox('/pos - Текущая позиция');
    player.outputChatBox('/tp [id] | [x] [y] [z] - Телепортироватся к игроку по ID или телепортироватся на позицию по координатам');
    player.outputChatBox('/tpm [id] - Телепортировать игрока по ID к вам');
    player.outputChatBox('/tpveh [number] - Телепортировать ТС к себе');
    player.outputChatBox('/cmp [name] [limit] - Создать точку МП (limit - опционально, количество участников)');
    player.outputChatBox('/checkmp [name] - Проверить текущее количество участников');
    player.outputChatBox('/dmp [name] - Удалить МП');
    player.outputChatBox('/stopmp [name] - Закрыть МП для участия');
});

chat.registerCommand('pos', (player, name: string) => {
    let text = `X: ${player.position.x} | Y: ${player.position.y} | Z: ${player.position.z} | H: ${player.heading}`;
    player.outputChatBox(text);
    if (!user.isAdmin(player)) return;
    if (name) {
        if (player.vehicle) {
            let rot = player.vehicle.rotation;
            text = 'TYPE: VEHICLE | ' + text + ` | ROT: ${rot.x}, ${rot.y}, ${rot.z}`;
        } else {
            text = 'TYPE: PLAYER | ' + text
        }
        text += ` | NAME: ${name}`;
    }
    methods.saveLog('Pos', text + '\n');
});

chat.registerCommand('tp', (player, qx, qy, qz) => {
    if (!user.isAdminNow(player)) return;
    if(qx && !qy && !qz){
        let id = methods.parseInt(qx);
        let target = user.getPlayerById(id);
        if(!target) return player.notify("Игрок не обнаружен")
        if (target.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~Данного администратора нельзя телепортировать`);
        if(player.vehicle) player.vehicle.dimension = target.dimension;
        player.dimension = target.dimension;
        return player.vehicle ? user.teleportVeh(player, target.position.x, target.position.y, target.position.z + 2) : user.teleport(player, target.position.x, target.position.y, target.position.z + 2);
    }
    let x = methods.parseFloat(qx);
    let y = methods.parseFloat(qy);
    let z = methods.parseFloat(qz);
    player.vehicle ? user.teleportVeh(player, x, y, z) : user.teleport(player, x, y, z);
});
chat.registerCommand('tpm', (player, ids) => {
    if (!user.isAdminNow(player)) return;
    if(ids){
        let id = methods.parseInt(ids);
        let target = user.getPlayerById(id);
        if(!target) return player.notify("Игрок не обнаружен")
        if (target.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~К данному администратору нельзя телепортироваться`);
        if(target.vehicle) target.vehicle.dimension = player.dimension;
        target.dimension = player.dimension;
        return target.vehicle ? user.teleportVeh(target, player.position.x, player.position.y, player.position.z) : user.teleport(target, player.position.x, player.position.y, player.position.z);
    }
});

chat.registerCommand('tpveh', (player, number) => {
    if (!user.isAdminNow(player)) return;
    let veh = vehicles.findVehicleByNumber(number);
    if(!veh) {
        let id = methods.parseInt(number);
        if(!isNaN(id) && id > 0) veh = mp.vehicles.toArray().find(veh => veh.id == id)
    }
    if(!veh) return player.notify("ТС не обнаружен");
    methods.teleportVehicle(veh, player.position, 0, player.dimension)
});

chat.registerCommand('me', (player, ...text) => chat.sendMeCommand(player, chat.text(text)));
chat.registerCommand('do', (player, ...text) => chat.sendDoCommand(player, chat.text(text)));
chat.registerCommand('try', (player, ...text) => chat.sendTryCommand(player, chat.text(text)));
chat.registerCommand('b', (player, ...text) => chat.sendBCommand(player, chat.text(text)));
chat.registerCommand('a', (player, ...text) => {
    if (!user.isAdminNow(player)) return;
    chat.sendAdmins(player, chat.text(text));
});
chat.registerCommand('h', (player, ...text) => {
    if (!user.isHelper(player)) return;
    chat.sendHelpers(player, chat.text(text));
});
chat.registerCommand('sp', (player, ids) => {
    if (player.spectateTarget) return user.stopSpectate(player);
    if (!user.isAdminNow(player)) return;
    if (!ids) return player.notify("Формат команды: /sp [ID]");
    let id = methods.parseInt(ids);
    if (isNaN(id) || id < 0) return player.notify("ID указан не верно")
    let nplayer = user.getPlayerById(id);
    if (!nplayer) return player.notify("ID указан не верно");
    if(nplayer.spectateTarget) return player.notify(`${user.getRpName(nplayer)} за кем то наблюдает`);
    if (nplayer.teleportBlock && user.getAdminLevel(player) < 5) return player.notify(`~r~За данным администратором нельзя наблюдать`);
    user.startSpectate(player, nplayer);
});

chat.registerCommand('d', (player, ids) => {
    if (!user.isAdminNow(player)) return;
    if (!ids) return player.notify("Формат команды: /d [ID]. Ваше текущее измерение: "+player.dimension);
    let id = methods.parseInt(ids);
    if (isNaN(id) || id < 0) return player.notify("ID измерения указан не верно")
    player.dimension = id;
    player.notify("Измерение изменено на "+id);
});

chat.registerCommand('unban', (player, ids) => {
    if (!user.isAdminNow(player)) return;
    if (!ids) return player.notify("Формат команды: /unban [ID]");
    let id = methods.parseInt(ids);
    if (isNaN(id) || id < 0) return player.notify("ID указан не верно");
    menu.input(player, "Введите причину", "", 20, "text").then(val => {
        if(!val) return;
        user.unbanuser(id, player, val);
    })
    player.notify("Пользователь разблокирован");
});

// chat.registerCommand('jail', (player, ids, minutes, ...reason) => {
//     if (!user.isAdminNow(player)) return;
//     user.arrestAdmin(methods.parseInt(ids), player, methods.parseInt(minutes), chat.text(reason));
// });



chat.registerCommand('ban', async (player, ids, ...reason) => {
    if (!user.isAdminNow(player, 2)) return;
    if (!ids || !reason) return player.outputChatBox('Синтаксис команды следующий: /ban [id] [reason]');
    let id = methods.parseInt(ids);
    if (isNaN(id) || id < 0) return player.notify("~r~ID указан не верно")
    const data = await user.getUserDataFromDB(id);
    if(!data) return player.notify("~r~ID не обнаружен")
    if(data.admin_level > user.getAdminLevel(player)) return player.notify("~r~Указанный игрок выше ваш по уровню админки")
    banUser(player, id, data.rp_name, data.admin_level, reason.join(" "));
});
chat.registerCommand('admins', (player) => {
    if (!user.isAdmin(player)) return;
    player.outputChatBox(`!{70bf63}Список администраторов:`);
    setTimeout(() => {
      mp.players.toArray().map(nplayer => {
        if (user.isAdmin(nplayer)) player.outputChatBox(`${user.get(nplayer, 'rp_name')} (${user.getId(nplayer)}) (LVL:${user.get(nplayer, 'admin_level')})`)
      });
    }, 100)
});
chat.registerCommand('helpers', (player) => {
    if (!user.isAdmin(player)) return;
    player.outputChatBox(`!{70bf63}Список хелперов:`);
    setTimeout(() => {
      mp.players.toArray().map(nplayer => {
          if (user.isHelper(nplayer) && !user.isAdmin(nplayer)) player.outputChatBox(`${user.get(nplayer, 'rp_name')} (${user.getId(nplayer)}) (LVL:${user.get(nplayer, 'helper_level')})`)
      });
    }, 100)
});

chat.registerCommand(['p', 'netstat'], async (player) => {
    user.testNet(player);
});
chat.registerCommand('fps', async (player) => {
    user.testPC(player);
});

chat.registerCommand('vipuninvite', (player) => {
    if (user.getVipStatusData(player) && user.getVipStatusData(player).vipuninvite) {
    user.set(player, 'fraction_id', 0);
    user.set(player, 'rank', 0);
    user.saveAccount(player);
    player.notify('~g~Вы уволились из организации');
    user.updateClientCache(player);
    } else player.notify(`~r~Данная команда доступна для ${vipStatus.data.filter(item => item.vipuninvite).map(item => {return item.name}).join(', ')}`);
});

chat.registerCommand('test', (player) => {
    if (user.getAdminLevel(player) != 6) return;
    user.setHelp(player, 'Вы не можете использовать этот предмет');
    user.setHelpKey(player, 'E', 'Нажмите для взаимодействия');
    user.alert(player, '<strong>Новости</strong> Операция прошла успешно', 'success', 'nn.jpg');
    user.bigAlert(player, 'Операция прошла успешно', 'success');
})

chat.registerCommand('testmg', (player) => {
    if (user.getAdminLevel(player) != 6) return;
    user.minigame(player, "gr6").then(status => {
        player.notify(status ? "Удачно" : "Неудачно");
    });
})

chat.registerCommand('report', (player) => {
    player.call("report")
})

export let enabledSystem:{
    [x:string]:boolean
} = {
    autoschool:true,
    race:true,
    gr6:true,
    buycar:true,
    rent:true,
    npcquest:true,
    snowmangame:false,
}
