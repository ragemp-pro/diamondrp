/// <reference path="../../declaration/server.ts" />
import deathReasonList from '../config/deathReasonList.json'
import fs from 'fs'
import Discord from 'discord.js'
import { user, workUser } from "../user"
import {menu} from "./menu";
import { vehicles } from "../vehicles";
import { methods } from "../modules/methods";
import { chat, enabledSystem } from "./chat";
import { weather } from '../managers/weather';
import { business } from '../business';
import { baseItems, newChest, oldChestPool } from './chest';
import { spawnParkMenu } from '../managers/parking';
import { enums } from '../enums';
import { vehicleInfo, vehClassName } from './vehicleInfo';
import { autosalon } from '../business/autosalon';
import { dressRoom, garderobPool } from './garderob';
import { fractionGarage } from './fraction.vehicles.spawn';
import { garderobEntity } from './entity/garderob';
import { moneyChestEntity } from './entity/moneyChest';
import { moneyChest, moneyChests } from './moneyChest';
import { weaponChest } from './entity/weaponChest';
import { userEntity } from './entity/user';
import { socketInit } from '../socket';
import { blackListEntity } from './entity/blackList';
import { Op } from 'sequelize';
import { vehicleBoosterEntity } from './entity/vehicleBooster';
import { businessEntity } from './entity/business';
import { coffer } from '../coffer';
import { exec } from 'child_process';
import { restartConf } from '../managers/restart';
import { RAGE_BETA } from '../../util/newrage';
import { fractionUtil } from '../../util/fractions';
import { whitelist } from './whitelist';
import { gangWarsZoneEntity } from './entity/gangWarsZone';
import { baseDzone, reloadGangWarZones } from './gangwar';
import { chest } from '../modules/customchest';
import { inventory, itemsDB } from '../inventory';
import { items } from '../items';
import { inventoryEntity } from './entity/inventory';
import { tempConfigs } from '../../util/tempConfigs';
import { promocodeUsingEntity, promocodeEntity } from './entity/promocodeUsing';
import { clothItem, propItem } from '../../util/inventory';
import { carsEntity } from './entity/carsModel';
import adminsTp from '../config/adminsTp'
import { weaponsUtil } from '../../util/weapons';
import { createTempPromocode, tempPromocodes } from './events';
import { enabledHackTimeout, enableHackTimeout } from '../promisehack';
import { npc } from './npc';
const hook = new Discord.WebhookClient('681570762255237142', 'TU1rOAb3qv7DVkNvWezV9wnlyDzzAG4SO4lHwyEbawDhAlhbnQbVB37ALd_jSt1esTsq');
// const hook = new Discord.WebhookClient('681572841878978576', 'bC_tkr8JSt6ppszrEWhzjkNt-RVm3gJEMs9hNS57OdAHcNDaMTXlV0UPSQMuZsFU_qe3');
let webhookBlock = false
setInterval(() => {
  if (webhookBlock) return;
  let players = mp.players.length
  if (players > 100){
    let admins = mp.players.toArray().filter((player) => user.isAdmin(player)).length
    if(admins == 0){
      if(!methods.isTestServer()){
        hook.send('@here Внимание. На сервере ' + players+' игроков, но при этом нет администраторов в сети. Просим зайти на сервер');
        webhookBlock = true;
        setTimeout(() => {
          webhookBlock = false; 
        }, 15 * 60000);
      }
    }
  }
}, 60000);

setTimeout(() => {
  chat.registerCommand("atest", (player) => {
    mainMenu(player)
  })
}, 1000)

mp.events.add("admin:menu", (player:PlayerMp) => {
  mainMenu(player)
})

let killers: { user: number, time: number, pos: Vector3Mp, target_pos: Vector3Mp, target: number, reason:string}[] = [];
const KILL_SAVE_TIME_MIN = 30;

mp.events.add('playerDeath', (player: PlayerMp, reason: number, killer: PlayerMp) => {
  if (!killer) return;
  if (!user.isLogin(killer)) return;
  if (!user.isLogin(player)) return;
  let srcReason = (deathReasonList as any)[reason.toString()]
  let reasonText = "";
  if (srcReason) {
    reasonText = `${srcReason} ${reason}`
  }
  killers.push({
    user: user.getId(killer),
    target: user.getId(player),
    pos: killer.position,
    target_pos: player.position,
    reason: reasonText,
    time: methods.getTimeStamp()
  })
});

setInterval(() => {
  let time = methods.getTimeStamp()
  killers.map((item, index) => {
    if (item.time + KILL_SAVE_TIME_MIN * 60 < time) killers.splice(index, 1);
  })
}, 120000);

/** Кастомные параметры всяких штук, типа x2 payday и т.д. */
export let customParams = {...tempConfigs}

let admin_labels:{user:number,label:TextLabelMp}[] = []

export const setCustomParams = (name:string,value:boolean) => {
  // @ts-ignore
  customParams[name] = value
  saveTempConf();
}


function newBiz(player:PlayerMp, param?:{name:string,user_id:number;price:number}){
  let m = menu.new(player, "Новый офис", "Параметры")
  m.workAnyTime = true;
  m.onclose = () => {gameData(player);}
  if(!param){
    param = {
      name: "",
      user_id: 0,
      price: 50000,
    }
  }
  m.newItem({
    name: "Название",
    more: param.name,
    onpress: () => {
      menu.input(player, "Введите название", param.name, 30).then(text => {
        param.name = text
        if(!text) param.name = ''
        newBiz(player, param);
      });
    }
  })
  m.newItem({
    name: "Ид владельца",
    more: param.user_id,
    onpress: () => {
      menu.input(player, "Введите id", param.user_id.toString(), 11).then(text => {
        param.user_id = methods.parseInt(text)
        if(!text) param.user_id = 0
        newBiz(player, param);
      });
    }
  })
  m.newItem({
    name: "Стоимость",
    more: param.price,
    onpress: () => {
      menu.input(player, "Введите стоимость", param.price.toString(), 11).then(text => {
        param.price = methods.parseInt(text)
        if(!text) param.price = 0
        newBiz(player, param);
      });
    }
  })
  m.newItem({
    name: "~g~Создать",
    onpress: () => {
      let target = user.getPlayerById(param.user_id);
      if(!target && param.user_id != 0) return player.notify("~r~Указанного пользователя нет в сети")

      businessEntity.create({
        name: param.name,
        price: param.price,
        user_name: target ? user.getRpName(target) : '',
        user_id: target ? param.user_id : 0,
        bank: 0,
        type: 10,
        price_product: 1,
        price_card1: 10,
        price_card2: 10,
        tarif: 0,
        interior: 2,
      }).then(res => {
        business.load(res);
        if (target && param.user_id != 0) {
          user.set(target, "fraction_id2", res);
          user.set(target, "rank2", 11);
        }
        player.notify("~g~Офис успешно создан");
        m.close();
      })
    }
  })
  m.open();
}

function customEnable(player:PlayerMp){
  if(!user.isAdminNow(player) || user.getAdminLevel(player) < 6) return;
  let m = menu.new(player, "Дополнительные параметры", "Список")
  m.workAnyTime = true;
  m.onclose = () => {mainMenu(player);}

  // m.newItem({
  //   name: "X2 PayDay Money", more: customParams.paydayx2 ? "~g~Включено" : "Выключено",
  //   desc: "Увеличивает суммарный доход в 2 раза",
  //   onpress: () => {
  //     customParams.paydayx2 = !customParams.paydayx2;
  //     player.notify(customParams.paydayx2 ? "~g~Включено" : "~r~Отключено");
  //     saveTempConf()
  //   }
  // })
  for (let param in tempConfigs){
    m.newItem({
      name: tempConfigs[param], more: customParams[param] ? "~g~Включено" : "Выключено",
      onpress: () => {
        // @ts-ignore
        customParams[param] = !customParams[param];
        player.notify(tempConfigs[param] ? "~g~Включено" : "~r~Отключено");
        saveTempConf()
      }
    })
  }
  m.newItem({
    name: "Очистить отыгранное время",
    desc: "Время, которое для пункта выше",
    onpress: () => {
      user.accept(player, "Вы уверены?").then(status => {
        if(!status) return customEnable(player);
        userEntity.update({ played_time: 0 }, { where: {} });
        mp.players.forEach(player => {
          player.played_time = 0
        })
        player.notify('~g~Готово');
      })
    }
  })

  m.open()
}

function timeEdit(player:PlayerMp){
  if(!user.isAdminNow(player) || user.getAdminLevel(player) < 6) return;
  let m = menu.new(player, "Настройка времени", "Список")
  m.workAnyTime = true;
  m.onclose = () => {gameData(player);}

  m.newItem({
    name: "Часы", more: weather.getHour(),
    desc: "",
    onpress: () => {
      menu.input(player, "Введите новое значение (0-23)", weather.getHour().toString(), 2).then(text => {
        if(!text) return player.notify("~r~Отмена")
        let hr = methods.parseInt(text);
        if(isNaN(hr) || hr < 0 || hr > 23) return player.notify("~r~Значение введено не верно");
        weather.setHour(hr);
        weather.timeSyncTimer();
        timeEdit(player)
      })
    }
  })

  m.newItem({
    name: "Минуты", more: weather.getMin(),
    desc: "",
    onpress: () => {
      menu.input(player, "Введите новое значение (0-59)", weather.getMin().toString(), 2).then(text => {
        if(!text) return player.notify("~r~Отмена")
        let hr = methods.parseInt(text);
        if(isNaN(hr) || hr < 0 || hr > 59) return player.notify("~r~Значение введено не верно");
        weather.setMin(hr);
        weather.timeSyncTimer();
        timeEdit(player)
      })
    }
  })

  m.open()
}

function vehCatalog(player:PlayerMp){
  if(!user.isAdminNow(player) || user.getAdminLevel(player) < 5) return;
  let m = menu.new(player, "Каталог ТС", "Категории")
  m.workAnyTime = true;
  m.onclose = () => {gameData(player);}

  m.newItem({
    name: "Конфиги ТС",
    desc: "",
    onpress: () => {
      let submenu = menu.new(player, "Список конфигов");
      submenu.workAnyTime = true;
      submenu.onclose = () => {vehCatalog(player);}
      submenu.newItem({
        name: "Добавить новый",
        onpress: () => {
          menu.input(player, "Введите модель").then(model => {
            if(model.length < 2) return player.notify("~r~Необходимо ввести модель");
            model = methods.model(model)
            if(vehicleInfo.find(model)) return player.notify("~r~Нельзя добавлять ту модель, которая уже есть в списке"), vehCatalog(player)
            menu.input(player, "Введите название").then(name => {
              if(name.length < 2) return player.notify("~r~Необходимо ввести модель");
              menu.input(player, "Введите объем багажника (кг)").then(stock2 => {
                let stock = methods.parseInt(stock2)
                if(isNaN(stock) || stock < 0 || stock > 999990999) return player.notify("~r~Параметр указан не верно");
                stock*=1000;

                  menu.input(player, "Введите расход топлива (л)").then(fuel_min2 => {
                    let fuel_min = methods.parseInt(fuel_min2)
                    if(isNaN(fuel_min) || fuel_min < 0 || fuel_min > 999990999) return player.notify("~r~Параметр указан не верно");
                    menu.input(player, "Введите объем бензобака (л)").then(fuel_full2 => {
                      let fuel_full = methods.parseInt(fuel_full2)
                      if(isNaN(fuel_full) || fuel_full < 0 || fuel_full > 999990999) return player.notify("~r~Параметр указан не верно");

                      menu.selector(player, "Выбор класса", ['Commercials',
                      'Compacts',
                      'Coupes',
                      'Industrial',
                      'Motorcycles',
                      'Muscle',
                      'Off-Road',
                      'Sedans',
                      'Sports',
                      'Sports Classics',
                      'Super',
                      'SUVs',
                      'Utility',
                        'Vans']).then((classs: vehClassName) => {
                        if(!classs) return player.notify("~r~Необходимо выбрать класс"), vehCatalog(player);

                        vehicleInfo.create(model, name, classs, stock, fuel_full, fuel_min);
                        player.notify("~g~Успешно")
                        vehCatalog(player)
                      })
                    })
                  })

              })
            })
          })
        }
      })
      enums.vehicleInfo.forEach((item) => {
        submenu.newItem({
          name: item.display_name,
          desc: `Вес баг.: ${(item.stock/1000).toFixed(2)} кг, Расход топ.: ${item.fuel_min}л, Объем бенз.: ${item.fuel_full}л`,
          onpress: () => {
            const id = item.id
            const setting = () => {
              let item = enums.vehicleInfo.find(q => q.id === id);
              if(!item) return;
              let submenu2 = menu.new(player, "Настройка", item.display_name);
              submenu2.newItem({
                name: "Электрокар",
                more: `${item.fuel_min == 0 && item.class_name != 'Cycles' ? 'Да' : 'Нет'}`
              })
              submenu2.newItem({
                name: "Вес багажника",
                more: `${(item.stock / 1000).toFixed(2)} кг`,
                onpress: () => {
                  menu.input(player, "Введите вес (кг)", `${(item.stock / 1000).toFixed(0)}`, 6, "int").then(stockfull => {
                    if (!stockfull) return setting();
                    vehicleInfo.update({ stock: stockfull*1000}, id).then(res => {
                      setting();
                    })
                  });
                }
              })
              submenu2.newItem({
                name: "Объём бензобака",
                more: `${(item.fuel_full)} л`,
                onpress: () => {
                  menu.input(player, "Введите объём", `${(item.fuel_full)}`, 6, "int").then(val => {
                    if (!val) return setting();
                    vehicleInfo.update({ fuel_full: val}, id).then(res => {
                      setting();
                    })
                  });
                }
              })
              submenu2.newItem({
                name: "Расход в минуту",
                more: `${(item.fuel_min)} л`,
                onpress: () => {
                  menu.input(player, "Введите объём", `${(item.fuel_min)}`, 6, "int").then(val => {
                    if (!val) return setting();
                    vehicleInfo.update({ fuel_min: val}, id).then(res => {
                      setting();
                    })
                  });
                }
              })
              submenu2.newItem({
                name: "Настроить ТС под электрокар",
                onpress: () => {
                  if (item.class_name == 'Cycles') return player.notify(`~r~Велотранспорт не может быть электрокаром)`)
                  vehicleInfo.update({ fuel_full: 1, fuel_min: 0 }, id).then(res => {
                    setting();
                  })
                }
              })
  
              submenu2.newItem({name: '~r~Удалить', onpress: () => {
                user.accept(player, "Удалить запись?").then(status => {
                  if (!status) return vehCatalog(player);
                  vehicleInfo.remove(item.id).then(() => {
                    player.notify("~g~Запись успешно удалена")
                    vehCatalog(player)
                  })
                })
              }})
              submenu2.open();
            }
            setting();
            
          }
        })
      })
      submenu.open();
    }
  })



  m.newItem({
    name: "Автосалоны",
    desc: "",
    onpress: () => {
      let submenu = menu.new(player, "Список салонов");
      submenu.workAnyTime = true;
      submenu.onclose = () => {vehCatalog(player);}
      autosalon.list.map((item, index) => {
        submenu.newItem({
          name: item[0],
          onpress: () => {
            let submenu2 = menu.new(player, "Список ТС");
            submenu2.workAnyTime = true;
            submenu2.onclose = () => {vehCatalog(player);}
            submenu2.newItem({
              name: "Добавить новую модель",
              onpress: () => {
                menu.input(player, "Введите модель с большой буквы").then(model => {
                  if(!model) return;
                  model = methods.model(model)
                  let hash = mp.joaat(model);
                  if(!vehicleInfo.find(hash)) return player.notify("~r~Данного ТС нет в каталоге конфига. Сначала его нужно добавить туда");
                  autosalon.addModel(index, model);
                  player.notify("~g~ТС успешно добавлен в указанный салон");
                })
              }
            })
            autosalon.models[index].map(model => {
              submenu2.newItem({
                name: model,
                onpress: () => {
                  user.accept(player, "Удалить запись?").then(status => {
                    if(!status) return vehCatalog(player);
                    autosalon.removeModel(index, model);
                    player.notify("~g~Модель успешно удалена")
                    vehCatalog(player)
                  })
                }
              })
            })
            submenu2.open();
          }
        })
      })
      submenu.open();
    }
  })


  m.newItem({
    name: "Новое ТС на продажу",
    desc: "",
    onpress: async () => {
      if(!player.vehicle) return player.notify("~r~Сядьте в тот ТС, который хотите добавить в автосалон. Мы скопируем его данные чтобы вы не заполняли их в ручную")
      if(!player.vehicle.modelname) return player.notify("~r~ТС должно быть заспавнено админом")
        const vInfo = vehicleInfo.find(player.vehicle.model)
        if(!vInfo) {
          player.notify("~r~По какой то причине мы не обнаружили данный ТС в конфигах");
          return vehCatalog(player);
        }
        let cars = await carsEntity.findAll({
          where: {
            [Op.or]: [{ hash: player.vehicle.model }, { hash: methods.hashToDb(player.vehicle.model)}]
          }
        })
        let costHelp = ``;
        if(cars.length > 0){
          costHelp = ` (Уже существует за ${cars[0].price}$)`
        }
        menu.input(player, "Введите стоимость"+costHelp, "", 10, "int").then(sums => {
          if(!player.vehicle) return player.notify("~r~Сядьте в тот ТС, который хотите добавить в автосалон. Мы скопируем его данные чтобы вы не заполняли их в ручную")
          if(!player.vehicle.modelname) return player.notify("~r~ТС должно быть заспавнено админом")
          let sum = methods.parseInt(sums);
          if(isNaN(sum) || sum <= 0 || sum > 99999999) return player.notify("~r~Стоимость указана не верно")
          let q:string[] = [];
          for (let i = 1; i < 21; i++) q.push(i.toString());
          menu.selector(player, "Количество", q).then(scount => {
            if(!player.vehicle) return player.notify("~r~Сядьте в тот ТС, который хотите добавить в автосалон. Мы скопируем его данные чтобы вы не заполняли их в ручную")
            if(!player.vehicle.modelname) return player.notify("~r~ТС должно быть заспавнено админом")
            if(!scount) return;
            let vCount = methods.parseInt(scount);
            if(isNaN(vCount) || vCount < 0 || vCount > 21) return;
            for (let i = 0; i < vCount; i++) {
              let number = vehicles.generateNumber();
              let color = methods.getRandomInt(0, 156);

              let vInfo = methods.getVehicleInfo(player.vehicle.model);
              if (vInfo.display_name == 'Unknown'){
                player.notify("~r~Конфига для данного ТС не существует")
                continue;
              }

              carsEntity.create({
                hash: player.vehicle.model,
                name: player.vehicle.modelname,
                class_type: vInfo.class_name,
                full_fuel: vInfo.fuel_full,
                fuel: vInfo.fuel_full,
                fuel_minute: vInfo.fuel_min,
                color1: color,
                color2: color,
                number: number,
                stock_full: vInfo.stock,
                price: sum,
                x: 0,
                y: 0,
                z: 0,
                rot: 0,
              })
            }
            

            setTimeout(() => {
              autosalon.loadCars();
            }, 5000);
            // setTimeout(() => {
            //   vehicles.loadAll(0, false);
            // }, 5000);

            player.notify('~b~ТС был добавлен на сервер. Кол-во: ~s~' + vCount);
          })
        })
    }
  })

  m.open()
}


function saveTempConf(){
  fs.writeFile("tempdata.json", JSON.stringify(customParams), function (err) {
      if(err) {
          methods.createFile("tempdata.json");
          saveTempConf()
      }
  });
}

fs.readFile("tempdata.json", "utf8", function (err, data) {
  if(err) return saveTempConf();
  let d = JSON.parse(data)
  for (let param in tempConfigs) {
    // @ts-ignore
    customParams[param] = false
  }
  for(let id in d){
    // @ts-ignore
    customParams[id] = d[id]
  }
});

let runTestExec = false;

function mainMenu(player:PlayerMp){
  if (!methods.isTestServer() && !user.isAdmin(player)) return player.notify('~r~У вас нет доступа к данному меню');
  let m = menu.new(player, "", "Действия");
  m.sprite = "admin"
  m.workAnyTime = true;
  if(RAGE_BETA){
    m.newItem({
      name: "~r~Быстрый перезаход",
      onpress: () => {
        player.notify("Команда отправлена")
        player.kickSilent("Reconnect")
      }
    })
  }
  m.newItem({
    name: "Замер скорости ТС",
    onpress: () => {
      player.call('carCompare')
    }
  })
  m.newItem({
    name: "Точки телепортации",
    onpress: () => {
      menu.selector(player, "Выберите точку", adminsTp.map(itm => {return itm[0] as string}), true).then(id => {
        if(typeof id != "number") return;
        user.teleportVeh(player, adminsTp[id][1], adminsTp[id][2], adminsTp[id][3]);
      })
    }
  })
  if(methods.isTestServer()){
    m.newItem({
      name: "~g~====== ТЕСТ РАЗДЕЛ ======",
      onpress: () => {
        let submenu = menu.new(player, "Функции тестера")
        submenu.workAnyTime = true;
        submenu.onclose = () => {mainMenu(player)}
        submenu.newItem({
          name: "ТП на метку",
          onpress: () => {
            user.teleportWaypoint(player);
          }
        })
        submenu.newItem({
          name: "Спавн ТС",
          onpress: () => {
            menu.input(player, "Введите название ТС").then(model => {
              if (!model) return;
              let vehicle = vehicles.spawnCar(player.position, player.heading, model);
              vehicle.dimension = player.dimension;
              player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
            })
          }
        })
        submenu.newItem({
          name: "Уровень игрока",
          more: 'Текущий: ' + user.getLevel(player),
          onpress: () => {
            menu.input(player, "Введите уровень", user.getLevel(player).toString(), 3, "int").then(lvl => {
              if (!lvl) return mainMenu(player);
              if (isNaN(lvl) || lvl < 0 || lvl > 99) return player.notify("~r~Уровень игрока указан не верно")
              user.setLevel(player, lvl)
              player.notify('~g~Уровень установлен');
              return mainMenu(player)
            })
          }
        })
        submenu.newItem({
          name: "Получить 1000000$",
          onpress: () => {
            user.addCashMoney(player, 1000000)
            user.addBankMoney(player, 1000000)
            player.notify('~g~Готово')
          }
        })
        submenu.newItem({
          name: "Восскреснуть",
          onpress: () => {
            user.healProtect(player)
            player.spawn(player.position);
            player.health = 100;
          }
        })
        submenu.newItem({
          name: "100% армор",
          onpress: () => {
            player.armour = 100;
          }
        })
        submenu.newItem({
          name: "Выдать оружие",
          onpress: () => {
            menu.selector(player, "Выберите оружие", weaponsUtil.hashesMap.map(([name, hashhalh]) => name), true).then(async ids => {
              if (typeof ids !== "number") return mainMenu(player)
              let weapon = weaponsUtil.hashesMap[ids];
              let ammo = await menu.input(player, "Количество патронов", "100", 10, "int");
              if (!ammo || ammo < 1) return player.notify(`~r~Количество патронов указано не верно`), mainMenu(player)
              user.giveWeaponByHash(player, mp.joaat("WEAPON_" + weapon[0].toUpperCase()), ammo)
              player.notify('~g~Оружие выдано');
              return mainMenu(player)
            });
          }
        })
        submenu.newItem({
          name: "Выдать офф фракцию",
          more: user.getPlayerFractionName(player),
          onpress: () => {
            menu.selectFraction(player).then(fract => {
              if (fract == null) return;
              user.set(player, "fraction_id", fract);
              user.set(player, "rank", 1);
              user.updateClientCache(player);
              player.notify("~g~Фракция установлена")
              user.saveAccount(player)
              return mainMenu(player)
            })
          }
        })
        if (user.getPlayerFraction(player)) {
          submenu.newItem({
            name: "Ранг офф фракции",
            more: `${user.getRankName(user.getPlayerFraction(player), user.getPlayerFractionRank(player))} [${user.getPlayerFractionRank(player)}]`,
            onpress: () => {
              if (!user.getPlayerFraction(player)) return mainMenu(player);
              let fractionranks = fractionUtil.getFractionRanks(user.getPlayerFraction(player));
              menu.selector(player, "Выберите ранг", ["~r~Отмена", ...fractionranks], true).then(rank => {
                if (!rank) return mainMenu(player)
                user.set(player, 'rank', rank);
                player.notify(`~g~Успешно`);
                user.updateClientCache(player);
                user.saveAccount(player)
                return mainMenu(player)
              })
            }
          })
        }
        if (RAGE_BETA && user.isAdminNow(player, 6)) {
          submenu.newItem({
            name: "NPC",
            onpress: () => {
              let submenu2 = menu.new(player, "NPC", "Действия")
              submenu2.onclose = () =>  {mainMenu(player);}
              submenu2.newItem({
                name: "Спавн NPC",
                type: "list",
                list: ["Динамический", "Статический"],
                onpress: (item) => {
                  if (item.listSelected == 0) {
                    npc.createPed(player.position, player.heading, 'ig_fbisuit_01')
                  }
                  if (item.listSelected == 1) {
                    npc.createPed(player.position, player.heading, 'ig_fbisuit_01', true)
                  }
                }
              })
              submenu2.newItem({
                name: "Спавн водителя в ближайший ТС",
                onpress: (item) => {
                  let veh = user.getNearestVehicle(player, 5);
                  if (!veh) return player.notify("ТС не обнаружен");
                  let ped = npc.createPed(player.position, player.heading, 'ig_fbisuit_01')
                  setTimeout(() => {
                    npc.putIntoVehicle(ped, veh, -1, 5000, 2.0, 1)
                  }, 1000)
                }
              })
              submenu2.newItem({
                name: "Создать таксиста",
                onpress: (item) => {
                  let veh = vehicles.spawnCar(player.position, 0, 'taxi', "TEST")
                  if (!veh) return player.notify("ТС не обнаружен");
                  let dynamicPed = mp.peds.new(mp.joaat('player_zero'), player.position, { dynamic: true });
                  dynamicPed.controller = player;
                  vehicles.setFuelFull(veh)
                  vehicles.engineStatus(player, veh, true);
                  setTimeout(() => {
                    dynamicPed.putIntoVehicle(veh, -1, 5000, 1.0, 1)
                    player.putIntoVehicle(veh, 2)
                    setTimeout(() => {
                      dynamicPed.driveWaypoint(2568.86, 6177.29, 163.86)
                    }, 10000)
                  }, 15000)
                }
              })
              submenu2.newItem({
                name: "Удалить ближайшего педа",
                onpress: (item) => {
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Пед не обнаружен");
                  ped.destroy();
                }
              })
              submenu2.newItem({
                name: "Заставить ехать педа по точке навигации",
                onpress: (item) => {
                  if (!player.waypoint) return player.notify('~r~Мы не нашли точку навигации');
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Пед не обнаружен");
                  npc.driveWaypoint(ped, player.waypoint.x, player.waypoint.y, 0)
                }
              })
              submenu2.newItem({
                name: "Остановить действие педа",
                onpress: () => {
                  if (!player.waypoint) return player.notify('~r~Мы не нашли точку навигации');
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Пед не обнаружен");
                  npc.clearTask(ped)
                }
              })
              submenu2.newItem({
                name: "Остановить действие педа немедленно",
                onpress: () => {
                  if (!player.waypoint) return player.notify('~r~Мы не нашли точку навигации');
                  let ped = user.getNearestPed(player, 10);
                  if (!ped) return player.notify("Пед не обнаружен");
                  npc.clearTask(ped, true);
                }
              })
              submenu2.open();
            }
          })
          
        }
        submenu.newItem({
          name: "Сменить погоду",
          onpress: (item) => {
            weather.nextRandomWeather();
            player.notify('~g~Готово')
          }
        })
        submenu.open();
      }
    })
    
  }
  if(user.isAdmin(player)){
    m.newItem({
      name: "Ответить на жалобу",
      onpress: () => {
        menu.input(player, "Введите ID").then((ids) => {
          if (!ids) return;
          let id = methods.parseInt(ids);
          let target = user.getPlayerById(id);
          if (!target) return player.notify("Игрок не обнаружен");
          menu.input(player, "Введите ответ").then(text => {
            if (!text) return player.notify("~r~Отмена")
            player.notify("~g~Ответ отправлен");
            mp.events.call("server:sendAnswerReport", player, id, text);
          })
        })
      }
    })
    if (!user.isAdminNow(player)) {
      m.newItem({
        name: "~g~Включить ~y~Админ-мод",
        onpress: () => {
          player.setVariable('enableAdmin', true);
          player.notify("~r~Админ-мод включён");
          user.log(player, "AdminJob", "Включил админку")
          mainMenu(player)
        }
      })
      if(user.getAdminLevel(player) >= 5){
        if (!player.getVariable('enableAdminHidden')){
          m.newItem({
            name: "~g~Включить скрытный ~y~Админ-мод",
            desc: "Никто кроме админов 5+ LVL не будет видеть что у вас включена админка",
            onpress: () => {
              player.setVariable('enableAdminHidden', true);
              setTimeout(() => {
                if(!mp.players.exists(player)) return;
                player.setVariable('enableAdmin', true);
                mainMenu(player)
              }, 500)
              player.notify("~r~Админ-мод включён в скрытном режиме");
              user.log(player, "AdminJob", "Включил админку в скрытном режиме")
            }
          })
        }
      }
    } else {
      if (user.getAdminLevel(player) >= 5) {
        if (!player.getVariable('enableAdminHidden')) {
          m.newItem({
            name: "~g~Включить скрытный ~y~Админ-мод",
            desc: "Никто кроме админов 5+ LVL не будет видеть что у вас включена админка",
            onpress: () => {
              player.setVariable('enableAdminHidden', true);
              player.notify("~r~Админ-мод переключён в скрытный режим");
              user.log(player, "AdminJob", "Переключил админку в скрытный режим")
              mainMenu(player)
            }
          })
        } else {
          m.newItem({
            name: "~r~Выключить скрытный режим ~y~Админ-мод",
            desc: "Админка останется, однако скрытный режим пропадёт",
            onpress: () => {
              player.setVariable('enableAdminHidden', false);
              player.notify("~r~Админ-мод включён");
              user.log(player, "AdminJob", "Выключил скрытный режим админки оставив админку включённой")
              mainMenu(player)
            }
          })
        }
      }
      m.newItem({
        name: "Вылечить игроков в радиусе возле себя",
        onpress: () => {
          user.accept(player, "Вы уверены?").then(status=>{
            mainMenu(player)
            if(!status) return;
            mp.players.toArray().filter(target => target.dist(player.position) < 50).map(target => {
              user.fullHeal(target, false);
            })
            user.log(player, "AdminJob", "Вылечил всех игроков в радиусе")
          })
        }
      })
      if(user.isAdminNow(player, 5)){
        m.newItem({
          name: "Блокировка на телепортацию",
          more: player.teleportBlock ? "~g~Активна" : "~r~Не активна",
          onpress: () => {
            player.teleportBlock = !player.teleportBlock;
            player.notify('~g~Статус изменён');
            mainMenu(player)
          }
        })
      }
      m.newItem({
        name: "~r~Удалить ТС в радиусе",
        onpress: () => {
          user.accept(player, "Вы уверены?").then(status=>{
            if(!status) return mainMenu(player);
            menu.input(player, "Введите расстояние", "10", 3, "int").then((dist) => {
              if (!dist) return mainMenu(player);
              if(isNaN(dist) || dist < 0) return player.notify(`~r~Радиус указан не верно`)
              if(dist > 50) return player.notify(`~r~Указанный радиус слишком большой`)
              mp.vehicles.toArray().filter(veh => veh.dimension == player.dimension && player.dist(veh.position) < dist).map(veh => {
                veh.destroy();
              })
              player.notify('~g~Успешно')
              user.log(player, "AdminJob", "Удалил все ТС в радиусе "+dist+"m")
            });
          })
        }
      })
      
      m.newItem({
        name: "Уведомление от нового античита",
        more: player.registerAnticheat ? "~g~Включено" : "~r~Отключено",
        onpress: () => {
          player.registerAnticheat = !player.registerAnticheat;
          player.notify('~g~Статус изменён')
          mainMenu(player);
        }
      })
      m.newItem({
        name: "Уведомление о регистрациях",
        more: player.registerAlert ? "~g~Включено" : "~r~Отключено",
        onpress: () => {
          player.registerAlert = !player.registerAlert;
          player.notify('~g~Статус изменён')
          mainMenu(player);
        }
      })
      if(user.isCuff(player)){
        m.newItem({
          name: "Снять с себя наручники",
          onpress: () => {
            user.unCuff(player)
            mainMenu(player)
          }
        })
      }
      m.newItem({
        name: "Действия над игроком",
        onpress: () => {
          menu.input(player, "Введите ID").then((ids) => {
            if (!ids) return;
            let id = methods.parseInt(ids);
            user.checkIdUser(id).then(async fnd => {
              if (fnd == -1) return player.notify("Игрок не обнаружен");
              let target = user.getPlayerById(id);
              let name = target ? user.getRpName(target) : (await userEntity.findOne({where:{id:id}})).rp_name;
              workUser(player, id, name, fnd);
            })
          })
        }
      })
      m.newItem({
        name: "Транспорт",
        onpress: () => vehMenu(player)
      })
      m.newItem({
        name: "Инвиз",
        more: player.alpha == 0 ? "~g~Включен" : "~r~Выключен",
        onpress: () => {
          player.alpha = player.alpha == 0 ? 255 : 0
          player.notify("Инвиз " + player.alpha ? "~g~Включен" : "~r~Выключен");
        }
      })
      m.newItem({
        name: "GodMode",
        onpress: () => {
          player.call("godmode:switch");
          user.log(player, "AdminJob", "Переключил режим GodMode")
        }
      })
      m.newItem({
        name: "Объявление",
        onpress: () => {
          menu.input(player, "Введите заголовок").then(title => {
            if (!title) return;
            menu.input(player, "Введите текст").then(text => {
              if (!text) return;
              methods.saveLog('AdminNotify', `${user.getRpName(player)} - ${title} | ${text}`);
              methods.notifyWithPictureToAll(title, 'Администрация', text, 'CHAR_ACTING_UP');
              user.log(player, "AdminJob", "Подал объявление: " + title + "\n" + text)
            })
          })
        }
      })
      m.newItem({
        name: "Прогрузка ID",
        desc: "15 по умолчанию",
        onpress: () => {
          menu.input(player, "Введите новое расстояние").then((ids) => {
            player.call("client:distId", [ids]);
            player.notify("Параметр изменён");
          })
        }
      })
      m.newItem({
        name: "Поиск убийц рядом",
        desc: "30 по умолчанию",
        onpress: () => {
          menu.input(player, "Введите расстояние", "30", 3, "int").then((dist) => {
            if (!dist) return;
            let list = [...killers.filter(itm => methods.distanceToPos(player.position, itm.pos) <= dist || methods.distanceToPos(player.position, itm.target_pos) <= dist)].reverse()
            let submenu = menu.new(player, "Список убийств", "Радиус: " + dist + " | Время: " + KILL_SAVE_TIME_MIN+" минут");
            submenu.onclose = () => { mainMenu(player) };
            list.map(itm => {
              submenu.newItem({
                name: `[${itm.user}] (${itm.reason})`,
                more: `Цель: ${itm.target}`,
                onpress: () => {
                  workUser(player, itm.user)
                }
              })
            })

            submenu.open()
          })
        }
      })
      if(user.isAdmin(player, 4)){
        m.newItem({
          name: "Отрисовка текста в мире",
          desc: "Создание табличек на карте",
          onpress: () => {
            const q = () => {
              let submenu = menu.new(player, "Список созданых табличек");
              submenu.onclose = () => { mainMenu(player)}
              submenu.newItem({
                name: `~g~Добавить на мою позицию`,
                onpress: () => {
                  menu.input(player, "Введите текст", "", 120).then(value => {
                    if(!value) return q();
                    admin_labels.push({user:user.getId(player), label: mp.labels.new(value, player.position, {
                      dimension: player.dimension,
                      drawDistance: 10,
                      los: true
                    })})
                    player.notify('~g~Табличка создана');
                    q();
                  })
                }
              })
              admin_labels.map((item, index) => {
                if(!mp.labels.exists(item.label)) return admin_labels.splice(index, 1);
                submenu.newItem({
                  name: `${item.label.text} [USER: ${item.user}]`,
                  more: `${methods.distanceToPos(player.position, item.label.position).toFixed(0)}m`,
                  desc: 'Измерение: '+item.label.dimension,
                  onpress: () => {
                    let submenu3 = menu.new(player, "Действия");
                    submenu3.newItem({
                      name: "Телепортироватся",
                      onpress: () => {
                        if (!mp.labels.exists(item.label)){
                          admin_labels.splice(index, 1);
                          player.notify('~r~Табличка пропала');
                          q();
                          return;
                        }
                        user.teleportVeh(player, item.label.position.x, item.label.position.y, item.label.position.z);
                      }
                    })
                    submenu3.newItem({
                      name: "~r~Удалить",
                      onpress: () => {
                        if (!mp.labels.exists(item.label)){
                          admin_labels.splice(index, 1);
                          player.notify('~r~Табличка пропала');
                          q();
                          return;
                        }
                        user.accept(player, "Вы уверены?").then(status => {
                          if(!status) return q();
                          if (!mp.labels.exists(item.label)) {
                            admin_labels.splice(index, 1);
                            player.notify('~r~Табличка пропала');
                            q();
                            return;
                          }
                          item.label.destroy();
                          admin_labels.splice(index, 1);
                          player.notify('~r~Табличка удалена');
                          q();
                        })
                      }
                    })
                    submenu3.open();
                  }
                })
              })
              submenu.open();
            }
            q();
          }
        })
      }
      m.newItem({
        name: "Отладочные данные",
        onpress: () => debugData(player)
      })
      m.newItem({
        name: "~o~Игровые данные",
        onpress: () => gameData(player)
      })
      if (user.getAdminLevel(player) == 6) {
        m.newItem({
          name: "~r~Выдать всем PayDay",
          onpress: () => {
            user.accept(player, "Вы уверены?").then(status => {
              mainMenu(player)
              if (!status) return;
              player.notify(`~g~PayDay выдан всем`)
              mp.players.forEach(nplayer => {
                user.payDay(nplayer);
              })
              user.log(player, "AdminJob", "Выдал всем PayDay")
            })
          }
        })
        m.newItem({
          name: "~o~Промокоды",
          onpress: () => {
            let submenu = menu.new(player, "Промокоды")
            submenu.newItem({
              name: "~o~Статистика промокода (Медиа)",
              onpress: () => {
                menu.input(player, "Введите промокод").then(promo => {
                  if (!promo) return;
                  userEntity.count({ where: { promocode: promo } }).then(count => {
                    player.notify("Количество активаций: " + count)
                    submenu.open();
                  })
                })
              }
            })
            submenu.newItem({
              name: "~o~Статистика промокода (Обычного)",
              onpress: () => {
                menu.input(player, "Введите промокод").then(promo => {
                  if (!promo) return;
                  promocodeUsingEntity.count({ where: { promocode_name: promo } }).then(count => {
                    player.notify("Количество активаций: " + count)
                    submenu.open();
                  })
                })
              }
            })
            
            submenu.newItem({
              name: "~g~Создать ивентовый промокод",
              onpress: () => {
                let submenu2 = menu.new(player, "Настройки");
                let range = 1;
                let los = true;
                let sum = 1000;
                submenu2.newItem({
                  name: "Дистанция прорисовки",
                  type: "range",
                  rangeselect: [1, 100],
                  onchange: (val) => {
                    range = val+1;
                  }
                })
                submenu2.newItem({
                  name: "Видно ли за стенкой?",
                  type: "list",
                  list: ["~g~Не видно", "~g~Видно"],
                  onchange: (val) => {
                    los = !!val;
                  }
                })
                submenu2.newItem({
                  name: "Сумма в тысячах",
                  type: "range",
                  rangeselect: [1, 100],
                  onchange: (val) => {
                    sum = (val + 1)*1000;
                  }
                })
                submenu2.newItem({
                  name: "~g~Запустить",
                  onpress: () => {
                    createTempPromocode(player, sum, range, los)
                    player.notify('Ивентовый промокод создан')
                    mainMenu(player);
                  }
                })
                submenu2.newItem({
                  name: "~r~Отмена",
                  onpress: () => {
                    mainMenu(player)
                  }
                })
                submenu2.open();
              }
            })
            submenu.newItem({
              name: "Список ивентовых промокодов",
              onpress: () => {
                let submenu2 = menu.new(player, "Ивентовые промокоды", "Список");
                tempPromocodes.forEach((item,code) => {
                  submenu2.newItem({
                    name: code,
                    more: `$${methods.numberFormat(item.sum)} | ${player.dist(item.label.position).toFixed(0)}m`,
                    onpress: () => {
                      let submenuit = menu.new(player, "Действия", `${code} $${methods.numberFormat(item.sum)}`);
                      submenuit.newItem({
                        name: "Телепортация",
                        onpress: () => {
                          if (!mp.labels.exists(item.label) || !tempPromocodes.has(code)) return player.notify(`~r~Промокод уже не существует`), mainMenu(player);
                          user.teleport(player, item.label.position.x, item.label.position.y, item.label.position.z, null, item.label.dimension)
                        }
                      })
                      submenuit.newItem({
                        name: "~r~Удалить",
                        onpress: () => {
                          if (!mp.labels.exists(item.label) || !tempPromocodes.has(code)) return player.notify(`~r~Промокод уже не существует`), mainMenu(player);
                          item.label.destroy();
                          tempPromocodes.delete(code);
                          player.notify('~g~Промокод удалён');
                          mainMenu(player);
                        }
                      })

                      submenuit.open();
                    }
                  })
                })
                submenu2.open();
              }
            })

            submenu.newItem({
              name: "~g~Создать",
              onpress: () => {
                menu.input(player, "Введите название промокода").then(promo => {
                  if (!promo) return submenu.open();
                  
                  promocodeEntity.count({ where: { code: promo } }).then(count => {
                    if(count > 0) return player.notify("~r~Данный промокод уже создан и активен");
                    promocodeUsingEntity.count({ where: { promocode_name: promo } }).then(count2 => {
                      if(count2 > 0) return player.notify("~r~Данный промокод уже был кем то введён");
                      menu.input(player, "Введите сумму бонуса", "", 6, "int").then(sum => {
                        if (isNaN(sum) || sum <= 0) return player.notify("~r~Указанная сумма введена не верно")
                        promocodeEntity.create({
                          code: promo,
                          bonus: sum
                        }).then(() => {
                          player.notify('~g~Промокод создан')
                          mainMenu(player);
                        })
                      });
                    })
                  })
                })
              }
            })
            submenu.newItem({
              name: "~b~Список промокодов",
              onpress: () => {
                const l = () => {
                  promocodeEntity.findAll().then(list => {
                    let submenu2 = menu.new(player, "Список промокодов")
                    submenu2.onclose = () => {mainMenu(player);}
                    list.map(item => {
                      submenu2.newItem({
                        name: item.code,
                        more: item.bonus+"$",
                        onpress: () => {
                          let submenu3 = menu.new(player, "Действие")
                          submenu3.newItem({
                            name: "Количество активаций",
                            onpress: () => {
                              promocodeUsingEntity.count({ where: { promocode_name: item.code } }).then(count => {
                                player.notify("Количество активаций: " + count)
                              })
                            }
                          })
                          submenu3.newItem({
                            name: "~r~Удалить промокод",
                            onpress: () => {
                              user.accept(player, "Вы уверены?").then(status => {
                                if (!status) return submenu3.open();
                                promocodeEntity.destroy({ where: { id: item.id}}).then(() => {
                                  player.notify('~g~Промокод удалён')
                                  l();
                                })
                              })
                            }
                          })
                          submenu3.open();
                        }
                      })
                    })
                    submenu2.open();
                  })
                }
                l();
              }
            })
            submenu.open();
          }
        })
        
      }
      if (user.getAdminLevel(player) >= 5) {
        m.newItem({
          name: "~r~Занести игрока в BlackList",
          desc: "",
          onpress: () => {
            menu.input(player, "Введите ID учётной записи", "", 11, "int").then(ids => {
              if (!ids) return;
              let id = methods.parseInt(ids);
              if (isNaN(id) || id < 0) return player.notify("~r~ID указан не верно");
              user.checkIdUser(id).then(rank => {
                if (rank == -1) return player.notify("~r~ID не обнаружен");
                if (rank == 6) return player.notify("~r~Вы не можете занести данного человека в BlackList");
                userEntity.findOne({ where: { id: id } }).then(usr => {
                  const lic = usr.lic;
                  const guid = usr.name;
                  const rgscId = usr.rgscid;
                  blackListEntity.findOne({ where: { lic, guid } }).then(q => {
                    if (q) return player.notify("~r~Пользователь уже занесён в BlackList")
                    menu.input(player, "Введите причину", "", 150, "textarea").then(reason => {
                      if (!reason) return player.notify("~r~Необходимо ввести причину");
                      user.accept(player, "Вы уверены?").then(status => {
                        if (!status) return;
                        const target = user.getPlayerById(id);
                        blackListEntity.create({
                          lic: usr.lic,
                          reason: `${reason} [Занёс ${user.getRpName(player)} (${user.getId(player)})]`,
                          guid: usr.name,
                          rgscId: target ? target.clientSocial : rgscId ? rgscId : 0
                        }).then(() => {
                          player.notify("~g~Пользователь занесён в BlackList")
                          methods.saveLog("addBlackList", user.getId(player) + " занёс в BlackList " + id + " " + guid + " " + lic)
                          user.log(player, "AdminJob", "Занёс в BlackList @user" + id + " " + guid + " " + lic)
                        })

                      })
                    })
                  })
                });
              })
            });
          }
        })
        m.newItem({
          name: "~y~Убрать игрока из BlackList",
          desc: "",
          onpress: () => {
            menu.input(player, "Введите ID учётной записи", "", 11, "int").then(ids => {
              if (!ids) return;
              let id = methods.parseInt(ids);
              if (isNaN(id) || id < 0) return player.notify("~r~ID указан не верно");
              userEntity.findOne({ where: { id: id } }).then(usr => {
                if (!usr) return player.notify("~r~Игрок не обнаружен");
                const lic = usr.lic;
                const guid = usr.name;
                blackListEntity.findOne({
                  where: {
                    [Op.or]: [{ lic }, { guid }]
                  }
                }).then((itm) => {
                  if (!itm) return player.notify("~r~Пользователь не обнаружен в BlackList")
                  itm.destroy();
                  user.log(player, "AdminJob", "Удалил из BlackList @user" + id + " " + guid + " " + lic)
                  return player.notify("~r~Пользователь удалён из BlackList")
                })
              });
            });
          }
        })
      }
      if (methods.isTestServer() && user.isAdminNow(player, 6)) {
        m.newItem({
          name: "~g~Занести Social в доступ",
          desc: "",
          onpress: () => {
            menu.input(player, "Введите Social", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (whitelist.list.includes(social)) return player.notify("~r~Уже добавлен")
              else whitelist.new(player, social), player.notify("~g~Успешно добавлен")
            });
          }
        })
        m.newItem({
          name: "~r~Удалить Social из доступа",
          desc: "",
          onpress: () => {
            menu.input(player, "Введите Social", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (!whitelist.list.includes(social)) return player.notify("~r~Social не внесён")
              else whitelist.remove(social), player.notify("~g~Успешно удалён")
            });
          }
        })
      } else if (user.isAdmin(player, 5)) {
        m.newItem({
          name: "~g~Занести Social белый список BlackList",
          desc: "Игрок с таким Social сможет зайти всегда",
          onpress: () => {
            menu.input(player, "Введите Social", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (whitelist.list.includes(social)) return player.notify("~r~Уже добавлен")
              else whitelist.new(player, social), player.notify("~g~Успешно добавлен")
            });
          }
        })
        m.newItem({
          name: "~r~Удалить Social из белого списка BlackList",
          desc: "",
          onpress: () => {
            menu.input(player, "Введите Social", "", 30, "text").then(social => {
              if (!social) return;
              social = social.toLowerCase();
              if (!whitelist.list.includes(social)) return player.notify("~r~Social не внесён")
              else whitelist.remove(social), player.notify("~g~Успешно удалён")
            });
          }
        })
      }
      if (user.getAdminLevel(player) == 6) {
        m.newItem({
          name: "Socket.IO",
          onpress: () => {
            let submenu = menu.new(player, "Включение системы");
            submenu.workAnyTime = true;
            submenu.onclose = () => { mainMenu(player) }
            submenu.newItem({
              name: "Включить трети случайных игроков",
              onpress: () => {
                user.accept(player, "Вы уверены?").then(status => {
                  if (!status) return;
                  user.accept(player, "Вы точно уверены?").then(status2 => {
                    if (!status2) return;
                    let count = 0;
  
                    mp.players.forEach((target) => {
                      if (user.isLogin(target) && target.socket) {
                        count++
                      }
                    })
                    if (mp.players.length / 3 <= count) return player.notify("~r~Socket.IO уже включён у трети игроков")
                    mp.players.forEach((target) => {
                      if (user.isLogin(target) && !target.socket) {
                        socketInit(target)
                      }
                    })
  
                  })
                })
              }
            })
            submenu.newItem({
              name: "Включить у всех",
              onpress: () => {
                user.accept(player, "Вы уверены?").then(status => {
                  if (!status) return;
                  user.accept(player, "Вы точно уверены?").then(status2 => {
                    if (!status2) return;
                    mp.players.forEach((target) => {
                      if (user.isLogin(target) && !target.socket) {
                        socketInit(target)
                      }
                    })
                  })
                })
              }
            })
            submenu.newItem({
              name: "Включить админам",
              onpress: () => {
                user.accept(player, "Вы уверены?").then(status => {
                  if (!status) return;
                  user.accept(player, "Вы точно уверены?").then(status2 => {
                    if (!status2) return;
                    mp.players.forEach((target) => {
                      if (user.isAdminNow(target) && !target.socket) {
                        socketInit(target)
                      }
                    })
                  })
                })
  
              }
            })
            submenu.newItem({
              name: "Включить игроку по ID",
              onpress: () => {
                menu.input(player, "Введите ID игрока", "", 5, "int").then((id) => {
                  let target = user.getPlayerById(id);
                  if (!target) return player.notify("~r~Игрок не обнаружен");
                  if (target.socket) return player.notify("~r~Socket.IO уже включён у данного игрока");
                  socketInit(target);
                })
              }
            })
            submenu.open()
          }
        })
        m.newItem({
          name: "~b~Конфиг функций",
          more: "X2 и прочее",
          onpress: () => {
            customEnable(player)
          }
        })
        if (["XanderWP", "StrafeElite"].includes(player.socialClub))
        m.newItem({
          name: "~g~Смена пароля учётной записи",
          desc: "Введите новый пароль и перезапишите в БД",
          onpress: () => {
            menu.input(player, "Введите ID учётной записи", "", 11, "int").then(ids => {
              if(!ids) return;
              let id = methods.parseInt(ids);
              if(isNaN(id) || id < 0) return player.notify("~r~ID указан не верно");
              user.checkIdUser(id).then(rank => {
                if(rank == -1) return player.notify("~r~ID не обнаружен");
                if(rank == 6 && id != user.getId(player)) return player.notify("~r~Вы не можете менять пароль данной учётной записи");
                menu.input(player, "Введите новый пароль учётной записи", "", 150, "textarea").then(passwd => {
                  if(!passwd) return;
                  let pass = methods.sha256(String(passwd.replace(/"/g, "'")
                  .replace(/^\s\s*/, '')
                  .replace(/\s\s*$/, '')))
                  menu.input(player, "Скорпируйте пароль, если необходимо", pass, 150, "textarea").then(() => {
                    user.accept(player, "Сменить пароль?").then(status => {
                      if(status){
                        userEntity.update({
                          password: pass
                        }, {where: {
                          id: id
                        }, limit: 1}).then(() => {
                          player.notify("~g~Пароль перезаписан в базе данных")
                          user.log(player, "AdminJob", "Перезаписал пароль для @user" + id)
                        })
                      }
                    })
                  });
                });
              })
            });
          }
        })
        m.newItem({
          name: "~b~Включение систем",
          onpress: () => {
            systemEnable(player)
          }
        })
        
        m.newItem({
          name: "~r~Сборка проекта",
          desc: "Включить сборку исходников при авторестарте",
          more: restartConf.status ? 'Включено' : "Выключено",
          onpress: () => {
            restartConf.set(!restartConf.status)
            player.notify('Параметр ' + (restartConf.status ? 'Включён' : "Выключен"))
            mainMenu(player)
          }
        })
        if (methods.isTestServer()) {
          m.newItem({
            name: "~r~Заливка обновления",
            desc: "Выбрать что и как сделать",
            onpress: () => {
              let submenu = menu.new(player, "Выберите действие");
              submenu.onclose = () => { mainMenu(player) }
              let selectedStatus = {
                gitpull: 0,
                npmi: 0,
                client: 0,
                server: 0,
                web: 0,
                reboot: 0
              };
              submenu.newItem({
                name: "Загрузить с репозитория",
                type: "list",
                list: ["Не выполнить", "Выполнить"],
                onchange: (value) => selectedStatus.gitpull = value
              })
              submenu.newItem({
                name: "Выполнить установку NPM модулей",
                type: "list",
                list: ["Не выполнить", "Выполнить"],
                onchange: (value) => selectedStatus.npmi = value
              })
              submenu.newItem({
                name: "Выполнить билд клиента",
                type: "list",
                list: ["Не выполнить", "Выполнить"],
                onchange: (value) => selectedStatus.client = value
              })
              submenu.newItem({
                name: "Выполнить билд сервера",
                type: "list",
                list: ["Не выполнить", "Выполнить"],
                onchange: (value) => selectedStatus.server = value
              })
              submenu.newItem({
                name: "Выполнить билд интерфейсов",
                type: "list",
                list: ["Не выполнить", "Выполнить"],
                onchange: (value) => selectedStatus.web = value
              })
              submenu.newItem({
                name: "Перезагрузить сервер после выполнения всех действий",
                type: "list",
                list: ["Не выполнить", "Выполнить"],
                onchange: (value) => selectedStatus.reboot = value
              })
  
              submenu.newItem({
                name: "Выполнить выбранные действия",
                onpress: () => {
                  user.accept(player, "Вы уверены?").then(status => {
                    if (!status) return mainMenu(player);
                    if (runTestExec) return player.notify("~r~Уже выполняется команда")
                    let commands: string[] = [];
                    commands.push('cd /ragemp');
                    if (selectedStatus.gitpull) commands.push('git pull');
                    if (selectedStatus.npmi) commands.push('npm i');
                    if (selectedStatus.client) commands.push('npm run build:client');
                    if (selectedStatus.server) commands.push('npm run build:server');
                    if (selectedStatus.web) commands.push('npm run build:web');
                    if (selectedStatus.reboot) commands.push('pm2 restart ragemp');
                    commands.push('chmod +x ./server');
                    runTestExec = true;
                    player.notify(`~g~Команда отправлена на выполнение`)
                    if (selectedStatus.reboot) player.notify(`По результатам выполнения команды сервер перезагрузится`);
                    else player.notify("По результатам выполнения вы получите оповещение");
                    exec(`${commands.join(' && ')}`, () => {
                      if (mp.players.exists(player)) player.notify(`~g~Команда успешно выполнена`)
                      runTestExec = false;
                    });
                    mainMenu(player)
                  })
                }
              })
  
              submenu.open()
            }
          })
        }
      }
      if(user.isAdminNow(player, 5)){
        m.newItem({
          name: "~r~Перезагрузка сервера",
          desc: "Перезагрузка сервера с таймером",
          onpress: () => {
            rebootServer(player)
          }
        })
      }
  
      m.newItem({
        name: "~r~Выключить ~y~Админ-мод",
        onpress: () => {
          player.setVariable('enableAdmin', false);
          player.notify("~r~Админ-мод отключён");
          user.log(player, "AdminJob", "Выключил админку")
          mainMenu(player)
        }
      })
    }
  }
  

  m.open();
}







let restartTimer = 0;
let restartReason = "";

export const isRestarting = () => {
  return restartTimer > 0
}

export function restartProtocol(time:number, reason:string){
  restartTimer = time;
  restartReason = reason;
  let int:any = setInterval(() => {
    if(restartTimer == 0) return clearInterval(int);
    restartTimer--;
    if(restartTimer == 0){
      mp.players.forEach(function(p) {
        if (mp.players.exists(p)) p.lastSave = null;
      });
      methods.saveAll();
      setTimeout(() => {
        mp.players.forEach(function(p) {
          if (mp.players.exists(p)) user.kick(p, 'Перезагрузка сервера: '+restartReason);
        });
        setTimeout(() => {
          methods.restartServer();
        }, 10000);
      }, 5000);
      return;
    }
    mp.players.forEach(player  => {
      if(user.isLogin(player)){
        player.notify(`~r~Рестарт сервера через ${restartTimer} мин\n${(restartTimer % 5 == 0) ? `Причина - ${restartReason}` : ''}`);
      }
    })
  }, 60000)
}

function rebootServer(player:PlayerMp){
  if(!user.isAdminNow(player) || user.getAdminLevel(player) < 5) return;
    let m = menu.new(player, "Перезагрузка сервера", "Список")
    m.workAnyTime = true;
    m.onclose = () => {mainMenu(player);}
    let min:string[] = [];
    for(let q = 0; q < 120; q++) min.push(q.toString()+" мин");
    m.newItem({
      name: "Количество минут",
      type: "list",
      list: min,
      onpress: (item) => {
        if(restartTimer) return player.notify("Рестарт уже запущен")
        if(!item.listSelected) return;
          user.accept(player, "Вы уверены???").then(status => {
            if(status){
              user.accept(player, "Вы точно уверены???").then(status2 => {
                if(status2){
                  menu.input(player, "Укажите причину", "", 150, "textarea").then(reason => {
                    if(reason){
                      player.notify("Прична: "+reason)
                      user.accept(player, "Готовы???").then(status3 => {
                        if(status3){
                          restartProtocol((item.listSelected+1), reason)
                          user.log(player, "AdminJob", "Запустил процедуру рестарта сервера. Время: "+(item.listSelected+1)+" Причина: "+reason)
                        }
                      })
                    }
                  })
                }
              })
            }
          })
      }
    })
    m.newItem({
      name: "~r~Отмена",
      onpress: () => mainMenu(player)
    })
    m.open()
}

function systemEnable(player:PlayerMp){
  if(!user.isAdminNow(player) || user.getAdminLevel(player) < 6) return;
    let m = menu.new(player, "Включение систем", "Список")
    m.workAnyTime = true;
    m.onclose = () => {mainMenu(player);}
    for(let name in enabledSystem){
        m.newItem({
            name,
            more: enabledSystem[name] ? "~g~Включено" : "Выключено",
            onpress: () => {
                enabledSystem[name] = !enabledSystem[name];
                if(enabledSystem[name]) player.notify("~g~Включено")
                else player.notify("~r~Отключено")
            }
        })
    }
    m.open()
}

async function gangwarzone(player: PlayerMp, zone?: gangWarsZoneEntity) {
  let m = menu.new(player, "Настройка варзон", "Список")
  m.workAnyTime = true;
  m.onclose = () => { gameData(player); }
  if(!zone) zone = (await gangWarsZoneEntity.findAll()).find(item => methods.distanceToPos2D(player.position, item.position) <= item.position.d)
  if (zone){
    m.newItem({
      name: "~b~Текущая зона",
      more: zone.name,
      onpress: () => {
        let submenu = menu.new(player, zone.name, "Действия")
        submenu.workAnyTime = true;
        submenu.onclose = () => { gangwarzone(player, zone); }
        submenu.newItem({
          name: "ТП на зону",
          onpress: () => {
            user.teleport(player, zone.position.x, zone.position.y, zone.position.z)
          }
        })
        submenu.newItem({
          name: "Метка",
          onpress: () => {
            user.setWaypoint(player, zone.position.x, zone.position.y)
            player.notify('~g~Метка установлена')
          }
        })
        submenu.newItem({
          name: "~r~Удалить",
          onpress: () => {
            user.accept(player, "Удалить?").then(status => {
              if (!status) return submenu.open();
              zone.destroy().then(() => {
                reloadGangWarZones()
                player.notify(`~g~Зона удалена`);
                gangwarzone(player, zone);
              });
            })
          }
        })
        submenu.newItem({
          name: "~b~Переименовать",
          onpress: async () => {
            let name = await menu.input(player, "Название", zone.name);
            if (!name) return gangwarzone(player, zone);
            zone.name = name;
            zone.save().then(() => {
              player.notify('~g~Зона сохранена')
              gangwarzone(player, zone);
              reloadGangWarZones()
            });
          }
        })
        submenu.newItem({
          name: "Указать владельца",
          more: zone.owner ? fractionUtil.getFractionName(zone.owner) : "Никто",
          onpress: async () => {
            menu.selectFraction(player).then(id => {
              if (!id) return gangwarzone(player, zone);
              zone.owner = id;
              zone.save().then(() => {
                player.notify('~g~Зона сохранена')
                gangwarzone(player, zone);
                reloadGangWarZones()
              });
            })
          }
        })
        submenu.newItem({
          name: "Это респа?",
          more: zone.resp ? '~g~Да' : '~b~Нет',
          onpress: async () => {
            user.accept(player, "Сменить статус?").then(id => {
              if (!id) return gangwarzone(player, zone);
              zone.resp = zone.resp ? 0 : 1;
              zone.save().then(() => {
                player.notify('~g~Зона сохранена')
                gangwarzone(player, zone);
                reloadGangWarZones()
              });
            })
          }
        })
        submenu.open()
      }
    })
    m.newItem({
      name: "Новая зона",
      type: "list",
      list: ["Сверху", "Сверху справа", "Справа", "Справа снизу", "Снизу", "Слева снизу", "Слева", "Слева сверху"],
      onpress: async (item) => {
        let name = await menu.input(player, "Название");
        if (!name) return gangwarzone(player, zone);
        let newcoord = {...zone.position};
        if (item.listSelected == 0 || item.listSelected == 1 || item.listSelected == 7)
        newcoord.y+=(zone.position.d+1);
        else if (item.listSelected == 3 || item.listSelected == 4 || item.listSelected == 5)
        newcoord.y-=(zone.position.d+1);

        if (item.listSelected == 1 || item.listSelected == 2 || item.listSelected == 3)
        newcoord.x+=(zone.position.d+1);
        else if (item.listSelected == 5 || item.listSelected == 6 || item.listSelected == 7)
        newcoord.x-=(zone.position.d+1);

        let newcoordq = {
          x: newcoord.x,
          y: newcoord.y,
          z: newcoord.z,
          d: newcoord.d,
        }
        let zoneExist = (await gangWarsZoneEntity.findAll()).find(item => methods.distanceToPos2D(newcoord, item.position) <= item.position.d);
        if (zoneExist){
          player.notify(`~r~Рядом уже есть зона ${zoneExist.name}, и она пересекается с новой зоной, которую мы пытаемся создать.`)
          gangwarzone(player, zone)
          return;
        }
        gangWarsZoneEntity.create({
          owner: 0,
          name,
          position: newcoordq
        }).then(() => {
          reloadGangWarZones()
          player.notify('~g~Зона создана');
          gangwarzone(player, zone)
        })
      }
    })
  } else {
    m.newItem({
      name: "Новая зона на моих координатах",
      onpress: async () => {
        let name = await menu.input(player, "Название");
        if (!name) return gangwarzone(player, zone);
        let newcoord = { ...player.position, d: baseDzone };
        let newcoordq = {
          x: newcoord.x,
          y: newcoord.y,
          z: newcoord.z,
          d: newcoord.d,
        }
        let zoneExist = (await gangWarsZoneEntity.findAll()).find(item => methods.distanceToPos2D(newcoord, item.position) <= item.position.d);
        if (zoneExist) {
          player.notify(`~r~Рядом уже есть зона ${zoneExist.name}, и она пересекается с новой зоной, которую мы пытаемся создать.`)
          gangwarzone(player, zone)
          return;
        }
        gangWarsZoneEntity.create({
          owner: 0,
          name,
          position: newcoordq
        }).then(() => {
          reloadGangWarZones()
          player.notify('~g~Зона создана');
          gangwarzone(player, zone)
        })
      }
    })
  }
  let list = await gangWarsZoneEntity.findAll();
  m.newItem({
    name: "Список зон",
    more: `x${list.length}`,
    onpress: async () => {
      let submenu = menu.new(player, "Список зон")
      submenu.onclose = () => { gangwarzone(player, zone); }
      submenu.workAnyTime = true;
      list.map(item => {
        submenu.newItem({
          name: item.name,
          more: `В: ${item.owner ? fractionUtil.getFractionName(item.owner) : "Никто"} | Р: ${item.resp == 1 ? 'Да' : 'Нет'}`,
          onpress: () => {
            gangwarzone(player, item);
          }
        })
      })
      submenu.open()
    }
  })
  m.open();
}


function gameData(player:PlayerMp){
  if(!user.isAdminNow(player)) return;

    let m = menu.new(player, "Игровые данные", "Список")
    m.workAnyTime = true;
    m.onclose = () => {mainMenu(player);}
    if(user.getAdminLevel(player) >= 5){
      m.newItem({
        name: "~b~Дистанционный доступ к инвентарю",
        onpress: () => {
          menu.selector(player, "Выберите категорию", ["Игрок", "Машина по номер знаку", "Машина (ID инвентарь)"], true).then(cat => {
            if (typeof cat != "number") return gameData(player);
            menu.input(player, "Введите " + (cat == 0 ? "ID игрока" : "Номерной знак ТС")).then(ids => {
              if(!ids) return gameData(player);
              let id = cat == 0 ? methods.parseInt(ids) : cat == 1 ? methods.convertNumberToHash(ids) : methods.parseInt(ids);
              menu.close(player);
              inventory.openInventory(player, cat == 0 ? 1 : 8, id)
            })
          })
        }
      })
    }
    m.newItem({
      name: "~b~Настройка точек парковки",
      onpress: () => {
        spawnParkMenu(player)
      }
    })
    m.newItem({
      name: "~y~Настройка скоростей ТС",
      onpress: () => {
        vehicleSpeed(player)
      }
    })
    if(user.getAdminLevel(player) >= 6){
      m.newItem({
        name: "~y~Настройка варзон для банд",
        onpress: () => {
          gangwarzone(player)
        }
      })
      m.newItem({
        name: "~r~Редактор казны",
        onpress: () => {
          const ms = () => {

            let submenu = menu.new(player, "Казна")
            submenu.workAnyTime = true;
            submenu.onclose = () => {gameData(player)}
            submenu.newItem({
              name: "Баланс",
              more: coffer.getMoney()+"$"
            })
            submenu.newItem({
              name: "Положить средства",
              onpress: () => {
                menu.input(player, "Введите сумму", "", 6, "int").then(sum => {
                  if(sum == null) return ms();
                  if(sum <= 0){
                    player.notify(`~r~Сумма должна быть больше 0`)
                    return ms();
                  }
                  coffer.addMoney(sum);
                  user.log(player, "AdminJob", "Положил в казну "+sum)
                  player.notify("~g~Готово")
                  ms();
                })
              }
            })
            submenu.newItem({
              name: "Снять средства",
              onpress: () => {
                menu.input(player, "Введите сумму", "", 6, "int").then(sum => {
                  if(sum == null) return ms();
                  if(sum <= 0){
                    player.notify(`~r~Сумма должна быть больше 0`)
                    return ms();
                  }
                  user.log(player, "AdminJob", "Снял с каны "+sum)
                  coffer.removeMoney(sum);
                  player.notify("~g~Готово")
                  ms();
                })
              }
            })
  
            submenu.newItem({
              name: "Сумма пособия",
              more: coffer.getPosob(),
              onpress: () => {
                menu.input(player, "Введите сумму", coffer.getPosob().toString(), 8, "int").then(sum => {
                  if(sum == null) return ms();
                  if(sum <= 0){
                    player.notify(`~r~Сумма должна быть больше 0`)
                    return ms();
                  }
                  user.log(player, "AdminJob", "Установил сумму пособия "+sum)
                  coffer.setPosob(sum);
                  player.notify("~g~Готово")
                  ms();
                })
              }
            })
            submenu.newItem({
              name: "Сумма пенсии",
              more: coffer.getMoneyOld(),
              onpress: () => {
                menu.input(player, "Введите сумму", coffer.getMoneyOld().toString(), 8, "int").then(sum => {
                  if(sum == null) return ms();
                  if(sum <= 0){
                    player.notify(`~r~Сумма должна быть больше 0`)
                    return ms();
                  }
                  user.log(player, "AdminJob", "Установил сумму пенсии "+sum)
                  coffer.setMoneyOld(sum);
                  player.notify("~g~Готово")
                  ms();
                })
              }
            })
            submenu.newItem({
              name: "Налог",
              more: coffer.getNalog()+"%",
              onpress: () => {
                menu.input(player, "Введите сумму", coffer.getNalog().toString(), 6, "int").then(sum => {
                  if(sum == null) return ms();
                  if(sum <= 0 || sum >= 100){
                    player.notify(`~r~Сумма должна быть больше 0 и меньше 100`)
                    return ms();
                  }
                  user.log(player, "AdminJob", "Установил налог %"+sum)
                  coffer.setNalog(sum);
                  player.notify("~g~Готово")
                  ms();
                })
              }
            })
  
            submenu.open();
          }
          ms();
        }
      })
      m.newItem({
        name: "~r~Управление временем на сервере",
        onpress: () => {
          timeEdit(player)
        }
      })
      
      if(user.isAdminNow(player, 6)){
        m.newItem({
          name: "~b~Посчитать все предметы по item_id",
          onpress: () => {

              menu.input(player, "Введите его ID", "", 6, "int").then(async id => {
                if (typeof id != "number") return gameData(player);
                let itemscount: number = 0;
                itemsDB.forEach(item => {
                  if (item.item_id == id) {
                    itemscount++
                  }
                })
                player.notify('Количество ' + items.getItemNameById(id)+ ' -> '+itemscount)
              })
          }
        })
        m.newItem({
          name: "~r~Удалить все предметы по item_id",
          onpress: () => {
            user.accept(player, "Вы уверены что желаете это сделать?").then(status => {
              if (!status) return gameData(player);
              menu.input(player, "Введите его ID", "", 6, "int").then(async id => {
                if (typeof id != "number") return gameData(player);
                let itemname = items.getItemNameById(id);
                let check = await user.accept(player, "(1/5) Вы уверены что хотите удалить " + itemname + '?');
                if(!check) return gameData(player);
                check = await user.accept(player, "(2/5) Вы уверены что хотите удалить " + itemname + '?');
                if (!check) return gameData(player);
                check = await user.accept(player, "(3/5) Вы уверены что хотите удалить " + itemname + '?');
                if (!check) return gameData(player);
                check = await user.accept(player, "(4/5) Вы уверены что хотите удалить " + itemname + '?');
                if (!check) return gameData(player);
                check = await user.accept(player, "(5/5) Вы уверены что хотите удалить " + itemname + '?');
                if (!check) return gameData(player);
                let itemidsList:number[] = [];
                itemsDB.forEach(item => {
                  if (item.item_id == id){
                    itemidsList.push(item.id);
                    itemsDB.delete(item.id);
                  }
                })
                inventory.allInventoryBlocksDataClear()
                inventoryEntity.destroy({where: {
                  id: { [Op.in]: itemidsList}
                }})
              })
            })
          }
        })
      }
      m.newItem({
        name: "~b~Бизнесы",
        onpress: () => {
          let submenu = menu.new(player, "Бизнесы")
          submenu.workAnyTime = true;
          submenu.onclose = () => {gameData(player)}
          submenu.newItem({
            name: "~b~Добавить офис",
            onpress: () => {
              newBiz(player)
            }
          })
          submenu.newItem({
            name: "~b~Сменить прокачку бизнеса",
            onpress: () => {
              menu.input(player, "Введите ID бизнеса", "", 5, "int").then(id => {
                let biz = business.get(id, 'price_card2');
                if(biz == null){
                  player.notify("~r~ID указан не верно");
                  submenu.open();
                  return;
                }
                menu.selector(player, "Выберите прокачку", ["Стандарт" + ((biz == 0) ? " ~g~Выбрано" : ""), "ОПГ"+((biz == 3) ? " ~g~Выбрано" : ""), "ОПГ"+((biz == 4) ? " ~g~Выбрано" : "")], true).then(status => {
                  if(typeof status !== "number"){
                    player.notify("~r~Отмена");
                    submenu.open();
                    return;
                  }
                  let selected = 0;
                  if(status == 1) selected = 3;
                  if(status == 2) selected = 4;
                  let d = business.getData(id);
                  d.price_card2 = selected
                  d.save();
                  player.notify("~r~Статус успешно изменён");
                  user.log(player, "AdminJob", "Сменил прокачку бизнесу @business"+id+" на "+selected)
                  submenu.open();
                })
              })
            }
          })

          submenu.newItem({
            name: "~r~Удалить бизнес",
            onpress: () => {
              menu.input(player, "Введите ID бизнеса", "", 30, "int").then(id => {
                if (!id) return;
                businessEntity.count({ where: { id } }).then(count => {
                  if (count == 0) return player.notify("~r~Данного бизнеса не существует");
                  user.accept(player, "Вы уверены?", business.getName(id)).then(async accept => {
                    if (!accept) return gameData(player);
                    accept = await user.accept(player, "Вы точно уверены?");
                    if (!accept) return gameData(player);
                    accept = await user.accept(player, "Вы совсем уверены?");
                    if (!accept) return gameData(player);
                    accept = await user.accept(player, "Вы прям точно уверены?");
                    if (!accept) return gameData(player);
                    player.notify("~g~Бизнес удалён")

                    business.delete(id, player)
                    gameData(player);
                  })
                })
              })
            }
          })

          submenu.open();
        }
      })


      m.newItem({
        name: "Склады",
        onpress: () => {
          let submenu = menu.new(player, "Склады")
          submenu.workAnyTime = true;
          submenu.onclose = () => {gameData(player)}
          submenu.newItem({
            name: "~b~Добавить склад для офф организации",
            onpress: () => {
              user.accept(player, "Добавить там, где вы стоите?").then(status => {
                if (!status) return gameData(player);
                menu.input(player, "Введите название, например (Арсенал Армии)", "", 30).then(name => {
                  if (!name) return gameData(player);
                  menu.selectFraction(player).then(fra => {
                    if (!fractionUtil.getFraction(fra)) return player.notify(`~r~Отмена`), gameData(player)
                    const fraction = methods.parseInt(fra);
                    chest.create(player, name, fraction)
                    gameData(player)
                  });
                });
              })
            }
          })
          submenu.newItem({
            name: "~r~Перенести склад на мои координаты",
            onpress: () => {
              let submenu = menu.new(player, "Выберите склад", "Список")
              submenu.onclose = () => { gameData(player) };
              chest.pool.map(item => {
                submenu.newItem({
                  name: item.id + " | " + item.name,
                  more: item.settings.fraction + " | " + player.dist(item.position).toFixed(1) + "m.",
                  onpress: () => {
                    user.accept(player, "Вы уверены?").then(status => {
                      if (!status) return gameData(player)
                      item.position = new mp.Vector3(player.position.x, player.position.y, player.position.z - 1);
                      item.dimension = player.dimension;
                      item.save();
                      player.notify('~g~Склад перенесён');
                      return gameData(player);
                    })
                  }
                })
              })
              submenu.open()
            }
          })
          submenu.newItem({
            name: "~r~Перенести старые склады ГОС на новые",
            onpress: () => {
              user.accept(player, "Вы уверены?").then(status => {
                if (!status) return gameData(player);
                let targetChests = [...oldChestPool].filter(([_, item]) => fractionUtil.getFraction(item.fraction).gos).map(item => { return item[1] })
                if (targetChests.length == 0) return player.notify("~r~Старых складов нет"), gameData(player);
                targetChests.forEach(item => {
                  chest.create(player, item.name, item.fraction).then(q => {
                    q.settings.weight = item.maxWeight;
                    q.settings.locked = false;
                    q.settings.accessList = []
                    setTimeout(() => {
                      q.position = item.pos
                      q.dimension = item.dimension
                      q.save();
                    }, 1000)
                    const whatInside = [...item.items]
                    q.settings.accessList = whatInside.map(qw => {
                      return {
                        id: methods.parseInt(qw.model),
                        rank: qw.rank,
                        timer: qw.personLimit
                      }
                    });
                    setTimeout(async () => {
                      for (let ida in whatInside) {
                        let qw = whatInside[ida];
                        inventory.createManyItem(methods.parseInt(qw.model), 0, inventory.types.StockFraction, q.id, qw.amount)
                        if (mp.players.exists(player)) player.notify(`~g~Перенос предметов в ${q.name} завершён`)
                      }
                    }, 5000)
                    player.notify(`~g~Склад ${q.name} перенесён`)
                    item.delete()
                  })
                })
                player.notify(`~g~Перенос предметов будет в скором времени произведён`)
              })
            }
          })
          submenu.newItem({
            name: "~r~Перенести старые склады МАФИЙ на новые",
            onpress: () => {
              user.accept(player, "Вы уверены?").then(status => {
                if (!status) return gameData(player);
                let targetChests = [...oldChestPool].filter(([_, item]) => fractionUtil.getFraction(item.fraction).mafia).map(item => { return item[1] })
                if (targetChests.length == 0) return player.notify("~r~Старых складов нет"), gameData(player);
                targetChests.forEach(item => {
                  chest.create(player, item.name, item.fraction).then(q => {
                    q.settings.weight = item.maxWeight;
                    q.settings.locked = false;
                    q.settings.accessList = []
                    setTimeout(() => {
                      q.position = item.pos
                      q.dimension = item.dimension
                      q.save();
                    }, 1000)
                    const whatInside = [...item.items]
                    q.settings.accessList = whatInside.map(qw => {
                      return {
                        id: methods.parseInt(qw.model),
                        rank: qw.rank,
                        timer: qw.personLimit
                      }
                    });
                    setTimeout(async () => {
                      for (let ida in whatInside) {
                        let qw = whatInside[ida];
                        inventory.createManyItem(methods.parseInt(qw.model), 0, inventory.types.StockFraction, q.id, qw.amount)
                        if (mp.players.exists(player)) player.notify(`~g~Перенос предметов в ${q.name} завершён`)
                      }
                    }, 5000)
                    player.notify(`~g~Склад ${q.name} перенесён`)
                    item.delete()
                  })
                })
                player.notify(`~g~Перенос предметов будет в скором времени произведён`)
              })
            }
          })
          submenu.newItem({
            name: "~r~Перенести старые склады БАНД на новые",
            onpress: () => {
              user.accept(player, "Вы уверены?").then(status => {
                if (!status) return gameData(player);
                let targetChests = [...oldChestPool].filter(([_, item]) => fractionUtil.getFraction(item.fraction).gang).map(item => { return item[1] })
                if (targetChests.length == 0) return player.notify("~r~Старых складов нет"), gameData(player);
                targetChests.forEach(item => {
                  chest.create(player, item.name, item.fraction).then(q => {
                    q.settings.weight = item.maxWeight;
                    q.settings.locked = false;
                    q.settings.accessList = []
                    setTimeout(() => {
                      q.position = item.pos
                      q.dimension = item.dimension
                      q.save();
                    }, 1000)
                    const whatInside = [...item.items]
                    q.settings.accessList = whatInside.map(qw => {
                      return {
                        id: methods.parseInt(qw.model),
                        rank: qw.rank,
                        timer: qw.personLimit
                      }
                    });
                    setTimeout(async () => {
                      for (let ida in whatInside) {
                        let qw = whatInside[ida];
                        inventory.createManyItem(methods.parseInt(qw.model), 0, inventory.types.StockFraction, q.id, qw.amount)
                        if (mp.players.exists(player)) player.notify(`~g~Перенос предметов в ${q.name} завершён`)
                      }
                    }, 5000)
                    player.notify(`~g~Склад ${q.name} перенесён`)
                    item.delete()
                  })
                })
                player.notify(`~g~Перенос предметов будет в скором времени произведён`)
              })
            }
          })

          submenu.open();
        }
      })


      m.newItem({
        name: "Гаредероб",
        onpress: () => {
          let submenu = menu.new(player, "Гаредероб")
          submenu.workAnyTime = true;
          submenu.onclose = () => {gameData(player)}
          submenu.newItem({
            name: "~b~Добавить гардероб для офф организации",
            onpress: () => {
              user.accept(player, "Добавить там, где вы стоите?").then(status => {
                if (!status) return gameData(player);
                menu.selectFraction(player).then(fra => {
                  const fraction = methods.parseInt(fra);
                  if (isNaN(fraction) || fraction < 1 || fraction > 50) return player.notify("~r~ID фракции указан не верно"), gameData(player);
                  garderobEntity.create({
                    dresses: [],
                    fraction,
                    position: new mp.Vector3(player.position.x, player.position.y, player.position.z - 1),
                    dimension: player.dimension
                  }).then(item => {
                    new dressRoom(item.id, fraction, item.position, item.dresses, item.dimension)
                    player.notify("~g~Новый гардероб добавлен");
                    gameData(player);
                  })
                });
              })
            }
          })
          submenu.newItem({
            name: "~r~Перенести гардероб на мои координаты",
            onpress: () => {
              let submenu = menu.new(player, "Выберите гардероб", "Список")
              submenu.onclose = () => { gameData(player) };
              garderobPool.forEach(item => {
                submenu.newItem({
                  name: item.id + " | " + fractionUtil.getFractionName(item.fraction),
                  more: player.dist(item.position).toFixed(1) + "m.",
                  onpress: () => {
                    user.accept(player, "Вы уверены?").then(status => {
                      if (!status) return gameData(player)
                      item.position = new mp.Vector3(player.position.x, player.position.y, player.position.z - 1);
                      item.dimension = player.dimension;
                      item.save();
                      player.notify('~g~Сейф перенесён');
                      return gameData(player);
                    })
                  }
                })
              })
              submenu.open()
            }
          })

          submenu.open();
        }
      })


      m.newItem({
        name: "Гаражи",
        onpress: () => {
          let submenu = menu.new(player, "Гаражи")
          submenu.workAnyTime = true;
          submenu.onclose = () => {gameData(player)}
          submenu.newItem({
            name: "~b~Добавить гараж для офф организации",
            onpress: () => {
              user.accept(player, "Добавить там, где вы стоите?").then(status => {
                if (!status) return gameData(player);
                menu.selectFraction(player).then(fra => {
                  const fraction = methods.parseInt(fra);
                  if (isNaN(fraction) || fraction < 1 || fraction > 50) return player.notify("~r~ID фракции указан не верно"), gameData(player);
                  menu.input(player, "Префикс (Большая английская А, чтобы обычный номер)", "", 4).then(prefix => {
                    if (!prefix) return;
                    fractionGarage.createNew(fraction, new mp.Vector3(player.position.x, player.position.y, player.position.z - 1), prefix, player.dimension).then(garage => {
                      player.notify("~g~Гараж добавлен");
                      gameData(player);
                    })
                  });
                });
              })
            }
          })
          submenu.newItem({
            name: "~b~Добавить мой ТС в гараж для офф организации",
            onpress: () => {
              if (!player.vehicle) return player.notify("~r~Сядьте в тот ТС, который хотите добавить.")
              if (!player.vehicle.modelname) return player.notify("~r~Этот ТС нельзя добавить. Нужно заспавнить ТС через админку");
              const list: string[] = [];
              const listgarages: fractionGarage[] = [];
              fractionGarage.list().forEach(function (item) {
                list.push(item.fraction + " / " + methods.getFractionName(item.fraction) + " / " + methods.parseInt(methods.distanceToPos(player.position, item.position)) + "m");
                listgarages.push(item);
              })
              menu.selector(player, "Выберите гараж", list, true).then(s => {
                if (!player.vehicle) return player.notify("~r~Сядьте в тот ТС, который хотите добавить.")
                const garage = listgarages[s];
                if (typeof s != "number") return;
                const listamount: string[] = [];
                for (let i = 0; i < 101; i++) listamount.push(i.toString());
                menu.selector(player, "Укажите количество", listamount, true).then(async s2 => {
                  if (!s2) return;
                  const amount = s2;
                  let rank = 0;
                  const vehicle = player.vehicle;
                  if (!vehicle) return player.notify("~r~Вы покинули ТС");
                  if (garage.getVehicle(vehicle.modelname)) rank = garage.getVehicle(vehicle.modelname).rank;
                  else {
                    const listranks: string[] = [];
                    for (let i = 0; i < 15; i++) listranks.push(i.toString());
                    let ranks = await menu.selector(player, "Выберите ранг", listranks, true);
                    if (!ranks) return;
                    rank = ranks;
                  }
                  if (!player.vehicle) return player.notify("~r~Сядьте в тот ТС, который хотите добавить.")
                  const color1 = vehicle.getColor(0)
                  const color2 = vehicle.getColor(1)
                  garage.addVehicle(vehicle.modelname, vehicle.position, vehicle.rotation.z, vehicle.livery, rank, color1, color2, amount)
                  player.notify("~g~ТС добавлен");
                  gameData(player);
                })
              })
            }
          })

          submenu.open();
        }
      })


      m.newItem({
        name: "Сейф с деньгами",
        onpress: () => {
          let submenu = menu.new(player, "Сейф с деньгами")
          submenu.workAnyTime = true;
          submenu.onclose = () => {gameData(player)}
          submenu.newItem({
            name: "~b~Добавить сейф с деньгами для офф организации",
            onpress: () => {
              user.accept(player, "Добавить там, где вы стоите?").then(status => {
                if (!status) return gameData(player);
                menu.selectFraction(player).then(fra => {
                  const fraction = methods.parseInt(fra);
                  if (isNaN(fraction) || fraction < 1 || fraction > 50) return player.notify("~r~ID фракции указан не верно"), gameData(player);
                  moneyChestEntity.create({
                    money: 0,
                    fraction,
                    position: new mp.Vector3(player.position.x, player.position.y, player.position.z - 1),
                    dimension: player.dimension
                  }).then(item => {
                    new moneyChest(item.id, item.position, 0, fraction, [], player.dimension)
                    player.notify("~g~Новый сейф добавлен");
                    gameData(player);
                  })
                });
              })
            }
          })
          submenu.newItem({
            name: "~r~Перенести сейф на мои координаты",
            onpress: () => {
              let submenu = menu.new(player, "Выберите сейф", "Список")
              submenu.onclose = () => { gameData(player) };
              moneyChests.forEach(item => {
                submenu.newItem({
                  name: item.id + " | " + fractionUtil.getFractionName(item.fraction),
                  more: player.dist(item.position).toFixed(1) + "m.",
                  onpress: () => {
                    user.accept(player, "Вы уверены?").then(status => {
                      if (!status) return gameData(player)
                      item.position = new mp.Vector3(player.position.x, player.position.y, player.position.z - 1);
                      item.dimension = player.dimension;
                      item.save();
                      player.notify('~g~Сейф перенесён');
                      return gameData(player);
                    })
                  }
                })
              })
              submenu.open()
            }
          })

          submenu.open();
        }
      })
      
    }
    if(user.getAdminLevel(player) >= 5){
      m.newItem({
        name: "~r~Каталог ТС",
        onpress: () => {
          vehCatalog(player)
        }
      })
    }

    m.open()
}


async function vehicleSpeed(player:PlayerMp){
	if (!user.isAdminNow(player, 6)) return player.notify('~r~Доступно только для администрации');
  let m = menu.new(player, 'Настройка скоростей', 'Список');
  m.workAnyTime = true;
	
	m.newItem({
		name: 'Создать параметр',
		onpress: () => {
			if(!player.vehicle) return player.notify("~r~Сядьте в нужный ТС, заспавнив его через админку");
			const vehicle = player.vehicle
			const name = vehicle.modelname;
      if(!name) return player.notify("~r~Сядьте в нужный ТС, заспавнив его через админку");
      vehicle.blockboost = true;
			
      let msub = menu.new(player, 'Настройка скорости', 'Список');
      msub.workAnyTime = true;
      msub.onclose = () => {
        if(mp.vehicles.exists(vehicle))
        vehicle.blockboost = false;
      }
      msub.newItem({
        name: "Модель",
        more: name
      })
      let list: string[] = [];
      let listq: number[] = [];
      for(let q = 0; q < 60; q++) list.push("x"+((q/10).toFixed(1))), listq.push(q)
      let boost = 10;
      vehicle.setVariable("boost", methods.parseFloat(boost/10))
      msub.newItem({
        name: "Множитель скорости",
        type: "list",
        list,
        listSelected:listq.indexOf(boost),
        onchange: (value) => {
          if(player.vehicle != vehicle) return player.notify("~r~Вы покинули тот ТС, в котором начали настройку");
          boost = listq[value]
          vehicle.setVariable("boost", methods.parseFloat(boost/10))
        }
      })
      msub.newItem({
        name: "Сохранить",
        onpress: () => {
          if (!user.isAdminNow(player, 6)) return player.notify('~r~Сохранить может только администратор 6 уровня');
          if(player.vehicle != vehicle) return player.notify("~r~Вы покинули тот ТС, в котором начали настройку");
          vehicleBoosterEntity.findOne({where:{model:name}}).then(val => {
            if(!val){
              vehicleBoosterEntity.create({
                model:name,
                speed:methods.parseFloat(boost/10)
              }).then(() => {
                player.notify(`~r~Новая запись создана`);
                vehicles.reloadBoostList()
              })
              return
            }
            vehicleBoosterEntity.update({
              model:name,
              speed:methods.parseFloat(boost/10)
            }, {where:{id:val.id}}).then(() => {
              player.notify(`~r~Запись отредактирована`);
              vehicles.reloadBoostList()
            })
          })
        }
      })
      msub.open();
			
		}
  });
  
  let listitems = await vehicleBoosterEntity.findAll()

  listitems.forEach(items => {
    m.newItem({
      name: items.model,
      more: "x"+items.speed,
      onpress: () => {
        if (!user.isAdminNow(player, 6)) return player.notify('~r~Удалить может только администратор 6 уровня');
        user.accept(player, "Удалить?").then(status => {
          if(!status) return vehicleSpeed(player)
          items.destroy().then(() => {
            const hash = mp.joaat(items.model)
            mp.vehicles.forEach(veh => {
              if(veh.model == hash) veh.setVariable('boost', 0.0);
            })
            player.notify("~g~Запись удалена")
            vehicles.reloadBoostList()
          })
        })
      }
    })
  })
	
	m.open();
}


function debugData(player:PlayerMp){
  if(!user.isAdminNow(player)) return;
    let m = menu.new(player, "Данные для\nотладки", "Список")
    m.workAnyTime = true;
    m.onclose = () => {mainMenu(player);}
    if(user.isAdminNow(player, 6)){
      m.newItem({
        name: "~r~Серверная отладка",
        more: methods.debugEnable ? "~r~Включено" : "~g~Отключено",
        desc: "Включать исключительно по требованию разработчика",
        onpress: () => {
          methods.debugEnable = !methods.debugEnable;
          player.notify(`Серверная отладка ${methods.debugEnable ? "~r~Включена" : "~g~Отключена"}`);
          debugData(player);
        }
      })
      m.newItem({
        name: "~r~Sequelize отладка",
        more: methods.sequelizeEnable ? "~r~Включено" : "~g~Отключено",
        desc: "Включать исключительно по требованию разработчика",
        onpress: () => {
          methods.sequelizeEnable = !methods.sequelizeEnable;
          player.notify(`sequelizeEnable отладка ${methods.debugEnable ? "~r~Включена" : "~g~Отключена"}`);
          debugData(player);
        }
      })
      m.newItem({
        name: "~r~Интервальный хак",
        more: enabledHackTimeout() ? "~g~Включено" : "~r~Отключено",
        desc: "Трогать исключительно по требованию разработчика",
        onpress: () => {
          enableHackTimeout()
          debugData(player);
        }
      })
    }
    // m.newItem({
    //   name: "~b~Генератор зоны",
    //   type: "list",
    //   list: ["3 стороны", "4 стороны", "5 стороны", "6 сторон", "7 сторон", "8 сторон", "9 сторон"],
    //   desc: "Включать исключительно по требованию разработчика",
    //   onpress: (item) => {
    //     methods.debugEnable = !methods.debugEnable;
    //     player.notify(`Серверная отладка ${methods.debugEnable ? "~r~Включена" : "~g~Отключена"}`);
    //     debugData(player);
    //   }
    // })
    m.newItem({
      name: "Включить отладку",
      onpress: () => {
        menu.input(player, "ID игрока которому включаем отладку", user.getId(player).toString(), 20).then(uids => {
          if(!uids) return;
          const id = methods.parseInt(uids);
          if(isNaN(id) || id < 0) return player.notify("~r~ID введён не верно")
          let target = user.getPlayerById(id);
          if(!target) return player.notify("~r~Игрок не обнаружен")
          target.call('server:test', [RAGE_BETA]);
        });
      }
    })

    m.newItem({
      name: "Воспроизведение",
      type: "list",
      list: ["Анимация", "Сценарий", "Остановить"],
      onpress: (item) => {
        if(item.listSelected == 0){
          menu.input(player, "Категория", "", 300).then(dict => {
            if (!dict) return;
            menu.input(player, "Название", "", 300).then(anim => {
              if (!anim) return;
              let q = ["Всё тело", "Всё тело цикл", "Верх", "Верх цикл"];
              let q1 = [8, 9, 48, 49];
              menu.selector(player, "Флаг", q).then(res => {
                debugData(player);
                if (!res) user.stopAnimation(player)
                player.notify("Воспроизводим анимацию<br/>Категория: " + dict + "<br/>Название: " + anim + "<br/>Флаг: " + res + "(" + q1[q.indexOf(res)] + ")");
                user.playAnimation(player, dict, anim, (q1[q.indexOf(res)] as any))
              })
            });
          });
        } else if (item.listSelected == 1) {
          menu.input(player, "Категория", "", 300).then(dict => {
            if (!dict) return;
            debugData(player);
            if (!dict) user.stopAnimation(player)
            player.notify("Воспроизводим сценарий<br/>Категория: " + dict);
            user.playScenario(player, dict);
          });
        } else {
          user.stopAnimation(player)
          user.stopScenario(player)
        }
      }
    })
    m.newItem({
      name: "Координаты",
      type: "list",
      list: ["Объект", "Через запятую"],
      onpress: (item) => {
        if(item.listSelected == 0){
          let crd = player.vehicle ? `x:${player.vehicle.position.x.toFixed(2)},y:${player.vehicle.position.y.toFixed(2)},z:${player.vehicle.position.z.toFixed(2)},h:${player.vehicle.rotation.z.toFixed(2)}` : `x:${player.position.x.toFixed(2)},y:${player.position.y.toFixed(2)},z:${player.position.z.toFixed(2)},h:${player.heading.toFixed(2)}`;
          menu.input(player, "Скопируйте данные", crd, 300, "textarea");
        } else {
          let crd = player.vehicle ? `${player.vehicle.position.x.toFixed(2)}, ${player.vehicle.position.y.toFixed(2)}, ${player.vehicle.position.z.toFixed(2)}, ${player.vehicle.rotation.z.toFixed(2)}` : `${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)}, ${player.position.z.toFixed(2)}, ${player.heading.toFixed(2)}`;
          menu.input(player, "Скопируйте данные", crd, 300, "textarea");
        }
      }
    })
    m.newItem({
      name: "Рулетка",
      onpress: () => {
        player.call('server:rullet');
        user.accept(player, "Закрыть?").then(() => {
          player.call('server:rullet:stop');
          debugData(player);
        })
      }
    })
    m.newItem({
      name: "Конструктор",
      type: "list",
      list: ["Кастомизация", "Одежда", "Шляпы очки и т.д."],
      onpress: (item) => {
        if(item.listSelected == 0){
          user.generateCustomizationSettings(player, true);
        } else if (item.listSelected == 1) {
          dressConfig(player)
        } else {
          propConfig(player)
        }
      }
    })
    
    m.newItem({
      name: "Текущий интерьер",
      onpress: () => {
        mp.events.callClient(player, "admin:debug:interrior").then(intid => {

          menu.input(player, "Текущий инт", intid);
        })
      }
    })
    m.newItem({
      name: "Хеш модели",
      onpress: () => {
        menu.input(player, "Введите модель", "", 50, "text").then(model => {
          model = methods.model(model)
          menu.input(player, "Хеш модели", mp.joaat(model).toString(), 50, "text");
        });
      }
    })
    m.newItem({
      name: "Проверка валидности модели",
      onpress: () => {
        menu.input(player, "Введите модель", "", 50, "text").then(model => {
          model = methods.model(model)
          user.checkModel(player,model).then(status => {
            player.notify(status ? "~g~Модель валидна" : "~r~Модель не валидна")
          })
        });
      }
    })
    m.open()
}

function dressConfig(player:PlayerMp){
  if (!user.isAdminNow(player)) return;
  let m = menu.new(player, "Конструктор одежды", "Настройка");
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  m.newItem({
    name: "Выберите раздел",
    type: "list",
    list: ["Торс", "Ноги", "Обувь", "Аксессуары"],
    onpress: (qsss) => {
      let dressSectorId = 0;
      if (qsss.listSelectedName == "Ноги") dressSectorId = 4;
      if (qsss.listSelectedName == "Обувь") dressSectorId = 6;
      if (qsss.listSelectedName == "Аксессуары") dressSectorId = 7;
      if (qsss.listSelectedName == "Торс") dressSectorId = 11;
      // if (qsss.listSelectedName == "Маска") dressSectorId = 1;
      let config = [0, dressSectorId, 0, 0, -1, -1, -1, -1, 100, "Название", -1, 30] as clothItem
      user.emptyDressAndProps(player);
      const red = () => {

      }
      const upd = () => {
        let submenu = menu.new(player, "Настройка " + qsss.listSelectedName)
        submenu.onclose = () => { user.resetCustomization(player); dressConfig(player)}

        submenu.newItem({
          name: "Основная вариация",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[2],
          onchange: (itm) => {
            config[2] = itm
            player.setClothes(dressSectorId, config[2], config[3], 2)
            // user.setComponentVariation(player, dressSectorId, config[2], config[3]);
          }
        })
        submenu.newItem({
          name: "Основной цвет",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[3],
          onchange: (itm) => {
            config[3] = itm
            user.setComponentVariation(player, dressSectorId, config[2], config[3]);
          }
        })

        if (dressSectorId == 11){
          if (config[4] == -1) config[4] = 0;
          if (config[5] == -1) config[5] = 0;

          if (config[6] == -1) config[6] = 240;
          if (config[7] != 240) config[7]++;

          submenu.newItem({
            name: "Торс вариация",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[4],
            onchange: (itm) => {
              config[4] = itm
              user.setComponentVariation(player, 3, config[4], config[5]);
            }
          })
          submenu.newItem({
            name: "Торс цвет",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[5],
            onchange: (itm) => {
              config[5] = itm
              user.setComponentVariation(player, 3, config[4], config[5]);
            }
          })
          submenu.newItem({
            name: "Парашют вариация",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[6],
            onchange: (itm) => {
              config[6] = itm
              user.setComponentVariation(player, 8, config[6], config[7]);
            }
          })
          submenu.newItem({
            name: "Парашют цвет",
            type: "range",
            rangeselect: [0, 800],
            listSelected: config[7],
            onchange: (itm) => {
              config[7] = itm
              user.setComponentVariation(player, 8, config[6], config[7]);
            }
          })

        }

        submenu.newItem({
          name: "Скопировать настройки",
          onpress: () => {
            menu.input(player, "Передайте этот конфиг разработчику", JSON.stringify(config), 200).then(() => {
              upd();
            })

          }
        })
        submenu.newItem({
          name: "Название",
          desc: config[9],
          onpress: () => {
            menu.input(player, "Введите название одежды", config[9], 40).then(name => {
              if(name){
                config[9] = name
              }
              upd();
            })
          }
        })
        submenu.newItem({
          name: "Стоимость",
          more: config[8].toFixed(0) as string + "$",
          onpress: () => {
            menu.input(player, "Введите стоимость", config[8].toFixed(0), 6, "int").then(cost => {
              if(cost){
                if(isNaN(cost) || cost < 1 || cost > 100000000) return player.notify("~r~Стоимость указана не верно");
                config[8] = cost
              }
              upd();
            })
          }
        })
        submenu.newItem({
          name: "Термоустойчивость",
          more: `${config[10]}`,
          onpress: () => {
            menu.input(player, "Введите значение", `${config[10]}`, 6).then(val => {
              if (val) {
                let cost = methods.parseInt(val);
                if (isNaN(cost)) return player.notify("~r~Значение указано не верно");
                if (cost > 0) cost *= -1;
                config[10] = cost
              }
              upd();
            })
          }
        })

        submenu.newItem({
          name: "Тип магазина",
          type: "list",
          list: ["Discount store", "Suburban", "Ponsonbys", "Ammunation", "Binco"],
          listSelected: config[0],
          onchange: (itm) => {
            config[0] = itm
          }
        })
        

        submenu.open()
      }
      upd();
    }
  })
  m.open()
}

function propConfig(player:PlayerMp){
  if (!user.isAdminNow(player)) return;
  let m = menu.new(player, "Конструктор пропов", "Настройка");
  m.workAnyTime = true;
  m.onclose = () => { mainMenu(player); }
  m.newItem({
    name: "Выберите раздел",
    type: "list",
    list: ["Головные уборы", "Очки", "Серьги", "Левая рука", "Правая рука"],
    onpress: (qsss) => {
      let dressSectorId = 0;
      if (qsss.listSelectedName == "Головные уборы") dressSectorId = 0;
      if (qsss.listSelectedName == "Очки") dressSectorId = 1;
      if (qsss.listSelectedName == "Серьги") dressSectorId = 2;
      if (qsss.listSelectedName == "Левая рука") dressSectorId = 6;
      if (qsss.listSelectedName == "Правая рука") dressSectorId = 7;
      // if (qsss.listSelectedName == "Маска") dressSectorId = 1;
      let config = [0, dressSectorId, 0, 0, 10, "Название"] as propItem
      user.emptyDressAndProps(player);
      const red = () => {

      }
      const upd = () => {
        let submenu = menu.new(player, "Настройка " + qsss.listSelectedName)
        submenu.onclose = () => { user.resetCustomization(player); propConfig(player)}

        submenu.newItem({
          name: "Вариация",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[2],
          onchange: (itm) => {
            config[2] = itm
            user.setProp(player, dressSectorId, config[2], config[3])
          }
        })
        submenu.newItem({
          name: "Цвет",
          type: "range",
          rangeselect: [0, 800],
          listSelected: config[3],
          onchange: (itm) => {
            config[3] = itm
            user.setProp(player, dressSectorId, config[2], config[3])
          }
        })

        submenu.newItem({
          name: "Скопировать настройки",
          onpress: () => {
            menu.input(player, "Передайте этот конфиг разработчику", JSON.stringify(config), 200).then(() => {
              upd();
            })
          }
        })

        submenu.newItem({
          name: "Название",
          desc: config[5],
          onpress: () => {
            menu.input(player, "Введите название компонента", config[5], 40).then(name => {
              if (name) {
                config[5] = name
              }
              upd();
            })
          }
        })
        submenu.newItem({
          name: "Стоимость",
          more: config[4].toFixed(0) as string + "$",
          onpress: () => {
            menu.input(player, "Введите стоимость", config[4].toFixed(0), 6, "int").then(cost => {
              if (cost) {
                if (isNaN(cost) || cost < 1 || cost > 100000000) return player.notify("~r~Стоимость указана не верно");
                config[4] = cost
              }
              upd();
            })
          }
        })

        submenu.newItem({
          name: "Тип магазина",
          type: "list",
          list: ["Discount store", "Suburban", "Ponsonbys", "Ammunation", "Binco"],
          listSelected: config[0],
          onchange: (itm) => {
            config[0] = itm
          }
        })
        

        submenu.open()
      }
      upd();
    }
  })
  m.open()
}


function vehMenu(player:PlayerMp){
  if(!user.isAdminNow(player)) return;
  let m = menu.new(player, "Транспорт", "Действия");
  m.workAnyTime = true;
  m.onclose = () => {mainMenu(player);}
  m.newItem({
    name: "Очистить инвентарь ТС, в которой я",
    onpress: () => {
      user.accept(player, "Вы уверены?").then(status => {
        const veh = player.vehicle;
        if (!veh) return player.notify('~r~Вы не в ТС');
        if (!veh.admin) return player.notify('~r~ТС должен быть заспавнен администратором');
        mainMenu(player)
        if (!status) return;
        inventory.getItemListData(8, veh.numberPlate).map(item => {
          inventory.deleteItem(item.id)
        })
        user.log(player, "AdminJob", "Очистил инвентарь админ машины " + veh.modelname + " номер " + veh.numberPlate + ` @inventorytype8 @inventoryid${methods.convertNumberToHash(veh.numberPlate)}`)
      })
    }
  })
  m.newItem({
    name: "Спавн ТС",
    onpress: () => {
      menu.input(player, "Введите название ТС").then(model => {
        if(!model) return;
        let vehicle = vehicles.spawnCar(player.position, player.heading, model);
        vehicle.dimension = player.dimension;
        vehicle.admin = true;
        player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
      })
    }
  })
  m.newItem({name: "Припарковать ТС",onpress: () => {
    if (!player.vehicle) return player.notify('~r~Вы должны находится в транспорте');
    if (!player.vehicle.getVariable('container')) return player.notify(`~r~Данный ТС не принадлежит игроку`)
    const pos = player.vehicle.position;
    vehicles.park(player.vehicle.getVariable('container'), pos.x, pos.y, pos.z, player.vehicle.heading);
    player.notify('~b~Вы припарковали транспорт');
    user.log(player, "AdminJob", `Припарковал ТС игрока номер ${player.vehicle.getVariable('container')} на координаты X: ${pos.x.toFixed(0)}, Y: ${pos.y.toFixed(0)}, Z: ${pos.z.toFixed(0)}`)
  }})
  if(player.vehicle){
    m.newItem({
      name: "Отремонтировать ТС",
      onpress: () => {
        if(player.vehicle){
          player.vehicle.repair();
        }
      }
    })
    if(typeof player.vehicle.getVariable('fuel') == "number"){
      const vehInfo = methods.getVehicleInfo(player.vehicle.model);
      if (vehInfo.fuel_full > 1){
        m.newItem({
          name: "Топливо",
          more: player.vehicle.getVariable('fuel')+'л. / '+vehInfo.fuel_full,
          onpress: () => {
            if(player.vehicle){
              menu.input(player, "Введите количество топлива", player.vehicle.getVariable('fuel').toString()).then(fuel => {
                if(!fuel) return;
                if(!player.vehicle) return;
                const sfuel = methods.parseInt(fuel);
                if(isNaN(sfuel) || sfuel < 0 || sfuel > 100) return player.notify("~r~Количество указано не верно")
                player.vehicle.setVariable('fuel', sfuel);
                player.notify("~g~Успешно");
              });
            }
          }
        })
      }
    }
  }
  m.newItem({name: "Респавн ближайшего ТС",onpress: () => mp.events.call("server:respawnNearstVehicle", player)})
  m.newItem({name: "Удалить ближайший ТС",onpress: () => mp.events.call("server:deleteNearstVehicle", player)})
  m.newItem({name: "Перевернуть ближайший ТС",onpress: () => mp.events.call("server:flipNearstVehicle", player)})
  m.newItem({name: "Открыть/Закрыть ближайший ТС",onpress: () => {
    let veh = user.getNearestVehicle(player)
    if(!veh) return player.notify("~r~ТС не обнаружен");
    vehicles.lockStatus(player, veh)
  }})
  // m.newItem({
  //   name: "Цвет ТС",
  //   onpress: () => {
  //     menu.input(player, "Введите название ТС").then(model => {
  //       if(!model) return;
  //       let vehicle = vehicles.spawnCar(player.position, player.heading, model);
  //       vehicle.dimension = player.dimension;
  //       player.putIntoVehicle(vehicle, -1);
  //     })
  //   }
  // })
  m.open()
}
export const userPropertyEdit = async (player:PlayerMp,id:number) => {
  if(!user.isAdminNow(player, 6)) return;
  let target = user.getPlayerById(id);
  if(!target){
    return player.notify("~r~Игрок не обнаружен в сети")
  }
  let nick = user.getRpName(target);
  let m = menu.new(player, "Имущество ["+id+"]", "Список");
  m.workAnyTime = true;

  let data:{[x:string]:any} = {}

  data.business_id = user.get(target, 'business_id');
  data.cars = [];
  for(let id = 1; id < 9; id++) if (user.get(target, 'car_id'+id) > 0){
    if(vehicles.getBySlot(target, id))data.cars.push(user.get(target, 'car_id'+id))
  }
  data.apart = user.get(target, 'apartment_id');
  data.house = user.get(target, 'id_house');
  data.condo = user.get(target, 'condo_id');
  data.stock = user.get(target, 'stock_id');


  if(data.business_id){

    let owner = business.getOwnerInfo(data.business_id);
    if(owner.id != id){
      m.newItem({
        name: "Бизнес: #"+data.business_id,
        desc: "Владелец: "+owner.id,
        onpress: () => {
          menu.selector(player, "Действие", ["Сменить владельца", "Удалить из игрока с компенсацией"]).then(res => {
            if(!res) return userPropertyEdit(player, id);
            if(res == "Сменить владельца"){
              business.updateOwnerInfo(data.business_id, id, nick)
            } else {
              user.addMoney(player, business.getPrice(data.business_id)*1.1);
              user.set(target, 'business_id', 0)
            }
            userPropertyEdit(player, id);
          })
        }
      })
    }
  }
  if(data.cars){
    data.cars.forEach(async (car:number) => {
      let owner = await vehicles.getOwner(car);
      if(owner.id != id){
        let price = await vehicles.getPrice(car)
        m.newItem({
          name: "Машина: #"+car,
          desc: "Владелец: "+owner.id,
          onpress: () => {
            menu.selector(player, "Действие", ["Сменить владельца", "Удалить из игрока с компенсацией"]).then(res => {
              if(!res) return userPropertyEdit(player, id);
              if(res == "Сменить владельца"){
                vehicles.updateOwnerInfo(data.business_id, id, nick)
              } else {
                user.addMoney(player, price);
                for(let ids = 1; ids < 9; ids++) if (user.get(player, 'car_id'+ids) == car){
                  user.set(player, 'car_id'+ids, 0)
                }
              }
              userPropertyEdit(player, id);
            })
          }
        })
      }
    })
  }
  m.open()
}
