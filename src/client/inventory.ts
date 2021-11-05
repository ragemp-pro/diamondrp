import UIMenu from './modules/menu';
import { methods } from './modules/methods';
import { Container } from './modules/data';
import { chat } from './chat';
import { items_old as items } from './items_old';
import { user } from './user';
import { stock } from './stock';
import { weapons } from './weapons';
import { enums } from './enums';
import { ui } from './modules/ui';
import { cloth } from './business/cloth';
import { phone } from './phone';
import { menuList } from './menuList';
import Menu from './modules/menu';
import { gui } from './modules/gui';
import { sleep } from '../util/methods';
import { stockSize } from '../util/sharedData';
import { InventoryDataCef, InventoryItemCef, ammoItemIdToMaxCountUtil, inventoryTypesUtil, clothItem, propItem } from '../util/inventory';


let hidden = true;

setInterval(() => {
  if(!inventory.isHide() && (Menu.Menu.IsShowInput() || user.isCuff() || user.isTie() || user.isDead() || Menu.Menu.GetCurrentMenu())) inventory.hide();
}, 500)



mp.events.add("inventory:open:data", (datas:string) => {
  if(gui.currentGui != null && gui.currentGui != "inventory") return;
  let blocks:InventoryDataCef[] = JSON.parse(datas);
  blocks.forEach(item => {
    inventory.currentAmounts.set(item.owner_type+"_"+item.owner_id, item.weight)
    inventory.maxAmounts.set(item.owner_type+"_"+item.owner_id, item.weight_max)
  })
  gui.setGui(`inventory`);
  setTimeout(() => {
    mp.events.triggerBrowser("inventory:open", user.get('id'), blocks, inventory.updateEquip(), inventory.updateEquipWeapon(), user.getPlayerFraction());
  }, 100)
})


const inventory = {
  currentAmounts: <Map<string,number>>new Map(),
  maxAmounts: <Map<string,number>>new Map(),
  browser: <BrowserMp>null,

  currentItem: -1,
  hidden: true,

  currentAmount: (type:number, id:number|string) => {
    if(inventory.currentAmounts.has(type+"_"+id)) return inventory.currentAmounts.get(type+"_"+id)
    return 0
  },
  maxAmount: (type:number, id:number|string) => {
    if(inventory.maxAmounts.has(type+"_"+id)) return inventory.maxAmounts.get(type+"_"+id)
    return 0
  },

  open: (ownerType?: number, ownerId?: number|string) => {
    if(gui.currentGui != null && gui.currentGui != "inventory") return;
    mp.events.callSocket("inventory:open")
  },

  show: async () => {
    
  },

  hide: () => {
    gui.setGui(null)
    mp.events.triggerServer('inventory:close');
  },

  isHide: () => {
    return gui.currentGui != "inventory";
  },

  updateEquip: () => {
    let data = {
      // type: 'updateEquip',
      phone: user.get('phone_code') > 0,
      bankcard: user.get('bank_prefix') > 0,
      clock: user.get('item_clock'),
      bracelet: user.get('bracelet') >= 0,
      watch: user.get('watch') >= 0,
      ear: user.get('ear') >= 0,
      glasses: user.get('glasses') >= 0,
      hat: user.get('hat') >= 0,
      accessorie: user.get('accessorie') > 0,
      foot: user.getSex() == 0 ? user.get('foot') != 34 : user.get('foot') != 35,
      leg: user.getSex() == 0 ? user.get('leg') != 61 : user.get('leg') != 15,
      torso: user.get('torso') != 15,
      mask: user.get('mask') != 0,
      tablet: !!user.get('tablet_equip'),
    };
    return data;
  },

  updateEquipWeapon: () => {
    let data:InventoryItemCef[] = []
    for (let n = 54; n < 138; n++) {
      weapons.hashesMap.forEach((item) => {
        if (item[0] !== items.getItemNameHashById(n)) return;
        let hash = item[1] / 2;
        if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false)) return;

        let ammoItem = inventory.ammoTypeToAmmo(
          mp.game.invoke(methods.GET_PED_AMMO_TYPE_FROM_WEAPON, mp.players.local.handle, hash)
        );
        let ammoCount = mp.game.invoke(methods.GET_AMMO_IN_PED_WEAPON, mp.players.local.handle, hash);

        data.push([0,n,ammoItem,ammoCount,0,0,0])

        // inventory.addWeaponItem(items.getItemNameById(n), n, ammoItem, ammoCount);
      });
    }
    return data;
  },  
  addWeaponItem: (label: string, itemId: number, ammoItem: any, ammoCount: number) => {
    let data = {
      type: 'addWeaponItem',
      label: label,
      itemId: itemId,
      ammoItem: ammoItem,
      ammoCount: ammoCount,
    };
    if(inventory.browser) inventory.browser.execute(`eventSend(${JSON.stringify(data)});`);
  },
  
  updateInfo: (name: string, age: number, month: string) => {
    let data = {
      type: 'updateInfo',
      name: name,
      age: age,
      month: month,
    };
    if(inventory.browser) inventory.browser.execute(`eventSend(${JSON.stringify(data)});`);
  },
  
  updateLabel: (text = 'Инвентарь') => {
    let data = {
      type: 'updateLabel',
      text: text,
    };
    if(inventory.browser) inventory.browser.execute(`eventSend(${JSON.stringify(data)});`);
  },
  
  clearItems: () => {
    let data = {
      type: 'clearItems',
    };
    if(inventory.browser) inventory.browser.execute(`eventSend(${JSON.stringify(data)});`);
  },

  clearWeapons: () => {
    let data = {
      type: 'clearWeapons',
    };
    if(inventory.browser) inventory.browser.execute(`eventSend(${JSON.stringify(data)});`);
  },
  
  closeItemMenu: (id: number) => {
    if (id != inventory.currentItem) return;
    UIMenu.Menu.HideMenu();
    inventory.currentItem = -1;
  },
  
  equipCloth: (id: number, itemId: number, prefix: number, number: number, keyId: number, countItems = 1) => {
    if (prefix != user.getSex()) {
      if (prefix == 1) mp.game.ui.notifications.show('~r~Вы не можете на себя надеть женскую одежду');
      else mp.game.ui.notifications.show('~r~Вы не можете на себя надеть мужскую одежду');
      return;
    }
  
    let clothList =
      user.getSex() == 1 ? enums.get('clothF') as clothItem[] : enums.get('clothM') as clothItem[];
    cloth.buy(
      10,
      clothList[keyId][1],
      clothList[keyId][2],
      number,
      clothList[keyId][4],
      clothList[keyId][5],
      clothList[keyId][6],
      clothList[keyId][7],
      0,
      true
    );
    user.updateCharacterCloth();
    inventory.deleteItemServer(id);
  
    if (countItems > 1) {
      let printList = enums.get('printList') as number[][];
      for (let pr = 0; pr < printList.length; pr++) {
        if (user.getSex() == 1 && pr == countItems - 10) {
          user.setData('tprint_o', printList[pr][2]);
          user.setData('tprint_c', printList[pr][0]);
        } else if (user.getSex() == 0 && pr == countItems - 10) {
          user.setData('tprint_o', printList[pr][1]);
          user.setData('tprint_c', printList[pr][0]);
        }
      }
      user.updateTattoo();
    }
  
    user.updateCache().then();
  },
  
  equipProp: (id: number, itemId: number, prefix: number, number: number, keyId: number) =>{
    if (prefix != user.getSex()) {
      if (prefix == 1) mp.game.ui.notifications.show('~r~Вы не можете на себя надеть женскую одежду');
      else mp.game.ui.notifications.show('~r~Вы не можете на себя надеть мужскую одежду');
      return;
    }
  
    let clothList =
      user.getSex() == 1 ? enums.get('propF') as propItem[] : enums.get('propM') as propItem[];
  
    cloth.buyProp(10, clothList[keyId][1], clothList[keyId][2], number, 0, true);
    user.updateCharacterCloth();
    inventory.deleteItemServer(id);
    user.updateCache().then();
  },

  equipItem: (id: number, itemId: number, prefix: number, number: number, keyId: number, countItems: number) => {
    methods.debug('Execute: inventory.equipItem');
    mp.events.callSocket('server:inventory:closeItemMenu', id);
    
    mp.events.callSocket("equipItemCheck", id, itemId, prefix, number, keyId, countItems)
  },
  unEquipItem: async (
    itemId: number,
    countItems = 0,
    type = 1,
    toId = 0,
    isAmoutCheck = true
  ) => {
    // if(itemBlock) return mp.game.ui.notifications.show('~r~Не нажимайте эту кнопку так часто');
    // itemBlock = true;
    // setTimeout(() => {
    //   itemBlock = false;
    // }, 1000)
    let user_id = user.get('id');
  
    if (isAmoutCheck) {
      let amount = await inventory.getInvAmount(user_id, inventory.types.Player);
      if (items.getItemAmountById(itemId) + amount > inventory.maxAmount(1, user.get('id'))) {
        mp.game.ui.notifications.show('~r~Инвентарь заполнен');
        inventory.open()
        return;
      }
    }

    // await sleep();
    if(user.isDead()) return mp.game.ui.notifications.show('~r~Вы в коме'), inventory.hide();

    

    switch (itemId) {
      case 282:
        mp.events.callSocket('tablet:unequip')
        break;
      case 265:
        let clothList =
          user.getSex() == 1 ? enums.get('clothF') as clothItem[] : enums.get('clothM') as clothItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 11) continue;
          if (clothList[i][2] != user.get('body')) continue;
  
          if (user.get('tprint_o') != '') {
            let userPrint = user.get('tprint_o');
            let printList = enums.get('printList') as propItem[];
            for (let pr = 0; pr < printList.length; pr++) {
              if (user.getSex() == 1 && printList[pr][2] == userPrint) {
                user.setData('tprint_o', '');
                user.setData('tprint_c', '');
                inventory.addItemServer(
                  265,
                  1,
                  inventory.types.Player,
                  user_id,
                  pr + 10,
                  user.getSex(),
                  user.get('body_color'),
                  i
                );
              } else if (user.getSex() == 0 && printList[pr][1] == userPrint) {
                user.setData('tprint_o', '');
                user.setData('tprint_c', '');
                inventory.addItemServer(
                  265,
                  1,
                  inventory.types.Player,
                  user_id,
                  pr + 10,
                  user.getSex(),
                  user.get('body_color'),
                  i
                );
              }
            }
          } else {
            inventory.addItemServer(
              265,
              1,
              inventory.types.Player,
              user_id,
              1,
              user.getSex(),
              user.get('body_color'),
              i
            );
          }
  
          if (user.getSex() == 0) {
            user.setData('torso', 15);
            user.setData('torso_color', 0);
            user.setData('body', 0);
            user.setData('body_color', 240);
            user.setData('parachute', 0);
            user.setData('parachute_color', 240);
            user.setData('decal', 0);
            user.setData('decal_color', 0);
            user.updateCharacterCloth();
          } else {
            user.setData('torso', 15);
            user.setData('torso_color', 0);
            user.setData('body', 15);
            user.setData('body_color', 0);
            user.setData('parachute', 0);
            user.setData('parachute_color', 240);
            user.setData('decal', 0);
            user.setData('decal_color', 0);
            user.updateCharacterCloth();
          }
  
          user.updateCache().then();
        }
        break;
      case 266: {
        let clothList =
          user.getSex() == 1 ? enums.get('clothF') as clothItem[]: enums.get('clothM') as clothItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 4) continue;
          if (clothList[i][2] != user.get('leg')) continue;
          if (user.getSex() == 0 && user.get('leg') == 61) continue;
          if (user.getSex() == 1 && user.get('leg') == 15) continue;
  
          inventory.addItemServer(
            266,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('leg_color'),
            i
          );
  
          if (user.getSex() == 0) {
            user.setData('leg', 61);
            user.setData('leg_color', 13);
            user.updateCharacterCloth();
          } else {
            user.setData('leg', 15);
            user.setData('leg_color', 0);
            user.updateCharacterCloth();
          }
  
          user.updateCache().then();
        }
        break;
      }
      case 267: {
        let clothList =
          user.getSex() == 1 ? enums.get('clothF') as clothItem[]: enums.get('clothM') as clothItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 6) continue;
          if (clothList[i][2] != user.get('foot')) continue;
          inventory.addItemServer(
            267,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('foot_color'),
            i
          );
  
          if (user.getSex() == 0) {
            user.setData('foot', 34);
            user.setData('foot_color', 0);
            user.updateCharacterCloth();
          } else {
            user.setData('foot', 35);
            user.setData('foot_color', 0);
            user.updateCharacterCloth();
          }
  
          user.updateCache().then();
        }
        break;
      }
      case 268: {
        let clothList =
          user.getSex() == 1 ? enums.get('clothF') as clothItem[]: enums.get('clothM') as clothItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 7) continue;
          if (clothList[i][2] != user.get('accessorie')) continue;
          inventory.addItemServer(
            268,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('accessorie_color'),
            i
          );
          user.setData('accessorie', 0);
          user.setData('accessorie_color', 0);
          user.updateCharacterCloth();
          user.updateCache().then();
        }
        break;
      }
      case 269: {
        let clothList =
          user.getSex() == 1 ? enums.get('propF') as propItem[] : enums.get('propM') as propItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 0) continue;
          if (clothList[i][2] != user.get('hat')) continue;
          inventory.addItemServer(
            269,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('hat_color'),
            i
          );
          user.setData('hat', -1);
          user.setData('hat_color', -1);
          user.updateCharacterCloth();
          user.updateCache().then();
        }
        break;
      }
      case 270: {
        let clothList =
          user.getSex() == 1 ? enums.get('propF') as propItem[]: enums.get('propM') as propItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 1) continue;
          if (clothList[i][2] != user.get('glasses')) continue;
          inventory.addItemServer(
            270,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('glasses_color'),
            i
          );
          user.setData('glasses', -1);
          user.setData('glasses_color', -1);
          user.updateCharacterCloth();
          user.updateCache().then();
        }
        break;
      }
      case 271: {
        let clothList =
          user.getSex() == 1 ? enums.get('propF') as propItem[]: enums.get('propM') as propItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 2) continue;
          if (clothList[i][2] != user.get('ear')) continue;
          inventory.addItemServer(
            271,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('ear_color'),
            i
          );
          user.setData('ear', -1);
          user.setData('ear_color', -1);
          user.updateCharacterCloth();
          user.updateCache().then();
        }
        break;
      }
      case 272: {
        let clothList =
          user.getSex() == 1 ? enums.get('propF') as propItem[]: enums.get('propM') as propItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 6) continue;
          if (clothList[i][2] != user.get('watch')) continue;
          inventory.addItemServer(
            272,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('watch_color'),
            i
          );
          user.setData('watch', -1);
          user.setData('watch_color', -1);
          user.updateCharacterCloth();
          user.updateCache().then();
        }
        break;
      }
      case 273: {
        let clothList =
          user.getSex() == 1 ? enums.get('propF') as propItem[]: enums.get('propM') as propItem[];
  
        for (let i = 0; i < clothList.length; i++) {
          if (clothList[i][1] != 7) continue;
          if (clothList[i][2] != user.get('bracelet')) continue;
          inventory.addItemServer(
            273,
            1,
            inventory.types.Player,
            user_id,
            1,
            user.getSex(),
            user.get('bracelet_color'),
            i
          );
          user.setData('bracelet', -1);
          user.setData('bracelet_color', -1);
          user.updateCharacterCloth();
          user.updateCache().then();
        }
        break;
      }
      case 274: {
        inventory.addItemServer(
          274,
          1,
          inventory.types.Player,
          user_id,
          1,
          user.getSex(),
          user.get('mask_color'),
          user.get('mask')
        );
        user.setData('mask', 0);
        user.setData('mask_color', 0);
        user.updateCharacterCloth();
        user.updateCache().then();
        break;
      }
      case 7:
        inventory.addItemServer(7, 1, inventory.types.Player, user_id, 1, -1, -1, -1);
  
        user.setData('item_clock', false);
        chat.sendMeCommand('снял часы');
        break;
      case 8:
        inventory.addItemServer(
          8,
          1,
          inventory.types.Player,
          user_id,
          1,
          user.get('phone_code'),
          user.get('phone'),
          -1
        );
  
        user.setData('phone', 0);
        user.setData('phone_code', 0);
  
        mp.game.ui.notifications.show('~g~Вы убрали телефон');
        break;
      case 42:
        inventory.addItemServer(
          42,
          1,
          inventory.types.Player,
          user_id,
          1,
          -1,
          -1,
          user.get('business_id')
        );
  
        user.setData('business_id', 0);
  
        mp.game.ui.notifications.show('~g~Вы убрали ключи от офиса');
        break;
      case 43:
        inventory.addItemServer(
          43,
          1,
          inventory.types.Player,
          user_id,
          1,
          -1,
          -1,
          user.get('id_house')
        );
  
        user.setData('id_house', 0);
  
        mp.game.ui.notifications.show('~g~Вы убрали ключи от дома');
        break;
      case 44:
        inventory.addItemServer(
          44,
          1,
          inventory.types.Player,
          user_id,
          1,
          -1,
          -1,
          user.get('apartment_id')
        );
  
        user.setData('apartment_id', 0);
  
        mp.game.ui.notifications.show('~g~Вы убрали ключи от квартиры');
        break;
      case 50:
        mp.events.callSocket('server:inventory:unEquip', 50);
        break;
      case 138:
        if (user.getMoney() < 1) {
          mp.game.ui.notifications.show('~r~У Вас нет налички');
          return;
        }
        inventory.addItemServer(138, 1, inventory.types.Player, user_id, 1, -1, -1, -1);
  
        user.removeCashMoney(1);
  
        mp.game.ui.notifications.show('~g~Вы убрали $1 в инвентарь');
        break;
      case 139:
        if (user.getMoney() < 100) {
          mp.game.ui.notifications.show('~r~У Вас нет налички');
          return;
        }
        inventory.addItemServer(138, 1, inventory.types.Player, user_id, 100, -1, -1, -1);
  
        user.removeCashMoney(100);
  
        mp.game.ui.notifications.show('~g~Вы убрали $100 в инвентарь');
        break;
      case 140:
      case 141:
        let money = <number>await <Promise<any>>UIMenu.Menu.GetUserInput('Кол-во', '', 9);
  
        money = methods.parseInt(money);
  
        if (user.getMoney() < money) {
          mp.game.ui.notifications.show('~r~У Вас нет столько налички');
          return;
        }
        if (money <= 0) {
          mp.game.ui.notifications.show('~r~У Вас нет налички');
          return;
        }
  
        let moneyFull = money;
        while (moneyFull > 0) {
          if (moneyFull == 1) {
            inventory.addItemServer(138, 1, inventory.types.Player, user_id, moneyFull, -1, -1, -1);
            moneyFull = 0;
          } else if (moneyFull == 100) {
            inventory.addItemServer(139, 1, inventory.types.Player, user_id, moneyFull, -1, -1, -1);
            moneyFull = 0;
          } else if (moneyFull <= 10000) {
            inventory.addItemServer(140, 1, inventory.types.Player, user_id, moneyFull, -1, -1, -1);
            moneyFull = 0;
          } else if (moneyFull <= 30000) {
            inventory.addItemServer(141, 1, inventory.types.Player, user_id, moneyFull, -1, -1, -1);
            moneyFull = 0;
          } else {
            inventory.addItemServer(141, 1, inventory.types.Player, user_id, 30000, -1, -1, -1);
            moneyFull = moneyFull - 30000;
          }
        }
  
        user.removeCashMoney(money);
        mp.game.ui.notifications.show(`~g~Вы убрали $${methods.numberFormat(money)} в инвентарь`);
        break;
      case 27:
      case 28:
      case 29:
      case 30:
      case 146:
      case 147:
      case 148:
      case 149:
      case 150:
      case 151:
      case 152:
      case 153:
        if (type == 9999) {
          let ptFull = countItems;
          while (ptFull > 0) {
            if (ptFull <= inventory.ammoItemIdToMaxCount(itemId)) {
              inventory.addItemServer(itemId, 1, inventory.types.Player, toId, ptFull, -1, -1, -1);
              ptFull = 0;
            } else {
              inventory.addItemServer(
                itemId,
                1,
                inventory.types.Player,
                toId,
                inventory.ammoItemIdToMaxCount(itemId),
                -1,
                -1,
                -1
              );
              ptFull = ptFull - inventory.ammoItemIdToMaxCount(itemId);
            }
          }
  
          inventory.removeAllAmmo(itemId);
        } else {
          let ptFull = countItems;
          while (ptFull > 0) {
            if (ptFull <= inventory.ammoItemIdToMaxCount(itemId)) {
              inventory.addItemServer(itemId, 1, inventory.types.Player, user_id, ptFull, -1, -1, -1);
              ptFull = 0;
            } else {
              inventory.addItemServer(
                itemId,
                1,
                inventory.types.Player,
                user_id,
                inventory.ammoItemIdToMaxCount(itemId),
                -1,
                -1,
                -1
              );
              ptFull = ptFull - inventory.ammoItemIdToMaxCount(itemId);
            }
          }
  
          inventory.removeAllAmmo(itemId);
          mp.game.ui.notifications.show('~g~Вы убрали патроны в инвентарь');
        }
        break;
      default:
        if (itemId <= 136 && itemId >= 54) {
          if (type == inventory.types.StockFraction) {
            weapons.hashesMap.forEach((item) => {
              if (item[0] !== items.getItemNameHashById(itemId)) return;
  
              let hash = item[1] / 2;
              if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false))
                return;
  
              mp.game.invoke(methods.REMOVE_WEAPON_FROM_PED, mp.players.local.handle, hash);
  
              if (Container.HasLocally(0, hash.toString())) {
                Container.ResetLocally(0, hash.toString());
                Container.Reset(mp.players.local.remoteId, hash.toString());
              }
  
              inventory.addItemServer(itemId, 1, inventory.types.StockFraction, 2, 1, -1, -1, -1);
            });
          } else if (type == 9999) {
            weapons.hashesMap.forEach((item) => {
              if (item[0] !== items.getItemNameHashById(itemId)) return;
              let hash = item[1] / 2;
              if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false))
                return;
              mp.game.invoke(methods.REMOVE_WEAPON_FROM_PED, mp.players.local.handle, hash);
  
              if (Container.HasLocally(0, hash.toString())) {
                Container.ResetLocally(0, hash.toString());
                Container.Reset(mp.players.local.remoteId, hash.toString());
              }
  
              inventory.addItemServer(itemId, 1, inventory.types.Player, toId, 1, -1, -1, -1);
            });
          } else {
            weapons.hashesMap.forEach((item) => {
              if (item[0] !== items.getItemNameHashById(itemId)) return;
  
              inventory.addItemServer(itemId, 1, inventory.types.Player, user_id, 1, -1, -1, -1);
  
              let hash = item[1] / 2;
              if (!mp.game.invoke(methods.HAS_PED_GOT_WEAPON, mp.players.local.handle, hash, false))
                return;
              mp.game.invoke(methods.REMOVE_WEAPON_FROM_PED, mp.players.local.handle, hash);
  
              if (Container.HasLocally(0, hash.toString())) {
                Container.ResetLocally(0, hash.toString());
                Container.Reset(mp.players.local.remoteId, hash.toString());
              }
  
              mp.game.ui.notifications.show('~g~Вы убрали оружие');
            });
          }
        }
    }
  
    inventory.updateAmount(user_id, inventory.types.Player);
  },

  useItem: (id: number, itemId: number) => {
    mp.events.callSocket('server:inventory:useItem', id, itemId);
  },
  
  dropItem: (id: number, itemId: number, pos: Vector3Mp, rot: Vector3Mp, model: number, ownerType: number, ownerId: number) => {
    mp.events.callRemote(
      'server:inventory:dropItem',
      id,
      itemId,
      pos.x,
      pos.y,
      pos.z,
      rot.x,
      rot.y,
      rot.z,
      model,
      ownerType,
      ownerId
    );
  },

  deleteItemProp: (id: number) => {
    mp.events.callRemote('server:inventory:deleteDropItem', id);
  },
  
  takeNewItem: async (itemId: number, count = 1) => {
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(user_id, inventory.types.Player);
    let amountMax = await inventory.getInvAmountMax(user_id, inventory.types.Player);
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~Инвентарь заполнен');
      inventory.open()
      return;
    }
    inventory.addItemServer(itemId, 1, inventory.types.Player, user_id, count, -1, -1, -1);
    inventory.updateAmount(user_id, inventory.types.Player);
    mp.game.ui.notifications.show(`~b~Вы взяли \"${items.getItemNameById(itemId)}\"`);
    chat.sendMeCommand(`взял \"${items.getItemNameById(itemId)}\"`);
  },
  
  takeItem: async (id: number, itemId: number, ownerType: number, notify = true) => {
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(user_id, inventory.types.Player);
    let amountMax = await inventory.getInvAmountMax(user_id, inventory.types.Player);
    //mp.console.logInfo(amount, amountMax, "amounts");
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~Инвентарь заполнен');
      inventory.open()
      return;
    }
  
    mp.events.callRemote('server:inventory:closeItemMenu', id);
  
    if (ownerType == inventory.types.World) {
      user.playAnimation('pickup_object', 'pickup_low', 8);
    }
    if (ownerType >= 11 && ownerType <= 22)
      stock.addLog(
        user.get('rp_name'),
        `TAKE: ${items.getItemNameById(itemId)}`,
        mp.players.local.dimension - 5100000
      );
    inventory.updateItemOwnerServer(id, inventory.types.Player, user_id);
    inventory.updateAmount(user_id, inventory.types.Player);
    if (ownerType == inventory.types.World) inventory.deleteItemProp(id);
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы взяли \"${items.getItemNameById(itemId)}\"`);
    chat.sendMeCommand(`взял \"${items.getItemNameById(itemId)}\"`);
  },

  giveItem: async (id: number, itemId: number, playerId: number, notify = true) => {
    if(itemId == 50){
      return mp.game.ui.notifications.show("~r~Банковскую карту нельзя передавать");
    }
    if(itemId >= 138 && itemId <= 141){
      return mp.game.ui.notifications.show("~r~Пачку денег нельзя передавать");
    }
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(playerId, inventory.types.Player);
    let amountMax = await inventory.getInvAmountMax(playerId, inventory.types.Player);
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~Инвентарь заполнен');
      inventory.open()
      return;
    }
    //Shared.TriggerEventToAllPlayers("ARP:UserPlayAnimationToAll", playerId, "mp_common","givetake2_a", 8);
    //mp.events.callRemote("server:playAnimationByPlayerId", playerId, "mp_common", "givetake2_a", 8);
    user.playAnimation('mp_common', 'givetake1_a', 8);
  
    inventory.updateItemOwnerServer(id, inventory.types.Player, playerId);
    inventory.updateAmount(playerId, inventory.types.Player);
    inventory.updateAmount(user_id, inventory.types.Player);
  
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы передали \"${items.getItemNameById(itemId)}\" игроку`);
    chat.sendMeCommand(`передал \"${items.getItemNameById(itemId)}\" человеку рядом`);
  },
  
  dropItemToVehicle: async (id: number, itemId: number, number: string, notify = true) => {
    if(itemId == 50){
      return mp.game.ui.notifications.show("~r~Банковскую карту нельзя передавать");
    }
    if(itemId >= 138 && itemId <= 141){
      return mp.game.ui.notifications.show("~r~Пачку денег нельзя передавать");
    }
    let vId = inventory.convertNumberToHash(number);
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(vId, inventory.types.Vehicle);
    let amountMax = await inventory.getInvAmountMax(vId, inventory.types.Vehicle);
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~В багажнике нет места');
      return;
    }
    inventory.updateItemOwnerServer(id, inventory.types.Vehicle, number);
    inventory.updateAmount(vId, inventory.types.Vehicle);
    inventory.updateAmount(user_id, inventory.types.Player);
  
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы положили \"${items.getItemNameById(itemId)}\" в багажник`);
    chat.sendMeCommand(`положил \"${items.getItemNameById(itemId)}\" в багажник`);
  },
  
  dropItemToStockFraction: async (id: number, itemId: number, ownerId: number, notify = true) => {
    if(itemId == 50){
      return mp.game.ui.notifications.show("~r~Банковскую карту нельзя передавать");
    }
    if(itemId >= 138 && itemId <= 141){
      return mp.game.ui.notifications.show("~r~Пачку денег нельзя передавать");
    }
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(ownerId, inventory.types.StockFraction);
    let amountMax = await inventory.getInvAmountMax(ownerId, inventory.types.StockFraction);
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~На складе нет места');
      return;
    }
  
    inventory.updateItemOwnerServer(id, inventory.types.StockFraction, ownerId);
    inventory.updateAmount(ownerId, inventory.types.StockFraction);
    inventory.updateAmount(user_id, inventory.types.Player);
  
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы положили \"${items.getItemNameById(itemId)}\" на склад`);
    chat.sendMeCommand(`положил \"${items.getItemNameById(itemId)}\" на склад`);
  },
  
  dropItemToFridge: async (id: number, itemId: number, ownerId: number, notify = true) => {
    if(itemId == 50){
      return mp.game.ui.notifications.show("~r~Банковскую карту нельзя передавать");
    }
    if(itemId >= 138 && itemId <= 141){
      return mp.game.ui.notifications.show("~r~Пачку денег нельзя передавать");
    }
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(ownerId, inventory.types.Fridge);
    let amountMax = await inventory.getInvAmountMax(ownerId, inventory.types.Fridge);
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~В холодильнике нет места');
      return;
    }
  
    inventory.updateItemOwnerServer(id, inventory.types.Fridge, ownerId);
    inventory.updateAmount(ownerId, inventory.types.Fridge);
    //inventory.updateAmount(user_id, inventory.types.Player);
  
    if (!notify) return;
    mp.game.ui.notifications.show(
      `~g~Вы положили \"${items.getItemNameById(itemId)}\" в холодильник`
    );
    chat.sendMeCommand(`положил \"${items.getItemNameById(itemId)}\" в холодильник`);
  },
  
  dropItemToUserStock: async (id: number, itemId: number, ownerId: number, notify = true) => {
    if(itemId == 50){
      return mp.game.ui.notifications.show("~r~Банковскую карту нельзя передавать");
    }
    if(itemId >= 138 && itemId <= 141){
      return mp.game.ui.notifications.show("~r~Пачку денег нельзя передавать");
    }
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(ownerId, inventory.types.UserStock);
    let amountMax = await inventory.getInvAmountMax(ownerId, inventory.types.UserStock);
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~На складе нет места');
      return;
    }
    let ownId = mp.players.local.dimension - 5100000;
  
    stock.addLog(user.get('rp_name'), `DROP: ${items.getItemNameById(itemId)}`, ownId);
  
    inventory.updateItemOwnerServer(id, inventory.types.UserStock + ownerId, ownId);
    inventory.updateAmount(ownerId, inventory.types.UserStock);
    //inventory.updateAmount(user_id, inventory.types.Player);
  
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы положили \"${items.getItemNameById(itemId)}\" на склад`);
    chat.sendMeCommand(`положил \"${items.getItemNameById(itemId)}\" на склад`);
  },

  takeDrugItem: async (id: number, itemId: number, countItems: number, notify = true, takeCount = 1) => {
    countItems = countItems - takeCount;
  
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(user_id, inventory.types.Player);
    let amountMax = await inventory.getInvAmountMax(user_id, inventory.types.Player);
  
    let newItemId = 2;
  
    switch (itemId) {
      case 142:
      case 144:
      case 154:
      case 156:
        if (takeCount == 1) newItemId = 2;
        if (takeCount == 10) newItemId = 154;
        if (takeCount == 50) newItemId = 156;
        break;
      case 143:
      case 145:
      case 155:
      case 157:
        if (takeCount == 1) newItemId = 3;
        if (takeCount == 10) newItemId = 155;
        if (takeCount == 50) newItemId = 157;
        break;
      case 163:
      case 164:
      case 171:
      case 176:
        if (takeCount == 1) newItemId = 158;
        if (takeCount == 10) newItemId = 171;
        if (takeCount == 50) newItemId = 176;
        break;
      case 165:
      case 166:
      case 172:
      case 177:
        if (takeCount == 1) newItemId = 159;
        if (takeCount == 10) newItemId = 172;
        if (takeCount == 50) newItemId = 177;
        break;
      case 167:
      case 168:
      case 173:
      case 178:
        if (takeCount == 1) newItemId = 160;
        if (takeCount == 10) newItemId = 173;
        if (takeCount == 50) newItemId = 178;
        break;
      case 169:
      case 174:
      case 179:
        if (takeCount == 1) newItemId = 161;
        if (takeCount == 10) newItemId = 174;
        if (takeCount == 50) newItemId = 179;
        break;
      case 170:
      case 175:
      case 180:
        if (takeCount == 1) newItemId = 162;
        if (takeCount == 10) newItemId = 175;
        if (takeCount == 50) newItemId = 180;
        break;
    }
  
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~Инвентарь заполнен');
      inventory.open()
      return;
    }
  
    UIMenu.Menu.HideMenu();
  
    inventory.addItemServer(newItemId, 1, inventory.types.Player, user_id, takeCount, -1, -1, -1);
    inventory.updateAmount(user_id, inventory.types.Player);
  
    if (countItems <= 0) inventory.deleteItemServer(id);
    else {
      inventory.updateItemCountServer(id, countItems);
    }
  
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы взяли \"${items.getItemNameById(newItemId)}\"`);
    chat.sendMeCommand(`взял ${takeCount}гр наркотиков`);
  },

  takeCountItem: async (id: number, itemId: number, countItems: number, notify = true, takeCount = 1) => {
    countItems = countItems - takeCount;
  
    let user_id = user.get('id');
    let amount = await inventory.getInvAmount(user_id, inventory.types.Player);
    let amountMax = await inventory.getInvAmountMax(user_id, inventory.types.Player);
  
    let newItemId = 2;
  
    switch (itemId) {
      case 275:
        if (takeCount == 1) newItemId = 4;
        break;
      case 276:
        if (takeCount == 1) newItemId = 263;
        break;
    }
  
    if (items.getItemAmountById(itemId) + amount > amountMax) {
      mp.game.ui.notifications.show('~r~Инвентарь заполнен');
      inventory.open()
      return;
    }
  
    inventory.addItemServer(newItemId, 1, inventory.types.Player, user_id, takeCount, -1, -1, -1);
    inventory.updateAmount(user_id, inventory.types.Player);
  
    if (countItems <= 0) inventory.deleteItemServer(id);
    else {
      inventory.updateItemCountServer(id, countItems);
    }
  
    if (!notify) return;
    mp.game.ui.notifications.show(`~g~Вы взяли \"${items.getItemNameById(newItemId)}\"`);
    chat.sendMeCommand(`взял ${takeCount}шт предмета`);
  },

  getInvAmount: async (id: number, type: number) => {
    return inventory.currentAmount(type, id)
  },
  
  setInvAmount: (id: number, type: number, data: any) => {
    Container.Set(id, 'invAmount:' + type, data);
    Container.SetLocally(id, 'invAmount:' + type, data);
  },
  
  getInvAmountMax: async (id: number, type: number) => {
    return inventory.maxAmount(type, id)
  },
  
  setInvAmountMax: (id: number, type: number, data: any) => {
    Container.Set(id, 'invAmountMax:' + type, data);
    Container.SetLocally(id, 'invAmountMax:' + type, data);
  },
  
  calculatePlayerInvAmountMax: () => {
    return 45100 + user.get('mp0_strength') * 100;
  },
  
  startFishing: () => {
    if (!methods.isPlayerInOcean()) {
      mp.game.ui.notifications.show('~r~Вы должны быть в океане');
      return;
    }
    if (mp.players.local.isSwimming()) {
      mp.game.ui.notifications.show('~r~Вы не должны быть в воде');
      return;
    }
    if (mp.players.local.vehicle) {
      mp.game.ui.notifications.show('~r~Вы не должны быть в транспорте');
      return;
    }
    if (Container.HasLocally(0, 'fish')) {
      mp.game.ui.notifications.show('~r~Вы уже рыбачите');
      return;
    }
  
    Container.SetLocally(0, 'fish', true);
    user.playScenario('WORLD_HUMAN_STAND_FISHING');
    mp.events.callRemote('server:setTimeout', 30000, 'client:inventory:continueFishing');
  },

  continueFishing: () => {
    if (
      methods.distanceToPos(mp.players.local.position, new mp.Vector3(-3544, 6135, 0)) < 200 ||
      methods.distanceToPos(mp.players.local.position, new mp.Vector3(4989, 1712, 0)) < 200
    ) {
      if (methods.getRandomInt(0, 3) == 0) inventory.takeNewItem(241);
      else if (methods.getRandomInt(0, 3) == 0) inventory.takeNewItem(243);
      else if (methods.getRandomInt(0, 2) == 0) inventory.takeNewItem(244);
      else inventory.takeNewItem(245);
    } else {
      if (methods.getRandomInt(0, 2) == 0) {
        if (methods.getRandomInt(0, 3) == 0) inventory.takeNewItem(243);
        else if (methods.getRandomInt(0, 2) == 0) inventory.takeNewItem(244);
        else inventory.takeNewItem(245);
      } else inventory.takeNewItem(242);
    }
  
    Container.ResetLocally(0, 'fish');
    user.stopAllAnimation();
  },
  
  ammoTypeToAmmo: (type: number) => {
    switch (type) {
      /*        
          case 3125143736: //... / PipeBomb
              return -1;
          case 2481070269: //... / Grenade
              return -1;
          case 4256991824: //... / SmokeGrenade
              return -1;
          case 2874559379: //... / ProximityMine
              return -1;
          case 2694266206: //... / BZGas
              return -1;
          case 101631238: //... / FireExtinguisher
              return -1;
          case 741814745: //... / StickyBomb
              return -1;
          case 615608432: //... / Molotov
              return -1;
          case 883325847: //... / PetrolCan
              return -1;
          case 600439132: //... / Ball
              return -1;
          case 126349499: //... / Snowball
              return -1;
          case 1233104067: //... / Flare
              return -1;
          case 1173416293: //... / FlareGun
          */
      case 357983224: //... / PipeBomb
        return -1;
      case 1003688881: //... / Grenade
        return -1;
      case -435287898: //... / SmokeGrenade
        return -1;
      case -1356724057: //... / ProximityMine
        return -1;
      case -1686864220: //... / BZGas
        return -1;
      case 1359393852: //... / FireExtinguisher
        return -1;
      case 1411692055: //... / StickyBomb
        return -1;
      case 1446246869: //... / Molotov
        return -1;
      case -899475295: //... / PetrolCan
        return -1;
      case -6986138: //... / Ball
        return -1;
      case -2112339603: //... / Snowball
        return -1;
      case 1808594799: //... / Flare
        return -1;
      case 1173416293: //... / FlareGun
        return 147;
      case -1339118112: //... / StunGun
        return -1;
      case -1356599793: //... / Firework
        return 148;
      case 1742569970: //... / RPG
        return 149;
      case 2034517757: //... / Railgun
        return 150;
      case -1726673363: //... / HomingLauncher
        return 152;
      case 1003267566: //... / CompactGrenadeLauncher
        return 151;
      case 1285032059: //12.7mm / SniperGun
        return 146;
      case -1878508229: //18.5mm / Shotguns
        return 28;
      case 218444191: //5.56mm / AssaultRifles
        return 30;
      case 1950175060: //9mm / Handguns
        return 27;
      case 1820140472: //9mm / MiniMG
        return 153;
      case 1788949567: //7.62mm / MG
      case -1614428030: //7.62mm / MiniGun
        return 29;
      default:
        return -1;
    }
  },
  
  ammoItemIdToMaxCount: ammoItemIdToMaxCountUtil,
  
  addAmmoServer: (name: string, count: number) => {
    //let ammo = mp.game.invoke('8F62F4EC66847EC2', mp.players.local.handle, hash);
    weapons.hashesMap.forEach((item) => {
      if (item[0] == name)
        mp.game.invoke(methods.ADD_AMMO_TO_PED, mp.players.local.handle, item[1] / 2, count);
      return;
    });
    //inventory.setWeaponAmmo(hash, count+ammo);
  },
  
  setWeaponAmmo: (name: string, count: number) => {
    weapons.hashesMap.forEach((item) => {
      if (item[0] == name)
        mp.game.invoke(methods.SET_PED_AMMO, mp.players.local.handle, item[1] / 2, count);
      return;
    });
  },
  
  addAmmo: (type: number, count: number) => {
    switch (type) {
      case 147:
        inventory.addAmmoServer('FlareGun', count);
        return;
      case 148: //... / Firework
        inventory.addAmmoServer('Firework', count);
        return;
      case 149: //... / RPG
        inventory.addAmmoServer('RPG', count);
        return;
      case 150: //... / Railgun
        inventory.addAmmoServer('Railgun', count);
        return;
      case -152: //... / HomingLauncher
        inventory.addAmmoServer('HomingLauncher', count);
        return;
      case 151: //... / CompactGrenadeLauncher
        inventory.addAmmoServer('CompactGrenadeLauncher', count);
        return;
      case 146: //12.7mm / SniperGun
        inventory.addAmmoServer('MarksmanRifle', count);
        return;
      case 28: //18.5mm
        inventory.addAmmoServer('AssaultShotgun', count);
        return;
      case 30: //5.56mm
        inventory.addAmmoServer('AssaultRifle', count);
        return;
      case 27: //9mm
        inventory.addAmmoServer('Pistol', count);
        return;
      case 153: //9mm
        inventory.addAmmoServer('SMG', count);
        return;
      case 29: //7.62mm
        inventory.addAmmoServer('MG', count);
        return;
    }
  },
  
  removeAllAmmo: (type: number) => {
    switch (type) {
      case 147:
        inventory.setWeaponAmmo('FlareGun', 0);
        return;
      case 148: //... / Firework
        inventory.setWeaponAmmo('Firework', 0);
        return;
      case 149: //... / RPG
        inventory.setWeaponAmmo('RPG', 0);
        return;
      case 150: //... / Railgun
        inventory.setWeaponAmmo('Railgun', 0);
        return;
      case -152: //... / HomingLauncher
        inventory.setWeaponAmmo('HomingLauncher', 0);
        return;
      case 151: //... / CompactGrenadeLauncher
        inventory.setWeaponAmmo('CompactGrenadeLauncher', 0);
        return;
      case 146: //12.7mm / SniperGun
        inventory.setWeaponAmmo('MarksmanRifle', 0);
        return;
      case 28: //18.5mm
        inventory.setWeaponAmmo('AssaultShotgun', 0);
        return;
      case 30: //5.56mm
        inventory.setWeaponAmmo('AssaultRifle', 0);
        return;
      case 27: //9mm
        inventory.setWeaponAmmo('Pistol', 0);
        return;
      case 153: //9mm
        inventory.setWeaponAmmo('SMG', 0);
        return;
      case 29: //7.62mm
        inventory.setWeaponAmmo('MG', 0);
        return;
    }
  },
  
  convertNumberToHash: (number: string) => {
    return <number>mp.game.joaat(number.toString().toUpperCase());
  },
  
  updateAmountMax: (id: number, type: number) => {
    if (
      type == inventory.types.VehicleNpc ||
      type == inventory.types.VehicleOwner ||
      type == inventory.types.VehicleServer ||
      type == inventory.types.Vehicle
    ) {
      let veh = methods.getNearestVehicleWithCoords(mp.players.local.position, 5.0);
      if (veh) {
        inventory.setInvAmountMax(id, type, methods.getVehicleInfo(veh.model).stock);
      } else {
        return;
      }
    } else {
      let invAmountMax = inventory.calculatePlayerInvAmountMax();
      if (type == inventory.types.World) invAmountMax = -1;
      else if (type == inventory.types.Apartment) invAmountMax = stockSize.Apartment;
      else if (type == inventory.types.House) invAmountMax = stockSize.House;
      else if (type == inventory.types.Player) invAmountMax = inventory.calculatePlayerInvAmountMax();
      else if (type == inventory.types.Bag) invAmountMax = stockSize.Bag;
      else if (type == inventory.types.StockFraction) invAmountMax = stockSize.StockFraction;
      else if (type == inventory.types.Fridge) invAmountMax = stockSize.Fridge;
      //Main.GetKitchenAmount();
      else if (type == 12 || type == 13) invAmountMax = stockSize.PrivateSafe;
      else if (type >= 14 && type <= 17) invAmountMax = stockSize.BigWoodBox;
      else if ((type >= 18 && type <= 22) || type == 11) invAmountMax = stockSize.SmallWoodBox;
      inventory.setInvAmountMax(id, type, invAmountMax);
    }
  },
  
  sendToPlayerItemListUpdateAmountMenu: (data: any, ownerType: number, ownerId: number) => {
    let sum = 0;
    //methods.debug("init");
    //mp.events.callRemote("server:debug:print", "init");
    data.forEach((property: any[]) => {
      //methods.debug(property[1]);
      //mp.events.callRemote("server:debug:print", property[1]+" < count");
      sum = sum + items.getItemAmountById(property[1]);
    });
    //mp.events.callRemote("server:debug:print", ownerId+" "+ownerType+" "+sum+" < lines");
    inventory.setInvAmount(ownerId, ownerType, sum);
  },
  
  updateAmount: (id: number|string, type: number) => {
    mp.events.callRemote('server:inventory:updateAmount', id, type);
  },
  
  addItemServer: (
    itemId: number,
    count: number,
    ownerType: number,
    ownerId: number,
    countItems: number,
    prefix: number,
    number: number,
    keyId: number
  ) => {
    mp.events.callRemote(
      'server:inventory:addItem',
      itemId,
      count,
      ownerType,
      ownerId,
      countItems,
      prefix,
      number,
      keyId
    );
  },
  
  updateItemServer: (
    itemId: number,
    count: number,
    ownerType: number,
    ownerId: number,
    countItems: number,
    prefix: number,
    number: number,
    keyI: number
  ) => {
    //TriggerServerEvent("ARP:Inventory:UpdateItem", id, itemId, ownerType, ownerId, countItems, prefix, number, keyId);
  },
  
  updateItemOwnerServer: (id: number, ownerType: number, ownerId: number|string) => {
    mp.events.callRemote('server:inventory:updateItemOwner', id, ownerType, ownerId);
  },
  
  updateItemCountServer: (id: number, count: number) => {
    mp.events.callRemote('server:inventory:updateItemCount', id, count);
  },
  

  
  deleteItemServer: (id: number) => {
    mp.events.callRemote('server:inventory:deleteItem', id);
  },
  
  
  getItemList: (ownerType: number, ownerId: number|string) => {
    mp.events.callRemote('inventory:open', ownerType, ownerId);
  },
  
  getItemListInRadius: (pos: Vector3Mp) => {
    mp.events.callRemote('server:inventory:getItemListInRadius', pos.x, pos.y);
  },
  
  cookFood: (ownerId: number) => {
    //TriggerServerEvent("ARP:Inventory:CookFood", ownerId);
    chat.sendMeCommand('готовит еду');
    mp.game.ui.notifications.show('~g~Вы приготовили всю еду');
  },
  
  // data: (
  //   id: number,
  //   itemId: number,
  //   prop: any,
  //   model: string,
  //   pos: Vector3Mp,
  //   rot: Vector3Mp,
  //   ownerType: number,
  //   ownerId: number,
  //   count: number,
  //   isCreate: boolean,
  //   isDelete: boolean
  // ) => {
  //   this.id = id;
  //   this.itemId = itemId;
  //   this.prop = prop;
  //   this.model = model;
  //   this.pos = pos;
  //   this.rot = rot;
  //   this.ownerType = ownerType;
  //   this.ownerId = ownerId;
  //   this.count = count;
  //   this.isCreate = isCreate;
  //   this.isDelete = isDelete;
  // },

  types: inventoryTypesUtil,

};

mp.events.add('client:inventory:continueFishing', () => {
  inventory.continueFishing();
});

mp.events.add("server:inventory:equipItem", (id: number, itemId: number, prefix: number, number: number, keyId: number, countItems: number) => {
  switch (itemId) {
    case 265: {
      if (user.get('torso') != 15) {
        mp.game.ui.notifications.show('~r~У вас уже экипированы торс');
        return;
      }

      inventory.equipCloth(id, itemId, prefix, number, keyId, countItems);
      break;
    }
    case 266: {
      if (user.getSex() == 0) {
        if (user.get('leg') != 61) {
          mp.game.ui.notifications.show('~r~У вас уже экипированы штаны');
          return;
        }
      } else {
        if (user.get('leg') != 15) {
          mp.game.ui.notifications.show('~r~У вас уже экипированы штаны');
          return;
        }
      }

      inventory.equipCloth(id, itemId, prefix, number, keyId);
      break;
    }
    case 267: {
      if (user.getSex() == 0) {
        if (user.get('foot') != 34) {
          mp.game.ui.notifications.show('~r~У вас уже экипирована обувь');
          return;
        }
      } else {
        if (user.get('foot') != 35) {
          mp.game.ui.notifications.show('~r~У вас уже экипирована обувь');
          return;
        }
      }

      inventory.equipCloth(id, itemId, prefix, number, keyId);
      break;
    }
    case 268: {
      if (user.get('accessorie') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипирован аксессуар');
        return;
      }

      inventory.equipCloth(id, itemId, prefix, number, keyId);
      break;
    }
    case 269: {
      if (user.get('hat') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипирована шапка');
        return;
      }

      inventory.equipProp(id, itemId, prefix, number, keyId);
      break;
    }
    case 270: {
      if (user.get('glasses') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипированы очки');
        return;
      }

      inventory.equipProp(id, itemId, prefix, number, keyId);
      break;
    }
    case 271: {
      if (user.get('ear') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипированы серёжки');
        return;
      }

      inventory.equipProp(id, itemId, prefix, number, keyId);
      break;
    }
    case 272: {
      if (user.get('watch') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипированы часы');
        return;
      }

      inventory.equipProp(id, itemId, prefix, number, keyId);
      break;
    }
    case 273: {
      if (user.get('bracelet') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипирован браслет');
        return;
      }

      inventory.equipProp(id, itemId, prefix, number, keyId);
      break;
    }
    case 274: {
      if (user.get('mask') > 0) {
        mp.game.ui.notifications.show('~r~У вас уже экипирована маска');
        return;
      }

      if (prefix != user.getSex()) {
        if (prefix == 1)
          mp.game.ui.notifications.show('~r~Вы не можете на себя надеть женскую одежду');
        else mp.game.ui.notifications.show('~r~Вы не можете на себя надеть мужскую одежду');
        return;
      }

      cloth.buyMask(10, keyId, number, 0);
      user.updateCharacterCloth();
      inventory.deleteItemServer(id);
      user.updateCache().then();
      break;
    }
    case 7:
      if (!user.get('item_clock')) {
        user.setData('item_clock', true);
        chat.sendMeCommand('надел часы');

        inventory.deleteItemServer(id);
      } else {
        mp.game.ui.notifications.show('~r~У вас уже экипированы одни часы');
      }
      break;
    case 8:
      if (user.get('phone_code') == 0) {
        methods.saveLog(
          'EquipItems',
          `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
            itemId
          )} | ${prefix}-${number} | ${countItems} | ${keyId}`
        );
        user.setData('phone', number);
        user.setData('phone_code', prefix);

        mp.game.ui.notifications.show('~g~Вы экипировали телефон');
        inventory.deleteItemServer(id);
      } else {
        mp.game.ui.notifications.show('~r~У вас уже экипирован один телефон');
      }
      break;
    case 42:
      if (user.get('business_id') == 0) {
        user.setData('business_id', keyId);

        mp.game.ui.notifications.show('~g~Вы экипировали ключи от офиса');
        inventory.deleteItemServer(id);
      } else {
        mp.game.ui.notifications.show('~r~У вас уже экипированы одни ключи от офиса');
      }
      break;
    case 43:
      if (user.get('id_house') == 0) {
        user.setData('id_house', keyId);

        mp.game.ui.notifications.show('~g~Вы экипировали ключи от дома');
        inventory.deleteItemServer(id);
      } else {
        mp.game.ui.notifications.show('~r~У вас уже экипированы одни ключи от дома');
      }
      break;
    case 44:
      if (user.get('apartment_id') == 0) {
        user.setData('apartment_id', keyId);

        mp.game.ui.notifications.show('~g~Вы экипировали ключи от квартиры');
        inventory.deleteItemServer(id);
      } else {
        mp.game.ui.notifications.show('~r~У вас уже экипированы одни ключи от квартиры');
      }
      break;
    case 50:
      if (user.get('bank_prefix') == 0) {
        methods.saveLog(
          'EquipItems',
          `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
            itemId
          )} | ${prefix}-${number} | ${countItems} | ${keyId}`
        );
        mp.events.callRemote(
          'server:inventory:equipItem',
          id,
          itemId,
          prefix,
          number,
          keyId,
          countItems
        );

      } else {
        mp.game.ui.notifications.show('~r~У вас уже экипирована одна банковская карта');
      }
      break;
    case 138:
      user.addCashMoney(1);
      mp.game.ui.notifications.show('~g~Вы положили $1 в кошелёк');
      inventory.deleteItemServer(id);

      methods.saveLog(
        'EquipItems',
        `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
          itemId
        )} | ${prefix}-${number} | ${countItems} | ${keyId}`
      );
      break;
    case 139:
      user.addCashMoney(100);
      mp.game.ui.notifications.show('~g~Вы положили $100 в кошелёк');
      inventory.deleteItemServer(id);

      methods.saveLog(
        'EquipItems',
        `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
          itemId
        )} | ${prefix}-${number} | ${countItems} | ${keyId}`
      );
      break;
    case 140:
    case 141:
      mp.events.callRemote(
        'server:inventory:equipItem',
        id,
        itemId,
        prefix,
        number,
        keyId,
        countItems
      );

      methods.saveLog(
        'EquipItems',
        `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
          itemId
        )} | ${prefix}-${number} | ${countItems} | ${keyId}`
      );
      break;
    case 27:
    case 28:
    case 29:
    case 30:
    case 146:
    case 147:
    case 148:
    case 149:
    case 150:
    case 151:
    case 152:
    case 153:
      inventory.addAmmo(itemId, countItems);
      mp.game.ui.notifications.show('~g~Вы экипировали патроны');
      inventory.deleteItemServer(id);
      methods.saveLog(
        'EquipItems',
        `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
          itemId
        )} | ${prefix}-${number} | ${countItems} | ${keyId}`
      );
      break;
    default:
      if (itemId <= 136 && itemId >= 54) {
        weapons.hashesMap.forEach((item) => {
          if (item[0] !== items.getItemNameHashById(itemId)) return;
          mp.events.callRemote('server:inventory:equipGun', id, item[1] / 2);
          methods.saveLog(
            'EquipItems',
            `${user.get('rp_name')} (${user.get('id')}) - ${items.getItemNameById(
              itemId
            )} | ${prefix}-${number} | ${countItems} | ${keyId}`
          );

          return;
        });
      }
  }
})

export { inventory };
