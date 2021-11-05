import { chat } from './chat';
import { user } from './user';
import UIMenu from './modules/menu';
import {Container} from './modules/data';
import { business } from './business';
import { dispatcher } from './managers/dispatcher';
import { methods } from './modules/methods';

/*
TODO анимки для телефона
cellphone@female cellphone_call_listen_base

local inAnim = "cellphone_text_in"
local outAnim = "cellphone_text_out"
local callAnim = "cellphone_call_listen_base"
*/
let phoneBrowser:string;
mp.events.add('web:browsers:urls', (q) => {
  let url = q[2]
  phoneBrowser = url;
  phone.browser = mp.browsers.new(phoneBrowser)
});
mp.events.add('phone:hide', () => {
  phone.phoneShowSet(false)
});

let phone = {
  phoneShow: false,
  phoneShowSet: (status:boolean) => {
    phone.phoneShow = status;
  },
  misterk1: () => {},
  misterk2: () => {},
  updateRadioVolume: () => {
    mp.events.triggerBrowser('radio:volume', user.audioRadioVolume)
  },
  browser: <BrowserMp>null,
  ingameBrowser: <BrowserMp>null,
  isPhoneOpen: () => {return phone.phoneShow},
  showBrowser: () => {
    phone.ingameBrowser = mp.browsers.new(`https://rp.gta-5.ru/browser`);
    // mp.browsers.new(
    //   `https://appi-rp.com/browser?login=${escape(user.get('rp_name'))}&password=${user.get(
    //     'password'
    //   )}&server=m83/`
    // );
    // mp.console.logInfo(`https://appi-rp.com/browser?login=${escape(user.get('rp_name'))}&password=${user.get(
    //   'password'
    // )}&server=m83`)
    mp.gui.chat.show(false);
    mp.gui.cursor.show(true, true);
    user.saveAccount();
    mp.console.logInfo("ENABLE Phone Site browser")
  },
  
  showFaqBrowser: () => {
    if (phone.ingameBrowser) {
      phone.ingameBrowser.destroy();
    }
  
    setTimeout(() => {
      phone.ingameBrowser = mp.browsers.new(`https://rp.gta-5.ru/faq?ingame`);
      mp.gui.chat.activate(false);
      mp.gui.cursor.show(true, true);
      mp.game.graphics.transitionToBlurred(1);
      user.saveAccount();
    }, 500);
  },
  
  destroyBrowser: () => {
    phone.ingameBrowser.destroy();
    mp.gui.chat.show(true);
    mp.gui.cursor.show(false, false);
    mp.game.graphics.transitionFromBlurred(1);
    setTimeout(() => {
      phone.ingameBrowser = null;
    }, 500);
  },
  
  enableRadio: () => {
    mp.events.triggerBrowser('radio:enable', true)
  },
  
  disableRadio: () => {
    mp.events.triggerBrowser('radio:enable', false)
  },

  transferBank: async () => {
    let prefix = <number>await <Promise<any>>UIMenu.Menu.GetUserInput('Префикс карты', '', 4);
    let number = <number>await <Promise<any>>UIMenu.Menu.GetUserInput('Номер карты', '', 10);
    let sum = <number>await <Promise<any>>UIMenu.Menu.GetUserInput('Введите сумму', '', 10);
    sum = methods.parseInt(sum);
    number = methods.parseInt(number);
    prefix = methods.parseInt(prefix);
    if (number < 10000) {
      mp.game.ui.notifications.show('~r~Должно быть больше 5 цифр');
      return;
    }
    if (prefix < 1 || sum < 1) {
      mp.game.ui.notifications.show('~r~Неверное значение');
      return;
    }
    if (sum > user.get('money_bank')) {
      mp.game.ui.notifications.show('~r~У вас недостаточно денег на счету');
      return;
    }
  
    user.set('money_bank', user.get('money_bank') - sum);
    mp.events.callRemote('server:bank:transferMoney', prefix, number, sum);
    //user.stopScenario();
  },
  
  // payTaxByNumber: async () => {
  //   let score = await UIMenu.Menu.GetUserInput("Счёт", "", 10);
  //   let num = await UIMenu.Menu.GetUserInput(Lang.GetTextToPlayer("_lang_1"), "", 8);
  //   if (num > user.getBankMoney())
  //   {
  //       mp.game.ui.notifications.show("~r~У вас на счёте недостаточно денег");
  //       return;
  //   }
  //   //mp.events.callRemote("server:phone:PayTax", 1, num, score);
  //   //user.stopScenario();
  // },
  
  showBankMenu: async () => {
    mp.events.call(
      'client:phone:showBankMenu',
      `$${methods.numberFormat(user.getBankMoney())}`,
      `${user.get('bank_prefix')}-${user.get('bank_number')}`
    );
  },

  arcadiusMenu: async () => {
    if (user.get('business_id') > 0) {
      let money = await business.getMoney(user.get('business_id'));
      mp.game.ui.notifications.showWithPicture(
        'Ваш счёт',
        'Arcadius',
        'На вашем счету: ' + money,
        'CHAR_SOCIAL_CLUB',
        1
      );
    } else {
      mp.game.ui.notifications.showWithPicture(
        'Ошибка',
        'Arcadius',
        'Аккаунт не найден в системе',
        'CHAR_SOCIAL_CLUB',
        1
      );
    }
  },
  
  call911: async (type: number) => {
    try {
      let text = await UIMenu.Menu.GetUserInput('Текст...', '', 50);
      text = methods.filter(text);
      if (text == '') return;
      mp.game.ui.notifications.show('~b~Сообщение было отправлено');
      if (type == 1)
        dispatcher.callFraction('[PD] ' + user.get('phone_code') + '-' + user.get('phone'), text, [2, 7]);
      else if (type == 2)
        dispatcher.callFraction('[EMS] ' + user.get('phone_code') + '-' + user.get('phone'), text, [16]);
      else if (type == 3)
        dispatcher.callFraction('[FD] ' + user.get('phone_code') + '-' + user.get('phone'), text, [3]);
      //user.stopScenario();
    } catch (e) {
      methods.debug(e);
    }
  },
  
  // misterk1: () => {
  //   if (weather.getHour() < 22 && weather.getHour() > 4)
  //   {
  //       mp.game.ui.notifications.showWithPicture("Набери мне с 22 до 4 утра", "Мистер К", "Дело", "CHAR_HUMANDEFAULT", 1);
  //       return;
  //   }

  //   if (User.TimerAbduction > -1)
  //   {
  //       mp.game.ui.notifications.showWithPicture("Сказал же, жди координат!", "Мистер К", "Дело", "CHAR_HUMANDEFAULT", 1);
  //       return;
  //   }

  //   User.TimerAbduction = 10;
  //   mp.game.ui.notifications.showWithPicture("Скоро скину координаты", "Мистер К", "Дело", "CHAR_HUMANDEFAULT", 1);
  //   chat.sendMeCommand("Через 30 реальных минут произойдет сделка");

  //   methods.notifyWithPictureToFraction("Скоро произойдет сделка по продаже человека, за работу", "Диспетчер", "Похищение", "CHAR_CALL911", 1, 3);
  //   //user.stopScenario();
  // },

  // misterk2: async () => {
  //   let id = await UIMenu.Menu.GetUserInput("ID игрока", "", 6);
  //   if (id == "") return;
  //   if (Container.HasLocally(mp.players.local.remoteId, "misterTimeout"))
  //   {
  //       mp.game.ui.notifications.show("~r~Нельзя использовать так часто");
  //       return;
  //   }

  //   Container.SetLocally(mp.players.local.remoteId, "misterTimeout", true);

  //   // Shared.TriggerEventToAllPlayers("ARP:MisterK:ResetWanted", Convert.ToInt32(id), user.get("id")); Заглушечка
  //   //user.stopScenario();

  //   await Delay(240000);

  //   Container.ResetLocally(mp.players.local.remoteId, "misterTimeout");
  // },

  invaderLoto: async () => {
    try {
      if (user.get('money_bank') < 100) {
        mp.game.ui.notifications.show('~r~У Вас недостаточно денег в банке');
        return;
      }
  
      if (await Container.Has(mp.players.local.remoteId, 'lotoNumber')) {
        mp.game.ui.notifications.show('~r~Лотерейный билетик может быть только 1');
        return;
      }
  
      let number = <number>await <Promise<any>>UIMenu.Menu.GetUserInput('Введите число', '', 2);
  
      if (number < 0 || number > 99) {
        mp.game.ui.notifications.show('~r~Число должно быть от 0 до 99');
        return;
      }
  
      Container.Set(mp.players.local.remoteId, 'lotoNumber', number);
      mp.game.ui.notifications.show('~g~Вы купили билет с числом ' + number);
      //user.stopScenario();
    } catch (e) {
      methods.debug(e);
    }
  },

  getTaxi: (type: number) => {
    if (mp.players.local.dimension != 0) {
      mp.game.ui.notifications.show('~g~В интерьерах запрещено вызывать такси');
      return;
    }
  
    if (mp.game.invoke(methods.IS_WAYPOINT_ACTIVE)) {
      let typePrice = 20;
      let markerPos = methods.getWaypointPosition();
      let distance = methods.distanceToPos(mp.players.local.position, markerPos);
  
      switch (type) {
        case 1:
          typePrice = 16;
          break;
        case 2:
          typePrice = 13;
          break;
        case 3:
          typePrice = 7;
          break;
        case 4:
          typePrice = 5;
          break;
      }
  
      let price = methods.parseInt(distance / typePrice);
      if (price > 2000) price = 2000;
  
      if (user.getLevel() == 1) {
        mp.game.ui.notifications.show('~g~Акция для новичков');
        mp.game.ui.notifications.show('~g~Ваша поездка будет бесплатной');
      } else {
        if (user.getCashMoney() < price) {
          mp.game.ui.notifications.show('~r~У Вас недостаточно денег на руках');
          return;
        }
        mp.game.ui.notifications.show(`~b~Вы вызвали такси`);
        mp.game.ui.notifications.show(
          `~b~Итоговая стоимость поездки: ~s~$${methods.numberFormat(price)}`
        );
      }
  
      user.setData('taxiPosX', markerPos.x);
      user.setData('taxiPosY', markerPos.y);
      mp.events.callRemote('server:user:getTaxi', type, price);
    } else {
      mp.game.ui.notifications.show('~y~Ошибка оформления заказа');
      mp.game.ui.notifications.show('~y~Установите маркер на карте, куда вам необходимо поехать');
    }
  },
  
  invaderAd: async (idx: number) => {
    try {
      if (user.get('money_bank') < 100) {
        mp.game.ui.notifications.show('~r~У Вас недостаточно денег в банке');
        return;
      }
  
      if (Container.HasLocally(mp.players.local.remoteId, 'isAdTimeout')) {
        mp.game.ui.notifications.show('~r~Таймаут 5 минуты');
        return;
      }
  
      let text = await UIMenu.Menu.GetUserInput('Текст...', '', 150);
      if (text == '') return;
  
      let type = 'Разное';
      switch (idx) {
        case 0:
          type = 'Покупка';
          break;
        case 1:
          type = 'Продажа';
          break;
      }
  
      mp.game.ui.notifications.show('~b~Сообщение было отправлено');
  
      user.removeBankMoney(100);
      business.addMoney(92, 100);
  
      text = methods.removeQuotes(text);
      mp.events.callRemote(
        'server:phone:AddAd',
        text,
        user.get('rp_name'),
        `${user.get('phone_code')}-${user.get('phone')}`,
        type
      );
  
      text = text.length > 49 ? text.slice(0, 50) + '...' : text;
  
      methods.notifyWithPictureToAll(
        `${user.get('phone_code')}-${user.get('phone')} (${user.get('id')})`,
        '~g~Реклама',
        text,
        'CHAR_LIFEINVADER',
        1
      );
  
      //Main.SaveLog("AD", $"{user.get("rp_name")} ({user.get("id")}) - {text}");
  
      Container.SetLocally(mp.players.local.remoteId, 'isAdTimeout', true);
  
      setTimeout(function() {
        Container.ResetLocally(mp.players.local.remoteId, 'isAdTimeout');
        //user.stopScenario();
      }, 300000);
    } catch (e) {
      methods.debug(e);
    }
  },

  newCont: async () => {
    methods.debug('Execute: phone.newCont');
    try {
      let title = await UIMenu.Menu.GetUserInput('Заголовок', '', 50);
      if (title == '') return;
      let num = await UIMenu.Menu.GetUserInput('Номер', '', 15);
      if (num == '') return;
      let myPhone = `${user.get('phone_code')}-${user.get('phone')}`;
      mp.events.callRemote(
        'server:phone:AddContact',
        myPhone,
        methods.removeQuotes(title),
        methods.removeQuotes(num)
      );
      //user.stopScenario();
    } catch (e) {
      methods.debug('Exception: phone.newCont');
      methods.debug(e);
    }
  },
  
  newSms: async () => {
    try {
      let number = await UIMenu.Menu.GetUserInput('Введите номер телефона', '', 15);
      let text = await UIMenu.Menu.GetUserInput('Текст', '', 300);
      if (text == '') return;
      chat.sendMeCommand('достал телефон и отправил смс');
      mp.events.callRemote(
        'server:phone:SendSms',
        methods.removeQuotes(number),
        methods.removeQuotes(text)
      );
      //user.stopScenario();
    } catch (e) {
      methods.debug(e);
    }
  },
  
  newSmsWithNumber: async (number: string) => {
    try {
      let text = await UIMenu.Menu.GetUserInput('Текст', '', 300);
      if (text == '') return;
      chat.sendMeCommand('достал телефон и отправил смс');
      mp.events.callRemote(
        'server:phone:SendSms',
        methods.removeQuotes(number),
        methods.removeQuotes(text)
      );
      //user.stopScenario();
    } catch (e) {
      methods.debug(e);
    }
  },

  callWithNumber: async (number: string) => {
    mp.events.callRemote(
      'server:phone:call',
      methods.removeQuotes(number)
    );
  },

  cancelCall: async () => {
    mp.events.callRemote(
      'server:phone:cancelCall'
    );
  },

  readSms: (text: string) => {
    //UI.ShowToolTip(text); Заглушечка
    //chat.sendMeCommand("читает смс");
  
    text = text.replace('~b~', '!{03A9F4}').replace('!{FFFFFF}', '');
    let smsItem = text.split('\n');
    mp.gui.chat.push(`${escape(smsItem[0])}`);
    mp.gui.chat.push(`${escape(smsItem[1])}`);
  },
  
  delSms: (id: number) => {
    mp.events.callRemote('server:phone:DeleteSms', id);
    phone.showSmsList();
  },
  
  delCont: (id: number) => {
    mp.events.callRemote('server:phone:DeleteContact', id);
    phone.showContList();
  },
  
  renCont: async (id: number) => {
    let text = await UIMenu.Menu.GetUserInput('Имя', '', 50);
    if (text == '') return;
    mp.events.callRemote('server:phone:RenameContact', id, methods.removeQuotes(text));
    phone.showContList();
  },
  
  smsInfo: (id: number) => {
    mp.events.callRemote('server:phone:OpenSmsInfoMenu', id);
  },
  
  contInfo: (id: number) => {
    mp.events.callRemote('server:phone:OpenContInfoMenu', id);
  },
  
  showSmsList: () => {
    mp.events.callRemote(
      'server:phone:OpenSmsListMenu',
      user.get('phone_code') + '-' + user.get('phone')
    );
  },
  
  showContList: () => {
    mp.events.callRemote(
      'server:phone:OpenContactListMenu',
      user.get('phone_code') + '-' + user.get('phone')
    );
  },

  addNewSms: (numberFrom: string, text: string) => {
    // if (GetNetwork() < 1) return; :whaat:
    text = text.length > 49 ? text.slice(0, 50) + '...' : text;
    mp.game.ui.notifications.showWithPicture(numberFrom, 'Входящее СМС', text, 'CHAR_ARTHUR', 1);
  },

};

mp.game.streaming.requestAnimDict("cellphone@")
mp.game.streaming.requestAnimDict("cellphone@in_car@ds")

mp.events.addDataHandler('call', (entity, status) => {
  if(status){
    let dict = "cellphone@"
    if(entity.vehicle) dict+="in_car@ds";
    entity.taskPlayAnim(
      dict,
      'cellphone_call_listen_base',
      4.0,
      -1,
      -1,
      50,
      0,
      false,
      false,
      false
    );
  }
});

setInterval(() => {
  if(!mp.players.local.getVariable('call')) return;
  let dict = "cellphone@"
  if(mp.players.local.vehicle) dict+="in_car@ds";
  if(!mp.players.local.isPlayingAnim(dict, 'cellphone_call_listen_base', 3)){
    mp.players.local.taskPlayAnim(
      dict,
      'cellphone_call_listen_base',
      4.0,
      -1,
      -1,
      50,
      0,
      false,
      false,
      false
    );
  }
}, 5000)

mp.events.add('entityStreamIn', (entity:PlayerMp) => {
  if(entity.type != 'player') return;
  if(!entity.getVariable('call')) return;
  let dict = "cellphone@"
    if(entity.vehicle) dict+="in_car@ds";
    entity.taskPlayAnim(
      dict,
      'cellphone_call_listen_base',
      4.0,
      -1,
      -1,
      50,
      0,
      false,
      false,
      false
    );
});

export { phone };
