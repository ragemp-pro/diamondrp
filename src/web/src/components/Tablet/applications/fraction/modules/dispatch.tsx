import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { CEF } from 'api';
export interface dispatchItem {
  id:number;
  title:string;
  desc:string;
  withCoord?:boolean;
  posX?:number;
  posY?:number;
  when:number;
  accept?:string;
  dist?:number;
}

let dispatchStreetNames:{[id:number]:string} = {}

export default class Dispatch extends Component<{ items: dispatchItem[] }, { items: dispatchItem[]}>{
  ev: RegisterResponse;
  constructor(props:any){
    super(props);
    this.state = {
      items: []
    }
    this.setState({...this.props})
    this.ev = mp.events.register('updateStreet', (id:number,street:string) => {
      dispatchStreetNames[id] = street;
      this.forceUpdate();
    })
    
  }
  componentWillUnmount(){
    if(this.ev) this.ev.destroy()
  }
  componentDidMount(){
    if (this.props && this.props.items)
      mp.trigger('getStreetFromCoord', JSON.stringify(this.props.items))
  }
  digitFormat(number:number) {
    return ("0" + number).slice(-2);
  }
  tmToDate(timestamp:number){
    let dateTime = new Date(timestamp * 1000);
        return `${this.digitFormat(dateTime.getDate())}/${this.digitFormat(dateTime.getMonth()+1)}/${dateTime.getFullYear()} ${this.digitFormat(dateTime.getHours())}:${this.digitFormat(dateTime.getMinutes())}`
  }
  render() {
    return (
    <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
    <div className="calls-list-notepad">
          {(typeof this.props.items == "object" && this.props.items.length > 0) ? this.props.items.sort((a,b) => {
      return b.id - a.id
    }).map(item => {
      return (
        <div>
          <p><span>#{item.id}</span> {item.title} {item.dist ? `(${Math.floor(item.dist)}m.)` : ``} {dispatchStreetNames[item.id] ? `<${dispatchStreetNames[item.id]}>` : ''} ({this.tmToDate(item.when)}) {item.accept ? `[Принял: ${item.accept}]` : ''}</p>
          <p className="call-text" dangerouslySetInnerHTML={{ __html: item.desc }}></p>
        {item.withCoord ? <a href="#" onClick={(e) => {
            e.preventDefault();
            mp.events.triggerServer('dispatch:gopos', item.id, item.posX, item.posY)
        }}>Принять вызов</a> : ''}
      </div>
      )
    }) : <div>
              <p className="call-text">Список пуст</p>
            </div>}
    </div>
    </div>
    )
  }
}