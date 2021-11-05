import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { CEF } from 'api';
import { recLists } from '../../../../../../../util/fractions';


export const canGiveDoc = (fraction: number, rank: number) => {
  return !!recLists.find(item => item.fractions.includes(fraction) && item.rank <= rank && item.give)
}
export const canRemoveDoc = (fraction: number, rank: number) => {
  return !!recLists.find(item => item.fractions.includes(fraction) && item.rank <= rank && item.remove)
}


export default class GiveRec extends Component<{ fraction:number, rank:number, remove:boolean}, {current:number}>{
  id: React.RefObject<HTMLInputElement>;
  constructor(props:any){
    super(props);
    this.id = createRef()
    this.state = {current:-1}
  }

  send(){
    const id = parseInt(this.id.current.value)
    if(isNaN(id) || id < 0 || id > 10000000) return CEF.alert.setAlert('error', 'ID Указан не верно')
    if (!recLists[this.state.current]) return CEF.alert.setAlert('error', 'Вы не выбрали тип')
    mp.events.triggerServer('tablet:license', id, !(!!this.props.remove), this.state.current)
  }
  
  render() {
    const rank = this.props.rank
    const fraction = this.props.fraction
    const remove = !!this.props.remove
    const give = !remove
    return (
      <>
      <div className='notepad-user-edit'>
      <div>
      <h2>{give ? 'Выдача' : 'Изъятие'}</h2>
      <div className="notepad-sidebar">
      <ul role="tablist" className="ui-tabs-nav ui-corner-all ui-helper-reset ui-helper-clearfix ui-widget-header">
                {recLists.map((item, recid) => {
                  if (!item.fractions.includes(fraction)) return;
                  if (item.rank > rank) return;
                  if (item.give && !give) return;
                  if (item.remove && !remove) return;
                  return (<li className={`ui-tabs-tab ui-corner-top ui-state-default ui-tab ${this.state.current == recid ? 'active ui-tabs-active ui-state-active' : ''}`} role="tab" aria-controls="notepad1" aria-labelledby="ui-id-1" aria-selected="false" aria-expanded="false"><a className="ui-tabs-anchor" onClick={(e) => {
                    e.preventDefault();
                    this.setState({ current: recid })
                  }}>{item.name}</a></li>)
                })}
              </ul>
      </div>
      </div>
      <div className="choise">
      <h2>Кому</h2>
      <div>
        <div>
          <input type="text" className="primary-input wide mb10" ref={this.id} placeholder="ID игрока"/>
        </div>
        <div>
        <button className="primary-button w100" onClick={(e) => {
            e.preventDefault();
            this.send()
        }}>Отправить</button>
        </div>
      </div>
      </div>
      </div>
      </>
    )
  }
}