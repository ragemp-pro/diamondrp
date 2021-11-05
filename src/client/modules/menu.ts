/// <reference path="../../declaration/client.ts" />
export {}
import { methods } from './methods';
import { user } from '../user';
import * as NativeUI from '../NativeUI';
import { MenuItemBase } from "../../util/menu";
import { gui } from './gui';
import { wait } from '../../util/methods';
import { _playerDisableAllControls } from './events';
import { currentMenu, MenuClass } from '../managers/menu';


let _isShowInput: boolean;


interface UIItem {
  Text: string;
  Index: number;
  IndexToItem(index: number): string;
}

let inputGenId = 1;

setInterval(() => {
  if(!user.isLogin()) return;
  if((user.isCuff() || user.isTie() || user.isDead() || _playerDisableAllControls) && Menu.GetCurrentMenu() && !Menu.GetCurrentMenu().workAnyTime) Menu.HideMenu();
}, 100)

let openMenuPosition: Vector3Mp;
class Menu {
  /** Проверит отошёл ли игрок далеко */
  static getMenuDistance(range = 5, notify = false) {
    let playerPos = mp.players.local.position;
    let check =
      mp.game.gameplay.getDistanceBetweenCoords(
        playerPos.x,
        playerPos.y,
        playerPos.z,
        openMenuPosition.x,
        openMenuPosition.y,
        openMenuPosition.z,
        true
      ) <= range;
    if (!check && notify) mp.game.ui.notifications.show('~r~Вы отошли слишком далеко');
    if (!check) this.HideMenu();
    return check;
  }
  static Create(
    title: string,
    subtitle: string,
    isResetBackKey?: boolean,
    isDisableAllControls?: boolean,
    DisableAllControlsOnClose?: boolean,
    spriteLib = 'commonmenu',
    spriteName = 'gradient_bgd',
    workAnyTime = false
  ) {
    try {
      this.HideMenu();

      if ((user.isCuff() || user.isTie() || user.isDead() || _playerDisableAllControls) && !workAnyTime) return;


      let m = new MenuClass(title, subtitle, [], true);
      m.workAnyTime = workAnyTime;
      if (spriteLib != "commonmenu" || spriteName != "gradient_bgd"){
        m.spriteName = spriteName;
      }
      setTimeout(() => {
        m.open();
      }, 100);


      if (isDisableAllControls) {
        mp.players.local.freezePosition(true);
        methods.disableAllControls(true);
        //mp.events.call('modules:client:player:DisableAllControls', true);
      }

      mp.events.triggerBrowser('cef:hud:disableHud', true);

      openMenuPosition = mp.players.local.position;
      m.MenuClose.on(() => {
        mp.players.local.freezePosition(false);
        methods.disableAllControls(false);
        mp.events.triggerBrowser('cef:hud:disableHud', false);
        //mp.events.call('modules:client:player:DisableAllControls', false);
      });
      return m;


    } catch (e) {
      mp.console.logError(e);
    }
    /*
        if (isResetBackKey === true)
            menu.Reset(Menu.Controls.BACK);
*/
    // return menuItem;
  }

  static GetCurrentMenu() {
    return currentMenu;
  }

  static IsShowInput() {
    return _isShowInput || mp.gui.chat.enabled;
  }

  static GetUserInput(title: string, defaultText: string, maxInputLength = 20, type:"text"|"password"|"int"|"float"|"textarea" = null):Promise<string> {
    return new Promise(async (resolve) => {
      if (currentMenu) currentMenu.onclose = null;
      this.HideMenu()
      while(mp.game.controls.isControlPressed(0,176)) await wait(1)
      user.setVariable('isTyping', true);
      mp.events.triggerBrowser('cef:chat:can_activate', false);
        if(type == null && maxInputLength >= 50){
          type = "textarea"
        }
        if(type == null) type = "text";
        const id = inputGenId++;
        answers.set(id, resolve);
        _isShowInput = true;
        mp.gui.chat.activate(false);
        await methods.sleep(100);
        gui.setGui('dialog')          
        await methods.sleep(100);
        mp.events.triggerBrowser('cef:dialog:init', 0, id, title, " ", type, "Отмена", "Отправить", defaultText, true, maxInputLength);
      // _isShowInput = false;
      // user.setVariable('isTyping', false);
      // mp.events.triggerBrowser('cef:chat:can_activate', true);
    })
  }

  static HideMenu() {
    if (currentMenu) currentMenu.close();
  }
}
let answers:Map<number,(res:string)=>any> = new Map();
mp.events.add(`client:dialog:submit`, (id, value) => {
  mp.console.logInfo("ANSWER");
  inputGenId++;
  _isShowInput = false;
  //mp.gui.chat.activate(true)
  user.setVariable('isTyping', false);
  gui.setGui(null);
  mp.events.triggerBrowser('cef:chat:can_activate', true);
  answers.get(id)(value);
  answers.delete(id);
})
mp.events.add(`dialog:stop`, (id, value) => {
  // mp.console.logInfo("ANSWER");
  inputGenId++;
  _isShowInput = false;
  //mp.gui.chat.activate(true)
  user.setVariable('isTyping', false);
  gui.setGui(null);
  mp.events.triggerBrowser('cef:chat:can_activate', true);
  // answers.get(id)(value);
  // answers.delete(id);
})

mp.events.add('render', () => {
  if (currentMenu) {
    mp.game.controls.disableControlAction(2, 200, true);
  }
});





interface MenuItem extends MenuItemBase {
  /** Колбек, который вызывается при нажатии на пункт
   * - index - номер
   * - item - объект пункта меню
   */
  onpress?:(index:number,item:MenuItem)=>any;
  /** Колбек, который вызывается при нажатии на пункт
   * - index - номер
   * - item - объект пункта меню
   */
  onchange?:(index:number,item:MenuItem)=>any;
}

setTimeout(() => {
  mp.events.register("server:input", (title:string, value:string, limit: number) => {
    return new Promise(async resolve => {
      resolve(await Menu.GetUserInput(title, value, limit));
    })
  })
}, 100)

let serverEventClose = false;
mp.events.add('server:menu:close', () => {
  serverEventClose = true;
  Menu.HideMenu();
  serverEventClose = false
})


let longMenuData: {
  id:number;
  title:string;
  subtitle:string;
  customParams:{
    isResetBackKey?: boolean,
    isDisableAllControls?: boolean,
    DisableAllControlsOnClose?: boolean;
  };
  length:number;
  items:MenuItem[],
  itemsBlock:MenuItem[][],
  workAnyTime:boolean;
};




export default { Menu };
