/// <reference path="../../declaration/client.ts" />

import { methods } from '../modules/methods';
import { user } from '../user';
import { business } from '../business';
import { randomArrayEl } from '../../util/methods';


let isProcess = false;
let isStart = false;
let currentPedId = -1;
let posStart = new mp.Vector3(0, 0, 0);
let posEnd = new mp.Vector3(0, 0, 0);
let countPeds = 0;

let pedList:{ ped: PedMp, pedId: number }[] = [];
let taxi = {

    markers: [
        [-111.1722, 6467.846, 31.62671, 2], 
        [-1117.679, 2698.744, 17.55415, 105], 
        [-113.3064, 6469.969, 31.62672, 2],
        [-1148.878, -2000.123, 12.18026, 14], 
        [-1212.83, -330.3573, 37.78702, 1], 
        [-1223.059, -906.7239, 12.32635, 4],
        [-1282.688, -1117.432, 5.990113, 110], 
        [-1305.899, -394.5485, 36.69577, 79], 
        // [-146.2072, -584.2731, 166.0002, 121], 
        [-1487.533, -379.3019, 40.16339, 5],
        [-207.0201, -1331.493, 33.89437, 56], 
        [-276.4055, 6226.398, 30.69552, 109], 
        [-2962.951, 482.8024, 15.7031, 1], 
        [-2968.295, 390.9566, 15.04331, 10],
        [-3039.184, 586.3903, 7.90893, 11],
        [-3171.98, 1087.908, 19.83874, 104], 
        [-3241.895, 1001.701, 12.83071, 9],
        [-33.34319, -154.1892, 56.07654, 48], 
        [-330.36, 6083.885, 30.45477, 107],
        [-347.0815, -133.3432, 38.00966, 54], 
        [-350.6871, -49.60739, 49.04258, 1], 
        [-657.087, -857.313, 23.490, 85],
        [-661.947, -935.6796, 21.82924, 78], 
        [-813.5332, -183.2378, 36.5689, 112],
        [101.0262, 6618.267, 31.43771, 71], 
        [1133.0963, -472.6430, 65.7651, 85],
        [1135.979, -982.2205, 46.4158, 6],
        [1165.314, 2709.109, 38.15772, 51],
        [1175.054, 2706.404, 38.09407, 1], 
        [1187.764, 2639.15, 37.43521, 57], 
        [1214.091, -472.9952, 65.208, 109], 
        [138.7087, -1705.711, 28.29162, 109], 
        [148.5, -1039.971, 29.37775, 1], 
        [1693.555, 3759.9, 33.70533, 106], 
        [1699.741, 4924.002, 42.06367, 7],
        [1729.792, 6414.979, 35.03723, 85],
        [1931.844, 3730.305, 31.84443, 111], 
        [1960.845, 3741.882, 32.34375, 84],
        [22.08832, -1106.986, 29.79703, 75], 
        // [241.1435, 225.0419, 106.2868, 108], 
        // [243.1434, 224.4678, 106.2868, 108], 
        // [246.4875, 223.2582, 106.2867, 108], 
        // [248.3227, 222.5736, 106.2867, 108], 
        // [251.749, 221.4658, 106.2865, 108], 
        [252.17, -50.08245, 69.94106, 76], 
        [253.4611, 220.7204, 106.2865, 108], 
        [2567.651, 294.4759, 107.7349, 103], 
        [26.213, -1345.442, 29.49702, 3],
        [314.3541, -278.5519, 54.17077, 1], 
        [318.2640, -1076.7376, 28.4785, 85],
        [374.3559, 327.7817, 103.5664, 8],
        [472.2666, -1310.529, 28.22178, 123],
        [547.8511, 2669.281, 42.1565, 50],
        [726.0679, -1071.613, 27.31101, 55], 
        [809.9118, -2157.209, 28.61901, 102], 
        [842.2239, -1033.294, 28.19486, 77], 
    ],

    peds: ['a_f_m_beach_01', 'a_f_y_beach_01', 'a_m_m_beach_01', 'a_m_o_beach_01', 'a_m_y_beach_01', 'a_m_m_beach_02', 'a_m_y_beach_02', 'a_m_y_beach_03', 'a_m_y_beachvesp_01', 'a_m_y_beachvesp_02', 'a_f_m_bevhills_01', 'a_f_y_bevhills_01', 'a_m_m_bevhills_01', 'a_m_y_bevhills_01', 'a_f_m_bevhills_02', 'a_f_y_bevhills_02', 'a_m_m_bevhills_02', 'a_m_y_bevhills_02', 'a_f_y_bevhills_03', 'a_f_y_bevhills_04', 'a_m_y_busicas_01', 'a_f_y_business_01', 'a_m_m_business_01', 'a_m_y_business_01', 'a_f_m_business_02', 'a_f_y_business_02', 'a_m_y_business_02', 'a_f_y_business_03', 'a_m_y_business_03', 'a_f_y_business_04', 's_m_y_dealer_01', 'a_f_m_eastsa_01', 'a_f_y_eastsa_01', 'a_m_m_eastsa_01', 'a_m_y_eastsa_01', 'a_f_m_eastsa_02', 'a_f_y_eastsa_02', 'a_m_m_eastsa_02', 'a_m_y_eastsa_02', 'a_f_y_eastsa_03', 'a_m_m_farmer_01', 'a_f_m_fatbla_01', 'a_f_m_fatcult_01', 'a_m_m_fatlatin_01', 'a_f_m_fatwhite_01', 'a_m_y_gay_01', 'a_m_y_gay_02', 'a_m_m_genfat_01', 'a_m_m_genfat_02', 'a_f_y_genhot_01', 'a_f_o_genstreet_01', 'a_f_o_genstreet_01', 'a_m_o_genstreet_01', 'a_m_y_genstreet_01', 'a_m_y_genstreet_02', 's_m_m_gentransport', 'u_m_m_glenstank_01', 'a_f_y_golfer_01', 'a_m_m_golfer_01', 'a_m_m_hillbilly_01', 'a_m_m_hillbilly_02', 'u_m_y_hippie_01', 'a_f_y_hippie_01', 'a_m_y_hippy_01', 'a_f_y_hipster_01', 'a_m_y_hipster_01', 'a_f_y_hipster_02', 'a_m_y_hipster_02', 'a_f_y_hipster_03', 'a_m_y_hipster_03', 'a_f_y_hipster_04', 's_f_y_hooker_01', 's_f_y_hooker_02', 's_f_y_hooker_03', 'g_m_y_korean_01', 'g_m_y_korean_02', 'g_m_y_korlieut_01', 'a_m_m_ktown_01', 'a_m_y_ktown_01', 'a_f_m_ktown_02', 'a_m_y_ktown_02', 'g_f_y_lost_01', 'g_m_y_lost_01', 'g_m_y_lost_02'
    ],

    start: function() {
        if (isProcess) {
            mp.game.ui.notifications.show('~r~Вы уже получили задание');
            //user.setWaypoint(posStart.x, posStart.y);
            user.setWaypointTarget(posStart.x, posStart.y, posStart.z);
            return;
        }
        let q = methods.getNearestHousePos(mp.players.local.position, 5000);
        if (methods.distanceToPos2D(q, new mp.Vector3(0, 0, 0)) < 5) {
            mp.game.ui.notifications.show('~r~В данном месте нет заказов. Советуем поискать их в более населённых местах');
            return;
        }
        isProcess = true;
        let icon = user.get('job') == 'taxi1' ? 'CHAR_TAXI' : 'CHAR_TAXI_LIZ';
        mp.game.ui.notifications.showWithPicture('Заказ', "Диспетчер", 'Клиент вызвал такси', icon, 1);
        posStart = q;
        user.setWaypointTarget(posStart.x, posStart.y, posStart.z);
    },

    findRandomPickup: function() {
        let tp = randomArrayEl(taxi.markers)
        posEnd = new mp.Vector3(tp[0], tp[1], tp[2]);
        user.setWaypointTarget(posEnd.x, posEnd.y, posEnd.z);
        //user.setWaypoint(taxi.markers[pickupId][0], taxi.markers[pickupId][1]);

    },

    checkPos: function() {

        if (!isProcess)
            return;

        if (mp.players.local.vehicle && (mp.players.local.vehicle.getVariable('job') == 'taxi1' || mp.players.local.vehicle.getVariable('job') == 'taxi2')) {

            if (isStart) {
                if (posEnd.x != 0 && methods.distanceToPos2D(posEnd, mp.players.local.position) < 20) {
                    if (methods.getCurrentSpeed() > 1) {
                        mp.game.ui.notifications.show('~b~Вы достигли точки, остановитесь');
                        return;
                    }

                    isStart = false;
                    isProcess = false;

                    user.showLoadDisplay();
                    setTimeout(function() {
                        user.clearWaypointTarget();

                        //methods.deleteGlobalPed(currentPedId);
                        mp.events.call('client:methods:deleteGlobalPed', currentPedId);
                        currentPedId = -1;

                        let price = taxi.getTaxiDistPrice(posStart, posEnd, taxi.getTaxiModalClass(mp.players.local.vehicle.model));

                        if (user.get('skill_taxi') < 400)
                            user.setData('skill_taxi', user.get('skill_taxi') + 1);

                        posStart = new mp.Vector3(0, 0, 0);
                        posEnd = new mp.Vector3(0, 0, 0);

                        taxi.giveTaxiJobMoney(price);

                        setTimeout(function() {
                            user.hideLoadDisplay();
                        }, 1000);
                    }, 500);
                }
            }
            else {
                if (posStart.x != 0 && methods.distanceToPos2D(posStart, mp.players.local.position) < 20) {
                    if (methods.getCurrentSpeed() > 1) {
                        mp.game.ui.notifications.show('~b~Вы достигли точки, остановитесь');
                        return;
                    }

                    isStart = true;

                    user.showLoadDisplay();
                    setTimeout(function() {
                        let modelId = methods.getRandomInt(0, taxi.peds.length - 1);
                        //methods.createGlobalPedInVehicle(taxi.peds[modelId], mp.players.local.vehicle.remoteId);
                        mp.events.call('client:methods:createGlobalPedInVehicle', countPeds, taxi.peds[modelId], mp.players.local.vehicle.remoteId);

                        setTimeout(function() {
                            user.clearWaypointTarget();
                            user.hideLoadDisplay();

                            let ped = taxi.getNearestPed(mp.players.local.position, 20);
                            if (ped)
                                currentPedId = ped.pedId;

                            mp.game.ui.notifications.show('~b~Пассажир сел к Вам в авто');
                            taxi.findRandomPickup();

                        }, 1000);
                    }, 500);
                }
            }
        }
    },

    giveTaxiJobMoney: function(money:number) {

        let businessId = user.get('job') == 'taxi2' ? 147 : 114;

        let taxiMoney = methods.parseInt(money * ((100 - 2) / 100));
        let businessMoney = methods.parseInt(money * (2 / 100));

        if (user.get('skill_taxi') >= 400)
            taxiMoney = methods.parseInt(taxiMoney * 1.5);

        if (user.get('bank_prefix') < 1) {
            user.addCashMoney(taxiMoney);
            mp.game.ui.notifications.show('Вы заработали: ~g~$' + taxiMoney);
        }
        else {
            user.addBankMoney(taxiMoney);
            user.sendSmsBankOperation(`Зачисление средств: ~g~$${taxiMoney}`);
        }

        business.addMoney(businessId, businessMoney);
    },

    getTaxiModalClass: function(model:number) {
        if (methods.getVehicleInfo(model).display_name == 'Oracle2')
            return 1;
        else if (methods.getVehicleInfo(model).display_name == 'Schafter4')
            return 2;
        else if (methods.getVehicleInfo(model).display_name == 'Revolter')
            return 3;
        else if (methods.getVehicleInfo(model).display_name == 'SC1')
            return 4;
        return 0;
    },

    getTaxiDistPrice: function(pos1:Vector3Mp, pos2:Vector3Mp, type = 0) {
        let typePrice = 19;
        let distance = methods.distanceToPos(pos1, pos2);

        switch (type) {
            case 1:
                typePrice = 17;
                break;
            case 2:
                typePrice = 15;
                break;
            case 3:
                typePrice = 12;
                break;
            case 4:
                typePrice = 10;
                break;
        }

        let price = methods.parseInt(distance / typePrice) + 50;
        if (price > 2000)
            price = 2000;

        return methods.parseInt(price / 2);
    },

    execute: function() {
        setInterval(taxi.checkPos, 3000);
    },

    getNearestPed: function(pos:Vector3Mp, r:number) {
        let nearest:{ ped: PedMp, pedId: number }, dist;
        let min = r;
        pedList.forEach(item => {
            if (!mp.peds.exists(item.ped))
                return;
            dist = methods.distanceToPos(pos, item.ped.getCoords(true));
            if (dist < min) {
                nearest = item;
                min = dist;
            }
        });
        return nearest;
    }
};



mp.events.add('client:methods:createGlobalPedInVehicle', (id, model, vehicleId) => {

    let veh = mp.vehicles.atRemoteId(vehicleId);
    if (mp.vehicles.exists(veh) && methods.distanceToPos(veh.position, mp.players.local.position) < 300) {
        /*let spawnPos = veh.position;
        if (methods.distanceToPos(veh.position, mp.players.local.position) > 300)
            spawnPos = new mp.Vector3(0, 0, 0);*/

        let ped = mp.peds.new(mp.game.joaat(model), veh.position, 270.0);
        try {
            ped.setCollision(false, false);
        }
        catch (e) {
            methods.debug(e);
        }
        mp.game.invoke(methods.TASK_ENTER_VEHICLE, ped.handle, veh.handle, 3, 0, 0, 0);
        pedList.push({ ped: ped, pedId: id });
    }
});

mp.events.add('client:methods:deleteGlobalPed', (id) => {
    pedList.forEach((item) => {
        if (item.pedId == id) {
            if (mp.peds.exists(item.ped))
                item.ped.destroy();
        }
    });
});

export { taxi };