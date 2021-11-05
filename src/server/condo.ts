/// <reference path="../declaration/server.ts" />

import {Container} from './modules/data'
import {methods} from './modules/methods'
import {user} from './user'
import {coffer} from './coffer'
import { condoEntity } from './modules/entity/condoEntity'

let hBlips = new Map();
let hList = new Map();


export let condo = {
    loadAll: function() {
        methods.debug('condo.loadAll');
        condoEntity.findAll().then(rows => {
            rows.forEach(function (item) {

                Container.Set(300000 + methods.parseInt(item.id), 'id', item.id);
                Container.Set(300000 + methods.parseInt(item.id), 'address', item.address);
                Container.Set(300000 + methods.parseInt(item.id), 'price', item.price);
                Container.Set(300000 + methods.parseInt(item.id), 'id_user', item.id_user);
                Container.Set(300000 + methods.parseInt(item.id), 'name_user', item.name_user);
                Container.Set(300000 + methods.parseInt(item.id), 'pin', item.pin);
                Container.Set(300000 + methods.parseInt(item.id), 'x', item.x);
                Container.Set(300000 + methods.parseInt(item.id), 'y', item.y);
                Container.Set(300000 + methods.parseInt(item.id), 'z', item.z);
                Container.Set(300000 + methods.parseInt(item.id), 'int_x', item.int_x);
                Container.Set(300000 + methods.parseInt(item.id), 'int_y', item.int_y);
                Container.Set(300000 + methods.parseInt(item.id), 'int_z', item.int_z);

                let pos = new mp.Vector3(parseFloat(item.x), parseFloat(item.y), parseFloat(item.z));

                if (item.id_user == 0) {
                    let hBlip = mp.blips.new(40, pos,
                        {
                            color: 0,
                            scale: 0.4,
                            drawDistance: 100,
                            shortRange: true,
                            dimension: -1
                        });
                    hBlips.set(item.id, hBlip);
                }

                //let hBlip = methods.createBlip(pos, 40, 0, 0.4, 'Апартаменты');
                methods.createStaticCheckpointV(pos, "Нажмите ~g~Е~s~ чтобы открыть меню");
                hList.set(item.id, { position: pos });
            });
            methods.debug('All Houses Loaded: ' + rows.length);
        })
    },
    loadBlip: function(id:number) {
        methods.debug('condo.loadBlip');
        condoEntity.findAll({where: {id}}).then(rows => {
            rows.forEach(function (item) {

                let pos = new mp.Vector3(parseFloat(item.x), parseFloat(item.y), parseFloat(item.z));
                let hBlip = mp.blips.new(40, pos,
                    {
                        color: 0,
                        scale: 0.4,
                        drawDistance: 100,
                        shortRange: true,
                        dimension: -1
                    });
                hBlips.set(item.id, hBlip);
            });
        })
    },
    getHouseData: function(id:number) {
        return Container.GetAll(300000 + methods.parseInt(id));
    },
    get: function(id:number, key:any) {
        return Container.Get(300000 + methods.parseInt(id), key);
    },
    getPin: function(id:number) {
        return condo.get(id, 'pin')
    },
    getAllHouses: function() {
        // methods.debug('condo.getAllHouses');
        return hList;
    },
    getOwnerId: (id:number):number => {
        return Container.Get(300000 + id, "id_user")
    },
    updateOwnerInfo: function (id:number, userId:number, userName:string) {
        methods.debug('condo.updateOwnerInfo');
        id = methods.parseInt(id);
        userId = methods.parseInt(userId);
    
        if (hBlips.has(id))
            hBlips.get(id).alpha = userId > 0 ? 0 : 255;
    
        if (userId == 0)
            condo.loadBlip(id);
    
        Container.Set(300000 + id, "name_user", userName);
        Container.Set(300000 + id, "id_user", userId);

        if(userId == 0){
            condoEntity.update({
                name_user: userName,
                id_user: userId,
                money_tax: 0,
                pin: 0,
            }, { where: { id: id}})
        } else {
            condoEntity.update({
                name_user: userName,
                id_user: userId,
                money_tax: 0,
            }, { where: { id: id } })
        }
    },
    updatePin: function (id:number, pin:number) {
        methods.debug('condo.updatePin');
        id = methods.parseInt(id);
        pin = methods.parseInt(pin);
        Container.Set(300000 + id, 'pin', pin);
        condoEntity.update({
            pin: pin
        }, { where: { id: id } })
    },
    sell: function (player:PlayerMp) {
        methods.debug('condo.sell');
        if (!user.isLogin(player))
            return;
    
        if (user.get(player, 'condo_id') == 0) {
            player.notify('~r~У Вас нет недвижимости');
            return;
        }
    
        let hInfo = condo.getHouseData(user.get(player, 'condo_id'));
        let nalog = methods.parseInt(hInfo.get('price') * (100 - coffer.get('cofferNalog')) / 100);
    
        user.set(player, 'condo_id', 0);
    
        if (user.get(player, 'reg_status') != 3)
        {
            user.set(player, "reg_time", 28);
            user.set(player, "reg_status", 1);
        }
    
        condo.updateOwnerInfo(hInfo.get('id'), 0, '');
    
        coffer.removeMoney(nalog);
        user.addMoney(player, nalog);

        user.log(player, "PlayerBuy", `Продал квартиру ${hInfo.get('address')} @condo${hInfo.get('id')} за $${nalog}`)

        setTimeout(function () {
            if (!user.isLogin(player))
                return;
            user.addHistory(player, 3, 'Продал квартиру ' + hInfo.get('address') + ' №' + hInfo.get('id') + '. Цена: $' + methods.numberFormat(nalog));
            player.notify('~g~Вы продали недвижимость');
            player.notify(`~g~Налог:~s~ ${coffer.get('cofferNalog')}%\n~g~Получено:~s~ $${methods.numberFormat(nalog)}`);
            user.saveAccount(player);
        }, 1000);
    },
    buy: function (player:PlayerMp, id:number) {
        methods.debug('condo.buy');
    
        if (!user.isLogin(player))
            return;
    
        let hInfo = condo.getHouseData(id);
        if (user.get(player, 'condo_id') > 0) {
            player.notify('~r~У Вас есть недвижимость');
            return false;
        }
        if (hInfo.get('price') > user.getMoney(player)) {
            player.notify('~r~У Вас не хватает средств');
            return false;
        }
        if (hInfo.get('id_user') > 0) {
            player.notify('~r~Недвижимость уже куплена');
            return false;
        }
    
        user.set(player, 'condo_id', id);
    
        if (user.get(player, 'reg_status') != 3) {
            user.set(player, 'reg_time', 372);
            user.set(player, 'reg_status', 2);
        }
    
        condo.updateOwnerInfo(id, user.get(player, 'id'), user.get(player, 'rp_name'));
    
        coffer.addMoney(hInfo.get('price'));
        user.removeMoney(player, hInfo.get('price'));

        user.log(player, "PlayerBuy", `Купил квартиру ${hInfo.get('address')} @condo${hInfo.get('id')} за $${hInfo.get('price')}`)

        setTimeout(function () {
            if (!user.isLogin(player))
                return;
            user.addHistory(player, 3, 'Купил квартиру ' + hInfo.get('address') + ' №' + hInfo.get('id') + '. Цена: ' + methods.numberFormat(hInfo.get('price')));
            user.saveAccount(player);
            player.notify('~g~Поздравляем с покупкой недвижимости!');
        }, 500);
        return true;
    }
};