import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import batteryIcon from '../../images/battery-icon.png'
import wifiIcon from '../../images/wifi.png'
import Users, { userData } from './modules/users';
import Dispatch, { dispatchItem } from './modules/dispatch';
import Alerts from './modules/alerts';
import DispatchAlert from './modules/dispatch.alert';
import GiveWanted from './modules/givewanted';
import QuickJobUser from './modules/quickJobUser';
import GiveRec, { canGiveDoc, canRemoveDoc } from './modules/giverec';
import Loading from '../../../Loading';
import { fractionUtil } from '../../../../../../util/fractions';
import SetTag from './modules/setTag';
import HelpMe from './modules/help';

interface menusItem {
    name: string;
    block: string;
    rank?: number;
    fraction?: number | number[];
    gos?: boolean;
    mafia?: boolean;
    event?: string;
    desc?: string;
    button?: string;
    gv?: boolean;
    rm?: boolean;
}

let menus: menusItem[] = [
    { name: "GPS Маяк", block: 'help', gos: true },
    { name: "Трансляция кода", block: 'localcodes', gos: true },
    { name: "Диспетчерская", block: 'dispatcher', gos: true },
    { name: "Уведомление", block: 'alerts' },
    { name: "Эвакуация ТС", block: 'vehicle', gos: true },
    { name: "Участники", block: 'users' },
    { name: "Выдать розыск", block: 'givewanted', gos: true, fraction: [2,3,7], rank: 2 },
    { name: "Снять розыск", block: 'clearwanted', event: "server:user:giveWanted", desc: "Снятие розыска", button: "Снять", gos: true, fraction: [2, 3, 7], rank: 4 },
    { name: "Установить тег", block: 'tag' },
    { name: "Выдача документов", block: 'giverec', gos: true, gv:true },
    { name: "Изъятие документов", block: 'removerec', gos: true, rm:true },
    { name: "Написать новость", block: 'writenews', gos: true, rank: 13 },
    { name: "Очистить розыск", block: 'clearwantedmafia', event: "server:user:giveWanted", desc: "Очистка розыска (Цена $10.000)", button: "Очистить", mafia: true, rank: 7 },
    { name: "Сменить/Вернуть ID", block: 'changeid', desc: 'Сменить ID (0 - вернуть)', event: "server:user:changeId", button: "Сменить", fraction: 3 },
    { name: "Выписать пациента", block: 'healDocs', desc: 'Введите ID', event: "server:user:healDocs", button: "Предложить лечение", fraction: 16 },
    // { name: "Меню заказов", block: 'ordermenu' },
    // { name: "Меню территорий", block: 'positionmenu' },
    { name: "Убрать из чёрного списка", block: 'removeblacklist', event: 'server:mafia:removeBlackList', desc: "Убрать из чёрного списка гос.организаций (Цена $100.000)", mafia: true, rank: 7 },
];



interface TabletState {
    start: boolean;
    currentPage: string;
    name: string;
    icon: string;
    tag: string;
    gos?: boolean;
    mafia?: boolean;
    rank: number;
    fraction: number;
    description: string;
    userEdit?: boolean;
    accessPage: string[];
    ranks: string[];
    users: userData[],
    dispatcher: dispatchItem[],
    tracking:boolean;
}

export default class TabletFraction extends Component<{ test?: boolean }, TabletState>{
    recList: string[];
    ev: RegisterResponse;
    constructor(props: any) {
        super(props);
        if (this.props.test) {

            this.state = {
                start: true,
                tracking: true,
                rank: 14,
                fraction: 2,
                gos: true,
                tag: "123",
                currentPage: "users",
                ranks: ["Стажёр", "Опытный задрот"],
                icon: "police",
                userEdit: true,
                name: "Название фракции",
                description: "Описание её, как оно есть, типа длинное, но не очень",
                accessPage: ["users", "users1"],
                users: [
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                    { id: 10, rp_name: "gasg", rank: 0, last_login: 1580924767 }, { id: 20, rp_name: "gasg", rank: 1, is_online: 1 },
                ],
                dispatcher: [
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
                    {
                    id: 1,
                    title: "Проверка",
                    desc: "Описание",
                    withCoord: true,
                    posX: 123,
                    posY: 123,
                    when: 1580924767,
                },
            ]
            }
            this.reloadRecList();
        } else {

            this.state = {
                start: false,
                tracking: false,
                rank: 0,
                tag: "",
                fraction: 0,
                currentPage: "users",
                ranks: [],
                icon: "",
                name: "",
                description: "",
                accessPage: [],
                users: [],
                dispatcher: []
            }
        }

        this.ev = mp.events.register("tablet:fraction", (fraction: number, rank: number, userEdit: boolean, accessPage: string[], users: userData[], dispatcher: dispatchItem[], tag: string, tracking:boolean) => {
            this.setState({
                fraction, rank, gos: fractionUtil.getFraction(fraction).gos, mafia: fractionUtil.getFraction(fraction).mafia, ranks: fractionUtil.getFractionRanks(fraction), icon: fractionUtil.getFraction(fraction).icon, userEdit, name: fractionUtil.getFraction(fraction).name, description: fractionUtil.getFraction(fraction).desc, accessPage, users, start: true, dispatcher, tag, tracking
            })
            this.reloadRecList()
        })
        mp.events.triggerServer('tablet:fraction:load')
    }
    reloadRecList() {
        this.recList = [];
        if (this.state.fraction == 1) this.recList.push("law", "bizz", "fish")
        if (this.state.fraction == 2 && this.state.rank > 5) this.recList.push("gun")
        if (this.state.fraction == 16) this.recList.push("marg", "antipohmel", "givemed", "removemed")
        this.forceUpdate();
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy();
    }

    openPage(num: string) {
        this.setState({ currentPage: num })
    }


    render() {
        if (!this.state.start) return <Loading loading="Загрузка приложения" />;
        return (<div className="tablet-fraction">
            <div className="notepad-sidebar">
                <ul role="tablist" className="ui-tabs-nav ui-corner-all ui-helper-reset ui-helper-clearfix ui-widget-header">
                    {menus.map((item) => {
                        if (item.rank && item.rank > this.state.rank) return;
                        if (item.gos && !this.state.gos) return;
                        if (item.mafia && !this.state.mafia) return;
                        if (typeof item.fraction == "number" && item.fraction && item.fraction != this.state.fraction) return;
                        if (typeof item.fraction == "object" && item.fraction && !item.fraction.includes(this.state.fraction)) return;
                        if (item.gv && !canGiveDoc(this.state.fraction, this.state.rank)) return;
                        if (item.rm && !canRemoveDoc(this.state.fraction, this.state.rank)) return;
                        // if(!this.state.accessPage.includes(item.block)) return;
                        return (<li className={`ui-tabs-tab ui-corner-top ui-state-default ui-tab ${this.state.currentPage == item.block ? 'active ui-tabs-active ui-state-active' : ''}`} role="tab" aria-controls="notepad1" aria-labelledby="ui-id-1" aria-selected="false" aria-expanded="false"><a href="#notepad1" role="presentation" className="ui-tabs-anchor" id="ui-id-1" onClick={(e) => { e.preventDefault(); this.openPage(item.block) }}>{item.name}</a></li>)
                    })}
                </ul>
            </div>
            <div className="notepad-content">
                {this.state.currentPage == "users" ? <>
                    <Users users={this.state.users} gos={this.state.gos} ranks={this.state.ranks} canJob={this.state.userEdit} />
                </> : ""}
                {this.state.currentPage == "dispatcher" ? <>
                    <Dispatch items={this.state.dispatcher} />
                </> : ""}
                {this.state.currentPage == "alerts" ? <>
                    <Alerts />
                </> : ""}
                {this.state.currentPage == "writenews" ? <>
                    <Alerts news={true} />
                </> : ""}
                {this.state.currentPage == "localcodes" ? <>
                    <DispatchAlert />
                </> : ""}
                {this.state.currentPage == "help" ? <>
                    <HelpMe tracking={this.state.tracking} />
                </> : ""}
                {this.state.currentPage == "tag" ? <>
                    <SetTag tag={this.state.tag} />
                </> : ""}
                {this.state.currentPage == "givewanted" ? <>
                    <GiveWanted />
                </> : ""}
                {this.state.currentPage == "giverec" ? <>
                    <GiveRec fraction={this.state.fraction} rank={this.state.rank} remove={false} />
                </> : ""}
                {this.state.currentPage == "removerec" ? <>
                    <GiveRec fraction={this.state.fraction} rank={this.state.rank} remove={true} />
                </> : ""}
                {this.state.currentPage == "vehicle" ? <>
                    <button className="primary-button w100 notepad-evacuate-vehicle-button" onClick={(e) => {
                        e.preventDefault();
                        mp.events.triggerServer('server:respawnNearstVehicle')
                    }}>Заказать эвакуацию ближайшего ТС</button>
                </> : ""}
                {menus.map((item) => {
                    if (this.state.currentPage == item.block && item.event) {
                        return <QuickJobUser button={item.button} desc={item.desc} event={item.event} />
                    }
                })}
            </div>
        </div>);
    }

}