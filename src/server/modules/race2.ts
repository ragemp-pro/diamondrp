/// <reference path="../../declaration/server.ts" />

import { chat, enabledSystem } from "./chat"
import { user } from "../user"
import { methods } from "./methods"
// import { mysql } from "./mysql"
import { menu } from "./menu"
import { vehicles } from "../vehicles"
import { wait, randomArrayEl } from "../../util/methods"
import { coffer } from "../coffer"
import { RAGE_BETA } from "../../util/newrage"
import { raceCfgEntity } from "./entity/raceCfgEntity"
import { Sequelize } from "sequelize-typescript"

export {}

/** Выбор ставки */
let costBase:number[] = [];
for(let id = 500; id < 2000; id+=100) costBase.push(id);

/** Интервал в минутах между автоматическими запусками гонок */
let timerAuto = 120;

/** Позиция точки гоночных лобби */
let raceCheckPosition = new mp.Vector3(-265.9540710449219, -2021.696533203125, 29.145593643188477)

/** Включение быстрого таймера для теста */
let testSpeed = false;


/** Объект гоночной точки */
interface racePoint {
  /** Позиция по оси X */
  x:number;
  /** Позиция по оси Y */
  y:number;
  /** Позиция по оси Z */
  z:number;
  /** Радиус */
  r?:number;
  /** Направление */
  h:number;
}

setInterval(() => {
  if(!enabledSystem.race) return;
  getRandomRaceConfig().then(config => {
    generateRaceLobby(config, 15, randomArrayEl(costBase));
  })
}, timerAuto * 60000)

function getRacePoint(player:PlayerMp, size:number):racePoint{
  let res =  player.vehicle ? {
    ...player.vehicle.position,
    h: player.vehicle.heading,
    r: size
  } : {
    ...player.position,
    h: player.heading,
    r: size
  }
  res.z-=1;
  res.x = methods.parseFloat(res.x.toFixed(2))
  res.y = methods.parseFloat(res.y.toFixed(2))
  res.z = methods.parseFloat(res.z.toFixed(2))
  res.h = methods.parseFloat(res.h.toFixed(2))
  return res;
}

interface raceDataTempBase {
  /** ID в БД */
  id?:number;
  /** Название серии ТС */
  vehiclesSeries:string;
  /** Название гонки */
  name:string;
  /** Индикатор того, готова ли гонка к тому, тобы её запускать */
  ready:number;
}
interface raceData extends raceDataTempBase {
  /** Массив чекпоинтов */
  checkpoints:racePoint[];
  /** Массив спавнов */
  spawns:racePoint[];
  /** Размер маркера */
  size?: number;
}
interface raceDataDB extends raceDataTempBase {
  /** Массив чекпоинтов */
  checkpoints:string;
  /** Массив спавнов */
  spawns:string;
  /** Владелец трассы */
  user: number
}


let carSeries:{
  [name:string]:string[];
} = { 
 "Super": ["xa21", "autarch", "zentorno", "nero2", "visione", "t20"],
  "Super2": ["krieger", "emerus", "Vagner", "Thrax"],
  "Boats": ["dinghy", "jetmax", "speeder"],
  "Commercials": ["benson", "phantom", "packer", "mule"],
  "Compacts": ["blista", "brioso", "issi2", "panto", "rhapsody"],
  "Coupes": ["Zion", "Felon", "F620", "exemplar", "sentinel"],
  "Motorcycles": ["akuma", "hakuchou", "bati", "double", "carbonrs", "ruffian"],
  "Muscle": ["dominator3", "gauntlet4", "clique", "dominator", "impaler"],
  "Off-Road": ["trophytruck", "bifta", "brawler", "caracara2", "dune"],
  "SUVs": ["baller3", "huntley", "xls", "rocoto"],
  "Sportcars": ["italigto", "neo", "comet5", "paragon", "jugular"],
  "Sportcars2": ["massacro2", "neon", "schlagen", "drafter", "jester"],
  "Sportcars3": ["schafter3", "elegy", "jester3", "bestiagts", "elegy2", "sultanrs"],
}

let lobbyList:Map<number, RaceLobby> = new Map();

class RaceLobby {
  /** Уникальный ID лобби */
  readonly id:number;
  /** Гонщики */
  players: number[];
  /** Стадия лобби */
  stage: 
  /** Идёт регистрация */
  "waiting" | 
  /** Идёт выбор ТС */
  "selectCar" | 
  /** Идёт гонка */
  "race" | 
  /** Гонка полностью завершена */
  "ended";
  /** Стоимость участия */
  public readonly cost:number;
  checkpoints: racePoint[];
  spawns: racePoint[];
  /** Название гонки */
  name: string;
  /** Серия ТС */
  vehiclesSeries: string;
  /** Время до запуска */
  time: number;
  /** Количество кругов */
  laps: number;
  /** ТС, созданные для игроков */
  vehicles: Map<number, VehicleMp>;
  /** Список финишировавших */
  finished: PlayerMp[]
  /** Банк */
  bank: number;
  /** Информация по чекпоинтам 
   * key - UserID
   * value - CheckpointID
  */
  racersPosition: Map<number,number>;
  checkPlayersCount: boolean;
  timeStart: number;
  endtimer:boolean
  constructor(data:raceData, time:number, cost:number, checkPlayersCount = false){
    this.endtimer = false;
    this.checkPlayersCount = checkPlayersCount;
    this.finished = [];
    this.racersPosition = new Map();
    this.laps = methods.getRandomInt(2, 4)
    const dim = methods.newDimention();
    this.id = (dim);
    this.players = [];
    this.stage = "waiting";
    this.checkpoints = data.checkpoints;
    this.spawns = data.spawns;
    this.name = data.name;
    this.vehiclesSeries = data.vehiclesSeries;
    this.cost = cost;
    this.bank = 0;
    this.vehicles = new Map();
    lobbyList.set(this.id, this);
    if(!checkPlayersCount)chat.sendToAll('Система', `!{${chat.clBlue}} Зарегистрировано гоночное мероприятие !{${chat.clWhite}}${data.name}!{${chat.clBlue}}, Серия транспорта: !{${chat.clWhite}}${data.vehiclesSeries}!{${chat.clBlue}}. Начало через !{${chat.clWhite}}${time} мин!{${chat.clBlue}}. Лимит участников: !{${chat.clWhite}}${data.spawns.length}!{${chat.clBlue}} Ожидаем каждого у центра регистрации`, chat.clBlue), methods.setBlipAlert(blip, 120000);;
    this.time = time+1;
    setTimeout(() => {
      this.timerController();
    }, 1000);
    let int:number = setInterval(() => {
      if(this.stage == "ended"){
        if(lobbyList.has(this.id)) lobbyList.delete(this.id);
        return clearInterval(int);
      } else if(this.stage == "race") {
        if(this.finished.length >= this.players.length/2){
          this.endtimerFunc()
        }
      }
      this.checkPlayers();
    }, 15000)
  }


  /** Таймер отчёта запуска гоночного ивента */
  timerController(){
    this.checkPlayers();
    this.time--;
    this.players.forEach(targetid => {
      let target = mp.players.at(targetid)
      target.notify(this.time > 1 ? `До начала гонки осталось ${this.time} минут` : "Начало гонки через минуту")
    })
    if(this.time == 0){
      this.stage = "selectCar";
      this.selectCarLobby()
      setTimeout(() => {
        this.players.forEach((targetid) => {
          if(!this.vehicles.has(targetid)) this.kickPlayer(targetid, "Не успел выбрать ТС")
        })
        if(!testSpeed && this.players.length < 3 && !this.checkPlayersCount) return this.noForStart();
        coffer.removeMoney(this.bank * 0.15);
        this.bank-=this.bank * 0.15;
        setTimeout(() => {
          this.checkPlayers();
          this.startRace();
        }, 1000)
      }, 20000)
      return;
    }
    setTimeout(() => {
      this.timerController();
    }, testSpeed ? 5000 : 60000)
  }

  noForStart(){
    // "Количество участников недостачно для начала"
    this.checkPlayers();
    // this.players.forEach(playerid => {
    //   let player = mp.players.at(playerid)
    //   user.addCashMoney(player, this.cost);
    // })
    this.endLobby("Количество участников недостаточно для начала");
  }

  getSpawn(playerid:number){
    let id:number = this.players.indexOf(playerid);
    return this.spawns[id] ? this.spawns[id] : null;
  }

  setPlayerOnStartPoint(playerid:number){
    if(this.players.indexOf(playerid) == -1) return this.kickPlayer(playerid, "Покинул лобби");
    if(!mp.players.exists(playerid)) return this.kickPlayer(playerid, "Покинул сервер");
    if(!this.vehicles.has(playerid)) return this.kickPlayer(playerid, "Потерял своё ТС");
    let player = mp.players.at(playerid)
    let vehicle = this.vehicles.get(playerid);
    if(!mp.vehicles.exists(vehicle)) return this.kickPlayer(playerid, "Потерял своё ТС");
    let spawn = this.getSpawn(playerid);
    if(!spawn) return this.kickPlayer(playerid, "Не нашлось точки спавна")
    user.disableAllControls(player, true);
    user.showLoadDisplay(player);
    methods.teleportVehicle(vehicle, new mp.Vector3(spawn.x, spawn.y, spawn.z), spawn.h, this.id)
    player.alpha = 0
    vehicle.alpha = 0
    vehicle.repair();
    if(!player.vehicle){
      player.dimension = this.id;
      user.teleportProtect(player)
      player.position = new mp.Vector3(vehicle.position.x, vehicle.position.y, vehicle.position.z-5);
      setTimeout(() => {
        if (mp.players.exists(player)) player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
      }, 100)
    }
    let vInfo = methods.getVehicleInfo(vehicle.model);
    let ursIds:number[] = [];
  
    this.players.forEach(usr => {
      ursIds.push(usr)
    })
    player.call('startRace', [this.timeStart, JSON.stringify(this.checkpoints), this.laps, JSON.stringify(ursIds), vInfo.display_name == "Unknown" ? vehicle.model: vInfo.display_name, JSON.stringify(spawn), vehicle.id])
    player.setVariable("raceCheckpoint", 0);
    player.setVariable("raceLobby", this.id);
    setTimeout(() => {
      if(mp.players.exists(player)){
        user.hideLoadDisplay(player)
        let vehicle = this.vehicles.get(playerid)
        menu.close(player)
        if(vehicle) vehicle.repair();
        user.disableAllControls(player, false);
        if(vehicle && mp.vehicles.exists(vehicle)) vehicles.engineStatus(player, vehicle, true);
        setTimeout(() => {
          let vehicle = this.vehicles.get(playerid)
          if(vehicle && mp.vehicles.exists(vehicle))vehicles.engineStatus(player, vehicle, true), vehicle.repair();
          setTimeout(() => {
            let vehicle = this.vehicles.get(playerid)
            if(vehicle && mp.vehicles.exists(vehicle))vehicles.engineStatus(player, vehicle, true), vehicle.repair();
            if(user.isLogin(player))player.alpha = 255
            if(vehicle && mp.vehicles.exists(vehicle))vehicle.alpha = 255
          }, 1000)
        }, 1000)
      } else {
        this.kickPlayer(playerid, "Покинул сервер");
      }
    }, 2000)
    this.racersPosition.set(player.id, 0)
  }

  /** Начало гонки */
  async startRace(){
    // console.log("[RACE] START")
    this.stage = "race"
    this.timeStart = methods.getRandomInt(3, 6);
    this.players.forEach((playerid) => {
      let player = mp.players.at(playerid)
      user.showLoadDisplay(player)
      user.disableAllControls(player, true);
    })
    await wait(600)
    await this.checkPlayers();
    this.players.forEach((playerid) => {
      this.setPlayerOnStartPoint(playerid);
    })
  }

  /** Контроллер для полной проверки игроков */
  checkPlayers(){
    this.players.forEach(targetid => {
      let target = mp.players.at(targetid)
      if(!target) this.kickPlayer(targetid, "Покинул сервер");
      else if(!mp.players.exists(target)) this.kickPlayer(targetid, "Покинул сервер");
      else if(target.health == 0) this.kickPlayer(targetid, "Погиб");
    })
  }

  /** Полная процедура кика игрока из лобби */
  kickPlayer(
    /** сетевой ID игрока */
    targetid:number,
    /** Текст уведомления */
    notify:string = null, 
    /** Игрок финишировал */
    nice = false
  ){
      // Уничтожаем машину, если таковая была
    setTimeout(() => {
      if(this.vehicles.has(targetid)){
        if(mp.vehicles.exists(this.vehicles.get(targetid))) this.vehicles.get(targetid).destroy();
        this.vehicles.delete(targetid);
      }
    }, !nice ? 1 : 1500)
    if(this.players.indexOf(targetid) > -1){
      let target = mp.players.at(targetid);
      if(!mp.players.exists(target)) target = null;
      if(target){
        menu.close(target)
        target.call("race:kick")
        target.raceLobby = null;
      }
      if((this.stage == "waiting" || this.stage == "selectCar") && target){
        this.bank -= this.cost;
        // user.addCashMoney(target, this.cost)
        // target.notify("Вам возвращён залог за регистрацию в гонке")
      }
      setTimeout(() => {
        // Возврат в лобби, если что то случилось в гонке
        if(!mp.players.exists(target)) return;
        if(this.stage != "waiting" && this.stage != "selectCar"){
          if(target.health == 0) target.spawn(raceCheckPosition), setTimeout(() => {
            if(!mp.players.exists(target)) return;
            if(target.health == 0) target.spawn(raceCheckPosition)
          }, 1500)
          else user.teleport(target, raceCheckPosition.x, raceCheckPosition.y, raceCheckPosition.z);
          target.dimension = 0;
          setTimeout(() => {
            if(!mp.players.exists(target)) return;
            user.hideLoadDisplay(target)
            user.disableAllControls(target, false);
          }, 500)
        }
      }, !nice ? 1 : 1500)
      if(notify && target){
        this.notifyLobby(user.getRpName(target)+(nice?" ":" покинул лобби: ")+notify)
      }
      
      this.players.splice(this.players.indexOf(targetid), 1);
    }

    
    

  }

  /** Регистрация участника */
  register(player:PlayerMp){
    // console.log("[RACE] REGISTER")
    if(this.stage != "waiting") return player.notify("Время регистрации вышло");
    if(this.players.indexOf(player.id) > -1) return player.notify("Вы уже зарегистрированы");
    if(player.raceLobby) return player.notify("Вы уже зарегистрированы в другой гонке");
    if(this.players.length == this.spawns.length) return player.notify("Количество участников гонки уже достигло максимума");
    if(!user.get(player, "b_lic")) return player.notify("Требуется наличие удостоверения категории B");
    // if(user.getCashMoney(player) < this.cost) return player.notify(`Для участия требуется взнос ${this.cost}$`);
    // user.removeCashMoney(player, this.cost);
    player.raceLobby = this.id;
    this.bank+=this.cost*1.2;
    this.players.push(player.id)
    menu.close(player);
    player.notify("Вы зарегистрированы, ожидайте окончания регистрации");
  }

  /** Вызов меню выбора ТС */
  selectCarLobby(player?:PlayerMp, reload = false){
    // console.log("[RACE] SELECT CAR")
    if(this.stage == "race") return;
    this.checkPlayers();
    if(!testSpeed && this.players.length < 4 && !this.checkPlayersCount) return this.noForStart();
    if(!player){
      this.players.forEach(targetid => {
        let target = mp.players.at(targetid)
        this.selectCarLobby(target, reload);
      })
      return;
    }
    if(!this.vehicles.get(player.id) && reload) return;
    let m = menu.new(player,this.name,"Выбор ТС");
    m.exitProtect = true;
    if(this.vehicles.get(player.id)){
      this.players.forEach(targetid => {
        let target = mp.players.at(targetid)
        m.newItem({
          name: user.getRpName(target),
          more: this.vehicles.get(target.id) ? "~g~"+methods.getVehicleInfo((this.vehicles.get(target.id).model)).display_name : "~r~Выбирает ТС"
        });
      })
    } else {
      for(let name in carSeries){
        if(name == this.vehiclesSeries){
          let cars = carSeries[name];
          cars.map(car => {
            let carConf = methods.getVehicleInfo(car);
            m.newItem({
              name: carConf.display_name == "Unknown" ? car: carConf.display_name,
              onpress: () => {
                // if(this.fixedSpawns.has(this.fixedSpawnsIds)) return;
                // this.fixedSpawnsIds++;
                // const posid = this.fixedSpawnsIds;
                m.close();
                // this.fixedSpawns.set(posid, {player:player.id,vehicle:null})
                if(this.vehicles.get(player.id)) return player.notify("Вы уже выбрали ТС");
                let spawn = this.getSpawn(player.id)
                if(!spawn) return this.kickPlayer(player.id, "Что то пошло не так")
                let vehicle = mp.vehicles.new(car, new mp.Vector3(spawn.x,spawn.y,spawn.z+0.5), {
                  dimension: this.id,
                  locked: true,
                  engine: false,
                  heading: spawn.h
                })
                // this.fixedSpawns.set(posid, {player:player.id,vehicle:vehicle.id})
                
                vehicle.setVariable("raceVehicle", true);
                vehicle.setVariable('fuel', carConf.fuel_full);
                methods.teleportVehicle(vehicle, new mp.Vector3(spawn.x, spawn.y, spawn.z + 0.5), spawn.h, this.id)
                vehicle.numberPlate = user.getId(player).toString();
                vehicle.setColorRGB(methods.getRandomInt(0, 255), methods.getRandomInt(0, 255), methods.getRandomInt(0, 255), methods.getRandomInt(0, 255), methods.getRandomInt(0, 255), methods.getRandomInt(0, 255));
                vehicle.numberPlate = user.getId(player).toString();
                this.vehicles.set(player.id, vehicle);
                this.selectCarLobby(null, true)
              }
            });
          })
        }
      }
    }
    m.open();
  }

  endLobby(reason:string){
    this.stage = "ended";
    this.players.forEach(targetid => {
      this.kickPlayer(targetid, reason)
    })
    setTimeout(() => {
      if(lobbyList.has(this.id)) lobbyList.delete(this.id)
    }, 1000)
  }

  /** Уведомление всех участников лобби */
  notifyLobby(reason:string){
    // this.checkPlayers();
    this.players.forEach(targetid => {
      let target = mp.players.at(targetid);
      if(mp.players.exists(target)) target.notify(reason);
    })
  }

  /** Функция для закрытия гонки */
  endtimerFunc(){
    if(this.endtimer) return;
    this.endtimer = true;
    this.notifyLobby("Гонка будет завершена через 3 минуты")
    setTimeout(() => {
      this.notifyLobby("Гонка будет завершена через 2 минуты")
      setTimeout(() => {
        this.notifyLobby("Гонка будет завершена через 1 минуту")
        setTimeout(() => {
          this.endLobby("Гонка завершена")
        }, 60000)
      }, 60000)
    }, 60000)
  }
}


function generateRaceLobby(data:raceData, time:number, cost:number, checkPlayersCount = false){
  return new RaceLobby(data, time, cost, checkPlayersCount);
}

function getRandomRaceConfig():Promise<raceData>{
  return new Promise((resolve) => {
    raceCfgEntity.findOne({ where: { ready: 1 }, order: Sequelize.fn('RAND')}).then(item => {
      resolve({
        ...dbtodata(item),
        checkpoints: JSON.parse(item.checkpoints),
        spawns: JSON.parse(item.spawns)
      })
    })

  })
}

chat.registerCommand('racegen', (player, timeTxt, costTxt, jn) => {
  if(!user.isAdminNow(player) || user.getAdminLevel(player) != 6) return;
  let time = methods.parseInt(timeTxt);
  let cost = methods.parseInt(costTxt);
  if(isNaN(time) || time < 0) return player.notify("Время указано не верно");
  if(isNaN(cost) || cost < 1) return player.notify("Цена указана не верно");
  getRandomRaceConfig().then(config => {
    let lobby = generateRaceLobby(config, time, cost, jn == "1");
    if(jn == "1") lobby.register(player);
  })
})

let editMapTrash:Map<number, EntityMp[]> = new Map();
let checkType = {
  pitstop: 45,
  finish: 4,
  check: 2,
  start: 4,
}

const dbtodata = (entry: raceCfgEntity): raceData => {
  return {
    id: entry.id,
    checkpoints: JSON.parse(entry.checkpoints),
    spawns: JSON.parse(entry.spawns),
    vehiclesSeries: entry.vehiclesSeries,
    name: entry.name,
    ready: entry.ready,
  }
}

function rebuildEditData(player:PlayerMp, map:raceData){
  let pt = ["spawns", "checkpoints"];
  if(!editMapTrash.has(user.getId(player))) editMapTrash.set(user.getId(player), []);
  let container = editMapTrash.get(user.getId(player))

  container.forEach((itm,index) => {
    if(itm && itm.type != "vehicle") itm.destroy(), container.splice(index, 1);
  })
  
  pt.forEach((ch, idx) => {
    map[idx == 0 ? "spawns" : "checkpoints"].forEach((itm, index) => {
      if(idx == 0){
        container.push(mp.checkpoints.new(checkType.start, new mp.Vector3(itm.x, itm.y, itm.z), 2, {
          direction: new mp.Vector3(0, 0, 75),
          color: [255, 0, 0, 255],
          visible: true,
          dimension: player.dimension
        }));
        container.push(mp.labels.new("Точка спавна №" + (index + 1), new mp.Vector3(itm.x, itm.y, itm.z + 1.5), {
          los: true,
          font: 1,
          drawDistance: 20,
          dimension: player.dimension
        }));
      } else {
        container.push(mp.checkpoints.new((((index + 1) == map.checkpoints.length) ? checkType.finish : checkType.check), new mp.Vector3(itm.x, itm.y, itm.z), (itm.r + 0.0001), {
          direction: ((index + 1) == map.checkpoints.length) ? new mp.Vector3(0, 0, 75) : new mp.Vector3(map.checkpoints[index + 1].x, map.checkpoints[index + 1].y, map.checkpoints[index + 1].z + 0.5),
          color: [255, 255, 0, 60],
          visible: true,
          dimension: player.dimension
        }));
        container.push(mp.labels.new("Чекпоинт №" + (index + 1), new mp.Vector3(itm.x, itm.y, itm.z + 1.5), {
          los: true,
          font: 1,
          drawDistance: 20,
          dimension: player.dimension
        }));
      }
    });
  });
  return container;
}

function editMap(player:PlayerMp, map:raceData){
  let pt = ["spawns", "checkpoints"];
  if(player.dimension == 0){
    player.dimension = methods.newDimention();
  }
  let container = rebuildEditData(player, map);
  
  let m = menu.new(player, map.name, "Действия");
  m.exitProtect = true;
  m.onclose = () => {
    user.accept(player, "Сохранить изменения?").then(status => {
      if(status) saveMap(map),player.notify("Карта сохранена")
      container.forEach(itm => {
        itm.destroy();
      })
      editMapTrash.delete(user.getId(player));
      player.dimension = 0;
    })
  }
  m.newItem({
    name: "Готовность карты",
    type: "list",
    list: ["~r~Не готова", "~g~Готова"],
    listSelected: map.ready,
    desc: "Готовые карты будут автоматически создаватся системой",
    onchange: (value) => {
      if(user.getAdminLevel(player) < 4) return player.notify("Вы не можете включать карту"), map.ready = 0;
      map.ready = value;
      if(map.spawns.length < 15) return player.notify("Количество точек спавна должно быть не менее 15, гонка не будет в ротации"), map.ready = 0;
      if(map.checkpoints.length < 10) return player.notify("Количество чекпоинтов должно быть не менее 10, гонка не будет в ротации"), map.ready = 0;
    }
  })
  m.newItem({
    name: "Тест гонки",
    desc: "~r~Внимание!!! ~w~Рекомендуем сохранить перед тестированием",
    onpress: () => {
      let players:PlayerMp[] = [];
      
      const testMenu = () => {
        let test = menu.new(player, "Тест гонок", "Список");
        test.newItem({
          name: "Добавить участника",
          onpress: () => {
            menu.input(player, "Введите ID").then(ids => {
              let target = user.getPlayerById(methods.parseInt(ids));
              if(!target) return player.notify("~r~Игрок не обнаружен");
              if(target.raceLobby) return player.notify("~r~Игрок уже зарегистрирован в другой гонке");
              if(target.health == 0) return player.notify("~r~Игрок мёртв");
              if(!user.get(target, "b_lic")) return player.notify("У игрока нет удостоверения категории B");
              user.accept(target, "Принять участие в гонке?").then(status => {
                if(status){
                  player.notify("~g~"+user.getRpName(target)+" принял запрос")
                  players.push(target);
                  testMenu();
                  //testMenu();
                } else {
                  player.notify("~r~"+user.getRpName(target)+" отклонил запрос")
                }
              })
            })
          }
        })
        players.forEach((target) => {
          if(mp.players.exists(target)){
            test.newItem({
              name: user.getRpName(target)
            })
          }
        })
        test.newItem({
          name: "Начать гонку",
          onpress: () => {
            container.forEach(itm => {
              itm.destroy();
            })
            editMapTrash.delete(user.getId(player));
            let race = new RaceLobby(map, 0, 10, true);
            race.register(player);
            players.forEach(target => {
              if(mp.players.exists(target)) race.register(target);
            })
          }
        })
        test.open();
      }
      testMenu();
    }
  })
  m.newItem({
    name: "Сохранить",
    onpress: () => {
      saveMap(map);
      player.notify("Карта сохранена")
    }
  })
  m.newItem({
    name: "Спавн ТС",
    onpress: () => {
      menu.input(player, "Введите название").then(name => {
        if(!name) return;
        vehicles.spawnCar2((vehicle) => {
          if (!vehicle) return player.notify("Некорректная модель");
          vehicle.dimension = player.dimension;
          player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
          container.push(vehicle);
          vehicle.numberPlate = user.getId(player).toString();
          vehicles.setFuelFull(vehicle);
        }, player.position, player.heading, name)
      })
      
    }
  })
  m.newItem({
    name: "Переименовать",
    onpress: () => {
      menu.input(player, "Введите название").then(name => {
        if(!name) return;
        raceCfgEntity.count({where: {name}}).then(res => {
          if (res > 0) return player.notify("Карта с таким названием уже есть")
          map.name = name;
          saveMap(map);
          player.notify("Карта сохранена")
        })
      })
    }
  })
  let seriesNames:string[] = [];
  for(let name in carSeries)seriesNames.push(name);
  m.newItem({
    name: "Тип ТС",
    type: "list",
    listSelected: seriesNames.indexOf(map.vehiclesSeries),
    list: seriesNames,
    onchange: (_, item)=>{
      map.vehiclesSeries = item.listSelectedName;
    }
  })
  
  pt.forEach((ch, idx) => {
    m.newItem({
      name: idx ? "Чекпоинты" : "Стартовые точки",
      onpress: () => {


        const checks = () => {
          container = rebuildEditData(player, map);

          if(!map.size) map.size = 5;
          let sz:string[] = [];
          for(let i = 1; i < 50; i++) sz.push(i.toString());
          let submenu = menu.new(player, idx ? "Чекпоинты" : "Стартовые точки", "Список");
          submenu.onclose = () => {
            editMap(player, map);
          }
          submenu.newItem({
            name: "Назад",
            onpress: ()=>{
              editMap(player, map);
            }
          })
          submenu.newItem({
            name: "Размер маркера",
            type: "list",
            list: sz,
            listSelected: map.size - 1,
            onchange: (val)=>{
              map.size = val + 1
            }
          })
          submenu.newItem({
            name: "Новая точка",
            onpress: ()=>{
              map[idx == 0 ? "spawns" : "checkpoints"].push(getRacePoint(player, map.size))
              checks();
            }
          })
          map[idx == 0 ? "spawns" : "checkpoints"].forEach((itm, index) => {
            submenu.newItem({
              name: (idx ? "Чекпоинт #" : "Стартовая точка #")+(index+1),
              type: "list",
              list: ["Переместится", "Удалить", "Переместить"],
              onpress: (item)=>{
                if(item.listSelected == 0){
                  user.teleportVeh(player, itm.x, itm.y, itm.z+0.5);
                } else if(item.listSelected == 1) {
                  map[idx == 0 ? "spawns" : "checkpoints"].splice(index, 1);
                  player.notify("Точка удалена");
                  checks();
                } else {
                  itm = getRacePoint(player, map.size)
                  player.notify("Точка перемещена");
                  checks();
                }
              }
            })
          })
          submenu.open(2)
        }
        checks();


        
      }
    })
  })
  m.open();

}

function saveMap(map:raceData){
  map.checkpoints.forEach(res => {
    res.x = methods.parseFloat(res.x.toFixed(2))
    res.y = methods.parseFloat(res.y.toFixed(2))
    res.z = methods.parseFloat(res.z.toFixed(2))
    res.h = methods.parseFloat(res.h.toFixed(2))
  })
  map.spawns.forEach(res => {
    res.x = methods.parseFloat(res.x.toFixed(2))
    res.y = methods.parseFloat(res.y.toFixed(2))
    res.z = methods.parseFloat(res.z.toFixed(2))
    res.h = methods.parseFloat(res.h.toFixed(2))
  })


  raceCfgEntity.update({
    name: map.name,
    checkpoints: JSON.stringify(map.checkpoints),
    vehiclesSeries: map.vehiclesSeries,
    spawns: JSON.stringify(map.spawns),
    ready: map.ready,
  }, {where: {id:map.id}});
}

chat.registerCommand('raceedit', (player) => {
  if(!user.isAdminNow(player) || user.getAdminLevel(player) < 2) return;
  mapCat(player);
})

function mapCat(player:PlayerMp){

  raceCfgEntity.findAll({ where: { user: user.getId(player) } }).then(data => {
    let m = menu.new(player, "Гонки", "Список моих карт");
    m.newItem({
      name: "Новая трасса",
      onpress: () => {
        menu.input(player, "Введите название").then(name => {
          if(!name) return;

          raceCfgEntity.count({ where: { name } }).then(res => {
            if (res > 0) return player.notify("Карта с таким названием уже есть")
            raceCfgEntity.create({
              user: user.getId(player),
              name: name,
            }).then(() => {
              mapCat(player);
              return player.notify("Карта добавлена в ваш каталог. Теперь вам нужно её настроить")
            })
          })
        })
      }
    })
    data.forEach(map => {
      m.newItem({
        name: map.name,
        onpress: () => editMap(player, {
          ...dbtodata(map),
          checkpoints: JSON.parse(map.checkpoints),
          spawns: JSON.parse(map.spawns)
        })
      })
    })
    m.open();
  })
}


mp.events.add("race:dead", (player:PlayerMp) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.checkPlayers();
});

mp.events.add("playerDeath", (player:PlayerMp) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.kickPlayer(player.id, "Погиб");
});

mp.events.add("playerDamage", (player:PlayerMp) => {
  if(player.health != 0) return;
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.kickPlayer(player.id, "Погиб");
});

mp.events.add("playerQuit", (player:PlayerMp) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.kickPlayer(player.id, "Покинул сервер");
});



mp.events.add("race:cheat", (player:PlayerMp) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.kickPlayer(player.id, "Фальш старт");
})

mp.events.add("race:checkpoint", (player:PlayerMp, lap:number, checkpoint:number) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.checkPlayers();
  lobby.racersPosition.set(player.id, checkpoint);
  lobby.players.forEach(targetid => {
    let target = mp.players.at(targetid)
    if(target != player) target.call("race:checkpointData", [player.id, lap, checkpoint])
  })
});

mp.events.add("race:respawn", (player:PlayerMp, x:number, y:number, z:number, h:number) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.checkPlayers();
  let vehicle = lobby.vehicles.get(player.id);
  if(!mp.vehicles.exists(vehicle)) return lobby.kickPlayer(player.id, "ТС пропало")
  if(!vehicle) return;
  user.showLoadDisplay(player)
  player.dimension = lobby.id;
  vehicle.dimension = lobby.id;
  setTimeout(() => {
    vehicle = lobby.vehicles.get(player.id);
    if(!vehicle) return;
    user.healProtect(player)
    player.health = 100;
    methods.teleportVehicle(vehicle, new mp.Vector3(x, y, z))
    //vehicle.rotation.z = h;
    setTimeout(() => {
      user.teleportProtect(player);
      player.putIntoVehicle(vehicle, RAGE_BETA ? 0 : -1);
      vehicle.repair();
      setTimeout(() => {
        user.hideLoadDisplay(player)
        player.call("race:vehground")
      }, 100)
    }, 100)
  }, 3000)
});

mp.events.add("race:finished", (player:PlayerMp) => {
  if(!player.raceLobby) return;
  let lobby = lobbyList.get(player.raceLobby);
  if(!lobby) return;
  lobby.checkPlayers();
  const position = lobby.finished.push(player);
  let multipler = [0.45, 0.25, 0.15];
  if(position < 4){
    setTimeout(() => {
      if(mp.players.exists(player)) user.addCashMoney(player, (methods.parseInt(lobby.bank * multipler[position-1])))
    }, 3000);
  }
  lobby.kickPlayer(player.id, `Финишировал: ${position} место`, true)
  if(position == 3){
    lobby.endtimerFunc();
  }
});

const blip = mp.blips.new(315, raceCheckPosition, {
  dimension: 0,
  name: "Гонки",
  scale: 0.5,
  color: 8,
  shortRange: true
})

methods.createDynamicCheckpoint(raceCheckPosition, "Нажмите ~g~Е~s~ чтобы открыть меню лобби", (player) => {
  let m = menu.new(player, "", "Текущие мероприятия");
  m.sprite = "racelobby";

  m.newItem({
    name: "Название",
    // more: "Стоимость участия"
  })

  let haveActive = false;
  lobbyList.forEach(lobby => {
    if(lobby.stage == "waiting"){
      haveActive = true;
      m.newItem({
        name: lobby.name,
        // more: lobby.cost+"$",
        onpress: () => lobby.register(player)
      })
    }
  })
  if(!haveActive) m.newItem({
    name: "На данный момент нет активных гонок"
  })
  m.open()
}, 5, 0); 