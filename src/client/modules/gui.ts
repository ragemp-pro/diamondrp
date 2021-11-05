/// <reference path="../../declaration/client.ts" />

import { user } from '../user';
import { methods } from './methods';
import { ui } from './ui';
import { weather } from '../managers/weather';
import { hiddenIdMask } from '../../util/mask';

mp.gui.chat.show(false);

let browser: BrowserMp;

let mapEventList: { id: string, name: string, x: number, y: number, z: number, range: number }[] = []

mp.events.add('mapEvent:new', (datas: string) => {
  const item: { id: string, name: string, x: number, y: number, z: number, range: number } = JSON.parse(datas);
  mapEventList.push(item);
})
mp.events.add('mapEvent:load', (datas: string) => {
  const data: { id: string, name: string, x: number, y: number, z: number, range: number }[] = JSON.parse(datas);
  mapEventList.push(...data);
})
mp.events.add('mapEvent:remove', (id: string) => {
  mapEventList.map((item, i) => {
    if (item.id === id) mapEventList.splice(i, 1);
  })
})

let currentEventZone:string = null
setInterval(() => {
  if(!user.isLogin()) return;
  let eventName:string = null;
  mapEventList.map(item => {
    if(methods.distanceToPos2D({...item}, mp.players.local.position) < item.range) eventName = item.name
  })
  if (currentEventZone == eventName) return;
  currentEventZone = eventName;
  gui.browser.execute(`CEF.hud.setSpecialZone(${eventName ? "'" + eventName+"'" : 'null'})`)
}, 1000)


const gui = {
  updateChatSettings: () => {
    if (!mp.storage.data.heightChat) mp.storage.data.heightChat = 30;
    if (!mp.storage.data.fontChat) mp.storage.data.fontChat = 16;
    mp.events.triggerBrowser('cef:chat:params', mp.storage.data)
    // gui.browser.execute(`CEF.hud.chatConf("${JSON.stringify(mp.storage)}")`);
  },
  browser,
  hudLoaded: false,
  currentGui: <string>null,
  chatActive: false,
  showSpeedometer: false,
  setGui: (guiName: string) => {
    mp.console.logWarning(gui.browser ? "BROWSER EXISTS" : "NO BROWSER EXISTS")
    gui.currentGui = guiName;
    gui.browser.execute(`CEF.gui.setGui(${guiName === null ? 'null' : "'" + guiName + "'"})`);
  },
  isActionGui: () => {
    return ['personage', 'license', 'dialog', 'police_bage', 'npc', 'quests', 'inventory', 'tablet', 'atm'].includes(gui.currentGui);
  },
  isActionMoveGui: () => {
    return ['inventory', 'tablet'].includes(gui.currentGui);
  },
  updateHud: () => {
    if (user.isLogin() && gui.hudLoaded) {
      gui.browser.execute(`
      CEF.hud.setHasBankCard(${!!(user.get('bank_prefix') > 0)});
      CEF.hud.setHasWatch(${!!user.get('item_clock')});
      CEF.hud.setTime('${weather.getFullRpTime()}');
      CEF.hud.setDate('${weather.getMonthYearDate()}');
      CEF.hud.setTemp(${weather.getWeatherTemp()});
      CEF.hud.setCompass('${ui.updateDirectionText()}');
      CEF.hud.setStat('${weather.getRealFullDateTime()}', ${mp.players.length}, ${user.get('id')}, ${user.isAdmin() && mp.players.local.getVariable('enableAdmin')}, ${user.godmode}, ${!!mp.players.local.getVariable('isAfk') ? 'true' : 'false'}, ${user.isAdmin() && mp.players.local.getVariable('enableAdmin') && mp.players.local.getVariable('enableAdminHidden')}, ${hiddenIdMask.includes(mp.players.local.getDrawableVariation(1)) ? 'true' : 'false'});
      CEF.hud.setZone('${escape(ui.getCurrentZone())}', '${escape(ui.getCurrentStreet())}');`
      );
    }
  },
};

setInterval(() => {
  if (gui.currentGui == 'tablet') mp.events.triggerBrowser('setTimeTablet', weather.getFullRpTime())
}, 1000)

mp.events.add('web:browsers:urls', (q) => {
  let url = q[0]

  browser = mp.browsers.new(url);
  browser.markAsChat();
  gui.browser = browser;
  gui.browser.executeAll = (code: string[]) => {
    const call = code.reduce((str, func) => {
      if (func.split('').slice(-1)[0] == ';') {
        func = func.slice(0, -1);
      }
      return str + func + ';';
    }, '');
    gui.browser.execute(call);
  }
  setTimeout(() => {
    gui.updateChatSettings();
  }, 5000)
});

mp.events.add('mainBrowserInited', () => {
  mp.events.triggerBrowser('cef:hud:setChips', user.chipsBalance);
  gui.updateChatSettings()
});

let disableEsc = false;

mp.events.add('client:gui:set', (guiName) => {
  gui.setGui(guiName);
});

mp.events.add('client:gui:updateGui', (guiName) => {
  gui.currentGui = guiName == '/' ? null : guiName;
  if (guiName != '/') {
    disableEsc = true;
  } else if (!['/reg', '/login', '/newpass'].includes(guiName)) {
    setTimeout(() => {
      if (gui.currentGui === null) disableEsc = false;
    }, 500);
  }
})

mp.events.add('render', () => {
  if (((gui.chatActive || gui.currentGui) && !mp.game.ui.isPauseMenuActive()) || disableEsc) {
    mp.game.controls.disableControlAction(2, 200, true);
  }
  if (mp.game.controls.isDisabledControlJustReleased(2, 200)) {
    if (['azs', 'license', 'police_bage', 'quests', 'npc', 'casino', 'chest_equip', 'inventory', 'tablet', 'atm', 'autosale'].includes(gui.currentGui)) {
      if (gui.currentGui === 'inventory') {
        mp.events.callSocket('inventory:close');
        gui.setGui(null)
      } else if (gui.currentGui === 'casino') {
        mp.events.callSocket('onPressKeyCasino:e')
      } else if (browser) {
        gui.setGui(null)
      }
    }
  }
});


const progressbar = {
  isShowed: false,
  /**
   * @param text - optional, analog setText
   */
  show: (text?: string) => {
    if (text) {
      progressbar.setText(text);
    }
    gui.browser.execute(`CEF.progressbar.show(true)`);
    progressbar.isShowed = true;
  },
  hide: () => {
    gui.browser.execute(`CEF.progressbar.show(false)`);
    progressbar.isShowed = false;
  },
  /**
   * @param width - percent (0% - 100%)
   */
  update: (width: number) => {
    gui.browser.execute(`CEF.progressbar.update(${width})`);
  },
  setText: (text: string) => {
    gui.browser.execute(`CEF.progressbar.setText('${escape(text)}')`);
  }
}

// mp.keys.bind(0x72, false, function() {
//   if (gui.chatActive) return;
//   if (!user.isLogin()) return;
//   if(gui.currentGui) return;
//   mp.gui.cursor.visible = !mp.gui.cursor.visible
// });

export { gui, progressbar };


mp.keys.bind(119, false, function() {
  if (gui.chatActive) return;
  if (!user.isLogin()) return;
  if(gui.currentGui) return;
  mp.events.callSocket("server:show:quests")
});
