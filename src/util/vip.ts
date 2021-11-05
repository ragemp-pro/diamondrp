/** Системное название вип статуса, которое записывается у игрока в БД */
export type vipName = "Bronze" | "Silver" | "Gold" | "Diamond" | "MediaLight" | "MediaHard" | "Start" | "Bonus" | "Turbo" | "Light" | "Hard" | "YouTube";

export const BASE_AFK_TIME = 10;

export interface VipConfig {
    /** Название випки в БД */
    id: vipName;

    /** Название випки */
    name: string;

    /** Стоимость випки */
    cost: number;

    /** + к зарплате */
    moneybonus: number;

    /** бонус к прокачки навыков персонажа */
    skillpersbonus: number;

    /** бонус к прокачки рабочих скилов */
    skilljobbonus: number;

    /** Доступ к /vipuninvite */
    vipuninvite: true | false;

    /** Оптала налогов через сайт */
    sitepay?: true;

    /** Бесплатная смена слотов */
    changeslots?: true;

    /** Сколько выдаём коинов при пейдее */
    givecoin: number;

    /** Сколько опыта даём дополнительно при каждом пейдее */
    expbonus: number;

    /** Лечение в больнице идет в 2 раза быстрее */
    healmultipler: boolean;

    /** Сколько времени можно стоять AFK */
    afkminutes: number;

    /** Эта випка предназначена для медиа проекта */
    media?: true;

    /** Это старая випка? Тогда сменим на ту, что указана */
    switch?: [vipName, number];
}


export const vipStatus = {
    data: <VipConfig[]>[
        {
            id: "Diamond",
            name: "VIP Diamond",
            cost: 1250,
            moneybonus: 2500,
            skillpersbonus: 5,
            skilljobbonus: 5,
            vipuninvite: true,
            changeslots: true,
            sitepay: true,
            givecoin: 1,
            expbonus: 2,
            healmultipler: true,
            afkminutes: 45
        },
        {
            id: "Gold",
            name: "VIP Gold",
            cost: 750,
            moneybonus: 1500,
            changeslots: true,
            sitepay: true,
            skillpersbonus: 10,
            skilljobbonus: 10,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 1,
            healmultipler: true,
            afkminutes: 35
        },
        {
            id: "Silver",
            name: "VIP Silver",
            cost: 500,
            moneybonus: 1000,
            changeslots: true,
            skillpersbonus: 20,
            skilljobbonus: 20,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: 25
        },
        {
            id: "Bronze",
            name: "VIP Bronze",
            cost: 250,
            moneybonus: 500,
            skillpersbonus: 20,
            skilljobbonus: 0,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: 15
        },
        {
            id: "MediaLight",
            media: true,
            name: "Media VIP Light",
            cost: 0,
            moneybonus: 750,
            skillpersbonus: 10,
            skilljobbonus: 10,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: BASE_AFK_TIME
        },
        {
            id: "MediaHard",
            media: true,
            name: "Media VIP Hard",
            cost: 0,
            moneybonus: 1500,
            skillpersbonus: 5,
            skilljobbonus: 5,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: true,
            afkminutes: BASE_AFK_TIME
        },
        {
            id: "Start",
            name: "VIP Start",
            cost: 0,
            moneybonus: 250,
            skillpersbonus: 10,
            skilljobbonus: 10,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 1,
            healmultipler: true,
            afkminutes: BASE_AFK_TIME
        },
        {
            id: "Bonus",
            name: "VIP Bonus",
            cost: 0,
            moneybonus: 2500,
            skillpersbonus: 5,
            skilljobbonus: 5,
            vipuninvite: true,
            givecoin: 0,
            expbonus: 2,
            healmultipler: true,
            afkminutes: 45
        },

        //! Старые випки, которые нужно перевыдать
        {
            id: "Turbo",
            name: "VIP Turbo",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["Start", 10]
        },
        {
            id: "Light",
            name: "VIP Light",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["Silver", 60]
        },
        {
            id: "Hard",
            name: "VIP Hard",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["Gold", 90]
        },
        {
            id: "YouTube",
            name: "VIP YouTube",
            cost: 0,
            moneybonus: 0,
            skillpersbonus: 0,
            skilljobbonus: 0,
            vipuninvite: false,
            givecoin: 0,
            expbonus: 0,
            healmultipler: false,
            afkminutes: 0,
            switch: ["MediaLight", 999]
        }

    ],
    getVipStatusData: (id: VipConfig["id"]) => {
        return vipStatus.data.find(item => item.id == id)
    }
}