import React, { Component } from "react";
import Loading from "../Loading";
import { CEF } from "api";

class ChestLog extends Component<any, { name: string, icon:string, list: { who: string, what: string, when: number, take: boolean }[], stage: "all"|"take"|"give" }> {
    ev: RegisterResponse;
    constructor(props: any) {
        super(props);

        this.state = {
            stage: "all",
            list: [
                // { who: "gasgasg", what: "asgasgasggasgasgasggasgasgasggasgasgasggasgasgasggasgasgasggasgasgasggasgasgasggasgasgasggasgasgasgg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
                // {who: "gasgasg", what: "asgasgasg", when: 123123, take: false},
            ],
            name: "",
            icon: "LSPD",
        };

        this.ev = mp.events.register("chest:log", (icon:string, name: string, list: { who: string, what: string, when: number, take: boolean }[]) => {
            this.setState({name, list, icon})
        })

    }
    componentWillUnmount(){
        if(this.ev) this.ev.destroy()
    }

    digitFormat(number: number) {
        return ("0" + number).slice(-2);
    }
    tmToDate(timestamp: number) {
        let dateTime = new Date(timestamp * 1000);
        return `${this.digitFormat(dateTime.getDate())}/${this.digitFormat(dateTime.getMonth() + 1)}/${dateTime.getFullYear()} ${this.digitFormat(dateTime.getHours())}:${this.digitFormat(dateTime.getMinutes())}`
    }
    drawRecord(who:string,what:string,when:number,take?:boolean){
        if(take && this.state.stage == "give") return <></>;
        if(!take && this.state.stage == "take") return <></>;
        return <div className="row" style={{ color: 'white', marginBottom: "5px", paddingBottom: "5px", borderBottom:"1px solid #4e4e4e80"}}>
            <div className="col-sm-2">{who}</div>
            <div className="col-sm-2">{this.tmToDate(when)}</div>
            <div className="col-sm-8">{what}</div>
        </div>
    }


    render() {
        // if(!this.state.name) return <Loading loading="Загрузка данных" />;
        return <div className="chestlog">
                <div className="logo" style={{ backgroundImage: `url("${require(`../../images/fraction_icon/${this.state.icon}.png`)}")` }}></div>
                <div className="name">{this.state.name}</div>
                <div className="desc">Записи склада</div>
                <div className="buttons">
                <div className={`button take ${this.state.stage == "give" ? 'off' : ""}`} onClick={e => {
                    e.preventDefault();
                    if (this.state.stage == "all") this.setState({ stage: "take"})
                    else if (this.state.stage == "give") this.setState({ stage: "all"})
                    else this.setState({ stage: "give" })
                }}>Использование</div>
                <div className={`button give ${this.state.stage == "take" ? 'off' : ""}`} onClick={e => {
                    e.preventDefault();
                    if (this.state.stage == "all") this.setState({ stage: "give" })
                    else if (this.state.stage == "take") this.setState({ stage: "all" })
                    else this.setState({ stage: "take" })
                }}>Пополнение</div>
                </div>
                <div className="logListBlock">
                    {this.state.list.map(item => {
                        return this.drawRecord(item.who, item.what, item.when, item.take)
                    })}
                </div>
                <img src="https://s3-us-west-2.amazonaws.com/figma-alpha-api/img/b7c8/1252/9e442a6cd6c5ba996600991a433ee928" width="859" height="0" className="left top line" id="n3_9" />
                

                <div className="left top text" id="n3_75" onClick={e => {
                    CEF.gui.setGui(null);
                }}>X</div>

        </div>
            ;
    }
}

export default ChestLog;

