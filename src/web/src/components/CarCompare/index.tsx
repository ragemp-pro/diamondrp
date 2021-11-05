import React, { Component } from 'react';

interface CarCompareState {
    time0To100:string;
    time0To200:string;
    vmax:string;
    display: boolean;
}

export default class CarCompare extends Component<any, CarCompareState> {
    constructor(props: any) {
        super(props);
        this.state = {
            time0To100: "",
            time0To200: "",
            vmax: "",
            display: false
        }
        mp.events.register('carCompareShow', (display:boolean) => {
            this.setState({ display})
        })
        mp.events.register('carCompareData', (time0To100: string,time0To200: string,vmax: string) => {
            this.setState({ time0To100, time0To200, vmax})
        })
    }
    render() {
        if(!this.state.display) return <></>;
        return <div className="car-compare-block">
            <table>
                <tr>
                    <td>0-100 km/h:</td>
                    <td><span>{this.state.time0To100}</span> sec</td>
                </tr>
                <tr>
                    <td>0-200 km/h:</td>
                    <td><span>{this.state.time0To200}</span> sec</td>
                </tr>
                <tr>
                    <td>Vmax:</td>
                    <td><span>{this.state.vmax}</span> km/h</td>
                </tr>
            </table>
        </div>;
    }
}
