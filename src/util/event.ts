/// <reference path="../declaration/server.ts" />
type EventType = "all" | "client" | "CEF"
export class MainEvent {
  public container: Map<number, { id: number, name: string, func: RegisterCallback, type: EventType }>;
  public eventRemoteRequestId: number = 0;
  public eventRemoteRequestData: Map<number, any> = new Map();
  public eventID: number = 0;
  public containerLocal: Map<number, RegisterLocalCallback> = new Map();
  constructor(){
    this.container = new Map();
    this.eventRemoteRequestId = 1;
    this.eventRemoteRequestData = new Map();
    this.eventID = 1;
    this.containerLocal = new Map();
  }

  registerLocal(name: string, func: RegisterLocalCallback): RegisterResponse {
    console.log(`REGISTER Local Event \`${name}\``);
    const id = this.eventID;
    const self = {
      destroy: () => {
        this.containerLocal.delete(id);
      },
      eventId: id,
      eventName: name,
      env: 'local',
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
    });

    this.containerLocal.set(id, func.bind(self));
    this.eventID++;
    return { id, destroy: self.destroy, name, env: 'local' };
  }
  
  triggerLocal(name: string, ...args: any[]) {
    this.containerLocal.forEach((item) => {
      // @ts-ignore
      if (item.eventName == name) {
        item.bind(item.prototype)(...args);
      }
    });
  }
  
  async callLocal(name: string, ...args: any[]): Promise<any> {
    try {
      const values = await Promise.all([...this.containerLocal].map(([_, item]) => {
        if (item.prototype.eventName == name) {
          return new Promise((resolve, reject) => {
            resolve(item.bind(item.prototype)(...args));
          });
        }
      }));
      if (!values.length) {
        return Promise.reject(new Error(`Local Event \`${name}\` not found`));
      } else if (values.length == 1) {
        return values[0];
      } else {
        return values;
      }
    } catch(e) {
      return Promise.reject(e);
    }
  }
  
}
