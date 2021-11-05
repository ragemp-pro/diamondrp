export interface gangWarTerData {
    id?:number;
    position: {x:number,y:number,z:number,d:number};
    name: string;
    ownername: string;
    ownerid?: number;
    attack?: boolean;
    resp?:number;
    color: string;
}

export interface GangPosition { x: number, y: number, z: number, fractionid: number, color: number }

export interface GangTerData {
    id:number;
    name:string;
    attack:boolean;
    resp:boolean;
    ownerid:number;
    ownername:string;
}

/** Необходимый ранг для атаки */
export const attackMinRank = 9