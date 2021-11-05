import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import InputRange from 'react-input-range';
export default class GiveWanted extends Component<{}, { stars: number }>{
  id: React.RefObject<HTMLInputElement>;
  reason: React.RefObject<HTMLTextAreaElement>;
  constructor(props: any) {
    super(props);
    this.id = createRef()
    this.reason = createRef()
    this.state = { stars: 1 }
  }
  send() {
    const id = parseInt(this.id.current.value)
    const level = this.state.stars;
    const reason = this.reason.current.value;

    if (reason.length < 2) return CEF.alert.setAlert('error', 'Минимальная длинна причины - 2 символа')
    if (isNaN(id) || id < 0 || id > 10000000) return CEF.alert.setAlert('error', 'ID Указан не верно')
    mp.events.triggerServer('server:user:giveWanted', id, level, reason)
  }
  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
        <h2 className="mini-title">Объявить гражданина в розыск</h2>
        <div className="notepad-giveWantedBlock">
          <div>
            <input type="text" className="primary-input wide mb10" ref={this.id} placeholder="ID нарушителя" />
          </div>
          <div></div>
          <div>
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
              <button className="btn btn-lg btn-secondary" style={{color:"black"}} onClick={(e) => {
                e.preventDefault();
                if (this.state.stars == 1) this.setState({ stars: 10 })
                else this.setState({ stars: (this.state.stars-1) })
              }}>{`<<`}</button>
              <button className="btn btn-lg btn-secondary active" style={{ color: "black" }}>{this.state.stars} ур.</button>
              <button className="btn btn-lg btn-secondary" style={{ color: "black" }} onClick={(e) => {
                e.preventDefault();
                if (this.state.stars == 10) this.setState({ stars: 1 })
                else this.setState({ stars: (this.state.stars + 1) })
              }}>{`>>`}</button>
            </div>
          </div>
        </div>
        <textarea ref={this.reason} cols={30} rows={10} className="primary-input mb20" placeholder="Укажите причину" onKeyDown={(e) => {
          if (e.keyCode == 13) e.preventDefault();
        }}></textarea>
        <div className="button-center">
          <button className="primary-button w100" onClick={(e) => {
            e.preventDefault();
            this.send()
          }}>Выдать розыск</button>
        </div>
      </div>
    )
  }
}