import { methods } from "./methods";
import { user } from "../user";
import { EquipDataItems } from "../../util/equip";
import { inventory } from "../inventory";
import { menu } from "./menu";
import { items } from '../items';
import { dispatcher } from "../managers/dispatcher";
import { weaponChest } from "./entity/weaponChest";
// import { mysql } from "./mysql";
import { fractionUtil } from "../../util/fractions";
/** Отчёт времени когда мы сможем взять предмет повторно */
const personLimitCountDownTimer = 3
/** Максимальный вес заказа корабля */
export const maxShipWeight = 5000;
/** Максимальный вес заказа в 1 ТС */
const maxVehWeight = 1000;
/** Режим отладки, при включении таймеры режутся до одной секунды */
let debug = false;

setTimeout(() => {
  if(methods.isTestServer()) debug = true;
}, 10000)

let chests:Map<number,Chest> = new Map();
export let oldChestPool = chests
export interface orderItem {
  model:string,
  amount:number,
}

export let order = {
  botPedModel: "s_m_y_armymech_01",
  botHeading: 0.67,
  boatEndPos: new mp.Vector3(522.87, -3189.62, 0.91),
  boatStartPos: new mp.Vector3(534.16, -3986.24, 0.78),
  boatModel: "tug",
  colshapePos: new mp.Vector3(511.74, -3189.68, 5.07),
  inProcess: false
}

/** Список ТС, на которых можно перевозить заказы */
const acceptedVehs:number[] = [mp.joaat("RIOT"), mp.joaat("INSURGENT2"), mp.joaat("FBI2"), mp.joaat("FIB2"), mp.joaat("Barracks"), mp.joaat("burrito3"), mp.joaat("Barracks3")];


export const illegalList:{name:string,range:[number, number],cost:number}[] = [
  {
    name: "Другие наркотические вещества",
    range: [2, 3],
    cost: 0
  },
  {
    name: "Пакеты с наркотическими средствами",
    range: [70, 162],
    cost: 0
  },
  {
    name: "Крупные упаковки наркотических средств",
    range: [163, 170],
    cost: 100
  },
  {
    name: "Оружие",
    range: [54, 136],
    cost: 300
  },
  {
    name: "C4",
    range: [262, 262],
    cost: 500
  },
  {
    name: "Спец. отмычки",
    range: [263, 263],
    cost: 100
  },
]

export function newOrder(player:PlayerMp, itemslist:orderItem[]): Promise<boolean>{
  return new Promise(async (resolve) => {
    if(order.inProcess) return resolve(false), player.notify("~r~Сейчас нельзя заказывать вооружение");
    order.inProcess = true;
    let weight = 0;
    itemslist.forEach((value) => {
      weight+=(<number>items.getItemAmountById(methods.parseInt(value.model))*value.amount);
    })
    dispatcher.sendLocalPos("Заказ вооружения", "Корабль с вооружением готовится к погрузке", order.colshapePos, 4, false);
    setTimeout(() => {
      dispatcher.sendLocalPos("Заказ вооружения", "Корабль с вооружением готовится к отплытию. Суммарный вес - "+methods.parseInt(weight/1000)+"кг", order.colshapePos, 4, false);
      setTimeout(() => {
        dispatcher.sendLocalPos("Заказ вооружения", "Корабль с вооружением направляется в сторону порта", order.colshapePos, 4, true);
      }, debug ? 1000 : 60000)
    }, debug ? 1000 : 60000)
    setTimeout(() => {
      dispatcher.sendLocalPos("Заказ вооружения", "Корабль с вооружением прибывает через минуту", order.colshapePos, 4, true);
      setTimeout(() => {
        dispatcher.sendLocalPos("Заказ вооружения", "Прибыл корабль с заказанным вооружением", order.colshapePos, 4, true);
        itemslist.map(itm => {
          inventory.createManyItem(methods.parseInt(itm.model), 0, 999, 1, itm.amount)
        })
        // inventory.createItem(inventory.types.BagTransfer, 0, 999, 1)
        setTimeout(() => {
          order.inProcess = false;
        }, debug ? 1000 : 60000 * 60)
      }, debug ? 1000 : 60000)
    }, debug ? 1000 : 9 * 60 * 1000);
  })
}

const returnAfterDestroy = (entity:EntityMp) => {
  if(entity.getVariable('chestWeaponItems')){
    const q: [string, number][] = JSON.parse(entity.getVariable("chestWeaponItems"));
    let resitems:orderItem[] = q.map(([model,amount]) => {
      return {model,amount};
    });
  }
  if(entity.getVariable('chestWeaponItemsShip')){
    const q: [string, number][] = JSON.parse(entity.getVariable("chestWeaponItemsShip"));
    let resitems:orderItem[] = q.map(([model,amount]) => {
      return {model,amount};
    });
  }
}

export const initChests = () => {
  weaponChest.findAll().then(datas => {
    datas.forEach(item => {
      newChest(item.name, item.fraction, item.pos, item.weight, item.items, item.id, item.dimension)
    })
  })

}

mp.events.add("playerQuit", (player:EntityMp) => {
  returnAfterDestroy(player)
});
mp.events.add("vehicleDestroy", (vehicle:VehicleMp) => {
  returnAfterDestroy(vehicle)
});

mp.blips.new(615, order.colshapePos, {
  dimension: 0,
  name: "Военный порт",
  scale: 0.5,
  color: 8,
  shortRange: true
})
setTimeout(() => {
  methods.createDynamicCheckpoint(order.colshapePos, "Нажмите ~g~E~w~ чтобы открыть заказ", (player) => {
    if(user.getPlayerFraction(player) != 4) return player.notify("~r~Доступно только для армии");
    if(user.getPlayerFractionRank(player) < 12) return player.notify("~r~Доступно только для лидеров и замов");
    let m = menu.new(player, "Доставка груза")
    m.newItem({
      name: "Загрузка предметов в транспортную сумку",
      onpress: () => {
        let transferBag = user.getItem(player, inventory.types.BagTransfer)
        if (!transferBag) return player.notify(`~r~У вас нет в инвентаре ~b~${items.getItemNameById(inventory.types.BagTransfer)}`)
        let allitems = inventory.getItemListData(999, 1);
        if (allitems.length == 0) return player.notify(`~r~Нечего загружать`);
        allitems.map(item => {
          if ((inventory.currentAmount(inventory.types.BagTransfer, transferBag.id) + items.getItemWeightById(item.item_id)) > inventory.maxAmount(inventory.types.BagTransfer, transferBag.id)) {
            player.notify(`~r~${items.getItemNameById(item.item_id)} не был загружен. Причина - сумка переполнена`)
          } else {
            inventory.updateItemOwnerSystem(item.id, inventory.types.BagTransfer, transferBag.id);
          }
        })
        allitems = inventory.getItemListData(inventory.types.BagTransfer, transferBag.id);
      }
    })
    m.newItem({
      name: "Содержимое",
      onpress: () => {
        menu.close(player)
        setTimeout(() => {
          if(mp.players.exists(player)) inventory.openInventory(player, 999, 1)
        }, 100)
      }
    })
    m.open();
  })
  mp.events.register("server:chest:takeEquip", (player, model) => {
    if(typeof player.chestId != "number") return user.setGui(player, null);
    let ch = Chest.get(player.chestId);
    if(!ch) return user.setGui(player, null);
    ch.giveItem(player, model);
    return true;
  })
  mp.events.addRemoteCounted('server:chests:vehicle:grab', player => {
    const vehicle = player.vehicle
    if(!vehicle) return player.notify("~r~Вы должны быть в транспорте");
    if(!vehicle.getVariable('chestWeaponItemsShip')) return player.notify("~r~В транспорте нет оружия");
    grab(player)
  })
  
  mp.events.addRemoteCounted('server:checstWeaponVeh:unload', player => {
    const vehicle = player.vehicle
    if(!vehicle) return player.notify("~r~Вы должны быть в транспорте");
    if(!vehicle.getVariable('chestWeaponItems') && !vehicle.getVariable('chestWeaponItemsShip')) return player.notify("~r~В транспорте нет оружия");
    if(player.getVariable('chestWeaponItems')) return player.notify("~r~У вас уже есть сумка с оружием, вам необходимо доставить её на склад");
    const nearChests = [...chests].find(([_,chest]) => methods.distanceToPos2D(player.position, chest.pos) < 150)
    if(!nearChests) return player.notify("~r~Выгружать оружие с транcпорта можно только возле склада")
    if(vehicle.getVariable('chestWeaponItemsShip') && nearChests[1].fraction != 4) return player.notify("~r~Выгружать оружие с транcпорта можно только возле конечного склада")
    player.setVariable('chestWeaponItems', player.vehicle.getVariable(vehicle.getVariable('chestWeaponItems') ? 'chestWeaponItems' : 'chestWeaponItemsShip'));
    vehicle.setVariable('chestWeaponItems', undefined);
    vehicle.setVariable('chestWeaponItemsShip', undefined);
    user.setComponentVariation(player, 5, 45, 0);
    player.notify("~g~Вы выгрузили сумку с оружием, отнесите её на склад");
  })
}, 2000)

class Chest {
  readonly pos: Vector3Mp;
  /** Максимальный допустимый объём склада в КГ */
  maxWeight: number;
  checkpoint: { delete: () => void; updatePos: (posnew: Vector3Mp) => void; updateName: (name: string) => void; };
  dimension: number;
  static get(id:number){
    return chests.get(id);
  }
  static getDescItem(model:string){
    return EquipDataItems.find(item => item.model == model);
  }
  readonly fraction: number;
  readonly rank: number;
  items: {
    model:string;
    amount:number;
    rank: number;
    personLimit: number;
  }[];
  name: string;
  readonly id: number;
  /** Карта с лимитами, ключ - IDигрока_ItemModel, значение - количество, сколько осталось */
  personLimit: Map<string,number>
  constructor(pos:Vector3Mp,name:string,fractionId:number,rank:number,itemss:{
    model:string;
    amount:number;
    rank: number;
    personLimit: number;
  }[], maxSize = 1000, id:number, dimension:number){
    this.personLimit = new Map();
    this.dimension = dimension
    this.id = id
    this.pos = pos
    this.name = name
    this.fraction = fractionId
    this.rank = rank ? rank : 1
    this.items = itemss;
    this.items.map(item => {
      const news = {
        model: item.model,
        amount: item.amount,
        rank: item.rank,
        personLimit: item.personLimit,
      }
      item = {...news}
    })
    this.maxWeight = maxSize;
    chests.set(this.id, this)
    this.checkpoint = methods.createDynamicCheckpoint(pos, "Нажмите ~g~E~w~ чтобы открыть "+name, player => {
      
      if(user.getAdminLevel(player) != 6 && this.fraction != user.getPlayerFraction(player)) return player.notify("~r~У вас нет доступа к данному складу")
      if(user.getAdminLevel(player) != 6 && this.rank > user.getPlayerFractionRank(player)) return player.notify("~r~У вас нет доступа к данному складу");
      player.chestId = this.id;
      let m = menu.new(player, this.name, "Действия");
      let weight = 0;
      this.items.forEach((item) => {
        weight+=(<number>items.getItemAmountById(methods.parseInt(item.model))*item.amount);
      });
      weight = methods.parseInt(weight/1000)
      m.newItem({
        name: "Объём склада "+((weight > this.maxWeight) ? "| ~r~Перегруз" : ""),
        desc: (weight > this.maxWeight) ? "~r~Вы не можете больше наполнять склад" : "",
        more: weight+"/"+this.maxWeight+" кг"
      })
      m.newItem({
        name: "Взять со склада",
        onpress: () => this.openChest(player)
      })
      m.newItem({
        name: "Сдать на склад",
        onpress: () => this.returnItemMenu(player)
      })
      if(user.isGos(player)){
        m.newItem({
          name: "Утилизировать конфискат",
          onpress: () => this.dropIllegal(player)
        })
      }
      if(this.fraction == 4 && (user.getPlayerFractionRank(player) > 11)){
        m.newItem({
          name: "Загрузить арсенал в транспорт",
          onpress: () => {this.loadInVeh(player)}
        })
        m.newItem({
          name: "Новый заказ",
          onpress: () => {this.newOrder(player)}
        })
      }
      if(player.getVariable("chestWeaponItems") || player.getVariable("chestWeaponItemsShip")){
        m.newItem({
          name: "Выгрузить сумку на склад",
          onpress: () => {this.loadInChest(player)}
        })
      }
      if(user.isLeader(player) || user.getAdminLevel(player) == 6){
        m.newItem({
          name: "Записи склада",
          onpress: () => {
            menu.close(player);
            user.setGui(player, "chestLog")
            
          }
        })
        m.newItem({
          name: "Настроить доступ к складу",
          onpress: () => {this.rankEdit(player)}
        })
        m.newItem({
          name: "Настроить лимиты предметов",
          desc: "Указанный лимит - персональный на одного человека",
          onpress: () => {
            user.accept(player, "Точно?").then(status => {
              if(!status) return;
              const edits = () => {
                let submenu = menu.new(player, "Предметы");
                this.items.map(item => {
                  submenu.newItem({
                    name: this.getDescItem(item.model).name,
                    more: "x"+item.personLimit,
                    onpress: () => {
                      menu.input(player, "Введите новое количество", item.personLimit.toString(), 11, "int").then(cnt => {
                        let count = methods.parseInt(cnt);
                        if(isNaN(count) || count < 0 || count > 10000) return player.notify("~r~Количество указанно не верно")
                        item.personLimit = count;
                        this.personLimit = new Map();
                        this.save();
                        edits();
                        player.notify("~g~Количество изменено")
                      })
                    }
                  })
                })
                submenu.open();
              }
              edits();
            })
          }
        })
      }
      if(user.isAdminNow(player, 6)){
        m.newItem({
          name: "Переименовать склад",
          onpress: () => {
            user.accept(player, "Точно?").then(status => {
              if(!status) return;
              menu.input(player, "Введите имя", this.name, 30).then(name => {
                if(!name) return;
                this.name = name;
                this.save();
                player.notify("Успешно")
              })
            })
          }
        })
        m.newItem({
          name: "Сбросить лимиты",
          onpress: () => {
            user.accept(player, "Точно?").then(status => {
              if(!status) return;
              this.personLimit = new Map();
            })
          }
        })
        m.newItem({
          name: "Редактор предметов",
          onpress: () => {
            user.accept(player, "Точно?").then(status => {
              if(!status) return;
              const edits = () => {
                let submenu = menu.new(player, "Предметы");
                submenu.newItem({
                  name: "Добавить новый предмет",
                  onpress: () => {
                    let names:string[] = []
                    EquipDataItems.map(itm => {
                      names.push(itm.name)
                    })
                    menu.selector(player, "Выберите предмет", names, true).then(id => {
                      const desc = EquipDataItems[id];
                      if(this.items.find(itm => itm.model == desc.model)){
                        edits();
                        player.notify("~r~Данный предмет уже добавлен в данное хранилище");
                      }
                    })
                  }
                })
                this.items.map((item, index) => {
                  submenu.newItem({
                    name: this.getDescItem(item.model).name,
                    more: "x"+item.amount,
                    onpress: () => {
                      menu.input(player, "Введите новое количество (Чтобы удалить - -1)", item.amount.toString(), 11, "int").then(cnt => {
                        if(cnt == -1){
                          this.items.splice(index, 1);
                          this.save();
                          edits();
                          return player.notify("~g~Предмет удалён")
                        }
                        let count = methods.parseInt(cnt);
                        if(isNaN(count) || count < 0 || count > 10000) return player.notify("~r~Количество указанно не верно")
                        item.amount = count;
                        this.save();
                        edits();
                        player.notify("~g~Количество изменено")
                      })
                    }
                  })
                })
                submenu.open();
              }
              edits();
            })
          }
        })
        m.newItem({
          name: "Сменить вес склада",
          onpress: () => {
            user.accept(player, "Точно?").then(status => {
              if(!status) return;
              menu.input(player, "Введите новый вес", this.maxWeight.toString(), 30).then(kgs => {
                const kg = methods.parseInt(kgs);
                if(isNaN(kg) || kg < 800 || kg > 40000) return player.notify("~r~Вес указан не верно");
                this.maxWeight = kg;
                this.save();
                player.notify("Успешно")
              })
            })
          }
        })
        m.newItem({
          name: "~r~Удалить склад",
          onpress: () => {
            user.accept(player, "Точно?").then(status => {
              if(!status) return;
              user.accept(player, "Вот прям точно?").then(status2 => {
                if(!status2) return;
                user.accept(player, "Вот прям точно?").then(status3 => {
                  if(!status3) return;
                  user.accept(player, "Серёга, ты уверен?").then(status4 => {
                    if(!status4) return;
                    this.delete()
                  })
                })
              })
            })
          }
        })
      }
      m.open();
    }, 1, this.dimension)
  }
  delete(){
    this.checkpoint.delete();
    chests.delete(this.id);
    weaponChest.destroy({ where: { id: this.id } })
  }
  rankEdit(player:PlayerMp){
    if(!user.isLeader(player) && user.getAdminLevel(player) != 6) return player.notify("~r~Доступно только лидеру");
    let m = menu.new(player, this.name, "Список доступного арсенала");
    let ranks:string[] = [];
    for(let q = 1; q < 13; q++) ranks.push(q+" уровень")
    this.items.forEach(itm => {
      let desc = Chest.getDescItem(itm.model);
      m.newItem({
        name: desc.name,
        type:"list",
        list: ranks,
        listSelected: itm.rank-1,
        onchange: (value) => [itm.rank = value+1, player.notify("Ранг успешно изменён"), this.save()]
      })
    })
    m.open()
  }
  save(){
    weaponChest.findOne({where: {id: this.id}}).then(item => {
      item.name = this.name;
      item.items = this.items;
      item.weight = this.maxWeight;
      item.dimension = this.dimension;
      item.save();
    })
    
  }
  getDescItem(name:string){
    return Chest.getDescItem(name);
  }
  newOrder(player:PlayerMp){
    let m = menu.new(player, this.name, "Список доступного арсенала");
    let itemsorder:Map<string,number> = new Map()
    EquipDataItems.map(item => {
      if(item.shiporder){
        itemsorder.set(item.model, 0);
        m.newItem({
          name: item.name,
          type: "range",
          rangeselect: [0, 1000],
          onchange: (value) => itemsorder.set(item.model, value)
        })
      }
    })
    m.newItem({
      name: "~g~Заказать",
      onpress: () => {
        let resitem:orderItem[] = [];
        let weight = 0;
        itemsorder.forEach((value, item) => {
          weight+=(<number>items.getItemAmountById(methods.parseInt(item))*value);
          resitem.push({
            model: item,
            amount: value
          })
        })
        if(weight > maxShipWeight*1000) return player.notify("~r~Заказ не может превышать вес в "+maxShipWeight+"кг. Вес вашего текущего заказа - "+methods.parseInt(weight/1000)+" кг.");
        newOrder(player, resitem);
        this.save();
      }
    })
    m.open()
  }
  loadInChest(player:PlayerMp){
    if(!player.getVariable("chestWeaponItems")) return player.notify("~r~У вас нет сумки в оружием");
    menu.close(player);
    const resitems: [string, number][] = JSON.parse(player.getVariable("chestWeaponItems"));
    resitems.map(([item,value]) => {
      if(!this.items.find(q => q.model == item)){
        this.items.push({model:item, amount:value, rank: methods.getLeaderRank(this.rank), personLimit: 1})
      } else {
        this.items.find(q => q.model == item).amount+=value;
      }
      methods.saveFractionLog(
        user.getRpName(player),
        'Разгрузил на склад '+this.name+' ' + this.getDescItem(item).name+" (x"+value+")",
        this.fraction
      );
      user.log(player, "ChestLog", 'Разгрузил на склад '+this.name+' ' + this.getDescItem(item).name+" (x"+value+")"+this.fraction)
    });
    player.setVariable("chestWeaponItems", undefined);
    player.notify("~g~Вы успешно разгрузили оружие");
    user.setComponentVariation(player, 5, 0, 0);
    this.save();
  }
  loadInVeh(player:PlayerMp){
    let m = menu.new(player, this.name, "Список доступного арсенала");
    let itemsorder:Map<string,number> = new Map()
    this.items.map(item => {
      itemsorder.set(item.model, 0);
      if(item.amount > 0){
        let desc = Chest.getDescItem(item.model);
        itemsorder.set(item.model, 0);
        m.newItem({
          name: desc.name+" (x"+item.amount+")",
          type: "range",
          rangeselect: [0, 1000],
          onchange: (value) => {
            itemsorder.set(item.model, value)
          }
        })
      }
    })
    m.newItem({
      name: "Загрузить",
      desc: "Загрузить указанный арсенал в ближайший транспорт",
      onpress: () => {
        let veh = methods.getNearestVehicleWithCoords(player.position, 10);
        if(!mp.vehicles.exists(veh)) return player.notify("~r~Поблизости транспорт не обнаружен");
        if(veh.getVariable('chestWeaponItemsShip')) return player.notify("~r~В транспорте уже есть погруженное оружие");
        if(veh.getVariable('chestWeaponItems')) return player.notify("~r~В транспорте уже есть погруженное оружие");
        if(acceptedVehs.indexOf(veh.model) == -1)  return player.notify("~r~В данном ТС нельзя перевозить оружие");
        let err = false;
        itemsorder.forEach((value,item) => {
          if(this.items.find(q => q.model == item).amount < value){
            err = true;
            player.notify("~r~"+this.getDescItem(item).name+" не хватает на складе")
          }
        })
        if(err) return;
        m.close();
        itemsorder.forEach((value,item) => {
          this.items.find(q => q.model == item).amount-=value;
          methods.saveFractionLog(
            user.getRpName(player),
            'Выгрузил со склада '+this.name+' в ТС '+veh.numberPlate+' ' + this.getDescItem(item).name+" (x"+value+")",
            this.fraction
          );
          user.log(player, "ChestLog", 'Выгрузил со склада '+this.name+' в ТС '+veh.numberPlate+' ' + this.getDescItem(item).name+" (x"+value+")"+this.fraction)
        });
        const resitems = [...itemsorder];
        veh.setVariable('chestWeaponItems', JSON.stringify(resitems));
        player.notify("~g~Вы погрузили оружие в ТС")
        this.save();
      }
    })
    m.open()
  }
  openChest(player:PlayerMp, reopen = false){
    menu.close(player)
    if(this.fraction != user.getPlayerFraction(player)) return player.notify("~r~У вас нет доступа к данному складу")
    if(this.rank > user.getPlayerFractionRank(player)) return player.notify("~r~У вас нет доступа к данному складу");
    if(!reopen)this.createPersonLimit(player), user.setGui(player, "chest_equip")
    mp.events.triggerBrowser(player, "server:openChest", this.name, this.items, user.getPlayerFractionRank(player))
  }
  returnItemMenu(player:PlayerMp){
    let weight = 0;
    this.items.forEach((item) => {
      weight+=(<number>items.getItemAmountById(methods.parseInt(item.model))*item.amount);
    });
    if(weight/1000 > this.maxWeight) return player.notify("~r~Максимальный объём склада превышен")
    menu.close(player)
    let m = menu.new(player, this.name, "Список доступных предметов");
      inventory.getItemListData(1, user.getId(player)).map(item => {
        let chestItem = this.items.find(itm => item.item_id.toString() == itm.model);
        if(chestItem){
          let desc = this.getDescItem(chestItem.model);
          m.newItem({
            name: desc.name,
            onpress: () => {
              let weight = 0;
              this.items.forEach((item) => {
                weight+=(<number>items.getItemAmountById(methods.parseInt(item.model))*item.amount);
              });
              if(weight/1000 > this.maxWeight) return player.notify("~r~Максимальный объём склада превышен")
              inventory.deleteItem(item.id);
              chestItem.amount++;
              methods.saveFractionLog(
                user.getRpName(player),
                'Положил на склад '+this.name+' ' + desc.name,
                this.fraction
              );
              user.log(player, "ChestLog", 'Положил на склад '+this.name+' ' + desc.name+" "+this.fraction)
              inventory.updateAmount(player, user.getId(player), 1);
              this.returnItemMenu(player);
              this.save();
            }
          })
        }
      })
      m.open();
  }
  dropIllegal(player:PlayerMp){
    let m = menu.new(player, "Утилизация", "Список доступных предметов");
      inventory.getItemListData(1, user.getId(player)).map(item => {
        let chestItem = illegalList.find(itm => item.item_id >= itm.range[0] && item.item_id <= itm.range[1]);
        if(chestItem){
          let desc = items.getItemNameById(item.item_id);
          m.newItem({
            name: desc,
            onpress: () => {
              inventory.deleteItem(item.id);
              methods.saveFractionLog(
                user.getRpName(player),
                'Утилизировал на складе '+this.name+' ' + desc,
                this.fraction
              );
              user.log(player, "ChestLog", 'Утилизировал на складе '+this.name+' ' + desc+" "+this.fraction)
              inventory.updateAmount(player, user.getId(player), 1);
              this.dropIllegal(player);
              if(chestItem.cost > 0){
                user.addCashMoney(player, chestItem.cost)
                player.notify("~g~Получено за утилизацию - "+chestItem.cost+"$")
              }
              this.save();
            }
          })
        }
      })
      m.open();
  }
  giveItem(player:PlayerMp, model:string):any{
    const item = this.items.find(item => item.model == model)
    const userid = user.getId(player)
    if(!item) return player.notify("~r~На складе нет такого предмета");
    let desc = this.getDescItem(item.model)
    if(!desc) return player.notify("~r~У нас такого предмета нет");
    if(item.amount == 0) return player.notify(`~r~${desc.name} закончился на складе`);
    if(item.rank > user.getPlayerFractionRank(player)) return player.notify(`~r~${desc.name} доступен только с ранга ${item.rank}`);
    this.createPersonLimit(player)
    const limit = this.personLimit.get(userid+"_"+item.model);
    if(limit == 0) return player.notify(`~r~Вы больше не можете брать ${desc.name}`);
    const isweapon = item.model.toLowerCase().indexOf("weapon") == 0
    
    let amount = inventory.getInvAmount(player, user.getId(player), 1);
    let itemid = methods.parseInt(item.model);
    if(itemid == 252){
      player.armour = 100;
      player.notify(`~g~Вы экипировали бронежилет`)
    } else if(isweapon) {
      user.giveWeaponByHash(player, mp.joaat(item.model.toUpperCase()), desc.ammo);
      player.notify(`~g~Вы получили ${desc.name} (x1) и патроны (x${desc.ammo})`)
    } else {
      if (amount + items.getItemAmountById(itemid) > inventory.maxAmount(1, user.getId(player))) {
        player.notify('~r~Инвентарь заполнен');
        return;
      }
      inventory.addItem(player, itemid, 1, 1, userid, desc.ammo, -1, -1, -1)
      player.notify(`~g~Вы получили ${desc.name} (x${desc.ammo})`)
    }
    if(limit > 0) this.personLimit.set(userid+"_"+item.model, limit - 1);
    item.amount--;
    inventory.updateAmount(player, user.getId(player), 1);
    setTimeout(() => {
      this.openChest(player, true);
    }, 100)
    methods.saveFractionLog(
      user.getRpName(player),
      'Взял ' + desc.name + ' со склада '+this.name,
      this.fraction
    );
    user.log(player, "ChestLog", 'Взял ' + desc.name + ' со склада '+this.name+' '+this.fraction)
    this.save();
    if(limit != -1 && user.isLeader(player)) return this.personLimit.set(userid+"_"+item.model, this.personLimit.get(userid+"_"+item.model) + 1);
    if(limit == -1) return;
    setTimeout(() => this.personLimit.set(userid+"_"+item.model, this.personLimit.get(userid+"_"+item.model) + 1), personLimitCountDownTimer*60000)
  }
  createPersonLimit(player:PlayerMp){
  const userid = user.getId(player)
  this.items.map(item => {
    if(!this.personLimit.has(userid+"_"+item.model)){
      this.personLimit.set(userid+"_"+item.model, item.personLimit ? item.personLimit : -1);
    }
  })
}
}



function grab(player:PlayerMp){
  return;
  let vehicle = player.vehicle
  if(!vehicle) return player.notify("~r~Вы должны быть в транспорте");
  if(!vehicle.getVariable('chestWeaponItemsShip')) return player.notify("~r~В транспорте нет оружия");
  let m = menu.new(player, "Содержимое");
  let resitems: [string, number][] = JSON.parse(vehicle.getVariable('chestWeaponItemsShip'));
  let itemsorder:Map<string,number> = new Map()
  resitems.map(([model,amount]) => {
    let desc = this.getDescItem(model);
    let ammountList:string[] = [];
    for(let q = 0; q < (amount + 1); q++) ammountList.push(q+" шт.")
    m.newItem({
      name: desc.name,
      type:"list",
      list: ammountList,
      onchange: (value) => itemsorder.set(model, value)
    })
  })
  m.newItem({
    name: "~y~Выгрузить",
    onpress: () => {
      vehicle = player.vehicle
      if(!vehicle) return player.notify("~r~Вы должны быть в транспорте");
      if(!vehicle.getVariable('chestWeaponItemsShip')) return player.notify("~r~В транспорте нет оружия");
      resitems = JSON.parse(vehicle.getVariable('chestWeaponItemsShip'));
      let err = false;
      itemsorder.forEach((amount, model) => {
        let q = resitems.find(itm => itm[0] == model)
        if(q[1] < amount){
          err = true;
        }
      })
      if(err){
        player.notify("~r~Вы пытаетесь выгрузить то, чего уже нет в ТС");
      } else {
        itemsorder.forEach((amount, model) => {
          let desc = Chest.getDescItem(model);
            if (amount * <number>items.getItemAmountById(methods.parseInt(model)) > 55000) {
              player.notify('~r~Инвентарь заполнен');
              return;
            }
            const isweapon = desc.model.toLowerCase().indexOf("weapon") == 0
            inventory.addItem(player, methods.parseInt(model), isweapon ? amount : 1, 1, user.getId(player), !isweapon ? amount : 1, -1, -1, -1)
            player.notify(`~g~Вы получили ${desc.name} (x${amount})`)
            resitems.find(itm => itm[0] == model)[1]-=amount;
        })
        let cnt = 0;
        resitems.forEach(q => {
          cnt+=q[1];
        })
        if(cnt == 0){
          vehicle.setVariable('chestWeaponItemsShip', undefined)
        } else {
          vehicle.setVariable('chestWeaponItemsShip', JSON.stringify(resitems))
        }
      }
      grab(player)
    }
  })
  m.open();
}




// let chestsa = [
//   [451.98, -980.41, 29.69, "Sapd", 2, 4000],
//   [-437.330, 6001.264, 30.716, "Sheriff", 7, 1000],
//   [1842.06, 3691.33, 33.26704, "Sheriff", 7, 1000],
//   [129.3821, -730.57, 257.1521, "FIB", 3, 2500],
//   [-2420.11, 3330.99, 31.82, "Армии", 4, 12000],
// ]

export const baseItems = [
  {
    model: "59",
    amount: 10, 
    rank: 1, 
    personLimit: 1
  },
  {
    model: "66",
    amount: 10, 
    rank: 1, 
    personLimit: 1
  },
  {
    model: "82",
    amount: 15, 
    rank: 1, 
    personLimit: 1
  },
  {
    model: "78",
    amount: 15, 
    rank: 1, 
    personLimit: 1
  },
  {
    model: "90",
    amount: 15, 
    rank: 2, 
    personLimit: 1
  },
  {
    model: "103",
    amount: 15, 
    rank: 3, 
    personLimit: 1
  },
  {
    model: "110",
    amount: 15, 
    rank: 4, 
    personLimit: 1
  },
  {
    model: "119",
    amount: 15, 
    rank: 5, 
    personLimit: 1
  },
  {
    model: "146",
    amount: 10, 
    rank: 4, 
    personLimit: 1
  },
  {
    model: "153",
    amount: 20, 
    rank: 2, 
    personLimit: 1
  },
  {
    model: "27",
    amount: 20, 
    rank: 2, 
    personLimit: 1
  },
  {
    model: "28",
    amount: 20, 
    rank: 2, 
    personLimit: 1
  },
  {
    model: "30",
    amount: 20, 
    rank: 3, 
    personLimit: 1
  },
  {
    model: "29",
    amount: 20, 
    rank: 3, 
    personLimit: 1
  },
  {
    model: "252",
    amount: 30, 
    rank: 1, 
    personLimit: 1
  },
  {
    model: "199",
    amount: 30, 
    rank: 1, 
    personLimit: 10
  },
  {
    model: "201",
    amount: 20, 
    rank: 1, 
    personLimit: 10
  },
  {
    model: "202",
    amount: 20, 
    rank: 1, 
    personLimit: 10
  },
  {
    model: "40",
    amount: 50, 
    rank: 1, 
    personLimit: 3
  },
  {
    model: "278",
    amount: 20, 
    rank: 1, 
    personLimit: 2
  },
]

export const newChest = (name:string,fractionId:number,pos:Vector3Mp,size:number,items:any[],id:number,dimension:number) => {
  new Chest(pos, name, fractionId, null, items, size, id, dimension);
}


// chestsa.map(item => {
//   newChest(<string>item[3], <number>item[4], new mp.Vector3(<number> item[0], <number> item[1], <number> item[2]), <number>item[5], baseItems)
// })
