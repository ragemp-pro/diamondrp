import React, { Component } from 'react';
import { API, CEF } from 'api';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route } from 'react-router';
import $ from 'jquery';

import Alert from './Alert';
import Login from './Login';
import Chat from './Chat';
import Hud from './Hud';
import Personage from './Personage';
import Azs from './Azs';
import Speedometer from './Speedometer';
import { Gang, Mafia } from './Capture';
import Radio from './Radio';
import Dialog from './Dialog';
import Autosalon from './Autosalon';
import DrivingSchool from './DrivingSchool';
import License from './License';
import Progressbar from './Progressbar';
import Npc from './Npc';
import Quest from './Quest';
import PoliceBage from './PoliceBage';
import Casino from './Casino';
import ChestEquip from './ChestEquip';
import Inventory from './Inventory/index';


import * as guiActions from '../actions/gui';
import * as hudActions from '../actions/hud';
import * as casinoActions from '../actions/casino';
import Tablet from './Tablet';
import { RadioDiamond } from './Tablet/applications/radio';
import CarCompare from './CarCompare';
import GangWar from './GangWar';
import ChestLog from './ChestLog';
import ATM from './ATM';
import Menu from './Menu';
import AutoSale from './Autosale';

interface AppProps {
  gui: {
    showHud: boolean;
    open: string;
    input: boolean;
    speedometer: boolean;
    hud: boolean;
    binder: object;
    cursor: boolean;
    circleCursor: boolean;
    chatActive: boolean;
  };
  logged: boolean;
  hasPhone: boolean; //? check latest
  setGui(gui: string | null): void;
  setCursor(cursor: boolean): void;
  setShowHud(show: boolean): void;
  setInput(input: boolean): void;
  setSpeedometer(speedometer: boolean): void;
  setHud(hud: boolean): void;
  setCircleCursor(cursor: boolean): void;
  setBinder(binder: string): void;

  changeChipsBalance(chips: number): void;

  changeType(type: string): void;
  changeBetValue(bet: number): void;
  updateAdditionalData(additionalData: any): void;
  setAdditionalData(additionalData: any): void;
}

class App extends Component<AppProps, any> {
  constructor(props: AppProps) {
    super(props);

    CEF.speedometer.setSpeedometer = this.props.setSpeedometer;
    CEF.hud.setHud = this.props.setHud;
    CEF.gui.setGui = this.props.setGui;
    CEF.gui.setCursor = this.props.setCursor;
    CEF.hud.showHud = this.props.setShowHud;
    CEF.gui.setInput = this.props.setInput;
    CEF.gui.setCircleCursor = this.props.setCircleCursor;
    CEF.gui.setBinder = this.props.setBinder;

    CEF.casino.show = (type: string, additionalData: any) => {
      this.props.changeType(type);
      this.props.updateAdditionalData(additionalData);

      CEF.gui.setGui('casino');
    };

    CEF.casino.hide = () => {
      this.props.setAdditionalData({});
      this.props.setGui(null);
    };

    CEF.casino.changeBetValue = (value: string) => {
      this.props.changeBetValue(parseInt(value));
    };

    CEF.casino.updateAdditionalData = (additionalData: any) => {
      this.props.updateAdditionalData(additionalData);
    };

    mp.events.register('cef:hud:setChips', (chips: number) => {
      this.props.changeChipsBalance(chips);
    });

    mp.trigger('mainBrowserInited');
  }

  componentDidMount() {
    // $('input').on('focus', () => this.props.setInput(true));
    // $('input').on('blur', () => this.props.setInput(false));
  }
  componentDidUpdate(prevProps: AppProps) {
    // $('input').on('focus', () => this.props.setInput(true));
    // $('input').on('blur', () => this.props.setInput(false));

    if (prevProps.gui.open != this.props.gui.open) {
      if (this.props.gui.open == '/' && this.props.gui.cursor) {
        this.props.setCursor(false);
      } else {
        this.props.setCursor(true);
      }
    }
  }

  render() {
    return (
      <div id="app">
        {this.props.gui.circleCursor ? <div className="cursor focus" /> : <></>}

        <Radio />
        <Alert />

        {this.props.logged ? <Chat /> : <></>}
        {this.props.gui.hud ? <Hud /> : <></>}
        {this.props.gui.hud ? <Speedometer /> : <></>}

        <Progressbar />
        <RadioDiamond />

        <Route path={['/reg', '/login', '/newpass']} component={Login}></Route>
        <Route path="/personage" component={Personage}></Route>
        <Route path="/azs" component={Azs}></Route>
        <Route path="/dialog" component={Dialog}></Route>
        <Route path="/autosalon" component={Autosalon}></Route>
        <Route path="/driving_school" component={DrivingSchool}></Route>
        <Route path="/license" component={License}></Route>
        <Route path="/npc" component={Npc}></Route>
        <Route path="/atm" component={ATM}></Route>
        <Route path="/quests" component={Quest}></Route>
        <Route path="/tablet" component={Tablet}></Route>
        <Route path="/police_bage" component={PoliceBage}></Route>
        <Route path="/chest_equip" component={ChestEquip}></Route>
        <Route path="/casino" component={Casino}></Route>
        <Route path="/inventory" component={Inventory}></Route>
        <Route path="/chestLog" component={ChestLog}></Route>
        <Route path="/autosale" component={AutoSale}></Route>

        <Menu />
        <Mafia />
        <Gang />
        <CarCompare />
        <GangWar />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  gui: state.gui,
  chat: state.gui.chatActive,
  logged: state.login.logged,
  input: state.gui.input,
  binder: state.gui.binder,
  hasPhone: state.phone.hasPhone,
});

const mapDispatchToProps = (dispatch: any) => ({
  ...bindActionCreators(guiActions, dispatch),
  ...bindActionCreators(hudActions, dispatch),
  ...bindActionCreators(casinoActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
