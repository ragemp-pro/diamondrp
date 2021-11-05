import React, { useState, useEffect, Component } from 'react';
import { CEF } from 'api';
import { EquipDataItems, EquipDataItem, getItemChestData } from '../../../../util/equip';
import Loading from '../Loading';


interface EquipDataInterface {
  name:string;
  items: EquipDataItem[];
  ready: boolean;
}

export default class ChestEquip extends Component<any, EquipDataInterface> {
  ev:RegisterResponse;
  q:number;
  constructor(props: any) {
    super(props);
    this.state = {
      name: "Name",
      items: EquipDataItems,
      ready: false
    }
    this.ev = mp.events.register('server:openChest', (name:string,items:{
      model: string;
      amount: number;
      rank: number;
  }[],rank:number) => {
      this.setState({name,items:[],ready:true});
      const newitemlist:EquipDataItem[] = [];
      items.forEach(item => newitemlist.push({...EquipDataItems.find(i => i.model == item.model), count: item.amount, canTake: (item.rank <= rank && item.amount > 0)}))
      this.setState({items:newitemlist})
    })
  }

  componentWillUnmount(){
    this.ev ? this.ev.destroy() : null;
  }

  take(model:string){
    mp.events.triggerServer('server:chest:takeEquip', model);
  }

  close(){
    CEF.gui.setGui(null);
  }

  render(){
    return this.state.ready ?(<>
    <i className="shadow-overlay-top"></i>
    <div className="section-view">
      <div className="police-equip-wrapper">
        <h2 className="page-title">{this.state.name}</h2>
        <div className="police-equip-grid">
          {this.state.items.map((item, id) => {
            const icon = require(`../../icons/${item.icon}.png`);
            return (
              <div className={`eqp-item ${!item.canTake ? 'nohave' : ''}`} key={id}>
                <div onClick={() => (item.canTake ? this.take(item.model) : false)}>
                  <div className="eqp-box">
                    <i className="eqp-item-default">
                      <img src={icon} alt="" />
                    </i>
                    <img src={icon} alt="" />
                    <span>{item.count}</span>
                  </div>
                  <button className="eqp-but">{getItemChestData(item.model).name}</button>
                </div>
              </div>
            );
          })}
        </div>
        <a className="eqp-but-close" onClick={() => this.close()}>Закрыть</a>
      </div>
    </div>
  </>) : (<Loading loading="Загрузка"/>)
  }

};

