import { user } from './user';
import {Container} from "./modules/data";
import { methods } from "./modules/methods";

let stock = {
  pcPos: new mp.Vector3(1088.792, -3101.406, -39.96338),
  stockPos: new mp.Vector3(1095.231, -3098.371, -39.99991),
  exitPos: new mp.Vector3(1104.422, -3099.484, -39.99992),

  enter: (id: number) => {
    user.setVirtualWorld(id + 5100000);
    user.teleport(1104.422, -3099.484, -39.99992);
  },

  exit: (x: number, y: number, z: number) => {
    user.setVirtualWorld(0);
    user.teleport(x, y, z);
  },

  buy: (id: number) => {
    if (user.getCacheData().get('stock_id') > 0) {
        mp.game.ui.notifications.show('~r~У Вас уже есть склад');
        return false;
    }
    mp.events.callRemote('server:stock:buy', id);
    return true;
  },

  getData: async(id: number) => {
    return await Container.GetAll(400000 + methods.parseInt(id));
  },

  updatePin1: (id: number, pin: number) => {
    mp.events.callRemote('server:stock:updatePin1', id, pin);
  },

  updatePin2: (id: number, pin: number) => {
    mp.events.callRemote('server:stock:updatePin2', id, pin);
  },

  updatePin3: (id: number, pin: number) => {
    mp.events.callRemote('server:stock:updatePin3', id, pin);
  },

  addLog: (name: string, text: string, stockId: number) => {
    mp.events.callRemote('server:stock:addLog', name, text, stockId);
  },
};

export { stock };