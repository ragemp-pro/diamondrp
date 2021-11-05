import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import DragDropContainer from '../../api/DragDropContainer';
import DropTarget from '../../api/DropTarget';
import ReactTooltip from 'react-tooltip'
import glasses from './icons/glasses.svg';
import hat from './icons/hat.svg';
import jewelry from './icons/jewelry.svg';
import tie from './icons/tie.svg';
import bulletprof from './icons/bulletprof.svg';
import shirt from './icons/shirt.svg';
import watch from './icons/watch.svg';
import braclet from './icons/braclet.svg';
import bag from './icons/bag.svg';
import handleft from './icons/hand-left.svg';
import jeans from './icons/jeans.svg';
import mask from './icons/mask.svg';
import handright from './icons/hand-right.svg';
import boots from './icons/boots.svg';
import phone from './icons/mobile.svg';
import card from './icons/credit-card.svg';
import tablet from './icons/computer-tablet.svg';
import clock from './icons/clock.svg';
import { CEF } from 'api';
import {
  getItemChoises,
  InventoryDataCef,
  InventoryItemCef,
  convertInventoryItemArrayToObject,
  InventoryItemCefObject,
  convertInventoryItemObjectToArray,
  InventoryEquipList,
  getItemName,
  canEquip,
  getItemWeightInKGById,
  maxAmountTransferItem,
  inventoryTypesUtil,
} from '../../../../util/inventory';
import Loading from '../Loading';
// import { sleep } from '../../../../util/methods';
import InputRange from 'react-input-range';
import { keypressCheck } from '../../api/keypress';
import { iconsItems } from '../../api/inventoryIcon';
interface InventoryMainData extends InventoryEquipList {
  myid: number;
  amountRequest:number;
  equip: InventoryEquipList;
  weapons: InventoryItemCef[];
  blocks: InventoryDataCef[];
  fraction?:number;
}

interface choiseItemData {
  item: InventoryItemCefObject;
  task: string;
  owner_type: number;
  owner_id: number | string;
  target_id?: number | string;
  target_type?: number;
}


const closeIcon = require('./icons/close.svg')

export default class Inventory extends Component<{ test?: boolean }, InventoryMainData> {
  open: boolean;
  waitServer: boolean;
  openInventoryEv: RegisterResponse;
  keyDrag: number;
  keys: any;
  amountRequestStatus: boolean;
  amountRequestEntered: number;
  lastChoise: choiseItemData;
  scrollPos:number
  ifShiftPressed() {
    return keypressCheck.shift();
  }
  constructor(props: any) {
    super(props);
    this.amountRequestStatus = false;
    this.amountRequestEntered = 1;
    
    this.lastChoise = null;
    
    this.scrollPos = 0;
    setInterval(() => {
      if(document.getElementsByClassName('inventory-other').length > 0) this.scrollPos = document.getElementsByClassName('inventory-other')[0].scrollTop
    }, 500)
    this.keyDrag = Math.random();
    this.open = false;
    this.waitServer = false;
    this.openInventoryEv = mp.events.register(
      'inventory:open',
      (
        id: number,
        blocks: InventoryDataCef[],
        equip: InventoryEquipList,
        weapons: InventoryItemCef[],
        fraction?:number
      ) => {
        if (typeof fraction == "number") this.setState({fraction})
        this.openInventory(id, blocks, equip, weapons);
      }
    );

    if (this.props.test) {
      setTimeout(() => {
        this.openInventory(
          100,
          [
            {
              name: 'Петя (10 уровень)',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 277,
                  amount: 1,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 100,
              owner_type: 1,
              weight: 30,
              weight_max: 1500,
            },
            {
              name: 'Склад',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 1223,
              owner_type: 13,
              weight: 16,
              weight_max: 300,
              closed: true,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
            {
              name: 'Предметы на земле',
              desc: '123',
              items: [
                convertInventoryItemObjectToArray({
                  id: 1,
                  item_id: 94,
                  amount: 22,
                  count: 1,
                  number: 0,
                  prefix: 0,
                  key: 0,
                }),
              ],
              owner_id: 0,
              owner_type: 0,
              weight: 16,
              weight_max: 300,
            },
          ],
          {
            phone: true,
            bankcard: true,
            clock: 1,
            bracelet: true,
            watch: true,
            ear: false,
            glasses: true,
            hat: true,
            accessorie: true,
            foot: true,
            leg: true,
            torso: true,
            mask: true,
            tablet: true,
          },
          [
            convertInventoryItemObjectToArray({
              id: 1,
              item_id: 94,
              amount: 22,
              count: 1,
              number: 0,
              prefix: 0,
              key: 0,
            }),
          ]);
      }, 1000);
    }
  }
  openInventory(
    myid: number,
    blocks: InventoryDataCef[],
    equip: InventoryEquipList,
    weapons: InventoryItemCef[]
  ) {
    this.waitServer = true;
    this.open = false;
    this.forceUpdates();
    this.keyDrag = Math.random();
    // blocks.sort((a, b) => {
    //   return b.owner_type - a.owner_type
    // })
    this.setStates({ myid, blocks });
    this.setStates({ equip });
    this.open = true;
    this.waitServer = false;
    this.setStates({ weapons });
  }
  forceUpdates(){
    this.forceUpdate();
    if(document.getElementsByClassName('inventory-other').length > 0) document.getElementsByClassName('inventory-other')[0].scrollTop = this.scrollPos;
  }
  setStates(data:any){
    this.setState(data);
    if(document.getElementsByClassName('inventory-other').length > 0) document.getElementsByClassName('inventory-other')[0].scrollTop = this.scrollPos;    
  }
  getInventoryBlock(ownertype: number, ownerid: number) {
    return this.state.blocks.find(
      (item) => item.owner_id == ownerid && item.owner_type == ownertype
    );
  }
  addEmptyEl(amount: number) {
    let items = [];
    for (let id = 0; id < amount; id++) {
      items.push(
        <div className="inv-item-wrap" key={id}>
          <div className="inv-item"></div>
        </div>
      );
    }
    return items;
  }
  closeInventory() {
    mp.events.triggerServer('inventory:close');
    CEF.gui.setGui(null);
  }

  equipItemRender(el: any, id: number, enabled: boolean, name:string) {
    if (!enabled) return (
      <>
        <div data-tip="React-tooltip" data-for={`happyFaceEquip_${id}`}>
          {el}
        </div>
        <ReactTooltip id={`happyFaceEquip_${id}`} place="top" type="dark" effect="solid" data-delay-show="100">
          <br/>
          <span>{name}</span>
          <br/>
        </ReactTooltip> 
      </>
    );
    return (
      <>
        <ContextMenuTrigger id={`equip_${id}`}>
          <div data-tip="React-tooltip" data-for={`happyFaceEquip_${id}`}>
          <DragDropContainer
            targetKey={'drag' + this.keyDrag}
            onDrop={(e: any) => {
              let target_type:any = 0
              let target_id:any = 0
              let qweqeweqweqw:any = 0
              if(e.dropElem.firstChild.id == "ground"){
                target_type = 0
                target_id == 0
              } else {
                [qweqeweqweqw, target_type, target_id] = e.dropElem.firstChild.id.split('_');
              }
              if(target_type != 1 && target_id != this.state.myid) return;
              if (this.waitServer) return;
                  this.waitServer = true;
                  mp.trigger('client:inv:doItemUnEquip', id);
                  const ids = this.keyDrag;
                  setTimeout(() => {
                    if(ids == this.keyDrag){
                      this.waitServer = false;
                      this.forceUpdates();
                    }
                  }, 2000)
                  this.forceUpdates();
            }}>
            {el}
            </DragDropContainer>
          </div>
        </ContextMenuTrigger>
        <ReactTooltip id={`happyFaceEquip_${id}`} place="top" type="dark" effect="solid" data-delay-show="100">
          <br/>
          <span>{name}</span>
          <br/>
        </ReactTooltip> 
        <ContextMenu className="item-block" id={`equip_${id}`}>
          {enabled ? (
            <>
              <MenuItem
                className="item-block-select"
                key={`equip_${id}_unequip`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (this.waitServer) return;
                  this.waitServer = true;
                  mp.trigger('client:inv:doItemUnEquip', id);
                  const ids = this.keyDrag;
                  setTimeout(() => {
                    if(ids == this.keyDrag){
                      this.waitServer = false;
                      this.forceUpdates();
                    }
                  }, 2000)
                  this.forceUpdates();
                }}
              >
                Снять с экипировки
              </MenuItem>
              {id == 8 ? (
                <MenuItem
                  className="item-block-select"
                  key={`equip_${id}_openphone`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.waitServer) return;
                    this.waitServer = true;
                    mp.trigger('client:inv:openPhone');
                    this.forceUpdates();
                    this.closeInventory();
                  }}
                >
                  Использовать
                </MenuItem>
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}
        </ContextMenu>
      </>
    );
  }

  amountRequest(data: choiseItemData) {
    this.amountRequestStatus = true;
    this.lastChoise = data;
    this.setState({amountRequest:1})
  }

  choiseItem(e: any, data: choiseItemData, amount = 1) {
    if (this.waitServer) return;
    this.waitServer = true;
    let serverChoiseTask = ['equipItemButton', 'drop', 'transfer', 'take'];
    if (serverChoiseTask.indexOf(data.task) > -1)
      mp.events.triggerServer('inventory:choiceItem', data, amount);
    else
      mp.trigger(
        'client:inv:doItem',
        data.task,
        data.owner_id,
        data.owner_type,
        data.item.id,
        data.item.item_id,
        data.item.number,
        data.item.prefix,
        data.item.count,
        data.item.key
      );
      const ids = this.keyDrag;
                  setTimeout(() => {
                    if(ids == this.keyDrag){
                      this.waitServer = false;
                      this.forceUpdates();
                    }
                  }, 2000)
    this.forceUpdates();
  }

  inventoryChildren(items: InventoryItemCef, owner_type: number, owner_id: number | string){
    let item = convertInventoryItemArrayToObject(items);
    return <>
    <div className="inv-item" data-tip="React-tooltip" data-for={`happyFace_${item.id}_${item.item_id}_${owner_type}_${owner_id}`}>
          <img src={iconsItems[item.item_id]} alt="" />
          <span className="inv-size">{owner_type == -1 ? item.count : item.amount}</span>
        </div>
    <ReactTooltip id={`happyFace_${item.id}_${item.item_id}_${owner_type}_${owner_id}`} place="top" type="dark" effect="solid" data-delay-show="100">
      <br/>
    <span>{getItemName(item)} ({getItemWeightInKGById(item.item_id).toFixed(1)}кг)</span>
    <br/>
      </ReactTooltip>  
    
    </>
  }

  inventoryItem(items: InventoryItemCef, owner_type: number, owner_id: number | string) {
    let item = convertInventoryItemArrayToObject(items);
    if(this.waitServer) return <>
    <div key={`item_${owner_type}_${owner_id}_${item.id}_${item.item_id}`}>
        <div className={`inv-item-wrap ${this.waitServer ? 'inventory-item-disabled' : ''}`}>
          {this.inventoryChildren(items, owner_type, owner_id)}
        </div>
    </div>
    </>
    return (
      <div key={`item_${owner_type}_${owner_id}_${item.id}_${item.item_id}`}>
        <div className={`inv-item-wrap ${this.waitServer ? 'inventory-item-disabled' : ''}`}>
          <DragDropContainer
            targetKey={'drag' + this.keyDrag}
            onDrop={(e: any) => {
              if(owner_type == -1) return mp.trigger('client:inv:doItemUnEquip', item.item_id, item.amount, item.count), this.waitServer = true, this.forceUpdates();
              if(e.dropElem.firstChild.id == "equip_block"){
                if(canEquip(item.item_id)){
                  this.choiseItem(e, { item, task:"equipItemButton", owner_type, owner_id, target_type:-1, target_id:-1 });
                }
                return;
              }
              let target_type:any = 0
              let target_id:any = 0
              let qweqeweqweqw:any = 0
              if(e.dropElem.firstChild.id == "ground"){
                target_type = 0
                target_id == 0
              } else {
                [qweqeweqweqw, target_type, target_id] = e.dropElem.firstChild.id.split('_');
              }
              target_type = parseInt(target_type);
              target_id = parseInt(target_id) == target_id ? parseInt(target_id) : target_id;
              if(target_type == -1 || owner_type == -1){
                if(canEquip(item.item_id)){
                  this.choiseItem(e, { item, task:"equipItemButton", owner_type, owner_id, target_type:-1, target_id:-1 });
                }
                return;
              }
              if (target_type == owner_type && owner_id == target_id) return;
              if ((target_type == -1 || owner_type == -1)) return;
              let task = '';
              if (target_type == 0) task = 'drop';
              else if (owner_type == 0) task = 'take';
              else task = 'transfer';
              if (this.ifShiftPressed() && !this.amountRequestStatus && target_type != 0 && !this.state.blocks.find(b => b.owner_id == target_id && b.owner_type == target_type).closed) {
                return this.amountRequest({
                  item,
                  task,
                  owner_type,
                  owner_id,
                  target_type,
                  target_id,
                });
              }
              this.choiseItem(e, { item, task, owner_type, owner_id, target_type, target_id });
            }}
          >
            <ContextMenuTrigger id={`item_${owner_type}_${owner_id}_${item.id}_${item.item_id}`}>
             {this.inventoryChildren(items, owner_type, owner_id)} 
            </ContextMenuTrigger>
          </DragDropContainer>
        </div>
        <ContextMenu
          className="item-block"
          id={`item_${owner_type}_${owner_id}_${item.id}_${item.item_id}`}
        >
          {/* <MenuItem
            className="item-block-select"
            key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_name`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <b>{getItemName(item)}</b>
          </MenuItem> */}
          {owner_type == -1 ? (
            <>
              <MenuItem
                className="item-block-select"
                key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_unquip`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // mp.trigger('client:inv:doGunUnEquip', item.item_id, item.amount, item.count);
                  mp.events.triggerServer('inventory:unEquipGun', item.item_id)
                  this.waitServer = true
                  this.forceUpdates()
                }}
              >
                Снять с экипировки
              </MenuItem>
              <MenuItem
                className="item-block-select"
                key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_unload`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // mp.trigger('client:inv:doGunUnLoad', item.item_id, item.amount, item.count);
                  mp.events.triggerServer('inventory:unEquipGunAmmo', item.item_id)
                }}
              >
                Разрядить оружие
              </MenuItem>
            </>
          ) : (
            <>
              {owner_type == 1 && owner_id == this.state.myid
                ? getItemChoises(item.item_id, item.count, this.state.fraction).map((choice, choiceKey) => {
                    return (
                      <MenuItem
                        className="item-block-select"
                        key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_${choiceKey}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (this.ifShiftPressed() && !this.amountRequestStatus) {
                            return this.amountRequest({
                              item: item,
                              task: choice.task,
                              owner_type: owner_type,
                              owner_id: owner_id,
                            });
                          }
                          this.choiseItem(e, {
                            item: item,
                            task: choice.task,
                            owner_type: owner_type,
                            owner_id: owner_id,
                          });
                        }}
                      >
                        {choice.name}
                      </MenuItem>
                    );
                  })
                : ''}
              {owner_type == 0 ? (
                <MenuItem
                  className="item-block-select"
                  key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_take`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.choiseItem(e, {
                      item: item,
                      task: 'take',
                      owner_type: owner_type,
                      owner_id: owner_id,
                      target_type: 1,
                      target_id: this.state.myid
                    });
                  }}
                >
                  Поднять
                </MenuItem>
              ) : (
                ''
              )}
              {owner_type == 1 ? (
                <MenuItem
                  className="item-block-select"
                  key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_drop`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.choiseItem(e, {
                      item: item,
                      task: 'drop',
                      owner_type: owner_type,
                      owner_id: owner_id,
                    });
                  }}
                >
                  Выкинуть на землю
                </MenuItem>
              ) : (
                ''
              )}
              {owner_type > 0 && owner_id != this.state.myid ? (
                <MenuItem
                  className="item-block-select"
                  key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_drop`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.ifShiftPressed() && !this.amountRequestStatus) {
                      return this.amountRequest({
                        item: item,
                        task: 'take',
                        owner_type: owner_type,
                        owner_id: owner_id,
                        target_type: 1,
                        target_id: this.state.myid,
                      });
                    }
                    this.choiseItem(e, {
                      item: item,
                      task: 'take',
                      owner_type: owner_type,
                      owner_id: owner_id,
                      target_type: 1,
                      target_id: this.state.myid,
                    });
                  }}
                >
                  Взять
                </MenuItem>
              ) : (
                ''
              )}
              {owner_type == 1 && owner_id == this.state.myid
                ? this.state.blocks.map((inv) => {
                    return inv.owner_type > 0 && inv.owner_id != this.state.myid && !inv.closed ? (
                      <MenuItem
                        className="item-block-select"
                        key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_tranfer_${inv.owner_id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (this.ifShiftPressed() && !this.amountRequestStatus) {
                            return this.amountRequest({
                              item: item,
                              task: 'transfer',
                              owner_type: owner_type,
                              owner_id: owner_id,
                              target_id: inv.owner_id,
                              target_type: inv.owner_type,
                            });
                          }
                          this.choiseItem(e, {
                            item: item,
                            task: 'transfer',
                            owner_type: owner_type,
                            owner_id: owner_id,
                            target_id: inv.owner_id,
                            target_type: inv.owner_type,
                          });
                        }}
                      >
                        Положить в {inv.name} {inv.desc}
                      </MenuItem>
                    ) : (
                      (inv.owner_type == 1 && inv.owner_id != this.state.myid && inv.closed) ? <MenuItem
                      className="item-block-select"
                      key={`choice_item_${owner_type}_${owner_id}_${item.id}_${item.item_id}_tranfer_${inv.owner_id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.choiseItem(e, {
                          item: item,
                          task: 'transfer',
                          owner_type: owner_type,
                          owner_id: owner_id,
                          target_id: inv.owner_id,
                          target_type: inv.owner_type,
                        });
                      }}
                    >
                      Передать игроку {inv.desc.indexOf('(') > 1 ? inv.desc.split('(')[0] : inv.desc}
                    </MenuItem> : ""
                    );
                  })
                : ''}
            </>
          )}
        </ContextMenu>
      </div>
    );
  }

  inventoryBlockDataChildren(
    name: string,
    desc: string,
    weight: number,
    weight_max: number,
    owner_type: number,
    owner_id: number | string,
    items: InventoryItemCef[] = [],
    closed: boolean = false
  ) {
    return <div
    className={`inv-items ranec ${
      weight_max > 0 ? 'ranec-scroll-small' : 'ranec-scroll-equip'
    }`}
  >
    {closed ? (
      <></>
    ) : (
      <>
        {items.map((item) => {
          {
            return this.inventoryItem(item, owner_type, owner_id);
          }
        })}
        {weight_max > 0
          ? items.length <= 19
            ? this.addEmptyEl(40 - items.length)
            : this.addEmptyEl(1)
          : this.addEmptyEl(1)}
      </>
    )}
  </div>
  }
  inventoryBlockData(
    name: string,
    desc: string,
    weight: number,
    weight_max: number,
    owner_type: number,
    owner_id: number | string,
    items: InventoryItemCef[] = [],
    closed: boolean = false
  ) {
    return (
      <DropTarget targetKey={'drag' + this.keyDrag} id={`inventory_${owner_type}_${owner_id}`}>
      <div
        className={`darkbox-inv mb10 ${closed ? 'open-protect' : ''}`}
        key={`inventory_${owner_type}_${owner_id}`} id={`inventory_${owner_type}_${owner_id}`}
      >
        <p className="inventory-item-name">{name}</p>
        {desc ? <p className="inventory-item-desc">{desc}</p> : ''}
          {(closed && ((owner_type >= inventoryTypesUtil.UserStock && owner_type <= inventoryTypesUtil.UserStockMax)/* || owner_type == inventoryTypesUtil.StockFraction*/)) ? <><input type="password" className="primary-input input-dialog wide text-center mb20" style={{
          "height": "30px",
          "width": "30%"
        }} id={`keylock_${owner_type}_${owner_id}`} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            let value:any = (document.getElementById(`keylock_${owner_type}_${owner_id}`));
            value = value.value;
            mp.events.triggerServer("player:unlock", owner_type, owner_id, value)
          }
        }}/> <a className="password-chest-button" onClick={() => {
          let value:any = (document.getElementById(`keylock_${owner_type}_${owner_id}`));
          value = value.value;
          mp.events.triggerServer("player:unlock", owner_type, owner_id, value)
        }}>Открыть</a></> : ""}
        {this.inventoryBlockDataChildren(name, desc, weight, weight_max, owner_type, owner_id, items, closed)}
        {!closed && weight_max > 0 ? (
          <div className="weight-wrap weight-wrap-block">
            <p>
              Вес {(weight/1000).toFixed(1)} / {(weight_max/1000).toFixed(1)} кг
            </p>
            <i>
              <span
                className="light-line"
                style={{
                  width: (weight_max >= weight ? (weight / weight_max) * 100 : '100') + '%',
                }}
              />
            </i>
          </div>
        ) : (
          ''
        )}
      </div>
      </DropTarget>
    );
  }
  inventoryBlock(block: InventoryDataCef) {
    return this.inventoryBlockData(
      block.name,
      block.desc,
      block.weight,
      block.weight_max,
      block.owner_type,
      block.owner_id,
      block.items,
      block.closed
    );
  }
  render() {
    if (!this.open) return <Loading loading="Загрузка инвентаря" />;
    return (
      <>
        {this.amountRequestStatus ? (
          <>
            <div className="modal-wrapper">
              <div className="modal-box mini posrev">
                <i
                  className="close"
                  onClick={() => {
                    this.amountRequestStatus = false;
                    this.forceUpdates();
                  }}
                >
                  <img src={closeIcon} alt="" />
                </i>
                <br />
                <InputRange
        maxValue={this.lastChoise.item.amount > maxAmountTransferItem ? maxAmountTransferItem : this.lastChoise.item.amount}
        minValue={1}
        step={1}
        name={"amountRequest"}
        value={this.state.amountRequest}
        formatLabel={value => `${value}шт.`}
        onChange={value => {
          // @ts-ignore
          this.setState({amountRequest:value})
        }} />
        <br />
        <br />
                <button
                  className="primary-button wide"
                  onClick={(e) => {
                    if(!this.state.amountRequest) return;
                    if(isNaN(this.state.amountRequest) || this.state.amountRequest < 1 || this.state.amountRequest > 30) return CEF.alert.setAlert('error', "Количество указанно не верно")
                    this.choiseItem(
                      e,
                      this.lastChoise,
                      this.state.amountRequest
                    );
                    this.amountRequestStatus = false;
                    this.forceUpdates();
                  }}
                >
                  Отправить
                </button>
              </div>
            </div>
          </>
        ) : (
          ''
        )}
        <div className="inventory-block">
          <div className="inventory-stats">
            <DropTarget targetKey={'drag' + this.keyDrag}>
              <div className="darkbox-inv darkboxmiddle" id={`equip_block`}>
                <div className="inv-line-2">
                <p className="inventory-item-name">{this.state.blocks.find(item => item.owner_id == this.state.myid && item.owner_type == 1).desc}</p>
                </div>
                <div className="inv-line-1">
                  {this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${this.state.equip.glasses ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={glasses} alt="" />
                      </div>
                      {!this.state.equip.glasses ? <div className={`inv-item`} /> : ''}
                    </div>,
                    270,
                    this.state.equip.glasses, "Очки"
                  )}
                  {this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${this.state.equip.hat ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={hat} alt="" />
                      </div>
                      {!this.state.equip.hat ? <div className={`inv-item`} /> : ''}
                    </div>,
                    269,
                    this.state.equip.hat, "Головной убор"
                  )}
                  {this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${this.state.equip.ear ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={jewelry} alt="" />
                      </div>
                      {!this.state.equip.ear ? <div className={`inv-item`} /> : ''}
                    </div>,
                    271,
                    this.state.equip.ear, "Уши"
                  )}
                </div>
                <div className="inv-line-2">
                  {this.equipItemRender(
                    <div className="inv-item-wrap biggest">
                      <div
                        className={`${this.state.equip.torso ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={shirt} alt="" />
                      </div>
                      {!this.state.equip.torso ? <div className={`inv-item`} /> : ''}
                    </div>,
                    265,
                    this.state.equip.torso, "Торс"
                  )}
                  <div className="items-2">
                    {this.equipItemRender(
                      <div className="inv-item-wrap">
                        <div
                          className={`${this.state.equip.watch ? `inv-item` : `inv-item-default`} ${
                            this.waitServer ? 'inventory-item-disabled' : ''
                          }`}
                        >
                          <img src={watch} alt="" />
                        </div>
                        {!this.state.equip.watch ? <div className={`inv-item`} /> : ''}
                      </div>,
                      272,
                      this.state.equip.watch, "Часы"
                    )}
                    {this.equipItemRender(
                      <div className="inv-item-wrap">
                        <div
                          className={`${
                            this.state.equip.bracelet ? `inv-item` : `inv-item-default`
                          } ${this.waitServer ? 'inventory-item-disabled' : ''}`}
                        >
                          <img src={braclet} alt="" />
                        </div>
                        {!this.state.equip.bracelet ? <div className={`inv-item`} /> : ''}
                      </div>,
                      273,
                      this.state.equip.bracelet, "Браслет"
                    )}
                  </div>
                </div>
                <div className="inv-line-2">
                  {this.equipItemRender(
                    <div className="inv-item-wrap biggest">
                      <div
                        className={`${this.state.equip.leg ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={jeans} alt="" />
                      </div>
                      {!this.state.equip.leg ? <div className={`inv-item`} /> : ''}
                    </div>,
                    266,
                    this.state.equip.leg, "Ноги"
                  )}
                  <div className="items-2">
                    {this.equipItemRender(
                      <div className="inv-item-wrap">
                        <div
                          className={`${
                            this.state.equip.accessorie ? `inv-item` : `inv-item-default`
                          } ${this.waitServer ? 'inventory-item-disabled' : ''}`}
                        >
                          <img src={tie} alt="" />
                        </div>
                        {!this.state.equip.accessorie ? <div className={`inv-item`} /> : ''}
                      </div>,
                      268,
                      this.state.equip.accessorie, "Аксессуары"
                    )}
                    {this.equipItemRender(
                      <div className="inv-item-wrap">
                        <div
                          className={`${this.state.equip.mask ? `inv-item` : `inv-item-default`} ${
                            this.waitServer ? 'inventory-item-disabled' : ''
                          }`}
                        >
                          <img src={mask} alt="" />
                        </div>
                        {!this.state.equip.mask ? <div className={`inv-item`} /> : ''}
                      </div>,
                      274,
                      this.state.equip.mask, "Маска"
                    )}
                  </div>
                </div>
                <div className="inv-line-4">
                  {this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${this.state.equip.foot ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={boots} alt="" />
                      </div>
                      {!this.state.equip.foot ? <div className={`inv-item`} /> : ''}
                    </div>,
                    267,
                    this.state.equip.foot, "Обувь"
                  )}
                </div>
                <br />
                <div className="inv-line-2">
                  {this.state.equip.phone ? this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${this.state.equip.phone ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={phone} alt="" />
                      </div>
                      {!this.state.equip.phone ? <div className={`inv-item`} /> : ''}
                    </div>,
                    8,
                    this.state.equip.phone, "Телефон"
                  ): ""}
                  {this.state.equip.clock ? this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${this.state.equip.clock ? `inv-item` : `inv-item-default`} ${
                          this.waitServer ? 'inventory-item-disabled' : ''
                        }`}
                      >
                        <img src={clock} alt="" />
                      </div>
                      {!this.state.equip.clock ? <div className={`inv-item`} /> : ''}
                    </div>,
                    7,
                    !!this.state.equip.clock, "Часы"
                  ) : ""}
                  {/* {this.state.equip.bankcard ? this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${
                          this.state.equip.bankcard ? `inv-item` : `inv-item-default`
                        } ${this.waitServer ? 'inventory-item-disabled' : ''}`}
                      >
                        <img src={card} alt="" />
                      </div>
                      {!this.state.equip.bankcard ? <div className={`inv-item`} /> : ''}
                    </div>,
                    50,
                    this.state.equip.bankcard, "Банковская карта"
                  ) : ""} */}
                  {this.state.equip.tablet ? this.equipItemRender(
                    <div className="inv-item-wrap">
                      <div
                        className={`${
                          this.state.equip.tablet ? `inv-item` : `inv-item-default`
                        } ${this.waitServer ? 'inventory-item-disabled' : ''}`}
                      >
                        <img src={tablet} alt="" />
                      </div>
                      {!this.state.equip.tablet ? <div className={`inv-item`} /> : ''}
                    </div>,
                    282,
                    this.state.equip.tablet, "Планшет"
                  ) : ""}
                </div>
                <br />
                {/* <div className="weight-wrap" /> */}
              </div>
            </DropTarget>
          </div>
          <div className="inventory-my">
          <div
        className={`darkbox-inv mb10`}
      >
        <p className="inventory-item-name">Управление</p>
        <p className="inventory-item-desc" onClick={() => {this.closeInventory()}}>ESC - Закрыть</p>
        <p className="inventory-item-desc">SHIFT - Перетащить стак предметов (Удерживать при перетаскивании)</p>
        
      </div>
            {this.inventoryBlockData('Оружие', '', 0, 0, -1, -1, this.state.weapons, false)}
            {this.inventoryBlock(this.state.blocks[0])}
          </div>
          <div className="inventory-other">
            {this.state.blocks.map((block, index) => {
              if (block.owner_type == 1 && block.owner_id == this.state.myid) return '';
              return this.inventoryBlock(block);
            })}
          </div>
        </div>
        <DropTarget targetKey={'drag' + this.keyDrag} id={`ground`}><div className="inventory-ground" id={`ground`}></div></DropTarget>
        
      </>
    );
  }
}
