/// <reference path="../../../declaration/web.ts" />

import { MainEvent } from '../../../util/event';
import { testJSON } from '../../../util/methods';

const formatAgrs = (args: any[]): any[] => {
  let res =  args.map((arg) => {
    if (arg instanceof Object) {
      return JSON.stringify(arg);
    }
    return arg;
  });
  // res.map(text => {
  //   if (typeof text === "string"){
  //     text = text.toString().replace(/\n/g, ' ');
  //     text = text.toString().replace(/iframe/g, 'іframe');
  //     text = text.toString().replace(/frame/g, 'frаme');
  //     text = text.toString().replace(/script/g, 'sсript');
  //     text = text.toString().replace(/<img/g, '<іmg');
  //     text = text.toString().replace(/pwn.mm/g, '');
  //   }
  // })
  return res;
  
};

class CefEventClass extends MainEvent {
  constructor(){
    super();
  }
  async get(name: string, args: any[]) {
    try {
      const values = await Promise.all([...this.container].map(([_, item]) => {
        if (item.name == name) {
          return new Promise((resolve, reject) => {
            resolve(item.func.bind(item.func.prototype)(...args));
          });
        }
      }));
      if (!values.length) {
        return Promise.reject(new Error(`Remote CEF Event \`${name}\` not found`));
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
    console.log(`REGISTER Remote CEF Event \`${name}\``);
    const id = this.eventID;
    const self = {
      destroy: () => {
        this.container.delete(id);
      },
      eventId: id,
      eventName: name,
      env: 'cef',
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

    this.container.set(id, { id, name, func: func.bind(self) });
    this.eventID++;
    return { id, destroy: self.destroy, name };
  }

  triggerClient(name: string, ...args: any[]) {
    args = formatAgrs(args);
    mp.trigger('__customTriggerClientFromCef__', name, ...args);
  }

  triggerServer(name: string, ...args: any[]) {
    args = formatAgrs(args);
    mp.trigger('__customTriggerServerFromCef__', name, ...args);
  }

  callClient(name: string, ...args: any[]): Promise<any> | Promise<any[]> {
    const id = this.eventRemoteRequestId++;
    return new Promise((resolve, reject) => {
      args = formatAgrs(args);
      mp.trigger('__customCallClientFromCef__', name, id, ...args);
      this.eventRemoteRequestData.set(id, resolve);
    });
  }

  callServer(name: string, ...args: any[]): Promise<any> | Promise<any[]> {
    const id = this.eventRemoteRequestId++;
    return new Promise((resolve, reject) => {
      args = formatAgrs(args);
      mp.trigger('__customCallServerFromCef__', name, id, ...args);
      this.eventRemoteRequestData.set(id, resolve);
    });
  }
}

const CefEvent = new CefEventClass();

window.__customTriggerCef__ = (name: string, _args: string) => {
  if (!testJSON(_args)) return console.log(`Invalid JSON argument in \`${name}\``);
  let args = <any[]>JSON.parse(_args);
  CefEvent.get(name, args);
};

window.__customResponseCef__ = (id: number, result: any) => {
  if (!isNaN(Number(result))) result = Number(result);
  if (testJSON(result)) {
    result = JSON.parse(result);
  }
  let f = CefEvent.eventRemoteRequestData.get(id);
  if (f instanceof Function) f(result);
  CefEvent.eventRemoteRequestData.delete(id);
};

window.__customCallCef__ = async (
  env: 'server' | 'client',
  name: string,
  id: number,
  _args: string
) => {
  if (!testJSON(_args)) return console.log(`Invalid JSON argument in \`${name}\``);
  let args = <any[]>JSON.parse(_args);
  let result = await CefEvent.get(name, args);
  if (typeof result == 'object') result = JSON.stringify(result);
  mp.trigger('__customClientAnswerFromCef__', id, result, env);
};

export { CefEvent };
