import { itemsUtil, isWeapon } from "../util/inventory";
const ItemList = itemsUtil;

const items_old = {
  isWeapon: isWeapon,
  defaultModelHash: 1108364521,
  canEquipById: (id: number) => {
    try {
      return ItemList[id][2];
    } catch {
      return false;
    }
  },
  
  getItemNameById: (id: number) => {
    try {
      return ItemList[id][0];
    } catch {
      return 'UNKNOWN';
    }
  },
  
  getItemNameHashById: (id: number) => {
    try {
      return ItemList[id][1];
    } catch {
      return 'UNKNOWN';
    }
  },
  
  getItemHashById: (id: number) => {
    try {
      return ItemList[id][3];
    } catch {
      return 1108364521;
    }
  },
  
  getItemWeightById: (id: number) => {
    try {
      return ItemList[id][4];
    } catch {
      return -1;
    }
  },
  
  getItemWeightKgById: (id: number) => {
    try {
      return Math.round(ItemList[id][4] / 1000.0);
    } catch {
      return -1;
    }
  },
  
  getItemAmountById: (id: number) => {
    try {
      return ItemList[id][5];
    } catch {
      return -1;
    }
  },
};

export { items_old };
