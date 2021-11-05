export interface MenuItemFromClientToServer {
  rangeselect: [number, number];
  name: string;
  desc: string;
  type: "select" | "list" | "range";
  list: string[];
  listSelected ?: number;
  more ?: string | number;
  icon:string;
}

export interface MenuItemBaseCEF extends MenuItemBase {
  
}

export interface MenuItemBase {
  /** Название пункта */
  name: string;
  /** Доп часть строки */
  more?: string|number;
  /** Описание */
  desc?: string;
  /** Тип блока
   * - select - Обычный пункт
   * - list - С списком для листинга влево/вправо, требуется доп.параметр list в объекте пункта
   */
  type?: "select"|"list"|"range";
  /** Список пунктов для type = list */
  rangeselect?: [number,number];
  list?: string[];
  /** Что на данный момент выбранно при type = list */
  listSelected?:number;
  /** Иконка слева */
  icon?:string
}

export interface MenuInterface {
  id?: number;
  open?: boolean;
  select?: number;
  title: string;
  title_image?: string;
  subtitle?: string;
  items: MenuItemBaseCEF[];
  sprite?:string;
}

export interface MenuItem extends MenuItemBase {
  /** Колбек, который вызывается при нажатии на пункт
   * - item - объект пункта меню
   * - index - номер пункта
   */
  onpress?: (item: MenuItem, index: number) => any;
  /** Колбек, который вызывается при нажатии на пункт
   * - index - номер выбранного пункта из массива
   * - item - объект пункта меню
   * - index - номер
   */
  onchange?: (value: number, item: MenuItem, index: number) => any;
  /** Что на данный момент выбранно при type = list (Название) */
  listSelectedName?: string;
}