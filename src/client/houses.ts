/// <reference path="../declaration/client.ts" />

import {user} from './user';
import {Container} from './modules/data';
import {methods} from './modules/methods';

let houses = {
  enter: function(id:number, x:number, y:number, z:number) {
    user.setVirtualWorld(id);
    user.teleport(x, y, z);
  },

  exit: (x: number, y: number, z: number) => {
    user.setVirtualWorld(0);
    user.teleport(x, y, z);
  },
  getData: async (id: number) => {
    return await Container.GetAll(100000 + methods.parseInt(id));
  },
  
  buy: (id: number) => {
    if (user.getCacheData().get('id_house') > 0) {
      mp.game.ui.notifications.show('~r~У Вас уже есть дом');
      return false;
    }
    mp.events.callSocket('server:houses:buy', id);
    return true;
  },
  updatePin: (id: number, pin: number) => {
    mp.events.callSocket('server:houses:updatePin', id, pin);
  },
  
  getRandomHousePositionOfLosSantos: (
    triggerCallBack = 'client:getRandomHousePositionOfLosSantos'
  ) => {
    mp.events.callSocket('server:houses:getRandomHousePositionOfLosSantos', triggerCallBack);
  },
};

export { houses };
