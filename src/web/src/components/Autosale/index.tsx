import React, { Component } from "react";
import Loading from "../Loading";
import { CEF } from "api";
import ReactTooltip from 'react-tooltip'
import engine from './icons/009-engine.svg'
import brake from './icons/006-brake.svg'
import turbo from './icons/029-turbo.svg'
import transmission from './icons/028-transmission.svg'


import number from './icons/number.svg'
import cost from './icons/cost.svg'
import model from './icons/car.svg'
import owner from './icons/stakeholder.svg'
import { getRandomInt } from "../../../../util/methods";
const titles = {
    buy: "Приобрести ТС",
    sell: "Выставить на продажу",
    show: "Информация о ТС",
}

class AutoSale extends Component<any, { 
    stage: "buy" | "sell" | "show";
    model: string;
    name: string;
    price: number;
    gos: number;
    number: string;
    seller: string;
    engine: number;
    brake: number;
    transmission: number;
    turbo: boolean;
    loaded: boolean;
    id: number;
 }> {
    ev: RegisterResponse;
    constructor(props: any) {
        super(props);

        this.state = {
            stage: 'show',
            model: "Kuruma",
            name: "Kuruma",
            number: "AE12VBV3",
            seller: "Alexander Potolayko (29975)",
            price: 3000,
            gos: 3000,

            engine: 0,
            brake: 0,
            transmission: 0,
            turbo: false,

            loaded: false,
            id: 0
        };

        this.ev = mp.events.register("autosale:data", (stage: "buy" | "sell" | "show", id: number, model: string, name: string, number: string, seller: string, engine: number, brake: number, transmission: number, turbo: boolean, price = 0, gos = 0) => {
            this.setState({ stage, id, model, name, number, seller, engine, brake, transmission, turbo, price, gos, loaded: true});
        })
    }
    componentWillUnmount(){
        if(this.ev) this.ev.destroy()
    }

    // drawSpecInfo(icon: string, name: string, value: number | boolean){
    //     return <>
    //         <div data-tip="React-tooltip" data-for={`happyFaceEquip_${name}`}>
    //             <img src={icon} /> <p>{typeof value === "number" && value ? `${value} LVL` : (value ? 'Установлен' : (typeof value === "number" ? 'Стоковый' : 'Недоступен'))}</p>
    //         </div>
    //         <ReactTooltip id={`happyFaceEquip_${name}`} place="top" type="dark" effect="solid" data-delay-show="100">
    //             <span>{name}</span>
    //         </ReactTooltip>
    //     </>
    // }
    drawSpecInfo(icon: string, name: string, value: number | boolean){
        return <>
            <div className="autosale-veh-info-item" data-tip="React-tooltip" data-for={`happyFaceEquip_${name}`}><span><img src={icon} /> {name}</span><span>{typeof value === "number" && value ? `${value} LVL` : (value ? 'Установлен' : 'Стандартный')}</span></div>
            <ReactTooltip id={`happyFaceEquip_${name}`} place="top" type="dark" effect="solid" data-delay-show="100">
                <span>{name}</span>
            </ReactTooltip>
        </>
    }

    drawVehInfo(icon: string, name: string, value: string){
        return <>
            <div className="autosale-veh-info-item" data-tip="React-tooltip" data-for={`happyFaceEquip_${name}`}><span><img src={icon} /> {name}</span><span>{value}</span></div>
            <ReactTooltip id={`happyFaceEquip_${name}`} place="top" type="dark" effect="solid" data-delay-show="100">
                <span>{name}</span>
            </ReactTooltip>
        </>
    }

    render() {
        if (!this.state.loaded) return <Loading />;
        return <div className="autosale">
            <div className="autosale-header">
                {titles[this.state.stage]}
            </div>
            <div className="autosale-car-image">
                <img src={`https://rp.gta-5.ru/images/cars-more/${this.state.model || this.state.name}_1.jpg?v=${getRandomInt(1000, 10000)}`} onError={e => {
                    e.currentTarget.hidden = true
                }} />
            </div>
            <div className="autosale-part-title">Информация</div>
            <div className="autosale-info">
                {this.drawVehInfo(model, "Модель", this.state.name)}
                {this.drawVehInfo(number, "Номер", this.state.number)}
                {this.state.stage !== "sell" ? <>
                    {this.drawVehInfo(cost, "Гос. Стоимость", this.state.gos+"$")}
                    {this.drawVehInfo(cost, "Стоимость", this.state.price+"$")}
                </> : <></>}
            </div>
            {this.state.stage !== "sell" ? <div className="autosale-info-one">
                {this.drawVehInfo(owner, "Продавец ТС", this.state.seller)}
            </div> : <></>}
            
            <div className="autosale-part-title">Характеристики</div>
            <div className="autosale-info">
                <span>{this.drawSpecInfo(engine, "Двигатель", this.state.engine)}</span>
                <span>{this.drawSpecInfo(brake, "Тормоза", this.state.brake)}</span>
                <span>{this.drawSpecInfo(transmission, "Трансмиссия", this.state.transmission)}</span>
                <span>{this.drawSpecInfo(turbo, "Турбо", this.state.turbo)}</span>
            </div>
            {this.state.stage == "buy" ? <>
                <div className="autosale-bottom autosale-buttons">
                    <button className="btn btn-success" onClick={e => {
                        CEF.gui.setGui(null);
                        mp.events.triggerServer('autosale:buyVeh', this.state.price);
                    }}>Купить</button>
                    <button className="btn btn-danger" onClick={e => {
                        CEF.gui.setGui(null);
                    }}>Отказатся</button>
                </div>
            </> : <></>}
            {this.state.stage == "sell" ? <>
                <div className="autosale-bottom">
                    <div className="autosale-buttons">
                        <button className="btn btn-danger" onClick={e => {
                            CEF.gui.setGui(null);
                        }}>Отменить</button>
                        <input className="form-control" defaultValue={'0'} placeholder="Цена" type="number" onChange={e => {
                            this.setState({price: e.currentTarget.valueAsNumber})
                        }} />
                        <button className="btn btn-success" onClick={e => {
                            if(this.state.price < 100) return CEF.alert.setAlert("error", "Укажите стоимость выше 100$")
                            if(this.state.price > 9000000000) return CEF.alert.setAlert("error", "Указанная стоимость слишком высокая")
                            CEF.gui.setGui(null);
                            mp.events.triggerServer('autosale:sellVehStart', this.state.price);
                        }}>Выставить на продажу</button>
                    </div>
                </div>
            </> : <></>}
            {this.state.stage == "show" ? <>
                <div className="autosale-bottom">
                    <button className="btn btn-danger btn-block" onClick={e => {
                        CEF.gui.setGui(null);
                    }}>Закрыть</button>
                </div>
            </> : <></>}
        </div>
            ;
    }
}

export default AutoSale;

