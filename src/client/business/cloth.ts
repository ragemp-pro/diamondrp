/// <reference path="../../declaration/client.ts" />

import { methods } from '../modules/methods';
import { enums } from '../enums';



let clothM:any;
let clothF:any;
let propM:any;
let propF:any;
let shopList:any;
let initCloth = false;

let checkInit = function() {
    if (!initCloth) {
        cloth.initCloth();
        initCloth = !initCloth;
    }
};


let cloth = {
    initCloth: function() {
        clothM = enums.get('clothM');
        clothF = enums.get('clothF');
        propM = enums.get('propM');
        propF = enums.get('propF');
        shopList = enums.get('shopList');
        methods.debug('Execute: cloth.initCloth');
    },

    getShopIdInRadius: function(pos: Vector3Mp, radius: number, id: number) {
        checkInit();
        for (var i = 0; i < shopList.length; i++) {
            if (shopList[i][2] != id) continue;
            if (methods.distanceToPos(pos, new mp.Vector3(shopList[i][3], shopList[i][4], shopList[i][5])) < radius)
                return ~~shopList[i][1];
        }
        return -1;
    },

    findNearest: function(pos: Vector3Mp) {
        checkInit();
        var shopPosPrew = new mp.Vector3(shopList[0][3], shopList[0][4], shopList[0][5]);
        for (var i = 0; i < shopList.length; i++) {
            if (shopList[i][2] != 0) continue;
            var shopPos = new mp.Vector3(shopList[i][3], shopList[i][4], shopList[i][5]);
            if (methods.distanceToPos(shopPos, pos) < methods.distanceToPos(shopPosPrew, pos))
                shopPosPrew = shopPos;
        }
        return shopPosPrew;
    },

    buy: function(price: number, body: number, cloth: number, color: number, torso: number, torsoColor: number, parachute: number, parachuteColor: number, shopId = 0, isFree = false) {
        checkInit();
        methods.debug('cloth', price, body, cloth, color, torso, torsoColor, parachute, parachuteColor);
        mp.events.callRemote('server:business:cloth:buy', price, body, cloth, color, torso, torsoColor, parachute, parachuteColor, shopId, isFree);
    },

    changeMask: function(cloth: number, color: number) {
        checkInit();
        mp.events.callRemote('server:business:cloth:changeMask', cloth, color);
    },

    buyMask: function(price: number, cloth: number, color: number, shopId = 0) {
        checkInit();
        mp.events.callRemote('server:business:cloth:buyMask', price, cloth, color, shopId);
    },

    change: function(body: number, cloth: number, color: number, torso: number, torsoColor: number, parachute: number, parachuteColor: number) {
        checkInit();
        mp.events.callRemote('server:business:cloth:change', body, cloth, color, torso, torsoColor, parachute, parachuteColor);
    },

    buyProp: function(price: number, body: number, cloth: number, color: number, shopId = 0, isFree = false) {
        checkInit();
        mp.events.callRemote('server:business:cloth:buyProp', price, body, cloth, color, shopId, isFree);
    },

    changeProp: function(body: number, cloth: number, color: number) {
        checkInit();
        mp.events.callRemote('server:business:cloth:changeProp', body, cloth, color);
    }
};


export { cloth };
