import { methods, DynamicCheckpoint } from "./methods";

import { PlayerCustomizationObject } from "../user";
import { menu } from "./menu";
import { user } from "../user";
import { garderobEntity } from "./entity/garderob";
import { fractionUtil } from "../../util/fractions";

export interface dressItem {
  target: "male"|"female";
  rank: number;
  name: string;
  config: PlayerCustomizationObject
}


export const loadGarderobs = () => {
  garderobEntity.findAll().then(datas => {
    datas.forEach(item => {
      new dressRoom(item.id, item.fraction, item.position, item.dresses, item.dimension)
    })
  })
}


export class dressRoom {
  id: number;
  fraction: number;
  positiondata: Vector3Mp;
  dresses: dressItem[];
  dimensiondata: number;
  checkpoint: DynamicCheckpoint;
  save(){
    garderobEntity.update({
      fraction: this.fraction,
      position: this.position,
      dresses: this.dresses,
    }, {where: {id:this.id}});
  }
  delete(player:PlayerMp){
    if(!user.isAdminNow(player, 6)) return player.notify("~r~Вы кто такой?");
    user.accept(player, "Вы уверены?", "~r~Удалить", "~g~Не удалять").then(status => {
      if(!status) return;
      garderobEntity.destroy({where: {id:this.id}}).then(() => {
        this.checkpoint.delete();
        garderobPool.delete(this.id);
        player.notify("~g~Больше данного гардероба не существует");
      })      
    })
  }
  constructor(id:number,fraction:number,position:Vector3Mp,dresses:dressItem[],dimension:number){
    this.id = id;
    this.fraction = fraction;
    this.position = position;
    this.dimension = dimension;
    this.dresses = dresses;
    this.checkpoint = methods.createDynamicCheckpoint(this.position, "Нажмите ~g~E~w~ чтобы открыть гардероб", player => {
      if(user.getPlayerFraction(player) != this.fraction && !user.isAdminNow(player, 2)) return player.notify("~r~Доступно только сотрудникам "+methods.getFractionName(this.fraction));
      let m = menu.new(player, "Гардероб | "+methods.getFractionName(this.fraction), "Список");

      this.dresses.forEach((item, index) => {
        if((user.getSex(player) == 0 && item.target == "male") || (user.getSex(player) == 1 && item.target == "female")){
          m.newItem({
            name: item.name,
            type: "list",
            list: ["Одеть", "Сменить ранг", "Удалить"],
            onpress: (mn) => {
              if(mn.listSelected == 0){
                if(item.rank > user.getPlayerFractionRank(player)) return player.notify("~r~Вы не можете одеть данную форму")
                if(player.weaponsAll.length > 0) return player.notify(`~r~Снимите оружие с экипировки`)
                user.applyCustomization(player, item.config);
                player.notify("~g~Вы переоделись");
              } else if(mn.listSelected == 1){
                if(!user.isSubLeader(player) && !user.isAdminNow(player, 2)) return player.notify("~r~У вас нет доступа к редактированию формы");
                let list:string[] = [];
                for(let q = 1; q < 15; q++){
                  list.push(methods.getFractionRankName(this.fraction, q) ? methods.getFractionRankName(this.fraction, q) : "Ранг "+q)
                }
                menu.selector(player, "Уровень доступа", fractionUtil.getFractionRanks(this.fraction), true).then(rankid => {
                  if (typeof rankid != "number") return;
                  item.rank = rankid + 1
                  player.notify("~g~Форма изменена");
                  this.save();
                })
              } else {
                if (!user.isAdminNow(player, 2) && !methods.isTestServer()) return player.notify("~r~У вас нет доступа к удалению формы");
                user.accept(player, "Вы уверены?").then(status => {
                  this.dresses.splice(index, 1);
                  player.notify("~g~Форма удалена");
                  this.save();
                })
              }
            }
          })
        }
      })

      m.newItem({
        name: "Снять форму",
        onpress: async () => {
          if(player.weaponsAll.length > 0) return player.notify(`~r~Снимите оружие с экипировки`)
          user.resetCustomization(player);
          player.notify("~g~Вы переоделись");
        }
      })

      if(user.isAdminNow(player, 2) || methods.isTestServer()){
        m.newItem({
          name: "Новый комплект одежды ("+((user.getSex(player) == 0) ? "Мужская" : "Женская") +")",
          onpress: () => {
            user.generateCustomizationSettings(player).then(config => {
              if(!config) return;
              menu.input(player, "Введите название одежды", "", 30).then(name => {
                if(!name) return;
                if(this.dresses.find(itm => (itm.name == name && (((user.getSex(player) == 0) ? "male" : "female") == itm.target)))) return player.notify("~r~Комплект одежды с таким названием уже существует");
                let list:string[] = [];
                for(let q = 1; q < 15; q++){
                  list.push(methods.getFractionRankName(this.fraction, q) ? methods.getFractionRankName(this.fraction, q) : "Ранг "+q)
                }
                menu.selector(player, "Уровень доступа", list).then(rankname => {
                  if(!rankname) return;
                  const rank = (list.indexOf(rankname) - 1);
                  this.dresses.push({
                    rank, name, config, target: ((user.getSex(player) == 0) ? "male" : "female")
                  })
                  player.notify("~g~Новая форма успешно добавлена");
                  this.save();
                })
              })
            });
          }
        })
        m.newItem({
          name: "Сохранить мой комплект одежды ("+((user.getSex(player) == 0) ? "Мужская" : "Женская") +")",
          onpress: () => {
            let config = user.getCustomization(player);
            if(!config) return;
            menu.input(player, "Введите название одежды", "", 30).then(name => {
              if(!name) return;
              if(this.dresses.find(itm => itm.name == name)) return player.notify("~r~Комплект одежды с таким названием уже существует");
              let list:string[] = [];
              for(let q = 1; q < 15; q++){
                list.push(methods.getFractionRankName(this.fraction, q) ? methods.getFractionRankName(this.fraction, q) : "Ранг "+q)
              }
              menu.selector(player, "Уровень доступа", list).then(rankname => {
                if(!rankname) return;
                const rank = (list.indexOf(rankname) - 1);
                this.dresses.push({
                  rank, name, config, target: ((user.getSex(player) == 0) ? "male" : "female")
                })
                player.notify("~g~Новая форма успешно добавлена");
                this.save();
              })
            })
          }
        })
      }


      if(user.isAdminNow(player, 6)){
        m.newItem({
          name: "~r~Удалить гардероб",
          onpress: () => {
            this.delete(player);
          }
        })
      }

      m.open();
    }, 1, this.dimension)
    garderobPool.set(this.id, this);
  }
  get position() {
    return this.positiondata
  }
  set position(value: Vector3Mp) {
    this.positiondata = value
    if(this.checkpoint) this.checkpoint.updatePos(value)
  }
  get dimension() {
    return this.dimensiondata
  }
  set dimension(value: number) {
    this.dimensiondata = value
    if (this.checkpoint) this.checkpoint.updateDimension(value)
  }
}


export const garderobPool:Map<number, dressRoom> = new Map();

//methods.createDynamicCheckpoint()