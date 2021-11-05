import { itemCosts } from "./sharedData";

export type ShowItem = [number, number];
export type ShowItemElectro = [number, number, number?, string?];
/**
 * ID Предмета, Стоимость
 */
export const shopList: ShowItem[] = [
    [275, 700],
    [280, itemCosts.Bag],
    [284, itemCosts.BagSmall],
    [6, 120],
    [251, 500],
    [59, 350],
    // [279, 10000],
]
/**
 * ID Предмета, Стоимость
 */
export const shopListElectro: ShowItemElectro[] = [
    [8, 200, 8, 'IFruit'],
    [20008, 1500, 8, 'IFruit X'],
    [10008, 600, 8, 'Invader'],
    [2820000, 2500, 282],
    [7, 350],
    [59, 350],
    [47, 1099],
]