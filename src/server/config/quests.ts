import { user } from "../user";
import { inventory } from "../inventory";
import { customParams } from "../modules/admin";
import { levelAccess } from "../../util/level";
import { PICKUP_10, PICKUP_30, PICKUP_50 } from "../managers/pickup.gift";



export const questData:{
  /** Название квеста */
  name: string;
  /** Описание квеста */
  desc: string;
  /** Категория для группировки */
  group?: string;
  /** Текстовое описание награды за выполнение квеста */
  rewards: string[];
  /** Проверка доступа к квесту */
  access: (player:PlayerMp) => boolean;
  /** Проверка на то, что квест выполнен */
  result: (player:PlayerMp) => boolean;
  /** Проверка на то, что квест выполнен */
  progress?: (player:PlayerMp) => string[];
  /** Вызов награды */
  reward: (player:PlayerMp) => void;
}[] = [
  {
    group: "23 февраля",
    name: "Сбор реликвий",
    desc: "Доброго времени суток Вам предстоит найти 50 коллекционных предметов для получения награды. Все предметы разбросаны по игровой карте на суше и похожи на мигающую коробку.",
    rewards: [`10 - $${PICKUP_10}`, `30 - $${PICKUP_30}`, `50 - $${PICKUP_50}`],
    access: (player) => {
      return user.getLevel(player) <= levelAccess.startQuest;
    },
    result: (player) => {
      return (player.shootingPickups.length == 50);
    },
    reward: (player) => {

    },
    progress: (player) => {
      return ["Собрано: " + player.shootingPickups.length+"/50"]
    }
  },
  {
    group: "Начальный квест",
    name: "Начало пути",
    desc: "Сходите в офис здания правительтсва - поднявшись по лестнице, увидите вход. Оформите временную регистрацию, она вам понадобится, и ознакомьтесь с профессиями на трудовой бирже.",
    rewards: ["300$"],
    access: (player) => {
      return user.getLevel(player) <= levelAccess.startQuest;
    },
    result: (player) => {
      return (user.get(player, 'reg_status') == 1 || user.get(player, 'reg_status') == 2 || user.get(player, 'reg_status') == 3);
    },
    reward: (player) => {
      user.giveQuest(player, "Легкие деньги", true);
      user.addCashMoney(player, 300);
    }
  },
  {
    group: "Начальный квест",
    name: "Легкие деньги",
    desc: "Так как вы здесь совсем недавно, для начала вам нужно немного подзаработать. Это легко можно сделать в трех местах, и устроиться можно прямо там. Арендуйте велосипед или мопед в ближайшем пункте проката. Нажав G, выберите в GPS одну из первых трех работ(строитель, мойщик окон или дорожные работы). Когда заработаете 300$, задание будет пройдено.",
    rewards: ["400$"],
    access: (player) => {
      return user.questCompleted(player, "Начало пути");
    },
    result: (player) => {
      if(!player.jobmoneyfarm) player.jobmoneyfarm = 0;
      return player.jobmoneyfarm >= 300;
    },
    reward: (player) => {
      user.giveQuest(player, "Первые документы", true);
      user.addCashMoney(player, 400);
    },
    progress: (player) => {
      return ["Заработано: "+player.jobmoneyfarm+"$"]
    }
  },
  {
    group: "Начальный квест",
    name: "Первые документы",
    desc: "Теперь у вас есть средства, чтобы приобрести права на автомобиль. Отправляйтесь в здание автошколы и получите права категории В.",
    rewards: ["2500$"],
    access: (player) => {
      return user.questCompleted(player, "Легкие деньги");
    },
    result: (player) => {
      return user.get(player, "b_lic");
    },
    reward: (player) => {
      user.giveQuest(player, "Всегда на связи", true);
      user.addCashMoney(player, 2500);
    }
  },
  {
    group: "Начальный квест",
    name: "Всегда на связи",
    desc: "Чтобы вы могли позвонить друзьям, вызвать полицию или скорую, заказать такси или подать объявление, вам нужен телефон, а так же планшет для управления собственным имуществом и коммуникацией со своей фракцией. Отправляйтесь в магазин электроники и купите телефон любой марки а так же планшет.",
    rewards: ["600$"],
    access: (player) => {
      return user.questCompleted(player, "Первые документы");
    },
    result: (player) => {
      return user.getPhone(player) != "0-0" && user.get(player, 'tablet_equip');
    },
    reward: (player) => {
      user.giveQuest(player, "Плати легко", true);
      user.addCashMoney(player, 600);
    }
  },
  {
    group: "Начальный квест",
    name: "Плати легко",
    desc: "Найдите любой банк и оформите карту. С ее помощью, вы потом сможете оплачивать различные услуги.",
    rewards: ["700$"],
    access: (player) => {
      return user.questCompleted(player, "Всегда на связи");
    },
    result: (player) => {
      return user.get(player, 'bank_prefix') >= 1;
    },
    reward: (player) => {
      user.giveQuest(player, "Все знаю", true);
      user.addCashMoney(player, 700);
    }
  },
  {
    group: "Начальный квест",
    name: "Все знаю",
    desc: "Чтобы знать время и погоду в штате, вам нужны часы. Купите их в магазине электроники и обязательно подойдите к консультанту, он вам подскажет полезную информацию.",
    rewards: ["800$"],
    access: (player) => {
      return user.questCompleted(player, "Плати легко");
    },
    result: (player) => {
      return user.get(player, "item_clock") == 1;
    },
    reward: (player) => {
      user.giveQuest(player, "Будь модным", true);
      user.addCashMoney(player, 800);
    }
  },
  {
    group: "Начальный квест",
    name: "Будь модным",
    desc: "Посетите любой магазин одежды, купив любую понравившуюся вам вещь. Попробуйте убрать какой-нибудь предмет в инвентарь(клавиша I). Отметим, что в штате работают магазины с разным ассортиментом вещей, так что вы сможете подобрать одежду на ваш вкус и цвет.",
    rewards: ["900$"],
    access: (player) => {
      return user.questCompleted(player, "Все знаю");
    },
    result: (player) => {
      return false;
    },
    reward: (player) => {
      user.giveQuest(player, "Попытай удачу", true);
      user.addCashMoney(player, 900);
    }
  },
  {
    group: "Начальный квест",
    name: "Попытай удачу",
    desc: "Посетите магазин 24/7 и приобретите лотерейный билет. Вдруг удача вам улыбнется и заодно посмотрите список товаров, может что-нибудь пригодится",
    rewards: ["1000$"],
    access: (player) => {
      return user.questCompleted(player, "Будь модным");
    },
    result: (player) => {
      return inventory.getItemCountById(player, 277) > 0;
    },
    reward: (player) => {
      user.giveQuest(player, "Что дальше", true);
      user.addCashMoney(player, 1000);
    }
  },
  {
    group: "Начальный квест",
    name: "Что дальше",
    desc: "Отправляйтесь к зданию правительства, Кевин вам расскажет что делать дальше и выдаст приличный бонус за ваши старания!",
    rewards: ["3000$"],
    access: (player) => {
      return user.questCompleted(player, "Попытай удачу");
    },
    result: (player) => {
      return false
    },
    reward: (player) => {
      user.addCashMoney(player, 3000);
    }
  },
  // {
  //   group: "Сбор подарков",
  //   name: "Сбор подарков #1",
  //   desc: "Санта Клаус потерял подарки по дороге. Всего их 50. Найдите 10 чтобы получить вознаграждение",
  //   rewards: [items.getItemNameById(279)],
  //   access: (player) => {
  //     return true;
  //   },
  //   result: (player) => {
  //     return user.getHolidayPickups(player).length >= 10
  //   },
  //   reward: (player) => {
  //     inventory.addItem(player, 279, 1, 1, user.getId(player), 1);
  //     user.giveQuest(player, "Сбор подарков #2", true);
  //   },
  //   progress: (player) => {
  //     return ["Собрано подарков: "+user.getHolidayPickups(player).length+"/10"]
  //   }
  // },
  // {
  //   group: "Сбор подарков",
  //   name: "Сбор подарков #2",
  //   desc: "Санта Клаус потерял подарки по дороге. Всего их 50. Найдите 20 чтобы получить вознаграждение",
  //   rewards: ["150 Фишек казино"],
  //   access: (player) => {
  //     return true;
  //   },
  //   result: (player) => {
  //     return user.getHolidayPickups(player).length >= 20
  //   },
  //   reward: (player) => {
  //     user.addChips(player, 150);
  //     user.giveQuest(player, "Сбор подарков #3", true);
  //   },
  //   progress: (player) => {
  //     return ["Собрано подарков: "+user.getHolidayPickups(player).length+"/20"]
  //   }
  // },
  // {
  //   group: "Сбор подарков",
  //   name: "Сбор подарков #3",
  //   desc: "Санта Клаус потерял подарки по дороге. Всего их 50. Найдите 40 чтобы получить вознаграждение",
  //   rewards: ["70000$"],
  //   access: (player) => {
  //     return true;
  //   },
  //   result: (player) => {
  //     return user.getHolidayPickups(player).length >= 40
  //   },
  //   reward: (player) => {
  //     user.addCashMoney(player, 70000);
  //     user.giveQuest(player, "Сбор подарков #4", true);
  //   },
  //   progress: (player) => {
  //     return ["Собрано подарков: "+user.getHolidayPickups(player).length+"/40"]
  //   }
  // },
  // {
  //   group: "Сбор подарков",
  //   name: "Сбор подарков #4",
  //   desc: "Санта Клаус потерял подарки по дороге. Всего их 50. Найдите 50 чтобы получить вознаграждение",
  //   rewards: ["500000$"],
  //   access: (player) => {
  //     return true;
  //   },
  //   result: (player) => {
  //     return user.getHolidayPickups(player).length >= 50
  //   },
  //   reward: (player) => {
  //     user.addCashMoney(player, 500000);
  //   },
  //   progress: (player) => {
  //     return ["Собрано подарков: "+user.getHolidayPickups(player).length+"/50"]
  //   }
  // },
]

export const getQuest = (name:string) => {
  return questData.find(item => item.name == name);
}
