/// <reference path="../declaration/client.ts" />

import { user } from './user';
import {Container} from './modules/data';
import { methods } from './modules/methods';

let condo = {
  enter: (id: number, x: number, y: number, z: number) => {
    user.setVirtualWorld(id + 5000000);
    user.teleport(x, y, z);
  },
  
  exit: (x: number, y: number, z: number) => {
    user.setVirtualWorld(0);
    user.teleport(x, y, z);
  },
  
  getData: async (id: number) => {
    return await Container.GetAll(300000 + methods.parseInt(id));
  },
  
  buy: (id: number) => {
    if (user.getCacheData().get('condo_id') > 0) {
      mp.game.ui.notifications.show('~r~У Вас уже есть дом');
      return false;
    }
    mp.events.callSocket('server:condo:buy', id);
    return true;
  },
  
  updatePin: (id: number, pin: number) => {
    mp.events.callSocket('server:condo:updatePin', id, pin);
  },
};

export { condo };
