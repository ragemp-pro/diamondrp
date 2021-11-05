import Iframe from 'react-iframe'



import React, { Component } from 'react';
import { mafiaCarsConf, MafiaCar } from '../../../../../../util/mafiaData';
import { iconsItems } from '../../../../api/inventoryIcon';
import { getItemNameById } from '../../../../../../util/inventory';
import { fractionUtil } from '../../../../../../util/fractions';
import { gangDeliverCost, gangDeliverReward } from '../../../../../../util/gang.deliver';

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

export default class TabletGangDeliver extends Component<{ test?: boolean, fractionid:number }, TabletCarsState>{
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
                Перевозка фургона
            </div>
            <div className="row">
                <div className="col-md-6">
                    Через данное приложение вы можете брать заказы по доставке различных фургонов. Задача простая - добратся до фургона и доставить его, не попадаясь на глаза легавым. Перед доставкой с вас возьмут залог в размере ${this.numberFormat(gangDeliverCost)}, а после доставки вы получите ${this.numberFormat(gangDeliverReward)}. Время на доставку не ограничено, главное его довезите в целости и сохранности.
                </div>
                <div className="col-md-6">
                    <button className="btn btn-success btn-block btn-lg" onClick={(e) => {
                        e.preventDefault()
                        mp.events.triggerServer('tablet:gangcar:order')
                    }}>Взять заказ для доставки</button>
                </div>
                
            </div>
        </div>);
    }

}