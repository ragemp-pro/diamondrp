import { methods } from "./methods";
import { menu } from "./menu";
import { vehicleInfo } from "./vehicleInfo";
import { vehicles, offsetFrNew } from "../vehicles";
import { vSync } from "../managers/vSync";
import { user } from "../user";
import { fractionGarageEntity } from "./entity/fractionGarage";
import { gangDeliverGosReward } from "../../util/gang.deliver";
import { fractionUtil } from "../../util/fractions";
import { coffer } from "../coffer";
import { RAGE_BETA } from "../../util/newrage";



export interface fractionGarageCar {
  /** Модель ТС */
  model:string;
  /** Ранг для доступа */
  rank:number;
  /** Точка для спавна */
  spawn:Vector3Mp;
  /** Поворот ТС при спавне */
  heading:number;
  /** Покраска */
  livery:number;
  /** Основной цвет ТС */
  color1:number;
  /** Дополнительный цвет ТС */
  color2:number;
  /** Количество ТС */
  amount:number;
}

let garagesList:Map<number,fractionGarage> = new Map();
let generateid = 0;
export class fractionGarage {
  id: number;
  fraction: number;
  position: Vector3Mp;
  prefix: string;
  cars: fractionGarageCar[];
  checkpoint: { delete: () => void; updatePos: (posnew: Vector3Mp) => void; updateName: (name: string) => void; };
  generateid: number;
  amountmap: Map<string, number>;
  dimension: number;
  static get(id:number){
    return garagesList.get(id);
  }
  static list(){
    return garagesList;
  }
  static createNew(fraction:number,position:Vector3Mp,prefix:string,dimension:number):Promise<fractionGarage>{
    return new Promise((resolve) => {
      fractionGarageEntity.create({
        fraction,position, prefix,cars:[]
      }).then(item => {
        resolve(this.newGarage(item.id, fraction, position, prefix, [],dimension))
      })
    })
  }
  static newGarage(id:number,fraction:number,position:Vector3Mp|string,prefix:string,cars:fractionGarageCar[]|string,dimension:number){
    return new fractionGarage(id, fraction, typeof position === "string" ? JSON.parse(position) : position , prefix, typeof cars === "string" ? JSON.parse(cars) : cars,dimension)
  }
  addVehicle(model:string,spawn:Vector3Mp,heading:number,livery:number,rank:number,color1:number,color2:number,amount:number){
    const item = this.cars.find(itm => itm.model == model);
    if(!item){
      this.cars.push({model,spawn,rank,heading,livery,color1,color2,amount})
      this.amountmap.set(model, amount)
    } else {
      item.amount+=amount;
      this.amountmap.set(model, this.amountmap.get(model)+amount)
    }
    this.save();
  }
  getVehicle(model:string){
    return this.cars.find(q => q.model == model);
  }
  delete(player:PlayerMp){
    if(!user.isAdminNow(player, 6)) return player.notify("~r~У вас нет доступа");
    user.accept(player, "Вы уверены?").then(status => {
      if(!status) return;
      fractionGarageEntity.destroy({where: {id: this.id}}).then(item => {
        this.checkpoint.delete();
        garagesList.delete(this.id);
        player.notify("~g~Гараж удалён")
      })
    })
  }
  spawn(item:fractionGarageCar,player:PlayerMp){
    let vInfo = vehicleInfo.find(item.model)
    if(this.amountmap.get(item.model) == 0) return player.notify("~r~В гараже больше нет "+(vInfo ? vInfo.display_name : item.model));
    if(item.rank > user.getPlayerFractionRank(player) && !user.isAdminNow(player)) return player.notify("~r~У вас нет доступа к данному ТС");
    let veh = methods.getNearestVehicleWithCoords(item.spawn, 3);
    if(veh) return player.notify("~r~Парковочное место занято, освободите место")
    generateid++;
    const vehid = generateid;
    let number = (`${this.prefix}${vehid}`.length <= 7) ? `${this.prefix} ${vehid}` : `${this.prefix}${vehid}`
    if(this.prefix.toUpperCase() == "A") number = vehicles.generateNumber(8)
    this.amountmap.set(item.model, this.amountmap.get(item.model) - 1);
    vehicles.newOrdered(
      (veh) => {
        veh.numberPlate = number;
        vSync.setEngineState(veh, false);
        veh.locked = true;
        veh.livery = item.livery;
        veh.setColor(item.color1, item.color2);
        veh.setVariable('container', vehid + offsetFrNew);
        veh.setVariable('fuel', vInfo ? vInfo.fuel_full : 80);

        veh.setVariable('fraction_id', this.fraction);
        vehicles.set(vehid + offsetFrNew, 'fuel', vInfo ? vInfo.fuel_full : 80);
        vehicles.set(vehid + offsetFrNew, 'fraction_id', this.fraction);
        vehicles.set(vehid + offsetFrNew, 'hash', veh.model);
        veh.fractiongarage = this.id;
        veh.fraction_id = this.fraction;
        if(user.isGos(player)){
          veh.is_gos = true
          veh.setMod(11, 2);
          veh.setMod(12, 2);
          veh.setMod(13, 3);
          veh.setMod(18, 0);
          veh.setMod(16, 2);
          veh.setVariable('boost', 1.89);
        }
        if(!mp.players.exists(player)) return;
        user.setWaypoint(player, item.spawn.x, item.spawn.y);
        player.notify("~g~"+(vInfo ? vInfo.display_name : item.model)+" ожидает вас на парковке")
      },[
        mp.joaat(item.model),
        item.spawn,
        { heading: Math.floor(item.heading), numberPlate: number, engine: false, dimension: 0 },
        item.model
      ]);
  }
  save(){
    fractionGarageEntity.update({
      fraction: this.fraction,
      position: this.position,
      prefix: this.prefix,
      cars: this.cars,
    },{where: {id: this.id}})
  }
  editVeh(player:PlayerMp){
    if(!user.isSubLeader(player) && !user.isAdminNow(player, 5)) return player.notify("~r~У вас нет доступа, как вы тут оказались?");
    let m = menu.new(player, "Автопарк", "Список");
    m.onclose = () => {this.mainMenu(player);}
    this.cars.forEach((item, index) => {
      let vInfo = vehicleInfo.find(item.model)
        m.newItem({
          name: (vInfo ? vInfo.display_name : item.model)+" Ранг доступа",
          type: "range",
          rangeselect: [1, 14],
          listSelected: (item.rank - 1),
          onchange: (value) => {
            item.rank = value + 1
            this.save()
          },
          onpress: () => {
            if(!user.isAdminNow(player, 5)) return player.notify("~r~У вас нет доступа для удаления ТС");
            user.accept(player, "Удалить ТС?").then(status => {
              if(!status) return;
              this.cars.splice(index, 1);
              this.save();
              this.editVeh(player);
            })
          }
        })
    })
    m.open();
  }
  mainMenu(player:PlayerMp){
    if(user.getPlayerFraction(player) != this.fraction && !user.isAdminNow(player, 5)) return player.notify("~r~У вас нет доступа к данному гаражу")
    let m = menu.new(player,"Гараж "+methods.getFractionName(this.fraction), "Список");
    this.cars.forEach(item => {
      let vInfo = vehicleInfo.find(item.model)
      m.newItem({
        name: vInfo ? vInfo.display_name : item.model,
        more: `Доступно: ${this.amountmap.get(item.model) > 0 ? "В наличии" : "Нет в наличии"}`,
        onpress: () => this.spawn(item, player)
      })
    })
    if(user.isSubLeader(player) || user.isAdminNow(player, 5)){
      if(user.isAdminNow(player, 5) || user.isGos(player)){
        m.newItem({
          name: "Отслеживание ТС",
          onpress: () => this.searchVeh(player)
        })
      }
      m.newItem({
        name: "Настройка доступа",
        onpress: () => this.editVeh(player)
      })
      if(user.isAdminNow(player, 6)){
        m.newItem({
          name: "~r~Удалить гараж",
          onpress: () => this.delete(player)
        })
      }
    }

    if (fractionUtil.getFraction(this.fraction).gos){
      let vehiclesNearestGangDeliver = user.getNearestVehicles(player, 5).find(veh => veh.deliverFraction);
      if (vehiclesNearestGangDeliver){
        m.newItem({
          name: "Сдать фургон",
          onpress: () => {
            let veh = user.getNearestVehicles(player, 5).find(veh => veh.deliverFraction);
            if (!veh) return player.notify("ТС не обнаружен");
            if (veh.getOccupants().length > 0) return player.notify("~r~В ТС никого не должно быть");
            veh.destroy();
            user.addCashMoney(player, gangDeliverGosReward)
            coffer.addMoney(gangDeliverGosReward/2)
            player.notify("~g~Вы получили $" + gangDeliverGosReward+' за доставку фургона')
          }
        })
      }
    }
    
    m.newItem({
      name: "Запарковать ТС",
      onpress: () => {
        let veh = methods.getNearestVehicleWithCoords(this.position, 20);
        if(!veh) return player.notify("ТС не обнаружен");
        if(veh.fractiongarage != this.id) return player.notify("~r~Данный ТС не принадлежит данному гаражу");
        if(veh.getOccupants().length > 0) return player.notify("~r~В ТС никого не должно быть");
        vehicles.respawn(veh);
        player.notify("~g~Транспорт запаркован");
      }
    })
    
    m.open();
  }
  constructor(id:number,fraction:number,position:Vector3Mp,prefix:string,cars:fractionGarageCar[], dimension:number){
    this.generateid = 0;
    this.dimension = dimension;
    this.id = id;
    this.fraction = fraction;
    this.position = position;
    this.prefix = prefix;
    this.cars = cars;
    this.amountmap = new Map();
    this.cars.forEach(item => {
      if(!this.amountmap.has(item.model)) this.amountmap.set(item.model, item.amount)
      else this.amountmap.set(item.model, this.amountmap.get(item.model)+item.amount);
    })
    this.checkpoint = methods.createDynamicCheckpoint(this.position, "Нажмите ~g~E~w~ чтобы открыть гараж "+methods.getFractionName(this.fraction), player => {
      this.mainMenu(player);
    }, 1, this.dimension);
    garagesList.set(this.id, this);
  }
  searchVeh(player:PlayerMp){
    if(!user.isSubLeader(player) && !user.isAdminNow(player, 6)) return player.notify("~r~У вас нет доступа, как вы тут оказались?");
    let m = menu.new(player, "Автопарк", "Список");
    m.onclose = () => {this.mainMenu(player);}

    mp.vehicles.forEach(vehicle => {
      if(vehicle.fractiongarage && vehicle.fractiongarage == this.id){
        m.newItem({
          name: vehicle.modelname,
          more: vehicle.numberPlate,
          onpress: () => {
            menu.selector(player, "Действие", ["Метка", "Эвакуировать"], true).then(res => {
              if(!mp.vehicles.exists(vehicle)) return this.searchVeh(player);
              if(typeof res !== "number") return this.searchVeh(player);;
              if(res == 0){
                if((vehicle.velocity.x > 5 || vehicle.velocity.y > 5 || vehicle.velocity.z > 5)){
                  return player.notify("~r~Транспорт в движении, не удаётся установить местоположение. Попробуйте снова.");
                }
                if(user.getVehicleDriver(vehicle)){
                  if(user.get(user.getVehicleDriver(vehicle), 'fraction') != this.fraction) return player.notify("~r~ТС в угоне, отследить не удалось")
                }
                 
                user.setWaypoint(player, vehicle.position.x, vehicle.position.y);
                player.notify("~g~Метка установлена");
              } else {
                if(vehicle.getOccupants().length > 0) return player.notify("~r~В ТС кто то есть."), this.searchVeh(player);;
                vehicles.respawn(vehicle);
                player.notify("~g~Транспорт эвакуирован");
              }
              this.searchVeh(player);
            })
          }
        })
      }
    })

    m.open();
  }
}

mp.events.add("vehicleDestroy", (vehicle:VehicleMp) => {
  if(!vehicle.fractiongarage) return;
  if(!vehicle.modelname) return;
  const garage = fractionGarage.get(vehicle.fractiongarage);
  if(!garage) return;
  garage.amountmap.set(vehicle.modelname, garage.amountmap.get(vehicle.modelname) + 1);
})

export const loadFractionGarages = () => {
  fractionGarageEntity.findAll().then(q => {
    q.forEach(item => {
      fractionGarage.newGarage(item.id, item.fraction, item.position, item.prefix, item.cars, item.dimension);
    })
  })
}


mp.events.add("playerStartEnterVehicle", (player: PlayerMp, vehicle: VehicleMp, seat: number) => {
  // console.log(seat);
  if (!vehicle.fraction_id) return;
  if(seat) return;
  if (user.getPlayerFraction(player) != vehicle.fraction_id) vSync.setEngineState(vehicle, false);
});
