/// <reference path="../../declaration/server.ts" />

import { mysql } from '../modules/mysql';
import { vehicles } from '../vehicles';
import { user } from '../user';
import { business } from '../business';
import { methods } from '../modules/methods';
import {vSync} from '../managers/vSync'
import { carsEntity } from '../modules/entity/carsModel';
import { inventory } from '../inventory';



export let lsc = {
  carPos: [[-1159.827,-2015.182,12.16598,338.3167],[-330.8568,-137.6985,38.00612,95.85743],[732.1998,-1088.71,21.15658,89.10553],[-222.6972,-1329.915,29.87796,269.8108],[1174.876,2640.67,36.7454,0.5306945],[110.3291,6626.977,30.7735,223.695],[-147.4434,-599.0691,166.0058,315.3235],[481.2153,-1317.698,28.09073,296.715]],
  carColorPos: [[-1167.36,-2013.42,11.63059,136.2973],[-327.3558,-144.5778,38.04641,250.0263],[735.6607,-1072.729,21.2193,179.3472],[-206.2765,-1323.342,29.87665,2.203119],[1182.65,2638.49,36.78132,357.8441],[103.6963,6622.596,30.81484,224.0517],[-151.0918,-594.4427,166.0052,308.8605],[478.4267,-1308.524,28.01912,27.1145]],
  camColorPos: [[-1167.856,-2016.76,13.53096],[-323.593,-143.7437,39.26034],[733.7505,-1069.566,22.43295],[-209.2587,-1319.221,31.09041],[1184.5,2635.391,38.0],[100.3815,6623.296,32.12886],[-146.051,-593.9824,167.5002],[475.9341,-1307.055,29.43324]],
  list: [[-1148.878,-2000.123,12.18026,14],[-347.0815,-133.3432,38.00966,54],[737.0179,-1082.413,21.11101,55],[-207.0201,-1331.493,33.89437,56],[1187.764,2639.15,37.43521,57],[101.0262,6618.267,31.43771,71],[-146.2072,-584.2731,166.0002,121],[472.2666,-1310.529,28.22178,123]],
    
    loadAll: function() {
        methods.debug('lsc.loadAll');
        lsc.list.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            methods.createBlip(shopPos, 446, 0, 0.8, 'Автомастерская');
            methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
        });
    
        lsc.carColorPos.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "~b~Место для перекраски ТС", 4, -1, [33, 150, 243, 100], 0.3);
        });
    
        lsc.carPos.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            methods.createStaticCheckpoint(shopPos.x, shopPos.y, shopPos.z, "~b~Место тюнинга ТС", 4, -1, [33, 150, 243, 100], 0.3);
        });
    },
    
    getInRadius: function(pos:Vector3Mp, radius = 2) {
        // methods.debug('lsc.getInRadius');
        let shopId = -1;
        lsc.list.forEach(function (item, idx) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pos, shopPos) < radius)
                shopId = methods.parseInt(item[3]);
        });
        return shopId;
    },
    
    checkPosForOpenMenu: function(player:PlayerMp) {
        // methods.debug('lsc.checkPosForOpenMenu');
        try {
            let playerPos = player.position;
            let shopId = -1;
            lsc.list.forEach(function (item, idx) {
                let shopPos = new mp.Vector3(item[0], item[1], item[2]);
                if (methods.distanceToPos(playerPos, shopPos) < 2) {
                    shopId = methods.parseInt(item[3]);
                    let vehicleList1 = methods.getListOfVehicleNumberInRadius(new mp.Vector3(lsc.carPos[idx][0], lsc.carPos[idx][1], lsc.carPos[idx][2]), 4);
                    let vehicleList2 = methods.getListOfVehicleNumberInRadius(new mp.Vector3(lsc.carColorPos[idx][0], lsc.carColorPos[idx][1], lsc.carColorPos[idx][2]), 4);
                    try {
                        player.call('client:menuList:showLscMenu', [shopId, business.getPrice(shopId), idx, vehicleList1, vehicleList2]);
                    }
                    catch (e) {
                        methods.debug(e);
                    }
                }
            });
        }
        catch (e) {
            methods.debug(e);
        }
    },
    
    findNearest: function(pos:Vector3Mp) {
        methods.debug('lsc.findNearest');
        let prevPos = new mp.Vector3(9999, 9999, 9999);
        lsc.list.forEach(function (item,) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
                prevPos = shopPos;
        });
        return prevPos;
    },
    
    buy: function(player:PlayerMp, number:string, price:number, shopId:number, action:string, newNumber:string) {
    
        methods.debug('lsc.buy');
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;
    
        let veh = vehicles.findVehicleByNumber(number);
    
        if (!vehicles.exists(veh))
            return;
    
        switch (action) {
            case 'setNeon': {
                if (veh.getVariable('id_user') < 1) {
                    player.notify('~r~Транспорт должен быть личный');
                    return;
                }
                if (veh.getVariable('id_user') != user.getId(player)) {
                    player.notify('~r~Это должен быть ваш транспорт');
                    return;
                }
                if (vehicles.get(veh.getVariable('container'), 'neon_type') > 1) {
                    player.notify('~r~На транспорте уже установлен неон');
                    return;
                }

                let vInfo = methods.getVehicleInfo(veh.model);
                if(vInfo && vInfo.class_name == "Commercials"){
                    player.notify('~r~На данный транспорт нельзя устанавливать неон');
                    return;
                } 
    
                vehicles.set(veh.getVariable('container'), 'neon_type', 2);
                vehicles.set(veh.getVariable('container'), 'neon_r', 255);
                vehicles.set(veh.getVariable('container'), 'neon_g', 255);
                vehicles.set(veh.getVariable('container'), 'neon_b', 255);
                vehicles.neonStatus(player, veh);
                user.removeMoney(player, price);
                business.addMoney(shopId, price);
    
                player.notify('~g~Вы установили неон');
    
                user.saveAccount(player);
                vehicles.save(veh.getVariable('container'));
                break;
            }
            case 'repair': {
    
                veh.repair();
                user.removeMoney(player, price);
                business.addMoney(shopId, price);
    
                player.notify('~g~Вы отремонтировали трансопрт');
                break;
            }
            case 'setNumber': {
                if (veh.getVariable('id_user') < 1) {
                    player.notify('~r~Транспорт должен быть личный');
                    return;
                }
                if (veh.getVariable('id_user') != user.getId(player)) {
                    player.notify('~r~Это должен быть ваш транспорт');
                    return;
                }
                if (newNumber.length < 1) {
                    player.notify('~r~Минимум 1 символ');
                    return;
                }
    
                if (!lsc.checkValidNumber(newNumber)) {
                    player.notify('~r~Вы не правильно ввели номер');
                    player.notify('~r~Только цифры (0-9) и буквы на англ. (A-Z)');
                    return;
                }
    
                if (newNumber.length == 1 && user.getMoney(player) < 1000000) {
                    player.notify('~r~Номер из 1 символа стоит $1.000.000');
                    return;
                }
    
                if (newNumber.length == 2 && user.getMoney(player) < 500000) {
                    player.notify('~r~Номер из 2 символов стоит $500.000');
                    return;
                }
    
                if (newNumber.length == 3 && user.getMoney(player) < 250000) {
                    player.notify('~r~Номер из 3 символов стоит $250.000');
                    return;
                }
    
                if (newNumber.length == 4 && user.getMoney(player) < 100000) {
                    player.notify('~r~Номер из 4 символов стоит $100.000');
                    return;
                }
                carsEntity.findAll({
                    where: {
                        number: newNumber
                    },
                    limit: 1
                }).then(rows => {
                    if (rows.length === 0) {
    
                        let valid = true;
                        mp.vehicles.forEach(function (v) {
                            if (!vehicles.exists(v))
                                return;
                            if (v.numberPlate == newNumber)
                                valid = false;
                        });
    
                        if (valid) {
    
                            vehicles.set(veh.getVariable('container'), 'number', newNumber);
                            veh.numberPlate = newNumber;
    
                            if (newNumber.length == 1) {
                                user.removeMoney(player, 1000000);
                                business.addMoney(shopId, 500000);
                            }
                            else if (newNumber.length == 2) {
                                user.removeMoney(player, 500000);
                                business.addMoney(shopId, 200000);
                            }
                            else if (newNumber.length == 3) {
                                user.removeMoney(player, 250000);
                                business.addMoney(shopId, 100000);
                            }
                            else if (newNumber.length == 4) {
                                user.removeMoney(player, 100000);
                                business.addMoney(shopId, 50000);
                            }
                            else {
                                user.removeMoney(player, price);
                                business.addMoney(shopId, price);
                            }
    
                            user.saveAccount(player);
                            vehicles.save(veh.getVariable('container'));
    
                            inventory.allItems().filter(itm => itm.owner_id == mp.joaat(veh.numberPlate) && (itm.owner_type == 2 || itm.owner_type == 3 || itm.owner_type == 4)).map(q => {
                                inventory.updateItemOwnerSystem(q.id, q.owner_type, mp.joaat(newNumber))
                            })
    
                            player.notify('~g~Вы изменили номер');
                            return;
                        }
                    }
                    player.notify('~r~Номер уже занят');
                });
                break;
            }
        }
    },
    
    showTun: function(player:PlayerMp, vehNumber:string, modType:number, idx:number) {
        methods.debug('lsc.showTun');
        let veh = vehicles.findVehicleByNumber(vehNumber);
        if (!vehicles.exists(veh))
            return;
        if (modType == 69)
            veh.windowTint = idx;
        else
            veh.setMod(modType, idx);
    },
    
    showColor1: function(player:PlayerMp, number:string, idx:number) {
        methods.debug('lsc.showColor1');
        let veh = vehicles.findVehicleByNumber(number);
        if (!vehicles.exists(veh))
            return;
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
        veh.setColor(idx, veh.getColor(1));
    },
    
    showColor2: function(player:PlayerMp, number:string, idx:number) {
        methods.debug('lsc.showColor2');
        let veh = vehicles.findVehicleByNumber(number);
        if (!vehicles.exists(veh))
            return;
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
        veh.setColor(veh.getColor(0), idx);
    },
    
    buyTun: function(player:PlayerMp, number:string, modType:number, idx:number, price:number, shopId:number) {
        methods.debug('lsc.buyTun');
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 0)
            return;
    
        let veh = vehicles.findVehicleByNumber(number);
    
        if (!vehicles.exists(veh))
            return;
    
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
        if (veh.getVariable('id_user') != user.getId(player)) {
            player.notify('~r~Это должен быть ваш транспорт');
            return;
        }
    
        if (modType == 77) {
            vehicles.set(veh.getVariable('container'), 'livery', idx);
        }
        else {
            let car = vehicles.getData(veh.getVariable('container'));
            let upgrade = JSON.parse(car.get('upgrade'));
            upgrade[modType.toString()] = idx;
            vehicles.set(veh.getVariable('container'), 'upgrade', JSON.stringify(upgrade));
        }
    
        user.removeMoney(player, price);
        business.addMoney(shopId, price);
    
        player.notify('~g~Вы установили деталь, цена: ~s~$' + methods.numberFormat(price));
    
        lsc.resetMod(number);
        vehicles.save(veh.getVariable('container'));
    },
    
    buySTun: function(player:PlayerMp, number:string, modType:number, idx:number, price:number, shopId:number) {
        methods.debug('lsc.buyTun');
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 0)
            return;
    
        let veh = vehicles.findVehicleByNumber(number);
    
        if (!vehicles.exists(veh))
            return;
    
        if (veh.getVariable('id_user') != user.getId(player)) {
            player.notify('~r~Это должен быть ваш транспорт');
            return;
        }
    
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
    
        modType = modType + 100;
    
        if (modType == 0) {
            switch (idx) {
                case 0:
                    idx = -1;
                    break;
                case 1:
                    idx = 0;
                    break;
                case 2:
                    idx = 0.5;
                    break;
                case 3:
                    idx = 1;
                    break;
            }
        }
    
        let car = vehicles.getData(veh.getVariable('container'));
        let upgrade = JSON.parse(car.get('upgrade'));
        upgrade[modType.toString()] = idx;
        vehicles.set(veh.getVariable('container'), 'upgrade', JSON.stringify(upgrade));
    
        user.removeMoney(player, price);
        business.addMoney(shopId, price);
    
        player.notify('~g~Вы обновили ТС, цена: ~s~$' + methods.numberFormat(price));
        vehicles.save(veh.getVariable('container'));
    },
    
    resetSTun: function(player:PlayerMp, number:string, modType:number) {
        methods.debug('lsc.resetSTun');
        if (!user.isLogin(player))
            return;
    
        let veh = vehicles.findVehicleByNumber(number);
    
        if (!vehicles.exists(veh))
            return;
    
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
        if (veh.getVariable('id_user') != user.getId(player)) {
            player.notify('~r~Это должен быть ваш транспорт');
            return;
        }
    
        modType = modType + 100;
    
        let car = vehicles.getData(veh.getVariable('container'));
        let upgrade = JSON.parse(car.get('upgrade'));
        upgrade[modType.toString()] = -1;
        vehicles.set(veh.getVariable('container'), 'upgrade', JSON.stringify(upgrade));
    
        player.notify('~g~Вы обновили ТС, на стандартные настройки');
        vehicles.save(veh.getVariable('container'));
    },
    
    buyColor1: function(player:PlayerMp, number:string, idx:number, price:number, shopId:number) {
        methods.debug('lsc.buyColor1');
        if (!user.isLogin(player))
            return;
    
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;
    
        let veh = vehicles.findVehicleByNumber(number);
    
        if (!vehicles.exists(veh))
            return;
    
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
    
        veh.setColor(veh.getColor(0), idx);
        vehicles.set(veh.getVariable('container'), 'color1', idx);
    
        user.removeMoney(player, price);
        business.addMoney(shopId, price);
    
        player.notify('~g~Вы изменили цвет транспорта');
    
        lsc.resetMod(number);
        vehicles.save(veh.getVariable('container'));
    },
    
    buyColor2: function(player:PlayerMp, number:string, idx:number, price:number, shopId:number) {
        methods.debug('lsc.buyColor2');
        if (!user.isLogin(player))
            return;
        if (user.getMoney(player) < price) {
            player.notify('~r~У вас недостаточно средств');
            return;
        }
    
        if (price < 1)
            return;
    
        let veh = vehicles.findVehicleByNumber(number);
    
        if (!vehicles.exists(veh))
            return;
    
        if (veh.getVariable('id_user') < 1) {
            player.notify('~r~Транспорт должен быть личный');
            return;
        }
    
        veh.setColor(veh.getColor(0), idx);
        vehicles.set(veh.getVariable('container'), 'color2', idx);
    
        user.removeMoney(player, price);
        business.addMoney(shopId, price);
    
        player.notify('~g~Вы изменили цвет транспорта');
    
        lsc.resetMod(number);
        vehicles.save(veh.getVariable('container'));
    },
    
    resetMod: function(number:string) {
        methods.debug('lsc.resetMod');
        try {
            let veh = vehicles.findVehicleByNumber(number);
    
            if (!vehicles.exists(veh))
                return;
    
            let car = vehicles.getData(veh.getVariable('container'));
            if(!car) return;

            veh.setColor(car.get('color1'), car.get('color2'));
    
            if (car.get('neon_type') > 0)
                veh.setNeonColor(car.get('neon_r'), car.get('neon_g'), car.get('neon_b'));
    
            for (let i = 0; i < 80; i++)
                veh.setMod(0, 0);
    
            if(typeof car.get('livery') == "number")
                veh.livery = car.get('livery');
    
            if (car.has('upgrade')) {
                let upgrade = JSON.parse(car.get('upgrade'));
                for (let tune in upgrade) {
                    if (methods.parseInt(tune) >= 100)
                        continue;
                    if (methods.parseInt(tune) === 69)
                        veh.windowTint = methods.parseInt(upgrade[tune]);
                    else if (methods.parseInt(tune) === 78)
                        veh.wheelType = methods.parseInt(upgrade[tune]);
                    else
                        veh.setMod(methods.parseInt(tune), methods.parseInt(upgrade[tune]));
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    },
    
    checkValidNumber: function(number:string) {
        methods.debug('lsc.checkValidNumber');
        number = number.toUpperCase();
        let chars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
        for (let i = 0; i < number.length; i++) {
    
            let isValid = false;
            for (let j = 0; j < chars.length; j++)
            {
                if (number.charAt(i) == chars.charAt(j))
                    isValid = true;
            }
    
            if (!isValid)
                return false;
        }
        return true;
    }
};