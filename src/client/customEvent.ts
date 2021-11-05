/// <reference path="../declaration/client.ts" />

import { MainEvent } from '../util/event';
import { testJSON } from '../util/methods';
import { methods } from './modules/methods';

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

export class ClientEventClass extends MainEvent {
  constructor(){
    super();
  }
  async get(name: string, ...args: any[]):Promise<any> {
    try {
      let fncs: RegisterCallback[] = [];
      this.container.forEach((itm) => {
        if (itm.name == name) fncs.push(itm.func)
      });
      const values: any = [];
      for (let q in fncs) {
        let func = fncs[q];
        values.push(await func.bind(func.prototype)(...args));
      }
      if (!values.length) {
        return Promise.reject(new Error(`Remote Client Event \`${name}\` not found`));
      } else if (values.length == 1) {
        return values[0];
      } else {
        return values;
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
  register(name: string, func: RegisterCallback): RegisterResponse {
    methods.debug(`REGISTER Remote Client Event \`${name}\``);
    const id = this.eventID;
    const self = {
      destroy: () => {
        this.container.delete(id);
      },
      eventId: id,
      eventName: name,
      env: 'client',
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
    });

    // @ts-ignore
    // func.eventName = name, func.eventId = id, func.destroy = this.container.delete(id);
    this.container.set(id, { id, name, func: func.bind(self) });
    this.eventID++;
    return { id, destroy: self.destroy, name };
  }

  triggerServer(name: string, ...args: any[]): any {
    mp.events.callRemote('__customTriggerServer__', "client", name, ...args);
  }

  triggerBrowser(name: string, ...args: any[]) {
    if (!mp.browsers.length) return mp.console.logInfo(`Do not have any browsers`);
    mp.browsers.forEach((browser) => {
      browser.execute(`
        if (window.__customTriggerCef__) {
          window.__customTriggerCef__('${name}', '${JSON.stringify(args)}');
        }
      `);
    });
  }

  callServer(name: string, ...args: any[]): Promise<any> {
    const id = this.eventRemoteRequestId++;
    return new Promise((resolve, reject) => {
      mp.events.callRemote('__customCallServer__', "client", name, id, ...args);
      this.eventRemoteRequestData.set(id, resolve);
    });
  }

  callBrowser(name: string, ...args: any[]): Promise<any> {
    const id = this.eventRemoteRequestId++;
    return new Promise((resolve, reject) => {
      if (!mp.browsers.length) return mp.console.logInfo(`Do not have any browsers`);
      mp.browsers.forEach((browser) => {
        browser.execute(`
          if (window.__customCallCef__) {
            window.__customCallCef__('client', '${name}', ${id}, '${JSON.stringify(args)}');
          }
        `);
      });
      this.eventRemoteRequestData.set(id, resolve);
    });
  }
}

export let ClientEvent = new ClientEventClass();

mp.events.add('__customCallClient__', async (name: string, id: number, ...args: any[]) => {
  let result = await ClientEvent.get(name, ...args);
  if (typeof result == 'object') {
    result = JSON.stringify(result);
  }
  mp.events.callRemote('__customRemoteAnswer__', id, result);
});

mp.events.add('__customTriggerClient__', async (name: string, ...args: any[]) => {
  await ClientEvent.get(name, ...args);
});

mp.events.add('__customRemoteAnswer__', (id: number, result: any) => {
  let f = ClientEvent.eventRemoteRequestData.get(id);
  f(result);
  ClientEvent.eventRemoteRequestData.delete(id);
});

mp.events.add('__customTriggerCef__', async (name: string, args: any[]) => {
  if (!mp.browsers.length) return mp.console.logInfo(`Do not have any browsers`);
  mp.browsers.forEach((browser) => {
    browser.execute(`
      if (window.__customTriggerCef__) {
        window.__customTriggerCef__('${name}', '${JSON.stringify(args)}');
      }
    `);
  });
});

mp.events.add('__customTriggerClientFromCef__', (name: string, ...args: any[]) => {
  args = formatArgs(args);
  ClientEvent.get(name, ...args);
});
mp.events.add('cefconsole', (name: string, ...args: any[]) => {
  methods.debug(name, ...args);
});

mp.events.add('__customTriggerServerFromCef__', (name: string, ...args: any[]) => {
  // args = formatArgs(args);
  mp.events.callRemote('__customTriggerServer__', "CEF", name, ...args);
});

mp.events.add('__customCallClientFromCef__', async (name: string, id: number, ...args: any[]) => {
  let result = await ClientEvent.get(name, ...args);
  if (typeof result == 'object') result = JSON.stringify(result);
  mp.browsers.forEach((browser) => {
    browser.execute(`
        if (window.__customResponseCef__) {
          window.__customResponseCef__(${id}, '${result}');
        }
      `);
  });
});

mp.events.add('__customCallServerFromCef__', (name: string, id: number, ...args: any[]) => {
  args = formatArgs(args);
  mp.events.callRemote('__customCallServerFromClientToCef__', name, id, ...args)
});

mp.events.add('__customResponseServerToCef__', (id: number, result: any) => {
  if (typeof result == 'object') result = JSON.stringify(result);
  mp.browsers.forEach((browser) => {
    browser.execute(`
      if (window.__customResponseCef__) {
        window.__customResponseCef__(${id}, '${result}');
      }
    `);
  });
});

mp.events.add('__customRemoteAnswerToCef__', (id: number, result: any) => {
  if (typeof result == 'object') result = JSON.stringify(result);
  mp.browsers.forEach((browser) => {
    browser.execute(`
      if (window.__customResponseCef__) {
        window.__customResponseCef__(${id}, '${result}');
      }
    `);
  });
});

mp.events.add('__customClientAnswerFromCef__', (id: number, result: any, env: 'server' | 'client') => {
  if (env == 'client') {
    let f = ClientEvent.eventRemoteRequestData.get(id);
    if (testJSON(result)) {
      result = JSON.parse(result);
    }
    f(result);
    ClientEvent.eventRemoteRequestData.delete(id);
  } else if (env == 'server') {
    mp.events.callRemote('__customRemoteAnswer__', id, result);
  }
});

mp.events.add('__customCallCefFromServer__', (name: string, id: number, ...args: any[]) => {
  if (!mp.browsers.length) return mp.console.logInfo(`Do not have any browsers`);
  mp.browsers.forEach((browser) => {
    browser.execute(`
      if (window.__customCallCef__) {
        window.__customCallCef__('server', '${name}', ${id}, '${JSON.stringify(args)}');
      }
    `);
  });
});
