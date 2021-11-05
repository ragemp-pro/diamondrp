import Iframe from 'react-iframe'



import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import InputRange from 'react-input-range';
import Loading from '../../../Loading';
import { getRandomInt } from '../../../../../../util/methods';

interface Car {
    model: string;
    name: string;
    slot: number;
    plate: string;
    cost: number;
    costDeliver: number;
    fuelMax: number;
    fuelPer: number;
    bag: number;
    autopilot: boolean;
}

interface TabletCarsState {
    list: Car[]
    loaded: boolean;
    selected?: number;
}

export default class TabletCars extends Component<{ test?: boolean }, TabletCarsState>{
    ev: RegisterResponse;
    constructor(props: any) {
        super(props);
        this.state = this.props.test ? {
            list: [
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
                { model: "Bison", name: "Bison", slot: 1, plate: "FA3234GG", cost: 100000, costDeliver: 100000, fuelMax: 100, fuelPer: 5, bag: 1000000, autopilot: false },
            ],
            loaded: true
        } : {
                list: [],
                loaded: false
            }
        this.ev = mp.events.register('tablet:vehicles', (list: Car[]) => {
            this.setState({ list, loaded: true })
        })
    }
    componentDidMount() {
        mp.events.triggerServer('tablet:vehicles:load')
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy()
    }
    selectCar(id: number) {
        if (this.state.selected === id) this.setState({ selected: null })
        else this.setState({ selected: id })
    }
    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }
    getSelectedCar() {
        return this.state.list[this.state.selected]
    }

    find() {
        let car = this.getSelectedCar();
        if (!car) return;
        mp.events.triggerServer('tablet:cars:find', car.slot)
    }
    resp() {
        let car = this.getSelectedCar();
        if (!car) return;
        mp.events.triggerServer('tablet:cars:resp', car.slot)
    }
    deliver() {
        let car = this.getSelectedCar();
        if (!car) return;
        mp.events.triggerServer('tablet:cars:deliver', car.slot)
    }

    render() {
        if (!this.state.loaded) return <Loading loading="Загрузка приложения" />;
        if (this.state.list.length == 0) return <div className="alert alert-danger" role="alert">
            У вас нет купленного транспорта
        </div>;
        return (<div className="container chest-block">
            <div className="row title-gov chest-title">
                <img src={require('../menu/icons/cars.png')} />
                Управление транспортом
            </div>
            <div className="row">
                <div className="col-sm-4 cars-list" style={{ height: "720px"}}>
                    {this.state.list.map((item, id) => {
                        if (typeof item !== "object") return <></>;
                        return <div className="card-car hoverable" style={{
                            boxShadow: this.state.selected == id ? '0 0 20px rgba(0, 0, 0, 1)' : null
                        }} onClick={e => {
                            e.preventDefault();
                            this.selectCar(id)
                        }}>
                            <div className="card-image">
                                <img src={`https://rp.gta-5.ru/images/cars-more/${item.model}_1.jpg?v=${getRandomInt(1000, 10000)}`} />
                            </div>
                                <span className="card-title">{item.name} <label className="grey-text text-lighten-3">(Слот {item.slot} | {item.plate})</label></span>
                        </div>
                    })}
                </div>
                <div className="col-sm-8">
                    <br />
                    {typeof this.state.selected == "number" ? <>
                    <div className="row">
                            <div className="col-md-3"><button className="btn btn-info btn-lg btn-block" onClick={(e) => this.find()}>Поиск ТС</button></div>
                            <div className="col-md-3"><button className="btn btn-info btn-lg btn-block" onClick={(e) => this.resp()}>Респавн ТС</button></div>
                            <div className="col-md-6"><button className="btn btn-info btn-lg btn-block" onClick={(e) => this.deliver()}>Заказать доставку ТС ${this.numberFormat(this.getSelectedCar().costDeliver)}</button></div>
                    </div>
                        
                        
                        
                        <hr />
                        <table className="table car-info">
                            <tbody>
                                <tr>
                                    <td>Стоимость</td>
                                    <td>${this.numberFormat(this.getSelectedCar().cost)}</td>
                                </tr>
                                <tr>
                                    <td>Бак</td>
                                    <td>{this.numberFormat(this.getSelectedCar().fuelMax)}л.</td>
                                </tr>
                                <tr>
                                    <td>Расход топлива</td>
                                    <td>{this.numberFormat(this.getSelectedCar().fuelPer)}л.</td>
                                </tr>
                                <tr>
                                    <td>Объем багажника</td>
                                    <td>{Math.floor(this.getSelectedCar().cost / 1000)} кг</td>
                                </tr>
                                <tr>
                                    <td>Автопилот</td>
                                    <td>{this.getSelectedCar().autopilot ? 'Да' : 'Нет'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </> : ''}
                </div>
            </div>
        </div>);
    }

}