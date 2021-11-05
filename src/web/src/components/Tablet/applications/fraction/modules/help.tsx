import React, { Component, createRef } from 'react';
export default class HelpMe extends Component<{ tracking: boolean }, { list: [string, number, boolean][] }>{
  id: React.RefObject<HTMLInputElement>;
  reason: React.RefObject<HTMLTextAreaElement>;
  ev: RegisterResponse;
  constructor(props: any) {
    super(props);
    this.state = {list: []}
    this.ev = mp.events.register('tablet:gpshelp:list', (list:[string,number,boolean][]) => {
      this.setState({list});
    })
    mp.events.triggerServer('tablet:gpshelp:list:load')
  }
  send() {
    mp.events.triggerServer('tablet:gos:tracking')
  }
  track(id:number) {
    mp.events.triggerServer('tablet:gos:trackingid', id)
  }
  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
        <h2 className="mini-title">Включение отслеживания</h2>
        <h3>При включении ваша геолокация будет транслироватся остальным членам организации</h3>
        <div className="button-center">
          {this.props.tracking ? <button className="btn btn-danger btn-lg btn-block" onClick={(e) => {
            e.preventDefault();
            this.send()
          }}>Выключить</button> : <button className="btn btn-success btn-lg btn-block" onClick={(e) => {
            e.preventDefault();
            this.send()
          }}>Включить</button>}
        </div>
        <br/>
        {this.state.list.map(item => {
          return <div className="row">
            <div className="col-sm-8">{item[0]}</div>
            <div className="col-sm-4"><button className="btn btn-info btn-lg btn-block" onClick={(e) => {
              e.preventDefault();
              this.track(item[1])
            }}>{item[2] ? 'Выключить' : 'Включить'}</button></div>
          </div>
        })}
      </div>
    )
  }
}