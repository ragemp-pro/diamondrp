import { methods } from "./methods";
import { menu } from "./menu";
import { user } from "../user";
import { auctionSettingsEntity } from "./entity/auctionSettingsEntity";
import { auctionEntity } from "./entity/auctionEntity";
import { Op } from "sequelize";
import { userEntity } from "./entity/user";

/** Текущая максимальная ставка */
let currentMaxBet = 0;
/** ID Пользователя с максимальной ставкой */
let currentMaxBetUser = 0;


/** Шаг между ставками */
const betStep = 100000;

/** Карта со всеми ставками */
let betList:Map<
/** ID игрока */
number,
/** Сумма ставки */
number> = new Map();


let auctionSettings = {
  enable: false,
  endday: 0,
  endhour: 0,
  endminute: 0,
  canaddtime: false,
  lot: "",

}

// const timeEnd = new Date();
const pos = new mp.Vector3(478.74, -107.67, 62.16)

const blip = mp.blips.new(76, pos, {
  dimension: 0,
  name: "Аукцион",
  scale: 0.5,
  color: 8,
  shortRange: true
})

/*
CREATE TABLE `auction` ( `id` INT(11) NOT NULL AUTO_INCREMENT , `user` INT(11) NOT NULL , `sum` INT(11) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
CREATE TABLE `auction_settings` ( `id` INT(11) NOT NULL AUTO_INCREMENT , `data` VARCHAR(500) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
*/

function saveConfig(){
  auctionSettingsEntity.update({
    data: JSON.stringify(auctionSettings)
  }, {where: {}})
}

let canmakebet = false;
let endtext = ``;
let nowdate = new Date();
let enddate = new Date();
let timeleft = 0;
setInterval(() => {
  nowdate = new Date();
  enddate = new Date();
  enddate.setDate(auctionSettings.endday)
  enddate.setHours(auctionSettings.endhour)
  enddate.setMinutes(auctionSettings.endminute)
  // @ts-ignore
  timeleft = (enddate - nowdate)/1000;
  endtext = ``;
  if(timeleft > 0) endtext = methods.secondsToTime(timeleft)
  if(!auctionSettings.enable) endtext = ``;
  canmakebet = !!endtext;
  auctionSettings.enable = !!endtext;
  // saveConfig();
}, 60000)


methods.createDynamicCheckpoint(pos, "Нажмите ~g~Е~s~ чтобы сделать ставку", player => {
  let m = menu.new(player, "Аукцион");

  m.newItem({
    name: "Сделать ставку",
    more: canmakebet ? "~g~Доступно":"~r~Недоступно",
    onpress: () => {
      if(!canmakebet) return;
      menu.input(player, "Введите сумму ("+currentMaxBet+"$ - "+user.getCashMoney(player)+"$)", (currentMaxBet+betStep).toString(), 11, "int").then(bets => {
        if(!canmakebet) return player.notify("~r~Ставки больше не принимаются")
        let bet = methods.parseInt(bets);
        if(isNaN(bet) || bet < 0 || bet > 9999999999) return player.notify("~r~Новая ставка указанна не верно");
        if(user.getCashMoney(player) < bet) return player.notify("~r~У вас недостаточно средств для данной ставки");
        if((currentMaxBet + betStep) > bet) return player.notify("~r~Ставка должна быть не менее "+(currentMaxBet + betStep)+"$");
        if(betList.has(user.getId(player))){
          player.notify("~g~Вы обновили свою ставку");
          auctionEntity.update({
            sum: bet
          }, {where: {
            user: user.getId(player)
          }})
        } else {
          player.notify("~g~Вы сделали ставку");
          auctionEntity.create({
            sum: bet,
            user: user.getId(player)
          })
        }
        betList.set(user.getId(player), bet);
        if(timeleft < 60 * 5 && auctionSettings.canaddtime){
          auctionSettings.endminute+=5;
          if(auctionSettings.endminute > 59){
            auctionSettings.endminute = auctionSettings.endminute - 59;
            auctionSettings.endhour++;
            if(auctionSettings.endhour > 23){
              auctionSettings.endhour = auctionSettings.endhour - 23;
              auctionSettings.endday++;
            }
          }
        } 
        saveConfig();


        if(currentMaxBetUser != user.getId(player)){
          let target = user.getPlayerById(currentMaxBetUser);
          if(target) target.notify("~r~Вашу ставку перебили")
        }
        currentMaxBet = bet;
        currentMaxBetUser = user.getId(player);
        m.close();
      })
    }
  })

  if(currentMaxBet > 0){ 
    m.newItem({
      name: "Лот",
      more: auctionSettings.lot
    })
    m.newItem({
      name: "Активная",
      desc: "Текущая максимальная ставка",
      more: `ID: ${currentMaxBetUser} | ${currentMaxBet}$`
    })
  }
  if(endtext){
    m.newItem({
      name: "До конца аукциона",
      more: endtext
    })
  }
  if(user.isAdminNow(player, 6)){
    m.newItem({
      name: "Очистить ставки",
      onpress: () => {
        user.accept(player, "Вы уверены?").then(status => {
          if(!status) return;
          auctionEntity.destroy({where: {id: {[Op.gte]: 0}}}).then(() => {
            betList = new Map();
            currentMaxBet = 0;
            currentMaxBetUser = 0;
            player.notify("~g~Успешно")
          })
        })
      }
    })
    m.newItem({
      name: auctionSettings.enable ? "Выключить приём ставок" : "Включить приём ставок",
      onpress: () => {
        user.accept(player, "Вы уверены?").then(status => {
          if(!status) return;
          auctionSettings.enable = !auctionSettings.enable;
          player.notify("~g~Успешно")
          saveConfig();
        })
      }
    })
    m.newItem({
      name: !auctionSettings.canaddtime ? "Включить автопродление" : "Выключить автопродление",
      desc: "При ставке за 5 минут до конца - время продлится",
      onpress: () => {
        user.accept(player, "Вы уверены?").then(status => {
          if(!status) return;
          auctionSettings.canaddtime = !auctionSettings.canaddtime;
          player.notify("~g~Успешно")
          saveConfig();
        })
      }
    })
    m.newItem({
      name: "Финальный день аукциона",
      type: "range",
      rangeselect: [1,30],
      listSelected: auctionSettings.endday-1,
      onchange: (value) => {
        auctionSettings.endday = value+1;

        saveConfig();
      }
    })
    m.newItem({
      name: "Финальный час аукциона",
      type: "range",
      rangeselect: [0,23],
      listSelected: auctionSettings.endhour,
      onchange: (value) => {
        auctionSettings.endhour = value;
        saveConfig();
      }
    })
    m.newItem({
      name: "Финальная минута аукциона",
      type: "range",
      rangeselect: [0,59],
      listSelected: auctionSettings.endminute,
      onchange: (value) => {
        auctionSettings.endminute = value;
        saveConfig();
      }
    })
    m.newItem({
      name: "Сменить название лота",
      onpress: () => {
        menu.input(player, "Введите название", auctionSettings.lot, 50).then(st => {
          if(!st) return;
          auctionSettings.lot = st;
          saveConfig();
        })
      }
    })
  }

  m.open()
}, 4)

setInterval(() => {
  let target = user.getPlayerById(currentMaxBetUser);
  if(target){
    if(user.getCashMoney(target) < currentMaxBet){
      auctionEntity.destroy({
        where: {
          user: currentMaxBetUser
        }
      }).then(() => {
        target.notify("~r~Ваша ставка была удалена в связи с тем что у вас нет наличных средств указанных в ставке");
        return loadAuction();
      })
    }
  } else if(currentMaxBetUser != 0){
    userEntity.findOne({
      where: {
        id: currentMaxBetUser
      }
    }).then(usr => {
      if(!usr){
        auctionEntity.destroy({
          where: {
            user: currentMaxBetUser
          }
        }).then(() => {
          loadAuction();
        })
      } else {
        if(usr.money < currentMaxBet){
          auctionEntity.destroy({
            where: {
              user: currentMaxBetUser
            }
          }).then(() => {
            loadAuction();
          })
        }
      }
    })
  }
}, 60000)


export const loadAuction = () => {

  auctionEntity.findAll().then(res => {
    betList = new Map();
    currentMaxBet = 0;
    currentMaxBetUser = 0;
    res.forEach((item) => {
      betList.set(item.user, item.sum);
      if (item.sum > currentMaxBet) currentMaxBet = item.sum, currentMaxBetUser = item.user;
    })
  })

  auctionSettingsEntity.findOne().then(res => {
    if (!res) return auctionSettingsEntity.create({
      data: JSON.stringify(auctionSettings)
    })
    auctionSettings = JSON.parse(res.data);
  })
}