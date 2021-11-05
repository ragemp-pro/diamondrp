import { Component } from "react";
import React from "react";
import { user } from "../api/data";
import { Auth } from "./Auth";


import { Main } from "./Main";


export class App extends Component<any, any> {
    constructor(props: any) {
        super(props);
        document.title = "Загрузка"
        
    }
    componentDidMount() {
        user.putMainComponent(this)
        user.init();
    }
    componentWillMount(){
    }
    render(){
        if (user.path == "/auth") return <Auth/>
        if (user.path == "/main") return <Main/>
        return <>Loading application</>
    }
}