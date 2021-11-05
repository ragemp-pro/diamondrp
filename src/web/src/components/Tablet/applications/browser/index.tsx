import Iframe from 'react-iframe'



import React, { Component, createRef } from 'react';
import { CEF } from 'api';


export default class TabletBrowser extends Component<{ test?: boolean }, {}>{
    constructor(props: any) {
        super(props);
    }

    render() {
        return (<div className="">
            <Iframe url="https://rp.gta-5.ru/browser"
                width="100%"
                height="807px"
                id="myId"
                position="relative" />
        </div>);
    }

}