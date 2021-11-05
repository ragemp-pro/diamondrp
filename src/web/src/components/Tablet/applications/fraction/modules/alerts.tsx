import React, { Component, createRef } from 'react';
import { CEF } from 'api';
export default class Alerts extends Component<{news?:boolean}, {}>{
  text: React.RefObject<HTMLTextAreaElement>;
  title: React.RefObject<HTMLTextAreaElement>;
  constructor(props:any){
    super(props);
    this.title = createRef()
    this.text = createRef()
  }
  send(){
    if(this.text.current.value.length < 2) return CEF.alert.setAlert('error', 'Минимальная длинна сообщения - 2 символа')
    if (this.text.current.value.isNumberOnly()) return CEF.alert.setAlert('error', 'Укажите в сообщении что то помимо цифр')
    if(this.props.news && this.title.current.value.length < 2) return CEF.alert.setAlert('error', 'Необходимо указать заголовок')
    if(this.props.news && this.title.current.value.isNumberOnly()) return CEF.alert.setAlert('error', 'Укажите в заголовке что то помимо цифр')
    if (!this.checkTextLength(this.text.current.value)) return;
    if (this.props.news && !this.checkTextLength(this.title.current.value)) return;
    mp.events.triggerServer('fraction:alert', String(this.text.current.value), this.props.news ? String(this.title.current.value) : "", !!this.props.news)
    if (this.props.news){
      this.title.current.value = "";
    }
    this.text.current.value = "";
  }
  checkTextLength(text: string) {
    let textbl = text.split(' ');
    let fnd = textbl.find(itm => itm.length > 20);
    if (fnd) {
      CEF.alert.setAlert('error', "Не используйте длинные слова в тексте")
      return false;
    }
    return true;
  }
  render() {
    return (
      <div className="notepad-content-flexcent ui-tabs-panel ui-corner-bottom ui-widget-content" aria-labelledby="ui-id-5" role="tabpanel" aria-hidden="false">
      <h2 className="mini-title">{this.props.news ? 'Написать новость для штата' : 'Уведомление для участников'}</h2>
      {this.props.news ? <form action="" className="form-width-400">
        <textarea ref={this.title} cols={30} rows={1} maxLength={50} className="primary-input mb20" placeholder="Заголовок" style={{ height: "10px !important;"}} onKeyDown={(e) => {
            if(e.keyCode == 13) e.preventDefault(), this.send()
          }}></textarea>
      </form>: ""}
      <form action="" className="form-width-400">
          <textarea ref={this.text} cols={30} rows={10} maxLength={200} className="primary-input mb20" placeholder=". . ." onKeyDown={(e) => {
            if(e.keyCode == 13) e.preventDefault(), this.send()
          }}></textarea>
        <div className="button-center">
          <button className="primary-button w100" onClick={(e) => {
            e.preventDefault();
            this.send()
          }}>Отправить</button>
        </div>
      </form>
    </div>
    )
  }
}