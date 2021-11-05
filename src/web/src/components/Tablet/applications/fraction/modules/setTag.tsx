import React, { Component, createRef } from 'react';
import { CEF } from 'api';
export default class SetTag extends Component<{tag:string}, {}>{
  id: React.RefObject<HTMLInputElement>;
  constructor(props:any){
    super(props);
    this.id = createRef()
    // this.id.current.value = this.props.tag;
  }
  send(){
    mp.trigger('setTag', this.id.current.value)
  }
  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
      <h2 className="mini-title">Установите ТЕГ</h2>
      <div className="notepad-giveWantedBlock">
        <div>
          <input type="text" className="primary-input wide mb10" ref={this.id} maxLength={20} placeholder="Введите тег" defaultValue={this.props.tag}/>
        </div>
        <div></div>
        <div>
        <button className="primary-button w100" onClick={(e) => {
            e.preventDefault();
            this.send()
        }}>{'Установить'}</button>
        </div>
      </div>
    </div>
    )
  }
}