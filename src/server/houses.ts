
/// <reference path="../declaration/server.ts" />
import { methods } from './modules/methods';
import { user } from './user';
import { coffer } from './coffer';
import { housesEntity } from './modules/entity/housesEntity';
import { userEntity } from './modules/entity/user';

let hBlips:Map<number,BlipMp> = new Map();
let count = 0;

setTimeout(() => {
    mp.events.register('house:getData', (player:PlayerMp, id:number) => {
        let data = houses.getHouseData(id);
        if(!data) return null;
        return {
            price: data.price,
            money_tax: data.money_tax,
            score_tax: data.score_tax,
            address: data.address,
            id: data.id,
        }
    })
}, 1000)

export let houses = {
    data: new Map<number, housesEntity>(),
    loadAll: function() {
        methods.debug('houses.loadAll');
        housesEntity.findAll().then(rows => {
            rows.forEach(function(item) {

                // let needNewBlip = (methods.isTestServer() && !item['is_buy'] && methods.getRandomInt(1, 4) != 1) ? false : true;
                // if(needNewBlip){
                    let pos = new mp.Vector3(item['x'], item['y'], item['z']);
                    houses.data.set(item.id, item);
                    methods.createStaticCheckpoint(pos.x, pos.y, pos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
                    let hBlip = methods.createBlip(
                        pos,
                        (item.id == 1139 || item.id == 1141) ? 455 : 40,
                        item['is_buy'] ? 59 : 69,
                        (item.id == 1139 || item.id == 1141) ? 0.8 : 0.4,
                        "Дом",
                        item['is_buy'] ? 1 : 0
                        );
                    hBlips.set(item.id, hBlip);
                // }
                //methods.createStaticCheckpoint(parseFloat(item['int_x']), parseFloat(item['int_y']), parseFloat(item['int_z']) - 1, "Нажмите ~g~Е~s~ чтобы открыть меню", 1, methods.parseInt(item.id));

            });
            count = rows.length;
            methods.debug('All Houses Loaded: ' + count);
        });
    },

    exists: (id:number) => {
        return houses.data.has(id)
    },

    getHouseData: function(id:number) {
        return houses.data.get(id)
    },

    get: function(id:number, key:any) {
        let data = houses.getHouseData(id);
        if(!data) return;
        return data.get(key)
    },

    getCountLiveUser: function(id:number, cb:(res:number)=>any) {
        id = methods.parseInt(id);
        userEntity.count({where: {id_house: id}}).then(c => {
            cb(c);
        })
    },

    getRandomHousePositionOfLosSantos: function(player:PlayerMp, triggerCallBack = 'client:getRandomHousePositionOfLosSantos') {
        methods.debug('houses.getRandomHousePositionOfLosSantos');
        if (!user.isLogin(player))
            return;

        let addressList =
            [
                "Чумаш",
                "Каньон Бэнхэм",
                "Ричман",
                "Рокфорд-Хиллз",
                "Вайнвуд Хиллз",
                "Западный Вайнвуд",
                "Центральный Вайнвуд",
                "Альта",
                "Буртон",
                "Дель Пьеро",
                "Пуэрто Дель Сол",
                "Каналы Веспучи",
                "Миррор-Парк",
                "Южный Лос-Сантос"
            ];

        let result = [];

        for (let i = 0; i <= count; i++) {
            try {
                if (houses.exists(i)) {
                    if (addressList.includes(houses.get(i, 'address')))
                        result.push(new mp.Vector3(parseFloat(houses.get(i, 'x')), parseFloat(houses.get(i, 'y')), parseFloat(houses.get(i, 'z'))));
                }
            }
            catch (e) {
                //...
                methods.debug(e);
            }
        }
        try {
            let pos = result[methods.getRandomInt(0, result.length)];
            player.call(triggerCallBack, [pos.x, pos.y, pos.z]);
        }
        catch (e) {
            //...
            methods.debug(e);
        }
    },

    getAllHouses: function() {
        // methods.debug('houses.getAllHouses');
        return hBlips;
    },

    getOwnerId: (id:number):number => {
        return houses.getHouseData(id).id_user
    },

    setChestLevel: (id:number, level:number) => {
        houses.getHouseData(id).chest = level;
        housesEntity.update({
            chest: level,
        }, { where: { id: id } })
    },

    updateOwnerInfo: function(id:number, userId:number, userName:string) {
        // methods.debug('houses.updateOwnerInfo');
        id = methods.parseInt(id);
        userId = methods.parseInt(userId);
        let data = houses.getHouseData(id)
        data.name_user = userName;
        data.id_user = userId;
        data.is_buy = userId > 0 ? 1 : 0;
        
        if(userId == 0){
            houses.setChestLevel(id, 0)
        }

        if(hBlips.has(id)){
            hBlips.get(id).dimension = userId > 0 ? 1 : 0;
            hBlips.get(id).color = userId > 0 ? 59 : 69;
        }


        if(userId == 0){

            housesEntity.update({
                pin: 0,
                is_buy: (userId > 0 ? 1 : 0),
                money_tax: 0,
                name_user: userName,
                id_user: userId,
            }, { where: { id: id } })
            data.pin = 0;
        } else {
            housesEntity.update({
                is_buy: (userId > 0 ? 1 : 0),
                money_tax: 0,
                name_user: userName,
                id_user: userId,
            }, { where: { id: id } })
        }
    },

    updatePin: function(id:number, pin:number) {
        // methods.debug('houses.updatePin');
        id = methods.parseInt(id);
        pin = methods.parseInt(pin);
        houses.getHouseData(id).pin = pin;
        housesEntity.update({
            pin: pin,
        }, { where: { id: id } })
    },
    getPin: function(id:number) {
        return houses.getHouseData(id).pin;
    },

    sell: function(player:PlayerMp) {
        // methods.debug('houses.sell');
        if (!user.isLogin(player))
            return;

        if (user.get(player, 'id_house') == 0) {
            player.notify('~r~У Вас нет недвижимости');
            return;
        }

        let hInfo = houses.getHouseData(user.get(player, 'id_house'));

        if (hInfo.get('id_user') != user.get(player, 'id')) {
            player.notify('~r~Этот дом вам не пренадлежит');
            return;
        }

        let nalog = methods.parseInt(hInfo.get('price') * (100 - coffer.get('cofferNalog')) / 100);

        user.set(player, 'id_house', 0);

        if (user.get(player, 'reg_status') != 3) {
            user.set(player, "reg_time", 28);
            user.set(player, "reg_status", 1);
        }

        houses.updateOwnerInfo(hInfo.get('id'), 0, '');

        coffer.removeMoney(nalog);
        user.addMoney(player, nalog);
        user.log(player, "PlayerSell", `Продал дом ${hInfo.get('address')} @house${hInfo.get('id')} за $${nalog}`)
        setTimeout(function() {
            if (!user.isLogin(player))
                return;
            user.addHistory(player, 3, 'Продал дом ' + hInfo.get('address') + ' №' + hInfo.get('id') + '. Цена: $' + methods.numberFormat(nalog));
            player.notify('~g~Вы продали недвижимость');
            player.notify(`~g~Налог:~s~ ${coffer.get('cofferNalog')}%\n~g~Получено:~s~ $${methods.numberFormat(nalog)}`);
            user.saveAccount(player);
        }, 1000);
    },

    buy: function(player:PlayerMp, id:number) {
        methods.debug('houses.buy');

        if (!user.isLogin(player))
            return;

        let hInfo = houses.getHouseData(id);
        if (user.get(player, 'id_house') > 0) {
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

        user.set(player, 'id_house', id);

        if (user.get(player, 'reg_status') != 3) {
            user.set(player, 'reg_time', 372);
            user.set(player, 'reg_status', 2);
        }

        houses.setChestLevel(id, 0);
        houses.updateOwnerInfo(id, user.get(player, 'id'), user.get(player, 'rp_name'));

        coffer.addMoney(hInfo.get('price'));
        user.removeMoney(player, hInfo.get('price'));
        user.log(player, "PlayerBuy", `Купил дом ${hInfo.get('address')} @house${hInfo.get('id')} за $${hInfo.get('price')}`)
        setTimeout(function() {
            if (!user.isLogin(player))
                return;
            user.addHistory(player, 3, 'Купил дом ' + hInfo.get('address') + ' №' + hInfo.get('id') + '. Цена: $' + methods.numberFormat(hInfo.get('price')));
            user.saveAccount(player);
            player.notify('~g~Поздравляем с покупкой недвижимости!');
        }, 500);
        return true;
    }
};
