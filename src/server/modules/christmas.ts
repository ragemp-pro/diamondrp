// import { methods } from "./methods";
// import { menu } from "./menu";

// import { user } from "../user";
// import { items } from "../items";
// import { inventory } from "../inventory";
// import { chat, enabledSystem } from "./chat";
// let data = new Date();

// /** Координаты новогодней ёлки */
// const pos = new mp.Vector3(-1380.76, -518.35, 29.49);
// /** С какого дня можно начать складывать подарки под ёлку */
// const minDayGive = 20;
// /** До какого дня их можно забрать */
// const maxDayTake = 7;
// /** Статус доступа для дарения */
// let isTimeForGiveGift = (data.getMonth() == 11 && data.getDate() >= minDayGive)
// /** Статус доступа для подбирания подарка */
// let isTimeForTakeGift = (data.getMonth() == 0 && data.getDate() <= maxDayTake)

// // setInterval(() => {
// //   data = new Date();
// //   isTimeForGiveGift = (data.getMonth() == 11 && data.getDate() >= minDayGive)
// //   isTimeForTakeGift = (data.getMonth() == 0 && data.getDate() <= maxDayTake)
// // }, 60000)

// const snowmangame = {
//   positionRegister: new mp.Vector3(-428.14, 1115.65, 325.77),
//   positionCenter: new mp.Vector3(-407.89, 1186.63, 324.56),
//   newMarkerRadius: 22.4,
//   team1: {
//     snowpos: new mp.Vector3(-429.00, 1134.15, 324.90),
//     snowheading: 350.69
//   },
//   team2: {
//     snowpos: new mp.Vector3(-417.54, 1131.03, 324.90),
//     snowheading: 161.11
//   },
//   snowprop: ["snowman_1", "snowman_2", "snowman_3", "snowman_4"],
//   snowpropnumber: [5, 10, 15, 20],
//   winMoney: 1000,
//   lobbys: <Map<number,SnowGame>> new Map(),
//   lobbysids: 1000,
//   /** Минимальное количество участников для запуска лобби */
//   lobbyminimal: 2
// }

// // const blip = mp.blips.new(120, snowmangame.positionRegister, {
// //   scale: 0.4,
// //   dimension: 0,
// //   color: 37,
// //   shortRange: true,
// //   name: "Резиденция Санта Клауса"
// // })

// // setTimeout(() => {
// //   setInterval(() => {
// //     if(enabledSystem.snowmangame)
// //     new SnowGame(15);
// //   }, 60000*60)
// // }, 30000*60)

// // chat.registerCommand("snowtest", player => {
// //   if(!user.isAdminNow(player, 6)) return;
// //   new SnowGame(1)
// // })

// // setTimeout(() => {
// //   methods.createDynamicCheckpoint(snowmangame.positionRegister, "Нажмите ~g~E~w~ чтобы открыть меню регистрации", player => {
// //     let m = menu.new(player, "Регистрация");
// //     snowmangame.lobbys.forEach(lobby => {
// //       if(lobby.status == "waiting"){
// //         m.newItem({
// //           name: "Лобби №"+lobby.id,
// //           more: " Участников: "+lobby.players.length,
// //           onpress: () => {
// //             lobby.join(player)
// //           }
// //         })
// //       }
// //     })
// //     m.open();
// //   }, 2)
// // }, 1000)

// // mp.events.add("playerDeath", (player:PlayerMp) => {
// //   if(!player.snowLobby) return;
// //   const lobby = snowmangame.lobbys.get(player.snowLobby);
// //   if(!lobby) return;
// //   if(lobby.status == "game") lobby.kick(user.getId(player))
// //   else player.snowLobby = null;
// // });

// class SnowGame {
//   readonly id: number;
//   timer: number;
//   players: number[];
//   status: "waiting"|"game"|"closed";
//   team1players: number[];
//   team2players: number[];
//   team1count: number;
//   team2count: number;
//   team1object: ObjectMp;
//   team2object: ObjectMp;
//   team1check: { delete: () => void; updatePos: (posnew: Vector3Mp) => void; updateName: (name: string) => void; };
//   team2check: { delete: () => void; updatePos: (posnew: Vector3Mp) => void; updateName: (name: string) => void; };
//   check: { delete: () => void; updatePos: (posnew: Vector3Mp) => void; updateName: (name: string) => void; };
//   blip: BlipMp;
//   team1label: TextLabelMp;
//   team2label: TextLabelMp;
//   constructor(timer:number = 5){
//     this.players = [];
//     this.team1players = [];
//     this.team2players = [];
//     this.team1count = 0;
//     this.team2count = 0;
//     this.team1object = null;
//     this.team2object = null;
//     this.timer = timer;
//     this.status = "waiting";
//     snowmangame.lobbysids++;
//     this.id = snowmangame.lobbysids;
//     snowmangame.lobbys.set(this.id, this);
//     // methods.setBlipAlert(blip, 120000);
//     chat.sendToAll('Система', `!{${chat.clBlue}} Зарегистрировано новогоднее соревнование !{${chat.clWhite}}Сбор снежков!{${chat.clBlue}}. Начало соревнования через !{${chat.clWhite}}${timer} мин.!{${chat.clBlue}}. Чтобы принять участние - проследуйте к центру регистрации около резиденции Санта Клауса`, chat.clBlue);
//     let q = setInterval(() => {
//       this.timer--;
//       if(this.timer == 0){
//         clearInterval(q)
//         if(this.players.length < snowmangame.lobbyminimal){
//           this.playersNotify("~r~Недостаточно участников для запуска лобби")
//           this.players.forEach(id => {
//             this.kick(id, false)
//           })
//           this.status = "closed";
//           return;
//         }
//         this.playersNotify("~b~Запуск лобби")
//         this.start();
//       } else {
//         if(this.timer % 5 == 0){
//           // methods.setBlipAlert(blip, 60000);
//           chat.sendToAll('Система', `!{${chat.clBlue}} Осталось всего !{${chat.clWhite}}${this.timer} мин.!{${chat.clBlue}} до начала соревнования по !{${chat.clWhite}}Сбору снежков!{${chat.clBlue}}. Чтобы принять участние - проследуйте к центру регистрации около резиденции Санта Клауса`, chat.clBlue);
//         }
//         this.playersNotify("~b~До запуска лобби осталось "+this.timer+" мин.")
//       }
//     }, 60000)
//   }
//   playersNotify(text:string){
//     this.checkPlayers();
//     this.players.map(id => {
//       let target = user.getPlayerById(id);
//       if(target) target.notify(text)
//     })
//   }
//   teamNotify(team:1|2,text:string){
//     this.checkPlayers();
//     if(team == 1){
//       this.team1players.forEach(id => {
//         let target = user.getPlayerById(id);
//         if(target) target.notify(text)
//       })
//     } else {
//       this.team2players.forEach(id => {
//         let target = user.getPlayerById(id);
//         if(target) target.notify(text)
//       })
//     }
//   }
//   checkPlayers(){
//     this.players.map(id => {
//       if(!user.getPlayerById(id)) this.kick(id)
//     })
//   }
//   kick(id:number,notify = true){
//     this.players.splice(this.players.indexOf(id), 1);
//     this.team1players.splice(this.team1players.indexOf(id), 1);
//     this.team2players.splice(this.team2players.indexOf(id), 1);
//     if(this.status == "waiting") return;
//     let target = user.getPlayerById(id);
//     let name = (mp.players.exists(target) && target) ? user.getRpName(target) : "Игрок"
//     if(notify) this.playersNotify("~b~"+name+" покинул лобби");
//     if(target){
//       if(target.health == 0) target.spawn(snowmangame.positionRegister)
//       else user.teleport(target, snowmangame.positionRegister.x, snowmangame.positionRegister.y, snowmangame.positionRegister.z);
//       setTimeout(() => {
//         if(!mp.players.exists(target)) return;
//         user.healProtect(target)
//         if(target.health == 0) target.spawn(snowmangame.positionRegister)
//         target.health = 100;
//       }, 1000)
//       target.dimension = 0;
//       target.notify("~r~Вы покинули лобби")
//       target.snowLobby = null;
//     }
//   }
//   endGame(team:1|2){
//     this.status = "closed";
//     this.playersNotify("~g~Победила команда "+((team == 1) ? '~r~Красных' : "~b~Синих"));
//     setTimeout(() => {
//       if(team == 1){
//         this.team1players.forEach(id => {
//           let target = user.getPlayerById(id);
//           if(!target || !mp.players.exists(target)) return;
//           if(!mp.players.exists(target)) return;
//           user.addCashMoney(target, snowmangame.winMoney);
//           target.notify("~g~Вы получили за победу: "+snowmangame.winMoney+"$");
//         })
//       } else {
//         this.team2players.forEach(id => {
//           let target = user.getPlayerById(id);
//           if(!target || !mp.players.exists(target)) return;
//           if(!mp.players.exists(target)) return;
//           user.addCashMoney(target, snowmangame.winMoney);
//           target.notify("~g~Вы получили за победу: "+snowmangame.winMoney+"$");
//         })
//       }
//       setTimeout(() => {
//         mp.players.forEach(usr => {
//           if(usr.snowLobby == this.id) this.kick(user.getId(usr), false);
//         })
//       }, 2000);
//     }, 2000);
//     if(mp.objects.exists(this.team1object)) this.team1object.destroy()
//     if(mp.objects.exists(this.team2object)) this.team2object.destroy()
//     if(this.team1check) this.team1check.delete();
//     if(this.team2check) this.team2check.delete();
//     if(this.check) this.check.delete();
//     if(this.blip) this.blip.destroy(), this.blip = null;
//     if(this.team1label) this.team1label.destroy();
//     if(this.team2label) this.team2label.destroy();

//   }
//   start(){
//     this.status = "game";
//     setTimeout(() => {
//       this.checkPlayers();
//       this.players.map(id => {
//         if(this.team1players.length <= this.team2players.length){
//           this.team1players.push(id)
//           user.getPlayerById(id).notify("~g~Вас определило в команду ~r~Красных")
//         } else {
//           this.team2players.push(id)
//           user.getPlayerById(id).notify("~g~Вас определило в команду ~b~Синих")
//         }
//       })
//       setTimeout(() => {
//         this.checkPlayers();
//         this.team1players.map(id => {
//           const target = user.getPlayerById(id)
//           target.dimension = this.id;
//           user.teleport(target, snowmangame.team1.snowpos.x, snowmangame.team1.snowpos.y, snowmangame.team1.snowpos.z)
//         })
//         this.team2players.map(id => {
//           const target = user.getPlayerById(id)
//           target.dimension = this.id;
//           user.teleport(target, snowmangame.team2.snowpos.x, snowmangame.team2.snowpos.y, snowmangame.team2.snowpos.z)
//         })
//         setTimeout(() => this.playersNotify("Обратный отчёт: 3"), 1000)
//         setTimeout(() => this.playersNotify("Обратный отчёт: 2"), 2000)
//         setTimeout(() => this.playersNotify("Обратный отчёт: 1"), 3000)
//         setTimeout(() => this.playersNotify("Поехали"), 4000)
//         setTimeout(() => {
//           this.team1label = mp.labels.new(this.team1count+"/"+snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1], new mp.Vector3(snowmangame.team1.snowpos.x,snowmangame.team1.snowpos.y, snowmangame.team1.snowpos.z + 1.2), {
//             dimension: this.id,
//             drawDistance: 20,
//             los: false,
//             font: 1
//           })
//           this.team2label = mp.labels.new(this.team2count+"/"+snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1], new mp.Vector3(snowmangame.team2.snowpos.x,snowmangame.team2.snowpos.y, snowmangame.team2.snowpos.z + 1.2), {
//             dimension: this.id,
//             drawDistance: 20,
//             los: false,
//             font: 1
//           })
//           this.team1check = methods.createDynamicCheckpoint(snowmangame.team1.snowpos, "Нажмите ~g~E~w~ чтобы слепить снеговика из имеющихся снежков", player => {
//             if(this.team1players.indexOf(user.getId(player)) == -1) return player.notify("~r~Это не ваш снеговик");
//             if(!player.snowSnows) return player.notify("~r~У вас нет снежков");
//             player.snowSnows--;
//             user.playAnimation(player, 'pickup_object', 'pickup_low', 8)
//             setTimeout(() => {
//               this.team1count++;
//               this.team1label.text = this.team1count+"/"+snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1]
//               this.teamNotify(1, "Состояние снеговика: "+this.team1count+"/"+snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1])
//               if(snowmangame.snowpropnumber.indexOf(this.team1count) != -1){
//                 if(mp.objects.exists(this.team1object)) this.team1object.destroy();
//                 this.team1object = mp.objects.new(mp.joaat(snowmangame.snowprop[snowmangame.snowpropnumber.indexOf(this.team1count)]), snowmangame.team1.snowpos, {dimension:this.id});
//                 this.team1object.dimension = this.id;
//               }
//               if(snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1] == this.team1count){
//                 // Конец игры
//                 this.endGame(1)
//               }
//             }, 1950)
//           }, 2, this.id, [255,0,0,60])
//           this.team2check = methods.createDynamicCheckpoint(snowmangame.team2.snowpos, "Нажмите ~g~E~w~ чтобы слепить снеговика из имеющихся снежков", player => {
//             if(this.team2players.indexOf(user.getId(player)) == -1) return player.notify("~r~Это не ваш снеговик");
//             if(!player.snowSnows) return player.notify("~r~У вас нет снежков");
//             player.snowSnows--;
//             user.playAnimation(player, 'pickup_object', 'pickup_low', 8)
//             setTimeout(() => {
//               this.team2count++;
//               this.team2label.text = this.team2count+"/"+snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1]
//               this.teamNotify(2, "Состояние снеговика: "+this.team2count+"/"+snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1])
//               if(snowmangame.snowpropnumber.indexOf(this.team2count) != -1){
//                 if(mp.objects.exists(this.team2object)) this.team2object.destroy();
//                 this.team2object = mp.objects.new(mp.joaat(snowmangame.snowprop[snowmangame.snowpropnumber.indexOf(this.team2count)]), snowmangame.team2.snowpos, {dimension:this.id});
//               }
//               if(snowmangame.snowpropnumber[snowmangame.snowpropnumber.length-1] == this.team2count){
//                 // Конец игры
//                 this.endGame(2)
//               }
//             }, 1950)
//           }, 2, this.id, [0,0,255,60])
//           const create = () => {
//             const randpos = methods.getRandomPoint(snowmangame.positionCenter, snowmangame.newMarkerRadius);
//             if(this.status != "game") return;
//             this.blip = mp.blips.new(274, randpos, {
//               scale: 0.6,
//               dimension: this.id,
//               color: 37,
//               shortRange: false,
//               name: "Снежок"
//             })
//             this.check = methods.createDynamicCheckpoint(randpos, "Нажмите ~g~E~w~ чтобы поднять снежок", player => {
//               this.check.delete();
//               if(this.blip) this.blip.destroy(), this.blip = null;
//               this.check = null;
//               setTimeout(() => {
//                 create();
//               }, 3000)
//               user.playAnimation(player, 'anim@mp_snowball', 'pickup_snowball', 8)
//               setTimeout(() => {
//                 if(!mp.players.exists(player)) return;
//                 if(!player.snowSnows) player.snowSnows = 0;
//                 if(player.snowSnows) return player.notify("~r~У вас в руках уже есть снежок. Несите его на базу")
//                 player.snowSnows++;
//                 player.notify("~g~Вы подняли снежок, скорее несите его на базу чтобы слепить снеговика")
//               }, 1950)
//             }, 2, this.id)
//           }
//           create();
//         }, 5000)
//       }, 1000)
//     }, 1000)
//   }
//   join(player:PlayerMp){
//     if(player.raceLobby) return player.notify("~r~Вы принимаете участие в гоночном состязании, поэтому не можете участвовать.");
//     if(typeof player.snowLobby == "number") return player.notify("~r~Вы уже принимаете участие в другом состязании, поэтому не можете участвовать.");
//     this.players.push(user.getId(player))
//     player.notify("~g~Вы зарегистрированы для участия в игре, ожидайте начала");
//     player.snowLobby = this.id
//     player.snowSnows = 0;
//     menu.close(player);
//   }
// }
// let checkpoint:any;
// setTimeout(() => {
//   if(isTimeForGiveGift || isTimeForTakeGift){
//     checkpoint = methods.createDynamicCheckpoint(pos, "Нажмите ~g~E~w~ чтобы новогодние подарки", player => mainGift(player), 2)
//   } else if(checkpoint){
//     checkpoint.delete();
//     checkpoint = null;
//   }
// }, 5000)


// async function mainGift(player:PlayerMp){
//   let giftsend = await mysql.executeQuery("SELECT * FROM `christmas_gift` WHERE `user` = ?", [user.getId(player)])
//     let m = menu.new(player, "Ёлка", "Действия");
//     m.newItem({
//       name: "Оставить подарок",
//       more: isTimeForGiveGift ? "" : "~r~Недоступно",
//       desc: isTimeForGiveGift ? "" : "Подарок можно было оставить до нового года",
//       onpress: () => {
//         if(giftsend.length >= 20) return player.notify("~r~Нельзя дарить более 20 подарков")
//         if(isTimeForGiveGift) sendGift(player)
//         else player.notify("~r~Подарок можно было оставить до нового года")
//       }
//     })
//     m.newItem({
//       name: "Забрать подарок",
//       more: isTimeForTakeGift ? "" : "~r~Недоступно",
//       desc: isTimeForTakeGift ? "" : "Подарок можно будет забрать после нового года",
//       onpress: () => {
//         if(isTimeForTakeGift) getGift(player)
//         else player.notify("~r~Подарок можно будет забрать после нового года")
//       }
//     })
//     m.newItem({
//       name: "Мои подарки",
//       more: giftsend.length+" шт.",
//       onpress: () => giftsThatISent(player)
//     })
//     m.open();
// }


// async function getGift(player:PlayerMp){
//   let giftsend = await mysql.executeQuery("SELECT * FROM `christmas_gift` WHERE `target` = ?", [user.getId(player)]);
//   let m = menu.new(player, "Подарки", "Список");
//   giftsend.forEach((data) => {
//     const item = JSON.parse(data.item);
//     m.newItem({
//       name: data.name,
//       more: data.received == 0 ? "~g~Получить" : "~y~Получено ("+((item.id != 0) ? items.getItemNameById(item.id) : item.amount+"$")+")",
//       onpress: () => {
//         if(data.received == 1){
//           player.notify("~r~Вы уже получили данный подарок")
//           user.accept(player, "Прочитать приложенную записку?").then(async status => {
//             if(status) await menu.input(player, "Записка от "+data.name, data.note, 1000)
//             getGift(player)
//           })
//           return;
//         }
//         if(item.id != 0){
//           let amount = inventory.getInvAmount(player, user.getId(player), 1);
//           if (amount + items.getItemAmountById(item.id) > inventory.maxAmount(1, user.getId(player))) {
//             player.notify('~r~Инвентарь заполнен, требуется освободить для получения подарка');
//             return;
//           }
//         }
//         m.close();
//         menu.input(player, "Записка от "+data.name, data.note, 1000).then(() => {
//           if(item.id == 0) user.addCashMoney(player, item.amount), player.notify("~g~Вы получили в подарок "+item.amount+"$");
//           else inventory.addItem(player, item.id, 1, 1, user.getId(player), 1, -1, -1, -1), player.notify("~g~Вы получили в подарок "+items.getItemNameById(item.id));
//           mysql.executeQuery("UPDATE `christmas_gift` SET `received` = ? WHERE `id` = ?", [1, data.id]).then(() => {
//             const usr = user.getPlayerById(data.user);
//             if(usr) usr.notify("~g~Ваш подарок для "+user.getId(player)+" только что был расспакован")
//             getGift(player);
//           })
//         });
//       }
//     })
//   })
//   m.open();
// }

// function sendGift(player:PlayerMp){
//   let m = menu.new(player, "Выбор предмета", "Список");
//   m.newItem({
//     name: "Деньги",
//     more: "Ваша наличка: "+user.getCashMoney(player)+"$",
//     onpress: () => {
//       user.accept(player, "Завернуть наличку как подарок?").then(status => {
//         if(!status) return sendGift(player);
//         menu.input(player, "ID получателя", "", 11, "int").then(ids => {
//           const id = methods.parseInt(ids);
//           if(isNaN(id) || id < 1 || id > 99999999) return player.notify("~r~ID получателя указан не верно"), sendGift(player);
//           user.checkIdUser(id).then(check => {
//             if(check == -1) return player.notify("~r~ID получателя указан не верно"), sendGift(player);
//             menu.input(player, "Подпишите подарок", "Anonim", 100).then(name => {
//               if(!name) return sendGift(player);
//               menu.input(player, "Добавьте записку к подарку", "", 500).then(note => {
//                 if(!note) return sendGift(player);
//                 if(note.length > 500) return player.notify("~r~Длинна записки не может превышать 500 символов"), sendGift(player);
//                 menu.input(player, "Введите сумму", "1000", 1000, "int").then(moneys => {
//                   const money = methods.parseInt(moneys);
//                   if(isNaN(money) || money < 1 || money > 99999999) return player.notify("~r~Сумма указанна не верно"), sendGift(player);
//                   if(user.getCashMoney(player) < money) return player.notify("~r~У вас нет столько наличных средств"), sendGift(player);
//                   mysql.executeQuery("INSERT INTO `christmas_gift` (`user`, `target`, `name`, `item`, `note`) VALUES (?, ?, ?, ?, ?)", [user.getId(player), id, name, JSON.stringify({id:0,amount:money}), note]).then(() => {
//                     user.removeCashMoney(player, money);
//                     player.notify("~g~Подарок успешно оставлен");
//                   }).catch(() => {
//                     player.notify("~r~Что то пошло не по плану. Попробуйте чуть позже");
//                   })
//                 })
//               })
//             })
//           })
//         })
//       })
//     }
//   })
//   inventory.getItemListData(1, user.getId(player)).map(item => {
//     if(item.item_id != 50){
//       m.newItem({
//         name: items.getItemNameById(item.item_id),
//         onpress: () => {
//           user.accept(player, "Завернуть "+items.getItemNameById(item.item_id)+" как подарок?").then(status => {
//             if(!status) return sendGift(player);
//             menu.input(player, "ID получателя", "", 11, "int").then(ids => {
//               const id = methods.parseInt(ids);
//               if(isNaN(id) || id < 1 || id > 99999999) return player.notify("~r~ID получателя указан не верно"), sendGift(player);
//               user.checkIdUser(id).then(check => {
//                 if(check == -1) return player.notify("~r~ID получателя указан не верно"), sendGift(player);
//                 menu.input(player, "Подпишите подарок", "Anonim", 100).then(name => {
//                   if(!name) return sendGift(player);
//                   menu.input(player, "Добавьте записку к подарку", "", 1000).then(note => {
//                     if(!note) return sendGift(player);
//                     if(!inventory.getItemListData(1, user.getId(player)).find(q => q.item_id == item.item_id && q.id == item.id)) return player.notify("~r~Кажется вы уронили предмет"), sendGift(player);
//                     mysql.executeQuery("INSERT INTO `christmas_gift` (`user`, `target`, `name`, `item`, `note`) VALUES (?, ?, ?, ?, ?)", [user.getId(player), id, name, JSON.stringify({id:item.item_id,amount:1}), note]).then(() => {
//                       inventory.deleteItem(item.id);
//                       player.notify("~g~Подарок успешно оставлен");
//                     }).catch(() => {
//                       player.notify("~r~Что то пошло не по плану. Попробуйте чуть позже");
//                     })
//                   })
//                 })
//               })
//             })
//           })
//         }
//       })
//     }
//   })
//   m.open();
// }

// async function giftsThatISent(player:PlayerMp){
//   let giftsend = await mysql.executeQuery("SELECT * FROM `christmas_gift` WHERE `user` = ?", [user.getId(player)]);
//   let m = menu.new(player, "Мои подарки", "Список");
//   giftsend.forEach((data) => {
//     const item = JSON.parse(data.item);
//     m.newItem({
//       name: data.name+" | "+data.target,
//       more: data.received == 0 ? "~r~Ещё не получен ~b~" : "~g~Получен ~b~" + ((item.id != 0) ? items.getItemNameById(item.id) : item.amount+"$")+"",
//       onpress: () => {
//         user.accept(player, "Прочитать приложенную записку?").then(async status => {
//           if(status) await menu.input(player, "Записка от "+data.name, data.note, 1000)
//           giftsThatISent(player)
//         })
//       }
//     })
//   })
//   m.open();
// }
