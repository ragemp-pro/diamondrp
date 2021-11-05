import { VipConfig, vipName } from "./vip";

export interface UserData {
    id:number;
    name:string;
    social:string;
    ip:string;
    ip_reg:string;
    playedTime:number;
    fraction:number;
    rank:number;
    adminLvl:number;
    helperLvl:number;
    money:number;
    bank:number;
    phone:string;
    bankcard: string;
    vip: vipName
}

export interface UserMap extends UserData {
    position: {x:number, y:number,z:number};
    /** Измерение */
    d: number;
    hp: number;
    ap: number;
}

export interface SiteLog {
    id:number;
    user_id:number;
    action:string;
    price:number;
    coins_before:number;
    coins_after:number;
    datetime:string;
    timestamp:number;
}