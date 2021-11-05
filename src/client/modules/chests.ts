import { weather } from "../managers/weather";
import { methods } from "./methods";
import { user } from "../user";

export const chests = {
  grabMarkers: [
    [2544.863, 2580.673, 36.94484, 280.2184],
    [2552.278, 4672.925, 32.95345, 198.5477],
    [2307.159, 4888.141, 40.80823, 225.9266],
    [1711.456, 4747.02, 40.94597, 192.7653],
    [2413.809, 4991.302, 45.2426, 314.7328],
    [408.0634, 6493.51, 27.09958, 352.5662],
    [-24.08177, 6459.26, 30.41778, 43.72857],
    [47.56932, 6299.511, 30.23523, 31.10848],
    [723.0118, -822.5493, 23.72392, 268.9451],
    [906.7827, -1518.068, 29.43467, 2.248956],
    [845.0453, -2360.232, 29.34108, 176.5479],
    [69.28804, -1428.331, 28.31164, 313.6071],
    [388.5147, 62.68007, 96.97788, 332.0949],
    [-452.1371, 292.7735, 82.2362, 159.7401],
    [-457.0465, -51.68466, 43.51545, 286.6151],
    [-414.9887, -2182.779, 9.318105, 88.39629],
    [-195.8015, -2679.408, 5.006399, 263.6298],
    [254.6616, -3057.888, 4.782318, 312.1826],
    [1234.291, -3204.701, 4.641251, 352.1098],
],
grab: function() {
  if (weather.getHour() < 22 && weather.getHour() > 6) {
      mp.game.ui.notifications.show('~r~Доступно только с 22 до 6 утра игрового времени');
      return;
  }

  let isFind = false;

  chests.grabMarkers.forEach(function (item) {
      if (methods.distanceToPos(new mp.Vector3(item[0], item[1], item[2]), mp.players.local.position) < 20) {
          mp.events.callRemote('server:chests:vehicle:grab');
          user.giveWanted(5, 'Ограбление транспорта с вооружением');
          isFind = true;
          return;
      }
  });

  if (!isFind) {
      let pickupId = methods.getRandomInt(0, chests.grabMarkers.length - 1);
      user.setWaypoint(chests.grabMarkers[pickupId][0], chests.grabMarkers[pickupId][1]);
      mp.game.ui.notifications.show('~y~Точка для ограбления транспорта');
  }
},

}