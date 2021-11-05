/// <reference path="rage-client.ts" />
/// <reference path="rage-server.ts" />

type RegisterCallback = (
  this: RegisterResponse,
  ...args: any[]
) => any;

type RegisterLocalCallback = (
  this: RegisterResponse,
  ...args: any[]
) => any;

type RegisterCallbackServer = (
  this: RegisterResponse,
  ...args: any[]
) => any;

type RegisterLocalCallbackServer = (
  this: RegisterResponse,
  ...args: any[]
) => {
  this: Function,
  eventName:string;
};

interface RegisterResponse {
  destroy(): void; 
  id: number;
  name: string;
  env?: 'server' | 'client' | 'cef' | 'local';
}

interface CustomEventPool {
  /** #### Register client events for *call* or *trigger*
   * @param name A name of event
   * @callback ***func** callback function
   * ```typescript
   * function callback(...args: any[]) {
   *   this.destroy(); // unregister event
   *   this.eventId;
   *   this.eventName, 
   *   this.env; // here `local`
   * }
   * ```
    **/
  registerLocal(name: string, func: RegisterLocalCallback): RegisterResponse;
  /** #### Register client events for *call* or *trigger*
   * @param name A name of event
   * @callback ***func** callback function
   * ```typescript
   * function callback(player: PlayerMp, ...args: any[]) {
   *   this.destroy(); // unregister event
   *   this.eventId;
   *   this.eventName, 
   *   this.env; // here `local`
   * }
   * ```
    **/
  registerLocal(name: string, func: RegisterLocalCallbackServer): RegisterResponse;

  /** #### Trigger local event (without response)
   * @param name A name of event
   * @param args Any arguments
   **/
  triggerLocal(name: string, ...args: any[]): void;

  /** #### Call local event (with response in Promise)
   * @param name A name of event
   * @param args Any arguments
   * @returns __Promise__
   * ```typescript
   * callLocal('event').then((response) => {
    *   console.log(response))
    * }
    * ```
    * **OR (if there are some same events)**
    * ```typescript
    * callLocal('event').then(([r1, r2]) => {
    *   console.log(r1, r2))
    * }
    * ```
     **/
  callLocal(name: string, ...args: any[]): Promise<any> | Promise<any[]>

  /** #### Register server events for *call* or *trigger*
   * @param name A name of event
   * @callback ***func** callback function
   * ```typescript
   * function callback(...args: any[]) {
   *   this.destroy(); // unregister event
   *   this.eventId;
   *   this.eventName, 
   *   this.env; // here `server`
   * }
   * ```
   **/
  register(name: string, func: RegisterCallback): RegisterResponse;
  /** #### Register server events for *call* or *trigger*
   * @param name A name of event
   * @callback ***func** callback function
   * ```typescript
   * function callback(player: PlayerMp, ...args: any[]) {
   *   this.destroy(); // unregister event
   *   this.eventId;
   *   this.eventName, 
   *   this.env; // here `server`
   * }
   * ```
   **/
  register(name: string, func: RegisterCallbackServer): RegisterResponse;

  /** #### Trigger event in server (without response)
   * @param name A name of event
   * @param args Any arguments
   **/
  triggerServer(name: string, ...args: any[]): void;

  /** #### Trigger event in client (without response)
   * @param name A name of event
   * @param args Any arguments
   **/
  triggerClient(name: string, ...args: any[]): void;
  /** #### Trigger event in client (without response)
   * @param name A name of event
   * @param player A Player instance
   * @param args Any arguments
   **/
  triggerClient(player: PlayerMp, name: string, ...args: any[]): void;

  /** #### Trigger event in browser (without response)
   * @param name A name of event
   * @param args Any arguments
   **/
  triggerBrowser(name: string, ...args: any[]): void;
  /** #### Trigger event in browser (without response)
   * @param player A player instance
   * @param name A name of event
   * @param args Any arguments
   **/
  triggerBrowser(player: PlayerMp, name: string, ...args: any[]): void;

  /** #### Call event in server (with response in Promise)
   * @param name A name of event
   * @param args Any arguments
   * @returns __Promise__
   * ```typescript
   * callServer('event').then((response) => {
   *   console.log(response))
   * }
   * ```
   * **OR (if there are some same events)**
   * ```typescript
   * callServer('event').then(([r1, r2]) => {
   *   console.log(r1, r2))
   * }
   * ```
   **/
  callServer(name: string, ...args: any[]): Promise<any>; 


  /** #### Call event in server (with response in Promise)
   * @param player A player instance
   * @param name A name of event
   * @param args Any arguments
   * @returns __Promise__
   * ```typescript
   * callClient('event').then((response) => {
   *   console.log(response))
   * }
   * ```
   * **OR (if there are some same events)**
   * ```typescript
   * callClient('event').then(([r1, r2]) => {
   *   console.log(r1, r2))
   * }
   * ```
   **/
  callClient(player: PlayerMp, name: string, ...args: any[]): Promise<any>;

  /** #### Call event in client (with response in Promise)
   * @param name A name of event
   * @param args Any arguments
   * @returns __Promise__
   * ```typescript
   * callBrowser('event', player).then((response) => {
   *   console.log(response))
   * }
   * ```
   * **OR (if there are some same events)**
   * ```typescript
   * callBrowser('event', player).then(([r1, r2]) => {
   *   console.log(r1, r2))
   * }
   * ```
   **/
  callBrowser(name: string, ...args: any[]): Promise<any>;
  /** #### Call event in client (with response in Promise)
   * @param name A name of event
   * @param player A Player instance
   * @param args Any arguments
   * @returns __Promise__
   * ```typescript
   * callBrowser('event', player).then((response) => {
   *   console.log(response))
   * }
   * ```
   * **OR (if there are some same events)**
   * ```typescript
   * callBrowser('event', player).then(([r1, r2]) => {
   *   console.log(r1, r2))
   * }
   * ```
   **/
  callBrowser(player: PlayerMp, name: string, ...args: any[]): Promise<any>;
}