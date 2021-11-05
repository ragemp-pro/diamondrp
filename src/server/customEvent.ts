/// <reference path="../declaration/server.ts" />

import { MainEvent } from '../util/event';
import { testJSON } from '../util/methods';

const formatArgs = (args: any[]): any[] => {
  return args.map((arg) => {
    if (typeof arg == 'string') {
      if (testJSON(arg)) {
        return JSON.parse(arg);
      }
    }
    return arg;
  });
}
type EventType = "all" | "client" | "CEF"
class ServerEventClass extends MainEvent {
  constructor(){
    super();
  }
  async get(name: string, type: EventType = "all", ...args: any[]): Promise<any> {
    try {
      let fncs: RegisterCallback[] = [];
      this.container.forEach((itm) => {
        let access = true;
        if (itm.name != name) access = false;
        if(type != "all" && itm.type != "all" && type != itm.type) access = false;
        if(access) fncs.push(itm.func);
      });
      const values: any = [];
      for (let q in fncs) {
        let func = fncs[q];
        values.push(await func.bind(func.prototype)(...args));
      }
      if (!values.length) {
        return Promise.reject(new Error(`Remote Server Event \`${name}\` not found`));
      } else if (values.length == 1) {
        return values[0];
      } else {
        return values;
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }

  registerClient(name: string, func: RegisterCallback){
    return this.register(name, func, "client")
  }
  registerCEF(name: string, func: RegisterCallback){
    return this.register(name, func, "CEF")
  }

  register(name: string, func: RegisterCallback, type:EventType="all"): RegisterResponse {
    console.log(`REGISTER Remote Server Event \`${name}\` ${type}`);
    const id = this.eventID;
    const self = {
      destroy: () => {
        this.container.delete(id);
      },
      eventId: id,
      eventName: name,
      env: 'server',
      type
    };

    Object.defineProperties(self, {
      eventName: {
        writable: false,
      },
      eventId: {
        writable: false,
      },
      destroy: {
        writable: false,
      },
      env: {
        writable: false,
      },
      type: {
        writable: false,
      },
    });

    this.container.set(id, { id, name, func: func.bind(self), type });
    this.eventID++;
    return { id, destroy: self.destroy, name };
  }

  triggerClient(player: PlayerMp, name: string, ...args: any[]) {
    player.call('__customTriggerClient__', [name, [...args]]);
  }

  triggerBrowser(player: PlayerMp, name: string, ...args: any[]) {
    player.call('__customTriggerCef__', [name, [...args]]);
  }

  callClient(player: PlayerMp, name: string, ...args: any[]): Promise<any> {
    this.eventRemoteRequestId+=1;
    const id = this.eventRemoteRequestId;
    return new Promise((resolve, reject) => {
      player.call('__customCallClient__', [name, id, ...args]);
      this.eventRemoteRequestData.set(id, resolve);
    });
  }

  callBrowser(player: PlayerMp, name: string, ...args: any[]): Promise<any> {
    const id = this.eventRemoteRequestId++;
    return new Promise((resolve, reject) => {
      player.call('__customCallCefFromServer', [name, id, ...args]);
      this.eventRemoteRequestData.set(id, resolve);
    });
  }
}

export let ServerEvent = new ServerEventClass();

mp.events.add('__customRemoteAnswer__', (player: PlayerMp, id: number, result: any) => {
  let f = ServerEvent.eventRemoteRequestData.get(id);
  if (testJSON(result)) {
    result = JSON.parse(result);
  }
  if(typeof f == "function") f(result);
  ServerEvent.eventRemoteRequestData.delete(id);
});

mp.events.add('__customTriggerServer__', async (player: PlayerMp, type: EventType, name: string, ...args: any[]) => {
  args = formatArgs(args);
  await ServerEvent.get(name, type, player, ...args);
});

mp.events.add(
  '__customCallServer__',
  (player: PlayerMp, type: EventType, name: string, id: number, args: any[]) => {
    ServerEvent.get(name, type, player, args).then(result => {
      if(mp.players.exists(player))
      player.call('__customRemoteAnswer__', [id, result]);
    }).catch(err => {
      if (mp.players.exists(player))
        console.error(`[${player.ip}] call not exists event "${name}" from client`)

      console.error(err)
      
    });
  }
);

mp.events.add(
  '__customCallServerFromClientToCef__',
  (player: PlayerMp, name: string, id: number, ...args: any[]) => {
    ServerEvent.get(name, "CEF", player, ...args).then(result => {
      if(mp.players.exists(player))
      player.call('__customRemoteAnswerToCef__', [id, result]);
    }).catch(err => {
      if (mp.players.exists(player))
        console.error(`[${player.ip}] call not exists event "${name}" from CEF`)

      console.error(err)
    });

  }
);

Object.defineProperties(mp, {
  events: {
    writable: true,
  },
});

mp.events.container = ServerEvent.container;
mp.events.eventRemoteRequestId = ServerEvent.eventRemoteRequestId;
mp.events.eventRemoteRequestData = ServerEvent.eventRemoteRequestData;
mp.events.eventID = ServerEvent.eventID;
mp.events.containerLocal = ServerEvent.containerLocal;
mp.events.register = ServerEvent.register.bind(mp.events);
mp.events.registerLocal = ServerEvent.registerLocal.bind(mp.events);
mp.events.triggerLocal = ServerEvent.triggerLocal.bind(mp.events);
mp.events.triggerClient = ServerEvent.triggerClient.bind(mp.events);
mp.events.triggerBrowser = ServerEvent.triggerBrowser.bind(mp.events);
mp.events.callLocal = ServerEvent.callLocal.bind(mp.events);
mp.events.callClient = ServerEvent.callClient.bind(mp.events);
mp.events.callBrowser = ServerEvent.callBrowser.bind(mp.events);
//mp.events.eventRemoteRequestId = ServerEvent.eventRemoteRequestId;
