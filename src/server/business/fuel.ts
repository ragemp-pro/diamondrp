/// <reference path="../../declaration/server.ts" />

import { business } from '../business';
import { methods } from '../modules/methods';
import { vehicles } from '../vehicles';
import { user } from '../user';

export let fuel = {
    markers: [[-1436.907,-276.7434,46.2077],[1181.085,-332.457,69.17603],[-2555.328,2334.161,33.07804],[820.5913,-1028.354,26.28338],[-2096.782,-321.0891,13.16862],[266.3101,-1262.233,29.14289],[-1798.881,803.0383,138.6512],[-319.7586,-1471.749,30.54867],[620.6727,268.8043,103.0894],[1208.05,-1402.304,35.22414],[-724.5606,-935.9816,19.21322],[-71.04662,-1761.899,29.65545],[261.9595,2607.725,44.90799],[1210.331,2660.641,37.80556],[2680.197,3263.732,55.24052],[2003.131,3773.745,32.40389],[1699.996,6415.61,32.67349],[183.0834,6602.298,31.84904],[-94.24948,6419.677,31.48952],[1785.835,3331.355,41.36417],[2582.799,361.9792,108.4573],[-525.8305,-1210.831,18.18483],[175.9581,-1561.268,29.25868],[-976.5975,-2998.578,12.94507],[-799.4369,-1503.509,-1.474802],[-722.5702,-1472.637,4.000523]],
    stations: [[-1428.609,-269.087,46.2077,0,0,20,25],[1163.282,-323.9004,69.20513,1,1,20,26],[-2544.321,2316.688,33.2159,0,2,20,27],[818.1421,-1040.465,26.75079,0,3,20,28],[-2073.842,-327.2829,13.31597,0,4,20,29],[288.9222,-1266.991,29.44076,0,5,20,30],[-1820.795,792.2365,138.121,1,6,20,31],[-342.1414,-1483.01,30.70372,0,7,20,32],[645.6617,267.5023,103.2332,0,8,20,33],[1211.271,-1389.322,35.37689,0,9,15,34],[-707.4156,-914.7997,19.21559,1,10,20,35],[-48.44829,-1757.987,29.42101,1,11,20,36],[265.9477,2598.808,44.78529,0,12,10,37],[1200.653,2655.875,37.85188,0,13,10,38],[2677.276,3281.558,55.24114,1,14,10,39],[2001.553,3779.738,32.18078,0,15,15,40],[1705.878,6424.97,32.76269,0,16,15,41],[162.0032,6636.448,31.56107,0,17,20,42],[-92.99864,6410.08,31.64046,0,18,10,43],[1776.583,3327.637,41.43328,0,19,10,44],[2557.362,382.5201,108.6229,1,20,20,45],[-531.2673,-1220.685,18.45499,0,21,20,46],[167.0998,-1553.519,29.26175,0,22,20,47],[-998.1706,-3031.017,13.94507,0,23,50,81],[-784.4645,-1506.364,1.5952133,0,24,20,82],[-706.188,-1466.079,5.042738,0,25,20,83]],
    
    loadAll: function() {
        methods.debug('fuel.loadAll');
        fuel.stations.forEach(function (item, idx) {
            let fuelStationPos = new mp.Vector3(fuel.markers[idx][0], fuel.markers[idx][1], fuel.markers[idx][2]);
            let fuelStationShopPos = new mp.Vector3(item[0], item[1], item[2] - 1);
            methods.createBlip(fuelStationPos, 415, 0, 0.8, 'Заправка');
            methods.createStaticCheckpoint(fuelStationShopPos.x, fuelStationShopPos.y, fuelStationShopPos.z, "Нажмите ~g~Е~s~ чтобы открыть меню");
            if (item[3] == 1)
                methods.createBlip(fuelStationShopPos, 52, 0, 0.8, 'Магазин 24/7');
        });
    },
    
    getInRadius: function(pos:Vector3Mp, radius = 2) {
        // methods.debug('fuel.getInRadius');
        let stationId = -1;
        fuel.stations.forEach(function (item, idx) {
            let fuelStationShopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(pos, fuelStationShopPos) < radius)
                stationId = methods.parseInt(item[6]);
        });
        return stationId;
    },
    
    checkPosForOpenMenu: function(player:PlayerMp) {
        // methods.debug('fuel.checkPosForOpenMenu');
        try {
            let playerPos = player.position;
            fuel.stations.forEach(function (item, idx) {
                let fuelStationShopPos = new mp.Vector3(item[0], item[1], item[2]);
                if (methods.distanceToPos(playerPos, fuelStationShopPos) < 2) {
                    let stationId = methods.parseInt(item[6]);          
                    try {
                        player.call('client:menuList:showFuelMenu', [stationId, item[3] == 1, business.getPrice(stationId)]);
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
        methods.debug('fuel.findNearest');
        let prevPos = new mp.Vector3(9999, 9999, 9999);
        fuel.markers.forEach(function (item) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(prevPos, pos))
                prevPos = shopPos;
        });
        return prevPos;
    }
};