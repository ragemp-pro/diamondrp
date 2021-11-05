/// <reference path="../../declaration/server.ts" />

import { user } from "../user";
import { MenuItemBase, MenuItem, MenuItemFromClientToServer } from "../../util/menu";
import { methods } from "../modules/methods";
import { fractionList } from "../../util/fractions";


export class MenuClass {
  /** Уникальный ID каждого конструктора меню */
  private readonly id:number;
  /** Игрок, за которым меню закреплено */
  readonly player: PlayerMp;
  /** Заголовок меню */
  title: string;
  /** Подзаголовок меню */
  subtitle: string;
  /** Пункты меню */
  items: MenuItem[];
  /** Доп дамп данных игрока */
  private playerData: {
    id:number;
    dbid:number;
  }
  /** Флаг работы в наручниках */
  workAnyTime: boolean;
  /** Защита от выхода из всех колшейпов */
  exitProtect:boolean;
  /** Защита от выхода из определённых колшейпов */
  exitProtectList:ColshapeMp[];
  /** Доп параметры */
  customParams: {
    isResetBackKey?: boolean,
    isDisableAllControls?: boolean,
    DisableAllControlsOnClose?: boolean;
    closeEvent?: boolean;
    selected?: number;
  }
  title_image?:string;
  closedMenu: boolean
  onclose: () => Promise<void>|void;
  tm: number;
  sprite?: string;
  constructor(player:PlayerMp,title:string,subtitle:string,items?:MenuItem[]){
    this.workAnyTime = false;
    this.tm = new Date().getTime();
    this.exitProtect = false;
    this.exitProtectList = [];
    menu.idgen++;
    this.closedMenu = false;
    this.id = menu.idgen
    this.player = player;
    if(this.player.serverMenu){
      this.player.serverMenu.close(true);
    }
    this.playerData = {
      id: player.id,
      dbid: user.getId(player),
    }
    this.title = title;
    this.subtitle = subtitle;
    this.items = (items ? items : []).map((item) => {
      if (!item.type) item.type = "select";
      return item;
    });
    this.customParams = {};
    menu.menumap.set(this.id, this);
  }
  /** Добавляет новые пункты в текущее меню */
  newItem(...items:MenuItem[]){
    if (!this.items) return;
    items.forEach(item => {
      if(!item.type) item.type = "select"
      //if(item.more) item.name+=" "+item.more, item.more = null;
    })
    this.items.push(...items);
  }
  /** Отрисовать меню в текущем состоянии у клиента */
  async open(selected:number = null){
    if (!this.items) return;
    this.player.serverMenu = this;
    this.customParams.closeEvent = (this.checkOncloseStatus() > 3)
    this.customParams.selected = selected ? selected : 0
    this.items.forEach(item => {
      if(item.type == "list"){
        if(!item.listSelected) item.listSelected = 0;
        item.listSelectedName = item.list[item.listSelected]
      }
    })
    // На случай если у нас слишком много пунктов - поделим данные на ивенты
    if(this.items.length > 300){
      let itemsBlock: MenuItemFromClientToServer[][] = [[]]
      let indx = 0;
      this.items.forEach((item,index) => {
        if(index % 300 == 0) itemsBlock.push([]), indx++;
        itemsBlock[indx].push({
          name:item.name,
          desc:item.desc,
          more:item.more,
          type:item.type,
          rangeselect:item.rangeselect,
          list:item.list,
          listSelected:item.listSelected,
          icon: item.icon,
        })
      })
      await mp.events.callClient(this.player, 'server:menu:openPartPrepare', this.id, this.title, this.subtitle, this.customParams, this.items.length, this.workAnyTime, this.sprite)
      itemsBlock.forEach(async (block, index) => {
        this.player.call('server:menu:openPartItems', [index, block])
      })
      return;
    }
    this.player.call('server:menu:open', [this.id, this.title, this.subtitle, this.items.map(item => {
      return {
        name:item.name,
        desc:item.desc,
        type:item.type,
        more:item.more,
        rangeselect:item.rangeselect,
        list:item.list,
        listSelected:item.listSelected,
      }
    }) as MenuItemFromClientToServer[], this.customParams, this.workAnyTime, this.sprite])
  }
  /** Функция закрытия меню */
  close(blockClose = false){
    if (mp.players.exists(this.player) && user.getId(this.player) == this.playerData.dbid && !blockClose){
      if(this.player.serverMenu == this) this.player.call('server:menu:close');
      this.player.serverMenu = null;
    }
    this.closedMenu = true;
    this.items = null;
    this.title = null;
    this.subtitle = null;
    if(menu.menumap.has(this.id)) menu.menumap.delete(this.id);
  }
  /** Функция, которая будет вызвана при закрытии меню */
  //async onclose(){}
  /** Проверка на то, что у нас изменёно события onclose */
  checkOncloseStatus(){
    return typeof this.onclose == "function" ? this.onclose.toString().match(/\{([\s\S]*)\}/m)[1].replace(/^\s*\/\/.*$/mg,'').length : 0;
  }
  /** Проверка владельца меню на предмет подмены ивентов */
  check(player:PlayerMp){
    if(player.id != this.playerData.id) return false;
    if(user.getId(player) != this.playerData.dbid) return false;
    return true;
  }
}

setInterval(() => {
  menu.menumap.forEach((item) => {
    if (!mp.players.exists(item.player)) item.close();
    else if(item.tm - new Date().getTime() > 480 * 1000) item.close();
    // else if(item.player.serverMenu != item) item.close();
  })
}, 120000)

export const menu = {
  /** Индекс для генерации уникального ID */
  idgen: 1,
  /** Карта со всеми сгенерированными меню */
  menumap: <Map<number, MenuClass>>new Map(),
  new: (player:PlayerMp,title:string,subtitle?:string,items?:MenuItem[]) => {
    return new MenuClass(player, title.replace(/\n/gi, ' '), subtitle ? subtitle : 'Список', items);
  },
  close: (player:PlayerMp) => {
    if(!mp.players.exists(player))return;
    if(player.serverMenu) return player.serverMenu.close();
    player.serverMenu = null;
    player.call('server:menu:close')
  },
  get: (id:number) => {
    return menu.menumap.has(id) ? menu.menumap.get(id) : null
  },
  dialog: (player: PlayerMp, title: string, text: string, bntLeft: string = "Отмена", bntRight: string = "Отправить", value = '', type: "text"|"password"|"int"|"float"|"textarea" = "text"): Promise<string> => {
    return new Promise((resolve) => {
      const id = menu.idgen++;
      user.setGui(player, 'dialog');
      mp.events.register(`server:dialog:submit_${id}_${user.getId(player)}`, function (player, value) {
        this.destroy();
        resolve(value);
      });
      mp.events.triggerBrowser('cef:dialog:init', id, user.getId(player), title, text, bntLeft, bntRight, value, type);
    });
  },
  input,
  selector,
  selectFraction: (player:PlayerMp, type:"all"|"gos"|"gang"|"mafia" = "all"):Promise<number> => {
    return new Promise((resolve, reject) => {
      let m = menu.new(player, "Выберите фракцию");
      m.onclose = () => {
        resolve(null)
      }
      m.newItem({
        name: "~r~Отмена",
        onpress: () => {
          resolve(null)
        }
      })
      if(user.isAdminNow(player)){
        m.newItem({
          name: "~r~Удалить фракцию",
          onpress: () => {
            resolve(0)
          }
        })
      }
      fractionList.map(item => {
        if (type != "all"){
          if(item.gang && type != "gang") return;
          if(item.mafia && type != "mafia") return;
          if(item.gos && type != "gos") return;
        }
        m.newItem({
          name: item.name,
          desc:item.desc,
          onpress: () => {
            resolve(item.id)
          }
        })
      })
      m.open()
    })

  },
  selectNearestPlayers: (player:PlayerMp, range = 5):Promise<PlayerMp> => {
    return new Promise((resolve, reject) => {
      let m = menu.new(player, "Выберите игрока");
      m.onclose = () => {
        resolve(null)
      }
      m.newItem({
        name: "~r~Отмена",
        onpress: () => {
          m.close();
          resolve(null)
        }
      })
      let users = user.getNearestPlayers(player, range);
      users.map(usr => {
        m.newItem({
          name: `ID: ${user.getShowingIdString(player, usr)} ${user.getDating(player, user.getId(usr)) ? ` | ${user.getDating(player, user.getId(usr))}` : ""}`,
          onpress: () => {
            m.close();
            if(!mp.players.exists(usr)) return resolve(null);
            resolve(usr);
          }
        })
      })
      
      m.open()
    })

  }
}

function input(player: PlayerMp, title: string, value?: string, limit?:number, type?: "text"|"password"|"textarea"):Promise<string>;
function input(player: PlayerMp, title: string, value?: string, limit?:number, type?: "int"|"float"):Promise<number>;

function input(player: PlayerMp, title: string, value = '', limit = 30, type: "text"|"password"|"int"|"float"|"textarea" = "text") {
  return new Promise((resolve) => {
    if(value && typeof value == "string") value = value.replace(/`/g, '').replace(/'/g, '').replace(/"/g, '');
    mp.events.callClient(player, 'server:input', title, value, limit).then(res => {
      res = String(res);
      if(res) res.replace(/\n/g, '');
      if(type == "int" || type == "float"){
        return resolve(methods.parseInt(res));
      }
      resolve(res);
    })
  })
}


function selector(player:PlayerMp, name:string, list:string[], returnid?:false):Promise<string>;
function selector(player:PlayerMp, name:string, list:string[], returnid?:true):Promise<number>;

function selector(player:PlayerMp, name:string, list:string[], returnid:true|false = false){
  return new Promise((resolve) => {
    let m = menu.new(player, name)
    m.onclose = () => {resolve(null);}
    list.map((item,index) => {
      m.newItem({
        name:item,
        onpress: () => {
          resolve(returnid ? index : item)
        }
      })
    })
    m.open();
  })
}

mp.events.add("client:menu:listChange", (player:PlayerMp, menuid:number, itemid:number, value:number) => {
  let menuItem = menu.get(menuid);
  if(!menuItem) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) вызывает меню, которого нет`);
  if(!menuItem.check(player)) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) подозрительные меню вызывает, которые ему не принадлежат`);
  let item = menuItem.items[itemid];
  if(!item) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) вызвал пункт меню, которого нет в меню`);
  if(item.type == "list" && !item.list[value]) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) пролистал до того момента, которого не существует`);
  item.listSelected = value;
  if(item.type == "list")item.listSelectedName = item.list[value];
  if(typeof item.onchange == "function") item.onchange(item.listSelected, item, itemid);
})

mp.events.add("client:menu:itemSelect", (player:PlayerMp, menuid:number, itemid:number) => {
  let menuItem = menu.get(menuid);
  if(!menuItem) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) вызывает меню, которого нет`);
  if(!menuItem.check(player)) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) подозрительные меню вызывает, которые ему не принадлежат`);
  let item = menuItem.items[itemid];
  if(!item) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) вызвал пункт меню, которого нет в меню`);
  if (typeof item.onpress == "function") item.onpress(item, itemid)
})
mp.events.add("client:menu:closeEvent", (player:PlayerMp, menuid:number) => {
  let menuItem = menu.get(menuid);
  if(!menuItem) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) вызывает меню, которого нет`);
  if(!menuItem.check(player)) return methods.debug(`${user.getRpName(player)} (${user.getId(player)}) подозрительные меню вызывает, которые ему не принадлежат`);
  if(!menuItem.customParams.closeEvent) return;
  menuItem.onclose();
})

mp.events.add('playerExitColshape', (player: PlayerMp, shape: ColshapeMp) => {
  if(player.serverMenu){
    let m = player.serverMenu;
    if(m.exitProtect) return;
    if(m.exitProtectList.indexOf(shape)) return;
  }
  menu.close(player);
})