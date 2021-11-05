/// <reference path="../../declaration/client.ts" />
import {methods} from '../modules/methods';
import {Container} from '../modules/data';
import {user} from '../user';
import {jobPoint} from '../managers/jobPoint';
import {weather} from '../managers/weather';
import { business } from '../business';
import { playMinigame } from '../modules/minigame';
import { gui } from '../modules/gui';

let isProcess = false;
let _checkpointId = -1;
let notifyCarTimer = -1;
let notifyCar:VehicleMp;

setInterval(() => {
    if(!user.get("is6Duty")) return;
    if(mp.players.local.vehicle){
        if(mp.players.local.vehicle.getVariable("job") == "gr6"){
            notifyCarTimer = -1
            notifyCar = null;
            if(mp.players.local.vehicle.getPedInSeat(-1) == mp.players.local.handle && _checkpointId != -1) mp.players.local.taskLeaveVehicle(mp.players.local.vehicle.handle, 0), mp.game.ui.notifications.show('~r~Вы не можете вести транспорт при активном заказе');
        }
    }
    if(notifyCarTimer == -1) return;
    if(notifyCarTimer == 0){
        mp.events.callRemote("gr6:fakeCar")
    } else {
        if(mp.players.local.vehicle && mp.players.local.vehicle.getVariable('job') == 'gr6') notifyCarTimer = -1, notifyCar = null;
        else if(mp.players.local.vehicle && mp.players.local.vehicle.getSpeed() > 2) notifyCarTimer--;
    }
}, 1000)


export let gr6 = {
    correctPosCheck: () => {
        return (mp.players.local.position.z > 0)
    },
    startJob: () => {
        if (user.getCashMoney() < 500) {
            mp.game.ui.notifications.show('~r~У Вас нет на руках $500');
            return;
          }
          user.removeCashMoney(500);
          business.addMoney(162, 500);
          mp.events.callRemote('server:uniform:gr6');
          Container.SetLocally(0, 'is6Duty', true);
    
          //user.giveWeapon('weapon_nightstick', 1);
          user.giveWeapon('weapon_pistol', 100);
          mp.players.local.setArmour(20);
          user.setData("is6Duty", true);
          mp.game.ui.notifications.show('~g~Вы вышли на дежурство');
    },
    stopJob: () => {
        user.updateCharacterCloth();
        mp.game.ui.notifications.show('~y~Вы закончили дежурство и сдали бронежилет.');
        Container.ResetLocally(0, 'is6Duty');
        Container.ResetLocally(0, 'gr6Money');
        Container.ResetLocally(0, 'gr6MoneyBag');
        user.set("is6Duty", false);
        user.setData("is6Duty", false);
        isProcess = false;
        jobPoint.delete();
        _checkpointId = -1;
        notifyCarTimer = -1
        notifyCar = null;
    },

    
    grabMarkers: [
        [2544.863, 2580.673, 36.94484, 280.2184],
        [2552.278, 4672.925, 32.95345, 198.5477],
        [2307.159, 4888.141, 40.80823, 225.9266],
        [1711.456, 4747.02, 40.94597, 192.7653],
        [2413.809, 4991.302, 45.2426, 314.7328],
        [408.0634, 6493.51, 27.09958, 352.5662],
        [-24.08177, 6459.26, 30.41778, 43.72857],
        [47.56932, 6299.511, 30.23523, 31.10848],
        [723.0118, -822.5493, 23.72392, 268.9451],
        [906.7827, -1518.068, 29.43467, 2.248956],
        [845.0453, -2360.232, 29.34108, 176.5479],
        [69.28804, -1428.331, 28.31164, 313.6071],
        [388.5147, 62.68007, 96.97788, 332.0949],
        [-452.1371, 292.7735, 82.2362, 159.7401],
        [-457.0465, -51.68466, 43.51545, 286.6151],
        [-414.9887, -2182.779, 9.318105, 88.39629],
        [-195.8015, -2679.408, 5.006399, 263.6298],
        [254.6616, -3057.888, 4.782318, 312.1826],
        [1234.291, -3204.701, 4.641251, 352.1098],
    ],
    
    
    unload: function() {
        if (methods.distanceToPos(new mp.Vector3(478.9451, -1091.8182, 28.2014), mp.players.local.position) > 30) {
            mp.game.ui.notifications.show('~r~Деньги надо разгружать на базе');
            user.setWaypoint(478.9451, -1091.8182);
            return;
        }
        mp.events.callRemote('server:gr6:unload', mp.players.local.vehicle.remoteId);
    },
    
    deleteVeh: function() {
        if (methods.distanceToPos(new mp.Vector3(478.9451, -1091.8182, 28.2014), mp.players.local.position) > 30) {
            mp.game.ui.notifications.show('~r~Транспорт можно сдать только на базе');
            user.setWaypoint(478.9451, -1091.8182);
            return;
        }
        mp.events.callRemote('server:gr6:delete');
        jobPoint.delete();
    },
    
    grab: function() {

        if (weather.getHour() < 22 && weather.getHour() > 6) {
            mp.game.ui.notifications.show('~r~Доступно только с 22 до 6 утра игрового времени');
            return;
        }
    
        let isFind = false;
    
        gr6.grabMarkers.forEach(function (item) {
            if (methods.distanceToPos(new mp.Vector3(item[0], item[1], item[2]), mp.players.local.position) < 20) {
                mp.events.callRemote('server:gr6:grab');
                user.giveWanted(5, 'Ограбление инкассаторского ТС');
                isFind = true;
                return;
            }
        });
    
        if (!isFind) {
            let pickupId = methods.getRandomInt(0, gr6.grabMarkers.length - 1);
            user.setWaypoint(gr6.grabMarkers[pickupId][0], gr6.grabMarkers[pickupId][1]);
            mp.game.ui.notifications.show('~y~Точка для ограбления транспорта');
        }
    },
    
    
    workProcess: function() {
        playMinigame("gr6").then(status => {
            if(!status) return mp.game.ui.notifications.show('~r~Вам не удалось спаковать сумку');
            jobPoint.delete();
            Container.SetLocally(0, 'gr6MoneyBag', true);
            user.setComponentVariation(5, 45, 0);
            mp.game.ui.notifications.show('~y~Вы взяли сумку с деньгами, садитесь в транспорт');
            isProcess = false;
            _checkpointId = -1
        })
    }
};

mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if (_checkpointId == -1 || _checkpointId == undefined)
        return;
    if (checkpoint.id == _checkpointId)
        gr6.workProcess();
});

mp.events.add("client:createGr6Checkpoint", (x, y, z) => {
    isProcess = true;
    let pos = new mp.Vector3(x, y, z);
    _checkpointId = jobPoint.create(pos, true);
});

mp.events.add("server:gr6:stop", () => {
    gr6.stopJob();
});

mp.events.add("server:gr6:removeTask", () => {
    if(_checkpointId != -1){
        jobPoint.delete();
        _checkpointId = -1;
    }
    user.setComponentVariation(5, 0, 0);
    Container.ResetLocally(0, 'gr6MoneyBag');
    notifyCarTimer = -1;
    notifyCar = null;
    isProcess = false;
});

mp.events.add("playerEnterVehicle", function (vehicle, seat) {
    if(gui.isActionGui()) return;
    if (user.get('job') != 'gr6')
        return;
    if (!user.get('is6Duty'))
        return;
    if (vehicle.getVariable('job') == 'gr6' && Container.HasLocally(0, 'gr6MoneyBag')) {
        mp.events.callRemote('server:gr6:dropCar', vehicle.remoteId);
        user.setComponentVariation(5, 0, 0);

        Container.ResetLocally(0, 'gr6MoneyBag');
        notifyCarTimer = -1;
        notifyCar = null;
        mp.game.ui.notifications.show('~g~Вы загрузили деньги в транспорт');
        user.giveJobSkill();
    } 
    if(vehicle.getVariable('job') != 'gr6' && isProcess){
        if(!notifyCar){
            mp.game.ui.notifications.show('Запрещено передвигатся в не рабочем ТС');
            if(notifyCarTimer == -1) notifyCarTimer = 5
            notifyCar = vehicle
            return;
        }
    }
});



