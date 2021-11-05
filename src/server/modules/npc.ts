/// <reference path="../../declaration/server.ts" />

import { user } from "../user";
import { methods } from "./methods";




export class npcDialog implements clientNpcDialog {
  readonly id: number;
  /** Имя бота */
  name: string; 
  /** Роль бота */
  role: string;
  /** Модель NPC */
  model:string;
  /** Позиция NPC */
  position:Vector3Mp;
  /** Поворот NPC */
  heading:number;
  /** Радиус взаимодействия с  NPC */
  radius:number;
  /** Измерение */
  dimension:number;
  constructor(name:string,role:string,position:Vector3Mp,heading:number,model:string,radius:number = 1,dimension:number = 0, onpress:(player:PlayerMp)=>void){
    const id = ids++;
    this.id = id;
    this.name = name;
    this.role = role;
    // this.asks = [];
    this.position = position;
    this.model = model;
    this.heading = heading;
    this.radius = radius ? radius : 1;
    this.dimension = dimension ? dimension : 0;
    npc_dialog.container.set(this.id, this);
    mp.labels.new(this.name, new mp.Vector3(this.position.x,this.position.y, this.position.z + 1.2), {
      // color: 
      dimension: this.dimension,
      drawDistance: 20,
      los: true,
      font: 1
    })
    mp.players.forEach(player => player.call("dialog:sendnew:npc", [{dimension:this.dimension,id:this.id,model:this.model,heading:this.heading,position:this.position,radius:this.radius}]));
    methods.createDynamicCheckpoint(position, "Нажмите ~g~E~w~ чтобы начать диалог с "+this.name, (player) => {
      player.currentDialog = this;
      onpress(player)
    }, radius, 0, [0,0,0,0])
  }

  delete(){
    mp.players.forEach(player => player.call("dialog:delete:npc", [this.id]));
    npc_dialog.container.delete(this.id);
  }

}


mp.events.add('playerJoin', (player:PlayerMp) => {
  player.call("dialog:sendlist:npc", [[...npc_dialog.container].map(([_,item]) => {return {dimension:item.dimension,id:item.id,model:item.model,heading:item.heading,position:item.position,radius:item.radius}})])
});

mp.events.add("playerExitColshape", (player:PlayerMp, shape:ColshapeMp) => {
  user.removeHelpKey(player);
  player.currentDialog = null;
});

/** ИД для генерации уникального диалога */
let ids = 1;


let asksids = 0;
let asks:Map<number,(answer:number)=>void> = new Map();

export const npc = {
  createPed: (pos:Vector3Mp, heading:number, model:HashOrString, freeze:boolean = false, invincible:boolean = false, dimension = 0) => {
    let controller:PlayerMp;
    if(!freeze){
      let target = user.getNearestPlayerByCoord(pos, 150, dimension);
      if(target) controller = target;
      else return;
    }
    let ped = mp.peds.new(model, pos, {
      heading: heading,
      frozen: freeze,
      lockController: false,
      dynamic: !freeze,
      invincible,
      dimension: dimension
    })
    if (!freeze) ped.controller = controller;
    return ped;
  },
  // exist: mp.peds ? mp.peds.exists : () => {},
  putIntoVehicle: (ped: PedMp, veh: VehicleMp, seat: number = -1, timeout: number = 5000, speed: putIntoVehicleSpeed = 1.0, flag: putIntoVehicleFlag = 1) => {
    if (!ped.controller) return;
    if (!mp.players.exists(ped.controller)) return;
    ped.controller.call('seatPedIntoVehicle', [ped.id, veh.id, seat, timeout, speed, flag])
  },
  driveWaypoint: (ped: PedMp, x: number, y: number, z: number, speed: number = 20 / 2.2, driveMode: number = 786603, stopRange: number = 20.0) => {
    if (!ped.controller) return;
    if (!mp.players.exists(ped.controller)) return;
    ped.controller.call('pedDriveWaypoint', [ped.id, x, y, z, speed, driveMode, stopRange])
  },
  clearTask: (ped: PedMp, immediately = false) => {
    if (!ped.controller) return;
    if (!mp.players.exists(ped.controller)) return;
    ped.controller.call('clearPedTask', [ped.id, immediately])
  }
}

export const npc_dialog = {
  /** Контейнер со всеми диалогами */
  container: <Map<number, npcDialog>>new Map(),
  /** Поиск диалога */
  get: (id:number) => {
    let res = [...npc_dialog.container].find(([index,item]) => item.id == id);
    if(!res) return null;
    else return res[1];
  },
  new: (name:string,role:string,position:Vector3Mp,heading:number,model:string,onpress:(player:PlayerMp)=>void,radius?:number,dimension:number = 0) => {
    return new npcDialog(name,role,position,heading,model,radius,dimension,onpress);
  },
  close: (player:PlayerMp) => {
    user.setGui(player, null);
  },
  open: (player:PlayerMp, ask:string, answers:string[]):Promise<number> => {
    return new Promise((resolve, reject) => {
      if(!player.currentDialog) return user.setGui(player, null);
      asksids++;
      const id = ids;
      user.setGui(player, "npc");
      mp.events.triggerBrowser(player, "dialog:open", player.currentDialog.name, player.currentDialog.role, ask, answers, id);
      asks.set(id, resolve);
    })
  }
}

let shopElectro:[Vector3Mp,number][] = [
  [new mp.Vector3(-660.317, -857.948, 24.490), 284.662],
  [new mp.Vector3(1135.284, -469.594, 66.718), 178.113],
];

setTimeout(() => {
  shopElectro.forEach(([pos,heading]) => {
    npc_dialog.new("Майкл", "Продавец электроники", pos, heading, "ig_beverly", (player) => {
      npc_dialog.open(player, "На сервере игровое время отличается от настоящего. За одни реальные сутки проходит 7 игровых, поэтому не удивляйтесь частой смене дня и ночи. Имея часы, в правом нижнем углу показывается игровое время и температура. На сервере сменяются времена года, так что одевайтесь по погоде.", ["Закрыть"]).then(() => {
        npc_dialog.close(player);
      });
    })
  })
}, 1000)

mp.events.register("dialog:answer", (player:PlayerMp, id:number, answerId:number) => {
  if(!asks.has(id)) return npc_dialog.close(player);
  asks.get(id)(answerId);
})