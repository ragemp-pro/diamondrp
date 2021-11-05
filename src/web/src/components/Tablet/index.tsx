import React, { Component } from 'react';

import batteryIcon from '../../images/battery-icon.png'
import wifiIcon from '../../images/wifi.png'
import TabletMenu from './applications/menu';
import Loading from '../Loading';
import TabletFraction from './applications/fraction';
import TabletGov from './applications/gov';
import TabletAppStore from './applications/appstore';
import TabletRadio from './applications/radio';
import TabletCars from './applications/cars';
import TabletBrowser from './applications/browser';
import TabletChest from './applications/chest';
import TabletHouse from './applications/house';
import { CEF } from 'api';
import TabletAppart from './applications/appartement';
import TabletCondo from './applications/condo';
import TabletMafiaCars from './applications/mafiacar';
import TabletMafiaTer from './applications/mafiater';
import TabletGangMap from './applications/gangmap';
import TabletGangTerControl from './applications/gangcontrol';
import TabletGangDeliver from './applications/gangdeliver';


export default class Tablet extends Component<{ test?: boolean }, { fractionid:number, time:string, current: string, start: boolean, fraction: string, iconfraction:string}>{
  ev: RegisterResponse;
  ev2: RegisterResponse;
  constructor(props:any){
    super(props);
    this.state = { fractionid: 0, time: '00:00', current: 'menu', start: false, fraction: "", iconfraction: "" };
    if (this.props.test) this.state = { fractionid: 8, time: '00:00', current: 'menu', start: true, fraction: "LSPD", iconfraction: "LSPD" };
    this.ev = mp.events.register('tablet:data', (fraction: string, iconfraction:string, fractionid:number) => {
      this.setState({ fraction, iconfraction, start: true, fractionid})
    })
    this.ev2 = mp.events.register('setTimeTablet', time => {
      this.setState({time})
    })
  }

  componentWillUnmount(){
    if (this.ev) this.ev.destroy()
    if (this.ev2) this.ev2.destroy()
  }

  openPage(num:string){
    this.setState({current:num});
  }
  


  render() {
    if (!this.state.start) return <Loading />;
    return (<>
    <div className="section-view">
      <div className="notepad-wrapper">
        <div className="tablet-homeButton" onClick={(e) => {
          e.preventDefault();
          this.openPage('menu')
        }}></div>
        <div className="notepad-window ui-tabs ui-corner-all ui-widget ui-widget-content" id="notepad_container">
          <div className="notepad-header">
            <div className="notepad-bar">
              <div className="notepad-bar-left">iPad <img src={wifiIcon} /></div>
                <div className="notepad-bar-center">{this.state.time}</div>
              <div className="notepad-bar-right">
                <div></div>
                <div>100%</div>
                <div><img src={batteryIcon} /></div>
              </div>
            </div>
          </div>
            <div className="notepad-content">
              {this.state.current == "menu" ? <TabletMenu test={this.props.test} fraction={this.state.fraction} fractionid={this.state.fractionid} icon={this.state.iconfraction} handle={this.openPage.bind(this)} /> : ''}
              {this.state.current == "fraction" ? <TabletFraction test={this.props.test} /> : ''}
              {this.state.current == "government" ? <TabletGov test={this.props.test} /> : ''}
              {this.state.current == "appstore" ? <TabletAppStore /> : ''}
              {this.state.current == "radio" ? <TabletRadio test={this.props.test} /> : ''}
              {this.state.current == "cars" ? <TabletCars test={this.props.test} /> : ''}
              {this.state.current == "browser" ? <TabletBrowser test={this.props.test} /> : ''}
              {this.state.current == "chest" ? <TabletChest test={this.props.test} /> : ''}
              {this.state.current == "house" ? <TabletHouse test={this.props.test} /> : ''}
              {this.state.current == "appart" ? <TabletAppart test={this.props.test} /> : ''}
              {this.state.current == "condo" ? <TabletCondo test={this.props.test} /> : ''}
              {this.state.current == "mafiacar" ? <TabletMafiaCars test={this.props.test} fractionid={this.state.fractionid} /> : ''}
              {this.state.current == "gangdeliver" ? <TabletGangDeliver test={this.props.test} fractionid={this.state.fractionid} /> : ''}
              {this.state.current == "mafiater" ? <TabletMafiaTer test={this.props.test} /> : ''}
              {this.state.current == "gangmap" ? <TabletGangMap test={this.props.test} /> : ''}
              {this.state.current == "gangcontrol" ? <TabletGangTerControl test={this.props.test} /> : ''}
            </div>
        </div>
      </div>
		</div>
    </>);
  }

}