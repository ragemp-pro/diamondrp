import Iframe from 'react-iframe'



import React, { Component } from 'react';
import { mafiaCarsConf, MafiaCar } from '../../../../../../util/mafiaData';
import { iconsItems } from '../../../../api/inventoryIcon';
import { getItemNameById } from '../../../../../../util/inventory';
import { fractionUtil } from '../../../../../../util/fractions';

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
    selected?: number;
    gang?:boolean;
    mafia?:boolean;
}

export default class TabletMafiaCars extends Component<{ test?: boolean, fractionid:number }, TabletCarsState>{
    constructor(props: any) {
        super(props);
        let fractiondata = fractionUtil.getFraction(this.props.fractionid)
        this.state = {
            mafia: !!fractiondata.mafia, gang: !!fractiondata.gang
        }
    }
    selectCar(id: number) {
        if (this.state.selected === id) this.setState({ selected: null })
        else this.setState({ selected: id })
    }
    getSelectedCar(){
        return mafiaCarsConf[this.state.selected]
    }
    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    render() {
        return (<div className="container chest-block">
            <div className="row title-gov chest-title">
                Заказ фургона
            </div>
            <div className="row">
                <div className="col-lg-4 cars-list" style={{ height: "720px"}}>
                    {mafiaCarsConf.map((item: MafiaCar, id) => {
                        if(item.type != "all"){
                            if(item.type == "gang" && !this.state.gang) return '';
                            if(item.type == "mafia" && !this.state.mafia) return '';
                        }
                        return <div className="card-car hoverable" style={{
                            boxShadow: this.state.selected == id ? '0 0 20px rgba(0, 0, 0, 1)' : null
                        }} onClick={e => {
                            e.preventDefault();
                            this.selectCar(id)
                        }}>
                            <div className="card-image">
                                <img src={`https://rp.gta-5.ru/images/cars-more/${item.model}_1.jpg`} />
                            </div>
                                <span className="card-title">Фургон с {item.name} <label className="grey-text text-lighten-3">(${item.cost})</label></span>
                        </div>
                    })}
                </div>
                <div className="col-lg-8">
                    <br />
                    {typeof this.state.selected == "number" ? <>
                    <div className="content">
                        <h2 style={{textAlign: "center"}}>Содержимое</h2><br/>
                            {this.getSelectedCar().items.map(([itemid,amount]) => {
                                return <div className="row" style={{ fontSize: "20px", marginBottom: "10px", height: "60px"}}>
                                    <div className="col-lg-4" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}><img src={iconsItems[parseInt(itemid)]} /></div>
                                    <div className="col-lg-6" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>{getItemNameById(parseInt(itemid))}</div>
                                    <div className="col-lg-2" style={{ fontSize: "20px", marginBottom: "10px", height: "60px" }}>x{amount}</div>
                                </div>
                            })}
                            <button className="btn btn-success btn-lg btn-block" onClick={(e) => {
                                mp.events.triggerServer('tablet:mafiacars:order', this.state.selected)
                            }}>Заказать (${this.getSelectedCar().cost})</button>
                    </div>
                        
                        
                        
                        <hr />
                        {/* <table className="table car-info">
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
                        </table> */}
                    </> : <h2 style={{ textAlign: "center" }}>Выберите фургон</h2>}
                </div>
            </div>
        </div>);
    }

}