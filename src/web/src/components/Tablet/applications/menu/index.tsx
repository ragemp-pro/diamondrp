import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import { applicationsList } from '../appstore/applications';


export default class TabletMenu extends Component<{ test?: boolean, fraction: string, fractionid: number, icon:string, handle: (page:string) => void }, {}>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (<>
            <div className="tablet-menu">
                {this.props.icon && this.props.fraction ? <div onClick={(e) => {
                    e.preventDefault();
                    this.props.handle('fraction')
                }} className="tablet-menu-item"><img src={require('../../../../images/fraction_icon/' + this.props.icon + '.png')} alt="" /><p>{this.props.fraction}</p></div> : ''}
                {applicationsList.map((item, id) => {
                    if (!item.installed) return;
                    if (!this.props.test && item.fractions && (!this.props.fractionid || !item.fractions.includes(this.props.fractionid))) return;
                    return <div key={`app_${id}`} onClick={(e) => {
                        e.preventDefault();
                        this.props.handle(item.page)
                    }} className="tablet-menu-item"><img src={require('./icons/' + item.icon + '.png')} alt="" /><p>{item.name}</p></div>
                })}

                <div onClick={(e) => {
                    e.preventDefault();
                    CEF.gui.setGui(null)
                }} className="tablet-menu-item"><img src={require('./icons/poweroff.png')} alt="" /><p>Выключить</p></div>
            </div>
        </>);
    }

}