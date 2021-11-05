import React, { Component } from 'react';
import { iconsItems } from '../../api/inventoryIcon';
import { getRandomInt } from '../../../../util/methods';
import { fractionUtil } from '../../../../util/fractions';

interface GangWarStateData {
    killfeed?: { id?: number; killer: string, gun: string, who: string, attack: boolean, targetattack: boolean}[];
    attackScore: number;
    protectScore: number;
    attackName: string;
    protectName: string;
    attackColor: string;
    protectColor: string;
    timer:number;
    enabled:boolean;
    attacks?:number;
    owners?:number;
}

let q = 0;

export default class GangWar extends Component<{ test?: boolean }, GangWarStateData> {
    intTest: number;
    constructor(props: any) {
        super(props);
        mp.events.register('gangWarEnd', () => {
            this.setState({
                killfeed: [],
                attackScore: 0,
                protectScore: 0,
                attackName: "",
                protectName: "",
                attackColor: "",
                protectColor: "",
                timer: 0,
                enabled: false,
                attacks: null,
                owners: null,
            });
        })
        mp.events.register('gangWarDataSend', (attackScore: number, protectScore:number, attackid:number, ownerid:number, timer:number, attacks: number, owners: number) => {
            this.setState({
                killfeed: this.state.enabled ? [] : this.state.killfeed,attackScore, protectScore, timer:timer*60,
                attackName: fractionUtil.getFractionName(attackid),
                protectName: fractionUtil.getFractionName(ownerid),
                attackColor: fractionUtil.getFractionColor(attackid),
                protectColor: fractionUtil.getFractionColor(ownerid),
                enabled: true,
                attacks, owners,
            })
        })
        mp.events.register('gangWarKill', (kill: { id?: number; killer: string, gun: string, who: string, attack: boolean, targetattack: boolean }, attackScore: number, protectScore: number, attacks: number, owners: number) => {
            this.newKillFeed(kill.killer, kill.gun, kill.who, kill.attack, kill.targetattack)
            this.setState({ attackScore, protectScore})
            if (typeof attacks === "number" && typeof owners === "number") this.setState({ attacks, owners });
        })
        this.state = {
            killfeed: [],
            attackScore: 0,
            protectScore: 0,
            attackName: "",
            protectName: "",
            attackColor: "",
            protectColor: "",
            timer: 0,
            enabled: false
        }
        if(this.props.test){
            setTimeout(() => {
                let attackid = 18;
                let ownerid = 20;
                this.setState({
                    killfeed: [],
                    attackScore: 0,
                    protectScore: 0,
                    attackName: fractionUtil.getFractionName(attackid),
                    protectName: fractionUtil.getFractionName(ownerid),
                    attackColor: fractionUtil.getFractionColor(attackid),
                    protectColor: fractionUtil.getFractionColor(ownerid),
                    timer: 30,
                    enabled: true, attacks: 10, owners: 20
                })
            }, 1000)
            this.intTest = setInterval(() => {
                const attack = getRandomInt(1, 2) == 2;
                this.newKillFeed("Killer Tester", "Пушка какая то", "Protecter Tester", attack)
                if (attack) this.setState({attackScore: this.state.attackScore + 1})
                else this.setState({ protectScore: this.state.protectScore + 1 })
            }, 1000)
        }
        setInterval(() => {
            if(!this.state.enabled) return;
            if(this.state.timer > 0){
                this.setState({ timer: this.state.timer-1})
            }
        }, 1000)
    }
    componentWillUnmount(){
        if(this.intTest) clearInterval(this.intTest)
    }
    newKillFeed(killer: string, gun: string, who: string, attack = false, targetattack = false){
        let newArr = [...this.state.killfeed];
        newArr.unshift({ id: q, killer: `${killer}`, who, gun, attack, targetattack });
        if (newArr.length > 10) newArr.pop();
        this.setState({ killfeed: newArr })
        q++;
    }
    setTimer(timer:number){
        this.setState({timer})
    }
    toHHMMSS(secs:number) {
        // @ts-ignore
        let sec_num = parseInt(secs, 10)
        let hours = Math.floor(sec_num / 3600)
        let minutes = Math.floor(sec_num / 60) % 60
        let seconds = sec_num % 60

        return [hours, minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }
    calculateAttackWidth(){
        if (this.state.attackScore + this.state.protectScore == 0) return 50
        return (this.state.attackScore / (this.state.attackScore + this.state.protectScore) * 100)
    }
    calculateProtectWidth(){
        return 100 - this.calculateAttackWidth();
    }
    render() {
        if(!this.state.enabled) return <></>;
        return <React.Fragment><div className="capture_score">
                <div className="smart_box">
                <div className="smart_box_cl" style={{ left: `calc(${this.calculateAttackWidth()}% - ${7.17}%)` }}>
                        <div className="style_smart_txt">{this.state.attackScore}</div>
                        <div className="smart-l-center">
                            <div className="smart-trngl"></div>
                        </div>
                        <div className="style_smart_txt">{this.state.protectScore}</div>
                    </div>
                </div>
                <div className="capture_linear">
                <div className="linear" style={{ background: this.state.attackColor, boxShadow: this.state.attackColor, width: this.calculateAttackWidth()+ '%' }}></div>
                    <div className="center_linear"></div>
                <div className="linear " style={{ background: this.state.protectColor, boxShadow: this.state.protectColor, width: this.calculateProtectWidth() + '%' }}></div>
                </div>
                <div className="capture_info">
                    <div className="capture_one_clan">{this.state.attackName} {typeof this.state.attacks === "number" ? `(${this.state.attacks})` : ``}</div>
                    <div className="capture_time">{this.toHHMMSS(this.state.timer)}</div>
                    <div className="capture_one_clan">{this.state.protectName} {typeof this.state.owners === "number" ? `(${this.state.owners})` : ``}</div>
                </div>
            </div>
            <div className="capture_died">
                {this.state.killfeed.map((item, index) => {
                    return <div key={item.id} id={item.id.toString()} className="capture_box_player">
                        <div style={{ color: item.attack ? this.state.attackColor : this.state.protectColor }} className="cap-left">{item.killer}</div>
                        <div className="cap-center"></div>
                        <div style={{ color: item.targetattack ? this.state.attackColor : this.state.protectColor }} className="cap-right">{item.who}</div>
                        <div style={{ background: item.attack ? this.state.attackColor : this.state.protectColor, boxShadow: item.attack ? this.state.attackColor : this.state.protectColor }} className="capture-box-linear"></div>
                    </div>
                })}
                {/* <div className="capture_box_player">
                    <div className="cap-left txt-vagos">Serg Ramos</div>
                    <div className="cap-center"></div>
                    <div className="cap-right txt-mara">Tony Barrera</div>
                    <div className="capture-box-linear linear-vagos"></div>
                </div>
                <div className="capture_box_player">
                    <div className="cap-left txt-groove">Serg Ramos</div>
                    <div className="cap-center"></div>
                    <div className="cap-right txt-mara">Tony Barrera</div>
                    <div className="capture-box-linear linear-groove"></div>
                </div>
                <div className="capture_box_player">
                    <div className="cap-left txt-mara">Serg Ramos</div>
                    <div className="cap-center"></div>
                    <div className="cap-right txt-groove">Tony Barrera</div>
                    <div className="capture-box-linear linear-mara"></div>
                </div>
                <div className="capture_box_player">
                    <div className="cap-left txt-ballas">Serg Ramos</div>
                    <div className="cap-center"></div>
                    <div className="cap-right txt-groove ">Tony Barrera</div>
                    <div className="capture-box-linear linear-ballas"></div>
                </div>
                <div className="capture_box_player">
                    <div className="cap-left txt-mara">Serg Ramos</div>
                    <div className="cap-center"></div>
                    <div className="cap-right txt-groove ">Tony Barrera</div>
                    <div className="capture-box-linear linear-mara"></div>
                </div> */}
            </div></React.Fragment>
        
        
        
        
        // <div className="gangwarblock">
        //     <div className="killfeed">
        //         {this.state.killfeed.map((item, index) => {
        //             return <div key={item.id} id={item.id.toString()} className={`${index > 6 ? '' : ''}`}>
        //                 <div style={{ color: item.attack ? this.state.attackColor : this.state.protectColor }}>{item.killer}</div>
        //                 <div>{item.gun}</div>
        //                 <div style={{ color: !item.attack ? this.state.attackColor : this.state.protectColor }}>{item.who}</div>
        //             </div>
        //         })}
        //     </div>
        //     <div className="progresss">
        //         <div className="text">
        //             <span className="left">{this.state.attackName} ({this.state.attackScore})</span>
        //             <span className={`center`}>{this.toHHMMSS(this.state.timer)}</span>
        //             <span className="right">{this.state.protectName} ({this.state.protectScore})</span>
        //         </div>
        //         <div className="line" style={{ gridTemplateColumns: `${this.state.attackScore}fr ${this.state.protectScore}fr`}}>
        //             <span className="attack" style={{ backgroundColor: this.state.attackColor}}></span>
        //             <span className="protect" style={{ backgroundColor: this.state.protectColor }}></span>
        //         </div>
        //         <div className="help" style={{ gridTemplateColumns: `${this.state.attackScore}fr ${this.state.protectScore}fr`}}>
        //             <span></span>
        //             <span className="helpBlock">JOPA</span>
        //         </div>
        //     </div>
        // </div>;
    }
}
