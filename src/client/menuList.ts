import { Container } from './modules/data';
import UIMenu from './modules/menu';
import { methods } from './modules/methods';
import { timer } from './modules/timer';
import { weather } from './managers/weather';
import { dispatcher } from './managers/dispatcher';
import { jail } from './managers/jail';
import { ui } from './modules/ui';
import { user } from './user';
import { inventory } from './inventory';
import { enums } from './enums';
import { items_old } from './items_old';
let items = items_old;
import { houses } from './houses';
import { stock } from './stock';
import { chat } from './chat';
import { business } from './business';
import { condo } from './condo';
import { coffer } from './coffer';
import { vehicles } from './vehicles';
//import voice from './voice';
//import clothes from './cloth';
import { builder } from './jobs/builder';
import { weapons } from './weapons';
import { cleaner } from './jobs/cleaner';
import { roadWorker } from './jobs/roadWorker';
import { mainer } from './jobs/mainer';
import { licenseCenter } from './business/licenseCenter';
import { bugstars } from './jobs/bugstars';
import { sunBleach } from './jobs/sunBleach';
import { waterPower } from './jobs/waterPower';
import { gardener } from './jobs/gardener';
import { photo } from './jobs/photo';
import { bus } from './jobs/bus';
import { mail } from './jobs/mail';
import { cloth } from './business/cloth';

import { burgershot } from './jobs/burgetshot';
import { gr6 } from './jobs/gr6';
import { taxi } from './jobs/taxi';
import { trucker } from './jobs/trucker';
import { phone } from './phone';
import { noClipSwitch } from './fly';
import { chests } from './modules/chests';
import { businessNalog, weaponCost, PillBoxCost, itemCosts } from '../util/sharedData';
import { inGreenZone } from './modules/savezone';
import { levelAccess } from '../util/level';
import { gui } from './modules/gui';
import { restartVoice } from './ragevoice';
import { healProtection } from './modules/ach';
import { WEAPON_LEVEL_MIN } from '../util/weapons';
import { clothItem, propItem, getItemNameById } from '../util/inventory';
import { MenuItemClient, MenuClass } from './managers/menu';
import { walkstylesList } from '../util/walkstyles';
import { shopList, shopListElectro } from '../util/shop';

let passProtect = 0;
let passProtectMax = 5;

let healCd = false

setInterval(() => {
  if (passProtect > 0) passProtect--;
}, 10000)

let walkieState = false;

mp.events.add('setTag', (tag: string) => {
  tag = methods.removeQuotes(tag);
  if (tag == '') mp.game.ui.notifications.show(`~y~Вы удалили тег`);
  else mp.game.ui.notifications.show(`~y~Вы установили тег - ~s~${tag}`);
  user.set('tag', tag);
  user.setData('tag', tag);
  user.saveAccount();
  mp.events.callSocket('tablet:openfraction')
})


mp.events.add('showVehicleAutopilotMenu', () => menuList.showVehicleAutopilotMenu())
mp.events.add('showVehicleDoMenu', () => menuList.showVehicleDoMenu())


let skin: { [name: string]: any } = {};
let test = false;
mp.events.add("server:test", () => {
  test = true;
})
mp.events.add("report", () => {
  report()
})
async function report() {
  if (reportWait) return mp.game.ui.notifications.show('~r~Подождите 60 секунд');
  let text = await UIMenu.Menu.GetUserInput('Опишите жалобу', '', 300);
  if (text != '') {
    mp.events.callRemote('server:sendReport', text);
    reportWait = true;
    setTimeout(() => {
      reportWait = false
    }, 60000)
  }
}

mp.events.add("godmode:switch", () => {
  mp.players.local.setInvincible(!user.godmode)
  user.godmode = !user.godmode;
  mp.game.ui.notifications.show("GodMode " + user.godmode ? "~g~Включен" : "~r~Выключен");
})

//mp.events.add("playerExitColshape", () => UIMenu.Menu.HideMenu());

let reportWait = false;
let helperWait = false;

mp.events.add('client:user:openCustomization', (x, y, z, rot, cacheData) => {
  try {
    user.updateCharacterFace();
    user.updateCharacterCloth();
    let cam = mp.cameras.new(
      'customization',
      new mp.Vector3(8.243752, 527.4373, 171.6173),
      new mp.Vector3(0, 0, 0),
      20
    );
    cam.pointAtCoord(9.66692, 528.34783, 171.2);
    cam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, false, false);
    //menuList.showCharacterCustomMenu(x, y, z, rot, cam, cacheData);

    setTimeout(function () {
      user.hideLoadDisplay();
    }, 1000);
  } catch (e) {
    methods.debug('openCustomization', e);
  }
});


let updateSex = function (idx?: number) {
  if (idx != undefined) user.setPlayerModel(idx == 0 ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
  else user.setPlayerModel(user.getSex() == 0 ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
  setTimeout(function () {
    user.updateCharacterFace(true);
  }, 100);
  //user.updateCache().then();
};


let menuList = {
  customIsShow: false,
  customX: 0,
  customY: 0,
  customZ: 0,
  customRot: 0,
  customCam: <CameraMp>null,
  customData: new Map(),

  showCondoBuyMenu: async function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Адрес: ~s~${h.get('address')} ${h.get('id')}`
    );

    let buyHouseItem = menu.AddMenuItem(
      `Купить квартиру за ~g~$${methods.numberFormat(h.get('price'))}`
    );
    let enterHouseItem = menu.AddMenuItem('~g~Осмотреть квартиру');

    if (user.get('job') == 'mail' || user.get('job') == 'mail2') {
      if (!(await Container.Has(h.get('id'), 'isMail2')))
        menu.AddMenuItem('~g~Положить почту').doName = h.get('id');
      else menu.AddMenuItem('~o~Дом уже обслуживался');
    }

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item == enterHouseItem) {
        condo.enter(h.get('id'), h.get('int_x'), h.get('int_y'), h.get('int_z'));
      } else if (item == buyHouseItem) {
        condo.buy(h.get('id'));
      }

      if (item.doName) mail.sendMail2(parseInt(item.doName));
    });
  },

  showCondoInMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Адрес: ~s~${h.get('address')} ${h.get('id')}`
    );

    let setPinItem: MenuItemClient = null;
    let resetPinItem: MenuItemClient = null;
    if (h.get('id_user') == user.getCacheData().get('id') && h.get('pin') > 0)
      setPinItem = menu.AddMenuItem('~y~Сменить пинкод');

    let exitHouseItem = menu.AddMenuItem('~g~Выйти из квартиры');
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == exitHouseItem) {
        condo.exit(h.get('x'), h.get('y'), h.get('z'));
      }
      if (item == setPinItem) {
        let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Пароль', '', 5));
        if (pass < 1) {
          mp.game.ui.notifications.show('~r~Пароль должен быть больше нуля');
          return false;
        }
        mp.game.ui.notifications.show('~g~Ваш новый пароль: ~s~' + pass);
        condo.updatePin(h.get('id'), pass);
      }
      if (item == resetPinItem) {
        mp.game.ui.notifications.show('~g~Пароль сброшен');
        condo.updatePin(h.get('id'), 0);
      }
    });
  },

  showCondoOutMenu: async function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      ``,
      `~b~Адрес: ~s~${h.get('address')} ${h.get('id')}`, false, false, false, 'house', 'house'
    );
    let infoItem = menu.AddMenuItem(`~b~Владелец:~s~ ${h.get('name_user')}`);
    let enterHouseItem = menu.AddMenuItem('~g~Войти');

    if (user.get('job') == 'mail' || user.get('job') == 'mail2') {
      if (!(await Container.Has(h.get('id'), 'isMail2')))
        menu.AddMenuItem('~g~Положить почту').doName = h.get('id');
      else menu.AddMenuItem('~o~Дом уже обслуживался');
    }

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == enterHouseItem) {
        if (h.get('pin') > 0 && user.get('id') != h.get('id_user')) {
          if (passProtect >= passProtectMax) return user.notify("~r~Подождите перед вводом пароля");
          passProtect++;
          let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Введите пинкод', '', 10, 'password'));
          if (pass == h.get('pin'))
            condo.enter(h.get('id'), h.get('int_x'), h.get('int_y'), h.get('int_z'));
          else mp.game.ui.notifications.show('~r~Вы ввели не правильный пинкод');
        } else condo.enter(h.get('id'), h.get('int_x'), h.get('int_y'), h.get('int_z'));
      }

      if (item.doName) mail.sendMail2(parseInt(item.doName));
    });
  },

  showStockBuyMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Адрес: ~s~${h.get('address')} ${h.get('id')}`
    );

    let buyHouseItem = menu.AddMenuItem(
      `Купить склад за ~g~$${methods.numberFormat(h.get('price'))}`
    );
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item == buyHouseItem) {
        stock.buy(h.get('id'));
      }
    });
  },

  showStockOutMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Адрес: ~s~${h.get('address')} ${h.get('id')}`
    );
    let infoItem = menu.AddMenuItem(`~b~Владелец:~s~ ${h.get('user_name')}`);
    let enterHouseItem = menu.AddMenuItem('~g~Войти');
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == enterHouseItem) {
        if (user.get('id') != h.get('user_id')) {
          if (passProtect >= passProtectMax) return user.notify("~r~Подождите перед вводом пароля");
          passProtect++;
          let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Введите пинкод', '', 10, 'password'));
          if (pass == h.get('pin1')) stock.enter(h.get('id'));
          else {
            stock.addLog(user.get('rp_name'), `Ввёл не правильно пинкод (${pass})`, h.get('id'));
            mp.game.ui.notifications.show('~r~Вы ввели не правильный пинкод');
          }
        } else stock.enter(h.get('id'));
      }
    });
  },

  showStockInMenu: function (h: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      `№${h.get('id')}`,
      `~b~Адрес: ~s~${h.get('address')} ${h.get('id')}`
    );

    let exitHouseItem = menu.AddMenuItem('~g~Выйти');
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == exitHouseItem) {
        stock.exit(h.get('x'), h.get('y'), h.get('z'));
      }
    });
  },

  showApartmentListMenu: function (countFloor: number, buildId: number) {
    //TODO TELEPORT BLACKOUT

    let menu = UIMenu.Menu.Create(``, `~b~Меню апартаментов`, false, false, false, 'house', 'house');

    let exitItem = null;
    if (mp.players.local.dimension != 0) exitItem = menu.AddMenuItem(`~g~Улица`);

    for (let i = 1; i <= countFloor; i++) menu.AddMenuItem(`Этаж №${i}`).floor = i;

    if (buildId == 32) {
      let roofItem = menu.AddMenuItem(`~g~Крыша`);
      roofItem.x = 387.8792;
      roofItem.y = -60.072224;
      roofItem.z = 121.5355;
    }

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (index == 0 && mp.players.local.dimension != 0) {
        mp.events.callRemote('server:apartments:exit', buildId);
        return;
      } else if (item.x) {
        user.teleport(item.x, item.y, item.z);
        user.setVirtualWorld(0);
        return;
      }
      mp.events.callRemote('server:events:floorList', item.floor, buildId);
    });
  },

  showApartmentInfoMenu: function (data: Map<any, any>) {
    let menu = UIMenu.Menu.Create(
      ``,
      `~b~Владелец: ~s~${data.get('user_id') == 0 ? 'Государство' : data.get('user_name')}`, false, false, false, 'house', 'house'
    );

    let exitItem = menu.AddMenuItem(`~g~Выйти`);
    let buyItem: MenuItemClient = null;

    if (data.get('user_id') == 0)
      buyItem = menu.AddMenuItem(
        `~g~Купить`,
        `Цена: ~g~$${methods.numberFormat(data.get('price'))}`
      );

    if (data.get('pin') != 0 && data.get('user_id') == user.get('id'))
      menu.AddMenuItem(`~y~Сменить пинкод`).doName = 'changePin';

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item == exitItem)
        mp.events.callRemote('server:events:showApartmentListMenu', data.get('build_id'));
      else if (item == buyItem) mp.events.callRemote('server:apartments:buy', data.get('id'));
      else if (item.doName == 'changePin') {
        let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Пинкод', '', 5));
        if (pass == 0) {
          mp.game.ui.notifications.show('~r~Можно ставить только цифры');
          return;
        }
        mp.game.ui.notifications.show('~g~Ваш новый пинкод: ~s~' + pass);
        mp.events.callRemote('server:apartments:updatePin', data.get('id'), pass);
      } else if (item.doName == 'resetPin') {
        mp.game.ui.notifications.show('~g~Пароль сброшен');
        mp.events.callRemote('server:apartments:updatePin', data.get('id'), 0);
      }
    });
  },

  showApartmentFloorListMenu: function (data: [number, string][]) {
    let menu = UIMenu.Menu.Create(``, `~b~Список апартаментов`, false, false, false, 'house', 'house');

    data.forEach(function (item, i, arr) {
      let ownerName = item[1] == '' ? 'Государство' : item[1];
      menu.AddMenuItem(`Апартаменты №${item[0]}`, `~b~Владелец: ~s~${ownerName}`).apartId =
        item[0];
    });
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;

      let pin = methods.parseInt(
        await Container.Get(-100000 + methods.parseInt(item.apartId), 'pin')
      );

      // !todo -> if (pin != 0 && item[1] != '') {
      if (pin != 0) {
        if (passProtect >= passProtectMax) return user.notify("~r~Подождите перед вводом пароля");
        passProtect++;
        let pass = methods.parseInt(await UIMenu.Menu.GetUserInput('Введите пинкод', '', 10, 'password'));
        if (pass == pin)
          mp.events.callRemote('server:apartments:enter', methods.parseInt(item.apartId));
        else {
          mp.game.ui.notifications.show('~r~Вы ввели не правильный пинкод');
        }
      } else mp.events.callRemote('server:apartments:enter', methods.parseInt(item.apartId));
    });
  },




  showVehicleMenu: async function (data: Map<string, any>) {
    if (!mp.players.local.vehicle) return;
    let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);

    let ownerName = 'Государство';
    if (data.get('id_user') > 0) ownerName = data.get('user_name');
    if (data.get('fraction_id') > 0) ownerName = methods.getFractionName(data.get('fraction_id'));
    // !todo -> if (data.has('job') > 0) ownerName = methods.getCompanyName(data.get('job'));
    if (data.get('job') > 0) ownerName = methods.getCompanyName(data.get('job'));

    let menu = UIMenu.Menu.Create(`Транспорт`, `~b~Владелец: ~s~${ownerName}`);

    if (data.get('job') != 'bgstar' && data.get('job') != 'sunb' && data.get('job') != 'water') {
      switch (user.get('job')) {
        case 'trucker1':
          if (vInfo.class_name == 'Vans') {
            menu.AddMenuItem('~g~Список заказов').doName = 'trucker:getList';
            menu.AddMenuItem('~b~Частота рации:~s~ ').SetRightLabel('266.001');
            if (trucker.isProcess())
              menu.AddMenuItem('~r~Завершить досрочно рейс', 'Штраф ~r~$500').doName =
                'trucker:stop';
          }
          break;
        case 'trucker2':
          if (
            vInfo.display_name == 'Benson' ||
            vInfo.display_name == 'Mule' ||
            vInfo.display_name == 'Mule2' ||
            vInfo.display_name == 'Mule3' ||
            vInfo.display_name == 'Pounder'
          ) {
            menu.AddMenuItem('~g~Список заказов').doName = 'trucker:getList';
            menu.AddMenuItem('~b~Частота рации:~s~ ').SetRightLabel('266.002');
            if (trucker.isProcess())
              menu.AddMenuItem('~r~Завершить досрочно рейс', 'Штраф ~r~$500').doName =
                'trucker:stop';
          }
          break;
        case 'trucker3':
          if (
            vInfo.display_name == 'Hauler' ||
            vInfo.display_name == 'Packer' ||
            vInfo.display_name == 'Phantom'
          ) {
            menu.AddMenuItem('~g~Список заказов').doName = 'trucker:getList';
            menu.AddMenuItem('~b~Частота рации:~s~ ').SetRightLabel('266.003');
            if (trucker.isProcess())
              menu.AddMenuItem('~r~Завершить досрочно рейс', 'Штраф ~r~$500').doName =
                'trucker:stop';
          }
          break;
      }
    }

    if (user.get('job') == data.get('job')) {
      menu.AddMenuItem('~g~Открыть~s~ / ~r~Закрыть~s~').eventName =
        'server:vehicle:lockStatus';
      switch (data.get('job')) {
        case 'bshot':
          menu.AddMenuItem('~g~Получить задание').doName = 'bshot:find';
          menu.AddMenuItem('~g~Взять заказ').doName = 'takeTool';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Данная работа служит для того, чтобы вы привыкли к управлению и динамике сервера, дальше будет интересней.';
          break;
        case 'bgstar':
          menu.AddMenuItem('~g~Получить задание').doName = 'bugstar:find';
          menu.AddMenuItem('~g~Взять инструменты').doName = 'takeTool';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Данная работа служит для того, чтобы вы привыкли к управлению и динамике сервера, дальше будет интересней.';
          break;
        case 'sunb':
          menu.AddMenuItem('~g~Получить задание').doName = 'sunb:find';
          menu.AddMenuItem('~g~Взять инструменты').doName = 'takeTool';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Данная работа служит для того, чтобы вы привыкли к управлению и динамике сервера, дальше будет интересней.';
          break;
        case 'water':
          menu.AddMenuItem('~g~Получить задание').doName = 'water:find';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Данная работа служит для того, чтобы вы привыкли к управлению и динамике сервера, дальше будет интересней.';
          break;
        case 'photo':
          menu.AddMenuItem('~g~Получить задание').doName = 'photo:find';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Получайте и выполняйте задания от начальника';
          break;
        case 'three':
          menu.AddMenuItem('~g~Получить задание').doName = 'three:find';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Получайте и выполняйте задания от начальника';
          break;
        case 'bus1':
          menu.AddMenuItem('~g~Начать рейс').doName = 'bus:start1';
          menu.AddMenuItem('~y~Завершить рейс', 'Завершение рейса досрочно').doName =
            'bus:stop';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Начните рейс и вперед зарабатывать!';
          break;
        case 'bus2':
          menu.AddMenuItem('~g~Начать рейс').doName = 'bus:start2';
          menu.AddMenuItem('~y~Завершить рейс', 'Завершение рейса досрочно').doName =
            'bus:stop';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Начните рейс и вперед зарабатывать!';
          break;
        case 'bus3':
          menu.AddMenuItem('~g~Начать рейс').doName = 'bus:start3';
          menu.AddMenuItem('~y~Завершить рейс', 'Завершение рейса досрочно').doName =
            'bus:stop';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Начните рейс и вперед зарабатывать!';
          break;
        case 'gr6':
          menu.AddMenuItem('~g~Меню инкассатора').doName = 'gr6:menuVeh';
          break;
        case 'mail':
        case 'mail2':
          menu.AddMenuItem('~g~Взять почту из транспорта').doName = 'mail:take';
          menu.AddMenuItem('~b~Справка').sendChatMessage =
            'Возьмите почту из транспорта, далее езжай к любым жилым домам, подходи к дому нажимай E и клади туда почту.';
          break;
        case 'taxi1':
        case 'taxi2':
          menu.AddMenuItem('~g~Диспетчерская таксопарка').doName = 'taxi:dispatch';
          menu.AddMenuItem('~g~Получить задание').doName = 'taxi:start';
          break;
      }
    }

    if (data.get('job') == 'gr6') {
      menu.AddMenuItem('~y~Ограбить транспорт').doName = 'gr6:grab';
    }

 

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      } else if (item.sendChatMessage) mp.gui.chat.push(`${item.sendChatMessage}`);
      else if (item.doName == 'chests:grab') chests.grab();
      else if (item.doName == 'taxi:dispatch') menuList.showDispatchTaxiMenu();
      else if (item.doName == 'mail:take') mail.takeMail();
      else if (item.doName == 'taxi:start') taxi.start();
      else if (item.doName == 'bus:start1') bus.start(1);
      else if (item.doName == 'bus:start2') bus.start(2);
      else if (item.doName == 'bus:start3') bus.start(3);
      else if (item.doName == 'bus:stop') bus.stop();
      else if (item.doName == 'three:find') gardener.start();
      else if (item.doName == 'gr6:grab') gr6.grab();
      else if (item.doName == 'gr6:menuVeh') mp.events.callRemote('gr6:menuVeh');
      else if (item.doName == 'gr6:getHelp') {
        dispatcher.send(`Код 0`, `${user.get('rp_name')} - инкассация требует поддержки`);
        mp.game.ui.notifications.show('~b~Вызов был отправлен');
      } else if (item.doName == 'photo:find') photo.start();
      else if (item.doName == 'bshot:find') burgershot.findHouse();
      else if (item.doName == 'bugstar:find') bugstars.findHouse();
      else if (item.doName == 'sunb:find') sunBleach.findHouse();
      else if (item.doName == 'water:find') waterPower.findHouse();
      else if (item.doName == 'trucker:getList') mp.events.callRemote('server:trucker:showMenu');
      else if (item.doName == 'trucker:stop') trucker.stop();
      else if (item.doName == 'takeTool') user.takeTool();
      else if (item.doName == 'showVehicleAutopilotMenu') menuList.showVehicleAutopilotMenu();
      else if (item.eventName == 'server:vehicle:neonStatus') mp.events.callRemote(item.eventName);
      else if (item.eventName == 'server:vehicle:lockStatus') {
        if (data.get('fraction_id') > 0) {
          if (data.get('fraction_id') == user.get('fraction_id'))
            mp.events.callRemote(item.eventName);
          else mp.game.ui.notifications.show('~r~У Вас нет ключей от транспорта');
        } else mp.events.callRemote(item.eventName);
      } else if (item.eventName == 'server:vehicle:engineStatus') {
        user.engineVehicle();
      } else if (item.doName == 'showVehicleDoMenu') {
        menuList.showVehicleDoMenu();
      } else if (item.eventName == 'server:vehicleFreeze') {
        if (methods.getCurrentSpeed() > 4) {
          mp.game.ui.notifications.show('~r~Скорость должна быть меньше 5 км в час');
          return;
        }
        mp.events.callSocket('server:vehicleFreeze')

        let isFreeze = !mp.players.local.vehicle.getVariable('freezePosition');

        if (isFreeze === true) mp.game.ui.notifications.show('~g~Вы поставили якорь');
        else mp.game.ui.notifications.show('~y~Вы сняли якорь');
      } else if (item.eventName == 'server:vehicle:park') {
        if (!mp.players.local.vehicle) return mp.game.ui.notifications.show('~r~Вы должны быть в транспорте');
        if (mp.players.local.vehicle.getSpeed() > 1) return mp.game.ui.notifications.show('~r~Транспорт не должен быть в движении');
        if (inGreenZone()) return mp.game.ui.notifications.show('~r~Нельзя парковать транспорт в зелёной зоне');
        UIMenu.Menu.HideMenu();
        mp.events.callSocket(item.eventName);
      } else if (item.eventName == 'server:autosalon:unrent') {
        UIMenu.Menu.HideMenu();
        mp.events.callSocket(item.eventName);
      } else if (item.eventName == 'server:vehicle:setNeonColor') {
        UIMenu.Menu.HideMenu();
        mp.game.ui.notifications.show('Введите цвет ~r~R~g~G~b~B');
        let r = <number>await <any>UIMenu.Menu.GetUserInput('R', '', 3);
        let g = <number>await <any>UIMenu.Menu.GetUserInput('G', '', 3);
        let b = <number>await <any>UIMenu.Menu.GetUserInput('B', '', 3);
        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;
        mp.events.callRemote(
          item.eventName,
          methods.parseInt(r),
          methods.parseInt(g),
          methods.parseInt(b)
        );
      } else if (item.eventName) {
        UIMenu.Menu.HideMenu();
        mp.events.callRemote(item.eventName);
      }
    });
  },

  showVehicleAutopilotMenu: function () {
    let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);
    if (vInfo.fuel_min != 0) return;
    let menu = UIMenu.Menu.Create(`Транспорт`, `~b~Меню автопилота`);

    menu.AddMenuItem('~g~Включить').doName = 'enable';
    menu.AddMenuItem('~y~Выключить').doName = 'disable';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      if (item.doName == 'enable') {
        let vInfo = methods.getVehicleInfo(mp.players.local.vehicle.model);
        if (vInfo.fuel_min != 0) return;
        vehicles.enableAutopilot();
      } else if (item.doName == 'disable') {
        vehicles.disableAutopilot();
      }
    });
  },

  showVehicleDoMenu: function () {
    try {
      let menu = UIMenu.Menu.Create(`Транспорт`, `~b~Нажмите Enter чтобы применить`);

      let listEn = ['Выкл', 'Вкл'];

      let actualData = mp.players.local.vehicle.getVariable('vehicleSyncData');

      let listItem = menu.AddMenuItemList(
        'Аварийка',
        listEn,
        'Поворотники включаются на [ и ]'
      );
      listItem.doName = 'twoIndicator';
      listItem.Index =
        actualData.IndicatorRightToggle === true && actualData.IndicatorLeftToggle === true ? 1 : 0;

      listItem = menu.AddMenuItemList('Свет в салоне', listEn, 'Днём очень плохо видно');
      listItem.doName = 'light';
      listItem.Index = actualData.InteriorLight === true ? 1 : 0;

      /*if (methods.getVehicleInfo(mp.players.local.vehicle.model).display_name == 'Taxi') {
              listItem = menu.AddMenuItemList("Свет на шашке", listEn);
              listItem.doName = 'lightTaxi';
              listItem.Index = actualData.TaxiLight === true ? 1 : 0;
          }*/

      let closeItem = menu.AddMenuItem('~r~Закрыть');

      let listIndex = 0;
      menu.ListChange.on((item, index) => {
        listIndex = index;
      });

      menu.ItemSelect.on((item, index) => {
        if (item == closeItem) UIMenu.Menu.HideMenu();

        if (item.doName == 'light') {
          vehicles.setInteriorLightState(listIndex == 1);
        }
        if (item.doName == 'lightTaxi') {
          vehicles.setTaxiLightState(listIndex == 1);
        }
        if (item.doName == 'twoIndicator') {
          vehicles.setIndicatorLeftState(listIndex == 1);
          vehicles.setIndicatorRightState(listIndex == 1);
        }
      });
    } catch (e) {
      methods.debug(e);
    }
  },


  showMainMenu: function () {
    let menu = UIMenu.Menu.Create(`Меню`, `~b~Меню помощи`);

    menu.AddMenuItem('Персонаж').SetIcon('man').doName = 'showPlayerMenu';
    menu.AddMenuItem('Транспорт').SetIcon('hatchback').eventName = 'onKeyPress:2';
    menu.AddMenuItem('Список игроков').SetIcon('teamwork').eventName = 'server:users:list';

    if (user.get('fraction_id2') > 0)
      menu.AddMenuItem('Неоф. Организация').SetIcon('Item_45').doName = 'showFraction2Menu';

    menu.AddMenuItem('Помощь').SetIcon('help').doName = 'showHelpMenu';
    menu.AddMenuItem('GPS').SetIcon('map').doName = 'showGpsMenu';
    menu.AddMenuItem('Настройки').SetIcon('settings').doName = 'showSettingsMenu';

    menu.AddMenuItem('~y~Задать вопрос').SetIcon('ask').eventName = 'server:sendAsk';
    if (user.get('helper_level') > 0)
      menu.AddMenuItem('~y~Ответить на вопрос').SetIcon('ask').eventName = 'server:sendAnswerAsk';
    menu.AddMenuItem('~r~Жалоба (/report)').SetIcon('report').eventName = 'server:sendReport';
    if (user.get('admin_level') > 0)
      menu.AddMenuItem('~r~Ответить на жалобу').SetIcon('report').eventName = 'server:sendAnswerReport';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName != undefined) {
        if (item.eventName == 'server:sendAsk') {
          if (helperWait) return mp.game.ui.notifications.show('~r~Подождите 60 секунд');;
          let text = await UIMenu.Menu.GetUserInput('Задайте вопрос', '', 300);
          if (text != '') {
            mp.events.callRemote('server:sendAsk', text);
            helperWait = true;
            setTimeout(() => {
              helperWait = false
            }, 60000)
          }
        } else if (item.eventName == 'server:sendAnswerAsk') {
          let id = await UIMenu.Menu.GetUserInput('ID', '', 5);
          let text = await UIMenu.Menu.GetUserInput('Ответ', '', 300);
          if (text != '') mp.events.callRemote('server:sendAnswerAsk', methods.parseInt(id), text);
        } else if (item.eventName == 'server:sendReport') {
          report();
        } else if (item.eventName == 'server:sendAnswerReport') {
          let id = await UIMenu.Menu.GetUserInput('ID', '', 5);
          let text = await UIMenu.Menu.GetUserInput('Ответ', '', 300);
          if (text != '') mp.events.callRemote('server:sendAnswerReport', methods.parseInt(id), text);
        } else mp.events.callRemote(item.eventName);
      } else if (item.doName == 'showSettingsMenu') menuList.showSettingsMenu();
      else if (item.doName == 'showHelpMenu') menuList.showHelpMenu();
      else if (item.doName == 'showGpsMenu') menuList.showGpsMenu();
      else if (item.doName == 'showPlayerMenu') menuList.showPlayerMenu();
      else if (item.doName == 'showFraction2Menu') menuList.showFraction2Menu();
    });
  },

  showFraction2Menu: async function () {
    let frType = await Container.Get(mp.players.local.remoteId, 'fractionType');

    let menu = UIMenu.Menu.Create(`Организация`, `~b~Меню организации`);
    menu.AddMenuItem('Написать членам организации').doName = 'sendFractionMessage';

    if (user.isLeader2() || user.isSubLeader2())
      menu.AddMenuItem('~g~Принять в организацию').doName = 'showFraction2MemberInviteMenu';

    if (frType == 3 || frType == 4) {
      if (user.get('rank2') > 9)
        menu.AddMenuItem('Связаться с мафией').doName = 'sendMafiaMessage';
    }

    menu.AddMenuItem('Установить тег').doName = 'setTag';
    menu.AddMenuItem('Список членов организации').eventName = 'server:showMember2ListMenu';

    if (frType == 3 || frType == 4) menu.AddMenuItem('~y~Отмыть деньги').doName = 'clearMoney';
    // if (frType == 3) menu.AddMenuItem('~y~Список территорий').doName = 'gangList';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'sendFractionMessage') {
        let text = await UIMenu.Menu.GetUserInput('Текст', '', 55);
        if (text == '') return;
        methods.notifyWithPictureToFraction2(
          user.get('rp_name'),
          `Организация`,
          text,
          'CHAR_DEFAULT',
          user.get('fraction_id2')
        );
      } else if (item.doName == 'sendMafiaMessage') {
        if (user.get('phone_code') == 0) {
          mp.game.ui.notifications.show(`~r~У Вас нет телефона`);
          return;
        }
        let text = await UIMenu.Menu.GetUserInput('Текст', '', 55);
        if (text == '') return;
        let phone = user.get('phone_code') + '-' + user.get('phone');
        methods.notifyWithPictureToFraction(phone, `Связь`, text, 'CHAR_DEFAULT', 8);
        methods.notifyWithPictureToFraction(phone, `Связь`, text, 'CHAR_DEFAULT', 9);
        methods.notifyWithPictureToFraction(phone, `Связь`, text, 'CHAR_DEFAULT', 10);
        methods.notifyWithPictureToFraction(phone, `Связь`, text, 'CHAR_DEFAULT', 11);
        mp.game.ui.notifications.show(`~y~Сообщение было отправлено`);
      } else if (item.doName == 'showFraction2MemberInviteMenu') menuList.showPlayerInvite2Menu();
      else if (item.eventName == 'server:showMember2ListMenu') mp.events.callRemote(item.eventName);
      else if (item.doName == 'setTag') {
        let tag = await UIMenu.Menu.GetUserInput('Тег', '', 16);
        tag = methods.removeQuotes(tag);
        if (tag == '') mp.game.ui.notifications.show(`~y~Вы удалили тег`);
        else mp.game.ui.notifications.show(`~y~Вы установили тег - ~s~${tag}`);
        user.set('tag', tag);
        user.setData('tag', tag);
        user.saveAccount();
      } else if (item.doName == 'clearMoney') {
        user.setWaypoint(-139, -631);
        mp.game.ui.notifications.show(`~y~Езжайте в Аркадиус и отмывайте деньги в вашем офисе`);
      }
      // else if (item.doName == 'gangList') {
      //   menuList.showGangZoneListMenu();
      // }
    });
  },

  showAdminMenu: function () {
    let menu = UIMenu.Menu.Create(``, `~b~Админ меню`, false, false, false, 'admin', 'admin', true);
    menu.AddMenuItem('~b~Админ-меню ~s~(~g~Beta~s~)').doName = 'adminNewMenu';
    if (user.isAdmin() && mp.players.local.getVariable('enableAdmin') === true) {
      menu.AddMenuItem('Спавн ТС').doName = 'spawnVeh';
      menu.AddMenuItem('Цвет ТС').doName = 'colorVeh';
      menu.AddMenuItem('Одежда').doName = 'cloth';
      menu.AddMenuItem('Noclip (old)').doName = 'noclipOld';
      menu.AddMenuItem('~b~Дополнительные данные игрока').doName = 'switchHpAp';
      menu.AddMenuItem('~b~Дополнительные данные ТС').doName = 'advancedData';
      menu.AddMenuItem('Уведомление').doName = 'notify';
      menu.AddMenuItem('Посадить в тюрьму').doName = 'jail';
      menu.AddMenuItem('Кикнуть игрока').doName = 'kick';
      menu.AddMenuItem('Телепортироваться к игроку').doName = 'tptoid';
      menu.AddMenuItem('Телепортировать игрока к себе').doName = 'tptome';
      // menu.AddMenuItem('Инвиз ON').doName = 'invisibleON';
      // menu.AddMenuItem('Инвиз OFF').doName = 'invisibleOFF';
      menu.AddMenuItem('Godmode ON/OFF').doName = 'godmode';
      menu.AddMenuItem('Телепорт на метку').doName = 'teleportToWaypoint';
      menu.AddMenuItem('Пофиксить тачку').doName = 'fixvehicle';
      menu.AddMenuItem('Зареспавнить ближайший ТС').doName = 'respvehicle';
      menu.AddMenuItem('Удалить ближайший ТС').doName = 'deletevehicle';
      menu.AddMenuItem('Перевернуть ближайший ТС').doName = 'flipVehicle';
      menu.AddMenuItem('Сменить ID').eventName = 'server:user:changeIdadmin';
      menu.AddMenuItem('Прогрузка ID', '15 по умолчанию').eventName = 'client:distId';
      menu.AddMenuItem('Оказать первую помощь').eventName = 'server:user:healFirstAdmin';
      menu.AddMenuItem('Дефибриллятор').eventName = 'server:user:adrenaline';

      if (user.isAdmin(5)) {
        menu.AddMenuItem('Коорды').doName = 'server:user:getPlayerPos';
        // menu.AddMenuItem('Новый ТС').doName = 'newVehicle';
        menu.AddMenuItem('Одежда').doName = 'debug';
      }
      menu.AddMenuItem('~y~Выключить админку').doName = 'disableAdmin';
      /*if (user.isAdmin(2)) {
        menu.AddMenuItem(
          '~r~Сбросить таймер',
          'Так блять, кто нажмет без спроса, тому пиздец'
        ).doName = 'dropTimer';
      }*/
    } else {
      menu.AddMenuItem('~y~Включить админку').doName = 'enableAdmin';
    }

    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {

      if (item.doName == 'adminNewMenu') mp.events.callRemote('admin:menu')
      if (item.doName == 'switchHpAp') user.showhpap = !user.showhpap;
      if (item.doName == 'advancedData') {
        user.adminAdvancedData = !user.adminAdvancedData
        mp.game.ui.notifications.show('AdvancedData: ' + (user.adminAdvancedData ? "~g~On" : "~r~Off"));
      }
      if (item.doName == 'noclipOld') noClipSwitch();
      if (item.doName == 'enableAdmin') user.setVariable('enableAdmin', true), UIMenu.Menu.HideMenu();
      if (item.doName == 'disableAdmin') {
        user.setVariable('enableAdmin', false)
        if (user.godmode) mp.players.local.setInvincible(false), user.godmode = false;
        UIMenu.Menu.HideMenu();
      };
      if (item.eventName == 'server:user:changeIdadmin') {
        UIMenu.Menu.HideMenu();
        let id = await UIMenu.Menu.GetUserInput('Новый ID', '', 10);
        mp.events.callRemote(item.eventName, methods.parseInt(id));
      } else if (item.eventName == 'client:distId') {
        UIMenu.Menu.HideMenu();
        let id = await UIMenu.Menu.GetUserInput('Расстояние', '', 10);
        mp.events.call(item.eventName, methods.parseInt(id));
      }
      // if (item.doName == 'newVehicle') {
      //   let vPrice = await UIMenu.Menu.GetUserInput('Цена', '', 10);
      //   let vCount = await UIMenu.Menu.GetUserInput('Кол-во', '', 4);
      //   if (vPrice == '') return;
      //   if (vCount == '') return;
      //   mp.events.callRemote('server:admin:newVehicle', vPrice, vCount);
      // }
      if (item.doName == 'spawnVeh') {
        UIMenu.Menu.HideMenu();
        let vName = await UIMenu.Menu.GetUserInput('Название ТС', '', 16);
        if (vName == '') return;
        methods.saveLog('AdminSpawnVehicle', `${user.get('rp_name')} - ${vName}`);
        mp.events.callRemote('server:admin:spawnVeh', vName);
      }
      if (item.doName == 'colorVeh') {
        menuList.showAdminColorVehMenu();
      }
      if (item.doName == 'dropTimer') {
        mp.events.callRemote('server:gangWar:dropTimer');
      }
      if (item.doName == 'cloth') {
        menuList.showAdminClothMenu();
      }
      if (item.doName == 'godmode') {
        user.godmode = !user.godmode;
        mp.game.ui.notifications.show('GodMode: ' + (user.godmode ? "~g~On" : "~r~Off"));
        mp.players.local.setInvincible(user.godmode);
      }
      if (item.doName == 'debug') {
        menuList.showAdminDebugMenu();
      }
      if (item.doName == 'teleportToWaypoint') user.tpToWaypoint();
      if (item.doName == 'notify') {
        UIMenu.Menu.HideMenu();
        let title = await UIMenu.Menu.GetUserInput('Заголовок', '', 20);
        if (title == '') return;
        let text = await UIMenu.Menu.GetUserInput('Текст новости', '', 55);
        if (text == '') return;
        methods.saveLog('AdminNotify', `${user.get('rp_name')} - ${title} | ${text}`);
        methods.notifyWithPictureToAll(title, 'Администрация', text, 'CHAR_ACTING_UP');
      }
      if (item.doName == 'kick') {
        UIMenu.Menu.HideMenu();
        let id = await UIMenu.Menu.GetUserInput('ID Игрока', '', 10);
        let reason = await UIMenu.Menu.GetUserInput('Причина', '', 100);
        methods.saveLog('AdminKick', `${user.get('rp_name')} - ${id} | ${reason}`);
        mp.events.callRemote('server:user:kickByAdmin', methods.parseInt(id), reason);
      }
      if (item.doName == 'jail') {
        UIMenu.Menu.HideMenu();
        let id = parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 10));
        let min = parseInt(await UIMenu.Menu.GetUserInput('Кол-во минут', '', 10));
        let reason = await UIMenu.Menu.GetUserInput('Причина', '', 100);
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`ID указан не верно`);
        if (isNaN(min) || min < 0) return mp.game.ui.notifications.show(`Время указано не верно`);
        methods.saveLog('AdminJail', `${user.get('rp_name')} - ${id} | ${min}m | ${reason}`);
        mp.events.callRemote(
          'server:user:jailByAdmin',
          methods.parseInt(id),
          reason,
          methods.parseInt(min)
        );
      }
      if (item.doName == 'tptoid') {
        let id = parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`ID указан не верно`);
        mp.events.callRemote('server:user:tpTo', id);
      }
      if (item.doName == 'tptome') {
        let id = parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`ID указан не верно`);
        mp.events.callRemote('server:user:tpToMe', id);
      }
      if (item.doName == 'invisibleON') {
        mp.events.callRemote('server:user:setAlpha', 0);
        /*let visibleState = mp.players.local.isVisible();
              mp.players.local.setVisible(!visibleState, !visibleState);*/
        mp.game.ui.notifications.show(`~q~Инвиз: ON`);
      }
      if (item.doName == 'invisibleOFF') {
        mp.events.callRemote('server:user:setAlpha', 255);
        mp.game.ui.notifications.show(`~q~Инвиз: OFF`);
      }
      if (item.doName == 'fixvehicle') {
        mp.events.callRemote('server:user:fixNearestVehicle');
      }
      if (item.doName == 'respvehicle') {
        mp.events.callRemote('server:respawnNearstVehicle');
      }
      if (item.doName == 'deletevehicle') {
        mp.events.callRemote('server:deleteNearstVehicle');
      }
      if (item.doName == 'flipVehicle') {
        mp.events.callRemote('server:flipNearstVehicle');
      }
      if (item.doName == 'server:user:getPlayerPos') {
        mp.events.callRemote('server:user:getPlayerPos');
      }
      if (item.eventName == 'server:user:adrenaline') {
        UIMenu.Menu.HideMenu();
        let id = parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`ID указан не верно`);
        methods.saveLog('AdminHealPlayer', `${user.get('rp_name')} | Adrenaline to id: ${id}`);
        mp.events.callRemote('server:user:adrenaline', methods.parseInt(id));
      }
      if (item.eventName == 'server:user:healFirstAdmin') {
        UIMenu.Menu.HideMenu();
        let id = parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 10));
        if (isNaN(id) || id < 0) return mp.game.ui.notifications.show(`ID указан не верно`);
        methods.saveLog('AdminHealPlayer', `${user.get('rp_name')} | Heal to id: ${id}`);
        mp.events.callRemote('server:user:healFirstAdmin', methods.parseInt(id));
      }
    });
  },

  showAdminColorVehMenu: function () {
    let menu = UIMenu.Menu.Create(`Admin`, `~b~Цвет ТС`);

    let color1 = 0;
    let color2 = 0;

    let list = [];
    for (let j = 0; j < 156; j++) list.push(j + '');

    let list1Item = menu.AddMenuItemList('Цвет 1', list);
    let list2Item = menu.AddMenuItemList('Цвет 2', list);
    let list3Item: MenuItemClient;
    if (mp.players.local.vehicle.getLiveryCount() > 1) {
      let list2 = [];
      for (let j = 0; j < mp.players.local.vehicle.getLiveryCount(); j++) list2.push(j + '');
      list3Item = menu.AddMenuItemList('Livery', list2);
    }
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ListChange.on((item, index) => {
      if (list3Item == item) {
        mp.events.callRemote('server:vehicle:setLivery', index);
        return;
      }
      if (list1Item == item) color1 = index;
      if (list2Item == item) color2 = index;
      mp.events.callRemote('server:vehicle:setColor', color1, color2);
    });

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showAdminClothMenu: function () {
    let menu = UIMenu.Menu.Create(`Admin`, `~b~Одежда`);

    let list = [];
    for (let j = 0; j < 500; j++) list.push(j + '');

    let listColor = [];
    for (let j = 0; j < 100; j++) listColor.push(j + '');

    let id = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let idColor = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let id1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let idColor1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 12; i++) {
      let list1Item = menu.AddMenuItemList('Слот ' + i, list);
      list1Item.slotId = i;
      list1Item._type = 0;

      let list2Item = menu.AddMenuItemList('Цвет ' + i, list);
      list2Item.slotId = i;
      list2Item._type = 1;

      menu.AddMenuItem(' ');
    }

    for (let i = 0; i < 8; i++) {
      let list1Item = menu.AddMenuItemList('ПСлот ' + i, list);
      list1Item.slotId = i;
      list1Item._type = 2;

      let list2Item = menu.AddMenuItemList('ПЦвет ' + i, list);
      list2Item.slotId = i;
      list2Item._type = 3;

      menu.AddMenuItem(' ');
    }
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ListChange.on((item, index) => {
      switch (item._type) {
        case 0:
          id[item.slotId] = index;
          user.setComponentVariation(item.slotId, id[item.slotId], idColor[item.slotId]);
          break;
        case 1:
          idColor[item.slotId] = index;
          user.setComponentVariation(item.slotId, id[item.slotId], idColor[item.slotId]);
          break;
        case 2:
          id1[item.slotId] = index;
          user.setProp(item.slotId, id1[item.slotId], idColor1[item.slotId]);
          break;
        case 3:
          idColor1[item.slotId] = index;
          user.setProp(item.slotId, id1[item.slotId], idColor1[item.slotId]);
          break;
      }
    });

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showAdminDebugMenu: function () {
    try {
      menuList.showUsmcArsenalMenu()
    } catch (e) {
      methods.debug('Exception: menuList.debug');
      methods.debug(e);
    }
  },


  showSapdClearMenu: function () {
    if (user.get('rank') < 4) {
      mp.game.ui.notifications.show('~r~Доступно с 4 ранга');
      return;
    }

    let menu = UIMenu.Menu.Create(`PC`, `~b~Очистить розыск`);
    menu.AddMenuItem('Очистить розыск').eventName = 'server:user:giveWanted';
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:user:giveWanted') {
        let id = await UIMenu.Menu.GetUserInput('ID Игрока', '', 10);
        mp.events.callRemote('server:user:giveWanted', methods.parseInt(id), 0, 'clear');
      }
    });
  },

  showHouseSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Дом', '~b~Купить дом №' + houseId);

    menu.AddMenuItem('Купить за ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Отказаться', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:houses:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showCarSellToPlayerMenu: function (houseId: number, name: string, sum: number, userId: number, slot: any) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Транспорт', '~b~Купить ' + name);

    menu.AddMenuItem('Транспорт за ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Отказаться', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:car:sellToPlayer:accept', sum, userId, slot);
    });
  },

  showCondoSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Квартира', '~b~Купить квартиру №' + houseId);

    menu.AddMenuItem('Купить за ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Отказаться', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:condo:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showApartSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Апартаменты', '~b~Купить апартаменты №' + houseId);

    menu.AddMenuItem('Купить за ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Отказаться', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:apartments:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showStockSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Склад', '~b~Купить склад №' + houseId);

    menu.AddMenuItem('Купить за ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Отказаться', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:stock:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showBusinessSellToPlayerMenu: function (houseId: number, sum: number, userId: number) {
    UIMenu.Menu.HideMenu();

    let menu = UIMenu.Menu.Create('Бизнес', '~b~Купить бизнес №' + houseId);

    menu.AddMenuItem('Купить за ~g~$' + methods.numberFormat(sum), '').doName = 'accept';
    menu.AddMenuItem('~r~Отказаться', '').doName = 'closeMenu';

    menu.ItemSelect.on(async (item, idx) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'accept')
        mp.events.callRemote('server:business:sellToPlayer:accept', houseId, sum, userId);
    });
  },

  showUsmcArsenalMenu: function () {
    let menu = UIMenu.Menu.Create(
      `USMC`,
      `~b~Гардероб`,
      false,
      false,
      false,
      'shopui_title_gr_gunmod',
      'shopui_title_gr_gunmod'
    );


    let list = [
      'Civil',
      'Regular #1',
      'Regular #2',
      'Regular #3',
      'Tactical #1',
      'Tactical #2',
      'Pilot #1',
      'Pilot #2',
      'Officer',
      'Special #1',
      'Special #2',
      // 'Diving',
    ];
    menu.AddMenuItemList('Форма', list);
    menu.AddMenuItem('~r~Закрыть');

    menu.ListChange.on((item, index) => {
      mp.events.callRemote('server:uniform:usmc', index);
    });

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showSapdArrestMenu: function () {
    let menu = UIMenu.Menu.Create(`PC`, `~b~Арест`);
    menu.AddMenuItem('Арест').eventName = 'server:user:arrest';
    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:user:arrest') {
        let id = await UIMenu.Menu.GetUserInput('ID Игрока', '', 10);
        mp.events.callRemote('server:user:arrest', methods.parseInt(id));
      }
    });
  },

  showMember2ListMenu: function (data: [number, string][]) {
    let menu = UIMenu.Menu.Create(`Организация`, `~b~Список членов организации`);

    data.forEach(function (item) {
      let nick = item[0].toString().substr(8);
      if ((user.isLeader2() || user.isSubLeader2()) && user.get('rp_name') != nick)
        menu.AddMenuItem(`${item[0]}`, `${item[1]}`).eventParam = nick;
      else menu.AddMenuItem(`${item[0]}`, `${item[1]}`);
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventParam) menuList.showMember2DoMenu(item.eventParam);
    });
  },

  showMember2DoMenu: function (name: string) {
    let menu = UIMenu.Menu.Create(`Организация`, `~b~` + name);

    menu.AddMenuItem(`Выдать ранг`).eventName = 'server:giveRank2';
    menu.AddMenuItem(`~r~Уволить`).eventName = 'server:uninvite2';

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:giveRank2') {
        let rank = methods.parseInt(await UIMenu.Menu.GetUserInput('Ранг', '', 2));
        if (isNaN(rank) || rank < 1 || rank > 10) {
          mp.game.ui.notifications.show('~r~Число должно быть выше 0 и ниже 11');
          return;
        }

        mp.events.callRemote(item.eventName, name, rank);
      } else if (item.eventName == 'server:uninvite2') {
        mp.events.callRemote(item.eventName, name);
      }
    });
  },


  showDispatchTaxiMenu: function () {
    let menu = UIMenu.Menu.Create(`Диспетчер`, `~b~Нажмите ~g~Enter~b~ чтобы принять вызов`);

    dispatcher.getItemTaxiList().forEach(function (item, idx) {
      let mItem = menu.AddMenuItem(
        `[${item.time}] ${item.title}`,
        `~b~[№${item.id}] Район: ~s~${item.street1}`
      );

      mItem.taxiId = item.id;
      mItem.taxiCount = item.count;
      mItem.taxiPrice = item.price;
      mItem.title = item.title;
      mItem.desc = item.desc;
      mItem.street1 = item.street1;
      mItem.posX = item.x;
      mItem.posY = item.y;
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item) => {
      UIMenu.Menu.HideMenu();
      if (closeItem == item) return;

      if (await Container.Has(item.taxiId, 'acceptTaxi')) {
        mp.game.ui.notifications.show('~r~Данный заказ уже был принят');
        return;
      }

      if (item.title.split('-').length == 2)
        mp.events.callRemote('server:user:sendTaxiAccept', item.title, item.taxiId);
      user.setWaypoint(item.posX, item.posY);
    });
  },

  showPlayerMenu: function () {
    if (user.get('jail_time') > 0) {
      mp.game.ui.notifications.show('~r~В тюрьме нельзя этим пользоваться');
      return;
    }

    let menu = UIMenu.Menu.Create(``, `~b~Меню вашего персонажа`);
    menu.spriteName = "profile";

    // menu.AddMenuItem('Инвентарь').doName = 'inventory';
    menu.AddMenuItem('Действия').SetIcon('hand').doName = 'showPlayerDoMenu';
    menu.AddMenuItem('Документы').SetIcon('Item_53').doName = 'showPlayerDoсMenu';
    if (user.get('phone_code') > 0) menu.AddMenuItem('Телефон').SetIcon('Item_8').doName = 'showPhoneMenu';
    if (user.get('is_buy_walkietalkie'))
      menu.AddMenuItem('Рация').SetIcon('Item_47').doName = 'showWalkietalkieMenu';

    if (
      user.get('job') == 'lawyer1' ||
      user.get('job') == 'lawyer2' ||
      user.get('job') == 'lawyer3'
    ) {
      menu.AddMenuItem(
        '~y~Предложить сделку подселения',
        'Доступно только для юристов'
      ).eventName = 'server:houses:lawyer:tryaddUser';
    }

    menu.AddMenuItem('Статистика').SetIcon('statistic').doName = 'showPlayerStatsMenu';
    menu.AddMenuItem('Топ 20').SetIcon('top').doName = 'top';
    menu.AddMenuItem('VIP Статус').SetIcon('vip').doName = 'vipMenu';
    menu.AddMenuItem('Анимации').SetIcon('anims').doName = 'showAnimationTypeListMenu';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'top') mp.events.callRemote('users:top')
      else if (item.doName == 'vipMenu') menuList.showPlayerVipMenu();
      else if (item.doName == 'showPlayerStatsMenu') menuList.showPlayerStatsMenu();
      else if (item.doName == 'showAnimationTypeListMenu') menuList.showAnimationTypeListMenu();
      // else if (item.doName == 'inventory')
      //   inventory.getItemList(inventory.types.Player, user.get('id'));
      else if (item.doName == 'showPlayerDoMenu') menuList.showPlayerDoMenu();
      else if (item.doName == 'showPlayerDoсMenu') menuList.showPlayerDoсMenu();
      else if (item.doName == 'showPhoneMenu') menuList.showPlayerPhoneMenu();
      else if (item.doName == 'showWalkietalkieMenu') menuList.showPlayerWalkietalkieMenu();
      else if (item.eventName == 'server:houses:lawyer:tryaddUser') {
        UIMenu.Menu.HideMenu();
        let id1 = await UIMenu.Menu.GetUserInput('ID Владельца', '', 10);
        let id2 = await UIMenu.Menu.GetUserInput('ID Подселяющего', '', 10);
        mp.events.callRemote(item.eventName, id1, id2);
      }
    });
  },

  showPlayerWalkietalkieMenu: function () {
    UIMenu.Menu.HideMenu();

    // mp.game.ui.notifications.show('~b~Рация временно не работает');
    // return;

    let menu = UIMenu.Menu.Create(`Рация`, `~b~Меню вашей рации`);

    // let list = ['Левый', 'Оба', 'Правый'];

    // let listBalItem = menu.AddMenuItemList(
    //   'Наушники',
    //   list,
    //   'Нажмите ~g~Enter~s~ чтобы применить'
    // );
    // listBalItem.doName = 'balance';
    // listBalItem.Index = methods.parseInt(user.get('s_radio_bal')) + 1;

    let listVoiceVol = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

    let listVoiceItem = menu.AddMenuItemList(
      'Громкость',
      listVoiceVol,
      'Нажмите ~g~Enter~s~ чтобы применить'
    );
    listVoiceItem.doName = 'vol';
    listVoiceItem.Index = methods.parseInt(user.get('s_radio_vol') * 10);

    menu.AddMenuItem('Изменить частоту').doName = 'frequency';
    menu.AddMenuItem('Справка').doName = 'about';

    /*menu.AddMenuItem(UiMenu, "Справка").Activated += (uimenu, item) =>
      {
          HideMenu();
          UI.ShowToolTip("~b~Справка\n~s~Говорить на кнопку ~INPUT_VEH_PUSHBIKE_SPRINT~.\nДоп клавиши зажимать не надо!");
      };*/

    let backButton = menu.AddMenuItem('~g~Назад');
    let closeButton = menu.AddMenuItem('~r~Закрыть');

    let radioVol = 1;
    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'vol') {
        radioVol = index / 10;

        if (radioVol == 0.0) radioVol = 0.001;

        user.setData('s_radio_vol', radioVol);
        // voice.setSettings('radioVolume', radioVol);
        mp.game.ui.notifications.show('~b~Вы установили значение: ~s~' + radioVol * 100 + '%');
      }
    });

    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'balance') {
        user.setData('s_radio_bal', index - 1.0);
        // voice.setSettings('radioBalance', index - 1.0);
        mp.game.ui.notifications.show('~g~Наушник установлен');
      }
    });

    menu.ItemSelect.on(async (item, index) => {
      if (item == closeButton) UIMenu.Menu.HideMenu();
      else if (item == backButton) {
        menuList.showPlayerMenu();
      } else if (item.doName == 'frequency') {
        let num = parseInt(await UIMenu.Menu.GetUserInput('До точки', '', 4));
        num = methods.parseInt(num);
        if (num > 3520 || num < 30) {
          mp.game.ui.notifications.show('~r~Значение должно быть от 30 до 3520');
          return;
        }
        if (num > 2000 && num < 3000 && !user.isGos()) {
          mp.game.ui.notifications.show('~r~Частоты от 2000 до 3000 закреплены за гос организациями');
          return;
        }
        let num2 = parseInt(await UIMenu.Menu.GetUserInput('После точки', '', 3));
        num2 = methods.parseInt(num2);
        if (num2 < 0) {
          mp.game.ui.notifications.show('~r~Значение должно быть больше 0');
          return;
        }
        let walkie_num = num + '.' + num2;
        user.set('walkietalkie_num', walkie_num);
        user.setData('walkietalkie_num', walkie_num);
        mp.events.callRemote('voice.server.changeRadioFrequency', walkie_num);
        mp.game.ui.notifications.show('~g~Значение установлено: ~s~' + walkie_num);
      } else if (item.doName == 'about') {
        mp.gui.chat.push(`!{03A9F4}Говорить на кнопку CAPS LOCK. Доп клавиши зажимать не надо!`);
      }
    });
  },

  showPlayerDoMenu: function () {
    let menu = UIMenu.Menu.Create(`Действие`, `~b~Меню действий`);

    menu.AddMenuItem('Передать деньги').doName = 'giveMoney';
    menu.AddMenuItem('Познакомиться').doName = 'dating';
    //menu.AddMenuItem("Вырубить").doName = '';
    menu.AddMenuItem('Снять наручники').doName = 'unCuff';
    menu.AddMenuItem('Затащить в ближайшее авто').doName = 'inCar';
    menu.AddMenuItem('Вести за собой').eventName = 'server:taskFollow';
    menu.AddMenuItem('Снять маску с игрока').eventName = 'server:taskRemoveMask';
    menu.AddMenuItem('Вытащить из тс').eventName = 'server:removeFromCar';
    // menu.AddMenuItem('Обыск игрока').doName = 'search';
    // menu.AddMenuItem('Изъять экипированное оружие').doName = 'removeAllWeaponsNearst';

    // menu.AddMenuItem(
    //   '~y~Посмотреть жетон',
    //   'Показывает жетон сотрудника ПД / Шерифов'
    // ).doName = 'seeGosDoc';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'giveMoney') menuList.showPlayerGiveMoneyMenu();
      else if (item.doName == 'dating') menuList.showPlayerDatingMenu();
      else if (item.doName == 'unCuff') mp.events.callRemote('server:unCuffNearst');
      // else if (item.doName == 'search') mp.events.callRemote('server:getInvNearst');
      // else if (item.doName == 'removeAllWeaponsNearst')
      //   mp.events.callRemote('server:removeAllWeaponsNearst');
      else if (item.doName == 'inCar') mp.events.callRemote('server:inCarNearst');
      else if (item.doName == 'seeGosDoc') menuList.showPlayerSeeDocMenu();
      else if (item.eventName == 'server:taskFollow') mp.events.callRemote(item.eventName);
      else if (item.eventName == 'server:taskRemoveMask') mp.events.callRemote(item.eventName);
      else if (item.eventName == 'server:removeFromCar') mp.events.callRemote(item.eventName);
    });
  },

  showPlayerDoсMenu: function () {
    let menu = UIMenu.Menu.Create(`Документы`, `~b~Меню документов`);

    if (user.isGos()) menu.AddMenuItem('Показать удостоверение').doName = 'showGosDoc';

    menu.AddMenuItem('Показать паспорт').doName = 'showCardId';
    menu.AddMenuItem('Показать лицензии').doName = 'showLic';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName) menuList.showPlayerShowDocMenu(item.doName);
    });
  },

  showPlayerSeeDocMenu: function () {
    let menu = UIMenu.Menu.Create(`Действие`, `~b~Посмотреть жетон`);

    mp.players.forEachInRange(mp.players.local.position, 5, function (p) {
      if (p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        //TODO
        chat.sendMeCommand('посмотрел на человека рядом');
        mp.events.callRemote('server:user:seeGosDoc', item.remoteId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerShowDocMenu: function (eventName: string) {
    let menu = UIMenu.Menu.Create(`Действие`, `~b~Показать документы`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        //TODO
        chat.sendMeCommand('показал документы');
        mp.events.callRemote('server:user:' + eventName, item.remoteId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerGiveMoneyMenu: function () {
    let menu = UIMenu.Menu.Create(`Действие`, `~b~Передать деньги`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p && mp.players.exists(p) && p != mp.players.local && p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.remoteId >= 0) {
          let money = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
          if (money < 1) {
            mp.game.ui.notifications.show('~r~Нельзя передавать меньше 1$');
            return;
          }
          mp.events.callRemote('server:user:giveMoneyToPlayerId', item.remoteId, money);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerDatingMenu: function () {
    let menu = UIMenu.Menu.Create(`Действие`, `~b~Знакомства`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p && mp.players.exists(p) && p != mp.players.local && p.getAlpha() > 0 && !user.isDead(p))
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.remoteId >= 0) {
          let rpName = user.get('rp_name').split(' ');
          let name = await UIMenu.Menu.GetUserInput('Как вы себя представите?', rpName[0], 30);
          if (name == '') return;
          name = name.replace(/[^a-zA-Z\s]/gi, '');
          if (name == '' || name == ' ') {
            mp.game.ui.notifications.show('~r~Доступны только английские буквы');
            return;
          }
          mp.events.callRemote('server:user:askDatingToPlayerId', item.remoteId, name);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerDatingAskMenu: function (playerId: number, name: string) {
    let player = mp.players.atRemoteId(playerId);

    if (mp.players.exists(player)) {
      let menu = UIMenu.Menu.Create(
        `Знакомства`,
        `~b~${player.getVariable('id')} хочет познакомиться`
      );

      menu.AddMenuItem('~g~Принять знакомство').doName = 'yes';
      menu.AddMenuItem('~r~Отказать');

      menu.AddMenuItem('~r~Закрыть');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item.doName) {
          let rpName = user.get('rp_name').split(' ');
          let nameAnswer = await UIMenu.Menu.GetUserInput('Как вы себя представите?', rpName[0], 30);
          if (nameAnswer == '') return;
          nameAnswer = nameAnswer.replace(/[^a-zA-Z\s]/gi, '');
          if (nameAnswer == '' || nameAnswer == ' ') {
            mp.game.ui.notifications.show('~r~Доступны только английские буквы');
            return;
          }
          mp.events.callRemote('server:user:askDatingToPlayerIdYes', playerId, name, nameAnswer);
          user.playAnimationWithUser(player.getVariable('id'), 0);
        }
      });
    }
  },


  showPlayerInvite2Menu: function () {
    let menu = UIMenu.Menu.Create(`Действие`, `~b~Принять в организацию`);

    mp.players.forEachInRange(mp.players.local.position, 2, function (p) {
      if (p && mp.players.exists(p) && p != mp.players.local && p.getAlpha() > 0 && p.getHealth() > 0)
        menu.AddMenuItem(user.getShowingIdString(p).toString()).remoteId = p.remoteId;
    });

    menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.remoteId >= 0) mp.events.callRemote('server:user:inviteFraction2', item.remoteId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showPlayerStatsMenu: function () {
    let menu = UIMenu.Menu.Create(`Персонаж`, `~b~${user.get('rp_name')}`);

    menu.AddMenuItem('~b~Имя:~s~').SetRightLabel(`${user.get('rp_name')}`);
    menu.AddMenuItem('~b~Уровень:~s~').SetRightLabel(`${user.getLevel()} (${user.getExp()} / ${user.getMaxExp()})`);
    menu.AddMenuItem(((user.warns >= 2) ? "~r~" : "~b~") + 'Активных предупреждений:~s~').SetRightLabel(`[${user.warns}/3]`);
    menu.AddMenuItem('~b~Возраст:~s~').SetRightLabel(`${user.get('age')}`);
    menu.AddMenuItem('~b~Отыграно времени:~s~').SetRightLabel(`${user.online_time} минут`);
    menu.AddMenuItem('~b~Отыграно сегодня:~s~').SetRightLabel(`${user.online_today}/24 часов`);

    menu.AddMenuItem('~b~Организация:~s~').SetRightLabel(
      `${
      user.get('fraction_id') > 0
        ? methods.getFractionName(user.get('fraction_id'))
        : methods.getJobName(user.get('job'))
      }`
    );
    menu.AddMenuItem('~b~Регистрация:~s~').SetRightLabel(`${user.getRegStatusName()}`);
    if (user.get('reg_time') > 0)
      menu.AddMenuItem('~b~Время регистрации:~s~').SetRightLabel(
        `${(user.get('reg_time') / 31.0).toFixed(2)} мес.`
      );
    if (user.get('bank_prefix') > 0)
      menu.AddMenuItem('~b~Номер карты:~s~').SetRightLabel(
        `${user.get('bank_prefix')}-${user.get('bank_number')}`
      );
    if (user.get('phone_code') > 0)
      menu.AddMenuItem('~b~Телефон:~s~').SetRightLabel(
        `${user.get('phone_code')}-${user.get('phone')}`
      );

    menu.AddMenuItem('~b~Розыск:~s~').SetRightLabel(
      `${user.get('wanted_level') > 0 ? '~r~В розыске' : '~g~Нет'}`
    );
    menu.AddMenuItem('~b~ЧС гос.организаций:~s~').SetRightLabel(
      `${user.get('is_gos_blacklist') ? '~r~Да' : '~g~Нет'}`
    );
    menu.AddMenuItem('~b~Рецепт марихуаны:~s~').SetRightLabel(
      `${user.get('allow_marg') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия категории "А":~s~').SetRightLabel(
      `${user.get('a_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия категории "B":~s~').SetRightLabel(
      `${user.get('b_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия категории "C":~s~').SetRightLabel(
      `${user.get('c_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия на авиатранспорт:~s~').SetRightLabel(
      `${user.get('air_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия на водный транспорт:~s~').SetRightLabel(
      `${user.get('ship_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия на оружие:~s~').SetRightLabel(
      `${user.get('gun_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия на таксиста:~s~').SetRightLabel(
      `${user.get('taxi_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия на адвоката:~s~').SetRightLabel(
      `${user.get('law_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Лицензия на бизнес:~s~').SetRightLabel(
      `${user.get('biz_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Разрешение на рыболовство:~s~').SetRightLabel(
      `${user.get('fish_lic') ? 'Есть' : '~r~Нет'}`
    );
    menu.AddMenuItem('~b~Мед. страховка:~s~').SetRightLabel(
      `${user.get('med_lic') ? 'Есть' : '~r~Нет'}`
    );

    menu.AddMenuItem('~b~Выносливость:~s~').SetRightLabel(`${user.get('mp0_stamina') + 1}%`);
    menu.AddMenuItem('~b~Сила:~s~').SetRightLabel(`${user.get('mp0_strength') + 1}%`);
    menu.AddMenuItem('~b~Объем легких:~s~').SetRightLabel(
      `${user.get('mp0_lung_capacity') + 1}%`
    );
    menu.AddMenuItem('~b~Навык водителя:~s~').SetRightLabel(
      `${user.get('mp0_wheelie_ability') + 1}%`
    );
    menu.AddMenuItem('~b~Навык пилота:~s~').SetRightLabel(
      `${user.get('mp0_flying_ability') + 1}%`
    );
    menu.AddMenuItem('~b~Навык стрельбы:~s~').SetRightLabel(
      `${user.get('mp0_shooting_ability') + 1}%`
    );
    menu.AddMenuItem('~b~Навык таксиста:~s~').SetRightLabel(
      `${(user.get('skill_taxi') / 4).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык почтальона:~s~', 'Компания PostOp').SetRightLabel(
      `${(user.get('skill_mail') / 10).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык почтальона:~s~', 'Компания GoPostal').SetRightLabel(
      `${(user.get('skill_mail2') / 10).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык фотографа:~s~').SetRightLabel(
      `${(user.get('skill_photo') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык уборщика квартир:~s~').SetRightLabel(
      `${(user.get('skill_sunb') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык дезинсектора:~s~').SetRightLabel(
      `${(user.get('skill_bgstar') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык доставщика еды:~s~').SetRightLabel(
      `${(user.get('skill_bshot') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык мехатроника:~s~').SetRightLabel(
      `${(user.get('skill_water') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык садовника:~s~').SetRightLabel(
      `${(user.get('skill_three') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык инкассатора:~s~').SetRightLabel(
      `${(user.get('skill_gr6') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык водителя автобуса #1:~s~').SetRightLabel(
      `${(user.get('skill_bus1') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык водителя автобуса #2:~s~').SetRightLabel(
      `${(user.get('skill_bus2') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык водителя автобуса #3:~s~').SetRightLabel(
      `${(user.get('skill_bus3') / 5).toFixed(2)}%`
    );
    menu.AddMenuItem('~b~Навык дальнобойщика:~s~').SetRightLabel(
      `${(user.get('skill_trucker') / 15).toFixed(2)}%`
    );

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      else if (item.doName == 'showPlayerStatsMenu') menuList.showPlayerStatsMenu();
      else if (item.doName == 'showAnimationTypeListMenu') menuList.showAnimationTypeListMenu();
    });
  },

  showPlayerVipMenu: function () {
    let menu = UIMenu.Menu.Create(`VIP Статус`, `~b~Информация`);
    let data = user.getVipData();
    if (data) {
      menu.AddMenuItem('~b~Название:~s~').SetRightLabel(`${data.name}`);
      menu.AddMenuItem('~b~Действует до:~s~').SetRightLabel(`${methods.unixTimeStampToDateTime(user.get('vip_time'))}`);
      menu.AddMenuItem('~b~Стоимость:~s~').SetRightLabel(`${methods.numberFormat(data.cost)} Coins / Мес.`);
      menu.AddMenuItem('~b~Оплата налогов через сайт:~s~').SetRightLabel(`${data.sitepay ? "~g~Да" : "~r~Нет"}`);
      menu.AddMenuItem('~b~Бесплатная смена слотов ТС:~s~').SetRightLabel(`${data.changeslots ? "~g~Да" : "~r~Нет"}`);
      menu.AddMenuItem('~b~Бонус опыта:~s~').SetRightLabel(`${data.expbonus > 0 ? "+"+data.expbonus+" EXP" : "~r~Нет"}`);
      menu.AddMenuItem('~b~Бонус зарплаты:~s~').SetRightLabel(`+$${methods.numberFormat(data.moneybonus)}`);
      menu.AddMenuItem('~b~Бонусные коины:~s~').SetRightLabel(`${data.givecoin > 0 ? "+"+data.givecoin+" Coins" : "~r~Нет"}`);
      menu.AddMenuItem('~b~Возможность стоять AFK:~s~').SetRightLabel(`${data.afkminutes} мин.`);
      menu.AddMenuItem('~b~Доступ к ~g~/vipuninvite~b~:~s~').SetRightLabel(`${data.vipuninvite ? "~g~Да" : "~r~Нет"}`);
      menu.AddMenuItem('~b~Бонус к навыкам персонажа:~s~').SetRightLabel(`${data.skillpersbonus > 0 ? "+" + (100/data.skillpersbonus) + "%" : "~r~Нет"}`);
      menu.AddMenuItem('~b~Бонус к рабочим навыкам:~s~').SetRightLabel(`${data.skilljobbonus > 0 ? "+" + (100 / data.skilljobbonus) + "%" : "~r~Нет"}`);
    } else {
      menu.AddMenuItem('~r~Информация отсутствует');
      menu.AddMenuItem('~b~Приобрести випку можно на сайте');
      menu.AddMenuItem('~b~https://gta-5.ru/trade');
    }

  },

  showMenu: function (title: string, desc: string, menuData: Map<any, any>) {
    let menu = UIMenu.Menu.Create(title.toString(), `~b~${desc}`);

    /*for (let [key, value] of menuData)
          menu.AddMenuItem(`~b~${key}: ~s~`).SetRightLabel(value.toString());*/

    menuData.forEach(function (val, key, map) {
      menu.AddMenuItem(`~b~${key}: ~s~`).SetRightLabel(val.toString());
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
    });
  },

  showTruckerOffersMenu: function (menuData: any[]) {
    let menu = UIMenu.Menu.Create('Грузоперевозки', `~b~Список заказов`);

    //mp.game.pathfind.calculateTravelDistanceBetweenPoints(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, 0, 0, 0)
    menuData.forEach((item) => {
      let x = 0;
      let y = 0;
      let z = 0;
      let tx = 0;
      let ty = 0;
      let tz = 0;
      if (item.length == 10) {
        x = item[3];
        y = item[4];
        z = item[5];
        tx = item[6];
        ty = item[7];
        tz = item[8];
      } else {
        x = item[7];
        y = item[8];
        z = item[9];
        tx = item[11];
        ty = item[12];
        tz = item[13];
      }
      let dist = mp.game.pathfind.calculateTravelDistanceBetweenPoints(x, y, z, tx, ty, tz);
      if (dist > 10000)
        dist = methods.parseInt(
          methods.distanceToPos(new mp.Vector3(x, y, z), new mp.Vector3(tx, ty, tz))
        );
      if (item[0]) {
        let menuItem = menu.AddMenuItem(
          `~b~№${item[0]}.~s~ ${item[1]}`,
          `~y~Расстояние: ~s~${dist}m\n~y~Место загрузки: ~s~${mp.game.ui.getLabelText(
            mp.game.zone.getNameOfZone(x, y, z)
          )}`
        );
        menuItem.SetRightLabel(`~g~$${methods.numberFormat(item[item.length - 1])}`);
        menuItem.offerId = item;
      }
    });
    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.offerId) menuList.showTruckerOfferInfoMenu(item.offerId);
      //mp.events.callRemote('server:tucker:acceptOffer', item.offerId);
    });
  },

  showTruckerOfferInfoMenu: function (item: any[]) {
    //id, name, company, x, y, z, px, py, pz, price
    //id, name, company, trName, cl1, cl2, liv, x, y, z, rot, px, py, pz, price

    //methods.debug(item);

    let x = 0;
    let y = 0;
    let z = 0;
    let tx = 0;
    let ty = 0;
    let tz = 0;
    if (item.length == 10) {
      x = item[3];
      y = item[4];
      z = item[5];
      tx = item[6];
      ty = item[7];
      tz = item[8];
    } else {
      x = item[7];
      y = item[8];
      z = item[9];
      tx = item[11];
      ty = item[12];
      tz = item[13];
    }

    let menu = UIMenu.Menu.Create(`Грузоперевозки`, `~b~Информация о заказе`);

    let dist = mp.game.pathfind.calculateTravelDistanceBetweenPoints(x, y, z, tx, ty, tz);

    if (dist > 10000)
      dist = methods.parseInt(
        methods.distanceToPos(new mp.Vector3(x, y, z), new mp.Vector3(tx, ty, tz))
      );

    menu.AddMenuItem('~y~Номер заказа:~s~').SetRightLabel(item[0]);
    menu.AddMenuItem('~y~Груз:~s~').SetRightLabel(item[1]);
    menu.AddMenuItem('~y~Компания:~s~').SetRightLabel(item[2]);
    menu.AddMenuItem('~y~Стоимость:~s~').SetRightLabel(
      `$${methods.numberFormat(item[item.length - 1])}`
    );
    menu.AddMenuItem('~y~Место загрузки:~s~').SetRightLabel(
      `${mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(x, y, z))}`
    );
    menu.AddMenuItem('~y~Место разгрузки:~s~').SetRightLabel(
      `${mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(tx, ty, tz))}`
    );
    menu.AddMenuItem('~y~Расстояние:~s~').SetRightLabel(`${dist}m`);
    menu.AddMenuItem('~g~Принять заказ').accept = item[0];

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.accept) mp.events.callRemote('server:tucker:acceptOffer', item.accept);
    });
  },

  showLawyerOffersMenu: function (price: number, id: number, rpName: string) {
    let menu = UIMenu.Menu.Create('Юрист', `~b~${rpName}`);

    menu.AddMenuItem('~g~Согласиться', `Цена: ~g~$${methods.numberFormat(price)}`).eventName =
      'server:user:lawyer:accept';
    menu.AddMenuItem('~r~Отказаться');

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName) mp.events.callRemote(item.eventName, id);
    });
  },

  showLawyerHouseOffersMenu: function (buyerId: number, id: number) {
    let menu = UIMenu.Menu.Create('Юрист', `~b~Подселение`);

    menu.AddMenuItem('~g~Согласиться', `Цена: ~g~$10,000`).eventName =
      'server:houses:lawyer:addUser';
    menu.AddMenuItem('~r~Отказаться');

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName) mp.events.callRemote(item.eventName, id, buyerId);
    });
  },

  showGpsMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Главное меню`);

    menu.AddMenuItem('Важные места');
    menu.AddMenuItem('Работы');
    menu.AddMenuItem('Магазины и прочее');
    menu.AddMenuItem('Компании');
    menu.AddMenuItem('Интересные места');
    menu.AddMenuItem('Моё имущество');
    menu.AddMenuItem('~y~Убрать метку');

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      if (index == 0) menuList.showGpsImportantMenu();
      else if (index == 1) menuList.showGpsJobMenu();
      else if (index == 2) menuList.showGpsOtherMenu();
      else if (index == 3) menuList.showGpsCompMenu();
      else if (index == 4) menuList.showGpsInterestingMenu();
      else if (index == 5) mp.events.callRemote('my:gps')
      else if (index == 6) user.removeWaypoint();
    });
  },

  showGpsImportantMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Важные места`);

    let menuItem = menu.AddMenuItem('Казино');
    menuItem.gpsX = 935.53;
    menuItem.gpsY = 46.44;

    menuItem = menu.AddMenuItem('Гонки и дуэли');
    menuItem.gpsX = -247.4;
    menuItem.gpsY = -2032.4;

    menuItem = menu.AddMenuItem('Стрельбище');
    menuItem.gpsX = -1653.26;
    menuItem.gpsY = -3113.55;

    menuItem = menu.AddMenuItem('Аукцион');
    menuItem.gpsX = 478.74;
    menuItem.gpsY = -107.67;

    menuItem = menu.AddMenuItem(
      'Здание правительства',
      'Получение регистрации\nТрудоустройство\nИные вопросы'
    );
    menuItem.gpsX = -546;
    menuItem.gpsY = -202;

    menuItem = menu.AddMenuItem('Лицензионный центр');
    menuItem.gpsX = -716;
    menuItem.gpsY = -1296;

    menuItem = menu.AddMenuItem(
      'Государственный банк "~r~Maze Bank~s~"',
      'Продажа вашего имущества\nОперации со счетом'
    );
    menuItem.gpsX = -75;
    menuItem.gpsY = -826;

    menuItem = menu.AddMenuItem('Частный банк "~o~Pacific Standard~s~"');
    menuItem.gpsX = 235.0;
    menuItem.gpsY = 216.0;

    //TODO GPS EVENT
    menuItem = menu.AddMenuItem('Найти ближайший "~g~Fleeca"~s~ банк');
    menuItem.gpsEvent = 'server:gps:findFleeca';

    menuItem = menu.AddMenuItem('Частный банк "~b~Blaine County~s~"');
    menuItem.gpsX = -111;
    menuItem.gpsY = 6467;

    menuItem = menu.AddMenuItem('Бизнес центр "~b~Arcadius~s~"');
    menuItem.gpsX = -139;
    menuItem.gpsY = -631;

    menuItem = menu.AddMenuItem('Полицейский участок');
    menuItem.gpsX = 437;
    menuItem.gpsY = -982;

    menuItem = menu.AddMenuItem('Шериф департамент Палето');
    menuItem.gpsX = -448;
    menuItem.gpsY = 6012;

    menuItem = menu.AddMenuItem('Шериф департамент Сенди');
    menuItem.gpsX = 1853;
    menuItem.gpsY = 3686;

    menuItem = menu.AddMenuItem('Больница Лос-Сантоса');
    menuItem.gpsX = 354.65;
    menuItem.gpsY = -595.92;

    menuItem = menu.AddMenuItem('Федеральная тюрьма');
    menuItem.gpsX = 1830;
    menuItem.gpsY = 2603;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsJobMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Работы`);

    let menuItem = menu.AddMenuItem('Строитель', 'Для новичков');
    menuItem.gpsX = -142;
    menuItem.gpsY = -936;

    menuItem = menu.AddMenuItem('Мойщик окон', 'Для новичков');
    menuItem.gpsX = -1539;
    menuItem.gpsY = -448;

    menuItem = menu.AddMenuItem('Дорожные работы', 'Для новичков');
    menuItem.gpsX = 53;
    menuItem.gpsY = -723;

    menuItem = menu.AddMenuItem('Карьер', 'Для новичков');
    menuItem.gpsX = 2947;
    menuItem.gpsY = 2745;

    /*menuItem = menu.AddMenuItem("Свалка металлолома");
      menuItem.gpsX = -428;
      menuItem.gpsY = -1728;
  
      menuItem = menu.AddMenuItem("Стоянка мусоровозов");
      menuItem.gpsX = 1569;
      menuItem.gpsY = -2130;*/

    menuItem = menu.AddMenuItem('Стоянка садовников');
    menuItem.gpsX = -1146;
    menuItem.gpsY = -745;

    menuItem = menu.AddMenuItem('Автобусный парк');
    menuItem.gpsX = -675;
    menuItem.gpsY = -2166;

    menuItem = menu.AddMenuItem('Почта Post Op');
    menuItem.gpsX = -416;
    menuItem.gpsY = -2855;

    menuItem = menu.AddMenuItem('Почта GoPostal');
    menuItem.gpsX = 74;
    menuItem.gpsY = 120;

    menuItem = menu.AddMenuItem('Дезинсектор в Bugstars');
    menuItem.gpsX = 151;
    menuItem.gpsY = -3083;

    menuItem = menu.AddMenuItem('Развозчик еды в BurgerShot');
    menuItem.gpsX = -1178;
    menuItem.gpsY = -891;

    menuItem = menu.AddMenuItem('Уборщик квартир в Sunset Bleach');
    menuItem.gpsX = -1194;
    menuItem.gpsY = -1480;

    menuItem = menu.AddMenuItem('Мехатроник в Water & Power');
    menuItem.gpsX = 633;
    menuItem.gpsY = 125;

    menuItem = menu.AddMenuItem("Садовник в O'Connor");
    menuItem.gpsX = -1146;
    menuItem.gpsY = -745;

    menuItem = menu.AddMenuItem('Фотограф в Life Invader');
    menuItem.gpsX = -1041;
    menuItem.gpsY = -241;

    // menuItem = menu.AddMenuItem('Учёный в Humane Labs');
    // menuItem.gpsX = 3616;
    // menuItem.gpsY = 3730;

    menuItem = menu.AddMenuItem('Таксист в Downtown Cab Co.');
    menuItem.gpsX = 895;
    menuItem.gpsY = -179;

    menuItem = menu.AddMenuItem('Таксист в Express Car Service');
    menuItem.gpsX = 896;
    menuItem.gpsY = -1035;

    menuItem = menu.AddMenuItem('Инкассатор в Gruppe6');
    menuItem.gpsX = 478;
    menuItem.gpsY = -1091;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsOtherMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Магазины и прочее`);

    let menuItem = menu.AddMenuItem('Аптека Family Pharmacy');
    menuItem.gpsX = 318;
    menuItem.gpsY = -1078;

    menuItem = menu.AddMenuItem('Магазин электронной техники #1');
    menuItem.gpsX = -658;
    menuItem.gpsY = -857;

    menuItem = menu.AddMenuItem('Магазин электронной техники #2');
    menuItem.gpsX = 1133;
    menuItem.gpsY = -472;

    //TODO GPS EVENT
    menuItem = menu.AddMenuItem('Найти ближайший магазин одежды');
    menuItem.gpsEvent = 'server:gps:findCloth';

    menuItem = menu.AddMenuItem('Найти ближайший магазин 24/7');
    menuItem.gpsEvent = 'server:gps:find247';

    menuItem = menu.AddMenuItem('Найти ближайшую заправку');
    menuItem.gpsEvent = 'server:gps:findFuel';

    //? ---
    menuItem = menu.AddMenuItem('Австосалон Эконом');
    menuItem.gpsEvent = 'server:gps:findAutosalon1';

    menuItem = menu.AddMenuItem('Австосалон Комфорт');
    menuItem.gpsEvent = 'server:gps:findAutosalon2';

    menuItem = menu.AddMenuItem('Австосалон Элитный');
    menuItem.gpsEvent = 'server:gps:findAutosalon3';

    menuItem = menu.AddMenuItem('Мотосалон');
    menuItem.gpsEvent = 'server:gps:findAutosalon4';

    menuItem = menu.AddMenuItem('Салон лодочного ТС');
    menuItem.gpsEvent = 'server:gps:findAutosalon5';

    menuItem = menu.AddMenuItem('Салон воздушного ТС');
    menuItem.gpsEvent = 'server:gps:findAutosalon6';

    menuItem = menu.AddMenuItem('Салон тех. ТС');
    menuItem.gpsEvent = 'server:gps:findAutosalon7';
    //? --

    menuItem = menu.AddMenuItem('Найти ближайший пункт аренды вело/мото');
    menuItem.gpsEvent = 'server:gps:findRent';

    menuItem = menu.AddMenuItem('Найти ближайший бар');
    menuItem.gpsEvent = 'server:gps:findBar';

    menuItem = menu.AddMenuItem('Найти ближайший магазин оружия');
    menuItem.gpsEvent = 'server:gps:findGunShop';

    /*menuItem = menu.AddMenuItem("Найти ближайший тату салон");
      menuItem.gpsEvent = 'server:gps:findTattooShop';*/

    menuItem = menu.AddMenuItem('Найти ближайший барбершоп');
    menuItem.gpsEvent = 'server:gps:findBarberShop';

    menuItem = menu.AddMenuItem('Найти ближайшую автомастерскую');
    menuItem.gpsEvent = 'server:gps:findLsc';

    menuItem = menu.AddMenuItem('Магазин масок');
    menuItem.gpsX = -1337;
    menuItem.gpsY = -1277;

    menuItem = menu.AddMenuItem('Магазин принтов');
    menuItem.gpsX = -1234;
    menuItem.gpsY = -1477;

    menuItem = menu.AddMenuItem('Автомойка');
    menuItem.gpsX = -700;
    menuItem.gpsY = -932;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsCompMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Компании`);

    let menuItem = menu.AddMenuItem('Post Op');
    menuItem.gpsX = -416;
    menuItem.gpsY = -2855;

    menuItem = menu.AddMenuItem('GoPostal');
    menuItem.gpsX = 74;
    menuItem.gpsY = 120;

    menuItem = menu.AddMenuItem('Bugstars');
    menuItem.gpsX = 151;
    menuItem.gpsY = -3083;

    menuItem = menu.AddMenuItem('BurgerShot');
    menuItem.gpsX = -1178;
    menuItem.gpsY = -891;

    menuItem = menu.AddMenuItem('Sunset Bleach');
    menuItem.gpsX = -1194;
    menuItem.gpsY = -1480;

    menuItem = menu.AddMenuItem('Water & Power');
    menuItem.gpsX = 633;
    menuItem.gpsY = 125;

    menuItem = menu.AddMenuItem("O'Connor");
    menuItem.gpsX = -1146;
    menuItem.gpsY = -745;

    menuItem = menu.AddMenuItem('Humane Labs');
    menuItem.gpsX = 3616;
    menuItem.gpsY = 3730;

    menuItem = menu.AddMenuItem('Life Invader');
    menuItem.gpsX = -1041;
    menuItem.gpsY = -241;

    menuItem = menu.AddMenuItem('Downtown Cab Co.');
    menuItem.gpsX = 895;
    menuItem.gpsY = -179;

    menuItem = menu.AddMenuItem('Express Car Service');
    menuItem.gpsX = 896;
    menuItem.gpsY = -1035;

    menuItem = menu.AddMenuItem('Gruppe6');
    menuItem.gpsX = 478;
    menuItem.gpsY = -1091;

    menuItem = menu.AddMenuItem('Bilgeco');
    menuItem.gpsX = 858;
    menuItem.gpsY = -3203;

    menuItem = menu.AddMenuItem('Jetsam');
    menuItem.gpsX = 114;
    menuItem.gpsY = -2569;

    menuItem = menu.AddMenuItem('Lando-Corp');
    menuItem.gpsX = 671;
    menuItem.gpsY = -2667;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showGpsInterestingMenu: function () {
    let menu = UIMenu.Menu.Create(`GPS`, `~b~Интересные места`);

    let menuItem = menu.AddMenuItem('Life Invader');
    menuItem.gpsX = -1041;
    menuItem.gpsY = -241;

    menuItem = menu.AddMenuItem('Международный аэропорт');
    menuItem.gpsX = -1037;
    menuItem.gpsY = -2737;

    menuItem = menu.AddMenuItem('Спортзал');
    menuItem.gpsX = -1204;
    menuItem.gpsY = -1564;

    menuItem = menu.AddMenuItem('Площадь Лос-Сантоса');
    menuItem.gpsX = 161;
    menuItem.gpsY = -993;

    menuItem = menu.AddMenuItem('Торговый центр Mega Moll');
    menuItem.gpsX = 46;
    menuItem.gpsY = -1753;

    menuItem = menu.AddMenuItem('Стриптиз клуб');
    menuItem.gpsX = 105;
    menuItem.gpsY = -1291;

    menuItem = menu.AddMenuItem('Бар "Tequila"');
    menuItem.gpsX = -562;
    menuItem.gpsY = 286;

    menuItem = menu.AddMenuItem('Бар "Yellow Jack"');
    menuItem.gpsX = 1986;
    menuItem.gpsY = 3054;

    menuItem = menu.AddMenuItem('Байкер клуб');
    menuItem.gpsX = 988;
    menuItem.gpsY = -96;

    menuItem = menu.AddMenuItem('Камеди клуб');
    menuItem.gpsX = -450;
    menuItem.gpsY = 280;

    menuItem = menu.AddMenuItem('Пляж');
    menuItem.gpsX = -1581;
    menuItem.gpsY = -1162;

    menuItem = menu.AddMenuItem('Обсерватория');
    menuItem.gpsX = -411;
    menuItem.gpsY = 1173;

    menuItem = menu.AddMenuItem('Надпись Vinewood');
    menuItem.gpsX = 716;
    menuItem.gpsY = 1203;

    menuItem = menu.AddMenuItem('Сцена-1');
    menuItem.gpsX = 226;
    menuItem.gpsY = 1173;

    menuItem = menu.AddMenuItem('Сцена-2');
    menuItem.gpsX = 689;
    menuItem.gpsY = 602;

    menuItem = menu.AddMenuItem('Библиотека Рокфорд-Хиллз');
    menuItem.gpsX = -615;
    menuItem.gpsY = -146;

    menuItem = menu.AddMenuItem('Гольф-клуб');
    menuItem.gpsX = -1375;
    menuItem.gpsY = 55;

    menuItem = menu.AddMenuItem('Музей Пасифик-Блаффс');
    menuItem.gpsX = -2291;
    menuItem.gpsY = 367;

    menuItem = menu.AddMenuItem('Университет Сан-Андреас');
    menuItem.gpsX = -1636;
    menuItem.gpsY = 180;

    menuItem = menu.AddMenuItem('Церковь Рокфорд-Хиллз');
    menuItem.gpsX = -766;
    menuItem.gpsY = -23;

    menuItem = menu.AddMenuItem('Церковь Маленький Сиул');
    menuItem.gpsX = -759;
    menuItem.gpsY = -709;

    menuItem = menu.AddMenuItem('Церковь Южный Лос-Сантос');
    menuItem.gpsX = 20;
    menuItem.gpsY = -1505;

    menuItem = menu.AddMenuItem('Миррор-Парк');
    menuItem.gpsX = 1080;
    menuItem.gpsY = -693;

    menuItem = menu.AddMenuItem('Казино Лос-Сантос');
    menuItem.gpsX = 928;
    menuItem.gpsY = 44;

    menuItem = menu.AddMenuItem('Ипподром');
    menuItem.gpsX = 1138;
    menuItem.gpsY = 106;

    menuItem = menu.AddMenuItem('Надпись Vinewood');
    menuItem.gpsX = 719;
    menuItem.gpsY = 1198;

    menuItem = menu.AddMenuItem('Восточный Театр');
    menuItem.gpsX = 301;
    menuItem.gpsY = 203;

    menuItem = menu.AddMenuItem('Weazel News');
    menuItem.gpsX = -598;
    menuItem.gpsY = -929;

    menuItem = menu.AddMenuItem('Парк Маленький Сиул');
    menuItem.gpsX = -880;
    menuItem.gpsY = -809;

    menuItem = menu.AddMenuItem('Коттеджный парк');
    menuItem.gpsX = -940;
    menuItem.gpsY = 303;

    menuItem = menu.AddMenuItem('Обсерватория Галилео');
    menuItem.gpsX = -429;
    menuItem.gpsY = 1109;

    menuItem = menu.AddMenuItem('City Hall Alta');
    menuItem.gpsX = 236;
    menuItem.gpsY = -409;

    menuItem = menu.AddMenuItem('Десять центов Театр');
    menuItem.gpsX = 393;
    menuItem.gpsY = -711;

    menuItem = menu.AddMenuItem('Здание суда');
    menuItem.gpsX = 322;
    menuItem.gpsY = -1625;

    menuItem = menu.AddMenuItem('Вальдез Театр');
    menuItem.gpsX = -721;
    menuItem.gpsY = -684;

    menuItem = menu.AddMenuItem('Richards Majestic');
    menuItem.gpsX = -1052;
    menuItem.gpsY = -478;

    menuItem = menu.AddMenuItem('City Hall Del Perro');
    menuItem.gpsX = -1285;
    menuItem.gpsY = -567;

    menuItem = menu.AddMenuItem('City Hall Rockford-Hills');
    menuItem.gpsX = -545;
    menuItem.gpsY = -203;

    menuItem = menu.AddMenuItem('Пирс Дель-Перро');
    menuItem.gpsX = -1604;
    menuItem.gpsY = -1048;

    menuItem = menu.AddMenuItem('Пирс Веспуччи');
    menuItem.gpsX = -3265;
    menuItem.gpsY = 947;

    menuItem = menu.AddMenuItem('Виноградник');
    menuItem.gpsX = -1887;
    menuItem.gpsY = 2051;

    menuItem = menu.AddMenuItem('Церковь Сэнди-Шорс');
    menuItem.gpsX = -324;
    menuItem.gpsY = 2817;

    menuItem = menu.AddMenuItem('Церковь Дель-Перро');
    menuItem.gpsX = -1681;
    menuItem.gpsY = -290;

    menuItem = menu.AddMenuItem('Rebel Radio');
    menuItem.gpsX = 732;
    menuItem.gpsY = 2523;

    menuItem = menu.AddMenuItem('Аэропорт Сэнди-Шорс');
    menuItem.gpsX = 1722;
    menuItem.gpsY = 3255;

    menuItem = menu.AddMenuItem('Озеро Аламо-Си');
    menuItem.gpsX = 1578;
    menuItem.gpsY = 3835;

    menuItem = menu.AddMenuItem('Аэропорт Грейпсид');
    menuItem.gpsX = 2138;
    menuItem.gpsY = 4812;

    menuItem = menu.AddMenuItem('Заповедник Сэнди-Шорс');
    menuItem.gpsX = -1638;
    menuItem.gpsY = 4725;

    menuItem = menu.AddMenuItem('Лесопилка Палето-Бэй');
    menuItem.gpsX = -565;
    menuItem.gpsY = 5325;

    menuItem = menu.AddMenuItem('Церковь Палето-Бэй');
    menuItem.gpsX = -329;
    menuItem.gpsY = 6150;

    menuItem = menu.AddMenuItem('Пирс Палето-Бэй');
    menuItem.gpsX = -213;
    menuItem.gpsY = 6572;

    menuItem = menu.AddMenuItem('Гора Чиллиад');
    menuItem.gpsX = 501;
    menuItem.gpsY = 5603;

    menuItem = menu.AddMenuItem('Гора Гордо');
    menuItem.gpsX = 2877;
    menuItem.gpsY = 5910;

    menuItem = menu.AddMenuItem('Карьер');
    menuItem.gpsX = 2906;
    menuItem.gpsY = 2803;

    menuItem = menu.AddMenuItem('Электростанция');
    menuItem.gpsX = 2661;
    menuItem.gpsY = 1641;

    menuItem = menu.AddMenuItem('Дамба');
    menuItem.gpsX = 1662;
    menuItem.gpsY = -13;

    menuItem = menu.AddMenuItem('Швейная фабрика');
    menuItem.gpsX = 718;
    menuItem.gpsY = -975;

    menuItem = menu.AddMenuItem('Литейный завод');
    menuItem.gpsX = 1083;
    menuItem.gpsY = -1974;

    menuItem = menu.AddMenuItem('Скотобойня');
    menuItem.gpsX = 961;
    menuItem.gpsY = -2185;

    menuItem = menu.AddMenuItem('Maze Bank Arena');
    menuItem.gpsX = -254;
    menuItem.gpsY = -2026;

    menuItem = menu.AddMenuItem('Завод по переработке отходов');
    menuItem.gpsX = -609;
    menuItem.gpsY = -1609;

    menuItem = menu.AddMenuItem('Цементный завод');
    menuItem.gpsX = 266;
    menuItem.gpsY = 2849;

    menuItem = menu.AddMenuItem('Центр переработки металлолома');
    menuItem.gpsX = 2340;
    menuItem.gpsY = 3136;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      if (item.gpsEvent != undefined) mp.events.callRemote(item.gpsEvent);
      else user.setWaypoint(item.gpsX, item.gpsY);
    });
  },

  showFuelMenu: function (shopId: number, isShop: boolean, price: number) {
    if (!isShop) return mp.events.callRemote('server:azs:openAzs');
    let menu = UIMenu.Menu.Create(`Заправка`, ` `);

    menu.AddMenuItem('Меню заправки').doName = 'showFuelMenu'

    if (isShop) menu.AddMenuItem('Меню магазина').doName = 'showShopMenu';


    let closeItem = menu.AddMenuItem('~r~Закрыть');

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex = 0;

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;
    });

    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName && item.doName == "showFuelMenu") mp.events.callRemote('server:azs:openAzs');
      else if (item.price > 0) mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
      else if (item.doName) menuList.showShopMenu(shopId, price);
    });
  },

  showHelpMenu: function () {
    phone.showFaqBrowser();
  },

  chatSettings: () => {
    let menu = UIMenu.Menu.Create(`Меню`, `~b~Настройки чата`);
    

    let fontChat:string[] = []
    for (let id = 0; id < 50; id++) fontChat.push((id+1)+"px")
    let heightChat:string[] = []
    for (let id = 0; id < 50; id++) heightChat.push((id+1)+"vh")

    menu.AddMenuItem('Очистить чат', 'Нажмите ~g~Enter~s~ чтобы применить').doName =
      'clearChat';

    let heightChatItem = menu.AddMenuItemList(
      'Высота чата',
      heightChat
    );
    heightChatItem.doName = 'heightChat';
    heightChatItem.Index = mp.storage.data.heightChat ? mp.storage.data.heightChat : 0;
    let fontChatItem = menu.AddMenuItemList(
      'Размер шрифта',
      fontChat
    );
    fontChatItem.doName = 'fontChat';
    fontChatItem.Index = mp.storage.data.fontChat ? mp.storage.data.fontChat : 0;

    let closeItem = menu.AddMenuItem('~r~Назад');
    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'heightChat') {
        mp.storage.data.heightChat = index+1;
        gui.updateChatSettings()
      }
      if (item.doName == 'fontChat') {
        mp.storage.data.fontChat = index+1;
        gui.updateChatSettings()
      }
    });
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) menuList.showSettingsMenu();

      if (item.doName == 'clearChat') {
        user.clearChat();
      }
    });
  },

  showSettingsMenu: function () {
    let menu = UIMenu.Menu.Create(`Меню`, `~b~Настройки`);

    let listVoiceType = ['Шепот', 'Нормально', 'Крик'];
    let listVoice3d = ['Вкл', 'Выкл'];
    let listVoiceVol = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
    let listRadioVol: string[] = [];
    for (let q = 0; q < 101; q++) listRadioVol.push(q + '%')

    //menu.AddMenuItem("Показывать интерфейс (~g~Вкл~s~/~r~Выкл~s~)", "Нажмите ~g~Enter~s~ чтобы применить").doName = 'showHud';
    if (methods.parseInt(user.get("exp_age")) > 0) {
      menu.AddMenuItem(
        '~r~Указать возраст персонажа',
        'Нажмите ~g~Enter~s~ чтобы указать'
      ).doName = 'setAge';
    }
    menu.AddMenuItem(
      'Показывать HUD (~g~Вкл~s~/~r~Выкл~s~)',
      'Нажмите ~g~Enter~s~ чтобы применить'
    ).doName = 'showRadar';
    menu.AddMenuItem(
      'Показывать ID игроков (~g~Вкл~s~/~r~Выкл~s~)',
      'Нажмите ~g~Enter~s~ чтобы применить'
    ).doName = 'showId';
    //menu.AddMenuItemList("Тип голосового чата", listVoiceType, "Нажмите ~g~Enter~s~ чтобы применить").doName = '';
    //menu.AddMenuItemList("Объем голосового чата", listVoice3d, "Нажмите ~g~Enter~s~ чтобы применить").doName = '';

    menu.AddMenuItem('Экспериментальные функции').eventName = 'server:user:testSetting';

    let listVoiceItem = menu.AddMenuItemList(
      'Громкость голосового чата',
      listVoiceVol,
      'Нажмите ~g~Enter~s~ чтобы применить'
    );
    listVoiceItem.doName = 'vol';
    listVoiceItem.Index = methods.parseInt(user.get('s_voice_vol') * 10);
    let listRadioItem = menu.AddMenuItemList(
      'Громкость радиостанции',
      listRadioVol,
      'Нажмите ~g~Enter~s~ чтобы применить'
    );
    listRadioItem.doName = 'volRadio';
    listRadioItem.Index = user.audioRadioVolume;

    menu.AddMenuItem(
      '~y~Перезагрузить голосовой чат',
      'Нажмите ~g~Enter~s~ чтобы применить'
    ).doName = 'restartVoice';

    menu.AddMenuItem('Настройки чата', 'Нажмите ~g~Enter~s~ чтобы применить').doName =
      'setchat';
    menu.AddMenuItem(
      '~y~Пофиксить кастомизацию',
      '~r~Ваше экипированное оружие исчезнет!'
    ).doName = 'fixCustom';
    menu.AddMenuItem(
      '~y~Вкл. / Выкл. доп. прогрузку моделей',
      '~r~Возможно слегка повлияет на FPS'
    ).doName = 'loadAllModels';
    //menu.AddMenuItem("~y~Вкл. / Выкл. доп. прогрузку ТС", "~r~Возможно слегка может повлиять на ФПС").doName = 'loadAllVeh';
    menu.AddMenuItem('~b~Промокод', 'Нажмите ~g~Enter~s~ чтобы применить').doName =
      'enterPromocode';
    if (user.get('job') != '')
      menu.AddMenuItem('~b~Топ 20 активных работяг').eventName =
        'server:user:showJobSkillTopMenu';
    menu.AddMenuItem('~r~Выйти с сервера', 'Нажмите ~g~Enter~s~ чтобы применить').doName =
      'exit';


    let voiceVol = 1;
    let radioVol = 1;
    menu.ListChange.on(async (item, index) => {
      if (item.doName == 'vol') {
        voiceVol = index / 10;

        user.setData('s_voice_vol', voiceVol);
        // voice.setSettings('voiceVolume', voiceVol);
        mp.game.ui.notifications.show('~b~Вы установили значение: ~s~' + voiceVol * 100 + '%');
      }
      if (item.doName == 'volRadio') {
        user.audioRadioVolume = index;
        mp.game.ui.notifications.show('~b~Вы установили значение: ~s~' + index + '%', 500);
        phone.updateRadioVolume();
      }
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();

      if (item.doName == 'vol') {
        user.setData('s_voice_vol', voiceVol);
        // voice.setSettings('voiceVolume', voiceVol);
        mp.game.ui.notifications.show('~b~Вы установили значение: ~s~' + (voiceVol * 100) + '%');
      }
      if (item.doName == 'setchat') {
        menuList.chatSettings()
      }
      if (item.doName == 'loadAllVeh') {
        timer.allVehiclesLoader();
      }
      if (item.doName == 'loadAllModels') {
        timer.allModelLoader();
      }
      if (item.doName == 'showId') {
        mp.events.call('client:showId');
      }
      if (item.doName == 'showHud') {
        ui.showOrHideHud();
      }
      if (item.doName == 'setAge') {
        mp.events.callRemote("setAge")
      }
      if (item.doName == 'showRadar') {
        ui.showOrHideRadar();
      }
      if (item.doName == 'restartVoice') {
        restartVoice()
      }
      if (item.doName == 'exit') {
        user.kick('Выход с сервера');
      }
      if (item.doName == 'enterPromocode') {
        let promocode = await UIMenu.Menu.GetUserInput('Введите промокод', '', 20);
        if (promocode == '') return;
        mp.events.callRemote('server:activatePromocode', promocode);
      }
      if (item.doName == 'fixCustom') {
        UIMenu.Menu.HideMenu();
        if (user.get('jail_time') > 0) return;
        user.updateCharacterFace();
        user.updateCharacterCloth();
      }
      if (item.eventName) {
        UIMenu.Menu.HideMenu();
        mp.events.callRemote(item.eventName);
      }
    });
  },

  showJobBuilderMenu: function () {
    let menu = UIMenu.Menu.Create('Прораб', '~b~Выберите пункт меню');
    let startEndItem = menu.AddMenuItem('~g~Начать/~r~Закончить~s~ рабочий день');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) builder.startOrEnd();
    });
  },

  showJobCleanerMenu: function () {
    let menu = UIMenu.Menu.Create('Прораб', '~b~Выберите пункт меню');
    let startEndItem = menu.AddMenuItem('~g~Начать/~r~Закончить~s~ рабочий день');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) cleaner.startOrEnd();
    });
  },

  showJobRoadWorkerMenu: function () {
    let menu = UIMenu.Menu.Create('Прораб', '~b~Выберите пункт меню');
    let startEndItem = menu.AddMenuItem('~g~Начать/~r~Закончить~s~ рабочий день');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) roadWorker.startOrEnd();
    });
  },

  showJobMainerMenu: function () {
    let menu = UIMenu.Menu.Create('Прораб', '~b~Выберите пункт меню');
    let startEndItem = menu.AddMenuItem('~g~Начать/~r~Закончить~s~ рабочий день');
    //let moneyItem = menu.AddMenuItem("Забрать деньги");
    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == startEndItem) mainer.startOrEnd();
    });
  },

  walkstyleMenu: function () {
    let menu = new MenuClass("Походки", "Список категорий");
    if(mp.players.local.getVariable('walkstyle')){
      menu.newItem({
        name: "Сбросить походку",
        onpress: () => {
          user.setVariable('walkstyle', null);
          user.notify('~g~Вы сбросили стиль походки')
          menuList.walkstyleMenu()
        }
      })
    }
    for (let cat in walkstylesList){
      let data = (walkstylesList as any)[cat] as [string, string][];
      menu.newItem({
        name: cat,
        more: `x${data.length}`,
        onpress: () => {
          let submenu = new MenuClass(cat, "Список походок");
          data.map(item => {
            let style = (user.isMale() ? "move_m@" : "move_f@") + item[1]
            submenu.newItem({
              name: item[0],
              more: style == mp.players.local.getVariable('walkstyle') ? "~g~Выбрано" : "Выбрать",
              onpress: () => {
                user.setVariable('walkstyle', (user.isMale() ? "move_m@" : "move_f@") +item[1]);
                user.notify('~g~Вы сменили стиль походки')
              }
            })
          })
          submenu.open()
        }
      })
    }
    
    menu.open();
    
  },

  showAnimationTypeListMenu: function () {
    let menu = UIMenu.Menu.Create(`Анимации`, `~b~Меню анимаций`);

    let walkStyle = menu.AddMenuItem('Походки');
    let animActionItem = menu.AddMenuItem('Анимации действий');
    let animPoseItem = menu.AddMenuItem('Позирующие анимации');
    let animPositiveItem = menu.AddMenuItem('Положительные эмоции');
    let animNegativeItem = menu.AddMenuItem('Негативные эмоции');
    let animDanceItem = menu.AddMenuItem('Танцы');
    let animOtherItem = menu.AddMenuItem('Остальные анимации');
    let animSyncItem = menu.AddMenuItem('Взаимодействие');
    let animStopItem = menu.AddMenuItem('~y~Остановить анимацию');

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      else if (item == walkStyle) menuList.walkstyleMenu();
      else if (item == animStopItem) user.stopAllAnimation();
      else if (item == animOtherItem) menuList.showAnimationOtherListMenu();
      else if (item == animSyncItem) menuList.showAnimationSyncListMenu();
      else if (item == animActionItem)
        menuList.showAnimationListMenu('Анимации действий', enums.animActions);
      else if (item == animDanceItem) menuList.showAnimationListMenu('Танцы', enums.animDance);
      else if (item == animNegativeItem)
        menuList.showAnimationListMenu('Негативные эмоции', enums.animNegative);
      else if (item == animPositiveItem)
        menuList.showAnimationListMenu('Положительные эмоции', enums.animPositive);
      else if (item == animPoseItem)
        menuList.showAnimationListMenu('Позирующие анимации', enums.animPose);
    });
  },

  showAnimationListMenu: function (subtitle: string, array: any[][]) {
    let menu = UIMenu.Menu.Create(`Анимации`, `~b~${subtitle}`);

    array.forEach(function (item, i, arr) {
      let menuItem = menu.AddMenuItem(`${item[0]}`);
      menuItem.anim1 = item[1];
      menuItem.anim2 = item[2];
      menuItem.animFlag = item[3];
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }

      /*
          .addMenuItem("Сидеть-1", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@generic@base", "base", true)
          .addMenuItem("Сидеть-2", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@elbows_on_knees@base", "base", true)
          .addMenuItem("Сидеть-3", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@left_elbow_on_knee@base", "base", true)
          .addMenuItem("Сидеть-4", "", false, true, "callServerTrigger", "anim_user", "amb@prop_human_seat_chair@male@right_foot_out@base", "base", true)
          * */

      let plPos = mp.players.local.position;

      if (
        item.anim1 == 'amb@prop_human_seat_chair@male@generic@base' ||
        item.anim1 == 'amb@prop_human_seat_chair@male@right_foot_out@base' ||
        item.anim1 == 'amb@prop_human_seat_chair@male@left_elbow_on_knee@base' ||
        item.anim1 == 'amb@prop_human_seat_chair@male@elbows_on_knees@base'
      ) {
        mp.players.local.freezePosition(true);
        mp.players.local.setCollision(false, false);
        if (!Container.HasLocally(0, 'hasSeat'))
          mp.players.local.position = new mp.Vector3(plPos.x, plPos.y, plPos.z - 0.95);
        Container.SetLocally(0, 'hasSeat', true);
      } else if (Container.HasLocally(0, 'hasSeat')) {
        mp.players.local.freezePosition(false);
        mp.players.local.setCollision(true, true);
        mp.players.local.position = new mp.Vector3(plPos.x, plPos.y, plPos.z + 0.95);
        Container.ResetLocally(0, 'hasSeat');
      }

      mp.game.ui.notifications.show('~b~Нажмите ~s~F10~b~ чтобы отменить анимацию');
      user.playAnimation(item.anim1, item.anim2, item.animFlag);
    });
  },

  showAnimationOtherListMenu: function () {
    let menu = UIMenu.Menu.Create(`Анимации`, `~b~Остальные анимации`);

    /*enums.scenarios.forEach(function (item, i, arr) {
          let menuItem = menu.AddMenuItem(`${item[0]}`);
          menuItem.scenario = item[1];
      });*/

    enums.animRemain.forEach(function (item, i, arr) {
      let menuItem = menu.AddMenuItem(`${item[0]}`);
      menuItem.anim1 = item[1];
      menuItem.anim2 = item[2];
      menuItem.animFlag = item[3];
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }
      mp.game.ui.notifications.show('~b~Нажмите ~s~F10~b~ чтобы отменить анимацию');
      if (item.scenario != undefined) user.playScenario(item.scenario);
      else user.playAnimation(item.anim1, item.anim2, item.animFlag);
    });
  },

  showAnimationSyncListMenu: function () {
    let menu = UIMenu.Menu.Create(`Анимации`, `~b~Взаимодействие`);

    menu.AddMenuItem(`Подзороваться 1`).animId = 0;
    menu.AddMenuItem(`Поздороваться 2`).animId = 2;
    menu.AddMenuItem(`Дать пять`).animId = 1;
    menu.AddMenuItem(`Поцелуй`).animId = 3;
    //menu.AddMenuItem(`Минет`).animId = 4;
    //menu.AddMenuItem(`Секс`).animId = 5;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      if (item == closeItem) {
        UIMenu.Menu.HideMenu();
        return;
      }

      let playerId = methods.parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 9));
      if (playerId < 0) {
        mp.game.ui.notifications.show('~r~ID Игркоа не может быть меньше нуля');
        return;
      }
      user.playAnimationWithUser(playerId, item.animId);
    });
  },

  

  showMazeOfficeTeleportMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `~b~Maze Bank Лифт`, false, false, false, 'maze_bank', 'maze_bank');

    let BankMazeLiftOfficePos = new mp.Vector3(-77.77799, -829.6542, 242.7859);
    let BankMazeLiftStreetPos = new mp.Vector3(-66.66476, -802.0474, 43.22729);
    let BankMazeLiftRoofPos = new mp.Vector3(-67.13605, -821.9, 320.2874);
    let BankMazeLiftGaragePos = new mp.Vector3(-84.9765, -818.7122, 35.02804);

    menu.AddMenuItem('Гараж').teleportPos = BankMazeLiftGaragePos;
    menu.AddMenuItem('Офис').teleportPos = BankMazeLiftOfficePos;
    menu.AddMenuItem('Улица').teleportPos = BankMazeLiftStreetPos;
    menu.AddMenuItem('Крыша').teleportPos = BankMazeLiftRoofPos;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      user.teleportv(item.teleportPos);
    });
  },

  showFibOfficeTeleportMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(`Fib`, `~b~Лифт`);

    let FibLift0StationPos = new mp.Vector3(122.9873, -741.1865, 32.13323);
    let FibLift1StationPos = new mp.Vector3(136.2213, -761.6816, 44.75201);
    let FibLift2StationPos = new mp.Vector3(136.2213, -761.6816, 241.152);
    let FibLift3StationPos = new mp.Vector3(114.9807, -741.8279, 257.1521);
    let FibLift4StationPos = new mp.Vector3(141.4099, -735.3376, 261.8516);

    menu.AddMenuItem('Гараж').teleportPos = FibLift0StationPos;
    menu.AddMenuItem('1 этаж').teleportPos = FibLift1StationPos;
    menu.AddMenuItem('49 этаж').teleportPos = FibLift2StationPos;
    menu.AddMenuItem('52 этаж').teleportPos = FibLift3StationPos;
    menu.AddMenuItem('Крыша').teleportPos = FibLift4StationPos;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      user.teleportv(item.teleportPos);
    });
  },

  showGovOfficeTeleportMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(`Правительство`, `~b~Лифт`);

    let MeriaUpPos = new mp.Vector3(-1395.997, -479.8439, 71.04215);
    let MeriaDownPos = new mp.Vector3(-1379.659, -499.748, 32.15739);
    let MeriaRoofPos = new mp.Vector3(-1369, -471.5994, 83.44699);
    let MeriaGarPos = new mp.Vector3(-1360.679, -471.8841, 30.59572);

    menu.AddMenuItem('Гараж').teleportPos = MeriaGarPos;
    menu.AddMenuItem('Офис').teleportPos = MeriaUpPos;
    menu.AddMenuItem('Улица').teleportPos = MeriaDownPos;
    menu.AddMenuItem('Крыша').teleportPos = MeriaRoofPos;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      user.teleportv(item.teleportPos);
    });
  },

  showMeriaMainMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `Секретарь правительства`, false, false, false, 'suemurry_background_left', 'suemurry_background_left');

    menu.AddMenuItem('Лицензия таксиста', 'Цена: ~g~$500').doName = 'getTaxiLic';
    menu.AddMenuItem('Оформить регистрацию', 'Оформление регистрации на 6 месяцев').doName =
      'getRegister';
    menu.AddMenuItem('Трудовая биржа').doName = 'showMeriaJobListMenu';
    menu.AddMenuItem('Оформить пособие').doName = 'getPosob';
    menu.AddMenuItem('Оформить пенсию').doName = 'getMoneyOld';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.doName == 'showMeriaJobListMenu') menuList.showMeriaJobListMenu();
      if (item.doName == 'getTaxiLic') {
        if (user.get('reg_status') == 0) {
          mp.game.ui.notifications.show('~r~У Вас нет регистрации');
          return;
        }
        if (user.getLevel() < levelAccess.taxiLic) {
          mp.game.ui.notifications.show('~r~Вы должны достичь ' + levelAccess.taxiLic + ' уровня');
          return;
        }
        licenseCenter.buy('taxi_lic', 500);
      }
      if (item.doName == 'getRegister') {
        if (user.get('reg_status') > 1) {
          mp.game.ui.notifications.show('~r~Вам не нужна регистрация');
          return;
        }
        user.setData('reg_status', 1);
        user.setData('reg_time', 186);
        mp.game.ui.notifications.show('~g~Вы получили регистрацию на ~s~6 мес.');
      }
      if (item.doName == 'getPosob') {
        if (
          user.get('job') == '' &&
          ((user.get('fraction_id') > 7 && user.get('fraction_id') < 15) ||
            user.get('fraction_id') == 0)
        ) {
          mp.game.ui.notifications.show('~g~Вы оформили пособие');
          user.setData('posob', true);
          return;
        }
        user.setData('posob', false);
        mp.game.ui.notifications.show('~r~Вам было отказано в оформлении пособия');
      }
      if (item.doName == 'getMoneyOld') {
        if (user.getLevel() >= levelAccess.oldmoney) {
          mp.game.ui.notifications.show('~g~Вы оформили пенсию');
          user.setData('is_old_money', true);
          return;
        }
        user.setData('is_old_money', false);
        mp.game.ui.notifications.show('~r~Пенсия доступна с ' + levelAccess.oldmoney + ' уровня');
      }
    });
  },


  showMeriaJobListMenu: function () {
    let menu = UIMenu.Menu.Create(`Секретарь`, `~b~Трудовая биржа`);

    menu.AddMenuItem('Уборщик квартир', 'Компания: ~y~Sunset Bleach').jobName = 'sunb';
    menu.AddMenuItem('Дезинсектор', 'Компания: ~y~Bugstars').jobName = 'bgstar';
    menu.AddMenuItem('Доставщик еды', 'Компания: ~y~BurgerShot').jobName = 'bshot';
    menu.AddMenuItem('Мехатроник', 'Компания: ~y~Water & Power').jobName = 'water';

    menu.AddMenuItem('Садовник', "Компания: ~y~O'Connor").jobName = 'three';
    menu.AddMenuItem('Фотограф', 'Компания: ~y~LifeInvader').jobName = 'photo';

    menu.AddMenuItem('Почтальон (PostOp)', 'Компания: ~y~PostOp').jobName = 'mail';
    menu.AddMenuItem('Почтальон (GoPostal)', 'Компания: ~y~GoPost').jobName = 'mail2';

    menu.AddMenuItem('Таксист (DT Cab Co.)', 'Компания: ~y~DownTown Cab Co.').jobName =
      'taxi1';
    menu.AddMenuItem('Таксист (Express C.S.)', 'Компания: ~y~Express C.S.').jobName = 'taxi2';
    menu.AddMenuItem('Водитель автобуса-1', 'Городской автобус').jobName = 'bus1';
    menu.AddMenuItem('Водитель автобуса-2', 'Трансферный автобус').jobName = 'bus2';
    menu.AddMenuItem('Водитель автобуса-3', 'Рейсовый автобус').jobName = 'bus3';
    if (!user.isGos() && !user.isGang()){
      menu.AddMenuItem('Инкассатор', 'Компания: ~y~Gruppe6').jobName = 'gr6';
      menu.AddMenuItem('Грузоперевозки').doName = 'showTruckerMenu';
    }
    menu.AddMenuItem('Юрист').doName = 'showLawerMenu';
    //menu.AddMenuItem("Учёный - Гидролог", "Компания: ~y~Humane Labs").jobName = 'sground';
    //menu.AddMenuItem("Учёный - Биолог", "Компания: ~y~Humane Labs").jobName = 'swater';
    menu.AddMenuItem('~y~Уволиться с работы').doName = 'uninvite';
    menu.AddMenuItem('~y~Уволиться из неоф. организации', 'Уволиться из неоф. организации').doName =
      'uninviteFraction';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      else if (item.doName == 'uninvite') {
        user.setData('job', '');
        mp.game.ui.notifications.show('~y~Вы уволились с работы');
      }
      else if (item.doName == 'uninviteFraction') {
        if (!user.isLeader2()) {
          user.setData('fraction_id2', 0);
          user.setData('rank2', 0);
          mp.game.ui.notifications.show('~y~Вы уволились из организации');
        }
      } else {
        if (user.isGos()) return mp.game.ui.notifications.show('~y~Вы не можете устроится на работу');
      }
      if (item.doName == 'showTruckerMenu') {
        menuList.showMeriaJobTruckerListMenu();
      }
      if (item.doName == 'showLawerMenu') {
        menuList.showMeriaJobLawerListMenu();
      }
      if (item.jobName) {
        if (user.get('reg_status') == 0) {
          mp.game.ui.notifications.show('~r~У Вас нет регистрации');
          return;
        }
        if (!user.get('b_lic')) {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии категории B');
          return;
        }
        if (
          user.getLevel() < 2 &&
          (item.jobName == 'three' || item.jobName == 'photo')
        ) {
          mp.game.ui.notifications.show('~r~Доступно со второго уровня');
          return;
        }
        if (
          user.getLevel() < 2 &&
          (item.jobName == 'mail1' || item.jobName == 'mail2')
        ) {
          mp.game.ui.notifications.show('~r~Доступно со второго уровня');
          return;
        }
        if (
          user.getLevel() < 2 &&
          (item.jobName == 'bus1' || item.jobName == 'bus2' || item.jobName == 'bus3')
        ) {
          mp.game.ui.notifications.show('~r~Доступно со второго уровня');
          return;
        }
        if (!user.get('gun_lic') && item.jobName == 'gr6') {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии на оружие');
          return;
        }
        if (!user.get('c_lic') && item.jobName == 'gr6') {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии категории С');
          return;
        }
        if (user.getLevel() < levelAccess.gr6 && item.jobName == 'gr6') {
          mp.game.ui.notifications.show('~r~Вы должны достичь ' + levelAccess.gr6 + ' уровня');
          return;
        }
        if (!user.get('taxi_lic') && (item.jobName == 'taxi1' || item.jobName == 'taxi2')) {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии таксиста');
          return;
        }

        if (user.getLevel() < levelAccess.swater && (item.jobName == 'swater' || item.jobName == 'sground')) {
          mp.game.ui.notifications.show('~r~Вы должны быть иметь уровень ' + levelAccess.swater);
          return;
        }

        if (user.isGos()) {
          mp.game.ui.notifications.show('~r~Вы не должны быть в гос фракции');
          return;
        }

        user.setData('posob', false);
        user.setData('job', item.jobName);
        mp.game.ui.notifications.show('~g~Вы устроились на работу');
        user.saveAccount();
      }
    });
  },

  showMeriaJobTruckerListMenu: function () {
    let menu = UIMenu.Menu.Create(`Секретарь`, `~b~Грузоперевозки`);

    menu.AddMenuItem('На фургонах', 'Компании: ~y~PostOp~s~ | ~y~GoPostal').jobName =
      'trucker1';
    menu.AddMenuItem(
      'На грузовиках',
      'Компании: ~y~Bilgeco~s~ | ~y~Jetsam~s~ | ~y~Lando-Corp'
    ).jobName = 'trucker2';
    menu.AddMenuItem(
      'На фурах',
      'Компании: ~y~Bilgeco~s~ | ~y~Jetsam~s~ | ~y~Lando-Corp'
    ).jobName = 'trucker3';
    menu.AddMenuItem('~y~Уволиться с работы').doName = 'uninvite';
    menu.AddMenuItem('~y~Уволиться из неоф. организации', 'Уволиться из неоф. организации').doName =
      'uninviteFraction';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      else if (item.doName == 'uninvite') {
        user.setData('job', '');
        mp.game.ui.notifications.show('~y~Вы уволились с работы');
      }
      else if (item.doName == 'uninviteFraction') {
        if (!user.isLeader2()) {
          user.setData('fraction_id2', 0);
          user.setData('rank2', 0);
          mp.game.ui.notifications.show('~y~Вы уволились из организации');
        }
      } else {
        if (user.isGos()) return mp.game.ui.notifications.show('~y~Вы не можете устроится на работу');
      }
      if (item.jobName) {
        if (user.get('reg_status') == 0) {
          mp.game.ui.notifications.show('~r~У Вас нет регистрации');
          return;
        }
        if (!user.get('b_lic')) {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии категории B');
          return;
        }
        if (!user.get('c_lic')) {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии категории C');
          return;
        }
        if (user.getLevel() < levelAccess.truckerjob) {
          mp.game.ui.notifications.show('~r~Вы должны достичь уровня: ' + levelAccess.truckerjob);
          return;
        }
        if (user.get('skill_trucker') < 500 && item.jobName == 'trucker2') {
          mp.game.ui.notifications.show('~r~Навык дальнобойщика должен быть не менее 33%');
          return;
        }
        if (user.get('skill_trucker') < 1000 && item.jobName == 'trucker3') {
          mp.game.ui.notifications.show('~r~Навык дальнобойщика должен быть не менее 66%');
          return;
        }
        user.setData('posob', false);
        user.setData('job', item.jobName);
        mp.game.ui.notifications.show('~g~Вы устроились на работу');
        user.saveAccount();
      }
    });
  },

  showMeriaJobLawerListMenu: async function () {
    let pricent1 = (await business.getPrice(58)) * 10;
    let pricent2 = (await business.getPrice(58)) * 10;
    let pricent3 = (await business.getPrice(58)) * 10;

    let menu = UIMenu.Menu.Create(`Секретарь`, `~b~Выберите компанию`);

    menu.AddMenuItem(
      'Slaughter, Slaughter & Slaughter',
      `Процентная ставка: ~y~${pricent1}%`
    ).jobName = 'lawyer1';
    menu.AddMenuItem('Bullhead', `Процентная ставка: ~y~${pricent2}%`).jobName = 'lawyer2';
    menu.AddMenuItem('Pearson Specter', `Процентная ставка: ~y~${pricent3}%`).jobName =
      'lawyer3';

    menu.AddMenuItem('~y~Уволиться с работы').doName = 'uninvite';
    menu.AddMenuItem('~y~Уволиться из неоф. организации', 'Уволиться из неоф. организации').doName =
      'uninviteFraction';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.doName == 'uninvite') {
        user.setData('job', '');
        mp.game.ui.notifications.show('~y~Вы уволились с работы');
      }
      if (item.doName == 'uninviteFraction') {
        if (!user.isLeader2()) {
          user.setData('fraction_id2', 0);
          user.setData('rank2', 0);
          mp.game.ui.notifications.show('~y~Вы уволились из организации');
        }
      }
      if (item.jobName) {
        if (user.get('reg_status') != 3) {
          mp.game.ui.notifications.show('~r~У Вас нет гражданства США');
          return;
        }
        if (!user.get('law_lic')) {
          mp.game.ui.notifications.show('~r~У Вас нет лицензии юриста');
          return;
        }
        if (user.getLevel() < levelAccess.companyWork) {
          mp.game.ui.notifications.show('~r~Минимум уровень ' + levelAccess.companyWork);
          return;
        }
        user.setData('posob', false);
        user.setData('job', item.jobName);
        mp.game.ui.notifications.show('~g~Вы устроились на работу');
        user.saveAccount();
      }
    });
  },

  showMazeOfficeMenu: function () {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `~b~Офис государственного банка "~r~Maze~b~"`, false, false, false, 'maze_bank', 'maze_bank');

    menu.AddMenuItem('Имущество', 'Операции с вашим имуществом').doName =
      'showMazeBankOfficeSellHvbMenu';
    if (user.get('id_house') > 0)
      menu.AddMenuItem('Жилищный вопрос', 'Операции с вашими жильцами').doName =
        'showMazeBankHousePeopleMenu';
    menu.AddMenuItem('Налоговый кабинет').doName = 'showMazeBankOfficeTaxMenu';
    menu.AddMenuItem('Банк').doName = 'showBankMenu';

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.doName == 'showBankMenu') menuList.showBankMenu(0, 10);
      if (item.doName == 'showMazeBankOfficeSellHvbMenu')
        menuList.showMazeBankOfficeSellHvbMenu(await coffer.getAllData());
      if (item.doName == 'showMazeBankOfficeTaxMenu') menuList.showMazeBankOfficeTaxMenu();
      if (item.doName == 'showMazeBankHousePeopleMenu') menuList.showMazeBankHousePeopleMenu();
    });
  },

  showMazeBankOfficeSellHvbMenu: function (cofferData: Map<string, any>) {
    //TODO BLACKOUT

    user.updateCache().then(function () {
      let menu = UIMenu.Menu.Create(
        `Maze`,
        `~b~Текущая налоговая ставка: ~s~${cofferData.get('cofferNalog')}%`
      );

      if (user.get('id_house') > 0) {
        menu.AddMenuItem('Продать дом', 'Продать дом государству, с учетом налога').eventName =
          'server:houses:sell';
        menu.AddMenuItem('~y~Продать дом игроку').eventNameSell = 'server:houses:sellToPlayer';
      }
      if (user.get('condo_id') > 0) {
        menu.AddMenuItem(
          'Продать квартиру',
          'Продать квартиру государству, с учетом налога'
        ).eventName = 'server:condo:sell';
        menu.AddMenuItem('~y~Продать квартиру игроку').eventNameSell =
          'server:condo:sellToPlayer';
      }
      if (user.get('apartment_id') > 0) {
        menu.AddMenuItem(
          'Продать апартаменты',
          'Продать апартаменты государству, с учетом налога'
        ).eventName = 'server:apartments:sell';
        menu.AddMenuItem('~y~Продать апартаменты игроку').eventNameSell =
          'server:apartments:sellToPlayer';
      }
      if (user.get('business_id') > 0) {
        menu.AddMenuItem(
          'Продать бизнес',
          'Продать бизнес государству, с учетом налога'
        ).eventName = 'server:business:sell';
        menu.AddMenuItem('~y~Продать бизнес игроку').eventNameSell =
          'server:business:sellToPlayer';
      }
      if (user.get('stock_id') > 0) {
        menu.AddMenuItem(
          'Продать склад',
          'Продать склад государству, с учетом налога'
        ).eventName = 'server:stock:sell';
        menu.AddMenuItem('~y~Продать склад игроку').eventNameSell =
          'server:stock:sellToPlayer';
      }

      //TODO в идеале вывести марку и номер транспорта, не только слот.
      if (user.get('car_id1') > 0) {
        menu.AddMenuItem(
          'Продать ТС #1',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car1:sell';
        menu.AddMenuItem('~y~Продать ТС #1 игроку').eventNameSell = 'server:car1:sellToPlayer';
      }
      if (user.get('car_id2') > 0) {
        menu.AddMenuItem(
          'Продать ТС #2',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car2:sell';
        menu.AddMenuItem('~y~Продать ТС #2 игроку').eventNameSell = 'server:car2:sellToPlayer';
      }
      if (user.get('car_id3') > 0) {
        menu.AddMenuItem(
          'Продать ТС #3',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car3:sell';
        menu.AddMenuItem('~y~Продать ТС #3 игроку').eventNameSell = 'server:car3:sellToPlayer';
      }
      if (user.get('car_id4') > 0) {
        menu.AddMenuItem(
          'Продать ТС #4',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car4:sell';
        menu.AddMenuItem('~y~Продать ТС #4 игроку').eventNameSell = 'server:car4:sellToPlayer';
      }
      if (user.get('car_id5') > 0) {
        menu.AddMenuItem(
          'Продать ТС #5',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car5:sell';
        menu.AddMenuItem('~y~Продать ТС #5 игроку').eventNameSell = 'server:car5:sellToPlayer';
      }
      if (user.get('car_id6') > 0) {
        menu.AddMenuItem(
          'Продать ТС #6',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car6:sell';
        menu.AddMenuItem('~y~Продать ТС #6 игроку').eventNameSell = 'server:car6:sellToPlayer';
      }
      if (user.get('car_id7') > 0) {
        menu.AddMenuItem(
          'Продать ТС #7',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car7:sell';
        menu.AddMenuItem('~y~Продать ТС #7 игроку').eventNameSell = 'server:car7:sellToPlayer';
      }
      if (user.get('car_id8') > 0) {
        menu.AddMenuItem(
          'Продать ТС #8',
          'Продать транспорт государству.\nНалог: ~g~' + (cofferData.get('cofferNalog') + 20) + '%'
        ).eventName = 'server:car8:sell';
        menu.AddMenuItem('~y~Продать ТС #8 игроку').eventNameSell = 'server:car8:sellToPlayer';
      }

      let closeItem = menu.AddMenuItem('~r~Закрыть');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item == closeItem) return;

        if (item.eventName) {
          menuList.showMazeAcceptSellMenu(item.eventName);
        }
        if (item.eventNameSell) {
          if (Container.HasLocally(mp.players.local.remoteId, 'isSellTimeout')) {
            mp.game.ui.notifications.show('~r~Таймаут 1 минута');
            //return;
          }

          let playerId = methods.parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 9));
          if (playerId < 0) {
            mp.game.ui.notifications.show('~r~ID Игркоа не может быть меньше нуля');
            return;
          }
          let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
          if (sum < 0) {
            mp.game.ui.notifications.show('~r~Сумма не может быть меньше нуля');
            return;
          }

          if (item.eventNameSell == 'server:car1:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 1);
          else if (item.eventNameSell == 'server:car2:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 2);
          else if (item.eventNameSell == 'server:car3:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 3);
          else if (item.eventNameSell == 'server:car4:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 4);
          else if (item.eventNameSell == 'server:car5:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 5);
          else if (item.eventNameSell == 'server:car6:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 6);
          else if (item.eventNameSell == 'server:car7:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 7);
          else if (item.eventNameSell == 'server:car8:sellToPlayer')
            mp.events.callRemote('server:car:sellToPlayer', playerId, sum, 8);
          else mp.events.callRemote(item.eventNameSell, playerId, sum);

          Container.SetLocally(mp.players.local.remoteId, 'isSellTimeout', true);

          setTimeout(function () {
            Container.ResetLocally(mp.players.local.remoteId, 'isSellTimeout');
          }, 1000 * 60);
        }
      });
    });
  },

  showMazeBankHousePeopleMenu: function () {
    //TODO BLACKOUT

    user.updateCache().then(function () {
      let menu = UIMenu.Menu.Create(`Maze`, `~b~Жилищный вопрос`);

      if (user.get('id_house') > 0) {
        menu.AddMenuItem(
          'Подселить игрока в дом',
          'Стоимость ~g~$50.000\n~s~Через юристов ~g~$10.000'
        ).eventName = 'server:houses:addUser';
        menu.AddMenuItem('Список жильцов').eventName = 'server:houses:userList';
        menu.AddMenuItem('~y~Выселиться', 'Стоимость ~g~$1.000').eventName =
          'server:houses:removeMe';
      }

      let closeItem = menu.AddMenuItem('~r~Закрыть');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item == closeItem) return;

        if (item.eventName == 'server:houses:addUser') {
          let playerId = methods.parseInt(await UIMenu.Menu.GetUserInput('ID Игрока', '', 9));
          if (playerId < 0) {
            mp.game.ui.notifications.show('~r~ID Игрока не может быть меньше нуля');
            return;
          }
          mp.events.callRemote(item.eventName, playerId);
        } else if (item.eventName) {
          mp.events.callRemote(item.eventName);
        }
      });
    });
  },

  showMazeBankHousePeopleListMenu: function (data: [number, string][]) {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(`Жилье`, `~b~Список жильцов`);

    data.forEach(function (item) {
      let userId = methods.parseInt(item[0]);
      if (userId == user.get('id')) menu.AddMenuItem(`${item[1]} (${item[0]})`);
      else menu.AddMenuItem(`${item[1]} (${item[0]})`).eventParam = userId;
    });

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventParam) menuList.showMazeBankHousePeopleListDoMenu(item.eventParam);
    });
  },

  showMazeBankHousePeopleListDoMenu: function (id: number) {
    let menu = UIMenu.Menu.Create(`Жилье`, `~b~` + id);

    menu.AddMenuItem(`~r~Выселить по цене $1.000`).eventName = 'server:house:removeId';

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on((item) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:house:removeId') {
        mp.events.callRemote(item.eventName, id);
      }
    });
  },

  showMazeAcceptSellMenu: function (eventName: string) {
    let menu = UIMenu.Menu.Create(`Maze`, `~b~Вы точно хотите продать?`);

    menu.AddMenuItem('~y~Продать').eventName = eventName;
    let closeItem = menu.AddMenuItem('~r~Отменить');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.eventName) mp.events.callRemote(item.eventName);
    });
  },

  showMazeBankOfficeTaxMenu: function () {
    //TODO BLACKOUT

    user.updateCache().then(function () {
      let menu = UIMenu.Menu.Create(`Maze`, `~b~Налоговый кабинет`);

      // menu.AddMenuItem('Оплатить налог по номеру счёта').eventName = 'server:tax:payTax';

      if (user.get('id_house') > 0) {
        let menuItem = menu.AddMenuItem('Налог за дом');
        menuItem.itemId = user.get('id_house');
        menuItem._type = 0;
      }
      if (user.get('condo_id') > 0) {
        let menuItem = menu.AddMenuItem('Налог за квартиру');
        menuItem.itemId = user.get('condo_id');
        menuItem._type = 5;
      }
      if (user.get('apartment_id') > 0) {
        let menuItem = menu.AddMenuItem('Налог за апартаменты');
        menuItem.itemId = user.get('apartment_id');
        menuItem._type = 3;
      }
      if (user.get('business_id') > 0) {
        let menuItem = menu.AddMenuItem('Налог за бизнес');
        menuItem.itemId = user.get('business_id');
        menuItem._type = 2;
      }
      if (user.get('stock_id') > 0) {
        let menuItem = menu.AddMenuItem('Налог за склад');
        menuItem.itemId = user.get('stock_id');
        menuItem._type = 4;
      }

      for (let i = 1; i < 9; i++) {
        if (user.get('car_id' + i) > 0) {
          let menuItem = menu.AddMenuItem('Налог за ТС #' + i);
          menuItem.itemId = user.get('car_id' + i);
          menuItem._type = 1;
        }
      }

      let closeItem = menu.AddMenuItem('~r~Закрыть');
      menu.ItemSelect.on(async (item, index) => {
        UIMenu.Menu.HideMenu();
        if (item == closeItem) return;

        // if (item.eventName) {
        //   let number = methods.parseInt(await UIMenu.Menu.GetUserInput('Счёт', '', 10));
        //   if (number == 0) return;
        //   let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
        //   if (sum == 0) return;
        //   return mp.events.callRemote(item.eventName, 1, number, sum);
        // }
        if (item.itemId) {
          menuList.showMazeBankOfficeTaxInfoMenu(item._type, item.itemId);
        }
      });
    });
  },

  showMazeBankOfficeTaxInfoMenu: async function (type: number, id: number) {
    //TODO BLACKOUT

    let tax = 0;
    let taxLimit = 0;
    let taxDay = 0;
    let score = 0;
    let name = '';

    if (type == 0) {
      let item: {
        price: number,
        money_tax: number,
        score_tax: number,
        address: string,
        id: number,
      } = await mp.events.callServer('house:getData', id);
      taxDay = methods.parseInt((item.price * 0.0001 + 10) / 7);
      tax = item.money_tax;
      taxLimit = methods.parseInt(item.price * 0.0001 + 10) * 21;
      score = item.score_tax;

      name = item.address + ' №' + item.id;
    } else if (type == 1) {
      let item = await vehicles.getData(id);
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = methods.getVehicleInfo(item.get('hash')).display_name + ' (' + item.get('number') + ')';
    } else if (type == 2) {
      let item = await business.getData(id);
      taxDay = methods.parseInt((item.price * 0.0001 + 10) / 7);
      tax = item.money_tax;
      taxLimit = methods.parseInt(item.price * 0.0001 + 10) * 21;
      score = item.score_tax;

      name = item.name;
    } else if (type == 3) {
      let item = await Container.GetAll(-100000 + methods.parseInt(id));
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = 'Апартаменты №' + item.get('id');
    } else if (type == 4) {
      let item = await stock.getData(id);
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = 'Склад №' + item.get('id');
    } else if (type == 5) {
      let item = await condo.getData(id);
      taxDay = methods.parseInt((item.get('price') * 0.0001 + 10) / 7);
      tax = item.get('money_tax');
      taxLimit = methods.parseInt(item.get('price') * 0.0001 + 10) * 21;
      score = item.get('score_tax');

      name = item.get('address') + ' №' + item.get('id');
    }

    methods.debug(name, tax, taxLimit, taxDay, score);

    let menu = UIMenu.Menu.Create(`Maze`, `~b~` + name);

    menu.AddMenuItem(`~b~Счёт:~s~ ${score}`, 'Уникальный счёт вашего имущества');
    menu.AddMenuItem(
      `~b~Ваша задолженность:~s~ ~r~${tax == 0 ? '~g~Отсутствует' : `$${tax}`}`,
      `Ваш текущий долг, при достижении ~r~$${taxLimit}~s~ ваше имущество будет изъято`
    );
    menu.AddMenuItem(`~b~Налог в день:~s~ $${taxDay}`, 'Индвивидуальная налоговая ставка');
    menu.AddMenuItem(
      `~b~Допустимый лимит:~s~ $${taxLimit}`,
      'Допустимый лимит до обнуления имущества'
    );

    menu.AddMenuItem('Оплатить наличкой').payTaxType = 0;
    menu.AddMenuItem('Оплатить картой').payTaxType = 1;

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item == closeItem) return;
      if (item.payTaxType >= 0) {
        let sum = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма', '', 9));
        if (sum == 0) return;

        if (item.payTaxType == 0 && user.getCashMoney() < sum) {
          mp.game.ui.notifications.show('~r~У Вас нет такой суммы на руках');
          return;
        }
        if (item.payTaxType == 1 && user.getBankMoney() < sum) {
          mp.game.ui.notifications.show('~r~У Вас нет такой суммы в банке');
          return;
        }

        mp.events.callRemote('server:tax:payTax', item.payTaxType, score, sum);
      }
    });
  },

  showBankMenu: function (bankId: number, priceCard: number) {
    //TODO BLACKOUT
    let menu = UIMenu.Menu.Create(``, `~b~Нажмите "~g~Enter~b~", чтобы выбрать пункт`);
    switch (bankId) {
      case 1:
        menu.spriteName = "fleeca";
        break;
      case 2:
        menu.spriteName = "blane";
        break;
      case 108:
        menu.spriteName = "pacific";
        break;
      case 0:
        menu.spriteName = "maze";
        break;
      default:
        menu.title = 'Банк'
        break;
    }
    if (
      (bankId == 0 && user.get('bank_prefix') == 1111) ||
      (bankId == 1 && user.get('bank_prefix') == 2222) ||
      (bankId == 2 && user.get('bank_prefix') == 3333) ||
      (bankId == 108 && user.get('bank_prefix') == 4444)
    ) {
      menu.AddMenuItem('Снять средства').eventName = 'server:bank:withdraw';
      menu.AddMenuItem('Положить средства').eventName = 'server:bank:deposit';
      menu.AddMenuItem('Баланс').SetRightLabel(
        '~g~$' + methods.numberFormat(user.get('money_bank'))
      );
      menu.AddMenuItem('Номер карты').SetRightLabel(
        user.get('bank_prefix') + '-' + user.get('bank_number')
      );
      menu.AddMenuItem('Перевести на другой счет', '1% от суммы, при переводе').eventName =
        'server:bank:transferMoney';
      if (
        user.get('bank_prefix') == 2222 ||
        user.get('bank_prefix') == 3333 ||
        user.get('bank_prefix') == 4444
      )
        menu.AddMenuItem('~b~Изменить номер карты', 'Цена: ~g~$100,000').eventName =
          'server:bank:changeCardNumber';
      menu.AddMenuItem('~r~Закрыть счёт').eventName = 'server:bank:closeCard';
    } else {
      menu.AddMenuItem('Оформить карту банка', 'Цена: ~g~$' + priceCard).eventName =
        'server:bank:openCard';
    }

    let closeItem = menu.AddMenuItem('~r~Закрыть');
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.eventName == 'server:bank:withdraw') {
        let mStr = await UIMenu.Menu.GetUserInput('Сумма снятия', '', 9);
        if (mStr == '') return;
        let money = methods.parseInt(mStr);
        mp.events.callRemote(item.eventName, money, 0);
      } else if (item.eventName == 'server:bank:deposit') {
        let mStr = await UIMenu.Menu.GetUserInput('Сумма внесения', '', 9);
        if (mStr == '') return;
        let money = methods.parseInt(mStr);
        mp.events.callRemote(item.eventName, money, 0);
      } else if (item.eventName == 'server:bank:transferMoney') {
        let bankPrefix = methods.parseInt(await UIMenu.Menu.GetUserInput('Префикс карты', '', 4));
        let bankNumber = methods.parseInt(await UIMenu.Menu.GetUserInput('Номер карты', '', 9));
        let money = methods.parseInt(await UIMenu.Menu.GetUserInput('Сумма перевода', '', 9));
        mp.events.callRemote(item.eventName, bankPrefix, bankNumber, money);
      } else if (item.eventName == 'server:bank:changeCardNumber') {
        let bankNumber = methods.parseInt(
          await UIMenu.Menu.GetUserInput('Желаемый номер карты', '', 9)
        );
        mp.events.callRemote(item.eventName, bankNumber);
      } else if (item.eventName == 'server:bank:closeCard') {
        mp.events.callRemote(item.eventName);
      } else if (item.eventName == 'server:bank:openCard') {
        mp.events.callRemote(item.eventName, bankId, priceCard);
      }
    });
  },

  showAtmMenu: function () {
    mp.events.callRemote('atm:open');
    gui.setGui('atm');
  },

  showRentVehMailMenu: function () {
    let menu = UIMenu.Menu.Create(`Почта`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Транспорт почты', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('Транспорт грузоперевозок', 'Цена: ~g~$900').doName = 'takeVehicle1';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.get('job') != 'mail' && user.get('job') != 'mail2') {
          mp.game.ui.notifications.show('~r~Вы не работаете в почтовой компании');
          return;
        }

        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);

        if (user.get('job') == 'mail') business.addMoney(115, 100);
        if (user.get('job') == 'mail2') business.addMoney(119, 100);

        switch (user.get('job')) {
          case 'mail':
            vehicles.spawnJobCar(-416.051, -2855.117, 5.903267, 29.43917, 444171386, 'mail');
            break;
          case 'mail2':
            vehicles.spawnJobCar(74.63538, 120.9179, 79.095, 159.2784, -233098306, 'mail2');
            break;
        }
      }
      if (item.doName == 'takeVehicle1') {
        if (
          user.get('job') != 'trucker1' &&
          user.get('job') != 'trucker2' &&
          user.get('job') != 'trucker3'
        ) {
          mp.game.ui.notifications.show('~r~Вы не работаете в грузоперевозках');
          return;
        }

        if (user.getCashMoney() < 900) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $900');
          return;
        }
        user.removeCashMoney(900);

        if (
          methods.distanceToPos(
            new mp.Vector3(-416.051, -2855.117, 5.903267),
            mp.players.local.position
          ) < 100
        ) {
          vehicles.spawnJobCar(-416.051, -2855.117, 5.903267, 29.43917, 'burrito3', 'trucker11');
          business.addMoney(115, 900);
        }
        if (
          methods.distanceToPos(
            new mp.Vector3(74.63538, 120.9179, 79.095),
            mp.players.local.position
          ) < 50
        ) {
          vehicles.spawnJobCar(74.63538, 120.9179, 79.095, 159.2784, 'pony', 'trucker12');
          business.addMoney(119, 900);
        }
      }
    });
  },

  showRentVehTruckerMenu: function (id: number) {
    let menu = UIMenu.Menu.Create(`Грузоперевозки`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('~g~==========[Грузовики]===========');

    let price = 4000;
    let vItem = menu.AddMenuItem('Mule', 'Цена: ~g~$' + price);
    vItem.price = price;
    switch (methods.getRandomInt(0, 3)) {
      case 0:
        vItem.name = 'Mule3';
        break;
      case 1:
        vItem.name = 'Mule2';
        break;
      default:
        vItem.name = 'Mule';
        break;
    }
    vItem.doName = 'takeVehicle';

    price = 3500;
    vItem = menu.AddMenuItem('Benson', 'Цена: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Benson';
    vItem.doName = 'takeVehicle';

    price = 3000;
    vItem = menu.AddMenuItem('Pounder', 'Цена: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Pounder';
    vItem.doName = 'takeVehicle';

    menu.AddMenuItem('~g~==========[Тягочи]===========');

    price = 8000;
    vItem = menu.AddMenuItem('Hauler', 'Цена: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Hauler';
    vItem.doName = 'takeVehicle1';

    price = 9000;
    vItem = menu.AddMenuItem('Packer', 'Цена: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Packer';
    vItem.doName = 'takeVehicle1';

    price = 10000;
    vItem = menu.AddMenuItem('Phantom', 'Цена: ~g~$' + price);
    vItem.price = price;
    vItem.name = 'Phantom';
    vItem.doName = 'takeVehicle1';

    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.get('job') != 'trucker2') {
          mp.game.ui.notifications.show('~r~Вам необходимо работать в грузоперевозках на грузовиках');
          return;
        }

        if (user.get('skill_trucker') < 500) {
          mp.game.ui.notifications.show('~r~Скилл дальнобойщика должен быть не менее 33%');
          return;
        }

        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $' + item.price);
          return;
        }
        user.removeCashMoney(item.price);

        switch (id) {
          case 1:
            business.addMoney(159, item.price);
            vehicles.spawnJobCar(
              834.4056396484375,
              -3210.1337890625,
              4.876688003540039,
              39.51744079589844,
              item.name.toLowerCase(),
              'trucker21'
            );
            break;
          case 2:
            business.addMoney(161, item.price);
            vehicles.spawnJobCar(
              120.0014877319336,
              -2581.646240234375,
              4.986051082611084,
              178.07183837890625,
              item.name.toLowerCase(),
              'trucker22'
            );
            break;
          case 3:
            business.addMoney(160, item.price);
            vehicles.spawnJobCar(
              665.429443359375,
              -2672.387939453125,
              5.05723237991333,
              89.58071899414062,
              item.name.toLowerCase(),
              'trucker23'
            );
            break;
        }
      }
      if (item.doName == 'takeVehicle1') {
        if (user.get('job') != 'trucker3') {
          mp.game.ui.notifications.show('~r~Вам необходимо работать в грузоперевозках на фурах');
          return;
        }

        if (user.get('skill_trucker') < 1000) {
          mp.game.ui.notifications.show('~r~Навык дальнобойщика должен быть не менее 66%');
          return;
        }

        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $' + item.price);
          return;
        }
        user.removeCashMoney(item.price);

        switch (id) {
          case 1:
            business.addMoney(159, item.price);
            vehicles.spawnJobCar(
              834.4056396484375,
              -3210.1337890625,
              4.876688003540039,
              39.51744079589844,
              item.name.toLowerCase(),
              'trucker31'
            );
            break;
          case 2:
            business.addMoney(161, item.price);
            vehicles.spawnJobCar(
              120.0014877319336,
              -2581.646240234375,
              4.986051082611084,
              178.07183837890625,
              item.name.toLowerCase(),
              'trucker32'
            );
            break;
          case 3:
            business.addMoney(160, item.price);
            vehicles.spawnJobCar(
              665.429443359375,
              -2672.387939453125,
              5.05723237991333,
              89.58071899414062,
              item.name.toLowerCase(),
              'trucker33'
            );
            break;
        }
      }
    });
  },

  showRentVehBusMenu: function () {
    if (user.get('job') != 'bus1' && user.get('job') != 'bus2' && user.get('job') != 'bus3') {
      mp.game.ui.notifications.show('~r~Вы не работаете в автобусной компании');
      return;
    }

    let menu = UIMenu.Menu.Create(`Автобус`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        coffer.addMoney(100);

        switch (user.get('job')) {
          case 'bus1':
            vehicles.spawnJobCar(-733.1366, -2149.65356, 6.821907, -174.20549, -713569950, 'bus1');
            break;
          case 'bus2':
            vehicles.spawnJobCar(-728.104, -2154.26245, 6.82229853, -174.645248, 1283517198, 'bus2');
            break;
          case 'bus3':
            vehicles.spawnJobCar(-723.1534, -2158.188, 6.821994, -174.612122, -2072933068, 'bus3');
            break;
        }
      }
    });
  },

  showRentVehTaxi1Menu: function () {
    if (user.get('job') != 'taxi1') {
      mp.game.ui.notifications.show('~r~Вы не работаете таксистом');
      return;
    }

    let menu = UIMenu.Menu.Create(`Такси`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    let itemPrice = 100;
    let menuItem = menu.AddMenuItem(
      'Stanier (Эконом)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -956048545;
    menuItem.skill = 0;

    itemPrice = 250;
    menuItem = menu.AddMenuItem(
      'Oracle2 (Комфорт)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -511601230;
    menuItem.skill = 100;

    itemPrice = 500;
    menuItem = menu.AddMenuItem(
      'Schafter4 (Комфорт+)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = 1489967196;
    menuItem.skill = 200;

    itemPrice = 1000;
    menuItem = menu.AddMenuItem(
      'Revolter (Бизнес)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -410205223;
    menuItem.skill = 300;

    itemPrice = 3000;
    menuItem = menu.AddMenuItem('SC1 (Спорт)', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1352136073;
    menuItem.skill = 400;

    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.price > 0) {
        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $' + item.price);
          return;
        }
        if (user.get('skill_taxi') < item.skill) {
          mp.game.ui.notifications.show(
            `~r~Необходим навык таксиста ~s~${item.skill / 4}% ~r~для аренды`
          );
          return;
        }
        user.removeCashMoney(item.price);
        business.addMoney(114, item.price);

        vehicles.spawnJobCar(906.6081, -186.1309, 74.62754, 63.30142, item.hash, 'taxi1');
      }
    });
  },

  showRentVehTaxi2Menu: function () {
    if (user.get('job') != 'taxi2') {
      mp.game.ui.notifications.show('~r~Вы не работаете таксистом');
      return;
    }

    let menu = UIMenu.Menu.Create(`Такси`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    let itemPrice = 100;
    let menuItem = menu.AddMenuItem(
      'Primo (Эконом)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -1150599089;
    menuItem.skill = 0;

    itemPrice = 250;
    menuItem = menu.AddMenuItem(
      'Oracle2 (Комфорт)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -511601230;
    menuItem.skill = 100;

    itemPrice = 500;
    menuItem = menu.AddMenuItem(
      'Schafter4 (Комфорт+)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = 1489967196;
    menuItem.skill = 200;

    itemPrice = 1000;
    menuItem = menu.AddMenuItem(
      'Revolter (Бизнес)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.hash = -410205223;
    menuItem.skill = 300;

    itemPrice = 3000;
    menuItem = menu.AddMenuItem('SC1 (Спорт)', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1352136073;
    menuItem.skill = 400;

    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.price > 0) {
        if (user.getCashMoney() < item.price) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $' + item.price);
          return;
        }
        if (user.get('skill_taxi') < item.skill) {
          mp.game.ui.notifications.show(
            `~r~Необходим навык таксиста ~s~${item.skill / 4}% ~r~для аренды`
          );
          return;
        }
        user.removeCashMoney(item.price);
        business.addMoney(147, item.price);

        vehicles.spawnJobCar(891.8828, -1024.4975, 33.9666, 272.55, item.hash, 'taxi2');
      }
    });
  },


  showRentVehBugstarMenu: function () {
    if (user.get('job') != 'bgstar') {
      mp.game.ui.notifications.show('~r~Вы не работаете в компании BugStars');
      return;
    }

    let menu = UIMenu.Menu.Create(`Bugstars`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(116, 100);
        vehicles.spawnJobCar(151.1033, -3083.113, 5.711528, 177.4191, -907477130, 'bgstar');
      }
    });
  },

  showRentVehBshotMenu: function () {
    if (user.get('job') != 'bshot') {
      mp.game.ui.notifications.show('~r~Вы не работаете в компании BugStars');
      return;
    }

    let menu = UIMenu.Menu.Create(`BurgerShot`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(116, 100);
        vehicles.spawnJobCar(-1163.2613, -891.0358, 14.142, 123.2237, 1039032026, 'bshot');
      }
    });
  },

  showRentVehWaterPowerMenu: function () {
    if (user.get('job') != 'water') {
      mp.game.ui.notifications.show('~r~Вы не работаете в компании Water & Power');
      return;
    }

    let menu = UIMenu.Menu.Create(`W&P`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        coffer.addMoney(100);
        vehicles.spawnJobCar(633.9341, 125.0401, 92.60691, 69.48256, -1346687836, 'water');
      }
    });
  },

  showRentVehSunsetBleachMenu: function () {
    if (user.get('job') != 'sunb') {
      mp.game.ui.notifications.show('~r~Вы не работаете в компании Sunset Bleach');
      return;
    }

    let menu = UIMenu.Menu.Create(`Sunset`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(117, 100);
        vehicles.spawnJobCar(-1194.017, -1480.142, 4.167116, 124.8127, -119658072, 'sunb');
      }
    });
  },

  showRentVehGardenerMenu: function () {
    if (user.get('job') != 'three') {
      mp.game.ui.notifications.show('~r~Вы не работаете в компании OConnor');
      return;
    }

    let menu = UIMenu.Menu.Create(`Sunset`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(118, 100);
        vehicles.spawnJobCar(-1146.226, -745.6683, 19, 107.6955, 2132890591, 'three');
      }
    });
  },

  showRentVehPhotoMenu: function () {
    if (user.get('job') != 'photo') {
      mp.game.ui.notifications.show('~r~Вы не работаете в компании Life Invader');
      return;
    }

    let menu = UIMenu.Menu.Create(`Sunset`, `~b~Нажмите "~g~Enter~b~", чтобы арендовать`);

    menu.AddMenuItem('Арендовать транспорт', 'Цена: ~g~$100').doName = 'takeVehicle';
    menu.AddMenuItem('~r~Закрыть');

    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'takeVehicle') {
        if (user.getCashMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет на руках $100');
          return;
        }
        user.removeCashMoney(100);
        business.addMoney(92, 100);
        vehicles.spawnJobCar(-1051.927, -249.231, 37.56403, 205.1753, -2064372143, 'photo');
      }
    });
  },

  showInvVehBagMenu: function (veh: VehicleMp) {
    try {
      if (veh.isDead()) {
        mp.game.ui.notifications.show('~r~Транспорт уничтожен');
      } else if (veh.getDoorLockStatus() !== 1) {
        mp.game.ui.notifications.show('~r~Транспорт закрыт');
      } else if (mp.players.local.isInAnyVehicle(false)) {
        mp.game.ui.notifications.show('~r~Вы должны находиться около багажника');
      } else if (methods.getVehicleInfo(veh.model).stock == 0) {
        mp.game.ui.notifications.show('~r~Багажник отсутсвует у этого ТС');
      } else {
        inventory.getItemList(
          inventory.types.Vehicle,
          veh.getNumberPlateText());
      }
    } catch (e) {
      methods.debug(e);
      mp.game.ui.notifications.show('~r~Вы должны находиться около багажника');
    }
  },


  showPlayerPhoneSmsMenu: function (data: any[], phone: any) {
    let smsList =
      '<li class="collection-item green-text" act="newsms" tabindex="0">Написать СМС</li>';
    let id = 0;

    let phoneOwner = `${user.get('phone_code')}-${user.get('phone')}`;

    data.forEach((property) => {
      //menu.AddMenuItemList(UiMenu, $"{(phone != property[0].toString() ? $"~g~Входящее: ~s~{property[0]}" : $"~r~Исходящее: ~s~{tempData2[i]}" )}", list, $"~b~Время:~s~ {tempData3[i]}").OnListSelected += async (uimenu, idx) =>
      let phoneNumber =
        phone != property[1][0].toString() ? `${property[1][0]}` : `${property[1][1]}`;

      let phoneInOrOut = phone != property[1][0].toString() ? 'Входящее' : 'Исходящее';
      smsList += `<li class=\"collection-item\" act=\"smsinfo\" param1=\"${
        property[0]
        }\" tabindex=\"${++id}\">${phoneNumber}<br><label>${
        property[1][2]
        } / ${phoneInOrOut}</label></li>`;
    });

    smsList += `<li class=\"collection-item green-text\" act=\"tomain\" tabindex=\"${++id}\">Назад</li>`;
    //<li class="collection-item" tabindex="2">555-11111111 <a class="secondary-content"><i class="material-icons phone-sms-ico phone-sms-ico-out">chat_bubble</i></a></li>
    mp.events.call('client:phone:addSmsList', smsList);
  },

  showPlayerPhoneSmsInfoMenu: function (id: number, numberFrom: string, numberTo: string, text: string, dateTime: any) {
    let isNumberFromOwner = numberFrom == user.get('phone_code') + '-' + user.get('phone');
    let smsItem = `<div class=\"hide\" id=\"data-sms-text\">Номер: ${numberFrom}\n${text}</div>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"0\">Отправитель: <label>${numberFrom}</label></li>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"1\">Получатель: <label>${numberTo}</label></li>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"2\">Время: <label>${dateTime}</label></li>`;
    smsItem += `<li class=\"collection-item\" act=\"sms-read\" tabindex=\"3\">Прочитать</li>`;
    if (isNumberFromOwner)
      smsItem += `<li class=\"collection-item\" act=\"newsmswithnum\" param1=\"${numberTo}\" tabindex=\"4\">Написать ещё одно</li>`;
    else
      smsItem += `<li class=\"collection-item\" act=\"newsmswithnum\" param1=\"${numberFrom}\" tabindex=\"4\">Ответить</li>`;

    smsItem += `<li class=\"collection-item\" act=\"callwithnum\" param1=\"${numberFrom}\" tabindex=\"4\">Позвонить</li>`;
    smsItem += `<li class=\"collection-item red-text\" act=\"sms-del\" param1=\"${id}\" tabindex=\"5\">Удалить</li>`;
    smsItem += `<li class=\"collection-item green-text\" act=\"tomain\" tabindex=\"6\">Назад</li>`;
    mp.events.call('client:phone:showSmsItem', smsItem);
  },

  showPlayerPhoneContInfoMenu: function (id: number, title: string, number: number) {
    let smsItem = `<li class=\"collection-item\" tabindex=\"0\">${title}</li>`;
    smsItem += `<li class=\"collection-item\" tabindex=\"1\"><label>${number}</label></li>`;
    smsItem += `<li class=\"collection-item\" act=\"newsmswithnum\" param1=\"${number}\" tabindex=\"4\">Написать</li>`;
    smsItem += `<li class=\"collection-item\" act=\"callwithnum\" param1=\"${number}\" tabindex=\"4\">Позвонить</li>`;
    smsItem += `<li class=\"collection-item\" act=\"cont-ren\" param1=\"${id}\" tabindex=\"4\">Переименовать</li>`;
    smsItem += `<li class=\"collection-item red-text\" act=\"cont-del\" param1=\"${id}\" tabindex=\"5\">Удалить</li>`;
    smsItem += '<li class="collection-item green-text" act="tomain" tabindex="6">Назад</li>';
    mp.events.call('client:phone:showContItem', smsItem);
  },

  showPlayerPhoneBookMenu: function (data: any[]) {
    let smsList =
      '<li class="collection-item green-text" act="newcont" tabindex="0">Новый контакт</li>';
    smsList +=
      '<li class="collection-item" act="911-1" tabindex="1">Полиция<br><label>911-1</label></li>';
    smsList +=
      '<li class="collection-item" act="911-2" tabindex="2">Скорая<br><label>911-2</label></li>';
    // smsList +=
    //   '<li class="collection-item" act="911-3" tabindex="3">Пожарные<br><label>911-3</label></li>';

    /*if (User.IsCartel() && user.get("rank") > 4)
      {
          smsList += "<li class=\"collection-item\" act=\"misterk1\" tabindex=\"1\">Мистер К<br><label>Продажа человека</label></li>";
          smsList += "<li class=\"collection-item\" act=\"misterk2\" tabindex=\"1\">Мистер К<br><label>Снять розыск</label></li>";
      }
      Заглушечка
      */

    // Еще не доделано
    let id = 0;
    data.forEach((property) => {
      smsList =
        smsList +
        `<li class=\"collection-item\" act=\"continfo\" param1=\"${
        property[0]
        }\" tabindex=\"${++id}\">${property[1][0]}<br><label>${property[1][1]}</label></li>`;
    });
    smsList += `<li class=\"collection-item green-text\" act=\"tomain\" tabindex=\"${++id}\">Назад</li>`;
    mp.events.call('client:phone:addContList', smsList);
    return;
  },

  showPlayerPhoneMenu: function () {
    if(gui.isActionGui()) return;
    /*if (await Ctos.IsBlackout())
      {
          Notification.SendWithTime("~r~Связь во время блекаута не работает");
          return;
      }
  
      if (User.GetNetwork() < 1)
      {
          Notification.SendWithTime("~r~Нет связи");
          return;
      }
  
      if (User.GetPlayerVirtualWorld() > 50000)
      {
          Notification.SendWithTime("~r~Нет связи");
          return;
      }*/

    if (user.get('jail_time') > 0) {
      mp.game.ui.notifications.show('~r~Вы в тюрьме');
      return;
    }

    UIMenu.Menu.HideMenu();

    user.playPhoneAnimation();
    mp.events.call('client:phone:show');
  },

  showInvMenu: function () {
    if (gui.currentGui != null && gui.currentGui != "inventory") return;
    UIMenu.Menu.HideMenu();

    if (user.get('jail_time') > 0) {
      mp.game.ui.notifications.show('~r~В тюрьме нельзя этим пользоваться');
      return;
    }
    // inventory.getItemList(inventory.types.Player, user.get('id'));
    mp.events.callRemote("inventory:open");
  },

  showShopMaskMenu: function (shopId: number) {
    try {
      methods.debug('Execute: menuList.showShopMaskMenu');

      let menu = UIMenu.Menu.Create('', '~b~Магазин масок', false, false, false, 'shopui_title_movie_masks', 'shopui_title_movie_masks');

      let maskIdx = 1;
      for (let i = 1; i < 160; i++) {
        let id = i;

        if (id == 32 || id == 35 || id == 37 || id == 47 || id == 48 || id == 52 || id == 53)
          continue;
        if (id == 141 || id == 138 || id == 135 || id == 134 || id == 133 || id == 132 || id == 131)
          continue;
        if (
          id == 130 ||
          id == 129 ||
          id == 128 ||
          id == 127 ||
          id == 125 ||
          id == 124 ||
          id == 123 ||
          id == 122 ||
          id == 119 ||
          id == 118 ||
          id == 116 ||
          id == 115 ||
          id == 114 ||
          id == 113 ||
          id == 66 ||
          id == 95 ||
          id == 96 ||
          id == 97 ||
          id == 102 ||
          id == 103 ||
          id == 105 ||
          id == 106 ||
          id == 107 ||
          id == 108 ||
          id == 110 ||
          id == 111 ||
          id == 112
        )
          continue;

        let list = [];
        for (let j = 0; j <= 20; j++) {
          if (mp.players.local.isComponentVariationValid(1, id, j)) list.push(j + '');
        }

        menu.AddMenuItemList('Маска #' + maskIdx, list, `Цена: ~g~$500`).maskId = id;
        maskIdx++;
      }

      menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';

      menu.MenuClose.on(() => {
        try {
          user.updateCharacterCloth();
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex = 0;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;
        cloth.changeMask(item.maskId, index);
      });

      menu.ItemSelect.on(async (item, index) => {
        try {
          if (currentListChangeItem == item) {
            cloth.buyMask(500, item.maskId, currentListChangeItemIndex, shopId);
          }
          if (item.doName == 'closeButton') {
            UIMenu.Menu.HideMenu();
            user.updateCharacterCloth();
          }
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.ItemSelect');
          methods.debug(e);
        }
      });
    } catch (e) {
      methods.debug('Exception: menuList.showShopMaskMenu');
      methods.debug(e);
    }
  },

  showShopClothMenu: function (shopId: number, type: number, menuType: number) {
    try {
      methods.debug('Execute: menuList.showShopClothMenu');

      if (menuType == 11) inventory.unEquipItem(265, 0, 1, 0, false);

      let title1 = 'commonmenu';
      let title2 = 'interaction_bgd';

      switch (type) {
        case 0:
          title1 = 'shopui_title_lowendfashion';
          title2 = 'shopui_title_lowendfashion';
          break;
        case 1:
          title1 = 'shopui_title_midfashion';
          title2 = 'shopui_title_midfashion';
          break;
        case 2:
          title1 = 'shopui_title_highendfashion';
          title2 = 'shopui_title_highendfashion';
          break;
        case 3:
          title1 = 'shopui_title_gunclub';
          title2 = 'shopui_title_gunclub';
          break;
        case 5:
          title1 = 'shopui_title_lowendfashion2';
          title2 = 'shopui_title_lowendfashion2';
          break;
      }

      let menu = UIMenu.Menu.Create(
        title1 != 'commonmenu' ? ' ' : 'Vangelico',
        '~b~Магазин',
        true,
        false,
        false,
        title1,
        title2
      );

      /*if (menuType == 5) {
              menu.AddMenuItem("Бейсбольная бита", "Цена: ~g~$100").doName = "baseballBat";
              menu.AddMenuItem("Бейсбольный мяч", "Цена: ~g~$10").doName = "baseballBall";
          }*/

      if (menuType == 0) {
        menu.AddMenuItem('Головные уборы').doName = 'head';
        menu.AddMenuItem('Очки').doName = 'glasses';
        menu.AddMenuItem('Серьги').doName = 'earring';
        menu.AddMenuItem('Левая рука').doName = 'leftHand';
        menu.AddMenuItem('Правая рука').doName = 'rightHand';
        menu.AddMenuItem('~y~Ограбить').doName = 'grab';
      } else if (menuType == 1) {
        menu.AddMenuItem('Головные уборы').doName = 'head';
        menu.AddMenuItem('Очки').doName = 'glasses';
        menu.AddMenuItem('Торс').doName = 'body';
        menu.AddMenuItem('Ноги').doName = 'legs';
        menu.AddMenuItem('Обувь').doName = 'shoes';
      } else {
        if (menuType == 7) {
          menu.AddMenuItem('~y~Снять').doName = 'takeOff';
        }
        let skin = JSON.parse(user.get('skin'));
        let cloth = skin.SEX == 1 ? enums.get('clothF') as clothItem[] : enums.get('clothM') as clothItem[];
        for (let i = 0; i < cloth.length; i++) {
          let id = i;

          if (cloth[id][1] != menuType) continue;
          if (cloth[id][0] != type) continue;

          let list = [];
          for (let j = 0; j <= cloth[i][3] + 1; j++) {
            list.push(j + '');
          }

          let menuListItem = menu.AddMenuItemList(
            cloth[i][9].toString(),
            list,
            `Цена: ~g~$${methods.numberFormat(cloth[i][8])} ${
            cloth[i][10] > -99 ? `\n~s~Термостойкость до ~g~${cloth[i][10]}°` : ''
            }`
          );

          menuListItem.id1 = cloth[id][1];
          menuListItem.id2 = cloth[id][2];
          menuListItem.id4 = cloth[id][4];
          menuListItem.id5 = cloth[id][5];
          menuListItem.id6 = cloth[id][6];
          menuListItem.id7 = cloth[id][7];
          menuListItem.id8 = cloth[id][8];
        }
      }

      if (type == 5 && WEAPON_LEVEL_MIN <= user.getLevel()) {
        let menuItem = menu.AddMenuItem('Бита', `Цена: ~g~$350`);
        menuItem.price = 350;
        menuItem.itemId = 55;
      }

      menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';

      menu.MenuClose.on(() => {
        try {
          user.updateCharacterCloth();
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex = 0;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;
        cloth.change(item.id1, item.id2, index, item.id4, item.id5, item.id6, item.id7);
      });

      menu.ItemSelect.on((item, index) => {
        //if(!UIMenu.Menu.getMenuDistance(5)) return;
        try {
          if (item == currentListChangeItem) {
            cloth.buy(
              item.id8,
              item.id1,
              item.id2,
              currentListChangeItemIndex,
              item.id4,
              item.id5,
              item.id6,
              item.id7,
              shopId
            );
          }
          else if (item.doName == 'grab') {
            UIMenu.Menu.HideMenu();
            user.grab(shopId);
          }
          else if (item.doName == 'takeOff') {
            UIMenu.Menu.HideMenu();
            cloth.buy(10, menuType, 0, 0, -1, -1, -1, -1, shopId, true);
          }
          else if (item.doName == 'closeButton') {
            UIMenu.Menu.HideMenu();
            user.updateCharacterCloth();
          }
          else if (item.price > 0)
            mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
          else if (item.doName == 'head') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 0);
          }
          else if (item.doName == 'glasses') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 1);
          }
          else if (item.doName == 'earring') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 2);
          }
          else if (item.doName == 'leftHand') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 6);
          }
          else if (item.doName == 'rightHand') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 7);
          }
          else if (item.doName == 'head') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 0);
          }
          else if (item.doName == 'glasses') {
            UIMenu.Menu.HideMenu();
            menuList.showShopPropMenu(shopId, type, 1);
          }
          else if (item.doName == 'body') {
            UIMenu.Menu.HideMenu();
            menuList.showShopClothMenu(shopId, 3, 11);
          }
          else if (item.doName == 'legs') {
            UIMenu.Menu.HideMenu();
            menuList.showShopClothMenu(shopId, 3, 4);
          }
          else if (item.doName == 'shoes') {
            UIMenu.Menu.HideMenu();
            menuList.showShopClothMenu(shopId, 3, 6);
          }
        } catch (e) {
          methods.debug('Exception: menuList.showShopClothMenu menu.ItemSelect');
          methods.debug(e);
        }
      });
    } catch (e) {
      methods.debug('Exception: menuList.showShopClothMenu');
      methods.debug(e);
    }
  },

  showShopPropMenu: function (shopId: number, type: number, menuType: number) {
    let title1 = 'commonmenu';
    let title2 = 'interaction_bgd';

    switch (type) {
      case 0:
        title1 = 'shopui_title_lowendfashion';
        title2 = 'shopui_title_lowendfashion';
        break;
      case 1:
        title1 = 'shopui_title_midfashion';
        title2 = 'shopui_title_midfashion';
        break;
      case 2:
        title1 = 'shopui_title_highendfashion';
        title2 = 'shopui_title_highendfashion';
        break;
      case 3:
        title1 = 'shopui_title_gunclub';
        title2 = 'shopui_title_gunclub';
        break;
      case 5:
        title1 = 'shopui_title_lowendfashion2';
        title2 = 'shopui_title_lowendfashion2';
        break;
    }

    let menu = UIMenu.Menu.Create(
      title1 != 'commonmenu' ? ' ' : 'Vangelico',
      '~b~Магазин',
      true,
      false,
      false,
      title1,
      title2
    );

    menu.AddMenuItem('~y~Снять').doName = 'takeOff';
    let q = user.get('skin');
    let skin = JSON.parse(user.get('skin'));
    let clothList = skin.SEX == 1 ? enums.get('propF') as propItem[] : enums.get('propM') as propItem[];

    for (let i = 0; i < clothList.length; i++) {
      let id = i;

      if (clothList[id][1] != menuType) continue;
      if (clothList[id][0] != type) continue;

      let list = [];
      for (let j = 0; j <= clothList[i][3] + 1; j++) {
        list.push(j + '');
      }

      let menuListItem = menu.AddMenuItemList(
        clothList[i][5].toString(),
        list,
        `Цена: ~g~$${methods.numberFormat(clothList[i][4])}`
      );

      menuListItem.id1 = clothList[id][1];
      menuListItem.id2 = clothList[id][2];
      menuListItem.id4 = clothList[id][4];
    }

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';

    menu.MenuClose.on(() => {
      user.updateCharacterCloth();
    });

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex = 0;

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;
      cloth.changeProp(item.id1, item.id2, index);
    });

    menu.ItemSelect.on((item, index) => {
      try {
        if (item == currentListChangeItem) {
          cloth.buyProp(item.id4, item.id1, item.id2, currentListChangeItemIndex, shopId);
        }
        if (item.doName == 'closeButton') {
          UIMenu.Menu.HideMenu();
          user.updateCharacterCloth();
        }
        if (item.doName == 'takeOff') {
          UIMenu.Menu.HideMenu();
          cloth.buyProp(0, menuType, -1, -1, shopId, true);
        }
      } catch (e) {
        methods.debug('Exception: menuList.showShopPropMenu menu.ItemSelect');
        methods.debug(e);
      }
    });
  },

  showBarberShopMenu: function (shopId: number) {
    let title1 = 'commonmenu';
    let title2 = 'interaction_bgd';

    switch (shopId) {
      case 109:
        title1 = 'shopui_title_barber';
        title2 = 'shopui_title_barber';
        break;
      case 110:
        title1 = 'shopui_title_barber2';
        title2 = 'shopui_title_barber2';
        break;
      case 111:
        title1 = 'shopui_title_barber3';
        title2 = 'shopui_title_barber3';
        break;
      case 48:
        title1 = 'shopui_title_barber4';
        title2 = 'shopui_title_barber4';
        break;
      case 112:
        title1 = 'shopui_title_highendsalon';
        title2 = 'shopui_title_highendsalon';
        break;
    }

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Влево/вправо менять внешность',
      false,
      false,
      false,
      title1,
      title2
    );

    let list = [];

    if (user.getSex() == 1) {
      for (let j = 0; j < 77; j++) {
        list.push(j + '');
      }
    } else {
      for (let j = 0; j < 72; j++) {
        list.push(j + '');
      }
    }

    let menuListItem = menu.AddMenuItemList('Причёска', list, `Цена: ~g~$400`);
    menuListItem.doName = 'GTAO_HAIR';
    menuListItem.price = 400;

    list = [];
    for (let j = 0; j < 64; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Цвет волос', list, `Цена: ~g~$160`);
    menuListItem.doName = 'GTAO_HAIR_COLOR';
    menuListItem.price = 160;

    list = [];
    for (let j = 0; j < 64; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Мелирование волос', list, `Цена: ~g~$160`);
    menuListItem.doName = 'GTAO_HAIR_COLOR2';
    menuListItem.price = 160;

    list = [];
    for (let j = 0; j < 32; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Цвет глаз', list, `Цена: ~g~$120`);
    menuListItem.doName = 'GTAO_EYE_COLOR';
    menuListItem.price = 120;

    list = [];
    for (let j = 0; j < 30; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Брови', list, `Цена: ~g~$70`);
    menuListItem.doName = 'GTAO_EYEBROWS';
    menuListItem.price = 70;

    list = [];
    for (let j = 0; j < 64; j++) {
      list.push(j + '');
    }
    /*menuListItem = menu.AddMenuItemList('Цвет бровей', list, `Цена: ~g~$50`);
      menuListItem.doName = 'GTAO_EYEBROWS_COLOR';
      menuListItem.price = 50;*/

    list = ['~r~Нет'];
    for (let j = 0; j < 10; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Веснушки', list, `Цена: ~g~$250`);
    menuListItem.doName = 'GTAO_OVERLAY9';
    menuListItem.price = 250;

    list = [];
    for (let j = 0; j < 5; j++) {
      list.push(j + '');
    }
    menuListItem = menu.AddMenuItemList('Цвет веснушек', list, `Цена: ~g~$50`);
    menuListItem.doName = 'GTAO_OVERLAY9_COLOR';
    menuListItem.price = 50;

    if (user.getSex() == 0) {
      list = ['~r~Нет'];
      for (let j = 0; j < 30; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Борода', list, `Цена: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 64; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Цвет бороды', list, `Цена: ~g~$120`);
      menuListItem.doName = 'GTAO_OVERLAY_COLOR';
      menuListItem.price = 120;

      list = ['~r~Нет'];
      for (let j = 0; j < mp.game.ped.getNumHeadOverlayValues(10) + 1; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Волосы на груди', list, `Цена: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY10';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 64; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Волосы на груди', list, `Цена: ~g~$120`);
      menuListItem.doName = 'GTAO_OVERLAY10_COLOR';
      menuListItem.price = 120;
    } else {
      list = ['~r~Нет'];
      for (let j = 0; j < mp.game.ped.getNumHeadOverlayValues(8) + 1; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Помада', list, `Цена: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY8';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 60; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Цвет помады', list, `Цена: ~g~$110`);
      menuListItem.doName = 'GTAO_OVERLAY8_COLOR';
      menuListItem.price = 110;

      list = ['~r~Нет'];
      for (let j = 0; j < 7; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Румянец', list, `Цена: ~g~$250`);
      menuListItem.doName = 'GTAO_OVERLAY5';
      menuListItem.price = 250;

      list = [];
      for (let j = 0; j < 60; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Цвет румянца', list, `Цена: ~g~$110`);
      menuListItem.doName = 'GTAO_OVERLAY5_COLOR';
      menuListItem.price = 110;

      list = ['~r~Нет'];
      for (let j = 0; j < mp.game.ped.getNumHeadOverlayValues(8) + 1; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Макияж', list, `Цена: ~g~$300`);
      menuListItem.doName = 'GTAO_OVERLAY4';
      menuListItem.price = 300;

      list = [];
      for (let j = 0; j < 10; j++) {
        list.push(j + '');
      }
      menuListItem = menu.AddMenuItemList('Цвет макияжа', list, `Цена: ~g~$150`);
      menuListItem.doName = 'GTAO_OVERLAY4_COLOR';
      menuListItem.price = 150;
    }

    menu.AddMenuItem('~y~Ограбить').doName = 'grab';
    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';

    menu.MenuClose.on(() => {
      user.updateCharacterFace();
      user.updateCharacterCloth();
    });

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex = 0;

    let skin = {
      GTAO_HAIR: methods.parseInt(user.get('GTAO_HAIR')),
      GTAO_HAIR_COLOR: methods.parseInt(user.get('GTAO_HAIR_COLOR')),
      GTAO_HAIR_COLOR2: methods.parseInt(user.get('GTAO_HAIR_COLOR2')),
      GTAO_EYE_COLOR: methods.parseInt(user.get('GTAO_EYE_COLOR')),
      GTAO_EYEBROWS_COLOR: methods.parseInt(user.get('GTAO_EYEBROWS_COLOR')),
      GTAO_OVERLAY9: methods.parseInt(user.get('GTAO_OVERLAY9')),
      GTAO_OVERLAY9_COLOR: methods.parseInt(user.get('GTAO_OVERLAY9_COLOR')),
      GTAO_OVERLAY: methods.parseInt(user.get('GTAO_OVERLAY')),
      GTAO_OVERLAY_COLOR: methods.parseInt(user.get('GTAO_OVERLAY_COLOR')),
      GTAO_OVERLAY4: methods.parseInt(user.get('GTAO_OVERLAY4')),
      GTAO_OVERLAY4_COLOR: methods.parseInt(user.get('GTAO_OVERLAY4_COLOR')),
      GTAO_OVERLAY5: methods.parseInt(user.get('GTAO_OVERLAY5')),
      GTAO_OVERLAY5_COLOR: methods.parseInt(user.get('GTAO_OVERLAY5_COLOR')),
      GTAO_OVERLAY8: methods.parseInt(user.get('GTAO_OVERLAY8')),
      GTAO_OVERLAY8_COLOR: methods.parseInt(user.get('GTAO_OVERLAY8_COLOR')),
      GTAO_OVERLAY10: methods.parseInt(user.get('GTAO_OVERLAY10')),
      GTAO_OVERLAY10_COLOR: methods.parseInt(user.get('GTAO_OVERLAY10_COLOR')),
      GTAO_EYEBROWS: methods.parseInt(user.get('GTAO_EYEBROWS')),
    };


    setTimeout(function () {
      user.updateCharacterFace();
      user.updateCharacterCloth();
    }, 500);

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;

      switch (item.doName) {
        case 'GTAO_HAIR':
          if (index == 23 || index == 24) skin.GTAO_HAIR = 1;
          else skin.GTAO_HAIR = index;
          mp.players.local.setComponentVariation(2, skin.GTAO_HAIR, 0, 2);
          mp.players.local.setHairColor(skin.GTAO_HAIR_COLOR, skin.GTAO_HAIR_COLOR2);
          break;

        case 'GTAO_HAIR_COLOR':
          skin.GTAO_HAIR_COLOR = index;
          mp.players.local.setHairColor(skin.GTAO_HAIR_COLOR, skin.GTAO_HAIR_COLOR2);
          break;

        case 'GTAO_HAIR_COLOR2':
          skin.GTAO_HAIR_COLOR2 = index;
          mp.players.local.setHairColor(skin.GTAO_HAIR_COLOR, skin.GTAO_HAIR_COLOR2);
          break;

        case 'GTAO_EYE_COLOR':
          skin.GTAO_EYE_COLOR = index;
          mp.players.local.setEyeColor(skin.GTAO_EYE_COLOR);
          break;

        case 'GTAO_EYEBROWS':
          skin.GTAO_EYEBROWS = index;
          mp.players.local.setHeadOverlay(2, skin.GTAO_EYEBROWS, 1.0, skin.GTAO_EYEBROWS_COLOR, 0);
          break;

        case 'GTAO_EYEBROWS_COLOR':
          skin.GTAO_EYEBROWS_COLOR = index;
          mp.players.local.setHeadOverlay(2, skin.GTAO_EYEBROWS, 1.0, skin.GTAO_EYEBROWS_COLOR, 0);
          break;

        case 'GTAO_OVERLAY9':
          skin.GTAO_OVERLAY9 = index - 1;
          mp.players.local.setHeadOverlay(9, skin.GTAO_OVERLAY9, 1.0, skin.GTAO_OVERLAY9_COLOR, 0);
          break;

        case 'GTAO_OVERLAY9_COLOR':
          skin.GTAO_OVERLAY9_COLOR = index;
          mp.players.local.setHeadOverlay(9, skin.GTAO_OVERLAY9, 1.0, skin.GTAO_OVERLAY9_COLOR, 0);
          break;

        case 'GTAO_OVERLAY':
          skin.GTAO_OVERLAY = index - 1;
          mp.players.local.setHeadOverlay(1, skin.GTAO_OVERLAY, 1.0, skin.GTAO_OVERLAY_COLOR, 0);
          break;

        case 'GTAO_OVERLAY_COLOR':
          skin.GTAO_OVERLAY_COLOR = index;
          mp.players.local.setHeadOverlay(1, skin.GTAO_OVERLAY, 1.0, skin.GTAO_OVERLAY_COLOR, 0);
          break;

        case 'GTAO_OVERLAY4':
          skin.GTAO_OVERLAY4 = index - 1;
          mp.players.local.setHeadOverlay(4, skin.GTAO_OVERLAY4, 1.0, skin.GTAO_OVERLAY4_COLOR, 0);
          break;

        case 'GTAO_OVERLAY4_COLOR':
          skin.GTAO_OVERLAY4_COLOR = index;
          mp.players.local.setHeadOverlay(4, skin.GTAO_OVERLAY4, 1.0, skin.GTAO_OVERLAY4_COLOR, 0);
          break;

        case 'GTAO_OVERLAY5':
          skin.GTAO_OVERLAY5 = index - 1;
          mp.players.local.setHeadOverlay(5, skin.GTAO_OVERLAY5, 1.0, skin.GTAO_OVERLAY5_COLOR, 0);
          break;

        case 'GTAO_OVERLAY5_COLOR':
          skin.GTAO_OVERLAY5_COLOR = index;
          mp.players.local.setHeadOverlay(5, skin.GTAO_OVERLAY5, 1.0, skin.GTAO_OVERLAY5_COLOR, 0);
          break;

        case 'GTAO_OVERLAY8':
          skin.GTAO_OVERLAY8 = index - 1;
          mp.players.local.setHeadOverlay(8, skin.GTAO_OVERLAY8, 1.0, skin.GTAO_OVERLAY8_COLOR, 0);
          break;

        case 'GTAO_OVERLAY8_COLOR':
          skin.GTAO_OVERLAY8_COLOR = index;
          mp.players.local.setHeadOverlay(8, skin.GTAO_OVERLAY8, 1.0, skin.GTAO_OVERLAY8_COLOR, 0);
          break;

        case 'GTAO_OVERLAY10':
          skin.GTAO_OVERLAY10 = index - 1;
          mp.players.local.setHeadOverlay(10, skin.GTAO_OVERLAY10, 1.0, skin.GTAO_OVERLAY10_COLOR, 0);
          break;

        case 'GTAO_OVERLAY10_COLOR':
          skin.GTAO_OVERLAY10_COLOR = index;
          mp.players.local.setHeadOverlay(10, skin.GTAO_OVERLAY10, 1.0, skin.GTAO_OVERLAY10_COLOR, 0);
          break;
      }
    });

    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      try {
        UIMenu.Menu.HideMenu();
        if (item == currentListChangeItem) {
          switch (item.doName) {
            case 'GTAO_OVERLAY':
            case 'GTAO_OVERLAY4':
            case 'GTAO_OVERLAY5':
            case 'GTAO_OVERLAY8':
            case 'GTAO_OVERLAY9':
            case 'GTAO_OVERLAY10':
              currentListChangeItemIndex = currentListChangeItemIndex - 1;
              break;
          }

          if (user.getMoney() < item.price) {
            mp.game.ui.notifications.show('~r~У Вас недостаточно денег');
            return;
          }

          if (item.price < 1) return;

          user.removeMoney(item.price);
          business.addMoney(shopId, item.price);
          user.setData(item.doName, currentListChangeItemIndex);
          mp.game.ui.notifications.show('~g~Вы изменили внешность по цене: ~s~$' + item.price);
          user.saveAccount();
          user.updateCharacterFace();
          user.updateCharacterCloth();
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
        if (item.doName == 'closeButton') {
          user.updateCharacterFace();
          user.updateCharacterCloth();
        }
      } catch (e) {
        methods.debug('Exception: menuList.showBarberShopMenu menu.ItemSelect');
        methods.debug(e);
      }
    });
  },


  showPrintShopMenu: function () {
    UIMenu.Menu.HideMenu();

    if (user.get('torso') == 15) {
      mp.game.ui.notifications.show('~r~Вам необходимо купить футболку в магазине одежды');
      mp.game.ui.notifications.show('~r~Прежде чем пользоваться услугой наклейки принта');
      return;
    }

    let menu = UIMenu.Menu.Create('Магазин', '~b~Магазин принтов');
    //TODO BLACKOUT

    let list: MenuItemClient[] = [];

    let printList = enums.get('printList') as any;

    for (let i = 0; i < printList.length; i++) {
      let price = 1000;
      if (user.getSex() == 1 && printList[i][2] != '') {
        let menuListItem = menu.AddMenuItem(
          'Принт #' + i,
          `Цена: ~g~$${methods.numberFormat(price)}`
        );
        menuListItem.doName = 'show';
        menuListItem.price = price;
        menuListItem.tatto1 = printList[i][0];
        menuListItem.tatto2 = printList[i][2];

        list.push(menuListItem);
      } else if (user.getSex() == 0 && printList[i][1] != '') {
        let menuListItem = menu.AddMenuItem(
          'Принт #' + i,
          `Цена: ~g~$${methods.numberFormat(price)}`
        );
        menuListItem.doName = 'show';
        menuListItem.price = price;
        menuListItem.tatto1 = printList[i][0];
        menuListItem.tatto2 = printList[i][1];

        list.push(menuListItem);
      }
    }

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';

    menu.IndexChange.on((index) => {
      if (index >= list.length) return;
      user.clearDecorations();
      //if(list[index])user.setDecoration(list[index].tatto1, list[index].tatto2);
      user.setDecoration(list[index].tatto1, list[index].tatto2);
    });

    menu.MenuClose.on(() => {
      user.updateTattoo();
    });

    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.doName == 'show')
        mp.events.callRemote('server:print:buy', item.tatto1, item.tatto2, item.price);
    });
  },

  showTattooShopApplyMenu: function (title1: string, title2: string, shopId: number) {
    UIMenu.Menu.HideMenu();
    let menu = UIMenu.Menu.Create(' ', '~b~Тату салон', false, false, false, title1, title2);
    //TODO BLACKOUT

    menu.AddMenuItem('~g~Купить').zone = 'ZONE_HEAD';
    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
    });
  },

  showRentBikeMenu: function (shopId: number, price = 1) {
    if (typeof price !== "number" || price == 0) price = 1;
    UIMenu.Menu.HideMenu();
    let menu = UIMenu.Menu.Create('', '~b~Аренда', false, false, false, 'rent', 'rent');
    //TODO BLACKOUT

    let itemPrice = 3 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 3;
    let menuItem = menu.AddMenuItem('Cruiser').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 448402357;

    itemPrice = 5 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 5;
    menuItem = menu.AddMenuItem('Bmx').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1131912276;

    itemPrice = 10 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 10;
    menuItem = menu.AddMenuItem('Fixter').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -836512833;

    itemPrice = 10 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 10;
    menuItem = menu.AddMenuItem('Scorcher').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -186537451;

    itemPrice = 30 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 20;
    menuItem = menu.AddMenuItem('TriBike').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 1127861609;

    itemPrice = 30 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 20;
    menuItem = menu.AddMenuItem('TriBike2').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -1233807380;

    itemPrice = 30 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 20;
    menuItem = menu.AddMenuItem('TriBike3').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -400295096;

    itemPrice = 60 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 40;
    menuItem = menu.AddMenuItem('Faggio').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -1842748181;

    itemPrice = 55 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 35;
    menuItem = menu.AddMenuItem('Faggio2').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = 55628203;

    itemPrice = 50 * price;
    // if (user.get('age') == 18 && user.getMonth() < 3) itemPrice = 30;
    menuItem = menu.AddMenuItem('Faggio3').SetRightLabel(`Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.hash = -1289178744;

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) mp.events.callRemote('server:rent:buy', item.hash, item.price, shopId);
      } catch (e) {
        methods.debug(e);
      }
    });
  },


  showAptekaShopMenu: function (shopId: number) {
    let menu = UIMenu.Menu.Create('', '~b~Магазин', false, false, false, 'm3', 'm3');
    //TODO BLACKOUT
    let menuItem = menu.AddMenuItem('Медстраховка', `Цена: ~g~$20,000`);
    menuItem.doName = 'medLic';

    menuItem = menu.AddMenuItem(
      'Аптечка',
      `Цена: ~g~$${PillBoxCost.healer2}~s~ с мед. страховкой\nЦена: ~g~$${PillBoxCost.healer1}`
    );
    menuItem.price = PillBoxCost.healer2;
    menuItem.itemId = 215;

    menuItem = menu.AddMenuItem(
      'Антипохмелин (x10)',
      `Цена: ~g~$${PillBoxCost.antipohmelin2x10}~s~ с мед. страховкой\nЦена: ~g~$${PillBoxCost.antipohmelin1x10}`
    );
    menuItem.price = PillBoxCost.antipohmelin2x10;
    menuItem.itemId = 221;

    /*menuItem = menu.AddMenuItem("Адреналин", `Цена: ~g~$200~s~ с мед. страховкой\nЦена: ~g~$1000`);
      menuItem.price = 200;
      menuItem.itemId = 31;*/

    menuItem = menu.AddMenuItem('Лечебная марихуана (10гр)', `Цена: ~g~$${PillBoxCost.marih2x10}~s~ с мед. страховкой\nЦена: ~g~$${PillBoxCost.marih1x10}`);
    menuItem.price = PillBoxCost.marih2x10;
    menuItem.itemId = 155;

    menu.AddMenuItem('~y~Ограбить').doName = 'grab';

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) {
          if (item.itemId == 31 && !user.get('med_lic')) item.price = 1000;
          if (item.itemId == 215 && !user.get('med_lic')) item.price = PillBoxCost.healer1;
          if (item.itemId == 221 && !user.get('med_lic')) item.price = PillBoxCost.antipohmelin1x10;
          if (item.itemId == 155 && !user.get('med_lic')) item.price = PillBoxCost.marih1x10;
          mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId, businessNalog.PillBox);
        }
        if (item.doName == 'medLic') {
          if (user.get('med_lic')) {
            mp.game.ui.notifications.show('~r~У Вас уже есть медстраховка');
            return;
          }
          if (user.getMoney() < 20000) {
            mp.game.ui.notifications.show('~r~У Вас недостаточно денег');
            return;
          }

          user.setData('med_lic', true);
          user.removeMoney(20000);
          business.addMoney(shopId, 20000);
          mp.game.ui.notifications.show('~g~Вы купили мед. страховку');
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showElectroShopMenu: function (shopId: number) {
    let menu = UIMenu.Menu.Create('', '~b~Магазин', false, false, false, shopId == 92 ? 'lifeinvader' : 'digital', shopId == 92 ? 'lifeinvader' : 'digital');
    //TODO BLACKOUT

    shopListElectro.map(itm => {
      let itemPrice = itm[1];
      let menuItem = menu.AddMenuItem(getItemNameById((itm[2] ? itm[2] : itm[0]))+(itm[3] ? (' '+itm[3]) : ''));
      menuItem.SetRightLabel(`$${methods.numberFormat(itemPrice)}`);
      menuItem.icon = "Item_" + (itm[2] ? itm[2] : itm[0]);
      menuItem.price = itemPrice;
      menuItem.itemId = itm[0];
    })


    let menuItem: MenuItemClient;

    menuItem = menu.AddMenuItem('Дверь с пинкодом для дома', `Цена: ~g~$20,000`);
    menuItem.doName = 'housePin';
    menuItem.icon = "Item_44"

    menuItem = menu.AddMenuItem('Дверь с пинкодом для квартиры', `Цена: ~g~$10,000`);
    menuItem.doName = 'condoPin';
    menuItem.icon = "Item_43"

    menuItem = menu.AddMenuItem('Дверь с пинкодом для апартаментов', `Цена: ~g~$20,000`);
    menuItem.doName = 'apartPin';
    menuItem.icon = "Item_42"

    menu.AddMenuItem('~y~Ограбить').doName = 'grab';

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
        if (item.doName == 'housePin') {
          if (user.get('id_house') == 0) {
            mp.game.ui.notifications.show('~r~У Вас нет дома');
            return;
          }
          let pin: any = await UIMenu.Menu.GetUserInput('Пинкод', '', 5);
          if (!pin.isNumberOnly()) return mp.game.ui.notifications.show('~r~Пинкод должен содержать только цифры');
          pin = methods.parseInt(pin);
          if (pin == 0) {
            mp.game.ui.notifications.show('~r~Пинкод не должен быть равен нулю');
            return;
          }
          mp.events.callRemote('server:housePin:buy', pin, shopId);
        }
        if (item.doName == 'apartPin') {
          if (user.get('apartment_id') == 0) {
            mp.game.ui.notifications.show('~r~У Вас нет апартаментов');
            return;
          }
          let pin: any = await UIMenu.Menu.GetUserInput('Пинкод', '', 5);
          if (!pin.isNumberOnly()) return mp.game.ui.notifications.show('~r~Пинкод должен содержать только цифры');
          pin = methods.parseInt(pin);
          if (pin == 0) {
            mp.game.ui.notifications.show('~r~Пинкод не должен быть равен нулю');
            return;
          }
          mp.events.callRemote('server:apartPin:buy', pin, shopId);
        }
        if (item.doName == 'condoPin') {
          if (user.get('condo_id') == 0) {
            mp.game.ui.notifications.show('~r~У Вас нет квартиры');
            return;
          }
          let pin: any = await UIMenu.Menu.GetUserInput('Пинкод', '', 5);
          if (!pin.isNumberOnly()) return mp.game.ui.notifications.show('~r~Пинкод должен содержать только цифры');
          pin = methods.parseInt(pin);
          if (pin == 0) {
            mp.game.ui.notifications.show('~r~Пинкод не должен быть равен нулю');
            return;
          }
          mp.events.callRemote('server:condoPin:buy', pin, shopId);
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showInvaderShopMenu: function (shopId = 92) {
    return menuList.showElectroShopMenu(shopId);
  },

  showGunShopMenu: function (shopId: number, price = 1) {
    if (WEAPON_LEVEL_MIN > user.getLevel()) return mp.game.ui.notifications.show('~r~Для покупки оружия необходимо требуется уровень '+WEAPON_LEVEL_MIN);
    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Магазин оружия',
      false,
      false,
      false,
      'shopui_title_gunclub',
      'shopui_title_gunclub'
    );
    //TODO BLACKOUT


    let itemPrice = weaponCost.Knife * price;
    let menuItem = menu.AddMenuItem('Нож', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 63;

    itemPrice = weaponCost.Knife2 * price;
    menuItem = menu.AddMenuItem(
      'Выкидной нож',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 69;



    itemPrice = weaponCost.Machete * price;
    menuItem = menu.AddMenuItem('Мачете', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 65;

    itemPrice = weaponCost.Taurus * price;
    menuItem = menu.AddMenuItem('Taurus PT92', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 77;
    menuItem.checkLic = true;

    itemPrice = weaponCost.P99 * price;
    menuItem = menu.AddMenuItem('P99', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 71;
    menuItem.checkLic = true;

    itemPrice = weaponCost.Obrez * price;
    menuItem = menu.AddMenuItem('Обрез', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 87;
    menuItem.checkLic = true;

    itemPrice = weaponCost.BenelliM3 * price;
    menuItem = menu.AddMenuItem('Benelli M3', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 90;
    menuItem.checkLic = true;


    itemPrice = weaponCost.P90 * price;
    menuItem = menu.AddMenuItem('P-90', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 94;
    menuItem.checkLic = true;

    itemPrice = weaponCost.MP5A3 * price;
    menuItem = menu.AddMenuItem('MP5A3', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 103;
    menuItem.checkLic = true;


    itemPrice = weaponCost.G36C * price;
    menuItem = menu.AddMenuItem('G36C', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 113;
    menuItem.checkLic = true;


    itemPrice = weaponCost.QBZ97 * price;
    menuItem = menu.AddMenuItem('QBZ-97', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.itemId = 108;
    menuItem.checkLic = true;

    itemPrice = weaponCost.box127 * price;
    menuItem = menu.AddMenuItem(
      'Коробка патронов 12.7mm',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 146;
    menuItem.countItems = 60;
    menuItem.checkLic = true;

    itemPrice = weaponCost.box9smg * price;
    menuItem = menu.AddMenuItem(
      'Коробка патронов 9mm (SMG)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 153;
    menuItem.countItems = 140;
    menuItem.checkLic = true;

    itemPrice = weaponCost.box9pistol * price;
    menuItem = menu.AddMenuItem(
      'Коробка патронов 9mm (Пистолет)',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 27;
    menuItem.countItems = 140;
    menuItem.checkLic = true;

    itemPrice = weaponCost.box185 * price;
    menuItem = menu.AddMenuItem(
      'Коробка патронов 18.5mm',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 28;
    menuItem.countItems = 60;
    menuItem.checkLic = true;

    itemPrice = weaponCost.box556 * price;
    menuItem = menu.AddMenuItem(
      'Коробка патронов 5.56mm',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 30;
    menuItem.countItems = 260;
    menuItem.checkLic = true;

    itemPrice = weaponCost.box762 * price;
    menuItem = menu.AddMenuItem(
      'Коробка патронов 7.62mm',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.itemId = 29;
    menuItem.countItems = 130;
    menuItem.checkLic = true;

    itemPrice = weaponCost.armour * price;
    menuItem = menu.AddMenuItem(
      'Лёгкий бронежилет',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.armor = 20;

    itemPrice = weaponCost.armourMiddle * price;
    menuItem = menu.AddMenuItem(
      'Средний бронежилет',
      `Цена: ~g~$${methods.numberFormat(itemPrice)}`
    );
    menuItem.price = itemPrice;
    menuItem.armor = 50;


    menu.AddMenuItem('~y~Ограбить').doName = 'grab';
    //menu.AddMenuItem("~y~Продать оружие \"Сайга\"", 'По цене: ~g~$12.000~s~ за штуку').doName = 'server:shop:sellGun';

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.armor) {
          if (item.price > user.getCashMoney()) {
            mp.game.ui.notifications.show('~r~У вас недостаточно средств');
            return;
          }
          mp.players.local.setArmour(item.armor);
          mp.game.ui.notifications.show('~b~Вы купили бронежилет');
          user.removeCashMoney(item.price);
          business.addMoney(shopId, item.price);
        } else if (item.price > 0) {
          if (item.checkLic && !user.get('gun_lic')) {
            mp.game.ui.notifications.show('~r~У Вас нет лицензии на оружие');
            return;
          }
          mp.events.callRemote(
            'server:gun:buy',
            item.itemId,
            item.price,
            item.countItems ? item.countItems : 1,
            shopId
          );
        } else if (item.doName == 'grab') {
          if (methods.getRandomInt(0, 30) == 1) user.grabGun(shopId).then();
          else user.grab(shopId);
        } else if (item.doName == 'server:shop:sellGun') {
          if (!Container.HasLocally(0, 'sellFish')) {
            Container.SetLocally(0, 'sellFish', true);
            mp.events.callRemote('server:shop:sellGun');
            setTimeout(function () {
              Container.ResetLocally(0, 'sellFish');
            }, 20000);
          } else {
            mp.game.ui.notifications.show('~r~Нельзя так часто продавать оружие');
          }
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showShopMenu: function (shopId: any, price = 1) {
    if (typeof price != "number") price = 1;
    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Магазин 24/7',
      false,
      false,
      false,
      'shopui_title_conveniencestore',
      'shopui_title_conveniencestore'
    );
    //TODO BLACKOUT

    shopList.map(itm => {
      let itemPrice = itm[1] * price;
      let menuItem = menu.AddMenuItem(getItemNameById(itm[0]));
      menuItem.SetRightLabel(`$${methods.numberFormat(itemPrice)}`);
      menuItem.icon = "Item_" + itm[0];
      menuItem.price = itemPrice;
      menuItem.itemId = itm[0];
    })

    menu.AddMenuItem('~b~Американское лото').doName = 'loto';

    menu.AddMenuItem(
      '~y~Продать сырую рыбу',
      '10% с прибыли получает владелец магазина'
    ).doName = 'server:shop:sellFish';

    menu.AddMenuItem('~y~Ограбить').doName = 'grab';

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      if (!UIMenu.Menu.getMenuDistance(5)) return;
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) mp.events.callRemote('server:shop:buy', item.itemId, item.price, shopId);
        if (item.doName == 'server:shop:sellFish') {
          if (!Container.HasLocally(0, 'sellFish')) {
            Container.SetLocally(0, 'sellFish', true);
            mp.events.callRemote('server:shop:sellFish', shopId);
            setTimeout(function () {
              Container.ResetLocally(0, 'sellFish');
            }, 20000);
          } else {
            mp.game.ui.notifications.show('~r~Нельзя так часто продавать рыбу');
          }
        }
        if (item.doName == 'grab') {
          user.grab(shopId);
        }
        if (item.doName == 'loto') {
          mp.events.callRemote('openLoto', shopId);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showBarMenu: function (shopId: number, price = 1) {
    let menu = UIMenu.Menu.Create('Бар', '~b~Меню бара');
    //TODO BLACKOUT

    let itemPrice = 1 * price;
    let menuItem = menu.AddMenuItem('Вода', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'воду';

    itemPrice = 2 * price;
    menuItem = menu.AddMenuItem('Лимонад', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'лимонад';

    itemPrice = 4 * price;
    menuItem = menu.AddMenuItem('Кола', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'колу';

    itemPrice = 5 * price;
    menuItem = menu.AddMenuItem('Пиво', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'пиво';
    menuItem.drunkLevel = 10;

    itemPrice = 10 * price;
    menuItem = menu.AddMenuItem('Водка', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'водку';
    menuItem.drunkLevel = 20;

    itemPrice = 12 * price;
    menuItem = menu.AddMenuItem('Текила', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'текилу';
    menuItem.drunkLevel = 25;

    itemPrice = 14 * price;
    menuItem = menu.AddMenuItem('Бурбон', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'бурбон';
    menuItem.drunkLevel = 30;

    itemPrice = 25 * price;
    menuItem = menu.AddMenuItem('Виски', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.label = 'виски';
    menuItem.drunkLevel = 40;

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) {
          if (user.getMoney() < item.price) {
            mp.game.ui.notifications.show('~r~У Вас недостаточно средств');
            return;
          }

          business.addMoney(shopId, item.price);
          user.removeMoney(item.price);
          healProtection()
          if (mp.players.local.health < 90) mp.players.local.health += 10;

          if (item.drunkLevel) user.addDrugLevel(99, item.drunkLevel);

          chat.sendMeCommand(`выпил ${item.label}`);
          user.playAnimation('mp_player_intdrink', 'loop_bottle', 48);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showBarFreeMenu: function (price = 1, business_id = 0) {
    let menu = UIMenu.Menu.Create('Бар', '~b~Меню бара');
    //TODO BLACKOUT

    let itemPrice = 1 * price;
    let menuItem = menu.AddMenuItem('Вода', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'воду';

    itemPrice = 2 * price;
    menuItem = menu.AddMenuItem('Лимонад', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'лимонад';

    itemPrice = 4 * price;
    menuItem = menu.AddMenuItem('Кола', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'колу';

    itemPrice = 5 * price;
    menuItem = menu.AddMenuItem('Пиво', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'пиво';
    menuItem.drunkLevel = 10;

    itemPrice = 10 * price;
    menuItem = menu.AddMenuItem('Водка', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'водку';
    menuItem.drunkLevel = 20;

    itemPrice = 12 * price;
    menuItem = menu.AddMenuItem('Текила', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'текилу';
    menuItem.drunkLevel = 20;

    itemPrice = 14 * price;
    menuItem = menu.AddMenuItem('Бурбон', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'бурбон';
    menuItem.drunkLevel = 20;

    itemPrice = 25 * price;
    menuItem = menu.AddMenuItem('Виски', itemPrice + "$");
    menuItem.price = itemPrice;
    menuItem.label = 'виски';
    menuItem.drunkLevel = 20;

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      try {
        if (item.price > 0) {
          healProtection()
          if (mp.players.local.health < 90) mp.players.local.health += 10;

          if (item.drunkLevel) user.addDrugLevel(99, item.drunkLevel);
          user.removeCashMoney(item.price);
          if (business_id != 0) {
            business.addMoney(business_id, item.price)
          }
          chat.sendMeCommand(`выпил ${item.label}`);
          user.playAnimation('mp_player_intdrink', 'loop_bottle', 48);
        }
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showLscMenu: function (shopId: number, price = 1, idx: number, vListTun: any, vListColor: any) {
    //TODO BLACKOUT

    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Автомастерская',
      false,
      false,
      false,
      lscBanner1,
      lscBanner2
    );

    let itemPrice = 400 * price;
    let menuItem = menu.AddMenuItem('Ремонт', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.doName = 'repair';

    menuItem = menu.AddMenuItem('Тюнинг');
    menuItem.doName = 'setTunning';

    // menuItem = menu.AddMenuItem('ЧИП Тюнинг');
    // menuItem.doName = 'setSTunning';

    // itemPrice = 40000;
    // menuItem = menu.AddMenuItem(
    //   'Сменить номер',
    //   `Цена: ~g~$${methods.numberFormat(itemPrice)}\n~s~Менее 4 символов от ~g~$100.000`
    // );
    // menuItem.price = itemPrice;
    // menuItem.doName = 'setNumber';

    itemPrice = 150000;
    menuItem = menu.AddMenuItem('Неон', `Цена: ~g~$${methods.numberFormat(itemPrice)}`);
    menuItem.price = itemPrice;
    menuItem.doName = 'setNeon';
    let acceptNeon = false;

    menuItem = menu.AddMenuItem('Цвет');
    menuItem.doName = 'setColor';

    menuItem = menu.AddMenuItem('~y~Сбыт угнанного ТС');
    menuItem.doName = 'sellCar';

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on((item, index) => {
      try {
        if(item.doName == 'setNeon' && !acceptNeon){
          acceptNeon = true;
          user.notify('~g~Нажмите ещё раз для подтверждения установки');
          return;
        }
        UIMenu.Menu.HideMenu();
        if (
          item.doName == 'setNeon' ||
          // item.doName == 'setSTunning' ||
          item.doName == 'setTunning' ||
          // item.doName == 'setNumber' ||
          item.doName == 'repair' ||
          item.doName == 'sellCar'
        )
          menuList.showLscVehicleListMenu(shopId, idx, vListTun, vListColor, item.doName, item.price);
        else if (item.doName == 'setColor')
          menuList.showLscVehicleColorListMenu(shopId, idx, vListTun, vListColor, item.doName, price);
      } catch (e) {
        methods.debug(e);
      }
    });
  },

  showLscVehicleListMenu: function (shopId: number, idx: number, vListTun: string[], vListColor: any, action: any, price = 1) {
    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let menu = UIMenu.Menu.Create(
      ' ',
      '~b~Автомастерская',
      false,
      false,
      false,
      lscBanner1,
      lscBanner2
    );

    vListTun.forEach(function (item) {
      menu.AddMenuItem(
        '~b~Номер авто:~s~ ' + item,
        'Нажмите ~g~Enter~s~ чтобы применить'
      ).number = item.toString();
    });

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.number) {
        if (action == 'sellCar') {
          mp.events.callRemote('server:sellVeh', item.number);
        } else if (action == 'setTunning') {
          mp.events.callRemote(
            'server:lsc:showLscVehicleTunningMenu',
            shopId,
            idx,
            item.number,
            price
          );
          // } else if (action == 'setSTunning') {
          //   mp.events.callRemote(
          //     'server:lsc:showLscVehicleSTunningMenu',
          //     shopId,
          //     idx,
          //     item.number,
          //     price
          //   );
        } else {
          let number = '';
          if (action == 'setNumber') number = await UIMenu.Menu.GetUserInput('Номер', '', 8);
          mp.events.callRemote(
            'server:lsc:buy',
            item.number,
            price,
            shopId,
            action,
            number.toUpperCase()
          );
        }
      }
    });
  },

  showLscVehicleColorListMenu: function (
    shopId: number,
    idx: number,
    vListTun: string[],
    vListColor: string[],
    action: any,
    price = 1
  ) {
    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let menu = UIMenu.Menu.Create(' ', '~b~Перекраска', false, false, false, lscBanner1, lscBanner2);

    vListColor.forEach(function (item) {
      menu.AddMenuItem(
        '~b~Номер авто:~s~ ' + item,
        'Нажмите ~g~Enter~s~ чтобы перекрасить'
      ).number = item.toString();
    });

    menu.AddMenuItem('~r~Закрыть').doName = 'closeButton';
    menu.ItemSelect.on(async (item, index) => {
      UIMenu.Menu.HideMenu();
      if (item.number) menuList.showLscVehicleColorMenu(shopId, idx, item.number, price);
    });
  },

  showLscVehicleColorMenu: function (shopId: number, idx: number, vehNumber: string, price = 1) {
    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    let camPos = new mp.Vector3(
      enums.lscCamColorPos[idx][0],
      enums.lscCamColorPos[idx][1],
      enums.lscCamColorPos[idx][2]
    );

    let cam = mp.cameras.new('lscColor', camPos, new mp.Vector3(0, 0, 0), 90);
    cam.pointAtCoord(
      enums.lscCarColorPos[idx][0],
      enums.lscCarColorPos[idx][1],
      enums.lscCarColorPos[idx][2]
    );
    cam.setActive(true);
    mp.game.cam.renderScriptCams(true, true, 500, false, false);

    let menu = UIMenu.Menu.Create(' ', '~b~Покраска', false, false, false, lscBanner1, lscBanner2);

    let list = [];
    for (let i = 0; i < 156; i++) list.push(i + '');
    let color1Item = menu.AddMenuItemList('Цвет-1', list, 'Цена: ~g~$' + 500 * price);

    list = [];
    for (let i = 0; i < 156; i++) list.push(i + '');
    let color2Item = menu.AddMenuItemList('Цвет-2', list, 'Цена: ~g~$' + 300 * price);

    let closeItem = menu.AddMenuItem('~r~Закрыть');

    menu.MenuClose.on(() => {
      try {
        cam.destroy(true);
        mp.game.cam.renderScriptCams(false, true, 500, true, true);
        mp.events.callRemote('server:lsc:resetMod', vehNumber);
      } catch (e) {
        methods.debug('Exception: menuList.showLscVehicleColorMenu menu.MenuClose');
        methods.debug(e);
      }
    });

    let currentListChangeItem: MenuItemClient = null;
    let currentListChangeItemIndex: number = null;

    menu.ListChange.on((item, index) => {
      currentListChangeItem = item;
      currentListChangeItemIndex = index;

      if (item == color1Item) mp.events.callRemote('server:lsc:showColor1', vehNumber, index);
      if (item == color2Item) mp.events.callRemote('server:lsc:showColor2', vehNumber, index);
    });
    menu.ItemSelect.on((item, index) => {
      if (item == closeItem) UIMenu.Menu.HideMenu();
      if (item == color1Item)
        mp.events.callRemote(
          'server:lsc:buyColor1',
          vehNumber,
          currentListChangeItemIndex,
          500 * price,
          shopId
        );
      else if (item == color2Item)
        mp.events.callRemote(
          'server:lsc:buyColor2',
          vehNumber,
          currentListChangeItemIndex,
          300 * price,
          shopId
        );
    });
  },

  showLscVehicleSTunningMenu: async function (shopId: number, idx: number, vehNumber: string, vehId: number, price = 1) {
    mp.game.ui.notifications.show('~b~Кнопки ~s~[ ~b~,~s~ ]~b~ для поворота камеры');
    mp.game.ui.notifications.show('~b~Кнопки ~s~+ ~b~,~s~ -~b~ для отдаления камеры');
    mp.game.ui.notifications.show('~b~Кнопка ~s~K ~b~открывает и закрывает все двери');

    enums.lscCamRot = enums.lscCamRot - 0.2;
    let pos = new mp.Vector3(
      enums.lscCam.getRange * Math.sin(enums.lscCamRot) + enums.lscCam.getPointAtCoords.x,
      enums.lscCam.getRange * Math.cos(enums.lscCamRot) + enums.lscCam.getPointAtCoords.y,
      enums.lscCam.getPointAtCoords.z
    );
    enums.lscCam.setCoord(pos.x, pos.y, pos.z + 1.7);

    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    try {
      let veh = mp.vehicles.atRemoteId(vehId);
      /*for (let i = 0; i < enums.lscClassPrice.length; i++) {
              if (vehInfo.class_name == enums.lscClassPrice[i][0])
                  price = enums.lscClassPrice[i][1];
          }*/

      let car = await vehicles.getData(veh.getVariable('container'));
      let upgrade = null;
      if (car.has('upgrade')) upgrade = JSON.parse(car.get('upgrade'));

      if (veh.getVariable('price') >= 8000 && veh.getVariable('price') < 15000) price = 1.2;
      else if (veh.getVariable('price') >= 15000 && veh.getVariable('price') < 30000) price = 1.4;
      else if (veh.getVariable('price') >= 30000 && veh.getVariable('price') < 45000) price = 1.6;
      else if (veh.getVariable('price') >= 45000 && veh.getVariable('price') < 60000) price = 1.8;
      else if (veh.getVariable('price') >= 60000 && veh.getVariable('price') < 75000) price = 2;
      else if (veh.getVariable('price') >= 90000 && veh.getVariable('price') < 105000) price = 2.2;
      else if (veh.getVariable('price') >= 105000 && veh.getVariable('price') < 120000) price = 2.4;
      else if (veh.getVariable('price') >= 120000 && veh.getVariable('price') < 135000) price = 2.6;
      else if (veh.getVariable('price') >= 135000 && veh.getVariable('price') < 150000) price = 2.8;
      else if (veh.getVariable('price') >= 150000 && veh.getVariable('price') < 200000) price = 3;
      else if (veh.getVariable('price') >= 200000 && veh.getVariable('price') < 240000) price = 3.3;
      else if (veh.getVariable('price') >= 240000 && veh.getVariable('price') < 280000) price = 3.6;
      else if (veh.getVariable('price') >= 280000 && veh.getVariable('price') < 320000) price = 4;
      else if (veh.getVariable('price') >= 320000 && veh.getVariable('price') < 380000) price = 4.4;
      else if (veh.getVariable('price') >= 380000 && veh.getVariable('price') < 500000) price = 5;
      else if (veh.getVariable('price') >= 500000 && veh.getVariable('price') < 600000) price = 5.5;
      else if (veh.getVariable('price') >= 600000 && veh.getVariable('price') < 700000) price = 6;
      else if (veh.getVariable('price') >= 700000 && veh.getVariable('price') < 800000) price = 6.5;
      else if (veh.getVariable('price') >= 800000) price = 7;

      let camPos = new mp.Vector3(
        enums.lscCamPos[idx][0],
        enums.lscCamPos[idx][1],
        enums.lscCamPos[idx][2] + 0.7
      );
      let carPos = new mp.Vector3(enums.lscCarPos[idx][0], enums.lscCarPos[idx][1], veh.position.z);

      veh.freezePosition(true);

      enums.lscCam = mp.cameras.new(
        'lscTun',
        new mp.Vector3(
          3.4 * Math.sin(enums.lscCamRot) + carPos.x,
          3.4 * Math.cos(enums.lscCamRot) + carPos.y,
          carPos.z + 0.7
        ),
        new mp.Vector3(0, 0, 0),
        90
      );
      enums.lscCam.pointAtCoord(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.setActive(true);
      enums.lscCam.getPointAtCoords = new mp.Vector3(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.getRange = 3.4;
      enums.lscCam.vehId = vehId;
      veh.allDoorsOpen = true;
      for (let i = 0; i < 8; i++) veh.setDoorOpen(i, false, true);
      mp.game.cam.renderScriptCams(true, true, 500, false, false);

      let menu = UIMenu.Menu.Create(
        ' ',
        '~b~Стандарт. настройки БЕСПЛАТНЫ',
        false,
        false,
        false,
        lscBanner1,
        lscBanner2
      );

      let globalList: string[][] = [];
      let modId = 0;
      let list2 = ['Стандарт', 'Задний', 'Полный', 'Передний'];
      globalList.push(list2);
      let q = <number>enums.lscSNames[modId][1];
      let itemPrice = methods.parseInt(q * price);
      let listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          switch (upgrade[modId + 100].toString()) {
            case '0':
              listItem.Index = 3;
              break;
            case '0.5':
              listItem.Index = 2;
              break;
            case '1':
              listItem.Index = 1;
              break;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 1;
      list2 = ['Стандарт'];
      for (let i = 1; i <= 15; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      let qw = <number>enums.lscSNames[modId][1];
      itemPrice = methods.parseInt(qw * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            methods.debug(upgrade[modId + 100], list2[i], i);
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 2;
      list2 = ['Стандарт'];
      for (let i = 1; i <= 11; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      let qe = <number>enums.lscSNames[modId][1];
      itemPrice = methods.parseInt(qe * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            methods.debug(upgrade[modId + 100], list2[i], i);
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 3;
      list2 = ['Стандарт'];
      for (let i = 1; i <= 20; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      let qa = <number>enums.lscSNames[modId][1]
      itemPrice = methods.parseInt(qa * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 4;
      list2 = ['Стандарт'];
      for (let i = 1; i <= 10; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 5;
      list2 = ['Стандарт'];
      for (let i = 1; i <= 8; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 6;
      list2 = ['Стандарт'];
      for (let i = 5; i <= 16; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 7;
      list2 = ['Стандарт'];
      for (let i = 10; i <= 30; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      modId = 8;
      list2 = ['Стандарт'];
      for (let i = 14; i <= 30; i++) list2.push((i / 10).toString());
      globalList.push(list2);
      itemPrice = methods.parseInt((<number>enums.lscSNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscSNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.sType = modId;
      listItem.price = itemPrice;
      try {
        if (upgrade != null && upgrade[modId + 100]) {
          for (let i = 0; i < list2.length; i++) {
            if (upgrade[modId + 100].toString() === list2[i].toString()) listItem.Index = i;
          }
        }
      } catch (e) {
        methods.debug(e);
      }

      let closeItem = menu.AddMenuItem('~r~Закрыть');

      menu.MenuClose.on(() => {
        try {
          enums.lscCam.destroy(true);
          mp.game.cam.renderScriptCams(false, true, 500, true, true);
          enums.lscCam = null;
          mp.events.callRemote('server:lsc:resetMod', vehNumber);
          veh.freezePosition(false);

          veh.allDoorsOpen = false;
          for (let i = 0; i < 8; i++) veh.setDoorShut(i, true);
        } catch (e) {
          methods.debug('Exception: menuList.showLscVehicleTunningMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex: number = null;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;

        mp.game.ui.notifications.show('~b~Кнопки ~s~[ ~b~и~s~ ]~b~ для поворота камеры');
        mp.game.ui.notifications.show('~b~Кнопки ~s~+ ~b~и~s~ -~b~ для отдаления камеры');
        mp.game.ui.notifications.show('~b~Кнопка ~s~K ~b~открывает и закрывает все двери');
      });
      menu.ItemSelect.on((item, index) => {
        if (item == closeItem) UIMenu.Menu.HideMenu();
        if (index == currentListChangeItemIndex) {
          if (currentListChangeItemIndex == 0) {
            mp.game.ui.notifications.show('~y~Для того чтобы всё работало');
            mp.game.ui.notifications.show('~y~Необходимо перереспавнить трансопрт');
            mp.events.callRemote('server:lsc:resetSTun', vehNumber, item.sType);
          } else {
            if (item.sType == 0)
              mp.events.callRemote(
                'server:lsc:buySTun',
                vehNumber,
                item.sType,
                currentListChangeItemIndex,
                item.price,
                shopId
              );
            else
              mp.events.callRemote(
                'server:lsc:buySTun',
                vehNumber,
                item.sType,
                globalList[item.sType][currentListChangeItemIndex],
                item.price,
                shopId
              );
          }
        }
      });
    } catch (e) {
      methods.debug(e);
    }
  },

  showLscVehicleTunningMenu: function (shopId: number, idx: number, vehNumber: string, vehId: number, price = 1) {
    mp.game.ui.notifications.show('~b~Кнопки ~s~[ ~b~и~s~ ]~b~ для поворота камеры');
    mp.game.ui.notifications.show('~b~Кнопки ~s~+ ~b~и~s~ -~b~ для отдаления камеры');
    mp.game.ui.notifications.show('~b~Кнопка ~s~K ~b~открывает и закрывает все двери');

    let lscBanner1 = 'shopui_title_ie_modgarage';
    let lscBanner2 = 'shopui_title_ie_modgarage';

    switch (shopId) {
      case 14:
      case 54:
      case 55:
      case 57:
        lscBanner1 = 'shopui_title_carmod';
        lscBanner2 = 'shopui_title_carmod';
        break;
      case 71:
        lscBanner1 = 'shopui_title_carmod2';
        lscBanner2 = 'shopui_title_carmod2';
        break;
      case 56:
        lscBanner1 = 'shopui_title_supermod';
        lscBanner2 = 'shopui_title_supermod';
        break;
    }

    try {
      let veh = mp.vehicles.atRemoteId(vehId);
      let vehInfo = methods.getVehicleInfo(veh.model);
      /*for (let i = 0; i < enums.lscClassPrice.length; i++) {
              if (vehInfo.class_name == enums.lscClassPrice[i][0])
                  price = enums.lscClassPrice[i][1];
          }*/

      if (veh.getVariable('price') >= 8000 && veh.getVariable('price') < 15000) price = 1.2;
      else if (veh.getVariable('price') >= 15000 && veh.getVariable('price') < 30000) price = 1.4;
      else if (veh.getVariable('price') >= 30000 && veh.getVariable('price') < 45000) price = 1.6;
      else if (veh.getVariable('price') >= 45000 && veh.getVariable('price') < 60000) price = 1.8;
      else if (veh.getVariable('price') >= 60000 && veh.getVariable('price') < 75000) price = 2;
      else if (veh.getVariable('price') >= 90000 && veh.getVariable('price') < 105000) price = 2.2;
      else if (veh.getVariable('price') >= 105000 && veh.getVariable('price') < 120000) price = 2.4;
      else if (veh.getVariable('price') >= 120000 && veh.getVariable('price') < 135000) price = 2.6;
      else if (veh.getVariable('price') >= 135000 && veh.getVariable('price') < 150000) price = 2.8;
      else if (veh.getVariable('price') >= 150000 && veh.getVariable('price') < 200000) price = 3;
      else if (veh.getVariable('price') >= 200000 && veh.getVariable('price') < 240000) price = 3.3;
      else if (veh.getVariable('price') >= 240000 && veh.getVariable('price') < 280000) price = 3.6;
      else if (veh.getVariable('price') >= 280000 && veh.getVariable('price') < 320000) price = 4;
      else if (veh.getVariable('price') >= 320000 && veh.getVariable('price') < 380000) price = 4.4;
      else if (veh.getVariable('price') >= 380000 && veh.getVariable('price') < 500000) price = 5;
      else if (veh.getVariable('price') >= 500000 && veh.getVariable('price') < 600000) price = 5.5;
      else if (veh.getVariable('price') >= 600000 && veh.getVariable('price') < 700000) price = 6;
      else if (veh.getVariable('price') >= 700000 && veh.getVariable('price') < 800000) price = 6.5;
      else if (veh.getVariable('price') >= 800000) price = 7;

      let camPos = new mp.Vector3(
        enums.lscCamPos[idx][0],
        enums.lscCamPos[idx][1],
        enums.lscCamPos[idx][2] + 0.7
      );
      let carPos = new mp.Vector3(enums.lscCarPos[idx][0], enums.lscCarPos[idx][1], veh.position.z);

      veh.freezePosition(true);

      enums.lscCam = mp.cameras.new(
        'lscTun',
        new mp.Vector3(
          3.4 * Math.sin(enums.lscCamRot) + carPos.x,
          3.4 * Math.cos(enums.lscCamRot) + carPos.y,
          carPos.z + 0.7
        ),
        new mp.Vector3(0, 0, 0),
        90
      );
      enums.lscCam.pointAtCoord(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.setActive(true);
      enums.lscCam.getPointAtCoords = new mp.Vector3(carPos.x, carPos.y, carPos.z - 1);
      enums.lscCam.getRange = 3.4;
      enums.lscCam.vehId = vehId;
      mp.game.cam.renderScriptCams(true, true, 500, false, false);

      let menu = UIMenu.Menu.Create(' ', '~b~Тюнинг', false, false, false, lscBanner1, lscBanner2);

      let itemPrice:number;
      let listItem: MenuItemClient;
      let list2:string[] = [];

      let modId = 11;
      if (veh.getNumMods(modId)){
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('Level ' + i);
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Цена за 1 lvl: ~g~$${methods.numberFormat(itemPrice)}\n~s~Ставить по очереди не обязательно`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      modId = 12;
      if (veh.getNumMods(modId)) {
        list2 = [];
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('Level ' + i);
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Цена за 1 lvl: ~g~$${methods.numberFormat(itemPrice)}\n~s~Ставить по очереди не обязательно`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }
      modId = 13;
      if (veh.getNumMods(modId)) {
        list2 = [];
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('Level ' + i);
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Цена за 1 lvl: ~g~$${methods.numberFormat(
            itemPrice
          )}\n~s~Ставить по очереди не обязательно`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      modId = 14;
      if (veh.getNumMods(modId)) {
        list2 = [];
        for (let i = 0; i < veh.getNumMods(modId); i++) list2.push('' + i);
        itemPrice = methods.parseInt(enums.lscNames[modId][1]);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Цена: ~g~$${methods.numberFormat(itemPrice)}`
        );
        listItem.Index = veh.getMod(modId);
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      list2 = [
        'Спорт',
        'Массл',
        'Лоурайдер',
        'Кроссовер',
        'Внедорожник',
        'Специальные',
        'Мото',
        'Уникальные',
      ];
      listItem = menu.AddMenuItemList(
        `Тип колёс`,
        list2,
        `Цена: ~g~Бесплатно\n~s~Нажмите ~g~Enter~s~ чтобы применить`
      );
      listItem.Index = veh.getWheelType();
      listItem.modType = 78;
      listItem.price = 0;

      for (let i = 0; i < 100; i++) {
        try {
          if (i == 11) continue;
          if (i == 12) continue;
          if (i == 13) continue;
          if (i == 14) continue;
          if (i == 46) continue;
          if (veh.getNumMods(i) == 0) continue;

          if (i == 1 || i == 10) {
            if (
              vehInfo.display_name == 'Havok' ||
              vehInfo.display_name == 'Microlight' ||
              vehInfo.display_name == 'Seasparrow' ||
              vehInfo.display_name == 'Revolter' ||
              vehInfo.display_name == 'Viseris' ||
              vehInfo.display_name == 'Savestra' ||
              vehInfo.display_name == 'Deluxo' ||
              vehInfo.display_name == 'Comet4'
            )
              continue;
          }

          if (veh.getNumMods(i) > 0 && enums.lscNames[i][1] > 0) {
            let list = [];
            for (let j = 0; j <= veh.getNumMods(i); j++) list.push(j + '');

            let itemPrice = methods.parseInt((<number>enums.lscNames[i][1]) * price);
            let listItem = menu.AddMenuItemList(
              `${enums.lscNames[i][0]}`,
              list,
              `Цена: ~g~$${methods.numberFormat(itemPrice)}`
            );
            listItem.Index = veh.getMod(i);
            listItem.modType = i;
            listItem.price = itemPrice;
          }
        } catch (e) {
          methods.debug(e);
        }
      }

      list2 = ['~b~Установить', '~r~Снять'];
      modId = 22;
      itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.Index = veh.getMod(modId);
      listItem.modType = modId;
      listItem.price = itemPrice;

      modId = 18;
      list2 = ['~b~Установить', '~r~Снять'];
      itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.Index = veh.getMod(modId);
      listItem.modType = modId;
      listItem.price = itemPrice;

      modId = 69;
      list2 = [];
      for (let i = 0; i < 6; i++) list2.push(i + '');
      itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
      listItem = menu.AddMenuItemList(
        `${enums.lscNames[modId][0]}`,
        list2,
        `Цена: ~g~$${methods.numberFormat(itemPrice)}`
      );
      listItem.Index = veh.getWindowTint();
      listItem.modType = modId;
      listItem.price = itemPrice;

      if (veh.getLiveryCount() > 0) {
        modId = 77;
        list2 = [];
        for (let i = 0; i <= veh.getLiveryCount(); i++) list2.push(i + '');
        itemPrice = methods.parseInt((<number>enums.lscNames[modId][1]) * price);
        listItem = menu.AddMenuItemList(
          `${enums.lscNames[modId][0]}`,
          list2,
          `Цена: ~g~$${methods.numberFormat(itemPrice)}`
        );
        listItem.Index = veh.getLivery();
        listItem.modType = modId;
        listItem.price = itemPrice;
      }

      let closeItem = menu.AddMenuItem('~r~Закрыть');

      menu.MenuClose.on(() => {
        try {
          enums.lscCam.destroy(true);
          mp.game.cam.renderScriptCams(false, true, 500, true, true);
          enums.lscCam = null;
          mp.events.callRemote('server:lsc:resetMod', vehNumber);
          veh.freezePosition(false);

          veh.allDoorsOpen = false;
          for (let i = 0; i < 8; i++) veh.setDoorShut(i, true);
        } catch (e) {
          methods.debug('Exception: menuList.showLscVehicleTunningMenu menu.MenuClose');
          methods.debug(e);
        }
      });

      let currentListChangeItem: MenuItemClient = null;
      let currentListChangeItemIndex: number = null;

      menu.ListChange.on((item, index) => {
        currentListChangeItem = item;
        currentListChangeItemIndex = index;
        mp.game.ui.notifications.show('~b~Кнопки ~s~[ ~b~и~s~ ]~b~ для поворота камеры');
        mp.game.ui.notifications.show('~b~Кнопки ~s~+ ~b~и~s~ -~b~ для отдаления камеры');
        mp.game.ui.notifications.show('~b~Кнопка ~s~K ~b~открывает и закрывает все двери');

        if (item.modType == 22) currentListChangeItemIndex = currentListChangeItemIndex - 1;

        mp.events.callRemote(
          'server:lsc:checkTun',
          vehNumber,
          item.modType,
          currentListChangeItemIndex
        );
      });
      menu.ItemSelect.on((item, index) => {
        if (item == closeItem) UIMenu.Menu.HideMenu();
        if (item == currentListChangeItem) {
          if (item.modType == 22) currentListChangeItemIndex = currentListChangeItemIndex - 1;

          if (item.modType == 11 || item.modType == 12 || item.modType == 13)
            mp.events.callRemote(
              'server:lsc:buyTun',
              vehNumber,
              item.modType,
              currentListChangeItemIndex,
              item.price * currentListChangeItemIndex,
              shopId
            );
          else
            mp.events.callRemote(
              'server:lsc:buyTun',
              vehNumber,
              item.modType,
              currentListChangeItemIndex,
              item.price,
              shopId
            );

          if (item.modType == 78) {
            UIMenu.Menu.HideMenu();
            veh.setWheelType(currentListChangeItemIndex);
            mp.game.ui.notifications.show('~b~Тип колёс был обновлён');
            setTimeout(function () {
              menuList.showLscVehicleTunningMenu(shopId, idx, vehNumber, vehId, price);
            }, 500);
          }
        }
      });
    } catch (e) {
      methods.debug(e);
    }
  },

};

export { menuList };


setInterval(() => {
  if (!user.get('walkietalkie_num')) return;
  if (user.isGos()) return;
  if (user.get('walkietalkie_num').indexOf('.') == -1) return;
  const freq = methods.parseInt(user.get('walkietalkie_num').split('.')[0]);
  if (!isNaN(freq) && freq > 2000 && freq < 3000) {
    mp.game.ui.notifications.show('~r~Вы не можете пользоватся указанной частотой рации');
    user.set('walkietalkie_num', "0.0");
    user.setData('walkietalkie_num', "0.0");
    mp.events.callRemote('voice.server.changeRadioFrequency', "0.0");
    return;
  }
}, 10000)