export interface LotoData {
    /** Сумма выигрыша */
    prize: number;
    /** Сколько нужно купить билетов для роызыгрыша */
    count: number;
    /** Стоимость билета */
    cost: number;
}

export const itemLoto = 277;


export const lotoList:LotoData[] = [
    { prize: 10000, count: 100, cost: 150},
    { prize: 100000, count: 150, cost: 1000},
    { prize: 1000000, count: 1000, cost: 1500},
]