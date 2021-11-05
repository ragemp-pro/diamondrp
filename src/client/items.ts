/// <reference path="../declaration/client.ts" />

import { getItemNameHashById } from "../util/inventory";

let _items: any[] = [];

let currentRequestID = 0;
let pendingRequests: { [x: number]: Function } = {};

let updateItems = function() {
  return new Promise((resolve) => {
    pendingRequests[currentRequestID] = resolve;
    mp.events.callRemote('server:items:getItems', currentRequestID);
    currentRequestID++;
  });
};

const items = {
  get: () => {
    return _items;
  },

  loadItems: () => {
    updateItems().then((returnItems: any[]) => {
      try {
        _items = returnItems;
      } catch (e) {
        mp.console.logError(e);
        throw e;
      }
    });
  },

  canEquipById: (id: number) => {
    try {
      return _items[id][2];
    } catch {
      return false;
    }
  },

  getItemNameById: (id: number) => {
    try {
      return _items[id][0];
    } catch {
      return 'UNKNOWN';
    }
  },

  getItemNameHashById: getItemNameHashById,

  getItemHashById: (id: number) => {
    try {
      return _items[id][3];
    } catch {
      return 1108364521;
    }
  },

  getItemWeightById: (id: number) => {
    try {
      return _items[id][4];
    } catch {
      return -1;
    }
  },

  getItemWeightKgById: (id: number) => {
    try {
      return +(_items[id][4] / 1000.0).toFixed(1);
    } catch {
      return -1;
    }
  },

  getItemAmountById: (id: number) => {
    try {
      return _items[id][5];
    } catch {
      return -1;
    }
  },
};

// должно быть тут, иначе никак
mp.events.add('client:items:updateItems', (requestID, returnItems) => {
  try {
    //mp.gui.chat.push(returnItems); // работает
    if (pendingRequests[requestID]) {
      pendingRequests[requestID](returnItems);
    }
  } catch (e) {
    mp.console.logError(e);
    throw e;
  }
});

export { items };
