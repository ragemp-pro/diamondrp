import React, { Component, createRef } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { CEF } from 'api';
import QuickJobUser from './quickJobUser';
export interface userData {
  id:number;
  rank:number;
  rp_name:string;
  last_login?:number;
  tag?:string;
  is_online?:number;
}
export default class Users extends Component<{ users: userData[], canJob?: boolean, ranks: string[], gos: boolean }, { editID: number, blackList?: boolean; unAccept?: boolean; search:string}>{
  constructor(props:any){
    super(props);
    this.state = {
      editID: 0,
      search: ""
    }
  }
  digitFormat(number:number) {
    return ("0" + number).slice(-2);
  }
  tmToDate(timestamp:number){
    let dateTime = new Date(timestamp * 1000);
        return `${this.digitFormat(dateTime.getDate())}/${this.digitFormat(dateTime.getMonth()+1)}/${dateTime.getFullYear()} ${this.digitFormat(dateTime.getHours())}:${this.digitFormat(dateTime.getMinutes())}`
  }
  getUser(){
    return this.props.users.find(user => user.id == this.state.editID)
  }
  setRank(rank:number){
    if(this.getUser().rank != rank){
      mp.events.triggerServer('fraction:setRank', this.state.editID, rank)
    } else {
      CEF.alert.setAlert('error', "У участника уже данный ранг")
    }
  }
  unInvite(blacklist:boolean){
    // @ts-ignore
    let value = blacklist ? document.getElementById('blackList_reason').value : ''
    if (blacklist && value.length < 5) return CEF.alert.setAlert('error', 'Необходимо указать причину занесения в чёрный список')
    mp.events.triggerServer('fraction:uninvite', this.state.editID, blacklist, value)
  }
  editUser(){
    return <>
    <div className="notepad-user-edit-header">
      <button style={{right:"15px",top:"15px",position:"relative",width:"300px"}}className="btn btn-info btn-lg"onClick={(e) => {
              e.preventDefault();
              this.setState({editID:0})
        }}>Назад</button>
    </div>
    <div className='notepad-user-edit'>
    <div>
    <h2>Ранг</h2>
    <div className="notepad-sidebar">
    <ul role="tablist" className="ui-tabs-nav ui-corner-all ui-helper-reset ui-helper-clearfix ui-widget-header">
            {this.props.ranks.map((rank, rankid) => {
              // if(!this.state.accessPage.includes(item.block)) return;
              return (<li className={`ui-tabs-tab ui-corner-top ui-state-default ui-tab ${this.getUser().rank == rankid + 1 ? 'active ui-tabs-active ui-state-active' : ''}`} role="tab"  aria-controls="notepad1" aria-labelledby="ui-id-1" aria-selected="false" aria-expanded="false"><a href="#notepad1" role="presentation"  className="ui-tabs-anchor"onClick={(e) => {
              e.preventDefault();
              this.setRank(rankid+1)
            }}>{rank}</a></li>)
            })}
					</ul>
    </div>
    </div>
    <div className="choise">
    <h2>Действия</h2>
    <div>
            <button className="btn btn-info btn-block btn-lg" onClick={(e) => {
              e.preventDefault();
              // this.unInvite(false)
              this.setState({ unAccept: !this.state.unAccept, blackList: false})
            }}>Уволить</button><br/>
            {this.props.gos ? <button className="btn btn-danger btn-block btn-lg" onClick={(e) => {
              e.preventDefault();
              this.setState({ unAccept: false, blackList:!this.state.blackList})
            }}>Уволить занеся в ЧС</button> : ''}  
            {this.state.blackList ? <div className="row"><hr/>
              <h2>Уволить сотрудника с занесением в ЧС?</h2>
              <div className="col-md-8"><input className="form-control" id="blackList_reason" /></div>
              <div className="col-md-4"><button className="btn btn-danger btn-block" onClick={(e) => {
                e.preventDefault();
                this.unInvite(true)
              }}>Подтвердить</button>  </div>
              
            </div> : ''}
            {this.state.unAccept ? <><hr/>
            <h2>Уволить сотрудника?</h2>
            <button className="btn btn-danger btn-block btn-lg" onClick={(e) => {
                e.preventDefault();
                this.unInvite(false)
              }}>Подтвердить</button></> : ''}
             
    </div>
    </div>
    </div>
    </>
  }
  render() {
    if(this.state.editID){
      return this.editUser();
    }
    return (
      <>
        {this.props.canJob ? <><QuickJobUser desc="Принять во фракцию" event="server:user:inviteFraction" button="Отправить приглашение" /></> : ""}
    <div className="notepad-content-easy ui-tabs-panel ui-corner-bottom ui-widget-content">
          <h2 className="mini-title">Список участников ({this.props.users.filter(user => user.is_online).length} / {this.props.users.length})</h2>
          <div className="row">
            <div className="col-sm-8"><input className="form-control" placeholder="Поиск участника" defaultValue={this.state.search} onChange={e => {
              this.setState({search: e.currentTarget.value})
            }} /></div>
          </div>
          <div className="users-list-notepad" style={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "325px"
          }}>
    <div className="users-list-notepad-title">
        <span>ID</span>
        <span>Ранг</span>
        <span>Имя</span>
        <span>Статус</span>
        {this.props.canJob ? <span>Действие</span> : ''}
      </div>
    {this.props.users.map(user => {
      if(this.state.search){
        let str = this.state.search.toLowerCase();
        let ok = false;
        let searchId = parseInt(str)
        if (!isNaN(searchId) && searchId === user.id) ok = true;
        if (user.rp_name.toLowerCase().includes(str)) ok = true;
        if(!ok) return <></>;
      }
      return (
      <div>
        <span>#{user.id}</span>
        <span>{this.props.ranks[user.rank-1]}</span>
          <span>{user.rp_name} {user.tag ? (user.tag.length > 9 ? `\n[${user.tag}]` : `[${user.tag}]`) : ''}</span>
        <span style={{
          color: !user.is_online ? 'red' : 'green',
        }}>{!user.is_online ? this.tmToDate(user.last_login) : "В сети"}</span>
        {this.props.canJob ? <span onClick={(e) => {e.preventDefault();this.setState({editID:user.id,blackList:false})}}><a href="#">Управление</a></span> : ''}
      </div>
      )
    })}
    </div>
    </div>
    </>
    )
  }
}