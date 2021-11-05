import React, { Component } from 'react';
import { GangTerData, attackMinRank } from '../../../../../../declaration/gangwar';
import { fractionUtil } from '../../../../../../util/fractions';
import { CEF } from 'api';
import Loading from '../../../Loading';


interface TabletGangTerControlState {
    selected?: number;
    items: GangTerData[];
    loaded: boolean;
    subleader: boolean;
    leader: boolean;
    fraction: number;
    icon: string;
    name: string;
    farmNow: number;
    rank: number;
}



export default class TabletGangTerControl extends Component<{ test?: boolean }, TabletGangTerControlState>{
    ev: RegisterResponse;
    fraction: any;
    constructor(props: any) {
        super(props);
        this.fraction = fractionUtil
        this.state = {
            items: [],
            loaded: false,
            subleader: false,
            leader: false,
            fraction: 20,
            name: "Mara",
            icon: fractionUtil.getFractionIcon(20),
            farmNow: 1000,
            rank:0
        }
        this.ev = mp.events.register('tablet:gangter:data', (items: GangTerData[], subleader: boolean, leader: boolean, fraction: number, farmNow: number, rank:number) => {
            this.setState({ items, farmNow, loaded: true, selected: null, subleader, leader, fraction, icon: fractionUtil.getFractionIcon(fraction), name: fractionUtil.getFractionName(fraction), rank: rank ? rank : 0 })
        })
        mp.events.triggerServer('tablet:gangter:data:load')

        if (this.props.test) {
            setTimeout(() => {
                this.setState({
                    loaded: true, leader: true, items: [
                        { id: 1, name: "Test", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "aTest2", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "aTest2", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "aTest2", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "aTest2", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "aTest2", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "aTest2", attack: false, resp: false, ownerid: 10, ownername: "TestGroup" },
                        { id: 1, name: "fTest3", attack: false, resp: false, ownerid: 20, ownername: "TestGroup" },
                    ]
                })
            }, 100)
        }

    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy()
    }
    selectTer(id: number) {
        if (this.state.selected === id) this.setState({ selected: null })
        else this.setState({ selected: id })
    }
    getSelectedTer() {
        return this.state.items[this.state.selected]
    }

    numberFormat(currentMoney: number) {
        if (typeof currentMoney != "number") return currentMoney;
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }
    getFractionIcon(ownerid:number){
        return require(`../../../../images/fraction_icon/${this.fraction.getFractionIcon(ownerid)}.png`)
    }
    getFractionName(ownerid:number):string{
        return this.fraction.getFractionName(ownerid)
    }

    render() {
        if (!this.state.loaded) return (<><Loading loading="Загрузка данных" /></>);
        return (<div className="frame" id="n1_6">
            <div className="group" id="n5_2">
                <div className="frame" id="n1_65">
                    <div className="left top rectangle" id="n1_11" style={{ backgroundImage: `url("${require(`../../../../images/fraction_icon/${this.state.icon}.png`)}")` }}></div>
                    <div className="left top text" id="n1_12">{this.state.name}</div>
                    <div className="left top text" id="n1_13">Управление территориями</div>
                </div>
                {/*<!-- Левый блок -->*/}
                <div className="frame" id="n1_66">
                    {/*<!-- Rectangle 1 -->*/}
                    <div className="left top rectangle" id="n1_14"></div>
                    {/*<!-- iconfinder_money_299107 1 -->*/}
                    <div className="left top rectangle" id="n1_18"></div>
                    {/*<!-- 2 -->*/}
                    <div className="left top text" id="n1_17">{this.state.items.filter(item => item.ownerid == this.state.fraction).length}</div>
                    {/*<!-- iconfinder_map_285662 1 -->*/}
                    <div className="left top rectangle" id="n1_15"></div>
                    {/*<!-- Количество -->*/}
                    <div className="left top text" id="n1_16">Количество</div>
                    {/*<!-- $20 -->*/}
                    <div className="left top text" id="n1_19">${this.numberFormat(this.state.farmNow)}</div>
                    {/*<!-- Доход в общак -->*/}
                    <div className="left top text" id="n1_20">Доход в общак</div>
                    {/*<!-- Список -->*/}
                    <div className="left top text" id="n1_21">Список</div>
                    {/*<!-- Список территорий -->*/}
                    <div className="frame" id="n1_31">
                        {/*<!-- Элемент списка территорий -->*/}
                        {this.state.items.length == 0 ? <div className="alert alert-light">Пусто</div> : this.state.items.map((item, index) => {
                            return <div className="" key={index} id="n1_27">
                                <div className="" id="n1_30"><img src={this.getFractionIcon(item.ownerid)} />{item.name}</div>
                                <div id="n1_28" onClick={e => {
                                    e.preventDefault();
                                    this.selectTer(index)
                                }}>
                                    Выбрать
                                </div>

                            </div>
                        })}
                    </div>
                </div>
                {this.getSelectedTer() ? <div className="frame" id="n1_67">
                    <div className="left top text" id="n1_68">Территория:</div>
                    <div className="left top text" id="n1_70">{this.getSelectedTer().name}</div>
                    <div className="left top text" id="n1_69">Владелец:</div>
                    <div className="left top text" id="n1_71">{this.getFractionName(this.getSelectedTer().ownerid)}</div>
                    <div className="frame" id="n1_74">
                        <div className="left top rectangle" id="n1_72" onClick={(e) => {
                            mp.events.triggerServer('tablet:gangter:pos', this.getSelectedTer().id)
                        }}>GPS Навигация</div>

                    </div>
                    {this.state.leader || (this.state.rank >= attackMinRank && this.getSelectedTer().ownerid != this.state.fraction) ? <div className="frame" id="n1_75">
                        <div className="left top rectangle" id="n1_76" onClick={(e) => {
                            CEF.gui.setGui(null)
                            if (this.getSelectedTer().ownerid == this.state.fraction) {
                                mp.events.triggerServer('tablet:gangter:sell', this.getSelectedTer().id)
                            } else {
                                mp.events.triggerServer('tablet:gangter:attack', this.getSelectedTer().id)
                            }

                        }}>{this.getSelectedTer().ownerid == this.state.fraction ? "Продать территорию" : "Атаковать"}</div>

                    </div> : ''}

                </div> : ''}

            </div>
        </div>);
    }

}