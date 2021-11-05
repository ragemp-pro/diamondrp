/// <reference path="../declaration/client.ts" />

import {Container} from './modules/data';
import { methods } from './modules/methods';

let business = {
  typeList: [
    'Банки',
    'Магазины 24/7',
    'Магазины одежды',
    'Автомастерские',
    'Пункты аренды',
    'Заправки',
    'Парикмахерские',
    'Развлечения',
    'Услуги',
    'Юридические компании',
    'Офисы',
    'Магазины оружия',
    'Тату салоны',
    'Разное',
    'Салоны транспорта',
  ],

  BusinessOfficePos: new mp.Vector3(-140.7121, -617.3683, 168.1204),
  BusinessMotorPos: new mp.Vector3(-138.6593, -592.6267, 166.3002),
  BusinessStreetPos: new mp.Vector3(-116.8427, -604.7336, 35.58074),
  BusinessGaragePos: new mp.Vector3(-155.6696, -577.3766, 31.72448),
  BusinessRoofPos: new mp.Vector3(-136.6686, -596.3055, 207.2157),
  BusinessBotPos: new mp.Vector3(-139.2922, -631.5964, 167.8204),

  addMoney: (id: number, money: number, ignoreLimit = false) => {
    mp.events.callSocket('server:business:addMoney', id, money, ignoreLimit);
  },


  getMoney: async (id: number) => {
    try {
      let data = await business.getData(id);
      if (data) return data.bank
      else return 0;
    } catch (e) {
      methods.debug(e);
      return 0;
    }
  },

  getPrice: async (id: number) => {
    try {
      let data = await business.getData(id);
      if (data) return data.price_product
      else return 0;
    } catch (e) {
      methods.debug(e);
      return 0;
    }
  },
  getData: async (id: number): Promise<{ name: string, name2: string, price: number, money_tax: number, score_tax: number, user_name: string, user_id: number, bank: number, type: number, price_product: number, price_card1: number, price_card2: number, tarif: number }> => {
    let data = await mp.events.callServer('get:business:data', id)
    return data;
  },
};

export { business };
