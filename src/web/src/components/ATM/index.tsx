import React, { useEffect, Component } from 'react';
import { CEF } from 'api';

interface ATMstate {
    cash: number;
    bank: number;
    bank_number: string;
    nalog: { type: string, sum: number, tax:number }[];
    page: string;
    loading:boolean;
    getCashSum:string;
    putCashSum: string;
    transferPrefix: number;
    transferNumber: number;
    transferSum: number;
}

export default class ATM extends Component<{ test?: boolean }, ATMstate>{
    cashTemplate: number[];
    ev: RegisterResponse;
    constructor(props: any) {
        super(props);
        this.state = {
            transferPrefix: 0,
            transferNumber: 0,
            transferSum: 0,
            cash: 1000,
            bank: 1000,
            bank_number: "1231-12312323",
            nalog: [],
            page: "main",
            loading: true,
            getCashSum: "0",
            putCashSum: "0",
        }
        this.cashTemplate = [100, 1000, 5000, 10000, 25000, 50000];

        this.ev = mp.events.register('atm:data', (data => {
            this.setState({
                ...data, loading: false
            })
        }))

        if(this.props.test){
            setTimeout(() => {
                this.setState({
                    loading: false
                })
            }, 200)
        }
    }
    getNalogSum() {
        let sum = 0;
        this.state.nalog.map(itm => {
            sum += itm.sum
        })
        return sum;
    }
    setPage(name:string){
        this.setState({page:name});
    }
    numberFormat(currentMoney: number) {
        return currentMoney.toString().replace(/.+?(?=\D|$)/, function (f) {
            return f.replace(/(\d)(?=(?:\d\d\d)+$)/g, '$1,');
        });
    }
    getCash(){
        mp.events.triggerServer('atm:getCash', this.state.getCashSum)
    }
    putCash(){
        mp.events.triggerServer('atm:putCash', this.state.putCashSum)
    }
    render() {
        return <>
            <div className="b3-close" onClick={e => {
                CEF.gui.setGui(null);
            }}>X</div>
            <div className={`b1-logo ${this.state.loading ? 'logoLoading' : ''}`} id="logo">
                <div className="logo">
                    <img src={require('./fleeca.png')} height="100vh" />
                </div>
            </div>
            <div className="b1-money">
                <div>
                    <div className="b1-summ">${this.numberFormat(this.state.cash)}</div>
                    <div className="b1-summ-info">Наличные</div>
                </div>
                <div>
                    <div className="b1-summ">${this.numberFormat(this.state.bank)}</div>
                    <div className="b1-summ-info">Сумма на счету</div>
                </div>
                <div>
                    <div className="b1-summ">{this.state.bank_number}</div>
                    <div className="b1-summ-info">Номер карты</div>
                </div>
                {/* <div>
                    <div className="b1-summ">${this.numberFormat(this.getNalogSum())}</div>
                    <div className="b1-summ-info">Налоговый сбор</div>
                </div> */}
            </div>
            {this.state.page == "main" ? <div className="b2-buttons">
                <div className="b2-item" onClick={e => { mp.trigger('transferMoney')}}>Перевод средств</div>
                <div className="b2-item" onClick={e => { this.setPage('getCash')}}>Снять средства</div>
                <div className="b2-item" onClick={e => { this.setPage('putCash') }}>Пополнить баланс</div>
                {/* <div className="b2-item" onClick={e => { this.setPage('nalog') }}>Оплатить налоговые сборы</div> */}
            </div> : <></>}
            {/* {this.state.page == "transfer" ? <div className="b3">
                <div className="b3-close" onClick={e => { this.setPage('main') }}>X</div>
                <div className="b3-vars" style={{color:"white"}}>
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="col-lg-6">Перефикс</div>
                            <div className="col-lg-6"><input className="form-control" value={this.state.transferPrefix} onChange={e => {
                                let sm = parseInt(e.currentTarget.value);
                                if (isNaN(sm) || sm < 0 || sm > 999999999) sm = 0
                                this.setState({ transferPrefix: sm })
                            }} type="text" /></div>
                        </div>
                        <div className="col-lg-4">
                            <div className="col-lg-6">Номер</div>
                            <div className="col-lg-6"><input className="form-control" value={this.state.transferNumber} onChange={e => {
                                let sm = parseInt(e.currentTarget.value);
                                if (isNaN(sm) || sm < 0 || sm > 999999999) sm = 0
                                this.setState({ transferNumber: sm })
                            }} type="text" /></div>
                        </div>
                        <div className="col-lg-6">
                            <input className="form-control" value={this.state.transferPrefix} onChange={e => {
                                let sm = parseInt(e.currentTarget.value);
                                if (isNaN(sm) || sm < 0 || sm > 999999999) sm = 0
                                this.setState({ transferPrefix: sm })
                            }} type="text" />
                        </div>
                        <div className="col-lg-6">sdgsdg</div>
                    </div>

                </div>
            </div> : <></>} */}
            {this.state.page == "getCash" ? <div className="b3">
                <div className="b3-close" onClick={e => { this.setPage('main') }}>X</div>
                <div className="b3-vars">
                    {this.cashTemplate.map(sum => {
                        return <div className="b2-item b3-item" onClick={e => {
                            let sm = parseInt(this.state.getCashSum);
                            this.setState({ getCashSum: (sm + sum).toString() })
                        }}>{sum}</div>
                    })}

                    <div className="b2-item b3-item-input"><input className="submit-cash" value={this.state.getCashSum} onChange={e => {
                        let sm = parseInt(e.currentTarget.value);
                        if (isNaN(sm) || sm < 0 || sm > 999999999) sm = 0
                        this.setState({ getCashSum: (sm).toString()})
                    }} type="text" /></div>
                    <div className="b2-item b3-item-done" onClick={e => { this.getCash()}}>Снять</div>
                </div>
            </div> : <></>}
            {this.state.page == "putCash" ? <div className="b3">
                <div className="b3-close" onClick={e => { this.setPage('main') }}>X</div>
                <div className="b3-vars">
                    {this.cashTemplate.map(sum => {
                        return <div className="b2-item b3-item" onClick={e => {
                            let sm = parseInt(this.state.putCashSum);
                            this.setState({ putCashSum: (sm+sum).toString() })
                        }}>{sum}</div>
                    })}
                    <div className="b2-item b3-item-input"><input className="submit-cash" type="text" value={this.state.putCashSum} onChange={e => {
                        let sm = parseInt(e.currentTarget.value);
                        if (isNaN(sm) || sm < 0 || sm > 999999999) sm = 0
                        this.setState({ putCashSum: (sm).toString() })
                    }} /></div>
                    <div className="b2-item b3-item-done" onClick={e => { this.putCash() }}>Пополнить</div>
                </div>
            </div> : <></>}
            {this.state.page == "nalog" ? <div className="b3 b3-fine">
                <div className="b3-close" onClick={e => { this.setPage('main') }}>X</div>
                <div className="fine">
                    {this.state.nalog.map(item => {
                        return <div className="fine-item" onClick={e => {
                            mp.events.triggerServer('atm:nalog', item.type, item.tax);
                        }}>
                            <span className="fine-item_price">${this.numberFormat(item.sum)}</span>
                            <div>{item.type}</div>
                            <div>Счёт: {item.tax}</div>
                        </div>
                    })}
                </div>
            </div> : <></>}


        </>
    }
}