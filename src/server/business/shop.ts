/// <reference path="../../declaration/server.ts" />

import { methods } from '../modules/methods';
import { business } from '../business';
import { user } from '../user';
import { items } from '../items';
import { inventory } from '../inventory';
import { pickups } from '../modules/pickups';
import { menu } from '../modules/menu';
import { lotoList, itemLoto } from '../../util/loto';

mp.events.add('openLoto', (player: PlayerMp, shopId:number) => {
    shop.lotoMenu(player, shopId)
})

export let shop = {
    lotoMenu: (player: PlayerMp, shopId: number, addedNalog:number = 0) => {
        let m = menu.new(player, "American Loto");
        if(player.spamProtect) return;
        let itemsLoto = inventory.allItems().filter(item => item.item_id == itemLoto && item.key_id == 0)
        lotoList.map(loto => {
            m.newItem({
                name: `Розыгрыш на ~g~$${methods.numberFormat(loto.prize)}`,
                more: `$${methods.numberFormat(loto.cost)}`,
                desc: `Осталось билетов: ${(loto.count - itemsLoto.filter(item => item.item_id == itemLoto && item.prefix == loto.prize && item.key_id == 0).length)}`,
                onpress: () => {
                    m.close();
                    player.spamProtect = true;
                    setTimeout(() => {
                        if (mp.players.exists(player)) player.spamProtect = false
                    }, 5000)
                    if (user.getCashMoney(player) < loto.cost) return player.notify("~r~У вас недостаточно средств для покупки билета")
                    if ((loto.count - itemsLoto.filter(item => item.item_id == itemLoto && item.prefix == loto.prize && item.key_id == 0).length) <= 0) return player.notify("~r~Билеты закончились, ожидайте розыгрыша")
                    
                    
                    if (inventory.currentAmount(1, user.getId(player)) + items.getItemWeightById(itemLoto) > inventory.maxAmount(1, user.getId(player))) {
                        player.notify('~r~В инвентаре нет места');
                        return;
                    }
                    user.removeCashMoney(player, loto.cost);

                    /*
                    KeyId = Status
                    -1 Lose
                    0 Wait
                    1 Win
        
                    Prefix = Winner
                    Number = Winner
                    * */
                    let price = loto.cost

                    let toShop = 10;
                    let toBusiness = 40;

                    if (price == 150) {
                        toShop = 10;
                        toBusiness = 40;
                    }
                    else if (price == 1000) {
                        toShop = 50;
                        toBusiness = 150;
                    }
                    else if (price == 1500) {
                        toShop = 50;
                        toBusiness = 450;
                    }
                    else
                        price = 150;

                    inventory.addItem(player, itemLoto, 1, 1, user.getId(player), 1, loto.prize, -1, 0);
                    player.notify('~g~Вы купили лотерейный билет по цене: ~s~$' + price);

                    business.addMoney(167, toBusiness);
                    if (addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                    else business.addMoney(shopId, price);


                }
            })
        })
        m.newItem({
            name: "~y~Обменять все билетики на выигрыш",
            onpress: () => {
                m.close();
                if (player.spamProtect) return;
                player.spamProtect = true;
                setTimeout(() => {
                    if (mp.players.exists(player)) player.spamProtect = false
                }, 5000)
                let rows = inventory.allItems().filter((item) => item.owner_id == user.getId(player) && item.owner_type == 1 && item.item_id == 277 && item.key_id == 1);
                if (rows.length > 0) {
                    rows.forEach((item) => {
                        user.addCashMoney(player, item.prefix);
                        inventory.deleteItem(item.id);
                        methods.notifyWithPictureToPlayer(
                            player,
                            'Поздравляем!',
                            `#${item['number']}`,
                            `~g~Вы обменяли билетик: ~s~$${methods.numberFormat(item['prefix'])}`,
                            'WEB_PILLPHARM'
                        );
                    });
                } else {
                    player.notify('~r~У Вас нет билетиков');
                }
            }
        })
        m.newItem({
            name: "~y~Сдать все билетики",
            onpress: () => {
                m.close();
                if (player.spamProtect) return;
                player.spamProtect = true;
                setTimeout(() => {
                    if (mp.players.exists(player)) player.spamProtect = false
                }, 5000)
                let rows = inventory.allItems().filter((item) => item.owner_id == user.getId(player) && item.owner_type == 1 && item.item_id == 277 && item.key_id == -1);
                rows.map(item => {
                    inventory.deleteItem(item.id)
                })

                methods.notifyWithPictureToPlayer(
                    player,
                    'American Loto',
                    `Спасибо!`,
                    `~g~Вы сдали все просроченные билетики`,
                    'WEB_PILLPHARM'
                );
            }
        })
        m.open()
    },
    digitalDen: new mp.Vector3(-657.087, -857.313, 23.490),
    digitalDenMirror: new mp.Vector3(1133.0963, -472.6430, 65.7651),
    apteka: new mp.Vector3(318.2640, -1076.7376, 28.4785),
    apteka2: new mp.Vector3(92.8906, -229.4265, 53.6636),
    apteka3: new mp.Vector3(301.4576, -733.25683, 28.37248),
    
    list: [
        [26.213,-1345.442,29.49702,3],
        [-1223.059,-906.7239,12.32635,4],
        [-1487.533,-379.3019,40.16339,5],
        [1135.979,-982.2205,46.4158,6],
        [1699.741,4924.002,42.06367,7],
        [374.3559,327.7817,103.5664,8],
        [-3241.895,1001.701,12.83071,9],
        [-3039.184,586.3903,7.90893,11],
        [-2968.295,390.9566,15.04331,10],
        [547.8511,2669.281,42.1565,50],
        [1165.314,2709.109,38.15772,51],
        [1960.845,3741.882,32.34375,84],
        [1729.792,6414.979,35.03723,85]
    ],
    
    loadAll: function() {
        methods.debug('shop.loadAll');
        shop.list.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2] - 1);
            methods.createBlip(shopPos, 52, 0, 0.8, 'Магазин 24/7');
            methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
        });
    
        methods.createBlip(pickups.PrintShopPos, 72, 0, 0.8, 'Магазин принтов на одежду');
    
        methods.createBlip(shop.digitalDen, 521, 0, 0.8, 'Магазин электроники Digital Den');
        methods.createStaticCheckpoint(shop.digitalDen.x, shop.digitalDen.y, shop.digitalDen.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
    
        methods.createBlip(shop.digitalDenMirror, 521, 0, 0.8, 'Магазин электроники Digital Den');
        methods.createStaticCheckpoint(shop.digitalDenMirror.x, shop.digitalDenMirror.y, shop.digitalDenMirror.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
    
        methods.createBlip(shop.apteka, 153, 69, 0.8, 'Аптека');
        methods.createStaticCheckpoint(shop.apteka.x, shop.apteka.y, shop.apteka.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
    
        methods.createBlip(shop.apteka2, 153, 69, 0.8, 'Аптека');
        methods.createStaticCheckpoint(shop.apteka2.x, shop.apteka2.y, shop.apteka2.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
    
        methods.createBlip(shop.apteka3, 153, 69, 0.8, 'Аптека');
        methods.createStaticCheckpoint(shop.apteka3.x, shop.apteka3.y, shop.apteka3.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
    },
    
    getInRadius: function(pos:Vector3Mp, radius = 2) {
        // methods.debug('shop.getInRadius');
        let shopId = -1;
        shop.list.forEach(function (item, idx) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pos, shopPos) < radius)
                shopId = methods.parseInt(item[3]);
        });
        return shopId;
    },
    
    checkPosForOpenMenu: function(player:PlayerMp) {
        // methods.debug('shop.checkPosForOpenMenu');
        try {
            let playerPos = player.position;
            let shopId = shop.getInRadius(playerPos, 2);
            if (shopId == -1)
            {
                if (methods.distanceToPos(playerPos, shop.digitalDen) < 2)
                    player.call('client:menuList:showElectroShopMenu', [120]);
                else if (methods.distanceToPos(playerPos, shop.digitalDenMirror) < 2)
                    player.call('client:menuList:showElectroShopMenu', [126]);
                else if (methods.distanceToPos(playerPos, shop.apteka) < 2)
                    player.call('client:menuList:showAptekaShopMenu', [124]);
                else if (methods.distanceToPos(playerPos, shop.apteka2) < 2)
                    player.call('client:menuList:showAptekaShopMenu', [154]);
                else if (methods.distanceToPos(playerPos, shop.apteka3) < 2)
                    player.call('client:menuList:showAptekaShopMenu', [158]);
                return;
            }
            player.call('client:menuList:showShopMenu', [shopId, business.getPrice(shopId)]);
        }
        catch (e) {
            methods.debug(e);
        }
    },
    
    findNearest: function(pos:Vector3Mp) {
        methods.debug('shop.findNearest');
        let prevPos = new mp.Vector3(9999, 9999, 9999);
        shop.list.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
                prevPos = shopPos;
        });
        return prevPos;
    },
    
    buy: function(player:PlayerMp, itemId:number, price:number, shopId:number, addedNalog = 0) {
        methods.debug('shop.buy');
    
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;
    
        if ([inventory.types.BagTransfer, inventory.types.Bag, inventory.types.BagFull, inventory.types.BagSmall].includes(itemId)){
            if (user.hasBag(player)) return player.notify(`~r~У вас уже есть сумка в инвентаре`);
            else {
                setTimeout(() => {
                    if(mp.players.exists(player)){
                        user.checkComponents(player)
                    }
                }, 2000)
            }
        }

        switch (itemId) {
            case 221:
                if(!user.get(player, "allow_antipohmel")) return player.notify("~r~У вас нет рецепта на Антипохмелин")
                inventory.addItem(player, 221, 10, 1, user.getId(player), 1);
                user.removeMoney(player, price);
                user.set(player, 'allow_antipohmel', 0);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
                break;
            case 8:
                if (user.get(player, 'phone_code') > 0 && user.get(player, 'phone') > 0) {
                    player.notify('~r~Для начала снимите с экипировки телефон');
                    return;
                }
    
                user.set(player, 'phone_code', 555);
                user.set(player, 'phone', methods.getRandomInt(10000, 999999));
    
                player.notify('~g~Вы купили телефон по цене: ~s~$' + price);
    
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
                break;
            case 10008:
                if (user.get(player, 'phone_code') > 0 && user.get(player, 'phone') > 0) {
                    player.notify('~r~Для начала снимите с экипировки телефон');
                    return;
                }
    
                user.set(player, 'phone_code', 777);
                user.set(player, 'phone', methods.getRandomInt(10000, 999999));
    
                player.notify('~g~Вы купили телефон по цене: ~s~$' + price);
    
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
                business.addMoney(92, price / 2);
                break;
            case 20008:
                if (user.get(player, 'phone_code') > 0 && user.get(player, 'phone') > 0) {
                    player.notify('~r~Для начала снимите с экипировки телефон');
                    return;
                }
    
                user.set(player, 'phone_code', 111);
                user.set(player, 'phone', methods.getRandomInt(10000, 999999));
    
                player.notify('~g~Вы купили телефон по цене: ~s~$' + price);
    
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, (price - (price / 100 * addedNalog)) / 2);
                else business.addMoney(shopId, price / 2);
                business.addMoney(92, price / 2);
                break;
            case 2820000:
                if (user.get(player, 'tablet_equip') > 0) {
                    player.notify('~r~Для начала снимите с экипировки планшет');
                    return;
                }
    
                user.set(player, 'tablet_equip', 1);
    
                player.notify('~g~Вы купили планшет по цене: ~s~$' + price);
    
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, (price - (price / 100 * addedNalog)) / 2);
                else business.addMoney(shopId, price / 2);
                business.addMoney(92, price / 2);
                break;
            case 7:
                if (user.get(player, 'item_clock')) {
                    player.notify('~r~Для начала снимите с экипировки часы');
                    return;
                }
    
                player.notify('~g~Вы купили часы по цене: ~s~$' + price);
                user.set(player, 'item_clock', true);
    
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
                break;
            case 47:
                if (user.get(player, 'is_buy_walkietalkie')) {
                    player.notify('~r~У Вас уже есть рация');
                    return;
                }
    
                player.notify('~g~Вы купили рацию по цене: ~s~$' + price);
                user.set(player, 'is_buy_walkietalkie', true);
                user.set(player, 'walkietalkie_num', "70");
    
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
                break;
            case 277:
            {
                let amount = inventory.getInvAmount(player, user.getId(player), 1);
                if (amount + items.getItemAmountById(itemId) > 55000) {
                    player.notify('~r~В инвентаре нет места');
                    return;
                }
    
                /*
                KeyId = Status
                -1 Lose
                0 Wait
                1 Win
    
                Prefix = Winner
                Number = Winner
                * */
    
                let toShop = 10;
                let toBusiness = 40;
                let countItems = 10000;
                if (price == 150) {
                    toShop = 10;
                    toBusiness = 40;
                    countItems = 10000;
                }
                else if (price == 1000) {
                    toShop = 50;
                    toBusiness = 150;
                    countItems = 100000;
                }
                else if (price == 1500) {
                    toShop = 50;
                    toBusiness = 450;
                    countItems = 1000000;
                }
                else
                    price = 150;
    
                inventory.addItem(player, 277, 1, 1, user.getId(player), 1, countItems, methods.getRandomInt(100000, 999999), 0);
                player.notify('~g~Вы купили лотерейный билет по цене: ~s~$' + price);
    
                user.removeMoney(player, price);
                business.addMoney(167, toBusiness);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
    
                inventory.updateAmount(player, user.getId(player), 1);
                break;
            }
            default:
                let amount = inventory.getInvAmount(player, user.getId(player), 1);
                if (amount + items.getItemAmountById(itemId) > 55000) {
                    player.notify('~r~В инвентаре нет места');
                    return;
                }
    
                if (itemId == 155 && !user.get(player, 'allow_marg')) {
                    player.notify('~r~У Вас нет рецепта');
                    return;
                }

                if (inventory.currentAmount(1, user.getId(player)) + items.getItemAmountById(itemId) > inventory.maxAmount(1, user.getId(player))) {
                    player.notify('~r~Инвентарь заполнен');
                    return;
                }
    
                if (itemId == 155) {
                    user.set(player, 'allow_marg', false);
                }
    
                inventory.addItem(player, itemId, 1, 1, user.getId(player), itemId == 155 || itemId == 275 ? 10 : 1, -1, -1, -1);
                player.notify('~g~Вы купили товар по цене: ~s~$' + price);

                user.log(player, "PlayerBuy", `Покупка в магазине за $${price} ${items.getItemNameById(itemId)}`)
                user.removeMoney(player, price);
                if(addedNalog) business.addMoney(shopId, price - (price / 100 * addedNalog));
                else business.addMoney(shopId, price);
    
                inventory.updateAmount(player, user.getId(player), 1);
                break;
        }
    }
};
