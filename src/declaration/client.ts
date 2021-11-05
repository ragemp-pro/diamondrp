/// <reference path="rage-client.ts" />


declare interface Vector2 {
  x:number,
  y:number
}

interface PlayerClient extends EntityMp {
  lastReceivedPointing: number;
  pointingInterval: number;
  skate: {
    obj?:ObjectMp;
    objveh?:VehicleMp;
    objped?:PedMp;
  }
}

interface VehicleMp {
  radio: number;
}

interface ClientBrowserMp {
  executeAll(code: string[]): void;
}

declare var global: {
  
};