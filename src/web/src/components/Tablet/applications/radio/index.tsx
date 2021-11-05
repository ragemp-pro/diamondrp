import Iframe from 'react-iframe'



import React, { Component, createRef } from 'react';
import { CEF } from 'api';
import InputRange from 'react-input-range';
import Loading from '../../../Loading';

let inair = false
let radioVolume = 10;

setTimeout(() => {
    const eventsRadioEnable = mp.events.register("radio:enable", (status:boolean) => {
        inair = status
    })
    const eventsRadioVolume = mp.events.register("radio:volume", (volume:number) => {
        radioVolume = volume
    })
}, 500)

export class RadioDiamond extends Component<{}, { enabled: boolean}>{
    int: number;
    constructor(props: any) {
        super(props);
        this.state = {
            enabled: false
        }
        this.int = setInterval(() => {
            if (!inair && this.state.enabled) return this.setState({ enabled: false})
            if (inair && !this.state.enabled) return this.setState({ enabled: true})
            let q: any = document.getElementById('radioDiamond');
            let element: { volume: number, paused: boolean, play: () => any, pause: () => any } = q
            if (!element) return;
            element.volume = radioVolume/100
            element.play() 
        }, 100)
    } 
    render() {
        if (!this.state.enabled) return <></>;
        return <>
            <audio id="radioDiamond" >
                <source src={'https://radio.drpdev.ru/radio/8000/radio.mp3?1581021131'} type="audio/mpeg"/>
            </audio>
        </>
    }
    componentWillUnmount(){
        let q: any = document.getElementById('radioDiamond');
        let element: { volume: number, paused: boolean, play: () => any, pause: () => any } = q
        if (!element) return;
        element.pause() 
        clearInterval(this.int);
    }

}

interface RadioData {
    is_live:boolean;
    streamer_name:string;
    song: {
        artist:string;
        title:string;
        art:string;
    }
    loaded: boolean;
}

export default class TabletRadio extends Component<{ test?: boolean }, RadioData>{
    int: number;
    constructor(props: any) {
        super(props);
        this.state = {
            is_live: false,
            streamer_name: "",
            song: {
                artist: "",
                title: "",
                art: ""
            },
            loaded: false
        }
        this.int = setInterval(() => {
            this.getRadioData()
        }, 5000)
        this.getRadioData()
    }

    componentWillUnmount(){
        if(this.int) clearInterval(this.int);
    }

    getRadioData(){
        fetch('https://radio.drpdev.ru/api/nowplaying/gta5').then(q => {
            q.json().then(data => {
                let nq = {
                    is_live: data.live.is_live,
                    streamer_name: data.live.streamer_name,
                    song: {
                        artist: data.now_playing.song.artist,
                        title: data.now_playing.song.title,
                        art: data.now_playing.song.art,
                    }
                }
                this.setState({ ...nq, loaded: true})
            })
        })
    }

    render() {
        if(!this.state.loaded) return <Loading loading="Загрузка приложения" />
        return (<div className="container">
            {this.props.test ? <RadioDiamond /> : ''}
            <div className="row">
                <div className="col-lg-4">
                    <img src={this.state.song.art} height="200px" style={{
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginTop: "100px",
                                      }} />
                    {/* <h3 style={{ textAlign: "center" }}>Diamond FM</h3> */}
                    <br/>
                    <div style={{height:"100px"}}>
                        <button  className={`button-radio ${!inair ? '' : 'paused'}`} onClick={(e) => {
                        e.preventDefault();
                        inair = !inair;
                        this.forceUpdate();
                    }}></button>
                    </div>
                    {this.state.is_live ? <h3 style={{ textAlign: 'center' }}>В эфире: {this.state.streamer_name}</h3> : ''}
                    <h3 style={{textAlign: 'center'}}>{this.state.song.artist}</h3>
                    <h4 style={{ textAlign: 'center' }}>{this.state.song.title}</h4>
                    <br/>
                    <style>
                        {`.input-range__label-container {
                            font-size: 20px;
                            top: -15px;
                        }
                        .input-range__label--min, .input-range__label--max {
                            top: 25px;
                        }
                        .input-range__label--min {
                            left: 10px;
                        }
                        .input-range__label--max {
                            right: 10px;
                        }
                        `}
                    </style>
                    <div style={{
                        transform: "scale(1.6, 1.6);",
                        width: "40%;",
                        marginLeft: "30%;",
                        marginTop: "20px;"}}>
                            <InputRange
                                maxValue={100}
                                minValue={0}
                                step={1}
                                value={radioVolume}
                                formatLabel={value => `${value}%`}
                                onChange={value => {
                                    // @ts-ignore
                                    radioVolume = value;
                                    this.forceUpdate();
                                }} />
                        </div>
                </div>
                <div className="col-lg-8">
                    <Iframe url="https://radio.drpdev.ru/public/gta5/embed-requests"
                    width="100%"
                    height="807px"
                    id="myId"
                    position="relative" />
                    </div>
            </div>
        </div>);
    }

}