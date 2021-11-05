/// <reference path="../../declaration/server.ts" />


import { npc, npc_dialog } from "./npc";
import { user } from "../user";
import { enabledSystem } from './chat';
import { levelAccess } from "../../util/level";





// npc_dialog.new("Лео", "Помощник Санта Клауса", new mp.Vector3(-448.67, 1148.07, 325.90), 298.19, "a_m_y_epsilon_01", (player) => {
//   if(!user.questActive(player, "Сбор подарков #1") && !user.questCompleted(player, "Сбор подарков #1")){
//     npc_dialog.open(player, "Приветствую тебя мой друг. Нам с Санта Клаусом нужна твоя помощь. Пока мы летели в штат - растеряли много подарков. Прошу тебя - помоги нам их собрать.", ["Не, я не хочу", "Да, я помогу"]).then((status) => {
//       npc_dialog.close(player);
//       if(status){
//         user.giveQuest(player, "Сбор подарков #1", true);
//         player.notify("Список квестов - F8")
//       }
//     })
//   } else {
//     npc_dialog.open(player, "Оу, друг мой, как же я устал, прошу тебя, помоги собрать подарки. Чтобы узнать сколько подарков ты собрал - нажми F8", ["Да, я продолжу искать"]).then((status) => {
//       npc_dialog.close(player);
//     })
//   }
// });


//? NPC для стартового квеста

let startQuestNpc = npc_dialog.new("Кевин", "Сотрудник мэрии", new mp.Vector3(-524.55, -254.58, 35.68), 236.50, "ig_andreas", (player) => {
  if(!player.quests) player.quests = [];
  if(!enabledSystem.npcquest){
    npc_dialog.open(player, "Прошу прощение, у меня скоро обеденный перерыв, подойдите чуть позже", ["Закрыть"]).then(() => {
      npc_dialog.close(player);
    })
    return
  }
  if(!user.questActive(player, "Начало пути") && !user.questCompleted(player, "Начало пути") && (user.getLevel(player) <= levelAccess.startQuest) && user.get(player, "exp_age") == 0){
    npc_dialog.open(player, "Приветствую, меня зовут Кевин! Вижу Вы недавно прибыли к нам в штат, я помогу вам освоиться. Ну что, готовы все узнать и подзаработать?", ["Да, готов", "Нет, не интересно"]).then(status => {
      if(status) return npc_dialog.close(player);
      user.giveQuest(player, "Начало пути", true);
      npc_dialog.open(player, "Для начала ознакомьтесь с управлением вашего персонажа. Это Вы увидите в меню справа, которое вызывается и убирается стрелками на вашей клавиатуре. И обязательно посмотрите справку, нажав F2. Там вы найдете все, что есть у нас в штате. Затем можете приступать к заданиям, которые располагаются под кнопкой F8. За каждое пройденное задание начисляется бонус. Удачи!", ["Я пошёл"]).then(() => {
        npc_dialog.close(player);
      })
    })
    return;
  } else if(user.questActive(player, "Начало пути")){
    npc_dialog.open(player, "Для начала ознакомьтесь с управлением Вашего персонажа. Это Вы увидите в меню справа, которое вызывается и убирается стрелками на вашей клавиатуре. И обязательно посмотрите справку, нажав F2. Там Вы найдете все, что есть у нас в штате. Затем можете приступать к заданиям, которые располагаются под кнопкой F8. За каждое пройденное задание начисляется бонус. Удачи!", ["Я пошёл"]).then(() => {
      npc_dialog.close(player);
    })
  } else {
    if(user.questCompleted(player, "Что дальше")) npc_dialog.open(player, "Привет, давно не виделись. У меня для вас пока ничего нет.", ["Понятно"]).then(() => npc_dialog.close(player))
    else if(user.questActive(player, "Что дальше")){
      npc_dialog.open(player, "Ого, кого я вижу! Смотрю Вы уже освоились, выглядите намного лучше. Теперь Вы многое знаете, но еще не все. Подскажу, что когда вы достигните второго уровня, вы сможете устроиться в организацию. Следите за новостями о наборах. Так же в новостях о наборе в охранное агентство или посольство замаскированы неофициальные организации в штате. Так что сами сможете выбрать, как продолжить свой путь. А пока что, в здании правительства можете устроится на какую-нибудь работу. Я думаю вы добьетесь многого в нашем штате. Удачи, еще встретимся!", ["Я пошёл"]).then(() => {
        npc_dialog.close(player);
        user.completeQuest(player, "Что дальше", true);
      })
    } else {
      npc_dialog.open(player, "Привет. Как я вижу Вы уже давно в нашем штате, у меня нет заданий для Вас", ["Я пошёл"]).then(() => {
        npc_dialog.close(player);
      })
    }
  }
});
