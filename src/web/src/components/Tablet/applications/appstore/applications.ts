import { fractionList } from "../../../../../../util/fractions";

export interface ApplicationAppStore {
    name:string;
    descShort:string;
    desc:string;
    icon:string;
    page:string;
    cost?:number;
    installed?:boolean;
    fractions?:number[];
}
export const applicationsList: ApplicationAppStore[] = [
    { installed: true, icon: "gangmap", name: "Карта территорий", page: "gangmap", descShort: "Новости и информация", desc: "Новости и информация", fractions: fractionList.filter(item => item.gang).map(item => {return item.id}) },
    { installed: true, icon: "gangmap", name: "Территории", page: "gangcontrol", descShort: "Новости и информация", desc: "Новости и информация", fractions: fractionList.filter(item => item.gang).map(item => { return item.id }) },
    { installed: true, icon: "government", name: "Официальный сайт правительства", page: "government", descShort: "Новости и информация", desc: "Новости и информация" },
    { installed: true, icon: "radio", name: "Радио", page: "radio", descShort: "Слушайте лучшую музыку в любом месте", desc: "Слушайте лучшую музыку в любом месте" },
    { installed: true, icon: "cars", name: "Транспорт", page: "cars", descShort: "Управление личным транспортом", desc: "Управление личным транспортом" },
    // { installed: true, icon: "browser", name: "Браузер", page: "browser", descShort: "Доступ к интернет паутине", desc: "Доступ к интернет паутине" },
    { installed: true, icon: "stocks", name: "Склад", page: "chest", descShort: "Управление собственным складом", desc: "Управление собственным складом" },
    { installed: true, icon: "house", name: "Дом", page: "house", descShort: "Управление собственным домом", desc: "Управление собственным домом" },
    { installed: true, icon: "appart", name: "Апартаменты", page: "appart", descShort: "Управление собственным домом", desc: "Управление собственным домом" },
    { installed: true, icon: "condo", name: "Квартира", page: "condo", descShort: "Управление собственным домом", desc: "Управление собственным домом" },
    { installed: true, icon: "mafiacars", name: "Заказ фургонов", page: "mafiacar", descShort: "Управление собственным домом", desc: "Управление собственным домом", fractions: fractionList.filter(item => item.mafia || item.gang).map(item => { return item.id }) },
    { installed: true, icon: "gangdeliver", name: "Доставка фургона", page: "gangdeliver", descShort: "Управление собственным домом", desc: "Управление собственным домом", fractions: fractionList.filter(item => item.mafia || item.gang).map(item => { return item.id }) },
    { installed: true, icon: "mafiater", name: "Территории", page: "mafiater", descShort: "Управление собственным домом", desc: "Управление собственным домом", fractions: fractionList.filter(item => item.mafia).map(item => { return item.id }) },
    // { installed: true, icon: "appstore", name: "AppStore", page: "appstore", descShort: "Установка приложений", desc: "Найдите и установите приложение, которое вам может пригодится" },
]