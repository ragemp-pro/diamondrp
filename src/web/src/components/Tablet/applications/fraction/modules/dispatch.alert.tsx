import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { CEF } from 'api';

interface codeItem {
  title:string;
  desc:string;
  number:number;
}
let localCodes:string[] = [
  "Необходима немедленная поддержка",
  "Офицер в бедственном положении",
  "Приоритетный вызов (без сирен/со стобоскопами)",
  "Срочный вызов (сирены, стробоскопы)",
  "Помощь не требуется. Все спокойно",
  "Задерживаюсь на месте",
  "Перерыв на обед",
]

let localCodes2:string[] = [
  "Необходима немедленная поддержка",
  "Офицер в бедственном положении",
  "Приоритетный вызов (без сирен/со стобоскопами)",
  "Срочный вызов (сирены, стробоскопы)",
  "Помощь не требуется. Все спокойно",
  "Задерживаюсь на месте",
  "Перерыв на обед",
]
export default class DispatchAlert extends Component<{}, {}>{
  constructor(props:any){
    super(props);

  }

  render() {
    return (
      <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
    <div className="code-list-notepad">
    {localCodes.map((desc, code) => {
      return (
      <div>
        <span>Код {code}</span>
        <span>{desc}</span>
        <span onClick={(e) => {mp.events.triggerServer('dispatch:sendcode', true, code, desc)}}><a href="#">Local</a></span>
        <span onClick={(e) => {mp.events.triggerServer('dispatch:sendcode', false, code, desc)}}><a href="#">Departament</a></span>
      </div>
      )
    })}
    </div>
    </div>

    )
  }
}