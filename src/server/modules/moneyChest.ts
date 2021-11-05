import { methods, DynamicCheckpoint } from "./methods";
import { menu } from "./menu";
import { user } from "../user";
import { moneyChestEntity } from "./entity/moneyChest";

export let moneyChests:Map<number,moneyChest> = new Map();

export const loadMoneyChests = () => {
  moneyChestEntity.findAll().then(itms => {
    itms.forEach(item => {
      new moneyChest(item.id, item.position, item.money, item.fraction, item.log, item.dimension)
    })
  })
}


export class moneyChest {
  id: number;
  positiondata: Vector3Mp;
  money: number;
  fraction: number;
  log:{who:string;text:string}[];
  dimensiondata: number;
  checkpoint: DynamicCheckpoint;
  save(){
    moneyChestEntity.update({
      money:this.money,
      position:this.position,
      dimension: this.dimension,
      fraction:this.fraction,
      log:this.log.slice(1).slice(-300),
    },{where: {id: this.id}})
  }
  logWrite(who:string,text:string){
    this.log.push({who,text});
    this.save();
  }
  constructor(id:number, position:Vector3Mp, money:number, fraction:number, log:{who:string;text:string}[],dimension:number){
    this.id = id;
    this.position = position;
    this.money = money;
    this.fraction = fraction;
    this.log = log;
    this.dimension = dimension;
    moneyChests.set(this.id, this);
    this.checkpoint = methods.createDynamicCheckpoint(this.position, "Нажмите ~g~Е~s~ чтобы открыть меню", player => {
      if(user.getPlayerFraction(player) != this.fraction && !user.isAdminNow(player, 4)) return player.notify("~r~Доступно только членам "+methods.getFractionName(this.fraction));
      let m = menu.new(player, "Сейф в деньгами");

      m.newItem({
        name: "Баланс",
        more: this.money+"$",
        onpress: () => {
          menu.input(player, "Сколько положить в сейф? (1 - "+user.getCashMoney(player)+")", "", 10, "int").then(res => {
            if(!res) return;
            if(isNaN(res) || res < 0 || res > user.getCashMoney(player)) return player.notify("~r~Сумма указана не верно");
            user.removeCashMoney(player, res);
            this.money+=res;
            player.notify("~g~Баланс успешно пополнен");
            this.logWrite(user.getRpName(player)+" ("+user.getId(player)+")", "Положил "+res+"$")
            menu.close(player)
          })
        }
      })

      if(player.bankgrabmoney){
        m.newItem({
          name: "Разгрузить сумку",
          more: player.bankgrabmoney+"$",
          onpress: () => {
            this.money+=player.bankgrabmoney;
            this.logWrite(user.getRpName(player)+" ("+user.getId(player)+")", "Разгрузил сумку на "+player.bankgrabmoney+"$")
            player.notify("~g~Сумка разгружена");
            player.bankgrabmoney = 0;
            user.checkComponents(player);
            menu.close(player)
          }
        })
      }

      if(user.isLeader(player)){
        m.newItem({
          name: "Снять средства",
          more: this.money+"$",
          onpress: () => {
            menu.input(player, "Сколько снять? (1 - "+this.money+")", "", 10, "int").then(res => {
              if(!res) return;
              if(isNaN(res) || res < 0 || res > this.money) return player.notify("~r~Сумма указана не верно");
              user.addCashMoney(player, res);
              this.money-=res;
              player.notify("~g~Баланс успешно пополнен");
              this.logWrite(user.getRpName(player)+" ("+user.getId(player)+")", "Взял "+res+"$")
              menu.close(player)
            })
          }
        })
      }
      if(user.isLeader(player) || user.isAdminNow(player, 6)){
        m.newItem({
          name: "Записи сейфа",
          onpress: () => {
            menu.selector(player, "Записи", this.log.map(itm => {
              return `${itm.who}: ${itm.text}`
            }));
          }
        })
      }

      if(user.isAdminNow(player, 6)){
        m.newItem({
          name: "~r~Удалить сейф",
          onpress: () => {
            user.accept(player, "Точно удалить?").then(status => {
              if(!status) return;
              moneyChestEntity.destroy({where: {id: this.id}}).then(() => {
                this.checkpoint.delete();
                moneyChests.delete(this.id);
                player.notify("~g~Успешно");
              })
            })
          }
        })
      }

      m.open();
    }, 1, this.dimension)
  }
  get position() {
    return this.positiondata
  }
  set position(value: Vector3Mp) {
    this.positiondata = value
    if (this.checkpoint) this.checkpoint.updatePos(value)
  }
  get dimension() {
    return this.dimensiondata
  }
  set dimension(value: number) {
    this.dimensiondata = value
    if (this.checkpoint) this.checkpoint.updateDimension(value)
  }
}

// mp.events.add("playerDeath", (player:PlayerMp) => {
//   if(player.bankgrabmoney){
//     player.bankgrabmoney = 0;
//     user.setComponentVariation(player, 5, 0, 0);
//     player.notify("~r~Вы потеряли сумку с деньгами");
//   }
// })

mp.events.add("playerArrested", (player:PlayerMp) => {
  if(player.bankgrabmoney){
    player.bankgrabmoney = 0;
    user.setComponentVariation(player, 5, 0, 0);
    player.notify("~r~Вы потеряли сумку с деньгами");
  }
})