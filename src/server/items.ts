/// <reference path="../declaration/server.ts" />

import { itemsUtil, getDefaultCount, isWeapon } from "../util/inventory";

export let items = {
    isWeapon: isWeapon,
    isAmmoBox: (item_id:number) => {
        let itm = items.getItemNameById(item_id);
        if(!itm) return false;
        return itm[0].toLowerCase().indexOf('коробка патронов') == 0
    },
    itemList: itemsUtil,
    itemExist: (item_id:number) => {
        return !!itemsUtil[item_id]
    },
    canEquipById: function(id: number) {
        try {
            return items.itemList[id][2];
        }
        catch
        {
            return false;
        }
    },
    getDefaultCount: getDefaultCount,
    getItemNameById: function(id: number):string {
        try {
            return <string>items.itemList[id][0];
        }
        catch
        {
            return "UNKNOWN";
        }
    },
    getItemNameHashById: function(id: number) {
        try {
            return items.itemList[id][1];
        }
        catch
        {
            return "UNKNOWN";
        }
    },
    getItemHashById: function(id: number) {
        try {
            return items.itemList[id][3];
        }
        catch
        {
            return 1108364521;
        }
    },
    getItemWeightById: function(id: number) {
        try {
            return items.itemList[id][5];
        }
        catch
        {
            return -1;
        }
    },

    getItemWeightKgById: function(id: number) {
        try {
            let q = <number>items.itemList[id][5];
            return Math.round(q / 1000.0);
        }
        catch
        {
            return -1;
        }
    },

    getItemAmountById: function(id: number) {
        try {
            return items.itemList[id][5];
        }
        catch
        {
            return -1;
        }
    }
};
