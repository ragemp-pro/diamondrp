import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import Loading from '../../../Loading';
import DOMPurify from 'dompurify'
interface GovData {
    block?:string;
    money: number;
    cofferMoneyBomj: number;
    cofferNalogBizz: number;
    cofferMoneyOld: number;
    cofferNalog: number;
    canEdit: boolean;
    loaded: boolean;
    donators: [string, number][];
    news: { title: string, text: string, author: string, time: string }[]
}

function b64DecodeUnicode(str:string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

export default class TabletGov extends Component<{ test?: boolean }, GovData>{
    ev: RegisterResponse;
    sum: React.RefObject<HTMLInputElement>;
    constructor(props: any) {
        super(props);
        this.ev = mp.events.register("tablet:gov:data", (
            money: number, 
            cofferMoneyBomj: number, 
            cofferNalogBizz: number, 
            cofferMoneyOld: number, 
            cofferNalog: number, 
            canEdit: boolean, 
            donators: [string, number][], 
            news: {
                title: string;
                text: string;
                author: string;
                time: string;
            }[]
            ) => {
            this.setState({ 
                money, 
                cofferMoneyBomj, 
                cofferNalogBizz, 
                cofferMoneyOld, 
                donators, 
                cofferNalog, 
                canEdit, 
                news, 
                loaded: true 
            })
        })
        this.sum = createRef()
        if (this.props.test) {
            this.state = {
                news: [], donators: [], money: 1000000, cofferMoneyBomj: 10, cofferNalogBizz: 10, cofferMoneyOld: 10, cofferNalog: 10, canEdit: true, loaded: true
            }
            for (let q = 0; q < 15; q++) this.state.donators.push(["UserName_" + q, (q + 1) * 10000])
        } else {
            this.state = { news: [], donators: [], money: 0, cofferMoneyBomj: 0, cofferNalogBizz: 0, cofferMoneyOld: 0, cofferNalog: 0, canEdit: false, loaded: false }
        }
        
        
    }
    componentDidMount(){
        mp.events.triggerServer('tablet:gov:load')
    }
    componentWillUnmount() {
        if (this.ev) this.ev.destroy();
    }

    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }

    setParam(type:string){
        const param = parseInt(this.sum.current.value)
        if (isNaN(param) || param < 0) return CEF.alert.setAlert('error', "Параметр указан не корректно");
        mp.events.triggerServer('tablet:gov:setParam', type, param)
    }

    putMoney(){
        const sum = parseInt(this.sum.current.value)
        if(isNaN(sum) || sum < 0) return CEF.alert.setAlert('error', "Сумма указана не корректно");
        mp.events.triggerServer('tablet:gov:putMoney', sum)
    }

    takeMoney() {
        const sum = parseInt(this.sum.current.value)
        if (isNaN(sum) || sum < 0) return CEF.alert.setAlert('error', "Сумма указана не корректно");
        mp.events.triggerServer('tablet:gov:takeMoney', sum)
    }

    render() {
        if (!this.state.loaded) return <Loading loading="Загрузка приложения" />;
        return (<>
            <div className="row">
                <div className="content">
                    <div className="col-sm-8 title-gov"><img src={require('../menu/icons/government.png')} alt="" /> Правительство штата</div>
                </div>
            </div>
            <br />
            <div className="row">
                <div className="content" style={{ marginLeft: "20px" }}>
                    <div className="col-md-3"><div className="nalog-item">Налоговая ставка <p>{this.state.cofferNalog}%</p></div></div>
                    <div className="col-md-3"><div className="nalog-item">Ставка на бизнесы <p>{this.state.cofferNalogBizz}%</p></div></div>
                    <div className="col-md-3"><div className="nalog-item">Пособие <p>${this.numberFormat(this.state.cofferMoneyBomj)}</p></div></div>
                    <div className="col-md-3"><div className="nalog-item">Пенсия <p>${this.numberFormat(this.state.cofferMoneyOld)}</p></div></div>
                </div>
            </div>
            <br />
            <div className="row">
                {/* <div className="content"> */}
                <div className="col-xs-5">
                    <div className="tablet-gov1in2 tablet-gov1in22">
                        <h2>Бюджет штата</h2>
                        <div className="tablet-gov-money">${this.numberFormat(this.state.money)}</div>
                        {this.state.canEdit ? <>
                        <br/>
                        <button className="btn btn-success btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'put') this.setState({ block: null })
                            else this.setState({ block: 'put' })
                        }}>Положить в казну</button>
                        <button className="btn btn-danger btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'take') this.setState({ block: null })
                            else this.setState({ block: 'take' })
                        }}>Снять с казны</button>
                        </>: ''}
                    </div>
                    <div className="tablet-gov1in2 tablet-gov1in22">
                        <h2>Топ 15 пожертвований</h2>
                        <br />
                        {this.state.donators.sort((a, b) => {
                            return b[1] - a[1]
                        }).map((item, id) => {
                            return <div className="row gov-donator">
                                <div className="col-sm-2">#{(id + 1)}</div>
                                <div className="col-sm-5">{item[0]}</div>
                                <div className="col-sm-5"><span>${this.numberFormat(item[1])}</span></div>
                            </div>
                        })}
                    </div>
                </div>
                <div className="col-xs-7">
                    {this.state.canEdit ? <><div className="tablet-gov1in2">
                        <h2>Управление</h2>
                        <br />
                        <button className="btn btn-warning btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'nalog') this.setState({ block: null })
                            else this.setState({ block: 'nalog' })
                        }}>Сменить налоговую ставку</button>
                        <button className="btn btn-warning btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'biz') this.setState({ block: null })
                            else this.setState({ block: 'biz' })
                        }}>Сменить налоговую ставку на бизнесы</button>
                        <button className="btn btn-info btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'bomj') this.setState({ block: null })
                            else this.setState({ block: 'bomj' })
                        }}>Сменить сумму пособия по безработице</button>
                        <button className="btn btn-info btn-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.block == 'old') this.setState({ block: null })
                            else this.setState({ block: 'old' })
                        }}>Сменить сумму пенсионных выплат</button>
                        {this.state.block == 'nalog' ? <>
                            <h3>Сменить налоговую ставку</h3>
                            <input type="text" defaultValue={this.state.cofferNalog.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Введите сумму"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('nalog')
                            }}>Выполнить</button>
                        </> : ''}
                        {this.state.block == 'biz' ? <>
                            <h3>Сменить налоговую ставку на бизнесы</h3>
                            <input type="text" defaultValue={this.state.cofferNalogBizz.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Введите сумму"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('biz')
                            }}>Выполнить</button>
                        </> : ''}
                        {this.state.block == 'bomj' ? <>
                            <h3>Сменить сумму пособия по безработице</h3>
                            <input type="text" defaultValue={this.state.cofferMoneyBomj.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Введите сумму"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('bomj')
                            }}>Выполнить</button>
                        </> : ''}
                        {this.state.block == 'old' ? <>
                            <h3>Сменить сумму пенсионных выплат</h3>
                            <input type="text" defaultValue={this.state.cofferMoneyOld.toString()} ref={this.sum} className="primary-input wide mb10" placeholder="Введите сумму"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.setParam('old')
                            }}>Выполнить</button>
                        </> : ''}
                        {this.state.block == 'take' ? <>
                        <h3>Снять с казны</h3>
                            <input type="text" ref={this.sum} className="primary-input wide mb10" placeholder="Введите сумму"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.takeMoney()
                            }}>Выполнить</button>
                        </> : ''}
                        {this.state.block == 'put' ? <>
                        <h3>Положить в казну</h3>
                            <input type="text" ref={this.sum} className="primary-input wide mb10" placeholder="Введите сумму"/>
                            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
                                e.preventDefault();
                                this.putMoney()
                            }}>Выполнить</button>
                        </> : ''}
                    </div><br /></> : ''}
                    
                    <div className="tablet-gov1in2">
                        <h2>Новости правительства</h2>
                        <br />
                        {this.state.news.map(item => {
                            return <div className="gov-new-item">
                                <div className="row">
                                        <div className="title">{item.title}</div>
                                        <div><span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(b64DecodeUnicode(item.text).replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;quot;/gi, '"')) }} /></div>
                                </div>

                                <p>Автор: {item.author}</p>
                                <small>(( Дата: {item.time} ))</small>
                            </div>
                        })}
                    </div>
                </div>

                {/* </div> */}
            </div>
            <br />
        </>);
    }

}