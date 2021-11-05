import { user } from "../user";
import { casino_business_id } from "../modules/casino_roulette";
import { business } from '../business';
type teleportPointsList = [number, number, number, number, number?, (string|((player: PlayerMp) => string))?, (((player: PlayerMp) => boolean))? ]
export interface teleportElement {
  name:string;
  points: teleportPointsList[];
  oneway?:boolean;
  nocheckdist?:boolean;
  allowveh?:boolean;
  sprite?:string;
}

const list:teleportElement[] = [
  {
    sprite: "diamond",
    name: "Пентхаус",
    nocheckdist: true,
    "points": [
      [969.77, 63.08, 112.56, 243.08, 0, "Вход", player => {
        if (user.get(player, 'fraction_id2') == casino_business_id) return true;
        player.notify('~r~У вас нет доступа')
        return false;

      }],
      [967.53, 63.68, 112.55, 59.58, 0, "Выход", player => {
        if (user.get(player, 'fraction_id2') == casino_business_id) return true;
        player.notify('~r~У вас нет доступа')
        return false;
      }]
    ]
  },
  {
    "name": "Офис FIB",
    "points": [
      [2492.52, -408.71, 100.36, 309.11, 0, "Лифт"],
      [2506.13, -430.18, 115.69, 228.14, 0, "Крыша"]
    ]
  },
  {
    "name": "Лифт",
    "points": [
      [-2361.03, 3249.18, 32.8, 334.4, 0, "Нижний уровень"],
      [-2361.03, 3249.18, 92.8, 334.4, 0, "Верхний уровень"]
    ]
  },
  //! БАНДЫ
  {
    name: "Убежище",
    // allowveh: true,
    points: [
      [414.68, -2071.86, 21.50, 54.82, 0, "Выход"],
      [1021.39, -2398.36, 30.14, 79.63, 21, "Вход", (player) => {
        if (user.getPlayerFraction(player) == 21) return true;
        else return false;
      }]
    ]
  },
  {
    name: "Убежище",
    // allowveh: true,
    points: [
      [-41.47, -1490.43, 31.39, 134.18, 0, "Выход"],
      [1021.39, -2398.36, 30.14, 79.63, 19, "Вход", (player) => {
        if (user.getPlayerFraction(player) == 19) return true;
        else return false;
      }]
    ]
  },
  {
    name: "Убежище",
    // allowveh: true,
    points: [
      [102.63, -1957.95, 20.74, 357.28, 0, "Выход"],
      [1021.39, -2398.36, 30.14, 79.63, 18, "Вход", (player) => {
        if (user.getPlayerFraction(player) == 18) return true;
        else return false;
      }]
    ]
  },
  {
    name: "Убежище",
    // allowveh: true,
    points: [
      [423.09, -1562.20, 29.28, 47.02, 0, "Выход"],
      [1021.39, -2398.36, 30.14, 79.63, 20, "Вход", (player) => {
        if (user.getPlayerFraction(player) == 20) return true;
        else return false;
      }]
    ]
  },
  //! Мафии
  // {
  //   sprite: "ukraine",
  //   "name": "Посольство",
  //   "points": [
  //     [-1516.71, 851.46, 71.59, 333.32, 0, "Выход"],
  //     [1397.58, 1163.99, 114.33, 265.88, 10, "Вход", (player) => {
  //       if(user.getPlayerFraction(player) == 11) return true;
  //       else return false;
  //     }]
  //   ]
  // },
  // {
  //   sprite: "russian",
  //   "name": "Посольство",
  //   "points": [
  //     [-1366.50, 56.68, 54.10, 87.59, 0, "Выход"],
  //     [1397.58, 1163.99, 114.33, 265.88, 11, "Вход", (player) => {
  //       if(user.getPlayerFraction(player) == 8) return true;
  //       else return false;
  //     }]
  //   ]
  // },
  {
    sprite: "japan",
    "name": "Посольство",
    "points": [
      [-348.33, 178.55, 87.92, 183.27, 0, "Выход"],
      [1397.58, 1163.99, 114.33, 265.88, 12, "Вход", (player) => {
        if(user.getPlayerFraction(player) == 10) return true;
        else return false;
      }]
    ]
  },
  // {
  //   sprite: "itali",
  //   "name": "Посольство",
  //   "points": [
  //     [-1886.83, 2049.96, 140.98, 171.73, 0, "Выход"],
  //     [1397.58, 1163.99, 114.33, 265.88, 13, "Вход", (player) => {
  //       if(user.getPlayerFraction(player) == 9) return true;
  //       else return false;
  //     }]
  //   ]
  // },
  {
    "name": "Лифт",
    "oneway": true,
    "points": [
      [388.8792, -60.52224, 122.5355, 334.4],
      [388.105, -75.11, 68.15, 161.7]
    ]
  },
  {
    sprite: "diamond",
    name: "Вход в казино",
    "points": [
      [1089.69, 205.78, -48.99, 328.13, 0, (player:PlayerMp) => {
        return "Игровой зал (Стоимость: "+(player.inCasino ? "Оплачено":(business.getPrice(casino_business_id)+"$"))+")"
      }, (player:PlayerMp) => {
        if(user.get(player, 'fraction_id2') == casino_business_id) return true;
        if(player.inCasino) return true;
        if(user.getCashMoney(player) < business.getPrice(casino_business_id)){
          player.notify("~r~Для входа в казино требуется "+business.getPrice(casino_business_id)+"$")
          return false;
        }
        user.removeCashMoney(player, business.getPrice(casino_business_id))
        business.addMoney(casino_business_id, business.getPrice(casino_business_id));
        player.inCasino = true;
        return true;
      }],
      [935.53, 46.44, 81.095, 125.45, 0, "Улица", (player:PlayerMp) => {
        player.inCasino = false;
        return true;
      }],
      [964.35, 58.81, 112.55, 64.5, 0, (player:PlayerMp) => {
        return "Балкон"+(player.inCasino ? "" : " (Стоимость: "+ (business.getPrice(casino_business_id)+"$)"))
      }, (player:PlayerMp) => {
        if(user.get(player, 'fraction_id2') == casino_business_id) return true;
        if(player.inCasino) return true;
        if(user.getCashMoney(player) < business.getPrice(casino_business_id)){
          player.notify("~r~Для входа в казино требуется "+business.getPrice(casino_business_id)+"$")
          return false;
        }
        user.removeCashMoney(player, business.getPrice(casino_business_id))
        business.addMoney(casino_business_id, business.getPrice(casino_business_id));
        player.inCasino = true;
        return true;
      }],
      [972.02, 52.14, 120.24, 335.52, 0, (player:PlayerMp) => {
        return "Крыша"+(player.inCasino ? "" : " (Стоимость: "+ (business.getPrice(casino_business_id)+"$)"))
      }, (player:PlayerMp) => {
        if(user.get(player, 'fraction_id2') == casino_business_id) return true;
        if(player.inCasino) return true;
        if(user.getCashMoney(player) < business.getPrice(casino_business_id)){
          player.notify("~r~Для входа в казино требуется "+business.getPrice(casino_business_id)+"$")
          return false;
        }
        user.removeCashMoney(player, business.getPrice(casino_business_id))
        business.addMoney(casino_business_id, business.getPrice(casino_business_id));
        player.inCasino = true;
        return true;
      }]
    ]
  }
]

export default list;