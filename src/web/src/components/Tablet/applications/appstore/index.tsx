import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import { applicationsList, ApplicationAppStore } from './applications';



export default class TabletAppStore extends Component<{}, {}>{
    constructor(props: any) {
        super(props);
    }

    installApp(item: ApplicationAppStore){

    }

    renderAppItem(item: ApplicationAppStore){
        return <div className="row tablet-application">
            <div className="col-sm-3"><img src={require('../menu/icons/' + item.icon + '.png')} height="90px" width="90px" alt="" /></div>
            <div className="col-sm-7" style={{ marginTop: "-10px" }}>
                <p className="h3">{item.name}</p>
                {item.descShort}
            </div>
            <div className="col-sm-2" style={{ marginTop: "20px" }}>
                {item.installed ? <button disabled={true} className="btn btn-info btn-disabled">Установлено</button> : <button onClick={(e) => {
                    e.preventDefault();
                    this.installApp(item);
                }} className="btn btn-info">{item.cost ? `Купить ($${item.cost})` : `Загрузить`}</button>}
            </div>
        </div>
    }

    render() {
        return (<div className="container">
            <div className="row">
                <div className="col-lg-6">
                    <h2 className="title">Список приложений</h2>
                    {applicationsList.map(item => {
                        return this.renderAppItem(item)
                    })}
                </div>
                <div className="col-lg-1"></div>
                <div className="col-lg-5">
                    <h2>Добро пожаловать в AppStore</h2>
                    Новый дизайн App Store позволит иначе взглянуть на контент разработчиков, которые не перестают воплощать в жизнь самые смелые идеи.
                </div>
            </div>
        </div>);
    }

}