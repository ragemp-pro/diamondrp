import Iframe from 'react-iframe'



import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import InputRange from 'react-input-range';
import Loading from '../../../Loading';

interface Log {
    name: string;
    do: string;
    timestamp: number;
}

interface TabletChestState {
    logs: Log[]
    have: boolean;
    loaded: boolean;
    cost:number;
    owner:string;
    adress:string;
    id:number
}

export default class TabletChest extends Component<{ test?: boolean }, TabletChestState>{
    ev: RegisterResponse;
    ev2: RegisterResponse;
    constructor(props: any) {
        super(props);
        this.state = this.props.test ? {
            id: 1,
            cost: 100000,
            adress: "gasgasg",
            owner: "gasgasg",
            logs: [
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
                {name:"123",do:"213123",timestamp:123123},
            ],
            loaded: true,
            have: true,
        } : {
                id: 0,
                cost: 0,
                adress: "",
                owner: "",
                logs: [],
                loaded: false,
                have: false,
            }
        this.ev = mp.events.register('tablet:chests', (logs: Log[], id:number, cost:number, adress:string, owner:string) => {
            this.setState({ logs, id, cost, adress, owner, loaded: true, have: true})
        })
        this.ev2 = mp.events.register('tablet:chestsno', () => {
            this.setState({ loaded: true, have: false })
        })
    }
    digitFormat(number: number) {
        return ("0" + number).slice(-2);
    }
    tmToDate(timestamp: number) {
        let dateTime = new Date(timestamp * 1000);
        return `${this.digitFormat(dateTime.getDate())}/${this.digitFormat(dateTime.getMonth() + 1)}/${dateTime.getFullYear()} ${this.digitFormat(dateTime.getHours())}:${this.digitFormat(dateTime.getMinutes())}`
    }
    componentDidMount() {
        mp.events.triggerServer('tablet:chests:load')
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy()
        if (this.ev2) this.ev2.destroy()
    }
    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    updatePin(type:string){
        let pin = parseInt(document.getElementById(type).value)
        if (!document.getElementById(type).value.isNumberOnly() || isNaN(pin) || pin < 0 || pin > 99999) return CEF.alert.setAlert("error", `~r~Допускается пароль 1-99999`)
        mp.events.triggerServer('tablet:chests:updatePin', type, pin)
    }



    render() {
        if (!this.state.loaded) return <Loading loading="Загрузка приложения" />;
        if (!this.state.have) return <div className="alert alert-danger" role="alert">
            У вас нет склада
</div>;
        return (<div className="container chest-block">
            <div className="row title-gov chest-title">
                Управление складом
            </div>
            <div className="row">
                <div className="col-lg-5">
                    <div className="table-chest-left">
                        <img src={require('../menu/icons/stocks.png')} />
                        <hr/>
                        <div className="chest-block-title">Информация о складе</div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Стоимость</b></div>
                            <div className="col-lg-6">{this.numberFormat(this.state.cost)}</div>
                        </div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Владелец</b></div>
                            <div className="col-lg-6">{this.state.owner}</div>
                        </div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Адрес</b></div>
                            <div className="col-lg-6">{this.state.adress}</div>
                        </div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Номер склада</b></div>
                            <div className="col-lg-6">№{this.state.id}</div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="table-chest-left">
                        <div className="chest-block-title">Управление доступом</div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Пинкод от двери</b></div>
                            <div className="col-lg-3"><input id="pin1" type="password" className="form-control"/></div>
                            <div className="col-lg-3"><button onClick={e=>{
                                e.preventDefault();
                                this.updatePin('pin1')
                            }} className="btn btn-info">Сменить</button></div>
                        </div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Пинкод от сейфа №1</b></div>
                            <div className="col-lg-3"><input id="pin2" type="password" className="form-control"/></div>
                            <div className="col-lg-3"><button onClick={e => {
                                e.preventDefault();
                                this.updatePin('pin2')
                            }} className="btn btn-info">Сменить</button></div>
                        </div>
                        <div className="row chest-description">
                            <div className="col-lg-6"><b>Пинкод от сейфа №2</b></div>
                            <div className="col-lg-3"><input id="pin3" type="password" className="form-control"/></div>
                            <div className="col-lg-3"><button onClick={e => {
                                e.preventDefault();
                                this.updatePin('pin3')
                            }} className="btn btn-info">Сменить</button></div>
                        </div>
                    </div>

                    <div className="table-chest-left">
                        <div className="chest-block-title">Последние записи склада</div>
                        <div style={{
                            overflowY: "auto",
                            overflowX: "hidden",
                            maxHeight: "332px"}}>
                        {this.state.logs.map(item => {
                            return <div className="row chest-description">
                                <div className="col-lg-3"><b>{item.name}</b></div>
                                <div className="col-lg-5">{item.do}</div>
                                <div className="col-lg-4">{this.tmToDate(item.timestamp)}</div>
                            </div>
                        })}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>);
    }

}