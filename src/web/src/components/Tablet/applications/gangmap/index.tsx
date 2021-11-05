import Iframe from 'react-iframe'



import React, { Component, createRef } from 'react';



export default class TabletGangMap extends Component<any, any>{
    constructor(props: any) {
        super(props);
    }
    render() {
        return (<Iframe url={`http://${location.hostname}:3400/web/livemap.html`}
            width="100%"
            height="807px"
            id="myId"
            position="relative" />);
    }

}