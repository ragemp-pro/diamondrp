/// <reference path="../../declaration/server.ts" />

import {RadioRoom} from './RadioRoom'
import { methods } from '../modules/methods';

class RadioRoomsContorllerClass {
  rooms: Map<string, RadioRoom>;
  constructor() {

    /**
    * Description
    * @type {Map<string, RadioRoom>}
    */
    this.rooms = new Map();
  }

  createRoom(name:string) {
    this.rooms.set(name, new RadioRoom(name));
    methods.debug(`[RadioRoomsContorller] created room - ${name}`);
  }

  removeRoom(name:string) {
    if (this.rooms.has(name)) {
      const room = this.rooms.get(name);

      room.onRemove();
      this.rooms.delete(name);
    }
  }

  hasRoom(name:string) {
    return this.rooms.has(name);
  }

    enableMic(name:string, player:PlayerMp) {
      try {
        if (this.rooms.has(name)) {
          const room = this.rooms.get(name);
  
          room.enableMic(player);
  
          methods.debug(`[RadioRoomsContorller] player ${player.name} enableMic to - ${name}`);
        }
      } catch (e) {
        console.log('enableMic controller', e);
      }
    }

    disableMic(name:string, player:PlayerMp) {
      try {
        if (this.rooms.has(name)) {
          const room = this.rooms.get(name);
  
          room.disableMic(player);
  
          methods.debug(`[RadioRoomsContorller] player ${player.name} disableMic to - ${name}`);
        }
      } catch (e) {
        console.log('disableMic controller', e);
      }
    }

  onJoin(name:string, player:PlayerMp) {
    try {
      if (this.rooms.has(name)) {
        const room = this.rooms.get(name);

        room.onJoin(player);

        methods.debug(`[RadioRoomsContorller] player ${player.name} connected to - ${name}`);
      }
    } catch (e) {
      console.log('onJoin controller', e);
    }
  }

  onQuit(name:string, player:PlayerMp) {
    try {
      if (this.rooms.has(name)) {
        const room = this.rooms.get(name);

        room.onQuit(player);

        methods.debug(`[RadioRoomsContorller] player ${player.name} disconnected from - ${name}`);
      }
    } catch (e) {
      console.log('onQuit controller', e);
    }
  }
}

let RadioRoomsContorller = new RadioRoomsContorllerClass()

export {RadioRoomsContorller};