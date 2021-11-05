import React, { Component, createRef } from 'react';
import { CEF } from 'api';
export default class QuickJobUser extends Component<{desc:string,event:string,button?:string}, {}>{
  id: React.RefObject<HTMLInputElement>;
  constructor(props:any){
    super(props);
    this.id = createRef()
  }
  send(){
    const id = parseInt(this.id.current.value)
    if(isNaN(id) || id < 0 || id > 10000000) return CEF.alert.setAlert('error', 'ID Указан не верно')
    mp.events.triggerServer(this.props.event, id)
  }
  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
  <h2 className="mini-title">{this.props.desc}</h2>
      <div className="notepad-giveWantedBlock">
        <div>
          <input type="text" className="primary-input wide mb10" ref={this.id} placeholder="ID игрока"/>
        </div>
        <div></div>
        <div>
        <button className="primary-button w100" onClick={(e) => {
            e.preventDefault();
            this.send()
        }}>{this.props.button || 'Отправить'}</button>
        </div>
      </div>
    </div>
    )
  }
}